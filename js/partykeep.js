"use strict";
/* ================= keep your party after a restart (v1.42.2) =================
   A party lives on the game server and ends when your connection does, so reloading the game used to drop you from it.
   Now the game remembers your party mates (on this device, per hero). When you come back and one of them is online:
     - whoever is leading (or, when neither of you is in a party, the one whose name comes first) invites the other,
     - and an invite from someone you were just in a party with is accepted by itself.
   Leaving the party yourself, or being put out of it while your mates are still online, forgets it; so does an hour
   without playing together. Nothing changes on the server. */
const PK={sent:new Map()};
const pkKey=()=>P&&P.name?'embervale.partyKeep.'+P.name.toLowerCase():null;
function pkLoad(){try{const k=pkKey();if(!k)return null;const d=JSON.parse(localStorage.getItem(k)||'null');if(!d||!Array.isArray(d.mates)||Date.now()-d.ts>3600e3)return null;return d;}catch(e){return null;}}
function pkSave(d){try{const k=pkKey();if(!k)return;if(!d)localStorage.removeItem(k);else localStorage.setItem(k,JSON.stringify(d));}catch(e){}}
const pkLow=s=>String(s||'').toLowerCase();
// remember who you are with, whenever the party changes
{const _rp=renderParty;renderParty=function(){const r=_rp.apply(this,arguments);try{const p=SOC.party;
  if(p&&P){const me=typeof selfPeer==='function'?selfPeer():null,mates=p.members.filter(m=>m.peer!==me).map(m=>pkLow(m.name)).filter(Boolean);if(mates.length)pkSave({mates,ts:Date.now()});}}catch(e){}return r;};}
// leaving yourself or kicking someone: forget them
{const _soc=soc;soc=function(ev,data){try{if(ev==='partyLeave')pkSave(null);
  if(ev==='partyKick'&&data&&data.peer){const o=NET.others.get(data.peer),d=pkLoad();if(o&&d){d.mates=d.mates.filter(n=>n!==pkLow(o.n));pkSave(d.mates.length?d:null);}}}catch(e){}return _soc.apply(this,arguments);};}
// the party ends while your mates are still online (you were put out, or it broke up): forget it.
// If they went offline (a restart), keep it so the party can come back together.
function pkAttach(sock){if(!sock||sock.__pk||typeof sock.on!=='function')return;sock.__pk=1;let was=null;
  sock.on('party',st=>{try{const now_=st&&Array.isArray(st.members);
    if(was&&!now_){const d=pkLoad();const stillOn=d&&[...NET.others.values()].some(o=>o&&o.n&&d.mates.includes(pkLow(o.n)));if(stillOn)pkSave(null);}
    was=now_?st:null;}catch(e){}});
  // an invite from someone you were just in a party with: accept it straight away
  sock.on('partyInvite',m=>{try{const d=pkLoad();if(!d||SOC.party||!m||!m.fromPeer)return;if(!d.mates.includes(pkLow(m.from)))return;
    setTimeout(()=>{if(SOC.party)return;soc('partyAccept',{peer:String(m.fromPeer)});if(typeof hideInvite==='function')hideInvite();addLog(`Back in your party with ${clean(m.from,16)}.`,'l-good');},300);}catch(e){}});}
setInterval(()=>{try{if(typeof SOCK!=='undefined'&&SOCK)pkAttach(SOCK);}catch(e){}},1000);
// invite your mates back when they come online
setInterval(()=>{try{if(!P||!running||typeof SOCK==='undefined'||!SOCK||!SOCK.connected)return;const d=pkLoad();if(!d)return;
  const me=typeof selfPeer==='function'?selfPeer():null,lead=!SOC.party||SOC.party.leader===me;if(!lead)return;
  for(const [peer,o] of NET.others){if(!o||!o.n||!d.mates.includes(pkLow(o.n))||inParty(peer))continue;
    if(!SOC.party&&pkLow(P.name)>pkLow(o.n))continue; // nobody leads yet: the name that comes first sends the invite
    const t=PK.sent.get(peer)||0;if(Date.now()-t<20000)continue;PK.sent.set(peer,Date.now());soc('partyInvite',{peer});}}catch(e){}},2500);
if(typeof TH_PAT!=='undefined')TH_PAT.unshift([/^Back in your party with (.+)\.$/,'กลับเข้าปาร์ตี้กับ $1 แล้ว']);
