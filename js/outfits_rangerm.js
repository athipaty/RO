"use strict";
/* ================= the Ranger masters' own outfits, and boots that show (v1.69.0) =================
   The idea: an advanced calling wears an official outfit (neat, matching, the same on both sides); a master is past
   anyone's rules, so it dresses its own way: mismatched, asymmetric, personal. Drawn through outfitPart (js/outfits.js);
   the body is drawn before the head, so nothing covers the face or face gear, and the big pieces stay away from the bow.
   Nothing hangs past the boot tops (about by+1.4): the boots always show.
     Deadeye    lone drifter sniper: an open midnight coat (longer on one side) over a grey shirt, a red scarf with its
                tail over one shoulder, a hip belt slung at a slant with a pouch, one sleeve rolled up with a wrap, the
                silver crescent pauldron on one shoulder only, mismatched boots (one tall midnight with a silver buckle,
                one wrapped in red)
     Skywarden  free spirit: a white tunic under a sky vest open on one side, the feather mantle on one shoulder only
                (js/masterlook.js), a sky scarf, a gold bead necklace, small feathers on cords at the belt, wraps on one
                arm, shin wraps, light laced boots; its falcon hovers beside it
   Every Ranger calling's boots get a clear colour, a cuff and a toe cap (the uniforms' match their outfit). */
const RANGER_MASTER_LOOKS={
  deadeye:{fam:'rangerm',kit:'night',body:'#6a7488',sleeve:'#1e2848',coat:'#1e2848',coat2:'#141a32',metal:'#dfe6f0',metal2:'#9aa6b8',star:'#8fd4ff',scarf:'#c8282e',scarf2:'#8a1a20',leather:'#4a3428',wrap:'#d8d0c0',pant:'#2a2e40',boot:'#1e2848',tall:1},
  skywarden:{fam:'rangerm',kit:'sky',body:'#f6f4ee',sleeve:'#f6f4ee',vest:'#5aa8e0',vest2:'#2f78b4',sky:'#5aa8e0',gold:'#e8c060',glove:'#8a5a32',cord:'#8a5a32',wrap:'#5aa8e0',pant:'#e8ecf2',boot:'#c89a62',tall:1}};
if(typeof OUTFITS!=='undefined'&&OUTFITS.ranger)Object.assign(OUTFITS.ranger,RANGER_MASTER_LOOKS);
// boots: a cuff band and a toe cap over the boot hero2 draws (roundRect fx-3, fy-7, 6x7)
// (the body covers the boot down to about fy-5.5, and hero2 draws the foot after this, so the band sits in between)
function bootDetail(fx,fy,f,cuff,toe,OL){ctx.fillStyle=cuff;ctx.strokeStyle=OL;ctx.lineWidth=.9;ctx.beginPath();ctx.roundRect(fx-3.4,fy-5.4,6.8,2,.8);ctx.fill();ctx.stroke();
  ctx.fillStyle=toe;ctx.fillRect(fx-2.6,fy-3.3,5.2,.9);}
const RANGER_BOOTS={ranger:['#c8a868','#5a3a22'],sharpshooter:['#e0c070','#173634'],falconer:['#e8dcc0','#4a3020']};
const HEM=1.4; // nothing below by+HEM: the boot tops
function rangerMasterPart(K,part,v){const {x,y,by,f,bk,sway,OL,fs}=v,hip=by+1;
  if(K.kit==='night'){
    if(part==='back'){ // a short quiver at a slant, arrows with glowing fletching
      ctx.save();ctx.translate(x-f*6.4,by-8);ctx.rotate(f*.6);ctx.fillStyle=K.leather;ctx.strokeStyle=OL;ctx.lineWidth=1.1;ctx.beginPath();ctx.roundRect(-3,-9,6,14,2.2);ctx.fill();ctx.stroke();
      ctx.shadowColor=K.star;ctx.shadowBlur=6;ctx.fillStyle=K.star;for(const d of [-1.6,1.4]){ctx.beginPath();ctx.moveTo(d,-14);ctx.lineTo(d+1.2,-10.4);ctx.lineTo(d,-9.4);ctx.lineTo(d-1.2,-10.4);ctx.closePath();ctx.fill();}
      ctx.shadowBlur=0;ctx.restore();return;}
    if(part==='leg'){const {fx,fy,k}=v;
      if(k===f){ctx.fillStyle=K.metal;ctx.strokeStyle=OL;ctx.lineWidth=.8;ctx.beginPath();bootDetail(fx,fy,f,K.metal2,K.coat2,OL);ctx.fillStyle=K.metal;ctx.strokeStyle=OL;ctx.lineWidth=.8;ctx.beginPath();ctx.roundRect(fx-1.4,fy-5.8,2.8,2.8,.6);ctx.fill();ctx.stroke();} // a tall midnight boot, silver buckle
      else{ctx.strokeStyle=K.scarf;ctx.lineWidth=1.3;for(const d of [0,1.6]){ctx.beginPath();ctx.moveTo(fx-3,fy-5.4+d);ctx.lineTo(fx+3,fy-4.6+d);ctx.stroke();} // a boot wrapped in red
        ctx.fillStyle=K.coat2;ctx.strokeStyle=OL;ctx.lineWidth=.9;ctx.beginPath();ctx.ellipse(fx+f*1.6,fy-1.3,2.8,1.7,0,0,7);ctx.fill();ctx.stroke();}
      return;}
    if(part==='arm'){const {sx,sy,hx,hy2,k}=v,ang=Math.atan2(hy2-sy,hx-sx);
      if(k===f){ // the bow arm: sleeve rolled up, a bare forearm with a wrap
        const ex=sx+(hx-sx)*.5,ey=sy+(hy2-sy)*.5;ctx.strokeStyle=OL;ctx.lineWidth=5.6;ctx.beginPath();ctx.moveTo(ex,ey);ctx.lineTo(hx,hy2-1.5);ctx.stroke();
        ctx.strokeStyle='#f0cfae';ctx.lineWidth=3.4;ctx.beginPath();ctx.moveTo(ex,ey);ctx.lineTo(hx,hy2-1.5);ctx.stroke();
        ctx.save();ctx.translate(ex,ey);ctx.rotate(ang);ctx.fillStyle=K.coat2;ctx.strokeStyle=OL;ctx.lineWidth=.9;ctx.beginPath();ctx.roundRect(-2,-3,3.4,6,1.2);ctx.fill();ctx.stroke();ctx.restore();
        ctx.save();ctx.translate(sx+(hx-sx)*.78,sy+(hy2-sy)*.78);ctx.rotate(ang);ctx.strokeStyle=K.wrap;ctx.lineWidth=1.1;for(const d of [-1.2,1]){ctx.beginPath();ctx.moveTo(d-.6,-2.2);ctx.lineTo(d+.6,2.2);ctx.stroke();}ctx.restore();}
      else{ // the far arm: a silver bracer
        ctx.save();ctx.translate(sx+(hx-sx)*.64,sy+(hy2-sy)*.64);ctx.rotate(ang);ctx.fillStyle=K.metal;ctx.strokeStyle=OL;ctx.lineWidth=1;ctx.beginPath();ctx.roundRect(-3.2,-2.8,6.4,5.6,1.6);ctx.fill();ctx.stroke();ctx.fillStyle=K.star;ctx.fillRect(-.6,-1.6,1.2,3.2);ctx.restore();}
      ctx.fillStyle=K.leather;ctx.strokeStyle=OL;ctx.lineWidth=1.1;ctx.beginPath();ctx.ellipse(hx,hy2-1.8,3.2,2.2,0,0,7);ctx.fill();ctx.stroke();return;}
    if(part!=='torso')return;
    const sw=sway*.2;
    // the open coat: the far side to the boot tops, the near side to the belt
    ctx.fillStyle=K.coat;ctx.strokeStyle=OL;ctx.lineWidth=1.1;
    {const k=-f;ctx.beginPath();ctx.moveTo(x+k*1.8,by-14);ctx.lineTo(x+k*8.6,by-14);ctx.quadraticCurveTo(x+k*9.8+sw,by-4,x+k*9.4+sw,by+HEM);ctx.lineTo(x+k*3.6+sw,by+HEM-.6);ctx.quadraticCurveTo(x+k*2.6,by-5,x+k*1.8,by-14);ctx.closePath();fs();}
    {const k=f;ctx.beginPath();ctx.moveTo(x+k*2.4,by-14);ctx.lineTo(x+k*8.6,by-14);ctx.quadraticCurveTo(x+k*9.2,by-7,x+k*8.4,by-2.6);ctx.lineTo(x+k*3.4,by-3.2);ctx.closePath();fs();}
    // a hip belt slung at a slant, a pouch
    ctx.strokeStyle=K.leather;ctx.lineWidth=2.6;ctx.beginPath();ctx.moveTo(x-f*8,by-3.6);ctx.lineTo(x+f*8,by-.8);ctx.stroke();
    ctx.fillStyle=K.metal2;ctx.beginPath();ctx.arc(x-f*2,by-2.6,1.1,0,7);ctx.fill();
    ctx.fillStyle=K.leather;ctx.strokeStyle=OL;ctx.lineWidth=1;ctx.beginPath();ctx.roundRect(x+f*4.2,by-1.6,3.8,3,1);fs();
    // the red scarf at the neck, its tail over the far shoulder
    ctx.fillStyle=K.scarf;ctx.strokeStyle=OL;ctx.lineWidth=1.1;ctx.beginPath();ctx.moveTo(x-8.2,by-12);ctx.quadraticCurveTo(x,by-7,x+8.2,by-12);ctx.lineTo(x+7.4,by-9.4);ctx.quadraticCurveTo(x,by-4.6,x-7.4,by-9.4);ctx.closePath();fs();
    {const w=Math.sin(now*3)*.8,k=-f;ctx.fillStyle=K.scarf2;ctx.beginPath();ctx.moveTo(x+k*5,by-9);ctx.quadraticCurveTo(x+k*8+w,by-4,x+k*7.4+w,by);ctx.lineTo(x+k*5+w,by-.6);ctx.quadraticCurveTo(x+k*5.4,by-4,x+k*3,by-8);ctx.closePath();fs();}
    // the silver crescent pauldron on the far shoulder, a star gem (a personal trophy)
    {const k=-f;ctx.save();ctx.translate(x+k*10.6,by-12.8);ctx.rotate(k*.3);ctx.fillStyle=K.metal;ctx.strokeStyle=OL;ctx.lineWidth=1.3;
      ctx.beginPath();ctx.moveTo(-k*3,-5.6);ctx.quadraticCurveTo(k*9.4,-5.6,k*9.6,2.6);ctx.quadraticCurveTo(k*6,-.4,-k*1.4,1.6);ctx.quadraticCurveTo(-k*5.4,-1.4,-k*3,-5.6);ctx.closePath();fs();
      ctx.shadowColor=K.star;ctx.shadowBlur=6;ctx.fillStyle=K.star;ctx.beginPath();for(let i=0;i<8;i++){const r=i%2?.8:2.2,a=-Math.PI/2+i*Math.PI/4;ctx.lineTo(k*2.4+Math.cos(a)*r,-2.2+Math.sin(a)*r);}ctx.closePath();ctx.fill();ctx.shadowBlur=0;
      ctx.restore();}
    return;}
  if(K.kit==='sky'){
    if(part==='back')return;
    if(part==='leg'){const {fx,fy}=v;
      bootDetail(fx,fy,f,K.gold,'#8a6236',OL);
      ctx.strokeStyle='#5a3a1e';ctx.lineWidth=.7;ctx.beginPath();ctx.moveTo(fx-1.4,fy-3.2);ctx.lineTo(fx+1.4,fy-1.8);ctx.moveTo(fx+1.4,fy-3.2);ctx.lineTo(fx-1.4,fy-1.8);ctx.stroke();return;}
    if(part==='arm'){const {sx,sy,hx,hy2,k}=v,ang=Math.atan2(hy2-sy,hx-sx);
      if(k===-f){ // the far hand: the big falconry glove
        ctx.fillStyle=K.glove;ctx.strokeStyle=OL;ctx.lineWidth=1.1;ctx.beginPath();ctx.ellipse(hx,hy2-2.6,4.4,3.6,0,0,7);ctx.fill();ctx.stroke();
        ctx.strokeStyle=K.gold;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(hx-4,hy2-4.2);ctx.quadraticCurveTo(hx,hy2-5.6,hx+4,hy2-4.2);ctx.stroke();}
      else{ // the near arm: sky wraps
        ctx.save();ctx.translate(sx+(hx-sx)*.66,sy+(hy2-sy)*.66);ctx.rotate(ang);ctx.strokeStyle=K.wrap;ctx.lineWidth=1.3;for(const d of [-2,0,2]){ctx.beginPath();ctx.moveTo(d-.7,-2.4);ctx.lineTo(d+.7,2.4);ctx.stroke();}ctx.restore();
        ctx.fillStyle='#f0e8da';ctx.strokeStyle=OL;ctx.lineWidth=1.1;ctx.beginPath();ctx.ellipse(hx,hy2-1.8,3.2,2.2,0,0,7);ctx.fill();ctx.stroke();}
      return;}
    if(part!=='torso')return;
    const sw=sway*.2;
    // the tunic hem, uneven, to the boot tops
    ctx.fillStyle=K.body;ctx.strokeStyle=OL;ctx.lineWidth=1.1;ctx.beginPath();ctx.moveTo(x-7.8,by-2);ctx.lineTo(x+7.8,by-2);ctx.lineTo(x+7.8+sw,by+HEM-.4);ctx.lineTo(x+2+sw,by+HEM);ctx.lineTo(x-3+sw,by+HEM-.8);ctx.lineTo(x-7.8+sw,by+HEM);ctx.closePath();fs();
    // the sky vest, open: only the far side
    {const k=-f;ctx.fillStyle=K.vest;ctx.beginPath();ctx.moveTo(x+k*2,by-14);ctx.lineTo(x+k*8.6,by-14);ctx.quadraticCurveTo(x+k*9.4,by-6,x+k*8.8,by-.6);ctx.lineTo(x+k*2.8,by-1.4);ctx.closePath();fs();
      ctx.strokeStyle=K.gold;ctx.lineWidth=.9;ctx.beginPath();ctx.moveTo(x+k*2.6,by-12);ctx.lineTo(x+k*3.2,by-2);ctx.stroke();}
    // a sash belt; small feathers on cords at the near hip, clear of the boots
    ctx.fillStyle=K.vest2;ctx.strokeStyle=OL;ctx.lineWidth=1.1;ctx.beginPath();ctx.moveTo(x-8,by-3.6);ctx.quadraticCurveTo(x,by-2.2,x+8,by-3.6);ctx.lineTo(x+8,by-1);ctx.quadraticCurveTo(x,by+.4,x-8,by-1);ctx.closePath();fs();
    for(const [d,len] of [[6.4,3.2],[8.4,4]]){const px=x+f*d,w=Math.sin(now*3+d)*.5;ctx.strokeStyle=K.cord;ctx.lineWidth=.6;ctx.beginPath();ctx.moveTo(px,by-2);ctx.lineTo(px+w,by-1);ctx.stroke();
      ctx.fillStyle='#ffffff';ctx.strokeStyle=OL;ctx.lineWidth=.7;ctx.beginPath();ctx.ellipse(px+w,by-1+len*.5,1,len*.5,f*.3,0,7);ctx.fill();ctx.stroke();
      ctx.fillStyle=K.sky;ctx.beginPath();ctx.arc(px+w,by-1+len*.9,.6,0,7);ctx.fill();}
    // a gold bead necklace and the sky scarf hanging at the near side
    ctx.fillStyle=K.gold;for(let i=-3;i<=3;i++){ctx.beginPath();ctx.arc(x+i*2.2,by-7.2-Math.abs(i)*.55,.85,0,7);ctx.fill();}
    {const w=Math.sin(now*3)*.8,k=f;ctx.fillStyle=K.sky;ctx.strokeStyle=OL;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x+k*4.6,by-12.6);ctx.quadraticCurveTo(x+k*9+w,by-7,x+k*8.6+w,by-2.4);ctx.lineTo(x+k*6.4+w,by-3);ctx.quadraticCurveTo(x+k*6.4,by-7,x+k*2.6,by-11.6);ctx.closePath();fs();}
    return;}
}
if(typeof outfitPart==='function'){const _opRM=outfitPart;outfitPart=function(K,part,v){
  if(K&&K.fam==='rangerm'){ctx.save();ctx.lineJoin='round';ctx.lineCap='round';try{rangerMasterPart(K,part,v);}catch(e){}finally{ctx.restore();ctx.lineWidth=1.5;ctx.strokeStyle=v.OL;}return;}
  const r=_opRM.apply(this,arguments);
  // the uniforms' boots: a cuff and a toe cap in the outfit's colours
  if(K&&K.fam==='ranger'&&part==='leg'){const id=Object.keys(RANGER_BOOTS).find(c=>OUTFITS.ranger[c]===K),b=id&&RANGER_BOOTS[id];if(b){ctx.save();try{bootDetail(v.fx,v.fy,v.f,b[0],b[1],v.OL);}catch(e){}ctx.restore();}}
  return r;};}
