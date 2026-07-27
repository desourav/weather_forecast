'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { CurrentWeatherCard } from '@/components/CurrentWeatherCard'
import { ForecastRow } from '@/components/ForecastRow'
import { StocksTable } from '@/components/StocksTable'
import { NewsPanel } from '@/components/NewsPanel'
import { LiveClock } from '@/components/LiveClock'
import { StockTicker } from '@/components/StockTicker'
import type { CurrentWeather, WeatherInterface, StockQuote, NewsArticle } from '@/lib/types'

interface AppState {
  forecast: WeatherInterface[]
  current: CurrentWeather | null
  tickers: string[]
  stocks: StockQuote[]
  news: NewsArticle[]
  loading: boolean
}

/** Returns milliseconds until the next occurrence of hour:minute (today or tomorrow) */
function msUntil(hour: number, minute: number): number {
  const now = new Date()
  const target = new Date(now)
  target.setHours(hour, minute, 0, 0)
  if (target.getTime() <= now.getTime()) {
    target.setDate(target.getDate() + 1)
  }
  return target.getTime() - now.getTime()
}

export default function Home() {
  const [state, setState] = useState<AppState>({
    forecast: [],
    current: null,
    tickers: [],
    stocks: [],
    news: [],
    loading: true,
  })

  // Hold all timer ids so we can clean them up on unmount
  const timersRef = useRef<(ReturnType<typeof setTimeout> | ReturnType<typeof setInterval>)[]>([])

  const addTimer = (id: ReturnType<typeof setTimeout> | ReturnType<typeof setInterval>) => {
    timersRef.current.push(id)
  }

  const fetchAllData = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true }))
    try {
      const [weatherRes, stocksRes, newsRes] = await Promise.all([
        fetch('/api/weather'),
        fetch('/api/stocks'),
        fetch('/api/news'),
      ])
      const [weatherData, stocksData, newsData] = await Promise.all([
        weatherRes.json(),
        stocksRes.json(),
        newsRes.json(),
      ])
      setState({
        forecast: weatherData.forecast ?? [],
        current: weatherData.current ?? null,
        tickers: stocksData.tickers ?? [],
        stocks: stocksData.data ?? [],
        news: newsData.articles ?? [],
        loading: false,
      })
    } catch (err) {
      console.error('Failed to fetch data', err)
      setState(prev => ({ ...prev, loading: false }))
    }
  }, [])

  useEffect(() => {
    // Initial fetch — always runs regardless of hour
    fetchAllData()

    let intervalId: ReturnType<typeof setInterval> | null = null

    function startInterval() {
      intervalId = setInterval(fetchAllData, 900_000)
      addTimer(intervalId)
      // Arm shutdown at 23:00
      const msToEnd = msUntil(23, 0)
      const shutdownId = setTimeout(() => {
        if (intervalId) clearInterval(intervalId)
        armWakeUp()
      }, msToEnd)
      addTimer(shutdownId)
    }

    function armWakeUp() {
      const msToStart = msUntil(5, 0)
      const wakeId = setTimeout(() => {
        fetchAllData()
        startInterval()
      }, msToStart)
      addTimer(wakeId)
    }

    const currentHour = new Date().getHours()
    if (currentHour >= 5 && currentHour < 23) {
      startInterval()
    } else {
      armWakeUp()
    }

    return () => {
      timersRef.current.forEach(id => {
        clearTimeout(id as ReturnType<typeof setTimeout>)
        clearInterval(id as ReturnType<typeof setInterval>)
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div
      className="h-screen overflow-hidden bg-cover bg-fixed bg-center relative flex flex-col"
      style={{ backgroundImage: "url('/mountains.jpeg')" }}
    >
      {/* Subtle dark overlay so frosted panels have contrast backdrop */}
      <div className="absolute inset-0 bg-black/15 pointer-events-none" />

      {/* Main content */}
      <main className="relative z-10 p-4 flex-1 flex flex-col gap-4 min-h-0">
        {/* Forecast row — fixed height, never shrinks */}
        <section className="flex-shrink-0">
          <ForecastRow data={state.forecast} loading={state.loading} />
        </section>

        {/* Stocks + current weather + clock stacked (left) + News panel (right) — fills remaining height */}
        <section className="flex gap-4 flex-1 min-h-0">
          <div className="flex flex-col gap-4 min-h-0">
            <StocksTable tickers={state.tickers} data={state.stocks} loading={state.loading} />
            <CurrentWeatherCard data={state.current} loading={state.loading} />
            <div className="flex-shrink-0 bg-white/19 backdrop-blur-md backdrop-saturate-150 border border-white/30 rounded-2xl shadow-sm px-4 py-3">
              <LiveClock />
            </div>
          </div>
          <div className="flex-1 min-w-0 min-h-0 flex flex-col">
            <NewsPanel articles={state.news} loading={state.loading} />
          </div>
        </section>

        {/* NYSE-style S&P 500 ticker — below clock & news panel */}
        <section className="flex-shrink-0 overflow-hidden rounded-2xl">
          <StockTicker />
        </section>
      </main>
    </div>
  )
}
