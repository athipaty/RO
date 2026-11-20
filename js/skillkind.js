"use strict";
/* ================= area vs single-target skills look different (v1.45.3) =================
   Area and ground skills (the ones you can hold and drag to aim on a phone, js/dragaim.js) carry a cyan double ring;
   single-target skills carry an orange dot in a circle. Shown on the hotbar buttons and in the skill tree (with a
   legend). Self buffs and passives have no mark. */
const skKind=id=>{const k=SKILLS[id]&&SKILLS[id].kind;return k==='area'||k==='ground'?'area':k==='target'?'one':null;};
const skKindBadge=id=>{const k=skKind(id);return k?`<span class="skk ${k}" aria-hidden="true"></span>`:'';};
function tagHotbarKinds(){for(const b of document.querySelectorAll('#hotbar .slot')){const s=b._slot,k=s&&s.skill?skKind(s.skill):null;
  b.classList.toggle('sk-area',k==='area');b.classList.toggle('sk-one',k==='one');
  const old=b.querySelector(':scope > .skk');if(old&&(!k||!old.classList.contains(k)))old.remove();
  if(k&&!b.querySelector(':scope > .skk'))b.insertAdjacentHTML('beforeend',skKindBadge(s.skill));}}
{const _rh=rebuildHotbar;rebuildHotbar=function(){const r=_rh.apply(this,arguments);try{tagHotbarKinds();}catch(e){}return r;};}
if(typeof TH!=='undefined')Object.assign(TH,{'Area (drag to aim)':'สกิลวงกว้าง (ลากเพื่อเล็ง)','Single target':'สกิลเป้าเดียว'});
