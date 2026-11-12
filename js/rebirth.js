"use strict";
/* ================= #28 rebirth =================
   Seer Valen in Aurelmark's Scholars' Quarter offers rebirth to heroes at base level 70+ who hold an
   advanced calling at job level 50. For 50,000 gold you go back to base level 1 (stats reset) but keep your
   calling, skills, job level and gear. Reborn heroes, for good:
     · start again with 100 stat points, and earn one extra point every level
     · +25% Max HP and Max SP
     · "Reborn" before their calling, and a golden aura others see (presence rb)
   P.reborn counts rebirths (one for now; the third tier of callings can build on it later). */
const REBIRTH_LV=70,REBIRTH_GOLD=50000,REBIRTH_PTS=100;
function rebirthWhy(){if(P.reborn)return 'You have already been reborn.';
  if(P.lv<REBIRTH_LV)return `Reach base level ${REBIRTH_LV} first (you are ${P.lv}).`;
  if(baseOf(P.cls)===P.cls)return 'Earn an advanced calling first.';
  if(P.jl<jobMax(P.cls))return `Reach job level ${jobMax(P.cls)} first (you are ${P.jl}).`;
  if(P.gold<REBIRTH_GOLD)return `The rite costs ${fmt(REBIRTH_GOLD)} gold.`;
  return null;}
PANELS.rebirth=()=>{const why=rebirthWhy();
  let h=`<h2>Seer Valen</h2><div class="say">"Some heroes walk the long road twice, and walk it stronger. Give up your years of experience and I will give you a second beginning."</div>`;
  h+=`<h3>The rite of rebirth</h3><div class="sub">Needs base level ${REBIRTH_LV}+, an advanced calling at job level 50, and ${fmt(REBIRTH_GOLD)} gold.</div>`;
  h+=`<div class="dv"><div><span>You go back to</span><span>base level 1, stats reset</span></div><div><span>You keep</span><span>calling, skills, job level, gear, gold left</span></div>`+
    `<div><span>You start with</span><span>${REBIRTH_PTS} stat points</span></div><div><span>Every level</span><span>+1 extra stat point</span></div><div><span>For good</span><span>+25% Max HP and SP, a golden aura</span></div></div>`;
  h+=P.reborn?`<div class="sub" style="color:#ffd27a">You are Reborn. Valen bows to you.</div>`:
    `<div class="tbtns"><button class="btn" data-act="rebirth" ${why?'disabled':''}>${why?esc(why):'Be reborn'}</button></div>`;
  return h;};
PANEL_ACTS.rebirth=()=>{if(rebirthWhy())return;
  P.gold-=REBIRTH_GOLD;P.reborn=1;P.lv=1;P.exp=0;for(const s in P.st)P.st[s]=1;P.statPts=REBIRTH_PTS;
  S=computeStats();P.hp=S.maxhp;P.sp=S.maxsp;NET.lastSent='';NET.sendT=0;
  fx.push({k:'lvpillar',o:P,x:P.x,y:P.y,t0:now,dur:3});sfx('fanfare');showBanner('Reborn',`${P.name} begins again, stronger`);
  addLog(`You are reborn! Base level 1 with ${REBIRTH_PTS} stat points, +25% HP and SP, and an extra stat point every level.`,'l-rare');
  if(typeof announce==='function')try{announce('lv',1);}catch(e){}
  save();refreshPanel();};

// bonuses
const _computeStatsRB=computeStats;
computeStats=function(){const s=_computeStatsRB.apply(this,arguments);if(P&&P.reborn){s.maxhp=Math.round(s.maxhp*1.25);s.maxsp=Math.round(s.maxsp*1.25);}return s;};
const _gainExpRB=gainExp;
gainExp=function(e,j){const lv0=P.lv;const r=_gainExpRB.apply(this,arguments);if(P.reborn&&P.lv>lv0)P.statPts+=P.lv-lv0;return r;};
// "Reborn Knight" in the status box
const _updateHudRB=updateHud;
updateHud=function(){_updateHudRB.apply(this,arguments);if(P&&P.reborn){const el=document.getElementById('hCls');const want='Reborn '+CLASSES[P.cls].name+(P.sitting?' · resting':'');if(el&&el.textContent!==want)el.textContent=want;}};

// the golden aura (yours, and other players' through presence rb)
function drawRebornAura(x,y){ctx.save();const a=.35+Math.sin(now*3)*.12;ctx.strokeStyle=`rgba(255,215,120,${a+.25})`;ctx.lineWidth=2;
  ctx.beginPath();ctx.ellipse(x,y,17,8,0,0,7);ctx.stroke();ctx.fillStyle=`rgba(255,215,120,${a*.35})`;ctx.fill();
  for(let i=0;i<3;i++){const t=(now*.7+i/3)%1,ang=i*2.1+now;ctx.fillStyle=`rgba(255,235,170,${1-t})`;ctx.beginPath();ctx.arc(x+Math.cos(ang)*12,y-t*34,1.6,0,7);ctx.fill();}
  ctx.restore();}
const _drawPlayerRB=drawPlayer;
drawPlayer=function(p,wid){if(p&&(p===P?P.reborn:p.rb)&&!p.dead)drawRebornAura(p.x,p.y);return _drawPlayerRB.apply(this,arguments);};
// others: pass the flag through to the drawing
const _drawOtherRB=drawOther;
drawOther=function(o){if(!o.rb)return _drawOtherRB(o);const p=drawPlayer;drawPlayer=function(q,w){q.rb=1;return p(q,w);};try{return _drawOtherRB(o);}finally{drawPlayer=p;}};
