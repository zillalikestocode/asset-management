import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MagnifyingGlass, FunnelSimple, Package } from '@phosphor-icons/react'
import { useAssets } from '@/hooks/useAssets'
import { useCategories, useLocations } from '@/hooks/useCategories'
import { Table, Thead, Th, Tbody, Tr, Td, TdEmpty } from '@/components/ui/Table'
import { StatusPill, IdTag } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Input'
import { Pagination } from '@/components/ui/Pagination'
import { PageSpinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { AssetFormModal } from './AssetFormModal'
import { formatDate } from '@/lib/utils'
import type { Asset } from '@/types'

export function AssetsPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [locationId, setLocationId] = useState('')
  const [status, setStatus] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editAsset, setEditAsset] = useState<Asset | null>(null)

  const { data, isLoading } = useAssets({
    page,
    perPage: 20,
    search: search || undefined,
    categoryId: categoryId || undefined,
    locationId: locationId || undefined,
    status: status || undefined,
  })

  const { data: categories } = useCategories()
  const { data: locations } = useLocations()

  const assets = data?.data ?? []
  const total = data?.total ?? 0

  const openAdd = () => { setEditAsset(null); setShowForm(true) }
  const openEdit = (a: Asset) => { setEditAsset(a); setShowForm(true) }

  if (isLoading) return <PageSpinner />

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-[10px] tracking-[0.12em] uppercase text-af-muted">Inventory</p>
          <h1 className="text-2xl font-semibold tracking-[-0.015em] mt-0.5">Assets</h1>
        </div>
        <Button variant="accent" size="sm" onClick={openAdd}>+ New asset</Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5 bg-white border border-af-border rounded px-2.5 py-1.5 w-64 text-[12px] text-af-muted">
          <MagnifyingGlass size={13} />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search assets…"
            className="flex-1 bg-transparent outline-none text-af-fg placeholder:text-af-subtle text-[12px]"
          />
        </div>

        <div className="flex items-center gap-1.5 text-af-muted">
          <FunnelSimple size={13} />
        </div>

        <Select
          className="w-40 h-8 text-[12px]"
          value={status}
          onChange={e => { setStatus(e.target.value); setPage(1) }}
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="maintenance">Maintenance</option>
          <option value="inactive">Inactive</option>
          <option value="retired">Retired</option>
        </Select>

        <Select
          className="w-40 h-8 text-[12px]"
          value={categoryId}
          onChange={e => { setCategoryId(e.target.value); setPage(1) }}
        >
          <option value="">All categories</option>
          {(categories ?? []).map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </Select>

        <Select
          className="w-44 h-8 text-[12px]"
          value={locationId}
          onChange={e => { setLocationId(e.target.value); setPage(1) }}
        >
          <option value="">All locations</option>
          {(locations ?? []).map(l => (
            <option key={l.id} value={l.id}>{l.name}</option>
          ))}
        </Select>

        {(search || status || categoryId || locationId) && (
          <button
            onClick={() => { setSearch(''); setStatus(''); setCategoryId(''); setLocationId(''); setPage(1) }}
            className="font-mono text-[10px] uppercase tracking-[0.08em] text-af-muted hover:text-af-fg transition-colors duration-[120ms]"
          >
            Clear
          </button>
        )}
      </div>

      {/* Table */}
      {assets.length === 0 ? (
        <EmptyState
          icon={<Package size={28} />}
          title="No assets found"
          description={search || status || categoryId || locationId ? 'Try adjusting your filters.' : 'Add your first asset to get started.'}
          action={!search && !status && !categoryId && !locationId
            ? <Button variant="accent" size="sm" onClick={openAdd}>+ New asset</Button>
            : undefined}
        />
      ) : (
        <>
          <Table>
            <Thead>
              <tr>
                <Th>Code</Th>
                <Th>Name</Th>
                <Th>Category</Th>
                <Th>Location</Th>
                <Th>Status</Th>
                <Th>Serial No.</Th>
                <Th>Added</Th>
              </tr>
            </Thead>
            <Tbody>
              {assets.map(asset => (
                <Tr key={asset.id} onClick={() => navigate(`/assets/${asset.id}`)}>
                  <Td><IdTag>{asset.assetCode}</IdTag></Td>
                  <Td>
                    <span className="font-medium text-[13px]">{asset.name}</span>
                    {asset.manufacturer && (
                      <p className="font-mono text-[10px] text-af-muted mt-0.5">{asset.manufacturer}{asset.model ? ` · ${asset.model}` : ''}</p>
                    )}
                  </Td>
                  <Td muted>{asset.category?.name ?? '—'}</Td>
                  <Td muted>{asset.location?.name ?? '—'}</Td>
                  <Td><StatusPill status={asset.status} /></Td>
                  <Td mono>{asset.serialNumber ?? '—'}</Td>
                  <Td muted>{formatDate(asset.createdAt)}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>

          {total > 20 && (
            <Pagination
              page={page}
              perPage={20}
              total={total}
              onPage={setPage}
            />
          )}
        </>
      )}

      <AssetFormModal
        open={showForm}
        onClose={() => setShowForm(false)}
        asset={editAsset}
      />
    </div>
  )
}
