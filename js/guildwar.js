"use strict";
/* ================= Stage 6: guild war over Emberkeep =================
   Every evening at 20:00 (Thailand time) the war opens for 15 minutes. The server watches the ring around the
   Ember Crystal: a guild alone in it for a while takes the crystal, and the holder scores a point a second.
   The guild with the most points owns the keep until the next war: its name shines on the crystal and its
   members get +10% EXP. During the war, members of different guilds can fight in the keep (hits travel like
   duels, presence field dl kind 'gh'); a knocked-out player is sent back to the gate. Nobody dies. */
const GW={sock:null,owner:null,next:0,len:900,capture:20,war:null,infoAt:0,ents:new Map()};
const GW_REACH=450,GW_EXP=.10;

const gwGuild=x=>x&&typeof x==='object'?{id:clean(x.id||x.guildId,40),name:clean(x.name,20),emblem:typeof embOk==='function'?embOk(x.emblem):[0,0,0]}:null;
function gwWar(m){if(!m||typeof m!=='object'||!m.on)return null;
  return {left:clamp(fin(m.left),0,7200),at:now,holder:gwGuild(m.holder),capture:m.capture&&typeof m.capture==='object'?{id:clean(m.capture.id,40),name:clean(m.capture.name,20),pct:clamp(fin(m.capture.pct),0,100)}:null,
    contested:!!m.contested,top:Array.isArray(m.top)?m.top.slice(0,5).map(x=>({id:clean(x.id,40),name:clean(x.name,20),emblem:typeof embOk==='function'?embOk(x.emblem):[0,0,0],pts:Math.max(0,Math.floor(fin(x.pts)))})):[]};}

function guildwarAttach(sock){GW.sock=sock;
  sock.on('connect',()=>setTimeout(()=>{if(sock.connected)sock.emit('gwInfo');},1500));
  sock.on('gwInfo',m=>{if(!m)return;GW.owner=gwGuild(m.owner);GW.next=fin(m.next);GW.len=fin(m.len)||900;GW.capture=fin(m.capture)||20;GW.war=gwWar(m.war);GW.infoAt=Date.now();gwBar();if(panelKind==='keep')refreshPanel();});
  sock.on('gwState',m=>{const was=GW.war;GW.war=gwWar(m);gwBar();if(!was&&GW.war&&panelKind==='keep')refreshPanel();});
  sock.on('gwAnnounce',m=>{if(!m)return;
    if(m.k==='start'){GW.war=GW.war||{left:fin(m.left),at:now,holder:gwGuild(m.owner),capture:null,contested:false,top:[]};
      addLog(`⚔ The guild war for Emberkeep has begun! ${Math.round(fin(m.left)/60)} minutes to hold the Ember Crystal. Ask the Keep Herald in Hearthvale to go there.`,'l-rare');sfx('rare');showBanner('Guild war!','Emberkeep is open');}
    else if(m.k==='taken'){const n=clean(m.name,20);addLog(`⚔ ${n} has taken the Ember Crystal!`,GD.g&&GD.g.name===n?'l-good':'l-rare');sfx('ping');}
    else if(m.k==='end'){GW.war=null;GW.owner=gwGuild(m.owner);GW.next=fin(m.next);gwClear();
      addLog(GW.owner?`⚔ The guild war is over. ${GW.owner.name} holds Emberkeep${fin(m.pts)?` with ${fin(m.pts)} points`:''}! Its members get +10% EXP until the next war.`:'⚔ The guild war is over. Nobody claimed Emberkeep.','l-rare');
      if(GW.owner&&gwMine())sfx('fanfare');}
    gwBar();if(panelKind==='keep')refreshPanel();});
}
const gwMine=()=>!!(GD.g&&GW.owner&&GD.g.id===GW.owner.id);
function keepColour(){const g=GW.war&&GW.war.holder||GW.owner;return g&&typeof EMB_COLS!=='undefined'?(g.emblem[1]===7?EMB_BGS[g.emblem[2]]:EMB_COLS[g.emblem[1]]):'#ff9a3a';}
function keepLabel(){const g=GW.war&&GW.war.holder||GW.owner;return g?g.name:'';}
const warLeft=()=>GW.war?Math.max(0,Math.round(GW.war.left-(now-GW.war.at))):0;
const mmss=s=>`${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,'0')}`;
function nextWarText(){if(!GW.next)return 'every evening at 20:00 (Thailand time)';const d=new Date(GW.next),mins=Math.round((GW.next-Date.now())/60000);
  return mins<=0?'starting now':mins<90?`in ${mins} minute${mins===1?'':'s'}`:`at ${d.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}${mins>1440?' tomorrow':''}`;}

/* ---- the war bar at the top of the screen ---- */
function gwBar(){let el=document.getElementById('gwBar');const W=GW.war;
  if(!W){if(el)el.hidden=true;return;}
  if(!el){el=document.createElement('div');el.id='gwBar';el.setAttribute('role','status');document.body.appendChild(el);el.addEventListener('click',()=>openPanel('keep'));}
  el.hidden=false;const mine=n=>GD.g&&GD.g.name===n;
  const hold=W.holder?`<b class="${mine(W.holder.name)?'me':''}">${esc(W.holder.name)}</b> holds the crystal`:'Nobody holds the crystal';
  const cap=W.contested?'<span class="hot">Contested!</span>':W.capture?`${esc(W.capture.name)} capturing <i style="--p:${W.capture.pct}%"></i>`:'';
  el.innerHTML=`<span class="t">⚔ Guild war · ${mmss(warLeft())}</span><span>${hold}</span>${cap?`<span>${cap}</span>`:''}`+(W.top.length?`<span class="top">${W.top.slice(0,3).map(x=>`${esc(x.name)} ${x.pts}`).join(' · ')}</span>`:'');}
setInterval(()=>{if(GW.war)gwBar();},1000);

/* ---- the Keep Herald's window ---- */
PANELS.keep=()=>{const W=GW.war;
  let h=`<h2>Emberkeep</h2><div class="sub">Every evening at 20:00 (Thailand time) guilds fight for the Ember Crystal for ${Math.round(GW.len/60)} minutes. A guild that stands alone in the golden ring for ${GW.capture} seconds takes the crystal, and the guild holding it scores a point every second. Rival guilds in the ring stop a capture. The guild with the most points owns Emberkeep until the next war, and its members get +10% EXP.</div>`;
  h+=`<div class="arbox">${GW.owner?`Held by <b>${esc(GW.owner.name)}</b>${gwMine()?' (your guild!)':''}`:'Nobody holds Emberkeep yet.'}</div>`;
  if(W){h+=`<h3>The war is on · ${mmss(warLeft())} left</h3>`+(W.top.length?`<table class="artop"><thead><tr><th>#</th><th>Guild</th><th>Points</th></tr></thead><tbody>`+W.top.map((x,i)=>`<tr class="${GD.g&&GD.g.name===x.name?'me':''}"><td>${i+1}</td><td>${esc(x.name)}${W.holder&&W.holder.id===x.id?' ⚔':''}</td><td>${x.pts}</td></tr>`).join('')+`</tbody></table>`:`<div class="sub">No guild has reached the ring yet.</div>`);}
  else h+=`<div class="sub">The next war starts ${nextWarText()}.</div>`;
  h+=`<div class="sub">${GD.g?`You fight for <b>${esc(GD.g.name)}</b>. During the war, members of other guilds in the keep can attack you and you them; if you fall to 1 HP you are sent back to the gate.`:'Only guild members can capture the crystal or fight in the war. You can still go and watch.'}</div>`;
  if(typeof MOD!=='undefined'&&MOD.admin)h+=`<h3>Admin</h3><div class="tbtns" style="justify-content:flex-start">${W?`<button class="btn small" data-act="gwadmin" data-arg="end">End the war now</button>`:`<button class="btn small" data-act="gwadmin" data-arg="start">Start a 15-minute war now</button>`}</div>`;
  h+=`<div class="tbtns">${zoneId==='keep'?`<button class="btn small" data-act="gwhome">Back to Hearthvale</button>`:`<button class="btn small" data-act="gwgo">Go to Emberkeep</button>`}</div>`;return h;};
const _openPanelGW=openPanel;
openPanel=function(kind,arg){if(kind==='keep'&&GW.sock&&GW.sock.connected)GW.sock.emit('gwInfo');return _openPanelGW(kind,arg);};
PANEL_ACTS.gwgo=()=>{if(typeof AR!=='undefined'&&AR.match){addLog('Finish your arena match first.','l-bad');return;}closePanel();enterZone('keep','town');save();};
PANEL_ACTS.gwadmin=act=>{if(GW.sock&&GW.sock.connected){GW.sock.emit('gwAdmin',{act,minutes:15});setTimeout(()=>GW.sock.emit('gwInfo'),400);}};
PANEL_ACTS.gwhome=()=>{closePanel();enterZone('town','keep');save();};

/* ---- fighting in the keep during the war ---- */
const gwFighting=()=>!!(GW.war&&GD.g&&zoneId==='keep'&&P&&!P.dead);
const gwFoe=o=>o&&o.z==='keep'&&o.guild&&o.guild.n&&GD.g&&o.guild.n!==GD.g.name&&!o.dead;
function gwClear(){for(const e of GW.ents.values())if(P&&P.target===e)P.target=null;GW.ents.clear();}
function gwKnockout(by){P.hp=1;P.target=null;P.casting=null;P.path=[];
  const z=Z;P.x=z.spawn.x;P.y=z.spawn.y;S=computeStats();P.hp=Math.round(S.maxhp*.6);
  fx.push({k:'ring',x:P.x,y:P.y,r:30,col:'#ff9a3a',t0:now,dur:.6});sfx('hurt');addLog(`${by} knocked you out! You are back at the gate.`,'l-bad');NET.lastSent='';NET.sendT=0;}
// my attacks on a rival's stand-in: send the damage instead of applying it
const _hurtMobGW=hurtMob;
hurtMob=function(m,dmg,crit,kind){if(!m||!m.gw)return _hurtMobGW(m,dmg,crit,kind);
  if(!gwFighting()||m.dead)return;dlSend(m.pid,'gh',{d:Math.round(dmg),c:crit?1:0});m.hitF=now;
  if(crit){sfx('crit');texts.push({x:m.x,y:m.y-40,txt:fmt(dmg),col:'#ffb03a',size:24,t0:now,dur:1});}else{sfx(kind==='mag'?'zap':hitSound());floatT(m.x,m.y-28,fmt(dmg),'#ffffff',15);}};
// hits addressed to me
const _duelRecvGW=duelRecv;
duelRecv=function(o,arr,fresh){if(Array.isArray(arr)){
  for(const e of arr.slice(-10)){if(!e||typeof e!=='object'||e.k!=='gh')continue;const i=fin(e.i);if(i<=(o.ghSeen||0))continue;o.ghSeen=i;
    if(fresh||e.to!==NET.myId||!gwFighting()||!gwFoe(o))continue;
    if(Math.hypot(o.x-P.x,o.y-P.y)>GW_REACH)continue;
    const cap=400+clamp(o.lv||1,1,99)*150,d=clamp(Math.round(fin(e.d)-S.def*.6),1,cap);
    P.hp-=d;P.hurtT=now;P.sitting=false;interruptCast();sfx('hurt');fx.push({k:'spark',x:P.x,y:P.y-24,t0:now,dur:.22,r:rnd(0,6),col:'#ff8a7a'});
    floatT(P.x,P.y-30,fmt(d),e.c?'#ffb03a':'#ff6a5a',e.c?22:16);
    if(P.hp<=1)gwKnockout(o.n);}}
  return _duelRecvGW(o,arr,fresh);};
// every frame: a stand-in for each rival in the keep
const _netTickGW=netTick;
netTick=function(dt){_netTickGW(dt);if(!gwFighting()){if(GW.ents.size)gwClear();return;}
  const seen=new Set();
  for(const o of NET.others.values()){if(!gwFoe(o)||!o.id)continue;seen.add(o.id);let e=GW.ents.get(o.id);
    if(!e){e={pvp:true,gw:true,pid:o.id,x:o.rx,y:o.ry,hp:100,dead:false,hitF:-9,idx:-1,state:'idle',d:{id:'gw',name:o.n,lv:1,hp:100,size:12,flee:1,def:0,el:'neutral',drops:[]}};GW.ents.set(o.id,e);}
    e.x=o.rx;e.y=o.ry;e.hp=Math.max(1,o.hp||1);e.d.name=o.n;e.d.lv=o.lv||1;e.d.flee=clamp(o.lv||1,1,99);}
  for(const [id,e] of GW.ents)if(!seen.has(id)){if(P.target===e)P.target=null;GW.ents.delete(id);}};
// clicking a rival targets them
const _mobAtGW=mobAt;
mobAt=function(sc){const m=_mobAtGW(sc);if(m||!gwFighting())return m;
  for(const e of GW.ents.values()){const p=proj(e.x,e.y);if(Math.hypot(p.x-sc.x,p.y-18-sc.y)<(touchPick?34:24))return e;}return null;};

// the keep's owners get +10% EXP
const _gainExpGW=gainExp;
gainExp=function(e,j){if(gwMine()){e=Math.round(e*(1+GW_EXP));j=Math.round(j*(1+GW_EXP));}return _gainExpGW(e,j);};

// /keep opens the herald's window anywhere
const _chatCommandGW=chatCommand;
chatCommand=function(k,arg){if(k==='keep'||k==='gw'||k==='war'){openPanel('keep');return true;}return _chatCommandGW(k,arg);};
CMD_HELP.push(['/keep','Emberkeep guild war: owner, next war, scores']);
