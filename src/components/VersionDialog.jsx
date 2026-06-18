import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ExternalLink, Info } from 'lucide-react'
import { VERSION, AUTHOR, GITHUB_REPO } from '@/lib/constants'

export function VersionDialog({ open, onClose }) {
  const [updateMsg, setUpdateMsg] = useState('检查中...')

  useEffect(() => {
    if (!open) return
    setUpdateMsg('检查中...')
    fetch(`https://api.github.com/repos/${GITHUB_REPO}/releases/latest`)
      .then(r => r.json())
      .then(data => {
        const latest = (data.tag_name || '').replace(/^[^0-9]+/, '')
        const cur = VERSION.replace(/^[^0-9]+/, '')
        const lp = latest.split('.').map(Number), cp = cur.split('.').map(Number)
        let newer = false
        for (let i = 0; i < Math.max(lp.length, cp.length); i++) {
          if ((lp[i] || 0) > (cp[i] || 0)) { newer = true; break }
          if ((lp[i] || 0) < (cp[i] || 0)) break
        }
        setUpdateMsg(newer ? `检测到新版本 ${data.tag_name}，请及时更新！` : '你的程序已是最新版本。')
      })
      .catch(() => setUpdateMsg('检查更新时发生错误'))
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader><DialogTitle className="flex items-center gap-2"><Info className="w-5 h-5" /> 版本信息</DialogTitle></DialogHeader>
        <div className="text-sm text-muted-foreground space-y-1.5">
          <p>当前版本: <span className="text-foreground font-semibold">{VERSION}</span></p>
          <p>作者: {AUTHOR}</p>
          <div className="flex items-center gap-2">
            <span>仓库:</span>
            <a
              href={`https://github.com/${GITHUB_REPO}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline inline-flex items-center gap-1"
            >
              {GITHUB_REPO}
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <p className="text-pink-400/70 mt-2">来点Star叭~💖</p>
          <p className="text-xs mt-3">{updateMsg}</p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
