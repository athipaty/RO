"use strict";
/* ================= the Tidewater Isle and the Sunken Grotto (v1.64.0) =================
   An island far out at sea, joined to no other region: the only way there is the boat from the river pier in Willowmere
   Farms (heroes of Lv 38 and up; js/islesfx.js), and back the same way. Every monster on it is water element, so wind
   (1.5x against water) is the way to hunt here, and fire (0.5x) or water (0.25x) weapons struggle.
     Tidewater Isle       Lv 40-55   beaches, a lagoon, tide pools; stairs down into the grotto
     Sunken Grotto B1-B3  Lv 48-72   flooded caves under the island; the Tide Leviathan waits at the bottom
   Wind weapons are new: a weapon can carry an element, and its plain attacks hit with it (js/islesfx.js). The Gale
   forge line is made from island materials, and a rare Wind Sigil turns any weapon to wind.
   Loaded after regions5.js (it uses r5Mob) and before balance.js, so its monsters follow the same level curve; the game
   server gets it through tools/export-world.js. */
const ISLE_MOBS=[];const isl=(id,...a)=>{r5Mob(id,...a);MOBS[id].el='water';ISLE_MOBS.push(id);};
Object.assign(ITEMS,{
  // materials (forged into the Gale weapons and sold)
  seaglass:{name:'Sea Glass',type:'etc',price:150,col:'#8ad8d0',g:'•'}, crabclaw:{name:'Tide Crab Claw',type:'etc',price:170,col:'#e06a4a',g:'•'},
  kelpfrond:{name:'Kelp Frond',type:'etc',price:160,col:'#4a8a5a',g:'•'}, gullplume:{name:'Gull Plume',type:'etc',price:180,col:'#f4f4f0',g:'•'},
  pearlshard:{name:'Pearl Shard',type:'etc',price:240,col:'#f0e8f8',g:'•'}, eelskin:{name:'Eel Skin',type:'etc',price:260,col:'#3a5a6a',g:'•'},
  coralbranch:{name:'Coral Branch',type:'etc',price:280,col:'#f07a8a',g:'•'}, abyssink:{name:'Abyss Ink',type:'etc',price:320,col:'#2a2a4a',g:'•'},
  leviscale:{name:'Leviathan Scale',type:'etc',price:2000,col:'#4a9ab8',g:'•'},
  // the island's relics
  tidecrown:{name:'Tidecaller Crown',type:'head',def:8,b:{int:3,maxsp:100,cast:6},price:40000,lv:50,slots:1,col:'#5ab8d8',g:'^',desc:'Dropped by the Reef Matriarch.'},
  leviheart:{name:'Leviathan Heart',type:'accessory',b:{vit:4,str:3,maxhp:400,dmgred:3},price:75000,lv:68,slots:1,col:'#2a7aa8',g:'O',desc:'Dropped by the Tide Leviathan.'},
  // the Wind Sigil: socketed into a weapon, its plain attacks hit as wind
  windsigil:{name:'Wind Sigil',type:'sigil',kind:'weapon',el:'wind',b:{agi:1},price:9000,col:'#a8e8c8',g:'✦',desc:'Socket into a weapon: its attacks hit as wind (1.5x against water monsters) · +1 AGI.'}});
// ---- Tidewater Isle (Lv 40-55) ----
isl('tidecrab','Shore Crab',41,'rimestalker',{shape:'bug',col:'#e06a4a',size:13,drops:[['crabclaw',.45],['orange',.1],['windsigil',.006]],sig:{kind:'armor',b:{vit:4,killsp:14},txt:'+4 VIT, +14 KILLSP'}});
isl('seagull','Sea Gull',43,'rimestalker',{aggro:false,shape:'beast',col:'#f4f4f0',size:11,drops:[['gullplume',.45],['orange',.1],['windsigil',.006]],sig:{kind:'accessory',b:{agi:2,hit:5,luk:1},txt:'+2 AGI, +5 HIT, +1 LUK'}});
isl('kelpling','Kelpling',46,'rimestalker',{shape:'leaf',col:'#4a8a5a',size:13,drops:[['kelpfrond',.45],['orange',.1],['windsigil',.006]],sig:{kind:'head',b:{maxsp:50,int:1,hit:3},txt:'+50 Max SP, +1 INT, +3 HIT'}});
isl('tidepoolslime','Tide Pool Slime',49,'snowhulk',{shape:'blob',col:'#6ac8d8',size:15,aggro:true,drops:[['seaglass',.45],['blue',.08],['windsigil',.006]],sig:{kind:'armor',b:{vit:3,maxhp:120},txt:'+3 VIT, +120 Max HP'}});
isl('reefmatriarch','Reef Matriarch',56,'frostmatron',{shape:'ghost',col:'#5ab8d8',size:28,drops:[['tidecrown',.2],['seaglass',1],['orange',1],['glintstone',.5],['windsigil',.08]],sig:{kind:'head',b:{int:3,maxsp:80,flee:3},txt:'+3 INT, +80 Max SP, +3 FLEE'}});
// ---- Sunken Grotto B1 (Lv 48-56) ----
isl('grottoeel','Grotto Eel',49,'fenlurker',{shape:'blob',col:'#3a5a6a',size:13,drops:[['eelskin',.45],['orange',.1],['windsigil',.008]],sig:{kind:'weapon',b:{atk:20,dex:1},txt:'+20 ATK, +1 DEX'}});
isl('pearlclam','Pearl Clam',52,'snowhulk',{shape:'blob',col:'#e8e0f0',size:14,aggro:true,spd:30,drops:[['pearlshard',.45],['blue',.08],['windsigil',.008]],sig:{kind:'accessory',b:{luk:3,int:1,hit:3},txt:'+3 LUK, +1 INT, +3 HIT'}});
isl('driftwisp','Drift Wisp',54,'fenlurker',{shape:'ghost',col:'#a8e0f0',size:12,drops:[['seaglass',.45],['blue',.08],['windsigil',.008]],sig:{kind:'weapon',b:{matk:40,int:1},txt:'+40 MATK, +1 INT'}});
// ---- Sunken Grotto B2 (Lv 56-64) ----
isl('coralguard','Coral Guard',57,'miregolem',{shape:'golem',col:'#f07a8a',size:16,drops:[['coralbranch',.45],['orange',.12],['windsigil',.01]],sig:{kind:'armor',b:{def:9,vit:1,crit:1},txt:'+9 DEF, +1 VIT, +1 CRIT'}});
isl('inkcrawler','Ink Crawler',60,'bogmantis',{shape:'bug',col:'#2a2a4a',size:14,ail:['blind',.12,3],drops:[['abyssink',.45],['orange',.12],['windsigil',.01]],sig:{kind:'accessory',b:{agi:3,flee:6,hit:3},txt:'+3 AGI, +6 FLEE, +3 HIT'}});
isl('sirenwisp','Siren Wisp',62,'fenlurker',{shape:'ghost',col:'#d8a8e8',size:13,ail:['sleep',.1,3],drops:[['pearlshard',.45],['blue',.1],['windsigil',.01]],sig:{kind:'head',b:{int:3,dex:2},txt:'+3 INT, +2 DEX'}});
isl('grottoeel2','Deep Eel',63,'fenlurker',{shape:'blob',col:'#1a3a4a',size:15,drops:[['eelskin',.45],['orange',.12],['windsigil',.01]],sig:{kind:'weapon',b:{atk:28,str:1},txt:'+28 ATK, +1 STR'}});
// ---- Sunken Grotto B3 (Lv 64-72) ----
isl('abysscrab','Abyss Crab',65,'miregolem',{shape:'bug',col:'#4a3a6a',size:17,drops:[['crabclaw',.45],['orange',.14],['windsigil',.012]],sig:{kind:'armor',b:{def:10,dmgred:1,luk:1},txt:'+10 DEF, Damage taken −1%, +1 LUK'}});
isl('drownedknight','Drowned Knight',68,'miregolem',{shape:'golem',col:'#3a6a7a',size:17,drops:[['coralbranch',.45],['blue',.12],['windsigil',.012]],sig:{kind:'weapon',b:{atk:32,vit:2},txt:'+32 ATK, +2 VIT'}});
isl('abysswisp','Abyss Wisp',70,'bogmantis',{shape:'ghost',col:'#4a4a8a',size:13,drops:[['abyssink',.45],['blue',.12],['windsigil',.012]],sig:{kind:'weapon',b:{matk:55,dex:1},txt:'+55 MATK, +1 DEX'}});
isl('leviathan','Tide Leviathan',73,'mirematriarch',{shape:'blob',col:'#2a7aa8',size:34,drops:[['leviheart',.25],['leviscale',1],['orange',1],['blue',1],['glintstone',.6],['windsigil',.25]],sig:{kind:'armor',b:{vit:4,maxhp:900,luk:1},txt:'+4 VIT, +900 Max HP, +1 LUK'}});
for(const id of ISLE_MOBS){const m=MOBS[id];m.id=id;m.hit=m.lv*2+12;
  ITEMS[id+'_sig']={name:m.name+' Sigil',type:'sigil',kind:m.sig.kind,b:m.sig.b,price:m.boss?20000:600,col:'#ffcf5a',g:'✦',desc:'Socket into '+(/^[aeiou]/.test(m.sig.kind)?'an':'a')+' '+m.sig.kind+': '+m.sig.txt+'.'};}
MOBS.leviathan.boss=true;delete MOBS.leviathan.mini;
Object.assign(THEMES,{
  isle:{...THEMES.coast,g:['#e8d8a4','#ecdca8','#e3d29c'],canopy:['#2f8a4a','#4aa85a'],water:'#2ab0d0',tree:THEMES.coast.tree},
  grotto:{...THEMES.cave,g:['#2f3e44','#334348','#2c3a40'],path:'#3f5458',rock:['#1f2e34','#3a5058'],water:'#2a7a9a',dark:true,rocky:true,rockKind:'rock'}});
Object.assign(ZONES,{
  isles:{name:'Tidewater Isle',w:62,h:46,theme:'isle',music:'coast',seed:557,density:.04,ponds:8,lvl:'Lv 40–55 · island',isle:true,gateSalt:'1',
    mobs:[['tidecrab',13],['seagull',10],['kelpling',9],['tidepoolslime',6],['reefmatriarch',1],['tidecrab',4,'reefmatriarch']],links:{},stairs:'grotto1'},
  grotto1:{name:'Sunken Grotto B1',w:54,h:38,theme:'grotto',music:'crypt',dungeon:1,seed:569,density:.12,ponds:5,lvl:'Lv 48–56 · dungeon',
    mobs:[['grottoeel',13],['pearlclam',10],['driftwisp',7]],links:{west:'isles',east:'grotto2'}},
  grotto2:{name:'Sunken Grotto B2',w:54,h:38,theme:'grotto',music:'crypt',dungeon:2,seed:577,density:.13,ponds:6,lvl:'Lv 56–64 · dungeon',
    mobs:[['coralguard',11],['inkcrawler',10],['sirenwisp',7],['grottoeel2',5]],links:{west:'grotto1',east:'grotto3'}},
  grotto3:{name:'Sunken Grotto B3',w:54,h:38,theme:'grotto',music:'crypt',dungeon:3,seed:587,density:.14,ponds:6,lvl:'Lv 64–72 · boss',
    mobs:[['abysscrab',10],['drownedknight',9],['abysswisp',7],['leviathan',1]],links:{west:'grotto2'}}});
// the Gale weapons: wind weapons forged from island materials (shop curve at their level; the wind is the edge)
const GALE=[
  ['galesword',"Gale Saber",'sword',46,150,0,{agi:2,crit:3},'#a8e8c8',{gullplume:5,seaglass:4},26000,34000],
  ['galeaxe',"Gale Cleaver",'axe',46,164,0,{str:2,agi:2},'#a8e8c8',{crabclaw:5,gullplume:4},26000,34000],
  ['galebowx',"Gale Longbow",'bow',46,112,0,{dex:2,agi:2},'#a8e8c8',{gullplume:6,kelpfrond:3},26000,34000],
  ['galedirk',"Gale Dirk",'dagger',46,100,0,{agi:3,crit:3},'#a8e8c8',{gullplume:5,eelskin:3},26000,34000],
  ['galegun',"Gale Repeater",'gun',46,140,0,{dex:2,agi:2},'#a8e8c8',{seaglass:5,gullplume:4},26000,34000],
  ['galemace',"Gale Maul",'mace',46,102,80,{int:2,agi:1},'#a8e8c8',{kelpfrond:5,seaglass:4},26000,34000],
  ['galewand',"Gale Wand",'wand',46,18,132,{int:2,agi:1},'#a8e8c8',{pearlshard:4,seaglass:4},28000,36000]];
for(const [id,name,wt,lv,atk,matk,b,col,mats,gold,price] of GALE){
  ITEMS[id]={name,type:'weapon',wt,atk,...(matk?{matk}:{}),b,price,lv,slots:1,col,g:'W',craft:true,el:'wind'};}
