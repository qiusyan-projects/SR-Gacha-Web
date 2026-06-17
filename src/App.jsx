import { useState, useEffect } from 'react'
import { Menu, Sun, Moon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { useGacha } from '@/hooks/useGacha'
import { Sidebar } from '@/components/Sidebar'
import { StatsPanel } from '@/components/StatsPanel'
import { HistoryTable } from '@/components/HistoryTable'
import { TipsBar } from '@/components/TipsBar'
import { FiveStarDialog } from '@/components/FiveStarDialog'
import { SettingsDialog } from '@/components/SettingsDialog'
import { VersionDialog } from '@/components/VersionDialog'
import { CustomPoolDialog } from '@/components/CustomPoolDialog'
import { ConfirmDialog } from '@/components/ConfirmDialog'

function MobilePullBar({ gacha }) {
  const { doPull, currentPity, pulling, engine } = gacha
  return (
    <div className="lg:hidden border-t border-border bg-card px-4 py-3 space-y-2">
      <p className="text-[11px] text-muted-foreground text-center truncate">
        {engine.getCurrentBannerInfo()?.name || '未选择卡池'}
      </p>
      <div className="flex gap-2">
        <Button onClick={() => doPull(1)} disabled={pulling} size="sm" className="flex-1">抽一次</Button>
        <Button onClick={() => doPull(10)} disabled={pulling} variant="secondary" size="sm" className="flex-1">十连抽</Button>
      </div>
      <Button onClick={() => doPull(currentPity)} disabled={pulling} variant="outline" size="sm" className="w-full text-xs">
        抽一个小保底 ({currentPity} 抽)
      </Button>
    </div>
  )
}

function ThemeToggle() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'))

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }, [dark])

  return (
    <Button variant="ghost" size="icon" className="shrink-0" onClick={() => setDark(!dark)} title={dark ? '切换日间模式' : '切换夜间模式'}>
      {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </Button>
  )
}

export default function App() {
  const gacha = useGacha()
  const { engine } = gacha

  const sidebarContent = <Sidebar gacha={gacha} />

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* 桌面端侧栏 */}
      <div className="hidden lg:block">
        {sidebarContent}
      </div>

      {/* 主内容区 */}
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* 顶部栏 */}
        <header className="flex items-center justify-between px-4 lg:px-6 py-3 border-b border-border bg-card/50 gap-2">
          {/* 移动端汉堡菜单 */}
          <Sheet open={gacha.mobileMenuOpen} onOpenChange={gacha.setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden shrink-0">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 p-0">
              {sidebarContent}
            </SheetContent>
          </Sheet>

          <h2 className="text-sm font-medium text-foreground/70 truncate">
            当前卡池: {engine.getCurrentBannerInfo()?.name || '未选择'}
          </h2>
          <button
            onClick={() => gacha.setConfirmAction({
              title: '清空抽卡记录',
              message: '您确定要清空抽卡记录吗？此操作不可逆。',
              onConfirm: () => { engine.clearHistory(); gacha.refresh(); gacha.confirmAction = null; gacha.setConfirmAction(null); },
            })}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors shrink-0"
          >
            清空记录
          </button>
          <ThemeToggle />
        </header>

        <StatsPanel engine={engine} poolType={gacha.poolType} />
        <HistoryTable engine={engine} />

        {/* 手机端底部抽卡栏 */}
        <MobilePullBar gacha={gacha} />

        <TipsBar gacha={gacha} />
      </main>

      {/* 弹窗 */}
      <FiveStarDialog data={gacha.currentFiveStar} onClose={gacha.dismissFiveStar} remaining={gacha.fiveStarRemaining} />
      <SettingsDialog open={gacha.settingsOpen} onClose={() => gacha.setSettingsOpen(false)} engine={engine} onSaved={gacha.refresh} />
      <VersionDialog open={gacha.versionOpen} onClose={() => gacha.setVersionOpen(false)} />
      <CustomPoolDialog open={gacha.customPoolOpen} onClose={() => gacha.setCustomPoolOpen(false)} engine={engine} onLoaded={gacha.refresh} />
      <ConfirmDialog
        open={!!gacha.confirmAction}
        title={gacha.confirmAction?.title || ''}
        message={gacha.confirmAction?.message || ''}
        onConfirm={() => gacha.confirmAction?.onConfirm?.()}
        onCancel={() => gacha.setConfirmAction(null)}
      />

      {/* Toast */}
      {gacha.toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] px-5 py-2.5 rounded-lg bg-foreground/10 backdrop-blur-md border border-border text-sm text-foreground shadow-lg animate-in fade-in slide-in-from-bottom-2">
          {gacha.toast}
        </div>
      )}
    </div>
  )
}
