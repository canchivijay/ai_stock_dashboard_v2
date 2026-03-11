/* ===============================
   FETCH STOCK PRICE
================================ */

async function fetchPrice(symbol){

symbol = symbol.toUpperCase();

try{

let url =
`https://api.allorigins.win/raw?url=https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbol}.NS`;

let res = await fetch(url);

let data = await res.json();

return data.quoteResponse.result[0].regularMarketPrice;

}catch{

return null;

}

}


/* ===============================
   ANALYZE STOCK
================================ */

async function analyzeStock(){

let symbol =
document.getElementById("symbolInput").value;

let price = await fetchPrice(symbol);

if(!price){

alert("Stock not found");

return;

}

document.getElementById("price").innerText=price;


/* fake price history */

let prices=[];

for(let i=0;i<60;i++){

prices.push(price+(Math.random()-0.5)*20);

}


/* RSI */

let gains=0;
let losses=0;

for(let i=1;i<prices.length;i++){

let diff=prices[i]-prices[i-1];

if(diff>0) gains+=diff;
else losses+=Math.abs(diff);

}

let rs=gains/(losses||1);

let rsi=(100-(100/(1+rs))).toFixed(2);


/* MACD */

let macd=(Math.random()*4-2).toFixed(2);


/* Trend */

let trend="SIDEWAYS";

if(rsi<40) trend="BULLISH";
if(rsi>70) trend="BEARISH";


/* Signals */

let intraday="HOLD";
let shortTerm="HOLD";
let longTerm="HOLD";

if(rsi<35 && macd>0) intraday="BUY";
if(rsi>60 && macd>0) shortTerm="BUY";
if(macd>1) longTerm="BUY";


document.getElementById("rsi").innerText=rsi;
document.getElementById("macd").innerText=macd;
document.getElementById("trend").innerText=trend;

document.getElementById("intraday").innerText=intraday;
document.getElementById("shortterm").innerText=shortTerm;
document.getElementById("longterm").innerText=longTerm;


/* CHART */

drawChart(prices);

}


/* ===============================
   CHART
================================ */

function drawChart(prices){

const chart =
LightweightCharts.createChart(
document.getElementById('chart'),
{
width:800,
height:400
}
);

const lineSeries =
chart.addLineSeries();

let data=[];

for(let i=0;i<prices.length;i++){

data.push({
time:i,
value:prices[i]
});

}

lineSeries.setData(data);

}


/* ===============================
   MARKET SCANNER
================================ */

function scanMarket(){

const stocks=[
"RELIANCE",
"TCS",
"INFY",
"SBIN",
"HDFCBANK",
"AXISBANK",
"ITC",
"LT",
"NTPC",
"BAJFINANCE"
];

let table=
document.getElementById("scanner");

table.innerHTML="";

for(let s of stocks){

let price=(Math.random()*2000+100).toFixed(2);

let rsi=(Math.random()*60+20);

let breakout=Math.random()>0.7;

let score=
(rsi<40?1:0)+
(breakout?1:0);

table.innerHTML+=`

<tr>
<td>${s}</td>
<td>${price}</td>
<td>${rsi.toFixed(1)}</td>
<td>${breakout?"YES":"NO"}</td>
<td>${score}</td>
</tr>

`;

}

}
