"use strict";
/* ================= hero art v2 (preview: ?hero2=1 turns it on for this device, ?hero2=0 off) =================
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
function drawHuman2(x,y,body,hair,face,walk,opt={}){
  const L=opt.look||{style:0,eye:'#5a3a22',skin:'#f6d6b8',seed:0};hair=L.hair||hair;
  const f=face<0?-1:1,out=HERO2_DRESS[opt.outfit]?opt.outfit:'npc',D=HERO2_DRESS[out],OL='#2a1c14',st=L.style|0,bk=!!opt.back,sd=L.seed||0;
  const wk=walk?Math.sin(walk*12):0,bob=walk?Math.abs(wk)*1.4:0,br=walk||opt.sit?0:Math.sin(now*2.2+sd),sit=opt.sit?7:0;
  /* breathing: the whole body rises and settles a little (feet stay on the ground), the head follows a beat later */
  const breath=opt.sit?Math.sin(now*2.2+sd)*.3:br*.5;
  const by=y-9-bob+sit-breath,hy=by-20-Math.sin(now*2.2+sd-.6)*.2,robe=out==='arcanist'||out==='cleric',bw=BUILD_W[L.body|0]||1;
  const top=out==='cleric'?'#f4efe2':body,dark=hero2Shade(top,-38),lite=hero2Shade(top,30);
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
    if(out==='warden'){ctx.fillStyle='#9a2e24';ctx.beginPath();ctx.moveTo(x-8*bw,by-14);ctx.lineTo(x+8*bw,by-14);ctx.quadraticCurveTo(x+11-f*3,by-2,x+10-f*4+sway,y-1);
      ctx.lineTo(x-10-f*4+sway,y-1);ctx.quadraticCurveTo(x-11-f*3,by-2,x-8*bw,by-14);ctx.closePath();fs();
      ctx.strokeStyle='rgba(0,0,0,.2)';ctx.lineWidth=1;for(const k of [-4,0,4]){ctx.beginPath();ctx.moveTo(x+k,by-10);ctx.lineTo(x+k*1.2-f*3+sway,y-3);ctx.stroke();}ctx.lineWidth=1.5;ctx.strokeStyle=OL;}
    if(out==='ranger'){ctx.save();ctx.translate(x-f*7,by-9);ctx.rotate(f*.4);ctx.fillStyle='#6b4423';ctx.beginPath();ctx.roundRect(-3.5,-13,7,18,2.5);fs();
      ctx.fillStyle='#e8e0d0';for(const k of [-2,0,2]){ctx.beginPath();ctx.moveTo(k,-13);ctx.lineTo(k-1.6,-18);ctx.lineTo(k+1.6,-18);ctx.closePath();ctx.fill();}
      ctx.fillStyle='#c84a3a';for(const k of [-2,0,2])ctx.fillRect(k-1,-14.5,2,1.6);ctx.restore();
      ctx.fillStyle='#3f7a46';ctx.beginPath();ctx.ellipse(x-f*3,by-15,8,4.5,0,0,7);fs();}
    if(out==='arcanist'){ctx.fillStyle=dark;ctx.beginPath();ctx.ellipse(x-f*2,by-15.5,8.5,4,0,0,7);fs();}};
  if(!bk)backLayer();
  // ---- legs: trousers and boots; a stride while walking (robes show only the boots under the hem) ----
  const hip=by+1;
  if(!opt.sit){for(const k of [-1,1]){const s=k*wk*3.4+k*(opt.stance||0),lift=walk?Math.max(0,-k*wk)*1.6:0,fx=x+k*3.6+s,fy=y-1.5-lift;
      if(!robe){ctx.strokeStyle=OL;ctx.lineWidth=6.2;ctx.beginPath();ctx.moveTo(x+k*3.6,hip-2);ctx.lineTo(fx,fy-2.5);ctx.stroke();
        ctx.strokeStyle=D.pant;ctx.lineWidth=3.6;ctx.beginPath();ctx.moveTo(x+k*3.6,hip-2);ctx.lineTo(fx,fy-2.5);ctx.stroke();}
      ctx.lineWidth=1.5;ctx.strokeStyle=OL;ctx.fillStyle=D.boot;ctx.beginPath();ctx.roundRect(fx-3,fy-5,6,5,2);fs();
      ctx.beginPath();ctx.ellipse(fx+f*1.3,fy-.6,3.9,2.4,0,0,7);fs();
      ctx.fillStyle='rgba(255,255,255,.18)';ctx.fillRect(fx-2.6,fy-4.6,5.2,1.3);}}
  else{ctx.lineWidth=1.5;ctx.strokeStyle=OL;ctx.fillStyle=robe?top:D.pant;
    for(const k of [-1,1]){ctx.beginPath();ctx.ellipse(x+k*7,y-2.5,6.5,3.6,k*.18,0,7);fs();}
    ctx.fillStyle=D.boot;for(const k of [-1,1]){ctx.beginPath();ctx.ellipse(x+k*2.5,y,3.4,2.4,0,0,7);fs();}}
  // ---- arms: shoulder to hand, swinging against the legs; up while casting; on the knees when sitting ----
  const hand=k=>{if(opt.hands){const h=opt.hands[k===f?0:1];return [x+f*h[0],by+h[1]];}if(opt.sit)return [x+k*10*bw,y-4];if(opt.cast)return [x+k*11.5*bw,by-17+Math.sin(now*9+k)*1.2];
    return [x+k*9.6*bw-k*wk*f*0+(walk?-k*wk*2.6:0),by-3+(walk?Math.abs(wk)*-.6:0)+br*.3];};
  const sleeve=out==='warden'?'#c9d0da':out==='cleric'?'#f4efe2':top;
  const arm=k=>{const sx=x+k*8*bw,sy=by-12,[hx,hy2]=hand(k);
    ctx.strokeStyle=OL;ctx.lineWidth=6.4;ctx.beginPath();ctx.moveTo(sx,sy);ctx.lineTo(hx,hy2-1.5);ctx.stroke();
    ctx.strokeStyle=sleeve;ctx.lineWidth=3.8;ctx.beginPath();ctx.moveTo(sx,sy);ctx.lineTo(hx,hy2-1.5);ctx.stroke();
    if(out==='arcanist'||out==='cleric'){ctx.fillStyle=sleeve;ctx.strokeStyle=OL;ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(hx-3.4,hy2-4.5);ctx.lineTo(hx+3.4,hy2-4.5);ctx.lineTo(hx+4.2,hy2-.5);ctx.lineTo(hx-4.2,hy2-.5);ctx.closePath();fs();
      ctx.strokeStyle=D.trim;ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(hx-4,hy2-1);ctx.lineTo(hx+4,hy2-1);ctx.stroke();}
    else{ctx.fillStyle=out==='warden'?'#8a909c':D.trim;ctx.strokeStyle=OL;ctx.lineWidth=1.2;ctx.beginPath();ctx.ellipse(hx,hy2-2.2,2.8,1.6,0,0,7);fs();}
    ctx.lineWidth=1.5;ctx.strokeStyle=OL;ctx.fillStyle=L.skin;ctx.beginPath();ctx.arc(hx,hy2,2.7,0,7);fs();};
  arm(-f);
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
  else if(out==='warden'){ctx.fillStyle='#b9c0ca';ctx.beginPath();ctx.moveTo(x-6.5,by-14);ctx.lineTo(x+6.5,by-14);ctx.lineTo(x+6,by-5);ctx.quadraticCurveTo(x,by-2.5,x-6,by-5);ctx.closePath();fs();
    ctx.strokeStyle='rgba(255,255,255,.6)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x,by-13);ctx.lineTo(x,by-4);ctx.stroke();
    ctx.fillStyle='#6a707c';for(const [a,b] of [[-4.5,-12],[4.5,-12],[-4,-6.5],[4,-6.5]]){ctx.beginPath();ctx.arc(x+a,by+b,.8,0,7);ctx.fill();}
    belt(D.belt,by-1);ctx.fillStyle='#9a2e24';ctx.strokeStyle=OL;ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(x-3.5,by+.5);ctx.lineTo(x+3.5,by+.5);ctx.lineTo(x+2.5,hip+3.5);ctx.lineTo(x-2.5,hip+3.5);ctx.closePath();fs();
    ctx.fillStyle='#d8dde6';ctx.lineWidth=1.5;for(const k of [-1,1]){ctx.beginPath();ctx.ellipse(x+k*8.4,by-13,4.6,3.6,k*.35,0,7);fs();}}
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
  else{ // novice and townsfolk: tunic with a collar, belt and a pouch
    ctx.fillStyle='rgba(255,255,255,.5)';ctx.beginPath();ctx.moveTo(x-4,by-15.5);ctx.lineTo(x,by-11.5);ctx.lineTo(x+4,by-15.5);ctx.closePath();ctx.fill();
    ctx.strokeStyle='rgba(0,0,0,.25)';ctx.lineWidth=.9;ctx.beginPath();ctx.moveTo(x,by-11.5);ctx.lineTo(x,by-4);ctx.stroke();
    belt(D.belt,by-1.5);ctx.fillStyle='#8a5a2b';ctx.strokeStyle=OL;ctx.lineWidth=1.2;ctx.beginPath();ctx.roundRect(x+f*4.2-2.2,by-.5,4.4,4,1.2);fs();}
  if(opt.armor)drawArmor(x,by-1,f,bk,opt.armor,OL);
  ctx.restore();
  arm(f);
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
   ?hero2=1 / ?hero2=0 in the address is remembered on this device; only how this screen draws heroes changes. */
const HERO2_ON=(()=>{try{const m=/[?&]hero2=([01])/.exec(location.search);if(m)localStorage.setItem('embervale.hero2',m[1]);return localStorage.getItem('embervale.hero2')==='1';}catch(e){return false;}})();
/* drawHuman becomes a switch between the classic and the new art, so wrappers loaded later (job looks) apply to
   both: the new art is used when the preview is on, or while a big portrait is drawn (HERO2_HI) */
const drawHumanClassic=drawHuman;
drawHuman=function(){return (HERO2_ON||HERO2_HI?drawHuman2:drawHumanClassic).apply(this,arguments);};

