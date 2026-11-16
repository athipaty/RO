"use strict";
/* ================= phones: switch between your own windows without closing them =================
   On a phone, Stats, Items, Equip, Skills and Quests show a row of tabs fixed along the bottom, centred. Tap a tab to jump straight to
   that window, or swipe left / right on the window to go to the next / previous one. The ✕ still closes.
   Swipes that start on something that scrolls sideways (a tab row, a slider) are left alone. Desktop is unchanged. */
const WIN_TABS=[
  ['status','Stats','<path d="M5 20V12M10 20V6M15 20v-9M20 20V9"/>'],
  ['items','Items','<path d="M5.5 9h13l-1.2 11.5H6.7z"/><path d="M9 9V7a3 3 0 0 1 6 0v2"/>'],
  ['equip','Equip','<path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z"/>'],
  ['skills','Skills','<path d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.5 6.7 19.4l1.2-6L3.4 9.3l6-.7z"/>'],
  ['quests','Quests','<path d="M7 3h10v18l-5-3-5 3z"/><path d="M10 8h4M10 11h4"/>']];
// windows opened from one of these count as that tab (the Build guide is part of Skills)
const WIN_TAB_OF={buildguide:'skills'};
const winTabKind=()=>WIN_TAB_OF[panelKind]||panelKind;
const winTabOn=()=>document.body.classList.contains('touchui')&&!!panelKind&&!panel.hidden&&WIN_TABS.some(w=>w[0]===winTabKind());
function winTabGo(kind,dir){if(!kind||kind===panelKind||!P)return;sfx('click');openPanel(kind);
  if(dir){panel.classList.remove('wtL','wtR');void panel.offsetWidth;panel.classList.add(dir>0?'wtR':'wtL');setTimeout(()=>panel.classList.remove('wtL','wtR'),260);}}
function winTabStep(d){const i=WIN_TABS.findIndex(w=>w[0]===winTabKind());if(i<0)return;const n=WIN_TABS[(i+d+WIN_TABS.length)%WIN_TABS.length][0];winTabGo(n,d);}
function winTabsDraw(){const old=panel.querySelector(':scope>#winTabs');
  panel.classList.toggle('wtPad',winTabOn());
  if(!winTabOn()){if(old)old.remove();return;}
  let nav=old;if(!nav){nav=document.createElement('nav');nav.id='winTabs';nav.setAttribute('role','tablist');nav.setAttribute('aria-label','Your windows');
    nav.innerHTML=WIN_TABS.map(([k,t,p])=>`<button type="button" role="tab" class="wtab" data-wt="${k}"><svg viewBox="0 0 24 24" aria-hidden="true">${p}</svg><span>${t}</span></button>`).join('');
    nav.addEventListener('click',ev=>{const b=ev.target.closest('.wtab');if(!b)return;ev.stopPropagation();winTabGo(b.dataset.wt,0);});}
  // first thing in the window, after the close button
  const x=panel.querySelector(':scope>.x');if(x){if(x.nextSibling!==nav)x.insertAdjacentElement('afterend',nav);}else if(panel.firstChild!==nav)panel.prepend(nav);
  for(const b of nav.querySelectorAll('.wtab')){const on=b.dataset.wt===winTabKind();b.classList.toggle('on',on);b.setAttribute('aria-selected',String(on));}}
/* the Build guide gets a way back to the Skills window it was opened from (phones and computers) */
function bgBackDraw(){if(panelKind!=='buildguide'||panel.querySelector('.bgback'))return;const b=document.createElement('button');b.type='button';b.className='btn small bgback';b.dataset.act='bgback';b.textContent='← Skills';
  const x=panel.querySelector(':scope>.x');if(x)x.after(b);else panel.prepend(b);}
PANEL_ACTS.bgback=()=>{sfx('click');openPanel('skills');};
{const _rpWt=refreshPanel;refreshPanel=function(){const r=_rpWt.apply(this,arguments);try{winTabsDraw();bgBackDraw();}catch(e){}return r;};}
// swipe left / right on the window
(()=>{let sx=0,sy=0,st=0,ok=false;
  const sideScroll=el=>{for(let e=el;e&&e!==panel;e=e.parentElement){if(e.matches&&e.matches('input,textarea,select,[type=range]'))return true;
    if(e.scrollWidth>e.clientWidth+4){const ox=getComputedStyle(e).overflowX;if(ox==='auto'||ox==='scroll')return true;}}return false;};
  panel.addEventListener('touchstart',ev=>{ok=false;if(!winTabOn()||ev.touches.length!==1)return;const t=ev.touches[0];
    if(sideScroll(ev.target))return;sx=t.clientX;sy=t.clientY;st=performance.now();ok=true;},{passive:true});
  panel.addEventListener('touchend',ev=>{if(!ok)return;ok=false;const t=ev.changedTouches[0],dx=t.clientX-sx,dy=t.clientY-sy;
    if(Math.abs(dx)>70&&Math.abs(dx)>Math.abs(dy)*1.6&&performance.now()-st<700)winTabStep(dx<0?1:-1);},{passive:true});})();
if(typeof TH!=='undefined')Object.assign(TH,{'← Skills':'← สกิล','Your windows':'หน้าต่างของคุณ','Stats':'สถานะ','Items':'ไอเทม','Equip':'สวมใส่','Skills':'สกิล','Quests':'เควส'});
