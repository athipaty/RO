"use strict";
/* ================= chat on a phone (v1.73.0) =================
   On a phone the chat was a small faded box under the skill buttons, its tabs cut off and the messages small grey
   text; there was no quick way to answer and nothing said someone had written. Now, on a phone:
     - opening the chat (💬, or a tap on the chat box) turns it into a sheet along the bottom: the messages large and
       bright, the tab row scrolling sideways, the field and Send under it, the whole sheet sitting just above the
       keyboard (it follows the visible part of the screen). Upright it is the full width; sideways the left 60%.
     - quick replies over the field send at a tap: Party? · Thanks! · Help! · Boss here! · On my way · GG (in Thai too)
     - while the chat is closed, new messages from players (chat, party, whisper, guild, room) put a count on 💬
   Desktop is unchanged. */
const PCHAT={unread:0,open:false};
const PCHAT_QUICK=[['Party?','ปาร์ตี้ไหม?'],['Thanks!','ขอบคุณ!'],['Help!','ช่วยด้วย!'],['Boss here!','บอสอยู่นี่!'],['On my way','กำลังไป'],['GG','GG']];
const pchatPhone=()=>document.body.classList.contains('touchui');
function pchatKb(){const v=window.visualViewport;if(!v)return;const kb=Math.max(0,Math.round(innerHeight-(v.height+v.offsetTop)));document.documentElement.style.setProperty('--pckb',kb+'px');}
if(window.visualViewport){visualViewport.addEventListener('resize',pchatKb);visualViewport.addEventListener('scroll',pchatKb);}
function pchatQuickRow(){const cb=document.getElementById('chatbar');if(!cb||document.getElementById('quickSay'))return;
  const row=document.createElement('div');row.id='quickSay';row.setAttribute('aria-label','Quick replies');
  for(const [en,th] of PCHAT_QUICK){const b=document.createElement('button');b.type='button';b.className='qs';b.textContent=(typeof LANG!=='undefined'&&LANG==='th')?th:en;
    b.addEventListener('pointerdown',ev=>ev.preventDefault()); // keep the keyboard where it is
    b.addEventListener('click',ev=>{ev.preventDefault();ev.stopPropagation();if(typeof sendChat==='function')sendChat(b.textContent);const i=document.getElementById('chatIn');if(i)i.focus();});row.appendChild(b);}
  cb.insertBefore(row,cb.firstChild);}
function pchatBadge(){const b=document.getElementById('logSay');if(!b)return;let n=b.querySelector('.pcn');
  if(!PCHAT.unread){if(n)n.remove();return;}if(!n){n=document.createElement('span');n.className='pcn';b.appendChild(n);}n.textContent=PCHAT.unread>9?'9+':String(PCHAT.unread);}
if(typeof openChat==='function'){const _ocPC=openChat;openChat=function(){const r=_ocPC.apply(this,arguments);
  try{if(pchatPhone()){pchatQuickRow();pchatKb();document.body.classList.add('chatopen');PCHAT.open=true;PCHAT.unread=0;pchatBadge();const lg=document.getElementById('log');if(lg)lg.scrollTop=lg.scrollHeight;}}catch(e){}return r;};}
if(typeof closeChat==='function'){const _ccPC=closeChat;closeChat=function(){const r=_ccPC.apply(this,arguments);
  try{const cb=document.getElementById('chatbar');if(!cb||cb.hidden){document.body.classList.remove('chatopen');PCHAT.open=false;}}catch(e){}return r;};}
// the sheet goes with the chat field, however it closes; a tap on the game closes it on a phone
setInterval(()=>{const cb=document.getElementById('chatbar');if(document.body.classList.contains('chatopen')&&(!cb||cb.hidden)){document.body.classList.remove('chatopen');PCHAT.open=false;}},300);
{const cv=document.getElementById('cv')||document.querySelector('canvas');if(cv)cv.addEventListener('pointerdown',()=>{if(PCHAT.open&&pchatPhone()&&typeof closeChat==='function'){const i=document.getElementById('chatIn');if(i&&i.value)return;closeChat();}},true);}
// count messages from players while the chat is closed
{const lg=document.getElementById('log');if(lg&&window.MutationObserver)new MutationObserver(ms=>{if(PCHAT.open||!pchatPhone())return;let n=0;
  for(const m of ms)for(const d of m.addedNodes)if(d.nodeType===1&&/\bl-(chat|whisper|party|guild|room)\b/.test(d.className)&&!/\bme\b/.test(d.className))n++;
  if(n){PCHAT.unread+=n;pchatBadge();}}).observe(lg,{childList:true});}
{const st=document.createElement('style');st.textContent=`
#quickSay{display:none}
body.chatopen #quickSay{display:flex;gap:6px;overflow-x:auto;scrollbar-width:none;padding:0 0 6px;width:100%;flex:none}body.chatopen #quickSay::-webkit-scrollbar{display:none}
#quickSay .qs{flex:none;border:1px solid rgba(232,194,90,.45);background:rgba(40,34,20,.9);color:#f4e4b8;border-radius:16px;padding:6px 12px;font:600 14px Inter,var(--ui,sans-serif)}
body.chatopen #chatbar{position:fixed!important;left:0!important;right:0!important;width:auto!important;bottom:var(--pckb,0px)!important;transform:none!important;z-index:41;flex-wrap:wrap;
  padding:8px max(10px,env(safe-area-inset-left)) max(8px,env(safe-area-inset-bottom));border-radius:0;background:rgba(10,12,18,.97)}
body.chatopen #log{position:fixed!important;left:0!important;right:0!important;width:auto!important;top:auto!important;bottom:calc(var(--pckb,0px) + 104px)!important;
  height:min(40vh,340px)!important;max-height:none!important;font-size:15px!important;line-height:1.45!important;opacity:1!important;z-index:40;
  background:rgba(10,12,18,.95)!important;border-radius:16px 16px 0 0!important;padding:10px 12px!important;pointer-events:auto!important}
body.chatopen #log>div{opacity:1!important;filter:none!important}
body.chatopen #logTabs{position:sticky;bottom:0;background:rgba(10,12,18,.95);padding-top:6px}
@media (orientation:landscape){body.chatopen #log,body.chatopen #chatbar{right:40%!important}body.chatopen #log{height:min(52vh,260px)!important}}
#logSay{position:relative}#logSay .pcn{position:absolute;top:-6px;right:-6px;min-width:18px;height:18px;padding:0 4px;border-radius:9px;background:#e8463a;color:#fff;font:700 11px/18px Inter,sans-serif;text-align:center;box-shadow:0 0 0 2px rgba(10,12,18,.9)}`;document.head.appendChild(st);}
if(typeof TH!=='undefined')Object.assign(TH,{'Quick replies':'ตอบด่วน'});
