"use strict";
/* ================= a Job filter for gear lists (v1.54.0) =================
   The General Store's Equip tab (buy and sell) and Brannoc's Forge get a row of job chips, like the Library's
   Equipment tab: pick a job and only the weapons that job can use stay (armour, headgear, shoes and accessories
   suit every job, so they always show). One choice shared by the store and the forge, remembered.
   Storage (Wenna) gets the bag's tabs too: Use · Equip · Sigils · Etc, for your bag and the storage both. */
let gearJob=(()=>{try{return localStorage.getItem('embervale.gearJob')||'all';}catch(e){return 'all';}})();
const jobList=()=>(typeof JOB_FIRST!=='undefined'?JOB_FIRST:[]).filter(j=>CLASSES[j]);
const myBaseJob=()=>P&&P.cls&&P.cls!=='novice'?((CLASSES[P.cls]&&CLASSES[P.cls].base)||P.cls):null;
function jobFits(id,job){const it=ITEMS[id];if(!it||job==='all'||!CLASSES[job])return true;return it.type!=='weapon'||CLASSES[job].weapons.includes(it.wt);}
// chips + the list cut down to the chosen job; idOf(x) gives the item id of a list entry
function gearJobFilter(list,idOf){const jobs=jobList();if(gearJob!=='all'&&!jobs.includes(gearJob))gearJob='all';if(!jobs.length)return ['',list];
  const mine=myBaseJob(),chip=(k,l,n)=>`<button type="button" class="cxchip${gearJob===k?' on':''}" aria-pressed="${gearJob===k}" data-act="gearjob" data-arg="${k}">${l} <span>${n}</span></button>`;
  const h=`<div class="gjrow"><span class="cxlbl">Job</span><div class="cxchips">`+chip('all','All',list.length)+
    jobs.map(j=>chip(j,esc(CLASSES[j].name)+(j===mine?' <i aria-hidden="true">★</i>':''),list.filter(x=>jobFits(idOf(x),j)).length)).join('')+`</div></div>`;
  return [h,list.filter(x=>jobFits(idOf(x),gearJob))];}
PANEL_ACTS.gearjob=k=>{gearJob=k;try{localStorage.setItem('embervale.gearJob',k);}catch(e){}sfx('click');refreshPanel();};

// storage: Use · Equip · Sigils · Etc
let stoTab=(()=>{try{return localStorage.getItem('embervale.stoTab')||'all';}catch(e){return 'all';}})();
PANEL_ACTS.stotab=k=>{stoTab=k;try{localStorage.setItem('embervale.stoTab',k);}catch(e){}sfx('click');refreshPanel();};
function stoTabsHtml(){if(typeof itemCat!=='function')return '';const cnt={all:0,use:0,equip:0,sigil:0,etc:0};
  for(const e of [...P.inv,...P.storage]){cnt.all++;const c=itemCat(e.id);if(c in cnt)cnt[c]++;}
  return `<div class="tabs itabs stotabs" role="tablist">`+[['all','All'],['use','Use'],['equip','Equip'],['sigil','Sigils'],['etc','Etc']].map(([k,l])=>
    `<button class="btn small ${stoTab===k?'on':''}" role="tab" aria-selected="${stoTab===k}" data-act="stotab" data-arg="${k}">${l} <span class="muted">${cnt[k]}</span></button>`).join('')+`</div>`;}
const stoShow=e=>stoTab==='all'||typeof itemCat!=='function'||itemCat(e.id)===stoTab;

(()=>{const st=document.createElement('style');st.textContent=`
#panel .gjrow{display:flex;align-items:flex-start;gap:8px;margin:4px 0 6px}#panel .gjrow .cxlbl{padding-top:6px}#panel .gjrow .cxchips{flex:1;min-width:0}
#panel .stotabs{margin:6px 0 4px}`;document.head.appendChild(st);})();
if(typeof TH!=='undefined')Object.assign(TH,{'Job':'อาชีพ','Sigils':'ซิกิล','Nothing of this kind here.':'ไม่มีของประเภทนี้'});
