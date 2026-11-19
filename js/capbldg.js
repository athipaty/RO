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

const CAP_BLD={fountain:{body:cbFount,live:cbFountLive,lights:cbFountLights},
  gemcut:{body:cbGemcut,live:cbGemcutLive,signAt:b=>{const G=cbGemGeo(b);return[{name:b.name,x:(G.bx0+44)/TILE,w:0,y:(G.byF+12)/TILE,h:0},40];},lights:cbGemcutLights},
  shop:{body:cbMarket,live:cbMarketLive,signAt:b=>{const G=cbMarketGeo(b);return[{name:b.name,x:G.xc/TILE,w:0,y:G.byF/TILE,h:0},G.H1+20];},lights:cbMarketLights}};
// take over the drawing of the capital's pieces that have a design of their own
{const _prev=drawBuilding;
  drawBuilding=function(b){const T=typeof zoneId!=='undefined'&&zoneId==='capital'&&CAP_BLD[b.kind||(b.npc&&b.npc.role)];if(!T)return _prev.apply(this,arguments);
    if(T.lights&&!b._cbl){b._nl=T.lights(b);b._cbl=1;}
    if(!bldCacheBlit(b,()=>T.body(b)))T.body(b);
    if(T.live)try{T.live(b);}catch(e){}
    if(b.name)try{const sa=T.signAt?T.signAt(b):[b,T.sign||54];drawSign(sa[0],sa[1]);}catch(e){}};}
