/* =================================
   AI STOCK DASHBOARD SCRIPT
================================= */

const API_KEY = "ID9GKDX0E3Z3TP9A";


/* ================================
   CLEAN SYMBOL INPUT
================================ */

function cleanSymbol(symbol){

symbol = symbol.toUpperCase();

symbol = symbol.replace(".BSE","");
symbol = symbol.replace(".NS","");

return symbol;

}


/* ================================
   FETCH LIVE PRICE
================================ */

async function fetchLivePrice(symbol){

const url =
`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}.NS&apikey=${API_KEY}`;

try{

const res = await fetch(url);

const data = await res.json();

console.log("API Response:",data);

if(!data["Global Quote"]){

return null;

}

return parseFloat(
data["Global Quote"]["05. price"]
);

}catch(err){

console.log(err);

return null;

}

}


/* ================================
   RSI CALCULATION
================================ */

function calcRSI(prices){

let gains=0;
let losses=0;

for(let i=1;i<prices.length;i++){

let diff = prices[i]-prices[i-1];

if(diff>0) gains+=diff;
else losses+=Math.abs(diff);

}

let rs=gains/(losses||1);

let rsi = 100-(100/(1+rs));

return rsi.toFixed(2);

}


/* ================================
   EMA
================================ */

function EMA(values,period){

let k = 2/(period+1);

let ema = values[0];

for(let i=1;i<values.length;i++){

ema = values[i]*k + ema*(1-k);

}

return ema;

}


/* ================================
   MACD
================================ */

function calcMACD(prices){

let ema12 = EMA(prices,12);

let ema26 = EMA(prices,26);

return (ema12-ema26).toFixed(2);

}


/* ================================
   TREND
================================ */

function detectTrend(prices){

if(prices.length < 50){

return "SIDEWAYS";

}

let sma20 =
prices.slice(0,20).reduce((a,b)=>a+b)/20;

let sma50 =
prices.slice(0,50).reduce((a,b)=>a+b)/50;

if(sma20>sma50){

return "BULLISH";

}

if(sma20<sma50){

return "BEARISH";

}

return "SIDEWAYS";

}


/* ================================
   SIGNAL ENGINE
================================ */

function generateSignals(rsi,macd){

let intraday="HOLD";
let shortTerm="HOLD";
let longTerm="HOLD";

if(rsi<35 && macd>0){

intraday="BUY";

}

if(rsi>60 && macd>0){

shortTerm="BUY";

}

if(macd>1){

longTerm="BUY";

}

return [intraday,shortTerm,longTerm];

}


/* ================================
   MAIN ANALYSIS
================================ */

async function analyzeStock(){

let symbol =
document.getElementById("symbolInput")
.value
.trim();

symbol = cleanSymbol(symbol);

if(!symbol){

alert("Enter stock symbol like RELIANCE");

return;

}

/* show loading */

document.getElementById("price").innerText="Loading...";

/* fetch live price */

let price = await fetchLivePrice(symbol);

if(!price){

alert("Stock not found or API limit reached");

return;

}

/* fake price history (demo only) */

let prices=[];

for(let i=0;i<60;i++){

prices.push(price + (Math.random()-0.5)*20);

}

/* indicators */

let rsi = calcRSI(prices);

let macd = calcMACD(prices);

let trend = detectTrend(prices);

let signals = generateSignals(rsi,macd);


/* update dashboard */

document.getElementById("price")
.innerText = price.toFixed(2);

document.getElementById("rsi")
.innerText = rsi;

document.getElementById("macd")
.innerText = macd;

document.getElementById("trend")
.innerText = trend;

document.getElementById("intraday")
.innerText = signals[0];

document.getElementById("shortterm")
.innerText = signals[1];

document.getElementById("longterm")
.innerText = signals[2];

}


/* ================================
   NSE SCANNER (LIMITED DEMO)
================================ */

async function startScanner(){

const demoStocks = [

"RELIANCE",
"TCS",
"INFY",
"HDFCBANK",
"SBIN",
"ICICIBANK",
"LT",
"ITC"

];

let table =
document.getElementById("scanner");

table.innerHTML="";

for(let stock of demoStocks){

let price = await fetchLivePrice(stock);

if(!price) continue;

let rsi = (Math.random()*60+20);

let macd = (Math.random()*4-2);

let breakout = Math.random()>0.7;

let volumeSpike = Math.random()>0.6;

let score =

(rsi<40?1:0)+
(macd>0?1:0)+
(breakout?1:0)+
(volumeSpike?1:0);

table.innerHTML+=

`<tr>
<td>${stock}</td>
<td>${price.toFixed(2)}</td>
<td>${rsi.toFixed(1)}</td>
<td>${macd.toFixed(2)}</td>
<td>${breakout?"YES":"NO"}</td>
<td>${volumeSpike?"YES":"NO"}</td>
<td>${score}</td>
</tr>`;

}

}
