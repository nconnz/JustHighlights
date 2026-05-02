import { cacheLife, cacheTag } from 'next/cache'
import { supabase } from './supabase'

export async function getHighlightsData(slug: string) {
  'use cache'
  cacheLife('hours')
  cacheTag('fixtures', `fixtures-${slug}`)

  const { data: category } = await supabase
    .from('categories')
    .select(`
      id, name, slug, level,
      fixtures(
        id, round, match_date, match_time, youtube_url, youtube_embeddable, season,
        home_team:teams!fixtures_home_team_id_fkey(id, name, abbreviation, colour_primary, colour_secondary),
        away_team:teams!fixtures_away_team_id_fkey(id, name, abbreviation, colour_primary, colour_secondary)
      )
    `)
    .eq('slug', slug)
    .single()

  if (!category) return null

  const fixtures = ((category as any).fixtures || []).sort(
    (a: any, b: any) => new Date(b.match_date).getTime() - new Date(a.match_date).getTime()
  )

  return { ...category, fixtures }
}
