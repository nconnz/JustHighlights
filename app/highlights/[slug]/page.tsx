import { supabase } from '../../../lib/supabase'
import Link from 'next/link'
import VideoPlayer from '../../components/VideoPlayer'

export default async function HighlightsPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const { data: category } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!category) {
    return <div className="pt-20 px-4 text-[#aaabb0]">League not found</div>
  }

  const { data: fixtures } = await supabase
    .from('fixtures')
    .select(`
      id,
      round,
      match_date,
      match_time,
      youtube_url,
      season,
      home_team:teams!fixtures_home_team_id_fkey(id, name, abbreviation, colour_primary, colour_secondary),
      away_team:teams!fixtures_away_team_id_fkey(id, name, abbreviation, colour_primary, colour_secondary)
    `)
    .eq('category_id', category.id)
    .order('match_date', { ascending: false })

  const allFixtures = fixtures || []

  const rounds: Record<string, any[]> = {}
  allFixtures.forEach((fixture: any) => {
    const round = fixture.round || 'Upcoming'
    if (!rounds[round]) rounds[round] = []
    rounds[round].push(fixture)
  })

  const roundKeys = Object.keys(rounds)

  return (
    <main style={{ paddingTop: '96px', paddingBottom: '96px', paddingLeft: '16px', paddingRight: '16px', maxWidth: '1536px', margin: '0 auto', minHeight: '100vh' }}>
      <div className="mb-8 flex flex-col gap-2">
        <h2 className="font-['Space_Grotesk'] font-black text-4xl tracking-tighter uppercase italic leading-none">
          {category.name}
        </h2>
        <p className="text-sm text-[#aaabb0]">
          {roundKeys.length} rounds · {allFixtures.length} matches
        </p>
      </div>

      <div className="space-y-6">
        {roundKeys.length === 0 && (
          <p className="text-[#aaabb0] text-sm">No fixtures added yet.</p>
        )}

        {roundKeys.map((round, index) => {
          const firstDate = rounds[round][0]?.match_date
            ? new Date(rounds[round][0].match_date).toLocaleDateString('en-AU', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })
            : ''

          return (
            <details key={round} className="group/section" open={index === 0}>
              <summary className="flex items-baseline justify-between border-b border-[#46484d]/10 pb-2 cursor-pointer outline-none list-none">
                <div className="flex items-center gap-3">
                  <h3 className="font-['Space_Grotesk'] font-bold text-2xl tracking-tight text-[#9cff93] uppercase">
                    {round}
                  </h3>
                  <span className="material-symbols-outlined text-[#9cff93] text-xl transition-transform duration-300 group-open/section:rotate-180">
                    expand_more
                  </span>
                </div>
                <span className="font-['Lexend'] text-[11px] font-medium text-[#aaabb0] tracking-wider uppercase">
                  {firstDate}
                </span>
              </summary>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
                {rounds[round].map((fixture: any) => {
                  const homeTeam = fixture.home_team
                  const awayTeam = fixture.away_team
                  const hasVideo = !!fixture.youtube_url
                  const matchTime = fixture.match_time
                    ? fixture.match_time.slice(0, 5)
                    : ''
                  const matchDate = fixture.match_date
                    ? new Date(fixture.match_date).toLocaleDateString('en-AU', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                      })
                    : ''

                  return (
                    <div key={fixture.id} className="group cursor-pointer">
                      <div className="bg-[#111318] hover:bg-[#1d2025] p-4 rounded-xl transition-all duration-300 border border-transparent hover:border-[#9cff93]/20">
                        <div className="flex items-center justify-between">

                          <div className="flex items-center gap-4">
                            <div className="flex -space-x-3">
                              <div
                                className="w-12 h-12 rounded-full bg-[#23262c] flex items-center justify-center shadow-lg relative z-10 border border-[#46484d]/30"
                                style={{ borderColor: (homeTeam?.colour_primary || '#9cff93') + '60' }}
                              >
                                <span
                                  className="font-['Space_Grotesk'] font-black text-xs"
                                  style={{ color: homeTeam?.colour_primary || '#9cff93' }}
                                >
                                  {homeTeam?.abbreviation || '?'}
                                </span>
                              </div>
                              <div
                                className="w-12 h-12 rounded-full bg-[#23262c] flex items-center justify-center shadow-lg border border-[#46484d]/30"
                                style={{ borderColor: (awayTeam?.colour_primary || '#aaabb0') + '60' }}
                              >
                                <span
                                  className="font-['Space_Grotesk'] font-black text-xs"
                                  style={{ color: awayTeam?.colour_primary || '#aaabb0' }}
                                >
                                  {awayTeam?.abbreviation || '?'}
                                </span>
                              </div>
                            </div>

                            <div className="flex flex-col gap-0.5">
                              <span className="font-['Space_Grotesk'] font-bold text-sm tracking-tight text-[#f6f6fc] uppercase">
                                {homeTeam?.abbreviation}{' '}
                                <span className="text-[#aaabb0] font-normal italic text-xs">vs</span>{' '}
                                {awayTeam?.abbreviation}
                              </span>
                              <span className="font-['Lexend'] text-[10px] text-[#aaabb0]">
                                {matchDate}{matchTime ? ` · ${matchTime}` : ''}
                              </span>
                            </div>
                          </div>

                        {hasVideo ? (
                          <VideoPlayer url={fixture.youtube_url} />
                          ) : (
                          <span className="material-symbols-outlined text-[#aaabb0]/30">
                          lock_clock
                          </span>
                        )}

                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </details>
          )
        })}
      </div>

      <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center h-16 px-2 bg-[#0c0e12]/80 backdrop-blur-lg shadow-[0_-4px_24px_rgba(0,0,0,0.5)] z-50 rounded-t-xl">
        <Link
          href="/"
          className="flex flex-col items-center justify-center text-[#f6f6fc]/40 py-1 px-3 hover:text-[#9cff93]/80"
        >
          <span className="material-symbols-outlined">home</span>
          <span className="font-['Lexend'] text-[10px] uppercase font-bold tracking-widest mt-1">HOME</span>
        </Link>
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