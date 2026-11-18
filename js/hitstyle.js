"use strict";
/* ================= each calling attacks with its own body motion =================
   drawPlayer / drawPlayerBody (render.js) ask hitPose(p, phase, weapon) for the attack pose; null keeps the classic
   overhead swing (Novice). phase runs 0..1 over the swing (and a little past it while recovering).
     push: px toward the target   lean: body tilt (+ forward)   hop: px up (negative = crouch)   ang: weapon angle
     (0 = up)   lift: raises the weapon hand (0..1.4)   reach: extra px the hand moves forward
     sx: horizontal turn of the body (1 = normal, -1 = turned round; the Ravager's spin)   ghost: afterimages
   First jobs have a family motion; each advanced calling has its own (HIT_ADV); a master calling uses its advanced
   calling's motion (JOB3[id].from) with afterimages trailing the body and a bigger impact. Archers have their own
   draw per calling (bowPose). Impact effects (dust, rings, sparks) are spawned once per swing. */
const HIT_SEG=(p,a,b)=>Math.max(0,Math.min(1,(p-a)/(b-a)));
// keyframes: [[phase, pose, ease?], ...] from rest back to rest; values missing in a pose keep the rest value.
// ease 'o' = fast out (strikes), default = smooth in and out
const HIT_REST={push:0,lean:0,hop:0,ang:.6,lift:0,reach:0,sx:1};
function hitKeys(p,keys){const o={...HIT_REST};let a=keys[0],b=keys[keys.length-1];
  for(let i=0;i<keys.length-1;i++)if(p>=keys[i][0]&&p<keys[i+1][0]){a=keys[i];b=keys[i+1];break;}
  if(p>=keys[keys.length-1][0])a=b;
  const k=a===b?1:(b[2]==='o'?easeOut:ease3)(HIT_SEG(p,a[0],b[0]));
  for(const n in HIT_REST){const va=a[1][n]??HIT_REST[n],vb=b[1][n]??HIT_REST[n];o[n]=va+(vb-va)*k;}return o;}
const R0={};
const HIT_STYLE={
  // first jobs
  warden:p=>hitKeys(p,[[0,R0],[.38,{push:-5,lean:-.18,ang:-1.6,lift:1.2}],[.58,{push:16,lean:.3,ang:2.5,reach:2},'o'],[1.2,R0]]),
  cleric:p=>hitKeys(p,[[0,R0],[.3,{lean:-.06,ang:-1.3,lift:1.4,hop:6}],[.5,{push:8,lean:.2,ang:2.3,reach:1.5},'o'],[1.15,R0]]),
  arcanist:p=>hitKeys(p,[[0,R0],[.25,{push:-1.5,lean:-.05,ang:.2,lift:.5,reach:-3}],[.45,{push:3.5,lean:.12,ang:1.35,lift:.5,reach:9},'o'],[1.1,R0]])};
const HIT_ADV={
  // Warden callings
  bulwark:p=>hitKeys(p,[[0,R0],[.18,{push:-2,lean:-.06,ang:.7}],[.36,{push:15,lean:.24,ang:.8},'o'],[.5,{push:15,lean:.14,ang:-.8,lift:.9}],[.64,{push:18,lean:.3,ang:2,reach:2},'o'],[1.2,R0]]),
  ravager:p=>{const o=hitKeys(p,[[0,R0],[.22,{push:-3,lean:-.1,ang:1.2,lift:.3}],[.7,{push:12,lean:.12,ang:1.57,lift:.2,reach:3}],[1.15,R0]]);
    if(p>=.22&&p<=.7)o.sx=Math.cos(HIT_SEG(p,.22,.7)*Math.PI*2);return o;}, // a wild full spin with the axe held out
  runeguard:p=>hitKeys(p,[[0,R0],[.16,{push:-2,ang:-1.1,lift:1}],[.36,{push:8,lean:.18,ang:2.2,reach:1},'o'],[.46,{push:8,lean:.1,ang:2.4,lift:.2}],[.66,{push:12,lean:.22,ang:-.7,lift:1.1,reach:2},'o'],[1.2,R0]]), // two crossing slashes
  // Arcanist callings
  stormcaller:p=>hitKeys(p,[[0,R0],[.35,{push:-1,lean:-.12,ang:-.25,lift:1.4,reach:-1,hop:2.5}],[.5,{push:5,lean:.2,ang:1.7,reach:6},'o'],[1.15,R0]]), // raise high, slam down
  hexweaver:p=>{const s=HIT_SEG(p,.1,.75),a=s*Math.PI*2,e=p<.1?HIT_SEG(p,0,.1):p>.75?1-HIT_SEG(p,.75,1.1):1; // traces a curse circle
    return {push:2*e,lean:.06*e,hop:0,ang:.6+(1+.5*Math.cos(a)-.6)*e,lift:(.5+.45*Math.sin(a))*e,reach:(3+4*Math.cos(a))*e,sx:1};},
  chronomancer:p=>hitKeys(p,[[0,R0],[.08,{push:1,ang:.2,lift:.4,reach:3}],[.2,{push:2,ang:.7,lift:.4,reach:4},'o'],[.32,{push:2,ang:.7,lift:.4,reach:4}],[.44,{push:3,ang:1.2,lift:.4,reach:5},'o'],[.54,{push:3,ang:1.2,lift:.4,reach:5}],[.64,{push:4,lean:.1,ang:1.6,lift:.4,reach:7},'o'],[1.1,R0]]), // three clock ticks
  // Cleric callings
  templar:p=>hitKeys(p,[[0,R0],[.3,{push:-4,lean:-.12,ang:.2,lift:.6}],[.5,{push:20,lean:.36,ang:1.45,lift:.3,reach:6},'o'],[1.15,R0]]), // a knight's charge
  oracle:p=>hitKeys(p,[[0,R0],[.35,{lean:-.1,ang:-.2,lift:1.4,hop:5}],[.55,{push:4,lean:.06,ang:1.2,lift:.6,reach:2,hop:4},'o'],[1.2,R0]]), // float up, burst
  ascetic:p=>hitKeys(p,[[0,R0],[.1,{push:1,ang:1.1,lift:.3}],[.2,{push:6,lean:.17,ang:1.2,lift:.3,reach:8},'o'],[.32,{push:2,ang:1.1,lift:.3,reach:1}],[.44,{push:7,lean:.18,ang:1.25,lift:.3,reach:9},'o'],[1.1,R0]])}; // two palm strikes
// the impact of each motion: when (phase) and what
const HIT_FX={warden:[.58,'poof','#b8a07a',0,0],cleric:[.5,'ring','#ffe9a0',22,0],arcanist:[.45,'ring','#c8a0ff',9,-26],
  bulwark:[.62,'poof','#c8c0a8',0,0],ravager:[.66,'ring','#e06a3a',26,-6],runeguard:[.8,'ring','#7ad0ff',16,-12],
  stormcaller:[.5,'ring','#ffe066',14,0],hexweaver:[.74,'ring','#a060e0',14,-18],chronomancer:[.62,'ring','#e8d090',12,-20],
  templar:[.5,'ring','#ffd070',20,-4],oracle:[.55,'ring','#bfe6ff',26,0],ascetic:[.48,'ring','#ffb070',10,-14]};
const hitAdvOf=cls=>typeof JOB3!=='undefined'&&JOB3[cls]&&JOB3[cls].from?JOB3[cls].from:cls;
const hitIsMaster=cls=>typeof JOB3!=='undefined'&&!!JOB3[cls];
function hitPose(p,phase,w){if(!p||phase<0)return null;const fam=typeof baseOf==='function'?baseOf(p.cls):null,adv=hitAdvOf(p.cls);
  let key=HIT_ADV[adv]?adv:HIT_STYLE[fam]?fam:null;if(!key)return null;
  if(fam==='arcanist'&&w&&w.wt!=='wand')return null; // an arcanist with another weapon swings it normally
  if(fam==='ranger')return null;                       // archers use bowPose
  const pose=(HIT_ADV[key]||HIT_STYLE[key])(phase);if(pose.sx===undefined)pose.sx=1;
  const master=hitIsMaster(p.cls);if(master)pose.ghost=true;
  // the impact, once per swing (masters: bigger and golden-edged)
  const F=HIT_FX[key];
  if(F&&phase>=F[0]&&p._hfx!==p.swingT&&typeof fx!=='undefined'){p._hfx=p.swingT;const f=p.face||1;
    try{if(F[1]==='poof'){fx.push({k:'poof',x:p.x+f*20,y:p.y-2,col:F[2],t0:now,dur:.4});if(p===P&&typeof shakeUntil!=='undefined')shakeUntil=Math.max(shakeUntil,now+.1);}
      else fx.push({k:'ring',x:p.x+f*(14+F[3]*.4),y:p.y+F[4],r:F[3]*(master?1.5:1),col:F[2],t0:now,dur:.35});
      if(master)fx.push({k:'ring',x:p.x+f*16,y:p.y-8,r:30,col:'#ffe9a0',t0:now,dur:.45});}catch(e){}}
  return pose;}
// archers: each calling draws its own way (k = 0..1 of the shot, release at BOW_RELEASE_V)
function bowPose(p,k){if(k<0)return null;const R=typeof BOW_RELEASE_V!=='undefined'?BOW_RELEASE_V:.42,adv=hitAdvOf(p&&p.cls),d=k<R?ease3(k/R):0,a=k>=R?Math.min(1,(k-R)/.3):0,snap=k>=R?Math.sin(a*Math.PI):0;
  const g=hitIsMaster(p&&p.cls);let o;
  if(adv==='sharpshooter')o={push:-1.5-3*snap,lean:-.05*d-.04*snap,hop:-5*(k<R?d:1-a)};          // a slow, steady draw down on one knee, a hard kick back on release
  else if(adv==='wildstalker')o={push:-1*snap+3*d+2*snap,lean:.14*d+.06*snap,hop:-4.5*(k<R?d:1-a)};  // low hunter's crouch, lunging forward as it shoots
  else if(adv==='falconer')o={push:4.5*snap,lean:.16*snap-.03*d,hop:2*snap};                        // a short draw, then the whole body throws forward to send the falcon
  else o=k<R?{push:-1.5*d,lean:-.07*d}:{push:-1.5-1.5*snap,lean:-.07*(1-Math.min(1,(k-R)/.4))};  // Ranger: lean back, step back on release
  if(g&&k>=R&&k<R+.3)o.ghost=true;o.sx=1;return o;}
function bowLean(k){return bowPose(typeof P!=='undefined'?P:null,k);}
/* ================= each family walks its own way =================
   rate: step speed (scales the walk phase, so arms and the held weapon stay in step)   leg / bob / arm: size of the
   stride, the bounce and the arm swing   roll: side-to-side sway   lean: forward tilt   lift: floats a little (px).
   Advanced and master callings walk like their family; the Novice keeps the plain walk. */
const WALK_GAIT={
  warden:{rate:.8,leg:1.25,bob:1.7,arm:1.1,roll:.05,lean:.02,lift:0},   // a heavy stomp
  arcanist:{rate:.85,leg:.45,bob:.3,arm:.5,roll:0,lean:0,lift:1.2},     // a light glide
  ranger:{rate:1.25,leg:.9,bob:.9,arm:1.1,roll:0,lean:.07,lift:0},      // quick, light steps
  cleric:{rate:.9,leg:.75,bob:.6,arm:.6,roll:0,lean:0,lift:0}};         // calm and upright
const GAIT_PLAIN={rate:1,leg:1,bob:1,arm:1,roll:0,lean:0,lift:0};
function walkGait(cls){const fam=typeof baseOf==='function'?baseOf(cls):null;return WALK_GAIT[fam]||GAIT_PLAIN;}
