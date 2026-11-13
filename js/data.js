"use strict";
/* ================= constants & data ================= */
const VERSION='1.0.1';
// chance that a normal monster drops its sigil (card); bosses set their own sigChance
const SIG_CHANCE=.01;
const TILE=32, PR=10, SAVE_KEY='embervale.save.v1';
const BLOCK=[0,0,1,1,1,1,0,0]; // 0 ground 1 path 2 tree 3 water 4 rock 5 building 6 cobble 7 flowers
const DIRS=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];
const STATS=['str','agi','vit','int','dex','luk'];
const STAT_DESC={str:'Melee ATK, carry weight',agi:'Attack speed, FLEE',vit:'Max HP, DEF, regen',int:'MATK, Max SP',dex:'HIT, bow ATK',luk:'Critical hits'};

const CLASSES={
  novice:{name:'Novice',hp:1,sp:1,aspd:1.1,weapons:['club'],col:'#c9b38f',hair:'#6b4a2a',skills:['firstaid']},
  warden:{name:'Warden',hp:1.6,sp:.8,aspd:.95,weapons:['club','sword','axe'],col:'#b8473a',hair:'#3b2b20',gift:'sword',skills:['cleave','whirl','ironwill','firstaid'],
    desc:'Shield-wall fighter. The most HP, heavy melee hits and a spinning area attack.'},
  arcanist:{name:'Arcanist',hp:.85,sp:2,aspd:1.1,weapons:['club','wand'],col:'#5e4fc0',hair:'#d8d4e8',gift:'wand',magic:true,skills:['emberbolt','frostnova','arcstorm','firstaid'],
    desc:'Ranged spellcaster. Fragile, but casts fire, frost and lightning from a distance.'},
  ranger:{name:'Ranger',hp:1.15,sp:1.1,aspd:.85,weapons:['club','bow'],col:'#3f8a4c',hair:'#a5652b',gift:'bow',skills:['twinshot','arrowrain','hawkeye','firstaid'],
    desc:'Archer. Fast attacks from long range, scaling with DEX.'},
  cleric:{name:'Cleric',hp:1.3,sp:1.6,aspd:1,weapons:['club','mace','wand'],col:'#d8b84f',hair:'#e9d9a8',gift:'mace',skills:['smite','mend','blessing','firstaid'],
    desc:'Battle healer. Heals and buffs itself, and its holy Smite hits undead for double.'},
};

const ITEMS={
  red:{name:'Red Tonic',type:'use',price:15,heal:50,col:'#d9483f',g:'R',desc:'Restores 50 HP.'},
  orange:{name:'Amber Tonic',type:'use',price:70,heal:180,col:'#e08a3a',g:'A',desc:'Restores 180 HP.'},
  blue:{name:'Blue Tonic',type:'use',price:150,sp:60,col:'#4a8fd9',g:'B',desc:'Restores 60 SP.'},
  leaf:{name:'Drift Leaf',type:'use',price:40,tele:true,col:'#7fd36a',g:'L',desc:'Teleports you to a random spot in this region.'},
  waystone:{name:'Waystone Shard',type:'use',price:450,pick:true,col:'#8ff0ff',g:'W',desc:'Carries you to any region you have visited, dungeon floors too.'},
  kinship:{name:'Kinship Charm',type:'use',price:300,kin:true,col:'#8fe0a8',g:'K',desc:'Pulls you to the side of a party member, wherever they are.'},
  remedy:{name:'Remedy Draught',type:'use',price:50,cure:true,col:'#c58cff',g:'C',desc:'Cures poison, stun, sleep, freeze, silence and blindness.'},
  scroll:{name:'Hearth Scroll',type:'use',price:120,home:true,col:'#e0b84a',g:'H',desc:'Returns you to Hearthvale.'},
  sap:{name:'Sap Drop',type:'etc',price:6,col:'#9be38a',g:'•'}, tuft:{name:'Hopper Tuft',type:'etc',price:10,col:'#e3cfae',g:'•'},
  shell:{name:'Moss Shell',type:'etc',price:16,col:'#8aa45a',g:'•'}, thorn:{name:'Thorn Barb',type:'etc',price:30,col:'#5a9b48',g:'•'},
  pelt:{name:'Lupe Pelt',type:'etc',price:44,col:'#a3a8b2',g:'•'}, spore:{name:'Glow Spore',type:'etc',price:58,col:'#e0735f',g:'•'},
  carapace:{name:'Scarab Carapace',type:'etc',price:90,col:'#4f86aa',g:'•'}, dust:{name:'Wraith Dust',type:'etc',price:115,col:'#e3d6ad',g:'•'},
  needle:{name:'Cactoid Needle',type:'etc',price:140,col:'#73b064',g:'•'}, bone:{name:'Bone Shard',type:'etc',price:170,col:'#ece6d4',g:'•'},
  core:{name:'Ember Core',type:'etc',price:230,col:'#f08a3a',g:'•'}, crest:{name:'Warlord Crest',type:'etc',price:6000,col:'#ffcf5a',g:'★'},
  club:{name:'Wooden Club',type:'weapon',wt:'club',atk:8,price:40,lv:1,slots:0,col:'#b08a5a',g:'W'},
  spiked:{name:'Spiked Club',type:'weapon',wt:'club',atk:22,price:350,lv:6,slots:1,col:'#b08a5a',g:'W'},
  sword:{name:'Iron Sword',type:'weapon',wt:'sword',atk:34,price:500,lv:1,slots:1,col:'#c8ccd4',g:'W'},
  bastion:{name:'Bastion Blade',type:'weapon',wt:'sword',atk:80,price:3200,lv:25,slots:1,col:'#c8ccd4',g:'W'},
  axe:{name:'Reaver Axe',type:'weapon',wt:'axe',atk:125,price:8000,lv:36,slots:0,col:'#c8ccd4',g:'W'},
  wand:{name:'Oak Wand',type:'weapon',wt:'wand',atk:6,matk:30,price:500,lv:1,slots:1,col:'#a98dd8',g:'W'},
  rod:{name:'Starfire Rod',type:'weapon',wt:'wand',atk:10,matk:88,price:3400,lv:25,slots:1,col:'#a98dd8',g:'W'},
  bow:{name:'Hunter Bow',type:'weapon',wt:'bow',atk:30,price:500,lv:1,slots:1,col:'#8fc28a',g:'W'},
  longbow:{name:'Gale Longbow',type:'weapon',wt:'bow',atk:76,price:3400,lv:25,slots:1,col:'#8fc28a',g:'W'},
  mace:{name:'Iron Mace',type:'weapon',wt:'mace',atk:28,matk:15,price:500,lv:1,slots:1,col:'#e3cf86',g:'W'},
  sunmace:{name:'Sun Mace',type:'weapon',wt:'mace',atk:64,matk:56,price:3400,lv:25,slots:1,col:'#e3cf86',g:'W'},
  tunic:{name:'Cotton Tunic',type:'armor',def:3,price:30,lv:1,slots:0,col:'#d6cbb3',g:'A'},
  vest:{name:'Leather Vest',type:'armor',def:10,price:400,lv:8,slots:1,col:'#a8774a',g:'A'},
  robe:{name:'Sage Robe',type:'armor',def:8,b:{int:3,maxsp:40},price:1500,lv:15,slots:1,col:'#7d6ad0',g:'A'},
  scale:{name:'Scale Mail',type:'armor',def:24,price:2200,lv:20,slots:1,col:'#8fa0b0',g:'A'},
  plate:{name:'Ember Plate',type:'armor',def:42,price:6500,lv:32,slots:1,col:'#c0603a',g:'A'},
  strawhat:{name:'Straw Hat',type:'head',def:1,price:120,lv:1,slots:0,col:'#e0c070',g:'^'},
  ribbon:{name:'Ribbon Bow',type:'head',b:{luk:1},price:200,lv:1,slots:0,col:'#f07ca0',g:'^'},
  sprout:{name:'Leaf Sprout',type:'head',b:{vit:1,maxhp:25},price:400,lv:1,slots:0,col:'#7fd36a',g:'^'},
  lupeears:{name:'Lupe Ears',type:'head',b:{agi:2},price:1200,lv:10,slots:0,col:'#a3a8b2',g:'^'},
  turban:{name:'Sand Turban',type:'head',def:3,b:{int:2},price:2400,lv:20,slots:0,col:'#efe6d2',g:'^'},
  imphorns:{name:'Imp Horns',type:'head',b:{atk:6,matk:15},price:4000,lv:30,slots:0,col:'#a33a2a',g:'^'},
  frostcap:{name:'Frost Cap',type:'head',def:5,b:{vit:2},price:5000,lv:40,slots:0,col:'#6fa8d8',g:'^'},
  hopcharm:{name:'Chieftain Charm',type:'accessory',b:{agi:3,luk:3,crit:2},price:4000,lv:10,slots:1,col:'#c89a6a',g:'O',desc:'Dropped by the Hopper Chieftain. AGI +3 · LUK +3 · CRIT +2.'},
  alphafang:{name:'Alpha Fang',type:'accessory',b:{str:3,atk:15,crit:3},price:8000,lv:18,slots:1,col:'#d8dce4',g:'O',desc:'Dropped by the Greymane Alpha. STR +3 · ATK +15 · CRIT +3.'},
  queenamulet:{name:'Queen\'s Amulet',type:'accessory',b:{vit:3,def:6,maxhp:200},price:14000,lv:28,slots:1,col:'#4f86aa',g:'O',desc:'Dropped by the Scarab Queen. VIT +3 · DEF +6 · Max HP +200.'},
  frostheart:{name:'Frostheart Pendant',type:'accessory',b:{int:4,matk:35,maxsp:80},price:30000,lv:48,slots:1,col:'#bfe6ff',g:'O',desc:'Dropped by the Frost Matron. INT +4 · MATK +35 · Max SP +80.'},
  glowsilk:{name:'Glow Silk',type:'etc',price:70,col:'#c8f0a0',g:'•'}, batwing:{name:'Bat Wing',type:'etc',price:80,col:'#7a6a8a',g:'•'},
  crabshell:{name:'Crab Shell',type:'etc',price:120,col:'#a8a090',g:'•'}, gloomspore:{name:'Gloom Spore',type:'etc',price:135,col:'#9a7ac0',g:'•'},
  shadeveil:{name:'Shade Veil',type:'etc',price:160,col:'#5a5a7a',g:'•'}, trollhide:{name:'Troll Hide',type:'etc',price:190,col:'#7a8a6a',g:'•'},
  gloomhat:{name:'Gloomcap Hat',type:'head',def:3,b:{int:3,matk:25,maxsp:50},price:9000,lv:30,slots:0,col:'#6a4a8a',g:'^',desc:'Dropped by the Gloomcap King. DEF 3 · INT +3 · MATK +25 · Max SP +50.'},
  thorncrown:{name:'Thorn Crown',type:'head',def:4,b:{vit:3,maxhp:250,regen:3},price:15000,lv:20,slots:0,col:'#5a9b48',g:'^',desc:'MVP prize from the Thornmother. DEF 4 · VIT +3 · Max HP +250 · HP regen +3.'},
  tyranthelm:{name:'Tyrant Helm',type:'head',def:7,b:{str:4,atk:20},price:25000,lv:32,slots:0,col:'#a07a42',g:'^',desc:'MVP prize from the Dune Tyrant. DEF 7 · STR +4 · ATK +20.'},
  rimehalo:{name:'Rime Halo',type:'head',def:5,b:{int:5,matk:50,maxsp:100},price:40000,lv:45,slots:0,col:'#bfe6ff',g:'^',desc:'MVP prize from the Rimeheart Colossus. DEF 5 · INT +5 · MATK +50 · Max SP +100.'},
  crown:{name:'Ember Crown',type:'head',def:4,b:{str:3,int:3,maxhp:150},price:20000,lv:40,slots:0,col:'#ffcf5a',g:'^'},
  emberore:{name:'Ember Ore',type:'etc',price:150,col:'#e07a3a',g:'◆',desc:'The smith uses one to refine a weapon.'},
  glintstone:{name:'Glintstone',type:'etc',price:120,col:'#9fd6ff',g:'◆',desc:'The smith uses one to refine armour, a hat or an accessory.'},
  fang:{name:'Rime Fang',type:'etc',price:260,col:'#cfe3f0',g:'•'}, shard:{name:'Frost Shard',type:'etc',price:280,col:'#9fd6ff',g:'•'}, fur:{name:'Snowhulk Fur',type:'etc',price:310,col:'#f0f4f8',g:'•'},
  ring:{name:'Brass Ring',type:'accessory',b:{str:2},price:300,lv:1,slots:1,col:'#d9b45a',g:'O'},
  clip:{name:'Silver Clip',type:'accessory',b:{maxsp:30},price:900,lv:10,slots:1,col:'#cfd6de',g:'O'},
  charm:{name:'Clover Charm',type:'accessory',b:{luk:4,crit:3},price:900,lv:10,slots:1,col:'#7fd38a',g:'O'},
};
// #17 item weight (explicit `w` wins, otherwise a default by type)
const WEAPON_W={club:40,sword:80,axe:150,wand:30,bow:50,mace:70},ARMOR_W={tunic:10,vest:40,robe:30,scale:120,plate:180};
function itemWeight(id){const it=ITEMS[id];if(!it)return 0;if(it.w!=null)return it.w;
  if(it.type==='weapon')return WEAPON_W[it.wt]||50;if(it.type==='armor')return ARMOR_W[id]||50;if(it.type==='head')return 15;if(it.type==='face'||it.type==='mouth')return 5;if(it.type==='accessory')return 10;
  if(it.type==='sigil')return 1;if(it.type==='use')return id==='scroll'||id==='leaf'||id==='waystone'||id==='kinship'?1:5;return id==='crest'?20:2;}
/* ---- #20 rarity: colour-coded item names ---- */
const RARITY=[{name:'Common',col:'#e8e2d2'},{name:'Uncommon',col:'#7fd38a'},{name:'Rare',col:'#6fb0ff'},{name:'Epic',col:'#c58cff'},{name:'Legendary',col:'#ffb347'}];
const LEGENDARY=new Set(['crest','crown']),RARE_DROPS=new Set(['sprout','lupeears','turban','imphorns','frostcap']);
function rarityOf(id){const it=ITEMS[id];if(!it)return 0;if(LEGENDARY.has(id))return 4;if(it.type==='sigil')return 3;if(RARE_DROPS.has(id))return 2;
  if((it.type==='weapon'||it.type==='armor'||it.type==='accessory')&&it.price>=3000)return 1;return 0;}
const rarityCol=id=>RARITY[rarityOf(id)].col;
/* ---- #18 refining ---- */
const REFINE_CHANCE=[0,1,1,1,1,.9,.75,.55,.4,.25,.15]; // chance to reach +N
const refineFee=n=>200*n;
const refineMat=id=>ITEMS[id].type==='weapon'?'emberore':'glintstone';
function refineBonus(e){const r=e.r||0;if(!r)return {};const it=ITEMS[e.id];
  if(it.type==='weapon'){const o={atk:r*Math.max(3,Math.round((it.atk||0)*.06))};if(it.matk)o.matk=r*Math.max(2,Math.round(it.matk*.06));return o;}
  return {def:r};}
function itemName(e){return (e.r?`+${e.r} `:'')+ITEMS[e.id].name;}
const SHOP=['red','orange','blue','remedy','leaf','scroll','waystone','kinship','strawhat','ribbon','spiked','sword','wand','bow','mace','bastion','rod','longbow','sunmace','axe','tunic','vest','robe','scale','plate','ring','clip','charm'];

const MOBS={
  sproutling:{name:'Sproutling',lv:2,hp:42,atk:6,def:0,flee:3,exp:12,jexp:10,spd:38,shape:'blob',col:'#8fd16a',size:12,leaf:true,drops:[['sap',.55],['red',.08],['sprout',.012]],sig:{kind:'armor',b:{maxhp:80},txt:'+80 Max HP'}},
  hopper:{name:'Hopper',lv:4,hp:75,atk:10,def:2,flee:10,exp:22,jexp:17,spd:75,shape:'beast',col:'#d8b48a',size:11,drops:[['tuft',.5],['red',.08]],sig:{kind:'accessory',b:{agi:2},txt:'+2 AGI'}},
  mossbug:{name:'Mossbug',lv:7,hp:130,atk:15,def:8,flee:6,exp:40,jexp:30,spd:45,shape:'bug',col:'#6f8f3a',size:12,drops:[['shell',.5],['orange',.04]],sig:{kind:'armor',b:{def:4},txt:'+4 DEF'}},
  thornling:{name:'Thornling',lv:11,hp:280,atk:30,def:10,flee:14,exp:105,jexp:80,spd:60,aggro:true,shape:'blob',col:'#4e8a3d',size:13,spikes:true,drops:[['thorn',.5],['red',.1]],sig:{kind:'weapon',b:{atk:15},txt:'+15 ATK'}},
  greylupe:{name:'Grey Lupe',lv:14,hp:400,atk:42,def:12,flee:25,exp:155,jexp:115,spd:100,aggro:true,shape:'beast',col:'#8a909c',size:14,drops:[['pelt',.45],['orange',.05],['lupeears',.015]],sig:{kind:'accessory',b:{flee:10,agi:1},txt:'+10 FLEE, +1 AGI'}},
  mushcap:{name:'Mushcap',lv:17,hp:600,atk:50,def:22,flee:12,exp:230,jexp:165,spd:42,shape:'mushroom',col:'#c4523d',size:14,drops:[['spore',.5],['blue',.03]],sig:{kind:'armor',b:{vit:3,maxhp:120},txt:'+3 VIT, +120 Max HP'}},
  scarab:{name:'Dune Scarab',lv:22,hp:950,atk:72,def:42,flee:20,exp:380,jexp:260,spd:58,shape:'bug',col:'#3a6a8a',size:14,drops:[['carapace',.45],['orange',.06],['turban',.015]],sig:{kind:'armor',b:{def:10},txt:'+10 DEF'}},
  wraith:{name:'Dust Wraith',lv:26,hp:1050,atk:92,def:15,flee:55,exp:520,jexp:360,spd:85,aggro:true,undead:true,shape:'ghost',col:'#d8c99a',size:14,drops:[['dust',.45],['blue',.05]],sig:{kind:'accessory',b:{flee:20},txt:'+20 FLEE'}},
  cactoid:{name:'Cactoid',lv:30,hp:1700,atk:108,def:58,flee:15,exp:720,jexp:490,spd:34,shape:'blob',col:'#5d9b52',size:15,spikes:true,drops:[['needle',.45],['orange',.08]],sig:{kind:'weapon',b:{atk:10,str:3},txt:'+10 ATK, +3 STR'}},
  bonearcher:{name:'Bone Archer',lv:34,hp:1900,atk:120,def:35,flee:35,exp:920,jexp:640,spd:55,aggro:true,undead:true,range:190,shape:'skeleton',col:'#e8e2cf',size:13,drops:[['bone',.45],['blue',.06]],sig:{kind:'weapon',b:{dex:3,hit:15},txt:'+3 DEX, +15 HIT'}},
  emberimp:{name:'Ember Imp',lv:38,hp:2300,atk:150,def:40,flee:45,exp:1180,jexp:820,spd:105,aggro:true,shape:'imp',col:'#e06a2b',size:12,drops:[['core',.4],['orange',.1],['imphorns',.015]],sig:{kind:'weapon',b:{matk:35},txt:'+35 MATK'}},
  rimestalker:{name:'Rime Stalker',lv:44,hp:3000,atk:190,def:55,flee:60,exp:1700,jexp:1150,spd:110,aggro:true,shape:'beast',col:'#a9c6dc',size:15,drops:[['fang',.4],['orange',.1]],sig:{kind:'accessory',b:{agi:3,crit:5},txt:'+3 AGI, +5 CRIT'}},
  frostwisp:{name:'Frost Wisp',lv:47,hp:2800,atk:210,def:30,flee:80,exp:1900,jexp:1300,spd:90,aggro:true,range:160,shape:'ghost',col:'#bfe6ff',size:13,drops:[['shard',.4],['blue',.1]],sig:{kind:'weapon',b:{matk:50,int:2},txt:'+50 MATK, +2 INT'}},
  snowhulk:{name:'Snowhulk',lv:50,hp:5200,atk:240,def:85,flee:25,exp:2600,jexp:1800,spd:45,shape:'blob',col:'#e8f2f8',size:19,drops:[['fur',.4],['frostcap',.02]],sig:{kind:'armor',b:{vit:4,def:6},txt:'+4 VIT, +6 DEF'}},
  // #41 mini-bosses: each leads an escort pack and calls fallen escorts back below 60% and 30% HP
  hopperchief:{name:'Hopper Chieftain',lv:12,hp:3200,atk:75,def:15,flee:25,exp:2200,jexp:1500,spd:60,boss:true,mini:true,calls:true,shape:'beast',col:'#c89a6a',size:20,respawn:120,sigChance:.15,
    drops:[['hopcharm',.2],['tuft',1],['orange',.5],['emberore',.15]],sig:{kind:'accessory',b:{agi:3,luk:2},txt:'+3 AGI, +2 LUK'}},
  lupealpha:{name:'Greymane Alpha',lv:20,hp:7000,atk:130,def:30,flee:45,exp:6000,jexp:4000,spd:85,aggro:true,boss:true,mini:true,calls:true,shape:'beast',col:'#5a606c',size:22,respawn:120,sigChance:.15,
    drops:[['alphafang',.2],['pelt',1],['orange',.6],['emberore',.2]],sig:{kind:'weapon',b:{atk:18,crit:3},txt:'+18 ATK, +3 CRIT'}},
  scarabqueen:{name:'Scarab Queen',lv:30,hp:14000,atk:190,def:70,flee:30,exp:13000,jexp:8500,spd:50,aggro:true,boss:true,mini:true,calls:true,shape:'bug',col:'#2a5a7a',size:24,respawn:120,sigChance:.15,
    drops:[['queenamulet',.2],['carapace',1],['orange',.8],['glintstone',.3]],sig:{kind:'armor',b:{def:8,vit:3},txt:'+8 DEF, +3 VIT'}},
  frostmatron:{name:'Frost Matron',lv:52,hp:42000,atk:330,def:90,flee:60,exp:40000,jexp:26000,spd:70,aggro:true,boss:true,mini:true,calls:true,shape:'beast',col:'#dff0fa',size:24,respawn:150,sigChance:.15,
    drops:[['frostheart',.2],['fang',1],['orange',1],['glintstone',.4],['emberore',.4]],sig:{kind:'accessory',b:{int:4,maxsp:80},txt:'+4 INT, +80 Max SP'}},
  // #34 Mossdeep Caverns
  // #39 twelve more monsters (v0.67.0), appended to the end of each region's list so the server and game agree
  puffcap:{name:'Puffcap',lv:5,hp:95,atk:12,def:4,flee:6,exp:30,jexp:24,spd:40,shape:'mushroom',col:'#e8b0d0',size:11,el:'earth',drops:[['spore',.35],['red',.08]],sig:{kind:'head',b:{maxsp:25},txt:'+25 Max SP'}},
  dewdrop:{name:'Dewdrop',lv:8,hp:150,atk:17,def:5,flee:12,exp:48,jexp:36,spd:55,shape:'blob',col:'#7fc8f0',size:11,el:'water',drops:[['sap',.45],['blue',.03]],sig:{kind:'accessory',b:{int:2},txt:'+2 INT'}},
  barkling:{name:'Barkling',lv:15,hp:520,atk:44,def:28,flee:10,exp:180,jexp:130,spd:40,shape:'golem',col:'#8a6a42',size:14,el:'earth',drops:[['thorn',.45],['orange',.05]],sig:{kind:'armor',b:{def:6,vit:1},txt:'+6 DEF, +1 VIT'}},
  webspinner:{name:'Webspinner',lv:18,hp:640,atk:55,def:16,flee:30,exp:250,jexp:180,spd:70,aggro:true,shape:'bug',col:'#5a4a6a',size:13,el:'earth',ail:['poison',.15,6],drops:[['glowsilk',.35],['remedy',.05]],sig:{kind:'weapon',b:{dex:2,hit:8},txt:'+2 DEX, +8 HIT'}},
  shriekcap:{name:'Shriekcap',lv:21,hp:880,atk:76,def:20,flee:18,exp:340,jexp:230,spd:45,shape:'mushroom',col:'#d8c050',size:14,el:'earth',ail:['sleep',.12,4],drops:[['gloomspore',.35],['blue',.05]],sig:{kind:'head',b:{int:2,maxsp:30},txt:'+2 INT, +30 Max SP'}},
  crystalmite:{name:'Crystal Mite',lv:28,hp:1500,atk:105,def:65,flee:22,exp:640,jexp:430,spd:50,shape:'bug',col:'#a8d8f0',size:13,el:'water',drops:[['glintstone',.12],['crabshell',.35]],sig:{kind:'armor',b:{def:8,maxsp:40},txt:'+8 DEF, +40 Max SP'}},
  dunejackal:{name:'Dune Jackal',lv:24,hp:900,atk:84,def:22,flee:45,exp:430,jexp:300,spd:110,aggro:true,shape:'beast',col:'#c8a060',size:13,el:'earth',drops:[['pelt',.4],['orange',.06]],sig:{kind:'accessory',b:{agi:2,flee:8},txt:'+2 AGI, +8 FLEE'}},
  miragewisp:{name:'Mirage Wisp',lv:29,hp:1300,atk:104,def:18,flee:75,exp:690,jexp:470,spd:85,aggro:true,range:150,shape:'ghost',col:'#f0d890',size:13,el:'wind',ail:['blind',.12,5],drops:[['dust',.4],['blue',.07]],sig:{kind:'weapon',b:{matk:30},txt:'+30 MATK'}},
  gravehound:{name:'Grave Hound',lv:38,hp:2600,atk:160,def:38,flee:50,exp:1250,jexp:860,spd:115,aggro:true,undead:true,shape:'beast',col:'#5a5a62',size:15,el:'shadow',drops:[['bone',.45],['orange',.1]],sig:{kind:'accessory',b:{str:3,crit:3},txt:'+3 STR, +3 CRIT'}},
  ashgolem:{name:'Ash Golem',lv:42,hp:4800,atk:190,def:80,flee:15,exp:1650,jexp:1120,spd:40,aggro:true,shape:'golem',col:'#6a4a3a',size:18,el:'fire',drops:[['emberore',.08],['core',.35]],sig:{kind:'armor',b:{maxhp:300,def:4},txt:'+300 Max HP, +4 DEF'}},
  iceimp:{name:'Ice Imp',lv:46,hp:2900,atk:205,def:42,flee:70,exp:1850,jexp:1250,spd:110,aggro:true,shape:'imp',col:'#9ad0f0',size:12,el:'water',ail:['freeze',.1,2],drops:[['shard',.4],['blue',.1]],sig:{kind:'weapon',b:{matk:45,dex:2},txt:'+45 MATK, +2 DEX'}},
  glacierbeetle:{name:'Glacier Beetle',lv:49,hp:5600,atk:225,def:95,flee:20,exp:2450,jexp:1650,spd:42,shape:'bug',col:'#d0e8f8',size:16,el:'water',drops:[['fur',.35],['shard',.3]],sig:{kind:'armor',b:{def:10,vit:2},txt:'+10 DEF, +2 VIT'}},
  glowworm:{name:'Glowworm',lv:19,hp:900,atk:70,def:12,flee:22,exp:300,jexp:200,spd:40,shape:'bug',col:'#9fe08a',size:12,drops:[['glowsilk',.5],['red',.1]],sig:{kind:'accessory',b:{int:2,maxsp:30},txt:'+2 INT, +30 Max SP'}},
  cavebat:{name:'Cave Bat',lv:22,hp:820,atk:88,def:8,flee:60,exp:360,jexp:240,spd:95,aggro:true,shape:'beast',col:'#6a5a7a',size:11,drops:[['batwing',.45],['leaf',.04]],sig:{kind:'weapon',b:{agi:3},txt:'+3 AGI'}},
  stonecrab:{name:'Stone Crab',lv:26,hp:2400,atk:110,def:70,flee:15,exp:620,jexp:420,spd:35,shape:'bug',col:'#8a8478',size:15,drops:[['crabshell',.45],['glintstone',.03]],sig:{kind:'armor',b:{def:5,vit:2},txt:'+5 DEF, +2 VIT'}},
  gloomcap:{name:'Gloomcap',lv:28,hp:2000,atk:120,def:25,flee:30,exp:700,jexp:470,spd:50,aggro:true,shape:'mushroom',col:'#6a4a8a',size:14,drops:[['gloomspore',.45],['blue',.06]],sig:{kind:'head',b:{int:2,matk:12},txt:'+2 INT, +12 MATK'}},
  deepshade:{name:'Deepshade',lv:32,hp:2600,atk:150,def:30,flee:70,exp:950,jexp:640,spd:80,aggro:true,range:150,shape:'ghost',col:'#4a4a6a',size:14,drops:[['shadeveil',.4],['orange',.06]],sig:{kind:'weapon',b:{matk:25},txt:'+25 MATK'}},
  cavetroll:{name:'Cave Troll',lv:34,hp:5200,atk:200,def:60,flee:20,exp:1250,jexp:850,spd:45,aggro:true,shape:'golem',col:'#6a7a5a',size:18,drops:[['trollhide',.4],['emberore',.03]],sig:{kind:'armor',b:{maxhp:250,str:2},txt:'+250 Max HP, +2 STR'}},
  gloomking:{name:'Gloomcap King',lv:37,hp:30000,atk:260,def:60,flee:40,exp:16000,jexp:11000,spd:55,aggro:true,boss:true,shape:'mushroom',col:'#4a2a6a',size:28,respawn:150,sigChance:.2,
    drops:[['gloomhat',.25],['orange',1],['emberore',.5],['glintstone',.5],['gloomspore',1]],sig:{kind:'head',b:{int:4,matk:30,maxsp:60},txt:'+4 INT, +30 MATK, +60 Max SP'}},
  // #40 world bosses: the game server spawns one at a time in its region and announces it; the top damage dealer is the MVP
  thornmother:{name:'Thornmother',lv:24,hp:120000,atk:170,def:40,flee:30,exp:40000,jexp:26000,spd:50,aggro:true,boss:true,world:'woods',shape:'blob',col:'#3f7a2a',size:30,leaf:true,sigChance:.2,
    drops:[['orange',1],['spore',1],['thorn',1],['lupeears',.15]],mvp:[['thorncrown',1],['emberore',1],['glintstone',1]],sig:{kind:'armor',b:{vit:4,maxhp:300},txt:'+4 VIT, +300 Max HP'}},
  dunetyrant:{name:'Dune Tyrant',lv:36,hp:260000,atk:270,def:75,flee:35,exp:90000,jexp:60000,spd:55,aggro:true,boss:true,world:'dunes',shape:'bug',col:'#8a6a3a',size:32,sigChance:.2,
    drops:[['orange',1],['carapace',1],['needle',1],['turban',.15]],mvp:[['tyranthelm',1],['emberore',2],['glintstone',2]],sig:{kind:'weapon',b:{atk:30,str:3},txt:'+30 ATK, +3 STR'}},
  rimeheart:{name:'Rimeheart Colossus',lv:55,hp:600000,atk:400,def:110,flee:40,exp:220000,jexp:150000,spd:45,aggro:true,boss:true,world:'frost',shape:'golem',col:'#8fc8e8',size:36,sigChance:.2,
    drops:[['orange',1],['shard',1],['fur',1],['frostcap',.15]],mvp:[['rimehalo',1],['emberore',3],['glintstone',3]],sig:{kind:'accessory',b:{int:5,matk:60},txt:'+5 INT, +60 MATK'}},
  warlord:{name:'Ashen Warlord',lv:45,hp:20000,atk:300,def:80,flee:40,exp:30000,jexp:20000,spd:70,aggro:true,boss:true,shape:'golem',col:'#7a2e1f',size:30,respawn:180,sigChance:.25,drops:[['crest',1],['orange',1],['blue',.6],['crown',.3]],sig:{kind:'armor',b:{str:5,vit:5,hppct:15},txt:'+5 STR, +5 VIT, +15% Max HP'}},
};
// #15 monster skills run by the server (heal / blink / bolt) and #16 pack monsters that call their kind
const MOB_SKILL={mushcap:'heal',gloomcap:'heal',shriekcap:'heal',miragewisp:'blink',deepshade:'blink',emberimp:'blink',iceimp:'bolt',frostwisp:'bolt',wraith:'bolt'};
const MOB_PACK=['greylupe','hopper','dunejackal','gravehound','rimestalker'];
for(const id in MOB_SKILL)MOBS[id].skill=MOB_SKILL[id];for(const id of MOB_PACK)MOBS[id].pack=true;
for(const id in MOBS){const m=MOBS[id];m.id=id;m.hit=m.lv*2+12;
  ITEMS[id+'_sig']={name:m.name+' Sigil',type:'sigil',kind:m.sig.kind,b:m.sig.b,price:m.boss?20000:600,col:'#ffcf5a',g:'✦',desc:`Socket into ${/^[aeiou]/.test(m.sig.kind)?'an':'a'} ${m.sig.kind}: ${m.sig.txt}.`};}

const ZONES={
  town:{name:'Hearthvale',w:40,h:30,theme:'town',safe:true,lvl:'Safe town',links:{east:'meadow'}},
  meadow:{name:'Greenmoss Meadow',w:64,h:44,theme:'meadow',seed:11,density:.045,ponds:3,lvl:'Lv 1–10',mobs:[['sproutling',16],['hopper',10],['mossbug',9],['hopperchief',1],['hopper',4,'hopperchief'],['puffcap',4],['dewdrop',3]],links:{west:'town',east:'woods'}},
  woods:{name:'Whispering Woods',w:64,h:46,theme:'woods',seed:23,density:.11,ponds:2,lvl:'Lv 10–20',mobs:[['thornling',13],['greylupe',10],['mushcap',9],['lupealpha',1],['greylupe',4,'lupealpha'],['barkling',4],['webspinner',3]],links:{west:'meadow',east:'dunes'},stairs:'deep1'},
  // #34 Mossdeep Caverns: a dungeon under the woods; each floor is harder, the Gloomcap King waits at the bottom
  deep1:{name:'Mossdeep Caverns B1',w:54,h:38,theme:'cave',music:'crypt',dungeon:1,seed:81,density:.13,ponds:1,lvl:'Lv 18–25 · dungeon',mobs:[['glowworm',13],['cavebat',11],['shriekcap',4]],links:{west:'woods',east:'deep2'}},
  deep2:{name:'Mossdeep Caverns B2',w:54,h:38,theme:'cave',music:'crypt',dungeon:2,seed:93,density:.14,ponds:2,lvl:'Lv 25–31 · dungeon',mobs:[['stonecrab',12],['gloomcap',11],['cavebat',5],['crystalmite',4]],links:{west:'deep1',east:'deep3'}},
  deep3:{name:'Mossdeep Caverns B3',w:54,h:38,theme:'cave',music:'crypt',dungeon:3,seed:107,density:.15,ponds:1,lvl:'Lv 31–37 · boss',mobs:[['deepshade',11],['cavetroll',9],['gloomcap',4],['gloomking',1]],links:{west:'deep2'}},
  dunes:{name:'Ashen Dunes',w:68,h:46,theme:'dunes',seed:37,density:.04,ponds:1,lvl:'Lv 20–32',mobs:[['scarab',13],['wraith',10],['cactoid',9],['scarabqueen',1],['scarab',4,'scarabqueen'],['dunejackal',4],['miragewisp',3]],links:{west:'woods',east:'crypt'}},
  crypt:{name:'Cinder Crypt',w:60,h:44,theme:'crypt',seed:51,density:.07,ponds:3,lvl:'Lv 32–45 · boss',mobs:[['bonearcher',12],['emberimp',11],['warlord',1],['gravehound',4],['ashgolem',3]],links:{west:'dunes',east:'frost'}},
  // Stage 6 arena: four pits for ranked matches (js/arena.js); reached from the Arena Master in Hearthvale
  // Stage 6 guild war: the Ember Crystal sits in a ring at the centre (js/guildwar.js); reached from the Keep Herald in Hearthvale
  keep:{name:'Emberkeep',w:44,h:34,theme:'keep',music:'crypt',safe:true,lvl:'Guild war',links:{}},
  arena:{name:'Ember Arena',w:48,h:34,theme:'arena',music:'boss',safe:true,lvl:'Ranked PvP',links:{}},
  frost:{name:'Frostpeak Pass',w:64,h:44,theme:'frost',seed:67,density:.08,ponds:3,lvl:'Lv 42+',mobs:[['rimestalker',12],['frostwisp',11],['snowhulk',9],['frostmatron',1],['rimestalker',3,'frostmatron'],['iceimp',4],['glacierbeetle',3]],links:{west:'crypt'}},
};
const KEEP_C=[22,17],KEEP_R=4; // the crystal (tile) and its capture ring (tiles); the server uses the same numbers
const ARENA_PITS=[[12,9],[35,9],[12,26],[35,26]];
const ZONE_ORDER=['town','meadow','woods','dunes','crypt','frost'];
const THEMES={
  town:{g:['#6aa553','#6ea957','#66a050'],path:'#c9b07a',canopy:['#3f7d34','#4e9440'],water:'#4a8fc8',cob:'#a59f93'},
  meadow:{g:['#5e9b4a','#62a04d','#5a9446'],path:'#c9b07a',canopy:['#3f7d34','#4e9440'],water:'#3f7fb8'},
  woods:{g:['#3d6b35','#406f38','#3a6532'],path:'#8a7552',canopy:['#24502a','#2f6334'],water:'#2f5f80'},
  dunes:{g:['#d9bf85','#dcc38a','#d4b97e'],path:'#c2a46c',rock:['#9c7b55','#7d6043'],water:'#3ea0b0'},
  frost:{g:['#e6edf2','#edf2f6','#e1e9ef'],path:'#b7c6d2',canopy:['#9fb8c8','#f5f9fc'],water:'#8fc0dc'},
  cave:{g:['#3b3530','#3f3833','#37312c'],path:'#55493e',rock:['#2c2622','#4d443b'],water:'#2a5f6a',dark:true},
  keep:{g:['#5d5a62','#615e66','#59565e'],path:'#c9a24a',cob:'#7a7480',rock:['#3e3a44','#5a5560'],water:'#d4521f',lava:true},
  arena:{g:['#d2b483','#d6b98a','#cdae7c'],path:'#b8925e',cob:'#8f8375',rock:['#6e5a48','#8a735c'],water:'#3ea0b0'},
  crypt:{g:['#3a3842','#3d3b46','#37353f'],path:'#55505e',rock:['#26242c','#4a4654'],water:'#d4521f',lava:true},
};

/* ================= skills ================= */
const SKILLS={
  firstaid:{name:'First Aid',max:5,col:'#7fd38a',g:'+',sp:l=>3,cd:1.5,kind:'self',desc:l=>`Heal ${8+l*7} HP.`,run:l=>healP(8+l*7)},
  cleave:{name:'Cleave',max:10,col:'#e06a5a',g:'C',sp:l=>6+l,cd:.8,kind:'target',range:55,desc:l=>`A heavy strike for ${150+l*30}% ATK that never misses, ${15+l*2}% chance to stun.`,
    run:(l,t)=>{fx.push({k:'slash',x:t.x,y:t.y,t0:now,dur:.25});dealPhys(t,1.5+l*.3,{sure:true,ail:['stun',.15+l*.02,1.5]});}},
  whirl:{name:'Whirlwind',max:10,col:'#e0904a',g:'W',sp:l=>12+l*2,cd:2.5,kind:'self',desc:l=>`Spin and hit every foe within 95px for ${120+l*20}% ATK.`,
    run:l=>{fx.push({k:'ring',x:P.x,y:P.y,r:95,col:'#ffb070',t0:now,dur:.35});aoe(P.x,P.y,95,m=>dealPhys(m,1.2+l*.2,{sure:true}));}},
  ironwill:{name:'Iron Will',max:10,col:'#b0b8c8',g:'I',sp:l=>20,cd:20,kind:'self',desc:l=>`For 60s: +${l*4} DEF and +${l*2} HP regen per second.`,
    run:l=>buff('ironwill','Iron Will',60,{def:l*4,regen:l*2})},
  emberbolt:{name:'Ember Bolt',max:10,col:'#ff8a3a',g:'E',sp:l=>5+l*2,cd:.7,kind:'target',range:230,desc:l=>`Hurl fire for ${140+l*30}% MATK.`,
    run:(l,t)=>shoot(P,t,'orb','#ff8a3a',()=>dealMag(t,1.4+l*.3,'fire'))},
  frostnova:{name:'Frost Nova',max:10,col:'#8fd0f0',g:'F',sp:l=>14+l*2,cd:3,kind:'self',desc:l=>`Water damage to foes within 115px: ${100+l*20}% MATK, slowed for ${(2+l*.3).toFixed(1)}s, ${30+l*3}% chance to freeze them.`,
    run:l=>{fx.push({k:'nova',x:P.x,y:P.y,r:115,t0:now,dur:.5});aoe(P.x,P.y,115,m=>{dealMag(m,1+l*.2,'water',['freeze',.3+l*.03,1.5+l*.1]);slowMob(m,2+l*.3);});}},
  arcstorm:{name:'Arc Storm',max:10,col:'#c8b0ff',g:'S',sp:l=>25+l*3,cd:4,kind:'area',range:250,radius:105,desc:l=>`Call lightning on your target's area: ${220+l*40}% MATK to all within 105px.`,
    run:(l,x,y)=>{for(let i=0;i<6;i++)fx.push({k:'bolt',x:x+rnd(-80,80),y:y+rnd(-60,60),t0:now+i*.05,dur:.3});fx.push({k:'ring',x,y,r:105,col:'#c8b0ff',t0:now,dur:.4});aoe(x,y,105,m=>dealMag(m,2.2+l*.4,'wind'));}},
  twinshot:{name:'Twin Shot',max:10,col:'#9fe08a',g:'T',sp:l=>6+l,cd:.6,kind:'target',range:250,desc:l=>`Fire two arrows, each ${90+l*15}% ATK.`,
    run:(l,t)=>{shoot(P,t,'arrow','#e8dcb0',()=>dealPhys(t,.9+l*.15,{sure:true}));setTimeout(()=>{if(!t.dead)shoot(P,t,'arrow','#e8dcb0',()=>dealPhys(t,.9+l*.15,{sure:true}));},110);}},
  arrowrain:{name:'Arrow Rain',max:10,col:'#d8e070',g:'R',sp:l=>18+l*2,cd:3,kind:'area',range:250,radius:110,desc:l=>`Rain arrows on your target's area: ${130+l*25}% ATK to all within 110px.`,
    run:(l,x,y)=>{for(let i=0;i<14;i++)fx.push({k:'arrowfall',x:x+rnd(-100,100),y:y+rnd(-80,80),t0:now+i*.03,dur:.35});aoe(x,y,110,m=>dealPhys(m,1.3+l*.25,{sure:true}));}},
  hawkeye:{name:'Hawk Eye',max:10,col:'#e0c070',g:'H',sp:l=>22,cd:20,kind:'self',desc:l=>`For 90s: +${l*2} DEX and +${l} CRIT.`,
    run:l=>buff('hawkeye','Hawk Eye',90,{dex:l*2,crit:l})},
  smite:{name:'Smite',max:10,col:'#fff0a0',g:'S',sp:l=>7+l*2,cd:.8,kind:'target',range:210,desc:l=>`Holy light for ${150+l*30}% MATK, double against Shadow monsters.`,
    run:(l,t)=>{fx.push({k:'pillar',x:t.x,y:t.y,t0:now,dur:.45});dealMag(t,1.5+l*.3,'holy');}},
  mend:{name:'Mend',max:10,col:'#7fd38a',g:'M',sp:l=>10+l*3,cd:1.2,kind:'self',desc:l=>`Heal yourself for ${20*l} + ${100+l*40}% MATK and cure ailments.`,
    run:l=>{healP(Math.round(20*l+S.matk*(1+l*.4)));cureAll();}},
  blessing:{name:'Blessing',max:10,col:'#f0e0a0',g:'B',sp:l=>24,cd:20,kind:'self',desc:l=>`For 120s: +${l} STR, INT and DEX.`,
    run:l=>buff('blessing','Blessing',120,{str:l,int:l,dex:l})},
};

// #8 spells take time to cast (seconds before DEX); everything else is instant
const CAST={emberbolt:.6,frostnova:.8,arcstorm:1.4,smite:.5,mend:.7,arrowrain:.4};
/* ================= utilities ================= */
const $=s=>document.querySelector(s);
const rnd=(a,b)=>a+Math.random()*(b-a);
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const fmt=n=>{n=Math.round(n);const s=String(Math.abs(n));let o=s.length>3?s.replace(/\B(?=(\d{3})+(?!\d))/g,','):s;return n<0?'-'+o:o;};
function seeded(s){return function(){s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
const expNeed=lv=>Math.floor(20*Math.pow(lv,1.9)+20);
const jexpNeed=jl=>Math.floor(15*Math.pow(jl,1.8)+15);
const jobMax=c=>c==='novice'?10:50;
const statCost=v=>Math.floor((v-1)/10)+2;

