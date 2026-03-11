
const API_KEY="ID9GKDX0E3Z3TP9A";

async function fetchData(symbol){

let url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`;

let res=await fetch(url);
let data=await res.json();

return data["Time Series (Daily)"];
}

function calcRSI(prices){

let gains=0;
let losses=0;

for(let i=1;i<prices.length;i++){

let diff=prices[i]-prices[i-1];

if(diff>0) gains+=diff;
else losses+=Math.abs(diff);

}

let rs=gains/(losses||1);
let rsi=100-(100/(1+rs));

return rsi.toFixed(2);
}

function calcEMA(values,period){

let k=2/(period+1);
let ema=values[0];

for(let i=1;i<values.length;i++){
ema=values[i]*k+ema*(1-k);
}

return ema;
}

function calcMACD(prices){

let ema12=calcEMA(prices,12);
let ema26=calcEMA(prices,26);

return (ema12-ema26).toFixed(2);
}

function supportResistance(highs,lows,close){

let pivot=(highs[0]+lows[0]+close)/3;

let resistance=(2*pivot)-lows[0];
let support=(2*pivot)-highs[0];

return [support.toFixed(2),resistance.toFixed(2)];
}

function signal(rsi,macd){

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

async function analyzeStock(){

let symbol=document.getElementById("symbolInput").value.trim();

if(!symbol){
alert("Enter stock symbol like RELIANCE.BSE");
return;
}

let series=await fetchData(symbol);

if(!series){
alert("Stock not found");
return;
}

let dates=Object.keys(series).slice(0,30);

let prices=[];
let highs=[];
let lows=[];

for(let d of dates){

prices.push(parseFloat(series[d]["4. close"]));
highs.push(parseFloat(series[d]["2. high"]));
lows.push(parseFloat(series[d]["3. low"]));

}

let price=prices[0];

let rsi=calcRSI(prices);

let macd=calcMACD(prices);

let sr=supportResistance(highs,lows,price);

let signals=signal(rsi,macd);

document.getElementById("price").innerText=price;

document.getElementById("rsi").innerText=rsi;

document.getElementById("macd").innerText=macd;

document.getElementById("intraday").innerText=signals[0];

document.getElementById("shortterm").innerText=signals[1];

document.getElementById("longterm").innerText=signals[2];

document.getElementById("support").innerText=sr[0];

document.getElementById("resistance").innerText=sr[1];

}
