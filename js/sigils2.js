"use strict";
/* ================= sigils, second pass: bosses on top, weak ones lifted, fair in player fights (v1.49.0) =================
   - A boss sigil now always beats the normal sigils near its level (before, Fallen Paladin, Antler King, Hollow King and
     Voltaris gave less than ordinary monsters a few levels away).
   - Sigils that gave almost nothing for their level get a second line.
   - Late MATK sigils gave about twice what the ATK sigils of the same level gave; they now give about 1.4x (spells hit
     several times and skip DEF, so MATK is worth more per point), and late ATK sigils grow a little.
   - In player fights (duel, arena, guild war) "Damage taken" and FLEE now count too (see js/duel.js pvpTaken and
     pvpFlee), so defensive sigils are worth socketing for PvP and not only against monsters.
   Every value below replaces the sigil's whole bonus list. Loaded after js/builds3.js (which adds build lines to some
   sigils) and before js/awaken.js (which makes the Radiant twins from these numbers). */
const SIG2={
  // bosses
  hornback:{vit:3,str:3,maxhp:100},
  woolhorn:{vit:3,maxhp:200,dmgred:2},
  grandscarecrow:{atk:20,luk:3,crit:3},
  antlerking:{str:3,agi:3,aspd:5},
  fallenpaladin:{def:12,vit:3,dmgred:5,healpct:10},
  orchidra:{int:5,maxsp:80,cast:8,healpct:8},
  frostmatron:{int:5,maxsp:80,matkpct:6},
  geodecolossus:{def:16,maxhp:500,dmgred:4},
  mirematriarch:{agi:5,crit:7,critdmg:12},
  hrimfang:{matk:90,int:5,matkpct:6},
  hollowking:{str:5,int:5,atkpct:5,matkpct:5},
  krakenmatron:{int:5,dex:5,maxsp:100,cast:8},
  cinderwyrm:{atk:65,str:5,atkpct:6},
  voltaris:{agi:6,dex:6,aspd:8,dbl:5},
  ignarok:{maxhp:1500,str:5,vit:5,dmgred:6},
  // normal sigils that gave too little for their level
  bumblewing:{agi:2,flee:4},
  cropweevil:{dex:2,hit:5},
  thistlehog:{def:5,maxhp:60},
  stonesentry:{def:8,vit:2},
  howlerape:{str:3,atk:8},
  shardling:{def:10,dmgred:3},
  fenlurker:{str:4,crit:4},
  glasslynx:{agi:4,crit:4},
  duskweaver:{flee:12,agi:3},
  hellimp:{int:5,dex:5,cast:6},
  // late ATK sigils a little up
  gloamstag:{atk:34,str:2},
  bogmantis:{atk:32,agi:2},
  frostbeak:{atk:36,agi:2},
  reefstalker:{atk:40,str:2},
  salamander:{atk:48,agi:3},
  skygriffin:{atk:50,agi:3},
  magmaelemental:{atk:58,str:3},
  // late MATK sigils down to about 1.4x the ATK ones
  marshwisp:{matk:55,int:3},
  rimedrake:{matk:58,int:3},
  nightdryad:{matk:64,int:3},
  coralsiren:{matk:66,int:3},
  flamewraith:{matk:76,int:4},
  stormelemental:{matk:78,int:4},
  ashrevenant:{matk:88,int:5}};
{const NM={maxhp:'Max HP',maxsp:'Max SP'};
  const lab=(k,v)=>(typeof bonusLabel==='function'&&bonusLabel(k,v))||`+${v} ${NM[k]||k.toUpperCase()}`;
  for(const id in SIG2){const m=MOBS[id],it=ITEMS[id+'_sig'];if(!m||!m.sig||!it)continue;
    m.sig.b={...SIG2[id]};it.b=m.sig.b;m.sig.txt=Object.entries(m.sig.b).map(([k,v])=>lab(k,v)).join(', ');
    it.desc=`Socket into ${/^[aeiou]/.test(m.sig.kind)?'an':'a'} ${m.sig.kind}: ${m.sig.txt}.`;}}
