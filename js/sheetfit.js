"use strict";
/* ================= phones: the dialogue box at the bottom always shows its buttons (v1.45.3) =================
   Townsfolk conversations open as a box at the bottom of the screen (js/npcfull.js). On some phones the browser's
   bottom bar, the gesture bar or the keyboard covered its lower edge, so Accept / Turn in / Goodbye showed only
   their top half. Now:
   1. the box sits on the edge of what is really visible (visualViewport), not the edge of the layout;
   2. its last row of buttons is pinned to the bottom of the box, so it stays whole even when the text scrolls. */
function sheetFitVars(){const v=window.visualViewport,r=document.documentElement;if(!v)return;
  const lift=Math.max(0,Math.round(innerHeight-(v.height+v.offsetTop)));
  r.style.setProperty('--vvh',Math.round(v.height)+'px');r.style.setProperty('--vvlift',lift+'px');}
if(window.visualViewport){visualViewport.addEventListener('resize',sheetFitVars);visualViewport.addEventListener('scroll',sheetFitVars);}
addEventListener('resize',sheetFitVars);sheetFitVars();
// mark the last button row of a dialogue box as its action bar
function sheetMarkActs(){if(typeof panel==='undefined'||!panel||!panel.classList.contains('npcsheet'))return;
  // the row that holds the box's last button (Accept trial, Turn in, Goodbye ...), when it is a short row
  const btns=[...panel.querySelectorAll('button.btn')].filter(x=>!x.classList.contains('x')&&x.offsetParent),lb=btns[btns.length-1];
  let last=lb&&(lb.closest('.tbtns')||(lb.parentElement&&[...lb.parentElement.children].every(c=>c.tagName==='BUTTON')?lb.parentElement:null)); // only a row of buttonsif(last&&(last===panel||!last.classList.contains('sheetacts')&&last.offsetHeight>130))last=null; // measured before it is pinned (pinning adds padding)
  for(const r of panel.querySelectorAll('.sheetacts'))if(r!==last)r.classList.remove('sheetacts');
  if(last&&!last.classList.contains('sheetacts'))last.classList.add('sheetacts');}
if(typeof panel!=='undefined'&&panel)new MutationObserver(()=>{sheetFitVars();sheetMarkActs();}).observe(panel,{childList:true,subtree:true,attributes:true,attributeFilter:['class','hidden']});
