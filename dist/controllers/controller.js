"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllData = void 0;
const finnhub_ts_1 = require("finnhub-ts");
//  get all weather data
const getAllData = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let timestamp = new Date(Date.now());
        let lastUpdate = timestamp.getFullYear() + '/' + timestamp.getMonth() + '/' + timestamp.getDate() + ' ' + timestamp.toLocaleTimeString('en-US');
        console.log(`info: getting all data ${lastUpdate}`);
        let weather = [];
        let lat = "41.0762";
        let long = "-73.8587";
        let baseURL = "https://api.weather.gov/points/" + lat + "," + long;
        let geoJSONData = yield fetchNWSData(baseURL);
        let weatherArray = yield fetchNWSData(geoJSONData.properties.forecast + "?units=si");
        let currentWeather = yield fetchNWSData("https://api.weather.gov/stations/KHPN/observations"); // nearest weather station: Danbury Airport
        let currentWeatherProps = currentWeather.features[0].properties;
        let currIcon = "n/a", currTemp = "n/a", currDescription = "n/a", currWindspeed = "n/a", currFeelsLike = "n/a";
        if (currentWeatherProps != undefined) {
            currIcon = currentWeatherProps.icon == null ? "n/a" : currentWeatherProps.icon.replace("medium", "large");
            currTemp = parseFloat(currentWeatherProps.temperature.value).toFixed(1);
            currDescription = currentWeatherProps.textDescription;
            currWindspeed = currentWeatherProps.windSpeed.value == null ? "unknown" : parseFloat(currentWeatherProps.windSpeed.value).toFixed(1);
            currFeelsLike = currentWeatherProps.windChill.value == null ? "unknown" : parseFloat(currentWeatherProps.windChill.value).toFixed(1);
        }
        let forecastArray = weatherArray.properties == undefined ? [] : weatherArray.properties.periods;
        for (let i = 0; i < forecastArray.length; i++) {
            let dailyWeather = {
                "name": forecastArray[i].name.replace("This", "").replace("Day", "AM").replace("Night", "PM"),
                "temperature": forecastArray[i].temperature,
                "windSpeed": forecastArray[i].windSpeed,
                "shortForecast": forecastArray[i].shortForecast,
                "detailedForecast": forecastArray[i].detailedForecast,
                "icon": forecastArray[i].icon
            };
            weather.push(dailyWeather);
        }
        let stockArray = ['SPY', 'AAPL', 'GOOGL', 'NVDA', 'META', 'IBM', 'MSFT', 'TSLA', 'VOO', 'VUG', 'VGT', 'VTWO', 'VOT'];
        let stockPriceData = yield getStockPrice(stockArray);
        let newsResponse = yield getWorldnews();
        let worldNews = [];
        if (newsResponse.results != undefined) {
            for (let i = 0; i < newsResponse.results.length; i++) {
                if ((newsResponse.results[i].title.length > 0) && (newsResponse.results[i].abstract.length > 0)
                    && newsResponse.results[i].multimedia[2].url != undefined) {
                    let news = {
                        title: newsResponse.results[i].title,
                        abstract: newsResponse.results[i].abstract,
                        icon: newsResponse.results[i].multimedia[2].url
                    };
                    worldNews.push(news);
                }
            }
        }
        let epochTime = Date.now();
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
    }
    catch (error) {
        next(error);
    }
});
exports.getAllData = getAllData;
// get all top news : call every 15 mins (100 per day limit)
function getWorldnews() {
    return __awaiter(this, void 0, void 0, function* () {
        let apiKey = "pUM24Qb2wsN7AmVQX7lInxm0uLRkyfZ3";
        let url = "https://api.nytimes.com/svc/topstories/v2/world.json?api-key=" + apiKey;
        try {
            const res = yield fetch(url);
            const json = res.json();
            return json;
        }
        catch (error) {
            throw new Error("getWorldnews: Network response was not ok");
        }
    });
}
function fetchNWSData(url) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const res = yield fetch(url);
            const json = res.json();
            return json;
        }
        catch (error) {
            throw new Error("fetchNWSData: Network response was not ok");
        }
    });
}
// get all stock data
function getStockPrice(stock) {
    return __awaiter(this, void 0, void 0, function* () {
        let stockData = [];
        const finnhubClient = new finnhub_ts_1.DefaultApi({
            apiKey: 'cspc6j1r01qnvmpus3bgcspc6j1r01qnvmpus3c0',
            isJsonMime: (input) => {
                try {
                    JSON.parse(input);
                    return true;
                }
                catch (error) { }
                return false;
            },
        });
        for (let i = 0; i < stock.length; i++) {
            let res = yield finnhubClient.quote(stock[i]);
            stockData.push(res.data);
        }
        return stockData;
    });
}
