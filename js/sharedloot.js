"use strict";
/* ================= see other players' drops =================
   Loot is personal: each player's drops live only in their own game. So each player also sends what is
   lying on the ground for them (in their presence, field gl), and everyone else in the region draws it,
   slightly faded and marked with the owner's name. Only the owner can pick it up; it vanishes for
   everyone when they do (or when it expires). */
const GL_MAX=20;
// what we send: [uid, item id ('' for gold), gold, x, y, fall-from x, fall-from y]
function myGroundLoot(){const out=[];for(const l of loot){if(now<l.t0)continue;out.push([l.uid,l.gold?'':l.id,l.gold||0,Math.round(l.x),Math.round(l.y),Math.round(l.fx),Math.round(l.fy)]);if(out.length>=GL_MAX)break;}return out;}
function readGroundLoot(a){if(!Array.isArray(a))return [];const out=[];
  for(const e of a.slice(0,GL_MAX)){if(!Array.isArray(e))continue;const uid=fin(e[0]),id=typeof e[1]==='string'?e[1]:'',gold=clamp(Math.floor(fin(e[2])),0,1e7);
    if(!(uid>0)||(id&&!ITEMS[id])||(!id&&!gold))continue;
    out.push({uid,id:id||null,gold,x:clamp(fin(e[3]),0,4000),y:clamp(fin(e[4]),0,4000),fx:clamp(fin(e[5]),0,4000),fy:clamp(fin(e[6]),0,4000)});}
  return out;}
// the loot of another player, as ground items we can draw (cached per player; new ones fall from the monster)
function ghostLoot(o){
  if(o.glZone!==zoneId||o.glZ!==o.z){o.glMap=new Map();o.glZone=zoneId;o.glZ=o.z;o.glFresh=true;}
  const list=o.gl||[],seen=new Set();
  for(const e of list){seen.add(e.uid);let l=o.glMap.get(e.uid);
    if(!l){l={id:e.id,gold:e.gold,x:e.x,y:e.y,fx:e.fx,fy:e.fy,uid:e.uid*7+3,rare:!!(e.id&&(ITEMS[e.id].type==='sigil'||rarityOf(e.id)>=2)),t0:o.glFresh?now-1:now,ghost:true,owner:o.n};o.glMap.set(e.uid,l);}
    l.exp=now+60;}
  for(const k of [...o.glMap.keys()])if(!seen.has(k))o.glMap.delete(k);
  o.glFresh=false;return [...o.glMap.values()];}
// another player's item under the pointer (for its label, and to explain it is not ours)
function ghostAt(sc){let best=null,bd=1e9;const pad=touchPick?26:15;
  for(const o of NET.others.values()){if(o.z!==zoneId||!o.glMap)continue;for(const l of o.glMap.values()){const q=proj(l.x,l.y),d=Math.hypot(q.x-sc.x,q.y-6-sc.y);if(d<pad&&d<bd){bd=d;best=l;}}}
  return best;}
let ghostHintT=0;function ghostHint(l){if(now<ghostHintT)return;ghostHintT=now+1.5;floatT(P.x,P.y-44,`That is ${l.owner}'s loot`,'#aab4c4',12);}
