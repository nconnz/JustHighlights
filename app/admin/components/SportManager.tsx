'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'

export default function SportManager() {
  const [categories, setCategories] = useState<any[]>([])
  const [teams, setTeams] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [sportForm, setSportForm] = useState({ name: '', slug: '', colour: '#9cff93', parent_id: '', level: '0' })
  const [teamForm, setTeamForm] = useState({ name: '', abbreviation: '', category_id: '', colour_primary: '#9cff93', colour_secondary: '#ffffff', country: 'Australia' })

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    const { data: cats } = await supabase
      .from('categories')
      .select('*')
      .order('level')
      .order('name')

    const { data: teamData } = await supabase
      .from('teams')
      .select('*, category:categories(name)')
      .order('name')

    setCategories(cats || [])
    setTeams(teamData || [])
    setLoading(false)
  }

  async function addCategory() {
    if (!sportForm.name || !sportForm.slug) return
    setSaving(true)
    const { error } = await supabase.from('categories').insert({
      name: sportForm.name,
      slug: sportForm.slug.toLowerCase().replace(/\s+/g, '-'),
      colour: sportForm.colour,
      parent_id: sportForm.parent_id ? parseInt(sportForm.parent_id) : null,
      level: parseInt(sportForm.level),
    })
    setSaving(false)
    if (!error) {
      setSuccess('Category added')
      setSportForm({ name: '', slug: '', colour: '#9cff93', parent_id: '', level: '0' })
      fetchData()
      setTimeout(() => setSuccess(''), 3000)
    }
  }

  async function addTeam() {
    if (!teamForm.name || !teamForm.abbreviation || !teamForm.category_id) return
    setSaving(true)
    const { error } = await supabase.from('teams').insert({
      name: teamForm.name,
      abbreviation: teamForm.abbreviation.toUpperCase(),
      category_id: parseInt(teamForm.category_id),
      colour_primary: teamForm.colour_primary,
      colour_secondary: teamForm.colour_secondary,
      country: teamForm.country,
    })
    setSaving(false)
    if (!error) {
      setSuccess('Team added')
      setTeamForm(prev => ({ ...prev, name: '', abbreviation: '' }))
      fetchData()
      setTimeout(() => setSuccess(''), 3000)
    }
  }

  const leagues = categories.filter(c => c.level === 1)

  if (loading) return <p style={{ color: '#aaabb0', fontFamily: 'Lexend', fontSize: '13px' }}>Loading...</p>

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>

      {/* Add Sport / League */}
      <div style={{ background: '#111318', borderRadius: '12px', padding: '20px', border: '1px solid rgba(70,72,77,0.2)' }}>
        <h3 style={{ fontFamily: 'Space Grotesk', fontSize: '16px', fontWeight: 700, color: '#f6f6fc', margin: '0 0 16px', textTransform: 'uppercase' }}>
          Add Sport or League
        </h3>

        {[
          { label: 'Name *', key: 'name', type: 'text', placeholder: 'e.g. Rugby Union' },
          { label: 'Slug *', key: 'slug', type: 'text', placeholder: 'e.g. rugby-union' },
        ].map(field => (
          <div key={field.key} style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '11px', color: '#aaabb0', fontFamily: 'Lexend', marginBottom: '6px', textTransform: 'uppercase' }}>{field.label}</label>
            <input
              type={field.type}
              placeholder={field.placeholder}
              value={sportForm[field.key as keyof typeof sportForm]}
              onChange={(e) => setSportForm(prev => ({ ...prev, [field.key]: e.target.value }))}
              style={{ width: '100%', padding: '10px', background: '#1d2025', border: '1px solid rgba(70,72,77,0.4)', borderRadius: '8px', color: '#f6f6fc', fontSize: '13px', boxSizing: 'border-box' }}
            />
          </div>
        ))}

        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', fontSize: '11px', color: '#aaabb0', fontFamily: 'Lexend', marginBottom: '6px', textTransform: 'uppercase' }}>Level</label>
          <select
            value={sportForm.level}
            onChange={(e) => setSportForm(prev => ({ ...prev, level: e.target.value }))}
            style={{ width: '100%', padding: '10px', background: '#1d2025', border: '1px solid rgba(70,72,77,0.4)', borderRadius: '8px', color: '#f6f6fc', fontSize: '13px', boxSizing: 'border-box' }}
          >
            <option value="0">Top level sport (e.g. Rugby Union)</option>
            <option value="1">League / Competition (e.g. NRL)</option>
          </select>
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', fontSize: '11px', color: '#aaabb0', fontFamily: 'Lexend', marginBottom: '6px', textTransform: 'uppercase' }}>Parent Sport (if league)</label>
          <select
            value={sportForm.parent_id}
            onChange={(e) => setSportForm(prev => ({ ...prev, parent_id: e.target.value }))}
            style={{ width: '100%', padding: '10px', background: '#1d2025', border: '1px solid rgba(70,72,77,0.4)', borderRadius: '8px', color: '#f6f6fc', fontSize: '13px', boxSizing: 'border-box' }}
          >
            <option value="">None (top level)</option>
            {categories.filter(c => c.level === 0).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '11px', color: '#aaabb0', fontFamily: 'Lexend', marginBottom: '6px', textTransform: 'uppercase' }}>Colour</label>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input type="color" value={sportForm.colour} onChange={(e) => setSportForm(prev => ({ ...prev, colour: e.target.value }))} style={{ width: '40px', height: '40px', padding: '2px', cursor: 'pointer', background: 'none', border: 'none' }} />
            <input type="text" value={sportForm.colour} onChange={(e) => setSportForm(prev => ({ ...prev, colour: e.target.value }))} style={{ flex: 1, padding: '10px', background: '#1d2025', border: '1px solid rgba(70,72,77,0.4)', borderRadius: '8px', color: '#f6f6fc', fontSize: '13px', boxSizing: 'border-box' }} />
          </div>
        </div>

        {success && <p style={{ color: '#9cff93', fontSize: '12px', fontFamily: 'Lexend', marginBottom: '12px' }}>{success}</p>}

        <button onClick={addCategory} disabled={saving} style={{ padding: '10px 24px', background: '#9cff93', color: '#006413', border: 'none', borderRadius: '8px', fontSize: '13px', fontFamily: 'Lexend', fontWeight: 700, cursor: 'pointer', textTransform: 'uppercase' }}>
          {saving ? 'Adding...' : 'Add'}
        </button>
      </div>

      {/* Add Team */}
      <div style={{ background: '#111318', borderRadius: '12px', padding: '20px', border: '1px solid rgba(70,72,77,0.2)' }}>
        <h3 style={{ fontFamily: 'Space Grotesk', fontSize: '16px', fontWeight: 700, color: '#f6f6fc', margin: '0 0 16px', textTransform: 'uppercase' }}>
          Add Team
        </h3>

        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', fontSize: '11px', color: '#aaabb0', fontFamily: 'Lexend', marginBottom: '6px', textTransform: 'uppercase' }}>Competition *</label>
          <select
            value={teamForm.category_id}
            onChange={(e) => setTeamForm(prev => ({ ...prev, category_id: e.target.value }))}
            style={{ width: '100%', padding: '10px', background: '#1d2025', border: '1px solid rgba(70,72,77,0.4)', borderRadius: '8px', color: '#f6f6fc', fontSize: '13px', boxSizing: 'border-box' }}
          >
            <option value="">Select...</option>
            {leagues.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
        </div>

        {[
          { label: 'Team Name *', key: 'name', placeholder: 'e.g. Brisbane Broncos' },
          { label: 'Abbreviation *', key: 'abbreviation', placeholder: 'e.g. BRI' },
          { label: 'Country', key: 'country', placeholder: 'e.g. Australia' },
        ].map(field => (
          <div key={field.key} style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '11px', color: '#aaabb0', fontFamily: 'Lexend', marginBottom: '6px', textTransform: 'uppercase' }}>{field.label}</label>
            <input
              type="text"
              placeholder={field.placeholder}
              value={teamForm[field.key as keyof typeof teamForm]}
              onChange={(e) => setTeamForm(prev => ({ ...prev, [field.key]: e.target.value }))}
              style={{ width: '100%', padding: '10px', background: '#1d2025', border: '1px solid rgba(70,72,77,0.4)', borderRadius: '8px', color: '#f6f6fc', fontSize: '13px', boxSizing: 'border-box' }}
            />
          </div>
        ))}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#aaabb0', fontFamily: 'Lexend', marginBottom: '6px', textTransform: 'uppercase' }}>Primary colour</label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input type="color" value={teamForm.colour_primary} onChange={(e) => setTeamForm(prev => ({ ...prev, colour_primary: e.target.value }))} style={{ width: '40px', height: '40px', padding: '2px', cursor: 'pointer', background: 'none', border: 'none' }} />
              <input type="text" value={teamForm.colour_primary} onChange={(e) => setTeamForm(prev => ({ ...prev, colour_primary: e.target.value }))} style={{ flex: 1, padding: '10px', background: '#1d2025', border: '1px solid rgba(70,72,77,0.4)', borderRadius: '8px', color: '#f6f6fc', fontSize: '13px', boxSizing: 'border-box' }} />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#aaabb0', fontFamily: 'Lexend', marginBottom: '6px', textTransform: 'uppercase' }}>Secondary colour</label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input type="color" value={teamForm.colour_secondary} onChange={(e) => setTeamForm(prev => ({ ...prev, colour_secondary: e.target.value }))} style={{ width: '40px', height: '40px', padding: '2px', cursor: 'pointer', background: 'none', border: 'none' }} />
              <input type="text" value={teamForm.colour_secondary} onChange={(e) => setTeamForm(prev => ({ ...prev, colour_secondary: e.target.value }))} style={{ flex: 1, padding: '10px', background: '#1d2025', border: '1px solid rgba(70,72,77,0.4)', borderRadius: '8px', color: '#f6f6fc', fontSize: '13px', boxSizing: 'border-box' }} />
            </div>
          </div>
        </div>

        {success && <p style={{ color: '#9cff93', fontSize: '12px', fontFamily: 'Lexend', marginBottom: '12px' }}>{success}</p>}

        <button onClick={addTeam} disabled={saving} style={{ padding: '10px 24px', background: '#9cff93', color: '#006413', border: 'none', borderRadius: '8px', fontSize: '13px', fontFamily: 'Lexend', fontWeight: 700, cursor: 'pointer', textTransform: 'uppercase' }}>
          {saving ? 'Adding...' : 'Add Team'}
        </button>
      </div>

    </div>
  )
}