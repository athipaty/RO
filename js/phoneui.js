"use strict";
/* ================= phones: easier to read, easier to reach =================
   1. HP and SP bars along the very top edge of the screen: thin, full width, readable from the corner of your eye
      (they pulse red under 25% HP). The status box still has the numbers.
   2. Upright, the quick window buttons (Stats, Skills, Items, Equip, Quests) sit in a column on the left above the chat,
      where the thumb is, instead of up under the map (sideways already has its row on the left, js/quickleft.js).
      Settings → Buttons by the thumb puts them back at the top.
   3. Windows slide up from the bottom like a sheet, with a grab handle; swipe down on the handle or the title to close. */
const PUI={bars:null};
const puiTouch=()=>document.body.classList.contains('touchui');
const upright=()=>puiTouch()&&innerHeight>innerWidth;

/* ---- 1. top bars ---- */
function puiBars(){if(!puiTouch()||!P||!running||!S){if(PUI.bars)PUI.bars.hidden=true;return;}
  let el=PUI.bars;if(!el){el=PUI.bars=document.createElement('div');el.id='topBars';el.setAttribute('aria-hidden','true');el.innerHTML='<i class="hp"></i><i class="sp"></i>';document.body.appendChild(el);}
  el.hidden=false;const hp=Math.max(0,Math.min(1,P.hp/S.maxhp)),sp=Math.max(0,Math.min(1,P.sp/S.maxsp)),h=(hp*100).toFixed(1)+'%',s=(sp*100).toFixed(1)+'%';
  if(el._h!==h){el._h=h;el.firstChild.style.width=h;}if(el._s!==s){el._s=s;el.lastChild.style.width=s;}
  const low=hp<.25&&!P.dead;if(el.classList.contains('low')!==low)el.classList.toggle('low',low);}
{const _uh=updateHud;updateHud=function(){const r=_uh.apply(this,arguments);try{puiBars();}catch(e){}return r;};}

/* ---- 2. upright: quick buttons in a column by the thumb ---- */
const thumbOn=()=>!(typeof SETS!=='undefined'&&SETS.thumb===false);
function puiThumb(){const on=upright()&&thumbOn()&&running;if(document.body.classList.contains('thumbq')!==on)document.body.classList.toggle('thumbq',on);
  if(!on)return;const log=document.getElementById('log'),q=document.getElementById('quick');if(!log||!q)return;
  const lr=log.getBoundingClientRect(),b=Math.round(innerHeight-(lr.height?lr.top:innerHeight-120)+10)+'px';if(q.style.getPropertyValue('--qb')!==b)q.style.setProperty('--qb',b);}
setInterval(()=>{try{puiThumb();}catch(e){}},400);addEventListener('resize',()=>setTimeout(()=>{try{puiThumb();}catch(e){}},80));

/* ---- 3. windows as sheets: slide up, grab handle, swipe down to close ---- */
{let y0=null,dy=0,dragging=false;
  const grab=e=>{if(!puiTouch()||panel.hidden)return false;const t=e.target;return !!(t.closest('.sheetgrip')||(t.closest('#panel h2')&&panel.scrollTop<=0));};
  panel.addEventListener('touchstart',e=>{if(!grab(e)||e.touches.length!==1)return;y0=e.touches[0].clientY;dy=0;dragging=true;panel.style.transition='none';},{passive:true});
  panel.addEventListener('touchmove',e=>{if(!dragging)return;dy=Math.max(0,e.touches[0].clientY-y0);panel.style.translate=`0 ${dy}px`;},{passive:true});
  const end=()=>{if(!dragging)return;dragging=false;panel.style.transition='';const close=dy>Math.min(140,innerHeight*.22);panel.style.translate='';if(close)closePanel();};
  panel.addEventListener('touchend',end);panel.addEventListener('touchcancel',end);}
{const _opS=openPanel;openPanel=function(kind){const was=panel.hidden;const r=_opS.apply(this,arguments);
  try{if(puiTouch()&&was&&!panel.hidden){panel.classList.remove('sheetin');void panel.offsetWidth;panel.classList.add('sheetin');}}catch(e){}return r;};}
{const _rpS=refreshPanel;refreshPanel=function(){const r=_rpS.apply(this,arguments);try{if(puiTouch()&&!panel.hidden&&!panel.querySelector('.sheetgrip'))panel.insertAdjacentHTML('afterbegin','<div class="sheetgrip" aria-hidden="true"></div>');}catch(e){}return r;};}

/* ---- settings ---- */
if(typeof PANELS!=='undefined'&&PANELS.settings){const _psU=PANELS.settings;PANELS.settings=function(){const h=_psU.apply(this,arguments);
  const row=`<div class="setrow"><div class="grow"><div class="nm">Buttons by the thumb</div><div class="ds">Phones upright: Stats, Skills, Items, Equip and Quests in a column on the left above the chat</div></div>${toggle('setthumb',thumbOn(),'Buttons by the thumb on or off')}</div>`;
  const at=h.indexOf('<div class="setrow"><div class="grow"><div class="nm">Monster card');return at<0?h+row:h.slice(0,at)+row+h.slice(at);};}
PANEL_ACTS.setthumb=()=>{SETS.thumb=!thumbOn();saveSets();puiThumb();refreshPanel();};
if(typeof TH!=='undefined')Object.assign(TH,{'Buttons by the thumb':'ปุ่มใกล้นิ้วโป้ง','Phones upright: Stats, Skills, Items, Equip and Quests in a column on the left above the chat':'มือถือแนวตั้ง: ปุ่มสถานะ สกิล ไอเทม อุปกรณ์ และเควส เรียงเป็นแถวด้านซ้ายเหนือแชท','Buttons by the thumb on or off':'เปิดหรือปิดปุ่มใกล้นิ้วโป้ง'});
