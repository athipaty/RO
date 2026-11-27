"use strict";
/* ================= every boss its own signature skill (v1.51.3) =================
   Besides the Ground Slam and the Ground Mark every boss has (js/combat.js), each boss now has one skill of its own,
   used every 10-14 s when a player is within 450 px. The game server (or the game running the monsters) picks the
   moment, the spot and a seed, and sends it as event 'q'; each game plays it out the same way (the seed places the
   circles alike for everyone) and hurts only its own hero. Everything is shown before it lands, so it can be dodged.
   Boss curses: an ailment from a signature skill is a curse. A Remedy Draught cannot cure it (it only cures what
   ordinary monsters do); it wears off by itself, and healing skills that cure (Mend, Sanctuary, Resurgence) still can. */
const BOSS_SIG_EVERY=[10,14],BOSS_SIG_RANGE=450;
// a small seeded random so every game puts the circles in the same places
function bsRng(seed){let a=(seed>>>0)||1;return()=>{a+=0x6D2B79F5;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};}

/* ---- what the skills can do to your hero ---- */
const HZ=[]; // pending circles and lingering ground
const inR=(x,y,r)=>P&&!P.dead&&Math.hypot(P.x-x,P.y-y)<r+PR;
function bsHurt(m,k){if(!P||P.dead||!m||!m.d)return;const prev=typeof SFX_ATK!=='undefined'?SFX_ATK:null;if(typeof SFX_ATK!=='undefined')SFX_ATK=m;
  try{hurtPlayer(Math.max(1,Math.round(m.d.atk*k*rnd(.9,1.1)-S.def*.6)),m.d.name);}finally{if(typeof SFX_ATK!=='undefined')SFX_ATK=prev;}}
function bsCurse(k,dur,m){if(!P||P.dead||!AILS[k])return;
  if(typeof SFX!=='undefined'&&SFX.ailres&&Math.random()*100<Math.min(80,SFX.ailres)/2){floatT(P.x,P.y-44,'Resist!','#cfe8ff',12);return;} // resist counts for half against a boss
  if(!P.ail)P.ail={};if(!P.curse)P.curse={};const was=ailOn(k),until=Math.max(P.ail[k]||0,now+dur);P.ail[k]=until;P.curse[k]=until;
  if(!was){floatT(P.x,P.y-56,AILS[k].name+'!',AILS[k].col,14);addLog(`${m?m.d.name+': ':''}you are ${AILS[k].name.toLowerCase()} by a boss curse (a Remedy Draught cannot cure it).`,'l-bad');}
  if(typeof ailHeld==='function'&&ailHeld()){P.path=[];P.casting=null;P.sitting=false;}}
function bsSlow(k,dur){if(!P)return;P.slowUntil=Math.max(P.slowUntil||0,now+dur);P.slowK=Math.min(P.slowK&&P.slowUntil>now?P.slowK:1,k);}
function bsShove(m,distance){if(!P||P.dead)return;sfx('fling');const dx=P.x-m.x,dy=P.y-m.y,d=Math.hypot(dx,dy)||1,step=8,n=Math.ceil(Math.abs(distance)/step),s=Math.sign(distance);
  for(let i=0;i<n;i++){if(s<0&&Math.hypot(P.x-m.x,P.y-m.y)<m.d.size+PR+6)break;if(!moveEnt(P,dx/d*step*s,dy/d*step*s,PR))break;}P.path=[];NET.lastSent='';NET.sendT=0;}
// a circle that lands after `wait` s: col tints the warning; hit(m) runs if your hero is inside
function bsMark(m,x,y,r,wait,hit){HZ.push({t:'mark',m,x,y,r,at:now+wait,hit});fx.push({k:'warn',x,y,r,t0:now,dur:wait});}
// ground that stays for `dur` s: tick(m) every second while you stand in it, end(m) when it fades if you are still in it
function bsZone(m,x,y,r,dur,col,tick,end){HZ.push({t:'zone',m,x,y,r,until:now+dur,next:now+.5,col,tick,end,pulse:0});
  if(P&&Math.hypot(P.x-x,P.y-y)<700)sfx('zone');} // (v1.71.2) lingering ground was silent
function bsHzTick(){for(let i=HZ.length-1;i>=0;i--){const h=HZ[i];if(!mobs.includes(h.m)){HZ.splice(i,1);continue;}
    if(h.t==='mark'){if(now<h.at)continue;HZ.splice(i,1);fx.push({k:'ring',x:h.x,y:h.y,r:h.r,col:'#ff6a3a',t0:now,dur:.4});
      if(P&&Math.hypot(P.x-h.x,P.y-h.y)<700)sfx('slam');if(inR(h.x,h.y,h.r)){try{h.hit(h.m);}catch(e){}}continue;}
    if(now>=h.pulse){h.pulse=now+.45;fx.push({k:'ring',x:h.x,y:h.y,r:h.r,col:h.col,t0:now,dur:.55});}
    if(now>=h.until){HZ.splice(i,1);if(h.end&&inR(h.x,h.y,h.r)){try{h.end(h.m);}catch(e){}}continue;}
    if(now>=h.next){h.next=now+1;if(h.tick&&inR(h.x,h.y,h.r)){try{h.tick(h.m);}catch(e){}}}}}

/* ---- the skills ---- */
const around=(rng,x,y,R)=>{const a=rng()*Math.PI*2,d=Math.sqrt(rng())*R;return [x+Math.cos(a)*d,y+Math.sin(a)*d];};
const line=(m,x,y,n,extra)=>{const dx=x-m.x,dy=y-m.y,d=Math.hypot(dx,dy)||1,L=d+(extra||0),out=[];for(let i=1;i<=n;i++){const f=L*i/n;out.push([m.x+dx/d*f,m.y+dy/d*f]);}return out;};
const BOSS_SIG={
  hopperchief:{name:'Stomp Quake',desc:'three shockwaves hop toward you; each one stuns',
    run:(m,x,y)=>line(m,x,y,3).forEach(([a,b],i)=>bsMark(m,a,b,60,.9+i*.3,m=>{bsHurt(m,1.2);bsCurse('stun',1,m);}))},
  hornback:{name:'Horn Toss',desc:'gores everyone close and throws them back, stunned',
    run:m=>bsMark(m,m.x,m.y,120,.8,m=>{bsHurt(m,1.4);bsShove(m,140);bsCurse('stun',.8,m);})},
  woolhorn:{name:'Wool Fog',desc:'a thick fog around it blinds anyone inside',
    run:m=>bsZone(m,m.x,m.y,150,5,'#e8e0d0',m=>bsCurse('blind',2.5,m))},
  grandscarecrow:{name:'Crow Swarm',desc:'crows dive at the ground around you and peck your eyes',
    run:(m,x,y,rng)=>{for(let i=0;i<4;i++){const [a,b]=i?around(rng,x,y,110):[x,y];bsMark(m,a,b,55,1.1,m=>{bsHurt(m,1);bsCurse('blind',4,m);});}}},
  lupealpha:{name:'Alpha Howl',desc:'a howl that silences everyone near it',
    run:m=>bsMark(m,m.x,m.y,260,.9,m=>{bsHurt(m,.6);bsCurse('silence',3,m);})},
  thornmother:{name:'Bramble Field',desc:'brambles burst from the ground under you: they hurt and slow while you stand in them',
    run:(m,x,y)=>bsZone(m,x,y,120,6,'#7fbf5a',m=>{bsHurt(m,.35);bsSlow(.55,1.2);})},
  scarabqueen:{name:'Quicksand',desc:'the sand under you turns to quicksand: it slows you, and stuns you if you are still in it when it closes',
    run:(m,x,y)=>bsZone(m,x,y,110,5,'#d8b070',()=>bsSlow(.4,1.2),m=>bsCurse('stun',1.5,m))},
  antlerking:{name:'Thunder Hooves',desc:'a line of stamping shockwaves runs at you; each one stuns',
    run:(m,x,y)=>line(m,x,y,4,60).forEach(([a,b],i)=>bsMark(m,a,b,55,.8+i*.2,m=>{bsHurt(m,1.2);bsCurse('stun',1,m);}))},
  dunetyrant:{name:'Sandstorm',desc:'a sandstorm around it hurts and blinds anyone inside',
    run:m=>bsZone(m,m.x,m.y,220,6,'#e0c080',m=>{bsHurt(m,.3);bsCurse('blind',2,m);})},
  fallenpaladin:{name:'Oath of Ruin',desc:'a fallen oath brands the ground under you and silences you',
    run:(m,x,y)=>bsMark(m,x,y,70,1,m=>{bsHurt(m,1.3);bsCurse('silence',5,m);})},
  gloomking:{name:'Spore Cloud',desc:'a cloud of poison spores lingers where you stand',
    run:(m,x,y)=>bsZone(m,x,y,120,6,'#9a7ad8',m=>bsCurse('poison',6,m))},
  warlord:{name:'Warcry',desc:'a war cry that stuns everyone near it',
    run:m=>bsMark(m,m.x,m.y,300,1,m=>{bsHurt(m,.8);bsCurse('stun',1.5,m);})},
  orchidra:{name:'Sleeping Pollen',desc:'pollen settles around you: still inside when it settles, you fall asleep',
    run:(m,x,y)=>bsZone(m,x,y,100,3,'#f0a8d8',null,m=>bsCurse('sleep',3,m))},
  frostmatron:{name:'Ice Field',desc:'the ground under you freezes: it slows you, and freezes you if you are still on it when it sets',
    run:(m,x,y)=>bsZone(m,x,y,120,5,'#a8e0ff',()=>bsSlow(.5,1.2),m=>bsCurse('freeze',2,m))},
  rimeheart:{name:'Avalanche',desc:'ice falls all around you; each block freezes',
    run:(m,x,y,rng)=>{for(let i=0;i<5;i++){const [a,b]=i?around(rng,x,y,150):[x,y];bsMark(m,a,b,70,1.2+i*.1,m=>{bsHurt(m,1.3);bsCurse('freeze',1.5,m);});}}},
  geodecolossus:{name:'Crystal Prison',desc:'crystal grows under you and encases you: frozen for 3 s',
    run:(m,x,y)=>bsMark(m,x,y,60,1,m=>{bsHurt(m,.8);bsCurse('freeze',3,m);})},
  mirematriarch:{name:'Bog Grasp',desc:'the bog grabs at you: it slows and poisons you while you stand in it',
    run:(m,x,y)=>bsZone(m,x,y,110,5,'#6a9a5a',m=>{bsSlow(.5,1.2);bsCurse('poison',5,m);})},
  hrimfang:{name:'Frost Breath',desc:'a long line of frost breath runs at you; it freezes',
    run:(m,x,y)=>line(m,x,y,5,100).forEach(([a,b],i)=>bsMark(m,a,b,65,.9+i*.12,m=>{bsHurt(m,1.4);bsCurse('freeze',2,m);}))},
  hollowking:{name:'Soul Drain',desc:'marks you for its soul drain: poisoned and silenced',
    run:(m,x,y)=>bsMark(m,x,y,80,1,m=>{bsHurt(m,1);bsCurse('poison',6,m);bsCurse('silence',3,m);})},
  krakenmatron:{name:'Tidal Pull',desc:'a wave drags everyone near it to its side and slows them',
    run:m=>bsMark(m,m.x,m.y,BOSS_SIG_RANGE,.6,m=>{bsShove(m,-170);bsSlow(.6,3);})},
  cinderwyrm:{name:'Fire Rain',desc:'fireballs rain around you and leave burning ground',
    run:(m,x,y,rng)=>{for(let i=0;i<6;i++){const [a,b]=i?around(rng,x,y,160):[x,y];
      bsMark(m,a,b,60,1.1+i*.12,m=>bsHurt(m,1.2));setTimeout(()=>{if(mobs.includes(m))bsZone(m,a,b,60,3,'#ff7a3a',m=>bsHurt(m,.3));},(1.1+i*.12)*1000);}}},
  voltaris:{name:'Chain Lightning',desc:'lightning strikes you and the ground near you; each strike stuns',
    run:(m,x,y,rng)=>{for(let i=0;i<3;i++){const [a,b]=i?around(rng,x,y,200):[x,y];bsMark(m,a,b,60,.9,m=>{bsHurt(m,1.4);bsCurse('stun',1,m);});}}},
  ignarok:{name:'Molten Ground',desc:'lava pools open around you and the ground under you erupts',
    run:(m,x,y,rng)=>{bsMark(m,x,y,90,1.2,m=>bsHurt(m,1.6));for(let i=0;i<3;i++){const [a,b]=around(rng,x,y,140);bsZone(m,a,b,80,8,'#ff5a1a',m=>bsHurt(m,.45));}}}};

// play a signature skill (from the server's event, or from the game running the monsters)
function bossSigCast(m,x,y,seed){const s=m&&m.d&&BOSS_SIG[m.d.id];if(!s||m.dead)return;
  floatT(m.x,m.y-m.d.size-34,s.name+'!','#ffb070',15);if(P&&Math.hypot(P.x-m.x,P.y-m.y)<700)sfx('cast');
  try{s.run(m,x,y,bsRng(seed));}catch(e){}}

/* ---- every frame: circles and ground, and walking slowed ---- */
{const _upBS=update;update=function(dt){if(HZ.length)bsHzTick();
  if(P&&S&&now<(P.slowUntil||0)){const s0=S,sp=s0.speed;s0.speed=sp*(P.slowK||1);try{return _upBS(dt);}finally{s0.speed=sp;}}
  if(P&&P.slowK&&now>=(P.slowUntil||0))P.slowK=1;return _upBS(dt);};}

/* ---- boss curses: a Remedy Draught leaves them; skills that cure still clear them ---- */
let CURE_BY_ITEM=0;
{const _caBS=cureAll;cureAll=function(){const keep={};if(CURE_BY_ITEM&&P&&P.curse)for(const k in P.curse)if(P.curse[k]>now&&P.ail&&P.ail[k]>now)keep[k]=P.ail[k];
  const r=_caBS.apply(this,arguments);if(P){if(Object.keys(keep).length){P.ail=P.ail||{};Object.assign(P.ail,keep);}else P.curse={};}return r;};}
{const _uiBS=useItem;useItem=function(id){const it=ITEMS[id];if(!it||!it.cure)return _uiBS.apply(this,arguments);
  // only boss curses on you: say so instead of using the draught
  const plain=Object.keys(P.ail||{}).filter(k=>ailOn(k)&&!((P.curse||{})[k]>now));
  if(!plain.length&&Object.keys(P.ail||{}).some(ailOn)){addLog('A Remedy Draught cannot cure a boss curse. It wears off by itself, or a healer\'s cure can lift it.','l-bad');return;}
  CURE_BY_ITEM++;try{return _uiBS.apply(this,arguments);}finally{CURE_BY_ITEM--;}};}

/* ---- the bestiary says what each boss does ---- */
if(typeof refreshPanel==='function'){const _rpBS=refreshPanel;refreshPanel=function(){_rpBS.apply(this,arguments);
  if(panelKind!=='mob'||!panel||panel.querySelector('.bsig'))return;const d=MOBS[panelArg];if(!d||!(d.boss||d.world))return;const s=BOSS_SIG[d.id];
  const div=document.createElement('div');div.className='mskills bsig';
  div.innerHTML=`<h3>Boss skills</h3><div class="sub"><b>Ground Slam</b>: hits everyone close after a short warning, and can stun.</div>`+
    `<div class="sub"><b>Ground Mark</b>: marks the ground under a player; it erupts a moment later.</div>`+
    (s?`<div class="sub"><b>${esc(s.name)}</b>: ${esc(s.desc[0].toUpperCase()+s.desc.slice(1))}.</div>`:'')+
    `<div class="sub muted">Ailments from a boss's skills are curses: a Remedy Draught cannot cure them.</div>`;
  const f=[...panel.querySelectorAll('h3')].find(h=>/Found in/.test(h.textContent));if(f)panel.insertBefore(div,f);else panel.appendChild(div);};}
