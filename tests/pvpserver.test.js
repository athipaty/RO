// Player fights checked by the game server: hits go through the server, which passes on only real ones.
// Runs only against a local copy of the server:
//   EMBER_SERVER=http://localhost:5055 GAME_URL=http://localhost:8080/index.html npm test -- pvpserver
const { player, wait, newRoom } = require('./helpers');

module.exports = async t => {
  if (!process.env.EMBER_SERVER) { t.ok(true, 'skipped (set EMBER_SERVER to run against a local game server)'); return; }
  const room = newRoom();
  const A = await player('Ash', room), B = await player('Birch', room), C = await player('Cedar', room);
  try {
    await wait(3500);
    const spot = await A.ev(() => ({ x: P.x, y: P.y }));
    for (const [g, dx] of [[B, 60], [C, -60]]) await g.ev((s, dx) => { P.x = s.x + dx; P.y = s.y; P.path = []; }, spot, dx);
    await wait(1500);
    const info = await A.ev(() => { const b = [...NET.others.values()].find(o => o.n === 'Birch'); return { on: pvpSrvOn(), pv: b && b.pv, mh: b && b.mh, df: b && b.df }; });
    t.ok(info.on, 'the game server offers checked player fights (pvpReady)');
    t.ok(info.pv === 1, 'other players on this version say so in their presence (pv)');
    t.ok(info.mh > 0 && info.df >= 0, `their max HP and DEF arrive with them (max HP ${info.mh}), for the instant HP bar`);

    // a duel between Ash and Birch
    await A.ev(() => sendChat('/duel Birch')); await wait(2000);
    await B.ev(() => document.querySelector('#duelAsk [data-d="yes"]').click()); await wait(4500); // countdown
    t.ok(await A.ev(() => !!DUEL && now >= DUEL.fightAt) && await B.ev(() => !!DUEL), 'the duel starts');
    // the duel targets the opponent when it starts; stop Ash's own auto-attacks so every hit below is one the test sent
    await A.ev(() => { P.target = null; P.queued = null; const pick = mobAt; mobAt = () => null; window.__noAuto = setInterval(() => { P.target = null; }, 50); });
    await B.ev(() => { const cs = computeStats; computeStats = function () { const s = cs.apply(this, arguments); s.maxhp = 1e6; return s; }; S = computeStats(); P.hp = 1e6;
      const ph = pvpHurt; window.__dmg = []; pvpHurt = function (m) { const a = P.hp; ph(m); __dmg.push(a - P.hp); }; });
    const hpB = () => B.ev(() => P.hp), hurtB = () => B.ev(() => P.hurtT || 0);

    // 1. a normal hit goes through the server and lands
    let u0, u1, h0 = await hpB(); u0 = await hurtB();
    const sentDirect = await A.ev(() => { const n = NET.dl.filter(e => e.k === 'hit').length; hurtMob(DUEL.ent, 400, false, 'phys'); return NET.dl.filter(e => e.k === 'hit').length - n; });
    await wait(800); let h1 = await hpB(); u1 = await hurtB();
    t.ok(sentDirect === 0, 'the hit is sent to the server, not in presence');
    t.ok(h0 - h1 > 0 && h0 - h1 <= 400, `the hit lands on Birch (${Math.round(h0 - h1)} damage after DEF)`);

    // 2. a hit sent straight to Birch in presence (skipping the server) is ignored
    h0 = await hpB(); u0 = await hurtB();
    await A.ev(() => { const b = [...NET.others.values()].find(o => o.n === 'Birch'); NET.dl = [...NET.dl, { i: ++NET.dlId, to: b.id, k: 'hit', d: 5000, c: 0 }]; NET.lastSent = ''; NET.sendT = 0; });
    await wait(1200); h1 = await hpB(); u1 = await hurtB();
    t.ok(u1 === u0, 'a hit that skips the server is ignored');

    // 3. a huge hit is capped for the attacker's level
    h0 = await hpB(); u0 = await hurtB();
    const lv = await A.ev(() => { const b = [...NET.others.values()].find(o => o.n === 'Birch'); PVPS.sock.emit('pvpHit', { to: b.peer, k: 'hit', d: 9e9, c: 0 }); return P.lv; });
    await wait(800); const big = await B.ev(() => __dmg[__dmg.length - 1]);
    t.ok(big > 0 && big <= 400 + lv * 150, `a huge hit is cut to the level cap (${Math.round(big)} ≤ ${400 + lv * 150})`);

    // 4. Cedar is not in the duel: their hits on Birch are refused
    h0 = await hpB(); u0 = await hurtB();
    await C.ev(() => { const b = [...NET.others.values()].find(o => o.n === 'Birch'); PVPS.sock.emit('pvpHit', { to: b.peer, k: 'hit', d: 300, c: 0 }); });
    await wait(800); h1 = await hpB(); u1 = await hurtB();
    t.ok(u1 === u0, 'a player who is not in the fight cannot hurt the duellists');

    // 5. too far away: refused
    await A.ev(() => { P.x += 900; P.path = []; NET.lastSent = ''; NET.sendT = 0; }); await wait(900);
    h0 = await hpB(); u0 = await hurtB();
    await A.ev(() => { const b = [...NET.others.values()].find(o => o.n === 'Birch'); PVPS.sock.emit('pvpHit', { to: b.peer, k: 'hit', d: 300, c: 0 }); });
    await wait(800); h1 = await hpB(); u1 = await hurtB();
    t.ok(u1 === u0, 'a hit from too far away is refused');
    await A.ev(() => { P.x -= 900; P.path = []; NET.lastSent = ''; NET.sendT = 0; }); await wait(900);

    // 6. far too many hits at once: only a burst's worth gets through
    h0 = await hpB(); u0 = await hurtB();
    // counted as hits that reached Birch's game (since v1.50.0 the HP lost is capped per attacker, so HP cannot count them)
    await B.ev(() => { window.__hits = 0; const p = pvpTaken; pvpTaken = function () { window.__hits++; return p.apply(this, arguments); }; });
    await A.ev(() => { const b = [...NET.others.values()].find(o => o.n === 'Birch'); for (let i = 0; i < 60; i++) PVPS.sock.emit('pvpHit', { to: b.peer, k: 'hit', d: 100, c: 0 }); });
    await wait(1200); h1 = await hpB(); u1 = await hurtB();
    const landed = await B.ev(() => window.__hits);
    t.ok(landed >= 10 && landed <= 16, `60 hits sent at once: only ${landed} get through`);

    // 7. an opponent on an older game (no pv in presence): hits go the old way, in presence, and still land
    await B.ev(() => { PVPS.on = false; NET.lastSent = ''; NET.sendT = 0; }); await wait(1200);
    u0 = await hurtB();
    const old = await A.ev(() => { const b = [...NET.others.values()].find(o => o.n === 'Birch'); const n = NET.dl.filter(e => e.k === 'hit').length; hurtMob(DUEL.ent, 300, false, 'phys'); return { pv: b.pv, direct: NET.dl.filter(e => e.k === 'hit').length - n }; });
    await wait(1500); u1 = await hurtB();
    t.ok(old.pv === 0 && old.direct === 1, 'against an older game, the hit travels the old way (in presence)');
    t.ok(u1 > u0, 'and it still lands');
    await B.ev(() => { PVPS.on = true; NET.lastSent = ''; NET.sendT = 0; }); await wait(1200);

    // 7. the duel ends: hits stop counting
    await A.ev(() => duelEnd('test over')); await wait(600);
    h0 = await hpB(); u0 = await hurtB();
    await A.ev(() => { const b = [...NET.others.values()].find(o => o.n === 'Birch'); PVPS.sock.emit('pvpHit', { to: b.peer, k: 'hit', d: 300, c: 0 }); });
    await wait(800); h1 = await hpB(); u1 = await hurtB();
    t.ok(u1 === u0, 'after the duel ends, hits are refused');
    for (const g of [A, B, C]) t.ok(g.page.errors.length === 0, 'no script errors' + g.page.errors.map(e => ': ' + e).join(''));
  } finally { await A.close(); await B.close(); await C.close(); }
};
