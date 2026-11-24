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

   Z.lvd = {W, Hh, H (highest), hc: Float32Array(W*Hh*4) corner heights [top-left, top-right, bottom-right, bottom-left],
            hills, nodes, den} */
const LV_STEP=6; // the largest height difference you can step across at a tile edge (screen px)
const LV_DESIGNS={
  meadow:{hills:[
    {name:"Chieftain's Knoll",cx:50.5,cy:8.5,rx:10,ry:6.5,H:58,top:.32,bank:{ax:'y',at:.42},oak:[51,7],den:[49,8]},
    {name:'Lookout Hill',cx:12.5,cy:9.5,rx:7.5,ry:5.5,H:38,top:.3,bank:{ax:'x',at:.5}},
    {name:'South Rise',cx:15.5,cy:35,rx:9,ry:5.5,H:42,top:.25}]}};
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
  for(let h=L.H;h>=0;h-=2){const w=unprojFlat(sx,sy+h),g=lvH(L,w.x,w.y);if(Math.abs(g-h)<=1.6)return w;if(g>h+1.6&&prev)return prev;prev=w;}
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
  const W=z.w,H=z.h,hc=new Float32Array(W*H*4),L={W,Hh:H,H:0,hc,hills:[],nodes:[],den:null};
  for(const h of des.hills){const own=[];let x0=1e9,y0=1e9,x1=-1,y1=-1;
    for(let ty=Math.max(1,Math.floor(h.cy-h.ry));ty<=Math.min(H-2,Math.ceil(h.cy+h.ry));ty++)for(let tx=Math.max(1,Math.floor(h.cx-h.rx));tx<=Math.min(W-2,Math.ceil(h.cx+h.rx));tx++){
      // the bank: past this line the hill is cut off sharply (its face looks toward you)
      if(h.bank){const off=h.bank.ax==='y'?(ty+.5-h.cy)/h.ry:(tx+.5-h.cx)/h.rx;if(off>h.bank.at)continue;}
      const c=[lvHill(h,tx,ty),lvHill(h,tx+1,ty),lvHill(h,tx+1,ty+1),lvHill(h,tx,ty+1)];if(!(c[0]||c[1]||c[2]||c[3]))continue;
      const i=(ty*W+tx)*4;for(let k=0;k<4;k++)hc[i+k]=Math.max(hc[i+k],c[k]);own.push(ty*W+tx);x0=Math.min(x0,tx);y0=Math.min(y0,ty);x1=Math.max(x1,tx);y1=Math.max(y1,ty);}
    if(!own.length)continue;L.H=Math.max(L.H,h.H);
    const hill={...h,tiles:own,x:x0,y:y0,w:x1-x0+1,hh:y1-y0+1};L.hills.push(hill);
    L.nodes.push({cliff:'hill',ref:hill,x:x0,y:y0,w:x1-x0+1,h:y1-y0+1,on:(px,py)=>lvH(L,px,py)>.5});
    // the old oak on the top (a tree tile, so nobody walks through it); the chieftain's den beside it
    if(h.oak){const [ox,oy]=h.oak;z.t[oy*W+ox]=2;z.objs.push({x:(ox+.5)*TILE,y:(oy+.5)*TILE,kind:'tree',v:1,sc:1.75,oak:1});}
    if(h.den)L.den={x:(h.den[0]+.5)*TILE,y:(h.den[1]+.5)*TILE};}
  if(!L.hills.length)return;
  z.lvd=L;lvMini(z);}
// the minimap: higher ground a little lighter, banks dark
function lvMini(z){const L=z.lvd,m=z.mini&&z.mini.getContext&&z.mini.getContext('2d');if(!L||!m)return;
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
  for(const i of hill.tiles){const tx=i%W,ty=(i/W)|0;for(const [cx,cy] of [[tx,ty],[tx+1,ty],[tx+1,ty+1],[tx,ty+1]]){const s=lvS(cx*T,cy*T,0);mnx=Math.min(mnx,s.x);mxx=Math.max(mxx,s.x);mny=Math.min(mny,s.y-L.H-4);mxy=Math.max(mxy,s.y+4);}}
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
    const dhx=((h[1]-h[0])+(h[2]-h[3]))/2/T,dhy=((h[3]-h[0])+(h[2]-h[1]))/2/T,sh=(dhx-dhy)*.95+((h[0]+h[2])/2/L.H)*.07;
    tri([C[0],C[1],C[2]],[S[0],S[1],S[2]],sh);tri([C[0],C[2],C[3]],[S[0],S[2],S[3]],sh);
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
    face(3,2,nh(dn,0),nh(dn,1),'#8a6a42','#5a4128');   // the face toward the bottom-left
    face(2,1,nh(rt,3),nh(rt,0),'#76583a','#4a3420');}  // the face toward the bottom-right
  return {cv,x:mnx,y:mny,w:cw,h:ch,dpr};}
function drawHill(hill){const dpr=typeof DPR==='number'&&DPR?DPR:1;if(!hill.pic||hill.pic.dpr!==dpr||hill.pic.src!==Z.img){hill.pic=lvPaint(Z,hill);if(hill.pic)hill.pic.src=Z.img;}
  const p=hill.pic;if(!p)return;if(p.x+p.w<camX-20||p.x>camX+VW+20||p.y+p.h<camY-20||p.y>camY+VH+20)return;ctx.drawImage(p.cv,p.x,p.y,p.w,p.h);}
function drawCliff(n){try{if(n.cliff==='hill')drawHill(n.ref);}catch(e){}}

/* ---- a region gets its land when you enter it (after everything else has built it) ---- */
{const _ez=enterZone;enterZone=function(id){try{const z=getZone(id);if(z&&z.lvd===undefined)lvGen(z);}catch(e){console.warn('heights',e);}return _ez.apply(this,arguments);};}
// the Hopper Chieftain keeps its den on top of Chieftain's Knoll (its pack gathers round it)
{const _sm=spawnMob;spawnMob=function(type){const m=_sm.apply(this,arguments);try{const L=Z&&Z.lvd;if(L&&L.den&&m&&m.d&&m.d.id==='hopperchief'){m.x=m.sx=L.den.x;m.y=m.sy=L.den.y;}}catch(e){}return m;};}
