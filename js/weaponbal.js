"use strict";
/* ================= one ATK curve for every weapon type (v1.92.0) =================
   Shop and forged weapons follow the sword's curve by level, times the type's factor:
     sword x1.00 · axe x1.08 (the slow, heavy jobs) · bow x0.78 (it shoots from 235px away) · dagger x1.00 (it hits Large for 65%, Medium for 80%) · mace x0.90
   (a mace also carries MATK for holy power and healing), and a forged weapon is 5% above a shop one of its level.
   Daggers and maces used to sit near x0.65 (and daggers lose the most to monster size) and left every dagger and mace job behind; the top forged swords, axes and
   bows were a few % above the curve. Boss weapons, guns and build gear keep their numbers. (v1.92.0 left weapons below Lv 40 alone; measured at Lv 25,
   Rangers then did 143-178% of the middle and Shades 57-59%, so the early ones follow the curve too.)
   Before -> after:
     sword   Rimefang Blade 140→142, Gale Saber 150→149, Mantisedge 249→237, Pyreforged Blade 353→337
     axe     Hand Axe 30→37, Steel Hatchet 58→56, Reaver Axe 125→121, Aurel Greataxe 150→149, Gale Cleaver 164→161, Glacierbite Axe 178→169, Stormsteel Axe 210→208, Tuskrender Axe 271→256, Starforged Cleaver 278→275, Giantsplitter 384→364, Sunfire Waraxe 360→357
     bow     Hunter Bow 30→27, Ash Bow 48→41, Gale Longbow 76→62, Needlethorn Bow 92→77, Aurel Warbow 106→108, Gale Longbow 112→116, Viperstring Bow 126→122, Stormsteel Bow 148→151, Saltwind Bow 191→185, Starforged Longbow 196→199, Griffinwing Bow 271→263, Sunfire Bow 254→258
     dagger  Iron Dagger 24→34, Steel Dagger 40→52, Nightfang 66→80, Shadeveil Kris 80→99, Aurel Stiletto 94→138, Gale Dirk 100→148, Rimetooth Dirk 112→156, Stormsteel Dirk 132→193, Shadowsilk Kris 170→238, Starforged Kris 174→255, Salamander Fang 241→336, Sunfire Fang 226→331
     mace    Iron Mace 28→31, Steel Mace 44→47, Trollhide Maul 96→100, Aurel Sunhammer 96→124, Gale Maul 102→134, Jadeward Maul 114→141, Stormsteel Maul 134→173, Mirestone Maul 167→206, Starforged Hammer 178→230, Magmaheart Maul 238→294, Sunfire Mace 230→298
   Loaded after every weapon is made (shop, forge, build gear), so the item cards, the gear compare and the fights all
   use these numbers. */
const WEAPON_ATK={
  /* sword */ fangblade:142, galesword:149, mantisedge:237, pyreblade:337,
  /* axe */ handaxe:37, steelaxe:56, axe:121, aurelaxe:149, galeaxe:161, rimeaxe:169, stormaxe:208, tuskaxe:256, staraxe:275, giantaxe:364, sunaxe:357,
  /* bow */ bow:27, steelbow:41, longbow:62, needlebow:77, aurelbow:108, galebowx:116, viperbow:122, stormbow:151, saltbow:185, starbow:199, griffinbow:263, sunbow:258,
  /* dagger */ dagger:34, steeldagger:52, nightfang:80, veilkris:99, aureldagger:138, galedirk:148, rimedirk:156, stormdirk:193, silkkris:238, stardirk:255, salafang:336, sundirk:331,
  /* mace */ mace:31, steelmace:47, trollmaul:100, aurelmace:124, galemace:134, jademaul:141, stormmace:173, miremaul:206, starmace:230, magmamaul:294, sunmace:298,
};
for(const id in WEAPON_ATK)if(ITEMS[id]&&ITEMS[id].type==='weapon')ITEMS[id].atk=WEAPON_ATK[id];
