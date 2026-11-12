"use strict";
/* ================= #48 chat rooms =================
   Named rooms anyone can join from any region or channel: /join name (creates it if new), /part to leave,
   /rooms to see the busiest, /room text (or type with the Room tab open) to talk. One room at a time.
   The server keeps the rooms (routes/embervale/social.js); muted players' lines are hidden as usual. */
const CR={room:null,members:[]};
function roomsAttach(sock){
  sock.on('connect',()=>{const want=CR.room;CR.room=null;CR.members=[];if(want)setTimeout(()=>soc('roomJoin',{name:want}),800);});
  sock.on('room',st=>{const was=CR.room;
    if(!st||typeof st!=='object'){CR.room=null;CR.members=[];if(was)addLog(`You left the room ${was}.`);roomTabLabel();return;}
    CR.room=clean(st.name,20);CR.members=Array.isArray(st.members)?st.members.slice(0,50).map(n=>clean(n,16)):[];
    if(was!==CR.room)logLine('room',`[${CR.room}] `,`You joined. ${CR.members.length} here: ${CR.members.join(', ')}`);
    else if(st.note&&!(typeof isMuted==='function'&&isMuted(clean(st.note,40).split(' ')[0])))logLine('room',`[${CR.room}] `,clean(st.note,40)+'.');
    roomTabLabel();});
  sock.on('roomChat',m=>{if(!m)return;const from=clean(m.from,16),text=clean(m.text,120);if(!text||(typeof isMuted==='function'&&isMuted(from)))return;
    logLine('room',`[${clean(m.room,20)}] ${from}: `,text);if(from!==P?.name)sfx('ping');});
  sock.on('roomList',list=>{if(!Array.isArray(list))return;
    addLog(list.length?'Chat rooms: '+list.slice(0,20).map(r=>`${clean(r.name,20)} (${Math.max(0,r.n|0)})`).join(' · ')+'. Join one with /join name.':'No chat rooms are open. Start one with /join name.');});
}
function roomTabLabel(){const b=document.querySelector('#logTabs [data-tab="room"]');if(b)b.textContent=CR.room?`Room: ${CR.room}`:'Room';}
const _chatCommandR=chatCommand;
chatCommand=function(k,arg){
  if(k==='join'){if(!arg){addLog('Usage: /join name (letters and numbers, 2-20).');return true;}if(!NET.room){addLog('Chat rooms need the game server (you are offline).','l-bad');return true;}soc('roomJoin',{name:arg});return true;}
  if(k==='part'){if(!CR.room)addLog('You are not in a chat room.');else soc('roomLeave',{});return true;}
  if(k==='rooms'){soc('roomList',{});return true;}
  if(k==='room'||k==='c'){if(!CR.room){addLog('Join a chat room first: /join name.');return true;}if(arg)soc('roomChat',{text:arg});else addLog(`Room ${CR.room}: ${CR.members.join(', ')}`);return true;}
  return _chatCommandR(k,arg);};
CMD_HELP.push(['/join name, /part, /rooms, /room text','chat rooms across all regions']);
const _sendChatR=sendChat;
sendChat=function(raw){const t=clean(raw,120);if(t&&t[0]!=='/'&&SOC.tab==='room'&&CR.room){soc('roomChat',{text:t});return;}_sendChatR(raw);};
