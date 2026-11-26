"use strict";
/* ================= a world around the city (v1.47.0) =================
   Hearthvale and the capital Aurelmark stand side by side in the middle of the world. Four roads run out of them, one
   each way, and the farther you walk from the city the stronger the monsters (WORLD_GRID below is the map):

               ring   North (cold peaks)      East (wild green)        South (warm lands)        West (past Aurelmark)
               1      Windwhistle Heights     Greenmoss Meadow         Willowmere Farms          Goldleaf Downs      (new)
               2      Pinewatch Ridge (new)   Whispering Woods         Ashen Dunes               Old Aurel Ruins     (new)
               3      Frostpeak Pass          Thornveil Jungle (new)   Cinder Crypt              Crystal Steppe      (new)
               4      Skyreach Glacier (new)  Mirelight Fen            Saltspray Coast           Duskwood            (new)
               5      Stormcrown Peaks (new)                           Cinderpeak Caldera

   Eight new regions fill the empty places, each with four monsters of its own and a boss with an escort.
   Loaded right after regions3.js, so sigils, the Bestiary, bounties and the server's world file see them all. */
Object.assign(ITEMS,{
  // Goldleaf Downs
  wooltuft:{name:'Wool Tuft',type:'etc',price:14,col:'#f4efe2',g:'•'}, moleclaw:{name:'Mole Claw',type:'etc',price:30,col:'#8a6a52',g:'•'},
  honeycomb:{name:'Honeycomb',type:'etc',price:48,col:'#f0b83a',g:'•'}, thistlequill:{name:'Thistle Quill',type:'etc',price:66,col:'#9a7ab8',g:'•'},
  goldenfleece:{name:'Golden Fleece',type:'accessory',b:{vit:3,maxhp:150},price:9000,lv:12,slots:1,col:'#ffd04a',g:'O',desc:'Dropped by the Old Woolhorn. VIT +3 · Max HP +150.'},
  // Pinewatch Ridge
  pinecone:{name:'Pinecone',type:'etc',price:105,col:'#8a5a32',g:'•'}, boartusk:{name:'Boar Tusk',type:'etc',price:125,col:'#efe4c8',g:'•'},
  owlfeather:{name:'Owl Feather',type:'etc',price:140,col:'#b8a07a',g:'•'}, bearpelt:{name:'Bruin Pelt',type:'etc',price:160,col:'#6a4a32',g:'•'},
  antlercrown:{name:'Antler Crown',type:'head',def:6,b:{str:3,agi:3},price:24000,lv:28,slots:1,col:'#c8a878',g:'^',desc:'Dropped by the Elder Antlerking. STR +3 · AGI +3.'},
  // Old Aurel Ruins
  rustycoin:{name:'Rusty Coin',type:'etc',price:120,col:'#b8783a',g:'•'}, ivyvine:{name:'Ivy Vine',type:'etc',price:135,col:'#4a8a3a',g:'•'},
  carvedstone:{name:'Carved Stone',type:'etc',price:155,col:'#a8a296',g:'•'}, relicgem:{name:'Relic Gem',type:'etc',price:175,col:'#5ac8b8',g:'•'},
  oathring:{name:'Oathbound Ring',type:'accessory',b:{vit:3,def:6,maxhp:300},price:30000,lv:32,slots:1,col:'#e8d8a0',g:'O',desc:'Dropped by the Fallen Paladin. VIT +3 · DEF +6 · Max HP +300.'},
  // Thornveil Jungle
  viperfang:{name:'Viper Fang',type:'etc',price:200,col:'#e8e0c8',g:'•'}, apefur:{name:'Ape Fur',type:'etc',price:215,col:'#7a5a3a',g:'•'},
  nectar:{name:'Bloom Nectar',type:'etc',price:235,col:'#ff7ab8',g:'•'}, jadewart:{name:'Jade Wart',type:'etc',price:255,col:'#3ab87a',g:'•'},
  orchidcharm:{name:'Orchid Charm',type:'accessory',b:{int:4,dex:3,maxsp:80},price:40000,lv:45,slots:1,col:'#e07ae0',g:'O',desc:'Dropped by Queen Orchidra. INT +4 · DEX +3 · Max SP +80.'},
  // Crystal Steppe
  quartzchip:{name:'Quartz Chip',type:'etc',price:255,col:'#e8e0f8',g:'•'}, prismdust:{name:'Prism Dust',type:'etc',price:275,col:'#c8a8ff',g:'•'},
  geodeshell:{name:'Geode Shell',type:'etc',price:300,col:'#8a6ab0',g:'•'}, glassfang:{name:'Glass Fang',type:'etc',price:320,col:'#bfe8ff',g:'•'},
  prismheart:{name:'Prism Heart',type:'accessory',b:{int:3,dex:3,luk:4,crit:4},price:50000,lv:55,slots:1,col:'#d8b8ff',g:'O',desc:'Dropped by the Geode Colossus. INT +3 · DEX +3 · LUK +4 · CRIT +4.'},
  // Skyreach Glacier
  rimescale:{name:'Rime Scale',type:'etc',price:370,col:'#9ad8f0',g:'•'}, yetifur:{name:'Yeti Fur',type:'etc',price:395,col:'#f0f4f8',g:'•'},
  walrustusk:{name:'Walrus Tusk',type:'etc',price:420,col:'#f4ead0',g:'•'}, penguinfeather:{name:'Frostbeak Feather',type:'etc',price:440,col:'#2a3a4a',g:'•'},
  hrimtalisman:{name:'Hrimfang Talisman',type:'accessory',b:{vit:4,int:4,maxhp:400},price:70000,lv:70,slots:1,col:'#8fd8ff',g:'O',desc:'Dropped by Hrimfang the Glacier Wyrm. VIT +4 · INT +4 · Max HP +400.'},
  // Duskwood
  gloamantler:{name:'Gloam Antler',type:'etc',price:400,col:'#8a7ab8',g:'•'}, shadowsilk:{name:'Shadow Silk',type:'etc',price:425,col:'#4a3a6a',g:'•'},
  nightbloom:{name:'Nightbloom',type:'etc',price:450,col:'#b87aff',g:'•'}, pantherfang:{name:'Duskfang Tooth',type:'etc',price:480,col:'#e8e0f0',g:'•'},
  hollowcrown:{name:'Hollow Crown',type:'head',def:10,b:{str:4,int:4,atk:30,matk:30},price:90000,lv:75,slots:1,col:'#7a5ab0',g:'^',desc:'Dropped by the Hollow King. STR +4 · INT +4 · ATK +30 · MATK +30.'},
  // Stormcrown Peaks
  stormfeather:{name:'Storm Feather',type:'etc',price:560,col:'#f0f4ff',g:'•'}, stormcore:{name:'Storm Core',type:'etc',price:590,col:'#8fd0ff',g:'•'},
  griffinplume:{name:'Griffin Plume',type:'etc',price:620,col:'#e8c070',g:'•'}, giantstone:{name:'Giant Stone',type:'etc',price:660,col:'#7a7e88',g:'•'},
  tempestplume:{name:'Tempest Plume',type:'head',def:12,b:{agi:5,dex:5,flee:15},price:130000,lv:88,slots:1,col:'#a8e0ff',g:'^',desc:'Dropped by Voltaris the Tempest Roc. AGI +5 · DEX +5 · FLEE +15.'}});
const R4_MOBS={
  // ---- Goldleaf Downs (Lv 3-14): golden hills west of Aurelmark ----
  fluffwool:{name:'Fluffwool',lv:3,hp:60,atk:8,def:1,flee:6,exp:16,jexp:13,spd:42,shape:'blob',col:'#f4efe2',size:13,el:'neutral',drops:[['wooltuft',.55],['red',.08]],sig:{kind:'armor',b:{maxhp:40},txt:'+40 Max HP'}},
  burrowmole:{name:'Burrowmole',lv:7,hp:140,atk:16,def:8,flee:8,exp:42,jexp:32,spd:48,shape:'beast',col:'#7a5a44',size:12,el:'earth',drops:[['moleclaw',.5],['red',.08]],sig:{kind:'weapon',b:{atk:6},txt:'+6 ATK'}},
  bumblewing:{name:'Bumblewing',lv:10,hp:210,atk:25,def:6,flee:24,exp:78,jexp:58,spd:80,shape:'bug',col:'#f0c03a',size:11,el:'wind',drops:[['honeycomb',.45],['red',.1]],sig:{kind:'accessory',b:{agi:2},txt:'+2 AGI'}},
  thistlehog:{name:'Thistlehog',lv:13,hp:330,atk:34,def:18,flee:12,exp:118,jexp:88,spd:52,shape:'beast',col:'#8a6a9a',size:12,el:'earth',drops:[['thistlequill',.45],['orange',.05]],sig:{kind:'armor',b:{def:4},txt:'+4 DEF'}},
  woolhorn:{name:'Old Woolhorn',lv:16,hp:5000,atk:100,def:24,flee:15,exp:3800,jexp:2600,spd:65,aggro:true,boss:true,mini:true,calls:true,shape:'beast',col:'#ffd04a',size:24,el:'earth',respawn:120,sigChance:.15,
    drops:[['goldenfleece',.2],['wooltuft',1],['orange',1],['glintstone',.2]],sig:{kind:'armor',b:{vit:2,maxhp:120},txt:'+2 VIT, +120 Max HP'}},
  // ---- Pinewatch Ridge (Lv 18-30): pine forest on the mountain road north of the Heights ----
  pinesprite:{name:'Pinecone Sprite',lv:18,hp:700,atk:56,def:24,flee:18,exp:260,jexp:185,spd:55,shape:'leaf',col:'#8a5a32',size:12,el:'earth',drops:[['pinecone',.5],['red',.1]],sig:{kind:'armor',b:{maxhp:120},txt:'+120 Max HP'}},
  timberboar:{name:'Timber Boar',lv:22,hp:1000,atk:80,def:30,flee:20,exp:400,jexp:275,spd:95,aggro:true,shape:'beast',col:'#5a3a2a',size:16,el:'earth',drops:[['boartusk',.45],['orange',.06]],sig:{kind:'weapon',b:{atk:12,str:1},txt:'+12 ATK, +1 STR'}},
  hollowowl:{name:'Hollow Owl',lv:25,hp:950,atk:90,def:18,flee:55,exp:500,jexp:345,spd:88,aggro:true,shape:'beast',col:'#a88a62',size:13,el:'wind',drops:[['owlfeather',.45],['blue',.05]],sig:{kind:'accessory',b:{dex:2,int:1},txt:'+2 DEX, +1 INT'}},
  ridgebruin:{name:'Ridge Bruin',lv:28,hp:2200,atk:118,def:50,flee:15,exp:700,jexp:470,spd:52,aggro:true,shape:'golem',col:'#5a3e2a',size:19,el:'neutral',ail:['stun',.08,1.2],drops:[['bearpelt',.45],['glintstone',.03]],sig:{kind:'armor',b:{vit:2,maxhp:150},txt:'+2 VIT, +150 Max HP'}},
  antlerking:{name:'Elder Antlerking',lv:33,hp:18000,atk:210,def:60,flee:40,exp:15000,jexp:10000,spd:85,aggro:true,boss:true,mini:true,calls:true,shape:'beast',col:'#8a6a4a',size:26,el:'earth',respawn:120,sigChance:.15,
    drops:[['antlercrown',.2],['boartusk',1],['orange',1],['glintstone',.3]],sig:{kind:'head',b:{str:2,agi:2},txt:'+2 STR, +2 AGI'}},
  // ---- Old Aurel Ruins (Lv 22-34): the fallen first city, past Goldleaf Downs ----
  relicrat:{name:'Relic Rat',lv:22,hp:900,atk:78,def:20,flee:40,exp:370,jexp:250,spd:100,aggro:true,shape:'beast',col:'#7a6a5a',size:11,el:'neutral',drops:[['rustycoin',.5],['red',.1]],sig:{kind:'accessory',b:{luk:2,flee:3},txt:'+2 LUK, +3 FLEE'}},
  ivycreeper:{name:'Ivy Creeper',lv:25,hp:1300,atk:88,def:30,flee:12,exp:480,jexp:330,spd:35,shape:'leaf',col:'#4a8a3a',size:15,el:'earth',ail:['poison',.12,5],drops:[['ivyvine',.45],['remedy',.05]],sig:{kind:'armor',b:{maxhp:180},txt:'+180 Max HP'}},
  stonesentry:{name:'Stone Sentry',lv:29,hp:3000,atk:120,def:80,flee:10,exp:720,jexp:490,spd:35,aggro:true,shape:'golem',col:'#a8a296',size:19,el:'earth',drops:[['carvedstone',.45],['glintstone',.03]],sig:{kind:'armor',b:{def:6},txt:'+6 DEF'}},
  relicmimic:{name:'Relic Mimic',lv:32,hp:2400,atk:145,def:55,flee:25,exp:900,jexp:610,spd:60,aggro:true,shape:'blob',col:'#8a5a2a',size:15,el:'shadow',drops:[['relicgem',.4],['rustycoin',.6],['glintstone',.05]],sig:{kind:'accessory',b:{luk:3,crit:3},txt:'+3 LUK, +3 CRIT'}},
  fallenpaladin:{name:'The Fallen Paladin',lv:36,hp:26000,atk:250,def:70,flee:40,exp:18000,jexp:12000,spd:70,aggro:true,undead:true,boss:true,mini:true,calls:true,shape:'skeleton',col:'#8a8aa0',size:24,el:'shadow',respawn:150,sigChance:.15,
    drops:[['oathring',.2],['carvedstone',1],['orange',1],['glintstone',.3]],sig:{kind:'armor',b:{def:8,vit:2},txt:'+8 DEF, +2 VIT'}},
  // ---- Thornveil Jungle (Lv 35-48): steaming jungle east of the Woods ----
  vineviper:{name:'Vine Viper',lv:36,hp:2300,atk:150,def:35,flee:50,exp:1100,jexp:760,spd:100,aggro:true,shape:'leaf',col:'#5aa83a',size:13,el:'earth',ail:['poison',.14,6],drops:[['viperfang',.45],['orange',.08]],sig:{kind:'weapon',b:{atk:18,agi:1},txt:'+18 ATK, +1 AGI'}},
  howlerape:{name:'Howler Ape',lv:39,hp:2800,atk:165,def:40,flee:45,exp:1300,jexp:890,spd:105,aggro:true,shape:'golem',col:'#7a5a3a',size:16,el:'neutral',drops:[['apefur',.45],['orange',.08]],sig:{kind:'accessory',b:{str:3},txt:'+3 STR'}},
  bloomtrap:{name:'Bloomtrap',lv:43,hp:3600,atk:190,def:50,flee:10,exp:1650,jexp:1120,spd:25,aggro:true,range:150,shape:'mushroom',col:'#e85a8a',size:16,el:'earth',ail:['sleep',.12,3],drops:[['nectar',.45],['blue',.08]],sig:{kind:'weapon',b:{matk:40,int:2},txt:'+40 MATK, +2 INT'}},
  jadetoad:{name:'Jade Toad',lv:46,hp:4200,atk:205,def:60,flee:30,exp:1900,jexp:1300,spd:55,shape:'blob',col:'#3ab87a',size:15,el:'water',drops:[['jadewart',.45],['glintstone',.04]],sig:{kind:'armor',b:{maxhp:300,vit:1},txt:'+300 Max HP, +1 VIT'}},
  orchidra:{name:'Queen Orchidra',lv:50,hp:40000,atk:320,def:85,flee:50,exp:36000,jexp:24000,spd:60,aggro:true,boss:true,mini:true,calls:true,range:180,shape:'leaf',col:'#c85ac8',size:28,el:'earth',ail:['sleep',.1,3],respawn:150,sigChance:.15,
    drops:[['orchidcharm',.2],['nectar',1],['orange',1],['glintstone',.35],['emberore',.3]],sig:{kind:'accessory',b:{int:3,maxsp:60},txt:'+3 INT, +60 Max SP'}},
  // ---- Crystal Steppe (Lv 45-58): violet grassland grown with crystals, past the Ruins ----
  shardling:{name:'Shardling',lv:46,hp:3600,atk:200,def:75,flee:25,exp:1850,jexp:1250,spd:50,shape:'golem',col:'#a88ae0',size:13,el:'earth',drops:[['quartzchip',.45],['orange',.1]],sig:{kind:'armor',b:{def:8},txt:'+8 DEF'}},
  prismmoth:{name:'Prism Moth',lv:50,hp:3200,atk:230,def:35,flee:90,exp:2300,jexp:1550,spd:95,aggro:true,shape:'bug',col:'#e0c8ff',size:13,el:'wind',ail:['blind',.12,5],drops:[['prismdust',.4],['blue',.1]],sig:{kind:'weapon',b:{matk:55,int:2},txt:'+55 MATK, +2 INT'}},
  geodetortoise:{name:'Geode Tortoise',lv:54,hp:7500,atk:255,def:130,flee:10,exp:3000,jexp:2000,spd:30,shape:'bug',col:'#6a5a8a',size:19,el:'earth',drops:[['geodeshell',.45],['glintstone',.05]],sig:{kind:'armor',b:{def:10,maxhp:200},txt:'+10 DEF, +200 Max HP'}},
  glasslynx:{name:'Glassfang Lynx',lv:57,hp:4800,atk:290,def:55,flee:80,exp:3300,jexp:2250,spd:120,aggro:true,shape:'beast',col:'#bfe0f0',size:16,el:'wind',drops:[['glassfang',.4],['orange',.1]],sig:{kind:'accessory',b:{agi:3,crit:4},txt:'+3 AGI, +4 CRIT'}},
  geodecolossus:{name:'Geode Colossus',lv:62,hp:55000,atk:380,def:140,flee:20,exp:50000,jexp:33000,spd:45,aggro:true,boss:true,mini:true,calls:true,shape:'golem',col:'#7a5ab8',size:30,el:'earth',ail:['stun',.1,1.5],respawn:150,sigChance:.15,
    drops:[['prismheart',.2],['geodeshell',1],['orange',1],['glintstone',.4],['emberore',.35]],sig:{kind:'armor',b:{def:12,maxhp:300},txt:'+12 DEF, +300 Max HP'}},
  // ---- Skyreach Glacier (Lv 60-75): a river of ice above Frostpeak Pass ----
  rimedrake:{name:'Rime Drakeling',lv:61,hp:5200,atk:315,def:60,flee:70,exp:3900,jexp:2650,spd:100,aggro:true,range:170,shape:'beast',col:'#7ac8e8',size:14,el:'water',drops:[['rimescale',.4],['blue',.1]],sig:{kind:'weapon',b:{matk:65,int:3},txt:'+65 MATK, +3 INT'}},
  frostyeti:{name:'Frost Yeti',lv:65,hp:8500,atk:350,def:90,flee:25,exp:4700,jexp:3150,spd:60,aggro:true,shape:'golem',col:'#eef4f8',size:20,el:'water',ail:['stun',.1,1.5],drops:[['yetifur',.45],['orange',.12]],sig:{kind:'armor',b:{maxhp:450,vit:2},txt:'+450 Max HP, +2 VIT'}},
  tuskwalrus:{name:'Tusked Walrus',lv:69,hp:9800,atk:380,def:120,flee:20,exp:5300,jexp:3600,spd:42,shape:'blob',col:'#8a6a5a',size:19,el:'water',drops:[['walrustusk',.45],['emberore',.06]],sig:{kind:'head',b:{vit:3,maxhp:250},txt:'+3 VIT, +250 Max HP'}},
  frostbeak:{name:'Frostbeak Penguin',lv:72,hp:6400,atk:420,def:70,flee:85,exp:6000,jexp:4100,spd:110,aggro:true,shape:'imp',col:'#2a3a4a',size:13,el:'water',drops:[['penguinfeather',.4],['orange',.12]],sig:{kind:'weapon',b:{atk:32,agi:2},txt:'+32 ATK, +2 AGI'}},
  hrimfang:{name:'Hrimfang the Glacier Wyrm',lv:78,hp:100000,atk:540,def:130,flee:60,exp:85000,jexp:55000,spd:65,aggro:true,boss:true,mini:true,calls:true,shape:'beast',col:'#5ab0e0',size:28,el:'water',ail:['freeze',.08,1.5],respawn:180,sigChance:.15,
    drops:[['hrimtalisman',.2],['rimescale',1],['orange',1],['glintstone',.45],['emberore',.45]],sig:{kind:'weapon',b:{matk:80,int:4},txt:'+80 MATK, +4 INT'}},
  // ---- Duskwood (Lv 64-78): a forest of endless twilight at the far west ----
  gloamstag:{name:'Gloam Stag',lv:65,hp:7000,atk:345,def:70,flee:70,exp:4600,jexp:3100,spd:110,aggro:true,shape:'beast',col:'#5a4a8a',size:17,el:'shadow',drops:[['gloamantler',.45],['orange',.12]],sig:{kind:'weapon',b:{atk:30,str:2},txt:'+30 ATK, +2 STR'}},
  duskweaver:{name:'Dusk Weaver',lv:68,hp:6600,atk:375,def:60,flee:75,exp:5200,jexp:3500,spd:80,aggro:true,shape:'bug',col:'#3a2a5a',size:15,el:'shadow',ail:['poison',.14,6],drops:[['shadowsilk',.45],['remedy',.08]],sig:{kind:'armor',b:{flee:6,agi:2},txt:'+6 FLEE, +2 AGI'}},
  nightdryad:{name:'Nightbloom Dryad',lv:72,hp:6800,atk:410,def:55,flee:90,exp:6000,jexp:4100,spd:75,aggro:true,range:180,shape:'ghost',col:'#8a5ac8',size:14,el:'earth',ail:['sleep',.12,3],drops:[['nightbloom',.4],['blue',.12]],sig:{kind:'weapon',b:{matk:75,int:3},txt:'+75 MATK, +3 INT'}},
  duskpanther:{name:'Duskfang Panther',lv:76,hp:8600,atk:465,def:80,flee:95,exp:7000,jexp:4750,spd:125,aggro:true,shape:'beast',col:'#2a2238',size:17,el:'shadow',drops:[['pantherfang',.4],['orange',.12]],sig:{kind:'accessory',b:{agi:4,crit:5},txt:'+4 AGI, +5 CRIT'}},
  hollowking:{name:'The Hollow King',lv:80,hp:110000,atk:560,def:140,flee:70,exp:90000,jexp:60000,spd:70,aggro:true,undead:true,boss:true,mini:true,calls:true,range:190,shape:'ghost',col:'#4a3a6a',size:28,el:'shadow',ail:['blind',.12,5],respawn:180,sigChance:.15,
    drops:[['hollowcrown',.2],['shadowsilk',1],['orange',1],['glintstone',.45],['emberore',.45]],sig:{kind:'head',b:{int:4,str:4},txt:'+4 INT, +4 STR'}},
  // ---- Stormcrown Peaks (Lv 80-92): the roof of the world, far north, where the storms are born ----
  thunderhawk:{name:'Thunderhawk',lv:81,hp:9000,atk:530,def:75,flee:120,exp:9000,jexp:6000,spd:125,aggro:true,range:170,shape:'beast',col:'#e8eef8',size:14,el:'wind',drops:[['stormfeather',.4],['blue',.12]],sig:{kind:'accessory',b:{agi:4,flee:8},txt:'+4 AGI, +8 FLEE'}},
  stormelemental:{name:'Storm Elemental',lv:84,hp:11000,atk:560,def:100,flee:70,exp:10000,jexp:6700,spd:70,aggro:true,shape:'ghost',col:'#5a8ad0',size:18,el:'wind',ail:['stun',.1,1.5],drops:[['stormcore',.4],['blue',.12]],sig:{kind:'weapon',b:{matk:95,int:4},txt:'+95 MATK, +4 INT'}},
  skygriffin:{name:'Sky Griffin',lv:87,hp:13000,atk:600,def:110,flee:100,exp:11800,jexp:7900,spd:120,aggro:true,shape:'beast',col:'#c8a060',size:19,el:'wind',drops:[['griffinplume',.4],['orange',.14]],sig:{kind:'weapon',b:{atk:45,agi:3},txt:'+45 ATK, +3 AGI'}},
  peakgiant:{name:'Peak Giant',lv:90,hp:21000,atk:650,def:200,flee:20,exp:14500,jexp:9700,spd:45,aggro:true,shape:'golem',col:'#6a6e78',size:23,el:'earth',ail:['stun',.12,1.5],drops:[['giantstone',.4],['glintstone',.08]],sig:{kind:'armor',b:{def:18,maxhp:600},txt:'+18 DEF, +600 Max HP'}},
  voltaris:{name:'Voltaris the Tempest Roc',lv:95,hp:160000,atk:760,def:160,flee:110,exp:150000,jexp:100000,spd:110,aggro:true,boss:true,mini:true,calls:true,range:190,shape:'beast',col:'#3a5a9a',size:30,el:'wind',respawn:210,sigChance:.15,
    drops:[['tempestplume',.2],['stormcore',1],['orange',1],['glintstone',.5],['emberore',.5]],sig:{kind:'accessory',b:{agi:5,dex:5},txt:'+5 AGI, +5 DEX'}}};
Object.assign(MOBS,R4_MOBS);
Object.assign(MOB_SKILL,{nightdryad:'heal',prismmoth:'blink',rimedrake:'bolt',thunderhawk:'bolt',stormelemental:'bolt',bloomtrap:'heal'});
for(const id of ['nightdryad','prismmoth','rimedrake','thunderhawk','stormelemental','bloomtrap'])MOBS[id].skill=MOB_SKILL[id];
for(const id of ['relicrat','howlerape','glasslynx','frostbeak','duskpanther'])MOBS[id].pack=true;
for(const id in R4_MOBS){const m=MOBS[id];m.id=id;m.hit=m.lv*2+12;
  ITEMS[id+'_sig']={name:m.name+' Sigil',type:'sigil',kind:m.sig.kind,b:m.sig.b,price:m.boss?20000:600,col:'#ffcf5a',g:'✦',desc:`Socket into ${/^[aeiou]/.test(m.sig.kind)?'an':'a'} ${m.sig.kind}: ${m.sig.txt}.`};}
for(const id in ITEMS)if(!ITEMS[id].id)ITEMS[id].id=id;

Object.assign(ZONES,{
  downs:{name:'Goldleaf Downs',w:64,h:44,theme:'downs',music:'downs',seed:229,density:.04,ponds:3,lvl:'Lv 3–14',
    mobs:[['fluffwool',14],['burrowmole',10],['bumblewing',8],['thistlehog',6],['hopper',4],['woolhorn',1],['fluffwool',4,'woolhorn']],links:{}},
  ridge:{name:'Pinewatch Ridge',w:62,h:46,theme:'pines',music:'pines',seed:241,density:.1,ponds:2,lvl:'Lv 18–30',
    mobs:[['pinesprite',12],['timberboar',10],['hollowowl',8],['ridgebruin',6],['antlerking',1],['timberboar',4,'antlerking']],links:{}},
  ruins:{name:'Old Aurel Ruins',w:64,h:44,theme:'ruins',music:'ruins',seed:257,density:.08,ponds:2,lvl:'Lv 22–34',
    mobs:[['relicrat',12],['ivycreeper',10],['stonesentry',7],['relicmimic',5],['wraith',4],['fallenpaladin',1],['stonesentry',3,'fallenpaladin']],links:{}},
  jungle:{name:'Thornveil Jungle',w:66,h:46,theme:'jungle',music:'jungle',seed:263,density:.12,ponds:5,lvl:'Lv 35–48',
    mobs:[['vineviper',12],['howlerape',10],['bloomtrap',7],['jadetoad',6],['orchidra',1],['vineviper',4,'orchidra']],links:{}},
  steppe:{name:'Crystal Steppe',w:66,h:46,theme:'crystal',music:'crystal',seed:271,density:.06,ponds:3,lvl:'Lv 45–58',
    mobs:[['shardling',12],['prismmoth',9],['geodetortoise',6],['glasslynx',6],['geodecolossus',1],['shardling',4,'geodecolossus']],links:{}},
  glacier:{name:'Skyreach Glacier',w:64,h:46,theme:'glacier',music:'glacier',seed:283,density:.07,ponds:4,lvl:'Lv 60–75',
    mobs:[['rimedrake',11],['frostyeti',9],['tuskwalrus',7],['frostbeak',7],['hrimfang',1],['rimedrake',3,'hrimfang']],links:{}},
  dusk:{name:'Duskwood',w:64,h:46,theme:'dusk',music:'dusk',seed:293,density:.1,ponds:3,lvl:'Lv 64–78',
    mobs:[['gloamstag',11],['duskweaver',9],['nightdryad',7],['duskpanther',7],['hollowking',1],['duskpanther',3,'hollowking']],links:{}},
  peaks:{name:'Stormcrown Peaks',w:66,h:46,theme:'storm',music:'storm',seed:307,density:.07,ponds:1,lvl:'Lv 80–92',
    mobs:[['thunderhawk',11],['stormelemental',8],['skygriffin',7],['peakgiant',6],['voltaris',1],['thunderhawk',3,'voltaris']],links:{}}});
// tex: which ground texture to draw; rocky: obstacles are rocks, not trees; tree / rock: which upright picture to use
Object.assign(THEMES,{
  downs:{g:['#7fb24e','#84b752','#7aac4a'],path:'#d2b77e',canopy:['#4f8f3a','#6aa84a'],water:'#4a98d0'},
  pines:{g:['#45714a','#48754d','#426c47'],path:'#8f7a58',canopy:['#1f4a32','#2a5a3c'],water:'#3a6a8a',tree:'greenpine'},
  ruins:{g:['#6f8a5a','#738e5e','#6a8456'],path:'#a89e88',rock:['#9a948a','#bab4a8'],water:'#4a7a8a',cob:'#9a948a',rocky:true,rockKind:'ruin'},
  jungle:{g:['#3f7a3a','#43803e','#3b7436'],path:'#7a6a44',canopy:['#1e5a2a','#2f7a34'],water:'#2f7a7a',tree:'jungletree'},
  crystal:{g:['#a9a3c4','#aea8c8','#a39dbe'],path:'#c8bfd8',rock:['#8a6ad0','#b8a0f0'],water:'#7ab8e8',rocky:true,rockKind:'shardrock',tex:'frost'},
  glacier:{g:['#d8e8f2','#deedf6','#d2e3ee'],path:'#a8bccc',rock:['#9cc8e8','#d8f0ff'],water:'#6ab0d8',rocky:true,rockKind:'icespire',tex:'frost'},
  dusk:{g:['#3f3a58','#433e5c','#3b3654'],path:'#6a5a7a',canopy:['#3a2a5a','#5a3a7a'],water:'#4a3a8a',tree:'dusktree'},
  storm:{g:['#5a5e66','#5e626a','#565a62'],path:'#7a7a80',rock:['#3a3e46','#5a5e68'],water:'#4a6a8a',rocky:true,rockKind:'crag',tex:'crypt'}});

/* ---- the roads: every region's gates, rebuilt as a grid around the city (x grows east, y grows south) ----
   Hearthvale is (0,0) and Aurelmark (-1,0); two regions next to each other on the grid share a gate. */
const WORLD_GRID={town:[0,0],capital:[-1,0],
  heights:[0,-1],ridge:[0,-2],frost:[0,-3],glacier:[0,-4],peaks:[0,-5],
  meadow:[1,0],woods:[2,0],jungle:[3,0],fen:[4,0],
  farms:[0,1],dunes:[0,2],crypt:[0,3],coast:[0,4],caldera:[0,5],
  downs:[-2,0],ruins:[-3,0],steppe:[-4,0],dusk:[-5,0],
  // (v1.61.1) the corners round the cities (js/regions5.js): the middle of the map is one land, not a plus sign
  bramble:[1,-1],amber:[1,1],mist:[-1,-1],thornmere:[-2,-1]};
// how far a region is from the city: the number of regions you walk through to reach it
// (v1.61.1) counted along the roads (the world has loops now), from either city
function worldRing(id){if(!WORLD_GRID[id])return 0;if(!worldRing.d){const d={town:0,capital:0},q=['town','capital'];
    while(q.length){const a=q.shift();for(const b of Object.values(worldLinks(a)))if(d[b]===undefined){d[b]=d[a]+1;q.push(b);}}worldRing.d=d;}
  return worldRing.d[id]||0;}
// (Aurelmark is defined later, in capital.js, which takes its links from worldLinks('capital'))
// the cities keep the gates they were built with (Hearthvale: four, Aurelmark: east and west)
const CITY_GATES={town:['capital','heights','meadow','farms'],capital:['town','downs']};
function worldLinks(a){const L={},[ax,ay]=WORLD_GRID[a];for(const b in WORLD_GRID){const [bx,by]=WORLD_GRID[b];
  if((CITY_GATES[a]&&!CITY_GATES[a].includes(b))||(CITY_GATES[b]&&!CITY_GATES[b].includes(a)))continue;
  if(bx===ax+1&&by===ay)L.east=b;else if(bx===ax-1&&by===ay)L.west=b;else if(by===ay-1&&bx===ax)L.north=b;else if(by===ay+1&&bx===ax)L.south=b;}return L;}
for(const id in WORLD_GRID)if(ZONES[id])ZONES[id].links=worldLinks(id);
// (v1.61.1) gates sit at their own place along each edge (js/world.js); these two regions take another draw so the
// road misses their land (a ridge and a hollow would not fit, and walks round them got long)
ZONES.glacier.gateSalt='4';ZONES.jungle.gateSalt='1';
// the travel list, nearest first (Tobin's fare grows with the place in this list)
{const ring=id=>WORLD_GRID[id]?worldRing(id):99,arm=id=>{const p=WORLD_GRID[id]||[0,0];return p[1]<0?0:p[0]>0?1:p[1]>0?2:3;};
  for(const id of Object.keys(WORLD_GRID))if(!ZONE_ORDER.includes(id))ZONE_ORDER.push(id);
  const rest=ZONE_ORDER.filter(id=>id!=='town').sort((a,b)=>(a==='capital'?-1:b==='capital'?1:0)||ring(a)-ring(b)||((a==='meadow')?-1:(b==='meadow')?1:0)||arm(a)-arm(b));
  ZONE_ORDER.length=0;ZONE_ORDER.push('town',...rest);}
