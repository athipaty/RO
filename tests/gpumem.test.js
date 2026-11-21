// Big fights on phones: the shared monster pictures stay inside a memory budget and dropped ones are freed at once
// (too many at once made Android Chrome reset its graphics: the whole screen went black for a second).
const { player, wait, newRoom } = require('./helpers');

module.exports = async t => {
  const g = await player('GpuMem', newRoom(), { server: 'http://127.0.0.1:9' });
  try {
    await wait(500);
    const r = await g.ev(async () => { const w = ms => new Promise(r => setTimeout(r, ms)); enterZone('meadow'); await w(300);
      const kinds = Object.keys(MOBS).slice(0, 60); mobs.length = 0;
      kinds.forEach((id, i) => { const m = spawnMob(id); m.idx = i; m.x = P.x + (i % 10) * 40 - 200; m.y = P.y + Math.floor(i / 10) * 40 - 120; m.hp = 1e9; mobs.push(m); });
      window.__crowdForce = true; running = false; const first = [];
      // many kinds, both facings, moving and still: far more pictures than the budget allows
      for (let round = 0; round < 8; round++) { mobs.forEach(m => { m.face = round % 2 ? 1 : -1; m.moving = (round >> 1) % 2 === 1; m.slowUntil = round > 3 ? now + 99 : 0; }); CROWD.frame = -1; now += .1; render();
        if (!round) for (const e of CROWD.pics.values()) first.push(e.c); }
      let sum = 0; for (const e of CROWD.pics.values()) sum += e.c.width * e.c.height * 4; const bytes = CROWD.bytes;
      const freed = first.filter(c => c.width === 0).length, kept = first.filter(c => [...CROWD.pics.values()].some(e => e.c === c)).length;
      // a quality change (new resolution) replaces pictures and frees the old ones
      const before = [...CROWD.pics.values()].map(e => e.c); window.__bsForce = 2; bsSet(2); CROWD.frame = -1; now += .1; render();
      const used = mobs.length, reFreed = before.filter(c => c.width === 0).length; window.__bsForce = undefined; bsSet(0);
      // words such as Miss reuse one picture
      const m1 = floatImg('Miss', '#aab4c4', 13), m2 = floatImg('Miss', '#aab4c4', 13);
      window.__crowdForce = undefined; running = true;
      return { budget: PIC_BUDGET, bytes, used, sum, n: CROWD.pics.size, made: first.length, freed, kept, reFreed, before: before.length, sameWord: m1 === m2 };
    });
    t.ok(r.sum <= r.budget, `crowd pictures use ${(r.sum / 1e6).toFixed(1)} MB, within the ${(r.budget / 1e6).toFixed(0)} MB budget (${r.n} pictures)`);
    t.ok(Math.abs(r.bytes - r.sum) < 1, 'the running total matches the pictures actually kept');
    t.ok(r.freed > 0 && r.freed + r.kept === r.made, `every dropped picture is freed at once (${r.freed} freed, ${r.kept} still in use)`);
    t.ok(r.reFreed >= r.used / 2, `a resolution change frees the old pictures of the monsters on screen (${r.reFreed} freed)`);
    t.ok(r.sameWord, 'words like Miss reuse one picture instead of making a new one per hit');
    t.ok(g.page.errors.length === 0, 'no script errors' + g.page.errors.map(e => ': ' + e).join(''));
  } finally { await g.close(); }
};
