"use strict";
/* ================= #61 draggable windows that remember their place (desktop; phones keep them centred) ================= */
const WINPOS_KEY='embervale.winpos';
let winPos=(()=>{try{return JSON.parse(localStorage.getItem(WINPOS_KEY)||'{}')||{};}catch(e){return {};}})();
const dragOK=()=>window.innerWidth>700&&window.matchMedia('(pointer:fine)').matches;
function saveWinPos(){try{localStorage.setItem(WINPOS_KEY,JSON.stringify(winPos));}catch(e){}}
function centrePanel(){panel.style.left=panel.style.top=panel.style.transform='';}
// put the window where it was left for this kind, kept fully on screen
function applyPanelPos(){const p=panelKind&&winPos[panelKind];if(!p||!dragOK()){centrePanel();return;}
  const r=panel.getBoundingClientRect(),x=clamp(p[0],0,Math.max(0,window.innerWidth-r.width)),y=clamp(p[1],0,Math.max(0,window.innerHeight-60));
  panel.style.transform='none';panel.style.left=x+'px';panel.style.top=y+'px';}
const _openPanelD=openPanel;
openPanel=function(kind,arg){const was=panelKind;_openPanelD(kind,arg);if(kind!==was||!panel.style.left)applyPanelPos();};
let drag=null;
panel.addEventListener('pointerdown',ev=>{if(!dragOK()||ev.button!==0)return;const h=ev.target.closest('h2');if(!h||!panel.contains(h))return;
  const r=panel.getBoundingClientRect();drag={dx:ev.clientX-r.left,dy:ev.clientY-r.top,id:ev.pointerId};
  panel.style.transform='none';panel.style.left=r.left+'px';panel.style.top=r.top+'px';panel.classList.add('dragging');h.setPointerCapture(ev.pointerId);ev.preventDefault();});
panel.addEventListener('pointermove',ev=>{if(!drag||ev.pointerId!==drag.id)return;const r=panel.getBoundingClientRect();
  const x=clamp(ev.clientX-drag.dx,0,Math.max(0,window.innerWidth-r.width)),y=clamp(ev.clientY-drag.dy,0,Math.max(0,window.innerHeight-60));
  panel.style.left=x+'px';panel.style.top=y+'px';});
const endDrag=ev=>{if(!drag||ev.pointerId!==drag.id)return;drag=null;panel.classList.remove('dragging');
  if(panelKind){const r=panel.getBoundingClientRect();winPos[panelKind]=[Math.round(r.left),Math.round(r.top)];saveWinPos();}};
panel.addEventListener('pointerup',endDrag);panel.addEventListener('pointercancel',endDrag);
// double-click the title: back to the middle
panel.addEventListener('dblclick',ev=>{if(!ev.target.closest('h2')||!panelKind)return;delete winPos[panelKind];saveWinPos();centrePanel();});
window.addEventListener('resize',()=>{if(!panel.hidden)applyPanelPos();});
