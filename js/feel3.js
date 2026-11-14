"use strict";
/* ================= boss bar, hunt summary, goal on the minimap, bag sort, hit direction =================
   1. Boss bar: while a boss is fighting you (or you target one), a wide bar at the top shows its name, level and HP,
      with a flash each time it loses another quarter.
   2. Auto-hunt summary: when auto-hunt stops (or you come back to the game after a while away), a card shows how long it
      ran, the monsters defeated, the EXP and job EXP gained and the items picked up (with pictures).
   3. The goal from js/goal.js blinks as a gold dot on the minimap.
   4. A Sort button in the bag: by kind (use, equipment, sigils, loot), then rarity, then name.
   5. Hit direction: a hit from something you cannot see flashes that edge of the screen red. */

/* ---- 1. boss bar ---- */
const BB={el:null,m:null,q:4};
function bossNow(){if(!P||P.dead||typeof mobs==='undefined')return null;const t=P.target;if(t&&!t.dead&&t.d&&t.d.boss)return t;
  for(const m of mobs)if(!m.dead&&m.d.boss&&m.state==='chase'&&Math.hypot(m.x-P.x,m.y-P.y)<700)return m;return null;}
function bossBar(){const m=running?bossNow():null;let el=BB.el;
  if(!m){if(el&&!el.hidden){el.hidden=true;BB.m=null;}return;}
  if(!el){el=BB.el=document.createElement('div');el.id='bossBar';el.setAttribute('role','status');el.innerHTML='<div class="bbn"></div><div class="bbt"><i></i><em></em></div><div class="bbv"></div>';document.body.appendChild(el);}
  const f=Math.max(0,Math.min(1,m.hp/m.d.hp)),q=Math.ceil(f*4);
  if(BB.m!==m){BB.m=m;BB.q=q;el.querySelector('.bbn').textContent=`${m.d.name} · Lv ${m.d.lv}`;}
  el.querySelector('.bbt i').style.width=(f*100).toFixed(1)+'%';el.querySelector('.bbt em').style.width=(f*100).toFixed(1)+'%';
  el.querySelector('.bbv').textContent=`${fmt(Math.max(0,m.hp))} / ${fmt(m.d.hp)}`;
  if(q<BB.q){BB.q=q;el.classList.remove('hitq');void el.offsetWidth;el.classList.add('hitq');}
  // under whatever sits at the top (goal chip, status box, map)
  let top=12;for(const id of ['goalChip','topBars']){const e=document.getElementById(id);if(e&&!e.hidden&&e.getClientRects().length){const r=e.getBoundingClientRect();if(r.top<80)top=Math.max(top,r.bottom+6);}}
  if(innerHeight>innerWidth)for(const id of ['hud','minibox']){const e=document.getElementById(id);if(e&&e.getClientRects().length)top=Math.max(top,e.getBoundingClientRect().bottom+8);}
  const t=Math.round(top)+'px';if(el.style.top!==t)el.style.top=t;el.hidden=false;}
setInterval(()=>{try{bossBar();}catch(e){}},120);

/* ---- 2. auto-hunt summary ---- */
const HUNT={on:false,t0:0,kills:0,exp:0,jexp:0,items:new Map(),hiddenAt:0};
{const _kmH=killMob;killMob=function(m){const mine=m&&!m.dead&&(m.myDmg||0)>0;const r=_kmH.apply(this,arguments);if(mine&&HUNT.on)HUNT.kills++;return r;};}
{const _geH=gainExp;gainExp=function(e,j){if(HUNT.on){HUNT.exp+=Math.max(0,e||0);HUNT.jexp+=Math.max(0,j||0);}return _geH.apply(this,arguments);};}
{const _puH=pickUp;pickUp=function(l){const had=loot.indexOf(l)>=0;const r=_puH.apply(this,arguments);try{if(HUNT.on&&had&&loot.indexOf(l)<0&&!l.gold)HUNT.items.set(l.id,(HUNT.items.get(l.id)||0)+1);}catch(e){}return r;};}
function huntCard(title){const mins=Math.max(1,Math.round((performance.now()-HUNT.t0)/60000));if(HUNT.kills<3)return;
  let el=document.getElementById('huntCard');if(!el){el=document.createElement('div');el.id='huntCard';el.setAttribute('role','dialog');document.body.appendChild(el);el.addEventListener('click',()=>el.classList.remove('show'));}
  const items=[...HUNT.items.entries()].sort((a,b)=>(typeof rarityOf==='function'?rarityOf(b[0])-rarityOf(a[0]):0)||b[1]-a[1]).slice(0,10);
  el.innerHTML=`<div class="hct">${esc(title)}</div><div class="hcs"><div><b>${mins}</b><span>min</span></div><div><b>${fmt(HUNT.kills)}</b><span>defeated</span></div><div><b>${fmt(HUNT.exp)}</b><span>EXP</span></div><div><b>${fmt(HUNT.jexp)}</b><span>job EXP</span></div></div>`+
    (items.length?`<div class="hci">${items.map(([id,n])=>`<span class="hcit" data-item="${id}" title="${esc(ITEMS[id]?ITEMS[id].name:id)}"><img src="${itemIconURL(id)}" alt=""><b>${n}</b></span>`).join('')}</div>`:'')+`<div class="hcx">Tap to close</div>`;
  el.classList.remove('show');void el.offsetWidth;el.classList.add('show');}
function huntReset(){HUNT.t0=performance.now();HUNT.kills=0;HUNT.exp=0;HUNT.jexp=0;HUNT.items.clear();}
setInterval(()=>{try{if(!P||!running)return;const on=!!P.auto;if(on&&!HUNT.on){HUNT.on=true;huntReset();}else if(!on&&HUNT.on){HUNT.on=false;huntCard('Auto-hunt summary');}}catch(e){}},500);
document.addEventListener('visibilitychange',()=>{try{if(document.hidden){HUNT.hiddenAt=performance.now();return;}
  if(HUNT.on&&HUNT.hiddenAt&&performance.now()-HUNT.hiddenAt>60000){huntCard('While you were away');}}catch(e){}});

/* ---- 3. goal on the minimap ---- */
{const _rmG=renderMini;renderMini=function(){const r=_rmG.apply(this,arguments);try{if(typeof GOAL==='undefined'||!GOAL.t||!GOAL.pt||(typeof goalOn==='function'&&!goalOn()))return r;
    const g=GOAL.pt.m&&!GOAL.pt.m.dead?{x:GOAL.pt.m.x,y:GOAL.pt.m.y}:GOAL.pt,p=miniPt(g.x,g.y),a=.55+.45*Math.sin(now*6);
    mctx.save();mctx.globalAlpha=a;mctx.fillStyle='#ffcf5a';mctx.strokeStyle='#2a1808';mctx.lineWidth=1.5;mctx.beginPath();mctx.arc(p.x,p.y,4,0,7);mctx.fill();mctx.stroke();
    mctx.globalAlpha=1-a*.6;mctx.strokeStyle='#ffcf5a';mctx.beginPath();mctx.arc(p.x,p.y,7+a*2,0,7);mctx.stroke();mctx.restore();}catch(e){}return r;};}

/* ---- 4. bag sort ---- */
const SORT_CAT={use:0,equip:1,sigil:2,etc:3};
function sortBag(){const nm=e=>ITEMS[e.id]?ITEMS[e.id].name:e.id,cat=e=>SORT_CAT[typeof itemCat==='function'?itemCat(e.id):'etc']??4,rar=e=>typeof rarityOf==='function'?rarityOf(e.id):0;
  P.inv.sort((a,b)=>cat(a)-cat(b)||rar(b)-rar(a)||nm(a).localeCompare(nm(b))||(b.r||0)-(a.r||0));sfx('click');rebuildHotbar();refreshPanel();if(typeof save==='function')save();}
PANEL_ACTS.bagsort=()=>sortBag();
{const _rpB=refreshPanel;refreshPanel=function(){const r=_rpB.apply(this,arguments);try{if(panelKind==='items'&&!panel.querySelector('[data-act="bagsort"]')){const v=panel.querySelector('[data-act="vendsetup"]');
      if(v)v.insertAdjacentHTML('afterend',`<button class="btn small" data-act="bagsort" title="Sort by kind, rarity and name">⇅ Sort</button>`);}}catch(e){}return r;};}

/* ---- 5. hit direction ---- */
const HITDIR={el:null};
// the attacker: hurtPlayer gets its name, so take the nearest monster of that name that is after you
function hitSource(src){if(src&&typeof src.x==='number')return src;if(typeof src!=='string'||typeof mobs==='undefined')return null;let best=null,bd=1e9;
  for(const m of mobs)if(!m.dead&&m.d.name===src){const d=Math.hypot(m.x-P.x,m.y-P.y);if(d<bd){bd=d;best=m;}}return best;}
{const _hpD=hurtPlayer;hurtPlayer=function(dmg,src0){const r=_hpD.apply(this,arguments);try{const src=hitSource(src0);if(!src||P.dead)return r;
    const p=proj(src.x,src.y),sx=p.x-camX,sy=p.y-camY;if(sx>-10&&sx<VW+10&&sy>-10&&sy<VH+10)return r; // you can see it
    const ang=Math.atan2(sy-VH/2,sx-VW/2),side=Math.abs(Math.cos(ang))*VH>Math.abs(Math.sin(ang))*VW?(Math.cos(ang)>0?'r':'l'):(Math.sin(ang)>0?'b':'t');
    let el=HITDIR.el;if(!el){el=HITDIR.el=document.createElement('div');el.id='hitDir';el.setAttribute('aria-hidden','true');document.body.appendChild(el);}
    el.dataset.side=side;el.classList.remove('on');void el.offsetWidth;el.classList.add('on');}catch(e){}return r;};}

if(typeof TH!=='undefined')Object.assign(TH,{'Auto-hunt summary':'สรุปการล่าอัตโนมัติ','While you were away':'ระหว่างที่คุณไม่อยู่','defeated':'ปราบแล้ว','min':'นาที','job EXP':'EXP อาชีพ','Tap to close':'แตะเพื่อปิด','⇅ Sort':'⇅ เรียง','Sort by kind, rarity and name':'เรียงตามชนิด ความหายาก และชื่อ'});
