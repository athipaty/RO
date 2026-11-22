"use strict";
/* ================= #32 the capital: Aurelmark =================
   A safe city west of Hearthvale (through the new west gate) with four districts, each announced as you walk in:
     Market Row        Merchant Tavi (the general store) and Gemcutter Sela, who adds sigil slots to gear
     Scholars' Quarter Librarian Oren's bestiary of every monster you have defeated, and Seer Valen (rebirth)
     Noble Gardens     a royal garden: flower beds and a pond
     Grand Gate        Smith Garrow (refining past +7), the road home
   v1.35.1: the bank, chapel, guild hall and waystation that only copied Hearthvale's were taken out.
   Layout lives in world.js (theme 'town', id 'capital'); no monsters, so the server needs nothing new. */
ZONES.capital={name:'Aurelmark',w:56,h:42,theme:'town',safe:true,lvl:'Capital city',links:typeof worldLinks==='function'?worldLinks('capital'):{east:'town'}}; // v1.47.0 also a west gate to Goldleaf Downs
if(!ZONE_ORDER.includes('capital'))ZONE_ORDER.push('capital');
if(typeof WORLD_ROAD!=='undefined'&&!WORLD_ROAD.includes('capital'))WORLD_ROAD.unshift('capital');
const DISTRICTS=[{name:'Market Row',sub:'Shops and the Gemcutter',x0:3,y0:3,x1:26,y1:19},
  {name:"Scholars' Quarter",sub:'The Grand Library',x0:29,y0:3,x1:53,y1:19},
  {name:'Noble Gardens',sub:'The Hall of Awakening and the Sigil Forge',x0:3,y0:22,x1:26,y1:39},
  {name:'Grand Gate',sub:'The Forge Royal and the road east to Hearthvale',x0:29,y0:22,x1:53,y1:39}];
let districtNow=null;
function districtAt(x,y){const tx=x/TILE,ty=y/TILE;return DISTRICTS.find(d=>tx>=d.x0&&tx<=d.x1&&ty>=d.y0&&ty<=d.y1)||null;}
setInterval(()=>{try{if(!running||!P||zoneId!=='capital'){districtNow=null;return;}const d=districtAt(P.x,P.y);
  if(d&&d!==districtNow){districtNow=d;showBanner(d.name,d.sub);}else if(!d)districtNow=null;}catch(e){}},400);

/* ---- Gemcutter Sela: add a sigil slot (up to 4); each extra slot is harder and dearer ---- */
const GEM_CHANCE=[.9,.7,.5,.3],GEM_GOLD=[2000,5000,12000,30000];
function gemList(){const out=[];for(const s of GEAR)if(P.eq[s]&&Array.isArray(P.eq[s].s))out.push({e:P.eq[s],where:'equipped'});
  for(const e of P.inv)if(e.uid&&Array.isArray(e.s)&&GEAR.includes(ITEMS[e.id].type))out.push({e,where:'in bag'});return out;}
PANELS.gemcut=()=>{let h=`<h2>Gemcutter Sela</h2><div class="say">"Every piece of gear can hold up to four sigils, if you trust my hand. I cut one new slot at a time. The deeper I go, the likelier the stone resists, but I never break your gear, only my fee."</div>`;
  const gl=invFind('glintstone'),haveG=gl?gl.n:0;h+=`<div class="sub">${fmt(P.gold)} gold</div><div class="cms">${itemHaveChip('glintstone')}</div>`;
  const list=gemList();if(!list.length)return h+`<div class="sub">You have no gear that can take a slot.</div>`;
  for(const {e,where} of list){const n=e.s.length,it=ITEMS[e.id];
    if(n>=4){h+=`<div class="row">${icon({id:e.id})}<div class="grow"><div class="nm">${esc(itemName(e))}</div><div class="ds">${where} · already has 4 slots</div></div></div>`;continue;}
    const g=GEM_GOLD[n],ok=P.gold>=g&&haveG>=n+1;
    h+=`<div class="row">${icon({id:e.id})}<div class="grow"><div class="nm">${esc(itemName(e))}</div><div class="ds">${where} · ${n} slot${n===1?'':'s'} → ${n+1} · ${Math.round(GEM_CHANCE[n]*100)}%</div><div class="cms">${itemChip('glintstone',n+1)}${goldChip(g)}</div></div><button class="btn small" data-act="gemcut" data-arg="${e.uid}" ${ok?'':'disabled'}>Cut</button></div>`;}
  return h;};
PANEL_ACTS.gemcut=uid=>{const found=gemList().find(x=>String(x.e.uid)===String(uid));if(!found)return;const e=found.e,n=e.s.length;if(n>=4)return;
  const g=GEM_GOLD[n];if(P.gold<g||!takeItem('glintstone',n+1)){refreshPanel();return;}P.gold-=g;
  if(Math.random()<GEM_CHANCE[n]){e.s.push(null);sfx('jobup');fx.push({k:'ring',x:P.x,y:P.y,r:34,col:'#c8b0ff',t0:now,dur:.6});addLog(`Sela cuts a new slot: your ${ITEMS[e.id].name} now has ${n+1}.`,'l-good');}
  else{sfx('miss');addLog(`The stone resists. Sela shakes her head: no new slot this time (the gear is unharmed).`,'l-bad');}
  S=computeStats();save();refreshPanel();};

/* ---- Librarian Oren: the bestiary of monsters you have defeated ---- */
// v1.36.7: every monster has its picture (a dark silhouette until you have defeated one), and the list can be narrowed by
// type, size, element and recorded or not, and sorted by level, name or how many you have defeated. Choices are remembered.
const BX_DEF={br:'all',bz:'all',be:'all',bs:'all',bsort:'lv'};
const bxState=()=>typeof CODEX!=='undefined'?Object.assign(CODEX,Object.fromEntries(Object.entries(BX_DEF).filter(([k])=>CODEX[k]===undefined))):Object.assign(BX_DEF);
PANELS.library=()=>{const kk=(typeof achData==='function'?achData().kk:(P.ach&&P.ach.kk))||{};const st=bxState();
  const all=Object.values(MOBS).filter(d=>!d.world||kk[d.id]);const seen=all.filter(d=>kk[d.id]);
  const race=d=>typeof mobRace==='function'?mobRace(d):'beast',size=d=>typeof mobSize==='function'?mobSize(d):'m',el=d=>d.el||'neutral';
  let h=`<h2>The Grand Library</h2><div class="say">"Every creature you defeat, I write down. Defeat ten of a kind and I'll share all I know: drops, weaknesses, the lot." — Oren</div>`;
  h+=`<div class="sub">Bestiary: ${seen.length} of ${all.length} monsters recorded.</div>`;
  const chip=(key,val,label,n)=>{const on=st[key]===val;return `<button type="button" class="cxchip${on?' on':''}" aria-pressed="${on}" data-act="bxf" data-arg="${key}|${val}">${label}${n!==undefined?` <span>${n}</span>`:''}</button>`;};
  const row=(lbl,key,opts,get)=>`<div class="cxrow"><span class="cxlbl">${lbl}</span><div class="cxchips">`+chip(key,'all','All',all.length)+opts.filter(([k])=>all.some(d=>get(d)===k)).map(([k,l])=>chip(key,k,l,all.filter(d=>get(d)===k).length)).join('')+`</div></div>`;
  if(typeof RACES!=='undefined')h+=row('Type','br',Object.entries(RACES).map(([k,v])=>[k,v.name]),race);
  if(typeof SIZES!=='undefined')h+=row('Size','bz',Object.entries(SIZES).map(([k,v])=>[k,v.name]),size);
  if(typeof ELEM!=='undefined')h+=row('Element','be',Object.entries(ELEM).map(([k,v])=>[k,v.name]),el);
  h+=`<div class="cxrow"><span class="cxlbl">Show</span><div class="cxchips">`+chip('bs','all','All',all.length)+chip('bs','seen','Recorded',seen.length)+chip('bs','unseen','Not yet',all.length-seen.length)+`</div></div>`;
  h+=`<div class="cxrow"><span class="cxlbl">Sort</span><div class="cxchips">`+[['lv','Level ↑'],['lvd','Level ↓'],['name','Name'],['most','Most defeated']].map(([k,l])=>{const on=st.bsort===k;return `<button type="button" class="cxchip${on?' on':''}" aria-pressed="${on}" data-act="bxsort" data-arg="${k}">${l}</button>`;}).join('')+`</div></div>`;
  const sorters={lv:(a,b)=>a.lv-b.lv,lvd:(a,b)=>b.lv-a.lv,name:(a,b)=>a.name.localeCompare(b.name),most:(a,b)=>(kk[b.id]||0)-(kk[a.id]||0)||a.lv-b.lv};
  const list=all.filter(d=>(st.br==='all'||race(d)===st.br)&&(st.bz==='all'||size(d)===st.bz)&&(st.be==='all'||el(d)===st.be)&&(st.bs==='all'||(st.bs==='seen')===!!kk[d.id])).sort(sorters[st.bsort]||sorters.lv);
  if(!list.length)return h+`<p class="muted">No monsters match. Try another type, size or element.</p>`;
  h+=`<div class="bxlist">`;
  for(const d of list){const n=kk[d.id]||0,full=n>=10,pic=typeof mobPicURL==='function'?mobPicURL(d.id):'';
    const tags=n?[typeof RACES!=='undefined'?RACES[race(d)].name:'',typeof SIZES!=='undefined'?SIZES[size(d)].name:'',ELEM[el(d)]?`<span style="color:${ELEM[el(d)].col}">${ELEM[el(d)].name}</span>`:''].filter(Boolean).join(' · '):'';
    h+=`<div class="bxcard${n?'':' unseen'}${d.boss?' boss':''}">${pic?`<img class="bxpic" src="${pic}" alt="${n?esc(d.name):''}" loading="lazy">`:''}<div class="grow">`+
      `<div class="nm">${n?esc(d.name):'???'} <span class="muted">Lv ${d.lv}</span>${d.boss?' <span class="bxboss">boss</span>':''}</div>`+
      (n?`<div class="ds">${tags}</div><div class="ds">${fmt(n)} defeated${full?' · drops: '+d.drops.map(([id])=>ITEMS[id].name).join(', '):` · ${10-n} more for full notes`}</div>`:`<div class="ds">Not yet recorded</div>`)+
      `</div>${full?`<button class="btn small" data-act="libinfo" data-arg="${d.id}">Notes</button>`:''}</div>`;}
  return h+`</div>`;};
PANEL_ACTS.bxf=arg=>{const [k,v]=String(arg).split('|');if(!(k in BX_DEF))return;const st=bxState();st[k]=v;if(typeof saveCodex==='function')saveCodex();sfx('click');refreshPanel();};
PANEL_ACTS.bxsort=v=>{const st=bxState();st.bsort=v;if(typeof saveCodex==='function')saveCodex();sfx('click');refreshPanel();};
if(typeof TH!=='undefined')for(const [k,v] of [['Type','ประเภท'],['Size','ขนาด'],['Element','ธาตุ'],['Show','แสดง'],['Recorded','บันทึกแล้ว'],['Not yet','ยังไม่บันทึก'],['Most defeated','ล้มมากสุด'],
  ['No monsters match. Try another type, size or element.','ไม่มีมอนสเตอร์ที่ตรงกัน ลองเลือกประเภท ขนาด หรือธาตุอื่น']])if(!TH[k])TH[k]=v;
PANEL_ACTS.libinfo=id=>{if(MOBS[id])openPanel('mob',id);};
// Thai for the Bestiary's type, size and element names
if(typeof TH!=='undefined')for(const [k,v] of [['Beast','สัตว์'],['Insect','แมลง'],['Plant','พืช'],['Spirit','วิญญาณ'],['Undead','อันเดด'],['Fiend','ปีศาจ'],['Construct','หุ่นศิลา'],['Dragon','มังกร'],['Human','มนุษย์'],
  ['Small','เล็ก'],['Medium','กลาง'],['Large','ใหญ่'],['Neutral','ไร้ธาตุ'],['Fire','ไฟ'],['Water','น้ำ'],['Wind','ลม'],['Earth','ดิน'],['Shadow','มืด'],['Holy','ศักดิ์สิทธิ์'],['Ghost','ผี'],['Poison','พิษ']])if(!TH[k])TH[k]=v;
