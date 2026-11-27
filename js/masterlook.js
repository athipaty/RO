"use strict";
/* ================= master regalia (v1.68.0) =================
   A master calling should look worth the long climb. Its outfit is its own (js/outfits_warden.js for the Warden family);
   on top of that every master gets a turning rune circle under the feet, and a few touches drawn around the body,
   never on or above the head (hats, masks and mouth gear stay clear): no wings, no capes.
     Aegis Lord   three small gold shields circling at the waist (the Bulwark carries one tower shield instead), gold motes
     Warbringer   embers drifting up beside the shoulder plates */
{const glowOn=(c,b)=>{ctx.shadowColor=c;ctx.shadowBlur=b;},glowOff=()=>{ctx.shadowBlur=0;};
  // the turning rune circle under a master's feet
  JBACK.sigil=function(x,y,by,f,o){const a=now*.5;ctx.save();ctx.translate(x,y+1);ctx.scale(1,.36);
    ctx.globalAlpha=.5;ctx.strokeStyle=o.c;ctx.lineWidth=1.8;ctx.beginPath();ctx.arc(0,0,21,0,7);ctx.stroke();
    ctx.globalAlpha=.85;ctx.fillStyle=o.t||o.c;for(let i=0;i<4;i++){const t=a+i*Math.PI/2;ctx.save();ctx.translate(Math.cos(t)*21,Math.sin(t)*21);ctx.rotate(t);ctx.beginPath();ctx.moveTo(0,-3);ctx.lineTo(2,0);ctx.lineTo(0,3);ctx.lineTo(-2,0);ctx.closePath();ctx.fill();ctx.restore();}
    ctx.restore();};
  // sparks rising beside the body: from the shoulders up, fading before the head's height, always outside the face
  const motes=(x,by,c,n)=>{ctx.save();for(let i=0;i<n;i++){const q=(now*.45+i/n)%1,side=i%2?1:-1,px=x+side*(17.5+Math.sin(i*2.3+now*1.3)*2),py=by-4-q*20;
      ctx.globalAlpha=.9*(1-q);ctx.fillStyle=c;glowOn(c,4);ctx.fillRect(px-1,py-1,2.2,2.2);}glowOff();ctx.restore();};
  // three small gold shields circling at the waist: dimmed on the far side
  JSIDE.aegisorbit=function(x,y,by,f,o){for(let i=0;i<3;i++){const a=now*1.1+i*Math.PI*2/3,ox=x+Math.cos(a)*19,oy=by+1+Math.sin(a)*5,front=Math.sin(a)>0;
      ctx.save();ctx.globalAlpha=front?1:.45;ctx.translate(ox,oy);ctx.scale(.75+.25*Math.abs(Math.cos(a)),1);
      ctx.fillStyle=o.gold;ctx.strokeStyle='#2a1c14';ctx.lineWidth=1;glowOn('#fff0a0',front?5:0);ctx.beginPath();ctx.moveTo(-3.4,-3.6);ctx.lineTo(3.4,-3.6);ctx.lineTo(3.2,.6);ctx.quadraticCurveTo(0,4.6,-3.2,.6);ctx.closePath();ctx.fill();ctx.stroke();glowOff();
      ctx.fillStyle=o.gem;ctx.beginPath();ctx.arc(0,-.8,1.2,0,7);ctx.fill();ctx.restore();}
    motes(x,by,o.glow,6);};
  JSIDE.embers=function(x,y,by,f,o){motes(x,by,o.c,8);};
  /* the Aegis Lord's sun shield: big and round (the Bulwark's is a grey upright slab), a thick gold rim, a white face,
     gold rays to the rim, a glowing sky gem at the boss and a slow shine. Carried on the far side, behind the body and
     head, so it never covers the face. */
  JBACK.sunshield=function(x,y,by,f,o){const cx=x-f*20,cy=by-4,R=15;ctx.save();ctx.translate(cx,cy);ctx.scale(.86,1);
    ctx.fillStyle=o.rim;ctx.strokeStyle='#2a1c14';ctx.lineWidth=1.6;ctx.beginPath();ctx.arc(0,0,R,0,7);ctx.fill();ctx.stroke();
    ctx.fillStyle=o.face;ctx.lineWidth=1;ctx.beginPath();ctx.arc(0,0,R-3.2,0,7);ctx.fill();ctx.stroke();
    ctx.fillStyle=o.rim;for(let i=0;i<8;i++){const a=i*Math.PI/4;ctx.save();ctx.rotate(a);ctx.beginPath();ctx.moveTo(-1.6,-4.4);ctx.lineTo(0,-(R-3.4));ctx.lineTo(1.6,-4.4);ctx.closePath();ctx.fill();ctx.restore();}
    ctx.fillStyle=o.rim;ctx.strokeStyle='#2a1c14';ctx.lineWidth=1.1;ctx.beginPath();ctx.arc(0,0,4.6,0,7);ctx.fill();ctx.stroke();
    glowOn(o.gem,7);ctx.fillStyle=o.gem;ctx.beginPath();ctx.arc(0,0,2.4,0,7);ctx.fill();glowOff();
    ctx.fillStyle='rgba(255,255,255,.85)';ctx.beginPath();ctx.arc(-.8,-.8,.8,0,7);ctx.fill();
    // a slow shine sweeping across the face
    ctx.save();ctx.beginPath();ctx.arc(0,0,R-3.2,0,7);ctx.clip();const s=((now*.35)%1)*2-1;ctx.globalAlpha=.35*(1-Math.abs(s));ctx.fillStyle='#ffffff';ctx.rotate(-.6);ctx.fillRect(s*R*1.4-2.5,-R,5,R*2);ctx.restore();
    ctx.restore();};
  // the Warden masters: their own outfits, a soft aura and the rune circle (simple reads better on a phone); the Aegis Lord's sun shield
  JOB_LOOK.aegislord={aura:'#ffd76a',b:[['sigil',{c:'#ffd76a',t:'#fff3c0'}]]}; // the sun shield is held in the hand (js/outfits_warden.js)
  // (swapped) the Warbringer wears the barbarian look with spikes and a cape, plus the master's rune circle; the Ravager the plain black iron
  JOB_LOOK.warbringer={aura:'#ff2a3a',s:[['spikes',{c:'#4a2a24',t:'#d8d0c0'}]],b:[['sigil',{c:'#ff2a3a',t:'#ff8a8a'}],['cape',{c:'#7a1e18',t:'#2a1410'}]]};
  JOB_LOOK.ravager={};
  /* ---- the falcon (v1.69.0): one real bird of prey for the Falconer (perched on its shoulder) and the Skywarden (in
     the air): pointed swept-back wings with feather tips, a fan tail, a hooked beak, a dark mark under the eye, yellow
     feet. Drawn facing f; s is its size. */
  function drawFalcon(cx,cy,s,f,c,mode,flap,tilt){const OL='#2a1c14';ctx.save();ctx.translate(cx,cy);ctx.rotate(tilt||0);ctx.scale(f*s,s);ctx.lineJoin='round';ctx.lineWidth=1/s*1.1;ctx.strokeStyle=OL;
    const wing=(sh,up,col)=>{const ty=-1.2-up*5.2;ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(1.5,-1.2);ctx.quadraticCurveTo(-2,ty-1.6,-9.5,ty);
      for(let i=0;i<4;i++){const u=i/3;ctx.lineTo(-9.5+u*6-1.2,ty+1.8+u*1.6);ctx.lineTo(-9.5+u*6+.6,ty+1.2+u*1.8);} // feather tips
      ctx.quadraticCurveTo(-1,.4+sh,1.6,1);ctx.closePath();ctx.fill();ctx.stroke();
      ctx.fillStyle=c.tip;ctx.beginPath();ctx.moveTo(-9.5,ty);ctx.lineTo(-6.2,ty+.4);ctx.lineTo(-8,ty+2.4);ctx.closePath();ctx.fill();};
    if(mode==='fly'){
      wing(0,flap*.85+.15,c.wing2); // the far wing, behind
      ctx.fillStyle=c.body;ctx.beginPath();ctx.moveTo(-4.6,-.6);ctx.lineTo(-9.4,-2.6);ctx.lineTo(-9.8,1.4);ctx.lineTo(-4.6,1.4);ctx.closePath();ctx.fill();ctx.stroke(); // fan tail
      ctx.fillStyle=c.tip;ctx.fillRect(-9.6,-2.2,1,3.2);
      ctx.fillStyle=c.body;ctx.beginPath();ctx.ellipse(0,0,5.4,2.9,0,0,7);ctx.fill();ctx.stroke();
      ctx.fillStyle=c.belly;ctx.beginPath();ctx.ellipse(.6,1,3.6,1.5,0,0,Math.PI);ctx.fill();
      ctx.fillStyle=c.leg;ctx.beginPath();ctx.ellipse(-.6,2.8,1.4,.8,0,0,7);ctx.fill(); // feet tucked under
      ctx.fillStyle=c.body;ctx.beginPath();ctx.arc(5.2,-1.6,2.7,0,7);ctx.fill();ctx.stroke(); // head
      wing(1,flap,c.wing);} // the near wing, in front
    else{ // perched: upright, wings folded, tail down, feet gripping
      ctx.fillStyle=c.body;ctx.beginPath();ctx.moveTo(-1.6,4);ctx.lineTo(-2.6,10.4);ctx.lineTo(1,10.4);ctx.lineTo(1.2,4);ctx.closePath();ctx.fill();ctx.stroke();
      ctx.fillStyle=c.tip;ctx.fillRect(-2.5,9.2,3.4,1.1);
      ctx.fillStyle=c.body;ctx.beginPath();ctx.ellipse(0,1,3.6,5.2,.12,0,7);ctx.fill();ctx.stroke();
      ctx.fillStyle=c.belly;ctx.beginPath();ctx.ellipse(1,1.6,2,3.6,.12,0,7);ctx.fill();
      ctx.strokeStyle='rgba(0,0,0,.25)';ctx.lineWidth=.5/s*1.4;for(const yy of [0,1.6,3.2]){ctx.beginPath();ctx.moveTo(.2,yy);ctx.lineTo(2,yy+.4);ctx.stroke();}ctx.strokeStyle=OL;ctx.lineWidth=1/s*1.1;
      ctx.fillStyle=c.wing;ctx.beginPath();ctx.moveTo(-.4,-3.2);ctx.quadraticCurveTo(-4.4,-.6,-3,7.6);ctx.quadraticCurveTo(-.6,4,.2,-2);ctx.closePath();ctx.fill();ctx.stroke(); // folded wing
      ctx.fillStyle=c.tip;ctx.beginPath();ctx.moveTo(-3.6,5.6);ctx.lineTo(-3,7.6);ctx.lineTo(-1.8,5.8);ctx.closePath();ctx.fill();
      ctx.fillStyle=c.leg;for(const d of [-1.2,1.2]){ctx.beginPath();ctx.ellipse(d,6.2,1,.7,0,0,7);ctx.fill();}
      ctx.fillStyle=c.body;ctx.beginPath();ctx.arc(.6,-5.2,2.9,0,7);ctx.fill();ctx.stroke();
      ctx.translate(-4.6,-3.6);} // so the head details below line up with the perched head
    // head details: the hooked beak, the eye, the dark mark under it
    const hx=mode==='fly'?5.2:5.2,hy=mode==='fly'?-1.6:-1.6;
    ctx.fillStyle=c.beak;ctx.beginPath();ctx.moveTo(hx+2.2,hy-1);ctx.quadraticCurveTo(hx+4.6,hy-.6,hx+4,hy+1.4);ctx.lineTo(hx+2.4,hy+.6);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.fillStyle=c.mark;ctx.beginPath();ctx.moveTo(hx+.6,hy-.4);ctx.quadraticCurveTo(hx+1.6,hy+1.6,hx+.4,hy+2.4);ctx.lineTo(hx-.4,hy+.2);ctx.closePath();ctx.fill();
    ctx.fillStyle='#fff6d8';ctx.beginPath();ctx.arc(hx+1,hy-.8,1,0,7);ctx.fill();ctx.fillStyle=OL;ctx.beginPath();ctx.arc(hx+1.3,hy-.8,.55,0,7);ctx.fill();
    ctx.restore();}
  // which hero is being drawn (for the falcon's dive at its target)
  let ML_P=null;{const _dpbM=drawPlayerBody;drawPlayerBody=function(p){ML_P=p;try{return _dpbM.apply(this,arguments);}finally{ML_P=null;}};}
  /* the Skywarden's falcon: hovers on the far side, beside the head, never over it; glides with a few strong flaps,
     tilts and bobs. When the Skywarden shoots, the falcon IS the shot: it leaves its place and flies the projectile's own
     path to the target (so it goes where the arrow goes), then flies back from there. */
  const SKY_FALCON={body:'#f6f4ee',wing:'#ffffff',wing2:'#e2e8f0',tip:'#5aa8e0',belly:'#eef2f8',beak:'#e8c060',mark:'#4a5a70',leg:'#e8c060'};
  if(typeof shoot==='function'){const _shM=shoot;shoot=function(from){const r=_shM.apply(this,arguments);const sh=shots[shots.length-1];if(sh&&from){sh.ox=from.x;sh.oy=from.y;}return r;};}
  const skyShot=sh=>{sh._sky=true;const a=typeof fsAng==='function'?fsAng(sh):0,f=Math.cos(a)<0?-1:1;drawFalcon(0,0,1.5,f,SKY_FALCON,'fly',Math.sin(now*22)*.9,f>0?a:a-Math.PI);};
  if(typeof FS_STYLES!=='undefined'&&FS_STYLES.skywarden)FS_STYLES.skywarden.shot=skyShot;
  JSIDE.skyfalcon=function(x,y,by,f,o){let hx=x-f*27,hy=by-25+Math.sin(now*1.8)*2.6,tilt=Math.sin(now*.9)*.14,face=f;
    const cyc=now%3.2;let flap=cyc<.9?Math.sin(cyc*16):.18+Math.sin(now*2)*.06;const p=ML_P;
    if(p&&typeof shots!=='undefined'){const out=shots.find(sh=>sh._sky&&typeof sh.ox==='number'&&Math.hypot(sh.ox-x,sh.oy-y)<40);
      if(out){p._falX=out.x;p._falY=out.y-10;p._falOut=true;return;} // in flight: the shot is the falcon
      if(p._falOut){p._falOut=false;p._falRet=now;}
      const u=p._falRet?(now-p._falRet)/.5:9;
      if(u<1){const e=u*u*(3-2*u);hx=p._falX+(hx-p._falX)*e;hy=p._falY+(hy-p._falY)*e-Math.sin(u*Math.PI)*10;face=hx>=p._falX?1:-1;flap=Math.sin(now*20);tilt=0;}}
    drawFalcon(hx,hy,1.5,face,o,'fly',flap,tilt);};
  // the Falconer's falcon: perched on the far shoulder, outside the head, the same breed in brown and cream
  JSIDE.falcon=function(x,y,by,f,o){const bob=Math.sin(now*2.4)*.4;drawFalcon(x-f*15.5,by-21+bob,1.15,f,FALCON_BROWN,'perch',0,0);
    if(Math.sin(now*.7)>.97){/* now and then it ruffles: nothing more, it stays calm */}};
  const FALCON_BROWN={body:'#8a6440',wing:'#6a4a2a',wing2:'#5a3e22',tip:'#2e2014',belly:'#f4e6c4',beak:'#e8c060',mark:'#3a2a1a',leg:'#e8c060'};
  /* the Skywarden's feather mantle: layered white feathers tipped in sky blue over the far shoulder only (a master dresses its own way), drawn over the arms so
     it shows, and clipped to stay off the head (drawn at LAST_HY, about 13 across) */
  JSIDE.feathermantle=function(x,y,by,f,o){const OL='#2a1c14';ctx.save();
    if(typeof LAST_HY==='number'&&LAST_HY){ctx.beginPath();ctx.rect(x-80,LAST_HY-90,160,180);ctx.ellipse(x,LAST_HY+.5,13.6,13.2,0,0,7);ctx.clip('evenodd');}
    for(const k of [-f])for(let i=3;i>=0;i--){ctx.save();ctx.translate(x+k*(9.4+i*2.1),by-15+i*.9);ctx.rotate(k*(-.15+i*.22));
      ctx.fillStyle=o.white;ctx.strokeStyle=OL;ctx.lineWidth=1.1;ctx.beginPath();ctx.ellipse(0,6,3.6,8.4,0,0,7);ctx.fill();ctx.stroke();
      ctx.fillStyle=o.sky;ctx.beginPath();ctx.ellipse(0,12,2.3,2.4,0,0,7);ctx.fill();
      ctx.strokeStyle='rgba(90,120,160,.45)';ctx.lineWidth=.6;ctx.beginPath();ctx.moveTo(0,-1.8);ctx.lineTo(0,11.4);ctx.stroke();ctx.restore();}
    ctx.restore();};
  // the Ranger masters: their own outfits (js/outfits_rangerm.js), the rune circle; no cape, wings or cap
  JOB_LOOK.deadeye={aura:'#8fd4ff',b:[['sigil',{c:'#8fd4ff',t:'#dff4ff'}]]};
  JOB_LOOK.skywarden={aura:'#ffe08a',b:[['sigil',{c:'#5aa8e0',t:'#e8f6ff'}]],s:[['feathermantle',{white:'#ffffff',sky:'#5aa8e0'}],['skyfalcon',{body:'#f6f4ee',wing:'#ffffff',wing2:'#e2e8f0',tip:'#5aa8e0',belly:'#eef2f8',beak:'#e8c060',mark:'#4a5a70',leg:'#e8c060'}]]};
  /* the Tempest Sage: small lightning arcs crackling round its free hand; the Voidcaller: a void ring turning at its
     waist (both well below the face) */
  JSIDE.handarcs=function(x,y,by,f,o){const hx=x-f*10,hy=by-3,t=Math.floor(now*14);ctx.save();ctx.strokeStyle=o.c;ctx.shadowColor=o.c;ctx.shadowBlur=6;ctx.lineWidth=1;ctx.lineCap='round';
    for(let j=0;j<3;j++){const r=(t*7+j*13)%17/17;if(r<.35)continue;const a0=(t*1.7+j*2.1)%6.28,len=5+j*1.5;ctx.globalAlpha=.6+r*.4;ctx.beginPath();ctx.moveTo(hx+Math.cos(a0)*2.4,hy+Math.sin(a0)*2.4);
      for(let i=1;i<=3;i++){const a=a0+i*.35,rr=2.4+i*len/3;ctx.lineTo(hx+Math.cos(a)*rr+(i%2?1.2:-1.2),hy+Math.sin(a)*rr);}ctx.stroke();}
    ctx.restore();};
  JSIDE.voidring=function(x,y,by,f,o){const a=now*1.4;ctx.save();ctx.translate(x,by+.4);ctx.scale(1,.3);ctx.shadowColor=o.c;ctx.shadowBlur=8;
    ctx.globalAlpha=.85;ctx.strokeStyle=o.c;ctx.lineWidth=2.2;ctx.setLineDash([7,5]);ctx.lineDashOffset=-a*20;ctx.beginPath();ctx.arc(0,0,15,0,Math.PI);ctx.stroke();
    ctx.globalAlpha=.3;ctx.beginPath();ctx.arc(0,0,15,Math.PI,Math.PI*2);ctx.stroke();ctx.setLineDash([]);
    ctx.globalAlpha=1;ctx.fillStyle=o.t;for(let i=0;i<3;i++){const t=a+i*Math.PI*2/3;if(Math.sin(t)<0)continue;ctx.beginPath();ctx.arc(Math.cos(t)*15,Math.sin(t)*15,1.8,0,7);ctx.fill();}
    ctx.restore();};
  // the Starseer: a few tiny gold stars slowly circling its free hand (well below the face)
  JSIDE.handstars=function(x,y,by,f,o){const hx=x-f*10,hy=by-3.5;ctx.save();ctx.shadowColor=o.c;ctx.shadowBlur=6;ctx.fillStyle=o.c;
    for(let i=0;i<3;i++){const a=now*1.6+i*Math.PI*2/3,px=hx+Math.cos(a)*5.4,py=hy+Math.sin(a)*2.6,r=1.4+.4*Math.sin(now*4+i);ctx.globalAlpha=Math.sin(a)>0?1:.55;ctx.beginPath();
      for(let j=0;j<8;j++){const rr=j%2?r*.35:r,an=-Math.PI/2+j*Math.PI/4;ctx.lineTo(px+Math.cos(an)*rr,py+Math.sin(an)*rr);}ctx.closePath();ctx.fill();}
    ctx.restore();};
  /* the masters' sun and moon (the player's wish: they belong to the masters): the Dawnknight's sun disc with turning
     rays, the Starseer's gold crescent moon, both on the far shoulder (clipped off the face like every side piece) */
  JSIDE.sundisc=function(x,y,by,f,o){const OL='#2a1c14';ctx.save();ctx.translate(x-f*12.8,by-11.4);ctx.scale(1.3,1.3);ctx.shadowColor=o.ray;ctx.shadowBlur=7;ctx.fillStyle=o.ray;
    for(let i=0;i<12;i++){ctx.save();ctx.rotate(i*Math.PI/6+now*.3);ctx.beginPath();ctx.moveTo(-1.1,-4);ctx.lineTo(0,-(i%2?6.4:7.8));ctx.lineTo(1.1,-4);ctx.closePath();ctx.fill();ctx.restore();}ctx.shadowBlur=0;
    ctx.fillStyle=o.rim;ctx.strokeStyle=OL;ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(0,0,4.4,0,7);ctx.fill();ctx.stroke();ctx.fillStyle=o.core;ctx.beginPath();ctx.arc(0,0,2,0,7);ctx.fill();ctx.restore();};
  JSIDE.moondisc=function(x,y,by,f,o){const OL='#2a1c14',k=-f;ctx.save();ctx.translate(x+k*12.8,by-11.6);ctx.scale(1.25,1.25);ctx.scale(k,1);ctx.shadowColor=o.c;ctx.shadowBlur=7;ctx.fillStyle=o.c;ctx.strokeStyle=OL;ctx.lineWidth=1.1;
    ctx.beginPath();ctx.arc(0,0,6.4,-Math.PI/2,Math.PI/2,false);ctx.ellipse(0,0,2.6,6.4,0,Math.PI/2,-Math.PI/2,true);ctx.closePath();ctx.fill();ctx.shadowBlur=0;ctx.stroke();
    ctx.fillStyle='#fff6d8';ctx.beginPath();ctx.arc(4.4,-2.4,.8,0,7);ctx.fill();ctx.restore();};
  // the Oracle's healing: small blue crosses rising gently at its sides (well away from the face)
  JSIDE.healmotes=function(x,y,by,f,o){ctx.save();ctx.fillStyle=o.c;ctx.shadowColor=o.c;ctx.shadowBlur=5;
    for(let i=0;i<4;i++){const q=(now*.35+i/4)%1,side=i%2?1:-1,px=x+side*(13+Math.sin(i*1.9+now)*2),py=by+2-q*14;ctx.globalAlpha=Math.sin(q*Math.PI)*.85;ctx.fillRect(px-.5,py-1.8,1,3.6);ctx.fillRect(px-1.8,py-.5,3.6,1);}
    ctx.restore();};
  // the Soulreaper: small cyan soul flames rising at its sides; the Plaguelord: small toxic bubbles (both away from the face)
  JSIDE.soulwisps=function(x,y,by,f,o){ctx.save();ctx.shadowColor=o.c;ctx.shadowBlur=7;
    for(let i=0;i<4;i++){const q=(now*.4+i/4)%1,side=i%2?1:-1,px=x+side*(13.5+Math.sin(now*2+i)*2),py=by+1-q*16,a=Math.sin(q*Math.PI);ctx.globalAlpha=a*.9;ctx.fillStyle=o.c;
      ctx.beginPath();ctx.moveTo(px,py-3.6);ctx.quadraticCurveTo(px+2.2,py-.4,px,py+1.6);ctx.quadraticCurveTo(px-2.2,py-.4,px,py-3.6);ctx.fill();ctx.fillStyle='#e8ffff';ctx.beginPath();ctx.arc(px,py,.7,0,7);ctx.fill();}
    ctx.restore();};
  JSIDE.toxbubbles=function(x,y,by,f,o){ctx.save();for(let i=0;i<5;i++){const q=(now*.5+i/5)%1,side=i%2?1:-1,px=x+side*(12.5+Math.sin(now*3+i*2)*1.6),py=by+2-q*13,r=.9+i%3*.4;
      ctx.globalAlpha=Math.sin(q*Math.PI)*.9;ctx.strokeStyle=o.c[i%o.c.length];ctx.lineWidth=.8;ctx.beginPath();ctx.arc(px,py,r,0,7);ctx.stroke();ctx.fillStyle='rgba(255,255,255,.5)';ctx.beginPath();ctx.arc(px-r*.35,py-r*.35,r*.3,0,7);ctx.fill();}
    ctx.restore();};
  JSIDE.skullpauld=function(x,y,by,f,o){const OL='#2a1c14',k=-f;ctx.save();ctx.translate(x+k*12.8,by-11.6);ctx.rotate(k*.3);ctx.scale(1.15,1.15);ctx.fillStyle=o.bone;ctx.strokeStyle=OL;ctx.lineWidth=1.2;ctx.beginPath();ctx.ellipse(0,-1,5,4.4,0,0,7);ctx.fill();ctx.stroke();ctx.beginPath();ctx.roundRect(-2.6,2.2,5.2,2.4,1);ctx.fill();ctx.stroke();ctx.strokeStyle=OL;ctx.lineWidth=.6;for(const d of [-1.2,0,1.2]){ctx.beginPath();ctx.moveTo(d,2.4);ctx.lineTo(d,4.4);ctx.stroke();}ctx.fillStyle='#1a161e';for(const d of [-1.8,1.8]){ctx.beginPath();ctx.ellipse(d,-1.2,1.2,1.4,0,0,7);ctx.fill();}ctx.shadowColor=o.eye;ctx.shadowBlur=6;ctx.fillStyle=o.eye;for(const d of [-1.8,1.8]){ctx.beginPath();ctx.arc(d,-1,.5+.15*Math.sin(now*4),0,7);ctx.fill();}ctx.restore();};
  // the Goldlord: a few gold coins turning in the air at its sides (away from the face)
  JSIDE.goldcoins=function(x,y,by,f,o){ctx.save();for(let i=0;i<4;i++){const a=now*1.3+i*Math.PI/2,side=Math.cos(a)>0?1:-1,px=x+Math.cos(a)*16,py=by-4+Math.sin(now*2+i)*3,w=Math.abs(Math.sin(now*4+i))*2+.4;
    ctx.globalAlpha=Math.sin(a)>0?1:.55;ctx.fillStyle=o.c;ctx.strokeStyle='#8a6a1a';ctx.lineWidth=.6;ctx.shadowColor=o.c;ctx.shadowBlur=5;ctx.beginPath();ctx.ellipse(px,py,w,2.4,0,0,7);ctx.fill();ctx.stroke();}ctx.restore();};
  // (v1.70.0) the other masters: their own outfits (js/outfits_masters2.js) and the rune circle; no wings, orbs or capes
  for(const [id,c,t] of [['tempestsage','#ffe23a','#fff6c0'],['voidcaller','#3ae8c8','#d8fff6'],['dawnknight','#ff3a3a','#ffc8c8'],['starseer','#e8c060','#fff6d8'],
    ['soulreaper','#ff3a4a','#ffd0d4'],['plaguelord','#a8ff3a','#e8ffc8']])JOB_LOOK[id]={aura:c,b:[['sigil',{c,t}]]}; /* (the Gunslinger masters: on hold) */
  JOB_LOOK.tempestsage.s=[['handarcs',{c:'#ffe23a'}]];JOB_LOOK.starseer.s=[['moondisc',{c:'#e8c060'}],['handstars',{c:'#ffd870'}]];JOB_LOOK.oracle={...(JOB_LOOK.oracle||{}),s:[['healmotes',{c:'#7fd3ff'}]],b:[]};JOB_LOOK.soulreaper.s=[['skullpauld',{bone:'#ece4d0',eye:'#ff3a4a'}],['soulwisps',{c:'#ff3a4a'}]];JOB_LOOK.plaguelord.s=[['toxbubbles',{c:['#a8ff3a','#5ad860','#e8ff7a']}]];JOB_LOOK.nightblade={};JOB_LOOK.venomancer={};JOB_LOOK.forgemaster={aura:'#7ad8ff',b:[['sigil',{c:'#7ad8ff',t:'#e8faff'}]],s:[['embers',{c:'#9ae8ff'}]]};JOB_LOOK.goldlord={aura:'#ffd84a',b:[['sigil',{c:'#ffd84a',t:'#fff6c8'}]],s:[['goldcoins',{c:'#ffd84a'}]]};JOB_LOOK.dawnknight.s=[['sundisc',{ray:'#ff4a3a',rim:'#e8b84a',core:'#c8202e'}]];JOB_LOOK.voidcaller.s=[['voidring',{c:'#3ae8c8',t:'#d8fff6'}]];
  /* a master in its own outfit wears no job mantle (the coloured shoulder pads and collar every advanced calling has):
     they would cover its own pauldrons and chest pieces */
  if(typeof drawJobMantle==='function'){const _djm=drawJobMantle;drawJobMantle=function(){const p=ML_P;
    if(p&&typeof OUTFITS!=='undefined'){const K=(OUTFITS[baseOf(p.cls)]||{})[p.cls];if(K&&(K.fam==='wardenm'||K.fam==='rangerm'||K.fam==='master2'||K.own))return;
      /* (v1.71.4) the advanced callings wear their own official uniforms now (every family): the old mantle drew coloured
         shoulder pads and a collar over them in the game only, so they did not match the start screen and their designs */
      if(typeof WARDEN_V2!=='undefined'&&WARDEN_V2&&(K||(typeof WARDEN_LOOKS!=='undefined'&&WARDEN_LOOKS[p.cls])))return;}
    return _djm.apply(this,arguments);};}
  /* nothing drawn over the body ever covers the face: every side piece (orbs, sparks, runes, spikes...) is clipped out
     of the head, drawn at LAST_HY about 13 across */
  for(const k of Object.keys(JSIDE)){const fn=JSIDE[k];JSIDE[k]=function(x){ctx.save();try{if(typeof LAST_HY==='number'&&LAST_HY){ctx.beginPath();ctx.rect(x-120,LAST_HY-140,240,280);ctx.ellipse(x,LAST_HY+.5,13.6,13.2,0,0,7);ctx.clip('evenodd');}
    return fn.apply(this,arguments);}finally{ctx.restore();}};}}
