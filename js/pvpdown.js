"use strict";
/* ================= knocked down in player fights (v1.49.1) =================
   Losing a duel, being knocked out of an arena match or in a guild war now looks like a fall to a monster: the hero
   falls over and lies there (the same fall as js/anim.js drawDown), and everyone nearby sees it ("kd" in presence).
   It is not a death: no EXP is lost, nothing drops, no return to town.
     duel        down 4 s where you fell, then you stand up at 1 HP as before
     arena       down until the match ends (or you leave the arena)
     guild war   down 3 s where you fell, then back to the gate with 60% HP as before
   While down you cannot move, attack, cast or use skills. Read pvpDowned(); pvpDown(seconds, then) starts it. */
const PDOWN={until:0,t:0,x:0,y:0,then:null,arena:false};
function pvpDowned(){return !!(P&&PDOWN.until>now);}
function pvpDown(sec,then){if(!P||P.dead)return;
  PDOWN.until=now+sec;PDOWN.t=now;PDOWN.x=P.x;PDOWN.y=P.y;PDOWN.then=then||null;
  P.target=null;P.queued=null;P.casting=null;P.path=[];P.sitting=false;P.moving=false;
  if(typeof interruptCast==='function')interruptCast();NET.lastSent='';NET.sendT=0;}
function pvpStandUp(){const f=PDOWN.then;PDOWN.until=0;PDOWN.then=null;PDOWN.arena=false;NET.lastSent='';NET.sendT=0;if(f&&P&&!P.dead)f();}

// every frame: stay where you fell; stand up when the time is over (or the arena match is over)
{const _upPD=update;update=function(dt){_upPD(dt);if(!PDOWN.until||!P)return;
  if(P.dead){PDOWN.until=0;PDOWN.then=null;PDOWN.arena=false;return;}
  if(PDOWN.arena){const M=typeof AR!=='undefined'?AR.match:null;if(!M||!M.out||zoneId!=='arena')PDOWN.until=now;else PDOWN.until=Math.max(PDOWN.until,now+1);}
  if(now>=PDOWN.until){pvpStandUp();return;}
  P.hp=Math.max(1,P.hp);P.x=PDOWN.x;P.y=PDOWN.y;P.target=null;P.queued=null;P.casting=null;P.path=[];P.moving=false;P.sitting=false;};}
// no attacks or skills while down
{const _baPD=basicAttack;basicAttack=function(){if(pvpDowned())return;return _baPD.apply(this,arguments);};
  const _usPD=useSkill;useSkill=function(){if(pvpDowned())return;return _usPD.apply(this,arguments);};}
// draw myself lying down
{const _dpPD=drawPlayer;drawPlayer=function(p,wid){if(p===P&&pvpDowned())return _dpPD({...P,dead:true,deadT:PDOWN.t},wid);return _dpPD(p,wid);};}

// the three ways to lose a player fight
{const _endD=duelEnd;duelEnd=function(msg,cls){const lost=!!DUEL&&cls==='l-bad'&&P&&!P.dead&&P.hp<=1;_endD(msg,cls);if(lost)pvpDown(4);};}
if(typeof arenaOut==='function'){const _outA=arenaOut;arenaOut=function(why){const M=AR.match,was=!!(M&&!M.out);_outA(why);
  if(was&&AR.match&&AR.match.out&&zoneId==='arena'&&P&&!P.dead){P.sitting=false;pvpDown(60);PDOWN.arena=true;}};}
if(typeof gwKnockout==='function'){const _koGW=gwKnockout;gwKnockout=function(by){if(pvpDowned())return;P.hp=1;
  addLog(`${by} knocked you down!`,'l-bad');pvpDown(3,()=>_koGW(by));};}
