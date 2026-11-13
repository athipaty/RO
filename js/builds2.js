"use strict";
/* ================= builds for the advanced callings: a build passive and a stat-scaled attack each =================
   Loaded right after js/jobs.js (the advanced callings exist) and before js/jobs3.js, so master callings inherit them too. */
const BUILD2_SKILLS={
  // Bulwark: VIT wall
  unbreakable:{name:'Unbreakable',max:10,col:'#b8c0cc',g:'▣',...PASSIVE(),desc:l=>`+${l*3}% max HP and +${l*2} DEF.`},
  shieldcharge:{name:'Shield Charge',max:10,col:'#9aa6b8',g:'◘',sp:l=>12+l,cd:2,kind:'target',range:70,
    desc:l=>`Charge in for ${150+l*20}% ATK plus 1% per VIT, ${20+l*3}% chance to stun for 2s.`,
    run:(l,t)=>{fx.push({k:'impact',x:t.x,y:t.y-(t.d?t.d.size*.6:10),t0:now,dur:.25});dealPhys(t,1.5+l*.2+S.vit*.01,{sure:true,ail:['stun',.2+l*.03,2]});}},
  // Ravager: STR/AGI berserker
  bloodlust:{name:'Bloodlust',max:10,col:'#e0503a',g:'♨',...PASSIVE(),desc:l=>`+${l*1.5}% ATK and +${l*1.5}% attack speed.`},
  rampage:{name:'Rampage',max:10,col:'#ff7a4a',g:'✸',sp:l=>18+l*2,cd:4,kind:'self',
    desc:l=>`Tear through every foe within 90px for ${100+l*15}% ATK plus 1% per STR, healing 1% of max HP for each one hit.`,
    run:l=>{fx.push({k:'ring',x:P.x,y:P.y,r:90,col:'#ff7a4a',t0:now,dur:.35});let n=0;aoe(P.x,P.y,90,m=>{dealPhys(m,1+l*.15+S.str*.01,{sure:true});n++;});if(n)healP(S.maxhp*.01*n);}},
  // Stormcaller: INT nuker
  elemmastery:{name:'Elemental Mastery',max:10,col:'#9fd0ff',g:'❖',...PASSIVE(),desc:l=>`+${l*2}% MATK and spells cast ${l}% faster.`},
  chainlightning:{name:'Chain Lightning',max:10,col:'#d8c8ff',g:'ϟ',sp:l=>16+l*2,cd:1.5,kind:'target',range:240,
    desc:l=>`Lightning for ${160+l*25}% MATK plus 1% per INT that jumps to ${1+Math.floor(l/3)} more foes within 120px at 70%.`,
    run:(l,t)=>{const mult=1.6+l*.25+S.int*.01;fx.push({k:'bolt',x:t.x,y:t.y,t0:now,dur:.3});dealMag(t,mult,'wind');
      mobs.filter(m=>m!==t&&!m.dead&&Math.hypot(m.x-t.x,m.y-t.y)<=120).sort((a,b)=>Math.hypot(a.x-t.x,a.y-t.y)-Math.hypot(b.x-t.x,b.y-t.y)).slice(0,1+Math.floor(l/3))
        .forEach((m,i)=>setTimeout(()=>{if(m.dead)return;fx.push({k:'bolt',x:m.x,y:m.y,t0:now,dur:.3});dealMag(m,mult*.7,'wind');},90*(i+1)));}},
  // Hexweaver: curses
  darkpact:{name:'Dark Pact',max:10,col:'#8a6ab0',g:'☾',...PASSIVE(),desc:l=>`+${l*2}% max SP and take ${l}% less damage.`},
  frailty:{name:'Curse of Frailty',max:10,col:'#b07ad0',g:'☠',sp:l=>14,cd:6,kind:'target',range:230,
    desc:l=>`Curse a monster: it takes ${10+l*2}% more damage from you for 8s.`,
    run:(l,t)=>curseFrail(t,(10+l*2)/100,8)},
  // Sharpshooter: DEX
  steadyhands:{name:'Steady Hands',max:10,col:'#e0c070',g:'✋',...PASSIVE(),desc:l=>`+${l} DEX and +${l*1.5}% ATK.`},
  deadlyarrow:{name:'Deadly Arrow',max:10,col:'#ffd27a',g:'➹',sp:l=>15+l*2,cd:2,kind:'target',range:280,
    desc:l=>`A drawn-out shot for ${200+l*30}% ATK plus 1% per DEX that never misses.`,
    run:(l,t)=>shoot(P,t,'arrow','#ffd27a',()=>dealPhys(t,2+l*.3+S.dex*.01,{sure:true}))},
  // Wildstalker: AGI/LUK
  predator:{name:'Predator',max:10,col:'#a8d86a',g:'⚘',...PASSIVE(),desc:l=>`+${l} CRIT and with a bow ${l*2}% double attack.`},
  rapidfire:{name:'Rapid Fire',max:10,col:'#c8f08a',g:'⋙',sp:l=>12+l,cd:1.5,kind:'target',range:260,
    desc:l=>`Loose three quick arrows, each ${60+l*10}% ATK plus 1% per AGI.`,
    run:(l,t)=>{for(let i=0;i<3;i++)setTimeout(()=>{if(P&&!t.dead)shoot(P,t,'arrow','#c8f08a',()=>dealPhys(t,.6+l*.1+S.agi*.01));},i*110);}},
  // Templar: STR/VIT holy melee
  zeal:{name:'Zeal',max:10,col:'#f0d070',g:'☀',...PASSIVE(),desc:l=>`+${l*2}% attack speed and +${l}% ATK.`},
  sacredbulwark:{name:'Sacred Bulwark',max:10,col:'#fff0c0',g:'⛨',sp:l=>30,cd:40,kind:'self',
    desc:l=>`For 60s: take ${l*2}% less damage and +${l*2} DEF.`,
    run:l=>buff('sacredbulwark','Sacred Bulwark',60,{dmgred:l*2,def:l*2})},
  // Oracle: INT healer
  insight:{name:'Divine Insight',max:10,col:'#bfe8ff',g:'✺',...PASSIVE(),desc:l=>`+${l*3}% healing and +${(l*.3).toFixed(1)} SP regen per second.`},
  exorcism:{name:'Exorcism',max:10,col:'#fff6c0',g:'✶',sp:l=>14+l*2,cd:1.2,kind:'target',range:240,
    desc:l=>`Holy fire for ${180+l*30}% MATK plus 1% per INT, double against Shadow monsters.`,
    run:(l,t)=>{fx.push({k:'pillar',x:t.x,y:t.y,t0:now,dur:.45});dealMag(t,1.8+l*.3+S.int*.01,'holy');}},
};
Object.assign(SKILLS,BUILD2_SKILLS);
Object.assign(SKILL_REQ,{shieldcharge:{unbreakable:3},rampage:{bloodlust:3},chainlightning:{elemmastery:3},frailty:{darkpact:3},
  deadlyarrow:{steadyhands:3},rapidfire:{predator:3},sacredbulwark:{zeal:3},exorcism:{insight:3}});
Object.assign(SKILL_ELEM,{chainlightning:'wind',exorcism:'holy'});
Object.assign(CAST,{chainlightning:.6,deadlyarrow:.7,exorcism:.6});
const BUILD2_OF={bulwark:['unbreakable','shieldcharge'],ravager:['bloodlust','rampage'],stormcaller:['elemmastery','chainlightning'],hexweaver:['darkpact','frailty'],
  sharpshooter:['steadyhands','deadlyarrow'],wildstalker:['predator','rapidfire'],templar:['zeal','sacredbulwark'],oracle:['insight','exorcism']};
// give a calling more skills: into its skill list (before First Aid) and its own branch of the tree
function addOwnSkills(cls,ids){const c=CLASSES[cls];if(!c)return;const at=c.skills.indexOf('firstaid');c.skills.splice(at<0?c.skills.length:at,0,...ids.filter(s=>!c.skills.includes(s)));
  if(Array.isArray(c.own))for(const s of ids)if(!c.own.includes(s))c.own.push(s);}
for(const c in BUILD2_OF)addOwnSkills(c,BUILD2_OF[c]);
PASSIVE_MORE.push((add,L,wt)=>{
  add('hppct',L('unbreakable')*3);add('def',L('unbreakable')*2);
  add('atkpct',L('bloodlust')*1.5);add('aspd',L('bloodlust')*1.5);
  add('matkpct',L('elemmastery')*2);add('cast',L('elemmastery'));
  add('sppct',L('darkpact')*2);add('dmgred',L('darkpact'));
  add('dex',L('steadyhands'));add('atkpct',L('steadyhands')*1.5);
  add('crit',L('predator'));if(wt==='bow')add('dbl',L('predator')*2);
  add('aspd',L('zeal')*2);add('atkpct',L('zeal'));
  add('healpct',L('insight')*3);add('spregen',L('insight')*.3);});

// curses: a cursed monster takes more damage from your hits until it wears off (only your own hits, worked out here)
function curseFrail(m,pct,secs){if(!m||m.dead)return;m.frail=Math.max(m.frailUntil>now?m.frail||0:0,pct);m.frailUntil=now+secs;
  fx.push({k:'ring',x:m.x,y:m.y,r:(m.d?m.d.size:14)+10,col:'#b07ad0',t0:now,dur:.4});floatT(m.x,m.y-(m.d?m.d.size:16)-30,'Cursed!','#c58cff',12);}
{const _hmFrail=hurtMob;hurtMob=function(m,dmg,crit,kind){if(m&&m.frailUntil>now&&m.frail&&dmg>0)dmg=Math.round(dmg*(1+m.frail));return _hmFrail.call(this,m,dmg,crit,kind);};}
