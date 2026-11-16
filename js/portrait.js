"use strict";
/* ================= portrait-quality hero for the big views (start screen) =================
   The hero is drawn with the new body (hero2.js, extra detail via HERO2_HI) and its job stance (stance.js) on an
   offscreen canvas, then lit like a painting:
     - warm light from the upper left and a cool shadow toward the lower right, only on the hero's own pixels
     - a thin light edge along the upper-left of the silhouette (rim light)
   and set on a small stage: a soft spotlight, a grassy ground disc with a contact shadow, and drifting light specks.
   Drawn at 2x the canvas's old size so it stays sharp on phone screens (CSS keeps the on-screen size). */
const PORTRAIT={oc:null,mk:null,motes:null};
function portraitBuf(k,W,H){let c=PORTRAIT[k];if(!c){c=PORTRAIT[k]=document.createElement('canvas');}if(c.width!==W||c.height!==H){c.width=W;c.height=H;}return c;}
function drawPortrait(g,cls,look,face){
  const cv=g.canvas;if(cv.width<480){cv.width=cv.height=480;}
  const W=cv.width,H=cv.height,S=W/70,cx=W/2,gy=H*.82,f=face<0?-1:1;
  g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,W,H);
  // ---- stage: spotlight, ground disc with grass, contact shadow ----
  const sp=g.createRadialGradient(cx,H*.45,W*.04,cx,H*.5,W*.5);sp.addColorStop(0,'rgba(255,224,160,.28)');sp.addColorStop(.55,'rgba(255,200,120,.07)');sp.addColorStop(1,'rgba(255,200,120,0)');
  g.fillStyle=sp;g.fillRect(0,0,W,H);
  const gd=g.createRadialGradient(cx,gy-W*.02,W*.02,cx,gy,W*.36);gd.addColorStop(0,'#5f8f45');gd.addColorStop(.7,'#3d6a30');gd.addColorStop(1,'rgba(40,70,32,0)');
  g.fillStyle=gd;g.beginPath();g.ellipse(cx,gy,W*.36,W*.1,0,0,7);g.fill();
  g.strokeStyle='rgba(150,200,110,.55)';g.lineWidth=W/240;g.lineCap='round';
  for(let i=0;i<26;i++){const a=i*2.399,r=.25+((i*37)%10)/14,bx=cx+Math.cos(a)*W*.3*r,byy=gy+Math.sin(a)*W*.08*r,h=W*(.012+((i*13)%5)*.004),sw=Math.sin(now*1.5+i)*W*.003;
    g.beginPath();g.moveTo(bx,byy);g.quadraticCurveTo(bx+sw,byy-h*.6,bx+sw*2+W*.003,byy-h);g.stroke();}
  const cs=g.createRadialGradient(cx,gy,1,cx,gy,W*.14);cs.addColorStop(0,'rgba(10,20,8,.55)');cs.addColorStop(1,'rgba(10,20,8,0)');g.fillStyle=cs;g.beginPath();g.ellipse(cx,gy,W*.15,W*.045,0,0,7);g.fill();
  // ---- the hero, drawn big and detailed on its own layer ----
  const oc=portraitBuf('oc',W,H),o=oc.getContext('2d');o.setTransform(1,0,0,1,0,0);o.clearRect(0,0,W,H);o.setTransform(S,0,0,S,0,0);
  const main=ctx;ctx=o;HERO2_HI=true;
  try{drawStance(cls,look,cx/S,gy/S,f);}finally{ctx=main;HERO2_HI=false;}
  o.setTransform(1,0,0,1,0,0);
  // light and shadow, only where the hero is
  o.globalCompositeOperation='source-atop';
  const lg=o.createLinearGradient(W*.28,H*.18,W*.72,H*.86);lg.addColorStop(0,'rgba(255,244,220,.24)');lg.addColorStop(.45,'rgba(255,244,220,0)');lg.addColorStop(.62,'rgba(20,12,40,0)');lg.addColorStop(1,'rgba(20,12,40,.3)');
  o.fillStyle=lg;o.fillRect(0,0,W,H);
  // rim light: the silhouette minus itself shifted down-right leaves a thin upper-left edge
  const mk=portraitBuf('mk',W,H),m=mk.getContext('2d');m.globalCompositeOperation='source-over';m.clearRect(0,0,W,H);m.drawImage(oc,0,0);
  m.globalCompositeOperation='source-in';m.fillStyle='#fff3d6';m.fillRect(0,0,W,H);m.globalCompositeOperation='destination-out';const d=Math.max(2,Math.round(W/170));m.drawImage(oc,d,d);m.globalCompositeOperation='source-over';
  o.globalAlpha=.6;o.drawImage(mk,0,0);o.globalAlpha=1;o.globalCompositeOperation='source-over';
  g.drawImage(oc,0,0);
  // ---- drifting light specks in front of the stage ----
  if(!PORTRAIT.motes)PORTRAIT.motes=Array.from({length:9},(_,i)=>({x:.2+((i*53)%60)/100,s:.6+((i*29)%10)/10,p:(i*.37)%1}));
  for(const mo of PORTRAIT.motes){const k=(now*.06*mo.s+mo.p)%1,a=Math.sin(k*Math.PI);g.fillStyle=`rgba(255,236,170,${.55*a})`;
    g.beginPath();g.arc(W*mo.x+Math.sin(now*.8+mo.p*9)*W*.02,H*(.86-k*.7),W*.006*mo.s,0,7);g.fill();}}
