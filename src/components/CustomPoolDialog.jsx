import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { BANNER_DOWNLOAD_URL } from '@/lib/constants'

// 示例片段：从 banners.yml 截取一个限时卡池条目的结构
const EXAMPLE = `# 卡池文件示例 (YAML格式)
# 每个卡池条目需包含 pool_type、UP 物品等字段

version: '3.2'
common_pools:
  character_5_star:
  - 姬子
  - 瓦尔特
  - 布洛妮娅
  # ... 常驻五星角色列表

banners:
  seele-c:                    # 卡池ID (英文，不可重复)
    name: 蝶立锋锷            # 卡池中文名
    pool_type: character       # character / weapon / standard
    character_up_5_star:
    - 希儿                    # UP 的五星角色
    character_up_4_star:
    - 娜塔莎                  # UP 的四星角色
    - 虎克
    - 佩拉

  seele-w:
    name: 希儿专锥
    pool_type: weapon
    weapon_up_5_star:
    - 于夜色中                # UP 的五星光锥
    weapon_up_4_star:
    - 晚安与睡颜
    # ...

# 常驻池必须叫 "standard" 并设置 pool_type: standard
# 完整的文件请参考: https://raw.gh.qiusyan.top/qiusyan-projects/SR-Gacha/main/banners.yml`

async function parseYamlText(text) {
  if (typeof jsyaml === 'undefined') {
    await new Promise((resolve, reject) => {
      const s = document.createElement('script')
      s.src = 'https://cdn.jsdelivr.net/npm/js-yaml@4.1.0/dist/js-yaml.min.js'
      s.onload = resolve
      s.onerror = reject
      document.head.appendChild(s)
    })
  }
  return jsyaml.load(text)
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

export function CustomPoolDialog({ open, onClose, engine, onLoaded }) {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLoad = async () => {
    if (!url.trim()) { setError('请输入 URL'); return }
    setLoading(true)
    setError('')
    try {
      const resp = await fetch(url.trim())
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
      const yamlText = await resp.text()
      let data = await parseYamlText(yamlText)
      data = resolveRefs(data, data)
      // 验证必要字段
      if (!data.banners || !data.common_pools) throw new Error('卡池文件格式不正确：缺少 banners 或 common_pools')
      engine.pools = data
      engine.banners = Object.keys(data.banners)
      onLoaded?.()
      onClose()
    } catch (e) {
      setError(e.message || '加载失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader><DialogTitle>📋 自定卡池</DialogTitle></DialogHeader>

        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium">banners.yml 直链 URL</label>
            <input
              type="url"
              value={url}
              onChange={e => { setUrl(e.target.value); setError(''); }}
              placeholder="https://raw.gh.qiusyan.top/.../banners.yml"
              className="w-full h-9 mt-1 rounded-md border border-input bg-transparent px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
            {error && <p className="text-xs text-destructive mt-1">{error}</p>}
          </div>

          <details className="text-xs">
            <summary className="cursor-pointer text-muted-foreground hover:text-foreground">📝 卡池文件格式说明 (点击展开)</summary>
            <pre className="mt-2 p-3 rounded-md bg-muted text-muted-foreground overflow-x-auto text-[11px] leading-relaxed whitespace-pre">
              {EXAMPLE}
            </pre>
          </details>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="ghost" size="sm" onClick={() => setUrl(BANNER_DOWNLOAD_URL)} className="text-xs">填入默认地址</Button>
          <Button onClick={handleLoad} disabled={loading}>
            {loading ? '加载中...' : '加载卡池'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
