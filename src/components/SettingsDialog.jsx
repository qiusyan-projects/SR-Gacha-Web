import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { DEFAULT_PROBABILITIES } from '@/lib/constants'

// 快速创建 Label + Input 组合 (shadcn/ui 没有自带 Label 和 Input，这里用原生加 tailwind)
function Field({ label, id, value, onChange, type = 'number', step, min, max, hint }) {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="text-xs text-muted-foreground">{label}</label>
      <input
        id={id}
        type={type}
        step={step}
        min={min}
        max={max}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      />
      {hint && <p className="text-[10px] text-muted-foreground">{hint}</p>}
    </div>
  )
}

function RadioGroup({ label, name, value, onChange, options }) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <div className="flex gap-4">
        {options.map(opt => (
          <label key={opt.value} className="flex items-center gap-1.5 text-sm">
            <input type="radio" name={name} value={opt.value} checked={value === opt.value} onChange={() => onChange(opt.value)} className="accent-primary" />
            {opt.label}
          </label>
        ))}
      </div>
    </div>
  )
}

export function SettingsDialog({ open, onClose, engine, onSaved }) {
  const prob = engine.getAllProb()
  const [tab, setTab] = useState('char')
  const [form, setForm] = useState({ ...prob })

  const save = () => {
    engine.updateProbBatch(form)
    onSaved?.()
    onClose()
  }

  const reset = () => {
    setForm({ ...DEFAULT_PROBABILITIES })
    engine.resetProb()
    onSaved?.()
    onClose()
  }

  const u = (k, v) => setForm(prev => ({ ...prev, [k]: v }))

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
        <DialogHeader><DialogTitle>⚙️ 概率设置</DialogTitle></DialogHeader>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="w-full">
            <TabsTrigger value="char" className="flex-1">角色池</TabsTrigger>
            <TabsTrigger value="weapon" className="flex-1">光锥池</TabsTrigger>
            <TabsTrigger value="standard" className="flex-1">常驻池</TabsTrigger>
          </TabsList>

          <TabsContent value="char" className="space-y-3 mt-3">
            <div className="grid grid-cols-3 gap-3">
              <Field label="5★ 基础概率" id="char-base5" value={form.character_five_star_base} onChange={v => u('character_five_star_base', parseFloat(v))} step={0.001} min={0} max={1} hint="0.006 = 0.6%" />
              <Field label="5★ 不歪概率" id="char-s5" value={form.character_five_star_success_prob} onChange={v => u('character_five_star_success_prob', parseFloat(v))} step={0.01} min={0} max={1} hint="0.5 = 50%" />
              <Field label="5★ 保底抽数" id="char-p5" value={form.character_five_star_pity} onChange={v => u('character_five_star_pity', parseInt(v))} step={1} min={1} max={200} hint="默认: 90" />
              <Field label="4★ 基础概率" id="char-base4" value={form.character_four_star_base} onChange={v => u('character_four_star_base', parseFloat(v))} step={0.001} min={0} max={1} hint="0.051 = 5.1%" />
              <Field label="4★ 不歪概率" id="char-s4" value={form.character_four_star_success_prob} onChange={v => u('character_four_star_success_prob', parseFloat(v))} step={0.01} min={0} max={1} hint="0.5 = 50%" />
              <Field label="4★ 保底抽数" id="char-p4" value={form.character_four_star_pity} onChange={v => u('character_four_star_pity', parseInt(v))} step={1} min={1} max={50} hint="默认: 10" />
            </div>
            <div className="p-3 rounded-lg border border-border space-y-2 text-sm">
              <RadioGroup label="5★ 小保底机制" name="char-sm5" value={form.character_five_star_small_pity_mechanism} onChange={v => u('character_five_star_small_pity_mechanism', v)} options={[{label:'随机',value:'random'},{label:'必歪',value:'must_waste'},{label:'必不歪',value:'must_not_waste'}]} />
              <RadioGroup label="4★ 小保底机制" name="char-sm4" value={form.character_four_star_small_pity_mechanism} onChange={v => u('character_four_star_small_pity_mechanism', v)} options={[{label:'随机',value:'random'},{label:'必歪',value:'must_waste'},{label:'必不歪',value:'must_not_waste'}]} />
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.character_five_star_big_pity_enabled} onChange={e => u('character_five_star_big_pity_enabled', e.target.checked)} className="accent-primary" />
                  启用 5★ 大保底
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.character_four_star_big_pity_enabled} onChange={e => u('character_four_star_big_pity_enabled', e.target.checked)} className="accent-primary" />
                  启用 4★ 大保底
                </label>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="weapon" className="space-y-3 mt-3">
            <div className="grid grid-cols-3 gap-3">
              <Field label="5★ 基础概率" id="weap-base5" value={form.weapon_five_star_base} onChange={v => u('weapon_five_star_base', parseFloat(v))} step={0.001} min={0} max={1} hint="0.008 = 0.8%" />
              <Field label="5★ 不歪概率" id="weap-s5" value={form.weapon_five_star_success_prob} onChange={v => u('weapon_five_star_success_prob', parseFloat(v))} step={0.01} min={0} max={1} hint="0.75 = 75%" />
              <Field label="5★ 保底抽数" id="weap-p5" value={form.weapon_five_star_pity} onChange={v => u('weapon_five_star_pity', parseInt(v))} step={1} min={1} max={200} hint="默认: 80" />
              <Field label="4★ 基础概率" id="weap-base4" value={form.weapon_four_star_base} onChange={v => u('weapon_four_star_base', parseFloat(v))} step={0.001} min={0} max={1} hint="0.066 = 6.6%" />
              <Field label="4★ 不歪概率" id="weap-s4" value={form.weapon_four_star_success_prob} onChange={v => u('weapon_four_star_success_prob', parseFloat(v))} step={0.01} min={0} max={1} hint="0.75 = 75%" />
              <Field label="4★ 保底抽数" id="weap-p4" value={form.weapon_four_star_pity} onChange={v => u('weapon_four_star_pity', parseInt(v))} step={1} min={1} max={50} hint="默认: 10" />
            </div>
            <div className="p-3 rounded-lg border border-border space-y-2 text-sm">
              <RadioGroup label="5★ 小保底机制" name="weap-sm5" value={form.weapon_five_star_small_pity_mechanism} onChange={v => u('weapon_five_star_small_pity_mechanism', v)} options={[{label:'随机',value:'random'},{label:'必歪',value:'must_waste'},{label:'必不歪',value:'must_not_waste'}]} />
              <RadioGroup label="4★ 小保底机制" name="weap-sm4" value={form.weapon_four_star_small_pity_mechanism} onChange={v => u('weapon_four_star_small_pity_mechanism', v)} options={[{label:'随机',value:'random'},{label:'必歪',value:'must_waste'},{label:'必不歪',value:'must_not_waste'}]} />
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.weapon_five_star_big_pity_enabled} onChange={e => u('weapon_five_star_big_pity_enabled', e.target.checked)} className="accent-primary" />启用 5★ 大保底</label>
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.weapon_four_star_big_pity_enabled} onChange={e => u('weapon_four_star_big_pity_enabled', e.target.checked)} className="accent-primary" />启用 4★ 大保底</label>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="standard" className="space-y-3 mt-3">
            <div className="grid grid-cols-2 gap-3">
              <Field label="5★ 基础概率" id="std-base5" value={form.standard_five_star_base} onChange={v => u('standard_five_star_base', parseFloat(v))} step={0.001} min={0} max={1} hint="0.006 = 0.6%" />
              <Field label="5★ 保底抽数" id="std-p5" value={form.standard_five_star_pity} onChange={v => u('standard_five_star_pity', parseInt(v))} step={1} min={1} max={200} hint="默认: 90" />
              <Field label="4★ 基础概率" id="std-base4" value={form.standard_four_star_base} onChange={v => u('standard_four_star_base', parseFloat(v))} step={0.001} min={0} max={1} hint="0.051 = 5.1%" />
              <Field label="4★ 保底抽数" id="std-p4" value={form.standard_four_star_pity} onChange={v => u('standard_four_star_pity', parseInt(v))} step={1} min={1} max={50} hint="默认: 10" />
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-4 gap-2">
          <Button variant="outline" onClick={reset}>恢复默认</Button>
          <Button onClick={save}>保存设置</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
