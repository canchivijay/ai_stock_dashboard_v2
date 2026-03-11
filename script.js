const API_KEY = "8P9HW0R60QFKNE7J";

/* ---------------------------------
   LOAD NSE STOCK LIST
----------------------------------*/

async function loadNSEStocks(){

const url =
"https://raw.githubusercontent.com/datasets/nse-listed/master/data/companies.csv";

const res = await fetch(url);

const text = await res.text();

const rows = text.split("\n");

let stocks=[];

for(let i=1;i<rows.length;i++){

let cols = rows[i].split(",");

if(cols[1]){
stocks.push(cols[1].trim());
}

}

return stocks;

}


/* ---------------------------------
   FETCH STOCK DATA
----------------------------------*/

async function fetchStock(symbol){

symbol = symbol + ".NS";

const url =
`https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${API_KEY}`;

const res = await fetch(url);

const data = await res.json();

if(!data["Time Series (Daily)"]){
return null;
}

return data["Time Series (Daily)"];

}


/* ---------------------------------
   EXTRACT MARKET DATA
----------------------------------*/

function extract(series){

const dates = Object.keys(series).slice(0,100);

let close=[];
let high=[];
let low=[];
let volume=[];

for(let d of dates){

close.push(parseFloat(series[d]["4. close"]));
high.push(parseFloat(series[d]["2. high"]));
low.push(parseFloat(series[d]["3. low"]));
volume.push(parseFloat(series[d]["5. volume"]));

}

return {close,high,low,volume};

}


/* ---------------------------------
   EMA
----------------------------------*/

function EMA(values,period){

let k=2/(period+1);
let ema=values[0];

for(let i=1;i<values.length;i++){

ema = values[i]*k + ema*(1-k);

}

return ema;

}


/* ---------------------------------
   RSI
----------------------------------*/

function RSI(prices){

let gains=0;
let losses=0;

for(let i=1;i<15;i++){

let diff = prices[i]-prices[i-1];

if(diff>0) gains+=diff;
else losses+=Math.abs(diff);

}

let rs=gains/(losses||1);

return 100-(100/(1+rs));

}


/* ---------------------------------
   MACD
----------------------------------*/

function MACD(prices){

let ema12 = EMA(prices,12);
let ema26 = EMA(prices,26);

return ema12-ema26;

}


/* ---------------------------------
   BOLLINGER BANDS
----------------------------------*/

function bollinger(prices){

let period=20;

let slice = prices.slice(0,period);

let avg = slice.reduce((a,b)=>a+b)/period;

let variance =
slice.reduce((sum,v)=>sum+Math.pow(v-avg,2),0)/period;

let std=Math.sqrt(variance);

let upper = avg + 2*std;
let lower = avg - 2*std;

return {
middle:avg,
upper:upper,
lower:lower
};

}


/* ---------------------------------
   VOLUME SPIKE
----------------------------------*/

function volumeSpike(volume){

let avg =
volume.slice(1,20).reduce((a,b)=>a+b)/19;

return volume[0] > avg*1.5;

}


/* ---------------------------------
   BREAKOUT DETECTION
----------------------------------*/

function breakout(prices,high){

let recentHigh =
Math.max(...high.slice(1,20));

return prices[0] > recentHigh;

}


/* ---------------------------------
   BUY SIGNAL SCORE
----------------------------------*/

function buySignal(rsi,macd,breakout,volSpike){

let score=0;

if(rsi<40) score++;
if(macd>0) score++;
if(breakout) score++;
if(volSpike) score++;

return score;

}


/* ---------------------------------
   ANALYZE SINGLE STOCK
----------------------------------*/

async function analyze(symbol){

const series = await fetchStock(symbol);

if(!series) return null;

const data = extract(series);

const prices = data.close;

const rsi = RSI(prices);

const macd = MACD(prices);

const bb = bollinger(prices);

const volSpike = volumeSpike(data.volume);

const isBreakout = breakout(prices,data.high);

const score =
buySignal(rsi,macd,isBreakout,volSpike);

return {

symbol,
price:prices[0],
rsi:rsi,
macd:macd,
breakout:isBreakout,
volumeSpike:volSpike,
score:score,
upperBB:bb.upper,
lowerBB:bb.lower

};

}


/* ---------------------------------
   API DELAY (avoid limit)
----------------------------------*/

function delay(ms){
return new Promise(r=>setTimeout(r,ms));
}


/* ---------------------------------
   SCAN ENTIRE NSE MARKET
----------------------------------*/

async function scanMarket(){

const NSE_STOCKS = await loadNSEStocks();

let results=[];

for(let stock of NSE_STOCKS){

let data = await analyze(stock);

if(data){
results.push(data);
}

await delay(15000);   // avoid API limit

}

results.sort((a,b)=>b.score-a.score);

displayTop(results.slice(0,10));

}


/* ---------------------------------
   DISPLAY TOP 10 STOCKS
----------------------------------*/

function displayTop(stocks){

let table = document.getElementById("scanner");

table.innerHTML="";

for(let s of stocks){

table.innerHTML +=

`<tr>
<td>${s.symbol}</td>
<td>${s.price.toFixed(2)}</td>
<td>${s.rsi.toFixed(1)}</td>
<td>${s.macd.toFixed(2)}</td>
<td>${s.breakout?"YES":"NO"}</td>
<td>${s.volumeSpike?"YES":"NO"}</td>
<td>${s.score}</td>
</tr>`;

}

}


/* ---------------------------------
   START MARKET SCANNER
----------------------------------*/

function startScanner(){

scanMarket();

}
