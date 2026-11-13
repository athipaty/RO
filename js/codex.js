"use strict";
/* ================= the Sigil Codex at the Grand Library =================
   Librarian Oren's window gets a second tab next to the Bestiary: every sigil (card) in the game with what it
   gives, which gear it goes in, which monster drops it (where and how often) and how many you own or have
   socketed. Filter by equipment (weapon / armour / head / accessory) and by ability (ATK, DEF, AGI ...), and
   sort by monster level, strongest bonus, name or owned first.
   World-boss sigils stay hidden until you have defeated that boss, as in the Bestiary. Choices are remembered. */
const CODEX=(()=>{const d={tab:'beast',slot:'all',ab:'all',sort:'lv'};try{return Object.assign(d,JSON.parse(localStorage.getItem('embervale.codex')||'{}'));}catch(e){return d;}})();
const saveCodex=()=>{try{localStorage.setItem('embervale.codex',JSON.stringify(CODEX));}catch(e){}};
const CODEX_SLOTS=[['all','All'],['weapon','Weapon'],['armor','Armour'],['head','Head'],['accessory','Accessory']];
const CODEX_ABS=[['atk','ATK'],['matk','MATK'],['def','DEF'],['maxhp','Max HP'],['hppct','Max HP %'],['maxsp','Max SP'],['str','STR'],['agi','AGI'],['vit','VIT'],['int','INT'],['dex','DEX'],['luk','LUK'],['crit','CRIT'],['hit','HIT'],['flee','FLEE']];
const codexAbName=k=>(CODEX_ABS.find(a=>a[0]===k)||[k,k.toUpperCase()])[1];
function codexKills(){return (typeof achData==='function'?achData().kk:(P.ach&&P.ach.kk))||{};}
function codexAll(){const kk=codexKills();
  return Object.values(MOBS).filter(m=>m.sig&&ITEMS[m.id+'_sig']&&(!m.world||kk[m.id])).map(m=>({id:m.id+'_sig',m,kind:m.sig.kind,b:m.sig.b||{},ch:m.sigChance||.02}));}
// how many of a sigil you have: loose (bag + storage) and socketed in gear (worn, bag, storage)
function codexOwned(id){let loose=0,sock=0;
  for(const e of [...P.inv,...(P.storage||[])]){if(e.id===id&&e.n!==undefined)loose+=e.n;if(Array.isArray(e.s))sock+=e.s.filter(v=>v===id).length;}
  for(const e of Object.values(P.eq||{}))if(e&&Array.isArray(e.s))sock+=e.s.filter(v=>v===id).length;
  return {loose,sock};}
function codexBonusHtml(b){return Object.entries(b).map(([k,v])=>{const on=CODEX.ab===k;const t=`+${v}${k==='hppct'?'%':''} ${k==='hppct'?'Max HP':codexAbName(k)}`;
  return on?`<b class="cxon">${t}</b>`:t;}).join(', ');}
function codexHtml(){
  const all=codexAll(),kk=codexKills();
  const bySlot=CODEX.slot==='all'?all:all.filter(s=>s.kind===CODEX.slot);
  const abs=CODEX_ABS.filter(([k])=>bySlot.some(s=>s.b[k]));
  if(CODEX.ab!=='all'&&!abs.some(a=>a[0]===CODEX.ab))CODEX.ab='all';
  if(CODEX.sort==='best'&&CODEX.ab==='all')CODEX.sort='lv';
  let list=CODEX.ab==='all'?bySlot:bySlot.filter(s=>s.b[CODEX.ab]);
  const own=s=>{const o=codexOwned(s.id);return o.loose+o.sock;};
  const sorters={lv:(a,b)=>a.m.lv-b.m.lv,lvd:(a,b)=>b.m.lv-a.m.lv,best:(a,b)=>(b.b[CODEX.ab]||0)-(a.b[CODEX.ab]||0)||a.m.lv-b.m.lv,
    name:(a,b)=>ITEMS[a.id].name.localeCompare(ITEMS[b.id].name),own:(a,b)=>(own(b)>0)-(own(a)>0)||a.m.lv-b.m.lv};
  list=[...list].sort(sorters[CODEX.sort]||sorters.lv);
  const kinds=all.filter(s=>own(s)>0).length;
  const chip=(act,val,label,on,n)=>`<button type="button" class="cxchip${on?' on':''}" aria-pressed="${on}" data-act="${act}" data-arg="${val}">${label}${n!==undefined?` <span>${n}</span>`:''}</button>`;
  let h=`<div class="sub">${all.length} sigils known · you have ${kinds} of them.</div>`;
  h+=`<div class="cxrow"><span class="cxlbl">Equipment</span><div class="cxchips">`+CODEX_SLOTS.map(([k,l])=>chip('cxslot',k,l,CODEX.slot===k,k==='all'?all.length:all.filter(s=>s.kind===k).length)).join('')+`</div></div>`;
  h+=`<div class="cxrow"><span class="cxlbl">Ability</span><div class="cxchips">`+chip('cxab','all','All',CODEX.ab==='all')+abs.map(([k,l])=>chip('cxab',k,l,CODEX.ab===k,bySlot.filter(s=>s.b[k]).length)).join('')+`</div></div>`;
  const sorts=[['lv','Level ↑'],['lvd','Level ↓'],...(CODEX.ab!=='all'?[['best',`Most ${codexAbName(CODEX.ab)}`]]:[]),['name','Name'],['own','Owned first']];
  h+=`<div class="cxrow"><span class="cxlbl">Sort</span><div class="cxchips">`+sorts.map(([k,l])=>chip('cxsort',k,l,CODEX.sort===k)).join('')+`</div></div>`;
  if(!list.length)return h+`<p class="muted">No sigils match. Try another equipment or ability.</p>`;
  h+=`<div class="cxlist">`;
  for(const s of list){const it=ITEMS[s.id],o=codexOwned(s.id),wh=typeof itemMobWhere==='function'?itemMobWhere(s.m):'',killed=kk[s.m.id]||0;
    const ownTxt=o.loose||o.sock?`<span class="cxown">${[o.loose?`${o.loose} in bag`:'',o.sock?`${o.sock} socketed`:''].filter(Boolean).join(' · ')}</span>`:'';
    const mp=typeof mobPicURL==='function'?mobPicURL(s.m.id):'';
    h+=`<div class="cxcard${o.loose||o.sock?' have':''}">${icon(it).replace(/ data-item="[^"]*"/,'')}<div class="grow"><div class="cxtop"><span class="nm" style="color:${rarityCol(s.id)}">${esc(it.name)}</span><span class="cxslot">${esc((CODEX_SLOTS.find(x=>x[0]===s.kind)||[0,s.kind])[1])}</span></div>`+
      `<div class="cxb">${codexBonusHtml(s.b)}</div>`+
      `<div class="ds">From ${esc(s.m.name)} · Lv ${s.m.lv}${s.m.boss?' · boss':''}${wh?' · '+esc(wh):''} · ${typeof pctTxt==='function'?pctTxt(s.ch):Math.round(s.ch*1000)/10+'%'} drop${killed?` · ${fmt(killed)} defeated`:''}</div>${ownTxt}</div>`+
      (mp?`<figure class="cxmob"><img src="${mp}" alt="${esc(s.m.name)}" loading="lazy"><figcaption>Lv ${s.m.lv}</figcaption></figure>`:'')+`</div>`;}
  return h+`</div>`;}
const codexTabs=()=>`<div class="tabs cxtabs" role="tablist"><button class="btn small ${CODEX.tab==='beast'?'on':''}" role="tab" aria-selected="${CODEX.tab==='beast'}" data-act="cxtab" data-arg="beast">Bestiary</button>`+
  `<button class="btn small ${CODEX.tab==='sig'?'on':''}" role="tab" aria-selected="${CODEX.tab==='sig'}" data-act="cxtab" data-arg="sig">Sigil Codex</button></div>`;
const _libraryCx=PANELS.library;
PANELS.library=()=>{
  if(CODEX.tab!=='sig')return _libraryCx().replace('<div class="sub">',codexTabs()+'<div class="sub">');
  return `<h2>The Grand Library</h2><div class="say">"Every sigil ever pressed from a monster's essence is catalogued here: what it grants, which gear it suits and who drops it." — Oren</div>`+codexTabs()+codexHtml();};
PANEL_ACTS.cxtab=v=>{CODEX.tab=v==='sig'?'sig':'beast';saveCodex();sfx('click');refreshPanel();panel.scrollTop=0;};
PANEL_ACTS.cxslot=v=>{CODEX.slot=v;saveCodex();sfx('click');refreshPanel();};
PANEL_ACTS.cxab=v=>{CODEX.ab=v;if(v!=='all')CODEX.sort='best';else if(CODEX.sort==='best')CODEX.sort='lv';saveCodex();sfx('click');refreshPanel();};
PANEL_ACTS.cxsort=v=>{CODEX.sort=v;saveCodex();sfx('click');refreshPanel();};
if(typeof TH!=='undefined')Object.assign(TH,{'Bestiary':'สารานุกรมมอนสเตอร์','Sigil Codex':'สารานุกรมซิกิล','Equipment':'อุปกรณ์','Ability':'ความสามารถ','Sort':'เรียง','All':'ทั้งหมด',
  'Weapon':'อาวุธ','Armour':'เกราะ','Head':'หัว','Accessory':'เครื่องประดับ','Level ↑':'เลเวล ↑','Level ↓':'เลเวล ↓','Name':'ชื่อ','Owned first':'ที่มีก่อน',
  'No sigils match. Try another equipment or ability.':'ไม่มีซิกิลที่ตรงกัน ลองเลือกอุปกรณ์หรือความสามารถอื่น'});
