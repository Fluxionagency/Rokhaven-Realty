'use client'

/**
 * /admin/import — Expert Listing Auto-Import Dashboard
 *
 * Protected by middleware (ADMIN role only).
 * Shows sync status, all imported properties, and lets you publish them to RokHaven.
 */

import { useEffect, useState, useCallback } from 'react'

// ── Types ─────────────────────────────────────────────────────
interface ImportedProperty {
  id: string
  expertlistingId: number
  expertlistingUrl: string
  expertlistingRefId: string | null
  title: string
  description: string
  price: string
  currency: string
  transactionType: string
  propertyType: string
  bedroomCount: number
  bathroomCount: number
  neighborhood: string
  lcda: string
  state: string
  fullAddress: string
  features: string   // JSON string
  images: string     // JSON string
  coverImage: string | null
  isVerified: boolean
  status: string     // PENDING | PUBLISHED | ARCHIVED
  publishedPropertyId: string | null
  createdAt: string
}

interface SyncLog {
  id: string
  startedAt: string
  finishedAt: string | null
  newCount: number
  skippedCount: number
  errorCount: number
  status: string
  errorMessage: string | null
}

// ── Helpers ────────────────────────────────────────────────────
function parseJson(str: string): string[] {
  try { return JSON.parse(str) } catch { return [] }
}

function formatPrice(price: string): string {
  const n = Number(price)
  if (!n) return '—'
  return `₦${n.toLocaleString('en-NG')}`
}

function formatDate(d: string): string {
  return new Date(d).toLocaleDateString('en-NG', { dateStyle: 'medium' })
}

// ── Component ──────────────────────────────────────────────────
export default function ImportPage() {
  const [properties, setProperties] = useState<ImportedProperty[]>([])
  const [lastLog, setLastLog] = useState<SyncLog | null>(null)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [syncMsg, setSyncMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'PUBLISHED'>('ALL')
  const [publishing, setPublishing] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/expertlisting/imports')
      const data = await res.json()
      setProperties(data.imports ?? [])
      setLastLog(data.lastLog ?? null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  async function handleSync() {
    setSyncing(true)
    setSyncMsg(null)
    try {
      const res = await fetch('/api/expertlisting/sync', { method: 'POST' })
      const data = await res.json()
      setSyncMsg(
        data.success
          ? { ok: true, text: `✓ ${data.newCount} new imported, ${data.skippedCount} skipped (unverified)` }
          : { ok: false, text: `✗ ${data.error ?? 'Sync failed'}` }
      )
      if (data.success) await fetchData()
    } catch (e: any) {
      setSyncMsg({ ok: false, text: `✗ ${e.message}` })
    } finally {
      setSyncing(false)
    }
  }

  async function handlePublish(importId: string) {
    setPublishing(importId)
    try {
      const res = await fetch(`/api/expertlisting/publish/${importId}`, { method: 'POST' })
      const data = await res.json()
      if (data.success) {
        setSyncMsg({ ok: true, text: '✓ Property published to RokHaven listings!' })
        await fetchData()
      } else {
        setSyncMsg({ ok: false, text: `✗ ${data.error ?? 'Publish failed'}` })
      }
    } catch (e: any) {
      setSyncMsg({ ok: false, text: `✗ ${e.message}` })
    } finally {
      setPublishing(null)
    }
  }

  const filtered = properties.filter((p) =>
    filter === 'ALL' ? true : p.status === filter
  )

  const publishedCount = properties.filter((p) => p.status === 'PUBLISHED').length
  const pendingCount   = properties.filter((p) => p.status === 'PENDING').length

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0A', color: '#fff', padding: '40px 32px', fontFamily: 'inherit' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 600, margin: 0 }}>Expert Listing Import</h1>
            <p style={{ color: '#777', fontSize: 13, marginTop: 4 }}>
              Auto-syncs "Direct to Owner's Agent" verified listings every 30 minutes
            </p>
          </div>
          <button
            onClick={handleSync}
            disabled={syncing}
            style={{
              background: syncing ? '#555' : '#B8973A',
              color: syncing ? '#aaa' : '#000',
              border: 'none', borderRadius: 8, padding: '10px 20px',
              fontWeight: 600, fontSize: 13, cursor: syncing ? 'default' : 'pointer',
            }}
          >
            {syncing ? '⟳ Syncing…' : '↻ Sync Now'}
          </button>
        </div>

        {/* Sync result */}
        {syncMsg && (
          <div style={{
            marginBottom: 20, padding: '10px 14px', borderRadius: 8, fontSize: 13,
            background: syncMsg.ok ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
            border: `1px solid ${syncMsg.ok ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
            color: syncMsg.ok ? '#4ade80' : '#f87171',
          }}>
            {syncMsg.text}
          </div>
        )}

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 24 }}>
          {[
            { label: 'Total Imported', value: properties.length, color: '#fff' },
            { label: 'Published', value: publishedCount, color: '#B8973A' },
            { label: 'Pending Review', value: pendingCount, color: '#60a5fa' },
            {
              label: 'Last Sync',
              value: lastLog?.finishedAt ? formatDate(lastLog.finishedAt) : 'Never',
              color: '#aaa',
              small: true,
            },
          ].map(({ label, value, color, small }) => (
            <div key={label} style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: 12, padding: '16px 18px' }}>
              <p style={{ color: '#555', fontSize: 11, margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
              <p style={{ color, fontSize: small ? 13 : 24, fontWeight: 600, margin: 0 }}>{value}</p>
            </div>
          ))}
        </div>

        {/* Last sync log */}
        {lastLog && (
          <div style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: 8, padding: '10px 16px', marginBottom: 20, display: 'flex', gap: 20, alignItems: 'center', fontSize: 13 }}>
            <span style={{ fontWeight: 600, color: lastLog.status === 'COMPLETED' ? '#4ade80' : lastLog.status === 'FAILED' ? '#f87171' : '#fbbf24' }}>
              {lastLog.status}
            </span>
            <span style={{ color: '#555' }}>Last run: {formatDate(lastLog.startedAt)}</span>
            <span>+{lastLog.newCount} new</span>
            <span style={{ color: '#555' }}>{lastLog.skippedCount} skipped</span>
            {lastLog.errorCount > 0 && <span style={{ color: '#f87171' }}>{lastLog.errorCount} errors</span>}
          </div>
        )}

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 4, background: '#111', border: '1px solid #1a1a1a', borderRadius: 8, padding: 4, width: 'fit-content', marginBottom: 20 }}>
          {(['ALL', 'PENDING', 'PUBLISHED'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                background: filter === f ? '#B8973A' : 'transparent',
                color: filter === f ? '#000' : '#888',
                border: 'none', borderRadius: 6, padding: '6px 16px',
                fontSize: 13, fontWeight: 500, cursor: 'pointer',
              }}
            >
              {f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* Properties list */}
        {loading ? (
          <p style={{ color: '#555', textAlign: 'center', padding: 60 }}>Loading…</p>
        ) : filtered.length === 0 ? (
          <div style={{ border: '1px solid #1a1a1a', borderRadius: 12, padding: 60, textAlign: 'center', color: '#555', fontSize: 14 }}>
            {filter === 'ALL' ? 'No properties imported yet. Click "Sync Now" to start.' : `No ${filter.toLowerCase()} properties.`}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map((p) => (
              <PropertyRow
                key={p.id}
                property={p}
                onPublish={() => handlePublish(p.id)}
                publishing={publishing === p.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Property Row ───────────────────────────────────────────────
function PropertyRow({
  property: p,
  onPublish,
  publishing,
}: {
  property: ImportedProperty
  onPublish: () => void
  publishing: boolean
}) {
  const [open, setOpen] = useState(false)
  const images = parseJson(p.images)
  const features = parseJson(p.features)

  return (
    <div style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: 12, overflow: 'hidden' }}>
      {/* Row header */}
      <div
        onClick={() => setOpen(!open)}
        style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 14, cursor: 'pointer' }}
      >
        {/* Cover image */}
        <div style={{ width: 60, height: 60, borderRadius: 8, background: '#1a1a1a', overflow: 'hidden', flexShrink: 0 }}>
          {p.coverImage
            ? <img src={p.coverImage} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#444', fontSize: 11 }}>No img</div>
          }
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontWeight: 500, fontSize: 14, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</p>
          <p style={{ color: '#666', fontSize: 12, margin: '2px 0 0' }}>{p.fullAddress}</p>
          <p style={{ color: '#444', fontSize: 11, margin: '2px 0 0' }}>{p.expertlistingRefId} · {formatDate(p.createdAt)}</p>
        </div>

        {/* Price */}
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <p style={{ color: '#B8973A', fontWeight: 600, fontSize: 14, margin: 0 }}>{formatPrice(p.price)}</p>
          <p style={{ color: '#666', fontSize: 12, margin: 0, textTransform: 'capitalize' }}>{p.transactionType}</p>
        </div>

        {/* Beds/Baths */}
        <div style={{ color: '#777', fontSize: 12, flexShrink: 0, display: 'flex', gap: 12 }}>
          <span>{p.bedroomCount} Beds</span>
          <span>{p.bathroomCount} Baths</span>
        </div>

        {/* Status badge */}
        <div style={{ flexShrink: 0 }}>
          <span style={{
            fontSize: 11, padding: '3px 10px', borderRadius: 20,
            background: p.status === 'PUBLISHED' ? 'rgba(34,197,94,0.1)' : 'rgba(96,165,250,0.1)',
            border: `1px solid ${p.status === 'PUBLISHED' ? 'rgba(34,197,94,0.3)' : 'rgba(96,165,250,0.3)'}`,
            color: p.status === 'PUBLISHED' ? '#4ade80' : '#60a5fa',
          }}>
            {p.status === 'PUBLISHED' ? 'Published' : 'Pending'}
          </span>
        </div>

        <span style={{ color: '#555', fontSize: 12 }}>{open ? '▲' : '▼'}</span>
      </div>

      {/* Expanded details */}
      {open && (
        <div style={{ borderTop: '1px solid #1a1a1a', padding: '16px 14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div>
              <p style={{ color: '#555', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 6px' }}>Description</p>
              <p style={{ color: '#aaa', fontSize: 13, lineHeight: 1.6, whiteSpace: 'pre-wrap', margin: 0 }}>
                {p.description || 'No description.'}
              </p>
            </div>
            <div>
              <p style={{ color: '#555', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 6px' }}>Features</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {features.length > 0
                  ? features.map((f) => (
                    <span key={f} style={{ background: '#1a1a1a', color: '#888', fontSize: 12, padding: '3px 8px', borderRadius: 4 }}>{f}</span>
                  ))
                  : <span style={{ color: '#555', fontSize: 13 }}>None listed</span>
                }
              </div>
            </div>

            {/* Images */}
            {images.length > 0 && (
              <div style={{ gridColumn: '1/-1' }}>
                <p style={{ color: '#555', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 8px' }}>Photos ({images.length})</p>
                <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
                  {images.map((img, i) => (
                    <img key={i} src={img} alt={`Photo ${i + 1}`}
                      style={{ width: 96, height: 64, borderRadius: 6, objectFit: 'cover', flexShrink: 0, border: '1px solid #1a1a1a' }} />
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div style={{ gridColumn: '1/-1', display: 'flex', gap: 10, paddingTop: 8 }}>
              <a href={p.expertlistingUrl} target="_blank" rel="noopener noreferrer"
                style={{ fontSize: 12, border: '1px solid #333', color: '#888', padding: '7px 14px', borderRadius: 8, textDecoration: 'none' }}>
                View on Expert Listing ↗
              </a>
              {p.status !== 'PUBLISHED' && (
                <button
                  onClick={onPublish}
                  disabled={publishing}
                  style={{
                    fontSize: 12, background: publishing ? '#555' : '#B8973A',
                    color: publishing ? '#aaa' : '#000',
                    border: 'none', padding: '7px 16px', borderRadius: 8,
                    fontWeight: 600, cursor: publishing ? 'default' : 'pointer',
                  }}
                >
                  {publishing ? 'Publishing…' : 'Publish to RokHaven'}
                </button>
              )}
              {p.status === 'PUBLISHED' && p.publishedPropertyId && (
                <a href={`/listings/${p.publishedPropertyId}`} target="_blank"
                  style={{ fontSize: 12, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', color: '#4ade80', padding: '7px 14px', borderRadius: 8, textDecoration: 'none' }}>
                  View on RokHaven ↗
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
