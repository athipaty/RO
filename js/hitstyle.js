"use strict";
/* ================= each job family attacks with its own body motion =================
   drawPlayer / drawPlayerBody (render.js) ask hitPose(p, phase, weapon) for the attack pose; null keeps the classic
   overhead swing (Novice). phase runs 0..1 over the swing (and a little past it while recovering).
     push: px toward the target   lean: body tilt (+ forward)   hop: px up   ang: weapon angle (0 = up)
     lift: raises the weapon hand (0..1.4)   reach: extra px the hand moves forward
   Advanced and master callings use their family's motion; other players' heroes use it too. Impact effects (dust,
   a holy ring, a spark) are spawned once per swing. Ranged bows keep their own draw (bowPhase) plus a lean. */
const HIT_SEG=(p,a,b)=>Math.max(0,Math.min(1,(p-a)/(b-a)));
const HIT_STYLE={
  // a heavy two-handed chop: a long wind-up leaning back, a big arc stepping in, dust where it lands
  warden(p){const w=ease3(HIT_SEG(p,0,.38)),s=easeOut(HIT_SEG(p,.38,.58)),r=ease3(HIT_SEG(p,.58,1.2));
    if(p<.38)return {push:-5*w,lean:-.18*w,hop:0,ang:.6-2.2*w,lift:1.2*w,reach:0};
    if(p<.58)return {push:-5+21*s,lean:-.18+.48*s,hop:0,ang:-1.6+4.1*s,lift:1.2*(1-s),reach:2*s};
    return {push:16*(1-r),lean:.3*(1-r),hop:0,ang:2.5-1.9*r,lift:0,reach:2*(1-r)};},
  // a jumping smite: up with the mace overhead, down on landing
  cleric(p){const w=ease3(HIT_SEG(p,0,.3)),s=easeOut(HIT_SEG(p,.3,.5)),r=ease3(HIT_SEG(p,.5,1.15));
    if(p<.3)return {push:0,lean:-.06*w,hop:6*Math.sin(w*Math.PI/2),ang:.6-1.9*w,lift:1.4*w,reach:0};
    if(p<.5)return {push:8*s,lean:-.06+.26*s,hop:6*(1-s),ang:-1.3+3.6*s,lift:1.4*(1-s),reach:1.5*s};
    return {push:8*(1-r),lean:.2*(1-r),hop:0,ang:2.3-1.7*r,lift:0,reach:1.5*(1-r)};},
  // a wand thrust: pull back, jab forward with a flick
  arcanist(p){const w=ease3(HIT_SEG(p,0,.25)),s=easeOut(HIT_SEG(p,.25,.45)),r=ease3(HIT_SEG(p,.45,1.1));
    if(p<.25)return {push:-1.5*w,lean:-.05*w,hop:0,ang:.6-.4*w,lift:.5*w,reach:-3*w};
    if(p<.45)return {push:-1.5+5*s,lean:-.05+.17*s,hop:0,ang:.2+1.15*s,lift:.5,reach:-3+12*s};
    return {push:3.5*(1-r),lean:.12*(1-r),hop:0,ang:1.35-.75*r,lift:.5*(1-r),reach:9*(1-r)};}};
const HIT_FX={warden:.58,cleric:.5,arcanist:.45};
function hitPose(p,phase,w){if(!p||phase<0)return null;const fam=typeof baseOf==='function'?baseOf(p.cls):null,fn=HIT_STYLE[fam];if(!fn)return null;
  if(fam==='arcanist'&&w&&w.wt!=='wand')return null; // an arcanist with another weapon swings it normally
  const pose=fn(phase);
  // the impact, once per swing
  if(phase>=HIT_FX[fam]&&p._hfx!==p.swingT&&typeof fx!=='undefined'){p._hfx=p.swingT;const f=p.face||1;
    try{if(fam==='warden'){fx.push({k:'poof',x:p.x+f*20,y:p.y-2,col:'#b8a07a',t0:now,dur:.4});if(p===P&&typeof shakeUntil!=='undefined')shakeUntil=Math.max(shakeUntil,now+.1);}
      else if(fam==='cleric')fx.push({k:'ring',x:p.x+f*14,y:p.y,r:22,col:'#ffe9a0',t0:now,dur:.35});
      else fx.push({k:'ring',x:p.x+f*26,y:p.y-26,r:9,col:'#c8a0ff',t0:now,dur:.3});}catch(e){}}
  return pose;}
// the archer leans back while drawing and steps back a little on release
function bowLean(k){if(k<0)return null;const R=typeof BOW_RELEASE_V!=='undefined'?BOW_RELEASE_V:.42;
  return k<R?{push:-1.5*ease3(k/R),lean:-.07*ease3(k/R)}:{push:-1.5-1.5*Math.sin(Math.min(1,(k-R)/.3)*Math.PI),lean:-.07*(1-Math.min(1,(k-R)/.4))};}
