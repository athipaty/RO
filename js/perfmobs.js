"use strict";
/* ================= crowds stay smooth: monsters of the same kind share one picture =================
   Each monster is dozens of shapes. When the screen is crowded (16+ monsters near you, or 8+ while the battle
   smoother has already stepped down), monsters of the same kind, facing and state animate in step: their look is
   drawn once per animation tick (12 a second) into a shared picture and copied to each of them. Movement stays
   fully smooth (each copy goes exactly where its monster is), hit flashes have their own shared picture, and
   knockback and lunges still move each monster on its own. Quiet scenes draw every monster live as before.
   window.__crowdForce = true/false pins it on or off (tests). */
const CROWD={frame:-1,on:false,near:0,pics:new Map(),draws:0};
function crowdOn(){if(CROWD.frame===now)return CROWD.on;CROWD.frame=now;
  if(typeof window.__crowdForce==='boolean')return CROWD.on=window.__crowdForce;
  let n=0;if(P&&typeof mobs!=='undefined')for(const m of mobs)if(!m.dead&&Math.abs(m.x-P.x)<520&&Math.abs(m.y-P.y)<440)n++;
  CROWD.near=n;return CROWD.on=n>=16||(typeof BS!=='undefined'&&BS.level>=2&&n>=8);}
{const _dmCrowd=drawMob;drawMob=function(m){
  if(!m||!m.d||m.dying||typeof mobs==='undefined'||mobs[m.idx]!==m||!crowdOn())return _dmCrowd.apply(this,arguments);
  const d=m.d,s=d.size,f=m.face>0?1:-1,fl=now-m.hitF<.12,sl=m.slowUntil>now,ai=m.ailUntil>now?m.ail||'x':'',yell=d.id==='shriekcap'&&m.lunge&&now-m.lunge<.5;
  const key=d.id+'|'+s+'|'+d.col+'|'+f+(m.moving?'m':'')+(fl?'f':'')+(sl?'s':'')+ai+(yell?'y':''),tick=Math.floor(now*12),dp=DPR;
  const W=Math.ceil(s*6+70),H=Math.ceil(s*6+80),ox=W/2,oy=Math.round(H*.74);
  let e=CROWD.pics.get(key);
  if(!e||e.dp!==dp){if(CROWD.pics.size>=240)CROWD.pics.clear();const c=document.createElement('canvas');c.width=Math.ceil(W*dp);c.height=Math.ceil(H*dp);e={c,dp,tick:-1};CROWD.pics.set(key,e);}
  if(e.tick!==tick){const g=e.c.getContext('2d');g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,e.c.width,e.c.height);g.setTransform(dp,0,0,dp,0,0);
    const q={...m,x:ox,y:oy,ph:0,kbT:0,lunge:yell?m.lunge:0,hitF:fl?m.hitF:-9,dying:0};const main=ctx;ctx=g;
    try{_dmCrowd.call(this,q);}finally{ctx=main;}e.tick=tick;CROWD.draws++;}
  // each monster's own knockback and lunge, as drawMob would have moved it
  const lunge=m.lunge&&now-m.lunge<.18?Math.sin((now-m.lunge)/.18*Math.PI)*6*m.face:0,kb=m.kbT&&now-m.kbT<.25?Math.sin((now-m.kbT)/.25*Math.PI)*7:0;
  ctx.drawImage(e.c,m.x-ox+lunge+(m.kbX||0)*kb,m.y-oy+(m.kbY||0)*kb,W,H);};}
// the browser dropping its graphics wipes these too
if(typeof gkClearCaches==='function'){const _gkc=gkClearCaches;gkClearCaches=function(){try{CROWD.pics.clear();}catch(e){}return _gkc.apply(this,arguments);};}
