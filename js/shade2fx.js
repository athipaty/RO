"use strict";
/* ================= the Shade's advanced callings: how they look and strike (v1.19.0) =================
   Nightblade, Venomancer and Phantom (js/shade2.js): a signature effect for every skill, their outfit pieces,
   their finisher and cast circle, and how they sit. Loaded after js/fightstyle3.js. */
const SKILL_FX_SH2={
  mortalcut:(l,t)=>{fxF({k:'crescent',x:t.x,y:t.y,ang:.6,r:34,w:12,col:'#ff5a7a',dur:.28,h:fxSz(t)});fxF({k:'spikes',x:t.x,y:t.y,col:'#ffb0c0',dur:.3,h:fxSz(t),t0:now+.1});fxF({k:'reticle',x:t.x,y:t.y,col:'#ff5a7a',dur:.3,h:fxSz(t)});},
  shadowleap:(l,t)=>{fxF({k:'streak',x0:P.x,y0:P.y,x:t.x,y:t.y,col:'#c890a8',w:10,dur:.22});fxF({k:'crescent',x:t.x,y:t.y,ang:-2.2,r:28,col:'#ffd0e0',dur:.22,h:fxSz(t),t0:now+.15});fxF({k:'chain',x:t.x,y:t.y,pts:[{x:P.x,y:P.y,h:16},{x:t.x,y:t.y,h:fxSz(t)}],col:'#c890a8',dur:.25});},
  killingintent:l=>{fxF({k:'vortex',x:P.x,y:P.y,o:P,col:'#ff5a7a',col2:'#2a1018',r:44,imp:true,dur:.7});fxF({k:'motes',x:P.x,y:P.y,o:P,col:'#ff7a8a',col2:'#2a1018',n:14,r:30,dur:1.1});fxF({k:'spikes',x:P.x,y:P.y,col:'#ff5a7a',dur:.4,h:20});},
  fanofblades:l=>{for(let i=0;i<8;i++){const a=i*Math.PI/4;fxF({k:'streak',x0:P.x,y0:P.y,x:P.x+Math.cos(a)*100,y:P.y+Math.sin(a)*60,col:'#ffa0b0',w:5,dur:.25,t0:now+i*.02});}
    fxF({k:'crescent',x:P.x,y:P.y,ang:0,r:50,w:10,col:'#ffd0e0',dur:.3,h:10});fxF({k:'icicles',x:P.x,y:P.y,col:'#ffd0e0',r:100,n:10,dur:.5});},
  toxicfang:(l,t)=>{fxF({k:'claws',x:t.x,y:t.y,ang:.4,r:26,col:'#9be35a',dur:.3,h:fxSz(t)});fxF({k:'motes',x:t.x,y:t.y,col:'#9be35a',col2:'#3a5a1a',n:10,r:22,dur:.9,t0:now+.1});fxF({k:'spikes',x:t.x,y:t.y,col:'#9be35a',dur:.3,h:fxSz(t)});},
  miasma:(l,x,y)=>{fxF({k:'vortex',x,y,col:'#7ac850',col2:'#2a4a1a',r:100,dur:1.2});fxF({k:'motes',x,y,col:'#9be35a',col2:'#5a7a2a',n:26,r:90,dur:3.6});fxF({k:'quake',x,y,r:100,col:'#2a4a1a',glow:'#9be35a',dur:.6});},
  venomcoat:l=>{fxF({k:'dome',x:P.x,y:P.y,o:P,col:'#9be35a',r:30,dur:1.2});fxF({k:'motes',x:P.x,y:P.y,o:P,col:'#b8f080',col2:'#3a5a1a',orbit:true,n:14,r:28,dur:1.4});fxF({k:'rune',x:P.x,y:P.y,o:P,col:'#9be35a',g:'◍',r:36,dur:1});},
  plagueburst:(l,t)=>{fxF({k:'flare',x:t.x,y:t.y,col:'#d0ff70',r:80,dur:.4,h:fxSz(t)});fxF({k:'quake',x:t.x,y:t.y,r:80,col:'#3a5a1a',glow:'#d0ff70',dur:.6,t0:now+.1});fxF({k:'icicles',x:t.x,y:t.y,col:'#d0ff70',r:80,n:8,dur:.5});},
  phantomedge:(l,t)=>{fxF({k:'crescent',x:t.x-10,y:t.y,ang:.7,r:26,col:'#a8c8ff',dur:.2,h:fxSz(t)});fxF({k:'crescent',x:t.x+10,y:t.y,ang:-2.4,r:26,col:'#e0e8ff',dur:.2,h:fxSz(t),t0:now+.15});fxF({k:'halo',x:P.x,y:P.y,o:P,col:'#a8c8ff',dur:.5});},
  mirage:l=>{fxF({k:'halo',x:P.x,y:P.y,o:P,col:'#c8d8ff',dur:1.4});fxF({k:'motes',x:P.x,y:P.y,o:P,col:'#c8d8ff',col2:'#ffffff',shape:'star',n:12,r:32,dur:1.2});fxF({k:'dome',x:P.x,y:P.y,o:P,col:'#c8d8ff',r:30,dur:1});},
  shadowdouble:l=>{fxF({k:'rune',x:P.x,y:P.y,o:P,col:'#8890c8',g:'⧉',r:40,dur:1.2});fxF({k:'vortex',x:P.x,y:P.y,o:P,col:'#8890c8',col2:'#1e1a28',r:36,dur:.6});fxF({k:'streak',x0:P.x-30,y0:P.y,x:P.x,y:P.y,col:'#8890c8',w:8,dur:.3});},
  shadowwaltz:(l,t)=>{fxF({k:'chain',x:t.x,y:t.y,pts:[{x:P.x,y:P.y,h:20},{x:t.x,y:t.y,h:fxSz(t)}],col:'#9aa8ff',dur:.35});fxF({k:'motes',x:t.x,y:t.y,col:'#9aa8ff',col2:'#e0e8ff',n:12,r:40,dur:.8});fxF({k:'stampede',x:t.x,y:t.y,r:60,col:'#9aa8ff',dur:.6});},
};
if(typeof SKILL_FX!=='undefined')for(const id in SKILL_FX_SH2){const sk=SKILLS[id];if(!sk||!sk.run||SKILL_FX[id])continue;SKILL_FX[id]=SKILL_FX_SH2[id];const run=sk.run,fxf=SKILL_FX_SH2[id];
  sk.run=function(){try{fxf.apply(this,arguments);}catch(e){}return run.apply(this,arguments);};}

// outfit pieces (js/joblooks.js)
if(typeof JOB_LOOK!=='undefined')Object.assign(JOB_LOOK,{
  nightblade:{s:[['spikes',{c:'#2a2236',t:'#ff5a7a'}]],b:[['cape',{c:'#1e1a28',t:'#ff5a7a',long:1}]]},
  venomancer:{b:[['cape',{c:'#3a4a2a',t:'#9be35a'}]]}, // (v1.70.2) no orb beside it
  phantom:{s:[['sparks',{c:'#a8c8ff'}]],b:[['cape',{c:'#3a3a5a',t:'#a8c8ff'}]]}});

// finisher and cast circle (js/fightstyle.js)
if(typeof FS_FIN!=='undefined'&&typeof FS_STYLES!=='undefined'){
  Object.assign(FS_FIN,{
    nightblade:{n:'Crimson Moon',f:t=>{fxF({k:'crescent',x:t.x,y:t.y,ang:.4,r:46,w:16,col:'#ff5a7a',dur:.35,h:fsH(t)});fxF({k:'crescent',x:t.x,y:t.y,ang:-2.6,r:46,w:16,col:'#ffd0e0',dur:.35,h:fsH(t),t0:now+.12});
      fxF({k:'flare',x:t.x,y:t.y,col:'#ff5a7a',r:60,dur:.3,t0:now+.25,h:fsH(t)});}},
    venomancer:{n:'Blight Bloom',f:t=>{fxF({k:'vortex',x:t.x,y:t.y,col:'#9be35a',col2:'#2a4a1a',r:56,imp:true,dur:.7});fxF({k:'motes',x:t.x,y:t.y,col:'#d0ff70',col2:'#3a5a1a',n:20,r:50,dur:1,t0:now+.3});}},
    phantom:{n:'Hall of Mirrors',f:t=>{for(let i=0;i<5;i++)fxF({k:'crescent',x:t.x+Math.cos(i*1.26)*14,y:t.y+Math.sin(i*1.26)*6,ang:i*1.26,r:30,col:i%2?'#a8c8ff':'#e0e8ff',dur:.2,h:fsH(t),t0:now+i*.06});
      fxF({k:'motes',x:t.x,y:t.y,col:'#c8d8ff',col2:'#ffffff',shape:'star',n:14,r:40,dur:.9,t0:now+.3});}}});
  Object.assign(FS_STYLES,{
    nightblade:{cast:['flame','#ff5a7a'],melee:FS_HIT.fang,fin:FS_FIN.nightblade},
    venomancer:{cast:['eyes','#9be35a'],melee:FS_HIT.fang,fin:FS_FIN.venomancer},
    phantom:{cast:['stars','#a8c8ff'],melee:FS_HIT.fang,fin:FS_FIN.phantom}});}

// how they sit (js/sitpose.js)
if(typeof SIT_POSE!=='undefined')Object.assign(SIT_POSE,{nightblade:{legs:'knees',hands:[[7,-3],[-3,1]],hip:5,lean:.08},
  venomancer:{legs:'squat',hands:[[8,5],[-4,6]],hip:2,lean:.12},phantom:{legs:'lotus',hands:[[9,2.5],[-9,2.5]],fx:'calm'}});

if(typeof TH!=='undefined')Object.assign(TH,{'Crimson Moon':'จันทร์สีเลือด','Blight Bloom':'บุปผาพิษ','Hall of Mirrors':'ห้องกระจกเงา'});
