const API_KEY = "ID9GKDX0E3Z3TP9A";

async function fetchStockData(symbol){

    try{

        // automatically convert to NSE format
        if(!symbol.includes(".")){
            symbol = symbol + ".NS";
        }

        const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${API_KEY}`;

        const response = await fetch(url);
        const data = await response.json();

        console.log("API Response:", data);

        if(!data["Time Series (Daily)"]){
            alert("Stock not available or API limit reached");
            return null;
        }

        return data["Time Series (Daily)"];

    }catch(error){

        console.error("Fetch error:", error);
        alert("Error fetching stock data");
        return null;

    }

}


function calculateRSI(prices){

    let gains = 0;
    let losses = 0;

    for(let i=1;i<prices.length;i++){

        let diff = prices[i] - prices[i-1];

        if(diff > 0){
            gains += diff;
        }else{
            losses += Math.abs(diff);
        }

    }

    let rs = gains / (losses || 1);
    let rsi = 100 - (100/(1+rs));

    return rsi.toFixed(2);

}


function calculateEMA(values,period){

    let k = 2/(period+1);
    let ema = values[0];

    for(let i=1;i<values.length;i++){
        ema = values[i]*k + ema*(1-k);
    }

    return ema;

}


function calculateMACD(prices){

    let ema12 = calculateEMA(prices,12);
    let ema26 = calculateEMA(prices,26);

    let macd = ema12 - ema26;

    return macd.toFixed(2);

}


function calculateSupportResistance(highs,lows,close){

    let pivot = (highs[0] + lows[0] + close) / 3;

    let resistance = (2*pivot) - lows[0];
    let support = (2*pivot) - highs[0];

    return [
        support.toFixed(2),
        resistance.toFixed(2)
    ];

}


function generateSignals(rsi,macd){

    let intraday = "HOLD";
    let shortTerm = "HOLD";
    let longTerm = "HOLD";

    if(rsi < 35 && macd > 0){
        intraday = "BUY";
    }

    if(rsi > 60 && macd > 0){
        shortTerm = "BUY";
    }

    if(macd > 1){
        longTerm = "BUY";
    }

    return [intraday,shortTerm,longTerm];

}


async function analyzeStock(){

    let symbol = document.getElementById("symbolInput").value.trim().toUpperCase();

    if(!symbol){
        alert("Enter stock symbol like RELIANCE or TCS");
        return;
    }

    const series = await fetchStockData(symbol);

    if(!series) return;

    const dates = Object.keys(series).slice(0,30);

    let prices = [];
    let highs = [];
    let lows = [];

    for(let d of dates){

        prices.push(parseFloat(series[d]["4. close"]));
        highs.push(parseFloat(series[d]["2. high"]));
        lows.push(parseFloat(series[d]["3. low"]));

    }

    const latestPrice = prices[0];

    const rsi = calculateRSI(prices);
    const macd = calculateMACD(prices);

    const sr = calculateSupportResistance(highs,lows,latestPrice);

    const signals = generateSignals(rsi,macd);

    document.getElementById("price").innerText = latestPrice;

    document.getElementById("rsi").innerText = rsi;
    document.getElementById("macd").innerText = macd;

    document.getElementById("intraday").innerText = signals[0];
    document.getElementById("shortterm").innerText = signals[1];
    document.getElementById("longterm").innerText = signals[2];

    document.getElementById("support").innerText = sr[0];
    document.getElementById("resistance").innerText = sr[1];

}
