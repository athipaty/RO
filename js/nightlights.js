"use strict";
/* ================= towns at night =================
   After dusk the windows of every town building glow warm yellow and the light spills onto the street (the night
   darkness in js/sky.js gets a soft hole at each lit window). The glow fades in with the darkness, so dusk and dawn
   blend. One glow picture is stamped per window, so it costs almost nothing. */
let NL_GLOW=null;
function nlGlow(){if(NL_GLOW)return NL_GLOW;const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d');
  const gr=g.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,'rgba(255,214,130,.95)');gr.addColorStop(.25,'rgba(255,190,90,.55)');gr.addColorStop(1,'rgba(255,170,60,0)');
  g.fillStyle=gr;g.fillRect(0,0,64,64);return NL_GLOW=c;}
// lit windows of a building, in world-view coordinates (before the camera): front face and right face, two rows of height
function nlWindows(b){if(b._nl)return b._nl;const X0=b.x*TILE,Y0=b.y*TILE,X1=(b.x+b.w)*TILE,Y1=(b.y+b.h)*TILE,A=typeof archiOf==='function'?archiOf(b):null,H=A&&A.h||60,out=[];
  const fr=[.22,.78],rr=[.3,.7];
  for(const f of fr){const p=proj(X0+(X1-X0)*f,Y1);out.push({x:p.x,y:p.y-H*.55});}
  for(const f of rr){const p=proj(X1,Y0+(Y1-Y0)*f);out.push({x:p.x,y:p.y-H*.55});}
  const d=proj((X0+X1)/2,Y1);out.push({x:d.x,y:d.y-14,door:1});return b._nl=out;}
function nightLevel(){if(!Z||!Z.D.safe||typeof hasSky!=='function'||!hasSky()||typeof darkness!=='function')return 0;return darkness(gameHour());}
// lights for the darkness layer (screen coordinates)
function nightLights(){const k=nightLevel();if(k<=.05)return [];const out=[];
  for(const b of Z.buildings)for(const w of nlWindows(b)){const x=w.x-camX,y=w.y-camY;if(x>-80&&x<VW+80&&y>-80&&y<VH+80)out.push({x,y:y+(w.door?10:18),r:w.door?70:55});}return out;}
{const _rNL=render;render=function(){const r=_rNL.apply(this,arguments);try{const k=nightLevel();if(k<=.05||!P)return r;
    ctx.save();ctx.setTransform(DPR,0,0,DPR,0,0);ctx.globalCompositeOperation='lighter';const g=nlGlow();
    for(const b of Z.buildings)for(const w of nlWindows(b)){const x=w.x-camX,y=w.y-camY;if(x<-60||x>VW+60||y<-60||y>VH+60)continue;
      const flick=.85+.15*Math.sin(now*2.3+w.x*.07),s=(w.door?46:34)*flick;ctx.globalAlpha=k*(w.door?.55:.7);ctx.drawImage(g,x-s/2,y-s/2,s,s);}
    ctx.restore();}catch(e){}return r;};}
