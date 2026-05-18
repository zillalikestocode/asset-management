import { useState } from 'react'
import { toast } from 'sonner'
import { Plus, Check, Tag } from '@phosphor-icons/react'
import { useCreateCategory } from '@/hooks/useCategories'
import { cn, apiError } from '@/lib/utils'

interface Preset {
  name: string
  color: string
  description: string
}

const PRESETS: Preset[] = [
  { name: 'Machinery',         color: '#FF6B35', description: 'Production equipment, presses, mills' },
  { name: 'Vehicles',          color: '#3B82F6', description: 'Forklifts, trucks, company cars' },
  { name: 'Tools & Equipment', color: '#F59E0B', description: 'Hand tools, power tools, fixtures' },
  { name: 'IT & Electronics',  color: '#8B5CF6', description: 'Computers, servers, instruments' },
  { name: 'Safety Equipment',  color: '#10B981', description: 'PPE, fire safety, first aid' },
  { name: 'HVAC & Utilities',  color: '#EF4444', description: 'Compressors, boilers, generators' },
  { name: 'Furniture',         color: '#6B7280', description: 'Desks, shelving, workstations' },
  { name: 'Other',             color: '#94A3B8', description: 'Assets that don\'t fit above' },
]

interface Props {
  onDone: () => void
  onCancel: () => void
}

export function CategorySetupPrompt({ onDone, onCancel }: Props) {
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(['Machinery', 'Vehicles', 'Tools & Equipment'])
  )
  const [customName, setCustomName] = useState('')
  const [customs, setCustoms] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

  const createCategory = useCreateCategory()

  const toggle = (name: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
  }

  const addCustom = () => {
    const trimmed = customName.trim()
    if (!trimmed) return
    if (customs.includes(trimmed) || PRESETS.some(p => p.name === trimmed)) {
      toast.error('Category already exists')
      return
    }
    setCustoms(prev => [...prev, trimmed])
    setSelected(prev => new Set([...prev, trimmed]))
    setCustomName('')
  }

  const handleCreate = async () => {
    if (selected.size === 0) {
      toast.error('Select at least one category')
      return
    }
    setSaving(true)
    try {
      const presetMap = Object.fromEntries(PRESETS.map(p => [p.name, p.color]))
      await Promise.all(
        [...selected].map(name =>
          createCategory.mutateAsync({ name, color: presetMap[name] ?? '#94A3B8' })
        )
      )
      toast.success(`${selected.size} categor${selected.size === 1 ? 'y' : 'ies'} created`)
      onDone()
    } catch (err) {
      toast.error(apiError(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-af-orange-050 border border-af-orange-200">
        <div className="w-9 h-9 rounded-lg bg-af-orange-100 flex items-center justify-center flex-shrink-0">
          <Tag size={17} className="text-af-orange-600" />
        </div>
        <div>
          <p className="text-[13px] font-semibold text-af-fg">Set up categories first</p>
          <p className="text-[12px] text-af-muted mt-0.5 leading-relaxed">
            Categories are required to create assets. Select from the presets below or add your own — you can always change these later.
          </p>
        </div>
      </div>

      {/* Preset grid */}
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-af-muted mb-2">
          Common categories <span className="normal-case tracking-normal">— click to select</span>
        </p>
        <div className="grid grid-cols-2 gap-2">
          {PRESETS.map(preset => {
            const isSelected = selected.has(preset.name)
            return (
              <button
                key={preset.name}
                type="button"
                onClick={() => toggle(preset.name)}
                className={cn(
                  'flex items-start gap-2.5 p-3 rounded-xl border text-left transition-all duration-[120ms]',
                  isSelected
                    ? 'border-af-orange-400 bg-af-orange-050 ring-1 ring-af-orange-400'
                    : 'border-af-border bg-white hover:bg-af-ink-050',
                )}
              >
                <div className="flex-shrink-0 mt-0.5 flex items-center justify-center w-5 h-5 rounded-full border-2 transition-all duration-[120ms]"
                  style={{
                    borderColor: isSelected ? preset.color : '#D1D5DB',
                    backgroundColor: isSelected ? preset.color : 'transparent',
                  }}
                >
                  {isSelected && <Check size={10} weight="bold" className="text-white" />}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: preset.color }}
                    />
                    <p className="text-[13px] font-semibold truncate">{preset.name}</p>
                  </div>
                  <p className="text-[11px] text-af-muted mt-0.5 leading-snug">{preset.description}</p>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Custom categories */}
      {customs.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {customs.map(name => (
            <span
              key={name}
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[12px] font-medium cursor-pointer transition-all duration-[120ms]',
                selected.has(name)
                  ? 'border-af-orange-400 bg-af-orange-050 text-af-orange-700'
                  : 'border-af-border bg-white text-af-muted',
              )}
              onClick={() => toggle(name)}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-af-ink-400" />
              {name}
              {selected.has(name) && <Check size={10} weight="bold" />}
            </span>
          ))}
        </div>
      )}

      {/* Add custom */}
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-af-muted mb-2">Add custom category</p>
        <div className="flex gap-2">
          <input
            value={customName}
            onChange={e => setCustomName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustom())}
            placeholder="e.g. Robotics, Lab Equipment…"
            className="flex-1 h-9 px-3 rounded-lg border border-af-border bg-white text-[13px] outline-none focus:border-af-focus transition-[border-color] duration-[120ms]"
          />
          <button
            type="button"
            onClick={addCustom}
            disabled={!customName.trim()}
            className="h-9 px-3 rounded-lg border border-af-border bg-white text-af-muted hover:bg-af-ink-050 disabled:opacity-40 transition-colors duration-[120ms] flex items-center gap-1.5 text-[12px] font-medium"
          >
            <Plus size={13} />Add
          </button>
        </div>
      </div>

      {/* Selection summary */}
      <div className="flex items-center justify-between pt-1">
        <p className="text-[12px] text-af-muted">
          {selected.size === 0
            ? 'No categories selected'
            : `${selected.size} categor${selected.size === 1 ? 'y' : 'ies'} selected`}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="h-8 px-4 rounded-lg border border-af-border bg-white text-[12px] font-medium text-af-muted hover:text-af-fg transition-colors duration-[120ms]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleCreate}
            disabled={selected.size === 0 || saving}
            className="h-8 px-4 rounded-lg bg-af-orange-500 hover:bg-af-orange-600 disabled:opacity-50 text-white text-[12px] font-semibold transition-colors duration-[120ms]"
          >
            {saving ? 'Creating…' : `Create ${selected.size > 0 ? selected.size : ''} & continue →`}
          </button>
        </div>
      </div>
    </div>
  )
}
