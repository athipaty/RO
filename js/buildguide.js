"use strict";
/* ================= Build guide: three ways to play each job, from first job to master calling =================
   Each build lists its route (first job -> advanced -> master calling), how to spend stat points, the skills in order
   with target levels, and gear, sigils and awakened lines that suit it. "Follow this build" remembers it (P.build):
   the skill tree then marks the next skill to raise (requirements first) and the stat window suggests the next stat.
   Open from the Skills window (Build guide button) or /build. */
const BUILDS=[
  // ---- Warden
  {id:'axe',job:'warden',name:'Earthsplitter',th:'ผู้ผ่าแผ่นดิน',tag:'STR two-hander',route:['warden','ravager','warbringer'],stats:{str:5,dex:2,vit:2},
    desc:'Huge single blows with an axe. Sundering Blow and Execution grow with STR.',
    skills:[['cleave',5],['bladecraft',10],['sunder',10],['cleave',10],['whirl',5],['ironwill',3],['bloodlust',10],['rendingblow',10],['rampage',5],['frenzy',5],['earthshatter',5],['bloodthirst',10],['execution',10],['bloodrage',5],['cataclysm',5]],
    gear:['splitter','fangblade','quickgrip','carapacemail'],sigils:['cactoid','cavetroll','dunetyrant','thornling'],awaken:['atkpct','critdmg']},
  {id:'duel',job:'warden',name:'Duelist',th:'นักดวล',tag:'AGI crit',route:['warden','ravager','warbringer'],stats:{agi:5,luk:3,str:2},
    desc:'Fast sword cuts that crit often. Lethal Edge grows with AGI; attack speed and double attack stack up.',
    skills:[['cleave',3],['bladecraft',5],['duelist',10],['lethaledge',10],['bladecraft',10],['bloodlust',10],['frenzy',10],['rendingblow',5],['rampage',5],['bloodthirst',10],['bloodrage',10],['execution',5]],
    gear:['twinfang','fangblade','quickgrip','fourleaf','monocle','windscarf'],sigils:['rimestalker','gravehound','cavebat','greylupe','hopper'],awaken:['aspd','dbl','critdmg']},
  {id:'wall',job:'warden',name:'Iron Wall',th:'กำแพงเหล็ก',tag:'VIT tank',route:['warden','bulwark','aegislord'],stats:{vit:5,str:2,dex:1},
    desc:'Hardly ever falls. Holds bosses for the party; Second Wind, Shield Charge and Retribution grow with VIT.',
    skills:[['cleave',3],['ironwill',10],['stoneblood',10],['secondwind',10],['whirl',5],['unbreakable',10],['bastion',10],['warcry',5],['shieldcharge',10],['shieldbash',5],['livingfortress',10],['fortress',10],['retribution',10],['titanslam',5]],
    gear:['stonewall','carapacemail','quickgrip'],sigils:['snowhulk','glacierbeetle','scarab','stonecrab','rimeheart','warlord'],awaken:['dmgred','hppct']},
  // ---- Arcanist
  {id:'nuke',job:'arcanist',name:'Elementalist',th:'จอมธาตุ',tag:'INT nuker',route:['arcanist','stormcaller','tempestsage'],stats:{int:5,dex:3,vit:1},
    desc:'The biggest spells in the game: Arc Storm, Cinderfall, Meteor and Tempest wipe whole packs.',
    skills:[['emberbolt',10],['arcanefocus',10],['frostnova',5],['arcstorm',10],['manaflow',3],['elemmastery',10],['chainlightning',10],['cinderfall',10],['glaciallance',5],['manasurge',5],['stormmind',10],['meteor',10],['tempest',10],['thunderlance',5]],
    gear:['corerod','arcanecirclet','sageloop','manaheart'],sigils:['emberimp','frostwisp','miragewisp','deepshade','gloomking'],awaken:['matkpct','cast']},
  {id:'quick',job:'arcanist',name:'Quickcaster',th:'นักร่ายเร็ว',tag:'DEX caster',route:['arcanist','stormcaller','tempestsage'],stats:{dex:5,int:4},
    desc:'Spells with almost no cast time. Mind Spike is instant and grows with DEX.',
    skills:[['emberbolt',5],['manaflow',5],['swiftcast',10],['mindspike',10],['emberbolt',10],['arcanefocus',5],['elemmastery',10],['glaciallance',10],['chainlightning',10],['stormmind',10],['thunderlance',10],['tempest',5]],
    gear:['sageloop','arcanecirclet','corerod'],sigils:['dewdrop','glowworm','shriekcap','iceimp','gloomking'],awaken:['cast','matkpct']},
  {id:'battle',job:'arcanist',name:'Battle Mage',th:'จอมเวทนักรบ',tag:'INT/VIT, Mana Shield',route:['arcanist','hexweaver','voidcaller'],stats:{int:4,vit:4,dex:1},
    desc:'A tough caster: Mana Shield pays damage with SP, curses make every hit land harder, Life Drain keeps you up.',
    skills:[['emberbolt',5],['manaflow',10],['manashield',10],['frostnova',5],['arcanefocus',5],['darkpact',10],['frailty',10],['shadowlance',10],['soulsiphon',5],['hexofsloth',3],['voidpact',10],['lifedrain',10],['unmaking',10],['voidrift',5]],
    gear:['manaheart','corerod','silkhood'],sigils:['crystalmite','puffcap','mushcap','snowhulk'],awaken:['sppct','dmgred']},
  // ---- Ranger
  {id:'archer',job:'ranger',name:'Marksman',th:'นักแม่นธนู',tag:'DEX archer',route:['ranger','sharpshooter','deadeye'],stats:{dex:5,agi:2,luk:1},
    desc:'Steady damage from far away; Double Nock fires second arrows, Deadly Arrow grows with DEX.',
    skills:[['twinshot',10],['owleye',10],['doublenock',10],['arrowrain',5],['hawkeye',5],['steadyhands',10],['deadlyarrow',10],['piercingshot',10],['trueaim',5],['volley',5],['perfectaim',10],['killingshot',10],['headshot',5],['arrowstorm',5]],
    gear:['needlebow','galebow','quickgrip'],sigils:['bonearcher','webspinner','cavebat','hopperchief'],awaken:['atkpct','dbl']},
  {id:'sniper',job:'ranger',name:'Lucky Sniper',th:'มือปืนนำโชค',tag:'LUK crit',route:['ranger','sharpshooter','deadeye'],stats:{luk:5,dex:4},
    desc:'Few shots, huge crits. Aimed Shot grows with LUK; Killing Shot ends fights.',
    skills:[['twinshot',5],['owleye',3],['huntersluck',10],['aimedshot',10],['hawkeye',10],['steadyhands',5],['trueaim',10],['deadlyarrow',10],['perfectaim',10],['killingshot',10],['headshot',10]],
    gear:['galebow','fourleaf','monocle'],sigils:['rimestalker','gravehound','frostmatron','thornling'],awaken:['critdmg','crit']},
  {id:'skirmish',job:'ranger',name:'Skirmisher',th:'นักซุ่มโจมตี',tag:'AGI fast',route:['ranger','wildstalker','beastlord'],stats:{agi:5,dex:3,luk:1},
    desc:'Shoots fast and never stands still; Rapid Fire grows with AGI, Stampede tramples packs.',
    skills:[['twinshot',10],['fleetstep',10],['owleye',5],['doublenock',5],['thornsnare',3],['predator',10],['rapidfire',10],['swiftstep',10],['venomarrow',5],['snareshot',3],['alphainstinct',10],['stampede',10],['packhowl',5],['savagevolley',5]],
    gear:['windscarf','quickgrip','needlebow'],sigils:['hopper','greylupe','dunejackal','lupealpha','hopperchief'],awaken:['aspd','dbl']},
  // ---- Cleric
  {id:'priest',job:'cleric',name:'Battle Priest',th:'นักบวชนักรบ',tag:'STR/INT mace',route:['cleric','templar','dawnknight'],stats:{str:4,int:3,vit:2},
    desc:'Fights up front with a mace; Holy Strike and Solar Judgment grow with INT and burn Shadow monsters.',
    skills:[['smite',3],['macemastery',10],['holystrike',10],['mend',5],['blessing',5],['zeal',10],['crusade',10],['judgment',5],['holyaegis',5],['radiantsoul',10],['solarjudgment',10],['dawnbreaker',5]],
    gear:['dawnmace','trollmaul','quickgrip'],sigils:['cactoid','cavetroll','dunetyrant'],awaken:['atkpct','aspd']},
  {id:'guard',job:'cleric',name:'Guardian',th:'ผู้พิทักษ์',tag:'VIT holy tank',route:['cleric','templar','dawnknight'],stats:{vit:5,int:2,str:2},
    desc:'A wall that heals itself: Divine Guard and Sacred Bulwark cut damage, Faith makes every heal bigger.',
    skills:[['mend',5],['faith',10],['divineguard',10],['blessing',5],['macemastery',5],['sacredbulwark',10],['holyaegis',10],['zeal',5],['crusade',5],['radiantsoul',10],['sacredward',10],['solarjudgment',5]],
    gear:['stonewall','mendstole','dawnmace'],sigils:['snowhulk','glacierbeetle','scarabqueen','rimeheart'],awaken:['dmgred','healpct']},
  {id:'healer',job:'cleric',name:'Lightbringer',th:'ผู้นำแสง',tag:'INT healer',route:['cleric','oracle','starseer'],stats:{int:5,dex:2,vit:2},
    desc:'Keeps the whole party alive; Exorcism and Starfall for enemies, Resurgence and Constellation for friends.',
    skills:[['mend',10],['faith',10],['renew',10],['blessing',10],['smite',5],['haven',5],['insight',10],['sanctuary',10],['exorcism',10],['divinegrace',5],['radiance',5],['astralgrace',10],['resurgence',10],['constellation',10],['starfall',5]],
    gear:['mendstole','dawnmace','manaheart','sageloop'],sigils:['sproutling','mushcap','thornmother','glowworm'],awaken:['healpct','cast']},
];
const buildById=id=>BUILDS.find(b=>b.id===id);
const GUIDE={job:null};
// the next skill level to take for a build (requirements first); null when everything you can learn is done
function buildNextSkill(b){if(!P||!b)return null;const can=new Set(CLASSES[P.cls]?CLASSES[P.cls].skills:[]),seen=new Set();
  const need=(id,lv)=>{if(seen.has(id))return null;seen.add(id);const r=SKILL_REQ[id]||{};
    for(const k in r)if((P.skills[k]||0)<r[k]){const x=need(k,r[k]);if(x)return x;}return {id,lv:(P.skills[id]||0)+1,goal:lv};};
  for(const [id,lv] of b.skills){if(!SKILLS[id]||!can.has(id)||(P.skills[id]||0)>=lv)continue;seen.clear();const x=need(id,lv);if(x&&can.has(x.id))return x;}return null;}
// the stat that is furthest behind the build's ratio
function buildNextStat(b){if(!P||!b)return null;let best=null,bv=1e9;for(const k in b.stats){const v=P.st[k];if(v>=99)continue;const r=v/b.stats[k];if(r<bv){bv=r;best=k;}}return best;}
const baseJob=c=>(CLASSES[c]&&CLASSES[c].base)||c;
const AW_NAME={atkpct:'ATK %',matkpct:'MATK %',aspd:'Attack speed',dbl:'Double attack',critdmg:'Crit damage',crit:'CRIT',cast:'Cast time',dmgred:'Damage taken',hppct:'Max HP %',sppct:'Max SP %',healpct:'Healing'};
const bName=b=>LANG==='th'&&b.th?b.th:b.name;

PANELS.buildguide=()=>{const mine=P&&P.cls!=='novice'?baseJob(P.cls):null;if(!GUIDE.job)GUIDE.job=mine||'warden';
  let h=`<h2>Build guide</h2><div class="sub">Three ways to play each job, from first job to master calling. Follow one and the Skills and Stats windows show your next step.</div>`;
  h+=`<div class="tabs itabs" role="tablist">`+['warden','arcanist','ranger','cleric'].map(j=>`<button class="btn small ${GUIDE.job===j?'on':''}" role="tab" aria-selected="${GUIDE.job===j}" data-act="guidejob" data-arg="${j}">${CLASSES[j].name}${mine===j?' ★':''}</button>`).join('')+`</div>`;
  for(const b of BUILDS.filter(x=>x.job===GUIDE.job)){const on=P.build===b.id,cur=on||mine===b.job;
    const nx=on?buildNextSkill(b):null,ns=on?buildNextStat(b):null,tot=Object.values(b.stats).reduce((a,v)=>a+v,0);
    h+=`<div class="bgcard${on?' on':''}"><div class="bghead"><div class="grow"><div class="nm">${esc(bName(b))} <span class="muted">· ${esc(b.tag)}</span></div><div class="ds">${esc(b.desc)}</div></div>`+
      (on?`<button class="btn small ghost" data-act="buildpick" data-arg="">Stop following</button>`:`<button class="btn small" data-act="buildpick" data-arg="${b.id}">Follow this build</button>`)+`</div>`;
    h+=`<div class="bgroute">`+b.route.map(c=>`<span class="${P.cls===c?'here':''}">${esc(CLASSES[c].name)}</span>`).join('<i>→</i>')+`</div>`;
    if(on)h+=`<div class="bgnext">${nx?`Next skill: <b>${esc(SKILLS[nx.id].name)} Lv ${nx.lv}</b>`:'All skills you can learn now are done for this build.'}${ns?` · next stat: <b>${ns.toUpperCase()}</b>`:''}</div>`;
    h+=`<h3>Stats</h3><div class="bgstats">`+Object.entries(b.stats).map(([k,v])=>`<div><span>${k.toUpperCase()}</span><i style="width:${Math.round(v/tot*100)}%"></i><b>${P.st[k]}</b></div>`).join('')+`</div>`;
    h+=`<h3>Skills, in order</h3><div class="bgskills">`;let tier=-1;
    for(const [id,lv] of b.skills){const sk=SKILLS[id];if(!sk)continue;const ti=b.route.findIndex(c=>CLASSES[c].skills.includes(id));
      if(ti!==tier){tier=ti;h+=`<div class="bgtier">${esc(CLASSES[b.route[Math.max(0,ti)]].name)}</div>`;}
      const have=P.skills[id]||0,done=have>=lv,isNext=nx&&nx.goal&&id===nx.id;
      h+=`<span class="bgsk${done?' done':''}${isNext?' next':''}" title="${esc(sk.name)}">${typeof skillIconURL==='function'?`<img src="${skillIconURL(id)}" alt="">`:''}${esc(sk.name)} <b>${cur?`${Math.min(have,lv)}/`:''}${lv}</b></span>`;}
    h+=`</div><h3>Gear and sigils</h3><div class="bggear">`+b.gear.filter(id=>ITEMS[id]).map(id=>`<span class="bgit">${icon({id})}${esc(ITEMS[id].name)}</span>`).join('')+
      b.sigils.filter(m=>ITEMS[m+'_sig']).map(m=>`<span class="bgit">${icon({id:m+'_sig'})}${esc(ITEMS[m+'_sig'].name)}</span>`).join('')+`</div>`+
      `<div class="ds">Awaken for: ${b.awaken.map(k=>esc(AW_NAME[k]||k)).join(', ')}</div></div>`;}
  return h;};
PANEL_ACTS.guidejob=j=>{GUIDE.job=j;sfx('click');refreshPanel();};
PANEL_ACTS.buildpick=id=>{P.build=id||null;sfx('click');if(id)addLog(`Following the ${bName(buildById(id))} build. The Skills window marks your next skill.`,'l-good');save();refreshPanel();};
PANEL_ACTS.openguide=()=>{GUIDE.job=null;openPanel('buildguide');};

// the Skills window: a Build guide button, and the next skill marked when you follow a build
{const _stG=skillTreeHtml;skillTreeHtml=function(){let h=_stG.apply(this,arguments);const b=buildById(P.build),nx=buildNextSkill(b);
  const bar=`<div class="bgbar"><button class="btn small" data-act="openguide">📖 Build guide</button>${b?`<span>Following <b>${esc(bName(b))}</b>${nx?` · next: <b>${esc(SKILLS[nx.id].name)} Lv ${nx.lv}</b>`:' · all done for now'}</span>`:'<span class="muted">Not sure what to learn? Pick a build.</span>'}</div>`;
  const i=h.indexOf('</div>',h.indexOf('class="sub"'));h=i<0?bar+h:h.slice(0,i+6)+bar+h.slice(i+6);
  return h;};}
// the Status window: which stat to raise next
{const _rpG=refreshPanel;refreshPanel=function(){const r=_rpG.apply(this,arguments);try{if(panelKind==='skills'&&P&&P.build){const nx=buildNextSkill(buildById(P.build));const btn=nx&&panel.querySelector(`[data-act="learn"][data-arg="${nx.id}"]`);const node=btn&&btn.closest('.snode');if(node)node.classList.add('bgnextnode');}
  if(panelKind==='status'&&P&&P.build&&P.statPts>0){const b=buildById(P.build),k=buildNextStat(b);
  if(k){const btn=panel.querySelector(`[data-act="stat"][data-arg="${k}"]`);if(btn){btn.classList.add('bgnextstat');const row=btn.closest('.st');if(row&&!row.querySelector('.bghint')){const s=document.createElement('span');s.className='bghint';s.textContent=`★ ${bName(b)}`;row.appendChild(s);}}}}}catch(e){}return r;};}
// /build opens it
if(typeof chatCommand==='function'){const _ccG=chatCommand;chatCommand=function(k,arg){if(k==='build'||k==='builds'||k==='guide'){PANEL_ACTS.openguide();return true;}return _ccG.apply(this,arguments);};}
