// #51 duels: challenge, accept, countdown, hits, first to 1 HP loses, nobody dies, announcement; declining; walking away.
// Uses the public-broker backup path (duels need no server change).
const { player, wait, newRoom } = require('./helpers');

module.exports = async t => {
  const room = newRoom(), OFFLINE = 'http://127.0.0.1:9';
  const A = await player('Ash', room, { server: OFFLINE });
  await wait(2000);
  const B = await player('Birch', room, { server: OFFLINE });
  try {
    await wait(5000);
    t.ok(await A.ev(() => NET.others.size === 1) && await B.ev(() => NET.others.size === 1), 'the two players see each other');
    const spot = await A.ev(() => ({ x: P.x, y: P.y }));
    await B.ev(s => { P.x = s.x + 50; P.y = s.y; }, spot);
    await wait(1200);

    // decline first
    await A.ev(() => sendChat('/duel Birch'));
    await wait(2500);
    t.ok(await B.ev(() => { const el = document.getElementById('duelAsk'); return el && !el.hidden && /Ash/.test(el.textContent); }), 'the challenged player sees the challenge');
    await B.ev(() => document.querySelector('#duelAsk [data-d="no"]').click());
    await wait(2500);
    t.ok(/Birch declined the duel/.test(await A.ev(() => document.getElementById('log').textContent)) && await A.ev(() => !DUEL), 'declining is reported and no duel starts');

    // accept
    await wait(8000); // challenge cooldown
    await A.ev(() => sendChat('/duel Birch'));
    await wait(2500);
    await B.ev(() => document.querySelector('#duelAsk [data-d="yes"]').click());
    await wait(2000);
    t.ok(await A.ev(() => !!DUEL) && await B.ev(() => !!DUEL), 'accepting starts the duel for both');
    t.ok(await A.ev(() => { const e = DUEL.ent; dealPhys(e, 1, { sure: true }); return /Not yet/.test(texts.map(x => x.txt).join()); }), 'nobody can hit during the countdown');
    await wait(2500);
    t.ok(await A.ev(() => P.target && P.target.pvp && /player/.test(document.getElementById('tLv').textContent)), 'after FIGHT! the opponent is targeted and shown in the monster box as a player');
    const hp0 = await B.ev(() => { P.st.vit = 1; S = computeStats(); P.hp = S.maxhp; return P.hp; });
    await A.ev(() => { P.st.str = 60; S = computeStats(); const e = DUEL.ent; for (let i = 0; i < 2; i++) dealPhys(e, 1, { sure: true }); });
    await wait(2500);
    const hp1 = await B.ev(() => P.hp);
    t.ok(hp1 < hp0 && hp1 >= 1, `hits land on the opponent (HP ${hp0} → ${Math.round(hp1)})`);
    await A.ev(async () => { const w = ms => new Promise(r => setTimeout(r, ms)); for (let i = 0; i < 12 && DUEL; i++) { dealPhys(DUEL.ent, 3, { sure: true }); await w(400); } });
    await wait(2500);
    const end = await B.ev(() => ({ duel: !!DUEL, hp: P.hp, dead: P.dead, log: document.getElementById('log').textContent }));
    t.ok(!end.duel && end.hp >= 1 && end.hp < 4 && !end.dead && /Ash won the duel/.test(end.log), 'the loser stops at 1 HP, is not killed, and is told');
    t.ok(await A.ev(() => !DUEL && /You won the duel against Birch/.test(document.getElementById('log').textContent)), 'the winner is told');
    t.ok(/Ash won a duel against Birch/.test(end.log), 'the result is announced to everyone');

    // walking away ends it
    await wait(8000);
    await A.ev(() => sendChat('/duel Birch')); await wait(2500);
    await B.ev(() => document.querySelector('#duelAsk [data-d="yes"]').click()); await wait(1500);
    await B.ev(s => { P.x = s.x + 1100; P.y = s.y; }, spot);
    await wait(8500);
    t.ok(await A.ev(() => !DUEL) && await B.ev(() => !DUEL), 'moving far apart for 5 seconds ends the duel');
    t.ok(A.page.errors.length === 0 && B.page.errors.length === 0, 'no script errors' + [...A.page.errors, ...B.page.errors].map(e => ': ' + e).join(''));
  } finally { await A.close(); await B.close(); }
};
