"use strict";
/* ================= smooth play =================
   1. Automatic performance mode: if the game keeps running slowly (under ~30 frames a second for a few
      seconds), it switches to Performance mode by itself (lower drawing resolution) and says so. Turning
      Performance mode off in Settings afterwards is respected: it will not switch on again by itself.
   2. Freeze guard: when the game freezes for more than half a second (switching tabs or apps, a slow phone,
      a hiccup), the monster hits that piled up meanwhile land at half damage for the next 2 seconds and
      cannot knock you out: the worst they do is leave you at 1 HP. Freezes are not your fault. */
const SMOOTH={samples:[],guardUntil:0,lastTs:0,saved:false};

/* ---- watch the frame rate ---- */
function smoothFrame(ts){const gap=SMOOTH.lastTs?ts-SMOOTH.lastTs:16;SMOOTH.lastTs=ts;
  if(gap>500&&running&&P&&!P.dead){SMOOTH.guardUntil=now+2;SMOOTH.saved=false;}
  // average frame time over the last ~4 s (ignoring single big freezes, which say nothing about speed)
  if(gap<400){SMOOTH.samples.push(gap);if(SMOOTH.samples.length>240)SMOOTH.samples.shift();}
  if(running&&!window.LITE&&!SETS.liteUser&&SMOOTH.samples.length>=240&&!document.hidden){
    const avg=SMOOTH.samples.reduce((a,b)=>a+b,0)/SMOOTH.samples.length;
    if(avg>33){SETS.lite=true;SETS.liteAuto=true;saveSets();applySets();SMOOTH.samples=[];
      addLog('The game was running slowly, so Performance mode is now on for smoother play. You can change it in Settings.','l-sys');}}
  requestAnimationFrame(smoothFrame);}
requestAnimationFrame(smoothFrame);
document.addEventListener('visibilitychange',()=>{if(!document.hidden){SMOOTH.lastTs=0;if(running&&P&&!P.dead)SMOOTH.guardUntil=now+2;SMOOTH.saved=false;SMOOTH.samples=[];}});
// switching Performance mode by hand in Settings: never switch it back on automatically
const _setliteAct=PANEL_ACTS.setlite;
if(_setliteAct)PANEL_ACTS.setlite=function(){const r=_setliteAct.apply(this,arguments);SETS.liteUser=true;SETS.liteAuto=false;saveSets();return r;};

/* ---- freeze guard on monster hits ---- */
function freezeGuarded(){return now<SMOOTH.guardUntil;}
let guardHit=false;
const _mobAttackS=mobAttack;
mobAttack=function(m){if(!freezeGuarded())return _mobAttackS.apply(this,arguments);guardHit=true;try{return _mobAttackS.apply(this,arguments);}finally{guardHit=false;}};
const _slamLandS=slamLand;
slamLand=function(m){if(!freezeGuarded())return _slamLandS.apply(this,arguments);guardHit=true;try{return _slamLandS.apply(this,arguments);}finally{guardHit=false;}};
const _hurtPlayerS=hurtPlayer;
hurtPlayer=function(dmg,src){
  if(guardHit&&!P.dead){dmg=Math.max(1,Math.round(dmg*.5));
    if(P.hp-dmg<1){dmg=Math.max(0,P.hp-1);if(!SMOOTH.saved){SMOOTH.saved=true;floatT(P.x,P.y-48,'Steady!','#9fe0ff',14);addLog('Your game froze for a moment, so those hits could not knock you out. Get to safety!','l-good');}}
    if(dmg<=0)return;}
  return _hurtPlayerS.call(this,dmg,src);};
