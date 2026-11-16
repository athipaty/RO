"use strict";
/* ================= Auto-hunt: Roam or Stay here =================
   A switch on the Auto card (under the Skills switch). Roam is the classic auto-hunt: the nearest monster anywhere
   around you. Stay here keeps the hero near the spot where auto-hunt was turned on: only monsters and loot within
   AUTOSTAY_R px of it (combat.js autoHunt), and it walks back there when nothing is left, waiting for respawns.
   Both use the same skill rules (autoskill.js) and tonics. Replaces the separate Hit button of v1.8.0. */
const AUTOSTAY={at:null,z:null};
// the spot is taken when auto-hunt turns on (or after a map change while it is on), and forgotten when it turns off
{const _ahSt=autoHunt;autoHunt=function(){
  if(P&&P.auto&&!P.dead){if(!AUTOSTAY.at||AUTOSTAY.z!==zoneId){AUTOSTAY.at={x:P.x,y:P.y};AUTOSTAY.z=zoneId;}}
  else if(P&&!P.auto)AUTOSTAY.at=null;
  return _ahSt.apply(this,arguments);};}

(()=>{const card=document.getElementById('autoPick');if(!card)return;
  const b=document.createElement('button');b.type='button';b.className='apOpt apSt';b.setAttribute('role','switch');
  b.innerHTML='<b class="apI">◎</b><span><b></b><i></i></span>';card.appendChild(b);
  const sync=()=>{const on=!!(P&&P.autoStay);b.classList.toggle('on',on);b.setAttribute('aria-checked',String(on));
    b.querySelector('.apI').textContent=on?'◎':'➶';
    b.querySelector('span b').textContent=on?'Stay here':'Roam';b.querySelector('span i').textContent=on?'Fight around this spot':'Find monsters nearby';
    b.setAttribute('aria-label',on?'Auto-hunt stays here: on':'Auto-hunt stays here: off');};
  // under the Skills switch (which sits under the two pick-up choices)
  const place=()=>{const o=card.querySelector('.apSk')||card.querySelector('.apOpt[data-loot="0"]');if(!o)return;const x=parseFloat(o.style.left),y=parseFloat(o.style.top);if(!isFinite(x)||!isFinite(y))return;
    b.style.left=x+'px';b.style.top=Math.min(innerHeight-31,y+58)+'px';};
  // after the Skills switch has been placed (both watch the same class change)
  new MutationObserver(()=>{if(card.classList.contains('show'))requestAnimationFrame(()=>{place();sync();});}).observe(card,{attributes:true,attributeFilter:['class']});
  b.addEventListener('click',ev=>{ev.stopPropagation();if(!P)return;P.autoStay=!P.autoStay;AUTOSTAY.at=null;sync();sfx('click');
    b.classList.add('picked');setTimeout(()=>b.classList.remove('picked'),300);
    addLog(P.autoStay?'Auto-hunt will stay here and fight around this spot.':'Auto-hunt will roam to find monsters nearby.','l-sys');if(typeof save==='function')save();});
  sync();})();

if(typeof SAVE_EXTRA!=='undefined')SAVE_EXTRA.push('autoStay');
if(typeof TH!=='undefined')Object.assign(TH,{'Stay here':'อยู่ตรงนี้','Roam':'เดินล่า','Fight around this spot':'สู้รอบ ๆ จุดนี้','Find monsters nearby':'หามอนสเตอร์ใกล้ ๆ',
  'Auto-hunt stays here: on':'ล่าอัตโนมัติอยู่ตรงนี้: เปิด','Auto-hunt stays here: off':'ล่าอัตโนมัติอยู่ตรงนี้: ปิด',
  'Auto-hunt will stay here and fight around this spot.':'การล่าอัตโนมัติจะอยู่ตรงนี้และสู้รอบ ๆ จุดนี้','Auto-hunt will roam to find monsters nearby.':'การล่าอัตโนมัติจะเดินหามอนสเตอร์ใกล้ ๆ'});
