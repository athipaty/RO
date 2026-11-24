"use strict";
/* ================= the Waystation's world map (v1.54.0) =================
   Tobin's Travel list is now one map: every region a little picture square on the grid around the city
   (WORLD_GRID, js/regions4.js), joined by its roads. A tap picks a square and its details show under the map on a
   phone held upright, or beside it on a phone held sideways: the monsters, whether it suits your level, why you
   might go (quest, bounty, world boss, gathering), the roads out of it (tap to hop along) and one Travel button.
   A place you have not walked to says which gate to walk through. Squares mark the best place for your level (⭐),
   where you are (📍), a world boss (👑), a quest (📜) and places still locked (🔒). Loaded after js/travelcards.js. */
const WSMAP={sel:null};
const WSM_DIRS=[['north','↑','north'],['east','→','east'],['south','↓','south'],['west','←','west']];
function wsmRoad(id){const p=WORLD_GRID[id];if(!p||id==='town'||id==='capital')return '';
  return p[1]<0?'North road':p[0]>0?'East road':p[1]>0?'South road':'West road';}
// the gate to walk through to unlock a place: the visited neighbour nearest the city
function wsmGate(id){const L=ZONES[id].links||{};let best=null;
  for(const [d] of WSM_DIRS){const n=L[d];if(!n||!ZONES[n]||!(P.visited.includes(n)||zoneId===n))continue;
    if(!best||worldRing(n)<worldRing(best.n))best={n,d:{north:'south',south:'north',east:'west',west:'east'}[d]};}
  return best;}
function wsmTile(id,at,best){const D=ZONES[id],here=zoneId===id,seen=P.visited.includes(id)||here,city=!!D.safe,L=D.links||{},sel=WSMAP.sel===id;
  const lv=typeof worldLowLv==='function'?worldLowLv(id):null,mk=seen&&typeof tcMarks==='function'?tcMarks(id):[];
  const boss=mk.some(m=>m[2]==='w'),quest=mk.some(m=>m[2]==='q');
  const both=n=>n&&ZONES[n]&&(P.visited.includes(n)||zoneId===n)&&seen;
  const cls=['wsmt',here?'here':'',seen?'':'locked',city?'city':'',id===best?'best':'',sel?'sel':'',L.east&&ZONES[L.east]?(both(L.east)?'re':'re rdE'):'',L.south&&ZONES[L.south]?(both(L.south)?'rs':'rs rdS'):''].filter(Boolean).join(' ');
  const bg=typeof tcBanner==='function'?`background-image:url(${tcBanner(id)});`:'';
  return `<button type="button" class="${cls}" data-act="wsmsel" data-arg="${id}" style="${bg}background-color:${((THEMES[D.theme]||THEMES.meadow).g||['#555'])[0]}" aria-pressed="${sel}" aria-label="${esc(D.name)}${lv?`, level ${lv} and up`:''}${seen?'':', locked'}">`+
    `<b>${city?(id==='capital'?'♛':'⌂'):(lv||'')}</b>`+
    (here?'<i class="wsmpin">📍</i>':id===best?'<i class="wsmbest">⭐</i>':'')+(boss?'<i class="wsmwb">👑</i>':quest?'<i class="wsmq">📜</i>':'')+(seen?'':'<i class="wsmlock">🔒</i>')+
    (sel?`<span class="wsmtag">${esc(D.name)}</span>`:'')+`</button>`;}
function wsmMapHtml(best){const ids=Object.keys(WORLD_GRID).filter(id=>ZONES[id]),xs=ids.map(id=>WORLD_GRID[id][0]),ys=ids.map(id=>WORLD_GRID[id][1]);
  const x0=Math.min(...xs),x1=Math.max(...xs),y0=Math.min(...ys),y1=Math.max(...ys),at={};for(const id of ids)at[WORLD_GRID[id].join()]=id;
  const W=x1-x0+1,H=y1-y0+1;
  let h=`<div class="wsm" style="--wc:${W};--wr:${H}" role="group" aria-label="World map"><span class="wsmn" aria-hidden="true">N ↑</span>`;
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const id=at[x+','+y];h+=id?wsmTile(id,at,best):`<span class="wsme" aria-hidden="true"></span>`;}
  return h+`</div><div class="wsmkey"><span>⭐ best for you</span><span>📍 you</span><span>📜 quest</span><span>👑 world boss</span><span>🔒 walk there first</span><span>numbers: lowest monster level</span></div>`;}
function wsmDetailHtml(id,ids,best){const D=ZONES[id],here=zoneId===id,seen=P.visited.includes(id)||here,L=D.links||{};
  const road=wsmRoad(id),ring=WORLD_GRID[id]?worldRing(id):0;
  let x=`<div class="wsmwhere">${road?`${road} · ${ring===1?'next to the city':`${ring} regions from the city`}`:(id==='capital'?'The capital, west of Hearthvale':'Home: the middle of the world')}</div>`;
  const roads=WSM_DIRS.filter(([d])=>L[d]&&ZONES[L[d]]).map(([d,a])=>`<button type="button" class="wsmhop${P.visited.includes(L[d])||zoneId===L[d]?'':' locked'}" data-act="wsmsel" data-arg="${L[d]}">${a} ${esc(ZONES[L[d]].name)}</button>`).join('');
  if(roads)x+=`<div class="wsmroads"><span>Roads to</span>${roads}</div>`;
  if(typeof WORLD_BRANCH!=='undefined'&&WORLD_BRANCH[id]){const fl=WORLD_BRANCH[id].filter(z=>ZONES[z]);if(fl.length)x+=`<div class="wsmdown">▼ Stairs down inside: ${fl.map(z=>esc(ZONES[z].name)).join(' → ')}</div>`;}
  if(!seen){const g=wsmGate(id);x+=`<div class="wsmgate">🚶 ${g?`Walk out of the ${g.d} gate of <b>${esc(ZONES[g.n].name)}</b> to get here.`:'Walk there along the roads from a place you know.'}</div>`;}
  if(id==='town'||!ids.includes(id)){ // Hearthvale: no fare, Tobin lives here
    const th=typeof tcBanner==='function'?tcBanner(id):'';
    return `<div class="tccard wsmcard"><div class="tcban" style="background-image:url(${th})"><b>${esc(D.name)}</b></div><div class="tcbody">${x}<div class="tclock">${here?'📍 You are here':'Walk home through the city gates'}</div></div></div>`;}
  let h=tcCardHtml(id,ids,best,x).replace('class="tccard','class="tccard wsmcard');
  if(here)h=h.replace(/<button class="btn tctravel[^>]*>[^<]*<\/button>/,'<div class="tclock">📍 You are here</div>');
  return h;}
// the Travel part of the Waystation: map + details (replaces the list of cards)
{const _wch=warpCardsHtml;warpCardsHtml=function(){if(typeof WORLD_GRID==='undefined'||typeof tcCardHtml!=='function')return _wch.apply(this,arguments);
  const ids=ZONE_ORDER.slice(1),best=tcBest(ids.filter(id=>P.visited.includes(id))),nOk=ids.filter(id=>P.visited.includes(id)).length;
  if(!WSMAP.sel||!ZONES[WSMAP.sel]||!WORLD_GRID[WSMAP.sel])WSMAP.sel=best||(WORLD_GRID[zoneId]?zoneId:'meadow');
  const th=typeof LANG!=='undefined'&&LANG==='th';
  const jump=`<div class="wsjump"><button class="btn small on" data-act="wsjump" data-arg="travel">🧭 Travel</button><button class="btn small" data-act="wsjump" data-arg="rest">🛏 Rest</button><button class="btn small" data-act="wsjump" data-arg="stable">🐎 Stable</button></div>`;
  return jump+`<div class="wsmw"><div class="wsmcol">`+
    `<h3 id="wsTravel">Travel <span class="wsn">${nOk} of ${ids.length} places</span></h3>`+wsmMapHtml(best)+`</div>`+
    `<div class="wsdcol"><div class="wshint">${th?'แตะช่องบนแผนที่เพื่อดูรายละเอียด โทบินส่งคุณไปที่ไหนก็ได้ที่เคยเดินไปแล้ว ยิ่งไกลยิ่งแพง':'Tap a square on the map. Tobin sends you to any place you have already walked to; farther places cost more.'}</div>`+
    `<div class="wsgold">🪙 <b class="gold">${fmt(P.gold)}</b></div><span class="wsn wsnL">${nOk} of ${ids.length} places</span><div id="wsDet">${wsmDetailHtml(WSMAP.sel,ids,best)}</div></div></div>`;};}
PANEL_ACTS.wsmsel=id=>{if(!ZONES[id])return;WSMAP.sel=id;sfx('click');refreshPanel();
  // upright: bring the details into view if they sit below the screen
  try{const d=panel.querySelector('#wsDet');if(d){const r=d.getBoundingClientRect();if(r.top>innerHeight-120||r.bottom<60)d.scrollIntoView({block:'nearest',behavior:'smooth'});}}catch(e){}};

(()=>{const st=document.createElement('style');st.textContent=`
#panel .wsm{position:relative;display:grid;grid-template-columns:repeat(var(--wc),minmax(0,1fr));grid-template-rows:repeat(var(--wr),minmax(0,1fr));gap:5px;
  width:100%;max-width:440px;aspect-ratio:var(--wc)/var(--wr);margin:6px auto 4px;padding:8px;box-sizing:border-box;border-radius:14px;
  background:radial-gradient(ellipse at 50% 50%,rgba(120,150,110,.16),transparent 70%),repeating-linear-gradient(0deg,rgba(255,255,255,.025) 0 1px,transparent 1px 22px),repeating-linear-gradient(90deg,rgba(255,255,255,.025) 0 1px,transparent 1px 22px),#121a26;
  border:1px solid rgba(232,194,90,.28);box-shadow:inset 0 0 24px rgba(0,0,0,.5)}
#panel .wsmn{position:absolute;left:10px;top:7px;font:800 11px var(--ui,system-ui);color:#e8c25a;opacity:.8;pointer-events:none}
#panel .wsme{min-width:0}
#panel .wsmt{position:relative;min-width:0;min-height:0;padding:0;border-radius:7px;border:1.5px solid rgba(0,0,0,.6);background-size:cover;background-position:center 70%;
  cursor:pointer;display:flex;align-items:center;justify-content:center;color:#fff;font:800 12px var(--ui,system-ui);text-shadow:0 1px 2px #000,0 0 4px #000;
  box-shadow:0 2px 0 rgba(0,0,0,.45);transition:transform .12s}
#panel .wsmt b{position:relative;z-index:2;line-height:1}
#panel .wsmt.city{border-color:#ffd77a;box-shadow:0 0 0 1px #ffd77a inset,0 2px 0 rgba(0,0,0,.45)}#panel .wsmt.city b{font-size:16px;color:#ffe9a8}
#panel .wsmt.locked{filter:grayscale(.9) brightness(.55)}
#panel .wsmt.best{border-color:#ffd76a;box-shadow:0 0 9px rgba(255,210,100,.55)}
#panel .wsmt.here{outline:2px solid #8ff0ff;outline-offset:1px}
#panel .wsmt.sel{transform:scale(1.18);z-index:4;border:2px solid #fff3c4;box-shadow:0 0 0 2px #e0a83a,0 0 16px rgba(255,200,90,.7);filter:none}
#panel .wsmt i{position:absolute;font-style:normal;line-height:1;font-size:9px;z-index:3;filter:drop-shadow(0 1px 1px #000)}
#panel .wsmpin,#panel .wsmbest{left:-3px;top:-4px}#panel .wsmwb,#panel .wsmq{right:-3px;top:-4px}#panel .wsmlock{right:-2px;bottom:-3px;font-size:8px}
/* roads: to the square on the right and the one below; dashed and dim while one end is still unknown */
#panel .wsmt.re::after{content:'';position:absolute;left:100%;top:calc(50% - 2px);width:calc(5px + 4px);margin-left:-2px;height:4px;background:#d9bf86;border-radius:2px;z-index:1}
#panel .wsmt.rs::before{content:'';position:absolute;top:100%;left:calc(50% - 2px);height:calc(5px + 4px);margin-top:-2px;width:4px;background:#d9bf86;border-radius:2px;z-index:1}
#panel .wsmt.rdE::after{background:repeating-linear-gradient(90deg,#8a7a58 0 2px,transparent 2px 4px)}
#panel .wsmt.rdS::before{background:repeating-linear-gradient(0deg,#8a7a58 0 2px,transparent 2px 4px)}
#panel .wsmt.sel::after,#panel .wsmt.sel::before{display:none}
#panel .wsmtag{position:absolute;bottom:calc(100% + 5px);left:50%;transform:translateX(-50%) scale(.85);white-space:nowrap;padding:2px 7px;border-radius:8px;
  background:#2a1a04;color:#ffe08a;border:1px solid #e0a83a;font:800 11px var(--ui,system-ui);text-shadow:none;pointer-events:none;z-index:5}
#panel .wsmkey{display:flex;flex-wrap:wrap;justify-content:center;gap:3px 10px;font-size:11px;color:var(--muted);margin:2px auto 8px;max-width:440px}
#panel .wsmwhere{font-size:12px;color:#c9d2e4;font-weight:600}
#panel .wsmroads{display:flex;flex-wrap:wrap;align-items:center;gap:5px}#panel .wsmroads>span{font-size:11.5px;color:var(--muted);margin-right:2px}
#panel .wsmhop{padding:4px 9px;min-height:30px;border-radius:14px;border:1px solid rgba(217,191,134,.5);background:rgba(217,191,134,.12);color:#f1e2bd;font:700 12px var(--ui,system-ui);cursor:pointer}
#panel .wsmhop.locked{opacity:.6;border-style:dashed}
#panel .wsmdown{font-size:12px;color:#ffcf8a}
#panel .wsmgate{font-size:12.5px;color:#cfe8ff;background:rgba(120,170,255,.1);border:1px solid rgba(120,170,255,.3);border-radius:9px;padding:6px 9px}
#panel .wsmcard{animation:wsmIn .18s ease-out}@keyframes wsmIn{from{opacity:.4;transform:translateY(4px)}to{opacity:1;transform:none}}
#panel[data-kind="warp"] .wsmcard .tcban{height:70px}
#panel .wsdcol .wsgold{margin-bottom:6px}#panel .wsnL{display:none}
/* phone held sideways: the map on the left, as tall as the screen allows; the details beside it */
@media (orientation:landscape) and (max-height:520px){
  body.touchui #panel.npcfull[data-kind="warp"]>.say{display:none}
  body.touchui #panel.npcfull[data-kind="warp"] .wsmw{display:grid;grid-template-columns:auto minmax(0,1fr);gap:0 18px;align-items:start}
  body.touchui #panel.npcfull[data-kind="warp"] .wsmcol{position:sticky;top:0}
  body.touchui #panel.npcfull[data-kind="warp"] .wsmcol h3{display:none}
  body.touchui #panel.npcfull[data-kind="warp"]>.wsjump{position:fixed;top:max(14px,env(safe-area-inset-top));right:calc(max(12px,env(safe-area-inset-right)) + 62px);margin:0;z-index:6;flex-wrap:nowrap}
  body.touchui #panel.npcfull[data-kind="warp"] .wsm{width:auto;max-width:none;height:calc(100dvh - 84px - env(safe-area-inset-top) - env(safe-area-inset-bottom));min-height:220px;gap:5px;padding:7px;margin:0}
  body.touchui #panel.npcfull[data-kind="warp"] .wsmt b{font-size:10.5px}
  body.touchui #panel.npcfull[data-kind="warp"] .wsmkey{display:none}
  body.touchui #panel.npcfull[data-kind="warp"] .wsdcol{padding-top:4px}
  body.touchui #panel.npcfull[data-kind="warp"] .wsnL{display:inline}
}`;document.head.appendChild(st);})();

if(typeof TH!=='undefined'){Object.assign(TH,{'North road':'ถนนเหนือ','East road':'ถนนตะวันออก','South road':'ถนนใต้','West road':'ถนนตะวันตก','next to the city':'ติดกับเมือง',
  'Roads to':'ถนนไป','📍 You are here':'📍 คุณอยู่ที่นี่','Walk home through the city gates':'เดินกลับผ่านประตูเมือง','The capital, west of Hearthvale':'เมืองหลวง ทางตะวันตกของเฮิร์ธเวล',
  'Home: the middle of the world':'บ้าน: ใจกลางโลก','⭐ best for you':'⭐ เหมาะกับคุณที่สุด','📍 you':'📍 คุณ','📜 quest':'📜 เควส','👑 world boss':'👑 บอสโลก','🔒 walk there first':'🔒 ต้องเดินไปก่อน',
  'numbers: lowest monster level':'ตัวเลข: เลเวลมอนสเตอร์ต่ำสุด','Walk there along the roads from a place you know.':'เดินไปตามถนนจากที่ที่คุณเคยไป'});
  if(typeof TH_PAT!=='undefined')TH_PAT.unshift([/^(North|East|South|West) road · (\d+) regions from the city$/,(m,a,n)=>`${({North:'ถนนเหนือ',East:'ถนนตะวันออก',South:'ถนนใต้',West:'ถนนตะวันตก'})[a]} · ห่างจากเมือง ${n} ภูมิภาค`]);}
