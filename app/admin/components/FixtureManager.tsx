'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'

export default function FixtureManager() {
  const [categories, setCategories] = useState<any[]>([])
  const [teams, setTeams] = useState<any[]>([])
  const [fixtures, setFixtures] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [form, setForm] = useState({
    category_id: '',
    season: '2026',
    round: '',
    home_team_id: '',
    away_team_id: '',
    match_date: '',
    match_time: '',
  })

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    const { data: cats } = await supabase
      .from('categories')
      .select('*')
      .eq('level', 1)
      .order('name')

    const { data: teamData } = await supabase
      .from('teams')
      .select('*')
      .order('name')

    const { data: fixtureData } = await supabase
      .from('fixtures')
      .select(`
        id, round, match_date, season, category_id,
        home_team:teams!fixtures_home_team_id_fkey(name, abbreviation),
        away_team:teams!fixtures_away_team_id_fkey(name, abbreviation)
      `)
      .order('match_date', { ascending: false })
      .limit(20)

    setCategories(cats || [])
    setTeams(teamData || [])
    setFixtures(fixtureData || [])
    setLoading(false)
  }

  const filteredTeams = form.category_id
    ? teams.filter(t => t.category_id === parseInt(form.category_id))
    : teams

  async function handleSubmit() {
    if (!form.category_id || !form.round || !form.home_team_id || !form.away_team_id || !form.match_date) {
      alert('Please fill in all required fields')
      return
    }
    setSaving(true)
    const { error } = await supabase.from('fixtures').insert({
      category_id: parseInt(form.category_id),
      season: parseInt(form.season),
      round: form.round,
      home_team_id: parseInt(form.home_team_id),
      away_team_id: parseInt(form.away_team_id),
      match_date: form.match_date,
      match_time: form.match_time || null,
    })
    setSaving(false)
    if (!error) {
      setSuccess('Fixture added successfully')
      setForm(prev => ({ ...prev, round: '', home_team_id: '', away_team_id: '', match_date: '', match_time: '' }))
      fetchData()
      setTimeout(() => setSuccess(''), 3000)
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
      {/* Add fixture form */}
      <div style={{ background: '#111318', borderRadius: '12px', padding: '20px', border: '1px solid rgba(70,72,77,0.2)', marginBottom: '24px' }}>
        <h3 style={{ fontFamily: 'Space Grotesk', fontSize: '16px', fontWeight: 700, color: '#f6f6fc', margin: '0 0 16px', textTransform: 'uppercase' }}>
          Add Fixture
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#aaabb0', fontFamily: 'Lexend', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Competition *</label>
            <select
              value={form.category_id}
              onChange={(e) => setForm(prev => ({ ...prev, category_id: e.target.value, home_team_id: '', away_team_id: '' }))}
              style={{ width: '100%', padding: '10px', background: '#1d2025', border: '1px solid rgba(70,72,77,0.4)', borderRadius: '8px', color: '#f6f6fc', fontSize: '13px', boxSizing: 'border-box' }}
            >
              <option value="">Select...</option>
              {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#aaabb0', fontFamily: 'Lexend', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Season *</label>
            <input
              type="number"
              value={form.season}
              onChange={(e) => setForm(prev => ({ ...prev, season: e.target.value }))}
              style={{ width: '100%', padding: '10px', background: '#1d2025', border: '1px solid rgba(70,72,77,0.4)', borderRadius: '8px', color: '#f6f6fc', fontSize: '13px', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#aaabb0', fontFamily: 'Lexend', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Round *</label>
            <input
              type="text"
              placeholder="e.g. Round 2"
              value={form.round}
              onChange={(e) => setForm(prev => ({ ...prev, round: e.target.value }))}
              style={{ width: '100%', padding: '10px', background: '#1d2025', border: '1px solid rgba(70,72,77,0.4)', borderRadius: '8px', color: '#f6f6fc', fontSize: '13px', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#aaabb0', fontFamily: 'Lexend', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Home Team *</label>
            <select
              value={form.home_team_id}
              onChange={(e) => setForm(prev => ({ ...prev, home_team_id: e.target.value }))}
              style={{ width: '100%', padding: '10px', background: '#1d2025', border: '1px solid rgba(70,72,77,0.4)', borderRadius: '8px', color: '#f6f6fc', fontSize: '13px', boxSizing: 'border-box' }}
            >
              <option value="">Select...</option>
              {filteredTeams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#aaabb0', fontFamily: 'Lexend', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Away Team *</label>
            <select
              value={form.away_team_id}
              onChange={(e) => setForm(prev => ({ ...prev, away_team_id: e.target.value }))}
              style={{ width: '100%', padding: '10px', background: '#1d2025', border: '1px solid rgba(70,72,77,0.4)', borderRadius: '8px', color: '#f6f6fc', fontSize: '13px', boxSizing: 'border-box' }}
            >
              <option value="">Select...</option>
              {filteredTeams.filter(t => t.id !== parseInt(form.home_team_id)).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#aaabb0', fontFamily: 'Lexend', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date *</label>
            <input
              type="date"
              value={form.match_date}
              onChange={(e) => setForm(prev => ({ ...prev, match_date: e.target.value }))}
              style={{ width: '100%', padding: '10px', background: '#1d2025', border: '1px solid rgba(70,72,77,0.4)', borderRadius: '8px', color: '#f6f6fc', fontSize: '13px', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#aaabb0', fontFamily: 'Lexend', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Time</label>
            <input
              type="time"
              value={form.match_time}
              onChange={(e) => setForm(prev => ({ ...prev, match_time: e.target.value }))}
              style={{ width: '100%', padding: '10px', background: '#1d2025', border: '1px solid rgba(70,72,77,0.4)', borderRadius: '8px', color: '#f6f6fc', fontSize: '13px', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        {success && <p style={{ color: '#9cff93', fontSize: '12px', fontFamily: 'Lexend', marginBottom: '12px' }}>{success}</p>}

        <button
          onClick={handleSubmit}
          disabled={saving}
          style={{ padding: '10px 24px', background: '#9cff93', color: '#006413', border: 'none', borderRadius: '8px', fontSize: '13px', fontFamily: 'Lexend', fontWeight: 700, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.05em' }}
        >
          {saving ? 'Adding...' : 'Add Fixture'}
        </button>
      </div>

      {/* Recent fixtures */}
      <h3 style={{ fontFamily: 'Space Grotesk', fontSize: '16px', fontWeight: 700, color: '#f6f6fc', margin: '0 0 12px', textTransform: 'uppercase' }}>
        Recent Fixtures
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {fixtures.map((f: any) => (
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