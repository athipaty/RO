"use strict";
/* ================= the special sigil abilities at work (v1.51.0) =================
   js/sigils3.js gives sigils abilities beyond plain stats; this runs them. Each is summed from your gear, its sockets
   and its awakening (like the race bonuses in js/sizerace.js), and worked out again whenever your stats are.
     on your hits      life steal (at most 4% of max HP a hit), SP per hit, chance to stun / freeze / slow,
                       Last Stand, Giant Slayer and Ambush damage, and HP / SP back when the hit is a kill
     on hits you take  reflect part of a monster's melee hit back at it, and take less from its element
     elsewhere         resist ailments, more EXP and gold, faster walking
   Loaded late, so these wrap everything else (also player fights: a stun does nothing to a player, damage bonuses count). */
const SFX_KEYS=['leech','spleech','killhp','killsp','stun','freeze','slow','thorns','res_fire','res_water','res_wind','res_earth','res_shadow',
  'ailres','exp','gold','move','lowhp','bossdmg','firstdmg'];
let SFX={};
function sfxSum(){const t={};if(!P||!P.eq)return t;const add=b=>{if(!b)return;for(const k of SFX_KEYS)if(b[k])t[k]=(t[k]||0)+b[k];};
  for(const slot of ['weapon','armor','accessory','head','face','mouth']){const e=P.eq[slot];if(!e||!ITEMS[e.id])continue;add(ITEMS[e.id].b);
    for(const s of e.s||[])if(s&&ITEMS[s])add(ITEMS[s].b);if(e.aw&&SFX_KEYS.includes(e.aw.k))t[e.aw.k]=(t[e.aw.k]||0)+(+e.aw.v||0);}
  return t;}
{const _csFX=computeStats;computeStats=function(){const s=_csFX.apply(this,arguments);try{SFX=sfxSum();if(SFX.move&&s)s.speed=Math.round(s.speed*(1+Math.min(40,SFX.move)/100));}catch(e){}return s;};}

// my hits: damage bonuses before, the rest after
{const _hmFX=hurtMob;hurtMob=function(m,dmg,crit,kind){
  if(!m||m.dead||!P)return _hmFX.apply(this,arguments);
  const d0=m.d||{},wasUp=!m.dying;let k=1;
  if(SFX.lowhp&&S&&P.hp<S.maxhp*.35)k+=SFX.lowhp/100;
  if(SFX.bossdmg&&d0.boss)k+=SFX.bossdmg/100;
  if(SFX.firstdmg&&!m.pvp&&d0.hp&&m.hp>=d0.hp*.999)k+=SFX.firstdmg/100;
  if(k!==1)dmg=Math.max(1,Math.round(dmg*k));
  const r=_hmFX.call(this,m,dmg,crit,kind);
  try{if(dmg>0&&S){
    if(SFX.leech&&!P.dead){P.hp=Math.min(S.maxhp,P.hp+Math.min(dmg*SFX.leech/100,S.maxhp*.04));}
    if(SFX.spleech)P.sp=Math.min(S.maxsp,P.sp+SFX.spleech);
    if(!m.pvp&&!m.dead&&!m.dying){const roll=x=>x&&Math.random()*100<x;
      if(roll(SFX.stun))ailMob(m,'stun',1.5);else if(roll(SFX.freeze))ailMob(m,'freeze',2);else if(roll(SFX.slow))slowMob(m,2.5);}
    // a kill: the monster is down (or going down) after this hit
    if(wasUp&&!m.pvp&&(m.dead||m.dying||m.hp<=0)){
      if(SFX.killhp&&!P.dead)P.hp=Math.min(S.maxhp,P.hp+S.maxhp*SFX.killhp/100);
      if(SFX.killsp)P.sp=Math.min(S.maxsp,P.sp+SFX.killsp);}}}catch(e){}
  return r;};}

// hits I take from a monster: its element, and reflecting melee
let SFX_ATK=null;
{const _maFX=mobAttack;mobAttack=function(m){SFX_ATK=m;const hp0=P?P.hp:0;try{return _maFX.apply(this,arguments);}finally{SFX_ATK=null;
  try{if(SFX.thorns&&P&&!P.dead&&m&&!m.dead&&!(m.d&&m.d.range)){const took=(hp0-P.hp)/(typeof HP_K!=='undefined'?HP_K:1);
    if(took>0)hurtMob(m,Math.max(1,Math.round(took*SFX.thorns/100)),false,'phys');}}catch(e){}}};}
for(const fn of ['slamLand','mobBolt']){if(typeof window[fn]!=='function')continue;const o=window[fn];window[fn]=function(m){SFX_ATK=m;try{return o.apply(this,arguments);}finally{SFX_ATK=null;}};}
{const _hpFX=hurtPlayer;hurtPlayer=function(dmg,src){const m=SFX_ATK;
  if(m&&m.d){const el=m.d.el||'neutral',res=SFX['res_'+el];if(res)dmg=Math.max(1,Math.round(dmg*(1-Math.min(60,res)/100)));}
  return _hpFX.call(this,dmg,src);};}

// ailments, EXP, gold
if(typeof tryAilment==='function'){const _taFX=tryAilment;tryAilment=function(){if(SFX.ailres&&Math.random()*100<Math.min(80,SFX.ailres)){if(P)floatT(P.x,P.y-44,'Resist!','#cfe8ff',12);return;}return _taFX.apply(this,arguments);};}
{const _geFX=gainExp;gainExp=function(e,j){if(SFX.exp){e=Math.round(e*(1+SFX.exp/100));j=Math.round(j*(1+SFX.exp/100));}return _geFX.call(this,e,j);};}
function sfxGold(g){return SFX.gold?Math.round(g*(1+SFX.gold/100)):g;}
if(typeof TH!=='undefined')Object.assign(TH,{'Resist!':'ต้านทาน!'});
// the library's ability filter (js/codex.js) lists the new abilities too
if(typeof CODEX_ABS!=='undefined'&&typeof SIG3_NAME!=='undefined'){for(const k in SIG3_NAME)if(!CODEX_ABS.some(a=>a[0]===k))CODEX_ABS.push([k,SIG3_NAME[k].replace(/ \(.*\)$/,'')]);
  for(const r of ['beast','insect','plant','spirit','undead','fiend','construct'])if(!CODEX_ABS.some(a=>a[0]==='vs_'+r))CODEX_ABS.push(['vs_'+r,'vs '+r[0].toUpperCase()+r.slice(1)]);}
