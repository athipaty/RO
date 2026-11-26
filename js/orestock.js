"use strict";
/* ================= ore is worth finding (v1.65.0) =================
   Brannoc used to sell Ember Ore and Glintstone without end, so ore was only ever a little gold and nobody hunted it.
   Now each hero may buy 3 of each a day from him: enough for the safe refines (+1 to +4) at a steady pace. Serious
   refining (+5 and up) runs on ore from monsters (bosses above all), ore veins, smelting iron and trade, so drops and
   gathering matter and ore is worth selling. Glintstone can now be smelted too (6 Iron Chunks, like Ember Ore), so armour
   refining does not fall behind weapons. The day turns at local midnight; the count is saved with the hero. */
const ORE_DAILY=3;
const oreDay=()=>{const d=new Date();return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate();};
function oreStock(){if(!P)return {};if(!P.oreBuy||P.oreBuy.day!==oreDay())P.oreBuy={day:oreDay(),emberore:0,glintstone:0};return P.oreBuy;}
function oreLeft(id){return Math.max(0,ORE_DAILY-(oreStock()[id]||0));}
if(typeof SAVE_EXTRA!=='undefined')SAVE_EXTRA.push('oreBuy','oreNote');
PANEL_ACTS.buyore=id=>{if(id!=='emberore'&&id!=='glintstone')return;const it=ITEMS[id],st=oreStock();
  if(oreLeft(id)<=0){addLog(`Brannoc: "That is all the ${it.name} I can spare today. Try the ore veins, or the monsters that carry it."`,'l-bad');return;}
  if(carryWeight()+itemWeight(id)>maxWeight()){addLog(`You cannot carry ${it.name}: too heavy.`,'l-bad');return;}
  if(P.gold<it.price)return;P.gold-=it.price;st[id]=(st[id]||0)+1;giveItem(id,1);sfx('coin');addLog(`Bought ${it.name} (${oreLeft(id)} left today).`,'l-loot');refreshPanel();save();};
// Glintstone smelts from iron, like Ember Ore (js/gathering.js)
if(typeof BREWS!=='undefined'&&!BREWS.some(r=>r[0]==='glintstone'&&r[2].ironchunk))BREWS.push(['glintstone',1,{ironchunk:6},300]);
// Brannoc says so once
{const _ezO=enterZone;enterZone=function(id){const r=_ezO.apply(this,arguments);try{if(id==='town'&&P&&!P.oreNote){P.oreNote=1;
  addLog('Brannoc: "The mines are running low. I can sell each of you only a few ores a day now. Bring me ore from the monsters and the veins, or smelt your own iron."','l-rare');}}catch(e){}return r;};}
if(typeof TH!=='undefined')Object.assign(TH,{'Sold out':'หมดแล้ว'});
if(typeof TH_PAT!=='undefined')TH_PAT.unshift([/^(\d) of 3 left today$/,(m,n)=>`เหลือ ${n} จาก 3 ก้อนวันนี้`]);
/* ---- (v1.65.1) Re-smelt at the smithy: 3 of one ore into 2 of the other, 200 gold, as Alchemist Verena does in
   Aurelmark (her lab keeps it too, and the Ember Core stays hers). Everything about refining is now in one place. ---- */
const RESMELT=[['glintstone',2,'emberore',3,200],['emberore',2,'glintstone',3,200]];
function resmeltHtml(){const th=typeof LANG!=='undefined'&&LANG==='th';
  return `<h3>${th?'หลอมใหม่':'Re-smelt'}</h3><div class="sub">${th?'หลอมแร่ชนิดหนึ่งเป็นอีกชนิด: 3 ก้อนได้ 2 ก้อน':'Melt one ore down into the other: 3 for 2.'}</div>`+
    RESMELT.map(([out,n,src,k,gold])=>{const have=(invFind(src)||{}).n||0,ok=have>=k&&P.gold>=gold;
      return `<div class="row">${icon(ITEMS[out])}<div class="grow"><div class="nm">${ITEMS[out].name} ×${n}</div><div class="ds">${th?`ใช้ ${ITEMS[src].name} ${k} ก้อน (มี ${have}) · ${gold} ทอง`:`${k} ${ITEMS[src].name} (you have ${have}) · ${gold} gold`}</div></div>`+
        `<button class="btn small" data-act="resmelt" data-arg="${out}" ${ok?'':'disabled'}>${th?'หลอม':'Smelt'}</button></div>`;}).join('');}
PANEL_ACTS.resmelt=out=>{const r=RESMELT.find(x=>x[0]===out);if(!r)return;const [,n,src,k,gold]=r;
  if(((invFind(src)||{}).n||0)<k||P.gold<gold){addLog(`You need ${k} ${ITEMS[src].name} and ${gold} gold.`,'l-bad');return;}
  takeItem(src,k);P.gold-=gold;giveItem(out,n);sfx('refineOk');addLog(`Brannoc melts ${k} ${ITEMS[src].name} down into ${n} ${ITEMS[out].name}.`,'l-loot');refreshPanel();save();};
if(typeof TH!=='undefined')Object.assign(TH,{'Re-smelt':'หลอมใหม่'});
