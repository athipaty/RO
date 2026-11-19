"use strict";
/* ================= Aurelmark's own buildings (v1.35.0) =================
   Like townbldg.js does for Hearthvale: pieces of the capital that have a design of their own. Bodies are drawn once into
   the building cache; moving parts (water, flames, banners) are drawn live on top. Uses townbldg.js's helpers. */
const cbRing=(cx,cy,r,h,a0=0,a1=Math.PI*2,n=36)=>{const out=[];for(let i=0;i<=n;i++){const a=a0+(a1-a0)*i/n;out.push(TB_P(cx+Math.cos(a)*r,cy+Math.sin(a)*r,h));}return out;};
// a round drum: the side facing the camera (from the right-most point round the front to the left-most) and the top
function cbCyl(cx,cy,r,h0,h1,side,top,line){poly([...cbRing(cx,cy,r,h1,-Math.PI/4,Math.PI*.75),...cbRing(cx,cy,r,h0,Math.PI*.75,-Math.PI/4)],side,line||TB_OL);
  if(top)poly(cbRing(cx,cy,r,h1),top,line||TB_OL);}

/* ---------------- the great fountain ---------------- */
// a wide round basin on a paved ring, a tiered column with two bowls, and a golden crown on top; the water is live
const cbFountGeo=b=>{const X0=b.x*TILE,Y0=b.y*TILE,X1=(b.x+b.w)*TILE,Y1=(b.y+b.h)*TILE;return{cx:(X0+X1)/2,cy:(Y0+Y1)/2,R:56,mid:{r:26,h:44},top:{r:14,h:74}};};
function cbFount(b){const G=cbFountGeo(b),{cx,cy,R}=G,st='#e2dacb',stS='#bdb3a0',stT='#f0eadc',gold='#e8c25a';
  // the paving under it: a ring of pale flagstones with a darker border
  poly(cbRing(cx,cy,R+12,0),'#cfc7b6','#8a8272');ctx.globalAlpha=.35;for(let k=0;k<16;k++){const a=k*Math.PI/8;tbSeg(TB_P(cx+Math.cos(a)*R,cy+Math.sin(a)*R),TB_P(cx+Math.cos(a)*(R+12),cy+Math.sin(a)*(R+12)),'#6a6252',1);}ctx.globalAlpha=1;
  // the basin: an outer wall with a broad rim, water inside
  cbCyl(cx,cy,R,0,18,stS,stT);poly(cbRing(cx,cy,R-7,18),'#3f7fae','#6a6252');
  // carved panels round the front of the basin wall
  for(let k=0;k<6;k++){const a=-Math.PI/4+(k+.5)*Math.PI/6,p=TB_P(cx+Math.cos(a)*R,cy+Math.sin(a)*R,9);ctx.fillStyle='rgba(120,110,95,.45)';ctx.fillRect(p.x-4,p.y-4,8,8);}
  // the column, the middle bowl, the upper stem and the top bowl
  cbCyl(cx,cy,9,16,G.mid.h-6,st,null);for(const h of [24,32])poly(cbRing(cx,cy,10,h,-Math.PI/4,Math.PI*.75),null,'rgba(90,80,70,.5)');
  cbCyl(cx,cy,G.mid.r,G.mid.h-6,G.mid.h,stS,stT);poly(cbRing(cx,cy,G.mid.r-4,G.mid.h),'#4a8cba');
  cbCyl(cx,cy,6,G.mid.h,G.top.h-4,st,null);
  cbCyl(cx,cy,G.top.r,G.top.h-4,G.top.h,stS,stT);poly(cbRing(cx,cy,G.top.r-3,G.top.h),'#5a9cc8');
  // the crown of Aurelmark on top
  {const p=TB_P(cx,cy,G.top.h+4),c=ctx;c.fillStyle=gold;c.strokeStyle='#8a6a1a';c.lineWidth=1.2;
    c.beginPath();c.moveTo(p.x-9,p.y);c.lineTo(p.x-10,p.y-12);c.lineTo(p.x-5,p.y-6);c.lineTo(p.x,p.y-15);c.lineTo(p.x+5,p.y-6);c.lineTo(p.x+10,p.y-12);c.lineTo(p.x+9,p.y);c.closePath();c.fill();c.stroke();
    c.fillRect(p.x-9,p.y-1,18,4);c.strokeRect(p.x-9,p.y-1,18,4);c.fillStyle='#c8283a';c.beginPath();c.arc(p.x,p.y+1,1.6,0,7);c.fill();
    for(const dx of [-10,0,10]){c.fillStyle='#fff3c0';c.beginPath();c.arc(p.x+dx,p.y-(dx?12:15),1.6,0,7);c.fill();}}
}
function cbFountLive(b){const G=cbFountGeo(b),{cx,cy,R}=G,c=ctx,t=now;c.save();
  // ripples on the basin
  for(let k=0;k<3;k++){const ph=(t*.35+k/3)%1,r=G.mid.r+4+ph*(R-G.mid.r-12);c.globalAlpha=(1-ph)*.5;poly(cbRing(cx,cy,r,18,0,Math.PI*2,28),null,'#d8f0ff');}
  c.globalAlpha=1;
  // curtains of water from the top bowl into the middle one, and from the middle bowl into the basin
  c.lineCap='round';
  for(const [from,to,h0,h1,n,w] of [[G.top.r,G.mid.r-6,G.top.h,G.mid.h,8,1.6],[G.mid.r,R-16,G.mid.h,18,12,2]])
    for(let k=0;k<n;k++){const a=k*Math.PI*2/n+.2;if(Math.sin(a+Math.PI/4)<-.35)continue; // only the jets on the near side show
      const s=TB_P(cx+Math.cos(a)*from,cy+Math.sin(a)*from,h0),e=TB_P(cx+Math.cos(a)*to,cy+Math.sin(a)*to,h1),m={x:(s.x*.4+e.x*.6),y:Math.min(s.y,e.y)-6};
      c.strokeStyle='rgba(215,240,255,.75)';c.lineWidth=w;c.beginPath();c.moveTo(s.x,s.y);c.quadraticCurveTo(m.x,m.y,e.x,e.y);c.stroke();
      const ph=(t*1.6+k*.37)%1,q=1-ph;c.fillStyle='rgba(255,255,255,.9)';c.beginPath();c.arc(q*q*s.x+2*q*ph*m.x+ph*ph*e.x,q*q*s.y+2*q*ph*m.y+ph*ph*e.y,1.4,0,7);c.fill();}
  // the jet out of the crown
  {const p=TB_P(cx,cy,G.top.h+20);for(let k=0;k<4;k++){const a=k*Math.PI/2+t*.6,dx=Math.cos(a)*10,dy=Math.sin(a)*4;c.strokeStyle='rgba(225,245,255,.8)';c.lineWidth=1.4;
    c.beginPath();c.moveTo(p.x,p.y);c.quadraticCurveTo(p.x+dx*.6,p.y-10,p.x+dx,p.y+18+dy);c.stroke();}}
  // a glint on the crown now and then
  {const ph=(t*.5)%3;if(ph<.4){const p=TB_P(cx,cy,G.top.h+14);c.globalAlpha=1-ph/.4;c.strokeStyle='#fff8d0';c.lineWidth=1.4;c.beginPath();c.moveTo(p.x-6,p.y);c.lineTo(p.x+6,p.y);c.moveTo(p.x,p.y-6);c.lineTo(p.x,p.y+6);c.stroke();}}
  c.restore();}
const cbFountLights=b=>{const G=cbFountGeo(b);return tbLit([[G.cx,G.cy,G.top.h+10]]);};

/* ---------------- the Aurel Market ---------------- */
// a royal market hall: a pale stone arcade whose arches show the goods inside, crimson crown banners, a red hip roof with
// a gilded clock cupola and a pennant, striped stalls (fruit, cloth) on the forecourt and a gold-coin sign on a bracket
const cbMarketGeo=b=>{const X0=b.x*TILE,Y0=b.y*TILE,X1=(b.x+b.w)*TILE,Y1=(b.y+b.h)*TILE,bx0=X0+8,bx1=X1-40,by0=Y0+6,byF=Y1-46;
  return{X0,Y0,X1,Y1,bx0,bx1,by0,byF,xc:(bx0+bx1)/2,yc:(by0+byF)/2,H1:50,H2:86,RH:44};};
// an arched opening on a face: straight sides up to hs, then a half-round head
function cbArch(S,u0,u1,h0,hs,fill,line){const r=(u1-u0)/2,pts=[S(u0,h0),S(u0,hs)];for(let i=1;i<12;i++){const a=Math.PI-i*Math.PI/12;pts.push(S(u0+r+Math.cos(a)*r,hs+Math.sin(a)*r*1.1));}
  pts.push(S(u1,hs),S(u1,h0));poly(pts,fill,line===undefined?TB_OL:line);}
// a market stall: four posts and a striped canopy sloping to the front
function cbStall(x0,y0,x1,y1,c1,c2,goods){const P=TB_P,c=ctx,hT=34,hF=26;
  tbBox(x0,y0,x1,y1,0,12,'#8a6040','#6a4628','#a87a50');goods(P,x0,y0,x1,y1);
  for(const [x,y] of [[x0,y1],[x1,y1],[x1,y0]])tbSeg(P(x,y,12),P(x,y,y===y1?hF:hT),'#5a3a1c',2);
  const n=6;for(let i=0;i<n;i++){const a=x0-4+(x1-x0+8)*i/n,z=x0-4+(x1-x0+8)*(i+1)/n;poly([P(a,y0-4,hT),P(z,y0-4,hT),P(z,y1+6,hF),P(a,y1+6,hF)],i%2?c2:c1,'rgba(40,20,10,.5)');}
  // the scalloped valance along the front
  for(let i=0;i<n;i++){const a=P(x0-4+(x1-x0+8)*(i+.5)/n,y1+6,hF);c.fillStyle=i%2?c2:c1;c.beginPath();c.arc(a.x,a.y,4.2,0,Math.PI);c.fill();}}
function cbMarket(b){const G=cbMarketGeo(b),{X0,Y0,X1,Y1,bx0,bx1,by0,byF,xc,yc,H1,H2,RH}=G,P=TB_P,c=ctx;
  const stone='#ece0c8',stoneR='#cbbd9f',trim='#d8c8a4',gold='#e8c25a',crim='#a8283a',roof=b.roof||'#a8452e';
  poly([P(bx0,Y1),P(X1+26,Y1),P(X1+26,Y0+26),P(bx1,Y0)],'rgba(0,0,0,.2)');
  // the two storeys: the arcade below, a plainer upper floor with a gilded frieze between
  tbBox(bx0,by0,bx1,byF,0,H2,stone,stoneR);
  const F=tbF(bx0,byF),R=tbR(bx1,byF),W=bx1-bx0,D=byF-by0;
  // quoins and the cornice
  for(const [S,L] of [[F,W],[R,D]]){for(let h=0;h<H2;h+=12){tbQuad(S,0,h,h%24?7:11,h+10,trim,'rgba(90,70,40,.35)');tbQuad(S,L-(h%24?7:11),h,L,h+10,trim,'rgba(90,70,40,.35)');}
    tbQuad(S,0,H1,L,H1+6,gold,'#8a6a1a');tbQuad(S,0,H2-5,L,H2,trim);}
  // the arcade: five arches; through each, a counter with goods
  const n=5,aw=(W-24)/n,goods=[['#c84a3a','#e8c040','#5aa04a'],['#4a7ac8','#c8d0d8','#8a8a92'],['#a85ac8','#e8a0c0','#f0e0a0'],['#c8d0d8','#8a6a42','#e8c25a'],['#5aa04a','#d88a3a','#c84a3a']];
  for(let i=0;i<n;i++){const u0=12+i*aw+4,u1=u0+aw-8;cbArch(F,u0,u1,0,30,'#3a2c22');
    tbQuad(F,u0+2,0,u1-2,12,'#7a5232','#4a3018');const gs=goods[i];
    for(let k=0;k<5;k++){const p=F(u0+5+(u1-u0-10)*k/4,12);c.fillStyle=gs[k%3];c.fillRect(p.x-3,p.y-(k%2?8:6),6,k%2?8:6);}
    for(let k=0;k<3;k++){const p=F(u0+8+(u1-u0-16)*k/2,26);c.fillStyle=gs[(k+1)%3];c.fillRect(p.x-2.5,p.y-5,5,5);}
    cbArch(F,u0,u1,0,30,null,'#8a7a5a');}
  // upper floor: round windows over every pier, a crimson banner with a gold crown between them
  for(let i=0;i<=n;i++){const u=12+i*aw;if(i>0&&i<n){const p=F(u,H1+22);tbDisc(p.x,p.y,6,6,'#3a4a5a',TB_OL);tbDisc(p.x-1.5,p.y-1.5,2.5,2.5,'rgba(200,230,255,.5)');}}
  for(let i=0;i<n;i++){const u=12+i*aw+aw/2;if(i===2)continue;
    poly([F(u-7,H2-6),F(u+7,H2-6),F(u+7,H1+12),F(u,H1+7),F(u-7,H1+12)],crim,'#5a1018');
    const p=F(u,H2-16);c.fillStyle=gold;c.beginPath();c.moveTo(p.x-4,p.y+2);c.lineTo(p.x-5,p.y-4);c.lineTo(p.x-2,p.y-1);c.lineTo(p.x,p.y-5);c.lineTo(p.x+2,p.y-1);c.lineTo(p.x+5,p.y-4);c.lineTo(p.x+4,p.y+2);c.closePath();c.fill();}
  // the side: a tall arched side door, a window above
  cbArch(R,D/2-12,D/2+12,0,26,'#6a4426');tbSeg(R(D/2,0),R(D/2,38),'#3a2410',1.2);cbArch(R,D/2-8,D/2+8,H1+12,H1+20,'#3a4a5a');
  // the hip roof, its ridge along the street
  {const e=10,hh=D/2,r1=P(bx0+hh,yc,H2+RH),r2=P(bx1-hh,yc,H2+RH),eT=P(bx0-e,by0-e,H2),eR=P(bx1+e,by0-e,H2),eB=P(bx1+e,byF+e,H2),eL=P(bx0-e,byF+e,H2);
    poly([eT,eR,r2,r1],shade(roof,-40));poly([eL,eT,r1],shade(roof,-25),shade(roof,-60));poly([eR,eB,r2],shade(roof,-15),shade(roof,-60));poly([eB,eL,r1,r2],roof,shade(roof,-60));
    c.globalAlpha=.3;for(let k=1;k<6;k++){const t=k/6;tbSeg(P(bx0-e+(hh+e)*t,byF+e-(byF+e-yc)*t,H2+RH*t),P(bx1+e-(hh+e)*t,byF+e-(byF+e-yc)*t,H2+RH*t),shade(roof,-70),1);}c.globalAlpha=1;
    tbSeg(r1,r2,gold,2.4);}
  // the clock cupola on the ridge: a square drum, a clock on the front, a gilded dome
  {const cx=xc,cy=yc,s=15,h0=H2+RH-8,h1=h0+30;tbBox(cx-s,cy-s,cx+s,cy+s,h0,h1,stone,stoneR,null);
    tbQuad(tbF(cx-s,cy+s),0,h1-4,2*s,h1,gold,'#8a6a1a');tbQuad(tbR(cx+s,cy+s),0,h1-4,2*s,h1,shade(gold,-15),'#8a6a1a');
    const k=TB_P(cx,cy+s,h0+15);tbDisc(k.x,k.y,9,9,'#f6f0e0','#8a6a1a');for(let i=0;i<12;i++){const a=i*Math.PI/6;c.fillStyle='#3a2a1a';c.fillRect(k.x+Math.cos(a)*7-.6,k.y+Math.sin(a)*7-.6,1.2,1.2);}
    cbCyl(cx,cy,s+1,h1,h1+4,shade(gold,-10),gold,'#8a6a1a');
    const d0=TB_P(cx,cy,h1+4);c.fillStyle=gold;c.strokeStyle='#8a6a1a';c.lineWidth=1.2;c.beginPath();c.ellipse(d0.x,d0.y,s*.82,s*.5,0,Math.PI,0);c.quadraticCurveTo(d0.x+s*.6,d0.y-22,d0.x,d0.y-26);c.quadraticCurveTo(d0.x-s*.6,d0.y-22,d0.x-s*.82,d0.y);c.fill();c.stroke();
    c.fillStyle='rgba(255,250,220,.5)';c.beginPath();c.ellipse(d0.x-5,d0.y-12,2.5,6,-.3,0,7);c.fill();
    tbSeg({x:d0.x,y:d0.y-26},{x:d0.x,y:d0.y-50},'#5a4a2a',1.6);}
  // the forecourt: a fruit stall on the left, a cloth stall on the right of the door
  cbStall(X0+6,byF+8,X0+64,byF+30,'#c8283a','#f4ead2',(P,x0,y0,x1,y1)=>{const cols=['#e8c040','#c84a3a','#5aa04a','#d88a3a'];
    for(let i=0;i<8;i++){const p=P(x0+6+i*6.8,y0+6+(i%2)*8,12);tbDisc(p.x,p.y-3,3.2,3.2,cols[i%4],'rgba(0,0,0,.3)');}});
  cbStall(bx1-62,byF+8,bx1-6,byF+30,'#2a5aa8','#e8c25a',(P,x0,y0,x1,y1)=>{const cols=['#a85ac8','#c8283a','#2a8a7a','#e8d8b8','#4a6ac8'];
    for(let i=0;i<5;i++){const a=P(x0+5+i*10,y1-4,12);c.fillStyle=cols[i];c.strokeStyle='rgba(0,0,0,.35)';c.lineWidth=1;c.beginPath();c.ellipse(a.x,a.y-5,4.5,6,0,0,7);c.fill();c.stroke();}});
  // goods by the side door: crates and a barrel
  tbCrate(bx1+6,by0+30,20,18,0,18,'#c8a060');tbCrate(bx1+8,by0+32,16,14,18,32,'#b89058');barrel(bx1+18,by0+70,'#7a4a2a');
  // the hanging sign: a gold coin with a crown on an iron bracket off the front corner
  {const a=P(bx1,byF,H1+30),z=P(bx1,byF+24,H1+30);tbSeg(a,z,'#3a3632',2.4);tbSeg(P(bx1,byF,H1+16),P(bx1,byF+14,H1+30),'#3a3632',1.6);}
}
function cbMarketLive(b){const G=cbMarketGeo(b),P=TB_P,c=ctx,t=now;c.save();
  // the sign swings a little on its bracket
  {const a=P(G.bx1,G.byF+20,G.H1+30),sw=Math.sin(t*1.4)*.12;c.translate(a.x,a.y);c.rotate(sw);
    tbSeg({x:-4,y:0},{x:-4,y:6},'#3a3632',1);tbSeg({x:4,y:0},{x:4,y:6},'#3a3632',1);
    c.fillStyle='#e8c25a';c.strokeStyle='#8a6a1a';c.lineWidth=1.6;c.beginPath();c.arc(0,17,11,0,7);c.fill();c.stroke();c.beginPath();c.arc(0,17,8,0,7);c.stroke();
    c.fillStyle='#8a6a1a';c.beginPath();c.moveTo(-5,20);c.lineTo(-6,13);c.lineTo(-2.5,16);c.lineTo(0,11);c.lineTo(2.5,16);c.lineTo(6,13);c.lineTo(5,20);c.closePath();c.fill();}
  c.restore();c.save();
  // the pennant on the cupola
  {const top=P(G.xc,G.yc,G.H2+G.RH-8+30+4),x=top.x,y=top.y-50,ph=t*4;c.fillStyle='#c8283a';c.strokeStyle='#5a1018';c.lineWidth=1;c.beginPath();c.moveTo(x,y);
    for(let i=1;i<=6;i++){const u=i/6;c.lineTo(x+u*26,y+4*u+Math.sin(ph-u*3)*3*u);}for(let i=6;i>=0;i--){const u=i/6;c.lineTo(x+u*26,y+12-4*u+Math.sin(ph-u*3)*3*u);}c.closePath();c.fill();c.stroke();}
  // the clock hands tell the game's hour
  {const k=P(G.xc,G.yc+15,G.H2+G.RH-8+15),h=typeof gameHour==='function'?gameHour():12,ah=(h%12)/12*Math.PI*2-Math.PI/2,am=(h%1)*Math.PI*2-Math.PI/2;
    tbSeg(k,{x:k.x+Math.cos(ah)*4.5,y:k.y+Math.sin(ah)*4.5},'#2a1a10',1.6);tbSeg(k,{x:k.x+Math.cos(am)*6.5,y:k.y+Math.sin(am)*6.5},'#2a1a10',1);}
  c.restore();}
const cbMarketLights=b=>{const G=cbMarketGeo(b),W=G.bx1-G.bx0,aw=(W-24)/5,out=[];for(let i=0;i<5;i++)out.push([G.bx0+12+i*aw+aw/2,G.byF,18]);
  for(let i=1;i<5;i++)out.push([G.bx0+12+i*aw,G.byF,G.H1+22]);out.push([G.xc,G.yc+15,G.H2+G.RH+7]);return tbLit(out);};

/* ---------------- the Gemcutter ---------------- */
// a jeweller's house of grey-violet stone with a round tower; over the tower's spire a great crystal floats and turns;
// a bay window of gems on velvet, a cutting wheel that spins and throws sparks, a split geode by the door, a gem sign
const cbGemGeo=b=>{const X0=b.x*TILE,Y0=b.y*TILE,X1=(b.x+b.w)*TILE,Y1=(b.y+b.h)*TILE,bx0=X0+10,bx1=X0+140,by0=Y0+34,byF=Y1-42;
  return{X0,Y0,X1,Y1,bx0,bx1,by0,byF,H:74,RH:36,tw:{x:X1-50,y:Y0+52,r:28,h:118,rh:58},wheel:{x:X0+26,y:Y1-16},geode:{x:X1-26,y:Y1-30}};};
const CB_GEMS=['#e83a5a','#3a8ae8','#3ac88a','#b05ae8','#f0c040','#e8e8f8'];
// a cut gem seen from the side: a flat table, a crown and a pointed pavilion
function cbGem(x,y,s,col){const c=ctx;c.fillStyle=col;c.strokeStyle=shade(col,-50);c.lineWidth=Math.max(.8,s*.12);
  c.beginPath();c.moveTo(x-s*.5,y-s*.9);c.lineTo(x+s*.5,y-s*.9);c.lineTo(x+s,y-s*.5);c.lineTo(x,y+s*.6);c.lineTo(x-s,y-s*.5);c.closePath();c.fill();c.stroke();
  c.fillStyle='rgba(255,255,255,.55)';c.beginPath();c.moveTo(x-s*.5,y-s*.9);c.lineTo(x,y-s*.9);c.lineTo(x-s*.2,y-s*.5);c.lineTo(x-s,y-s*.5);c.closePath();c.fill();
  c.fillStyle='rgba(0,0,0,.18)';c.beginPath();c.moveTo(x+s,y-s*.5);c.lineTo(x,y+s*.6);c.lineTo(x+s*.15,y-s*.5);c.closePath();c.fill();}
function cbGemcut(b){const G=cbGemGeo(b),{X0,Y0,X1,Y1,bx0,bx1,by0,byF,H,RH,tw}=G,P=TB_P,c=ctx;
  const stone='#ddd6e4',stoneR='#b8b0c4',trim='#9a8ab0',roof=b.roof||'#5a3a8a',wood='#4a3048';
  poly([P(bx0,Y1),P(X1+24,Y1),P(X1+24,Y0+24),P(bx1,Y0)],'rgba(0,0,0,.2)');
  // the round tower behind the house's right end: grey-violet stone, slit windows, a cone of violet slate
  {const {x,y,r,h,rh}=tw;cbCyl(x,y,r,0,h,stoneR,null);
    c.globalAlpha=.35;for(let k=14;k<h;k+=14)poly(cbRing(x,y,r,k,-Math.PI/4,Math.PI*.75,20),null,'#7a7088');c.globalAlpha=1;
    // light on the left of the drum, shade on the right
    poly([...cbRing(x,y,r,h,Math.PI*.35,Math.PI*.75,10),...cbRing(x,y,r,0,Math.PI*.75,Math.PI*.35,10)],stone,null);
    for(const [a,hh] of [[Math.PI*.5,40],[Math.PI*.3,76],[Math.PI*.55,96]]){const p=TB_P(x+Math.cos(a)*r,y+Math.sin(a)*r,hh);c.fillStyle='#2a2238';c.beginPath();c.roundRect(p.x-3.5,p.y-14,7,14,[3.5,3.5,0,0]);c.fill();c.strokeStyle=trim;c.lineWidth=1.4;c.stroke();}
    cbCyl(x,y,r+3,h-4,h,trim,null);
    const ap=TB_P(x,y,h+rh),ring=cbRing(x,y,r+7,h,-Math.PI/4,Math.PI*.75,20);poly([...ring,ap],roof,shade(roof,-50));
    poly([...cbRing(x,y,r+7,h,Math.PI*.4,Math.PI*.75,8),ap],shade(roof,18),null);
    c.globalAlpha=.3;for(let k=1;k<4;k++){const t=k/4;poly(cbRing(x,y,(r+7)*(1-t),h+rh*t,-Math.PI/4,Math.PI*.75,16),null,shade(roof,-60));}c.globalAlpha=1;
    tbSeg(ap,{x:ap.x,y:ap.y-10},'#c8b070',2);}
  // the house: two floors under a slate gable, the ridge along the street
  tbBox(bx0,by0,bx1,byF,0,H,stone,stoneR);
  const F=tbF(bx0,byF),R=tbR(bx1,byF),W=bx1-bx0,D=byF-by0;
  for(const [S,L] of [[F,W],[R,D]]){c.globalAlpha=.3;for(let h=10;h<H;h+=10)tbSeg(S(0,h),S(L,h),'#7a7088',.8);c.globalAlpha=1;tbQuad(S,0,0,L,6,trim);}
  // upper windows with violet shutters
  for(const u of [W*.24,W*.56,W*.84]){tbQuad(F,u-7,48,u+7,64,'#2a2238');tbQuad(F,u-12,48,u-7,64,'#6a4a9a');tbQuad(F,u+7,48,u+12,64,'#6a4a9a');tbQuad(F,u-8,46,u+8,48,trim);tbQuad(F,u-8,64,u+8,66,trim);}
  tbQuad(F,0,40,W,43,trim);
  tbGableX(bx0,by0,bx1,byF,H,RH,roof,stoneR);
  // the bay window: it stands out from the wall; behind the glass, gems on dark velvet
  {const u0=14,u1=74,x0=bx0+u0,x1=bx0+u1,y1=byF+12;tbBox(x0,byF,x1,y1,0,8,trim,shade(trim,-15),shade(trim,10));
    tbBox(x0,byF,x1,y1,8,32,'#3a1a40','#2a1230');const BF=tbF(x0,y1);
    for(let i=0;i<9;i++){const p=BF(5+i*6.2,i%2?20:14);cbGem(p.x,p.y,3.2,CB_GEMS[i%6]);}
    for(let k=1;k<4;k++)tbSeg(BF((u1-u0)*k/4,8),BF((u1-u0)*k/4,32),'#c8b070',1.4);tbQuad(BF,0,30,u1-u0,32,'#c8b070',null);
    tbBox(x0-2,byF,x1+2,y1+3,32,37,roof,shade(roof,-20),shade(roof,15));}
  // the door: a violet door with a gem-shaped light, a lamp beside it
  {const u=W-28;tbQuad(F,u-11,0,u+11,30,wood);tbQuad(F,u-12,30,u+12,34,trim);const p=F(u,20);cbGem(p.x,p.y,3.6,'#b8e0ff');
    const k=F(u,2);c.fillStyle='#c8b070';c.beginPath();c.arc(k.x+7,k.y-14,1.4,0,7);c.fill();}
  // a split geode by the door, crystals inside
  {const {x,y}=G.geode,p=P(x,y);c.fillStyle='#7a7480';c.strokeStyle=TB_OL;c.lineWidth=1.2;c.beginPath();c.ellipse(p.x,p.y-8,15,11,0,0,7);c.fill();c.stroke();
    c.fillStyle='#3a2050';c.beginPath();c.ellipse(p.x,p.y-9,11,8,0,0,7);c.fill();
    for(const [dx,dy,s] of [[-5,-6,4],[0,-10,5],[5,-6,4],[-2,-3,3],[4,-2,3]]){const q={x:p.x+dx,y:p.y+dy};c.fillStyle='#c88af0';c.beginPath();c.moveTo(q.x,q.y-s*1.6);c.lineTo(q.x+s*.6,q.y);c.lineTo(q.x-s*.6,q.y);c.closePath();c.fill();
      c.fillStyle='rgba(255,255,255,.5)';c.beginPath();c.moveTo(q.x,q.y-s*1.6);c.lineTo(q.x-s*.6,q.y);c.lineTo(q.x-s*.1,q.y);c.closePath();c.fill();}}
  // the cutting wheel's bench (the wheel itself turns, drawn live)
  {const {x,y}=G.wheel;tbBox(x-14,y-8,x+14,y+6,0,16,'#7a5232','#5a3a1c','#9a7050');const a=P(x+2,y,16),z=P(x+2,y,28);tbSeg(a,z,'#5a5652',2.4);
    const p=P(x-8,y+8);c.fillStyle='#5a3a1c';c.fillRect(p.x-6,p.y-3,12,3);}
  // the hanging sign: a blue gem on a board under an iron arm off the tower
  {const a=P(bx1+4,byF,72),z=P(bx1+4,byF+22,72);tbSeg(a,z,'#3a3632',2.2);}
}
function cbGemcutLive(b){const G=cbGemGeo(b),P=TB_P,c=ctx,t=now;c.save();
  // the great crystal over the spire: it bobs, turns and glows
  {const {x,y,h,rh}=G.tw,top=P(x,y,h+rh+30+Math.sin(t*1.6)*4),s=13,turn=Math.cos(t*.9),w=Math.max(.25,Math.abs(turn));
    const gl=c.createRadialGradient(top.x,top.y,2,top.x,top.y,34);gl.addColorStop(0,'rgba(200,150,255,.55)');gl.addColorStop(1,'rgba(200,150,255,0)');c.fillStyle=gl;c.beginPath();c.arc(top.x,top.y,34,0,7);c.fill();
    const L=s*w;c.fillStyle='#b070f0';c.strokeStyle='#4a1a7a';c.lineWidth=1.4;c.beginPath();c.moveTo(top.x,top.y-s*1.7);c.lineTo(top.x+L,top.y-s*.3);c.lineTo(top.x,top.y+s*1.5);c.lineTo(top.x-L,top.y-s*.3);c.closePath();c.fill();c.stroke();
    c.fillStyle=turn>0?'rgba(255,255,255,.5)':'rgba(60,20,110,.35)';c.beginPath();c.moveTo(top.x,top.y-s*1.7);c.lineTo(top.x-L,top.y-s*.3);c.lineTo(top.x,top.y-s*.1);c.closePath();c.fill();
    c.fillStyle='rgba(255,255,255,.3)';c.beginPath();c.moveTo(top.x,top.y-s*.1);c.lineTo(top.x+L,top.y-s*.3);c.lineTo(top.x,top.y+s*1.5);c.closePath();c.fill();
    tbSeg({x:top.x-L,y:top.y-s*.3},{x:top.x+L,y:top.y-s*.3},'#4a1a7a',1);
    for(let k=0;k<4;k++){const a=t*1.2+k*Math.PI/2,px=top.x+Math.cos(a)*22,py=top.y+Math.sin(a)*8;c.globalAlpha=Math.sin(a)>0?1:.4;c.fillStyle='#f0e0ff';c.fillRect(px-1.2,py-1.2,2.4,2.4);}c.globalAlpha=1;}
  // the cutting wheel spins; now and then sparks fly off it
  {const {x,y}=G.wheel,p=P(x+2,y,34),sp=t*9;c.fillStyle='#8a8692';c.strokeStyle='#3a3632';c.lineWidth=1.4;c.beginPath();c.ellipse(p.x,p.y,10,10,0,0,7);c.fill();c.stroke();
    c.fillStyle='#b8b4c0';c.beginPath();c.ellipse(p.x,p.y,6,6,0,0,7);c.fill();
    for(let k=0;k<4;k++){const a=sp+k*Math.PI/2;tbSeg(p,{x:p.x+Math.cos(a)*9,y:p.y+Math.sin(a)*9},'#4a4652',1.2);}
    if((t%2.4)<1.2)for(let k=0;k<6;k++){const ph=((t*3+k/6)%1),a=-.4-k*.12;c.globalAlpha=1-ph;c.fillStyle=k%2?'#ffe08a':'#fff6d0';c.fillRect(p.x+10+Math.cos(a)*ph*24,p.y-2+Math.sin(a)*ph*14+ph*ph*14,2,2);}
    c.globalAlpha=1;}
  // gems in the window wink in turn
  {const x0=G.bx0+14,y1=G.byF+12,BF=tbF(x0,y1),i=Math.floor(t*1.3)%9,ph=(t*1.3)%1,p=BF(5+i*6.2,(i%2?20:14)+1);
    c.globalAlpha=Math.sin(ph*Math.PI);c.strokeStyle='#ffffff';c.lineWidth=1.2;c.beginPath();c.moveTo(p.x-5,p.y-3);c.lineTo(p.x+5,p.y-3);c.moveTo(p.x,p.y-8);c.lineTo(p.x,p.y+2);c.stroke();c.globalAlpha=1;}
  // the sign swings: a dark board with a blue gem
  {const a=P(G.bx1+4,G.byF+18,72),sw=Math.sin(t*1.2+1)*.1;c.translate(a.x,a.y);c.rotate(sw);
    tbSeg({x:-6,y:0},{x:-6,y:5},'#3a3632',1);tbSeg({x:6,y:0},{x:6,y:5},'#3a3632',1);c.fillStyle='#2e2440';c.strokeStyle='#c8b070';c.lineWidth=1.4;c.beginPath();c.roundRect(-11,5,22,20,3);c.fill();c.stroke();
    cbGem(0,17,6,'#4a9ae8');}
  c.restore();}
const cbGemcutLights=b=>{const G=cbGemGeo(b),W=G.bx1-G.bx0;return tbLit([[G.bx0+44,G.byF+12,20],[G.bx0+W*.24,G.byF,56],[G.bx0+W*.56,G.byF,56],[G.bx0+W*.84,G.byF,56],[G.tw.x,G.tw.y+G.tw.r,76],[G.bx0+W-28,G.byF,14,1]]);};

/* ---------------- the Grand Library ---------------- */
// a scholars' hall of pale stone: a columned portico with steps and a pediment bearing an open book, tall arched windows
// lined with bookshelves, a balustraded roof with a green copper dome and lantern, a brass telescope on the roof,
// a lectern with an open book (its pages turn) and a globe on the forecourt, and glowing letters drifting from the lantern
const cbLibGeo=b=>{const X0=b.x*TILE,Y0=b.y*TILE,X1=(b.x+b.w)*TILE,Y1=(b.y+b.h)*TILE,bx0=X0+10,bx1=X1-44,by0=Y0+18,byF=Y1-60;
  const W=bx1-bx0;return{X0,Y0,X1,Y1,bx0,bx1,by0,byF,W,xc:(bx0+bx1)/2,yc:(by0+byF)/2,H:72,po:{u0:W/2-52,u1:W/2+52,d:30,h:64},dome:{r:38,dh:24,h:44},
    tel:{x:bx1-28,y:by0+28},lect:{x:bx0+26,y:byF+34},globe:{x:bx0+58,y:byF+40}};};
function cbLib(b){const G=cbLibGeo(b),{X0,Y0,X1,Y1,bx0,bx1,by0,byF,W,xc,yc,H,po,dome}=G,P=TB_P,c=ctx;
  const stone='#ebe3d2',stoneR='#c8bea8',trim='#d6cab0',slate=b.roof||'#2e4f6e',cop='#5aa58e',copD='#3a7a66',gold='#e8c25a';
  poly([P(bx0,Y1),P(X1+26,Y1),P(X1+26,Y0+26),P(bx1,Y0)],'rgba(0,0,0,.2)');
  // the hall
  tbBox(bx0,by0,bx1,byF,0,H,stone,stoneR);const F=tbF(bx0,byF),R=tbR(bx1,byF),D=byF-by0;
  for(const [S,L] of [[F,W],[R,D]]){c.globalAlpha=.25;for(let h=12;h<H-8;h+=12)tbSeg(S(0,h),S(L,h),'#8a8070',.8);c.globalAlpha=1;tbQuad(S,0,0,L,7,trim);tbQuad(S,0,H-9,L,H,trim);}
  // tall arched windows with shelves of books behind the glass
  const bookCols=['#8a2a2a','#2a4a8a','#2a6a3a','#8a6a2a','#5a2a6a'];
  const win=(S,u)=>{cbArch(S,u-10,u+10,14,46,'#22344a');for(const h of [22,32,42]){tbSeg(S(u-9,h),S(u+9,h),'#6a4a2a',1.4);for(let k=0;k<5;k++){const p=S(u-8+k*3.8,h);c.fillStyle=bookCols[(k+h)%5];c.fillRect(p.x-1.2,p.y-(k%2?7:6),2.4,k%2?7:6);}}
    cbArch(S,u-10,u+10,14,46,null,'#8a7a5a');tbQuad(S,u-12,11,u+12,14,trim);};
  for(const u of [24,54,W-54,W-24])win(F,u);for(const u of [D*.3,D*.7])win(R,u);
  // the roof: flat behind a balustrade, slate edged
  poly([P(bx0,by0,H),P(bx1,by0,H),P(bx1,byF,H),P(bx0,byF,H)],shade(slate,25),TB_OL);
  {const n=Math.floor(W/9);for(let i=0;i<=n;i++){const p=P(bx0+i*W/n,byF,H);c.fillStyle='#f4ecdc';c.fillRect(p.x-1.6,p.y-9,3.2,9);}
    const m=Math.floor(D/9);for(let i=0;i<=m;i++){const p=P(bx1,byF-i*D/m,H);c.fillStyle='#ddd4c0';c.fillRect(p.x-1.6,p.y-9,3.2,9);}
    tbSeg(P(bx0,byF,H+10),P(bx1,byF,H+10),'#f4ecdc',3);tbSeg(P(bx1,byF,H+10),P(bx1,by0,H+10),'#ddd4c0',3);}
  // the brass telescope on its round platform at the back corner
  {const {x,y}=G.tel;cbCyl(x,y,15,H,H+8,stoneR,trim);const a=P(x,y,H+12);
    for(const dx of [-6,0,6])tbSeg(P(x+dx,y+(dx?4:-4),H+8),a,'#5a4a2a',1.4);
    c.save();c.translate(a.x,a.y);c.rotate(-.75);c.fillStyle='#c8963a';c.strokeStyle='#5a3a10';c.lineWidth=1.2;c.beginPath();c.moveTo(-8,-3);c.lineTo(26,-5);c.lineTo(26,5);c.lineTo(-8,3);c.closePath();c.fill();c.stroke();
    c.fillStyle='#e8c25a';c.fillRect(22,-6,4,12);c.fillRect(-9,-3.5,4,7);c.restore();}
  // the dome: a round drum with little windows, a green copper dome with ribs, a lantern and a gold finial
  {const r=dome.r,h0=H,h1=H+dome.dh;cbCyl(xc,yc,r,h0,h1,stoneR,null);
    poly([...cbRing(xc,yc,r,h1,Math.PI*.35,Math.PI*.75,10),...cbRing(xc,yc,r,h0,Math.PI*.75,Math.PI*.35,10)],stone,null);
    for(let k=0;k<5;k++){const a=-Math.PI/4+(k+.5)*Math.PI/5,p=TB_P(xc+Math.cos(a)*r,yc+Math.sin(a)*r,h0+16);c.fillStyle='#22344a';c.beginPath();c.roundRect(p.x-3,p.y-10,6,10,[3,3,0,0]);c.fill();}
    cbCyl(xc,yc,r+3,h1,h1+4,trim,trim);
    const ct=TB_P(xc,yc,h1+4),rx=(r+1)*1.103,ry=(r+1)*.552,dh=dome.h;
    const gr=c.createLinearGradient(ct.x-rx,0,ct.x+rx,0);gr.addColorStop(0,'#8ad0b8');gr.addColorStop(.45,cop);gr.addColorStop(1,copD);
    c.fillStyle=gr;c.strokeStyle='#24503f';c.lineWidth=1.5;c.beginPath();c.ellipse(ct.x,ct.y,rx,dh,0,Math.PI,Math.PI*2);c.ellipse(ct.x,ct.y,rx,ry,0,0,Math.PI);c.closePath();c.fill();c.stroke();
    c.strokeStyle='rgba(30,70,55,.55)';c.lineWidth=1.2;for(let k=1;k<6;k++){const a=Math.PI*k/6,qx=ct.x-Math.cos(a)*rx,qy=ct.y+Math.sin(a)*ry;c.beginPath();c.moveTo(qx,qy);c.quadraticCurveTo(ct.x-Math.cos(a)*rx*1.0,ct.y-dh*.75,ct.x,ct.y-dh);c.stroke();}
    const lt=TB_P(xc,yc,h1+4+dh);c.fillStyle='#f0e8d8';c.strokeStyle=TB_OL;c.lineWidth=1;c.fillRect(lt.x-7,lt.y-12,14,12);c.strokeRect(lt.x-7,lt.y-12,14,12);
    c.fillStyle='#22344a';c.fillRect(lt.x-3,lt.y-10,6,8);c.fillStyle=cop;c.beginPath();c.ellipse(lt.x,lt.y-12,9,7,0,Math.PI,0);c.fill();c.stroke();
    c.fillStyle=gold;c.beginPath();c.arc(lt.x,lt.y-22,2.6,0,7);c.fill();tbSeg({x:lt.x,y:lt.y-19},{x:lt.x,y:lt.y-30},gold,1.6);}
  // the portico: three broad steps, six columns, an entablature and a pediment with an open book
  {const x0=bx0+po.u0,x1=bx0+po.u1,yF=byF+po.d,xm=(x0+x1)/2;
    for(let k=0;k<3;k++)tbBox(x0-12+k*3,byF,x1+12-k*3,yF+10-k*4,k*3,k*3+3,'#ddd4c0','#bfb5a0','#efe8d8');
    poly([P(x0-4,byF,9),P(x1+4,byF,9),P(x1+4,yF,9),P(x0-4,yF,9)],'#efe8d8',TB_OL);
    // the doors in the shade of the portico
    {const u=W/2;tbQuad(F,u-14,9,u+14,48,'#3a2a1a');cbArch(F,u-14,u+14,9,40,'#5a3a20');tbSeg(F(u,9),F(u,52),'#2a1a10',1.4);}
    for(let i=0;i<6;i++){const x=x0+6+(x1-x0-12)*i/5;cbCyl(x,yF-6,5.5,9,po.h,i<3?'#f4ecdc':'#e0d6c2',null,'#8a8070');
      c.globalAlpha=.35;for(const dx of [-2,2])tbSeg(P(x+dx,yF-6+3,12),P(x+dx,yF-6+3,po.h-2),'#8a8070',.8);c.globalAlpha=1;
      tbBox(x-7,yF-13,x+7,yF+1,po.h,po.h+4,trim,shade(trim,-15),'#f4ecdc');}
    tbBox(x0-6,byF,x1+6,yF+2,po.h+4,po.h+14,'#efe8d8','#cfc5b0','#f4ecdc');
    const ph=po.h+40;poly([P(x0-8,byF,po.h+14),P(x0-8,yF+4,po.h+14),P(xm,yF+4,ph),P(xm,byF,ph)],shade(slate,20),TB_OL);
    poly([P(xm,byF,ph),P(xm,yF+4,ph),P(x1+8,yF+4,po.h+14),P(x1+8,byF,po.h+14)],slate,TB_OL);
    poly([P(x0-8,yF+4,po.h+14),P(x1+8,yF+4,po.h+14),P(xm,yF+4,ph)],'#f4ecdc',TB_OL);
    poly([P(x0+4,yF+4,po.h+17),P(x1-4,yF+4,po.h+17),P(xm,yF+4,ph-5)],'#e2d8c4',null);
    // the open book in the pediment
    {const p=P(xm,yF+4,po.h+24);c.fillStyle='#fffaf0';c.strokeStyle='#8a6a1a';c.lineWidth=1.2;
      c.beginPath();c.moveTo(p.x,p.y);c.quadraticCurveTo(p.x-6,p.y-4,p.x-13,p.y-2);c.lineTo(p.x-13,p.y-10);c.quadraticCurveTo(p.x-6,p.y-12,p.x,p.y-8);c.closePath();c.fill();c.stroke();
      c.beginPath();c.moveTo(p.x,p.y);c.quadraticCurveTo(p.x+6,p.y-4,p.x+13,p.y-2);c.lineTo(p.x+13,p.y-10);c.quadraticCurveTo(p.x+6,p.y-12,p.x,p.y-8);c.closePath();c.fill();c.stroke();
      c.strokeStyle='rgba(120,100,60,.6)';c.lineWidth=.8;for(const s of [-1,1])for(let k=0;k<3;k++){c.beginPath();c.moveTo(p.x+s*3,p.y-7+k*2.2);c.lineTo(p.x+s*10,p.y-8+k*2.2);c.stroke();}
      c.fillStyle=gold;c.beginPath();c.moveTo(p.x,p.y-20);c.lineTo(p.x+3,p.y-14);c.lineTo(p.x-3,p.y-14);c.closePath();c.fill();}}
  // the forecourt: a globe on a stand and a stack of books
  {const {x,y}=G.globe,p=P(x,y);tbSeg(p,{x:p.x,y:p.y-16},'#5a3a1c',2.4);c.fillStyle='#5a3a1c';c.fillRect(p.x-7,p.y-2,14,3);
    const g=c.createRadialGradient(p.x-3,p.y-26,1,p.x,p.y-23,9);g.addColorStop(0,'#8ac8f0');g.addColorStop(1,'#2a6aa8');c.fillStyle=g;c.strokeStyle=TB_OL;c.lineWidth=1.2;c.beginPath();c.arc(p.x,p.y-23,8.5,0,7);c.fill();c.stroke();
    c.fillStyle='#5aa04a';c.beginPath();c.ellipse(p.x-2,p.y-25,3.5,2.5,.4,0,7);c.fill();c.beginPath();c.ellipse(p.x+3,p.y-20,2.5,1.8,0,0,7);c.fill();
    c.strokeStyle=gold;c.lineWidth=1.4;c.beginPath();c.arc(p.x,p.y-23,11,-1.9,1.2);c.stroke();}
  {const p=P(G.lect.x+30,G.lect.y-8);for(let k=0;k<4;k++){c.fillStyle=bookCols[k];c.strokeStyle=TB_OL;c.lineWidth=.8;c.fillRect(p.x-8+(k%2)*2,p.y-4-k*4,16,4);c.strokeRect(p.x-8+(k%2)*2,p.y-4-k*4,16,4);c.fillStyle='#f4ecdc';c.fillRect(p.x+6+(k%2)*2,p.y-3.5-k*4,1.6,3);}}
  // the lectern (the book on it is drawn live)
  {const {x,y}=G.lect,p=P(x,y);c.fillStyle='#6a4426';c.strokeStyle=TB_OL;c.lineWidth=1.2;c.fillRect(p.x-3,p.y-24,6,24);c.strokeRect(p.x-3,p.y-24,6,24);c.fillRect(p.x-8,p.y-2,16,3);
    c.beginPath();c.moveTo(p.x-13,p.y-24);c.lineTo(p.x+13,p.y-24);c.lineTo(p.x+11,p.y-31);c.lineTo(p.x-11,p.y-31);c.closePath();c.fill();c.stroke();}
}
function cbLibLive(b){const G=cbLibGeo(b),P=TB_P,c=ctx,t=now;c.save();
  // the open book on the lectern: now and then a page turns
  {const p=P(G.lect.x,G.lect.y),y=p.y-31;c.fillStyle='#fffaf0';c.strokeStyle='#8a7a5a';c.lineWidth=1;
    c.beginPath();c.moveTo(p.x,y);c.lineTo(p.x-12,y+1);c.lineTo(p.x-11,y-6);c.lineTo(p.x,y-7);c.closePath();c.fill();c.stroke();
    c.beginPath();c.moveTo(p.x,y);c.lineTo(p.x+12,y+1);c.lineTo(p.x+11,y-6);c.lineTo(p.x,y-7);c.closePath();c.fill();c.stroke();
    const ph=(t*.4)%1;if(ph<.25){const k=ph/.25,ex=p.x+Math.cos(k*Math.PI)*11,ey=y-3-Math.sin(k*Math.PI)*8;c.fillStyle='#f4ecd8';c.beginPath();c.moveTo(p.x,y);c.lineTo(ex,ey+3);c.lineTo(ex,ey-4);c.lineTo(p.x,y-7);c.closePath();c.fill();c.stroke();}}
  // glowing letters drift up from the lantern of the dome
  {const lt=P(G.xc,G.yc,G.H+G.dome.dh+4+G.dome.h),gl='ᚨᛒᛞΣΩ✶';c.font='700 10px serif';c.textAlign='center';
    for(let k=0;k<5;k++){const ph=(t*.18+k/5)%1;c.globalAlpha=Math.sin(ph*Math.PI)*.85;c.fillStyle=k%2?'#ffe6a0':'#bfe8ff';c.fillText(gl[k],lt.x+Math.sin(t*.8+k*1.7)*14*ph,lt.y-30-ph*60);}c.globalAlpha=1;}
  // a twinkle on the telescope's lens
  {const ph=(t*.6)%2.5;if(ph<.3){const a=P(G.tel.x,G.tel.y,G.H+12),lx=a.x+Math.cos(-.75)*26,ly=a.y+Math.sin(-.75)*26;c.globalAlpha=1-ph/.3;c.strokeStyle='#fffbe0';c.lineWidth=1.2;c.beginPath();c.moveTo(lx-5,ly);c.lineTo(lx+5,ly);c.moveTo(lx,ly-5);c.lineTo(lx,ly+5);c.stroke();}}
  c.restore();}
const cbLibLights=b=>{const G=cbLibGeo(b),D=G.byF-G.by0;return tbLit([...[24,54,G.W-54,G.W-24].map(u=>[G.bx0+u,G.byF,32]),[G.bx1,G.byF-D*.3,32],[G.bx1,G.byF-D*.7,32],[G.xc,G.byF,26,1],[G.xc,G.yc,G.H+G.dome.dh+G.dome.h+10]]);};

/* ---------------- the Forge Royal ---------------- */
// a great stone forge: a tall brick chimney breathing smoke, a wide arched furnace mouth glowing and flickering, a
// waterwheel turning in a millrace along the side, a rack of royal weapons with a crested shield, a golden anvil on a
// stone block, and a crowned-anvil sign
const cbForgeGeo=b=>{const X0=b.x*TILE,Y0=b.y*TILE,X1=(b.x+b.w)*TILE,Y1=(b.y+b.h)*TILE,bx0=X0+8,bx1=X1-60,by0=Y0+12,byF=Y1-50;
  return{X0,Y0,X1,Y1,bx0,bx1,by0,byF,W:bx1-bx0,D:byF-by0,H:66,RH:38,ch:{x0:bx0+18,y0:by0+14,s:24,h:150},
    wheel:{x:bx1+18,y:(by0+byF)/2+6,h:40,r:34},anvil:{x:bx0+(bx1-bx0)*.72,y:byF+30},rack:{x:bx0+6,y:byF+22}};};
function cbForge(b){const G=cbForgeGeo(b),{X0,Y0,X1,Y1,bx0,bx1,by0,byF,W,D,H,RH,ch}=G,P=TB_P,c=ctx;
  const stone='#b8b0a4',stoneR='#948b80',dark='#6a625a',brick='#9a4a36',roof=b.roof||'#4a3a34',gold='#e8c25a',iron='#4a4a52';
  poly([P(bx0,Y1),P(X1+28,Y1),P(X1+28,Y0+28),P(bx1,Y0)],'rgba(0,0,0,.22)');
  // the chimney, standing up through the back of the roof
  tbBox(ch.x0,ch.y0,ch.x0+ch.s,ch.y0+ch.s,0,ch.h,brick,shade(brick,-22),shade(brick,10));
  {const F=tbF(ch.x0,ch.y0+ch.s),R=tbR(ch.x0+ch.s,ch.y0+ch.s);c.globalAlpha=.4;for(let h=8;h<ch.h;h+=8){tbSeg(F(0,h),F(ch.s,h),'#5a2a1e',.8);tbSeg(R(0,h),R(ch.s,h),'#4a2016',.8);}c.globalAlpha=1;
    tbBox(ch.x0-3,ch.y0-3,ch.x0+ch.s+3,ch.y0+ch.s+3,ch.h,ch.h+7,dark,shade(dark,-20),'#2a2420');}
  // the forge hall: heavy dressed stone
  tbBox(bx0,by0,bx1,byF,0,H,stone,stoneR);const F=tbF(bx0,byF),R=tbR(bx1,byF);
  for(const [S,L,col] of [[F,W,'#7a7268'],[R,D,'#6a6258']]){c.globalAlpha=.45;for(let h=11;h<H;h+=11){tbSeg(S(0,h),S(L,h),col,.9);for(let u=((h/11)%2)*12+6;u<L;u+=24)tbSeg(S(u,h-11),S(u,h),col,.9);}c.globalAlpha=1;
    tbQuad(S,0,0,L,8,dark);}
  // small high windows down the side, an iron-bound side door
  for(const u of [D*.22,D*.78]){tbQuad(R,u-7,40,u+7,54,'#2a2018');for(const k of [-3,3])tbSeg(R(u+k,40),R(u+k,54),iron,1.2);}
  tbGableX(bx0,by0,bx1,byF,H,RH,roof,stoneR);
  // the chimney again where it rises above the roof line (its foot is under the roof)
  {const top=ch.h,hRoof=H+RH*.55;const F2=tbF(ch.x0,ch.y0+ch.s),R2=tbR(ch.x0+ch.s,ch.y0+ch.s);
    tbQuad(F2,0,hRoof,ch.s,top,brick);tbQuad(R2,0,hRoof,ch.s,top,shade(brick,-22));c.globalAlpha=.4;for(let h=Math.ceil(hRoof/8)*8;h<top;h+=8){tbSeg(F2(0,h),F2(ch.s,h),'#5a2a1e',.8);tbSeg(R2(0,h),R2(ch.s,h),'#4a2016',.8);}c.globalAlpha=1;
    tbBox(ch.x0-3,ch.y0-3,ch.x0+ch.s+3,ch.y0+ch.s+3,top,top+7,dark,shade(dark,-20),'#2a2420');}
  // the furnace mouth: a wide stone arch, the fire inside (it flickers, drawn live), a gold keystone
  {const u0=W/2-32,u1=W/2+32;cbArch(F,u0-6,u1+6,0,30,dark);cbArch(F,u0,u1,0,30,'#2a1208');
    const kp=F(W/2,64);c.fillStyle=gold;c.strokeStyle='#8a6a1a';c.lineWidth=1.2;c.beginPath();c.moveTo(kp.x-6,kp.y);c.lineTo(kp.x+6,kp.y);c.lineTo(kp.x+4,kp.y+9);c.lineTo(kp.x-4,kp.y+9);c.closePath();c.fill();c.stroke();}
  // the millrace along the side: a stone channel with water (its flow is drawn live)
  {const x0=bx1+6,x1=bx1+30;tbBox(x0,by0-6,x1,byF+8,0,10,'#8a8278','#6a6258','#8a8278');poly([P(x0+4,by0-6,9),P(x1-4,by0-6,9),P(x1-4,byF+8,9),P(x0+4,byF+8,9)],'#3a7ab8',null);}
  // the weapon rack: a timber frame with a sword, an axe, a spear and a halberd, a crested shield leaning on it
  {const {x,y}=G.rack;tbBox(x,y,x+44,y+6,0,4,'#6a4426','#4a3018','#8a5a32');for(const dx of [2,42])tbSeg(P(x+dx,y+3,0),P(x+dx,y+3,34),'#5a3a1c',2.6);tbSeg(P(x+2,y+3,30),P(x+42,y+3,30),'#5a3a1c',2.4);
    const wpn=[[8,'sword'],[17,'axe'],[26,'spear'],[35,'halberd']];
    for(const [dx,k] of wpn){const a=P(x+dx,y+3,4),z=P(x+dx,y+3,k==='spear'||k==='halberd'?46:38);tbSeg(a,z,k==='sword'?'#d8dce4':'#6a4a2a',k==='sword'?2.4:1.8);
      if(k==='sword'){tbSeg({x:z.x-4,y:a.y-10},{x:z.x+4,y:a.y-10},gold,2);c.fillStyle=gold;c.beginPath();c.arc(a.x,a.y-2,1.8,0,7);c.fill();}
      if(k==='axe'){c.fillStyle='#c8ccd4';c.strokeStyle=iron;c.lineWidth=1;c.beginPath();c.moveTo(z.x,z.y+2);c.quadraticCurveTo(z.x+9,z.y-2,z.x+8,z.y+10);c.lineTo(z.x,z.y+8);c.closePath();c.fill();c.stroke();}
      if(k==='spear'){c.fillStyle='#d8dce4';c.beginPath();c.moveTo(z.x,z.y-8);c.lineTo(z.x+2.5,z.y);c.lineTo(z.x-2.5,z.y);c.closePath();c.fill();}
      if(k==='halberd'){c.fillStyle='#c8ccd4';c.strokeStyle=iron;c.lineWidth=1;c.beginPath();c.moveTo(z.x,z.y-6);c.lineTo(z.x+2,z.y);c.lineTo(z.x+8,z.y+2);c.lineTo(z.x+7,z.y+9);c.lineTo(z.x,z.y+7);c.closePath();c.fill();c.stroke();}}
    const sp=P(x+40,y+12,14);c.fillStyle='#2a4a8a';c.strokeStyle=gold;c.lineWidth=1.6;c.beginPath();c.moveTo(sp.x-9,sp.y-12);c.lineTo(sp.x+9,sp.y-12);c.lineTo(sp.x+9,sp.y+2);c.quadraticCurveTo(sp.x+9,sp.y+10,sp.x,sp.y+14);c.quadraticCurveTo(sp.x-9,sp.y+10,sp.x-9,sp.y+2);c.closePath();c.fill();c.stroke();
    c.fillStyle=gold;c.beginPath();c.moveTo(sp.x-5,sp.y+2);c.lineTo(sp.x-6,sp.y-5);c.lineTo(sp.x-2.5,sp.y-2);c.lineTo(sp.x,sp.y-7);c.lineTo(sp.x+2.5,sp.y-2);c.lineTo(sp.x+6,sp.y-5);c.lineTo(sp.x+5,sp.y+2);c.closePath();c.fill();}
  // the golden anvil on its stone block, a quench barrel and a hammer
  {const {x,y}=G.anvil;tbBox(x-12,y-10,x+12,y+8,0,14,'#8a8278','#6a6258','#a49c90');const p=P(x,y,14);
    c.fillStyle=gold;c.strokeStyle='#7a5a10';c.lineWidth=1.3;c.beginPath();c.moveTo(p.x-16,p.y-14);c.lineTo(p.x+12,p.y-14);c.quadraticCurveTo(p.x+20,p.y-13,p.x+22,p.y-9);c.lineTo(p.x+8,p.y-8);c.lineTo(p.x+6,p.y-3);c.lineTo(p.x+10,p.y);c.lineTo(p.x-10,p.y);c.lineTo(p.x-6,p.y-3);c.lineTo(p.x-8,p.y-8);c.lineTo(p.x-16,p.y-9);c.closePath();c.fill();c.stroke();
    c.fillStyle='rgba(255,250,210,.6)';c.fillRect(p.x-14,p.y-13.5,24,1.6);
    tbSeg({x:p.x-10,y:p.y-16},{x:p.x+2,y:p.y-22},'#6a4426',2.2);c.fillStyle=iron;c.fillRect(p.x+1,p.y-26,6,7);
    barrel(x+26,y-2,'#5a4a3a');}
  // the sign bracket off the front corner
  {tbSeg(P(bx1,byF,58),P(bx1,byF+24,58),iron,2.4);tbSeg(P(bx1,byF,46),P(bx1,byF+14,58),iron,1.6);}
}
function cbForgeLive(b){const G=cbForgeGeo(b),{bx0,bx1,by0,byF,W,D,ch,wheel}=G,P=TB_P,c=ctx,t=now;c.save();
  // the fire in the furnace mouth flickers
  {const F=tbF(bx0,byF),f=.75+Math.sin(t*9)*.12+Math.sin(t*23)*.08,base=F(W/2,0);
    const gr=c.createRadialGradient(base.x,base.y-10,2,base.x,base.y-14,38);gr.addColorStop(0,`rgba(255,240,170,${f})`);gr.addColorStop(.45,`rgba(255,140,40,${f*.85})`);gr.addColorStop(1,'rgba(120,30,10,0)');
    c.fillStyle=gr;c.beginPath();const pts=[];const r=32;pts.push(F(W/2-r,0),F(W/2-r,30));for(let i=1;i<12;i++){const a=Math.PI-i*Math.PI/12;pts.push(F(W/2+Math.cos(a)*r,30+Math.sin(a)*r*1.1));}pts.push(F(W/2+r,30),F(W/2+r,0));
    c.moveTo(pts[0].x,pts[0].y);for(const p of pts)c.lineTo(p.x,p.y);c.closePath();c.fill();
    for(let k=0;k<5;k++){const ph=(t*1.4+k*.2)%1,p=F(W/2-18+k*9,4+ph*30);c.globalAlpha=1-ph;c.fillStyle=k%2?'#ffd060':'#ff8a2a';c.beginPath();c.ellipse(p.x,p.y,3-ph*2,6-ph*4,0,0,7);c.fill();}c.globalAlpha=1;}
  // smoke rising from the chimney
  {const top=P(ch.x0+ch.s/2,ch.y0+ch.s/2,ch.h+7);for(let k=0;k<6;k++){const ph=(t*.22+k/6)%1;c.globalAlpha=(1-ph)*.45;c.fillStyle=k%2?'#8a8682':'#a8a4a0';
    c.beginPath();c.arc(top.x+ph*22+Math.sin(t+k)*4,top.y-ph*70,5+ph*12,0,7);c.fill();}c.globalAlpha=1;}
  // the water in the millrace runs, and the wheel turns in it
  {const x0=bx1+10,x1=bx1+26;c.strokeStyle='rgba(220,240,255,.6)';c.lineWidth=1.2;for(let k=0;k<6;k++){const ph=((t*.5+k/6)%1),y=by0-4+(byF+6-by0+4)*ph;tbSeg(P(x0,y,9),P(x0+6,y,9),'rgba(220,240,255,.6)',1.2);tbSeg(P(x1-6,y-12,9),P(x1,y-12,9),'rgba(220,240,255,.45)',1);}
    const {x,y,h,r}=wheel,rot=t*1.1,W2=(a,rr)=>P(x,y+Math.cos(a)*rr,h+Math.sin(a)*rr);
    // the axle bracket on the wall, the rim, the spokes and the paddles
    tbBox(bx1,y-4,x,y+4,h-4,h+4,'#5a3a1c','#4a3018','#6a4426');
    c.strokeStyle='#6a4426';c.lineWidth=3;c.beginPath();for(let i=0;i<=32;i++){const p=W2(i*Math.PI/16,r);i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y);}c.stroke();
    c.lineWidth=1.6;c.beginPath();for(let i=0;i<=32;i++){const p=W2(i*Math.PI/16,r-8);i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y);}c.stroke();
    for(let k=0;k<8;k++){const a=rot+k*Math.PI/4;tbSeg(W2(0,0),W2(a,r),'#5a3a1c',2);const p0=W2(a,r),p1=W2(a,r+8);poly([{x:p0.x-4,y:p0.y},{x:p0.x+4,y:p0.y},{x:p1.x+4,y:p1.y},{x:p1.x-4,y:p1.y}],'#7a5232','#3a2410');}
    const hub=W2(0,0);tbDisc(hub.x,hub.y,5,5,'#3a3632','#1a1612');
    // splashes where the paddles hit the water
    for(let k=0;k<4;k++){const ph=(t*1.6+k/4)%1,p=P(x,y-r*.5+k*10,10);c.globalAlpha=1-ph;c.fillStyle='#e8f6ff';c.beginPath();c.arc(p.x+(k-1.5)*3,p.y-ph*10,1.6,0,7);c.fill();}c.globalAlpha=1;}
  // the crowned-anvil sign swings
  {const a=P(bx1,byF+20,58),sw=Math.sin(t*1.3+2)*.1;c.translate(a.x,a.y);c.rotate(sw);tbSeg({x:-7,y:0},{x:-7,y:5},'#3a3632',1);tbSeg({x:7,y:0},{x:7,y:5},'#3a3632',1);
    c.fillStyle='#2a2420';c.strokeStyle='#e8c25a';c.lineWidth=1.6;c.beginPath();c.roundRect(-14,5,28,22,4);c.fill();c.stroke();
    c.fillStyle='#e8c25a';c.beginPath();c.moveTo(-9,17);c.lineTo(7,17);c.lineTo(10,19);c.lineTo(3,20);c.lineTo(4,24);c.lineTo(-4,24);c.lineTo(-3,20);c.lineTo(-9,19);c.closePath();c.fill();
    c.beginPath();c.moveTo(-5,14);c.lineTo(-6,8);c.lineTo(-2.5,11);c.lineTo(0,7);c.lineTo(2.5,11);c.lineTo(6,8);c.lineTo(5,14);c.closePath();c.fill();}
  c.restore();}
const cbForgeLights=b=>{const G=cbForgeGeo(b);return tbLit([[G.bx0+G.W/2,G.byF,26],[G.bx0+G.W/2-18,G.byF,14],[G.bx0+G.W/2+18,G.byF,14],[G.bx1,G.byF-G.D*.22,47],[G.bx1,G.byF-G.D*.78,47]]);};

/* ---------------- the Royal Palace ---------------- */
// white marble with gold, under blue slate: a tall keep at the back flying the colours of whoever holds Emberkeep,
// round corner towers with blue cones and pennants, a crenellated gatehouse with gold-studded doors, the royal crest
// and two long banners, broad steps and two burning braziers
const cbPalGeo=b=>{const X0=b.x*TILE,Y0=b.y*TILE,X1=(b.x+b.w)*TILE,Y1=(b.y+b.h)*TILE,bx0=X0+30,bx1=X1-30,by0=Y0+52,byF=Y1-66,xc=(X0+X1)/2;
  return{X0,Y0,X1,Y1,bx0,bx1,by0,byF,xc,yc:(by0+byF)/2,W:bx1-bx0,D:byF-by0,H:84,RH:40,keep:{x0:xc-28,y0:Y0+8,x1:xc+28,y1:Y0+62,h:176},
    tw:[{x:bx0,y:byF,r:22,h:128},{x:bx1,y:byF,r:22,h:128},{x:bx1,y:by0,r:18,h:116}],gate:{x0:xc-42,x1:xc+42,y0:byF-8,y1:byF+16,h:112},br:[{x:xc-64,y:byF+46},{x:xc+64,y:byF+46}]};};
// merlons along the top of a face
function cbCren(S,L,h,step,col,colR){for(let u=0;u<L-2;u+=step*2){poly([S(u,h),S(u+step,h),S(u+step,h+7),S(u,h+7)],col,TB_OL);}}
function cbConeTower(t,stone,stoneR,roof,gold){const {x,y,r,h}=t;cbCyl(x,y,r,0,h,stoneR,null);
  poly([...cbRing(x,y,r,h,Math.PI*.35,Math.PI*.75,10),...cbRing(x,y,r,0,Math.PI*.75,Math.PI*.35,10)],stone,null);
  ctx.globalAlpha=.25;for(let k=14;k<h;k+=14)poly(cbRing(x,y,r,k,-Math.PI/4,Math.PI*.75,18),null,'#8a8070');ctx.globalAlpha=1;
  for(const hh of [40,82]){const a=Math.PI*.42,p=TB_P(x+Math.cos(a)*r,y+Math.sin(a)*r,hh);ctx.fillStyle='#22344a';ctx.beginPath();ctx.roundRect(p.x-3.5,p.y-14,7,14,[3.5,3.5,0,0]);ctx.fill();ctx.strokeStyle=gold;ctx.lineWidth=1.2;ctx.stroke();}
  cbCyl(x,y,r+3,h-5,h,gold,null,'#8a6a1a');
  const ap=TB_P(x,y,h+r*2.4),ring=cbRing(x,y,r+6,h,-Math.PI/4,Math.PI*.75,18);poly([...ring,ap],roof,shade(roof,-45));
  poly([...cbRing(x,y,r+6,h,Math.PI*.4,Math.PI*.75,8),ap],shade(roof,22),null);
  ctx.fillStyle=gold;ctx.beginPath();ctx.arc(ap.x,ap.y-3,2.6,0,7);ctx.fill();tbSeg(ap,{x:ap.x,y:ap.y-16},'#8a6a1a',1.4);}
function cbPalace(b){const G=cbPalGeo(b),{X0,Y0,X1,Y1,bx0,bx1,by0,byF,xc,yc,W,D,H,RH,keep,gate}=G,P=TB_P,c=ctx;
  const stone='#f4efe4',stoneR='#d4ccbc',trim='#e2d6bc',gold='#e8c25a',roof=b.roof||'#2a4a8a',crim='#a8283a';
  poly([P(bx0-20,Y1),P(X1+30,Y1),P(X1+30,Y0+30),P(bx1,Y0)],'rgba(0,0,0,.2)');
  // the keep, rising behind everything
  {const {x0,y0,x1,y1,h}=keep;tbBox(x0,y0,x1,y1,0,h,stone,stoneR);const F=tbF(x0,y1),R=tbR(x1,y1);
    for(const [S,L] of [[F,x1-x0],[R,y1-y0]]){c.globalAlpha=.22;for(let k=14;k<h;k+=14)tbSeg(S(0,k),S(L,k),'#8a8070',.8);c.globalAlpha=1;tbQuad(S,0,h-8,L,h-4,gold,'#8a6a1a');}
    for(const hh of [120,148]){cbArch(F,(x1-x0)/2-6,(x1-x0)/2+6,hh,hh+10,'#22344a');cbArch(R,(y1-y0)/2-5,(y1-y0)/2+5,hh,hh+9,'#22344a');}
    poly([P(x0,y0,h),P(x1,y0,h),P(x1,y1,h),P(x0,y1,h)],'#d8d0c0',TB_OL);cbCren(F,x1-x0,h,6,stone);cbCren(R,y1-y0,h,6,stoneR);
    tbSeg(P((x0+x1)/2,(y0+y1)/2,h),P((x0+x1)/2,(y0+y1)/2,h+46),'#5a4a2a',2);}
  // the back corner tower
  cbConeTower(G.tw[2],stone,stoneR,roof,gold);
  // the main hall: two floors of tall arched windows with gold sills, a gold band between them, a blue hip roof
  tbBox(bx0,by0,bx1,byF,0,H,stone,stoneR);const F=tbF(bx0,byF),R=tbR(bx1,byF);
  for(const [S,L] of [[F,W],[R,D]]){c.globalAlpha=.2;for(let k=12;k<H;k+=12)tbSeg(S(0,k),S(L,k),'#8a8070',.8);c.globalAlpha=1;
    tbQuad(S,0,0,L,8,trim);tbQuad(S,0,42,L,46,gold,'#8a6a1a');tbQuad(S,0,H-6,L,H,trim);}
  const win=(S,u)=>{for(const [h0,h1] of [[12,34],[52,74]]){cbArch(S,u-7,u+7,h0,h1-7,'#2a3e5a');tbSeg(S(u,h0),S(u,h1),gold,.8);tbQuad(S,u-9,h0-3,u+9,h0,gold,'#8a6a1a');}};
  for(const u of [24,50,W-50,W-24])win(F,u);for(const u of [D*.25,D*.5,D*.75])win(R,u);
  {const e=12,hh=D/2,r1=P(bx0+hh,yc,H+RH),r2=P(bx1-hh,yc,H+RH),eT=P(bx0-e,by0-e,H),eR=P(bx1+e,by0-e,H),eB=P(bx1+e,byF+e,H),eL=P(bx0-e,byF+e,H);
    poly([eT,eR,r2,r1],shade(roof,-40));poly([eL,eT,r1],shade(roof,-25),shade(roof,-60));poly([eR,eB,r2],shade(roof,-12),shade(roof,-60));poly([eB,eL,r1,r2],roof,shade(roof,-60));
    c.globalAlpha=.3;for(let k=1;k<6;k++){const t=k/6;tbSeg(P(bx0-e+(hh+e)*t,byF+e-(byF+e-yc)*t,H+RH*t),P(bx1+e-(hh+e)*t,byF+e-(byF+e-yc)*t,H+RH*t),shade(roof,-70),1);}c.globalAlpha=1;
    tbSeg(r1,r2,gold,2.6);for(const t of [.3,.7]){const p=P(bx0+hh+(W-2*hh)*t,yc,H+RH);c.fillStyle=gold;c.beginPath();c.arc(p.x,p.y-4,3,0,7);c.fill();tbSeg(p,{x:p.x,y:p.y-12},'#8a6a1a',1.4);}}
  // the front corner towers
  cbConeTower(G.tw[0],stone,stoneR,roof,gold);cbConeTower(G.tw[1],stone,stoneR,roof,gold);
  // the gatehouse: crenellated, with gold-studded doors, the crest and two banners
  {const {x0,x1,y0,y1,h}=gate,GF=tbF(x0,y1),GR=tbR(x1,y1),L=x1-x0;tbBox(x0,y0,x1,y1,0,h,stone,stoneR);
    c.globalAlpha=.2;for(let k=12;k<h;k+=12)tbSeg(GF(0,k),GF(L,k),'#8a8070',.8);c.globalAlpha=1;
    tbQuad(GF,0,0,L,8,trim);tbQuad(GF,0,h-10,L,h-6,gold,'#8a6a1a');poly([P(x0,y0,h),P(x1,y0,h),P(x1,y1,h),P(x0,y1,h)],'#e2dac8',TB_OL);cbCren(GF,L,h,7,stone);cbCren(GR,y1-y0,h,7,stoneR);
    cbArch(GF,L/2-20,L/2+20,0,38,'#3a2a1a');cbArch(GF,L/2-17,L/2+17,0,36,'#c8963a');tbSeg(GF(L/2,0),GF(L/2,52),'#7a5a1a',1.6);
    for(const u of [L/2-11,L/2+11])for(const hh of [10,22,34]){const p=GF(u,hh);c.fillStyle='#fff0b0';c.beginPath();c.arc(p.x,p.y,1.4,0,7);c.fill();}
    cbArch(GF,L/2-23,L/2+23,0,38,null,'#b8a888');
    // the crest: a blue shield with a gold crown
    {const p=GF(L/2,86);c.fillStyle='#2a4a8a';c.strokeStyle=gold;c.lineWidth=2;c.beginPath();c.moveTo(p.x-11,p.y-12);c.lineTo(p.x+11,p.y-12);c.lineTo(p.x+11,p.y+2);c.quadraticCurveTo(p.x+11,p.y+12,p.x,p.y+16);c.quadraticCurveTo(p.x-11,p.y+12,p.x-11,p.y+2);c.closePath();c.fill();c.stroke();
      c.fillStyle=gold;c.beginPath();c.moveTo(p.x-6,p.y+3);c.lineTo(p.x-7,p.y-5);c.lineTo(p.x-3,p.y-1);c.lineTo(p.x,p.y-7);c.lineTo(p.x+3,p.y-1);c.lineTo(p.x+7,p.y-5);c.lineTo(p.x+6,p.y+3);c.closePath();c.fill();}
    // two long crimson banners with a gold border and crown
    for(const u of [9,L-9]){poly([GF(u-6,h-12),GF(u+6,h-12),GF(u+6,50),GF(u,44),GF(u-6,50)],crim,'#5a1018');tbSeg(GF(u-4,h-14),GF(u-4,52),gold,1);tbSeg(GF(u+4,h-14),GF(u+4,52),gold,1);
      const p=GF(u,h-26);c.fillStyle=gold;c.beginPath();c.moveTo(p.x-4,p.y+2);c.lineTo(p.x-5,p.y-4);c.lineTo(p.x-2,p.y-1);c.lineTo(p.x,p.y-5);c.lineTo(p.x+2,p.y-1);c.lineTo(p.x+5,p.y-4);c.lineTo(p.x+4,p.y+2);c.closePath();c.fill();}}
  // broad steps up to the gate
  for(let k=0;k<4;k++)tbBox(gate.x0-12+k*2,gate.y1,gate.x1+12-k*2,gate.y1+30-k*7,k*3,k*3+3,'#e8e0d0','#c8beac','#f4efe4');
  // braziers: stone bowls on short pillars (the fire is live)
  for(const {x,y} of G.br){cbCyl(x,y,5,0,22,'#c8beac',null);cbCyl(x,y,10,22,28,'#a89e8c','#3a2a1a');}
}
function cbPalaceLive(b){const G=cbPalGeo(b),P=TB_P,c=ctx,t=now;c.save();
  // pennants on the corner towers
  for(const [i,tw] of G.tw.entries()){const top=P(tw.x,tw.y,tw.h+tw.r*2.4),x=top.x,y=top.y-16,ph=t*4+i;c.fillStyle=i===2?'#e8c25a':'#a8283a';c.strokeStyle='#3a1a10';c.lineWidth=.8;c.beginPath();c.moveTo(x,y);
    for(let k=1;k<=5;k++){const u=k/5;c.lineTo(x+u*16,y+2.5*u+Math.sin(ph-u*3)*2*u);}for(let k=5;k>=0;k--){const u=k/5;c.lineTo(x+u*16,y+7-2.5*u+Math.sin(ph-u*3)*2*u);}c.closePath();c.fill();c.stroke();}
  // the great flag on the keep: the colours of the guild that holds Emberkeep, else the Crown's blue and gold
  {const k=G.keep,top=P((k.x0+k.x1)/2,(k.y0+k.y1)/2,k.h+46),x=top.x,y=top.y,ph=t*3,col=typeof GW!=='undefined'&&GW.owner&&typeof keepColour==='function'?keepColour():'#2a4a8a';
    const pts=[];for(let i=0;i<=8;i++){const u=i/8;pts.push({x:x+u*34,y:y+Math.sin(ph-u*3.5)*3*u});}
    c.fillStyle=col;c.strokeStyle='#1a1a2a';c.lineWidth=1;c.beginPath();c.moveTo(pts[0].x,pts[0].y);for(const p of pts)c.lineTo(p.x,p.y);for(let i=8;i>=0;i--)c.lineTo(pts[i].x,pts[i].y+20);c.closePath();c.fill();c.stroke();
    if(!(typeof GW!=='undefined'&&GW.owner)){const m=pts[4];c.fillStyle='#e8c25a';c.beginPath();c.moveTo(m.x-5,m.y+14);c.lineTo(m.x-6,m.y+6);c.lineTo(m.x-2.5,m.y+9);c.lineTo(m.x,m.y+4);c.lineTo(m.x+2.5,m.y+9);c.lineTo(m.x+6,m.y+6);c.lineTo(m.x+5,m.y+14);c.closePath();c.fill();}
    else if(typeof drawEmblem==='function')try{drawEmblem(c,GW.owner.emblem,pts[4].x,pts[4].y+10,14);}catch(e){}}
  // the braziers burn
  for(const [i,{x,y}] of G.br.entries()){const p=P(x,y,28);for(let k=0;k<5;k++){const ph=(t*1.8+k*.21+i*.37)%1;c.globalAlpha=1-ph;c.fillStyle=k%2?'#ffd060':'#ff7a2a';c.beginPath();c.ellipse(p.x+Math.sin(t*5+k)*3*(1-ph),p.y-2-ph*18,4.5-ph*3,7-ph*4,0,0,7);c.fill();}
    c.globalAlpha=.35;const g=c.createRadialGradient(p.x,p.y-6,1,p.x,p.y-6,20);g.addColorStop(0,'rgba(255,200,90,.8)');g.addColorStop(1,'rgba(255,200,90,0)');c.fillStyle=g;c.beginPath();c.arc(p.x,p.y-6,20,0,7);c.fill();c.globalAlpha=1;}
  c.restore();}
const cbPalaceLights=b=>{const G=cbPalGeo(b),out=[];for(const u of [24,50,G.W-50,G.W-24])for(const h of [23,63])out.push([G.bx0+u,G.byF,h]);
  for(const u of [.25,.5,.75])out.push([G.bx1,G.byF-G.D*u,63]);for(const t of G.tw.slice(0,2))out.push([t.x,t.y+t.r,82]);out.push([G.xc,G.gate.y1,20,1]);for(const r of G.br)out.push([r.x,r.y,34]);return tbLit(out);};

/* ---------------- the city wall (v1.37.1) ---------------- */
// far sides (north, west): a tall wall of pale dressed stone with a walk and merlons along the city side, arrow slits,
// round watchtowers with blue cones and pennants. Near sides (south, east): a knee-high parapet with gold-capped posts.
// The wall is long, so it is not cached: each section is drawn only when it is on screen.
const CB_WALL={stone:'#e4dccb',stoneR:'#c4baa6',top:'#d2c9b6',gold:'#e8c25a',roof:'#2a4a8a'};
function cbOnScreen(b,up){const X0=b.x*TILE,Y0=b.y*TILE,X1=(b.x+b.w)*TILE,Y1=(b.y+b.h)*TILE,ps=[proj(X0,Y0),proj(X1,Y0),proj(X1,Y1),proj(X0,Y1)];
  const x0=Math.min(...ps.map(p=>p.x)),x1=Math.max(...ps.map(p=>p.x)),y0=Math.min(...ps.map(p=>p.y))-(up||0),y1=Math.max(...ps.map(p=>p.y));
  return x1>camX-60&&x0<camX+VW+60&&y1>camY-60&&y0<camY+VH+60;}
function cbWallTower(x,y,r,h){const W=CB_WALL;cbConeTower({x,y,r,h},W.stone,W.stoneR,W.roof,W.gold);}
function cbWall(b){const W=CB_WALL,P=TB_P,c=ctx,X0=b.x*TILE,Y0=b.y*TILE,X1=(b.x+b.w)*TILE,Y1=(b.y+b.h)*TILE;
  if(b.side==='n'||b.side==='w'){const H=74,n=b.side==='n';
    // the wall: n runs along x with its face to +y; w runs along y with its face to +x
    const a0=n?X0:Y0,a1=n?X1:Y1,f=n?Y0+50:X0+50,bk=n?Y0+10:X0+10;
    const pt=(u,d,h)=>n?P(u,d,h):P(d,u,h); // u along the wall, d across it
    if(n)poly([pt(a0,f,0),pt(a1,f,0),pt(a1,f,H),pt(a0,f,H)],W.stone,TB_OL);else poly([pt(a0,f,0),pt(a1,f,0),pt(a1,f,H),pt(a0,f,H)],W.stoneR,TB_OL);
    poly([pt(a0,bk,H),pt(a1,bk,H),pt(a1,f,H),pt(a0,f,H)],W.top,TB_OL);
    c.globalAlpha=.28;for(let h=12;h<H;h+=12)tbSeg(pt(a0,f,h),pt(a1,f,h),'#8a8070',.8);
    for(let h=0;h<H;h+=12)for(let u=a0+((h/12)%2)*14+7;u<a1;u+=28)tbSeg(pt(u,f,h),pt(u,f,h+12),'#8a8070',.8);c.globalAlpha=1;
    poly([pt(a0,f,0),pt(a1,f,0),pt(a1,f,8),pt(a0,f,8)],'#b8ae9a',null);
    // arrow slits and a gold band under the walk
    for(let u=a0+18;u<a1-8;u+=40){const p=pt(u,f,40);c.fillStyle='#2a2620';c.fillRect(p.x-1.6,p.y-12,3.2,12);}
    poly([pt(a0,f,H-6),pt(a1,f,H-6),pt(a1,f,H-3),pt(a0,f,H-3)],W.gold,null);
    // merlons on the city side
    for(let u=a0;u<a1-4;u+=14){const m0=u,m1=u+8;if(n)tbBox(m0,f-6,m1,f,H,H+10,W.stone,W.stoneR,W.top);else tbBox(f-6,m0,f,m1,H,H+10,W.stone,W.stoneR,W.top);}
    if(b.tower)cbWallTower(n?X0:X0+30,n?Y0+30:Y0,26,112);
    if(b.towerEnd)cbWallTower(n?X1-6:X0+30,n?Y0+30:Y1-6,30,124);
    if(n&&b.x===0)cbWallTower(X0+30,Y0+30,32,128); // the north-west corner
  }else{const H=20,n=b.side==='s';const a0=n?X0:Y0,a1=n?X1:Y1,f=n?Y0+22:X0+22,bk=n?Y0+8:X0+8,pt=(u,d,h)=>n?P(u,d,h):P(d,u,h);
    poly([pt(a0,f,0),pt(a1,f,0),pt(a1,f,H),pt(a0,f,H)],n?W.stone:W.stoneR,TB_OL);poly([pt(a0,bk,H),pt(a1,bk,H),pt(a1,f,H),pt(a0,f,H)],W.top,TB_OL);
    c.globalAlpha=.28;tbSeg(pt(a0,f,10),pt(a1,f,10),'#8a8070',.8);c.globalAlpha=1;
    // posts with gold caps every four tiles
    for(let u=a0;u<=a1;u+=TILE*4){const x=n?u:(X0+15),y=n?(Y0+15):u;tbBox(x-6,y-6,x+6,y+6,0,30,W.stone,W.stoneR,W.top);const p=P(x,y,30);c.fillStyle=W.gold;c.strokeStyle='#8a6a1a';c.lineWidth=1;c.beginPath();c.arc(p.x,p.y-3,3.4,0,7);c.fill();c.stroke();}}
}
function cbWallDraw(b){if(!cbOnScreen(b,b.side==='n'||b.side==='w'?220:60))return;cbWall(b);
  // pennants on the watchtowers
  const t=now,c=ctx,pen=(x,y,h,i)=>{const top=TB_P(x,y,h),px=top.x,py=top.y-16,ph=t*4+i;c.fillStyle='#a8283a';c.strokeStyle='#3a1a10';c.lineWidth=.8;c.beginPath();c.moveTo(px,py);
    for(let k=1;k<=5;k++){const u=k/5;c.lineTo(px+u*15,py+2.4*u+Math.sin(ph-u*3)*2*u);}for(let k=5;k>=0;k--){const u=k/5;c.lineTo(px+u*15,py+7-2.4*u+Math.sin(ph-u*3)*2*u);}c.closePath();c.fill();c.stroke();};
  const X0=b.x*TILE,Y0=b.y*TILE,X1=(b.x+b.w)*TILE,Y1=(b.y+b.h)*TILE,n=b.side==='n';
  if(b.tower)pen(n?X0:X0+30,n?Y0+30:Y0,112+26*2.4,b.x+b.y);if(b.towerEnd)pen(n?X1-6:X0+30,n?Y0+30:Y1-6,124+30*2.4,b.x+b.y+1);if(n&&b.x===0)pen(X0+30,Y0+30,128+32*2.4,0);}
// the east gate: two square towers either side of the road, blue pyramid roofs, a long banner and a torch each
function cbGateTower(b){const W=CB_WALL,P=TB_P,c=ctx,X0=b.x*TILE,Y0=b.y*TILE,X1=(b.x+b.w)*TILE,Y1=(b.y+b.h)*TILE,x0=X0+6,x1=X1-6,y0=Y0+6,y1=Y1-6,H=104;
  tbBox(x0,y0,x1,y1,0,H,W.stone,W.stoneR);const F=tbF(x0,y1),R=tbR(x1,y1),L=x1-x0,D=y1-y0;
  for(const [S,l] of [[F,L],[R,D]]){c.globalAlpha=.28;for(let h=12;h<H;h+=12)tbSeg(S(0,h),S(l,h),'#8a8070',.8);c.globalAlpha=1;tbQuad(S,0,0,l,8,'#b8ae9a',null);tbQuad(S,0,H-8,l,H-4,W.gold,'#8a6a1a');}
  for(const hh of [40,72]){const p=F(L/2,hh);c.fillStyle='#22344a';c.beginPath();c.roundRect(p.x-3.5,p.y-14,7,14,[3.5,3.5,0,0]);c.fill();}
  // the side that faces the road carries a long crimson banner with the crown
  const S=b.up?F:F;{const u=L/2,top=H-12;poly([S(u-8,top),S(u+8,top),S(u+8,24),S(u,18),S(u-8,24)],'#a8283a','#5a1018');
    const p=S(u,top-14);c.fillStyle=W.gold;c.beginPath();c.moveTo(p.x-4,p.y+2);c.lineTo(p.x-5,p.y-4);c.lineTo(p.x-2,p.y-1);c.lineTo(p.x,p.y-5);c.lineTo(p.x+2,p.y-1);c.lineTo(p.x+5,p.y-4);c.lineTo(p.x+4,p.y+2);c.closePath();c.fill();}
  const ap=P((x0+x1)/2,(y0+y1)/2,H+42);poly([P(x0-4,y1+4,H),P(x1+4,y1+4,H),ap],W.roof,TB_OL);poly([P(x1+4,y1+4,H),P(x1+4,y0-4,H),ap],shade(W.roof,-25),TB_OL);
  c.fillStyle=W.gold;c.beginPath();c.arc(ap.x,ap.y-3,3,0,7);c.fill();}
function cbGateLive(b){const P=TB_P,c=ctx,t=now,X0=b.x*TILE,Y0=b.y*TILE,X1=(b.x+b.w)*TILE,Y1=(b.y+b.h)*TILE;
  // a torch on the road side
  const p=P(X0+18,b.up?Y1:Y0+10,58);tbSeg({x:p.x,y:p.y+10},p,'#5a3a1c',2.4);
  for(let k=0;k<4;k++){const ph=(t*2+k*.25)%1;c.globalAlpha=1-ph;c.fillStyle=k%2?'#ffd060':'#ff7a2a';c.beginPath();c.ellipse(p.x+Math.sin(t*6+k)*2*(1-ph),p.y-2-ph*12,3.5-ph*2,5.5-ph*3,0,0,7);c.fill();}c.globalAlpha=1;}

/* ---------------- the Royal Stables & Kennels ---------------- */
// a long stable of stone below and timber above under blue slate: three half-doors with a Meadow Hopper and a Grey
// Lupe looking out (ears twitch, heads nod), a hay loft, a cupola with a turning weathervane; a paddock fence with a
// saddle on the rail, a trough and hay bales; a kennel with a bowl on the side; a horseshoe-and-paw sign
const cbStbGeo=b=>{const X0=b.x*TILE,Y0=b.y*TILE,X1=(b.x+b.w)*TILE,Y1=(b.y+b.h)*TILE,bx0=X0+8,bx1=X1-62,by0=Y0+18,byF=Y1-50;
  return{X0,Y0,X1,Y1,bx0,bx1,by0,byF,W:bx1-bx0,D:byF-by0,H:60,RH:36,stall:[30,74,118],ken:{x0:bx1+12,y0:by0+30,x1:bx1+46,y1:by0+64}};};
function cbStables(b){const G=cbStbGeo(b),{X0,Y0,X1,Y1,bx0,bx1,by0,byF,W,D,H,RH,ken}=G,P=TB_P,c=ctx;
  const stone='#c8bfae',stoneR='#a89e8c',wood='#8a5a32',woodR='#6a4426',roof=b.roof||'#2a4a8a',gold='#e8c25a',hay='#e8c860';
  poly([P(bx0,Y1),P(X1+24,Y1),P(X1+24,Y0+24),P(bx1,Y0)],'rgba(0,0,0,.2)');
  // the kennel on the side, behind the stable's corner
  {const {x0,y0,x1,y1}=ken;tbBox(x0,y0,x1,y1,0,24,'#b8784a','#946038');const kF=tbF(x0,y1);
    const ap=P((x0+x1)/2,y1+3,40);poly([P(x0-3,y1+3,24),P(x1+3,y1+3,24),ap],'#2a4a8a',TB_OL);poly([P(x1+3,y1+3,24),P(x1+3,y0-3,24),P((x0+x1)/2,y0-3,40),ap],shade(roof,-25),TB_OL);
    cbArch(kF,(x1-x0)/2-7,(x1-x0)/2+7,0,10,'#2a1a10');const bw=P(x0-8,y1+10);c.fillStyle='#5a8ac8';c.strokeStyle=TB_OL;c.lineWidth=1;c.beginPath();c.ellipse(bw.x,bw.y-2,6,3,0,0,7);c.fill();c.stroke();
    c.fillStyle='#a87a40';c.beginPath();c.ellipse(bw.x,bw.y-3,4,1.8,0,0,7);c.fill();}
  // the stable: stone below, timber above
  tbBox(bx0,by0,bx1,byF,0,H,wood,woodR);const F=tbF(bx0,byF),R=tbR(bx1,byF);
  for(const [S,L,col,colR] of [[F,W,stone,'#7a7268'],[R,D,stoneR,'#6a6258']]){tbQuad(S,0,0,L,24,col);c.globalAlpha=.4;for(let h=8;h<24;h+=8)tbSeg(S(0,h),S(L,h),colR,.8);c.globalAlpha=1;
    c.globalAlpha=.35;for(let u=8;u<L;u+=8)tbSeg(S(u,24),S(u,H),'#4a2e14',.8);c.globalAlpha=1;tbQuad(S,0,24,L,27,'#5a3a1c');}
  // the stalls: half-doors (the lower half shut, the upper open and dark)
  for(const u of G.stall){tbQuad(F,u-13,0,u+13,44,'#2a1a10');tbQuad(F,u-13,0,u+13,22,'#7a4a26');tbSeg(F(u-13,0),F(u+13,22),'#4a2e14',1.4);tbSeg(F(u-13,22),F(u+13,0),'#4a2e14',1.4);
    tbQuad(F,u-15,44,u+15,48,'#5a3a1c');tbQuad(F,u-14,21,u+14,24,'#5a3a1c');}
  // hay in the third stall
  {const p=F(G.stall[2],24);c.fillStyle=hay;c.beginPath();c.ellipse(p.x,p.y-3,10,5,0,Math.PI,0);c.fill();c.strokeStyle='#a8883a';c.lineWidth=.8;for(let k=-8;k<=8;k+=3){c.beginPath();c.moveTo(p.x+k,p.y-1);c.lineTo(p.x+k*1.2,p.y-7);c.stroke();}}
  // a window on the side
  tbQuad(R,D/2-8,32,D/2+8,46,'#2a1a10');tbSeg(R(D/2,32),R(D/2,46),'#5a3a1c',1.2);
  tbGableX(bx0,by0,bx1,byF,H,RH,roof,woodR);
  // the hay loft door in the roof's gable side and a bale peeking out; the cupola with a gold ball
  {const yc=(by0+byF)/2,p0=P(bx1,yc+10,H+4),p1=P(bx1,yc-10,H+4);poly([p0,p1,P(bx1,yc-10,H+22),P(bx1,yc+10,H+22)],'#2a1a10',TB_OL);
    tbBox(bx1-2,yc-8,bx1+8,yc+8,H+4,H+14,hay,shade(hay,-15),shade(hay,10));
    const cx=bx0+W*.5;tbBox(cx-10,yc-10,cx+10,yc+10,H+RH-10,H+RH+12,'#f0e8d8','#d4ccbc');const ap=P(cx,yc,H+RH+26);
    poly([P(cx-13,yc+13,H+RH+12),P(cx+13,yc+13,H+RH+12),ap],roof,TB_OL);poly([P(cx+13,yc+13,H+RH+12),P(cx+13,yc-13,H+RH+12),ap],shade(roof,-25),TB_OL);
    tbSeg(ap,{x:ap.x,y:ap.y-16},'#3a3632',1.6);c.fillStyle=gold;c.beginPath();c.arc(ap.x,ap.y-2,2.4,0,7);c.fill();}
  // the paddock: a fence corner in front-left with a saddle on the rail, a trough and two hay bales
  {const x0=X0+2,y1=Y1-6,xA=X0+2,yA=byF+10;for(const [a,z] of [[[xA,yA],[xA,y1]],[[xA,y1],[bx0+56,y1]]]){const n=4;
      for(let i=0;i<=n;i++){const x=a[0]+(z[0]-a[0])*i/n,y=a[1]+(z[1]-a[1])*i/n;tbSeg(P(x,y,0),P(x,y,18),'#6a4426',2.4);}
      for(const h of [8,16])tbSeg(P(a[0],a[1],h),P(z[0],z[1],h),'#8a5a32',2);}
    const s=P(X0+2,byF+30,18);c.fillStyle='#8e2a22';c.strokeStyle=TB_OL;c.lineWidth=1;c.beginPath();c.ellipse(s.x,s.y-2,7,4,0,Math.PI,0);c.lineTo(s.x+6,s.y+6);c.lineTo(s.x-6,s.y+6);c.closePath();c.fill();c.stroke();
    c.fillStyle=gold;c.fillRect(s.x-1.5,s.y+1,3,3);
    tbBox(X0+14,byF+14,X0+44,byF+24,0,9,'#7a5232','#5a3a1c','#5a9ad8');
    for(const [x,y] of [[bx0+40,Y1-22],[bx0+58,Y1-30]])tbBox(x-9,y-6,x+9,y+6,0,11,hay,shade(hay,-15),shade(hay,8));}
  // the sign bracket off the front corner
  tbSeg(P(bx1,byF,54),P(bx1,byF+22,54),'#3a3632',2.2);
}
function cbStablesLive(b){const G=cbStbGeo(b),P=TB_P,c=ctx,t=now,F=tbF(G.bx0,G.byF);c.save();
  // a Meadow Hopper and a Grey Lupe look out over their half-doors
  {const nod=Math.sin(t*1.6)*1.5,tw=Math.sin(t*3)>0.85?-.35:0,p=F(G.stall[0],30);const y=p.y+nod;
    c.fillStyle='#d8b48a';c.strokeStyle='#5a3a1c';c.lineWidth=1.2;
    c.save();c.translate(p.x-4,y-8);c.rotate(-.25+tw);c.beginPath();c.ellipse(0,-9,3.2,10,0,0,7);c.fill();c.stroke();c.fillStyle='#f0c8c0';c.beginPath();c.ellipse(0,-9,1.4,7,0,0,7);c.fill();c.restore();
    c.save();c.translate(p.x+5,y-8);c.rotate(.25);c.fillStyle='#d8b48a';c.beginPath();c.ellipse(0,-9,3.2,10,0,0,7);c.fill();c.stroke();c.fillStyle='#f0c8c0';c.beginPath();c.ellipse(0,-9,1.4,7,0,0,7);c.fill();c.restore();
    c.fillStyle='#d8b48a';c.beginPath();c.ellipse(p.x,y,10,8,0,0,7);c.fill();c.stroke();c.fillStyle='#2a1a10';c.beginPath();c.arc(p.x-4,y-1,1.4,0,7);c.arc(p.x+4,y-1,1.4,0,7);c.fill();
    c.fillStyle='#e88a9a';c.beginPath();c.arc(p.x,y+3,1.4,0,7);c.fill();}
  {const nod=Math.sin(t*1.3+1)*1.5,p=F(G.stall[1],30),y=p.y+nod,tw=Math.sin(t*2.6+2)>0.85?.3:0;c.fillStyle='#8a909c';c.strokeStyle='#2a2a32';c.lineWidth=1.2;
    for(const [dx,r] of [[-6,-.3-tw],[6,.3]]){c.save();c.translate(p.x+dx,y-7);c.rotate(r);c.beginPath();c.moveTo(-4,0);c.lineTo(0,-10);c.lineTo(4,0);c.closePath();c.fill();c.stroke();c.restore();}
    c.beginPath();c.ellipse(p.x,y,10,8,0,0,7);c.fill();c.stroke();c.fillStyle='#b8bcc6';c.beginPath();c.moveTo(p.x-4,y+1);c.lineTo(p.x+4,y+1);c.lineTo(p.x,y+8);c.closePath();c.fill();
    c.fillStyle='#2a2a32';c.beginPath();c.arc(p.x,y+7,1.6,0,7);c.fill();c.fillStyle='#f0c040';c.beginPath();c.arc(p.x-4,y-2,1.4,0,7);c.arc(p.x+4,y-2,1.4,0,7);c.fill();}
  // the weathervane turns slowly
  {const yc=(G.by0+G.byF)/2,cx=G.bx0+G.W*.5,ap=P(cx,yc,G.H+G.RH+26),a=Math.sin(t*.4)*1.2,L=11;c.strokeStyle='#3a3632';c.lineWidth=1.6;
    c.beginPath();c.moveTo(ap.x-Math.cos(a)*L,ap.y-14-Math.sin(a)*3);c.lineTo(ap.x+Math.cos(a)*L,ap.y-14+Math.sin(a)*3);c.stroke();
    const hx=ap.x+Math.cos(a)*L,hy=ap.y-14+Math.sin(a)*3;c.fillStyle='#3a3632';c.beginPath();c.moveTo(hx,hy-3);c.lineTo(hx+Math.cos(a)*5,hy);c.lineTo(hx,hy+3);c.closePath();c.fill();}
  // the sign swings: a horseshoe and a paw
  {const a=P(G.bx1,G.byF+18,54),sw=Math.sin(t*1.2+3)*.1;c.translate(a.x,a.y);c.rotate(sw);tbSeg({x:-7,y:0},{x:-7,y:5},'#3a3632',1);tbSeg({x:7,y:0},{x:7,y:5},'#3a3632',1);
    c.fillStyle='#2a4a8a';c.strokeStyle='#e8c25a';c.lineWidth=1.4;c.beginPath();c.roundRect(-15,5,30,20,4);c.fill();c.stroke();
    c.strokeStyle='#e8c25a';c.lineWidth=2.4;c.beginPath();c.arc(-6,15,5,Math.PI*.15,Math.PI*.85,true);c.stroke();
    c.fillStyle='#e8c25a';c.beginPath();c.arc(7,17,3,0,7);c.fill();for(const [dx,dy] of [[-3,-4],[0,-6],[3,-6],[6,-4]]){c.beginPath();c.arc(4+dx,17+dy,1.3,0,7);c.fill();}}
  c.restore();}
const cbStablesLights=b=>{const G=cbStbGeo(b);return tbLit([...G.stall.map(u=>[G.bx0+u,G.byF,36]),[G.bx1,(G.by0+G.byF)/2,40]]);};

/* ---------------- the Hall of Awakening (v1.37.4) ---------------- */
// an open round temple on a stepped platform: white columns in a ring, a violet glass dome with gold ribs and a star;
// inside, a rune circle turns on the floor, a column of light rises and a crystal floats and spins; violet braziers
const cbAwGeo=b=>{const X0=b.x*TILE,Y0=b.y*TILE,X1=(b.x+b.w)*TILE,Y1=(b.y+b.h)*TILE;return{X0,Y0,X1,Y1,cx:(X0+X1)/2-6,cy:(Y0+Y1)/2-4,R:66,cr:52,ch:112,n:8,br:[{x:X0+18,y:Y1-12},{x:X1-30,y:Y1-12}]};};
function cbAwCol(G,i,c){const a=i*Math.PI*2/G.n+Math.PI/8,x=G.cx+Math.cos(a)*G.cr,y=G.cy+Math.sin(a)*G.cr;
  cbCyl(x,y,5.5,12,G.ch,Math.sin(a+Math.PI/4)>0?'#f4efe4':'#ddd4c2',null,'#8a8070');cbCyl(x,y,7.5,G.ch-4,G.ch,'#e8c25a',null,'#8a6a1a');cbCyl(x,y,7.5,12,15,'#e2dac8',null,'#8a8070');}
const cbAwFront=(G,i)=>Math.sin(i*Math.PI*2/G.n+Math.PI/8+Math.PI/4)>-.05;
function cbAwaken(b){const G=cbAwGeo(b),{cx,cy,R}=G,P=TB_P;
  poly(cbRing(cx+14,cy+14,R+14,0),'rgba(0,0,0,.18)');
  // three steps up to the floor
  cbCyl(cx,cy,R+10,0,4,'#c8beac','#ddd4c2');cbCyl(cx,cy,R+4,4,8,'#d4ccbc','#e8e0d0');cbCyl(cx,cy,R-2,8,12,'#e2dac8','#f0eadc');
  // the floor: pale marble with a ring of darker stone where the runes turn
  poly(cbRing(cx,cy,G.cr-10,12),'#e8e0d4','#b8ae9a');poly(cbRing(cx,cy,G.cr-16,12),'#3a2a5a',null);
  // the columns at the back (the front ones are drawn over the light, live)
  for(let i=0;i<G.n;i++)if(!cbAwFront(G,i))cbAwCol(G,i);
  // braziers on short pillars by the steps (their violet fire is live)
  for(const {x,y} of G.br){cbCyl(x,y,5,0,20,'#c8beac',null);cbCyl(x,y,9,20,26,'#8a7aa0','#2a1a3a');}
}
function cbAwakenLive(b){const G=cbAwGeo(b),{cx,cy}=G,P=TB_P,c=ctx,t=now;c.save();
  // the rune circle turns on the floor
  {const r1=G.cr-18,ctr=P(cx,cy,12);const g=c.createRadialGradient(ctr.x,ctr.y,2,ctr.x,ctr.y,r1*1.1);g.addColorStop(0,'rgba(200,150,255,.55)');g.addColorStop(1,'rgba(120,80,220,0)');
    c.fillStyle=g;c.beginPath();c.ellipse(ctr.x,ctr.y,r1*1.103,r1*.552,0,0,7);c.fill();
    c.strokeStyle='rgba(220,190,255,.9)';c.lineWidth=1.6;poly(cbRing(cx,cy,r1,12,0,Math.PI*2,40),null,'rgba(220,190,255,.9)');poly(cbRing(cx,cy,r1-9,12,0,Math.PI*2,40),null,'rgba(220,190,255,.6)');
    c.font='bold 9px serif';c.textAlign='center';c.fillStyle='#f0e0ff';const gl='ᚨᛒᛞᛖᚠᛟᛗᛉ';for(let k=0;k<8;k++){const a=t*.5+k*Math.PI/4,p=P(cx+Math.cos(a)*(r1-4.5),cy+Math.sin(a)*(r1-4.5),12);c.fillText(gl[k],p.x,p.y+3);}
    for(let k=0;k<3;k++){const a=-t*.8+k*Math.PI*2/3,p1=P(cx+Math.cos(a)*(r1-9),cy+Math.sin(a)*(r1-9),12),p2=P(cx+Math.cos(a+Math.PI*2/3)*(r1-9),cy+Math.sin(a+Math.PI*2/3)*(r1-9),12);tbSeg(p1,p2,'rgba(220,190,255,.55)',1.2);}}
  // a column of light and the floating crystal
  {const base=P(cx,cy,12),top=P(cx,cy,G.ch+6),pulse=.5+Math.sin(t*2)*.15;const g=c.createLinearGradient(0,base.y,0,top.y);g.addColorStop(0,`rgba(210,170,255,${pulse})`);g.addColorStop(1,'rgba(210,170,255,0)');
    c.fillStyle=g;c.beginPath();c.moveTo(base.x-14,base.y);c.lineTo(top.x-8,top.y);c.lineTo(top.x+8,top.y);c.lineTo(base.x+14,base.y);c.closePath();c.fill();
    const p=P(cx,cy,50+Math.sin(t*1.5)*4),s=12,w=Math.max(.3,Math.abs(Math.cos(t*1.1)));
    const gl=c.createRadialGradient(p.x,p.y,1,p.x,p.y,26);gl.addColorStop(0,'rgba(230,200,255,.7)');gl.addColorStop(1,'rgba(230,200,255,0)');c.fillStyle=gl;c.beginPath();c.arc(p.x,p.y,26,0,7);c.fill();
    c.fillStyle='#c890ff';c.strokeStyle='#4a1a7a';c.lineWidth=1.3;c.beginPath();c.moveTo(p.x,p.y-s*1.6);c.lineTo(p.x+s*w,p.y-s*.2);c.lineTo(p.x,p.y+s*1.4);c.lineTo(p.x-s*w,p.y-s*.2);c.closePath();c.fill();c.stroke();
    c.fillStyle='rgba(255,255,255,.5)';c.beginPath();c.moveTo(p.x,p.y-s*1.6);c.lineTo(p.x-s*w,p.y-s*.2);c.lineTo(p.x,p.y);c.closePath();c.fill();
    for(let k=0;k<6;k++){const ph=(t*.3+k/6)%1,a=k*1.05+t*.4,q=P(cx+Math.cos(a)*18,cy+Math.sin(a)*18,14+ph*(G.ch-10));c.globalAlpha=Math.sin(ph*Math.PI);c.fillStyle='#f0e0ff';c.fillRect(q.x-1.2,q.y-1.2,2.4,2.4);}c.globalAlpha=1;}
  // the front columns, then the ring and the dome over them
  for(let i=0;i<G.n;i++)if(cbAwFront(G,i))cbAwCol(G,i);
  cbCyl(cx,cy,G.cr+9,G.ch,G.ch+8,'#e2dac8','#f0eadc');cbCyl(cx,cy,G.cr+9,G.ch+8,G.ch+11,'#e8c25a',null,'#8a6a1a');
  {const ct=P(cx,cy,G.ch+11),rx=(G.cr+6)*1.103,ry=(G.cr+6)*.552,dh=34;const gr=c.createLinearGradient(ct.x-rx,0,ct.x+rx,0);gr.addColorStop(0,'rgba(200,170,255,.95)');gr.addColorStop(.5,'rgba(140,100,220,.92)');gr.addColorStop(1,'rgba(90,60,170,.95)');
    c.fillStyle=gr;c.strokeStyle='#3a1a6a';c.lineWidth=1.5;c.beginPath();c.ellipse(ct.x,ct.y,rx,dh,0,Math.PI,Math.PI*2);c.ellipse(ct.x,ct.y,rx,ry,0,0,Math.PI);c.closePath();c.fill();c.stroke();
    c.strokeStyle='#e8c25a';c.lineWidth=1.3;for(let k=1;k<6;k++){const a=Math.PI*k/6,qx=ct.x-Math.cos(a)*rx,qy=ct.y+Math.sin(a)*ry;c.beginPath();c.moveTo(qx,qy);c.quadraticCurveTo(qx,ct.y-dh*.75,ct.x,ct.y-dh);c.stroke();}
    c.fillStyle='rgba(255,255,255,.35)';c.beginPath();c.ellipse(ct.x-rx*.4,ct.y-dh*.5,6,12,-.4,0,7);c.fill();
    const st=ct.y-dh-10;c.fillStyle='#e8c25a';c.strokeStyle='#8a6a1a';c.lineWidth=1;c.beginPath();for(let k=0;k<8;k++){const a=k*Math.PI/4-Math.PI/2,r=k%2?3:8;c.lineTo(ct.x+Math.cos(a)*r,st+Math.sin(a)*r);}c.closePath();c.fill();c.stroke();}
  // violet fire in the braziers
  for(const [i,{x,y}] of G.br.entries()){const p=P(x,y,26);for(let k=0;k<5;k++){const ph=(t*1.8+k*.21+i*.37)%1;c.globalAlpha=1-ph;c.fillStyle=k%2?'#e0b0ff':'#9a5ae8';c.beginPath();c.ellipse(p.x+Math.sin(t*5+k)*3*(1-ph),p.y-2-ph*16,4-ph*2.6,6.5-ph*3.5,0,0,7);c.fill();}c.globalAlpha=1;}
  c.restore();}
const cbAwakenLights=b=>{const G=cbAwGeo(b);return tbLit([[G.cx,G.cy,46],...G.br.map(r=>[r.x,r.y,32])]);};

const CAP_BLD={fountain:{body:cbFount,live:cbFountLive,lights:cbFountLights},
  gemcut:{body:cbGemcut,live:cbGemcutLive,signAt:b=>{const G=cbGemGeo(b);return[{name:b.name,x:(G.bx0+44)/TILE,w:0,y:(G.byF+12)/TILE,h:0},40];},lights:cbGemcutLights},
  library:{body:cbLib,live:cbLibLive,signAt:b=>{const G=cbLibGeo(b);return[{name:b.name,x:G.xc/TILE,w:0,y:(G.byF+G.po.d+2)/TILE,h:0},G.po.h+9];},lights:cbLibLights},
  smith:{body:cbForge,live:cbForgeLive,signAt:b=>{const G=cbForgeGeo(b);return[{name:b.name,x:(G.bx0+G.W/2)/TILE,w:0,y:G.byF/TILE,h:0},G.H-4];},lights:cbForgeLights},
  palace:{body:cbPalace,live:cbPalaceLive,signAt:b=>{const G=cbPalGeo(b);return[{name:b.name,x:G.xc/TILE,w:0,y:G.gate.y1/TILE,h:0},58];},lights:cbPalaceLights},
  wall:{draw:cbWallDraw,lights:()=>[]},
  gatetower:{body:cbGateTower,live:cbGateLive,lights:b=>tbLit([[b.x*TILE+18,b.up?(b.y+b.h)*TILE:b.y*TILE+10,58]])},
  stables:{body:cbStables,live:cbStablesLive,signAt:b=>{const G=cbStbGeo(b);return[{name:b.name,x:(G.bx0+G.stall[1]+10)/TILE,w:0,y:G.byF/TILE,h:0},G.H+20];},lights:cbStablesLights},
  awaken:{body:cbAwaken,live:cbAwakenLive,signAt:b=>{const G=cbAwGeo(b);return[{name:b.name,x:G.cx/TILE,w:0,y:(G.cy+G.cr+9)/TILE,h:0},G.ch+4];},lights:cbAwakenLights},
  shop:{body:cbMarket,live:cbMarketLive,signAt:b=>{const G=cbMarketGeo(b);return[{name:b.name,x:G.xc/TILE,w:0,y:G.byF/TILE,h:0},G.H1+20];},lights:cbMarketLights}};
// take over the drawing of the capital's pieces that have a design of their own
{const _prev=drawBuilding;
  drawBuilding=function(b){const T=typeof zoneId!=='undefined'&&(zoneId==='capital'||b.kind==='wall'||b.kind==='gatetower')&&CAP_BLD[b.kind||(b.npc&&b.npc.role)];if(!T)return _prev.apply(this,arguments);
    if(T.lights&&!b._cbl){b._nl=T.lights(b);b._cbl=1;}
    if(T.draw){T.draw(b);return;} // drawn straight to the screen, not cached (the long city wall)
    if(!bldCacheBlit(b,()=>T.body(b)))T.body(b);
    if(T.live)try{T.live(b);}catch(e){}
    if(b.name)try{const sa=T.signAt?T.signAt(b):[b,T.sign||54];drawSign(sa[0],sa[1]);}catch(e){}};}
