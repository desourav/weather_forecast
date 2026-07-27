'use client'
import { CurrentWeather } from '@/lib/types'

interface Props {
  data: CurrentWeather | null
  loading?: boolean
}

export function CurrentWeatherCard({ data, loading }: Props) {
  if (loading || !data) {
    return (
      <div className="flex-shrink-0 bg-white/19 backdrop-blur-md backdrop-saturate-150 border border-white/30 rounded-2xl shadow-sm p-3 space-y-2 w-full">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-4 bg-white/40 rounded animate-pulse" />
        ))}
      </div>
    )
  }

  const rows: { label: string; value: string }[] = [
    { label: 'Condition', value: data.description },
    { label: 'Temp', value: `${data.temperature} °C` },
    { label: 'Feels Like', value: data.feelsLike === 'unknown' ? 'N/A' : `${data.feelsLike} °C` },
    { label: 'Wind', value: `${data.windSpeed} km/h` },
  ]

  return (
    <div className="flex-shrink-0 min-h-[135px] bg-white/19 backdrop-blur-md backdrop-saturate-150 border border-white/30 rounded-2xl shadow-sm p-3 w-full">
      <div className="flex items-center gap-3 h-full">
        {data.icon && data.icon !== 'n/a' && (
          <img src={data.icon} alt={data.description} width={96} height={96} className="rounded flex-shrink-0" />
        )}
        <div className="flex flex-col gap-0 flex-1">
          {rows.map(({ label, value }) => (
            <div key={label} className="flex justify-between gap-2">
              <span className="text-[19.5px] text-muted-foreground">{label}</span>
              <span className="text-[19.5px] font-medium text-foreground tabular-nums whitespace-nowrap">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
