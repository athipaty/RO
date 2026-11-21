// Smooth player fights: faster, evenly spaced updates during a duel (never past the server's 20 a second), sends on the
// real clock (not held back by the hit-freeze), and the opponent's HP bar drops the moment you hit them.
const { player, wait, newRoom } = require('./helpers');

module.exports = async t => {
  const g = await player('Swift', newRoom(), { server: 'http://127.0.0.1:9' });
  try {
    await wait(500);
    // a stand-in opponent: their presence says max HP 2000, DEF 50, full HP
    await g.ev(() => { const o = { peer: 'fake', id: 'foe1', n: 'Rival', z: zoneId, x: P.x + 60, y: P.y, rx: P.x + 60, ry: P.y, hp: 100, mh: 2000, df: 50, lv: 30, look: P.look, cls: P.cls, face: 1, walkT: 0, moving: false };
      NET.others.set('fake', o); window.__foe = o; duelStart(o); DUEL.fightAt = now - 1; DUEL.until = now + 999; });

    // 1. sending: count presence sends over one real second while hitting every frame
    const s = await g.ev(async () => { const sent = []; const broker = NET.viaBroker; NET.viaBroker = false; // the game server's pace
      NET.room = NET.room || { presence: () => Promise.resolve(), onPeers() {} };
      // count sends by the game's own send time (the backup connection may swap NET.room while we watch)
      let seen = NET.sentRt; const watch = () => { if (NET.sentRt !== seen) { seen = NET.sentRt; sent.push({ t: seen * 1000, x: JSON.parse(NET.lastSent || '{}') }); } if (!watch.stop) requestAnimationFrame(watch); }; requestAnimationFrame(watch);
      const t0 = performance.now(); let frames = 0;
      await new Promise(res => { const step = () => { frames++; dlSend('foe1', 'hit', { d: 1, c: 0 }); NET.lastSent = ''; if (performance.now() - t0 < 1000) requestAnimationFrame(step); else res(); }; requestAnimationFrame(step); });
      // a hit-freeze: game time stands still, hits made meanwhile still go out
      const frozen = sent.length; hitStopUntil = performance.now() + 400; const t1 = performance.now();
      await new Promise(res => { const step = () => { dlSend('foe1', 'hit', { d: 1, c: 0 }); if (performance.now() - t1 < 400) requestAnimationFrame(step); else res(); }; requestAnimationFrame(step); });
      const during = sent.length - frozen; hitStopUntil = 0;
      let minGap = 1e9; for (let i = 1; i < sent.length; i++) minGap = Math.min(minGap, sent[i].t - sent[i - 1].t);
      watch.stop = true; NET.viaBroker = broker; return { n: frozen, frames, minGap, during, pvp: pvpOn(), mh: sent.length ? sent[sent.length - 1].x.mh : 0 }; });
    t.ok(s.pvp, 'a duel counts as a player fight');
    t.ok(s.n >= 12 && s.n <= 19, `in a duel updates go out ${s.n} times a second (fast, but under the server's 20) while hitting every frame (${s.frames} frames)`);
    t.ok(s.minGap >= 50, `updates are at least 50 ms apart (closest pair ${s.minGap.toFixed(0)} ms)`);
    t.ok(s.during >= 4, `updates keep going during a hit-freeze (${s.during} in 0.4 s)`);
    t.ok(s.mh > 0, 'your max HP rides along in presence so opponents can show your HP bar at once');

    // 2. the opponent's HP bar
    const h = await g.ev(async () => { const w = ms => new Promise(r => setTimeout(r, ms)); const o = window.__foe, e = DUEL.ent;
      NET.ping = 100; netTick(.016); const full = e.hp;
      hurtMob(e, 450, false, 'phys'); netTick(.016); const right = e.hp;          // 450 - 50*.6 = 420 of 2000 = 21%
      o.hp = 79; netTick(.016); netTick(.016); const confirmed = e.hp;            // their update arrives: no double count
      hurtMob(e, 230, false, 'phys'); netTick(.016); const second = e.hp;         // 200 of 2000 = 10%
      await w(700); for (let i = 0; i < 30; i++) netTick(.016); const gaveUp = e.hp; // never confirmed (a miss on their side)
      return { full, right, confirmed, second, gaveUp }; });
    t.ok(h.full === 100 && Math.abs(h.right - 79) < 1, `the HP bar drops at once when you hit (100% → ${h.right.toFixed(1)}%)`);
    t.ok(Math.abs(h.confirmed - 79) < 1, `when their game confirms the hit the bar stays put (${h.confirmed.toFixed(1)}%), no double drop`);
    t.ok(Math.abs(h.second - 69) < 1, `the next hit drops it again at once (${h.second.toFixed(1)}%)`);
    t.ok(h.gaveUp > 78, `a hit their game never confirms is dropped after a moment (back to ${h.gaveUp.toFixed(1)}%)`);
    await g.ev(() => { duelEnd('test over'); NET.others.delete('fake'); });
    t.ok(await g.ev(() => !pvpOn()), 'after the duel, updates go back to the normal pace');
    t.ok(g.page.errors.length === 0, 'no script errors' + g.page.errors.map(e => ': ' + e).join(''));
  } finally { await g.close(); }
};
