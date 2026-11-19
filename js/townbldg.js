"use strict";
/* ================= Hearthvale's buildings, each built for its trade (v1.28.0) =================
   Every building in Hearthvale gets a shape of its own, plus the things you would find at that trade, so you can
   tell what it is from across the plaza without reading its sign:
     shop   General Store: a two-storey market house, an open shop front with shelves, the upper floor overhanging
            the street with a bay window, a striped awning over a counter of produce crates, a hanging balance scale,
            a coin-purse sign on an iron bracket, a hand cart of pumpkins with barrels and sacks
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

const TOWN_BLD={shop:{body:tbStore,sign:96}};
// take over the drawing of Hearthvale's buildings that have a design of their own
{const _prev=drawBuilding;
  drawBuilding=function(b){const T=typeof zoneId!=='undefined'&&zoneId==='town'&&b.npc&&TOWN_BLD[b.npc.role];if(!T)return _prev.apply(this,arguments);
    if(!bldCacheBlit(b,()=>T.body(b)))T.body(b);
    if(T.live)try{T.live(b);}catch(e){}
    try{drawSign(b,T.sign||54);}catch(e){}};}
