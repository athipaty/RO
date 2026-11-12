"use strict";
/* ================= tidy screen layout =================
   Desktop: one dock of icon buttons at the bottom right (windows, auto-hunt, sound); the round touch buttons are hidden.
   Phone: the dock is a menu sheet behind a ☰ button; the round buttons are just Attack, Auto, Sit, Chat and ☰. */
const isTouchUI=()=>window.matchMedia('(pointer:coarse)').matches||window.innerWidth<=760;
function placeControls(){const touch=isTouchUI(),dock=$('#dock'),acts=$('#actions');document.body.classList.toggle('touchui',touch);
  // auto-hunt and sound live in the dock on desktop, with the round buttons on a phone
  const into=touch?acts:$('#dockExtra');for(const id of ['autoBtn','autoLootBtn','muteBtn']){const b=$('#'+id);const to=touch&&id==='autoLootBtn'?$('#dockExtra'):into;if(b&&b.parentElement!==to){if(touch&&id==='autoBtn')acts.insertBefore(b,$('#chatBtn'));else to.appendChild(b);}}
  if(!touch)dock.classList.remove('open');
  const hb=$('#hotbar');if(touch&&hb.parentElement!==acts)acts.insertBefore(hb,$('#atkBtn'));else if(!touch&&hb.parentElement===acts)document.body.insertBefore(hb,acts);}
$('#menuBtn').addEventListener('click',ev=>{ev.stopPropagation();sfx('click');const d=$('#dock');d.classList.toggle('open');$('#menuBtn').setAttribute('aria-expanded',String(d.classList.contains('open')));});
// picking something from the phone menu closes it; so does tapping the game
$('#dock').addEventListener('click',ev=>{if(ev.target.closest('button')&&isTouchUI()&&ev.target.closest('#menu'))$('#dock').classList.remove('open');});
document.addEventListener('pointerdown',ev=>{const d=$('#dock');if(d.classList.contains('open')&&!d.contains(ev.target)&&ev.target.id!=='menuBtn')d.classList.remove('open');});
$('#mSound').addEventListener('click',()=>$('#muteBtn').click());
window.addEventListener('resize',placeControls);placeControls();
// a phone starts with the status box folded (until the player chooses)
try{if(localStorage.getItem('embervale.hudMini')===null&&window.innerWidth<=760)hudMini(true,true);}catch(e){}
