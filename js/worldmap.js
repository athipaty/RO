"use strict";
/* ================= #37 bigger minimap and a world map ================= */
// ---- minimap: click it to switch between small and large (remembered) ----
const MINI_SIZES={small:[170,104],large:[280,170]};
let miniBig=(()=>{try{return localStorage.getItem('embervale.miniBig')==='1';}catch(e){return false;}})();
function setMiniBig(on){miniBig=!!on;try{localStorage.setItem('embervale.miniBig',miniBig?'1':'0');}catch(e){}
  const c=$('#mini'),[w,h]=MINI_SIZES[miniBig?'large':'small'];c.width=w;c.height=h;$('#minibox').classList.toggle('big',miniBig);
  c.title='Tap to walk there · M for the world map';const b=$('#miniSize');if(b){b.textContent=miniBig?'⤡':'⤢';b.setAttribute('aria-label',miniBig?'Smaller minimap':'Bigger minimap');}}
setMiniBig(miniBig);
// tap the minimap to walk there; the ⤢ button in its corner switches between small and large
$('#mini').addEventListener('click',ev=>{ev.stopPropagation();if(!P||!running||P.dead||!Z)return;const c=$('#mini'),r=c.getBoundingClientRect();
  const cx=(ev.clientX-r.left)*c.width/r.width,cy=(ev.clientY-r.top)*c.height/r.height,u=(cx-MINI.ox)/MINI.s/ISO,v=(cy-MINI.oy)/MINI.s/(ISO/2);
  const x=(u+v)/2,y=(v-u)/2;if(x<TILE||y<TILE||x>(Z.w-1)*TILE||y>(Z.h-1)*TILE)return;
  if(typeof npcBusy==='function'&&npcBusy()){busyHint();return;}
  sfx('click');P.target=null;P.queued=null;P.npcGoal=null;P.sitting=false;MINI.goal={x,y,t:now};clickMark={x,y,t:now};pathTo(x,y,true);});
// on the large minimap, name where each exit leads
function miniLabels(){if(!miniBig||!Z)return;mctx.font='bold 9px system-ui,sans-serif';mctx.textBaseline='middle';
  for(const pt of Z.portals){const D=ZONES[pt.to];if(!D)continue;const nm=pt.side==='down'?'▼ '+D.name:D.name;const p=miniPt(pt.x,pt.y),tw=mctx.measureText(nm).width;
    const tx=clamp(p.x-tw/2,2,mctx.canvas.width-tw-2),ty=clamp(p.y-9,6,mctx.canvas.height-6);mctx.fillStyle='rgba(0,0,0,.6)';mctx.fillRect(tx-2,ty-6,tw+4,12);mctx.fillStyle='#8ff0ff';mctx.fillText(nm,tx,ty);}}

// ---- world map window (M) ----
// v1.47.0 the world is a grid around the city (WORLD_GRID in regions4.js): a little map of squares on top (tap one to
// jump to its card), then every region as a card, road by road, from the city outward; dungeon floors hang under theirs
const WORLD_ROAD=typeof WORLD_GRID!=='undefined'?Object.keys(WORLD_GRID):['town','meadow','woods','dunes','crypt','frost','fen'],WORLD_BRANCH={woods:['deep1','deep2','deep3']};
const WORLD_ARMS=[['north','North road','cold hills and mountains'],['east','East road','fields, woods and wilds'],['south','South road','farms, desert and sea'],['west','West road','past Aurelmark']];
function zonePeople(id){const out=[];for(const [peer,o] of NET.others)if(o.z===id&&!o.dead)out.push({n:o.n,party:inParty(peer)});return out;}
function worldNode(id,sub){const D=ZONES[id],here=zoneId===id,seen=P.visited.includes(id)||here,th=THEMES[D.theme]||THEMES.meadow;
  const ppl=zonePeople(id),pals=ppl.filter(p=>p.party),boss=NET.wb&&NET.wb.z===id&&NET.wb.until>Date.now()?MOBS[NET.wb.b]:null;
  const mobsTxt=seen?[...new Set((D.mobs||[]).filter(m=>!m[2]).map(m=>MOBS[m[0]].name))].join(', '):'';
  return `<div class="wnode${here?' here':''}${seen?'':' unseen'}${sub?' sub':''}" data-zone="${id}">`+
    `<span class="wsw" style="background:${(th.g||['#555'])[0]}"></span><div class="grow"><div class="nm">${D.name}${here?' <span class="where">You are here</span>':''}</div>`+
    `<div class="ds">${D.lvl}${seen?'':' · not visited yet'}</div>`+
    (mobsTxt?`<div class="ds wmobs">${mobsTxt}</div>`:'')+
    (boss?`<div class="ds" style="color:#ff9a7a">World boss: ${MOBS[NET.wb.b].name}</div>`:'')+
    (pals.length?`<div class="ds" style="color:#8fe0a8">Party: ${pals.map(p=>esc(p.n)).join(', ')}</div>`:'')+
    `</div>${ppl.length?`<span class="wppl" title="${ppl.length} player${ppl.length>1?'s':''} here">${ppl.length} ☺</span>`:''}</div>`;}
function worldArm(dir){const out=[];if(typeof WORLD_GRID==='undefined')return out;const step={north:[0,-1],east:[1,0],south:[0,1],west:[-1,0]}[dir];
  let p=dir==='west'?[-1,0]:[0,0];for(;;){p=[p[0]+step[0],p[1]+step[1]];const id=Object.keys(WORLD_GRID).find(k=>WORLD_GRID[k][0]===p[0]&&WORLD_GRID[k][1]===p[1]);if(!id||!ZONES[id])break;out.push(id);}return out;}
function worldLowLv(id){const L=(ZONES[id].mobs||[]).map(([m])=>MOBS[m]).filter(m=>m&&!m.boss&&!m.world).map(m=>m.lv);return L.length?Math.min(...L):null;}
function worldGridHtml(){if(typeof WORLD_GRID==='undefined')return '';const ids=Object.keys(WORLD_GRID).filter(id=>ZONES[id]),xs=ids.map(id=>WORLD_GRID[id][0]),ys=ids.map(id=>WORLD_GRID[id][1]);
  const x0=Math.min(...xs),x1=Math.max(...xs),y0=Math.min(...ys),y1=Math.max(...ys),at={};for(const id of ids)at[WORLD_GRID[id].join()]=id;
  let h=`<div class="wgrid" style="grid-template-columns:repeat(${x1-x0+1},minmax(0,1fr))" role="group" aria-label="World map">`;
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const id=at[x+','+y];if(!id){h+=`<span class="wc empty"></span>`;continue;}
    const D=ZONES[id],th=THEMES[D.theme]||THEMES.meadow,here=zoneId===id,seen=P.visited.includes(id)||here,city=!!D.safe,lv=worldLowLv(id),L=D.links||{};
    const under=WORLD_BRANCH[id]?'<i class="wdn">▼</i>':'',boss=NET.wb&&NET.wb.z===id&&NET.wb.until>Date.now()?'<i class="wwb">👑</i>':'',pals=zonePeople(id).some(p=>p.party)?'<i class="wpal">☺</i>':'';
    h+=`<button class="wc${here?' here':''}${seen?'':' unseen'}${city?' city':''}${L.east?' le':''}${L.south?' ls':''}" data-act="wmgo" data-arg="${id}" style="background:${(th.g||['#555'])[0]}" title="${esc(D.name)} · ${esc(D.lvl)}" aria-label="${esc(D.name)}, ${esc(D.lvl)}">`+
      `<b>${city?(id==='capital'?'♛':'⌂'):lv}</b>${under}${boss}${pals}</button>`;}
  return h+`</div><div class="wkey ds">⌂ Hearthvale · ♛ Aurelmark · numbers are the lowest monster level · ▼ dungeon below · tap a square</div>`;}
PANELS.worldmap=()=>{let h=`<h2>World map</h2><div class="sub">Hearthvale and the capital Aurelmark stand in the middle of the world. Four roads lead out, and the farther you go, the stronger the monsters. Tobin at the Waystation sends you to any region you have visited.</div>`;
  h+=worldGridHtml()+`<div class="wroad">`;
  h+=`<h3 class="warm">The city</h3>`+worldNode('town')+(ZONES.capital?worldNode('capital'):'');
  for(const [dir,name,sub] of WORLD_ARMS){const arm=worldArm(dir);if(!arm.length)continue;h+=`<h3 class="warm">${name} <span class="ds">${sub}</span></h3>`;
    arm.forEach((id,i)=>{if(i)h+=`<div class="wlink" aria-hidden="true">│</div>`;h+=worldNode(id);
      if(WORLD_BRANCH[id])h+=`<div class="wbranch"><div class="ds wbl">▼ Stairs down in ${ZONES[id].name}</div>${WORLD_BRANCH[id].filter(z=>ZONES[z]).map(z=>worldNode(z,true)).join('')}</div>`;});}
  return h+`</div>`;};
PANEL_ACTS.wmgo=id=>{const n=panel.querySelector(`.wnode[data-zone="${id}"]`);if(!n)return;sfx('click');for(const o of panel.querySelectorAll('.wnode.pick'))o.classList.remove('pick');n.classList.add('pick');
  if(n.scrollIntoView)n.scrollIntoView({block:'center',behavior:'smooth'});};
