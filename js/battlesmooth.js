"use strict";
/* ================= smooth fights (especially boss fights) =================
   1. Live quality: the game watches how long frames take. When they run slow (fights fill the screen with
      spells, numbers and monsters) it draws at a lower resolution step by step, within about half a second;
      when frames are quick again for a few seconds it steps back up. Steps: full, 80%, 62% (and half the
      weather and ambient specks), 50%. Desktop never goes below 0.75x. Performance mode in Settings still
      caps the top at 1x. This reacts much sooner than the automatic Performance mode in smooth.js, and recovers.
   2. Boss fights: the little hit-freeze on crits and kills is skipped while a boss is fighting you (only the
      boss's own death freezes), and the shake is gentler (render.js).
   3. Limits: at most one hit-freeze every half second, and damage numbers / effects are capped so a big fight
      cannot pile up hundreds of them (oldest go first).
   Read BS.level (0-3) and BS.bossOn; window.__bsForce = level pins a level for tests. */
const BS={level:0,deltas:[],lastTs:0,lastChange:0,goodSince:0,bossOn:false,lastStop:0,refresh:16.7,recent:[],upWait:3000,lastUp:0};
const BS_STEPS=[1,.8,.62,.5];
const bsMaxDPR=()=>Math.min(2,window.devicePixelRatio||1);
function bsDPR(level){const base=SETS&&SETS.lite?1:bsMaxDPR();return Math.max(Math.min(.75,base),+(base*BS_STEPS[level]).toFixed(2));}
// size the canvas for the current level (the drawing code reads DPR every frame)
function bsApply(){const want=bsDPR(BS.level);
  if(Math.abs(DPR-want)>.01||cv.width!==Math.round(cv.clientWidth*want)){DPR=want;VW=cv.clientWidth;VH=cv.clientHeight;cv.width=Math.round(VW*DPR);cv.height=Math.round(VH*DPR);}
  // fewer weather and ambient specks from step 2 (sky.js and render.js read window.LITE every frame)
  const lite=!!(SETS&&SETS.lite)||BS.level>=2;if(window.LITE!==lite)window.LITE=lite;}
function bsSet(level){level=Math.max(0,Math.min(3,level));if(level===BS.level)return;BS.level=level;BS.lastChange=performance.now();BS.deltas=[];bsApply();
  if(typeof LABELS!=='undefined')LABELS.clear();} // names are redrawn sharp at the new resolution
function bsTick(ts){
  const gap=BS.lastTs?ts-BS.lastTs:16;BS.lastTs=ts;
  if(running&&!document.hidden&&gap<250){BS.deltas.push(gap);if(BS.deltas.length>30)BS.deltas.shift();
    // the screen's own frame interval (16.7 ms at 60 Hz, 8.3 ms at 120 Hz): the quickest recent frames
    if(gap>5){BS.recent.push(gap);if(BS.recent.length>180)BS.recent.shift();const q=[...BS.recent].sort((a,b)=>a-b);BS.refresh=q[Math.floor(q.length*.1)]||16.7;}}
  if(typeof window.__bsForce==='number'){if(BS.level!==window.__bsForce)bsSet(window.__bsForce);}
  else if(running&&BS.deltas.length>=20){
    const sorted=[...BS.deltas].sort((a,b)=>a-b),med=sorted[sorted.length>>1],since=ts-BS.lastChange;
    const R=BS.refresh;
    // missing frames (median a third longer than the screen's frame) for half a second: one step down, at most every 0.6 s.
    // If that happens soon after stepping up, wait longer before the next try (3 s, 6 s, 12 s ... up to 30 s).
    if(med>R*1.35&&since>600&&BS.level<3){if(BS.lastUp&&ts-BS.lastUp<2500)BS.upWait=Math.min(30000,BS.upWait*2);bsSet(BS.level+1);BS.goodSince=0;}
    // hitting every frame again: after upWait, one step up
    else if(med<R*1.12&&BS.level>0){if(!BS.goodSince)BS.goodSince=ts;else if(ts-BS.goodSince>BS.upWait&&since>BS.upWait){bsSet(BS.level-1);BS.lastUp=ts;BS.goodSince=0;}}
    else BS.goodSince=0;
    // a long calm spell: forget the backoff
    if(BS.level===0&&BS.lastUp&&ts-BS.lastUp>60000){BS.upWait=3000;BS.lastUp=0;}}
  // is a boss fighting us right now?
  if(running&&P&&!P.dead&&typeof mobs!=='undefined'){let on=false;for(const m of mobs)if(!m.dead&&m.d.boss&&(m.state==='chase'||P.target===m)&&Math.hypot(m.x-P.x,m.y-P.y)<800){on=true;break;}BS.bossOn=on;}
  else BS.bossOn=false;
  // caps: damage numbers and effects (oldest first)
  const tcap=BS.level>=2?18:30,fcap=BS.level>=2?90:150;
  if(typeof texts!=='undefined'&&texts.length>tcap)texts.splice(0,texts.length-tcap);
  if(typeof fx!=='undefined'&&fx.length>fcap)fx.splice(0,fx.length-fcap);
  requestAnimationFrame(bsTick);}
requestAnimationFrame(bsTick);
// the browser resizing the window resets the canvas: put the current level back afterwards
addEventListener('resize',()=>setTimeout(bsApply,0));
// Settings' Performance mode: keep our own decision on top of it
if(typeof applySets==='function'){const _applySetsBS=applySets;applySets=function(){const r=_applySetsBS.apply(this,arguments);bsApply();return r;};}

/* ---- hit-freeze: rationed, and skipped in boss fights except for the boss's own death ---- */
const _hitStopBS=hitStop;
hitStop=function(sec){const t=performance.now();
  if(BS.bossOn&&sec<.1)return;           // crits and small kills while a boss is on you: no freeze
  if(t-BS.lastStop<500&&sec<.1)return;    // at most one small freeze every half second
  BS.lastStop=t;return _hitStopBS.apply(this,arguments);};
