"use strict";
/* ================= #32 the capital: Aurelmark =================
   A safe city west of Hearthvale (through the new west gate) with four districts, each announced as you walk in:
     Market Row        Merchant Tavi (the general store) and Gemcutter Sela, who adds sigil slots to gear
     Scholars' Quarter Librarian Oren's bestiary of every monster you have defeated, and Mentor Ansel (callings)
     Noble Gardens     Banker Ivo (storage), Sister Ada (healing), flower beds and a pond
     Grand Gate        Wayfarer Mira (travel and the inn), Smith Garrow (refining), the road home
   Layout lives in world.js (theme 'town', id 'capital'); no monsters, so the server needs nothing new. */
ZONES.capital={name:'Aurelmark',w:56,h:42,theme:'town',safe:true,lvl:'Capital city',links:{east:'town'}};
if(!ZONE_ORDER.includes('capital'))ZONE_ORDER.push('capital');
if(typeof WORLD_ROAD!=='undefined'&&!WORLD_ROAD.includes('capital'))WORLD_ROAD.unshift('capital');
const DISTRICTS=[{name:'Market Row',sub:'Shops and the Gemcutter',x0:3,y0:3,x1:26,y1:19},
  {name:"Scholars' Quarter",sub:'The Grand Library',x0:29,y0:3,x1:53,y1:19},
  {name:'Noble Gardens',sub:'The Royal Bank and the Chapel of Dawn',x0:3,y0:22,x1:26,y1:39},
  {name:'Grand Gate',sub:'The road east to Hearthvale',x0:29,y0:22,x1:53,y1:39}];
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
    if(n>=4){h+=`<div class="row"><div class="grow"><div class="nm">${esc(itemName(e))}</div><div class="ds">${where} · already has 4 slots</div></div></div>`;continue;}
    const g=GEM_GOLD[n],ok=P.gold>=g&&haveG>=n+1;
    h+=`<div class="row"><div class="grow"><div class="nm">${esc(itemName(e))}</div><div class="ds">${where} · ${n} slot${n===1?'':'s'} → ${n+1} · ${Math.round(GEM_CHANCE[n]*100)}%</div><div class="cms">${itemChip('glintstone',n+1)}${goldChip(g)}</div></div><button class="btn small" data-act="gemcut" data-arg="${e.uid}" ${ok?'':'disabled'}>Cut</button></div>`;}
  return h;};
PANEL_ACTS.gemcut=uid=>{const found=gemList().find(x=>String(x.e.uid)===String(uid));if(!found)return;const e=found.e,n=e.s.length;if(n>=4)return;
  const g=GEM_GOLD[n];if(P.gold<g||!takeItem('glintstone',n+1)){refreshPanel();return;}P.gold-=g;
  if(Math.random()<GEM_CHANCE[n]){e.s.push(null);sfx('jobup');fx.push({k:'ring',x:P.x,y:P.y,r:34,col:'#c8b0ff',t0:now,dur:.6});addLog(`Sela cuts a new slot: your ${ITEMS[e.id].name} now has ${n+1}.`,'l-good');}
  else{sfx('miss');addLog(`The stone resists. Sela shakes her head: no new slot this time (the gear is unharmed).`,'l-bad');}
  S=computeStats();save();refreshPanel();};

/* ---- Librarian Oren: the bestiary of monsters you have defeated ---- */
PANELS.library=()=>{const kk=(typeof achData==='function'?achData().kk:(P.ach&&P.ach.kk))||{};const all=Object.values(MOBS).filter(d=>!d.world||kk[d.id]).sort((a,b)=>a.lv-b.lv);
  const seen=all.filter(d=>kk[d.id]);
  let h=`<h2>The Grand Library</h2><div class="say">"Every creature you defeat, I write down. Defeat ten of a kind and I'll share all I know: drops, weaknesses, the lot." — Oren</div>`;
  h+=`<div class="sub">Bestiary: ${seen.length} of ${all.length} monsters recorded.</div>`;
  for(const d of all){const n=kk[d.id]||0;
    if(!n){h+=`<div class="row"><div class="grow"><div class="nm muted">??? · Lv ${d.lv}</div><div class="ds">Not yet recorded</div></div></div>`;continue;}
    const full=n>=10,race=typeof mobRace==='function'?` · ${SIZES[mobSize(d)].name} ${RACES[mobRace(d)].name}`:'';
    h+=`<div class="row"><div class="grow"><div class="nm">${esc(d.name)} · Lv ${d.lv}${d.boss?' · boss':''}</div><div class="ds">${fmt(n)} defeated · ${ELEM[d.el||'neutral'].name}${race}${full?' · drops: '+d.drops.map(([id])=>ITEMS[id].name).join(', '):` · ${10-n} more for full notes`}</div></div>${full?`<button class="btn small" data-act="libinfo" data-arg="${d.id}">Notes</button>`:''}</div>`;}
  return h;};
PANEL_ACTS.libinfo=id=>{if(MOBS[id])openPanel('mob',id);};
