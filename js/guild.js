"use strict";
/* ================= #49 guilds: name + emblem, ranks, notice, guild chat; saved on the game server for accounts ================= */
const GUILD_COST=10000;
const EMB_SHAPES=['Star','Sword','Crown','Moon','Flame','Leaf'];
const EMB_COLS=['#ffcf5a','#f4f0e6','#e0503a','#5aa8f0','#7fd36a','#c58cff','#ff9a3a','#2a2a2a'];
const EMB_BGS=['#8e2a22','#2e4f8e','#2f6a3a','#4a2e6a','#6a5040','#1e2a38','#a07a22','#e8e0c8'];
const GD={g:null,invite:null,draft:{name:'',emblem:[0,0,0]}};
const guildTag=t=>t&&typeof t==='object'&&typeof t.n==='string'?{n:clean(t.n,20),e:embOk(t.e)}:null;
function embOk(e){return Array.isArray(e)?[EMB_SHAPES.length,EMB_COLS.length,EMB_BGS.length].map((m,i)=>clamp(Math.floor(fin(e[i])),0,m-1)):[0,0,0];}

// a small shield with a symbol on it
function drawEmblem(g,e,x,y,s){e=embOk(e);const[sh,co,bg]=e;g.save();g.translate(x,y);g.scale(s/20,s/20);
  g.fillStyle=EMB_BGS[bg];g.strokeStyle='#1a120a';g.lineWidth=1.6;g.beginPath();g.moveTo(-9,-10);g.lineTo(9,-10);g.lineTo(9,0);g.quadraticCurveTo(9,8,0,11);g.quadraticCurveTo(-9,8,-9,0);g.closePath();g.fill();g.stroke();
  g.fillStyle=EMB_COLS[co];g.strokeStyle=EMB_COLS[co];g.lineWidth=2;g.beginPath();
  if(sh===0){for(let i=0;i<10;i++){const r=i%2?2.6:6.5,a=-Math.PI/2+i*Math.PI/5;g.lineTo(Math.cos(a)*r,Math.sin(a)*r);}g.closePath();g.fill();}
  else if(sh===1){g.fillRect(-1.2,-8,2.4,11);g.fillRect(-4.5,2,9,2);g.fillRect(-1,4,2,3.5);}
  else if(sh===2){g.moveTo(-6.5,3);g.lineTo(-6.5,-4);g.lineTo(-3.5,-1);g.lineTo(0,-6);g.lineTo(3.5,-1);g.lineTo(6.5,-4);g.lineTo(6.5,3);g.closePath();g.fill();}
  else if(sh===3){g.arc(0,0,6.5,Math.PI*.35,Math.PI*1.65);g.arc(2.6,0,5,Math.PI*1.55,Math.PI*.45,true);g.closePath();g.fill();}
  else if(sh===4){g.moveTo(0,-8);g.quadraticCurveTo(7,0,4,5);g.quadraticCurveTo(0,8,-4,5);g.quadraticCurveTo(-7,0,0,-8);g.fill();}
  else{g.ellipse(0,0,4,7.5,.6,0,7);g.fill();g.strokeStyle=EMB_BGS[bg];g.lineWidth=1;g.beginPath();g.moveTo(-3.5,4.5);g.lineTo(3.5,-4.5);g.stroke();}
  g.restore();}
// guild line under a character's name
function guildLabel(t,x,y){if(!t)return;ctx.font='700 11px "Alegreya Sans",sans-serif';const w=ctx.measureText(t.n).width;
  drawEmblem(ctx,t.e,x-w/2-8,y-4,13);label(t.n,x+7,y,'#e8c25a',11);}
const myGuildTag=()=>GD.g?{n:GD.g.name,e:GD.g.emblem}:null;

function guildAttach(sock){
  sock.on('connect',()=>{GD.g=null;});
  sock.on('guild',st=>{const was=GD.g;
    GD.g=st&&typeof st==='object'&&Array.isArray(st.members)?{id:String(st.id),name:clean(st.name,20),emblem:embOk(st.emblem),notice:clean(st.notice,120),me:clean(st.me,16),
      members:st.members.slice(0,30).map(m=>({u:clean(m.u,16),c:clean(m.c,16),rank:['leader','officer','member'].includes(m.rank)?m.rank:'member',on:!!m.on,z:ZONES[m.z]?m.z:null}))}:null;
    if(was&&!GD.g)addLog('You are no longer in a guild.');
    if(panelKind==='guild')refreshPanel();});
  sock.on('guildCreated',m=>{P.gold=Math.max(0,P.gold-GUILD_COST);sfx('fanfare');fx.push({k:'lvl',x:P.x,y:P.y-30,t0:now,dur:2,txt:'GUILD FOUNDED',col:'#ffcf5a'});
    addLog(`You founded ${clean(m&&m.name,20)}! Invite players from the online list (the ● online button).`,'l-rare');save(true);});
  sock.on('guildInvite',m=>{if(!m||!m.gid||typeof isMuted==='function'&&isMuted(m.from))return;GD.invite={gid:String(m.gid),guild:clean(m.guild,20),from:clean(m.from,16),emblem:embOk(m.emblem)};showGuildInvite();});
  sock.on('guildChat',m=>{if(!m)return;const from=clean(m.from,16),text=clean(m.text,120);if(!text||(from&&typeof isMuted==='function'&&isMuted(from)))return;logLine('guild',from?`[Guild] ${from}: `:'[Guild] ',text);if(from)sfx('ping');});
}
function gsoc(ev,data){if(!ACC.token){addLog('Guilds need an account. Log in from the title screen to create or join one.','l-bad');return false;}return soc(ev,data);}
const myGRank=()=>GD.g&&(GD.g.members.find(m=>m.u===GD.g.me)||{}).rank;
const canInvite=()=>['leader','officer'].includes(myGRank());

/* ---- invitation box ---- */
function showGuildInvite(){let el=document.getElementById('ginvite');
  if(!el){el=document.createElement('div');el.id='ginvite';el.className='frame';el.setAttribute('role','dialog');el.setAttribute('aria-label','Guild invitation');
    el.innerHTML='<canvas width="40" height="40" aria-hidden="true"></canvas><span></span><button class="btn small" data-g="yes">Join</button><button class="btn small" data-g="no">No thanks</button>';
    el.addEventListener('click',ev=>{const b=ev.target.closest('[data-g]');if(!b||!GD.invite)return;gsoc(b.dataset.g==='yes'?'guildAccept':'guildDecline',{gid:GD.invite.gid});GD.invite=null;el.hidden=true;});
    document.body.appendChild(el);}
  const i=GD.invite;el.querySelector('span').innerHTML=`<b>${esc(i.from)}</b> invites you to join <b class="gold">${esc(i.guild)}</b>.`;
  const c=el.querySelector('canvas').getContext('2d');c.clearRect(0,0,40,40);drawEmblem(c,i.emblem,20,20,34);el.hidden=false;sfx('ping');
  clearTimeout(showGuildInvite.t);showGuildInvite.t=setTimeout(()=>{if(GD.invite&&GD.invite.gid===i.gid){gsoc('guildDecline',{gid:i.gid});GD.invite=null;el.hidden=true;}},45000);}

/* ---- guild window (G) ---- */
const RANK_NAME={leader:'Leader',officer:'Officer',member:'Member'};
PANELS.guild=()=>{let h='';
  if(!ACC.token)return `<h2>Guild</h2><p class="say">Guilds belong to accounts, so they follow you to any device. Log in or sign up from the title screen to create or join one.</p>`;
  if(!NET.room||!NET.room.server)return `<h2>Guild</h2><p class="muted">Guilds need the game server, which is not reachable right now.</p>`;
  const g=GD.g;
  if(!g){const d=GD.draft;
    h+=`<h2>Found a guild</h2><div class="sub">Or ask a guild leader or officer to invite you. Founding costs ${fmt(GUILD_COST)} gold.</div>`;
    h+=`<div class="gform"><canvas id="embCv" width="96" height="96" aria-hidden="true"></canvas><div class="grow"><label class="ds" for="gName">Guild name (3–20 letters)</label>`+
      `<input id="gName" maxlength="20" autocomplete="off" value="${esc(d.name)}" placeholder="e.g. Ember Wardens">${embPicker(d.emblem)}</div></div>`;
    h+=`<button class="btn" data-act="gcreate" ${P.gold<GUILD_COST?'disabled':''}>Found guild (${fmt(GUILD_COST)} gold)</button>${P.gold<GUILD_COST?` <span class="muted">You have ${fmt(P.gold)} gold.</span>`:''}`;
    return h;}
  const rk=myGRank(),boss=rk==='leader',staff=boss||rk==='officer',on=g.members.filter(m=>m.on).length;
  h+=`<div class="thead"><canvas id="embCv" width="96" height="96" aria-hidden="true"></canvas><div><h2>${esc(g.name)}</h2><div class="sub">${g.members.length}/30 members · ${on} online · you are ${RANK_NAME[rk]||'a member'}</div></div></div>`;
  h+=`<div class="say gnote">${g.notice?`“${esc(g.notice)}”`:'<span class="muted">No guild notice yet.</span>'}</div>`;
  if(staff)h+=`<div class="grow2"><input id="gNotice" maxlength="120" placeholder="Write a notice for the guild" value="${esc(g.notice)}"><button class="btn small" data-act="gnotice">Post notice</button></div>`;
  h+=`<h3>Members</h3>`;
  const order={leader:0,officer:1,member:2};
  for(const m of [...g.members].sort((a,b)=>order[a.rank]-order[b.rank]||(b.on-a.on)||a.c.localeCompare(b.c))){const me=m.u===g.me;
    h+=`<div class="row gm${m.on?' on':''}"><span class="gdot" aria-hidden="true"></span><div class="grow"><div class="nm">${esc(m.c)}${me?' <span class="muted">(you)</span>':''}</div>`+
      `<div class="ds">${RANK_NAME[m.rank]} · ${m.on?(m.z?ZONES[m.z].name:'online'):'offline'}</div></div>`;
    if(!me&&boss){if(m.rank==='member')h+=`<button class="btn small" data-act="grank" data-arg="${esc(m.u)}:officer">Make officer</button>`;
      else h+=`<button class="btn small" data-act="grank" data-arg="${esc(m.u)}:member">Demote</button>`;
      h+=`<button class="btn small" data-act="grank" data-arg="${esc(m.u)}:leader" title="Hand the guild to ${esc(m.c)}">Make leader</button>`;}
    if(!me&&staff&&order[m.rank]>order[rk])h+=`<button class="btn small" data-act="gkick" data-arg="${esc(m.u)}" aria-label="Remove ${esc(m.c)} from the guild">Remove</button>`;
    h+=`</div>`;}
  h+=`<div class="ds" style="margin:8px 0">${canInvite()?'Invite players from the online list (the ● online button at the top). ':''}Chat with the guild with /g message or the Guild tab.</div>`;
  if(staff)h+=`<details><summary class="ds">Change emblem</summary>${embPicker(g.emblem)}<button class="btn small" data-act="gemblem">Save emblem</button></details>`;
  h+=`<div class="tbtns">`+(boss?`<button class="btn" data-act="gdisband">${GD.armDisband?'Really disband? Click again':'Disband guild'}</button>`:'')+
    `<button class="btn" data-act="gleave" title="${boss&&g.members.length>1?'The guild passes to an officer, or the longest member':''}">Leave guild</button>`+`</div>`;
  return h;};
function embPicker(e){const sw=(arr,k,cur)=>arr.map((c,i)=>`<button class="esw${i===cur?' on':''}" data-act="gemb" data-arg="${k}:${i}" style="background:${c}" aria-label="${k===1?'Symbol colour':'Background'} ${i+1}"></button>`).join('');
  return `<div class="epick"><div class="ds">Symbol</div><div class="erow">${EMB_SHAPES.map((n,i)=>`<button class="btn small${i===e[0]?' on':''}" data-act="gemb" data-arg="0:${i}">${n}</button>`).join('')}</div>`+
    `<div class="ds">Symbol colour</div><div class="erow">${sw(EMB_COLS,1,e[1])}</div><div class="ds">Background</div><div class="erow">${sw(EMB_BGS,2,e[2])}</div></div>`;}
function drawGuildPanel(){const c=document.getElementById('embCv');if(!c)return;const g=c.getContext('2d');g.clearRect(0,0,96,96);
  drawEmblem(g,GD.g?(GD.edit||GD.g.emblem):GD.draft.emblem,48,48,80);}
const _refreshPanelG=refreshPanel;
refreshPanel=function(){const n=document.getElementById('gName'),t=document.getElementById('gNotice'),f=document.activeElement&&document.activeElement.id;
  if(n)GD.draft.name=n.value;const note=t?t.value:null;_refreshPanelG();if(panelKind!=='guild')return;drawGuildPanel();
  const t2=document.getElementById('gNotice');if(t2&&note!==null)t2.value=note;if(f==='gName'||f==='gNotice'){const e=document.getElementById(f);if(e){e.focus();e.setSelectionRange(e.value.length,e.value.length);}}};
PANEL_ACTS.gemb=arg=>{const[k,i]=arg.split(':').map(Number);if(GD.g){GD.edit=[...(GD.edit||GD.g.emblem)];GD.edit[k]=i;}else GD.draft.emblem[k]=i;
  refreshPanel();if(GD.g){const d=panel.querySelector('details');if(d)d.open=true;}};
PANEL_ACTS.gcreate=()=>{const name=($('#gName')||{}).value||'';GD.draft.name=name;
  if(!/^[A-Za-z0-9][A-Za-z0-9 '-]{1,18}[A-Za-z0-9]$/.test(name.trim())){addLog("Guild names are 3-20 letters, numbers, spaces, ' or -.",'l-bad');return;}
  if(P.gold<GUILD_COST){addLog(`Founding a guild costs ${fmt(GUILD_COST)} gold.`,'l-bad');return;}
  gsoc('guildCreate',{name:name.trim(),emblem:GD.draft.emblem});};
PANEL_ACTS.gnotice=()=>gsoc('guildEdit',{notice:($('#gNotice')||{}).value||''});
PANEL_ACTS.gemblem=()=>{if(GD.edit)gsoc('guildEdit',{emblem:GD.edit});GD.edit=null;};
PANEL_ACTS.grank=arg=>{const i=arg.lastIndexOf(':');gsoc('guildRank',{u:arg.slice(0,i),rank:arg.slice(i+1)});};
PANEL_ACTS.gkick=u=>gsoc('guildKick',{u});
PANEL_ACTS.gleave=()=>{gsoc('guildLeave',{});};
PANEL_ACTS.gdisband=()=>{if(!GD.armDisband){GD.armDisband=true;refreshPanel();setTimeout(()=>{GD.armDisband=false;},5000);return;}GD.armDisband=false;gsoc('guildDisband',{});};
PANEL_CLOSE.guild=()=>{GD.edit=null;GD.armDisband=false;};
const _togglePanelG=togglePanel;
togglePanel=function(k){if(k==='guild'&&GD.g&&panelKind!=='guild')soc('guildGet',{});_togglePanelG(k);};

/* ---- chat: /g and the Guild tab ---- */
const _chatCommandG=chatCommand;
chatCommand=function(k,arg){if(k==='g'||k==='guild'){if(!GD.g){addLog('You are not in a guild. Press G to found or manage one.');return true;}if(arg)gsoc('guildChat',{text:arg});return true;}
  if(k==='ginvite'){if(!canInvite()){addLog('Only guild leaders and officers can invite.');return true;}const peer=findPeerByName(arg);if(!peer)addLog(`${arg} is not in your channel.`,'l-bad');else gsoc('guildInvite',{peer});return true;}
  return _chatCommandG(k,arg);};
CMD_HELP.push(['/g text, /ginvite Name','guild chat, invite to your guild']);
const _sendChatG=sendChat;
sendChat=function(raw){const t=clean(raw,120);if(t&&t[0]!=='/'&&SOC.tab==='guild'&&GD.g){gsoc('guildChat',{text:t});return;}_sendChatG(raw);};
