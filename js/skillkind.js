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
if(typeof TH!=='undefined')Object.assign(TH,{'Area (drag to aim)':'สกิลวงกว้าง (ลากเพื่อเล็ง)','Single target':'สกิลเป้าเดียว','Your buffs wore off when you fell.':'บัฟทั้งหมดหายไปเมื่อคุณล้มลง','Nothing of this kind in your bag.':'ไม่มีของประเภทนี้ในกระเป๋า','Nothing of this kind in the cart.':'ไม่มีของประเภทนี้ในรถเข็น'});
/* (v1.49.5) the type of each skill as words, shown under its name in the hotbar editor (✎) and next to the picked slot:
   Single target · Area · Ground (aim) · Around you · Heal · Buff */
function skType(id){const s=SKILLS[id];if(!s)return null;const k=s.kind;
  if(k==='target')return {k:'one',t:'Single target'};
  if(k==='area')return {k:'area',t:'Area'};
  if(k==='ground')return {k:'area',t:'Ground (aim)'};
  if(k==='self'){if((typeof AUTOSK!=='undefined'&&AUTOSK.heal[id])||(typeof SUP!=='undefined'&&SUP[id]&&SUP[id].amt))return {k:'heal',t:'Heal'};
    if(typeof AUTOSK!=='undefined'&&AUTOSK.nova[id])return {k:'nova',t:'Around you'};return {k:'buff',t:'Buff'};}
  return null;}
const skTypeTag=id=>{const t=skType(id);return t?`<b class="hbk k-${t.k}">${t.t}</b>`:'';};
if(typeof TH!=='undefined')Object.assign(TH,{'Single target':'สกิลเป้าเดียว','Area':'วงกว้าง','Ground (aim)':'เล็งพื้นที่','Around you':'รอบตัว','Heal':'รักษา','Buff':'บัฟ','Buffs & healing':'บัฟและรักษา'});

/* (v1.49.5) the hotbar editor shows the slots where they sit on your screen: on a phone the two arcs around the
   Attack button (1-4 inside, 5-8 outside), on a desktop the row. The layout is read from the real hotbar (kept from
   the last time it was on screen, as a panel may cover it) and scaled to fit the window. */
const HBMAP={last:null};
function hbMapMeasure(){const els=[...document.querySelectorAll('#hotbar > .slot')].slice(0,8);if(els.length<8)return null;
  const rs=els.map(e=>e.getBoundingClientRect());if(rs.some(r=>!r.width||!r.height))return null;
  const ab=document.getElementById('atkBtn'),ar=ab&&ab.getClientRects().length?ab.getBoundingClientRect():null,atk=ar&&ar.width?ar:null;
  const all=atk?[...rs,atk]:rs,x0=Math.min(...all.map(r=>r.left)),y0=Math.min(...all.map(r=>r.top)),x1=Math.max(...all.map(r=>r.right)),y1=Math.max(...all.map(r=>r.bottom));
  return {w:x1-x0,h:y1-y0,pos:rs.map(r=>({x:r.left-x0,y:r.top-y0,s:r.width})),atk:atk?{x:atk.left-x0,y:atk.top-y0,s:atk.width}:null};}
function hbMap(){const m=hbMapMeasure();if(m)HBMAP.last=m;return HBMAP.last;}
{const _rhM=rebuildHotbar;rebuildHotbar=function(){const r=_rhM.apply(this,arguments);setTimeout(()=>{try{if(!document.getElementById('panel')||document.getElementById('panel').hidden)hbMap();}catch(e){}},50);return r;};}
addEventListener('resize',()=>setTimeout(()=>{try{hbMapMeasure()&&hbMap();}catch(e){}},300));
{const _hbPM=PANELS.hotbar;PANELS.hotbar=()=>{let h=_hbPM();const m=hbMap();if(!m)return h;
  // a single straight row: the plain grid already matches it
  const flat=m.pos.every(p=>Math.abs(p.y-m.pos[0].y)<4)&&!m.atk;if(flat)return h;
  const land=innerWidth>innerHeight&&innerHeight<=540,W=land?Math.min(300,innerWidth*.42):Math.min(300,(window.innerWidth||360)-60),k=Math.min(1,W/m.w,land?innerHeight*.62/m.h:9),H=Math.round(m.h*k);
  let i=0;h=h.replace(/<div class="hbslots"/,`<div class="hbslots hbmap" style="height:${H}px;width:${Math.round(m.w*k)}px"`);
  h=h.replace(/<button class="hbs/g,s=>{const p=m.pos[i++];if(!p)return s;return `<button style="left:${Math.round(p.x*k)}px;top:${Math.round(p.y*k)}px;width:${Math.round(p.s*k)}px;height:${Math.round(p.s*k)}px" class="hbs`;});
  if(m.atk)h=h.replace(/(<div class="hbslots hbmap"[^>]*>)/,`$1<span class="hbatk" aria-hidden="true" style="left:${Math.round(m.atk.x*k)}px;top:${Math.round(m.atk.y*k)}px;width:${Math.round(m.atk.s*k)}px;height:${Math.round(m.atk.s*k)}px">⚔</span>`);
  return h;};}
/* (v1.49.7) a phone held sideways: the editor shows the hotbar on the right (where it is on screen) and the skills and
   items on the left, side by side, instead of one long column. The parts are wrapped here; css/style.css lays them out. */
{const _hbPS=PANELS.hotbar;PANELS.hotbar=()=>{const h=_hbPS();
  const a=h.indexOf('<div class="hbslots'),b=h.indexOf('<h3>Skills</h3>'),c=h.lastIndexOf('<div class="tbtns"><button class="btn small" data-act="hbreset"');
  if(a<0||b<a||c<b)return h;
  return h.slice(0,a)+`<div class="hbsplit"><div class="hbright">${h.slice(a,b)}</div><div class="hbleft">${h.slice(b,c)}</div></div>`+h.slice(c);};}
