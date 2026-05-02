import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { QrCode, MagnifyingGlass } from '@phosphor-icons/react'
import { useAssets } from '@/hooks/useAssets'

export function TechScanPage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const { data } = useAssets({ search: query || undefined, perPage: 10 })
  const results  = query ? (data?.data ?? []) : []

  return (
    <div className="p-5 space-y-5">
      <div>
        <p className="font-mono text-[10px] tracking-[0.12em] uppercase text-af-muted">Lookup</p>
        <h1 className="text-[22px] font-semibold tracking-[-0.015em] mt-0.5">Scan</h1>
      </div>

      {/* Camera placeholder */}
      <div className="relative rounded-2xl bg-af-ink-900 aspect-square max-h-[240px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 border-[3px] border-af-orange-500/30 rounded-2xl" />
        <div className="absolute top-6 left-6 right-6 bottom-6 border-[2px] border-af-orange-500 rounded-xl" />
        <div className="absolute top-6 left-6 w-6 h-6 border-t-[3px] border-l-[3px] border-af-orange-500 rounded-tl" />
        <div className="absolute top-6 right-6 w-6 h-6 border-t-[3px] border-r-[3px] border-af-orange-500 rounded-tr" />
        <div className="absolute bottom-6 left-6 w-6 h-6 border-b-[3px] border-l-[3px] border-af-orange-500 rounded-bl" />
        <div className="absolute bottom-6 right-6 w-6 h-6 border-b-[3px] border-r-[3px] border-af-orange-500 rounded-br" />
        <div className="text-center text-white/60">
          <QrCode size={40} className="mx-auto mb-2 opacity-40" />
          <p className="text-[12px] font-mono uppercase tracking-[0.08em]">Camera not available</p>
          <p className="text-[11px] opacity-60 mt-1">Use search below</p>
        </div>
      </div>

      {/* Manual search */}
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-af-muted mb-2">Search by code or name</p>
        <div className="flex items-center gap-2 bg-white border border-af-border rounded-xl px-3 py-3">
          <MagnifyingGlass size={16} className="text-af-muted flex-shrink-0" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="e.g. AF-0042 or CNC Mill"
            className="flex-1 bg-transparent outline-none text-[15px] text-af-fg placeholder:text-af-subtle"
          />
        </div>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-2">
          {results.map(asset => (
            <button
              key={asset.id}
              onClick={() => navigate(`/tech/assets/${asset.id}`)}
              className="w-full flex items-center gap-3 p-4 rounded-xl border border-af-border bg-white hover:bg-af-ink-050 transition-colors duration-[120ms] text-left"
            >
              <div className="w-10 h-10 rounded-lg bg-af-ink-100 flex items-center justify-center flex-shrink-0">
                <QrCode size={18} className="text-af-muted" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-mono text-[10px] text-af-orange-500 mb-0.5">{asset.assetCode}</p>
                <p className="text-[15px] font-semibold truncate">{asset.name}</p>
                <p className="text-[11px] text-af-muted">{asset.location?.name ?? 'No location'}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {query && results.length === 0 && (
        <p className="text-center text-[13px] text-af-muted py-8">No assets found for "{query}"</p>
      )}
    </div>
  )
}
