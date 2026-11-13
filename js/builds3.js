"use strict";
/* ================= builds for the master callings, and sigils that carry build stats =================
   Loaded after js/jobs3.js. Each master calling gets a mastery passive and a signature attack that grows with a stat.
   Monster sigils (cards) keep what they gave and add one build stat, so card hunting feeds a build too. */
const BUILD3_SKILLS={
  // Aegis Lord
  livingfortress:{name:'Living Fortress',max:10,col:'#c8ccd4',g:'▦',...PASSIVE(),desc:l=>`Take ${l}% less damage and +${l*2}% max HP.`},
  retribution:{name:'Retribution',max:10,col:'#ffd76a',g:'✹',sp:l=>30+l*3,cd:5,kind:'self',
    desc:l=>`Strike back at every foe within 110px for ${200+l*20}% ATK plus 2% per VIT.`,
    run:l=>{fx.push({k:'ring',x:P.x,y:P.y,r:110,col:'#ffd76a',t0:now,dur:.4});shakeUntil=Math.max(shakeUntil,now+.15);aoe(P.x,P.y,110,m=>dealPhys(m,2+l*.2+S.vit*.02,{sure:true}));}},
  // Warbringer
  bloodthirst:{name:'Bloodthirst',max:10,col:'#e0403a',g:'♥',...PASSIVE(),desc:l=>`+${l*2}% ATK and +${l*3}% critical damage.`},
  execution:{name:'Execution',max:10,col:'#ff6a3a',g:'⚔',sp:l=>25+l*2,cd:4,kind:'target',range:60,
    desc:l=>`A finishing blow for ${300+l*40}% ATK plus 1% per STR, doubled against foes under 30% HP.`,
    run:(l,t)=>{const mx=t.maxhp||(t.d&&t.d.hp),low=mx>0&&t.hp/mx<.3;fx.push({k:'slash',x:t.x,y:t.y,t0:now,dur:.3});fx.push({k:'impact',x:t.x,y:t.y-(t.d?t.d.size*.6:10),t0:now,dur:.3});
      if(low)floatT(t.x,t.y-(t.d?t.d.size:16)-30,'Execute!','#ff6a3a',13);dealPhys(t,(3+l*.4+S.str*.01)*(low?2:1),{sure:true});}},
  // Tempest Sage
  stormmind:{name:'Storm Mind',max:10,col:'#bfefff',g:'☁',...PASSIVE(),desc:l=>`+${l*1.5}% MATK and spells cast ${l*2}% faster.`},
  tempest:{name:'Tempest',max:10,col:'#9fe0ff',g:'✺',sp:l=>50+l*4,cd:7,kind:'self',
    desc:l=>`A storm around you: ${250+l*40}% MATK plus 1% per INT to every foe within 150px, slowing them for 3s.`,
    run:l=>{fx.push({k:'nova',x:P.x,y:P.y,r:150,t0:now,dur:.6});for(let i=0;i<8;i++)fx.push({k:'bolt',x:P.x+rnd(-130,130),y:P.y+rnd(-100,100),t0:now+i*.05,dur:.3});
      aoe(P.x,P.y,150,m=>{dealMag(m,2.5+l*.4+S.int*.01,'wind');slowMob(m,3);});}},
  // Voidcaller
  voidpact:{name:'Void Pact',max:10,col:'#a070d0',g:'◐',...PASSIVE(),desc:l=>`+${l*3}% max SP and take ${l}% less damage.`},
  unmaking:{name:'Unmaking',max:10,col:'#7a3aaa',g:'⊘',sp:l=>40+l*3,cd:8,kind:'area',range:250,radius:130,
    desc:l=>`Every foe within 130px of the target takes ${120+l*20}% MATK as Shadow damage and ${15+l*2}% more damage from you for 10s.`,
    run:(l,x,y)=>{fx.push({k:'ring',x,y,r:130,col:'#7a3aaa',t0:now,dur:.5});aoe(x,y,130,m=>{curseFrail(m,(15+l*2)/100,10);dealMag(m,1.2+l*.2,'shadow');});}},
  // Deadeye
  perfectaim:{name:'Perfect Aim',max:10,col:'#ffe08a',g:'⊕',...PASSIVE(),desc:l=>`+${l} CRIT and +${l*4}% critical damage.`},
  killingshot:{name:'Killing Shot',max:10,col:'#fff0a0',g:'➶',sp:l=>35+l*3,cd:6,kind:'target',range:320,
    desc:l=>`One perfect arrow for ${400+l*50}% ATK plus 2% per DEX that never misses, with ${l*4}% more critical chance.`,
    run:(l,t)=>shoot(P,t,'arrow','#fff0a0',()=>{fx.push({k:'critburst',x:t.x,y:t.y-(t.d?t.d.size:14),t0:now,dur:.35});dealPhys(t,4+l*.5+S.dex*.02,{sure:true,critPlus:l*4});})},
  // Beastlord
  alphainstinct:{name:'Alpha Instinct',max:10,col:'#c8f08a',g:'❦',...PASSIVE(),desc:l=>`+${l*2}% attack speed and with a bow ${l*2}% double attack.`},
  stampede:{name:'Stampede',max:10,col:'#a8c86a',g:'≋',sp:l=>35+l*3,cd:5,kind:'area',range:270,radius:120,
    desc:l=>`The pack runs through the target's area: ${180+l*25}% ATK plus 1% per AGI to all within 120px, slowing them for 2s.`,
    run:(l,x,y)=>{fx.push({k:'ring',x,y,r:120,col:'#a8c86a',t0:now,dur:.4});shakeUntil=Math.max(shakeUntil,now+.2);aoe(x,y,120,m=>{dealPhys(m,1.8+l*.25+S.agi*.01,{sure:true});slowMob(m,2);});}},
  // Dawnknight
  radiantsoul:{name:'Radiant Soul',max:10,col:'#fff6c0',g:'☀',...PASSIVE(),desc:l=>`+${l}% ATK, +${l*2}% healing and take ${l}% less damage.`},
  solarjudgment:{name:'Solar Judgment',max:10,col:'#fff2a0',g:'☼',sp:l=>30+l*3,cd:3,kind:'target',range:60,
    desc:l=>`A sun-struck blow for ${280+l*35}% ATK plus 1% per INT as Holy damage, healing 2% of your max HP.`,
    run:(l,t)=>{fx.push({k:'pillar',x:t.x,y:t.y,t0:now,dur:.5});dealPhys(t,2.8+l*.35+S.int*.01,{el:'holy',sure:true});healP(S.maxhp*.02);}},
  // Starseer
  astralgrace:{name:'Astral Grace',max:10,col:'#cfe8ff',g:'✧',...PASSIVE(),desc:l=>`+${l*4}% healing and +${(l*.5).toFixed(1)} SP regen per second.`},
  constellation:{name:'Constellation',max:10,col:'#9fd8ff',g:'✵',sp:l=>45,cd:45,kind:'self',
    desc:l=>`For 45s: +${l*2}% MATK and take ${l*2}% less damage; heal ${5+l}% of max HP now.`,
    run:l=>{buff('constellation','Constellation',45,{matkpct:l*2,dmgred:l*2});healP(S.maxhp*(5+l)/100);}},
};
Object.assign(SKILLS,BUILD3_SKILLS);
Object.assign(SKILL_REQ,{retribution:{livingfortress:3},execution:{bloodthirst:3},tempest:{stormmind:3},unmaking:{voidpact:3},
  killingshot:{perfectaim:3},stampede:{alphainstinct:3},solarjudgment:{radiantsoul:3},constellation:{astralgrace:3}});
Object.assign(SKILL_ELEM,{tempest:'wind',unmaking:'shadow',solarjudgment:'holy'});
Object.assign(CAST,{tempest:1,killingshot:1});
const BUILD3_OF={aegislord:['livingfortress','retribution'],warbringer:['bloodthirst','execution'],tempestsage:['stormmind','tempest'],voidcaller:['voidpact','unmaking'],
  deadeye:['perfectaim','killingshot'],beastlord:['alphainstinct','stampede'],dawnknight:['radiantsoul','solarjudgment'],starseer:['astralgrace','constellation']};
for(const c in BUILD3_OF)addOwnSkills(c,BUILD3_OF[c]);
PASSIVE_MORE.push((add,L,wt)=>{
  add('dmgred',L('livingfortress'));add('hppct',L('livingfortress')*2);
  add('atkpct',L('bloodthirst')*2);add('critdmg',L('bloodthirst')*3);
  add('matkpct',L('stormmind')*1.5);add('cast',L('stormmind')*2);
  add('sppct',L('voidpact')*3);add('dmgred',L('voidpact'));
  add('crit',L('perfectaim'));add('critdmg',L('perfectaim')*4);
  add('aspd',L('alphainstinct')*2);if(wt==='bow')add('dbl',L('alphainstinct')*2);
  add('atkpct',L('radiantsoul'));add('healpct',L('radiantsoul')*2);add('dmgred',L('radiantsoul'));
  add('healpct',L('astralgrace')*4);add('spregen',L('astralgrace')*.5);});

/* ---- sigils with build stats: each keeps its old bonus and adds one of these ---- */
const SIG_BUILD={
  hopper:{aspd:3},greylupe:{aspd:4},dunejackal:{aspd:5},lupealpha:{aspd:6},cavebat:{dbl:4},bonearcher:{dbl:3},hopperchief:{dbl:5},
  thornling:{critdmg:6},gravehound:{critdmg:8},rimestalker:{critdmg:10},frostmatron:{critdmg:15},
  dewdrop:{cast:4},glowworm:{cast:5},shriekcap:{cast:5},iceimp:{cast:5},frostwisp:{cast:6},gloomking:{cast:8},puffcap:{spregen:1},
  emberimp:{matkpct:4},miragewisp:{matkpct:3},deepshade:{matkpct:3},gloomcap:{matkpct:3},crystalmite:{sppct:5},
  mossbug:{dmgred:2},scarab:{dmgred:3},stonecrab:{dmgred:3},ashgolem:{dmgred:3},glacierbeetle:{dmgred:4},snowhulk:{dmgred:4},scarabqueen:{dmgred:5},rimeheart:{dmgred:6},
  sproutling:{healpct:5},mushcap:{healpct:5},thornmother:{healpct:10},
  cactoid:{atkpct:3},cavetroll:{atkpct:3},dunetyrant:{atkpct:6},warlord:{atkpct:5}};
for(const id in SIG_BUILD){const m=MOBS[id],it=ITEMS[id+'_sig'];if(!m||!m.sig||!it)continue;
  const add=SIG_BUILD[id];m.sig.b={...m.sig.b,...add};it.b=m.sig.b;
  m.sig.txt=m.sig.txt+', '+Object.entries(add).map(([k,v])=>bonusLabel(k,v)).join(', ');
  it.desc=`Socket into ${/^[aeiou]/.test(m.sig.kind)?'an':'a'} ${m.sig.kind}: ${m.sig.txt}.`;}
