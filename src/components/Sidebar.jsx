import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Card } from '@/components/ui/card'
import { Settings, Info, FileInput, Trash2 } from 'lucide-react'

function StandardPoolView({ engine, currentId, onSelect }) {
  const stdId = engine.getStandardBanner()
  const info = stdId ? engine.pools.banners[stdId] : null
  const active = currentId === stdId
  const char5 = engine.pools.common_pools?.character_5_star || []
  const weap5 = engine.pools.common_pools?.weapon_5_star || []

  return (
    <div className="space-y-3">
      {/* 常驻池卡片 */}
      {info && (
        <Card
          onClick={() => onSelect(stdId)}
          className={`p-3 cursor-pointer transition-colors hover:bg-accent/50 ${
            active ? 'border-primary/50 bg-accent/30' : 'border-transparent'
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">{info.name}</p>
            {active && <Badge variant="secondary" className="text-[10px] px-1.5 py-0">当前</Badge>}
          </div>
        </Card>
      )}

      {/* 五星角色 */}
      <div>
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 px-1">五星角色</p>
        <div className="flex flex-wrap gap-1">
          {char5.map(name => (
            <Badge key={name} variant="outline" className="text-[11px] bg-amber-500/5 text-amber-700 dark:text-amber-400/80 border-amber-500/10">
              {name}
            </Badge>
          ))}
        </div>
      </div>

      {/* 五星光锥 */}
      <div>
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 px-1">五星光锥</p>
        <div className="flex flex-wrap gap-1">
          {weap5.map(name => (
            <Badge key={name} variant="outline" className="text-[11px] bg-amber-500/5 text-amber-700 dark:text-amber-400/80 border-amber-500/10">
              {name}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  )
}

export function Sidebar({ gacha }) {
  const { engine, currentTab, setCurrentTab, selectBanner, selectStandard, doPull, currentPity, pulling,
    settingsOpen, setSettingsOpen, versionOpen, setVersionOpen, customPoolOpen, setCustomPoolOpen,
    setConfirmAction, refresh, setMobileMenuOpen } = gacha

  const { character, weapon } = engine.categorizeBanners()
  const banners = currentTab === 'character' ? character : weapon
  const currentId = engine.currentBanner

  const closeMobile = () => setMobileMenuOpen?.(false)

  const handleSelectBanner = (id) => {
    selectBanner(id)
    closeMobile()
  }

  const handleSelectStandard = () => {
    selectStandard()
    closeMobile()
  }

  return (
    <aside className="w-80 flex-shrink-0 border-r border-border bg-card flex flex-col h-full">
      <div className="px-5 py-4 border-b border-border">
        <h1 className="text-base font-semibold tracking-tight">
          星穹铁道 <span className="text-muted-foreground font-normal text-xs ml-1">抽卡模拟器</span>
        </h1>
      </div>

      <Tabs value={currentTab} onValueChange={setCurrentTab} className="border-b border-border">
        <TabsList className="w-full rounded-none bg-transparent h-10">
          <TabsTrigger value="character" className="flex-1 text-xs rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary border-b-2 border-transparent">角色池</TabsTrigger>
          <TabsTrigger value="weapon" className="flex-1 text-xs rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary border-b-2 border-transparent">光锥池</TabsTrigger>
          <TabsTrigger value="standard" className="flex-1 text-xs rounded-none" onClick={handleSelectStandard}>常驻</TabsTrigger>
        </TabsList>
      </Tabs>

      <ScrollArea className="flex-1 px-3 py-2">
        <div className="space-y-0.5">
          {currentTab === 'standard' ? (
            <StandardPoolView engine={engine} currentId={currentId} onSelect={handleSelectBanner} />
          ) : (
            banners.map(b => {
              const info = engine.pools.banners[b.id]
              const up5 = info?.character_up_5_star?.[0] || info?.weapon_up_5_star?.[0]
              const active = currentId === b.id
              return (
                <Card
                  key={b.id}
                  onClick={() => handleSelectBanner(b.id)}
                  className={`p-3 cursor-pointer transition-colors hover:bg-accent/50 ${
                    active ? 'border-primary/50 bg-accent/30' : 'border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{b.name}</p>
                      {up5 && <p className="text-xs text-amber-600 dark:text-amber-400/70 mt-0.5">UP: {up5}</p>}
                    </div>
                    {active && <Badge variant="secondary" className="text-[10px] px-1.5 py-0 shrink-0 ml-2">当前</Badge>}
                  </div>
                </Card>
              )
            })
          )}
        </div>
      </ScrollArea>

      <Separator />

      <div className="p-4 space-y-2">
        <div className="flex gap-2">
          <Button onClick={() => doPull(1)} disabled={pulling} size="sm" className="flex-1">抽一次</Button>
          <Button onClick={() => doPull(10)} disabled={pulling} variant="secondary" size="sm" className="flex-1">十连抽</Button>
        </div>
        <Button onClick={() => doPull(currentPity)} disabled={pulling} variant="outline" size="sm" className="w-full text-xs">
          抽一个小保底 ({currentPity} 抽)
        </Button>
      </div>

      <Separator />

      <div className="px-4 pb-4 pt-2 space-y-1.5">
        <div className="flex gap-1.5">
          <Button variant="ghost" size="sm" className="flex-1 text-xs text-muted-foreground" onClick={() => { setSettingsOpen(true); closeMobile(); }}>
            <Settings className="w-3.5 h-3.5 mr-1" /> 概率设置
          </Button>
          <Button variant="ghost" size="sm" className="flex-1 text-xs text-muted-foreground" onClick={() => { setVersionOpen(true); closeMobile(); }}>
            <Info className="w-3.5 h-3.5 mr-1" /> 版本信息
          </Button>
        </div>
        <div className="flex gap-1.5">
          <Button variant="ghost" size="sm" className="flex-1 text-xs text-muted-foreground" onClick={() => { setCustomPoolOpen(true); closeMobile(); }}>
            <FileInput className="w-3.5 h-3.5 mr-1" /> 自定卡池
          </Button>
          <Button variant="ghost" size="sm" className="flex-1 text-xs text-muted-foreground hover:text-destructive" onClick={() => {
            setConfirmAction({
              title: '重置统计数据',
              message: '您确定要清除所有抽卡统计数据吗？此操作不可逆。',
              onConfirm: () => { engine.resetAll(); refresh(); gacha.confirmAction = null; gacha.setConfirmAction(null); },
            });
            closeMobile();
          }}>
            <Trash2 className="w-3.5 h-3.5 mr-1" /> 重置数据
          </Button>
        </div>
      </div>
    </aside>
  )
}
