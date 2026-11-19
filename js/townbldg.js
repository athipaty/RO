"use strict";
/* ================= Hearthvale's buildings, each built for its trade (v1.28.0) =================
   Every building in Hearthvale gets a shape of its own, plus the things you would find at that trade, so you can
   tell what it is from across the plaza without reading its sign:
     shop   General Store: a two-storey market house, an open shop front with shelves, the upper floor overhanging
            the street with a bay window, a striped awning over a counter of produce crates, a hanging balance scale,
            a coin-purse sign on an iron bracket, a hand cart of pumpkins with barrels and sacks
     smith  Smithy: an open forge shed under a high slate roof, stone back walls hung with tongs and hammers, a stone
            hearth with a live fire, bellows and coal, the chimney through the roof (smoke), an anvil on a stump
            (sparks with every strike), a quench barrel (steam), a rack of swords, an axe and shields, a horseshoe sign
     job    Guild Hall: an adventurers' longhall, low plank walls under a steep mossy shingle roof with crossed dragon
            heads at both ends, a porch with the guild crest (a shield on crossed swords), blue star banners, a quest
            board of notices and a WANTED poster, two braziers burning by the door, smoke from the roof's smoke hole
     heal   Chapel: a white stone chapel, its gable to the street with a stained-glass sun, a bell tower with a swinging
            bell under a slate spire crowned by a golden sun, stained-glass windows between buttresses, a glowing
            healing basin sending up motes of light, a fenced herb garden of lavender, doves on the ridge and one circling
   The body is drawn once into a cached picture (js/archi.js bldCacheBlit); anything that moves is drawn live on top.
   Buildings not listed here keep the shared styles from js/archi.js. All drawn in code, original art. */
const TB_P=(x,y,h=0)=>{const p=proj(x,y);return{x:p.x,y:p.y-h};};
const TB_OL='#3a2716';
function tbSeg(a,b,col,w){ctx.strokeStyle=col;ctx.lineWidth=w||1;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();}
// a solid box: the front (+y) face, the right (+x) face and, if given, the top
function tbBox(x0,y0,x1,y1,h0,h1,front,right,top,line){const P=TB_P,l=line||TB_OL;
  poly([P(x1,y1,h0),P(x1,y0,h0),P(x1,y0,h1),P(x1,y1,h1)],right,l);
  poly([P(x0,y1,h0),P(x1,y1,h0),P(x1,y1,h1),P(x0,y1,h1)],front,l);
  if(top)poly([P(x0,y0,h1),P(x1,y0,h1),P(x1,y1,h1),P(x0,y1,h1)],top,l);}
// points on a box's front face (u along x from x0) and right face (u along -y from y1)
const tbF=(x0,y1)=>(u,h)=>TB_P(x0+u,y1,h),tbR=(x1,y1)=>(u,h)=>TB_P(x1,y1-u,h);
function tbQuad(S,u0,h0,u1,h1,fill,line){poly([S(u0,h0),S(u1,h0),S(u1,h1),S(u0,h1)],fill,line===undefined?TB_OL:line);}
// a gable roof whose ridge runs along x; the gable end shows on the right face
function tbGableX(x0,y0,x1,y1,h,rh,col,wallR){const P=TB_P,e=10,yc=(y0+y1)/2,eT=P(x0-e,y0-e,h),eR=P(x1+e,y0-e,h),eB=P(x1+e,y1+e,h),eL=P(x0-e,y1+e,h),rL=P(x0-e,yc,h+rh),rR=P(x1+e,yc,h+rh);
  poly([eT,eR,rR,rL],shade(col,-40));poly([P(x1,y1,h),P(x1,y0,h),P(x1,yc,h+rh)],wallR,TB_OL);
  poly([eL,eB,rR,rL],col,shade(col,-60));
  // rows of tiles
  ctx.globalAlpha=.3;for(let i=1;i<7;i++){const t=i/7;tbSeg(P(x0-e,y1+e-(y1+e-yc)*t,h+rh*t),P(x1+e,y1+e-(y1+e-yc)*t,h+rh*t),shade(col,-70),1);}
  for(let x=x0;x<=x1+e;x+=14)tbSeg(P(x,y1+e,h),P(x,yc,h+rh),shade(col,-55),.7);ctx.globalAlpha=1;
  // the bargeboard along the gable
  tbSeg(eB,rR,shade(col,-70),2.5);tbSeg(eR,rR,shade(col,-70),2.5);}
function tbDisc(x,y,rx,ry,fill,line){ctx.fillStyle=fill;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,7);ctx.fill();if(line){ctx.strokeStyle=line;ctx.lineWidth=1;ctx.stroke();}}

/* ---------------- the General Store ---------------- */
function tbStore(b){const X0=b.x*TILE,Y0=b.y*TILE,X1=(b.x+b.w)*TILE,Y1=(b.y+b.h)*TILE,P=TB_P,c=ctx;
  const bx0=X0+6,bx1=X1-50,by0=Y0+4,byF=Y1-50,H1=44,H2=88,J=12; // J: how far the upper floor overhangs the street
  const plaster='#efe2c4',plasterR='#cdbd9a',beam='#5e3e22',roof=b.roof||'#8e3b2e';
  poly([P(bx0,Y1),P(X1+24,Y1),P(X1+24,Y0+24),P(bx1,Y0)],'rgba(0,0,0,.2)');
  // ground floor: plaster, the side door on the right face
  tbBox(bx0,by0,bx1,byF,0,H1,plaster,plasterR);
  const GF=tbF(bx0,byF),GR=tbR(bx1,byF),W=bx1-bx0,D=byF-by0;
  tbQuad(GR,D*.5-11,0,D*.5+11,32,'#6a4426');tbSeg(GR(D*.5,0),GR(D*.5,32),'#3a2410',1.2);
  // the open shop front: dark inside, two shelves of jars and bottles, a lintel beam
  tbQuad(GF,14,4,W-14,38,'#3e2a1a');
  const jar=['#c84a3a','#e8c040','#5aa04a','#4a7ac8','#d88a3a','#a85ac8'];
  for(const [h,n] of [[14,9],[27,9]]){tbSeg(GF(16,h),GF(W-16,h),'#8a6a42',2);for(let i=0;i<n;i++){const p=GF(22+(W-44)*i/(n-1),h);c.fillStyle=jar[(i+h)%6];c.fillRect(p.x-2.5,p.y-7,5,7);c.fillStyle='rgba(255,255,255,.4)';c.fillRect(p.x-1.5,p.y-6,1.2,4);}}
  tbQuad(GF,10,38,W-10,44,beam);
  for(const u of [10,W-10])tbSeg(GF(u,0),GF(u,40),beam,3);
  // upper floor, pushed out over the street, half-timbered
  tbBox(bx0-4,by0,bx1+4,byF+J,H1,H2,plaster,plasterR);
  const UF=tbF(bx0-4,byF+J),UR=tbR(bx1+4,byF+J),UW=W+8,UD=D+J;
  for(const [S,L] of [[UF,UW],[UR,UD]]){for(const t of [0,.25,.5,.75,1])tbSeg(S(L*t,H1),S(L*t,H2),beam,2.6);tbSeg(S(0,H1+2),S(L,H1+2),beam,3);tbSeg(S(0,H2-2),S(L,H2-2),beam,2.6);
    for(const t of [0,.5])tbSeg(S(L*t,H1+2),S(L*(t+.25),H2-2),beam,1.6);for(const t of [.5,1])tbSeg(S(L*t,H1+2),S(L*(t-.25),H2-2),beam,1.6);}
  // joist ends under the overhang
  for(let u=6;u<UW;u+=14){const p=UF(u,H1);c.fillStyle=beam;c.fillRect(p.x-2,p.y-1,4,4);}
  // a bay window in the middle of the upper floor, small panes
  {const u0=UW*.5-22,u1=UW*.5+22,d=8;tbBox(bx0-4+u0,byF+J,bx0-4+u1,byF+J+d,H1+8,H2-6,'#d8c8a4','#b8a684','#c9b38e');
    const BF=tbF(bx0-4+u0,byF+J+d);tbQuad(BF,4,H1+12,40,H2-10,'#9cc8e4');for(const u of [16,28])tbSeg(BF(u,H1+12),BF(u,H2-10),'#f4ead6',1.2);tbSeg(BF(4,H1+24),BF(40,H1+24),'#f4ead6',1.2);}
  // a window on the right face upstairs with flower box
  tbQuad(UR,UD*.5-12,H1+12,UD*.5+12,H2-12,'#8cb8d8');tbSeg(UR(UD*.5,H1+12),UR(UD*.5,H2-12),'#f4ead6',1.2);
  tbQuad(UR,UD*.5-14,H1+8,UD*.5+14,H1+12,'#7a4a2a');for(let i=0;i<5;i++){const p=UR(UD*.5-11+i*5.5,H1+13);tbDisc(p.x,p.y,2.4,2,i%2?'#f07ca0':'#f2e46b');}
  // the roof and a brick chimney
  tbGableX(bx0-4,by0,bx1+4,byF+J,H2,54,roof,plasterR);
  {const cx=bx0+26,cy=by0+14;tbBox(cx,cy,cx+14,cy+14,H2+24,H2+66,'#a85a3e','#8a4632','#6a3a2a');}
  // the hanging sign: an iron bracket off the front corner, a round board with a coin purse
  {const a=UF(2,H2-14),z=P(bx0-4,byF+J+30,H2-14);tbSeg(a,z,'#2a2420',2.4);tbSeg(UF(2,H2-30),P(bx0-4,byF+J+18,H2-14),'#2a2420',1.4);
    const s=P(bx0-4,byF+J+26,H2-30);tbSeg({x:s.x,y:s.y-16},{x:s.x,y:s.y-7},'#2a2420',1);
    tbDisc(s.x,s.y+4,12,12,'#6a4426',TB_OL);tbDisc(s.x,s.y+4,9.5,9.5,'#2e4a2e');
    c.fillStyle='#c8a050';c.beginPath();c.ellipse(s.x,s.y+7,6,5,0,0,7);c.fill();c.fillStyle='#8a6a2a';c.fillRect(s.x-3,s.y,6,2);
    c.fillStyle='#ffd24a';c.beginPath();c.arc(s.x+5,s.y+9,3,0,7);c.fill();c.strokeStyle='#8a6a2a';c.lineWidth=.8;c.stroke();}
  // the market stall: a striped awning on posts over a long counter of produce
  const sy1=Y1-6,ay=byF+22,ax0=bx0+4,ax1=bx1-4,n=9; // ay: where the awning ends, the counter stands in front of it
  for(const x of [ax0+4,ax1-4]){tbBox(x-2,ay-2,x+2,ay+2,0,30,'#7a5230','#5e3e22');}
  // the awning: red and cream stripes from the wall down to the posts, a scalloped edge
  for(let i=0;i<n;i++){const xa=ax0+(ax1-ax0)*i/n,xb=ax0+(ax1-ax0)*(i+1)/n,col=i%2?'#f4ead6':roof;
    poly([P(xa,byF,H1-2),P(xb,byF,H1-2),P(xb,ay,30),P(xa,ay,30)],col,'rgba(60,30,20,.5)');
    const m=P((xa+xb)/2,ay,30);c.fillStyle=col;c.beginPath();c.arc(m.x,m.y,(xb-xa)*.38,0,Math.PI);c.fill();}
  // a balance scale hanging from the awning's front edge
  {const h=P(ax0+(ax1-ax0)*.72,ay,30);tbSeg(h,{x:h.x,y:h.y+8},'#5a4632',1);c.strokeStyle='#8a6a2a';c.lineWidth=1.6;c.beginPath();c.moveTo(h.x-11,h.y+8);c.lineTo(h.x+11,h.y+8);c.stroke();
    for(const s of [-1,1]){tbSeg({x:h.x+s*11,y:h.y+8},{x:h.x+s*8,y:h.y+17},'#8a6a2a',.8);tbSeg({x:h.x+s*11,y:h.y+8},{x:h.x+s*14,y:h.y+17},'#8a6a2a',.8);
      c.fillStyle='#c8a050';c.beginPath();c.ellipse(h.x+s*11,h.y+17,4.5,1.8,0,0,Math.PI);c.fill();}}
  // the counter
  tbBox(ax0+14,sy1-26,ax1-14,sy1-8,0,20,'#9a6a3a','#7a5230','#b8844a');
  // produce crates along the counter top
  const goods=[['#d83a2a','#f05a3a'],['#5aa040','#7ac85a'],['#e8892a','#f0a84a'],['#d8b070','#e8c890'],['#7a3a8a','#9a5aa8'],['#e8c040','#f4d860']];
  const cw=(ax1-ax0-36)/6;
  for(let i=0;i<6;i++){const x=ax0+18+i*cw;tbBox(x,sy1-24,x+cw-4,sy1-10,20,27,'#c8a060','#a07a42','#5a3a20');
    const m=P(x+cw/2-2,sy1-17,27);for(let k=0;k<6;k++){const dx=(k%3-1)*5.2,dy=(k<3?-2:2);tbDisc(m.x+dx,m.y+dy-2,goods[i][k%2?1:0]===undefined?3:3.2,2.6,goods[i][k%2]);}
    if(i===3){c.fillStyle='#b88848';for(const dx of [-5,5]){c.beginPath();c.ellipse(m.x+dx,m.y-3,4.5,2.6,.3,0,7);c.fill();}}}
  // the side yard: a hand cart of pumpkins, barrels and sacks
  {const x=bx1+8,y=by0+16;tbBox(x,y,x+30,y+40,10,22,'#9a6a3a','#7a5230','#5a3a20');
    const wl=P(x+30,y+30,9);tbDisc(wl.x,wl.y,4,9,'#6a4426',TB_OL);tbDisc(wl.x,wl.y,1.5,3,'#3a2716');
    tbSeg(P(x,y+40,18),P(x-4,y+64,14),'#7a5230',2.4);tbSeg(P(x+30,y+40,18),P(x+26,y+64,14),'#7a5230',2.4);
    for(const [dx,dy] of [[8,10],[20,12],[12,26],[22,28],[15,18]]){const p=P(x+dx,y+dy,24);tbDisc(p.x,p.y-3,5.5,4.2,'#e07a2a','#a04a1a');tbSeg({x:p.x,y:p.y-7},{x:p.x+1,y:p.y-10},'#4a6a2a',1.5);}}
  barrel(bx1+16,Y1-14,'#8a5a32');barrel(bx1+34,Y1-24,'#7a4a2a');sack(bx1+38,Y1-4);sack(bx1+26,Y1+2);}


/* ---------------- the Smithy ---------------- */
// an open forge shed: the inside shows under a high slate roof; the anvil, barrel and weapon rack stand in the yard in front
const tbSmithGeo=b=>{const X0=b.x*TILE,Y0=b.y*TILE,X1=(b.x+b.w)*TILE,Y1=(b.y+b.h)*TILE;
  return{X0,Y0,X1,Y1,Yr:Y0+78,HB:108,HF:88,hx0:X0+14,hx1:X0+74,hy0:Y0+12,hy1:Y0+58,HH:30,anv:{x:X0+96,y:Y0+104},bar:{x:X0+44,y:Y1-20}};};
function tbSmith(b){const G=tbSmithGeo(b),{X0,Y0,X1,Y1,Yr,HB,HF,hx0,hx1,hy0,hy1,HH}=G,P=TB_P,c=ctx,stone='#9a948a',stoneR='#7e786e',slate='#4e5260';
  const roofH=y=>HB-(HB-HF)*(y-(Y0-8))/(Yr-(Y0-8));
  poly([P(X0,Y1),P(X1+24,Y1),P(X1+24,Y0+24),P(X1,Y0)],'rgba(0,0,0,.18)');
  // a floor of flagstones under the shed, packed earth in the yard
  poly([P(X0,Y0),P(X1,Y0),P(X1,Y1),P(X0,Y1)],'#8a7a62');
  poly([P(X0,Y0),P(X1,Y0),P(X1,Yr),P(X0,Yr)],'#6e6a64');ctx.globalAlpha=.35;for(let x=X0+16;x<X1;x+=22)tbSeg(P(x,Y0),P(x,Yr),'#4a4640',1);for(let y=Y0+18;y<Yr;y+=18)tbSeg(P(X0,y),P(X1,y),'#4a4640',1);ctx.globalAlpha=1;
  // stone walls at the back and on the left, up to the roof
  const course=(S,L,h0,h1,col)=>{ctx.globalAlpha=.5;for(let h=h0+10;h<h1;h+=10)tbSeg(S(0,h),S(L,h),col,1);ctx.globalAlpha=1;};
  tbBox(X0,Y0,X1,Y0+10,0,HB,stone,stoneR);course(tbF(X0,Y0+10),X1-X0,0,HB,'#5e5850');
  tbBox(X0,Y0+10,X0+10,Yr,0,HF+6,stone,stoneR);course(tbR(X0+10,Yr),Yr-Y0-10,0,HF+6,'#5e5850');
  // tools hanging on the back wall: tongs, two hammers, a rasp
  {const S=tbF(X0,Y0+10);for(const [u,k] of [[96,'t'],[112,'h'],[124,'h'],[140,'t'],[156,'r']]){const a=S(u,74),z=S(u,48);c.fillStyle='#3a3632';c.beginPath();c.arc(a.x,a.y,1.6,0,7);c.fill();
      if(k==='t'){tbSeg(a,z,'#2a2826',2);tbSeg(a,{x:z.x+4,y:z.y},'#2a2826',2);}
      else if(k==='h'){tbSeg(a,{x:z.x,y:z.y+6},'#7a5230',2.4);c.fillStyle='#4a4846';c.fillRect(z.x-5,z.y+4,10,6);}
      else{c.fillStyle='#5a5856';c.fillRect(z.x-2,a.y,4,z.y-a.y);}}}
  // the hearth: a stone block with a fire pit, bellows beside it, a heap of coal
  tbBox(hx0,hy0,hx1,hy1,0,HH,'#a8a096','#888076','#6a645c');
  poly([P(hx0+8,hy0+8,HH),P(hx1-8,hy0+8,HH),P(hx1-8,hy1-8,HH),P(hx0+8,hy1-8,HH)],'#2a1a14');
  {const S=tbF(hx0,hy1);tbQuad(S,18,6,42,20,'#1a120e');}
  // the hood and the chimney stack, through the roof
  tbBox(hx0+6,hy0,hx1-6,hy0+20,HH+30,roofH(hy0+20)-2,'#8a847a','#6e685e');
  poly([P(hx0+2,hy0+30,HH+22),P(hx1-2,hy0+30,HH+22),P(hx1-6,hy0+20,HH+30),P(hx0+6,hy0+20,HH+30)],'#7e786e',TB_OL);
  {const bx=hx1+4,by=hy0+18;poly([P(bx,by,22),P(bx+22,by+4,16),P(bx+22,by+24,14),P(bx,by+20,22)],'#7a4a2a',TB_OL);tbSeg(P(bx+22,by+14,15),P(bx+34,by+14,12),'#5a3a1c',2.4);
    const n=P(bx-2,by+10,24);tbSeg(n,P(hx1-2,by+8,HH-6),'#3a3632',2);}
  for(let i=0;i<9;i++){const p=P(hx0+6+(i%3)*7,hy1+8+Math.floor(i/3)*5,0);tbDisc(p.x,p.y-3-(i%2)*2,4,3,'#1e1c1c');}
  // the slate roof, high enough to see the forge under it
  const e=8;poly([P(X0-e,Yr+e,HF),P(X1+e,Yr+e,HF),P(X1+e,Y0-8,HB),P(X0-e,Y0-8,HB)],slate,'#2a2c34');
  ctx.globalAlpha=.4;for(let x=X0;x<X1+e;x+=10)tbSeg(P(x,Yr+e,HF),P(x,Y0-8,HB),'#2a2c34',1);for(let k=1;k<6;k++){const y=Yr+e-(Yr+e-Y0+8)*k/6;tbSeg(P(X0-e,y,HF+(HB-HF)*k/6),P(X1+e,y,HF+(HB-HF)*k/6),'#2a2c34',1);}ctx.globalAlpha=1;
  poly([P(X0-e,Yr+e,HF),P(X1+e,Yr+e,HF),P(X1+e,Yr+e,HF-6),P(X0-e,Yr+e,HF-6)],'#3a3e4a',TB_OL);
  poly([P(X1+e,Yr+e,HF),P(X1+e,Y0-8,HB),P(X1+e,Y0-8,HB-6),P(X1+e,Yr+e,HF-6)],'#30343e',TB_OL);
  {const cy0=hy0+2,cy1=hy0+20,cx0=hx0+16,cx1=hx1-16;tbBox(cx0,cy0,cx1,cy1,roofH(cy1)-4,HB+46,'#8a847a','#6e685e','#4a4642');tbQuad(tbF(cx0,cy1),-2,HB+40,cx1-cx0+2,HB+46,'#6e685e');}
  // timber posts holding the roof's front edge
  for(const x of [X0+4,(X0+X1)/2,X1-6])tbBox(x-3,Yr-3,x+3,Yr+3,0,HF-6,'#6a4a2a','#4e3620');
  tbBox(X1-9,Y0+30,X1-3,Y0+36,0,HB-14,'#6a4a2a','#4e3620');
  // the quench barrel of water
  barrel(G.bar.x,G.bar.y,'#6a4a2a');{const p=P(G.bar.x,G.bar.y,15);tbDisc(p.x,p.y,6,3,'#3a6a8a');}
  // the anvil on its stump
  {const p=P(G.anv.x,G.anv.y);c.fillStyle='#6a4426';c.strokeStyle=TB_OL;c.lineWidth=1.2;c.beginPath();c.ellipse(p.x,p.y,11,5.5,0,0,Math.PI);c.lineTo(p.x-11,p.y-14);c.ellipse(p.x,p.y-14,11,5.5,0,Math.PI,0,true);c.closePath();c.fill();c.stroke();
    tbDisc(p.x,p.y-14,11,5.5,'#9a6a3a',TB_OL);tbDisc(p.x,p.y-14,6,3,'#7a5230');
    const t=p.y-30;c.fillStyle='#3e3c3e';c.beginPath();c.moveTo(p.x-6,p.y-16);c.lineTo(p.x+6,p.y-16);c.lineTo(p.x+4,t+6);c.lineTo(p.x-4,t+6);c.closePath();c.fill();
    c.fillStyle='#55535a';c.beginPath();c.moveTo(p.x-12,t+6);c.lineTo(p.x+11,t+6);c.lineTo(p.x+13,t);c.lineTo(p.x-12,t);c.closePath();c.fill();c.stroke();
    c.beginPath();c.moveTo(p.x-12,t);c.lineTo(p.x-24,t+2);c.lineTo(p.x-12,t+5);c.closePath();c.fill();c.stroke();
    c.fillStyle='#7a787e';c.fillRect(p.x-11,t-1,23,2);
    tbSeg({x:p.x+10,y:p.y-2},{x:p.x+16,y:p.y-18},'#7a5230',2);c.fillStyle='#3e3c3e';c.fillRect(p.x+12,p.y-22,8,5);}
  // the weapon rack: three swords standing, an axe, two round shields leaning
  {const x0=X1-40,x1=X1-12,y=Y1-26;for(const x of [x0,x1])tbBox(x-2,y-2,x+2,y+2,0,30,'#7a5230','#5a3a1c');tbSeg(P(x0,y,26),P(x1,y,26),'#7a5230',2.6);tbSeg(P(x0,y,8),P(x1,y,8),'#7a5230',2.6);
    for(const u of [.2,.45,.7]){const bt=P(x0+(x1-x0)*u,y,2),tp=P(x0+(x1-x0)*u,y,40);tbSeg(bt,tp,'#c8ccd4',2.4);tbSeg(tp,{x:tp.x,y:tp.y-3},'#e8ecf4',1.2);
      const g=P(x0+(x1-x0)*u,y,14);tbSeg({x:g.x-5,y:g.y},{x:g.x+5,y:g.y},'#8a6a2a',2.2);tbSeg(g,P(x0+(x1-x0)*u,y,4),'#5a3a1c',2.4);}
    {const a=P(x0+(x1-x0)*.92,y,4),z=P(x0+(x1-x0)*.92,y,34);tbSeg(a,z,'#7a5230',2);c.fillStyle='#9aa0a8';c.beginPath();c.moveTo(z.x,z.y+2);c.quadraticCurveTo(z.x+11,z.y+4,z.x+9,z.y+13);c.lineTo(z.x,z.y+9);c.closePath();c.fill();c.strokeStyle=TB_OL;c.stroke();}
    for(const [dx,col] of [[-14,'#a83a2a'],[34,'#3a5a9a']]){const p=P(x0+dx,y+10,14);tbDisc(p.x,p.y,10,12,col,TB_OL);tbDisc(p.x,p.y,7,8.5,shade(col,20));tbDisc(p.x,p.y,2.6,2.6,'#d8c070',TB_OL);}}
  // the trade sign: a horseshoe on a board hanging from the roof edge
  {const h=P(X0+30,Yr+e,HF-6);tbSeg(h,{x:h.x,y:h.y+8},'#2a2420',1.2);const s={x:h.x,y:h.y+20};c.fillStyle='#6a4426';c.strokeStyle=TB_OL;c.lineWidth=1.2;c.beginPath();c.roundRect(s.x-12,s.y-12,24,22,3);c.fill();c.stroke();
    c.strokeStyle='#c8ccd4';c.lineWidth=3.2;c.beginPath();c.arc(s.x,s.y-1,6.5,Math.PI*.85,Math.PI*2.15,false);c.stroke();c.fillStyle='#2a2826';for(const a of [1.1,1.5,1.9]){c.beginPath();c.arc(s.x+Math.cos(a*Math.PI)*6.5,s.y-1+Math.sin(a*Math.PI)*6.5,.9,0,7);c.fill();}}
}
// what moves: the fire in the hearth, sparks off the anvil, smoke from the chimney, steam over the barrel
function tbSmithLive(b){const G=tbSmithGeo(b),P=TB_P,c=ctx,t=now;c.save();
  const f=P((G.hx0+G.hx1)/2,(G.hy0+G.hy1)/2,G.HH),fl=.75+Math.sin(t*9)*.12+Math.sin(t*23)*.08;
  c.globalCompositeOperation='lighter';{const g=c.createRadialGradient(f.x,f.y,2,f.x,f.y,70);g.addColorStop(0,`rgba(255,150,50,${.55*fl})`);g.addColorStop(1,'rgba(255,90,20,0)');c.fillStyle=g;c.beginPath();c.ellipse(f.x,f.y+14,80,46,0,0,7);c.fill();}
  c.globalCompositeOperation='source-over';
  tbDisc(f.x,f.y,15,6,`rgba(255,${120+Math.round(60*fl)},40,.95)`);
  for(let k=0;k<5;k++){const ph=(t*2.2+k*.37)%1,x=f.x-10+k*5+Math.sin(t*7+k)*2,hgt=10+12*(1-ph)*fl;c.fillStyle=k%2?'rgba(255,210,90,.9)':'rgba(255,120,40,.9)';c.beginPath();c.moveTo(x-3.5,f.y);c.quadraticCurveTo(x,f.y-hgt*1.4,x+3.5,f.y);c.closePath();c.fill();}
  // a hot bar on the anvil, and sparks every strike
  const a=P(G.anv.x,G.anv.y,31);c.fillStyle=`rgb(255,${150+Math.round(50*Math.sin(t*3))},60)`;c.fillRect(a.x-6,a.y-2,12,3);
  const strike=(t%1.4)/1.4;if(strike<.45){for(let k=0;k<9;k++){const ang=-Math.PI*(.15+.7*((k*.37)%1)),sp=30+((k*53)%40),d=strike*sp*2.2;
    c.fillStyle=k%3?'#ffd060':'#fff2b0';c.globalAlpha=1-strike/.45;c.fillRect(a.x+Math.cos(ang)*d,a.y+Math.sin(ang)*d+d*d*.012,2,2);}c.globalAlpha=1;}
  // chimney smoke
  const ch=P(G.hx0+30,G.hy0+11,G.HB+46);for(let k=0;k<5;k++){const ph=(t*.25+k/5)%1;tbDisc(ch.x+ph*26+Math.sin(t+k)*4,ch.y-ph*70,6+ph*14,5+ph*11,`rgba(110,105,100,${.45*(1-ph)})`);}
  // steam off the barrel now and then
  const bb=P(G.bar.x,G.bar.y,16),sp=(t*.5)%1;if(sp<.6)for(let k=0;k<3;k++){const ph=Math.min(1,sp/.6+k*.15);tbDisc(bb.x+Math.sin(t*2+k)*4,bb.y-ph*30,4+ph*6,3+ph*4,`rgba(235,240,245,${.4*(1-ph)})`);}
  c.restore();}

// where light shines out at night (js/nightlights.js), in world-view coordinates
const tbLit=(pts)=>pts.map(([x,y,h,door])=>{const p=proj(x,y);return{x:p.x,y:p.y-h,door:door?1:0};});
const tbStoreLights=b=>{const X0=b.x*TILE,X1=(b.x+b.w)*TILE,Y0=b.y*TILE,Y1=(b.y+b.h)*TILE;return tbLit([[X0+60,Y1-50,20],[X0+150,Y1-50,20],[(X0+X1)/2-24,Y1-30,66],[X1-46,Y0+40,66]]);};
const tbSmithLights=b=>{const G=tbSmithGeo(b);return tbLit([[(G.hx0+G.hx1)/2,G.hy1,34],[(G.hx0+G.hx1)/2,G.hy1+20,10,1],[G.anv.x,G.anv.y,30]]);};
/* ---------------- the Guild Hall ---------------- */
// an adventurers' longhall: low plank walls under a steep shingle roof with crossed dragon heads, a porch with the guild
// shield, banners, a quest board out front and two braziers by the door
const tbGuildGeo=b=>{const X0=b.x*TILE,Y0=b.y*TILE,X1=(b.x+b.w)*TILE,Y1=(b.y+b.h)*TILE,bx0=X0+8,bx1=X1-8,by0=Y0+8,byF=Y1-52,Xc=(bx0+bx1)/2;
  return{X0,Y0,X1,Y1,bx0,bx1,by0,byF,Xc,H:42,RH:86,pd:26,brz:[{x:Xc-44,y:Y1-12},{x:Xc+44,y:Y1-12}],vent:{x:bx0+70,y:(by0+byF)/2}};};
// a dragon head at the end of a carved beam: the beam rises from (a) towards (z) and curls into a head facing out
function tbDragon(a,z,dir,col){const c=ctx;c.save();c.translate(z.x,z.y);c.scale(1.5,1.5);c.translate(-z.x,-z.y);c.strokeStyle=col;c.lineWidth=3.6;c.lineCap='round';c.beginPath();c.moveTo(a.x,a.y);c.quadraticCurveTo((a.x+z.x)/2+dir*2,(a.y+z.y)/2-6,z.x,z.y);c.stroke();
  c.fillStyle=col;c.beginPath();c.ellipse(z.x+dir*3,z.y-3,6,4.5,dir*.3,0,7);c.fill();
  c.beginPath();c.moveTo(z.x+dir*6,z.y-6);c.lineTo(z.x+dir*16,z.y-2);c.lineTo(z.x+dir*6,z.y+1);c.closePath();c.fill();
  c.beginPath();c.moveTo(z.x-dir*1,z.y-6);c.lineTo(z.x-dir*5,z.y-14);c.lineTo(z.x+dir*3,z.y-7);c.closePath();c.fill();
  c.fillStyle='#ffcf4a';c.beginPath();c.arc(z.x+dir*5,z.y-4.5,1.4,0,7);c.fill();c.lineCap='butt';c.restore();}
function tbGuild(b){const G=tbGuildGeo(b),{X0,Y0,X1,Y1,bx0,bx1,by0,byF,Xc,H,RH,pd}=G,P=TB_P,c=ctx,wood='#7a5232',woodR='#5e3e24',shingle='#5e4630',ban=b.roof||'#2e4f8e',gold='#e8c25a';
  poly([P(bx0,Y1),P(X1+26,Y1),P(X1+26,Y0+26),P(bx1,Y0)],'rgba(0,0,0,.2)');
  // a plank boardwalk in front
  poly([P(bx0,byF),P(bx1,byF),P(bx1,Y1-2),P(bx0,Y1-2)],'#9a7a52',TB_OL);ctx.globalAlpha=.4;for(let y=byF+8;y<Y1;y+=8)tbSeg(P(bx0,y),P(bx1,y),'#5a3a1c',1);ctx.globalAlpha=1;
  // plank walls on a stone footing
  tbBox(bx0,by0,bx1,byF,0,H,wood,woodR);
  const F=tbF(bx0,byF),R=tbR(bx1,byF),W=bx1-bx0,D=byF-by0;
  for(const [S,L,col] of [[F,W,'#4a3018'],[R,D,'#3e2814']]){ctx.globalAlpha=.55;for(let u=7;u<L;u+=7)tbSeg(S(u,8),S(u,H),col,1);ctx.globalAlpha=1;tbQuad(S,0,0,L,8,'#857e72');tbSeg(S(0,H-3),S(L,H-3),'#3a2410',3);}
  // small shuttered windows
  for(const [S,u] of [[F,22],[F,W-44],[R,D/2-11]]){tbQuad(S,u,16,u+22,32,'#e8c878');tbSeg(S(u+11,16),S(u+11,32),'#3a2410',1.6);tbSeg(S(u,24),S(u+22,24),'#3a2410',1.6);
    tbQuad(S,u-7,15,u,33,'#3e5a8a');tbQuad(S,u+22,15,u+29,33,'#3e5a8a');}
  // the steep shingle roof, and a log pile against the gable end
  tbGableX(bx0,by0,bx1,byF,H,RH,shingle,woodR);
  {const yc=(by0+byF)/2;ctx.globalAlpha=.25;for(let k=0;k<40;k++){const t=(k*.618)%1,s=((k*.381)%1),p=P(bx0+(bx1-bx0)*t,byF+10-(byF+10-yc)*s,H+RH*s);tbDisc(p.x,p.y,5,2.5,'#6a8a3a');}ctx.globalAlpha=1;
    // a round window high in the gable
    const gw=P(bx1,yc,H+RH*.42);tbDisc(gw.x,gw.y,7,9,'#e8c878',TB_OL);tbSeg({x:gw.x,y:gw.y-9},{x:gw.x,y:gw.y+9},'#3a2410',1.2);
    // crossed dragon heads at both ends of the ridge
    const e=10,rR=P(bx1+e,yc,H+RH),rL=P(bx0-e,yc,H+RH);
    tbDragon(P(bx1+e,yc+22,H+RH-20),{x:rR.x-14,y:rR.y-24},-1,'#3e2814');tbDragon(P(bx1+e,yc-22,H+RH-20),{x:rR.x+16,y:rR.y-26},1,'#4e3420');
    tbDragon(P(bx0-e,yc+22,H+RH-20),{x:rL.x-14,y:rL.y-24},-1,'#3e2814');tbDragon(P(bx0-e,yc-22,H+RH-20),{x:rL.x+16,y:rL.y-26},1,'#4e3420');
    // the smoke hole on the ridge
    const v=G.vent;tbBox(v.x-8,yc-8,v.x+8,yc+8,H+RH-6,H+RH+10,'#5a4028','#4a3420','#2a1c10');}
  for(let i=0;i<7;i++){const p=P(bx1+14+(i%3)*8,byF-30+Math.floor(i/3)*9,0);tbDisc(p.x,p.y-4-Math.floor(i/3)*7,4.5,4.5,'#8a6040',TB_OL);tbDisc(p.x,p.y-4-Math.floor(i/3)*7,2,2,'#c8a070');}
  // banners on the wall either side of the porch
  for(const u of [W/2-58,W/2+42]){const top=F(u,H-2);c.fillStyle='#3a2410';c.fillRect(top.x-1,top.y-2,18,3);const t0=F(u+1,H-4),t1=F(u+15,H-4),b0=F(u+1,6),b1=F(u+15,6),bm=F(u+8,14);
    poly([t0,t1,b1,bm,b0],ban,TB_OL);const m=F(u+8,26);c.fillStyle=gold;c.beginPath();for(let k=0;k<10;k++){const a=k*Math.PI/5-Math.PI/2,r=k%2?2.6:6;c.lineTo(m.x+Math.cos(a)*r,m.y+Math.sin(a)*r);}c.closePath();c.fill();}
  // the porch: two carved posts, a little gable roof facing the street, the guild shield in its gable
  {const y1=byF+pd,pw=30,ph=40,rh=26;for(const x of [Xc-pw+3,Xc+pw-3])tbBox(x-3,y1-3,x+3,y1+3,0,ph,'#6a4426','#4e3220');
    // the door under it
    tbQuad(F,W/2-17,0,W/2+17,32,'#3a2414');tbSeg(F(W/2,0),F(W/2,32),'#24160a',2);for(const h of [8,24]){tbSeg(F(W/2-17,h),F(W/2+17,h),'#8a8a8a',2);}
    poly([P(Xc-pw-4,byF,ph),P(Xc-pw-4,y1+4,ph),P(Xc,y1+4,ph+rh),P(Xc,byF,ph+rh)],shade(shingle,-30),TB_OL);
    poly([P(Xc-pw,y1,ph),P(Xc+pw,y1,ph),P(Xc,y1,ph+rh-2)],'#8a6040',TB_OL);
    poly([P(Xc,byF,ph+rh),P(Xc,y1+4,ph+rh),P(Xc+pw+4,y1+4,ph),P(Xc+pw+4,byF,ph)],shingle,TB_OL);
    tbSeg(P(Xc-pw-4,y1+4,ph),P(Xc,y1+4,ph+rh),'#3e2814',3);tbSeg(P(Xc+pw+4,y1+4,ph),P(Xc,y1+4,ph+rh),'#3e2814',3);
    // the guild crest: a round shield, two crossed swords behind it
    const s=P(Xc,y1+2,ph+9);for(const d of [-1,1]){tbSeg({x:s.x-d*14,y:s.y+12},{x:s.x+d*14,y:s.y-12},'#d8dce4',2.6);tbSeg({x:s.x-d*11,y:s.y+6},{x:s.x-d*15,y:s.y+11},gold,2);}
    tbDisc(s.x,s.y,9,9,ban,TB_OL);tbDisc(s.x,s.y,6,6,shade(ban,25));tbDisc(s.x,s.y,2.4,2.4,gold,TB_OL);}
  // the quest board: two posts, a capped board pinned with notices and a WANTED poster
  {const x0=X0+12,x1=X0+70,y=Y1-16;for(const x of [x0,x1])tbBox(x-2,y-2,x+2,y+2,0,46,'#6a4426','#4e3220');
    tbBox(x0-2,y-3,x1+2,y,12,42,'#8a6040','#6a4426');poly([P(x0-6,y+4,42),P(x1+6,y+4,42),P(x1+6,y-6,48),P(x0-6,y-6,48)],shingle,TB_OL);
    const S=tbF(x0-2,y);const notes=[[4,30,12,10,'#f4ead6'],[18,32,10,8,'#f0e0a0'],[30,28,12,12,'#f4ead6'],[45,31,10,9,'#e8d8b8'],[6,16,10,10,'#e8d8b8'],[46,15,12,11,'#f4ead6']];
    for(const [u,h,w,hh,col] of notes){tbQuad(S,u,h,u+w,h+hh,col,'rgba(60,40,20,.5)');for(let k=2;k<hh-2;k+=3)tbSeg(S(u+2,h+k),S(u+w-2,h+k),'rgba(60,40,20,.5)',.7);const pin=S(u+w/2,h+hh-1);c.fillStyle='#c8382a';c.beginPath();c.arc(pin.x,pin.y,1.2,0,7);c.fill();}
    // the WANTED poster with a monster's face
    tbQuad(S,19,13,41,27,'#e8c890','rgba(60,40,20,.6)');tbQuad(S,19,24,41,27,'#a8382a',null);const f=S(30,18);tbDisc(f.x,f.y,4.5,3.8,'#5a3a2a');c.fillStyle='#e8c890';c.fillRect(f.x-2.5,f.y-1.5,1.6,1.6);c.fillRect(f.x+1,f.y-1.5,1.6,1.6);
    c.fillStyle='#5a3a2a';c.beginPath();c.moveTo(f.x-4,f.y-3);c.lineTo(f.x-6,f.y-7);c.lineTo(f.x-2,f.y-4);c.fill();c.beginPath();c.moveTo(f.x+4,f.y-3);c.lineTo(f.x+6,f.y-7);c.lineTo(f.x+2,f.y-4);c.fill();}
  // the brazier stands (their fire is drawn live)
  for(const z of G.brz){const p=P(z.x,z.y);for(const dx of [-6,0,6])tbSeg({x:p.x+dx,y:p.y+(dx?0:3)},{x:p.x+dx*.4,y:p.y-18},'#2a2622',2);
    c.fillStyle='#3a3632';c.beginPath();c.ellipse(p.x,p.y-20,10,4,0,0,Math.PI);c.lineTo(p.x-8,p.y-26);c.ellipse(p.x,p.y-26,10,4,0,Math.PI,0,true);c.closePath();c.fill();c.strokeStyle=TB_OL;c.lineWidth=1;c.stroke();tbDisc(p.x,p.y-26,9,3.6,'#2a1a10');}
}
function tbGuildLive(b){const G=tbGuildGeo(b),P=TB_P,c=ctx,t=now;c.save();
  for(const [i,z] of G.brz.entries()){const p=P(z.x,z.y,27),fl=.8+Math.sin(t*8+i*2)*.12+Math.sin(t*21+i)*.08;
    c.globalCompositeOperation='lighter';const g=c.createRadialGradient(p.x,p.y-6,1,p.x,p.y-6,40);g.addColorStop(0,`rgba(255,150,60,${.5*fl})`);g.addColorStop(1,'rgba(255,100,30,0)');c.fillStyle=g;c.beginPath();c.arc(p.x,p.y-6,40,0,7);c.fill();c.globalCompositeOperation='source-over';
    for(let k=0;k<4;k++){const x=p.x-7+k*4.6+Math.sin(t*6+k+i)*1.5,h=(12+((k*7)%5)*2)*fl;c.fillStyle=k%2?'rgba(255,214,100,.95)':'rgba(255,120,40,.95)';c.beginPath();c.moveTo(x-3.5,p.y);c.quadraticCurveTo(x+Math.sin(t*9+k)*2,p.y-h*1.5,x+3.5,p.y);c.closePath();c.fill();}
    for(let k=0;k<3;k++){const ph=(t*.9+k/3+i*.2)%1;c.fillStyle=`rgba(255,200,90,${1-ph})`;c.fillRect(p.x+Math.sin(k*3+t)*6,p.y-12-ph*30,1.6,1.6);}}
  const yc=(G.by0+G.byF)/2,v=P(G.vent.x,yc,G.H+G.RH+12);for(let k=0;k<4;k++){const ph=(t*.2+k/4)%1;tbDisc(v.x+ph*20+Math.sin(t+k)*3,v.y-ph*60,5+ph*12,4+ph*9,`rgba(120,115,110,${.35*(1-ph)})`);}
  c.restore();}
const tbGuildLights=b=>{const G=tbGuildGeo(b);return tbLit([[G.bx0+33,G.byF,24],[G.bx1-33,G.byF,24],[G.bx1,(G.by0+G.byF)/2,24],[G.Xc,G.byF,14,1],[G.brz[0].x,G.brz[0].y,34],[G.brz[1].x,G.brz[1].y,34]]);};
/* ---------------- the Chapel ---------------- */
// a white stone chapel: the nave's gable faces the street with a stained-glass sun, a bell tower with a swinging bell and
// a spire crowned by a golden sun, stained-glass windows down the side, a glowing healing basin, an herb garden, doves
const tbChapelGeo=b=>{const X0=b.x*TILE,Y0=b.y*TILE,X1=(b.x+b.w)*TILE,Y1=(b.y+b.h)*TILE,nx0=X0+70,nx1=X1-44,ny0=Y0+6,nyF=Y1-44;
  return{X0,Y0,X1,Y1,nx0,nx1,ny0,nyF,H:52,RH:62,tx0:X0+12,tx1:X0+58,ty0:Y1-96,ty1:Y1-50,TH:104,BH:30,SH:50,well:{x:X0+36,y:Y1-20}};};
function tbArchWin(S,uc,hw,h0,h1,fill){const pts=[S(uc-hw,h0),S(uc+hw,h0)];for(let i=0;i<=10;i++){const t=i/10,u=uc+hw-2*hw*t;pts.push(S(u,h1+Math.sqrt(Math.max(0,1-(2*t-1)**2))*hw));}poly(pts,fill,TB_OL);}
function tbChapel(b){const G=tbChapelGeo(b),{X0,Y0,X1,Y1,nx0,nx1,ny0,nyF,H,RH,tx0,tx1,ty0,ty1,TH,BH,SH}=G,P=TB_P,c=ctx,wall='#f2ede2',wallR='#d4cdbe',slate='#5a6478',gold='#e8c25a';
  poly([P(X0,Y1),P(X1+26,Y1),P(X1+26,Y0+26),P(X1,Y0)],'rgba(0,0,0,.18)');
  // a flagstone path from the door to the street
  const xc=(nx0+nx1)/2;poly([P(xc-16,nyF),P(xc+16,nyF),P(xc+16,Y1),P(xc-16,Y1)],'#c8c0b0',TB_OL);ctx.globalAlpha=.4;for(let y=nyF+9;y<Y1;y+=9)tbSeg(P(xc-16,y),P(xc+16,y),'#7a7468',1);ctx.globalAlpha=1;
  // the herb garden beside the nave: a low fence, rows of herbs and lavender
  {const gx0=nx1+6,gx1=X1-4,gy0=Y0+14,gy1=nyF+30;poly([P(gx0,gy0),P(gx1,gy0),P(gx1,gy1),P(gx0,gy1)],'#6a4a30');
    for(let r=0;r<4;r++)for(let k=0;k<5;k++){const p=P(gx0+6+(gx1-gx0-12)*(r+.5)/4,gy0+10+(gy1-gy0-20)*k/4);const lav=r%2;
      if(lav){for(let j=0;j<3;j++){tbSeg({x:p.x-3+j*3,y:p.y},{x:p.x-4+j*4,y:p.y-11},'#5a7a3a',1.2);tbDisc(p.x-4+j*4,p.y-12,1.6,3,'#9a7ad8');}}
      else{tbDisc(p.x,p.y-4,6,4.5,'#4e8a3a');tbDisc(p.x-2,p.y-6,3,2.2,'#6aa84a');}}
    for(const [ya,yb,xa,xb] of [[gy1,gy1,gx0,gx1],[gy0,gy1,gx1,gx1]])for(let k=0;k<=8;k++){const x=xa+(xb-xa)*k/8,y=ya+(yb-ya)*k/8;tbSeg(P(x,y),P(x,y,10),'#f4ead6',2);}
    tbSeg(P(gx0,gy1,8),P(gx1,gy1,8),'#f4ead6',1.6);tbSeg(P(gx1,gy1,8),P(gx1,gy0,8),'#f4ead6',1.6);}
  // the nave
  tbBox(nx0,ny0,nx1,nyF,0,H,wall,wallR);
  const F=tbF(nx0,nyF),R=tbR(nx1,nyF),W=nx1-nx0,D=nyF-ny0;
  tbQuad(F,0,0,W,7,'#c8c0b0');tbQuad(R,0,0,D,7,'#b0a898');
  // buttresses and tall stained-glass windows down the side
  const glassCols=['#c84a4a','#4a7ac8','#e8c040','#5aa84a','#a85ac8'];
  for(let k=0;k<3;k++){const u=D*(k+.5)/3;tbArchWin(R,u,7,10,34,'#3a5a8a');
    for(let j=0;j<4;j++){const p=R(u-3.5+(j%2)*7,16+Math.floor(j/2)*9);c.fillStyle=glassCols[(j+k)%5];c.globalAlpha=.85;c.fillRect(p.x-3,p.y-7,5,7);}c.globalAlpha=1;}
  for(const u of [4,D/3,2*D/3,D-4]){const p0=u;tbBox(nx1,nyF-p0-4,nx1+7,nyF-p0+4,0,H-14,'#e2dccf','#c4bcab');}
  // the roof, its gable to the street with a stained-glass sun
  {const e=8,rF=P(xc,nyF+e,H+RH),rB=P(xc,ny0-e,H+RH),eL=P(nx0-e,nyF+e,H),eT=P(nx0-e,ny0-e,H),eB=P(nx1+e,nyF+e,H),eR=P(nx1+e,ny0-e,H);
    poly([eL,eT,rB,rF],shade(slate,-25),TB_OL);poly([F(0,H),F(W,H),F(W/2,H+RH)],wall,TB_OL);
    const s=F(W/2,H+RH*.36),rr=13;for(let k=0;k<12;k++){const a0=k/12*6.283,a1=(k+1)/12*6.283;c.fillStyle=glassCols[k%5];c.beginPath();c.moveTo(s.x,s.y);c.lineTo(s.x+Math.cos(a0)*rr,s.y+Math.sin(a0)*rr*1.1);c.lineTo(s.x+Math.cos(a1)*rr,s.y+Math.sin(a1)*rr*1.1);c.closePath();c.fill();}
    c.strokeStyle='#8a8070';c.lineWidth=2;c.beginPath();c.ellipse(s.x,s.y,rr,rr*1.1,0,0,7);c.stroke();tbDisc(s.x,s.y,4.5,5,gold,'#8a6a2a');
    poly([eB,eR,rB,rF],slate,shade(slate,-40));ctx.globalAlpha=.35;for(let k=1;k<7;k++){const t=k/7;tbSeg(P(xc+(nx1+e-xc)*t,nyF+e,H+RH*(1-t)),P(xc+(nx1+e-xc)*t,ny0-e,H+RH*(1-t)),shade(slate,-50),1);}ctx.globalAlpha=1;
    tbSeg(eL,rF,'#e8e2d4',3);tbSeg(eB,rF,'#e8e2d4',3);
    // a small gold sun on the gable top and doves along the ridge
    const g=P(xc,nyF+e,H+RH+4);tbDisc(g.x,g.y-6,4,4,gold,'#8a6a2a');
    for(const t of [.25,.5,.72]){const p=P(xc,nyF+e-(nyF-ny0+2*e)*t,H+RH);tbDisc(p.x,p.y-4,5,3.5,'#fbfbf6','#a8a8a0');tbDisc(p.x+4,p.y-7,2.6,2.4,'#fbfbf6');c.fillStyle='#e8a040';c.fillRect(p.x+6,p.y-7.5,2.4,1.2);}}
  // the door: arched, double, studded, with a stone step
  tbBox(nx0+W/2-20,nyF,nx0+W/2+20,nyF+6,0,4,'#c8c0b0','#b0a898','#d8d0c0');
  tbArchWin(F,W/2,13,0,22,'#6a4426');tbSeg(F(W/2,0),F(W/2,34),'#3a2410',1.6);for(const h of [8,18])for(const u of [-8,-4,4,8]){const p=F(W/2+u,h);c.fillStyle='#d8b060';c.fillRect(p.x-.8,p.y-.8,1.6,1.6);}
  // the bell tower: a stone shaft, an open belfry (the bell is drawn live), a slate spire with a golden sun
  tbBox(tx0,ty0,tx1,ty1,0,TH,wall,wallR);
  {const TF=tbF(tx0,ty1),TR=tbR(tx1,ty1),tw=tx1-tx0,td=ty1-ty0;for(const [S,L] of [[TF,tw],[TR,td]]){tbArchWin(S,L/2,5,30,48,'#3a5a8a');tbQuad(S,0,TH-4,L,TH,'#c8c0b0');}
    tbArchWin(TF,tw/2,8,0,18,'#6a4426');
    // the belfry: the back of the opening dark, then four corner piers
    poly([P(tx0,ty0,TH),P(tx1,ty0,TH),P(tx1,ty1,TH),P(tx0,ty1,TH)],'#2e2a26');
    tbBox(tx0,ty0,tx1,ty0+4,TH,TH+BH,'#3a3430','#3a3430');
    for(const [x,y] of [[tx0,ty0],[tx1-6,ty0],[tx0,ty1-6],[tx1-6,ty1-6]])tbBox(x,y,x+6,y+6,TH,TH+BH,wall,wallR);
    tbBox(tx0-3,ty0-3,tx1+3,ty1+3,TH+BH,TH+BH+6,'#d8d0c0','#c0b8a8','#c8c0b0');
    const apex=P((tx0+tx1)/2,(ty0+ty1)/2,TH+BH+6+SH);
    poly([P(tx0-3,ty1+3,TH+BH+6),P(tx1+3,ty1+3,TH+BH+6),apex],slate,TB_OL);poly([P(tx1+3,ty1+3,TH+BH+6),P(tx1+3,ty0-3,TH+BH+6),apex],shade(slate,-30),TB_OL);
    c.fillStyle=gold;c.strokeStyle='#8a6a2a';c.lineWidth=1;c.beginPath();for(let k=0;k<16;k++){const a=k*Math.PI/8,r=k%2?4:8;c.lineTo(apex.x+Math.cos(a)*r,apex.y-10+Math.sin(a)*r);}c.closePath();c.fill();c.stroke();tbSeg(apex,{x:apex.x,y:apex.y-4},'#8a6a2a',1.6);}
  // the healing basin: a round stone bowl (its glowing water is drawn live)
  {const p=P(G.well.x,G.well.y);c.fillStyle='#c8c0b0';c.strokeStyle=TB_OL;c.lineWidth=1.2;c.beginPath();c.ellipse(p.x,p.y,18,9,0,0,Math.PI);c.lineTo(p.x-18,p.y-12);c.ellipse(p.x,p.y-12,18,9,0,Math.PI,0,true);c.closePath();c.fill();c.stroke();
    tbDisc(p.x,p.y-12,18,9,'#d8d0c0',TB_OL);for(const [dx,dy] of [[-22,4],[22,4],[0,12]]){tbDisc(p.x+dx,p.y+dy,3.5,2.5,'#f07ca0');tbDisc(p.x+dx+4,p.y+dy-1,3,2.2,'#ffffff');}}
}
function tbChapelLive(b){const G=tbChapelGeo(b),P=TB_P,c=ctx,t=now;c.save();
  // the bell swings in its belfry
  const bp=P((G.tx0+G.tx1)/2,(G.ty0+G.ty1)/2+6,G.TH+G.BH-4),sw=Math.sin(t*2.4)*.35;c.translate(bp.x,bp.y);c.rotate(sw);
  c.fillStyle='#c89a3a';c.strokeStyle='#6a4a1a';c.lineWidth=1.2;c.beginPath();c.moveTo(-4,2);c.quadraticCurveTo(-6,10,-10,18);c.lineTo(10,18);c.quadraticCurveTo(6,10,4,2);c.closePath();c.fill();c.stroke();
  c.fillStyle='#e8c25a';c.fillRect(-9,15,4,2);tbDisc(0,20,2.4,2.4,'#6a4a1a');c.restore();c.save();
  // the healing water glows and sends up motes of light
  const w=P(G.well.x,G.well.y,12),pl=.6+Math.sin(t*2)*.15;
  c.globalCompositeOperation='lighter';const g=c.createRadialGradient(w.x,w.y,2,w.x,w.y,46);g.addColorStop(0,`rgba(140,230,200,${.55*pl})`);g.addColorStop(1,'rgba(100,200,255,0)');c.fillStyle=g;c.beginPath();c.ellipse(w.x,w.y,46,30,0,0,7);c.fill();c.globalCompositeOperation='source-over';
  tbDisc(w.x,w.y,15,7,'#7ad8d0');for(let k=0;k<2;k++){const ph=(t*.6+k/2)%1;c.strokeStyle=`rgba(255,255,255,${.7*(1-ph)})`;c.lineWidth=1;c.beginPath();c.ellipse(w.x,w.y,15*ph,7*ph,0,0,7);c.stroke();}
  for(let k=0;k<6;k++){const ph=(t*.35+k/6)%1,x=w.x+Math.sin(k*2.1+t*.8)*12;c.fillStyle=`rgba(220,255,240,${1-ph})`;c.beginPath();c.arc(x,w.y-ph*44,1.8,0,7);c.fill();}
  // a dove circling over the chapel
  const cx=P((G.nx0+G.nx1)/2,(G.ny0+G.nyF)/2,G.H+G.RH+40),a=t*.8,dx=cx.x+Math.cos(a)*46,dy=cx.y+Math.sin(a)*16,fl=Math.sin(t*12)*4;
  c.fillStyle='#fbfbf6';c.strokeStyle='#a8a8a0';c.lineWidth=.8;tbDisc(dx,dy,5,3,'#fbfbf6','#a8a8a0');c.beginPath();c.moveTo(dx-2,dy);c.lineTo(dx-7,dy-5-fl);c.lineTo(dx+1,dy-1);c.closePath();c.fill();c.stroke();c.beginPath();c.moveTo(dx+1,dy);c.lineTo(dx+6,dy-5+fl);c.lineTo(dx+3,dy);c.closePath();c.fill();c.stroke();
  c.restore();}
const tbChapelLights=b=>{const G=tbChapelGeo(b),xc=(G.nx0+G.nx1)/2;return tbLit([[xc,G.nyF,G.H+G.RH*.36],[G.nx1,G.nyF-20,24],[G.nx1,G.ny0+30,24],[xc,G.nyF,12,1],[G.well.x,G.well.y,14]]);};
const TOWN_BLD={shop:{body:tbStore,sign:96,lights:tbStoreLights},smith:{body:tbSmith,live:tbSmithLive,sign:60,lights:tbSmithLights},
  job:{body:tbGuild,live:tbGuildLive,sign:98,lights:tbGuildLights},
  heal:{body:tbChapel,live:tbChapelLive,sign:44,lights:tbChapelLights}};
// take over the drawing of Hearthvale's buildings that have a design of their own
{const _prev=drawBuilding;
  drawBuilding=function(b){const T=typeof zoneId!=='undefined'&&zoneId==='town'&&b.npc&&TOWN_BLD[b.npc.role];if(!T)return _prev.apply(this,arguments);
    if(T.lights&&!b._tbl){b._nl=T.lights(b);b._tbl=1;}
    if(!bldCacheBlit(b,()=>T.body(b)))T.body(b);
    if(T.live)try{T.live(b);}catch(e){}
    try{drawSign(b,T.sign||54);}catch(e){}};}
