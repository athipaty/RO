"use strict";
/* ================= the Ranger family's outfits (v1.24.0) =================
   Drawn through outfitPart (js/outfits.js) like the Arcanist family. Each job has its own shapes:
     Ranger        woodland scout: a short green hooded cloak (hood down), a laced leather jerkin, a bow-arm bracer, belt pouches
     Sharpshooter  marksman: a long coat split at the back, a half cape on one shoulder, a bandolier of arrows, a high collar
     Wildstalker   beast hunter: a fur mantle with an eared hood, bare painted arms with wraps, a tooth necklace, a leaf kilt
     Falconer      a padded coat with a feather collar, a leather perch pad on one shoulder, a falconry glove, a feather-tipped cape */
const RANGER_LOOKS={
  ranger:{fam:'ranger',kit:'scout',body:'#6b4a2c',sleeve:'#3f6a3a',cloak:'#3f7a46',cloak2:'#2e5a34',leather:'#7a5432',trim:'#c8a868',pant:'#4a3a28',boot:'#5a3a22',tall:1},
  sharpshooter:{fam:'ranger',kit:'marksman',body:'#1f3e3a',sleeve:'#1f3e3a',coat:'#24504a',coat2:'#173634',leather:'#5a3a22',trim:'#e0c070',pant:'#2a2a2a',boot:'#2a1e16',tall:1},
  wildstalker:{fam:'ranger',kit:'beast',body:'#6a5030',sleeve:'skin',fur:'#8a6a44',fur2:'#5e4628',leather:'#5a3e22',paint:'#5aa040',pant:'#4a3a22',boot:'#4a3420'},
  falconer:{fam:'ranger',kit:'falcon',body:'#7a5434',sleeve:'#6a4a2a',coat:'#7a5434',pad:'#5a3a1e',feather:'#e8dcc0',trim:'#d8a850',pant:'#4a3a28',boot:'#4a3020',tall:1}};
if(typeof OUTFITS!=='undefined')OUTFITS.ranger=RANGER_LOOKS;
// a quiver on the back
function outfitQuiver(x,by,f,body,band,OL,fs,rough){ctx.save();ctx.translate(x-f*7,by-9);ctx.rotate(f*.4);ctx.fillStyle=body;ctx.strokeStyle=OL;ctx.lineWidth=1.2;ctx.beginPath();
  if(rough){ctx.moveTo(-3.6,5);ctx.lineTo(-3.2,-13);ctx.lineTo(3.4,-13);ctx.lineTo(3.8,5);ctx.closePath();}else ctx.roundRect(-3.5,-13,7,18,2.5);fs();
  ctx.fillStyle='#e8e0d0';for(const k of [-2,0,2]){ctx.beginPath();ctx.moveTo(k,-13);ctx.lineTo(k-1.6,-18);ctx.lineTo(k+1.6,-18);ctx.closePath();ctx.fill();}
  ctx.fillStyle=band;ctx.fillRect(-3.5,-11,7,1.6);ctx.fillRect(-3.5,1,7,1.6);ctx.restore();}
function rangerPart(K,part,v){const {x,y,by,f,bk,sway,OL,fs}=v;
  if(part==='back'){
    if(K.kit==='scout'){
      ctx.fillStyle=K.cloak;ctx.strokeStyle=OL;ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(x-9,by-15);ctx.lineTo(x+9,by-15);ctx.quadraticCurveTo(x+12-f*2,by-5,x+10-f*3+sway,by+3);
      for(let i=1;i<6;i++){const u=i/6;ctx.lineTo(x+10-f*3+sway-u*20,by+3+(i%2?2:0));}ctx.lineTo(x-10-f*3+sway,by+3);ctx.quadraticCurveTo(x-12-f*2,by-5,x-9,by-15);ctx.closePath();fs();
      outfitQuiver(x,by,f,'#6b4423','#c84a3a',OL,fs);
      ctx.fillStyle=K.cloak2;ctx.strokeStyle=OL;ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(x-6.6,by-16);ctx.quadraticCurveTo(x-f*2,by-7,x+6.6,by-16);ctx.quadraticCurveTo(x,by-13,x-6.6,by-16);ctx.closePath();fs();}
    else if(K.kit==='marksman'){
      for(const k of [-1,1]){ctx.fillStyle=K.coat2;ctx.strokeStyle=OL;ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(x+k*1,by-3);ctx.lineTo(x+k*8.4,by-3);ctx.quadraticCurveTo(x+k*10.4,by+8,x+k*9.6-f*2+sway,y+1.6);ctx.lineTo(x+k*2-f+sway*.5,y+.4);ctx.closePath();fs();}
      outfitQuiver(x,by,f,'#3a2a1a',K.trim,OL,fs);
      const k=-f;ctx.fillStyle=K.coat;ctx.strokeStyle=OL;ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(x-k*2,by-16);ctx.quadraticCurveTo(x+k*12,by-15,x+k*13+sway*.6,by-2);ctx.lineTo(x+k*6+sway*.4,by);ctx.quadraticCurveTo(x+k*6,by-10,x-k*2,by-13);ctx.closePath();fs();
      ctx.strokeStyle=K.trim;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x+k*12.6+sway*.6,by-2.6);ctx.lineTo(x+k*6.4+sway*.4,by-.6);ctx.stroke();}
    else if(K.kit==='beast'){
      outfitQuiver(x,by,f,'#5a4026','#a8c060',OL,fs,true);
      ctx.fillStyle=K.fur;ctx.strokeStyle=OL;ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(x-10,by-15);ctx.lineTo(x+10,by-15);
      for(let i=0;i<=8;i++){const u=i/8;ctx.lineTo(x+11-u*22+sway*.5,by-4+(i%2?2.4:0));}ctx.closePath();fs();
      ctx.fillStyle=K.fur2;ctx.beginPath();ctx.moveTo(x-6.4,by-16);ctx.quadraticCurveTo(x-f*2,by-6.6,x+6.4,by-16);ctx.closePath();fs();
      for(const k of [-1,1]){ctx.fillStyle=K.fur2;ctx.beginPath();ctx.moveTo(x+k*3,by-15);ctx.lineTo(x+k*6,by-21);ctx.lineTo(x+k*7.4,by-14.6);ctx.closePath();fs();
        ctx.fillStyle='#d8a890';ctx.beginPath();ctx.moveTo(x+k*4.4,by-15.4);ctx.lineTo(x+k*6,by-19);ctx.lineTo(x+k*6.6,by-15.2);ctx.closePath();ctx.fill();}}
    else if(K.kit==='falcon'){
      ctx.fillStyle=K.coat;ctx.strokeStyle=OL;ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(x-9,by-15);ctx.lineTo(x+9,by-15);ctx.quadraticCurveTo(x+12-f*2,by-2,x+11-f*3+sway,by+7);ctx.lineTo(x-11-f*3+sway,by+7);ctx.quadraticCurveTo(x-12-f*2,by-2,x-9,by-15);ctx.closePath();fs();
      for(let i=0;i<7;i++){const fx2=x-10.5-f*3+sway+i*3.5;ctx.fillStyle=i%2?K.feather:'#a8885a';ctx.strokeStyle=OL;ctx.lineWidth=.8;ctx.beginPath();ctx.ellipse(fx2,by+8.4,1.7,3.2,.2,0,7);fs();}
      outfitQuiver(x,by,f,'#5a3a1e',K.trim,OL,fs);}}
  else if(part==='arm'){const {sx,sy,hx,hy2,k}=v,ang=Math.atan2(hy2-sy,hx-sx);
    if(K.kit==='scout'&&k===-f){ctx.translate(sx+(hx-sx)*.66,sy+(hy2-sy)*.66);ctx.rotate(ang);ctx.fillStyle=K.leather;ctx.strokeStyle=OL;ctx.lineWidth=1;ctx.beginPath();ctx.roundRect(-3,-2.6,6,5.2,1.4);fs();
      ctx.strokeStyle=K.trim;ctx.lineWidth=.7;ctx.beginPath();ctx.moveTo(-1.6,-2.2);ctx.lineTo(-1.6,2.2);ctx.moveTo(1,-2.2);ctx.lineTo(1,2.2);ctx.stroke();}
    else if(K.kit==='marksman'&&k===-f){ctx.translate(sx+(hx-sx)*.55,sy+(hy2-sy)*.55);ctx.rotate(ang);ctx.fillStyle=K.leather;ctx.strokeStyle=OL;ctx.lineWidth=1;ctx.beginPath();ctx.roundRect(-5,-2.4,10,4.8,1.6);fs();ctx.fillStyle=K.trim;ctx.fillRect(-4,-.4,8,.8);}
    else if(K.kit==='beast'){ctx.save();ctx.translate(sx+(hx-sx)*.35,sy+(hy2-sy)*.35);ctx.rotate(ang);ctx.strokeStyle=K.paint;ctx.lineWidth=1;for(const o of [-1.4,.6]){ctx.beginPath();ctx.moveTo(o,-1.8);ctx.lineTo(o+1.2,1.8);ctx.stroke();}ctx.restore();
      ctx.translate(sx+(hx-sx)*.75,sy+(hy2-sy)*.75);ctx.rotate(ang);ctx.fillStyle=K.leather;ctx.strokeStyle=OL;ctx.lineWidth=.8;ctx.beginPath();ctx.roundRect(-2,-2.4,4,4.8,.8);fs();}
    else if(K.kit==='falcon'&&k===-f){ctx.translate(hx,hy2-1);ctx.fillStyle=K.pad;ctx.strokeStyle=OL;ctx.lineWidth=1.1;ctx.beginPath();ctx.roundRect(-4.2,-6.4,8.4,7.6,2.4);fs();ctx.strokeStyle=K.trim;ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(-3.6,-5);ctx.lineTo(3.6,-5);ctx.stroke();}}
  else if(part==='leg'){const {fx,fy}=v;
    if(K.kit==='scout'){ctx.fillStyle=K.cloak;ctx.strokeStyle=OL;ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(fx-3,fy-7);ctx.lineTo(fx,fy-9.4);ctx.lineTo(fx+3,fy-7);ctx.closePath();fs();}
    else if(K.kit==='beast'){ctx.fillStyle=K.fur;ctx.strokeStyle=OL;ctx.lineWidth=.9;ctx.beginPath();for(let i=0;i<=5;i++)ctx.lineTo(fx-3.4+i*1.36,fy-5.4-(i%2?1.4:0));ctx.lineTo(fx+3.2,fy-4);ctx.lineTo(fx-3.2,fy-4);ctx.closePath();fs();}
    else{ctx.fillStyle=K.trim;ctx.fillRect(fx-2.8,fy-6.6,5.6,.9);}}
  else if(part==='torso'&&!bk){const {hip}=v;
    if(K.kit==='scout'){
      ctx.fillStyle=K.leather;ctx.strokeStyle=OL;ctx.lineWidth=1.1;for(const k of [-1,1]){ctx.beginPath();ctx.moveTo(x+k*1.4,by-14.4);ctx.lineTo(x+k*7.4,by-13);ctx.lineTo(x+k*7.6,hip);ctx.lineTo(x+k*1.6,hip);ctx.closePath();fs();}
      ctx.strokeStyle=K.trim;ctx.lineWidth=.8;for(let i=0;i<4;i++){ctx.beginPath();ctx.moveTo(x-1.4,by-12+i*3);ctx.lineTo(x+1.4,by-10.6+i*3);ctx.moveTo(x+1.4,by-12+i*3);ctx.lineTo(x-1.4,by-10.6+i*3);ctx.stroke();}
      ctx.fillStyle='#4a2e1a';ctx.strokeStyle=OL;ctx.lineWidth=1.1;ctx.beginPath();ctx.roundRect(x-7.8,by-2.4,15.6,2.8,1);fs();
      for(const a of [-5,5]){ctx.fillStyle=K.leather;ctx.beginPath();ctx.roundRect(x+a-1.8,by-.2,3.6,3.6,1);fs();}
      ctx.fillStyle=K.cloak;ctx.beginPath();ctx.moveTo(x-9,by-15.4);ctx.quadraticCurveTo(x,by-12.4,x+9,by-15.4);ctx.lineTo(x+8,by-13);ctx.quadraticCurveTo(x,by-10,x-8,by-13);ctx.closePath();fs();
      ctx.fillStyle=K.trim;ctx.beginPath();ctx.arc(x,by-12.6,1.2,0,7);fs();}
    else if(K.kit==='marksman'){
      for(const k of [-1,1]){ctx.fillStyle=K.coat;ctx.strokeStyle=OL;ctx.lineWidth=1.1;ctx.beginPath();ctx.moveTo(x+k*2,hip);ctx.lineTo(x+k*8,hip);ctx.lineTo(x+k*9.2+sway*.3,y-2.4);ctx.lineTo(x+k*3.4+sway*.3,y-2);ctx.closePath();fs();
        ctx.strokeStyle=K.trim;ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(x+k*3.4+sway*.3,y-2.6);ctx.lineTo(x+k*2.1,hip+.4);ctx.stroke();}
      ctx.strokeStyle='#3a2414';ctx.lineWidth=2.4;ctx.beginPath();ctx.moveTo(x-f*7,by-14);ctx.lineTo(x+f*6.6,by-1.4);ctx.stroke();
      for(let i=0;i<4;i++){const t=.18+i*.2,px=x-f*7+(f*13.6)*t,py=by-14+12.6*t;ctx.fillStyle='#e8e0d0';ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(px-1.2,py-3);ctx.lineTo(px+1.2,py-3);ctx.closePath();ctx.fill();ctx.fillStyle='#c84a3a';ctx.fillRect(px-.9,py-1.4,1.8,.9);}
      ctx.fillStyle='#1a1a1a';ctx.strokeStyle=OL;ctx.lineWidth=1.1;ctx.beginPath();ctx.roundRect(x-7.6,by-2.4,15.2,2.6,1);fs();ctx.fillStyle=K.trim;ctx.beginPath();ctx.roundRect(x-1.6,by-2.8,3.2,3.4,.6);fs();
      for(const k of [-1,1]){ctx.fillStyle=K.coat;ctx.beginPath();ctx.moveTo(x+k*2.6,by-15.6);ctx.lineTo(x+k*7.6,by-19.4);ctx.lineTo(x+k*7.6,by-14.4);ctx.closePath();fs();}}
    else if(K.kit==='beast'){
      ctx.fillStyle=K.leather;ctx.strokeStyle=OL;ctx.lineWidth=1.1;ctx.beginPath();ctx.moveTo(x-7,by-14);ctx.lineTo(x-2.2,by-14);ctx.lineTo(x-1.6,by-3);ctx.lineTo(x-7.4,by-3);ctx.closePath();fs();ctx.beginPath();ctx.moveTo(x+7,by-14);ctx.lineTo(x+2.2,by-14);ctx.lineTo(x+1.6,by-3);ctx.lineTo(x+7.4,by-3);ctx.closePath();fs();
      for(let i=0;i<6;i++){const u=-6+i*2.4,sw2=sway*.25*(i%2?1:-1);ctx.fillStyle=i%2?'#5a8a3a':K.fur;ctx.strokeStyle=OL;ctx.lineWidth=.9;ctx.beginPath();ctx.moveTo(x+u-1.4,by-1);ctx.quadraticCurveTo(x+u-1.8+sw2,hip+3,x+u+sw2,hip+5.6);ctx.quadraticCurveTo(x+u+1.8+sw2,hip+3,x+u+1.4,by-1);ctx.closePath();fs();}
      ctx.fillStyle='#4a3020';ctx.strokeStyle=OL;ctx.lineWidth=1;ctx.beginPath();ctx.roundRect(x-7.6,by-2.4,15.2,2.4,1);fs();
      for(const [a,c] of [[-5.6,'#e8dcc0'],[5.4,'#c84a3a']]){ctx.fillStyle=c;ctx.beginPath();ctx.ellipse(x+a,by+2.4,1,3,a>0?-.3:.3,0,7);fs();}
      ctx.strokeStyle='#8a6a44';ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(x-5.6,by-15);ctx.quadraticCurveTo(x,by-10.6,x+5.6,by-15);ctx.stroke();
      for(let i=0;i<5;i++){const u=(i-2)/2,px=x+u*4.4,py=by-12.6+Math.abs(u)*-1.6;ctx.fillStyle='#f0e8d4';ctx.strokeStyle=OL;ctx.lineWidth=.6;ctx.beginPath();ctx.moveTo(px-.9,py);ctx.lineTo(px,py+2.6);ctx.lineTo(px+.9,py);ctx.closePath();fs();}}
    else if(K.kit==='falcon'){
      ctx.strokeStyle='rgba(0,0,0,.22)';ctx.lineWidth=.8;for(const yy of [-11,-8,-5]){ctx.beginPath();ctx.moveTo(x-6.6,by+yy);ctx.lineTo(x+6.6,by+yy);ctx.stroke();}
      ctx.fillStyle='#4a2e18';ctx.strokeStyle=OL;ctx.lineWidth=1.1;ctx.beginPath();ctx.roundRect(x-7.8,by-2.4,15.6,2.8,1);fs();
      ctx.save();ctx.translate(x-f*6.2,by+1.4);ctx.fillStyle=K.pad;ctx.beginPath();ctx.ellipse(0,0,2.6,3.2,0,0,7);fs();ctx.strokeStyle=K.trim;ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(-1.6,-1.6);ctx.lineTo(1.6,-1.6);ctx.stroke();ctx.restore();
      for(let i=0;i<8;i++){const a=Math.PI*(.08+i*.12),px=x+Math.cos(a)*-9.4,py=by-14.6+Math.sin(a)*-1.4;ctx.fillStyle=i%2?K.feather:'#b8946a';ctx.strokeStyle=OL;ctx.lineWidth=.7;ctx.beginPath();ctx.ellipse(px,py,1.5,2.8,(i-3.5)*.25,0,7);fs();}
      const k=-f;ctx.save();ctx.translate(x+k*10.4,by-12.6);ctx.rotate(k*.35);ctx.fillStyle=K.pad;ctx.strokeStyle=OL;ctx.lineWidth=1.2;ctx.beginPath();ctx.ellipse(0,0,6.2,4,0,0,7);fs();
      ctx.strokeStyle=K.trim;ctx.lineWidth=.8;ctx.beginPath();ctx.ellipse(0,0,4.6,2.8,0,Math.PI*1.1,Math.PI*1.9);ctx.stroke();ctx.restore();}}}
if(typeof outfitPart==='function'){const _opR=outfitPart;outfitPart=function(K,part,v){if(!K||K.fam!=='ranger')return _opR.apply(this,arguments);
  ctx.save();ctx.lineJoin='round';ctx.lineCap='round';try{rangerPart(K,part,v);}catch(e){}finally{ctx.restore();ctx.lineWidth=1.5;ctx.strokeStyle=v.OL;}};}
// the older plain capes would cover the new coat and fur mantle: drop them (the Falconer's falcon stays)
addEventListener('load',()=>{try{if(typeof JOB_LOOK==='undefined'||!WARDEN_V2)return;for(const c of ['sharpshooter','wildstalker'])if(JOB_LOOK[c]&&JOB_LOOK[c].b)JOB_LOOK[c].b=JOB_LOOK[c].b.filter(p=>p[0]!=='cape');}catch(e){}});
