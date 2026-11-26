"use strict";
/* ================= the forge for every job, all the way up (v1.61.0) =================
   Before, Brannoc's forge had 8 weapons, all between Lv 26 and 44: none at all for daggers (the Shade family) or guns
   (the Gunslinger family), one wand and one axe, and nothing to forge after Lv 44. Now every weapon type has a forged
   weapon at four stages (about Lv 30, 50, 68 and 88), so every job can forge one at each stage.
   Forged weapons sit between the shop and the boss relics: about 10% more ATK / MATK than the shop weapon of the same
   level (worked out from the shop's own curve), a bonus in the family's style, a socket (two from Lv 66), and they cost
   materials from the monsters of that level, so hunting for them is worth it. Boss relics stay the strongest. */
// [id, name, type, level, ATK, MATK, bonus, colour, materials, gold, price]
const FORGE_PLUS=[
  // stage 1 (the two families that had none)
  ['veilkris',"Shadeveil Kris",'dagger',30,80,0,{agi:2,crit:4},'#5a4a7a',{shadeveil:4,batwing:5},7300,9800],
  ['bonemusket',"Bonecrack Musket",'gun',32,111,0,{dex:2,hit:6},'#c8b89a',{bone:5,needle:4},9000,12200],
  // stage 2
  ['rimeaxe',"Glacierbite Axe",'axe',48,178,0,{str:3,atkpct:5},'#a8d8f0',{fur:5,shard:4},25200,34000],
  ['prismstaff',"Prismheart Staff",'wand',50,20,155,{int:3,cast:6},'#d8b8ff',{prismdust:5,quartzchip:4},28300,38300],
  ['viperbow',"Viperstring Bow",'bow',48,126,0,{dex:3,crit:4},'#5a9a4a',{viperfang:6,nectar:3},25200,34000],
  ['jademaul',"Jadeward Maul",'mace',48,114,88,{int:2,healpct:10},'#4ab08a',{jadewart:5,apefur:4},25200,34000],
  ['rimedirk',"Rimetooth Dirk",'dagger',48,112,0,{agi:3,aspd:5},'#cfe3f0',{fang:5,shard:3},25200,34000],
  ['quartzrifle',"Quartzlock Rifle",'gun',50,165,0,{dex:3,crit:4},'#e8e0f8',{quartzchip:5,prismdust:3},28300,38300],
  // stage 3
  ['mantisedge',"Mantisedge",'sword',68,249,0,{str:3,crit:6},'#7ac05a',{mantisblade:6,rimescale:4},61400,83100],
  ['tuskaxe',"Tuskrender Axe",'axe',68,271,0,{str:4,atkpct:6},'#e8dcc8',{walrustusk:6,yetifur:4},61400,83100],
  ['wispstaff',"Wispwood Staff",'wand',66,28,216,{int:4,matkpct:5},'#9fe8c8',{wispglow:6,gloamantler:3},57100,77300],
  ['saltbow',"Saltwind Bow",'bow',68,191,0,{dex:4,critdmg:12},'#e8eef4',{saltfeather:6,glassfang:4},61400,83100],
  ['miremaul',"Mirestone Maul",'mace',66,167,129,{int:3,healpct:12},'#6a7a5a',{mirestone:6,rotspore:4},57100,77300],
  ['silkkris',"Shadowsilk Kris",'dagger',68,170,0,{agi:4,dbl:6},'#3a2a4a',{shadowsilk:6,glassfang:4},61400,83100],
  ['tidecarbine',"Tideshell Carbine",'gun',68,238,0,{dex:4,hit:10},'#5ac8e8',{tideshell:6,lurkerscale:4},61400,83100],
  // stage 4
  ['pyreblade',"Pyreforged Blade",'sword',88,353,0,{str:5,crit:6},'#ff7a3a',{moltensteel:5,pyrecore:4},117000,158300],
  ['giantaxe',"Giantsplitter",'axe',88,384,0,{str:5,atkpct:7},'#8a8070',{giantstone:6,basaltplate:4},117000,158300],
  ['stormscepter',"Stormcore Scepter",'wand',86,39,308,{int:5,cast:8},'#8ab8ff',{stormcore:6,wraithflame:4},110800,149900],
  ['griffinbow',"Griffinwing Bow",'bow',88,271,0,{dex:5,agi:3,crit:5},'#f0d8a0',{griffinplume:6,stormfeather:4},117000,158300],
  ['magmamaul',"Magmaheart Maul",'mace',86,238,184,{int:4,healpct:14},'#e0502a',{magmacore:5,basaltplate:4},110800,149900],
  ['salafang',"Salamander Fang",'dagger',88,241,0,{agi:5,crit:7},'#e8783a',{salascale:6,batwingash:4},117000,158300],
  ['pyrecannon',"Pyre Hand-cannon",'gun',88,338,0,{dex:5,critdmg:15},'#c84a2a',{slugslime:5,pyrecore:4},117000,158300]];
for(const [id,name,wt,lv,atk,matk,b,col,mats,gold,price] of FORGE_PLUS){
  ITEMS[id]={name,type:'weapon',wt,atk,...(matk?{matk}:{}),b,price,lv,slots:lv>=66?2:1,col,g:'W',craft:true};
  if(typeof FORGES!=='undefined'&&!FORGES.some(f=>f[0]===id))FORGES.push([id,1,mats,gold]);}
// the forge lists its recipes by level, so each type's weapons read in order
if(typeof FORGES!=='undefined')FORGES.sort((a,b)=>((ITEMS[a[0]]||{}).lv||0)-((ITEMS[b[0]]||{}).lv||0));
// (v1.63.0) each forged weapon has a look of its own in the hand (js/weaponart.js, shade.js, gunslinger.js)
if(typeof WA!=='undefined')Object.assign(WA,{
  veilkris:()=>waDagger({len:14,blade:'#b8a8d8',gcol:'#3a2a5a',grip:'#1e1a28',wrap:'#7a6aa8',pom:'#5a4a7a',glow:'#9a80d8'}),
  rimedirk:()=>waDagger({len:15,blade:'#e8f4ff',gcol:'#8ab8d8',grip:'#2a3a4a',wrap:'#cfe3f0',pom:'#cfe3f0',glow:'#bfe6ff'}),
  silkkris:()=>waDagger({len:16,blade:'#5a4a6a',gcol:'#1a1222',grip:'#120e18',wrap:'#3a2a4a',pom:'#8a6ab0',glow:'#8a6ab0'}),
  salafang:()=>waDagger({len:17,blade:'#ffb070',gcol:'#a8401a',grip:'#3a1a10',wrap:'#e8783a',pom:'#ffd060',glow:'#ff8a3a'}),
  bonemusket:()=>waGun({len:18,grip:'#c8b89a',body:'#8a7a60',barrel:'#e8e0c8',stock:'#a89878'}),
  quartzrifle:()=>waGun({len:20,grip:'#5a4a6a',body:'#8a7aa8',barrel:'#e8e0f8',stock:'#6a5a80'}),
  tidecarbine:()=>waGun({len:19,grip:'#2a4a5a',body:'#3a7a8a',barrel:'#8ad8e8',stock:'#2a5a6a'}),
  pyrecannon:()=>waGun({len:15,grip:'#3a1a10',body:'#7a2a1a',barrel:'#e86a2a',stock:'#5a2a18'}),
  rimeaxe:()=>waAxe({head:'#cfe8f8',haft:'#3a4a5a',crack:'#ffffff',len:23}),
  tuskaxe:()=>waAxe({double:true,head:'#f0e6d0',haft:'#5a3a22',len:25}),
  giantaxe:()=>waAxe({double:true,head:'#8a8070',haft:'#3a2a1a',crack:'#c8c0b0',len:27}),
  prismstaff:()=>waWand({len:22,shaft:'#e8e0f8',spiral:'rgba(180,140,255,.5)',band:'#8a6ad0',prong:'#d8b8ff',crystal:'#e8d8ff',glow:'#d8b8ff',star:true}),
  wispstaff:()=>waWand({len:21,shaft:'#5a7a5a',spiral:'rgba(160,240,200,.5)',band:'#3a6a4a',prong:'#9fe8c8',orb:'#c8fff0'}),
  stormscepter:()=>waWand({len:23,shaft:'#3a4a6a',spiral:'rgba(140,180,255,.6)',band:'#e8c25a',prong:'#8ab8ff',crystal:'#c8e0ff',glow:'#8ab8ff',star:true}),
  jademaul:()=>waMace({maul:true,head:'#4ab08a',len:19,gem:'#c8ffe8'}),
  miremaul:()=>waMace({maul:true,head:'#6a7a5a',flange:'#4a5a3a',len:20}),
  magmamaul:()=>waMace({head:'#e0502a',flange:'#ffb060',gem:'#ffe080',glow:'#ff7a3a'}),
  mantisedge:()=>waSword({w:3.5,len:23,curve:true,blade:'#c8f0a0',gcol:'#4a7a2a',grip:'#2a3a1a',wrap:'#7ac05a',pom:'#7ac05a'}),
  pyreblade:()=>waSword({w:5,len:25,blade:'#ffd0a0',gcol:'#a8401a',gem:'#ffe080',glow:'#ff7a3a',wrap:'#e8783a',pom:'#ffd060'})});
if(typeof WA_BOW!=='undefined')Object.assign(WA_BOW,{
  viperbow:{wood:'#4a7a3a',grip:'#2a3a1a',tip:'#c8e070'},
  saltbow:{wood:'#e8eef4',grip:'#6a8aa0',scale:1.08,tip:'#ffffff',feather:'#cfe8f8'},
  griffinbow:{wood:'#c8a060',grip:'#5a3a1a',scale:1.15,tip:'#f0d8a0',feather:'#fff4d0'}});
