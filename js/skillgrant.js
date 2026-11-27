"use strict";
/* ================= skills for the 24 jobs, party support and Revive (v1.72.0) =================
   With two advanced callings and two masters per family (js/jobtrim.js) about 60 finished skills of the retired jobs
   were left unused, and party support was almost all Cleric. Each job now takes the retired skills that fit it:
     Warden      Bulwark: Iron Body (party) · Ravager: Flurry, Still Mind · Aegis Lord: Lotus Bloom (party) ·
                 Warbringer: Heaven Fist
     Arcanist    Stormcaller: Haste (party), Time Bolt · Hexweaver: Stasis, Echo Bolt · Tempest Sage: Time Stop,
                 Temporal Flow · Voidcaller: Paradox, Eternity
     Ranger      Sharpshooter: Rapid Fire, Predator · Falconer: Swift Step (party), Snare Shot · Deadeye: Alpha Instinct ·
                 Skywarden: Pack Howl (party), Stampede
     Cleric      Templar: Palm Strike, Chi Burst · Oracle: Inner Calm · Dawnknight: Hundred Palms ·
                 Starseer: Thousand Moments, Revive (new, the Starseer's alone)
     Shade       Shade: Phantom Edge, Umbral Grace · Nightblade: Shadow Waltz, Shadow Double · Venomancer: Mirage (party),
                 Venom Arrow · Soulreaper: Thousand Cuts, Eclipse Veil · Plaguelord: Shadow Tempest
     Forgehand   Forgehand: Rune Mastery · Runesmith: Rune Strike, Frost Rune, Elemental Avatar (party) · Coinbreaker:
                 Big Deal now reaches the party · Forgemaster: Rune Burst, World Rune · Goldlord: Royal Haul now reaches
                 the party
   Every family has at least one skill that helps the party. A skill a job inherits shows in every job after it.
   Their old requirements (skills of the retired jobs) are dropped, so each is learnable in its new job.
   Revive (the Starseer only, a master's gift): brings fallen party members nearby back with part of their HP, instead of a walk from town. */
const SKILL_GRANT={
  shade:['phantomedge','umbralgrace'],forgehand:['runemastery'],
  bulwark:['ironbody'],ravager:['flurry','stillmind'],
  stormcaller:['haste','timebolt'],hexweaver:['stasis','echobolt'],
  sharpshooter:['rapidfire','predator'],falconer:['swiftstep','snareshot'],
  templar:['palmstrike','chiburst'],oracle:['innercalm'],
  nightblade:['shadowwaltz','shadowdouble'],venomancer:['mirage','venomarrow'],
  runesmith:['runestrike','frostrune','elementalavatar'],
  aegislord:['lotusbloom'],warbringer:['heavenfist'],
  tempestsage:['timestop','temporalflow'],voidcaller:['paradox','eternity'],
  deadeye:['alphainstinct'],skywarden:['packhowl','stampede'],
  dawnknight:['hundredpalms'],starseer:['moments','revive'],
  soulreaper:['thousandcuts','eclipseveil'],plaguelord:['shadowtempest'],
  forgemaster:['runeburst','worldrune']};
// self buffs and heals that now reach party members too (the receiver runs the same effect on its own hero)
const SKILL_PARTY=['ironbody','haste','mirage','elementalavatar','bigdeal','royalhaul','lotusbloom'];

/* ---- Revive ---- */
const REVIVE_R=260,revivePct=l=>10+l*8;
SKILLS.revive={name:'Revive',max:5,col:'#fff0b0',g:'✚',sp:l=>40+l*6,cd:20,kind:'self',
  desc:l=>`Bring fallen party members within ${REVIVE_R}px back to life with ${revivePct(l)}% of their Max HP and half their SP.`,
  run:l=>{const down=[];if(typeof NET!=='undefined'&&NET.others&&typeof inParty==='function')
      for(const [peer,o] of NET.others)if(inParty(peer)&&o.z===zoneId&&o.dead&&o.id&&Math.hypot(o.rx-P.x,o.ry-P.y)<=REVIVE_R)down.push(o);
    if(!down.length){P.sp=Math.min(S.maxsp,P.sp+SKILLS.revive.sp(l));floatT(P.x,P.y-50,'No fallen party member nearby','#cfd8e0',12);return;}
    NET.sp=[...NET.sp,...down.map(o=>({i:++NET.spId,to:o.id,k:'revive',l,v:0}))].slice(-12);NET.lastSent='';NET.sendT=0;
    for(const o of down){fx.push({k:'pillar',x:o.rx,y:o.ry,t0:now,dur:.8});fx.push({k:'heal',x:o.rx,y:o.ry,r:40,col:'#fff0b0',t0:now,dur:.8});}
    addLog(`Revive: ${down.map(o=>o.n).join(', ')} ${down.length>1?'rise':'rises'} again.`,'l-good');}};
// its own effect when cast (js/fxskills.js): golden motes rising round the caster and a soft ring
if(typeof SKILL_FX!=='undefined'&&typeof fxF==='function'){SKILL_FX.revive=l=>{fxF({k:'motes',x:P.x,y:P.y,o:P,col:'#fff0b0',col2:'#ffd76a',n:16,r:30,dur:1});fxF({k:'ring',x:P.x,y:P.y,r:REVIVE_R*.3,col:'#fff0b0',dur:.6});};
  const run=SKILLS.revive.run,fxf=SKILL_FX.revive;SKILLS.revive.run=function(){try{fxf.apply(this,arguments);}catch(e){}return run.apply(this,arguments);};}
if(typeof SKILL_TH!=='undefined')SKILL_TH.revive=['ชุบชีวิต','ชุบชีวิตสมาชิกปาร์ตี้ที่ล้มในระยะ {0}px ให้ฟื้นพร้อม HP {1}% และ SP ครึ่งหนึ่ง'];
if(typeof CAST!=='undefined')CAST.revive=1.5;
// the fallen hero gets up where it fell
{const _srRV=supportRecv;supportRecv=function(o,arr,fresh){
  try{if(Array.isArray(arr)&&o)for(const e of arr.slice(-12)){if(!e||e.k!=='revive')continue;const i=fin(e.i);if(i<=(o.rvSeen||0))continue;o.rvSeen=i;
      if(fresh||e.to!==NET.myId||!P||!P.dead||typeof inParty!=='function'||!inParty(o.peer)||o.z!==zoneId)continue;
      const l=clamp(fin(e.l)|0,1,5);P.dead=false;P.deadT=0;S=computeStats();P.hp=Math.max(1,Math.round(S.maxhp*revivePct(l)/100));P.sp=Math.max(P.sp,Math.round(S.maxsp*.5));
      const d=document.getElementById('death');if(d)d.hidden=true;fx.push({k:'pillar',x:P.x,y:P.y,t0:now,dur:.8});fx.push({k:'heal',x:P.x,y:P.y,r:40,col:'#fff0b0',t0:now,dur:.8});
      if(typeof sfx==='function')sfx('heal');floatT(P.x,P.y-62,'Revived!','#fff0b0',15);addLog(`${o.n} revived you.`,'l-good');if(typeof save==='function')save();}}catch(err){}
  return _srRV.apply(this,arguments);};}
// auto-skill never casts Revive on its own (it would fire whenever nobody is down)
if(typeof autoSkillList==='function'){const _aslRV=autoSkillList;autoSkillList=function(){return _aslRV.apply(this,arguments).filter(id=>id!=='revive');};}

/* ---- give the skills to the jobs (and every job after them) ---- */
{const kids=id=>Object.keys(CLASSES).filter(c=>c!==id&&(CLASSES[c].base===id||CLASSES[c].parent===id||(typeof JOB3!=='undefined'&&JOB3[c]&&JOB3[c].from===id)));
  const addTo=(c,sk)=>{const C=CLASSES[c];if(!C||!C.skills||C.skills.includes(sk))return;const i=C.skills.indexOf('firstaid');if(i<0)C.skills.push(sk);else C.skills.splice(i,0,sk);};
  for(const [job,list] of Object.entries(SKILL_GRANT)){const C=CLASSES[job];if(!C)continue;
    for(const sk of list){if(!SKILLS[sk])continue;
      if(C.tier>=2){if(Array.isArray(C.own)&&!C.own.includes(sk))C.own.push(sk);}
      addTo(job,sk);for(const k of kids(job)){addTo(k,sk);for(const k2 of kids(k))addTo(k2,sk);}
      if(typeof SKILL_REQ!=='undefined')delete SKILL_REQ[sk];
      if(typeof CROSS_REQ!=='undefined')delete CROSS_REQ[sk];}} // their old first-job needs (another family's paths) go too
  // the first jobs' new skills sit on a path (js/jobpaths.js): Phantom Edge on Edge, Umbral Grace on Venom (smoke and
  // dodging), Rune Mastery on Forge
  if(typeof JOB_PATHS!=='undefined'){const put=(job,path,sk)=>{const p=JOB_PATHS[job]&&JOB_PATHS[job].paths.find(x=>x.id===path);if(p&&!p.skills.includes(sk))p.skills.push(sk);};
    put('shade','edge','phantomedge');put('shade','venom','umbralgrace');put('forgehand','forge','runemastery');}
  if(typeof SKILL_REQ!=='undefined'){SKILL_REQ.revive={resurgence:3};SKILL_REQ.phantomedge={backstab:3};SKILL_REQ.lotusbloom={titanslam:1};}}

/* ---- party support ---- */
if(typeof SUP!=='undefined'&&typeof supportCast==='function')for(const id of SKILL_PARTY){const sk=SKILLS[id];if(!sk||sk.party||SUP[id])continue;
  const run=sk.run,desc=sk.desc,r=260;SUP[id]={r,apply:l=>{try{run(l);}catch(e){}}};
  sk.run=(l,...a)=>{run(l,...a);supportCast(id,l);};sk.desc=l=>desc(l)+` Party members within ${r}px get it too.`;sk.party=true;
  if(typeof SKILL_TH!=='undefined'&&SKILL_TH[id]&&!/ปาร์ตี้/.test(SKILL_TH[id][1])){const n=(desc(1).match(/\d+(\.\d+)?/g)||[]).length;SKILL_TH[id]=[SKILL_TH[id][0],SKILL_TH[id][1]+` สมาชิกปาร์ตี้ในระยะ {${n}}px ได้ด้วย`];}}
