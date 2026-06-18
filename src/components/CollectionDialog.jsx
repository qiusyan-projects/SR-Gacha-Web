import { Package } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { CHAR_DISP, WEAPON_DISP } from '@/lib/constants'

export function CollectionDialog({ open, onClose, engine }) {
  // 从抽卡历史中统计五星角色和光锥
  const charCounts = {}
  const weapCounts = {}

  for (const h of engine.pullHistory) {
    if (h.rarity !== '5_star') continue
    if (h.itemType === CHAR_DISP) {
      charCounts[h.item] = (charCounts[h.item] || 0) + 1
    } else if (h.itemType === WEAPON_DISP) {
      weapCounts[h.item] = (weapCounts[h.item] || 0) + 1
    }
  }

  const charEntries = Object.entries(charCounts).sort((a, b) => b[1] - a[1])
  const weapEntries = Object.entries(weapCounts).sort((a, b) => b[1] - a[1])
  const total5Star = charEntries.reduce((s, [,c]) => s + c, 0) + weapEntries.reduce((s, [,c]) => s + c, 0)

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Package className="w-5 h-5" /> 五星收获</DialogTitle>
          <p className="text-xs text-muted-foreground">共计 {total5Star} 个五星</p>
        </DialogHeader>

        <ScrollArea className="flex-1 -mx-6 px-6 max-h-[55vh]">
          <div className="space-y-4">
            {/* 五星角色 */}
            {charEntries.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">五星角色 ({CHAR_DISP})</p>
                <div className="flex flex-wrap gap-2">
                  {charEntries.map(([name, count]) => (
                    <Badge key={name} variant="outline" className="text-sm py-1.5 px-3 bg-amber-500/10 text-amber-400 border-amber-400/20 font-medium">
                      {name} <span className="ml-1 text-amber-300 font-bold">{count}命</span>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* 五星光锥 */}
            {weapEntries.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">五星光锥 ({WEAPON_DISP})</p>
                <div className="flex flex-wrap gap-2">
                  {weapEntries.map(([name, count]) => (
                    <Badge key={name} variant="outline" className="text-sm py-1.5 px-3 bg-amber-500/10 text-amber-400 border-amber-400/20 font-medium">
                      {name} <span className="ml-1 text-amber-300 font-bold">{count}张</span>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {total5Star === 0 && (
              <p className="text-center text-muted-foreground py-8">还没有抽到五星，加油！</p>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
