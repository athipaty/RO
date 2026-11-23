"use strict";
/* ================= daily quests: new ones every day (v1.48.0) =================
   The four fixed dailies (Meadow Patrol, Restock the Store, Dune Sweep, the Gloomcap King) were the same every day and
   stopped at the dunes. Now Elder Hollis, by the fountain in Hearthvale, hands out five new dailies each day, picked at
   random for your level (one stop; the shopkeepers and other services still open straight away when tapped):
     hunt     defeat N of one monster near your level
     pair     defeat some of two monsters that live in the same region
     gather   bring N of a monster's loot (taken when you hand it in)
     boss     defeat a region boss near your level (from Lv 12)
   One of the five is a ★ lucky quest: double gold and a refining stone on top. Rewards follow the monsters (EXP, gold
   and tonics for your level). The picks are the same all day for one hero; if you gain 8 levels before taking them,
   the untaken ones are picked again for your new level. Quests you took and did not finish stay until you finish or
   abandon them. */
const DQ_N=5,DQ_GIVERS=['hollis'];
// the old fixed dailies are gone (anyone who had one taken simply loses it from the log; QS() drops unknown quests)
for(const id of ['d_patrol','d_restock','d_deep','d_sweep'])delete QUESTS[id];
const dqTH=()=>typeof LANG!=='undefined'&&LANG==='th';
const dqPlural=s=>/(s|x|ch|sh)$/i.test(s)?s+'es':/[^aeiou]y$/i.test(s)?s.slice(0,-1)+'ies':s+'s';
const dqMobName=(id,n)=>{const m=MOBS[id].name;return n>1&&!dqTH()?dqPlural(m):m;};
const dqZoneOf=id=>Object.keys(ZONES).find(z=>!ZONES[z].safe&&(ZONES[z].mobs||[]).some(m=>m[0]===id));
function dqRand(seed){let h=2166136261;for(const c of seed)h=Math.imul(h^c.charCodeAt(0),16777619);
  return ()=>{h=Math.imul(h^(h>>>15),2246822507);h=Math.imul(h^(h>>>13),3266489909);return ((h^=h>>>16)>>>0)/4294967296;};}
// monsters to ask for: regular ones within 6 levels (at least the 8 nearest), from regions you can walk to
function dqPool(lv){const all=Object.values(MOBS).filter(m=>!m.boss&&!m.world&&dqZoneOf(m.id)).map(m=>({m,d:Math.abs(m.lv-lv)})).sort((a,b)=>a.d-b.d);
  const near=all.filter(x=>x.d<=6);return (near.length>=8?near:all.slice(0,8)).map(x=>x.m);}
function dqBosses(lv){return Object.values(MOBS).filter(m=>m.boss&&!m.world&&dqZoneOf(m.id)&&m.lv>=lv-6&&m.lv<=lv+8);}
const dqTonics=lv=>lv<25?[['red',8],['orange',2]]:lv<45?[['orange',5],['blue',2]]:lv<70?[['orange',8],['blue',4]]:[['crimson',5],['azure',3]];
// one quest's recipe (kept in the save so it reads the same after a reload)
function dqMake(R,lv,used){const pick=a=>a[Math.floor(R()*a.length)],pool=dqPool(lv),roll=R();
  const fresh=()=>{let m=pick(pool),t=0;while(used.has(m.id)&&t++<10)m=pick(pool);used.add(m.id);return m;};
  const nKill=m=>Math.round((m.lv>=60?14:m.lv>=30?16:m.lv>=14?18:20)*(.8+R()*.5));
  if(roll<.14&&lv>=12){const bs=dqBosses(lv);if(bs.length){const b=pick(bs);return {k:'boss',mob:b.id};}}
  if(roll<.42){const m=fresh(),drops=(m.drops||[]).filter(([id,ch])=>ITEMS[id]&&ITEMS[id].type==='etc'&&ch>=.15);
    if(drops.length){const [it,ch]=pick(drops);return {k:'gather',mob:m.id,item:it,n:Math.max(4,Math.round(Math.min(10,6/ch*.45)*(.8+R()*.4)))};}
    return {k:'hunt',mob:m.id,n:nKill(m)};}
  if(roll<.62){const a=fresh(),z=dqZoneOf(a.id),mates=pool.filter(m=>m!==a&&dqZoneOf(m.id)===z&&!used.has(m.id));
    if(mates.length){const b=pick(mates);used.add(b.id);return {k:'pair',mob:a.id,n:Math.round(nKill(a)*.6),mob2:b.id,n2:Math.round(nKill(b)*.6)};}
    return {k:'hunt',mob:a.id,n:nKill(a)};}
  const m=fresh();return {k:'hunt',mob:m.id,n:nKill(m)};}
// the words: a few ways to say each kind, in English and Thai
const DQ_TXT={
  hunt:{en:{name:['Thin the {M}','{M} Hunt','Too Many {M}'],offer:[['{M} are crowding the paths in {Z} again.','Bring down {n} of them and I will make it worth your while.'],['Travellers keep coming back from {Z} with bites and bruises. It is the {M}.','{n} of them should calm things down.'],['I need someone with a strong arm. {Z} is crawling with {M}.','Put down {n}. Come back to me when it is done.']],
      wait:'Defeat {n} {M} in {Z}.'},
    th:{name:['ลดจำนวน {M}','ล่า {M}','{M} มากเกินไป'],offer:[['{M} ออกมาเต็มทางเดินใน {Z} อีกแล้ว','กำจัดมัน {n} ตัว แล้วข้าจะตอบแทนอย่างงาม'],['นักเดินทางกลับมาจาก {Z} พร้อมแผลเต็มตัว ฝีมือพวก {M} ทั้งนั้น','จัดการสัก {n} ตัวน่าจะสงบลง'],['ข้าต้องการคนแขนแข็ง {Z} มี {M} เต็มไปหมด','กำจัด {n} ตัว เสร็จแล้วกลับมาหาข้า']],
      wait:'ปราบ {M} {n} ตัวใน {Z}'}},
  pair:{en:{name:['Trouble in {Z}','A Mixed Hunt','Clear the Road to {Z}'],offer:[['Two kinds of trouble in {Z}: {M} and {M2}.','{n} {M} and {n2} {M2}, and the road is safe again.'],['The scouts counted {M} and {M2} near {Z}. Far too many.','Bring down {n} {M} and {n2} {M2}.']],
      wait:'{n} {M} and {n2} {M2} in {Z}.'},
    th:{name:['ปัญหาใน {Z}','การล่าสองเป้าหมาย','เปิดทางสู่ {Z}'],offer:[['ใน {Z} มีปัญหาสองอย่าง: {M} กับ {M2}','{M} {n} ตัว และ {M2} {n2} ตัว แล้วถนนจะปลอดภัย'],['หน่วยสอดแนมนับ {M} กับ {M2} ได้เยอะเกินไปแถว {Z}','ปราบ {M} {n} ตัว และ {M2} {n2} ตัว']],
      wait:'{M} {n} ตัว และ {M2} {n2} ตัวใน {Z}'}},
  gather:{en:{name:['{I} Wanted','A Bundle of {I}','Supplies: {I}'],offer:[['I am short of {I}. The {M} in {Z} carry it.','Bring me {n} and I pay better than the market.'],['An order came in for {I}, and my shelves are empty.','The {M} of {Z} drop it. {n} will do.'],['Could you fetch me {n} {I}? You will find it on the {M} in {Z}.']],
      wait:'Bring {n} {I} (from {M} in {Z}).'},
    th:{name:['ต้องการ {I}','{I} หนึ่งมัด','เสบียง: {I}'],offer:[['ข้าขาด {I} พวก {M} ใน {Z} มีอยู่','เอามาให้ข้า {n} ชิ้น ข้าให้ราคาดีกว่าตลาด'],['มีคนสั่ง {I} มา แต่ชั้นวางของข้าว่างเปล่า','{M} ใน {Z} ทำตก {n} ชิ้นก็พอ'],['ช่วยหา {I} มาให้ข้า {n} ชิ้นได้ไหม หาได้จาก {M} ใน {Z}']],
      wait:'นำ {I} {n} ชิ้นมา (จาก {M} ใน {Z})'}},
  boss:{en:{name:['Fell the {M}','The {M} Stirs','A Bounty on the {M}'],offer:[['The {M} has woken in {Z}. Everyone can feel it.','Cut it down. Bring friends if you must.'],['There is a price on the head of the {M}, the terror of {Z}.','Bring it down and the purse is yours.']],
      wait:'Defeat the {M} in {Z}.'},
    th:{name:['โค่น {M}','{M} ตื่นแล้ว','ค่าหัว {M}'],offer:[['{M} ตื่นขึ้นใน {Z} ทุกคนรู้สึกได้','จัดการมันซะ พาเพื่อนไปด้วยถ้าจำเป็น'],['มีค่าหัวสำหรับ {M} ผู้สร้างความหวาดกลัวใน {Z}','ปราบมันได้ เงินรางวัลเป็นของเจ้า']],
      wait:'ปราบ {M} ใน {Z}'}}};
const DQ_DONE={en:['Good work. There will be more tomorrow.','Just what I needed. Take this.','You are worth every coin. Same time tomorrow?','Thank you. Hearthvale is lucky to have you.'],
  th:['ทำได้ดี พรุ่งนี้ยังมีงานอีก','ตรงกับที่ข้าต้องการเลย รับนี่ไป','เจ้าคุ้มค่าทุกเหรียญ พรุ่งนี้มาอีกนะ','ขอบใจ Hearthvale โชคดีที่มีเจ้า']};
// build the QUESTS entry from a recipe
function dqBuild(id,x){const th=dqTH(),L=th?'th':'en',T=DQ_TXT[x.k][L],R=dqRand(id+x.k+(x.mob||''));const pick=a=>a[Math.floor(R()*a.length)];
  const z=dqZoneOf(x.mob),Z=z?ZONES[z].name:'',m=MOBS[x.mob],m2=x.mob2&&MOBS[x.mob2];
  const fill=s=>s.replace(/\{M2\}/g,m2?dqMobName(x.mob2,x.n2):'').replace(/\{M\}/g,x.k==='boss'?m.name:dqMobName(x.mob,x.k==='gather'?2:x.n||2)).replace(/\{Z\}/g,Z)
    .replace(/\{I\}/g,x.item?ITEMS[x.item].name:'').replace(/\{n2\}/g,x.n2||'').replace(/\{n\}/g,x.n||1);
  const obj=x.k==='boss'?[{kill:x.mob,n:1}]:x.k==='gather'?[{item:x.item,n:x.n}]:x.k==='pair'?[{kill:x.mob,n:x.n},{kill:x.mob2,n:x.n2}]:[{kill:x.mob,n:x.n}];
  // reward: 40% of a level at the monster's level (a boss 60%), on top of what the kills give; job EXP in the monster's ratio
  const kills=x.k==='boss'?0:x.k==='gather'?Math.round(x.n*2.5):x.k==='pair'?x.n+x.n2:x.n;
  const ex=expNeed(m.lv)*(x.k==='boss'?.6:.4),jx=ex*m.jexp/Math.max(1,m.exp);
  let gold=Math.round((x.k==='boss'?m.lv*250:m.lv*Math.max(kills,8)*12)/10)*10,items=dqTonics(m.lv).map(a=>[...a]);
  if(x.lucky){gold*=2;items.push([m.lv>=40?'emberore':'glintstone',m.lv>=60?2:1]);}
  const name=(th?'ประจำวัน: ':'Daily: ')+(x.lucky?'★ ':'')+fill(pick(T.name));
  return {name,daily:true,dq:1,from:x.giver,to:x.giver,lv:1,obj,offer:pick(T.offer).map(fill),wait:fill(T.wait),done:[pick(DQ_DONE[L])],
    reward:{exp:Math.round(ex),jexp:Math.round(jx),gold,items}};}
// make sure today's five exist (cheap when nothing changed: called from QS())
let dqKey='',dqFast=null;
function dqEnsure(){if(!P)return;
  // fast path (the '!' marks over NPC heads ask every frame): same hero, same day, same level, same list
  const t=performance.now();if(dqFast&&dqFast.p===P&&dqFast.ref===(P.qs&&P.qs.dq)&&dqFast.lv===P.lv&&t-dqFast.t<5000)return;if(!P.qs||typeof P.qs!=='object')P.qs={};const q=P.qs;if(!q.active||typeof q.active!=='object')q.active={};
  if(!q.daily||typeof q.daily!=='object')q.daily={};
  let g=q.dq;const day=today();
  const stale=!g||typeof g!=='object'||g.day!==day||!g.list;
  const untaken=g&&g.list?Object.keys(g.list).filter(id=>!q.active[id]&&q.daily[id]!==day):[];
  const relevel=!stale&&P.lv-(g.lv||P.lv)>=8&&untaken.length;
  if(stale||relevel){const keep={};
    // quests already taken stay until finished or abandoned
    if(g&&g.list)for(const id in g.list)if(q.active[id])keep[id]=g.list[id];
    if(!stale)for(const id in g.list)if(!keep[id]&&q.daily[id]===day)keep[id]=g.list[id]; // done today: keep so it reads as done
    const R=dqRand(day+'|'+(P.name||'')+'|'+(relevel?P.lv:'')),used=new Set(Object.values(keep).map(x=>x.mob)),list={...keep};
    const slots=stale?DQ_N:untaken.length,stamp=day.replace(/-/g,'').slice(2);
    const givers=[...DQ_GIVERS].sort(()=>R()-.5);let lucky=Math.floor(R()*slots);
    for(let i=0;i<slots;i++){const id=`dq${stamp}${relevel?'r'+P.lv:''}_${i}`;const x=dqMake(R,P.lv,used);x.giver=givers[i%givers.length];if(i===lucky)x.lucky=1;list[id]=x;}
    q.dq=g={day,lv:P.lv,list};dqKey='';}
  const key=day+'|'+Object.keys(g.list).join(',')+'|'+dqTH();
  if(key!==dqKey){dqKey=key;for(const id in QUESTS)if(QUESTS[id].dq&&!g.list[id])delete QUESTS[id];
    for(const id in g.list){const x=g.list[id];if(!MOBS[x.mob]||(x.mob2&&!MOBS[x.mob2])||(x.item&&!ITEMS[x.item])){delete g.list[id];continue;}QUESTS[id]=dqBuild(id,x);}}
  dqFast={p:P,ref:q.dq,lv:P.lv,t};}
{const _QS=QS;QS=function(){try{dqEnsure();}catch(e){}return _QS.apply(this,arguments);};}
// a daily from an earlier day that is finished or abandoned leaves the list at the next day's roll (see dqEnsure)

// the quest log: who has a daily for you today
{const _pq=PANELS.quests;PANELS.quests=function(){let h=_pq.apply(this,arguments);try{const s=QS(),g=P.qs.dq,th=dqTH();if(!g)return h;
  const ids=Object.keys(g.list).filter(id=>QUESTS[id]);const open=ids.filter(id=>qAvailable(id)),done=ids.filter(id=>s.daily[id]===today()).length;
  h+=`<h3>${th?'ภารกิจประจำวันวันนี้':"Today's daily quests"}</h3><div class="ds">${th?`ทำแล้ว ${done}/${ids.length} · ภารกิจใหม่ทุกวัน`:`${done}/${ids.length} done · new ones every day`}</div>`;
  for(const id of open){const q=QUESTS[id];h+=`<div class="row qrow"><div class="grow"><div class="nm">${esc(q.name)}</div><div class="ds qobjs"><span class="qwait">${esc(q.wait)}</span>${npcLine(q.from,th?'รับจาก':'From')}</div>`+
    `<div class="ds qrew">${th?'รางวัล':'Rewards'}: ${fmt(q.reward.exp)} EXP · ${fmt(q.reward.jexp)} ${th?'EXP อาชีพ':'job EXP'} · ${fmt(q.reward.gold)} ${th?'โกลด์':'gold'}${(q.reward.items||[]).map(([i,n])=>` · ${esc(ITEMS[i].name)}${n>1?' ×'+n:''}`).join('')}</div></div></div>`;}
  }catch(e){}return h;};}
