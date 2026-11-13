"use strict";
/* ================= build gear: forged pieces and brews that push one build further =================
   Hunt the right monsters, bring the materials to Brannoc (gear) or brew anywhere (/craft). Each piece leans on a
   build stat from js/builds.js, so gear and skills stack into different ways to play the same job. */
const BONUS_LABEL={aspd:v=>`Attack speed +${v}%`,cast:v=>`Cast time −${v}%`,critdmg:v=>`Crit damage +${v}%`,dbl:v=>`Double attack ${v}%`,
  dmgred:v=>`Damage taken −${v}%`,healpct:v=>`Healing +${v}%`,atkpct:v=>`ATK +${v}%`,matkpct:v=>`MATK +${v}%`,sppct:v=>`Max SP +${v}%`,
  hppct:v=>`Max HP +${v}%`,spregen:v=>`SP regen +${v}/s`,regen:v=>`HP regen +${v}/s`};
function bonusLabel(k,v){if(BONUS_LABEL[k])return BONUS_LABEL[k](v);
  if(k.startsWith('vs_')){const r=k.slice(3);return `+${v}% vs ${r[0].toUpperCase()+r.slice(1)}`;}return null;}

Object.assign(ITEMS,{
  // brews (3 minutes)
  quickdraught:{name:'Quickening Draught',type:'use',price:200,col:'#7fe0d0',g:'Q',brew:{id:'quickdraught',s:180,b:{aspd:15}},desc:'For 3 minutes: attacks 15% faster.'},
  focustonic:{name:'Focus Tonic',type:'use',price:220,col:'#b0a0ff',g:'F',brew:{id:'focustonic',s:180,b:{cast:15,spregen:2}},desc:'For 3 minutes: spells cast 15% faster and +2 SP regen per second.'},
  keenbrew:{name:'Keen Brew',type:'use',price:260,col:'#ffe07a',g:'K',brew:{id:'keenbrew',s:180,b:{crit:6,critdmg:15}},desc:'For 3 minutes: +6 CRIT and +15% critical damage.'},
  // forged gear
  quickgrip:{name:'Quickgrip Band',type:'accessory',b:{agi:2,aspd:6},price:1500,lv:15,slots:0,col:'#9fd8c8',g:'O',craft:true},
  fourleaf:{name:'Four-Leaf Charm',type:'accessory',b:{luk:4,crit:3,critdmg:8},price:1700,lv:16,slots:0,col:'#7fd36a',g:'O',craft:true},
  monocle:{name:"Hunter's Monocle",type:'face',def:1,b:{crit:4,critdmg:10},price:1800,lv:18,slots:0,col:'#e0c070',g:'o',craft:true},
  sageloop:{name:"Sage's Loop",type:'accessory',b:{int:2,cast:10},price:2400,lv:20,slots:0,col:'#a090e0',g:'O',craft:true},
  windscarf:{name:'Windrunner Scarf',type:'mouth',def:1,b:{agi:2,flee:6,aspd:4},price:2200,lv:20,slots:0,col:'#8fd8e0',g:'~',craft:true},
  mendstole:{name:"Mender's Stole",type:'armor',def:14,b:{int:2,healpct:15},price:3000,lv:22,slots:1,col:'#f0e8c8',g:'A',craft:true},
  manaheart:{name:'Manaheart Pendant',type:'accessory',b:{int:2,sppct:15,spregen:3},price:3600,lv:25,slots:0,col:'#6a9ae0',g:'O',craft:true},
  twinfang:{name:'Twinfang Saber',type:'weapon',wt:'sword',atk:70,b:{aspd:10,dbl:5},price:6000,lv:26,slots:1,col:'#d8e0f0',g:'W',craft:true},
  stonewall:{name:'Stonewall Plate',type:'armor',def:34,b:{vit:3,dmgred:5},price:5200,lv:28,slots:1,col:'#8a8478',g:'A',craft:true},
  dawnmace:{name:'Dawnlight Mace',type:'weapon',wt:'mace',atk:78,matk:40,b:{int:2,healpct:10},price:7400,lv:30,slots:1,col:'#fff0a0',g:'W',craft:true},
  arcanecirclet:{name:'Arcane Circlet',type:'head',def:3,b:{matkpct:6,cast:6},price:6400,lv:32,slots:0,col:'#b090ff',g:'^',craft:true},
  galebow:{name:'Galeheart Bow',type:'weapon',wt:'bow',atk:88,b:{crit:5,critdmg:15},price:8800,lv:34,slots:1,col:'#9fe0c0',g:'W',craft:true},
  splitter:{name:'Earthsplitter Axe',type:'weapon',wt:'axe',atk:124,b:{str:3,atkpct:8},price:10500,lv:36,slots:1,col:'#a07a4a',g:'W',craft:true},
});
BREWS.push(['quickdraught',2,{pelt:2,tuft:3},60],['focustonic',2,{spore:3,glowsilk:1},80],['keenbrew',2,{thorn:3,needle:1},100]);
FORGES.push(
  ['quickgrip',1,{pelt:5,tuft:4},1200],
  ['fourleaf',1,{sap:10,tuft:6},1400],
  ['monocle',1,{thorn:6,spore:3},1500],
  ['sageloop',1,{glowsilk:4,spore:4},2000],
  ['windscarf',1,{batwing:4,pelt:3},1900],
  ['mendstole',1,{glowsilk:5,shell:4},2600],
  ['manaheart',1,{shadeveil:3,glowsilk:3},3200],
  ['twinfang',1,{pelt:8,needle:4},5200],
  ['stonewall',1,{carapace:6,bone:4},4600],
  ['dawnmace',1,{dust:5,glowsilk:4},6600],
  ['arcanecirclet',1,{dust:6,core:2},5600],
  ['galebow',1,{needle:6,batwing:4},8000],
  ['splitter',1,{bone:6,trollhide:4},9500]);
// cheapest first, new pieces in among the old (after every module has added its recipes)
addEventListener("DOMContentLoaded",()=>FORGES.sort((a,b)=>(ITEMS[a[0]].lv||1)-(ITEMS[b[0]].lv||1)));
