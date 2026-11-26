"use strict";
/* ================= the Tidewater Isle: the boat, wind weapons and the rest (v1.64.0, see js/isles.js) ================= */
const ISLE_MIN_LV=38;
// ---- weapons with an element: a plain attack (no element of its own) hits with the weapon's element ----
// the weapon's own element (the Gale weapons), or a socketed sigil that carries one (the Wind Sigil)
function weaponEl(){if(!P||!P.eq||!P.eq.weapon)return null;const e=P.eq.weapon,it=ITEMS[e.id];if(it&&it.el)return it.el;
  for(const s of e.s||[])if(s&&ITEMS[s]&&ITEMS[s].el)return ITEMS[s].el;return null;}
{const _dpEl=dealPhys;dealPhys=function(m,mult,o){o=o||{};if(!o.el){const el=weaponEl();if(el)o={...o,el};}return _dpEl.call(this,m,mult,o);};}
// gear lines say the element first ("Wind · ATK 150 · ...")
{const _idEl=itemDesc;itemDesc=function(e){const d=_idEl.apply(this,arguments),it=e&&ITEMS[e.id];
  return it&&it.type==='weapon'&&it.el&&typeof ELEM!=='undefined'&&ELEM[it.el]?`${ELEM[it.el].name} · ${d}`:d;};}
// ---- the Gale weapons are forged at Brannoc's anvil like the rest ----
if(typeof FORGES!=='undefined'){for(const [id,,,,,,,,mats,gold] of GALE)if(!FORGES.some(f=>f[0]===id))FORGES.push([id,1,mats,gold]);
  FORGES.sort((a,b)=>((ITEMS[a[0]]||{}).lv||0)-((ITEMS[b[0]]||{}).lv||0));}
// ---- the boat: a pier on the Willowmere river and a landing on the island ----
// the reachable ground nearest a spot (a monster spawn tile is always reachable from the gate)
function islePier(z,tx,ty){let best=null,bd=1e9;for(const i of z.spawnTiles||[]){const x=i%z.w,y=(i/z.w)|0,d=(x-tx)**2+(y-ty)**2;if(d<bd){bd=d;best=[x,y];}}
  return best?{x:(best[0]+.5)*TILE,y:(best[1]+.5)*TILE}:{x:z.spawn.x,y:z.spawn.y};}
{const _gzIs=getZone;getZone=function(id){const z=_gzIs.apply(this,arguments);try{
    if(id==='farms'&&!z._pier){z._pier=1;const s=z.spawn,p=islePier(z,Math.floor(s.x/TILE)-6,Math.floor(s.y/TILE)+14);z.portals.push({x:p.x,y:p.y,to:'isles',side:'down',boat:1});}
    if(id==='isles'&&!z._pier){z._pier=1;const s=z.spawn,p=islePier(z,Math.floor(s.x/TILE)+2,Math.floor(s.y/TILE));z.portals.push({x:p.x,y:p.y,to:'farms',side:'down',boat:1});z.spawn={x:p.x+2.6*TILE,y:p.y};}
  }catch(e){}return z;};}
{const _ezIs=enterZone;enterZone=function(id,from){
    if(id==='isles'&&from==='farms'&&P&&P.lv<ISLE_MIN_LV){P.portalLock=now+2.5;P.y-=2.2*TILE;P.path=[];
      addLog(`Captain Marlo: "The open sea is no place for a beginner. Come back when you are level ${ISLE_MIN_LV}."`,'l-bad');return;}
    const r=_ezIs.apply(this,arguments);
    if(id==='isles'&&from==='farms'){addLog('You sail down the river and out to sea. After a day and a night, the Tidewater Isle rises from the waves. Everything here is water: wind cuts it best.','l-rare');}
    if(id==='farms'&&from==='isles')addLog('The boat brings you back up the river to Willowmere Farms.');
    return r;};}
// ---- the world map: the island has its own place, across the sea ----
if(typeof WORLD_ROADS!=='undefined')WORLD_ROADS.sea=['isles'];
if(typeof WORLD_ARMS!=='undefined'&&!WORLD_ARMS.some(a=>a[0]==='sea'))WORLD_ARMS.push(['sea','Across the sea','by boat from Willowmere Farms, Lv 38 and up']);
if(typeof WORLD_BRANCH!=='undefined')WORLD_BRANCH.isles=['grotto1','grotto2','grotto3'];
// ---- the bosses' own skills ----
if(typeof BOSS_SIG!=='undefined'){const around=(rng,x,y,r)=>{const a=rng()*6.283,d=r*(.4+.6*rng());return [x+Math.cos(a)*d,y+Math.sin(a)*d*.6];};
  Object.assign(BOSS_SIG,{
    reefmatriarch:{name:'Riptide',desc:'the tide rushes in round her and drags everyone in it, slowed',
      run:(m,x,y)=>bsZone(m,x,y,130,5,'#5ab8d8',m=>{bsHurt(m,.35);if(P){P.slowUntil=now+1.5;P.slowK=.5;}})},
    leviathan:{name:'Tidal Wave',desc:'a wall of water crashes down where you stand, and more around you',
      run:(m,x,y,rng)=>{bsMark(m,x,y,90,1.2,m=>{bsHurt(m,1.7);bsShove(m,120);});for(let i=0;i<3;i++){const [a,b]=around(rng,x,y,160);bsMark(m,a,b,70,1.6,m=>bsHurt(m,1.2));}}}});}
// ---- album, blurbs ----
if(typeof ALBUM!=='undefined'&&!ALBUM.some(a=>a.id==='isles'))ALBUM.push({id:'isles',name:'Tidewater Isle',zones:['isles','grotto1','grotto2','grotto3'],b:{agi:2,flee:6}});
if(typeof ZONE_BLURB!=='undefined')Object.assign(ZONE_BLURB,{isles:'An island far out at sea, reached only by boat. Everything here is water: bring wind.',
  grotto1:'Flooded caves under the island. Eels in the dark water.',grotto2:'Coral halls deeper down, where sirens sing.',grotto3:'The deepest grotto, where the Tide Leviathan sleeps.'});
if(typeof TH!=='undefined')Object.assign(TH,{'Across the sea':'ข้ามทะเล','by boat from Willowmere Farms, Lv 38 and up':'นั่งเรือจากไร่วิลโลว์เมียร์ เลเวล 38 ขึ้นไป','Wind':'ลม'});
// ---- each Gale weapon has its own look: pale sea-green, with a wind-glow ----
if(typeof WA!=='undefined')Object.assign(WA,{
  galesword:()=>waSword({w:3.5,len:23,blade:'#e8fff4',gcol:'#5ab89a',gem:'#a8ffe0',glow:'#a8ffe0',wrap:'#7ad8b8',pom:'#a8e8c8'}),
  galeaxe:()=>waAxe({head:'#d8f8ec',haft:'#3a6a5a',crack:'#a8ffe0',len:24}),
  galedirk:()=>waDagger({len:15,blade:'#e8fff4',gcol:'#5ab89a',grip:'#1e3a32',wrap:'#7ad8b8',pom:'#a8e8c8',glow:'#a8ffe0'}),
  galegun:()=>waGun({len:19,grip:'#2a4a40',body:'#5ab89a',barrel:'#d8f8ec',stock:'#3a6a5a'}),
  galemace:()=>waMace({head:'#c8f0e0',flange:'#7ad8b8',gem:'#a8ffe0',glow:'#a8ffe0'}),
  galewand:()=>waWand({len:22,shaft:'#d8f8ec',spiral:'rgba(120,230,190,.55)',band:'#3a8a6a',prong:'#a8ffe0',crystal:'#e8fff8',glow:'#a8ffe0',star:true})});
if(typeof WA_BOW!=='undefined')WA_BOW.galebowx={wood:'#bfe8d8',grip:'#3a6a5a',scale:1.1,tip:'#e8fff4',feather:'#a8ffe0'};
