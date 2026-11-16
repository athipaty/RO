"use strict";
/* ================= Auto-hit: fight right here, skills first =================
   A round button next to Auto. Tap it and the hero fights the monster you picked (or the nearest one), using the
   same skill rules as auto-hunt (heals, buffs, attack skills from the hotbar, then normal hits; the Skills switch on
   the Auto card applies) and drinking tonics below 40% HP. When that monster falls it takes the next one that is
   already close (AUTOHIT.r px). It never walks off looking for more and does not pick up loot.
   It stops by itself when nothing is near, when you walk (tap the ground, joystick or keys), on death, in a safe
   zone, or when auto-hunt is turned on. Tap the button again to stop. Not saved: every session starts with it off. */
const AUTOHIT={r:200,since:0,t:0};
function setAutoHit(on,why){if(!P)return;on=!!on;const was=!!P.autoHit;P.autoHit=on;const b=document.getElementById('ahitBtn');if(b){b.classList.toggle('on',on);b.setAttribute('aria-pressed',String(on));}
  if(on===was)return;
  if(on){AUTOHIT.since=now;P.sitting=false;if(P.auto){P.auto=false;const ab=document.getElementById('autoBtn');if(ab)ab.classList.remove('on');}
    addLog('Auto-hit on: you fight the monsters around you, skills first. Walk or tap Hit again to stop.','l-good');}
  else addLog(why||'Auto-hit off.','l-sys');}
function autoHitNearest(){let best=null,bd=AUTOHIT.r;for(const m of mobs)if(!m.dead&&!m.dying){const d=dist(m,P);if(d<bd){bd=d;best=m;}}return best;}
function autoHitTick(){
  if(!P||!P.autoHit)return;
  if(P.auto){setAutoHit(false,'Auto-hit off: auto-hunt took over.');return;}
  if(P.dead||!Z||Z.D.safe){setAutoHit(false,P.dead?'Auto-hit off: you fell.':'Auto-hit off.');return;}
  // you walked yourself: a tap on the ground (or the minimap), the joystick, or the movement keys
  const walked=(typeof clickMark!=='undefined'&&clickMark&&clickMark.t>AUTOHIT.since)||(typeof JOY!=='undefined'&&JOY.on&&JOY.dragging)||(!P.target&&P.moving&&!P.path.length);
  if(walked){setAutoHit(false,'Auto-hit off: you moved.');return;}
  // tonics below 40% HP, like auto-hunt (heal skills come first through the skill rules)
  const f=P.hp/S.maxhp;if(f<.4&&(P.cd.pot_hp||0)<=now){const pot=invFind('orange')?'orange':invFind('red')?'red':null;if(pot)useItem(pot);}
  const t=P.target;
  if(!t||t.dead||t.dying){const m=autoHitNearest();
    if(m){P.target=m;P.queued=null;P.holdPos=false;P.npcGoal=null;P.lootGoal=null;}
    else if(!P.casting&&now>AUTOHIT.t){setAutoHit(false,'Auto-hit off: no monsters nearby.');}}
  else AUTOHIT.t=now+.6; // a short grace after a kill so the next monster can step closer
}
{const _ahH=autoHunt;autoHunt=function(){const r=_ahH.apply(this,arguments);try{autoHitTick();}catch(e){}return r;};}

// the button: beside Auto on phones (top row upright, right side sideways) and on a computer
(()=>{const b=document.createElement('button');b.type='button';b.className='act';b.id='ahitBtn';b.setAttribute('aria-pressed','false');
  b.setAttribute('aria-label','Auto-hit: fight the monsters around you, skills first');b.title='Auto-hit: fight here, skills first (tap again to stop)';
  b.innerHTML='<svg class="aic" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="7"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/><path d="M13 8.5l-2.5 4h3l-2.5 4"/></svg><span class="atx">Hit</span>';
  b.addEventListener('click',ev=>{ev.stopPropagation();if(!P||!running)return;sfx('click');
    if(P.autoHit){setAutoHit(false);return;}
    if(Z&&Z.D.safe){floatT(P.x,P.y-50,'No monsters here','#ffe7a0',13);return;}
    // start on the monster you picked, or the nearest one close by
    const t=P.target&&!P.target.dead&&!P.target.dying?P.target:autoHitNearest();
    if(!t){floatT(P.x,P.y-50,'No monster nearby','#ffe7a0',13);addLog('Auto-hit needs a monster close by. Walk up to one first.','l-sys');return;}
    P.target=t;P.queued=null;P.path=[];setAutoHit(true);});
  /* right after Auto, or after Ride when Ride sits beside Auto (upright phones keep Ride straight under Auto) */
  const place=()=>{const auto=document.getElementById('autoBtn');if(!auto||!auto.parentElement)return;const ride=document.getElementById('rideBtn');
    const prev=ride&&ride.parentElement===auto.parentElement&&ride.previousElementSibling===auto?ride:auto;
    if(b.parentElement!==prev.parentElement||b.previousElementSibling!==prev)prev.insertAdjacentElement('afterend',b);};
  place();setInterval(()=>{place();const on=!!(P&&P.autoHit);if(b.classList.contains('on')!==on)b.classList.toggle('on',on);},400);})();

if(typeof TH!=='undefined')Object.assign(TH,{'Hit':'ตี','Auto-hit: fight the monsters around you, skills first':'ตีอัตโนมัติ: สู้กับมอนสเตอร์รอบตัว ใช้สกิลก่อน',
  'Auto-hit: fight here, skills first (tap again to stop)':'ตีอัตโนมัติ: สู้ตรงนี้ ใช้สกิลก่อน (แตะอีกครั้งเพื่อหยุด)',
  'Auto-hit on: you fight the monsters around you, skills first. Walk or tap Hit again to stop.':'เปิดตีอัตโนมัติ: สู้กับมอนสเตอร์รอบตัว ใช้สกิลก่อน เดินหรือแตะ ตี อีกครั้งเพื่อหยุด',
  'Auto-hit off.':'ปิดตีอัตโนมัติ','Auto-hit off: auto-hunt took over.':'ปิดตีอัตโนมัติ: เปลี่ยนเป็นล่าอัตโนมัติ','Auto-hit off: you fell.':'ปิดตีอัตโนมัติ: คุณล้มลง',
  'Auto-hit off: you moved.':'ปิดตีอัตโนมัติ: คุณเดินออกไป','Auto-hit off: no monsters nearby.':'ปิดตีอัตโนมัติ: ไม่มีมอนสเตอร์ใกล้ ๆ',
  'No monsters here':'ไม่มีมอนสเตอร์ที่นี่','No monster nearby':'ไม่มีมอนสเตอร์ใกล้ ๆ','Auto-hit needs a monster close by. Walk up to one first.':'ตีอัตโนมัติต้องมีมอนสเตอร์อยู่ใกล้ ๆ เดินเข้าไปใกล้ก่อน'});
