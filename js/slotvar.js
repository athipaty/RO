"use strict";
/* ================= #19 slotted gear variants =================
   Gear picked up from monsters rolls its number of sigil slots (0 to 4) around the usual count:
   one fewer 20%, usual 55%, one more 18%, two more 7%. Shop and forged gear keep the usual count.
   A variant shows its slot count after the name ("Sage Robe [2]"), sells for more with extra slots,
   and an extra-slot find gets a log line. Trades keep the slot count (the server allows up to 4). */
const MAX_SLOTS=4;
function rollSlots(base,r=Math.random()){base=base|0;
  const n=r<.2?base-1:r<.75?base:r<.93?base+1:base+2;return clamp(n,0,MAX_SLOTS);}
const slotBase=id=>(ITEMS[id]&&ITEMS[id].slots)|0;
const isVariant=e=>!!(e&&Array.isArray(e.s)&&ITEMS[e.id]&&e.s.length!==slotBase(e.id));
// name: "+3 Sage Robe [2]" only when the count differs from the usual
const _itemNameSV=itemName;
itemName=function(e){const n=_itemNameSV(e);return isVariant(e)?`${n} [${e.s.length}]`:n;};
// pick-ups from the ground roll; everything else (shop, forge, quests, trades) does not
let svRolling=false;
const _pickUpSV=pickUp;
pickUp=function(l){svRolling=true;try{return _pickUpSV.apply(this,arguments);}finally{svRolling=false;}};
const _giveItemSV=giveItem;
giveItem=function(id,n=1,announce){const before=P.inv.length;const r=_giveItemSV.apply(this,arguments);
  const it=ITEMS[id];if(svRolling&&it&&GEAR.includes(it.type)){
    for(let k=before;k<P.inv.length;k++){const e=P.inv[k];if(e.id!==id||!Array.isArray(e.s))continue;const want=rollSlots(it.slots);
      e.s=Array(want).fill(null);
      if(want>slotBase(id))addLog(`A fine find: this ${it.name} has ${want} sigil slot${want>1?'s':''} (usually ${slotBase(id)}).`,'l-rare');}
    refreshPanel();}
  return r;};
// selling: each extra slot adds a quarter of the price, each missing one takes a quarter off
function sellValueOf(e){const base=sellValue(e.id);if(!isVariant(e))return base;return Math.max(1,Math.round(base*(1+.25*(e.s.length-slotBase(e.id)))));}
