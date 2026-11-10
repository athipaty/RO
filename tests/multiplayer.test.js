// Two separate browsers in the same private room: they see each other, share monsters,
// get rewarded for their own kills, get attacked by the shared monsters, and survive the host leaving.
const { player, wait, newRoom } = require('./helpers');

module.exports = async t => {
  const room = newRoom();
  const A = await player('Alpha', room, { zone: 'meadow' });
  await wait(2500);
  const B = await player('Beta', room);
  try {
    await B.ev(() => enterZone('meadow'));
    await wait(5000);
    t.ok(await A.ev(() => document.getElementById('onlineBadge').textContent.includes('2 online')), 'Alpha sees 2 players online');
    t.ok(await B.ev(() => document.getElementById('onlineBadge').textContent.includes('2 online')), 'Beta sees 2 players online');
    t.ok(await A.ev(() => !zoneHost()) && await B.ev(() => !!zoneHost()), 'first player in the region hosts the monsters');
    const lookA = await A.ev(() => JSON.stringify(lookCode(P.look)));
    t.ok(await B.ev(l => { const o = [...NET.others.values()][0]; return o && JSON.stringify(lookCode(o.look)) === l; }, lookA), "Beta sees Alpha's chosen look");

    const pa = await A.ev(() => mobs.map(m => [m.x, m.y]));
    const pb = await B.ev(() => mobs.map(m => [m.x, m.y]));
    const off = Math.max(...pa.map((q, i) => Math.hypot(q[0] - pb[i][0], q[1] - pb[i][1])));
    t.ok(off < 40, `monsters are in the same places on both screens (largest gap ${Math.round(off)}px)`);

    const exp0 = await B.ev(() => P.exp + P.lv * 1e6);
    await B.ev(() => hurtMob(mobs[0], 99999, false, 'phys'));
    await wait(2500);
    t.ok(await A.ev(() => mobs[0].dead) && await B.ev(() => mobs[0].dead), "Beta's kill removes the monster for both players");
    t.ok((await B.ev(() => P.exp + P.lv * 1e6)) > exp0, 'Beta gets the EXP for the kill');
    t.ok(await A.ev(() => P.exp === 0 && P.lv === 1), 'Alpha, who did not hit it, gets nothing');
    t.ok(await B.ev(() => loot.length > 0), "Beta's drops land on Beta's ground");

    await A.ev(() => { P.x = Z.spawn.x; P.y = Z.spawn.y; });
    await B.ev(() => { const m = mobs[1]; P.x = m.x + 20; P.y = m.y; S = computeStats(); P.hp = S.maxhp; hurtMob(m, 1, false, 'phys'); });
    const hp0 = await B.ev(() => P.hp);
    await wait(6000);
    t.ok((await B.ev(() => P.hp)) < hp0, 'a provoked monster chases and hits the nearest player (Beta)');

    await A.close(); await wait(20000);
    const before = await B.ev(() => mobs.map(m => m.x + m.y).join());
    await wait(3000);
    t.ok(await B.ev(() => !zoneHost()), 'when the host leaves, the other player takes over');
    t.ok(before !== await B.ev(() => mobs.map(m => m.x + m.y).join()), 'monsters keep moving after the takeover');
    t.ok(B.page.errors.length === 0, 'no script errors');
  } finally { await A.close().catch(() => {}); await B.close(); }
};
