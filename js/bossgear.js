"use strict";
/* ================= boss relics: what a boss drops beats what a shop sells (v1.49.0) =================
   Before, bosses dropped only hats and trinkets, and the best weapon or armour for any level was always a shop piece.
   Now every boss from Lv 30 also has a relic, a weapon or armour about 25-40% above the shop piece of its level band
   (often above the next tier too), with bonuses that fit the boss, two sigil slots, a level a little below the boss's,
   and a 10% drop chance. Some weak boss hats and trinkets are lifted too.
   tools/export-world.js runs this file too, so the game server drops the relics. */
const RELICS={
  // id: [boss, item]
  scarabshell:['scarabqueen',{name:"Scarab Queen's Shell",type:'armor',def:52,b:{vit:3,dmgred:4},lv:28,col:'#5ac0a0'}],
  antlerbow:['antlerking',{name:'Antlerhorn Bow',type:'weapon',wt:'bow',atk:112,b:{dex:3,crit:4},lv:30,col:'#c8a070'}],
  oathkeeper:['fallenpaladin',{name:'Oathkeeper',type:'weapon',wt:'sword',atk:150,b:{vit:3,healpct:10},lv:34,col:'#f0e0a0'}],
  gloomstaff:['gloomking',{name:'Gloomcrown Staff',type:'weapon',wt:'wand',atk:16,matk:140,b:{int:3,cast:8},lv:35,col:'#8a6ad8'}],
  warcleaver:['warlord',{name:"Warlord's Cleaver",type:'weapon',wt:'axe',atk:200,b:{str:4,atkpct:5},lv:42,col:'#d86040'}],
  orchidscepter:['orchidra',{name:'Orchid Scepter',type:'weapon',wt:'mace',atk:120,matk:120,b:{int:3,healpct:12},lv:46,col:'#e080c0'}],
  frostshroud:['frostmatron',{name:"Frost Matron's Shroud",type:'armor',def:32,b:{int:6,maxsp:120,cast:6},lv:48,col:'#a8e0ff'}],
  geodebulwark:['geodecolossus',{name:'Geode Bulwark',type:'armor',def:88,b:{vit:4,dmgred:5},lv:58,col:'#b090e0'}],
  mirefang:['mirematriarch',{name:'Mirefang',type:'weapon',wt:'dagger',atk:205,b:{agi:4,crit:6},lv:66,col:'#7ab070'}],
  hrimspire:['hrimfang',{name:'Hrimfang Spire',type:'weapon',wt:'wand',atk:30,matk:285,b:{int:5,matkpct:6},lv:74,col:'#c8f0ff'}],
  hollowblade:['hollowking',{name:"Hollow King's Blade",type:'weapon',wt:'sword',atk:315,b:{str:4,int:4,crit:5},lv:76,col:'#9a8ab8'}],
  krakenmaw:['krakenmatron',{name:'Krakenmaw',type:'weapon',wt:'gun',atk:300,rng:265,b:{dex:5,crit:4},lv:78,col:'#4aa0b8'}],
  wyrmaxe:['cinderwyrm',{name:'Wyrmfire Waraxe',type:'weapon',wt:'axe',atk:450,b:{str:5,atkpct:6},lv:88,col:'#ff7030'}],
  // (v1.87.0) axes are the Forgehand's alone: the two axe bosses also drop a sword just as strong for the Warden family
  warblade:['warlord',{name:"Warlord's Greatblade",type:'weapon',wt:'sword',atk:200,b:{str:4,atkpct:5},lv:42,col:'#d86040'}],
  wyrmblade:['cinderwyrm',{name:'Wyrmfire Greatsword',type:'weapon',wt:'sword',atk:450,b:{str:5,atkpct:6},lv:88,col:'#ff7030'}],
  stormbowv:['voltaris',{name:'Voltaris Stormbow',type:'weapon',wt:'bow',atk:320,b:{dex:5,agi:4,aspd:6},lv:90,col:'#ffe060'}],
  dragonplate:['ignarok',{name:'Ignarok Dragonplate',type:'armor',def:140,b:{vit:5,str:4,hppct:8,dmgred:5},lv:95,col:'#e04a2a'}]};
for(const id in RELICS){const [boss,it]=RELICS[id],m=MOBS[boss];
  ITEMS[id]={...it,price:Math.round(it.lv*it.lv*15/100)*100,slots:2,g:it.type==='weapon'?'W':'A',boss:true,
    desc:`Boss relic: dropped only by ${m?m.name.replace(/^The /,'the '):'its boss'}, stronger than any shop piece of its level.`};
  if(typeof LEGENDARY!=='undefined')LEGENDARY.add(id);
  if(m&&m.drops&&!m.drops.some(d=>d[0]===id))m.drops.push([id,.1]);}
// boss hats and trinkets that were weaker than their boss
{const up={frostcap:{def:8,b:{vit:3,maxhp:200,dmgred:3}},turban:{def:4,b:{int:3,maxsp:40}},orchidcharm:{b:{int:5,dex:4,maxsp:100,cast:5}},
  prismheart:{b:{int:4,dex:4,luk:5,crit:6}},krakeneye:{b:{int:6,dex:6,maxsp:150,cast:6}},tempestplume:{def:14,b:{agi:6,dex:6,flee:18,aspd:6}}};
  for(const id in up)if(ITEMS[id])Object.assign(ITEMS[id],up[id]);}
// how the relic weapons look
if(typeof WA!=='undefined'&&typeof waSword==='function'){
  const L={antlerbow:{wood:'#c8a070',grip:'#4a3020',scale:1.1,tip:'#f0e0c0',feather:'#ffffff'},
    stormbowv:{wood:'#ffe060',grip:'#3a3050',scale:1.15,tip:'#ffffff',feather:'#a8d8ff'}};
  for(const id in L)if(typeof WA_BOW!=='undefined')WA_BOW[id]=L[id];
  WA.oathkeeper=()=>waSword({w:4.8,len:26,guard:8,blade:'#f4f0e4',gcol:'#d8b860',gem:'#60a0ff',grip:'#3a2a52',wrap:'#d8b860',pom:'#d8b860',glow:'#fff0b0'});
  WA.hollowblade=()=>waSword({w:5,len:27,guard:7.5,blade:'#c8c0e0',gcol:'#4a3a6a',gem:'#a060ff',grip:'#1a1428',wrap:'#4a3a6a',pom:'#4a3a6a',glow:'#b8a0ff'});
  WA.warblade=()=>waSword({w:5.4,len:28,guard:9,blade:'#d0d4dc',gcol:'#7a2a18',gem:'#ff6040',grip:'#3a1a10',wrap:'#7a2a18',pom:'#7a2a18',glow:'#ff9070'});
  WA.wyrmblade=()=>waSword({w:5.6,len:29,guard:9,blade:'#ffc8a0',gcol:'#3a1a10',gem:'#ff7030',grip:'#2a1008',wrap:'#ff7030',pom:'#ff7030',glow:'#ffb070'});
  WA.mirefang=()=>waSword({w:3.2,len:18,guard:4.5,blade:'#c8e8c0',gcol:'#4a7a40',gem:'#80ff60',grip:'#2a3a20',wrap:'#4a7a40',pom:'#4a7a40',glow:'#a0ff80'});
  if(typeof waAxe==='function'){WA.warcleaver=()=>waAxe({double:true,head:'#c8ccd4',haft:'#5a2a18',len:25});WA.wyrmaxe=()=>waAxe({double:true,head:'#ffb070',haft:'#3a1a10',len:27});}
  if(typeof waMace==='function')WA.orchidscepter=()=>waMace({head:'#c060a0',flange:'#ffd0f0',gem:'#ff80d0',glow:'#ffc0e8'});
  if(typeof waWand==='function'){WA.gloomstaff=()=>waWand({len:23,shaft:'#4a3a6a',spiral:'rgba(200,160,255,.35)',band:'#8a6ad8',prong:'#6a4aa8',crystal:'#c8a8ff',glow:'#b090ff',star:true});
    WA.hrimspire=()=>waWand({len:25,shaft:'#e0f4ff',spiral:'rgba(255,255,255,.4)',band:'#6aa8d8',prong:'#a8d8f0',crystal:'#e0ffff',glow:'#c8f0ff',star:true});}
  if(typeof GUN_ART!=='undefined'&&typeof gunHeld==='function'){GUN_ART.krakenmaw={len:22,barrel:'#a8d8e0',body:'#1a3a48',stock:'#4aa0b8',band:'#e0c060',glow:'#80e0ff'};WA.krakenmaw=gunHeld('krakenmaw');}}
