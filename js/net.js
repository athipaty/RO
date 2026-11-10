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
    socialAttach(sock);
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
    // server-run monsters: the server acts as the region's monster host
    sock.on('mobs',m=>{if(!m||typeof m.z!=='string'||!Array.isArray(m.mb)||m.mb.length>120)return;
      NET.srv={id:'server',z:m.z,mb:m.mb,ev:Array.isArray(m.ev)?m.ev.slice(-40):[],at:now};});
    // server-run monsters: the server acts as the region's monster host
    sock.on('mobs',m=>{if(!m||typeof m.z!=='string'||!Array.isArray(m.mb)||m.mb.length>120)return;
      NET.srv={id:'server',z:m.z,mb:m.mb,ev:Array.isArray(m.ev)?m.ev.slice(-40):[],at:now};});
    sock.on('left',p=>{if(cb&&p&&seen.delete(p.peer))cb({joined:[],updated:[],left:[{peer:p.peer}]});});
    sock.on('disconnect',()=>{if(ready){NET.status='connecting';updateWho();}});
    sock.on('connect_error',()=>{if(!ready){ready=true;clearTimeout(fail);sock.close();rej(new Error('connect failed'));}});
  }));
}
function netConnect(tries=0){
  if(!window.claude?.use){
    let framed=true;try{framed=window.top!==window;}catch(e){}
    if(framed&&tries<12){setTimeout(()=>netConnect(tries+1),500);return;}
    NET.relay=true;NET.status='connecting';$('#online').textContent='Connecting…';updateWho();
    serverRoom().catch(()=>{NET.viaBroker=true;return mqttRoom();}).then(room=>{NET.room=room;
      room.onPeers(ch=>{
        for(const p of ch.left){const o=NET.others.get(p.peer);if(o&&o.n)addLog(`${o.n} left.`);NET.others.delete(p.peer);}
        for(const p of ch.joined)ingest(p);for(const p of ch.updated)ingest(p);updateOnline();});
      NET.status='online';updateOnline();NET.lastSent='';}).catch(()=>{NET.relay=false;NET.status='offline';updateOnline();});
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
  o.x=clamp(fin(s.x),0,4000);o.y=clamp(fin(s.y),0,4000);o.face=s.f<0?-1:1;o.lv=clamp(Math.floor(fin(s.lv)),1,99);
  o.moving=!!s.mv;o.sitting=!!s.st;o.back=!!s.b;o.look=lookDecode(s.lk);o.vd=s.vd?clean(s.vd,30):null;o.dead=!!s.d;o.wid=typeof s.w==='string'&&ITEMS[s.w]&&ITEMS[s.w].type==='weapon'?s.w:null;o.guest=!!p.guest;
  o.hat=typeof s.h==='string'&&ITEMS[s.h]&&ITEMS[s.h].type==='head'?s.h:null;o.hp=clamp(fin(s.hp),0,100);
  o.id=clean(s.id,16)||null;o.zt=fin(s.zt);o.hd=!!s.hd;
  o.mb=Array.isArray(s.mb)&&s.mb.length<=80?s.mb:null;o.ev=Array.isArray(s.ev)?s.ev.slice(-24):[];o.hx=Array.isArray(s.hx)?s.hx.slice(-24):[];
  if(s.em&&typeof s.em==='object'&&EMOTE_KEYS.includes(s.em.k)){const id=fin(s.em.i);if(id>(o.emSeen||0)){const first=!o.emSeen;o.emSeen=id;if(!(fresh&&first&&Math.abs(Date.now()-fin(s.em.t))>4000)){o.emote={k:s.em.k,start:now};if(o.z===zoneId)sfx('pop');}}}
  if(fresh){addLog(`${o.n} (${CLASSES[o.cls].name} Lv ${o.lv}) is online.`,'l-good');friendSeen(o.n);}
  const msgs=Array.isArray(s.ch)?s.ch.slice(-4):[];
  for(const m of msgs){
    if(!m||typeof m!=='object')continue;const id=fin(m.i);if(id<=o.seen)continue;o.seen=id;
    if(fresh&&!(Math.abs(Date.now()-fin(m.t))<120000))continue;
    if(m.k){const t=announceText(o.n,clean(m.k,8),typeof m.v==='number'?m.v:clean(m.v,16));if(t){addLog('★ '+t,'l-rare');sfx('ping');}continue;}
    const txt=clean(m.s,120);if(!txt)continue;
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
    const info=document.createElement('span');const z=o.z||zoneId;info.textContent=`${CLASSES[o.cls]?.name||'Novice'} Lv ${o.lv||1} · ${ZONES[z]?.name||''}${!me&&z===zoneId?' · here':''}`;
    d.append(nm,info);
    if(peer&&P&&NET.room&&NET.room.server){const bs=document.createElement('div');bs.className='wb';
      const mk=(label,fn)=>{const b=document.createElement('button');b.className='btn small';b.type='button';b.textContent=label;b.addEventListener('click',ev=>{ev.stopPropagation();fn();});bs.appendChild(b);};
      if(!inParty(peer)&&(!SOC.party||SOC.party.leader===selfPeer()))mk('Invite',()=>soc('partyInvite',{peer}));
      mk('Whisper',()=>{openChat();$('#chatIn').value=`/w ${name} `;});
      if(o.vd)mk('Shop',()=>soc('vendView',{peer}));else if(o.z===zoneId)mk('Trade',()=>soc('tradeRequest',{peer}));
      if(!P.friends.some(f=>f.toLowerCase()===String(name).toLowerCase()))mk('+ Friend',()=>{friendToggle(name,true);updateWho();});
      d.appendChild(bs);}
    list.appendChild(d);};
  if(P)row(P.name,{cls:P.cls,lv:P.lv,z:zoneId},true);
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
  ['/exp','your EXP per hour'],['/w Name text, /r text','whisper, reply'],['/invite Name, /p text, /leave, /kick Name','party'],['/friend Name, /unfriend Name, /friends','friends'],['/trade Name, /shop','trade, open a shop'],['/roll','roll a number from 1 to 100 for everyone to see'],['/emotes','list emotes (e.g. /heart, /gg)'],['/clear','clear this log']];
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
  if(k==='job'&&CLASSES[v])return `${n} became a ${CLASSES[v].name}!`;
  if(k==='sig'&&MOBS[v])return `${n} found a ${MOBS[v].name} Sigil!`;
  if(k==='boss'&&MOBS[v]&&MOBS[v].boss)return `${n} helped defeat the ${MOBS[v].name}!`;
  if(k==='drop'&&ITEMS[v]&&rarityOf(v)>=2)return `${n} found a ${RARITY[rarityOf(v)].name.toLowerCase()} ${ITEMS[v].name}!`;
  if(k==='refine'&&typeof v==='string'){const[r,id]=v.split(':');const it=ITEMS[id];if(it&&['weapon','armor','head','accessory'].includes(it.type)&&+r>=7&&+r<=10)return `${n} refined a +${+r} ${it.name}!`;}
  if(k==='story'&&v==='warlord')return `${n} finished the story “The Ember Below” and saved Hearthvale!`;
  if(k==='quest'&&MOBS[v])return `${n} finished a ${MOBS[v].name} hunting contract.`;
  return null;}
function netTick(dt){
  for(const o of NET.others.values()){if(o.z!==zoneId)continue;const d=Math.hypot(o.x-o.rx,o.y-o.ry);
    if(d>300){o.rx=o.x;o.ry=o.y;}else{const k=Math.min(1,dt*9);o.rx+=(o.x-o.rx)*k;o.ry+=(o.y-o.ry)*k;}
    if(o.moving||d>2)o.walkT+=dt;if(Math.abs((o.x-o.rx)-(o.y-o.ry))>1)o.face=sface(o.x-o.rx,o.y-o.ry);}
  if(!NET.room||!P||now<NET.sendT)return;NET.sendT=now+(NET.relay?.15:.12);
  const s={v:1,n:P.name,c:P.cls,z:zoneId,x:Math.round(P.x),y:Math.round(P.y),f:P.face,b:P.back?1:0,lk:lookCode(P.look),lv:P.lv,mv:P.moving?1:0,st:P.sitting?1:0,d:P.dead?1:0,
    w:P.eq.weapon?P.eq.weapon.id:null,h:P.eq.head?P.eq.head.id:null,hp:Math.round(P.hp/Math.max(1,S?S.maxhp:1)*100),ch:NET.myChat,em:NET.myEmote||null,
    id:NET.myId,zt:NET.zt,vd:typeof TR!=='undefined'&&TR.vend?TR.vend.title:null,hd:document.hidden?1:0,hx:NET.hits};
  if(!zoneHost()&&othersHere()&&mobs.length){s.ev=NET.evs;
    s.mb=mobs.map(m=>[Math.round(m.x),Math.round(m.y),m.dead?0:Math.round(clamp(m.hp/m.d.hp,0,1)*1000),(m.dead?1:0)|(m.moving?2:0)|(m.face<0?4:0)|(m.state==='chase'?8:0)|(m.slowUntil>now?16:0)|(m.ailUntil>now?(m.ail==='freeze'?32:64):0)]);}
  const j=JSON.stringify(s);if(j===NET.lastSent)return;NET.lastSent=j;NET.room.presence(s).catch(()=>{});
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

