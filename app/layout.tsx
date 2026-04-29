import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Velocity Sports',
  description: 'Spoiler-free sports highlights',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Manrope:wght@300;400;500;600;700&family=Lexend:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet" />
      </head>
      <body>

        {/* Global Header — appears on every page */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-[#0c0e12]/60 backdrop-blur-xl shadow-[0_0_20px_rgba(156,255,147,0.1)] h-14 flex items-center">
          <div style={{ width: '100%', maxWidth: '1280px', margin: '0 auto', padding: '0 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="flex items-center gap-3">
              <button className="hover:bg-[#1d2025] transition-colors p-2 rounded-lg">
                <span className="material-symbols-outlined text-[#9cff93]">menu</span>
              </button>
              <a href="/" className="text-xl font-['Space_Grotesk'] font-black italic text-[#9cff93] tracking-widest uppercase">
                VELOCITY
              </a>
            </div>
            <div className="flex items-center gap-4">
              <button className="text-[#f6f6fc]/60 hover:bg-[#1d2025] transition-colors p-2 rounded-lg">
                <span className="material-symbols-outlined">search</span>
              </button>
              <div className="w-8 h-8 rounded-full bg-[#1d2025] border-2 border-[#9cff93]/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-xs">person</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        {children}

        {/* Global Bottom Nav — appears on every page */}
        <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center h-16 px-2 bg-[#0c0e12]/80 backdrop-blur-lg shadow-[0_-4px_24px_rgba(0,0,0,0.5)] z-50 rounded-t-xl">
          <a href="/" className="flex flex-col items-center justify-center text-[#f6f6fc]/40 py-1 px-3 hover:text-[#9cff93]/80">
            <span className="material-symbols-outlined">home</span>
            <span className="font-['Lexend'] text-[10px] uppercase font-bold tracking-widest mt-1">HOME</span>
          </a>
          <button className="flex flex-col items-center justify-center text-[#f6f6fc]/40 py-1 px-3 hover:text-[#9cff93]/80">
            <span className="material-symbols-outlined">sensors</span>
            <span className="font-['Lexend'] text-[10px] uppercase font-bold tracking-widest mt-1">LIVE</span>
          </button>
          <button className="flex flex-col items-center justify-center text-[#f6f6fc]/40 py-1 px-3 hover:text-[#9cff93]/80">
            <span className="material-symbols-outlined">article</span>
            <span className="font-['Lexend'] text-[10px] uppercase font-bold tracking-widest mt-1">NEWS</span>
          </button>
          <button className="flex flex-col items-center justify-center text-[#f6f6fc]/40 py-1 px-3 hover:text-[#9cff93]/80">
            <span className="material-symbols-outlined">groups</span>
            <span className="font-['Lexend'] text-[10px] uppercase font-bold tracking-widest mt-1">TEAMS</span>
          </button>
        </nav>

      </body>
    </html>
  )
}