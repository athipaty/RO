"use strict";
/* ================= #58 achievements and titles =================
   Goals that track themselves as you play. Each one finished pays a little gold and unlocks a title; wear one
   and everyone online sees it under your name (presence field ti). Open with /ach or from the Stats window.
   Progress lives in P.ach: c = counters, kk = kills by monster, got = finished (id -> time), title = worn. */
const ACH=[
  // [id, name, how, title, goal, progress(), gold]
  ['kill1','First Steps','Defeat your first monster','Fledgling',1,a=>a.c.kills,50],
  ['kill100','Seasoned Hunter','Defeat 100 monsters','Hunter',100,a=>a.c.kills,500],
  ['kill1000','Legend of the Wilds','Defeat 1,000 monsters','Monster Slayer',1000,a=>a.c.kills,5000],
  ['sprout','Sprout Squasher','Defeat 50 Sproutlings','Sprout Squasher',50,a=>a.kk.sproutling||0,300],
  ['lupe','Pack Breaker','Defeat 50 Grey Lupes','Wolfsbane',50,a=>a.kk.greylupe||0,1500],
  ['lv10','On Your Way','Reach base level 10','Adventurer',10,()=>P.lv,200],
  ['lv25','Battle-Tested','Reach base level 25','Veteran',25,()=>P.lv,1500],
  ['lv50','Hero of Embervale','Reach base level 50','Hero of Embervale',50,()=>P.lv,10000],
  ['job','A Calling','Choose a job at the Guild Hall','Apprentice',1,()=>P.cls!=='novice'?1:0,300],
  ['job2','Mastery','Earn an advanced calling','Master',1,()=>typeof baseOf==='function'&&baseOf(P.cls)!==P.cls?1:0,5000],
  ['boss1','Giant Killer','Help defeat a boss','Boss Hunter',1,a=>a.c.boss,1000],
  ['boss10','Bane of Bosses','Help defeat 10 bosses','Giant Slayer',10,a=>a.c.boss,8000],
  ['sig','Lucky Find','Find a monster sigil','Lucky Star',1,a=>a.c.sig,800],
  ['refine','Smith\'s Pride','Refine a piece of gear to +7','Forgemaster',1,a=>a.c.refine,3000],
  ['explore','Wanderer','Visit every region, down to Mossdeep B3','Explorer',1,()=>[...ZONE_ORDER,'deep3'].every(z=>P.visited.includes(z))?1:0,2000],
  ['rich','Deep Pockets','Hold 100,000 gold at once','Moneybags',100000,()=>P.gold,0],
  ['tame','Animal Friend','Tame a companion','Beast Friend',1,a=>a.c.tame,500],
  ['duel','First Blood','Win a duel','Duelist',1,a=>a.c.duel,500],
  ['arena1','Into the Pit','Win a ranked arena match','Gladiator',1,a=>a.c.arena,1000],
  ['arena10','Crowd Favourite','Win 10 ranked arena matches','Arena Champion',10,a=>a.c.arena,6000],
  ['guild','Sworn Together','Join a guild','Guildmate',1,()=>typeof GD!=='undefined'&&GD.g?1:0,300],
  ['keep','Crystal Keeper','Be in the guild that holds Emberkeep','Keeper of the Crystal',1,()=>typeof gwMine==='function'&&gwMine()?1:0,5000],
  ['friends','Good Company','Have 5 friends on your list','Good Company',5,()=>(P.friends||[]).length,300],
];
const ACH_BY=Object.fromEntries(ACH.map(a=>[a[0],a]));
const achData=()=>{if(!P.ach||typeof P.ach!=='object')P.ach={};const a=P.ach;
  a.c=a.c&&typeof a.c==='object'?a.c:{};for(const k of ['kills','boss','sig','refine','tame','duel','arena'])a.c[k]=Math.max(0,Math.floor(fin(a.c[k])));
  a.kk=a.kk&&typeof a.kk==='object'?a.kk:{};a.got=a.got&&typeof a.got==='object'?a.got:{};if(a.title&&!a.got[a.title])a.title=null;return a;};
const achTitle=id=>ACH_BY[id]?ACH_BY[id][3]:null;

/* ---- counting ---- */
const _questKillAch=questKill;
questKill=function(id){const a=achData();a.c.kills++;a.kk[id]=(a.kk[id]||0)+1;achCheck();return _questKillAch(id);};
const _announceAch=announce;
announce=function(k,v){const a=achData(),map={boss:'boss',sig:'sig',refine:'refine',duel:'duel',arena:'arena'};if(map[k]){a.c[map[k]]++;achCheck();}return _announceAch(k,v);};
let achPetSeen=null;

/* ---- awarding ---- */
function achCheck(){if(!P)return;const a=achData();
  const has=!!(P.pet&&P.pet.k);if(has&&achPetSeen===false)a.c.tame++;achPetSeen=has;
  for(const [id,name,,title,goal,prog,gold] of ACH){if(a.got[id])continue;let v=0;try{v=prog(a);}catch(e){}
    if(v>=goal){a.got[id]=Date.now();if(gold)P.gold+=gold;achToast(name,title,gold);addLog(`★ Achievement: ${name}! New title: “${title}”${gold?` · +${fmt(gold)} gold`:''}. Wear it from /ach.`,'l-rare');}}
  if(panelKind==='ach')refreshPanel();}
setInterval(()=>{if(running&&P)achCheck();},2000);
function achToast(name,title,gold){let el=document.getElementById('achToast');
  if(!el){el=document.createElement('div');el.id='achToast';el.setAttribute('role','status');el.addEventListener('click',()=>openPanel('ach'));document.body.appendChild(el);}
  el.innerHTML=`<i aria-hidden="true">★</i><div><b>${esc(name)}</b><span>Title unlocked: ${esc(title)}${gold?` · +${fmt(gold)} gold`:''}</span></div>`;
  el.classList.remove('show');void el.offsetWidth;el.classList.add('show');sfx('jobup');clearTimeout(el._t);el._t=setTimeout(()=>el.classList.remove('show'),4500);}

/* ---- the window ---- */
PANELS.ach=()=>{const a=achData(),done=ACH.filter(x=>a.got[x[0]]).length;
  let h=`<h2>Achievements</h2><div class="sub">${done} of ${ACH.length} done. Each one unlocks a title to wear under your name.</div>`;
  h+=`<div class="tbtns" style="justify-content:flex-start;margin:4px 0 10px"><span class="muted" style="font-size:12.5px">Wearing: <b class="gold">${a.title?esc(achTitle(a.title)):'no title'}</b></span>${a.title?`<button class="btn small" data-act="achwear" data-arg="">Take it off</button>`:''}</div>`;
  h+=`<div class="achlist">`+ACH.map(([id,name,how,title,goal,prog])=>{let v=0;try{v=prog(a);}catch(e){}const got=!!a.got[id],p=clamp(v/goal,0,1);
    return `<div class="ach${got?' got':''}"><div class="ai" aria-hidden="true">${got?'★':'☆'}</div><div class="grow"><div class="nm">${esc(name)} <span class="muted">· ${esc(how)}</span></div>`+
      (got?`<div class="ds">Title: <b>${esc(title)}</b></div>`:`<div class="abar" role="progressbar" aria-valuemin="0" aria-valuemax="${goal}" aria-valuenow="${Math.min(v,goal)}" aria-label="${esc(name)}"><i style="width:${p*100}%"></i></div><div class="ds">${fmt(Math.min(v,goal))} / ${fmt(goal)}</div>`)+`</div>`+
      (got?(a.title===id?`<span class="pill">wearing</span>`:`<button class="btn small" data-act="achwear" data-arg="${id}">Wear</button>`):'')+`</div>`;}).join('')+`</div>`;
  return h;};
PANEL_ACTS.achwear=id=>{const a=achData();if(id&&!a.got[id])return;a.title=id||null;NET.lastSent='';NET.sendT=0;save();refreshPanel();addLog(a.title?`You now go by “${achTitle(a.title)}”.`:'You took off your title.');};
const _chatCommandAch=chatCommand;
chatCommand=function(k,arg){if(k==='ach'||k==='achievements'||k==='titles'||k==='title'){openPanel('ach');return true;}return _chatCommandAch(k,arg);};
CMD_HELP.push(['/ach','achievements and titles']);

/* ---- titles under names ---- */
function myTitle(){return P&&P.ach&&P.ach.title&&P.ach.got&&P.ach.got[P.ach.title]?P.ach.title:null;}
function titleRead(v){return typeof v==='string'&&ACH_BY[v]?v:null;}
function titleLabel(id,x,y){const t=achTitle(id);if(t)label('★ '+t,x,y,'#ffcf5a',10);}
