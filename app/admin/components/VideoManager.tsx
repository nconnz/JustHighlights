'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'

export default function VideoManager() {
  const [fixtures, setFixtures] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<number | null>(null)
  const [urls, setUrls] = useState<Record<number, string>>({})
  const [filter, setFilter] = useState('all')
  const [categories, setCategories] = useState<any[]>([])

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
        {filtered.map((fixture: any) => (
          <div key={fixture.id} style={{
            background: '#111318',
            borderRadius: '12px',
            padding: '14px 16px',
            border: '1px solid rgba(70,72,77,0.2)',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr auto',
            gap: '12px',
            alignItems: 'center',
          }}>
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
              onChange={(e) => setUrls(prev => ({ ...prev, [fixture.id]: e.target.value }))}
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
                background: saving === fixture.id ? '#1d2025' : urls[fixture.id] ? '#9cff93' : '#1d2025',
                color: saving === fixture.id ? '#aaabb0' : urls[fixture.id] ? '#006413' : '#aaabb0',
                border: '1px solid rgba(70,72,77,0.4)',
                borderRadius: '8px',
                fontSize: '12px',
                fontFamily: 'Lexend',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {saving === fixture.id ? 'Saving...' : 'Save'}
            </button>
          </div>
        ))}

        {filtered.length === 0 && (
          <p style={{ color: '#aaabb0', fontFamily: 'Lexend', fontSize: '13px' }}>No fixtures found.</p>
        )}
      </div>
    </div>
  )
}