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
r5Mob('briarling','Briarling',9,'greylupe',{aggro:false,shape:'leaf',col:'#6a8a3a',size:12,el:'earth',drops:[['brambleberry',.5],['red',.08]],sig:{kind:'weapon',b:{atk:5,hit:3},txt:'+5 ATK, +3 HIT'}});
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
r5Mob('reedfrog','Reedfrog',13,'greylupe',{aggro:false,shape:'blob',col:'#6aa080',size:12,el:'water',drops:[['frogskin',.45],['red',.1]],sig:{kind:'armor',b:{flee:4},txt:'+4 FLEE'}});
r5Mob('valestag','Vale Stag',16,'greylupe',{shape:'beast',col:'#c8b898',size:15,el:'earth',aggro:false,drops:[['stagvelvet',.45],['orange',.05]],sig:{kind:'weapon',b:{atk:8,agi:1},txt:'+8 ATK, +1 AGI'}});
r5Mob('lanternmoth','Lantern Moth',18,'webspinner',{shape:'bug',col:'#f0e0a0',size:12,el:'fire',ail:null,drops:[['lanterndust',.45],['blue',.05]],sig:{kind:'accessory',b:{int:2},txt:'+2 INT'}});
r5Mob('mistmother','Mother of Mists',21,'hornback',{shape:'ghost',col:'#a0b8d0',size:26,el:'water',drops:[['mistveil',.2],['mistdew',1],['orange',1],['glintstone',.2]],sig:{kind:'armor',b:{int:2,maxsp:60},txt:'+2 INT, +60 Max SP'}});
// ---- Thornmere Wilds (Lv 16-28): a tangled wild of thorn and bog north of Goldleaf Downs ----
r5Mob('thornrat','Thornrat',17,'greylupe',{shape:'beast',col:'#7a5a4a',size:11,el:'earth',drops:[['thornhide',.45],['red',.1]],sig:{kind:'weapon',b:{atk:9},txt:'+9 ATK'}});
r5Mob('mirebloom','Mire Bloom',20,'webspinner',{shape:'mushroom',col:'#9a4a6a',size:13,el:'earth',drops:[['bloomspore',.45],['remedy',.05]],sig:{kind:'armor',b:{def:4,vit:1},txt:'+4 DEF, +1 VIT'}});
r5Mob('bramblelupe','Bramble Lupe',23,'greylupe',{shape:'beast',col:'#5a5048',size:15,el:'earth',drops:[['wildpelt',.45],['orange',.06]],sig:{kind:'accessory',b:{agi:2,crit:2},txt:'+2 AGI, +2 CRIT'}});
r5Mob('thornstonegolem','Thornstone Golem',26,'greylupe',{shape:'golem',col:'#6a6a5a',size:17,el:'earth',spd:55,drops:[['thornstone',.45],['orange',.08]],sig:{kind:'armor',b:{def:6},txt:'+6 DEF'}});
r5Mob('gnarlroot','Old Gnarlroot',29,'hornback',{shape:'golem',col:'#4a3a2a',size:28,el:'earth',drops:[['gnarlcharm',.2],['thornstone',1],['orange',1],['glintstone',.3]],sig:{kind:'armor',b:{vit:3,def:4},txt:'+3 VIT, +4 DEF'}});
// new looks for the land, from the nearest kind of country
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
