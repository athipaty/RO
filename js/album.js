"use strict";
/* ================= Stage 8 #79: the sigil album =================
   Every monster sigil you have ever held (bag, storage, cart, socketed; a Radiant one counts for its monster) is
   recorded in P.album. Completing a region's page gives a small permanent bonus; all six pages add +1 to every
   stat. Open from Librarian Oren's Codex (Sigil album button) or /album. */
const ALBUM=[
  {id:'meadow',name:'Greenmoss Meadow',zones:['meadow'],b:{maxhp:60}},
  {id:'woods',name:'Whispering Woods',zones:['woods'],b:{agi:2}},
  {id:'deep',name:'Mossdeep Caverns',zones:['deep1','deep2','deep3'],b:{sppct:3,spregen:1}},
  {id:'dunes',name:'Ashen Dunes',zones:['dunes'],b:{aspd:2}},
  {id:'crypt',name:'Cinder Crypt',zones:['crypt'],b:{critdmg:5}},
  {id:'frost',name:'Frostpeak Pass',zones:['frost'],b:{dmgred:2}}];
const ALBUM_ALL={str:1,agi:1,vit:1,int:1,dex:1,luk:1};
const albumMobs=pg=>[...new Set(pg.zones.flatMap(z=>(ZONES[z]&&ZONES[z].mobs||[]).map(m=>m[0])))].filter(id=>MOBS[id]&&MOBS[id].sig&&ITEMS[id+'_sig']);
const sigBase=id=>{const it=ITEMS[id];if(!it||it.type!=='sigil')return null;return (it.base||id).replace(/_sig$/,'');};
function albumAdd(id,quiet){const m=sigBase(id);if(!m||!P)return;if(!P.album||typeof P.album!=='object')P.album={};if(P.album[m])return;P.album[m]=1;
  const pg=ALBUM.find(p=>albumMobs(p).includes(m));if(!pg||quiet)return;const mobs=albumMobs(pg),have=mobs.filter(x=>P.album[x]).length;
  addLog(`Sigil album: ${MOBS[m].name} added (${pg.name} ${have}/${mobs.length}).`,'l-good');
  if(have===mobs.length){sfx('fanfare');fx.push({k:'lvpillar',o:P,x:P.x,y:P.y,t0:now,dur:2});addLog(`${pg.name} page complete! For good: ${albumBonusText(pg.b)}.`,'l-rare');if(albumDone()===ALBUM.length)addLog('Every page of the sigil album is complete: +1 to every stat.','l-rare');S=computeStats();}}
const albumComplete=pg=>{const mobs=albumMobs(pg);return mobs.length>0&&mobs.every(x=>P.album&&P.album[x]);};
const albumDone=()=>ALBUM.filter(albumComplete).length;
const albumBonusText=b=>Object.entries(b).map(([k,v])=>(typeof bonusLabel==='function'&&bonusLabel(k,v))||`${k==='maxhp'?'Max HP':k.toUpperCase()} +${v}`).join(', ');
// everything you already hold counts (old saves, shared storage, the cart, socketed gear)
function albumScan(){if(!P)return;const all=[...(P.inv||[]),...(P.storage||[]),...(Array.isArray(P.cart)?P.cart:[]),...Object.values(P.eq||{}).filter(Boolean)];
  for(const e of all){if(!e)continue;albumAdd(e.id,true);if(Array.isArray(e.s))for(const s of e.s)if(s)albumAdd(s,true);}}
// new sigils as they reach your bag
{const _giA=giveItem;giveItem=function(id){const r=_giA.apply(this,arguments);try{if(ITEMS[id]&&ITEMS[id].type==='sigil')albumAdd(id);}catch(e){}return r;};}
{const _swA=startWith;startWith=function(){const r=_swA.apply(this,arguments);try{albumScan();S=computeStats();}catch(e){}return r;};}
// pickups that go straight into the bag without giveItem: check the bag a few times a minute
setInterval(()=>{try{if(running&&P)for(const e of P.inv)if(ITEMS[e.id]&&ITEMS[e.id].type==='sigil')albumAdd(e.id);}catch(e){}},4000);
PASSIVE_MORE.push(add=>{if(!P||!P.album)return;let n=0;for(const pg of ALBUM)if(albumComplete(pg)){n++;for(const k in pg.b)add(k,pg.b[k]);}if(n===ALBUM.length)for(const k in ALBUM_ALL)add(k,ALBUM_ALL[k]);});

PANELS.album=()=>{let h=`<h2>Sigil album</h2><div class="sub">Every sigil you have held is kept here. Fill a region's page for a bonus that lasts for good; fill all ${ALBUM.length} for +1 to every stat. Pages done: <b>${albumDone()}/${ALBUM.length}</b></div>`;
  for(const pg of ALBUM){const mobs=albumMobs(pg),have=mobs.filter(x=>P.album&&P.album[x]).length,done=have===mobs.length;
    h+=`<div class="albpage${done?' done':''}"><div class="albhead"><div class="grow"><div class="nm">${esc(pg.name)} <span class="muted">${have}/${mobs.length}</span></div><div class="ds">${done?'✓ ':''}Bonus: ${esc(albumBonusText(pg.b))}</div></div></div><div class="albgrid">`+
      mobs.map(m=>{const got=P.album&&P.album[m];return `<div class="albcell${got?' got':''}" title="${esc(MOBS[m].name)}">${got?icon({id:m+'_sig'}):'<span class="albq">?</span>'}<span>${esc(MOBS[m].name)}</span></div>`;}).join('')+`</div></div>`;}
  h+=`<div class="ds">All pages: ${esc(albumBonusText(ALBUM_ALL))}</div>`;return h;};
{const _rpAl=refreshPanel;refreshPanel=function(){const r=_rpAl.apply(this,arguments);try{if(panelKind==='library'&&P&&!panel.querySelector('.albbtn')){const t=panel.querySelector('.cxtabs');
  if(t)t.insertAdjacentHTML('afterend',`<div class="tbtns albbtn" style="justify-content:flex-start;margin:4px 0"><button class="btn small" data-act="openalbum">📔 Sigil album <span class="muted">${albumDone()}/${ALBUM.length}</span></button></div>`);}}catch(e){}return r;};}
PANEL_ACTS.openalbum=()=>openPanel('album');
if(typeof chatCommand==='function'){const _ccAl=chatCommand;chatCommand=function(k,arg){if(k==='album'){openPanel('album');return true;}return _ccAl.apply(this,arguments);};}
