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

/* ---- the chat box: fold and open (it grows upward; the newest lines stay at the bottom) ---- */
const LOGUI={big:(()=>{try{return localStorage.getItem('embervale.logBig')==='1';}catch(e){return false;}})(),reading:false,top:0,auto:0};
(()=>{const el=$('#log'),tabs=$('#logTabs');if(!el||!tabs)return;
  const tg=document.createElement('button');tg.type='button';tg.id='logToggle';tg.className='btn small';tabs.insertBefore(tg,tabs.firstChild);
  const jump=document.createElement('button');jump.type='button';jump.id='logJump';jump.className='btn small';jump.textContent='New messages ↓';jump.hidden=true;document.body.appendChild(jump);
  const toBottom=()=>{LOGUI.auto=Date.now();el.scrollTop=el.scrollHeight;LOGUI.reading=false;jump.hidden=true;};
  const place=()=>{const r=el.getBoundingClientRect();jump.style.left=(r.left+r.width/2)+'px';jump.style.bottom=(innerHeight-r.top+6)+'px';};
  const apply=()=>{el.classList.toggle('big',LOGUI.big);tg.textContent=LOGUI.big?'▼':'▲';const t=LOGUI.big?'Make the chat box smaller':'Make the chat box bigger';tg.title=t;tg.setAttribute('aria-label',t);tg.setAttribute('aria-expanded',String(LOGUI.big));toBottom();};
  tg.addEventListener('click',ev=>{ev.stopPropagation();LOGUI.big=!LOGUI.big;try{localStorage.setItem('embervale.logBig',LOGUI.big?'1':'0');}catch(e){}sfx('click');apply();logWake();});
  jump.addEventListener('click',()=>{toBottom();logWake();});
  // reading older lines: new ones do not yank you down; a button takes you back
  el.addEventListener('scroll',()=>{if(Date.now()-LOGUI.auto<120)return;const atEnd=el.scrollTop>=el.scrollHeight-el.clientHeight-24;LOGUI.reading=!atEnd;LOGUI.top=el.scrollTop;if(atEnd)jump.hidden=true;},{passive:true});
  new MutationObserver(m=>{let chat=false;
    for(const r of m)for(const n of r.addedNodes){if(n.nodeType!==1||n.id==='logTabs')continue;
      // unread dot on a tab whose lines the current tab hides
      const k=(/\bl-(party|whisper|guild|room|chat)\b/.exec(n.className)||[])[1];
      if(k){chat=true;const tab=SOC.tab||'all',shown=tab==='all'||tab===k||(tab==='chat'&&k!=='sys');if(!shown){const b=tabs.querySelector(`[data-tab="${k==='chat'?'chat':k}"]`);if(b)b.classList.add('unread');}}}
    if(LOGUI.reading){LOGUI.auto=Date.now();el.scrollTop=LOGUI.top;if(chat){place();jump.hidden=false;}}}).observe(el,{childList:true});
  tabs.addEventListener('click',ev=>{const b=ev.target.closest('[data-tab]');if(b)b.classList.remove('unread');if(b)setTimeout(toBottom,0);});
  // click a player's name to whisper them
  el.addEventListener('click',ev=>{const b=ev.target.closest('.l-chat:not(.me) b, .l-whisper b, .l-party b, .l-guild b, .l-room b');if(!b||!P)return;
    const t=b.textContent.trim();let m=/^\[(?:From|To) ([^\]]+)\]/.exec(t)||/^\[[^\]]+\]\s*([^:]+):/.exec(t);
    let name=(m?m[1]:t).replace(/\s*\(guest\)\s*$/,'').replace(/[:\s]+$/,'').trim();if(!name||name===P.name||/^\[/.test(name))return;
    openChat();const i=$('#chatIn');i.value=`/w ${name} `;i.focus();i.setSelectionRange(i.value.length,i.value.length);});
  apply();})();
