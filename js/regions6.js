"use strict";
/* ================= three new regions and the Barrow Deeps (v1.74.0) =================
   The world had gaps: nothing outdoors past Lv 92 (only the Molten Depths), only Saltspray Coast between Lv 70 and 85
   and no dungeon there, and little between the Cinder Crypt and the Thornveil Jungle. Now:
     Rustvein Quarry     Lv 36-46   an old iron quarry west of Redrock Canyon: rust mites, slag hounds, quarry golems and
                                    the ghosts of lost miners; the Rustbound Foreman still works the deepest cut
     Hollowmoor          Lv 70-82   a haunted moor north of Mirelight Fen: barrow mounds, will-o'-lanterns, gallows
                                    ravens; the Barrow Queen walks it, and stairs lead down into the Barrow Deeps
     Barrow Deeps B1-B2  Lv 78-90   the tombs under the moor; the Pale Regent waits at the bottom (a boss)
     Starfall Expanse    Lv 90-99   a scorched plateau east of Cinderpeak Caldera where stars fell: star shards, void
                                    stalkers, meteor golems, astral serpents and Astrael the Fallen Star
   On the world grid they join the regions next to them (WORLD_GRID in js/regions4.js; walls where the levels are far
   apart). Loaded after regions4.js (it borrows those monsters as models) and before balance.js, so every monster here
   follows the same level curve; the game server gets them through tools/export-world.js. */
const R7_MOBS=[];const r7=(id,...a)=>{r5Mob(id,...a);R7_MOBS.push(id);};
Object.assign(ITEMS,{
  // Rustvein Quarry
  rustflake:{name:'Rust Flake',type:'etc',price:110,col:'#b8643a',g:'•'}, slagcinder:{name:'Slag Cinder',type:'etc',price:130,col:'#5a4a42',g:'•'},
  quarrystone:{name:'Cut Quarrystone',type:'etc',price:150,col:'#8a8478',g:'•'}, minerlamp:{name:'Ghostly Lamp Wick',type:'etc',price:180,col:'#e8e0a0',g:'•'},
  foremanhelm:{name:"Foreman's Helm",type:'head',def:9,b:{vit:3,str:2,dmgred:2},price:36000,lv:44,slots:1,col:'#a0603a',g:'^',desc:'Dropped by the Rustbound Foreman.'},
  // Hollowmoor
  wispash:{name:'Wisp Ash',type:'etc',price:300,col:'#9ad0a0',g:'•'}, barrowfang:{name:'Barrow Fang',type:'etc',price:330,col:'#d8d0c0',g:'•'},
  wightmoss:{name:'Wight Moss',type:'etc',price:360,col:'#5a6a5a',g:'•'}, gallowsfeather:{name:'Gallows Feather',type:'etc',price:390,col:'#2a2a32',g:'•'},
  barrowsignet:{name:'Barrow Signet',type:'accessory',b:{int:4,dex:2,maxsp:120,cast:5},price:80000,lv:78,slots:1,col:'#7a6a9a',g:'O',desc:'Dropped by the Barrow Queen.'},
  // Barrow Deeps
  gravesilk:{name:'Grave Silk',type:'etc',price:420,col:'#c8c0b8',g:'•'}, bonedust:{name:'Bone Dust',type:'etc',price:450,col:'#e8e0d0',g:'•'},
  shadeessence:{name:'Shade Essence',type:'etc',price:500,col:'#3a3048',g:'•'}, regentcrown:{name:"Regent's Crown",type:'head',def:14,b:{int:4,vit:4,maxhp:700,dmgred:3},price:120000,lv:88,slots:1,col:'#d8d0e8',g:'^',desc:'Dropped by the Pale Regent.'},
  // Starfall Expanse
  stardust:{name:'Stardust',type:'etc',price:560,col:'#c8d0ff',g:'•'}, voidhide:{name:'Void Hide',type:'etc',price:600,col:'#2a2050',g:'•'},
  meteorcore:{name:'Meteor Core',type:'etc',price:650,col:'#8a5a4a',g:'•'}, astralscale:{name:'Astral Scale',type:'etc',price:700,col:'#6a8af0',g:'•'},
  fallenstar:{name:'Fallen Star',type:'accessory',b:{str:3,agi:3,vit:3,int:3,dex:3,luk:3,crit:3},price:150000,lv:95,slots:1,col:'#e8e0ff',g:'O',desc:'Dropped by Astrael the Fallen Star.'}});
// ---- Rustvein Quarry (Lv 36-46) ----
r7('rustmite','Rust Mite',37,'ashcrawler',{shape:'bug',col:'#b8643a',size:12,el:'earth',drops:[['rustflake',.45],['orange',.1]],sig:{kind:'armor',b:{def:6,vit:1,killsp:8},txt:'+6 DEF, +1 VIT, +8 KILLSP'}});
r7('slaghound','Slag Hound',39,'gravehound',{shape:'beast',col:'#5a4a42',size:14,el:'fire',aggro:true,drops:[['slagcinder',.45],['orange',.1]],sig:{kind:'weapon',b:{atk:16,str:1,critdmg:3},txt:'+16 ATK, +1 STR, +3% critical damage'}});
r7('quarrygolem','Quarry Golem',42,'ashgolem',{shape:'golem',col:'#8a8478',size:17,el:'earth',spd:40,drops:[['quarrystone',.45],['orange',.1],['emberore',.04]],sig:{kind:'armor',b:{vit:3,maxhp:150,str:1},txt:'+3 VIT, +150 Max HP, +1 STR'}});
r7('lostminer','Lost Miner',44,'quartzwraith',{shape:'ghost',col:'#9aa0a8',size:13,el:'shadow',undead:true,aggro:true,drops:[['minerlamp',.45],['blue',.08],['glintstone',.04]],sig:{kind:'head',b:{int:2,dex:2,hit:4},txt:'+2 INT, +2 DEX, +4 HIT'}});
r7('rustforeman','The Rustbound Foreman',47,'hornback',{shape:'golem',col:'#a0603a',size:27,el:'earth',drops:[['foremanhelm',.2],['quarrystone',1],['orange',1],['glintstone',.4]],sig:{kind:'head',b:{vit:3,str:2,def:3},txt:'+3 VIT, +2 STR, +3 DEF'}});
// ---- Hollowmoor (Lv 70-82) ----
r7('moorlantern',"Will-o'-Lantern",71,'abysswisp',{shape:'ghost',col:'#9ad0a0',size:12,el:'shadow',drops:[['wispash',.45],['blue',.1]],sig:{kind:'weapon',b:{matk:56,dex:2,maxsp:30},txt:'+56 MATK, +2 DEX, +30 Max SP'}});
r7('barrowhound','Barrow Hound',73,'duskpanther',{shape:'beast',col:'#4a4a5a',size:15,el:'shadow',aggro:true,drops:[['barrowfang',.45],['orange',.12]],sig:{kind:'accessory',b:{agi:3,crit:3,dex:2},txt:'+3 AGI, +3 CRIT, +2 DEX'}});
r7('bogwight','Bog Wight',76,'drownedknight',{shape:'golem',col:'#5a6a5a',size:16,el:'shadow',undead:true,aggro:true,drops:[['wightmoss',.45],['orange',.12],['glintstone',.05]],sig:{kind:'armor',b:{def:11,vit:2,maxsp:40},txt:'+11 DEF, +2 VIT, +40 Max SP'}});
r7('gallowsraven','Gallows Raven',78,'thunderhawk',{shape:'beast',col:'#2a2a32',size:13,el:'wind',drops:[['gallowsfeather',.45],['blue',.1]],sig:{kind:'head',b:{dex:3,agi:2,hit:5},txt:'+3 DEX, +2 AGI, +5 HIT'}});
r7('barrowqueen','The Barrow Queen',82,'hornback',{shape:'ghost',col:'#7a6a9a',size:28,el:'shadow',drops:[['barrowsignet',.2],['wispash',1],['orange',1],['blue',1],['glintstone',.6]],sig:{kind:'accessory',b:{int:4,dex:2,maxsp:100},txt:'+4 INT, +2 DEX, +100 Max SP'}});
// ---- Barrow Deeps B1 (Lv 78-84) ----
r7('gravecrawler','Grave Crawler',79,'cinderling',{shape:'bug',col:'#6a5a4a',size:14,el:'earth',undead:true,aggro:true,drops:[['gravesilk',.45],['orange',.12]],sig:{kind:'armor',b:{def:12,luk:1,flee:4},txt:'+12 DEF, +1 LUK, +4 FLEE'}});
r7('bonewarden','Bone Warden',81,'obsidiangolem',{shape:'skeleton',col:'#e8e0d0',size:15,el:'shadow',undead:true,aggro:true,drops:[['bonedust',.45],['orange',.12],['glintstone',.05]],sig:{kind:'weapon',b:{atk:36,vit:2,def:4},txt:'+36 ATK, +2 VIT, +4 DEF'}});
r7('barrowshade','Barrow Shade',83,'flamewraith',{shape:'ghost',col:'#3a3048',size:13,el:'shadow',aggro:true,ail:['blind',.12,3],drops:[['shadeessence',.45],['blue',.12]],sig:{kind:'weapon',b:{matk:66,dex:1,spregen:1},txt:'+66 MATK, +1 DEX, +1 SP regen'}});
// ---- Barrow Deeps B2 (Lv 84-90) ----
r7('souleater','Soul Eater',85,'stormelemental',{shape:'ghost',col:'#5a3a6a',size:15,el:'shadow',aggro:true,ail:['silence',.1,3],drops:[['shadeessence',.45],['blue',.14]],sig:{kind:'head',b:{int:4,maxsp:90,cast:3},txt:'+4 INT, +90 Max SP, spells cast 3% faster'}});
r7('barrowknight','Barrow Knight',87,'pyretitan',{shape:'golem',col:'#3a3a44',size:17,el:'shadow',undead:true,aggro:true,drops:[['bonedust',.45],['orange',.14],['glintstone',.06]],sig:{kind:'armor',b:{def:13,str:2,dmgred:1},txt:'+13 DEF, +2 STR, Damage taken −1%'}});
r7('tombweaver','Tomb Weaver',88,'basaltcrawler',{shape:'bug',col:'#4a3a3a',size:15,el:'earth',aggro:true,ail:['poison',.15,6],drops:[['gravesilk',.45],['orange',.14]],sig:{kind:'accessory',b:{agi:3,dex:3,flee:6},txt:'+3 AGI, +3 DEX, +6 FLEE'}});
r7('paleregent','The Pale Regent',91,'mirematriarch',{shape:'ghost',col:'#d8d0e8',size:32,el:'shadow',undead:true,respawn:180,drops:[['regentcrown',.25],['shadeessence',1],['orange',1],['blue',1],['glintstone',.8]],sig:{kind:'head',b:{int:4,vit:4,maxhp:600},txt:'+4 INT, +4 VIT, +600 Max HP'}});
MOBS.paleregent.boss=true;delete MOBS.paleregent.mini;
// ---- Starfall Expanse (Lv 90-99) ----
r7('starshard','Star Shard',91,'magmaelemental',{shape:'golem',col:'#a8b8ff',size:14,el:'holy',drops:[['stardust',.45],['blue',.14]],sig:{kind:'weapon',b:{matk:74,int:1,cast:4},txt:'+74 MATK, +1 INT, spells cast 4% faster'}});
r7('voidstalker','Void Stalker',93,'ashrevenant',{shape:'beast',col:'#2a2050',size:16,el:'shadow',aggro:true,drops:[['voidhide',.45],['orange',.15]],sig:{kind:'accessory',b:{agi:4,crit:4,critdmg:4},txt:'+4 AGI, +4 CRIT, +4% critical damage'}});
r7('meteorgolem','Meteor Golem',95,'moltenknight',{shape:'golem',col:'#5a4a6a',size:18,el:'fire',spd:40,aggro:true,drops:[['meteorcore',.45],['orange',.15],['glintstone',.07]],sig:{kind:'armor',b:{def:15,vit:2,maxhp:200},txt:'+15 DEF, +2 VIT, +200 Max HP'}});
r7('astralserpent','Astral Serpent',97,'hellimp',{shape:'blob',col:'#6a8af0',size:16,el:'wind',aggro:true,drops:[['astralscale',.45],['blue',.15]],sig:{kind:'weapon',b:{atk:44,agi:2,hit:6},txt:'+44 ATK, +2 AGI, +6 HIT'}});
r7('astrael','Astrael the Fallen Star',99,'hornback',{shape:'ghost',col:'#e8e0ff',size:30,el:'holy',drops:[['fallenstar',.2],['stardust',1],['orange',1],['blue',1],['glintstone',.8]],sig:{kind:'accessory',b:{str:2,agi:2,int:2,dex:2,luk:2},txt:'+2 STR, AGI, INT, DEX and LUK'}});
for(const id of R7_MOBS){const m=MOBS[id];m.id=id;m.hit=m.lv*2+12;
  ITEMS[id+'_sig']={name:m.name+' Sigil',type:'sigil',kind:m.sig.kind,b:m.sig.b,price:m.boss?20000:600,col:'#ffcf5a',g:'✦',desc:'Socket into '+(/^[aeiou]/.test(m.sig.kind)?'an':'a')+' '+m.sig.kind+': '+m.sig.txt+'.'};}
// ---- their land ----
Object.assign(THEMES,{
  quarry:{...THEMES.canyon,g:['#8a7a6a','#8e7e6e','#867666'],path:'#a89070',rock:['#6a5a4a','#9a7a5a'],rocky:true,rockKind:'rock'},
  moor:{...THEMES.dusk,g:['#4a4a5a','#4e4e5e','#464656'],path:'#6a6070',canopy:['#2a2a3a','#3a3448'],water:'#3a4a5a'},
  barrow:{...THEMES.cave,g:['#2e2c34','#322f38','#2b2930'],path:'#4a4450',rock:['#1e1c22','#4a4652'],canopy:['#2a2830','#3a3640'],water:'#2a3440',lava:false,dark:true,rocky:true,rockKind:'rock'},
  starfall:{...THEMES.crystal,g:['#3a3a5a','#3e3e5e','#363656'],path:'#6a6a9a',rock:['#2a2a4a','#8a8ae8'],water:'#4a5ab8',rocky:true,rockKind:'rock'}});
Object.assign(ZONES,{
  quarry:{name:'Rustvein Quarry',w:64,h:46,theme:'quarry',music:'ruins',seed:607,density:.05,ponds:1,lvl:'Lv 36–46',
    mobs:[['rustmite',13],['slaghound',10],['quarrygolem',8],['lostminer',6],['rustforeman',1],['quarrygolem',4,'rustforeman']],links:{}},
  moor:{name:'Hollowmoor',w:64,h:46,theme:'moor',music:'dusk',seed:619,density:.06,ponds:5,lvl:'Lv 70–82',
    mobs:[['moorlantern',13],['barrowhound',10],['bogwight',8],['gallowsraven',6],['barrowqueen',1],['barrowhound',4,'barrowqueen']],links:{},stairs:'barrow1'},
  barrow1:{name:'Barrow Deeps B1',w:54,h:38,theme:'barrow',music:'crypt',dungeon:1,seed:631,density:.13,ponds:1,lvl:'Lv 78–84 · dungeon',
    mobs:[['gravecrawler',13],['bonewarden',10],['barrowshade',7]],links:{west:'moor',east:'barrow2'}},
  barrow2:{name:'Barrow Deeps B2',w:54,h:38,theme:'barrow',music:'crypt',dungeon:2,seed:643,density:.14,ponds:1,lvl:'Lv 84–90 · boss',
    mobs:[['souleater',10],['barrowknight',9],['tombweaver',7],['paleregent',1]],links:{west:'barrow1'}},
  starfall:{name:'Starfall Expanse',w:66,h:46,theme:'starfall',music:'crystal',seed:653,density:.05,ponds:2,lvl:'Lv 90–99',
    mobs:[['starshard',13],['voidstalker',10],['meteorgolem',8],['astralserpent',6],['astrael',1],['voidstalker',4,'astrael']],links:{}}});
// ---- on the world grid, with gates to their neighbours (walls where the levels are far apart) ----
Object.assign(WORLD_GRID,{quarry:[-2,2],moor:[3,0],starfall:[3,3]});
WORLD_WALLS.push(['quarry','marsh'],['moor','woods']);
WORLD_ROADS.mid.push('quarry');WORLD_ROADS.east.push('moor');WORLD_ROADS.south.push('starfall');
for(const id in WORLD_GRID)if(ZONES[id])ZONES[id].links=worldLinks(id);
if(typeof worldRing==='function')worldRing.d=null;
for(const id of ['quarry','moor','starfall','barrow1','barrow2'])if(!ZONE_ORDER.includes(id))ZONE_ORDER.push(id);
