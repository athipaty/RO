// Follow a party member: walk behind them, follow them through a gate, stop when you click/move/attack.
const { player, wait, newRoom } = require('./helpers');

module.exports = async t => {
  const room = newRoom(), srv = process.env.EMBER_SERVER ? undefined : 'http://127.0.0.1:9';
  const A = await player('Leader', room, { zone: 'meadow', server: srv });
  await wait(2000);
  const B = await player('Tagalong', room, { zone: 'meadow', server: srv });
  try {
    await wait(5000);
    const party = g => g.ev(() => { const [peer] = [...NET.others.keys()]; SOC.party = { id: 'p1', leader: peer, mode: 'share', members: [{ peer, name: 'x' }, { peer: 'me', name: 'me' }] }; renderParty(); return peer; });
    await party(A); await party(B);
    // clear the meadow so nothing interrupts; put both near the west side
    for (const g of [A, B]) await g.ev(() => { for (const m of mobs) { m.dead = true; m.respawnAt = now + 1e9; } P.st.vit = 99; S = computeStats(); P.hp = S.maxhp; });
    const start = await A.ev(() => { P.x = Z.spawn.x + 60; P.y = Z.spawn.y; return { x: P.x, y: P.y }; });
    await B.ev(s => { P.x = s.x - 80; P.y = s.y; }, start);
    await wait(1500);
    t.ok(await B.ev(() => { const b = [...document.querySelectorAll('#partyBox button')].find(b => b.textContent === 'Follow'); if (!b) return false; b.click(); return !!FOL; }), 'the party box has a Follow button that starts following');
    // the leader walks east along the road
    await A.ev(async () => { const w = ms => new Promise(r => setTimeout(r, ms)); pathTo(P.x + 420, P.y, true); for (let i = 0; i < 60 && P.path.length; i++) await w(100); });
    await wait(3500);
    const near = await B.ev(() => { const o = [...NET.others.values()][0]; return Math.round(Math.hypot(o.x - P.x, o.y - P.y)); });
    t.ok(near < 110, `the follower walked after the leader and stopped close behind (${near}px away)`);
    // the leader goes through the east gate into the woods
    await A.ev(async () => { const w = ms => new Promise(r => setTimeout(r, ms)); const pt = Z.portals.find(p => p.to === 'woods'); P.x = pt.x - 300; P.y = pt.y; await w(300); pathTo(pt.x, pt.y, true); for (let i = 0; i < 80 && zoneId === 'meadow'; i++) await w(100); });
    let z = 'meadow';
    for (let i = 0; i < 40 && z !== 'woods'; i++) { await wait(500); z = await B.ev(() => zoneId); }
    t.ok(z === 'woods', 'when the leader goes through a gate, the follower takes the same gate');
    t.ok(await B.ev(() => !!FOL), 'and keeps following in the new region');
    await B.ev(() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'w' })));
    t.ok(await B.ev(() => !FOL && /stopped following/.test(document.getElementById('log').textContent)), 'moving with the keys stops following');
    t.ok(await B.ev(() => { sendChat('/follow Leader'); const on = !!FOL; sendChat('/follow'); return on && !FOL; }), '/follow Name starts and /follow stops');
    t.ok(A.page.errors.length === 0 && B.page.errors.length === 0, 'no script errors' + [...A.page.errors, ...B.page.errors].map(e => ': ' + e).join(''));
  } finally { await A.close(); await B.close(); }
};
