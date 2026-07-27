import { NextResponse } from 'next/server'
import type { CurrentWeather, WeatherInterface } from '@/lib/types'

export async function GET() {
  try {
    // Step 1: get grid point metadata
    const pointsRes = await fetch('https://api.weather.gov/points/41.0762,-73.8587')
    const pointsJson = await pointsRes.json()
    const forecastUrl: string = pointsJson.properties.forecast

    // Step 2: get forecast periods (SI units)
    const forecastRes = await fetch(`${forecastUrl}?units=si`)
    const forecastJson = await forecastRes.json()
    const periods: Record<string, unknown>[] = forecastJson.properties.periods

    // Step 3: get current observations
    const obsRes = await fetch('https://api.weather.gov/stations/KHPN/observations')
    const obsJson = await obsRes.json()
    const obs = obsJson.features[0].properties as Record<string, unknown>

    // Build current weather
    const current: CurrentWeather = {
      icon: (obs.icon as string).replace('medium', 'large'),
      temperature: parseFloat(
        String((obs.temperature as { value: number }).value)
      ).toFixed(1),
      description: obs.textDescription as string,
      windSpeed: String((obs.windSpeed as { value: number }).value),
      feelsLike: parseFloat(
        String((obs.windChill as { value: number }).value)
      ).toFixed(1),
    }

    // Build forecast periods
    const forecast: WeatherInterface[] = periods.map((p) => {
      const rawName = p.name as string
      const name = rawName
        .replace('This', '')
        .replace('Day', '')
        .replace('Night', '')
        .trim() || rawName

      const startTime = (p.startTime as string).split('T')[0]

      const rawWind = p.windSpeed as string
      const windSpeed = rawWind
        .split(' to ')
        .map((s) => Math.round(parseInt(s.split('km/h')[0].trim()) / 1.6))
        .join(' to ') + ' mph'

      return {
        name,
        startTime,
        temperature: p.temperature as number,
        windSpeed,
        shortForecast: p.shortForecast as string,
        detailedForecast: p.detailedForecast as string,
        icon: p.icon as string,
      }
    })

    return NextResponse.json({ current, forecast })
  } catch (err) {
    console.error('Weather API error:', err)
    return NextResponse.json({ error: 'Failed to fetch weather data' }, { status: 500 })
  }
}
