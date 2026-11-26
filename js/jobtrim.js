"use strict";
/* ================= two second jobs and two masters per family (v1.68.0) =================
   Three advanced jobs (each with its own master) per family made 42 jobs in all: too many choices for a new player,
   and some were hard to tell apart. Each first job now leads to two, as in the classic games:
     Warden      Bulwark, Ravager            (Runeguard retired, its heroes become Bulwarks)
     Arcanist    Stormcaller, Hexweaver      (Chronomancer -> Stormcaller)
     Ranger      Sharpshooter, Falconer      (Wildstalker -> Falconer)
     Cleric      Templar, Oracle             (Ascetic -> Templar)
     Shade       Nightblade, Venomancer      (Phantom -> Nightblade)
     Gunslinger  Sniper, Pyro Gunner         (Trickshot -> Sniper)
   The retired jobs' masters go the same way (to the master of the job they move to). They stay defined, so old saves
   and other players on an older version still draw, but they are no longer offered anywhere. A hero on a retired job
   moves on loading: skills the new job does not have are taken back and their points returned, and the hotbar loses
   them; other players still on one are shown as the job they move to. Loaded late (after jobs3, gunslinger4, buildguide). */
const JOB_RETIRE2={runeguard:'bulwark',chronomancer:'stormcaller',wildstalker:'falconer',ascetic:'templar',phantom:'nightblade'}; // (v1.71.0) the Trickshot left with the Gunslinger (js/forgemig.js)
const JOB_RETIRE={...JOB_RETIRE2};
for(const [old,to] of Object.entries(JOB_RETIRE2)){const om=Object.keys(JOB3).find(k=>JOB3[k].from===old),nm=Object.keys(JOB3).find(k=>JOB3[k].from===to);if(om&&nm)JOB_RETIRE[om]=nm;}
// gone from every choice: the advanced-job trial, the master's ascension, the build guide
for(const id in JOB_RETIRE){delete JOB2[id];delete JOB3[id];}
if(typeof BUILDS!=='undefined')for(let i=BUILDS.length-1;i>=0;i--)if((BUILDS[i].route||[]).some(c=>JOB_RETIRE[c]))BUILDS.splice(i,1);
// a hero on a retired job moves to the job it maps to
function jobTrimHero(){if(!P||!JOB_RETIRE[P.cls])return false;const from=P.cls,to=JOB_RETIRE[from],ok=new Set(CLASSES[to].skills||[]);let back=0;
  for(const k of Object.keys(P.skills||{}))if(!ok.has(k)){back+=P.skills[k]||0;delete P.skills[k];}
  P.cls=to;P.skillPts=(P.skillPts||0)+back;
  const keep=e=>e&&e.s&&!ok.has(e.s)?null:e;if(Array.isArray(P.bar))P.bar=P.bar.map(keep);if(Array.isArray(P.bars))P.bars=P.bars.map(r=>Array.isArray(r)?r.map(keep):r);
  if(P.build&&typeof buildById==='function'&&!buildById(P.build))P.build=null;
  if(typeof rebuildHotbar==='function')rebuildHotbar();S=computeStats();P.hp=Math.min(P.hp,S.maxhp);P.sp=Math.min(P.sp,S.maxsp);
  const th=typeof LANG!=='undefined'&&LANG==='th';
  addLog(th?`งาน ${CLASSES[from].name} ถูกรวมเข้ากับ ${CLASSES[to].name} แล้ว ตอนนี้คุณเป็น ${CLASSES[to].name} ได้แต้มสกิลคืน ${back} แต้ม`:
    `The ${CLASSES[from].name} path has joined the ${CLASSES[to].name}: you are a ${CLASSES[to].name} now, with ${back} skill point${back===1?'':'s'} back to spend.`,'l-rare');
  if(typeof save==='function')save(true);return true;}
{const _swT=startWith;startWith=function(){const r=_swT.apply(this,arguments);try{jobTrimHero();}catch(e){}return r;};}
// other players still on a retired job show as the one it maps to
{const _inT=ingest;ingest=function(p){const r=_inT.apply(this,arguments);try{const o=NET.others.get(p&&p.peer);if(o&&JOB_RETIRE[o.cls])o.cls=JOB_RETIRE[o.cls];}catch(e){}return r;};}
