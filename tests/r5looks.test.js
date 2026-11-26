// v1.62.0: the twenty monsters of the four corner regions have their own drawings, which draw without errors
const { player, wait, newRoom } = require('./helpers');
module.exports = async t => {
  const g = await player('Looker', newRoom(), { server: 'http://127.0.0.1:9' });
  try {
    await wait(500);
    const r = await g.ev(() => { const ids = [...new Set(R5_ZONES.flatMap(z => ZONES[z].mobs.map(m => m[0])))], bad = [], none = ids.filter(id => typeof MOB_LOOKS[id] !== 'function');
      enterZone('bramble'); running = false; const m = mobs[0];
      for (const id of ids) { m.d = MOBS[id]; m.x = P.x + 60; m.y = P.y; for (const mv of [false, true]) { m.moving = mv; try { render(); } catch (e) { bad.push(id + ': ' + e.message); } } }
      running = true; return { n: ids.length, none, bad }; });
    t.ok(r.n === 20 && !r.none.length, `all ${r.n} new monsters have a drawing of their own` + (r.none.length ? ': missing ' + r.none.join(', ') : ''));
    t.ok(!r.bad.length, 'they draw standing and walking without errors' + (r.bad.length ? ': ' + r.bad.join('; ') : ''));
    t.ok(g.page.errors.length === 0, 'no script errors' + g.page.errors.map(e => ': ' + e).join(''));
  } finally { await g.close(); }
};
