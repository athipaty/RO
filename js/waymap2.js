"use strict";
/* ================= the world map, easier on a phone; monsters' elements on the cards (v1.64.1) =================
   With thirty-odd regions the map was squeezed to fit the window, so each square was a small diamond, hard to hit
   with a finger. Now it opens big (each square about 70 px wide) inside a box you drag to look around, centred on
   the place you picked; one button switches between the bigger map and the whole world at a glance (remembered).
   On each place's card, every monster picture carries a badge of its element, and a line says what each element
   there is weak to ("💧 Water: weak to 🌪 Wind"), so a hunter can bring the right weapon. */
const WSZ={big:true,centred:null}; // (v1.64.5) always the big map: the Bigger / Whole world button is gone
const EL_ICON={fire:'🔥',water:'💧',wind:'🌪',earth:'⛰',holy:'✨',shadow:'🌑',neutral:''};
const EL_TH={fire:'ไฟ',water:'น้ำ',wind:'ลม',earth:'ดิน',holy:'ศักดิ์สิทธิ์',shadow:'มืด',neutral:'ไร้ธาตุ'};
const elName=el=>typeof LANG!=='undefined'&&LANG==='th'?(EL_TH[el]||el):(typeof ELEM!=='undefined'&&ELEM[el]?ELEM[el].name:el);
// ---- the map in a box you can drag ----
{const _wmm=wsmMapHtml;wsmMapHtml=function(best){const h=_wmm.apply(this,arguments),cut=h.indexOf('<div class="wsmkey">');
  const ids=Object.keys(WORLD_GRID).filter(id=>ZONES[id]),us=ids.map(id=>wsmIso(id)[0]),U=Math.max(...us)-Math.min(...us)+2;
  // the N/E/S/W letters that sat beside the last square of each road give way to one compass in the map's corner
  const map=(cut<0?h:h.slice(0,cut)).replace(/<span class="wsmc wsmc-[NESW]"[^>]*>[NESW]<\/span>/g,''),key=cut<0?'':h.slice(cut);
  const compass=`<div class="wsmrose" aria-hidden="true"><svg viewBox="-30 -30 60 60"><circle r="27" class="rr"/><path d="M0-4 L15-15 L4 0 L15 15 L0 4 L-15 15 L-4 0 L-15-15Z" class="rp"/>`+
    `<path d="M2-2 L15-15 L-2 2Z" class="rn"/><text x="20" y="-17">N</text><text x="20" y="23">E</text><text x="-20" y="23">S</text><text x="-20" y="-17">W</text></svg></div>`;
  // (v1.64.5) a region with stairs down to a dungeon carries a ▼ sign on its square
  let mapD=map;for(const k of Object.keys(typeof WORLD_BRANCH!=='undefined'?WORLD_BRANCH:{})){const at=mapD.indexOf(`data-arg="${k}"`);if(at<0)continue;
    const end=mapD.indexOf('</button>',at);if(end>0)mapD=mapD.slice(0,end)+'<i class="wsmdn" aria-hidden="true">▼</i>'+mapD.slice(end);}
  return `<div class="wsmwrap"><div class="wsmscroll big" style="--U:${U}">${mapD}</div>${compass}</div>`+
    key.replace('<span>numbers: lowest monster level</span>','<span>numbers: lowest monster level</span><span>▼ dungeon below</span>');};}
// centre the picked square once each time the pick changes (not on every refresh, so a drag is not undone)
function wsmCentre(){const sc=panel&&panel.querySelector('.wsmscroll.big');if(!sc)return;const t=sc.querySelector('.wsmt.sel')||sc.querySelector('.wsmt.here');if(!t)return;
  const key=(WSMAP.sel||'')+'|'+panelKind;const keep=WSZ.centred===key&&WSZ.pos;if(keep){sc.scrollLeft=WSZ.pos[0];sc.scrollTop=WSZ.pos[1];return;}
  const a=sc.getBoundingClientRect(),b=t.getBoundingClientRect();sc.scrollLeft+=b.left+b.width/2-(a.left+a.width/2);sc.scrollTop+=b.top+b.height/2-(a.top+a.height/2);
  WSZ.centred=key;WSZ.pos=[sc.scrollLeft,sc.scrollTop];}
{const _rpW=refreshPanel;refreshPanel=function(){const sc=panel&&panel.querySelector('.wsmscroll.big');if(sc&&WSZ.centred)WSZ.pos=[sc.scrollLeft,sc.scrollTop];
  const r=_rpW.apply(this,arguments);try{if(panel.querySelector('.wsmscroll.big'))requestAnimationFrame(wsmCentre);}catch(e){}return r;};}
document.addEventListener('scroll',ev=>{const sc=ev.target;if(sc&&sc.classList&&sc.classList.contains('wsmscroll')&&WSZ.centred)WSZ.pos=[sc.scrollLeft,sc.scrollTop];},true);
// ---- each monster's element on the cards ----
function elBadge(m){const el=m.el||'neutral';if(el==='neutral'||!EL_ICON[el])return '';const col=typeof ELEM!=='undefined'&&ELEM[el]?ELEM[el].col:'#ccc';
  return `<i class="tcel" style="--ec:${col}" title="${esc(elName(el))}">${EL_ICON[el]}</i>`;}
// "💧 Water: weak to 🌪 Wind" for each element living there (bosses included)
function elWeakLine(ms){const els=[...new Set(ms.map(m=>m.el||'neutral'))].filter(e=>e!=='neutral'&&typeof weakTo==='function');if(!els.length)return '';
  const th=typeof LANG!=='undefined'&&LANG==='th';
  return `<div class="tcels">`+els.map(e=>{const w=weakTo(e);return `<span class="tcelw" style="--ec:${ELEM[e].col}">${EL_ICON[e]} ${esc(elName(e))}${w.length?`<b>${th?'แพ้':'weak to'} ${w.map(x=>`${EL_ICON[x]} ${esc(elName(x))}`).join(', ')}</b>`:''}</span>`;}).join('')+`</div>`;}
{const _tcc=tcCardHtml;tcCardHtml=function(id){let h=_tcc.apply(this,arguments);const D=ZONES[id];if(!D||!D.mobs||!P.visited.includes(id))return h;
  const ms=[...new Set(D.mobs.map(([m])=>m))].map(m=>MOBS[m]).filter(m=>m&&!m.world);
  // badge each picture (its title starts with the monster's name)
  h=h.replace(/<img class="tcmob([^"]*)" src="([^"]*)" alt="" title="([^"·]+) · ([^"]*)">/g,(all,cls,src,name,rest)=>{const m=ms.find(x=>x.name===name.trim());if(!m)return all;
    return `<span class="tcmobw"><img class="tcmob${cls}" src="${src}" alt="" title="${name}· ${elName(m.el||'neutral')} · ${rest}">${elBadge(m)}</span>`;});
  return h.replace('</div><div class="tcmarks">',`</div>${elWeakLine(ms)}<div class="tcmarks">`).replace(/(<div class="tcmobs">(?:(?!<\/div>).)*<\/div>)(?!<div class="tcels">)/,(m0)=>m0+(h.includes('class="tcels"')?'':elWeakLine(ms)));};}
(()=>{const st=document.createElement('style');st.textContent=`
#panel .wsmbar{display:flex;align-items:center;gap:8px;margin:2px 0 0}
#panel .wsmwrap{position:relative}
#panel .wsmrose{position:absolute;top:6px;right:6px;width:46px;height:46px;z-index:5;pointer-events:none;opacity:.92;filter:drop-shadow(0 1px 3px rgba(0,0,0,.7))}
#panel .wsmrose svg{width:100%;height:100%;overflow:visible}
#panel .wsmrose .rr{fill:rgba(14,21,31,.82);stroke:rgba(232,194,90,.55);stroke-width:1.5}
#panel .wsmrose .rp{fill:#cfc3a4}#panel .wsmrose .rn{fill:#e85a4a}
#panel .wsmrose text{font:900 10px var(--ui,system-ui);fill:#e8c25a;text-anchor:middle;dominant-baseline:middle}
#panel .wsmbar .ds{font-size:11px;opacity:.75}
#panel .wsmscroll.big{overflow:auto;max-height:min(62vh,520px);border-radius:14px;touch-action:pan-x pan-y;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;margin:6px 0 4px;
  background:#0e151f;border:1px solid rgba(232,194,90,.28)}
#panel .wsmscroll.big .wsm{width:calc(var(--U) * 36px);max-width:none!important;margin:28px 26px}
#panel .wsmscroll.big .wsm::before{display:none}
#panel .wsmscroll.big .wsmt b{font-size:14px}
#panel .wsmscroll.big .wsmt i{font-size:13px}
#panel .tcmobw{position:relative;display:inline-block}
/* (v1.64.2) bigger monster pictures, so each one is easy to make out */
#panel .tcmobs{gap:8px}
#panel .tcmob{width:52px;height:52px;border-radius:10px}
#panel .tcel{width:20px;height:20px;font-size:12px}
#panel .tcel{position:absolute;right:-4px;bottom:-4px;width:16px;height:16px;border-radius:50%;display:flex;align-items:center;justify-content:center;
  font-style:normal;font-size:10px;line-height:1;background:#141a24;border:1.5px solid var(--ec);box-shadow:0 0 4px var(--ec);pointer-events:none}
#panel .tcels{display:flex;flex-wrap:wrap;gap:4px 10px;margin:6px 0 2px;font-size:12px}
#panel .tcelw{color:var(--ec);font-weight:700}
#panel .tcelw b{color:#e8e2d4;font-weight:500;margin-left:5px}
`;document.head.appendChild(st);})();
/* ---- (v1.64.2) the World map window (M): the same bigger squares in a box you drag, centred on where you are ---- */
{const _wgh=worldGridHtml;worldGridHtml=function(){let h=_wgh.apply(this,arguments);const cut=h.indexOf('<div class="wkey');
  let grid=cut<0?h:h.slice(0,cut);const key=cut<0?'':h.slice(cut);
  grid=grid.replace('minmax(0,1fr))','64px)');
  return `<div class="wgscroll big">${grid}</div>`+key;};}
function wgCentre(){const sc=panel&&panel.querySelector('.wgscroll.big');if(!sc||sc._centred)return;const t=sc.querySelector('.wc.here')||sc.querySelector('.wc.city');if(!t)return;
  const a=sc.getBoundingClientRect(),b=t.getBoundingClientRect();sc.scrollLeft+=b.left+b.width/2-(a.left+a.width/2);sc.scrollTop+=b.top+b.height/2-(a.top+a.height/2);sc._centred=1;}
{const _rpG=refreshPanel;refreshPanel=function(){const r=_rpG.apply(this,arguments);try{if(panelKind==='worldmap')requestAnimationFrame(wgCentre);}catch(e){}return r;};}
(()=>{const st=document.createElement('style');st.textContent=`
#panel .wgscroll.big{overflow:auto;max-height:min(58vh,460px);border-radius:12px;touch-action:pan-x pan-y;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;
  margin:6px 0 4px;padding:10px;background:#0e151f;border:1px solid rgba(232,194,90,.28)}
#panel .wgscroll.big .wgrid{max-width:none;width:max-content;gap:6px;margin:0}
#panel .wgscroll.big .wc{width:64px;font-size:15px}
#panel .wgscroll.big .wc i{font-size:13px}
#panel .wgscroll.big .wc.le::after{right:-7px;width:8px}#panel .wgscroll.big .wc.ls::before{bottom:-7px;height:8px}
`;document.head.appendChild(st);})();
/* ---- (v1.64.3) the Waystone Shard: a "Floors below" tab with a map of its own ----
   The dungeon floors (and the island, the keep and the arena) were a row of text buttons under the map that sent you
   off at once. Now two tabs sit over the map, World map and Floors below; the floors are big squares grouped by where
   they are (Mossdeep under the Woods, the Molten Depths under the Caldera, the island and its grotto, other places),
   and tapping one shows its card below, monsters and all, with the Go button, like a place on the world map. */
const WSF={view:'world',sel:null};
function wsfGroups(){const g=[],used=new Set(),B=typeof WORLD_BRANCH!=='undefined'?WORLD_BRANCH:{};
  const add=(title,ids)=>{ids=ids.filter(id=>ZONES[id]&&!used.has(id));if(!ids.length)return;ids.forEach(id=>used.add(id));g.push([title,ids]);};
  if(B.woods)add('Mossdeep Caverns · under Whispering Woods',B.woods);
  if(B.caldera)add('Molten Depths · under Cinderpeak Caldera',B.caldera);
  if(ZONES.isles)add('Across the sea · Tidewater Isle',['isles',...(B.isles||[])]);
  for(const k in B)if(!['woods','caldera','isles'].includes(k))add(`Under ${ZONES[k]?ZONES[k].name:k}`,B[k]);
  add('Other places',Object.keys(ZONES).filter(id=>typeof WORLD_GRID!=='undefined'&&!WORLD_GRID[id]&&id!=='town'));
  return g.filter(([,ids])=>ids.some(id=>P.visited.includes(id)));}
function wsfTile(id){const D=ZONES[id],here=zoneId===id,seen=P.visited.includes(id)||here,sel=WSF.sel===id,th=THEMES[D.theme]||THEMES.meadow;
  const lv=typeof worldLowLv==='function'?worldLowLv(id):null,tag=D.dungeon?'B'+D.dungeon:D.isle?'⛵':D.safe?'⚑':'';
  return `<button type="button" class="wft${here?' here':''}${seen?'':' locked'}${sel?' sel':''}" data-act="wsfsel" data-arg="${id}" style="background:${(th.g||['#555'])[0]}" aria-pressed="${sel}" aria-label="${esc(D.name)}${seen?'':', locked'}">`+
    `<span class="wfk">${tag}</span><b>${lv||''}</b>${D.safe?`<span class="wfn">${esc(D.name)}</span>`:''}${here?'<i class="wfp">📍</i>':''}${seen?'':'<i class="wfl">🔒</i>'}</button>`;}
function wsfMapHtml(){const gs=wsfGroups();if(!gs.length)return '<div class="ds">No floors yet: walk down a dungeon\'s stairs first.</div>';
  return `<div class="wsfmap">`+gs.map(([t,ids])=>`<div class="wfg"><div class="wfgt">${esc(t)}</div><div class="wfrow">${ids.map((id,i)=>(i&&t!=='Other places'?'<span class="wfa" aria-hidden="true">▸</span>':'')+wsfTile(id)).join('')}</div></div>`).join('')+`</div>`;}
function wsfDetail(id){const D=ZONES[id];if(!D)return '';const known=P.visited.includes(id),here=zoneId===id;
  const btn=here?'<div class="tclock">📍 You are here</div>':known?`<button class="btn tctravel primary" data-act="waygo" data-arg="${id}">✦ Go · the shard crumbles</button>`:'<div class="tclock">🔒 Walk there once first</div>';
  const par=Object.keys(typeof WORLD_BRANCH!=='undefined'?WORLD_BRANCH:{}).find(k=>WORLD_BRANCH[k].includes(id));
  const x=`<div class="wsmwhere">${par?`▼ Down the stairs in ${esc(ZONES[par].name)}`:D.isle?'⛵ By boat from Willowmere Farms':''}</div>`;
  return tcCardHtml(id,[id],null,x).replace('class="tccard','class="tccard wsmcard').replace(/<button class="btn tctravel[^>]*>[^<]*<\/button>|<div class="tclock">[^<]*<\/div>/,btn);}
if(typeof PANELS!=='undefined'&&PANELS.waystone){const _pwF=PANELS.waystone;PANELS.waystone=function(){let h=_pwF.apply(this,arguments);
  const gs=wsfGroups();if(!gs.length){WSF.view='world';return h.replace(/<div class="wsmfl">[\s\S]*?<\/div>(?=<\/div><div class="wsdcol">)/,'');}
  const n=gs.reduce((a,[,ids])=>a+ids.filter(id=>P.visited.includes(id)).length,0);
  const tabs=wsfToggle(WSF.view,'wsview',n);
  const a=h.indexOf('<div class="wsmw"><div class="wsmcol">'),b=h.indexOf('</div><div class="wsdcol">');if(a<0||b<0)return h;
  const start=a+'<div class="wsmw"><div class="wsmcol">'.length;let col=h.slice(start,b).replace(/<div class="wsmfl">[\s\S]*$/,'');
  if(WSF.view==='floors'){const all=gs.flatMap(([,ids])=>ids);if(!WSF.sel||!all.includes(WSF.sel))WSF.sel=all.find(id=>P.visited.includes(id)&&id!==zoneId)||all[0];
    col=wsfMapHtml();h=h.replace(/<div id="wsDet">[\s\S]*<\/div><\/div><\/div>$/,`<div id="wsDet">${wsfDetail(WSF.sel)}</div></div></div>`);}
  return h.slice(0,start)+tabs+col+h.slice(b);};}
// (v1.64.5) one button switches between the world map and the floors: ⇄ on its left, the view you are on as its name
function wsfToggle(view,act,n){const fl=view==='floors',next=fl?'world':'floors';
  return `<div class="wsftabs"><button type="button" class="btn wsftog${fl?' fl':''}" data-act="${act}" data-arg="${next}" aria-label="${fl?'Floors below: switch to the world map':'World map: switch to the floors below'}">`+
    `<span class="wsfarr" aria-hidden="true">⇄</span>${fl?`▼ Floors below <span class="wsn">${n}</span>`:'🗺 World map'}</button></div>`;}
PANEL_ACTS.wsview=v=>{WSF.view=v==='floors'?'floors':'world';sfx('click');refreshPanel();};
PANEL_ACTS.wsfsel=id=>{if(!ZONES[id])return;WSF.sel=id;sfx('click');refreshPanel();try{const d=panel.querySelector('#wsDet');if(d){const r=d.getBoundingClientRect();if(r.top>innerHeight-120)d.scrollIntoView({block:'nearest',behavior:'smooth'});}}catch(e){}};
if(typeof TH!=='undefined')Object.assign(TH,{'🗺 World map':'🗺 แผนที่โลก','Other places':'ที่อื่น ๆ'});
(()=>{const st=document.createElement('style');st.textContent=`
#panel .wsftabs{display:flex;gap:6px;margin:4px 0 6px}
#panel .wsftog{display:inline-flex;align-items:center;gap:8px;padding:6px 14px 6px 8px;min-height:38px;border-radius:20px;font-weight:800}
#panel .wsftog .wsfarr{display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:50%;background:rgba(232,194,90,.22);color:#ffd77a;font-size:15px}
#panel .wsmt .wsmdn{position:absolute;right:22%;bottom:22%;font-style:normal;font-size:12px;color:#ffcf8a;z-index:4;filter:drop-shadow(0 1px 1px #000)}
#panel .wsfmap{display:flex;flex-direction:column;gap:12px;padding:12px;border-radius:14px;background:#0e151f;border:1px solid rgba(232,194,90,.28);margin:4px 0 8px}
#panel .wfgt{font:700 12px var(--ui,system-ui);color:#e8c25a;margin:0 0 6px}
#panel .wfrow{display:flex;align-items:center;flex-wrap:wrap;gap:6px}
#panel .wfa{color:#c9b07a;font-size:14px}
#panel .wft{position:relative;width:64px;height:64px;border-radius:10px;border:1px solid rgba(0,0,0,.55);padding:0;cursor:pointer;color:#fff;
  display:flex;flex-direction:column;align-items:center;justify-content:center;text-shadow:0 1px 2px #000,0 0 3px #000;font:800 15px var(--ui,system-ui)}
#panel .wft .wfk{font-size:11px;opacity:.95}
#panel .wft .wfn{font-size:10px;font-weight:700;line-height:1.1;padding:0 3px;text-align:center}
#panel .wft.locked{filter:grayscale(.85) brightness(.6);cursor:default}
#panel .wft.sel{outline:3px solid #ffd77a;outline-offset:2px}
#panel .wft.here{box-shadow:0 0 0 2px var(--exp) inset}
#panel .wft i{position:absolute;font-style:normal;font-size:12px;line-height:1}#panel .wft .wfp{right:3px;top:3px}#panel .wft .wfl{right:3px;bottom:3px}
`;document.head.appendChild(st);})();
/* ---- (v1.64.4) the Waystation (Tobin) gets the Floors below tab too ----
   Tobin's fare for a place in the travel list is 60 gold per place along it. A floor costs the fare of the region it
   lies under plus 60 a floor down; the island is the Farms' fare plus 1500 for the crossing, its grotto 60 a floor more.
   (A place not in the list used to come out at -60 gold: no fare is ever below 0 now.) The keep and the arena are
   reached through their own people in Hearthvale, so Tobin's floors tab leaves them out. */
function warpFare(id){const i=ZONE_ORDER.indexOf(id);if(i>=0)return i*60;const D=ZONES[id];if(!D)return -1;
  if(id==='isles')return Math.max(0,ZONE_ORDER.indexOf('farms'))*60+1500;
  const B=typeof WORLD_BRANCH!=='undefined'?WORLD_BRANCH:{},par=Object.keys(B).find(k=>B[k].includes(id));if(!par)return -1;
  const base=warpFare(par);return base<0?-1:base+60*(D.dungeon||1);}
{const _wchF=warpCardsHtml;warpCardsHtml=function(){let h=_wchF.apply(this,arguments);
  const gs=wsfGroups().filter(([t])=>t!=='Other places');if(!gs.length){WSF.tview='world';return h;}
  const n=gs.reduce((a,[,ids])=>a+ids.filter(id=>P.visited.includes(id)).length,0),v=WSF.tview==='floors'?'floors':'world';
  const tabs=wsfToggle(v,'wstview',n);
  const a=h.indexOf('<div class="wsmwrap">'),b=h.indexOf('</div><div class="wsdcol">');if(a<0||b<0)return h;
  if(v!=='floors')return h.slice(0,a)+tabs+h.slice(a);
  const all=gs.flatMap(([,ids])=>ids);if(!WSF.tsel||!all.includes(WSF.tsel))WSF.tsel=all.find(id=>P.visited.includes(id)&&id!==zoneId)||all[0];
  const keepSel=WSF.sel;WSF.sel=WSF.tsel;const map=`<div class="wsfmap">`+gs.map(([t,ids])=>`<div class="wfg"><div class="wfgt">${esc(t)}</div><div class="wfrow">${ids.map((id,i)=>(i?'<span class="wfa" aria-hidden="true">▸</span>':'')+wsfTile(id).replace('data-act="wsfsel"','data-act="wstsel"')).join('')}</div></div>`).join('')+`</div>`;WSF.sel=keepSel;
  h=h.slice(0,a)+tabs+map+h.slice(b);
  return h.replace(/<div id="wsDet">[\s\S]*<\/div><\/div><\/div>$/,`<div id="wsDet">${wstDetail(WSF.tsel)}</div></div></div>`);};}
function wstDetail(id){const D=ZONES[id];if(!D)return '';const known=P.visited.includes(id),here=zoneId===id,cost=warpFare(id),poor=P.gold<cost;
  const btn=here?'<div class="tclock">📍 You are here</div>':!known?'<div class="tclock">🔒 Walk there once to unlock</div>':
    `<button class="btn tctravel${poor?'':' primary'}" data-act="warp" data-arg="${id}" ${poor?'disabled':''}>${poor?`Need ${fmt(cost)} gold`:`Travel · ${fmt(cost)} gold`}</button>`;
  const par=Object.keys(typeof WORLD_BRANCH!=='undefined'?WORLD_BRANCH:{}).find(k=>WORLD_BRANCH[k].includes(id));
  const x=`<div class="wsmwhere">${par?`▼ Down the stairs in ${esc(ZONES[par].name)}`:D.isle?'⛵ Across the sea, by boat from Willowmere Farms':''}</div>`;
  return tcCardHtml(id,[id],null,x).replace('class="tccard','class="tccard wsmcard').replace(/<button class="btn tctravel[^>]*>[^<]*<\/button>|<div class="tclock">[^<]*<\/div>/,btn);}
PANEL_ACTS.wstview=v=>{WSF.tview=v==='floors'?'floors':'world';sfx('click');refreshPanel();};
PANEL_ACTS.wstsel=id=>{if(!ZONES[id])return;WSF.tsel=id;sfx('click');refreshPanel();try{const d=panel.querySelector('#wsDet');if(d){const r=d.getBoundingClientRect();if(r.top>innerHeight-120)d.scrollIntoView({block:'nearest',behavior:'smooth'});}}catch(e){}};
/* ---- (v1.64.6) the World map window (M) gets the same ⇄ toggle: World map / Floors below ----
   The floors view shows the dungeon floors and the island as big squares grouped by where they are; a tap jumps to
   that place in the list underneath, as a square on the world map does. */
{const _wghF=worldGridHtml;worldGridHtml=function(){const h=_wghF.apply(this,arguments);if(typeof wsfGroups!=='function')return h;
  const gs=wsfGroups().filter(([t])=>t!=='Other places');if(!gs.length){WSF.mview='world';return h;}
  const n=gs.reduce((a,[,ids])=>a+ids.filter(id=>P.visited.includes(id)).length,0),v=WSF.mview==='floors'?'floors':'world',tog=wsfToggle(v,'wmview',n);
  if(v!=='floors')return tog+h;
  const keep=WSF.sel;WSF.sel=WSF.msel;const map=`<div class="wsfmap">`+gs.map(([t,ids])=>`<div class="wfg"><div class="wfgt">${esc(t)}</div><div class="wfrow">${ids.map((id,i)=>(i?'<span class="wfa" aria-hidden="true">▸</span>':'')+wsfTile(id).replace('data-act="wsfsel"','data-act="wmfsel"')).join('')}</div></div>`).join('')+`</div>`;WSF.sel=keep;
  return tog+map;};}
PANEL_ACTS.wmview=v=>{WSF.mview=v==='floors'?'floors':'world';sfx('click');refreshPanel();};
PANEL_ACTS.wmfsel=id=>{if(!ZONES[id])return;WSF.msel=id;for(const b of panel.querySelectorAll('.wft'))b.classList.toggle('sel',b.dataset.arg===id);PANEL_ACTS.wmgo(id);};
