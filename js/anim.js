"use strict";
/* ================= #5 more animations: casting, flinching, falling =================
   - Casting: hands raised and a turning rune circle under your feet while a spell charges (others see it too:
     presence field cs = the skill being cast).
   - Hurt: a quick recoil and red flash when you are hit (others see it when your health drops).
   - Defeated: the hero topples over and lies there with a faint wisp, instead of vanishing. */
const CAST_COL={arcanist:'#b8a0ff',cleric:'#ffe7a0',ranger:'#9fe0a0',warden:'#ffb070',novice:'#cfe3ff'};
const castCol=cls=>CAST_COL[typeof baseOf==='function'?baseOf(cls):cls]||'#cfe3ff';

function castCircle(p){const col=castCol(p.cls),t=now*1.6,r=18+Math.sin(now*6)*1.2;
  ctx.save();ctx.globalAlpha=.85;ctx.strokeStyle=col;ctx.lineWidth=1.6;ctx.shadowColor=col;ctx.shadowBlur=8;
  ctx.beginPath();ctx.ellipse(p.x,p.y,r*1.6,r*.8,0,0,7);ctx.stroke();
  ctx.beginPath();ctx.ellipse(p.x,p.y,r*1.15,r*.58,0,0,7);ctx.stroke();
  // little runes turning around the ring
  ctx.fillStyle=col;for(let k=0;k<6;k++){const a=t+k*Math.PI/3,rx=p.x+Math.cos(a)*r*1.38,ry=p.y+Math.sin(a)*r*.69;ctx.fillRect(rx-1.5,ry-1.5,3,3);}
  // motes rising
  for(let k=0;k<4;k++){const ph=(now*.9+k*.25)%1,a=k*1.7+now;ctx.globalAlpha=(1-ph)*.8;ctx.beginPath();ctx.arc(p.x+Math.cos(a)*r,p.y-ph*34,1.6,0,7);ctx.fill();}
  ctx.restore();}

function drawDown(p,wid){const k=clamp((now-(p.deadT||now-1))/.45,0,1),e=1-(1-k)**2,f=p.face<0?-1:1;
  ctx.save();ctx.globalAlpha=.9;ctx.translate(p.x,p.y-2);ctx.rotate(-f*Math.PI/2*.94*e);ctx.translate(-p.x,-p.y);
  _drawPlayerAnim({...p,dead:false,moving:false,sitting:false,swingT:0,lungeT:0,hurtT:0,casting:null},wid);ctx.restore();
  // a faint wisp drifting above
  if(k>=1){const wy=p.y-34-Math.sin(now*1.8)*4,wx=p.x+Math.sin(now*1.3)*3;ctx.save();ctx.globalAlpha=.45+Math.sin(now*3)*.12;
    const g=ctx.createRadialGradient(wx,wy,0,wx,wy,10);g.addColorStop(0,'rgba(255,255,255,.95)');g.addColorStop(1,'rgba(200,220,255,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(wx,wy,10,0,7);ctx.fill();ctx.restore();}}

const _drawPlayerAnim=drawPlayer;
drawPlayer=function(p,wid){
  if(p.dead)return drawDown(p,wid);
  if(p.casting)castCircle(p);
  const h=p.hurtT&&now-p.hurtT<.22?1-(now-p.hurtT)/.22:0;
  if(!h)return _drawPlayerAnim(p,wid);
  // recoil away from the facing side and flash red
  const f=p.face<0?-1:1;ctx.save();ctx.translate(p.x,p.y);ctx.rotate(-f*.14*h);ctx.translate(-p.x-f*2.5*h,-p.y);
  try{ctx.filter=`sepia(${h}) saturate(${1+3*h}) hue-rotate(-40deg) brightness(${1+.25*h})`;}catch(e){}
  try{_drawPlayerAnim(p,wid);}finally{ctx.filter='none';ctx.restore();}};
