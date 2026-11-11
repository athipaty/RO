"use strict";
/* ================= #35 more teleport items: Waystone Shard and Kinship Charm ================= */
// Waystone Shard: travel to any region you have visited (dungeon floors too)
function waystoneZones(){return Object.keys(ZONES).filter(id=>id!==zoneId&&P.visited.includes(id));}
PANELS.waystone=()=>{const ids=waystoneZones();let h=`<h2>Waystone Shard</h2><div class="sub">Hold the shard and picture the place. It crumbles once it carries you.</div>`;
  if(!ids.length)return h+`<p class="muted">You have not been anywhere else yet.</p>`;
  for(const id of ids){const D=ZONES[id];h+=`<div class="row"><div class="grow"><div class="nm">${D.name}</div><div class="ds">${D.lvl}</div></div><button class="btn small" data-act="waygo" data-arg="${id}">Go</button></div>`;}
  return h;};
PANEL_ACTS.waygo=id=>{if(!ZONES[id]||!P.visited.includes(id)||P.dead||!invFind('waystone'))return;
  takeItem('waystone');closePanel();teleportFx();enterZone(id);addLog(`The Waystone Shard crumbles and carries you to ${ZONES[id].name}.`);save();};

// Kinship Charm: jump to a party member, wherever they are
function kinTargets(){const out=[];if(!SOC.party)return out;
  for(const [peer,o] of NET.others)if(inParty(peer)&&!o.dead&&ZONES[o.z])out.push({peer,o});return out;}
PANELS.kinship=()=>{const ts=kinTargets();let h=`<h2>Kinship Charm</h2><div class="sub">Think of a friend and the charm pulls you to their side.</div>`;
  if(!ts.length)return h+`<p class="muted">No party members are online.</p>`;
  for(const {peer,o} of ts)h+=`<div class="row"><div class="grow"><div class="nm">${esc(o.n)}</div><div class="ds">${CLASSES[o.cls].name} Lv ${o.lv} · ${ZONES[o.z].name}</div></div><button class="btn small" data-act="kingo" data-arg="${esc(peer)}">Go</button></div>`;
  return h;};
PANEL_ACTS.kingo=peer=>{const o=NET.others.get(peer);if(!o||!inParty(peer)||o.dead||!ZONES[o.z]||P.dead||!invFind('kinship'))return;
  takeItem('kinship');closePanel();teleportFx();if(o.z!==zoneId)enterZone(o.z);
  // land on a free tile next to them
  const tx=Math.floor(o.x/TILE),ty=Math.floor(o.y/TILE);let best=null;
  for(let r=1;r<4&&!best;r++)for(let dy=-r;dy<=r&&!best;dy++)for(let dx=-r;dx<=r;dx++){const x=tx+dx,y=ty+dy,j=y*Z.w+x;
    if(x>0&&y>0&&x<Z.w-1&&y<Z.h-1&&!BLOCK[Z.t[j]]&&Z.reach[j]){best={x:(x+.5)*TILE,y:(y+.5)*TILE};break;}}
  if(best){P.x=best.x;P.y=best.y;}P.path=[];P.target=null;P.portalLock=now+.6;
  fx.push({k:'ring',x:P.x,y:P.y,r:36,col:'#8fe0a8',t0:now,dur:.6});addLog(`The Kinship Charm pulls you to ${o.n}.`,'l-good');save();};

function teleportFx(){sfx('portal');}
// called from useItem: returns true when it handled the item
function useTravelItem(id){const it=ITEMS[id];
  if(it.pick){openPanel('waystone');return true;}
  if(it.kin){if(!SOC.party){addLog('The Kinship Charm needs a party. Invite a friend first (/invite Name).','l-bad');return true;}
    const ts=kinTargets();if(!ts.length){addLog('No party members are online to travel to.','l-bad');return true;}
    openPanel('kinship');return true;}
  return false;}
