// #53 the Kindred Bond: ask, accept, +10% EXP together, travel to each other, and ending it on both sides.
const { player, wait, newRoom } = require('./helpers');
const poll = async (g, fn, arg, ms = 8000) => { const end = Date.now() + ms; while (Date.now() < end) { if (await g.ev(fn, arg)) return true; await wait(200); } return false; };

module.exports = async t => {
  const room = newRoom(), OFFLINE = 'http://127.0.0.1:9';
  const A = await player('Rowan', room, { zone: 'meadow', server: OFFLINE });
  await wait(1500);
  const B = await player('Wren', room, { zone: 'meadow', server: OFFLINE });
  try {
    t.ok(await poll(A, () => NET.others.size === 1), 'two players see each other');
    await A.ev(() => sendChat('/bond Wren'));
    t.ok(await poll(B, () => { const el = document.getElementById('bondAsk'); return el && !el.hidden && /Rowan/.test(el.textContent); }), 'the other player is asked');
    await B.ev(() => document.querySelector('#bondAsk [data-b="yes"]').click());
    t.ok(await poll(A, () => bondName() === 'Wren') && await B.ev(() => bondName() === 'Rowan'), 'accepting bonds them both');
    t.ok(await A.ev(() => /now share a Kindred Bond/.test(document.getElementById('log').textContent)), 'with a message');
    // +10% EXP together
    const exp = await A.ev(() => { activeEvents = () => []; const o = partnerHere(); P.x = o.x + 50; P.y = o.y; P.lv = 60; P.exp = 0; const r = P.rested; gainExp(1000, 0); P.rested = r; const near = P.exp;
      P.x = o.x + 2000; P.lv = 60; P.exp = 0; gainExp(1000, 0); P.rested = r; return { near, far: P.exp }; });
    t.ok(exp.near === Math.round(exp.far * 1.1), `+10% EXP when hunting near each other (${exp.near} vs ${exp.far})`);
    // travel to each other
    const call = await A.ev(() => { enterZone('town'); sendChat('/bondcall'); const o = partnerHere(); return { zone: zoneId, d: Math.hypot(o.x - P.x, o.y - P.y), again: (sendChat('/bondcall'), /more minute/.test(document.getElementById('log').textContent)) }; });
    t.ok(call.zone === 'meadow' && call.d < 140, `/bondcall brings you to your partner (${Math.round(call.d)}px away)`);
    t.ok(call.again, 'and then needs time to recharge');
    t.ok(await A.ev(() => { save(); return JSON.parse(localStorage.getItem(SAVE_KEY)).p.bond.name === 'Wren'; }), 'the bond is saved');
    // a second request while bonded is refused
    t.ok(await B.ev(() => { sendChat('/bond Rowan'); return /already share a Kindred Bond/.test(document.getElementById('log').textContent); }), 'one bond at a time');
    // ending it
    await A.ev(() => sendChat('/unbond'));
    t.ok(await A.ev(() => !bondName()), '/unbond ends it');
    t.ok(await poll(B, () => !bondName() && /ended your Kindred Bond|no longer bonded/.test(document.getElementById('log').textContent)), 'and the partner is told');
    t.ok(A.page.errors.length === 0 && B.page.errors.length === 0, 'no script errors' + [...A.page.errors, ...B.page.errors].map(e => ': ' + e).join(''));
  } finally { await A.close(); await B.close(); }
};
