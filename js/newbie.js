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
