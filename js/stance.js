"use strict";
/* ================= idle stances on the start screen =================
   Each job family stands its own way in the character preview (like the idle poses of classic 2.5D MMOs): just
   the hero, no weapon or effects. Advanced and master callings use their family's stance (baseOf). Uses drawHuman's optional
   stance (foot spread), hands ([front dx,dy],[back dx,dy] from x and the belt line) and a lean around the feet.
   Only the preview uses these; the game itself draws heroes as before. */
// the pose of each family at time t: lean (radians, + = forward), sway (px sideways), lift (px up), foot spread,
// and hand positions
const STANCES={
  novice:t=>({lean:Math.sin(t*1.3)*.015,sway:0,lift:0,stance:0,hands:[[9,-4],[-9,-4]]}),
  warden:t=>({lean:.08,sway:0,lift:0,stance:2.6,hands:[[11.5,-5-Math.sin(t*1.6)*.3],[-11.5,-5]]}),
  arcanist:t=>({lean:-.02,sway:0,lift:1+Math.sin(t*1.8)*.5,stance:0,hands:[[10,-12+Math.sin(t*2.4)*.5],[-10,-6]]}),
  ranger:t=>({lean:-.04,sway:Math.sin(t*1.1)*.5,lift:0,stance:1.6,hands:[[9.5,-4],[-8,-5]]}),
  cleric:t=>({lean:0,sway:0,lift:0,stance:0,hands:[[2.6,-4.5],[-1.2,-4.2]]})};
function drawStance(cls,look,x,y,face){
  const fam=typeof baseOf==='function'?baseOf(cls):'novice',S=(STANCES[fam]||STANCES.novice)(now),c=CLASSES[cls]||CLASSES.novice,f=face<0?-1:1;
  ctx.save();ctx.translate(x+S.sway,y-S.lift);ctx.rotate(f*S.lean);ctx.translate(-x,-y);
  const by=drawHuman(x,y,c.col,look.hair,f,0,{look,outfit:fam,stance:S.stance,hands:S.hands});
  /* no weapon, shield or effects: just the hero (user request); the stance shows the job */
  ctx.restore();}
