"use strict";
/* ================= #27 second jobs: two advanced callings per class, a trial to earn them, hotbar slots ================= */

// Each first job branches into two. A second job keeps every skill of its first job and adds three of its own.
const JOB2={
  bulwark:{base:'warden',name:'Bulwark',hp:2.05,sp:.9,aspd:.95,col:'#7d8796',acc:'#e8c25a',
    desc:'An immovable shield-bearer. Huge HP and DEF, stuns with the shield and draws every monster to itself.',
    skills:['shieldbash','bastion','warcry']},
  ravager:{base:'warden',name:'Ravager',hp:1.75,sp:.85,aspd:.82,col:'#8a2a24',acc:'#ff9a5a',
    desc:'A reckless berserker. Trades defence for raw damage and shatters the ground around it.',
    skills:['rendingblow','frenzy','earthshatter']},
  stormcaller:{base:'arcanist',name:'Stormcaller',hp:.9,sp:2.3,aspd:1.1,col:'#3a5ec0',acc:'#9fe0ff',
    desc:'A master of the elements. Slow, devastating spells that hit whole packs at once.',
    skills:['glaciallance','cinderfall','manasurge']},
  hexweaver:{base:'arcanist',name:'Hexweaver',hp:1,sp:2.1,aspd:1.05,col:'#4a2e6a',acc:'#c58cff',
    desc:'A shadow mage. Curses foes, slows them to a crawl and drains their life to stay standing.',
    skills:['shadowlance','hexofsloth','soulsiphon']},
  sharpshooter:{base:'ranger',name:'Sharpshooter',hp:1.2,sp:1.2,aspd:.8,col:'#2f6a5a',acc:'#e0c070',
    desc:'A patient marksman. Enormous single shots and the widest arrow storms.',
    skills:['piercingshot','trueaim','volley']},
  wildstalker:{base:'ranger',name:'Wildstalker',hp:1.3,sp:1.15,aspd:.78,col:'#5a6a2a',acc:'#9be38a',
    desc:'A hunter of the deep woods. Venom, snares and speed keep monsters from ever reaching it.',
    skills:['venomarrow','snareshot','swiftstep']},
  templar:{base:'cleric',name:'Templar',hp:1.55,sp:1.6,aspd:.95,col:'#c8a040',acc:'#fff0a0',
    desc:'A holy warrior. Fights up close with sacred strikes and a shield of light.',
    skills:['crusade','holyaegis','judgment']},
  oracle:{base:'cleric',name:'Oracle',hp:1.25,sp:2,aspd:1,col:'#e8e0c8',acc:'#7fd3ff',
    desc:'A seer of the light. The strongest healing and holy magic that scours undead.',
    skills:['sanctuary','radiance','divinegrace']},
};
for(const id in JOB2){const j=JOB2[id],b=CLASSES[j.base];
  CLASSES[id]={name:j.name,hp:j.hp,sp:j.sp,aspd:j.aspd,weapons:b.weapons,col:j.col,hair:b.hair,magic:b.magic,base:j.base,tier:2,acc:j.acc,
    desc:j.desc,own:j.skills,skills:[...b.skills.filter(s=>s!=='firstaid'),...j.skills,'firstaid']};}
const baseOf=cls=>(CLASSES[cls]&&CLASSES[cls].base)||cls;
const jobsFrom=cls=>Object.keys(JOB2).filter(id=>JOB2[id].base===cls);
const JOB2_LV=40; // job level a first job needs before its trial

const JSK={
  // Bulwark
  shieldbash:{name:'Shield Bash',max:10,col:'#9aa6b8',g:'◘',sp:l=>10+l,cd:1.2,kind:'target',range:55,desc:l=>`Slam your shield for ${180+l*30}% ATK. ${35+l*4}% chance to stun for 2s.`,
    run:(l,t)=>{fx.push({k:'spark',x:t.x,y:t.y-t.d.size,t0:now,dur:.3,r:4});dealPhys(t,1.8+l*.3,{sure:true,ail:['stun',.35+l*.04,2]});}},
  bastion:{name:'Bastion',max:10,col:'#c8ccd4',g:'▣',sp:l=>30,cd:30,kind:'self',desc:l=>`For 60s: +${l*8} DEF and +${l*3}% Max HP.`,
    run:l=>buff('bastion','Bastion',60,{def:l*8,hppct:l*3})},
  warcry:{name:'War Cry',max:10,col:'#e8c25a',g:'!',sp:l=>16+l,cd:8,kind:'self',desc:l=>`Every monster within 160px turns on you, and you gain +${l*5} ATK for 30s.`,
    run:l=>{fx.push({k:'ring',x:P.x,y:P.y,r:160,col:'#e8c25a',t0:now,dur:.45});aoe(P.x,P.y,160,m=>{if(zoneHost())sendHit(m,0,0);else provoke(m);});buff('warcry','War Cry',30,{atk:l*5});}},
  // Ravager
  rendingblow:{name:'Rending Blow',max:10,col:'#d0503a',g:'X',sp:l=>12+l*2,cd:1,kind:'target',range:55,desc:l=>`A savage blow for ${250+l*50}% ATK that never misses.`,
    run:(l,t)=>{fx.push({k:'slash',x:t.x,y:t.y,t0:now,dur:.3});fx.push({k:'critburst',x:t.x,y:t.y-t.d.size,t0:now,dur:.3});dealPhys(t,2.5+l*.5,{sure:true});}},
  frenzy:{name:'Frenzy',max:10,col:'#ff7a4a',g:'F',sp:l=>25,cd:30,kind:'self',desc:l=>`For 45s: +${l*8} ATK and +${l} AGI, but −${l*3} DEF.`,
    run:l=>buff('frenzy','Frenzy',45,{atk:l*8,agi:l,def:-l*3})},
  earthshatter:{name:'Earthshatter',max:10,col:'#c8964a',g:'E',sp:l=>20+l*2,cd:3,kind:'self',desc:l=>`Smash the ground: Earth damage to all within 120px, ${180+l*30}% ATK, ${10+l*2}% chance to stun.`,
    run:l=>{shakeUntil=now+.3;fx.push({k:'ring',x:P.x,y:P.y,r:120,col:'#c8964a',t0:now,dur:.4});aoe(P.x,P.y,120,m=>dealPhys(m,1.8+l*.3,{sure:true,el:'earth',ail:['stun',.1+l*.02,1.5]}));}},
  // Stormcaller
  glaciallance:{name:'Glacial Lance',max:10,col:'#9fe0ff',g:'G',sp:l=>12+l*2,cd:1,kind:'target',range:240,desc:l=>`A spear of ice for ${260+l*40}% MATK (Water), ${20+l*3}% chance to freeze.`,
    run:(l,t)=>shoot(P,t,'orb','#9fe0ff',()=>dealMag(t,2.6+l*.4,'water',['freeze',.2+l*.03,2]))},
  cinderfall:{name:'Cinderfall',max:10,col:'#ff6a2a',g:'C',sp:l=>40+l*4,cd:6,kind:'area',range:260,radius:130,desc:l=>`Rain fire on your target's area: ${320+l*60}% MATK (Fire) to all within 130px.`,
    run:(l,x,y)=>{for(let i=0;i<8;i++)fx.push({k:'pillar',x:x+rnd(-100,100),y:y+rnd(-70,70),t0:now+i*.06,dur:.4});fx.push({k:'ring',x,y,r:130,col:'#ff8a3a',t0:now,dur:.5});shakeUntil=now+.25;aoe(x,y,130,m=>dealMag(m,3.2+l*.6,'fire'));}},
  manasurge:{name:'Mana Surge',max:10,col:'#7a9cff',g:'M',sp:l=>30,cd:30,kind:'self',desc:l=>`For 60s: +${l*10} MATK and +${l*2} INT.`,
    run:l=>buff('manasurge','Mana Surge',60,{matk:l*10,int:l*2})},
  // Hexweaver
  shadowlance:{name:'Shadow Lance',max:10,col:'#a07ad0',g:'L',sp:l=>10+l*2,cd:.9,kind:'target',range:230,desc:l=>`Shadow magic for ${200+l*35}% MATK. You heal ${l*2}% of your Max HP.`,
    run:(l,t)=>shoot(P,t,'orb','#a07ad0',()=>{dealMag(t,2+l*.35,'shadow');healP(S.maxhp*l*.02);})},
  hexofsloth:{name:'Hex of Sloth',max:10,col:'#7a5aa0',g:'H',sp:l=>14,cd:4,kind:'target',range:230,desc:l=>`Curse a monster: slowed for ${3+l*.5}s, ${20+l*4}% chance to stun it for 2s.`,
    run:(l,t)=>{fx.push({k:'ring',x:t.x,y:t.y,r:30,col:'#a07ad0',t0:now,dur:.5});slowMob(t,3+l*.5);if(Math.random()<.2+l*.04)ailMob(t,'stun',2);else if(zoneHost())sendHit(t,0,0);else provoke(t);}},
  soulsiphon:{name:'Soul Siphon',max:10,col:'#c58cff',g:'S',sp:l=>22+l*2,cd:4,kind:'self',desc:l=>`Shadow damage to all within 115px: ${150+l*25}% MATK. Restores ${l*2} SP per monster hit.`,
    run:l=>{fx.push({k:'nova',x:P.x,y:P.y,r:115,t0:now,dur:.5});let n=0;aoe(P.x,P.y,115,m=>{dealMag(m,1.5+l*.25,'shadow');n++;});if(n)P.sp=Math.min(S.maxsp,P.sp+n*l*2);}},
  // Sharpshooter
  piercingshot:{name:'Piercing Shot',max:10,col:'#e0c070',g:'P',sp:l=>12+l*2,cd:1.2,kind:'target',range:280,desc:l=>`A careful shot for ${300+l*50}% ATK that never misses and ignores half of DEF.`,
    run:(l,t)=>shoot(P,t,'arrow','#ffe08a',()=>{const d=t.d;t.d={...d,def:d.def/2};try{dealPhys(t,3+l*.5,{sure:true});}finally{t.d=d;}})},
  trueaim:{name:'True Aim',max:10,col:'#f0d070',g:'A',sp:l=>25,cd:30,kind:'self',desc:l=>`For 90s: +${l*4} ATK, +${l*3} HIT and +${l} CRIT.`,
    run:l=>buff('trueaim','True Aim',90,{atk:l*4,hit:l*3,crit:l})},
  volley:{name:'Volley',max:10,col:'#d8e070',g:'V',sp:l=>26+l*3,cd:4,kind:'area',range:280,radius:150,desc:l=>`A storm of arrows on your target's area: ${180+l*35}% ATK to all within 150px.`,
    run:(l,x,y)=>{for(let i=0;i<22;i++)fx.push({k:'arrowfall',x:x+rnd(-140,140),y:y+rnd(-100,100),t0:now+i*.025,dur:.35});aoe(x,y,150,m=>dealPhys(m,1.8+l*.35,{sure:true}));}},
  // Wildstalker
  venomarrow:{name:'Venom Arrow',max:10,col:'#7fd36a',g:'V',sp:l=>8+l,cd:.8,kind:'target',range:260,desc:l=>`A poisoned arrow for ${160+l*30}% ATK (Earth). The monster is slowed for ${2+l*.3}s.`,
    run:(l,t)=>shoot(P,t,'arrow','#9be38a',()=>{dealPhys(t,1.6+l*.3,{sure:true,el:'earth'});slowMob(t,2+l*.3);})},
  snareshot:{name:'Snare Shot',max:10,col:'#b8a060',g:'N',sp:l=>12,cd:5,kind:'target',range:260,desc:l=>`Pin a monster in place: ${40+l*5}% chance to hold it for ${2+l*.2}s, slowed otherwise.`,
    run:(l,t)=>shoot(P,t,'arrow','#d8c080',()=>{dealPhys(t,1,{sure:true});if(Math.random()<.4+l*.05)ailMob(t,'stun',2+l*.2);else slowMob(t,3);})},
  swiftstep:{name:'Swift Step',max:10,col:'#9be38a',g:'S',sp:l=>20,cd:30,kind:'self',desc:l=>`For 90s: +${l*2} AGI and +${l*3} FLEE.`,
    run:l=>buff('swiftstep','Swift Step',90,{agi:l*2,flee:l*3})},
  // Templar
  crusade:{name:'Crusader Strike',max:10,col:'#fff0a0',g:'C',sp:l=>10+l*2,cd:.9,kind:'target',range:55,desc:l=>`A holy blow for ${200+l*35}% ATK (Holy) that never misses.`,
    run:(l,t)=>{fx.push({k:'slash',x:t.x,y:t.y,t0:now,dur:.25});fx.push({k:'pillar',x:t.x,y:t.y,t0:now,dur:.35});dealPhys(t,2+l*.35,{sure:true,el:'holy'});}},
  holyaegis:{name:'Holy Aegis',max:10,col:'#f0e0a0',g:'A',sp:l=>28,cd:30,kind:'self',desc:l=>`For 90s: +${l*6} DEF, +${l*2} VIT and +${l*3} HP regen per second.`,
    run:l=>buff('holyaegis','Holy Aegis',90,{def:l*6,vit:l*2,regen:l*3})},
  judgment:{name:'Judgment',max:10,col:'#ffe27a',g:'J',sp:l=>24+l*2,cd:3,kind:'self',desc:l=>`Holy light bursts around you: ${180+l*30}% MATK (Holy) to all within 115px.`,
    run:l=>{fx.push({k:'ring',x:P.x,y:P.y,r:115,col:'#fff0a0',t0:now,dur:.45});aoe(P.x,P.y,115,m=>{fx.push({k:'pillar',x:m.x,y:m.y,t0:now,dur:.35});dealMag(m,1.8+l*.3,'holy');});}},
  // Oracle
  sanctuary:{name:'Sanctuary',max:10,col:'#9fffc0',g:'+',sp:l=>30+l*3,cd:15,kind:'self',desc:l=>`Heal ${40*l} + ${150+l*50}% MATK, cure ailments and regenerate ${l*6} HP per second for 30s.`,
    run:l=>{healP(40*l+S.matk*(1.5+l*.5));cureAll();buff('sanctuary','Sanctuary',30,{regen:l*6});}},
  radiance:{name:'Radiance',max:10,col:'#fff6c0',g:'R',sp:l=>34+l*3,cd:5,kind:'area',range:250,radius:120,desc:l=>`Searing light on your target's area: ${260+l*45}% MATK (Holy) to all within 120px.`,
    run:(l,x,y)=>{fx.push({k:'ring',x,y,r:120,col:'#fff6c0',t0:now,dur:.5});for(let i=0;i<5;i++)fx.push({k:'pillar',x:x+rnd(-90,90),y:y+rnd(-60,60),t0:now+i*.06,dur:.4});aoe(x,y,120,m=>dealMag(m,2.6+l*.45,'holy'));}},
  divinegrace:{name:'Divine Grace',max:10,col:'#7fd3ff',g:'D',sp:l=>30,cd:30,kind:'self',desc:l=>`For 120s: +${l*2} INT, +${l*25} Max SP and +${l*5} MATK.`,
    run:l=>buff('divinegrace','Divine Grace',120,{int:l*2,maxsp:l*25,matk:l*5})},
};
Object.assign(SKILLS,JSK);
Object.assign(SKILL_REQ,{bastion:{shieldbash:3},warcry:{shieldbash:5},frenzy:{rendingblow:3},earthshatter:{rendingblow:5,frenzy:1},
  cinderfall:{glaciallance:5},manasurge:{glaciallance:3},hexofsloth:{shadowlance:3},soulsiphon:{shadowlance:5,hexofsloth:1},
  trueaim:{piercingshot:3},volley:{piercingshot:5},snareshot:{venomarrow:3},swiftstep:{venomarrow:1},
  holyaegis:{crusade:3},judgment:{crusade:5},radiance:{sanctuary:3},divinegrace:{sanctuary:1}});
Object.assign(CAST,{glaciallance:.9,cinderfall:2,shadowlance:.6,hexofsloth:.4,piercingshot:.7,volley:.6,sanctuary:1,radiance:1.4,judgment:.5});
Object.assign(SKILL_ELEM,{glaciallance:'water',cinderfall:'fire',shadowlance:'shadow',soulsiphon:'shadow',earthshatter:'earth',venomarrow:'earth',crusade:'holy',judgment:'holy',radiance:'holy'});

/* ---- the trial: Corvin sends a Job Lv 40 first job out to prove itself ---- */
const TRIALS={
  warden:{mob:'bonearcher',need:25,item:'bone',items:10,gold:5000,say:'A shield is nothing without the nerve behind it. The Cinder Crypt is full of archers. Walk through their arrows.'},
  arcanist:{mob:'wraith',need:25,item:'dust',items:10,gold:5000,say:'Magic answers those who understand the dead. Unmake the Dust Wraiths of the dunes and bring me what remains.'},
  ranger:{mob:'cactoid',need:25,item:'needle',items:10,gold:5000,say:'A hunter reads the land. The Cactoids hide in plain sight in the dunes. Find them, and bring back their needles.'},
  cleric:{mob:'emberimp',need:25,item:'core',items:8,gold:5000,say:'The light must burn hotter than the fire. Cleanse the Ember Imps of the crypt and bring me their cores.'},
};
function trialDone(){const t=P.trial;if(!t)return false;const T=TRIALS[baseOf(P.cls)];
  return t.have>=T.need&&(invFind(T.item)?invFind(T.item).n:0)>=T.items&&P.gold>=T.gold;}
const _questKill=questKill;
questKill=function(id){_questKill(id);const t=P&&P.trial;if(!t)return;const T=TRIALS[baseOf(P.cls)];if(!T||T.mob!==id||t.have>=T.need)return;
  t.have++;if(t.have===T.need){addLog(`Trial: all ${T.need} ${MOBS[id].name} defeated. Bring ${T.items} ${ITEMS[T.item].name} back to Guildmaster Corvin.`,'l-rare');sfx('fanfare');}
  else if(t.have%5===0)addLog(`Trial: ${t.have}/${T.need} ${MOBS[id].name}.`,'l-good');refreshPanel();};

function jobHallHtml(c){let h='';const T=TRIALS[P.cls];
  if(c.tier===2)return `<div class="say">“${c.name}. I remember when you couldn't hold a club straight. The guild is proud of you.” — Corvin</div>`;
  if(!T)return '';
  if(P.jl<JOB2_LV)return `<div class="say">“A ${c.name}, and a fine one. At Job Level ${JOB2_LV} I can test you for an advanced calling. You're at ${P.jl} now.” — Corvin</div>`+jobPreview();
  if(!P.trial)return `<div class="say">“You're ready for the next step. ${T.say}” — Corvin</div>`+
    `<div class="row"><div class="grow"><div class="nm">Trial of the ${c.name}</div><div class="ds">Defeat ${T.need} ${MOBS[T.mob].name}, bring ${T.items} ${ITEMS[T.item].name} and a ${fmt(T.gold)} gold guild fee.</div></div><button class="btn small" data-act="trial">Accept trial</button></div>`+jobPreview();
  const it=invFind(T.item),have=it?it.n:0;
  h+=`<div class="say">“${trialDone()?'You did it. Now choose. Like the first time, this is for life.':'Not finished yet. Keep at it.'}” — Corvin</div>`;
  h+=`<div class="row"><div class="grow"><div class="nm">Trial of the ${c.name}</div><div class="ds">`+
    `${Math.min(P.trial.have,T.need)>=T.need?'✓':'·'} ${MOBS[T.mob].name} ${Math.min(P.trial.have,T.need)}/${T.need} &nbsp; `+
    `${have>=T.items?'✓':'·'} ${ITEMS[T.item].name} ${have}/${T.items} &nbsp; ${P.gold>=T.gold?'✓':'·'} ${fmt(T.gold)} gold</div></div></div>`;
  if(trialDone()){h+=`<div class="choice">`;for(const id of jobsFrom(P.cls)){const k=CLASSES[id];
    h+=`<button data-act="promote" data-arg="${id}"><b style="color:${k.acc}">${k.name}</b><small>${k.desc}</small><small>New skills: ${k.own.map(s=>SKILLS[s].name).join(', ')}</small></button>`;}h+=`</div>`;}
  return h;}
function jobPreview(){return `<div class="ds" style="margin:6px 0 2px">Advanced callings: `+jobsFrom(P.cls).map(id=>`<b style="color:${CLASSES[id].acc}">${CLASSES[id].name}</b> (${CLASSES[id].own.map(s=>SKILLS[s].name).join(', ')})`).join(' or ')+`</div>`;}
PANEL_ACTS.trial=()=>{if(P.trial||!TRIALS[P.cls]||P.jl<JOB2_LV)return;P.trial={have:0};const T=TRIALS[P.cls];
  addLog(`Trial accepted: defeat ${T.need} ${MOBS[T.mob].name} and bring ${T.items} ${ITEMS[T.item].name}.`,'l-good');sfx('click');refreshPanel();save();};
PANEL_ACTS.promote=arg=>{if(!trialDone()||!JOB2[arg]||JOB2[arg].base!==P.cls)return;const T=TRIALS[P.cls],k=CLASSES[arg];
  takeItem(T.item,T.items);P.gold-=T.gold;P.trial=null;P.cls=arg;P.jl=1;P.jexp=0;
  fx.push({k:'lvl',x:P.x,y:P.y,t0:now,dur:2.2,txt:k.name.toUpperCase(),col:k.acc});fx.push({k:'beam',x:P.x,y:P.y,t0:now,dur:1.6});sfx('fanfare');announce('job',arg);
  addLog(`You are now a ${k.name}! You keep all your skills. New ones are waiting in the skill tree (K): ${k.own.map(s=>SKILLS[s].name).join(', ')}.`,'l-rare');
  S=computeStats();rebuildHotbar();refreshPanel();save(true);};

/* ---- hotbar: choose which four skills sit on keys 1–4 ---- */
function hotSkills(){const c=CLASSES[P.cls],all=c.skills;let h=Array.isArray(P.hot)?P.hot.slice(0,4):null;
  if(h)h=h.map(s=>s&&all.includes(s)?s:null);
  if(!h||!h.some(Boolean)){h=all.slice(0,4);}
  while(h.length<4)h.push(null);return h;}
PANEL_ACTS.hot=arg=>{const[id,i]=arg.split(':');if(!SKILLS[id]||!P.skills[id]||!(+i>=0&&+i<4))return;const h=hotSkills();
  const was=h.indexOf(id);if(was>=0)h[was]=h[+i];h[+i]=id;P.hot=h;rebuildHotbar();refreshPanel();save();};
function hotPicker(id){if(!P.skills[id])return '';const h=hotSkills();
  return `<div class="hotpick" aria-label="Put on hotbar key">${[0,1,2,3].map(i=>`<button class="hk${h[i]===id?' on':''}" data-act="hot" data-arg="${id}:${i}" title="Put on key ${i+1}">${i+1}</button>`).join('')}</div>`;}

/* ---- drawing: a second job wears its first job's outfit plus a mantle in its own colour ---- */
function drawJobMantle(c,x,y,face,back){if(!c||c.tier!==2)return;const f=face<0?-1:1,by=y-7;
  ctx.lineWidth=1.5;ctx.strokeStyle='#2a1c14';ctx.fillStyle=c.acc;
  for(const k of [-1,1]){ctx.beginPath();ctx.ellipse(x+k*10,by-8,4.2,3,k*.4,0,7);ctx.fill();ctx.stroke();}
  if(!back){ctx.fillStyle=c.col;ctx.beginPath();ctx.moveTo(x-3.5,by-5.5);ctx.lineTo(x,by-1);ctx.lineTo(x+3.5,by-5.5);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.fillStyle=c.acc;ctx.beginPath();ctx.arc(x+f*.5,by-4,1.6,0,7);ctx.fill();}}
