"use strict";
/* ================= the Forgehand, part two: paths, story, look and its advanced callings (v1.71.0) =================
     Forgehand -> Runesmith    (Forge path)  fire runes burned into the axe: rune cleaves, ember waves, a hammer quake
     Forgehand -> Coinbreaker  (Trade path)  gold turned into blows: coin strikes, a cart crash, a jackpot
   Its story with Forgemistress Hilde (three chapters, like the other first jobs) and Corvin's Job Lv 40 trial.
   Loaded after js/fightstyle.js (where the Gunslinger's part two was). */
if(typeof JOB_LOOK!=='undefined')JOB_LOOK.forgehand={};
// ---- skill paths ----
if(typeof JOB_PATHS!=='undefined')JOB_PATHS.forgehand={core:['hew','firstaid'],paths:[
  {id:'forge',name:'Forge',th:'สายเตาหลอม',role:'fire and heavy blows',roleTh:'ไฟและการฟาดหนัก',skills:['forgefire','anvildrop','axemastery']},
  {id:'trade',name:'Trade',th:'สายการค้า',role:'tough, lucky, crowds',roleTh:'ทนทาน โชคดี กวาดฝูง',skills:['widechop','ironback','luckycoin']}]};
if(typeof JS_ROLE!=='undefined')JS_ROLE.forgehand=['Melee · axe · forge','ระยะประชิด · ขวาน · เตาหลอม'];
// ---- the fight style: an orange chop, sparks, and the finisher ----
if(typeof FS_STYLES!=='undefined'&&typeof FS_HIT!=='undefined'){
  FS_STYLES.forgehand={cast:['flame','#ffb070'],melee:FS_HIT.slash?FS_HIT.slash('#ffb070'):null,fin:{n:'Hammerfall',f:t=>{shakeUntil=now+.25;
    fxF({k:'quake',x:t.x,y:t.y,r:70,col:'#3a2a1a',glow:'#ffb070',dur:.6});fxF({k:'motes',x:t.x,y:t.y,col:'#ffd08a',col2:'#ff7a2a',n:16,r:40,dur:.8,t0:now+.05});if(typeof sfx==='function')sfx('crit');}}};}

/* ---- the story: three chapters with Forgemistress Hilde, who runs the old forge by Travellers' Green ---- */
Object.assign(QNPC,{hilde:{name:'Forgemistress Hilde',zone:'town',tx:23.2,ty:27.4,col:'#8a4a22',hair:'#c86a3a'}});
NPC_KEY[QNPC.hilde.name]='hilde';
if(typeof NPC_TH!=='undefined')NPC_TH['Forgemistress Hilde']='ช่างหลอมฮิลเด';if(typeof TH!=='undefined')TH['Forgemistress Hilde']='ช่างหลอมฮิลเด';
if(typeof NPC_SHORT_TH!=='undefined')NPC_SHORT_TH.unshift(['Forgemistress Hilde','ช่างหลอมฮิลเด'],['Hilde','ฮิลเด']);
{const _gr=greeting;greeting=function(k){if(k==='hilde')return JS_L('Mind the sparks. They bite.','ระวังสะเก็ดไฟ มันกัดนะ');return _gr.apply(this,arguments);};}
const FH_STORY={
  fh1:{job:'forgehand',name:'The Old Forge',th:'เตาหลอมเก่า',from:'corvin',to:'hilde',lv:1,obj:[],reward:R1,
    offer:['Hilde lit the old forge by Travellers\' Green again. She swings an axe as well as she swings a hammer.','She needs a strong pair of hands. Go and see her.'],
    offerTh:['ฮิลเดจุดไฟเตาหลอมเก่าข้างลานนักเดินทางอีกครั้งแล้ว นางเหวี่ยงขวานได้ดีพอ ๆ กับเหวี่ยงค้อน','นางต้องการมือที่แข็งแรงสักคู่ ไปหานางสิ'],
    wait:'Forgemistress Hilde is by Travellers\' Green in Hearthvale.',waitTh:'ช่างหลอมฮิลเดอยู่ที่ลานนักเดินทางในเฮิร์ธเวล',
    done:['Corvin sent you? Then roll up your sleeves.','An axe is a tool before it is a weapon. Learn to make one, and you will know how to use one.'],
    doneTh:['คอร์วินส่งเจ้ามางั้นรึ ถ้างั้นก็พับแขนเสื้อขึ้นมา','ขวานเป็นเครื่องมือก่อนจะเป็นอาวุธ เรียนรู้วิธีตีมันให้เป็น แล้วเจ้าจะรู้วิธีใช้มัน']},
  fh2:{job:'forgehand',name:'Coal and Iron',th:'ถ่านกับเหล็ก',from:'hilde',to:'hilde',lv:1,after:'fh1',reward:R2,
    obj:[{talk:'brannoc',text:'Ask Brannoc for an axe head',th:'ขอหัวขวานจากแบรนน็อค',line:'An axe head for Hilde\'s apprentice? Here. Rough, but the steel is honest.',lineTh:'หัวขวานให้ลูกมือของฮิลเดงั้นรึ? นี่ ยังหยาบอยู่ แต่เหล็กซื่อตรง'},
      {talk:'tobin',text:'Ask Tobin for a sack of coal',th:'ขอถ่านหินจากโทบินหนึ่งกระสอบ',line:'Coal from the caravans. It burns hot and long. Mind your eyebrows.',lineTh:'ถ่านหินจากกองคาราวาน ติดไฟร้อนและนาน ระวังขนคิ้วด้วย'},
      {spot:'log1',zone:'heights',dx:6,dy:-4,art:'dummy',seq:1,text:'Split the first log on Windwhistle Heights',th:'ผ่าท่อนไม้แรกบนที่ราบสูงวินด์วิสเซิล',say:'Thunk! Clean through. Let the weight of the axe do the work.',sayTh:'ฉับ! ขาดในครั้งเดียว ปล่อยให้น้ำหนักขวานทำงาน'},
      {spot:'log2',zone:'heights',dx:12,dy:2,art:'dummy',seq:2,text:'Split the old oak stump',th:'ผ่าตอไม้โอ๊กเก่า',say:'Three swings for old oak. That is how it should be.',sayTh:'สามครั้งสำหรับโอ๊กเก่า นั่นแหละที่ควรจะเป็น'}],
    offer:['A smith needs iron and fire. Brannoc keeps spare axe heads; Tobin brings coal with the caravans.','Then show me your swing. There are two logs waiting on Windwhistle Heights, north of town.'],
    offerTh:['ช่างตีเหล็กต้องมีเหล็กและไฟ แบรนน็อคมีหัวขวานสำรอง โทบินนำถ่านหินมากับกองคาราวาน','แล้วแสดงวงสวิงให้ข้าดู มีท่อนไม้สองท่อนรออยู่บนที่ราบสูงวินด์วิสเซิล ทางเหนือของเมือง'],
    wait:'Ask Brannoc and Tobin, then split the two logs on Windwhistle Heights.',waitTh:'ถามแบรนน็อคและโทบิน แล้วผ่าท่อนไม้สองท่อนบนที่ราบสูงวินด์วิสเซิล',
    done:['Two logs, two clean cuts. And your back did not complain.','One more lesson. This one swings back.'],
    doneTh:['ท่อนไม้สองท่อน รอยตัดสะอาดสองรอย และหลังของเจ้าก็ไม่บ่น','อีกบทเรียนเดียว บทนี้มันฟาดกลับได้']},
  fh3:{job:'forgehand',name:'Tempered',th:'ผ่านการชุบ',from:'hilde',to:'hilde',lv:1,after:'fh2',reward:R3,grant:'forgehand',
    obj:[{duel:'skarn',zone:'farms',dx:10,dy:-6,art:'thief',hits:3,text:'Face Skarn the Raider at Willowmere Farms',th:'เผชิญหน้ากับสการ์นจอมปล้นที่ไร่วิลโลว์เมียร์',name:'Duel: Skarn the Raider',nameTh:'ดวล: สการ์นจอมปล้น',
      win:'Skarn\'s axe flies out of his hands and sticks in a fence post. "Hilde\'s work. I know that swing." He backs off into the reeds.',winTh:'ขวานของสการ์นหลุดจากมือไปปักอยู่ที่เสารั้ว "ฝีมือฮิลเด ข้าจำวงสวิงนั้นได้" เขาถอยหายเข้าไปในดงกก'}],
    offer:['Skarn the Raider has been taking the farm carts at Willowmere. He swings a stolen axe, one of mine.','Take it back from him. Then come home and I will give you your own.'],
    offerTh:['สการ์นจอมปล้นขโมยเกวียนของไร่วิลโลว์เมียร์มาหลายวันแล้ว เขาเหวี่ยงขวานที่ขโมยไป หนึ่งในขวานของข้า','เอามันคืนมาจากเขา แล้วกลับมา ข้าจะให้ขวานของเจ้าเอง'],
    wait:'Beat Skarn the Raider at Willowmere Farms, then return to Forgemistress Hilde.',waitTh:'เอาชนะสการ์นจอมปล้นที่ไร่วิลโลว์เมียร์ แล้วกลับไปหาช่างหลอมฮิลเด',
    done:['You brought my axe home. And Skarn will think twice.','Fire made you, and steel will follow you. Welcome, Forgehand.'],
    doneTh:['เจ้านำขวานของข้ากลับบ้าน และสการ์นคงคิดสองครั้งก่อนกลับมา','ไฟหล่อหลอมเจ้า และเหล็กจะติดตามเจ้า ยินดีต้อนรับ ฟอร์จแฮนด์']}};
for(const [id,q] of Object.entries(FH_STORY)){if(TH_ON){q.name=q.th||q.name;q.offer=q.offerTh||q.offer;q.wait=q.waitTh||q.wait;q.done=q.doneTh||q.done;if(typeof TH_QNAMES!=='undefined')TH_QNAMES.add(q.name);}
  q.obj.forEach(o=>{if(o.spot||o.duel||o.talk){o.n=1;o.key=o.spot||o.duel||('talk:'+o.talk);}});JOB_STORY[id]=q;QUESTS[id]=q;}
if(typeof JS_FIRST!=='undefined'&&!JS_FIRST.includes('fh1'))JS_FIRST.push('fh1');

// ---- each first-job skill's own effect ----
if(typeof SKILL_FX!=='undefined'){const FH_FX={
  hew:(l,t)=>{fxF({k:'claws',x:t.x,y:t.y,ang:.5,r:26,col:'#ffb070',dur:.25,h:fxSz(t)});fxF({k:'chain',x:t.x,y:t.y,pts:[{x:P.x,y:P.y,h:20},{x:t.x,y:t.y,h:fxSz(t)}],col:'#ffd08a',dur:.2});},
  widechop:l=>{fxF({k:'crescent',x:P.x,y:P.y,ang:0,r:60,w:12,col:'#e8c090',dur:.35,h:10});fxF({k:'spikes',x:P.x,y:P.y,col:'#ffd08a',dur:.3,h:10});},
  anvildrop:(l,x,y)=>{fxF({k:'streak',x0:x,y0:y-200,x,y,col:'#c8ccd4',w:9,dur:.22});fxF({k:'quake',x,y,r:90,col:'#3a3a3a',glow:'#c8ccd4',dur:.6,t0:now+.22});fxF({k:'spikes',x,y,col:'#c8ccd4',dur:.3,h:6,t0:now+.22});},
  forgefire:l=>{fxF({k:'vortex',x:P.x,y:P.y,o:P,col:'#ff8a3a',col2:'#3a1a0a',r:36,imp:true,dur:.6});fxF({k:'motes',x:P.x,y:P.y,o:P,col:'#ffd08a',col2:'#ff5a1a',orbit:true,n:12,r:26,dur:1.2});fxF({k:'rune',x:P.x,y:P.y,o:P,col:'#ff8a3a',g:'♨',r:28,dur:.8});}};
  for(const [id,fxf] of Object.entries(FH_FX)){SKILL_FX[id]=fxf;const sk=SKILLS[id];if(!sk||!sk.run)continue;const run=sk.run;sk.run=function(){try{fxf.apply(this,arguments);}catch(e){}return run.apply(this,arguments);};}}

/* ================= the advanced callings ================= */
const fhLive=t=>t&&!t.dead&&mobs.includes(t);
const FH2_SK={
  // ---- Runesmith (the Forge path)
  runecleave:{name:'Rune Cleave',max:10,col:'#ff7a2a',g:'ᚱ',sp:l=>16+l*2,cd:1.6,kind:'target',range:70,
    desc:l=>`A rune burns on the blade: ${170+l*24}% ATK (Fire), then the rune bursts for ${45+l*8}% ATK (Fire) on all within 70px.`,
    run:(l,t)=>{dealPhys(t,1.7+l*.24,{el:'fire'});const x=t.x,y=t.y;setTimeout(()=>{if(!P||P.dead)return;aoe(x,y,70,m=>dealPhys(m,.45+l*.08,{sure:true,el:'fire'}));},200);}},
  emberwave:{name:'Ember Wave',max:10,col:'#ff5a1a',g:'≋',sp:l=>24+l*2,cd:5,kind:'area',range:220,radius:100,
    desc:l=>`Strike the ground and send embers rolling: ${52+l*9}% ATK (Fire) to all within 100px of the spot, three times.`,
    run:(l,x,y)=>{for(let k=0;k<3;k++)setTimeout(()=>{if(!P||P.dead)return;fx.push({k:'ring',x,y,r:100,col:'#ff7a2a',t0:now,dur:.45});aoe(x,y,100,m=>dealPhys(m,.52+l*.09,{sure:true,el:'fire'}));},k*450);}},
  hammerquake:{name:'Hammer Quake',max:10,col:'#c8a070',g:'⊛',sp:l=>26+l*2,cd:6,kind:'self',
    desc:l=>`Slam the ground: ${150+l*21}% ATK to all within 110px of you, and a ${25+l*4}% chance to stun each for 2s.`,
    run:l=>{shakeUntil=now+.25;for(const m of fhNear(P.x,P.y,110)){dealPhys(m,1.5+l*.21,{sure:true});if(!m.dead&&Math.random()*100<25+l*4&&typeof ailMob==='function')ailMob(m,'stun',2);}}},
  runebrand:{name:'Rune Brand',max:10,col:'#ffa060',g:'ᚦ',...PASSIVE(),desc:l=>`With an axe: +${l}% ATK and +${l*3} DEF.`},
  temperedge:{name:'Tempered Edge',max:10,col:'#ffd08a',g:'◇',sp:l=>30,cd:30,kind:'self',
    desc:l=>`For 45s: +${l*2.5}% ATK and +${l*2} CRIT.`,run:l=>buff('temperedge','Tempered Edge',45,{atkpct:l*2.5,crit:l*2})},
  // ---- Coinbreaker (the Trade path)
  coinstrike:{name:'Coin Strike',max:10,col:'#ffd84a',g:'¤',sp:l=>12+l,cd:1.6,kind:'target',range:70,
    desc:l=>`Pay ${10+l*5} gold for a blow worth it: ${475+l*65}% ATK. Without the gold, half as hard.`,
    run:(l,t)=>{const cost=10+l*5,paid=P.gold>=cost;if(paid)P.gold-=cost;dealPhys(t,(4.75+l*.65)*(paid?1:.5));}},
  cartcrash:{name:'Cart Crash',max:10,col:'#c89a5a',g:'⛟',sp:l=>24+l*2,cd:5,kind:'self',
    desc:l=>`Ram your cart through the crowd: ${345+l*48}% ATK to all within 100px of you.`,
    run:l=>{shakeUntil=now+.15;aoe(P.x,P.y,100,m=>dealPhys(m,3.45+l*.48,{sure:true}));}},
  jackpot:{name:'Jackpot',max:10,col:'#ffe68a',g:'✪',sp:l=>20+l*2,cd:3,kind:'target',range:70,
    desc:l=>`Roll your luck: anywhere from ${180+l*27}% to ${725+l*109}% ATK. Never misses.`,
    run:(l,t)=>{const lo=1.8+l*.27,hi=7.25+l*1.09;dealPhys(t,lo+Math.random()*(hi-lo),{sure:true});}},
  goldenguard:{name:'Golden Guard',max:10,col:'#e8c860',g:'⛨',...PASSIVE(),desc:l=>`+${l*4} DEF and +${l*2} FLEE.`},
  bigdeal:{name:'Big Deal',max:10,col:'#ffe08a',g:'✦',sp:l=>28,cd:30,kind:'self',
    desc:l=>`For 40s: +${l*3}% attack speed and +${l*2} CRIT.`,run:l=>buff('bigdeal','Big Deal',40,{aspd:l*3,crit:l*2})}};
Object.assign(SKILLS,FH2_SK);
Object.assign(SKILL_REQ,{emberwave:{runecleave:3},hammerquake:{runebrand:3},temperedge:{runecleave:1},cartcrash:{coinstrike:3},jackpot:{goldenguard:3},bigdeal:{coinstrike:1}});
Object.assign(SKILL_ELEM,{runecleave:'fire',emberwave:'fire'});
// the first-job skills each calling grows from (how js/jobpaths.js links paths to callings): Runesmith = Forge, Coinbreaker = Trade
if(typeof CROSS_REQ!=='undefined'){const X={runecleave:{anvildrop:3},runebrand:{axemastery:3},coinstrike:{widechop:3},goldenguard:{ironback:3}};
  Object.assign(CROSS_REQ,X);for(const id in X)SKILL_REQ[id]=Object.assign({},SKILL_REQ[id]||{},X[id]);}
{const _pbF2=passiveB;passiveB=function(){const b=_pbF2.apply(this,arguments);if(!P||!P.skills)return b;const L=id=>P.skills[id]||0,add=(k,v)=>{if(v)b[k]=(b[k]||0)+v;};
  if(isAxe()){add('atkpct',L('runebrand'));add('def',L('runebrand')*3);}add('def',L('goldenguard')*4);add('flee',L('goldenguard')*2);return b;};}
const FH2={
  runesmith:{base:'forgehand',name:'Runesmith',hp:1.6,sp:1.1,aspd:.95,col:'#3a2a24',acc:'#ff8a3a',
    desc:'Burns fire runes into the axe. Rune cleaves, waves of embers and a hammer that shakes the ground.',skills:['runecleave','emberwave','hammerquake','runebrand','temperedge']},
  coinbreaker:{base:'forgehand',name:'Coinbreaker',hp:1.5,sp:1.05,aspd:.9,col:'#2a5a3a',acc:'#ffd84a',
    desc:'A trader who hits back. Gold turned into blows, a cart through the crowd, and a lucky jackpot.',skills:['coinstrike','cartcrash','jackpot','goldenguard','bigdeal']}};
for(const id in FH2){const j=FH2[id],b=CLASSES[j.base];JOB2[id]={...j,skills:j.skills};
  CLASSES[id]={name:j.name,hp:j.hp,sp:j.sp,aspd:j.aspd,weapons:b.weapons,col:j.col,hair:b.hair,magic:b.magic,base:j.base,tier:2,acc:j.acc,
    desc:j.desc,own:JOB2[id].skills,skills:[...b.skills.filter(s=>s!=='firstaid'),...j.skills,'firstaid']};}
// Corvin's trial for a Job Lv 40 Forgehand
TRIALS.forgehand={mob:'rimestalker',need:25,item:'fang',items:10,gold:5000,
  say:'Steel is tested in the cold. The Rimestalkers of Frostpeak Pass have hides like iron. Cut through them, and bring me their fangs.'};
// ---- how they look and strike ----
const SKILL_FX_FH2={
  runecleave:(l,t)=>{fxF({k:'rune',x:t.x,y:t.y,col:'#ff8a3a',g:'ᚱ',r:24,dur:.5});fxF({k:'flare',x:t.x,y:t.y,col:'#ff7a2a',r:60,dur:.35,t0:now+.2,h:fxSz(t)});fxF({k:'spikes',x:t.x,y:t.y,col:'#ffb070',dur:.3,h:fxSz(t),t0:now+.2});},
  emberwave:(l,x,y)=>{fxF({k:'quake',x,y,r:100,col:'#3a1a0a',glow:'#ff7a2a',dur:1.3});fxF({k:'motes',x,y,col:'#ffb04a',col2:'#ff3a1a',n:22,r:90,dur:1.4});},
  hammerquake:l=>{fxF({k:'quake',x:P.x,y:P.y,r:110,col:'#3a2a1a',glow:'#c8a070',dur:.7});fxF({k:'icicles',x:P.x,y:P.y,col:'#c8a070',r:110,n:10,dur:.5});fxF({k:'halo',x:P.x,y:P.y,o:P,col:'#c8a070',dur:.6});},
  temperedge:l=>{fxF({k:'rune',x:P.x,y:P.y,o:P,col:'#ffd08a',g:'◇',r:30,dur:.9});fxF({k:'spikes',x:P.x,y:P.y,col:'#ff8a3a',dur:.35,h:18});},
  coinstrike:(l,t)=>{fxF({k:'motes',x:t.x,y:t.y,col:'#ffe68a',col2:'#e8b030',shape:'star',n:10,r:24,dur:.6});fxF({k:'flare',x:t.x,y:t.y,col:'#ffd84a',r:34,dur:.25,h:fxSz(t)});fxF({k:'reticle',x:t.x,y:t.y,col:'#ffd84a',dur:.3,h:fxSz(t)});},
  cartcrash:l=>{fxF({k:'crescent',x:P.x,y:P.y,ang:0,r:70,w:14,col:'#c89a5a',dur:.4,h:8});fxF({k:'quake',x:P.x,y:P.y,r:100,col:'#3a2a1a',glow:'#e8c090',dur:.5});fxF({k:'icicles',x:P.x,y:P.y,col:'#c89a5a',r:100,n:8,dur:.4});},
  jackpot:(l,t)=>{for(let i=0;i<3;i++)fxF({k:'motes',x:t.x,y:t.y,col:'#ffe68a',col2:'#fff6c8',shape:'star',n:6,r:20+i*10,dur:.7,t0:now+i*.08});fxF({k:'reticle',x:t.x,y:t.y,col:'#ffd84a',dur:.4,h:fxSz(t)});fxF({k:'chain',x:t.x,y:t.y,pts:[{x:P.x,y:P.y,h:18},{x:t.x,y:t.y,h:fxSz(t)}],col:'#ffe68a',dur:.25});},
  bigdeal:l=>{fxF({k:'crescent',x:P.x,y:P.y,ang:1.6,r:30,w:6,col:'#ffe08a',dur:.5,h:14});fxF({k:'flare',x:P.x,y:P.y,col:'#ffd84a',r:40,dur:.3,h:14});fxF({k:'halo',x:P.x,y:P.y,o:P,col:'#ffe08a',dur:.8});}};
if(typeof SKILL_FX!=='undefined')for(const id in SKILL_FX_FH2){const sk=SKILLS[id];if(!sk||!sk.run||SKILL_FX[id])continue;SKILL_FX[id]=SKILL_FX_FH2[id];const run=sk.run,fxf=SKILL_FX_FH2[id];
  sk.run=function(){try{fxf.apply(this,arguments);}catch(e){}return run.apply(this,arguments);};}
if(typeof JOB_LOOK!=='undefined')Object.assign(JOB_LOOK,{runesmith:{},coinbreaker:{}});
if(typeof HERO2_DRESS!=='undefined')Object.assign(HERO2_DRESS,{runesmith:{...HERO2_DRESS.forgehand,trim:'#ff8a3a'},coinbreaker:{...HERO2_DRESS.forgehand,trim:'#ffd84a'}});
if(typeof CAST_COL!=='undefined')Object.assign(CAST_COL,{runesmith:'#ff8a3a',coinbreaker:'#ffd84a'});
if(typeof FS_STYLES!=='undefined'&&FS_STYLES.forgehand){const G=FS_STYLES.forgehand,mk=(cast,n,f)=>({...G,cast,melee:FS_HIT.slash?FS_HIT.slash(cast[1]):G.melee,fin:{n,f}});
  Object.assign(FS_STYLES,{
    runesmith:mk(['flame','#ff8a3a'],'Runic Inferno',t=>{fxF({k:'rune',x:t.x,y:t.y,col:'#ff8a3a',g:'ᚱ',r:36,dur:.7});fxF({k:'flare',x:t.x,y:t.y,col:'#ff5a1a',r:80,dur:.4,t0:now+.3,h:fsH(t)});}),
    coinbreaker:mk(['stars','#ffd84a'],'Paid in Full',t=>{for(let i=0;i<8;i++){const a=i*Math.PI/4;fxF({k:'streak',x0:t.x+Math.cos(a)*50,y0:t.y+Math.sin(a)*26,x:t.x,y:t.y,col:'#ffd84a',w:4,dur:.2,t0:now+i*.04});}
      fxF({k:'motes',x:t.x,y:t.y,col:'#ffe68a',col2:'#ffffff',shape:'star',n:16,r:40,dur:.9,t0:now+.3});})});}
if(typeof SIT_POSE!=='undefined')Object.assign(SIT_POSE,{runesmith:{legs:'kneel',hands:[[8,0],[-6,2]],hip:4,lean:.08},coinbreaker:{legs:'cross',hands:[[7,1],[-7,1]],hip:5,lean:-.04}});
if(typeof JS_ROLE!=='undefined')Object.assign(JS_ROLE,{runesmith:['Fire runes · heavy blows','รูนไฟ · ฟาดหนัก'],coinbreaker:['Gold strikes · luck','ฟาดด้วยทอง · โชค']});
if(typeof TH!=='undefined')Object.assign(TH,{'Runesmith':'รูนสมิธ','Coinbreaker':'คอยน์เบรกเกอร์','Hammerfall':'ค้อนถล่ม','Runic Inferno':'นรกรูน','Paid in Full':'จ่ายครบจบ',
  'Tempered Edge':'คมผ่านการชุบ','Big Deal':'ดีลใหญ่',
  'Burns fire runes into the axe. Rune cleaves, waves of embers and a hammer that shakes the ground.':'สลักรูนไฟลงบนขวาน ฟันด้วยรูน คลื่นถ่านเพลิง และค้อนที่ทำให้พื้นสั่นสะเทือน',
  'A trader who hits back. Gold turned into blows, a cart through the crowd, and a lucky jackpot.':'พ่อค้าที่สู้กลับ เปลี่ยนทองเป็นหมัด ชนฝูงศัตรูด้วยเกวียน และแจ็กพอตแห่งโชค',
  'Steel is tested in the cold. The Rimestalkers of Frostpeak Pass have hides like iron. Cut through them, and bring me their fangs.':
    'เหล็กจะถูกทดสอบในความหนาวเย็น พวกไรม์สตอล์กเกอร์แห่งช่องเขาฟรอสต์พีคมีหนังแข็งดั่งเหล็ก ฟันผ่านพวกมันไป แล้วนำเขี้ยวมาให้ข้า'});
