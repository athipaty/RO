"use strict";
/* ================= free hotbar: any learned skill or usable item on any of the 8 slots =================
   P.bar holds 8 entries: {s:skillId}, {i:itemId} or null. The ✎ button (or an empty slot) opens the editor:
   pick a slot, then tap a skill or an item to put it there. On a computer, slots can also be dragged onto
   each other to swap, and skills or items dragged from the editor onto a slot. Old saves are converted
   from the earlier layout (skills on 1–4, potions and the scroll on 5–8). */
const BAR_N=8;
let barSel=0;
const barSkillOk=id=>!!(SKILLS[id]&&SKILLS[id].kind!=='passive'&&CLASSES[P.cls].skills.includes(id));
const barItemOk=id=>!!(ITEMS[id]&&ITEMS[id].type==='use');
function barEntry(e){if(!e||typeof e!=='object')return null;if(typeof e.s==='string'&&barSkillOk(e.s))return {s:e.s};if(typeof e.i==='string'&&barItemOk(e.i))return {i:e.i};return null;}
function getBar(){
  if(!Array.isArray(P.bar)){const sk=hotSkills();P.bar=[...sk.map(s=>s?{s}:null),{i:'red'},{i:'orange'},{i:'blue'},{i:'scroll'}];}
  let b=P.bar.slice(0,BAR_N).map(barEntry);while(b.length<BAR_N)b.push(null);
  // a new job's skills: if no skill is on the bar at all, put the class's first skills in the empty skill slots
  if(!b.some(x=>x&&x.s)){const sk=CLASSES[P.cls].skills.slice(0,4);let k=0;for(let i=0;i<4&&k<sk.length;i++)if(!b[i])b[i]={s:sk[k++]};}
  P.bar=b;return b;}
// the game reads the bar through these
hotSlots=function(){return getBar().map(e=>e?(e.s?{skill:e.s}:{item:e.i}):null);};
function barSet(i,e){const b=getBar();if(!(i>=0&&i<BAR_N))return;
  const key=x=>x?(x.s?'s:'+x.s:'i:'+x.i):'';const was=e?b.findIndex(x=>key(x)===key(e)):-1;
  if(was>=0&&was!==i)b[was]=b[i]; // already on the bar: swap places
  b[i]=e;P.bar=b;rebuildHotbar();save();}
function barSwap(a,c){const b=getBar();if(a===c||!(a>=0&&a<BAR_N&&c>=0&&c<BAR_N))return;[b[a],b[c]]=[b[c],b[a]];P.bar=b;rebuildHotbar();save();}
// the skill tree's 1–4 picker now places onto the free bar
PANEL_ACTS.hot=arg=>{const[id,i]=arg.split(':');if(!SKILLS[id]||!P.skills[id]||!(+i>=0&&+i<BAR_N))return;barSet(+i,{s:id});refreshPanel();};
hotPicker=function(id){if(!P.skills[id])return '';const b=getBar();
  return `<div class="hotpick" aria-label="Put on hotbar key">${[0,1,2,3].map(i=>`<button class="hk${b[i]&&b[i].s===id?' on':''}" data-act="hot" data-arg="${id}:${i}" title="Put on key ${i+1}">${i+1}</button>`).join('')}</div>`;};

/* ---- the bar itself: an edit button, empty slots that open the editor, drag to swap ---- */
const _rebuildHotbarF=rebuildHotbar;
rebuildHotbar=function(){_rebuildHotbarF();if(!P)return;const hb=$('#hotbar');
  [...hb.querySelectorAll('.slot')].forEach((el,i)=>{el.dataset.i=i;
    if(el.disabled){el.disabled=false;el.classList.add('empty');el.title=`Empty slot ${i+1}: tap to choose`;el.setAttribute('aria-label',el.title);el.onclick=()=>{barSel=i;openPanel('hotbar');};}
    el.draggable=true;});
  if(!hb.querySelector('#hbEdit')){const e=document.createElement('button');e.id='hbEdit';e.type='button';e.className='slot edit';e.title='Edit the hotbar';e.setAttribute('aria-label','Edit the hotbar');e.textContent='✎';
    e.addEventListener('click',()=>{sfx('click');togglePanel('hotbar');});hb.appendChild(e);}};
// drag and drop (mouse): slot onto slot swaps; a skill or item from the editor onto a slot puts it there
let barDrag=null;
document.addEventListener('dragstart',ev=>{const s=ev.target.closest&&ev.target.closest('#hotbar .slot[data-i]'),src=ev.target.closest&&ev.target.closest('[data-bar]');
  if(s){barDrag={from:+s.dataset.i};}else if(src){barDrag={put:src.dataset.bar};}else return;try{ev.dataTransfer.setData('text/plain','bar');ev.dataTransfer.effectAllowed='move';}catch(e){}});
document.addEventListener('dragover',ev=>{if(barDrag&&ev.target.closest&&ev.target.closest('#hotbar .slot[data-i]'))ev.preventDefault();});
document.addEventListener('drop',ev=>{const s=ev.target.closest&&ev.target.closest('#hotbar .slot[data-i]');if(!barDrag||!s)return;ev.preventDefault();const to=+s.dataset.i,d=barDrag;barDrag=null;
  if(d.from!==undefined)barSwap(d.from,to);else if(d.put){const [k,id]=d.put.split(':');barSet(to,k==='s'?{s:id}:{i:id});}
  if(panelKind==='hotbar')refreshPanel();});
document.addEventListener('dragend',()=>{barDrag=null;});

/* ---- the editor ---- */
PANELS.hotbar=()=>{const b=getBar(),c=CLASSES[P.cls];
  const icon=e=>e?(e.s?(typeof skillIconURL==='function'?`<img src="${skillIconURL(e.s)}" alt="">`:`<span>${SKILLS[e.s].g}</span>`):(typeof itemIconURL==='function'?`<img src="${itemIconURL(e.i)}" alt="">`:`<span>${ITEMS[e.i].g}</span>`)):'';
  const nameOf=e=>e?(e.s?SKILLS[e.s].name:ITEMS[e.i].name):'Empty';
  let h=`<h2>Hotbar</h2><div class="sub">Pick a slot, then tap a skill or an item to put it there. Something already on the bar swaps places.${matchMedia('(pointer:fine)').matches?' You can also drag slots onto each other, or drag from this list onto the bar.':''}</div>`;
  h+=`<div class="hbslots" role="radiogroup" aria-label="Hotbar slots">`+b.map((e,i)=>`<button class="hbs${i===barSel?' on':''}" role="radio" aria-checked="${i===barSel}" data-act="hbsel" data-arg="${i}" title="Slot ${i+1}: ${esc(nameOf(e))}">${icon(e)}<em>${i+1}</em></button>`).join('')+`</div>`;
  h+=`<div class="tbtns" style="justify-content:flex-start;margin:6px 0"><span class="muted" style="font-size:12px">Slot ${barSel+1}: <b>${esc(nameOf(b[barSel]))}</b></span>${b[barSel]?`<button class="btn small" data-act="hbclear">Clear slot</button>`:''}</div>`;
  const skills=c.skills.filter(id=>P.skills[id]&&SKILLS[id].kind!=='passive');
  const on=k=>b.some(x=>x&&(x.s?'s:'+x.s:'i:'+x.i)===k);
  h+=`<h3>Skills</h3>`+(skills.length?`<div class="hbpick">`+skills.map(id=>`<button class="hbp${on('s:'+id)?' used':''}" draggable="true" data-bar="s:${id}" data-act="hbput" data-arg="s:${id}" title="${esc(SKILLS[id].name)}">${icon({s:id})}<span>${esc(SKILLS[id].name)}</span></button>`).join('')+`</div>`:`<div class="sub">No skills learned yet. Learn them in the Skills window (K).</div>`);
  const items=[...new Set(P.inv.filter(e=>barItemOk(e.id)).map(e=>e.id)),...['red','orange','blue','scroll'].filter(id=>ITEMS[id])];
  const uniq=[...new Set(items)];
  h+=`<h3>Items</h3><div class="hbpick">`+uniq.map(id=>{const n=invFind(id);return `<button class="hbp${on('i:'+id)?' used':''}" draggable="true" data-bar="i:${id}" data-act="hbput" data-arg="i:${id}" title="${esc(ITEMS[id].name)}">${icon({i:id})}<span>${esc(ITEMS[id].name)} <i>×${n?n.n:0}</i></span></button>`;}).join('')+`</div>`;
  h+=`<div class="tbtns"><button class="btn small" data-act="hbreset">Reset to the usual layout</button><button class="btn small" data-act="close">Done</button></div>`;return h;};
PANEL_ACTS.hbsel=i=>{barSel=clamp(+i||0,0,BAR_N-1);refreshPanel();};
PANEL_ACTS.hbput=arg=>{const [k,id]=arg.split(':');barSet(barSel,k==='s'?{s:id}:{i:id});sfx('click');
  const b=getBar(),next=b.findIndex((x,j)=>j>barSel&&!x);barSel=next>=0?next:barSel;refreshPanel();};
PANEL_ACTS.hbclear=()=>{barSet(barSel,null);refreshPanel();};
PANEL_ACTS.hbreset=()=>{P.bar=null;P.hot=null;getBar();rebuildHotbar();save();refreshPanel();};
