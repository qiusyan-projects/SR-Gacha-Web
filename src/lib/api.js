// External API calls

import { BANNER_DOWNLOAD_URL } from './constants'

export async function checkAndUpdatePool() {
  try {
    const resp = await fetch(BANNER_DOWNLOAD_URL)
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
    const yamlText = await resp.text()

    // Parse YAML with js-yaml (loaded via CDN in index.html)
    let data
    if (typeof jsyaml !== 'undefined') {
      data = jsyaml.load(yamlText)
    } else {
      // Try to load js-yaml dynamically
      await new Promise((resolve, reject) => {
        const s = document.createElement('script')
        s.src = 'https://cdn.jsdelivr.net/npm/js-yaml@4.1.0/dist/js-yaml.min.js'
        s.onload = resolve
        s.onerror = reject
        document.head.appendChild(s)
      })
      data = jsyaml.load(yamlText)
    }

    // Resolve @common_pools references
    resolveRefs(data, data)
    return { status: 'updated', message: '卡池文件已更新到最新版本。', data }
  } catch (e) {
    return { status: 'error', message: `检查更新时发生错误: ${e.message}` }
  }
}

function resolveRefs(obj, root) {
  if (Array.isArray(obj)) return obj.map(item => resolveRefs(item, root))
  if (obj && typeof obj === 'object') {
    const result = {}
    for (const [k, v] of Object.entries(obj)) result[k] = resolveRefs(v, root)
    return result
  }
  if (typeof obj === 'string' && obj.startsWith('@')) {
    const path = obj.slice(1).split('.')
    let current = root
    for (const part of path) {
      if (current && typeof current === 'object') current = current[part]
      else return obj
    }
    return current
  }
  return obj
}
