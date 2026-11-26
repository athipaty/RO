"use strict";
/* ================= the Novice in a tank top (v1.70.3) =================
   The Novice wears a cream sleeveless tank top: shoulder straps over bare shoulders and arms, a scoop neckline, a rope
   belt, its brown trousers and boots; nothing behind. Drawn through outfitPart (js/outfits.js); the body is drawn
   before the head, so nothing covers the face. */
const NOVICE_LOOK={fam:'novice',kit:'tank',body:'#f2ece0',sleeve:'skin',trim:'#d8ccb4',rope:'#b8925a',pant:'#5a4632',boot:'#4a3020',tall:1};
if(typeof OUTFITS!=='undefined')OUTFITS.novice={novice:NOVICE_LOOK};
if(typeof outfitPart==='function'){const _opN=outfitPart;outfitPart=function(K,part,v){if(!K||K.fam!=='novice')return _opN.apply(this,arguments);
  if(part!=='torso')return;const {x,by,f,sway,OL,fs,skin}=v;ctx.save();ctx.lineJoin='round';ctx.lineCap='round';
  try{const sk=skin||'#f6d6b8';
    // bare shoulders outside the straps, and the arm holes
    for(const k of [-1,1]){ctx.fillStyle=sk;ctx.strokeStyle=OL;ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(x+k*5.4,by-15.6);ctx.quadraticCurveTo(x+k*9.8,by-15,x+k*9.4,by-11);ctx.lineTo(x+k*7.6,by-8.6);ctx.quadraticCurveTo(x+k*6,by-11.6,x+k*5.4,by-15.6);ctx.closePath();ctx.fill();ctx.stroke();}
    // the straps and a scoop neckline (its top is under the chin)
    for(const k of [-1,1]){ctx.strokeStyle=OL;ctx.lineWidth=3.4;ctx.beginPath();ctx.moveTo(x+k*4.6,by-15.8);ctx.quadraticCurveTo(x+k*6,by-12,x+k*7.4,by-8.8);ctx.stroke();ctx.strokeStyle=K.body;ctx.lineWidth=2;ctx.stroke();}
    ctx.strokeStyle=K.trim;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x-4.4,by-12);ctx.quadraticCurveTo(x,by-7.4,x+4.4,by-12);ctx.stroke();
    // a rope belt with a knot and a loose end
    ctx.strokeStyle=OL;ctx.lineWidth=2.6;ctx.beginPath();ctx.moveTo(x-7.6,by-2);ctx.quadraticCurveTo(x,by-.6,x+7.6,by-2);ctx.stroke();ctx.strokeStyle=K.rope;ctx.lineWidth=1.4;ctx.stroke();
    ctx.fillStyle=K.rope;ctx.strokeStyle=OL;ctx.lineWidth=.8;ctx.beginPath();ctx.arc(x+f*3,by-1.3,1.2,0,7);ctx.fill();ctx.stroke();
    ctx.strokeStyle=K.rope;ctx.lineWidth=1.1;ctx.beginPath();ctx.moveTo(x+f*3,by-.4);ctx.lineTo(x+f*3.6+sway*.3,by+1.6);ctx.stroke();}
  catch(e){}finally{ctx.restore();ctx.lineWidth=1.5;ctx.strokeStyle=v.OL;}};}
