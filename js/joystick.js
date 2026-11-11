"use strict";
/* ================= phone joystick =================
   On a touch screen, put a thumb anywhere on the game and drag: a stick appears under the thumb and the
   character walks that way while you hold (further = faster). A plain tap still walks, attacks, picks up
   or talks as before; it is only acted on when the finger lifts without dragging. */
const JOY={on:false,x:0,y:0,id:null,sx:0,sy:0,down:null,dragging:false};
const JOY_R=52,JOY_START=14; // stick radius and how far a finger moves before it counts as a drag (CSS px)
const joyEl=(()=>{const el=document.createElement('div');el.id='joy';el.hidden=true;el.setAttribute('aria-hidden','true');el.innerHTML='<i></i>';document.body.appendChild(el);return el;})();
const joyTouch=ev=>ev.pointerType==='touch'||(ev.pointerType==='pen'&&document.body.classList.contains('touchui'));
function joyShow(){joyEl.style.left=JOY.sx+'px';joyEl.style.top=JOY.sy+'px';joyEl.hidden=false;}
function joyKnob(dx,dy){joyEl.firstChild.style.transform=`translate(${dx}px,${dy}px)`;}
function joyStop(){JOY.on=false;JOY.x=JOY.y=0;JOY.id=null;JOY.dragging=false;JOY.down=null;joyEl.hidden=true;joyKnob(0,0);}

// hold back the tap until we know it isn't a drag
document.addEventListener('pointerdown',ev=>{if(ev.target!==cv||ev.__joyTap||!joyTouch(ev))return;if(JOY.id!==null&&JOY.id!==ev.pointerId)return;
  ev.stopImmediatePropagation();audioInit();
  JOY.id=ev.pointerId;JOY.sx=ev.clientX;JOY.sy=ev.clientY;JOY.down={clientX:ev.clientX,clientY:ev.clientY,pointerId:ev.pointerId};JOY.dragging=false;
  try{cv.setPointerCapture(ev.pointerId);}catch(e){}},true);
cv.addEventListener('pointermove',ev=>{if(ev.pointerId!==JOY.id)return;
  const dx=ev.clientX-JOY.sx,dy=ev.clientY-JOY.sy,d=Math.hypot(dx,dy);
  if(!JOY.dragging){if(d<JOY_START)return;if(!P||P.dead||!running)return;
    if(typeof npcBusy==='function'&&npcBusy()){busyHint();return;}
    JOY.dragging=true;JOY.on=true;joyShow();if(typeof FOL!=='undefined'&&FOL)followStop(`You stopped following ${FOL.name}.`);}
  const k=d>JOY_R?JOY_R/d:1;joyKnob(dx*k,dy*k);JOY.x=dx*k/JOY_R;JOY.y=dy*k/JOY_R;});
function joyUp(ev){if(ev.pointerId!==JOY.id)return;const tap=!JOY.dragging&&JOY.down&&ev.type==='pointerup';const d=JOY.down;joyStop();
  if(tap){const e=new PointerEvent('pointerdown',{clientX:d.clientX,clientY:d.clientY,pointerId:d.pointerId,pointerType:'touch',bubbles:true,cancelable:true});e.__joyTap=true;cv.dispatchEvent(e);}}
cv.addEventListener('pointerup',joyUp);cv.addEventListener('pointercancel',joyUp);
window.addEventListener('blur',joyStop);
