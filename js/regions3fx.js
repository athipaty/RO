"use strict";
/* ================= the Molten Depths: looks, sounds and lists (v1.41.2) ================= */
if(typeof MOB_LOOKS!=='undefined'){
const mGlow=(x,y,r,col,a)=>{ctx.save();ctx.globalAlpha=a;const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,col);g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.fill();ctx.restore();};
// Ember Bat: a dark bat with fire-lit wing membranes, flitting above the ground
MOB_LOOKS.emberbat=(m,o)=>{const {x,s,t,f}=o;const fl=Math.sin(t*14),y=o.y-s*1.6-Math.abs(Math.sin(t*3))*s*.3;shadow(x,o.y,s*.7);mGlow(x,y,s*1.6,'#ff7a2a',.25);
  for(const k of [-1,1]){ctx.fillStyle='#3a1a16';ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+k*s*.7,y-s*(.6+fl*.5));ctx.lineTo(x+k*s*1.6,y-s*(.3+fl*.7));ctx.lineTo(x+k*s*1.3,y+s*.2);ctx.lineTo(x+k*s*.9,y);ctx.lineTo(x+k*s*.6,y+s*.3);ctx.closePath();ctx.fill();
    ctx.fillStyle='rgba(255,120,40,.6)';ctx.beginPath();ctx.moveTo(x+k*s*.3,y);ctx.lineTo(x+k*s*.75,y-s*(.45+fl*.4));ctx.lineTo(x+k*s*1.35,y-s*(.25+fl*.55));ctx.lineTo(x+k*s*1.1,y+s*.1);ctx.closePath();ctx.fill();}
  ctx.fillStyle='#2a1210';ctx.beginPath();ctx.ellipse(x,y,s*.38,s*.5,0,0,7);ctx.fill();for(const k of [-1,1]){ctx.beginPath();ctx.moveTo(x+k*s*.12,y-s*.4);ctx.lineTo(x+k*s*.25,y-s*.85);ctx.lineTo(x+k*s*.32,y-s*.35);ctx.fill();}
  for(const k of [-.12,.12])mlEye(x+k*s+f*s*.05,y-s*.2,s*.07,'#ffe040','#ffb020');};
// Lava Slug: a fat slug of molten rock, a glowing trail, eye stalks, bubbles bursting on its back
MOB_LOOKS.lavaslug=(m,o)=>{const {x,y,s,t,f,mv}=o;shadow(x,y,s*1.3);const w=mv?Math.sin(t*6)*s*.06:0;mGlow(x-f*s*1.4,y,s*1.2,'#ff6a1a',.3);
  ctx.fillStyle='rgba(255,110,30,.55)';ctx.beginPath();ctx.ellipse(x-f*s*1.3,y,s*.9,s*.18,0,0,7);ctx.fill();
  ctx.fillStyle='#c8401a';ctx.beginPath();ctx.moveTo(x-f*s*1.2,y);ctx.quadraticCurveTo(x-f*s*.9,y-s*1.1+w,x+f*s*.3,y-s*1.0);ctx.quadraticCurveTo(x+f*s*1.2,y-s*.9,x+f*s*1.25,y);ctx.closePath();ctx.fill();ctx.strokeStyle='#5a1a0a';ctx.lineWidth=1.6;ctx.stroke();
  ctx.fillStyle='#ffb04a';ctx.beginPath();ctx.ellipse(x,y-s*.8+w,s*.6,s*.22,0,0,7);ctx.fill();
  for(let k=0;k<3;k++){const ph=(t*.7+k/3)%1;ctx.globalAlpha=1-ph;ctx.fillStyle='#ffd060';ctx.beginPath();ctx.arc(x+(k-1)*s*.35,y-s*(.95+ph*.4),s*(.08+ph*.1),0,7);ctx.fill();}ctx.globalAlpha=1;
  for(const k of [-1,1]){ctx.strokeStyle='#5a1a0a';ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(x+f*s*(.9+k*.08),y-s*.75);ctx.lineTo(x+f*s*(1.05+k*.12),y-s*1.25);ctx.stroke();mlEye(x+f*s*(1.05+k*.12),y-s*1.3,s*.09,'#1a1a1a');}};
// Basalt Crawler: a many-legged stone insect, plated in dark basalt with lava between the plates
MOB_LOOKS.basaltcrawler=(m,o)=>{const {x,y,s,t,f,mv}=o;shadow(x,y,s*1.3);
  ctx.strokeStyle='#1e181c';ctx.lineWidth=Math.max(2,s*.12);ctx.lineCap='round';for(let i=0;i<4;i++)for(const k of [-1,1]){const lx=x+(-.7+i*.45)*s,sw=mv?Math.sin(t*14+i*1.3+k)*s*.15:0;ctx.beginPath();ctx.moveTo(lx,y-s*.4);ctx.lineTo(lx+sw,y-s*(.15-k*.05));ctx.lineTo(lx+sw*1.4+k*s*.05,y);ctx.stroke();}
  for(let i=0;i<4;i++){const px=x+(-.75+i*.5)*s*f;ctx.fillStyle='#ff6a1a';ctx.beginPath();ctx.ellipse(px,y-s*.6,s*.32,s*.32,0,0,7);ctx.fill();ctx.fillStyle=i%2?'#3a3236':'#2a2228';ctx.beginPath();ctx.ellipse(px,y-s*.65,s*.3,s*.3,0,Math.PI,0);ctx.lineTo(px+s*.3,y-s*.55);ctx.lineTo(px-s*.3,y-s*.55);ctx.fill();}
  ctx.fillStyle='#2a2228';ctx.beginPath();ctx.ellipse(x+f*s*1.05,y-s*.55,s*.35,s*.28,0,0,7);ctx.fill();
  ctx.strokeStyle='#1e181c';ctx.lineWidth=1.6;for(const k of [-1,1]){ctx.beginPath();ctx.moveTo(x+f*s*1.3,y-s*.65);ctx.quadraticCurveTo(x+f*s*1.6,y-s*(.9+k*.1),x+f*s*1.7,y-s*(.6+k*.25));ctx.stroke();}
  mlEye(x+f*s*1.18,y-s*.62,s*.08,'#ffe040','#ffb020');};
// Magma Elemental: a towering shape of flowing magma with a crust of rock, a bright molten core
MOB_LOOKS.magmaelemental=(m,o)=>{const {x,y,s,t,f,mv}=o;shadow(x,y,s*1.2);const b=Math.sin(t*(mv?6:1.5))*s*.05,p=.7+Math.sin(t*3)*.2;mGlow(x,y-s*1.2,s*2,'#ff6a1a',.35*p);
  ctx.fillStyle='#e8541a';ctx.beginPath();ctx.moveTo(x-s*.9,y);for(let i=0;i<=8;i++){const a=Math.PI+i*Math.PI/8,r=s*(1.05+Math.sin(t*3+i)*.08);ctx.lineTo(x+Math.cos(a)*r,y-s*1.1+Math.sin(a)*r*1.1+b);}ctx.lineTo(x+s*.9,y);ctx.closePath();ctx.fill();
  ctx.fillStyle='#3a2a26';for(const [a,b2,w,h] of [[-.5,-1.6,.45,.3],[.3,-1.9,.4,.28],[.55,-1.1,.3,.25],[-.7,-.8,.3,.22],[0,-.5,.4,.2]]){ctx.beginPath();ctx.ellipse(x+a*s,y+b2*s+b,s*w,s*h,a,0,7);ctx.fill();}
  ctx.fillStyle='rgba(255,230,120,'+p+')';ctx.beginPath();ctx.arc(x,y-s*1.25+b,s*.3,0,7);ctx.fill();
  for(const k of [-1,1]){ctx.save();ctx.translate(x+k*s*.95,y-s*1.4+b);ctx.rotate(k*(.4+(mv?Math.sin(t*6+k)*.3:0)));ctx.fillStyle='#e8541a';ctx.beginPath();ctx.ellipse(0,s*.45,s*.22,s*.55,0,0,7);ctx.fill();ctx.fillStyle='#3a2a26';ctx.beginPath();ctx.ellipse(0,s*.85,s*.25,s*.2,0,0,7);ctx.fill();ctx.restore();}
  for(const k of [-.2,.2])mlEye(x+k*s+f*s*.1,y-s*1.85+b,s*.1,'#fff6c0','#ffe060');};
// Molten Knight: an undead knight in blackened armour glowing from within, a burning sword, flames for a plume
MOB_LOOKS.moltenknight=(m,o)=>{const {x,y,s,t,f,mv}=o;shadow(x,y,s*1.1);const st=mv?Math.sin(t*9)*s*.12:0;
  ctx.fillStyle='#2a2226';for(const k of [-1,1]){ctx.fillRect(x+k*s*.3-s*.14+(k<0?st:-st),y-s*.8,s*.28,s*.8);}
  ctx.fillStyle='#3a2e30';ctx.beginPath();ctx.moveTo(x-s*.6,y-s*.75);ctx.lineTo(x-s*.7,y-s*1.7);ctx.lineTo(x+s*.7,y-s*1.7);ctx.lineTo(x+s*.6,y-s*.75);ctx.closePath();ctx.fill();ctx.strokeStyle='#120a0a';ctx.lineWidth=1.6;ctx.stroke();
  ctx.strokeStyle='#ff7a2a';ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(x-s*.4,y-s*1.25);ctx.lineTo(x+s*.4,y-s*1.25);ctx.moveTo(x,y-s*1.65);ctx.lineTo(x,y-s*.85);ctx.stroke();
  ctx.fillStyle='#3a2e30';ctx.beginPath();ctx.roundRect(x-s*.38,y-s*2.25,s*.76,s*.62,s*.18);ctx.fill();ctx.stroke();ctx.fillStyle='#ff9a3a';ctx.fillRect(x-s*.25+f*s*.05,y-s*2.0,s*.5,s*.08);
  for(let k=0;k<3;k++){const fh=s*(.4+Math.sin(t*8+k)*.12);ctx.fillStyle=k%2?'#ffcf5a':'#ff6a2a';ctx.beginPath();ctx.moveTo(x+(k-1)*s*.14-s*.08,y-s*2.25);ctx.quadraticCurveTo(x+(k-1)*s*.14-f*s*.15,y-s*2.25-fh*1.5,x+(k-1)*s*.14+s*.08,y-s*2.25);ctx.fill();}
  ctx.save();ctx.translate(x+f*s*.75,y-s*1.2);ctx.rotate(f*(-.5+(mv?Math.sin(t*9)*.2:0)));mGlow(0,-s*.9,s*.7,'#ff7a2a',.5);ctx.fillStyle='#ffb04a';ctx.fillRect(-s*.07,-s*1.6,s*.14,s*1.4);ctx.fillStyle='#5a4a3a';ctx.fillRect(-s*.25,-s*.22,s*.5,s*.1);ctx.restore();};
// Ash Revenant: a hooded wraith of grey ash, its shape crumbling into drifting cinders, violet eyes
MOB_LOOKS.ashrevenant=(m,o)=>{const {x,s,t,f}=o;const fl=Math.sin(t*2)*s*.15,y=o.y-s*.9-fl;shadow(x,o.y,s*.7);
  for(let k=0;k<7;k++){const ph=(t*.6+k/7)%1;ctx.globalAlpha=(1-ph)*.7;ctx.fillStyle='#6a5a6a';ctx.beginPath();ctx.arc(x-f*s*(.3+ph*1.2)+Math.sin(t+k)*s*.2,y+s*(.4-ph*.8),s*(.1+ph*.05),0,7);ctx.fill();}ctx.globalAlpha=1;
  ctx.fillStyle='#8a7a8a';ctx.beginPath();ctx.moveTo(x-s*.65,y+s*.7);for(let i=0;i<=5;i++)ctx.lineTo(x-s*.65+i*s*.26,y+s*.7+(i%2?s*.25:0));ctx.quadraticCurveTo(x+s*.75,y-s*.6,x,y-s*1.35);ctx.quadraticCurveTo(x-s*.75,y-s*.6,x-s*.65,y+s*.7);ctx.fill();ctx.strokeStyle='#3a2e3a';ctx.lineWidth=1.3;ctx.stroke();
  ctx.fillStyle='#1a121a';ctx.beginPath();ctx.ellipse(x+f*s*.05,y-s*.65,s*.27,s*.32,0,0,7);ctx.fill();
  for(const k of [-.1,.1])mlEye(x+k*s+f*s*.06,y-s*.7,s*.06,'#d8a0ff','#b070ff');
  ctx.strokeStyle='#8a7a8a';ctx.lineWidth=s*.12;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x+f*s*.4,y-s*.2);ctx.quadraticCurveTo(x+f*s*.9,y-s*.1,x+f*s*1.0,y+s*.3+Math.sin(t*3)*s*.1);ctx.stroke();};
// Hellflame Imp: a small red devil with bat wings, horns and a fireball held over its head
MOB_LOOKS.hellimp=(m,o)=>{const {x,s,t,f}=o;const hop=Math.abs(Math.sin(t*4))*s*.3,y=o.y-hop;shadow(x,o.y,s*.7);
  for(const k of [-1,1]){ctx.fillStyle='#6a1a1a';ctx.beginPath();ctx.moveTo(x+k*s*.2,y-s*1.1);ctx.lineTo(x+k*s*1.1,y-s*(1.5+Math.sin(t*10)*.15));ctx.lineTo(x+k*s*.9,y-s*.9);ctx.lineTo(x+k*s*.6,y-s*1.0);ctx.closePath();ctx.fill();}
  ctx.fillStyle='#c82a2a';ctx.beginPath();ctx.ellipse(x,y-s*.65,s*.42,s*.55,0,0,7);ctx.fill();ctx.strokeStyle='#4a0a0a';ctx.lineWidth=1.3;ctx.stroke();
  ctx.beginPath();ctx.arc(x,y-s*1.35,s*.38,0,7);ctx.fill();ctx.stroke();ctx.fillStyle='#2a1a1a';for(const k of [-1,1]){ctx.beginPath();ctx.moveTo(x+k*s*.2,y-s*1.6);ctx.quadraticCurveTo(x+k*s*.45,y-s*1.95,x+k*s*.35,y-s*2.1);ctx.lineTo(x+k*s*.32,y-s*1.6);ctx.fill();}
  for(const k of [-.13,.13])mlEye(x+k*s+f*s*.08,y-s*1.38,s*.07,'#ffe040','#ffb020');
  ctx.strokeStyle='#c82a2a';ctx.lineWidth=s*.1;ctx.beginPath();ctx.moveTo(x-f*s*.35,y-s*.3);ctx.quadraticCurveTo(x-f*s*.9,y-s*.1,x-f*s*.8,y-s*.6);ctx.stroke();
  const fb=s*(.3+Math.sin(t*6)*.05);mGlow(x+f*s*.45,y-s*2.2,s*.9,'#ff8a3a',.6);ctx.fillStyle='#ffb04a';ctx.beginPath();ctx.arc(x+f*s*.45,y-s*2.2,fb,0,7);ctx.fill();ctx.fillStyle='#fff0a0';ctx.beginPath();ctx.arc(x+f*s*.45,y-s*2.2,fb*.5,0,7);ctx.fill();};
// Ignarok the Molten King: a colossal king of rock and lava on a throne-like body, a crown of flames, a molten axe
MOB_LOOKS.ignarok=(m,o)=>{const {x,y,s,t,f,mv}=o;shadow(x,y,s*1.5);const b=Math.sin(t*(mv?5:1.2))*s*.04,p=.7+Math.sin(t*2)*.2;mGlow(x,y-s*1.4,s*2.6,'#ff5a1a',.4*p);
  ctx.fillStyle='#2a1e1c';for(const k of [-1,1]){ctx.beginPath();ctx.roundRect(x+k*s*.5-s*.28,y-s*.85,s*.56,s*.85,s*.1);ctx.fill();}
  ctx.fillStyle='#4a2a22';ctx.beginPath();ctx.moveTo(x-s*1.1,y-s*.8);ctx.lineTo(x-s*1.3,y-s*2.0+b);ctx.quadraticCurveTo(x,y-s*2.4+b,x+s*1.3,y-s*2.0+b);ctx.lineTo(x+s*1.1,y-s*.8);ctx.closePath();ctx.fill();ctx.strokeStyle='#1a0c08';ctx.lineWidth=2.2;ctx.stroke();
  ctx.strokeStyle='rgba(255,'+(110+Math.round(80*p))+',40,1)';ctx.lineWidth=2.4;for(const pts of [[[-.8,-1.0],[-.4,-1.5],[-.1,-1.2],[.2,-1.8]],[[.3,-.9],[.6,-1.4],[.9,-1.2]],[[-.5,-1.9],[0,-2.05],[.5,-1.95]]]){ctx.beginPath();pts.forEach(([a,c],i)=>{const px=x+a*s,py=y+c*s+b;if(i)ctx.lineTo(px,py);else ctx.moveTo(px,py);});ctx.stroke();}
  for(const k of [-1,1]){ctx.fillStyle='#3a2420';ctx.beginPath();ctx.ellipse(x+k*s*1.25,y-s*1.95+b,s*.42,s*.32,0,0,7);ctx.fill();ctx.stroke();}
  ctx.save();ctx.translate(x-f*s*1.3,y-s*1.7+b);ctx.rotate(-f*(.2+(mv?Math.sin(t*5)*.2:0)));ctx.fillStyle='#3a2420';ctx.beginPath();ctx.roundRect(-s*.24,0,s*.48,s*1.0,s*.1);ctx.fill();ctx.restore();
  ctx.save();ctx.translate(x+f*s*1.35,y-s*1.7+b);ctx.rotate(f*(-.6+(mv?Math.sin(t*5)*.35:0)));ctx.fillStyle='#3a2420';ctx.fillRect(-s*.08,-s*1.5,s*.16,s*2.1);
    mGlow(0,-s*1.4,s*.9,'#ff7a2a',.6);ctx.fillStyle='#ff8a3a';ctx.beginPath();ctx.moveTo(0,-s*1.7);ctx.quadraticCurveTo(f*s*.9,-s*1.6,f*s*.8,-s*.9);ctx.quadraticCurveTo(f*s*.4,-s*1.15,0,-s*1.0);ctx.closePath();ctx.fill();ctx.restore();
  ctx.fillStyle='#4a2a22';ctx.beginPath();ctx.arc(x+f*s*.1,y-s*2.55+b,s*.55,0,7);ctx.fill();ctx.strokeStyle='#1a0c08';ctx.stroke();
  for(const k of [-.2,.2])mlEye(x+k*s+f*s*.18,y-s*2.55+b,s*.12,'#fff0a0','#ffd040');
  ctx.fillStyle='#ffcf5a';ctx.strokeStyle='#8a4a0a';ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(x-s*.5+f*s*.1,y-s*2.9+b);for(let k=0;k<=4;k++)ctx.lineTo(x-s*.5+k*s*.25+f*s*.1,y-s*(k%2?2.95:3.35)+b);ctx.lineTo(x+s*.5+f*s*.1,y-s*2.9+b);ctx.closePath();ctx.fill();ctx.stroke();
  for(let k=-2;k<=2;k++){const fh=s*(.35+Math.sin(t*8+k)*.12);ctx.fillStyle=Math.abs(k)%2?'#ff6a2a':'#ffd060';ctx.beginPath();ctx.moveTo(x+k*s*.22+f*s*.1-s*.08,y-s*3.3+b);ctx.quadraticCurveTo(x+k*s*.22+f*s*.1,y-s*3.3-fh*1.5+b,x+k*s*.22+f*s*.1+s*.08,y-s*3.3+b);ctx.fill();}};}
// ---- atmosphere: embers, a deep rumble, lava crackling and dripping ----
if(typeof AMB!=='undefined')for(const z of ['molten1','molten2','molten3'])AMB[z]={n:34,col:'#ff8a3a'};
if(typeof BEDS!=='undefined')for(const z of ['molten1','molten2','molten3'])BEDS[z]=[.016,240];
if(typeof SPOTS!=='undefined'&&typeof crackle==='function'&&typeof drip==='function')for(const z of ['molten1','molten2','molten3'])SPOTS[z]=[()=>Math.random()<.5?crackle():drip(),2,5];
{const _ga3=groundAt;groundAt=function(x,y){const r=_ga3.apply(this,arguments);try{if(Z&&Z.D.theme==='molten')return r==='stone'?'stone':'cave';}catch(e){}return r;};}
// ---- the album page, the world map (three floors under the Caldera), the new-region cards ----
if(typeof ALBUM!=='undefined'&&!ALBUM.some(p=>p.id==='molten'))ALBUM.push({id:'molten',name:'Molten Depths',zones:['molten1','molten2','molten3'],b:{matk:15,hppct:3}});
if(typeof WORLD_BRANCH!=='undefined')WORLD_BRANCH.caldera=['molten1','molten2','molten3'];
if(typeof ZONE_BLURB!=='undefined')Object.assign(ZONE_BLURB,{coast:'Sun, sand and tide pools. The Kraken Matron rises from the reef.',caldera:'A volcano of black rock and lava. Bring Water Oil.',
  molten1:'Tunnels of basalt and lava under the Caldera.',molten2:'Deeper and hotter: magma that walks, knights that burn.',molten3:'Ignarok the Molten King waits at the bottom of the world.'});
if(typeof TH!=='undefined')for(const [k,v] of [['Sun, sand and tide pools. The Kraken Matron rises from the reef.','แดด ทราย และแอ่งน้ำทะเล ราชินีคราเคนผุดขึ้นจากแนวปะการัง'],['A volcano of black rock and lava. Bring Water Oil.','ภูเขาไฟแห่งหินดำและลาวา พกน้ำมันน้ำไปด้วย'],
  ['Tunnels of basalt and lava under the Caldera.','อุโมงค์หินบะซอลต์และลาวาใต้ปล่องภูเขาไฟ'],['Deeper and hotter: magma that walks, knights that burn.','ลึกและร้อนขึ้น: แมกมาที่เดินได้ อัศวินที่ลุกเป็นไฟ'],['Ignarok the Molten King waits at the bottom of the world.','อิกนาร็อก ราชาลาวา รออยู่ที่ก้นบึ้งของโลก']])if(!TH[k])TH[k]=v;
