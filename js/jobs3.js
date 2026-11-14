"use strict";
/* ================= third-tier callings =================
   A reborn hero who holds an advanced calling at job level 50 (and base level 50 again) can take Seer Valen's
   Trial of Ascension in Aurelmark. Each advanced calling rises into one master calling that keeps every skill
   it had and adds two of its own. Job level starts again at 1 (49 new skill points to spend). */
const JOB3_LV=50,JOB3_BASE_LV=50,JOB3_GOLD=30000;
const JOB3={
  aegislord:{from:'bulwark',name:'Aegis Lord',hp:2.4,sp:1,aspd:.92,col:'#5c6a80',acc:'#ffd76a',
    desc:'The last wall. Shakes the earth to stun whole packs and shields the party behind a fortress of steel.',skills:['titanslam','fortress']},
  warbringer:{from:'ravager',name:'Warbringer',hp:2.05,sp:.95,aspd:.76,col:'#6a1a16',acc:'#ffb36a',
    desc:'War given a body. Blood-fuelled fury and blows that split the ground for a whole area.',skills:['cataclysm','bloodrage']},
  tempestsage:{from:'stormcaller',name:'Tempest Sage',hp:1,sp:2.7,aspd:1.05,col:'#24408e',acc:'#bfefff',
    desc:'Commands the sky. Lances of thunder and meteors that wipe out entire packs.',skills:['thunderlance','meteor']},
  voidcaller:{from:'hexweaver',name:'Voidcaller',hp:1.15,sp:2.45,aspd:1,col:'#2e1a48',acc:'#e0a8ff',
    desc:'Opens rifts into nothing. Drains life to stay standing and drags whole groups into the void.',skills:['lifedrain','voidrift']},
  deadeye:{from:'sharpshooter',name:'Deadeye',hp:1.35,sp:1.35,aspd:.74,col:'#1f4a40',acc:'#ffe08a',
    desc:'Never misses twice, because never misses. The strongest single shot and a sky full of arrows.',skills:['headshot','arrowstorm']},
  beastlord:{from:'wildstalker',name:'Beastlord',hp:1.5,sp:1.3,aspd:.72,col:'#3e4a1c',acc:'#c8f08a',
    desc:'Runs with the pack. A howl that speeds up the whole party and volleys that pin monsters down.',skills:['savagevolley','packhowl']},
  dawnknight:{from:'templar',name:'Dawnknight',hp:1.8,sp:1.8,aspd:.9,col:'#b8862a',acc:'#fff6c0',
    desc:'Carries the sunrise into battle. Holy blows around it and a ward that guards every friend nearby.',skills:['dawnbreaker','sacredward']},
  starseer:{from:'oracle',name:'Starseer',hp:1.4,sp:2.3,aspd:.98,col:'#dcd4f0',acc:'#9fd8ff',
    desc:'Reads the stars and calls them down. The greatest healing in Embervale, and falling stars for enemies.',skills:['starfall','resurgence']},
};
for(const id in JOB3){const j=JOB3[id],p=CLASSES[j.from],b=CLASSES[p.base];
  CLASSES[id]={name:j.name,hp:j.hp,sp:j.sp,aspd:j.aspd,weapons:b.weapons,col:j.col,hair:b.hair,magic:b.magic,base:p.base,parent:j.from,tier:3,acc:j.acc,
    desc:j.desc,own:j.skills,skills:[...p.skills.filter(s=>s!=='firstaid'),...j.skills,'firstaid']};}
const job3From=cls=>Object.keys(JOB3).filter(id=>JOB3[id].from===cls);

const J3SK={
  titanslam:{name:'Titan Slam',max:10,col:'#c8a46a',g:'T',sp:l=>30+l*3,cd:4,kind:'self',desc:l=>`Slam the ground: ${260+l*40}% ATK to all within 120px, ${30+l*3}% chance to stun for 2s.`,
    run:l=>{shakeUntil=now+.35;fx.push({k:'ring',x:P.x,y:P.y,r:120,col:'#ffd76a',t0:now,dur:.45});fx.push({k:'killburst',x:P.x,y:P.y,s:20,col:'#c8a46a',t0:now,dur:.5});
      aoe(P.x,P.y,120,m=>dealPhys(m,2.6+l*.4,{sure:true,ail:['stun',.3+l*.03,2]}));}},
  fortress:{name:'Fortress',max:10,col:'#ffd76a',g:'F',sp:l=>40,cd:40,kind:'self',desc:l=>`For 60s: +${l*12} DEF, +${l*4}% Max HP and +${l*4} HP regen per second.`,
    run:l=>buff('fortress','Fortress',60,{def:l*12,hppct:l*4,regen:l*4})},
  cataclysm:{name:'Cataclysm',max:10,col:'#e0703a',g:'C',sp:l=>45+l*4,cd:6,kind:'area',range:200,radius:140,desc:l=>`Split the ground on your target's area: ${350+l*60}% ATK (Earth) to all within 140px. Never misses.`,
    run:(l,x,y)=>{shakeUntil=now+.4;fx.push({k:'ring',x,y,r:140,col:'#e0703a',t0:now,dur:.5});for(let i=0;i<6;i++)fx.push({k:'spark',x:x+rnd(-110,110),y:y+rnd(-70,70),t0:now+i*.05,dur:.35,r:6});
      aoe(x,y,140,m=>dealPhys(m,3.5+l*.6,{sure:true,el:'earth'}));}},
  bloodrage:{name:'Blood Rage',max:10,col:'#ff4a3a',g:'B',sp:l=>30,cd:30,kind:'self',desc:l=>`For 45s: +${l*12} ATK, +${l} CRIT and +${l*2} HIT.`,
    run:l=>buff('bloodrage','Blood Rage',45,{atk:l*12,crit:l,hit:l*2})},
  thunderlance:{name:'Thunder Lance',max:10,col:'#d8c8ff',g:'L',sp:l=>18+l*2,cd:1.2,kind:'target',range:250,desc:l=>`A bolt of thunder for ${400+l*60}% MATK (Wind), ${25+l*3}% chance to stun for 1.5s.`,
    run:(l,t)=>shoot(P,t,'orb','#e8e0ff',()=>{fx.push({k:'pillar',x:t.x,y:t.y,t0:now,dur:.3});dealMag(t,4+l*.6,'wind',['stun',.25+l*.03,1.5]);})},
  meteor:{name:'Meteor',max:10,col:'#ff5a1a',g:'M',sp:l=>60+l*5,cd:8,kind:'area',range:270,radius:150,desc:l=>`Call down a meteor on your target's area: ${450+l*80}% MATK (Fire) to all within 150px.`,
    run:(l,x,y)=>{shakeUntil=now+.5;fx.push({k:'beam',x,y,t0:now,dur:.6});fx.push({k:'killburst',x,y,s:34,col:'#ff7a2a',t0:now+.08,dur:.7});fx.push({k:'ring',x,y,r:150,col:'#ff8a3a',t0:now,dur:.6});
      aoe(x,y,150,m=>dealMag(m,4.5+l*.8,'fire'));}},
  lifedrain:{name:'Life Drain',max:10,col:'#c070ff',g:'D',sp:l=>16+l*2,cd:1,kind:'target',range:240,desc:l=>`Drain a monster for ${350+l*50}% MATK (Shadow). You heal ${l*3}% of your Max HP.`,
    run:(l,t)=>shoot(P,t,'orb','#c070ff',()=>{dealMag(t,3.5+l*.5,'shadow');healP(S.maxhp*l*.03);})},
  voidrift:{name:'Void Rift',max:10,col:'#7a3aaa',g:'V',sp:l=>40+l*4,cd:5,kind:'area',range:250,radius:130,desc:l=>`Tear open a rift on your target's area: ${320+l*50}% MATK (Shadow) to all within 130px, and they are slowed for 3s.`,
    run:(l,x,y)=>{fx.push({k:'nova',x,y,r:130,t0:now,dur:.6});fx.push({k:'ring',x,y,r:130,col:'#7a3aaa',t0:now,dur:.6});aoe(x,y,130,m=>{dealMag(m,3.2+l*.5,'shadow');slowMob(m,3);});}},
  headshot:{name:'Headshot',max:10,col:'#ffe08a',g:'H',sp:l=>18+l*2,cd:1.5,kind:'target',range:300,desc:l=>`One perfect arrow for ${500+l*80}% ATK that never misses.`,
    run:(l,t)=>shoot(P,t,'arrow','#fff0b0',()=>{fx.push({k:'critburst',x:t.x,y:t.y-t.d.size,t0:now,dur:.35});dealPhys(t,5+l*.8,{sure:true});})},
  arrowstorm:{name:'Arrow Storm',max:10,col:'#e8e090',g:'S',sp:l=>40+l*4,cd:5,kind:'area',range:300,radius:170,desc:l=>`Darken the sky over your target's area: ${300+l*50}% ATK to all within 170px. Never misses.`,
    run:(l,x,y)=>{for(let i=0;i<34;i++)fx.push({k:'arrowfall',x:x+rnd(-160,160),y:y+rnd(-110,110),t0:now+i*.02,dur:.35});aoe(x,y,170,m=>dealPhys(m,3+l*.5,{sure:true}));}},
  savagevolley:{name:'Savage Volley',max:10,col:'#a8d86a',g:'V',sp:l=>32+l*3,cd:4,kind:'area',range:270,radius:140,desc:l=>`Barbed arrows on your target's area: ${280+l*45}% ATK (Earth) to all within 140px, and they are slowed for 3s.`,
    run:(l,x,y)=>{for(let i=0;i<20;i++)fx.push({k:'arrowfall',x:x+rnd(-130,130),y:y+rnd(-90,90),t0:now+i*.025,dur:.35});aoe(x,y,140,m=>{dealPhys(m,2.8+l*.45,{sure:true,el:'earth'});slowMob(m,3);});}},
  packhowl:{name:'Pack Howl',max:10,col:'#c8f08a',g:'P',sp:l=>30,cd:30,kind:'self',desc:l=>`For 90s: +${l*6} ATK, +${l*2} AGI and +${l*3} FLEE.`,
    run:l=>{fx.push({k:'ring',x:P.x,y:P.y,r:90,col:'#c8f08a',t0:now,dur:.5});buff('packhowl','Pack Howl',90,{atk:l*6,agi:l*2,flee:l*3});}},
  dawnbreaker:{name:'Dawnbreaker',max:10,col:'#fff2a0',g:'D',sp:l=>30+l*3,cd:3,kind:'self',desc:l=>`Sunlight bursts from your weapon: ${300+l*50}% ATK (Holy) to all within 130px. Never misses.`,
    run:l=>{fx.push({k:'ring',x:P.x,y:P.y,r:130,col:'#fff6c0',t0:now,dur:.45});fx.push({k:'pillar',x:P.x,y:P.y,t0:now,dur:.4});aoe(P.x,P.y,130,m=>dealPhys(m,3+l*.5,{sure:true,el:'holy'}));}},
  sacredward:{name:'Sacred Ward',max:10,col:'#fff6c0',g:'W',sp:l=>36,cd:40,kind:'self',desc:l=>`For 90s: +${l*8} DEF, +${l*3}% Max HP and +${l*4} HP regen per second.`,
    run:l=>buff('sacredward','Sacred Ward',90,{def:l*8,hppct:l*3,regen:l*4})},
  starfall:{name:'Starfall',max:10,col:'#cfe8ff',g:'S',sp:l=>50+l*4,cd:6,kind:'area',range:260,radius:140,desc:l=>`Stars fall on your target's area: ${380+l*65}% MATK (Holy) to all within 140px.`,
    run:(l,x,y)=>{for(let i=0;i<7;i++)fx.push({k:'pillar',x:x+rnd(-110,110),y:y+rnd(-70,70),t0:now+i*.07,dur:.4});fx.push({k:'ring',x,y,r:140,col:'#cfe8ff',t0:now,dur:.6});aoe(x,y,140,m=>dealMag(m,3.8+l*.65,'holy'));}},
  resurgence:{name:'Resurgence',max:10,col:'#9fffd0',g:'R',sp:l=>40+l*4,cd:15,kind:'self',desc:l=>`Heal ${60*l} + ${200+l*60}% MATK, restore ${l*5} SP and cure ailments.`,
    run:l=>{fx.push({k:'heal',x:P.x,y:P.y,r:40,col:'#9fffd0',t0:now,dur:.7});healP(60*l+S.matk*(2+l*.6));P.sp=Math.min(S.maxsp,P.sp+l*5);cureAll();}},
};
Object.assign(SKILLS,J3SK);
Object.assign(SKILL_REQ,{fortress:{titanslam:3},bloodrage:{cataclysm:1},meteor:{thunderlance:5},voidrift:{lifedrain:3},arrowstorm:{headshot:3},packhowl:{savagevolley:1},sacredward:{dawnbreaker:3},resurgence:{starfall:1}});
Object.assign(CAST,{thunderlance:1,meteor:2.4,lifedrain:.7,voidrift:1.2,headshot:.9,arrowstorm:.6,starfall:1.6,resurgence:1});
Object.assign(SKILL_ELEM,{cataclysm:'earth',thunderlance:'wind',meteor:'fire',lifedrain:'shadow',voidrift:'shadow',savagevolley:'earth',dawnbreaker:'holy',starfall:'holy'});
// party skills: they reach party members nearby, like the second-job ones
{const J3SUP={fortress:{r:260,apply:l=>buff('fortress','Fortress',60,{def:l*12,hppct:l*4,regen:l*4})},
  packhowl:{r:260,apply:l=>buff('packhowl','Pack Howl',90,{atk:l*6,agi:l*2,flee:l*3})},
  sacredward:{r:260,apply:l=>buff('sacredward','Sacred Ward',90,{def:l*8,hppct:l*3,regen:l*4})},
  resurgence:{r:300,amt:l=>60*l+S.matk*(2+l*.6),apply:(l,v)=>{healP(v);cureAll(true);}}};
  if(typeof SUP!=='undefined')for(const id in J3SUP){SUP[id]=J3SUP[id];const sk=SKILLS[id],run=sk.run,desc=sk.desc,r=J3SUP[id].r;
    sk.run=(l,...a)=>{run(l,...a);supportCast(id,l);};sk.desc=l=>desc(l)+` Party members within ${r}px get it too.`;sk.party=true;}}

/* ---- the Trial of Ascension, with Seer Valen ---- */
const TRIALS3={
  warden:{mob:'snowhulk',need:40,item:'fur',items:15},
  arcanist:{mob:'frostwisp',need:40,item:'shard',items:15},
  ranger:{mob:'rimestalker',need:40,item:'fang',items:15},
  cleric:{mob:'glacierbeetle',need:40,item:'fur',items:12},
};
const trial3Of=()=>P&&TRIALS3[baseOf(P.cls)];
function job3Why(){const c=CLASSES[P.cls];if(!c||c.tier!==2)return c&&c.tier===3?'You already hold a master calling.':'Earn an advanced calling first.';
  if(!P.reborn)return 'Only the Reborn can ascend. Take the rite of rebirth first.';
  if(P.jl<JOB3_LV)return `Reach job level ${JOB3_LV} first (you are ${P.jl}).`;
  if(P.lv<JOB3_BASE_LV)return `Reach base level ${JOB3_BASE_LV} again first (you are ${P.lv}).`;
  return null;}
function trial3Done(){const t=P.trial3,T=trial3Of();if(!t||!T)return false;const it=invFind(T.item);
  return t.have>=T.need&&(it?it.n:0)>=T.items&&P.gold>=JOB3_GOLD;}
const _questKill3=questKill;
questKill=function(id){_questKill3(id);const t=P&&P.trial3,T=trial3Of();if(!t||!T||T.mob!==id||t.have>=T.need)return;
  t.have++;if(t.have===T.need){addLog(`Ascension: all ${T.need} ${MOBS[id].name} defeated. Bring ${T.items} ${ITEMS[T.item].name} to Seer Valen in Aurelmark.`,'l-rare');sfx('fanfare');}
  else if(t.have%10===0)addLog(`Ascension: ${t.have}/${T.need} ${MOBS[id].name}.`,'l-good');refreshPanel();};
function ascensionHtml(){const c=CLASSES[P.cls];let h=`<h3>Trial of Ascension</h3>`;
  if(c.tier===3)return h+`<div class="sub" style="color:${c.acc}">You are a ${c.name}. The stars remember your name.</div>`;
  const why=job3Why(),T=trial3Of(),next=c.tier===2?job3From(P.cls):[];
  h+=`<div class="sub">Reborn heroes with an advanced calling at job level ${JOB3_LV} and base level ${JOB3_BASE_LV} can rise into a master calling.</div>`;
  if(next.length)h+=`<div class="ds" style="margin:6px 0">${next.map(id=>`<b style="color:${CLASSES[id].acc}">${CLASSES[id].name}</b>: ${CLASSES[id].desc} New skills: ${CLASSES[id].own.map(s=>SKILLS[s].name).join(', ')}.`).join('<br>')}</div>`;
  if(why)return h+`<div class="sub muted">${esc(why)}</div>`;
  if(!P.trial3)return h+trialRowHtml('The trial',T,null,JOB3_GOLD,`<button class="btn small" data-act="trial3">Accept trial</button>`);
  h+=trialRowHtml('The trial',T,P.trial3.have,JOB3_GOLD);
  if(trial3Done())h+=`<div class="choice">`+next.map(id=>`<button data-act="ascend" data-arg="${id}"><b style="color:${CLASSES[id].acc}">Become a ${CLASSES[id].name}</b><small>${CLASSES[id].desc}</small></button>`).join('')+`</div>`;
  return h;}
if(typeof PANELS!=='undefined'&&PANELS.rebirth){const _rb=PANELS.rebirth;PANELS.rebirth=function(){return _rb.apply(this,arguments)+ascensionHtml();};}
PANEL_ACTS.trial3=()=>{if(P.trial3||job3Why())return;P.trial3={have:0};const T=trial3Of();
  addLog(`Ascension trial accepted: defeat ${T.need} ${MOBS[T.mob].name} and bring ${T.items} ${ITEMS[T.item].name} to Seer Valen.`,'l-good');sfx('click');refreshPanel();save();};
PANEL_ACTS.ascend=arg=>{if(!trial3Done()||!JOB3[arg]||JOB3[arg].from!==P.cls)return;const T=trial3Of(),k=CLASSES[arg];
  takeItem(T.item,T.items);P.gold-=JOB3_GOLD;P.trial3=null;P.cls=arg;P.jl=1;P.jexp=0;NET.lastSent='';NET.sendT=0;
  fx.push({k:'lvpillar',o:P,x:P.x,y:P.y,t0:now,dur:3});fx.push({k:'lvl',x:P.x,y:P.y,t0:now,dur:2.4,txt:k.name.toUpperCase(),col:k.acc});sfx('fanfare');announce('job',arg);
  if(typeof showBanner==='function')showBanner(k.name,`${P.name} has ascended`);
  addLog(`You are now a ${k.name}! You keep every skill. New ones are waiting in the skill tree (K): ${k.own.map(s=>SKILLS[s].name).join(', ')}.`,'l-rare');
  S=computeStats();rebuildHotbar();refreshPanel();save(true);};
// skill tree: three groups for a master calling
{const _st=skillTreeHtml;skillTreeHtml=function(){const c=CLASSES[P.cls];if(!c||c.tier!==3)return _st.apply(this,arguments);const p=CLASSES[c.parent];
  const own3=new Set(c.own),own2=new Set(p.own),first=c.skills.filter(s=>!own3.has(s)&&!own2.has(s));
  return `<h2>Skill tree</h2><div class="sub">${c.name} · Skill points: <span class="gold">${P.skillPts}</span> · press 1–4 under a learned skill to put it on that hotbar key · right-click a hotbar skill (or Shift+1–4) to cast it at a lower level</div>`+
    `<h3>${CLASSES[c.base].name} skills</h3>`+skillTiers(first)+`<h3 style="color:${p.acc}">${p.name} skills</h3>`+skillTiers(p.own)+`<h3 style="color:${c.acc}">${c.name} skills</h3>`+skillTiers(c.own);};}
// a master calling wears its advanced mantle plus a gold-trimmed collar and a small crest
{const _dm=drawJobMantle;drawJobMantle=function(c,x,y,face,back){if(!c||c.tier!==3)return _dm.apply(this,arguments);
  _dm.call(this,{...c,tier:2},x,y,face,back);const by=y-7;ctx.lineWidth=1.2;ctx.strokeStyle='#2a1c14';
  ctx.fillStyle='#ffd76a';for(const k of [-1,1]){ctx.beginPath();ctx.arc(x+k*10,by-10.5,1.7,0,7);ctx.fill();ctx.stroke();}
  if(!back){ctx.fillStyle=c.acc;ctx.beginPath();ctx.moveTo(x,by-12);ctx.lineTo(x+2.6,by-9);ctx.lineTo(x,by-6);ctx.lineTo(x-2.6,by-9);ctx.closePath();ctx.fill();ctx.stroke();}};}
