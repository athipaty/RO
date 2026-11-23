// v1.49.6: area skills hit opponents in player fights; holding or dragging a skill button on a phone no longer lowers
// its cast level; walking with the stick keeps a target in reach so Attack works while you move.
const { player, wait, newRoom } = require('./helpers');

module.exports = async t => {
  const A = await player('Areo', newRoom(), { server: 'http://127.0.0.1:9' });
  try {
    await wait(2000);
    await A.ev(() => { enterZone('meadow'); });
    await wait(1500);

    // a duel stand-in next to me: every area / ground / self skill that hits things around must reach it, without errors
    const r = await A.ev(() => {
      const ent = { pvp: true, x: P.x + 40, y: P.y, hp: 100, dead: false, hitF: -9, idx: -1, state: 'idle', d: { id: 'duel', name: 'Foe', lv: 1, hp: 100, size: 12, flee: 1, def: 0, el: 'neutral', drops: [] } };
      DUEL = { id: 'nobody', peer: null, name: 'Foe', fightAt: now - 1, until: now + 99, ent, farT: 0 };
      let hits = 0; const hm = hurtMob; hurtMob = function (m) { if (m === ent) hits++; return hm.apply(this, arguments); };
      const errs = [], hitBy = [];
      for (const id of ['arcstorm', 'arrowrain', 'frostnova', 'whirl', 'scattershot', 'flashbang', 'cinderfall', 'meteor']) {
        const s = SKILLS[id]; if (!s || typeof s.run !== 'function') continue; const h0 = hits;
        try { if (s.kind === 'self') s.run(1); else s.run(1, ent.x, ent.y); } catch (e) { errs.push(id + ': ' + e.message); }
        if (hits > h0 || shots.some(x => x.to === ent)) hitBy.push(id);
      }
      for (const [id, s] of Object.entries(SKILLS)) { if (!['area', 'ground', 'self'].includes(s.kind) || typeof s.run !== 'function') continue;
        try { s.run(1, ent.x, ent.y); } catch (e) { errs.push(id + ': ' + e.message); } }
      hurtMob = hm; DUEL = null; shots.length = 0;
      return { hitBy, errs };
    });
    t.ok(['arcstorm', 'arrowrain', 'frostnova', 'scattershot', 'flashbang'].every(id => r.hitBy.includes(id)), 'area skills hit an opponent standing in the area (' + r.hitBy.join(', ') + ')');
    t.ok(r.errs.length === 0, 'every area, ground and self skill can be cast at an opponent without errors ' + r.errs.join('; '));
    await wait(500);

    // a finger resting on a skill button (the browser's long-press) leaves the cast level alone; a mouse right-click lowers it
    const lv = await A.ev(() => {
      P.cls = 'arcanist'; P.skills.arcstorm = 3; S = computeStats(); P.bar = [{ s: 'arcstorm' }, null, null, null, null, null, null, null]; rebuildHotbar();
      setCastLv('arcstorm', 3, true); const b = document.querySelector('#hotbar > .slot');
      b.dispatchEvent(new PointerEvent('pointerdown', { pointerType: 'touch', bubbles: true }));
      b.dispatchEvent(new PointerEvent('contextmenu', { pointerType: 'touch', bubbles: true, cancelable: true }));
      const afterTouch = castLv('arcstorm');
      LAST_TOUCH = -1e9; b.dispatchEvent(new PointerEvent('contextmenu', { pointerType: 'mouse', bubbles: true, cancelable: true }));
      return { afterTouch, afterMouse: castLv('arcstorm') };
    });
    t.ok(lv.afterTouch === 3 && lv.afterMouse === 2, 'holding a skill button on a phone keeps its cast level; a mouse right-click still lowers it ' + JSON.stringify(lv));

    // walking with the stick: a target in reach keeps getting hit; one out of reach is dropped
    const walk = await A.ev(() => {
      const m = mobs.find(x => !x.dead); m.x = P.x + 30; m.y = P.y; m.hp = m.d.hp = 1e6; m.d.aggro = false; P.target = m; P.atkT = 0;
      let n = 0; const ba = basicAttack; basicAttack = function (x) { if (x === m) n++; return ba.apply(this, arguments); };
      JOY.on = true; JOY.x = 0.3; JOY.y = 0; window.__walk = { m, x0: P.x, get n() { return n; }, ba };
      return true;
    });
    await wait(1500);
    const w = await A.ev(() => { const r = { swings: window.__walk.n, moved: Math.abs(P.x - window.__walk.x0) > 5 || P.moving, kept: P.target === window.__walk.m };
      window.__walk.m.x = P.x + 900; return r; });
    await wait(300);
    const dropped = await A.ev(() => { const d = P.target !== window.__walk.m; JOY.on = false; JOY.x = 0; basicAttack = window.__walk.ba; return d; });
    t.ok(w.swings >= 1 && w.kept, 'walking with the stick keeps hitting a target in reach (' + JSON.stringify(w) + ')');
    t.ok(dropped, 'a target left out of reach while walking is dropped, so letting go never runs back to it');
    t.ok(A.page.errors.length === 0, 'no script errors' + A.page.errors.map(e => ': ' + e).join(''));
  } finally { await A.close(); }
};
