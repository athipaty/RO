"use strict";
/* ================= the Warden masters' own outfits (v1.68.0) =================
   A master calling is the end of a long climb, so it no longer wears its advanced calling's armour in new colours: each
   has its own shapes, drawn through outfitPart (js/outfits.js) like the other families. Kept simple: a few big clean
   shapes and one signature detail each, so it reads at a glance on a phone. The body is drawn before the head, so
   nothing here can cover the face, a hat, a mask or a mouth item.
     Aegis Lord   white-and-gold paladin: big smooth gold pauldrons with a sky gem, a white cuirass edged in gold,
                  a white tabard with a gold sun, gold greaves
     Ravager      asymmetric berserker (one huge pauldron and spike, studded crimson vest, torn sash, wraps); was: big black pauldrons with a glowing crimson seam and a short gold horn, a crimson
                  sash, black plate skirt edged in crimson, black greaves with crimson knees
   (Bulwark keeps its silver plate and tower shield; the Warbringer wears the bare arms, fur and spikes.) */
const WARDEN_MASTER_LOOKS={
  aegislord:{fam:'wardenm',kit:'sun',body:'#f6f3ec',sleeve:'#f6f3ec',metal:'#e8b93a',metal2:'#b8861e',gem:'#4aa8ff',cloth:'#ffffff',edge:'#e8b93a',pant:'#e4dccb',boot:'#c8962a',tall:1},
  ravager:{fam:'wardenm',kit:'war',body:'#9a2228',sleeve:'#4a2e24',metal:'#5a606e',metal2:'#3a3e48',leather:'#4a2e20',stud:'#f0c860',wrap:'#d8d0c0',cloth:'#b0141f',edge:'#c8283a',spike:'#e0d6c0',pant:'#2a1e1c',boot:'#1e1410',tall:1}};
if(typeof OUTFITS!=='undefined')OUTFITS.warden=WARDEN_MASTER_LOOKS;
/* the Aegis Lord's sun shield, held in the off hand: big and round (the Bulwark's is a grey upright slab), a thick gold
   rim, a white face, gold rays to the rim, a glowing sky gem at the boss and a slow shine; the hand is drawn over its middle */
function aegisShield(cx,cy,R,K){const OL='#2a1c14';ctx.save();ctx.translate(cx,cy);ctx.scale(.86,1);
  ctx.fillStyle=K.metal;ctx.strokeStyle=OL;ctx.lineWidth=1.6;ctx.beginPath();ctx.arc(0,0,R,0,7);ctx.fill();ctx.stroke();
  ctx.fillStyle='#fbf8f0';ctx.lineWidth=1;ctx.beginPath();ctx.arc(0,0,R-3,0,7);ctx.fill();ctx.stroke();
  ctx.fillStyle=K.metal;for(let i=0;i<8;i++){ctx.save();ctx.rotate(i*Math.PI/4);ctx.beginPath();ctx.moveTo(-1.5,-4.2);ctx.lineTo(0,-(R-3.2));ctx.lineTo(1.5,-4.2);ctx.closePath();ctx.fill();ctx.restore();}
  ctx.fillStyle=K.metal;ctx.strokeStyle=OL;ctx.lineWidth=1.1;ctx.beginPath();ctx.arc(0,0,4.4,0,7);ctx.fill();ctx.stroke();
  ctx.shadowColor=K.gem;ctx.shadowBlur=7;ctx.fillStyle=K.gem;ctx.beginPath();ctx.arc(0,0,2.3,0,7);ctx.fill();ctx.shadowBlur=0;
  ctx.save();ctx.beginPath();ctx.arc(0,0,R-3,0,7);ctx.clip();const s=((now*.35)%1)*2-1;ctx.globalAlpha=.35*(1-Math.abs(s));ctx.fillStyle='#ffffff';ctx.rotate(-.6);ctx.fillRect(s*R*1.4-2.5,-R,5,R*2);ctx.restore();
  ctx.restore();}
/* the Ravager: an asymmetric berserker. One huge black-iron pauldron with a single curved spike on the far shoulder
   (the sword shoulder only a strap and an iron ring, so the blade stays clear), a dark crimson studded leather vest with a strap across it, a torn
   crimson sash at one hip, leather strips with iron tips, dark leather sleeves with pale wraps and an iron bracer on the
   sword arm, heavy boots with iron toes */
function ravagerPart(K,part,v){const {x,y,by,f,bk,sway,OL,fs}=v,hip=by+1;
  if(part==='leg'){const {fx,fy,k}=v,ky=(hip-2+fy-2.5)/2;
    ctx.strokeStyle=K.wrap;ctx.lineWidth=1.2;for(const d of [0,1.6]){ctx.beginPath();ctx.moveTo(fx-3,ky+d);ctx.lineTo(fx+3,ky+d+.8);ctx.stroke();}
    ctx.fillStyle=K.metal;ctx.strokeStyle=OL;ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(fx+f*1.6,fy-1.2,2.6,1.8,0,0,7);fs();return;}
  if(part==='arm'){const {sx,sy,hx,hy2,k}=v,ang=Math.atan2(hy2-sy,hx-sx);
    // pale wraps round the forearm
    ctx.save();ctx.translate(sx+(hx-sx)*.66,sy+(hy2-sy)*.66);ctx.rotate(ang);ctx.strokeStyle=K.wrap;ctx.lineWidth=1.3;for(const d of [-2.2,0,2.2]){ctx.beginPath();ctx.moveTo(d-.8,-2.4);ctx.lineTo(d+.8,2.4);ctx.stroke();}
    // the sword arm: an iron bracer
    if(k===f){ctx.fillStyle=K.metal;ctx.strokeStyle=OL;ctx.lineWidth=1;ctx.beginPath();ctx.roundRect(-4.2,-2.8,3.6,5.6,1);fs();}
    ctx.restore();ctx.fillStyle=K.leather;ctx.strokeStyle=OL;ctx.lineWidth=1.1;ctx.beginPath();ctx.ellipse(hx,hy2-1.8,3.4,2.3,0,0,7);fs();return;}
  if(part!=='torso')return;
  // studs on the vest (below the chin) and the strap across it
  ctx.fillStyle=K.stud;for(const [a,b] of [[-6,-8.4],[-3,-7],[3,-7],[6,-8.4],[-5.4,-4.6],[5.4,-4.6]]){ctx.beginPath();ctx.arc(x+a,by+b,1.05,0,7);ctx.fill();}
  ctx.strokeStyle=K.leather;ctx.lineWidth=2.4;ctx.beginPath();ctx.moveTo(x+f*8,by-13);ctx.lineTo(x-f*7,by-1.5);ctx.stroke();
  ctx.strokeStyle=OL;ctx.lineWidth=.6;ctx.beginPath();ctx.moveTo(x+f*8.4,by-12);ctx.lineTo(x-f*6.4,by-.6);ctx.stroke();
  // leather strips with iron tips
  for(const a of [-6.2,-3.1,3.1,6.2]){const sx2=x+a+sway*.15;ctx.fillStyle=K.leather;ctx.strokeStyle=OL;ctx.lineWidth=.9;ctx.beginPath();ctx.roundRect(sx2-1.3,by-.6,2.6,2.2,.6);fs();
    ctx.fillStyle=K.metal;ctx.beginPath();ctx.moveTo(sx2-1.3,by+1.2);ctx.lineTo(sx2+1.3,by+1.2);ctx.lineTo(sx2,by+2.6);ctx.closePath();fs();} // (v1.69.2) short: the boots show
  // the belt, an iron ring buckle
  ctx.fillStyle=K.leather;ctx.strokeStyle=OL;ctx.lineWidth=1.1;ctx.beginPath();ctx.roundRect(x-8,by-2.6,16,3,1);fs();
  ctx.strokeStyle=K.metal;ctx.lineWidth=1.4;ctx.beginPath();ctx.arc(x,by-1.1,1.6,0,7);ctx.stroke();
  // the torn crimson sash hanging at the sword-side hip
  {const sx2=x+f*5.6,w=Math.sin(now*3)*.8+sway*.4;ctx.fillStyle=K.cloth;ctx.strokeStyle=OL;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(sx2-2,by-1);ctx.lineTo(sx2+2,by-1);
    ctx.quadraticCurveTo(sx2+2.6+w,by+.6,sx2+2.2+w,by+2.2);ctx.lineTo(sx2+.8+w,by+1.4);ctx.lineTo(sx2-.4+w,by+2.6);ctx.lineTo(sx2-1.6+w,by+1.6);ctx.quadraticCurveTo(sx2-2.4+w*.6,by+.4,sx2-2,by-1);ctx.closePath();fs();}
  // the sword shoulder: only a strap and an iron ring (nothing in the blade's way)
  {const k=f;ctx.strokeStyle=K.leather;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x+k*6,by-15);ctx.quadraticCurveTo(x+k*10,by-13.6,x+k*10.4,by-10);ctx.stroke();
    ctx.strokeStyle=K.metal;ctx.lineWidth=1.3;ctx.beginPath();ctx.arc(x+k*10.2,by-12.4,1.5,0,7);ctx.stroke();}
  // the far shoulder: one huge black-iron pauldron, three plates, a single curved spike
  {const k=-f;ctx.save();ctx.translate(x+k*11,by-12.2);ctx.rotate(k*.3);
    for(let i=2;i>=0;i--){ctx.fillStyle=i===0?K.metal:K.metal2;ctx.strokeStyle=OL;ctx.lineWidth=1.3;ctx.beginPath();ctx.ellipse(k*.6*i,i*2.8,9.6-i*1.2,6-i*.8,0,Math.PI,0);ctx.quadraticCurveTo(k*.6*i,i*2.8+3.2,-(9.6-i*1.2)+k*.6*i,i*2.8);ctx.closePath();fs();}
    ctx.strokeStyle=K.edge;ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(-8.6,.4);ctx.quadraticCurveTo(0,3,8.6,.4);ctx.stroke();
    ctx.strokeStyle='rgba(255,255,255,.45)';ctx.lineWidth=1.1;ctx.beginPath();ctx.ellipse(0,0,7.6,4.6,0,Math.PI*1.15,Math.PI*1.75);ctx.stroke();
    ctx.fillStyle=K.stud;for(const d of [-5,0,5]){ctx.beginPath();ctx.arc(d,-1.4+Math.abs(d)*.25,.9,0,7);ctx.fill();}
    ctx.fillStyle=K.spike;ctx.strokeStyle=OL;ctx.lineWidth=1.1;ctx.beginPath();ctx.moveTo(k*1.2,-5);ctx.quadraticCurveTo(k*5.6,-8,k*9.4,-12.6);ctx.quadraticCurveTo(k*6.6,-6.6,k*5.4,-3.6);ctx.closePath();fs();
    ctx.restore();}
}
function wardenMasterPart(K,part,v){const {x,y,by,f,bk,sway,OL,fs}=v,hip=by+1,war=K.kit==='war';
  if(part==='back')return;
  if(war){ravagerPart(K,part,v);return;}
  if(part==='leg'){const {fx,fy,k}=v,kx=(x+k*3.6+fx)/2,ky=(hip-2+fy-2.5)/2;
    // a greave from the knee to the boot, a round knee cop
    ctx.fillStyle=war?K.metal:K.metal;ctx.strokeStyle=OL;ctx.lineWidth=1;ctx.beginPath();ctx.roundRect(fx-3.2,ky,6.4,fy-ky-3,1.8);fs();
    ctx.fillStyle=war?K.edge:K.metal2;ctx.beginPath();ctx.arc(kx,ky,2.5,0,7);fs();return;}
  if(part==='arm'&&!war&&v.k===-f&&!bk){aegisShield(v.hx-f*2.5,v.hy2-3,13.5,K);return;} // the off hand holds the sun shield (the head is drawn after it)
  if(part==='arm'){const {sx,sy,hx,hy2}=v,ang=Math.atan2(hy2-sy,hx-sx),mx=sx+(hx-sx)*.62,my=sy+(hy2-sy)*.62;
    // one smooth vambrace and a plain gauntlet
    ctx.save();ctx.translate(mx,my);ctx.rotate(ang);ctx.fillStyle=K.metal;ctx.strokeStyle=OL;ctx.lineWidth=1;ctx.beginPath();ctx.roundRect(-3.4,-3,6.8,6,1.8);fs();ctx.restore();
    ctx.fillStyle=war?K.metal2:K.metal;ctx.strokeStyle=OL;ctx.lineWidth=1.1;ctx.beginPath();ctx.ellipse(hx,hy2-1.8,3.5,2.4,0,0,7);fs();return;}
  if(part!=='torso')return;
  // the cuirass: one clean edge line under the chin
  ctx.strokeStyle=K.edge;ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(x-8.4,by-9.5);ctx.quadraticCurveTo(x,by-4.5,x+8.4,by-9.5);ctx.stroke();
  // the skirt: two plain plates at the sides
  for(const k of [-1,1]){ctx.fillStyle=war?K.metal:K.metal;ctx.strokeStyle=OL;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x+k*2.6,by);ctx.lineTo(x+k*8,by);ctx.lineTo(x+k*8.6,by+1.8);ctx.lineTo(x+k*3,by+1.8);ctx.closePath();fs();
    ctx.strokeStyle=K.edge;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x+k*3.4,by+1);ctx.lineTo(x+k*8.2,by+1);ctx.stroke();} // (v1.69.2) to the boot tops
  // the tabard (Aegis Lord: white with a gold sun) or the sash tail (Warbringer: crimson)
  ctx.fillStyle=K.cloth;ctx.strokeStyle=OL;ctx.lineWidth=1.1;ctx.beginPath();ctx.moveTo(x-3,by);ctx.lineTo(x+3,by);ctx.lineTo(x+2.8+sway*.2,by+2);ctx.lineTo(x+sway*.2,by+3);ctx.lineTo(x-2.8+sway*.2,by+2);ctx.closePath();fs();
  if(!war){ctx.fillStyle=K.metal;ctx.beginPath();ctx.arc(x+sway*.1,by+1,1.1,0,7);ctx.fill();}
  // the belt (gold / crimson) and its gem
  ctx.fillStyle=war?K.cloth:K.metal;ctx.strokeStyle=OL;ctx.lineWidth=1.1;ctx.beginPath();ctx.roundRect(x-7.8,by-2.4,15.6,2.8,1);fs();
  ctx.fillStyle=war?K.horn:K.gem;ctx.beginPath();ctx.arc(x,by-1,1.4,0,7);fs();
  if(!war){ctx.strokeStyle=OL;ctx.lineWidth=3.6;ctx.beginPath();ctx.moveTo(x-f*8.4,by-12.4);ctx.lineTo(x+f*7.4,by-2.6);ctx.stroke();ctx.strokeStyle=K.gem;ctx.lineWidth=2.2;ctx.stroke();} // a sky sash: a master wears it its own way
  // the pauldrons: one big smooth plate each side (the signature)
  for(const k of [-1,1]){const nearS=k===f;ctx.save();ctx.translate(x+k*10.4,by-12.6);ctx.rotate(k*.32);if(nearS)ctx.scale(.74,.74); // mismatched: a big gold plate on the shield side, a small white one on the sword side
    ctx.fillStyle=nearS?K.cloth:K.metal;ctx.strokeStyle=OL;ctx.lineWidth=1.3;ctx.beginPath();ctx.ellipse(0,0,7,4.8,0,Math.PI,0);ctx.lineTo(7,1.2);ctx.quadraticCurveTo(0,3.4,-7,1.2);ctx.closePath();fs();
    ctx.fillStyle='rgba(255,255,255,.28)';ctx.beginPath();ctx.ellipse(-k*1.6,-2.2,3,1.1,0,0,7);ctx.fill();
    if(war){ // a glowing crimson seam and a short gold horn
      ctx.save();ctx.globalAlpha=.65+.35*Math.sin(now*3+k);ctx.strokeStyle=K.gem;ctx.shadowColor=K.gem;ctx.shadowBlur=5;ctx.lineWidth=1.1;ctx.beginPath();ctx.moveTo(-6,.6);ctx.quadraticCurveTo(0,2.6,6,.6);ctx.stroke();ctx.restore();
      ctx.fillStyle=K.horn;ctx.strokeStyle=OL;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(k*2,-4.2);ctx.quadraticCurveTo(k*6,-6,k*7.6,-9);ctx.quadraticCurveTo(k*4.6,-6.6,k*-.6,-4.4);ctx.closePath();fs();}
    else{ // a gold rim and a sky gem
      ctx.strokeStyle=K.metal2;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(-6.4,.8);ctx.quadraticCurveTo(0,2.8,6.4,.8);ctx.stroke();
      ctx.fillStyle=K.gem;ctx.shadowColor=K.gem;ctx.shadowBlur=4;ctx.strokeStyle=OL;ctx.lineWidth=.8;ctx.beginPath();ctx.arc(0,-1.4,1.7,0,7);fs();ctx.shadowBlur=0;}
    ctx.restore();}
}
if(typeof outfitPart==='function'){const _opW=outfitPart;outfitPart=function(K,part,v){if(!K||K.fam!=='wardenm')return _opW.apply(this,arguments);
  ctx.save();ctx.lineJoin='round';ctx.lineCap='round';try{wardenMasterPart(K,part,v);}catch(e){}finally{ctx.restore();ctx.lineWidth=1.5;ctx.strokeStyle=v.OL;}};}
