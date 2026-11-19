"use strict";
/* ================= what an item is good for (v1.40.2) =================
   itemUses(id) lists everything in the game that asks for an item: brewing (/craft), Brannoc's forge, Alchemist
   Verena's laboratory, Awakener Liora, refining and the Gemcutter, plus what you need right now: active quests,
   today's bounties and this week's royal decrees. Shown under each item in the shop's Sell list (so you can see what
   you would be selling) and on the item card. Things you need right now are marked so they are not sold by mistake. */
function itemUses(id){const out=[],add=(what,where,need)=>{if(!out.some(u=>u.what===what&&u.where===where))out.push({what,where,need:!!need});};
  const nm=k=>ITEMS[k]?ITEMS[k].name:k;
  if(typeof BREWS!=='undefined')for(const r of BREWS)if(r[2]&&r[2][id])add(nm(r[0]),'Brewing');
  if(typeof FORGES!=='undefined')for(const r of FORGES)if(r[2]&&r[2][id])add(nm(r[0]),'Brannoc');
  if(typeof LAB!=='undefined')for(const k of ['elixir','oil','trans'])for(const r of LAB[k]||[])if(r[2]&&r[2][id])add(nm(r[0]),'Alchemist');
  if(typeof AW_COST!=='undefined'&&AW_COST.some(c=>c.mats&&c.mats[id]))add('Awakening gear','Hall of Awakening');
  if(id==='emberore')add('Refining weapons','Smith');if(id==='glintstone'){add('Refining armour and accessories','Smith');add('Cutting sigil slots','Gemcutter');}
  if(id==='petsnack'&&typeof BOND!=='undefined')add('Companion bond','Royal Stables');
  // what you need right now
  try{if(typeof QS==='function'&&typeof QUESTS!=='undefined')for(const q of Object.keys(QS().active||{}))for(const o of (QUESTS[q]&&QUESTS[q].obj)||[])if(o.item===id)add(QUESTS[q].name,'Quest',true);}catch(e){}
  try{if(typeof bState==='function'){const b=bState();for(const x of [...(b.d||[]),b.w])if(x&&x.k==='bring'&&x.item===id&&!x.claimed)add('Bounty','Guild Hall',true);}}catch(e){}
  try{if(typeof palState==='function')for(const x of palState().d||[])if(x.k==='bring'&&x.item===id&&!x.claimed)add('Royal decree','Royal Palace',true);}catch(e){}
  return out;}
function itemUsesHtml(id,max=2){const u=itemUses(id);if(!u.length)return '';const need=u.filter(x=>x.need),rest=u.filter(x=>!x.need);
  const txt=x=>`${esc(x.what)} <span class="muted">(${esc(x.where)})</span>`;
  let h='';if(need.length)h+=`<div class="ds iuneed">⚠ Needed for ${need.map(txt).join(', ')}</div>`;
  if(rest.length)h+=`<div class="ds iuse">Used for ${rest.slice(0,max).map(txt).join(', ')}${rest.length>max?` <span class="muted">+${rest.length-max} more</span>`:''}</div>`;
  return h;}
// the item card: the laboratory's recipes join the forge and brewing ones, and what you need it for now
{const _ir=itemRecipes;itemRecipes=function(id){const r=_ir.apply(this,arguments);if(typeof LAB!=='undefined')for(const k of ['elixir','oil','trans'])for(const x of LAB[k]||[]){const row=[...x,'lab'];
  if(x[0]===id)r.makes.push(row);if(x[2]&&x[2][id])r.usedIn.push(row);}return r;};}
{const _sc=showItemCard;showItemCard=function(id){const r=_sc.apply(this,arguments);try{const c=document.getElementById('itemCard'),u=itemUses(id).filter(x=>x.need||!/^(Brewing|Brannoc|Alchemist)$/.test(x.where));
  if(c&&u.length)c.insertAdjacentHTML('beforeend',`<h3>Also needed for</h3><div class="ds">${u.map(x=>`${x.need?'⚠ ':''}${esc(x.what)} <span class="muted">(${esc(x.where)})</span>`).join('<br>')}</div>`);}catch(e){}return r;};}
if(typeof TH!=='undefined'){for(const [k,v] of [['Brewing','ปรุงยา'],['Alchemist','นักเล่นแร่'],['Hall of Awakening','หอปลุกพลัง'],['Smith','ช่างตีเหล็ก'],['Gemcutter','ช่างเจียระไน'],['Royal Stables','คอกม้าหลวง'],['Quest','เควส'],['Guild Hall','หอกิลด์'],['Royal Palace','พระราชวังหลวง'],
  ['Awakening gear','ปลุกพลังอุปกรณ์'],['Refining weapons','ตีบวกอาวุธ'],['Refining armour and accessories','ตีบวกเกราะและเครื่องประดับ'],['Cutting sigil slots','เจาะช่องซิกิล'],['Companion bond','สายสัมพันธ์สัตว์เลี้ยง'],['Bounty','ค่าหัว'],['Royal decree','พระราชโองการ'],['Also needed for','ใช้สำหรับอื่น ๆ'],['Used for','ใช้ทำ'],['⚠ Needed for','⚠ ต้องใช้สำหรับ']])if(!TH[k])TH[k]=v;
  if(typeof TH_PAT!=='undefined')TH_PAT.unshift([/^\+(\d+) more$/,'+อีก $1'],[/^\((Brewing|Brannoc|Alchemist|Hall of Awakening|Smith|Gemcutter|Royal Stables|Quest|Guild Hall|Royal Palace)\)$/,(m,a)=>`(${thText(a)})`]);}
