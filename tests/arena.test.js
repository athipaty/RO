// Stage 6 arena: queue for a ranked 1v1, get taken to a pit, fight, win or lose rating; leaving forfeits.
// Runs only against a local copy of the game server (it creates accounts), started with short arena timings:
//   EMBER_ARENA_START_MS=5000 EMBER_ARENA_MATCH_MS=40000
//   EMBER_SERVER=http://localhost:5055 GAME_URL=http://localhost:8080/index.html npm test -- arena
const { player, wait, newRoom } = require('./helpers');

async function account(prefix) {
  const username = (prefix + Math.random().toString(36).slice(2, 9)).slice(0, 16);
  const r = await fetch(process.env.EMBER_SERVER + '/api/embervale/register', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ username, password: 'secret1' }) });
  const j = await r.json(); if (!j.token) throw new Error('register failed: ' + JSON.stringify(j)); return j;
}
const login = (g, a) => g.ev((tok, u) => { ACC.token = tok; ACC.username = u; NET.room.relogin(); }, a.token, a.username);
const until = (g, src, ms = 8000) => g.ev(async (src, ms) => { const f = eval(src); const end = Date.now() + ms; while (Date.now() < end) { try { if (f()) return true; } catch (e) {} await new Promise(r => setTimeout(r, 200)); } return false; }, src, ms);
// open the arena window and press Join for a mode once the window has loaded
const join = async (g, mode) => { await g.ev(() => openPanel('arena')); const ok = await until(g, `() => panel.querySelector('[data-act="arjoin"][data-arg="${mode}"]')`); if (ok) await g.ev(m => panel.querySelector(`[data-act="arjoin"][data-arg="${m}"]`).click(), mode); return ok; };
const logHas = (g, s, ms) => until(g, `() => document.getElementById('log').textContent.includes(${JSON.stringify(s)})`, ms);

module.exports = async t => {
  if (!process.env.EMBER_SERVER) { t.ok(true, 'skipped (set EMBER_SERVER to run against a local game server)'); return; }
  const room = newRoom();
  const [aa, ab] = await Promise.all([account('ara'), account('arb')]);
  const A = await player('Ash', room), B = await player('Bryn', room), C = await player('Cole', room);
  try {
    const srv = await Promise.all([A, B, C].map(g => until(g, '() => NET.room && NET.room.server', 10000)));
    if (!srv.every(Boolean)) { t.ok(false, 'every player reached the game server (one fell back to the backup broker; re-run)'); return; }
    await Promise.all([login(A, aa), login(B, ab)]);
    t.ok((await Promise.all([A, B].map(g => until(g, '() => SOCK.connected && NET.others.size === 2')))).every(Boolean), 'two players log in');

    // the Arena Master stands in Hearthvale
    const npc = await A.ev(() => { const n = Z.npcs.find(x => x.role === 'arena'); if (!n) return null; openNpc(n); return { name: n.name, kind: panelKind }; });
    t.ok(npc && npc.kind === 'arena' && /Arena Master/.test(npc.name), 'the Arena Master in Hearthvale opens the arena window');
    t.ok(await until(A, `() => /1000\\s*rating/.test(panel.textContent) && panel.querySelector('[data-act="arjoin"][data-arg="1v1"]')`), 'a new player starts at a rating of 1000');
    t.ok(await A.ev(() => panel.querySelector('[data-act="arjoin"][data-arg="2v2"]').disabled), '2v2 needs a party of two');
    t.ok(await C.ev(() => { openPanel('arena'); const s = panel.textContent; closePanel(); return /need an account/.test(s); }), 'a guest is told ranked matches need an account');

    // queue and match
    await join(A, '1v1');
    t.ok(await logHas(A, 'joined the 1v1 arena queue') && await until(A, `() => /Waiting for a 1v1/.test(panel.textContent)`), 'joining the queue shows that you are waiting');
    await join(B, '1v1');
    t.ok((await Promise.all([A, B].map(g => until(g, '() => AR.match && zoneId === "arena"')))).every(Boolean), 'a second player in the queue starts a match, and both are taken to the arena');
    const pos = await Promise.all([A, B].map(g => g.ev(() => ({ x: P.x, y: P.y, hp: P.hp === S.maxhp, foe: AR.match.foes.map(f => f.name).join() }))));
    t.ok(pos[0].foe === 'Bryn' && pos[1].foe === 'Cole' === false && pos[1].foe === 'Ash' && pos[0].hp && pos[1].hp, 'each sees the other as the opponent, at full health');
    t.ok(Math.abs(pos[0].y - pos[1].y) < 80 && Math.abs(pos[0].x - pos[1].x) > 200 && Math.abs(pos[0].x - pos[1].x) < 450, 'they face each other across the same pit');
    t.ok(await A.ev(() => { const f = AR.match.foes[0].ent; const hp = f.hp; hurtMob(f, 50, false, 'phys'); return now < AR.match.fightAt && f.hp === hp; }), 'hits before FIGHT! do nothing' + JSON.stringify(await A.ev(() => ({ m: !!AR.match, log: document.getElementById('log').textContent.slice(-240) }))));

    // the fight: Ash wins
    t.ok(await until(A, '() => now > AR.match.fightAt + .2', 9000), 'the countdown ends');
    await A.ev(() => { P.x = AR.match.foes[0].ent.x - 40; P.y = AR.match.foes[0].ent.y; });
    await wait(800);
    const hp0 = await B.ev(() => P.hp);
    await A.ev(() => hurtMob(AR.match.foes[0].ent, 30, false, 'phys'));
    t.ok(await until(B, `() => P.hp < ${hp0}`), "a hit lowers the opponent's health on their own screen");
    await A.ev(() => hurtMob(AR.match.foes[0].ent, 99999, true, 'phys'));
    t.ok(await logHas(B, 'knocked you out'), 'falling to 1 HP puts you out');
    t.ok(await logHas(A, 'You won the arena match! Rating 1016 (+16)') && await logHas(B, 'You lost the arena match. Well fought! Rating 984 (-16)'), 'the winner gains rating and the loser drops by the same');
    t.ok(await A.ev(() => !AR.match && P.hp === S.maxhp) && await B.ev(() => !AR.match && P.hp === S.maxhp && !P.dead), 'nobody dies, and both are healed after the match');
    t.ok(await logHas(C, 'Ash won an arena match against Bryn'), 'a win is announced to everyone');

    // the board
    await A.ev(() => openPanel('arena'));
    t.ok(await until(A, `() => { const r = [...panel.querySelectorAll('.artop tbody tr')].map(x => x.textContent.replace(/^[0-9]+/, '')); const a = r.indexOf('Ash10161–0'), b = r.indexOf('Bryn9840–1'); return a >= 0 && b > a; }`), 'the top 20 lists both, highest rating first');

    // leaving during a match forfeits
    await join(A, '1v1');
    await wait(500);
    await join(B, '1v1');
    t.ok((await Promise.all([A, B].map(g => until(g, '() => !!AR.match')))).every(Boolean), 'a rematch starts');
    await B.ev(() => enterZone('town', 'arena'));
    t.ok(await logHas(B, 'You left the arena, so you are out'), 'walking out of the arena puts you out');
    t.ok(await logHas(A, 'Rating 1031 (+15)') && await logHas(B, 'Rating 969 (-15)'), 'and the one who stayed wins (a smaller gain against a lower-rated player)');
    t.ok(await A.ev(() => { openPanel('arena'); return !!panel.querySelector('[data-act="arleave"]'); }), 'Back to Hearthvale is offered in the arena');
    await A.ev(() => panel.querySelector('[data-act="arleave"]').click());
    t.ok(await A.ev(() => zoneId === 'town'), 'and takes you home');
    if (process.env.SHOTS) { await B.ev(() => { enterZone('arena', 'town'); closePanel(); }); await wait(800); await B.page.screenshot({ path: process.env.SHOTS + '/arena.png' }); }
    for (const g of [A, B, C]) t.ok(g.page.errors.length === 0, 'no script errors' + g.page.errors.map(e => ': ' + e).join(''));
  } finally { await Promise.all([A.close(), B.close(), C.close()]); }
};
