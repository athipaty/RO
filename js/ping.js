"use strict";
/* ================= connection (ping) for you and everyone else (v1.19.3) =================
   Every 3 seconds the game sends the server a tiny 'pingc' and times the answer. Your ping shows on the online badge;
   it also rides along in your presence (pg, rounded to 10 ms) so others see a coloured dot by your name, in the party
   box and in the who-is-online list. Green under 100 ms, yellow under 200 ms, red above. A server without the ping
   answer (or the public-broker backup) shows nothing. Loaded after js/net.js and js/social.js. */
const PING={every:3000,timeout:4000,fails:0};
const pingCol=ms=>!ms?'#7d8798':ms<100?'#62d07a':ms<200?'#e8c25a':'#ef6a5a';
const pingText=ms=>ms?` · ${Math.round(ms)} ms`:'';
function pingTick(){const s=NET.sock;if(!s||!s.connected||document.hidden)return;const t0=performance.now();let done=false;
  const to=setTimeout(()=>{if(done)return;done=true;if(++PING.fails>=2)NET.ping=0;pingShow();},PING.timeout);
  try{s.emit('pingc',Date.now(),()=>{if(done)return;done=true;clearTimeout(to);PING.fails=0;const rtt=performance.now()-t0;
    NET.ping=NET.ping?NET.ping*.6+rtt*.4:rtt;pingShow();});}catch(e){clearTimeout(to);}}
setInterval(pingTick,PING.every);setTimeout(pingTick,1500);

// your own: a small coloured tag on the online badge
function pingShow(){const b=document.getElementById('onlineBadge');if(!b)return;let t=b.querySelector('.pingtag');
  if(!NET.ping||!NET.room){if(t)t.remove();return;}
  if(!t){t=document.createElement('span');t.className='pingtag';b.appendChild(t);}
  t.style.color=pingCol(NET.ping);t.textContent=` · ${Math.round(NET.ping)} ms`;}
// the badge text is rewritten now and then: put the tag back each time
if(typeof updateWho==='function'){const _uwP=updateWho;updateWho=function(){const r=_uwP.apply(this,arguments);try{pingShow();}catch(e){}return r;};}

// others: a dot just right of the HP bar under their name (js/render.js calls it inside the player's own drawing spot)
function pingDot(o){ctx.fillStyle='#000';ctx.beginPath();ctx.arc(o.rx+22,o.ry+29.5,3.4,0,7);ctx.fill();
  ctx.fillStyle=pingCol(o.pg);ctx.beginPath();ctx.arc(o.rx+22,o.ry+29.5,2.4,0,7);ctx.fill();}

// party box: a dot before each member's name
if(typeof renderParty==='function'){const _rpP=renderParty;renderParty=function(){const r=_rpP.apply(this,arguments);try{
  const p=typeof SOC!=='undefined'&&SOC.party,list=document.querySelector('#partyBox .pm');if(!p||!list)return r;const me=typeof selfPeer==='function'?selfPeer():null;
  p.members.forEach((m,i)=>{const row=list.children[i],nm=row&&row.querySelector('.pn');if(!nm)return;
    const ms=m.peer===me?NET.ping:(NET.others.get(m.peer)||{}).pg;let d=nm.querySelector('.pgd');
    if(!ms){if(d)d.remove();return;}
    if(!d){d=document.createElement('i');d.className='pgd';nm.prepend(d);}
    d.style.background=pingCol(ms);d.title=`${Math.round(ms)} ms`;});}catch(e){}return r;};}

(()=>{const st=document.createElement('style');st.textContent=`.pingtag{font-weight:700}
.pgd{display:inline-block;width:7px;height:7px;border-radius:50%;margin-right:4px;vertical-align:1px;box-shadow:0 0 0 1px #000}`;document.head.appendChild(st);})();
