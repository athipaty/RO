"use strict";
/* ================= party voice chat (v1.52.0) =================
   In a party, press 🎙 in the party box to join the party's voice chat and talk live with the others who joined; the
   microphone button beside it mutes you, and the name of whoever is talking lights up. Press 🎙 again to leave.
   The voice goes straight between the players' browsers (WebRTC, every member to every member); the game server only
   passes the connection setup between members of the same party (routes/embervale/voice.js). The browser asks for the
   microphone the first time. Leaving the party (or the game) leaves its voice chat. */
const VC={on:false,muted:false,stream:null,pcs:new Map(),peers:[],sock:null,ctx:null,meters:new Map(),joining:false};
const VC_ICE=[{urls:['stun:stun.l.google.com:19302','stun:stun1.l.google.com:19302']}];
const vcSend=(ev,d)=>{if(VC.sock&&VC.sock.connected){VC.sock.emit(ev,d||{});return true;}return false;};

/* ---- the server connection ---- */
{const _saVC=socialAttach;socialAttach=function(sock){_saVC.apply(this,arguments);VC.sock=sock;
  sock.on('vcState',m=>{try{vcState(m);}catch(e){}});
  sock.on('vcSig',m=>{try{vcSig(m);}catch(e){}});
  sock.on('disconnect',()=>{if(VC.on)vcLeave(true);});};}

/* ---- joining and leaving ---- */
/* (v1.52.1) listen only: join without a microphone (the browser is never asked for it) and just hear the party. If the
   microphone is refused or missing, you join to listen instead of not at all. VC.listen is true while listening only. */
async function vcJoin(listenOnly){if(VC.on||VC.joining)return;if(!SOC.party){addLog('Join a party first to use voice chat.','l-bad');return;}
  VC.joining=true;VC.stream=null;let why='';
  if(!listenOnly){if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia)why='This browser cannot use a microphone here, so you join to listen.';
    else try{VC.stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true}});}
    catch(e){why='The microphone was not allowed, so you join to listen. Allow it in the browser to talk too.';}}
  VC.joining=false;if(!SOC.party){vcStop();return;}
  VC.on=true;VC.muted=false;VC.listen=!VC.stream;if(VC.stream)vcMeter('me',VC.stream);
  if(!vcSend('vcJoin')){addLog('Voice chat needs the game server, which is not reachable right now.','l-bad');vcStop();return;}
  if(why)addLog(why,'l-bad');
  addLog(VC.listen?'You are listening to the party voice chat (your microphone is not used). 🎙 leaves.':'You joined the party voice chat. 🎤 mutes you; 🎙 leaves.','l-good');sfx('click');renderParty();}
// listening only, then wanting to talk: join again with the microphone
async function vcTalk(){if(!VC.on||!VC.listen)return;vcLeave(true);await new Promise(r=>setTimeout(r,300));vcJoin(false);}
function vcStop(){VC.listen=false;for(const [p] of VC.pcs)vcDrop(p);VC.pcs.clear();if(VC.stream)for(const t of VC.stream.getTracks())t.stop();VC.stream=null;
  for(const [k,m] of VC.meters){try{m.src.disconnect();}catch(e){}}VC.meters.clear();VC.on=false;VC.peers=[];}
function vcLeave(quiet){if(!VC.on)return;vcSend('vcLeave');vcStop();if(!quiet)addLog('You left the party voice chat.');renderParty();}
function vcMute(){if(VC.on&&VC.listen){vcTalk();return;}if(!VC.on||!VC.stream)return;VC.muted=!VC.muted;for(const t of VC.stream.getAudioTracks())t.enabled=!VC.muted;
  floatT(P.x,P.y-50,VC.muted?'Muted':'Mic on','#cfe8ff',12);renderParty();}

/* ---- the connections, one per party member in voice ---- */
function vcState(m){if(m&&m.why)addLog(clean(m.why,80),'l-bad');
  const peers=Array.isArray(m&&m.peers)?m.peers.map(String).slice(0,12):[];const me=selfPeer();VC.peers=peers;
  if(!VC.on){renderParty();return;}
  if(!peers.includes(me)&&VC.sock&&VC.sock.connected){vcSend('vcJoin');return;} // the server forgot me (a new connection): join again
  for(const p of peers)if(p!==me&&!VC.pcs.has(p)&&inParty(p))vcPeer(p,me<p);   // the lower id makes the offer
  for(const [p] of VC.pcs)if(!peers.includes(p))vcDrop(p);
  renderParty();}
function vcPeer(peer,offer){const pc=new RTCPeerConnection({iceServers:VC_ICE});const e={pc,audio:null,failed:false};VC.pcs.set(peer,e);
  if(VC.stream)for(const t of VC.stream.getTracks())pc.addTrack(t,VC.stream);
  else pc.addTransceiver('audio',{direction:'recvonly'}); // listening only: receive, send nothing
  pc.onicecandidate=ev=>{if(ev.candidate)vcSend('vcSig',{to:peer,d:{c:ev.candidate.toJSON()}});};
  pc.ontrack=ev=>{const st=ev.streams[0];if(!st)return;if(!e.audio){e.audio=new Audio();e.audio.autoplay=true;e.audio.playsInline=true;}
    e.audio.srcObject=st;e.audio.play().catch(()=>{});vcMeter(peer,st);};
  pc.onconnectionstatechange=()=>{if(pc.connectionState==='failed'&&!e.failed){e.failed=true;
    const nm=(SOC.party&&SOC.party.members.find(x=>x.peer===peer)||{}).name||'a party member';
    addLog(`Voice could not reach ${nm}: one of your networks blocks direct connections.`,'l-bad');}};
  if(offer)pc.createOffer().then(o=>pc.setLocalDescription(o)).then(()=>vcSend('vcSig',{to:peer,d:{sdp:pc.localDescription.toJSON()}})).catch(()=>{});
  return e;}
async function vcSig(m){if(!VC.on||!m||!m.d)return;const from=String(m.from||'');if(!from||!inParty(from))return;
  let e=VC.pcs.get(from);const d=m.d;
  if(d.sdp&&d.sdp.type==='offer'){if(!e)e=vcPeer(from,false);await e.pc.setRemoteDescription(d.sdp);const a=await e.pc.createAnswer();await e.pc.setLocalDescription(a);
    vcSend('vcSig',{to:from,d:{sdp:e.pc.localDescription.toJSON()}});}
  else if(d.sdp&&d.sdp.type==='answer'&&e){await e.pc.setRemoteDescription(d.sdp);}
  else if(d.c&&e){try{await e.pc.addIceCandidate(d.c);}catch(err){}}}
function vcDrop(peer){const e=VC.pcs.get(peer);if(!e)return;try{e.pc.close();}catch(err){}if(e.audio){e.audio.srcObject=null;}VC.pcs.delete(peer);
  const mt=VC.meters.get(peer);if(mt){try{mt.src.disconnect();}catch(err){}VC.meters.delete(peer);}}

/* ---- who is talking: a little level meter per voice ---- */
function vcMeter(who,stream){try{if(!VC.ctx)VC.ctx=new (window.AudioContext||window.webkitAudioContext)();if(VC.ctx.state==='suspended')VC.ctx.resume().catch(()=>{});
  const src=VC.ctx.createMediaStreamSource(stream),an=VC.ctx.createAnalyser();an.fftSize=512;src.connect(an);VC.meters.set(who,{src,an,buf:new Uint8Array(an.fftSize),talk:false});}catch(e){}}
setInterval(()=>{if(!VC.on||!SOC.party)return;const box=document.getElementById('partyBox');if(!box)return;
  for(const [who,m] of VC.meters){m.an.getByteTimeDomainData(m.buf);let s=0;for(const v of m.buf){const x=(v-128)/128;s+=x*x;}
    const t=performance.now();if(Math.sqrt(s/m.buf.length)>.04&&!(who==='me'&&VC.muted))m.loud=t; // stays lit 0.5 s after a sound, so it does not flicker between words
    const talk=t-(m.loud||-1e9)<500;if(talk===m.talk)continue;m.talk=talk;
    const peer=who==='me'?selfPeer():who,row=box.querySelector(`.pmr[data-peer="${CSS.escape(peer)}"]`);if(row)row.classList.toggle('vctalk',talk);}},150);

/* ---- the party box: 🎙 join/leave, 🎤 mute, and who is in voice ---- */
{const _rpVC=renderParty;renderParty=function(){_rpVC.apply(this,arguments);const box=document.getElementById('partyBox');if(!box)return;
  if(!SOC.party){if(VC.on)vcLeave(true);return;}
  const hd=box.querySelector('.phd');if(!hd)return;let jb=document.getElementById('pVoice'),mb=document.getElementById('pMic');
  if(!jb){jb=document.createElement('button');jb.id='pVoice';jb.type='button';jb.className='btn small';jb.addEventListener('click',ev=>{ev.stopPropagation();VC.on?vcLeave():vcJoin();});
    mb=document.createElement('button');mb.id='pMic';mb.type='button';mb.className='btn small';mb.addEventListener('click',ev=>{ev.stopPropagation();vcMute();});
    const leave=document.getElementById('pLeave');hd.insertBefore(jb,leave);hd.insertBefore(mb,leave);}
  jb.textContent='🎙';jb.classList.toggle('on',VC.on);jb.title=VC.on?'Leave the party voice chat':'Join the party voice chat';jb.setAttribute('aria-label',jb.title);
  mb.hidden=!VC.on;mb.textContent=VC.listen?'🎧':VC.muted?'🔇':'🎤';mb.title=VC.listen?'Listening only: tap to talk too':VC.muted?'Unmute your microphone':'Mute your microphone';mb.setAttribute('aria-label',mb.title);
  for(const row of box.querySelectorAll('.pmr[data-peer]'))row.classList.toggle('vcin',VC.peers.includes(row.dataset.peer));};}
addEventListener('pagehide',()=>{if(VC.on)vcLeave(true);});

if(typeof TH!=='undefined')Object.assign(TH,{'Join the party voice chat':'เข้าห้องพูดคุยของปาร์ตี้','Leave the party voice chat':'ออกจากห้องพูดคุยของปาร์ตี้',
  'Mute your microphone':'ปิดไมโครโฟน','Unmute your microphone':'เปิดไมโครโฟน','Muted':'ปิดเสียง','Mic on':'เปิดไมค์',
  'Join a party first to use voice chat.':'เข้าร่วมปาร์ตี้ก่อนเพื่อใช้แชทเสียง','This browser cannot use a microphone here.':'เบราว์เซอร์นี้ใช้ไมโครโฟนที่นี่ไม่ได้',
  'Voice chat needs your microphone. Allow it in the browser to talk with your party.':'แชทเสียงต้องใช้ไมโครโฟน อนุญาตในเบราว์เซอร์เพื่อคุยกับปาร์ตี้',
  'Voice chat needs the game server, which is not reachable right now.':'แชทเสียงต้องใช้เซิร์ฟเวอร์เกม ซึ่งตอนนี้เชื่อมต่อไม่ได้',
  'You joined the party voice chat. 🎤 mutes you; 🎙 leaves.':'คุณเข้าห้องพูดคุยของปาร์ตี้แล้ว 🎤 ปิดเสียง 🎙 ออก','You are listening to the party voice chat (your microphone is not used). 🎙 leaves.':'คุณกำลังฟังแชทเสียงของปาร์ตี้ (ไม่ใช้ไมโครโฟน) 🎙 ออก','Listening only: tap to talk too':'ฟังอย่างเดียว: แตะเพื่อพูดด้วย','This browser cannot use a microphone here, so you join to listen.':'เบราว์เซอร์นี้ใช้ไมโครโฟนไม่ได้ จึงเข้าร่วมเพื่อฟังอย่างเดียว','The microphone was not allowed, so you join to listen. Allow it in the browser to talk too.':'ไม่ได้อนุญาตไมโครโฟน จึงเข้าร่วมเพื่อฟังอย่างเดียว อนุญาตในเบราว์เซอร์เพื่อพูดด้วย','You left the party voice chat.':'คุณออกจากห้องพูดคุยของปาร์ตี้แล้ว'});
if(typeof TH_PAT!=='undefined')TH_PAT.unshift([/^Voice could not reach (.+): one of your networks blocks direct connections\.$/,'แชทเสียงเชื่อมต่อกับ $1 ไม่ได้: เครือข่ายของฝ่ายใดฝ่ายหนึ่งบล็อกการเชื่อมต่อโดยตรง']);
