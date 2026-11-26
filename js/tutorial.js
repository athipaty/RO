"use strict";
/* ================= first steps for new players (v1.21.0) =================
   A small tip card walks a brand-new character through the basics and ticks each step off as it happens:
   walk, talk to Elder Hollis, head out to Greenmoss Meadow, defeat a monster, pick up loot, spend stat points.
   It never blocks the game, can be skipped (and turned back on in the quest log), and older characters never see it.
   Saved as P.tut (the step number, or 'done'). Loaded after js/quests.js, js/combat.js and js/bounties.js. */
const TUT_STEPS=[
  {k:'walk',t:()=>true?'Drag anywhere on the screen to walk.':'Click the ground (or use WASD) to walk.',th:()=>true?'ลากนิ้วบนหน้าจอเพื่อเดิน':'คลิกที่พื้น (หรือกด WASD) เพื่อเดิน'},
  {k:'talk',t:()=>'Talk to Elder Hollis in Chapel Close: tap the person with a ! over their head.',th:()=>'คุยกับผู้เฒ่าฮอลลิสที่ย่านโบสถ์: แตะคนที่มี ! อยู่เหนือหัว'},
  {k:'meadow',t:()=>'Head out the east gate to Greenmoss Meadow. The gold arrow shows the way.',th:()=>'ออกประตูตะวันออกไปทุ่งหญ้ากรีนมอส ลูกศรสีทองจะชี้ทางให้'},
  {k:'kill',t:()=>true?'Tap a monster, or press the red sword button, to fight.':'Click a monster to fight it.',th:()=>true?'แตะมอนสเตอร์ หรือกดปุ่มดาบสีแดงเพื่อต่อสู้':'คลิกมอนสเตอร์เพื่อต่อสู้'},
  {k:'loot',t:()=>'Pick up what it dropped: walk over it or tap it.',th:()=>'เก็บของที่มันดรอป: เดินไปทับหรือแตะที่ของ'},
  {k:'stats',t:()=>'Level up, then open Stats and press + to grow stronger.',th:()=>'เลเวลอัป แล้วเปิดหน้าสถานะและกด + เพื่อเพิ่มพลัง'}];
const TUT={x:null,y:null,kill:false,loot:false,pts:null,el:null};
const tutTh=()=>typeof LANG!=='undefined'&&LANG==='th';
function tutStart(){if(!P)return;
  if(P.tut===undefined){const old=P.lv>3||(typeof QS==='function'&&((QS().done||[]).length||Object.keys(QS().active||{}).length));P.tut=old?'done':0;}}
function tutDone(i){const s=TUT_STEPS[i];if(!s||!P)return false;
  if(s.k==='walk')return TUT.x!=null&&Math.hypot(P.x-TUT.x,P.y-TUT.y)>90;
  if(s.k==='talk')return typeof QS==='function'&&(Object.keys(QS().active||{}).length>0||(QS().done||[]).length>0);
  if(s.k==='meadow')return typeof zoneId!=='undefined'&&zoneId!=='town'&&zoneId!=='capital';
  if(s.k==='kill')return TUT.kill;
  if(s.k==='loot')return TUT.loot;
  if(s.k==='stats')return TUT.pts!=null&&P.statPts<TUT.pts;
  return false;}
function tutTick(){if(!P||!running)return;tutStart();if(P.tut==='done'||typeof P.tut!=='number'){if(TUT.el){if(TUT.fin&&Date.now()<TUT.fin)TUT.el.hidden=!!(panelKind&&!panel.hidden);else{TUT.fin=0;TUT.el.hidden=true;}}return;}
  const i=P.tut;if(TUT.x==null){TUT.x=P.x;TUT.y=P.y;}if(TUT.pts==null)TUT.pts=P.statPts;
  if(tutDone(i)){P.tut=i+1;TUT.kill=TUT.loot=false;TUT.pts=P.statPts;if(typeof sfx==='function')sfx('jobup');
    if(P.tut>=TUT_STEPS.length){P.tut='done';TUT.fin=Date.now()+15000;tutShow(tutTh()?'เยี่ยมมาก! คุณพร้อมผจญภัยแล้ว ทำเควสต่อเพื่อเลือกอาชีพแรกที่เลเวลอาชีพ 10':'Well done! You know the basics. Keep following the quests: at Job Level 10 you choose your first job.',true);if(typeof save==='function')save();return;}
    if(typeof save==='function')save();}
  const s=TUT_STEPS[P.tut];tutShow((tutTh()?s.th():s.t()),false);}
function tutShow(text,last){let el=TUT.el;
  if(!el){el=TUT.el=document.createElement('div');el.id='tutCard';el.setAttribute('role','status');document.body.appendChild(el);
    el.addEventListener('click',ev=>{const b=ev.target.closest('[data-tut]');if(!b)return;ev.stopPropagation();if(b.dataset.tut==='skip'||b.dataset.tut==='ok'){P.tut='done';TUT.fin=0;el.hidden=true;if(typeof save==='function')save();}});}
  const n=typeof P.tut==='number'?P.tut:TUT_STEPS.length,dots=TUT_STEPS.map((_,j)=>`<i class="${j<n?'d':j===n?'c':''}"></i>`).join('');
  const html=`<div class="tuthd"><b>${tutTh()?'ก้าวแรก':'First steps'}</b><span class="tutdots">${dots}</span></div><div class="tuttx">${esc(text)}</div>`+
    `<button type="button" class="tutx" data-tut="${last?'ok':'skip'}">${last?(tutTh()?'โอเค':'Got it'):(tutTh()?'ข้ามคำแนะนำ':'Skip tips')}</button>`;
  if(el._h!==html){el._h=html;el.innerHTML=html;el.classList.remove('pop');void el.offsetWidth;el.classList.add('pop');}
  // sit just under whatever is at the top of the screen
  // sideways phones: the corners are full, so a narrow card at the top centre under the online badge and gift pill
  const side=innerWidth>innerHeight&&document.body.classList.contains('touchui');el.classList.toggle('side',side);
  if(side){let b=6;for(const id of ['onlineBadge','giftPill','goalChip']){const e=document.getElementById(id);if(e&&!e.hidden&&e.getClientRects().length){const r=e.getBoundingClientRect();if(r.right>innerWidth*.3&&r.left<innerWidth*.7)b=Math.max(b,r.bottom);}}
    el.style.top=Math.round(b+6)+'px';el.hidden=!!(panelKind&&!panel.hidden);return;}
  let b=0;for(const id of ['hud','minibox','goalChip','giftPill']){const e=document.getElementById(id);if(e&&!e.hidden&&e.getClientRects().length){const r=e.getBoundingClientRect();if(r.left<innerWidth*.75&&r.right>innerWidth*.25||id==='hud')b=Math.max(b,r.bottom);}}
  el.style.top=Math.round(Math.min(innerHeight*.45,b+8))+'px';el.hidden=!!(panelKind&&!panel.hidden);}
setInterval(()=>{try{tutTick();}catch(e){}},300);
// what happened since the last check
{const _qkT=questKill;questKill=function(){TUT.kill=true;return _qkT.apply(this,arguments);};}
{const _puT=pickUp;pickUp=function(){TUT.loot=true;return _puT.apply(this,arguments);};}
if(typeof SAVE_EXTRA!=='undefined')SAVE_EXTRA.push('tut');
// the quest log can turn the tips back on
if(typeof PANELS!=='undefined'&&PANELS.quests){const _pqT=PANELS.quests;PANELS.quests=function(){let h=_pqT.apply(this,arguments);
  if(P&&P.tut==='done'&&P.lv<=15)h+=`<div class="tbtns" style="justify-content:flex-start"><button class="btn small ghost" data-act="tutagain">${tutTh()?'แสดงคำแนะนำก้าวแรกอีกครั้ง':'Show the first-steps tips again'}</button></div>`;return h;};}
if(typeof PANEL_ACTS!=='undefined')PANEL_ACTS.tutagain=()=>{P.tut=0;TUT.x=TUT.y=TUT.pts=null;closePanel();};

(()=>{const st=document.createElement('style');st.textContent=`
#tutCard{position:fixed;left:50%;transform:translateX(-50%);z-index:7;width:min(320px,calc(100vw - 32px));box-sizing:border-box;padding:9px 12px 8px;border-radius:12px;
  border:1.5px solid #e8c25a;background:linear-gradient(180deg,#2a2412,#15130c);color:#f4ead6;box-shadow:0 0 0 3px rgba(232,194,90,.12),0 10px 26px rgba(0,0,0,.5);font-size:14px;line-height:1.4}
#tutCard.side{width:min(250px,34vw);padding:6px 9px;font-size:12px;line-height:1.3}#tutCard.side .tuthd{margin-bottom:1px}#tutCard.side .tutx{margin-top:2px;font-size:11px}
#tutCard.pop{animation:tutPop .35s ease-out}@keyframes tutPop{from{transform:translateX(-50%) scale(.9);opacity:0}to{transform:translateX(-50%) scale(1);opacity:1}}
#tutCard .tuthd{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:3px}#tutCard .tuthd b{color:#ffd76a;font-size:12px;letter-spacing:.14em;text-transform:uppercase}
#tutCard .tutdots{display:flex;gap:4px}#tutCard .tutdots i{width:7px;height:7px;border-radius:50%;background:#4a4230}#tutCard .tutdots i.d{background:#7fd38a}#tutCard .tutdots i.c{background:#ffd76a;box-shadow:0 0 6px #ffd76a}
#tutCard .tutx{margin-top:5px;background:none;border:0;color:#b0a690;font:inherit;font-size:12px;text-decoration:underline;cursor:pointer;padding:2px 0}`;document.head.appendChild(st);})();
