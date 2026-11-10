// #40 world bosses. Runs only against a local game server started with short boss timers, e.g.
//   EMBER_WB_FIRST_MS=4000 EMBER_WB_EVERY_MS=600000 EMBER_WB_LIFE_MS=600000 (server)
//   EMBER_SERVER=http://localhost:5055 GAME_URL=http://localhost:8080/index.html npm test -- serverboss
const { player, wait, newRoom } = require('./helpers');

module.exports = async t => {
  if (!process.env.EMBER_SERVER) { t.ok(true, 'skipped (set EMBER_SERVER to run against a local game server)'); return; }
  const room = newRoom();
  const A = await player('BossA', room, { zone: 'town' }), B = await player('BossB', room, { zone: 'town' });
  try {
    let wb = null;
    for (let i = 0; i < 30 && !wb; i++) { await wait(500); wb = await A.ev(() => NET.wb); }
    t.ok(wb && MOBS_OK(wb), `the server announces a world boss to the channel (${wb && wb.b} in ${wb && wb.z})`);
    const msg = await B.ev(() => ({ wb: NET.wb, log: document.getElementById('log').textContent, hud: document.getElementById('wbT').textContent }));
    t.ok(msg.wb && /has appeared/.test(msg.log) && /m$/.test(msg.hud), 'everyone in the channel gets the announcement and a status line with the time left');

    await A.ev(z => { enterZone(z); }, wb.z); await B.ev(z => { enterZone(z); }, wb.z);
    await wait(3000);
    const seen = await Promise.all([A, B].map(g => g.ev(() => wbMob && { x: wbMob.x, y: wbMob.y, id: wbMob.d.id, i: mobs.indexOf(wbMob), base: mobs.length - 1, sync: serverSim() })));
    t.ok(seen[0] && seen[1] && seen[0].id === wb.b && seen[0].i === seen[0].base && seen[0].sync, 'both players see the boss in its region, after the regular monsters');
    t.ok(seen[0] && seen[1] && Math.hypot(seen[0].x - seen[1].x, seen[0].y - seen[1].y) < 60, 'and in the same place');
    t.ok(await A.ev(() => mobs.slice(0, -1).every(m => !m.d.world) && mobs.filter(m => !m.dead).length > 5), 'the regular monsters still sync alongside it');

    const C = await player('BossC', room, { zone: 'town' });
    try { await wait(2500); t.ok(await C.ev(() => !!NET.wb && /roaming/.test(document.getElementById('log').textContent)), 'a player who logs in later is told the boss is out'); }
    finally { await C.close(); }

    // A does most of the damage, B a little: A is the MVP
    for (const g of [A, B]) await g.ev(() => { P.lv = 99; P.st.vit = 99; S = computeStats(); P.hp = S.maxhp; });
    const hitLoop = (g, dmg, n) => g.ev(async (dmg, n) => { const w = ms => new Promise(r => setTimeout(r, ms));
      for (let k = 0; k < n && wbMob && !wbMob.dead; k++) { P.x = wbMob.x - 30; P.y = wbMob.y; P.hp = S.maxhp; P.dead = false; wbMob.myDmg = (wbMob.myDmg || 0) + dmg; sendHit(wbMob, dmg, 0); await w(150); } }, dmg, n);
    await B.ev(() => { P.x = wbMob.x + 30; P.y = wbMob.y; });
    await Promise.all([hitLoop(B, 500, 4), hitLoop(A, 15250, 60)]);
    await wait(2500);
    const ra = await A.ev(() => ({ log: document.getElementById('log').textContent, dead: !wbMob || wbMob.dead, loot: loot.map(l => l.id), wb: NET.wb }));
    const rb = await B.ev(() => ({ log: document.getElementById('log').textContent, loot: loot.map(l => l.id) }));
    const prize = wb.b === 'thornmother' ? 'thorncrown' : wb.b === 'dunetyrant' ? 'tyranthelm' : 'rimehalo';
    t.ok(ra.dead && !ra.wb, 'the boss falls and the announcement clears');
    t.ok(/You are the MVP/.test(ra.log) && ra.loot.includes(prize), `the top damage dealer is the MVP and gets the ${prize}`);
    t.ok(/MVP: BossA/.test(rb.log) && !rb.loot.includes(prize), 'the other player is told who the MVP was, and gets normal loot only');
    t.ok(rb.loot.length > 0, 'everyone who helped gets loot');
    await wait(9000);
    t.ok(await A.ev(() => !wbMob && !mobs.some(m => m.d.world)), 'the fallen boss is cleared from the region afterwards');
    t.ok(A.page.errors.length === 0 && B.page.errors.length === 0, 'no script errors' + [...A.page.errors, ...B.page.errors].map(e => ': ' + e).join(''));
  } finally { await A.close(); await B.close(); }
};
function MOBS_OK(wb) { return ['thornmother', 'dunetyrant', 'rimeheart'].includes(wb.b) && ['woods', 'dunes', 'frost'].includes(wb.z); }
