// v1.86.0: tougher high-level bosses (js/bosstough.js): Lv 60+ bosses 4x HP and 1.4x hits, Lv 60+ mini-bosses 2.5x
// and 1.25x, both enrage below half HP (faster swings, a call); lower bosses and world bosses are left alone; the
// game server's world.json carries the same numbers.
const { player, newRoom, wait } = require('./helpers');
const path = require('path');
module.exports = async t => {
  const W = require(path.join(__dirname, '..', 'tools', 'embervale-world.json'));
  const g = await player('Tough', newRoom(), { server: 'http://127.0.0.1:9' });
  try {
    await wait(2000);
    const r = await g.ev(async () => {
      const w = ms => new Promise(r => setTimeout(r, ms));
      const pick = k => ({ hp: MOBS[k].hp, atk: MOBS[k].atk, enrage: MOBS[k].enrage || 0, mini: !!MOBS[k].mini });
      const out = { pale: pick('paleregent'), hollow: pick('hollowking'), hopper: pick('hopperchief'), rime: pick('rimeheart'), antler: pick('antlerking') };
      // the call when it crosses half its HP
      P.tut = 'done'; enterZone('meadow'); await w(600); for (const m of mobs) m.dead = true;
      const m = spawnMob('hollowking'); m.x = P.x + 300; m.y = P.y; m.idx = mobs.length; mobs.push(m);
      const t0 = texts.length; m.hp = m.d.hp * .45; await w(400);
      out.call = texts.slice(t0).some(x => /ENRAGED|คลั่ง/.test(x.txt)) && m._enr === 1;
      out.enraged = bossEnraged(m); m.hp = m.d.hp; await w(300); out.calm = !bossEnraged(m) && !m._enr;
      return out; });
    t.ok(r.pale.enrage === .5 && !r.pale.mini && r.pale.hp === 320000, `a Lv 60+ boss: 4x HP (Pale Regent ${r.pale.hp}), enrages at half`);
    t.ok(r.hollow.mini && r.hollow.hp === 250000 && r.hollow.enrage === .5, `a Lv 60+ mini-boss: 2.5x HP (Hollow King ${r.hollow.hp})`);
    t.ok(!r.hopper.enrage && !r.antler.enrage && !r.rime.enrage && r.rime.hp === 600000, 'lower bosses and world bosses are left as they were');
    t.ok(r.call && r.enraged && r.calm, 'below half HP it is enraged and calls ENRAGED! once; healed back up it calms down');
    t.ok(W.mobs.paleregent.hp === r.pale.hp && W.mobs.hollowking.enrage === .5 && W.mobs.paleregent.atk === r.pale.atk, 'the game server gets the same numbers (tools/embervale-world.json)');
    t.ok(!g.page.errors.length, 'no script errors ' + g.page.errors.slice(0, 3).join(' | '));
  } finally { await g.close(); }
};
