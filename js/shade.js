"use strict";
/* ================= the Shade: the fifth first job =================
   Quick and hard to hit: the fastest attacks, critical hits, dodging and poison, with a dagger in the hand and a
   second one on the hip. A Novice earns it through its story with Guildmaster Corvin (js/jobstory.js), like the
   other four. Its advanced callings (Nightblade, Venomancer, Phantom) are in js/shade2.js.
   Loaded after js/builds.js (PASSIVE, passiveB, wieldType) and before js/jobs.js; the drawing tables of the other
   families (outfit, stance, attack, walk, sitting, weapon art) are filled in here too. */

// ---- the dagger: a new weapon type ----
Object.assign(ITEMS,{
  dagger:{name:'Iron Dagger',type:'weapon',wt:'dagger',atk:24,price:500,lv:1,slots:1,col:'#b8b0d0',g:'W'},
  nightfang:{name:'Nightfang',type:'weapon',wt:'dagger',atk:66,price:3400,lv:25,slots:1,col:'#b8b0d0',g:'W'}});
WEAPON_W.dagger=30;
{const i=SHOP.indexOf('mace');SHOP.splice(i<0?SHOP.length:i+1,0,'dagger');const j=SHOP.indexOf('sunmace');SHOP.splice(j<0?SHOP.length:j+1,0,'nightfang');}

// ---- the job ----
CLASSES.shade={name:'Shade',hp:1.05,sp:1,aspd:.72,weapons:['club','dagger'],col:'#5a4e78',hair:'#2b2633',gift:'dagger',
  skills:['twinfang','backstab','smokestep','venomedge','shadowsense','nimblehands','firstaid'],
  desc:'Quick and hard to hit. The fastest attacks, critical hits, dodging and poison, with a dagger.'};

// ---- its skills ----
const SHADE_SK={
  twinfang:{name:'Twin Fang',max:10,col:'#c8b8ff',g:'⟡',sp:l=>6+l,cd:.8,kind:'target',range:55,
    desc:l=>`Two quick stabs, each for ${70+l*12}% ATK, with ${10+l*3}% more critical chance.`,
    run:(l,t)=>{const o={critPlus:10+l*3};dealPhys(t,.7+l*.12,o);setTimeout(()=>{if(t&&!t.dead&&mobs.includes(t))dealPhys(t,.7+l*.12,o);},140);}},
  backstab:{name:'Backstab',max:10,col:'#9a8ad8',g:'↯',sp:l=>10+l,cd:2,kind:'target',range:55,
    desc:l=>`Slip behind the target and strike for ${150+l*25}% ATK plus 1% per AGI. Never misses.`,
    run:(l,t)=>dealPhys(t,1.5+l*.25+S.agi*.01,{sure:true})},
  smokestep:{name:'Smoke Step',max:10,col:'#a8a0b8',g:'≋',sp:l=>15,cd:12,kind:'self',
    desc:l=>`Vanish in smoke: for ${(4+l*.3).toFixed(1)}s, +${20+l*6} FLEE and +${l} CRIT.`,
    run:l=>buff('smokestep','Smoke Step',+(4+l*.3).toFixed(1),{flee:20+l*6,crit:l})},
  venomedge:{name:'Venom Edge',max:10,col:'#8fd36a',g:'☠',sp:l=>10+l,cd:3,kind:'target',range:55,
    desc:l=>`A poisoned cut for ${110+l*15}% ATK (Earth), then the poison deals ${25+l*4}% ATK three more times, once a second.`,
    run:(l,t)=>{dealPhys(t,1.1+l*.15,{sure:true,el:'earth'});
      for(let k=1;k<=3;k++)setTimeout(()=>{if(!t||t.dead||!mobs.includes(t)||!P||P.dead)return;dealPhys(t,.25+l*.04,{sure:true,el:'earth'});
        fx.push({k:'ring',x:t.x,y:t.y,r:18,col:'#8fd36a',t0:now,dur:.35});},k*1000);}},
  shadowsense:{name:'Shadow Sense',max:10,col:'#b8a8e8',g:'◐',...PASSIVE(),desc:l=>`+${l} CRIT and +${l*2} FLEE.`},
  nimblehands:{name:'Nimble Hands',max:10,col:'#d8c8ff',g:'✥',...PASSIVE(),desc:l=>`With a dagger: +${l*2}% attack speed and ${l*2}% chance to strike twice.`}};
Object.assign(SKILLS,SHADE_SK);
Object.assign(SKILL_REQ,{backstab:{twinfang:3},smokestep:{twinfang:1},venomedge:{twinfang:3},nimblehands:{shadowsense:3}});
{const _pbS=passiveB;passiveB=function(){const b=_pbS.apply(this,arguments);if(!P||!P.skills)return b;const L=id=>P.skills[id]||0,add=(k,v)=>{if(v)b[k]=(b[k]||0)+v;};
  add('crit',L('shadowsense'));add('flee',L('shadowsense')*2);
  if(wieldType()==='dagger'){add('aspd',L('nimblehands')*2);add('dbl',L('nimblehands')*2);}
  return b;};}

// ---- how it looks and moves (the other families' tables are in hero2.js, stance.js, hitstyle.js, sitpose.js) ----
// outfit colours for the new art; the vest, scarf and hip dagger are drawn in hero2.js
if(typeof HERO2_DRESS!=='undefined')HERO2_DRESS.shade={pant:'#3a3448',boot:'#2e2a38',trim:'#9a8ad8',belt:'#4a3a2a'};
// start screen: a low, ready crouch, the weapon hand forward
if(typeof STANCES!=='undefined')STANCES.shade=t=>({lean:.1,sway:Math.sin(t*1.6)*.4,lift:0,stance:2.2,hands:[[10.5,-6+Math.sin(t*2)*.4],[-6,-8]]});
// attack: two fast jabs
if(typeof HIT_STYLE!=='undefined')HIT_STYLE.shade=p=>hitKeys(p,[[0,R0],[.12,{push:-2,lean:-.05,ang:1.4,lift:.2}],[.26,{push:9,lean:.16,ang:1.55,reach:7},'o'],[.38,{push:2,ang:1.4,lift:.2,reach:1}],[.52,{push:11,lean:.2,ang:1.6,reach:8},'o'],[1,R0]]);
if(typeof HIT_FX!=='undefined')HIT_FX.shade=[.52,'ring','#b8a8e8',10,-12];
// walk: light, quick and low, like sneaking
if(typeof WALK_GAIT!=='undefined')WALK_GAIT.shade={rate:1.3,leg:.85,bob:.5,arm:.7,roll:0,lean:.1,lift:0};
// sitting: one knee up, an arm resting on it
if(typeof SIT_POSE!=='undefined')SIT_POSE.shade={legs:'knees',hands:[[7,-3],[-3,1]],hip:5,lean:.06};
// the dagger itself: a short, slim blade with a small guard
function waDagger(o){waGrip(4,-1,2.3,o.grip||'#2e2a38',o.wrap||'#9a8ad8',o.pom||'#9a8ad8');
  ctx.beginPath();ctx.roundRect(-4,-2.6,8,1.9,.9);waFS(o.gcol||'#7a7090');
  const L=o.len||13;ctx.beginPath();ctx.moveTo(-1.7,-2.6);ctx.lineTo(-1.9,-2.6-L*.7);ctx.quadraticCurveTo(-1,-2.6-L*.95,0,-2.6-L);ctx.quadraticCurveTo(1.4,-2.6-L*.8,1.8,-2.6-L*.6);ctx.lineTo(1.7,-2.6);ctx.closePath();waFS(o.blade||'#d6d8e4');
  ctx.strokeStyle='rgba(255,255,255,.8)';ctx.lineWidth=.6;ctx.beginPath();ctx.moveTo(-1,-3.4);ctx.lineTo(-1.2,-2.6-L*.72);ctx.stroke();
  if(o.glow)waGlow(0,-2.6-L*.5,7,o.glow,.45);}
if(typeof WA!=='undefined'){WA.dagger=()=>waDagger({});WA.nightfang=()=>waDagger({len:15,blade:'#c8c0f0',gcol:'#3a3050',grip:'#1e1a28',wrap:'#c8b8ff',pom:'#c8b8ff',glow:'#b8a0ff'});}
if(typeof WA_BY_TYPE!=='undefined')WA_BY_TYPE.dagger='dagger';
if(typeof TH!=='undefined')Object.assign(TH,{'Quick and hard to hit. The fastest attacks, critical hits, dodging and poison, with a dagger.':'ว่องไวและโจมตีโดนยาก โจมตีเร็วที่สุด คริติคอล หลบหลีก และพิษ ด้วยมีดสั้น',
  'Shadow Flurry':'พายุเงา'});
