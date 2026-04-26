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
          className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="w-full max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-3">
              <span className="font-['Lexend'] text-[10px] text-[#9cff93] uppercase tracking-widest font-bold">
                Match Highlights
              </span>
              <button
                onClick={() => setIsOpen(false)}
                className="text-[#aaabb0] hover:text-[#f6f6fc] transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div style={{ position: 'relative', width: '100%', paddingBottom: '56.25%', borderRadius: '12px', overflow: 'hidden', background: 'black' }}>
                <iframe
                    src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
                    title="Match Highlights"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                />
            </div>

            <p className="text-center text-[#aaabb0] text-xs mt-3 font-['Lexend']">
              Tap outside to close
            </p>
          </div>
        </div>
      )}
    </>
  )
}