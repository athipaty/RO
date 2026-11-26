"use strict";
/* ================= the Forgehand: the sixth first job (v1.71.0, replaces the Gunslinger) =================
   An axe fighter who works the forge: hard chops, a wide swing, an anvil dropped on a crowd, a blade tempered with
   forge fire, and a strong back. It grows into the Runesmith (the forge path: fire runes) or the Coinbreaker (the trade
   path: gold turned into blows), then the Forgemaster or the Goldlord (js/forgehand2.js, js/forgehand3.js). A Novice
   earns it through its story with Forgemistress Hilde. Guns became axes and Gunslinger heroes moved over
   (js/forgemig.js). Attack comes from STR like any melee weapon. Loaded after js/shade.js and before js/jobs.js. */

// ---- a starter axe in the General Store ----
Object.assign(ITEMS,{handaxe:{name:'Hand Axe',type:'weapon',wt:'axe',atk:30,price:550,lv:1,slots:1,col:'#b8a088',g:'W'}});
{const i=SHOP.indexOf('sword');SHOP.splice(i<0?SHOP.length:i+1,0,'handaxe');}

// ---- the job ----
CLASSES.forgehand={name:'Forgehand',hp:1.35,sp:.95,aspd:1.0,weapons:['club','axe'],col:'#a8602a',hair:'#4a2a1a',gift:'handaxe',
  skills:['hew','widechop','anvildrop','forgefire','axemastery','ironback','luckycoin','firstaid'],
  desc:'An axe fighter who works the forge. Hard chops, a wide swing, an anvil dropped on a crowd, a blade tempered in forge fire.'};
if(typeof JOB_FIRST!=='undefined'&&!JOB_FIRST.includes('forgehand'))JOB_FIRST.push('forgehand');
const isAxe=()=>!!(P&&P.eq&&P.eq.weapon&&ITEMS[P.eq.weapon.id]&&ITEMS[P.eq.weapon.id].wt==='axe');
const fhNear=(x,y,r)=>{const a=mobs.filter(m=>!m.dead&&Math.hypot(m.x-x,m.y-y)<=r+m.d.size);return typeof pvpNear==='function'?a.concat(pvpNear(x,y,r)):a;};

// ---- its skills ----
const FH_SK={
  hew:{name:'Hew',max:10,col:'#e8a060',g:'⚒',sp:l=>6+l,cd:.9,kind:'target',range:60,
    desc:l=>`A hard chop for ${170+l*20}% ATK, with ${l*2}% more critical chance.`,
    run:(l,t)=>dealPhys(t,1.7+l*.2,{critPlus:l*2})},
  widechop:{name:'Wide Chop',max:10,col:'#d8b080',g:'⟳',sp:l=>12+l,cd:3,kind:'self',
    desc:l=>`A wide swing: ${110+l*15}% ATK to every monster within 80px of you.`,
    run:l=>{fx.push({k:'ring',x:P.x,y:P.y,r:80,col:'#e8c090',t0:now,dur:.35});for(const m of fhNear(P.x,P.y,80))dealPhys(m,1.1+l*.15);}},
  anvildrop:{name:'Anvil Drop',max:10,col:'#9aa0aa',g:'⊥',sp:l=>16+l*2,cd:5,kind:'area',range:200,radius:90,
    desc:l=>`An anvil falls on the spot: ${150+l*20}% ATK to all within 90px, and a ${20+l*4}% chance to stun each for 1.5s.`,
    run:(l,x,y)=>setTimeout(()=>{if(!P||P.dead)return;shakeUntil=now+.15;fx.push({k:'ring',x,y,r:90,col:'#c8ccd4',t0:now,dur:.4});
      for(const m of fhNear(x,y,90)){dealPhys(m,1.5+l*.2,{sure:true});if(!m.dead&&Math.random()*100<20+l*4&&typeof ailMob==='function')ailMob(m,'stun',1.5);}},250)},
  forgefire:{name:'Forge Fire',max:10,col:'#ff8a3a',g:'♨',sp:l=>20,cd:30,kind:'self',
    desc:l=>`Heat the blade in forge fire. For 40s: +${l*3}% ATK and +${l*2} HIT.`,run:l=>buff('forgefire','Forge Fire',40,{atkpct:l*3,hit:l*2})},
  axemastery:{name:'Axe Mastery',max:10,col:'#c8a070',g:'⚔',...PASSIVE(),desc:l=>`With an axe: +${l*3} ATK and +${l*2} HIT.`},
  ironback:{name:'Iron Back',max:10,col:'#a8a0a0',g:'▣',...PASSIVE(),desc:l=>`Years at the anvil: +${l*3} DEF and +${l*30} Max HP.`},
  luckycoin:{name:'Lucky Coin',max:10,col:'#e8c860',g:'¤',...PASSIVE(),desc:l=>`A coin in the boot: +${l} CRIT and +${l*2} FLEE.`}};
Object.assign(SKILLS,FH_SK);
Object.assign(SKILL_REQ,{widechop:{hew:3},forgefire:{hew:3},anvildrop:{forgefire:3},luckycoin:{widechop:3}});
{const _pbF=passiveB;passiveB=function(){const b=_pbF.apply(this,arguments);if(!P||!P.skills)return b;const L=id=>P.skills[id]||0,add=(k,v)=>{if(v)b[k]=(b[k]||0)+v;};
  if(isAxe()){add('atk',L('axemastery')*3);add('hit',L('axemastery')*2);}
  add('def',L('ironback')*3);add('maxhp',L('ironback')*30);add('crit',L('luckycoin'));add('flee',L('luckycoin')*2);
  return b;};}

// ---- how it looks and moves ----
if(typeof HERO2_DRESS!=='undefined')HERO2_DRESS.forgehand={pant:'#4a3a2e',boot:'#5a3a22',trim:'#e8a060',belt:'#6a4426'};
if(typeof STANCES!=='undefined')STANCES.forgehand=t=>({lean:.04,sway:Math.sin(t*1.3)*.3,lift:0,stance:2,hands:[[10,-4+Math.sin(t*2)*.3],[-8,-3]]});
if(typeof HIT_STYLE!=='undefined'&&typeof hitKeys==='function')HIT_STYLE.forgehand=p=>hitKeys(p,[[0,R0],[.3,{push:-2,lean:-.08,ang:-1.1,lift:1,reach:2}],[.5,{push:6,lean:.14,ang:2.2,lift:0,reach:7},'o'],[.75,{push:2,ang:1.8,reach:5}],[1,R0]]);
if(typeof HIT_FX!=='undefined')HIT_FX.forgehand=[.5,'ring','#ffb070',12,-6];
if(typeof WALK_GAIT!=='undefined')WALK_GAIT.forgehand={rate:.95,leg:1.05,bob:1.1,arm:.8,roll:.06,lean:.02,lift:0};
if(typeof SIT_POSE!=='undefined')SIT_POSE.forgehand={legs:'wide',hands:[[8,3],[-8,3]],hip:5,lean:.06};
if(typeof CAST_COL!=='undefined')CAST_COL.forgehand='#ffb070';
if(typeof TH!=='undefined')Object.assign(TH,{'Forgehand':'ฟอร์จแฮนด์','Hand Axe':'ขวานมือ','Forge Fire':'ไฟเตาหลอม',
  'An axe fighter who works the forge. Hard chops, a wide swing, an anvil dropped on a crowd, a blade tempered in forge fire.':'นักสู้ถือขวานผู้ทำงานกับเตาหลอม ฟันหนัก เหวี่ยงกว้าง ทุ่มทั่งใส่ฝูงศัตรู และคมขวานที่ชุบด้วยไฟเตาหลอม'});
