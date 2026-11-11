"use strict";
/* ================= follow a party member: walk behind them, through gates into other regions too ================= */
let FOL=null; // {peer, name, repathT}

function followStart(peer){const o=NET.others.get(peer);if(!o||!inParty(peer)){addLog('You can only follow party members.','l-bad');return;}
  if(P.dead)return;FOL={peer,name:o.n,repathT:0};P.target=null;P.queued=null;P.npcGoal=null;P.sitting=false;
  addLog(`Following ${o.n}. Skills go at what ${o.n} is fighting. Click the ground, move, or attack to stop.`,'l-good');sfx('click');if(typeof renderParty==='function')renderParty();}
function followStop(msg){if(!FOL)return;FOL=null;P.path=[];if(P.assist){P.assist=false;P.target=null;P.queued=null;}if(msg)addLog(msg);if(typeof renderParty==='function')renderParty();}
const following=peer=>!!FOL&&FOL.peer===peer;
// while following, a skill with no target of our own goes at whatever the leader is fighting
function followAssist(){if(!FOL)return false;const o=NET.others.get(FOL.peer);if(!o||o.z!==zoneId||!(o.tg>=0))return false;
  const m=mobs[o.tg];if(!m||m.dead)return false;P.target=m;P.assist=true;P.holdPos=false;return true;}

function followTick(dt){if(!FOL||!P)return;const o=NET.others.get(FOL.peer);
  if(!o||!inParty(FOL.peer)){followStop(`${FOL.name} is no longer in your party, so you stopped following.`);return;}
  if(P.dead){followStop();return;}
  if(P.assist){ // a skill on the leader's target: done once it fired (or the target is gone)
    if(!P.target||P.target.dead||(!P.casting&&!P.queued)){P.assist=false;P.target=null;P.queued=null;}}
  if(P.target&&!P.assist){followStop(`You stopped following ${FOL.name} to fight.`);return;}
  if(P.casting){P.path=[];return;} // stand still while casting so the walk does not cancel it
  FOL.repathT-=dt;if(FOL.repathT>0)return;FOL.repathT=.4;
  if(o.z!==zoneId){ // they went through a gate: take the same one
    const pt=Z.portals.find(p=>p.to===o.z);
    if(!pt){followStop(`${o.n} went to ${ZONES[o.z]?.name||'somewhere'}, which you can't walk to from here.`);return;}
    pathTo(pt.x,pt.y,true);return;}
  const d=Math.hypot(o.rx-P.x,o.ry-P.y);
  if(d>56){const k=(d-40)/d;pathTo(P.x+(o.rx-P.x)*k,P.y+(o.ry-P.y)*k,true);} // stop a step behind them
  else if(P.path.length&&d<40)P.path=[];}

const _netTickF=netTick;
netTick=function(dt){_netTickF(dt);try{followTick(dt);}catch(e){FOL=null;}};

// clicking the ground or moving by keyboard takes back control
cv.addEventListener('pointerdown',()=>{if(FOL&&running)followStop(`You stopped following ${FOL.name}.`);});
window.addEventListener('keydown',ev=>{if(!FOL||ev.target.tagName==='INPUT')return;
  if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright'].includes(ev.key.toLowerCase()))followStop(`You stopped following ${FOL.name}.`);});

// /follow Name (or /follow on its own to stop)
const _chatCommandF=chatCommand;
chatCommand=function(k,arg){if(k==='follow'||k==='f'){if(!arg){if(FOL)followStop(`You stopped following ${FOL.name}.`);else addLog('Usage: /follow Name (a party member). /follow on its own stops.');return true;}
  const peer=findPeerByName(arg);if(!peer)addLog(`${arg} is not here.`,'l-bad');else followStart(peer);return true;}return _chatCommandF(k,arg);};
CMD_HELP.push(['/follow Name','follow a party member (again to stop)']);
