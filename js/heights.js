"use strict";
/* ================= the shape of the land: hills, slopes and banks (v1.56.0) =================
   Each region can have its own hand-made ground (LV_DESIGNS, one region at a time). The ground is a height field:
   every tile knows the height of its four corners, so land can rise smoothly. A gentle slope is walked up like any
   ground; a sudden drop (a bank) is a wall nobody can climb or step off, and paths of heroes and monsters go round it.
   Everything standing on the land is drawn at its height (the world-to-screen projection in js/render.js adds it), a
   tap lands on the slope you see, and melee needs both sides at about the same height; arrows and spells reach up and
   down. The hills are drawn once per region (the region's own grass laid over the slopes, lit by their tilt), so the
   cost while playing is one picture per hill.
   Greenmoss Meadow (v1.56.0): rolling green hills. Chieftain's Knoll with an old oak, the Hopper Chieftain's den and an
   earthen bank toward the road; Lookout Hill by the way in from Hearthvale; a soft rise in the southern fields.
   (v1.56.1) A brook sunk below the meadow joins its three ponds: a wooden bridge carries the road over it and two fords
   lead down into the water, where you wade slower and the dewdrops live; the banks elsewhere are too steep to climb.
   All land is drawn with the ground, before anyone standing on it, so nobody is ever hidden by a slope.
   (v1.57.0) The Whispering Woods, a hollow forest: The Hollow, a dark sunken glade with steep earth walls and two root
   paths down to the Wolf Alpha's den; The Fallen Giant, a dry gully of webs where the web-spinners nest, crossed on a
   huge fallen log; and long low ridges of roots between the trees.

   Z.lvd = {W, Hh, H (highest), lo (lowest), wet (1 water, 2 bridge or log, 3 dry gully, 4 hollow floor), hc: Float32Array(W*Hh*4) corner heights [top-left, top-right, bottom-right, bottom-left],
            hills, nodes, den} */
const LV_STEP=6; // the largest height difference you can step across at a tile edge (screen px)
const LV_DESIGNS={
  meadow:{hills:[
    {name:"Chieftain's Knoll",cx:50.5,cy:8.5,rx:10,ry:6.5,H:58,top:.32,bank:{ax:'y',at:.42},oak:[51,7],den:[49,8,'hopperchief']},
    {name:'Lookout Hill',cx:12.5,cy:9.5,rx:7.5,ry:5.5,H:38,top:.3,bank:{ax:'x',at:.5}},
    {name:'South Rise',cx:15.5,cy:35,rx:9,ry:5.5,H:42,top:.25}],
    // (v1.56.1) a brook sunk below the meadow, joining its three ponds: under the road by a wooden bridge, two fords to wade
    brook:{D:22,wet:[[29,10,30,16],[29,26,34,27],[33,28,34,30]],bridge:[[29,22,30,25]],
      fords:[[28,14,'e'],[31,14,'w'],[32,29,'e'],[35,29,'w']],dwellers:'dewdrop'}},
  // (v1.57.0) the Whispering Woods, a hollow forest: a dark sunken glade with the Wolf Alpha's den at the bottom, reached by
  // two root paths; a dry gully where the web-spinners nest, crossed on a fallen giant log; long low ridges of roots
  woods:{
    bowls:[{name:'The Hollow',cx:54,cy:36,rx:6,ry:4.5,D:34,ramps:[[51,28,52,31,'s'],[44,34,47,35,'e']],den:[54,36,'lupealpha'],clear:[[54,31]]}],
    gullies:[{name:'The Fallen Giant',D:24,dry:[[20,39,36,40]],log:[[28,38,28,41]],ramps:[[17,39,19,40,'e'],[37,39,39,40,'w']],dwellers:'webspinner'}],
    hills:[{name:'Root Ridge',cx:40,cy:12,rx:7,ry:2.8,H:28,top:.25,bank:{ax:'y',at:.12},roots:1},
      {name:'Root Ridge',cx:11,cy:30,rx:4.5,ry:2.5,H:26,top:.25,bank:{ax:'y',at:.12},roots:1},
      {name:'Root Ridge',cx:7,cy:11,rx:5,ry:2.4,H:24,top:.25,bank:{ax:'y',at:.12},roots:1}]}};
const lvTile=(L,x,y)=>{const tx=Math.floor(x/TILE),ty=Math.floor(y/TILE);return !(tx>=0&&ty>=0&&tx<L.W&&ty<L.Hh)?-1:ty*L.W+tx;}; // NaN-safe
// height of the ground at a world point: the tile's four corners, blended
function lvH(L,x,y){const i=lvTile(L,x,y);if(i<0)return 0;const k=i*4,a=L.hc[k],b=L.hc[k+1],c=L.hc[k+2],d=L.hc[k+3];if(!(a||b||c||d))return 0;
  const u=x/TILE-Math.floor(x/TILE),v=y/TILE-Math.floor(y/TILE);return (a*(1-u)+b*u)*(1-v)+(d*(1-u)+c*u)*v;}
// one tile step (orthogonal): the shared edge must meet (no bank between them)
function lvStep(L,a,b,dx,dy){const A=a*4,B=b*4,h=L.hc;
  if(dx>0)return Math.abs(h[A+1]-h[B])<=LV_STEP&&Math.abs(h[A+2]-h[B+3])<=LV_STEP;
  if(dx<0)return Math.abs(h[A]-h[B+1])<=LV_STEP&&Math.abs(h[A+3]-h[B+2])<=LV_STEP;
  if(dy>0)return Math.abs(h[A+3]-h[B])<=LV_STEP&&Math.abs(h[A+2]-h[B+1])<=LV_STEP;
  if(dy<0)return Math.abs(h[A]-h[B+3])<=LV_STEP&&Math.abs(h[A+1]-h[B+2])<=LV_STEP;return true;}
// from tile a to a neighbouring tile b (a diagonal must work both ways round the corner)
function lvTiles(L,a,b){if(a===b||a<0||b<0)return true;const W=L.W,ax=a%W,ay=(a/W)|0,bx=b%W,by=(b/W)|0,dx=bx-ax,dy=by-ay;
  if(Math.abs(dx)>1||Math.abs(dy)>1)return true;
  if(!dx||!dy)return lvStep(L,a,b,dx,dy);
  const m1=ay*W+bx,m2=by*W+ax;return lvStep(L,a,m1,dx,0)&&lvStep(L,m1,b,0,dy)&&lvStep(L,a,m2,0,dy)&&lvStep(L,m2,b,dx,0);}
// both at about the same height (for melee)
function lvReach(a,b){const L=Z&&Z.lvd;if(!L||!a||!b)return true;return Math.abs(lvH(L,a.x,a.y)-lvH(L,b.x,b.y))<16;}
// screen point -> the frontmost ground you see there (on a bank's face: the ground at its foot)
function lvUnproj(sx,sy){const L=Z.lvd;let prev=null;
  for(let h=L.H;h>=(L.lo||0);h-=2){const w=unprojFlat(sx,sy+h),g=lvH(L,w.x,w.y);if(Math.abs(g-h)<=1.6)return w;if(g>h+1.6&&prev)return prev;prev=w;}
  return unprojFlat(sx,sy);}

/* ---- walking: the body may not hang over a bank ---- */
let LV_FROM=-1,LV_WALK=0;
{const _cs=canStand;canStand=function(x,y,r){if(!_cs(x,y,r))return false;const L=Z&&Z.lvd;if(!L||LV_FROM<0)return true;
  for(const [ox,oy] of [[-r,-r],[r,-r],[-r,r],[r,r]])if(!lvTiles(L,LV_FROM,lvTile(L,x+ox,y+oy)))return false;return true;};}
{const _me=moveEnt;moveEnt=function(e,dx,dy,r){const L=Z&&Z.lvd;if(!L)return _me.apply(this,arguments);const was=LV_FROM;LV_FROM=lvTile(L,e.x,e.y);try{return _me.apply(this,arguments);}finally{LV_FROM=was;}};}
// a straight walk: every small step must be allowed (only while walking: arrows and spells see over banks)
function lvWalkLine(x0,y0,x1,y1,r,step){const L=Z.lvd,d=Math.hypot(x1-x0,y1-y0),n=Math.max(1,Math.ceil(d/step));let prev=lvTile(L,x0,y0);const was=LV_FROM;
  try{for(let k=1;k<=n;k++){const x=x0+(x1-x0)*k/n,y=y0+(y1-y0)*k/n;LV_FROM=prev;if(!canStand(x,y,r))return false;prev=lvTile(L,x,y);}return true;}finally{LV_FROM=was;}}
{const _cl=clearLine;clearLine=function(x0,y0,x1,y1){if(!LV_WALK||!(Z&&Z.lvd))return _cl.apply(this,arguments);return lvWalkLine(x0,y0,x1,y1,PR,6);};}
{const _pt=pathTo;pathTo=function(){LV_WALK++;try{return _pt.apply(this,arguments);}finally{LV_WALK--;}};}
if(typeof mobClear==='function'){const _mc=mobClear;mobClear=function(x0,y0,x1,y1,r){if(!(Z&&Z.lvd))return _mc.apply(this,arguments);return lvWalkLine(x0,y0,x1,y1,r,8);};}

/* ---- building a region's land from its design ---- */
const lvSmooth=t=>t<=0?0:t>=1?1:t*t*(3-2*t);
function lvHill(h,x,y){const dx=(x-h.cx)/h.rx,dy=(y-h.cy)/h.ry,d=Math.hypot(dx,dy);if(d>=1)return 0;if(d<=h.top)return h.H;return h.H*lvSmooth((1-d)/(1-h.top));}
function lvReachable(z,L){const W=z.w,H=z.h,N=W*H,seen=new Uint8Array(N),free=i=>!BLOCK[z.t[i]];let start=-1;
  const sp=z.spawn||(z.portals[0]&&{x:z.portals[0].x,y:z.portals[0].y});
  if(sp){const tx=Math.floor(sp.x/TILE),ty=Math.floor(sp.y/TILE);for(let r=0;r<6&&start<0;r++)for(let dy=-r;dy<=r&&start<0;dy++)for(let dx=-r;dx<=r;dx++){const x=tx+dx,y=ty+dy;if(x>0&&y>0&&x<W-1&&y<H-1&&free(y*W+x)){start=y*W+x;break;}}}
  if(start<0)return seen;const q=[start];seen[start]=1;
  while(q.length){const i=q.pop(),x=i%W,y=(i/W)|0;for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=W||ny>=H)continue;const j=ny*W+nx;
    if(seen[j]||!free(j))continue;if(L&&!lvStep(L,i,j,dx,dy))continue;seen[j]=1;q.push(j);}}
  return seen;}
function lvGen(z){z.lvd=null;const des=LV_DESIGNS[z.id];if(!des)return;
  const W=z.w,H=z.h,hc=new Float32Array(W*H*4),L={W,Hh:H,H:0,lo:0,hc,hills:[],nodes:[],feats:[],wet:new Uint8Array(W*H),log:new Uint8Array(W*H),dens:[],dwell:[]};
  for(const h of des.hills||[]){const own=[];let x0=1e9,y0=1e9,x1=-1,y1=-1;
    for(let ty=Math.max(1,Math.floor(h.cy-h.ry));ty<=Math.min(H-2,Math.ceil(h.cy+h.ry));ty++)for(let tx=Math.max(1,Math.floor(h.cx-h.rx));tx<=Math.min(W-2,Math.ceil(h.cx+h.rx));tx++){
      // the bank: past this line the hill is cut off sharply (its face looks toward you)
      if(h.bank){const off=h.bank.ax==='y'?(ty+.5-h.cy)/h.ry:(tx+.5-h.cx)/h.rx;if(off>h.bank.at)continue;}
      const c=[lvHill(h,tx,ty),lvHill(h,tx+1,ty),lvHill(h,tx+1,ty+1),lvHill(h,tx,ty+1)];if(!(c[0]||c[1]||c[2]||c[3]))continue;
      const i=(ty*W+tx)*4;for(let k=0;k<4;k++)hc[i+k]=Math.max(hc[i+k],c[k]);own.push(ty*W+tx);x0=Math.min(x0,tx);y0=Math.min(y0,ty);x1=Math.max(x1,tx);y1=Math.max(y1,ty);}
    if(!own.length)continue;L.H=Math.max(L.H,h.H);
    const hill={...h,tiles:own,x:x0,y:y0,w:x1-x0+1,hh:y1-y0+1};L.hills.push(hill);L.feats.push(hill);
    // the old oak on the top (a tree tile, so nobody walks through it); the chieftain's den beside it
    if(h.oak){const [ox,oy]=h.oak;z.t[oy*W+ox]=2;z.objs.push({x:(ox+.5)*TILE,y:(oy+.5)*TILE,kind:'tree',v:1,sc:1.75,oak:1});}
    if(h.den)L.dens.push({x:(h.den[0]+.5)*TILE,y:(h.den[1]+.5)*TILE,mob:h.den[2]});}
  if(des.brook)lvBrook(z,L,des.brook);
  for(const b of des.bowls||[])lvBowl(z,L,b);
  for(const b of des.gullies||[])lvGully(z,L,b);
  if(!L.feats.length)return;
  z.lvd=L;lvMini(z);}
// the brook: its bed lies D below the meadow; the bridge stays level with the road; a ford slopes down into the water
function lvBrook(z,L,b){const W=L.W,hc=L.hc,D=b.D,set=(i,a,bb,c,d)=>{hc[i*4]=a;hc[i*4+1]=bb;hc[i*4+2]=c;hc[i*4+3]=d;},tiles=new Set();
  for(const [x0,y0,x1,y1] of b.wet)for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const i=y*W+x;set(i,-D,-D,-D,-D);L.wet[i]=1;
    if(BLOCK[z.t[i]]){z.t[i]=0;z.objs=z.objs.filter(o=>!(Math.floor(o.x/TILE)===x&&Math.floor(o.y/TILE)===y));}tiles.add(i);}
  for(const [x0,y0,x1,y1] of b.bridge||[])for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const i=y*W+x;L.wet[i]=2;tiles.add(i);}
  for(const [x,y,dir] of b.fords||[]){const i=y*W+x;if(dir==='e')set(i,0,-D,-D,0);else set(i,-D,0,0,-D);tiles.add(i);}
  // the banks you can see belong to the ground on the far side: add the tiles behind the water so their faces are drawn
  for(const i of [...tiles]){if(L.wet[i]!==1)continue;for(const j of [i-1,i-W,i-W-1])if(j>=0)tiles.add(j);}
  L.lo=Math.min(L.lo,-D);
  L.feats.push({name:'Brook',tiles:[...tiles],brook:b});L.brookD=D;if(b.dwellers)L.dwell.push({mob:b.dwellers,v:1});}
// a strip of ground sloping from the meadow's level down to -D (dir: the way it goes down)
function lvRampSet(L,[x0,y0,x1,y1,dir],D,tiles){const W=L.W,hc=L.hc,len=dir==='s'||dir==='n'?y1-y0+1:x1-x0+1;
  const at=(cx,cy)=>{const t=dir==='s'?(cy-y0)/len:dir==='n'?(y1+1-cy)/len:dir==='e'?(cx-x0)/len:(x1+1-cx)/len;return -D*Math.max(0,Math.min(1,t));};
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const i=y*W+x;hc[i*4]=at(x,y);hc[i*4+1]=at(x+1,y);hc[i*4+2]=at(x+1,y+1);hc[i*4+3]=at(x,y+1);tiles.add(i);L.ramp[i]=1;}}
function lvClear(z,i){if(BLOCK[z.t[i]]){const W=z.w,x=i%W,y=(i/W)|0;z.t[i]=0;z.objs=z.objs.filter(o=>!(Math.floor(o.x/TILE)===x&&Math.floor(o.y/TILE)===y));}}
const lvBehind=(L,tiles)=>{for(const i of [...tiles]){if(L.hc[i*4]>=0&&L.hc[i*4+1]>=0&&L.hc[i*4+2]>=0&&L.hc[i*4+3]>=0)continue;for(const j of [i-1,i-L.W,i-L.W-1])if(j>=0)tiles.add(j);}};
// a sunken glade: a flat floor D below the forest inside an ellipse, steep earth walls, root paths down into it
function lvBowl(z,L,b){const W=L.W,hc=L.hc,D=b.D,tiles=new Set();L.ramp=L.ramp||new Uint8Array(W*L.Hh);
  for(let y=Math.floor(b.cy-b.ry);y<=Math.ceil(b.cy+b.ry);y++)for(let x=Math.floor(b.cx-b.rx);x<=Math.ceil(b.cx+b.rx);x++){
    if(Math.hypot((x+.5-b.cx)/b.rx,(y+.5-b.cy)/b.ry)>1)continue;const i=y*W+x;lvClear(z,i);for(let k=0;k<4;k++)hc[i*4+k]=-D; /* an open glade: no trees on its floor */L.wet[i]=4;tiles.add(i);}
  for(const rp of b.ramps||[]){for(let y=rp[1];y<=rp[3];y++)for(let x=rp[0];x<=rp[2];x++)lvClear(z,y*W+x);lvRampSet(L,rp,D,tiles);}
  for(const [x,y] of b.clear||[])lvClear(z,y*W+x); // a tree that would wall a corner in
  lvBehind(L,tiles);L.lo=Math.min(L.lo,-D);
  if(b.den){const [x,y,mob]=b.den;lvClear(z,y*W+x);L.dens.push({x:(x+.5)*TILE,y:(y+.5)*TILE,mob});}
  L.feats.push({name:b.name,tiles:[...tiles],bowl:b});}
// a dry gully: a sunken strip of dead leaves and webs, a fallen log across it at the forest's level, a slope down at one end
function lvGully(z,L,b){const W=L.W,hc=L.hc,D=b.D,tiles=new Set();L.ramp=L.ramp||new Uint8Array(W*L.Hh);
  for(const [x0,y0,x1,y1] of b.dry)for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const i=y*W+x;lvClear(z,i);for(let k=0;k<4;k++)hc[i*4+k]=-D;L.wet[i]=3;tiles.add(i);}
  for(const [x0,y0,x1,y1] of b.log||[])for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const i=y*W+x;lvClear(z,i);for(let k=0;k<4;k++)hc[i*4+k]=0;L.wet[i]=2;L.log[i]=1;tiles.add(i);}
  for(const rp of b.ramps||[]){for(let y=rp[1];y<=rp[3];y++)for(let x=rp[0];x<=rp[2];x++)lvClear(z,y*W+x);lvRampSet(L,rp,D,tiles);}
  lvBehind(L,tiles);L.lo=Math.min(L.lo,-D);if(b.dwellers)L.dwell.push({mob:b.dwellers,v:3});
  L.feats.push({name:b.name,tiles:[...tiles],gully:b});}
// the minimap: higher ground a little lighter, banks dark
function lvMini(z){const L=z.lvd,m=z.mini&&z.mini.getContext&&z.mini.getContext('2d');if(!L||!m)return;const th=THEMES[z.D.theme]||{};
  for(let i=0;i<L.wet.length;i++)if(L.wet[i]){m.fillStyle=L.wet[i]===1?(th.water||'#3f7fb8'):L.wet[i]===2?(L.log[i]?'#6a4a2a':'#a07a4a'):L.wet[i]===3?'#3e3020':'rgba(10,20,10,.45)';m.fillRect(i%L.W,(i/L.W)|0,1,1);}
  for(const h of L.hills)for(const i of h.tiles){const x=i%L.W,y=(i/L.W)|0,a=(L.hc[i*4]+L.hc[i*4+2])/2/L.H;m.fillStyle=`rgba(255,255,220,${(a*.32).toFixed(3)})`;m.fillRect(x,y,1,1);
    if(!lvStep(L,i,i+L.W,0,1)){m.fillStyle='rgba(60,40,20,.7)';m.fillRect(x,y+.7,1,.3);}if(!lvStep(L,i,i+1,1,0)){m.fillStyle='rgba(60,40,20,.7)';m.fillRect(x+.7,y,.3,1);}}}

/* ---- drawing: each hill is painted once into its own picture ---- */
const lvS=(x,y,h)=>({x:(x-y)*ISO,y:(x+y)*ISO/2-h});
// the affine map that takes three world points (flat picture) to three screen points (on the slope)
function lvAffine(p,s){const [x0,y0]=p[0],[x1,y1]=p[1],[x2,y2]=p[2],d=(x1-x0)*(y2-y0)-(x2-x0)*(y1-y0);if(!d)return null;
  const a=((s[1].x-s[0].x)*(y2-y0)-(s[2].x-s[0].x)*(y1-y0))/d,c=((s[2].x-s[0].x)*(x1-x0)-(s[1].x-s[0].x)*(x2-x0))/d,
        b=((s[1].y-s[0].y)*(y2-y0)-(s[2].y-s[0].y)*(y1-y0))/d,dd=((s[2].y-s[0].y)*(x1-x0)-(s[1].y-s[0].y)*(x2-x0))/d;
  return [a,b,c,dd,s[0].x-a*x0-c*y0,s[0].y-b*x0-dd*y0];}
function lvHex(c,amt){let r=0,g=0,b=0;const m=/^#([0-9a-f]{6})$/i.exec(c||'');if(m){const n=parseInt(m[1],16);r=n>>16;g=n>>8&255;b=n&255;}else{r=120;g=110;b=95;}
  const f=v=>Math.max(0,Math.min(255,Math.round(v+amt))).toString(16).padStart(2,'0');return '#'+f(r)+f(g)+f(b);}
function lvPaint(z,hill){const L=z.lvd,dpr=typeof DPR==='number'&&DPR?DPR:1,T=TILE,hc=L.hc,W=L.W;
  let mnx=1e9,mny=1e9,mxx=-1e9,mxy=-1e9;
  for(const i of hill.tiles){const tx=i%W,ty=(i/W)|0;[[tx,ty],[tx+1,ty],[tx+1,ty+1],[tx,ty+1]].forEach(([cx,cy],k)=>{const s=lvS(cx*T,cy*T,hc[i*4+k]);mnx=Math.min(mnx,s.x);mxx=Math.max(mxx,s.x);mny=Math.min(mny,s.y-14);mxy=Math.max(mxy,s.y+30);});}
  mnx=Math.floor(mnx-4);mny=Math.floor(mny);const cw=Math.ceil(mxx+4-mnx),ch=Math.ceil(mxy-mny);
  const cv=document.createElement('canvas');cv.width=Math.ceil(cw*dpr);cv.height=Math.ceil(ch*dpr);const g=cv.getContext('2d');if(!g)return null;
  const base=()=>g.setTransform(dpr,0,0,dpr,-mnx*dpr,-mny*dpr);base();
  const th=THEMES[z.D.theme]||{},grass=(th.g&&th.g[0])||'#5e9b4a',R=seeded(4242+hill.tiles.length);
  const order=hill.tiles.slice().sort((a,b)=>(a%W+((a/W)|0))-(b%W+((b/W)|0)));
  // one triangle of a tile: the flat ground picture laid onto the slope, then lit or shaded by its tilt
  const tri=(P,S,shadeA)=>{const cx=(S[0].x+S[1].x+S[2].x)/3,cy=(S[0].y+S[1].y+S[2].y)/3;
    g.save();g.beginPath();S.forEach((p,k)=>{const ex=p.x+(p.x>cx?.5:-.5),ey=p.y+(p.y>cy?.5:-.5);k?g.lineTo(ex,ey):g.moveTo(ex,ey);});g.closePath();g.clip();
    const m=lvAffine(P,S);if(m&&z.img){g.transform(...m);const bx=Math.min(P[0][0],P[1][0],P[2][0])-2,by=Math.min(P[0][1],P[1][1],P[2][1])-2;g.drawImage(z.img,bx,by,T+4,T+4,bx,by,T+4,T+4);base();}
    else{g.fillStyle=grass;g.fill();}
    if(shadeA){g.fillStyle=shadeA>0?`rgba(255,250,215,${Math.min(.34,shadeA).toFixed(3)})`:`rgba(10,30,10,${Math.min(.38,-shadeA).toFixed(3)})`;g.fillRect(-1e5,-1e5,2e5,2e5);}
    g.restore();};
  for(const i of order){const tx=i%W,ty=(i/W)|0,X0=tx*T,Y0=ty*T,X1=X0+T,Y1=Y0+T,k=i*4,h=[hc[k],hc[k+1],hc[k+2],hc[k+3]];
    const C=[[X0,Y0],[X1,Y0],[X1,Y1],[X0,Y1]],S=C.map((p,j)=>lvS(p[0],p[1],h[j]));
    // light from the upper left: slopes facing down-left are lit, those facing down-right are in shade; the top is a touch brighter
    const dhx=((h[1]-h[0])+(h[2]-h[3]))/2/T,dhy=((h[3]-h[0])+(h[2]-h[1]))/2/T,sh=(dhx-dhy)*.95+(L.H?((h[0]+h[2])/2/L.H)*.07:0);
    const wt=L.wet[i],quad=(fill)=>{g.beginPath();S.forEach((p,j)=>j?g.lineTo(p.x,p.y):g.moveTo(p.x,p.y));g.closePath();g.fillStyle=fill;g.fill();};
    if(wt===1){ // the water of the brook: deeper colour by the far bank, a few ripples
      quad(th.water||'#3f7fb8');const far=(L.wet[i-1]!==1?1:0)+(L.wet[i-W]!==1?1:0);if(far){quad(`rgba(10,30,60,${.16*far})`);}
      g.strokeStyle='rgba(255,255,255,.28)';g.lineWidth=1;for(let q=0;q<2;q++){const u=R(),v=R(),p=lvS(X0+u*T,Y0+v*T,h[0]);g.beginPath();g.moveTo(p.x-5,p.y);g.quadraticCurveTo(p.x,p.y-1.6,p.x+5,p.y);g.stroke();}}
    else if(wt===3){ // the dry gully: dark earth and dead leaves, webs in the corners
      quad('#43361f');const far=(L.wet[i-1]!==3?1:0)+(L.wet[i-W]!==3?1:0);if(far)quad(`rgba(0,0,0,${.18*far})`);
      for(let q=0;q<5;q++){const p=lvS(X0+R()*T,Y0+R()*T,h[0]);g.fillStyle=['#7a5a2a','#8a6a30','#5a4220'][q%3];g.fillRect(p.x-1.5,p.y-.7,3,1.4);}
      if(R()<.45){const c=lvS(X0+T*(.3+R()*.4),Y0+T*(.3+R()*.4),h[0]);g.strokeStyle='rgba(235,235,235,.5)';g.lineWidth=.7;
        for(let a=0;a<6;a++){g.beginPath();g.moveTo(c.x,c.y);g.lineTo(c.x+Math.cos(a)*9,c.y+Math.sin(a)*4.5);g.stroke();}
        for(const rr of [3,6]){g.beginPath();g.ellipse(c.x,c.y,rr*1.5,rr*.75,0,0,7);g.stroke();}}}
    else if(wt===2&&L.log[i]){ // the fallen giant: a mossy log, bark lines along it
      tri([C[0],C[1],C[2]],[S[0],S[1],S[2]],0);tri([C[0],C[2],C[3]],[S[0],S[2],S[3]],0);
      const a=lvS(X0+T/2,Y0,0),b2=lvS(X0+T/2,Y1,0),nx=ISO*T*.5,ny=ISO*T*.25;
      g.beginPath();g.moveTo(a.x-nx+2,a.y-ny-12);g.lineTo(b2.x-nx+2,b2.y-ny-12);g.lineTo(b2.x+nx-2,b2.y+ny-12);g.lineTo(a.x+nx-2,a.y+ny-12);g.closePath();
      g.fillStyle='#6e4c2c';g.fill();g.strokeStyle='#3e2814';g.lineWidth=1;g.stroke();
      g.strokeStyle='rgba(40,24,10,.6)';for(const f of [-.5,0,.5]){g.beginPath();g.moveTo(a.x+nx*f,a.y+ny*f-12);g.lineTo(b2.x+nx*f,b2.y+ny*f-12);g.stroke();}
      g.fillStyle='rgba(110,160,70,.55)';for(let q=0;q<3;q++){const t=R(),p={x:a.x+(b2.x-a.x)*t-nx*.3,y:a.y+(b2.y-a.y)*t-ny*.3-13};g.beginPath();g.ellipse(p.x,p.y,4,2,0,0,7);g.fill();}
      // the log's side over the gully, and its broken end
      g.fillStyle='#4a321c';g.beginPath();g.moveTo(b2.x-nx+2,b2.y-ny-12);g.lineTo(b2.x+nx-2,b2.y+ny-12);g.lineTo(b2.x+nx-2,b2.y+ny);g.lineTo(b2.x-nx+2,b2.y-ny);g.closePath();
      if(L.log[i+W]!==1){g.fill();g.fillStyle='#b08a5a';g.beginPath();g.ellipse(b2.x,b2.y-6,nx*.85,7,0,0,7);g.fill();g.strokeStyle='#7a5a32';g.beginPath();g.ellipse(b2.x,b2.y-6,nx*.45,3.6,0,0,7);g.stroke();}}
    else if(wt===2){ // the bridge: planks across, the road's way over the water
      quad('#9a7448');g.strokeStyle='rgba(60,38,18,.55)';g.lineWidth=1;for(let q=1;q<4;q++){const a=lvS(X0,Y0+q*T/4,0),b2=lvS(X1,Y0+q*T/4,0);g.beginPath();g.moveTo(a.x,a.y);g.lineTo(b2.x,b2.y);g.stroke();}
      // rails along both sides, a post at each corner
      g.strokeStyle='#5a3d22';g.lineWidth=2;for(const ex of [X0,X1])if(L.wet[ty*W+(ex===X0?tx-1:tx+1)]!==2){const a=lvS(ex,Y0,0),b2=lvS(ex,Y1,0);g.beginPath();g.moveTo(a.x,a.y-9);g.lineTo(b2.x,b2.y-9);g.stroke();
        for(const p of [a,b2]){g.beginPath();g.moveTo(p.x,p.y);g.lineTo(p.x,p.y-11);g.stroke();}}}
    else{tri([C[0],C[1],C[2]],[S[0],S[1],S[2]],sh);tri([C[0],C[2],C[3]],[S[0],S[2],S[3]],sh);
      if(wt===4)quad('rgba(5,15,5,.3)'); // the hollow's floor lies in shadow
      if(L.ramp&&L.ramp[i]){g.strokeStyle='rgba(60,38,18,.85)';g.lineWidth=2;g.lineCap='round'; // roots across the path down
        for(let q=0;q<2;q++){const v=.2+q*.45+R()*.15,a=lvS(X0,Y0+v*T,h[0]*(1-v)+h[3]*v),b2=lvS(X1,Y0+v*T,h[1]*(1-v)+h[2]*v);g.beginPath();g.moveTo(a.x,a.y);g.quadraticCurveTo((a.x+b2.x)/2+R()*4-2,(a.y+b2.y)/2+R()*4-3,b2.x,b2.y);g.stroke();}}
      if(hill.roots&&R()<.35){g.strokeStyle='rgba(70,45,20,.7)';g.lineWidth=1.6;const a=lvS(X0+R()*T,Y0+R()*T,(h[0]+h[2])/2);g.beginPath();g.moveTo(a.x-7,a.y);g.quadraticCurveTo(a.x,a.y-3,a.x+7,a.y+1);g.stroke();}}
    // banks: an earthen face where this tile drops sharply to the one in front (+y: down-left, +x: down-right)
    const face=(e0,e1,n0,n1,col,dark)=>{if(Math.max(h[e0]-n0,h[e1]-n1)<=LV_STEP)return;
      const A=C[e0],B=C[e1],pts=[lvS(A[0],A[1],h[e0]),lvS(B[0],B[1],h[e1]),lvS(B[0],B[1],n1),lvS(A[0],A[1],n0)];
      g.beginPath();pts.forEach((p,j)=>j?g.lineTo(p.x,p.y):g.moveTo(p.x,p.y));g.closePath();
      const gr=g.createLinearGradient(0,Math.min(pts[0].y,pts[1].y),0,Math.max(pts[2].y,pts[3].y));gr.addColorStop(0,col);gr.addColorStop(1,dark);g.fillStyle=gr;g.fill();
      // layers of earth, a stone or two and hanging roots
      g.strokeStyle='rgba(40,25,12,.35)';g.lineWidth=1;for(const f of [.45,.75]){const a=lvS(A[0],A[1],h[e0]*(1-f)+n0*f),b=lvS(B[0],B[1],h[e1]*(1-f)+n1*f);g.beginPath();g.moveTo(a.x,a.y+R()*2-1);g.lineTo(b.x,b.y+R()*2-1);g.stroke();}
      if(R()<.5){const f=.3+R()*.5,t=R(),p=lvS(A[0]+(B[0]-A[0])*t,A[1]+(B[1]-A[1])*t,(h[e0]*(1-f)+n0*f));g.fillStyle='#9a8f80';g.beginPath();g.ellipse(p.x,p.y,3.2,2.2,0,0,7);g.fill();}
      g.strokeStyle='rgba(70,45,20,.8)';g.lineWidth=1.1;for(let r=0;r<2;r++){const t=R(),top=lvS(A[0]+(B[0]-A[0])*t,A[1]+(B[1]-A[1])*t,h[e0]*(1-t)+h[e1]*t),len=6+R()*10;
        g.beginPath();g.moveTo(top.x,top.y+1);g.quadraticCurveTo(top.x+(R()*6-3),top.y+len*.5,top.x+(R()*4-2),top.y+len);g.stroke();}
      // the grass lip over the edge
      g.strokeStyle=lvHex(grass,26);g.lineWidth=3;g.lineCap='round';g.beginPath();g.moveTo(pts[0].x,pts[0].y+.5);g.lineTo(pts[1].x,pts[1].y+.5);g.stroke();
      g.strokeStyle=lvHex(grass,-30);g.lineWidth=1;for(let q=0;q<3;q++){const t=R(),p={x:pts[0].x+(pts[1].x-pts[0].x)*t,y:pts[0].y+(pts[1].y-pts[0].y)*t};g.beginPath();g.moveTo(p.x,p.y+1);g.lineTo(p.x+R()*2-1,p.y+4+R()*3);g.stroke();}};
    const dn=ty+1<L.Hh?i+W:-1,rt=tx+1<W?i+1:-1,nh=(j,e)=>j<0?0:hc[j*4+e];
    const wood=wt===2&&!L.log[i];
    face(3,2,nh(dn,0),nh(dn,1),wood?'#7a5430':'#8a6a42',wood?'#4a3018':'#5a4128');   // the face toward the bottom-left
    face(2,1,nh(rt,3),nh(rt,0),wood?'#6a4828':'#76583a',wood?'#402a14':'#4a3420');}  // the face toward the bottom-right
  return {cv,x:mnx,y:mny,w:cw,h:ch,dpr};}
function drawFeat(f){const dpr=typeof DPR==='number'&&DPR?DPR:1;if(!f.pic||f.pic.dpr!==dpr||f.pic.src!==Z.img){f.pic=lvPaint(Z,f);if(f.pic)f.pic.src=Z.img;}
  const p=f.pic;if(!p)return;if(p.x+p.w<camX-20||p.x>camX+VW+20||p.y+p.h<camY-20||p.y>camY+VH+20)return;ctx.drawImage(p.cv,p.x,p.y,p.w,p.h);}
// (v1.56.1) the land is part of the ground: drawn right after it, before anyone standing on it (js/render.js), so a
// slope never hides a hero walking round its edge
function drawLowLand(){const L=Z&&Z.lvd;if(!L)return;try{for(const f of L.feats)drawFeat(f);lvShimmer(L);}catch(e){}}
function drawCliff(){}
// a few glints drifting on the brook
function lvShimmer(L){if(!L.brookD||window.LITE)return;const W=L.W;ctx.fillStyle='rgba(255,255,255,.55)';
  for(let i=0;i<L.wet.length;i++){if(L.wet[i]!==1)continue;const x=i%W,y=(i/W)|0,ph=(x*7.3+y*3.1)%6.28,k=(now*.6+ph)%1;
    const p=lvS((x+.2+k*.6)*TILE,(y+.5+Math.sin(now+ph)*.25)*TILE,-L.brookD);if(p.x<camX-10||p.x>camX+VW+10||p.y<camY-10||p.y>camY+VH+10)continue;ctx.globalAlpha=Math.sin(k*3.14)*.8;ctx.fillRect(p.x-1.5,p.y-.5,3,1);}
  ctx.globalAlpha=1;}

/* ---- the brook: wading is slower, the near bank hides your feet, ripples round you ---- */
{const _me2=moveEnt;moveEnt=function(e,dx,dy,r){const L=Z&&Z.lvd;if(L&&L.brookD&&e){const i=lvTile(L,e.x,e.y);if(i>=0&&L.wet[i]===1){dx*=.62;dy*=.62;}}return _me2.call(this,e,dx,dy,r);};}
window.LV_IP=false;
{const _at=at;at=function(x,y,fn){const L=Z&&Z.lvd;if(!window.LV_IP||!L||!L.lo)return _at.apply(this,arguments);const i=lvTile(L,x,y);
  if(i<0||!(L.wet[i]===1||L.wet[i]===3||L.wet[i]===4))return _at.apply(this,arguments);
  const W=L.W,tx=i%W,ty=(i/W)|0,T=TILE,up=j=>j>=0&&L.hc[j*4]>L.hc[i*4]+LV_STEP;ctx.save();
  // only what shows above the near bank's edge (the bank toward the camera hides your feet)
  if(up(i+1)){const X=(tx+1)*T,a=lvS(X,-1e4,0),b=lvS(X,1e4,0);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.lineTo(b.x,b.y-1e5);ctx.lineTo(a.x,a.y-1e5);ctx.closePath();ctx.clip();}
  if(up(i+W)){const Y=(ty+1)*T,a=lvS(-1e4,Y,0),b=lvS(1e4,Y,0);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.lineTo(b.x,b.y-1e5);ctx.lineTo(a.x,a.y-1e5);ctx.closePath();ctx.clip();}
  try{_at.apply(this,arguments);if(L.wet[i]!==1)return;
    // the water round your legs
    const p=lvS(x,y,-L.brookD+3),w=13+Math.sin(now*4+x)*1.5;ctx.fillStyle='rgba(63,127,184,.5)';ctx.beginPath();ctx.ellipse(p.x,p.y,w,w*.42,0,0,7);ctx.fill();
    ctx.strokeStyle='rgba(255,255,255,.55)';ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(p.x,p.y,w+2,(w+2)*.42,0,0,7);ctx.stroke();}
  finally{ctx.restore();}};}

/* ---- a region gets its land when you enter it (after everything else has built it) ---- */
{const _ez=enterZone;enterZone=function(id){try{const z=getZone(id);if(z&&z.lvd===undefined)lvGen(z);}catch(e){console.warn('heights',e);}return _ez.apply(this,arguments);};}
// the Hopper Chieftain keeps its den on top of Chieftain's Knoll (its pack gathers round it)
{const _sm=spawnMob;spawnMob=function(type){const m=_sm.apply(this,arguments);try{const L=Z&&Z.lvd;if(!L||!m||!m.d)return m;
  // a boss keeps its den (the Hopper Chieftain on its knoll, the Wolf Alpha at the bottom of the Hollow)
  const den=L.dens.find(d=>d.mob===m.d.id);if(den){m.x=m.sx=den.x;m.y=m.sy=den.y;}
  // some live down in the land: the dewdrops in the brook, the web-spinners in the gully
  const dw=L.dwell.find(d=>d.mob===m.d.id);if(dw){const w=[];for(let i=0;i<L.wet.length;i++)if(L.wet[i]===dw.v&&!BLOCK[Z.t[i]])w.push(i);if(w.length){const i=w[Math.floor(Math.random()*w.length)];m.x=m.sx=(i%L.W+.5)*TILE;m.y=m.sy=(((i/L.W)|0)+.5)*TILE;}}}catch(e){}return m;};}
