"use strict";
/* ================= tell players when a new version is out =================
   Phones keep a page open for a long time (and the Home Screen app does not reload by itself), so players can
   miss updates. Every 5 minutes, and when coming back to the game, ask the site for js/data.js and read its
   VERSION. If it differs from the running one, show a small gold pill at the top: "New version x: tap to update".
   Tapping saves the character, then reloads. Not shown during a boss fight; never on a page opened from a file. */
const UPD={shown:false,last:0,busy:false};
async function updCheck(force){
  if(UPD.busy||UPD.shown||!/^https?:/.test(location.protocol))return;
  const t=Date.now();if(!force&&t-UPD.last<5*60*1000)return;UPD.last=t;UPD.busy=true;
  try{const r=await fetch('js/data.js?v='+t,{cache:'no-store'});if(!r.ok)return;const txt=await r.text();
    const m=/const VERSION='([^']+)'/.exec(txt);if(m&&m[1]!==VERSION)updShow(m[1]);}
  catch(e){}finally{UPD.busy=false;}}
function updShow(v){if(UPD.shown)return;UPD.shown=true;
  const b=document.createElement('button');b.type='button';b.id='updPill';
  b.innerHTML=`<span class="ud">⟳</span><span>${LANG==='th'?'มีเวอร์ชันใหม่':'New version'} ${esc(v)} · <b>${LANG==='th'?'แตะเพื่ออัปเดต':'tap to update'}</b></span>`;
  b.setAttribute('aria-label',(LANG==='th'?'มีเวอร์ชันใหม่ แตะเพื่ออัปเดต':'A new version is out: tap to update')+' ('+v+')');
  b.addEventListener('click',ev=>{ev.stopPropagation();b.disabled=true;try{if(typeof save==='function'&&P)save(true);}catch(e){}
    setTimeout(()=>location.reload(),150);});
  ['pointerdown','pointerup'].forEach(e=>b.addEventListener(e,ev=>ev.stopPropagation()));
  document.body.appendChild(b);requestAnimationFrame(()=>b.classList.add('show'));
  if(typeof addLog==='function')addLog(LANG==='th'?`มี Embervale เวอร์ชันใหม่ (${v}) แตะปุ่มด้านบนเพื่ออัปเดต`:`A new version of Embervale (${v}) is out. Tap the gold button at the top to update.`,'l-rare');}
// keep it out of boss fights: only check when no boss is on you
setInterval(()=>{if(document.hidden||(typeof BS!=='undefined'&&BS.bossOn))return;updCheck(false);},60*1000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)setTimeout(()=>updCheck(true),1500);});
setTimeout(()=>updCheck(true),20000);
