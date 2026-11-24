'use strict';
// No exchange connections, blockchain calls, private keys, or real transactions.
const KEY='standalone-demo-trading-v1', BASE={DEMO:.0001,MOON:.002,TUCK:.00005};
const fresh=()=>({cash:500,realized:0,day:new Date().toDateString(),dayEquity:500,prices:{...BASE},positions:{},journal:[]});
let state;
try{state=JSON.parse(localStorage.getItem(KEY))||fresh();if(!state.prices||!state.positions||!Array.isArray(state.journal))throw Error('Invalid');}catch{state=fresh();}
let timer=null, autoTrading=false, autoBuys=0, lastAutoExit=0;
const AUTO_BUY_LIMIT=10, AUTO_AMOUNT=50, AUTO_COOLDOWN_MS=30000;
const el=id=>document.getElementById(id),gbp=n=>'£'+Number(n).toFixed(2),usd=n=>'$'+Number(n).toFixed(8);
const equity=()=>state.cash+Object.keys(state.positions).reduce((a,s)=>a+state.positions[s].qty*state.prices[s],0);
const lossToday=()=>state.journal.filter(x=>x.type==='SELL'&&x.day===state.day).reduce((a,x)=>a+Math.min(0,x.pnl),0);
function dayCheck(){if(state.day!==new Date().toDateString()){state.day=new Date().toDateString();state.dayEquity=equity();}}
function record(type,s,detail,pnl=0){state.journal.unshift({type,s,detail,pnl,day:state.day,date:new Date().toLocaleString()});state.journal=state.journal.slice(0,100);}
function render(){dayCheck();const s=el('token').value;el('cash').textContent=gbp(state.cash);el('equity').textContent=gbp(equity());el('realized').textContent=gbp(state.realized);el('count').textContent=Object.keys(state.positions).length;el('losses').textContent=gbp(-lossToday());el('price').textContent=usd(state.prices[s]);el('change').textContent=((state.prices[s]/BASE[s]-1)*100).toFixed(2)+'%';el('positions').innerHTML=Object.entries(state.positions).map(([t,p])=>`<div class="pos"><b>${t}</b> · ${p.qty.toFixed(2)} units · cost ${gbp(p.cost)} · value ${gbp(p.qty*state.prices[t])} · P/L ${gbp(p.qty*state.prices[t]-p.cost)} · stop ${usd(p.entry*.94)}</div>`).join('')||'No open positions';el('journal').innerHTML=state.journal.map(j=>`<div class="entry"><b>${j.type} ${j.s}</b> · ${j.detail}<br><small>${j.date}</small></div>`).join('')||'No trades';localStorage.setItem(KEY,JSON.stringify(state));}
function message(s){el('message').textContent=s;}
function sell(s,reason){const p=state.positions[s];if(!p){message('No open position for '+s);return;}const proceeds=p.qty*state.prices[s]*.995,pnl=proceeds-p.cost;state.cash+=proceeds;state.realized+=pnl;delete state.positions[s];record('SELL',s,`${reason}: proceeds ${gbp(proceeds)}, P/L ${gbp(pnl)}`,pnl);message(`${s} sold: ${gbp(pnl)} simulated P/L`);render();}
function buy(){dayCheck();const s=el('token').value,amount=Number(el('amount').value);if(!Number.isFinite(amount)||amount<1){message('Enter an amount of at least £1.');return;}if(lossToday()<=-state.dayEquity*.04){message('Blocked: daily realised-loss limit reached.');return;}if(state.positions[s]){message('Already holding this token.');return;}if(amount>state.cash){message('Not enough virtual cash.');return;}if(amount>equity()*.4){message('Blocked: 40% maximum per position.');return;}const entry=state.prices[s]*1.005;state.positions[s]={qty:amount/entry,cost:amount,entry};state.cash-=amount;record('BUY',s,`${gbp(amount)} at ${usd(entry)} (0.5% simulated slippage)`);message('Virtual purchase recorded.');render();}
function stopAutoTrading(reason){autoTrading=false;el('autoTrade').textContent='Start auto trading';message(reason);}
function tick(){
  dayCheck();
  for(const s of Object.keys(state.prices)){
    state.prices[s]=Math.max(BASE[s]*.05,state.prices[s]*(1+(Math.random()-.52)*.08));
  }
  for(const [s,p] of Object.entries(state.positions)){
    if(state.prices[s]<=p.entry*.94){sell(s,'STOP LOSS');lastAutoExit=Date.now();}
    else if(autoTrading && state.prices[s]>=p.entry*1.10){sell(s,'AUTO TAKE PROFIT +10%');lastAutoExit=Date.now();}
  }
  if(autoTrading && Object.keys(state.positions).length===0 && Date.now()-lastAutoExit>=AUTO_COOLDOWN_MS){
    if(autoBuys>=AUTO_BUY_LIMIT){stopAutoTrading('Auto trading ended after 10 demo buys.');}
    else if(lossToday()<=-state.dayEquity*.04){stopAutoTrading('Auto trading stopped at daily loss limit.');}
    else if(state.cash<AUTO_AMOUNT || AUTO_AMOUNT>equity()*.4){stopAutoTrading('Auto trading stopped: insufficient virtual cash or position limit.');}
    else {
      const s=el('token').value, entry=state.prices[s]*1.005;
      state.positions[s]={qty:AUTO_AMOUNT/entry,cost:AUTO_AMOUNT,entry};
      state.cash-=AUTO_AMOUNT;
      autoBuys++;
      record('BUY',s,`AUTO ${autoBuys}/10: £50 fictional token at ${usd(entry)} (0.5% simulated slippage); TEST signal only`);
      message(`Auto buy ${autoBuys}/10: £50 fictional ${s} opened.`);
    }
  }
  render();
}
el('buy').onclick=buy;el('sell').onclick=()=>sell(el('token').value,'MANUAL');el('tick').onclick=tick;el('token').onchange=render;
el('auto').onclick=()=>{if(timer){clearInterval(timer);timer=null;if(autoTrading)stopAutoTrading('Auto trading stopped with auto prices.');el('auto').textContent='Start auto prices';message('Auto simulation stopped.');}else{timer=setInterval(tick,3000);el('auto').textContent='Stop auto prices';message('Fictional prices changing every 3 seconds while this page stays open.');}};
el('autoTrade').onclick=()=>{
  if(autoTrading){stopAutoTrading('Auto trading paused; open positions remain.');return;}
  if(autoBuys>=AUTO_BUY_LIMIT)autoBuys=0;
  autoTrading=true;
  lastAutoExit=Date.now()-AUTO_COOLDOWN_MS;
  el('autoTrade').textContent='Stop auto trading';
  if(!timer){timer=setInterval(tick,3000);el('auto').textContent='Stop auto prices';}
  message('Auto trading ON: fictional prices, £50 trades, +10% take profit, −6% stop. Keep this tab open.');
  tick();
};
el('reset').onclick=()=>{if(confirm('Reset practice balance, open positions and journal?')){state=fresh();autoBuys=0;if(autoTrading)stopAutoTrading('Auto trading stopped on reset.');message('Account reset to £500.');render();}};
render();
