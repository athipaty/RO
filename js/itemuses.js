"use strict";
/* ================= what an item is good for (v1.40.2) =================
   itemUses(id) lists everything in the game that asks for an item: brewing (/craft), Brannoc's forge, Alchemist
   Verena's laboratory, Awakener Liora, refining (the Gemcutter no longer cuts slots, v1.76.0), plus what you need right now: active quests,
   today's bounties and this week's royal decrees. Shown under each item in the shop's Sell list (so you can see what
   you would be selling) and on the item card. Things you need right now are marked so they are not sold by mistake. */
function itemUses(id){const out=[],add=(what,where,need,pic)=>{if(!out.some(u=>u.what===what&&u.where===where))out.push({what,where,need:!!need,pic:pic||null});};
  const nm=k=>ITEMS[k]?ITEMS[k].name:k;
  if(typeof BREWS!=='undefined')for(const r of BREWS)if(r[2]&&r[2][id])add(nm(r[0]),'Brewing',0,{item:r[0]});
  if(typeof FORGES!=='undefined')for(const r of FORGES)if(r[2]&&r[2][id])add(nm(r[0]),'Brannoc',0,{item:r[0]});
  if(typeof LAB!=='undefined')for(const k of ['elixir','oil','trans'])for(const r of LAB[k]||[])if(r[2]&&r[2][id])add(nm(r[0]),'Alchemist',0,{item:r[0]});
  if(typeof AW_COST!=='undefined'&&AW_COST.some(c=>c.mats&&c.mats[id]))add('Awakening gear','Hall of Awakening',0,{sym:'✧',col:'#c890ff'});
  if(id==='emberore')add('Refining weapons','Smith',0,{sym:'⚒',col:'#ff9a4a'});if(id==='glintstone'){add('Refining armour and accessories','Smith',0,{sym:'⚒',col:'#9fd6ff'});}
  if(id==='petsnack'&&typeof BOND!=='undefined')add('Companion bond','Royal Stables',0,{sym:'♥',col:'#ff9ac8'});
  // what you need right now
  try{if(typeof QS==='function'&&typeof QUESTS!=='undefined'){const act=QS().active||{};for(const [q,Q] of Object.entries(QUESTS)){const on=!!act[q],offer=!on&&typeof qAvailable==='function'&&qAvailable(q);if(!on&&!offer)continue;
      for(const o of Q.obj||[])if(o.item===id){const g=Q.from&&typeof npcPicURL==='function'?npcPicURL(Q.from):'';add(Q.name,on?'Quest':'Quest offer',on,g?{url:g}:{sym:'❖',col:'#ffe08a'});}}}}catch(e){}
  try{if(typeof bState==='function'){const b=bState();for(const x of [...(b.d||[]),b.w])if(x&&x.k==='bring'&&x.item===id&&!x.claimed)add('Bounty','Guild Hall',true,{sym:'✦',col:'#ffcf5a'});}}catch(e){}
  try{if(typeof palState==='function')for(const x of palState().d||[])if(x.k==='bring'&&x.item===id&&!x.claimed)add('Royal decree','Royal Palace',true,{sym:'⚜',col:'#ffe08a'});}catch(e){}
  return out;}
function itemUsesHtml(id,max=8){const u=itemUses(id);if(!u.length)return '';u.sort((a,b)=>(b.need?1:0)-(a.need?1:0));
  const pic=x=>{const t=esc(`${x.need?'Needed for ':''}${x.what} (${x.where})`),cls=`iup${x.need?' need':''}`,p=x.pic||{};
    if(p.item)return `<span class="${cls}" data-item="${p.item}" title="${t}" aria-label="${t}" tabindex="0"><img src="${itemIconURL(p.item)}" alt=""></span>`;
    if(p.url)return `<span class="${cls}" title="${t}" aria-label="${t}"><img src="${p.url}" alt=""></span>`;
    return `<span class="${cls} sym" title="${t}" aria-label="${t}" style="color:${p.col||'#ffe08a'}">${p.sym||'•'}</span>`;};
  return `<div class="iurow">${u.slice(0,max).map(pic).join('')}${u.length>max?`<span class="iumore">+${u.length-max}</span>`:''}</div>`;}
// the item card: the laboratory's recipes join the forge and brewing ones, and what you need it for now
{const _ir=itemRecipes;itemRecipes=function(id){const r=_ir.apply(this,arguments);if(typeof LAB!=='undefined')for(const k of ['elixir','oil','trans'])for(const x of LAB[k]||[]){const row=[...x,'lab'];
  if(x[0]===id)r.makes.push(row);if(x[2]&&x[2][id])r.usedIn.push(row);}return r;};}
{const _sc=showItemCard;showItemCard=function(id){const r=_sc.apply(this,arguments);try{const c=document.getElementById('itemCard'),u=itemUses(id).filter(x=>x.need||!/^(Brewing|Brannoc|Alchemist)$/.test(x.where));
  if(c&&u.length)c.insertAdjacentHTML('beforeend',`<h3>Also needed for</h3><div class="ds">${u.map(x=>`${x.need?'⚠ ':''}${esc(x.what)} <span class="muted">(${esc(x.where)})</span>`).join('<br>')}</div>`);}catch(e){}return r;};}
if(typeof TH!=='undefined'){for(const [k,v] of [['Brewing','ปรุงยา'],['Alchemist','นักเล่นแร่'],['Hall of Awakening','หอปลุกพลัง'],['Smith','ช่างตีเหล็ก'],['Gemcutter','ช่างเจียระไน'],['Royal Stables','คอกม้าหลวง'],['Quest','เควส'],['Guild Hall','หอกิลด์'],['Royal Palace','พระราชวังหลวง'],
  ['Awakening gear','ปลุกพลังอุปกรณ์'],['Refining weapons','ตีบวกอาวุธ'],['Refining armour and accessories','ตีบวกเกราะและเครื่องประดับ'],['Cutting sigil slots','เจาะช่องซิกิล'],['Companion bond','สายสัมพันธ์สัตว์เลี้ยง'],['Bounty','ค่าหัว'],['Royal decree','พระราชโองการ'],['Also needed for','ใช้สำหรับอื่น ๆ'],['Used for','ใช้ทำ'],['⚠ Needed for','⚠ ต้องใช้สำหรับ']])if(!TH[k])TH[k]=v;
  if(typeof TH_PAT!=='undefined')TH_PAT.unshift([/^\+(\d+) more$/,'+อีก $1'],[/^\((Brewing|Brannoc|Alchemist|Hall of Awakening|Smith|Gemcutter|Royal Stables|Quest|Guild Hall|Royal Palace)\)$/,(m,a)=>`(${thText(a)})`]);}
