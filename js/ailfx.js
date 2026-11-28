"use strict";
/* ================= ailments show on the character (v1.88.0) =================
   Every ailment is drawn on the hero, so you (and everyone near you) can see it at a glance, not only as a badge:
     Frozen    locked in a clear block of ice, with frost at the feet and a glint running over it
     Stunned   stars and a little spiral circling the head, the body sways dizzily
     Asleep    slumped forward, breathing slowly, with Z z z drifting up
     Poisoned  a green haze, bubbles rising from the body and a toxic puddle underfoot
     Silenced  a sealed speech bubble (… crossed out) by the head and a purple seal ring underfoot
     Blind     dark smoke swirling around the eyes
   A boss curse looks the same, with a thin red edge. Other players see yours: the presence carries a small bit mask
   (al). Drawn around drawPlayer for you and around drawOther for everyone else, so cached crowd pictures never keep
   an ailment baked in. */
const AFX_KEYS=['poison','stun','sleep','freeze','silence','blind'];
const afxMask=()=>{if(!P||!P.ail||typeof ailOn!=='function')return 0;let m=0;AFX_KEYS.forEach((k,i)=>{if(ailOn(k))m|=1<<i;});return m;};
const afxFromMask=m=>AFX_KEYS.filter((k,i)=>m&(1<<i));
const afxCursed=k=>!!(P&&P.curse&&P.curse[k]>now);
// ---------- the pictures (feet at x,y; the body is about 48 tall) ----------
function afxStar(x,y,r,rot,col){ctx.beginPath();for(let i=0;i<10;i++){const a=rot+i*Math.PI/5-Math.PI/2,k=i%2?r*.45:r;ctx.lineTo(x+Math.cos(a)*k,y+Math.sin(a)*k);}ctx.closePath();
  ctx.fillStyle=col;ctx.fill();ctx.lineWidth=1;ctx.strokeStyle='#5a3a08';ctx.stroke();}
const AFX={
  freeze:{front(x,y,f,seed){ctx.save();
      // frost on the ground
      ctx.fillStyle='rgba(220,244,255,.55)';ctx.beginPath();ctx.ellipse(x,y+2,22,7,0,0,7);ctx.fill();
      // the block: a faceted crystal around the whole body
      const pts=[[-17,4],[-21,-14],[-15,-40],[-6,-56],[6,-58],[15,-46],[20,-22],[17,4]].map(([a,b])=>[x+a,y+b]);
      ctx.beginPath();pts.forEach(([a,b],i)=>i?ctx.lineTo(a,b):ctx.moveTo(a,b));ctx.closePath();
      const g=ctx.createLinearGradient(x-20,y-58,x+20,y+4);g.addColorStop(0,'rgba(235,250,255,.62)');g.addColorStop(.5,'rgba(160,215,245,.42)');g.addColorStop(1,'rgba(110,180,230,.55)');
      ctx.fillStyle=g;ctx.fill();ctx.lineJoin='round';ctx.lineWidth=2;ctx.strokeStyle='rgba(60,130,190,.9)';ctx.stroke();ctx.lineWidth=1;ctx.strokeStyle='rgba(255,255,255,.95)';ctx.stroke();
      // facets
      ctx.strokeStyle='rgba(255,255,255,.55)';ctx.lineWidth=.9;ctx.beginPath();
      ctx.moveTo(x-15,y-40);ctx.lineTo(x-3,y-30);ctx.lineTo(x+15,y-46);ctx.moveTo(x-3,y-30);ctx.lineTo(x-6,y+4);ctx.moveTo(x-21,y-14);ctx.lineTo(x-3,y-30);ctx.moveTo(x-3,y-30);ctx.lineTo(x+20,y-22);ctx.stroke();
      // a shine down the left face and a glint that runs over the block
      ctx.fillStyle='rgba(255,255,255,.5)';ctx.beginPath();ctx.moveTo(x-14,y-38);ctx.lineTo(x-9,y-44);ctx.lineTo(x-14,y-8);ctx.lineTo(x-17,y-12);ctx.closePath();ctx.fill();
      const k=((now*.45+seed)%1.6);if(k<1){const gy=y-58+k*62;ctx.globalAlpha=.7*Math.sin(k*Math.PI);ctx.strokeStyle='#ffffff';ctx.lineWidth=2.4;ctx.beginPath();ctx.moveTo(x-18,gy+6);ctx.lineTo(x+18,gy-6);ctx.stroke();ctx.globalAlpha=1;}
      // ice spikes at the base and a twinkle on top
      ctx.fillStyle='rgba(200,236,255,.9)';ctx.strokeStyle='rgba(60,130,190,.9)';ctx.lineWidth=1;
      for(const [a,h,w] of [[-20,12,4],[-12,7,3],[13,9,3.5],[21,13,4]]){ctx.beginPath();ctx.moveTo(x+a-w,y+4);ctx.lineTo(x+a,y+4-h);ctx.lineTo(x+a+w,y+4);ctx.closePath();ctx.fill();ctx.stroke();}
      const tw=.5+.5*Math.sin(now*5+seed);ctx.globalAlpha=tw;ctx.fillStyle='#ffffff';ctx.beginPath();for(let i=0;i<8;i++){const a=i*Math.PI/4,r=i%2?1.2:4.5;ctx.lineTo(x+8+Math.cos(a)*r,y-52+Math.sin(a)*r);}ctx.fill();ctx.globalAlpha=1;
      // cold mist drifting off
      for(let i=0;i<4;i++){const t=(now*.6+i/4+seed)%1;ctx.globalAlpha=.45*(1-t);ctx.fillStyle='#e8f6ff';ctx.beginPath();ctx.arc(x-14+i*9+Math.sin(t*6+i)*2,y-2-t*16,2.5+t*3,0,7);ctx.fill();}
      ctx.restore();}},
  stun:{tilt:(f,seed)=>Math.sin(now*4.2+seed)*.08,
    front(x,y,f,seed){ctx.save();const cy=y-58;
      // a spiral and three stars running round the head (the ones behind are dimmer and smaller)
      ctx.strokeStyle='rgba(255,226,120,.8)';ctx.lineWidth=1.3;ctx.beginPath();for(let i=0;i<26;i++){const a=now*-6+i*.5,r=1+i*.42;ctx.lineTo(x+Math.cos(a)*r,cy-6+Math.sin(a)*r*.5);}ctx.stroke();
      const st=[];for(let i=0;i<3;i++){const a=now*5+seed+i*Math.PI*2/3;st.push([Math.sin(a),a]);}
      st.sort((p,q)=>p[0]-q[0]);for(const [s,a] of st){ctx.globalAlpha=s<0?.6:1;afxStar(x+Math.cos(a)*15,cy+Math.sin(a)*4.5,s<0?3.4:4.6,now*3,'#ffd84a');}
      ctx.restore();}},
  sleep:{tilt:(f,seed)=>.13*f+Math.sin(now*1.6+seed)*.02,drop:2,
    front(x,y,f,seed){ctx.save();ctx.textAlign='center';ctx.textBaseline='middle';
      for(let i=0;i<3;i++){const t=(now*.42+i/3+seed)%1,sz=8+t*7;ctx.globalAlpha=t<.15?t/.15:1-(t-.15)/.85;
        const zx=x+f*(10+t*12)+Math.sin(t*7)*3,zy=y-46-t*26;ctx.font=`900 ${sz.toFixed(1)}px "Alegreya Sans",sans-serif`;
        ctx.lineWidth=3;ctx.strokeStyle='#1a2448';ctx.strokeText('Z',zx,zy);ctx.fillStyle='#cfe0ff';ctx.fillText('Z',zx,zy);}
      // a slow breathing bubble at the nose
      const b=2+2.2*(.5+.5*Math.sin(now*1.6+seed));ctx.globalAlpha=.75;ctx.fillStyle='rgba(200,225,255,.55)';ctx.strokeStyle='rgba(255,255,255,.9)';ctx.lineWidth=.8;
      ctx.beginPath();ctx.arc(x+f*9,y-33,b,0,7);ctx.fill();ctx.stroke();
      ctx.restore();ctx.textBaseline='alphabetic';}},
  poison:{back(x,y,f,seed){ctx.save();const p=.5+.5*Math.sin(now*2+seed);
      ctx.fillStyle=`rgba(90,190,60,${.28+.12*p})`;ctx.beginPath();ctx.ellipse(x,y+1,19+p*2,6.5,0,0,7);ctx.fill();
      ctx.fillStyle='rgba(60,140,40,.4)';ctx.beginPath();ctx.ellipse(x+6,y+2,6,2.2,0,0,7);ctx.fill();ctx.restore();},
    front(x,y,f,seed){ctx.save();
      const g=ctx.createRadialGradient(x,y-24,4,x,y-24,26);g.addColorStop(0,'rgba(120,220,80,.22)');g.addColorStop(1,'rgba(120,220,80,0)');ctx.fillStyle=g;ctx.fillRect(x-26,y-50,52,52);
      for(let i=0;i<6;i++){const t=(now*.55+i/6+seed*.3)%1,bx=x-12+((i*37)%25)+Math.sin(t*9+i)*2.5,by=y-6-t*50,r=1.6+((i*3)%3)*.8+t*1.2;
        ctx.globalAlpha=t<.1?t*10:1-t;ctx.fillStyle='#8fe060';ctx.strokeStyle='#2f6a1a';ctx.lineWidth=.9;ctx.beginPath();ctx.arc(bx,by,r,0,7);ctx.fill();ctx.stroke();
        ctx.fillStyle='rgba(255,255,255,.8)';ctx.beginPath();ctx.arc(bx-r*.35,by-r*.35,r*.35,0,7);ctx.fill();}
      // a little skull bubble now and then
      const t=(now*.3+seed)%1;if(t<.5){ctx.globalAlpha=Math.sin(t*2*Math.PI);ctx.font='800 11px "Alegreya Sans",sans-serif';ctx.textAlign='center';ctx.fillStyle='#b8f090';ctx.fillText('☠',x-f*13,y-48-t*14);}
      ctx.restore();}},
  silence:{back(x,y,f,seed){ctx.save();ctx.translate(x,y+1);ctx.scale(1,.32);ctx.rotate(now*.8+seed);
      ctx.strokeStyle='rgba(197,140,255,.75)';ctx.lineWidth=2.4;ctx.beginPath();ctx.arc(0,0,21,0,7);ctx.stroke();ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(0,0,16,0,7);ctx.stroke();
      ctx.fillStyle='rgba(220,180,255,.9)';for(let i=0;i<6;i++){const a=i*Math.PI/3;ctx.fillRect(Math.cos(a)*18.5-1.4,Math.sin(a)*18.5-1.4,2.8,2.8);}ctx.restore();},
    front(x,y,f,seed){ctx.save();const bx=x+f*17,by=y-52+Math.sin(now*2.2+seed)*1.2;
      ctx.fillStyle='#f6efff';ctx.strokeStyle='#4a2a6a';ctx.lineWidth=1.4;ctx.beginPath();ctx.ellipse(bx,by,10,7,0,0,7);ctx.fill();ctx.stroke();
      ctx.beginPath();ctx.moveTo(bx-f*4,by+5.5);ctx.lineTo(bx-f*9,by+10);ctx.lineTo(bx-f*1,by+6.5);ctx.fillStyle='#f6efff';ctx.fill();ctx.stroke();
      ctx.fillStyle='#6a4a8a';for(const d of [-4,0,4]){ctx.beginPath();ctx.arc(bx+d,by,1.3,0,7);ctx.fill();}
      ctx.strokeStyle='#d0304a';ctx.lineWidth=2.2;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(bx-7,by+5);ctx.lineTo(bx+7,by-5);ctx.stroke();
      ctx.restore();}},
  blind:{front(x,y,f,seed){ctx.save();const ey=y-33;
      for(let i=0;i<7;i++){const a=now*1.8+seed+i*Math.PI*2/7,front=Math.sin(a)>-.2,r=4+((i*5)%3)*1.3+Math.sin(now*3+i)*.8;
        ctx.globalAlpha=front?.82:.5;ctx.fillStyle=i%2?'#2a2630':'#3e3846';ctx.beginPath();ctx.arc(x+Math.cos(a)*12,ey+Math.sin(a)*4,r,0,7);ctx.fill();}
      ctx.globalAlpha=.55;ctx.fillStyle='#16131c';ctx.beginPath();ctx.ellipse(x+f*2,ey,10,3.6,0,0,7);ctx.fill();
      ctx.restore();}}};
// draw one character's ailments around draw(): back layer, the body (tilted), front layer
function afxAround(list,x,y,f,seed,cursed,draw){
  let tilt=0,drop=0;for(const k of list){const a=AFX[k];if(a&&a.tilt)tilt+=a.tilt(f,seed);if(a&&a.drop)drop=Math.max(drop,a.drop);}
  for(const k of list)if(AFX[k]&&AFX[k].back)try{AFX[k].back(x,y,f,seed);}catch(e){}
  let r;if(tilt||drop){ctx.save();ctx.translate(x,y+drop);ctx.rotate(tilt);ctx.translate(-x,-y);try{r=draw();}finally{ctx.restore();}}else r=draw();
  for(const k of list)if(AFX[k]&&AFX[k].front)try{AFX[k].front(x,y,f,seed);}catch(e){}
  if(cursed){ctx.save();ctx.globalAlpha=.35+.2*Math.sin(now*4);ctx.strokeStyle='#ff3a3a';ctx.lineWidth=1.5;ctx.setLineDash([3,3]);ctx.beginPath();ctx.ellipse(x,y+1,24,8,0,0,7);ctx.stroke();ctx.restore();}
  return r;}
// you
{const _dpAF=drawPlayer;drawPlayer=function(p,wid){
  if(p!==P||P.dead||!P.ail)return _dpAF.apply(this,arguments);
  const list=AFX_KEYS.filter(k=>ailOn(k));if(!list.length)return _dpAF.apply(this,arguments);
  const args=arguments,self=this;return afxAround(list,P.x,P.y,P.face||1,0,list.some(afxCursed),()=>_dpAF.apply(self,args));};}
// everyone else
{const _doAF=drawOther;drawOther=function(o){
  if(!o||!o.al||o.dead)return _doAF.apply(this,arguments);const list=afxFromMask(o.al);if(!list.length)return _doAF.apply(this,arguments);
  const args=arguments,self=this,seed=((o.peer||'').length*1.7)%6;return afxAround(list,o.rx,o.ry,o.face||1,seed,false,()=>_doAF.apply(self,args));};}
