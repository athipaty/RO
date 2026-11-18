"use strict";
/* ================= the Cleric family's outfits (v1.25.0) =================
   Drawn through outfitPart (js/outfits.js). The Templar and the Ascetic fight up close, so they show their legs
   (legs:1 turns the robe off in js/hero2.js); the Cleric and the Oracle keep a robe.
     Cleric    acolyte priest: a long blue-and-gold stole, a short hooded shoulder cape, a rope belt with beads, a sun pendant
     Templar   holy warrior: a white-and-gold surcoat over mail, a big gold sun, sunburst shoulder guards, a short cape
     Oracle    seer of light: a layered robe with very wide sleeves, a star-embroidered train, a glowing crystal, orbs of light
     Ascetic   fighting monk: a sleeveless top, a sash with long swinging tails, loose trousers tied at the ankle, sandals */
const CLERIC_LOOKS={
  cleric:{fam:'cleric',kit:'acolyte',robe:'#f4efe2',sleeve:'#f4efe2',stole:'#2e5aa8',trim:'#e8c25a',cape:'#e8e2d2'},
  templar:{fam:'cleric',kit:'templar',legs:1,body:'#f4efe2',sleeve:'#9aa0aa',mail:'#9aa0aa',steel:'#c8ccd4',gold:'#e8b84a',cape:'#c8463a',pant:'#7a7f88',boot:'#8a909c',tall:1},
  oracle:{fam:'cleric',kit:'oracle',robe:'#eef4fc',sleeve:'#eef4fc',sky:'#9fd0f0',trim:'#c8a8ff',glow:'#bfe6ff'},
  ascetic:{fam:'cleric',kit:'monk',legs:1,body:'#c86a2a',sleeve:'skin',gi:'#c86a2a',sash:'#5a2a12',pant:'#e0a060',boot:'#8a5a2a',wrap:'#efe2c0'}};
if(typeof OUTFITS!=='undefined')OUTFITS.cleric=CLERIC_LOOKS;
function clericPart(K,part,v){const {x,y,by,f,bk,sway,OL,fs}=v;
  if(part==='back'){
    if(K.kit==='acolyte'){ctx.fillStyle=K.cape;ctx.strokeStyle=OL;ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(x-6.6,by-16);ctx.quadraticCurveTo(x-f*2,by-7,x+6.6,by-16);ctx.quadraticCurveTo(x,by-13,x-6.6,by-16);ctx.closePath();fs();}
    else if(K.kit==='templar'){ctx.fillStyle=K.cape;ctx.strokeStyle=OL;ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(x-9,by-15);ctx.lineTo(x+9,by-15);ctx.quadraticCurveTo(x+12-f*2,by-4,x+10-f*3+sway,by+5);ctx.lineTo(x-10-f*3+sway,by+5);ctx.quadraticCurveTo(x-12-f*2,by-4,x-9,by-15);ctx.closePath();fs();
      ctx.strokeStyle=K.gold;ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(x-9.6-f*3+sway,by+4);ctx.lineTo(x+9.6-f*3+sway,by+4);ctx.stroke();}
    else if(K.kit==='oracle'){ // a long train embroidered with stars
      ctx.fillStyle=K.sky;ctx.strokeStyle=OL;ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(x-8,by-14);ctx.lineTo(x+8,by-14);ctx.quadraticCurveTo(x+14-f*2,by+4,x+12-f*6+sway,y+3);ctx.quadraticCurveTo(x-f*6,y+5,x-12-f*6+sway,y+3);ctx.quadraticCurveTo(x-14-f*2,by+4,x-8,by-14);ctx.closePath();fs();
      ctx.fillStyle='#ffffff';for(const [a,b] of [[-6,-2],[4,1],[-2,6],[7,7],[-8,8]]){const px=x+a-f*3+sway*.5,py=by+b;ctx.beginPath();for(let i=0;i<8;i++){const r=i%2?.5:1.4,an=i*Math.PI/4;ctx.lineTo(px+Math.cos(an)*r,py+Math.sin(an)*r);}ctx.closePath();ctx.fill();}}
    else if(K.kit==='monk'){ // the sash's long tails swing behind
      for(const k of [-1,1]){const w=Math.sin(now*4+k)*1.5;ctx.fillStyle=K.sash;ctx.strokeStyle=OL;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x-f*3+k*1.6,by-1);ctx.quadraticCurveTo(x-f*8+k*2+w,by+5,x-f*11+k*2.4+w*1.4,by+12);ctx.lineTo(x-f*9+k*2.4+w*1.4,by+12.6);ctx.quadraticCurveTo(x-f*6+k*2+w,by+5,x-f*1+k*1.6,by);ctx.closePath();fs();}}}
  else if(part==='arm'){const {sx,sy,hx,hy2,sleeve,k}=v,ang=Math.atan2(hy2-sy,hx-sx);
    if(K.kit==='acolyte'||K.kit==='oracle'){const wide=K.kit==='oracle'?7.4:5;ctx.translate(hx,hy2-2.6);ctx.rotate(ang-Math.PI/2);ctx.fillStyle=sleeve;ctx.strokeStyle=OL;ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(-2.4,-4.6);ctx.lineTo(2.4,-4.6);ctx.quadraticCurveTo(wide,-1,wide,2.6);ctx.lineTo(-wide,2.6);ctx.quadraticCurveTo(-wide,-1,-2.4,-4.6);ctx.closePath();fs();
      ctx.strokeStyle=K.kit==='oracle'?K.sky:K.trim;ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(-wide+.6,1.8);ctx.lineTo(wide-.6,1.8);ctx.stroke();}
    else if(K.kit==='templar'){ctx.fillStyle=K.steel;ctx.strokeStyle=OL;ctx.lineWidth=1.1;ctx.beginPath();ctx.ellipse(hx,hy2-1.8,3.4,2.4,0,0,7);fs();ctx.strokeStyle=K.gold;ctx.lineWidth=.8;ctx.beginPath();ctx.ellipse(hx,hy2-1.8,2.4,1.5,0,Math.PI,0);ctx.stroke();}
    else if(K.kit==='monk'){ctx.translate(sx+(hx-sx)*.72,sy+(hy2-sy)*.72);ctx.rotate(ang);ctx.fillStyle=K.wrap;ctx.strokeStyle=OL;ctx.lineWidth=.8;for(const o of [-2.4,-.4,1.6]){ctx.beginPath();ctx.roundRect(o-.9,-2.6,1.8,5.2,.5);fs();}}}
  else if(part==='leg'){const {fx,fy}=v;
    if(K.kit==='monk'){ctx.fillStyle=K.wrap;ctx.strokeStyle=OL;ctx.lineWidth=.8;ctx.beginPath();ctx.roundRect(fx-3.2,fy-7.6,6.4,2.2,.8);fs();}
    else if(K.kit==='templar'){ctx.fillStyle=K.steel;ctx.strokeStyle=OL;ctx.lineWidth=1;ctx.beginPath();ctx.roundRect(fx-2.8,fy-9,5.6,5,1.4);fs();ctx.fillStyle=K.gold;ctx.fillRect(fx-2.4,fy-8.6,4.8,.8);}}
  else if(part==='torso'&&!bk){const {hip}=v;
    if(K.kit==='acolyte'){
      // the long stole down the front, a rope belt with prayer beads, a sun pendant, the short hooded shoulder cape
      for(const k of [-1,1]){ctx.fillStyle=K.stole;ctx.strokeStyle=OL;ctx.lineWidth=1.1;ctx.beginPath();ctx.moveTo(x+k*1.6,by-15);ctx.lineTo(x+k*4.6,by-15);ctx.lineTo(x+k*5+sway*.2,y-2.8);ctx.lineTo(x+k*2.2+sway*.2,y-2.4);ctx.closePath();fs();
        ctx.fillStyle=K.trim;ctx.fillRect(x+k*3.6-1.4+sway*.2,y-6,2.8,1.4);ctx.beginPath();ctx.arc(x+k*3.4,by-6,.9,0,7);ctx.fill();}
      ctx.strokeStyle='#c8a868';ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(x-7,by-2.4);ctx.quadraticCurveTo(x,by-.8,x+7.2,by-2.4);ctx.stroke();
      ctx.fillStyle='#7a5a3a';for(let i=0;i<6;i++){ctx.beginPath();ctx.arc(x-f*3-f*.4*i+Math.sin(i)*.2,by-1+i*1.2,.75,0,7);ctx.fill();}
      ctx.fillStyle=K.cape;ctx.strokeStyle=OL;ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(x-10.6,by-11.6);ctx.quadraticCurveTo(x-10,by-17.6,x,by-17.6);ctx.quadraticCurveTo(x+10,by-17.6,x+10.6,by-11.6);ctx.quadraticCurveTo(x,by-9,x-10.6,by-11.6);ctx.closePath();fs();
      ctx.strokeStyle=K.trim;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x-10,by-12.2);ctx.quadraticCurveTo(x,by-9.8,x+10,by-12.2);ctx.stroke();
      ctx.save();ctx.shadowColor='#fff0a0';ctx.shadowBlur=5;ctx.fillStyle=K.trim;ctx.beginPath();for(let i=0;i<12;i++){const r=i%2?1:2,an=i*Math.PI/6;ctx.lineTo(x+Math.cos(an)*r,by-8+Math.sin(an)*r);}ctx.closePath();ctx.fill();ctx.restore();
      ctx.strokeStyle=K.trim;ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(x-10,y-3.2);ctx.quadraticCurveTo(x,y-.2,x+10,y-3.2);ctx.stroke();}
    else if(K.kit==='templar'){
      // mail on the arms and hips, a white surcoat with a gold border and a big gold sun, sunburst shoulder guards
      ctx.fillStyle=K.mail;ctx.strokeStyle=OL;ctx.lineWidth=1.1;ctx.beginPath();ctx.roundRect(x-8,by-2,16,hip-by+5,2);fs();
      ctx.strokeStyle='rgba(255,255,255,.3)';ctx.lineWidth=.6;for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(x-7,by+i*2);ctx.lineTo(x+7,by+i*2);ctx.stroke();}
      ctx.fillStyle=K.body;ctx.strokeStyle=OL;ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(x-6,by-15);ctx.lineTo(x+6,by-15);ctx.lineTo(x+5.4+sway*.2,hip+7);ctx.lineTo(x,hip+5.6);ctx.lineTo(x-5.4+sway*.2,hip+7);ctx.closePath();fs();
      ctx.strokeStyle=K.gold;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x-4.8+sway*.2,hip+5.8);ctx.lineTo(x,hip+4.6);ctx.lineTo(x+4.8+sway*.2,hip+5.8);ctx.moveTo(x-5,by-13);ctx.lineTo(x-4.6,hip+5);ctx.moveTo(x+5,by-13);ctx.lineTo(x+4.6,hip+5);ctx.stroke();
      ctx.save();ctx.shadowColor='#ffe08a';ctx.shadowBlur=5;ctx.fillStyle=K.gold;ctx.strokeStyle=OL;ctx.lineWidth=.9;ctx.beginPath();for(let i=0;i<16;i++){const r=i%2?1.8:3.4,an=i*Math.PI/8;ctx.lineTo(x+Math.cos(an)*r,by-5+Math.sin(an)*r);}ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();
      ctx.fillStyle='#6a4a2a';ctx.strokeStyle=OL;ctx.lineWidth=1;ctx.beginPath();ctx.roundRect(x-6.6,by-2.6,13.2,2.4,1);fs();
      for(const k of [-1,1]){ctx.save();ctx.translate(x+k*10.6,by-12.6);ctx.rotate(k*.35);ctx.fillStyle=K.gold;ctx.strokeStyle=OL;ctx.lineWidth=1;ctx.beginPath();for(let i=0;i<=8;i++){const an=Math.PI+i*Math.PI/8,r=i%2?5.2:7.4;ctx.lineTo(Math.cos(an)*r,Math.sin(an)*r*.8+1.6);}ctx.closePath();fs();
        ctx.fillStyle=K.steel;ctx.beginPath();ctx.ellipse(0,0,4.6,3.4,0,0,7);fs();ctx.restore();}}
    else if(K.kit==='oracle'){
      // a layered robe in two shades with a light hem, a glowing crystal pendant, small orbs of light
      ctx.fillStyle=K.sky;ctx.strokeStyle=OL;ctx.lineWidth=1.1;ctx.beginPath();ctx.moveTo(x-8.6,hip+2);ctx.quadraticCurveTo(x,hip+4,x+8.6,hip+2);ctx.lineTo(x+10.4,y-2.6);ctx.quadraticCurveTo(x,y+.4,x-10.4,y-2.6);ctx.closePath();fs();
      ctx.strokeStyle=K.trim;ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(x-10,y-3.2);ctx.quadraticCurveTo(x,y-.2,x+10,y-3.2);ctx.moveTo(x-7,by-2.4);ctx.quadraticCurveTo(x,by-.8,x+7,by-2.4);ctx.stroke();
      ctx.strokeStyle=K.trim;ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(x-4,by-15);ctx.lineTo(x,by-9);ctx.lineTo(x+4,by-15);ctx.stroke();
      ctx.save();ctx.shadowColor=K.glow;ctx.shadowBlur=8;ctx.fillStyle=K.glow;ctx.strokeStyle='#5a7aa8';ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(x,by-9.4);ctx.lineTo(x+1.8,by-7);ctx.lineTo(x,by-4);ctx.lineTo(x-1.8,by-7);ctx.closePath();ctx.fill();ctx.stroke();
      for(let i=0;i<3;i++){const a=now*1.4+i*2.1,px=x+Math.cos(a)*14,py=by-6+Math.sin(a)*4;ctx.globalAlpha=.85;ctx.beginPath();ctx.arc(px,py,1.6,0,7);ctx.fill();}ctx.restore();}
    else if(K.kit==='monk'){
      // a sleeveless crossed top, a wide sash, loose trousers
      ctx.fillStyle=K.gi;ctx.strokeStyle=OL;ctx.lineWidth=1.1;ctx.beginPath();ctx.moveTo(x-7.6,by-14.6);ctx.lineTo(x+7.6,by-14.6);ctx.lineTo(x+7.8,hip);ctx.lineTo(x-7.8,hip);ctx.closePath();fs();
      ctx.fillStyle=v.lite||'#e8a060';ctx.beginPath();ctx.moveTo(x-f*6,by-14.6);ctx.lineTo(x+f*3,by-14.6);ctx.lineTo(x+f*5.6,by-3);ctx.lineTo(x+f*2.6,by-3);ctx.closePath();ctx.fill();
      ctx.strokeStyle='#7a3a16';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x-f*6,by-14.6);ctx.lineTo(x+f*2.6,by-3);ctx.stroke();
      ctx.fillStyle=K.sash;ctx.strokeStyle=OL;ctx.lineWidth=1.1;ctx.beginPath();ctx.roundRect(x-8.2,by-3.2,16.4,3.6,1.2);fs();
      ctx.beginPath();ctx.moveTo(x+f*3,by-2);ctx.quadraticCurveTo(x+f*5+sway*.4,by+3,x+f*4+sway*.6,by+7);ctx.lineTo(x+f*2.4+sway*.6,by+6.6);ctx.quadraticCurveTo(x+f*3.4+sway*.4,by+3,x+f*1.6,by-1);ctx.closePath();fs();}}}
if(typeof outfitPart==='function'){const _opC=outfitPart;outfitPart=function(K,part,v){if(!K||K.fam!=='cleric')return _opC.apply(this,arguments);
  ctx.save();ctx.lineJoin='round';ctx.lineCap='round';try{clericPart(K,part,v);}catch(e){}finally{ctx.restore();ctx.lineWidth=1.5;ctx.strokeStyle=v.OL;}};}
// the Oracle's long train replaces its older plain cape (the halo stays); the Templar's banner gets a gold sun
addEventListener('load',()=>{try{if(typeof JOB_LOOK==='undefined'||!WARDEN_V2)return;if(JOB_LOOK.oracle&&JOB_LOOK.oracle.b)JOB_LOOK.oracle.b=JOB_LOOK.oracle.b.filter(p=>p[0]!=='cape');
  // the Templar's banner: a gold sun on white with a red edge (a red disc on white read like a national flag)
  if(JOB_LOOK.templar&&JOB_LOOK.templar.b)for(const p of JOB_LOOK.templar.b)if(p[0]==='banner')p[1]={...p[1],t:'#e8b84a'};}catch(e){}});
