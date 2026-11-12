"use strict";
/* ================= pictures in quests =================
   Every quest objective shows what to look for: the monster to defeat, the item to bring (and the monsters
   that drop it), and the face of the person to talk to. Used in the quest window, the quest log (J) and the
   pinned tracker in the status box. Pictures are drawn once and cached. */
const QPIC={};
function picCanvas(key,draw,w=44,h=44){if(QPIC[key])return QPIC[key];const c=document.createElement('canvas');c.width=w*2;c.height=h*2;const g=c.getContext('2d');g.scale(2,2);
  const main=ctx;ctx=g;try{draw(g);}catch(e){}finally{ctx=main;}return QPIC[key]=c.toDataURL();}
function mobPicURL(id){const d=MOBS[id];if(!d)return '';
  return picCanvas('m:'+id,()=>{const k=Math.min(1.5,18/Math.max(10,d.size));ctx.translate(22,38);ctx.scale(k,k);
    drawMob({d,x:0,y:0,face:1,ph:0,hp:d.hp,dead:false,hitF:-9,lunge:0,kbT:0,state:'idle',moving:false,slowUntil:0});});}
function npcPicURL(key){
  let n=QNPC[key]?{name:QNPC[key].name,col:QNPC[key].col,hair:QNPC[key].hair}:null;
  if(!n)for(const z of ['town','capital']){const Zc=typeof getZone==='function'?getZone(z):null;const f=Zc&&Zc.npcs.find(x=>NPC_KEY[x.name]===key);if(f){n=f;break;}}
  if(!n)return '';
  // just the head and shoulders
  return picCanvas('n:'+key,()=>{ctx.translate(22,52);ctx.scale(1.25,1.25);ctx.translate(-22,-52);drawHuman(22,62,n.col,n.hair,1,0,{look:{...lookFor(n.name),hair:n.hair}});});}
const qimg=(src,alt)=>src?`<img class="qpic" src="${src}" alt="${esc(alt||'')}" title="${esc(alt||'')}">`:'';
// monsters that drop an item (normal monsters first; at most two)
const dropSources=id=>Object.values(MOBS).filter(m=>(m.drops||[]).some(([d])=>d===id)).sort((a,b)=>(a.boss?1:0)-(b.boss?1:0)||a.lv-b.lv).slice(0,2);
function npcLine(key,verb){return `<span class="qo">${qimg(npcPicURL(key),npcName(key))}${verb} ${esc(npcName(key))}</span>`;}
// a whole objective line: check mark, picture, text, and where an item comes from
function objLineHTML(id,o,on){const mark=on?(objHave(id,o)>=objNeed(o)?'✓':'·'):'·';
  const text=on?objText(id,o):o.kill?`Defeat ${o.n} ${MOBS[o.kill].name}`:o.item?`Bring ${o.n} ${ITEMS[o.item].name}`:`Reach ${ZONES[o.visit].name}`;
  const pic=o.kill?qimg(mobPicURL(o.kill),MOBS[o.kill].name):o.item?qimg(itemIconURL(o.item),ITEMS[o.item].name):'';
  const src=o.item?dropSources(o.item):[];
  return `<span class="qo"><span class="qm">${mark}</span>${pic}<span>${esc(text)}${src.length?` <span class="qfrom">· from ${src.map(m=>qimg(mobPicURL(m.id),m.name)+esc(m.name)).join(', ')}</span>`:''}</span></span>`;}
