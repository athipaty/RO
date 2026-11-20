"use strict";
/* ================= Phone skill buttons: multi-touch and drag-aim (v1.44.0) =================
   1. Tapping a skill or round button with a second finger (while the other thumb holds the joystick) now works:
      browsers only send "click" for a lone tap, so a tap from any extra finger is turned into a press here.
   2. Area and ground skills (Arrow Rain, Arc Storm, Ember Wall, Haven…) aim like a MOBA: press the skill button and
      drag; the button becomes a small stick, the aim circle moves around the hero within the skill's reach (a ring
      shows the reach), and letting go casts there. Drag onto Cancel (top of the screen) to call it off.
      A quick tap without dragging works as before (casts on your target, or asks for a tap on the ground). */
const DA={on:null,swallow:null,R:80,START:16};
const daBtnSel='#hotbar .slot, #actions > .act';
const daAimable=id=>{const k=SKILLS[id]&&SKILLS[id].kind;return k==='area'||k==='ground';};
function daCancelEl(){let el=document.getElementById('daCancel');
  if(!el){el=document.createElement('div');el.id='daCancel';el.hidden=true;el.setAttribute('aria-hidden','true');
    el.innerHTML='<b>✕</b><span>Cancel</span>';document.body.appendChild(el);}return el;}
function daStick(){let el=document.getElementById('daStick');
  if(!el){el=document.createElement('div');el.id='daStick';el.hidden=true;el.setAttribute('aria-hidden','true');el.innerHTML='<i></i>';document.body.appendChild(el);}return el;}
function daOverCancel(x,y){const c=document.getElementById('daCancel');if(!c||c.hidden)return false;const r=c.getBoundingClientRect(),m=14;
  return x>=r.left-m&&x<=r.right+m&&y>=r.top-m&&y<=r.bottom+m;}
/* finger offset from where the press began -> a spot around the hero, in the same screen direction */
function daAimFrom(dx,dy){const sk=SKILLS[DA.on.id],d=Math.hypot(dx,dy)||1,f=Math.min(1,d/DA.R),hs=proj(P.x,P.y);
  const w=unproj(hs.x+dx/d*f*sk.range*1.1,hs.y+dy/d*f*sk.range*.55);
  let ox=w.x-P.x,oy=w.y-P.y;const wd=Math.hypot(ox,oy)||1;if(wd>sk.range){ox*=sk.range/wd;oy*=sk.range/wd;}
  return {x:P.x+ox,y:P.y+oy};}
function daShowStick(dx,dy){const s=daStick(),d=Math.hypot(dx,dy)||1,k=Math.min(1,d/DA.R);
  Object.assign(s.style,{left:DA.on.cx+'px',top:DA.on.cy+'px'});s.firstChild.style.transform=`translate(${dx/d*k*DA.R*.55}px,${dy/d*k*DA.R*.55}px)`;s.hidden=false;}
function daEnd(cast){const a=DA.on;DA.on=null;daStick().hidden=true;daCancelEl().hidden=true;document.body.classList.remove('daAiming');
  if(!a||!a.aiming)return;
  if(cast&&AIM&&AIM.drag&&aimAt){AIM.drag=false;aimCast(aimAt);}else if(AIM&&AIM.drag)aimCancel();}
function daPress(el){DA.swallow={el,t:performance.now()};el.click();DA.swallow={el,t:performance.now(),after:true};}

document.addEventListener('pointerdown',ev=>{if(ev.pointerType==='mouse'||!document.body.classList.contains('touchui'))return;
  const el=ev.target.closest&&ev.target.closest(daBtnSel);if(!el||el.disabled||(DA.on&&DA.on.aiming))return;
  const r=el.getBoundingClientRect(),s=el._slot&&el._slot.skill;
  DA.on={el,pid:ev.pointerId,x0:ev.clientX,y0:ev.clientY,cx:r.left+r.width/2,cy:r.top+r.height/2,id:s,primary:ev.isPrimary,aiming:false,moved:false};},true);

document.addEventListener('pointermove',ev=>{const a=DA.on;if(!a||ev.pointerId!==a.pid)return;
  const dx=ev.clientX-a.x0,dy=ev.clientY-a.y0;
  if(!a.aiming){if(Math.hypot(dx,dy)<DA.START)return;a.moved=true;
    if(!a.id||!daAimable(a.id)||!P||!running||!P.skills[a.id])return;
    if(AIM)aimCancel();if(!aimStart(a.id)){DA.on=null;return;}
    a.aiming=true;AIM.drag=true;document.body.classList.add('daAiming');daCancelEl().hidden=false;}
  ev.preventDefault();aimAt=daAimFrom(dx,dy);AIM.cancel=daOverCancel(ev.clientX,ev.clientY);
  daCancelEl().classList.toggle('hot',AIM.cancel);daShowStick(dx,dy);},{capture:true,passive:false});

function daUp(ev){const a=DA.on;if(!a||ev.pointerId!==a.pid)return;
  if(a.aiming){ev.preventDefault();const cancel=ev.type==='pointercancel'||daOverCancel(ev.clientX,ev.clientY);
    DA.swallow={el:a.el,t:performance.now(),after:true};daEnd(!cancel);return;}
  DA.on=null;
  // a tap from a second finger: browsers send no click, so press it here (a primary tap still gets its own click)
  if(!a.primary&&!a.moved&&ev.type==='pointerup'){const el=document.elementFromPoint(ev.clientX,ev.clientY);if(el&&a.el.contains(el))daPress(a.el);}}
document.addEventListener('pointerup',daUp,true);document.addEventListener('pointercancel',daUp,true);

/* never press twice: the browser's own click right after a press made here (or after a drag-aim) is dropped */
document.addEventListener('click',ev=>{const s=DA.swallow;if(!s||!s.after)return;
  if(performance.now()-s.t>700){DA.swallow=null;return;}
  if(s.el===ev.target||s.el.contains(ev.target)){ev.stopImmediatePropagation();ev.preventDefault();DA.swallow=null;}},true);

if(typeof TH!=='undefined')TH['Cancel']=TH['Cancel']||'ยกเลิก';
