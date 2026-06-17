import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

export function HistoryTable({ engine }) {
  const { items } = engine.getHistory(500, 0)

  return (
    <div className="flex-1 overflow-auto">
      <div className="min-w-[380px] lg:min-w-0">
        <Table className="table-fixed lg:table-auto w-full">
          <colgroup className="hidden lg:colgroup">
            {/* 桌面端自适应，手机端用固定比例 */}
          </colgroup>
          <TableHeader className="sticky top-0 bg-card/80 backdrop-blur-sm z-10">
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-[11px] whitespace-nowrap px-1.5 lg:px-4 w-[28%] lg:w-auto">时间</TableHead>
              <TableHead className="text-[11px] text-center whitespace-nowrap px-1 lg:px-4 w-[16%] lg:w-[60px]">星级</TableHead>
              <TableHead className="text-[11px] text-center whitespace-nowrap px-1 lg:px-4 w-[14%] lg:w-[48px]">类型</TableHead>
              <TableHead className="text-[11px] whitespace-nowrap px-1.5 lg:px-4 w-[24%] lg:w-auto">名称</TableHead>
              <TableHead className="text-[11px] whitespace-nowrap hidden sm:table-cell px-1.5 lg:px-4">卡池</TableHead>
              <TableHead className="text-[11px] text-center whitespace-nowrap px-1 lg:px-4 w-[18%] lg:w-[44px]">UP</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">暂无抽卡记录</TableCell>
              </TableRow>
            ) : items.map((h, i) => {
              const rarityNum = h.rarity === '5_star' ? 5 : h.rarity === '4_star' ? 4 : 3
              const badgeClass = rarityNum === 5
                ? 'bg-amber-500/15 text-amber-400 border-amber-400/20 font-bold'
                : rarityNum === 4
                  ? 'bg-purple-500/10 text-purple-400 border-purple-400/20'
                  : 'text-muted-foreground border-muted/20'
              const nameClass = rarityNum === 5 ? 'text-amber-300 font-semibold' : rarityNum === 4 ? 'text-purple-300' : ''
              const d = h.time ? new Date(h.time) : null
              const time = d
                ? `${d.getMonth()+1}/${d.getDate()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
                : '-'

              return (
                <TableRow key={i} className={`${rarityNum === 5 ? 'bg-amber-500/[0.03]' : rarityNum === 4 ? 'bg-purple-500/[0.02]' : ''} hover:bg-accent/30 cursor-pointer`}>
                  <TableCell className="text-[11px] text-muted-foreground py-1.5 lg:py-2 whitespace-nowrap px-1.5 lg:px-4">{time}</TableCell>
                  <TableCell className="text-center py-1.5 lg:py-2 px-1 lg:px-4">
                    <Badge variant="outline" className={`text-[10px] px-1 lg:px-1.5 whitespace-nowrap ${badgeClass}`}>
                      {rarityNum === 5 ? '五星' : rarityNum === 4 ? '四星' : '三星'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-[11px] text-center py-1.5 lg:py-2 text-muted-foreground whitespace-nowrap px-1 lg:px-4">{h.itemType}</TableCell>
                  <TableCell className={`text-sm py-1.5 lg:py-2 font-medium truncate px-1.5 lg:px-4 ${nameClass}`}>{h.item}</TableCell>
                  <TableCell className="text-[11px] text-muted-foreground py-1.5 lg:py-2 hidden sm:table-cell whitespace-nowrap px-1.5 lg:px-4">{h.banner}</TableCell>
                  <TableCell className="text-center py-1.5 lg:py-2 px-1 lg:px-4">
                    {h.poolType !== 'standard' && (
                      <Badge variant={h.isUp ? 'default' : 'outline'} className={`text-[10px] px-1 whitespace-nowrap ${h.isUp ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'text-muted-foreground'}`}>
                        {h.isUp ? '是' : '否'}
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
