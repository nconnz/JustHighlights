'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

function getYouTubeId(url: string) {
  const match = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/
  )
  return match ? match[1] : null
}

declare global {
  interface Window {
    YT: any
    onYouTubeIframeAPIReady: () => void
    _ytApiLoading?: boolean
    _ytApiCallbacks?: Array<() => void>
  }
}

function loadYTApi(): Promise<void> {
  return new Promise((resolve) => {
    if (window.YT?.Player) { resolve(); return }
    if (!window._ytApiCallbacks) window._ytApiCallbacks = []
    window._ytApiCallbacks.push(resolve)
    if (window._ytApiLoading) return
    window._ytApiLoading = true
    const prev = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      if (prev) prev()
      window._ytApiCallbacks?.forEach(fn => fn())
      window._ytApiCallbacks = []
    }
    const script = document.createElement('script')
    script.src = 'https://www.youtube.com/iframe_api'
    document.head.appendChild(script)
  })
}

export default function VideoPlayer({ url }: { url: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isRestricted, setIsRestricted] = useState(false)
  const playerContainerRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<any>(null)

  const videoId = getYouTubeId(url)

  const handleClose = useCallback(() => {
    setIsOpen(false)
    setIsPlaying(false)
    setIsRestricted(false)
    if (playerRef.current) {
      try { playerRef.current.destroy() } catch {}
      playerRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!isPlaying || !videoId) return
    let cancelled = false
    loadYTApi().then(() => {
      if (cancelled || !playerContainerRef.current) return
      playerRef.current = new window.YT.Player(playerContainerRef.current, {
        videoId,
        playerVars: { autoplay: 1, rel: 0, playsinline: 1, modestbranding: 1 },
        events: {
          onError: (e: any) => {
            if (e.data === 101 || e.data === 150) setIsRestricted(true)
          },
        },
      })
    })
    return () => {
      cancelled = true
      if (playerRef.current) {
        try { playerRef.current.destroy() } catch {}
        playerRef.current = null
      }
    }
  }, [isPlaying, videoId])

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
          onClick={handleClose}
        >
          <div
            style={{ width: '100%', maxWidth: '900px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px',
            }}>
              <span style={{
                fontFamily: 'Lexend',
                fontSize: '10px',
                color: '#9cff93',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                fontWeight: 'bold',
              }}>
                Match Highlights
              </span>
              <button
                onClick={handleClose}
                style={{
                  color: '#aaabb0',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                }}
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
              background: '#111318',
              border: '1px solid rgba(70,72,77,0.3)',
            }}>
              {!isPlaying ? (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '16px',
                    cursor: 'pointer',
                    background: 'linear-gradient(135deg, #111318 0%, #1d2025 100%)',
                  }}
                  onClick={() => setIsPlaying(true)}
                >
                  <div style={{
                    width: '72px',
                    height: '72px',
                    borderRadius: '50%',
                    background: 'rgba(156,255,147,0.15)',
                    border: '2px solid rgba(156,255,147,0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <span
                      className="material-symbols-outlined"
                      style={{
                        fontSize: '40px',
                        color: '#9cff93',
                        fontVariationSettings: "'FILL' 1",
                      }}
                    >
                      play_arrow
                    </span>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{
                      color: '#f6f6fc',
                      fontFamily: 'Space Grotesk',
                      fontWeight: 700,
                      fontSize: '14px',
                      margin: '0 0 4px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}>
                      Match Highlights
                    </p>
                    <p style={{
                      color: '#aaabb0',
                      fontFamily: 'Lexend',
                      fontSize: '11px',
                      margin: 0,
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                    }}>
                      Tap to watch · Spoiler free
                    </p>
                  </div>
                </div>
              ) : isRestricted ? (
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  background: 'linear-gradient(135deg, #111318 0%, #1d2025 100%)',
                  padding: '24px',
                }}>
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: '48px', color: '#aaabb0' }}
                  >
                    lock
                  </span>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{
                      color: '#f6f6fc',
                      fontFamily: 'Space Grotesk',
                      fontWeight: 700,
                      fontSize: '14px',
                      margin: '0 0 6px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}>
                      Playback Restricted
                    </p>
                    <p style={{
                      color: '#aaabb0',
                      fontFamily: 'Lexend',
                      fontSize: '12px',
                      margin: '0 0 20px',
                    }}>
                      The video owner has disabled playback on external sites.
                    </p>
                    <a
                      href={`https://www.youtube.com/watch?v=${videoId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '12px 24px',
                        background: '#ff0000',
                        color: '#fff',
                        borderRadius: '8px',
                        textDecoration: 'none',
                        fontFamily: 'Lexend',
                        fontSize: '13px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                        open_in_new
                      </span>
                      Watch on YouTube
                    </a>
                  </div>
                </div>
              ) : (
                <div
                  ref={playerContainerRef}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                  }}
                />
              )}
            </div>

            <p style={{
              textAlign: 'center',
              color: '#aaabb0',
              fontSize: '12px',
              marginTop: '12px',
              fontFamily: 'Lexend',
            }}>
              Tap outside to close
            </p>
          </div>
        </div>
      )}
    </>
  )
}
