"use strict";
/* ================= the far east: regions past Mirelight Fen for Lv 68+ (v1.41.0) =================
   Loaded right after data.js, so everything later (sigils, radiant sigils, bounties, the Bestiary, the server's world
   file) sees these monsters as if they had always been there.
     Saltspray Coast (Lv 68-80): a sunlit shore of sand, tide pools and palms, wrecks and reefs, east of Mirelight Fen.
       Tidecrab, Saltwing, Driftwood Golem, Coral Siren (sings you to sleep), Reef Stalker (hunts in packs),
       Barnacle Brute, and the Kraken Matron with her Reef Stalker escort. */
Object.assign(ITEMS,{
  tideshell:{name:'Tide Shell',type:'etc',price:440,col:'#f0c8b0',g:'•'}, saltfeather:{name:'Salt Feather',type:'etc',price:450,col:'#f4f4f0',g:'•'},
  driftwood:{name:'Driftwood',type:'etc',price:460,col:'#b89870',g:'•'}, pearl:{name:'Siren Pearl',type:'etc',price:480,col:'#f4eaff',g:'•'},
  reeffin:{name:'Reef Fin',type:'etc',price:490,col:'#4a8ab0',g:'•'}, barnacle:{name:'Barnacle Plate',type:'etc',price:510,col:'#8a9a9a',g:'•'},
  krakeneye:{name:'Kraken Eye',type:'accessory',b:{int:5,dex:5,maxsp:120},price:60000,lv:75,slots:1,col:'#5ac8e8',g:'O',desc:'Dropped by the Kraken Matron. INT +5 · DEX +5 · Max SP +120.'}});
Object.assign(MOBS,{
  tidecrab:{name:'Tidecrab',lv:68,hp:6800,atk:390,def:120,flee:40,exp:5400,jexp:3600,spd:55,shape:'bug',col:'#e0603a',size:15,el:'water',drops:[['tideshell',.45],['orange',.12]],sig:{kind:'armor',b:{def:12,vit:2},txt:'+12 DEF, +2 VIT'}},
  saltwing:{name:'Saltwing',lv:70,hp:5600,atk:400,def:45,flee:115,exp:5700,jexp:3800,spd:120,aggro:true,shape:'beast',col:'#e8eef4',size:13,el:'wind',drops:[['saltfeather',.4],['blue',.1]],sig:{kind:'accessory',b:{agi:4,flee:8},txt:'+4 AGI, +8 FLEE'}},
  driftgolem:{name:'Driftwood Golem',lv:72,hp:10500,atk:420,def:140,flee:20,exp:6200,jexp:4200,spd:40,aggro:true,shape:'golem',col:'#a8885a',size:20,el:'earth',drops:[['driftwood',.45],['emberore',.06]],sig:{kind:'armor',b:{maxhp:500,def:6},txt:'+500 Max HP, +6 DEF'}},
  coralsiren:{name:'Coral Siren',lv:74,hp:6200,atk:440,def:50,flee:100,exp:6600,jexp:4500,spd:80,aggro:true,range:180,shape:'ghost',col:'#ff8aa8',size:14,el:'water',ail:['sleep',.12,3],drops:[['pearl',.4],['blue',.12]],sig:{kind:'weapon',b:{matk:75,int:3},txt:'+75 MATK, +3 INT'}},
  reefstalker:{name:'Reef Stalker',lv:76,hp:8000,atk:470,def:80,flee:70,exp:7100,jexp:4800,spd:115,aggro:true,shape:'beast',col:'#3a6a8a',size:17,el:'water',drops:[['reeffin',.4],['orange',.12]],sig:{kind:'weapon',b:{atk:34,str:2},txt:'+34 ATK, +2 STR'}},
  barnaclebrute:{name:'Barnacle Brute',lv:78,hp:12500,atk:480,def:160,flee:25,exp:7800,jexp:5200,spd:45,aggro:true,shape:'golem',col:'#6a7a7a',size:21,el:'water',ail:['stun',.1,1.5],drops:[['barnacle',.4],['glintstone',.06]],sig:{kind:'head',b:{vit:4,maxhp:300},txt:'+4 VIT, +300 Max HP'}},
  krakenmatron:{name:'Kraken Matron',lv:82,hp:95000,atk:560,def:130,flee:70,exp:80000,jexp:52000,spd:60,aggro:true,boss:true,mini:true,calls:true,shape:'blob',col:'#7a3a8a',size:26,el:'water',respawn:150,sigChance:.15,
    drops:[['krakeneye',.2],['reeffin',1],['orange',1],['glintstone',.4],['emberore',.4]],sig:{kind:'accessory',b:{int:4,dex:4,maxsp:80},txt:'+4 INT, +4 DEX, +80 Max SP'}}});
MOBS.coralsiren.skill='blink';MOBS.reefstalker.pack=true;
for(const id of ['tidecrab','saltwing','driftgolem','coralsiren','reefstalker','barnaclebrute','krakenmatron']){const m=MOBS[id];m.id=id;m.hit=m.lv*2+12;
  ITEMS[id+'_sig']={name:m.name+' Sigil',type:'sigil',kind:m.sig.kind,b:m.sig.b,price:m.boss?20000:600,col:'#ffcf5a',g:'✦',desc:`Socket into ${/^[aeiou]/.test(m.sig.kind)?'an':'a'} ${m.sig.kind}: ${m.sig.txt}.`};}
for(const id in ITEMS)if(!ITEMS[id].id)ITEMS[id].id=id;
ZONES.coast={name:'Saltspray Coast',w:68,h:46,theme:'coast',music:'coast',seed:151,density:.045,ponds:15,lvl:'Lv 68–80',
  mobs:[['tidecrab',12],['saltwing',9],['driftgolem',6],['coralsiren',6],['reefstalker',6],['barnaclebrute',4],['krakenmatron',1],['reefstalker',3,'krakenmatron']],links:{west:'fen'}};
ZONES.fen.links.east='coast';
if(!ZONE_ORDER.includes('coast'))ZONE_ORDER.push('coast');
THEMES.coast={g:['#ead8aa','#eedcb0','#e5d2a2'],path:'#d8c08a',canopy:['#3f8a4a','#5aa85a'],water:'#3aa8c8'};
/* ---- Cinderpeak Caldera (Lv 78-90): a volcano past the Coast: black rock, crags and rivers of lava, ash in the air.
   Cinderling, Magma Hound (packs), Obsidian Golem, Flame Wraith (bolts of fire), Ashen Salamander, Pyre Titan, and the
   Cinder Wyrm with a Magma Hound escort. Fire monsters: Water Oil from the Alchemist bites hard here. ---- */
Object.assign(ITEMS,{
  cinderash:{name:'Cinder Ash',type:'etc',price:530,col:'#8a7a72',g:'•'}, magmahide:{name:'Magma Hide',type:'etc',price:550,col:'#c8501a',g:'•'},
  obsidian:{name:'Obsidian Shard',type:'etc',price:570,col:'#2a2238',g:'•'}, wraithflame:{name:'Wraith Flame',type:'etc',price:590,col:'#ff9a3a',g:'•'},
  salascale:{name:'Salamander Scale',type:'etc',price:610,col:'#e8702a',g:'•'}, pyrecore:{name:'Pyre Core',type:'etc',price:640,col:'#ffcf5a',g:'•'},
  wyrmheart:{name:'Wyrmheart',type:'accessory',b:{str:6,vit:4,atk:30},price:80000,lv:85,slots:1,col:'#ff5a2a',g:'O',desc:'Dropped by the Cinder Wyrm. STR +6 · VIT +4 · ATK +30.'}});
Object.assign(MOBS,{
  cinderling:{name:'Cinderling',lv:78,hp:9000,atk:500,def:90,flee:50,exp:8200,jexp:5500,spd:55,shape:'blob',col:'#e8602a',size:14,el:'fire',drops:[['cinderash',.45],['orange',.12]],sig:{kind:'armor',b:{maxhp:600,vit:2},txt:'+600 Max HP, +2 VIT'}},
  magmahound:{name:'Magma Hound',lv:80,hp:9500,atk:520,def:85,flee:80,exp:8700,jexp:5800,spd:125,aggro:true,shape:'beast',col:'#a8381a',size:16,el:'fire',drops:[['magmahide',.4],['orange',.12]],sig:{kind:'accessory',b:{str:4,crit:5},txt:'+4 STR, +5 CRIT'}},
  obsidiangolem:{name:'Obsidian Golem',lv:82,hp:15000,atk:540,def:190,flee:20,exp:9400,jexp:6300,spd:40,aggro:true,shape:'golem',col:'#2e2838',size:21,el:'earth',drops:[['obsidian',.45],['emberore',.08]],sig:{kind:'armor',b:{def:16,maxhp:400},txt:'+16 DEF, +400 Max HP'}},
  flamewraith:{name:'Flame Wraith',lv:84,hp:8500,atk:560,def:55,flee:110,exp:9900,jexp:6700,spd:90,aggro:true,range:190,shape:'ghost',col:'#ff8a3a',size:14,el:'fire',ail:['blind',.12,5],drops:[['wraithflame',.4],['blue',.12]],sig:{kind:'weapon',b:{matk:90,int:4},txt:'+90 MATK, +4 INT'}},
  salamander:{name:'Ashen Salamander',lv:86,hp:11000,atk:590,def:100,flee:90,exp:10600,jexp:7100,spd:110,aggro:true,shape:'beast',col:'#d8602a',size:17,el:'fire',ail:['poison',.12,6],drops:[['salascale',.4],['orange',.14]],sig:{kind:'weapon',b:{atk:42,agi:3},txt:'+42 ATK, +3 AGI'}},
  pyretitan:{name:'Pyre Titan',lv:88,hp:17500,atk:610,def:175,flee:25,exp:11500,jexp:7700,spd:45,aggro:true,shape:'golem',col:'#6a3a2a',size:22,el:'fire',ail:['stun',.1,1.5],drops:[['pyrecore',.4],['glintstone',.08]],sig:{kind:'head',b:{str:4,maxhp:500},txt:'+4 STR, +500 Max HP'}},
  cinderwyrm:{name:'Cinder Wyrm',lv:92,hp:130000,atk:680,def:150,flee:80,exp:120000,jexp:80000,spd:70,aggro:true,boss:true,mini:true,calls:true,shape:'beast',col:'#8a2a1a',size:28,el:'fire',respawn:180,sigChance:.15,
    drops:[['wyrmheart',.2],['pyrecore',1],['orange',1],['glintstone',.5],['emberore',.5]],sig:{kind:'weapon',b:{atk:50,str:4},txt:'+50 ATK, +4 STR'}}});
MOBS.flamewraith.skill='bolt';MOBS.magmahound.pack=true;
for(const id of ['cinderling','magmahound','obsidiangolem','flamewraith','salamander','pyretitan','cinderwyrm']){const m=MOBS[id];m.id=id;m.hit=m.lv*2+12;
  ITEMS[id+'_sig']={name:m.name+' Sigil',type:'sigil',kind:m.sig.kind,b:m.sig.b,price:m.boss?20000:600,col:'#ffcf5a',g:'✦',desc:`Socket into ${/^[aeiou]/.test(m.sig.kind)?'an':'a'} ${m.sig.kind}: ${m.sig.txt}.`};}
for(const id in ITEMS)if(!ITEMS[id].id)ITEMS[id].id=id;
ZONES.caldera={name:'Cinderpeak Caldera',w:66,h:46,theme:'caldera',music:'caldera',seed:173,density:.07,ponds:9,lvl:'Lv 78–90',
  mobs:[['cinderling',12],['magmahound',9],['obsidiangolem',6],['flamewraith',6],['salamander',6],['pyretitan',4],['cinderwyrm',1],['magmahound',3,'cinderwyrm']],links:{west:'coast'}};
ZONES.coast.links.east='caldera';
if(!ZONE_ORDER.includes('caldera'))ZONE_ORDER.push('caldera');
THEMES.caldera={g:['#3a3236','#3e363a','#363034'],path:'#5a4a44',rock:['#2a2228','#4a3e44'],water:'#e8541a',lava:true};
