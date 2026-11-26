"use strict";
/* ================= the first ten minutes (v1.66.0) =================
   Played as a brand-new player on a phone, the first screen showed some 28 buttons at once, a daily gift chip, the
   online badge, empty hotbar slots and chat lines about ore shortages and a festival; Elder Hollis offered six quests
   that all looked alike (one story quest and five dailies); 24 stat points waited with no advice; and arriving in the
   Meadow stacked four cards on top of each other. Now, while the first-steps tips run (P.tut is a step number):
     - the daily gift chip, the online badge and empty hotbar slots stay hidden;
     - news meant for later (the ore shortage, festivals) waits until it means something (js/orestock.js, festival.js);
     - people list their story quests first and marked, and their daily tasks folded under one heading;
     - Stats has a ✨ Recommended button that spends the points on a sound build for your job;
     - a new region's card shows on its own: the tip card and gift chip step aside while it is up. */
const isNewbie=()=>!!(P&&typeof P.tut==='number'&&P.lv<10);
setInterval(()=>{try{document.body.classList.toggle('newbie',isNewbie());
  const zc=document.getElementById('zoneCard');document.body.classList.toggle('zcard',!!(zc&&zc.classList.contains('show')));}catch(e){}},400);
// ---- story quests first, daily tasks folded ----
{const _ptN=PANELS.talk;PANELS.talk=function(){let h=_ptN.apply(this,arguments);if(!talk||talk.id)return h;
  const re=/<button class="tq offer" data-act="topen" data-arg="offer:([a-z0-9_]+)">[\s\S]*?<\/button>/g,story=[],daily=[];let m;
  while((m=re.exec(h)))(QUESTS[m[1]]&&QUESTS[m[1]].daily?daily:story).push(m[0]);
  if(!daily.length||!story.length&&daily.length<2)return h;
  const th=typeof LANG!=='undefined'&&LANG==='th',all=[...story,...daily];let out=h;for(const b of all)out=out.replace(b,'');
  const st=story.map((b,i)=>i?b:b.replace('class="tq offer"','class="tq offer tqmain"').replace('</b>',`</b><span class="tqtag">${th?'เนื้อเรื่อง':'Story'}</span>`)).join('');
  const dl=`<details class="tqd"${isNewbie()?'':' open'}><summary>${th?'งานประจำวัน':'Daily tasks'} <span class="wsn">${daily.length}</span></summary>${daily.join('')}</details>`;
  return out.replace('<div class="tlist">',`<div class="tlist">${st}${dl}`);};}
// ---- ✨ Recommended stat points, by job family ----
const STAT_PLAN={novice:{str:3,vit:2,agi:2,dex:2},warden:{str:3,vit:3,agi:1,dex:1},arcanist:{int:4,dex:2,vit:1},ranger:{dex:4,agi:2,luk:1},
  cleric:{int:3,vit:2,dex:1},shade:{agi:3,str:2,luk:2},gunslinger:{dex:4,agi:2,luk:1}};
function statPlan(){const b=typeof baseOf==='function'?baseOf(P.cls):P.cls;return STAT_PLAN[b]||STAT_PLAN.novice;}
function statAuto(){const w=statPlan();let n=0;for(let guard=0;guard<500&&P.statPts>0;guard++){
    let best=null,bs=1e9;for(const k in w){const v=P.st[k];if(v>=99)continue;const c=statCost(v);if(c>P.statPts)continue;const sc=v/w[k];if(sc<bs){bs=sc;best=k;}}
    if(!best)break;P.st[best]++;P.statPts-=statCost(P.st[best]-1);n++;}
  S=computeStats();P.hp=Math.min(P.hp,S.maxhp);return n;}
PANEL_ACTS.statauto=()=>{const n=statAuto();if(!n)return;sfx('jobup');addLog(`Spent ${n} stat points on a sound build. You can still change course: + buys more of any stat.`,'l-good');refreshPanel();if(typeof save==='function')save();};
{const _rpN=refreshPanel;refreshPanel=function(){const r=_rpN.apply(this,arguments);try{
    if(panelKind==='status'&&P.statPts>0&&!panel.querySelector('.statauto')){const th=typeof LANG!=='undefined'&&LANG==='th',w=statPlan();
      const plan=Object.keys(w).sort((a,b)=>w[b]-w[a]).map(k=>k.toUpperCase()).join(' · ');
      const box=document.createElement('div');box.className='statauto';
      box.innerHTML=`<button type="button" class="btn primary" data-act="statauto">✨ ${th?'แนะนำ':'Recommended'}</button><span>${th?'ใช้แต้มให้เหมาะกับอาชีพ':'Spends your points for your job'}: <b>${plan}</b></span>`;
      const at=panel.querySelector('.st');
      if(at&&at.parentNode)at.parentNode.insertBefore(box,at);else panel.appendChild(box);}}catch(e){}return r;};}
if(typeof TH!=='undefined')Object.assign(TH,{'Daily tasks':'งานประจำวัน','Story':'เนื้อเรื่อง'});
(()=>{const st=document.createElement('style');st.textContent=`
body.newbie #giftPill,body.newbie #onlineBadge{display:none!important}
body.newbie .slot.empty{visibility:hidden}
body.zcard #tutCard,body.zcard #giftPill{opacity:0!important;pointer-events:none}
#panel .tq.tqmain{border-color:#ffd77a;box-shadow:0 0 0 1px #ffd77a inset,0 0 12px rgba(255,215,122,.25)}
#panel .tqtag{margin:0 6px;padding:1px 7px;border-radius:9px;background:#ffd77a;color:#2a1a08;font:800 11px var(--ui,system-ui);vertical-align:2px}
#panel details.tqd{margin-top:6px}
#panel details.tqd>summary{cursor:pointer;padding:8px 4px;font:700 13px var(--ui,system-ui);color:#e8c25a;list-style-position:inside}
#panel .statauto{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin:6px 0 10px;padding:10px;border-radius:12px;background:rgba(232,194,90,.1);border:1px solid rgba(232,194,90,.4)}
#panel .statauto span{font-size:12.5px;color:#e8e2d4}
`;document.head.appendChild(st);})();
/* ---- (v1.66.1) the second play-through ----
   Recommended stat points only when a stat can be raised (2 points buy the first steps); a Recommended button for skill
   points too (the build you follow, else the first build for your job; a Novice learns First Aid) with a word on where
   real skills come from; on a phone the skill tree's hint speaks of taps, not keys; the first-steps tip waits while
   your story quest points at someone in town; and the first time your HP runs low, a word on tonics and sitting. */
function statCanBuy(){return ['str','agi','vit','int','dex','luk'].some(k=>P.st[k]<99&&statCost(P.st[k])<=P.statPts);}
function skillPlan(){if(P.cls==='novice')return [['firstaid',10]];const B=typeof buildById==='function'&&P.build?buildById(P.build):null;if(B)return B.skills;
  const base=typeof baseOf==='function'?baseOf(P.cls):P.cls,vis=typeof buildsVisible==='function'?buildsVisible():[];
  const b=vis.find(x=>x.job===base&&(typeof buildAllowed!=='function'||buildAllowed(x)));return b?b.skills:[];}
function skillLearnable(id){const sk=SKILLS[id];return !!sk&&typeof skillUnlocked==='function'&&skillUnlocked(id)&&(P.skills[id]||0)<sk.max;}
function skillAuto(){let n=0;for(const [id,to] of skillPlan())while(P.skillPts>0&&(P.skills[id]||0)<to&&skillLearnable(id)){P.skills[id]=(P.skills[id]||0)+1;P.skillPts--;n++;}
  if(n&&typeof rebuildHotbar==='function')rebuildHotbar();return n;}
PANEL_ACTS.skillauto=()=>{const n=skillAuto();if(!n){addLog('Nothing more to learn for now: new skills come with your job.','l-bad');return;}sfx('jobup');addLog(`Learned ${n} skill level${n>1?'s':''} for your build.`,'l-good');refreshPanel();if(typeof save==='function')save();};
{const _rpS=refreshPanel;refreshPanel=function(){const r=_rpS.apply(this,arguments);try{const th=typeof LANG!=='undefined'&&LANG==='th',touch=true; // phone only: the hints speak of taps
    if(panelKind==='status'){const box=panel.querySelector('.statauto');if(box&&!statCanBuy())box.remove();}
    if(panelKind==='skills'){const sub=panel.querySelector('.sub');
      if(sub&&touch){for(const n of sub.childNodes)if(n.nodeType===3&&/press 1–4|กด 1–4/.test(n.nodeValue))n.nodeValue=th?' · แตะ 1–4 ใต้สกิลที่เรียนแล้วเพื่อใส่ในปุ่มลัด':' · tap 1–4 under a learned skill to put it on your hotbar';}
      if(P.skillPts>0&&!panel.querySelector('.skillauto')&&skillPlan().some(([id,to])=>(P.skills[id]||0)<to&&skillLearnable(id))){
        const box=document.createElement('div');box.className='statauto skillauto';
        box.innerHTML=`<button type="button" class="btn primary" data-act="skillauto">✨ ${th?'แนะนำ':'Recommended'}</button><span>${P.cls==='novice'?(th?'เรียนปฐมพยาบาล ต้องได้ปฐมพยาบาลเลเวล 10 ก่อนเปลี่ยนอาชีพแรกที่ Job Lv 10 ซึ่งจะได้สกิลจริง':'Learns First Aid. First Aid Lv 10 is needed before your first job at Job Lv 10, which brings real skills.'):(th?'ใช้แต้มตามบิลด์ของคุณ':'Spends your points along your build.')}</span>`;
        if(sub&&sub.parentNode)sub.parentNode.insertBefore(box,sub.nextSibling);}}}catch(e){}return r;};}
// the first-steps tip waits while the story quest points at someone in town
{const st=TUT_STEPS.find(s=>s.k==='meadow');if(st){const t0=st.t,h0=st.th;const busy=()=>typeof GOAL!=='undefined'&&GOAL.t&&GOAL.t.npc&&typeof zoneId!=='undefined'&&(!GOAL.t.zone||GOAL.t.zone===zoneId)&&ZONES[zoneId]&&ZONES[zoneId].safe;
  st.t=()=>busy()?'Finish your quest first: follow the gold arrow to '+GOAL.t.npc+'. Then head out the east gate to Greenmoss Meadow.':t0();
  st.th=()=>busy()?'ทำเควสให้เสร็จก่อน: ตามลูกศรสีทองไปหา '+GOAL.t.npc+' แล้วค่อยออกประตูตะวันออกไปทุ่งหญ้ากรีนมอส':h0();}}
// the first time your HP runs low out in the wild: a word on tonics and sitting
if(typeof SAVE_EXTRA!=='undefined')SAVE_EXTRA.push('lowTip');
setInterval(()=>{try{if(!P||!running||P.dead||P.lowTip||P.lv>=15||!S||!Z||Z.D.safe||P.hp>S.maxhp*.4)return;P.lowTip=1;const th=typeof LANG!=='undefined'&&LANG==='th',touch=true;
  addLog(th?'HP ใกล้หมด! ดื่ม Red Tonic (ปุ่มขวดแดง) หรือถอยออกมานั่งพัก (ปุ่มนั่ง) เพื่อฟื้นเร็วขึ้น ร้านของอิลซาในฮาร์ธเวลขายยาขวดละ 15 ทอง':`Low on HP! Drink a Red Tonic (the red bottle button) or step back and sit down (the sit button) to heal faster. Ilsa's store in Hearthvale sells tonics for 15 gold.`,'l-rare');
  floatT(P.x,P.y-60,th?'HP ต่ำ!':'Low HP!','#ff8a7a',16);if(typeof save==='function')save();}catch(e){}},500);
/* ---- (v1.66.3) the third play-through ----
   Corvin's First Aid note has a button that opens Skills; and when the next story quest needs a higher level, the
   goal chip no longer goes blank: it says which level, and points to the best region to hunt for yours. */
PANEL_ACTS.openskills=()=>{openPanel('skills');};
function storyGap(){if(!P||typeof QS!=='function')return null;const s=QS(),done=s.done||[];
  const q=Object.keys(QUESTS).map(k=>[k,QUESTS[k]]).filter(([k,q])=>!q.daily&&!done.includes(k)&&!s.active[k]&&(!q.after||done.includes(q.after))&&(q.lv||1)>P.lv).sort((a,b)=>(a[1].lv||1)-(b[1].lv||1))[0];
  if(!q)return null;const lv=q[1].lv;
  // the region whose weakest monsters are closest to your level from below
  let best=null,bl=-1;for(const id of Object.keys(typeof WORLD_GRID!=='undefined'?WORLD_GRID:{})){const D=ZONES[id];if(!D||D.safe||!D.mobs)continue;
    const lows=D.mobs.map(([m])=>MOBS[m]).filter(m=>m&&!m.boss).map(m=>m.lv);if(!lows.length)continue;const lo=Math.min(...lows);if(lo<=P.lv&&lo>bl){bl=lo;best=id;}}
  return {lv,zone:best};}
{const _gwS=goalWhat;goalWhat=function(){const r=_gwS.apply(this,arguments);if(r)return r;try{const g=storyGap();if(!g||!g.zone)return null;
    const th=typeof LANG!=='undefined'&&LANG==='th';return {zone:g.zone,text:th?`ถึงเลเวล ${g.lv} เพื่อเควสถัดไป: ล่าที่ ${ZONES[g.zone].name}`:`Reach Lv ${g.lv} for the next story: hunt in ${ZONES[g.zone].name}`};}catch(e){return null;}};}
