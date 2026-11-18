"use strict";
/* ================= hero art v2 (the default since v1.15.0; ?hero2=0 brings back the classic art on this device, ?hero2=1 the new) =================
   Same drawing contract as drawHuman (render.js): (x, y ground, body colour, hair, facing, walk phase, opt) and it
   returns `by`, the belt line that armour, mantles and weapons are placed from. The head keeps the old size and
   place (hy = by-20, radius 12.5) so hats, face and mouth gear and job looks still fit.
   New: a torso with shoulders, sleeved arms that swing when walking, longer legs with trousers and boots, a real
   outfit for every first job (and townsfolk), a breathing bob when standing, hair and capes that sway, and two new
   hairstyles (6 Braid, 7 Short). */
/* HERO2_HI: set while a big portrait is drawn (portrait.js): extra detail that only shows at large size */
let HERO2_HI=false;
const HERO2_STYLE_NAMES=['Spiky','Long','Ponytail','Twin tails','Bob','Curly','Braid','Short'];
const HERO2_DRESS={
  npc:{pant:'#4a3a2e',boot:'#3a2a20',trim:'#e8d8b0',belt:'#6b4423'},
  novice:{pant:'#5a4632',boot:'#4a3020',trim:'#efe2c0',belt:'#6b4423'},
  warden:{pant:'#474d58',boot:'#6a707c',trim:'#c9d0da',belt:'#5a3a22'},
  arcanist:{pant:'#3a2a48',boot:'#3a2a40',trim:'#e8c25a',belt:'#e8c25a'},
  ranger:{pant:'#5a4a30',boot:'#5a3a22',trim:'#8a5a2b',belt:'#6b4423'},
  cleric:{pant:'#7a6a50',boot:'#7a6a50',trim:'#e8c25a',belt:'#c8a050'}};
function hero2Shade(hex,a){if(typeof mlShade==='function')return mlShade(hex,a);return hex;}
// the Warden's full outfit (v1.22 preview): big shoulder guards, a crest, a long tabard, gauntlets and greaves
var WARDEN_V2=true;
// the Warden family's outfits: the advanced callings grow out of the Warden's (pz: shoulder-guard size)
const WARDEN_LOOKS={
  warden:{kit:'knight',steel:'#c3cad4',steel2:'#8e96a3',cloth:'#a8281e',trim:'#e8b84a',crest:'#e8b84a',pz:1,boot:'#8e96a3',sleeve:'#8e96a3'},
  bulwark:{kit:'fort',steel:'#dde2ea',steel2:'#9aa4b2',cloth:'#2a4a8a',trim:'#f0c860',boot:'#9aa4b2',sleeve:'#c3cad4',pant:'#5a6270'},
  ravager:{kit:'bers',leather:'#5a3a26',fur:'#6e4e32',iron:'#5c616a',cloth:'#7a1a12',trim:'#c8b890',boot:'#3a2a1c',pant:'#4a3426'},
  runeguard:{kit:'rune',coat:'#22365e',steel:'#c4d4e6',trim:'#7fd3ff',boot:'#1e2236',sleeve:'#22365e',pant:'#2a2e48'}};
function drawHuman2(x,y,body,hair,face,walk,opt={}){
  const L=opt.look||{style:0,eye:'#5a3a22',skin:'#f6d6b8',seed:0};hair=L.hair||hair;
  const f=face<0?-1:1,out=HERO2_DRESS[opt.outfit]?opt.outfit:'npc',D=HERO2_DRESS[out],OL='#2a1c14',st=L.style|0,bk=!!opt.back,sd=L.seed||0;
  const WV=out==='warden'&&WARDEN_V2?WARDEN_LOOKS[opt.cls]:null,wv2=!!WV,KN=wv2&&WV.kit==='knight',FORT=wv2&&WV.kit==='fort',BERS=wv2&&WV.kit==='bers',RUNE=wv2&&WV.kit==='rune',GOLD=WV?WV.trim:'',STEEL=WV?WV.steel:'',STEEL2=WV?WV.steel2:'',RED=WV?WV.cloth:'';
  const glow=(fn)=>{if(WV&&WV.glow){ctx.save();ctx.shadowColor=WV.trim;ctx.shadowBlur=6;fn();ctx.restore();}else fn();};
  const G=opt.gait||{leg:1,bob:1,arm:1},wk=walk?Math.sin(walk*12):0,bob=walk?Math.abs(wk)*1.4*G.bob:0,br=walk||opt.sit?0:Math.sin(now*2.2+sd),sit=opt.sit?7:0;
  /* breathing: the whole body rises and settles a little (feet stay on the ground), the head follows a beat later */
  const breath=opt.sit?Math.sin(now*2.2+sd)*.3:br*.5;
  const by=y-9-bob+(opt.sit&&opt.sitPose&&opt.sitPose.hip!==undefined?opt.sitPose.hip+1:sit)-breath,hy=by-20-Math.sin(now*2.2+sd-.6)*.2,robe=out==='arcanist'||out==='cleric',bw=BUILD_W[L.body|0]||1;LAST_HY=hy;
  // the Arcanist family's outfits are drawn by js/outfits.js (outfitPart); V hands it what it needs
  const AK=out==='arcanist'&&WARDEN_V2&&typeof ARC_LOOKS!=='undefined'?ARC_LOOKS[opt.cls]||null:null;
  const top=AK?AK.robe:out==='cleric'?'#f4efe2':body,dark=hero2Shade(top,-38),lite=hero2Shade(top,30);
  if(!HERO2_HI)shadow(x,y,12);ctx.lineJoin='round';ctx.lineCap='round';ctx.lineWidth=1.5;ctx.strokeStyle=OL;
  const fs=()=>{ctx.fill();ctx.stroke();};
  const sway=Math.sin(now*3+sd)*1.2+wk*1.5;
  // ---- back layer: long hair, tails, braid, cape, hood, quiver ----
  const backLayer=()=>{ctx.lineWidth=1.5;ctx.strokeStyle=OL;ctx.fillStyle=hair;
    if(st===1){ctx.beginPath();ctx.roundRect(x-12.5,hy-4,25,25,8);fs();}
    if(st===4){ctx.beginPath();ctx.roundRect(x-13.5,hy-6,27,17,8);fs();}
    if(st===2){ctx.beginPath();ctx.ellipse(bk?x:x-f*13,hy+(bk?7:3)+Math.sin(now*4+sd)*.8,4.5,10,f*.35+sway*.04,0,7);fs();}
    if(st===3)for(const k of [-1,1]){ctx.beginPath();ctx.ellipse(x+k*14,hy+5+Math.sin(now*4+k)*.8,4.5,10.5,k*-.25+sway*.03,0,7);fs();}
    if(st===6&&bk){for(let i=0;i<4;i++){ctx.beginPath();ctx.ellipse(x+Math.sin(now*3+i)*.6,hy+9+i*4.2,3.6-i*.3,2.8,0,0,7);fs();}}
    if(KN){const cl=x-16-f*3+sway*1.3,cr=x+16-f*3+sway*1.3;ctx.fillStyle=RED;ctx.beginPath();ctx.moveTo(x-9*bw,by-15);ctx.lineTo(x+9*bw,by-15);ctx.quadraticCurveTo(x+14-f*2,by-2,cr,y+1.5);
      if(WV.ragged){for(let i=1;i<8;i++){const u=i/8,xx=cr+(cl-cr)*u;ctx.lineTo(xx,y+(i%2?-3.5:2.2)+Math.sin(now*5+i)*.5);}ctx.lineTo(cl,y+1.5);}
      else{ctx.lineTo(cr-6,y+.2);ctx.lineTo(x+(cr-x)*.35,y+2);ctx.lineTo(x+(cl-x)*.35,y+2);ctx.lineTo(cl+6,y+.2);ctx.lineTo(cl,y+1.5);}ctx.quadraticCurveTo(x-14-f*2,by-2,x-9*bw,by-15);ctx.closePath();fs();
      if(!WV.ragged)glow(()=>{ctx.strokeStyle=GOLD;ctx.lineWidth=1.7;ctx.beginPath();ctx.moveTo(x+12.5-f*2,by-4);ctx.quadraticCurveTo(x+14.5-f*2,by+3,cr-.6,y);ctx.moveTo(x-12.5-f*2,by-4);ctx.quadraticCurveTo(x-14.5-f*2,by+3,cl+.6,y);ctx.stroke();});
      ctx.strokeStyle='rgba(0,0,0,.22)';ctx.lineWidth=1;for(const k of [-5,0,5]){ctx.beginPath();ctx.moveTo(x+k,by-10);ctx.lineTo(x+k*1.3-f*4+sway*1.2,y-1);ctx.stroke();}ctx.lineWidth=1.5;ctx.strokeStyle=OL;}
    else if(BERS){ // a fur cloak hanging from the shoulders, ragged at the bottom
      ctx.fillStyle=WV.fur;ctx.beginPath();ctx.moveTo(x-9,by-15);ctx.lineTo(x+9,by-15);ctx.quadraticCurveTo(x+12-f*2,by-6,x+10-f*3+sway,by+4);
      for(let i=1;i<7;i++){const u=i/7;ctx.lineTo(x+10-f*3+sway-u*20,by+4+(i%2?3.5:-.5)+Math.sin(now*4+i)*.5);}ctx.lineTo(x-10-f*3+sway,by+4);ctx.quadraticCurveTo(x-12-f*2,by-6,x-9,by-15);ctx.closePath();fs();
      ctx.strokeStyle='rgba(0,0,0,.22)';ctx.lineWidth=.8;for(const k of [-6,-2,2,6]){ctx.beginPath();ctx.moveTo(x+k,by-12);ctx.lineTo(x+k*1.1-f*2+sway*.8,by+3);ctx.stroke();}ctx.lineWidth=1.5;ctx.strokeStyle=OL;}
    else if(RUNE){ // two long coat tails behind the legs, a glowing hem
      for(const k of [-1,1]){const tx=x+k*11-f*2+sway*1.2;ctx.fillStyle=WV.coat;ctx.beginPath();ctx.moveTo(x+k*2,by-2);ctx.lineTo(x+k*8,by-3);ctx.quadraticCurveTo(x+k*12,by+6,tx,y+3);ctx.lineTo(x+k*4+sway*.6,y-1);ctx.closePath();fs();
        glow(()=>{ctx.strokeStyle=GOLD;ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(x+k*8,by-2.6);ctx.quadraticCurveTo(x+k*11.6,by+6,tx,y+2.4);ctx.lineTo(x+k*4+sway*.6,y-1.4);ctx.stroke();});ctx.strokeStyle=OL;ctx.lineWidth=1.5;}}
    else if(wv2){}
    else if(out==='warden'){ctx.fillStyle='#9a2e24';ctx.beginPath();ctx.moveTo(x-8*bw,by-14);ctx.lineTo(x+8*bw,by-14);ctx.quadraticCurveTo(x+11-f*3,by-2,x+10-f*4+sway,y-1);
      ctx.lineTo(x-10-f*4+sway,y-1);ctx.quadraticCurveTo(x-11-f*3,by-2,x-8*bw,by-14);ctx.closePath();fs();
      ctx.strokeStyle='rgba(0,0,0,.2)';ctx.lineWidth=1;for(const k of [-4,0,4]){ctx.beginPath();ctx.moveTo(x+k,by-10);ctx.lineTo(x+k*1.2-f*3+sway,y-3);ctx.stroke();}ctx.lineWidth=1.5;ctx.strokeStyle=OL;}
    if(out==='ranger'){ctx.save();ctx.translate(x-f*7,by-9);ctx.rotate(f*.4);ctx.fillStyle='#6b4423';ctx.beginPath();ctx.roundRect(-3.5,-13,7,18,2.5);fs();
      ctx.fillStyle='#e8e0d0';for(const k of [-2,0,2]){ctx.beginPath();ctx.moveTo(k,-13);ctx.lineTo(k-1.6,-18);ctx.lineTo(k+1.6,-18);ctx.closePath();ctx.fill();}
      ctx.fillStyle='#c84a3a';for(const k of [-2,0,2])ctx.fillRect(k-1,-14.5,2,1.6);ctx.restore();
      ctx.fillStyle='#3f7a46';ctx.beginPath();ctx.ellipse(x-f*3,by-15,8,4.5,0,0,7);fs();}
    if(AK)outfitPart(AK,'back',{x,y,by,f,bk,sway,bw,OL,fs,hy});
    else if(out==='arcanist'){ctx.fillStyle=dark;ctx.beginPath();ctx.ellipse(x-f*2,by-15.5,8.5,4,0,0,7);fs();}
    if(out==='shade'){ctx.fillStyle='#2e2a3c';ctx.beginPath();ctx.moveTo(x-f*2,by-15);ctx.lineTo(x-f*9,by-14);ctx.quadraticCurveTo(x-f*13+sway*.6,by-4,x-f*11+sway,by+5);
      ctx.lineTo(x-f*8+sway,by+2);ctx.lineTo(x-f*6+sway,by+6);ctx.lineTo(x-f*3,by-2);ctx.closePath();fs();}};
  if(!bk)backLayer();
  // ---- legs: trousers and boots; a stride while walking (robes show only the boots under the hem) ----
  const hip=by+1;
  if(!opt.sit){for(const k of [-1,1]){const s=k*wk*3.4*G.leg+k*(opt.stance||0),lift=walk?Math.max(0,-k*wk)*1.6:0,fx=x+k*3.6+s,fy=y-1.5-lift;
      if(!robe){ctx.strokeStyle=OL;ctx.lineWidth=6.2;ctx.beginPath();ctx.moveTo(x+k*3.6,hip-2);ctx.lineTo(fx,fy-2.5);ctx.stroke();
        ctx.strokeStyle=(WV&&WV.pant)||D.pant;ctx.lineWidth=FORT?4.6:3.6;ctx.beginPath();ctx.moveTo(x+k*3.6,hip-2);ctx.lineTo(fx,fy-2.5);ctx.stroke();}
      ctx.lineWidth=1.5;ctx.strokeStyle=OL;ctx.fillStyle=WV?WV.boot:D.boot;ctx.beginPath();ctx.roundRect(fx-3,fy-(RUNE?7:5),6,RUNE?7:5,2);fs();
      ctx.beginPath();ctx.ellipse(fx+f*1.3,fy-.6,3.9,2.4,0,0,7);fs();
      ctx.fillStyle='rgba(255,255,255,.18)';ctx.fillRect(fx-2.6,fy-4.6,5.2,1.3);
      if(BERS){ctx.fillStyle=WV.fur;ctx.strokeStyle=OL;ctx.lineWidth=1;ctx.beginPath();for(let i=0;i<=6;i++){const u=i/6;ctx.lineTo(fx-3.6+u*7.2,fy-5.2-(i%2?1.6:0));}ctx.lineTo(fx+3.4,fy-3.6);ctx.lineTo(fx-3.4,fy-3.6);ctx.closePath();fs();}
      if(RUNE){const kx=(x+k*3.6+fx)/2,ky=(hip-2+fy-2.5)/2;ctx.fillStyle=STEEL;ctx.strokeStyle=OL;ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(kx,ky,2.2,1.8,0,0,7);fs();}
      if(FORT){ctx.fillStyle=STEEL;ctx.strokeStyle=OL;ctx.lineWidth=1.1;ctx.beginPath();ctx.roundRect(fx-3.4,fy-10,6.8,7,1.6);fs();ctx.strokeStyle=GOLD;ctx.lineWidth=.9;ctx.beginPath();ctx.moveTo(fx-3,fy-9.2);ctx.lineTo(fx+3,fy-9.2);ctx.stroke();}
      if(KN){ctx.fillStyle=STEEL;ctx.strokeStyle=OL;ctx.lineWidth=1.1;const kx=(x+k*3.6+fx)/2,ky=(hip-2+fy-2.5)/2;ctx.beginPath();ctx.roundRect(fx-2.6,fy-8.5,5.2,5,1.4);fs();
        ctx.beginPath();ctx.ellipse(kx,ky,2.7,2.2,0,0,7);fs();ctx.fillStyle=GOLD;ctx.beginPath();ctx.arc(kx,ky,.8,0,7);ctx.fill();}}}
  else if(opt.sitPose&&typeof drawSitLegs==='function')drawSitLegs(x,y,f,opt.sitPose,robe?top:(WV&&WV.pant)||D.pant,WV?WV.boot:D.boot);
  else{ctx.lineWidth=1.5;ctx.strokeStyle=OL;ctx.fillStyle=robe?top:D.pant;
    for(const k of [-1,1]){ctx.beginPath();ctx.ellipse(x+k*7,y-2.5,6.5,3.6,k*.18,0,7);fs();}
    ctx.fillStyle=D.boot;for(const k of [-1,1]){ctx.beginPath();ctx.ellipse(x+k*2.5,y,3.4,2.4,0,0,7);fs();}}
  // ---- arms: shoulder to hand, swinging against the legs; up while casting; on the knees when sitting ----
  const hand=k=>{if(opt.hands){const h=opt.hands[k===f?0:1];return [x+f*h[0],by+h[1]];}if(opt.sit)return [x+k*10*bw,y-4];if(opt.cast)return [x+k*11.5*bw,by-17+Math.sin(now*9+k)*1.2];
    return [x+k*9.6*bw-k*wk*f*0+(walk?-k*wk*2.6*G.arm:0),by-3+(walk?Math.abs(wk)*-.6:0)+br*.3];};
  const sleeve=AK?AK.sleeve:BERS?L.skin:WV?WV.sleeve:out==='warden'?'#c9d0da':out==='cleric'?'#f4efe2':top;
  const arm=k=>{const sx=x+k*8*bw,sy=by-12,[hx,hy2]=hand(k);
    ctx.strokeStyle=OL;ctx.lineWidth=6.4;ctx.beginPath();ctx.moveTo(sx,sy);ctx.lineTo(hx,hy2-1.5);ctx.stroke();
    ctx.strokeStyle=sleeve;ctx.lineWidth=3.8;ctx.beginPath();ctx.moveTo(sx,sy);ctx.lineTo(hx,hy2-1.5);ctx.stroke();
    if(AK)outfitPart(AK,'arm',{x,y,by,f,bk,sway,OL,fs,sx,sy,hx,hy2,sleeve,k});
    else if(out==='arcanist'||out==='cleric'){ctx.fillStyle=sleeve;ctx.strokeStyle=OL;ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(hx-3.4,hy2-4.5);ctx.lineTo(hx+3.4,hy2-4.5);ctx.lineTo(hx+4.2,hy2-.5);ctx.lineTo(hx-4.2,hy2-.5);ctx.closePath();fs();
      ctx.strokeStyle=D.trim;ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(hx-4,hy2-1);ctx.lineTo(hx+4,hy2-1);ctx.stroke();}
    else if(FORT){ctx.fillStyle=STEEL;ctx.strokeStyle=OL;ctx.lineWidth=1.2;ctx.beginPath();ctx.ellipse(hx,hy2-2,4.2,3,0,0,7);fs();ctx.strokeStyle=GOLD;ctx.lineWidth=.9;ctx.beginPath();ctx.ellipse(hx,hy2-2,3,2,0,Math.PI,0);ctx.stroke();}
    else if(BERS){const ang=Math.atan2(hy2-sy,hx-sx);ctx.save();ctx.translate(sx+(hx-sx)*.66,sy+(hy2-sy)*.66);ctx.rotate(ang);ctx.fillStyle='#d8c8a0';ctx.strokeStyle=OL;ctx.lineWidth=.9;
        for(const o of [-2.2,0,2.2]){ctx.beginPath();ctx.roundRect(o-1,-2.6,2,5.2,.6);fs();}ctx.restore();}
    else if(RUNE){const mx=sx+(hx-sx)*.64,my=sy+(hy2-sy)*.64,ang=Math.atan2(hy2-sy,hx-sx);ctx.save();ctx.translate(mx,my);ctx.rotate(ang);ctx.fillStyle=STEEL;ctx.strokeStyle=OL;ctx.lineWidth=1;
        ctx.beginPath();ctx.roundRect(-3,-2.6,6,5.2,1.4);fs();glow(()=>{ctx.fillStyle=GOLD;ctx.fillRect(-2,-.5,4,1);});ctx.restore();}
    else if(KN){const mx=sx+(hx-sx)*.62,my=sy+(hy2-sy)*.62,ang=Math.atan2(hy2-sy,hx-sx);ctx.save();ctx.translate(mx,my);ctx.rotate(ang);ctx.fillStyle=STEEL;ctx.strokeStyle=OL;ctx.lineWidth=1.1;
        ctx.beginPath();ctx.roundRect(-3.2,-3,6.4,6,1.6);fs();ctx.strokeStyle=GOLD;ctx.lineWidth=.9;ctx.beginPath();ctx.moveTo(-3,-2.2);ctx.lineTo(-3,2.2);ctx.stroke();ctx.restore();
      ctx.fillStyle=STEEL;ctx.strokeStyle=OL;ctx.lineWidth=1.1;ctx.beginPath();ctx.ellipse(hx,hy2-1.8,3.4,2.2,0,0,7);fs();}
    else{ctx.fillStyle=out==='warden'?'#8a909c':D.trim;ctx.strokeStyle=OL;ctx.lineWidth=1.2;ctx.beginPath();ctx.ellipse(hx,hy2-2.2,2.8,1.6,0,0,7);fs();}
    ctx.lineWidth=1.5;ctx.strokeStyle=OL;ctx.fillStyle=L.skin;ctx.beginPath();ctx.arc(hx,hy2,2.7,0,7);fs();};
  /* the arm on the side the hero faces is behind the body, the other in front (casting, sitting, start-screen stances
     and the back view keep the old order) */
  const leadBehind=!opt.sit&&!opt.cast&&!opt.hands&&!bk,backArm=leadBehind?f:-f;
  arm(backArm);
  // ---- torso: shoulders, waist and hips (robes flare down to the boots) ----
  ctx.save();if(bw!==1){ctx.translate(x,0);ctx.scale(bw,1);ctx.translate(-x,0);}
  ctx.lineWidth=1.5;ctx.strokeStyle=OL;ctx.fillStyle=top;
  ctx.beginPath();ctx.moveTo(x-6,by-15.5);ctx.quadraticCurveTo(x-9.8,by-15,x-9.4,by-11);
  if(robe){ctx.lineTo(x-7.4,by-3);ctx.lineTo(x-10.5,y-2.5);ctx.quadraticCurveTo(x,y+.5,x+10.5,y-2.5);ctx.lineTo(x+7.4,by-3);}
  else{ctx.lineTo(x-7.4,by-2);ctx.lineTo(x-7.8,hip+1);ctx.lineTo(x+7.8,hip+1);ctx.lineTo(x+7.4,by-2);}
  ctx.lineTo(x+9.4,by-11);ctx.quadraticCurveTo(x+9.8,by-15,x+6,by-15.5);ctx.closePath();fs();
  // soft shading: the side away from the light is a little darker, a highlight on the chest
  ctx.fillStyle='rgba(0,0,0,.12)';ctx.beginPath();ctx.moveTo(x+f*4,by-15);ctx.quadraticCurveTo(x+f*9.6,by-14,x+f*9.2,by-11);ctx.lineTo(x+f*7.2,robe?y-3:hip);ctx.lineTo(x+f*4.8,robe?y-2:hip);ctx.closePath();ctx.fill();
  if(!bk){ctx.fillStyle='rgba(255,255,255,.16)';ctx.beginPath();ctx.ellipse(x-f*3.5,by-11,2.6,3.6,0,0,7);ctx.fill();}
  if(HERO2_HI){ctx.strokeStyle='rgba(0,0,0,.16)';ctx.lineWidth=.5;for(const [a,b,c2,d] of [[-5,-9,-3.5,-4],[5,-8,3.8,-3.5],[-2,-6,-1,-2.5]]){ctx.beginPath();ctx.moveTo(x+a,by+b);ctx.quadraticCurveTo(x+(a+c2)/2+1,by+(b+d)/2,x+c2,by+d);ctx.stroke();}
    if(robe){for(const k of [-6,-2,2,6]){ctx.beginPath();ctx.moveTo(x+k*.8,by);ctx.quadraticCurveTo(x+k*1.2,y-6,x+k*1.5,y-3);ctx.stroke();}}
    ctx.lineWidth=1.5;ctx.strokeStyle=OL;}
  // ---- outfit details ----
  const belt=(col,yy)=>{ctx.fillStyle=col;ctx.strokeStyle=OL;ctx.lineWidth=1.2;ctx.beginPath();ctx.roundRect(x-7.6,yy-1.6,15.2,3.2,1);fs();
    if(!bk){ctx.fillStyle='#e8c25a';ctx.beginPath();ctx.roundRect(x-1.8,yy-2,3.6,4,.8);fs();}};
  if(bk){ctx.fillStyle='rgba(0,0,0,.14)';ctx.fillRect(x-7.5,by-3,15,3);}
  else if(FORT){
    // a skirt of big steel plates down to the knees
    ctx.strokeStyle=OL;ctx.lineWidth=1.2;for(const [a0,a1,c] of [[-9.6,-4,STEEL2],[4,9.6,STEEL2],[-4.6,4.6,STEEL]]){ctx.fillStyle=c;ctx.beginPath();ctx.moveTo(x+a0*.82,by-1.5);ctx.lineTo(x+a1*.82,by-1.5);ctx.lineTo(x+a1,hip+6);ctx.lineTo(x+a0,hip+6);ctx.closePath();fs();
      ctx.strokeStyle=GOLD;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x+a0+.5,hip+5);ctx.lineTo(x+a1-.5,hip+5);ctx.stroke();ctx.strokeStyle=OL;ctx.lineWidth=1.2;}
    // a barrel breastplate wider than the body, ribbed, with a gold boss
    ctx.fillStyle=STEEL;ctx.beginPath();ctx.ellipse(x,by-8.4,9.8,7.4,0,0,7);fs();
    ctx.strokeStyle='rgba(60,70,90,.45)';ctx.lineWidth=1;for(const yy of [-6,-3.2]){ctx.beginPath();ctx.ellipse(x,by+yy-2,9,3,0,Math.PI*.12,Math.PI*.88);ctx.stroke();}
    ctx.fillStyle='rgba(255,255,255,.4)';ctx.beginPath();ctx.ellipse(x-f*4,by-9,2,3.4,f*.25,0,7);ctx.fill();
    ctx.fillStyle=GOLD;ctx.strokeStyle=OL;ctx.lineWidth=1;ctx.beginPath();ctx.arc(x,by-3.6,1.9,0,7);fs();
    ctx.fillStyle=RED;ctx.beginPath();ctx.roundRect(x-7.8,by-2.4,15.6,2.6,1);fs();
    // square shoulder slabs stacked three high
    for(const k of [-1,1])for(let i=0;i<3;i++){ctx.save();ctx.translate(x+k*(12.4+i*.9),by-15+i*2.7);ctx.rotate(k*(.12+i*.06));ctx.fillStyle=i===0?STEEL:i===1?STEEL2:STEEL;ctx.strokeStyle=OL;ctx.lineWidth=1.2;
      ctx.beginPath();ctx.roundRect(-5.4,-1.9,10.8,3.8,1.2);fs();if(i===0){ctx.strokeStyle=GOLD;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(-4.8,-1.2);ctx.lineTo(4.8,-1.2);ctx.stroke();}ctx.restore();}
    ctx.lineWidth=1.5;ctx.strokeStyle=OL;}
  else if(BERS){
    // leather harness: a vest, crossed straps with studs
    ctx.fillStyle=WV.leather;ctx.beginPath();ctx.moveTo(x-7.4,by-14.5);ctx.lineTo(x+7.4,by-14.5);ctx.lineTo(x+7.6,hip+1);ctx.lineTo(x-7.6,hip+1);ctx.closePath();fs();
    ctx.fillStyle=L.skin;ctx.beginPath();ctx.moveTo(x-3,by-14.5);ctx.lineTo(x+3,by-14.5);ctx.lineTo(x,by-7);ctx.closePath();ctx.fill();
    ctx.strokeStyle='#2a1a10';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x-7,by-14);ctx.lineTo(x+6.6,by-2);ctx.moveTo(x+7,by-14);ctx.lineTo(x-6.6,by-2);ctx.stroke();
    ctx.fillStyle='#c8ccd4';for(const [a,b] of [[-3.6,-11],[3.6,-11],[0,-8],[-3.4,-5],[3.4,-5]]){ctx.beginPath();ctx.arc(x+a,by+b,.75,0,7);ctx.fill();}
    // a ragged cloth kilt below a wide studded belt
    for(let i=0;i<5;i++){const u=-6+i*3,sw2=sway*.2*(i%2?1:-1);ctx.fillStyle=i%2?RED:'#5a140e';ctx.strokeStyle=OL;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x+u-1.6,by);ctx.lineTo(x+u+1.6,by);ctx.lineTo(x+u+1.2+sw2,hip+5+(i%2?1.6:0));ctx.lineTo(x+u+sw2,hip+3.4+(i%2?1.6:0));ctx.lineTo(x+u-1.2+sw2,hip+5+(i%2?1.6:0));ctx.closePath();fs();}
    ctx.fillStyle='#3a2416';ctx.strokeStyle=OL;ctx.lineWidth=1.2;ctx.beginPath();ctx.roundRect(x-8,by-3.4,16,4,1.2);fs();
    ctx.fillStyle='#c8ccd4';for(const a of [-6,-3,3,6]){ctx.beginPath();ctx.arc(x+a,by-1.4,.7,0,7);ctx.fill();}
    ctx.fillStyle=WV.iron;ctx.beginPath();ctx.arc(x,by-1.4,2.4,0,7);fs();ctx.fillStyle='#e0d8c8';ctx.beginPath();ctx.arc(x,by-1.4,.9,0,7);ctx.fill();
    // lopsided shoulders: a big spiked iron guard on one side, a fur pelt over the other
    {const k=-f;ctx.save();ctx.translate(x+k*10.8,by-12.4);ctx.rotate(k*.4);ctx.fillStyle=WV.iron;ctx.strokeStyle=OL;ctx.lineWidth=1.3;ctx.beginPath();ctx.ellipse(0,0,7,4.8,0,0,7);fs();
      ctx.fillStyle='rgba(255,255,255,.25)';ctx.beginPath();ctx.ellipse(-k*2,-1.6,2.4,1,0,0,7);ctx.fill();
      ctx.fillStyle='#e8e0d0';ctx.strokeStyle=OL;ctx.lineWidth=1;for(const [sx2,h,lean] of [[-4,6,-.6],[0,9,0],[4,6,.6]]){ctx.beginPath();ctx.moveTo(sx2-1.8,-3.6);ctx.lineTo(sx2+lean*3+k*.8,-3.6-h);ctx.lineTo(sx2+1.8,-3.6);ctx.closePath();fs();}ctx.restore();}
    {const k=f;ctx.fillStyle=WV.fur;ctx.strokeStyle=OL;ctx.lineWidth=1.1;ctx.beginPath();ctx.moveTo(x-k*2,by-16);for(let i=0;i<=8;i++){const u=i/8,ang=-1.2+u*2.4;ctx.lineTo(x+k*(7+Math.cos(ang)*6.5)+(i%2?k*1.6:0),by-11+Math.sin(ang)*6+(i%2?1:0));}ctx.lineTo(x+k*3,by-6);ctx.closePath();fs();
      ctx.fillStyle='rgba(255,230,190,.22)';ctx.beginPath();ctx.ellipse(x+k*8,by-14,3,1.2,0,0,7);ctx.fill();}
    ctx.lineWidth=1.5;ctx.strokeStyle=OL;}
  else if(RUNE){
    // a fitted blue battle coat with front panels to the knees, a glowing hem
    ctx.fillStyle=WV.coat;ctx.beginPath();ctx.moveTo(x-7.8,by-14.8);ctx.lineTo(x+7.8,by-14.8);ctx.lineTo(x+8,hip+1);ctx.lineTo(x-8,hip+1);ctx.closePath();fs();
    for(const k of [-1,1]){ctx.fillStyle=WV.coat;ctx.beginPath();ctx.moveTo(x+k*2.4,hip);ctx.lineTo(x+k*8,hip);ctx.lineTo(x+k*8.6+sway*.3,y-3.6);ctx.lineTo(x+k*3.2+sway*.3,y-2.6);ctx.closePath();fs();
      glow(()=>{ctx.strokeStyle=GOLD;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x+k*8.6+sway*.3,y-3.8);ctx.lineTo(x+k*3.2+sway*.3,y-2.8);ctx.lineTo(x+k*2.4,hip+.4);ctx.stroke();});ctx.strokeStyle=OL;}
    // a narrow V breastplate with a glowing rune line, and a glowing sash
    ctx.fillStyle=STEEL;ctx.lineWidth=1.1;ctx.beginPath();ctx.moveTo(x-5,by-14.6);ctx.lineTo(x+5,by-14.6);ctx.lineTo(x,by-3.2);ctx.closePath();fs();
    glow(()=>{ctx.strokeStyle=GOLD;ctx.lineWidth=1.1;ctx.beginPath();ctx.moveTo(x,by-12.6);ctx.lineTo(x,by-5.4);ctx.moveTo(x-1.6,by-9.6);ctx.lineTo(x,by-8);ctx.lineTo(x+1.6,by-9.6);ctx.stroke();
      ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x-f*7.4,by-13.6);ctx.lineTo(x+f*7.6,by-.6);ctx.stroke();});
    ctx.fillStyle='#1a2440';ctx.strokeStyle=OL;ctx.lineWidth=1.1;ctx.beginPath();ctx.roundRect(x-7.8,by-2.2,15.6,2.6,1);fs();
    // a tall pointed collar, and blade-shaped shoulder guards sweeping up and out
    for(const k of [-1,1]){ctx.fillStyle=WV.coat;ctx.strokeStyle=OL;ctx.lineWidth=1.1;ctx.beginPath();ctx.moveTo(x+k*3,by-15.4);ctx.lineTo(x+k*8.4,by-23);ctx.lineTo(x+k*7.4,by-14.6);ctx.closePath();fs();
      ctx.fillStyle=STEEL;ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(x+k*6,by-15);ctx.quadraticCurveTo(x+k*12,by-17.5,x+k*17.5,by-21);ctx.quadraticCurveTo(x+k*15,by-14,x+k*11.6,by-9.6);ctx.quadraticCurveTo(x+k*8.2,by-11,x+k*6,by-15);ctx.closePath();fs();
      glow(()=>{ctx.strokeStyle=GOLD;ctx.lineWidth=1.1;ctx.beginPath();ctx.moveTo(x+k*7.6,by-15.6);ctx.quadraticCurveTo(x+k*12.4,by-17.6,x+k*17,by-20.6);ctx.stroke();});ctx.strokeStyle=OL;}
    ctx.lineWidth=1.5;ctx.strokeStyle=OL;}
  else if(KN){
    // breastplate with a soft shine and a gold ember crest
    ctx.fillStyle=STEEL;ctx.beginPath();ctx.moveTo(x-7.2,by-14.5);ctx.lineTo(x+7.2,by-14.5);ctx.lineTo(x+6.6,by-4.5);ctx.quadraticCurveTo(x,by-1.8,x-6.6,by-4.5);ctx.closePath();fs();
    ctx.fillStyle='rgba(255,255,255,.35)';ctx.beginPath();ctx.ellipse(x-f*3,by-11,1.6,3.4,f*.2,0,7);ctx.fill();
    ctx.fillStyle=GOLD;ctx.strokeStyle=OL;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x,by-12.6);ctx.quadraticCurveTo(x+2.8,by-9.6,x+1.6,by-7.2);ctx.quadraticCurveTo(x,by-6,x-1.6,by-7.2);ctx.quadraticCurveTo(x-2.8,by-9.6,x,by-12.6);ctx.closePath();fs();
    ctx.fillStyle=RED;ctx.beginPath();ctx.ellipse(x,by-8.4,.9,1.4,0,0,7);ctx.fill();
    // long red tabard to the knees with a gold border
    ctx.fillStyle=RED;ctx.strokeStyle=OL;ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(x-4.6,by-3);ctx.lineTo(x+4.6,by-3);ctx.lineTo(x+4+sway*.25,y-3.2);ctx.lineTo(x,y-1.8);ctx.lineTo(x-4+sway*.25,y-3.2);ctx.closePath();fs();
    glow(()=>{ctx.strokeStyle=GOLD;ctx.lineWidth=.9;ctx.beginPath();ctx.moveTo(x-3.4,by-1.6);ctx.lineTo(x-3+sway*.25,y-3.6);ctx.lineTo(x,y-2.6);ctx.lineTo(x+3+sway*.25,y-3.6);ctx.lineTo(x+3.4,by-1.6);ctx.stroke();});
    // Bulwark: steel plates over the hips beside the tabard
    if(WV.skirt){ctx.fillStyle=STEEL;ctx.strokeStyle=OL;ctx.lineWidth=1.1;for(const k of [-1,1]){ctx.beginPath();ctx.moveTo(x+k*4.8,by-1.8);ctx.lineTo(x+k*8.4,by-1);ctx.lineTo(x+k*8.8,hip+4.2);ctx.lineTo(x+k*5,hip+4.8);ctx.closePath();fs();
      ctx.strokeStyle=GOLD;ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(x+k*8.6,hip+3.4);ctx.lineTo(x+k*5.1,hip+4);ctx.stroke();ctx.strokeStyle=OL;}}
    ctx.fillStyle=WV.crest;ctx.strokeStyle=OL;ctx.lineWidth=.9;ctx.save();if(WV.glow){ctx.shadowColor=WV.trim;ctx.shadowBlur=7;}ctx.translate(x+sway*.12,by+3.6);ctx.beginPath();ctx.moveTo(0,-3.2);ctx.quadraticCurveTo(2.4,-.6,1.4,1.6);ctx.quadraticCurveTo(0,2.6,-1.4,1.6);ctx.quadraticCurveTo(-2.4,-.6,0,-3.2);ctx.closePath();fs();
    ctx.fillStyle='#ffe9a0';ctx.beginPath();ctx.ellipse(0,.6,.7,1.1,0,0,7);ctx.fill();ctx.restore();
    belt('#4a2e1a',by-2.4);
    // steel neck guard
    if(WV.fur){ctx.fillStyle='#6a4a30';ctx.strokeStyle=OL;ctx.lineWidth=1.1;ctx.beginPath();for(let i=0;i<=10;i++){const u=i/10,xx=x-10+u*20,yy=by-15.5+Math.sin(u*Math.PI)*-1.5+(i%2?1.6:0);ctx.lineTo(xx,yy);}
      ctx.lineTo(x+8,by-13);ctx.quadraticCurveTo(x,by-11.5,x-8,by-13);ctx.closePath();fs();ctx.fillStyle='rgba(255,230,190,.25)';ctx.beginPath();ctx.ellipse(x-3,by-15,3,1,0,0,7);ctx.fill();}
    else{ctx.fillStyle=STEEL2;ctx.strokeStyle=OL;ctx.lineWidth=1.1;ctx.beginPath();ctx.roundRect(x-4.4,by-17.2,8.8,3.4,1.6);fs();}
    // big two-layer shoulder guards with red trim and rivets
    for(const k of [-1,1]){const pz=WV.pz||1,px=x+k*(10.6+(pz-1)*7),py=by-12-(pz-1)*3;ctx.save();ctx.translate(px,py);ctx.rotate(k*.38);ctx.scale(pz,pz);
      ctx.fillStyle=STEEL2;ctx.strokeStyle=OL;ctx.lineWidth=1.3;ctx.beginPath();ctx.ellipse(k*1,3.4,6.6,3.6,0,0,7);fs();
      ctx.fillStyle=STEEL;ctx.beginPath();ctx.moveTo(-6.8,1.4);ctx.quadraticCurveTo(-6.6,-4.6,0,-5.2);ctx.quadraticCurveTo(6.6,-4.6,6.8,1.4);ctx.quadraticCurveTo(0,3.4,-6.8,1.4);ctx.closePath();fs();
      glow(()=>{ctx.strokeStyle=GOLD;ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(-6.2,1);ctx.quadraticCurveTo(0,2.8,6.2,1);ctx.stroke();
        if(WV.glow){ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(-3,-2.6);ctx.lineTo(-1,-.6);ctx.lineTo(1,-2.6);ctx.lineTo(3,-.6);ctx.stroke();}});
      ctx.fillStyle='rgba(255,255,255,.45)';ctx.beginPath();ctx.ellipse(-k*1.8,-2.6,2.2,1,k*-.3,0,7);ctx.fill();
      if(WV.spikes){ctx.fillStyle='#d8d0c0';ctx.strokeStyle=OL;ctx.lineWidth=1;for(const [sx2,h] of [[-3.6,4.6],[0,6.8],[3.6,4.6]]){ctx.beginPath();ctx.moveTo(sx2-1.5,-4.2);ctx.lineTo(sx2+k*.6,-4.2-h);ctx.lineTo(sx2+1.5,-4.2);ctx.closePath();fs();}}
      else{ctx.fillStyle=WV.glow?'#2a4a7a':RED;ctx.strokeStyle=OL;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(-1.4,-5);ctx.lineTo(0,-7.6);ctx.lineTo(1.4,-5);ctx.closePath();fs();}ctx.restore();}
    ctx.lineWidth=1.5;ctx.strokeStyle=OL;}
  else if(out==='warden'){ctx.fillStyle='#b9c0ca';ctx.beginPath();ctx.moveTo(x-6.5,by-14);ctx.lineTo(x+6.5,by-14);ctx.lineTo(x+6,by-5);ctx.quadraticCurveTo(x,by-2.5,x-6,by-5);ctx.closePath();fs();
    ctx.strokeStyle='rgba(255,255,255,.6)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x,by-13);ctx.lineTo(x,by-4);ctx.stroke();
    ctx.fillStyle='#6a707c';for(const [a,b] of [[-4.5,-12],[4.5,-12],[-4,-6.5],[4,-6.5]]){ctx.beginPath();ctx.arc(x+a,by+b,.8,0,7);ctx.fill();}
    belt(D.belt,by-1);ctx.fillStyle='#9a2e24';ctx.strokeStyle=OL;ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(x-3.5,by+.5);ctx.lineTo(x+3.5,by+.5);ctx.lineTo(x+2.5,hip+3.5);ctx.lineTo(x-2.5,hip+3.5);ctx.closePath();fs();
    ctx.fillStyle='#d8dde6';ctx.lineWidth=1.5;for(const k of [-1,1]){ctx.beginPath();ctx.ellipse(x+k*8.4,by-13,4.6,3.6,k*.35,0,7);fs();}}
  else if(AK)outfitPart(AK,'torso',{x,y,by,hip,f,bk,sway,bw,OL,fs,top,dark,lite});
  else if(out==='arcanist'){ctx.strokeStyle=D.trim;ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(x-10,y-3.2);ctx.quadraticCurveTo(x,y-.2,x+10,y-3.2);ctx.stroke();
    ctx.fillStyle=lite;ctx.strokeStyle=OL;ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(x-4.5,by-15.5);ctx.lineTo(x,by-11);ctx.lineTo(x+4.5,by-15.5);ctx.closePath();fs();
    ctx.strokeStyle=D.trim;ctx.lineWidth=2.4;ctx.beginPath();ctx.moveTo(x-7,by-3);ctx.quadraticCurveTo(x,by-1,x+7.4,by-3);ctx.stroke();
    ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(x+f*3,by-2);ctx.lineTo(x+f*4,by+6+sway*.5);ctx.moveTo(x+f*4.6,by-2);ctx.lineTo(x+f*6,by+5+sway*.5);ctx.stroke();
    ctx.fillStyle='#fff6c0';ctx.save();ctx.translate(x,by-8);ctx.beginPath();for(let i=0;i<10;i++){const r=i%2?1:2.6,a=-Math.PI/2+i*Math.PI/5;ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r);}ctx.closePath();ctx.fill();ctx.restore();}
  else if(out==='cleric'){ctx.fillStyle=body;ctx.strokeStyle=OL;ctx.lineWidth=1.1;for(const k of [-1,1]){ctx.beginPath();ctx.moveTo(x+k*2,by-15);ctx.lineTo(x+k*5,by-15);ctx.lineTo(x+k*5.6,y-3);ctx.lineTo(x+k*2.6,y-2.5);ctx.closePath();fs();
      ctx.fillStyle=D.trim;ctx.fillRect(x+k*4.1-1.6,y-5.5,3.2,1.6);ctx.fillStyle=body;}
    ctx.fillStyle='#c8463a';ctx.fillRect(x-1,by-12,2,7);ctx.fillRect(x-3,by-10,6,2);
    ctx.strokeStyle=D.trim;ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(x-10,y-3.2);ctx.quadraticCurveTo(x,y-.2,x+10,y-3.2);ctx.stroke();
    ctx.strokeStyle=D.belt;ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(x-7,by-2.5);ctx.quadraticCurveTo(x,by-1,x+7,by-2.5);ctx.moveTo(x-f*3,by-2);ctx.lineTo(x-f*3.6,by+5);ctx.stroke();}
  else if(out==='ranger'){ctx.fillStyle='#7a5432';ctx.strokeStyle=OL;ctx.lineWidth=1.2;for(const k of [-1,1]){ctx.beginPath();ctx.moveTo(x+k*1.6,by-14);ctx.lineTo(x+k*7.6,by-12.5);ctx.lineTo(x+k*7.4,by-2);ctx.lineTo(x+k*1.8,by-2);ctx.closePath();fs();}
    ctx.strokeStyle='#e8d0a0';ctx.lineWidth=.8;for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(x-1.8,by-12+i*3);ctx.lineTo(x+1.8,by-10.5+i*3);ctx.stroke();}
    ctx.strokeStyle='#5a3a22';ctx.lineWidth=1.8;ctx.beginPath();ctx.moveTo(x-f*7,by-14);ctx.lineTo(x+f*6,by-1);ctx.stroke();
    belt(D.belt,by-1);ctx.fillStyle='#8a909c';ctx.strokeStyle=OL;ctx.lineWidth=1;ctx.beginPath();ctx.roundRect(x+f*5-1,by-.5,2,6,.8);fs();}
  else if(out==='shade'){ctx.strokeStyle='#2a2436';ctx.lineWidth=2.2;ctx.beginPath();ctx.moveTo(x-6.5,by-14);ctx.lineTo(x+6,by-3);ctx.moveTo(x+6.5,by-14);ctx.lineTo(x-6,by-3);ctx.stroke();
    ctx.strokeStyle=D.trim;ctx.lineWidth=.9;ctx.beginPath();ctx.moveTo(x-6.5,by-14);ctx.lineTo(x+6,by-3);ctx.stroke();
    belt(D.belt,by-1);
    // the second dagger in its sheath on the hip
    ctx.save();ctx.translate(x-f*6.5,by+1);ctx.rotate(-f*.5);ctx.fillStyle='#2e2a38';ctx.strokeStyle=OL;ctx.lineWidth=1;ctx.beginPath();ctx.roundRect(-1.6,0,3.2,9,1.2);fs();
    ctx.fillStyle='#9a8ad8';ctx.beginPath();ctx.roundRect(-2.6,-1.4,5.2,1.6,.6);fs();ctx.fillStyle='#2e2a38';ctx.beginPath();ctx.roundRect(-1,-5,2,3.8,.8);fs();ctx.restore();
    // scarf round the neck, its tail streaming behind
    ctx.fillStyle='#6a5a9a';ctx.strokeStyle=OL;ctx.lineWidth=1.2;ctx.beginPath();ctx.roundRect(x-6.5,by-17,13,4.2,2);fs();
    if(!bk){ctx.beginPath();ctx.moveTo(x-f*4,by-15);ctx.quadraticCurveTo(x-f*10,by-14+sway*.4,x-f*14+sway,by-9);ctx.lineTo(x-f*12+sway,by-7);ctx.quadraticCurveTo(x-f*8,by-11,x-f*2,by-13);ctx.closePath();fs();}}
  else{ // novice and townsfolk: tunic with a collar, belt and a pouch
    ctx.fillStyle='rgba(255,255,255,.5)';ctx.beginPath();ctx.moveTo(x-4,by-15.5);ctx.lineTo(x,by-11.5);ctx.lineTo(x+4,by-15.5);ctx.closePath();ctx.fill();
    ctx.strokeStyle='rgba(0,0,0,.25)';ctx.lineWidth=.9;ctx.beginPath();ctx.moveTo(x,by-11.5);ctx.lineTo(x,by-4);ctx.stroke();
    belt(D.belt,by-1.5);ctx.fillStyle='#8a5a2b';ctx.strokeStyle=OL;ctx.lineWidth=1.2;ctx.beginPath();ctx.roundRect(x+f*4.2-2.2,by-.5,4.4,4,1.2);fs();}
  if(opt.armor)drawArmor(x,by-1,f,bk,opt.armor,OL);
  ctx.restore();
  arm(-backArm);
  // ---- head (same size and place as before so hats and face gear still fit) ----
  ctx.lineWidth=1.5;ctx.strokeStyle=OL;ctx.fillStyle=L.skin;ctx.beginPath();ctx.roundRect(x-2.6,by-18.5,5.2,4,1.5);fs();
  if(bk){backLayer();ctx.fillStyle=hair;ctx.strokeStyle=OL;ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(x,hy,12.8,12.3,0,0,7);fs();
    ctx.strokeStyle='rgba(0,0,0,.2)';ctx.lineWidth=1.2;for(const k of [-7,-2.5,2.5,7]){ctx.beginPath();ctx.moveTo(x+k*.5,hy-10);ctx.quadraticCurveTo(x+k*1.15,hy,x+k,hy+10);ctx.stroke();}
    ctx.strokeStyle=OL;ctx.lineWidth=1.5;if(st===2){ctx.fillStyle=hair;ctx.beginPath();ctx.ellipse(x,hy+10+Math.sin(now*4+sd)*.8,4.5,9.5,0,0,7);fs();}}
  else{ctx.fillStyle=L.skin;ctx.beginPath();ctx.ellipse(x,hy,12.5,12,0,0,7);fs();}
  if(!bk){const ex=x+f*2.6,ey=hy+2.5,blink=((now+sd)%4.2)<.12;
    for(const k of [-1,1]){const cx=ex+k*4.8,far=k===-f,w=far?2:2.5;
      if(opt.sit||blink){ctx.strokeStyle=OL;ctx.lineWidth=1.4;ctx.beginPath();if(opt.sit)ctx.arc(cx,ey+1,2.3,Math.PI*1.15,Math.PI*1.85);else{ctx.moveTo(cx-w,ey);ctx.lineTo(cx+w,ey);}ctx.stroke();continue;}
      ctx.fillStyle='#fff';ctx.beginPath();ctx.ellipse(cx,ey,w+.6,4,0,0,7);ctx.fill();
      ctx.fillStyle=L.eye;ctx.beginPath();ctx.ellipse(cx+f*.4,ey+.5,w,3.6,0,0,7);ctx.fill();
      ctx.fillStyle='#14100c';ctx.beginPath();ctx.ellipse(cx+f*.5,ey+1,w*.5,1.9,0,0,7);ctx.fill();
      ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(cx-.6,ey-1.2,1.1,0,7);ctx.fill();ctx.beginPath();ctx.arc(cx+1,ey+2,.5,0,7);ctx.fill();
      ctx.strokeStyle=OL;ctx.lineWidth=(L.body|0)===1?2.3:1.6;ctx.beginPath();ctx.moveTo(cx-w-.8,ey-3.4);ctx.quadraticCurveTo(cx,ey-4.8,cx+w+.8,ey-3.4);ctx.stroke();
      if(HERO2_HI){ctx.strokeStyle=OL;ctx.lineWidth=.7;const o=k===f?1:-1;ctx.beginPath();ctx.moveTo(cx+o*(w+.5),ey-3.1);ctx.lineTo(cx+o*(w+1.7),ey-4.3);ctx.moveTo(cx+o*(w+.2),ey-2);ctx.lineTo(cx+o*(w+1.4),ey-2.6);ctx.stroke();
        ctx.fillStyle='rgba(255,255,255,.55)';ctx.beginPath();ctx.ellipse(cx+f*.6,ey+2.1,w*.55,.55,0,0,7);ctx.fill();}
      if((L.body|0)===2){const o=k===f?1:-1;ctx.lineWidth=1.1;ctx.beginPath();ctx.moveTo(cx+o*(w+.4),ey-2.6);ctx.lineTo(cx+o*(w+2),ey-4);ctx.moveTo(cx+o*(w+.6),ey-1.4);ctx.lineTo(cx+o*(w+2.3),ey-2.2);ctx.stroke();}}
    ctx.fillStyle='rgba(240,120,120,.35)';for(const k of [-1,1]){ctx.beginPath();ctx.ellipse(ex+k*6.5,hy+6.5,2.2,1.2,0,0,7);ctx.fill();}
    ctx.strokeStyle='#7a3a2a';ctx.lineWidth=1.1;ctx.beginPath();ctx.arc(ex,hy+7,1.4,.2,Math.PI-.2);ctx.stroke();
    // fringe: zig-zag bangs swept to the facing side (Short: a neat, even fringe)
    ctx.fillStyle=hair;ctx.strokeStyle=OL;ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(x-13,hy+2);
    if(st===7){ctx.lineTo(x-12,hy-4);ctx.quadraticCurveTo(x+f*2,hy-6.5,x+12,hy-4);}
    else{const sw=f*1.5;for(let i=0;i<5;i++){const px=x-13+i*5.2;ctx.lineTo(px+2.6+sw,hy-(i%2?2:5)+(st===4?1:0));ctx.lineTo(px+5.2,hy-6.5);}}
    ctx.lineTo(x+13,hy+2);ctx.arc(x,hy-1,13.2,0.15,Math.PI-0.15,true);ctx.closePath();fs();}
  if(st===0)for(let i=-2;i<=2;i++){const px=x+i*5;ctx.beginPath();ctx.moveTo(px-3.5,hy-11+Math.abs(i));ctx.lineTo(px+f*2+i*1.5,hy-18-(i%2?0:2)+Math.abs(i)*1.5);ctx.lineTo(px+3.5,hy-11+Math.abs(i));ctx.closePath();fs();}
  if(st===5)for(let i=-1;i<=1;i++){ctx.beginPath();ctx.arc(x+i*6,hy-12+Math.abs(i)*2,4.5,0,7);fs();}
  if(!bk&&(st===1||st===3||st===4))for(const k of [-1,1]){ctx.beginPath();ctx.moveTo(x+k*12.5,hy-3);ctx.quadraticCurveTo(x+k*14,hy+4,x+k*11,hy+(st===4?9:11));ctx.lineTo(x+k*10.5,hy);ctx.closePath();fs();}
  // Braid: one plait over the shoulder on the side away from the viewer's facing
  if(st===6&&!bk){const bx=x-f*10;for(let i=0;i<4;i++){ctx.beginPath();ctx.ellipse(bx+f*i*.6+Math.sin(now*3+i)*.4,hy+4+i*4.2,3.6-i*.3,2.8,0,0,7);fs();}
    ctx.fillStyle='#e04a6a';ctx.beginPath();ctx.arc(bx+f*2.4,hy+20,1.8,0,7);fs();ctx.fillStyle=hair;}
  if(st===7&&!bk){ctx.beginPath();ctx.moveTo(x+f*12.5,hy-3);ctx.quadraticCurveTo(x+f*13.4,hy+2,x+f*11.6,hy+4);ctx.lineTo(x+f*10.8,hy-1);ctx.closePath();fs();}
  if(st===2||st===3){ctx.fillStyle='#e04a6a';for(const k of st===3?[-1,1]:[bk?0:-f]){ctx.beginPath();ctx.arc(x+k*12,hy+(bk&&st===2?2:-5),2.2,0,7);fs();}}
  if(HERO2_HI){ctx.save();ctx.beginPath();ctx.ellipse(x,hy-1,13.2,13,0,Math.PI,0);ctx.clip();
    ctx.strokeStyle='rgba(0,0,0,.22)';ctx.lineWidth=.55;for(let i=-4;i<=4;i++){ctx.beginPath();ctx.moveTo(x+i*2.6,hy-13.5);ctx.quadraticCurveTo(x+i*3.2+f*1.5,hy-8,x+i*3.1+f*.8,hy-3);ctx.stroke();}
    ctx.strokeStyle='rgba(255,255,255,.42)';ctx.lineWidth=1.6;ctx.beginPath();ctx.arc(x-f*1.5,hy+3,12.2,Math.PI*1.18,Math.PI*1.52);ctx.stroke();
    ctx.strokeStyle='rgba(255,255,255,.25)';ctx.lineWidth=.8;ctx.beginPath();ctx.arc(x-f*1.5,hy+3,10.4,Math.PI*1.22,Math.PI*1.45);ctx.stroke();ctx.restore();}
  else{ctx.fillStyle='rgba(255,255,255,.22)';ctx.beginPath();ctx.ellipse(x-f*4,hy-9,4,1.5,-f*.3,0,7);ctx.fill();}
  if(!bk&&(opt.fc||opt.mo)&&typeof drawFaceGear==='function')drawFaceGear(opt.fc,opt.mo,x,hy,f);
  if(opt.hat){ctx.save();ctx.translate(x,hy);ctx.scale(1.35,1.35);ctx.translate(-x,-hy);drawHat(opt.hat,x,hy,f);ctx.restore();}
  return by;
}
/* preview switch: loaded right after render.js so job looks (joblooks.js) and other wrappers sit on top of it.
   On by default (v1.15.0). ?hero2=0 / ?hero2=1 in the address is remembered on this device; only how this screen draws heroes changes. */
const HERO2_ON=(()=>{try{const m=/[?&]hero2=([01])/.exec(location.search);if(m)localStorage.setItem('embervale.hero2',m[1]);return localStorage.getItem('embervale.hero2')!=='0';}catch(e){return true;}})();
/* drawHuman becomes a switch between the classic and the new art, so wrappers loaded later (job looks) apply to
   both: the new art is used when the preview is on, or while a big portrait is drawn (HERO2_HI) */
const drawHumanClassic=drawHuman;
drawHuman=function(){return (HERO2_ON||HERO2_HI?drawHuman2:drawHumanClassic).apply(this,arguments);};

