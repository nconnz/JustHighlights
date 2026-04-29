import { supabase } from '../lib/supabase'
import Link from 'next/link'

async function getCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('level', { ascending: true })
    .order('name', { ascending: true })
  if (error) console.error(error)
  return data || []
}

export default async function Home() {
  const categories = await getCategories()
  const topLevel = categories.filter((c: any) => c.level === 0)
  const subCategories = categories.filter((c: any) => c.level === 1)

return (
    <main style={{ paddingTop: '96px', paddingBottom: '96px', paddingLeft: '16px', paddingRight: '16px', maxWidth: '1280px', margin: '0 auto', minHeight: '100vh' }}>

      <div className="mb-6 bg-[#111318] rounded-xl p-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-[#ff7351] pulse-dot inline-block"></span>
          <span className="font-['Lexend'] text-[10px] font-bold tracking-widest uppercase text-[#aaabb0]">Live Coverage</span>
        </div>
        <div className="flex -space-x-2">
          {subCategories.slice(0, 3).map((cat: any) => (
            <div key={cat.id} className="w-6 h-6 rounded-full bg-[#23262c] border border-[#0c0e12] flex items-center justify-center text-[9px] font-bold" style={{ color: cat.colour || '#9cff93' }}>
              {cat.name.slice(0, 3).toUpperCase()}
            </div>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <h2 className="font-['Space_Grotesk'] text-2xl font-bold tracking-tight">Sports Highlights</h2>
        <p className="text-sm text-[#aaabb0]">Select a category for recent action.</p>
      </div>

      <div className="space-y-2 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
        {topLevel.map((sport: any, index: number) => {
          const leagues = subCategories.filter((c: any) => c.parent_id === sport.id)
          const accentColor = sport.colour || '#9cff93'
          return (
            <details key={sport.id} className="group bg-[#111318] rounded-xl overflow-hidden" open={index === 0}>
              <summary className="list-none cursor-pointer flex items-center justify-between p-4 hover:bg-[#1d2025] transition-colors">
                <div className="flex items-center gap-4">
                  <span className="material-symbols-outlined" style={{ color: accentColor }}>sports_rugby</span>
                  <span className="font-['Space_Grotesk'] font-bold text-lg tracking-tight">{sport.name}</span>
                </div>
                <span className="material-symbols-outlined text-[#aaabb0] group-open:rotate-180 transition-transform">expand_more</span>
              </summary>
              <div className="px-4 pb-4 space-y-1">
                {leagues.map((league: any) => (
                  <Link
                    key={league.id}
                    href={`/highlights/${league.slug}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-[#9cff93]/10 group/item transition-all"
                  >
                    <span className="font-['Lexend'] font-bold text-xs tracking-widest text-[#aaabb0] group-hover/item:text-[#9cff93] uppercase">{league.name}</span>
                    <span className="material-symbols-outlined text-sm text-[#9cff93] opacity-0 group-hover/item:opacity-100 transition-opacity">arrow_forward_ios</span>
                  </Link>
                ))}
                {leagues.length === 0 && (
                  <p className="text-xs text-[#aaabb0] px-3 py-2">No leagues added yet</p>
                )}
              </div>
            </details>
          )
        })}
      </div>

      <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center h-16 px-2 bg-[#0c0e12]/80 backdrop-blur-lg shadow-[0_-4px_24px_rgba(0,0,0,0.5)] z-50 rounded-t-xl">
        <button className="flex flex-col items-center justify-center text-[#f6f6fc]/40 py-1 px-3">
          <span className="material-symbols-outlined">sensors</span>
          <span className="font-['Lexend'] text-[10px] uppercase font-bold tracking-widest mt-1">LIVE</span>
        </button>
        <button className="flex flex-col items-center justify-center text-[#9cff93] bg-[#9cff93]/10 rounded-xl py-1 px-3">
          <span className="material-symbols-outlined">sports_score</span>
          <span className="font-['Lexend'] text-[10px] uppercase font-bold tracking-widest mt-1">SCORES</span>
        </button>
        <button className="flex flex-col items-center justify-center text-[#f6f6fc]/40 py-1 px-3">
          <span className="material-symbols-outlined">article</span>
          <span className="font-['Lexend'] text-[10px] uppercase font-bold tracking-widest mt-1">NEWS</span>
        </button>
        <button className="flex flex-col items-center justify-center text-[#f6f6fc]/40 py-1 px-3">
          <span className="material-symbols-outlined">groups</span>
          <span className="font-['Lexend'] text-[10px] uppercase font-bold tracking-widest mt-1">TEAMS</span>
        </button>
      </nav>

    </main>
  )
}