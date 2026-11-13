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
