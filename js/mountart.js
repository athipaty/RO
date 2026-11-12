"use strict";
/* ================= mount artwork =================
   Mounts get their own drawings instead of scaled-up monsters:
     Meadow Hopper  a big soft long-eared steed that bounds along (ears flop, tail puff)
     Grey Lupe      a sleek wolf steed in a four-beat gallop, flowing mane and tail
   Both: shading, a saddle blanket with gold trim, stirrups and reins. The stride follows how far you
   actually move (so it never slides), riders bob with the stride, a dust trail kicks up behind, and
   mounting up throws a little burst of sparkles. All original artwork, drawn in code. */
const MART={dust:[],spark:[],phase:new Map(),lastPos:new Map()};
const MOUNT_LOOK={
  hopper:{body:'#d8b48a',dark:'#a8835a',light:'#f2dcbc',belly:'#f6ead6',mane:'#8a6a42',blanket:'#8e2a22',trim:'#e8c25a',eye:'#3a2414'},
  greylupe:{body:'#8a909c',dark:'#5e646e',light:'#b8bec8',belly:'#d4d8de',mane:'#4a4e58',blanket:'#2e4f8e',trim:'#e8c25a',eye:'#ffcf5a'}};
// stride phase from distance actually moved (per rider)
function mountPhase(key,p,k){const last=MART.lastPos.get(key),d=last?Math.hypot(p.x-last.x,p.y-last.y):0;MART.lastPos.set(key,{x:p.x,y:p.y});
  const per=k==='hopper'?46:38;let ph=(MART.phase.get(key)||0)+Math.min(d,30)/per*Math.PI*2;if(!p.moving&&d<.2)ph+=(Math.round(ph/Math.PI)*Math.PI-ph)*.15;MART.phase.set(key,ph);return ph;}
function drawMountArt(p,k){const L=MOUNT_LOOK[k];if(!L)return 0;const key=p===P?'me':(p.name||'?'),f=p.face<0?-1:1,ph=mountPhase(key,p,k),mv=!!p.moving;
  const x=p.x,y=p.y,c=ctx;c.save();c.lineJoin='round';c.lineCap='round';
  // dust behind the hind feet while running
  if(mv&&Math.random()<.5)MART.dust.push({x:x-f*16+rnd(-3,3),y:y-1+rnd(-2,2),t0:now,r:rnd(3,6)});
  shadow(x,y+1,k==='hopper'?22:24);
  const OL='#2a1c14',S=(fn)=>{c.save();c.translate(x,y);c.scale(f,1);fn();c.restore();};
  let lift;
  if(k==='hopper'){
    // a bounding gait: up in the air mid-stride, crouched on landing
    const air=mv?Math.max(0,Math.sin(ph)):0,squash=mv?Math.max(0,-Math.sin(ph))*.12:0,by=-22-air*7;
    S(()=>{c.lineWidth=1.6;c.strokeStyle=OL;
      // hind legs: tucked when landing, stretched in the air
      const hx=-11,hl=mv?6+air*7:6;c.fillStyle=L.dark;c.beginPath();c.ellipse(hx-air*4,by+12+hl*.4,5,hl,.3+air*.6,0,7);c.fill();c.stroke();
      // body with shading
      c.save();c.translate(0,by);c.scale(1+squash,1-squash);
      const g=c.createLinearGradient(0,-14,0,12);g.addColorStop(0,L.light);g.addColorStop(.55,L.body);g.addColorStop(1,L.dark);
      c.fillStyle=g;c.beginPath();c.ellipse(-2,0,21,13,-.08,0,7);c.fill();c.stroke();
      c.fillStyle=L.belly;c.beginPath();c.ellipse(4,7,11,5,0,0,7);c.fill();
      // haunch
      c.fillStyle=L.body;c.beginPath();c.ellipse(-12,1,11,11,0,0,7);c.fill();c.stroke();c.fillStyle='rgba(255,255,255,.18)';c.beginPath();c.ellipse(-14,-4,5,3,-.4,0,7);c.fill();
      c.restore();
      // front legs reach forward in the air
      c.fillStyle=L.dark;for(const k2 of [0,1]){const a=mv?-.5*air+k2*.25:.1*k2;c.save();c.translate(10+k2*3,by+8);c.rotate(a);c.beginPath();c.roundRect(-2.5,0,5,12,2.5);c.fill();c.stroke();c.restore();}
      // tail puff
      c.fillStyle=L.belly;c.beginPath();c.arc(-23,by-3,5,0,7);c.fill();c.stroke();
      // head, cheek and long ears that flop with the stride
      const hy=by-12;c.fillStyle=L.body;c.beginPath();c.ellipse(17,hy,10,9,.15,0,7);c.fill();c.stroke();
      c.fillStyle=L.light;c.beginPath();c.ellipse(20,hy+3,5,4,0,0,7);c.fill();
      const flop=mv?Math.sin(ph-1)*.35:Math.sin(now*1.5)*.08;
      for(const [ex,ea] of [[13,-.45],[17,-.15]]){c.save();c.translate(ex,hy-6);c.rotate(ea+flop);c.fillStyle=L.body;c.beginPath();c.ellipse(0,-11,4,12,0,0,7);c.fill();c.stroke();c.fillStyle='#e8a0a0';c.beginPath();c.ellipse(0,-11,1.8,8,0,0,7);c.fill();c.restore();}
      c.fillStyle=L.eye;c.beginPath();c.arc(21,hy-2,1.8,0,7);c.fill();c.fillStyle='#fff';c.beginPath();c.arc(21.6,hy-2.6,.6,0,7);c.fill();
      c.fillStyle='#c86a6a';c.beginPath();c.arc(26.5,hy+1,1.4,0,7);c.fill();
      drawSaddle(L,-2,by-12,f);});
    lift=22+(mv?Math.max(0,Math.sin(ph))*7:0)+8;
  } else {
    // a four-beat gallop: each leg swings on its own beat; the body rises and dips with the stride
    const bob=mv?Math.sin(ph*2)*1.6:Math.sin(now*2)*.4,by=-27+bob;
    S(()=>{c.lineWidth=1.6;c.strokeStyle=OL;
      const leg=(lx,beat,far)=>{const a=mv?Math.sin(ph+beat)*.65:0,bend=mv?Math.max(0,Math.sin(ph+beat+1.4))*.9:0;
        c.save();c.translate(lx,by+6);c.rotate(a);c.fillStyle=far?L.dark:L.body;c.beginPath();c.roundRect(-2.6,0,5.2,11,2.6);c.fill();c.stroke();
        c.translate(0,10);c.rotate(-bend*(lx>0?1:-1)*.8);c.beginPath();c.roundRect(-2.2,0,4.4,10,2.2);c.fill();c.stroke();c.fillStyle=L.dark;c.beginPath();c.ellipse(1,10,3.4,2,0,0,7);c.fill();c.restore();};
      leg(-13,Math.PI,true);leg(12,Math.PI*1.5,true);
      // tail streams back, waving with the stride
      const tw=mv?Math.sin(ph*1.5)*5:Math.sin(now*2)*2;c.fillStyle=L.mane;c.beginPath();c.moveTo(-20,by-4);c.quadraticCurveTo(-34,by-10+tw,-40,by-2+tw*1.4);c.quadraticCurveTo(-31,by+2+tw*.5,-19,by+2);c.closePath();c.fill();c.stroke();
      // body with shading
      const g=c.createLinearGradient(0,by-12,0,by+10);g.addColorStop(0,L.light);g.addColorStop(.55,L.body);g.addColorStop(1,L.dark);
      c.fillStyle=g;c.beginPath();c.ellipse(-2,by,22,10.5,-.04,0,7);c.fill();c.stroke();
      c.fillStyle=L.belly;c.beginPath();c.ellipse(4,by+6,12,4,0,0,7);c.fill();
      c.fillStyle=L.body;c.beginPath();c.ellipse(14,by-2,11,11,0,0,7);c.fill();c.stroke(); // chest
      leg(-9,0,false);leg(15,Math.PI*.5,false);
      // neck, head and snout
      const hy=by-13;c.fillStyle=L.body;c.beginPath();c.moveTo(12,by-8);c.lineTo(20,hy-4);c.lineTo(28,hy+2);c.lineTo(20,by+2);c.closePath();c.fill();
      c.beginPath();c.ellipse(25,hy,8.5,7,.1,0,7);c.fill();c.stroke();
      c.fillStyle=L.light;c.beginPath();c.moveTo(29,hy-2);c.quadraticCurveTo(38,hy+1,37,hy+4);c.quadraticCurveTo(32,hy+6,28,hy+5);c.closePath();c.fill();c.stroke();
      c.fillStyle='#1a1a20';c.beginPath();c.arc(37,hy+3,1.6,0,7);c.fill();
      for(const [ex,ea] of [[21,-.2],[25,.1]]){c.save();c.translate(ex,hy-5);c.rotate(ea);c.fillStyle=L.body;c.beginPath();c.moveTo(-3,0);c.lineTo(0,-9);c.lineTo(3,0);c.closePath();c.fill();c.stroke();c.restore();}
      c.fillStyle=L.eye;c.beginPath();c.ellipse(28,hy-2,1.8,1.4,0,0,7);c.fill();
      // mane: strands along the neck, streaming in the wind
      c.fillStyle=L.mane;for(let i=0;i<5;i++){const sx=10+i*3,sy=by-9-i*1.8,w=mv?Math.sin(ph*1.5+i)*2.2:Math.sin(now*2+i)*.8;c.beginPath();c.moveTo(sx,sy);c.quadraticCurveTo(sx-6,sy-3+w,sx-10,sy+1+w);c.quadraticCurveTo(sx-5,sy+2,sx+2,sy+2);c.closePath();c.fill();}
      drawSaddle(L,-1,by-10,f);});
    lift=27-bob+10;
  }
  c.restore();return lift;}
// saddle blanket with gold trim, the seat, a stirrup and reins (drawn in the mount's local, facing-flipped space)
function drawSaddle(L,sx,sy,f){const c=ctx;c.lineWidth=1.3;c.strokeStyle='#2a1c14';
  c.fillStyle=L.blanket;c.beginPath();c.moveTo(sx-11,sy-1);c.quadraticCurveTo(sx,sy-5,sx+11,sy-1);c.lineTo(sx+9,sy+9);c.quadraticCurveTo(sx,sy+11,sx-9,sy+9);c.closePath();c.fill();c.stroke();
  c.strokeStyle=L.trim;c.lineWidth=1.6;c.beginPath();c.moveTo(sx-9,sy+7);c.quadraticCurveTo(sx,sy+9,sx+9,sy+7);c.stroke();
  c.fillStyle='#5a3a22';c.strokeStyle='#2a1c14';c.lineWidth=1.2;c.beginPath();c.ellipse(sx,sy-3,8,3.4,0,0,7);c.fill();c.stroke();
  c.strokeStyle='#3a2a1a';c.lineWidth=1;c.beginPath();c.moveTo(sx+2,sy+2);c.lineTo(sx+3,sy+13);c.stroke();c.strokeStyle=L.trim;c.lineWidth=1.4;c.beginPath();c.arc(sx+3,sy+14,1.8,0,7);c.stroke();
  c.strokeStyle='#5a3a22';c.lineWidth=1;c.beginPath();c.moveTo(sx+6,sy-3);c.quadraticCurveTo(sx+16,sy-2,sx+24,sy-8);c.stroke();}
// dust and sparkles: drawn on the ground under everyone
function drawMountFx(){if(!MART.dust.length&&!MART.spark.length)return;
  MART.dust=MART.dust.filter(d=>now-d.t0<.6);MART.spark=MART.spark.filter(s=>now-s.t0<s.dur);
  for(const d of MART.dust){const a=(now-d.t0)/.6;at(d.x,d.y,()=>{ctx.fillStyle=`rgba(200,180,140,${.35*(1-a)})`;ctx.beginPath();ctx.ellipse(d.x,d.y-a*6,d.r*(1+a),d.r*.55*(1+a),0,0,7);ctx.fill();});}
  for(const s of MART.spark){const a=(now-s.t0)/s.dur,xx=s.x+Math.cos(s.a)*s.v*a,yy=s.y-30+Math.sin(s.a)*s.v*a*.6-a*14;
    at(s.x,s.y,()=>{ctx.fillStyle=`rgba(255,231,160,${1-a})`;ctx.save();ctx.translate(xx,yy);ctx.rotate(a*4);ctx.fillRect(-1.5,-1.5,3,3);ctx.restore();});}}
// mounting up: a burst of sparkles
const _mountUpArt=mountUp;
mountUp=function(k){const was=P&&P.riding;const r=_mountUpArt.apply(this,arguments);
  if(P&&P.riding&&!was){for(let i=0;i<22;i++)MART.spark.push({x:P.x,y:P.y,t0:now,dur:rnd(.5,.9),a:rnd(0,6.28),v:rnd(18,46)});fx.push({k:'ring',x:P.x,y:P.y,r:44,col:'#ffcf5a',t0:now,dur:.6});}
  return r;};
// use the new artwork for every rider
drawMount=function(p,k){return MOUNT_LOOK[k]?drawMountArt(p,k):0;};
if(typeof drawGround==='function'){const _drawGroundArt=drawGround;drawGround=function(){_drawGroundArt.apply(this,arguments);drawMountFx();};}
// the stable's little pictures use the new artwork too
mountIconURL=function(k){if(MOUNT_ICON[k+':art'])return MOUNT_ICON[k+':art'];const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d'),main=ctx;
  ctx=g;try{g.translate(30,56);g.scale(.85,.85);drawMountArt({x:0,y:0,face:1,moving:false,name:'icon:'+k},k);}catch(e){}finally{ctx=main;}return MOUNT_ICON[k+':art']=c.toDataURL();};
