"use strict";
/* ================= the middle of the world filled in (v1.61.1) =================
   The world used to be a plus sign: four roads straight out of Hearthvale and Aurelmark with nothing between them, so
   regions only ever touched the one before and after them on their road. Four new regions now fill the corners round
   the two cities, joined to the regions on both sides of them, so the middle of the map is one land with loops in it:

        Thornmere Wilds  Mistfall Vale   Windwhistle Heights   Bramblewind Hills
        Goldleaf Downs   Aurelmark       Hearthvale            Greenmoss Meadow
                                         Willowmere Farms      Amberfield Hollow

   Each has four monsters of its own and a boss with an escort that drops a relic. Loaded before regions4.js, which
   places them on the world grid (WORLD_GRID) and gives every region its gates, and before balance.js, so they follow
   the same level curve as every other monster. The game server gets them through tools/export-world.js. */
// a new monster from one of the same kind and level band: its numbers scaled to the new level (before balance.js)
function r5Mob(id,name,lv,ref,o){const R=MOBS[ref],k=lv/R.lv,m={name,lv,hp:Math.round(R.hp*k**1.5),atk:Math.round(R.atk*k**1.1),def:Math.round(R.def*k),
  flee:Math.round(R.flee*k**.8),exp:Math.round(R.exp*k**1.5),jexp:Math.round(R.jexp*k**1.5),spd:R.spd,aggro:!!R.aggro,size:R.size,...o};
  if(R.boss){Object.assign(m,{boss:true,mini:true,calls:true,respawn:120,sigChance:.15});}MOBS[id]=m;}
Object.assign(ITEMS,{
  // Bramblewind Hills
  brambleberry:{name:'Bramble Berry',type:'etc',price:20,col:'#7a2a5a',g:'•'}, mothscale:{name:'Gale Moth Scale',type:'etc',price:34,col:'#c8d8e8',g:'•'},
  boarbristle:{name:'Hedge Bristle',type:'etc',price:46,col:'#8a5a3a',g:'•'}, windseed:{name:'Windseed',type:'etc',price:62,col:'#d8f0b0',g:'•'},
  brambleheart:{name:'Brambleheart',type:'accessory',b:{str:2,vit:2,maxhp:120},price:11000,lv:16,slots:1,col:'#6a8a3a',g:'O',desc:'Dropped by the Bramble Warden.'},
  // Amberfield Hollow
  sheafstraw:{name:'Golden Sheaf',type:'etc',price:28,col:'#e8c060',g:'•'}, volewhisker:{name:'Vole Whisker',type:'etc',price:40,col:'#a08060',g:'•'},
  ambershell:{name:'Amber Shell',type:'etc',price:58,col:'#e0a030',g:'•'}, harvestglow:{name:'Harvest Glow',type:'etc',price:80,col:'#ffd890',g:'•'},
  ambercrown:{name:'Amber Crown',type:'head',def:5,b:{luk:3,dex:2,crit:3},price:15000,lv:20,slots:1,col:'#e8b040',g:'^',desc:'Dropped by the Harvest Matron.'},
  // Mistfall Vale
  mistdew:{name:'Mist Dew',type:'etc',price:24,col:'#b8d0e0',g:'•'}, frogskin:{name:'Reedfrog Skin',type:'etc',price:36,col:'#6aa080',g:'•'},
  stagvelvet:{name:'Stag Velvet',type:'etc',price:52,col:'#c8b898',g:'•'}, lanterndust:{name:'Lantern Dust',type:'etc',price:72,col:'#f0e0a0',g:'•'},
  mistveil:{name:'Mistveil Mantle',type:'armor',def:22,b:{int:2,flee:8,maxsp:60},price:13000,lv:18,slots:1,col:'#a0b8d0',g:'A',desc:'Dropped by the Mother of Mists.'},
  // Thornmere Wilds
  thornhide:{name:'Thorn Hide',type:'etc',price:44,col:'#7a5a4a',g:'•'}, bloomspore:{name:'Mire Bloom Spore',type:'etc',price:60,col:'#9a4a6a',g:'•'},
  wildpelt:{name:'Wild Pelt',type:'etc',price:78,col:'#5a5048',g:'•'}, thornstone:{name:'Thornstone',type:'etc',price:96,col:'#6a6a5a',g:'•'},
  gnarlcharm:{name:'Gnarlroot Charm',type:'accessory',b:{vit:3,def:5,dmgred:3},price:19000,lv:26,slots:1,col:'#5a4a2a',g:'O',desc:'Dropped by Old Gnarlroot.'}});
// ---- Bramblewind Hills (Lv 8-18): windy hills of bramble north-east of Hearthvale ----
r5Mob('briarling','Briarling',9,'greylupe',{aggro:false,shape:'leaf',col:'#6a8a3a',size:12,el:'earth',drops:[['brambleberry',.5],['red',.08]],sig:{kind:'weapon',b:{atk:5,hit:3,luk:1},txt:'+5 ATK, +3 HIT, +1 LUK'}});
r5Mob('galemoth','Gale Moth',12,'webspinner',{shape:'bug',col:'#c8d8e8',size:11,el:'wind',aggro:false,ail:null,drops:[['mothscale',.45],['red',.1]],sig:{kind:'accessory',b:{agi:2},txt:'+2 AGI'}});
r5Mob('hedgeboar','Hedge Boar',14,'greylupe',{shape:'beast',col:'#8a5a3a',size:14,el:'earth',drops:[['boarbristle',.45],['orange',.05]],sig:{kind:'armor',b:{vit:2},txt:'+2 VIT'}});
r5Mob('windsprite','Windsprite',16,'webspinner',{shape:'ghost',col:'#d8f0b0',size:12,el:'wind',ail:null,drops:[['windseed',.45],['orange',.06]],sig:{kind:'head',b:{flee:5},txt:'+5 FLEE'}});
r5Mob('bramblewarden','Bramble Warden',19,'hornback',{shape:'golem',col:'#4a6a2a',size:24,el:'earth',drops:[['brambleheart',.2],['brambleberry',1],['orange',1],['glintstone',.2]],sig:{kind:'armor',b:{vit:2,str:2},txt:'+2 VIT, +2 STR'}});
// ---- Amberfield Hollow (Lv 12-22): golden fields in a hollow east of the Farms ----
r5Mob('sheafling','Sheafling',13,'greylupe',{aggro:false,shape:'leaf',col:'#e8c060',size:12,el:'earth',drops:[['sheafstraw',.5],['red',.08]],sig:{kind:'armor',b:{maxhp:60},txt:'+60 Max HP'}});
r5Mob('fieldvole','Field Vole',15,'greylupe',{aggro:false,shape:'beast',col:'#a08060',size:10,el:'earth',spd:80,drops:[['volewhisker',.45],['red',.1]],sig:{kind:'accessory',b:{luk:2},txt:'+2 LUK'}});
r5Mob('amberbeetle','Amber Beetle',18,'webspinner',{shape:'bug',col:'#e0a030',size:13,el:'fire',ail:null,drops:[['ambershell',.45],['orange',.06]],sig:{kind:'armor',b:{def:5},txt:'+5 DEF'}});
r5Mob('harvestwisp','Harvest Wisp',20,'webspinner',{shape:'ghost',col:'#ffd890',size:12,el:'holy',ail:null,drops:[['harvestglow',.45],['blue',.05]],sig:{kind:'weapon',b:{matk:12},txt:'+12 MATK'}});
r5Mob('harvestmatron','Harvest Matron',23,'hornback',{shape:'golem',col:'#d8a040',size:26,el:'earth',drops:[['ambercrown',.2],['sheafstraw',1],['orange',1],['glintstone',.25]],sig:{kind:'head',b:{luk:2,crit:3},txt:'+2 LUK, +3 CRIT'}});
// ---- Mistfall Vale (Lv 10-20): a misty valley of reeds and lanterns west of the Heights ----
r5Mob('mistwisp','Mistwisp',11,'greylupe',{aggro:false,shape:'ghost',col:'#b8d0e0',size:11,el:'water',drops:[['mistdew',.5],['red',.08]],sig:{kind:'head',b:{maxsp:30},txt:'+30 Max SP'}});
r5Mob('reedfrog','Reedfrog',13,'greylupe',{aggro:false,shape:'blob',col:'#6aa080',size:12,el:'water',drops:[['frogskin',.45],['red',.1]],sig:{kind:'armor',b:{flee:4,luk:1},txt:'+4 FLEE, +1 LUK'}});
r5Mob('valestag','Vale Stag',16,'greylupe',{shape:'beast',col:'#c8b898',size:15,el:'earth',aggro:false,drops:[['stagvelvet',.45],['orange',.05]],sig:{kind:'weapon',b:{atk:8,agi:1},txt:'+8 ATK, +1 AGI'}});
r5Mob('lanternmoth','Lantern Moth',18,'webspinner',{shape:'bug',col:'#f0e0a0',size:12,el:'fire',ail:null,drops:[['lanterndust',.45],['blue',.05]],sig:{kind:'accessory',b:{int:2},txt:'+2 INT'}});
r5Mob('mistmother','Mother of Mists',21,'hornback',{shape:'ghost',col:'#a0b8d0',size:26,el:'water',drops:[['mistveil',.2],['mistdew',1],['orange',1],['glintstone',.2]],sig:{kind:'armor',b:{int:2,maxsp:60},txt:'+2 INT, +60 Max SP'}});
// ---- Thornmere Wilds (Lv 16-28): a tangled wild of thorn and bog north of Goldleaf Downs ----
r5Mob('thornrat','Thornrat',17,'greylupe',{shape:'beast',col:'#7a5a4a',size:11,el:'earth',drops:[['thornhide',.45],['red',.1]],sig:{kind:'weapon',b:{atk:9},txt:'+9 ATK'}});
r5Mob('mirebloom','Mire Bloom',20,'webspinner',{shape:'mushroom',col:'#9a4a6a',size:13,el:'earth',drops:[['bloomspore',.45],['remedy',.05]],sig:{kind:'armor',b:{def:4,vit:1},txt:'+4 DEF, +1 VIT'}});
r5Mob('bramblelupe','Bramble Lupe',23,'greylupe',{shape:'beast',col:'#5a5048',size:15,el:'earth',drops:[['wildpelt',.45],['orange',.06]],sig:{kind:'accessory',b:{agi:2,crit:2},txt:'+2 AGI, +2 CRIT'}});
r5Mob('thornstonegolem','Thornstone Golem',26,'greylupe',{shape:'golem',col:'#6a6a5a',size:17,el:'earth',spd:55,drops:[['thornstone',.45],['orange',.08]],sig:{kind:'armor',b:{def:6,luk:1},txt:'+6 DEF, +1 LUK'}});
r5Mob('gnarlroot','Old Gnarlroot',29,'hornback',{shape:'golem',col:'#4a3a2a',size:28,el:'earth',drops:[['gnarlcharm',.2],['thornstone',1],['orange',1],['glintstone',.3]],sig:{kind:'armor',b:{vit:3,def:4,luk:1},txt:'+3 VIT, +4 DEF, +1 LUK'}});
// new looks for the land, from the nearest kind of country (rocky: rocks and crags, not trees)
Object.assign(THEMES,{
  bramble:{...THEMES.meadow,g:['#6f9a48','#73a04c','#6a9444'],canopy:['#4a6e2a','#5a8034'],path:'#c2a874'},
  amber:{...THEMES.farms||THEMES.meadow,g:['#b8a456','#bea95a','#b19e50'],canopy:['#7a8a3a','#9a9a44'],path:'#d8bf86'},
  mist:{...THEMES.fen,g:['#5f7f6a','#63846e','#5b7a66'],canopy:['#3f5f4f','#4f7060'],water:'#5a8a9a'},
  thornmere:{...THEMES.woods,g:['#45603a','#49653e','#415b36'],canopy:['#2a4228','#3a5230'],water:'#3f5a4a'}});
Object.assign(ZONES,{
  bramble:{name:'Bramblewind Hills',w:62,h:44,theme:'bramble',music:'downs',seed:401,density:.06,ponds:2,lvl:'Lv 8–18',
    mobs:[['briarling',13],['galemoth',10],['hedgeboar',8],['windsprite',6],['bramblewarden',1],['hedgeboar',4,'bramblewarden']],links:{}},
  amber:{name:'Amberfield Hollow',w:64,h:44,theme:'amber',music:'downs',seed:419,density:.035,ponds:3,lvl:'Lv 12–22',
    mobs:[['sheafling',13],['fieldvole',10],['amberbeetle',8],['harvestwisp',6],['harvestmatron',1],['amberbeetle',4,'harvestmatron']],links:{}},
  mist:{name:'Mistfall Vale',w:62,h:46,theme:'mist',music:'pines',seed:433,density:.07,ponds:6,lvl:'Lv 10–20',
    mobs:[['mistwisp',13],['reedfrog',10],['valestag',7],['lanternmoth',6],['mistmother',1],['mistwisp',4,'mistmother']],links:{}},
  thornmere:{name:'Thornmere Wilds',w:64,h:46,theme:'thornmere',music:'pines',seed:449,density:.11,ponds:3,lvl:'Lv 16–28',
    mobs:[['thornrat',12],['mirebloom',9],['bramblelupe',8],['thornstonegolem',5],['gnarlroot',1],['bramblelupe',4,'gnarlroot']],links:{}}});
const R5_ZONES=['bramble','amber','mist','thornmere'];
// every monster's id, hit and sigil, as each region file does for its own (js/data.js)
for(const id of ['briarling','galemoth','hedgeboar','windsprite','bramblewarden','sheafling','fieldvole','amberbeetle','harvestwisp','harvestmatron',
  'mistwisp','reedfrog','valestag','lanternmoth','mistmother','thornrat','mirebloom','bramblelupe','thornstonegolem','gnarlroot']){const m=MOBS[id];m.id=id;m.hit=m.lv*2+12;
  ITEMS[id+'_sig']={name:m.name+' Sigil',type:'sigil',kind:m.sig.kind,b:m.sig.b,price:m.boss?20000:600,col:'#ffcf5a',g:'✦',desc:`Socket into ${/^[aeiou]/.test(m.sig.kind)?'an':'a'} ${m.sig.kind}: ${m.sig.txt}.`};}

/* ================= six more regions in the gaps (v1.63.0) =================
   Eaglecrest Crags (north of the Bramble), Hollowbrook Glen (between the Bramble and the Woods), Reedwater Marsh and
   the Old Orchard (south of Goldleaf Downs and Aurelmark), Redrock Canyon (west of the Dunes) and the Ashfall Barrens
   (between the Crypt and the Jungle): each with four monsters, a boss with an escort and its relic. */
const R6_MOBS=[];const r6=(id,...a)=>{r5Mob(id,...a);R6_MOBS.push(id);};
Object.assign(ITEMS,{
  // Eaglecrest Crags
  cragfeather:{name:'Crag Feather',type:'etc',price:70,col:'#c8b090',g:'•'}, slatechip:{name:'Slate Chip',type:'etc',price:86,col:'#7a7a8a',g:'•'},
  goatmoss:{name:'Goat Moss',type:'etc',price:98,col:'#8aa070',g:'•'}, stormglass:{name:'Stormglass',type:'etc',price:120,col:'#a8c8e8',g:'•'},
  eagleplume:{name:'Eaglecrest Plume',type:'head',def:7,b:{dex:3,agi:2,hit:8},price:26000,lv:32,slots:1,col:'#e8d8b0',g:'^',desc:'Dropped by Skyclaw the Roc.'},
  // Hollowbrook Glen
  brookpebble:{name:'Brook Pebble',type:'etc',price:30,col:'#9aa8b0',g:'•'}, glenmoss:{name:'Glen Moss',type:'etc',price:44,col:'#5a8a4a',g:'•'},
  otterpelt:{name:'Otter Pelt',type:'etc',price:58,col:'#7a5a3a',g:'•'}, fairydust:{name:'Glen Dust',type:'etc',price:74,col:'#e8d8ff',g:'•'},
  glenboots:{name:'Hollowbrook Boots',type:'shoes',def:6,b:{agi:3,move:5,flee:6},price:15000,lv:20,slots:1,col:'#6a9a5a',g:'S',desc:'Dropped by the Glen Keeper.'},
  // Reedwater Marsh
  marshreed:{name:'Marsh Reed',type:'etc',price:22,col:'#a8b070',g:'•'}, leechling:{name:'Leech Tooth',type:'etc',price:34,col:'#5a3a3a',g:'•'},
  newtskin:{name:'Newt Skin',type:'etc',price:46,col:'#e0803a',g:'•'}, bogpearl:{name:'Bog Pearl',type:'etc',price:64,col:'#d8e0c8',g:'•'},
  reedcrown:{name:'Reedwater Circlet',type:'head',def:4,b:{int:3,maxsp:60,spregen:2},price:12000,lv:16,slots:1,col:'#a8c078',g:'^',desc:'Dropped by the Marsh Hag.'},
  // Old Orchard
  windfall:{name:'Windfall Apple',type:'etc',price:28,col:'#d04a3a',g:'•'}, beeswax:{name:'Beeswax',type:'etc',price:42,col:'#f0c850',g:'•'},
  barkchip:{name:'Old Bark',type:'etc',price:56,col:'#6a4a2a',g:'•'}, cidercap:{name:'Cider Cap',type:'etc',price:72,col:'#c88a3a',g:'•'},
  orchardring:{name:'Orchard Ring',type:'accessory',b:{vit:2,luk:2,regen:4},price:14000,lv:20,slots:1,col:'#d0603a',g:'O',desc:'Dropped by the Gnarled Elder.'},
  // Redrock Canyon
  redclay:{name:'Red Clay',type:'etc',price:80,col:'#b85a3a',g:'•'}, vulturequill:{name:'Vulture Quill',type:'etc',price:94,col:'#5a4a40',g:'•'},
  scorpstinger:{name:'Scorpion Stinger',type:'etc',price:110,col:'#c8703a',g:'•'}, canyonquartz:{name:'Canyon Quartz',type:'etc',price:130,col:'#f0c8b0',g:'•'},
  canyonmail:{name:'Redrock Mail',type:'armor',def:46,b:{vit:3,str:2,dmgred:3},price:32000,lv:36,slots:1,col:'#b85a3a',g:'A',desc:'Dropped by the Canyon Tyrant.'},
  // Ashfall Barrens
  ashbloom:{name:'Ash Bloom',type:'etc',price:140,col:'#9a8a8a',g:'•'}, cinderscale:{name:'Cinder Scale',type:'etc',price:160,col:'#6a3a2a',g:'•'},
  emberhusk:{name:'Ember Husk',type:'etc',price:180,col:'#e0702a',g:'•'}, ashpearl:{name:'Ash Pearl',type:'etc',price:210,col:'#d8d0c8',g:'•'},
  ashcharm:{name:'Ashfall Talisman',type:'accessory',b:{int:3,str:3,atk:20,matk:20},price:42000,lv:48,slots:1,col:'#8a7a7a',g:'O',desc:'Dropped by the Ash Colossus.'}});
// ---- Eaglecrest Crags (Lv 22-34): high bluffs where the eagles nest, north of the Bramble ----
r6('cragling','Cragling',23,'greylupe',{aggro:false,shape:'golem',col:'#8a8a9a',size:13,el:'earth',spd:60,drops:[['slatechip',.5],['orange',.06]],sig:{kind:'armor',b:{def:5,hit:3},txt:'+5 DEF, +3 HIT'}});
r6('cliffgoat','Cliff Goat',26,'greylupe',{shape:'beast',col:'#d8d0c0',size:14,el:'earth',drops:[['goatmoss',.45],['orange',.07]],sig:{kind:'shoes',b:{agi:2,flee:4},txt:'+2 AGI, +4 FLEE'}});
r6('cragkestrel','Crag Kestrel',29,'bonearcher',{shape:'beast',col:'#c8a070',size:12,el:'wind',range:0,drops:[['cragfeather',.45],['orange',.08]],sig:{kind:'weapon',b:{dex:2,hit:6},txt:'+2 DEX, +6 HIT'}});
r6('stormwisp','Storm Wisp',32,'bonearcher',{shape:'ghost',col:'#a8c8e8',size:12,el:'wind',range:170,drops:[['stormglass',.45],['blue',.06]],sig:{kind:'weapon',b:{matk:22,luk:1},txt:'+22 MATK, +1 LUK'}});
r6('skyclaw','Skyclaw the Roc',35,'frostmatron',{shape:'beast',col:'#a08060',size:26,el:'wind',drops:[['eagleplume',.2],['cragfeather',1],['orange',1],['glintstone',.35]],sig:{kind:'head',b:{dex:3,hit:8,luk:1},txt:'+3 DEX, +8 HIT, +1 LUK'}});
// ---- Hollowbrook Glen (Lv 14-24): a mossy glen with a brook, between the Bramble and the Woods ----
r6('mossnewt','Moss Newt',15,'greylupe',{aggro:false,shape:'beast',col:'#5a8a4a',size:10,el:'water',drops:[['glenmoss',.5],['red',.1]],sig:{kind:'armor',b:{maxhp:210,luk:1},txt:'+210 Max HP, +1 LUK'}});
r6('brookotter','Brook Otter',17,'greylupe',{aggro:false,shape:'beast',col:'#7a5a3a',size:12,el:'water',spd:95,drops:[['otterpelt',.45],['red',.1]],sig:{kind:'accessory',b:{agi:2,dex:1},txt:'+2 AGI, +1 DEX'}});
r6('pebblecrab','Pebble Crab',20,'webspinner',{shape:'bug',col:'#9aa8b0',size:12,el:'water',ail:null,drops:[['brookpebble',.5],['orange',.06]],sig:{kind:'armor',b:{def:4,vit:1,hit:3},txt:'+4 DEF, +1 VIT, +3 HIT'}});
r6('glenpixie','Glen Pixie',22,'webspinner',{shape:'ghost',col:'#e8d8ff',size:10,el:'holy',ail:['sleep',.1,3],drops:[['fairydust',.45],['blue',.05]],sig:{kind:'accessory',b:{int:2,luk:1},txt:'+2 INT, +1 LUK'}});
r6('glenkeeper','Glen Keeper',25,'hornback',{shape:'golem',col:'#4a7a4a',size:25,el:'earth',drops:[['glenboots',.2],['glenmoss',1],['orange',1],['glintstone',.25]],sig:{kind:'shoes',b:{agi:2,flee:6,luk:1},txt:'+2 AGI, +6 FLEE, +1 LUK'}});
// ---- Reedwater Marsh (Lv 10-20): reed beds and still water south of Goldleaf Downs ----
r6('reedling','Reedling',11,'greylupe',{aggro:false,shape:'leaf',col:'#a8b070',size:11,el:'water',drops:[['marshreed',.5],['red',.08]],sig:{kind:'head',b:{maxsp:30,luk:1},txt:'+30 Max SP, +1 LUK'}});
r6('marshleech','Marsh Leech',13,'greylupe',{shape:'blob',col:'#5a3a3a',size:10,el:'water',drops:[['leechling',.45],['red',.1]],sig:{kind:'weapon',b:{atk:6,luk:1},txt:'+6 ATK, +1 LUK'}});
r6('firenewt','Fire Newt',16,'greylupe',{shape:'beast',col:'#e0803a',size:11,el:'fire',drops:[['newtskin',.45],['orange',.05]],sig:{kind:'weapon',b:{matk:10,hit:3},txt:'+10 MATK, +3 HIT'}});
r6('bogmussel','Bog Mussel',18,'webspinner',{shape:'blob',col:'#c8d0b8',size:12,el:'water',ail:null,spd:30,drops:[['bogpearl',.45],['blue',.04]],sig:{kind:'armor',b:{def:5,flee:3},txt:'+5 DEF, +3 FLEE'}});
r6('marshhag','Marsh Hag',21,'hornback',{shape:'imp',col:'#6a8a5a',size:22,el:'water',drops:[['reedcrown',.2],['marshreed',1],['orange',1],['glintstone',.2]],sig:{kind:'head',b:{int:2,maxsp:50,luk:1},txt:'+2 INT, +50 Max SP, +1 LUK'}});
// ---- Old Orchard (Lv 14-24): an old walled orchard gone wild, south of Aurelmark ----
r6('applesprite','Apple Sprite',15,'greylupe',{aggro:false,shape:'leaf',col:'#d04a3a',size:11,el:'earth',drops:[['windfall',.5],['red',.1]],sig:{kind:'armor',b:{maxhp:210,hit:3},txt:'+210 Max HP, +3 HIT'}});
r6('orchardbee','Orchard Bee',17,'webspinner',{shape:'bug',col:'#f0c850',size:10,el:'wind',ail:['poison',.1,5],drops:[['beeswax',.45],['red',.1]],sig:{kind:'accessory',b:{agi:2,luk:1},txt:'+2 AGI, +1 LUK'}});
r6('barkhound','Barkhound',20,'greylupe',{shape:'beast',col:'#6a4a2a',size:14,el:'earth',drops:[['barkchip',.45],['orange',.06]],sig:{kind:'weapon',b:{atk:10,flee:3},txt:'+10 ATK, +3 FLEE'}});
r6('cidertoad','Cider Toad',22,'greylupe',{shape:'blob',col:'#c88a3a',size:13,el:'water',drops:[['cidercap',.45],['orange',.07]],sig:{kind:'armor',b:{vit:2,luk:1},txt:'+2 VIT, +1 LUK'}});
r6('gnarledelder','Gnarled Elder',25,'hornback',{shape:'golem',col:'#5a4a2a',size:26,el:'earth',drops:[['orchardring',.2],['windfall',1],['orange',1],['glintstone',.25]],sig:{kind:'accessory',b:{vit:2,luk:2,hit:3},txt:'+2 VIT, +2 LUK, +3 HIT'}});
// ---- Redrock Canyon (Lv 26-38): red cliffs and dry washes west of the Dunes ----
r6('claygolem','Clay Golem',27,'bonearcher',{shape:'golem',col:'#b85a3a',size:15,el:'earth',range:0,spd:50,drops:[['redclay',.5],['orange',.07]],sig:{kind:'armor',b:{def:6,crit:1},txt:'+6 DEF, +1 CRIT'}});
r6('canyonvulture','Canyon Vulture',30,'bonearcher',{shape:'beast',col:'#5a4a40',size:14,el:'wind',range:0,drops:[['vulturequill',.45],['orange',.08]],sig:{kind:'accessory',b:{agi:2,crit:3,luk:1},txt:'+2 AGI, +3 CRIT, +1 LUK'}});
r6('redscorpion','Red Scorpion',33,'emberimp',{shape:'bug',col:'#c8703a',size:13,el:'fire',ail:['poison',.15,6],drops:[['scorpstinger',.45],['orange',.09]],sig:{kind:'weapon',b:{atk:16,crit:1},txt:'+16 ATK, +1 CRIT'}});
r6('quartzwraith','Quartz Wraith',36,'emberimp',{shape:'ghost',col:'#f0c8b0',size:13,el:'shadow',drops:[['canyonquartz',.45],['blue',.07]],sig:{kind:'weapon',b:{matk:30,flee:3},txt:'+30 MATK, +3 FLEE'}});
r6('canyontyrant','Canyon Tyrant',39,'frostmatron',{shape:'golem',col:'#9a4a2a',size:28,el:'earth',drops:[['canyonmail',.2],['redclay',1],['orange',1],['glintstone',.35]],sig:{kind:'armor',b:{vit:3,def:5,flee:3},txt:'+3 VIT, +5 DEF, +3 FLEE'}});
// ---- Ashfall Barrens (Lv 40-52): grey ash plains under the volcano's smoke, east of the Crypt ----
r6('ashcrawler','Ash Crawler',41,'rimestalker',{shape:'bug',col:'#9a8a8a',size:13,el:'fire',drops:[['ashbloom',.45],['orange',.1]],sig:{kind:'armor',b:{def:7,maxhp:40},txt:'+7 DEF, +40 Max HP'}});
r6('cinderlizard','Cinder Lizard',44,'rimestalker',{shape:'beast',col:'#6a3a2a',size:14,el:'fire',drops:[['cinderscale',.45],['orange',.1]],sig:{kind:'accessory',b:{agi:3,crit:3,hit:3},txt:'+3 AGI, +3 CRIT, +3 HIT'}});
r6('emberhusker','Ember Husker',47,'snowhulk',{shape:'golem',col:'#e0702a',size:17,el:'fire',aggro:true,drops:[['emberhusk',.45],['orange',.1]],sig:{kind:'weapon',b:{atk:22,maxhp:40},txt:'+22 ATK, +40 Max HP'}});
r6('ashwraith','Ash Wraith',50,'rimestalker',{shape:'ghost',col:'#d8d0c8',size:13,el:'shadow',drops:[['ashpearl',.45],['blue',.1]],sig:{kind:'weapon',b:{matk:42,crit:1},txt:'+42 MATK, +1 CRIT'}});
r6('ashcolossus','Ash Colossus',53,'frostmatron',{shape:'golem',col:'#6a6060',size:32,el:'fire',drops:[['ashcharm',.2],['ashbloom',1],['orange',1],['glintstone',.45]],sig:{kind:'weapon',b:{atk:20,matk:20},txt:'+20 ATK, +20 MATK'}});
for(const id of R6_MOBS){const m=MOBS[id];m.id=id;m.hit=m.lv*2+12;
  ITEMS[id+'_sig']={name:m.name+' Sigil',type:'sigil',kind:m.sig.kind,b:m.sig.b,price:m.boss?20000:600,col:'#ffcf5a',g:'✦',desc:'Socket into '+(/^[aeiou]/.test(m.sig.kind)?'an':'a')+' '+m.sig.kind+': '+m.sig.txt+'.'};}
Object.assign(THEMES,{
  crags:{...(THEMES.heights||THEMES.meadow),g:['#7f8a6a','#838e6e','#7a8566'],path:'#a8a090',rocky:true,rockKind:'crag'},
  glen:{...THEMES.woods,g:['#4a7a42','#4e7e46','#46763e'],canopy:['#2f5a2f','#3f6e3a'],water:'#3f7fa0'},
  marsh:{...THEMES.fen,g:['#6a7a4a','#6e7e4e','#667646'],canopy:['#4a5a2a','#5a6a34'],water:'#4a7060'},
  orchard:{...THEMES.meadow,g:['#6aa04a','#6ea44e','#669c46'],canopy:['#3f7a2a','#c04a3a'],path:'#c8a870'},
  canyon:{...THEMES.dunes,g:['#c8865a','#cc8a5e','#c48256'],path:'#d8a070',rock:['#9a4a2a','#b85a3a'],rocky:true},
  barrens:{...(THEMES.crypt||THEMES.dunes),g:['#7a7470','#7e7874','#76706c'],path:'#9a928a',rock:['#4a4442','#6a6260'],rocky:true,rockKind:'crag'}});
Object.assign(ZONES,{
  crags:{name:'Eaglecrest Crags',w:62,h:44,theme:'crags',music:'pines',seed:463,density:.06,ponds:1,lvl:'Lv 22–34',
    mobs:[['cragling',12],['cliffgoat',10],['cragkestrel',8],['stormwisp',6],['skyclaw',1],['cragkestrel',4,'skyclaw']],links:{}},
  glen:{name:'Hollowbrook Glen',w:62,h:46,theme:'glen',music:'pines',seed:479,density:.09,ponds:4,lvl:'Lv 14–24',
    mobs:[['mossnewt',12],['brookotter',10],['pebblecrab',8],['glenpixie',6],['glenkeeper',1],['pebblecrab',4,'glenkeeper']],links:{}},
  marsh:{name:'Reedwater Marsh',w:64,h:44,theme:'marsh',music:'downs',seed:491,density:.05,ponds:9,lvl:'Lv 10–20',
    mobs:[['reedling',13],['marshleech',10],['firenewt',8],['bogmussel',6],['marshhag',1],['marshleech',4,'marshhag']],links:{}},
  orchard:{name:'Old Orchard',w:62,h:44,theme:'orchard',music:'downs',seed:503,density:.08,ponds:2,lvl:'Lv 14–24',
    mobs:[['applesprite',13],['orchardbee',10],['barkhound',8],['cidertoad',6],['gnarledelder',1],['barkhound',4,'gnarledelder']],links:{}},
  canyon:{name:'Redrock Canyon',w:66,h:46,theme:'canyon',music:'downs',seed:521,density:.05,ponds:1,lvl:'Lv 26–38',
    mobs:[['claygolem',12],['canyonvulture',10],['redscorpion',8],['quartzwraith',6],['canyontyrant',1],['redscorpion',4,'canyontyrant']],links:{}},
  barrens:{name:'Ashfall Barrens',w:66,h:46,theme:'barrens',music:'crypt',seed:541,density:.06,ponds:1,lvl:'Lv 40–52',
    mobs:[['ashcrawler',12],['cinderlizard',10],['emberhusker',7],['ashwraith',6],['ashcolossus',1],['cinderlizard',4,'ashcolossus']],links:{}}});
R5_ZONES.push('crags','glen','marsh','orchard','canyon','barrens');
