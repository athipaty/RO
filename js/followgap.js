"use strict";
/* ================= choose how far behind to follow (v1.42.5) =================
   Tapping Follow (party box, the player card, or /follow) asks how close: Close, Near, Medium or Far. The last choice
   is remembered on this device and lit up next time. js/follow.js keeps to that distance. */
const FOLLOW_GAP={opts:[['close','Close',40],['near','Near',90],['mid','Medium',150],['far','Far',230]],
  key:()=>{try{return localStorage.getItem('embervale.followGap')||'close';}catch(e){return 'close';}},
  get(){const k=this.key(),o=this.opts.find(x=>x[0]===k);return o?o[2]:40;},
  set(k){try{localStorage.setItem('embervale.followGap',k);}catch(e){}}};
const FG_TH={close:'ใกล้ชิด',near:'ใกล้',mid:'ปานกลาง',far:'ไกล'};
const fgTh=()=>typeof LANG!=='undefined'&&LANG==='th';
function followPick(peer){const o=NET.others.get(peer);if(!o)return _followStartFG(peer);let el=document.getElementById('folPick');
  if(!el){el=document.createElement('div');el.id='folPick';el.className='frame';el.setAttribute('role','dialog');document.body.appendChild(el);
    el.addEventListener('click',ev=>{ev.stopPropagation();const b=ev.target.closest('[data-gap]');if(b){const k=b.dataset.gap;el.hidden=true;if(k==='cancel')return;FOLLOW_GAP.set(k);_followStartFG(el.dataset.peer);}});}
  const cur=FOLLOW_GAP.key();el.dataset.peer=peer;
  el.innerHTML=`<div class="fpt">${fgTh()?`ตาม ${esc(o.n)} ห่างแค่ไหน?`:`Follow ${esc(o.n)}: how close?`}</div><div class="fpb">`+
    FOLLOW_GAP.opts.map(([k,l,px])=>`<button type="button" class="btn small${k===cur?' on':''}" data-gap="${k}">${fgTh()?FG_TH[k]:l}<small>${px}px</small></button>`).join('')+
    `</div><button type="button" class="btn small ghost fpc" data-gap="cancel">${fgTh()?'ยกเลิก':'Cancel'}</button>`;
  el.hidden=false;if(typeof sfx==='function')sfx('click');}
const _followStartFG=(peer)=>followStart(peer);
// the Follow buttons (party box, player card) ask first; /follow Name starts right away at the last distance
function followAsk(peer){if(typeof following==='function'&&following(peer))return;followPick(peer);}
