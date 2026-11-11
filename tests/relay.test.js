// Server presence relay: full updates within a region, slim and at most ~1/s to the rest of the channel,
// chat and region changes at once, and a full catch-up when you enter a region. Local server only:
//   EMBER_SERVER=http://localhost:5055 GAME_URL=http://localhost:8080/index.html npm test -- relay
const { player, wait, newRoom } = require('./helpers');

module.exports = async t => {
  if (!process.env.EMBER_SERVER) { t.ok(true, 'skipped (set EMBER_SERVER to run against a local game server)'); return; }
  const room = newRoom();
  const A = await player('RelayA', room, { zone: 'meadow' });
  const B = await player('RelayB', room, { zone: 'meadow' });
  const C = await player('RelayC', room, { zone: 'town' });
  try {
    await wait(4000);
    const seeAll = g => g.ev(() => ['RelayA', 'RelayB', 'RelayC'].filter(n => n !== P.name).every(n => [...NET.others.values()].some(o => o.n === n)));
    t.ok(await seeAll(A) && await seeAll(B) && await seeAll(C), 'everyone in the channel sees everyone (also across regions)');
    // count how many updates about A arrive at B (same region) and C (town) while A walks and fights
    const watch = g => g.ev(() => { window.__n = 0; window.__hx = 0; const f = window.ingest; window.__f = f;
      window.ingest = p => { if (p && p.presence && p.presence.n === 'RelayA') { window.__n++; if (p.presence.hx) window.__hx++; } return f(p); }; });
    const count = g => g.ev(() => { window.ingest = window.__f; return { n: window.__n, hx: window.__hx }; });
    await watch(B); await watch(C);
    await A.ev(async () => { const w = ms => new Promise(r => setTimeout(r, ms)); const m = mobs.find(m => !m.dead); const x0 = P.x, t0 = Date.now();
      while (Date.now() - t0 < 3000) { P.x = x0 + (Date.now() - t0) / 1000 * 100; P.moving = true; if (m && !m.dead) sendHit(m, 1, 0); await w(50); } P.moving = false; });
    await wait(1200);
    const nb = await count(B), nc = await count(C);
    console.log(`   updates about A in 3s: same region ${nb.n}, other region ${nc.n}`);
    t.ok(nb.n >= 12 && nb.hx >= 1, `a player in the same region gets every update, hits included (${nb.n})`);
    t.ok(nc.n >= 2 && nc.n <= 6 && nc.hx === 0, `a player in another region gets a slim copy about once a second (${nc.n}, no hits)`);
    // chat reaches the other region at once
    await A.ev(() => sendChat('hello from the meadow'));
    await wait(900);
    t.ok(await C.ev(() => [...document.querySelectorAll('#log div')].some(d => /hello from the meadow/.test(d.textContent))), 'chat still reaches players in other regions right away');
    // B drops loot and stands still; C walks into the meadow and sees it without B sending anything new
    await B.ev(() => { dropLoot({ x: P.x + 60, y: P.y + 20 }, 'pelt'); });
    await wait(1500);
    await C.ev(() => enterZone('meadow'));
    await wait(1500);
    const cat = await C.ev(() => { const o = [...NET.others.values()].find(o => o.n === 'RelayB'); return o && { z: o.z, loot: (typeof ghostLoot === 'function' ? ghostLoot(o) : []).length }; });
    t.ok(cat && cat.z === 'meadow' && cat.loot === 1, `entering a region catches you up on players already there (B's loot: ${cat && cat.loot})`);
    t.ok([A, B, C].every(g => g.page.errors.length === 0), 'no script errors' + [A, B, C].flatMap(g => g.page.errors).map(e => ': ' + e).join(''));
  } finally { await A.close(); await B.close(); await C.close(); }
};
