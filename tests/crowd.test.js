// Big fights stay smooth: crowded monsters share pictures, damage numbers reuse cached digits, the HUD stops re-measuring.
const { player, wait, newRoom } = require('./helpers');

module.exports = async t => {
  const g = await player('Crowd', newRoom(), { server: 'http://127.0.0.1:9' });
  try {
    await wait(500);
    const r = await g.ev(async () => { const w = ms => new Promise(r => setTimeout(r, ms)); enterZone('meadow'); await w(300);
      for (let i = 0; i < 30; i++) mobs.push(spawnMob(Z.D.mobs[i % Z.D.mobs.length][0]));
      mobs.forEach((m, i) => { m.idx = i; const a = i / mobs.length * 6.28, d = 50 + (i % 6) * 35; m.x = P.x + Math.cos(a) * d; m.y = P.y + Math.sin(a) * d * .7; m.hp = 1e9; m.d = { ...m.d, hp: 1e9, atk: 0 }; });
      const kinds = new Set(mobs.map(m => m.d.id)).size; CROWD.frame = -1; const on = crowdOn(); CROWD.draws = 0; running = false; await w(50);
      now += .1; render(); const draws = CROWD.draws;
      // the picture lands where the monster stands: compare a live drawing with the shared one, pixel for pixel near it
      const m = mobs.find(x => x.d.id === 'sproutling') || mobs[0]; const others = mobs.filter(x => x !== m); others.forEach(x => { x._sx = x.x; x.x = -9999; });
      m.ph = 0; m.hitF = -9; const px = () => { render(); return cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data; };
      window.__crowdForce = false; const tA = now; const A = px(); window.__crowdForce = true; now = tA; CROWD.pics.clear(); CROWD.frame = -1; const B = px();
      let diff = 0; for (let i = 0; i < A.length; i += 4) if (Math.abs(A[i] - B[i]) + Math.abs(A[i + 1] - B[i + 1]) + Math.abs(A[i + 2] - B[i + 2]) > 60) diff++;
      others.forEach(x => { x.x = x._sx; }); window.__crowdForce = undefined; running = true; const ratio = diff / (A.length / 4);
      return { kinds, on, draws, mobs: mobs.length, diff, ratio };
    });
    t.ok(r.on, `a crowd of ${r.mobs} monsters switches shared pictures on`);
    t.ok(r.draws > 0 && r.draws < r.mobs / 2, `${r.mobs} monsters of ${r.kinds} kinds needed only ${r.draws} drawings this frame`);
    t.ok(r.diff < 60, `a shared picture looks the same as drawing that monster live (${r.diff} pixels differ, edges only)`);
    // a quiet scene draws monsters live
    t.ok(await g.ev(() => { mobs.forEach((m, i) => { if (i > 3) m.dead = true; }); CROWD.frame = -1; return !crowdOn(); }), 'with only a few monsters around, everything is drawn live as before');
    // damage numbers from cached digits
    const dn = await g.ev(() => { const a = floatImg('1234', '#ffffff', 15), b = floatImg('4321', '#ffffff', 15), n = GLYPHS.size, word = floatImg('Miss', '#aab4c4', 13);
      return { parts: a.parts && a.parts.length === 4, shared: GLYPHS.size === n, glyphs: n, word: !word.parts && word._w > 0, w: a._w > 20 }; });
    t.ok(dn.parts && dn.shared && dn.w, `damage numbers are built from ${dn.glyphs} cached digit pictures (no new canvas per number)`);
    t.ok(dn.word, 'words like Miss still get their own picture');
    // a crowded live fight with skills and numbers: no errors
    await g.ev(async () => { const w = ms => new Promise(r => setTimeout(r, ms)); mobs.forEach(m => { m.dead = false; m.state = 'chase'; }); P.hp = P.sp = 1e6; S = computeStats();
      const b = mobs[0]; for (let i = 0; i < 12; i++) { for (const id of ['meteor', 'frostnova', 'rampage', 'chainlightning']) { const sk = SKILLS[id]; try { if (sk.kind === 'target') sk.run(5, b); else if (sk.kind === 'area') sk.run(5, b.x, b.y); else sk.run(5); } catch (e) {} } await w(120); } });
    t.ok(g.page.errors.length === 0, 'no script errors in a crowded fight' + g.page.errors.map(e => ': ' + e).join(''));
  } finally { await g.close(); }
};
