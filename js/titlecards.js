"use strict";
/* ================= the title screen, simpler (v1.52.5) =================
   - Your heroes: one card. ‹ › on each side of the hero (or swipe, or the arrow keys) go through your slots; under the
     hero, their name, level and class, and a dot for each slot. An empty slot shows the new-hero screen. (The six slot
     buttons are still in the page for the code that uses them, just not shown.)
   - Account: one line on top. As a guest, "Playing as a guest" and a Log in button that opens the sign-in form; signed
     in, "Signed in as name" and Log out.
   - The story blurb under the name field is gone. */
const TC={formOpen:false};
const tcOpenSlots=()=>{const a=[];for(let n=0;n<SLOTS;n++)if(slotOpen(n))a.push(n);return a;};
function tcStep(d){const open=tcOpenSlots();if(open.length<2)return;const i=open.indexOf(CS.slot),n=open[(i+d+open.length)%open.length];
  sfx('click');setSlot(n);acMsg('');refreshTitle();}

/* ---- the hero card: arrows, name line and dots ---- */
(()=>{const cv=document.querySelector('#title .t-cv'),stage=document.querySelector('#title .t-stage');if(!cv||!stage)return;
  const mk=(id,d,label,path)=>{const b=document.createElement('button');b.type='button';b.id=id;b.className='tcArrow';b.setAttribute('aria-label',label);b.title=label;
    b.innerHTML=`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${path}"/></svg>`;b.addEventListener('click',ev=>{ev.stopPropagation();tcStep(d);});return b;};
  cv.append(mk('slotPrev',-1,'Previous character','M15 5l-7 7 7 7'),mk('slotNext',1,'Next character','M9 5l7 7-7 7'));
  const info=document.createElement('div');info.id='slotInfo';info.innerHTML='<b id="slotName"></b><span id="slotDesc"></span><div id="slotDots" role="tablist" aria-label="Character slots"></div>';
  cv.after(info);
  // swipe across the hero to change slot
  let x0=null;stage.addEventListener('pointerdown',ev=>{if(ev.target.closest('input,button'))return;x0=ev.clientX;});
  stage.addEventListener('pointerup',ev=>{if(x0===null)return;const dx=ev.clientX-x0;x0=null;if(Math.abs(dx)>45)tcStep(dx<0?1:-1);});
  addEventListener('keydown',ev=>{const t=document.getElementById('title');if(!t||t.hidden||/INPUT|TEXTAREA/.test(ev.target.tagName))return;
    if(ev.key==='ArrowLeft'){ev.preventDefault();tcStep(-1);}else if(ev.key==='ArrowRight'){ev.preventDefault();tcStep(1);}});})();

/* ---- a new hero: the looks sit in the card right under the hero, so every change shows without scrolling ---- */
(()=>{const cr=document.getElementById('creator'),stage=document.querySelector('#title .t-stage');if(!cr||!stage)return;
  const name=stage.querySelector('.t-name');if(name)name.after(cr);else stage.appendChild(cr);cr.classList.add('tcCreator');})();

/* ---- the account line ---- */
(()=>{const acct=document.getElementById('acct');if(!acct)return;
  const bar=document.createElement('div');bar.id='acBar';
  bar.innerHTML='<span id="acWho"></span><button type="button" class="btn small" id="acOpen">Log in</button>';
  acct.prepend(bar);
  document.getElementById('acOpen').addEventListener('click',()=>{if(ACC.token){document.getElementById('acLogout').click();return;}TC.formOpen=!TC.formOpen;sfx('click');refreshTitle();if(TC.formOpen)setTimeout(()=>{const u=document.getElementById('acUser');if(u)u.focus();},50);});})();

{const _rtTC=refreshTitle;refreshTitle=function(){_rtTC.apply(this,arguments);
  const s=CS.sum[CS.slot],open=tcOpenSlots(),q=id=>document.getElementById(id);
  // hero card
  const nm=q('slotName'),ds=q('slotDesc'),dots=q('slotDots');
  if(nm){nm.textContent=s?String(s.name).slice(0,16):'New character';ds.textContent=s?slotDesc(s):`Empty slot ${open.indexOf(CS.slot)+1} of ${open.length}`;}
  if(dots){dots.innerHTML='';for(const n of open){const d=document.createElement('button');d.type='button';d.className='tcDot'+(n===CS.slot?' on':'')+(CS.sum[n]?'':' empty');
      d.setAttribute('role','tab');d.setAttribute('aria-selected',String(n===CS.slot));const who=CS.sum[n]?String(CS.sum[n].name).slice(0,16):'Empty slot';d.title=who;d.setAttribute('aria-label',who);
      d.addEventListener('click',()=>{if(CS.slot===n)return;sfx('click');setSlot(n);acMsg('');refreshTitle();});dots.appendChild(d);}}
  for(const id of ['slotPrev','slotNext']){const b=q(id);if(b)b.hidden=open.length<2;}
  {const t=q('title');if(t)t.classList.toggle('tcNew',!s);} // making a new hero: everything fits one screen (css)
  // account line
  const inAcct=!!ACC.token,who=q('acWho'),ob=q('acOpen');
  if(who)who.innerHTML=inAcct?`Signed in as <b>${esc(ACC.username)}</b>`:'Playing as a guest';
  if(ob){ob.textContent=inAcct?'Log out':TC.formOpen?'Close':'Log in';ob.classList.toggle('ghost',inAcct);}
  if(inAcct)TC.formOpen=false;
  const form=q('acIn'),note=q('acNote');if(form)form.hidden=inAcct||!TC.formOpen;if(note)note.hidden=inAcct||!TC.formOpen;};}

if(typeof TH!=='undefined')Object.assign(TH,{'New character':'ตัวละครใหม่','Previous character':'ตัวละครก่อนหน้า','Next character':'ตัวละครถัดไป',
  'Playing as a guest':'เล่นแบบผู้เยี่ยมชม','Log out':'ออกจากระบบ','Log in':'เข้าสู่ระบบ','Close':'ปิด','Empty slot':'ช่องว่าง','Character slots':'ช่องตัวละคร','Signed in as':'เข้าสู่ระบบในชื่อ'});
if(typeof TH_PAT!=='undefined')TH_PAT.unshift([/^Empty slot (\d+) of (\d+)$/,'ช่องว่าง $1 จาก $2']);
refreshTitle();
