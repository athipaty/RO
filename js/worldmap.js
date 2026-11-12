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
