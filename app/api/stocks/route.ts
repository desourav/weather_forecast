import { NextResponse } from 'next/server'
import { DefaultApi } from 'finnhub-ts'
import type { StockQuote } from '@/lib/types'

const finnhubClient = new DefaultApi({
  apiKey: process.env.FINNHUB_API_KEY ?? '',
  isJsonMime: (input) => {
    try {
      JSON.parse(input)
      return true
    } catch {
      return false
    }
  },
})

const TICKERS = [
  'SPY', 'AAPL', 'GOOGL', 'NVDA', 'META',
  'IBM', 'MSFT', 'TSLA', 'VOO', 'VUG',
  'VGT', 'VTWO', 'VOT',
]

export async function GET() {
  try {
    const data: StockQuote[] = []

    for (const ticker of TICKERS) {
      const res = await finnhubClient.quote(ticker)
      data.push(res.data as StockQuote)
    }

    return NextResponse.json({ tickers: TICKERS, data })
  } catch (err) {
    console.error('Stocks API error:', err)
    return NextResponse.json({ error: 'Failed to fetch stock data' }, { status: 500 })
  }
}
