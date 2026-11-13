"use strict";
/* ================= phones: switch the shortcut slots between pages 1, 2 and 3 =================
   On a computer, hotbar rows 2 and 3 have their own keys (Alt+1-8, F1-F8). Phones only had the slot ring around
   Attack, so pages 2 and 3 could not be reached. A round page button on the right side now switches the ring
   between page 1 (the main bar), page 2 and page 3. Tapping, cooldowns and counts work as usual; an empty slot,
   or the editor, fills the page you are on. The button picks a free spot near Attack so it never covers anything.
   The page is remembered on this device. */
const HP={page:(()=>{try{return Math.max(0,Math.min(2,+localStorage.getItem('embervale.hotPage')||0));}catch(e){return 0;}})()};
const hpPhone=()=>document.body.classList.contains('touchui');
// on phones all three pages exist (the extra rows above the bar stay hidden there: the page button replaces them),
// so the editor's row tabs and its row checks allow pages 2 and 3
if(typeof hbRows==='function'){const _hbRowsHP=hbRows;hbRows=function(){return hpPhone()?2:_hbRowsHP.apply(this,arguments);};}
// the slot ring shows the chosen page (main bar = page 1)
const _hotSlotsHP=hotSlots;
hotSlots=function(){if(!P||!hpPhone()||!HP.page||typeof rowGet!=='function')return _hotSlotsHP.apply(this,arguments);
  return rowGet(HP.page).map(e=>e?(e.s?{skill:e.s}:{item:e.i}):null);};
// an empty slot, or the editor, fills the page on screen
const _rebuildHotbarHP=rebuildHotbar;
rebuildHotbar=function(){_rebuildHotbarHP.apply(this,arguments);if(!P||!hpPhone()||!HP.page)return;const hb=$('#hotbar');if(!hb)return;
  for(const el of hb.querySelectorAll('.slot.empty[data-i]'))el.onclick=()=>{editRow=HP.page;barSel=+el.dataset.i;openPanel('hotbar');};};
const _openPanelHP=openPanel;
openPanel=function(kind){if(kind==='hotbar'&&hpPhone()&&panelKind!=='hotbar'&&typeof editRow!=='undefined')editRow=HP.page;return _openPanelHP.apply(this,arguments);};
// the editor writes rows 2/3 through rowSet: show the change on the ring straight away
if(typeof rowSet==='function'){const _rowSetHP=rowSet;rowSet=function(){const r=_rowSetHP.apply(this,arguments);if(hpPhone()&&HP.page)rebuildHotbar();return r;};}

function hpSet(p){HP.page=((p%3)+3)%3;try{localStorage.setItem('embervale.hotPage',String(HP.page));}catch(e){}
  rebuildHotbar();hpDraw();sfx('click');
  const btn=$('#hotPage');if(btn){btn.classList.remove('flip');void btn.offsetWidth;btn.classList.add('flip');}
  if(P)floatT(P.x,P.y-56,`Shortcuts · page ${HP.page+1}`,'#ffe7a0',13);}
const pageBtn=document.createElement('button');pageBtn.type='button';pageBtn.id='hotPage';pageBtn.hidden=true;
pageBtn.innerHTML='<b></b><span class="dots"><i></i><i></i><i></i></span>';
pageBtn.addEventListener('click',ev=>{ev.stopPropagation();if(!P||!running)return;hpSet(HP.page+1);});
['pointerdown','pointerup'].forEach(e=>pageBtn.addEventListener(e,ev=>ev.stopPropagation()));
document.body.appendChild(pageBtn);
function hpDraw(){pageBtn.querySelector('b').textContent=String(HP.page+1);
  pageBtn.querySelectorAll('.dots i').forEach((d,i)=>d.classList.toggle('on',i===HP.page));
  const t=`Shortcut page ${HP.page+1} of 3: tap for page ${(HP.page+1)%3+1}`;pageBtn.title=t;pageBtn.setAttribute('aria-label',t);}
// place it on the right side, at the free spot nearest the Attack button
function hpPlace(){const on=hpPhone()&&running&&!!P;pageBtn.hidden=!on;if(!on)return;
  const vis=e=>{const s=getComputedStyle(e);if(s.display==='none'||s.visibility==='hidden')return false;const r=e.getBoundingClientRect();return r.width>2&&r.height>2;};
  const busy=[...document.querySelectorAll('#hotbar .slot,#actions>.act,#hotbar button,#minibox,#quick .qk,#quickL>button,#buffs .buff,#onlineBadge,#log,#partyBox,#hud')].filter(e=>e!==pageBtn&&vis(e)).map(e=>e.getBoundingClientRect());
  const atk=$('#atkBtn'),ar=atk&&vis(atk)?atk.getBoundingClientRect():{left:innerWidth-90,top:innerHeight-90,width:80,height:80};
  const sig=innerWidth+'x'+innerHeight+'|'+Math.round(ar.left)+','+Math.round(ar.top)+'|'+busy.map(r=>Math.round(r.left)+','+Math.round(r.top)+','+Math.round(r.width)+','+Math.round(r.height)).join(';');
  if(sig===hpPlace.sig)return;hpPlace.sig=sig;
  const ax=ar.left+ar.width/2,ay=ar.top+ar.height/2,S=40,m=6;
  const free=(x,y)=>x-S/2>=8&&x+S/2<=innerWidth-8&&y-S/2>=8&&y+S/2<=innerHeight-8&&busy.every(r=>x+S/2+m<=r.left||x-S/2-m>=r.right||y+S/2+m<=r.top||y-S/2-m>=r.bottom);
  let best=null,bd=1e9;for(let x=innerWidth-8-S/2;x>innerWidth*.5;x-=8)for(let y=8+S/2;y<innerHeight-8-S/2;y+=8){if(!free(x,y))continue;const d=Math.hypot(x-ax,y-ay);if(d<bd){bd=d;best=[x,y];}}
  if(best){pageBtn.style.left=Math.round(best[0]-S/2)+'px';pageBtn.style.top=Math.round(best[1]-S/2)+'px';}}
hpDraw();setInterval(hpPlace,700);addEventListener('resize',()=>setTimeout(hpPlace,120));
// a new hero starts on page 1
if(typeof startWith==='function'){const _swHP=startWith;startWith=function(data){if(!data){HP.page=0;try{localStorage.setItem("embervale.hotPage","0");}catch(e){}hpDraw();}return _swHP.apply(this,arguments);};}
