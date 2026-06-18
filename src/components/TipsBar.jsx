import { Lightbulb } from 'lucide-react'
import { TIPS } from '@/lib/constants'

export function TipsBar({ gacha }) {
  return (
    <div className="border-t border-border bg-card/50 px-4 lg:px-6 py-2.5">
      <p className="text-xs text-muted-foreground text-center inline-flex items-center gap-1 justify-center w-full">
        <Lightbulb className="w-3 h-3" />
        {gacha ? TIPS[Math.floor(Math.random() * TIPS.length)] : TIPS[0]}
      </p>
    </div>
  )
}
