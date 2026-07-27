import { WeatherInterface } from '@/lib/types'
import { cn } from '@/lib/utils'

interface Props {
  data: WeatherInterface[]
  loading?: boolean
}

function tempTint(temp: number): string {
  if (temp < 4) return 'bg-blue-500/10'
  if (temp < 15) return 'bg-sky-400/10'
  if (temp < 24) return 'bg-amber-400/10'
  return 'bg-rose-400/10'
}

export function ForecastRow({ data, loading }: Props) {
  if (loading || data.length === 0) {
    return (
      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(7, minmax(0, 1fr))` }}>
        {[...Array(7)].map((_, i) => (
          <div key={i} className="h-72 bg-white/40 rounded-xl animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${data.length}, minmax(0, 1fr))` }}>
      {data.map((period, i) => (
        <div
          key={i}
          className="flex flex-col bg-white/10 backdrop-blur-md backdrop-saturate-150 border border-white/15 rounded-xl shadow-sm overflow-hidden"
        >
          <div className={cn('px-3 py-2', tempTint(Number(period.temperature)))}>
            <p className="text-xs font-bold text-foreground truncate">{period.name}</p>
            <p className="text-[10px] text-muted-foreground">{period.startTime}</p>
          </div>
          <div className="flex flex-col flex-1 items-center p-2 gap-1.5">
            {period.icon && (
              <img src={period.icon} alt={period.shortForecast} width={129} height={129} className="rounded" />
            )}
            <p className="text-sm font-bold text-foreground">{period.temperature}°C</p>
            <p className="text-xs text-muted-foreground text-center">{period.windSpeed}</p>
            <p className="text-xs text-muted-foreground text-center line-clamp-3">{period.shortForecast}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
