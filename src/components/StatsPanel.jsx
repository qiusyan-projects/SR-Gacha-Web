import { Progress } from '@/components/ui/progress'

export function StatsPanel({ engine, poolType }) {
  const stats = engine.getPoolStats(poolType)
  if (!stats) return null

  const items = [
    { label: '抽取次数', value: stats.totalPulls },
    { label: '出金次数', value: stats.goldCount },
    { label: '出紫次数', value: stats.purpleCount },
    { label: '平均出金', value: stats.avgGold !== null ? `${stats.avgGold.toFixed(1)} 抽` : '-' },
    { label: poolType !== 'standard' ? '不歪概率' : '歪卡', value: poolType !== 'standard' && stats.winRate !== null ? `${stats.winRate.toFixed(1)}%` : '-' },
    { label: '运势', value: stats.luck },
  ]

  return (
    <div className="px-4 lg:px-6 py-3 border-b border-border bg-card/50">
      <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-2">{stats.statsType} 数据</p>

      <div className="mb-3 space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">5★ 保底进度</span>
          <span className="tabular-nums font-medium">{stats.pity5} / {stats.pity5 + stats.pity5Remaining} <span className="text-muted-foreground hidden sm:inline">(距保底 {stats.pity5Remaining} 抽)</span></span>
        </div>
        <Progress value={stats.pity5 / (stats.pity5 + stats.pity5Remaining) * 100} className="h-1.5" />
      </div>

      <div className="grid grid-cols-3 lg:grid-cols-6 gap-2 lg:gap-3">
        {items.map(it => (
          <div key={it.label} className="text-center">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{it.label}</div>
            <div className="text-sm font-semibold mt-0.5 tabular-nums">{it.value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
