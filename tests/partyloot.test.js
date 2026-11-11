// Party loot rule (server): the leader switches between "each their own" and "take turns"; with turns, one drop
// roll per kill goes to each member in turn. Runs only against a local copy of the game server:
//   EMBER_SERVER=http://localhost:5055 GAME_URL=http://localhost:8080/index.html npm test -- partyloot
const { player, wait, newRoom } = require('./helpers');

module.exports = async t => {
  if (!process.env.EMBER_SERVER) { t.ok(true, 'skipped (set EMBER_SERVER to run against a local game server)'); return; }
  const room = newRoom();
  const A = await player('Lootlead', room, { zone: 'meadow' });
  const B = await player('Lootpal', room, { zone: 'meadow' });
  try {
    await wait(3500);
    await A.ev(() => { document.getElementById('onlineBadge').click(); });
    await wait(300);
    await A.ev(() => [...document.querySelectorAll('#whoList .wb button')].find(b => b.textContent === 'Invite').click());
    await wait(1200);
    await B.ev(() => document.getElementById('invYes').click());
    await wait(1500);
    const before = await A.ev(() => ({ loot: SOC.party && SOC.party.loot, btn: !document.getElementById('pLoot').hidden }));
    const bBtn = await B.ev(() => !document.getElementById('pLoot').hidden);
    t.ok(before.loot === 'each' && before.btn && !bBtn, 'a new party starts with each their own loot; only the leader has the loot button');
    await A.ev(() => document.getElementById('pLoot').click());
    await wait(1200);
    const on = await B.ev(() => ({ loot: SOC.party.loot, title: document.querySelector('#partyBox .pt').textContent }));
    t.ok(on.loot === 'turns' && /loot by turns/.test(on.title), `the leader switches to taking turns and everyone sees it ("${on.title}")`);

    // both hit the same monsters; count who gets drops (log lines tell whose turn it was)
    const kills = 4;
    for (let k = 0; k < kills; k++) {
      const i = await A.ev(() => { const m = mobs.find(m => !m.dead && !m.d.boss); P.x = m.x - 30; P.y = m.y; return m.idx; });
      await B.ev(i => { const m = mobs[i]; P.x = m.x - 30; P.y = m.y + 20; }, i);
      await wait(700);
      await B.ev(i => { const m = mobs[i]; if (!m.dead) hurtMob(m, 1, false); }, i);
      await wait(500);
      await A.ev(i => { const m = mobs[i]; for (let n = 0; n < 40 && !m.dead && m.hp > 0; n++) hurtMob(m, 999, false); }, i);
      await wait(1800);
    }
    const logs = g => g.ev(() => [...document.querySelectorAll('#log div')].map(d => d.textContent));
    const la = await logs(A), lb = await logs(B);
    const turnA = la.filter(l => /Your turn: the party's drop/.test(l)).length, otherA = la.filter(l => /Lootpal gets this drop/.test(l)).length;
    const turnB = lb.filter(l => /Your turn: the party's drop/.test(l)).length, otherB = lb.filter(l => /Lootlead gets this drop/.test(l)).length;
    console.log(`   turns: A got ${turnA}, B got ${turnB} (A saw B ${otherA}, B saw A ${otherB})`);
    t.ok(turnA + turnB >= 2 && turnA >= 1 && turnB >= 1, `drops alternate between the two (A ${turnA}, B ${turnB})`);
    t.ok(otherA === turnB && otherB === turnA, 'and each is told when it is the other one\'s turn');
    t.ok(A.page.errors.length === 0 && B.page.errors.length === 0, 'no script errors' + [...A.page.errors, ...B.page.errors].map(e => ': ' + e).join(''));
  } finally { await A.close(); await B.close(); }
};
