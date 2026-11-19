"use strict";
/* ================= the Gunslinger, part two: its look, its tables and its story (v1.42.0) =================
   Loaded late (after js/fightstyle.js, before js/i18n-game.js): the wide-brimmed hat and long duster coat, its skill
   paths, a recommended build, size bonuses, the bag pictures of guns, its fight style (a bullet tracer, a muzzle flash
   and the Dead Man's Volley finisher), an Aurel Market rifle, and its three-chapter story with Marshal Kestrel. */
// ---- the look: a wide-brimmed hat and a long duster coat ----
if(typeof JHEAD!=='undefined')JHEAD.brim=function(x,hy,f,o){ctx.fillStyle=o.c;ctx.strokeStyle=OL2;ctx.lineWidth=1.2;
  ctx.beginPath();ctx.ellipse(x,hy-4,17,4.2,0,0,7);ctx.fill();ctx.stroke();
  ctx.beginPath();ctx.moveTo(x-9,hy-4);ctx.quadraticCurveTo(x-10,hy-17,x-3,hy-18);ctx.quadraticCurveTo(x,hy-15,x+3,hy-18);ctx.quadraticCurveTo(x+10,hy-17,x+9,hy-4);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.fillStyle=o.t||'#c83a2a';ctx.fillRect(x-9,hy-8,18,3);};
if(typeof JOB_LOOK!=='undefined')JOB_LOOK.gunslinger={h:['brim',{c:'#6a4a2a',t:'#c83a2a'}],b:[['cape',{c:'#8a6a42',t:'#5a3a22',long:1}]]};
// ---- skill paths, a recommended build, size bonuses ----
if(typeof JOB_PATHS!=='undefined')JOB_PATHS.gunslinger={core:['quickdraw','firstaid'],paths:[
  {id:'marksman',name:'Marksman',th:'สายแม่นปืน',role:'one hard shot at a time',roleTh:'ยิงหนักทีละนัด',skills:['piercinground','steadyaim','flareround']},
  {id:'gunner',name:'Gunner',th:'สายรัวปืน',role:'fast shots and crowds',roleTh:'ยิงเร็วและกวาดฝูง',skills:['fanning','scattershot','flashbang']}]};
if(typeof BUILDS!=='undefined'&&!BUILDS.some(b=>b.id==='quickshot'))BUILDS.push({id:'quickshot',job:'gunslinger',name:'Quickshot',th:'มือไวปืน',tag:'DEX/AGI rapid fire',route:['gunslinger'],stats:{dex:4,agi:3,luk:2},
  desc:'Fans the hammer for two shots at a time; Quick Draw and Scatter Shot keep a crowd at bay, Flashbang buys room to breathe.',
  skills:[['quickdraw',10],['steadyaim',10],['fanning',10],['scattershot',10],['flashbang',5],['piercinground',5],['flareround',5]],
  gear:['longrifle'],sigils:['hopper','greylupe','lupealpha'],awaken:['aspd','dbl']});
if(typeof WSIZE!=='undefined')WSIZE.gun=[100,100,95];
if(typeof JS_ROLE!=='undefined')JS_ROLE.gunslinger=['Ranged · gun · fast shots','ระยะไกล · ปืน · ยิงรัว'];
// ---- the bag pictures use the gun drawings, laid diagonally ----
{const _dii=drawItemIcon;drawItemIcon=function(g,id){const it=ITEMS[id];if(!it||it.wt!=='gun'||typeof WA==='undefined')return _dii.apply(this,arguments);
  const fn=()=>waGun(GUN_ART[id]||GUN_ART.pistol),big=id==='longrifle'||id==='aurelrepeater',main=ctx;g.save();g.translate(big?9:12,big?25:22);g.rotate(Math.PI/4);g.scale(big?.9:1.15,big?.9:1.15);ctx=g;try{fn();}finally{ctx=main;g.restore();}};}
// ---- the fight style: a bullet tracer, a flash on hit, and the finisher ----
if(typeof FS_STYLES!=='undefined'&&typeof FS_HIT!=='undefined'){
  const fin={n:"Dead Man's Volley",f:t=>{for(let i=0;i<6;i++){fxF({k:'streak',x0:P.x,y0:P.y-16,x:t.x+(i%2?6:-6),y:t.y,col:'#fff2b0',w:4,dur:.16,t0:now+i*.06});fxF({k:'flare',x:t.x,y:t.y,col:'#ffd27a',r:20+i*4,dur:.14,t0:now+.04+i*.06,h:fsH(t)});}
    if(typeof sfx==='function')sfx('crit');}};
  FS_STYLES.gunslinger={cast:['stars','#ffd27a'],shot:gunTracer,spd:1150,hit:FS_HIT.leaf||null,fin};}
// ---- the royal stock gets a repeater rifle ----
ITEMS.aurelrepeater={name:'Aurel Repeater',type:'weapon',wt:'gun',atk:132,rng:255,price:24000,lv:45,slots:1,col:'#e8d8a0',g:'W',id:'aurelrepeater'};
if(typeof ROYAL_SHOP!=='undefined'&&!ROYAL_SHOP.includes('aurelrepeater'))ROYAL_SHOP.splice(ROYAL_SHOP.indexOf('aurelstaff')+1,0,'aurelrepeater');
GUN_ART.aurelrepeater={len:21,barrel:'#e8d8a0',body:'#2a4a8a',stock:'#f0e8d0',band:'#e8c25a',glow:'#ffe8a0'};if(typeof WA!=='undefined')WA.aurelrepeater=gunHeld('aurelrepeater');

/* ---- the story: three chapters with Marshal Kestrel, a retired lawkeeper who came back to Hearthvale ---- */
Object.assign(QNPC,{kestrel:{name:'Marshal Kestrel',zone:'town',tx:23.2,ty:27.4,col:'#6a4a2a',hair:'#d8d0c0'}});
NPC_KEY[QNPC.kestrel.name]='kestrel';
if(typeof NPC_TH!=='undefined')NPC_TH['Marshal Kestrel']='มาร์แชลเคสเตรล';if(typeof TH!=='undefined')TH['Marshal Kestrel']='มาร์แชลเคสเตรล';
if(typeof NPC_SHORT_TH!=='undefined')NPC_SHORT_TH.unshift(['Marshal Kestrel','มาร์แชลเคสเตรล'],['Kestrel','เคสเตรล']);
{const _gr=greeting;greeting=function(k){if(k==='kestrel')return JS_L('Keep your powder dry and your eyes open.','รักษาดินปืนให้แห้ง แล้วเปิดตาไว้');return _gr.apply(this,arguments);};}
const GS_STORY={
  gs1:{job:'gunslinger',name:'An Old Marshal',th:'มาร์แชลผู้เฒ่า',from:'corvin',to:'kestrel',lv:1,obj:[],reward:R1,
    offer:['An old friend of mine came back to town. Kestrel. She kept the roads safe when I was your age, with nothing but a pistol.','She is looking for someone with a steady hand. Go and see her by Travellers\' Green.'],
    offerTh:['เพื่อนเก่าของข้ากลับมาที่เมืองแล้ว ชื่อเคสเตรล นางรักษาความปลอดภัยของถนนตอนข้ายังอายุเท่าเจ้า ด้วยปืนพกกระบอกเดียว','นางกำลังหาคนที่มือนิ่ง ไปหานางที่ลานนักเดินทางสิ'],
    wait:'Marshal Kestrel is by Travellers\' Green in Hearthvale.',waitTh:'มาร์แชลเคสเตรลอยู่ที่ลานนักเดินทางในเฮิร์ธเวล',
    done:['So Corvin sent you. Good. He always did know who could shoot.','A gun is not a club. It asks for patience first, and speed after. Let\'s see if you have both.'],
    doneTh:['คอร์วินส่งเจ้ามาสินะ ดี เขารู้เสมอว่าใครยิงเป็น','ปืนไม่ใช่กระบอง มันต้องการความอดทนก่อน แล้วค่อยความเร็ว มาดูกันว่าเจ้ามีทั้งสองอย่างไหม']},
  gs2:{job:'gunslinger',name:'Powder and Steel',th:'ดินปืนกับเหล็กกล้า',from:'kestrel',to:'kestrel',lv:1,after:'gs1',reward:R2,
    obj:[{talk:'brannoc',text:'Ask Brannoc for a barrel',th:'ขอลำกล้องจากแบรนน็อค',line:'A barrel for Kestrel? I bored one for her thirty years ago. Here, a new one, true as a plumb line.',lineTh:'ลำกล้องให้เคสเตรลงั้นรึ? ข้าเจาะให้นางเมื่อสามสิบปีก่อน นี่ อันใหม่ ตรงเป๊ะเหมือนลูกดิ่ง'},
      {talk:'tobin',text:'Ask Tobin for black powder',th:'ขอดินปืนจากโทบิน',line:'Powder from the caravans, kept dry under the wagon seat. Mind you don\'t sneeze.',lineTh:'ดินปืนจากกองคาราวาน เก็บแห้งไว้ใต้ที่นั่งเกวียน ระวังอย่าจามล่ะ'},
      {spot:'target1',zone:'heights',dx:6,dy:-4,art:'dummy',seq:1,text:'Shoot the first target on Windwhistle Heights',th:'ยิงเป้าแรกที่ที่ราบสูงวินด์วิสเซิล',say:'Crack! Dead centre. The wind will pull your next shot, so lean into it.',sayTh:'ปัง! กลางเป้าพอดี ลมจะดึงนัดต่อไป ต้องเผื่อลมด้วย'},
      {spot:'target2',zone:'heights',dx:12,dy:2,art:'dummy',seq:2,text:'Shoot the far target, into the wind',th:'ยิงเป้าที่ไกลออกไป ต้านลม',say:'A little left of centre. Good enough to stop anything that bites.',sayTh:'เยื้องซ้ายจากกลางนิดหน่อย พอจะหยุดอะไรก็ตามที่กัดได้'}],
    offer:['A gun needs a true barrel and dry powder. Brannoc bores the best barrels; Tobin carries powder from the caravans.','Then show me your aim. I set up two targets on Windwhistle Heights, north of town.'],
    offerTh:['ปืนต้องมีลำกล้องที่ตรงและดินปืนที่แห้ง แบรนน็อคเจาะลำกล้องดีที่สุด โทบินมีดินปืนจากกองคาราวาน','แล้วแสดงฝีมือให้ข้าดู ข้าตั้งเป้าไว้สองอันบนที่ราบสูงวินด์วิสเซิล ทางเหนือของเมือง'],
    wait:'Ask Brannoc and Tobin, then shoot the two targets on Windwhistle Heights.',waitTh:'ถามแบรนน็อคและโทบิน แล้วยิงเป้าสองอันบนที่ราบสูงวินด์วิสเซิล',
    done:['Two targets, two holes. And you didn\'t flinch at the bang.','There\'s one more lesson, and it doesn\'t stand still.'],
    doneTh:['เป้าสองอัน รูสองรู และเจ้าไม่สะดุ้งตอนได้ยินเสียงปัง','ยังมีบทเรียนอีกบทหนึ่ง และมันไม่ยืนนิ่ง']},
  gs3:{job:'gunslinger',name:'High Noon',th:'เที่ยงวันเที่ยงตรง',from:'kestrel',to:'kestrel',lv:1,after:'gs2',reward:R3,grant:'gunslinger',
    obj:[{duel:'rook',zone:'farms',dx:10,dy:-6,art:'thief',hits:3,text:'Face Rook the Outlaw at Willowmere Farms',th:'เผชิญหน้ากับรุกจอมโจรที่ไร่วิลโลว์เมียร์',name:'Duel: Rook the Outlaw',nameTh:'ดวล: รุกจอมโจร',
      win:'Rook\'s pistol spins out of his hand. "Kestrel taught you. I can tell." He tips his hat and walks off into the reeds.',winTh:'ปืนของรุกหมุนหลุดจากมือ "เคสเตรลสอนเจ้ามาสินะ ข้าดูออก" เขาแตะปีกหมวกแล้วเดินหายเข้าไปในดงกก'}],
    offer:['Rook the Outlaw has been robbing the farm carts at Willowmere. He is fast. Faster than me, these days.','Meet him at noon. Draw when he draws, not before. Then come back and tell me.'],
    offerTh:['รุกจอมโจรปล้นเกวียนของไร่วิลโลว์เมียร์มาหลายวันแล้ว เขาเร็ว เร็วกว่าข้าในตอนนี้','ไปเจอเขาตอนเที่ยง ชักปืนเมื่อเขาชัก อย่าก่อน แล้วกลับมาบอกข้า'],
    wait:'Outdraw Rook the Outlaw at Willowmere Farms, then return to Marshal Kestrel.',waitTh:'ชักปืนให้เร็วกว่ารุกจอมโจรที่ไร่วิลโลว์เมียร์ แล้วกลับไปหามาร์แชลเคสเตรล',
    done:['You beat Rook. To the draw. Thirty years I\'ve waited to see that.','This was mine once. Now it is yours. Welcome, Gunslinger.'],
    doneTh:['เจ้าชนะรุก ชักปืนเร็วกว่าเขา ข้ารอเห็นแบบนี้มาสามสิบปี','นี่เคยเป็นของข้า ตอนนี้เป็นของเจ้าแล้ว ยินดีต้อนรับ กันสลิงเงอร์']}};
for(const [id,q] of Object.entries(GS_STORY)){if(TH_ON){q.name=q.th||q.name;q.offer=q.offerTh||q.offer;q.wait=q.waitTh||q.wait;q.done=q.doneTh||q.done;if(typeof TH_QNAMES!=='undefined')TH_QNAMES.add(q.name);}
  q.obj.forEach(o=>{if(o.spot||o.duel||o.talk){o.n=1;o.key=o.spot||o.duel||('talk:'+o.talk);}});JOB_STORY[id]=q;QUESTS[id]=q;}
if(typeof JS_FIRST!=='undefined'&&!JS_FIRST.includes('gs1'))JS_FIRST.push('gs1');
// ---- each skill's own effect (js/fxskills.js) ----
if(typeof SKILL_FX!=='undefined'){const GUN_FX={
  quickdraw:(l,t)=>{for(let i=0;i<2;i++){fxF({k:'streak',x0:P.x,y0:P.y-16,x:t.x,y:t.y,col:'#fff2b0',w:4,dur:.14,t0:now+i*.15});fxF({k:'flare',x:t.x,y:t.y,col:'#ffd27a',r:18,dur:.14,t0:now+.04+i*.15,h:fxSz(t)});}},
  piercinground:(l,t)=>{fxF({k:'reticle',x:t.x,y:t.y,col:'#c8d8ff',dur:.4,h:fxSz(t)});fxF({k:'streak',x0:P.x,y0:P.y-16,x:t.x,y:t.y,col:'#d8e8ff',w:7,dur:.22,t0:now+.1});fxF({k:'flare',x:t.x,y:t.y,col:'#ffffff',r:28,dur:.2,t0:now+.14,h:fxSz(t)});},
  scattershot:(l,x,y)=>{for(let i=0;i<7;i++){const a=i*.9;fxF({k:'streak',x0:P.x,y0:P.y-16,x:x+Math.cos(a)*50,y:y+Math.sin(a)*30,col:'#ffe0a0',w:3,dur:.16,t0:now+i*.02});}fxF({k:'ring',x,y,r:90,col:'#ffcf7a',dur:.4});},
  flareround:(l,t)=>{fxF({k:'streak',x0:P.x,y0:P.y-16,x:t.x,y:t.y,col:'#ff9a4a',w:6,dur:.2});fxF({k:'flare',x:t.x,y:t.y,col:'#ff7a3a',r:34,dur:.3,t0:now+.12,h:fxSz(t)});fxF({k:'motes',x:t.x,y:t.y,col:'#ffb04a',col2:'#ff5a1a',n:12,r:18,dur:1,t0:now+.15});},
  flashbang:(l,x,y)=>{fxF({k:'flare',x,y,col:'#ffffff',r:120,dur:.35,h:6});fxF({k:'ring',x,y,r:100,col:'#fff6c8',dur:.45});fxF({k:'motes',x,y,col:'#ffffff',col2:'#fff0a0',n:16,r:40,dur:.8,t0:now+.1});}};
  // the effect plays when the skill fires, like every other skill's (fxskills.js hooks its table in the same way)
  for(const [id,fxf] of Object.entries(GUN_FX)){SKILL_FX[id]=fxf;const sk=SKILLS[id];if(!sk||!sk.run)continue;const run=sk.run;sk.run=function(){try{fxf.apply(this,arguments);}catch(e){}return run.apply(this,arguments);};}}
