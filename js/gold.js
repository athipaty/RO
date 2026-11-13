"use strict";
/* ================= gold sinks: the Waystation inn and Guild Hall resets ================= */
const REST_MS=15*60*1000, REST_BONUS=.1;
const innCost=()=>50+P.lv*10;
const statResetCost=()=>500+P.lv*100;
const skillResetCost=()=>300+P.jl*50;
const restedLeft=()=>P&&P.rested?Math.max(0,P.rested-Date.now()):0;
const isRested=()=>restedLeft()>0;
const restedText=()=>{const m=Math.ceil(restedLeft()/60000);return m>0?`Well rested ${m}m`:'';};
// points spent raising a stat from 1 to v (each raise costs statCost of the value before it)
function statSpent(v){let n=0;for(let u=1;u<v;u++)n+=statCost(u);return n;}
let resetAsk=null; // which reset is waiting for a second click
// test server: stat and skill resets at the Guild Hall cost nothing (set to false to charge gold again)
const FREE_RESETS=true;
const resetCost=k=>FREE_RESETS?0:(k==='stats'?statResetCost():skillResetCost());

function innHtml(){const c=innCost(),r=isRested();
  return `<h3>Bunk room</h3><div class="row"><div class="grow"><div class="nm">Rent a bunk</div><div class="ds">Full HP and SP, and you wake <b>Well rested</b>: +${REST_BONUS*100}% EXP and job EXP for ${REST_MS/60000} minutes${r?` · <span class="gold">${restedText()} left</span>`:''}</div></div><span class="gold">${fmt(c)}</span><button class="btn small" data-act="inn" ${P.gold>=c?'':'disabled'}>Rest</button></div>`;}
PANEL_ACTS.inn=()=>{const c=innCost();if(P.gold<c)return;P.gold-=c;S=computeStats();P.hp=S.maxhp;P.sp=S.maxsp;P.rested=Date.now()+REST_MS;
  sfx('coin');fx.push({k:'heal',x:P.x,y:P.y,t0:now,dur:.8});floatT(P.x,P.y-44,'Well rested','#ffe7a0',13);
  addLog(`You rest at the Waystation for ${fmt(c)} gold. Well rested: +${REST_BONUS*100}% EXP for ${REST_MS/60000} minutes.`,'l-good');refreshPanel();save();};

function respecHtml(){
  const spentStats=Object.values(P.st).reduce((a,v)=>a+statSpent(v),0),spentSkills=Object.values(P.skills).reduce((a,v)=>a+v,0);
  if(!spentStats&&!spentSkills)return '';
  let h=`<h3>Retraining</h3><div class="ds" style="margin-bottom:4px">${FREE_RESETS?'Corvin undoes your training for free while Embervale is being tested, so try every build you like.':'Corvin can undo your training for a fee.'} You get every point back to spend again.</div>`;
  const row=(k,name,pts,cost)=>{if(!pts)return '';const ask=resetAsk===k;
    return `<div class="row"><div class="grow"><div class="nm">${name}</div><div class="ds">Gives back ${pts} point${pts>1?'s':''}${ask?' · <span style="color:#ffcf5a">click again to confirm</span>':''}</div></div><span class="gold">${cost?fmt(cost):'Free'}</span><button class="btn small${ask?' on':''}" data-act="respec" data-arg="${k}" ${P.gold>=cost?'':'disabled'}>${ask?'Confirm':'Reset'}</button></div>`;};
  h+=row('stats','Reset stat points',spentStats,resetCost('stats'));
  h+=row('skills','Reset skill points',spentSkills,resetCost('skills'));
  return h;}
PANEL_ACTS.respec=k=>{
  const cost=resetCost(k);if(P.gold<cost)return;
  if(resetAsk!==k){resetAsk=k;refreshPanel();return;}
  resetAsk=null;P.gold-=cost;sfx('coin');
  if(k==='stats'){let n=0;for(const s in P.st){n+=statSpent(P.st[s]);P.st[s]=1;}P.statPts+=n;S=computeStats();P.hp=Math.min(P.hp,S.maxhp);P.sp=Math.min(P.sp,S.maxsp);
    addLog(`Your stats are reset. ${n} stat points to spend again (C).`,'l-good');}
  else{let n=0;for(const s in P.skills)n+=P.skills[s];P.skills={};P.useLv={};P.skillPts+=n;rebuildHotbar();
    addLog(`Your skills are reset. ${n} skill points to spend again (K).`,'l-good');}
  refreshPanel();save();};
PANEL_CLOSE.job=()=>{resetAsk=null;};
