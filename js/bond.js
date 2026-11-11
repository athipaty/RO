"use strict";
/* ================= #53 partners: the Kindred Bond =================
   Ask a friend (online list "Bond", or /bond Name); if they accept, you are bonded. Bonded partners see a pink
   ♥ with each other's name, earn +10% EXP while hunting near each other, and can be called to each other's side
   (/bondcall, every 5 minutes). /unbond ends it; your partner's game notices and tells them. Requests travel
   in presence (field dl, kinds bondask / bondyes / bondno / bondend); presence field bd = your partner's name. */
const BOND_NEAR=700,BOND_EXP=.10,BOND_CALL_CD=300;
const BND={ask:null,out:null,callT:-1e9};
const bondName=()=>P&&P.bond&&typeof P.bond.name==='string'?P.bond.name:null;
const isPartner=o=>!!(o&&bondName()&&o.n&&o.n.toLowerCase()===bondName().toLowerCase());
const partnerHere=()=>{for(const o of NET.others.values())if(isPartner(o))return o;return null;};

function bondAsk(peer){const o=NET.others.get(peer);if(!o||!o.id){addLog('That player is not here.','l-bad');return;}
  if(bondName()){addLog(`You already share a Kindred Bond with ${bondName()}. /unbond first.`,'l-bad');return;}
  if(BND.out&&now-BND.out.at<20){addLog('Wait for an answer before asking again.');return;}
  BND.out={id:o.id,name:o.n,at:now};dlSend(o.id,'bondask');addLog(`You ask ${o.n} to share a Kindred Bond.`,'l-good');sfx('click');}
function bondDialog(){let el=document.getElementById('bondAsk');
  if(!el){el=document.createElement('div');el.id='bondAsk';el.className='frame';el.setAttribute('role','dialog');el.setAttribute('aria-label','Kindred Bond request');
    el.innerHTML='<span></span><button class="btn small" data-b="yes">Accept</button><button class="btn small" data-b="no">Not now</button>';
    el.addEventListener('click',ev=>{const b=ev.target.closest('[data-b]');if(b)bondAnswer(b.dataset.b==='yes');});document.body.appendChild(el);}
  el.querySelector('span').innerHTML=`<b>${esc(BND.ask.name)}</b> asks to share a Kindred Bond with you ♥`;el.hidden=false;sfx('ping');}
function bondAnswer(yes){const a=BND.ask;BND.ask=null;const el=document.getElementById('bondAsk');if(el)el.hidden=true;if(!a)return;
  if(!yes||bondName()){dlSend(a.id,'bondno');return;}
  dlSend(a.id,'bondyes');bondMade(a.name);}
function bondMade(name){P.bond={name:clean(name,16),since:Date.now()};NET.lastSent='';NET.sendT=0;save();sfx('fanfare');
  fx.push({k:'lvl',x:P.x,y:P.y-30,t0:now,dur:2,txt:'♥ KINDRED BOND',col:'#ff9ad0'});addLog(`You and ${name} now share a Kindred Bond: +10% EXP when you hunt together, and /bondcall brings you to each other.`,'l-rare');}
function bondEnd(msg){if(!bondName())return;const name=bondName(),o=partnerHere();P.bond=null;NET.lastSent='';NET.sendT=0;save();if(o&&o.id)dlSend(o.id,'bondend');addLog(msg||`You ended your Kindred Bond with ${name}.`);}

// requests addressed to me (they ride next to duel messages)
const _duelRecvBond=duelRecv;
duelRecv=function(o,arr,fresh){if(Array.isArray(arr)){
  for(const e of arr.slice(-10)){if(!e||typeof e!=='object'||!/^bond/.test(e.k))continue;const i=fin(e.i);if(i<=(o.bdSeen||0))continue;o.bdSeen=i;
    if(fresh||e.to!==NET.myId||!P)continue;
    if(e.k==='bondask'){if(bondName()||BND.ask||(typeof isMuted==='function'&&isMuted(o.n))){dlSend(o.id,'bondno');continue;}BND.ask={id:o.id,name:o.n,at:now};bondDialog();
      setTimeout(()=>{if(BND.ask&&BND.ask.id===o.id)bondAnswer(false);},30000);}
    else if(e.k==='bondyes'){if(BND.out&&BND.out.id===o.id&&!bondName()){BND.out=null;bondMade(o.n);}}
    else if(e.k==='bondno'){if(BND.out&&BND.out.id===o.id){BND.out=null;addLog(`${o.n} would rather not form a bond right now.`);}}
    else if(e.k==='bondend'){if(isPartner(o)){P.bond=null;NET.lastSent='';save();addLog(`${o.n} ended your Kindred Bond.`,'l-bad');}}}}
  return _duelRecvBond(o,arr,fresh);};
// if my partner is online and bonded to someone else (or no one), the bond is over
const _netTickBond=netTick;
netTick=function(dt){_netTickBond(dt);const o=partnerHere();if(o&&o.bdKnown&&Date.now()-(P.bond.since||0)>15000&&(!o.bd||o.bd.toLowerCase()!==P.name.toLowerCase())){P.bond=null;NET.lastSent='';save();addLog(`${o.n} is no longer bonded with you.`,'l-bad');}};
function bondPresence(){return bondName();}
// only games that know about bonds (presence field bdv) can end one by not naming you
function bondRead(o,s){o.bdKnown=s&&s.bdv===1;o.bd=o.bdKnown&&typeof s.bd==='string'?clean(s.bd,16):null;}

// +10% EXP while your partner is close by
const _gainExpBond=gainExp;
gainExp=function(e,j){const o=partnerHere();if(o&&o.z===zoneId&&!o.dead&&Math.hypot(o.x-P.x,o.y-P.y)<=BOND_NEAR){e=Math.round(e*(1+BOND_EXP));j=Math.round(j*(1+BOND_EXP));}return _gainExpBond(e,j);};
// to my partner's side
function bondCall(){const o=partnerHere();if(!bondName()){addLog('You have no Kindred Bond yet. /bond Name to ask someone.','l-bad');return;}
  if(!o||o.dead||!ZONES[o.z]){addLog(`${bondName()} isn't anywhere you can reach right now.`,'l-bad');return;}
  const left=BND.callT+BOND_CALL_CD-now;if(left>0){addLog(`The bond needs ${Math.ceil(left/60)} more minute${left>60?'s':''} to gather strength.`);return;}
  if(P.dead)return;BND.callT=now;if(typeof AR!=='undefined'&&AR.match){addLog('Finish your arena match first.','l-bad');return;}
  if(o.z!==zoneId)enterZone(o.z);const tx=Math.floor(o.x/TILE),ty=Math.floor(o.y/TILE);let best=null;
  for(let r=1;r<4&&!best;r++)for(let dy=-r;dy<=r&&!best;dy++)for(let dx=-r;dx<=r;dx++){const x=tx+dx,y=ty+dy,j=y*Z.w+x;if(x>0&&y>0&&x<Z.w-1&&y<Z.h-1&&!BLOCK[Z.t[j]]&&Z.reach[j]){best={x:(x+.5)*TILE,y:(y+.5)*TILE};break;}}
  if(best){P.x=best.x;P.y=best.y;}P.path=[];P.target=null;P.portalLock=now+.6;sfx('portal');fx.push({k:'ring',x:P.x,y:P.y,r:36,col:'#ff9ad0',t0:now,dur:.6});
  addLog(`The Kindred Bond carries you to ${o.n}'s side.`,'l-good');save();}
// a pink heart and name under each other
function bondLabel(o,x,y){if(isPartner(o))label('♥ '+bondName(),x,y,'#ff9ad0',10);}

// the online list gets a Bond button; chat commands
const _updateWhoBond=updateWho;
updateWho=function(){_updateWhoBond();if(!P)return;for(const row of document.querySelectorAll('#whoList .who:not(.me)')){const nm=row.querySelector('b');if(!nm)continue;
  let peer=null;for(const [p,o] of NET.others)if(o.n===nm.textContent){peer=p;break;}if(!peer)continue;const wb=row.querySelector('.wb');if(!wb||wb.querySelector('.bondb'))continue;
  const o=NET.others.get(peer),b=document.createElement('button');b.className='btn small bondb';b.type='button';b.textContent=isPartner(o)?'♥ Call':'Bond';
  b.addEventListener('click',ev=>{ev.stopPropagation();if(isPartner(o))bondCall();else bondAsk(peer);});wb.appendChild(b);}};
const _chatCommandBond=chatCommand;
chatCommand=function(k,arg){
  if(k==='bond'){if(!arg){addLog(bondName()?`You share a Kindred Bond with ${bondName()}.`:'Usage: /bond Name');return true;}const peer=findPeerByName(arg);if(!peer)addLog(`${arg} is not here.`,'l-bad');else bondAsk(peer);return true;}
  if(k==='bondcall'){bondCall();return true;}
  if(k==='unbond'){if(!bondName())addLog('You have no Kindred Bond.');else bondEnd();return true;}
  return _chatCommandBond(k,arg);};
CMD_HELP.push(['/bond Name, /bondcall, /unbond','Kindred Bond: +10% EXP together, travel to each other']);
