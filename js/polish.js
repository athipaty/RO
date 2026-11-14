"use strict";
/* ================= look and feel =================
   1. Rarity frames: every item picture in a window (bag, shops, storage, cart, craft, cards) gets a border and a soft
      glow in its rarity colour, so uncommon, rare, sigil and legendary items stand out at a glance.
   2. New region card: the first time you step into a region, a card shows it was discovered, its level range and
      pictures of the monsters that live there (with their level). Any tap puts it away (and still reaches the game); it goes by itself after 6 seconds. */

/* ---- 1. rarity frames ---- */
if(typeof icon==='function'){const _icP=icon;icon=function(it){const h=_icP.apply(this,arguments);try{const id=typeof itemIdOf==='function'?itemIdOf(it):it&&it.id;
    const r=id&&typeof rarityOf==='function'?rarityOf(id):0;if(r>0&&h.indexOf('class="ico img"')>=0)return h.replace('class="ico img"',`class="ico img r${r}"`);}catch(e){}return h;};}

/* ---- 2. new region card ---- */
const ZONE_BLURB={meadow:'Gentle hills and slow monsters. A good place to learn to fight.',woods:'Old trees, wolves in packs and stairs down into the caverns.',
  dunes:'Hot sand, scarabs and the dead that drift on the wind.',crypt:'Ember and bone. The Ashen Warlord waits at the bottom.',frost:'Snow, ice and the strongest monsters in Embervale.',
  deep1:'Dark tunnels under the woods. Bring light, or at least potions.',deep2:'Crystals and stone crabs, deeper down.',deep3:'The Gloomcap King rules the deepest cave.',
  capital:'The capital: markets, the gemcutter, the library and the Hall of Callings.',town:'Your home town, safe from monsters.'};
function regionCard(id){const D=ZONES[id];if(!D)return;let el=document.getElementById('zoneCard');
  if(!el){el=document.createElement('div');el.id='zoneCard';el.setAttribute('role','status');document.body.appendChild(el);
    // taps go through it to the game (a monster under it can still be hit); any tap also puts it away
    addEventListener('pointerdown',()=>{if(el.classList.contains('show'))setTimeout(()=>el.classList.remove('show'),150);},true);}
  const kinds=[];for(const [m] of D.mobs||[]){const d=MOBS[m];if(d&&!kinds.some(k=>k.id===m))kinds.push(d);}kinds.sort((a,b)=>(a.boss?1:0)-(b.boss?1:0)||a.lv-b.lv);
  const pics=kinds.slice(0,6).map(d=>`<span class="zcm${d.boss?' boss':''}" title="${esc(d.name)}">${typeof mobPicURL==='function'?`<img src="${mobPicURL(d.id)}" alt="">`:''}<b>Lv ${d.lv}</b></span>`).join('');
  el.innerHTML=`<div class="zck">New region discovered</div><div class="zcn">${esc(D.name)}</div><div class="zcl">${esc(D.lvl||'')}</div>`+(ZONE_BLURB[id]?`<div class="zcb">${esc(ZONE_BLURB[id])}</div>`:'')+(pics?`<div class="zcp">${pics}</div>`:'');
  el.classList.remove('show');void el.offsetWidth;el.classList.add('show');clearTimeout(regionCard.t);regionCard.t=setTimeout(()=>el.classList.remove('show'),6000);
  if(typeof sfx==='function')try{sfx('rare');}catch(e){}}
{const _ezP=enterZone;enterZone=function(id){const first=P&&Array.isArray(P.visited)&&!P.visited.includes(id)&&ZONES[id]&&!ZONES[id].safe;const r=_ezP.apply(this,arguments);
  try{if(first&&running)setTimeout(()=>regionCard(id),700);}catch(e){}return r;};}

if(typeof TH!=='undefined')Object.assign(TH,{'New region discovered':'ค้นพบดินแดนใหม่',
  'Gentle hills and slow monsters. A good place to learn to fight.':'เนินเขาอ่อนโยนและมอนสเตอร์เชื่องช้า ที่ฝึกต่อสู้ชั้นดี',
  'Old trees, wolves in packs and stairs down into the caverns.':'ต้นไม้เก่าแก่ หมาป่าเป็นฝูง และบันไดลงสู่ถ้ำ',
  'Hot sand, scarabs and the dead that drift on the wind.':'ทรายร้อน แมลงปีกแข็ง และวิญญาณที่ล่องลอยตามลม',
  'Ember and bone. The Ashen Warlord waits at the bottom.':'ถ่านไฟและกระดูก ขุนศึกเถ้าถ่านรออยู่ชั้นล่างสุด',
  'Snow, ice and the strongest monsters in Embervale.':'หิมะ น้ำแข็ง และมอนสเตอร์ที่แข็งแกร่งที่สุดใน Embervale',
  'Dark tunnels under the woods. Bring light, or at least potions.':'อุโมงค์มืดใต้ป่า พกแสงไฟไป หรืออย่างน้อยก็ยา',
  'Crystals and stone crabs, deeper down.':'คริสตัลและปูหิน ลึกลงไปอีก','The Gloomcap King rules the deepest cave.':'ราชาเห็ดมืดครองถ้ำที่ลึกที่สุด'});
