"use strict";
/* ================= the Gunslinger's advanced callings (v1.43.0) =================
     Gunslinger -> Sniper       (Marksman path)  one devastating long-range shot at a time, and further than anyone
     Gunslinger -> Pyro Gunner  (both paths)     fire rounds, napalm shells and powder kegs for whole packs
     Gunslinger -> Trickshot    (Gunner path)    ricochets, a storm of bullets, and too quick to be hit
   Five skills each, like the other advanced callings (js/shade2.js). Corvin's trial for a Job Lv 40 Gunslinger:
   25 Rimestalkers in Frostpeak Pass and 10 Fangs. Their looks, effects and finishers are at the bottom of this file;
   Thai skill texts in js/i18n-game.js. Loaded after js/gunslinger2.js. */
// a bullet from anywhere (a ricochet starts at the last monster it hit), drawn as a gun tracer
function gs3Shot(from,to,col,onHit){shoot(from,to,'arrow',col||'#fff2b0',onHit);const s=shots[shots.length-1];if(s&&s.to===to){s.spd=1150;s.gun=1;s.draw=gunTracer;}}
const gs3Live=t=>t&&!t.dead&&mobs.includes(t);
// Hot Loads makes every burning shot stronger
const gs3Hot=()=>1+((P&&P.skills&&P.skills.hotloads)||0)*.05;
function gs3Burn(t,mult,n){for(let k=1;k<=n;k++)setTimeout(()=>{if(!gs3Live(t)||!P||P.dead)return;
  dealPhys(t,mult*gs3Hot(),{sure:true,el:'fire'});fx.push({k:'ring',x:t.x,y:t.y,r:18,col:'#ff7a2a',t0:now,dur:.35});},k*1000);}
const GS3_SKILLS={
  // ---- Sniper
  killshot:{name:'Kill Shot',max:10,col:'#f0e6c0',g:'⌖',sp:l=>16+l*2,cd:1.6,kind:'target',range:320,
    desc:l=>`A shot meant to end it, for ${260+l*40}% ATK with ${30+l*3}% more critical chance. Never misses.`,
    run:(l,t)=>gs3Shot(P,t,'#fffbe0',()=>dealPhys(t,2.6+l*.4,{sure:true,critPlus:30+l*3}))},
  railshot:{name:'Rail Shot',max:10,col:'#c8e0ff',g:'⇶',sp:l=>22+l*2,cd:3.5,kind:'target',range:300,
    desc:l=>`A round that tears straight through: ${200+l*30}% ATK to the target and to every monster in a line up to 300px behind it.`,
    run:(l,t)=>{const dx=t.x-P.x,dy=t.y-P.y,d=Math.hypot(dx,dy)||1,ux=dx/d,uy=dy/d,len=d+300,x0=P.x,y0=P.y;
      fx.push({k:'streak',x0,y0,x:x0+ux*len,y:y0+uy*len,col:'#c8e0ff',w:6,t0:now,dur:.3});
      for(const m of mobs){if(m.dead)continue;const ax=m.x-x0,ay=m.y-y0,along=ax*ux+ay*uy,perp=Math.abs(ax*uy-ay*ux);
        if(along>0&&along<=len&&perp<=m.d.size+14)setTimeout(()=>{if(gs3Live(m))dealPhys(m,2+l*.3,{sure:true});},along/1150*1000);}}},
  pinningshot:{name:'Pinning Shot',max:10,col:'#d8c8a0',g:'⊣',sp:l=>12+l,cd:2.5,kind:'target',range:280,
    desc:l=>`${150+l*20}% ATK, and the monster is pinned (slowed) for ${2+Math.floor(l/3)}s.`,
    run:(l,t)=>gs3Shot(P,t,'#f0e0b0',()=>{dealPhys(t,1.5+l*.2,{sure:true});if(gs3Live(t))slowMob(t,2+Math.floor(l/3));})},
  eaglesight:{name:'Eagle Sight',max:10,col:'#e8d8a8',g:'◎',...PASSIVE(),desc:l=>`With a gun: +${l*12}px range and +${l*3}% critical damage.`},
  holdbreath:{name:'Hold Breath',max:10,col:'#f8f0d0',g:'◌',sp:l=>30,cd:30,kind:'self',
    desc:l=>`For 40s: +${l*4}% ATK and +${l*2} CRIT.`,run:l=>buff('holdbreath','Hold Breath',40,{atkpct:l*4,crit:l*2})},
  // ---- Pyro Gunner
  incendiary:{name:'Incendiary Round',max:10,col:'#ff7a2a',g:'✺',sp:l=>14+l*2,cd:1.4,kind:'target',range:240,
    desc:l=>`A round that bursts into flame: ${160+l*25}% ATK (Fire) to the target, then ${90+l*14}% ATK (Fire) to everything within 80px of it.`,
    run:(l,t)=>gs3Shot(P,t,'#ff9a4a',()=>{const x=t.x,y=t.y;dealPhys(t,(1.6+l*.25)*gs3Hot(),{sure:true,el:'fire'});
      aoe(x,y,80,m=>{if(m!==t)dealPhys(m,(.9+l*.14)*gs3Hot(),{sure:true,el:'fire'});});})},
  napalm:{name:'Napalm Shell',max:10,col:'#ff5a1a',g:'☄',sp:l=>26+l*3,cd:5,kind:'area',range:240,radius:100,
    desc:l=>`A shell of sticky fire on the spot: ${55+l*10}% ATK (Fire) to all within 100px every second for 4s.`,
    run:(l,x,y)=>{for(let k=0;k<4;k++)setTimeout(()=>{if(!P||P.dead)return;fx.push({k:'ring',x,y,r:100,col:'#ff6a2a',t0:now,dur:.5});
      aoe(x,y,100,m=>dealPhys(m,(.55+l*.1)*gs3Hot(),{sure:true,el:'fire'}));},k*1000);}},
  powderkeg:{name:'Powder Keg',max:10,col:'#ffb04a',g:'✹',sp:l=>28+l*3,cd:6,kind:'self',
    desc:l=>`Drop a keg and blow it: ${220+l*30}% ATK (Fire) to every monster within 110px of you.`,
    run:l=>aoe(P.x,P.y,110,m=>dealPhys(m,(2.2+l*.3)*gs3Hot(),{sure:true,el:'fire'}))},
  hotloads:{name:'Hot Loads',max:10,col:'#ffc890',g:'♨',...PASSIVE(),desc:l=>`With a gun: +${l*2}% ATK, and your burning shots deal ${l*5}% more damage.`},
  blazingbarrels:{name:'Blazing Barrels',max:10,col:'#ff8a3a',g:'⫸',sp:l=>30,cd:30,kind:'self',
    desc:l=>`For 45s your normal shots also burst for ${30+l*5}% ATK (Fire) on the target.`,
    run:l=>buff('blazingbarrels','Blazing Barrels',45,{atk:0})},
  // ---- Trickshot
  ricochet:{name:'Ricochet',max:10,col:'#7ad8ff',g:'↯',sp:l=>12+l*2,cd:1.4,kind:'target',range:240,
    desc:l=>`A shot that bounces to up to ${1+Math.floor(l/3)} more monsters near the target, ${130+l*18}% ATK to each.`,
    run:(l,t)=>{const hit=new Set(),mult=1.3+l*.18;let left=1+Math.floor(l/3);
      const hop=(from,to)=>gs3Shot(from,to,'#bfeeff',()=>{hit.add(to);if(gs3Live(to))dealPhys(to,mult,{sure:true});if(left--<=0)return;
        let nx=null,bd=150;for(const m of mobs){if(m.dead||hit.has(m))continue;const d=Math.hypot(m.x-to.x,m.y-to.y);if(d<bd){bd=d;nx=m;}}
        if(nx)setTimeout(()=>{if(gs3Live(nx))hop({x:to.x,y:to.y},nx);},60);});
      hop(P,t);}},
  bulletstorm:{name:'Bullet Storm',max:10,col:'#a8e8ff',g:'❂',sp:l=>24+l*2,cd:5,kind:'self',
    desc:l=>`Spin and fire ${4+Math.floor(l/2)} shots at monsters within 220px, each for ${70+l*10}% ATK.`,
    run:l=>{const list=mobs.filter(m=>!m.dead&&Math.hypot(m.x-P.x,m.y-P.y)<=220+m.d.size);if(!list.length)return;const n=4+Math.floor(l/2);
      for(let k=0;k<n;k++)setTimeout(()=>{if(!P||P.dead)return;const live=list.filter(gs3Live);if(!live.length)return;const m=live[k%live.length];
        gs3Shot(P,m,'#d8f4ff',()=>{if(gs3Live(m))dealPhys(m,.7+l*.1);});},k*90);}},
  quickhands:{name:'Quick Hands',max:10,col:'#c8f0ff',g:'✋',sp:l=>26,cd:30,kind:'self',
    desc:l=>`For 30s: +${l*3}% attack speed and +${l*3} FLEE.`,run:l=>buff('quickhands','Quick Hands',30,{aspd:l*3,flee:l*3})},
  gunkata:{name:'Gun Kata',max:10,col:'#b8e0f0',g:'☯',...PASSIVE(),desc:l=>`+${l*2} FLEE and +${l} CRIT.`},
  wallshot:{name:'Trick Shot',max:10,col:'#8ad0ff',g:'↶',sp:l=>16+l*2,cd:2,kind:'target',range:240,
    desc:l=>`A shot off a wall for ${150+l*22}% ATK plus 1% per AGI. Never misses, and you get +50 FLEE for 2s.`,
    run:(l,t)=>{gs3Shot(P,t,'#bfeeff',()=>dealPhys(t,1.5+l*.22+S.agi*.01,{sure:true}));buff('trickstep','Trick Step',2,{flee:50});}},
};
Object.assign(SKILLS,GS3_SKILLS);
Object.assign(SKILL_REQ,{railshot:{killshot:3},pinningshot:{eaglesight:1},holdbreath:{killshot:1},
  napalm:{incendiary:3},powderkeg:{hotloads:3},blazingbarrels:{incendiary:1},
  bulletstorm:{ricochet:3},quickhands:{ricochet:1},wallshot:{gunkata:3}});
Object.assign(SKILL_ELEM,{incendiary:'fire',napalm:'fire',powderkeg:'fire'});
// what each calling's starting skills need from the first job (this is how js/jobpaths.js links paths to callings):
// Sniper = Marksman path, Trickshot = Gunner path, Pyro Gunner = both
if(typeof CROSS_REQ!=='undefined'){const X={killshot:{piercinground:3},eaglesight:{steadyaim:3},incendiary:{flareround:3},hotloads:{scattershot:3},ricochet:{fanning:3},gunkata:{flashbang:1}};
  Object.assign(CROSS_REQ,X);for(const id in X)SKILL_REQ[id]=Object.assign({},SKILL_REQ[id]||{},X[id]);}
// passives
{const _pb3=passiveB;passiveB=function(){const b=_pb3.apply(this,arguments);if(!P||!P.skills)return b;const L=id=>P.skills[id]||0,add=(k,v)=>{if(v)b[k]=(b[k]||0)+v;};
  if(isGun()){add('critdmg',L('eaglesight')*3);add('atkpct',L('hotloads')*2);}
  add('flee',L('gunkata')*2);add('crit',L('gunkata'));return b;};}
// Eagle Sight: shoot further
{const _cs3=computeStats;computeStats=function(){const s=_cs3.apply(this,arguments);try{const l=P&&P.skills&&P.skills.eaglesight||0;if(l&&isGun()&&s.range)s.range+=l*12;}catch(e){}return s;};}
// Blazing Barrels: normal shots burst into flame
{const _ba3=basicAttack;basicAttack=function(t){const r=_ba3.apply(this,arguments);try{const bb=P.skills.blazingbarrels||0;
  if(bb&&t&&!t.dead&&P.buffs.blazingbarrels&&P.buffs.blazingbarrels.until>now){const d=Math.hypot(t.x-P.x,t.y-P.y);
    setTimeout(()=>{if(gs3Live(t)){fx.push({k:'flare',x:t.x,y:t.y,col:'#ff8a3a',r:26,dur:.25,h:t.d.size});dealPhys(t,(.3+bb*.05)*gs3Hot(),{sure:true,el:'fire'});}},d/1150*1000+40);}}catch(e){}return r;};}

const GS3={
  sniper:{base:'gunslinger',name:'Sniper',hp:1.05,sp:1.1,aspd:.86,col:'#4a5a3a',acc:'#f0e6c0',
    desc:'A patient marksman with a long rifle. Shoots further than anyone, and one shot is often enough.',skills:['killshot','railshot','pinningshot','eaglesight','holdbreath']},
  pyrogunner:{base:'gunslinger',name:'Pyro Gunner',hp:1.15,sp:1.1,aspd:.88,col:'#5a2a1a',acc:'#ff7a2a',
    desc:'Loads every round with fire. Incendiary shots, napalm shells and powder kegs burn whole packs away.',skills:['incendiary','napalm','powderkeg','hotloads','blazingbarrels']},
  trickshot:{base:'gunslinger',name:'Trickshot',hp:1.05,sp:1.05,aspd:.8,col:'#1e3a4a',acc:'#7ad8ff',
    desc:'A showman with two quick pistols. Bullets bounce between monsters, and nothing lands a hit on the dancer.',skills:['ricochet','bulletstorm','quickhands','gunkata','wallshot']}};
for(const id in GS3){const j=GS3[id],b=CLASSES[j.base];JOB2[id]={...j,skills:j.skills};
  CLASSES[id]={name:j.name,hp:j.hp,sp:j.sp,aspd:j.aspd,weapons:b.weapons,col:j.col,hair:b.hair,magic:b.magic,base:j.base,tier:2,acc:j.acc,
    desc:j.desc,own:JOB2[id].skills,skills:[...b.skills.filter(s=>s!=='firstaid'),...j.skills,'firstaid']};}

// Corvin's trial for a Job Lv 40 Gunslinger
TRIALS.gunslinger={mob:'rimestalker',need:25,item:'fang',items:10,gold:5000,
  say:'A gun is only as good as the hand that holds it steady. The Rimestalkers of Frostpeak Pass move fast in the snow. Drop them, and bring me their fangs.'};

// ---- how they look and strike ----
const SKILL_FX_GS3={
  killshot:(l,t)=>{fxF({k:'reticle',x:t.x,y:t.y,col:'#f0e6c0',dur:.4,h:fxSz(t)+6});fxF({k:'flare',x:t.x,y:t.y,col:'#ffffff',r:30,dur:.2,h:fxSz(t),t0:now+.18});fxF({k:'spikes',x:t.x,y:t.y,col:'#f0e6c0',dur:.3,h:fxSz(t),t0:now+.2});},
  railshot:(l,t)=>{fxF({k:'flare',x:P.x,y:P.y,o:P,col:'#c8e0ff',r:30,dur:.25,h:18});fxF({k:'icicles',x:t.x,y:t.y,col:'#e0f0ff',r:50,n:6,dur:.4});},
  pinningshot:(l,t)=>{fxF({k:'rune',x:t.x,y:t.y,col:'#d8c8a0',g:'⊣',r:26,dur:.8});fxF({k:'quake',x:t.x,y:t.y,r:40,col:'#5a4a2a',glow:'#d8c8a0',dur:.4,t0:now+.15});},
  holdbreath:l=>{fxF({k:'halo',x:P.x,y:P.y,o:P,col:'#f8f0d0',dur:1.2});fxF({k:'reticle',x:P.x,y:P.y,col:'#f0e6c0',dur:.6,h:20});fxF({k:'motes',x:P.x,y:P.y,o:P,col:'#ffffff',col2:'#f0e6c0',n:10,r:26,dur:1});},
  incendiary:(l,t)=>{fxF({k:'flare',x:t.x,y:t.y,col:'#ff7a2a',r:80,dur:.4,h:fxSz(t),t0:now+.18});fxF({k:'motes',x:t.x,y:t.y,col:'#ffb04a',col2:'#ff3a1a',n:14,r:60,dur:.8,t0:now+.2});},
  napalm:(l,x,y)=>{fxF({k:'quake',x,y,r:100,col:'#3a1a0a',glow:'#ff6a2a',dur:.8});fxF({k:'motes',x,y,col:'#ff8a3a',col2:'#ffd04a',n:28,r:90,dur:3.6});fxF({k:'vortex',x,y,col:'#ff5a1a',col2:'#3a1a0a',r:90,dur:1});},
  powderkeg:l=>{fxF({k:'flare',x:P.x,y:P.y,col:'#ffb04a',r:120,dur:.45,h:6,t0:now+.1});fxF({k:'quake',x:P.x,y:P.y,r:110,col:'#3a1a0a',glow:'#ff8a3a',dur:.7,t0:now+.1});fxF({k:'icicles',x:P.x,y:P.y,col:'#ffd04a',r:110,n:12,dur:.5,t0:now+.1});},
  blazingbarrels:l=>{fxF({k:'vortex',x:P.x,y:P.y,o:P,col:'#ff8a3a',col2:'#3a1a0a',r:40,imp:true,dur:.7});fxF({k:'motes',x:P.x,y:P.y,o:P,col:'#ffb04a',col2:'#ff3a1a',orbit:true,n:14,r:28,dur:1.4});},
  ricochet:(l,t)=>{fxF({k:'spikes',x:t.x,y:t.y,col:'#7ad8ff',dur:.25,h:fxSz(t),t0:now+.15});},
  bulletstorm:l=>{fxF({k:'crescent',x:P.x,y:P.y,ang:0,r:44,w:8,col:'#a8e8ff',dur:.5,h:14});fxF({k:'motes',x:P.x,y:P.y,o:P,col:'#fff2b0',col2:'#a8e8ff',n:18,r:40,dur:.8});},
  quickhands:l=>{fxF({k:'halo',x:P.x,y:P.y,o:P,col:'#c8f0ff',dur:1});fxF({k:'motes',x:P.x,y:P.y,o:P,col:'#c8f0ff',col2:'#ffffff',shape:'star',n:12,r:30,dur:1.1});},
  wallshot:(l,t)=>{fxF({k:'chain',x:t.x,y:t.y,pts:[{x:P.x,y:P.y,h:18},{x:(P.x+t.x)/2,y:Math.min(P.y,t.y)-60,h:20},{x:t.x,y:t.y,h:fxSz(t)}],col:'#8ad0ff',dur:.3});fxF({k:'streak',x0:P.x+20,y0:P.y,x:P.x-30,y:P.y+10,col:'#8ad0ff',w:6,dur:.25});},
};
if(typeof SKILL_FX!=='undefined')for(const id in SKILL_FX_GS3){const sk=SKILLS[id];if(!sk||!sk.run||SKILL_FX[id])continue;SKILL_FX[id]=SKILL_FX_GS3[id];const run=sk.run,fxf=SKILL_FX_GS3[id];
  sk.run=function(){try{fxf.apply(this,arguments);}catch(e){}return run.apply(this,arguments);};}
// outfits (js/joblooks.js): a long ghillie-green coat, a scorched red coat with embers, a short blue showman's coat
if(typeof JOB_LOOK!=='undefined')Object.assign(JOB_LOOK,{
  sniper:{b:[['cape',{c:'#4a5a3a',t:'#f0e6c0',long:1}]]},
  pyrogunner:{s:[['sparks',{c:'#ff8a3a'}]],b:[['cape',{c:'#5a2a1a',t:'#ff7a2a',long:1}]]},
  trickshot:{s:[['sparks',{c:'#7ad8ff'}]],b:[['cape',{c:'#1e3a4a',t:'#7ad8ff'}]]}});
if(typeof HERO2_DRESS!=='undefined'&&HERO2_DRESS.gunslinger)Object.assign(HERO2_DRESS,{
  sniper:{...HERO2_DRESS.gunslinger,trim:'#f0e6c0',pant:'#3a4030'},pyrogunner:{...HERO2_DRESS.gunslinger,trim:'#ff7a2a',pant:'#3a2420'},trickshot:{...HERO2_DRESS.gunslinger,trim:'#7ad8ff',pant:'#26303a'}});
if(typeof CAST_COL!=='undefined')Object.assign(CAST_COL,{sniper:'#f0e6c0',pyrogunner:'#ff7a2a',trickshot:'#7ad8ff'});
// finishers and cast circles (js/fightstyle.js): same gun tracer as the Gunslinger, each with its own finisher
if(typeof FS_STYLES!=='undefined'&&FS_STYLES.gunslinger){const G=FS_STYLES.gunslinger,mk=(cast,n,f)=>({...G,cast,fin:{n,f}});
  Object.assign(FS_STYLES,{
    sniper:mk(['stars','#f0e6c0'],'One Shot, One Kill',t=>{fxF({k:'reticle',x:t.x,y:t.y,col:'#ffffff',dur:.5,h:fsH(t)+8});fxF({k:'flare',x:t.x,y:t.y,col:'#f0e6c0',r:60,dur:.3,t0:now+.3,h:fsH(t)});fxF({k:'spikes',x:t.x,y:t.y,col:'#ffffff',dur:.35,h:fsH(t),t0:now+.32});}),
    pyrogunner:mk(['flame','#ff7a2a'],'Inferno Salvo',t=>{for(let i=0;i<3;i++)fxF({k:'flare',x:t.x+(i-1)*18,y:t.y+(i%2)*6,col:i===1?'#ffd04a':'#ff6a2a',r:46,dur:.35,t0:now+i*.1,h:fsH(t)});fxF({k:'motes',x:t.x,y:t.y,col:'#ffb04a',col2:'#ff3a1a',n:20,r:56,dur:1,t0:now+.3});}),
    trickshot:mk(['stars','#7ad8ff'],'Six-Gun Waltz',t=>{for(let i=0;i<6;i++){const a=i*Math.PI/3;fxF({k:'streak',x0:t.x+Math.cos(a)*60,y0:t.y+Math.sin(a)*30,x:t.x,y:t.y,col:i%2?'#7ad8ff':'#fff2b0',w:4,dur:.2,t0:now+i*.06});}
      fxF({k:'motes',x:t.x,y:t.y,col:'#c8f0ff',col2:'#ffffff',shape:'star',n:14,r:40,dur:.9,t0:now+.36});})});}
if(typeof SIT_POSE!=='undefined')Object.assign(SIT_POSE,{sniper:{legs:'knees',hands:[[8,-2],[-4,0]],hip:5,lean:.04},trickshot:{legs:'stretch',hands:[[9,-1],[-9,-1]],hip:5,lean:-.1}});
if(typeof JS_ROLE!=='undefined')Object.assign(JS_ROLE,{sniper:['Long range · one big shot','ระยะไกลสุด · นัดเดียวจบ'],pyrogunner:['Fire rounds · packs','กระสุนไฟ · กวาดฝูง'],trickshot:['Ricochets · dodging','กระสุนแฉลบ · หลบไว']});

if(typeof TH!=='undefined')Object.assign(TH,{
  'Sniper':'สไนเปอร์','Pyro Gunner':'ไพโรกันเนอร์','Trickshot':'ทริกช็อต','Trick Step':'ก้าวหลอก',
  'One Shot, One Kill':'นัดเดียวปลิดชีพ','Inferno Salvo':'ห่ากระสุนนรก','Six-Gun Waltz':'วอลซ์หกนัด',
  'A patient marksman with a long rifle. Shoots further than anyone, and one shot is often enough.':'มือปืนผู้อดทนกับไรเฟิลลำกล้องยาว ยิงได้ไกลกว่าใคร และบ่อยครั้งนัดเดียวก็พอ',
  'Loads every round with fire. Incendiary shots, napalm shells and powder kegs burn whole packs away.':'บรรจุไฟในทุกนัด กระสุนเพลิง กระสุนนาปาล์ม และถังดินปืน เผามอนสเตอร์ทั้งฝูงให้มอดไหม้',
  'A showman with two quick pistols. Bullets bounce between monsters, and nothing lands a hit on the dancer.':'นักแสดงกับปืนพกคู่มือไว กระสุนแฉลบไปมาระหว่างมอนสเตอร์ และไม่มีอะไรโจมตีโดนนักเต้นคนนี้',
  'A gun is only as good as the hand that holds it steady. The Rimestalkers of Frostpeak Pass move fast in the snow. Drop them, and bring me their fangs.':
    'ปืนจะดีได้ก็เพราะมือที่ถือมันไว้อย่างมั่นคง พวกไรม์สตอล์กเกอร์แห่งช่องเขาฟรอสต์พีคเคลื่อนไหวรวดเร็วในหิมะ ยิงพวกมันให้ล้ม แล้วนำเขี้ยวมาให้ข้า'});
