"use strict";
/* ================= Aurelmark's own buildings (v1.35.0) =================
   Like townbldg.js does for Hearthvale: pieces of the capital that have a design of their own. Bodies are drawn once into
   the building cache; moving parts (water, flames, banners) are drawn live on top. Uses townbldg.js's helpers. */
const cbRing=(cx,cy,r,h,a0=0,a1=Math.PI*2,n=36)=>{const out=[];for(let i=0;i<=n;i++){const a=a0+(a1-a0)*i/n;out.push(TB_P(cx+Math.cos(a)*r,cy+Math.sin(a)*r,h));}return out;};
// a round drum: the side facing the camera (from the right-most point round the front to the left-most) and the top
function cbCyl(cx,cy,r,h0,h1,side,top,line){poly([...cbRing(cx,cy,r,h1,-Math.PI/4,Math.PI*.75),...cbRing(cx,cy,r,h0,Math.PI*.75,-Math.PI/4)],side,line||TB_OL);
  if(top)poly(cbRing(cx,cy,r,h1),top,line||TB_OL);}

/* ---------------- the great fountain ---------------- */
// a wide round basin on a paved ring, a tiered column with two bowls, and a golden crown on top; the water is live
const cbFountGeo=b=>{const X0=b.x*TILE,Y0=b.y*TILE,X1=(b.x+b.w)*TILE,Y1=(b.y+b.h)*TILE;return{cx:(X0+X1)/2,cy:(Y0+Y1)/2,R:56,mid:{r:26,h:44},top:{r:14,h:74}};};
function cbFount(b){const G=cbFountGeo(b),{cx,cy,R}=G,st='#e2dacb',stS='#bdb3a0',stT='#f0eadc',gold='#e8c25a';
  // the paving under it: a ring of pale flagstones with a darker border
  poly(cbRing(cx,cy,R+12,0),'#cfc7b6','#8a8272');ctx.globalAlpha=.35;for(let k=0;k<16;k++){const a=k*Math.PI/8;tbSeg(TB_P(cx+Math.cos(a)*R,cy+Math.sin(a)*R),TB_P(cx+Math.cos(a)*(R+12),cy+Math.sin(a)*(R+12)),'#6a6252',1);}ctx.globalAlpha=1;
  // the basin: an outer wall with a broad rim, water inside
  cbCyl(cx,cy,R,0,18,stS,stT);poly(cbRing(cx,cy,R-7,18),'#3f7fae','#6a6252');
  // carved panels round the front of the basin wall
  for(let k=0;k<6;k++){const a=-Math.PI/4+(k+.5)*Math.PI/6,p=TB_P(cx+Math.cos(a)*R,cy+Math.sin(a)*R,9);ctx.fillStyle='rgba(120,110,95,.45)';ctx.fillRect(p.x-4,p.y-4,8,8);}
  // the column, the middle bowl, the upper stem and the top bowl
  cbCyl(cx,cy,9,16,G.mid.h-6,st,null);for(const h of [24,32])poly(cbRing(cx,cy,10,h,-Math.PI/4,Math.PI*.75),null,'rgba(90,80,70,.5)');
  cbCyl(cx,cy,G.mid.r,G.mid.h-6,G.mid.h,stS,stT);poly(cbRing(cx,cy,G.mid.r-4,G.mid.h),'#4a8cba');
  cbCyl(cx,cy,6,G.mid.h,G.top.h-4,st,null);
  cbCyl(cx,cy,G.top.r,G.top.h-4,G.top.h,stS,stT);poly(cbRing(cx,cy,G.top.r-3,G.top.h),'#5a9cc8');
  // the crown of Aurelmark on top
  {const p=TB_P(cx,cy,G.top.h+4),c=ctx;c.fillStyle=gold;c.strokeStyle='#8a6a1a';c.lineWidth=1.2;
    c.beginPath();c.moveTo(p.x-9,p.y);c.lineTo(p.x-10,p.y-12);c.lineTo(p.x-5,p.y-6);c.lineTo(p.x,p.y-15);c.lineTo(p.x+5,p.y-6);c.lineTo(p.x+10,p.y-12);c.lineTo(p.x+9,p.y);c.closePath();c.fill();c.stroke();
    c.fillRect(p.x-9,p.y-1,18,4);c.strokeRect(p.x-9,p.y-1,18,4);c.fillStyle='#c8283a';c.beginPath();c.arc(p.x,p.y+1,1.6,0,7);c.fill();
    for(const dx of [-10,0,10]){c.fillStyle='#fff3c0';c.beginPath();c.arc(p.x+dx,p.y-(dx?12:15),1.6,0,7);c.fill();}}
}
function cbFountLive(b){const G=cbFountGeo(b),{cx,cy,R}=G,c=ctx,t=now;c.save();
  // ripples on the basin
  for(let k=0;k<3;k++){const ph=(t*.35+k/3)%1,r=G.mid.r+4+ph*(R-G.mid.r-12);c.globalAlpha=(1-ph)*.5;poly(cbRing(cx,cy,r,18,0,Math.PI*2,28),null,'#d8f0ff');}
  c.globalAlpha=1;
  // curtains of water from the top bowl into the middle one, and from the middle bowl into the basin
  c.lineCap='round';
  for(const [from,to,h0,h1,n,w] of [[G.top.r,G.mid.r-6,G.top.h,G.mid.h,8,1.6],[G.mid.r,R-16,G.mid.h,18,12,2]])
    for(let k=0;k<n;k++){const a=k*Math.PI*2/n+.2;if(Math.sin(a+Math.PI/4)<-.35)continue; // only the jets on the near side show
      const s=TB_P(cx+Math.cos(a)*from,cy+Math.sin(a)*from,h0),e=TB_P(cx+Math.cos(a)*to,cy+Math.sin(a)*to,h1),m={x:(s.x*.4+e.x*.6),y:Math.min(s.y,e.y)-6};
      c.strokeStyle='rgba(215,240,255,.75)';c.lineWidth=w;c.beginPath();c.moveTo(s.x,s.y);c.quadraticCurveTo(m.x,m.y,e.x,e.y);c.stroke();
      const ph=(t*1.6+k*.37)%1,q=1-ph;c.fillStyle='rgba(255,255,255,.9)';c.beginPath();c.arc(q*q*s.x+2*q*ph*m.x+ph*ph*e.x,q*q*s.y+2*q*ph*m.y+ph*ph*e.y,1.4,0,7);c.fill();}
  // the jet out of the crown
  {const p=TB_P(cx,cy,G.top.h+20);for(let k=0;k<4;k++){const a=k*Math.PI/2+t*.6,dx=Math.cos(a)*10,dy=Math.sin(a)*4;c.strokeStyle='rgba(225,245,255,.8)';c.lineWidth=1.4;
    c.beginPath();c.moveTo(p.x,p.y);c.quadraticCurveTo(p.x+dx*.6,p.y-10,p.x+dx,p.y+18+dy);c.stroke();}}
  // a glint on the crown now and then
  {const ph=(t*.5)%3;if(ph<.4){const p=TB_P(cx,cy,G.top.h+14);c.globalAlpha=1-ph/.4;c.strokeStyle='#fff8d0';c.lineWidth=1.4;c.beginPath();c.moveTo(p.x-6,p.y);c.lineTo(p.x+6,p.y);c.moveTo(p.x,p.y-6);c.lineTo(p.x,p.y+6);c.stroke();}}
  c.restore();}
const cbFountLights=b=>{const G=cbFountGeo(b);return tbLit([[G.cx,G.cy,G.top.h+10]]);};

const CAP_BLD={fountain:{body:cbFount,live:cbFountLive,lights:cbFountLights}};
// take over the drawing of the capital's pieces that have a design of their own
{const _prev=drawBuilding;
  drawBuilding=function(b){const T=typeof zoneId!=='undefined'&&zoneId==='capital'&&CAP_BLD[b.kind||(b.npc&&b.npc.role)];if(!T)return _prev.apply(this,arguments);
    if(T.lights&&!b._cbl){b._nl=T.lights(b);b._cbl=1;}
    if(!bldCacheBlit(b,()=>T.body(b)))T.body(b);
    if(T.live)try{T.live(b);}catch(e){}
    if(b.name)try{const sa=T.signAt?T.signAt(b):[b,T.sign||54];drawSign(sa[0],sa[1]);}catch(e){}};}
