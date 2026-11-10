"use strict";
/* ================= #54/55 quests: NPC dialogue, a story chain, daily quests, a quest log and a tracker ================= */

// Extra NPCs: Elder Hollis in Hearthvale, and a guide standing near the entrance of each region.
const QNPC={
  hollis:{name:'Elder Hollis',zone:'town',tx:16.5,ty:17,col:'#6a5a8a',hair:'#e8e4dc'},
  pell:{name:'Warden Pell',zone:'meadow',dx:3,dy:-2,col:'#a0503a',hair:'#3b2b20'},
  ysolde:{name:'Ysolde the Tracker',zone:'woods',dx:3,dy:-2,col:'#3f7a4c',hair:'#c8783a'},
  kade:{name:'Scout Kade',zone:'dunes',dx:3,dy:-2,col:'#b08a4a',hair:'#2b1d16'},
};
const NPC_KEY={'Guildmaster Corvin':'corvin','Ilsa the Merchant':'ilsa','Brannoc the Smith':'brannoc','Sister Maren':'maren','Tobin the Wayfarer':'tobin','Wenna the Keeper':'wenna'};
for(const k in QNPC)NPC_KEY[QNPC[k].name]=k;
const npcName=k=>QNPC[k]?QNPC[k].name:Object.keys(NPC_KEY).find(n=>NPC_KEY[n]===k)||k;

// obj: kill {kill,n} · bring {item,n} (taken at turn-in) · go somewhere {visit}
const QUESTS={
  letter:{name:'A Letter for the Smith',from:'hollis',to:'brannoc',lv:1,obj:[],
    offer:['Ah, a new face in Hearthvale! Welcome, welcome.','Would you do an old man a kindness? Take this letter to Brannoc at the Smithy, just up the road.'],
    wait:'The Smithy is the dark-roofed building north of the fountain.',
    done:['A letter from Hollis? He only writes when he wants something.','…Hah. He wants me to look after you. Fine. Here, take these, you will need them.'],
    reward:{exp:60,jexp:30,gold:100,items:[['red',5]]}},
  sprouts:{name:'Sprouts and Sap',from:'brannoc',to:'brannoc',lv:1,after:'letter',obj:[{kill:'sproutling',n:8},{item:'sap',n:5}],
    offer:['My quench barrel needs Sap Drops. The Sproutlings in Greenmoss Meadow are full of them.','Clear out 8 of them and bring me 5 Sap Drops. The meadow is through the east gate.'],
    wait:'8 Sproutlings, 5 Sap Drops. The meadow is east of town.',
    done:['Good sap, nice and sticky. That will temper a blade nicely.','Take this ore. When you have a weapon worth improving, bring it here.'],
    reward:{exp:150,jexp:90,gold:200,items:[['emberore',1]]}},
  watch:{name:'The Meadow Watch',from:'hollis',to:'pell',lv:3,after:'sprouts',obj:[],
    offer:['Brannoc tells me you handled yourself well out there.','The guild keeps a watch post in the meadow. Warden Pell runs it. Go and offer your help.'],
    wait:'Warden Pell stands near the west edge of Greenmoss Meadow.',
    done:['Hollis sent you? Then you are welcome here.','I could use a pair of hands. The Mossbugs are getting bold.'],
    reward:{exp:120,jexp:60,gold:100}},
  mossbugs:{name:'Shells on the Path',from:'pell',to:'pell',lv:5,after:'watch',obj:[{kill:'mossbug',n:10},{item:'shell',n:5}],
    offer:['Mossbugs have been gnawing at the travellers\' packs. Thin them out: 10 should do.','And bring me 5 Moss Shells. They make good shield facings.'],
    wait:'10 Mossbugs and 5 Moss Shells.',
    done:['The road is quieter already. You have a knack for this.','Wear this. It is not much, but the guild looks after its own.'],
    reward:{exp:800,jexp:450,gold:500,items:[['sprout',1],['orange',3]]}},
  woods:{name:'Into the Woods',from:'pell',to:'ysolde',lv:10,after:'mossbugs',obj:[{visit:'woods'}],
    offer:['Something is pushing the wolves out of Whispering Woods. They never used to come this close.','Ysolde the Tracker is camped at the edge of the woods, east of here. Find her.'],
    wait:'Whispering Woods is east of the meadow. Ysolde waits near its entrance.',
    done:['Pell\'s recruit. Quiet now. The Lupes are hunting near here.'],
    reward:{exp:600,jexp:300,gold:300}},
  lupes:{name:'The Restless Pack',from:'ysolde',to:'ysolde',lv:12,after:'woods',obj:[{kill:'greylupe',n:12},{item:'pelt',n:5}],
    offer:['The pack has gone mad. They flee something to the east and bite anything in their way.','Bring down 12 Grey Lupes and fetch 5 pelts. I want to know what they have been rolling in.'],
    wait:'12 Grey Lupes and 5 Lupe Pelts.',
    done:['Ash. These pelts are full of ash, and it is warm.','Something is burning under the dunes. Here, wear these ears. The pack will think you are one of them.'],
    reward:{exp:4000,jexp:2400,gold:1500,items:[['lupeears',1]]}},
  dunes:{name:'Ash on the Wind',from:'ysolde',to:'kade',lv:20,after:'lupes',obj:[{visit:'dunes'}],
    offer:['Take this pelt to Scout Kade in the Ashen Dunes. He watches the old roads there.','If anyone knows where the ash is coming from, it is him.'],
    wait:'Head east through the woods to the Ashen Dunes and find Scout Kade.',
    done:['Warm ash? So it is not just me. The wraiths have been worse every night.'],
    reward:{exp:2500,jexp:1500,gold:800}},
  wraiths:{name:'Dust and Shadow',from:'kade',to:'kade',lv:24,after:'dunes',obj:[{kill:'wraith',n:12},{item:'dust',n:6}],
    offer:['The Dust Wraiths drift in from the east, toward the old crypt. I need proof for the guild.','Put down 12 of them and bring me 6 Wraith Dust.'],
    wait:'12 Dust Wraiths and 6 Wraith Dust.',
    done:['The dust glows when you hold it to the crypt. Whatever stirs is down there.','Take these Glintstones. You will want your armour strong for what comes next.'],
    reward:{exp:12000,jexp:7000,gold:4000,items:[['glintstone',2]]}},
  crypt:{name:'The Cinder Gate',from:'kade',to:'hollis',lv:34,after:'wraiths',obj:[{kill:'emberimp',n:15},{item:'core',n:3}],
    offer:['The crypt doors are open, and Ember Imps pour out of them.','Fight your way in. Destroy 15 imps and carry 3 of their Ember Cores back to Elder Hollis. He will know what they mean.'],
    wait:'15 Ember Imps and 3 Ember Cores, then return to Elder Hollis in Hearthvale.',
    done:['Ember Cores… still beating. Then the old story is true.','Long ago a warlord was sealed in that crypt. The seal is failing. I am sorry to ask this of you.'],
    reward:{exp:30000,jexp:18000,gold:10000,items:[['emberore',3]]}},
  warlord:{name:'Heart of Ash',from:'hollis',to:'hollis',lv:40,after:'crypt',obj:[{kill:'warlord',n:1}],
    offer:['The Ashen Warlord wakes in the depths of the Cinder Crypt.','No one in Hearthvale can stand against him. No one but you, and whoever you trust at your side. Bring friends.'],
    wait:'Defeat the Ashen Warlord in the Cinder Crypt. Bring a party.',
    done:['The ground has gone cold. You did it.','Hearthvale owes you everything. Take this, and know that your name will be told by this fountain for a long time.'],
    reward:{exp:60000,jexp:36000,gold:30000,items:[['emberore',5],['glintstone',5]]}},
  // dailies: once per day each
  d_patrol:{name:'Daily: Meadow Patrol',daily:true,from:'pell',to:'pell',lv:3,maxLv:20,after:'watch',obj:[{kill:'hopper',n:15}],
    offer:['The Hoppers trample the crops every day. Thin them out again: 15 will do.'],wait:'15 Hoppers in Greenmoss Meadow.',
    done:['Good work. Same time tomorrow?'],reward:{exp:500,jexp:300,gold:300,items:[['red',5]]}},
  d_restock:{name:'Daily: Restock the Store',daily:true,from:'ilsa',to:'ilsa',lv:10,after:'letter',obj:[{item:'thorn',n:8}],
    offer:['Customers keep asking for Thorn Barbs and I keep running out.','Bring me 8 and I will pay better than the counter does.'],wait:'8 Thorn Barbs from the Thornlings of Whispering Woods.',
    done:['Lovely, sharp as anything. Here is your pay, and something for the road.'],reward:{exp:1500,jexp:900,gold:900,items:[['blue',2]]}},
  d_deep:{name:'Daily: The Gloomcap King',daily:true,from:'ysolde',to:'ysolde',lv:30,after:'lupes',obj:[{kill:'gloomking',n:1}],
    offer:['There are stairs in a clearing south of the road, down into the Mossdeep Caverns.','At the bottom, three floors down, a king of the gloom grows fat on the dark. Cut him down before his spores reach the woods.'],
    wait:'Go down the stairs in Whispering Woods to Mossdeep Caverns B3 and defeat the Gloomcap King.',
    done:['The spores have settled. The woods breathe easier tonight. He will grow back, he always does.'],reward:{exp:20000,jexp:12000,gold:5000,items:[['glintstone',1],['orange',3]]}},
  d_sweep:{name:'Daily: Dune Sweep',daily:true,from:'kade',to:'kade',lv:20,after:'dunes',obj:[{kill:'scarab',n:15}],
    offer:['The Scarabs dig up the road every night. Clear 15 of them and the caravans can move again.'],wait:'15 Dune Scarabs in the Ashen Dunes.',
    done:['The road is clear. Come back tomorrow, they always return.'],reward:{exp:8000,jexp:5000,gold:2500,items:[['remedy',3]]}},
};
const today=()=>new Date().toISOString().slice(0,10);
function QS(){if(!P.qs||typeof P.qs!=='object')P.qs={};const q=P.qs;if(!q.active||typeof q.active!=='object')q.active={};if(!Array.isArray(q.done))q.done=[];if(!q.daily||typeof q.daily!=='object')q.daily={};
  for(const id in q.active)if(!QUESTS[id])delete q.active[id];return q;}
function qAvailable(id){const q=QUESTS[id],s=QS();if(s.active[id]||P.lv<q.lv||(q.maxLv&&P.lv>q.maxLv))return false;
  if(q.after&&!s.done.includes(q.after))return false;return q.daily?s.daily[id]!==today():!s.done.includes(id);}
function objHave(id,o){const a=QS().active[id];if(!a)return 0;if(o.kill)return Math.min(o.n,(a.k&&a.k[o.kill])||0);
  if(o.item){const e=invFind(o.item);return Math.min(o.n,e?e.n:0);}if(o.visit)return P.visited.includes(o.visit)||P.zone===o.visit?1:0;return 0;}
const objNeed=o=>o.visit?1:o.n;
function objText(id,o){const h=objHave(id,o);if(o.kill)return `Defeat ${MOBS[o.kill].name} ${h}/${o.n}`;if(o.item)return `${ITEMS[o.item].name} ${h}/${o.n}`;return `Reach ${ZONES[o.visit].name}`;}
const qReady=id=>!!QS().active[id]&&QUESTS[id].obj.every(o=>objHave(id,o)>=objNeed(o));
function questsAt(key){const s=QS(),r={ready:[],offer:[],busy:[]};
  for(const id in QUESTS){const q=QUESTS[id];if(s.active[id]&&q.to===key)(qReady(id)?r.ready:r.busy).push(id);else if(q.from===key&&qAvailable(id))r.offer.push(id);}return r;}

/* ---- kills count toward active quests ---- */
const _questKill2=questKill;
questKill=function(mob){_questKill2(mob);if(!P)return;const s=QS();
  for(const id in s.active){const o=QUESTS[id].obj.find(o=>o.kill===mob);if(!o)continue;const a=s.active[id];a.k=a.k||{};if((a.k[mob]||0)>=o.n)continue;
    a.k[mob]=(a.k[mob]||0)+1;if(a.k[mob]===o.n)addLog(`${QUESTS[id].name}: ${o.n}/${o.n} ${MOBS[mob].name}.`,'l-good');
    if(qReady(id)){addLog(`${QUESTS[id].name} is ready. Return to ${npcName(QUESTS[id].to)}.`,'l-rare');sfx('jobup');}}
  questHud();};

/* ---- the dialogue window ---- */
let talk=null; // {npc:key, id, mode:'offer'|'done'|'busy', page}
function npcKeyOf(n){return NPC_KEY[n.name];}
const _openNpc=openNpc;
openNpc=function(n){const key=npcKeyOf(n),q=key?questsAt(key):null;
  if(n.role!=='talk'&&!(q&&(q.ready.length||q.offer.length||q.busy.length)))return _openNpc(n);
  P.face=sface(n.x-P.x,n.y-P.y);talk={npc:key,role:n.role,n,id:null,mode:null,page:0};sfx('click');openPanel('talk');};
PANELS.talk=()=>{if(!talk)return '';const key=talk.npc,n=npcName(key);let h=`<div class="thead"><canvas id="talkCv" width="144" height="144" aria-hidden="true"></canvas><h2>${esc(n)}</h2></div>`;
  if(talk.id){const q=QUESTS[talk.id],lines=talk.mode==='offer'?q.offer:talk.mode==='done'?q.done:[q.wait],last=talk.page>=lines.length-1;
    h+=`<div class="sub">${q.name}</div><div class="say talk">“${esc(lines[talk.page])}”</div>`;
    if(!last)return h+`<div class="tbtns"><button class="btn" data-act="tnext">Next ▸</button></div>`;
    if(talk.mode==='offer')return h+questBox(talk.id,false)+`<div class="tbtns"><button class="btn" data-act="qaccept" data-arg="${talk.id}">Accept</button><button class="btn" data-act="tback">Not now</button></div>`;
    if(talk.mode==='done')return h+questBox(talk.id,true)+`<div class="tbtns"><button class="btn" data-act="qfinish" data-arg="${talk.id}">Complete quest</button></div>`;
    return h+questBox(talk.id,false)+`<div class="tbtns"><button class="btn" data-act="tback">Back</button></div>`;}
  const q=questsAt(key);
  h+=`<div class="say talk">“${esc(greeting(key))}”</div><div class="tlist">`;
  for(const id of q.ready)h+=`<button class="tq ready" data-act="topen" data-arg="done:${id}"><b>?</b> ${QUESTS[id].name}</button>`;
  for(const id of q.offer)h+=`<button class="tq offer" data-act="topen" data-arg="offer:${id}"><b>!</b> ${QUESTS[id].name}</button>`;
  for(const id of q.busy)h+=`<button class="tq busy" data-act="topen" data-arg="busy:${id}"><b>…</b> ${QUESTS[id].name}</button>`;
  h+=`</div><div class="tbtns">`;
  if(talk.role&&talk.role!=='talk')h+=`<button class="btn" data-act="tservice">${SERVICE[talk.role]||'Talk'}</button>`;
  return h+`<button class="btn" data-act="close">Goodbye</button></div>`;};
const SERVICE={shop:'Browse the store',job:'Guild business',heal:'Ask for a blessing',warp:'Travel',smith:'Smithing',storage:'Open storage'};
function greeting(key){return {hollis:'The fountain has seen a lot of heroes come and go. Sit a while.',pell:'Keep your eyes on the grass. The Hoppers bite.',
  ysolde:'Step softly. The woods are listening.',kade:'Sand gets everywhere. Watch your footing.',brannoc:'Mind the sparks.',ilsa:'Welcome back, friend!'}[key]||'Well met, traveller.';}
function questBox(id,reward){const q=QUESTS[id],r=q.reward;let h=`<div class="qbox">`;
  const on=!!QS().active[id];
  if(q.obj.length)h+=`<div class="ds">${q.obj.map(o=>on?`${objHave(id,o)>=objNeed(o)?'✓':'·'} ${objText(id,o)}`:`· ${o.kill?`Defeat ${o.n} ${MOBS[o.kill].name}`:o.item?`Bring ${o.n} ${ITEMS[o.item].name}`:`Reach ${ZONES[o.visit].name}`}`).join('<br>')}${q.to!==q.from?`<br>· Then talk to ${npcName(q.to)}`:''}</div>`;
  else if(q.to!==q.from)h+=`<div class="ds">Talk to ${npcName(q.to)}</div>`;
  h+=`<div class="ds qrew">Rewards: ${fmt(r.exp)} EXP · ${fmt(r.jexp)} job EXP · ${fmt(r.gold)} gold${(r.items||[]).map(([i,n])=>` · ${ITEMS[i].name}${n>1?' ×'+n:''}`).join('')}</div></div>`;return h;}
PANEL_ACTS.tnext=()=>{talk.page++;refreshPanel();};
PANEL_ACTS.tback=()=>{talk.id=null;talk.page=0;refreshPanel();};
PANEL_ACTS.topen=arg=>{const[mode,id]=arg.split(':');if(!QUESTS[id])return;talk.id=id;talk.mode=mode;talk.page=0;sfx('click');refreshPanel();};
PANEL_ACTS.tservice=()=>{const r=talk.role;talk=null;shopTab='buy';openPanel(r);};
PANEL_ACTS.qaccept=id=>{if(!qAvailable(id)||QUESTS[id].from!==talk.npc)return;QS().active[id]={k:{}};if(!P.track)P.track=id;
  addLog(`Quest accepted: ${QUESTS[id].name}.`,'l-good');sfx('click');
  const q=QUESTS[id];if(qReady(id)&&q.to===talk.npc){talk.mode='done';talk.page=0;}else{talk.id=null;}questHud();refreshPanel();save();};
PANEL_ACTS.qfinish=id=>{const q=QUESTS[id],s=QS();if(!qReady(id)||q.to!==talk.npc)return;
  for(const o of q.obj)if(o.item)takeItem(o.item,o.n);delete s.active[id];
  if(q.daily)s.daily[id]=today();else if(!s.done.includes(id))s.done.push(id);
  if(P.track===id)P.track=Object.keys(s.active)[0]||null;
  const r=q.reward;P.gold+=r.gold;for(const[i,n]of r.items||[])giveItem(i,n);
  addLog(`Quest complete: ${q.name}! ${fmt(r.exp)} EXP, ${fmt(r.gold)} gold${(r.items||[]).map(([i,n])=>`, ${ITEMS[i].name}${n>1?' ×'+n:''}`).join('')}.`,'l-rare');
  sfx('fanfare');fx.push({k:'lvl',x:P.x,y:P.y-30,t0:now,dur:1.6,txt:'QUEST COMPLETE',col:'#ffcf5a'});if(id==='warlord')announce('story',id);
  gainExp(r.exp,r.jexp);talk.id=null;talk.page=0;questHud();refreshPanel();save(true);};

/* ---- quest log (J) and the tracker in the status box ---- */
PANELS.quests=()=>{const s=QS(),act=Object.keys(s.active);let h=`<h2>Quest log</h2><div class="sub">Pin a quest to see it in your status box. Talk to people with a <b class="gold">!</b> over their head for new quests.</div>`;
  if(!act.length)h+=`<p class="muted">No active quests. ${nextHint()}</p>`;
  for(const id of act){const q=QUESTS[id];h+=`<div class="row qrow"><div class="grow"><div class="nm">${q.name}${qReady(id)?' <span class="gold">· ready</span>':''}</div>`+
    `<div class="ds">${q.obj.map(o=>`${objHave(id,o)>=objNeed(o)?'✓':'·'} ${objText(id,o)}`).join('<br>')}${q.obj.length?'<br>':''}${qReady(id)?`Return to ${npcName(q.to)}.`:esc(q.wait)}</div></div>`+
    `<div class="qbtns"><button class="btn small${P.track===id?' on':''}" data-act="qtrack" data-arg="${id}">${P.track===id?'Pinned':'Pin'}</button><button class="btn small" data-act="qabandon" data-arg="${id}">Abandon</button></div></div>`;}
  const story=Object.keys(QUESTS).filter(id=>!QUESTS[id].daily),done=story.filter(id=>s.done.includes(id)).length;
  h+=`<h3>Story: The Ember Below</h3><div class="ds">${done}/${story.length} chapters complete${done===story.length?'. Hearthvale is safe, for now.':''}</div>`;
  return h;};
function nextHint(){const id=Object.keys(QUESTS).find(id=>!QUESTS[id].daily&&qAvailable(id));if(id)return `${npcName(QUESTS[id].from)} has something for you.`;
  const lock=Object.keys(QUESTS).find(id=>!QUESTS[id].daily&&!QS().done.includes(id)&&!QS().active[id]);return lock?`The next chapter opens at Base Lv ${QUESTS[lock].lv}.`:'';}
PANEL_ACTS.qtrack=id=>{P.track=P.track===id?null:id;questHud();refreshPanel();save();};
PANEL_ACTS.qabandon=id=>{delete QS().active[id];if(P.track===id)P.track=Object.keys(QS().active)[0]||null;addLog(`Quest abandoned: ${QUESTS[id].name}. You can pick it up again from ${npcName(QUESTS[id].from)}.`);questHud();refreshPanel();save();};
let qhudKey='';
function questHud(){const el=document.getElementById('qtrack');if(!el||!P)return;const s=QS();let id=P.track;if(id&&!s.active[id])id=P.track=null;
  const txt=id?`${QUESTS[id].name}\n`+(qReady(id)?`Return to ${npcName(QUESTS[id].to)}`:QUESTS[id].obj.filter(o=>objHave(id,o)<objNeed(o)).map(o=>objText(id,o)).join('\n')||`Talk to ${npcName(QUESTS[id].to)}`):'';
  if(txt===qhudKey)return;qhudKey=txt;el.hidden=!txt;el.textContent=txt;}
setInterval(()=>{if(running&&P)questHud();},500);

/* ---- putting the quest NPCs into the world, and their markers ---- */
const _getZone=getZone;
getZone=function(id){const had=!!zoneCache[id],z=_getZone(id);if(had)return z;
  for(const k in QNPC){const d=QNPC[k];if(d.zone!==id)continue;let tx,ty;
    if(d.tx!==undefined){tx=d.tx;ty=d.ty;}else{const sx=Math.floor(z.spawn.x/TILE),sy=Math.floor(z.spawn.y/TILE);
      outer:for(let r=0;r<6;r++)for(let yy=-r;yy<=r;yy++)for(let xx=-r;xx<=r;xx++){const x=sx+d.dx+xx,y=sy+d.dy+yy;if(x>0&&y>0&&x<z.w-1&&y<z.h-1&&!BLOCK[z.t[y*z.w+x]]){tx=x+.5;ty=y+.5;break outer;}}
      if(tx===undefined){tx=sx+.5;ty=sy-1.5;}}
    z.npcs.push({name:d.name,role:'talk',col:d.col,hair:d.hair,x:tx*TILE,y:ty*TILE});}
  return z;};
// '!' a quest to offer, '?' a quest ready to hand in, grey '?' one in progress, nothing for quiet NPCs
function npcMark(n){if(!P)return null;const key=npcKeyOf(n);if(!key)return n.role==='talk'?null:'svc';const q=questsAt(key);
  return q.ready.length?'ready':q.offer.length?'offer':q.busy.length?'busy':n.role==='talk'?null:'svc';}

// the speaker's portrait at the top of the dialogue window
function drawTalkPortrait(){const c=document.getElementById('talkCv');if(!c||!talk||!talk.n)return;const g=c.getContext('2d'),n=talk.n;
  g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,c.width,c.height);g.setTransform(3.2,0,0,3.2,0,0);const main=ctx;ctx=g;
  try{drawHuman(22.5,60,n.col,n.hair,1,0,{look:{...lookFor(n.name),hair:n.hair}});}finally{ctx=main;}}
const _refreshPanel=refreshPanel;
refreshPanel=function(){_refreshPanel();if(panelKind==='talk')drawTalkPortrait();};
