"use strict";
/* ================= build loadouts (Guild Hall) =================
   Save up to 3 setups of stat points, learned skills and hotbar, and switch between them at the Guild Hall. Two slots
   are free, the third costs 20,000 gold once. Switching keeps the totals honest: the free points are worked out from the
   points you have in total right now, so a loadout saved at a lower level simply has more points left to spend. A slot
   whose skills no longer fit your job (after a job change) is cleared. Switching is free while Embervale is in testing
   (like retraining); gear stays as it is. */
const LOADOUT_UNLOCK=20000;
const lStatTotal=()=>Object.values(P.st).reduce((a,v)=>a+statSpent(v),0)+P.statPts;
const lSkillTotal=()=>Object.values(P.skills).reduce((a,v)=>a+v,0)+P.skillPts;
function lSnap(){return {cls:P.cls,st:{...P.st},skills:{...P.skills},useLv:{...(P.useLv||{})},bar:JSON.parse(JSON.stringify(P.bar||null)),bars:JSON.parse(JSON.stringify(P.bars||null)),hot:P.hot?[...P.hot]:null};}
function lSummary(s){if(!s)return 'Empty';const top=Object.entries(s.st).filter(([,v])=>v>1).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([k,v])=>`${k.toUpperCase()} ${v}`).join(' · ');
  const sk=Object.entries(s.skills).sort((a,b)=>b[1]-a[1]).slice(0,2).map(([k,v])=>SKILLS[k]?`${SKILLS[k].name} ${v}`:'').filter(Boolean).join(', ');
  return [top,sk].filter(Boolean).join(' · ')||'No points spent';}
function lState(){const L=P.loadouts=P.loadouts&&Array.isArray(P.loadouts.slots)?P.loadouts:{slots:[null,null,null],cur:-1,open3:false};
  // a saved setup from another job no longer fits
  L.slots=L.slots.map(s=>s&&s.cls===P.cls?s:null);if(L.cur>=0&&!L.slots[L.cur])L.cur=-1;return L;}
function lApply(s){const stT=lStatTotal(),skT=lSkillTotal();const stSpent=Object.values(s.st).reduce((a,v)=>a+statSpent(v),0);
  const allowed=new Set(CLASSES[P.cls].skills),skills={};for(const [k,v] of Object.entries(s.skills))if(allowed.has(k)&&SKILLS[k])skills[k]=Math.min(v,SKILLS[k].max||10);
  const skSpent=Object.values(skills).reduce((a,v)=>a+v,0);if(stSpent>stT||skSpent>skT)return false;
  P.st={...s.st};P.statPts=stT-stSpent;P.skills=skills;P.skillPts=skT-skSpent;P.useLv={...(s.useLv||{})};
  if(s.bar)P.bar=JSON.parse(JSON.stringify(s.bar));if(s.bars)P.bars=JSON.parse(JSON.stringify(s.bars));if(s.hot)P.hot=[...s.hot];
  S=computeStats();P.hp=Math.min(P.hp,S.maxhp);P.sp=Math.min(P.sp,S.maxsp);rebuildHotbar();return true;}
function loadoutHtml(){if(!P||P.cls==='novice')return '';const L=lState();let h=`<h3>Loadouts</h3><div class="ds" style="margin-bottom:4px">Save your stats, skills and hotbar as a setup and switch any time you visit. Gear stays as it is.</div>`;
  L.slots.forEach((s,i)=>{const locked=i===2&&!L.open3,cur=L.cur===i;
    h+=`<div class="row lrow${cur?' cur':''}"><span class="cmi nt"><b>${i+1}</b></span><div class="grow"><div class="nm">Setup ${i+1}${cur?' <span class="gold">· in use</span>':''}</div><div class="ds">${locked?'Locked':esc(lSummary(s))}</div></div>`+
      (locked?`<button class="btn small" data-act="lopen" ${P.gold>=LOADOUT_UNLOCK?'':'disabled'}>Unlock (${fmt(LOADOUT_UNLOCK)} gold)</button>`:
        `<button class="btn small ghost" data-act="lsave" data-arg="${i}">${s?'Save over':'Save here'}</button><button class="btn small" data-act="luse" data-arg="${i}" ${s&&!cur?'':'disabled'}>Switch</button>`)+`</div>`;});
  return h;}
PANEL_ACTS.lsave=i=>{const L=lState();i=+i;if(i===2&&!L.open3)return;L.slots[i]=lSnap();L.cur=i;sfx('click');addLog(`Setup ${i+1} saved: ${lSummary(L.slots[i])}.`,'l-good');refreshPanel();save();};
PANEL_ACTS.luse=i=>{const L=lState();i=+i;const s=L.slots[i];if(!s||L.cur===i)return;
  if(L.cur>=0)L.slots[L.cur]=lSnap(); // keep the changes made to the setup in use
  if(!lApply(s)){addLog(`Setup ${i+1} no longer fits your points, so it was cleared.`,'l-bad');L.slots[i]=null;refreshPanel();save();return;}
  L.cur=i;sfx('jobup');fx.push({k:'ring',x:P.x,y:P.y,r:36,col:'#9fd3ff',t0:now,dur:.6});addLog(`Switched to setup ${i+1}: ${lSummary(s)}.`,'l-rare');refreshPanel();save();};
PANEL_ACTS.lopen=()=>{const L=lState();if(L.open3||P.gold<LOADOUT_UNLOCK)return;P.gold-=LOADOUT_UNLOCK;L.open3=true;sfx('coin');addLog('Setup 3 unlocked.','l-good');refreshPanel();save();};
{const _rpLo=refreshPanel;refreshPanel=function(){const r=_rpLo.apply(this,arguments);try{if(panelKind==='job'&&P&&!panel.querySelector('.lrow')){const b=panel.querySelector('h3');const html=loadoutHtml();
    // just before the Retraining part, or at the end
    const ret=[...panel.querySelectorAll('h3')].find(x=>/Retraining|ฝึกใหม่/.test(x.textContent));if(ret)ret.insertAdjacentHTML('beforebegin',html);else panel.insertAdjacentHTML('beforeend',html);}}catch(e){}return r;};}
if(typeof SAVE_EXTRA!=='undefined')SAVE_EXTRA.push('loadouts');
if(typeof TH!=='undefined')Object.assign(TH,{'Loadouts':'ชุดสายอาชีพ','Save your stats, skills and hotbar as a setup and switch any time you visit. Gear stays as it is.':'บันทึกสถานะ สกิล และแถบลัดเป็นชุด แล้วสลับได้ทุกครั้งที่มาที่นี่ อุปกรณ์คงเดิม',
  'Save here':'บันทึกที่นี่','Save over':'บันทึกทับ','Switch':'สลับ','Locked':'ล็อกอยู่','Empty':'ว่าง','No points spent':'ยังไม่ได้ลงแต้ม','Setup 3 unlocked.':'ปลดล็อกชุดที่ 3 แล้ว','· in use':'· ใช้อยู่'});
if(typeof TH_PAT!=='undefined')TH_PAT.unshift([/^Setup (\d)$/,'ชุดที่ $1'],[/^Unlock \(([\d,]+) gold\)$/,'ปลดล็อก ($1 โกลด์)'],[/^Setup (\d) saved: (.+)\.$/,'บันทึกชุดที่ $1 แล้ว: $2'],
  [/^Switched to setup (\d): (.+)\.$/,'สลับเป็นชุดที่ $1: $2'],[/^Setup (\d) no longer fits your points, so it was cleared\.$/,'ชุดที่ $1 ไม่ตรงกับแต้มปัจจุบันแล้ว จึงถูกล้าง']);
