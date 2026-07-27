'use client'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface TickerQuote {
  symbol: string
  c: number
  dp: number
}

function Arrow({ up }: { up: boolean }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 8 8"
      fill="none"
      className="inline-block mb-[1px]"
    >
      {up
        ? <polygon points="4,1 7,7 1,7" fill="currentColor" />
        : <polygon points="4,7 7,1 1,1" fill="currentColor" />}
    </svg>
  )
}

export function StockTicker() {
  const [quotes, setQuotes] = useState<TickerQuote[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await fetch('/api/ticker')
        const json = await res.json()
        if (!cancelled) {
          setQuotes(json.quotes ?? [])
          setLoading(false)
        }
      } catch {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    // Refresh every 15 minutes to stay in sync with server cache
    const id = setInterval(load, 15 * 60 * 1000)
    return () => { cancelled = true; clearInterval(id) }
  }, [])

  // Use placeholder symbols while loading
  const items: TickerQuote[] = loading
    ? Array.from({ length: 20 }, (_, i) => ({ symbol: `···`, c: 0, dp: 0 }))
    : quotes

  // Duplicate for seamless infinite loop
  const track = [...items, ...items]

  return (
    <div className="w-full bg-black/70 backdrop-blur-md border-t border-white/10 overflow-hidden select-none">
      <div
        className="flex items-center gap-0 ticker-track whitespace-nowrap"
        style={{ width: 'max-content' }}
      >
        {track.map((item, idx) => {
          const up = item.dp >= 0

          return (
            <span
              key={idx}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 border-r border-white/10 text-[19.5px] font-mono"
            >
              <span className="font-bold text-white tracking-wide">{item.symbol}</span>

              {loading ? (
                <span className="w-16 h-3 rounded bg-white/20 animate-pulse inline-block" />
              ) : (
                <>
                  <span className="text-white/90 tabular-nums">${item.c.toFixed(2)}</span>
                  <span
                    className={cn(
                      'inline-flex items-center gap-0.5 tabular-nums',
                      up ? 'text-emerald-400' : 'text-red-400',
                    )}
                  >
                    <Arrow up={up} />
                    {Math.abs(item.dp).toFixed(2)}%
                  </span>
                </>
              )}
            </span>
          )
        })}
      </div>
    </div>
  )
}
