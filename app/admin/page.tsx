'use client'

import { useState } from 'react'
import FixtureManager from './components/FixtureManager'
import VideoManager from './components/VideoManager'
import SportManager from './components/SportManager'

//Change password here
const ADMIN_PASSWORD = 'velocity2026'

export default function AdminPage() {
  const [password, setPassword] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [activeTab, setActiveTab] = useState('videos')
  const [error, setError] = useState('')

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
      setError('')
    } else {
      setError('Incorrect password')
    }
  }

  if (!isAuthenticated) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}>
        <div style={{
          width: '100%',
          maxWidth: '360px',
          background: '#111318',
          borderRadius: '16px',
          padding: '32px',
          border: '1px solid rgba(70,72,77,0.3)',
        }}>
          <h1 style={{
            fontFamily: 'Space Grotesk',
            fontSize: '24px',
            fontWeight: 900,
            color: '#9cff93',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            marginBottom: '8px',
          }}>
            VELOCITY
          </h1>
          <p style={{ color: '#aaabb0', fontSize: '13px', marginBottom: '24px', fontFamily: 'Lexend' }}>
            Admin dashboard
          </p>

          <div style={{ marginBottom: '12px' }}>
            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              style={{
                width: '100%',
                padding: '12px',
                background: '#1d2025',
                border: '1px solid rgba(70,72,77,0.4)',
                borderRadius: '8px',
                color: '#f6f6fc',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {error && (
            <p style={{ color: '#ff7351', fontSize: '12px', marginBottom: '12px', fontFamily: 'Lexend' }}>
              {error}
            </p>
          )}

          <button
            onClick={handleLogin}
            style={{
              width: '100%',
              padding: '12px',
              background: '#9cff93',
              color: '#006413',
              border: 'none',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 700,
              fontFamily: 'Lexend',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              cursor: 'pointer',
            }}
          >
            Sign in
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 16px' }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontFamily: 'Space Grotesk', fontSize: '28px', fontWeight: 900, color: '#9cff93', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
            VELOCITY Admin
          </h1>
          <p style={{ color: '#aaabb0', fontSize: '13px', margin: '4px 0 0', fontFamily: 'Lexend' }}>
            Manage sports, fixtures and video links
          </p>
        </div>
        <button
          onClick={() => setIsAuthenticated(false)}
          style={{ color: '#aaabb0', background: 'none', border: '1px solid rgba(70,72,77,0.4)', borderRadius: '8px', padding: '8px 16px', cursor: 'pointer', fontSize: '12px', fontFamily: 'Lexend' }}
        >
          Sign out
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', borderBottom: '1px solid rgba(70,72,77,0.2)', paddingBottom: '0' }}>
        {[
          { id: 'videos', label: 'Video Links' },
          { id: 'fixtures', label: 'Fixtures' },
          { id: 'sports', label: 'Sports & Teams' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '10px 16px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === tab.id ? '2px solid #9cff93' : '2px solid transparent',
              color: activeTab === tab.id ? '#9cff93' : '#aaabb0',
              fontSize: '13px',
              fontFamily: 'Lexend',
              fontWeight: 600,
              cursor: 'pointer',
              marginBottom: '-1px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'videos' && <VideoManager />}
      {activeTab === 'fixtures' && <FixtureManager />}
      {activeTab === 'sports' && <SportManager />}

    </div>
  )
}