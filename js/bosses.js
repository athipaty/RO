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
// boss music near a boss: world bosses, and (v1.71.3) every other boss and mini-boss on the map too
/* (v1.71.5) mini-bosses get a lighter battle song of their own (quicker, brighter, softer drums), so the big bosses
   still feel bigger. Composed for Embervale. */
if(typeof SONGS!=='undefined'&&!SONGS.miniboss){SONGS.miniboss={bpm:138,spb:8,lead:'square',lp:2000,lv:.6,chords:'Dm Bb C A Dm Bb C Dm',drums:{k:[0,4],h:[2,6],s:[4]},
  mel:'D5 . F5 A5 . F5 D5 . | D5 . Bb4 . F4 . Bb4 . | C5 . E5 G5 . E5 C5 . | C#5 . E5 . A4 . - - | F5 . E5 D5 A4 . D5 . | F5 . G5 F5 D5 . Bb4 . | E5 . G5 . C6 . G5 E5 | D5 . . . A4 . - -'};
  const sg=SONGS.miniboss,toks=sg.mel.replace(/\|/g,' ').trim().split(/\s+/);sg.len=toks.length;sg.ch=sg.chords.split(' ').map(chordNotes);
  sg.notes=toks.map((t,i)=>{const n=noteNum(t);if(n===null)return null;let len=1;while(toks[i+len]==='.')len++;return {n,len};});}
const bossChasing=m=>m&&!m.dead&&m.d&&(m.d.boss||m.d.world)&&m.state==='chase'&&dist(m,P)<650;
setInterval(()=>{if(!running||!P||zoneId==='crypt'||Z.D.dungeon||typeof musicPlay!=='function')return;
  const on=[wbMob,...mobs].filter(bossChasing),big=on.some(m=>!m.d.mini),song=big?'boss':on.length&&SONGS.miniboss?'miniboss':null;
  if(song)musicPlay(song);else if(AU.want==='boss'||AU.want==='miniboss')musicPlay(Z.D.music||zoneId);},1000);
