"use strict";
/* ================= the Gunslinger leaves, the Forgehand arrives (v1.71.0) =================
   Every gun became an axe with the same id (old saves keep their items, now axes of the same strength, STR instead of
   DEX), and a hero on a Gunslinger calling moves to the Forgehand's:
     Gunslinger -> Forgehand, Pyro Gunner -> Runesmith, Sniper and Trickshot -> Coinbreaker,
     Blastmaster -> Forgemaster, Longshot and Desperado -> Goldlord.
   Skills the new calling does not have are taken back and their points returned; the story's progress carries over
   (gs1-gs3 become fh1-fh3); a followed Gunslinger build becomes the matching Forgehand one. Other players still on an
   old calling are shown as the new one. Loaded late (after js/tiers.js, js/bossgear.js and js/jobtrim.js). */
// ---- guns become axes ----
const GUN_TO_AXE={pistol:'Hand Hatchet',longrifle:'Bearded Axe',aurelrepeater:'Aurel Cleaver',steelgun:'Steel Cleaver',krakenmaw:'Krakenmaw',
  bonemusket:'Bonecrack Axe',quartzrifle:'Quartzedge Axe',tidecarbine:'Tideshell Axe',pyrecannon:'Pyre Greataxe',galegun:'Gale Hatchet'};
// the three old gun tiers (js/tiers.js) by their names
const GUN_NAME_TO_AXE={'Stormsteel Carbine':'Stormsteel Cleaver','Starforged Musket':'Starforged Waraxe','Sunfire Handcannon':'Sunfire Greataxe'};
Object.assign(ITEMS,{
  pistol:{name:'Hand Hatchet',type:'weapon',wt:'gun',atk:28,price:600,lv:1,slots:1,col:'#8a7a6a',g:'W'},
  longrifle:{name:'Bearded Axe',type:'weapon',wt:'gun',atk:84,price:3800,lv:25,slots:1,col:'#7a5a3a',g:'W'},
  aurelrepeater:{name:'Aurel Cleaver',type:'weapon',wt:'gun',atk:132,price:24000,lv:45,slots:1,col:'#e8d8a0',g:'W'}});
for(const [id,it] of Object.entries(ITEMS)){if(!it||it.wt!=='gun')continue;
  it.wt='axe';delete it.rng;it.name=GUN_TO_AXE[id]||GUN_NAME_TO_AXE[it.name]||it.name.replace(/Carbine|Musket|Rifle|Pistol|Repeater|Handcannon|Hand-cannon|Gun/g,'Axe');
  if(it.b&&it.b.dex){it.b={...it.b,str:(it.b.str||0)+it.b.dex};delete it.b.dex;}
  if(typeof it.desc==='string')it.desc=it.desc.replace(/DEX/g,'STR');
  if(typeof WA!=='undefined'&&typeof waAxe==='function'){const c=it.col||'#c8ccd4',big=(it.atk||0)>=150;WA[id]=()=>waAxe({head:c,haft:'#6a4a2a',double:big,len:big?26:24,crack:big?'#ffd08a':null});}}
if(typeof WEAPON_W!=='undefined'&&WEAPON_W.gun)delete WEAPON_W.gun;
// no gun anywhere for sale or as a build's gear
if(typeof SHOP!=='undefined')for(const id of ['pistol','longrifle'])while(SHOP.includes(id))SHOP.splice(SHOP.indexOf(id),1);
if(typeof ROYAL_SHOP!=='undefined'){const i=ROYAL_SHOP.indexOf('aurelrepeater');if(i>=0)ROYAL_SHOP.splice(i,1);}
if(typeof TH!=='undefined')Object.assign(TH,{'Hand Hatchet':'ขวานด้ามสั้น','Bearded Axe':'ขวานเครา','Aurel Cleaver':'มีดสับออเรล','Steel Cleaver':'มีดสับเหล็กกล้า',
  'Bonecrack Axe':'ขวานกระดูกร้าว','Quartzedge Axe':'ขวานคมควอตซ์','Tideshell Axe':'ขวานเปลือกกระแสน้ำ','Pyre Greataxe':'ขวานใหญ่กองไฟ','Gale Hatchet':'ขวานลมกรด',
  'Stormsteel Cleaver':'มีดสับเหล็กพายุ','Starforged Waraxe':'ขวานศึกตีจากดาว','Sunfire Greataxe':'ขวานใหญ่เปลวตะวัน'});
// ---- heroes on a Gunslinger calling move over ----
const GUN_RETIRE={gunslinger:'forgehand',pyrogunner:'runesmith',sniper:'coinbreaker',trickshot:'coinbreaker',blastmaster:'forgemaster',longshot:'goldlord',desperado:'goldlord'};
const GUN_NAMES={gunslinger:'Gunslinger',pyrogunner:'Pyro Gunner',sniper:'Sniper',trickshot:'Trickshot',blastmaster:'Blastmaster',longshot:'Longshot',desperado:'Desperado'};
const GUN_BUILD={deadeye:'fortune',firebrand:'emberforge',quickshot:'fortune'};
function gunMigrateHero(){if(!P)return false;let moved=false;
  // the story's progress
  try{const q=QS();for(const [a,b] of [['gs1','fh1'],['gs2','fh2'],['gs3','fh3']]){const i=q.done.indexOf(a);if(i>=0){q.done[i]=b;moved=true;}if(q.active[a]){q.active[b]=q.active[a];delete q.active[a];moved=true;}}}catch(e){}
  if(P.build&&GUN_BUILD[P.build]){P.build=GUN_BUILD[P.build];moved=true;}
  const to=GUN_RETIRE[P.cls];if(!to||!CLASSES[to])return moved;
  const from=P.cls,ok=new Set(CLASSES[to].skills||[]);let back=0;
  for(const k of Object.keys(P.skills||{}))if(!ok.has(k)){back+=P.skills[k]||0;delete P.skills[k];}
  P.cls=to;P.skillPts=(P.skillPts||0)+back;
  const keep=e=>e&&e.s&&!ok.has(e.s)?null:e;if(Array.isArray(P.bar))P.bar=P.bar.map(keep);if(Array.isArray(P.bars))P.bars=P.bars.map(r=>Array.isArray(r)?r.map(keep):r);
  if(typeof rebuildHotbar==='function')rebuildHotbar();S=computeStats();P.hp=Math.min(P.hp,S.maxhp);P.sp=Math.min(P.sp,S.maxsp);
  const th=typeof LANG!=='undefined'&&LANG==='th',nm=CLASSES[to].name;
  addLog(th?`อาชีพ ${GUN_NAMES[from]} ถูกแทนที่ด้วย ${nm} แล้ว ตอนนี้คุณเป็น ${nm} ได้แต้มสกิลคืน ${back} แต้ม และปืนของคุณกลายเป็นขวาน`:
    `The ${GUN_NAMES[from]} calling is gone: you are a ${nm} now, with ${back} skill point${back===1?'':'s'} back to spend, and your guns are axes.`,'l-rare');
  return true;}
{const _swG=startWith;startWith=function(){const r=_swG.apply(this,arguments);try{if(gunMigrateHero()&&typeof save==='function')save(true);}catch(e){}return r;};}
{const _inG=ingest;ingest=function(p){const r=_inG.apply(this,arguments);try{const o=NET.others.get(p&&p.peer);if(o&&GUN_RETIRE[o.cls])o.cls=GUN_RETIRE[o.cls];}catch(e){}return r;};}
// ---- Thai skill names and descriptions for the Forgehand family ({0}, {1}... are the English line's numbers in order) ----
if(typeof SKILL_TH!=='undefined')Object.assign(SKILL_TH,{
  hew:['ฟันหนัก','ฟันอย่างหนักหน่วง {0}% ATK โอกาสคริติคอลเพิ่ม {1}%'],
  widechop:['ฟันกว้าง','เหวี่ยงขวานเป็นวงกว้าง: {0}% ATK ใส่มอนสเตอร์ทุกตัวในระยะ {1}px รอบตัว'],
  anvildrop:['ทุ่มทั่ง','ทั่งตีเหล็กหล่นลงที่จุดนั้น: {0}% ATK ใส่ทุกตัวในระยะ {1}px และมีโอกาส {2}% ทำให้มึนงง {3} วินาที'],
  forgefire:['ไฟเตาหลอม','เผาคมขวานด้วยไฟเตาหลอม {0} วินาที: ATK +{1}% และ HIT +{2}'],
  axemastery:['ความชำนาญขวาน','เมื่อถือขวาน: ATK +{0} และ HIT +{1}'],
  ironback:['หลังเหล็ก','หลายปีที่หน้าทั่ง: DEF +{0} และ Max HP +{1}'],
  luckycoin:['เหรียญนำโชค','เหรียญในรองเท้า: CRIT +{0} และ FLEE +{1}'],
  runecleave:['ฟันรูน','รูนลุกไหม้บนคมขวาน: {0}% ATK (ไฟ) แล้วรูนระเบิด {1}% ATK (ไฟ) ใส่ทุกตัวในระยะ {2}px'],
  emberwave:['คลื่นถ่านเพลิง','ฟาดพื้นส่งถ่านเพลิงกลิ้งออกไป: {0}% ATK (ไฟ) ใส่ทุกตัวในระยะ {1}px รอบจุดนั้น สามครั้ง'],
  hammerquake:['ค้อนแผ่นดินไหว','ทุบพื้น: {0}% ATK ใส่ทุกตัวในระยะ {1}px รอบตัว และมีโอกาส {2}% ทำให้มึนงง {3} วินาที'],
  runebrand:['ตรารูน','เมื่อถือขวาน: ATK +{0}% และ DEF +{1}'],
  temperedge:['คมผ่านการชุบ','{0} วินาที: ATK +{1}% และ CRIT +{2}'],
  coinstrike:['ฟาดเหรียญ','จ่าย {0} ทองเพื่อการฟาดที่คุ้มค่า: {1}% ATK ถ้าไม่มีทอง แรงลดลงครึ่งหนึ่ง'],
  cartcrash:['เกวียนชน','ขับเกวียนพุ่งชนฝูงศัตรู: {0}% ATK ใส่ทุกตัวในระยะ {1}px รอบตัว'],
  jackpot:['แจ็กพอต','เสี่ยงดวง: ตั้งแต่ {0}% ถึง {1}% ATK ไม่มีวันพลาด'],
  goldenguard:['เกราะทองคำ','DEF +{0} และ FLEE +{1}'],
  bigdeal:['ดีลใหญ่','{0} วินาที: ความเร็วโจมตี +{1}% และ CRIT +{2}'],
  moltencore:['แกนหลอมเหลว','เทเหล็กร้อนขาวลงที่จุดนั้น: สามระลอก ระลอกละ {0}% ATK (ไฟ) ใส่ทุกตัวในระยะ {1}px'],
  masterwork:['งานชั้นครู','เมื่อถือขวาน: ATK +{0}% และ DEF +{1}'],
  forgeheart:['หัวใจเตาหลอม','{0} วินาที: ATK +{1}%, HIT +{2} และความเร็วโจมตี +{3}%'],
  meteorhammer:['ค้อนอุกกาบาต','ฟาดดั่งดาวตก: {0}% ATK และ {1}% ATK (ไฟ) ใส่ทุกตัวในระยะ {2}px ไม่มีวันพลาด'],
  goldrain:['ฝนทอง','โปรยทรัพย์สมบัติขึ้นฟ้า ({0} ทอง): {1}% ATK ใส่ทุกตัวในระยะ {2}px เมื่อมันตกลงมา ถ้าไม่มีทอง แรงลดลงครึ่งหนึ่ง'],
  midastouch:['สัมผัสไมดาส','CRIT +{0} และความแรงคริติคอล +{1}%'],
  royalhaul:['ทรัพย์หลวง','{0} วินาที: ความเร็วโจมตี +{1}%, FLEE +{2} และ ATK +{3}%'],
  fortuneblade:['คมดาบแห่งโชค','{0}% ATK บวก {1}% ต่อ LUK โอกาสคริติคอลเพิ่ม {2}% ไม่มีวันพลาด']});
if(typeof JS_ROLE!=='undefined')Object.assign(JS_ROLE,{forgemaster:['Fire waves · huge blows','คลื่นไฟ · ฟาดมหาศาล'],goldlord:['Gold rain · crits','ฝนทอง · คริติคอล']});
// the Forgehand's starter axe has its own small look in the hand
if(typeof WA!=='undefined'&&typeof waAxe==='function')WA.handaxe=()=>waAxe({len:19,head:'#c8b8a0',haft:'#8a5a32'});
// the Kraken's relic, an axe now, stays clearly above the shop axes of its level (it was compared with guns before)
if(ITEMS.krakenmaw&&(ITEMS.krakenmaw.atk||0)<320)ITEMS.krakenmaw.atk=320;
