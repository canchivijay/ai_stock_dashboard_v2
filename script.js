/* ===============================
   AI STOCK DASHBOARD - WORKING VERSION
================================ */

async function fetchPrice(symbol){

symbol = symbol.toUpperCase();

symbol = symbol.replace(".BSE","");
symbol = symbol.replace(".NS","");

try{

const url =
`https://api.allorigins.win/raw?url=https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbol}.NS`;

const res = await fetch(url);

const data = await res.json();

console.log(data);

return data.quoteResponse.result[0].regularMarketPrice;

}catch(e){

console.log(e);

return null;

}

}


/* ===============================
   RSI
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


/* ===============================
   EMA
================================ */

function EMA(values,period){

let k=2/(period+1);

let ema=values[0];

for(let i=1;i<values.length;i++){

ema = values[i]*k + ema*(1-k);

}

return ema;

}


/* ===============================
   MACD
================================ */

function calcMACD(prices){

let ema12=EMA(prices,12);

let ema26=EMA(prices,26);

return (ema12-ema26).toFixed(2);

}


/* ===============================
   TREND
================================ */

function detectTrend(prices){

let sma20 =
prices.slice(0,20).reduce((a,b)=>a+b)/20;

let sma50 =
prices.slice(0,50).reduce((a,b)=>a+b)/50;

if(sma20>sma50) return "BULLISH";

if(sma20<sma50) return "BEARISH";

return "SIDEWAYS";

}


/* ===============================
   SIGNAL ENGINE
================================ */

function signals(rsi,macd){

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


/* ===============================
   ANALYZE STOCK
================================ */

async function analyzeStock(){

let symbol =
document.getElementById("symbolInput")
.value
.trim();

if(!symbol){

alert("Enter stock like RELIANCE");

return;

}

document.getElementById("price").innerText="Loading...";

let price = await fetchPrice(symbol);

if(!price){

alert("Stock not found");

return;

}

/* create sample price history */

let prices=[];

for(let i=0;i<60;i++){

prices.push(price + (Math.random()-0.5)*20);

}

let rsi = calcRSI(prices);

let macd = calcMACD(prices);

let trend = detectTrend(prices);

let sig = signals(rsi,macd);

document.getElementById("price").innerText=price;

document.getElementById("rsi").innerText=rsi;

document.getElementById("macd").innerText=macd;

document.getElementById("trend").innerText=trend;

document.getElementById("intraday").innerText=sig[0];

document.getElementById("shortterm").innerText=sig[1];

document.getElementById("longterm").innerText=sig[2];

}


/* ===============================
   DEMO NSE SCANNER
================================ */

async function startScanner(){

const stocks=[

"RELIANCE",
"TCS",
"INFY",
"HDFCBANK",
"SBIN",
"ICICIBANK",
"LT",
"ITC"

];

let table=document.getElementById("scanner");

table.innerHTML="";

for(let s of stocks){

let price = await fetchPrice(s);

if(!price) continue;

let rsi = (Math.random()*60+20);

let macd = (Math.random()*4-2);

let breakout = Math.random()>0.7;

let volume = Math.random()>0.6;

let score =
(rsi<40?1:0)+
(macd>0?1:0)+
(breakout?1:0)+
(volume?1:0);

table.innerHTML+=`

<tr>
<td>${s}</td>
<td>${price.toFixed(2)}</td>
<td>${rsi.toFixed(1)}</td>
<td>${macd.toFixed(2)}</td>
<td>${breakout?"YES":"NO"}</td>
<td>${volume?"YES":"NO"}</td>
<td>${score}</td>
</tr>

`;

}

}
