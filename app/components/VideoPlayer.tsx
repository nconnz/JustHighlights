'use client'

import { useState } from 'react'

function getYouTubeId(url: string) {
  const match = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/
  )
  return match ? match[1] : null
}

export default function VideoPlayer({ url }: { url: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const videoId = getYouTubeId(url)
  if (!videoId) return null

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="text-[#9cff93] hover:scale-110 transition-transform"
      >
        <span
          className="material-symbols-outlined"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          play_circle
        </span>
      </button>

      {isOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(0,0,0,0.95)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
          onClick={() => setIsOpen(false)}
        >
          <div
            style={{ width: '100%', maxWidth: '900px' }}
            onClick={(e) => e.stopPropagation()}
          >

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontFamily: 'Lexend', fontSize: '10px', color: '#9cff93', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 'bold' }}>
                Match Highlights
              </span>
              <button
                onClick={() => setIsOpen(false)}
                style={{ color: '#aaabb0', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div style={{
              position: 'relative',
              width: '100%',
              paddingBottom: '56.25%',
              borderRadius: '12px',
              overflow: 'hidden',
              background: 'black',
            }}>
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&playsinline=1&modestbranding=1`}
                title="Match Highlights"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  border: 'none',
                }}
              />
            </div>

            <p style={{ textAlign: 'center', color: '#aaabb0', fontSize: '12px', marginTop: '12px', fontFamily: 'Lexend' }}>
              Tap outside to close
            </p>

          </div>
        </div>
      )}
    </>
  )
}