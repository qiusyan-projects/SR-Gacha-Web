import { TIPS } from '@/lib/constants'

export function TipsBar({ gacha }) {
  return (
    <div className="border-t border-border bg-card/50 px-4 lg:px-6 py-2.5">
      <p className="text-xs text-muted-foreground text-center">
        💡 {gacha ? TIPS[Math.floor(Math.random() * TIPS.length)] : TIPS[0]}
      </p>
    </div>
  )
}
