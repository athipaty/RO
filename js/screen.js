"use strict";
/* ================= a cleaner game screen =================
   · the chat log fades to see-through after a few quiet seconds and wakes on new chat, hover or a tap
   · a Chat tab shows only what players say (public, party, whisper, guild, room), no system messages
   · the dock's buttons are icon-only with a quick tooltip giving the name and the key */
const LOGFADE={t:0,quiet:7000};
function logWake(){const el=$('#log');if(!el)return;el.classList.remove('idle');LOGFADE.t=Date.now();}
(()=>{const el=$('#log');if(!el)return;
  new MutationObserver(m=>{for(const r of m)for(const n of r.addedNodes)if(n.nodeType===1&&n.id!=='logTabs'){
    // only chat and important lines wake the log; routine system lines just appear quietly
    if(/\bl-(chat|party|whisper|guild|room|rare|bad|lvl)\b/.test(n.className)){logWake();return;}}}).observe(el,{childList:true});
  for(const ev of ['pointerenter','pointerdown','focusin','wheel','touchstart'])el.addEventListener(ev,logWake,{passive:true});
  setInterval(()=>{if(el.matches(':hover')||el.contains(document.activeElement)||(document.getElementById('chatbar')&&!document.getElementById('chatbar').hidden))LOGFADE.t=Date.now();
    if(Date.now()-LOGFADE.t>LOGFADE.quiet&&!el.classList.contains('idle'))el.classList.add('idle');},1000);
  logWake();})();
// the dock: quick tooltips (name and key) instead of slow browser ones
const tipMO=new MutationObserver(m=>{for(const r of m){const b=r.target,t=b.getAttribute('title');if(t){b.dataset.tip=t;b.removeAttribute('title');}}});
for(const b of document.querySelectorAll('#dock .dk,#autoBtn,#autoLootBtn,#muteBtn')){const t=b.getAttribute('title');if(t){b.dataset.tip=t;if(!b.getAttribute('aria-label'))b.setAttribute('aria-label',t);b.removeAttribute('title');}
  tipMO.observe(b,{attributes:true,attributeFilter:['title']});} // the Loot switch updates its own title later
