"use strict";
/* ================= builds: more skills per calling, so two heroes of the same job can play very differently =================
   Every first job gets six (Warden) or five more skills: passives that shape a build and actives that grow with one stat.
   Advanced and master callings inherit them (this file loads before js/jobs.js builds those). There are far more skill
   levels than a job earns points (49 by job level 50), so every hero has to choose a path, e.g.
     Warden    STR two-hander (Blade Mastery, Sundering Blow) · AGI crit duelist (Duelist's Rhythm, Lethal Edge) · VIT wall (Stoneblood, Second Wind)
     Arcanist  INT nuker (Arcane Focus) · DEX quick-caster (Swift Casting, Mind Spike) · INT/VIT battle mage (Mana Flow, Mana Shield)
     Ranger    DEX archer (Owl's Eye, Double Nock) · LUK crit sniper (Hunter's Luck, Aimed Shot) · AGI skirmisher (Fleet Step)
     Cleric    STR/INT battle priest (Mace Mastery, Holy Strike) · VIT guardian (Divine Guard) · INT healer (Faith, Renew)
   Build stats used here and on gear (js/buildgear.js), summed in computeStats (js/world.js):
     aspd % faster attacks · cast % faster casting · critdmg % extra critical damage · dbl % double attack
     dmgred % less damage taken · healpct % stronger healing · atkpct / matkpct / sppct % · spregen SP per second */
const wieldType=()=>P&&P.eq&&P.eq.weapon&&ITEMS[P.eq.weapon.id]?ITEMS[P.eq.weapon.id].wt:null;
const PASSIVE=()=>({kind:'passive',sp:()=>0,cd:0});
const BUILD_SKILLS={
  // ---- Warden
  bladecraft:{name:'Blade Mastery',max:10,col:'#d88a6a',g:'⚔',...PASSIVE(),desc:l=>`With a sword or axe: +${l*3} ATK and +${l} HIT.`},
  duelist:{name:"Duelist's Rhythm",max:10,col:'#f0c060',g:'≫',...PASSIVE(),desc:l=>`+${l*2.5}% attack speed and +${(l*.8).toFixed(1)} CRIT.`},
  lethaledge:{name:'Lethal Edge',max:10,col:'#ffd27a',g:'✧',sp:l=>8+l,cd:1,kind:'target',range:55,
    desc:l=>`A swift strike for ${100+l*20}% ATK plus 1% per AGI that never misses, with ${l*6}% more critical chance.`,
    run:(l,t)=>{fx.push({k:'slash',x:t.x,y:t.y,t0:now,dur:.2});fx.push({k:'slash',x:t.x+6,y:t.y-4,t0:now+.06,dur:.2});dealPhys(t,1+l*.2+S.agi*.01,{sure:true,critPlus:l*6});}},
  stoneblood:{name:'Stoneblood',max:10,col:'#a89a88',g:'◆',...PASSIVE(),desc:l=>`+${l*2}% max HP, +${l} DEF and +${l} HP regen per second.`},
  secondwind:{name:'Second Wind',max:10,col:'#8fe0a8',g:'❋',sp:l=>15+l,cd:15,kind:'self',
    desc:l=>`Heal ${4+l}% of max HP plus ${l*2} per VIT, and +${l*3} DEF for 10s.`,
    run:l=>{healP(S.maxhp*(4+l)/100+S.vit*l*2);buff('secondwind','Second Wind',10,{def:l*3});}},
  sunder:{name:'Sundering Blow',max:10,col:'#e0603a',g:'⚒',sp:l=>14+l*2,cd:3,kind:'target',range:55,
    desc:l=>`Bring the weapon down for ${200+l*35}% ATK plus 1% per STR that never misses. Axes hit 25% harder.`,
    run:(l,t)=>{fx.push({k:'impact',x:t.x,y:t.y-(t.d?t.d.size*.6:10),t0:now,dur:.3});fx.push({k:'ring',x:t.x,y:t.y,r:40,col:'#e0a060',t0:now,dur:.3});
      shakeUntil=Math.max(shakeUntil,now+.15);dealPhys(t,(2+l*.35+S.str*.01)*(wieldType()==='axe'?1.25:1),{sure:true});}},
  // ---- Arcanist
  manaflow:{name:'Mana Flow',max:10,col:'#6a9ae0',g:'≈',...PASSIVE(),desc:l=>`+${l*3}% max SP and +${(l*.3).toFixed(1)} SP regen per second.`},
  swiftcast:{name:'Swift Casting',max:10,col:'#b0d8ff',g:'»',...PASSIVE(),desc:l=>`Spells cast ${l*3}% faster.`},
  arcanefocus:{name:'Arcane Focus',max:10,col:'#a080f0',g:'◉',...PASSIVE(),desc:l=>`+${l*2}% MATK.`},
  manashield:{name:'Mana Shield',max:10,col:'#7fb8ff',g:'◍',sp:l=>30,cd:30,kind:'self',
    desc:l=>`For 120s: ${l*6}% of the damage you take is paid with SP instead of HP.`,
    run:l=>buff('manashield','Mana Shield',120,{msh:l*6})},
  mindspike:{name:'Mind Spike',max:10,col:'#e0b0ff',g:'↯',sp:l=>4+l,cd:.5,kind:'target',range:220,
    desc:l=>`An instant bolt of force for ${80+l*15}% MATK plus 1% per DEX.`,
    run:(l,t)=>shoot(P,t,'orb','#e0b0ff',()=>dealMag(t,.8+l*.15+S.dex*.01))},
  // ---- Ranger
  owleye:{name:"Owl's Eye",max:10,col:'#c8b070',g:'◎',...PASSIVE(),desc:l=>`With a bow: +${l*2} ATK and +${l*2} HIT.`},
  doublenock:{name:'Double Nock',max:10,col:'#d8e8a0',g:'⇉',...PASSIVE(),desc:l=>`With a bow: ${l*3}% chance that a normal attack fires a second arrow.`},
  huntersluck:{name:"Hunter's Luck",max:10,col:'#9fe08a',g:'♣',...PASSIVE(),desc:l=>`+${l} CRIT and +${l*4}% critical damage.`},
  aimedshot:{name:'Aimed Shot',max:10,col:'#ffe08a',g:'⌖',sp:l=>10+l,cd:1.5,kind:'target',range:260,
    desc:l=>`A careful shot for ${150+l*25}% ATK plus 1% per LUK that never misses, with ${l*5}% more critical chance.`,
    run:(l,t)=>shoot(P,t,'arrow','#ffe08a',()=>dealPhys(t,1.5+l*.25+S.luk*.01,{sure:true,critPlus:l*5}))},
  fleetstep:{name:'Fleet Step',max:10,col:'#8fd8c0',g:'➶',...PASSIVE(),desc:l=>`+${l*2} FLEE and +${l*2}% attack speed.`},
  // ---- Cleric
  macemastery:{name:'Mace Mastery',max:10,col:'#d8b84f',g:'♆',...PASSIVE(),desc:l=>`With a mace or club: +${l*3} ATK and +${l} HIT.`},
  holystrike:{name:'Holy Strike',max:10,col:'#fff0a0',g:'✚',sp:l=>8+l,cd:1,kind:'target',range:60,
    desc:l=>`A blessed blow for ${130+l*25}% ATK plus 1% per INT as Holy damage.`,
    run:(l,t)=>{fx.push({k:'pillar',x:t.x,y:t.y,t0:now,dur:.3});dealPhys(t,1.3+l*.25+S.int*.01,{el:'holy'});}},
  faith:{name:'Faith',max:10,col:'#f0e0a0',g:'☼',...PASSIVE(),desc:l=>`+${l*2}% max HP and +${l*3}% healing.`},
  renew:{name:'Renew',max:10,col:'#9ff0b0',g:'❀',sp:l=>18+l*2,cd:10,kind:'self',
    desc:l=>`For 30s: regain ${3+l*2} HP plus ${l*3}% of MATK every second.`,
    run:l=>buff('renew','Renew',30,{regen:Math.round(3+l*2+S.matk*l*.03)})},
  divineguard:{name:'Divine Guard',max:10,col:'#e8e0c8',g:'⛨',...PASSIVE(),desc:l=>`Take ${l*1.5}% less damage and +${l} DEF.`},
};
Object.assign(SKILLS,BUILD_SKILLS);
Object.assign(SKILL_REQ,{duelist:{bladecraft:3},lethaledge:{duelist:3},secondwind:{stoneblood:3},sunder:{bladecraft:5,cleave:3},
  swiftcast:{manaflow:3},arcanefocus:{emberbolt:3},manashield:{manaflow:5},mindspike:{swiftcast:3},
  doublenock:{owleye:3},aimedshot:{huntersluck:3,owleye:3},
  holystrike:{macemastery:3},renew:{faith:3,mend:3},divineguard:{faith:5}});
SKILL_ELEM.holystrike='holy';
CAST.aimedshot=.5;
const BUILD_OF={warden:['bladecraft','duelist','lethaledge','sunder','stoneblood','secondwind'],
  arcanist:['arcanefocus','manaflow','swiftcast','mindspike','manashield'],
  ranger:['owleye','doublenock','huntersluck','aimedshot','fleetstep'],
  cleric:['macemastery','holystrike','faith','renew','divineguard']};
for(const c in BUILD_OF){const list=CLASSES[c].skills,at=list.indexOf('firstaid');list.splice(at<0?list.length:at,0,...BUILD_OF[c]);}

// passive skills as one bonus object (added in computeStats)
function passiveB(){const b={};if(!P||!P.skills)return b;const L=id=>P.skills[id]||0,wt=wieldType(),add=(k,v)=>{if(v)b[k]=(b[k]||0)+v;};
  if(wt==='sword'||wt==='axe'){add('atk',L('bladecraft')*3);add('hit',L('bladecraft'));}
  add('aspd',L('duelist')*2.5);add('crit',L('duelist')*.8);
  add('hppct',L('stoneblood')*2);add('def',L('stoneblood'));add('regen',L('stoneblood'));
  add('sppct',L('manaflow')*3);add('spregen',L('manaflow')*.3);add('cast',L('swiftcast')*3);add('matkpct',L('arcanefocus')*2);
  if(wt==='bow'){add('atk',L('owleye')*2);add('hit',L('owleye')*2);add('dbl',L('doublenock')*3);}
  add('crit',L('huntersluck'));add('critdmg',L('huntersluck')*4);add('flee',L('fleetstep')*2);add('aspd',L('fleetstep')*2);
  if(wt==='mace'||wt==='club'){add('atk',L('macemastery')*3);add('hit',L('macemastery'));}
  add('hppct',L('faith')*2);add('healpct',L('faith')*3);add('dmgred',L('divineguard')*1.5);add('def',L('divineguard'));
  for(const f of PASSIVE_MORE)f(add,L,wt); // advanced and master callings (js/builds2.js, js/builds3.js)
  return b;}
const PASSIVE_MORE=[];

// Mana Shield: part of each hit comes out of SP (called from hurtPlayer)
function manaShield(dmg){const b=P&&P.buffs&&P.buffs.manashield;if(!b||!(b.until>now)||!b.b||!b.b.msh)return dmg;
  const take=Math.min(Math.round(dmg*b.b.msh/100),Math.floor(P.sp));if(take<=0)return dmg;P.sp-=take;
  floatT(P.x+14,P.y-44,'−'+fmt(take)+' SP','#7fb8ff',11);return Math.max(1,dmg-take);}

// double attack (Double Nock, gear with dbl): a second hit right after a normal attack; spellcasters' bolts do not double
{const _baDbl=basicAttack;basicAttack=function(t){const r=_baDbl.apply(this,arguments);
  if(S&&S.dbl&&t&&!CLASSES[P.cls].magic&&Math.random()*100<S.dbl){const ranged=S.range>100;
    setTimeout(()=>{if(!P||P.dead||!t||t.dead)return;floatT(t.x-14,t.y-(t.d?t.d.size:16)-20,'Double!','#d8e8a0',11);
      if(ranged)shoot(P,t,'arrow','#d8e8a0',()=>dealPhys(t,1));else dealPhys(t,1);},ranged?240:190);}
  return r;};}
