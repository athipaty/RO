"use strict";
/* ================= fighting styles: every calling attacks and casts its own way =================
   Looks only: damage, hit chance and timing are exactly the same as before.
   - Basic attack: each calling has its own projectile (spark, shadow skull, clock bolt, tracer, falcon...) or its own
     melee impact (heavy chop, shield shove, rune slash, palm jabs...). Other players see your style too (it follows
     their job, which presence already carries).
   - Casting: each calling charges spells on its own circle (clock face, rune stones, lotus petals, watching eyes...).
   - Finisher: now and then (1 in 8, at most every 6 s) a critical hit or killing blow from your basic attack plays the
     calling's signature move, with its name over your head. Your screen only.
   Master callings use their advanced calling's style for now. Lite mode draws fewer particles (fxN). */
const FSTY_CHANCE=.125,FSTY_CD=6;
const FSTY={me:false,other:null,basic:0,finT:0,bow:null};
const fsH=t=>t&&t.d?t.d.size:14;
const fsDir=(a,b)=>{const p=proj(a.x,a.y),q=proj(b.x,b.y);return Math.atan2(q.y-p.y,q.x-p.x);};
// where a projectile is heading on screen (worked out from its last two screen positions)
function fsAng(s){const p=proj(s.x,s.y);let a=s.fsA;if(a===undefined)a=s.to?fsDir(s,s.to):0;
  if(s.fsP){const dx=p.x-s.fsP.x,dy=p.y-s.fsP.y;if(dx*dx+dy*dy>.3)a=Math.atan2(dy,dx);}s.fsP=p;s.fsA=a;return a;}

/* ---- projectiles: drawn at the shot (origin), facing its way ---- */
const FS_SHOT={
  orb:(c1,c2)=>s=>{const g=ctx.createRadialGradient(0,0,1,0,0,11);g.addColorStop(0,'#fff');g.addColorStop(.4,c1);g.addColorStop(1,rgba(c1,0));ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,11,0,7);ctx.fill();
    const a=fsAng(s);ctx.fillStyle=rgba(c2,.8);for(let i=1;i<=3;i++){const d=i*6,w=Math.sin(now*20+i)*2;ctx.beginPath();ctx.arc(-Math.cos(a)*d-Math.sin(a)*w,-Math.sin(a)*d+Math.cos(a)*w,3-i*.7,0,7);ctx.fill();}},
  spark:s=>{const a=fsAng(s);ctx.rotate(a);ctx.strokeStyle=rgba('#fff6a0',.95);ctx.lineWidth=2;ctx.lineJoin='round';
    for(let k=0;k<2;k++){ctx.beginPath();ctx.moveTo(-18,0);for(let x=-14;x<=6;x+=5)ctx.lineTo(x,(Math.random()-.5)*9);ctx.stroke();}
    const g=ctx.createRadialGradient(4,0,0,4,0,9);g.addColorStop(0,'#ffffff');g.addColorStop(.5,'#ffe14a');g.addColorStop(1,'rgba(255,225,74,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(4,0,9,0,7);ctx.fill();},
  skull:s=>{const a=fsAng(s);ctx.fillStyle=rgba('#5a2a7a',.5);for(let i=1;i<=4;i++){ctx.beginPath();ctx.arc(-Math.cos(a)*i*5+Math.sin(now*12+i)*2,-Math.sin(a)*i*5,5-i,0,7);ctx.fill();}
    ctx.fillStyle='#d8c0f0';ctx.strokeStyle='#3a1050';ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(0,-1,6.5,0,7);ctx.fill();ctx.stroke();ctx.fillRect(-3.5,3,7,3.5);
    ctx.fillStyle='#2a0a3a';ctx.beginPath();ctx.arc(-2.4,-1.5,1.8,0,7);ctx.arc(2.4,-1.5,1.8,0,7);ctx.fill();ctx.fillStyle='#c070ff';ctx.fillRect(-2.9,-2,1,1);ctx.fillRect(1.9,-2,1,1);},
  clock:s=>{ctx.strokeStyle=rgba('#8ff0e0',.95);ctx.lineWidth=1.6;ctx.fillStyle=rgba('#0c3a40',.55);ctx.beginPath();ctx.arc(0,0,8,0,7);ctx.fill();ctx.stroke();
    for(let i=0;i<4;i++){const an=i*1.571;ctx.beginPath();ctx.moveTo(Math.cos(an)*6,Math.sin(an)*6);ctx.lineTo(Math.cos(an)*8,Math.sin(an)*8);ctx.stroke();}
    ctx.strokeStyle='#ffffff';ctx.lineWidth=1.8;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(Math.cos(now*14)*6,Math.sin(now*14)*6);ctx.moveTo(0,0);ctx.lineTo(Math.cos(now*3)*4,Math.sin(now*3)*4);ctx.stroke();},
  arrow:(col,trail)=>s=>{const a=fsAng(s);ctx.rotate(a);if(trail){const g=ctx.createLinearGradient(-30,0,0,0);g.addColorStop(0,rgba(trail,0));g.addColorStop(1,rgba(trail,.7));ctx.strokeStyle=g;ctx.lineWidth=4;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-30,0);ctx.lineTo(-4,0);ctx.stroke();}
    ctx.strokeStyle=col;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-12,0);ctx.lineTo(6,0);ctx.stroke();ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(9,0);ctx.lineTo(3,-3);ctx.lineTo(3,3);ctx.fill();
    ctx.fillStyle=rgba(trail||col,.9);ctx.beginPath();ctx.moveTo(-12,0);ctx.lineTo(-16,-3);ctx.lineTo(-10,0);ctx.lineTo(-16,3);ctx.fill();},
  tracer:s=>{const a=fsAng(s);ctx.rotate(a);const g=ctx.createLinearGradient(-46,0,6,0);g.addColorStop(0,'rgba(255,230,140,0)');g.addColorStop(1,'rgba(255,248,210,1)');
    ctx.strokeStyle=g;ctx.lineWidth=2.6;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-46,0);ctx.lineTo(6,0);ctx.stroke();ctx.fillStyle='#ffffff';ctx.beginPath();ctx.arc(6,0,2.4,0,7);ctx.fill();},
  falcon:s=>{const a=fsAng(s),flap=Math.sin(now*28)*.9,f=Math.cos(a)<0?-1:1;ctx.scale(f,1);ctx.rotate(f<0?Math.PI-a:a);
    ctx.fillStyle='#6a4a2a';ctx.strokeStyle='#2a1a0a';ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(-2,0);ctx.quadraticCurveTo(-8,-10*flap-2,-14,-12*flap);ctx.lineTo(-6,1);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.beginPath();ctx.moveTo(-2,0);ctx.quadraticCurveTo(-8,8*flap+2,-14,10*flap);ctx.lineTo(-6,1);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.fillStyle='#8a6a3a';ctx.beginPath();ctx.ellipse(0,0,8,3.2,0,0,7);ctx.fill();ctx.stroke();ctx.fillStyle='#f0e0c0';ctx.beginPath();ctx.arc(7,-1,2.6,0,7);ctx.fill();
    ctx.fillStyle='#ffc040';ctx.beginPath();ctx.moveTo(9.5,-1);ctx.lineTo(12,0);ctx.lineTo(9.5,.6);ctx.fill();ctx.fillStyle='#ffffff';ctx.fillRect(-9,-1,3,2);}};

/* ---- impacts (on the monster, in world space like every effect) ---- */
const fsSwing=(t,col,o={})=>fxF({k:'crescent',x:t.x,y:t.y,ang:(P&&t.x<P.x)?2.4:.7,r:o.r||28,w:o.w||9,col,dur:o.dur||.24,h:fsH(t)});
const FS_HIT={
  spark:t=>{fxF({k:'flare',x:t.x,y:t.y,col:'#ffe14a',r:26,dur:.25,h:fsH(t)});
    const o=mobs.filter(m=>m!==t&&!m.dead&&Math.hypot(m.x-t.x,m.y-t.y)<130).sort((a,b)=>Math.hypot(a.x-t.x,a.y-t.y)-Math.hypot(b.x-t.x,b.y-t.y))[0];
    if(o)fxF({k:'chain',x:t.x,y:t.y,pts:[{x:t.x,y:t.y,h:fsH(t)},{x:o.x,y:o.y,h:fsH(o)}],col:'#fff3a0',dur:.22,t0:now+.04});},
  skull:t=>{fxF({k:'vortex',x:t.x,y:t.y,col:'#5a2a7a',col2:'#c890ff',r:22,imp:true,dur:.4});fxF({k:'motes',x:t.x,y:t.y,col:'#7a3aa0',col2:'#d8b0ff',n:6,r:14,dur:.5});},
  clock:t=>{fxF({k:'rune',x:t.x,y:t.y,col:'#8ff0e0',g:'⧗',r:18,dur:.55});fxF({k:'flare',x:t.x,y:t.y,col:'#8ff0e0',r:22,dur:.2,h:fsH(t)});},
  arcane:t=>{fxF({k:'flare',x:t.x,y:t.y,col:'#b8a0ff',r:26,dur:.25,h:fsH(t)});fxF({k:'motes',x:t.x,y:t.y,col:'#d8c8ff',shape:'star',n:5,r:14,dur:.45});},
  leaf:t=>fxF({k:'motes',x:t.x,y:t.y,col:'#8fd06a',col2:'#d8f0a0',shape:'leaf',n:6,r:16,dur:.5}),
  tracer:t=>{fxF({k:'flare',x:t.x,y:t.y,col:'#ffe08a',r:20,dur:.18,h:fsH(t)});fxF({k:'reticle',x:t.x,y:t.y,col:'#ffe08a',dur:.25,h:fsH(t)});},
  claw:t=>{fxF({k:'claws',x:t.x,y:t.y,ang:.5,r:26,col:'#f0ffd8',dur:.3,h:fsH(t)});fxF({k:'flare',x:t.x,y:t.y,col:'#a8e070',r:22,dur:.2,h:fsH(t)});},
  feather:t=>fxF({k:'motes',x:t.x,y:t.y,col:'#a07a4a',col2:'#f0e8d8',shape:'leaf',n:7,r:18,dur:.6}),
  // melee
  slash:col=>t=>{fsSwing(t,col);fxF({k:'motes',x:t.x,y:t.y,col,n:4,r:12,dur:.3});},
  shove:t=>{fxF({k:'flare',x:t.x,y:t.y,col:'#dfe6f0',r:30,dur:.22,h:fsH(t)*.7});fxF({k:'quake',x:t.x,y:t.y,r:30,col:'#6a7480',glow:'#c8d0dc',dur:.4});},
  chop:t=>{fxF({k:'crescent',x:t.x,y:t.y,ang:1.57,r:32,w:14,col:'#ff5a3a',dur:.22,h:fsH(t)+8});fxF({k:'quake',x:t.x,y:t.y,r:38,col:'#5a1a10',glow:'#ff7a4a',dur:.45,t0:now+.06});},
  rune:t=>{fsSwing(t,'#9fd8ff');fxF({k:'rune',x:t.x,y:t.y,col:'#9fd8ff',g:'ᚱ',r:16,dur:.5});},
  holy:t=>{fsSwing(t,'#ffe7a0');fxF({k:'rune',x:t.x,y:t.y,col:'#ffe7a0',g:'✚',r:14,dur:.45});},
  sun:t=>{fsSwing(t,'#fff6c0',{w:11});fxF({k:'flare',x:t.x,y:t.y,col:'#ffd860',r:34,dur:.25,h:fsH(t)});},
  star:t=>{fsSwing(t,'#d8c0ff');fxF({k:'motes',x:t.x,y:t.y,col:'#f0e8ff',col2:'#b8a0ff',shape:'star',n:6,r:16,dur:.5});},
  fang:t=>{fsSwing(t,'#c8b8ff',{w:6});fxF({k:'crescent',x:t.x,y:t.y,ang:-2.4,r:20,col:'#e0d8ff',dur:.16,h:fsH(t),t0:now+.07});},
  palm:t=>{for(let i=0;i<3;i++)fxF({k:'flare',x:t.x+(i-1)*7,y:t.y+(i%2?-4:3),col:'#ffcf8a',r:16,dur:.16,t0:now+i*.06,h:fsH(t)*.8});
    fxF({k:'motes',x:t.x,y:t.y,col:'#ffe0b0',n:5,r:12,dur:.35,t0:now+.12});}};

/* ---- finishers (rare, your screen): the calling's signature move; looks only ---- */
const fsBig=()=>{shakeUntil=Math.max(shakeUntil,now+.25);if(typeof hitStop==='function')hitStop(.08);};
const FS_FIN={
  warden:{n:'Shield Slam',f:t=>{fxF({k:'quake',x:t.x,y:t.y,r:80,col:'#5a3a1a',dur:.7});fxF({k:'flare',x:t.x,y:t.y,col:'#ffb070',r:50,dur:.3,h:fsH(t)});sfx('slam');}},
  bulwark:{n:'Iron Wall',f:t=>{fxF({k:'dome',x:P.x,y:P.y,o:P,col:'#c8d0dc',r:34,dur:.9});fxF({k:'quake',x:t.x,y:t.y,r:70,col:'#6a7480',glow:'#e0e8f0',dur:.6});sfx('slam');}},
  ravager:{n:'Cleaver',f:t=>{fxF({k:'crescent',x:t.x,y:t.y,ang:.7,r:40,w:16,col:'#ff4a2a',dur:.25,h:fsH(t)});fxF({k:'crescent',x:t.x,y:t.y,ang:-2.4,r:40,w:16,col:'#ff4a2a',dur:.25,h:fsH(t),t0:now+.1});
    fxF({k:'quake',x:t.x,y:t.y,r:90,col:'#4a1008',glow:'#ff6a3a',dur:.7,t0:now+.15});sfx('slam');}},
  runeguard:{n:'Rune Break',f:t=>{for(let i=0;i<3;i++)fxF({k:'rune',x:t.x+Math.cos(i*2.1)*26,y:t.y+Math.sin(i*2.1)*13,col:'#9fd8ff',g:['ᚱ','ᚦ','ᛉ'][i],r:16,dur:.7,t0:now+i*.08});
    fxF({k:'icicles',x:t.x,y:t.y,r:46,col:'#9fd8ff',n:9,dur:.7,t0:now+.25});}},
  arcanist:{n:'Arcane Burst',f:t=>{fxF({k:'flare',x:t.x,y:t.y,col:'#b8a0ff',r:90,dur:.5,h:fsH(t)});fxF({k:'rune',x:t.x,y:t.y,col:'#b8a0ff',g:'✦',r:44,dur:.9});
    fxF({k:'motes',x:t.x,y:t.y,col:'#e0d0ff',col2:'#b8a0ff',shape:'star',n:22,r:56,dur:1});}},
  stormcaller:{n:'Thunderclap',f:t=>{fxF({k:'beam',x:t.x,y:t.y,col:'#fff3a0',w:18,dur:.35});fxF({k:'flare',x:t.x,y:t.y,col:'#ffe14a',r:60,dur:.3,t0:now+.08,h:10});
    const pts=[{x:t.x,y:t.y,h:fsH(t)}];mobs.filter(m=>m!==t&&!m.dead&&Math.hypot(m.x-t.x,m.y-t.y)<160).slice(0,3).forEach(m=>pts.push({x:m.x,y:m.y,h:fsH(m)}));
    if(pts.length>1)fxF({k:'chain',x:t.x,y:t.y,pts,col:'#fff3a0',dur:.35,t0:now+.1});sfx('zap');}},
  hexweaver:{n:'Soul Rend',f:t=>{fxF({k:'vortex',x:t.x,y:t.y,col:'#3a1050',col2:'#c890ff',r:46,imp:true,dur:.8});fxF({k:'spikes',x:t.x,y:t.y,col:'#b070e0',dur:.5,h:fsH(t),t0:now+.3});}},
  chronomancer:{n:'Freeze Frame',f:t=>{if(typeof hitStop==='function')hitStop(.22);fxF({k:'rune',x:t.x,y:t.y,col:'#8ff0e0',g:'⧗',r:40,dur:1});fxF({k:'flare',x:t.x,y:t.y,col:'#ffffff',r:50,dur:.2,h:fsH(t)});}},
  ranger:{n:'Triple Shot',f:t=>{for(let i=0;i<3;i++){fxF({k:'streak',x0:P.x,y0:P.y+(i-1)*10,x:t.x,y:t.y,col:'#d0ff9a',w:7,dur:.3,t0:now+i*.08});fxF({k:'flare',x:t.x,y:t.y,col:'#b8f08a',r:30+i*8,dur:.22,t0:now+.08+i*.08,h:fsH(t)});}
    fxF({k:'motes',x:t.x,y:t.y,col:'#8fd06a',col2:'#e8ffc0',shape:'leaf',n:18,r:40,dur:.9,t0:now+.2});}},
  sharpshooter:{n:'Headshot',f:t=>{fxF({k:'reticle',x:t.x,y:t.y,col:'#ff6a4a',dur:.4,h:fsH(t)});fxF({k:'streak',x0:P.x,y0:P.y,x:t.x,y:t.y,col:'#fff2c0',w:7,dur:.2,t0:now+.12});
    fxF({k:'flare',x:t.x,y:t.y,col:'#ffe08a',r:46,dur:.3,t0:now+.18,h:fsH(t)});}},
  wildstalker:{n:'Pounce',f:t=>{fxF({k:'streak',x0:P.x,y0:P.y,x:t.x,y:t.y,col:'#a8e070',w:12,dur:.2});
    for(let i=0;i<3;i++)fxF({k:'claws',x:t.x,y:t.y,ang:[.5,-2.6,2][i],r:46,col:'#c8ff80',dur:.35,h:fsH(t),t0:now+.08+i*.1});
    fxF({k:'stampede',x:t.x,y:t.y,r:70,col:'#c8b080',dur:.7,t0:now+.1});}},
  falconer:{n:'Falcon Dive',f:t=>{fxF({k:'meteor',x:t.x,y:t.y,col:'#e8c08a',size:12,r:60,dur:.6});fxF({k:'motes',x:t.x,y:t.y,col:'#a07a4a',col2:'#f0e8d8',shape:'leaf',n:14,r:34,dur:.9,t0:now+.33});}},
  shade:{n:'Shadow Flurry',f:t=>{for(let i=0;i<4;i++)fxF({k:'crescent',x:t.x+(i%2?6:-6),y:t.y,ang:[.7,-2.4,2.2,-.9][i],r:30,col:i%2?'#c8b8ff':'#8f7ad8',dur:.2,h:fsH(t),t0:now+i*.07});
    fxF({k:'motes',x:t.x,y:t.y,col:'#6a5a9a',col2:'#c8b8ff',n:14,r:30,dur:.7,t0:now+.25});}},
  cleric:{n:'Light of Judgment',f:t=>{fxF({k:'beam',x:t.x,y:t.y,col:'#fff0a0',w:24,dur:.5});fxF({k:'rune',x:t.x,y:t.y,col:'#ffe27a',g:'✚',r:28,dur:.7});}},
  templar:{n:'Sunburst',f:t=>{fxF({k:'beam',x:t.x,y:t.y,col:'#ffd860',w:30,sun:true,dur:.6});fxF({k:'flare',x:t.x,y:t.y,col:'#ffd860',r:70,dur:.35,t0:now+.25,h:10});sfx('slam');}},
  oracle:{n:'Starfall',f:t=>{for(let i=0;i<3;i++)fxF({k:'meteor',x:t.x+(i-1)*30,y:t.y+(i%2)*10,col:'#d8c0ff',size:8,r:44,dur:.65,t0:now+i*.12});fxF({k:'motes',x:t.x,y:t.y,col:'#ffffff',col2:'#d8c0ff',shape:'star',n:14,r:36,dur:.9,t0:now+.36});}},
  ascetic:{n:'Hundred Fists',f:t=>{for(let i=0;i<fxN(14);i++)fxF({k:'flare',x:t.x+(Math.random()-.5)*40,y:t.y+(Math.random()-.5)*18,col:i%2?'#ffcf8a':'#ffffff',r:24,dur:.16,t0:now+i*.035,h:fsH(t)*.8});
    fxF({k:'flare',x:t.x,y:t.y,col:'#ff9a5a',r:70,dur:.35,t0:now+.5,h:fsH(t)});fxF({k:'motes',x:t.x,y:t.y,col:'#ffb0c8',col2:'#ffe0b0',shape:'petal',n:20,r:46,dur:1,t0:now+.5});}}};

/* ---- casting circles: same ring as before, plus the calling's own decoration ---- */
function fsCastDeco(p,kind,col){const t=now,R=18+Math.sin(now*6)*1.2,cx=p.x,cy=p.y,pt=(a,k=1.38)=>[cx+Math.cos(a)*R*k,cy+Math.sin(a)*R*k*.5];
  ctx.fillStyle=col;ctx.strokeStyle=col;ctx.lineWidth=1.4;
  if(kind==='shield'){for(let k=0;k<4;k++){const a=t*1.2+k*1.571,[x,y]=pt(a);ctx.beginPath();ctx.moveTo(x,y-5);ctx.lineTo(x+4,y-3);ctx.lineTo(x+3.4,y+2);ctx.lineTo(x,y+4.5);ctx.lineTo(x-3.4,y+2);ctx.lineTo(x-4,y-3);ctx.closePath();ctx.fill();}}
  else if(kind==='flame'){for(let k=0;k<10;k++){const a=k*.628+t*.6,[x,y]=pt(a,1.6),h=5+Math.sin(t*14+k*2)*3;ctx.beginPath();ctx.moveTo(x-2.5,y);ctx.quadraticCurveTo(x,y-h*1.6,x+2.5,y);ctx.fill();}}
  else if(kind==='stones'){ctx.font='700 9px sans-serif';ctx.textAlign='center';for(let k=0;k<4;k++){const a=t*1.4+k*1.571,[x,y]=pt(a,1.5),bob=Math.sin(t*4+k)*3;
    ctx.save();ctx.translate(x,y-12+bob);ctx.rotate(.3*Math.sin(t+k));ctx.fillStyle='#3a4658';ctx.fillRect(-4.5,-5.5,9,11);ctx.fillStyle=col;ctx.fillText('ᚱᚦᛉᛟ'[k],0,3.5);ctx.restore();}}
  else if(kind==='sparks'){ctx.lineWidth=1.3;for(let k=0;k<4;k++){const a=k*1.571+((t*7)|0)*.4,[x,y]=pt(a,1.5);ctx.beginPath();ctx.moveTo(x,y-9);ctx.lineTo(x+(Math.random()-.5)*6,y-4);ctx.lineTo(x+(Math.random()-.5)*6,y);ctx.stroke();}}
  else if(kind==='eyes'){for(let k=0;k<3;k++){const a=t*.5+k*2.094,[x,y]=pt(a,1.45),open=Math.max(.1,Math.abs(Math.sin(t*1.7+k*1.3)));
    ctx.fillStyle='#e8d0ff';ctx.beginPath();ctx.ellipse(x,y-4,5,2.6*open,0,0,7);ctx.fill();ctx.fillStyle='#4a1060';ctx.beginPath();ctx.arc(x,y-4,1.6*open+.4,0,7);ctx.fill();}}
  else if(kind==='clock'){ctx.beginPath();for(let k=0;k<12;k++){const a=k*.5236,[x1,y1]=pt(a,1.15),[x2,y2]=pt(a,k%3?1.3:1.42);ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);}ctx.stroke();
    ctx.lineWidth=2;ctx.beginPath();const [hx,hy]=pt(t*3,1.0),[mx,my]=pt(-t*.8,.7);ctx.moveTo(cx,cy);ctx.lineTo(hx,hy);ctx.moveTo(cx,cy);ctx.lineTo(mx,my);ctx.stroke();}
  else if(kind==='leaf'){for(let k=0;k<6;k++){const a=t*1.1+k*1.047,[x,y]=pt(a,1.45);ctx.save();ctx.translate(x,y-3);ctx.rotate(a+1.2);ctx.beginPath();ctx.ellipse(0,0,4.5,1.8,0,0,7);ctx.fill();ctx.restore();}}
  else if(kind==='reticle'){ctx.beginPath();const r1=R*1.7;ctx.moveTo(cx-r1,cy);ctx.lineTo(cx-r1*.45,cy);ctx.moveTo(cx+r1*.45,cy);ctx.lineTo(cx+r1,cy);ctx.moveTo(cx,cy-r1*.5);ctx.lineTo(cx,cy-r1*.22);ctx.moveTo(cx,cy+r1*.22);ctx.lineTo(cx,cy+r1*.5);ctx.stroke();
    ctx.beginPath();ctx.ellipse(cx,cy,3,1.5,0,0,7);ctx.fill();}
  else if(kind==='paws'){for(let k=0;k<5;k++){const a=t*.9+k*1.257,[x,y]=pt(a,1.45),al=.4+.6*((Math.sin(t*3-k)+1)/2);ctx.globalAlpha=.85*al;
    ctx.beginPath();ctx.ellipse(x,y,2.6,1.6,0,0,7);ctx.fill();for(let j=-1;j<=1;j++){ctx.beginPath();ctx.arc(x+j*2.4,y-2.6,1,0,7);ctx.fill();}}ctx.globalAlpha=.85;}
  else if(kind==='feathers'){ctx.lineWidth=1.2;for(let k=0;k<5;k++){const a=t*2+k*1.257,[x,y]=pt(a,1.3+.25*Math.sin(t*2+k));const rise=((t*.8+k*.2)%1)*16;
    ctx.save();ctx.translate(x,y-rise);ctx.rotate(a);ctx.beginPath();ctx.moveTo(-5,0);ctx.lineTo(5,0);for(let j=-3;j<=3;j+=2){ctx.moveTo(j,0);ctx.lineTo(j-2,-2.2);ctx.moveTo(j,0);ctx.lineTo(j-2,2.2);}ctx.stroke();ctx.restore();}}
  else if(kind==='cross'){ctx.lineWidth=2;for(let k=0;k<4;k++){const a=t+k*1.571,[x,y]=pt(a,1.4);ctx.beginPath();ctx.moveTo(x,y-7);ctx.lineTo(x,y+1);ctx.moveTo(x-3,y-4);ctx.lineTo(x+3,y-4);ctx.stroke();}}
  else if(kind==='sun'){ctx.lineWidth=1.6;ctx.beginPath();for(let k=0;k<12;k++){const a=k*.5236+t*.5,l=1.55+.15*Math.sin(t*8+k),[x1,y1]=pt(a,1.2),[x2,y2]=pt(a,l);ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);}ctx.stroke();}
  else if(kind==='stars'){const s=[];for(let k=0;k<5;k++){const a=k*1.257+t*.3;s.push(pt(a,1.2+(k%2)*.3));}ctx.globalAlpha=.5;ctx.beginPath();s.forEach(([x,y],k)=>k?ctx.lineTo(x,y-6):ctx.moveTo(x,y-6));ctx.closePath();ctx.stroke();ctx.globalAlpha=.9;
    s.forEach(([x,y],k)=>{const tw=1.6+Math.sin(t*6+k*2);ctx.beginPath();ctx.arc(x,y-6,Math.max(.6,tw),0,7);ctx.fill();});}
  else if(kind==='lotus'){const open=.5+.5*Math.sin(t*2);for(let k=0;k<8;k++){const a=k*.785,[x,y]=pt(a,.9+open*.5);ctx.save();ctx.translate(x,y);ctx.rotate(a);ctx.globalAlpha=.75;ctx.beginPath();ctx.ellipse(3,0,6,2.6,0,0,7);ctx.fill();ctx.restore();}ctx.globalAlpha=.85;}}

/* ---- the table: 4 first callings and 12 advanced callings (master callings borrow their advanced calling's) ---- */
const FS_STYLES={
  warden:{cast:['shield','#ffb070'],melee:FS_HIT.slash('#ffb070'),fin:FS_FIN.warden},
  bulwark:{cast:['shield','#c8d0dc'],melee:FS_HIT.shove,fin:FS_FIN.bulwark},
  ravager:{cast:['flame','#ff6a3a'],melee:FS_HIT.chop,fin:FS_FIN.ravager},
  runeguard:{cast:['stones','#9fd8ff'],melee:FS_HIT.rune,fin:FS_FIN.runeguard},
  arcanist:{cast:['runes','#b8a0ff'],shot:FS_SHOT.orb('#b8a0ff','#e0d0ff'),hit:FS_HIT.arcane,fin:FS_FIN.arcanist},
  stormcaller:{cast:['sparks','#fff3a0'],shot:FS_SHOT.spark,hit:FS_HIT.spark,fin:FS_FIN.stormcaller},
  hexweaver:{cast:['eyes','#a070d0'],shot:FS_SHOT.skull,hit:FS_HIT.skull,fin:FS_FIN.hexweaver},
  chronomancer:{cast:['clock','#8ff0e0'],shot:FS_SHOT.clock,hit:FS_HIT.clock,fin:FS_FIN.chronomancer},
  ranger:{cast:['leaf','#9fe0a0'],shot:FS_SHOT.arrow('#e8dcb0','#9fe0a0'),hit:FS_HIT.leaf,fin:FS_FIN.ranger},
  sharpshooter:{cast:['reticle','#ffe08a'],shot:FS_SHOT.tracer,spd:980,hit:FS_HIT.tracer,fin:FS_FIN.sharpshooter},
  wildstalker:{cast:['paws','#a8e070'],shot:FS_SHOT.arrow('#d8c8a0','#7ac850'),hit:FS_HIT.claw,fin:FS_FIN.wildstalker},
  falconer:{cast:['feathers','#d8b888'],shot:FS_SHOT.falcon,spd:520,hit:FS_HIT.feather,fin:FS_FIN.falconer},
  shade:{cast:['eyes','#b8a8e8'],melee:FS_HIT.fang,fin:FS_FIN.shade},
  cleric:{cast:['cross','#ffe7a0'],melee:FS_HIT.holy,fin:FS_FIN.cleric},
  templar:{cast:['sun','#ffd860'],melee:FS_HIT.sun,fin:FS_FIN.templar},
  oracle:{cast:['stars','#d8c0ff'],melee:FS_HIT.star,fin:FS_FIN.oracle},
  ascetic:{cast:['lotus','#ffb0c8'],melee:FS_HIT.palm,fin:FS_FIN.ascetic}};
// melee callings that pick up a bow or wand still get a matching shot, and archers in melee a matching slash
for(const [id,st] of Object.entries(FS_STYLES)){if(!st.melee)st.melee=FS_HIT.slash(st.cast[1]);}
function fsStyle(cls){if(!cls)return null;if(FS_STYLES[cls])return FS_STYLES[cls];
  const j3=typeof JOB3!=='undefined'&&JOB3[cls];if(j3&&FS_STYLES[j3.from])return FS_STYLES[j3.from];
  const b=typeof baseOf==='function'?baseOf(cls):null;return b&&FS_STYLES[b]||null;}
const fsLite=()=>!!window.LITE;

/* ---- hooks: your basic attack, other players' attacks, casting circles, finishers ---- */
// a shot fired by your basic attack (or shown for another player) takes the style's look and impact
{const _shF=shoot;shoot=function(from,to,kind,col,onHit,hostile){
  let st=null,mine=false;
  if(FSTY.other&&from&&from!==P)st=FSTY.other;
  else if(from===P&&(kind==='orb'||kind==='arrow')){
    if(FSTY.me)mine=true;else if(kind==='arrow'&&FSTY.bow&&FSTY.bow.t===to&&now<=FSTY.bow.until){mine=true;FSTY.bow=null;}
    if(mine)st=fsStyle(P.cls);}
  if(st&&typeof onHit==='function'){const cb=onHit,hit=st.hit;onHit=function(){if(mine)FSTY.basic++;try{return cb.apply(this,arguments);}finally{if(mine)FSTY.basic--;try{if(hit&&to)hit(to);}catch(e){}}};}
  const r=_shF.call(this,from,to,kind,col,onHit,hostile);
  if(st&&st.shot){const s=shots[shots.length-1];if(s&&s.to===to){s.draw=st.shot;if(st.spd)s.spd=st.spd;}}
  return r;};}
{const _baF=basicAttack;basicAttack=function(t){const was=FSTY.me;FSTY.me=true;
  try{return _baF.apply(this,arguments);}finally{FSTY.me=was;if(P&&P.bowT===now)FSTY.bow={t,until:now+1.2};}};}
// melee: the plain slash gives way to the calling's own impact
const fsSwapSlash=(t,st)=>{if(!st||!st.melee||!t)return;let found=false;for(let i=fx.length-1;i>=0&&i>=fx.length-16;i--){const f=fx[i];if(f.k==='slash'&&f.t0===now){fx.splice(i,1);found=true;break;}}
  if(found)try{st.melee(t);}catch(e){}};
{const _miF=meleeImpact;meleeImpact=function(force){const h=P&&P.meleeHit;FSTY.basic++;let r;try{r=_miF.apply(this,arguments);}finally{FSTY.basic--;}
  if(h&&P.meleeHit!==h&&h.t)fsSwapSlash(h.t,fsStyle(P.cls));return r;};}
{const _ohF=otherHitFx;otherHitFx=function(o,m){const st=fsStyle(o&&o.cls);const was=FSTY.other;FSTY.other=st;let r;try{r=_ohF.apply(this,arguments);}finally{FSTY.other=was;}
  try{if(st&&m){const ox=o.rx!==undefined?o.rx:o.x,oy=o.ry!==undefined?o.ry:o.y;const far=Math.hypot(m.x-ox,m.y-oy)>m.d.size+PR+60;if(!far)fsSwapSlash(m,st);}}catch(e){}return r;};}
// a critical hit or killing blow from your basic attack: now and then, the signature finisher
{const _hmF=hurtMob;hurtMob=function(m,dmg,crit){const go=FSTY.basic>0&&m&&!m.dead&&!m.dying&&dmg>0&&(crit||m.hp-dmg<=0)&&now>=FSTY.finT&&Math.random()<FSTY_CHANCE;
  const r=_hmF.apply(this,arguments);if(go)fsFinisher(m);return r;};}
function fsFinisher(m){const st=fsStyle(P&&P.cls);if(!st||!st.fin)return;FSTY.finT=now+FSTY_CD;const col=st.cast[1];
  try{st.fin.f(m);}catch(e){}fsBig();
  // every finisher: two shockwave rings in the calling's colour and a flash on the hero
  fx.push({k:'ring',x:m.x,y:m.y,r:70,col,t0:now,dur:.45});fx.push({k:'ring',x:m.x,y:m.y,r:110,col,t0:now+.1,dur:.5});
  fxF({k:'flare',x:P.x,y:P.y,col,r:34,dur:.3,h:22});
  floatT(P.x,P.y-70,st.fin.n+'!','#ffe27a',20);}
// casting circles
// the same turning ring as before (js/anim.js), in the calling's colour, plus its decoration
{const _ccF=castCircle;castCircle=function(p){const st=fsStyle(p&&p.cls);if(!st||!st.cast)return _ccF.apply(this,arguments);
  const col=st.cast[1],t=now*1.6,r=18+Math.sin(now*6)*1.2;ctx.save();ctx.globalAlpha=.85;ctx.strokeStyle=col;ctx.lineWidth=1.6;if(!fsLite()){ctx.shadowColor=col;ctx.shadowBlur=8;}
  ctx.beginPath();ctx.ellipse(p.x,p.y,r*1.6,r*.8,0,0,7);ctx.stroke();ctx.beginPath();ctx.ellipse(p.x,p.y,r*1.15,r*.58,0,0,7);ctx.stroke();ctx.shadowBlur=0;
  ctx.fillStyle=col;if(st.cast[0]==='runes')for(let k=0;k<6;k++){const a=t+k*Math.PI/3;ctx.fillRect(p.x+Math.cos(a)*r*1.38-1.5,p.y+Math.sin(a)*r*.69-1.5,3,3);}
  for(let k=0;k<4;k++){const ph=(now*.9+k*.25)%1,a=k*1.7+now;ctx.globalAlpha=(1-ph)*.8;ctx.beginPath();ctx.arc(p.x+Math.cos(a)*r,p.y-ph*34,1.6,0,7);ctx.fill();}
  ctx.globalAlpha=.85;try{if(st.cast[0]!=='runes')fsCastDeco(p,st.cast[0],col);}catch(e){}ctx.restore();};}

if(typeof TH!=='undefined'){for(const [n,th] of [['Shield Slam','ทุบโล่'],['Shadow Flurry','พายุเงา'],['Iron Wall','กำแพงเหล็ก'],['Cleaver','ฟันสะบั้น'],['Rune Break','อักขระแตก'],['Arcane Burst','ระเบิดเวท'],['Thunderclap','ฟ้าผ่า'],
  ['Soul Rend','ฉีกวิญญาณ'],['Freeze Frame','หยุดกาลเวลา'],['Triple Shot','ยิงสามดอก'],['Headshot','ยิงกลางหัว'],['Pounce','ตะครุบ'],['Falcon Dive','เหยี่ยวโฉบ'],['Light of Judgment','แสงพิพากษา'],
  ['Sunburst','สุริยะระเบิด'],['Starfall','ดาวตก'],['Hundred Fists','ร้อยหมัด']])TH[n+'!']=th+'!';}
