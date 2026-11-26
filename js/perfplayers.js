"use strict";
/* ================= crowds of players stay smooth =================
   Every other player is a full hero drawing (body, hair, outfit, gear, weapon, mount, aura): a few dozen shapes.
   With 6+ other players on screen (3+ with the new hero art, the default) (3+ once the battle smoother has stepped down), each player's look is drawn
   into its own small picture 15 times a second and that picture is copied every frame at the player's smooth
   position. Movement stays at full frame rate; only the walk/swing animation steps at 15 a second.
   Each player redraws at its own moment within the 15 Hz step, so the work is spread over frames.
   Fewer players draw live as before. window.__pcrowdForce = true/false pins it (tests). */
const PCROWD={frame:-1,on:false,near:0,pics:new Map(),draws:0,sweep:0};
// picture size: a hero on foot, or a bigger one for mounts and pushcarts
const PC_SZ={s:[140,132,70,104],b:[200,190,100,146]};
function pcrowdOn(){if(PCROWD.frame===now)return PCROWD.on;PCROWD.frame=now;
  if(typeof window.__pcrowdForce==='boolean')return PCROWD.on=window.__pcrowdForce;
  let n=0;if(P&&typeof NET!=='undefined')for(const o of NET.others.values())if(o.z===zoneId&&Math.abs(o.rx-P.x)<700&&Math.abs(o.ry-P.y)<600)n++;
  PCROWD.near=n;return PCROWD.on=n>=pcrowdMin()||(typeof BS!=='undefined'&&BS.level>=2&&n>=3);}
// with the new hero art (the default; ?hero2=0 is the classic art) each hero costs more to draw, so pictures start from 3 players nearby instead of 6
const pcrowdMin=()=>typeof HERO2_ON!=='undefined'&&HERO2_ON?3:6;
{const _doPC=drawOther;drawOther=function(o){
  if(!o||!o.peer||!pcrowdOn())return _doPC.apply(this,arguments);
  let e=PCROWD.pics.get(o.peer);const dp=DPR,tick=Math.floor(now*15+(e?e.ph:0)),sz=o.rd||o.ct?'b':'s',[W,H,OX,OY]=PC_SZ[sz];
  if(!e||e.dp!==dp||e.sz!==sz){if(e)freePic(e.c);const c=document.createElement('canvas');c.width=Math.ceil(W*dp);c.height=Math.ceil(H*dp);e={c,dp,sz,tick:-1,ph:e?e.ph:(PCROWD.pics.size*.37)%1};PCROWD.pics.set(o.peer,e);}
  if(e.tick!==tick){const g=e.c.getContext('2d');g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,e.c.width,e.c.height);g.setTransform(dp,0,0,dp,0,0);
    const rx=o.rx,ry=o.ry,main=ctx;o.rx=OX;o.ry=OY;ctx=g;
    try{_doPC.call(this,o);}catch(err){}finally{ctx=main;o.rx=rx;o.ry=ry;}e.tick=tick;e.seen=now;PCROWD.draws++;}
  e.seen=now;ctx.drawImage(e.c,o.rx-OX,o.ry-OY,W,H);
  // forget players who left (every few seconds)
  if(now-PCROWD.sweep>5){PCROWD.sweep=now;for(const [k,v] of PCROWD.pics)if(now-v.seen>5){freePic(v.c);PCROWD.pics.delete(k);}}};}
if(typeof gkClearCaches==='function'){const _gkcP=gkClearCaches;gkClearCaches=function(){try{for(const v of PCROWD.pics.values())freePic(v.c);PCROWD.pics.clear();}catch(e){}return _gkcP.apply(this,arguments);};}
/* (v1.60.8) a redraw budget per frame. The 15 Hz step was per player, so on a slow phone (an arena fight at 10-20 frames
   a second) every player came due every frame and all of them were redrawn each frame: the pictures saved nothing and
   the drawing of others was most of the frame. Now each frame redraws at most a quarter of the nearby players (2 at
   least), the ones whose picture is oldest first. At 60 frames a second that is the same 15 Hz as before; on a slow
   phone their walk and swing animate a little less often while their movement stays smooth. A player never drawn yet
   is always drawn. */
const PC_BUDGET={left:0,allow:null};
{const _rPB=render;render=function(){try{PC_BUDGET.allow=null;if(PCROWD.on&&PCROWD.pics.size){const due=[];
      for(const [k,e] of PCROWD.pics)if(now-e.seen<1&&e.tick!==Math.floor(now*15+e.ph))due.push([k,e.drawnAt||0]);
      const K=Math.max(2,Math.ceil(PCROWD.near/4));if(due.length>K){due.sort((a,b)=>a[1]-b[1]);PC_BUDGET.allow=new Set(due.slice(0,K).map(d=>d[0]));}}}catch(e){PC_BUDGET.allow=null;}
    return _rPB.apply(this,arguments);};}
{const _doPB=drawOther;drawOther=function(o){const e=o&&o.peer&&PCROWD.pics.get(o.peer);
    // over budget this frame: keep its picture (pretend it is up to date) unless it is one of the oldest
    if(e&&PC_BUDGET.allow&&!PC_BUDGET.allow.has(o.peer)&&e.tick>=0&&typeof pcrowdOn==='function'&&pcrowdOn()){const t=e.tick;e.tick=Math.floor(now*15+e.ph);
      const r=_doPB.apply(this,arguments);if(e.tick===Math.floor(now*15+e.ph)&&PCROWD.pics.get(o.peer)===e)e.tick=t;return r;}
    const d0=PCROWD.draws,r=_doPB.apply(this,arguments);const e2=o&&o.peer&&PCROWD.pics.get(o.peer);if(e2&&PCROWD.draws>d0)e2.drawnAt=now;return r;};}
