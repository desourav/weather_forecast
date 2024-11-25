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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllData = void 0;
const finnhub_ts_1 = require("finnhub-ts");
const ts_newsapi_1 = __importDefault(require("ts-newsapi"));
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
        let currentWeather = yield fetchNWSData("https://api.weather.gov/stations/KHPN/observations"); // nearest weather station: HPN airport
        let currentWeatherProps = currentWeather.features[0].properties;
        let currIcon = currentWeatherProps.icon;
        let currDesc = "";
        currentWeatherProps.presentWeather.map((w) => {
            currDesc = currDesc + (w.intensity != null ? w.intensity + " " : " ");
            currDesc = currDesc + (w.weather != null ? w.weather + " " : " ");
        });
        let currTemp = currentWeatherProps.temperature.value;
        let currentWindspeed = currentWeatherProps.windSpeed.value;
        let forecastArray = weatherArray.properties.periods;
        for (let i = 0; i < forecastArray.length; i++) {
            let dailyWeather = {
                "name": forecastArray[i].name,
                "temperature": forecastArray[i].temperature,
                "windSpeed": forecastArray[i].windSpeed,
                "shortForecast": forecastArray[i].shortForecast,
                "detailedForecast": forecastArray[i].detailedForecast
            };
            weather.push(dailyWeather);
        }
        let stockArray = ['SPY', 'AAPL', 'GOOGL', 'NVDA', 'META', 'IBM', 'MSFT', 'TSLA', 'VOO', 'VUG', 'VGT', 'VTWO', 'VOT'];
        let stockPriceData = yield getStockPrice(stockArray);
        let worldNews = yield getWorldnews();
        res.status(200).render(__dirname + "/index.html", {
            jsonData: weather,
            stockArray: stockArray,
            stockData: stockPriceData,
            worldNews: worldNews
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
        const apiKey = 'aa8b64e86aa9434eb08b9e0021139221';
        const newsAPI = new ts_newsapi_1.default(apiKey);
        // Top and breaking headlines  
        const topHeadlines = yield newsAPI.getTopHeadlines({
            // q: 'stocks',
            country: 'us',
            // category: 'business',
            pageSize: 20,
            page: 1,
        });
        let worldNews = [];
        topHeadlines.articles.forEach((news => {
            worldNews.push(news.title);
        }));
        return worldNews;
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
            throw new Error("Network response was not ok");
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
