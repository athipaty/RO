"use strict";
/* ================= smooth player fights (duels, the arena, guild war) (v1.46.1) =================
   1. While you fight a player, your updates go out every 66 ms instead of 125 ms (net.js), so each of you sees the
      other move and hit sooner. Sends are timed on the real clock and kept at least 55 ms apart (the server drops
      anything past 20 a second).
   2. Your opponent's HP bar drops the moment you hit, instead of one round trip later. Their game still decides the
      real damage: the guess uses the max HP and DEF they share (presence mh / df), and fades into their real HP as
      their updates confirm it. A guess that is never confirmed (a miss on their side) is dropped after a moment. */
function pvpOn(){try{return !!((typeof DUEL!=='undefined'&&DUEL)||(typeof AR!=='undefined'&&AR.match&&!AR.match.out)||(typeof gwFighting==='function'&&gwFighting()));}catch(e){return false;}}

// the player behind a stand-in (duel, arena foe or guild war foe)
function pvpOther(m){if(!m)return null;const id=m.pid||(typeof DUEL!=='undefined'&&DUEL&&m===DUEL.ent?DUEL.id:null);return id&&typeof dlOther==='function'?dlOther(id):null;}
// what their game will take off for this hit, as a share of their HP (the same sum duel.js / arena.js / guildwar.js use)
function pvpGuess(m,dmg){const o=pvpOther(m);if(!o||!(o.mh>0))return 0;
  const cap=400+clamp(P&&P.lv||1,1,99)*150,d=clamp(Math.round(dmg-(o.df||0)*.6),1,cap);return d/o.mh*100;}

const _hurtMobPvp=hurtMob;
hurtMob=function(m,dmg,crit,kind){const before=NET.dlId,r=_hurtMobPvp.apply(this,arguments);
  // only count hits that were really sent to them (a multi-hit skill sends several in one frame)
  if(m&&m.pvp&&NET.dlId>before){const p=pvpGuess(m,dmg);if(p>0)(m.pvPend||(m.pvPend=[])).push({p,t:performance.now()});}
  return r;};

function pvpEnts(){const out=[];
  if(typeof DUEL!=='undefined'&&DUEL&&DUEL.ent)out.push(DUEL.ent);
  if(typeof AR!=='undefined'&&AR.match)for(const f of AR.match.foes||[])if(f.ent)out.push(f.ent);
  if(typeof GW!=='undefined'&&GW.ents)for(const e of GW.ents.values())out.push(e);
  if(typeof BRW!=='undefined'&&BRW.ents)for(const e of BRW.ents.values())out.push(e);return out;}
// how long a guess may wait for their game to confirm it: a round trip plus two of their updates
const pvpWait=()=>Math.min(1500,(typeof NET!=='undefined'&&NET.ping?NET.ping:150)*1.5+300);

const _netTickPvp=netTick;
netTick=function(dt){_netTickPvp(dt);
  const tn=performance.now(),wait=pvpWait();
  // (v1.49.4) their real HP is read from their own report, so it does not matter who last wrote the stand-in's HP
  for(const e of pvpEnts()){const po=pvpOther(e),base=po?Math.max(1,po.hp||1):e.hp;if(e.dead){e.pvPend=null;e.pvBase=base;continue;}
    const pend=e.pvPend;
    // their real HP went down: those hits have arrived, so their guesses are used up (oldest first)
    if(pend&&pend.length&&e.pvBase!=null&&base<e.pvBase){let drop=e.pvBase-base;while(pend.length&&drop>0){const q=pend[0];if(q.p<=drop+.5){drop-=q.p;pend.shift();}else{q.p-=drop;drop=0;}}}
    e.pvBase=base;
    if(pend)while(pend.length&&tn-pend[0].t>wait)pend.shift();
    let sum=0;if(pend)for(const q of pend)sum+=q.p;
    // shown HP: their real HP minus the hits still on their way; eases back up if a guess was too big
    const want=Math.max(1,base-sum);e.pvShow=e.pvShow==null||want<e.pvShow?want:e.pvShow+(want-e.pvShow)*Math.min(1,dt*8);e.hp=Math.max(1,Math.min(base,e.pvShow));}};
