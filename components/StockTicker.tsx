'use client'
import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

interface TickerQuote {
  symbol: string
  c: number
  dp: number
}

const VISIBLE_SLOTS = 6
const FLIP_INTERVAL_MS = 4000
// Duration of one card flip (ms) — must match CSS animation
const FLIP_DURATION_MS = 320
// Stagger between characters in a slot (ms)
const CHAR_STAGGER_MS = 35

function Arrow({ up }: { up: boolean }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 8 8"
      fill="none"
      className="inline-block mb-[1px] flex-shrink-0"
    >
      {up
        ? <polygon points="4,1 7,7 1,7" fill="currentColor" />
        : <polygon points="4,7 7,1 1,1" fill="currentColor" />}
    </svg>
  )
}

/** Pad / truncate a string to exactly `len` chars */
function fixed(s: string, len: number) {
  return s.length >= len ? s.slice(0, len) : s.padEnd(len, ' ')
}

function buildTargetString(q: TickerQuote | null, loading: boolean): string {
  if (loading || !q) return fixed('·····', 5) + fixed('··········', 10) + fixed('·······', 7)
  const sym   = fixed(q.symbol, 5)
  const price = fixed(`$${q.c.toFixed(2)}`, 10)
  const sign  = q.dp >= 0 ? '+' : '-'
  const pct   = fixed(`${sign}${Math.abs(q.dp).toFixed(2)}%`, 7)
  return sym + price + pct
}

/**
 * A single calendar-flap character cell.
 *
 * The illusion is built from three layers stacked at the same position:
 *  1. staticBottom — the NEW character, always visible behind everything (bottom half shown via clip)
 *  2. staticTop    — the OLD character, visible in the top half until the flip starts
 *  3. flapTop      — OLD char card that rotates 0→-90° (top half folds away downward)
 *  4. flapBottom   — NEW char card that rotates +90→0° (bottom half unfolds into view)
 *
 * All four layers share the same cell dimensions; clip-path restricts each to its half.
 */
function FlapChar({
  prevChar,
  nextChar,
  flipping,
  delay,
}: {
  prevChar: string
  nextChar: string
  flipping: boolean
  delay: number
}) {
  const display = (c: string) => (c === ' ' ? '\u00a0' : c)
  const cellCls = 'absolute inset-0 flex items-center justify-center select-none'

  return (
    <span
      className="relative inline-block font-mono tabular-nums"
      style={{ width: '0.62em', height: '1.15em', perspective: '120px' }}
    >
      {/* ── static bottom half: new char peeking out ── */}
      <span
        className={cn(cellCls, 'bg-[#111] text-inherit')}
        style={{ clipPath: 'inset(50% 0 0 0)' }}
        aria-hidden
      >
        {display(nextChar)}
      </span>

      {/* ── static top half: old char (hidden once flapTop covers it) ── */}
      <span
        className={cn(cellCls, 'bg-[#111] text-inherit')}
        style={{ clipPath: 'inset(0 0 50% 0)' }}
        aria-hidden
      >
        {display(flipping ? prevChar : nextChar)}
      </span>

      {/* ── animated flap: top half of OLD char folds down ── */}
      {flipping && (
        <span
          className={cn(cellCls, 'bg-[#1a1a1a] text-inherit ticker-flap-top')}
          style={{
            clipPath: 'inset(0 0 50% 0)',
            transformOrigin: '50% 100%',
            animationDelay: `${delay}ms`,
            animationDuration: `${FLIP_DURATION_MS}ms`,
            backfaceVisibility: 'hidden',
          }}
          aria-hidden
        >
          {display(prevChar)}
        </span>
      )}

      {/* ── animated flap: bottom half of NEW char unfolds ── */}
      {flipping && (
        <span
          className={cn(cellCls, 'bg-[#1a1a1a] text-inherit ticker-flap-bottom')}
          style={{
            clipPath: 'inset(50% 0 0 0)',
            transformOrigin: '50% 0%',
            animationDelay: `${delay}ms`,
            animationDuration: `${FLIP_DURATION_MS}ms`,
            backfaceVisibility: 'hidden',
          }}
          aria-hidden
        >
          {display(nextChar)}
        </span>
      )}

      {/* accessible text */}
      <span className="sr-only">{display(nextChar)}</span>
    </span>
  )
}

interface SlotState {
  prev: string
  current: string
  flipping: boolean
}

export function StockTicker() {
  const [quotes, setQuotes] = useState<TickerQuote[]>([])
  const [loading, setLoading] = useState(true)
  const [offset, setOffset] = useState(0)
  const [slots, setSlots] = useState<SlotState[]>(
    Array.from({ length: VISIBLE_SLOTS }, () => ({
      prev: fixed('·', 22),
      current: fixed('·', 22),
      flipping: false,
    })),
  )

  // Fetch quotes
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
    const id = setInterval(load, 15 * 60 * 1000)
    return () => { cancelled = true; clearInterval(id) }
  }, [])

  const animating = useRef(false)
  const quotesRef = useRef<TickerQuote[]>([])
  const loadingRef = useRef(true)
  const offsetRef = useRef(0)
  const slotsRef = useRef(slots)

  quotesRef.current = quotes
  loadingRef.current = loading
  slotsRef.current = slots

  function flipToNext() {
    if (animating.current) return
    animating.current = true

    const q = quotesRef.current
    const isLoading = loadingRef.current
    const nextOffset = q.length === 0
      ? 0
      : (offsetRef.current + VISIBLE_SLOTS) % q.length
    offsetRef.current = nextOffset

    const prevSlots = slotsRef.current
    const targets = Array.from({ length: VISIBLE_SLOTS }, (_, i) => {
      const idx = (nextOffset + i) % (q.length || 1)
      return buildTargetString(isLoading ? null : (q[idx] ?? null), isLoading)
    })

    setOffset(nextOffset)
    setSlots(targets.map((target, i) => ({
      prev: prevSlots[i].current,
      current: target,
      flipping: true,
    })))

    // The longest possible stagger + animation duration before we clear flipping
    const totalDuration = FLIP_DURATION_MS + (22 - 1) * CHAR_STAGGER_MS + 80
    setTimeout(() => {
      setSlots(targets.map(target => ({
        prev: target,
        current: target,
        flipping: false,
      })))
      animating.current = false
    }, totalDuration)
  }

  // Initialise slots once data arrives
  useEffect(() => {
    if (!loading) {
      offsetRef.current = 0
      const targets = Array.from({ length: VISIBLE_SLOTS }, (_, i) => {
        const idx = i % (quotes.length || 1)
        return buildTargetString(quotes[idx] ?? null, false)
      })
      setSlots(targets.map(target => ({
        prev: target,
        current: target,
        flipping: false,
      })))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading])

  // Periodic flip
  useEffect(() => {
    const id = setInterval(flipToNext, FLIP_INTERVAL_MS)
    return () => clearInterval(id)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="w-full bg-black/35 backdrop-blur-md border-t border-white/5 select-none overflow-hidden">
      <div className="flex items-stretch divide-x divide-white/10">
        {slots.map((slot, si) => {
          const q = loading ? null : (quotes[(offset + si) % (quotes.length || 1)] ?? null)
          const up = q ? q.dp >= 0 : true

          // Split display string into segments: symbol[0..5] price[5..15] pct[15..22]
          const symChars   = slot.current.slice(0, 5).split('')
          const priceChars = slot.current.slice(5, 15).split('')
          const pctChars   = slot.current.slice(15, 22).split('')
          const prevSym    = slot.prev.slice(0, 5).split('')
          const prevPrice  = slot.prev.slice(5, 15).split('')
          const prevPct    = slot.prev.slice(15, 22).split('')

          return (
            <div
              key={si}
              className="flex-1 flex items-center gap-1 px-3 py-1.5 text-[15px] font-mono overflow-hidden"
            >
              {/* Symbol */}
              <span className="font-bold text-white tracking-wide flex-shrink-0">
                {symChars.map((c, ci) => (
                  <FlapChar
                    key={ci}
                    prevChar={prevSym[ci] ?? c}
                    nextChar={c}
                    flipping={slot.flipping}
                    delay={ci * CHAR_STAGGER_MS}
                  />
                ))}
              </span>

              {loading ? (
                <span className="w-16 h-3 rounded bg-white/20 animate-pulse inline-block" />
              ) : (
                <>
                  {/* Price */}
                  <span className="text-white/90 tabular-nums flex-shrink-0">
                    {priceChars.map((c, ci) => (
                      <FlapChar
                        key={ci}
                        prevChar={prevPrice[ci] ?? c}
                        nextChar={c}
                        flipping={slot.flipping}
                        delay={(5 + ci) * CHAR_STAGGER_MS}
                      />
                    ))}
                  </span>
                  {/* % change */}
                  <span
                    className={cn(
                      'inline-flex items-center gap-0.5 tabular-nums flex-shrink-0',
                      up ? 'text-emerald-400' : 'text-red-400',
                    )}
                  >
                    <Arrow up={up} />
                    {pctChars.map((c, ci) => (
                      <FlapChar
                        key={ci}
                        prevChar={prevPct[ci] ?? c}
                        nextChar={c}
                        flipping={slot.flipping}
                        delay={(15 + ci) * CHAR_STAGGER_MS}
                      />
                    ))}
                  </span>
                </>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
