"use strict";
/* ================= tougher high-level bosses (v1.86.0) =================
   Measured: a Lv 99 Skywarden in top gear (best bow, 4 AGI / critical / double-attack sigils in the accessory and the
   shoes, ~87% critical) auto-hunting alone, without its buffs, killed the Kraken Matron in 15 s and the Hollow King
   in 18 s, losing a quarter of its HP and never coming close to dying. A boss should take a geared hero a real fight
   alone and reward a party. So every region boss from Lv 60 up (not mini-bosses, not world bosses):
     - 4x HP: about 1-2.5 minutes alone in top gear, 20-40 s for a party of four
     - hits 40% harder: its slams, ground marks and cast bars have to be dodged, or tonics drunk
     - enrages below half its HP: attacks faster (1.3 s -> 0.9 s between swings), a red glow and an ENRAGED! call
     - more for the longer fight: 1.6x EXP and job EXP, every drop 1.3x as likely (at most certain)
   Mini-bosses from Lv 60 up (the Hollow King, Kraken Matron, Voltaris... that you meet roaming a region, 15-36 s alone
   before) get a smaller dose so they stay below the real ones: 2.5x HP, 1.25x hits, the same enrage and rewards.
   Gear and sigils are left exactly as they are. tools/export-world.js runs this file too, so the game server's
   bosses get the same HP, drops and the enrage (routes/embervale/sim.js). */
const BOSS_TOUGH={minLv:60,boss:{hp:4,atk:1.4},mini:{hp:2.5,atk:1.25},exp:1.6,drop:1.3,enrage:.5};
for(const id in MOBS){const m=MOBS[id];if(!m||!m.boss||m.world||(m.lv|0)<BOSS_TOUGH.minLv||m._tough)continue;m._tough=1;
  const k=m.mini?BOSS_TOUGH.mini:BOSS_TOUGH.boss;
  m.hp=Math.round(m.hp*k.hp);m.atk=Math.round(m.atk*k.atk);
  m.exp=Math.round((m.exp||0)*BOSS_TOUGH.exp);m.jexp=Math.round((m.jexp||0)*BOSS_TOUGH.exp);
  if(Array.isArray(m.drops))m.drops=m.drops.map(d=>Array.isArray(d)?[d[0],Math.min(1,d[1]*BOSS_TOUGH.drop),...d.slice(2)]:d);
  m.enrage=BOSS_TOUGH.enrage;}
// enraged: below its enrage line (the time between swings is in js/combat.js and the server's sim.js)
const bossEnraged=m=>!!(m&&m.d&&m.d.enrage&&!m.dead&&m.hp>0&&m.hp<m.d.hp*m.d.enrage);
// the glow and the call hook into drawing and the game loop, which load later: attach them once the page is ready
// (tools/export-world.js has no page, so it only takes the numbers above)
if(typeof window!=='undefined'&&typeof window.addEventListener==='function')window.addEventListener('load',()=>{
if(typeof drawMob==='function'){const _dmT=drawMob;drawMob=function(m){
  if(bossEnraged(m)&&typeof ctx!=='undefined'){const s=m.d.size||30,p=.55+.45*Math.sin(now*7);ctx.save();ctx.globalAlpha=.32*p+.12;
    const gr=ctx.createRadialGradient(m.x,m.y-s*.6,s*.3,m.x,m.y-s*.6,s*1.6);gr.addColorStop(0,'rgba(255,70,40,.9)');gr.addColorStop(1,'rgba(255,40,20,0)');
    ctx.fillStyle=gr;ctx.beginPath();ctx.ellipse(m.x,m.y-s*.6,s*1.6,s*1.3,0,0,7);ctx.fill();ctx.restore();}
  return _dmT.apply(this,arguments);};}
// the moment it enrages: a call over its head (once per fight)
if(typeof update==='function'){const _upT=update;update=function(dt){const r=_upT.apply(this,arguments);
  try{if(typeof mobs!=='undefined')for(const m of mobs){if(!m||!m.d||!m.d.enrage)continue;
    if(bossEnraged(m)){if(!m._enr){m._enr=1;if(typeof floatT==='function')floatT(m.x,m.y-(m.d.size||30)*1.8,typeof LANG!=='undefined'&&LANG==='th'?'คลั่ง!':'ENRAGED!','#ff5a3a',20);}}
    else if(m.hp>=m.d.hp*m.d.enrage||m.dead)m._enr=0;}}catch(e){}return r;};}
});
