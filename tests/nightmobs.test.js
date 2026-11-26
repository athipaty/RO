// Night-only monsters (js/nightmobs.js, v1.17.1): the Grand Scarecrow of Willowmere Farms rises only after dark
// and sinks back into the field at dawn unless someone is fighting it
const { player, newRoom, wait } = require('./helpers');
module.exports = async t => {
  const g = await player('Nightwatch', newRoom(), { server: 'http://127.0.0.1:9' });
  try {
    await wait(300);
    const r = await g.ev(async () => {
      const w = ms => new Promise(r => setTimeout(r, ms)), out = {}, realHour = gameHour;
      const setHour = h => { gameHour = () => h; };
      enterZone('farms', 'town'); const sc = () => mobs.find(m => m.d.id === 'grandscarecrow');
      out.flag = MOBS.grandscarecrow.night === true && !MOBS.hornback.night;
      setHour(12); P.x = sc().x + 2000; await w(400); out.dayGone = sc().dead;
      sc().respawnAt = now; await w(400); out.dayStays = sc().dead;
      setHour(22); sc().respawnAt = now; await w(400); out.nightUp = !sc().dead;
      const m = sc(); P.x = m.x - 40; P.y = m.y; P.hp = P.maxHp = 1e7; m.myDmg = 50; setHour(12); m.state = 'chase'; m.aggroed = true; await w(300); out.fightStays = !m.dead;
      P.x = m.x + 3000; m.state = 'idle'; m.aggroed = false; m.myDmg = 0; for (let i = 0; i < 30 && !m.dead; i++) await w(100); out.dawnGone = m.dead; // (a busy test browser draws few frames: wait for the game to step)
      setHour(12); const hb = (enterZone('heights', 'town'), mobs.find(m => m.d.id === 'hornback')); await w(300); out.otherBoss = !hb.dead;
      // the game server runs the region: its snapshot brings the scarecrow back at night, and the game says so
      enterZone('farms', 'town'); const m2 = sc(); m2.dead = true; P.x = m2.x + 100; P.y = m2.y; setHour(22);
      const mb = mobs.map(o => [o.x, o.y, 1000, 0]);
      syncMobs({ id: 'server', mb, ev: [] }, .05); out.srvUp = !m2.dead;
      out.srvSaid = document.querySelector('#log').textContent.includes('Grand Scarecrow stirs');
      gameHour = realHour;
      out.th = TH_PAT.some(([re, f]) => re.test('Night falls on Willowmere Farms: the Grand Scarecrow stirs.'));
      return out;
    });
    t.ok(r.flag, 'the Grand Scarecrow is a night monster, Old Hornback is not');
    t.ok(r.dayGone && r.dayStays, 'in daylight the Grand Scarecrow is not in the field and does not rise');
    t.ok(r.nightUp, 'after dark it rises');
    t.ok(r.fightStays, 'at dawn it stays while someone is fighting it');
    t.ok(r.dawnGone, 'at dawn, left alone, it sinks back into the field');
    t.ok(r.otherBoss, 'other bosses are not affected by the time of day');
    t.ok(r.srvUp && r.srvSaid, 'when the game server raises it at night, the game says the Grand Scarecrow stirs');
    t.ok(require('../tools/embervale-world.json').mobs.grandscarecrow.night === true, 'the world export tells the game server it is a night monster');
    t.ok(r.th, 'the "night falls" message has Thai text');
    t.ok(g.page.errors.length === 0, 'no script errors' + g.page.errors.map(e => ': ' + e).join(''));
  } finally { await g.close(); }
};
