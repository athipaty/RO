// Safety: when the game knows more monsters in a region than the server sends (server not updated yet),
// the known ones still sync and move, and the extra ones stay out of the world.
const { player, wait, newRoom } = require('./helpers');
module.exports = async t => {
  const g = await player('Compat', newRoom(), { zone: 'meadow', server: 'http://127.0.0.1:9' });
  try {
    await wait(1000);
    const r = await g.ev(async () => { const w = ms => new Promise(r => setTimeout(r, ms)); const n = mobs.length - 5;
      const fake = () => mobs.slice(0, n).map((m, i) => [Math.round(m.x) + (i === 0 ? 40 : 0), Math.round(m.y), 1000, 2]);
      for (let k = 0; k < 15; k++) { NET.srv = { id: 'server', z: zoneId, mb: fake(), ev: [], at: now }; await w(60); }
      return { first: Math.round(mobs[0].x - (mobs[0].sx || 0)), synced: serverSim(), extrasGone: mobs.slice(n).every(m => m.dead), known: mobs.slice(0, n).every(m => !m.dead) }; });
    t.ok(r.synced && r.known, 'the monsters the server knows keep syncing');
    t.ok(r.extrasGone, 'monsters the server does not know yet stay out of the world');
    t.ok(g.page.errors.length === 0, 'no script errors' + g.page.errors.map(e => ': ' + e).join(''));
  } finally { await g.close(); }
};
