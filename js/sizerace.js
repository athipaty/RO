"use strict";
/* ================= #11 monster size and race =================
   Every monster is Small, Medium or Large (from how big it is drawn, or d.sz) and belongs to a race (from its
   shape, or d.race; undead monsters are Undead). Weapons hit some sizes better than others (physical damage
   only; spells ignore size). Gear with b.vs_<race> adds that many % damage against a race, physical and magic.
   Four new charms forged at the smithy carry race bonuses. All values are our own. */
const SIZES={s:{name:'Small'},m:{name:'Medium'},l:{name:'Large'}};
const RACES={beast:{name:'Beast',col:'#c89a6a'},insect:{name:'Insect',col:'#9fc06a'},plant:{name:'Plant',col:'#6ac07a'},
  spirit:{name:'Spirit',col:'#a8c8f0'},undead:{name:'Undead',col:'#c8b8a0'},fiend:{name:'Fiend',col:'#e0605a'},construct:{name:'Construct',col:'#a0a4b0'}};
const SHAPE_RACE={beast:'beast',bug:'insect',blob:'plant',mushroom:'plant',ghost:'spirit',skeleton:'undead',imp:'fiend',golem:'construct'};
// % physical damage by weapon type against Small / Medium / Large
const WSIZE={none:[100,100,100],club:[100,100,90],sword:[100,100,85],axe:[75,100,115],mace:[85,110,100],bow:[110,100,80],wand:[100,100,100]};
// a few monsters whose shape alone would give the wrong race
const RACE_FIX={snowhulk:'construct',cactoid:'plant',frostmatron:'beast'};
function mobSize(d){return d.sz||(d.size<=12?'s':d.size>=20?'l':'m');}
function mobRace(d){return d.race||RACE_FIX[d.id]||(d.undead?'undead':SHAPE_RACE[d.shape]||'beast');}
function weaponType(){const w=P&&P.eq&&P.eq.weapon&&ITEMS[P.eq.weapon.id];return w&&w.wt&&WSIZE[w.wt]?w.wt:'none';}
function sizePct(d){return WSIZE[weaponType()]['sml'.indexOf(mobSize(d))];}
// race bonus from all equipped gear, slotted sigils and buffs
function raceBonus(r){const key='vs_'+r;let n=0;if(!P)return 0;
  for(const slot of ['weapon','armor','accessory','head']){const e=P.eq[slot];if(!e)continue;const it=ITEMS[e.id];
    if(it.b&&it.b[key])n+=it.b[key];for(const s of e.s||[])if(s&&ITEMS[s].b&&ITEMS[s].b[key])n+=ITEMS[s].b[key];}
  for(const k in P.buffs||{}){const b=P.buffs[k].b;if(b&&b[key])n+=b[key];}
  return n;}
function sizeRaceMult(m,kind){const d=m.d||m;if(!d||!d.shape)return 1;
  return (kind==='phys'?sizePct(d)/100:1)*(1+raceBonus(mobRace(d))/100);}

Object.assign(ITEMS,{
  beastbane:{name:'Beastbane Charm',type:'accessory',b:{str:1,vs_beast:15},price:1600,lv:15,slots:0,col:'#b07a4a',g:'O',craft:true,desc:'+15% damage to Beasts · STR +1.'},
  husktalon:{name:'Husk Talon Charm',type:'accessory',b:{dex:1,vs_insect:15},price:2200,lv:20,slots:0,col:'#7fa04a',g:'O',craft:true,desc:'+15% damage to Insects · DEX +1.'},
  sicklecharm:{name:'Sickle Charm',type:'accessory',b:{agi:1,vs_plant:15},price:1400,lv:12,slots:0,col:'#5aa060',g:'O',craft:true,desc:'+15% damage to Plants · AGI +1.'},
  dawnlamp:{name:'Dawnlamp Charm',type:'accessory',b:{int:1,vs_spirit:12,vs_undead:12},price:4000,lv:26,slots:0,col:'#f0e0a0',g:'O',craft:true,desc:'+12% damage to Spirits and the Undead · INT +1.'},
});
if(typeof FORGES!=='undefined')FORGES.splice(1,0,['sicklecharm',1,{thorn:4,sap:3},500],['beastbane',1,{pelt:4,tuft:3},800],['husktalon',1,{shell:5,carapace:1},1200],['dawnlamp',1,{dust:4,bone:3},2200]);

