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

/* ---- danger warning: below 25% HP the screen edge glows red and a heartbeat plays ---- */
let dangerEl=null,heartT=0;
function dangerTick(){if(!P||!S)return;
  if(!dangerEl){dangerEl=document.createElement('div');dangerEl.id='danger';dangerEl.setAttribute('aria-hidden','true');document.body.appendChild(dangerEl);}
  const f=P.hp/Math.max(1,S.maxhp),on=running&&!P.dead&&f<.25&&!Z.D.safe;
  // only the opacity changes (cheap: no repaint of the whole screen); a gentle pulse, stronger as HP drops
  const op=on?((.45+.55*(1-f/.25))*(REDUCED_MOTION.matches?1:.8+.2*Math.sin(now*7))).toFixed(2):'0';
  if(dangerEl._op!==op){dangerEl._op=op;dangerEl.style.opacity=op;}if(dangerEl.classList.contains('on')!==on)dangerEl.classList.toggle('on',on);
  if(on){
    if(now>=heartT&&AU.ctx&&AU.sfx&&typeof tone==='function'){heartT=now+(f<.1?.6:.9);const t=AU.ctx.currentTime;
      tone({f:62,f2:40,dur:.12,vol:.5,t});tone({f:55,f2:36,dur:.12,vol:.38,t:t+.17});}}}
const _updateHudD=updateHud;
updateHud=function(){_updateHudD.apply(this,arguments);try{dangerTick();}catch(e){}};

/* ---- tell the server right away when the game goes to the background (frames stop, so the usual
   presence update would not go out); the server's monsters leave a backgrounded player alone ---- */
document.addEventListener('visibilitychange',()=>{if(!running||!P||typeof netTick!=='function'||!NET.room)return;
  try{NET.sendT=0;NET.lastSent='';netTick(0);}catch(e){}});
