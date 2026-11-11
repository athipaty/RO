"use strict";
/* ================= #51 duels: 1-on-1 fights between players, first to fall to 1 HP loses ================= */
// Challenges, hits and results travel in each player's presence update (addressed to the opponent),
// so duels work on the game server and on the public-broker backup. Nobody dies or loses EXP.
const DUEL_RANGE=900, DUEL_TIME=180;
NET.dl=[];NET.dlId=0;
let DUEL=null;            // {id, peer, name, fightAt, until, ent, farT}
const DASK={out:null,in:null}; // challenge I sent {id, at}; challenge I received {id, peer, name, at}

function dlSend(to,k,extra){NET.dl=[...NET.dl,{i:++NET.dlId,to,k,...(extra||{})}].slice(-10);NET.lastSent='';NET.sendT=0;}
function dlOther(id){for(const o of NET.others.values())if(o.id===id)return o;return null;}

/* ---- challenging ---- */
function duelChallenge(peer){const o=NET.others.get(peer);if(!o||!o.id){addLog('That player is not here.','l-bad');return;}
  if(DUEL){addLog('You are already in a duel.','l-bad');return;}
  if(o.z!==zoneId){addLog(`${o.n} is in another region. Duels happen face to face.`,'l-bad');return;}
  if(DASK.out&&now-DASK.out.at<10){addLog('Wait a moment before challenging again.');return;}
  DASK.out={id:o.id,at:now};dlSend(o.id,'ask');addLog(`You challenge ${o.n} to a duel.`,'l-good');sfx('click');}
function showDuelAsk(){let el=document.getElementById('duelAsk');
  if(!el){el=document.createElement('div');el.id='duelAsk';el.className='frame';el.setAttribute('role','dialog');el.setAttribute('aria-label','Duel challenge');
    el.innerHTML='<span></span><button class="btn small" data-d="yes">Fight</button><button class="btn small" data-d="no">No thanks</button>';
    el.addEventListener('click',ev=>{const b=ev.target.closest('[data-d]');if(!b)return;duelAnswer(b.dataset.d==='yes');});document.body.appendChild(el);}
  el.querySelector('span').innerHTML=`<b>${esc(DASK.in.name)}</b> challenges you to a duel!`;el.hidden=false;sfx('ping');}
function hideDuelAsk(){const el=document.getElementById('duelAsk');if(el)el.hidden=true;}
function duelAnswer(yes){const a=DASK.in;DASK.in=null;hideDuelAsk();if(!a)return;const o=dlOther(a.id);
  if(!yes||!o||DUEL){dlSend(a.id,'no');return;}
  dlSend(a.id,'yes');duelStart(o);}

/* ---- the fight ---- */
function duelStart(o){DASK.out=null;
  const ent={pvp:true,x:o.rx,y:o.ry,hp:o.hp||100,dead:false,hitF:-9,idx:-1,state:'idle',
    d:{id:'duel',name:o.n,lv:o.lv||1,hp:100,size:12,flee:clamp(o.lv||1,1,99),def:0,el:'neutral',drops:[]}};
  DUEL={id:o.id,peer:o.peer,name:o.n,fightAt:now+3,until:now+3+DUEL_TIME,ent,farT:0};
  addLog(`Duel with ${o.n}! Click them to attack. First to fall to 1 HP loses. Nobody dies.`,'l-rare');
  [3,2,1].forEach((n,i)=>setTimeout(()=>{if(DUEL&&DUEL.ent===ent){texts.push({x:P.x,y:P.y-70,txt:String(n),col:'#ffcf5a',size:30,t0:now,dur:.8});sfx('click');}},i*1000));
  setTimeout(()=>{if(DUEL&&DUEL.ent===ent){texts.push({x:P.x,y:P.y-70,txt:'FIGHT!',col:'#ff7a5a',size:30,t0:now,dur:1});sfx('fanfare');P.target=ent;}},3000);}
function duelEnd(msg,cls){if(!DUEL)return;if(P.target&&P.target.pvp)P.target=null;DUEL=null;addLog(msg,cls||'l-sys');}

// my attacks and skills on the stand-in for my opponent: send the damage instead of applying it
const _hurtMobD=hurtMob;
hurtMob=function(m,dmg,crit,kind){if(!m||!m.pvp)return _hurtMobD(m,dmg,crit,kind);
  if(!DUEL||m!==DUEL.ent)return;if(now<DUEL.fightAt){floatT(m.x,m.y-40,'Not yet!','#ffcf5a',12);return;}
  dlSend(DUEL.id,'hit',{d:Math.round(dmg),c:crit?1:0});m.hitF=now;
  if(crit){sfx('crit');texts.push({x:m.x,y:m.y-40,txt:fmt(dmg),col:'#ffb03a',size:24,t0:now,dur:1});}else{sfx(kind==='mag'?'zap':hitSound());floatT(m.x,m.y-28,fmt(dmg),'#ffffff',15);}};
for(const fn of ['ailMob','slowMob']){const orig=window[fn];window[fn]=function(m,...a){if(m&&m.pvp)return;return orig(m,...a);};}

/* ---- incoming messages (called for every presence update) ---- */
function duelRecv(o,arr,fresh){if(!Array.isArray(arr))return;
  for(const e of arr.slice(-10)){if(!e||typeof e!=='object')continue;const i=fin(e.i);if(i<=(o.dlSeen||0))continue;o.dlSeen=i;
    if(fresh||e.to!==NET.myId||!P)continue;
    if(e.k==='ask'){if(DUEL||DASK.in||P.dead){dlSend(o.id,'busy');continue;}
      if(typeof isMuted==='function'&&isMuted(o.n)){dlSend(o.id,'busy');continue;}
      DASK.in={id:o.id,peer:o.peer,name:o.n,at:now};showDuelAsk();
      setTimeout(()=>{if(DASK.in&&DASK.in.id===o.id)duelAnswer(false);},20000);}
    else if(e.k==='yes'){if(DASK.out&&DASK.out.id===o.id&&!DUEL&&now-DASK.out.at<40)duelStart(o);}
    else if(e.k==='no'){if(DASK.out&&DASK.out.id===o.id){DASK.out=null;addLog(`${o.n} declined the duel.`);}}
    else if(e.k==='busy'){if(DASK.out&&DASK.out.id===o.id){DASK.out=null;addLog(`${o.n} is busy right now.`);}}
    else if(e.k==='hit'){if(!DUEL||DUEL.id!==o.id||now<DUEL.fightAt-.5||P.dead)continue;
      if(Math.hypot(o.x-P.x,o.y-P.y)>450)continue; // too far away to have hit me
      const cap=400+clamp(o.lv||1,1,99)*150,d=clamp(Math.round(fin(e.d)-S.def*.6),1,cap);
      P.hp-=d;P.hurtT=now;P.sitting=false;interruptCast();sfx('hurt');fx.push({k:'spark',x:P.x,y:P.y-24,t0:now,dur:.22,r:rnd(0,6),col:'#ff8a7a'});
      floatT(P.x,P.y-30,fmt(d),e.c?'#ffb03a':'#ff6a5a',e.c?22:16);
      if(P.hp<=1){P.hp=1;dlSend(o.id,'lose');duelEnd(`${o.n} won the duel. You are at 1 HP. Well fought!`,'l-bad');}}
    else if(e.k==='lose'){if(DUEL&&DUEL.id===o.id){announce('duel',o.n);sfx('fanfare');fx.push({k:'lvl',x:P.x,y:P.y-30,t0:now,dur:2,txt:'VICTORY',col:'#ffcf5a'});duelEnd(`You won the duel against ${o.n}!`,'l-rare');}}
    else if(e.k==='end'){if(DUEL&&DUEL.id===o.id)duelEnd(`${o.n} left the duel.`);}}}

/* ---- every frame: keep the stand-in on my opponent, and end the duel when it should ---- */
const _netTickD=netTick;
netTick=function(dt){_netTickD(dt);if(!DUEL||!P)return;const o=dlOther(DUEL.id),e=DUEL.ent;
  if(!o||o.z!==zoneId){duelEnd(`The duel with ${DUEL.name} is over: they left.`);return;}
  e.x=o.rx;e.y=o.ry;e.hp=Math.max(1,o.hp||1);e.d.name=o.n;e.d.lv=o.lv||1;
  if(P.dead){dlSend(DUEL.id,'lose');duelEnd('You fell to a monster, so the duel is lost.','l-bad');return;}
  DUEL.farT=Math.hypot(o.x-P.x,o.y-P.y)>DUEL_RANGE?DUEL.farT+dt:0;
  if(DUEL.farT>5){dlSend(DUEL.id,'end');duelEnd(`You walked away from the duel with ${DUEL.name}.`);return;}
  if(now>DUEL.until){duelEnd(`Time is up: the duel with ${DUEL.name} is a draw.`);return;}
  if(Math.floor(now*2)!==Math.floor((now-dt)*2))fx.push({k:'ring',x:e.x,y:e.y,r:24,col:'#ff5a4a',t0:now,dur:.5});};

// clicking my opponent targets them (also in town)
const _mobAtD=mobAt;
mobAt=function(sc){const m=_mobAtD(sc);if(m||!DUEL||now<DUEL.fightAt-3)return m;const p=proj(DUEL.ent.x,DUEL.ent.y);
  return Math.hypot(p.x-sc.x,p.y-18-sc.y)<(touchPick?34:24)?DUEL.ent:null;};

// /duel Name
const _chatCommandD=chatCommand;
chatCommand=function(k,arg){if(k==='duel'){const peer=findPeerByName(arg);if(!peer)addLog(arg?`${arg} is not here.`:'Usage: /duel Name','l-bad');else duelChallenge(peer);return true;}return _chatCommandD(k,arg);};
CMD_HELP.push(['/duel Name','challenge someone nearby to a duel']);
