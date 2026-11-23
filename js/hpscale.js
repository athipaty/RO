"use strict";
/* ================= one damage for everyone (v1.51.0) =================
   Before, player fights used their own hidden rule (hits from players did 40%), so a skill did less to a player than
   to a monster. Now the damage is the same everywhere and the heroes are sturdier instead:
     - heroes have 3x HP (HP_K in js/data.js; js/world.js), Max HP bonuses on gear, sigils, food and the album are 3x
     - monsters hit 3x as hard (hurtPlayer, js/combat.js), so hunting feels exactly as before
     - tonics and fixed heals (First Aid, Mend, Sanctuary, Resurgence and their party heals) heal 3x; heals counted in
       % of max HP grow by themselves; HP regen is 3x
   Player fights keep only their safety limits (js/duel.js): one hit takes at most 30% of max HP (40% for a critical
   hit), one attacker at most 50% within 1.2 s. Everything you read (item and skill texts, the bestiary) shows the
   new numbers. Loaded last, so every item and skill is already there. */
{
  // Max HP bonuses: the numbers themselves (each bonus object once; a sigil's item and its monster share one)
  const seen=new Set(),up=b=>{if(b&&typeof b==='object'&&!seen.has(b)&&typeof b.maxhp==='number'){seen.add(b);b.maxhp*=HP_K;}};
  for(const it of Object.values(ITEMS)){up(it.b);if(it.brew)up(it.brew.b);}
  for(const m of Object.values(MOBS))if(m.sig)up(m.sig.b);
  if(typeof ALBUM!=='undefined')for(const a of ALBUM)up(a.b);
  // the texts written before this point: Max HP bonuses, tonics and HP regen
  const k=v=>String(Math.round(+v*HP_K));
  const fix=t=>typeof t!=='string'?t:t
    .replace(/\+(\d+) Max HP/g,(_,v)=>`+${k(v)} Max HP`).replace(/Max HP \+(\d+)/g,(_,v)=>`Max HP +${k(v)}`).replace(/MAXHP \+(\d+)/g,(_,v)=>`Max HP +${k(v)}`)
    .replace(/Restores (\d+) HP/g,(_,v)=>`Restores ${k(v)} HP`).replace(/HP regen \+(\d+)/g,(_,v)=>`HP regen +${k(v)}`).replace(/\+(\d+) HP regen/g,(_,v)=>`+${k(v)} HP regen`);
  for(const it of Object.values(ITEMS)){it.desc=fix(it.desc);if(it.txt)it.txt=fix(it.txt);}
  for(const m of Object.values(MOBS))if(m.sig&&m.sig.txt)m.sig.txt=fix(m.sig.txt);
  // HP regen bonuses stay as they are in the data and are tripled when stats are worked out (js/world.js)
  if(typeof BONUS_LABEL!=='undefined')BONUS_LABEL.regen=v=>`HP regen +${k(v)}/s`;

  // monsters hit 3x: done outside every other rule on hits taken (the freeze guard in js/smooth.js, Mana Shield,
  // Damage taken), so those keep working in real HP
  {const _hpK=hurtPlayer;hurtPlayer=function(dmg,src){return _hpK.call(this,Math.max(1,Math.round(dmg*HP_K)),src);};}
  // fixed heals: tripled while they run (healP in js/combat.js); party heals arrive through SUP
  const FLAT=['firstaid','mend','sanctuary','resurgence'];
  const flat=fn=>function(){HEAL_FLAT++;try{return fn.apply(this,arguments);}finally{HEAL_FLAT--;}};
  for(const id of FLAT){const s=SKILLS[id];if(s&&typeof s.run==='function')s.run=flat(s.run);
    if(typeof SUP!=='undefined'&&SUP[id]&&typeof SUP[id].apply==='function')SUP[id].apply=flat(SUP[id].apply);}
  // skill texts: fixed heal amounts and HP regained per second
  const skFix=t=>typeof t!=='string'?t:t
    .replace(/(Heal(?: yourself for)? )(\d+)( \+ )(\d+)(% MATK)/g,(_,a,v,b,p,c)=>a+k(v)+b+k(p)+c)
    .replace(/(Heal )(\d+)( HP)/g,(_,a,v,c)=>a+k(v)+c)
    .replace(/\b(regenerate|regain) (\d+) HP/g,(_,a,v)=>`${a} ${k(v)} HP`);
  for(const s of Object.values(SKILLS))if(typeof s.desc==='function'){const d=s.desc;s.desc=function(){return skFix(d.apply(this,arguments));};}
}
