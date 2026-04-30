'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '../../../lib/supabase'

type EmbedStatus = 'unchecked' | 'checking' | 'ok' | 'restricted' | 'unavailable'

function getYouTubeId(url: string) {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/)
  return match ? match[1] : null
}

declare global {
  interface Window {
    YT: any
    onYouTubeIframeAPIReady: () => void
  }
}

export default function VideoManager() {
  const [fixtures, setFixtures] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<number | null>(null)
  const [urls, setUrls] = useState<Record<number, string>>({})
  const [filter, setFilter] = useState('all')
  const [categories, setCategories] = useState<any[]>([])
  const [embedStatus, setEmbedStatus] = useState<Record<number, EmbedStatus>>({})
  const ytApiReady = useRef(false)
  const ytApiLoading = useRef(false)
  const pendingChecks = useRef<Array<() => void>>([])

  const loadYTApi = useCallback(() => {
    return new Promise<void>((resolve) => {
      if (ytApiReady.current) { resolve(); return }
      pendingChecks.current.push(resolve)
      if (ytApiLoading.current) return
      ytApiLoading.current = true
      const prev = window.onYouTubeIframeAPIReady
      window.onYouTubeIframeAPIReady = () => {
        ytApiReady.current = true
        if (prev) prev()
        pendingChecks.current.forEach(fn => fn())
        pendingChecks.current = []
      }
      const script = document.createElement('script')
      script.src = 'https://www.youtube.com/iframe_api'
      document.head.appendChild(script)
    })
  }, [])

  const checkEmbedStatus = useCallback(async (fixtureId: number, url: string) => {
    const videoId = getYouTubeId(url)
    if (!videoId) return
    setEmbedStatus(prev => ({ ...prev, [fixtureId]: 'checking' }))
    await loadYTApi()
    const container = document.createElement('div')
    container.style.cssText = 'position:absolute;width:1px;height:1px;opacity:0;pointer-events:none;overflow:hidden'
    document.body.appendChild(container)
    new window.YT.Player(container, {
      videoId,
      events: {
        onReady: () => {
          setEmbedStatus(prev => ({ ...prev, [fixtureId]: 'ok' }))
          container.remove()
        },
        onError: (e: any) => {
          // 101 and 150 = embedding disabled by owner; 100/150 also covers unavailable
          const restricted = e.data === 101 || e.data === 150
          setEmbedStatus(prev => ({ ...prev, [fixtureId]: restricted ? 'restricted' : 'unavailable' }))
          container.remove()
        },
      },
    })
  }, [loadYTApi])

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    const { data: cats } = await supabase
      .from('categories')
      .select('*')
      .eq('level', 1)
      .order('name')

    setCategories(cats || [])

    const { data } = await supabase
      .from('fixtures')
      .select(`
        id, round, match_date, youtube_url, category_id,
        home_team:teams!fixtures_home_team_id_fkey(id, name, abbreviation, colour_primary),
        away_team:teams!fixtures_away_team_id_fkey(id, name, abbreviation, colour_primary)
      `)
      .order('match_date', { ascending: false })

    setFixtures(data || [])
    const initialUrls: Record<number, string> = {}
    data?.forEach((f: any) => {
      initialUrls[f.id] = f.youtube_url || ''
    })
    setUrls(initialUrls)
    setLoading(false)
  }

  async function saveUrl(fixtureId: number) {
    setSaving(fixtureId)
    await supabase
      .from('fixtures')
      .update({ youtube_url: urls[fixtureId] || null })
      .eq('id', fixtureId)
    setSaving(null)
    const url = urls[fixtureId]
    if (url) checkEmbedStatus(fixtureId, url)
    else setEmbedStatus(prev => ({ ...prev, [fixtureId]: 'unchecked' }))
  }

  const filtered = filter === 'all'
    ? fixtures
    : filter === 'missing'
    ? fixtures.filter(f => !f.youtube_url)
    : fixtures.filter(f => f.category_id === parseInt(filter))

  if (loading) return <p style={{ color: '#aaabb0', fontFamily: 'Lexend', fontSize: '13px' }}>Loading fixtures...</p>

  return (
    <div>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <button
          onClick={() => setFilter('all')}
          style={{ padding: '6px 14px', borderRadius: '20px', border: '1px solid rgba(70,72,77,0.4)', background: filter === 'all' ? '#9cff93' : 'transparent', color: filter === 'all' ? '#006413' : '#aaabb0', fontSize: '11px', fontFamily: 'Lexend', cursor: 'pointer', fontWeight: 600 }}
        >
          All
        </button>
        <button
          onClick={() => setFilter('missing')}
          style={{ padding: '6px 14px', borderRadius: '20px', border: '1px solid rgba(70,72,77,0.4)', background: filter === 'missing' ? '#9cff93' : 'transparent', color: filter === 'missing' ? '#006413' : '#aaabb0', fontSize: '11px', fontFamily: 'Lexend', cursor: 'pointer', fontWeight: 600 }}
        >
          Missing video
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setFilter(String(cat.id))}
            style={{ padding: '6px 14px', borderRadius: '20px', border: '1px solid rgba(70,72,77,0.4)', background: filter === String(cat.id) ? '#9cff93' : 'transparent', color: filter === String(cat.id) ? '#006413' : '#aaabb0', fontSize: '11px', fontFamily: 'Lexend', cursor: 'pointer', fontWeight: 600 }}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {filtered.map((fixture: any) => {
          const status = embedStatus[fixture.id] ?? 'unchecked'
          const hasUrl = !!urls[fixture.id]
          const statusConfig: Record<EmbedStatus, { label: string; color: string; bg: string }> = {
            unchecked:   { label: 'Not checked',  color: '#aaabb0', bg: 'rgba(70,72,77,0.2)' },
            checking:    { label: 'Checking…',    color: '#f6c90e', bg: 'rgba(246,201,14,0.1)' },
            ok:          { label: 'Embeddable',   color: '#9cff93', bg: 'rgba(156,255,147,0.1)' },
            restricted:  { label: 'Restricted',   color: '#ff7351', bg: 'rgba(255,115,81,0.1)' },
            unavailable: { label: 'Unavailable',  color: '#ff7351', bg: 'rgba(255,115,81,0.1)' },
          }
          const { label, color, bg } = statusConfig[status]

          return (
            <div key={fixture.id} style={{
              background: '#111318',
              borderRadius: '12px',
              padding: '14px 16px',
              border: status === 'restricted' ? '1px solid rgba(255,115,81,0.35)' : '1px solid rgba(70,72,77,0.2)',
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto auto', gap: '12px', alignItems: 'center' }}>
                <div>
                  <p style={{ margin: 0, fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: '13px', color: '#f6f6fc' }}>
                    {fixture.home_team?.abbreviation} vs {fixture.away_team?.abbreviation}
                  </p>
                  <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#aaabb0', fontFamily: 'Lexend' }}>
                    {fixture.round} · {fixture.match_date ? new Date(fixture.match_date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' }) : ''}
                  </p>
                </div>

                <input
                  type="text"
                  placeholder="https://youtube.com/watch?v=..."
                  value={urls[fixture.id] || ''}
                  onChange={(e) => {
                    setUrls(prev => ({ ...prev, [fixture.id]: e.target.value }))
                    setEmbedStatus(prev => ({ ...prev, [fixture.id]: 'unchecked' }))
                  }}
                  style={{
                    padding: '8px 12px',
                    background: '#1d2025',
                    border: '1px solid rgba(70,72,77,0.4)',
                    borderRadius: '8px',
                    color: '#f6f6fc',
                    fontSize: '12px',
                    outline: 'none',
                    width: '100%',
                    boxSizing: 'border-box',
                  }}
                />

                <button
                  onClick={() => saveUrl(fixture.id)}
                  disabled={saving === fixture.id}
                  style={{
                    padding: '8px 16px',
                    background: saving === fixture.id ? '#1d2025' : hasUrl ? '#9cff93' : '#1d2025',
                    color: saving === fixture.id ? '#aaabb0' : hasUrl ? '#006413' : '#aaabb0',
                    border: '1px solid rgba(70,72,77,0.4)',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontFamily: 'Lexend',
                    fontWeight: 600,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {saving === fixture.id ? 'Saving…' : 'Save'}
                </button>

                <button
                  onClick={() => hasUrl && checkEmbedStatus(fixture.id, urls[fixture.id])}
                  disabled={!hasUrl || status === 'checking'}
                  title="Check if this video can be embedded"
                  style={{
                    padding: '8px',
                    background: bg,
                    color,
                    border: `1px solid ${color}40`,
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontFamily: 'Lexend',
                    fontWeight: 600,
                    cursor: hasUrl && status !== 'checking' ? 'pointer' : 'default',
                    whiteSpace: 'nowrap',
                    opacity: hasUrl ? 1 : 0.4,
                  }}
                >
                  {status === 'checking' ? '…' : label}
                </button>
              </div>

              {status === 'restricted' && (
                <p style={{ margin: '8px 0 0', fontSize: '11px', color: '#ff7351', fontFamily: 'Lexend' }}>
                  This video cannot be embedded on external sites. Replace it with a video that allows embedding.
                </p>
              )}
              {status === 'unavailable' && (
                <p style={{ margin: '8px 0 0', fontSize: '11px', color: '#ff7351', fontFamily: 'Lexend' }}>
                  Video is unavailable (private, deleted, or region-locked).
                </p>
              )}
            </div>
          )
        })}

        {filtered.length === 0 && (
          <p style={{ color: '#aaabb0', fontFamily: 'Lexend', fontSize: '13px' }}>No fixtures found.</p>
        )}
      </div>
    </div>
  )
}