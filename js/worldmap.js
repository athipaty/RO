"use strict";
/* ================= #37 bigger minimap and a world map ================= */
// ---- minimap: click it to switch between small and large (remembered) ----
const MINI_SIZES={small:[150,104],large:[260,180]};
let miniBig=(()=>{try{return localStorage.getItem('embervale.miniBig')==='1';}catch(e){return false;}})();
function setMiniBig(on){miniBig=!!on;try{localStorage.setItem('embervale.miniBig',miniBig?'1':'0');}catch(e){}
  const c=$('#mini'),[w,h]=MINI_SIZES[miniBig?'large':'small'];c.width=w;c.height=h;$('#minibox').classList.toggle('big',miniBig);
  c.title=miniBig?'Click for a smaller map · M for the world map':'Click for a bigger map · M for the world map';}
setMiniBig(miniBig);
$('#mini').addEventListener('click',ev=>{ev.stopPropagation();sfx('click');setMiniBig(!miniBig);});
// on the large minimap, name where each exit leads
function miniLabels(ox,oy,k){if(!miniBig||!Z)return;mctx.font='bold 9px system-ui,sans-serif';mctx.textBaseline='middle';
  for(const pt of Z.portals){const D=ZONES[pt.to];if(!D)continue;const nm=pt.side==='down'?'▼ '+D.name:D.name;
    const x=ox+pt.x*k,y=oy+pt.y*k,tw=mctx.measureText(nm).width;let tx=pt.side==='east'?x-6-tw:x+6;tx=clamp(tx,2,mctx.canvas.width-tw-2);
    mctx.fillStyle='rgba(0,0,0,.6)';mctx.fillRect(tx-2,y-6,tw+4,12);mctx.fillStyle='#8ff0ff';mctx.fillText(nm,tx,y);}}

// ---- world map window (M) ----
const WORLD_ROAD=['town','meadow','woods','dunes','crypt','frost'],WORLD_BRANCH={woods:['deep1','deep2','deep3']};
function zonePeople(id){const out=[];for(const [peer,o] of NET.others)if(o.z===id&&!o.dead)out.push({n:o.n,party:inParty(peer)});return out;}
function worldNode(id,sub){const D=ZONES[id],here=zoneId===id,seen=P.visited.includes(id)||here,th=THEMES[D.theme]||THEMES.meadow;
  const ppl=zonePeople(id),pals=ppl.filter(p=>p.party),boss=NET.wb&&NET.wb.z===id&&NET.wb.until>Date.now()?MOBS[NET.wb.b]:null;
  const mobsTxt=seen?[...new Set((D.mobs||[]).filter(m=>!m[2]).map(m=>MOBS[m[0]].name))].join(', '):'';
  return `<div class="wnode${here?' here':''}${seen?'':' unseen'}${sub?' sub':''}" data-zone="${id}">`+
    `<span class="wsw" style="background:${(th.g||['#555'])[0]}"></span><div class="grow"><div class="nm">${D.name}${here?' <span class="where">You are here</span>':''}</div>`+
    `<div class="ds">${D.lvl}${seen?'':' · not visited yet'}${D.safe?'':''}</div>`+
    (mobsTxt?`<div class="ds wmobs">${mobsTxt}</div>`:'')+
    (boss?`<div class="ds" style="color:#ff9a7a">World boss: ${MOBS[NET.wb.b].name}</div>`:'')+
    (pals.length?`<div class="ds" style="color:#8fe0a8">Party: ${pals.map(p=>esc(p.n)).join(', ')}</div>`:'')+
    `</div>${ppl.length?`<span class="wppl" title="${ppl.length} player${ppl.length>1?'s':''} here">${ppl.length} ☺</span>`:''}</div>`;}
PANELS.worldmap=()=>{let h=`<h2>World map</h2><div class="sub">The road east from Hearthvale. Tobin at the Waystation sends you to any region you have visited.</div><div class="wroad">`;
  WORLD_ROAD.forEach((id,i)=>{if(i)h+=`<div class="wlink" aria-hidden="true">│</div>`;h+=worldNode(id);
    if(WORLD_BRANCH[id])h+=`<div class="wbranch"><div class="ds wbl">▼ Stairs down in ${ZONES[id].name}</div>${WORLD_BRANCH[id].map(z=>worldNode(z,true)).join('')}</div>`;});
  return h+`</div>`;};
