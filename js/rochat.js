"use strict";
/* ================= chat rooms you open where you stand, like the classic MMOs (v1.38.0) =================
   Alt+C (or Ctrl+C when no text is selected, the 💬 Room button on phones, or /chatroom) opens "Create a chat room":
   a title, how many people may join (2-20) and an optional password. A chat bubble with the title and the head count
   (and a padlock if it has a password) then floats over your head for everyone in the region (presence field cr).
   Tap someone's bubble to join their room; the room has its own window: who is in it, what is said, and a box to talk.
   The owner can change the settings, remove someone, or close the room (leaving closes it for everyone).
   Built on the server's named rooms (chatrooms.js); the room's real name is an id, the title is only shown. */
const RC={mine:null,log:[],banned:new Set(),pending:null};
const rcHash=s=>{let h=5381;for(const c of String(s))h=((h<<5)+h+c.charCodeAt(0))|0;return (h>>>0).toString(36);};
const rcName=()=>('cr'+String(NET.myId||'x').replace(/[^a-z0-9]/gi,'')).slice(0,20);
const rcIn=()=>!!(typeof CR!=='undefined'&&CR.room);
const rcOwner=()=>!!(RC.mine&&CR.room===RC.mine.r);
// what others see over your head
function chatroomPresence(){if(!rcOwner())return null;const m=RC.mine;return {t:m.t,r:m.r,n:Math.max(1,CR.members.length),m:m.max,h:m.pw||null};}
function chatroomRead(v){if(!v||typeof v!=='object')return null;const t=clean(v.t,30),r=clean(v.r,20);if(!t||!/^[a-z0-9]{2,20}$/i.test(r))return null;
  return {t,r,n:clamp(Math.floor(fin(v.n)),1,20),m:clamp(Math.floor(fin(v.m)),2,20),h:v.h?clean(v.h,16):null};}
// the bubble: a white speech balloon with the title, the head count and a padlock
function chatBubble(x,y,c){ctx.save();ctx.font='800 11px "Alegreya Sans",sans-serif';const cnt=` (${c.n}/${c.m})`,full=c.n>=c.m;
  let t=c.t;const maxW=150;while(ctx.measureText(t+cnt).width>maxW&&t.length>1)t=t.slice(0,-2)+'…';
  const lock=c.h?12:0,w=ctx.measureText(t+cnt).width+18+lock,bx=x-w/2,by=y-104;
  ctx.fillStyle='rgba(0,0,0,.25)';ctx.beginPath();ctx.roundRect(bx+2,by+3,w,22,8);ctx.fill();
  ctx.fillStyle=full?'#f0e6e6':'#ffffff';ctx.strokeStyle=full?'#a85a5a':'#3a5a9a';ctx.lineWidth=2;ctx.beginPath();ctx.roundRect(bx,by,w,22,8);ctx.fill();ctx.stroke();
  ctx.beginPath();ctx.moveTo(x-5,by+22);ctx.lineTo(x,by+30);ctx.lineTo(x+5,by+22);ctx.closePath();ctx.fill();ctx.beginPath();ctx.moveTo(x-5,by+22);ctx.lineTo(x,by+30);ctx.lineTo(x+5,by+22);ctx.stroke();
  ctx.fillStyle=full?'#ffffff':'#ffffff';ctx.fillRect(x-4,by+20,8,3);
  let tx=bx+9;if(lock){ctx.fillStyle='#c8963a';ctx.fillRect(tx,by+9,8,7);ctx.strokeStyle='#c8963a';ctx.lineWidth=1.6;ctx.beginPath();ctx.arc(tx+4,by+9,2.6,Math.PI,0);ctx.stroke();tx+=lock;}
  ctx.textAlign='left';ctx.fillStyle='#1a2a4a';ctx.fillText(t,tx,by+15);ctx.fillStyle=full?'#a83a3a':'#3a7a3a';ctx.fillText(cnt,tx+ctx.measureText(t).width,by+15);ctx.restore();}
function chatroomAt(sc){for(const [peer,o] of NET.others){if(!o.cr||o.z!==zoneId)continue;const p=proj(o.rx,o.ry);if(Math.abs(p.x-sc.x)<80&&sc.y>p.y-108&&sc.y<p.y-70)return o;}return null;}
// draw: over others with a room, and over yourself while you own one
{const _rd=render;render=function(){const r=_rd.apply(this,arguments);try{if(!P||!running)return r;ctx.save();ctx.setTransform(DPR,0,0,DPR,-camX*DPR,-camY*DPR);
    for(const o of NET.others.values())if(o.cr&&o.z===zoneId){const p=proj(o.rx,o.ry);chatBubble(p.x,p.y,o.cr);}
    const me=chatroomPresence();if(me){const p=proj(P.x,P.y);chatBubble(p.x,p.y,me);}ctx.restore();}catch(e){}return r;};}
// tapping a bubble joins (before anything else under the finger)
cv.addEventListener('pointerdown',ev=>{if(!P||!running||P.dead)return;const o=chatroomAt(screenAt(ev));if(!o)return;ev.stopImmediatePropagation();ev.preventDefault();rcJoin(o);},true);
function rcJoin(o){const c=o.cr;if(CR.room===c.r){openPanel('chatroom');return;}
  if(RC.banned.has(c.r)){addLog(`You were asked to leave "${c.t}".`,'l-bad');return;}
  if(c.n>=c.m){addLog(`"${c.t}" is full (${c.n}/${c.m}).`,'l-bad');sfx('miss');return;}
  if(c.h){RC.pending={o:o.n,c};openPanel('crpass');return;}
  rcEnter(c,o.n);}
function rcEnter(c,owner){if(rcOwner())rcClose(true);RC.log=[];RC.join={r:c.r,t:c.t,owner,max:c.m};if(soc('roomJoin',{name:c.r}))openPanel('chatroom');}
// create
function rcCreate(){const t=clean(document.getElementById('crTitle').value,30),max=clamp(Math.floor(fin(document.getElementById('crMax').value)),2,20),pw=clean(document.getElementById('crPw').value,16);
  if(t.length<2){addLog('Give your chat room a title (2 letters or more).','l-bad');return;}
  if(!NET.room||!SOCK||!SOCK.connected){addLog('Chat rooms need the game server, which is not reachable right now.','l-bad');return;}
  const r=rcName();if(RC.mine&&CR.room===RC.mine.r){RC.mine={...RC.mine,t,max,pw:pw?rcHash(r+'|'+pw):null};addLog(`Room updated: "${t}".`,'l-good');NET.lastSent='';NET.sendT=0;openPanel('chatroom');return;}
  RC.mine={r,t,max,pw:pw?rcHash(r+'|'+pw):null};RC.log=[];RC.join={r,t,owner:P.name,max};if(soc('roomJoin',{name:r})){sfx('click');NET.lastSent='';NET.sendT=0;openPanel('chatroom');}}
function rcClose(silent){if(rcOwner()&&SOCK&&SOCK.connected)SOCK.emit('roomChat',{text:'§cr:close'});RC.mine=null;if(rcIn())soc('roomLeave',{});NET.lastSent='';NET.sendT=0;if(!silent)addLog('You closed your chat room.');}
function rcLeave(){if(rcOwner())return rcClose();RC.join=null;if(rcIn())soc('roomLeave',{});closePanel();}
// the room's lines: kept for the window; the owner's control lines are acted on, never shown
{const _ll=logLine;logLine=function(kind,prefix,text){
  if(kind==='room'){const m=/^\[[^\]]*\] (.+?): $/.exec(prefix||''),from=m?m[1]:null,t=String(text||'');
    if(t.startsWith('§cr:')){const owner=RC.join&&RC.join.owner;if(from&&owner&&from===owner&&from!==P.name){
        if(t==='§cr:close'){addLog(`${owner} closed the chat room.`);RC.join=null;if(rcIn())soc('roomLeave',{});if(panelKind==='chatroom')closePanel();}
        else if(t==='§cr:kick:'+P.name){addLog(`${owner} asked you to leave the chat room.`,'l-bad');RC.banned.add(CR.room);RC.join=null;if(rcIn())soc('roomLeave',{});if(panelKind==='chatroom')closePanel();}}
      return;}
    RC.log.push({from,text:from?t:(prefix||'')+t,me:from===P.name});if(RC.log.length>80)RC.log.shift();if(panelKind==='chatroom')rcRefreshLog();}
  return _ll.apply(this,arguments);};}
// a room that is over its limit: the newest ones step out
{const _ra=roomsAttach;roomsAttach=function(sock){_ra(sock);sock.on('room',st=>{try{
    if(!st||typeof st!=='object'){if(RC.mine)RC.mine=null;if(panelKind==='chatroom')closePanel();NET.lastSent='';NET.sendT=0;return;}
    const j=RC.join;if(j&&!rcOwner()&&CR.members.length>j.max&&CR.members.indexOf(P.name)>=j.max){addLog('That chat room just filled up.','l-bad');RC.join=null;soc('roomLeave',{});closePanel();return;}
    NET.lastSent='';NET.sendT=0;if(panelKind==='chatroom')refreshPanel();}catch(e){}});};}
function rcRefreshLog(){const el=document.getElementById('crLog');if(!el){refreshPanel();return;}el.innerHTML=rcLogHtml();el.scrollTop=el.scrollHeight;}
const rcLogHtml=()=>RC.log.length?RC.log.map(l=>`<div class="crl${l.me?' me':''}">${l.from?`<b>${esc(l.from)}</b> `:''}${esc(l.text)}</div>`).join(''):`<div class="muted">Nobody has said anything yet.</div>`;
PANELS.crcreate=()=>{const m=rcOwner()?RC.mine:null;
  return `<h2>${m?'Room settings':'Create a chat room'}</h2><div class="sub">A bubble with the title floats over your head; anyone in the region can tap it to join.</div>`+
    `<label class="crf">Title<input id="crTitle" maxlength="30" value="${esc(m?m.t:'')}" placeholder="Party for the Cinder Crypt" autocomplete="off"></label>`+
    `<label class="crf">People (2-20)<select id="crMax">${Array.from({length:19},(_,i)=>i+2).map(n=>`<option value="${n}" ${n===(m?m.max:6)?'selected':''}>${n}</option>`).join('')}</select></label>`+
    `<label class="crf">Password <span class="muted">(leave empty for an open room)</span><input id="crPw" maxlength="16" type="password" autocomplete="off"></label>`+
    `<div class="tbtns"><button class="btn small ghost" data-act="crcancel">Cancel</button><button class="btn" data-act="crmake">${m?'Save':'Open the room'}</button></div>`;};
PANELS.crpass=()=>{const p=RC.pending;if(!p)return '';return `<h2>🔒 ${esc(p.c.t)}</h2><div class="sub">${esc(p.o)}'s room has a password.</div>`+
  `<label class="crf">Password<input id="crJoinPw" maxlength="16" type="password" autocomplete="off"></label><div class="tbtns"><button class="btn small ghost" data-act="crcancel">Cancel</button><button class="btn" data-act="crpass">Join</button></div>`;};
PANELS.chatroom=()=>{const j=RC.join;if(!j||!rcIn())return `<h2>Chat room</h2><p class="muted">You are not in a chat room. Tap a chat bubble over someone's head to join, or press Alt+C to open your own.</p>`;
  const own=rcOwner(),t=own?RC.mine.t:j.t,max=own?RC.mine.max:j.max;
  let h=`<h2>💬 ${esc(t)}</h2><div class="sub">${CR.members.length}/${max} here${own&&RC.mine.pw?' · 🔒 password':''} · owner ${esc(own?P.name:j.owner)}</div>`;
  h+=`<div class="crmem">`+CR.members.map(n=>`<span class="crm${n===(own?P.name:j.owner)?' own':''}">${n===(own?P.name:j.owner)?'👑 ':''}${esc(n)}${own&&n!==P.name?` <button class="crkick" data-act="crkick" data-arg="${esc(n)}" title="Ask to leave" aria-label="Ask ${esc(n)} to leave">✕</button>`:''}</span>`).join('')+`</div>`;
  h+=`<div id="crLog" class="crlog" aria-live="polite">${rcLogHtml()}</div>`;
  h+=`<div class="crsend"><input id="crSay" maxlength="120" placeholder="Say something…" autocomplete="off" enterkeyhint="send"><button class="btn" data-act="crsay">Send</button></div>`;
  h+=`<div class="tbtns">${own?`<button class="btn small" data-act="crsettings">Settings</button>`:''}<button class="btn small ghost" data-act="crleave">${own?'Close the room':'Leave'}</button></div>`;
  return h;};
PANEL_ACTS.crmake=()=>rcCreate();
PANEL_ACTS.crcancel=()=>{RC.pending=null;rcIn()&&RC.join?openPanel('chatroom'):closePanel();};
PANEL_ACTS.crpass=()=>{const p=RC.pending;if(!p)return;const v=clean(document.getElementById('crJoinPw').value,16);
  if(rcHash(p.c.r+'|'+v)!==p.c.h){addLog('That password is not right.','l-bad');sfx('miss');return;}RC.pending=null;rcEnter(p.c,p.o);};
PANEL_ACTS.crsay=()=>{const el=document.getElementById('crSay');const t=clean(el&&el.value,120);if(!t||!rcIn())return;if(t.startsWith('§'))return;soc('roomChat',{text:t});el.value='';el.focus();};
PANEL_ACTS.crleave=()=>rcLeave();
PANEL_ACTS.crsettings=()=>openPanel('crcreate');
PANEL_ACTS.crkick=n=>{if(!rcOwner()||!n||n===P.name)return;soc('roomChat',{text:'§cr:kick:'+n});addLog(`You asked ${n} to leave.`);};
document.addEventListener('keydown',ev=>{if(ev.key==='Enter'&&ev.target&&ev.target.id==='crSay'){ev.preventDefault();PANEL_ACTS.crsay();}
  if(ev.key==='Enter'&&ev.target&&ev.target.id==='crJoinPw'){ev.preventDefault();PANEL_ACTS.crpass();}},true);
// opening it: Alt+C, Ctrl+C (when nothing is selected), /chatroom, and the 💬 Room button on phones
function rcOpen(){if(!P||!running)return;if(rcIn()&&RC.join){openPanel('chatroom');return;}openPanel('crcreate');setTimeout(()=>{const i=document.getElementById('crTitle');if(i&&!document.body.classList.contains('touchui'))i.focus();},50);}
window.addEventListener('keydown',ev=>{if(!running||!P)return;const tag=ev.target&&ev.target.tagName;if(tag==='INPUT'||tag==='TEXTAREA')return;
  if((ev.altKey||ev.ctrlKey)&&!ev.shiftKey&&ev.key.toLowerCase()==='c'){if(ev.ctrlKey&&String(window.getSelection&&window.getSelection()||''))return;ev.preventDefault();rcOpen();}},true);
{const _cc=chatCommand;chatCommand=function(k,arg){if(k==='chatroom'||k==='cr'){rcOpen();return true;}return _cc.apply(this,arguments);};}
CMD_HELP.push(['/chatroom, or Alt+C','open a chat room where you stand']);
(()=>{const m=document.getElementById('menu');if(!m||document.getElementById('mRoom'))return;const b=document.createElement('button');b.className='dk only-touch';b.id='mRoom';b.type='button';b.title='Open a chat room (Alt+C)';
  b.innerHTML='<i>💬</i><span>Room</span>';b.addEventListener('click',()=>{$('#dock').classList.remove('open');rcOpen();});m.appendChild(b);})();
// leaving the game or going offline closes your room
window.addEventListener('pagehide',()=>{try{if(rcOwner())rcClose(true);}catch(e){}});
if(typeof TH!=='undefined'){for(const [k,v] of [['Create a chat room','สร้างห้องแชท'],['Room settings','ตั้งค่าห้อง'],['Title','ชื่อห้อง'],['People (2-20)','จำนวนคน (2-20)'],['Password','รหัสผ่าน'],
  ['(leave empty for an open room)','(เว้นว่างไว้ถ้าเป็นห้องเปิด)'],['Open the room','เปิดห้อง'],['Save','บันทึก'],['Join','เข้าร่วม'],['Send','ส่ง'],['Settings','ตั้งค่า'],['Close the room','ปิดห้อง'],['Leave','ออก'],
  ['Chat room','ห้องแชท'],['Room','ห้อง'],['Nobody has said anything yet.','ยังไม่มีใครพูดอะไร'],['Say something…','พิมพ์ข้อความ…'],
  ['A bubble with the title floats over your head; anyone in the region can tap it to join.','จะมีป้ายชื่อห้องลอยเหนือหัวคุณ ใครอยู่ในพื้นที่เดียวกันก็แตะเพื่อเข้าร่วมได้'],
  ['You are not in a chat room. Tap a chat bubble over someone\'s head to join, or press Alt+C to open your own.','คุณยังไม่ได้อยู่ในห้องแชท แตะป้ายแชทเหนือหัวคนอื่นเพื่อเข้าร่วม หรือกด Alt+C เพื่อเปิดห้องของคุณเอง']])if(!TH[k])TH[k]=v;
  if(typeof TH_PAT!=='undefined')TH_PAT.unshift([/^(\d+)\/(\d+) here( · 🔒 password)? · owner (.+)$/,(m,a,b,l,o)=>`อยู่ ${a}/${b} คน${l?' · 🔒 มีรหัสผ่าน':''} · เจ้าของ ${o}`],[/^(.+)'s room has a password\.$/,'ห้องของ $1 มีรหัสผ่าน']);}
// on phones the room windows sit at the bottom like a dialogue box, so the town and the people stay in view
if(typeof NPC_SHEET!=='undefined')for(const k of ['chatroom','crcreate','crpass'])NPC_SHEET.add(k);
