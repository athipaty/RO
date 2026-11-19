"use strict";
/* ================= the far east regions: looks, sounds and the places that list regions (v1.41.0) =================
   Loaded last. Monster artwork, the palm trees of the Coast, sea spray, waves and gulls, weather, the Coast's own song,
   its sigil album page, the world map road and the Waystation card. All drawn and composed in code. */
// ---- monster looks ----
if(typeof MOB_LOOKS!=='undefined'){
// Tidecrab: a broad red crab with two big claws that snap, eyes on stalks, legs that scuttle sideways
MOB_LOOKS.tidecrab=(m,o)=>{const {x,y,s,t,f,col,dark,lite,mv}=o;shadow(x,y,s*1.2);const sc=mv?Math.sin(t*14)*s*.12:0,snap=Math.abs(Math.sin(t*(mv?6:2)))*.5;
  ctx.strokeStyle=dark;ctx.lineWidth=Math.max(2,s*.13);ctx.lineCap='round';for(const k of [-1,1])for(let i=0;i<3;i++){const lx=x+k*s*(.45+i*.25);ctx.beginPath();ctx.moveTo(lx,y-s*.45);ctx.lineTo(lx+k*s*.35,y-s*.2+((i%2)?sc:-sc));ctx.lineTo(lx+k*s*.45,y);ctx.stroke();}
  ctx.fillStyle=col;ctx.beginPath();ctx.ellipse(x,y-s*.6,s*1.05,s*.58,0,0,7);ctx.fill();ctx.strokeStyle=dark;ctx.lineWidth=1.6;ctx.stroke();
  ctx.fillStyle=lite;ctx.beginPath();ctx.ellipse(x-s*.25,y-s*.85,s*.4,s*.18,-.2,0,7);ctx.fill();
  for(const k of [-1,1]){const cx=x+k*s*1.15,cy=y-s*.95;ctx.fillStyle=col;ctx.beginPath();ctx.ellipse(cx,cy,s*.42,s*.3,k*.4,0,7);ctx.fill();ctx.stroke();
    ctx.save();ctx.translate(cx+k*s*.25,cy-s*.12);ctx.rotate(k*(-.5-snap));ctx.beginPath();ctx.ellipse(k*s*.18,0,s*.22,s*.1,0,0,7);ctx.fill();ctx.stroke();ctx.restore();}
  for(const k of [-.28,.28]){ctx.strokeStyle=dark;ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(x+k*s,y-s*1.05);ctx.lineTo(x+k*s,y-s*1.35);ctx.stroke();mlEye(x+k*s,y-s*1.42,s*.11,'#1a1a1a');}};
// Saltwing: a white sea bird with long grey-tipped wings that flap, an orange beak, gliding a little above the sand
MOB_LOOKS.saltwing=(m,o)=>{const {x,s,t,f,col,dark,lite,mv}=o;const fl=Math.sin(t*(mv?10:3)),y=o.y-s*1.2-Math.abs(fl)*s*.2;shadow(x,o.y,s*.8);
  for(const k of [-1,1]){ctx.fillStyle=k<0?mlShade('#e8eef4',-25):col;ctx.beginPath();ctx.moveTo(x,y-s*.2);ctx.quadraticCurveTo(x+k*s*1.1,y-s*(.6+fl*.6),x+k*s*1.9,y-s*(.1+fl*.9));ctx.quadraticCurveTo(x+k*s*1.1,y+s*.1,x,y+s*.15);ctx.fill();ctx.strokeStyle=dark;ctx.lineWidth=1.2;ctx.stroke();
    ctx.fillStyle='#5a6470';ctx.beginPath();ctx.arc(x+k*s*1.85,y-s*(.1+fl*.9),s*.14,0,7);ctx.fill();}
  ctx.fillStyle=col;ctx.beginPath();ctx.ellipse(x,y,s*.6,s*.38,0,0,7);ctx.fill();ctx.stroke();ctx.beginPath();ctx.arc(x+f*s*.5,y-s*.3,s*.3,0,7);ctx.fill();ctx.stroke();
  ctx.fillStyle='#f0a030';ctx.beginPath();ctx.moveTo(x+f*s*.75,y-s*.33);ctx.lineTo(x+f*s*1.15,y-s*.25);ctx.lineTo(x+f*s*.75,y-s*.18);ctx.closePath();ctx.fill();mlEye(x+f*s*.58,y-s*.38,s*.08);};
// Driftwood Golem: a hulk of bleached driftwood planks lashed with rope, seaweed hanging, a lantern-green knot for an eye
MOB_LOOKS.driftgolem=(m,o)=>{const {x,y,s,t,f,col,dark,lite,mv}=o;shadow(x,y,s*1.15);const b=Math.sin(t*(mv?7:1.5))*s*.05;
  ctx.fillStyle=dark;for(const k of [-1,1]){ctx.save();ctx.translate(x+k*s*.42,y-s*.5);ctx.rotate(mv?Math.sin(t*7+k)*.2:0);ctx.fillRect(-s*.18,-s*.1,s*.36,s*.6);ctx.restore();}
  for(let i=0;i<4;i++){ctx.fillStyle=i%2?col:mlShade('#a8885a',18);ctx.save();ctx.translate(x,y-s*(1.1+i*.28)+b);ctx.rotate((i%2?.08:-.06));ctx.beginPath();ctx.roundRect(-s*(.75-i*.08),-s*.16,s*(1.5-i*.16),s*.32,s*.08);ctx.fill();ctx.strokeStyle=dark;ctx.lineWidth=1.3;ctx.stroke();ctx.restore();}
  ctx.strokeStyle='#d8c890';ctx.lineWidth=1.8;for(const k of [-.35,.35]){ctx.beginPath();ctx.moveTo(x+k*s,y-s*2.1+b);ctx.lineTo(x+k*s,y-s*.95+b);ctx.stroke();}
  for(const k of [-1,1]){ctx.save();ctx.translate(x+k*s*.85,y-s*1.65+b);ctx.rotate(k*(.4+(mv?Math.sin(t*7)*.25:0)));ctx.fillStyle=col;ctx.beginPath();ctx.roundRect(-s*.14,0,s*.28,s*.9,s*.06);ctx.fill();ctx.strokeStyle=dark;ctx.stroke();ctx.restore();}
  ctx.strokeStyle='#4a8a4a';ctx.lineWidth=2;for(const k of [-.5,.1,.55]){ctx.beginPath();ctx.moveTo(x+k*s,y-s*1.2+b);ctx.quadraticCurveTo(x+k*s+Math.sin(t*2+k)*s*.15,y-s*.8,x+k*s,y-s*.55);ctx.stroke();}
  mlEye(x+f*s*.2,y-s*1.9+b,s*.14,'#9fffb0','#7aff9a');};
// Coral Siren: a floating sea maiden of pink coral, long flowing hair, a shell harp; notes drift from her song
MOB_LOOKS.coralsiren=(m,o)=>{const {x,s,t,f,col,dark,lite}=o;const fl=Math.sin(t*2)*s*.15,y=o.y-s*.8-fl;shadow(x,o.y,s*.7);
  ctx.fillStyle=mlShade('#ff8aa8',-20);ctx.beginPath();ctx.moveTo(x-s*.5,y);ctx.quadraticCurveTo(x-s*.2,y+s*.9,x+f*s*.6,y+s*1.1+Math.sin(t*3)*s*.1);ctx.quadraticCurveTo(x+s*.2,y+s*.6,x+s*.5,y);ctx.closePath();ctx.fill();
  ctx.fillStyle=col;ctx.beginPath();ctx.ellipse(x,y-s*.35,s*.5,s*.6,0,0,7);ctx.fill();ctx.strokeStyle=dark;ctx.lineWidth=1.2;ctx.stroke();
  ctx.fillStyle='#ffd8c8';ctx.beginPath();ctx.arc(x,y-s*1.15,s*.38,0,7);ctx.fill();ctx.stroke();
  ctx.fillStyle='#c83a6a';for(let i=0;i<5;i++){const a=-Math.PI*.9+i*.35;ctx.beginPath();ctx.moveTo(x+Math.cos(a)*s*.35,y-s*1.15+Math.sin(a)*s*.35);ctx.quadraticCurveTo(x-f*s*(.6+i*.08),y-s*(.6-i*.1)+Math.sin(t*2+i)*s*.1,x-f*s*(.5+i*.1),y-s*(.1-i*.08));ctx.lineWidth=s*.12;ctx.strokeStyle='#c83a6a';ctx.stroke();}
  for(const k of [-.13,.13])mlEye(x+k*s+f*s*.08,y-s*1.17,s*.06,'#2a1a3a');
  ctx.fillStyle='#f0e0c0';ctx.beginPath();ctx.moveTo(x+f*s*.4,y-s*.2);ctx.quadraticCurveTo(x+f*s*.95,y-s*.6,x+f*s*.7,y+s*.25);ctx.closePath();ctx.fill();ctx.strokeStyle=dark;ctx.stroke();
  const ph=(t*.5)%1;ctx.globalAlpha=1-ph;ctx.fillStyle='#fff0f8';ctx.font=`${Math.round(s*.55)}px serif`;ctx.textAlign='center';ctx.fillText('♪',x+f*s*(.9+ph*.6),y-s*(.8+ph*1.2));ctx.globalAlpha=1;};
// Reef Stalker: a blue reef hunter, a shark-like head with a dorsal fin, striped flanks, a sweeping tail
MOB_LOOKS.reefstalker=(m,o)=>{const {x,y,s,t,f,col,dark,lite,mv}=o;shadow(x,y,s*1.2);mlLegs(o,x,s*.5,.7,Math.max(2.5,s*.2),dark);
  const sw=mv?Math.sin(t*10)*s*.12:Math.sin(t*2)*s*.05;
  ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(x-f*s*1.0,y-s*.9);ctx.quadraticCurveTo(x-f*s*1.8,y-s*1.2+sw,x-f*s*1.9,y-s*.55+sw);ctx.quadraticCurveTo(x-f*s*1.5,y-s*.7,x-f*s*.9,y-s*.6);ctx.closePath();ctx.fill();
  ctx.beginPath();ctx.ellipse(x,y-s*.8,s*1.05,s*.45,0,0,7);ctx.fill();ctx.strokeStyle=dark;ctx.lineWidth=1.5;ctx.stroke();
  ctx.fillStyle='#d8eef4';ctx.beginPath();ctx.ellipse(x+f*s*.1,y-s*.6,s*.7,s*.2,0,0,Math.PI);ctx.fill();
  ctx.strokeStyle=dark;ctx.lineWidth=1.2;for(const k of [-.4,-.1,.2])ctx.beginPath(),ctx.moveTo(x+k*s,y-s*1.15),ctx.lineTo(x+k*s-f*s*.1,y-s*.85),ctx.stroke();
  ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(x-f*s*.2,y-s*1.2);ctx.lineTo(x+f*s*.05,y-s*1.85);ctx.lineTo(x+f*s*.35,y-s*1.2);ctx.closePath();ctx.fill();ctx.strokeStyle=dark;ctx.stroke();
  ctx.fillStyle=col;ctx.beginPath();ctx.ellipse(x+f*s*1.05,y-s*.9,s*.55,s*.36,f*.15,0,7);ctx.fill();ctx.stroke();
  ctx.fillStyle='#fff';for(let i=0;i<4;i++){ctx.beginPath();ctx.moveTo(x+f*s*(1.05+i*.11),y-s*.68);ctx.lineTo(x+f*s*(1.1+i*.11),y-s*.58);ctx.lineTo(x+f*s*(1.15+i*.11),y-s*.68);ctx.fill();}
  mlEye(x+f*s*1.25,y-s*1.0,s*.09,'#ffe040');};
// Barnacle Brute: a hunched stone-and-shell giant crusted with barnacles and kelp, one huge fist
MOB_LOOKS.barnaclebrute=(m,o)=>{const {x,y,s,t,f,col,dark,lite,mv}=o;shadow(x,y,s*1.25);const b=Math.sin(t*(mv?7:1.5))*s*.04;
  ctx.fillStyle=dark;for(const k of [-1,1]){ctx.beginPath();ctx.roundRect(x+k*s*.45-s*.2,y-s*.6,s*.4,s*.6,s*.1);ctx.fill();}
  ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(x-s*1.0,y-s*.55);ctx.quadraticCurveTo(x-s*1.15,y-s*2.0+b,x+s*.1,y-s*2.15+b);ctx.quadraticCurveTo(x+s*1.2,y-s*1.9+b,x+s*1.0,y-s*.55);ctx.closePath();ctx.fill();ctx.strokeStyle=mlShade('#6a7a7a',-50);ctx.lineWidth=1.8;ctx.stroke();
  for(const [a,b2,r] of [[-.6,-1.5,.18],[-.2,-1.85,.14],[.35,-1.6,.2],[.65,-1.1,.15],[-.55,-.95,.13],[.1,-1.2,.12]]){ctx.fillStyle='#d8d4c8';ctx.beginPath();ctx.arc(x+a*s,y+b2*s+b,s*r,0,7);ctx.fill();ctx.strokeStyle=dark;ctx.lineWidth=1;ctx.stroke();ctx.fillStyle='#5a5652';ctx.beginPath();ctx.arc(x+a*s,y+b2*s+b,s*r*.4,0,7);ctx.fill();}
  ctx.save();ctx.translate(x+f*s*1.05,y-s*1.4+b);ctx.rotate(f*(mv?Math.sin(t*7)*.3:.1));ctx.fillStyle=col;ctx.beginPath();ctx.roundRect(-s*.22,0,s*.44,s*.8,s*.1);ctx.fill();ctx.stroke();ctx.beginPath();ctx.arc(0,s*.95,s*.42,0,7);ctx.fill();ctx.stroke();ctx.restore();
  ctx.strokeStyle='#3a7a4a';ctx.lineWidth=2;for(const k of [-.8,.0]){ctx.beginPath();ctx.moveTo(x+k*s,y-s*1.9+b);ctx.quadraticCurveTo(x+k*s-s*.2,y-s*1.4,x+k*s+Math.sin(t*2+k)*s*.12,y-s*.9);ctx.stroke();}
  for(const k of [-.2,.2])mlEye(x+k*s+f*s*.25,y-s*1.75+b,s*.1,'#9ff0ff','#6ae0ff');};
// Kraken Matron: a great purple kraken risen from the tide, a crown of coral, eight writhing tentacles, glowing eyes
MOB_LOOKS.krakenmatron=(m,o)=>{const {x,y,s,t,f,col,dark,lite,mv}=o;shadow(x,y,s*1.4);
  for(let i=0;i<8;i++){const a=Math.PI*(.05+i*.9/7),bx=x+Math.cos(a)*s*.7*(i%2?1:-1)*(i<4?1:.6),w=Math.sin(t*2.2+i)*s*.35;ctx.strokeStyle=i%2?col:mlShade('#7a3a8a',-25);ctx.lineWidth=s*.22;ctx.lineCap='round';
    const dir=i<4?-1:1,ex=x+dir*s*(1.1+(i%4)*.25),ey=y-s*.1;ctx.beginPath();ctx.moveTo(x+dir*s*.3,y-s*.9);ctx.quadraticCurveTo(x+dir*s*.9+w,y-s*1.6,ex,ey);ctx.stroke();
    ctx.fillStyle='#e8c0f0';ctx.beginPath();ctx.arc(ex,ey,s*.08,0,7);ctx.fill();void bx;}
  const pulse=Math.sin(t*1.5)*s*.04;ctx.fillStyle=col;ctx.beginPath();ctx.ellipse(x,y-s*1.4,s*.95+pulse,s*1.05+pulse,0,0,7);ctx.fill();ctx.strokeStyle=dark;ctx.lineWidth=2;ctx.stroke();
  ctx.fillStyle=lite;for(const [a,b,r] of [[-.4,-1.9,.16],[.35,-1.75,.12],[-.1,-1.55,.1],[.5,-1.2,.13],[-.6,-1.1,.1]]){ctx.beginPath();ctx.arc(x+a*s,y+b*s,s*r,0,7);ctx.fill();}
  ctx.fillStyle='#ff7a8a';for(let k=-2;k<=2;k++){ctx.beginPath();ctx.moveTo(x+k*s*.25-s*.08,y-s*2.35);ctx.lineTo(x+k*s*.25,y-s*(2.75-Math.abs(k)*.12));ctx.lineTo(x+k*s*.25+s*.08,y-s*2.35);ctx.closePath();ctx.fill();}
  for(const k of [-.3,.3])mlEye(x+k*s+f*s*.1,y-s*1.25,s*.16,'#ffe060','#ffd040');};}
// ---- palm trees on the Coast ----
{const _sp=sprite;sprite=function(theme,kind,v){if(theme!=='coast'||kind!=='tree')return _sp.apply(this,arguments);const key='coastpalm'+v;if(SPR[key])return SPR[key];
  const c=document.createElement('canvas');c.width=90;c.height=120;const g=c.getContext('2d'),ax=45,ay=110,lean=(v-1)*6;
  g.fillStyle='rgba(0,0,0,.24)';g.beginPath();g.ellipse(ax,ay,20,7,0,0,7);g.fill();
  // a curved, ringed trunk
  for(let i=0;i<9;i++){const tt=i/9,x=ax+lean*tt*tt*3,y=ay-tt*78;g.fillStyle=i%2?'#a8784a':'#8a603a';g.beginPath();g.ellipse(x,y,5.5-tt*1.5,5,0,0,7);g.fill();}
  const tx=ax+lean*3,ty=ay-82;
  // fronds
  for(let k=0;k<7;k++){const a=-Math.PI/2+(k-3)*.5,len=30+((k*7+v)%3)*4;g.strokeStyle=k%2?'#3f8a4a':'#5aa85a';g.lineWidth=5;g.lineCap='round';g.beginPath();g.moveTo(tx,ty);
    g.quadraticCurveTo(tx+Math.cos(a)*len*.6,ty+Math.sin(a)*len*.6-8,tx+Math.cos(a)*len,ty+Math.sin(a)*len*.5+12);g.stroke();
    g.strokeStyle='rgba(20,60,30,.5)';g.lineWidth=1;g.beginPath();g.moveTo(tx,ty);g.quadraticCurveTo(tx+Math.cos(a)*len*.6,ty+Math.sin(a)*len*.6-8,tx+Math.cos(a)*len,ty+Math.sin(a)*len*.5+12);g.stroke();}
  g.fillStyle='#6a4a2a';for(const [dx,dy] of [[-4,4],[3,5],[0,8]]){g.beginPath();g.arc(tx+dx,ty+dy,3.4,0,7);g.fill();}
  return SPR[key]={c,ax,ay};};}
// ---- atmosphere: sea spray in the air, waves and gulls, weather, sand underfoot ----
if(typeof AMB!=='undefined')AMB.coast={n:28,col:'rgba(220,245,255,.85)'};
if(typeof BEDS!=='undefined')BEDS.coast=[.028,600];
if(typeof SPOTS!=='undefined'&&typeof chirp==='function')SPOTS.coast=[()=>chirp(),5,10];
if(typeof WEATHERS!=='undefined')WEATHERS.coast=[['clear',4],['rain',1],['fog',1]];
{const _ga=groundAt;groundAt=function(x,y){const r=_ga.apply(this,arguments);try{if(Z&&Z.D.theme==='coast'&&r!=='stone')return 'sand';}catch(e){}return r;};}
// ---- the Coast's own song: a bright sea shanty in D major ----
if(typeof SONGS!=='undefined'){Object.assign(SONGS,{
  coast:{bpm:116,spb:6,lead:'triangle',lp:3200,lv:1,chords:'D A Bm G D G A D',drums:{k:[0,3],h:[1,2,4,5]},
    mel:'A4 . D5 . F#5 . | A5 . F#5 . D5 . | E5 . C#5 . A4 . | D5 . . . - . | B4 . D5 . G5 . | F#5 . E5 . D5 . | E5 . F#5 . G5 E5 | D5 . . . - -'}});
  for(const id of ['coast']){const s=SONGS[id];const toks=s.mel.replace(/\|/g,' ').trim().split(/\s+/);s.len=toks.length;s.ch=s.chords.split(' ').map(chordNotes);
    s.notes=toks.map((t,i)=>{const n=noteNum(t);if(n===null)return null;let len=1;while(toks[i+len]==='.')len++;return {n,len};});}}
// ---- the album page, the world map road, the Waystation card ----
if(typeof ALBUM!=='undefined'&&!ALBUM.some(p=>p.id==='coast'))ALBUM.push({id:'coast',name:'Saltspray Coast',zones:['coast'],b:{maxsp:80,flee:6}});
if(typeof WORLD_ROAD!=='undefined'&&!WORLD_ROAD.includes('coast'))WORLD_ROAD.push('coast');
if(typeof TC_BAN!=='undefined'){const _tb=tcBanner;tcBanner=function(id){if(ZONES[id]&&ZONES[id].theme==='coast'&&!TC_BAN[id]){const c=document.createElement('canvas');c.width=240;c.height=56;const g=c.getContext('2d');
  const sk=g.createLinearGradient(0,0,0,56);sk.addColorStop(0,'#8fd4f4');sk.addColorStop(1,'#e0f4ff');g.fillStyle=sk;g.fillRect(0,0,240,56);
  g.fillStyle='#3aa8c8';g.fillRect(0,30,240,14);g.fillStyle='rgba(255,255,255,.6)';for(let i=0;i<8;i++)g.fillRect(i*32+6,34+(i%2)*4,14,2);
  g.fillStyle='#ead8aa';g.beginPath();g.moveTo(0,44);g.quadraticCurveTo(120,38,240,46);g.lineTo(240,56);g.lineTo(0,56);g.fill();
  for(const px of [40,180]){g.strokeStyle='#8a603a';g.lineWidth=3;g.beginPath();g.moveTo(px,50);g.quadraticCurveTo(px+4,34,px+10,22);g.stroke();
    g.strokeStyle='#3f8a4a';g.lineWidth=3;for(let k=0;k<5;k++){const a=-Math.PI/2+(k-2)*.6;g.beginPath();g.moveTo(px+10,22);g.quadraticCurveTo(px+10+Math.cos(a)*10,22+Math.sin(a)*10-3,px+10+Math.cos(a)*16,22+Math.sin(a)*6+6);g.stroke();}}
  TC_BAN[id]=c.toDataURL();}return _tb.apply(this,arguments);};}
