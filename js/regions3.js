"use strict";
/* ================= the Molten Depths: a three-floor dungeon under Cinderpeak Caldera (Lv 85-99, v1.41.2) =================
   Stairs in the Caldera lead down. Dark tunnels of basalt with rivers of lava; the deeper, the hotter.
     B1 (Lv 85-91)  Ember Bat, Lava Slug, Basalt Crawler
     B2 (Lv 91-95)  Magma Elemental, Molten Knight, Ash Revenant
     B3 (Lv 95-99)  Molten Knight, Hellflame Imp, and Ignarok the Molten King, the last boss of Embervale,
                    with a guard of Molten Knights. He can drop the Molten Crown. */
Object.assign(ITEMS,{
  batwingash:{name:'Ember Bat Wing',type:'etc',price:660,col:'#8a3a2a',g:'•'}, slugslime:{name:'Lava Slime',type:'etc',price:680,col:'#ff7a2a',g:'•'},
  basaltplate:{name:'Basalt Plate',type:'etc',price:700,col:'#3a3236',g:'•'}, magmacore:{name:'Magma Core',type:'etc',price:730,col:'#ff5a1a',g:'•'},
  moltensteel:{name:'Molten Steel',type:'etc',price:760,col:'#c8784a',g:'•'}, revenantash:{name:'Revenant Ash',type:'etc',price:790,col:'#9a8a9a',g:'•'},
  hellflame:{name:'Hellflame Ember',type:'etc',price:820,col:'#ff3a3a',g:'•'},
  moltencrown:{name:'Molten Crown',type:'head',def:12,b:{str:3,agi:3,vit:3,int:3,dex:3,luk:3,atk:40,matk:40},price:150000,lv:95,slots:1,col:'#ffb040',g:'^',desc:'Dropped by Ignarok the Molten King. All stats +3 · ATK +40 · MATK +40.'}});
Object.assign(MOBS,{
  emberbat:{name:'Ember Bat',lv:85,hp:9800,atk:600,def:70,flee:130,exp:12500,jexp:8400,spd:130,aggro:true,shape:'beast',col:'#6a2a22',size:12,el:'fire',drops:[['batwingash',.45],['orange',.14]],sig:{kind:'accessory',b:{agi:5,flee:10},txt:'+5 AGI, +10 FLEE'}},
  lavaslug:{name:'Lava Slug',lv:87,hp:14000,atk:610,def:120,flee:30,exp:13200,jexp:8900,spd:40,shape:'blob',col:'#ff6a2a',size:16,el:'fire',ail:['poison',.14,6],drops:[['slugslime',.45],['orange',.14]],sig:{kind:'armor',b:{maxhp:800,vit:3},txt:'+800 Max HP, +3 VIT'}},
  basaltcrawler:{name:'Basalt Crawler',lv:89,hp:15500,atk:640,def:200,flee:50,exp:14000,jexp:9400,spd:70,aggro:true,shape:'bug',col:'#3a3236',size:17,el:'earth',drops:[['basaltplate',.4],['emberore',.08]],sig:{kind:'armor',b:{def:20,maxhp:400},txt:'+20 DEF, +400 Max HP'}},
  magmaelemental:{name:'Magma Elemental',lv:91,hp:17000,atk:670,def:150,flee:40,exp:15000,jexp:10100,spd:50,aggro:true,shape:'golem',col:'#e8541a',size:20,el:'fire',ail:['stun',.1,1.5],drops:[['magmacore',.4],['glintstone',.08]],sig:{kind:'weapon',b:{atk:55,str:3},txt:'+55 ATK, +3 STR'}},
  moltenknight:{name:'Molten Knight',lv:93,hp:18500,atk:700,def:190,flee:70,exp:16000,jexp:10800,spd:75,aggro:true,undead:true,shape:'skeleton',col:'#8a4a2a',size:18,el:'fire',drops:[['moltensteel',.4],['orange',.16]],sig:{kind:'head',b:{str:5,maxhp:600},txt:'+5 STR, +600 Max HP'}},
  ashrevenant:{name:'Ash Revenant',lv:94,hp:13000,atk:720,def:80,flee:120,exp:16500,jexp:11100,spd:95,aggro:true,undead:true,range:190,shape:'ghost',col:'#8a7a8a',size:15,el:'shadow',ail:['blind',.14,5],drops:[['revenantash',.4],['blue',.14]],sig:{kind:'weapon',b:{matk:110,int:5},txt:'+110 MATK, +5 INT'}},
  hellimp:{name:'Hellflame Imp',lv:96,hp:14500,atk:760,def:110,flee:140,exp:17500,jexp:11800,spd:120,aggro:true,range:170,shape:'imp',col:'#c82a2a',size:13,el:'fire',drops:[['hellflame',.4],['blue',.14]],sig:{kind:'accessory',b:{int:5,dex:5},txt:'+5 INT, +5 DEX'}},
  ignarok:{name:'Ignarok the Molten King',lv:99,hp:220000,atk:820,def:190,flee:90,exp:220000,jexp:150000,spd:65,aggro:true,boss:true,calls:true,shape:'golem',col:'#6a1e12',size:32,el:'fire',respawn:240,sigChance:.15,
    drops:[['moltencrown',.15],['hellflame',1],['magmacore',1],['orange',1],['glintstone',.6],['emberore',.6]],sig:{kind:'armor',b:{maxhp:1200,str:4,vit:4},txt:'+1200 Max HP, +4 STR, +4 VIT'}}});
MOBS.ashrevenant.skill='blink';MOBS.hellimp.skill='bolt';MOBS.emberbat.pack=true;
for(const id of ['emberbat','lavaslug','basaltcrawler','magmaelemental','moltenknight','ashrevenant','hellimp','ignarok']){const m=MOBS[id];m.id=id;m.hit=m.lv*2+12;
  ITEMS[id+'_sig']={name:m.name+' Sigil',type:'sigil',kind:m.sig.kind,b:m.sig.b,price:m.boss?20000:600,col:'#ffcf5a',g:'✦',desc:`Socket into ${/^[aeiou]/.test(m.sig.kind)?'an':'a'} ${m.sig.kind}: ${m.sig.txt}.`};}
for(const id in ITEMS)if(!ITEMS[id].id)ITEMS[id].id=id;
Object.assign(ZONES,{
  molten1:{name:'Molten Depths B1',w:54,h:38,theme:'molten',music:'caldera',dungeon:1,seed:191,density:.12,ponds:4,lvl:'Lv 85–91 · dungeon',mobs:[['emberbat',13],['lavaslug',10],['basaltcrawler',6]],links:{west:'caldera',east:'molten2'}},
  molten2:{name:'Molten Depths B2',w:54,h:38,theme:'molten',music:'caldera',dungeon:2,seed:203,density:.13,ponds:5,lvl:'Lv 91–95 · dungeon',mobs:[['magmaelemental',11],['moltenknight',10],['ashrevenant',7],['emberbat',4]],links:{west:'molten1',east:'molten3'}},
  molten3:{name:'Molten Depths B3',w:54,h:38,theme:'molten',music:'caldera',dungeon:3,seed:217,density:.14,ponds:5,lvl:'Lv 95–99 · boss',mobs:[['moltenknight',10],['hellimp',9],['ashrevenant',4],['ignarok',1],['moltenknight',4,'ignarok']],links:{west:'molten2'}}});
ZONES.caldera.stairs='molten1';
THEMES.molten={g:['#2a2024','#2e2428','#262022'],path:'#4a3a36',rock:['#1e181c','#3a2e34'],water:'#e8541a',lava:true,dark:true};
