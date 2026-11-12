"use strict";
/* ================= #62 several hotbar rows =================
   Up to two extra rows of 8 above the main bar (Settings → Hotbar rows, or the ＋ / − buttons beside it).
   Row 2 uses Alt+1–8, row 3 uses F1–F8 (F1–F8 still press row 1 while row 3 is hidden). Slots take any skill
   or usable item; drag between rows, or fill them from the hotbar editor (✎), which now has row tabs.
   Extra rows are hidden on phones, where the main bar sits in arcs around Attack. Saved in P.bars. */
const ROW_KEYS=['Alt+','F'];
let editRow=0,rowDrag=null,rowEls=[];
function hbRows(){return clamp(P&&P.hbRows|0,0,2);}
function getRows(){if(!Array.isArray(P.bars))P.bars=[];
  for(let r=0;r<2;r++){const row=Array.isArray(P.bars[r])?P.bars[r]:[];const b=row.slice(0,BAR_N).map(barEntry);while(b.length<BAR_N)b.push(null);P.bars[r]=b;}
  return P.bars;}
// row 0 is the main bar (P.bar); rows 1 and 2 are the extra ones
function rowGet(r){return r?getRows()[r-1]:getBar();}
function rowSet(r,i,e){if(!r)return barSet(i,e);const b=getRows()[r-1];if(!(i>=0&&i<BAR_N))return;
  const key=x=>x?(x.s?'s:'+x.s:'i:'+x.i):'';const was=e?b.findIndex(x=>key(x)===key(e)):-1;
  if(was>=0&&was!==i)b[was]=b[i];b[i]=e;buildRows(true);save();}
function rowSwap(a,c){if(a.r===c.r&&a.i===c.i)return;const A=rowGet(a.r),C=rowGet(c.r);[A[a.i],C[c.i]]=[C[c.i],A[a.i]];
  if(!a.r||!c.r){P.bar=getBar();rebuildHotbar();}buildRows(true);save();}
function pressRow(r,i){const e=rowGet(r)[i];if(!e)return;if(e.s){if(!P.skills[e.s]){addLog(`Learn ${SKILLS[e.s].name} in the Skills window (K).`);return;}useSkill(e.s);}else useItem(e.i);}

/* ---- the extra rows on screen ---- */
function buildRows(force){if(!P)return;let box=$('#hotrows');
  if(!box){box=document.createElement('div');box.id='hotrows';document.body.appendChild(box);}
  const n=hbRows(),sig=n+JSON.stringify(getRows().slice(0,n));if(!force&&box._sig===sig)return;box._sig=sig;
  box.innerHTML='';rowEls=[];box.hidden=!n;
  for(let r=n;r>=1;r--){const row=document.createElement('div');row.className='hrow';row.setAttribute('aria-label','Hotbar row '+(r+1));
    rowGet(r).forEach((e,i)=>{const b=document.createElement('button');b.type='button';b.className='slot hrs'+(e?'':' empty');b.dataset.r=r;b.dataset.i=i;b.draggable=true;
      const d=e?(e.s?SKILLS[e.s]:ITEMS[e.i]):null,key=ROW_KEYS[r-1]+(i+1);
      b.title=d?`${d.name} (${key})`:`Empty slot ${key}: tap to choose`;b.setAttribute('aria-label',b.title);
      b.innerHTML=(e?(e.i&&typeof itemIconURL==='function'?`<img class="ic img" src="${itemIconURL(e.i)}" alt="">`:e.s&&typeof skillIconURL==='function'?`<img class="ic img" src="${skillIconURL(e.s)}" alt="">`:`<span class="ic" style="background:${d.col}">${d.g}</span>`):'')+`<span class="k">${key}</span><span class="cd"></span><span class="n"></span>`;
      b._slot=e?(e.s?{skill:e.s}:{item:e.i}):null;
      b.addEventListener('click',()=>{if(e)pressRow(r,i);else{editRow=r;barSel=i;openPanel('hotbar');}});
      row.appendChild(b);if(e)rowEls.push(b);});
    box.appendChild(row);}
  placeRows();}
function placeRows(){const box=$('#hotrows'),hb=$('#hotbar');if(!box||!hb||box.hidden)return;const r=hb.getBoundingClientRect();
  box.style.bottom=Math.max(0,innerHeight-r.top+4)+'px';}
// cooldowns, counts and greyed-out slots, same as the main bar
function tickRows(){for(const el of rowEls){const s=el._slot;if(!s)continue;let frac=0,off=false,n='';
    if(s.skill){const L=P.skills[s.skill]||0,l=L?castLv(s.skill):0;off=!l||P.sp<SKILLS[s.skill].sp(l||1);const r=(P.cd[s.skill]||0)-now;if(r>0)frac=r/SKILLS[s.skill].cd;n=l?String(l):'';}
    else{const e=invFind(s.item);n=e?String(e.n):'0';off=!e;const it=ITEMS[s.item];if(it&&typeof potGroup==='function'){const g=potGroup(it),r=(P.cd[g]||0)-now;if(r>0)frac=Math.min(1,r/((P.cdLen&&P.cdLen[g])||potCd(it)));}}
    const key=frac.toFixed(2)+off+n;if(el._k!==key){el._k=key;el.querySelector('.cd').style.height=(frac*100)+'%';el.classList.toggle('off',off);el.querySelector('.n').textContent=n;}}}
const _updateHudRows=updateHud;
updateHud=function(){_updateHudRows.apply(this,arguments);if(!P)return;buildRows();tickRows();if(hbRows())placeRows();};
// ＋ / − beside the main bar
const _rebuildHotbarRows=rebuildHotbar;
rebuildHotbar=function(){_rebuildHotbarRows();const hb=$('#hotbar');if(!P||!hb||hb.querySelector('#hbRows'))return;
  const b=document.createElement('button');b.id='hbRows';b.type='button';b.className='slot edit';b.title='More or fewer hotbar rows';b.setAttribute('aria-label',b.title);b.textContent='⊞';
  b.addEventListener('click',()=>{P.hbRows=(hbRows()+1)%3;sfx('click');buildRows(true);save();addLog(P.hbRows?`Hotbar rows: ${P.hbRows+1}. Row 2 uses Alt+1–8${P.hbRows>1?', row 3 uses F1–F8':''}.`:'Hotbar rows: 1.');});
  hb.appendChild(b);};

/* ---- keys: Alt+1–8 for row 2, F1–F8 for row 3 (when shown) ---- */
window.addEventListener('keydown',ev=>{if(!running||!P||ev.target.tagName==='INPUT')return;
  if(ev.altKey&&/^Digit[1-8]$/.test(ev.code)){ev.preventDefault();ev.stopImmediatePropagation();if(hbRows()>=1)pressRow(1,+ev.code.slice(5)-1);return;}
  const f=/^F([1-8])$/.exec(ev.key);if(f&&hbRows()>=2){ev.preventDefault();ev.stopImmediatePropagation();pressRow(2,+f[1]-1);}},true);

/* ---- drag and drop between rows (and to/from the main bar and the editor) ---- */
const slotOf=t=>t&&t.closest&&(t.closest('#hotrows .slot[data-r]')||t.closest('#hotbar .slot[data-i]'));
const posOf=el=>({r:el.dataset.r?+el.dataset.r:0,i:+el.dataset.i});
document.addEventListener('dragstart',ev=>{const s=ev.target.closest&&ev.target.closest('#hotrows .slot[data-r]');
  if(s){rowDrag={from:posOf(s)};try{ev.dataTransfer.setData('text/plain','bar');ev.dataTransfer.effectAllowed='move';}catch(e){}return;}
  const m=ev.target.closest&&ev.target.closest('#hotbar .slot[data-i]');rowDrag=m?{from:posOf(m)}:null;},true);
document.addEventListener('dragover',ev=>{if(!ev.target.closest)return;if((rowDrag||barDrag)&&ev.target.closest('#hotrows .slot[data-r]'))ev.preventDefault();else if(rowDrag&&rowDrag.from.r&&ev.target.closest('#hotbar .slot[data-i]'))ev.preventDefault();});
document.addEventListener('drop',ev=>{const to=slotOf(ev.target);if(!to)return;const onRow=!!to.dataset.r,d=rowDrag;
  // main bar onto main bar, or editor onto the main bar: hotbar.js handles it
  if(!onRow&&(!d||!d.from.r))return;
  ev.preventDefault();ev.stopImmediatePropagation();const p=posOf(to);
  if(d)rowSwap(d.from,p);else if(barDrag&&barDrag.put){const [k,id]=barDrag.put.split(':');rowSet(p.r,p.i,k==='s'?{s:id}:{i:id});}
  rowDrag=null;barDrag=null;if(panelKind==='hotbar')refreshPanel();},true);
document.addEventListener('dragend',()=>{rowDrag=null;});

/* ---- the editor gets row tabs ---- */
const _hotbarPanel=PANELS.hotbar;
PANELS.hotbar=()=>{if(editRow>hbRows())editRow=0;let h=_hotbarPanel();
  const tabs=`<div class="seg hbrowtabs" role="tablist" aria-label="Hotbar row">${[0,1,2].map(r=>`<button class="${r===editRow?'on':''}" role="tab" aria-selected="${r===editRow}" data-act="hbrow" data-arg="${r}">Row ${r+1}${r?` <small>${ROW_KEYS[r-1]}1–8</small>`:''}</button>`).join('')}</div>`;
  h=h.replace('</h2>','</h2>'+tabs);
  if(editRow){const b=rowGet(editRow),icon=e=>e?(e.s?`<img src="${skillIconURL(e.s)}" alt="">`:`<img src="${itemIconURL(e.i)}" alt="">`):'';
    const nameOf=e=>e?(e.s?SKILLS[e.s].name:ITEMS[e.i].name):'Empty';
    const slots=`<div class="hbslots" role="radiogroup" aria-label="Hotbar slots">`+b.map((e,i)=>`<button class="hbs${i===barSel?' on':''}" role="radio" aria-checked="${i===barSel}" data-act="hbsel" data-arg="${i}" title="Slot ${ROW_KEYS[editRow-1]}${i+1}: ${esc(nameOf(e))}">${icon(e)}<em>${i+1}</em></button>`).join('')+`</div>`;
    h=h.replace(/<div class="hbslots"[\s\S]*?<\/div><div class="tbtns"[\s\S]*?<\/div>/,slots+`<div class="tbtns" style="justify-content:flex-start;margin:6px 0"><span class="muted" style="font-size:12px">Row ${editRow+1}, slot ${barSel+1}: <b>${esc(nameOf(b[barSel]))}</b></span>${b[barSel]?`<button class="btn small" data-act="hbclear">Clear slot</button>`:''}</div>`);}
  return h;};
PANEL_ACTS.hbrow=r=>{r=clamp(+r||0,0,2);if(r>hbRows()){P.hbRows=r;buildRows(true);save();}editRow=r;barSel=0;refreshPanel();};
for(const [act,fn] of [['hbput',(arg)=>{const [k,id]=arg.split(':');rowSet(editRow,barSel,k==='s'?{s:id}:{i:id});sfx('click');const b=rowGet(editRow),next=b.findIndex((x,j)=>j>barSel&&!x);barSel=next>=0?next:barSel;refreshPanel();}],
  ['hbclear',()=>{rowSet(editRow,barSel,null);refreshPanel();}]]){const orig=PANEL_ACTS[act];PANEL_ACTS[act]=arg=>editRow?fn(arg):orig(arg);}
// the main bar's empty slots and ✎ open the editor on row 1
document.addEventListener('click',ev=>{if(ev.target.closest&&ev.target.closest('#hotbar'))editRow=0;},true);
