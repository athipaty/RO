"use strict";
/* ================= the Forgehand's master callings (v1.71.0) =================
     Runesmith   -> Forgemaster  white-hot steel: a molten core on a whole pack, a meteor of a hammer blow
     Coinbreaker -> Goldlord     a rain of gold coins, Midas' touch on every crit, a fortune's blade
   Four skills each, taken through Seer Valen's Trial of Ascension. Loaded after js/fightstyle3.js. */
const FH3_SK={
  // ---- Forgemaster
  moltencore:{name:'Molten Core',max:10,col:'#7ad8ff',g:'◉',sp:l=>46+l*4,cd:6,kind:'area',range:260,radius:140,
    desc:l=>`Pour white-hot steel on the spot: three waves, each ${80+l*13}% ATK (Fire) to all within 140px.`,
    run:(l,x,y)=>{for(let k=0;k<3;k++)setTimeout(()=>{if(!P||P.dead)return;shakeUntil=now+.15;fx.push({k:'ring',x,y,r:140,col:'#9ae8ff',t0:now,dur:.45});
      aoe(x,y,140,m=>dealPhys(m,.8+l*.13,{sure:true,el:'fire'}));},k*320);}},
  masterwork:{name:'Masterwork',max:10,col:'#c8e8ff',g:'❖',...PASSIVE(),desc:l=>`With an axe: +${l}% ATK and +${l*4} DEF.`},
  forgeheart:{name:'Forge Heart',max:10,col:'#bfe8ff',g:'♨',sp:l=>40,cd:40,kind:'self',
    desc:l=>`For 60s: +${l}% ATK, +${l*3} HIT and +${l*2}% attack speed.`,run:l=>buff('forgeheart','Forge Heart',60,{atkpct:l,hit:l*3,aspd:l*2})},
  meteorhammer:{name:'Meteor Hammer',max:10,col:'#ffffff',g:'☄',sp:l=>36+l*3,cd:3,kind:'target',range:80,
    desc:l=>`A blow like a falling star: ${260+l*40}% ATK, and ${64+l*10}% ATK (Fire) to all within 80px. Never misses.`,
    run:(l,t)=>{dealPhys(t,2.6+l*.4,{sure:true});const x=t.x,y=t.y;setTimeout(()=>{if(!P||P.dead)return;aoe(x,y,80,m=>{if(m!==t)dealPhys(m,.64+l*.1,{sure:true,el:'fire'});});},150);}},
  // ---- Goldlord
  goldrain:{name:'Gold Rain',max:10,col:'#ffd84a',g:'⁂',sp:l=>44+l*4,cd:6,kind:'area',range:260,radius:150,
    desc:l=>`Throw a fortune in the air (${50+l*10} gold): ${330+l*50}% ATK to all within 150px as it rains down. Without the gold, half as hard.`,
    run:(l,x,y)=>{const cost=50+l*10,paid=P.gold>=cost;if(paid)P.gold-=cost;setTimeout(()=>{if(!P||P.dead)return;fx.push({k:'ring',x,y,r:150,col:'#ffd84a',t0:now,dur:.5});
      aoe(x,y,150,m=>dealPhys(m,(3.3+l*.5)*(paid?1:.5),{sure:true}));},300);}},
  midastouch:{name:'Midas Touch',max:10,col:'#ffe68a',g:'✧',...PASSIVE(),desc:l=>`+${l*2} CRIT and +${l*4}% critical damage.`},
  royalhaul:{name:'Royal Haul',max:10,col:'#ffeaa0',g:'♛',sp:l=>36,cd:40,kind:'self',
    desc:l=>`For 40s: +${l*4}% attack speed, +${l*3} FLEE and +${l*3}% ATK.`,run:l=>buff('royalhaul','Royal Haul',40,{aspd:l*4,flee:l*3,atkpct:l*3})},
  fortuneblade:{name:'Fortune\'s Blade',max:10,col:'#fff2b0',g:'✪',sp:l=>30+l*3,cd:2,kind:'target',range:80,
    desc:l=>`${400+l*60}% ATK plus 2% per LUK, with ${20+l*3}% more critical chance. Never misses.`,
    run:(l,t)=>dealPhys(t,4+l*.6+S.luk*.02,{sure:true,critPlus:20+l*3})}};
Object.assign(SKILLS,FH3_SK);
Object.assign(SKILL_REQ,{masterwork:{moltencore:1},forgeheart:{masterwork:3},meteorhammer:{moltencore:3},midastouch:{goldrain:1},royalhaul:{midastouch:3},fortuneblade:{goldrain:3}});
Object.assign(SKILL_ELEM,{moltencore:'fire'});
{const _pbF3=passiveB;passiveB=function(){const b=_pbF3.apply(this,arguments);if(!P||!P.skills)return b;const L=id=>P.skills[id]||0,add=(k,v)=>{if(v)b[k]=(b[k]||0)+v;};
  if(isAxe()){add('atkpct',L('masterwork'));add('def',L('masterwork')*4);}add('crit',L('midastouch')*2);add('critdmg',L('midastouch')*4);return b;};}
const FH3={
  forgemaster:{from:'runesmith',name:'Forgemaster',hp:2.0,sp:1.35,aspd:.9,col:'#2a3a4a',acc:'#9ae8ff',
    desc:'Works steel past red-hot to white. A molten core on a whole pack, and a hammer blow like a falling star.',skills:['moltencore','masterwork','forgeheart','meteorhammer']},
  goldlord:{from:'coinbreaker',name:'Goldlord',hp:1.85,sp:1.35,aspd:.86,col:'#4a1a5a',acc:'#ffd84a',
    desc:'So rich it hurts. A rain of gold on the crowd, Midas\' touch on every crit, and a fortune\'s blade.',skills:['goldrain','midastouch','royalhaul','fortuneblade']}};
for(const id in FH3){const j=FH3[id],p=CLASSES[j.from],b=CLASSES[p.base];JOB3[id]=j;
  CLASSES[id]={name:j.name,hp:j.hp,sp:j.sp,aspd:j.aspd,weapons:b.weapons,col:j.col,hair:b.hair,magic:b.magic,base:p.base,parent:j.from,tier:3,acc:j.acc,
    desc:j.desc,own:j.skills,skills:[...p.skills.filter(s=>s!=='firstaid'),...j.skills,'firstaid']};}
// Seer Valen's Trial of Ascension for a Forgehand's line
TRIALS3.forgehand={mob:'iceimp',need:40,item:'shard',items:15};
const SKILL_FX_FH3={
  moltencore:(l,x,y)=>{fxF({k:'quake',x,y,r:140,col:'#1a2a3a',glow:'#9ae8ff',dur:1.1});fxF({k:'icicles',x,y,col:'#e8faff',r:140,n:10,dur:.6});fxF({k:'halo',x,y,col:'#9ae8ff',dur:.8});},
  forgeheart:l=>{fxF({k:'vortex',x:P.x,y:P.y,o:P,col:'#9ae8ff',col2:'#1a2a3a',r:44,imp:true,dur:.7});fxF({k:'halo',x:P.x,y:P.y,o:P,col:'#bfe8ff',dur:1.2});},
  meteorhammer:(l,t)=>{fxF({k:'streak',x0:t.x+40,y0:t.y-220,x:t.x,y:t.y,col:'#ffffff',w:9,dur:.2});fxF({k:'flare',x:t.x,y:t.y,col:'#9ae8ff',r:80,dur:.4,t0:now+.15,h:fxSz(t)});fxF({k:'quake',x:t.x,y:t.y,r:80,col:'#1a2a3a',glow:'#9ae8ff',dur:.5,t0:now+.15});},
  goldrain:(l,x,y)=>{fxF({k:'motes',x,y,col:'#ffd84a',col2:'#fff6c8',shape:'star',n:30,r:140,dur:1.2});fxF({k:'rune',x,y,col:'#ffd84a',g:'¤',r:40,dur:.8});fxF({k:'crescent',x,y,ang:0,r:80,w:10,col:'#ffe68a',dur:.5,h:6,t0:now+.3});},
  royalhaul:l=>{fxF({k:'icicles',x:P.x,y:P.y,col:'#ffd84a',r:60,n:8,dur:.5});fxF({k:'vortex',x:P.x,y:P.y,o:P,col:'#c070ff',col2:'#2a1236',r:40,imp:true,dur:.6});fxF({k:'crescent',x:P.x,y:P.y,ang:0,r:44,w:6,col:'#ffd84a',dur:.4,h:12});},
  fortuneblade:(l,t)=>{fxF({k:'claws',x:t.x,y:t.y,ang:.3,r:34,col:'#fff2b0',dur:.3,h:fxSz(t)});fxF({k:'reticle',x:t.x,y:t.y,col:'#ffd84a',dur:.4,h:fxSz(t)});fxF({k:'halo',x:t.x,y:t.y,col:'#fff2b0',dur:.6});}};
if(typeof SKILL_FX!=='undefined')for(const id in SKILL_FX_FH3){const sk=SKILLS[id];if(!sk||!sk.run||SKILL_FX[id])continue;SKILL_FX[id]=SKILL_FX_FH3[id];const run=sk.run,fxf=SKILL_FX_FH3[id];
  sk.run=function(){try{fxf.apply(this,arguments);}catch(e){}return run.apply(this,arguments);};}
if(typeof HERO2_DRESS!=='undefined'&&HERO2_DRESS.forgehand)Object.assign(HERO2_DRESS,{forgemaster:{...HERO2_DRESS.forgehand,trim:'#9ae8ff'},goldlord:{...HERO2_DRESS.forgehand,trim:'#ffd84a'}});
if(typeof CAST_COL!=='undefined')Object.assign(CAST_COL,{forgemaster:'#9ae8ff',goldlord:'#ffd84a'});
if(typeof SIT_POSE!=='undefined'&&SIT_POSE.runesmith)Object.assign(SIT_POSE,{forgemaster:{...SIT_POSE.runesmith,master:true},goldlord:{...SIT_POSE.coinbreaker,master:true}});
if(typeof FS_STYLES!=='undefined'&&FS_STYLES.forgehand){const G=FS_STYLES.forgehand;
  FS_STYLES.forgemaster={...G,cast:['flame','#9ae8ff'],ring:'spike',melee:FS_HIT.war||G.melee,fin:{n:'White Heat',f:t=>{if(typeof hitStop==='function')hitStop(.14);shakeUntil=now+.35;
    fxF({k:'flare',x:t.x,y:t.y,col:'#e8faff',r:100,dur:.45,h:fsH(t)});fxF({k:'quake',x:t.x,y:t.y,r:110,col:'#1a2a3a',glow:'#9ae8ff',dur:.8,t0:now+.1});fxF({k:'motes',x:t.x,y:t.y,col:'#ffffff',col2:'#7ad8ff',n:22,r:70,dur:1,t0:now+.15});}}};
  FS_STYLES.goldlord={...G,cast:['sparks','#ffe68a'],ring:'star',melee:FS_HIT.slash?FS_HIT.slash('#ffd84a'):G.melee,fin:{n:'King\'s Ransom',f:t=>{if(typeof hitStop==='function')hitStop(.12);
    for(let i=0;i<12;i++){const a=i*Math.PI/6;fxF({k:'streak',x0:t.x+Math.cos(a)*80,y0:t.y+Math.sin(a)*40,x:t.x,y:t.y,col:i%2?'#ffd84a':'#c070ff',w:4,dur:.2,t0:now+i*.04});}
    fxF({k:'motes',x:t.x,y:t.y,col:'#ffe68a',col2:'#ffffff',shape:'star',n:20,r:50,dur:1,t0:now+.5});}}};}
if(typeof TH!=='undefined'){Object.assign(TH,{'Forgemaster':'ฟอร์จมาสเตอร์','Goldlord':'โกลด์ลอร์ด','Forge Heart':'หัวใจเตาหลอม','Royal Haul':'ทรัพย์หลวง',
  'Works steel past red-hot to white. A molten core on a whole pack, and a hammer blow like a falling star.':'ตีเหล็กจนร้อนเกินแดงจนกลายเป็นขาว แกนหลอมเหลวถล่มทั้งฝูง และค้อนที่ฟาดลงมาดั่งดาวตก',
  'So rich it hurts. A rain of gold on the crowd, Midas\' touch on every crit, and a fortune\'s blade.':'รวยจนเจ็บ ฝนทองโปรยใส่ฝูงศัตรู สัมผัสไมดาสในทุกคริติคอล และคมดาบแห่งโชคลาภ'});
  for(const [n,th] of [['White Heat','ความร้อนขาว'],['King\'s Ransom','ค่าไถ่ราชา'],['Hammerfall','ค้อนถล่ม'],['Runic Inferno','นรกรูน'],['Paid in Full','จ่ายครบจบ']]){TH[n]=th;TH[n+'!']=th+'!';}}
// ---- the build guide: one build per route, first job -> advanced -> master calling ----
if(typeof BUILDS!=='undefined'){
  const FHB=[
    {id:'emberforge',job:'forgehand',name:'Emberforge',th:'เตาเพลิง',tag:'STR/VIT fire smith',route:['forgehand','runesmith','forgemaster'],stats:{str:5,vit:3,dex:1},
      desc:'Hits hard and stands firm; Anvil Drop and Ember Wave burn crowds, Molten Core and Meteor Hammer finish them.',
      skills:[['hew',10],['forgefire',10],['axemastery',10],['anvildrop',10],['runecleave',10],['runebrand',10],['emberwave',10],['temperedge',5],['hammerquake',5],['moltencore',10],['masterwork',10],['meteorhammer',10],['forgeheart',5]],
      gear:['axe'],sigils:['emberimp','cactoid','dunetyrant'],awaken:['atkpct','hppct']},
    {id:'fortune',job:'forgehand',name:'Fortune Hunter',th:'นักล่าโชคลาภ',tag:'STR/LUK gold and crits',route:['forgehand','coinbreaker','goldlord'],stats:{str:4,luk:4,agi:1},
      desc:'Turns gold and luck into damage; Coin Strike and Jackpot hit hard, Gold Rain and Fortune\'s Blade end fights.',
      skills:[['hew',10],['widechop',10],['ironback',5],['luckycoin',10],['coinstrike',10],['goldenguard',10],['bigdeal',5],['jackpot',10],['cartcrash',5],['goldrain',10],['midastouch',10],['fortuneblade',10],['royalhaul',5]],
      gear:['axe'],sigils:['hopper','greylupe','lupealpha'],awaken:['crit','critdmg']}];
  for(const b of FHB)if(!BUILDS.some(x=>x.id===b.id))BUILDS.push(b);
  if(typeof pathPlanBuild==='function')for(const b of BUILDS)if(b.job==='forgehand')pathPlanBuild(b);}
