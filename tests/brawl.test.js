// v1.49.1: the open arena (no queue, up to 20 fighters), knockdowns, and no auto mode in player fights.
// Needs a local game server:  EMBER_SERVER=http://localhost:5055 GAME_URL=http://localhost:8080/index.html
const { player, wait, newRoom } = require('./helpers');

module.exports = async t => {
  if (!process.env.EMBER_SERVER) { t.ok(true, 'skipped (set EMBER_SERVER to run against a local game server)'); return; }
  const room = newRoom();
  const A = await player('Brawla', room), B = await player('Brawlb', room);
  try {
    await wait(5000);
    await A.ev(() => { openPanel('arena'); PANEL_ACTS.brjoin(); });
    await wait(1500);
    await B.ev(() => { openPanel('arena'); PANEL_ACTS.brjoin(); });
    await wait(2500);
    const s = await A.ev(() => ({ z: zoneId, in: BRW.in, n: BRW.n }));
    const s2 = await B.ev(() => ({ z: zoneId, in: BRW.in, n: BRW.n }));
    t.ok(s.z === 'arena' && s.in && s2.z === 'arena' && s2.in && s2.n === 2, 'no queue: both walk straight into the arena (' + JSON.stringify([s, s2]) + ')');

    // auto mode cannot stay on in the arena
    await A.ev(() => { P.auto = true; });
    await wait(500);
    t.ok(await A.ev(() => !P.auto), 'auto mode is switched off in the arena');

    // B stands next to A; A knocks B down
    const spot = await A.ev(() => ({ x: P.x, y: P.y }));
    await B.ev(p => { P.x = p.x + 40; P.y = p.y; BRW.safeUntil = 0; }, spot);
    await wait(2000);
    // the Attack button goes for the nearest fighter (the arena is a safe area, where it used to refuse)
    const hp0 = await B.ev(() => { window.__hn = 0; const h = hurtNum; hurtNum = function () { window.__hn++; return h.apply(this, arguments); }; return P.hp; });
    await A.ev(() => { P.target = null; document.getElementById('atkBtn').click(); });
    t.ok(await A.ev(() => !!(P.target && P.target.brawl)), 'the Attack button targets the nearest fighter');
    await wait(3000);
    t.ok(await B.ev(h => P.hp < h, hp0), 'and the hero attacks them');
    await wait(2500);
    t.ok(await B.ev(() => window.__hn === 1), 'one press is one hit: no more swings until the next press (' + await B.ev(() => window.__hn) + ' hits)');
    await A.ev(() => document.getElementById('atkBtn').click());
    await wait(2500);
    t.ok(await B.ev(() => window.__hn === 2), 'the next press gives the next hit');
    // a target skill with nothing targeted picks the nearest fighter too
    t.ok(await A.ev(() => { P.target = null; const id = Object.keys(SKILLS).find(k => SKILLS[k].kind === 'target'); useSkill(id); return !!(P.target && P.target.brawl); }), 'a target skill with nothing selected goes for the nearest fighter');
    // since v1.50.0 one hit takes at most 30% of max HP, so the knockdown below starts from low HP
    await B.ev(() => { S = computeStats(); P.hp = Math.ceil(S.maxhp * .2); });
    await wait(500);
    const hit = await A.ev(() => { const e = [...BRW.ents.values()][0]; if (!e) return 'no stand-in'; P.target = e; const before = e.hp; hurtMob(e, 5000, false, 'phys'); netTick(0); window.__pred = e.hp < before && e.hp <= 5; return 'ok'; });
    t.ok(await A.ev(() => window.__pred), 'my hit shows on their HP bar at once, before their game confirms it');
    await wait(2000);
    const b1 = await B.ev(() => ({ down: pvpDowned(), dead: P.dead, falls: BRW.falls }));
    const a1 = await A.ev(() => ({ kos: BRW.kos, gone: [...BRW.ents.values()].every(e => e.dead) }));
    t.ok(hit === 'ok' && b1.down && !b1.dead && b1.falls === 1, 'a hit to 1 HP knocks the fighter down, not dead (' + hit + ' ' + JSON.stringify(b1) + ')');
    t.ok(a1.kos === 1 && a1.gone, 'the attacker is told of the knockdown and cannot keep hitting a fighter who is down ' + JSON.stringify(a1));
    await wait(4000);
    t.ok(await B.ev(() => !pvpDowned() && zoneId === 'arena' && P.hp === S.maxhp), 'they stand up again in the arena at full HP');

    // leaving gives the place back
    await A.ev(() => PANEL_ACTS.brleave());
    await wait(1500);
    await B.ev(() => { BRW.n = 0; BRW.sock.emit('brawlInfo'); });
    await wait(1000);
    t.ok(await A.ev(() => zoneId === 'town' && !BRW.in) && await B.ev(() => BRW.n === 1), 'leaving goes back to Hearthvale and frees the place');
    t.ok(A.page.errors.length === 0 && B.page.errors.length === 0, 'no script errors' + [...A.page.errors, ...B.page.errors].map(e => ': ' + e).join(''));
  } finally { await A.close(); await B.close(); }
};
