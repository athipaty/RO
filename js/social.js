"use strict";
/* ================= social: parties, whispers, friends, chat tabs ================= */
// These need the game server; on the public-broker backup they politely say so.
let SOCK=null;
const SOC={party:null,lastWhisper:null,invite:null,tab:'all'};

function socialAttach(sock){SOCK=sock;tradeAttach(sock);
  sock.on('connect',()=>{if(SOC.party){SOC.party=null;renderParty();}}); // the server forgets parties when we reconnect
  sock.on('whisper',m=>{if(!m)return;const from=clean(m.from,16),text=clean(m.text,120);if(!from||!text||typeof isMuted==='function'&&isMuted(from))return;
    SOC.lastWhisper=from;logLine('whisper',`[From ${from}] `,text);sfx('ping');});
  sock.on('whisperSent',m=>{if(!m)return;const to=clean(m.to,16);
    if(m.ok)logLine('whisper',`[To ${to}] `,clean(m.text,120));else addLog(`${to} is not online.`,'l-bad');});
  sock.on('partyInvite',m=>{if(m&&m.fromPeer&&!(typeof isMuted==='function'&&isMuted(m.from)))showInvite(String(m.fromPeer),clean(m.from,16)||'Someone');});
  sock.on('party',st=>{const was=SOC.party;
    SOC.party=st&&Array.isArray(st.members)?{id:String(st.id),leader:String(st.leader),mode:st.mode==='each'?'each':'share',loot:st.loot==='turns'?'turns':st.loot==='each'?'each':null,
      members:st.members.slice(0,12).map(x=>({peer:String(x.peer),name:clean(x.name,16)}))}:null;
    if(!was&&SOC.party){addLog(`You are in a party with ${SOC.party.members.filter(x=>x.peer!==selfPeer()).map(x=>x.name).join(', ')}.`,'l-good');sfx('jobup');}
    else if(was&&!SOC.party)addLog('You are no longer in a party.');
    renderParty();});
  sock.on('partyChat',m=>{if(m&&!(typeof isMuted==='function'&&isMuted(m.from)))logLine('party',`[Party] ${clean(m.from,16)}: `,clean(m.text,120));});
  sock.on('partyExp',m=>{if(!m||!P||P.dead)return;gainExp(clamp(Math.floor(fin(m.exp)),0,5e6),clamp(Math.floor(fin(m.jexp)),0,5e6));});
  sock.on('friends',m=>{if(!m||!P)return;const on=new Set((Array.isArray(m.online)?m.online:[]).map(n=>clean(n,16).toLowerCase()));
    const yes=P.friends.filter(f=>on.has(f.toLowerCase())),no=P.friends.filter(f=>!on.has(f.toLowerCase()));
    addLog(`Friends online: ${yes.join(', ')||'none'}`+(no.length?` · offline: ${no.join(', ')}`:''),'l-good');});
  sock.on('socialError',m=>{if(m)addLog(clean(m.error,120),'l-bad');});
  sock.on('socialInfo',m=>{if(m)addLog(clean(m.info,120),'l-good');});
}
function soc(ev,data){
  if(!SOCK||!SOCK.connected){addLog('Parties, whispers and friends need the game server, which is not reachable right now.','l-bad');return false;}
  SOCK.emit(ev,data);return true;}
const selfPeer=()=>SOCK&&SOCK.id;

/* ---- parties ---- */
function inParty(peer){return !!(SOC.party&&SOC.party.members.some(m=>m.peer===peer));}
function partyMatesHere(){if(!SOC.party)return [];const out=[];for(const [peer,o] of NET.others)if(inParty(peer)&&o.z===zoneId&&!o.dead)out.push(o);return out;}
// EXP for a kill: alone you keep it all; in a party, "share" splits it (with a bonus per member) and "each" gives everyone +25%
function partyExpShare(e,j){const mates=partyMatesHere();if(!mates.length)return {e,j};
  if(SOC.party.mode==='each')return {e:Math.round(e*1.25),j:Math.round(j*1.25)};
  const n=mates.length+1,k=(1+.25*(n-1))/n,se=Math.round(e*k),sj=Math.round(j*k);
  soc('partyExp',{exp:se,jexp:sj});return {e:se,j:sj};}
function findPeerByName(name){name=String(name||'').trim().toLowerCase();for(const [peer,o] of NET.others)if((o.n||'').toLowerCase()===name)return peer;return null;}
function invite(name){const peer=findPeerByName(name);if(!peer){addLog(`${name} is not in your channel.`,'l-bad');return;}soc('partyInvite',{peer});}
function showInvite(peer,from){const el=$('#invite');SOC.invite={peer,from};el.querySelector('b').textContent=from;el.hidden=false;sfx('ping');
  clearTimeout(showInvite.t);showInvite.t=setTimeout(()=>{if(SOC.invite&&SOC.invite.peer===peer){soc('partyDecline',{peer});hideInvite();}},30000);}
function hideInvite(){$('#invite').hidden=true;SOC.invite=null;}
$('#invYes').addEventListener('click',()=>{if(SOC.invite)soc('partyAccept',{peer:SOC.invite.peer});hideInvite();});
$('#invNo').addEventListener('click',()=>{if(SOC.invite)soc('partyDecline',{peer:SOC.invite.peer});hideInvite();});
$('#pLeave').addEventListener('click',()=>soc('partyLeave',{}));
$('#pMode').addEventListener('click',()=>{if(SOC.party)soc('partyMode',{mode:SOC.party.mode==='share'?'each':'share'});});
$('#pLoot').addEventListener('click',()=>{if(SOC.party)soc('partyLoot',{loot:SOC.party.loot==='turns'?'each':'turns'});});
function renderParty(){const box=$('#partyBox'),p=SOC.party;box.hidden=!p;if(!p)return;
  const me=selfPeer(),lead=p.leader===me,list=box.querySelector('.pm');
  // sit just under the status box, whatever its size
  // (phones: js/quickleft.js stacks it with the other boxes so nothing overlaps)
  const hud=$('#hud');if(!document.body.classList.contains('touchui'))box.style.top=(hud.hidden?10:hud.getBoundingClientRect().bottom+6)+'px';else if(typeof phoneLayout==='function')setTimeout(phoneLayout,0);
  const fold=box.classList.contains('fold'),f=$('#pFold');f.textContent=fold?'+':'−';f.setAttribute('aria-expanded',String(!fold));f.title=fold?'Show party members':'Fold the party box';
  box.querySelector('.pt').textContent=fold?`Party (${p.members.length})`:`Party · ${p.mode==='share'?'sharing EXP':'each keeps own EXP'}${p.loot==='turns'?' · loot by turns':''}`;
  // the loot rule needs a server that knows it (older ones send no loot field)
  const lb=$('#pLoot');lb.hidden=!lead||!p.loot;lb.textContent=p.loot==='turns'?'Loot: each own':'Loot: take turns';lb.title=p.loot==='turns'?'Everyone rolls their own drops again':'One drop roll per kill, given to each member in turn';
  const mb=$('#pMode');mb.hidden=!lead;mb.textContent=p.mode==='share'?'Each keeps own':'Share EXP';
  list.textContent='';
  for(const m of p.members){const isMe=m.peer===me,o=NET.others.get(m.peer);
    const row=document.createElement('div');row.className='pmr';
    const nm=document.createElement('span');nm.className='pn';nm.textContent=(m.peer===p.leader?'★ ':'')+m.name+(isMe?' (you)':'');
    const hp=isMe?(S?P.hp/S.maxhp:1):o?(o.hp||0)/100:0;
    const bar=document.createElement('i');bar.className='ph';bar.style.setProperty('--hp',(clamp(hp,0,1)*100).toFixed(0)+'%');
    const where=document.createElement('span');where.className='pz';
    where.textContent=isMe?'':!o?'away':o.dead?'fallen':o.z!==zoneId?(ZONES[o.z]?.name||''):'';
    row.append(nm,bar,where);
    if(!isMe&&o&&typeof followStart==='function'){const f=document.createElement('button');f.className='btn small'+(following(m.peer)?' on':'');
      f.textContent=following(m.peer)?'Stop':'Follow';const lbl=following(m.peer)?`Stop following ${m.name}`:`Follow ${m.name}`;f.title=lbl;f.setAttribute('aria-label',lbl);
      f.addEventListener('click',ev=>{ev.stopPropagation();if(following(m.peer))followStop(`You stopped following ${m.name}.`);else followStart(m.peer);});row.append(f);}
    if(lead&&!isMe){const k=document.createElement('button');k.className='btn small';k.textContent='×';k.title=`Remove ${m.name} from the party`;
      k.setAttribute('aria-label',`Remove ${m.name} from the party`);k.addEventListener('click',()=>soc('partyKick',{peer:m.peer}));row.append(k);}
    list.append(row);}}
setInterval(()=>{if(SOC.party)renderParty();},500);

/* ---- friends (saved with your character) ---- */
function friendToggle(name,add){name=clean(name,16);if(!name){addLog(add?'Usage: /friend Name':'Usage: /unfriend Name');return;}
  const i=P.friends.findIndex(f=>f.toLowerCase()===name.toLowerCase());
  if(add){if(i>=0){addLog(`${name} is already your friend.`);return;}if(P.friends.length>=50){addLog('Your friends list is full (50).','l-bad');return;}
    P.friends.push(name);addLog(`Added ${name} to your friends.`,'l-good');}
  else{if(i<0){addLog(`${name} is not on your friends list.`);return;}P.friends.splice(i,1);addLog(`Removed ${name} from your friends.`);}
  save();}
function friendSeen(name){if(P&&P.friends&&P.friends.some(f=>f.toLowerCase()===String(name).toLowerCase()))addLog(`Your friend ${name} is online.`,'l-good');}

/* ---- chat tabs ---- */
function logLine(kind,prefix,text){const el=$('#log'),d=document.createElement('div');d.className='l-'+kind;
  const b=document.createElement('b');b.textContent=prefix;d.append(b,document.createTextNode(text));el.appendChild(d);trimLog(el,60);el.scrollTop=el.scrollHeight;}
document.querySelectorAll('#logTabs [data-tab]').forEach(b=>b.addEventListener('click',()=>{SOC.tab=b.dataset.tab;
  const log=$('#log');log.classList.remove('f-party','f-whisper','f-guild','f-room','f-chat');if(SOC.tab!=='all')log.classList.add('f-'+SOC.tab);
  document.querySelectorAll('#logTabs [data-tab]').forEach(x=>x.classList.toggle('on',x===b));log.scrollTop=log.scrollHeight;}));

// fold the party box down to one line (remembered; starts folded on phones)
(()=>{let f=null;try{f=localStorage.getItem('embervale.partyFold');}catch(e){}
  if(f==='1'||(f===null&&window.innerWidth<=760))$('#partyBox').classList.add('fold');})();
$('#pFold').addEventListener('click',ev=>{ev.stopPropagation();const b=$('#partyBox');b.classList.toggle('fold');
  try{localStorage.setItem('embervale.partyFold',b.classList.contains('fold')?'1':'0');}catch(e){}sfx('click');renderParty();});
