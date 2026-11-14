"use strict";
/* ================= the Equipment tab at the Grand Library =================
   Every piece of equipment and where it comes from: the monsters that drop it (picture, level, region and drop
   chance), the General Store price, and whether Brannoc forges it. Filter by slot, by source and by ability;
   sort by level, best drop chance, strongest stat, name or owned first. Monster sources that are world bosses you
   have not defeated stay hidden, as in the Bestiary. Choices are remembered with the Sigil Codex's. */
Object.assign(CODEX,Object.assign({gslot:'all',gsrc:'drop',gab:'all',gsort:'lv'},CODEX));
const GEAR_SLOTS=[['all','All'],['weapon','Weapon'],['armor','Armour'],['head','Head'],['face','Face'],['mouth','Mouth'],['accessory','Accessory']];
const GEAR_SRCS=[['all','All'],['drop','Monster drop'],['shop','Shop'],['forge','Forge'],['other','Quests & events']];
const GEAR_ABS=[...CODEX_ABS,['regen','HP regen'],['vs_beast','vs Beast'],['vs_insect','vs Insect'],['vs_plant','vs Plant'],['vs_spirit','vs Spirit'],['vs_undead','vs Undead']];
const gearAbName=k=>(GEAR_ABS.find(a=>a[0]===k)||[k,k.toUpperCase()])[1];
const gearStat=(it,k)=>k==='atk'||k==='matk'||k==='def'?(it[k]||0)+((it.b&&it.b[k])||0):((it.b&&it.b[k])||0);
function gearAll(){const kk=codexKills(),forged=new Set(typeof FORGES!=='undefined'?FORGES.map(r=>r[0]):[]);
  return Object.entries(ITEMS).filter(([,it])=>GEAR.includes(it.type)).map(([id,it])=>{
    const src=[];for(const m of Object.values(MOBS))for(const [d,ch] of m.drops||[])if(d===id&&(!m.world||kk[m.id]))src.push({m,ch});
    src.sort((a,b)=>b.ch-a.ch||a.m.lv-b.m.lv);
    const shop=typeof SHOP!=='undefined'&&SHOP.includes(id),forge=forged.has(id);
    return {id,it,src,shop,forge,other:!src.length&&!shop&&!forge,best:src.length?src[0].ch:0};});}
// sigil slots: the usual count as dots; gear from monsters rolls one fewer to two more (js/slotvar.js)
function gearSlotsHtml(x){const n=x.it.slots|0,max=typeof MAX_SLOTS!=='undefined'?MAX_SLOTS:4;
  const pips=Array.from({length:max},(_,i)=>`<i class="pip${i<n?' on':''}"></i>`).join('');
  let h=`<div class="gxslots"><span class="pips" aria-hidden="true">${pips}</span><span>${n?`${n} sigil slot${n>1?'s':''}`:'No sigil slots'}</span></div>`;
  if(x.src.length&&typeof rollSlots==='function'){const lo=Math.max(0,n-1),hi=Math.min(max,n+2);
    if(hi>lo)h+=`<div class="ds gxroll">From monsters: ${lo}–${hi} slots (usually ${n})</div>`;}
  return h;}
function gearOwned(id){let n=0;for(const e of [...P.inv,...(P.storage||[])])if(e.id===id)n+=e.n||1;for(const e of Object.values(P.eq||{}))if(e&&e.id===id)n++;return n;}
function gearCodexHtml(){
  const all=gearAll(),pct=c=>typeof pctTxt==='function'?pctTxt(c):Math.round(c*1000)/10+'%';
  const bySrc={all:x=>true,drop:x=>x.src.length,shop:x=>x.shop,forge:x=>x.forge,other:x=>x.other};
  const bySlot=x=>CODEX.gslot==='all'||x.it.type===CODEX.gslot;
  const pool=all.filter(x=>bySlot(x)&&bySrc[CODEX.gsrc](x));
  const abs=GEAR_ABS.filter(([k])=>pool.some(x=>gearStat(x.it,k)));
  if(CODEX.gab!=='all'&&!abs.some(a=>a[0]===CODEX.gab))CODEX.gab='all';
  if(CODEX.gsort==='stat'&&CODEX.gab==='all')CODEX.gsort='lv';
  if(CODEX.gsort==='chance'&&CODEX.gsrc!=='drop')CODEX.gsort='lv';
  let list=CODEX.gab==='all'?pool:pool.filter(x=>gearStat(x.it,CODEX.gab));
  const lv=x=>x.it.lv||1;
  const sorters={lv:(a,b)=>lv(a)-lv(b)||a.it.name.localeCompare(b.it.name),lvd:(a,b)=>lv(b)-lv(a)||a.it.name.localeCompare(b.it.name),
    chance:(a,b)=>b.best-a.best||lv(a)-lv(b),stat:(a,b)=>gearStat(b.it,CODEX.gab)-gearStat(a.it,CODEX.gab)||lv(a)-lv(b),
    slots:(a,b)=>((b.it.slots|0)-(a.it.slots|0))||lv(a)-lv(b),name:(a,b)=>a.it.name.localeCompare(b.it.name),own:(a,b)=>(gearOwned(b.id)>0)-(gearOwned(a.id)>0)||lv(a)-lv(b)};
  list=[...list].sort(sorters[CODEX.gsort]||sorters.lv);
  const chip=(act,val,label,on,n)=>`<button type="button" class="cxchip${on?' on':''}" aria-pressed="${on}" data-act="${act}" data-arg="${val}">${label}${n!==undefined?` <span>${n}</span>`:''}</button>`;
  const dropN=all.filter(x=>x.src.length).length;
  let h=`<div class="sub">${all.length} pieces of equipment · ${dropN} drop from monsters.</div>`;
  h+=`<div class="cxrow"><span class="cxlbl">Source</span><div class="cxchips">`+GEAR_SRCS.map(([k,l])=>chip('gxsrc',k,l,CODEX.gsrc===k,all.filter(x=>bySlot(x)&&bySrc[k](x)).length)).join('')+`</div></div>`;
  h+=`<div class="cxrow"><span class="cxlbl">Slot</span><div class="cxchips">`+GEAR_SLOTS.map(([k,l])=>{const n=all.filter(x=>(k==='all'||x.it.type===k)&&bySrc[CODEX.gsrc](x)).length;return n||k==='all'||CODEX.gslot===k?chip('gxslot',k,l,CODEX.gslot===k,n):'';}).join('')+`</div></div>`;
  if(abs.length)h+=`<div class="cxrow"><span class="cxlbl">Ability</span><div class="cxchips">`+chip('gxab','all','All',CODEX.gab==='all')+abs.map(([k,l])=>chip('gxab',k,l,CODEX.gab===k,pool.filter(x=>gearStat(x.it,k)).length)).join('')+`</div></div>`;
  const sorts=[['lv','Level ↑'],['lvd','Level ↓'],...(CODEX.gsrc==='drop'?[['chance','Best drop chance']]:[]),...(CODEX.gab!=='all'?[['stat',`Most ${gearAbName(CODEX.gab)}`]]:[]),['slots','Most slots'],['name','Name'],['own','Owned first']];
  h+=`<div class="cxrow"><span class="cxlbl">Sort</span><div class="cxchips">`+sorts.map(([k,l])=>chip('gxsort',k,l,CODEX.gsort===k)).join('')+`</div></div>`;
  if(!list.length)return h+`<p class="muted">No equipment matches. Try another slot, source or ability.</p>`;
  h+=`<div class="cxlist gxlist">`;
  for(const x of list){const it=x.it,own=gearOwned(x.id),slot=(GEAR_SLOTS.find(s=>s[0]===it.type)||[0,it.type])[1];
    let desc='';try{desc=itemDesc({id:x.id,s:[]});}catch(e){desc='';} // slots get their own line below
    if(CODEX.gab!=='all'){const k=CODEX.gab,v=gearStat(it,k);desc+=` · <b class="cxon">${gearAbName(k)} ${v>0?'+':''}${v}</b>`;}
    const srcs=x.src.map(({m,ch})=>{const wh=typeof itemMobWhere==='function'?itemMobWhere(m):'',mp=typeof mobPicURL==='function'?mobPicURL(m.id):'';
      return `<div class="gxsrc">${mp?`<img src="${mp}" alt="" loading="lazy">`:''}<div class="grow"><b>${esc(m.name)}</b> <span class="muted">Lv ${m.lv}${m.boss?' · boss':''}</span>${wh?`<div class="ds">${esc(wh)}</div>`:''}</div><span class="gxpct">${pct(ch)}</span></div>`;}).join('');
    const tags=[x.shop?`<span class="gxtag">Store · ${fmt(it.price||0)} gold</span>`:'',x.forge?`<span class="gxtag">Forged by Brannoc</span>`:'',x.other?`<span class="gxtag">Quests, festivals or bosses</span>`:''].join('');
    h+=`<div class="cxcard gxcard${own?' have':''}"><div class="gxhead">${icon(it).replace(/ data-item="[^"]*"/,'')}<div class="grow"><div class="cxtop"><span class="nm" style="color:${rarityCol(x.id)}">${esc(it.name)}</span><span class="cxslot">${esc(slot)}</span></div>`+
      `<div class="ds">${desc}</div>${gearSlotsHtml(x)}${own?`<span class="cxown">You have ${own}</span>`:''}</div></div>`+
      (srcs?`<div class="gxsrcs">${srcs}</div>`:'')+(tags?`<div class="gxtags">${tags}</div>`:'')+`</div>`;}
  return h+`</div>`;}
PANEL_ACTS.gxsrc=v=>{CODEX.gsrc=v;saveCodex();sfx('click');refreshPanel();};
PANEL_ACTS.gxslot=v=>{CODEX.gslot=v;saveCodex();sfx('click');refreshPanel();};
PANEL_ACTS.gxab=v=>{CODEX.gab=v;if(v!=='all')CODEX.gsort='stat';else if(CODEX.gsort==='stat')CODEX.gsort='lv';saveCodex();sfx('click');refreshPanel();};
PANEL_ACTS.gxsort=v=>{CODEX.gsort=v;saveCodex();sfx('click');refreshPanel();};
if(typeof TH!=='undefined')Object.assign(TH,{'Source':'แหล่งที่มา','Slot':'ช่อง','Monster drop':'ดรอปจากมอนสเตอร์','Shop':'ร้านค้า','Forge':'ตีขึ้น','Quests & events':'เควสและอีเวนต์',
  'Face':'ใบหน้า','Most slots':'ช่องมากที่สุด','No sigil slots':'ไม่มีช่องซิกิล','Mouth':'ปาก','Best drop chance':'โอกาสดรอปสูงสุด','Forged by Brannoc':'แบรนน็อกตีให้ได้','Quests, festivals or bosses':'เควส เทศกาล หรือบอส',
  'No equipment matches. Try another slot, source or ability.':'ไม่มีอุปกรณ์ที่ตรงกัน ลองเลือกช่อง แหล่งที่มา หรือความสามารถอื่น'});
