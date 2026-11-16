"use strict";
/* ================= idle stances on the start screen =================
   Each job family stands its own way in the character preview (like the idle poses of classic 2.5D MMOs), with
   its weapon in hand. Advanced and master callings use their family's stance (baseOf). Uses drawHuman's optional
   stance (foot spread), hands ([front dx,dy],[back dx,dy] from x and the belt line) and a lean around the feet.
   Only the preview uses these; the game itself draws heroes as before. */
const STANCE_WT={novice:'club',warden:'axe',arcanist:'wand',ranger:'bow',cleric:'mace'};
function stanceWeapon(fam){const wt=STANCE_WT[fam]||'club';const id=Object.keys(ITEMS).find(k=>ITEMS[k].wt===wt);return id?ITEMS[id]:null;}
// the pose of each family at time t: lean (radians, + = forward), sway (px sideways), lift (px up), foot spread,
// hands, and the weapon in the front hand (angle 0 = pointing up)
const STANCES={
  novice:t=>({lean:Math.sin(t*1.3)*.015,sway:0,lift:0,stance:0,hands:[[10,-6],[-9,-4]],wpn:{h:0,ang:2.35+Math.sin(t*1.3)*.06}}),
  warden:t=>({lean:.08,sway:0,lift:0,stance:2.6,hands:[[13,-7-Math.sin(t*1.6)*.3],[-8,-6]],wpn:{h:0,ang:.75},shield:true}),
  arcanist:t=>({lean:-.02,sway:0,lift:1+Math.sin(t*1.8)*.5,stance:0,hands:[[10,-13+Math.sin(t*2.4)*.8],[-10,-6]],wpn:{h:0,ang:-.12},glow:true}),
  ranger:t=>({lean:-.04,sway:Math.sin(t*1.1)*.5,lift:0,stance:1.6,hands:[[10,-6],[-5,-10]],wpn:{h:0,ang:0},arrow:true}),
  cleric:t=>({lean:0,sway:0,lift:0,stance:0,hands:[[2.6,-4.5],[-1.2,-4.2]],belt:{dx:-8.5,dy:-5,ang:Math.PI-.3},holy:true})};
function drawStance(cls,look,x,y,face){
  const fam=typeof baseOf==='function'?baseOf(cls):'novice',S=(STANCES[fam]||STANCES.novice)(now),c=CLASSES[cls]||CLASSES.novice,f=face<0?-1:1;
  // holy ring under the cleric's feet, before the hero
  if(S.holy){const p=(Math.sin(now*2)+1)/2;ctx.save();ctx.globalAlpha=.35+p*.3;ctx.strokeStyle='#ffe9a0';ctx.lineWidth=1.2;ctx.beginPath();ctx.ellipse(x,y,13+p*2,4.5+p*.8,0,0,7);ctx.stroke();
    ctx.globalAlpha=.18+p*.12;ctx.fillStyle='#fff3c0';ctx.beginPath();ctx.ellipse(x,y,12,4,0,0,7);ctx.fill();ctx.restore();}
  ctx.save();ctx.translate(x+S.sway,y-S.lift);ctx.rotate(f*S.lean);ctx.translate(-x,-y);
  const by=drawHuman(x,y,c.col,look.hair,f,0,{look,outfit:fam,stance:S.stance,hands:S.hands});
  // the weapon in the front hand
  const w=stanceWeapon(fam);
  if(w&&S.wpn){const h=S.hands[S.wpn.h];ctx.save();ctx.translate(x+f*(h[0]+(S.wpn.dx||0)),by+h[1]);ctx.scale(f,1);ctx.rotate(S.wpn.ang);drawWeaponShape(w,S.wpn.ang);ctx.restore();}
  // or hanging from the belt (the cleric prays with both hands)
  if(w&&S.belt){ctx.save();ctx.translate(x+f*S.belt.dx,by+S.belt.dy);ctx.scale(f,1);ctx.rotate(S.belt.ang);drawWeaponShape(w,S.belt.ang);ctx.restore();}
  // the warden's shield on the back arm
  if(S.shield){const h=S.hands[1];ctx.fillStyle='#9aa0aa';ctx.strokeStyle='#2a1c14';ctx.lineWidth=1.5;ctx.beginPath();ctx.roundRect(x+f*h[0]-5,by+h[1]-7,10,14,3);ctx.fill();ctx.stroke();
    ctx.fillStyle='#e8c25a';ctx.beginPath();ctx.arc(x+f*h[0],by+h[1],2,0,7);ctx.fill();}
  // the ranger holds the next arrow ready
  if(S.arrow){const h=S.hands[1];ctx.strokeStyle='#e8dcb0';ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(x+f*(h[0]-2),by+h[1]+3);ctx.lineTo(x+f*(h[0]+6),by+h[1]-5);ctx.stroke();
    ctx.fillStyle='#c8ccd4';ctx.beginPath();ctx.moveTo(x+f*(h[0]+8),by+h[1]-7);ctx.lineTo(x+f*(h[0]+5),by+h[1]-6);ctx.lineTo(x+f*(h[0]+7),by+h[1]-4);ctx.closePath();ctx.fill();}
  // magic: a glowing wand tip, sparkles circling it, and a soft glow in the open hand
  if(S.glow){const h=S.hands[0],tx=x+f*h[0]+f*Math.sin(-S.wpn.ang)*20,ty=by+h[1]-Math.cos(S.wpn.ang)*20,p=(Math.sin(now*4)+1)/2;
    ctx.save();ctx.globalCompositeOperation='lighter';ctx.fillStyle=`rgba(180,140,255,${.25+p*.25})`;ctx.beginPath();ctx.arc(tx,ty,5+p*2,0,7);ctx.fill();
    for(let i=0;i<3;i++){const a=now*2.6+i*2.09;ctx.fillStyle='rgba(230,210,255,.9)';ctx.beginPath();ctx.arc(tx+Math.cos(a)*7,ty+Math.sin(a)*3.5,1.1,0,7);ctx.fill();}
    const b=S.hands[1];ctx.fillStyle=`rgba(160,200,255,${.2+p*.2})`;ctx.beginPath();ctx.arc(x+f*b[0],by+b[1]-1,3.5+p,0,7);ctx.fill();ctx.restore();}
  ctx.restore();}
