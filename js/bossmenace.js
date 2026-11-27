"use strict";
/* ================= bosses look like bosses (v1.73.0) =================
   Many bosses were drawn like their gentle kin with a crown (a bunny, two fluffy sheep, a teddy-bear Frost Matron, a
   small bird for Skyclaw the Roc) and looked weak at first sight. Every boss and mini-boss now, whatever its own look:
     - stands bigger (mini-bosses 1.3x, bosses 1.4x, world bosses, already huge, 1.15x)
     - has glowing eyes under angry brows (red; icy blue for water and ice bosses; gold for holy ones): while a boss is
       drawn, the shared eye helpers (mlEye in js/moblooks.js, eyes in js/render.js) draw these instead
     - wears deeper colours (soft pastel bosses lose their sweetness)
     - stands in a dark aura with a slowly turning sigil on the ground, and dark wisps and embers rise around it
   Only the picture changes: the hit box, the name and the HP bar stay where they were. No glow blur is used, so phones
   keep their frame rate; Performance mode keeps the aura but drops the wisps. */
const BM={on:false,f:1,eye:'#ff3a2a',core:'#ffe0c0'};
/* a few needed more than the rest: Skyclaw the Roc was a small bird, the two sheep, the bear and the rabbit kept
   their soft bright coats (a darker, rougher coat of their own each) */
const BM_EXTRA={skyclaw:{k:2},hopperchief:{col:'#7a5a3a'},woolhorn:{col:'#9a7a2a'},hornback:{col:'#8a8070'},frostmatron:{col:'#9ab4c8'},
  orchidra:{col:'#b04a8a'},harvestmatron:{col:'#b8862a'},glenkeeper:{col:'#3a6a3a'}};
const BM_SCALE=d=>(BM_EXTRA[d.id]&&BM_EXTRA[d.id].k)||(d.world?1.15:d.mini?1.3:1.4);
function bmEyeCol(d){const id=d.id||'',el=d.el||'';
  if(el==='water'||/frost|rime|ice|hrim|glacier|reef|kraken|tide|leviathan|mist/.test(id))return ['#5ad8ff','#e8faff'];
  if(el==='holy'||/paladin/.test(id))return ['#ffd23a','#fff8d8'];
  if(/void|hollow|shade|gloom/.test(id))return ['#c060ff','#f4e0ff'];
  return ['#ff3a2a','#ffe0c0'];}
// a glowing eye: a dark socket, a soft glow, a bright core, an angry brow slanting down toward the face
function bmEye(x,y,r){r=Math.max(1.6,r*1.25);const f=BM.f,a=.75+.25*Math.sin(now*5+x);
  ctx.fillStyle='rgba(20,6,6,.85)';ctx.beginPath();ctx.ellipse(x,y,r*1.25,r*.95,0,0,7);ctx.fill();
  ctx.globalAlpha=.35*a;ctx.fillStyle=BM.eye;ctx.beginPath();ctx.arc(x,y,r*2.1,0,7);ctx.fill();ctx.globalAlpha=1;
  ctx.fillStyle=BM.eye;ctx.beginPath();ctx.ellipse(x,y,r*.95,r*.7,0,0,7);ctx.fill();
  ctx.fillStyle=BM.core;ctx.beginPath();ctx.ellipse(x+f*r*.15,y,r*.38,r*.5,0,0,7);ctx.fill();
  ctx.strokeStyle='#1a0a08';ctx.lineWidth=Math.max(1.2,r*.55);ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x-f*r*1.5,y-r*1.55);ctx.lineTo(x+f*r*1.2,y-r*.55);ctx.stroke();}
if(typeof mlEye==='function'){const _mlEyeBM=mlEye;mlEye=function(x,y,r){if(!BM.on)return _mlEyeBM.apply(this,arguments);bmEye(x,y,r);};}
if(typeof eyes==='function'){const _eyesBM=eyes;eyes=function(x,y,s,face){if(!BM.on)return _eyesBM.apply(this,arguments);for(const k of [-1,1])bmEye(x+k*s*.32+face*s*.12,y,s*.16);};}
// the dark aura and turning sigil on the ground (drawn under the boss)
function bmAura(m,k){const d=m.d,x=m.x,y=m.y,R=d.size*k*1.55,p=.5+.5*Math.sin(now*2.2+(m.ph||0));ctx.save();
  ctx.translate(x,y);ctx.scale(1,.42);
  ctx.globalAlpha=.42+.12*p;ctx.fillStyle='#14080a';ctx.beginPath();ctx.arc(0,0,R*1.08,0,7);ctx.fill();
  ctx.globalAlpha=.55+.25*p;ctx.strokeStyle=BM.eye;ctx.lineWidth=2.2;ctx.beginPath();ctx.arc(0,0,R,0,7);ctx.stroke();
  ctx.globalAlpha=.4+.2*p;ctx.lineWidth=1.4;ctx.beginPath();ctx.arc(0,0,R*.72,0,7);ctx.stroke();
  ctx.rotate(now*.4);ctx.beginPath();for(let i=0;i<6;i++){const a=i*Math.PI/3;ctx.moveTo(Math.cos(a)*R*.72,Math.sin(a)*R*.72);ctx.lineTo(Math.cos(a+Math.PI*2/3)*R*.72,Math.sin(a+Math.PI*2/3)*R*.72);}ctx.stroke(); // a six-point star
  ctx.globalAlpha=.7;ctx.fillStyle=BM.eye;for(let i=0;i<6;i++){const a=i*Math.PI/3+Math.PI/6;ctx.beginPath();ctx.arc(Math.cos(a)*R*.86,Math.sin(a)*R*.86,2.2,0,7);ctx.fill();}
  ctx.restore();}
// dark wisps and embers rising round it (drawn over the boss)
function bmWisps(m,k){if(typeof LITE!=='undefined'&&LITE)return;const d=m.d,x=m.x,y=m.y,R=d.size*k;ctx.save();
  for(let i=0;i<7;i++){const u=((now*.45+i/7+(m.ph||0)*.13)%1),a=i*2.4+(m.ph||0),px=x+Math.cos(a)*R*(.6+.5*u),py=y-u*R*2.4;
    ctx.globalAlpha=(1-u)*.5;ctx.fillStyle=i%2?'#1a0c10':'#2a1018';ctx.beginPath();ctx.ellipse(px,py,R*.16*(1-u*.5),R*.24*(1-u*.4),0,0,7);ctx.fill();
    if(i%2===0){ctx.globalAlpha=(1-u)*.9;ctx.fillStyle=BM.eye;ctx.beginPath();ctx.arc(px+Math.sin(now*3+i)*3,py-R*.2,1.6,0,7);ctx.fill();}}
  ctx.restore();}
// pastel bosses lose their sweetness: a deeper body colour
const bmDeep=c=>{if(!/^#[0-9a-f]{6}$/i.test(c||''))return c;const n=parseInt(c.slice(1),16),r=n>>16,g=n>>8&255,b=n&255,l=(Math.max(r,g,b)+Math.min(r,g,b))/2;
  if(l<150)return c;const k=l>200?.78:.88,h=v=>Math.round(v*k).toString(16).padStart(2,'0');return '#'+h(r)+h(g)+h(b);};
if(typeof drawMob==='function'){const _dmBM=drawMob;drawMob=function(m){const d=m&&m.d;if(!d||!(d.boss||d.world)||m.dead||BM.on)return _dmBM.apply(this,arguments);
  const k=BM_SCALE(d),[ec,cc]=bmEyeCol(d);BM.eye=ec;BM.core=cc;BM.f=m.face<0?-1:1;
  try{bmAura(m,k);}catch(e){}
  const col0=d.col;if(!d._bmCol)d._bmCol=(BM_EXTRA[d.id]&&BM_EXTRA[d.id].col)||bmDeep(col0);
  ctx.save();ctx.translate(m.x,m.y);ctx.scale(k,k);ctx.translate(-m.x,-m.y);BM.on=true;
  try{d.col=d._bmCol;return _dmBM.apply(this,arguments);}finally{d.col=col0;BM.on=false;ctx.restore();try{bmWisps(m,k);}catch(e){}}};}

/* ---- the boss's cast bar (v1.73.0) ----
   When a boss starts a skill, a bar over its head names it and fills until the blow lands: the Ground Slam's wind-up
   (1.1 s), the Ground Mark (1.2 s) and its signature skill (until its last warning circle lands; ground that stays
   shows a short bar). The timing is the game's own: the bar only shows what is coming, so you can step away. */
function bossCastBar(m,name,dur){if(!m||!m.d||!(m.d.boss||m.d.world))return;m.cast={name:typeof thText==='function'?thText(name):name,t0:now,dur:Math.max(.5,dur||0)};}
if(typeof bossSigCast==='function'){const _bscBM=bossSigCast;bossSigCast=function(m){const n0=typeof HZ!=='undefined'?HZ.length:0;const r=_bscBM.apply(this,arguments);
  try{const s=m&&m.d&&BOSS_SIG[m.d.id];if(s&&!m.dead){let end=now+.6;if(typeof HZ!=='undefined')for(let i=n0;i<HZ.length;i++){const h=HZ[i];if(h.m===m&&h.t==='mark')end=Math.max(end,h.at);}bossCastBar(m,s.name,end-now);}}catch(e){}
  return r;};}
function bmCastDraw(m,k){const c=m.cast;if(!c)return;const u=(now-c.t0)/c.dur;if(u>=1||m.dead){m.cast=null;return;}
  const d=m.d,w=Math.max(64,Math.min(110,d.size*k*2.6)),h=8,x=m.x-w/2,y=m.y-d.size*k*2.9-14;ctx.save();
  ctx.font='bold 12px sans-serif';ctx.textAlign='center';ctx.textBaseline='bottom';ctx.lineWidth=3;ctx.strokeStyle='rgba(10,4,4,.9)';ctx.strokeText(c.name,m.x,y-3);ctx.fillStyle='#ffd8a0';ctx.fillText(c.name,m.x,y-3);
  ctx.fillStyle='rgba(12,6,6,.85)';ctx.beginPath();ctx.roundRect(x-1.5,y-1.5,w+3,h+3,4);ctx.fill();
  ctx.fillStyle=u>.75?'#ff4a2a':'#ff9a3a';ctx.beginPath();ctx.roundRect(x,y,w*Math.min(1,u),h,3);ctx.fill();
  ctx.strokeStyle='#ffd8a0';ctx.lineWidth=1;ctx.beginPath();ctx.roundRect(x-1.5,y-1.5,w+3,h+3,4);ctx.stroke();ctx.restore();}
if(typeof drawMob==='function'){const _dmCB=drawMob;drawMob=function(m){const r=_dmCB.apply(this,arguments);try{if(m&&m.cast&&!BM.on&&m.d)bmCastDraw(m,BM_SCALE(m.d));}catch(e){}return r;};}
