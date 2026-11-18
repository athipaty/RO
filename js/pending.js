"use strict";
/* ================= stat and skill points: plan first, then Save (v1.19.4) =================
   A tap on + (stats) or Learn (skills) still shows the new numbers at once, but the points are only planned: a bar
   at the top of the window says what is planned, with Save and Undo. Closing the window or going to another one
   without saving gives the points back. Only the planned additions are undone (counted per stat and skill), so a
   level-up or anything else that changes points meanwhile is kept. Cloud and local saves store the hero as it was
   before the plan. Loaded after js/ui.js. */
let PEND=null; // {kind, st:{str:n}, stPts, sk:{id:n}, skPts}
const pendOn=()=>!!(PEND&&(PEND.stPts||PEND.skPts));
function pendStart(){if(!PEND)PEND={kind:panelKind,st:{},stPts:0,sk:{},skPts:0};}
// take the plan back out of P (or put it back in): used to undo, and around a save
function pendApply(sign){if(!PEND||!P)return;
  for(const k in PEND.st)P.st[k]=Math.max(1,(P.st[k]||1)-sign*PEND.st[k]);P.statPts+=sign*PEND.stPts;
  for(const id in PEND.sk){const v=(P.skills[id]||0)-sign*PEND.sk[id];if(v>0)P.skills[id]=v;else delete P.skills[id];}P.skillPts+=sign*PEND.skPts;}
function pendUndo(quiet){if(!pendOn()){PEND=null;return;}pendApply(1);const had=PEND;PEND=null;S=computeStats();P.hp=Math.min(P.hp,S.maxhp);P.sp=Math.min(P.sp,S.maxsp);
  if(had.skPts)rebuildHotbar();if(!quiet)addLog('Not saved: your planned points are back.','l-bad');}
function pendSave(){if(!pendOn()){PEND=null;return;}const n=PEND.stPts+PEND.skPts;PEND=null;addLog(`Saved: ${n} point${n>1?'s':''} spent.`,'l-good');sfx('jobup');save(true);}

PANEL_ACTS.stat=arg=>{if(!P||!P.st||!(arg in P.st))return;const v=P.st[arg],c=statCost(v);if(P.statPts<c||v>=99)return;
  pendStart();P.st[arg]++;P.statPts-=c;PEND.st[arg]=(PEND.st[arg]||0)+1;PEND.stPts+=c;S=computeStats();sfx('click');refreshPanel();};
PANEL_ACTS.learn=arg=>{const sk=SKILLS[arg];if(!sk||!(P.skillPts>0)||!skillUnlocked(arg)||(P.skills[arg]||0)>=sk.max)return;
  pendStart();P.skills[arg]=(P.skills[arg]||0)+1;P.skillPts--;PEND.sk[arg]=(PEND.sk[arg]||0)+1;PEND.skPts++;rebuildHotbar();sfx('click');refreshPanel();};
PANEL_ACTS.pendsave=()=>{pendSave();refreshPanel();};
PANEL_ACTS.pendundo=()=>{pendUndo(true);sfx('click');refreshPanel();};

// leaving the window (or switching to another) without saving gives the points back
{const _cpP=closePanel;closePanel=function(){if(PEND)pendUndo();return _cpP.apply(this,arguments);};}
{const _opP=openPanel;openPanel=function(kind){if(PEND&&kind!==PEND.kind)pendUndo();return _opP.apply(this,arguments);};}
// saves keep the hero as it was before the plan
{const _snP=snapshot;snapshot=function(){if(!pendOn())return _snP.apply(this,arguments);pendApply(1);try{return _snP.apply(this,arguments);}finally{pendApply(-1);}};}

// the bar at the top of the window
function pendBarHtml(){const parts=[];
  for(const k in PEND.st)parts.push(`${k.toUpperCase()} +${PEND.st[k]}`);
  for(const id in PEND.sk)parts.push(`${SKILLS[id]?SKILLS[id].name:id} +${PEND.sk[id]}`);
  return `<div class="pendbar" role="status"><span class="pendtx"><b>Not saved yet:</b> ${esc(parts.join(', '))}</span>`+
    `<span class="pendbt"><button class="btn small pendsave" data-act="pendsave">Save</button><button class="btn small" data-act="pendundo">Undo</button></span></div>`;}
{const _rpP=refreshPanel;refreshPanel=function(){const r=_rpP.apply(this,arguments);try{
  if(!panel.hidden&&pendOn()&&panelKind===PEND.kind&&!panel.querySelector('.pendbar')){const h2=panel.querySelector('h2');
    if(h2)h2.insertAdjacentHTML('afterend',pendBarHtml());else panel.insertAdjacentHTML('afterbegin',pendBarHtml());}}catch(e){}return r;};}

(()=>{const st=document.createElement('style');st.textContent=`
.pendbar{position:sticky;top:0;z-index:5;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:6px;margin:6px 0 8px;padding:7px 10px;border:1px solid #e8c25a;border-radius:8px;background:#2a2412;color:#f4e6c4;font-size:13px}
.pendtx{flex:1 1 160px;min-width:0}.pendbt{display:flex;gap:6px}.pendbar .pendsave{background:#e8c25a;color:#2a2012;font-weight:800;border-color:#e8c25a}`;document.head.appendChild(st);})();

if(typeof TH!=='undefined'){Object.assign(TH,{'Not saved yet:':'ยังไม่บันทึก:','Save':'บันทึก','Undo':'ย้อนกลับ','Not saved: your planned points are back.':'ไม่ได้บันทึก: แต้มที่วางแผนไว้ถูกคืนแล้ว'});
  if(typeof TH_PAT!=='undefined')TH_PAT.unshift([/^Saved: (\d+) points? spent\.$/,'บันทึกแล้ว: ใช้ไป $1 แต้ม']);}
