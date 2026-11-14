// Item card: tap any item picture (bag, store, craft ingredients, equipment, storage, trade) to see what it does,
// which monsters drop it (with their picture, level, region and drop chance), where to buy it and what it makes.
function itemDropSources(id){const out=[];
  for(const m of Object.values(MOBS)){for(const [d,ch] of m.drops||[])if(d===id)out.push({m,ch});}
  if(/_sig$/.test(id)){const m=MOBS[id.slice(0,-4)];if(m)out.push({m,ch:m.sigChance||SIG_CHANCE});}
  return out.sort((a,b)=>b.ch-a.ch||a.m.lv-b.m.lv);}
function itemMobWhere(m){if(typeof ZONES==='undefined')return '';return Object.values(ZONES).filter(z=>z.mobs&&z.mobs.some(([t])=>t===m.id)).map(z=>z.name).join(', ');}
const pctTxt=ch=>{const p=ch*100;return (p>=10?Math.round(p):p>=1?Math.round(p*10)/10:Math.round(p*100)/100)+'%';};
function itemRecipes(id){const all=[...(typeof BREWS!=='undefined'?BREWS.map(r=>[...r,'brew']):[]),...(typeof FORGES!=='undefined'?FORGES.map(r=>[...r,'forge']):[])];
  return {makes:all.filter(r=>r[0]===id),usedIn:all.filter(r=>r[2]&&r[2][id])};}
function showItemCard(id){const it=ITEMS[id];if(!it)return;let c=document.getElementById('itemCard');
  if(!c){c=document.createElement('div');c.id='itemCard';c.className='frame';c.setAttribute('role','dialog');document.body.appendChild(c);
    c.addEventListener('click',ev=>{const x=ev.target.closest('[data-card]');if(x){ev.stopPropagation();if(x.dataset.card==='close')hideItemCard();else showItemCard(x.dataset.card);}});}
  const pic=i=>typeof itemIconURL==='function'?`<img class="icpic" src="${itemIconURL(i)}" alt="">`:'';
  const nameCol=typeof rarityCol==='function'?rarityCol(id):'#efe6d2';
  let desc='';try{desc=it.type==='use'||it.type==='etc'||!it.type?(it.desc||''):itemDesc({id,s:it.slots?Array(it.slots).fill(null):[]});}catch(e){desc=it.desc||'';}
  let h=`<button class="btn small ghost icx" data-card="close" aria-label="Close">✕</button><div class="ichead">${pic(id)}<div><div class="icnm" style="color:${nameCol}">${esc(it.name)}</div><div class="ds">${desc}</div></div></div>`;
  const src=itemDropSources(id);
  if(src.length){h+=`<h3>Dropped by</h3><div class="icmobs">`;
    for(const {m,ch} of src){const url=typeof mobPicURL==='function'?mobPicURL(m.id):'';const wh=itemMobWhere(m);
      h+=`<div class="icmob">${url?`<img src="${url}" alt="">`:''}<div class="grow"><div class="nm">${esc(m.name)} <span class="muted">Lv ${m.lv}${m.boss?' · boss':''}</span></div>${wh?`<div class="ds">${esc(wh)}</div>`:''}</div><div class="icpct">${pctTxt(ch)}</div></div>`;}
    h+=`</div>`;}
  const shop=typeof SHOP!=='undefined'&&SHOP.includes(id);
  if(shop)h+=`<h3>In the store</h3><div class="ds">Sold at the General Store for <span class="gold">${fmt(it.price||0)} gold</span>.</div>`;
  const {makes,usedIn}=itemRecipes(id);
  const recipe=r=>Object.entries(r[2]).map(([m,k])=>`<span class="icing" data-card="${m}">${pic(m)}<b>${k}</b></span>`).join('');
  if(makes.length)h+=`<h3>How to make it</h3>`+makes.map(r=>`<div class="icrec">${recipe(r)}<span class="muted">→ ${r[1]>1?r[1]+'× ':''}${r[3]?fmt(r[3])+' gold · ':''}${r[4]==='forge'?'at the smithy':'anywhere (/craft)'}</span></div>`).join('');
  if(usedIn.length)h+=`<h3>Used to make</h3><div class="icrec">`+usedIn.map(r=>`<span class="icing" data-card="${r[0]}" title="${esc(ITEMS[r[0]]?ITEMS[r[0]].name:r[0])}">${pic(r[0])}</span>`).join('')+`</div>`;
  if(!src.length&&!shop&&!makes.length)h+=`<div class="ds muted" style="margin-top:8px">Not dropped by monsters. Look for it from quests, festivals, bosses or other players.</div>`;
  c.innerHTML=h;c.hidden=false;}
function hideItemCard(){const c=document.getElementById('itemCard');if(c)c.hidden=true;}
// open it from any item picture in a window (not the hotbar: tapping there uses the item)
document.addEventListener('click',ev=>{const t=ev.target.closest&&ev.target.closest('[data-item]');
  if(t&&!t.closest('#hotbar,#actions,#itemCard,.cmi')){ev.stopPropagation();showItemCard(t.dataset.item);return;}
  const c=document.getElementById('itemCard');if(c&&!c.hidden&&!c.contains(ev.target))hideItemCard();},true);
addEventListener('keydown',e=>{if(e.key==='Escape')hideItemCard();});
