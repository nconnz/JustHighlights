'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'

type MatchRow = {
  id: string
  home_team_id: string
  away_team_id: string
  match_date: string
  match_time: string
}

function newRow(): MatchRow {
  return { id: crypto.randomUUID(), home_team_id: '', away_team_id: '', match_date: '', match_time: '' }
}

function incrementRound(round: string): string {
  const match = round.match(/^(.*?)(\d+)(\D*)$/)
  if (match) return `${match[1]}${parseInt(match[2]) + 1}${match[3]}`
  return round
}

const inputStyle = {
  width: '100%',
  padding: '8px 10px',
  background: '#1d2025',
  border: '1px solid rgba(70,72,77,0.4)',
  borderRadius: '8px',
  color: '#f6f6fc',
  fontSize: '13px',
  boxSizing: 'border-box' as const,
  outline: 'none',
}

const labelStyle = {
  display: 'block',
  fontSize: '10px',
  color: '#aaabb0',
  fontFamily: 'Lexend',
  marginBottom: '5px',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.05em',
}

export default function FixtureManager() {
  const [categories, setCategories] = useState<any[]>([])
  const [teams, setTeams] = useState<any[]>([])
  const [recentFixtures, setRecentFixtures] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savedCount, setSavedCount] = useState<number | null>(null)

  const [competition, setCompetition] = useState('')
  const [season, setSeason] = useState('2026')
  const [round, setRound] = useState('')
  const [matches, setMatches] = useState<MatchRow[]>([newRow()])

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    const [{ data: cats }, { data: teamData }, { data: fixtureData }] = await Promise.all([
      supabase.from('categories').select('*').eq('level', 1).order('name'),
      supabase.from('teams').select('*').order('name'),
      supabase.from('fixtures').select(`
        id, round, match_date, season, category_id,
        home_team:teams!fixtures_home_team_id_fkey(name, abbreviation),
        away_team:teams!fixtures_away_team_id_fkey(name, abbreviation)
      `).order('match_date', { ascending: false }).limit(20),
    ])
    setCategories(cats || [])
    setTeams(teamData || [])
    setRecentFixtures(fixtureData || [])
    setLoading(false)
  }

  const filteredTeams = competition
    ? teams.filter(t => t.category_id === parseInt(competition))
    : teams

  function updateMatch(id: string, field: keyof MatchRow, value: string) {
    setMatches(prev => prev.map(m => m.id === id ? { ...m, [field]: value } : m))
  }

  function removeMatch(id: string) {
    setMatches(prev => prev.length > 1 ? prev.filter(m => m.id !== id) : prev)
  }

  function applyDateToAll(date: string) {
    setMatches(prev => prev.map(m => ({ ...m, match_date: date })))
  }

  async function saveRound() {
    if (!competition || !round) {
      alert('Please select a competition and enter a round name.')
      return
    }
    const valid = matches.filter(m => m.home_team_id && m.away_team_id && m.match_date)
    if (valid.length === 0) {
      alert('Add at least one match with teams and a date.')
      return
    }
    setSaving(true)
    const { error } = await supabase.from('fixtures').insert(
      valid.map(m => ({
        category_id: parseInt(competition),
        season: parseInt(season),
        round,
        home_team_id: parseInt(m.home_team_id),
        away_team_id: parseInt(m.away_team_id),
        match_date: m.match_date,
        match_time: m.match_time || null,
      }))
    )
    setSaving(false)
    if (!error) {
      setSavedCount(valid.length)
      setMatches([newRow()])
      setRound(incrementRound(round))
      fetchData()
      setTimeout(() => setSavedCount(null), 4000)
    }
  }

  async function deleteFixture(id: number) {
    if (!confirm('Delete this fixture?')) return
    await supabase.from('fixtures').delete().eq('id', id)
    fetchData()
  }

  if (loading) return <p style={{ color: '#aaabb0', fontFamily: 'Lexend', fontSize: '13px' }}>Loading...</p>

  return (
    <div>
      {/* Round builder */}
      <div style={{ background: '#111318', borderRadius: '12px', padding: '20px', border: '1px solid rgba(70,72,77,0.2)', marginBottom: '24px' }}>

        {/* Series config — sticky across saves */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '20px' }}>
          <div>
            <label style={labelStyle}>Competition *</label>
            <select
              value={competition}
              onChange={e => { setCompetition(e.target.value); setMatches([newRow()]) }}
              style={inputStyle}
            >
              <option value="">Select...</option>
              {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Season *</label>
            <input
              type="number"
              value={season}
              onChange={e => setSeason(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Round *</label>
            <div style={{ display: 'flex', gap: '6px' }}>
              <input
                type="text"
                placeholder="e.g. Round 1"
                value={round}
                onChange={e => setRound(e.target.value)}
                style={{ ...inputStyle, flex: 1 }}
              />
              <button
                onClick={() => setRound(incrementRound(round))}
                title="Next round"
                style={{ padding: '8px 10px', background: '#1d2025', border: '1px solid rgba(70,72,77,0.4)', borderRadius: '8px', color: '#9cff93', cursor: 'pointer', fontSize: '16px', lineHeight: 1 }}
              >
                +1
              </button>
            </div>
          </div>
        </div>

        {/* Match rows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
          {matches.map((match, index) => (
            <div key={match.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 140px 110px auto', gap: '8px', alignItems: 'end', background: '#1a1d23', borderRadius: '10px', padding: '10px' }}>
              <div>
                {index === 0 && <label style={labelStyle}>Home Team</label>}
                <select
                  value={match.home_team_id}
                  onChange={e => updateMatch(match.id, 'home_team_id', e.target.value)}
                  style={inputStyle}
                >
                  <option value="">Home team...</option>
                  {filteredTeams.filter(t => t.id !== parseInt(match.away_team_id)).map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div>
                {index === 0 && <label style={labelStyle}>Away Team</label>}
                <select
                  value={match.away_team_id}
                  onChange={e => updateMatch(match.id, 'away_team_id', e.target.value)}
                  style={inputStyle}
                >
                  <option value="">Away team...</option>
                  {filteredTeams.filter(t => t.id !== parseInt(match.home_team_id)).map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div>
                {index === 0 && (
                  <label style={labelStyle}>
                    Date
                    {match.match_date && (
                      <button
                        onClick={() => applyDateToAll(match.match_date)}
                        style={{ marginLeft: '6px', background: 'none', border: 'none', color: '#9cff93', fontSize: '9px', cursor: 'pointer', fontFamily: 'Lexend', textTransform: 'uppercase', letterSpacing: '0.05em', padding: 0 }}
                      >
                        Apply to all
                      </button>
                    )}
                  </label>
                )}
                <input
                  type="date"
                  value={match.match_date}
                  onChange={e => updateMatch(match.id, 'match_date', e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div>
                {index === 0 && <label style={labelStyle}>Time</label>}
                <input
                  type="time"
                  value={match.match_time}
                  onChange={e => updateMatch(match.id, 'match_time', e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div style={{ display: 'flex', alignItems: index === 0 ? 'flex-end' : 'center', paddingBottom: index === 0 ? '1px' : 0 }}>
                <button
                  onClick={() => removeMatch(match.id)}
                  disabled={matches.length === 1}
                  style={{ background: 'none', border: 'none', color: matches.length === 1 ? '#46484d' : '#ff7351', cursor: matches.length === 1 ? 'default' : 'pointer', fontSize: '18px', lineHeight: 1, padding: '6px' }}
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Row actions */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            onClick={() => setMatches(prev => [...prev, newRow()])}
            style={{ padding: '8px 16px', background: 'transparent', border: '1px dashed rgba(156,255,147,0.4)', borderRadius: '8px', color: '#9cff93', fontSize: '12px', fontFamily: 'Lexend', cursor: 'pointer', fontWeight: 600 }}
          >
            + Add match
          </button>

          <div style={{ flex: 1 }} />

          {savedCount !== null && (
            <span style={{ color: '#9cff93', fontSize: '12px', fontFamily: 'Lexend' }}>
              ✓ {savedCount} fixture{savedCount !== 1 ? 's' : ''} saved — round advanced
            </span>
          )}

          <button
            onClick={saveRound}
            disabled={saving}
            style={{ padding: '10px 24px', background: saving ? '#1d2025' : '#9cff93', color: saving ? '#aaabb0' : '#006413', border: 'none', borderRadius: '8px', fontSize: '13px', fontFamily: 'Lexend', fontWeight: 700, cursor: saving ? 'default' : 'pointer', textTransform: 'uppercase', letterSpacing: '0.05em' }}
          >
            {saving ? 'Saving...' : `Save ${matches.filter(m => m.home_team_id && m.away_team_id && m.match_date).length || ''} Fixtures`}
          </button>
        </div>
      </div>

      {/* Recent fixtures */}
      <h3 style={{ fontFamily: 'Space Grotesk', fontSize: '14px', fontWeight: 700, color: '#f6f6fc', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Recent Fixtures
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {recentFixtures.map((f: any) => (
          <div key={f.id} style={{ background: '#111318', borderRadius: '10px', padding: '12px 16px', border: '1px solid rgba(70,72,77,0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ margin: 0, fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: '13px', color: '#f6f6fc' }}>
                {f.home_team?.abbreviation} vs {f.away_team?.abbreviation}
              </p>
              <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#aaabb0', fontFamily: 'Lexend' }}>
                {f.round} · {f.season} · {f.match_date ? new Date(f.match_date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' }) : ''}
              </p>
            </div>
            <button
              onClick={() => deleteFixture(f.id)}
              style={{ color: '#ff7351', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', fontFamily: 'Lexend' }}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
