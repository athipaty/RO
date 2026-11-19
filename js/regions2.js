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
