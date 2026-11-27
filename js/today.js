"use strict";
/* ================= Today: one board for what there is to do (v1.73.0) =================
   The daily gift, Elder Hollis's dailies and the Guild Hall bounties each lived in their own place. ☰ → Today shows
   them together, adds weekly goals with their own rewards, a boss board, and a "Looking for party" button:
     - Daily gift: ready or taken today
     - Dailies (Elder Hollis): how many are done today; Show the way points the goal arrow at him
     - Bounties (Guild Hall): daily and weekly progress
     - Weekly goals (new, reset every Monday, Thailand time): 300 monsters, 3 bosses or mini-bosses, 40 monsters with a
       party, 5 dailies; each pays gold, EXP and tonics for your level once a week (P.wk)
     - Boss board: the bosses around your level, where they live, how often you have beaten them, when one you beat is
       back (its respawn time, as this game saw it), and the world boss if one is out; Show the way sets the goal arrow
     - Looking for party: says so in chat with your level, calling and region; other players see an Invite button on it
   The goal chip also helps when you have nothing to do: with no quest, it suggests a region for your level (nearest
   first) and the arrow points the way. On a phone the goal chip wraps to two lines instead of cutting the text off. */
const TODAY={over:null};
if(typeof SAVE_EXTRA!=='undefined')SAVE_EXTRA.push('wk','bossK','bossT');
const tdTh=()=>typeof LANG!=='undefined'&&LANG==='th';
const WK_GOALS=[{k:'mobs',n:300,en:'Defeat 300 monsters',th:'ปราบมอนสเตอร์ 300 ตัว'},{k:'boss',n:3,en:'Defeat 3 bosses or mini-bosses',th:'ปราบบอสหรือมินิบอส 3 ตัว'},
  {k:'party',n:40,en:'Defeat 40 monsters with a party',th:'ปราบมอนสเตอร์ 40 ตัวกับปาร์ตี้'},{k:'daily',n:5,en:'Finish 5 daily quests',th:'ทำเควสรายวัน 5 เควส'}];
function wkState(){if(!P)return null;const w=typeof THWEEK==='function'?THWEEK():'';if(!P.wk||typeof P.wk!=='object'||P.wk.week!==w)P.wk={week:w,c:{mobs:0,boss:0,party:0},got:{}};
  const c=P.wk.c;c.daily=0;try{const d=P.qs&&P.qs.daily||{};for(const k in d)if(typeof d[k]==='string'&&d[k]>=w)c.daily++;}catch(e){}return P.wk;}
function wkReward(g){const big=g.k==='boss'?1.6:1;return {gold:Math.round(P.lv*150*big),exp:Math.round(expNeed(P.lv)*.25*big),pot:P.lv>=30?'crimson':'orange',n:P.lv>=30?3:5};}
// counting: your kills (the ones you hurt), bosses, kills while in a party
{const _kmTD=killMob;killMob=function(m){const mine=m&&!m.dead&&(m.myDmg||0)>0,boss=!!(m&&m.d&&(m.d.boss||m.d.world)),id=m&&m.d&&m.d.id,resp=m&&m.d&&m.d.respawn;
  const r=_kmTD.apply(this,arguments);
  try{if(mine&&P){const w=wkState();if(boss)w.c.boss++;else w.c.mobs++;if(typeof partyMatesHere==='function'&&partyMatesHere().length&&!boss)w.c.party++;
      if(boss&&id){P.bossK=P.bossK||{};P.bossK[id]=(P.bossK[id]||0)+1;P.bossT=P.bossT||{};P.bossT[id]=Date.now()+(resp||120)*1000;}}}catch(e){}
  return r;};}
// the goal chip: a "show the way" pick first, then quests as before, then a region for your level
if(typeof goalWhat==='function'){const _gwTD=goalWhat;goalWhat=function(){if(TODAY.over){const o=TODAY.over;
      if(o.mob&&!MOBS[o.mob])TODAY.over=null;else if(o.mob&&zoneId===o.zone&&!mobs.some(m=>m.d.id===o.mob&&!m.dead)&&Date.now()-o.t>4000){}else return o;}
    /* (v1.86.1) with no quest left there is no goal: the "Good hunting: <region>" suggestion that used to fill the goal
       box and arrow got in the way, so it is gone */
    return _gwTD.apply(this,arguments);};}
function tdShowWay(o){TODAY.over={...o,t:Date.now()};closePanel();addLog(tdTh()?`ลูกศรชี้ทางไป: ${o.text}`:`The goal arrow now points to: ${o.text}.`,'l-sys');}
// Looking for party
function tdLfg(){if(!P||typeof sendChat!=='function')return;const c=CLASSES[P.cls]?CLASSES[P.cls].name:'';sendChat(`[LFG] Lv ${P.lv} ${c} looking for a party in ${Z&&Z.D?Z.D.name:''}`);
  addLog(tdTh()?'บอกทุกคนแล้วว่าคุณกำลังหาปาร์ตี้':'You told everyone you are looking for a party.','l-good');closePanel();}
{const lg=document.getElementById('log');if(lg&&window.MutationObserver)new MutationObserver(ms=>{for(const m of ms)for(const d of m.addedNodes){
  if(d.nodeType!==1||!/\bl-chat\b/.test(d.className)||/\bme\b/.test(d.className)||!/\[LFG\]/.test(d.textContent))continue;const b=d.querySelector('b');if(!b||d.querySelector('.lfgInv'))continue;
  const name=b.textContent.replace(/ \(guest\)$/,''),btn=document.createElement('button');btn.type='button';btn.className='btn small lfgInv';btn.textContent=tdTh()?'ชวน':'Invite';
  btn.addEventListener('click',ev=>{ev.stopPropagation();if(typeof invite==='function')invite(name);btn.disabled=true;});d.appendChild(btn);}}).observe(lg,{childList:true});}
// the board
const tdBar=(v,n)=>`<span class="tdbar"><i style="width:${Math.round(Math.min(1,v/Math.max(1,n))*100)}%"></i></span>`;
const tdMin=ms=>{const s=Math.max(0,Math.round(ms/1000));return Math.floor(s/60)+':'+String(s%60).padStart(2,'0');};
PANELS.today=()=>{const th=tdTh();let h=`<h2>${th?'วันนี้':'Today'}</h2><div class="sub">${th?'สิ่งที่ทำได้วันนี้และสัปดาห์นี้':'What there is to do today and this week'}</div>`;
  // the gift
  const gd=typeof loginNext==='function'?loginNext():null;
  h+=`<h3>${th?'ของขวัญรายวัน':'Daily gift'}</h3><div class="row"><span class="tdic">🎁</span><div class="grow"><div class="nm">${gd?(th?`พร้อมรับ: วันที่ ${gd}`:`Ready: day ${gd} of 7`):(th?'รับแล้ววันนี้':'Taken today')}</div></div>${gd?`<button class="btn small" data-act="tdgift">${th?'รับ':'Open'}</button>`:'<span class="muted">✓</span>'}</div>`;
  // dailies
  try{if(typeof dqEnsure==='function')dqEnsure();const q=P.qs||{},g=q.dq,day=typeof today==='function'?today():'';const ids=g&&g.list?Object.keys(g.list):[];const done=ids.filter(id=>q.daily&&q.daily[id]===day).length,act=ids.filter(id=>q.active&&q.active[id]).length;
    h+=`<h3>${th?'เควสรายวัน':'Daily quests'}</h3><div class="row"><span class="tdic">❖</span><div class="grow"><div class="nm">${th?`เสร็จ ${done} จาก ${ids.length}`:`${done} of ${ids.length} done`}${act?(th?` · กำลังทำ ${act}`:` · ${act} in progress`):''}</div>${tdBar(done,ids.length)}<div class="ds">${th?'รับจากผู้อาวุโสฮอลลิสในเฮิร์ธเวล':'From Elder Hollis in Hearthvale'}</div></div><button class="btn small" data-act="tdway" data-arg="hollis">${th?'นำทาง':'Show the way'}</button></div>`;}catch(e){}
  // bounties
  try{if(typeof bState==='function'){const b=bState(),dd=(b.d||[]).filter(x=>x.claimed).length,ready=(b.d||[]).filter(x=>!x.claimed&&bDone(x)).length;
    h+=`<h3>${th?'กระดานค่าหัว':'Bounties'}</h3><div class="row"><span class="tdic">★</span><div class="grow"><div class="nm">${th?`รายวัน: รับแล้ว ${dd} จาก ${(b.d||[]).length}`:`Daily: ${dd} of ${(b.d||[]).length} claimed`}${ready?(th?` · พร้อมรับ ${ready}`:` · ${ready} ready to claim`):''}</div>${tdBar(dd,(b.d||[]).length)}<div class="ds">${b.w?(th?'รายสัปดาห์: ':'Weekly: ')+esc(bTitle(b.w))+(b.w.claimed?' ✓':''):''} · ${th?'แต้ม':'points'} ${Math.min(10,b.pts||0)}/10</div></div><button class="btn small" data-act="tdway" data-arg="guild">${th?'นำทาง':'Show the way'}</button></div>`;}}catch(e){}
  // weekly goals
  const w=wkState();h+=`<h3>${th?'เป้าหมายประจำสัปดาห์':'Weekly goals'}</h3><div class="ds" style="margin-bottom:4px">${th?'เริ่มใหม่ทุกวันจันทร์':'New every Monday'}</div>`;
  for(const g of WK_GOALS){const v=Math.min(g.n,w.c[g.k]||0),got=!!w.got[g.k],r=wkReward(g);
    h+=`<div class="row${got?' claimed':''}"><span class="tdic">${g.k==='boss'?'☠':g.k==='party'?'⚑':g.k==='daily'?'❖':'⚔'}</span><div class="grow"><div class="nm">${th?g.th:g.en} <span class="muted">${v}/${g.n}</span></div>${tdBar(v,g.n)}<div class="ds">${fmt(r.gold)} gold · ${fmt(r.exp)} EXP · ${ITEMS[r.pot].name} ×${r.n}</div></div>`+
      (got?`<span class="muted">${th?'รับแล้ว':'Claimed'}</span>`:`<button class="btn small" data-act="tdwk" data-arg="${g.k}" ${v>=g.n?'':'disabled'}>${th?'รับ':'Claim'}</button>`)+`</div>`;}
  // looking for party
  h+=`<h3>${th?'หาเพื่อนเล่น':'Play together'}</h3><div class="row"><span class="tdic">⚑</span><div class="grow"><div class="nm">${th?'หาปาร์ตี้':'Looking for party'}</div><div class="ds">${th?'บอกทุกคนในแชท คนอื่นกดชวนคุณได้ทันที':'Tells everyone in chat; others get an Invite button on it'}</div></div><button class="btn small" data-act="tdlfg">${th?'ประกาศ':'Ask'}</button></div>`;
  // boss board
  h+=`<h3>${th?'กระดานบอส':'Boss board'}</h3>`;
  try{const wb=typeof NET!=='undefined'&&NET.wb;if(wb&&MOBS[wb.b]&&ZONES[wb.z]){const left=Math.max(0,wb.until-Date.now());
      h+=`<div class="row"><span class="tdic">☠</span><div class="grow"><div class="nm">${esc(MOBS[wb.b].name)} <span class="muted">${th?'บอสโลก':'World boss'} · Lv ${MOBS[wb.b].lv}</span></div><div class="ds">${esc(ZONES[wb.z].name)} · ${th?'เหลือ':'gone in'} ${tdMin(left)}</div></div><button class="btn small" data-act="tdboss" data-arg="${wb.b}|${wb.z}">${th?'นำทาง':'Show the way'}</button></div>`;}}catch(e){}
  const zoneOf={};for(const z in ZONES)for(const m of (ZONES[z].mobs||[]))if(!zoneOf[m[0]]&&!m[2])zoneOf[m[0]]=z;
  const near=Object.values(MOBS).filter(d=>d&&d.boss&&!d.world&&zoneOf[d.id]&&d.lv>=P.lv-10&&d.lv<=P.lv+15).sort((a,b)=>a.lv-b.lv).slice(0,8);
  if(!near.length)h+=`<div class="ds">${th?'ไม่มีบอสใกล้เลเวลของคุณ':'No bosses near your level.'}</div>`;
  for(const d of near){const k=(P.bossK||{})[d.id]||0,back=(P.bossT||{})[d.id]||0,wait=back-Date.now();
    h+=`<div class="row"><span class="tdic">${typeof mobPicURL==='function'?`<img src="${mobPicURL(d.id)}" alt="">`:'☠'}</span><div class="grow"><div class="nm">${esc(d.name)} <span class="muted">${d.mini?(th?'มินิบอส':'Mini-boss'):(th?'บอส':'Boss')} · Lv ${d.lv}</span></div><div class="ds">${esc(ZONES[zoneOf[d.id]].name)} · ${k?(th?`ชนะแล้ว ${k} ครั้ง`:`beaten ×${k}`):(th?'ยังไม่เคยชนะ':'not beaten yet')}${wait>0?(th?` · กลับมาใน ${tdMin(wait)}`:` · back in ${tdMin(wait)}`):''}</div></div><button class="btn small" data-act="tdboss" data-arg="${d.id}|${zoneOf[d.id]}">${th?'นำทาง':'Show the way'}</button></div>`;}
  return h;};
PANEL_ACTS.tdgift=()=>{closePanel();if(typeof loginCard==='function')loginCard();};
PANEL_ACTS.tdlfg=()=>tdLfg();
PANEL_ACTS.tdwk=k=>{const w=wkState(),g=WK_GOALS.find(x=>x.k===k);if(!w||!g||w.got[k]||(w.c[k]||0)<g.n)return;const r=wkReward(g);w.got[k]=Date.now();P.gold+=r.gold;
  if(typeof giveItem==='function')giveItem(r.pot,r.n,true);if(typeof gainExp==='function')gainExp(r.exp,0);sfx('fanfare');addLog(`${tdTh()?'เป้าหมายประจำสัปดาห์':'Weekly goal'}: ${tdTh()?g.th:g.en} · +${fmt(r.gold)} gold, ${ITEMS[r.pot].name} ×${r.n}`,'l-rare');if(typeof save==='function')save();refreshPanel();};
PANEL_ACTS.tdway=a=>{if(a==='hollis')tdShowWay({zone:'town',npc:'Elder Hollis',text:tdTh()?'ไปหาผู้อาวุโสฮอลลิส':'Talk to Elder Hollis'});
  else if(a==='guild')tdShowWay({zone:'town',npc:'Guildmaster Corvin',text:tdTh()?'ไปที่กิลด์ฮอลล์':'Go to the Guild Hall'});};
PANEL_ACTS.tdboss=a=>{const [id,z]=String(a).split('|');if(!MOBS[id]||!ZONES[z])return;tdShowWay({zone:z,mob:id,text:(tdTh()?'ล่า ':'Hunt ')+MOBS[id].name});};
// the menu button (and a dot on ☰ when something can be claimed)
{const menu=document.getElementById('menu');if(menu&&!document.getElementById('mToday')){const b=document.createElement('button');b.className='dk';b.id='mToday';b.title='Today: gifts, dailies, weekly goals, bosses';b.innerHTML='<i>☀</i><span>Today</span>';
  b.addEventListener('click',()=>{sfx('click');togglePanel('today');});menu.insertBefore(b,menu.firstChild);}}
setInterval(()=>{try{if(!P||!running)return;const w=wkState(),gift=typeof loginNext==='function'&&!!loginNext(),wk=WK_GOALS.some(g=>!w.got[g.k]&&(w.c[g.k]||0)>=g.n);
  const on=gift||wk;for(const id of ['mToday','menuBtn']){const e=document.getElementById(id);if(e)e.classList.toggle('tddot',on);}
  if(TODAY.over&&TODAY.over.mob&&zoneId===TODAY.over.zone&&(P.bossT||{})[TODAY.over.mob]>Date.now()-2000)TODAY.over=null; // you got it: back to quests
  if(TODAY.over&&TODAY.over.npc&&zoneId===TODAY.over.zone&&Z&&Z.npcs){const n=Z.npcs.find(x=>x.name===TODAY.over.npc);if(n&&Math.hypot(n.x-P.x,n.y-P.y)<90)TODAY.over=null;}}catch(e){}},1000);
{const st=document.createElement('style');st.textContent=`
.tdbar{display:block;height:5px;border-radius:3px;background:rgba(255,255,255,.1);margin:4px 0 2px;overflow:hidden}.tdbar i{display:block;height:100%;background:linear-gradient(90deg,#e8b84a,#ffd76a)}
.tdic{flex:none;width:38px;height:38px;display:flex;align-items:center;justify-content:center;font-size:22px;color:#ffd76a;border-radius:10px;background:rgba(255,255,255,.05)}.tdic img{width:36px;height:36px}.row.claimed{opacity:.6}.lfgInv{margin-left:6px;padding:1px 8px!important;font-size:11px!important;vertical-align:middle}
.tddot{position:relative}.tddot::after{content:'';position:absolute;top:4px;right:4px;width:9px;height:9px;border-radius:50%;background:#e8463a;box-shadow:0 0 0 2px rgba(10,12,18,.9)}
body.touchui #goalChip{max-height:none;flex-wrap:wrap;border-radius:14px;row-gap:0;max-width:min(330px,calc(100vw - 24px));align-items:flex-start}
body.touchui #goalChip .gt{white-space:normal;flex:1 1 calc(100% - 20px);line-height:1.25}body.touchui #goalChip .gw{flex:1 1 100%;padding-left:17px;white-space:normal;font-size:10.5px}`;document.head.appendChild(st);}
if(typeof TH!=='undefined')Object.assign(TH,{'Today':'วันนี้','Today: gifts, dailies, weekly goals, bosses':'วันนี้: ของขวัญ เควสรายวัน เป้าหมาย บอส'});
