const API_KEY = "8P9HW0R60QFKNE7J";

async function fetchStock(symbol){

    try{

        if(!symbol.includes(".")){
            symbol = symbol + ".NS";
        }

        const url =
        `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${API_KEY}`;

        const res = await fetch(url);
        const data = await res.json();

        console.log("API:", data);

        if(!data["Time Series (Daily)"]){
            alert("Stock not found or API limit reached");
            return null;
        }

        return data["Time Series (Daily)"];

    }catch(e){

        console.error(e);
        alert("Error loading stock");

        return null;
    }
}


function getPrices(series){

    const dates = Object.keys(series).slice(0,100);

    let prices=[];
    let highs=[];
    let lows=[];

    for(let d of dates){

        prices.push(parseFloat(series[d]["4. close"]));
        highs.push(parseFloat(series[d]["2. high"]));
        lows.push(parseFloat(series[d]["3. low"]));

    }

    return {prices,highs,lows};
}


function EMA(values,period){

    let k = 2/(period+1);
    let ema = values[0];

    for(let i=1;i<values.length;i++){
        ema = values[i]*k + ema*(1-k);
    }

    return ema;
}


function RSI(prices){

    let gains=0;
    let losses=0;

    for(let i=1;i<15;i++){

        let diff = prices[i]-prices[i-1];

        if(diff>0) gains+=diff;
        else losses+=Math.abs(diff);

    }

    let rs=gains/(losses||1);

    return (100-(100/(1+rs))).toFixed(2);
}


function MACD(prices){

    let ema12 = EMA(prices,12);
    let ema26 = EMA(prices,26);

    return (ema12-ema26).toFixed(2);
}


function SMA(prices,period){

    let sum=0;

    for(let i=0;i<period;i++){
        sum+=prices[i];
    }

    return (sum/period).toFixed(2);
}


function supportResistance(highs,lows,price){

    let pivot = (highs[0]+lows[0]+price)/3;

    let resistance = (2*pivot)-lows[0];
    let support = (2*pivot)-highs[0];

    return {
        support:support.toFixed(2),
        resistance:resistance.toFixed(2)
    };
}


function signals(rsi,macd){

    let intraday="HOLD";
    let shortTerm="HOLD";
    let longTerm="HOLD";

    if(rsi<35 && macd>0) intraday="BUY";

    if(rsi>60 && macd>0) shortTerm="BUY";

    if(macd>1) longTerm="BUY";

    return {intraday,shortTerm,longTerm};
}


function trend(sma20,sma50,sma200){

    if(sma20>sma50 && sma50>sma200) return "STRONG BULLISH";

    if(sma20<sma50 && sma50<sma200) return "STRONG BEARISH";

    return "SIDEWAYS";
}


async function analyzeStock(){

    let symbol =
    document.getElementById("symbolInput").value.trim().toUpperCase();

    if(!symbol){

        alert("Enter stock like RELIANCE or TCS");

        return;
    }

    const series = await fetchStock(symbol);

    if(!series) return;

    const data = getPrices(series);

    const prices = data.prices;
    const highs = data.highs;
    const lows = data.lows;

    const price = prices[0];

    const rsi = RSI(prices);
    const macd = MACD(prices);

    const sma20 = SMA(prices,20);
    const sma50 = SMA(prices,50);
    const sma200 = SMA(prices,100);

    const sr = supportResistance(highs,lows,price);

    const sig = signals(rsi,macd);

    const marketTrend = trend(sma20,sma50,sma200);


    document.getElementById("price").innerText = price;

    document.getElementById("rsi").innerText = rsi;

    document.getElementById("macd").innerText = macd;

    document.getElementById("intraday").innerText = sig.intraday;

    document.getElementById("shortterm").innerText = sig.shortTerm;

    document.getElementById("longterm").innerText = sig.longTerm;

    document.getElementById("support").innerText = sr.support;

    document.getElementById("resistance").innerText = sr.resistance;

    document.getElementById("trend").innerText = marketTrend;

}
