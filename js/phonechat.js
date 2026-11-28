"use strict";
/* ================= chat on a phone (v1.73.0) =================
   On a phone the chat was a small faded box under the skill buttons, its tabs cut off and the messages small grey
   text; there was no quick way to answer and nothing said someone had written. Now, on a phone:
     - opening the chat (💬, or a tap on the chat box) turns it into a sheet along the bottom: the messages large and
       bright, the tab row scrolling sideways, the field and Send under it, the whole sheet sitting just above the
       keyboard (it follows the visible part of the screen). Upright it is the full width; sideways the left 60%.
     - (v1.94.10: removed) quick replies over the field (Party? · Thanks! · Help! ...)
     - while the chat is closed, new messages from players (chat, party, whisper, guild, room) put a count on 💬
   Desktop is unchanged. */
const PCHAT={unread:0,open:false};
const pchatPhone=()=>document.body.classList.contains('touchui');
function pchatKb(){const v=window.visualViewport;if(!v)return;const kb=Math.max(0,Math.round(innerHeight-(v.height+v.offsetTop)));document.documentElement.style.setProperty('--pckb',kb+'px');}
if(window.visualViewport){visualViewport.addEventListener('resize',pchatKb);visualViewport.addEventListener('scroll',pchatKb);}
function pchatBadge(){const b=document.getElementById('logSay');if(!b)return;let n=b.querySelector('.pcn');
  if(!PCHAT.unread){if(n)n.remove();return;}if(!n){n=document.createElement('span');n.className='pcn';b.appendChild(n);}n.textContent=PCHAT.unread>9?'9+':String(PCHAT.unread);}
// (v1.94.11) the open chat sheet keeps its tabs (All, Chat, Party, Whisper, Guild, Room) in a fixed row at the bottom,
// just above the field, instead of floating over the messages; they go back into the log box when the chat closes
function pchatTabsDown(){const t=document.getElementById('logTabs'),cb=document.getElementById('chatbar');if(t&&cb&&t.parentElement!==cb)cb.insertBefore(t,cb.firstChild);}
function pchatTabsUp(){const t=document.getElementById('logTabs'),lg=document.getElementById('log');if(t&&lg&&t.parentElement!==lg)lg.insertBefore(t,lg.firstChild);}
if(typeof openChat==='function'){const _ocPC=openChat;openChat=function(){const r=_ocPC.apply(this,arguments);
  try{if(pchatPhone()){pchatKb();pchatTabsDown();document.body.classList.add('chatopen');PCHAT.open=true;PCHAT.unread=0;pchatBadge();const lg=document.getElementById('log');if(lg)lg.scrollTop=lg.scrollHeight;}}catch(e){}return r;};}
if(typeof closeChat==='function'){const _ccPC=closeChat;closeChat=function(){const r=_ccPC.apply(this,arguments);
  try{const cb=document.getElementById('chatbar');if(!cb||cb.hidden){document.body.classList.remove('chatopen');PCHAT.open=false;pchatTabsUp();}}catch(e){}return r;};}
// the sheet goes with the chat field, however it closes; a tap on the game closes it on a phone
setInterval(()=>{const cb=document.getElementById('chatbar');if(document.body.classList.contains('chatopen')&&(!cb||cb.hidden)){document.body.classList.remove('chatopen');PCHAT.open=false;}if(!document.body.classList.contains('chatopen'))pchatTabsUp();},300);
{const cv=document.getElementById('cv')||document.querySelector('canvas');if(cv)cv.addEventListener('pointerdown',()=>{if(PCHAT.open&&pchatPhone()&&typeof closeChat==='function'){const i=document.getElementById('chatIn');if(i&&i.value)return;closeChat();}},true);}
// count messages from players while the chat is closed
{const lg=document.getElementById('log');if(lg&&window.MutationObserver)new MutationObserver(ms=>{if(PCHAT.open||!pchatPhone())return;let n=0;
  for(const m of ms)for(const d of m.addedNodes)if(d.nodeType===1&&/\bl-(chat|whisper|party|guild|room)\b/.test(d.className)&&!/\bme\b/.test(d.className))n++;
  if(n){PCHAT.unread+=n;pchatBadge();}}).observe(lg,{childList:true});}
{const st=document.createElement('style');st.textContent=`
body.chatopen #chatbar{position:fixed!important;left:0!important;right:0!important;width:auto!important;bottom:var(--pckb,0px)!important;transform:none!important;z-index:41;flex-wrap:wrap;
  padding:8px max(10px,env(safe-area-inset-left)) max(8px,env(safe-area-inset-bottom));border-radius:0;background:rgba(10,12,18,.75)}
body.chatopen #log{position:fixed!important;left:0!important;right:0!important;width:auto!important;top:auto!important;bottom:calc(var(--pckb,0px) + 104px)!important;
  height:min(40vh,340px)!important;max-height:none!important;font-size:15px!important;line-height:1.45!important;opacity:1!important;z-index:40;
  background:rgba(10,12,18,.55)!important;border-radius:16px 16px 0 0!important;padding:10px 12px!important;pointer-events:auto!important}
body.chatopen #log>div{opacity:1!important;filter:none!important;text-shadow:0 1px 2px #000,0 0 4px rgba(0,0,0,.9)} /* (v1.94.9) see-through sheet: the game shows behind, a shadow keeps the text sharp */
body.chatopen #chatbar #logTabs{position:static!important;display:flex;flex-wrap:nowrap;gap:6px;overflow-x:auto;scrollbar-width:none;width:100%;flex:none;padding:0 0 8px;margin:0;background:none}body.chatopen #chatbar #logTabs::-webkit-scrollbar{display:none}
body.chatopen #chatbar #logTabs .btn{flex:none}
@media (orientation:landscape){body.chatopen #log,body.chatopen #chatbar{right:40%!important}body.chatopen #log{height:min(52vh,260px)!important}}
#logSay{position:relative}#logSay .pcn{position:absolute;top:-6px;right:-6px;min-width:18px;height:18px;padding:0 4px;border-radius:9px;background:#e8463a;color:#fff;font:700 11px/18px Inter,sans-serif;text-align:center;box-shadow:0 0 0 2px rgba(10,12,18,.9)}`;document.head.appendChild(st);}
if(typeof TH!=='undefined')Object.assign(TH,{'Quick replies':'ตอบด่วน'});
