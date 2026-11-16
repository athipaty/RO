"use strict";
/* ================= every weapon its own look =================
   Replaces drawWeaponShape (render.js) with a detailed drawing per weapon (by item id), falling back to its type.
   Contract kept exactly so the hero holds it right in every pose: the grip is at 0,0 and the weapon points up (-y);
   a bow ignores the turn it is given (drawn upright, opening toward +x, string at the tips).
   bowLimbsArt draws just the bow's limbs so the shot animation (drawBowShot) uses the same bow. */
const WA_OL='#20160f';
const waId=(()=>{let map=null;return w=>{if(!map){map=new Map();for(const k in ITEMS)map.set(ITEMS[k],k);}return map.get(w)||'';};})();
const waFS=(fill,lw)=>{ctx.fillStyle=fill;ctx.fill();ctx.lineWidth=lw||1.1;ctx.strokeStyle=WA_OL;ctx.stroke();};
const waPoly=pts=>{ctx.beginPath();pts.forEach(([a,b],i)=>i?ctx.lineTo(a,b):ctx.moveTo(a,b));ctx.closePath();};
function waGlow(x,y,r,col,a){ctx.save();ctx.globalCompositeOperation='lighter';const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,col);g.addColorStop(1,'rgba(0,0,0,0)');
  ctx.globalAlpha=a??.8;ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.fill();ctx.restore();}
// a wrapped grip from y0 (bottom) to y1 (top) and a pommel below it
function waGrip(y0,y1,w,col,wrap,pom){ctx.beginPath();ctx.roundRect(-w/2,y1,w,y0-y1,1);waFS(col);
  ctx.strokeStyle=wrap;ctx.lineWidth=.7;for(let y=y1+1.2;y<y0-.6;y+=1.8){ctx.beginPath();ctx.moveTo(-w/2,y+.8);ctx.lineTo(w/2,y-.4);ctx.stroke();}
  if(pom){ctx.beginPath();ctx.arc(0,y0+1.4,1.9,0,7);waFS(pom);}}
function waGem(x,y,r,col){ctx.beginPath();ctx.arc(x,y,r,0,7);waFS(col,.8);ctx.fillStyle='rgba(255,255,255,.75)';ctx.beginPath();ctx.arc(x-r*.35,y-r*.35,r*.35,0,7);ctx.fill();}
// ---------- swords ----------
function waSword(o){const L=o.len||22,W=o.w||3.6;waGrip(5,-1,2.6,o.grip||'#5a3a22',o.wrap||'#c8a070',o.pom||'#c8a050');
  // crossguard
  ctx.beginPath();ctx.roundRect(-(o.guard||6),-3,(o.guard||6)*2,2.2,1);waFS(o.gcol||'#c8a050');if(o.gem)waGem(0,-1.9,1.2,o.gem);
  // blade: straight, or curved for a saber
  const tip=-3-L;ctx.beginPath();
  if(o.curve){ctx.moveTo(-W/2,-3);ctx.quadraticCurveTo(-W/2-1,tip*.55,W*.2+3,tip+1);ctx.quadraticCurveTo(W/2+1.5,tip*.5,W/2,-3);}
  else{ctx.moveTo(-W/2,-3);ctx.lineTo(-W/2,tip+W*1.1);ctx.lineTo(0,tip);ctx.lineTo(W/2,tip+W*1.1);ctx.lineTo(W/2,-3);}
  ctx.closePath();waFS(o.blade||'#d0d6de');
  // fuller and edge light
  if(!o.curve){ctx.strokeStyle='rgba(60,70,85,.45)';ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(0,-4);ctx.lineTo(0,tip+W*1.6);ctx.stroke();}
  ctx.strokeStyle='rgba(255,255,255,.75)';ctx.lineWidth=.7;ctx.beginPath();ctx.moveTo(-W/2+.6,-4);ctx.lineTo(-W/2+.6,tip+W*1.3);ctx.stroke();
  if(o.glow)waGlow(0,tip*.55,W*2.6,o.glow,.45);}
// ---------- axes ----------
function waAxe(o){const L=o.len||24;waGrip(5,-3,2.4,'#4a3020','#b88a5a','#6a707c');
  ctx.beginPath();ctx.roundRect(-1.4,-L,2.8,L-2,1);waFS(o.haft||'#7a5230');
  ctx.fillStyle='rgba(255,230,190,.35)';ctx.fillRect(-.9,-L+2,.6,L-6);
  const hy=-L+3;
  // the head: a crescent bit (and a second one for a double axe), a back spike, an iron collar
  const bit=s=>{ctx.beginPath();ctx.moveTo(s*1.2,hy-2.5);ctx.quadraticCurveTo(s*6,hy-6,s*10.5,hy-7.5);ctx.quadraticCurveTo(s*8,hy+1.5,s*10.5,hy+8);ctx.quadraticCurveTo(s*6,hy+6,s*1.2,hy+4);ctx.closePath();waFS(o.head||'#c8ccd4');
    ctx.strokeStyle='rgba(255,255,255,.8)';ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(s*10,hy-6.6);ctx.quadraticCurveTo(s*7.8,hy+.6,s*10,hy+7);ctx.stroke();};
  bit(1);if(o.double)bit(-1);else{waPoly([[-1.2,hy-1],[-6,hy+.6],[-1.2,hy+2.6]]);waFS(o.head||'#c8ccd4');}
  ctx.beginPath();ctx.roundRect(-2.1,hy-3,4.2,7.6,1);waFS('#5a606c');
  ctx.fillStyle='#d8dde6';for(const y of [hy-1.4,hy+2.4]){ctx.beginPath();ctx.arc(0,y,.6,0,7);ctx.fill();}
  if(o.crack){ctx.strokeStyle=o.crack;ctx.lineWidth=.9;ctx.beginPath();ctx.moveTo(3,hy-2);ctx.lineTo(5,hy+1);ctx.lineTo(4,hy+3.5);ctx.lineTo(7,hy+5);ctx.stroke();waGlow(5,hy+1.5,6,o.crack,.5);}}
// ---------- maces and hammers ----------
function waMace(o){const L=o.len||18;waGrip(5,-2,2.4,'#3a3a44','#9aa0aa','#8a909c');
  ctx.beginPath();ctx.roundRect(-1.3,-L,2.6,L-1,1);waFS(o.haft||'#8a8f99');
  const hy=-L-2.5;
  if(o.maul){ctx.beginPath();ctx.roundRect(-7,hy-4,14,9,2);waFS(o.head);ctx.strokeStyle='#4a3a22';ctx.lineWidth=1.3;for(const x of [-3.5,3.5]){ctx.beginPath();ctx.moveTo(x,hy-4);ctx.lineTo(x,hy+5);ctx.stroke();}
    ctx.fillStyle='#c8c0a8';for(const x of [-6,6]){ctx.beginPath();ctx.arc(x,hy+.5,1.1,0,7);ctx.fill();}return;}
  // a flanged head: six flanges around a round core
  for(let i=0;i<6;i++){const a=i/6*Math.PI*2;ctx.save();ctx.translate(0,hy);ctx.rotate(a);waPoly([[-1.4,-2],[1.4,-2],[1,-6.2],[-1,-6.2]]);waFS(o.flange||o.head);ctx.restore();}
  ctx.beginPath();ctx.arc(0,hy,3.6,0,7);waFS(o.head);
  ctx.fillStyle='rgba(255,255,255,.55)';ctx.beginPath();ctx.arc(-1.2,hy-1.2,1.2,0,7);ctx.fill();
  if(o.gem)waGem(0,hy,1.5,o.gem);if(o.glow)waGlow(0,hy,11,o.glow,.5);
  if(o.halo){ctx.strokeStyle=o.halo;ctx.lineWidth=1;ctx.globalAlpha=.8;ctx.beginPath();ctx.ellipse(0,hy-8,5,1.6,0,0,7);ctx.stroke();ctx.globalAlpha=1;}}
// ---------- wands and rods ----------
function waWand(o){const L=o.len||18,t=typeof now==='number'?now:0;
  ctx.beginPath();ctx.moveTo(-1.6,5);ctx.lineTo(-1.1,-L);ctx.lineTo(1.1,-L);ctx.lineTo(1.6,5);ctx.closePath();waFS(o.shaft||'#7a5230');
  ctx.strokeStyle=o.spiral||'rgba(40,25,15,.5)';ctx.lineWidth=.7;for(let y=3;y>-L+1;y-=3){ctx.beginPath();ctx.moveTo(-1.4,y);ctx.lineTo(1.3,y-1.6);ctx.stroke();}
  ctx.beginPath();ctx.roundRect(-2,1,4,2.2,1);waFS(o.band||'#c8a050');
  const cy=-L-4;
  // prongs holding the crystal
  ctx.strokeStyle=o.prong||'#c8a050';ctx.lineWidth=1.1;for(const s of [-1,1]){ctx.beginPath();ctx.moveTo(s*1,-L);ctx.quadraticCurveTo(s*4,cy+1,s*2.2,cy-2.5);ctx.stroke();}
  if(o.orb){waGlow(0,cy,9,o.orb,.75);ctx.beginPath();ctx.arc(0,cy,3.4,0,7);waFS(o.orb,.9);ctx.fillStyle='rgba(255,240,200,.9)';ctx.beginPath();ctx.arc(-1,cy-1,1.1,0,7);ctx.fill();
    for(let i=0;i<3;i++){const a=t*3+i*2.1,k=(t*1.6+i/3)%1;ctx.fillStyle=`rgba(255,${150+i*30},60,${.8*(1-k)})`;ctx.beginPath();ctx.arc(Math.cos(a)*2,cy-3-k*6,1-k*.5,0,7);ctx.fill();}return;}
  waGlow(0,cy,8,o.glow||'#c8a0ff',.6);
  waPoly([[0,cy-4.6],[2.6,cy-.6],[0,cy+3],[-2.6,cy-.6]]);waFS(o.crystal||'#b48cf0',.9);
  ctx.strokeStyle='rgba(255,255,255,.7)';ctx.lineWidth=.6;ctx.beginPath();ctx.moveTo(0,cy-4.2);ctx.lineTo(0,cy+2.6);ctx.moveTo(-2.2,cy-.6);ctx.lineTo(2.2,cy-.6);ctx.stroke();
  if(o.star)for(let i=0;i<4;i++){const a=t*2+i*Math.PI/2,r=5.5;ctx.fillStyle='rgba(255,250,210,.9)';ctx.beginPath();ctx.arc(Math.cos(a)*r,cy+Math.sin(a)*r*.6,.7,0,7);ctx.fill();}}
// ---------- bows (limbs only; the string is drawn by the caller) ----------
function bowLimbsArt(w,R,A){const id=waId(w),o=WA_BOW[id]||WA_BOW.bow,r=R*(o.scale||1);
  ctx.lineCap='round';
  // limb body, with a recurve at the tips
  const limb=s=>{ctx.beginPath();ctx.arc(0,0,r,0,s*A,s<0);ctx.lineWidth=o.thick||3;ctx.strokeStyle=WA_OL;ctx.stroke();ctx.lineWidth=(o.thick||3)-1.4;ctx.strokeStyle=o.wood;ctx.stroke();
    const tx=Math.cos(A)*r,ty=s*Math.sin(A)*r;ctx.beginPath();ctx.moveTo(tx,ty);ctx.quadraticCurveTo(tx+2.4,ty+s*1.2,tx+2.6,ty-s*1.4);ctx.lineWidth=1.8;ctx.strokeStyle=o.tip||o.wood;ctx.stroke();
    if(o.thorns)for(let i=1;i<4;i++){const a=s*A*i/4,x=Math.cos(a)*r,y=Math.sin(a)*r;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+Math.cos(a)*2.4,y+Math.sin(a)*2.4);ctx.lineWidth=1;ctx.strokeStyle='#2a3a1a';ctx.stroke();}};
  limb(1);limb(-1);
  // grip wrap at the middle
  ctx.lineWidth=3.6;ctx.strokeStyle=WA_OL;ctx.beginPath();ctx.arc(0,0,r,-.18,.18);ctx.stroke();ctx.lineWidth=2.4;ctx.strokeStyle=o.grip||'#5a3a22';ctx.stroke();
  if(o.ribbon){const t=typeof now==='number'?now:0;ctx.strokeStyle=o.ribbon;ctx.lineWidth=1;for(const s of [-1,1]){const tx=Math.cos(A)*r,ty=s*Math.sin(A)*r;ctx.beginPath();ctx.moveTo(tx,ty);ctx.quadraticCurveTo(tx-3,ty+s*3+Math.sin(t*5)*1.5,tx-1,ty+s*6+Math.sin(t*5+1)*2);ctx.stroke();}}
  if(o.feather)for(const s of [-1,1]){const tx=Math.cos(A)*r,ty=s*Math.sin(A)*r;ctx.fillStyle=o.feather;ctx.beginPath();ctx.ellipse(tx+1,ty-s*.5,1.2,2.6,s*.6,0,7);ctx.fill();}
  return {tx:Math.cos(A)*r,ty:Math.sin(A)*r};}
const WA_BOW={bow:{wood:'#9a6a3a',grip:'#5a3a22'},longbow:{wood:'#b8d0a0',grip:'#4a6a3a',scale:1.12,tip:'#e8f0d8',feather:'#ffffff'},
  galebow:{wood:'#d8e8c8',grip:'#3a7a5a',ribbon:'#7ad0b0',tip:'#ffffff'},needlebow:{wood:'#3f5a2a',grip:'#2a3a1a',thorns:true,tip:'#7a9a4a'}};
// ---------- the table: each weapon's look ----------
const WA={
  sword:()=>waSword({}),
  bastion:()=>waSword({w:5,len:22,guard:7.5,gcol:'#e0b84a',gem:'#4a8ad8',pom:'#e0b84a'}),
  fangblade:()=>waSword({w:4,len:24,blade:'#cfe8f8',gcol:'#9ad0f0',gem:'#ffffff',glow:'#9fd8ff',wrap:'#bfe6ff',pom:'#bfe6ff'}),
  twinfang:()=>waSword({w:3,len:21,curve:true,guard:4.5,gcol:'#8a2a24',grip:'#2a1a1a',wrap:'#d84a3a',pom:'#8a2a24'}),
  axe:()=>waAxe({}),
  splitter:()=>waAxe({double:true,head:'#c89a5a',haft:'#5a3a22',crack:'#ffb040',len:25}),
  mace:()=>waMace({head:'#c8ccd4'}),
  sunmace:()=>waMace({head:'#e8c25a',flange:'#f0d070',gem:'#ff8a3a',glow:'#ffcf5a'}),
  trollmaul:()=>waMace({maul:true,head:'#6a7a5a',len:19}),
  dawnmace:()=>waMace({head:'#f4efe2',flange:'#e8d8a0',gem:'#ffe9a0',halo:'#fff3c0',glow:'#fff3c0'}),
  wand:()=>waWand({}),
  rod:()=>waWand({len:21,shaft:'#c8ccd4',spiral:'rgba(90,100,130,.5)',band:'#4a6ac0',prong:'#e8d8ff',crystal:'#a8c8ff',glow:'#c8d8ff',star:true}),
  corerod:()=>waWand({len:20,shaft:'#3a2a2a',spiral:'rgba(240,120,60,.5)',band:'#8a3a1a',prong:'#c86a3a',orb:'#ff8a3a'}),
  spiked:()=>{const sw=drawWeaponShapeClassic;sw({wt:'club'},0);ctx.fillStyle='#c8ccd4';ctx.strokeStyle=WA_OL;ctx.lineWidth=.8;
    for(const [x,y,s] of [[-4.6,-18,-1],[4.6,-18,1],[-4.2,-13,-1],[4.2,-13,1],[0,-23.5,0]]){ctx.beginPath();if(s){ctx.moveTo(x,y-1.2);ctx.lineTo(x+s*2.6,y);ctx.lineTo(x,y+1.2);}else{ctx.moveTo(-1.2,y);ctx.lineTo(0,y-2.6);ctx.lineTo(1.2,y);}ctx.closePath();ctx.fill();ctx.stroke();}}};
const WA_BY_TYPE={sword:'sword',axe:'axe',mace:'mace',wand:'wand'};
const drawWeaponShapeClassic=drawWeaponShape;
drawWeaponShape=function(w,ang){if(!w)return;const id=waId(w);
  if(w.wt==='bow'){ctx.rotate(-ang);const t=bowLimbsArt(w,13,1.3);ctx.strokeStyle='#f0ece0';ctx.lineWidth=.9;ctx.beginPath();ctx.moveTo(t.tx,-t.ty);ctx.lineTo(t.tx-.4,0);ctx.lineTo(t.tx,t.ty);ctx.stroke();return;}
  const fn=WA[id]||WA[WA_BY_TYPE[w.wt]];if(!fn)return drawWeaponShapeClassic(w,ang);
  ctx.save();ctx.lineJoin='round';ctx.lineCap='round';try{fn();}finally{ctx.restore();}};
