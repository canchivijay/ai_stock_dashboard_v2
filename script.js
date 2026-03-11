/* ============================
   NSE STOCK DASHBOARD FIXED
============================= */


/* LOAD NSE STOCK LIST */

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
stocks.push(cols[1].trim().toUpperCase());
}

}

return stocks;

}


/* RSI */

function calcRSI(prices){

let gains=0;
let losses=0;

for(let i=1;i<prices.length;i++){

let diff=prices[i]-prices[i-1];

if(diff>0) gains+=diff;
else losses+=Math.abs(diff);

}

let rs=gains/(losses||1);

return (100-(100/(1+rs))).toFixed(2);

}


/* EMA */

function EMA(values,period){

let k=2/(period+1);

let ema=values[0];

for(let i=1;i<values.length;i++){

ema = values[i]*k + ema*(1-k);

}

return ema;

}


/* MACD */

function calcMACD(prices){

let ema12=EMA(prices,12);
let ema26=EMA(prices,26);

return (ema12-ema26).toFixed(2);

}


/* TREND */

function detectTrend(prices){

let sma20 =
prices.slice(0,20).reduce((a,b)=>a+b)/20;

let sma50 =
prices.slice(0,50).reduce((a,b)=>a+b)/50;

if(sma20>sma50) return "BULLISH";

if(sma20<sma50) return "BEARISH";

return "SIDEWAYS";

}


/* SIGNAL ENGINE */

function signals(rsi,macd){

let intraday="HOLD";
let shortTerm="HOLD";
let longTerm="HOLD";

if(rsi<35 && macd>0) intraday="BUY";

if(rsi>60 && macd>0) shortTerm="BUY";

if(macd>1) longTerm="BUY";

return [intraday,shortTerm,longTerm];

}


/* ANALYZE STOCK */

async function analyzeStock(){

let symbol =
document.getElementById("symbolInput")
.value.trim().toUpperCase();

if(!symbol){

alert("Enter NSE stock like TCS or NTPC");
return;

}

/* verify stock exists */

let stocks = await loadNSEStocks();

if(!stocks.includes(symbol)){

alert("Stock not listed in NSE");

return;

}


/* simulate price */

let price =
Math.floor(Math.random()*2000)+100;


/* simulate history */

let prices=[];

for(let i=0;i<60;i++){

prices.push(price+(Math.random()-0.5)*20);

}

let rsi=calcRSI(prices);
let macd=calcMACD(prices);
let trend=detectTrend(prices);
let sig=signals(rsi,macd);


/* update UI */

document.getElementById("price").innerText=price;

document.getElementById("rsi").innerText=rsi;

document.getElementById("macd").innerText=macd;

document.getElementById("trend").innerText=trend;

document.getElementById("intraday").innerText=sig[0];
document.getElementById("shortterm").innerText=sig[1];
document.getElementById("longterm").innerText=sig[2];

}


/* MARKET SCANNER */

async function startScanner(){

let table =
document.getElementById("scanner");

table.innerHTML="Loading NSE stocks...";

let stocks = await loadNSEStocks();

stocks = stocks.slice(0,20);

table.innerHTML="";

for(let s of stocks){

let price=Math.floor(Math.random()*2000)+100;

let rsi=(Math.random()*60+20);
let macd=(Math.random()*4-2);

let breakout=Math.random()>0.7;
let volume=Math.random()>0.6;

let score =
(rsi<40?1:0)+
(macd>0?1:0)+
(breakout?1:0)+
(volume?1:0);

table.innerHTML+=`

<tr>
<td>${s}</td>
<td>${price}</td>
<td>${rsi.toFixed(1)}</td>
<td>${macd.toFixed(2)}</td>
<td>${breakout?"YES":"NO"}</td>
<td>${volume?"YES":"NO"}</td>
<td>${score}</td>
</tr>

`;

}

}
