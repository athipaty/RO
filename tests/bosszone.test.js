// v1.50.1: bosses mark the ground under a player and it erupts 1.2 s later; stepping out avoids it.
const { player, wait, newRoom } = require('./helpers');

module.exports = async t => {
  const A = await player('Dodger', newRoom(), { server: 'http://127.0.0.1:9' });
  try {
    await wait(2000);
    await A.ev(() => { enterZone('meadow'); });
    await wait(1500);
    const boss = await A.ev(() => { const m = mobs.find(x => x.d.boss); return m ? m.d.id : null; });
    t.ok(!!boss, 'the meadow has a boss (' + boss + ')');

    // hits on the hero are counted, not applied (so the hero stays alive through the test)
    await A.ev(() => { window.__hp = []; window.__hpOrig = hurtPlayer; hurtPlayer = function (d, src) { window.__hp.push({ d, src }); }; });
    // standing in the circle hurts; stepping out of it does not
    const r = await A.ev(async () => { const w = ms => new Promise(r => setTimeout(r, ms)); const m = mobs.find(x => x.d.boss);
      m.x = P.x + 900; m.y = P.y; m.state = 'idle'; m.d = { ...m.d, aggro: false };
      window.__hp.length = 0; bossZone(m, P.x, P.y, 85); await w(1500); const hit = window.__hp.length;
      window.__hp.length = 0; bossZone(m, P.x, P.y, 85); P.x += 200; P.path = []; await w(1500); const dodged = window.__hp.length;
      return { hit, dodged, warned: /step out of the glowing circle/.test(document.getElementById('log').textContent) }; });
    t.ok(r.hit === 1 && r.warned, 'standing in the marked circle when it erupts hurts, and you are told to step out');
    t.ok(r.dodged === 0, 'stepping out of the circle avoids it');

    // a boss chasing you from range marks the ground under you by itself
    const used = await A.ev(async () => { const w = ms => new Promise(r => setTimeout(r, ms)); const m = mobs.find(x => x.d.boss);
      m.x = P.x + 300; m.y = P.y; m.sx = m.x; m.sy = m.y; m.state = 'chase'; m.zoneT = 0; m.slamT = now + 99; m.d = { ...m.d, aggro: true };
      let n = 0; const bz = bossZone; bossZone = function () { n++; return bz.apply(this, arguments); }; await w(2000); bossZone = bz; return n; });
    t.ok(used >= 1, 'a boss in a fight marks the ground under you by itself');
    await A.ev(() => { hurtPlayer = window.__hpOrig; });
    t.ok(A.page.errors.length === 0, 'no script errors' + A.page.errors.map(e => ': ' + e).join(''));
  } finally { await A.close(); }
};
