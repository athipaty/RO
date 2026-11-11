"use strict";
/* ================= multiplayer: see each other + chat (live room) ================= */
const NET={myId:Math.random().toString(36).slice(2,10),zt:0,evs:[],hits:[],evId:0,hitId:0,evSeen:new Map(),wasClient:false,myEmote:null,room:null,others:new Map(),chatId:Date.now(),myChat:[],lastSent:'',sendT:0,warned:false};
const clean=(s,n)=>String(s??'').replace(/[\u0000-\u001f\u007f-\u009f­​-‏‪-‮⁠-⁯﻿]/g,'').trim().slice(0,n);
const fin=v=>Number.isFinite(+v)?+v:0;
/* Outside claude.ai (e.g. on Vercel) players meet through a free public MQTT broker.
   Each player keeps one retained message with their presence; the broker clears it when they leave. */
const ROOM=(new URLSearchParams(location.search).get('room')||'').replace(/[^a-z0-9-]/gi,'').slice(0,24).toLowerCase();
const NET_BROKER='wss://broker.emqx.io:8084/mqtt',NET_TOPIC='embervale-game/v1/world'+(ROOM?'/'+ROOM:'');
function loadScript(src){return new Promise((ok,no)=>{const s=document.createElement('script');s.src=src;s.onload=ok;s.onerror=no;document.head.appendChild(s);});}
function mqttRoom(){
  return (window.mqtt?Promise.resolve():loadScript('https://unpkg.com/mqtt@5.10.1/dist/mqtt.min.js')).then(()=>new Promise((res,rej)=>{
    const me=Math.random().toString(36).slice(2,12),base=NET_TOPIC+'/p/',topic=base+me,seen=new Map();
    let cb=null,onClose=null,last=null,ready=false;
    const c=mqtt.connect(NET_BROKER,{clientId:'ev_'+me,clean:true,keepalive:20,reconnectPeriod:3000,connectTimeout:10000,
      will:{topic,payload:'',retain:true,qos:0}});
    const pub=()=>{if(last&&c.connected)c.publish(topic,JSON.stringify({...last,_t:Date.now()}),{retain:true,qos:0});};
    const leave=id=>{if(seen.delete(id)&&cb)cb({joined:[],updated:[],left:[{peer:id}]});};
    const room={presence(s){last=s;pub();return Promise.resolve();},
      onPeers(f,closed){cb=f;onClose=closed;}};
    c.on('connect',()=>{c.subscribe(base+'+');pub();if(!ready){ready=true;res(room);}});
    c.on('error',e=>{if(!ready){ready=true;c.end(true);rej(e);}});
    c.on('message',(t,buf,pk)=>{const id=t.slice(base.length);if(id===me||!cb||buf.length>12000)return;
      if(!buf.length)return leave(id);
      let p;try{p=JSON.parse(buf.toString());}catch(e){return;}
      // live messages are always fresh; only an old retained message (left behind by a crashed tab) is skipped
      if(!p||typeof p!=='object'||(pk&&pk.retain&&Date.now()-fin(p._t)>300000))return;
      const was=seen.has(id);seen.set(id,Date.now());const e={peer:id,presence:p};
      cb({joined:was?[]:[e],updated:was?[e]:[],left:[]});});
    setInterval(()=>{pub();const cut=Date.now()-15000;for(const[id,t]of seen)if(t<cut)leave(id);},5000);
    addEventListener('pagehide',()=>{try{c.publish(topic,'',{retain:true,qos:0});c.end();}catch(e){}});
  }));
}
/* Player account: logging in keeps your character on the server so you can play from any device. */
const ACC={token:null,username:null,cloud:null,loaded:false};
try{const a=JSON.parse(localStorage.getItem('embervale.account')||'null');if(a&&a.token){ACC.token=a.token;ACC.username=a.username;}}catch(e){}
/* Our own game server (the Embervale part of center-kitchen-backend). Override with ?server=https://... for testing. */
const SERVER=(()=>{const s=new URLSearchParams(location.search).get('server');return /^https?:\/\/[\w.:-]+$/.test(s||'')?s:'https://center-kitchen-backend.onrender.com';})();
function serverRoom(){
  return (window.io?Promise.resolve():loadScript('https://cdn.jsdelivr.net/npm/socket.io-client@4.8.1/dist/socket.io.min.js')).then(()=>new Promise((res,rej)=>{
    const sock=io(SERVER+'/embervale',{transports:['websocket'],auth:{token:ACC.token||undefined},reconnectionDelayMax:8000});
    socialAttach(sock);if(typeof guildAttach==='function')guildAttach(sock);if(typeof modAttach==='function')modAttach(sock);if(typeof arenaAttach==='function')arenaAttach(sock);if(typeof guildwarAttach==='function')guildwarAttach(sock);
    const seen=new Map();let cb=null,last=null,ready=false; // peer id -> latest {peer,presence,guest}
    const fail=setTimeout(()=>{if(!ready){ready=true;sock.close();rej(new Error('timeout'));}},9000);
    // players already in the channel arrive before the game listens, so hand them over when it does
    const room={presence(s){last=s;if(sock.connected)sock.emit('presence',s);return Promise.resolve();},onPeers(f){cb=f;if(seen.size)f({joined:[...seen.values()],updated:[],left:[]});},server:true,
      relogin(){sock.auth={token:ACC.token||undefined};sock.disconnect();sock.connect();}};
    sock.on('connect',()=>sock.emit('join',{room:ROOM||'world'}));
    sock.on('joined',m=>{NET.channel=m.channel;NET.account=m.account||null;
      const now=new Set((m.peers||[]).map(p=>p.peer));
      const left=[...seen.keys()].filter(id=>!now.has(id)).map(peer=>({peer}));for(const p of left)seen.delete(p.peer);
      const joined=(m.peers||[]).filter(p=>!seen.has(p.peer));for(const p of m.peers||[])seen.set(p.peer,p);
      if(cb&&(left.length||joined.length))cb({joined,updated:[],left});
      if(last)sock.emit('presence',last);
      if(!ready){ready=true;clearTimeout(fail);res(room);}else updateOnline();});
    sock.on('peer',p=>{if(!p||!p.peer)return;const was=seen.has(p.peer);seen.set(p.peer,p);if(cb)cb({joined:was?[]:[p],updated:was?[p]:[],left:[]});});
    // server-run monsters: the server acts as the region's monster host (wb: the world boss, if one is in this region)
    sock.on('mobs',m=>{if(!m||typeof m.z!=='string'||!Array.isArray(m.mb)||m.mb.length>120)return;
      NET.srv={id:'server',z:m.z,mb:m.mb,ev:Array.isArray(m.ev)?m.ev.slice(-40):[],at:now,wb:m.wb&&typeof m.wb==='object'?m.wb:null};});
    sock.on('wboss',m=>{if(m&&typeof m==='object'&&typeof onWorldBoss==='function')onWorldBoss(m);});
    sock.on('left',p=>{if(cb&&p&&seen.delete(p.peer))cb({joined:[],updated:[],left:[{peer:p.peer}]});});
    sock.on('disconnect',()=>{if(ready){NET.status='connecting';updateWho();}});
    // a banned account is turned away with a message; it does not fall back to the public broker
    sock.on('connect_error',err=>{const msg=String(err&&err.message||'');
      if(msg.startsWith('banned:')){sock.close();const e=new Error(msg.slice(7).trim());e.banned=true;if(!ready){ready=true;clearTimeout(fail);rej(e);}else if(typeof modNotice==='function')modNotice('Account banned',e.message);return;}
      if(!ready){ready=true;clearTimeout(fail);sock.close();rej(new Error('connect failed'));}});
  }));
}
function netConnect(tries=0){
  // wait until every script has loaded, so each module (guilds, reports...) can hook into the connection
  if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',()=>netConnect(tries),{once:true});return;}
  if(!window.claude?.use){
    let framed=true;try{framed=window.top!==window;}catch(e){}
    if(framed&&tries<12){setTimeout(()=>netConnect(tries+1),500);return;}
    NET.relay=true;NET.status='connecting';$('#online').textContent='Connecting…';updateWho();
    serverRoom().catch(e=>{if(e&&e.banned)throw e;NET.viaBroker=true;return mqttRoom();}).then(room=>{NET.room=room;
      room.onPeers(ch=>{
        for(const p of ch.left){const o=NET.others.get(p.peer);if(o&&o.n)addLog(`${o.n} left.`);NET.others.delete(p.peer);}
        for(const p of ch.joined)ingest(p);for(const p of ch.updated)ingest(p);updateOnline();});
      NET.status='online';updateOnline();NET.lastSent='';}).catch(e=>{NET.relay=false;NET.status='offline';updateOnline();if(e&&e.banned&&typeof modNotice==='function')modNotice('Account banned',e.message);});
    return;}
  window.claude.use('room').then(room=>{
    if(!room){updateOnline();return;}
    NET.room=room;
    room.onPeers(ch=>{
      for(const p of ch.left){const o=NET.others.get(p.peer);if(o&&o.n)addLog(`${o.n} left.`);NET.others.delete(p.peer);}
      for(const p of ch.joined)if(!p.sameTab)ingest(p);
      for(const p of ch.updated)if(!p.sameTab)ingest(p);
      updateOnline();
    },()=>{NET.room=null;NET.others.clear();updateOnline();});
    updateOnline();NET.lastSent='';
  }).catch(()=>updateOnline());
}
function ingest(p){
  const s=p.presence||{};if(s.v!==1)return;
  let o=NET.others.get(p.peer);const fresh=!o;
  if(!o){o={peer:p.peer,rx:fin(s.x),ry:fin(s.y),seen:0,bubble:null,walkT:0};NET.others.set(p.peer,o);}
  o.n=clean(s.n,16)||'Traveller';o.cls=CLASSES[s.c]?s.c:'novice';o.z=ZONES[s.z]?s.z:'town';
  o.x=clamp(fin(s.x),0,4000);o.y=clamp(fin(s.y),0,4000);o.face=s.f<0?-1:1;netSnap(o,fin(s.ts),o.z!==o.lastZ);o.lastZ=o.z;{const lv=clamp(Math.floor(fin(s.lv)),1,99);if(!fresh&&o.lv&&lv>o.lv&&typeof otherLevelUp==='function')otherLevelUp(o,lv);o.lv=lv;}
  o.moving=!!s.mv;o.sitting=!!s.st;o.back=!!s.b;o.look=lookDecode(s.lk);o.vd=s.vd?clean(s.vd,30):null;o.dead=!!s.d;o.wid=typeof s.w==='string'&&ITEMS[s.w]&&ITEMS[s.w].type==='weapon'?s.w:null;o.guest=!!p.guest;
  {const hp0=o.hp;o.hurtT=(typeof hp0==='number'&&fin(s.hp)<hp0&&!s.d)?now:o.hurtT;if(s.d&&!o.wasDown)o.deadT=now;o.wasDown=!!s.d;}o.cs=typeof s.cs==='string'&&SKILLS[s.cs]?s.cs:null;
  o.hat=typeof s.h==='string'&&ITEMS[s.h]&&ITEMS[s.h].type==='head'?s.h:null;o.ar=typeof s.ar==='string'&&ITEMS[s.ar]&&ITEMS[s.ar].type==='armor'?s.ar:null;o.hp=clamp(fin(s.hp),0,100);
  o.guild=typeof guildTag==='function'?guildTag(p.guild):null;o.id=clean(s.id,16)||null;o.zt=fin(s.zt);o.hd=!!s.hd;
  o.mb=Array.isArray(s.mb)&&s.mb.length<=80?s.mb:null;o.ev=Array.isArray(s.ev)?s.ev.slice(-24):[];o.hx=Array.isArray(s.hx)?s.hx.slice(-24):[];o.hv=Array.isArray(s.hv)?s.hv.slice(-12):[];o.gl=typeof readGroundLoot==='function'?readGroundLoot(s.gl):[];o.tg=Number.isInteger(s.tg)&&s.tg>=0&&s.tg<500?s.tg:-1;o.pt=typeof petRead==='function'?petRead(s.pt):null;o.ti=typeof titleRead==='function'?titleRead(s.ti):null;
  if(s.em&&typeof s.em==='object'&&EMOTE_KEYS.includes(s.em.k)&&!(typeof isMuted==='function'&&isMuted(o.n))){const id=fin(s.em.i);if(id>(o.emSeen||0)){const first=!o.emSeen;o.emSeen=id;if(!(fresh&&first&&Math.abs(Date.now()-fin(s.em.t))>4000)){o.emote={k:s.em.k,start:now};if(o.z===zoneId)sfx('pop');}}}
  if(typeof supportRecv==='function')supportRecv(o,s.sp,fresh);
  if(typeof duelRecv==='function')duelRecv(o,s.dl,fresh);
  if(fresh){addLog(`${o.n} (${CLASSES[o.cls].name} Lv ${o.lv}) is online.`,'l-good');friendSeen(o.n);}
  const msgs=Array.isArray(s.ch)?s.ch.slice(-4):[];
  for(const m of msgs){
    if(!m||typeof m!=='object')continue;const id=fin(m.i);if(id<=o.seen)continue;o.seen=id;
    if(fresh&&!(Math.abs(Date.now()-fin(m.t))<120000))continue;
    if(m.k){const t=announceText(o.n,clean(m.k,8),typeof m.v==='number'?m.v:clean(m.v,16));if(t){addLog('★ '+t,'l-rare');sfx('ping');}continue;}
    const txt=clean(m.s,120);if(!txt||typeof isMuted==='function'&&isMuted(o.n))continue;
    o.bubble={txt,until:now+7};chatLog(o.n,txt,o.z,false,o.guest);sfx('ping');
  }
}
function updateOnline(){const el=$('#online');
  if(!NET.room){el.textContent=window.claude?.use||NET.relay===false?'Solo · chat offline':'Solo';return;}
  const n=NET.others.size;el.textContent=n?`${n+1} adventurers online`:'Online · nobody else here yet';
  updateWho();}
function updateWho(){
  const b=$('#onlineBadge'),list=$('#whoList');
  if(!NET.room){b.textContent=NET.status==='connecting'?'○ Connecting…':'○ Offline · solo';b.classList.add('off');list.hidden=true;return;}
  b.classList.remove('off');b.textContent=`● ${NET.others.size+1} online`+(NET.channel?` · ch ${NET.channel}`:'');
  list.textContent='';
  const row=(name,o,me,peer)=>{const d=document.createElement('div');d.className='who'+(me?' me':'')+(peer&&inParty(peer)?' party':'');
    const nm=document.createElement('b');nm.textContent=name+(me?' (you)':'');
    const info=document.createElement('span');const z=o.z||zoneId;info.textContent=`${CLASSES[o.cls]?.name||'Novice'} Lv ${o.lv||1} · ${ZONES[z]?.name||''}${!me&&z===zoneId?' · here':''}${o.guild?' · '+o.guild.n:''}`;
    d.append(nm,info);
    if(peer&&P&&NET.room&&NET.room.server){const bs=document.createElement('div');bs.className='wb';
      const mk=(label,fn)=>{const b=document.createElement('button');b.className='btn small';b.type='button';b.textContent=label;b.addEventListener('click',ev=>{ev.stopPropagation();fn();});bs.appendChild(b);};
      if(!inParty(peer)&&(!SOC.party||SOC.party.leader===selfPeer()))mk('Invite',()=>soc('partyInvite',{peer}));
      if(typeof canInvite==='function'&&canInvite()&&!o.guild&&!o.guest)mk('Guild',()=>gsoc('guildInvite',{peer}));
      if(inParty(peer)&&typeof followStart==='function')mk(following(peer)?'Stop':'Follow',()=>{if(following(peer))followStop(`You stopped following ${name}.`);else followStart(peer);updateWho();});
      mk('Whisper',()=>{openChat();$('#chatIn').value=`/w ${name} `;});
      if(o.z===zoneId&&typeof duelChallenge==='function'&&!DUEL)mk('Duel',()=>duelChallenge(peer));
      if(o.vd)mk('Shop',()=>soc('vendView',{peer}));else if(o.z===zoneId)mk('Trade',()=>soc('tradeRequest',{peer}));
      if(!P.friends.some(f=>f.toLowerCase()===String(name).toLowerCase()))mk('+ Friend',()=>{friendToggle(name,true);updateWho();});
      if(typeof isMuted==='function')mk(isMuted(name)?'Unmute':'Mute',()=>{muteToggle(name,!isMuted(name));updateWho();});
      if(typeof reportOpen==='function')mk('Report',()=>reportOpen(peer,name));
      d.appendChild(bs);}
    list.appendChild(d);};
  if(P)row(P.name,{cls:P.cls,lv:P.lv,z:zoneId,guild:typeof myGuildTag==='function'?myGuildTag():null},true);
  for(const [peer,o] of NET.others)row(o.n,o,false,peer);
  if(!NET.others.size){const d=document.createElement('div');d.className='who muted';d.textContent='Nobody else yet. Send your friend the link!';list.appendChild(d);}
}
function chatLog(name,txt,zone,mine,guest){
  const el=$('#log'),d=document.createElement('div');d.className='l-chat'+(mine?' me':'');
  const b=document.createElement('b');b.textContent=name+(guest?' (guest)':'');d.appendChild(b);
  if(zone&&zone!==zoneId){const i=document.createElement('i');i.textContent=` in ${ZONES[zone].name}`;d.appendChild(i);}
  d.appendChild(document.createTextNode(': '+txt));el.appendChild(d);trimLog(el,60);el.scrollTop=el.scrollHeight;}
function sendChat(raw){
  const txt=clean(raw,120);if(!txt||!P)return;
  if(txt[0]!=='/'&&SOC.tab==='party'&&SOC.party){soc('partyChat',{text:txt});return;}
  if(txt[0]==='/'){const[cmd,...rest]=txt.slice(1).split(/\s+/);const k=(cmd||'').toLowerCase();
    if(EMOTE_KEYS.includes(k)){doEmote(k);return;}
    if(chatCommand(k,rest.join(' ')))return;
    addLog(`Unknown command /${k}. Type /help to see them all.`,'l-bad');return;}
  NET.myChat=[...NET.myChat,{i:++NET.chatId,s:txt,t:Date.now()}].slice(-4);
  P.bubble={txt,until:now+7};chatLog(P.name,txt,zoneId,true);sfx('click');NET.lastSent='';NET.sendT=0;
  if(!NET.room&&!NET.warned){NET.warned=true;addLog('Nobody else can hear you here. Open the shared Embervale page to chat with other players.');}
}
const CMD_HELP=[['/help','this list'],['/where','your region, position and channel'],['/who','who is online and where'],['/sit, /stand','sit down or get up'],
  ['/exp','your EXP per hour'],['/w Name text, /r text','whisper, reply'],['/invite Name, /p text, /leave, /kick Name','party'],['/friend Name, /unfriend Name, /friends','friends'],['/trade Name, /shop','trade, open a shop'],['/mute Name, /unmute Name, /muted','hide chat, emotes and requests from a player'],['/report Name','tell the admins about a player'],['/roll','roll a number from 1 to 100 for everyone to see'],['/emotes','list emotes (e.g. /heart, /gg)'],['/clear','clear this log']];
function chatCommand(k,arg){
  if(k==='help'||k==='?'||k==='h'){addLog('Commands: '+CMD_HELP.map(([c,d])=>`${c} (${d})`).join(' · '));return true;}
  if(k==='where'){addLog(`You are in ${Z.D.name} at (${Math.round(P.x/TILE)}, ${Math.round(P.y/TILE)})`+(NET.channel?`, channel ${NET.channel}`:'')+(ROOM?`, room "${ROOM}"`:'')+'.');return true;}
  if(k==='who'||k==='online'){const list=[...NET.others.values()].map(o=>`${o.n} (Lv ${o.lv}, ${ZONES[o.z]?.name||'?'})`);
    addLog(list.length?`${list.length+1} online: you, ${list.join(', ')}`:'Nobody else is online right now.');return true;}
  if(k==='sit'||k==='stand'){if(!P.dead){P.sitting=k==='sit';P.path=[];P.target=null;}return true;}
  if(k==='clear'){[...$('#log').children].forEach(c=>{if(c.id!=='logTabs')c.remove();});return true;}
  if(k==='emotes'||k==='emote'||k==='em'){addLog('Emotes: '+EMOTE_KEYS.map(e=>'/'+e).join(' '));return true;}
  if(k==='exp'){const cut=Date.now()-600000,rec=EXPLOG.filter(x=>x.t>=cut);
    if(!rec.length){addLog('No EXP earned in the last 10 minutes.');return true;}
    const sum=rec.reduce((a,x)=>a+x.e,0),span=Math.max(60000,Date.now()-rec[0].t);
    addLog(`EXP per hour (last ${Math.round(span/60000)} min): ${fmt(sum*3600000/span)} · next level in ${fmt(Math.max(0,expNeed(P.lv)-P.exp))} EXP.`);return true;}
  if(k==='w'||k==='whisper'||k==='tell'){const[to,...r]=arg.split(/\s+/);const text=r.join(' ');if(!to||!text){addLog('Usage: /w Name message');return true;}soc('whisper',{to,text});return true;}
  if(k==='r'||k==='reply'){if(!SOC.lastWhisper)addLog('Nobody has whispered to you yet.');else if(arg)soc('whisper',{to:SOC.lastWhisper,text:arg});else addLog(`Usage: /r message (replies to ${SOC.lastWhisper})`);return true;}
  if(k==='p'||k==='party'){if(!SOC.party){addLog('You are not in a party. Invite someone with /invite Name.');return true;}
    if(arg)soc('partyChat',{text:arg});else addLog('Party: '+SOC.party.members.map(m=>m.name).join(', '));return true;}
  if(k==='invite'){if(!arg)addLog('Usage: /invite Name');else invite(arg);return true;}
  if(k==='leave'){if(SOC.party)soc('partyLeave',{});else addLog('You are not in a party.');return true;}
  if(k==='kick'){const peer=findPeerByName(arg);if(peer&&inParty(peer))soc('partyKick',{peer});else addLog('Usage: /kick Name (party leader only)');return true;}
  if(k==='friend'){friendToggle(arg,true);return true;}
  if(k==='unfriend'){friendToggle(arg,false);return true;}
  if(k==='friends'){if(!P.friends.length)addLog('Your friends list is empty. Add someone with /friend Name.');else soc('friends',{names:P.friends});return true;}
  if(k==='trade'){if(!arg)addLog('Usage: /trade Name (stand next to them)');else tradeWith(arg);return true;}
  if(k==='shop'||k==='vend'){PANEL_ACTS.vendsetup();return true;}
  if(k==='roll'){const n=1+Math.floor(Math.random()*100);sendChat(`rolls ${n} (1-100)`);return true;}
  return false;}
function announce(k,v){NET.myChat=[...NET.myChat,{i:++NET.chatId,k,v,t:Date.now()}].slice(-4);NET.lastSent='';NET.sendT=0;}
function announceText(n,k,v){
  if(k==='lv'&&Number.isInteger(v)&&v>1&&v<=99)return `${n} reached base level ${v}!`;
  if(k==='arena'&&typeof v==='string'&&v)return `${n} won an arena match against ${clean(v,40)}!`;
  if(k==='job'&&CLASSES[v])return `${n} became a ${CLASSES[v].name}!`;
  if(k==='sig'&&MOBS[v])return `${n} found a ${MOBS[v].name} Sigil!`;
  if(k==='boss'&&MOBS[v]&&MOBS[v].boss)return `${n} helped defeat the ${MOBS[v].name}!`;
  if(k==='drop'&&ITEMS[v]&&rarityOf(v)>=2)return `${n} found a ${RARITY[rarityOf(v)].name.toLowerCase()} ${ITEMS[v].name}!`;
  if(k==='refine'&&typeof v==='string'){const[r,id]=v.split(':');const it=ITEMS[id];if(it&&['weapon','armor','head','accessory'].includes(it.type)&&+r>=7&&+r<=10)return `${n} refined a +${+r} ${it.name}!`;}
  if(k==='duel'&&typeof v==='string'&&v)return `${n} won a duel against ${v}!`;
  if(k==='story'&&v==='warlord')return `${n} finished the story “The Ember Below” and saved Hearthvale!`;
  if(k==='quest'&&MOBS[v])return `${n} finished a ${MOBS[v].name} hunting contract.`;
  return null;}
/* ---- smooth movement for other players: show them a moment in the past and glide between the positions received ---- */
const NET_DELAY=200; // starting delay (ms behind real time); each player's is then fitted to their connection
function netSnap(o,ts,jump){const t=Date.now(),st=ts>0?ts:t; // positions are kept on the sender's clock
  if(ts>0){const off=t-ts; // our clock minus theirs, plus delivery time: track the fastest delivery seen
    o.offMin=o.offMin===undefined||off<o.offMin?off:o.offMin+(off-o.offMin)*.01;
    // the offset used for playback follows gently, so one quick update never makes the character lurch
    o.off=o.off===undefined||Math.abs(o.offMin-o.off)>250?o.offMin:o.off+(o.offMin-o.off)*.05;}
  else o.off=0;
  const b=o.buf||(o.buf=[]),last=b[b.length-1];
  // fit the playback delay to this connection: time between updates + how late updates arrive + a margin
  if(ts>0)o.jit=Math.max(t-ts-o.offMin,(o.jit||0)*.97);
  if(last&&!jump){const gap=st-last.t;if(gap>20&&gap<400)o.int=o.int?o.int+(gap-o.int)*.1:gap;}
  o.dTarget=clamp((o.int||120)+(o.jit||0)+40,120,600);
  if(jump||!last){b.length=0;b.push({t:st-1,x:o.x,y:o.y});}
  else if(st-last.t>300&&(last.x!==o.x||last.y!==o.y))b.push({t:st-110,x:last.x,y:last.y}); // starting to walk after standing still: ease in
  if(last&&st<=last.t)return;b.push({t:st,x:o.x,y:o.y});if(b.length>20)b.splice(0,b.length-20);}
function netPos(o){const b=o.buf;if(!b||!b.length)return [o.x,o.y];
  // if we ever run out of positions while they walk, grow the delay by the shortfall at once, then let it shrink slowly
  o.bump=(o.bump||0)*.995;
  const want=Math.min(700,(o.dTarget||NET_DELAY)+o.bump);o.delay=o.delay===undefined?want:o.delay+(want-o.delay)*(want>o.delay?.2:.02);
  const rt=Date.now()-(o.off||0)-o.delay;
  {const l=b[b.length-1],p=b[b.length-2];if(p&&rt>l.t+20&&(l.x!==p.x||l.y!==p.y)&&rt-l.t<600)o.bump=Math.min(400,o.bump+(rt-l.t)*.5);}
  if(rt<=b[0].t)return [b[0].x,b[0].y];
  for(let i=b.length-1;i>0;i--){const a=b[i-1],c=b[i];if(rt>=a.t&&rt<=c.t){if(Math.hypot(c.x-a.x,c.y-a.y)>300)return [c.x,c.y];const k=(rt-a.t)/Math.max(1,c.t-a.t);return [a.x+(c.x-a.x)*k,a.y+(c.y-a.y)*k];}}
  const l=b[b.length-1],p=b[b.length-2];
  if(p&&rt-l.t<80&&l.t-p.t>0&&l.t-p.t<300){const k=(rt-l.t)/(l.t-p.t);return [l.x+(l.x-p.x)*k,l.y+(l.y-p.y)*k];} // a short guess past the newest update
  return [l.x,l.y];}
function netTick(dt){
  for(const o of NET.others.values()){if(o.z!==zoneId)continue;const[nx,ny]=netPos(o),dx=nx-o.rx,dy=ny-o.ry,d=Math.hypot(dx,dy);
    o.rx=nx;o.ry=ny;
    if(o.moving||d>.5)o.walkT+=dt;if(Math.abs(dx-dy)>.3)o.face=sface(dx,dy);}
  if(!NET.room||!P||now<NET.sendT)return;NET.sendT=now+(NET.viaBroker?.15:.125);
  if(typeof netFresh==='function'){NET.hits=netFresh(NET.hits);NET.vh=netFresh(NET.vh);NET.evs=netFresh(NET.evs);}
  const s={v:1,n:P.name,c:P.cls,z:zoneId,x:Math.round(P.x),y:Math.round(P.y),f:P.face,b:P.back?1:0,lk:lookCode(P.look),lv:P.lv,mv:P.moving?1:0,st:P.sitting?1:0,d:P.dead?1:0,
    w:P.eq.weapon?P.eq.weapon.id:null,h:P.eq.head?P.eq.head.id:null,ar:P.eq.armor?P.eq.armor.id:null,hp:Math.round(P.hp/Math.max(1,S?S.maxhp:1)*100),ch:NET.myChat,em:NET.myEmote||null,
    id:NET.myId,zt:NET.zt,vd:typeof TR!=='undefined'&&TR.vend?TR.vend.title:null,hd:document.hidden?1:0,hx:NET.hits};if(NET.sp&&NET.sp.length)s.sp=NET.sp;if(NET.vh&&NET.vh.length)s.hv=NET.vh;{const t=P.target;if(t&&!t.dead&&!t.pvp&&mobs[t.idx]===t)s.tg=t.idx;}if(loot.length&&typeof myGroundLoot==='function'){const gl=myGroundLoot();if(gl.length)s.gl=gl;}if(NET.dl&&NET.dl.length)s.dl=NET.dl;if(typeof petPresence==='function'){const pt=petPresence();if(pt)s.pt=pt;}if(typeof myTitle==='function'){const ti=myTitle();if(ti)s.ti=ti;}if(P.casting&&P.casting.id)s.cs=P.casting.id;
  if(!zoneHost()&&othersHere()&&mobs.length){s.ev=NET.evs;
    s.mb=mobs.map(m=>[Math.round(m.x),Math.round(m.y),m.dead?0:Math.round(clamp(m.hp/m.d.hp,0,1)*1000),(m.dead?1:0)|(m.moving?2:0)|(m.face<0?4:0)|(m.state==='chase'?8:0)|(m.slowUntil>now?16:0)|(m.ailUntil>now?(m.ail==='freeze'?32:64):0)]);}
  const j=JSON.stringify(s);if(j===NET.lastSent)return;NET.lastSent=j;s.ts=Date.now();NET.room.presence(s).catch(()=>{});
}

/* ================= emotes ================= */
const EMOTES=[['heart','Love'],['wow','Surprise'],['huh','Huh?'],['note','Sing'],['smile','Happy'],['angry','Angry'],['sweat','Oops'],['gg','Good game'],['zzz','Sleepy'],['thx','Thanks'],['cry','Sad'],['star','Amazing']];
const EMOTE_KEYS=EMOTES.map(e=>e[0]);
function drawEmoteIcon(g,k,x,y,s){
  g.save();g.translate(x,y);g.scale(s/20,s/20);g.lineCap='round';g.lineJoin='round';
  const txt=(t,c,sz)=>{g.font=`800 ${sz}px "Alegreya Sans",sans-serif`;g.textAlign='center';g.textBaseline='middle';g.fillStyle=c;g.fillText(t,0,1);};
  switch(k){
    case 'heart':g.fillStyle='#e8435a';g.beginPath();g.moveTo(0,8);g.bezierCurveTo(-14,-2,-8,-14,0,-6);g.bezierCurveTo(8,-14,14,-2,0,8);g.fill();break;
    case 'wow':txt('!','#d9483f',24);break;
    case 'huh':txt('?','#3a78c8',24);break;
    case 'note':g.fillStyle='#8a5ad0';g.beginPath();g.ellipse(-4,6,4.5,3.5,-.4,0,7);g.fill();g.fillRect(-0.5,-10,2.5,16);g.beginPath();g.moveTo(2,-10);g.quadraticCurveTo(10,-6,7,1);g.lineTo(2,-4);g.fill();break;
    case 'smile':g.fillStyle='#ffd24a';g.beginPath();g.arc(0,0,10,0,7);g.fill();g.strokeStyle='#5a3a10';g.lineWidth=2;g.beginPath();g.arc(-4,-1,2.5,Math.PI*1.1,Math.PI*1.9);g.stroke();g.beginPath();g.arc(4,-1,2.5,Math.PI*1.1,Math.PI*1.9);g.stroke();g.beginPath();g.arc(0,2,5,.2,Math.PI-.2);g.stroke();break;
    case 'angry':g.strokeStyle='#d9483f';g.lineWidth=3;for(const [a,b] of [[-1,-1],[1,-1],[-1,1],[1,1]]){g.beginPath();g.moveTo(a*2,b*8);g.quadraticCurveTo(a*2,b*2,a*8,b*2);g.stroke();}break;
    case 'sweat':g.fillStyle='#5ab0f0';g.beginPath();g.moveTo(0,-11);g.quadraticCurveTo(9,2,0,9);g.quadraticCurveTo(-9,2,0,-11);g.fill();g.fillStyle='rgba(255,255,255,.7)';g.beginPath();g.ellipse(-2.5,2,1.6,3,0,0,7);g.fill();break;
    case 'gg':txt('GG','#d99a1e',17);break;
    case 'zzz':txt('z',  '#5a6aa0',11);g.translate(5,-6);txt('Z','#5a6aa0',15);break;
    case 'thx':txt('THX','#3f8a4c',12);break;
    case 'cry':g.fillStyle='#ffd24a';g.beginPath();g.arc(0,0,10,0,7);g.fill();g.strokeStyle='#5a3a10';g.lineWidth=2;g.beginPath();g.moveTo(-6,-2);g.lineTo(-2,-2);g.moveTo(2,-2);g.lineTo(6,-2);g.stroke();g.beginPath();g.arc(0,7,4,Math.PI+.3,-.3);g.stroke();g.fillStyle='#5ab0f0';g.fillRect(-6,0,2.5,7);g.fillRect(4,0,2.5,7);break;
    case 'star':g.fillStyle='#ffcf3a';g.beginPath();for(let i=0;i<10;i++){const r=i%2?4.5:11,a=-Math.PI/2+i*Math.PI/5;g.lineTo(Math.cos(a)*r,Math.sin(a)*r);}g.closePath();g.fill();break;
  }
  g.restore();
}
function drawEmote(k,x,y,age){
  const pop=age<.18?.4+age/.18*.7:age<.28?1.1-(age-.18):1,fade=age>2.6?Math.max(0,1-(age-2.6)/.4):1;
  ctx.save();ctx.globalAlpha=fade;ctx.translate(x,y-Math.min(age,.3)*20);ctx.scale(pop,pop);
  ctx.fillStyle='rgba(255,252,240,.96)';ctx.strokeStyle='#3a2f1e';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(0,0,15,0,7);ctx.fill();ctx.stroke();
  ctx.beginPath();ctx.moveTo(-4,13);ctx.lineTo(0,20);ctx.lineTo(4,13);ctx.fill();
  drawEmoteIcon(ctx,k,0,0,20);ctx.restore();
}
function doEmote(k){if(!P||P.dead||!EMOTE_KEYS.includes(k))return;P.emote={k,start:now};NET.myEmote={i:++NET.chatId,k,t:Date.now()};NET.lastSent='';NET.sendT=0;sfx('pop');}

