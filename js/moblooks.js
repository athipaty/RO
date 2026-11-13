"use strict";
/* ================= every monster its own look =================
   Monsters used to share a few body shapes (blob, beast, bug, mushroom, ghost, golem) and differ only in colour.
   Each monster listed here is drawn its own way instead: a cave bat is a bat, a stone crab a crab, a webspinner a
   spider. At most two monsters share a design, and then only a regular monster and its own leader
   (Hopper and Hopper Chieftain, Grey Lupe and Greymane Alpha, Dune Scarab and Scarab Queen, Gloomcap and
   Gloomcap King), and the leader still wears something extra. Ember Imp and Ice Imp share the imp body.
   Called from drawMob (render.js) with o = {x, y (ground), s (size), f (facing ±1), t (time), col, dark, lite, mv}.
   Up on screen is minus y. Monster pictures in the codex, quests and bestiary use the same drawing. */
const MOB_LOOKS={};
// lighter or darker by an amount (-255..255). The game's shade() in icons.js takes a fraction instead.
function mlShade(hex,amt){if(!/^#[0-9a-f]{6}$/i.test(hex))return hex;const n=parseInt(hex.slice(1),16),c=v=>Math.max(0,Math.min(255,v+amt));return `rgb(${c(n>>16)},${c(n>>8&255)},${c(n&255)})`;}
const mlPoly=pts=>{ctx.beginPath();pts.forEach(([a,b],i)=>i?ctx.lineTo(a,b):ctx.moveTo(a,b));ctx.closePath();};
const mlFill=(c,fn)=>{ctx.fillStyle=c;ctx.beginPath();fn();ctx.fill();};
// four legs for animals, trotting while they move
function mlLegs(o,cx,top,span,w,col){const {x,y,s,t,mv}=o;ctx.strokeStyle=col||o.dark;ctx.lineWidth=w||Math.max(2.5,s*.22);ctx.lineCap='round';
  [[-span,0],[-span*.45,Math.PI],[span*.45,Math.PI*.5],[span,Math.PI*1.5]].forEach(([k,ph])=>{const sw=mv?Math.sin(t*12+ph)*s*.22:0;ctx.beginPath();ctx.moveTo(cx+k*s,y-top);ctx.lineTo(cx+k*s+sw,y);ctx.stroke();});}
function mlEye(x,y,r,col='#1a1a1a',glow){if(glow){ctx.shadowColor=glow;ctx.shadowBlur=8;}ctx.fillStyle=col;ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.fill();ctx.shadowBlur=0;
  if(!glow){ctx.fillStyle='rgba(255,255,255,.85)';ctx.beginPath();ctx.arc(x-r*.35,y-r*.35,r*.35,0,7);ctx.fill();}}
function mlCrown(x,y,w,col='#ffcf5a'){ctx.fillStyle=col;mlPoly([[x-w,y],[x-w,y-w*.8],[x-w*.5,y-w*.35],[x,y-w*1.05],[x+w*.5,y-w*.35],[x+w,y-w*.8],[x+w,y]]);ctx.fill();
  ctx.fillStyle='#e0522a';ctx.beginPath();ctx.arc(x,y-w*.3,w*.18,0,7);ctx.fill();}

/* ---------- blobs ---------- */
MOB_LOOKS.dewdrop=(m,o)=>{const {x,y,s,t,col,lite,mv}=o;const q=Math.sin(t*(mv?9:3))*s*.08;shadow(x,y,s*.9);
  const tip=y-s*2.25+q;ctx.globalAlpha*=.92;ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(x,tip);ctx.quadraticCurveTo(x+s*1.05,y-s*1.3,x+s,y-s*.8);
  ctx.arc(x,y-s*.8,s,0,Math.PI,false);ctx.quadraticCurveTo(x-s*1.05,y-s*1.3,x,tip);ctx.fill();
  ctx.strokeStyle=o.dark;ctx.lineWidth=1.5;ctx.stroke();
  ctx.fillStyle='rgba(255,255,255,.55)';ctx.beginPath();ctx.ellipse(x-s*.45,y-s*1.25,s*.18,s*.38,-.4,0,7);ctx.fill();
  ctx.fillStyle=lite;ctx.globalAlpha*=.6;ctx.beginPath();ctx.ellipse(x+s*.2,y-s*.35,s*.5,s*.18,0,0,7);ctx.fill();ctx.globalAlpha/=.6;
  eyes(x,y-s*.85,s*.85,o.f);
  ctx.strokeStyle='rgba(255,255,255,.35)';ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(x,y+1,s*(1.1+Math.sin(t*2)*.1),s*.35,0,0,7);ctx.stroke();};
MOB_LOOKS.cactoid=(m,o)=>{const {x,y,s,t,col,dark}=o;const sw=Math.sin(t*2)*.05;shadow(x,y,s*.8);ctx.save();ctx.translate(x,y);ctx.rotate(sw);
  ctx.fillStyle=col;ctx.beginPath();ctx.roundRect(-s*.55,-s*2.3,s*1.1,s*2.3,s*.55);ctx.fill();
  ctx.beginPath();ctx.roundRect(-s*1.2,-s*1.65,s*.45,s*.85,s*.22);ctx.roundRect(-s*1.2,-s*1.05,s*.75,s*.36,s*.18);
  ctx.roundRect(s*.75,-s*2.0,s*.45,s*.9,s*.22);ctx.roundRect(s*.45,-s*1.35,s*.75,s*.36,s*.18);ctx.fill();
  ctx.strokeStyle=dark;ctx.lineWidth=1.5;for(const k of [-.25,0,.25]){ctx.beginPath();ctx.moveTo(k*s,-s*2.1);ctx.lineTo(k*s,-s*.2);ctx.stroke();}
  ctx.fillStyle='#fff6d8';for(const [a,b] of [[-.45,-1.9],[.42,-1.6],[-.4,-1.0],[.45,-.6],[-1.05,-1.45],[1.0,-1.8]]){ctx.beginPath();ctx.arc(a*s,b*s,1.3,0,7);ctx.fill();}
  ctx.fillStyle='#f07ca0';for(let k=0;k<5;k++){const a=k/5*Math.PI*2+t;ctx.beginPath();ctx.arc(Math.cos(a)*s*.22,-s*2.35+Math.sin(a)*s*.12,s*.16,0,7);ctx.fill();}
  ctx.fillStyle='#ffd24a';ctx.beginPath();ctx.arc(0,-s*2.35,s*.12,0,7);ctx.fill();ctx.restore();
  eyes(x,y-s*1.55,s*.9,o.f);ctx.strokeStyle='#2a3a1a';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(x+o.f*s*.1,y-s*1.25,s*.18,.3,Math.PI-.3);ctx.stroke();};
MOB_LOOKS.snowhulk=(m,o)=>{const {x,y,s,t,f,mv}=o;const b=mv?Math.abs(Math.sin(t*7))*s*.12:0;shadow(x,y,s*1.05);
  const body='#eef4f8',edge='#b8c8d6';ctx.fillStyle=body;ctx.strokeStyle=edge;ctx.lineWidth=2;
  ctx.beginPath();ctx.arc(x,y-s*.95-b,s*.98,0,7);ctx.fill();ctx.stroke();ctx.beginPath();ctx.arc(x,y-s*2.25-b,s*.62,0,7);ctx.fill();ctx.stroke();
  ctx.strokeStyle='#6b4a2a';ctx.lineWidth=2.5;ctx.lineCap='round';const wv=Math.sin(t*(mv?8:2))*s*.25;
  for(const k of [-1,1]){ctx.beginPath();ctx.moveTo(x+k*s*.85,y-s*1.4-b);ctx.lineTo(x+k*s*1.7,y-s*1.9-b+(k>0?wv:-wv));ctx.lineTo(x+k*s*1.95,y-s*2.25-b+(k>0?wv:-wv));ctx.stroke();}
  ctx.fillStyle='#c84a3a';ctx.fillRect(x-s*.62,y-s*1.78-b,s*1.24,s*.24);ctx.fillRect(x+f*s*.25,y-s*1.7-b,s*.22,s*.55);
  for(const k of [-1,1])mlEye(x+k*s*.22+f*s*.1,y-s*2.35-b,s*.09);
  ctx.strokeStyle='#2a2a2a';ctx.lineWidth=2;for(const k of [-1,1]){ctx.beginPath();ctx.moveTo(x+k*s*.38+f*s*.1,y-s*2.55-b);ctx.lineTo(x+k*s*.08+f*s*.1,y-s*2.47-b);ctx.stroke();}
  ctx.fillStyle='#ef8a3a';mlPoly([[x+f*s*.05,y-s*2.25-b],[x+f*s*.75,y-s*2.18-b],[x+f*s*.05,y-s*2.12-b]]);ctx.fill();
  ctx.fillStyle='#2a2a2a';for(const k of [-.5,0,.5]){ctx.beginPath();ctx.arc(x,y-s*(1.05+k*.35)-b,s*.07,0,7);ctx.fill();}};
MOB_LOOKS.thornmother=(m,o)=>{const {x,y,s,t,col,dark,f}=o;shadow(x,y,s*1.3);
  ctx.strokeStyle='#2f5a24';ctx.lineWidth=s*.12;ctx.lineCap='round';
  for(let k=0;k<4;k++){const a=k/4*Math.PI*2+.4,w=Math.sin(t*1.5+k)*s*.15;ctx.beginPath();ctx.moveTo(x,y-s*.3);ctx.quadraticCurveTo(x+Math.cos(a)*s*1.1+w,y+Math.sin(a)*s*.25,x+Math.cos(a)*s*1.6,y-s*.05+Math.sin(a)*s*.3);ctx.stroke();
    ctx.fillStyle='#1f3a18';for(let j=1;j<4;j++){const px=x+Math.cos(a)*s*.4*j,py=y-s*.2+Math.sin(a)*s*.1*j;mlPoly([[px-3,py],[px,py-7],[px+3,py]]);ctx.fill();}}
  ctx.fillStyle='#d86a9a';for(let k=0;k<9;k++){const a=k/9*Math.PI*2+Math.sin(t)*.05;ctx.save();ctx.translate(x,y-s*1.25);ctx.rotate(a);ctx.beginPath();ctx.ellipse(0,-s*.95,s*.32,s*.6,0,0,7);ctx.fill();ctx.restore();}
  ctx.fillStyle=col;ctx.beginPath();ctx.arc(x,y-s*1.25,s*.82,0,7);ctx.fill();ctx.strokeStyle=dark;ctx.lineWidth=3;ctx.stroke();
  ctx.fillStyle='#3a0f14';ctx.beginPath();ctx.ellipse(x+f*s*.05,y-s*1.0,s*.42,s*.24+Math.abs(Math.sin(t*2))*s*.08,0,0,7);ctx.fill();
  ctx.fillStyle='#fff6e0';for(let k=-3;k<=3;k++){mlPoly([[x+f*s*.05+k*s*.11-3,y-s*1.2],[x+f*s*.05+k*s*.11,y-s*1.07],[x+f*s*.05+k*s*.11+3,y-s*1.2]]);ctx.fill();}
  for(const k of [-1,1])mlEye(x+k*s*.3+f*s*.08,y-s*1.5,s*.11,'#ffd24a','#ffd24a');
  ctx.strokeStyle='#1f3a18';ctx.lineWidth=3;for(const k of [-1,1]){ctx.beginPath();ctx.moveTo(x+k*s*.5,y-s*1.75);ctx.lineTo(x+k*s*.15,y-s*1.62);ctx.stroke();}};

/* ---------- beasts ---------- */
function mlRabbit(m,o,chief){const {x,y,s,t,f,col,dark,lite,mv}=o;const hop=mv?Math.abs(Math.sin(t*8))*s*.55:0;shadow(x,y,s*(1-hop/(s*2)));
  const by=y-s*.8-hop;ctx.fillStyle=col;ctx.beginPath();ctx.ellipse(x,by,s,s*.78,0,0,7);ctx.fill();
  ctx.fillStyle=lite;ctx.beginPath();ctx.ellipse(x+f*s*.15,by+s*.25,s*.55,s*.4,0,0,7);ctx.fill();
  ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(x-f*s*.95,by-s*.1,s*.32,0,7);ctx.fill();
  const hx=x+f*s*.7,hy=by-s*.7;ctx.fillStyle=col;ctx.beginPath();ctx.arc(hx,hy,s*.6,0,7);ctx.fill();
  for(const [k,a] of [[-1,-.25],[1,.1]]){ctx.save();ctx.translate(hx+k*s*.2,hy-s*.45);ctx.rotate(a+Math.sin(t*3+k)*.08-f*.15);
    ctx.fillStyle=col;ctx.beginPath();ctx.ellipse(0,-s*.6,s*.2,s*.65,0,0,7);ctx.fill();ctx.fillStyle='#f4b8c8';ctx.beginPath();ctx.ellipse(0,-s*.6,s*.09,s*.48,0,0,7);ctx.fill();ctx.restore();}
  mlEye(hx+f*s*.25,hy-s*.05,s*.12);ctx.fillStyle='#e87a9a';ctx.beginPath();ctx.arc(hx+f*s*.55,hy+s*.12,s*.08,0,7);ctx.fill();
  ctx.fillStyle=dark;for(const k of [-.5,.4]){ctx.beginPath();ctx.ellipse(x+k*s,y-hop*.3-s*.08,s*.28,s*.12,0,0,7);ctx.fill();}
  if(chief){ctx.fillStyle='#c84a3a';ctx.fillRect(hx-s*.6,hy-s*.42,s*1.2,s*.2);ctx.strokeStyle='#e8c870';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(hx-f*s*.5,hy-s*.35);ctx.quadraticCurveTo(hx-f*s*1.2,hy-s*1.3,hx-f*s*.7,hy-s*1.9);ctx.stroke();
    ctx.fillStyle='#e8c870';ctx.beginPath();ctx.ellipse(hx-f*s*.85,hy-s*1.35,s*.14,s*.45,f*.5,0,7);ctx.fill();
    ctx.strokeStyle='#7a2a1a';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(hx+f*s*.1,hy-s*.3);ctx.lineTo(hx+f*s*.35,hy+s*.15);ctx.stroke();}}
MOB_LOOKS.hopper=(m,o)=>mlRabbit(m,o,false);
MOB_LOOKS.hopperchief=(m,o)=>mlRabbit(m,o,true);
function mlWolf(m,o,alpha){const {x,y,s,t,f,col,dark,lite,mv}=o;shadow(x,y,s*1.15);mlLegs(o,x,s*.6,.7);
  const b=mv?Math.abs(Math.sin(t*12))*s*.08:0,by=y-s*.85-b;
  ctx.strokeStyle=col;ctx.lineWidth=s*.38;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x-f*s*.9,by-s*.1);ctx.quadraticCurveTo(x-f*s*1.5,by-s*.5,x-f*s*1.35,by-s*1.0+Math.sin(t*4)*s*.1);ctx.stroke();
  ctx.fillStyle=col;ctx.beginPath();ctx.ellipse(x,by,s*1.05,s*.55,0,0,7);ctx.fill();
  ctx.fillStyle=lite;ctx.beginPath();ctx.ellipse(x+f*s*.2,by+s*.25,s*.65,s*.22,0,0,7);ctx.fill();
  const hx=x+f*s*.95,hy=by-s*.55;
  if(alpha){ctx.fillStyle=dark;for(let k=0;k<9;k++){const a=k/9*Math.PI*2;mlPoly([[hx-f*s*.2+Math.cos(a)*s*.45,hy+Math.sin(a)*s*.45],[hx-f*s*.2+Math.cos(a+.35)*s*.85,hy+Math.sin(a+.35)*s*.85],[hx-f*s*.2+Math.cos(a+.7)*s*.45,hy+Math.sin(a+.7)*s*.45]]);ctx.fill();}}
  ctx.fillStyle=col;ctx.beginPath();ctx.arc(hx,hy,s*.48,0,7);ctx.fill();
  mlPoly([[hx+f*s*.2,hy-s*.15],[hx+f*s*.95,hy+s*.05],[hx+f*s*.2,hy+s*.25]]);ctx.fill();
  ctx.fillStyle='#1a1a1a';ctx.beginPath();ctx.arc(hx+f*s*.92,hy+s*.04,s*.08,0,7);ctx.fill();
  ctx.fillStyle=dark;for(const k of [-1,1]){mlPoly([[hx+k*s*.25-s*.12,hy-s*.3],[hx+k*s*.25+f*s*.05,hy-s*.9],[hx+k*s*.25+s*.15,hy-s*.3]]);ctx.fill();}
  if(alpha){mlEye(hx+f*s*.22,hy-s*.12,s*.09,'#ff4a3a','#ff4a3a');ctx.strokeStyle='#f0e0d0';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(hx+f*s*.05,hy-s*.35);ctx.lineTo(hx+f*s*.35,hy+s*.1);ctx.stroke();}
  else mlEye(hx+f*s*.22,hy-s*.12,s*.09);}
MOB_LOOKS.greylupe=(m,o)=>mlWolf(m,o,false);
MOB_LOOKS.lupealpha=(m,o)=>mlWolf(m,o,true);
MOB_LOOKS.rimestalker=(m,o)=>{const {x,y,s,t,f,col,dark,lite,mv}=o;shadow(x,y,s*1.2);mlLegs(o,x,s*.5,.75,s*.18);
  const by=y-s*.65;ctx.strokeStyle=col;ctx.lineWidth=s*.2;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x-f*s*.95,by);
  ctx.bezierCurveTo(x-f*s*1.6,by-s*.2+Math.sin(t*3)*s*.2,x-f*s*1.3,by-s*1.1,x-f*s*1.85,by-s*1.25+Math.sin(t*3+1)*s*.2);ctx.stroke();
  ctx.fillStyle=col;ctx.beginPath();ctx.ellipse(x,by,s*1.1,s*.42,0,0,7);ctx.fill();
  ctx.fillStyle='#e8f6ff';for(let k=-2;k<=2;k++){const px=x+k*s*.32;mlPoly([[px-s*.12,by-s*.32],[px+f*s*.04,by-s*.75-Math.abs(k===0?1:0)*s*.15],[px+s*.12,by-s*.32]]);ctx.fill();}
  const hx=x+f*s*1.0,hy=by-s*.35;ctx.fillStyle=col;ctx.beginPath();ctx.arc(hx,hy,s*.42,0,7);ctx.fill();
  for(const k of [-1,1]){mlPoly([[hx+k*s*.28-s*.12,hy-s*.25],[hx+k*s*.3,hy-s*.72],[hx+k*s*.28+s*.14,hy-s*.25]]);ctx.fill();}
  ctx.fillStyle='#5ae0ff';ctx.shadowColor='#5ae0ff';ctx.shadowBlur=6;ctx.beginPath();ctx.ellipse(hx+f*s*.18,hy-s*.05,s*.1,s*.07,0,0,7);ctx.fill();ctx.shadowBlur=0;
  ctx.fillStyle='#1a1a1a';ctx.fillRect(hx+f*s*.18-.7,hy-s*.1,1.4,s*.1);
  ctx.strokeStyle=lite;ctx.lineWidth=1;for(const k of [-1,1]){ctx.beginPath();ctx.moveTo(hx+f*s*.35,hy+s*.08);ctx.lineTo(hx+f*s*.8,hy+s*.02*k+s*.05);ctx.stroke();}};
MOB_LOOKS.frostmatron=(m,o)=>{const {x,y,s,t,f,col,dark,lite,mv}=o;shadow(x,y,s*1.1);const b=Math.sin(t*(mv?8:2))*s*.04;
  ctx.fillStyle=dark;for(const k of [-.45,.45]){ctx.beginPath();ctx.ellipse(x+k*s,y-s*.25,s*.32,s*.28,0,0,7);ctx.fill();}
  ctx.fillStyle=col;ctx.beginPath();ctx.ellipse(x,y-s*1.05+b,s*.95,s*.95,0,0,7);ctx.fill();
  ctx.fillStyle=lite;ctx.beginPath();ctx.ellipse(x,y-s*.9+b,s*.55,s*.62,0,0,7);ctx.fill();
  ctx.fillStyle=col;for(const k of [-1,1]){ctx.beginPath();ctx.ellipse(x+k*s*.95,y-s*1.15+b,s*.28,s*.5,k*.4,0,7);ctx.fill();}
  const hy=y-s*2.15+b;ctx.beginPath();ctx.arc(x,hy,s*.58,0,7);ctx.fill();for(const k of [-1,1]){ctx.beginPath();ctx.arc(x+k*s*.45,hy-s*.42,s*.18,0,7);ctx.fill();}
  ctx.fillStyle=lite;ctx.beginPath();ctx.ellipse(x+f*s*.12,hy+s*.18,s*.28,s*.2,0,0,7);ctx.fill();ctx.fillStyle='#2a2a3a';ctx.beginPath();ctx.arc(x+f*s*.18,hy+s*.1,s*.08,0,7);ctx.fill();
  for(const k of [-1,1])mlEye(x+k*s*.22+f*s*.08,hy-s*.12,s*.07);
  ctx.fillStyle='#bfeaff';ctx.shadowColor='#8fdcff';ctx.shadowBlur=8;for(const [dx,h] of [[-.3,.5],[0,.75],[.3,.5]]){mlPoly([[x+dx*s-s*.1,hy-s*.5],[x+dx*s,hy-s*(.5+h)],[x+dx*s+s*.1,hy-s*.5]]);ctx.fill();}
  for(const k of [-1,1]){mlPoly([[x+k*s*.7,y-s*1.6+b],[x+k*s*1.05,y-s*2.1+b],[x+k*s*.95,y-s*1.55+b]]);ctx.fill();}ctx.shadowBlur=0;};
MOB_LOOKS.dunejackal=(m,o)=>{const {x,y,s,t,f,col,dark,lite,mv}=o;shadow(x,y,s*1.05);mlLegs(o,x,s*.8,.6,s*.16);
  const by=y-s*.95-(mv?Math.abs(Math.sin(t*12))*s*.06:0);ctx.strokeStyle=dark;ctx.lineWidth=s*.12;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x-f*s*.8,by);ctx.lineTo(x-f*s*1.35,by+s*.35+Math.sin(t*5)*s*.1);ctx.stroke();
  ctx.fillStyle=col;ctx.beginPath();ctx.ellipse(x,by,s*.85,s*.42,0,0,7);ctx.fill();
  const hx=x+f*s*.85,hy=by-s*.6;ctx.strokeStyle=col;ctx.lineWidth=s*.32;ctx.beginPath();ctx.moveTo(x+f*s*.5,by-s*.1);ctx.lineTo(hx,hy+s*.1);ctx.stroke();
  ctx.fillStyle='#e0b84a';ctx.fillRect(hx-s*.32,hy+s*.12,s*.64,s*.16);ctx.fillStyle='#3a8ad8';ctx.beginPath();ctx.arc(hx,hy+s*.2,s*.08,0,7);ctx.fill();
  ctx.fillStyle=col;ctx.beginPath();ctx.arc(hx,hy,s*.35,0,7);ctx.fill();mlPoly([[hx+f*s*.1,hy-s*.12],[hx+f*s*.85,hy+s*.06],[hx+f*s*.1,hy+s*.18]]);ctx.fill();
  ctx.fillStyle='#1a1a1a';ctx.beginPath();ctx.arc(hx+f*s*.83,hy+s*.05,s*.06,0,7);ctx.fill();
  for(const k of [-1,1]){ctx.fillStyle=col;mlPoly([[hx+k*s*.18-s*.14,hy-s*.2],[hx+k*s*.25+f*s*.05,hy-s*1.2],[hx+k*s*.18+s*.16,hy-s*.2]]);ctx.fill();
    ctx.fillStyle='#e8a890';mlPoly([[hx+k*s*.18-s*.06,hy-s*.3],[hx+k*s*.24+f*s*.05,hy-s*1.0],[hx+k*s*.18+s*.08,hy-s*.3]]);ctx.fill();}
  mlEye(hx+f*s*.15,hy-s*.06,s*.08,'#1a1a1a');ctx.strokeStyle='#1a1a1a';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(hx+f*s*.22,hy-s*.06);ctx.lineTo(hx+f*s*.45,hy-s*.02);ctx.stroke();
  ctx.strokeStyle=dark;ctx.lineWidth=1.5;for(const k of [-.3,0,.3]){ctx.beginPath();ctx.moveTo(x+k*s,by-s*.38);ctx.lineTo(x+k*s+s*.05,by-s*.1);ctx.stroke();}};
MOB_LOOKS.gravehound=(m,o)=>{const {x,y,s,t,f,col,dark,mv}=o;shadow(x,y,s*1.15);mlLegs(o,x,s*.65,.7,s*.2,'#c8c0b0');
  const by=y-s*.9-(mv?Math.abs(Math.sin(t*12))*s*.08:0);ctx.strokeStyle='#c8c0b0';ctx.lineWidth=s*.1;ctx.beginPath();ctx.moveTo(x-f*s*.95,by-s*.1);ctx.lineTo(x-f*s*1.5,by-s*.6);ctx.stroke();
  ctx.fillStyle=col;ctx.beginPath();ctx.ellipse(x,by,s*1.0,s*.5,0,0,7);ctx.fill();
  ctx.strokeStyle='#e8e0cf';ctx.lineWidth=2;for(let k=-1;k<=2;k++){ctx.beginPath();ctx.arc(x+k*s*.22-f*s*.1,by+s*.05,s*.32,Math.PI*1.15,Math.PI*1.85);ctx.stroke();}
  const hx=x+f*s*.95,hy=by-s*.45;ctx.fillStyle=col;ctx.beginPath();ctx.arc(hx,hy,s*.45,0,7);ctx.fill();mlPoly([[hx+f*s*.15,hy-s*.1],[hx+f*s*.85,hy+s*.12],[hx+f*s*.15,hy+s*.3]]);ctx.fill();
  ctx.fillStyle='#e8e0cf';for(const k of [.4,.6,.8])mlPoly([[hx+f*s*k-1.5,hy+s*.2],[hx+f*s*k,hy+s*.36],[hx+f*s*k+1.5,hy+s*.2]]),ctx.fill();
  ctx.fillStyle=dark;mlPoly([[hx-s*.2,hy-s*.3],[hx-s*.05+f*s*.1,hy-s*.85],[hx+s*.18,hy-s*.32]]);ctx.fill();
  ctx.fillStyle='#5a2a2a';ctx.fillRect(hx-f*s*.55-s*.08,hy-s*.05,s*.16,s*.55);ctx.fillStyle='#c8c8d0';for(let k=0;k<3;k++)mlPoly([[hx-f*s*.55-s*.08,hy+k*s*.17],[hx-f*s*.55-f*s*.25,hy+k*s*.17+s*.08],[hx-f*s*.55-s*.08,hy+k*s*.17+s*.16]]),ctx.fill();
  mlEye(hx+f*s*.2,hy-s*.1,s*.09,'#7aff8a','#7aff8a');};
MOB_LOOKS.cavebat=(m,o)=>{const {x,s,t,f,col,dark}=o;const fl=Math.sin(t*4)*s*.3,y=o.y-s*1.6+fl;shadow(x,o.y,s*.7);const fw=Math.sin(t*18);
  ctx.fillStyle=dark;for(const k of [-1,1]){ctx.beginPath();ctx.moveTo(x+k*s*.3,y-s*.1);ctx.quadraticCurveTo(x+k*s*1.3,y-s*.9*fw-s*.4,x+k*s*2.0,y-s*.5*fw);
    for(let j=0;j<3;j++){const ex=x+k*s*(2.0-j*.55),ey=y-s*.5*fw*(1-j*.3);ctx.quadraticCurveTo(ex-k*s*.15,ey+s*.45,ex-k*s*.5,ey+s*.15);}ctx.closePath();ctx.fill();}
  ctx.fillStyle=col;ctx.beginPath();ctx.ellipse(x,y,s*.55,s*.62,0,0,7);ctx.fill();
  for(const k of [-1,1]){mlPoly([[x+k*s*.15,y-s*.45],[x+k*s*.45,y-s*1.15],[x+k*s*.5,y-s*.35]]);ctx.fill();}
  for(const k of [-1,1])mlEye(x+k*s*.2+f*s*.08,y-s*.12,s*.11,'#ffdf6a');
  ctx.fillStyle='#fff';for(const k of [-1,1])mlPoly([[x+k*s*.09+f*s*.05-1.5,y+s*.18],[x+k*s*.09+f*s*.05,y+s*.36],[x+k*s*.09+f*s*.05+1.5,y+s*.18]]),ctx.fill();};

/* ---------- bugs ---------- */
function mlBeetle(o,{shell,horn,moss,wings,crown,facet}={}){const {x,y,s,t,f,col,dark,mv}=o;shadow(x,y,s*1.1);ctx.strokeStyle='#1a1a1a';ctx.lineWidth=1.5;
  for(let k=-1;k<=1;k++){const w=mv?Math.sin(t*16+k)*2:0;ctx.beginPath();ctx.moveTo(x+k*s*.5,y-s*.5);ctx.lineTo(x+k*s*.6-s*.9,y+w);ctx.moveTo(x+k*s*.5,y-s*.5);ctx.lineTo(x+k*s*.6+s*.9,y-w);ctx.stroke();}
  if(wings){ctx.fillStyle='rgba(220,240,255,.55)';for(const k of [-1,1]){ctx.save();ctx.translate(x-f*s*.2,y-s*1.0);ctx.rotate(k*(.6+Math.sin(t*20)*.15));ctx.beginPath();ctx.ellipse(0,-s*.75,s*.35,s*.85,0,0,7);ctx.fill();ctx.restore();}}
  if(facet){ctx.fillStyle=shell||col;mlPoly([[x-s,y-s*.55],[x-s*.65,y-s*1.25],[x+s*.15,y-s*1.4],[x+s*.95,y-s*1.0],[x+s,y-s*.35],[x+s*.3,y-s*.05],[x-s*.6,y-s*.1]]);ctx.fill();
    ctx.strokeStyle='rgba(255,255,255,.7)';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(x-s*.65,y-s*1.25);ctx.lineTo(x-s*.1,y-s*.7);ctx.lineTo(x+s*.15,y-s*1.4);ctx.moveTo(x-s*.1,y-s*.7);ctx.lineTo(x+s*.3,y-s*.05);ctx.moveTo(x-s*.1,y-s*.7);ctx.lineTo(x-s,y-s*.55);ctx.moveTo(x+s*.95,y-s*1.0);ctx.lineTo(x-s*.1,y-s*.7);ctx.stroke();}
  else{ctx.fillStyle=shell||col;ctx.beginPath();ctx.ellipse(x,y-s*.6,s,s*.7,0,0,7);ctx.fill();ctx.strokeStyle=dark;ctx.lineWidth=2;ctx.stroke();ctx.beginPath();ctx.moveTo(x,y-s*1.25);ctx.lineTo(x,y);ctx.stroke();
    ctx.fillStyle='rgba(255,255,255,.25)';ctx.beginPath();ctx.ellipse(x-s*.4,y-s*.9,s*.25,s*.12,-.4,0,7);ctx.fill();}
  if(moss){ctx.fillStyle='#4e8a2e';for(const [a,b,r] of [[-.45,-.95,.22],[-.15,-1.1,.18],[.35,-.9,.24],[.55,-.55,.16],[-.6,-.6,.14]]){ctx.beginPath();ctx.arc(x+a*s,y+b*s,r*s,0,7);ctx.fill();}
    ctx.fillStyle='#f2e46b';ctx.beginPath();ctx.arc(x+s*.32,y-s*1.12,s*.08,0,7);ctx.fill();}
  ctx.fillStyle=dark;ctx.beginPath();ctx.arc(x+f*s*.95,y-s*.6,s*.38,0,7);ctx.fill();
  if(horn){ctx.fillStyle=horn;ctx.beginPath();ctx.moveTo(x+f*s*1.05,y-s*.85);ctx.quadraticCurveTo(x+f*s*1.7,y-s*1.0,x+f*s*1.55,y-s*1.75);ctx.quadraticCurveTo(x+f*s*1.45,y-s*1.05,x+f*s*1.0,y-s*.62);ctx.fill();}
  else{ctx.strokeStyle='#1a1a1a';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x+f*s*1.2,y-s*.8);ctx.lineTo(x+f*s*1.6,y-s*1.4);ctx.stroke();}
  ctx.fillStyle='#ffdf6a';ctx.beginPath();ctx.arc(x+f*s*1.1,y-s*.7,Math.max(1.8,s*.1),0,7);ctx.fill();
  if(crown)mlCrown(x+f*s*.9,y-s*.95,s*.3);}
MOB_LOOKS.mossbug=(m,o)=>mlBeetle(o,{moss:true});
MOB_LOOKS.scarab=(m,o)=>mlBeetle(o,{horn:'#e0b84a'});
MOB_LOOKS.scarabqueen=(m,o)=>mlBeetle(o,{horn:'#e0b84a',wings:true,crown:true});
MOB_LOOKS.glacierbeetle=(m,o)=>{mlBeetle(o,{facet:true,horn:'#bfeaff'});};
MOB_LOOKS.webspinner=(m,o)=>{const {x,y,s,t,f,col,dark,mv}=o;shadow(x,y,s*1.3);
  ctx.strokeStyle='rgba(240,240,240,.5)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x-f*s*.5,y-s*1.5);ctx.lineTo(x-f*s*.5,y-s*3.2);ctx.stroke();
  ctx.fillStyle=col;ctx.beginPath();ctx.ellipse(x-f*s*.5,y-s*1.05,s*.62,s*.55,0,0,7);ctx.fill();
  ctx.fillStyle='#d8434a';const ax=x-f*s*.5,ay=y-s*1.05;mlPoly([[ax-s*.13,ay-s*.25],[ax+s*.13,ay-s*.25],[ax,ay],[ax+s*.13,ay+s*.25],[ax-s*.13,ay+s*.25],[ax,ay]]);ctx.fill();
  // eight jointed legs, four each side, drawn over the body so both sides show
  const cx=x+f*s*.25,cy=y-s*.7;ctx.strokeStyle=dark;ctx.lineWidth=Math.max(1.6,s*.11);ctx.lineCap='round';ctx.lineJoin='round';
  for(let k=0;k<4;k++)for(const sd of [-1,1]){const ph=t*(mv?14:3)+k*1.3+(sd>0?Math.PI:0),lift=Math.sin(ph)*s*.14,sp=(k-1.5)*.32;
    ctx.beginPath();ctx.moveTo(cx+sp*s*.4,cy);ctx.lineTo(cx+sd*s*(.55+Math.abs(sp)*.3)+sp*s*.5,cy-s*.55-lift);ctx.lineTo(cx+sd*s*(1.05+Math.abs(sp)*.45)+sp*s*.7,y-lift*.3);ctx.stroke();}
  ctx.fillStyle=dark;ctx.beginPath();ctx.arc(cx,cy,s*.4,0,7);ctx.fill();
  for(const [a,b,r] of [[-.1,-.12,.09],[.1,-.12,.09],[-.16,.05,.06],[.16,.05,.06],[0,-.27,.05]])mlEye(cx+f*s*.12+a*s,cy+b*s,s*r,'#ff4a5a','#ff4a5a');
  ctx.fillStyle='#e8e0cf';for(const k of [-1,1])mlPoly([[cx+f*s*.22+k*s*.07-1.5,cy+s*.25],[cx+f*s*.22+k*s*.07,cy+s*.42],[cx+f*s*.22+k*s*.07+1.5,cy+s*.25]]),ctx.fill();};
MOB_LOOKS.crystalmite=(m,o)=>{const {x,y,s,t,f,col,dark,lite,mv}=o;shadow(x,y,s*1.0);ctx.strokeStyle=dark;ctx.lineWidth=1.8;ctx.lineCap='round';
  for(let k=-1;k<=1;k++)for(const sd of [-1,1]){const w=mv?Math.sin(t*18+k+sd)*2:0;ctx.beginPath();ctx.moveTo(x+k*s*.35,y-s*.3);ctx.lineTo(x+k*s*.45+sd*s*.75,y-s*.45+w);ctx.lineTo(x+k*s*.5+sd*s*.95,y);ctx.stroke();}
  ctx.fillStyle='#7a8a9a';ctx.beginPath();ctx.ellipse(x,y-s*.45,s*.85,s*.45,0,0,7);ctx.fill();
  const shards=[[-.5,1.2,-.35],[-.15,1.65,-.08],[.25,1.35,.2],[.55,.95,.45]];
  for(const [dx,h,r] of shards){ctx.save();ctx.translate(x+dx*s,y-s*.7);ctx.rotate(r);ctx.fillStyle=col;mlPoly([[-s*.16,0],[-s*.12,-s*h*.75],[0,-s*h],[s*.12,-s*h*.75],[s*.16,0]]);ctx.fill();
    ctx.fillStyle='rgba(255,255,255,.55)';mlPoly([[-s*.1,-s*.05],[-s*.07,-s*h*.72],[0,-s*h*.95],[0,-s*.05]]);ctx.fill();ctx.restore();}
  const sp=(Math.sin(t*3)+1)/2;ctx.fillStyle=`rgba(255,255,255,${sp})`;ctx.beginPath();ctx.arc(x-s*.12,y-s*2.25,s*.08,0,7);ctx.fill();
  mlEye(x+f*s*.55,y-s*.45,s*.09);mlEye(x+f*s*.3,y-s*.48,s*.09);};
MOB_LOOKS.glowworm=(m,o)=>{const {x,y,s,t,f,col,dark,mv}=o;shadow(x,y,s*1.3);const n=6,ph=t*(mv?9:2.5);
  for(let i=n-1;i>=0;i--){const k=i/(n-1),sx=x+f*s*(1.1-k*2.3),r=s*(.48-k*.12),sy=y-r-Math.max(0,Math.sin(ph-i*.9))*s*.35;
    if(i===n-1){ctx.fillStyle='#e8ff8a';ctx.shadowColor='#d8ff6a';ctx.shadowBlur=14+Math.sin(t*4)*6;}else{ctx.fillStyle=i%2?col:dark;ctx.shadowBlur=0;}
    ctx.beginPath();ctx.arc(sx,sy,r,0,7);ctx.fill();ctx.shadowBlur=0;
    if(i===0){mlEye(sx+f*r*.35,sy-r*.2,r*.22);ctx.strokeStyle=dark;ctx.lineWidth=1.2;for(const k2 of [-1,1]){ctx.beginPath();ctx.moveTo(sx+k2*r*.3,sy-r*.8);ctx.quadraticCurveTo(sx+k2*r*.5+f*r*.3,sy-r*1.6,sx+k2*r*.4+f*r*.6,sy-r*1.7);ctx.stroke();}}}};
MOB_LOOKS.stonecrab=(m,o)=>{const {x,y,s,t,f,col,dark,lite,mv}=o;shadow(x,y,s*1.3);const sc=mv?Math.sin(t*14)*s*.08:0;ctx.strokeStyle=dark;ctx.lineWidth=2;ctx.lineCap='round';
  for(let k=0;k<3;k++)for(const sd of [-1,1]){ctx.beginPath();ctx.moveTo(x+sd*s*.6,y-s*.5);ctx.lineTo(x+sd*s*(1.1+k*.1),y-s*(.75-k*.15)+sc*sd);ctx.lineTo(x+sd*s*(1.3+k*.12),y);ctx.stroke();}
  ctx.fillStyle=col;ctx.beginPath();ctx.ellipse(x+sc,y-s*.6,s*1.05,s*.55,0,0,7);ctx.fill();ctx.strokeStyle=dark;ctx.stroke();
  ctx.fillStyle=dark;for(const [a,b] of [[-.5,-.75],[-.1,-.95],[.35,-.7],[.6,-.5],[0,-.45]]){ctx.beginPath();ctx.arc(x+a*s+sc,y+b*s,s*.08,0,7);ctx.fill();}
  const snap=Math.abs(Math.sin(t*(mv?8:2)))*.35;for(const sd of [-1,1]){const cx=x+sd*s*1.05,cy=y-s*1.35;ctx.strokeStyle=col;ctx.lineWidth=s*.18;ctx.beginPath();ctx.moveTo(x+sd*s*.7,y-s*.85);ctx.lineTo(cx,cy+s*.2);ctx.stroke();
    ctx.fillStyle=lite;ctx.beginPath();ctx.arc(cx,cy,s*.38,-Math.PI/2+snap,Math.PI*1.5-snap);ctx.lineTo(cx,cy);ctx.fill();}
  for(const k of [-1,1]){ctx.strokeStyle=dark;ctx.lineWidth=1.8;ctx.beginPath();ctx.moveTo(x+k*s*.22+sc,y-s*1.0);ctx.lineTo(x+k*s*.28+sc,y-s*1.45);ctx.stroke();mlEye(x+k*s*.28+sc,y-s*1.5,s*.1);}};
MOB_LOOKS.dunetyrant=(m,o)=>{const {x,y,s,t,f,col,dark,lite,mv}=o;shadow(x,y,s*1.3);ctx.strokeStyle=dark;ctx.lineWidth=s*.07;ctx.lineCap='round';
  for(let k=0;k<4;k++)for(const sd of [-1,1]){const w=mv?Math.sin(t*10+k+sd)*s*.06:0,bx=x-f*s*.15+(k-1.5)*s*.28;ctx.beginPath();ctx.moveTo(bx,y-s*.4);ctx.lineTo(bx+sd*s*.12,y-s*.62-w);ctx.lineTo(bx+sd*s*.3,y);ctx.stroke();}
  ctx.fillStyle=col;for(let i=0;i<3;i++){ctx.beginPath();ctx.ellipse(x-f*s*(i*.38-.15),y-s*.5,s*(.58-i*.05),s*.4,0,0,7);ctx.fill();}
  ctx.strokeStyle=dark;ctx.lineWidth=2;for(let i=0;i<3;i++){ctx.beginPath();ctx.arc(x-f*s*(i*.38-.15),y-s*.5,s*(.5-i*.05),Math.PI*1.2,Math.PI*1.8);ctx.stroke();}
  // the tail: five segments arching up over the back to a glowing stinger
  const sway=Math.sin(t*2)*s*.08;const pts=[[.95,.6],[1.25,1.0],[1.2,1.5],[.85,1.85],[.4,1.95]];
  pts.forEach(([a,b],i)=>{ctx.fillStyle=i%2?col:lite;ctx.beginPath();ctx.arc(x-f*s*a+sway*(i/4),y-s*b,s*(.3-i*.03),0,7);ctx.fill();ctx.strokeStyle=dark;ctx.lineWidth=1.5;ctx.stroke();});
  const tx=x-f*s*.4+sway,ty=y-s*1.95;ctx.fillStyle='#ff6a3a';ctx.shadowColor='#ff6a3a';ctx.shadowBlur=12;mlPoly([[tx,ty-s*.12],[tx+f*s*.45,ty+s*.2],[tx,ty+s*.12]]);ctx.fill();ctx.shadowBlur=0;
  ctx.fillStyle=dark;ctx.beginPath();ctx.arc(x+f*s*.5,y-s*.5,s*.3,0,7);ctx.fill();
  const snap=.35+Math.abs(Math.sin(t*3))*.3,base=f>0?0:Math.PI;
  for(const sd of [-1,1]){const cx=x+f*s*1.15,cy=y-s*.55+sd*s*.3;ctx.strokeStyle=col;ctx.lineWidth=s*.1;ctx.beginPath();ctx.moveTo(x+f*s*.6,y-s*.5);ctx.lineTo(cx,cy);ctx.stroke();
    ctx.fillStyle=lite;ctx.beginPath();ctx.moveTo(cx,cy);ctx.arc(cx,cy,s*.24,base+snap,base+Math.PI*2-snap);ctx.closePath();ctx.fill();}
  for(const k of [-1,1])mlEye(x+f*s*.62,y-s*.62+k*s*.1,s*.05,'#ffdf6a','#ffdf6a');};

/* ---------- mushrooms ---------- */
MOB_LOOKS.puffcap=(m,o)=>{const {x,y,s,t,f,col,dark,lite,mv}=o;shadow(x,y,s);const q=Math.sin(t*(mv?10:3))*s*.06;
  ctx.fillStyle='#f4ead6';ctx.beginPath();ctx.roundRect(x-s*.35,y-s*.75,s*.7,s*.75,s*.2);ctx.fill();
  ctx.fillStyle=col;ctx.beginPath();ctx.arc(x,y-s*1.35+q,s*.95,0,7);ctx.fill();ctx.strokeStyle=dark;ctx.lineWidth=1.5;ctx.stroke();
  ctx.fillStyle=lite;for(const [a,b] of [[-.4,-1.7],[.1,-1.95],[.5,-1.55],[-.1,-1.4],[.3,-1.1],[-.55,-1.15]]){ctx.beginPath();ctx.arc(x+a*s,y+b*s+q,s*.07,0,7);ctx.fill();}
  eyes(x,y-s*1.2+q,s*.8,f);ctx.fillStyle='#c84a6a';ctx.beginPath();ctx.arc(x+f*s*.1,y-s*.95+q,s*.08,0,7);ctx.fill();
  for(let k=0;k<3;k++){const a=(t*.6+k/3)%1;ctx.fillStyle=`rgba(255,220,240,${.6*(1-a)})`;ctx.beginPath();ctx.arc(x+Math.sin(k*2.1+t)*s*.6,y-s*2.3-a*s*1.2,s*(.12+a*.15),0,7);ctx.fill();}};
MOB_LOOKS.shriekcap=(m,o)=>{const {x,y,s,t,f,col,dark}=o;shadow(x,y,s*.9);const yell=m.lunge&&now-m.lunge<.5;const q=Math.sin(t*3)*s*.05;
  ctx.fillStyle='#efe2c8';ctx.beginPath();ctx.roundRect(x-s*.4,y-s*1.0,s*.8,s*1.0,s*.18);ctx.fill();
  ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(x-s*.95,y-s*.95+q);ctx.quadraticCurveTo(x-s*.55,y-s*1.6+q,x+f*s*.15,y-s*2.9+q);ctx.quadraticCurveTo(x+s*.55,y-s*1.6+q,x+s*.95,y-s*.95+q);ctx.closePath();ctx.fill();
  ctx.strokeStyle=dark;ctx.lineWidth=1.5;for(const k of [-.45,0,.45]){ctx.beginPath();ctx.moveTo(x+k*s,y-s*1.0+q);ctx.lineTo(x+f*s*.12+k*s*.3,y-s*2.2+q);ctx.stroke();}
  for(const k of [-1,1]){ctx.fillStyle='#1a1a1a';ctx.beginPath();ctx.ellipse(x+k*s*.18+f*s*.05,y-s*.78,s*.07,s*.11,0,0,7);ctx.fill();}
  ctx.fillStyle='#3a1414';ctx.beginPath();ctx.ellipse(x+f*s*.05,y-s*.42,s*.16,yell?s*.24:s*.14,0,0,7);ctx.fill();
  if(yell||Math.sin(t*1.3)>.7){ctx.strokeStyle='rgba(255,240,180,.75)';ctx.lineWidth=2;for(let k=1;k<=3;k++){ctx.beginPath();ctx.arc(x+f*s*.2,y-s*.45,s*(.35+k*.28),-.6,.6);if(f<0){ctx.beginPath();ctx.arc(x+f*s*.2,y-s*.45,s*(.35+k*.28),Math.PI-.6,Math.PI+.6);}ctx.stroke();}}};
function mlGloom(m,o,king){const {x,y,s,t,f,col,dark,lite,mv}=o;shadow(x,y,s);const q=Math.sin(t*(mv?8:2))*s*.05;
  ctx.fillStyle='#d8cfe0';ctx.beginPath();ctx.roundRect(x-s*.38,y-s*.95,s*.76,s*.95,s*.2);ctx.fill();
  ctx.fillStyle='#c8a0ff';ctx.shadowColor='#c8a0ff';ctx.shadowBlur=10;ctx.beginPath();ctx.ellipse(x,y-s*1.0+q,s*1.1,s*.18,0,0,Math.PI);ctx.fill();ctx.shadowBlur=0;
  ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(x-s*1.3,y-s*.95+q);ctx.quadraticCurveTo(x-s*1.1,y-s*2.1+q,x,y-s*2.0+q);ctx.quadraticCurveTo(x+s*1.1,y-s*2.1+q,x+s*1.3,y-s*.95+q);ctx.closePath();ctx.fill();
  for(const k of [-.9,-.3,.4,1.0]){const d=(Math.sin(t*1.5+k*3)+1)/2;ctx.fillStyle=col;ctx.beginPath();ctx.ellipse(x+k*s,y-s*.92+q+d*s*.12,s*.08,s*(.14+d*.12),0,0,7);ctx.fill();}
  ctx.fillStyle=lite;ctx.globalAlpha*=.5;ctx.beginPath();ctx.ellipse(x-s*.45,y-s*1.65+q,s*.32,s*.12,-.3,0,7);ctx.fill();ctx.globalAlpha/=.5;
  ctx.strokeStyle='#2a1a3a';ctx.lineWidth=2;for(const k of [-1,1]){ctx.beginPath();ctx.arc(x+k*s*.18+f*s*.05,y-s*.6,s*.1,.1,Math.PI-.1);ctx.stroke();}
  ctx.beginPath();ctx.arc(x+f*s*.05,y-s*.25,s*.1,Math.PI+.4,-.4);ctx.stroke();
  if(king){mlCrown(x,y-s*1.95+q,s*.38);ctx.fillStyle='#8a2a4a';ctx.beginPath();ctx.moveTo(x-s*.4,y-s*.9);ctx.lineTo(x-s*.75,y);ctx.lineTo(x+s*.75,y);ctx.lineTo(x+s*.4,y-s*.9);ctx.closePath();ctx.globalAlpha*=.85;ctx.fill();ctx.globalAlpha/=.85;}}
MOB_LOOKS.gloomcap=(m,o)=>mlGloom(m,o,false);
MOB_LOOKS.gloomking=(m,o)=>mlGloom(m,o,true);

/* ---------- ghosts ---------- */
MOB_LOOKS.frostwisp=(m,o)=>{const {x,s,t,f,col,lite}=o;const fl=Math.sin(t*2.5)*4,y=o.y-12-fl;shadow(x,o.y,s*.6);
  for(let k=0;k<5;k++){const a=(t*1.2+k/5)%1;ctx.fillStyle=`rgba(220,245,255,${.7*(1-a)})`;ctx.beginPath();ctx.arc(x-f*s*(.3+a*1.2)+Math.sin(t*3+k)*3,y-s*.5+a*s*.6,s*.1*(1-a)+1,0,7);ctx.fill();}
  const g=ctx.createRadialGradient(x,y-s*.9,1,x,y-s*.9,s*1.6);g.addColorStop(0,'rgba(200,240,255,.55)');g.addColorStop(1,'rgba(150,210,255,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y-s*.9,s*1.6,0,7);ctx.fill();
  const w=Math.sin(t*9)*s*.12;ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(x+w,y-s*2.3);ctx.quadraticCurveTo(x+s*.95,y-s*1.2,x+s*.7,y-s*.55);ctx.arc(x,y-s*.65,s*.72,0,Math.PI);ctx.quadraticCurveTo(x-s*.95,y-s*1.3,x+w,y-s*2.3);ctx.fill();
  ctx.fillStyle='#ffffff';ctx.beginPath();ctx.moveTo(x+w*.6,y-s*1.6);ctx.quadraticCurveTo(x+s*.45,y-s*1.0,x+s*.3,y-s*.65);ctx.arc(x,y-s*.68,s*.32,0,Math.PI);ctx.quadraticCurveTo(x-s*.45,y-s*1.0,x+w*.6,y-s*1.6);ctx.fill();
  for(const k of [-1,1]){ctx.fillStyle='#2a6a9a';ctx.beginPath();ctx.arc(x+k*s*.16+f*s*.08,y-s*.78,s*.07,0,7);ctx.fill();}
  ctx.fillStyle=lite;for(const k of [-1,1]){ctx.save();ctx.translate(x+k*s*.95,y-s*1.0);ctx.rotate(t*1.5*k);mlPoly([[0,-s*.22],[s*.06,0],[0,s*.22],[-s*.06,0]]);ctx.fill();ctx.restore();}};
MOB_LOOKS.miragewisp=(m,o)=>{const {x,s,t,f,col,dark}=o;const fl=Math.sin(t*2)*4,y=o.y-10-fl;shadow(x,o.y,s*.7);
  const veil=(dx,a)=>{ctx.globalAlpha*=a;ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(x+dx,y-s*2.2);ctx.quadraticCurveTo(x+dx+s*1.1,y-s*1.4,x+dx+s*.95,y);
    for(let k=0;k<=5;k++)ctx.lineTo(x+dx+s*.95-k*s*.38,y+(k%2?-5:3)+Math.sin(t*5+k)*2);ctx.quadraticCurveTo(x+dx-s*1.1,y-s*1.4,x+dx,y-s*2.2);ctx.fill();ctx.globalAlpha/=a;};
  veil(Math.sin(t*1.7)*s*.6,.28);veil(0,.9);
  ctx.strokeStyle='#e0a03a';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x-s*.75,y-s*1.25);ctx.quadraticCurveTo(x,y-s*1.55,x+s*.75,y-s*1.25);ctx.stroke();
  ctx.fillStyle='#3a2a14';ctx.beginPath();ctx.ellipse(x+f*s*.05,y-s*1.0,s*.5,s*.24,0,0,7);ctx.fill();
  mlEye(x+f*s*.1,y-s*1.0,s*.1,'#ffe36a','#ffb03a');
  ctx.strokeStyle='rgba(240,210,140,.5)';ctx.lineWidth=1.2;for(let k=0;k<3;k++){ctx.beginPath();ctx.arc(x,o.y-2,s*(.5+k*.35+(t*.5%1)*.3),Math.PI*1.1,Math.PI*1.9);ctx.stroke();}};
MOB_LOOKS.deepshade=(m,o)=>{const {x,s,t,f,col}=o;const fl=Math.sin(t*1.8)*3,y=o.y-6-fl;shadow(x,o.y,s*.9);
  for(let k=0;k<4;k++){const a=(t*.7+k/4)%1;ctx.fillStyle=`rgba(30,26,46,${.5*(1-a)})`;ctx.beginPath();ctx.arc(x+Math.sin(k*2+t)*s*.8,y-s*.2-a*s*1.8,s*(.2+a*.3),0,7);ctx.fill();}
  ctx.fillStyle='#1c1a2a';ctx.beginPath();ctx.moveTo(x,y-s*2.5);ctx.quadraticCurveTo(x+s*1.05,y-s*2.0,x+s*1.2,y);
  for(let k=0;k<=6;k++)ctx.lineTo(x+s*1.2-k*s*.4,y+(k%2?-s*.35:s*.05)+Math.sin(t*4+k)*2);ctx.quadraticCurveTo(x-s*1.05,y-s*2.0,x,y-s*2.5);ctx.fill();
  ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(x,y-s*2.5);ctx.quadraticCurveTo(x+s*.8,y-s*2.1,x+s*.7,y-s*1.3);ctx.lineTo(x-s*.7,y-s*1.3);ctx.quadraticCurveTo(x-s*.8,y-s*2.1,x,y-s*2.5);ctx.fill();
  ctx.fillStyle='#05040a';ctx.beginPath();ctx.ellipse(x+f*s*.08,y-s*1.55,s*.48,s*.36,0,0,7);ctx.fill();
  for(const k of [-1,1])mlEye(x+k*s*.17+f*s*.1,y-s*1.58,s*.08,'#e8f0ff','#b8c8ff');};

/* ---------- golems and big folk ---------- */
MOB_LOOKS.barkling=(m,o)=>{const {x,y,s,t,f,col,dark,mv}=o;shadow(x,y,s*1.1);const sw=Math.sin(t*(mv?8:2))*s*.08;
  ctx.strokeStyle=dark;ctx.lineWidth=s*.18;ctx.lineCap='round';for(const k of [-1,-.3,.3,1]){ctx.beginPath();ctx.moveTo(x+k*s*.35,y-s*.4);ctx.quadraticCurveTo(x+k*s*.6,y-s*.1,x+k*s*.75,y);ctx.stroke();}
  ctx.fillStyle=col;ctx.beginPath();ctx.roundRect(x-s*.62,y-s*2.0,s*1.24,s*1.75,s*.35);ctx.fill();
  ctx.strokeStyle=dark;ctx.lineWidth=1.5;for(const k of [-.35,0,.3]){ctx.beginPath();ctx.moveTo(x+k*s,y-s*1.85);ctx.bezierCurveTo(x+k*s+s*.1,y-s*1.4,x+k*s-s*.1,y-s*.9,x+k*s,y-s*.4);ctx.stroke();}
  ctx.strokeStyle=col;ctx.lineWidth=s*.22;for(const k of [-1,1]){ctx.beginPath();ctx.moveTo(x+k*s*.55,y-s*1.45);ctx.lineTo(x+k*s*1.2,y-s*1.9+k*sw);ctx.stroke();ctx.lineWidth=s*.12;ctx.beginPath();ctx.moveTo(x+k*s*1.05,y-s*1.8+k*sw);ctx.lineTo(x+k*s*1.4,y-s*1.6+k*sw);ctx.stroke();ctx.lineWidth=s*.22;
    ctx.fillStyle='#5aa040';ctx.beginPath();ctx.ellipse(x+k*s*1.3,y-s*2.05+k*sw,s*.2,s*.12,k*.6,0,7);ctx.fill();}
  ctx.fillStyle='#4e8a3a';for(const [a,b,r] of [[-.5,-2.1,.38],[0,-2.35,.45],[.5,-2.1,.38],[-.25,-2.55,.3],[.3,-2.6,.3]]){ctx.beginPath();ctx.arc(x+a*s,y+b*s,r*s,0,7);ctx.fill();}
  ctx.fillStyle='#6ab84e';for(const [a,b,r] of [[-.2,-2.5,.18],[.35,-2.25,.15]]){ctx.beginPath();ctx.arc(x+a*s,y+b*s,r*s,0,7);ctx.fill();}
  for(const k of [-1,1]){ctx.fillStyle='#3a2414';ctx.beginPath();ctx.arc(x+k*s*.25+f*s*.08,y-s*1.5,s*.14,0,7);ctx.fill();mlEye(x+k*s*.25+f*s*.08,y-s*1.5,s*.07,'#d8ff6a','#d8ff6a');}
  ctx.strokeStyle='#3a2414';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x-s*.18+f*s*.08,y-s*1.15);ctx.lineTo(x+s*.18+f*s*.08,y-s*1.12);ctx.stroke();};
function mlGolemBody(o,{spikes,cracks='255,140,50',smoke}){const {x,y,s,t,f,col,dark}=o;shadow(x,y,s*1.1);const br=Math.sin(t*2)*1.5;
  ctx.fillStyle=dark;ctx.fillRect(x-s*.7,y-s*.6,s*.45,s*.6);ctx.fillRect(x+s*.25,y-s*.6,s*.45,s*.6);
  ctx.fillStyle=col;ctx.beginPath();ctx.roundRect(x-s,y-s*2.1+br,s*2,s*1.6,8);ctx.fill();
  ctx.beginPath();ctx.roundRect(x-s*1.45,y-s*1.9+br,s*.5,s*1.1,6);ctx.roundRect(x+s*.95,y-s*1.9+br,s*.5,s*1.1,6);ctx.fill();
  ctx.strokeStyle=`rgba(${cracks},.95)`;ctx.lineWidth=2.5;ctx.shadowColor=`rgb(${cracks})`;ctx.shadowBlur=10;
  ctx.beginPath();ctx.moveTo(x-s*.6,y-s*1.8);ctx.lineTo(x-s*.2,y-s*1.3);ctx.lineTo(x-s*.4,y-s*.8);ctx.moveTo(x+s*.5,y-s*1.9);ctx.lineTo(x+s*.15,y-s*1.4);ctx.lineTo(x+s*.45,y-s*.9);ctx.stroke();ctx.shadowBlur=0;
  ctx.fillStyle=col;ctx.beginPath();ctx.roundRect(x-s*.6,y-s*2.85+br,s*1.2,s*.8,6);ctx.fill();
  ctx.fillStyle='#ffcf5a';ctx.shadowColor='#ffb03a';ctx.shadowBlur=6;ctx.beginPath();ctx.arc(x-s*.25+f*3,y-s*2.5+br,3,0,7);ctx.arc(x+s*.25+f*3,y-s*2.5+br,3,0,7);ctx.fill();ctx.shadowBlur=0;
  if(spikes){ctx.fillStyle='#3a1a10';for(let k=-1;k<=1;k++){ctx.beginPath();ctx.moveTo(x+k*s*.35-5,y-s*2.85+br);ctx.lineTo(x+k*s*.35,y-s*3.3+br);ctx.lineTo(x+k*s*.35+5,y-s*2.85+br);ctx.fill();}}
  if(smoke)for(let k=0;k<3;k++){const a=(t*.5+k/3)%1;ctx.fillStyle=`rgba(90,80,80,${.45*(1-a)})`;ctx.beginPath();ctx.arc(x+(k-1)*s*.4+Math.sin(t+k)*3,y-s*2.9-a*s*1.3,s*(.15+a*.3),0,7);ctx.fill();}}
MOB_LOOKS.ashgolem=(m,o)=>mlGolemBody(o,{smoke:true,cracks:'255,110,40'});
MOB_LOOKS.warlord=(m,o)=>{mlGolemBody(o,{spikes:true});const {x,y,s,t,f}=o;
  ctx.fillStyle='#5a1a14';ctx.globalAlpha*=.9;ctx.beginPath();ctx.moveTo(x-f*s*.8,y-s*2.0);ctx.quadraticCurveTo(x-f*s*1.7,y-s*1.0+Math.sin(t*2)*s*.1,x-f*s*1.35,y-s*.05);ctx.lineTo(x-f*s*.6,y-s*.3);ctx.closePath();ctx.fill();ctx.globalAlpha/=.9;};
MOB_LOOKS.cavetroll=(m,o)=>{const {x,y,s,t,f,col,dark,lite,mv}=o;shadow(x,y,s*1.2);const b=mv?Math.abs(Math.sin(t*6))*s*.06:0;
  ctx.fillStyle=dark;for(const k of [-.45,.35]){ctx.beginPath();ctx.roundRect(x+k*s,y-s*.6,s*.4,s*.6,s*.12);ctx.fill();}
  ctx.fillStyle=col;ctx.beginPath();ctx.ellipse(x-f*s*.1,y-s*1.25-b,s*1.0,s*.85,f*.25,0,7);ctx.fill();
  ctx.fillStyle=lite;ctx.beginPath();ctx.ellipse(x+f*s*.05,y-s*1.05-b,s*.55,s*.45,0,0,7);ctx.fill();
  ctx.save();ctx.translate(x+f*s*.95,y-s*1.25-b);ctx.rotate(f*(.4+Math.sin(t*(mv?6:1.5))*.15));ctx.fillStyle='#6b4a2a';ctx.beginPath();ctx.roundRect(-s*.12,-s*.2,s*.24,s*1.5,s*.08);ctx.fill();
  ctx.beginPath();ctx.ellipse(0,s*1.3,s*.3,s*.42,0,0,7);ctx.fill();ctx.fillStyle='#4a321c';for(const [a,b] of [[-.15,1.15],[.1,1.45],[.15,1.2]]){ctx.beginPath();ctx.arc(a*s,b*s,s*.05,0,7);ctx.fill();}ctx.restore();
  ctx.fillStyle=col;ctx.beginPath();ctx.ellipse(x+f*s*.85,y-s*1.1-b,s*.22,s*.5,f*.3,0,7);ctx.ellipse(x-f*s*.85,y-s*.9-b,s*.22,s*.55,-f*.2,0,7);ctx.fill();
  const hx=x+f*s*.45,hy=y-s*1.95-b;ctx.beginPath();ctx.arc(hx,hy,s*.48,0,7);ctx.fill();
  ctx.fillStyle=o.flash?'#ffffff':mlShade(m.d.col,-20);ctx.beginPath();ctx.ellipse(hx+f*s*.42,hy+s*.05,s*.2,s*.15,0,0,7);ctx.fill();
  ctx.fillStyle='#4a5a2a';for(let k=0;k<5;k++){ctx.beginPath();ctx.arc(hx-s*.3+k*s*.15,hy-s*.42,s*.13,0,7);ctx.fill();}
  ctx.fillStyle='#f4ead6';for(const k of [-1,1])mlPoly([[hx+f*s*.15+k*s*.12-2,hy+s*.25],[hx+f*s*.15+k*s*.12,hy+s*.05],[hx+f*s*.15+k*s*.12+2,hy+s*.25]]),ctx.fill();
  for(const k of [-1,1])mlEye(hx+f*s*.12+k*s*.15,hy-s*.12,s*.07,'#ffdf6a');
  ctx.fillStyle=col;for(const k of [-1,1])mlPoly([[hx-f*s*.1+k*s*.4,hy-s*.1],[hx-f*s*.1+k*s*.8,hy-s*.35],[hx-f*s*.1+k*s*.45,hy+s*.08]]),ctx.fill();};
MOB_LOOKS.rimeheart=(m,o)=>{const {x,y,s,t,f,col,dark,lite}=o;shadow(x,y,s*1.15);const br=Math.sin(t*1.6)*2;
  ctx.fillStyle=dark;mlPoly([[x-s*.75,y],[x-s*.65,y-s*.7],[x-s*.25,y-s*.75],[x-s*.2,y]]);ctx.fill();mlPoly([[x+s*.2,y],[x+s*.25,y-s*.75],[x+s*.65,y-s*.7],[x+s*.75,y]]);ctx.fill();
  ctx.fillStyle=col;mlPoly([[x-s*1.05,y-s*.7+br],[x-s*1.2,y-s*1.9+br],[x-s*.55,y-s*2.35+br],[x+s*.55,y-s*2.4+br],[x+s*1.2,y-s*1.85+br],[x+s*1.0,y-s*.7+br]]);ctx.fill();
  ctx.strokeStyle='rgba(255,255,255,.65)';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(x-s*1.2,y-s*1.9+br);ctx.lineTo(x-s*.3,y-s*1.5+br);ctx.lineTo(x+s*.55,y-s*2.4+br);ctx.moveTo(x-s*.3,y-s*1.5+br);ctx.lineTo(x-s*1.05,y-s*.7+br);ctx.moveTo(x-s*.3,y-s*1.5+br);ctx.lineTo(x+s*1.0,y-s*.7+br);ctx.stroke();
  ctx.fillStyle=lite;for(const k of [-1,1]){mlPoly([[x+k*s*.95,y-s*1.8+br],[x+k*s*1.65,y-s*2.25+br],[x+k*s*1.75,y-s*1.5+br],[x+k*s*1.4,y-s*.75+br],[x+k*s*1.05,y-s*1.0+br]]);ctx.fill();
    ctx.fillStyle='#e8f8ff';for(let j=0;j<3;j++)mlPoly([[x+k*s*(1.2+j*.18),y-s*2.15+br],[x+k*s*(1.25+j*.18),y-s*(2.6+j*.12)+br],[x+k*s*(1.32+j*.18),y-s*2.1+br]]),ctx.fill();ctx.fillStyle=lite;}
  const p=(Math.sin(t*3)+1)/2;ctx.fillStyle=`rgba(${120+p*80|0},220,255,1)`;ctx.shadowColor='#5ad0ff';ctx.shadowBlur=14+p*12;
  ctx.beginPath();ctx.moveTo(x,y-s*1.05+br);ctx.bezierCurveTo(x-s*.55,y-s*1.4+br,x-s*.3,y-s*1.85+br,x,y-s*1.55+br);ctx.bezierCurveTo(x+s*.3,y-s*1.85+br,x+s*.55,y-s*1.4+br,x,y-s*1.05+br);ctx.fill();ctx.shadowBlur=0;
  ctx.fillStyle=col;mlPoly([[x-s*.45,y-s*2.35+br],[x-s*.35,y-s*2.95+br],[x+s*.4,y-s*3.0+br],[x+s*.5,y-s*2.4+br]]);ctx.fill();
  for(const k of [-1,1])mlEye(x+k*s*.17+f*s*.06,y-s*2.65+br,s*.07,'#e8fbff','#7ae0ff');};
