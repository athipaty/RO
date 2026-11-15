"use strict";
/* ================= fighting styles, step 2: the 12 master callings =================
   Each master calling fights like a stronger version of its advanced calling, with its own projectile or impact, an
   outer second ring on its cast circle (turning the other way, with its own marks), and its own, bigger finisher.
   Looks only, like js/fightstyle.js (loaded right before this file). */

/* ---- master projectiles ---- */
Object.assign(FS_SHOT,{
  bigspark:s=>{ctx.save();ctx.scale(1.35,1.35);FS_SHOT.spark(s);ctx.restore();ctx.fillStyle=rgba('#ffffff',.6);ctx.beginPath();ctx.arc(0,0,3,0,7);ctx.fill();},
  void:s=>{const a=fsAng(s);for(let i=1;i<=5;i++){ctx.fillStyle=rgba('#2a0a3a',.55-i*.08);ctx.beginPath();ctx.arc(-Math.cos(a)*i*6,-Math.sin(a)*i*6,8-i,0,7);ctx.fill();}
    ctx.strokeStyle=rgba('#c890ff',.9);ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(0,0,11,5,now*6,0,7);ctx.stroke();
    ctx.fillStyle='#08020c';ctx.beginPath();ctx.arc(0,0,6.5,0,7);ctx.fill();ctx.strokeStyle='#e0b0ff';ctx.lineWidth=1;ctx.stroke();},
  goldclock:s=>{ctx.save();ctx.scale(1.25,1.25);ctx.strokeStyle='#ffe08a';ctx.lineWidth=1.6;ctx.fillStyle=rgba('#3a2a08',.6);ctx.beginPath();ctx.arc(0,0,8,0,7);ctx.fill();ctx.stroke();
    for(let i=0;i<12;i++){const an=i*.5236,r1=i%3?6.6:5.4;ctx.beginPath();ctx.moveTo(Math.cos(an)*r1,Math.sin(an)*r1);ctx.lineTo(Math.cos(an)*8,Math.sin(an)*8);ctx.stroke();}
    ctx.strokeStyle='#ffffff';ctx.lineWidth=1.8;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(Math.cos(-now*14)*6,Math.sin(-now*14)*6);ctx.moveTo(0,0);ctx.lineTo(Math.cos(-now*3)*4,Math.sin(-now*3)*4);ctx.stroke();ctx.restore();
    const a=fsAng(s);ctx.strokeStyle=rgba('#ffe08a',.45);ctx.lineWidth=1.2;for(let i=1;i<=2;i++){ctx.beginPath();ctx.arc(-Math.cos(a)*i*11,-Math.sin(a)*i*11,9-i*2,0,7);ctx.stroke();}},
  redtracer:s=>{const a=fsAng(s);ctx.rotate(a);const g=ctx.createLinearGradient(-60,0,8,0);g.addColorStop(0,'rgba(255,80,60,0)');g.addColorStop(1,'rgba(255,220,200,1)');
    ctx.strokeStyle=g;ctx.lineWidth=3.4;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-60,0);ctx.lineTo(8,0);ctx.stroke();ctx.fillStyle='#ffffff';ctx.beginPath();ctx.arc(8,0,3,0,7);ctx.fill();
    ctx.strokeStyle=rgba('#ff5a3a',.7);ctx.lineWidth=1;ctx.beginPath();ctx.arc(8,0,6+Math.sin(now*30)*1.5,0,7);ctx.stroke();},
  wolfarrow:s=>{FS_SHOT.arrow('#e8dcb0','#c8ff80')(s);const a=fsAng(s);ctx.rotate(-a);ctx.fillStyle=rgba('#c8ff80',.55);
    for(let i=1;i<=3;i++){const d=i*9;ctx.beginPath();ctx.arc(-Math.cos(a)*d+Math.sin(now*18+i)*3,-Math.sin(a)*d,2.4,0,7);ctx.fill();}},
  skyfalcon:s=>{const a=fsAng(s);ctx.save();ctx.scale(1.3,1.3);{const flap=Math.sin(now*28)*.9,f=Math.cos(a)<0?-1:1;ctx.scale(f,1);ctx.rotate(f<0?Math.PI-a:a);
      ctx.fillStyle='#e8eef8';ctx.strokeStyle='#5a6a80';ctx.lineWidth=1;
      ctx.beginPath();ctx.moveTo(-2,0);ctx.quadraticCurveTo(-8,-10*flap-2,-14,-12*flap);ctx.lineTo(-6,1);ctx.closePath();ctx.fill();ctx.stroke();
      ctx.beginPath();ctx.moveTo(-2,0);ctx.quadraticCurveTo(-8,8*flap+2,-14,10*flap);ctx.lineTo(-6,1);ctx.closePath();ctx.fill();ctx.stroke();
      ctx.fillStyle='#ffffff';ctx.beginPath();ctx.ellipse(0,0,8,3.2,0,0,7);ctx.fill();ctx.stroke();ctx.beginPath();ctx.arc(7,-1,2.6,0,7);ctx.fill();
      ctx.fillStyle='#ffc040';ctx.beginPath();ctx.moveTo(9.5,-1);ctx.lineTo(12,0);ctx.lineTo(9.5,.6);ctx.fill();}ctx.restore();const g=ctx.createLinearGradient(-Math.cos(a)*36,-Math.sin(a)*36,0,0);g.addColorStop(0,'rgba(200,230,255,0)');g.addColorStop(1,'rgba(220,240,255,.7)');
    ctx.strokeStyle=g;ctx.lineWidth=5;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-Math.cos(a)*36,-Math.sin(a)*36);ctx.lineTo(-Math.cos(a)*8,-Math.sin(a)*8);ctx.stroke();}});

/* ---- master impacts ---- */
Object.assign(FS_HIT,{
  bigspark:t=>{fxF({k:'flare',x:t.x,y:t.y,col:'#fff3a0',r:32,dur:.25,h:fsH(t)});
    const pts=[{x:t.x,y:t.y,h:fsH(t)}];mobs.filter(m=>m!==t&&!m.dead&&Math.hypot(m.x-t.x,m.y-t.y)<150).slice(0,2).forEach(m=>pts.push({x:m.x,y:m.y,h:fsH(m)}));
    if(pts.length>1)fxF({k:'chain',x:t.x,y:t.y,pts,col:'#fff3a0',dur:.25,t0:now+.04});},
  void:t=>{fxF({k:'vortex',x:t.x,y:t.y,col:'#14041c',col2:'#c890ff',r:30,imp:true,dur:.45});fxF({k:'spikes',x:t.x,y:t.y,col:'#9050c0',dur:.35,h:fsH(t)});},
  goldclock:t=>{fxF({k:'rune',x:t.x,y:t.y,col:'#ffe08a',g:'⧗',r:22,dur:.6});fxF({k:'flare',x:t.x,y:t.y,col:'#ffe08a',r:24,dur:.18,h:fsH(t)});
    fxF({k:'flare',x:t.x,y:t.y,col:'#ffe08a',r:18,dur:.18,t0:now+.25,h:fsH(t)});},
  redtracer:t=>{fxF({k:'reticle',x:t.x,y:t.y,col:'#ff6a4a',dur:.25,h:fsH(t)});fxF({k:'flare',x:t.x,y:t.y,col:'#ff8a6a',r:26,dur:.2,h:fsH(t)});},
  wolf:t=>{fxF({k:'claws',x:t.x,y:t.y,ang:.5,r:28,col:'#f0ffd8',dur:.3,h:fsH(t)});fxF({k:'claws',x:t.x,y:t.y,ang:-2.6,r:24,col:'#c8ff80',dur:.3,h:fsH(t),t0:now+.07});},
  sky:t=>{fxF({k:'streak',x0:t.x+40,y0:t.y-160,x:t.x,y:t.y,col:'#dff0ff',w:5,dur:.18});fxF({k:'motes',x:t.x,y:t.y,col:'#ffffff',col2:'#c8e0ff',shape:'leaf',n:8,r:20,dur:.6,t0:now+.1});},
  aegis:t=>{FS_HIT.shove(t);fx.push({k:'ring',x:t.x,y:t.y,r:34,col:'#ffd76a',t0:now,dur:.3});},
  war:t=>{FS_HIT.chop(t);fxF({k:'motes',x:t.x,y:t.y,col:'#ff6a3a',col2:'#ffd0a0',n:8,r:22,dur:.6,t0:now+.08});},
  runelord:t=>{fsSwing(t,'#7fe0ff',{w:11});for(let i=0;i<2;i++)fxF({k:'rune',x:t.x+(i?16:-16),y:t.y+(i?4:-4),col:'#7fe0ff',g:i?'ᛉ':'ᚱ',r:13,dur:.55,t0:now+i*.06});},
  dawn:t=>{FS_HIT.sun(t);fxF({k:'beam',x:t.x,y:t.y,col:'#fff0b0',w:10,dur:.25});},
  starseer:t=>{FS_HIT.star(t);fxF({k:'flare',x:t.x,y:t.y,col:'#e8d8ff',r:22,dur:.2,h:fsH(t)});},
  lotus:t=>{FS_HIT.palm(t);fxF({k:'motes',x:t.x,y:t.y,col:'#ffb0c8',col2:'#ffffff',shape:'petal',n:6,r:18,dur:.6,t0:now+.12});}});

/* ---- master finishers ---- */
const fsAround=(t,r,n)=>mobs.filter(m=>m!==t&&!m.dead&&Math.hypot(m.x-t.x,m.y-t.y)<r).slice(0,n);
Object.assign(FS_FIN,{
  aegislord:{n:'Bastion Quake',f:t=>{fxF({k:'dome',x:P.x,y:P.y,o:P,col:'#ffd76a',r:40,dur:1});fxF({k:'quake',x:t.x,y:t.y,r:120,col:'#4a5260',glow:'#ffd76a',dur:.8});
    fxF({k:'icicles',x:t.x,y:t.y,r:70,col:'#aab4c4',n:12,dur:.8,t0:now+.15});sfx('slam');}},
  warbringer:{n:'Warpath',f:t=>{for(let i=0;i<3;i++)fxF({k:'crescent',x:t.x,y:t.y,ang:[.7,-2.4,1.57][i],r:46,w:18,col:'#ff4a2a',dur:.25,h:fsH(t),t0:now+i*.09});
    fxF({k:'quake',x:t.x,y:t.y,r:130,col:'#3a0a04',glow:'#ff6a3a',dur:.8,t0:now+.25});fxF({k:'motes',x:t.x,y:t.y,col:'#ff6a3a',col2:'#ffd0a0',n:24,r:70,dur:1,t0:now+.25});sfx('slam');}},
  tempestsage:{n:'Tempest Crown',f:t=>{const all=[t,...fsAround(t,200,3)];all.forEach((m,i)=>{fxF({k:'beam',x:m.x,y:m.y,col:'#fff3a0',w:22,dur:.65,t0:now+i*.1});fxF({k:'flare',x:m.x,y:m.y,col:'#ffe14a',r:40,dur:.3,t0:now+.1+i*.1,h:10});});
    if(all.length>1)fxF({k:'chain',x:t.x,y:t.y,pts:all.map(m=>({x:m.x,y:m.y,h:fsH(m)})),col:'#ffffff',dur:.45,t0:now+.1});fxF({k:'flare',x:t.x,y:t.y,col:'#ffe14a',r:80,dur:.35,t0:now+.1,h:10});sfx('zap');}},
  voidcaller:{n:'Event Horizon',f:t=>{fxF({k:'vortex',x:t.x,y:t.y,col:'#08020c',col2:'#c890ff',r:80,imp:true,dur:1});fxF({k:'flare',x:t.x,y:t.y,col:'#5a1a8a',r:90,dur:.5,t0:now+.6,h:10});
    fxF({k:'spikes',x:t.x,y:t.y,col:'#c890ff',dur:.5,h:fsH(t),t0:now+.5});}},
  deadeye:{n:'Final Shot',f:t=>{if(typeof hitStop==='function')hitStop(.18);fxF({k:'reticle',x:t.x,y:t.y,col:'#ff3a2a',dur:.5,h:fsH(t)});
    fxF({k:'streak',x0:P.x,y0:P.y,x:t.x,y:t.y,col:'#ffffff',w:12,dur:.25,t0:now+.15});fxF({k:'flare',x:t.x,y:t.y,col:'#ff5a3a',r:80,dur:.35,t0:now+.22,h:fsH(t)});}},
  beastlord:{n:'Wild Hunt',f:t=>{fxF({k:'stampede',x:t.x,y:t.y,r:120,col:'#c8b080',dur:.9});for(let i=0;i<4;i++)fxF({k:'claws',x:t.x+(i-1.5)*14,y:t.y,ang:[.5,-2.6,2,-1][i],r:44,col:'#c8ff80',dur:.35,h:fsH(t),t0:now+.1+i*.08});}},
  dawnknight:{n:'Dawn Break',f:t=>{fxF({k:'beam',x:t.x,y:t.y,col:'#ffe27a',w:44,sun:true,dur:.7});fxF({k:'halo',x:P.x,y:P.y,o:P,col:'#ffe27a',dur:1.2});
    fxF({k:'flare',x:t.x,y:t.y,col:'#fff0b0',r:100,dur:.4,t0:now+.3,h:10});sfx('slam');}},
  starseer:{n:'Constellation Fall',f:t=>{const pts=[t,...fsAround(t,180,4)];for(let i=0;i<5;i++){const m=pts[i%pts.length];fxF({k:'meteor',x:m.x+(i>=pts.length?(i-2)*24:0),y:m.y,col:'#d8c0ff',size:8,r:46,dur:.65,t0:now+i*.1});}
    fxF({k:'motes',x:t.x,y:t.y,col:'#ffffff',col2:'#d8c0ff',shape:'star',n:24,r:70,dur:1,t0:now+.4});}},
  runelord:{n:'World Rune',f:t=>{fxF({k:'rune',x:t.x,y:t.y,col:'#7fe0ff',g:'ᛟ',r:76,dur:1.1});fxF({k:'icicles',x:t.x,y:t.y,r:90,col:'#9fe8ff',n:16,tall:1.4,dur:.9,t0:now+.3});
    for(let i=0;i<4;i++)fxF({k:'rune',x:t.x+Math.cos(i*1.57)*70,y:t.y+Math.sin(i*1.57)*35,col:'#7fe0ff',g:['ᚱ','ᚦ','ᛉ','ᛗ'][i],r:16,dur:.8,t0:now+i*.06});}},
  timeweaver:{n:'Rewind',f:t=>{if(typeof hitStop==='function')hitStop(.25);fxF({k:'rune',x:t.x,y:t.y,col:'#ffe08a',g:'⧗',r:64,dur:1.1});
    for(let i=0;i<3;i++)fxF({k:'flare',x:t.x,y:t.y,col:'#ffe08a',r:60-i*16,dur:.25,t0:now+.15+i*.15,h:fsH(t)});fxF({k:'vortex',x:t.x,y:t.y,col:'#8a6a20',col2:'#ffe08a',r:50,dur:.8});}},
  skywarden:{n:'Sky Sovereign',f:t=>{const all=[t,...fsAround(t,180,2)];all.forEach((m,i)=>fxF({k:'meteor',x:m.x,y:m.y,col:'#e8f4ff',size:11,r:56,dur:.6,t0:now+i*.12}));
    fxF({k:'motes',x:t.x,y:t.y,col:'#ffffff',col2:'#c8e0ff',shape:'leaf',n:24,r:70,dur:1.1,t0:now+.35});}},
  lotussage:{n:'Thousand Petals',f:t=>{for(let i=0;i<fxN(12);i++)fxF({k:'flare',x:t.x+(Math.random()-.5)*50,y:t.y+(Math.random()-.5)*22,col:i%2?'#ffb0c8':'#ffffff',r:24,dur:.15,t0:now+i*.03,h:fsH(t)*.8});
    fxF({k:'rune',x:t.x,y:t.y,col:'#ffb0c8',g:'❀',r:60,dur:1.1,t0:now+.3});fxF({k:'motes',x:t.x,y:t.y,col:'#ffb0c8',col2:'#ffffff',shape:'petal',n:30,r:80,dur:1.2,t0:now+.35});}}});

/* ---- the 12 master callings: a cast decoration (from step 1) in their own colour, an outer ring mark, and the rest ---- */
Object.assign(FS_STYLES,{
  aegislord:{cast:['shield','#ffd76a'],ring:'crest',melee:FS_HIT.aegis,fin:FS_FIN.aegislord},
  warbringer:{cast:['flame','#ff3a1a'],ring:'spike',melee:FS_HIT.war,fin:FS_FIN.warbringer},
  runelord:{cast:['stones','#7fe0ff'],ring:'glyph',melee:FS_HIT.runelord,fin:FS_FIN.runelord},
  tempestsage:{cast:['sparks','#ffffff'],ring:'bolt',shot:FS_SHOT.bigspark,hit:FS_HIT.bigspark,fin:FS_FIN.tempestsage},
  voidcaller:{cast:['eyes','#7a3ab0'],ring:'dark',shot:FS_SHOT.void,hit:FS_HIT.void,fin:FS_FIN.voidcaller},
  timeweaver:{cast:['clock','#ffe08a'],ring:'tick',shot:FS_SHOT.goldclock,hit:FS_HIT.goldclock,fin:FS_FIN.timeweaver},
  deadeye:{cast:['reticle','#ff6a4a'],ring:'tick',shot:FS_SHOT.redtracer,spd:1100,hit:FS_HIT.redtracer,fin:FS_FIN.deadeye},
  beastlord:{cast:['paws','#c8ff80'],ring:'fang',shot:FS_SHOT.wolfarrow,hit:FS_HIT.wolf,fin:FS_FIN.beastlord},
  skywarden:{cast:['feathers','#dff0ff'],ring:'wing',shot:FS_SHOT.skyfalcon,spd:560,hit:FS_HIT.sky,fin:FS_FIN.skywarden},
  dawnknight:{cast:['sun','#ffe27a'],ring:'ray',melee:FS_HIT.dawn,fin:FS_FIN.dawnknight},
  starseer:{cast:['stars','#e8d8ff'],ring:'star',melee:FS_HIT.starseer,fin:FS_FIN.starseer},
  lotussage:{cast:['lotus','#ffd0e0'],ring:'petal',melee:FS_HIT.lotus,fin:FS_FIN.lotussage}});
for(const st of Object.values(FS_STYLES))if(!st.melee)st.melee=FS_HIT.slash(st.cast[1]);

// the outer ring: a wider ellipse turning the other way, with the calling's marks on it
function fsMasterRing(p,kind,col){const R=34,cx=p.x,cy=p.y,t=-now*.9;ctx.save();ctx.globalAlpha=.7;ctx.strokeStyle=col;ctx.fillStyle=col;ctx.lineWidth=1.2;
  ctx.setLineDash([6,5]);ctx.lineDashOffset=now*12;ctx.beginPath();ctx.ellipse(cx,cy,R*1.25,R*.62,0,0,7);ctx.stroke();ctx.setLineDash([]);
  const n=kind==='tick'?12:6;for(let k=0;k<n;k++){const a=t+k*6.283/n,x=cx+Math.cos(a)*R*1.25,y=cy+Math.sin(a)*R*.62;ctx.save();ctx.translate(x,y);
    if(kind==='crest'){ctx.beginPath();ctx.moveTo(0,-4);ctx.lineTo(3,-1);ctx.lineTo(0,4);ctx.lineTo(-3,-1);ctx.closePath();ctx.fill();}
    else if(kind==='spike'){ctx.beginPath();ctx.moveTo(-2.5,1);ctx.lineTo(0,-7-Math.sin(now*10+k)*2);ctx.lineTo(2.5,1);ctx.fill();}
    else if(kind==='glyph'){ctx.font='700 8px sans-serif';ctx.textAlign='center';ctx.fillText('ᚱᚦᛉᛗᛟᚨ'[k],0,3);}
    else if(kind==='bolt'){ctx.beginPath();ctx.moveTo(-1,-6);ctx.lineTo(2,-1);ctx.lineTo(-1,0);ctx.lineTo(2,5);ctx.stroke();}
    else if(kind==='dark'){ctx.fillStyle=rgba('#08020c',.9);ctx.beginPath();ctx.arc(0,0,3.2,0,7);ctx.fill();ctx.stroke();}
    else if(kind==='tick'){ctx.fillRect(-.8,-3,1.6,k%3?4:6);}
    else if(kind==='fang'){ctx.beginPath();ctx.moveTo(-3,-2);ctx.quadraticCurveTo(0,6,3,-2);ctx.fill();}
    else if(kind==='wing'){ctx.rotate(a);ctx.beginPath();ctx.moveTo(0,0);ctx.quadraticCurveTo(-4,-5,-8,-3);ctx.lineTo(-3,0);ctx.closePath();ctx.fill();}
    else if(kind==='ray'){ctx.rotate(a);ctx.fillRect(0,-1,7,2);}
    else if(kind==='star'){ctx.beginPath();for(let q=0;q<10;q++){const rr=q%2?1.4:3.6,an=q*.628;ctx.lineTo(Math.cos(an)*rr,Math.sin(an)*rr);}ctx.fill();}
    else if(kind==='petal'){ctx.rotate(a);ctx.beginPath();ctx.ellipse(0,0,4.5,2,0,0,7);ctx.fill();}
    ctx.restore();}
  ctx.restore();}
{const _ccM=castCircle;castCircle=function(p){_ccM.apply(this,arguments);const st=fsStyle(p&&p.cls);if(st&&st.ring)try{fsMasterRing(p,st.ring,st.cast[1]);}catch(e){}};}

if(typeof TH!=='undefined'){for(const [n,th] of [['Bastion Quake','ป้อมสะเทือน'],['Warpath','เส้นทางสงคราม'],['Tempest Crown','มงกุฎพายุ'],['Event Horizon','ขอบฟ้าแห่งความว่างเปล่า'],['Final Shot','นัดสุดท้าย'],
  ['Wild Hunt','การล่าแห่งป่า'],['Dawn Break','รุ่งอรุณ'],['Constellation Fall','กลุ่มดาวร่วง'],['World Rune','อักขระโลก'],['Rewind','ย้อนเวลา'],['Sky Sovereign','จ้าวแห่งฟ้า'],['Thousand Petals','พันกลีบบัว']])TH[n+'!']=th+'!';}
