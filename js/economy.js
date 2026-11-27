"use strict";
/* ================= money that keeps up with the hunt (v1.75.0) =================
   Measured with an axe Warden levelling from 10 to 98 (loot sold at the shop, tonics for the HP each fight costs, the
   best gear bought or forged as it comes, refined to +4, a day of dailies and bounties): hunting paid well early, but
   from Lv 70 the tonics cost more than the loot sold for, and one day of quests paid more than many hours of hunting.
     1. Late loot is worth a little more: a material dropped by monsters past Lv 60 sells for more the higher they are
        (x1.1 at Lv 70, x1.3 at Lv 90). Kept small: strong late heroes kill fast and can farm easier places, so they earn
        well anyway (v1.75.0 first tried x2, which made late gold too easy). Ores, tonics and shop goods keep their price.
     2. The Grand Tonic (royal shop): 1000 HP (3000 with heroes' 3x HP) for 420 gold, the cheapest healing per HP late on;
        auto-hunt knows it (js/combat.js).
     3. The two price walls are smoothed: the Lv 60 Storm and Lv 90 Sun gear cost about 15% less (the Lv 75 Star gear and
        the forged gear already sit on the curve).
     4. Quest gold follows the curve: dailies, bounties and the weekly goals pay x1.3 gold up to Lv 30 (a new hero is the
        one who is short of gold), x1 at Lv 40 and x0.85 from Lv 50 (EXP unchanged), so late on a day of quests is a bonus
        on top of hunting instead of the whole income. */
// ---- 1. late materials ----
const ECON_MAT_K=lv=>lv<=60?1:Math.min(1.3,1+(lv-60)*.01);
{const NO=new Set(['emberore','glintstone']),lvOf={};
  for(const m of Object.values(MOBS)){if(!m||!m.lv||m.world)continue;for(const [id,p] of m.drops||[]){const it=ITEMS[id];if(!it||it.type!=='etc'||NO.has(id)||p<.3)continue;if(typeof shopSells==='function'&&shopSells(id))continue;
    lvOf[id]=Math.min(lvOf[id]||999,m.lv);}}
  for(const id in lvOf){const it=ITEMS[id],k=ECON_MAT_K(lvOf[id]);if(k>1&&!it._econ){it._econ=1;it.price=Math.round(it.price*k);}}}
// ---- 2. the Grand Tonic ----
ITEMS.grandtonic={name:'Grand Tonic',type:'use',price:420,heal:1000,col:'#c8306a',g:'G',desc:'Restores 1000 HP.'};
if(typeof ROYAL_SHOP!=='undefined'&&!ROYAL_SHOP.includes('grandtonic')){const i=ROYAL_SHOP.indexOf('crimson');ROYAL_SHOP.splice(i<0?ROYAL_SHOP.length:i+1,0,'grandtonic');}
if(typeof TH!=='undefined')Object.assign(TH,{'Grand Tonic':'ยาบำรุงชั้นยอด'});
// ---- 3. the price walls ----
for(const [id,it] of Object.entries(ITEMS)){if(!it||it._econP||!(it.type==='weapon'||it.type==='armor'))continue;
  if(/^storm(blade|axe|dirk|bow|mace|staff|gun|plate|robe)$/.test(id)||/^sun(mace|blade|axe|dirk|bow|staff|gun|plate|robe)$/.test(id)){it._econP=1;it.price=Math.round(it.price*.85/100)*100;}}
// ---- 4. quest gold: more early, less late ----
const ECON_QK=lv=>lv<=30?1.3:lv<40?1.3-(lv-30)*.03:lv<50?1-(lv-40)*.015:.85;
if(typeof dqBuild==='function'){const _dqbE=dqBuild;dqBuild=function(id,x){const r=_dqbE.apply(this,arguments);
  try{const m=x&&x.mob&&MOBS[x.mob];if(r&&r.reward&&r.reward.gold&&m)r.reward.gold=Math.round(r.reward.gold*ECON_QK(m.lv)/10)*10;}catch(e){}return r;};}
if(typeof bReward==='function'){const _brE=bReward;bReward=function(x){const r=_brE.apply(this,arguments);
  try{const m=x&&x.mob&&MOBS[x.mob],lv=m?m.lv:(P?P.lv:1);if(r&&r.gold)r.gold=Math.round(r.gold*ECON_QK(lv)/10)*10;}catch(e){}return r;};}
if(typeof wkReward==='function'){const _wkE=wkReward;wkReward=function(g){const r=_wkE.apply(this,arguments);try{if(r&&r.gold&&P)r.gold=Math.round(r.gold*ECON_QK(P.lv)/10)*10;}catch(e){}return r;};}
