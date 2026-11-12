"use strict";
/* ================= buildings that look like what they are =================
   Each town building is dressed for its trade, drawn over the plain house:
     store    striped awning, crates, barrels and sacks out front
     smithy   a stone chimney with smoke, a glowing forge and an anvil by the door
     chapel   a bell spire with a golden sun on top, flowers by the door
     travel   a fence with hay bales and a signpost
     storage  stacked crates and a pair of wide doors (the bank: gold trim and columns)
     guild    hanging banners either side of the door
     library  stacks of books in the window boxes and a reading lamp
     gemcut   glittering crystals on a stand
   All drawn in code, original art. */
function bldP(x,y,h=0){const p=proj(x,y);return{x:p.x,y:p.y-h};}
// an iso box sitting on the ground at world (x,y) with size w×d and height h
function isoBox(x,y,w,d,h,top,left,right){const P0=bldP(x,y+d),P1=bldP(x+w,y+d),P2_=bldP(x+w,y),P0h=bldP(x,y+d,h),P1h=bldP(x+w,y+d,h),P2h=bldP(x+w,y,h),P3h=bldP(x,y,h);
  poly([P0,P1,P1h,P0h],left,'#3a2716');poly([P1,P2_,P2h,P1h],right,'#3a2716');poly([P0h,P1h,P2h,P3h],top,'#3a2716');}
function barrel(x,y,col){const p=bldP(x,y);ctx.fillStyle=col;ctx.strokeStyle='#3a2716';ctx.lineWidth=1.2;ctx.beginPath();ctx.ellipse(p.x,p.y,7,3.5,0,0,Math.PI);ctx.lineTo(p.x-7,p.y-15);ctx.ellipse(p.x,p.y-15,7,3.5,0,Math.PI,0,true);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.fillStyle=shade(col,25);ctx.beginPath();ctx.ellipse(p.x,p.y-15,7,3.5,0,0,7);ctx.fill();ctx.stroke();ctx.strokeStyle='#5a4a3a';for(const h of [4,11]){ctx.beginPath();ctx.ellipse(p.x,p.y-h,7.2,3.6,0,0,Math.PI);ctx.stroke();}}
function sack(x,y){const p=bldP(x,y);ctx.fillStyle='#d8c49a';ctx.strokeStyle='#5a4632';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(p.x-6,p.y);ctx.quadraticCurveTo(p.x-8,p.y-9,p.x-3,p.y-12);ctx.lineTo(p.x+3,p.y-12);ctx.quadraticCurveTo(p.x+8,p.y-9,p.x+6,p.y);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.fillStyle='#8a6a42';ctx.fillRect(p.x-3,p.y-13,6,2);}
function dressBuilding(b){const role=b.npc&&b.npc.role,X0=b.x*TILE,Y0=b.y*TILE,X1=(b.x+b.w)*TILE,Y1=(b.y+b.h)*TILE,H=60,Xc=(X0+X1)/2,c=ctx;c.save();
  switch(role){
    case 'shop':{ // a striped awning across the front, goods stacked out front
      const n=8,front=16,top=42,low=32;for(let i=0;i<n;i++){const xa=X0+8+(X1-X0-16)*i/n,xb=X0+8+(X1-X0-16)*(i+1)/n;
        poly([bldP(xa,Y1,top),bldP(xb,Y1,top),bldP(xb,Y1+front,low),bldP(xa,Y1+front,low)],i%2?'#f4ead6':(b.roof||'#c84a3a'),'rgba(60,30,20,.6)');}
      for(let i=0;i<n;i++){const xa=X0+8+(X1-X0-16)*i/n,xb=X0+8+(X1-X0-16)*(i+1)/n,m=bldP((xa+xb)/2,Y1+front,low-4);c.fillStyle=i%2?'#f4ead6':(b.roof||'#c84a3a');c.beginPath();c.arc(m.x,m.y,4,0,Math.PI);c.fill();}
      isoBox(X0+6,Y1+6,16,14,12,'#c8a060','#a07a42','#8a6a3a');isoBox(X0+8,Y1+8,12,10,22,'#d8b070','#b08a52','#9a7a4a');
      barrel(X1-14,Y1+12,'#8a5a32');barrel(X1-30,Y1+20,'#7a4a2a');sack(X0+32,Y1+16);sack(X0+40,Y1+22);
      // a basket of apples on a crate
      const ap=bldP(Xc+24,Y1+14);isoBox(Xc+16,Y1+8,14,12,9,'#b08a52','#8a6a3a','#7a5a32');for(let i=0;i<5;i++){c.fillStyle=i%2?'#d83a2a':'#e8c040';c.beginPath();c.arc(ap.x-6+i*3,ap.y-12-(i%2)*2,2.6,0,7);c.fill();}
      break;}
    case 'smith':{ // stone chimney with smoke, forge and anvil outside
      const ch=bldP(X1-22,Y0+22,H+44);c.fillStyle='#7a7470';c.strokeStyle='#3a3430';c.lineWidth=1.3;c.fillRect(ch.x-7,ch.y,14,30);c.strokeRect(ch.x-7,ch.y,14,30);c.fillStyle='#5a5450';c.fillRect(ch.x-8,ch.y-3,16,4);
      for(let i=0;i<4;i++){const t=((now*.35+i/4)%1),sx=ch.x+Math.sin(now+i*2)*4+t*10,sy=ch.y-6-t*40;c.fillStyle=`rgba(140,140,140,${.45*(1-t)})`;c.beginPath();c.arc(sx,sy,4+t*8,0,7);c.fill();}
      // the forge: a stone hearth with a glowing mouth
      isoBox(X1-34,Y1+6,22,16,18,'#8a8480','#6a6460','#5a5450');const fm=bldP(X1-23,Y1+22,8),gl=.6+Math.sin(now*6)*.2+Math.random()*.1;
      c.fillStyle=`rgba(255,${120+Math.random()*40|0},40,${gl})`;c.beginPath();c.ellipse(fm.x,fm.y,6,4,0,0,7);c.fill();
      const gg=c.createRadialGradient(fm.x,fm.y,1,fm.x,fm.y,26);gg.addColorStop(0,'rgba(255,150,60,.35)');gg.addColorStop(1,'rgba(255,120,40,0)');c.fillStyle=gg;c.fillRect(fm.x-26,fm.y-26,52,52);
      // anvil
      const an=bldP(X0+30,Y1+18);c.fillStyle='#4a4e58';c.strokeStyle='#1a1c22';c.lineWidth=1.2;c.fillRect(an.x-3,an.y-9,6,9);c.beginPath();c.moveTo(an.x-11,an.y-9);c.lineTo(an.x+9,an.y-9);c.lineTo(an.x+12,an.y-13);c.lineTo(an.x-8,an.y-14);c.closePath();c.fill();c.stroke();
      break;}
    case 'heal':{ // a bell spire with a golden sun, flowers along the front
      const base=bldP(Xc,(Y0+Y1)/2,H+52+16),tip=bldP(Xc,(Y0+Y1)/2,H+52+16+62);c.fillStyle='#e8e0d0';c.strokeStyle='#6b5640';c.lineWidth=1.3;c.fillRect(base.x-9,base.y-22,18,26);c.strokeRect(base.x-9,base.y-22,18,26);
      c.fillStyle='#3a2a1a';c.beginPath();c.arc(base.x,base.y-12,5,Math.PI,0);c.lineTo(base.x+5,base.y-5);c.lineTo(base.x-5,base.y-5);c.closePath();c.fill();
      c.fillStyle='#e8c25a';c.beginPath();c.arc(base.x,base.y-10+Math.sin(now*2)*.8,2.4,0,7);c.fill();
      c.fillStyle='#6a7a9a';c.beginPath();c.moveTo(base.x-12,base.y-22);c.lineTo(tip.x,tip.y);c.lineTo(base.x+12,base.y-22);c.closePath();c.fill();c.stroke();
      const s=tip.y-8,glow=.7+Math.sin(now*2)*.2;c.fillStyle=`rgba(255,215,90,${glow})`;c.beginPath();c.arc(tip.x,s,5,0,7);c.fill();c.strokeStyle='#e8c25a';c.lineWidth=1.2;
      for(let i=0;i<8;i++){const a=i*Math.PI/4+now*.3;c.beginPath();c.moveTo(tip.x+Math.cos(a)*6.5,s+Math.sin(a)*6.5);c.lineTo(tip.x+Math.cos(a)*9.5,s+Math.sin(a)*9.5);c.stroke();}
      for(let i=0;i<7;i++){const p=bldP(X0+10+i*((X1-X0-20)/6),Y1+6);c.fillStyle='#4e8a3a';c.fillRect(p.x-1,p.y-6,2,6);c.fillStyle=['#f07ca0','#ffd24a','#c8a0ff'][i%3];c.beginPath();c.arc(p.x,p.y-7,2.6,0,7);c.fill();}
      break;}
    case 'warp':{ // a fence with hay bales and a signpost
      for(let i=0;i<=5;i++){const p=bldP(X0+4+i*16,Y1+26);c.fillStyle='#8a6a42';c.strokeStyle='#3a2716';c.lineWidth=1;c.fillRect(p.x-2,p.y-14,4,14);c.strokeRect(p.x-2,p.y-14,4,14);}
      const f0=bldP(X0+4,Y1+26),f1=bldP(X0+84,Y1+26);c.strokeStyle='#8a6a42';c.lineWidth=2.4;for(const h of [5,11]){c.beginPath();c.moveTo(f0.x,f0.y-h);c.lineTo(f1.x,f1.y-h);c.stroke();}
      isoBox(X1-30,Y1+6,18,12,11,'#e8d07a','#c8b05a','#b09a4a');isoBox(X1-26,Y1+18,16,11,10,'#e8d07a','#c8b05a','#b09a4a');
      const sp=bldP(Xc+34,Y1+20);c.fillStyle='#6a4a2a';c.fillRect(sp.x-1.5,sp.y-34,3,34);c.fillStyle='#c8a060';c.strokeStyle='#3a2716';c.lineWidth=1;
      for(const [dy,dir] of [[-32,1],[-24,-1]]){c.beginPath();c.moveTo(sp.x,sp.y+dy);c.lineTo(sp.x+dir*16,sp.y+dy);c.lineTo(sp.x+dir*20,sp.y+dy+3);c.lineTo(sp.x+dir*16,sp.y+dy+6);c.lineTo(sp.x,sp.y+dy+6);c.closePath();c.fill();c.stroke();}
      break;}
    case 'storage':{ // stacked crates; the bank gets gold trim and pillars
      const bank=/Bank/i.test(b.name);
      if(bank){for(const px of [Xc-24,Xc+24]){const a=bldP(px,Y1+3),t=bldP(px,Y1+3,50);c.fillStyle='#efe6d2';c.strokeStyle='#8a7a5a';c.lineWidth=1.2;c.fillRect(a.x-4,t.y,8,a.y-t.y);c.strokeRect(a.x-4,t.y,8,a.y-t.y);c.fillStyle='#d8cdb4';c.fillRect(a.x-6,t.y-3,12,4);c.fillRect(a.x-6,a.y-3,12,3);}
        const em=bldP(Xc,Y1,48);c.fillStyle='#e8c25a';c.strokeStyle='#7a5a1a';c.beginPath();c.arc(em.x,em.y,6,0,7);c.fill();c.stroke();c.fillStyle='#7a5a1a';c.font='800 8px sans-serif';c.textAlign='center';c.fillText('G',em.x,em.y+3);}
      else{isoBox(X0+6,Y1+4,14,12,12,'#c8a060','#a07a42','#8a6a3a');isoBox(X0+20,Y1+4,14,12,12,'#c8a060','#a07a42','#8a6a3a');isoBox(X0+12,Y1+6,14,12,24,'#d8b070','#b08a52','#9a7a4a');
        isoBox(X1-22,Y1+8,14,12,12,'#c8a060','#a07a42','#8a6a3a');barrel(X1-34,Y1+16,'#7a4a2a');}
      break;}
    case 'job':{ // hanging banners either side of the door
      for(const bx of [Xc-30,Xc+30]){const t=bldP(bx,Y1,54),wv=Math.sin(now*1.5+bx)*1.2;c.fillStyle=b.roof||'#2e4f8e';c.strokeStyle='#1a1408';c.lineWidth=1;
        c.beginPath();c.moveTo(t.x-7,t.y);c.lineTo(t.x+7,t.y);c.lineTo(t.x+7+wv,t.y+26);c.lineTo(t.x+wv,t.y+21);c.lineTo(t.x-7+wv,t.y+26);c.closePath();c.fill();c.stroke();
        c.fillStyle='#e8c25a';c.fillRect(t.x-8,t.y-2,16,3);c.beginPath();c.moveTo(t.x+wv*.5,t.y+6);c.lineTo(t.x+4+wv*.5,t.y+11);c.lineTo(t.x+wv*.5,t.y+16);c.lineTo(t.x-4+wv*.5,t.y+11);c.closePath();c.fill();}
      break;}
    case 'library':{ // window boxes full of books, a reading lamp by the door
      for(const wx of [X0+30,X1-56]){for(let i=0;i<6;i++){const p=bldP(wx+3+i*4,Y1+1,20);c.fillStyle=['#8e2a22','#2e4f8e','#3e7a4a','#a8823a','#5a3a8a','#8a5a32'][i];c.fillRect(p.x-1.6,p.y-9+(i%2),3.2,9-(i%2));}}
      const lp=bldP(Xc+20,Y1+8);c.fillStyle='#3a2a1a';c.fillRect(lp.x-1,lp.y-30,2,30);const g=.7+Math.sin(now*3)*.15;c.fillStyle=`rgba(255,220,130,${g})`;c.beginPath();c.arc(lp.x,lp.y-33,4,0,7);c.fill();
      const gg=c.createRadialGradient(lp.x,lp.y-33,1,lp.x,lp.y-33,20);gg.addColorStop(0,'rgba(255,220,130,.3)');gg.addColorStop(1,'rgba(255,220,130,0)');c.fillStyle=gg;c.fillRect(lp.x-20,lp.y-53,40,40);
      break;}
    case 'gemcut':{ // crystals glittering on a stand
      isoBox(Xc+16,Y1+6,18,12,10,'#6a5a7a','#4a3a5a','#3a2a4a');const st=bldP(Xc+25,Y1+12,10);
      for(const [dx,h,col] of [[-5,12,'#c8a0ff'],[1,16,'#8fd0f0'],[6,10,'#ffb3d0']]){c.fillStyle=col;c.strokeStyle='#2a1a3a';c.lineWidth=1;c.beginPath();c.moveTo(st.x+dx-3,st.y);c.lineTo(st.x+dx,st.y-h);c.lineTo(st.x+dx+3,st.y);c.closePath();c.fill();c.stroke();
        if(Math.sin(now*3+dx)>.85){c.fillStyle='#fff';c.fillRect(st.x+dx-1,st.y-h+2,2,2);}}
      break;}
  }
  c.restore();}
const _drawBuildingB=drawBuilding;
drawBuilding=function(b){const r=_drawBuildingB.apply(this,arguments);try{dressBuilding(b);}catch(e){}return r;};
