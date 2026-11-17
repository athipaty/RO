"use strict";
/* ================= monsters that only walk at night (v1.17.1) =================
   A monster with night:true (the Grand Scarecrow) waits until dark (game hour 20 to 5) to rise, and at dawn,
   if nobody is fighting it, it sinks back into the field. Runs wherever monsters are simulated on this device
   (alone or as the region's host). */
MOBS.grandscarecrow.night=true;
function isNightHour(h){h=h==null?gameHour():h;return h>=20||h<5;}
{const _um=updateMob;updateMob=function(m,dt,T){
  const d=m.d;if(!d||!d.night)return _um.apply(this,arguments);
  const night=isNightHour();
  if(m.dead){if(!night){if(now>=m.respawnAt)m.respawnAt=now+20;return;} // check again soon, rise once it is dark
    const was=now>=m.respawnAt;const r=_um.apply(this,arguments);
    if(was&&!m.dead&&dist(m,P)<900)addLog(`Night falls on ${Z.D.name}: the ${d.name} stirs.`,'l-bad');return r;}
  if(!night&&m.state!=='chase'&&!m.aggroed&&!(m.myDmg>0)){ // daylight and nobody fighting it: gone until dark
    m.dead=true;m.dying=now;m.hp=0;m.respawnAt=now+20;if(P.target===m){P.target=null;P.queued=null;}
    fx.push({k:'poof',x:m.x,y:m.y,col:d.col,t0:now,dur:.6});return;}
  return _um.apply(this,arguments);};}
TH_PAT.push([/^Night falls on (.+): the (.+) stirs\.$/,(m,z,n)=>`ราตรีมาเยือน${thText(z)}: ${thText(n)}เริ่มขยับตัว`]);
