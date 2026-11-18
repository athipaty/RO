"use strict";
/* ================= the Shade's advanced callings (v1.19.0) =================
     Shade -> Nightblade   (Edge path)    an assassin: huge critical strikes on one target
     Shade -> Venomancer   (Venom path)   poison: every cut festers, venom clouds wear packs down
     Shade -> Phantom      (both paths)   a blur of mirrors: dodging, a shadow double that copies attacks
   Five skills each, like the third callings in js/newjobs2.js. Corvin's trial for a Job Lv 40 Shade: 25 Gloomcaps in
   the Mossdeep Caverns and 10 Gloom Spores. The first-job paths (Edge, Venom) are in js/jobpaths.js; looks, effects
   and attack styles in js/shade2fx.js; Thai skill texts in js/i18n-game.js. No master calling yet (they are sealed).
   Loaded after js/newjobs2.js and before js/jobpaths.js. */
const SH2_SKILLS={
  // ---- Nightblade
  mortalcut:{name:'Mortal Cut',max:10,col:'#ff5a7a',g:'✕',sp:l=>12+l*2,cd:1.2,kind:'target',range:55,
    desc:l=>`A killing cut for ${200+l*35}% ATK with ${20+l*4}% more critical chance. Never misses.`,
    run:(l,t)=>dealPhys(t,2+l*.35,{sure:true,critPlus:20+l*4})},
  shadowleap:{name:'Shadow Leap',max:10,col:'#c890a8',g:'⤳',sp:l=>14+l,cd:3,kind:'target',range:200,
    desc:l=>`Your shadow leaps at the target and strikes for ${160+l*25}% ATK plus 1% per AGI. Never misses.`,
    run:(l,t)=>dealPhys(t,1.6+l*.25+S.agi*.01,{sure:true})},
  killingintent:{name:'Killing Intent',max:10,col:'#ff7a8a',g:'☍',sp:l=>30,cd:30,kind:'self',
    desc:l=>`For 45s: +${l*2} CRIT and +${l*4}% critical damage.`,run:l=>buff('killingintent','Killing Intent',45,{crit:l*2,critdmg:l*4})},
  edgemastery:{name:'Edge Mastery',max:10,col:'#e8b0c0',g:'⚔',...PASSIVE(),desc:l=>`With a dagger: +${l*3} ATK and +${l*3}% critical damage.`},
  fanofblades:{name:'Fan of Blades',max:10,col:'#ffa0b0',g:'✷',sp:l=>20+l*2,cd:3,kind:'self',
    desc:l=>`Spin and throw blades all around: ${140+l*25}% ATK to every foe within 100px, with ${10+l*2}% more critical chance.`,
    run:l=>aoe(P.x,P.y,100,m=>dealPhys(m,1.4+l*.25,{sure:true,critPlus:10+l*2}))},
  // ---- Venomancer
  toxicfang:{name:'Toxic Fang',max:10,col:'#9be35a',g:'☣',sp:l=>8+l,cd:.9,kind:'target',range:55,
    desc:l=>`A venomous bite for ${120+l*20}% ATK (Earth), then poison deals ${30+l*5}% ATK every second for 5s.`,
    run:(l,t)=>{dealPhys(t,1.2+l*.2,{sure:true,el:'earth'});sh2Poison(t,.3+l*.05,5);}},
  miasma:{name:'Miasma',max:10,col:'#7ac850',g:'☁',sp:l=>24+l*3,cd:5,kind:'area',range:220,radius:100,
    desc:l=>`A cloud of venom on the target's area: ${50+l*10}% ATK (Earth) to all within 100px every second for 4s, and they are slowed.`,
    run:(l,x,y)=>{for(let k=0;k<4;k++)setTimeout(()=>{if(!P||P.dead)return;aoe(x,y,100,m=>{dealPhys(m,(.5+l*.1)*sh2Tox(),{sure:true,el:'earth'});slowMob(m,1.2);});},k*1000);}},
  venomcoat:{name:'Venom Coat',max:10,col:'#b8f080',g:'◍',sp:l=>28,cd:30,kind:'self',
    desc:l=>`For 60s: +${l*4}% ATK, and normal attacks have ${l*4}% chance to poison for ${40+l*6}% ATK three times.`,
    run:l=>buff('venomcoat','Venom Coat',60,{atkpct:l*4})},
  toxicology:{name:'Toxicology',max:10,col:'#c8e8a0',g:'⚗',...PASSIVE(),desc:l=>`+${l*2}% ATK, and your poisons deal ${l*5}% more damage.`},
  plagueburst:{name:'Plague Burst',max:10,col:'#d0ff70',g:'✹',sp:l=>26+l*3,cd:4,kind:'target',range:55,
    desc:l=>`Make the venom inside a monster burst: ${250+l*40}% ATK (Earth) to it and ${100+l*15}% ATK to everything within 80px of it.`,
    run:(l,t)=>{const x=t.x,y=t.y;dealPhys(t,(2.5+l*.4)*sh2Tox(),{sure:true,el:'earth'});aoe(x,y,80,m=>{if(m!==t)dealPhys(m,(1+l*.15)*sh2Tox(),{sure:true,el:'earth'});});}},
  // ---- Phantom
  phantomedge:{name:'Phantom Edge',max:10,col:'#a8c8ff',g:'⫽',sp:l=>10+l,cd:1,kind:'target',range:55,
    desc:l=>`Strike from two places at once: ${110+l*18}% ATK plus 1% per AGI, twice. Never misses.`,
    run:(l,t)=>{const m=1.1+l*.18+S.agi*.01;dealPhys(t,m,{sure:true});setTimeout(()=>{if(P&&t&&!t.dead&&mobs.includes(t))dealPhys(t,m,{sure:true});},150);}},
  mirage:{name:'Mirage',max:10,col:'#c8d8ff',g:'◇',sp:l=>24,cd:30,kind:'self',
    desc:l=>`For 30s: +${20+l*5} FLEE and take ${l*2}% less damage.`,run:l=>buff('mirage','Mirage',30,{flee:20+l*5,dmgred:l*2})},
  shadowdouble:{name:'Shadow Double',max:10,col:'#8890c8',g:'⧉',sp:l=>32,cd:40,kind:'self',
    desc:l=>`For 45s a shadow double copies your normal attacks for ${40+l*6}% ATK.`,run:l=>buff('shadowdouble','Shadow Double',45,{atk:0})},
  umbralgrace:{name:'Umbral Grace',max:10,col:'#b0b8e8',g:'◑',...PASSIVE(),desc:l=>`+${l*2} FLEE and +${l*2}% attack speed.`},
  shadowwaltz:{name:'Shadow Waltz',max:10,col:'#9aa8ff',g:'∿',sp:l=>22+l*2,cd:4,kind:'target',range:55,
    desc:l=>`Dance through up to ${2+Math.floor(l/4)} foes near the target: ${120+l*20}% ATK plus 1% per AGI to each.`,
    run:(l,t)=>{const n=2+Math.floor(l/4),near=mobs.filter(m=>!m.dead&&m!==t&&Math.hypot(m.x-t.x,m.y-t.y)<120).slice(0,n-1),list=[t,...near];
      list.forEach((m,k)=>setTimeout(()=>{if(P&&!m.dead&&mobs.includes(m)){fx.push({k:'ring',x:m.x,y:m.y,r:22,col:'#9aa8ff',t0:now,dur:.3});dealPhys(m,1.2+l*.2+S.agi*.01,{sure:true});}},k*130));}},
};
Object.assign(SKILLS,SH2_SKILLS);
Object.assign(SKILL_REQ,{shadowleap:{mortalcut:3},killingintent:{mortalcut:1},fanofblades:{edgemastery:3},
  miasma:{toxicfang:3},venomcoat:{toxicfang:1},plagueburst:{toxicology:3},
  mirage:{phantomedge:1},shadowdouble:{phantomedge:3},shadowwaltz:{umbralgrace:3}});
Object.assign(SKILL_ELEM,{toxicfang:'earth',miasma:'earth',plagueburst:'earth'});
PASSIVE_MORE.push((add,L,wt)=>{if(wt==='dagger'){add('atk',L('edgemastery')*3);add('critdmg',L('edgemastery')*3);}
  add('atkpct',L('toxicology')*2);add('flee',L('umbralgrace')*2);add('aspd',L('umbralgrace')*2);});

// poison: ticks once a second while the monster lives; Toxicology makes every poison stronger
const sh2Tox=()=>1+((P&&P.skills&&P.skills.toxicology)||0)*.05;
function sh2Poison(t,mult,n){for(let k=1;k<=n;k++)setTimeout(()=>{if(!t||t.dead||!mobs.includes(t)||!P||P.dead)return;
  dealPhys(t,mult*sh2Tox(),{sure:true,el:'earth'});fx.push({k:'ring',x:t.x,y:t.y,r:16,col:'#9be35a',t0:now,dur:.35});},k*1000);}
// Venom Coat poisons and the Shadow Double copies normal attacks
{const _baSh2=basicAttack;basicAttack=function(t){const r=_baSh2.apply(this,arguments);try{const on=id=>P.buffs[id]&&P.buffs[id].until>now;
  if(t&&!t.dead){const vc=P.skills.venomcoat||0;if(vc&&on('venomcoat')&&Math.random()*100<vc*4)sh2Poison(t,.4+vc*.06,3);
    const sd=P.skills.shadowdouble||0;if(sd&&on('shadowdouble'))setTimeout(()=>{if(P&&!t.dead&&mobs.includes(t)){fx.push({k:'ring',x:t.x,y:t.y,r:20,col:'#8890c8',t0:now,dur:.3});dealPhys(t,.4+sd*.06);}},160);}}catch(e){}return r;};}

const SH2={
  nightblade:{base:'shade',name:'Nightblade',hp:1.15,sp:1.05,aspd:.7,col:'#2a2236',acc:'#ff5a7a',
    desc:'An assassin of the night. Enormous critical strikes on a single target, and a shadow that leaps to finish it.',skills:['mortalcut','shadowleap','killingintent','edgemastery','fanofblades']},
  venomancer:{base:'shade',name:'Venomancer',hp:1.2,sp:1.15,aspd:.74,col:'#3a4a2a',acc:'#9be35a',
    desc:'A master of poison. Every cut festers, venom clouds wear whole packs down, and the poison can be made to burst.',skills:['toxicfang','miasma','venomcoat','toxicology','plagueburst']},
  phantom:{base:'shade',name:'Phantom',hp:1.15,sp:1.1,aspd:.68,col:'#3a3a5a',acc:'#a8c8ff',
    desc:'A blur of shadow and mirrors. Blows pass straight through it, and a shadow double fights at its side.',skills:['phantomedge','mirage','shadowdouble','umbralgrace','shadowwaltz']}};
for(const id in SH2){const j=SH2[id],b=CLASSES[j.base];JOB2[id]={...j,skills:j.skills};
  CLASSES[id]={name:j.name,hp:j.hp,sp:j.sp,aspd:j.aspd,weapons:b.weapons,col:j.col,hair:b.hair,magic:b.magic,base:j.base,tier:2,acc:j.acc,
    desc:j.desc,own:JOB2[id].skills,skills:[...b.skills.filter(s=>s!=='firstaid'),...j.skills,'firstaid']};}

// Corvin's trial for a Job Lv 40 Shade
TRIALS.shade={mob:'gloomcap',need:25,item:'gloomspore',items:10,gold:5000,
  say:'A Shade belongs to the dark. Go down into the Mossdeep Caverns, cut down the Gloomcaps before they ever see you, and bring me their spores.'};

if(typeof TH!=='undefined')Object.assign(TH,{
  'An assassin of the night. Enormous critical strikes on a single target, and a shadow that leaps to finish it.':'นักฆ่าแห่งรัตติกาล โจมตีคริติคอลมหาศาลใส่เป้าหมายเดียว และเงาที่กระโจนไปปลิดชีพ',
  'A master of poison. Every cut festers, venom clouds wear whole packs down, and the poison can be made to burst.':'ปรมาจารย์แห่งพิษ ทุกบาดแผลเน่าเปื่อย หมอกพิษกัดกร่อนมอนสเตอร์ทั้งฝูง และสั่งให้พิษระเบิดได้',
  'A blur of shadow and mirrors. Blows pass straight through it, and a shadow double fights at its side.':'เงาพร่าเลือนดั่งภาพในกระจก การโจมตีทะลุผ่านตัวไป และมีร่างเงาคอยสู้เคียงข้าง',
  'A Shade belongs to the dark. Go down into the Mossdeep Caverns, cut down the Gloomcaps before they ever see you, and bring me their spores.':
    'ชาโดว์อยู่คู่กับความมืด ลงไปในถ้ำมอสดีป ฟันพวกกลูมแคปก่อนที่มันจะทันเห็นเจ้า แล้วนำสปอร์ของพวกมันมาให้ข้า'});
