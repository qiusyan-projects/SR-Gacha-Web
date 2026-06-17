import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Sparkles } from 'lucide-react'

export function FiveStarDialog({ data, onClose, remaining = 0 }) {
  if (!data) return null

  const { pullsCount, poolType, wasGuaranteed, bigPityEnabled, ...result } = data
  let message

  if (result.isUp) {
    if (wasGuaranteed) message = `你用了 ${pullsCount} 抽获得了五星${result.type}「${result.item}」！这是大保底!`
    else message = `你用了 ${pullsCount} 抽获得了五星${result.type}「${result.item}」！是小保底，恭喜没歪!`
  } else {
    if (poolType !== 'standard') {
      message = `你用了 ${pullsCount} 抽获得了五星${result.type}「${result.item}」！可惜歪了${bigPityEnabled ? '，下次将是大保底!' : '...'}`
    } else {
      message = `你用了 ${pullsCount} 抽获得了五星${result.type}「${result.item}」！`
    }
  }

  return (
    <Dialog open={!!data} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md text-center">
        <div className="py-4">
          <Sparkles className="w-12 h-12 mx-auto mb-3 text-amber-400" />
          <div className="text-2xl font-bold text-amber-300 mb-1">{result.item}</div>
          <div className="text-xs text-muted-foreground mb-4">{result.type} · 五星</div>
          <p className="text-sm leading-relaxed text-foreground/80">{message}</p>
        </div>
        <Button onClick={onClose} className="w-full">确认</Button>
        {remaining > 0 && (
          <p className="text-xs text-muted-foreground mt-2">还有 {remaining} 个五星待查看</p>
        )}
      </DialogContent>
    </Dialog>
  )
}
