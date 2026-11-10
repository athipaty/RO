"use strict";
/* ================= #40 world bosses: run by the game server, announced to the whole channel, MVP for the top damage ================= */
// The server sends the boss beside the region's regular monsters ({t: type, i: slot, s: state}); it lives in mobs[] after them.
function syncWorldBoss(host,base){const wb=host.wb;
  if(!wb||!MOBS[wb.t]||!MOBS[wb.t].world||(fin(wb.i)|0)!==base||!Array.isArray(wb.s)){if(wbMob)dropWorldBoss();return;}
  if(wbMob&&wbMob.d.id===wb.t)return;if(wbMob)dropWorldBoss();
  const m=spawnMob(wb.t);m.x=m.sx=fin(wb.s[0]);m.y=m.sy=fin(wb.s[1]);m.hp=clamp(fin(wb.s[2]),1,1000)/1000*m.d.hp;m.idx=base;
  if(fin(wb.s[3])&1)m.dead=true;mobs[base]=m;wbMob=m;}
function dropWorldBoss(){if(!wbMob)return;const i=mobs.indexOf(wbMob);if(i>=0)mobs.splice(i,1);if(P&&P.target===wbMob){P.target=null;P.queued=null;}wbMob=null;}

NET.wb=null; // {b, z, until} while a boss is out in this channel
function onWorldBoss(m){const d=MOBS[m.b];if(!d||!d.world||!ZONES[m.z])return;const zn=ZONES[m.z].name;
  if(m.k==='up'){NET.wb={b:m.b,z:m.z,until:Date.now()+clamp(fin(m.left),0,7200)*1000};
    if(m.late){addLog(`World boss: ${d.name} is roaming ${zn}.`,'l-rare');}
    else{addLog(`World boss! ${d.name} has appeared in ${zn}! Gather a party: the top damage dealer wins an MVP prize.`,'l-rare');showBanner(`${d.name} has appeared!`,`World boss · ${zn}`);sfx('rare');}}
  else if(m.k==='down'){NET.wb=null;const mvp=typeof m.mvp==='string'?m.mvp.slice(0,16):null;
    addLog(`${d.name} has been defeated!${mvp?` MVP: ${mvp}.`:''}`,'l-rare');showBanner(`${d.name} defeated!`,mvp?`MVP: ${mvp}`:'World boss');}
  else if(m.k==='gone'){NET.wb=null;addLog(`${d.name} has left ${zn}. Another world boss will appear later.`,'l-sys');}
  wbHud();}
function mvpWin(m){sfx('fanfare');shakeUntil=now+.3;fx.push({k:'lvl',x:P.x,y:P.y-30,t0:now,dur:2.4,txt:'MVP!',col:'#ffcf5a'});fx.push({k:'beam',x:P.x,y:P.y,t0:now,dur:1.8});
  const prize=(m.d.mvp||[]).map(([id])=>ITEMS[id]&&ITEMS[id].name).filter(Boolean);
  addLog(`You are the MVP of the ${m.d.name} fight!${prize.length?` Your prize dropped at its feet: ${prize.join(', ')}.`:''}`,'l-rare');}
let wbKey='';
function wbHud(){const el=document.getElementById('wbT');if(!el)return;const w=NET.wb;let t='';
  if(w){const left=Math.max(0,Math.round((w.until-Date.now())/60000));t=`☠ ${MOBS[w.b].name} · ${ZONES[w.z].name}${zoneId===w.z?' (here)':''} · ${left<1?'<1':left}m`;}
  if(t===wbKey)return;wbKey=t;el.hidden=!t;el.textContent=t;}
setInterval(()=>{if(running)wbHud();},1000);
// boss music near a world boss
setInterval(()=>{if(!running||!P||zoneId==='crypt'||typeof musicPlay!=='function')return;const near=wbMob&&!wbMob.dead&&wbMob.state==='chase'&&dist(wbMob,P)<650;
  if(near)musicPlay('boss');else if(AU.want==='boss')musicPlay(zoneId);},1000);
