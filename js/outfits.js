"use strict";
/* ================= job outfits, one family at a time (v1.23.0: the Arcanist family) =================
   js/hero2.js calls outfitPart(look, part, v) while it draws a hero: part is 'back' (behind the body), 'arm' (each
   arm, after the sleeve) or 'torso' (over the robe). v carries the drawing spot (x, y, by = shoulder line, hip, f =
   facing, bk = seen from behind, sway) and the outline helpers. Each job has its own shapes, not just its own colours:
     Arcanist      apprentice mage: bell sleeves, a short capelet with a hood down, a spellbook on the hip
     Stormcaller   storm mage: a stole streaming in the wind, a lightning-edged mantle, zigzag hems
     Hexweaver     dark witch: a tall spiky collar, a long torn cloak, a ragged hem, charms on a chain
     Chronomancer  time mage: a fitted coat with pleated tails, brass gear rings and a gear on the chest, an hourglass */
const ARC_LOOKS={
  arcanist:{kit:'apprentice',robe:'#4a3a8a',sleeve:'#4a3a8a',light:'#6a58b0',trim:'#e8c25a',leather:'#6b4423'},
  stormcaller:{kit:'storm',robe:'#e8eef8',sleeve:'#2e4fa8',light:'#ffffff',blue:'#2e4fa8',trim:'#ffe066'},
  hexweaver:{kit:'hex',robe:'#2a1838',sleeve:'#2a1838',light:'#3e2654',trim:'#c58cff',gem:'#e0a8ff'},
  chronomancer:{kit:'chrono',robe:'#1f4a4a',sleeve:'#1f4a4a',light:'#2e6a66',brass:'#d8a840',trim:'#ffe08a'}};
const outfitGlow=(col,fn,b=6)=>{ctx.save();ctx.shadowColor=col;ctx.shadowBlur=b;try{fn();}finally{ctx.restore();}};
function outfitGear(cx,cy,r,col,OL){ctx.fillStyle=col;ctx.strokeStyle=OL;ctx.lineWidth=1;ctx.beginPath();
  for(let i=0;i<16;i++){const a=i*Math.PI/8+now*.6,rr=i%2?r:r*1.28;ctx.lineTo(cx+Math.cos(a)*rr,cy+Math.sin(a)*rr);}ctx.closePath();ctx.fill();ctx.stroke();
  ctx.fillStyle='rgba(0,0,0,.35)';ctx.beginPath();ctx.arc(cx,cy,r*.42,0,7);ctx.fill();}
function outfitPart(K,part,v){const {x,y,by,f,bk,sway,OL,fs}=v;ctx.save();ctx.lineJoin='round';ctx.lineCap='round';
  try{
  if(part==='back'){
    if(K.kit==='apprentice'){ // the hood, down on the back
      ctx.fillStyle=K.light;ctx.strokeStyle=OL;ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(x-7,by-16);ctx.quadraticCurveTo(x-f*2,by-6,x+7,by-16);ctx.quadraticCurveTo(x,by-13,x-7,by-16);ctx.closePath();fs();
      ctx.beginPath();ctx.moveTo(x-4,by-14);ctx.quadraticCurveTo(x-f*1.5,by-4,x+4,by-14);ctx.stroke();}
    else if(K.kit==='storm'){ // two stole ends streaming up and back in the wind
      for(const k of [-1,1]){const w=Math.sin(now*6+k)*2.4;ctx.fillStyle=K.blue;ctx.strokeStyle=OL;ctx.lineWidth=1.1;ctx.beginPath();
        ctx.moveTo(x+k*3,by-15);ctx.bezierCurveTo(x-f*8+k*2,by-20+w,x-f*14+k*3,by-12-w,x-f*20+k*2,by-16+w*1.4);ctx.lineTo(x-f*19+k*2,by-12+w*1.4);ctx.bezierCurveTo(x-f*12+k*3,by-8-w,x-f*7+k*2,by-14+w,x+k*1.4,by-12);ctx.closePath();fs();
        ctx.strokeStyle=K.trim;ctx.lineWidth=.9;ctx.beginPath();ctx.moveTo(x-f*19.6+k*2,by-14+w*1.4);ctx.lineTo(x-f*17.6+k*2,by-15.4+w*1.3);ctx.stroke();}}
    else if(K.kit==='hex'){ // a long torn cloak and a tall spiky collar behind the head
      ctx.fillStyle=K.light;ctx.strokeStyle=OL;ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(x-9,by-15);ctx.lineTo(x+9,by-15);ctx.quadraticCurveTo(x+13-f*2,by-3,x+12-f*4+sway,y+1);
      for(let i=1;i<9;i++){const u=i/9;ctx.lineTo(x+12-f*4+sway-u*24,y+(i%2?-4:1.6)+Math.sin(now*4+i)*.6);}ctx.lineTo(x-12-f*4+sway,y+1);ctx.quadraticCurveTo(x-13-f*2,by-3,x-9,by-15);ctx.closePath();fs();
      ctx.fillStyle=K.robe;for(const k of [-1,1])for(const [dx,h] of [[5,9],[9,7],[12.5,4.5]]){ctx.beginPath();ctx.moveTo(x+k*(dx-2.2),by-15);ctx.lineTo(x+k*dx,by-15-h);ctx.lineTo(x+k*(dx+2),by-14);ctx.closePath();fs();}
      ctx.strokeStyle=K.trim;ctx.lineWidth=.8;for(const k of [-1,1]){ctx.beginPath();ctx.moveTo(x+k*5,by-23);ctx.lineTo(x+k*9,by-21.5);ctx.stroke();}}
    else if(K.kit==='chrono'){ // pleated coat tails
      for(let i=-2;i<=2;i++){if(!i)continue;const tx=x+i*4.6-f*2+sway*.8;ctx.fillStyle=i%2?K.robe:K.light;ctx.strokeStyle=OL;ctx.lineWidth=1.1;ctx.beginPath();ctx.moveTo(x+i*2.4,by-2);ctx.lineTo(x+i*3.6,by-2);ctx.lineTo(tx+Math.sign(i)*2,y+1.5);ctx.lineTo(tx-Math.sign(i)*1,y+2.5);ctx.closePath();fs();}
      ctx.strokeStyle=K.brass;ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(x-12-f*2+sway*.8,y+1.6);ctx.lineTo(x+12-f*2+sway*.8,y+1.6);ctx.stroke();}}
  else if(part==='arm'){const {sx,sy,hx,hy2,sleeve,k}=v,ang=Math.atan2(hy2-sy,hx-sx);
    if(K.kit==='apprentice'){ // wide bell sleeves with a gold hem
      ctx.translate(hx,hy2-2.6);ctx.rotate(ang-Math.PI/2);ctx.fillStyle=sleeve;ctx.strokeStyle=OL;ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(-2.4,-4.6);ctx.lineTo(2.4,-4.6);ctx.lineTo(5.6,1.4);ctx.lineTo(-5.6,1.4);ctx.closePath();fs();
      ctx.strokeStyle=K.trim;ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(-5,.7);ctx.lineTo(5,.7);ctx.stroke();}
    else if(K.kit==='storm'){ // blue sleeves with lightning bands
      ctx.translate(sx+(hx-sx)*.6,sy+(hy2-sy)*.6);ctx.rotate(ang);ctx.strokeStyle=K.trim;ctx.lineWidth=1.1;ctx.beginPath();ctx.moveTo(-3,-1.8);ctx.lineTo(-1,1.6);ctx.lineTo(1,-1.6);ctx.lineTo(3,1.8);ctx.stroke();}
    else if(K.kit==='hex'){ // ragged sleeves ending in tatters
      ctx.translate(hx,hy2-2.4);ctx.rotate(ang-Math.PI/2);ctx.fillStyle=sleeve;ctx.strokeStyle=OL;ctx.lineWidth=1.1;ctx.beginPath();ctx.moveTo(-2.6,-4.4);ctx.lineTo(2.6,-4.4);ctx.lineTo(4.8,1);ctx.lineTo(2.4,-.6);ctx.lineTo(1.2,2.6);ctx.lineTo(-.6,-.2);ctx.lineTo(-2.6,2.2);ctx.lineTo(-4.8,.6);ctx.closePath();fs();}
    else if(K.kit==='chrono'){ // brass rings round the forearm
      ctx.translate(sx+(hx-sx)*.66,sy+(hy2-sy)*.66);ctx.rotate(ang);ctx.fillStyle=K.brass;ctx.strokeStyle=OL;ctx.lineWidth=.9;for(const o of [-1.8,1.8]){ctx.beginPath();ctx.roundRect(o-.9,-2.8,1.8,5.6,.6);fs();}}}
  else if(part==='torso'&&!bk){const {hip,top,dark,lite}=v;
    if(K.kit==='apprentice'){
      // a rope belt with tassels, a spellbook on the hip, a scroll strap across the chest
      ctx.strokeStyle='#c8a868';ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(x-7,by-2.6);ctx.quadraticCurveTo(x,by-1,x+7.2,by-2.6);ctx.stroke();
      ctx.lineWidth=1.1;ctx.beginPath();ctx.moveTo(x-f*2,by-2);ctx.lineTo(x-f*2.6+sway*.3,by+6);ctx.moveTo(x-f*3.4,by-2);ctx.lineTo(x-f*4.4+sway*.3,by+5);ctx.stroke();
      ctx.strokeStyle=K.leather;ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(x-f*7,by-14);ctx.lineTo(x+f*6.6,by-2);ctx.stroke();
      ctx.save();ctx.translate(x+f*7.4,by+1.4);ctx.rotate(f*.2);ctx.fillStyle='#7a3a2a';ctx.strokeStyle=OL;ctx.lineWidth=1;ctx.beginPath();ctx.roundRect(-2.8,-3.4,5.6,6.8,1);fs();
      ctx.fillStyle='#f0e6c8';ctx.fillRect(-2.2,-2.8,.9,5.6);ctx.fillStyle=K.trim;ctx.beginPath();ctx.arc(.6,0,1,0,7);ctx.fill();ctx.restore();
      // a short layered capelet over the shoulders, gold-edged
      for(const [w,dy,c] of [[11.6,0,K.robe],[10.2,-1.8,K.light]]){ctx.fillStyle=c;ctx.strokeStyle=OL;ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(x-w,by-12+dy);ctx.quadraticCurveTo(x-w+1,by-17.6+dy,x,by-17.6+dy);ctx.quadraticCurveTo(x+w-1,by-17.6+dy,x+w,by-12+dy);
        for(let i=1;i<6;i++){const u=i/6;ctx.lineTo(x+w-u*2*w,by-12+dy+(i%2?1.8:0));}ctx.closePath();fs();}
      ctx.strokeStyle=K.trim;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x-10,by-13.6);ctx.quadraticCurveTo(x,by-11.6,x+10,by-13.6);ctx.stroke();
      ctx.strokeStyle=K.trim;ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(x-10,y-3.2);ctx.quadraticCurveTo(x,y-.2,x+10,y-3.2);ctx.stroke();}
    else if(K.kit==='storm'){
      // a zigzag lightning hem, a crossed blue sash, and a mantle with a jagged lightning edge
      ctx.strokeStyle=K.trim;ctx.lineWidth=1.4;ctx.beginPath();for(let i=0;i<=8;i++){const u=i/8;ctx.lineTo(x-10+u*20,y-3.8+(i%2?-2:0)+Math.abs(u-.5)*1.4);}ctx.stroke();
      ctx.strokeStyle=K.blue;ctx.lineWidth=2.2;ctx.beginPath();ctx.moveTo(x-6.6,by-14);ctx.lineTo(x+6.4,by-2.6);ctx.moveTo(x+6.6,by-14);ctx.lineTo(x-6.4,by-2.6);ctx.stroke();
      ctx.fillStyle=K.blue;ctx.strokeStyle=OL;ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(x-12,by-11);ctx.quadraticCurveTo(x-11,by-17.6,x,by-17.8);ctx.quadraticCurveTo(x+11,by-17.6,x+12,by-11);
      const zz=[[9,-13.6],[6,-9],[3,-12.6],[0,-8.4],[-3,-12.6],[-6,-9],[-9,-13.6]];for(const [a,b] of zz)ctx.lineTo(x+a,by+b);ctx.closePath();fs();
      outfitGlow(K.trim,()=>{ctx.strokeStyle=K.trim;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x+12,by-11);for(const [a,b] of zz)ctx.lineTo(x+a,by+b+.6);ctx.lineTo(x-12,by-11);ctx.stroke();},5);}
    else if(K.kit==='hex'){
      // a ragged hem, charms on a chain, a spiky collar in front
      ctx.fillStyle=K.robe;ctx.strokeStyle=OL;ctx.lineWidth=1.1;ctx.beginPath();ctx.moveTo(x-10.6,y-3);for(let i=0;i<=9;i++){const u=i/9;ctx.lineTo(x-10.6+u*21.2,y-2.6+(i%2?2.4:-.2)+Math.sin(now*3+i)*.3);}ctx.lineTo(x+10,y-5);ctx.lineTo(x-10,y-5);ctx.closePath();fs();
      ctx.strokeStyle='#9a8aa8';ctx.lineWidth=.9;ctx.beginPath();ctx.moveTo(x-7.4,by-2.2);ctx.quadraticCurveTo(x,by+1.4,x+7.4,by-2.2);ctx.stroke();
      for(const [a,len] of [[-4.6,3.4],[0,4.6],[4.6,3]]){const cy=by-.6+Math.abs(a)*-.2,sw2=Math.sin(now*3+a)*.6;ctx.strokeStyle='#9a8aa8';ctx.lineWidth=.7;ctx.beginPath();ctx.moveTo(x+a,cy);ctx.lineTo(x+a+sw2,cy+len);ctx.stroke();
        outfitGlow(K.gem,()=>{ctx.fillStyle=K.gem;ctx.beginPath();ctx.moveTo(x+a+sw2,cy+len-.4);ctx.lineTo(x+a+sw2+1.2,cy+len+1.2);ctx.lineTo(x+a+sw2,cy+len+2.8);ctx.lineTo(x+a+sw2-1.2,cy+len+1.2);ctx.closePath();ctx.fill();},4);}
      ctx.fillStyle=K.light;ctx.strokeStyle=OL;ctx.lineWidth=1.1;for(const k of [-1,1])for(const [dx,dy] of [[3,-15],[6.5,-14],[9.6,-12.4]]){ctx.beginPath();ctx.moveTo(x+k*(dx-2),by-15.8);ctx.lineTo(x+k*(dx+1.6),by+dy-4);ctx.lineTo(x+k*(dx+2.2),by-14.2);ctx.closePath();fs();}
      ctx.strokeStyle=K.trim;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x-10,y-5.2);ctx.lineTo(x+10,y-5.2);ctx.stroke();}
    else if(K.kit==='chrono'){
      // a row of brass buttons, a big turning gear on the chest, brass gear rings on the shoulders, an hourglass at the belt
      ctx.fillStyle=K.brass;for(const yy of [-3,1,5])if(by+yy<y-4){ctx.beginPath();ctx.arc(x+f*.4,by+yy,.8,0,7);ctx.fill();}
      ctx.strokeStyle=K.brass;ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(x-10,y-3.2);ctx.quadraticCurveTo(x,y-.2,x+10,y-3.2);ctx.stroke();
      ctx.fillStyle='#3a2a18';ctx.strokeStyle=OL;ctx.lineWidth=1.1;ctx.beginPath();ctx.roundRect(x-7.6,by-3.4,15.2,2.8,1);fs();
      outfitGear(x,by-7.4,2.8,K.brass,OL);
      for(const k of [-1,1])outfitGear(x+k*10.6,by-13.6,2.4,'#b8862a',OL);
      ctx.save();ctx.translate(x-f*6.4,by+1.6);ctx.fillStyle=K.brass;ctx.strokeStyle=OL;ctx.lineWidth=.9;ctx.fillRect(-2,-3.4,4,1);ctx.fillRect(-2,2.4,4,1);ctx.strokeRect(-2,-3.4,4,1);ctx.strokeRect(-2,2.4,4,1);
      ctx.fillStyle='rgba(200,240,255,.7)';ctx.beginPath();ctx.moveTo(-1.6,-2.4);ctx.lineTo(1.6,-2.4);ctx.lineTo(0,0);ctx.lineTo(1.6,2.4);ctx.lineTo(-1.6,2.4);ctx.lineTo(0,0);ctx.closePath();ctx.fill();ctx.stroke();
      ctx.fillStyle=K.trim;const sand=(now*.2)%1;ctx.beginPath();ctx.moveTo(-1.2*(1-sand),-2.2+sand*2);ctx.lineTo(1.2*(1-sand),-2.2+sand*2);ctx.lineTo(0,0);ctx.closePath();ctx.fill();ctx.restore();}}
  }catch(e){}finally{ctx.restore();ctx.lineWidth=1.5;ctx.strokeStyle=OL;}}
