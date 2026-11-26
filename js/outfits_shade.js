"use strict";
/* ================= the Shade family's outfits (v1.26.0) =================
   Drawn through outfitPart (js/outfits.js). Each job has its own shapes:
     Shade       street rogue: a buckled leather vest, a neck scarf with a tail, a strap of throwing knives, pouches, arm wraps
     Nightblade  assassin: a high-collared suit, a long double scarf, a crimson sash, a half cape, thigh sheaths, a crescent moon
     Venomancer  poisoner: a long coat with the hood down, a bandolier of glowing vials, flasks, thick gloves, venom drips
     Phantom     illusionist: a pale layered coat, see-through veils, ribbons that fade, mirror shards floating around */
const SHADE_LOOKS={
  shade:{fam:'shade',kit:'rogue',body:'#3a3448',sleeve:'#3a3448',leather:'#4a3a2a',scarf:'#6a5a9a',trim:'#9a8ad8',pant:'#3a3448',boot:'#2e2a38'},
  nightblade:{fam:'shade',kit:'assassin',body:'#1e1a26',sleeve:'#1e1a26',red:'#b8243a',red2:'#7a1424',trim:'#ff5a7a',pant:'#1a1620',boot:'#141018',tall:1},
  venomancer:{fam:'shade',kit:'poison',body:'#2a3a22',sleeve:'#2a3a22',coat:'#2e4228',coat2:'#1e2c1a',venom:'#9be35a',leather:'#4a3a24',pant:'#26301e',boot:'#2a2418',tall:1},
  phantom:{fam:'shade',kit:'phantom',body:'#8a88b8',sleeve:'#8a88b8',veil:'rgba(200,210,255,.45)',silver:'#d8dcf0',trim:'#a8c8ff',pant:'#5a5878',boot:'#4a4868'}};
if(typeof OUTFITS!=='undefined')OUTFITS.shade=SHADE_LOOKS;
function shadePart(K,part,v){const {x,y,by,f,bk,sway,OL,fs}=v;
  if(part==='back'){
    if(K.kit==='rogue-scarf'){ctx.fillStyle=K.scarf; /* (v1.67.1) off */ctx.strokeStyle=OL;ctx.lineWidth=1.1;const w=Math.sin(now*5)*1.4;ctx.beginPath();ctx.moveTo(x-f*2,by-15.4);ctx.quadraticCurveTo(x-f*9,by-13+w,x-f*13+sway,by-6+w);ctx.lineTo(x-f*10+sway,by-5+w);ctx.quadraticCurveTo(x-f*7,by-11,x-f*1,by-13.4);ctx.closePath();fs();}
    else if(K.kit==='assassin'){for(const [k,len] of [[0,22],[1.4,17]]){const w=Math.sin(now*5+k)*1.8;ctx.fillStyle=k?K.red2:K.red;ctx.strokeStyle=OL;ctx.lineWidth=1.1;ctx.beginPath();ctx.moveTo(x-f*1,by-16+k);ctx.bezierCurveTo(x-f*8,by-17+w+k,x-f*14,by-11-w+k,x-f*len+sway,by-12+w*1.3+k);ctx.lineTo(x-f*(len-1)+sway,by-9+w*1.3+k);ctx.bezierCurveTo(x-f*12,by-8-w+k,x-f*7,by-13+w+k,x,by-13.6+k);ctx.closePath();fs();}
      const k=f;ctx.fillStyle=K.red2;ctx.strokeStyle=OL;ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(x+k*2,by-16);ctx.quadraticCurveTo(x+k*12,by-15,x+k*12.6+sway*.6,by+3);ctx.lineTo(x+k*5+sway*.4,by+2);ctx.quadraticCurveTo(x+k*6,by-9,x+k*1,by-13);ctx.closePath();fs();}
    else if(K.kit==='poison'){ctx.fillStyle=K.coat2;ctx.strokeStyle=OL;ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(x-9,by-15);ctx.lineTo(x+9,by-15);ctx.quadraticCurveTo(x+12-f*2,by,x+11-f*3+sway,y+1);ctx.lineTo(x-11-f*3+sway,y+1);ctx.quadraticCurveTo(x-12-f*2,by,x-9,by-15);ctx.closePath();fs();
      ctx.fillStyle=K.coat;ctx.beginPath();ctx.moveTo(x-6.6,by-16);ctx.quadraticCurveTo(x-f*2,by-6,x+6.6,by-16);ctx.quadraticCurveTo(x,by-13,x-6.6,by-16);ctx.closePath();fs();}
    else if(K.kit==='phantom'){for(let i=0;i<3;i++){const w=Math.sin(now*2.4+i)*2;ctx.fillStyle=`rgba(200,210,255,${.32-i*.08})`;ctx.beginPath();ctx.moveTo(x-8-i*2,by-14);ctx.lineTo(x+8+i*2,by-14);ctx.quadraticCurveTo(x+13+i*3-f*2,by+2,x+12+i*3-f*4+w,y+2+i);ctx.quadraticCurveTo(x-f*4,y+4+i,x-12-i*3-f*4+w,y+2+i);ctx.quadraticCurveTo(x-13-i*3-f*2,by+2,x-8-i*2,by-14);ctx.closePath();ctx.fill();}
      for(const k of [-1,1]){const w=Math.sin(now*3+k)*2.4;const g=ctx.createLinearGradient(x,by-12,x-f*16,by+4);g.addColorStop(0,K.trim);g.addColorStop(1,'rgba(168,200,255,0)');ctx.strokeStyle=g;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x+k*3,by-12);ctx.bezierCurveTo(x-f*6+k*2,by-8+w,x-f*11+k*3,by-2-w,x-f*17+k*2,by+3+w);ctx.stroke();}}}
  else if(part==='arm'){const {sx,sy,hx,hy2,k}=v,ang=Math.atan2(hy2-sy,hx-sx);
    if(K.kit==='rogue'){ctx.translate(sx+(hx-sx)*.7,sy+(hy2-sy)*.7);ctx.rotate(ang);ctx.fillStyle='#c8bca0';ctx.strokeStyle=OL;ctx.lineWidth=.8;for(const o of [-2,0,2]){ctx.beginPath();ctx.roundRect(o-.8,-2.4,1.6,4.8,.5);fs();}}
    else if(K.kit==='assassin'){ctx.fillStyle='#2a2430';ctx.strokeStyle=OL;ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(hx,hy2-1.6,3.2,2.2,0,0,7);fs();ctx.fillStyle='#d8d0e0';for(const o of [-1.8,0,1.8]){ctx.beginPath();ctx.moveTo(hx+o-.6,hy2-3.2);ctx.lineTo(hx+o,hy2-5.2);ctx.lineTo(hx+o+.6,hy2-3.2);ctx.closePath();ctx.fill();}}
    else if(K.kit==='poison'){ctx.fillStyle=K.leather;ctx.strokeStyle=OL;ctx.lineWidth=1.1;ctx.beginPath();ctx.roundRect(hx-3.6,hy2-5,7.2,5,1.8);fs();}
    else if(K.kit==='phantom'){ctx.translate(hx,hy2-2.4);ctx.rotate(ang-Math.PI/2);ctx.fillStyle=K.veil;ctx.beginPath();ctx.moveTo(-2,-4);ctx.lineTo(2,-4);ctx.lineTo(5.4+Math.sin(now*3)*.8,3);ctx.lineTo(-5.4+Math.sin(now*3)*.8,3);ctx.closePath();ctx.fill();}}
  else if(part==='leg'){const {fx,fy,k}=v;
    if(K.kit==='assassin'){const kx=(x+k*3.6+fx)/2,ky=(v.hip-2+fy-2.5)/2;ctx.fillStyle='#2a2430';ctx.strokeStyle=OL;ctx.lineWidth=.9;ctx.beginPath();ctx.roundRect(kx-1.6+k*1.6,ky-4.4,3.2,6.4,1);fs();ctx.fillStyle=K.red;ctx.fillRect(kx-1.4+k*1.6,ky-4.6,2.8,1.2);}
    else if(K.kit==='rogue'){ctx.strokeStyle='#5a4a3a';ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(fx-2.8,fy-6.4);ctx.lineTo(fx+2.8,fy-5.4);ctx.moveTo(fx-2.8,fy-8.4);ctx.lineTo(fx+2.8,fy-7.4);ctx.stroke();}}
  else if(part==='torso'&&!bk){const {hip}=v;
    if(K.kit==='rogue'){
      ctx.fillStyle=K.leather;ctx.strokeStyle=OL;ctx.lineWidth=1.1;ctx.beginPath();ctx.moveTo(x-7.2,by-14.4);ctx.lineTo(x+7.2,by-14.4);ctx.lineTo(x+7.4,hip);ctx.lineTo(x-7.4,hip);ctx.closePath();fs();
      ctx.fillStyle='#b8b0a0';for(const yy of [-11,-7,-3.4]){ctx.beginPath();ctx.roundRect(x-f*2.4-1,by+yy-.7,2,1.4,.3);ctx.fill();}
      ctx.strokeStyle='#2a2436';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x+f*6.8,by-14);ctx.lineTo(x-f*6.4,by-2);ctx.stroke();
      for(let i=0;i<4;i++){const t=.15+i*.2,px=x+f*6.8-f*13.2*t,py=by-14+12*t;ctx.fillStyle='#d6d8e4';ctx.strokeStyle=OL;ctx.lineWidth=.6;ctx.beginPath();ctx.moveTo(px-.8,py);ctx.lineTo(px,py-3.2);ctx.lineTo(px+.8,py);ctx.closePath();fs();}
      ctx.fillStyle='#2e2a38';ctx.strokeStyle=OL;ctx.lineWidth=1.1;ctx.beginPath();ctx.roundRect(x-7.8,by-2.4,15.6,2.8,1);fs();
      for(const a of [-5.2,5.2]){ctx.fillStyle=K.leather;ctx.beginPath();ctx.roundRect(x+a-1.6,by-.2,3.2,3.2,1);fs();}
      ctx.fillStyle=K.scarf;ctx.strokeStyle=OL;ctx.lineWidth=1.2;ctx.beginPath();ctx.roundRect(x-6.6,by-17.2,13.2,4.4,2);fs();}
    else if(K.kit==='assassin'){
      ctx.strokeStyle='rgba(255,255,255,.12)';ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(x-f*5,by-13);ctx.lineTo(x-f*4,hip);ctx.stroke();
      ctx.fillStyle=K.red;ctx.strokeStyle=OL;ctx.lineWidth=1.1;ctx.beginPath();ctx.roundRect(x-8,by-3,16,3.2,1);fs();
      ctx.beginPath();ctx.moveTo(x+f*4,by-1.6);ctx.quadraticCurveTo(x+f*6+sway*.4,by+4,x+f*5+sway*.6,by+8);ctx.lineTo(x+f*3.2+sway*.6,by+7.4);ctx.quadraticCurveTo(x+f*4.4,by+3,x+f*2.6,by-1);ctx.closePath();fs();
      ctx.save();ctx.shadowColor=K.trim;ctx.shadowBlur=5;ctx.fillStyle=K.trim;ctx.beginPath();ctx.arc(x,by-7.4,2.8,Math.PI*.35,Math.PI*1.65);ctx.arc(x+1.3,by-7.8,2.2,Math.PI*1.5,Math.PI*.5,true);ctx.closePath();ctx.fill();ctx.restore();
      for(const k of [-1,1]){ctx.fillStyle=K.body;ctx.strokeStyle=OL;ctx.lineWidth=1.1;ctx.beginPath();ctx.moveTo(x+k*2.4,by-15.6);ctx.lineTo(x+k*7,by-20.6);ctx.lineTo(x+k*7.2,by-14.4);ctx.closePath();fs();ctx.strokeStyle=K.red;ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(x+k*3,by-15.8);ctx.lineTo(x+k*6.8,by-20);ctx.stroke();}}
    else if(K.kit==='poison'){
      for(const k of [-1,1]){ctx.fillStyle=K.coat;ctx.strokeStyle=OL;ctx.lineWidth=1.1;ctx.beginPath();ctx.moveTo(x+k*2,by-15);ctx.lineTo(x+k*8,by-14);ctx.lineTo(x+k*9.4+sway*.3,y-2.4);ctx.lineTo(x+k*3.2+sway*.3,y-2);ctx.closePath();fs();}
      ctx.save();ctx.shadowColor=K.venom;ctx.shadowBlur=4;ctx.fillStyle=K.venom;for(const [a,b] of [[-7.6,0],[8.4,-1.4],[-5,1.2]]){const d=((now*.6+a)%1);ctx.globalAlpha=1-d;ctx.beginPath();ctx.ellipse(x+a,y-1+b+d*4,.9,1.3,0,0,7);ctx.fill();}ctx.restore();
      ctx.strokeStyle=K.leather;ctx.lineWidth=2.2;ctx.beginPath();ctx.moveTo(x-f*7,by-14);ctx.lineTo(x+f*6.6,by-1.8);ctx.stroke();
      ctx.save();ctx.shadowColor=K.venom;ctx.shadowBlur=5;for(let i=0;i<4;i++){const t=.16+i*.22,px=x-f*7+f*13.6*t,py=by-14+12.2*t;ctx.fillStyle=i%2?K.venom:'#c8ff80';ctx.strokeStyle=OL;ctx.lineWidth=.6;ctx.beginPath();ctx.roundRect(px-1,py-2.4,2,3.2,.8);ctx.fill();ctx.stroke();}ctx.restore();
      ctx.fillStyle='#2a2418';ctx.strokeStyle=OL;ctx.lineWidth=1.1;ctx.beginPath();ctx.roundRect(x-7.8,by-2.4,15.6,2.8,1);fs();
      for(const a of [-5,5]){ctx.fillStyle='rgba(155,227,90,.8)';ctx.strokeStyle=OL;ctx.lineWidth=.8;ctx.beginPath();ctx.ellipse(x+a,by+2,1.8,2.2,0,0,7);fs();ctx.fillStyle='#6a5030';ctx.fillRect(x+a-.7,by-.6,1.4,1);}}
    else if(K.kit==='phantom'){
      ctx.fillStyle=K.veil;ctx.beginPath();ctx.moveTo(x-8,hip);ctx.quadraticCurveTo(x,hip+2,x+8,hip);ctx.lineTo(x+10+Math.sin(now*2)*1,y-2);ctx.quadraticCurveTo(x,y+1,x-10+Math.sin(now*2)*1,y-2);ctx.closePath();ctx.fill();
      ctx.strokeStyle=K.silver;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x-4,by-15);ctx.lineTo(x,by-6);ctx.lineTo(x+4,by-15);ctx.moveTo(x-7.4,by-2.4);ctx.quadraticCurveTo(x,by-.8,x+7.4,by-2.4);ctx.stroke();
      ctx.save();ctx.shadowColor=K.trim;ctx.shadowBlur=6;for(let i=0;i<3;i++){const a=now*1.1+i*2.1,px=x+Math.cos(a)*15,py=by-6+Math.sin(a)*5;ctx.translate(px,py);ctx.rotate(a);ctx.fillStyle='rgba(230,240,255,.9)';ctx.strokeStyle=K.trim;ctx.lineWidth=.7;ctx.beginPath();ctx.moveTo(0,-2.6);ctx.lineTo(1.4,0);ctx.lineTo(0,2.6);ctx.lineTo(-1.4,0);ctx.closePath();ctx.fill();ctx.stroke();ctx.rotate(-a);ctx.translate(-px,-py);}ctx.restore();}}}
if(typeof outfitPart==='function'){const _opS=outfitPart;outfitPart=function(K,part,v){if(!K||K.fam!=='shade')return _opS.apply(this,arguments);
  ctx.save();ctx.lineJoin='round';ctx.lineCap='round';try{shadePart(K,part,v);}catch(e){}finally{ctx.restore();ctx.lineWidth=1.5;ctx.strokeStyle=v.OL;}};}
// the advanced callings' older plain capes would cover the new scarves, coat and veils
addEventListener('load',()=>{try{if(typeof JOB_LOOK==='undefined'||!WARDEN_V2)return;for(const c of ['nightblade','venomancer','phantom'])if(JOB_LOOK[c]&&JOB_LOOK[c].b)JOB_LOOK[c].b=JOB_LOOK[c].b.filter(p=>p[0]!=='cape');
  if(JOB_LOOK.phantom&&JOB_LOOK.phantom.s)JOB_LOOK.phantom.s=JOB_LOOK.phantom.s.filter(p=>p[0]!=='sparks');}catch(e){}}); // its mirror shards replace the sparks
