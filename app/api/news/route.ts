import { NextResponse } from 'next/server'
import type { NewsArticle } from '@/lib/types'

export async function GET() {
  const nytApiKey = process.env.NYT_API_KEY ?? ''
  try {
    const res = await fetch(
      `https://api.nytimes.com/svc/topstories/v2/world.json?api-key=${nytApiKey}`
    )
    const json = await res.json()

    const articles: NewsArticle[] = (json.results as Record<string, unknown>[])
      .filter(
        (item) =>
          (item.title as string).length > 0 &&
          (item.abstract as string).length > 0 &&
          item.multimedia !== undefined &&
          item.multimedia !== null
      )
      .map((item) => {
        const media = item.multimedia as Array<{ url: string }>
        // NYT multimedia array is ordered largest → smallest; use index 0 for the highest resolution
        return {
          title: item.title as string,
          abstract: item.abstract as string,
          icon: media[0].url,
        }
      })

    return NextResponse.json({ articles })
  } catch (err) {
    console.error('News API error:', err)
    return NextResponse.json({ error: 'Failed to fetch news data' }, { status: 500 })
  }
}
