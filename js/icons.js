"use strict";
/* ================= item pictures: every item gets its own drawn icon (bag, shops, storage, hotbar, ground) ================= */
for(const id in ITEMS)ITEMS[id].id=id;
const ICON_CACHE={},ICON_CANVAS={};
const OL='#2a1c14';
// one shade for the whole game: -1..1 is a fraction (icons), anything bigger is an amount to add (render.js: roofs, monsters).
// Before, this one replaced render.js's and turned every shade(col,-40) black.
function shade(hex,k){const n=parseInt(String(hex).slice(1),16);let r=n>>16,g=n>>8&255,b=n&255;
  if(Math.abs(k)>1){const a=v=>Math.max(0,Math.min(255,Math.round(v+k)));return `rgb(${a(r)},${a(g)},${a(b)})`;}
  const f=v=>Math.max(0,Math.min(255,Math.round(k<0?v*(1+k):v+(255-v)*k)));return `rgb(${f(r)},${f(g)},${f(b)})`;}

// draws item `id` into context g, in a 32x32 box
function drawItemIcon(g,id){const it=ITEMS[id];if(!it)return;it.id=id;const c=it.col||'#c8c2b4';
  g.lineJoin='round';g.lineCap='round';g.lineWidth=1.6;g.strokeStyle=OL;
  const P_=(f,s)=>{g.fillStyle=f;g.fill();if(s!==false)g.stroke();};
  const T=it.type;
  if(T==='use'){
    if(it.tele){g.beginPath();g.moveTo(16,4);g.quadraticCurveTo(29,10,22,24);g.quadraticCurveTo(16,30,9,26);g.quadraticCurveTo(4,14,16,4);P_(c);
      g.strokeStyle=shade(c,-.45);g.beginPath();g.moveTo(10,25);g.quadraticCurveTo(15,15,20,9);g.stroke();return;}
    if(it.pick){g.beginPath();g.moveTo(16,3);g.lineTo(24,13);g.lineTo(19,29);g.lineTo(12,29);g.lineTo(8,13);g.closePath();P_(c);
      g.fillStyle='rgba(255,255,255,.55)';g.beginPath();g.moveTo(16,6);g.lineTo(20,13);g.lineTo(16,25);g.closePath();g.fill();return;}
    if(it.kin){g.strokeStyle=OL;g.lineWidth=1.6;for(const [x,y] of [[12,13],[20,13]]){g.beginPath();g.arc(x,y,6,0,7);P_(c);}
      g.beginPath();g.moveTo(10,18);g.lineTo(16,29);g.lineTo(22,18);P_(shade(c,-.2));g.fillStyle='rgba(255,255,255,.6)';g.beginPath();g.arc(10,11,1.8,0,7);g.fill();return;}
    if(it.home){g.beginPath();g.roundRect(6,8,20,16,3);P_('#efe2bf');g.fillStyle=c;g.beginPath();g.arc(16,16,4,0,7);g.fill();
      for(const x of [5,27]){g.beginPath();g.ellipse(x,16,2.5,8.5,0,0,7);P_('#d9c79a');}return;}
    // a tonic bottle with its liquid
    g.beginPath();g.roundRect(12,3,8,6,1.5);P_('#c8a070');
    g.beginPath();g.moveTo(12,9);g.lineTo(20,9);g.lineTo(20,12);g.quadraticCurveTo(28,15,27,22);g.quadraticCurveTo(26,29,16,29);g.quadraticCurveTo(6,29,5,22);g.quadraticCurveTo(4,15,12,12);g.closePath();P_('rgba(220,235,245,.55)');
    g.save();g.clip();g.fillStyle=c;g.fillRect(3,it.cure?15:17,26,14);g.fillStyle=shade(c,.35);g.fillRect(3,it.cure?15:17,26,2.5);g.restore();
    g.fillStyle='rgba(255,255,255,.7)';g.beginPath();g.ellipse(10.5,19,1.6,3.5,.3,0,7);g.fill();
    g.strokeStyle=OL;g.beginPath();g.moveTo(12,9);g.lineTo(20,9);g.lineTo(20,12);g.quadraticCurveTo(28,15,27,22);g.quadraticCurveTo(26,29,16,29);g.quadraticCurveTo(6,29,5,22);g.quadraticCurveTo(4,15,12,12);g.closePath();g.stroke();return;}
  if(T==='weapon'){const wt=it.wt,steel=it.atk>60?'#e8ecf2':'#c8ccd4';g.save();g.translate(16,16);g.rotate(-Math.PI/4);
    if(wt==='sword'){g.beginPath();g.moveTo(-2.4,-13);g.lineTo(0,-16);g.lineTo(2.4,-13);g.lineTo(2.4,5);g.lineTo(-2.4,5);g.closePath();P_(steel);
      g.beginPath();g.roundRect(-7,5,14,3,1);P_('#b8924f');g.beginPath();g.roundRect(-1.8,8,3.6,6,1);P_('#5a3d24');g.beginPath();g.arc(0,15,2,0,7);P_('#e8c25a');}
    else if(wt==='axe'){g.beginPath();g.roundRect(-1.6,-12,3.2,27,1);P_('#6b4a2a');g.beginPath();g.moveTo(1,-12);g.quadraticCurveTo(13,-10,11,1);g.quadraticCurveTo(6,-3,1,-2);g.closePath();P_(steel);
      g.beginPath();g.moveTo(-1,-12);g.quadraticCurveTo(-8,-8,-7,-2);g.lineTo(-1,-4);g.closePath();P_(steel);}
    else if(wt==='wand'){g.beginPath();g.roundRect(-1.6,-6,3.2,21,1.5);P_('#7a5530');g.beginPath();g.arc(0,-10,5.5,0,7);P_(c);
      g.fillStyle='rgba(255,255,255,.75)';g.beginPath();g.arc(-1.8,-12,1.6,0,7);g.fill();if(it.matk>50){g.strokeStyle='#e8c25a';g.beginPath();g.arc(0,-10,7.5,-.4,3.5);g.stroke();}}
    else if(wt==='bow'){g.rotate(Math.PI/4);g.strokeStyle='#6b4423';g.lineWidth=3;g.beginPath();g.arc(-4,16,17,-1.95,-.55);g.stroke();
      g.strokeStyle='#eee';g.lineWidth=1;g.beginPath();g.moveTo(-4+17*Math.cos(-1.95),16+17*Math.sin(-1.95));g.lineTo(-4+17*Math.cos(-.55),16+17*Math.sin(-.55));g.stroke();
      if(it.atk>60){g.fillStyle=c;g.beginPath();g.arc(1,2,2,0,7);g.fill();}}
    else if(wt==='mace'){g.beginPath();g.roundRect(-1.6,-4,3.2,19,1);P_('#8a8f99');g.beginPath();g.arc(0,-8,6.5,0,7);P_(it.matk>40?'#f0d070':steel);
      for(let i=0;i<6;i++){const a=i*Math.PI/3;g.beginPath();g.arc(Math.cos(a)*6.5,-8+Math.sin(a)*6.5,1.6,0,7);P_(OL,false);}}
    else{g.beginPath();g.moveTo(-2,15);g.lineTo(-4.5,-9);g.quadraticCurveTo(0,-16,4.5,-9);g.lineTo(2,15);g.closePath();P_('#9a6a3a');
      if(it.id==='spiked')for(const [x,y] of [[-5,-6],[5,-4],[-4.5,1],[4.5,3],[0,-12]]){g.beginPath();g.moveTo(x*.8,y);g.lineTo(x*1.5,y-1.5);g.lineTo(x*.8,y+2.5);P_('#d0d6de');}}
    g.restore();return;}
  if(T==='armor'){const id=it.id,long=id==='robe';g.beginPath();g.moveTo(9,5);g.lineTo(13,4);g.quadraticCurveTo(16,8,19,4);g.lineTo(23,5);g.lineTo(29,10);g.lineTo(25,15);g.lineTo(23,13);
    g.lineTo(23,long?29:26);g.lineTo(9,long?29:26);g.lineTo(9,13);g.lineTo(7,15);g.lineTo(3,10);g.closePath();P_(c);
    if(id==='scale'){g.strokeStyle=shade(c,-.3);for(let y=12;y<25;y+=4)for(let x=11;x<22;x+=4){g.beginPath();g.arc(x+(y%8?2:0),y,2,0,Math.PI);g.stroke();}}
    else if(id==='plate'){g.fillStyle=shade(c,.3);g.beginPath();g.roundRect(12,9,8,13,3);g.fill();g.fillStyle='#ffcf5a';g.beginPath();g.arc(16,15,2,0,7);g.fill();}
    else if(id==='vest'){g.strokeStyle=shade(c,-.35);g.beginPath();g.moveTo(16,8);g.lineTo(16,26);g.stroke();for(const y of [12,17,22]){g.fillStyle='#e8c25a';g.beginPath();g.arc(17.5,y,1,0,7);g.fill();}}
    else if(long){g.strokeStyle='#e8c25a';g.beginPath();g.moveTo(9,25);g.lineTo(23,25);g.stroke();g.fillStyle='#e8c25a';g.beginPath();g.moveTo(13,6);g.lineTo(16,11);g.lineTo(19,6);g.fill();}
    else{g.strokeStyle=shade(c,-.25);g.beginPath();g.moveTo(9,20);g.lineTo(23,20);g.stroke();}
    return;}
  if(T==='head'){const main=ctx;ctx=g;try{g.save();g.beginPath();g.ellipse(16,27,10,8,0,Math.PI,0);g.closePath();g.fillStyle='#f6d6b8';g.fill();g.lineWidth=1.4;g.strokeStyle=OL;g.stroke();g.restore();
      g.save();g.translate(16,26);g.scale(1.3,1.3);g.translate(-16,-26);drawHat(it.id,16,26,1);g.restore();}finally{ctx=main;}return;}
  if((T==='face'||T==='mouth')&&typeof drawFaceGear==='function'){const main=ctx;ctx=g;try{g.save();g.fillStyle='#f6d6b8';g.lineWidth=1.4;g.strokeStyle=OL;g.beginPath();g.ellipse(16,16,12.5,12,0,0,7);g.fill();g.stroke();
      g.translate(16,16);g.scale(1.15,1.15);g.translate(-16,T==='mouth'?-20:-16);drawFaceGear(T==='face'?it.id:null,T==='mouth'?it.id:null,16-2.6,16,1);g.restore();}finally{ctx=main;}return;}
  if(T==='accessory'){const id=it.id;
    if(/fang/.test(id)){g.beginPath();g.moveTo(10,6);g.quadraticCurveTo(22,6,22,10);g.quadraticCurveTo(19,22,14,28);g.quadraticCurveTo(12,18,10,6);P_('#f4efe2');
      g.strokeStyle='#6b4423';g.beginPath();g.moveTo(8,7);g.quadraticCurveTo(16,2,24,8);g.stroke();return;}
    if(/charm/.test(id)&&id!=='hopcharm'){g.fillStyle=c;for(const [x,y] of [[12,11],[20,11],[12,19],[20,19]]){g.beginPath();g.arc(x,y,5,0,7);P_(c);}g.strokeStyle='#3f7d34';g.beginPath();g.moveTo(16,16);g.quadraticCurveTo(18,24,15,29);g.stroke();return;}
    if(/clip/.test(id)){g.beginPath();g.roundRect(6,12,20,8,4);P_(c);g.strokeStyle=shade(c,-.4);g.beginPath();g.moveTo(9,16);g.lineTo(23,16);g.stroke();return;}
    if(/ring/.test(id)){g.lineWidth=4;g.strokeStyle=c;g.beginPath();g.ellipse(16,19,8,7,0,0,7);g.stroke();g.lineWidth=1.6;g.strokeStyle=OL;g.beginPath();g.ellipse(16,19,10,9,0,0,7);g.stroke();
      g.beginPath();g.moveTo(12,11);g.lineTo(16,6);g.lineTo(20,11);g.closePath();P_('#9fd6ff');return;}
    // pendant, amulet, charm on a chain
    g.strokeStyle='#d9c79a';g.lineWidth=1.4;g.beginPath();g.moveTo(6,4);g.quadraticCurveTo(16,16,26,4);g.stroke();g.lineWidth=1.6;g.strokeStyle=OL;
    g.beginPath();g.moveTo(16,12);g.lineTo(23,19);g.lineTo(16,28);g.lineTo(9,19);g.closePath();P_(c);g.fillStyle='rgba(255,255,255,.6)';g.beginPath();g.moveTo(16,14);g.lineTo(19,18);g.lineTo(16,18);g.fill();return;}
  if(T==='sigil'){g.beginPath();g.arc(16,16,12.5,0,7);P_('#3a2f1e');g.beginPath();g.arc(16,16,10,0,7);P_('#ffcf5a');
    const mc=(MOBS[it.id.replace(/_sig$/,'')]||{}).col||'#c58cff';g.beginPath();for(let i=0;i<10;i++){const r=i%2?3.5:8,a=-Math.PI/2+i*Math.PI/5;g.lineTo(16+Math.cos(a)*r,16+Math.sin(a)*r);}g.closePath();P_(mc);return;}
  // monster materials and other loot
  // (id is the item id passed in)
  const blob=(pts)=>{g.beginPath();pts.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();};
  if(/sap|spore/.test(id)&&id!=='gloomspore'){g.beginPath();g.moveTo(16,4);g.quadraticCurveTo(27,17,22,24);g.quadraticCurveTo(16,30,10,24);g.quadraticCurveTo(5,17,16,4);P_(c);
    g.fillStyle='rgba(255,255,255,.6)';g.beginPath();g.ellipse(13,19,2,3.5,.4,0,7);g.fill();return;}
  if(/gloomspore/.test(id)){for(const [x,y,r] of [[12,13,5],[21,11,4],[19,21,6],[10,22,3.5]]){g.beginPath();g.arc(x,y,r,0,7);P_(c);}return;}
  if(/tuft|fur|pelt|hide/.test(id)){blob([[5,12],[10,6],[17,8],[24,5],[28,12],[26,20],[29,26],[20,27],[13,29],[6,24],[8,18]]);P_(c);
    g.strokeStyle=shade(c,-.3);for(const [x,y] of [[11,13],[17,14],[22,12],[13,21],[20,21]]){g.beginPath();g.moveTo(x,y);g.lineTo(x+3,y-2);g.stroke();}return;}
  if(/shell|carapace/.test(id)){g.beginPath();g.ellipse(16,17,12,10,0,0,7);P_(c);g.strokeStyle=shade(c,-.4);
    if(/carapace/.test(id)){g.beginPath();g.moveTo(16,7);g.lineTo(16,27);g.stroke();g.fillStyle='rgba(255,255,255,.35)';g.beginPath();g.ellipse(11,13,3,2,-.5,0,7);g.fill();}
    else{g.beginPath();for(let a=0;a<12;a+=.3){const r=a*.85;g.lineTo(16+Math.cos(a)*r,17+Math.sin(a)*r*.8);}g.stroke();}return;}
  if(/thorn|needle/.test(id)){for(const [x,y,a] of [[9,25,-.5],[16,26,0],[23,25,.5]]){g.save();g.translate(x,y);g.rotate(a);g.beginPath();g.moveTo(-3,0);g.lineTo(0,-20);g.lineTo(3,0);g.closePath();P_(c);g.restore();}return;}
  if(/bone/.test(id)){g.save();g.translate(16,16);g.rotate(-.7);g.beginPath();g.roundRect(-11,-2.5,22,5,2);P_(c);for(const x of [-11,11])for(const y of [-3,3]){g.beginPath();g.arc(x,y,3.2,0,7);P_(c);}g.restore();return;}
  if(/dust/.test(id)){g.beginPath();g.ellipse(16,24,12,5,0,0,7);P_(c);g.beginPath();g.ellipse(16,20,8,6,0,Math.PI,0);P_(c);
    g.fillStyle='rgba(255,255,255,.7)';for(const [x,y] of [[10,10],[20,7],[24,13],[14,5]]){g.beginPath();g.arc(x,y,1.2,0,7);g.fill();}return;}
  if(/core/.test(id)){const gr=g.createRadialGradient(14,13,1,16,16,12);gr.addColorStop(0,'#fff6c0');gr.addColorStop(.5,c);gr.addColorStop(1,shade(c,-.4));
    g.beginPath();g.arc(16,16,10,0,7);P_(gr);return;}
  if(/ore/.test(id)){blob([[6,22],[8,12],[15,6],[24,9],[27,19],[21,27],[11,27]]);P_('#6a5a52');for(const [x,y] of [[13,14],[20,17],[15,22]]){g.beginPath();g.arc(x,y,2.6,0,7);P_(c);}return;}
  if(/glint|shard|crest/.test(id)){blob([[16,3],[24,12],[21,28],[11,28],[8,12]]);P_(c);g.strokeStyle=shade(c,.4);g.beginPath();g.moveTo(16,3);g.lineTo(16,28);g.moveTo(8,12);g.lineTo(24,12);g.stroke();return;}
  if(/fang/.test(id)){g.beginPath();g.moveTo(9,5);g.quadraticCurveTo(24,5,22,10);g.quadraticCurveTo(18,22,13,29);g.quadraticCurveTo(11,16,9,5);P_(c);return;}
  if(/silk|veil/.test(id)){g.beginPath();g.moveTo(6,8);g.quadraticCurveTo(16,3,26,8);g.quadraticCurveTo(22,18,26,27);g.quadraticCurveTo(16,23,6,27);g.quadraticCurveTo(10,18,6,8);P_(c);
    g.strokeStyle='rgba(255,255,255,.5)';g.beginPath();g.moveTo(10,10);g.quadraticCurveTo(14,18,10,24);g.stroke();return;}
  if(/wing/.test(id)){g.beginPath();g.moveTo(5,10);g.quadraticCurveTo(16,4,28,12);g.lineTo(24,16);g.lineTo(26,22);g.lineTo(20,19);g.lineTo(16,25);g.lineTo(13,18);g.lineTo(6,21);g.closePath();P_(c);return;}
  // anything else: a cut gem in the item's colour
  g.beginPath();g.moveTo(16,5);g.lineTo(26,13);g.lineTo(16,28);g.lineTo(6,13);g.closePath();P_(c);g.fillStyle='rgba(255,255,255,.5)';g.beginPath();g.moveTo(16,5);g.lineTo(20,13);g.lineTo(12,13);g.fill();}

function itemIconCanvas(id){if(ICON_CANVAS[id])return ICON_CANVAS[id];const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d');g.scale(2,2);
  try{drawItemIcon(g,id);}catch(e){}ICON_CANVAS[id]=c;return c;}
function itemIconURL(id){if(!ICON_CACHE[id])ICON_CACHE[id]=itemIconCanvas(id).toDataURL();return ICON_CACHE[id];}
// every window's item icon
// items added by later modules (face gear, charms, festival prizes…) are tagged here the first time they are shown
const itemIdOf=it=>{if(!it)return null;if(!it.id)for(const k in ITEMS)if(ITEMS[k]===it){it.id=k;break;}return it.id||null;};
icon=function(it){if(!itemIdOf(it))return `<span class="ico"></span>`;return `<img class="ico img" data-item="${it.id}" src="${itemIconURL(it.id)}" alt="" width="30" height="30">`;};
