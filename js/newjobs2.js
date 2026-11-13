"use strict";
/* ================= a third advanced calling for every first job =================
     Warden   -> Runeguard     (master: Runelord)    rune knight: fire, frost and storm carved into each blow (STR/INT)
     Arcanist -> Chronomancer  (master: Timeweaver)  time magic: haste, stasis, bolts that strike twice (INT/DEX)
     Ranger   -> Falconer      (master: Skywarden)   a falcon that strikes, dives and joins your attacks (DEX/AGI)
     Cleric   -> Ascetic       (master: Lotus Sage)  a fighting monk: palms, chi and flurries (STR/AGI/VIT)
   Loaded after js/builds2.js and before js/jobs3.js; the master callings are made in js/newjobs3.js. They use the
   same trials as the other advanced callings of their job (Guildmaster Corvin) and of ascension (Seer Valen). */
const NJ_SKILLS={
  // ---- Runeguard
  runestrike:{name:'Rune Strike',max:10,col:'#ff8a4a',g:'ᚱ',sp:l=>10+l,cd:1,kind:'target',range:55,
    desc:l=>`Strike with a burning rune: ${150+l*25}% ATK as Fire damage plus ${l*10}% MATK.`,
    run:(l,t)=>{dealPhys(t,1.5+l*.25,{el:'fire',sure:true});if(l&&!t.dead)dealMag(t,l*.1,'fire');}},
  frostrune:{name:'Frost Rune',max:10,col:'#8fd0f0',g:'ᛁ',sp:l=>16+l*2,cd:4,kind:'self',
    desc:l=>`Slam a frost rune into the ground: ${120+l*20}% ATK as Water damage to every foe within 90px, slowed for 3s.`,
    run:l=>aoe(P.x,P.y,90,m=>{dealPhys(m,1.2+l*.2,{el:'water',sure:true});slowMob(m,3);})},
  runeward:{name:'Rune Ward',max:10,col:'#7fd3ff',g:'ᛉ',sp:l=>30,cd:30,kind:'self',desc:l=>`For 60s: +${l*6} DEF and +${l*5}% MATK.`,
    run:l=>buff('runeward','Rune Ward',60,{def:l*6,matkpct:l*5})},
  runiclore:{name:'Runic Lore',max:10,col:'#9fb8ff',g:'ᚨ',...PASSIVE(),desc:l=>`+${l*2}% ATK and +${l*2}% MATK.`},
  stormbrand:{name:'Stormbrand',max:10,col:'#c8b0ff',g:'ᛊ',sp:l=>14+l,cd:2.5,kind:'target',range:55,
    desc:l=>`A storm-branded cut for ${180+l*30}% ATK plus 1% per INT as Wind damage that never misses.`,
    run:(l,t)=>dealPhys(t,1.8+l*.3+S.int*.01,{el:'wind',sure:true})},
  // ---- Runelord
  runeburst:{name:'Rune Burst',max:10,col:'#ffd27a',g:'ᛟ',sp:l=>40+l*3,cd:5,kind:'self',
    desc:l=>`Every rune bursts at once: ${220+l*30}% ATK plus ${l*15}% MATK to all within 120px, in fire, water and wind.`,
    run:l=>{let i=0;aoe(P.x,P.y,120,m=>{const el=['fire','water','wind'][i++%3];dealPhys(m,2.2+l*.3,{el,sure:true});if(!m.dead)dealMag(m,l*.15,el);});}},
  elementalavatar:{name:'Elemental Avatar',max:10,col:'#ffb070',g:'✺',sp:l=>45,cd:60,kind:'self',
    desc:l=>`For 45s: +${l*3}% ATK, +${l*3}% MATK and +${l*2}% attack speed.`,run:l=>buff('elementalavatar','Elemental Avatar',45,{atkpct:l*3,matkpct:l*3,aspd:l*2})},
  runemastery:{name:'Rune Mastery',max:10,col:'#bfefff',g:'ᛞ',...PASSIVE(),desc:l=>`+${l} CRIT and +${l*2}% critical damage.`},
  worldrune:{name:'World Rune',max:10,col:'#c8964a',g:'ᛜ',sp:l=>50+l*4,cd:7,kind:'area',range:200,radius:110,
    desc:l=>`Carve a world rune: ${300+l*40}% ATK plus 1% per INT as Earth damage to all within 110px, ${20+l*3}% chance to stun for 2s.`,
    run:(l,x,y)=>aoe(x,y,110,m=>dealPhys(m,3+l*.4+S.int*.01,{el:'earth',sure:true,ail:['stun',.2+l*.03,2]}))},
  // ---- Chronomancer
  timebolt:{name:'Time Bolt',max:10,col:'#ffd27a',g:'⧗',sp:l=>8+l,cd:.8,kind:'target',range:230,
    desc:l=>`A bolt from a moment ago: ${150+l*28}% MATK, ${10+l*3}% chance to stun for 1s.`,
    run:(l,t)=>shoot(P,t,'orb','#ffd27a',()=>dealMag(t,1.5+l*.28,'neutral',['stun',.1+l*.03,1]))},
  haste:{name:'Haste',max:10,col:'#fff0a0',g:'»',sp:l=>30,cd:30,kind:'self',desc:l=>`For 60s: +${l*4}% attack speed and spells cast ${l*3}% faster.`,
    run:l=>buff('haste','Haste',60,{aspd:l*4,cast:l*3})},
  stasis:{name:'Stasis',max:10,col:'#bfe6ff',g:'⌛',sp:l=>18,cd:8,kind:'target',range:230,desc:l=>`Freeze a monster in time for ${(2+l*.3).toFixed(1)}s.`,
    run:(l,t)=>ailMob(t,'freeze',2+l*.3)},
  temporalflow:{name:'Temporal Flow',max:10,col:'#e8d090',g:'∞',...PASSIVE(),desc:l=>`+${(l*.4).toFixed(1)} SP regen per second and spells cast ${l*2}% faster.`},
  echobolt:{name:'Echo Bolt',max:10,col:'#f0e0a0',g:'⇶',sp:l=>14+l*2,cd:2,kind:'target',range:230,
    desc:l=>`A bolt that strikes twice: ${100+l*18}% MATK plus 1% per DEX, then the same again a moment later.`,
    run:(l,t)=>{const m=1+l*.18+S.dex*.01;shoot(P,t,'orb','#f0e0a0',()=>dealMag(t,m));setTimeout(()=>{if(P&&!t.dead)shoot(P,t,'orb','#fff6c0',()=>dealMag(t,m));},260);}},
  // ---- Timeweaver
  timestop:{name:'Time Stop',max:10,col:'#fff6c0',g:'◷',sp:l=>60,cd:40,kind:'self',desc:l=>`Stop time for every monster within 150px for ${(2+l*.3).toFixed(1)}s.`,
    run:l=>aoe(P.x,P.y,150,m=>ailMob(m,'freeze',2+l*.3))},
  paradox:{name:'Paradox',max:10,col:'#ffe08a',g:'⟲',sp:l=>30+l*3,cd:3,kind:'target',range:240,desc:l=>`A bolt that already hit: ${350+l*45}% MATK plus 1% per INT.`,
    run:(l,t)=>dealMag(t,3.5+l*.45+S.int*.01)},
  eternity:{name:'Eternity',max:10,col:'#e8d090',g:'⌘',...PASSIVE(),desc:l=>`+${l*3}% MATK and +${l*2}% max SP.`},
  moments:{name:'Thousand Moments',max:10,col:'#fff0a0',g:'⁂',sp:l=>45+l*4,cd:6,kind:'area',range:250,radius:120,
    desc:l=>`Many moments strike the target's area: ${120+l*15}% MATK to all within 120px, three times.`,
    run:(l,x,y)=>{for(let k=0;k<3;k++)setTimeout(()=>{if(P)aoe(x,y,120,m=>dealMag(m,1.2+l*.15));},k*220);}},
  // ---- Falconer
  falconstrike:{name:'Falcon Strike',max:10,col:'#e8c070',g:'⋎',sp:l=>8+l,cd:.8,kind:'target',range:260,
    desc:l=>`Send the falcon: ${130+l*25}% ATK plus 1% per AGI that never misses.`,run:(l,t)=>falconHit(t,1.3+l*.25+S.agi*.01)},
  falcondive:{name:'Falcon Dive',max:10,col:'#d8a050',g:'⇓',sp:l=>18+l*2,cd:3,kind:'area',range:260,radius:90,
    desc:l=>`The falcon dives: ${150+l*25}% ATK to all within 90px.`,run:(l,x,y)=>aoe(x,y,90,m=>dealPhys(m,1.5+l*.25,{sure:true}))},
  eaglecall:{name:"Eagle's Call",max:10,col:'#ffe08a',g:'⌃',sp:l=>25,cd:30,kind:'self',desc:l=>`For 90s: +${l*3} DEX, +${l*2} AGI and +${l*2} HIT.`,
    run:l=>buff('eaglecall',"Eagle's Call",90,{dex:l*3,agi:l*2,hit:l*2})},
  keentalon:{name:'Keen Talon',max:10,col:'#c8a060',g:'⌇',...PASSIVE(),desc:l=>`${l*3}% chance that the falcon joins a normal attack for ${50+l*10}% ATK.`},
  raptorstorm:{name:'Raptor Storm',max:10,col:'#f0b060',g:'≋',sp:l=>20+l*2,cd:4,kind:'target',range:260,
    desc:l=>`The falcon strikes ${2+Math.floor(l/3)} times, each ${90+l*15}% ATK plus 1% per DEX.`,
    run:(l,t)=>{for(let k=0;k<2+Math.floor(l/3);k++)setTimeout(()=>{if(P&&!t.dead)falconHit(t,.9+l*.15+S.dex*.01);},k*170);}},
  // ---- Skywarden
  talonstorm:{name:'Talon Storm',max:10,col:'#ffd27a',g:'⋙',sp:l=>40+l*4,cd:5,kind:'area',range:280,radius:140,
    desc:l=>`A storm of talons: ${160+l*25}% ATK to all within 140px, twice.`,run:(l,x,y)=>{for(let k=0;k<2;k++)setTimeout(()=>{if(P)aoe(x,y,140,m=>dealPhys(m,1.6+l*.25,{sure:true}));},k*260);}},
  skydominion:{name:'Sky Dominion',max:10,col:'#fff0a0',g:'☁',sp:l=>40,cd:45,kind:'self',desc:l=>`For 60s: the falcon joins every normal attack and +${l*3}% attack speed.`,
    run:l=>buff('skydominion','Sky Dominion',60,{aspd:l*3,falc:100})},
  apexhunter:{name:'Apex Hunter',max:10,col:'#e8c070',g:'♛',...PASSIVE(),desc:l=>`+${l*2} CRIT and +${l*3}% critical damage.`},
  skyfall:{name:'Skyfall',max:10,col:'#ffe08a',g:'⇣',sp:l=>35+l*3,cd:6,kind:'target',range:300,desc:l=>`The falcon falls from the sky: ${400+l*50}% ATK plus 2% per AGI that never misses.`,
    run:(l,t)=>falconHit(t,4+l*.5+S.agi*.02,true)},
  // ---- Ascetic
  palmstrike:{name:'Palm Strike',max:10,col:'#ffb070',g:'✋',sp:l=>7+l,cd:.7,kind:'target',range:55,
    desc:l=>`A chi-charged palm for ${140+l*25}% ATK plus 1% per STR that never misses.`,run:(l,t)=>dealPhys(t,1.4+l*.25+S.str*.01,{sure:true})},
  chiburst:{name:'Chi Burst',max:10,col:'#fff0a0',g:'☯',sp:l=>18+l*2,cd:3,kind:'self',
    desc:l=>`Release chi: ${100+l*20}% MATK as Holy damage to every foe within 90px, and heal ${l*2}% of max HP.`,
    run:l=>{aoe(P.x,P.y,90,m=>dealMag(m,1+l*.2,'holy'));healP(S.maxhp*l*.02);}},
  ironbody:{name:'Iron Body',max:10,col:'#c8b090',g:'◈',sp:l=>30,cd:30,kind:'self',desc:l=>`For 60s: take ${l*2}% less damage and +${l*3} VIT.`,
    run:l=>buff('ironbody','Iron Body',60,{dmgred:l*2,vit:l*3})},
  innercalm:{name:'Inner Calm',max:10,col:'#9fe0c0',g:'◌',...PASSIVE(),desc:l=>`+${l*3}% attack speed and +${(l*.3).toFixed(1)} SP regen per second.`},
  flurry:{name:'Flurry',max:10,col:'#ffd0a0',g:'≡',sp:l=>14+l*2,cd:2,kind:'target',range:55,
    desc:l=>`A flurry of ${3+Math.floor(l/4)} blows, each ${70+l*12}% ATK plus 1% per AGI.`,
    run:(l,t)=>{for(let k=0;k<3+Math.floor(l/4);k++)setTimeout(()=>{if(P&&!t.dead)dealPhys(t,.7+l*.12+S.agi*.01);},k*90);}},
  // ---- Lotus Sage
  hundredpalms:{name:'Hundred Palms',max:10,col:'#ffcf8a',g:'✺',sp:l=>35+l*3,cd:5,kind:'target',range:55,
    desc:l=>`A hundred palms in a heartbeat: ${8+l} blows, each ${60+l*10}% ATK.`,
    run:(l,t)=>{for(let k=0;k<8+l;k++)setTimeout(()=>{if(P&&!t.dead)dealPhys(t,.6+l*.1,{sure:true});},k*55);}},
  lotusbloom:{name:'Lotus Bloom',max:10,col:'#ffb0d0',g:'❀',sp:l=>40,cd:30,kind:'self',desc:l=>`Heal ${10+l*2}% of max HP, and for 30s regain ${l*4} HP every second.`,
    run:l=>{healP(S.maxhp*(10+l*2)/100);buff('lotusbloom','Lotus Bloom',30,{regen:l*4});}},
  stillmind:{name:'Still Mind',max:10,col:'#cfe8ff',g:'○',...PASSIVE(),desc:l=>`Take ${l}% less damage and +${l*2}% ATK.`},
  heavenfist:{name:'Heaven Fist',max:10,col:'#fff6c0',g:'☝',sp:l=>40+l*3,cd:6,kind:'target',range:55,
    desc:l=>`A strike that reaches the heavens: ${380+l*45}% ATK plus 1% per STR as Holy damage.`,run:(l,t)=>dealPhys(t,3.8+l*.45+S.str*.01,{el:'holy',sure:true})},
};
Object.assign(SKILLS,NJ_SKILLS);
Object.assign(SKILL_REQ,{frostrune:{runestrike:3},runeward:{runestrike:5},stormbrand:{runiclore:3},elementalavatar:{runeburst:3},worldrune:{runemastery:3},
  haste:{timebolt:3},stasis:{timebolt:5},echobolt:{temporalflow:3},timestop:{eternity:3},moments:{paradox:3},
  falcondive:{falconstrike:3},eaglecall:{falconstrike:1},raptorstorm:{keentalon:3},skydominion:{talonstorm:3},skyfall:{apexhunter:3},
  chiburst:{palmstrike:3},ironbody:{palmstrike:1},flurry:{innercalm:3},lotusbloom:{hundredpalms:3},heavenfist:{stillmind:3}});
Object.assign(SKILL_ELEM,{runestrike:'fire',frostrune:'water',stormbrand:'wind',worldrune:'earth',chiburst:'holy',heavenfist:'holy'});
Object.assign(CAST,{timebolt:.5,echobolt:.6,paradox:.8,moments:1});
PASSIVE_MORE.push((add,L,wt)=>{add('atkpct',L('runiclore')*2);add('matkpct',L('runiclore')*2);add('crit',L('runemastery'));add('critdmg',L('runemastery')*2);
  add('spregen',L('temporalflow')*.4);add('cast',L('temporalflow')*2);add('matkpct',L('eternity')*3);add('sppct',L('eternity')*2);
  add('crit',L('apexhunter')*2);add('critdmg',L('apexhunter')*3);add('aspd',L('innercalm')*3);add('spregen',L('innercalm')*.3);add('dmgred',L('stillmind'));add('atkpct',L('stillmind')*2);});

// the falcon: a swoop from above onto the target, then the hit
function falconHit(t,mult,big){if(!t||t.dead)return;const s=t.d?t.d.size:14;
  fx.push({k:'streak',x0:t.x-60,y0:t.y-120,x:t.x,y:t.y,col:'#e8c070',w:big?12:7,dur:.25,t0:now,seed:1});
  if(big)fx.push({k:'flare',x:t.x,y:t.y,col:'#ffe08a',r:70,dur:.4,t0:now+.12,h:s});
  setTimeout(()=>{if(P&&!t.dead)dealPhys(t,mult,{sure:true});},120);}
// Keen Talon / Sky Dominion: the falcon joins normal attacks
{const _baFal=basicAttack;basicAttack=function(t){const r=_baFal.apply(this,arguments);try{const l=P.skills.keentalon||0,dom=P.buffs.skydominion&&P.buffs.skydominion.until>now;
  if(t&&!t.dead&&(dom||(l&&Math.random()*100<l*3)))setTimeout(()=>falconHit(t,.5+l*.1),180);}catch(e){}return r;};}

const NJ2={
  runeguard:{base:'warden',name:'Runeguard',hp:1.7,sp:1.2,aspd:.9,col:'#4a5a7a',acc:'#7fd3ff',
    desc:'A rune-scribed knight. Fire, frost and storm ride along with every blow; INT makes the runes burn hotter.',skills:['runestrike','frostrune','runeward','runiclore','stormbrand']},
  chronomancer:{base:'arcanist',name:'Chronomancer',hp:.95,sp:2.2,aspd:1.05,col:'#6a5a2a',acc:'#ffd27a',
    desc:'A keeper of moments. Hastens itself, freezes foes in time and strikes twice in the same instant.',skills:['timebolt','haste','stasis','temporalflow','echobolt']},
  falconer:{base:'ranger',name:'Falconer',hp:1.2,sp:1.2,aspd:.82,col:'#6a4a2a',acc:'#e8c070',
    desc:'Hunts with a falcon. The bird strikes on its own, dives on whole packs and joins your arrows.',skills:['falconstrike','falcondive','eaglecall','keentalon','raptorstorm']},
  ascetic:{base:'cleric',name:'Ascetic',hp:1.5,sp:1.4,aspd:.82,col:'#8a5a2a',acc:'#ffb070',
    desc:'A fighting monk. Fast flurries up close, chi that burns and heals, and a body like iron.',skills:['palmstrike','chiburst','ironbody','innercalm','flurry']}};
for(const id in NJ2){const j=NJ2[id],b=CLASSES[j.base];JOB2[id]={...j,skills:j.skills};
  CLASSES[id]={name:j.name,hp:j.hp,sp:j.sp,aspd:j.aspd,weapons:b.weapons,col:j.col,hair:b.hair,magic:b.magic,base:j.base,tier:2,acc:j.acc,
    desc:j.desc,own:JOB2[id].skills,skills:[...b.skills.filter(s=>s!=='firstaid'),...j.skills,'firstaid']};}
