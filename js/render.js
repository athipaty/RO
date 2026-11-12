"use strict";
/* ================= render ================= */
const cv=$('#cv');let ctx=cv.getContext('2d');let VW=0,VH=0,DPR=1,camX=0,camY=0,clickMark=null,shakeUntil=0;
function resize(){DPR=window.LITE?1:Math.min(2,window.devicePixelRatio||1);VW=cv.clientWidth;VH=cv.clientHeight;cv.width=Math.round(VW*DPR);cv.height=Math.round(VH*DPR);}
window.addEventListener('resize',resize);
/* ---------- isometric camera: world stays a flat grid, the screen shows it at an angle ---------- */
const ISO=.78;
const proj=(x,y)=>({x:(x-y)*ISO,y:(x+y)*ISO/2});
const unproj=(sx,sy)=>{const a=sx/ISO,b=2*sy/ISO;return{x:(a+b)/2,y:(b-a)/2};};
// draw something written in world coordinates at its isometric screen spot, standing upright
function faceTo(e,dx,dy){if(Math.abs(dx-dy)>.5)e.face=sface(dx,dy);if(Math.abs(dx+dy)>.5)e.back=(dx+dy)<0;}
function at(x,y,fn){const s=proj(x,y);ctx.save();ctx.translate(s.x-x,s.y-y);fn();ctx.restore();}
const sface=(dx,dy)=>(dx-dy)<0?-1:1;
function poly(pts,fill,stroke){ctx.beginPath();ctx.moveTo(pts[0].x,pts[0].y);for(let i=1;i<pts.length;i++)ctx.lineTo(pts[i].x,pts[i].y);ctx.closePath();if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1.5;ctx.stroke();}}
const SPR={};
function sprite(theme,kind,v){const key=theme+kind+v;if(SPR[key])return SPR[key];
  const th=THEMES[theme],c=document.createElement('canvas');c.width=72;c.height=110;const g=c.getContext('2d');const ax=36,ay=100,R=seeded(7+v*13+kind.length);
  g.fillStyle='rgba(0,0,0,.26)';g.beginPath();g.ellipse(ax,ay,kind==='pillar'?18:22,8,0,0,7);g.fill();
  if(kind==='tree'){g.fillStyle='#5a3d24';g.fillRect(ax-4,ay-34,8,34);g.fillStyle='#4a3020';g.fillRect(ax,ay-34,4,34);
    const c0=th.canopy[0],c1=th.canopy[1];const blobs=[[0,-52,24],[-13,-44,15],[13,-42,15],[-6,-64,15],[8,-60,13]];
    for(const [dx,dy,r] of blobs){g.fillStyle=c0;g.beginPath();g.arc(ax+dx+(v-1)*2,ay+dy,r,0,7);g.fill();}
    for(const [dx,dy,r] of [[-8,-60,10],[6,-50,9],[-12,-46,7]]){g.fillStyle=c1;g.beginPath();g.arc(ax+dx,ay+dy,r,0,7);g.fill();}
    g.fillStyle='rgba(255,255,255,.12)';g.beginPath();g.arc(ax-10,ay-66,6,0,7);g.fill();
    g.fillStyle='rgba(0,0,0,.15)';g.beginPath();g.arc(ax+12,ay-40,12,0,7);g.fill();}
  else if(kind==='pine'){g.fillStyle='#5a3d24';g.fillRect(ax-3,ay-18,6,18);
    for(let k=0;k<4;k++){const w=26-k*5,ty=ay-14-k*15;g.fillStyle=k%2?'#2a5244':'#2f5a4a';g.beginPath();g.moveTo(ax-w,ty);g.lineTo(ax,ty-24);g.lineTo(ax+w,ty);g.fill();
      g.fillStyle='#f5f9fc';g.beginPath();g.moveTo(ax-w*.6,ty-10);g.lineTo(ax,ty-24);g.lineTo(ax+w*.6,ty-10);g.lineTo(ax+w*.2,ty-12);g.lineTo(ax-w*.2,ty-9);g.fill();}}
  else if(kind==='rock'){g.fillStyle=th.rock[1];g.beginPath();g.ellipse(ax+2,ay-12,22,15,0,0,7);g.fill();g.fillStyle=th.rock[0];g.beginPath();g.ellipse(ax-3,ay-17,17,12,-.2,0,7);g.fill();g.fillStyle='rgba(255,255,255,.15)';g.beginPath();g.ellipse(ax-8,ay-23,6,3,-.3,0,7);g.fill();}
  else if(kind==='cactus'){g.fillStyle='#4f8a46';g.beginPath();g.roundRect(ax-6,ay-52,12,52,6);g.fill();g.beginPath();g.roundRect(ax-20,ay-38,8,20,4);g.roundRect(ax-20,ay-22,16,7,3);g.roundRect(ax+12,ay-44,8,22,4);g.roundRect(ax+5,ay-27,15,7,3);g.fill();
    g.fillStyle='rgba(255,255,255,.18)';g.fillRect(ax-3,ay-48,2,44);if(v===2){g.fillStyle='#f07ca0';g.beginPath();g.arc(ax,ay-54,4,0,7);g.fill();}}
  else if(kind==='pillar'){g.fillStyle=th.rock[0];g.fillRect(ax-15,ay-10,30,10);g.fillStyle=th.rock[1];g.fillRect(ax-11,ay-74,22,66);g.fillStyle=th.rock[0];g.fillRect(ax-11,ay-74,8,66);
    g.fillStyle=th.rock[0];g.fillRect(ax-15,ay-82,30,10);g.fillStyle='rgba(255,120,40,.25)';g.fillRect(ax-11,ay-20,22,10);
    if(v===0){g.fillStyle='rgba(0,0,0,.4)';g.beginPath();g.moveTo(ax+4,ay-70);g.lineTo(ax-2,ay-50);g.lineTo(ax+3,ay-40);g.lineWidth=1.5;g.strokeStyle='rgba(0,0,0,.45)';g.stroke();}}
  SPR[key]={c,ax,ay};return SPR[key];}
function drawObj(o){
  if(o.kind==='crystal'){const p=proj(o.x,o.y),col=typeof keepColour==='function'?keepColour():'#ff9a3a',b=Math.sin(now*2)*3,r=KEEP_R*TILE;
    ctx.save();ctx.globalAlpha=.55+Math.sin(now*3)*.15;ctx.strokeStyle=col;ctx.lineWidth=3;ctx.setLineDash([10,8]);ctx.lineDashOffset=-now*20;
    ctx.beginPath();ctx.ellipse(p.x,p.y,r*ISO*1.41,r*ISO*.71,0,0,7);ctx.stroke();ctx.restore();
    ctx.save();ctx.translate(p.x,p.y);ctx.scale(1.4,1.4);ctx.translate(-p.x,-p.y);
    ctx.fillStyle='#3e3a44';ctx.beginPath();ctx.ellipse(p.x,p.y,20,9,0,0,7);ctx.fill();ctx.fillStyle='#5a5560';ctx.fillRect(p.x-14,p.y-12,28,12);ctx.beginPath();ctx.ellipse(p.x,p.y-12,14,6,0,0,7);ctx.fill();
    ctx.save();ctx.shadowColor=col;ctx.shadowBlur=24+Math.sin(now*3)*8;const y0=p.y-30+b;
    const g=ctx.createLinearGradient(p.x-12,y0-34,p.x+12,y0+20);g.addColorStop(0,'#fff8e8');g.addColorStop(.45,col);g.addColorStop(1,'#3a1a10');ctx.fillStyle=g;
    ctx.beginPath();ctx.moveTo(p.x,y0-38);ctx.lineTo(p.x+13,y0-8);ctx.lineTo(p.x+6,y0+16);ctx.lineTo(p.x-6,y0+16);ctx.lineTo(p.x-13,y0-8);ctx.closePath();ctx.fill();
    ctx.shadowBlur=0;ctx.fillStyle='rgba(255,255,255,.55)';ctx.beginPath();ctx.moveTo(p.x-2,y0-32);ctx.lineTo(p.x-9,y0-8);ctx.lineTo(p.x-3,y0-6);ctx.closePath();ctx.fill();ctx.restore();
    ctx.restore();
    const name=typeof keepLabel==='function'?keepLabel():'';if(name)label(name,p.x,p.y-100+b,col,13);
    return;}
  if(o.kind==='fountain'){const p=proj(o.x,o.y);
    ctx.fillStyle='#cfc6b4';ctx.fillRect(p.x-8,p.y-40,16,40);ctx.fillStyle='#e8e0d0';ctx.beginPath();ctx.ellipse(p.x,p.y-40,16,6,0,0,7);ctx.fill();
    ctx.fillStyle='#bfe0f0';ctx.beginPath();ctx.ellipse(p.x,p.y-41,11,4,0,0,7);ctx.fill();
    ctx.strokeStyle='rgba(220,240,255,.85)';ctx.lineWidth=2;for(let k=0;k<4;k++){const a=k*Math.PI/2+now*.6,dx=Math.cos(a)*20,dy=Math.sin(a)*9;ctx.beginPath();ctx.moveTo(p.x,p.y-46);ctx.quadraticCurveTo(p.x+dx*.5,p.y-66,p.x+dx,p.y-20+dy);ctx.stroke();}
    return;}
  const sp=sprite(Z.D.theme,o.kind,o.v),p=proj(o.x,o.y),w=sp.c.width*o.sc,h=sp.c.height*o.sc;
  ctx.drawImage(sp.c,p.x-sp.ax*o.sc,p.y-sp.ay*o.sc,w,h);}
function drawBuilding(b){
  const X0=b.x*TILE,Y0=b.y*TILE,X1=(b.x+b.w)*TILE,Y1=(b.y+b.h)*TILE,H=60,RH=52,e=12,Xc=(X0+X1)/2,Yc=(Y0+Y1)/2;
  const P2=(x,y,h=0)=>{const p=proj(x,y);return{x:p.x,y:p.y-h};};
  poly([P2(X0,Y1),P2(X1+30,Y1),P2(X1+30,Y0+30),P2(X1,Y0)],'rgba(0,0,0,.22)');
  // walls: the two faces that look toward the camera
  poly([P2(X0,Y1),P2(X1,Y1),P2(X1,Y1,H),P2(X0,Y1,H)],'#ddd0b2','#6b5640');
  poly([P2(X1,Y1),P2(X1,Y0),P2(X1,Y0,H),P2(X1,Y1,H)],'#b8a684','#6b5640');
  // timber beams
  ctx.strokeStyle='#7a6248';ctx.lineWidth=2;for(const t of [.33,.66]){const a=P2(X0+(X1-X0)*t,Y1),b2=P2(X0+(X1-X0)*t,Y1,H);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b2.x,b2.y);ctx.stroke();}
  // door + windows
  poly([P2(Xc-14,Y1),P2(Xc+14,Y1),P2(Xc+14,Y1,36),P2(Xc-14,Y1,36)],'#5a3d24','#3a2716');
  for(const wx of [X0+30,X1-56])poly([P2(wx,Y1,22),P2(wx+26,Y1,22),P2(wx+26,Y1,40),P2(wx,Y1,40)],'#8fc0e0','#5a4632');
  for(const wy of [Y0+30,Y1-56])poly([P2(X1,wy+26,22),P2(X1,wy,22),P2(X1,wy,40),P2(X1,wy+26,40)],'#7aa8c8','#5a4632');
  // hip roof
  const alongX=(X1-X0)>=(Y1-Y0),hh=alongX?(Y1-Y0)/2:(X1-X0)/2;
  const r1=alongX?P2(X0+hh,Yc,H+RH):P2(Xc,Y0+hh,H+RH),r2=alongX?P2(X1-hh,Yc,H+RH):P2(Xc,Y1-hh,H+RH);
  const eT=P2(X0-e,Y0-e,H),eR=P2(X1+e,Y0-e,H),eB=P2(X1+e,Y1+e,H),eL=P2(X0-e,Y1+e,H);
  const rc=b.roof;
  if(alongX){poly([eT,eR,r2,r1],shade(rc,-40));poly([eL,eT,r1],shade(rc,-25));poly([eR,eB,r2],shade(rc,-15));poly([eB,eL,r1,r2],rc,shade(rc,-60));}
  else{poly([eT,eR,r1],shade(rc,-40));poly([eL,eT,r1,r2],shade(rc,-25));poly([eR,eB,r2,r1],shade(rc,-15));poly([eB,eL,r2],rc,shade(rc,-60));}
  // sign board over the door
  const sg=P2(Xc,Y1,H-6);ctx.font='700 12px "Alegreya Sans",sans-serif';const tw=ctx.measureText(b.name).width+14;
  ctx.fillStyle='#2b2216';ctx.fillRect(sg.x-tw/2,sg.y-8,tw,18);ctx.strokeStyle='#b8924f';ctx.lineWidth=1;ctx.strokeRect(sg.x-tw/2+.5,sg.y-7.5,tw-1,17);
  ctx.fillStyle='#efe6d2';ctx.textAlign='center';ctx.fillText(b.name,sg.x,sg.y+5);
}
function isoGround(z){if(z._iso&&z._isoSrc===z.img)return z._iso;z._iso=null;z._isoSrc=z.img;
  try{const W=z.w*TILE,H=z.h*TILE,c=document.createElement('canvas');c.width=Math.ceil((W+H)*ISO)+2;c.height=Math.ceil((W+H)*ISO/2)+2;c._ox=Math.ceil(H*ISO)+1;
    const g=c.getContext('2d');if(!g)return null;g.setTransform(ISO,ISO/2,-ISO,ISO/2,c._ox,0);g.drawImage(z.img,0,0);z._iso=c;}catch(e){z._iso=null;}
  return z._iso;}
function render(){
  ctx.setTransform(DPR,0,0,DPR,0,0);ctx.fillStyle='#0b0d12';ctx.fillRect(0,0,VW,VH);
  if(!Z||!P)return;
  const ps=proj(P.x,P.y);camX=Math.round(ps.x-VW/2);camY=Math.round(ps.y-VH/2+10);
  ctx.save();ctx.translate(-camX,-camY);
  if(now<shakeUntil)ctx.translate(rnd(-4,4),rnd(-3,3));
  // ground: the flat map drawn through the isometric matrix (squares become diamonds)
  // (made once per region: the map already turned into the diamond view, so each frame only copies the visible part)
  {const g=isoGround(Z);if(g){const sx=Math.max(0,camX+g._ox),sy=Math.max(0,camY),sw=Math.min(g.width-sx,VW+2),sh=Math.min(g.height-sy,VH+2);
      if(sw>0&&sh>0)ctx.drawImage(g,sx,sy,sw,sh,sx-g._ox,sy,sw,sh);}
    else{ctx.save();ctx.transform(ISO,ISO/2,-ISO,ISO/2,0,0);ctx.drawImage(Z.img,0,0);ctx.restore();}}
  if(THEMES[Z.D.theme].lava){ctx.save();ctx.transform(ISO,ISO/2,-ISO,ISO/2,0,0);ctx.fillStyle=`rgba(255,120,40,${.05+.04*Math.sin(now*2)})`;ctx.fillRect(0,0,Z.w*TILE,Z.h*TILE);ctx.restore();}
  // portals
  for(const pt of Z.portals)at(pt.x,pt.y,()=>{
    ctx.save();ctx.translate(pt.x,pt.y);
    const gr=ctx.createRadialGradient(0,0,2,0,0,26);gr.addColorStop(0,'rgba(140,240,255,.9)');gr.addColorStop(1,'rgba(60,160,220,0)');
    ctx.fillStyle=gr;ctx.beginPath();ctx.ellipse(0,0,26,16,0,0,7);ctx.fill();
    ctx.strokeStyle='rgba(200,250,255,.8)';ctx.lineWidth=2;
    for(let k=0;k<3;k++){ctx.beginPath();ctx.ellipse(0,0,10+k*6,6+k*3.5,0,now*2+k,now*2+k+2.2);ctx.stroke();}
    ctx.restore();
    const D=ZONES[pt.to];label(`${D.name} · ${D.lvl}`,pt.x,pt.y-26,'#bfefff',12);
  });
  // click marker
  if(clickMark&&now-clickMark.t<.5)at(clickMark.x,clickMark.y,()=>{const a=1-(now-clickMark.t)/.5;ctx.strokeStyle=`rgba(255,240,180,${a})`;ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(clickMark.x,clickMark.y,14*(1.5-a),7*(1.5-a),0,0,7);ctx.stroke();});
  // ground effects
  for(const f of fx){if(f.k==='warn')at(f.x,f.y,()=>{const a=(now-f.t0)/f.dur;ctx.fillStyle=`rgba(255,80,40,${.12+.18*a})`;ctx.strokeStyle='rgba(255,120,60,.8)';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(f.x,f.y,f.r*1.1,f.r*.55,0,0,7);ctx.fill();ctx.stroke();});}
  if(typeof drawGround==='function')drawGround();
  // entities sorted
  // everything that stands up, sorted back-to-front (x+y is depth in this view)
  // only what is on screen (with room for names, bubbles and big bosses) is drawn
  const onScr=(x,y)=>{const p=proj(x,y);return p.x>camX-140&&p.x<camX+VW+140&&p.y>camY-40&&p.y<camY+VH+190;};
  const items=[];for(const m of mobs)if(!m.dead&&onScr(m.x,m.y))items.push({e:m,x:m.x,y:m.y});for(const n of Z.npcs)if(onScr(n.x,n.y))items.push({e:n,x:n.x,y:n.y});items.push({e:P,x:P.x,y:P.y});
  for(const l of loot)if(now>=l.t0&&onScr(l.x,l.y))items.push({l,x:l.x,y:l.y});
  const others=[];for(const o of NET.others.values())if(o.z===zoneId){if(!o.dead)others.push(o);if(onScr(o.rx,o.ry))items.push({o,x:o.rx,y:o.ry});
    if(typeof ghostLoot==='function')for(const l of ghostLoot(o))if(now>=l.t0&&onScr(l.x,l.y))items.push({l,x:l.x,y:l.y});}
  if(typeof petItems==='function')for(const it of petItems())if(onScr(it.x,it.y))items.push(it);
  for(const ob of Z.objs){const p=proj(ob.x,ob.y);if(p.x>camX-90&&p.x<camX+VW+90&&p.y>camY-30&&p.y<camY+VH+130)items.push({ob,x:ob.x,y:ob.y});}
  const back=[],front=[];
  for(const it of items){let behind=false;for(const b of Z.buildings){const X0=b.x*TILE,Y0=b.y*TILE,X1=(b.x+b.w)*TILE,Y1=(b.y+b.h)*TILE;
      if(it.x<X1+6&&it.y<Y1+6&&it.x>X0-300&&it.y>Y0-300){behind=true;break;}}(behind?back:front).push(it);}
  const byDepth=(a,b)=>(a.x+a.y)-(b.x+b.y);back.sort(byDepth);front.sort(byDepth);
  const pp=proj(P.x,P.y);
  const drawItem=it=>{if(it.ob){const op=proj(it.ob.x,it.ob.y);const cover=!P.dead&&it.ob.x+it.ob.y>P.x+P.y&&Math.abs(op.x-pp.x)<34&&op.y-pp.y<95&&op.y>pp.y;
      if(cover){ctx.save();ctx.globalAlpha=.4;drawObj(it.ob);ctx.restore();}else drawObj(it.ob);}
    else if(it.l)at(it.l.x,it.l.y,()=>drawLoot(it.l));
    else if(it.pet)at(it.pet.x,it.pet.y,()=>drawPet(it.pet));
    else if(it.o)at(it.o.rx,it.o.ry,()=>drawOther(it.o));
    else{const e=it.e;at(e.x,e.y,()=>{if(e===P)drawPlayer(P,P.eq.weapon&&P.eq.weapon.id);else if(e.d)drawMob(e);else drawNpc(e);});}};
  back.forEach(drawItem);
  for(const b of [...Z.buildings].sort((a,c)=>(a.x+a.y)-(c.x+c.y)))drawBuilding(b);
  front.forEach(drawItem);
  // target ring
  if(P.target&&!P.target.dead){const t=P.target;at(t.x,t.y,()=>{ctx.strokeStyle='rgba(255,90,70,.9)';ctx.lineWidth=2;ctx.setLineDash([5,4]);ctx.lineDashOffset=-now*20;ctx.beginPath();ctx.ellipse(t.x,t.y+2,t.d.size+9,(t.d.size+9)*.5,0,0,7);ctx.stroke();ctx.setLineDash([]);});}
  // projectiles
  for(const s of shots)at(s.x,s.y,()=>{ctx.save();ctx.translate(s.x,s.y);
    if(s.kind==='arrow'){ctx.rotate(s.ang||0);ctx.strokeStyle=s.col;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-12,0);ctx.lineTo(6,0);ctx.stroke();ctx.fillStyle=s.col;ctx.beginPath();ctx.moveTo(9,0);ctx.lineTo(3,-3);ctx.lineTo(3,3);ctx.fill();}
    else{const g=ctx.createRadialGradient(0,0,1,0,0,10);g.addColorStop(0,'#fff');g.addColorStop(.4,s.col);g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,10,0,7);ctx.fill();}
    ctx.restore();});
  drawFx();
  // labels last
  for(const m of mobs)if(!m.dead)at(m.x,m.y,()=>{
    const show=m===P.target||now-m.hitF<4||m.d.boss;
    if(show||m===hoverMob){label(`${m.d.name}  Lv${m.d.lv}`,m.x,m.y+m.d.size+16,m.d.boss?'#ffcf5a':m.d.aggro?'#ff9a8a':'#ffffff',11);}
    if(show){const w=Math.max(30,m.d.size*2.4),y=m.y-m.d.size*2-10;ctx.fillStyle='#000';ctx.fillRect(m.x-w/2-1,y-1,w+2,6);ctx.fillStyle='#d9483f';ctx.fillRect(m.x-w/2,y,w*m.hp/m.d.hp,4);}
  });
  // NPC names show when you are near or point at them; from afar the role icon over their head says who they are
  for(const n of Z.npcs){const d=Math.hypot(n.x-P.x,n.y-P.y),a=n===hoverNpc?1:clamp((260-d)/80,0,1);if(a<=0)continue;
    at(n.x,n.y,()=>{ctx.globalAlpha=a;label(n.name,n.x,n.y+22,'#ffe7a0',12);ctx.globalAlpha=1;});}
  for(const o of others)at(o.rx,o.ry,()=>{if(o.vd)shopSign(o.rx,o.ry,o.vd);label(`${o.n} · Lv${o.lv}`,o.rx,o.ry+22,o.guest?'#b8c4d4':inParty(o.peer)?'#8fe0a8':'#9fd3ff',12);if(o.guild)guildLabel(o.guild,o.rx,o.ry+44);if(o.ti&&typeof titleLabel==='function')titleLabel(o.ti,o.rx,o.ry+(o.guild?60:36));if(typeof bondLabel==='function')bondLabel(o,o.rx,o.ry-62);
    if(Math.hypot(o.x-P.x,o.y-P.y)<520){ctx.fillStyle='#000';ctx.fillRect(o.rx-17,o.ry+27,34,5);ctx.fillStyle='#62bf86';ctx.fillRect(o.rx-16,o.ry+28,32*(o.hp||0)/100,3);}
    if(o.bubble&&now<o.bubble.until)bubble(o.bubble.txt,o.rx,o.ry-58);
    if(o.emote&&now-o.emote.start<3)drawEmote(o.emote.k,o.rx+20,o.ry-52,now-o.emote.start);});
  if(!P.dead)at(P.x,P.y,()=>{drawAilIcons(P.x,P.y-72);if(TR.vend)shopSign(P.x,P.y,TR.vend.title);label(P.name,P.x,P.y+22,'#ffffff',12);if(typeof myGuildTag==='function'&&GD.g)guildLabel(myGuildTag(),P.x,P.y+37);if(typeof myTitle==='function'&&myTitle())titleLabel(myTitle(),P.x,P.y+(GD.g?53:36));
    if(P.casting){const c=P.casting,f=clamp((now-c.t0)/c.dur,0,1);ctx.fillStyle='rgba(0,0,0,.8)';ctx.fillRect(P.x-22,P.y-64,44,7);
      ctx.fillStyle='#ffb347';ctx.fillRect(P.x-21,P.y-63,42*f,5);label(SKILLS[c.id].name,P.x,P.y-68,'#ffe7a0',10);}
    if(P.bubble&&now<P.bubble.until)bubble(P.bubble.txt,P.x,P.y-58);
    if(P.emote&&now-P.emote.start<3)drawEmote(P.emote.k,P.x+20,P.y-52,now-P.emote.start);});
  for(const t of texts)at(t.x,t.y,()=>{const e=now-t.t0,a=e/t.dur;ctx.globalAlpha=a<.65?1:Math.max(0,1-(a-.65)/.35);
    const pop=e<.1?1.8-8*e:1,x=t.x+(t.vx||0)*e,y=t.y-120*e+125*e*e;
    ctx.save();ctx.translate(x,y);ctx.scale(pop,pop);ctx.font=`900 ${t.size}px "Alegreya Sans",sans-serif`;ctx.textAlign='center';ctx.lineJoin='round';
    ctx.lineWidth=Math.max(3,t.size/4.5);ctx.strokeStyle='rgba(25,12,4,.92)';ctx.strokeText(t.txt,0,0);ctx.fillStyle=t.col;ctx.fillText(t.txt,0,0);ctx.restore();ctx.globalAlpha=1;});
  ctx.restore();
  drawAmbient();
  if(THEMES[Z.D.theme].dark&&!(P&&ailOn('blind'))){const g=ctx.createRadialGradient(VW/2,VH/2,Math.min(VW,VH)*.22,VW/2,VH/2,Math.max(VW,VH)*.7);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(5,4,10,.62)');ctx.save();ctx.setTransform(DPR,0,0,DPR,0,0);ctx.fillStyle=g;ctx.fillRect(0,0,VW,VH);ctx.restore();}
  if(typeof drawSky==='function')drawSky();
  if(typeof drawSeason==='function'&&(typeof skyOn==='undefined'||skyOn)){ctx.save();ctx.setTransform(DPR,0,0,DPR,0,0);drawSeason();ctx.restore();}
  if(P&&ailOn('blind'))drawBlind();
}
const amb=[];let ambZone=null,ambLast=0;
const AMB={meadow:{n:18,col:'#fff6a8'},woods:{n:26,col:'#d8ff7a'},dunes:{n:40,col:'rgba(230,200,140,.7)'},crypt:{n:34,col:'#ff9a4a'},frost:{n:70,col:'#ffffff'},town:{n:10,col:'#ffd8e8'}};
const REDUCED_MOTION=matchMedia('(prefers-reduced-motion: reduce)');
function drawAmbient(){
  const dt=Math.min(.05,now-ambLast);ambLast=now;const cfg=AMB[zoneId];if(!cfg||REDUCED_MOTION.matches)return;
  const ak=zoneId+(window.LITE?':lite':'');if(ambZone!==ak){ambZone=ak;amb.length=0;for(let i=0;i<Math.round(cfg.n*(window.LITE?.5:1));i++)amb.push({x:Math.random()*VW,y:Math.random()*VH,p:Math.random()*6,s:.5+Math.random()});}
  ctx.save();
  for(const a of amb){a.p+=dt;
    if(zoneId==='frost'){a.y+=dt*(30+a.s*30);a.x+=Math.sin(a.p*1.3)*dt*20-dt*10;}
    else if(zoneId==='crypt'){a.y-=dt*(20+a.s*25);a.x+=Math.sin(a.p*2)*dt*12;}
    else if(zoneId==='dunes'){a.x+=dt*(80+a.s*90);a.y+=Math.sin(a.p*3)*dt*8;}
    else if(zoneId==='town'){a.y+=dt*(14+a.s*10);a.x+=Math.sin(a.p)*dt*24;}
    else{a.x+=Math.sin(a.p*.8+a.s)*dt*18;a.y+=Math.cos(a.p*.6)*dt*14;}
    if(a.y>VH+10)a.y=-10;if(a.y<-10)a.y=VH+10;if(a.x>VW+10)a.x=-10;if(a.x<-10)a.x=VW+10;
    ctx.fillStyle=cfg.col;
    if(zoneId==='woods'||zoneId==='meadow'){ctx.globalAlpha=.35+.65*Math.abs(Math.sin(a.p*2));ctx.shadowColor=cfg.col;ctx.shadowBlur=6;ctx.beginPath();ctx.arc(a.x,a.y,1.6*a.s,0,7);ctx.fill();ctx.shadowBlur=0;}
    else if(zoneId==='dunes'){ctx.globalAlpha=.5;ctx.fillRect(a.x,a.y,6*a.s,1);}
    else if(zoneId==='town'){ctx.globalAlpha=.8;ctx.beginPath();ctx.ellipse(a.x,a.y,2.4*a.s,1.4*a.s,a.p,0,7);ctx.fill();}
    else{ctx.globalAlpha=zoneId==='crypt'?.4+.6*Math.abs(Math.sin(a.p*3)):.85;ctx.beginPath();ctx.arc(a.x,a.y,(zoneId==='frost'?1.8:1.3)*a.s,0,7);ctx.fill();}
  }
  ctx.restore();
}
// names are drawn once into a small picture and reused (stroked text every frame is slow on phones)
const LABELS=new Map();
function labelImg(txt,col,size){const k=size+'|'+col+'|'+txt;let c=LABELS.get(k);if(c){LABELS.delete(k);LABELS.set(k,c);return c;}
  const s=Math.max(1,Math.min(2,DPR)),f=`700 ${size}px "Alegreya Sans",sans-serif`;const m=document.createElement('canvas').getContext('2d');m.font=f;
  const w=Math.ceil(m.measureText(txt).width)+8,h=Math.ceil(size*1.5)+6;c=document.createElement('canvas');c.width=w*s;c.height=h*s;c._w=w;c._h=h;c._b=Math.ceil(size*1.1)+3;
  const g=c.getContext('2d');g.scale(s,s);g.font=f;g.textAlign='center';g.lineJoin='round';g.lineWidth=3;g.strokeStyle='rgba(0,0,0,.75)';g.strokeText(txt,w/2,c._b);g.fillStyle=col;g.fillText(txt,w/2,c._b);
  LABELS.set(k,c);if(LABELS.size>500)LABELS.delete(LABELS.keys().next().value);return c;}
function label(txt,x,y,col,size){if(typeof x!=='number')return;txt=String(txt);
  if(document.fonts&&document.fonts.status!=='loaded'){ctx.font=`700 ${size}px "Alegreya Sans",sans-serif`;ctx.textAlign='center';ctx.lineWidth=3;ctx.strokeStyle='rgba(0,0,0,.75)';ctx.strokeText(txt,x,y);ctx.fillStyle=col;ctx.fillText(txt,x,y);return;}
  const c=labelImg(txt,col,size);ctx.drawImage(c,x-c._w/2,y-c._b,c._w,c._h);}
function bubble(txt,x,y){
  ctx.font='600 12.5px "Alegreya Sans",sans-serif';const maxW=190,words=txt.split(' '),lines=[];let line='';
  for(const w of words){const t=line?line+' '+w:w;if(ctx.measureText(t).width>maxW&&line){lines.push(line);line=w;}else line=t;}
  if(line)lines.push(line);lines.splice(3);
  const w=Math.min(maxW,Math.max(...lines.map(l=>ctx.measureText(l).width)))+16,h=lines.length*15+10,bx=x-w/2,by=y-h;
  ctx.fillStyle='rgba(255,252,240,.95)';ctx.strokeStyle='#3a2f1e';ctx.lineWidth=1.5;ctx.beginPath();ctx.roundRect(bx,by,w,h,7);ctx.fill();ctx.stroke();
  ctx.beginPath();ctx.moveTo(x-5,y-.5);ctx.lineTo(x,y+6);ctx.lineTo(x+5,y-.5);ctx.fill();
  ctx.fillStyle='#22180e';ctx.textAlign='center';lines.forEach((l,i)=>{let t=l;while(ctx.measureText(t).width>maxW&&t.length>1)t=t.slice(0,-2)+'…';ctx.fillText(t,x,by+17+i*15);});
}
function shadow(x,y,r){ctx.fillStyle='rgba(0,0,0,.28)';ctx.beginPath();ctx.ellipse(x,y+2,r,r*.42,0,0,7);ctx.fill();}
function eyes(x,y,s,face,col='#fff',pupil='#1a1a1a'){for(const k of [-1,1]){ctx.fillStyle=col;ctx.beginPath();ctx.ellipse(x+k*s*.32+face*s*.12,y,s*.17,s*.22,0,0,7);ctx.fill();ctx.fillStyle=pupil;ctx.beginPath();ctx.arc(x+k*s*.32+face*s*.18,y+s*.04,s*.09,0,7);ctx.fill();}}
/* ---- chibi look: every name gets its own hairstyle, hair, eye and skin colour ---- */
const HAIRS=['#2b1d16','#5a3a22','#8a5a2b','#c98a3a','#ecd9a0','#e8e4f0','#b8473a','#d86a9a','#4f6fc0','#3f8a6a','#7a4fb0','#1f2a44'];
const EYES=['#3a6fd0','#2f8f5a','#8a4a22','#b03a5a','#6a4ac0','#2a9aa8','#c07a1a'];
const SKINS=['#fbe3cc','#f6d6b8','#efc6a0','#d9a77c','#b9805a'];
const LOOKS=new Map();
function lookFor(name){name=name||'?';let L=LOOKS.get(name);if(L)return L;
  let h=2166136261;for(const c of name)h=Math.imul(h^c.charCodeAt(0),16777619);h>>>=0;
  L={style:h%6,hair:HAIRS[(h>>>3)%HAIRS.length],eye:EYES[(h>>>8)%EYES.length],skin:SKINS[(h>>>12)%SKINS.length],seed:(h%1000)/97};
  LOOKS.set(name,L);return L;}
const STYLE_NAMES=['Spiky','Long','Ponytail','Twin tails','Bob','Curly'];
// #1 build: 0 Standard, 1 Broad (wider shoulders, heavier brows), 2 Slender (narrower, lashes); presence field bt
const BUILD_NAMES=['Standard','Broad','Slender'];const BUILD_W=[1,1.14,.86];
function lookOf(name,lk){const b=lookFor(name);return lk?{...b,...lk}:b;}
function lookCode(lk){return lk?[lk.style,HAIRS.indexOf(lk.hair),EYES.indexOf(lk.eye),SKINS.indexOf(lk.skin)]:null;}
function lookDecode(a){if(!Array.isArray(a)||a.length!==4)return null;const[st,h,e,k]=a.map(v=>Math.floor(fin(v)));
  if(!(st>=0&&st<6)||!HAIRS[h]||!EYES[e]||!SKINS[k])return null;return {style:st,hair:HAIRS[h],eye:EYES[e],skin:SKINS[k]};}
// the body armour you wear shows over the class outfit (others see it too)
function drawArmor(x,by,f,bk,id,OL){const it=ITEMS[id];if(!it||it.type!=='armor'||id==='tunic')return;const c=it.col||'#888';
  ctx.lineWidth=1.5;ctx.strokeStyle=OL;const fs=()=>{ctx.fill();ctx.stroke();};
  const pauldrons=(r,col)=>{ctx.fillStyle=col;for(const k of [-1,1]){ctx.beginPath();ctx.ellipse(x+k*9,by-10,r,r*.75,k*.3,0,7);fs();}};
  if(id==='vest'){ctx.fillStyle=c;for(const k of [-1,1]){ctx.beginPath();ctx.moveTo(x+k*2,by-12);ctx.lineTo(x+k*8,by-11);ctx.lineTo(x+k*8,by+1);ctx.lineTo(x+k*2.5,by+1);ctx.closePath();fs();}
    ctx.strokeStyle='#e8d0a0';ctx.lineWidth=1;ctx.setLineDash([1.5,1.5]);for(const k of [-1,1]){ctx.beginPath();ctx.moveTo(x+k*4,by-9);ctx.lineTo(x+k*4,by-1);ctx.stroke();}ctx.setLineDash([]);return;}
  if(id==='robe'){ctx.fillStyle=c;for(const k of [-1,1]){ctx.beginPath();ctx.moveTo(x+k*2,by-12);ctx.lineTo(x+k*6,by-12);ctx.lineTo(x+k*4.5,by+4);ctx.lineTo(x+k*1.5,by+4);ctx.closePath();fs();}
    ctx.fillStyle='#e8c25a';for(const k of [-1,1])ctx.fillRect(x+k*3.2-1,by+1,2,3);return;}
  if(id==='scale'){ctx.fillStyle=c;ctx.beginPath();ctx.roundRect(x-7,by-12,14,12,4);fs();
    if(!bk){ctx.strokeStyle='rgba(30,40,55,.55)';ctx.lineWidth=1;for(let r=0;r<3;r++)for(let k=-2;k<=2;k++){const sx=x+k*2.8+(r%2?1.4:0),sy=by-9+r*3.2;ctx.beginPath();ctx.arc(sx,sy,1.6,0,Math.PI);ctx.stroke();}}
    ctx.strokeStyle=OL;ctx.lineWidth=1.5;pauldrons(4,'#a8b8c8');return;}
  if(id==='plate'){ctx.fillStyle=c;ctx.beginPath();ctx.roundRect(x-7.5,by-12.5,15,13,4);fs();
    if(!bk){ctx.fillStyle='rgba(255,210,120,.55)';ctx.fillRect(x-.8,by-11,1.6,9);ctx.fillStyle=`rgba(255,150,60,${.35+.25*Math.sin(now*3)})`;ctx.beginPath();ctx.arc(x,by-7,2.4,0,7);ctx.fill();}
    pauldrons(5.5,'#d8794a');ctx.fillStyle='rgba(255,220,160,.6)';for(const k of [-1,1]){ctx.beginPath();ctx.arc(x+k*9-1,by-11.5,1.4,0,7);ctx.fill();}return;}
  // any other armour: a chest piece in its colour
  ctx.fillStyle=c;ctx.beginPath();ctx.roundRect(x-6.5,by-11.5,13,11,4);fs();}
function drawHuman(x,y,body,hair,face,walk,opt={}){
  const L=opt.look||{style:0,eye:'#5a3a22',skin:'#f6d6b8',seed:0};hair=L.hair||hair;
  const f=face<0?-1:1,out=opt.outfit||'npc',OL='#2a1c14',st=L.style;
  const bob=walk?Math.abs(Math.sin(walk*12))*1.5:0,sit=opt.sit?6:0;
  const by=y-7-bob+sit,hy=by-19,robe=out==='arcanist'||out==='cleric';
  shadow(x,y,12);ctx.lineJoin='round';ctx.lineCap='round';ctx.lineWidth=1.5;ctx.strokeStyle=OL;
  const fs=()=>{ctx.fill();ctx.stroke();};
  const bk=!!opt.back;
  // back layer: long hair, tails, cape, quiver (drawn behind the body, or over it when seen from behind)
  const backLayer=()=>{ctx.lineWidth=1.5;ctx.strokeStyle=OL;ctx.fillStyle=hair;
  if(st===1){ctx.beginPath();ctx.roundRect(x-12.5,hy-4,25,24,8);fs();}
  if(st===4){ctx.beginPath();ctx.roundRect(x-13.5,hy-6,27,17,8);fs();}
  if(st===2){ctx.beginPath();ctx.ellipse(bk?x:x-f*13,hy+(bk?7:3)+Math.sin(now*4+L.seed)*.8,4.5,10,f*.35,0,7);fs();}
  if(st===3)for(const k of [-1,1]){ctx.beginPath();ctx.ellipse(x+k*14,hy+5+Math.sin(now*4+k)*.8,4.5,10.5,k*-.25,0,7);fs();}
  if(out==='warden'){ctx.fillStyle='#8e2a22';ctx.beginPath();ctx.moveTo(x-7,by-11);ctx.lineTo(x+7,by-11);ctx.lineTo(x+9-f*4,y-1+Math.sin(now*3)*1);ctx.lineTo(x-9-f*4,y-1);ctx.closePath();fs();}
  if(out==='ranger'){ctx.save();ctx.translate(x-f*6,by-8);ctx.rotate(f*.45);ctx.fillStyle='#6b4423';ctx.beginPath();ctx.roundRect(-3,-12,6,16,2);fs();ctx.fillStyle='#e8e0d0';for(const k of [-1.5,1.5]){ctx.beginPath();ctx.moveTo(k,-12);ctx.lineTo(k-1.5,-16);ctx.lineTo(k+1.5,-16);ctx.fill();}ctx.restore();}};
  if(!bk)backLayer();
  // legs and boots
  const boot=out==='warden'?'#5a5f6a':out==='ranger'?'#5a3a22':'#3a2a20';
  if(!opt.sit){const l=walk?Math.sin(walk*12)*3.5:0;ctx.strokeStyle=OL;ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(x-3.5,by);ctx.lineTo(x-3.5+l,y-2);ctx.moveTo(x+3.5,by);ctx.lineTo(x+3.5-l,y-2);ctx.stroke();
    ctx.lineWidth=1.5;ctx.fillStyle=boot;for(const[k,d]of[[-3.5,l],[3.5,-l]]){ctx.beginPath();ctx.ellipse(x+k+d+f*1,y-1.5,3.5,2.5,0,0,7);fs();}}
  else{const pant=robe?body:'#4a3a2e';ctx.lineWidth=1.5;ctx.strokeStyle=OL;ctx.fillStyle=pant;
    for(const k of [-1,1]){ctx.beginPath();ctx.ellipse(x+k*7,y-2.5,6.5,3.6,k*.18,0,7);fs();}
    ctx.fillStyle=boot;for(const k of [-1,1]){ctx.beginPath();ctx.ellipse(x+k*2.5,y,3.4,2.4,0,0,7);fs();}}
  // torso / robe (wider or narrower by build)
  const bw=BUILD_W[L.body|0]||1;ctx.save();if(bw!==1){ctx.translate(x,0);ctx.scale(bw,1);ctx.translate(-x,0);}
  ctx.lineWidth=1.5;ctx.strokeStyle=OL;
  if(robe){ctx.fillStyle=out==='cleric'?'#f4efe2':body;ctx.beginPath();ctx.moveTo(x-7,by-11);ctx.lineTo(x+7,by-11);ctx.lineTo(x+11,y-2-(opt.sit?0:1));ctx.quadraticCurveTo(x,y+1,x-11,y-2);ctx.closePath();fs();
    ctx.strokeStyle=out==='cleric'?body:'#e8c25a';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x-10,y-3);ctx.quadraticCurveTo(x,y,x+10,y-3);ctx.stroke();ctx.lineWidth=1.5;ctx.strokeStyle=OL;}
  else{ctx.fillStyle=body;ctx.beginPath();ctx.roundRect(x-8,by-12,16,14,5);fs();}
  // outfit details (front only)
  if(bk){ctx.fillStyle='rgba(0,0,0,.14)';ctx.fillRect(x-8,by-3,16,3);}
  else if(out==='warden'){ctx.fillStyle='#b9bec8';ctx.beginPath();ctx.roundRect(x-6,by-11,12,10,3);fs();ctx.fillStyle='#d8dde6';for(const k of [-1,1]){ctx.beginPath();ctx.arc(x+k*8,by-10,4,0,7);fs();}}
  else if(out==='arcanist'){ctx.fillStyle='#e8c25a';ctx.beginPath();ctx.moveTo(x-5,by-11);ctx.lineTo(x,by-6);ctx.lineTo(x+5,by-11);ctx.closePath();ctx.fill();ctx.fillStyle='#fff6c0';ctx.beginPath();ctx.arc(x,by-6,1.6,0,7);ctx.fill();}
  else if(out==='cleric'){ctx.fillStyle=body;ctx.fillRect(x-5,by-11,3,16);ctx.fillRect(x+2,by-11,3,16);ctx.fillStyle='#c8463a';ctx.fillRect(x-1,by-10,2,7);ctx.fillRect(x-3,by-8,6,2);}
  else if(out==='ranger'){ctx.fillStyle='#2f6a3a';ctx.beginPath();ctx.ellipse(x,by-11,9,3.5,0,0,7);fs();ctx.strokeStyle='#6b4423';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x-6,by-10);ctx.lineTo(x+6,by);ctx.stroke();}
  else{ctx.fillStyle='#6b4423';ctx.fillRect(x-8,by-3,16,3);ctx.fillStyle='#e8c25a';ctx.fillRect(x-1.5,by-3.5,3,4);ctx.fillStyle='rgba(255,255,255,.55)';ctx.beginPath();ctx.moveTo(x-4,by-12);ctx.lineTo(x,by-8);ctx.lineTo(x+4,by-12);ctx.closePath();ctx.fill();}
  if(opt.armor)drawArmor(x,by,f,bk,opt.armor,OL);
  if((L.body|0)===2&&!bk&&!robe){ctx.fillStyle='rgba(0,0,0,.13)';for(const k of [-1,1]){ctx.beginPath();ctx.moveTo(x+k*8,by-6);ctx.quadraticCurveTo(x+k*5.5,by-3,x+k*8,by);ctx.closePath();ctx.fill();}}
  ctx.restore();
  // hands
  ctx.lineWidth=1.5;ctx.strokeStyle=OL;ctx.fillStyle=L.skin;
  for(const k of [-f,f]){ctx.beginPath();if(opt.sit)ctx.arc(x+k*10*bw,y-4,2.6,0,7);else if(opt.cast)ctx.arc(x+k*11*bw,by-15+Math.sin(now*9+k)*1.2,2.6,0,7);else ctx.arc(x+k*9*bw,by-4+(k===f?-1:0),bw<1?2.3:2.6,0,7);fs();}
  // head: from behind it is all hair
  if(bk){backLayer();ctx.fillStyle=hair;ctx.strokeStyle=OL;ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(x,hy,12.8,12.3,0,0,7);fs();
    ctx.strokeStyle='rgba(0,0,0,.2)';ctx.lineWidth=1.2;for(const k of [-7,-2.5,2.5,7]){ctx.beginPath();ctx.moveTo(x+k*.5,hy-10);ctx.quadraticCurveTo(x+k*1.15,hy,x+k,hy+10);ctx.stroke();}
    ctx.strokeStyle=OL;ctx.lineWidth=1.5;
    if(st===2){ctx.fillStyle=hair;ctx.beginPath();ctx.ellipse(x,hy+10+Math.sin(now*4+L.seed)*.8,4.5,9.5,0,0,7);fs();}}
  else{ctx.fillStyle=L.skin;ctx.beginPath();ctx.ellipse(x,hy,12.5,12,0,0,7);fs();}
  if(!bk){ // face
  const ex=x+f*2.6,ey=hy+2.5,blink=((now+L.seed)%4.2)<.12;
  for(const k of [-1,1]){const cx=ex+k*4.8,far=k===-f,w=far?2:2.5;
    if(opt.sit||blink){ctx.strokeStyle=OL;ctx.lineWidth=1.4;ctx.beginPath();if(opt.sit)ctx.arc(cx,ey+1,2.3,Math.PI*1.15,Math.PI*1.85);else{ctx.moveTo(cx-w,ey);ctx.lineTo(cx+w,ey);}ctx.stroke();continue;}
    ctx.fillStyle='#fff';ctx.beginPath();ctx.ellipse(cx,ey,w+.6,4,0,0,7);ctx.fill();
    ctx.fillStyle=L.eye;ctx.beginPath();ctx.ellipse(cx+f*.4,ey+.5,w,3.6,0,0,7);ctx.fill();
    ctx.fillStyle='#14100c';ctx.beginPath();ctx.ellipse(cx+f*.5,ey+1,w*.5,1.9,0,0,7);ctx.fill();
    ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(cx-.6,ey-1.2,1.1,0,7);ctx.fill();ctx.beginPath();ctx.arc(cx+1,ey+2,.5,0,7);ctx.fill();
    ctx.strokeStyle=OL;ctx.lineWidth=(L.body|0)===1?2.3:1.6;ctx.beginPath();ctx.moveTo(cx-w-.8,ey-3.4);ctx.quadraticCurveTo(cx,ey-4.8,cx+w+.8,ey-3.4);ctx.stroke();
    if((L.body|0)===2){const o=k===f?1:-1;ctx.lineWidth=1.1;ctx.beginPath();ctx.moveTo(cx+o*(w+.4),ey-2.6);ctx.lineTo(cx+o*(w+2),ey-4);ctx.moveTo(cx+o*(w+.6),ey-1.4);ctx.lineTo(cx+o*(w+2.3),ey-2.2);ctx.stroke();}}
  ctx.fillStyle='rgba(240,120,120,.35)';for(const k of [-1,1]){ctx.beginPath();ctx.ellipse(ex+k*6.5,hy+6.5,2.2,1.2,0,0,7);ctx.fill();}
  ctx.strokeStyle='#7a3a2a';ctx.lineWidth=1.1;ctx.beginPath();ctx.arc(ex,hy+7,1.4,.2,Math.PI-.2);ctx.stroke();
  // fringe: hair cap with zig-zag bangs, swept toward the facing side
  ctx.fillStyle=hair;ctx.strokeStyle=OL;ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(x-13,hy+2);
  const sw=f*1.5;for(let i=0;i<5;i++){const px=x-13+i*5.2;ctx.lineTo(px+2.6+sw,hy-(i%2?2:5)+(st===4?1:0));ctx.lineTo(px+5.2,hy-6.5);}
  ctx.lineTo(x+13,hy+2);ctx.arc(x,hy-1,13.2,0.15,Math.PI-0.15,true);ctx.closePath();fs();
  }
  if(st===0)for(let i=-2;i<=2;i++){const px=x+i*5;ctx.beginPath();ctx.moveTo(px-3.5,hy-11+Math.abs(i));ctx.lineTo(px+f*2+i*1.5,hy-18-(i%2?0:2)+Math.abs(i)*1.5);ctx.lineTo(px+3.5,hy-11+Math.abs(i));ctx.closePath();fs();}
  if(st===5)for(let i=-1;i<=1;i++){ctx.beginPath();ctx.arc(x+i*6,hy-12+Math.abs(i)*2,4.5,0,7);fs();}
  if(!bk&&(st===1||st===3||st===4))for(const k of [-1,1]){ctx.beginPath();ctx.moveTo(x+k*12.5,hy-3);ctx.quadraticCurveTo(x+k*14,hy+4,x+k*11,hy+(st===4?9:11));ctx.lineTo(x+k*10.5,hy);ctx.closePath();fs();}
  if(st===2||st===3){ctx.fillStyle='#e04a6a';for(const k of st===3?[-1,1]:[bk?0:-f]){ctx.beginPath();ctx.arc(x+k*12,hy+(bk&&st===2?2:-5),2.2,0,7);fs();}}
  ctx.fillStyle='rgba(255,255,255,.22)';ctx.beginPath();ctx.ellipse(x-f*4,hy-9,4,1.5,-f*.3,0,7);ctx.fill();
  if(!bk&&(opt.fc||opt.mo)&&typeof drawFaceGear==='function')drawFaceGear(opt.fc,opt.mo,x,hy,f);
  if(opt.hat){ctx.save();ctx.translate(x,hy);ctx.scale(1.35,1.35);ctx.translate(-x,-hy);drawHat(opt.hat,x,hy,f);ctx.restore();}
  return by;
}
function drawHat(id,x,hy,f){
  ctx.save();
  switch(id){
    case 'strawhat':ctx.fillStyle='#d9b45a';ctx.beginPath();ctx.ellipse(x,hy-6,15,4,0,0,7);ctx.fill();ctx.fillStyle='#e8c870';ctx.beginPath();ctx.ellipse(x,hy-9,8,6,0,Math.PI,0);ctx.fill();ctx.fillStyle='#b8473a';ctx.fillRect(x-8,hy-8,16,2);break;
    case 'ribbon':ctx.fillStyle='#f07ca0';ctx.beginPath();ctx.moveTo(x-f*4,hy-12);ctx.lineTo(x-f*13,hy-18);ctx.lineTo(x-f*12,hy-7);ctx.closePath();ctx.fill();ctx.beginPath();ctx.moveTo(x-f*4,hy-12);ctx.lineTo(x+f*5,hy-19);ctx.lineTo(x+f*4,hy-8);ctx.closePath();ctx.fill();ctx.fillStyle='#c84a78';ctx.beginPath();ctx.arc(x-f*4,hy-12,2.5,0,7);ctx.fill();break;
    case 'sprout':ctx.strokeStyle='#4e9a3a';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x,hy-9);ctx.lineTo(x,hy-17);ctx.stroke();ctx.fillStyle='#7fd36a';ctx.beginPath();ctx.ellipse(x-5,hy-18,5,2.5,-.5,0,7);ctx.ellipse(x+5,hy-19,5,2.5,.5,0,7);ctx.fill();break;
    case 'gloomhat':ctx.fillStyle='#6a4a8a';ctx.strokeStyle='#2a1c14';ctx.lineWidth=1.2;ctx.beginPath();ctx.ellipse(x,hy-9,15,9,0,Math.PI,0);ctx.closePath();ctx.fill();ctx.stroke();
      ctx.fillStyle='#c8b0f0';for(const[a,b,r]of[[-7,-13,2.2],[2,-15,2.6],[8,-11,1.8],[-1,-10,1.5]]){ctx.beginPath();ctx.arc(x+a,hy+b,r,0,7);ctx.fill();}break;
    case 'thorncrown':ctx.fillStyle='#4e8a3a';ctx.strokeStyle='#2a1c14';ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(x,hy-9,11,3.5,0,0,7);ctx.fill();ctx.stroke();
      for(let i=-2;i<=2;i++){ctx.fillStyle=i%2?'#6fb04f':'#4e8a3a';ctx.beginPath();ctx.moveTo(x+i*4.5-2.5,hy-10);ctx.lineTo(x+i*4.5,hy-19+Math.abs(i)*1.5);ctx.lineTo(x+i*4.5+2.5,hy-10);ctx.closePath();ctx.fill();ctx.stroke();}
      ctx.fillStyle='#e04a6a';ctx.beginPath();ctx.arc(x+f*3,hy-10,2,0,7);ctx.fill();break;
    case 'tyranthelm':ctx.fillStyle='#a07a42';ctx.strokeStyle='#2a1c14';ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(x,hy-4,12.5,Math.PI,0);ctx.lineTo(x+12.5,hy-2);ctx.lineTo(x-12.5,hy-2);ctx.closePath();ctx.fill();ctx.stroke();
      ctx.fillStyle='#c8a060';for(const k of [-1,1]){ctx.beginPath();ctx.moveTo(x+k*6,hy-13);ctx.quadraticCurveTo(x+k*16,hy-22,x+k*12,hy-26);ctx.quadraticCurveTo(x+k*10,hy-18,x+k*2,hy-15);ctx.closePath();ctx.fill();ctx.stroke();}
      ctx.fillStyle='#ffcf5a';ctx.beginPath();ctx.arc(x,hy-12,2.2,0,7);ctx.fill();break;
    case 'rimehalo':ctx.strokeStyle='#bfe6ff';ctx.lineWidth=2.5;ctx.globalAlpha=.85+Math.sin(now*3)*.15;ctx.beginPath();ctx.ellipse(x,hy-19,10,3.2,0,0,7);ctx.stroke();
      ctx.fillStyle='#eaf6ff';for(let i=0;i<4;i++){const a=now*1.5+i*Math.PI/2;ctx.beginPath();ctx.arc(x+Math.cos(a)*10,hy-19+Math.sin(a)*3.2,1.6,0,7);ctx.fill();}ctx.globalAlpha=1;break;
    case 'lupeears':ctx.fillStyle='#8a909c';for(const k of [-1,1]){ctx.beginPath();ctx.moveTo(x+k*3,hy-7);ctx.lineTo(x+k*8,hy-20);ctx.lineTo(x+k*10,hy-6);ctx.fill();}ctx.fillStyle='#e0b8b8';for(const k of [-1,1]){ctx.beginPath();ctx.moveTo(x+k*5,hy-8);ctx.lineTo(x+k*8,hy-16);ctx.lineTo(x+k*9,hy-8);ctx.fill();}break;
    case 'turban':ctx.fillStyle='#efe6d2';ctx.beginPath();ctx.ellipse(x,hy-6,10.5,8,0,Math.PI,0);ctx.fill();ctx.strokeStyle='#cbbfa6';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x-9,hy-9);ctx.quadraticCurveTo(x,hy-14,x+9,hy-8);ctx.stroke();ctx.fillStyle='#d9483f';ctx.beginPath();ctx.arc(x+f*2,hy-10,2.2,0,7);ctx.fill();break;
    case 'imphorns':ctx.fillStyle='#7a2a1e';for(const k of [-1,1]){ctx.beginPath();ctx.moveTo(x+k*4,hy-8);ctx.quadraticCurveTo(x+k*14,hy-12,x+k*11,hy-22);ctx.quadraticCurveTo(x+k*9,hy-13,x+k*1,hy-10);ctx.fill();}break;
    case 'frostcap':ctx.fillStyle='#4f86b8';ctx.beginPath();ctx.ellipse(x,hy-6,10,8,0,Math.PI,0);ctx.fill();ctx.fillStyle='#eef4f8';ctx.fillRect(x-10,hy-7,20,3);ctx.beginPath();ctx.arc(x,hy-15,3.5,0,7);ctx.fill();break;
    case 'crown':ctx.shadowColor='#ffb03a';ctx.shadowBlur=8;ctx.fillStyle='#ffcf5a';ctx.beginPath();ctx.moveTo(x-9,hy-7);ctx.lineTo(x-9,hy-15);ctx.lineTo(x-5,hy-11);ctx.lineTo(x,hy-18);ctx.lineTo(x+5,hy-11);ctx.lineTo(x+9,hy-15);ctx.lineTo(x+9,hy-7);ctx.closePath();ctx.fill();ctx.shadowBlur=0;ctx.fillStyle='#e0522a';ctx.beginPath();ctx.arc(x,hy-10,2,0,7);ctx.fill();break;
  }
  ctx.restore();
}
function drawOther(o){const atk=o.atkFaceT&&now-o.atkFaceT<.4;
  drawPlayer({name:o.n,look:o.look,x:o.rx,y:o.ry,cls:o.cls,face:atk?o.atkFace:o.face,moving:o.moving,walkT:o.walkT,sitting:o.sitting,hat:o.hat,fc:o.fc,mo:o.mo,armor:o.ar||null,back:o.back,swingT:o.swingT,swingDur:o.swingDur,lungeT:o.lungeT,lgX:o.lgX,lgY:o.lgY,casting:o.cs,hurtT:o.hurtT,dead:o.dead,deadT:o.deadT},o.wid);}
// where a melee swing is at: p from 0 (start) to 1 (end), or -1 when not swinging; follow-through runs a little past 1
function swingPhase(P){const sd=P.swingDur||.22;return P.swingT&&now-P.swingT<sd*1.25?(now-P.swingT)/sd:-1;}
const ease3=k=>k*k*(3-2*k),easeOut=k=>1-(1-k)**3;
function drawPlayer(P,wid){
  const w=wid?ITEMS[wid]:null,melee=!w||(w.wt!=='bow'&&w.wt!=='wand'),p=swingPhase(P),body=melee&&p>=0&&P.lungeT&&Math.abs(P.lungeT-P.swingT)<.05;
  let push=0,lean=0;
  // wind up (lean back), strike (step in and lean into it), recover
  if(body){if(p<.3){const k=ease3(p/.3);push=-3*k;lean=-.1*k;}else if(p<.55){const k=easeOut((p-.3)/.25);push=-3+15*k;lean=-.1+.26*k;}else{const k=ease3(Math.min(1,(p-.55)/.7));push=12*(1-k);lean=.16*(1-k);}}
  const lg=!body&&P.lungeT&&now-P.lungeT<.2?Math.sin((now-P.lungeT)/.2*Math.PI)*7:0,hr=P.hurtT&&now-P.hurtT<.2?Math.sin((now-P.hurtT)/.2*Math.PI*3)*2.5:0;
  if(!lg&&!hr&&!push&&!lean)return drawPlayerBody(P,wid);
  ctx.save();ctx.translate((P.lgX||0)*(lg+push)+hr,(P.lgY||0)*(lg+push));
  if(lean){ctx.translate(P.x,P.y);ctx.rotate(lean*(P.face||1));ctx.translate(-P.x,-P.y);}
  drawPlayerBody(P,wid);ctx.restore();}
// the weapon itself, grip at 0,0 and pointing up (-y); a bow ignores the turn
function drawWeaponShape(w,ang){
  ctx.lineCap='round';
  if(w.wt==='bow'){ctx.rotate(-ang);ctx.strokeStyle='#8a5a2a';ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(0,0,13,-1.3,1.3);ctx.stroke();ctx.strokeStyle='#eee';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(Math.cos(-1.3)*13,Math.sin(-1.3)*13);ctx.lineTo(Math.cos(1.3)*13,Math.sin(1.3)*13);ctx.stroke();}
  else if(w.wt==='wand'){ctx.strokeStyle='#6b4a2a';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(0,4);ctx.lineTo(0,-18);ctx.stroke();ctx.fillStyle=`hsl(${260+Math.sin(now*4)*20},80%,70%)`;ctx.beginPath();ctx.arc(0,-20,4,0,7);ctx.fill();}
  else if(w.wt==='sword'||w.wt==='axe'){ctx.strokeStyle='#5a3d24';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(0,4);ctx.lineTo(0,-2);ctx.stroke();ctx.fillStyle='#d0d6de';
    if(w.wt==='sword'){ctx.fillRect(-2,-22,4,20);ctx.fillStyle='#b8924f';ctx.fillRect(-6,-3,12,3);}else{ctx.strokeStyle='#5a3d24';ctx.beginPath();ctx.moveTo(0,-2);ctx.lineTo(0,-22);ctx.stroke();ctx.beginPath();ctx.moveTo(0,-20);ctx.quadraticCurveTo(12,-16,0,-8);ctx.fill();}}
  else{ctx.strokeStyle=w.wt==='mace'?'#8a8f99':'#7a5530';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(0,4);ctx.lineTo(0,-16);ctx.stroke();ctx.fillStyle=w.wt==='mace'?'#c8ccd4':'#8a6038';ctx.beginPath();ctx.arc(0,-17,4.5,0,7);ctx.fill();}
}
function drawSlung(P,w){const f=P.face||1,by=P.y-7+(P.sitting?7:0);ctx.save();
  if(w.wt==='bow'){ctx.translate(P.x+f*(P.back?0:6),by-13);ctx.scale(f,1);ctx.rotate(-.5);drawWeaponShape(w,0);}
  else if(!P.back){ctx.translate(P.x+f*11,by-14);ctx.scale(f,1);ctx.rotate(Math.PI+.6);ctx.translate(0,8);drawWeaponShape(w,0);}
  else{ctx.translate(P.x-f*8,by-21);ctx.scale(f,1);ctx.rotate(Math.PI+.55);ctx.translate(0,-4);drawWeaponShape(w,0);}
  ctx.restore();}
function drawPlayerBody(P,wid){
  const c=CLASSES[P.cls],w=wid?ITEMS[wid]:null;
  // #2 in town, sitting or riding (and not fighting) the weapon is slung across the back
  const swNow=P.swingT&&now-P.swingT<(P.swingDur||.2);
  const sheath=!!w&&!P.held&&!P.dead&&!P.casting&&!swNow&&swingPhase(P)<0&&(P.sitting||!!P.riding||!!(Z&&Z.D&&Z.D.safe));
  if(sheath&&!P.back)drawSlung(P,w);
  const hat=P.hat!==undefined?P.hat:(P.eq&&P.eq.head?P.eq.head.id:null),fc=P.fc!==undefined?P.fc:(P.eq&&P.eq.face?P.eq.face.id:null),mo=P.mo!==undefined?P.mo:(P.eq&&P.eq.mouth?P.eq.mouth.id:null);
  const by=drawHuman(P.x,P.y,c.col,c.hair,P.face,P.moving?P.walkT:0,{sit:P.sitting,cast:!!P.casting,hat,fc,mo,look:lookOf(P.name,P.look),outfit:baseOf(P.cls),back:!!P.back,armor:P.armor!==undefined?P.armor:(P.eq&&P.eq.armor?P.eq.armor.id:null)});
  drawJobMantle(c,P.x,P.y+(P.sitting?6:0),P.face,!!P.back);
  if(baseOf(P.cls)==='warden'){ctx.fillStyle='#9aa0aa';ctx.strokeStyle='#2a1c14';ctx.lineWidth=1.5;ctx.beginPath();ctx.roundRect(P.x-P.face*13-5,by-14,10,14,3);ctx.fill();ctx.stroke();ctx.fillStyle='#e8c25a';ctx.beginPath();ctx.arc(P.x-P.face*13,by-7,2,0,7);ctx.fill();}
  if(sheath&&P.back)drawSlung(P,w);
  if(!w||sheath)return;
  const sd=P.swingDur||.2,sw=P.swingT&&now-P.swingT<sd?(now-P.swingT)/sd:0,ranged=w.wt==='bow'||w.wt==='wand',p=swingPhase(P);
  // held low at the side, tilted forward. Ranged: a small lift. Melee: raised over the shoulder, a fast arc down, then back.
  let ang=sw?(sw<.3?.6-sw/.3*.7:-.1+(sw-.3)/.7*1.9):.6,lift=0;
  let castUp=0;if(P.casting&&!sw){ang=.08;castUp=9;}
  if(!ranged&&p>=0){if(p<.3){const k=ease3(p/.3);ang=.6-1.6*k;lift=k;}else if(p<.55){const k=easeOut((p-.3)/.25);ang=-1+3.15*k;lift=1-k;}else{const k=ease3(Math.min(1,(p-.55)/.7));ang=2.15-1.55*k;}}
  ctx.save();ctx.translate(P.x+P.face*(11-lift*15),by-3-lift*9-castUp);ctx.scale(P.face,1);
  // the smear the blade leaves behind as it comes down
  if(!ranged&&p>=.3&&p<.8&&ang>.1){const al=p<.55?1:1-(p-.55)/.25,a1=ang-Math.PI/2,a0=Math.max(-.15,ang-2.2)-Math.PI/2,R=w.wt==='sword'||w.wt==='axe'?27:22;
    ctx.fillStyle=`rgba(255,246,220,${.5*al})`;ctx.beginPath();ctx.arc(0,0,R,a0,a1);ctx.arc(0,0,R*.45,a1,a0,true);ctx.closePath();ctx.fill();
    ctx.fillStyle=`rgba(255,255,255,${.75*al})`;ctx.beginPath();ctx.arc(0,0,R+1,Math.max(a0,a1-.7),a1);ctx.arc(0,0,R*.8,a1,Math.max(a0,a1-.7),true);ctx.closePath();ctx.fill();}
  ctx.rotate(ang);
  drawWeaponShape(w,ang);
  ctx.restore();
}
function drawNpc(n){const by=drawHuman(n.x,n.y,n.col,n.hair,1,0,{look:{...lookFor(n.name),hair:n.hair}});
  const mk=typeof npcMark==='function'?npcMark(n):'svc';if(!mk)return;
  const b=Math.sin(now*3)*2,big=mk==='offer'||mk==='ready',r=big?9:7;
  ctx.fillStyle=mk==='busy'?'#9aa3b2':mk==='svc'?'#d8c08a':'#ffcf5a';ctx.strokeStyle='#2a1c14';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(n.x,by-48+b,r,0,7);ctx.fill();if(big)ctx.stroke();
  if(mk==='svc'&&drawRoleIcon(n.role,n.x,by-48+b))return;
  ctx.fillStyle='#2a2018';ctx.font=`800 ${big?14:11}px "Alegreya Sans",sans-serif`;ctx.textAlign='center';ctx.fillText(mk==='offer'?'!':mk==='svc'?'…':'?',n.x,by-48+b+(big?5:4));}
// a small picture of what an NPC does, drawn over their head (in a circle the colour of the marker)
function drawRoleIcon(role,x,y){const c=ctx;c.save();c.translate(x,y);c.strokeStyle='#2a2018';c.fillStyle='#2a2018';c.lineWidth=1.3;c.lineCap='round';c.lineJoin='round';
  const P_=()=>{c.fill();};let ok=true;
  switch(role){
    case 'shop':c.beginPath();c.moveTo(-3.5,-1.5);c.lineTo(3.5,-1.5);c.lineTo(3,4);c.lineTo(-3,4);c.closePath();P_();c.beginPath();c.arc(0,-1.5,2,Math.PI,0);c.stroke();break; // a bag
    case 'smith':c.beginPath();c.moveTo(-4,-1);c.lineTo(4,-1);c.lineTo(2.5,1.5);c.lineTo(-2.5,1.5);c.closePath();P_();c.fillRect(-1.2,1.5,2.4,2.2);c.fillRect(-3,3.5,6,1.2);break; // an anvil
    case 'heal':c.fillRect(-1.3,-4,2.6,8);c.fillRect(-4,-1.3,8,2.6);break; // a cross
    case 'warp':c.beginPath();c.moveTo(-4,2);c.quadraticCurveTo(-1,-5,4,-3);c.lineTo(1,-1);c.moveTo(4,-3);c.lineTo(2.5,1);c.stroke();break; // a curving arrow
    case 'storage':c.fillRect(-4,-2,8,6);c.fillStyle='#d8c08a';c.fillRect(-4,0,8,.9);c.fillStyle='#2a2018';c.beginPath();c.arc(0,-2,4,Math.PI,0);P_();break; // a chest
    case 'job':c.beginPath();c.moveTo(-3.5,-4);c.lineTo(3.5,-4);c.lineTo(3.5,0);c.quadraticCurveTo(3,3.5,0,4.5);c.quadraticCurveTo(-3,3.5,-3.5,0);c.closePath();P_();break; // a shield
    case 'stylist':for(const k of[-1,1]){c.beginPath();c.arc(k*2.3,2.6,1.5,0,7);c.stroke();}c.beginPath();c.moveTo(-1.5,1.4);c.lineTo(2.5,-4.5);c.moveTo(1.5,1.4);c.lineTo(-2.5,-4.5);c.stroke();break; // scissors
    case 'arena':c.beginPath();c.moveTo(-4,4);c.lineTo(3.5,-3.5);c.moveTo(4,4);c.lineTo(-3.5,-3.5);c.stroke();break; // crossed swords
    case 'keep':c.beginPath();c.moveTo(-3,4.5);c.lineTo(-3,-4.5);c.stroke();c.beginPath();c.moveTo(-3,-4.5);c.lineTo(3.5,-2.8);c.lineTo(-3,-1);c.closePath();P_();break; // a flag
    case 'gemcut':c.beginPath();c.moveTo(0,4.5);c.lineTo(-4,-1);c.lineTo(-2,-3.5);c.lineTo(2,-3.5);c.lineTo(4,-1);c.closePath();P_();break; // a gem
    case 'library':c.fillRect(-4,-3.5,3.6,7);c.fillRect(.4,-3.5,3.6,7);break; // an open book
    case 'festival':c.beginPath();for(let i=0;i<10;i++){const a=i*Math.PI/5-Math.PI/2,r=i%2?2:4.5;c.lineTo(Math.cos(a)*r,Math.sin(a)*r);}c.closePath();P_();break; // a star
    case 'rebirth':c.beginPath();c.arc(0,0,2.2,0,7);P_();for(let i=0;i<8;i++){const a=i*Math.PI/4;c.beginPath();c.moveTo(Math.cos(a)*3.2,Math.sin(a)*3.2);c.lineTo(Math.cos(a)*4.6,Math.sin(a)*4.6);c.stroke();}break; // a sun
    default:ok=false;}
  c.restore();return ok;}
function drawLoot(l){
  const k=Math.min(1,(now-l.t0)/.38),dx=l.fx-l.x,dy=l.fy-l.y;
  const ox=(dx-dy)*ISO*(1-k),oy=(dx+dy)*ISO/2*(1-k)-Math.sin(k*Math.PI)*28+(k>=1?Math.sin(now*3+l.uid)*1.2:0);
  const x=l.x+ox,y=l.y+oy-6,left=l.exp-now;
  if(l.ghost)ctx.globalAlpha=.72;else if(left<10&&Math.sin(now*12)>0)ctx.globalAlpha=.45;
  ctx.fillStyle='rgba(0,0,0,.25)';ctx.beginPath();ctx.ellipse(l.x,l.y+1,7*(.6+.4*k),2.6,0,0,7);ctx.fill();
  if(l.rare||hoverLoot===l){ctx.shadowColor=l.rare?'#ffcf5a':'#ffffff';ctx.shadowBlur=l.rare?14+Math.sin(now*5)*5:8;}
  ctx.strokeStyle='#2a1c14';ctx.lineWidth=1.5;
  if(l.gold){for(const [cx,cy] of [[-3,1],[3,1],[0,-2]]){ctx.fillStyle='#f0c040';ctx.beginPath();ctx.ellipse(x+cx,y+cy,4.5,3,0,0,7);ctx.fill();ctx.stroke();ctx.fillStyle='#fff2a8';ctx.fillRect(x+cx-1.5,y+cy-1.5,3,1.2);}}
  else{const it=ITEMS[l.id];if(typeof itemIconCanvas==='function'){ctx.drawImage(itemIconCanvas(l.id),x-11,y-12,22,22);ctx.shadowBlur=0;}
    else{ctx.fillStyle=it.col;ctx.beginPath();ctx.arc(x,y,7,0,7);ctx.fill();ctx.stroke();ctx.shadowBlur=0;
    ctx.fillStyle='#1a120a';ctx.font='800 9px "Alegreya Sans",sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(it.g,x,y+.5);ctx.textBaseline='alphabetic';}
    ctx.fillStyle='rgba(255,255,255,.55)';ctx.beginPath();ctx.arc(x-2.5,y-2.5,1.8,0,7);ctx.fill();}
  ctx.shadowBlur=0;
  if(k>=1&&(now+l.uid*.7)%2.4<.25){ctx.fillStyle='rgba(255,255,255,.9)';const gx=x+5,gy=y-6;ctx.beginPath();ctx.moveTo(gx,gy-4);ctx.lineTo(gx+1,gy);ctx.lineTo(gx,gy+4);ctx.lineTo(gx-1,gy);ctx.fill();ctx.fillRect(gx-3,gy-.5,6,1);}
  if(hoverLoot===l||l.rare){ctx.globalAlpha=l.ghost?.8:1;label((l.gold?`${fmt(l.gold)} gold`:ITEMS[l.id].name)+(l.ghost?` · ${l.owner}`:''),l.x,y-12,l.gold?'#ffcf5a':rarityCol(l.id),11);}
  ctx.globalAlpha=1;}
function shade(hex,amt){const n=parseInt(hex.slice(1),16);let r=(n>>16)+amt,g=(n>>8&255)+amt,b=(n&255)+amt;return`rgb(${clamp(r,0,255)},${clamp(g,0,255)},${clamp(b,0,255)})`;}
function drawMob(m){
  const d=m.d,s=d.size,x=m.x,f=m.face,t=now+m.ph;let y=m.y;
  const flash=now-m.hitF<.12;
  const lunge=m.lunge&&now-m.lunge<.18?Math.sin((now-m.lunge)/.18*Math.PI)*6*f:0;
  const kb=m.kbT&&now-m.kbT<.25?Math.sin((now-m.kbT)/.25*Math.PI)*7:0;
  ctx.save();ctx.translate(lunge+(m.kbX||0)*kb,(m.kbY||0)*kb);
  const col=flash?'#ffffff':d.col, dark=flash?'#ffffff':shade(d.col,-45);
  if(m.slowUntil>now){ctx.globalAlpha=.85;}
  switch(d.shape){
    case 'blob':{shadow(x,y,s);const q=Math.sin(t*(m.moving?10:4))*.08;
      ctx.fillStyle=col;ctx.strokeStyle=dark;ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(x,y-s*.85,s*(1+q),s*(1-q)*.9,0,0,7);ctx.fill();ctx.stroke();
      ctx.fillStyle='rgba(255,255,255,.3)';ctx.beginPath();ctx.ellipse(x-s*.35,y-s*1.25,s*.25,s*.15,-.5,0,7);ctx.fill();
      if(d.leaf){ctx.fillStyle='#4e9a3a';ctx.beginPath();ctx.ellipse(x+3,y-s*1.85,4,8,.6+Math.sin(t*3)*.2,0,7);ctx.fill();}
      if(d.spikes){ctx.fillStyle=dark;for(let k=0;k<7;k++){const a=Math.PI+k*Math.PI/6;const px=x+Math.cos(a)*s,py=y-s*.85+Math.sin(a)*s*.9;ctx.beginPath();ctx.moveTo(px-3,py);ctx.lineTo(px+Math.cos(a)*6,py+Math.sin(a)*6);ctx.lineTo(px+3,py);ctx.fill();}}
      eyes(x,y-s*.85,s,f);break;}
    case 'beast':{shadow(x,y,s*1.1);const b=m.moving?Math.abs(Math.sin(t*12))*3:0;
      ctx.strokeStyle=dark;ctx.lineWidth=3;for(const k of [-.6,.5]){ctx.beginPath();ctx.moveTo(x+k*s,y-s*.5);ctx.lineTo(x+k*s+(m.moving?Math.sin(t*12+k*3)*3:0),y);ctx.stroke();}
      ctx.fillStyle=col;ctx.beginPath();ctx.ellipse(x,y-s*.75-b,s*1.05,s*.65,0,0,7);ctx.fill();
      const hx=x+f*s*.85,hy=y-s*1.2-b;ctx.beginPath();ctx.arc(hx,hy,s*.55,0,7);ctx.fill();
      ctx.fillStyle=dark;ctx.beginPath();ctx.moveTo(hx-4,hy-s*.4);ctx.lineTo(hx-2,hy-s*1.2);ctx.lineTo(hx+2,hy-s*.4);ctx.fill();ctx.beginPath();ctx.moveTo(hx+2,hy-s*.4);ctx.lineTo(hx+6*f,hy-s*1.1);ctx.lineTo(hx+6,hy-s*.3);ctx.fill();
      ctx.fillStyle='#1a1a1a';ctx.beginPath();ctx.arc(hx+f*s*.2,hy-2,2,0,7);ctx.fill();
      ctx.fillStyle=shade(d.col,30);ctx.beginPath();ctx.arc(x-f*s,y-s*.9-b,s*.3,0,7);ctx.fill();break;}
    case 'bug':{shadow(x,y,s*1.1);ctx.strokeStyle='#1a1a1a';ctx.lineWidth=1.5;
      for(let k=-1;k<=1;k++){const w=m.moving?Math.sin(t*16+k)*2:0;ctx.beginPath();ctx.moveTo(x+k*s*.5,y-s*.5);ctx.lineTo(x+k*s*.6-s*.9,y+w);ctx.moveTo(x+k*s*.5,y-s*.5);ctx.lineTo(x+k*s*.6+s*.9,y-w);ctx.stroke();}
      ctx.fillStyle=col;ctx.beginPath();ctx.ellipse(x,y-s*.6,s,s*.7,0,0,7);ctx.fill();ctx.strokeStyle=dark;ctx.lineWidth=2;ctx.stroke();
      ctx.beginPath();ctx.moveTo(x,y-s*1.25);ctx.lineTo(x,y+0);ctx.stroke();
      ctx.fillStyle='rgba(255,255,255,.25)';ctx.beginPath();ctx.ellipse(x-s*.4,y-s*.9,s*.25,s*.12,-.4,0,7);ctx.fill();
      ctx.fillStyle=dark;ctx.beginPath();ctx.arc(x+f*s*.95,y-s*.6,s*.38,0,7);ctx.fill();
      ctx.strokeStyle='#1a1a1a';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x+f*s*1.2,y-s*.8);ctx.lineTo(x+f*s*1.6,y-s*1.4);ctx.stroke();
      ctx.fillStyle='#ffdf6a';ctx.beginPath();ctx.arc(x+f*s*1.1,y-s*.7,1.8,0,7);ctx.fill();break;}
    case 'mushroom':{shadow(x,y,s);const q=Math.sin(t*(m.moving?10:3))*1.5;
      ctx.fillStyle='#efe2c8';ctx.beginPath();ctx.roundRect(x-s*.45,y-s*1.1,s*.9,s*1.1,4);ctx.fill();eyes(x,y-s*.55,s*.8,f);
      ctx.fillStyle=col;ctx.beginPath();ctx.ellipse(x,y-s*1.15+q,s*1.15,s*.75,0,Math.PI,0);ctx.fill();
      ctx.fillStyle='#fff3e0';for(const [a,b,r] of [[-.5,-.45,.18],[.3,-.6,.14],[.6,-.3,.12],[-.1,-.2,.1]]){ctx.beginPath();ctx.arc(x+a*s,y-s*1.15+b*s+q,r*s,0,7);ctx.fill();}break;}
    case 'ghost':{const fl=Math.sin(t*2.5)*4;y-=8+fl;shadow(x,m.y,s*.8);ctx.globalAlpha*=.85;
      ctx.fillStyle=col;ctx.beginPath();ctx.arc(x,y-s*.9,s,Math.PI,0);
      for(let k=0;k<=4;k++){const px=x+s-k*s*.5;ctx.lineTo(px,y+(k%2?-4:4)+Math.sin(t*6+k)*2);}ctx.closePath();ctx.fill();
      ctx.globalAlpha=1;ctx.fillStyle='#ff7a3a';ctx.shadowColor='#ff7a3a';ctx.shadowBlur=8;ctx.beginPath();ctx.arc(x-s*.3+f*3,y-s,2.5,0,7);ctx.arc(x+s*.3+f*3,y-s,2.5,0,7);ctx.fill();ctx.shadowBlur=0;break;}
    case 'skeleton':{shadow(x,y,s);ctx.strokeStyle=col;ctx.lineWidth=2.5;ctx.lineCap='round';
      const l=m.moving?Math.sin(t*12)*4:0;ctx.beginPath();ctx.moveTo(x-3,y-10);ctx.lineTo(x-3+l,y);ctx.moveTo(x+3,y-10);ctx.lineTo(x+3-l,y);ctx.stroke();
      ctx.beginPath();ctx.moveTo(x,y-10);ctx.lineTo(x,y-24);ctx.stroke();for(let k=0;k<3;k++){ctx.beginPath();ctx.moveTo(x-6,y-14-k*4);ctx.lineTo(x+6,y-14-k*4);ctx.stroke();}
      ctx.fillStyle=col;ctx.beginPath();ctx.arc(x,y-30,7,0,7);ctx.fill();ctx.fillStyle='#1a1a1a';ctx.beginPath();ctx.arc(x-2.5+f*1.5,y-30,1.8,0,7);ctx.arc(x+2.5+f*1.5,y-30,1.8,0,7);ctx.fill();
      ctx.strokeStyle='#7a5a3a';ctx.lineWidth=2;ctx.beginPath();ctx.arc(x+f*10,y-20,11,-1.3,1.3,f<0);ctx.stroke();break;}
    case 'imp':{const fl=Math.sin(t*5)*3;y-=6+fl;shadow(x,m.y,s*.8);
      ctx.fillStyle=dark;for(const k of [-1,1]){ctx.beginPath();ctx.moveTo(x+k*4,y-s);ctx.lineTo(x+k*(s*1.6+Math.sin(t*14)*3),y-s*1.6);ctx.lineTo(x+k*s*1.2,y-s*.5);ctx.fill();}
      const g=ctx.createRadialGradient(x,y-s,2,x,y-s,s*1.8);g.addColorStop(0,'rgba(255,160,60,.45)');g.addColorStop(1,'rgba(255,100,30,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y-s,s*1.8,0,7);ctx.fill();
      ctx.fillStyle=col;ctx.beginPath();ctx.arc(x,y-s,s,0,7);ctx.fill();
      ctx.fillStyle='#3a1a10';ctx.beginPath();ctx.moveTo(x-6,y-s*1.7);ctx.lineTo(x-3,y-s*2.4);ctx.lineTo(x-1,y-s*1.8);ctx.moveTo(x+6,y-s*1.7);ctx.lineTo(x+3,y-s*2.4);ctx.lineTo(x+1,y-s*1.8);ctx.fill();
      eyes(x,y-s*1.05,s,f,'#ffe36a','#3a1a10');break;}
    case 'golem':{shadow(x,y,s*1.1);const br=Math.sin(t*2)*1.5;
      ctx.fillStyle=dark;ctx.fillRect(x-s*.7,y-s*.6,s*.45,s*.6);ctx.fillRect(x+s*.25,y-s*.6,s*.45,s*.6);
      ctx.fillStyle=col;ctx.beginPath();ctx.roundRect(x-s,y-s*2.1+br,s*2,s*1.6,8);ctx.fill();
      ctx.beginPath();ctx.roundRect(x-s*1.45,y-s*1.9+br,s*.5,s*1.1,6);ctx.roundRect(x+s*.95,y-s*1.9+br,s*.5,s*1.1,6);ctx.fill();
      ctx.strokeStyle=`rgba(255,${140+Math.sin(t*4)*40|0},50,.95)`;ctx.lineWidth=2.5;ctx.shadowColor='#ff7a2a';ctx.shadowBlur=10;
      ctx.beginPath();ctx.moveTo(x-s*.6,y-s*1.8);ctx.lineTo(x-s*.2,y-s*1.3);ctx.lineTo(x-s*.4,y-s*.8);ctx.moveTo(x+s*.5,y-s*1.9);ctx.lineTo(x+s*.15,y-s*1.4);ctx.lineTo(x+s*.45,y-s*.9);ctx.stroke();
      ctx.fillStyle='#ffcf5a';ctx.beginPath();ctx.arc(x-s*.3+f*4,y-s*2.4+br,3.5,0,7);ctx.arc(x+s*.3+f*4,y-s*2.4+br,3.5,0,7);ctx.fill();ctx.shadowBlur=0;
      ctx.fillStyle=col;ctx.beginPath();ctx.roundRect(x-s*.6,y-s*2.85+br,s*1.2,s*.8,6);ctx.fill();
      ctx.fillStyle='#ffcf5a';ctx.beginPath();ctx.arc(x-s*.25+f*3,y-s*2.5+br,3,0,7);ctx.arc(x+s*.25+f*3,y-s*2.5+br,3,0,7);ctx.fill();
      ctx.fillStyle='#3a1a10';for(let k=-1;k<=1;k++){ctx.beginPath();ctx.moveTo(x+k*s*.35-5,y-s*2.85+br);ctx.lineTo(x+k*s*.35,y-s*3.3+br);ctx.lineTo(x+k*s*.35+5,y-s*2.85+br);ctx.fill();}
      break;}
  }
  drawMobAil(m,x,s);
  if(m.slowUntil>now){ctx.globalAlpha=.35;ctx.fillStyle='#8fd0f0';ctx.beginPath();ctx.ellipse(x,m.y-s*.8,s*1.1,s,0,0,7);ctx.fill();}
  ctx.globalAlpha=1;ctx.restore();
}
function drawFx(){
  for(const f of fx){if(now<f.t0)continue;const a=(now-f.t0)/f.dur;if(f.o){f.x=f.o===P?P.x:f.o.rx;f.y=f.o===P?P.y:f.o.ry;}const ax=f.k==='lvl'?P.x:f.x,ay=f.k==='lvl'?P.y:f.y;
    ctx.save();const sp=proj(ax,ay);ctx.translate(sp.x-ax,sp.y-ay);
    switch(f.k){
      case 'critburst':ctx.strokeStyle=`rgba(255,226,120,${1-a})`;ctx.lineWidth=3;for(let k=0;k<10;k++){const ang=k/10*Math.PI*2+.3,r1=8+a*18,r2=18+a*40;ctx.beginPath();ctx.moveTo(f.x+Math.cos(ang)*r1,f.y+Math.sin(ang)*r1);ctx.lineTo(f.x+Math.cos(ang)*r2,f.y+Math.sin(ang)*r2);ctx.stroke();}break;
      case 'spark':{ctx.globalAlpha=1-a;ctx.strokeStyle=f.col||'#fff6d0';ctx.lineWidth=2.5;ctx.lineCap='round';
        for(let k=0;k<6;k++){const ang=k/6*Math.PI*2+f.r,r1=4+a*10,r2=10+a*20;ctx.beginPath();ctx.moveTo(f.x+Math.cos(ang)*r1,f.y+Math.sin(ang)*r1*.8);ctx.lineTo(f.x+Math.cos(ang)*r2,f.y+Math.sin(ang)*r2*.8);ctx.stroke();}
        ctx.fillStyle='#fffbe8';ctx.beginPath();ctx.arc(f.x,f.y,7*(1-a)+1,0,7);ctx.fill();ctx.globalAlpha=1;break;}
      case 'ring':ctx.strokeStyle=f.col;ctx.globalAlpha=1-a;ctx.lineWidth=4;ctx.beginPath();ctx.ellipse(f.x,f.y,f.r*(.4+.6*a),f.r*(.4+.6*a)*.6,0,0,7);ctx.stroke();ctx.globalAlpha=1;break;
      case 'nova':ctx.globalAlpha=(1-a)*.6;ctx.fillStyle='#bfe8ff';ctx.beginPath();ctx.ellipse(f.x,f.y,f.r*a,f.r*a*.6,0,0,7);ctx.fill();ctx.globalAlpha=1;
        ctx.fillStyle='#e8f8ff';for(let k=0;k<10;k++){const ang=k/10*Math.PI*2;ctx.fillRect(f.x+Math.cos(ang)*f.r*a-2,f.y+Math.sin(ang)*f.r*a*.6-6,4,10);}break;
      case 'slash':{const s=f.f===-1?-1:1;ctx.save();ctx.translate(f.x,f.y-16);ctx.scale(s,1);ctx.lineCap='round';
        ctx.strokeStyle=`rgba(255,236,190,${(1-a)*.9})`;ctx.lineWidth=7*(1-a)+1;ctx.beginPath();ctx.arc(0,0,20+a*6,-2.2+a*1.2,-.2+a*1.2);ctx.stroke();
        ctx.strokeStyle=`rgba(255,255,255,${1-a})`;ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,17+a*6,-2+a*1.2,-.4+a*1.2);ctx.stroke();ctx.restore();break;}
      case 'impact':{ctx.fillStyle=`rgba(255,255,255,${(1-a)*.95})`;ctx.beginPath();for(let k=0;k<16;k++){const r=k%2?3+a*5:8+a*20,an=k/16*Math.PI*2+.2;ctx.lineTo(f.x+Math.cos(an)*r,f.y+Math.sin(an)*r*.8);}ctx.closePath();ctx.fill();
        ctx.strokeStyle=`rgba(255,220,150,${(1-a)*.8})`;ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(f.x,f.y,10+a*26,(10+a*26)*.6,0,0,7);ctx.stroke();break;}
      case 'bolt':{ctx.strokeStyle=`rgba(220,200,255,${1-a})`;ctx.lineWidth=3;ctx.shadowColor='#c8b0ff';ctx.shadowBlur=12;ctx.beginPath();let bx=f.x,by=f.y-200;ctx.moveTo(bx,by);
        for(let k=0;k<6;k++){bx+=rnd(-12,12);by+=33;ctx.lineTo(bx,by);}ctx.stroke();ctx.shadowBlur=0;break;}
      case 'arrowfall':{const y=f.y-90*(1-a);ctx.strokeStyle='#e8dcb0';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(f.x,y-14);ctx.lineTo(f.x,y);ctx.stroke();break;}
      case 'pillar':{const g=ctx.createLinearGradient(f.x,f.y-120,f.x,f.y);g.addColorStop(0,'rgba(255,250,200,0)');g.addColorStop(1,`rgba(255,245,180,${.8*(1-a)})`);ctx.fillStyle=g;ctx.fillRect(f.x-14,f.y-120,28,122);break;}
      case 'heal':for(let k=0;k<6;k++){ctx.fillStyle=`rgba(140,240,150,${1-a})`;const ang=k*1.05+now*3;ctx.fillRect(f.x+Math.cos(ang)*14-2,f.y-10-a*30-k*3,4,4);}break;
      case 'poof':for(let k=0;k<8;k++){const ang=k/8*Math.PI*2;ctx.fillStyle=f.col;ctx.globalAlpha=1-a;ctx.beginPath();ctx.arc(f.x+Math.cos(ang)*a*24,f.y-10+Math.sin(ang)*a*16,4*(1-a)+1,0,7);ctx.fill();}ctx.globalAlpha=1;break;
      case 'lvpillar':{const fade=a<.12?a/.12:a>.7?(1-a)/.3:1,H=460,w=20+Math.sin(now*14)*3;
        // a warm halo first (normal blending, so it shows on bright ground), then the light itself
        const h=ctx.createLinearGradient(0,f.y-H,0,f.y);h.addColorStop(0,'rgba(255,190,60,0)');h.addColorStop(.5,`rgba(255,190,60,${.22*fade})`);h.addColorStop(1,`rgba(255,170,40,${.45*fade})`);
        ctx.fillStyle=h;ctx.fillRect(f.x-w*1.8,f.y-H,w*3.6,H);ctx.globalCompositeOperation='lighter';
        const g=ctx.createLinearGradient(0,f.y-H,0,f.y);g.addColorStop(0,'rgba(255,230,140,0)');g.addColorStop(.45,`rgba(255,215,110,${.38*fade})`);g.addColorStop(1,`rgba(255,240,190,${.55*fade})`);
        ctx.fillStyle=g;ctx.fillRect(f.x-w,f.y-H,w*2,H);ctx.fillStyle=`rgba(255,255,235,${.35*fade})`;ctx.fillRect(f.x-w*.25,f.y-H,w*.5,H-34);
        ctx.strokeStyle=`rgba(255,220,120,${.8*fade})`;ctx.lineWidth=2.5;ctx.beginPath();ctx.ellipse(f.x,f.y,26+a*30,(26+a*30)*.5,0,0,7);ctx.stroke();
        for(let k=0;k<14;k++){const ph=(k*.137+(now-f.t0)*.55)%1,sx=f.x+Math.sin(k*2.3+now*3)*(w+6),sy=f.y-ph*H;ctx.fillStyle=`rgba(255,240,170,${fade*(1-ph)})`;ctx.beginPath();ctx.arc(sx,sy,1.6+(k%3)*.7,0,7);ctx.fill();}
        ctx.globalCompositeOperation='source-over';break;}
      case 'beam':{const g=ctx.createLinearGradient(0,f.y-240,0,f.y);g.addColorStop(0,'rgba(255,210,90,0)');g.addColorStop(1,`rgba(255,210,90,${.7*(1-a)})`);ctx.fillStyle=g;ctx.fillRect(f.x-10,f.y-240,20,242);break;}
      case 'lvl':{ctx.strokeStyle=f.col||'#ffcf5a';ctx.globalAlpha=1-a;ctx.lineWidth=3;for(let k=0;k<2;k++){const r=20+a*50+k*12;ctx.beginPath();ctx.ellipse(P.x,P.y,r,r*.5,0,0,7);ctx.stroke();}
        label(f.txt,P.x,P.y-60-a*20,f.col||'#ffcf5a',22);ctx.globalAlpha=1;break;}
    }
    ctx.restore();}
}
const mctx=$('#mini').getContext('2d');
function renderMini(){
  if(!Z)return;const w=mctx.canvas.width;
  // the minimap takes the region's own shape, so the map always fills its border
  {const want=Math.round(w*Z.h/Z.w);if(mctx.canvas.height!==want)mctx.canvas.height=want;}const h=mctx.canvas.height;mctx.fillStyle='#0b0e13';mctx.fillRect(0,0,w,h);
  const sc=Math.min(w/Z.w,h/Z.h),ox=(w-Z.w*sc)/2,oy=(h-Z.h*sc)/2;mctx.imageSmoothingEnabled=false;mctx.drawImage(Z.mini,ox,oy,Z.w*sc,Z.h*sc);
  const k=sc/TILE;
  for(const pt of Z.portals){mctx.fillStyle='#8ff0ff';mctx.fillRect(ox+pt.x*k-2,oy+pt.y*k-2,4,4);}
  for(const n of Z.npcs){mctx.fillStyle='#ffcf5a';mctx.fillRect(ox+n.x*k-1.5,oy+n.y*k-1.5,3,3);}
  for(const m of mobs)if(!m.dead){mctx.fillStyle=m.d.boss?'#ff5a3a':'#e05050';const s=m.d.boss?5:2;mctx.fillRect(ox+m.x*k-s/2,oy+m.y*k-s/2,s,s);}
  for(const [peer,o] of NET.others)if(o.z===zoneId&&!o.dead){mctx.fillStyle=inParty(peer)?'#8fe0a8':'#9fd3ff';mctx.fillRect(ox+o.x*k-1.5,oy+o.y*k-1.5,3,3);}
  mctx.fillStyle='#fff';mctx.fillRect(ox+P.x*k-2,oy+P.y*k-2,4,4);
  if(typeof miniLabels==='function')miniLabels(ox,oy,k);
}

