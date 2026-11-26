"use strict";
/* ================= the Waystation's world map (v1.54.0) =================
   Tobin's Travel list is now one map: every region a little picture square on the grid around the city
   (WORLD_GRID, js/regions4.js), joined by its roads. A tap picks a square and its details show under the map on a
   phone held upright, or beside it on a phone held sideways: the monsters, whether it suits your level, why you
   might go (quest, bounty, world boss, gathering), the roads out of it (tap to hop along) and one Travel button.
   A place you have not walked to says which gate to walk through. Squares mark the best place for your level (⭐),
   where you are (📍), a world boss (👑), a quest (📜) and places still locked (🔒). Loaded after js/travelcards.js. */
const WSMAP={sel:null};
const WSM_DIRS=[['north','↗','north'],['east','↘','east'],['south','↙','south'],['west','↖','west']]; // arrows as on the angled map
function wsmRoad(id){const p=WORLD_GRID[id];if(!p||id==='town'||id==='capital')return '';
  const r=typeof worldRoadOf==='function'?worldRoadOf(id):'';return {north:'North road',east:'East road',south:'South road',west:'West road',mid:'Round the cities'}[r]||'';} // (v1.62.0) from the road lists
// the gate to walk through to unlock a place: the visited neighbour nearest the city
function wsmGate(id){const L=ZONES[id].links||{};let best=null;
  for(const [d] of WSM_DIRS){const n=L[d];if(!n||!ZONES[n]||!(P.visited.includes(n)||zoneId===n))continue;
    if(!best||worldRing(n)<worldRing(best.n))best={n,d:{north:'south',south:'north',east:'west',west:'east'}[d]};}
  return best;}
// (v1.54.1) drawn the way the game and the minimap draw the world: at an angle, so east runs down-right, north up-right,
// south down-left and west up-left; each region a diamond like a floor tile, the roads as lines between them
function wsmIso(id){const [x,y]=WORLD_GRID[id];return [x-y,x+y];}
function wsmTile(id,best,box){const D=ZONES[id],here=zoneId===id,seen=P.visited.includes(id)||here,city=!!D.safe,sel=WSMAP.sel===id;
  const lv=typeof worldLowLv==='function'?worldLowLv(id):null,mk=seen&&typeof tcMarks==='function'?tcMarks(id):[];
  const boss=mk.some(m=>m[2]==='w'),quest=mk.some(m=>m[2]==='q');
  const cls=['wsmt',here?'here':'',seen?'':'locked',city?'city':'',id===best?'best':'',sel?'sel':''].filter(Boolean).join(' ');
  const bg=typeof tcBanner==='function'?`background-image:url(${tcBanner(id)});`:'';
  const [u,v]=wsmIso(id),X=(u-box.u0+1)/box.U*100,Y=(v-box.v0+1)/box.V*100;
  return `<button type="button" class="${cls}" data-act="wsmsel" data-arg="${id}" style="left:${X.toFixed(3)}%;top:${Y.toFixed(3)}%;width:${(200/box.U).toFixed(3)}%;height:${(200/box.V).toFixed(3)}%" aria-pressed="${sel}" aria-label="${esc(D.name)}${lv?`, level ${lv} and up`:''}${seen?'':', locked'}">`+
    `<span class="wsmo" aria-hidden="true"></span><span class="wsmd" aria-hidden="true" style="${bg}background-color:${((THEMES[D.theme]||THEMES.meadow).g||['#555'])[0]}"></span>`+
    `<b>${city?(id==='capital'?'♛':'⌂'):(lv||'')}</b>`+
    (here?'<i class="wsmpin">📍</i>':id===best?'<i class="wsmbest">⭐</i>':'')+(boss?'<i class="wsmwb">👑</i>':quest?'<i class="wsmq">📜</i>':'')+
    (sel?`<span class="wsmtag">${esc(D.name)}</span>`:city?`<span class="wsmcity wsmcity-${id}">${esc(D.name)}</span>`:'')+`</button>`;}
function wsmMapHtml(best){const ids=Object.keys(WORLD_GRID).filter(id=>ZONES[id]),iso=ids.map(wsmIso);
  const u0=Math.min(...iso.map(p=>p[0])),u1=Math.max(...iso.map(p=>p[0])),v0=Math.min(...iso.map(p=>p[1])),v1=Math.max(...iso.map(p=>p[1]));
  const box={u0,v0,U:u1-u0+2,V:v1-v0+2};
  // roads: a line between every two neighbours; dashed while one end is still unknown
  const known=id=>P.visited.includes(id)||zoneId===id;let roads='';
  for(const a of ids){const L=ZONES[a].links||{};for(const d of ['east','south']){const b=L[d];if(!b||!ZONES[b]||!WORLD_GRID[b])continue;
    const [ua,va]=wsmIso(a),[ub,vb]=wsmIso(b),ok=known(a)&&known(b);
    roads+=`<line x1="${ua-u0+1}" y1="${va-v0+1}" x2="${ub-u0+1}" y2="${vb-v0+1}" class="${ok?'ok':'dim'}"/>`;}}
  let h=`<div class="wsm" style="--ar:${box.U}/${box.V/2}" role="group" aria-label="World map">`+
    `<svg class="wsmr" viewBox="0 0 ${box.U} ${box.V}" preserveAspectRatio="none" aria-hidden="true">${roads}</svg>`;
  // compass letters at the far end of each road
  const arm=(dir,lbl)=>{const end=ids.filter(id=>wsmRoad(id)===dir).sort((a,b)=>worldRing(b)-worldRing(a))[0];if(!end)return '';
    const [u,v]=wsmIso(end),X=(u-u0+1)/box.U*100,Y=(v-v0+1)/box.V*100;return `<span class="wsmc wsmc-${lbl}" style="left:${X.toFixed(2)}%;top:${Y.toFixed(2)}%" aria-hidden="true">${lbl}</span>`;};
  h+=arm('North road','N')+arm('East road','E')+arm('South road','S')+arm('West road','W');
  for(const id of ids)h+=wsmTile(id,best,box);
  return h+`</div><div class="wsmkey"><span>⭐ best for you</span><span>📍 you</span><span>📜 quest</span><span>👑 world boss</span><span>grey: walk there first</span><span>numbers: lowest monster level</span></div>`;}
function wsmDetailHtml(id,ids,best,shard){const D=ZONES[id],here=zoneId===id,seen=P.visited.includes(id)||here,L=D.links||{};
  const road=wsmRoad(id),ring=WORLD_GRID[id]?worldRing(id):0;
  let x=`<div class="wsmwhere">${road?`${road} · ${ring===1?'next to the city':`${ring} regions from the city`}`:(id==='capital'?'The capital, west of Hearthvale':'Home: the middle of the world')}</div>`;
  const roads=WSM_DIRS.filter(([d])=>L[d]&&ZONES[L[d]]).map(([d,a])=>`<button type="button" class="wsmhop${P.visited.includes(L[d])||zoneId===L[d]?'':' locked'}" data-act="wsmsel" data-arg="${L[d]}"><i aria-hidden="true">${a}</i> ${esc(ZONES[L[d]].name)}</button>`).join('');
  if(roads)x+=`<div class="wsmroads"><span>Roads to</span>${roads}</div>`;
  if(typeof WORLD_BRANCH!=='undefined'&&WORLD_BRANCH[id]){const fl=WORLD_BRANCH[id].filter(z=>ZONES[z]);if(fl.length)x+=`<div class="wsmdown">▼ Stairs down inside: ${fl.map(z=>esc(ZONES[z].name)).join(' → ')}</div>`;}
  if(!seen){const g=wsmGate(id);x+=`<div class="wsmgate">🚶 ${g?`Walk out of the ${g.d} gate of <b>${esc(ZONES[g.n].name)}</b> to get here.`:'Walk there along the roads from a place you know.'}</div>`;}
  // (v1.55.0) the Waystone Shard: the same card, with one Go button (no fare: the shard is the fare)
  if(shard){const th=typeof tcBanner==='function'?tcBanner(id):'',known=P.visited.includes(id);
    const btn=here?'<div class="tclock">📍 You are here</div>':known?`<button class="btn tctravel primary" data-act="waygo" data-arg="${id}">✦ Go · the shard crumbles</button>`:'<div class="tclock">🔒 Walk there once first</div>';
    if(id==='town'||!ids.includes(id))return `<div class="tccard wsmcard"><div class="tcban" style="background-image:url(${th})"><b>${esc(D.name)}</b></div><div class="tcbody">${x}${btn}</div></div>`;
    return tcCardHtml(id,ids,best,x).replace('class="tccard','class="tccard wsmcard').replace(/<button class="btn tctravel[^>]*>[^<]*<\/button>|<div class="tclock">[^<]*<\/div>/,btn);}
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
#panel .wsm{position:relative;width:calc(100% - 20px);max-width:520px;aspect-ratio:var(--ar);margin:22px auto 16px;box-sizing:border-box}
#panel .wsm::before{content:'';position:absolute;inset:-16px -10px;border-radius:14px;z-index:0;
  background:radial-gradient(ellipse at 50% 50%,rgba(120,150,110,.18),transparent 70%),#121a26;border:1px solid rgba(232,194,90,.28);box-shadow:inset 0 0 24px rgba(0,0,0,.5)}
#panel .wsmr{position:absolute;inset:0;width:100%;height:100%;z-index:1;overflow:visible}
#panel .wsmr line{stroke:#d9bf86;stroke-width:4px;vector-effect:non-scaling-stroke;stroke-linecap:round}
#panel .wsmr line.dim{stroke:#7a6c50;stroke-width:3px;stroke-dasharray:3 4}
#panel .wsmc{position:absolute;z-index:1;transform:translate(-50%,-50%);font:900 11px var(--ui,system-ui);color:#e8c25a;opacity:.85;pointer-events:none}
#panel .wsmc-N{margin:-12px 0 0 20px}#panel .wsmc-E{margin:12px 0 0 20px}#panel .wsmc-S{margin:12px 0 0 -20px}#panel .wsmc-W{margin:-12px 0 0 -20px}
#panel .wsmt{position:absolute;transform:translate(-50%,-50%);z-index:2;padding:0;margin:0;border:0;background:none;cursor:pointer;
  display:flex;align-items:center;justify-content:center;color:#fff;font:800 11px var(--ui,system-ui);text-shadow:0 1px 2px #000,0 0 4px #000;transition:transform .12s}
#panel .wsmo,#panel .wsmd{position:absolute;clip-path:polygon(50% 0,100% 50%,50% 100%,0 50%)}
#panel .wsmo{inset:0;background:rgba(0,0,0,.7)}
#panel .wsmd{inset:2px 4px;background-size:cover;background-position:center 70%}
#panel .wsmt b{position:relative;z-index:3;line-height:1}
#panel .wsmt.city{z-index:5}#panel .wsmt.city .wsmo{background:#ffd77a}#panel .wsmt.city b{font-size:14px;color:#ffe9a8}
#panel .wsmt.locked .wsmd{filter:grayscale(.9) brightness(.55)}#panel .wsmt.locked b{color:#b8bfcc}
#panel .wsmt.best .wsmo{background:#ffd76a}#panel .wsmt.best{filter:drop-shadow(0 0 5px rgba(255,210,100,.7))}
#panel .wsmt.here .wsmo{background:#8ff0ff}
#panel .wsmt.sel{transform:translate(-50%,-50%) scale(1.3);z-index:6;filter:drop-shadow(0 0 6px rgba(255,200,90,.9))}#panel .wsmt.sel .wsmo{background:#fff3c4}#panel .wsmt.sel .wsmd{filter:none}
#panel .wsmt i{position:absolute;font-style:normal;line-height:1;font-size:9px;z-index:4;filter:drop-shadow(0 1px 1px #000)}
#panel .wsmpin,#panel .wsmbest{left:2px;top:-5px}#panel .wsmwb,#panel .wsmq{right:2px;top:-5px}#panel .wsmlock{right:4px;bottom:-4px;font-size:8px}
#panel .wsmtag,#panel .wsmcity{position:absolute;bottom:calc(100% + 2px);left:50%;transform:translateX(-50%);white-space:nowrap;padding:1px 6px;border-radius:8px;font:800 10px var(--ui,system-ui);text-shadow:none;pointer-events:none;z-index:5}
#panel .wsmtag{background:#2a1a04;color:#ffe08a;border:1px solid #e0a83a;font-size:8.5px}
#panel .wsmcity-town{bottom:auto;top:calc(100% + 2px)}#panel .wsmcity-capital{left:auto;right:55%;transform:none}
#panel .wsmcity{background:rgba(20,16,8,.85);color:#ffe9a8;border:1px solid rgba(255,215,122,.6)}
#panel .wsmkey{display:flex;flex-wrap:wrap;justify-content:center;gap:3px 10px;font-size:11px;color:var(--muted);margin:2px auto 8px;max-width:440px}
#panel .wsmwhere{font-size:12px;color:#c9d2e4;font-weight:600}
#panel .wsmroads{display:flex;flex-wrap:wrap;align-items:center;gap:5px}#panel .wsmroads>span{font-size:11.5px;color:var(--muted);margin-right:2px}
#panel .wsmhop i,#panel .cxchip i{font-style:normal}
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
  body.touchui #panel.npcfull[data-kind="warp"] .wsmw{grid-template-columns:minmax(0,1.2fr) minmax(0,1fr)}
  body.touchui #panel.npcfull[data-kind="warp"] .wsm{max-width:none;margin:22px auto 12px}
  body.touchui #panel.npcfull[data-kind="warp"] .wsmkey{display:none}
  body.touchui #panel.npcfull[data-kind="warp"] .wsdcol{padding-top:4px}
  body.touchui #panel.npcfull[data-kind="warp"] .wsnL{display:inline}
}`;document.head.appendChild(st);})();

if(typeof TH!=='undefined'){Object.assign(TH,{'North road':'ถนนเหนือ','East road':'ถนนตะวันออก','South road':'ถนนใต้','West road':'ถนนตะวันตก','next to the city':'ติดกับเมือง',
  'Roads to':'ถนนไป','📍 You are here':'📍 คุณอยู่ที่นี่','Walk home through the city gates':'เดินกลับผ่านประตูเมือง','The capital, west of Hearthvale':'เมืองหลวง ทางตะวันตกของเฮิร์ธเวล',
  'Home: the middle of the world':'บ้าน: ใจกลางโลก','⭐ best for you':'⭐ เหมาะกับคุณที่สุด','📍 you':'📍 คุณ','📜 quest':'📜 เควส','👑 world boss':'👑 บอสโลก','grey: walk there first':'สีเทา: ต้องเดินไปก่อน',
  'numbers: lowest monster level':'ตัวเลข: เลเวลมอนสเตอร์ต่ำสุด','Walk there along the roads from a place you know.':'เดินไปตามถนนจากที่ที่คุณเคยไป'});
  if(typeof TH_PAT!=='undefined')TH_PAT.unshift([/^(North|East|South|West) road · (\d+) regions from the city$/,(m,a,n)=>`${({North:'ถนนเหนือ',East:'ถนนตะวันออก',South:'ถนนใต้',West:'ถนนตะวันตก'})[a]} · ห่างจากเมือง ${n} ภูมิภาค`]);}

/* ---- (v1.55.0) the Waystone Shard shows the same map: tap a place, then Go; dungeon floors you know sit under the map ---- */
if(typeof PANELS!=='undefined'&&PANELS.waystone&&typeof WORLD_GRID!=='undefined'){const _pw=PANELS.waystone;PANELS.waystone=function(){if(typeof tcCardHtml!=='function')return _pw.apply(this,arguments);
  const ids=ZONE_ORDER.slice(1),best=tcBest(ids.filter(id=>P.visited.includes(id)));
  if(!WSMAP.sel||!ZONES[WSMAP.sel]||!WORLD_GRID[WSMAP.sel])WSMAP.sel=best||(WORLD_GRID[zoneId]?zoneId:'town');
  let h=`<h2>Waystone Shard</h2><div class="say">Hold the shard and picture the place. It crumbles once it carries you.</div>`;
  const floors=Object.keys(ZONES).filter(id=>!WORLD_GRID[id]&&P.visited.includes(id)&&id!==zoneId);
  h+=`<div class="wsmw"><div class="wsmcol">`+wsmMapHtml(best)+
    (floors.length?`<div class="wsmfl"><span>Floors below</span>${floors.map(id=>`<button type="button" class="wsmhop" data-act="waygo" data-arg="${id}"><i aria-hidden="true">▼</i> ${esc(ZONES[id].name)}</button>`).join('')}</div>`:'')+`</div>`+
    `<div class="wsdcol"><div class="wshint">Tap a place on the map. The shard takes you to any place you have walked to.</div><div id="wsDet">${wsmDetailHtml(WSMAP.sel,ids,best,true)}</div></div></div>`;
  return h;};}
(()=>{const st=document.createElement('style');st.textContent=`
#panel .wsmfl{display:flex;flex-wrap:wrap;align-items:center;gap:5px;margin:0 0 8px}#panel .wsmfl>span{font-size:11.5px;color:var(--muted);margin-right:2px}
@media (orientation:landscape) and (max-height:520px){
  body.touchui #panel.npcfull[data-kind="waystone"]>.say{display:none}
  body.touchui #panel.npcfull[data-kind="waystone"] .wsmw{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(0,1fr);gap:0 18px;align-items:start}
  body.touchui #panel.npcfull[data-kind="waystone"] .wsmcol{position:sticky;top:0}
  body.touchui #panel.npcfull[data-kind="waystone"] .wsmkey{display:none}
}`;document.head.appendChild(st);})();
if(typeof TH!=='undefined')Object.assign(TH,{'Floors below':'ชั้นใต้ดิน','✦ Go · the shard crumbles':'✦ ไป · ศิลาแตกสลาย','🔒 Walk there once first':'🔒 ต้องเดินไปก่อนหนึ่งครั้ง',
  'Tap a place on the map. The shard takes you to any place you have walked to.':'แตะสถานที่บนแผนที่ ศิลาพาคุณไปได้ทุกที่ที่เคยเดินไปแล้ว'});
// the shard's window fills the screen on phones like the Waystation (it was a small sheet at the bottom), with the same cards
if(typeof NPC_SHEET!=='undefined')NPC_SHEET.delete('waystone');
(()=>{const st=document.createElement('style');st.textContent=`
#panel[data-kind="waystone"] .tccard{display:flex;flex-direction:column}
#panel[data-kind="waystone"] .tcban{height:70px}#panel[data-kind="waystone"] .tcban b{font-size:15px}
#panel[data-kind="waystone"] .tcbody{flex:1;display:flex;flex-direction:column;align-items:stretch;gap:6px;padding:8px 10px 10px}
#panel[data-kind="waystone"] .tcfit .tcbadge{font-size:12px;padding:2px 9px}
#panel[data-kind="waystone"] .tcmobs,#panel[data-kind="waystone"] .tcmarks{margin-top:0}
#panel[data-kind="waystone"] .tccard.locked .tcban{filter:grayscale(.85) brightness(.7)}`;document.head.appendChild(st);})();
