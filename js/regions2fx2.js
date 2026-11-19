"use strict";
/* ================= Cinderpeak Caldera: looks, sounds and lists (v1.41.1) ================= */
if(typeof MOB_LOOKS!=='undefined'){
const glowAt=(x,y,r,col,a)=>{ctx.save();ctx.globalAlpha=a;const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,col);g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.fill();ctx.restore();};
// Cinderling: a lump of cooling lava, cracked dark crust over a glowing core that throbs; little flames on top
MOB_LOOKS.cinderling=(m,o)=>{const {x,y,s,t,f,mv}=o;const q=Math.sin(t*(mv?10:2.5))*s*.07,p=.6+Math.sin(t*3)*.25;shadow(x,y,s*1.1);glowAt(x,y-s*.7,s*1.6,'#ff8a3a',.35*p);
  ctx.fillStyle='#3a2a26';ctx.beginPath();ctx.moveTo(x-s*1.1,y);ctx.quadraticCurveTo(x-s*1.1,y-s*1.3+q,x,y-s*1.5+q);ctx.quadraticCurveTo(x+s*1.1,y-s*1.3+q,x+s*1.1,y);ctx.closePath();ctx.fill();
  ctx.strokeStyle='rgba(255,'+(120+Math.round(80*p))+',40,1)';ctx.lineWidth=2;for(const [a,b,c,d] of [[-.7,-.3,-.2,-1.1],[-.2,-1.1,.4,-.6],[.4,-.6,.8,-.9],[-.3,-.5,.3,-.2]]){ctx.beginPath();ctx.moveTo(x+a*s,y+b*s+q);ctx.lineTo(x+c*s,y+d*s+q);ctx.stroke();}
  for(let k=-1;k<=1;k++){const fh=s*(.35+Math.sin(t*8+k)*.1);ctx.fillStyle=k?'#ff9a3a':'#ffd060';ctx.beginPath();ctx.moveTo(x+k*s*.35-s*.12,y-s*1.4+q);ctx.quadraticCurveTo(x+k*s*.35,y-s*1.4-fh*2+q,x+k*s*.35+s*.12,y-s*1.4+q);ctx.fill();}
  for(const k of [-1,1])mlEye(x+k*s*.3+f*s*.15,y-s*.85+q,s*.13,'#ffe080','#ffb040');};
// Magma Hound: a lean black hound with glowing lava veins, a mane of flame and a flaming tail
MOB_LOOKS.magmahound=(m,o)=>{const {x,y,s,t,f,mv}=o;shadow(x,y,s*1.2);mlLegs(o,x,s*.55,.7,Math.max(2.5,s*.22),'#2a1a16');
  ctx.fillStyle='#2e2220';ctx.beginPath();ctx.ellipse(x,y-s*.85,s*1.0,s*.42,0,0,7);ctx.fill();ctx.strokeStyle='#120a08';ctx.lineWidth=1.5;ctx.stroke();
  ctx.strokeStyle='#ff7a2a';ctx.lineWidth=1.6;for(const k of [-.6,-.2,.2]){ctx.beginPath();ctx.moveTo(x+k*s,y-s*1.15);ctx.quadraticCurveTo(x+k*s+s*.1,y-s*.85,x+k*s,y-s*.55);ctx.stroke();}
  const tw=mv?Math.sin(t*10)*s*.2:0;ctx.fillStyle='#ff8a3a';ctx.beginPath();ctx.moveTo(x-f*s*.95,y-s*.95);ctx.quadraticCurveTo(x-f*s*1.6,y-s*1.4+tw,x-f*s*1.7,y-s*1.0+tw);ctx.quadraticCurveTo(x-f*s*1.3,y-s*.85,x-f*s*.9,y-s*.75);ctx.fill();
  ctx.fillStyle='#2e2220';ctx.beginPath();ctx.ellipse(x+f*s*1.0,y-s*1.15,s*.45,s*.35,f*.2,0,7);ctx.fill();ctx.stroke();ctx.beginPath();ctx.moveTo(x+f*s*1.3,y-s*1.2);ctx.lineTo(x+f*s*1.65,y-s*1.05);ctx.lineTo(x+f*s*1.3,y-s*.95);ctx.fill();
  for(let k=0;k<5;k++){const a=-Math.PI*.9+k*.32,fl=s*(.35+Math.sin(t*9+k)*.12);ctx.fillStyle=k%2?'#ff9a3a':'#ffcf5a';ctx.beginPath();ctx.moveTo(x+f*s*.75+Math.cos(a)*s*.25,y-s*1.3);ctx.lineTo(x+f*s*.75+Math.cos(a)*s*.35-f*fl*.4,y-s*1.3-fl);ctx.lineTo(x+f*s*.75+Math.cos(a)*s*.45,y-s*1.25);ctx.fill();}
  ctx.fillStyle='#2e2220';for(const k of [-1,1]){ctx.beginPath();ctx.moveTo(x+f*s*(.85+k*.12),y-s*1.4);ctx.lineTo(x+f*s*(.95+k*.12),y-s*1.75);ctx.lineTo(x+f*s*(1.05+k*.12),y-s*1.4);ctx.fill();}
  mlEye(x+f*s*1.18,y-s*1.22,s*.09,'#ffe040','#ffb020');};
// Obsidian Golem: a faceted giant of black volcanic glass with violet glints and glowing seams
MOB_LOOKS.obsidiangolem=(m,o)=>{const {x,y,s,t,f,mv}=o;shadow(x,y,s*1.2);const b=Math.sin(t*(mv?7:1.5))*s*.04;
  ctx.fillStyle='#1e1a26';for(const k of [-1,1]){ctx.beginPath();ctx.moveTo(x+k*s*.6,y);ctx.lineTo(x+k*s*.25,y-s*.7);ctx.lineTo(x+k*s*.75,y-s*.7);ctx.closePath();ctx.fill();}
  const body=[[-1,-.6],[-1.1,-1.6],[-.4,-2.2],[.5,-2.15],[1.1,-1.5],[.95,-.6]];ctx.fillStyle='#2e2838';ctx.beginPath();body.forEach(([a,c],i)=>{const px=x+a*s,py=y+c*s+b;if(i)ctx.lineTo(px,py);else ctx.moveTo(px,py);});ctx.closePath();ctx.fill();ctx.strokeStyle='#120e18';ctx.lineWidth=1.8;ctx.stroke();
  ctx.fillStyle='rgba(160,120,220,.35)';ctx.beginPath();ctx.moveTo(x-s*.9,y-s*1.55+b);ctx.lineTo(x-s*.35,y-s*2.1+b);ctx.lineTo(x-s*.1,y-s*1.3+b);ctx.closePath();ctx.fill();
  ctx.fillStyle='rgba(255,255,255,.25)';ctx.beginPath();ctx.moveTo(x+s*.45,y-s*2.05+b);ctx.lineTo(x+s*.9,y-s*1.5+b);ctx.lineTo(x+s*.55,y-s*1.6+b);ctx.closePath();ctx.fill();
  ctx.strokeStyle='rgba(255,'+(130+Math.round(60*Math.sin(t*2)))+',60,.9)';ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(x-s*.3,y-s*.7+b);ctx.lineTo(x-s*.05,y-s*1.3+b);ctx.lineTo(x+s*.35,y-s*1.0+b);ctx.lineTo(x+s*.5,y-s*1.6+b);ctx.stroke();
  for(const k of [-1,1]){ctx.save();ctx.translate(x+k*s*1.15,y-s*1.6+b);ctx.rotate(k*(.25+(mv?Math.sin(t*7+k)*.25:0)));ctx.fillStyle='#2e2838';ctx.beginPath();ctx.moveTo(-s*.2,0);ctx.lineTo(s*.2,0);ctx.lineTo(s*.28,s*.9);ctx.lineTo(-s*.28,s*.9);ctx.closePath();ctx.fill();ctx.strokeStyle='#120e18';ctx.stroke();ctx.restore();}
  for(const k of [-.18,.18])mlEye(x+k*s+f*s*.15,y-s*1.85+b,s*.1,'#c8a0ff','#a070ff');};
// Flame Wraith: a hooded spirit of fire, a tattered robe of flame trailing sparks, a burning face in the hood
MOB_LOOKS.flamewraith=(m,o)=>{const {x,s,t,f}=o;const fl=Math.sin(t*2.4)*s*.15,y=o.y-s*.9-fl;shadow(x,o.y,s*.7);glowAt(x,y-s*.4,s*1.8,'#ff7a2a',.35);
  for(let k=0;k<6;k++){const ph=(t*1.5+k/6)%1;ctx.globalAlpha=1-ph;ctx.fillStyle=k%2?'#ffcf5a':'#ff6a2a';ctx.beginPath();ctx.arc(x+Math.sin(t*3+k)*s*.4,y+s*(.6+ph*.8),s*(.12-ph*.08),0,7);ctx.fill();}ctx.globalAlpha=1;
  ctx.fillStyle='#ff6a2a';ctx.beginPath();ctx.moveTo(x-s*.7,y+s*.6);for(let i=0;i<=6;i++)ctx.lineTo(x-s*.7+i*s*.233,y+s*.6+(i%2?s*.3:0)+Math.sin(t*6+i)*s*.08);ctx.quadraticCurveTo(x+s*.8,y-s*.6,x,y-s*1.4);ctx.quadraticCurveTo(x-s*.8,y-s*.6,x-s*.7,y+s*.6);ctx.fill();
  ctx.fillStyle='#ffb04a';ctx.beginPath();ctx.moveTo(x-s*.4,y+s*.4);ctx.quadraticCurveTo(x,y-s*1.0,x+s*.4,y+s*.4);ctx.fill();
  ctx.fillStyle='#2a1410';ctx.beginPath();ctx.ellipse(x+f*s*.05,y-s*.65,s*.28,s*.32,0,0,7);ctx.fill();
  for(const k of [-.11,.11])mlEye(x+k*s+f*s*.06,y-s*.7,s*.07,'#fff0a0','#ffe060');};
// Ashen Salamander: a long lizard of grey ash scales with orange spots, a flaming back crest and a whip tail
MOB_LOOKS.salamander=(m,o)=>{const {x,y,s,t,f,mv}=o;shadow(x,y,s*1.3);const sw=mv?Math.sin(t*10)*s*.15:Math.sin(t*2)*s*.05;
  ctx.strokeStyle='#5a4a46';ctx.lineWidth=Math.max(2.5,s*.2);ctx.lineCap='round';for(const [k,ph] of [[-.7,0],[-.3,Math.PI],[.3,Math.PI*.5],[.7,Math.PI*1.5]]){const lw=mv?Math.sin(t*12+ph)*s*.2:0;ctx.beginPath();ctx.moveTo(x+k*s,y-s*.4);ctx.lineTo(x+k*s*1.15+lw,y-s*.05);ctx.stroke();}
  ctx.fillStyle='#6a5a56';ctx.beginPath();ctx.moveTo(x-f*s*.9,y-s*.65);ctx.quadraticCurveTo(x-f*s*1.6,y-s*.5+sw,x-f*s*2.1,y-s*.9+sw*1.5);ctx.quadraticCurveTo(x-f*s*1.5,y-s*.3,x-f*s*.8,y-s*.35);ctx.fill();
  ctx.beginPath();ctx.ellipse(x,y-s*.55,s*1.05,s*.35,0,0,7);ctx.fill();ctx.strokeStyle='#2a201e';ctx.lineWidth=1.4;ctx.stroke();
  ctx.fillStyle='#ff8a3a';for(const [a,b] of [[-.6,-.6],[-.2,-.7],[.25,-.6],[.55,-.5],[-.4,-.45]]){ctx.beginPath();ctx.arc(x+a*s,y+b*s,s*.08,0,7);ctx.fill();}
  for(let k=0;k<6;k++){const px=x+(-.8+k*.32)*s,fh=s*(.25+Math.sin(t*8+k)*.08);ctx.fillStyle=k%2?'#ff9a3a':'#ffcf5a';ctx.beginPath();ctx.moveTo(px-s*.1,y-s*.85);ctx.quadraticCurveTo(px,y-s*.85-fh*2,px+s*.1,y-s*.85);ctx.fill();}
  ctx.fillStyle='#6a5a56';ctx.beginPath();ctx.ellipse(x+f*s*1.15,y-s*.6,s*.42,s*.25,0,0,7);ctx.fill();ctx.stroke();
  mlEye(x+f*s*1.25,y-s*.7,s*.08,'#ffe040','#ffb020');ctx.strokeStyle='#ff6a6a';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(x+f*s*1.55,y-s*.55);ctx.lineTo(x+f*s*(1.85+Math.sin(t*6)*.08),y-s*.5);ctx.stroke();};
// Pyre Titan: a huge giant of iron and stone with a brazier for a head, a fire roaring in it
MOB_LOOKS.pyretitan=(m,o)=>{const {x,y,s,t,col,dark,mv}=o;shadow(x,y,s*1.3);const b=Math.sin(t*(mv?7:1.5))*s*.04;
  ctx.fillStyle='#3a2a24';for(const k of [-1,1]){ctx.beginPath();ctx.roundRect(x+k*s*.45-s*.22,y-s*.75,s*.44,s*.75,s*.08);ctx.fill();}
  ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(x-s*.95,y-s*.7);ctx.lineTo(x-s*1.1,y-s*1.9+b);ctx.lineTo(x+s*1.1,y-s*1.9+b);ctx.lineTo(x+s*.95,y-s*.7);ctx.closePath();ctx.fill();ctx.strokeStyle=dark;ctx.lineWidth=1.8;ctx.stroke();
  ctx.fillStyle='#8a8a92';ctx.fillRect(x-s*1.0,y-s*1.45+b,s*2.0,s*.12);ctx.fillRect(x-s*1.05,y-s*1.85+b,s*2.1,s*.14);
  for(const k of [-1,1]){ctx.save();ctx.translate(x+k*s*1.2,y-s*1.8+b);ctx.rotate(k*(.2+(mv?Math.sin(t*7+k)*.25:0)));ctx.fillStyle=col;ctx.beginPath();ctx.roundRect(-s*.22,0,s*.44,s*1.0,s*.08);ctx.fill();ctx.stroke();ctx.restore();}
  ctx.fillStyle='#5a5a62';ctx.beginPath();ctx.moveTo(x-s*.7,y-s*1.95+b);ctx.lineTo(x+s*.7,y-s*1.95+b);ctx.lineTo(x+s*.5,y-s*2.35+b);ctx.lineTo(x-s*.5,y-s*2.35+b);ctx.closePath();ctx.fill();ctx.strokeStyle='#2a2a30';ctx.stroke();
  glowAt(x,y-s*2.6+b,s*1.5,'#ff8a3a',.45);for(let k=-2;k<=2;k++){const fh=s*(.6+Math.sin(t*7+k)*.2-Math.abs(k)*.1);ctx.fillStyle=Math.abs(k)%2?'#ff7a2a':'#ffd060';ctx.beginPath();ctx.moveTo(x+k*s*.22-s*.15,y-s*2.35+b);ctx.quadraticCurveTo(x+k*s*.22,y-s*2.35-fh*1.6+b,x+k*s*.22+s*.15,y-s*2.35+b);ctx.fill();}};
// Cinder Wyrm: a great red dragon with glowing wing membranes, curved horns and smoke from its jaws
MOB_LOOKS.cinderwyrm=(m,o)=>{const {x,y,s,t,f,col,dark,mv}=o;shadow(x,y,s*1.5);const wb=Math.sin(t*(mv?4:1.6))*.25;
  for(const k of [-1,1]){ctx.save();ctx.translate(x-f*s*.1,y-s*1.3);ctx.scale(k,1);ctx.rotate(-.3-wb);ctx.fillStyle='#5a1a10';ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(s*.5,-s*1.3);ctx.lineTo(s*1.1,-s*1.0);ctx.lineTo(s*1.6,-s*1.25);ctx.lineTo(s*1.8,-s*.4);ctx.quadraticCurveTo(s*.9,-s*.1,0,s*.2);ctx.closePath();ctx.fill();
    ctx.fillStyle='rgba(255,120,40,.45)';ctx.beginPath();ctx.moveTo(s*.2,-s*.1);ctx.lineTo(s*.55,-s*1.1);ctx.lineTo(s*1.05,-s*.85);ctx.lineTo(s*1.5,-s*1.05);ctx.lineTo(s*1.6,-s*.45);ctx.quadraticCurveTo(s*.8,-s*.2,s*.2,-s*.1);ctx.fill();ctx.restore();}
  mlLegs(o,x,s*.6,.6,Math.max(3,s*.22),'#4a140c');
  ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(x-f*s*.9,y-s*.9);ctx.quadraticCurveTo(x-f*s*1.8,y-s*.6+Math.sin(t*2)*s*.15,x-f*s*2.3,y-s*1.0);ctx.lineTo(x-f*s*2.0,y-s*.75);ctx.quadraticCurveTo(x-f*s*1.5,y-s*.4,x-f*s*.8,y-s*.55);ctx.fill();
  ctx.beginPath();ctx.ellipse(x,y-s*.9,s*1.05,s*.55,0,0,7);ctx.fill();ctx.strokeStyle=dark;ctx.lineWidth=2;ctx.stroke();
  ctx.fillStyle='#e8a050';ctx.beginPath();ctx.ellipse(x+f*s*.1,y-s*.6,s*.7,s*.22,0,0,Math.PI);ctx.fill();
  ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(x+f*s*.6,y-s*1.1);ctx.quadraticCurveTo(x+f*s*1.0,y-s*1.9,x+f*s*1.35,y-s*1.85);ctx.lineTo(x+f*s*1.5,y-s*1.55);ctx.quadraticCurveTo(x+f*s*1.0,y-s*1.3,x+f*s*.9,y-s*.85);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.beginPath();ctx.ellipse(x+f*s*1.5,y-s*1.8,s*.42,s*.28,f*.1,0,7);ctx.fill();ctx.stroke();
  ctx.fillStyle='#e8d8b0';for(const k of [-1,1]){ctx.beginPath();ctx.moveTo(x+f*s*(1.3+k*.08),y-s*1.95);ctx.quadraticCurveTo(x+f*s*(1.1+k*.08),y-s*2.4,x+f*s*(.9+k*.1),y-s*2.45);ctx.lineTo(x+f*s*(1.35+k*.08),y-s*2.0);ctx.fill();}
  mlEye(x+f*s*1.6,y-s*1.88,s*.08,'#ffe040','#ffb020');
  for(let k=0;k<3;k++){const ph=(t*.8+k/3)%1;ctx.globalAlpha=(1-ph)*.6;ctx.fillStyle='#6a5a56';ctx.beginPath();ctx.arc(x+f*s*(1.9+ph*.6),y-s*(1.75+ph*.6),s*(.1+ph*.25),0,7);ctx.fill();}ctx.globalAlpha=1;};}
// ---- atmosphere: embers in the air, a low rumble and crackling, ash and embers for weather, stone underfoot ----
if(typeof AMB!=='undefined')AMB.caldera={n:40,col:'#ff9a4a'};
if(typeof BEDS!=='undefined')BEDS.caldera=[.02,320];
if(typeof SPOTS!=='undefined'&&typeof crackle==='function')SPOTS.caldera=[()=>crackle(),2,5];
if(typeof WEATHERS!=='undefined')WEATHERS.caldera=[['embers',3],['clear',1]];
{const _ga2=groundAt;groundAt=function(x,y){const r=_ga2.apply(this,arguments);try{if(Z&&Z.D.theme==='caldera')return 'stone';}catch(e){}return r;};}
// ---- its own song: a heavy C minor theme with a driving beat ----
if(typeof SONGS!=='undefined'){SONGS.caldera={bpm:96,spb:8,lead:'sawtooth',lp:1300,lv:.7,chords:'Cm Ab Fm G Cm Ab Bb G',drums:{k:[0,3,4],h:[2,6],s:[4]},pulse:true,
    mel:'C4 . Eb4 . G4 . . C5 | Ab4 . . G4 F4 . Eb4 . | F4 . Ab4 . C5 . . Eb5 | D5 . . . B4 . G4 . | C5 . . Eb5 G5 . F5 Eb5 | Ab4 . C5 . Eb5 . D5 C5 | Bb4 . D5 . F5 . Eb5 D5 | B4 . . . G4 . - -'};
  const s=SONGS.caldera,toks=s.mel.replace(/\|/g,' ').trim().split(/\s+/);s.len=toks.length;s.ch=s.chords.split(' ').map(chordNotes);
  s.notes=toks.map((tk,i)=>{const n=noteNum(tk);if(n===null)return null;let len=1;while(toks[i+len]==='.')len++;return {n,len};});}
// ---- the album page, the world map road, the Waystation banner ----
if(typeof ALBUM!=='undefined'&&!ALBUM.some(p=>p.id==='caldera'))ALBUM.push({id:'caldera',name:'Cinderpeak Caldera',zones:['caldera'],b:{atk:12,critdmg:3}});
if(typeof WORLD_ROAD!=='undefined'&&!WORLD_ROAD.includes('caldera'))WORLD_ROAD.push('caldera');
if(typeof TC_BAN!=='undefined'){const _tb2=tcBanner;tcBanner=function(id){if(ZONES[id]&&ZONES[id].theme==='caldera'&&!TC_BAN[id]){const c=document.createElement('canvas');c.width=240;c.height=56;const g=c.getContext('2d');
  const sk=g.createLinearGradient(0,0,0,56);sk.addColorStop(0,'#2a1414');sk.addColorStop(1,'#8a3a1a');g.fillStyle=sk;g.fillRect(0,0,240,56);
  g.fillStyle='#1e1618';g.beginPath();g.moveTo(40,48);g.lineTo(110,10);g.lineTo(130,12);g.lineTo(200,48);g.fill();g.fillStyle='#ff7a2a';g.beginPath();g.moveTo(112,12);g.lineTo(128,12);g.lineTo(124,22);g.lineTo(116,22);g.fill();
  g.strokeStyle='#ff8a3a';g.lineWidth=3;g.beginPath();g.moveTo(120,20);g.quadraticCurveTo(140,36,150,48);g.stroke();
  g.fillStyle='rgba(120,110,110,.5)';for(let i=0;i<4;i++){g.beginPath();g.arc(118+i*6,8-i*3,4+i*2,0,7);g.fill();}
  g.fillStyle='#3a3236';g.fillRect(0,44,240,12);g.fillStyle='#e8541a';g.beginPath();g.ellipse(60,50,24,3,0,0,7);g.fill();g.beginPath();g.ellipse(190,52,18,2.5,0,0,7);g.fill();
  TC_BAN[id]=c.toDataURL();}return _tb2.apply(this,arguments);};}
// ---- the Caldera's own rocks: jagged black basalt with glowing lava cracks (no moss or grass) ----
{const _sp2=sprite;sprite=function(theme,kind,v){if((theme!=='caldera'&&theme!=='molten')||(kind!=='rock'&&kind!=='crag'))return _sp2.apply(this,arguments);const key='calrock'+kind+v;if(SPR[key])return SPR[key];
  const c=document.createElement('canvas');c.width=80;c.height=110;const g=c.getContext('2d'),ax=40,ay=100,tall=kind==='crag'?60+v*8:26+v*6,w=kind==='crag'?22:26;
  g.fillStyle='rgba(0,0,0,.3)';g.beginPath();g.ellipse(ax,ay,w+4,8,0,0,7);g.fill();
  const pts=kind==='crag'?[[-w,0],[-w*.7,-tall*.45],[-w*.35,-tall*.8],[0,-tall],[w*.3,-tall*.7],[w*.6,-tall*.85],[w,-tall*.3],[w*.9,0]]:[[-w,0],[-w*.85,-tall*.6],[-w*.3,-tall],[w*.4,-tall*.9],[w,-tall*.4],[w*.95,0]];
  g.fillStyle='#2a2228';g.beginPath();pts.forEach(([a,b],i)=>i?g.lineTo(ax+a,ay+b):g.moveTo(ax+a,ay+b));g.closePath();g.fill();g.strokeStyle='#120c10';g.lineWidth=1.6;g.stroke();
  g.fillStyle='#4a3e44';g.beginPath();g.moveTo(ax+pts[1][0],ay+pts[1][1]);g.lineTo(ax+pts[2][0],ay+pts[2][1]);g.lineTo(ax+pts[2][0]+6,ay+pts[2][1]+12);g.lineTo(ax+pts[1][0]+6,ay+pts[1][1]+10);g.closePath();g.fill();
  g.strokeStyle='#ff7a2a';g.lineWidth=1.8;g.shadowColor='#ff7a2a';g.shadowBlur=6;g.beginPath();g.moveTo(ax-w*.3,ay-2);g.lineTo(ax-w*.05,ay-tall*.35);g.lineTo(ax+w*.25,ay-tall*.25);g.lineTo(ax+w*.35,ay-tall*.55);g.stroke();g.shadowBlur=0;
  return SPR[key]={c,ax,ay};};}
