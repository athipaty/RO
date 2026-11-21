"use strict";
/* ================= player fights checked by the server (v1.46.2) =================
   When the game server says "pvpReady", hits on other players (duels, the arena, guild war) go to the server
   ("pvpHit") instead of riding in your presence. The server checks the two of you really are fighting, stand close
   enough, aren't hitting impossibly fast, and caps the damage for the attacker's level; only then does the hurt
   player get it ("pvpHurt"). Their game still takes off their own DEF, exactly as before.
   Your presence says pv:1 while this works. Hits from a player whose presence says pv:1 are only accepted through
   the server, so a changed game can't skip the checks. With an older game on either side, or on the public-broker
   backup, hits travel the old way (in presence), so fights always work. */
const PVPS={sock:null,on:false,duelPeer:null};
const PVP_HIT_KINDS={hit:1,ah:1,gh:1};
function pvpSrvOn(){return !!(PVPS.on&&PVPS.sock&&PVPS.sock.connected&&NET.room&&NET.room.server&&!NET.viaBroker);}

// the server connection (set up in net.js through arenaAttach)
const _arenaAttachPS=arenaAttach;
arenaAttach=function(sock){_arenaAttachPS(sock);PVPS.sock=sock;PVPS.on=false;PVPS.duelPeer=null;
  sock.on('pvpReady',m=>{PVPS.on=!!(m&&m.v>=1);PVPS.duelPeer=null;NET.lastSent='';NET.sendT=0;});
  sock.on('disconnect',()=>{PVPS.on=false;PVPS.duelPeer=null;});
  sock.on('pvpHurt',m=>{try{pvpHurt(m);}catch(e){}});};

// my hits: through the server when it and my opponent's game both can
const _dlSendPS=dlSend;
dlSend=function(to,k,extra){
  if(PVP_HIT_KINDS[k]&&pvpSrvOn()){const o=dlOther(to);
    if(o&&o.pv===1&&o.peer){NET.dlId++;const x=extra||{};PVPS.sock.emit('pvpHit',{to:o.peer,k,d:x.d,c:x.c?1:0,...(x.m?{m:x.m}:{})});return;}}
  return _dlSendPS(to,k,extra);};

// hits on me that the server passed on: handled by the same code as before (duel.js, arena.js, guildwar.js),
// through a stand-in of the attacker so their own message counters are left alone
function pvpHurt(m){if(!m||!PVP_HIT_KINDS[m.k])return;const o=NET.others.get(String(m.from||''));if(!o)return;
  const px=Object.create(o);px.__srv=true;px.dlSeen=0;px.arSeen=0;px.ghSeen=0;
  duelRecv(px,[{i:1,to:NET.myId,k:m.k,d:fin(m.d),c:m.c?1:0,...(m.m?{m:String(m.m)}:{})}],false);}

// hits riding in presence from a player whose game uses the server: ignored (they must come through it)
const _duelRecvPS=duelRecv;
duelRecv=function(o,arr,fresh){
  if(o&&!o.__srv&&Array.isArray(arr)&&o.pv===1&&pvpSrvOn())arr=arr.filter(e=>!(e&&typeof e==='object'&&PVP_HIT_KINDS[e.k]));
  return _duelRecvPS(o,arr,fresh);};

// tell the server who I'm duelling (it lets hits through only when both of us say so); again after a reconnect
const _netTickPS=netTick;
netTick=function(dt){_netTickPS(dt);if(!pvpSrvOn())return;
  const o=typeof DUEL!=='undefined'&&DUEL?dlOther(DUEL.id):null,want=o&&o.peer?o.peer:null;
  if(want!==PVPS.duelPeer){PVPS.duelPeer=want;PVPS.sock.emit(want?'duelOn':'duelOff',want?{peer:want}:{});}};
