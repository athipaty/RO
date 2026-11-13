// Every skill (old and new) fires its own signature effect, and drawing them never breaks the frame (normal and Performance mode).
const { player, wait, newRoom } = require('./helpers');

module.exports = async t => {
  const g = await player('Sparkler', newRoom(), { server: 'http://127.0.0.1:9' });
  try {
    await wait(500);
    const r = await g.ev(async () => {
      const w = ms => new Promise(r => setTimeout(r, ms)); enterZone('meadow'); await w(300);
      const m = mobs.find(x => !x.dead); m.hp = 1e7; m.d = { ...m.d, hp: 1e7, atk: 0 }; P.x = m.x - 60; P.y = m.y; P.hp = P.sp = 99999; S = computeStats();
      const ids = Object.keys(SKILL_FX), kinds = {}, sigs = new Set(); let missing = [];
      for (const id of ids) { fx = []; const sk = SKILLS[id];
        if (sk.kind === 'target') sk.run(10, m); else if (sk.kind === 'area') sk.run(10, m.x, m.y); else sk.run(10);
        const mine = fx.filter(f => FXK[f.k]).map(f => f.k); if (!mine.length) missing.push(id); kinds[id] = mine; sigs.add(mine.slice().sort().join('+'));
        await w(120); }
      const actives = Object.keys(SKILLS).filter(id => SKILLS[id].kind !== 'passive' && SKILLS[id].kind !== 'ground').length, ground = Object.keys(SKILLS).filter(id => SKILLS[id].kind === 'ground').every(id => ZONE_FX[id]);
      fx = []; placeZone('haven', 5, m.x, m.y); const zoneFx = fx.some(f => FXK[f.k]);
      window.LITE = true; fx = []; SKILLS.tempest.run(10); SKILLS.stampede.run(10, m.x, m.y); await w(400); window.LITE = false;
      return { n: ids.length, actives, ground, zoneFx, missing, distinct: sigs.size, kinds: Object.keys(FXK).length };
    });
    t.ok(r.n === r.actives, `every skill you cast has its own effect (${r.n} of ${r.actives})`);
    t.ok(r.ground && r.zoneFx, 'ground skills (Thorn Snare, Ember Wall, Haven) get one when placed');
    t.ok(!r.missing.length, 'each one draws a new kind of effect' + (r.missing.length ? ': missing ' + r.missing.join(', ') : ''));
    t.ok(r.distinct >= r.n * .75, `the effects differ from skill to skill (${r.distinct} different mixes from ${r.kinds} effect kinds)`);
    t.ok(g.page.errors.length === 0, 'no script errors while drawing them' + g.page.errors.map(e => ': ' + e).join(''));
  } finally { await g.close(); }
};
