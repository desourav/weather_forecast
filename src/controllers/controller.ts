import {Request, Response, NextFunction} from 'express';
import {WeatherInterface} from '../models/weather-interface';
import { DefaultApi } from 'finnhub-ts';
import NewsAPI from 'ts-newsapi';
import fs from 'fs';


//  get all weather data
export const getAllData = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let timestamp = new Date(Date.now());
        let lastUpdate = timestamp.getFullYear() + '/' + timestamp.getMonth() + '/' + timestamp.getDate() + ' ' + timestamp.toLocaleTimeString('en-US');
        console.log(`info: getting all data ${lastUpdate}`);
        let weather: WeatherInterface[] = [];
        let lat = "41.0762";
        let long = "-73.8587";
        let baseURL = "https://api.weather.gov/points/" + lat + "," + long

        let geoJSONData = await fetchNWSData(baseURL);
        let weatherArray = await fetchNWSData(geoJSONData.properties.forecast + "?units=si");

        let currentWeather = await fetchNWSData("https://api.weather.gov/stations/KDXR/observations"); // nearest weather station: Danbury Airport
        let currentWeatherProps = currentWeather.features[0].properties;
        // console.log(currentWeatherProps);
        let currIcon = currentWeatherProps.icon.replace("medium", "large");
        // console.log(currentWeatherProps.icon);
        // console.log(currIcon);

        let currTemp = parseFloat(currentWeatherProps.temperature.value).toFixed(1);
        let currDescription = currentWeatherProps.textDescription;
        let currWindspeed = currentWeatherProps.windSpeed.value == null ? "unknown" : parseFloat(currentWeatherProps.windSpeed.value).toFixed(1);
        let currFeelsLike = currentWeatherProps.windChill.value == null ? "unknown" : parseFloat(currentWeatherProps.windChill.value).toFixed(1)


        let forecastArray = weatherArray.properties.periods == undefined ? [] : weatherArray.properties.periods;
        for (let i = 0; i < forecastArray.length; i++) {
            let dailyWeather: WeatherInterface = {
                "name": forecastArray[i].name.replace("This", "").replace("Day", "AM").replace("Night", "PM"),
                "temperature": forecastArray[i].temperature,
                "windSpeed": forecastArray[i].windSpeed,
                "shortForecast": forecastArray[i].shortForecast,
                "detailedForecast": forecastArray[i].detailedForecast,
                "icon": forecastArray[i].icon
            }
            weather.push(dailyWeather);
        }
        let stockArray = ['SPY', 'AAPL', 'GOOGL', 'NVDA', 'META', 'IBM', 'MSFT', 'TSLA', 'VOO', 'VUG', 'VGT', 'VTWO', 'VOT'];
        let stockPriceData = await getStockPrice(stockArray);
        let worldNews = await getWorldnews();

        res.status(200).render(__dirname + "/index.html", { 
            jsonData: weather, 
            stockArray: stockArray, 
            stockData: stockPriceData,
            worldNews: worldNews,
            currTemp: currTemp,
            currWindspeed: currWindspeed,
            currIcon: currIcon,
            currDescription: currDescription,
            currFeelsLike: currFeelsLike
        });
        
    } catch (error) {
        next(error);
    }
  };



// get all top news : call every 15 mins (100 per day limit)
async function getWorldnews() :Promise<any>{

    const apiKey = 'aa8b64e86aa9434eb08b9e0021139221'
    const newsAPI = new NewsAPI(apiKey);
    
    // Top and breaking headlines  
    const topHeadlines = await newsAPI.getTopHeadlines ({
        // q: 'stocks',
        country: 'us',
        // category: 'business',
        pageSize: 20,
        page: 1,
    });
    let worldNews: any[] = [];
    topHeadlines.articles.forEach((news => {
        worldNews.push(news.title);
    }))

    return worldNews;
    
}


async function fetchNWSData(url: string) :Promise<any> {
    try {
        const res = await fetch(url)
        const json = res.json();
        return json;
    } catch (error) {
        throw new Error("Network response was not ok");
    }
}


// get all stock data
async function getStockPrice(stock: string[]) :Promise<any> {
    let stockData = [];
    const finnhubClient = new DefaultApi({
        apiKey: 'cspc6j1r01qnvmpus3bgcspc6j1r01qnvmpus3c0',
        isJsonMime: (input) => {
          try {
            JSON.parse(input)
            return true
          } catch (error) {}
          return false
        },
      });
    for (let i = 0; i < stock.length; i++) {
        let res = await finnhubClient.quote(stock[i]);
        stockData.push(res.data);
    }
    return stockData;
}
