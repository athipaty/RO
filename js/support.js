"use strict";
/* ================= #29 support skills reach party members ================= */
// Heals and buffs also land on party members standing nearby. They travel inside the caster's
// presence update (addressed to each member), so no server change is needed.
const SUP={
  mend:{r:220,amt:l=>20*l+S.matk*(1+l*.4),apply:(l,v)=>{healP(v);cureAll(true);}},
  sanctuary:{r:260,amt:l=>40*l+S.matk*(1.5+l*.5),apply:(l,v)=>{healP(v);cureAll(true);buff('sanctuary','Sanctuary',30,{regen:l*6});}},
  blessing:{r:300,apply:l=>buff('blessing','Blessing',120,{str:l,int:l,dex:l})},
  divinegrace:{r:300,apply:l=>buff('divinegrace','Divine Grace',120,{int:l*2,maxsp:l*25,matk:l*5})},
  holyaegis:{r:260,apply:l=>buff('holyaegis','Holy Aegis',90,{def:l*6,vit:l*2,regen:l*3})},
  warcry:{r:260,apply:l=>buff('warcry','War Cry',30,{atk:l*5})},
  swiftstep:{r:260,apply:l=>buff('swiftstep','Swift Step',90,{agi:l*2,flee:l*3})},
};
NET.sp=[];NET.spId=0;
for(const id in SUP){const sk=SKILLS[id];if(!sk)continue;const run=sk.run,desc=sk.desc,r=SUP[id].r;
  sk.run=(l,...a)=>{run(l,...a);supportCast(id,l);};
  sk.desc=l=>desc(l)+` Party members within ${r}px get it too.`;sk.party=true;}
function supportCast(id,l){if(typeof partyMatesHere!=='function')return;const s=SUP[id];
  const mates=partyMatesHere().filter(o=>o.id&&Math.hypot(o.rx-P.x,o.ry-P.y)<=s.r);if(!mates.length)return;
  const v=s.amt?Math.round(clamp(s.amt(l),1,50000)):0;
  NET.sp=[...NET.sp,...mates.map(o=>({i:++NET.spId,to:o.id,k:id,l,v}))].slice(-12);NET.lastSent='';NET.sendT=0;
  for(const o of mates){fx.push({k:s.amt?'heal':'ring',x:o.rx,y:o.ry,r:34,col:SKILLS[id].col,t0:now,dur:.6});if(s.amt)floatT(o.rx,o.ry-30,'+'+fmt(v),'#7fd38a',14);}
  addLog(`${SKILLS[id].name} also reached ${mates.map(o=>o.n).join(', ')}.`,'l-good');}
// called for every presence update from another player
function supportRecv(o,arr,fresh){if(!Array.isArray(arr))return;
  for(const e of arr.slice(-12)){if(!e||typeof e!=='object')continue;const i=fin(e.i);if(i<=(o.spSeen||0))continue;o.spSeen=i;
    if(fresh||e.to!==NET.myId)continue; // old news when we first see them, or meant for someone else
    const s=SUP[e.k];if(!s||!P||P.dead||!inParty(o.peer)||o.z!==zoneId)continue;
    if(Math.hypot(o.x-P.x,o.y-P.y)>s.r+150)continue;
    const l=clamp(fin(e.l)|0,1,10),v=clamp(Math.round(fin(e.v)),0,50000);
    s.apply(l,v);if(P.buffs[e.k])P.buffs[e.k].from=o.n;floatT(P.x,P.y-62,SKILLS[e.k].name,'#f0e0a0',12);addLog(`${o.n} cast ${SKILLS[e.k].name} on you.`,'l-good');}}
