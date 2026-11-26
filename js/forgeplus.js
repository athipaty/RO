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
