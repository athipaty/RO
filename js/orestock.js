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
