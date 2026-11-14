"use strict";
/* ================= every job looks different =================
   Each advanced and master job has its own signature look on top of its base job's outfit, readable from afar:
   a head piece (shown when no hat is worn; halos always), something on the back (tower shield, cape, banner, clock
   ring, wings, lotus) and something alive beside it (a falcon on the shoulder, orbiting runes, a void orb, storm
   sparks, prayer beads). Master jobs add wings or a long cape and a coloured aura at their feet.
   Other players' names show their job too. All drawn here, in code; crowds reuse the cached pictures (js/perfplayers.js). */
const OL2='#2a1c14';
// head pieces: drawn like hats (around the head centre x,hy, scaled 1.35 by the caller)
const JHEAD={
  helm(x,hy,f,o){ctx.fillStyle=o.c;ctx.strokeStyle=OL2;ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(x,hy-3,12.5,Math.PI,0);ctx.lineTo(x+12.5,hy-1);ctx.lineTo(x-12.5,hy-1);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.fillStyle=o.t||'#d8dde6';ctx.fillRect(x-12.5,hy-4,25,3);ctx.strokeRect(x-12.5,hy-4,25,3);
    if(o.visor){ctx.strokeStyle='#1a1410';ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(x+f*1,hy-8);ctx.lineTo(x+f*10,hy-8);ctx.stroke();}
    if(o.horns){ctx.fillStyle=o.horns;ctx.strokeStyle=OL2;ctx.lineWidth=1.1;for(const k of [-1,1]){ctx.beginPath();ctx.moveTo(x+k*9,hy-9);ctx.quadraticCurveTo(x+k*20,hy-13,x+k*17,hy-26);ctx.quadraticCurveTo(x+k*15,hy-15,x+k*5,hy-13);ctx.closePath();ctx.fill();ctx.stroke();}}
    if(o.crest){ctx.fillStyle=o.crest;ctx.strokeStyle=OL2;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x-f*2,hy-15);ctx.quadraticCurveTo(x-f*14,hy-26,x-f*18,hy-12);ctx.quadraticCurveTo(x-f*10,hy-18,x+f*3,hy-14);ctx.closePath();ctx.fill();ctx.stroke();}
    if(o.rune){ctx.fillStyle=o.rune;ctx.beginPath();ctx.moveTo(x+f*2,hy-13);ctx.lineTo(x+f*5,hy-9.5);ctx.lineTo(x+f*2,hy-6);ctx.lineTo(x-f*1,hy-9.5);ctx.closePath();ctx.fill();ctx.globalAlpha=.35+.25*Math.sin(now*4);ctx.beginPath();ctx.arc(x+f*2,hy-9.5,6,0,7);ctx.fill();ctx.globalAlpha=1;}},
  wizard(x,hy,f,o){const tip=o.tall?38:30;ctx.fillStyle=o.c;ctx.strokeStyle=OL2;ctx.lineWidth=1.2;ctx.beginPath();ctx.ellipse(x,hy-8,15,4,0,0,7);ctx.fill();ctx.stroke();
    ctx.beginPath();ctx.moveTo(x-10,hy-9);ctx.quadraticCurveTo(x-2,hy-20,x-f*8,hy-tip);ctx.quadraticCurveTo(x+4,hy-18,x+10,hy-9);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.fillStyle=o.t;ctx.fillRect(x-9.5,hy-12,19,3);if(o.star){ctx.fillStyle=o.star;ctx.beginPath();ctx.arc(x-f*8,hy-tip,2.6,0,7);ctx.fill();}},
  hood(x,hy,f,o){ctx.fillStyle=o.c;ctx.strokeStyle=OL2;ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(x,hy-2,14,Math.PI*1.02,-.02);ctx.lineTo(x+14,hy+4);ctx.quadraticCurveTo(x+f*6,hy-4,x+f*-2,hy-8);ctx.quadraticCurveTo(x-f*10,hy-2,x-14,hy+4);ctx.closePath();ctx.fill();ctx.stroke();
    if(o.ears){ctx.fillStyle=o.c;for(const k of [-1,1]){ctx.beginPath();ctx.moveTo(x+k*5,hy-14);ctx.lineTo(x+k*11,hy-25);ctx.lineTo(x+k*13,hy-11);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle=o.ears;ctx.beginPath();ctx.moveTo(x+k*8,hy-14);ctx.lineTo(x+k*11,hy-21);ctx.lineTo(x+k*11.5,hy-13);ctx.closePath();ctx.fill();ctx.fillStyle=o.c;}}
    if(o.gem){ctx.fillStyle=o.gem;ctx.beginPath();ctx.arc(x+f*1,hy-12,2,0,7);ctx.fill();}},
  cap(x,hy,f,o){ctx.fillStyle=o.c;ctx.strokeStyle=OL2;ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(x,hy-6,11.5,Math.PI,0);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.beginPath();ctx.ellipse(x+f*7,hy-6,9,2.5,0,0,7);ctx.fill();ctx.stroke();
    if(o.feather){ctx.strokeStyle=o.feather;ctx.fillStyle=o.feather;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x-f*6,hy-12);ctx.quadraticCurveTo(x-f*18,hy-24,x-f*12,hy-30);ctx.quadraticCurveTo(x-f*12,hy-20,x-f*3,hy-13);ctx.closePath();ctx.fill();}},
  circlet(x,hy,f,o){ctx.strokeStyle=o.c;ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(x,hy-9,12,3.2,0,0,Math.PI*2);ctx.stroke();ctx.fillStyle=o.gem;ctx.strokeStyle=OL2;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x+f*1,hy-15);ctx.lineTo(x+f*4,hy-11);ctx.lineTo(x+f*1,hy-7);ctx.lineTo(x-f*2,hy-11);ctx.closePath();ctx.fill();ctx.stroke();},
  hourglass(x,hy,f,o){ctx.fillStyle=o.c;ctx.strokeStyle=OL2;ctx.lineWidth=1.1;ctx.beginPath();ctx.ellipse(x,hy-9,12,3.4,0,0,7);ctx.fill();ctx.stroke();
    const cx=x+f*1,t=hy-26;ctx.beginPath();ctx.moveTo(cx-5,t);ctx.lineTo(cx+5,t);ctx.lineTo(cx,t+7);ctx.lineTo(cx+5,t+14);ctx.lineTo(cx-5,t+14);ctx.lineTo(cx,t+7);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.fillStyle=o.sand;const s=(now*.25)%1;ctx.beginPath();ctx.moveTo(cx-4*(1-s),t+1);ctx.lineTo(cx+4*(1-s),t+1);ctx.lineTo(cx,t+6.5);ctx.closePath();ctx.fill();ctx.beginPath();ctx.moveTo(cx,t+8);ctx.lineTo(cx+4*s,t+13);ctx.lineTo(cx-4*s,t+13);ctx.closePath();ctx.fill();},
  mitre(x,hy,f,o){ctx.fillStyle=o.c;ctx.strokeStyle=OL2;ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(x-9,hy-8);ctx.quadraticCurveTo(x-10,hy-24,x,hy-30);ctx.quadraticCurveTo(x+10,hy-24,x+9,hy-8);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.fillStyle=o.t;ctx.fillRect(x-1.3,hy-26,2.6,16);ctx.fillRect(x-5,hy-21,10,2.6);ctx.fillRect(x-9,hy-10,18,2.5);},
  band(x,hy,f,o){ctx.fillStyle=o.c;ctx.strokeStyle=OL2;ctx.lineWidth=1;ctx.beginPath();ctx.roundRect(x-12,hy-11,24,4,2);ctx.fill();ctx.stroke();
    const w=Math.sin(now*6)*2;for(const k of [0,1]){ctx.beginPath();ctx.moveTo(x-f*11,hy-10);ctx.quadraticCurveTo(x-f*(18+k*3),hy-8+w+k*3,x-f*(22+k*2),hy-2+w+k*4);ctx.lineTo(x-f*(20+k*2),hy+w+k*4);ctx.quadraticCurveTo(x-f*(16+k*3),hy-6+k*3,x-f*11,hy-8);ctx.closePath();ctx.fill();ctx.stroke();}
    if(o.gem){ctx.fillStyle=o.gem;ctx.beginPath();ctx.arc(x+f*2,hy-9,1.8,0,7);ctx.fill();}}
};
// back pieces (behind the body facing forward, over it from behind); x,by,f; y = feet
const JBACK={
  shield(x,y,by,f,o){ctx.fillStyle=o.c;ctx.strokeStyle=OL2;ctx.lineWidth=1.5;ctx.beginPath();ctx.roundRect(x-f*12-10,by-24,20,30,[4,4,10,10]);ctx.fill();ctx.stroke();ctx.fillStyle=o.t;ctx.beginPath();ctx.roundRect(x-f*12-3,by-20,6,22,2);ctx.fill();},
  cape(x,y,by,f,o){const s=Math.sin(now*3)*1.5,L=o.long?3:-4;ctx.fillStyle=o.c;ctx.strokeStyle=OL2;ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(x-9,by-13);ctx.lineTo(x+9,by-13);ctx.lineTo(x+17+s,y+L);ctx.lineTo(x+5,y+L-3);ctx.lineTo(x-5,y+L);ctx.lineTo(x-17-s,y+L-2);ctx.closePath();ctx.fill();ctx.stroke();
    if(o.t){ctx.strokeStyle=o.t;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x-16-s,y+L-4);ctx.lineTo(x-5,y+L-2);ctx.lineTo(x+5,y+L-5);ctx.lineTo(x+16+s,y+L-2);ctx.stroke();}},
  banner(x,y,by,f,o){const px=x-f*9;ctx.strokeStyle='#6a4a2a';ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(px,by+4);ctx.lineTo(px,by-46);ctx.stroke();const w=Math.sin(now*2.5)*2;
    ctx.fillStyle=o.c;ctx.strokeStyle=OL2;ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(px,by-45);ctx.lineTo(px-f*15,by-43+w);ctx.lineTo(px-f*13,by-35+w);ctx.lineTo(px-f*15,by-27+w);ctx.lineTo(px,by-29);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.fillStyle=o.t;ctx.beginPath();ctx.arc(px-f*7,by-37+w*.6,2.6,0,7);ctx.fill();ctx.fillStyle='#e8c25a';ctx.beginPath();ctx.arc(px,by-47,2.2,0,7);ctx.fill();},
  clock(x,y,by,f,o){const cx=x,cy=by-14,r=o.big?21:17;ctx.strokeStyle=o.c;ctx.lineWidth=2.4;ctx.globalAlpha=.85;ctx.beginPath();ctx.arc(cx,cy,r,0,7);ctx.stroke();ctx.lineWidth=1.4;
    for(let i=0;i<12;i++){const a=i*Math.PI/6;ctx.beginPath();ctx.moveTo(cx+Math.cos(a)*(r-3),cy+Math.sin(a)*(r-3));ctx.lineTo(cx+Math.cos(a)*(r+1),cy+Math.sin(a)*(r+1));ctx.stroke();}
    const h=now*.8;ctx.strokeStyle=o.t;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx+Math.cos(h)*(r-5),cy+Math.sin(h)*(r-5));ctx.stroke();ctx.globalAlpha=1;},
  wings(x,y,by,f,o){const fl=Math.sin(now*3)*.12;ctx.fillStyle=o.c;ctx.strokeStyle=OL2;ctx.lineWidth=1.2;
    for(const k of [-1,1]){ctx.save();ctx.translate(x+k*4,by-14);ctx.rotate(k*(-.25-fl));ctx.beginPath();ctx.moveTo(0,0);ctx.quadraticCurveTo(k*14,-20,k*30,-22);ctx.quadraticCurveTo(k*24,-12,k*28,-6);ctx.quadraticCurveTo(k*20,-4,k*24,4);ctx.quadraticCurveTo(k*12,2,k*14,10);ctx.quadraticCurveTo(k*6,4,0,4);ctx.closePath();ctx.fill();ctx.stroke();
      if(o.t){ctx.strokeStyle=o.t;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(k*4,-2);ctx.quadraticCurveTo(k*14,-14,k*26,-18);ctx.stroke();ctx.strokeStyle=OL2;ctx.lineWidth=1.2;}ctx.restore();}},
  lotus(x,y,by,f,o){const cx=x,cy=by-26;ctx.fillStyle=o.c;ctx.strokeStyle=OL2;ctx.lineWidth=1;ctx.globalAlpha=.9;
    for(let i=0;i<7;i++){const a=Math.PI+i*Math.PI/6;ctx.save();ctx.translate(cx,cy);ctx.rotate(a+Math.PI/2);ctx.beginPath();ctx.ellipse(0,-14,4.5,10,0,0,7);ctx.fill();ctx.stroke();ctx.restore();}ctx.globalAlpha=1;},
  quiver(x,y,by,f,o){ctx.save();ctx.translate(x+f*7,by-10);ctx.rotate(-f*.5);ctx.fillStyle=o.c;ctx.strokeStyle=OL2;ctx.lineWidth=1.4;ctx.beginPath();ctx.roundRect(-4,-16,8,20,2);ctx.fill();ctx.stroke();
    ctx.fillStyle=o.t;for(const k of [-2,0,2]){ctx.beginPath();ctx.moveTo(k,-16);ctx.lineTo(k-2,-22);ctx.lineTo(k+2,-22);ctx.closePath();ctx.fill();}ctx.restore();}
};
// things beside the body (drawn last)
const JSIDE={
  falcon(x,y,by,f,o){const sx=x-f*10,sy=by-17,fl=Math.sin(now*5)*1.5;ctx.fillStyle=o.c;ctx.strokeStyle=OL2;ctx.lineWidth=1.2;
    ctx.beginPath();ctx.ellipse(sx,sy-4,5,6.5,-f*.2,0,7);ctx.fill();ctx.stroke();ctx.fillStyle=o.t;ctx.beginPath();ctx.ellipse(sx+f*1,sy-2,3,4,0,0,7);ctx.fill();
    ctx.fillStyle=o.c;ctx.beginPath();ctx.arc(sx+f*2,sy-12,4,0,7);ctx.fill();ctx.stroke();ctx.fillStyle='#f0c040';ctx.beginPath();ctx.moveTo(sx+f*5.5,sy-13);ctx.lineTo(sx+f*9,sy-11);ctx.lineTo(sx+f*5.5,sy-10);ctx.closePath();ctx.fill();
    ctx.fillStyle='#1a1410';ctx.beginPath();ctx.arc(sx+f*3.5,sy-13,1,0,7);ctx.fill();ctx.fillStyle=o.c;ctx.beginPath();ctx.moveTo(sx-f*3,sy-6);ctx.quadraticCurveTo(sx-f*12,sy-12+fl,sx-f*11,sy+1);ctx.closePath();ctx.fill();ctx.stroke();},
  runes(x,y,by,f,o){for(let i=0;i<(o.n||3);i++){const a=now*1.6+i*Math.PI*2/(o.n||3),rx=x+Math.cos(a)*18,ry=by-12+Math.sin(a)*7;ctx.globalAlpha=.4;ctx.fillStyle=o.c;ctx.beginPath();ctx.arc(rx,ry,6,0,7);ctx.fill();ctx.globalAlpha=1;
    ctx.fillStyle='#e8eef8';ctx.strokeStyle=OL2;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(rx,ry-4);ctx.lineTo(rx+3,ry);ctx.lineTo(rx,ry+4);ctx.lineTo(rx-3,ry);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle=o.c;ctx.fillRect(rx-.7,ry-2,1.4,4);}},
  orb(x,y,by,f,o){const ox=x-f*21,oy=by-24+Math.sin(now*2.2)*3,r=o.big?7:5.5;ctx.globalAlpha=.35;ctx.fillStyle=o.t;ctx.beginPath();ctx.arc(ox,oy,r+5,0,7);ctx.fill();ctx.globalAlpha=1;
    ctx.fillStyle=o.c;ctx.strokeStyle=OL2;ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(ox,oy,r,0,7);ctx.fill();ctx.stroke();ctx.fillStyle=o.t;ctx.beginPath();ctx.arc(ox-r*.3,oy-r*.3,r*.3,0,7);ctx.fill();},
  sparks(x,y,by,f,o){for(let i=0;i<2;i++){const a=now*3+i*Math.PI,sx=x+Math.cos(a)*17,sy=by-24+Math.sin(a*1.3)*6;ctx.globalAlpha=.4;ctx.fillStyle=o.c;ctx.beginPath();ctx.arc(sx,sy,5.5,0,7);ctx.fill();ctx.globalAlpha=1;
    ctx.strokeStyle='#ffffff';ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(sx-2,sy-4);ctx.lineTo(sx+1,sy-1);ctx.lineTo(sx-1,sy+1);ctx.lineTo(sx+2,sy+4);ctx.stroke();}},
  beads(x,y,by,f,o,back){if(back)return;ctx.fillStyle=o.c;ctx.strokeStyle=OL2;ctx.lineWidth=.8;for(let i=0;i<9;i++){const a=Math.PI*.15+i*Math.PI*.7/8,bx=x+Math.cos(a)*7.5,byy=by-13+Math.sin(a)*7;ctx.beginPath();ctx.arc(bx,byy,1.6,0,7);ctx.fill();ctx.stroke();}
    ctx.fillStyle=o.t;ctx.beginPath();ctx.arc(x,by-5.5,2.3,0,7);ctx.fill();ctx.stroke();},
  spikes(x,y,by,f,o){ctx.fillStyle=o.c;ctx.strokeStyle=OL2;ctx.lineWidth=1.2;for(const k of [-1,1]){ctx.beginPath();ctx.ellipse(x+k*10,by-9,5.5,4,k*.4,0,7);ctx.fill();ctx.stroke();ctx.fillStyle=o.t;for(const d of [-2.5,2.5]){ctx.beginPath();ctx.moveTo(x+k*10+d-1.6,by-12);ctx.lineTo(x+k*(12+Math.abs(d)),by-19);ctx.lineTo(x+k*10+d+1.6,by-11);ctx.closePath();ctx.fill();ctx.stroke();}ctx.fillStyle=o.c;}},
  stars(x,y,by,f,o){for(let i=0;i<4;i++){const a=now*1.1+i*1.57,sx=x+Math.cos(a)*19,sy=by-20+Math.sin(a)*9+Math.sin(now*3+i)*2;ctx.fillStyle=o.c;ctx.globalAlpha=.7+.3*Math.sin(now*5+i);
    ctx.beginPath();for(let k=0;k<8;k++){const r=k%2?1.2:3.2,an=k*Math.PI/4;ctx.lineTo(sx+Math.cos(an)*r,sy+Math.sin(an)*r);}ctx.closePath();ctx.fill();}ctx.globalAlpha=1;},
  halo(x,y,by,f,o){const hy=by-19-16+Math.sin(now*2)*1;ctx.strokeStyle=o.c;ctx.lineWidth=2.4;ctx.globalAlpha=.9;ctx.beginPath();ctx.ellipse(x,hy-10,10,3,0,0,7);ctx.stroke();ctx.globalAlpha=.3;ctx.lineWidth=5;ctx.stroke();ctx.globalAlpha=1;}
};
// the look of each job: h = head, b = back, s = beside (list), aura = master glow colour
const JOB_LOOK={
  bulwark:{h:['helm',{c:'#9aa3b0',t:'#e8c25a',visor:1}],b:[['shield',{c:'#7d8796',t:'#e8c25a'}]]},
  ravager:{h:['helm',{c:'#5a2a24',t:'#3a2a24',horns:'#e8dcc0'}],s:[['spikes',{c:'#4a2a24',t:'#d8d0c0'}]],b:[['cape',{c:'#7a1e18',t:'#2a1410'}]]},
  runeguard:{h:['helm',{c:'#5a6a8a',t:'#9fb0c8',rune:'#7fd3ff'}],s:[['runes',{c:'#7fd3ff'}]]},
  stormcaller:{h:['wizard',{c:'#2e4fa8',t:'#9fe0ff',star:'#ffffff'}],s:[['sparks',{c:'#9fe0ff'}]]},
  hexweaver:{h:['hood',{c:'#3a2456',gem:'#c58cff'}],s:[['orb',{c:'#2a1838',t:'#c58cff'}]]},
  chronomancer:{h:['hourglass',{c:'#c8a040',sand:'#fff0a0'}],b:[['clock',{c:'#e8c25a',t:'#fff0a0'}]]},
  sharpshooter:{h:['cap',{c:'#2f5a4a',feather:'#e0c070'}],b:[['cape',{c:'#2f6a5a',t:'#e0c070'}]]},
  wildstalker:{h:['hood',{c:'#6a5a3a',ears:'#d8b890'}],b:[['cape',{c:'#5a6a2a'}]]},
  falconer:{h:['cap',{c:'#6a4a2a',feather:'#f4efe2'}],s:[['falcon',{c:'#7a5a3a',t:'#f4e6c4'}]]},
  templar:{h:['helm',{c:'#d8c070',t:'#fff0a0',crest:'#c8463a'}],b:[['banner',{c:'#f4efe2',t:'#c8463a'}]]},
  oracle:{h:['circlet',{c:'#e8d8a0',gem:'#7fd3ff'}],s:[['halo',{c:'#9fe0ff'}]],b:[['cape',{c:'#e8e0c8',t:'#7fd3ff'}]]},
  ascetic:{h:['band',{c:'#e0702a'}],s:[['beads',{c:'#8a5a2a',t:'#ffb070'}]]},
  aegislord:{h:['helm',{c:'#e0c060',t:'#fff0b0',visor:1,crest:'#4a6ab8'}],b:[['wings',{c:'#e8e0c8',t:'#ffd76a'}],['shield',{c:'#c8a040',t:'#fff0b0'}]],aura:'#ffd76a'},
  warbringer:{h:['helm',{c:'#3a1410',t:'#6a2a24',horns:'#f4e6c4'}],s:[['spikes',{c:'#2a1410',t:'#ffb36a'}]],b:[['cape',{c:'#5a0e0a',t:'#ffb36a',long:1}]],aura:'#ff6a3a'},
  runelord:{h:['helm',{c:'#2e3a5a',t:'#bfefff',rune:'#bfefff',crest:'#7fd3ff'}],s:[['runes',{c:'#bfefff',n:5}]],b:[['cape',{c:'#2e3a5a',t:'#bfefff',long:1}]],aura:'#7fd3ff'},
  tempestsage:{h:['wizard',{c:'#24408e',t:'#bfefff',star:'#bfefff',tall:1}],s:[['sparks',{c:'#bfefff'}]],b:[['cape',{c:'#24408e',t:'#bfefff',long:1}]],aura:'#9fe0ff'},
  voidcaller:{h:['hood',{c:'#22122e',gem:'#e0a8ff'}],s:[['orb',{c:'#140a1c',t:'#e0a8ff',big:1}]],b:[['wings',{c:'#2e1a48',t:'#e0a8ff'}]],aura:'#b070ff'},
  timeweaver:{h:['hourglass',{c:'#e8c25a',sand:'#ffffff'}],b:[['clock',{c:'#fff0a0',t:'#ffffff',big:1}],['cape',{c:'#3a2e18',t:'#fff0a0',long:1}]],aura:'#fff0a0'},
  deadeye:{h:['cap',{c:'#1f4a40',feather:'#ffe08a'}],b:[['quiver',{c:'#3a2a1a',t:'#ffe08a'}],['cape',{c:'#1f4a40',t:'#ffe08a',long:1}]],aura:'#ffe08a'},
  beastlord:{h:['hood',{c:'#4a3a24',ears:'#e8c890'}],b:[['cape',{c:'#3e4a1c',t:'#c8f08a',long:1}]],aura:'#c8f08a'},
  skywarden:{h:['cap',{c:'#4a3018',feather:'#ffe08a'}],s:[['falcon',{c:'#e8e0d0',t:'#ffe08a'}]],b:[['wings',{c:'#8a6a4a',t:'#ffe08a'}]],aura:'#ffe08a'},
  dawnknight:{h:['helm',{c:'#e8c060',t:'#fff6c0',crest:'#fff6c0'}],s:[['halo',{c:'#fff6c0'}]],b:[['wings',{c:'#fffaf0',t:'#ffd76a'}],['banner',{c:'#fff6c0',t:'#e8a030'}]],aura:'#fff0a0'},
  starseer:{h:['circlet',{c:'#dcd4f0',gem:'#9fd8ff'}],s:[['halo',{c:'#9fd8ff'}],['stars',{c:'#e8f4ff'}]],b:[['wings',{c:'#e8f0ff',t:'#9fd8ff'}]],aura:'#9fd8ff'},
  lotussage:{h:['band',{c:'#ffb070',gem:'#ffd0a0'}],s:[['beads',{c:'#6a3a1a',t:'#ffd0a0'}]],b:[['lotus',{c:'#ffc0d0'}]],aura:'#ffd0a0'}
};
// aura at the feet of master jobs
function jobAura(x,y,col){const p=(now*.7)%1;ctx.save();ctx.globalAlpha=.32;ctx.fillStyle=col;ctx.beginPath();ctx.ellipse(x,y+1,19,7,0,0,7);ctx.fill();
  ctx.globalAlpha=.55*(1-p);ctx.strokeStyle=col;ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(x,y+1,12+p*14,4.5+p*5,0,0,7);ctx.stroke();
  for(let i=0;i<4;i++){const q=(now*.5+i*.25)%1;ctx.globalAlpha=.8*(1-q);ctx.fillStyle=col;ctx.fillRect(x-14+i*9+Math.sin(now*2+i)*2,y-q*42,2,2);}ctx.restore();}
// hooks: drawPlayerBody tells drawHuman whose job it is drawing
const JL={cur:null};
{const _dpbJ=drawPlayerBody;drawPlayerBody=function(p){const c=p&&CLASSES[p.cls];JL.cur=c&&JOB_LOOK[p.cls]?{look:JOB_LOOK[p.cls]}:null;try{return _dpbJ.apply(this,arguments);}finally{JL.cur=null;}};}
{const _dhJ=drawHuman;drawHuman=function(x,y,body,hair,face,walk,opt){const cur=JL.cur;if(!cur||cur.busy)return _dhJ.apply(this,arguments);cur.busy=true;
  opt=opt||{};const f=face<0?-1:1,bob=walk?Math.abs(Math.sin(walk*12))*1.5:0,sit=opt.sit?6:0,by=y-7-bob+sit,hy=by-19,back=!!opt.back,L=cur.look;
  try{if(L.aura)jobAura(x,y,L.aura);
    if(!back)for(const [k,o] of L.b||[])try{ctx.save();JBACK[k](x,y,by,f,o);ctx.restore();}catch(e){}
    const r=_dhJ.apply(this,arguments);
    if(back)for(const [k,o] of L.b||[])try{ctx.save();JBACK[k](x,y,by,f,o);ctx.restore();}catch(e){}
    if(L.h&&!opt.hat)try{ctx.save();ctx.translate(x,hy);ctx.scale(1.35,1.35);ctx.translate(-x,-hy);JHEAD[L.h[0]](x,hy,f,L.h[1]);ctx.restore();}catch(e){}
    for(const [k,o] of L.s||[])try{ctx.save();JSIDE[k](x,y,by,f,o,back);ctx.restore();}catch(e){}
    return r;}finally{cur.busy=false;}};}
