export interface WeatherInterface {
  name: string
  startTime: string
  temperature: number
  windSpeed: string
  shortForecast: string
  detailedForecast: string
  icon: string
}

export interface CurrentWeather {
  icon: string
  temperature: string
  description: string
  windSpeed: string
  feelsLike: string
}

export interface StockQuote {
  c: number   // current price
  d: number   // change
  dp: number  // percent change
  o: number   // open
  pc: number  // previous close
}

export interface NewsArticle {
  title: string
  abstract: string
  icon: string
}
