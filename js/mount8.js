"use strict";
/* ================= mounts in 8 directions =================
   The mount's on-screen heading is followed (smoothed, kept when standing still) and snapped to one of 8 directions:
     right / left            the side drawing (mountart.js)
     the four diagonals      the side drawing turned toward the camera (down-right, down-left) or away (up-right, up-left)
     down (toward you)       a front view: chest, front legs and the face; the head is drawn over the rider's legs
     up (away from you)      a back view: haunches, tail and hind legs, with the ears showing past the rider
   The rider faces the way the mount goes (front view: facing you; back view: seen from behind). */
const M8={head:new Map()};
// 0 right, 1 down-right, 2 down, 3 down-left, 4 left, 5 up-left, 6 up, 7 up-right
function mountDir(key,p){let h=M8.head.get(key);const last=MART.lastPos.get(key);
  if(!h)h={sx:p.face<0?-1:1,sy:0,d:p.face<0?4:0};
  if(last){const dx=p.x-last.x,dy=p.y-last.y;if(Math.hypot(dx,dy)>.3){const sx=(dx-dy)*ISO,sy=(dx+dy)*ISO/2,n=Math.hypot(sx,sy)||1;h.sx+=(sx/n-h.sx)*.3;h.sy+=(sy/n-h.sy)*.3;}}
  // snap to 8 directions with a little hysteresis so it does not flicker between two
  const a=Math.atan2(h.sy,h.sx),want=((Math.round(a/(Math.PI/4))%8)+8)%8,cur=h.d,ca=cur*Math.PI/4;
  let diff=Math.abs(Math.atan2(Math.sin(a-ca),Math.cos(a-ca)));if(diff>Math.PI/8+.12)h.d=want;
  M8.head.set(key,h);return h.d;}
const _drawMountArt8=drawMountArt;
drawMountArt=function(p,k){const L=MOUNT_LOOK[k];if(!L)return 0;const key=p===P?'me':(p.name||'?');
  if(String(key).startsWith('icon:'))return _drawMountArt8(p,k);
  const d=mountDir(key,p);p._m8=d;
  if(d===2)return drawMountFront(p,k,key);
  if(d===6)return drawMountBack(p,k,key);
  // side and diagonals: the side drawing, facing the way it goes, turned toward or away from the camera
  const f=d===0||d===1||d===7?1:-1;MART.turn.set(key,d===1||d===3?.62:d===5||d===7?-.62:0);
  const f0=p.face;p.face=f;try{return _drawMountArt8(p,k);}finally{p.face=f0;}};
// mountTurn must not overwrite the snapped turn for the diagonals
mountTurn=function(key){return MART.turn.get(key)||0;};
function m8Grad(c,y0,y1,L){const g=c.createLinearGradient(0,y0,0,y1);g.addColorStop(0,L.light);g.addColorStop(.55,L.body);g.addColorStop(1,L.dark);return g;}
// ---------- front view (heading down, toward the camera) ----------
function drawMountFront(p,k,key){const L=MOUNT_LOOK[k],c=ctx,x=p.x,y=p.y,mv=!!p.moving,ph=mountPhase(key,p,k),OL='#2a1c14';
  if(mv&&Math.random()<.4)MART.dust.push({x:x+rnd(-8,8),y:y-2,t0:now,r:rnd(3,5)});
  shadow(x,y+1,k==='hopper'?18:17);c.save();c.lineJoin='round';c.lineCap='round';c.lineWidth=1.6;c.strokeStyle=OL;
  let lift,over;
  if(k==='hopper'){const air=mv?Math.max(0,Math.sin(ph)):0,by=y-20-air*6;
    c.fillStyle=L.dark;for(const s of [-1,1]){c.beginPath();c.ellipse(x+s*12,y-3-air*3,5,4,0,0,7);c.fill();c.stroke();}       // hind feet behind
    c.fillStyle=m8Grad(c,by-14,by+12,L);c.beginPath();c.ellipse(x,by,17,13,0,0,7);c.fill();c.stroke();                           // body
    c.fillStyle=L.belly;c.beginPath();c.ellipse(x,by+5,10,6,0,0,7);c.fill();
    for(const s of [-1,1]){const up=mv?Math.max(0,Math.sin(ph+(s>0?0:Math.PI)))*4:0;c.fillStyle=L.dark;c.beginPath();c.roundRect(x+s*6-2.5,by+6-up,5,12,2.5);c.fill();c.stroke();} // front paws
    drawSaddleFront(L,x,by-9);
    // the head and ears in front of the rider's legs
    over=()=>{c.save();c.lineJoin='round';c.lineWidth=1.6;c.strokeStyle=OL;const hy=by-2,flop=mv?Math.sin(ph-1)*.3:Math.sin(now*1.5)*.08;
      for(const s of [-1,1]){c.save();c.translate(x+s*6,hy-6);c.rotate(s*(1.05+flop*s));c.fillStyle=L.body;c.beginPath();c.ellipse(0,-9,3.6,10,0,0,7);c.fill();c.stroke();c.fillStyle='#e8a0a0';c.beginPath();c.ellipse(0,-9,1.6,6.5,0,0,7);c.fill();c.restore();}
      c.fillStyle=L.body;c.beginPath();c.ellipse(x,hy,9.5,8.5,0,0,7);c.fill();c.stroke();c.fillStyle=L.light;c.beginPath();c.ellipse(x,hy+3.5,5,3.5,0,0,7);c.fill();
      c.fillStyle=L.eye;for(const s of [-1,1]){c.beginPath();c.arc(x+s*4,hy-1.5,1.7,0,7);c.fill();}c.fillStyle='#fff';for(const s of [-1,1]){c.beginPath();c.arc(x+s*4+.5,hy-2.1,.55,0,7);c.fill();}
      c.fillStyle='#c86a6a';c.beginPath();c.arc(x,hy+2.6,1.4,0,7);c.fill();c.restore();};
    lift=22+air*6+6;}
  else{const bob=mv?Math.sin(ph*2)*1.4:Math.sin(now*2)*.4,by=y-26+bob;
    c.fillStyle=L.dark;for(const s of [-1,1]){const a=mv?Math.sin(ph+(s>0?Math.PI:0))*3:0;c.beginPath();c.roundRect(x+s*9-2.2,by+4,4.4,18+a*.3,2.2);c.fill();c.stroke();} // hind legs behind
    c.fillStyle=m8Grad(c,by-11,by+11,L);c.beginPath();c.ellipse(x,by,14,11,0,0,7);c.fill();c.stroke();
    c.fillStyle=L.belly;c.beginPath();c.ellipse(x,by+5,8,4.5,0,0,7);c.fill();
    for(const s of [-1,1]){const up=mv?Math.max(0,Math.sin(ph+(s>0?Math.PI*.5:Math.PI*1.5)))*4:0;c.fillStyle=L.body;c.beginPath();c.roundRect(x+s*5-2.6,by+6-up,5.2,20,2.6);c.fill();c.stroke();
      c.fillStyle=L.dark;c.beginPath();c.ellipse(x+s*5,by+26-up,3.4,2,0,0,7);c.fill();}
    drawSaddleFront(L,x,by-8);
    over=()=>{c.save();c.lineJoin='round';c.lineWidth=1.6;c.strokeStyle=OL;const hy=by-1;
      for(const s of [-1,1]){c.fillStyle=L.body;c.beginPath();c.moveTo(x+s*3,hy-6);c.lineTo(x+s*8,hy-15);c.lineTo(x+s*9,hy-4);c.closePath();c.fill();c.stroke();}
      c.fillStyle=L.mane;c.beginPath();c.ellipse(x,hy-3,10,6,0,0,7);c.fill();
      c.fillStyle=L.body;c.beginPath();c.ellipse(x,hy,8.5,7.5,0,0,7);c.fill();c.stroke();
      c.fillStyle=L.light;c.beginPath();c.ellipse(x,hy+4.5,4.6,4.4,0,0,7);c.fill();c.stroke();c.fillStyle='#1a1a20';c.beginPath();c.ellipse(x,hy+3.2,1.8,1.3,0,0,7);c.fill();
      c.fillStyle=L.eye;for(const s of [-1,1]){c.beginPath();c.ellipse(x+s*3.6,hy-1.6,1.6,1.2,0,0,7);c.fill();}c.restore();};
    lift=26-bob+8;}
  c.restore();M8.over=over;return lift;}
// ---------- back view (heading up, away from the camera) ----------
function drawMountBack(p,k,key){const L=MOUNT_LOOK[k],c=ctx,x=p.x,y=p.y,mv=!!p.moving,ph=mountPhase(key,p,k),OL='#2a1c14';
  if(mv&&Math.random()<.4)MART.dust.push({x:x+rnd(-8,8),y:y+1,t0:now,r:rnd(3,5)});
  shadow(x,y+1,k==='hopper'?18:17);c.save();c.lineJoin='round';c.lineCap='round';c.lineWidth=1.6;c.strokeStyle=OL;
  let lift;
  if(k==='hopper'){const air=mv?Math.max(0,Math.sin(ph)):0,by=y-20-air*6;
    // ears and the top of the head, beyond the body
    for(const s of [-1,1]){c.save();c.translate(x+s*4,by-14);c.rotate(s*.25);c.fillStyle=L.body;c.beginPath();c.ellipse(0,-9,3.6,10,0,0,7);c.fill();c.stroke();c.restore();}
    c.fillStyle=L.body;c.beginPath();c.ellipse(x,by-12,8,6,0,0,7);c.fill();c.stroke();
    c.fillStyle=m8Grad(c,by-14,by+12,L);c.beginPath();c.ellipse(x,by,17,13,0,0,7);c.fill();c.stroke();
    for(const s of [-1,1]){c.fillStyle=L.body;c.beginPath();c.ellipse(x+s*8,by+5,9,9,0,0,7);c.fill();c.stroke();}             // haunches
    for(const s of [-1,1]){const st=mv?6+air*5:6;c.fillStyle=L.dark;c.beginPath();c.ellipse(x+s*10,y-3-air*2,5,st*.5,0,0,7);c.fill();c.stroke();}
    c.fillStyle=L.belly;c.beginPath();c.arc(x,by+3,5,0,7);c.fill();c.stroke();                                                      // tail puff
    drawSaddleBack(L,x,by-9);lift=22+air*6+6;}
  else{const bob=mv?Math.sin(ph*2)*1.4:Math.sin(now*2)*.4,by=y-26+bob;
    for(const s of [-1,1]){c.fillStyle=L.body;c.beginPath();c.moveTo(x+s*2,by-16);c.lineTo(x+s*6,by-25);c.lineTo(x+s*8,by-15);c.closePath();c.fill();c.stroke();} // ears
    c.fillStyle=L.mane;c.beginPath();c.ellipse(x,by-13,8,5,0,0,7);c.fill();c.stroke();
    c.fillStyle=m8Grad(c,by-11,by+11,L);c.beginPath();c.ellipse(x,by,14,11,0,0,7);c.fill();c.stroke();
    for(const s of [-1,1]){const a=mv?Math.sin(ph+(s>0?0:Math.PI))*3:0;c.fillStyle=L.body;c.beginPath();c.ellipse(x+s*6,by+4,7,8,0,0,7);c.fill();c.stroke();
      c.beginPath();c.roundRect(x+s*7-2.4,by+8,4.8,17+a*.3,2.4);c.fill();c.stroke();c.fillStyle=L.dark;c.beginPath();c.ellipse(x+s*7,by+25,3.2,1.9,0,0,7);c.fill();}
    const tw=mv?Math.sin(ph*1.5)*4:Math.sin(now*2)*1.5;c.fillStyle=L.mane;c.beginPath();c.moveTo(x-3,by+2);c.quadraticCurveTo(x+tw,by+14,x+tw*1.5,by+20);c.quadraticCurveTo(x+3+tw*.5,by+12,x+3,by+2);c.closePath();c.fill();c.stroke(); // tail
    drawSaddleBack(L,x,by-8);lift=26-bob+8;}
  c.restore();M8.over=null;return lift;}
// the saddle seen from the front / back: blanket flaps on both sides, gold trim, the seat
function drawSaddleFront(L,x,sy){const c=ctx;c.lineWidth=1.3;c.strokeStyle='#2a1c14';
  for(const s of [-1,1]){c.fillStyle=L.blanket;c.beginPath();c.moveTo(x+s*4,sy-2);c.lineTo(x+s*13,sy);c.lineTo(x+s*12,sy+10);c.lineTo(x+s*5,sy+9);c.closePath();c.fill();c.stroke();
    c.strokeStyle=L.trim;c.lineWidth=1.4;c.beginPath();c.moveTo(x+s*12,sy+8);c.lineTo(x+s*5,sy+7.5);c.stroke();c.strokeStyle='#2a1c14';c.lineWidth=1.3;}
  c.fillStyle='#5a3a22';c.beginPath();c.ellipse(x,sy-1,8,3.4,0,0,7);c.fill();c.stroke();}
function drawSaddleBack(L,x,sy){drawSaddleFront(L,x,sy);}
// the mount's head in the front view goes over the rider's legs
{const _dp8=drawPlayer;drawPlayer=function(){M8.over=null;const r=_dp8.apply(this,arguments);if(M8.over){const f=M8.over;M8.over=null;try{f();}catch(e){}}return r;};}
// the rider faces the way the mount goes: facing you when it heads down, seen from behind when it heads up
{const _dp8b=drawPlayer;drawPlayer=function(p,wid){const k=p&&(p===P?(typeof riding==='function'&&riding()?P.riding:null):p.riding);
  if(k&&MOUNT_LOOK[k]&&p&&p._m8!==undefined){const d=p._m8,b0=p.back,f0=p.face;p.back=d===5||d===6||d===7;p.face=d===0||d===1||d===7?1:d===2||d===6?(f0||1):-1;
    try{return _dp8b.call(this,p,wid);}finally{p.back=b0;p.face=f0;}}
  return _dp8b.apply(this,arguments);};}
