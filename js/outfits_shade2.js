"use strict";
/* ================= bolder Venomancer and Phantom (v1.26.0) =================
   Replaces their first designs (js/outfits_shade.js) with stronger shapes:
     Venomancer  mad alchemist: a glowing poison tank on the back with bubbles, tubes to an injector gauntlet, a thorned
                 shoulder guard, a toxic sash, a jagged dripping coat, green mist round the feet
     Phantom     ghost illusionist: a violet-and-silver coat, a tall collar with silver chains, a glowing heart, a smoky
                 cloak fading into wisps, two spectral daggers circling, a flickering ghost double behind */
if(typeof SHADE_LOOKS!=='undefined'){
  SHADE_LOOKS.venomancer={fam:'shade',kit:'alchemist',body:'#1e2a1a',sleeve:'#1e2a1a',coat:'#26361e',coat2:'#162212',venom:'#9be35a',venom2:'#d8ff70',iron:'#3a4038',pant:'#1a2216',boot:'#1e1a12',tall:1};
  SHADE_LOOKS.phantom={fam:'shade',kit:'ghost',body:'#2e2650',sleeve:'#2e2650',coat:'#3a3068',silver:'#d8dcf0',glow:'#c8a8ff',ghost:'rgba(190,170,255,',pant:'#221c3a',boot:'#1a1630',tall:1};}
function shade2Part(K,part,v){const {x,y,by,f,bk,sway,OL,fs}=v;
  if(K.kit==='alchemist'){
    if(part==='back'){
      // a long jagged coat
      ctx.fillStyle=K.coat2;ctx.strokeStyle=OL;ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(x-9,by-15);ctx.lineTo(x+9,by-15);ctx.quadraticCurveTo(x+13-f*2,by,x+12-f*3+sway,y+1);
      for(let i=1;i<8;i++){const u=i/8;ctx.lineTo(x+12-f*3+sway-u*24,y+(i%2?-3:1.4));}ctx.lineTo(x-12-f*3+sway,y+1);ctx.quadraticCurveTo(x-13-f*2,by,x-9,by-15);ctx.closePath();fs();
      // the glass tank of glowing poison, bubbles rising, iron bands
      const tx=x-f*11,ty=by-2;ctx.save();ctx.translate(tx,ty);ctx.rotate(f*.22);ctx.scale(1.2,1.2);
      ctx.fillStyle='#2a3226';ctx.strokeStyle=OL;ctx.lineWidth=1.3;ctx.beginPath();ctx.roundRect(-5,-11,10,19,4);fs();
      ctx.save();ctx.shadowColor=K.venom;ctx.shadowBlur=9;const g=ctx.createLinearGradient(0,-9,0,6);g.addColorStop(0,K.venom2);g.addColorStop(1,'#4a8a2a');ctx.fillStyle=g;ctx.beginPath();ctx.roundRect(-3.6,-8+Math.sin(now*2)*.6,7.2,14,3);ctx.fill();ctx.restore();
      ctx.fillStyle='rgba(255,255,255,.7)';for(let i=0;i<3;i++){const t=(now*.7+i*.33)%1;ctx.beginPath();ctx.arc(-1.6+i*1.6,5-t*12,.6+(i%2)*.3,0,7);ctx.fill();}
      ctx.fillStyle='rgba(255,255,255,.35)';ctx.fillRect(-2.8,-7,1,11);
      ctx.fillStyle=K.iron;ctx.strokeStyle=OL;ctx.lineWidth=1;for(const yy of [-10,6]){ctx.beginPath();ctx.roundRect(-5.4,yy-1.2,10.8,2.4,1);fs();}ctx.restore();
      // tubes over the shoulder toward the arm
      ctx.strokeStyle='#1a1a14';ctx.lineWidth=2.6;ctx.beginPath();ctx.moveTo(tx+f*2,ty-10);ctx.quadraticCurveTo(x+f*2,by-21,x+f*9,by-14);ctx.stroke();
      ctx.strokeStyle=K.venom;ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(tx+f*2,ty-10);ctx.quadraticCurveTo(x+f*2,by-21,x+f*9,by-14);ctx.stroke();
      // green mist curling round the feet
      ctx.save();for(let i=0;i<5;i++){const a=now*.8+i*1.3,mx=x+Math.cos(a)*11,my=y-1+Math.sin(a*1.3)*1.4;ctx.fillStyle=`rgba(155,227,90,${.12+.06*Math.sin(now*2+i)})`;ctx.beginPath();ctx.ellipse(mx,my,6,2.4,0,0,7);ctx.fill();}ctx.restore();}
    else if(part==='arm'){const {sx,sy,hx,hy2,k}=v,ang=Math.atan2(hy2-sy,hx-sx);
      if(k===f){ // the injector gauntlet with a needle, glowing
        ctx.translate(sx+(hx-sx)*.7,sy+(hy2-sy)*.7);ctx.rotate(ang);ctx.fillStyle=K.iron;ctx.strokeStyle=OL;ctx.lineWidth=1.1;ctx.beginPath();ctx.roundRect(-4.4,-3,8.8,6,2);fs();
        ctx.save();ctx.shadowColor=K.venom;ctx.shadowBlur=6;ctx.fillStyle=K.venom;ctx.beginPath();ctx.roundRect(-2.6,-1.4,5.2,2.8,1.2);ctx.fill();ctx.restore();
        ctx.strokeStyle='#d8d8d0';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(4.4,0);ctx.lineTo(8.4,0);ctx.stroke();}
      else{ctx.fillStyle='#2a2418';ctx.strokeStyle=OL;ctx.lineWidth=1.1;ctx.beginPath();ctx.roundRect(hx-3.6,hy2-5,7.2,5,1.8);fs();}}
    else if(part==='torso'&&!bk){const {hip}=v;
      for(const k of [-1,1]){ctx.fillStyle=K.coat;ctx.strokeStyle=OL;ctx.lineWidth=1.1;ctx.beginPath();ctx.moveTo(x+k*2,by-15);ctx.lineTo(x+k*8,by-14);ctx.lineTo(x+k*9.4+sway*.3,y-2.4);ctx.lineTo(x+k*6+sway*.3,y-4.6);ctx.lineTo(x+k*3.2+sway*.3,y-2);ctx.closePath();fs();}
      ctx.save();ctx.shadowColor=K.venom;ctx.shadowBlur=5;ctx.fillStyle=K.venom;for(const [a,b] of [[-7.6,0],[8.4,-1.4],[-4.6,1.2],[5,.6]]){const d=((now*.6+a*.3)%1+1)%1;ctx.globalAlpha=1-d;ctx.beginPath();ctx.ellipse(x+a,y-1+b+d*4,.9,1.4,0,0,7);ctx.fill();}ctx.restore();
      // a toxic sash with glowing vials
      ctx.strokeStyle=K.venom;ctx.lineWidth=2.6;ctx.beginPath();ctx.moveTo(x-f*7,by-14);ctx.lineTo(x+f*6.6,by-1.8);ctx.stroke();
      ctx.save();ctx.shadowColor=K.venom2;ctx.shadowBlur=6;for(let i=0;i<3;i++){const t=.2+i*.26,px=x-f*7+f*13.6*t,py=by-14+12.2*t;ctx.fillStyle=K.venom2;ctx.strokeStyle=OL;ctx.lineWidth=.6;ctx.beginPath();ctx.roundRect(px-1.1,py-2.6,2.2,3.6,.9);ctx.fill();ctx.stroke();}ctx.restore();
      ctx.fillStyle='#14180f';ctx.strokeStyle=OL;ctx.lineWidth=1.1;ctx.beginPath();ctx.roundRect(x-7.8,by-2.4,15.6,2.8,1);fs();
      // a thorned iron shoulder guard on the far side
      {const k=-f;ctx.save();ctx.translate(x+k*10.6,by-12.6);ctx.rotate(k*.38);ctx.fillStyle=K.iron;ctx.strokeStyle=OL;ctx.lineWidth=1.2;ctx.beginPath();ctx.ellipse(0,0,6.4,4.4,0,0,7);fs();
        ctx.fillStyle='#5a7a3a';for(const [sx2,h,l] of [[-3.6,5.6,-.5],[0,8,0],[3.6,5.6,.5]]){ctx.beginPath();ctx.moveTo(sx2-1.6,-3.2);ctx.quadraticCurveTo(sx2+l*2,-3.2-h*.6,sx2+l*3+k*.6,-3.2-h);ctx.quadraticCurveTo(sx2+l*2+.6,-3.2-h*.4,sx2+1.6,-3.2);ctx.closePath();fs();}
        ctx.save();ctx.shadowColor=K.venom;ctx.shadowBlur=5;ctx.fillStyle=K.venom;ctx.beginPath();ctx.arc(0,.6,1.3,0,7);ctx.fill();ctx.restore();ctx.restore();}}}
  else if(K.kit==='ghost'){
    if(part==='back'){
      // a flickering ghost double just behind
      const fl=.3+.12*Math.sin(now*7)+.06*Math.sin(now*13),gx=x-f*11+Math.sin(now*1.7)*1.5,gy=-1;ctx.save();ctx.fillStyle=K.ghost+fl+')';
      ctx.beginPath();ctx.ellipse(gx,by-20+gy,12,11.5,0,0,7);ctx.fill();ctx.beginPath();ctx.moveTo(gx-8,by-14+gy);ctx.lineTo(gx+8,by-14+gy);ctx.quadraticCurveTo(gx+11,y-6,gx+6,y);ctx.quadraticCurveTo(gx,y-3,gx-6,y);ctx.quadraticCurveTo(gx-11,y-6,gx-8,by-14+gy);ctx.closePath();ctx.fill();ctx.restore();
      // a smoky cloak that fades into wisps
      const g=ctx.createLinearGradient(0,by-15,0,y+6);g.addColorStop(0,K.coat);g.addColorStop(.65,'rgba(58,48,104,.75)');g.addColorStop(1,'rgba(58,48,104,0)');
      ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(x-9,by-15);ctx.lineTo(x+9,by-15);ctx.quadraticCurveTo(x+14-f*2,by,x+13-f*4+sway,y+3);
      for(let i=1;i<7;i++){const u=i/7,wv=Math.sin(now*3+i*1.7)*2.4;ctx.quadraticCurveTo(x+13-f*4+sway-(u-.07)*26,y+7+wv,x+13-f*4+sway-u*26,y+2+(i%2?-2:2));}ctx.quadraticCurveTo(x-14-f*2,by,x-9,by-15);ctx.closePath();ctx.fill();
      // two spectral daggers circling
      ctx.save();ctx.shadowColor=K.glow;ctx.shadowBlur=8;for(let i=0;i<2;i++){const a=now*1.6+i*Math.PI,px=x+Math.cos(a)*18,py=by-6+Math.sin(a)*5,front=Math.sin(a)>0;if(front)continue;
        ctx.save();ctx.translate(px,py);ctx.rotate(a+Math.PI/2);ctx.scale(1.5,1.5);ctx.fillStyle='rgba(225,215,255,.85)';ctx.beginPath();ctx.moveTo(0,-6);ctx.lineTo(1.4,1);ctx.lineTo(0,2.4);ctx.lineTo(-1.4,1);ctx.closePath();ctx.fill();ctx.fillStyle=K.glow;ctx.fillRect(-2.2,1.6,4.4,1);ctx.restore();}ctx.restore();}
    else if(part==='arm'){const {hx,hy2}=v;ctx.save();ctx.shadowColor=K.glow;ctx.shadowBlur=5;ctx.strokeStyle=K.silver;ctx.lineWidth=1.1;ctx.beginPath();ctx.ellipse(hx,hy2-2,3.2,1.6,0,0,7);ctx.stroke();ctx.restore();}
    else if(part==='torso'&&!bk){const {hip}=v;
      for(const k of [-1,1]){ctx.fillStyle=K.coat;ctx.strokeStyle=OL;ctx.lineWidth=1.1;ctx.beginPath();ctx.moveTo(x+k*2,hip-1);ctx.lineTo(x+k*8,hip-1);ctx.lineTo(x+k*9.6+Math.sin(now*2+k)*.8,y-2.6);ctx.lineTo(x+k*3.2,y-3.4);ctx.closePath();fs();
        ctx.strokeStyle=K.silver;ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(x+k*3.2,y-3.6);ctx.lineTo(x+k*2.1,hip-.4);ctx.stroke();}
      // the glowing violet heart
      ctx.save();ctx.shadowColor=K.glow;ctx.shadowBlur=10;const p=1+.15*Math.sin(now*4);ctx.fillStyle=K.glow;ctx.beginPath();ctx.moveTo(x,by-10*p+1);ctx.lineTo(x+2.2*p,by-7);ctx.lineTo(x,by-3.6);ctx.lineTo(x-2.2*p,by-7);ctx.closePath();ctx.fill();ctx.fillStyle='#ffffff';ctx.beginPath();ctx.arc(x,by-7,.8,0,7);ctx.fill();ctx.restore();
      ctx.fillStyle='#1a1430';ctx.strokeStyle=OL;ctx.lineWidth=1.1;ctx.beginPath();ctx.roundRect(x-7.8,by-2.4,15.6,2.8,1);fs();ctx.fillStyle=K.silver;ctx.beginPath();ctx.roundRect(x-1.4,by-2.8,2.8,3.4,.6);fs();
      // a tall collar hung with silver chains
      for(const k of [-1,1]){ctx.fillStyle=K.coat;ctx.strokeStyle=OL;ctx.lineWidth=1.1;ctx.beginPath();ctx.moveTo(x+k*2.6,by-15.6);ctx.lineTo(x+k*8.6,by-22);ctx.lineTo(x+k*9,by-14.2);ctx.closePath();fs();
        ctx.strokeStyle=K.silver;ctx.lineWidth=.9;ctx.beginPath();ctx.moveTo(x+k*8.4,by-15);ctx.quadraticCurveTo(x+k*5,by-11,x+k*1,by-12.6);ctx.stroke();ctx.beginPath();ctx.moveTo(x+k*8.6,by-13.4);ctx.quadraticCurveTo(x+k*5,by-8.6,x,by-10);ctx.stroke();}
      // the daggers passing in front
      ctx.save();ctx.shadowColor=K.glow;ctx.shadowBlur=8;for(let i=0;i<2;i++){const a=now*1.6+i*Math.PI,px=x+Math.cos(a)*18,py=by-6+Math.sin(a)*5;if(Math.sin(a)<=0)continue;
        ctx.save();ctx.translate(px,py);ctx.rotate(a+Math.PI/2);ctx.scale(1.5,1.5);ctx.fillStyle='rgba(225,215,255,.9)';ctx.beginPath();ctx.moveTo(0,-6);ctx.lineTo(1.4,1);ctx.lineTo(0,2.4);ctx.lineTo(-1.4,1);ctx.closePath();ctx.fill();ctx.fillStyle=K.glow;ctx.fillRect(-2.2,1.6,4.4,1);ctx.restore();}ctx.restore();}}}
if(typeof outfitPart==='function'){const _opS2=outfitPart;outfitPart=function(K,part,v){if(!K||(K.kit!=='alchemist'&&K.kit!=='ghost'))return _opS2.apply(this,arguments);
  ctx.save();ctx.lineJoin='round';ctx.lineCap='round';try{shade2Part(K,part,v);}catch(e){}finally{ctx.restore();ctx.lineWidth=1.5;ctx.strokeStyle=v.OL;}};}
