"use strict";
/* ================= raised ground: cliffs and stairs (v1.55.0) =================
   The wild regions get plateaus: blocks of ground raised one level, with rock walls on the sides you can see and a
   flight of stone stairs up one front side. You cannot walk off a cliff or climb one: only the stairs join the two
   levels, and the paths of heroes and monsters go round to them. Everything standing up there is drawn raised (the
   world-to-screen projection in js/render.js adds the height, so heroes, monsters, trees, names and taps all follow),
   and a tap on a plateau's top lands on the top. Melee needs both sides on the same level; arrows and spells reach
   up and down a cliff. Plateaus are placed from the region's own seed, so everyone sees the same cliffs, and only
   where they cut nothing off (every tile you could reach before is still reachable). Loaded near the end.

   Z.lvd = {H, c: tile class (0 ground, 1 top, 2+k ramp k), plats:[{x,y,w,h}], ramps:[{x,y,w,h,ax,hi}], nodes}
   A ramp rises toward its plateau: ax is 'x' or 'y', hi = -1 (the plateau lies on the smaller side). */
const LV_H=40,LV_SKIP=new Set(['arena','keep']);
const lvTile=(L,x,y)=>{const tx=Math.floor(x/TILE),ty=Math.floor(y/TILE);return !(tx>=0&&ty>=0&&tx<L.W&&ty<L.Hh)?-1:ty*L.W+tx;}; // NaN-safe
// height of the ground at a world point (screen pixels)
function lvH(L,x,y){const i=lvTile(L,x,y);if(i<0)return 0;const c=L.c[i];if(c===0)return 0;if(c===1)return L.H;
  const r=L.ramps[c-2];if(!r)return 0;const len=(r.ax==='x'?r.w:r.h)*TILE,p=r.ax==='x'?x-r.x*TILE:y-r.y*TILE;
  const f=r.hi<0?1-p/len:p/len;return L.H*Math.max(0,Math.min(1,f));}
// one tile step (orthogonal): same class, or along a ramp onto the right level at each end
function lvStep(L,a,b,dx,dy){const ca=L.c[a],cb=L.c[b];if(ca===cb)return true;if(ca<2&&cb<2)return false;if(ca>=2&&cb>=2)return false;
  const r=L.ramps[(ca>=2?ca:cb)-2];if(!r||(r.ax==='x'?dy:dx))return false;const d=r.ax==='x'?dx:dy;
  if(ca>=2)return d===r.hi?cb===1:cb===0;
  return d===r.hi?ca===0:ca===1;}
// from tile a to a neighbouring tile b (a diagonal must work both ways round the corner)
function lvTiles(L,a,b){if(a===b||a<0||b<0)return true;const W=L.W,ax=a%W,ay=(a/W)|0,bx=b%W,by=(b/W)|0,dx=bx-ax,dy=by-ay;
  if(Math.abs(dx)>1||Math.abs(dy)>1)return L.c[a]===L.c[b];
  if(!dx||!dy)return lvStep(L,a,b,dx,dy);
  const m1=ay*W+bx,m2=by*W+ax;return lvStep(L,a,m1,dx,0)&&lvStep(L,m1,b,0,dy)&&lvStep(L,a,m2,0,dy)&&lvStep(L,m2,b,dx,0);}
// both on the same level (for melee): heights within a step of each other
function lvReach(a,b){const L=Z&&Z.lvd;if(!L||!a||!b)return true;return Math.abs(lvH(L,a.x,a.y)-lvH(L,b.x,b.y))<14;}

/* ---- walking: the body may not hang over a cliff edge ---- */
let LV_FROM=-1,LV_WALK=0;
{const _cs=canStand;canStand=function(x,y,r){if(!_cs(x,y,r))return false;const L=Z&&Z.lvd;if(!L||LV_FROM<0)return true;
  for(const [ox,oy] of [[-r,-r],[r,-r],[-r,r],[r,r]])if(!lvTiles(L,LV_FROM,lvTile(L,x+ox,y+oy)))return false;return true;};}
{const _me=moveEnt;moveEnt=function(e,dx,dy,r){const L=Z&&Z.lvd;if(!L)return _me.apply(this,arguments);const was=LV_FROM;LV_FROM=lvTile(L,e.x,e.y);try{return _me.apply(this,arguments);}finally{LV_FROM=was;}};}
// a straight walk: every small step must be allowed (only while walking: arrows and spells see over cliffs)
function lvWalkLine(x0,y0,x1,y1,r,step){const L=Z.lvd,d=Math.hypot(x1-x0,y1-y0),n=Math.max(1,Math.ceil(d/step));let prev=lvTile(L,x0,y0);const was=LV_FROM;
  try{for(let k=1;k<=n;k++){const x=x0+(x1-x0)*k/n,y=y0+(y1-y0)*k/n;LV_FROM=prev;if(!canStand(x,y,r))return false;prev=lvTile(L,x,y);}return true;}finally{LV_FROM=was;}}
{const _cl=clearLine;clearLine=function(x0,y0,x1,y1){if(!LV_WALK||!(Z&&Z.lvd))return _cl.apply(this,arguments);return lvWalkLine(x0,y0,x1,y1,PR,6);};}
{const _pt=pathTo;pathTo=function(){LV_WALK++;try{return _pt.apply(this,arguments);}finally{LV_WALK--;}};}
if(typeof mobClear==='function'){const _mc=mobClear;mobClear=function(x0,y0,x1,y1,r){if(!(Z&&Z.lvd))return _mc.apply(this,arguments);return lvWalkLine(x0,y0,x1,y1,r,8);};}

/* ---- placing the plateaus (from the region's seed) ---- */
function lvReachable(z,c){const W=z.w,H=z.h,N=W*H,seen=new Uint8Array(N),L=c?{W,Hh:H,c,ramps:z._lvR||[]}:null;
  const free=i=>!BLOCK[z.t[i]];let start=-1;
  const sp=z.spawn||(z.portals[0]&&{x:z.portals[0].x,y:z.portals[0].y});
  if(sp){const tx=Math.floor(sp.x/TILE),ty=Math.floor(sp.y/TILE);for(let r=0;r<6&&start<0;r++)for(let dy=-r;dy<=r&&start<0;dy++)for(let dx=-r;dx<=r;dx++){const x=tx+dx,y=ty+dy;if(x>0&&y>0&&x<W-1&&y<H-1&&free(y*W+x)&&(!c||c[y*W+x]===0)){start=y*W+x;break;}}}
  if(start<0)return seen;const q=[start];seen[start]=1;
  while(q.length){const i=q.pop(),x=i%W,y=(i/W)|0;for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=W||ny>=H)continue;const j=ny*W+nx;
    if(seen[j]||!free(j))continue;if(L&&!lvStep(L,i,j,dx,dy))continue;seen[j]=1;q.push(j);}}
  return seen;}
function lvGen(z){z.lvd=null;const D=z.D;if(!D||D.safe||D.dungeon||LV_SKIP.has(D.theme)||z.w<24||z.h<24)return;
  let s=0;for(const ch of z.id)s=(s*31+ch.charCodeAt(0))>>>0;const R=seeded(9001+s%100000);
  const W=z.w,H=z.h,c=new Uint8Array(W*H),plats=[],ramps=[];z._lvR=ramps;
  const before=lvReachable(z,null);
  const near=(tx,ty,d)=>{for(const p of z.portals)if(Math.abs(p.x/TILE-tx)<d&&Math.abs(p.y/TILE-ty)<d)return true;
    for(const n of z.npcs)if(Math.abs(n.x/TILE-tx)<d&&Math.abs(n.y/TILE-ty)<d)return true;
    if(z.spawn&&Math.abs(z.spawn.x/TILE-tx)<d&&Math.abs(z.spawn.y/TILE-ty)<d)return true;return false;};
  const want=W*H>2600?3:2;
  for(let tries=0;tries<90&&plats.length<want;tries++){
    const pw=5+Math.floor(R()*5),ph=5+Math.floor(R()*4),px=4+Math.floor(R()*(W-pw-12)),py=4+Math.floor(R()*(H-ph-12));
    const face=R()<.5?'y':'x',rw=2+(R()<.4?1:0),rl=3;
    // the stairs: on the front-left (+y) or front-right (+x) side, away from the corners
    const along=face==='y'?pw:ph;if(along<rw+2)continue;const off=1+Math.floor(R()*(along-rw-1));
    const rp=face==='y'?{x:px+off,y:py+ph,w:rw,h:rl,ax:'y',hi:-1}:{x:px+pw,y:py+off,w:rl,h:rw,ax:'x',hi:-1};
    // the ground there: no water, roads, buildings, gates or people; not too many trees; a gap from other plateaus
    let ok=true,trees=0;
    for(let y=py-2;y<py+ph+2+(face==='y'?rl:0)&&ok;y++)for(let x=px-2;x<px+pw+2+(face==='x'?rl:0)&&ok;x++){if(x<1||y<1||x>=W-1||y>=H-1){ok=false;break;}
      const v=z.t[y*W+x];if(v===3||v===1||v===6||c[y*W+x])ok=false;}
    if(!ok)continue;
    for(const b of z.buildings)if(px<b.x+b.w+3&&px+pw+3>b.x&&py<b.y+b.h+3&&py+ph+3>b.y)ok=false;
    if(!ok||near(px+pw/2,py+ph/2,Math.max(pw,ph)/2+6))continue;
    for(let y=py;y<py+ph;y++)for(let x=px;x<px+pw;x++)if(BLOCK[z.t[y*W+x]])trees++;
    if(trees>pw*ph*.3)continue;
    for(let y=rp.y;y<rp.y+rp.h;y++)for(let x=rp.x;x<rp.x+rp.w;x++)if(BLOCK[z.t[y*W+x]])ok=false;
    // the tile above the stairs (on top) and below them (on the ground) must be open
    const top=face==='y'?[[rp.x,rp.y-1],[rp.x+rw-1,rp.y-1]]:[[rp.x-1,rp.y],[rp.x-1,rp.y+rw-1]],foot=face==='y'?[[rp.x,rp.y+rl],[rp.x+rw-1,rp.y+rl]]:[[rp.x+rl,rp.y],[rp.x+rl,rp.y+rw-1]];
    for(const [x,y] of [...top,...foot])if(BLOCK[z.t[y*W+x]])ok=false;
    if(!ok)continue;
    // try it: nothing you could reach before may be cut off
    const k=ramps.length;for(let y=py;y<py+ph;y++)for(let x=px;x<px+pw;x++)c[y*W+x]=1;
    for(let y=rp.y;y<rp.y+rp.h;y++)for(let x=rp.x;x<rp.x+rp.w;x++)c[y*W+x]=2+k;ramps.push(rp);
    const after=lvReachable(z,c);let lost=false;for(let i=0;i<W*H;i++)if(before[i]&&!after[i]){lost=true;break;}
    if(lost){for(let y=py;y<py+ph;y++)for(let x=px;x<px+pw;x++)c[y*W+x]=0;for(let y=rp.y;y<rp.y+rp.h;y++)for(let x=rp.x;x<rp.x+rp.w;x++)c[y*W+x]=0;ramps.pop();continue;}
    plats.push({x:px,y:py,w:pw,h:ph,ramp:rp});}
  delete z._lvR;if(!plats.length)return;
  const L={W,Hh:H,H:LV_H,c,plats,ramps,nodes:[]};
  for(const p of plats)L.nodes.push({cliff:'plat',ref:p,x:p.x,y:p.y,w:p.w,h:p.h});
  for(const r of ramps)L.nodes.push({cliff:'ramp',ref:r,x:r.x,y:r.y,w:r.w,h:r.h});
  // walls: a few cracks and layers, the same every time
  for(const p of plats){const r2=seeded(77+p.x*131+p.y*17);p.cr=Array.from({length:4+Math.floor(r2()*4)},()=>[r2(),r2()<.5?'x':'y',.25+r2()*.5]);}
  z.lvd=L;lvMini(z);}
// the minimap: tops a little lighter, stairs in stone, the cliff foot darker
function lvMini(z){const L=z.lvd,m=z.mini&&z.mini.getContext&&z.mini.getContext('2d');if(!L||!m)return;
  for(const p of L.plats){m.fillStyle='rgba(255,255,240,.28)';m.fillRect(p.x,p.y,p.w,p.h);m.fillStyle='rgba(30,20,10,.55)';m.fillRect(p.x,p.y+p.h,p.w,.6);m.fillRect(p.x+p.w,p.y,.6,p.h);}
  for(const r of L.ramps){m.fillStyle='#c8b894';m.fillRect(r.x,r.y,r.w,r.h);}}

/* ---- drawing ---- */
const lvP=(x,y,h=0)=>({x:(x-y)*ISO,y:(x+y)*ISO/2-h});
// colours as hex in, hex out (shade() returns rgb(), which cannot be shaded again)
function lvHex(c,amt){let r=0,g=0,b=0;const m=/^#([0-9a-f]{6})$/i.exec(c||'');if(m){const n=parseInt(m[1],16);r=n>>16;g=n>>8&255;b=n&255;}
  else{const q=/rgba?\((\d+)\D+(\d+)\D+(\d+)/.exec(c||'');if(q){r=+q[1];g=+q[2];b=+q[3];}else{r=120;g=110;b=95;}}
  const f=v=>Math.max(0,Math.min(255,Math.round(v+amt))).toString(16).padStart(2,'0');return '#'+f(r)+f(g)+f(b);}
const LV_ROCK={dunes:'#b88a5a',crypt:'#5a5060',cave:'#5a5262',frost:'#8a9ab0',glacier:'#8a9ab0',peaks:'#7a7c86',heights:'#8a8478',caldera:'#5a3a30',molten:'#4a2a22',fen:'#5a6250',coast:'#a89070',jungle:'#6a6048',dusk:'#5a4a5a',ruins:'#8a8070'};
let LV_COL=null;
function lvRock(){const th=THEMES[Z.D.theme]||{},k=Z.D.theme;if(LV_COL&&LV_COL.k===k)return LV_COL;
  const g=(th.g&&th.g[0])||'#6aa553',rk=LV_ROCK[k]||(th.rock&&/^#/.test(th.rock[0])?th.rock[0]:'#8a7a62'),st=th.path&&/^#/.test(th.path)?th.path:'#b8a888';
  return LV_COL={k,face:lvHex(rk,0),side:lvHex(rk,-32),line:lvHex(rk,-70),lip:lvHex(g,28),grass:g,stone:st,tread:lvHex(st,14),riser:lvHex(st,-40),rside:lvHex(rk,-20)};}
function lvOnScr(X0,Y0,X1,Y1,h){const l=(X0-Y1)*ISO,r=(X1-Y0)*ISO,t=(X0+Y0)*ISO/2-h,b=(X1+Y1)*ISO/2;return r>camX-20&&l<camX+VW+20&&b>camY-20&&t<camY+VH+20;}
function drawPlat(p){const L=Z.lvd,H=L.H,X0=p.x*TILE,Y0=p.y*TILE,X1=(p.x+p.w)*TILE,Y1=(p.y+p.h)*TILE;if(!lvOnScr(X0,Y0,X1,Y1,H))return;const C=lvRock();
  // a soft shadow on the ground at the foot of the cliff
  poly([lvP(X0,Y1),lvP(X1,Y1),lvP(X1,Y0),lvP(X1+22,Y0+10),lvP(X1+22,Y1+22),lvP(X0+10,Y1+22)],'rgba(0,0,0,.22)');
  // the two walls that face you
  poly([lvP(X0,Y1),lvP(X1,Y1),lvP(X1,Y1,H),lvP(X0,Y1,H)],C.face,C.line);
  poly([lvP(X1,Y1),lvP(X1,Y0),lvP(X1,Y0,H),lvP(X1,Y1,H)],C.side,C.line);
  // rock layers and cracks
  ctx.strokeStyle='rgba(0,0,0,.22)';ctx.lineWidth=1;
  for(const f of [.38,.7]){ctx.beginPath();let a=lvP(X0,Y1,H*f),b=lvP(X1,Y1,H*f+2);ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);a=lvP(X1,Y0,H*f-1);ctx.lineTo(a.x,a.y);ctx.stroke();}
  for(const [t,side,len] of p.cr){ctx.beginPath();const a=side==='y'?lvP(X0+(X1-X0)*t,Y1,H*.95):lvP(X1,Y0+(Y1-Y0)*t,H*.95),b={x:a.x+(t-.5)*6,y:a.y+H*len};ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();}
  // the top: the ground's own picture, lifted
  const g=isoGround(Z),top=[lvP(X0,Y0,H),lvP(X1,Y0,H),lvP(X1,Y1,H),lvP(X0,Y1,H)];
  ctx.save();ctx.beginPath();ctx.moveTo(top[0].x,top[0].y);for(let i=1;i<4;i++)ctx.lineTo(top[i].x,top[i].y);ctx.closePath();ctx.clip();
  if(g){const l=Math.floor((X0-Y1)*ISO)-2,t=Math.floor((X0+Y0)*ISO/2)-2,w=Math.ceil((X1-Y0)*ISO)-l+4,h=Math.ceil((X1+Y1)*ISO/2)-t+4;
    const sx=Math.max(0,l+g._ox),sy=Math.max(0,t);ctx.drawImage(g,sx,sy,Math.min(w,g.width-sx),Math.min(h,g.height-sy),sx-g._ox,sy-H,Math.min(w,g.width-sx),Math.min(h,g.height-sy));}
  else{ctx.fillStyle=C.grass;ctx.fill();}
  ctx.fillStyle='rgba(255,250,225,.07)';ctx.fill();ctx.restore();
  // a grassy lip along the front edges
  ctx.strokeStyle=C.lip;ctx.lineWidth=2.5;ctx.lineJoin='round';ctx.beginPath();ctx.moveTo(top[3].x,top[3].y);ctx.lineTo(top[2].x,top[2].y);ctx.lineTo(top[1].x,top[1].y);ctx.stroke();
  ctx.strokeStyle='rgba(0,0,0,.25)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(top[3].x,top[3].y+2);ctx.lineTo(top[2].x,top[2].y+2);ctx.lineTo(top[1].x,top[1].y+2);ctx.stroke();}
function drawRamp(r){const L=Z.lvd,H=L.H,X0=r.x*TILE,Y0=r.y*TILE,X1=(r.x+r.w)*TILE,Y1=(r.y+r.h)*TILE;if(!lvOnScr(X0,Y0,X1,Y1,H))return;const C=lvRock();
  const n=r.ax==='y'?r.h*3:r.w*3,len=r.ax==='y'?Y1-Y0:X1-X0,tread=C.tread,riser=C.riser,side=C.rside;
  for(let k=0;k<n;k++){const a=k*len/n,b=(k+1)*len/n,h=H*(n-k)/(n+1),hn=k+1<n?H*(n-k-1)/(n+1):0;
    if(r.ax==='y'){const ya=Y0+a,yb=Y0+b;
      poly([lvP(X1,ya,0),lvP(X1,yb,0),lvP(X1,yb,h),lvP(X1,ya,h)],side);              // the side you see
      poly([lvP(X0,ya,h),lvP(X1,ya,h),lvP(X1,yb,h),lvP(X0,yb,h)],tread,'rgba(0,0,0,.25)'); // the tread
      poly([lvP(X0,yb,h),lvP(X1,yb,h),lvP(X1,yb,hn),lvP(X0,yb,hn)],riser);}            // the riser below it
    else{const xa=X0+a,xb=X0+b;
      poly([lvP(xa,Y1,0),lvP(xb,Y1,0),lvP(xb,Y1,h),lvP(xa,Y1,h)],C.face);
      poly([lvP(xa,Y0,h),lvP(xb,Y0,h),lvP(xb,Y1,h),lvP(xa,Y1,h)],tread,'rgba(0,0,0,.25)');
      poly([lvP(xb,Y0,h),lvP(xb,Y1,h),lvP(xb,Y1,hn),lvP(xb,Y0,hn)],C.riser);}}}
function drawCliff(n){try{if(n.cliff==='plat')drawPlat(n.ref);else drawRamp(n.ref);}catch(e){}}

/* ---- a region gets its plateaus when you enter it (after everything else has built it) ---- */
{const _ez=enterZone;enterZone=function(id){try{const z=getZone(id);if(z&&z.lvd===undefined)lvGen(z);}catch(e){console.warn('heights',e);}return _ez.apply(this,arguments);};}
