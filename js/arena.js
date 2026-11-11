"use strict";
/* ================= Stage 6: the Ember Arena (ranked 1v1 and 2v2) =================
   The Arena Master in Hearthvale (or /arena) opens the arena window: queue, your rating and the top 20.
   The server pairs players in the same channel and keeps score; hits travel between the players' games like
   duels (presence field dl, kind 'ah'). Falling to 1 HP puts you out, and you tell the server so yourself;
   a team with everyone out loses. Nobody dies or loses EXP. Matches need the game server and an account. */
const AR={sock:null,info:null,queued:null,match:null,last:null};
const ARENA_REACH=450; // a hit from further away than this can't be real

function arenaAttach(sock){AR.sock=sock;
  sock.on('arenaInfo',m=>{if(!m)return;AR.info={me:m.me&&typeof m.me==='object'?{r:fin(m.me.r),w:fin(m.me.w),l:fin(m.me.l),d:fin(m.me.d)}:null,
    top:Array.isArray(m.top)?m.top.slice(0,20).map(x=>({name:clean(x.name,16),r:fin(x.r),w:fin(x.w),l:fin(x.l)})):[],inMatch:!!m.inMatch};
    AR.queued=m.queued==='1v1'||m.queued==='2v2'?m.queued:null;if(panelKind==='arena')refreshPanel();});
  sock.on('arenaQueue',m=>{const was=AR.queued;AR.queued=m&&(m.mode==='1v1'||m.mode==='2v2')?m.mode:null;
    if(AR.queued&&!was){addLog(`You joined the ${AR.queued} arena queue. You'll be taken to the arena when a match is found.`,'l-good');sfx('click');}
    else if(!AR.queued&&was)addLog(m&&m.why?clean(m.why,80)+' You left the arena queue.':'You left the arena queue.');
    if(panelKind==='arena')refreshPanel();});
  sock.on('arenaMatch',m=>{try{arenaStart(m);}catch(e){}});
  sock.on('arenaState',m=>{const M=AR.match;if(!M||!m||m.id!==M.id||!Array.isArray(m.out))return;const out=new Set(m.out.map(String));
    for(const x of [...M.foes,...M.mates])if(out.has(x.peer)&&!x.out){x.out=true;addLog(`${x.name} is out!`,M.foes.includes(x)?'l-good':'l-bad');if(x.ent){x.ent.dead=true;if(P.target===x.ent)P.target=null;}}});
  sock.on('arenaResult',m=>{const M=AR.match;if(!m||(M&&m.id!==M.id))return;arenaResult(m);});
  sock.on('disconnect',()=>{if(AR.match)arenaEnd();AR.queued=null;});
}
const arenaSend=(ev,data)=>{if(AR.sock&&AR.sock.connected){AR.sock.emit(ev,data||{});return true;}addLog('The arena needs the game server, which is not reachable right now.','l-bad');return false;};

/* ---- the Arena Master's window ---- */
PANELS.arena=()=>{const I=AR.info,M=AR.match;
  let h=`<h2>Ember Arena</h2><div class="sub">Ranked fights against other players. Fall to 1 HP and you're out; the last team standing wins. Nobody dies or loses EXP. Leaving the arena during a match counts as a loss.</div>`;
  if(M)h+=`<div class="arbox">You are in a ${M.mode} match.</div>`;
  if(!ACC.token)h+=`<div class="arbox">Ranked matches need an account so your rating is kept. Log in or sign up from the title screen. You can still visit the arena and watch.</div>`;
  else if(!I)h+=`<div class="sub">Loading…</div>`;
  else{const me=I.me||{r:1000,w:0,l:0,d:0};
    h+=`<div class="arstats"><div><b>${me.r}</b><span>rating</span></div><div><b>${me.w}</b><span>wins</span></div><div><b>${me.l}</b><span>losses</span></div><div><b>${me.d}</b><span>draws</span></div></div>`;
    if(!M){h+=`<h3>Find a match</h3>`;
      if(AR.queued)h+=`<div class="arbox">Waiting for a ${AR.queued} opponent… <button class="btn small" data-act="arcancel">Leave queue</button></div>`;
      else{const solo=!SOC.party,pairOk=SOC.party&&SOC.party.members.length===2&&SOC.party.leader===selfPeer();
        h+=`<div class="setlist"><div class="setrow"><div class="grow"><div class="nm">1 v 1</div><div class="ds">${solo?'Just you against one opponent.':'You will queue alone; your party stays as it is.'}</div></div><button class="btn small" data-act="arjoin" data-arg="1v1">Join queue</button></div>`+
          `<div class="setrow"><div class="grow"><div class="nm">2 v 2</div><div class="ds">${pairOk?'You and your partner against another pair.':'Needs a party of exactly two; the leader joins for both.'}</div></div><button class="btn small" data-act="arjoin" data-arg="2v2" ${pairOk?'':'disabled'}>Join queue</button></div></div>`;}}
    h+=`<h3>Top 20</h3>`+(I.top.length?`<table class="artop"><thead><tr><th>#</th><th>Name</th><th>Rating</th><th>W–L</th></tr></thead><tbody>`+
      I.top.map((x,i)=>`<tr class="${x.name===P.name?'me':''}"><td>${i+1}</td><td>${esc(x.name)}</td><td>${x.r}</td><td>${x.w}–${x.l}</td></tr>`).join('')+`</tbody></table>`:`<div class="sub">No ranked matches yet. Be the first!</div>`);}
  h+=`<div class="tbtns">${zoneId==='arena'?`<button class="btn small" data-act="arleave" ${M?'disabled':''}>Back to Hearthvale</button>`:`<button class="btn small" data-act="argo">Visit the arena</button>`}</div>`;
  return h;};
const _openArena=openPanel;
openPanel=function(kind,arg){if(kind==='arena'&&ACC.token)arenaSend('arenaInfo');return _openArena(kind,arg);};
PANEL_ACTS.arjoin=mode=>{if(arenaSend('arenaJoin',{mode}))setTimeout(()=>arenaSend('arenaInfo'),300);};
PANEL_ACTS.arcancel=()=>arenaSend('arenaCancel');
PANEL_ACTS.argo=()=>{closePanel();if(zoneId!=='arena'){enterZone('arena','town');save();}};
PANEL_ACTS.arleave=()=>{if(AR.match)return;closePanel();enterZone('town','arena');save();};

/* ---- a match ---- */
function arenaStart(m){if(!m||typeof m.id!=='string'||!Array.isArray(m.teams)||m.teams.length!==2)return;
  const you=m.you===1?1:0,slot=clamp(Math.floor(fin(m.slot)),0,ARENA_PITS.length-1);
  const roster=m.teams.map(t=>(Array.isArray(t)?t:[]).slice(0,4).map(x=>({peer:String(x.peer),id:clean(x.id,16),name:clean(x.name,16)||'Fighter',out:false})));
  const mine=roster[you],theirs=roster[1-you],meIdx=Math.max(0,mine.findIndex(x=>x.peer===selfPeer()));
  AR.queued=null;closePanel();hideDuelAsk&&hideDuelAsk();if(DUEL)duelEnd('Your duel was cancelled: an arena match is starting.');
  if(zoneId!=='arena')enterZone('arena','town');
  const [cx,cy]=ARENA_PITS[slot];
  P.x=(cx+(you?5:-5)+.5)*TILE;P.y=(cy+(meIdx?1.5:-1.5)*(mine.length>1?1:0)+.5)*TILE;P.path=[];P.target=null;P.queued=null;P.sitting=false;P.casting=null;P.ail={};
  S=computeStats();P.hp=S.maxhp;P.sp=S.maxsp;P.face=you?-1:1;
  const fightIn=clamp(fin(m.fightIn)||5,1,15),time=clamp(fin(m.time)||180,10,900);
  const foes=theirs.map(x=>({...x,ent:{pvp:true,arena:true,pid:x.id,x:P.x,y:P.y,hp:100,dead:false,hitF:-9,idx:-1,state:'idle',
    d:{id:'arena',name:x.name,lv:1,hp:100,size:12,flee:1,def:0,el:'neutral',drops:[]}}}));
  AR.match={id:m.id,mode:m.mode==='2v2'?'2v2':'1v1',slot,team:you,foes,mates:mine.filter(x=>x.peer!==selfPeer()),fightAt:now+fightIn,until:now+fightIn+time,out:false,cx,cy};
  const vs=theirs.map(x=>x.name).join(' & ');
  addLog(`Arena match: ${mine.map(x=>x.name).join(' & ')} vs ${vs}! Click an opponent to attack.`,'l-rare');sfx('fanfare');showBanner('Arena match',`vs ${vs}`);
  for(let n=Math.min(5,Math.floor(fightIn));n>=1;n--)setTimeout(()=>{if(AR.match&&AR.match.id===m.id){texts.push({x:P.x,y:P.y-70,txt:String(n),col:'#ffcf5a',size:30,t0:now,dur:.8});sfx('click');}},(fightIn-n)*1000);
  setTimeout(()=>{const M=AR.match;if(M&&M.id===m.id){texts.push({x:P.x,y:P.y-70,txt:'FIGHT!',col:'#ff7a5a',size:30,t0:now,dur:1});sfx('fanfare');const f=M.foes.find(x=>!x.out);if(f)P.target=f.ent;}},fightIn*1000);
  save();}
function arenaOut(why){const M=AR.match;if(!M||M.out)return;M.out=true;P.hp=Math.max(1,P.hp);P.target=null;P.casting=null;P.sitting=true;
  arenaSend('arenaOut',{id:M.id});addLog(why||'You are out! Your team fights on without you.','l-bad');sfx('hurt');}
function arenaResult(m){const M=AR.match,r=m.result==='win'?'win':m.result==='loss'?'loss':'draw',delta=Math.round(fin(m.delta)),rating=m.rating==null?null:Math.round(fin(m.rating));
  const rt=rating==null?'':` Rating ${rating} (${delta>=0?'+':''}${delta}).`;
  if(r==='win'){fx.push({k:'lvl',x:P.x,y:P.y-30,t0:now,dur:2,txt:'VICTORY',col:'#ffcf5a'});sfx('fanfare');addLog('You won the arena match!'+rt,'l-rare');if(M)announce('arena',M.foes.map(x=>x.name).join(' & '));}
  else if(r==='loss'){addLog('You lost the arena match. Well fought!'+rt,'l-bad');}
  else addLog('The arena match is a draw.'+rt);
  AR.last={result:r,delta,rating};if(AR.info&&AR.info.me&&rating!=null){AR.info.me.r=rating;AR.info.me.w=fin(m.w);AR.info.me.l=fin(m.l);AR.info.me.d=fin(m.d);}
  arenaEnd();}
function arenaEnd(){const M=AR.match;if(!M)return;if(P.target&&P.target.arena)P.target=null;AR.match=null;S=computeStats();P.hp=S.maxhp;P.sp=Math.max(P.sp,Math.round(S.maxsp*.5));P.sitting=false;if(panelKind==='arena')refreshPanel();}

// my attacks on an opponent's stand-in: send the damage instead of applying it
const _hurtMobA=hurtMob;
hurtMob=function(m,dmg,crit,kind){if(!m||!m.arena)return _hurtMobA(m,dmg,crit,kind);const M=AR.match;
  if(!M||M.out||m.dead||!M.foes.some(f=>f.ent===m))return;if(now<M.fightAt){floatT(m.x,m.y-40,'Not yet!','#ffcf5a',12);return;}
  dlSend(m.pid,'ah',{d:Math.round(dmg),c:crit?1:0,m:M.id});m.hitF=now;
  if(crit){sfx('crit');texts.push({x:m.x,y:m.y-40,txt:fmt(dmg),col:'#ffb03a',size:24,t0:now,dur:1});}else{sfx(kind==='mag'?'zap':hitSound());floatT(m.x,m.y-28,fmt(dmg),'#ffffff',15);}};
// hits addressed to me (they ride in the attacker's presence, next to duel messages)
const _duelRecvA=duelRecv;
duelRecv=function(o,arr,fresh){if(Array.isArray(arr)&&!fresh){const M=AR.match;
  for(const e of arr.slice(-10)){if(!e||typeof e!=='object'||e.k!=='ah')continue;const i=fin(e.i);if(i<=(o.arSeen||0))continue;o.arSeen=i;
    if(!M||e.to!==NET.myId||e.m!==M.id||M.out||!P||now<M.fightAt-.5)continue;
    const f=M.foes.find(x=>x.id===o.id);if(!f||f.out)continue;
    if(Math.hypot(o.x-P.x,o.y-P.y)>ARENA_REACH)continue;
    const cap=400+clamp(o.lv||1,1,99)*150,d=clamp(Math.round(fin(e.d)-S.def*.6),1,cap);
    P.hp-=d;P.hurtT=now;P.sitting=false;interruptCast();sfx('hurt');fx.push({k:'spark',x:P.x,y:P.y-24,t0:now,dur:.22,r:rnd(0,6),col:'#ff8a7a'});
    floatT(P.x,P.y-30,fmt(d),e.c?'#ffb03a':'#ff6a5a',e.c?22:16);
    if(P.hp<=1)arenaOut(`${o.n} knocked you out!`);}}
  else if(Array.isArray(arr)&&fresh){for(const e of arr.slice(-10))if(e&&e.k==='ah')o.arSeen=Math.max(o.arSeen||0,fin(e.i));}
  return _duelRecvA(o,arr,fresh);};

/* ---- every frame: keep the stand-ins on the opponents; leaving the arena forfeits ---- */
const _netTickA=netTick;
netTick=function(dt){_netTickA(dt);const M=AR.match;if(!M||!P)return;
  if(zoneId!=='arena'){if(!M.out)arenaOut('You left the arena, so you are out of the match.');return;}
  if(M.out){if(P.hp<1)P.hp=1;P.target=null;}
  for(const f of M.foes){const o=dlOther(f.id);if(!o)continue;const e=f.ent;e.x=o.rx;e.y=o.ry;e.hp=Math.max(1,o.hp||1);e.d.lv=o.lv||1;e.d.flee=clamp(o.lv||1,1,99);}
  if(P.dead&&!M.out)arenaOut();
  if(Math.floor(now*2)!==Math.floor((now-dt)*2))for(const f of M.foes)if(!f.out)fx.push({k:'ring',x:f.ent.x,y:f.ent.y,r:24,col:'#ff5a4a',t0:now,dur:.5});};
// out of the fight: no attacks or skills
const _hurtGuard=hurtMob;
hurtMob=function(m,...a){if(m&&m.arena&&AR.match&&AR.match.out)return;return _hurtGuard(m,...a);};

// clicking an opponent targets them
const _mobAtA=mobAt;
mobAt=function(sc){const m=_mobAtA(sc);const M=AR.match;if(m||!M||M.out)return m;
  for(const f of M.foes){if(f.out)continue;const p=proj(f.ent.x,f.ent.y);if(Math.hypot(p.x-sc.x,p.y-18-sc.y)<(touchPick?34:24))return f.ent;}return null;};

// /arena opens the window anywhere
const _chatCommandA=chatCommand;
chatCommand=function(k,arg){if(k==='arena'){openPanel('arena');return true;}return _chatCommandA(k,arg);};
CMD_HELP.push(['/arena','ranked arena: queue, rating, top 20']);
