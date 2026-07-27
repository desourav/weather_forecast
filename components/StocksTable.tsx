import { StockQuote } from '@/lib/types'
import { cn } from '@/lib/utils'

interface Props {
  tickers: string[]
  data: StockQuote[]
  loading?: boolean
}

function stockBadgeClass(dp: number): string {
  if (dp < -1) return 'bg-red-500/20 text-red-700'
  if (dp < 0) return 'bg-red-400/10 text-red-600'
  if (dp < 1) return 'bg-green-400/10 text-green-700'
  return 'bg-green-500/20 text-green-700'
}

const headers = ['Ticker', 'Price', 'Chg', '%', 'Open', 'Prev']

export function StocksTable({ tickers, data, loading }: Props) {
  return (
    <div className="flex flex-col flex-1 min-h-0 bg-white/19 backdrop-blur-md backdrop-saturate-150 border border-white/30 rounded-2xl shadow-sm overflow-hidden">
      <div className="px-3 pt-2 pb-1 flex-shrink-0">
        <p className="text-sm text-muted-foreground uppercase tracking-wide font-medium">Markets</p>
      </div>
      <div className="flex-1 min-h-0 overflow-hidden">
        <table className="w-auto border-separate border-spacing-0">
          <thead>
            <tr className="border-b border-border/40">
              {headers.map(h => (
                <th key={h} className="px-2 py-1 text-left text-sm uppercase tracking-wide text-muted-foreground font-medium whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading || data.length === 0
              ? [...Array(13)].map((_, i) => (
                  <tr key={i} className="border-b border-border/40">
                    {[...Array(6)].map((_, j) => (
                      <td key={j} className="px-2 py-1">
                        <div className="h-3 bg-white/40 rounded animate-pulse w-10" />
                      </td>
                    ))}
                  </tr>
                ))
              : data.map((quote, i) => (
                  <tr key={tickers[i]} className="border-b border-border/40 hover:bg-muted/50 transition-colors">
                    <td className="px-2 py-1 text-[15px] font-medium text-foreground whitespace-nowrap">{tickers[i]}</td>
                    <td className="px-2 py-1 text-[15px] tabular-nums whitespace-nowrap">${quote.c?.toFixed(2)}</td>
                    <td className="px-2 py-1 text-[15px] tabular-nums whitespace-nowrap">{quote.d?.toFixed(2)}</td>
                    <td className="px-2 py-1">
                      <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-sm font-medium tabular-nums whitespace-nowrap', stockBadgeClass(quote.dp))}>
                        {quote.dp?.toFixed(2)}%
                      </span>
                    </td>
                    <td className="px-2 py-1 text-[15px] tabular-nums whitespace-nowrap">${quote.o?.toFixed(2)}</td>
                    <td className="px-2 py-1 text-[15px] tabular-nums whitespace-nowrap">${quote.pc?.toFixed(2)}</td>
                  </tr>
                ))
            }
          </tbody>
        </table>
      </div>
    </div>
  )
}
