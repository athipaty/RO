"use strict";
/* ================= the open arena: no queue, walk in and fight (v1.49.1) =================
   The Arena Master (or /arena) lets you straight into the Ember Arena while there is room (up to 20 fighters in a
   channel; the game server keeps the count and the list, see brawl.js on the server). Inside, every other fighter is
   fair game. Fall to 1 HP and you are knocked down for 4 s (js/pvpdown.js), then stand up somewhere else in the arena
   at full HP with 3 s of protection. Nobody dies or loses EXP. Hits are kind "fa" and go through the server
   (js/pvpserver.js), which only lets them through between two fighters on its list. The old ranked queue is gone from
   the window; a ranked match already running still plays out (js/arena.js).
   Auto mode is off in every player fight (duel, ranked match, the open arena, the guild war in the keep). */
const BRAWL_CAP=20,BRAWL_REACH=450,BRAWL_SAFE=3;
const BRW={sock:null,in:false,n:0,cap:BRAWL_CAP,ents:new Map(),safeUntil:0,kos:0,falls:0,askT:-99,leftT:-99};
const brawlOn=()=>!!(BRW.in&&zoneId==='arena'&&P&&!P.dead&&!(typeof AR!=='undefined'&&AR.match));
const brawlFoe=o=>!!(o&&o.id&&o.z==='arena'&&o.br===1&&!o.dead);
if(typeof PVP_HIT_KINDS!=='undefined')PVP_HIT_KINDS.fa=1;
const brawlSend=(ev,d)=>{if(BRW.sock&&BRW.sock.connected){BRW.sock.emit(ev,d||{});return true;}return false;};
function brawlSpawn(){const pits=ARENA_PITS,[cx,cy]=pits[Math.floor(Math.random()*pits.length)];
  P.x=(cx+rnd(-3,3)+.5)*TILE;P.y=(cy+rnd(-2,2)+.5)*TILE;P.path=[];P.target=null;P.queued=null;P.casting=null;P.sitting=false;
  BRW.safeUntil=now+BRAWL_SAFE;fx.push({k:'ring',x:P.x,y:P.y,r:30,col:'#ffcf5a',t0:now,dur:.7});NET.lastSent='';NET.sendT=0;}
function brawlClear(){for(const e of BRW.ents.values())if(P&&P.target===e)P.target=null;BRW.ents.clear();}

/* ---- the server: a place in the arena ---- */
{const _aaBR=arenaAttach;arenaAttach=function(sock){_aaBR(sock);BRW.sock=sock;BRW.in=false;
  sock.on('brawlInfo',m=>{try{if(!m)return;BRW.n=clamp(Math.round(fin(m.n)),0,999);BRW.cap=clamp(Math.round(fin(m.cap))||BRAWL_CAP,1,999);
    if(m.ok===true&&P){const fresh=!BRW.in;BRW.in=true;
      if(fresh){if(zoneId!=='arena'){closePanel();enterZone('arena','town');}S=computeStats();P.hp=S.maxhp;brawlSpawn();BRW.kos=0;BRW.falls=0;
        addLog(`You entered the arena (${BRW.n}/${BRW.cap} fighters). Tap anyone to fight! Fall to 1 HP and you are knocked down, then back in the fight. Auto mode is off here.`,'l-rare');
        showBanner('Ember Arena','Open fight · no queue');sfx('fanfare');save();}}
    else if(m.ok===false){addLog(clean(m.why,120)||'The arena is full right now.','l-bad');if(zoneId==='arena'&&!BRW.in&&!(AR&&AR.match)){enterZone('town','arena');save();}}
    if(m.in===false&&BRW.in&&m.ok===undefined)BRW.in=false;
    if(panelKind==='arena')refreshPanel();}catch(e){}});
  sock.on('disconnect',()=>{BRW.in=false;brawlClear();});};}

/* ---- the Arena Master's window ---- */
PANELS.arena=()=>{const full=BRW.n>=BRW.cap&&!BRW.in,M=typeof AR!=='undefined'?AR.match:null,online=!!(BRW.sock&&BRW.sock.connected);
  let h=`<h2>Ember Arena</h2><div class="sub">An open fight with no queue: walk in and fight anyone inside, up to ${BRW.cap} fighters at a time. Fall to 1 HP and you are knocked down for a moment, then you stand up somewhere else in the arena at full HP. Nobody dies or loses EXP. Auto mode is off in the arena.</div>`;
  h+=`<div class="arstats"><div><b>${BRW.n}/${BRW.cap}</b><span>inside</span></div>${BRW.in?`<div><b>${BRW.kos}</b><span>knockdowns</span></div><div><b>${BRW.falls}</b><span>falls</span></div>`:''}</div>`;
  if(M)h+=`<div class="arbox">You are in a ranked ${M.mode} match. Finish it first.</div>`;
  else if(!online)h+=`<div class="arbox">The arena needs the game server, which is not reachable right now.</div>`;
  else if(full)h+=`<div class="arbox">The arena is full. Try again in a moment.</div>`;
  h+=`<div class="tbtns">${BRW.in&&zoneId==='arena'?`<button class="btn small" data-act="brleave">Leave the arena</button>`:`<button class="btn small" data-act="brjoin" ${M||!online||full?'disabled':''}>Enter the arena</button>`}</div>`;
  return h;};
{const _opBR=openPanel;openPanel=function(kind,arg){if(kind==='arena')brawlSend('brawlInfo');return _opBR(kind,arg);};}
PANEL_ACTS.brjoin=()=>{if(DUEL){addLog('Finish your duel first.','l-bad');return;}
  if(!brawlSend('brawlJoin'))addLog('The arena needs the game server, which is not reachable right now.','l-bad');};
PANEL_ACTS.argo=PANEL_ACTS.brjoin;
PANEL_ACTS.brleave=()=>{brawlSend('brawlLeave');BRW.in=false;BRW.leftT=now;brawlClear();closePanel();if(zoneId==='arena'){enterZone('town','arena');save();}};
PANEL_ACTS.arleave=PANEL_ACTS.brleave;

/* ---- my attacks on a fighter's stand-in: sent as kind "fa" ---- */
{const _hmBR=hurtMob;hurtMob=function(m,dmg,crit,kind){if(!m||!m.brawl)return _hmBR(m,dmg,crit,kind);
  if(!brawlOn()||m.dead||pvpDowned())return;dlSend(m.pid,'fa',{d:Math.round(dmg),c:crit?1:0});m.hitF=now;
  if(crit){sfx('crit');texts.push({x:m.x,y:m.y-40,txt:fmt(dmg),col:'#ffb03a',size:24,t0:now,dur:1});}else{sfx(kind==='mag'?'zap':hitSound());floatT(m.x,m.y-28,fmt(dmg),'#ffffff',15);}};}

/* ---- hits on me, and word that I knocked someone down ---- */
function brawlKO(o){P.hp=1;BRW.falls++;dlSend(o.id,'fako');addLog(`${o.n} knocked you down!`,'l-bad');
  pvpDown(4,()=>{S=computeStats();P.hp=S.maxhp;brawlSpawn();});}
{const _drBR=duelRecv;duelRecv=function(o,arr,fresh){if(Array.isArray(arr)){
  for(const e of arr.slice(-10)){if(!e||typeof e!=='object'||(e.k!=='fa'&&e.k!=='fako'))continue;
    if(!o.__srv){const i=fin(e.i),key=e.k==='fa'?'faSeen':'fkSeen';if(i<=(o[key]||0))continue;o[key]=i;}
    if(fresh||e.to!==NET.myId||!P)continue;
    if(e.k==='fako'){if(!BRW.in)continue;BRW.kos++;addLog(`You knocked down ${o.n}!`,'l-good');texts.push({x:P.x,y:P.y-70,txt:'KO!',col:'#ffcf5a',size:26,t0:now,dur:1});sfx('fanfare');
      if(panelKind==='arena')refreshPanel();continue;}
    if(!brawlOn()||!brawlFoe(o)||pvpDowned()||now<BRW.safeUntil)continue;
    if(Math.hypot(o.x-P.x,o.y-P.y)>BRAWL_REACH)continue;
    const d=pvpTaken(e.d,o);P.hp-=d;P.hurtT=now;P.sitting=false;interruptCast();sfx('hurt');fx.push({k:'spark',x:P.x,y:P.y-24,t0:now,dur:.22,r:rnd(0,6),col:'#ff8a7a'});
    hurtNum(P.x,P.y-30,d,!!e.c);if(P.hp<=1)brawlKO(o);}}
  return _drBR(o,arr,fresh);};}

/* ---- every frame: stand-ins for the other fighters; leaving the arena gives the place back ---- */
{const _ntBR=netTick;netTick=function(dt){_ntBR(dt);if(!P)return;
  if(BRW.in&&zoneId!=='arena'){brawlSend('brawlLeave');BRW.in=false;BRW.leftT=now;brawlClear();return;}
  // in the arena without a place (a saved game that starts here, or another way in): ask for one, once
  if(zoneId==='arena'&&!BRW.in&&!(AR&&AR.match)&&BRW.sock&&BRW.sock.connected&&now-BRW.askT>20&&now-BRW.leftT>2){BRW.askT=now;brawlSend('brawlJoin');}
  if(!brawlOn()){if(BRW.ents.size)brawlClear();return;}
  const seen=new Set();
  for(const o of NET.others.values()){if(!brawlFoe(o))continue;seen.add(o.id);let e=BRW.ents.get(o.id);
    if(!e){e={pvp:true,brawl:true,pid:o.id,x:o.rx,y:o.ry,hp:100,dead:false,hitF:-9,idx:-1,state:'idle',d:{id:'brawl',name:o.n,lv:1,hp:100,size:12,flee:1,def:0,el:'neutral',drops:[]}};BRW.ents.set(o.id,e);}
    e.x=o.rx;e.y=o.ry;e.hp=Math.max(1,o.hp||1);e.d.name=o.n;e.d.lv=o.lv||1;e.d.flee=pvpFlee(o);e.dead=!!o.kd;if(e.dead&&P.target===e)P.target=null;}
  for(const [id,e] of BRW.ents)if(!seen.has(id)){if(P.target===e)P.target=null;BRW.ents.delete(id);}
  // a shimmer while protected after standing up
  if(now<BRW.safeUntil&&Math.floor(now*3)!==Math.floor((now-dt)*3))fx.push({k:'ring',x:P.x,y:P.y,r:22,col:'#ffe9a0',t0:now,dur:.4});};}
// tapping a fighter targets them
{const _maBR=mobAt;mobAt=function(sc){const m=_maBR(sc);if(m||!brawlOn())return m;
  for(const e of BRW.ents.values()){if(e.dead)continue;const p=proj(e.x,e.y);if(Math.hypot(p.x-sc.x,p.y-18-sc.y)<(touchPick?34:24))return e;}return null;};}

/* ---- no auto mode in any player fight ---- */
function pvpNoAuto(){return !!(P&&((typeof DUEL!=='undefined'&&DUEL)||zoneId==='arena'||(typeof AR!=='undefined'&&AR.match)||
  (zoneId==='keep'&&typeof GW!=='undefined'&&GW.war)));}
{let said=-99;const _upNA=update;update=function(dt){_upNA(dt);if(P&&P.auto&&pvpNoAuto()){P.auto=false;const b=document.getElementById('autoBtn');if(b)b.classList.remove('on');
  if(now-said>5){said=now;addLog('Auto mode is off in player fights. Fight by hand!','l-sys');}}};}
CMD_HELP.forEach(c=>{if(c[0]==='/arena')c[1]='open arena: walk in and fight, up to 20 fighters';});
