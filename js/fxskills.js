"use strict";
/* ================= signature effects: every build skill (js/builds*.js) gets its own animation =================
   New effect kinds drawn after the usual ones (drawFx in render.js). Each skill pushes a mix of them when it fires,
   so a Lethal Edge looks nothing like a Sundering Blow, and a Killing Shot is unmistakable. Lite mode draws fewer bits. */
const FXK={};
const fxN=n=>window.LITE?Math.ceil(n/2):n;
const rgba=(hex,al)=>{const h=hex.replace('#','');const n=parseInt(h.length===3?h.split('').map(c=>c+c).join(''):h,16);return `rgba(${n>>16&255},${n>>8&255},${n&255},${Math.max(0,Math.min(1,al))})`;};
const gEll=(x,y,r)=>{ctx.beginPath();ctx.ellipse(x,y,r,r*.5,0,0,7);};
// curved blade swoosh(es): f.ang direction, f.r size, f.h height above ground
FXK.crescent=(f,a)=>{const sw=Math.min(1,a*2.4),y=f.y-(f.h||18),s0=(f.ang||0)-1.25;ctx.lineCap='round';
  for(const [w,al,c] of [[f.w||9,.55,f.col],[(f.w||9)*.35,.95,'#ffffff']]){ctx.strokeStyle=rgba(c,al*(1-a));ctx.lineWidth=w*(1-a*.5);ctx.beginPath();ctx.arc(f.x,y,(f.r||26)*1.15,s0,s0+2.5*sw);ctx.stroke();}};
// cracks running out across the ground, with dust
FXK.quake=(f,a)=>{const rnd2=seeded(f.seed||7),r=f.r*Math.min(1,a*3);ctx.lineCap='round';ctx.lineJoin='round';
  for(let i=0;i<fxN(9);i++){const ang=rnd2()*6.28,pts=[[f.x,f.y]];for(let s=1;s<=4;s++){const d=r*s/4,j=(rnd2()-.5)*.6;pts.push([f.x+Math.cos(ang+j)*d,f.y+Math.sin(ang+j)*d*.5]);}
    for(const [w,c,al] of [[6,f.glow||'#ffb060',.5],[3,f.col,1]]){ctx.strokeStyle=rgba(c,al*(1-a));ctx.lineWidth=w;ctx.beginPath();pts.forEach((p,k)=>k?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.stroke();}}
  for(let i=0;i<fxN(7);i++){const ang=rnd2()*6.28,d=f.r*(.3+a*.8),px=f.x+Math.cos(ang)*d,py=f.y+Math.sin(ang)*d*.5-a*14;
    ctx.fillStyle=rgba(f.dust||'#d8c8a0',.6*(1-a));ctx.beginPath();ctx.arc(px,py,5+a*9,0,7);ctx.fill();}};
// a shield bubble over the hero
FXK.dome=(f,a)=>{const al=(a<.15?a/.15:a>.75?(1-a)/.25:1)*(.75+.25*Math.sin(now*9)),r=(f.r||32)*1.2,y=f.y-6;ctx.shadowColor=f.col;ctx.shadowBlur=14;
  ctx.fillStyle=rgba(f.col,.3*al);ctx.strokeStyle=rgba(f.col,al);ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(f.x,y,r,r*1.05,0,Math.PI,0);ctx.ellipse(f.x,y,r,r*.5,0,0,Math.PI);ctx.fill();ctx.stroke();
  ctx.lineWidth=1;ctx.strokeStyle=rgba('#ffffff',.5*al);for(let i=-2;i<=2;i++){ctx.beginPath();ctx.ellipse(f.x,y,Math.abs(i)*r/3+1,r*1.05,0,Math.PI,0);ctx.stroke();}
  gEll(f.x,f.y,r);ctx.strokeStyle=rgba(f.col,.7*al);ctx.stroke();};
// jagged lightning through a list of points (screen positions worked out each frame)
FXK.chain=(f,a)=>{const pts=f.pts.map(p=>proj(p.x,p.y-(p.h||16)));
  for(const [w,c,al] of [[6,f.col,.5],[2,'#ffffff',1]]){ctx.strokeStyle=rgba(c,al*(1-a));ctx.lineWidth=w;ctx.lineJoin='round';ctx.beginPath();
    for(let i=0;i<pts.length-1;i++){const p=pts[i],q=pts[i+1];if(!i)ctx.moveTo(p.x,p.y);for(let s=1;s<6;s++){const k=s/6;ctx.lineTo(p.x+(q.x-p.x)*k+(Math.random()-.5)*14,p.y+(q.y-p.y)*k+(Math.random()-.5)*14);}ctx.lineTo(q.x,q.y);}ctx.stroke();}};
// spiral arms turning (f.imp: pulls inward)
FXK.vortex=(f,a)=>{const r=f.imp?f.r*(1-a*.8):f.r*(.4+a*.6),turn=now*7;ctx.lineCap='round';
  for(let arm=0;arm<fxN(5);arm++){ctx.strokeStyle=rgba(arm%2?f.col:(f.col2||'#ffffff'),.7*(1-a));ctx.lineWidth=3;ctx.beginPath();
    for(let s=0;s<=14;s++){const k=s/14,ang=turn+arm*1.256+k*3.2,d=r*k;const x=f.x+Math.cos(ang)*d,y=f.y-10+Math.sin(ang)*d*.5;s?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.stroke();}
  gEll(f.x,f.y,r);ctx.fillStyle=rgba(f.col,.12*(1-a));ctx.fill();};
// a glowing rune circle on the ground, turning, with a glyph floating over it
FXK.rune=(f,a)=>{const al=a<.2?a/.2:1-(a-.2)/.8,r=f.r||28,rot=now*2;ctx.strokeStyle=rgba(f.col,.9*al);ctx.lineWidth=2;gEll(f.x,f.y,r);ctx.stroke();gEll(f.x,f.y,r*.72);ctx.stroke();
  for(let i=0;i<8;i++){const ang=rot+i*.785;ctx.beginPath();ctx.moveTo(f.x+Math.cos(ang)*r*.72,f.y+Math.sin(ang)*r*.36);ctx.lineTo(f.x+Math.cos(ang)*r,f.y+Math.sin(ang)*r*.5);ctx.stroke();}
  if(f.g){ctx.fillStyle=rgba(f.col,al);ctx.font='800 22px "Alegreya Sans",sans-serif';ctx.textAlign='center';ctx.shadowColor=f.col;ctx.shadowBlur=10;ctx.fillText(f.g,f.x,f.y-32-a*16);ctx.shadowBlur=0;}};
// a beam of light from the sky (f.sun: a sun disc rides down it)
FXK.beam=(f,a)=>{const w=(f.w||22)*(1-a*.4),top=f.y-280,g=ctx.createLinearGradient(0,top,0,f.y);g.addColorStop(0,rgba(f.col,0));g.addColorStop(1,rgba(f.col,.75*(1-a)));
  ctx.fillStyle=g;ctx.fillRect(f.x-w/2,top,w,280);ctx.fillStyle=rgba('#ffffff',.6*(1-a));ctx.fillRect(f.x-w/6,top,w/3,280);
  if(f.sun){const sy=top+Math.min(1,a*2.2)*(280-20);ctx.fillStyle=rgba('#fff6c0',1-a*.6);ctx.shadowColor='#ffd76a';ctx.shadowBlur=20;ctx.beginPath();ctx.arc(f.x,sy,12,0,7);ctx.fill();ctx.shadowBlur=0;}
  gEll(f.x,f.y,w*1.3);ctx.fillStyle=rgba(f.col,.35*(1-a));ctx.fill();};
// a glowing trail between two points (arrows, charges)
FXK.streak=(f,a)=>{const p=proj(f.x0,f.y0-16),q=proj(f.x,f.y-16);ctx.lineCap='round';
  for(const [w,c,al] of [[f.w||6,f.col,.55],[(f.w||6)*.35,'#ffffff',1]]){ctx.strokeStyle=rgba(c,al*(1-a));ctx.lineWidth=w*(1-a*.5);ctx.beginPath();ctx.moveTo(p.x+(q.x-p.x)*a*.6,p.y+(q.y-p.y)*a*.6);ctx.lineTo(q.x,q.y);ctx.stroke();}};
// lock-on crosshair closing in on the target
FXK.reticle=(f,a)=>{const r=44-a*30,rot=a*2,y=f.y-(f.h||14);ctx.strokeStyle=rgba(f.col,a<.85?1:(1-a)/.15);ctx.lineWidth=2;ctx.beginPath();ctx.arc(f.x,y,r,0,7);ctx.stroke();
  for(let i=0;i<4;i++){const ang=rot+i*1.571;ctx.beginPath();ctx.moveTo(f.x+Math.cos(ang)*(r-7),y+Math.sin(ang)*(r-7));ctx.lineTo(f.x+Math.cos(ang)*(r+9),y+Math.sin(ang)*(r+9));ctx.stroke();}
  ctx.fillStyle=rgba(f.col,1-a);ctx.beginPath();ctx.arc(f.x,y,2.5,0,7);ctx.fill();};
// three claw rakes
FXK.claws=(f,a)=>{const sw=Math.min(1,a*3),ang=f.ang||0,c=Math.cos(ang),s=Math.sin(ang),y=f.y-(f.h||16);ctx.lineCap='round';
  for(let i=-1;i<=1;i++){const ox=-s*i*8,oy=c*i*8*.6,L=(f.r||30)*sw;ctx.strokeStyle=rgba(f.col,1-a);ctx.lineWidth=4*(1-a*.5);ctx.beginPath();
    ctx.moveTo(f.x+ox-c*L/2,y+oy-s*L/2);ctx.lineTo(f.x+ox+c*L/2,y+oy+s*L/2);ctx.stroke();}};
// particles drifting up: leaves, petals, stars or sparks
FXK.motes=(f,a)=>{const rnd2=seeded(f.seed||3),r=f.r||30;
  for(let i=0;i<fxN(f.n||14);i++){const ang=rnd2()*6.28+(f.orbit?now*2:0),d=r*(.4+rnd2()*.6),rise=(a*(40+rnd2()*40)+rnd2()*10),x=f.x+Math.cos(ang)*d,y=f.y+Math.sin(ang)*d*.5-rise,al=(1-a)*(.6+rnd2()*.4),sz=2+rnd2()*3;
    ctx.fillStyle=rgba(i%3?f.col:(f.col2||'#ffffff'),al);ctx.save();ctx.translate(x,y);ctx.rotate(now*3+i);
    if(f.shape==='star'){ctx.beginPath();for(let k=0;k<10;k++){const rr=k%2?sz*.45:sz*1.3,an=k*.628;ctx.lineTo(Math.cos(an)*rr,Math.sin(an)*rr);}ctx.fill();}
    else if(f.shape==='leaf'||f.shape==='petal'){ctx.beginPath();ctx.ellipse(0,0,sz*1.4,sz*.6,0,0,7);ctx.fill();}
    else{ctx.fillRect(-sz/2,-sz/2,sz,sz);}ctx.restore();}};
// shards closing in on the target, then bursting
FXK.spikes=(f,a)=>{const y=f.y-(f.h||14);for(let i=0;i<fxN(7);i++){const ang=i*.9,d=a<.5?40*(1-a*2):a*30;const x=f.x+Math.cos(ang)*d,yy=y+Math.sin(ang)*d*.7;
  ctx.strokeStyle=rgba(f.col,a<.5?1:1-(a-.5)*2);ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x,yy);ctx.lineTo(x-Math.cos(ang)*12,yy-Math.sin(ang)*8);ctx.stroke();}};
// a bright flash
FXK.flare=(f,a)=>{const r=(f.r||40)*(.5+a*.8),y=f.y-(f.h||14),g=ctx.createRadialGradient(f.x,y,0,f.x,y,r);g.addColorStop(0,rgba('#ffffff',.9*(1-a)));g.addColorStop(.35,rgba(f.col,.6*(1-a)));g.addColorStop(1,rgba(f.col,0));
  ctx.fillStyle=g;ctx.beginPath();ctx.arc(f.x,y,r,0,7);ctx.fill();};
// a herd of dust clouds racing across the area
FXK.stampede=(f,a)=>{const rnd2=seeded(f.seed||5);for(let i=0;i<fxN(8);i++){const lane=(rnd2()-.5)*f.r*1.4,start=-f.r-rnd2()*40,x=f.x+start+a*(f.r*2+80),y=f.y+lane*.5;
  ctx.fillStyle=rgba(f.col,.5*(1-a));ctx.beginPath();ctx.arc(x,y-6,9+rnd2()*6,0,7);ctx.fill();ctx.fillStyle=rgba('#3e3020',.6*(1-a));ctx.fillRect(x-12,y-2,4,3);ctx.fillRect(x-20,y-1,4,3);}};

{const _dfx=drawFx;drawFx=function(){_dfx.apply(this,arguments);
  for(const f of fx){const d=FXK[f.k];if(!d||now<f.t0)continue;const a=Math.min(1,(now-f.t0)/f.dur);if(f.o){f.x=f.o===P?P.x:f.o.x;f.y=f.o===P?P.y:f.o.y;}
    ctx.save();const sp=proj(f.x,f.y);ctx.translate(sp.x-f.x,sp.y-f.y);try{if(f.k==='chain'||f.k==='streak'){ctx.translate(f.x-sp.x,f.y-sp.y);}d(f,a);}catch(e){}ctx.restore();}};}

/* ---- which effects each skill fires (added in front of the skill's own work) ---- */
const fxSz=t=>t&&t.d?t.d.size:14,fxF=o=>fx.push({t0:now,seed:(Math.random()*1e6)|0,...o});
const SKILL_FX={
  lethaledge:(l,t)=>{fxF({k:'crescent',x:t.x,y:t.y,ang:.7,r:30,col:'#ffd27a',dur:.3,h:fxSz(t)});fxF({k:'crescent',x:t.x,y:t.y,ang:-2.4,r:30,col:'#ffd27a',dur:.3,h:fxSz(t),t0:now+.08});fxF({k:'motes',x:t.x,y:t.y,col:'#ffe9a0',n:10,r:20,dur:.5});},
  sunder:(l,t)=>{fxF({k:'crescent',x:t.x,y:t.y,ang:1.57,r:36,w:14,col:'#ff9a4a',dur:.25,h:fxSz(t)+10});fxF({k:'quake',x:t.x,y:t.y,r:75,col:'#5a3a1a',dur:.7,t0:now+.12});},
  secondwind:l=>{fxF({k:'motes',x:P.x,y:P.y,o:P,col:'#8fe0a8',col2:'#d8ffe0',shape:'leaf',n:18,r:34,dur:1.3});fxF({k:'rune',x:P.x,y:P.y,o:P,col:'#8fe0a8',r:30,dur:1});},
  mindspike:(l,t)=>fxF({k:'spikes',x:t.x,y:t.y,col:'#e0b0ff',dur:.45,h:fxSz(t)}),
  manashield:l=>{fxF({k:'dome',x:P.x,y:P.y,o:P,col:'#7fb8ff',r:34,dur:1.6});fxF({k:'rune',x:P.x,y:P.y,o:P,col:'#7fb8ff',r:36,g:'◍',dur:1.2});},
  aimedshot:(l,t)=>{fxF({k:'reticle',x:t.x,y:t.y,col:'#ffe08a',dur:.45,h:fxSz(t)});fxF({k:'streak',x0:P.x,y0:P.y,x:t.x,y:t.y,col:'#ffe08a',dur:.3,t0:now+.12});},
  holystrike:(l,t)=>{fxF({k:'rune',x:t.x,y:t.y,col:'#fff0a0',g:'✚',r:26,dur:.8});fxF({k:'crescent',x:t.x,y:t.y,ang:2.4,r:28,col:'#fff6c0',dur:.3,h:fxSz(t)});},
  renew:l=>{fxF({k:'motes',x:P.x,y:P.y,o:P,col:'#ffb0d0',col2:'#9ff0b0',shape:'petal',n:20,r:36,dur:1.8});fxF({k:'flare',x:P.x,y:P.y,col:'#9ff0b0',r:40,dur:.5,h:20});},
  shieldcharge:(l,t)=>{fxF({k:'streak',x0:P.x,y0:P.y,x:t.x,y:t.y,col:'#c8d0dc',w:10,dur:.25});fxF({k:'flare',x:t.x,y:t.y,col:'#e8eef8',r:34,dur:.3,h:fxSz(t)});fxF({k:'quake',x:t.x,y:t.y,r:40,col:'#6a7480',dur:.5});},
  rampage:l=>{for(let i=0;i<4;i++)fxF({k:'claws',x:P.x+Math.cos(i*1.57+.4)*40,y:P.y+Math.sin(i*1.57+.4)*22,ang:i*1.57+1.2,r:34,col:'#ff5a3a',dur:.35,t0:now+i*.05});fxF({k:'flare',x:P.x,y:P.y,col:'#ff4a2a',r:60,dur:.35,h:16});},
  chainlightning:(l,t)=>{const pts=[{x:P.x,y:P.y,h:22},{x:t.x,y:t.y,h:fxSz(t)}];
    mobs.filter(m=>m!==t&&!m.dead&&Math.hypot(m.x-t.x,m.y-t.y)<=120).sort((a,b)=>Math.hypot(a.x-t.x,a.y-t.y)-Math.hypot(b.x-t.x,b.y-t.y)).slice(0,1+Math.floor(l/3)).forEach(m=>pts.push({x:m.x,y:m.y,h:fxSz(m)}));
    fxF({k:'chain',x:t.x,y:t.y,pts,col:'#b8a8ff',dur:.5});},
  frailty:(l,t)=>{fxF({k:'rune',x:t.x,y:t.y,col:'#b07ad0',g:'☠',r:fxSz(t)+14,dur:1.4});fxF({k:'vortex',x:t.x,y:t.y,col:'#7a4aa0',col2:'#d0a0ff',r:30,imp:true,dur:.6});},
  deadlyarrow:(l,t)=>{fxF({k:'streak',x0:P.x,y0:P.y,x:t.x,y:t.y,col:'#ff9a3a',w:9,dur:.35});fxF({k:'flare',x:t.x,y:t.y,col:'#ff9a3a',r:46,dur:.35,t0:now+.15,h:fxSz(t)});},
  rapidfire:(l,t)=>{for(let i=0;i<3;i++)fxF({k:'streak',x0:P.x,y0:P.y+(i-1)*6,x:t.x,y:t.y,col:'#c8f08a',w:5,dur:.22,t0:now+i*.11});},
  sacredbulwark:l=>{fxF({k:'dome',x:P.x,y:P.y,o:P,col:'#ffe08a',r:36,dur:1.6});fxF({k:'motes',x:P.x,y:P.y,o:P,col:'#fff0a0',shape:'star',n:12,r:36,dur:1.4});},
  exorcism:(l,t)=>{fxF({k:'beam',x:t.x,y:t.y,col:'#fff6c0',w:26,dur:.6});fxF({k:'rune',x:t.x,y:t.y,col:'#ffe27a',g:'✶',r:30,dur:.8});fxF({k:'motes',x:t.x,y:t.y,col:'#ffffff',col2:'#ffe27a',n:14,r:24,dur:.8});},
  retribution:l=>{fxF({k:'quake',x:P.x,y:P.y,r:110,col:'#8a6a2a',dust:'#e8d8a0',dur:.8});fxF({k:'flare',x:P.x,y:P.y,col:'#ffd76a',r:90,dur:.4,h:12});fxF({k:'dome',x:P.x,y:P.y,o:P,col:'#ffd76a',r:30,dur:.6});},
  execution:(l,t)=>{const mx=t.maxhp||(t.d&&t.d.hp),low=mx>0&&t.hp/mx<.3;fxF({k:'crescent',x:t.x,y:t.y,ang:1.2,r:low?48:38,w:low?18:13,col:'#ff3a2a',dur:.35,h:fxSz(t)+6});
    fxF({k:'flare',x:t.x,y:t.y,col:'#ff2a1a',r:low?80:50,dur:.4,t0:now+.1,h:fxSz(t)});if(low)fxF({k:'motes',x:t.x,y:t.y,col:'#c01a10',n:16,r:26,dur:.7});},
  tempest:l=>{fxF({k:'vortex',x:P.x,y:P.y,o:P,col:'#9fe0ff',col2:'#ffffff',r:150,dur:1});for(let i=0;i<3;i++){const a1=Math.random()*6.28,a2=a1+2;
    fxF({k:'chain',x:P.x,y:P.y,pts:[{x:P.x+Math.cos(a1)*120,y:P.y+Math.sin(a1)*80,h:60},{x:P.x,y:P.y,h:30},{x:P.x+Math.cos(a2)*120,y:P.y+Math.sin(a2)*80,h:10}],col:'#bfefff',dur:.35,t0:now+i*.15});}},
  unmaking:(l,x,y)=>{fxF({k:'vortex',x,y,col:'#5a2a8a',col2:'#e0a8ff',r:130,imp:true,dur:.9});fxF({k:'rune',x,y,col:'#c58cff',g:'⊘',r:60,dur:1.1});},
  killingshot:(l,t)=>{fxF({k:'reticle',x:t.x,y:t.y,col:'#ffffff',dur:.4,h:fxSz(t)});fxF({k:'streak',x0:P.x,y0:P.y,x:t.x,y:t.y,col:'#fff6c0',w:14,dur:.45});fxF({k:'flare',x:t.x,y:t.y,col:'#ffe27a',r:90,dur:.45,t0:now+.18,h:fxSz(t)});shakeUntil=Math.max(shakeUntil,now+.25);},
  stampede:(l,x,y)=>{fxF({k:'stampede',x,y,col:'#b8a070',r:120,dur:.9});fxF({k:'quake',x,y,r:120,col:'#5a4a2a',dur:.9,t0:now+.2});},
  solarjudgment:(l,t)=>{fxF({k:'beam',x:t.x,y:t.y,col:'#ffd76a',w:34,sun:true,dur:.7});fxF({k:'rune',x:t.x,y:t.y,col:'#ffd76a',g:'☼',r:34,dur:.9});fxF({k:'flare',x:t.x,y:t.y,col:'#ffe27a',r:70,dur:.4,t0:now+.3,h:fxSz(t)});},
  constellation:l=>{fxF({k:'motes',x:P.x,y:P.y,o:P,col:'#9fd8ff',col2:'#ffffff',shape:'star',orbit:true,n:20,r:44,dur:2});fxF({k:'rune',x:P.x,y:P.y,o:P,col:'#9fd8ff',g:'✵',r:44,dur:1.5});fxF({k:'beam',x:P.x,y:P.y,col:'#cfe8ff',w:30,dur:.6});},
};
for(const id in SKILL_FX){const sk=SKILLS[id];if(!sk||!sk.run)continue;const run=sk.run,fxf=SKILL_FX[id];
  sk.run=function(){try{fxf.apply(this,arguments);}catch(e){}return run.apply(this,arguments);};}

/* ---- more effect kinds for the older skills ---- */
// a burning rock (or star) falling from the sky, then the impact
FXK.meteor=(f,a)=>{const fall=Math.min(1,a/.55),sx=f.x+70,sy=f.y-280,x=sx+(f.x-sx)*fall,y=sy+(f.y-sy)*fall,s=f.size||10;
  if(a<.55){const g=ctx.createLinearGradient(sx,sy,x,y);g.addColorStop(0,rgba(f.col,0));g.addColorStop(1,rgba(f.col,.8));ctx.strokeStyle=g;ctx.lineWidth=s*1.2;ctx.lineCap='round';
    ctx.beginPath();ctx.moveTo(x+(sx-x)*.35,y+(sy-y)*.35);ctx.lineTo(x,y);ctx.stroke();ctx.fillStyle=rgba('#ffffff',.95);ctx.shadowColor=f.col;ctx.shadowBlur=16;ctx.beginPath();ctx.arc(x,y,s*.7,0,7);ctx.fill();ctx.shadowBlur=0;}
  else{const b=(a-.55)/.45,r=(f.r||40)*(.4+b);const g=ctx.createRadialGradient(f.x,f.y-6,0,f.x,f.y-6,r);g.addColorStop(0,rgba('#ffffff',.9*(1-b)));g.addColorStop(.4,rgba(f.col,.7*(1-b)));g.addColorStop(1,rgba(f.col,0));
    ctx.fillStyle=g;ctx.beginPath();ctx.arc(f.x,f.y-6,r,0,7);ctx.fill();gEll(f.x,f.y,r);ctx.strokeStyle=rgba(f.col,.8*(1-b));ctx.lineWidth=3;ctx.stroke();}};
// crystals (ice, stone, thorns) bursting up out of the ground
FXK.icicles=(f,a)=>{const rnd2=seeded(f.seed||11),grow=Math.min(1,a/.25),al=a<.6?1:(1-a)/.4;
  for(let i=0;i<fxN(f.n||10);i++){const ang=rnd2()*6.28,d=(f.r||40)*(.25+rnd2()*.75),x=f.x+Math.cos(ang)*d,y=f.y+Math.sin(ang)*d*.5,h=(14+rnd2()*22)*grow*(f.tall||1),w=4+rnd2()*4;
    ctx.fillStyle=rgba(f.col,.85*al);ctx.strokeStyle=rgba('#ffffff',.7*al);ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x-w,y);ctx.lineTo(x+(rnd2()-.5)*4,y-h);ctx.lineTo(x+w,y);ctx.closePath();ctx.fill();ctx.stroke();}};
// a glowing halo with rays over someone's head
FXK.halo=(f,a)=>{const al=(a<.2?a/.2:a>.7?(1-a)/.3:1),y=f.y-(f.h||46)-Math.sin(now*4)*2;ctx.shadowColor=f.col;ctx.shadowBlur=12;ctx.strokeStyle=rgba(f.col,al);ctx.lineWidth=3;
  ctx.beginPath();ctx.ellipse(f.x,y,13,5,0,0,7);ctx.stroke();ctx.shadowBlur=0;ctx.lineWidth=1.5;
  for(let i=0;i<8;i++){const ang=now*1.5+i*.785,r1=16,r2=22+Math.sin(now*6+i)*3;ctx.strokeStyle=rgba(f.col,.6*al);ctx.beginPath();ctx.moveTo(f.x+Math.cos(ang)*r1,y+Math.sin(ang)*r1*.4);ctx.lineTo(f.x+Math.cos(ang)*r2,y+Math.sin(ang)*r2*.4);ctx.stroke();}};

const SKILL_FX2={
  firstaid:l=>{fxF({k:'motes',x:P.x,y:P.y,o:P,col:'#7fd38a',col2:'#ffffff',n:10,r:20,dur:.9});},
  cleave:(l,t)=>{fxF({k:'crescent',x:t.x,y:t.y,ang:.4,r:34,w:13,col:'#e06a5a',dur:.3,h:fxSz(t)});fxF({k:'flare',x:t.x,y:t.y,col:'#ff8a6a',r:36,dur:.3,t0:now+.08,h:fxSz(t)});},
  whirl:l=>{fxF({k:'vortex',x:P.x,y:P.y,o:P,col:'#ffb070',col2:'#ffffff',r:95,dur:.5});for(let i=0;i<4;i++)fxF({k:'crescent',x:P.x,y:P.y,ang:i*1.57,r:44,col:'#ffd0a0',dur:.3,t0:now+i*.06});},
  ironwill:l=>{fxF({k:'dome',x:P.x,y:P.y,o:P,col:'#b0b8c8',r:30,dur:1.2});fxF({k:'rune',x:P.x,y:P.y,o:P,col:'#d0d8e8',g:'◆',r:30,dur:1});},
  emberbolt:(l,t)=>{fxF({k:'flare',x:t.x,y:t.y,col:'#ff8a3a',r:40,dur:.35,t0:now+.25,h:fxSz(t)});fxF({k:'motes',x:t.x,y:t.y,col:'#ffb060',col2:'#ff5a1a',n:10,r:18,dur:.6,t0:now+.25});},
  frostnova:l=>{fxF({k:'icicles',x:P.x,y:P.y,col:'#bfe6ff',r:110,n:16,dur:.9});fxF({k:'flare',x:P.x,y:P.y,col:'#8fd0f0',r:90,dur:.35,h:8});},
  arcstorm:(l,x,y)=>{for(let i=0;i<3;i++){const a1=Math.random()*6.28;fxF({k:'chain',x,y,pts:[{x:x+Math.cos(a1)*90,y:y+Math.sin(a1)*60,h:90},{x,y,h:20},{x:x-Math.cos(a1)*90,y:y-Math.sin(a1)*60,h:4}],col:'#c8b0ff',dur:.3,t0:now+i*.12});}
    fxF({k:'rune',x,y,col:'#c8b0ff',g:'ϟ',r:70,dur:.8});},
  twinshot:(l,t)=>{fxF({k:'streak',x0:P.x,y0:P.y,x:t.x,y:t.y,col:'#9fe08a',w:5,dur:.2});fxF({k:'streak',x0:P.x,y0:P.y+6,x:t.x,y:t.y,col:'#9fe08a',w:5,dur:.2,t0:now+.11});},
  arrowrain:(l,x,y)=>{fxF({k:'rune',x,y,col:'#d8e070',g:'⇊',r:100,dur:.8});fxF({k:'icicles',x,y,col:'#d8c890',r:100,n:14,tall:.6,dur:.8,t0:now+.25});},
  hawkeye:l=>{fxF({k:'halo',x:P.x,y:P.y,o:P,col:'#e0c070',dur:1.4});fxF({k:'reticle',x:P.x,y:P.y,col:'#e0c070',dur:.5,h:24});},
  smite:(l,t)=>{fxF({k:'beam',x:t.x,y:t.y,col:'#fff0a0',w:18,dur:.45});fxF({k:'flare',x:t.x,y:t.y,col:'#fff0a0',r:34,dur:.3,h:fxSz(t)});},
  mend:l=>{fxF({k:'motes',x:P.x,y:P.y,o:P,col:'#7fd38a',col2:'#e0ffe8',shape:'petal',n:14,r:28,dur:1.1});fxF({k:'rune',x:P.x,y:P.y,o:P,col:'#7fd38a',g:'+',r:28,dur:.9});},
  blessing:l=>{fxF({k:'halo',x:P.x,y:P.y,o:P,col:'#f0e0a0',dur:1.6});fxF({k:'motes',x:P.x,y:P.y,o:P,col:'#fff0a0',shape:'star',n:14,r:30,dur:1.3});fxF({k:'beam',x:P.x,y:P.y,col:'#fff6d0',w:24,dur:.5});},
  shieldbash:(l,t)=>{fxF({k:'flare',x:t.x,y:t.y,col:'#e8eef8',r:40,dur:.3,h:fxSz(t)});fxF({k:'quake',x:t.x,y:t.y,r:40,col:'#6a7480',glow:'#c8d0dc',dur:.5});},
  bastion:l=>{fxF({k:'dome',x:P.x,y:P.y,o:P,col:'#c8ccd4',r:40,dur:1.5});fxF({k:'quake',x:P.x,y:P.y,r:50,col:'#6a7480',glow:'#c8ccd4',dur:.6});},
  warcry:l=>{fxF({k:'flare',x:P.x,y:P.y,col:'#ff5a3a',r:130,dur:.45,h:20});fxF({k:'rune',x:P.x,y:P.y,o:P,col:'#e8c25a',g:'!',r:50,dur:1});},
  rendingblow:(l,t)=>{fxF({k:'claws',x:t.x,y:t.y,ang:.9,r:38,col:'#d0503a',dur:.35,h:fxSz(t)});fxF({k:'crescent',x:t.x,y:t.y,ang:-1,r:30,col:'#8a1a10',dur:.3,h:fxSz(t)});},
  frenzy:l=>{fxF({k:'halo',x:P.x,y:P.y,o:P,col:'#ff5a3a',dur:1.4});fxF({k:'motes',x:P.x,y:P.y,o:P,col:'#ff7a4a',col2:'#ffd0a0',n:16,r:26,dur:1.2});fxF({k:'flare',x:P.x,y:P.y,col:'#ff4a2a',r:60,dur:.4,h:20});},
  earthshatter:l=>{fxF({k:'quake',x:P.x,y:P.y,r:110,col:'#5a3a1a',dur:.9});fxF({k:'icicles',x:P.x,y:P.y,col:'#a07a4a',r:100,n:14,dur:.8,t0:now+.1});},
  glaciallance:(l,t)=>{fxF({k:'streak',x0:P.x,y0:P.y,x:t.x,y:t.y,col:'#9fe0ff',w:9,dur:.3});fxF({k:'icicles',x:t.x,y:t.y,col:'#cfeeff',r:26,n:8,tall:1.4,dur:.8,t0:now+.2});},
  cinderfall:(l,x,y)=>{for(let i=0;i<fxN(5);i++)fxF({k:'meteor',x:x+rnd(-80,80),y:y+rnd(-50,50),col:'#ff6a2a',size:7,r:36,dur:.7,t0:now+i*.1});},
  manasurge:l=>{fxF({k:'halo',x:P.x,y:P.y,o:P,col:'#7a9cff',dur:1.4});fxF({k:'motes',x:P.x,y:P.y,o:P,col:'#7a9cff',col2:'#ffffff',orbit:true,n:16,r:30,dur:1.3});},
  shadowlance:(l,t)=>{fxF({k:'streak',x0:P.x,y0:P.y,x:t.x,y:t.y,col:'#a07ad0',w:9,dur:.3});fxF({k:'vortex',x:t.x,y:t.y,col:'#4a2a6a',col2:'#c8a0f0',r:30,imp:true,dur:.5,t0:now+.15});},
  hexofsloth:(l,t)=>{fxF({k:'rune',x:t.x,y:t.y,col:'#7a5aa0',g:'⌛',r:fxSz(t)+14,dur:1.4});fxF({k:'motes',x:t.x,y:t.y,col:'#7a5aa0',n:10,r:20,dur:1});},
  soulsiphon:l=>{fxF({k:'vortex',x:P.x,y:P.y,o:P,col:'#7a3aaa',col2:'#e0b0ff',r:120,imp:true,dur:.8});fxF({k:'motes',x:P.x,y:P.y,o:P,col:'#c58cff',n:14,r:40,dur:1});},
  piercingshot:(l,t)=>{fxF({k:'streak',x0:P.x,y0:P.y,x:t.x,y:t.y,col:'#e0c070',w:11,dur:.3});fxF({k:'spikes',x:t.x,y:t.y,col:'#ffe08a',dur:.4,t0:now+.12,h:fxSz(t)});},
  trueaim:l=>{fxF({k:'reticle',x:P.x,y:P.y,col:'#f0d070',dur:.6,h:24});fxF({k:'halo',x:P.x,y:P.y,o:P,col:'#f0d070',dur:1.2});},
  volley:(l,x,y)=>{for(let i=0;i<fxN(6);i++){const tx=x+rnd(-110,110),ty=y+rnd(-70,70);fxF({k:'streak',x0:P.x,y0:P.y,x:tx,y:ty,col:'#d8e070',w:4,dur:.25,t0:now+i*.04});}fxF({k:'rune',x,y,col:'#d8e070',r:120,dur:.7});},
  venomarrow:(l,t)=>{fxF({k:'streak',x0:P.x,y0:P.y,x:t.x,y:t.y,col:'#7fd36a',w:6,dur:.25});fxF({k:'motes',x:t.x,y:t.y,col:'#7fd36a',col2:'#3a8a2a',n:12,r:18,dur:1,t0:now+.15});},
  snareshot:(l,t)=>{fxF({k:'icicles',x:t.x,y:t.y,col:'#8a6a3a',r:26,n:9,dur:1.2});fxF({k:'rune',x:t.x,y:t.y,col:'#b8a060',g:'⌖',r:fxSz(t)+12,dur:1});},
  swiftstep:l=>{fxF({k:'motes',x:P.x,y:P.y,o:P,col:'#9be38a',shape:'leaf',n:14,r:26,dur:1.1});fxF({k:'halo',x:P.x,y:P.y,o:P,col:'#9be38a',dur:1});},
  crusade:(l,t)=>{fxF({k:'crescent',x:t.x,y:t.y,ang:2,r:32,w:12,col:'#fff0a0',dur:.3,h:fxSz(t)});fxF({k:'rune',x:t.x,y:t.y,col:'#ffe27a',g:'✚',r:24,dur:.7});},
  holyaegis:l=>{fxF({k:'dome',x:P.x,y:P.y,o:P,col:'#fff0c0',r:34,dur:1.5});fxF({k:'halo',x:P.x,y:P.y,o:P,col:'#fff0a0',dur:1.4});},
  judgment:l=>{fxF({k:'beam',x:P.x,y:P.y,col:'#ffe27a',w:40,dur:.6});fxF({k:'quake',x:P.x,y:P.y,r:100,col:'#8a6a2a',glow:'#fff0a0',dur:.7,t0:now+.15});},
  sanctuary:l=>{fxF({k:'rune',x:P.x,y:P.y,o:P,col:'#9fffc0',g:'✚',r:80,dur:1.4});fxF({k:'motes',x:P.x,y:P.y,o:P,col:'#9fffc0',col2:'#ffffff',shape:'petal',n:20,r:70,dur:1.5});},
  radiance:(l,x,y)=>{for(let i=0;i<fxN(4);i++)fxF({k:'beam',x:x+rnd(-70,70),y:y+rnd(-45,45),col:'#fff6c0',w:16,dur:.5,t0:now+i*.08});fxF({k:'rune',x,y,col:'#fff6c0',r:110,dur:.8});},
  divinegrace:l=>{fxF({k:'halo',x:P.x,y:P.y,o:P,col:'#7fd3ff',dur:1.6});fxF({k:'motes',x:P.x,y:P.y,o:P,col:'#7fd3ff',col2:'#ffffff',shape:'star',n:14,r:30,dur:1.4});},
  titanslam:l=>{fxF({k:'quake',x:P.x,y:P.y,r:140,col:'#5a3a1a',glow:'#ffd76a',dur:1});fxF({k:'icicles',x:P.x,y:P.y,col:'#a08a6a',r:130,n:18,tall:1.3,dur:.9,t0:now+.1});fxF({k:'flare',x:P.x,y:P.y,col:'#ffd76a',r:110,dur:.4,h:10});},
  fortress:l=>{fxF({k:'dome',x:P.x,y:P.y,o:P,col:'#ffd76a',r:46,dur:1.8});fxF({k:'rune',x:P.x,y:P.y,o:P,col:'#ffd76a',g:'▣',r:50,dur:1.4});},
  cataclysm:(l,x,y)=>{fxF({k:'meteor',x,y,col:'#e0703a',size:16,r:120,dur:.9});fxF({k:'quake',x,y,r:130,col:'#5a2a10',glow:'#ff9a5a',dur:.9,t0:now+.5});},
  bloodrage:l=>{fxF({k:'halo',x:P.x,y:P.y,o:P,col:'#ff4a3a',dur:1.5});fxF({k:'vortex',x:P.x,y:P.y,o:P,col:'#ff4a3a',col2:'#3a0a08',r:50,dur:.6});fxF({k:'motes',x:P.x,y:P.y,o:P,col:'#c01a10',n:16,r:28,dur:1.2});},
  thunderlance:(l,t)=>{fxF({k:'chain',x:t.x,y:t.y,pts:[{x:t.x+20,y:t.y,h:260},{x:t.x,y:t.y,h:fxSz(t)}],col:'#d8c8ff',dur:.35});fxF({k:'flare',x:t.x,y:t.y,col:'#d8c8ff',r:50,dur:.35,h:fxSz(t)});},
  meteor:(l,x,y)=>{fxF({k:'meteor',x,y,col:'#ff5a1a',size:20,r:150,dur:1});fxF({k:'quake',x,y,r:150,col:'#4a1a08',glow:'#ff7a2a',dur:1,t0:now+.55});},
  lifedrain:(l,t)=>{fxF({k:'streak',x0:t.x,y0:t.y,x:P.x,y:P.y,col:'#c070ff',w:8,dur:.45});fxF({k:'motes',x:P.x,y:P.y,o:P,col:'#c070ff',n:10,r:20,dur:.8,t0:now+.2});},
  voidrift:(l,x,y)=>{fxF({k:'vortex',x,y,col:'#2e1a48',col2:'#e0a8ff',r:130,imp:true,dur:1});fxF({k:'rune',x,y,col:'#7a3aaa',g:'◯',r:60,dur:1});},
  headshot:(l,t)=>{fxF({k:'reticle',x:t.x,y:t.y,col:'#ff5a4a',dur:.35,h:fxSz(t)+6});fxF({k:'streak',x0:P.x,y0:P.y,x:t.x,y:t.y,col:'#ffe08a',w:10,dur:.35});fxF({k:'flare',x:t.x,y:t.y,col:'#ff8a5a',r:60,dur:.35,t0:now+.15,h:fxSz(t)+6});},
  arrowstorm:(l,x,y)=>{for(let i=0;i<fxN(10);i++)fxF({k:'meteor',x:x+rnd(-120,120),y:y+rnd(-80,80),col:'#e8e090',size:3,r:16,dur:.5,t0:now+i*.05});fxF({k:'rune',x,y,col:'#e8e090',r:140,dur:.9});},
  savagevolley:(l,x,y)=>{fxF({k:'stampede',x,y,col:'#a8d86a',r:110,dur:.8});for(let i=0;i<3;i++)fxF({k:'claws',x:x+rnd(-60,60),y:y+rnd(-40,40),ang:rnd(0,3),r:36,col:'#c8f08a',dur:.35,t0:now+i*.1});},
  packhowl:l=>{fxF({k:'flare',x:P.x,y:P.y,col:'#c8f08a',r:120,dur:.5,h:20});fxF({k:'rune',x:P.x,y:P.y,o:P,col:'#c8f08a',g:'❦',r:60,dur:1.2});fxF({k:'motes',x:P.x,y:P.y,o:P,col:'#c8f08a',shape:'leaf',n:14,r:50,dur:1.2});},
  dawnbreaker:l=>{fxF({k:'beam',x:P.x,y:P.y,col:'#fff2a0',w:48,dur:.6});fxF({k:'flare',x:P.x,y:P.y,col:'#ffd76a',r:120,dur:.45,t0:now+.15,h:10});fxF({k:'quake',x:P.x,y:P.y,r:110,col:'#8a6a2a',glow:'#fff2a0',dur:.7,t0:now+.15});},
  sacredward:l=>{fxF({k:'dome',x:P.x,y:P.y,o:P,col:'#fff6c0',r:44,dur:1.6});fxF({k:'halo',x:P.x,y:P.y,o:P,col:'#fff6c0',dur:1.6});},
  starfall:(l,x,y)=>{for(let i=0;i<fxN(7);i++)fxF({k:'meteor',x:x+rnd(-110,110),y:y+rnd(-70,70),col:'#cfe8ff',size:6,r:30,dur:.7,t0:now+i*.09});},
  resurgence:l=>{fxF({k:'beam',x:P.x,y:P.y,col:'#9fffd0',w:36,dur:.7});fxF({k:'motes',x:P.x,y:P.y,o:P,col:'#9fffd0',col2:'#ffffff',shape:'petal',n:22,r:40,dur:1.6});fxF({k:'flare',x:P.x,y:P.y,col:'#9fffd0',r:70,dur:.4,h:20});},
};
for(const id in SKILL_FX2){const sk=SKILLS[id];if(!sk||!sk.run||SKILL_FX[id])continue;SKILL_FX[id]=SKILL_FX2[id];const run=sk.run,fxf=SKILL_FX2[id];
  sk.run=function(){try{fxf.apply(this,arguments);}catch(e){}return run.apply(this,arguments);};}
// ground skills (js/ground.js) are placed rather than run
const ZONE_FX={thornsnare:(l,x,y)=>fxF({k:'icicles',x,y,col:'#7a5a2a',r:26,n:9,dur:.9}),
  emberwall:(l,x,y)=>{fxF({k:'flare',x,y,col:'#ff7a2a',r:70,dur:.4,h:6});fxF({k:'motes',x,y,col:'#ffb060',col2:'#ff5a1a',n:16,r:60,dur:1});},
  haven:(l,x,y)=>{fxF({k:'rune',x,y,col:'#9fffc0',g:'◎',r:95,dur:1.4});fxF({k:'motes',x,y,col:'#9fffc0',shape:'petal',n:16,r:80,dur:1.4});}};
if(typeof placeZone==='function'){const _pz=placeZone;placeZone=function(k,l,x,y){try{if(ZONE_FX[k])ZONE_FX[k](l,x,y);}catch(e){}return _pz.apply(this,arguments);};}
