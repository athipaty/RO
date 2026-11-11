// Stage 6 guild war: an admin opens a war, guilds capture the Ember Crystal by standing in its ring,
// rivals contest it and knock each other back to the gate, and the top guild owns Emberkeep (+10% EXP).
// Runs only against a local copy of the game server (it creates accounts and guilds), started with
//   EMBERVALE_ADMINS=modboss EMBER_GW_CAPTURE_S=4 EMBER_GW_FIRST_MS=86400000
//   EMBER_SERVER=http://localhost:5055 GAME_URL=http://localhost:8080/index.html npm test -- guildwar
const { player, wait, newRoom } = require('./helpers');

async function account(username) {
  const post = (p) => fetch(process.env.EMBER_SERVER + '/api/embervale/' + p, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ username, password: 'secret1' }) }).then(r => r.json());
  let j = await post('register'); if (!j.token) j = await post('login');
  if (!j.token) throw new Error('account failed: ' + JSON.stringify(j)); return j;
}
const login = (g, a) => g.ev((tok, u) => { ACC.token = tok; ACC.username = u; NET.room.relogin(); }, a.token, a.username);
const until = (g, src, ms = 8000) => g.ev(async (src, ms) => { const f = eval(src); const end = Date.now() + ms; while (Date.now() < end) { try { if (f()) return true; } catch (e) {} await new Promise(r => setTimeout(r, 200)); } return false; }, src, ms);
const logHas = (g, s, ms) => until(g, `() => document.getElementById('log').textContent.includes(${JSON.stringify(s)})`, ms);
const found = (g, name) => g.ev(async n => { const w = ms => new Promise(r => setTimeout(r, ms)); for (let i = 0; i < 10 && !GD.g; i++) await w(200); if (GD.g) return GD.g.name; P.gold = 20000; openPanel('guild'); await w(300);
  document.getElementById('gName').value = n; panel.querySelector('[data-act="gcreate"]').click(); for (let i = 0; i < 30 && !GD.g; i++) await w(200); closePanel(); return GD.g && GD.g.name; }, name);
const toRing = (g, dx = 0) => g.ev(d => { P.x = (KEEP_C[0] + .5) * TILE + d; P.y = (KEEP_C[1] + 1.5) * TILE; P.path = []; NET.lastSent = ''; NET.sendT = 0; }, dx);
const away = g => g.ev(() => { P.x = Z.spawn.x; P.y = Z.spawn.y; P.path = []; NET.lastSent = ''; NET.sendT = 0; });

module.exports = async t => {
  if (!process.env.EMBER_SERVER) { t.ok(true, 'skipped (set EMBER_SERVER to run against a local game server)'); return; }
  const room = newRoom(), tag = Math.random().toString(36).slice(2, 6);
  const [aa, ab] = await Promise.all([account('modboss'), account('gwb' + Math.random().toString(36).slice(2, 9))]);
  const A = await player('Rook', room), B = await player('Vale', room), C = await player('Wisp', room);
  try {
    const srv = await Promise.all([A, B, C].map(g => until(g, '() => NET.room && NET.room.server', 10000)));
    if (!srv.every(Boolean)) { t.ok(false, 'every player reached the game server (one fell back to the backup broker; re-run)'); return; }
    await Promise.all([login(A, aa), login(B, ab)]);
    await Promise.all([A, B].map(g => until(g, '() => SOCK.connected && NET.others.size === 2')));
    // a fresh local server: nobody leads a guild yet
    const [ga, gb] = [await found(A, 'Red ' + tag), await found(B, 'Blue ' + tag)];
    t.ok(ga && gb && ga !== gb, `two guilds (${ga}, ${gb})`);

    // the Keep Herald, and an admin opening a war
    const herald = await A.ev(() => { const n = Z.npcs.find(x => x.role === 'keep'); if (!n) return null; openNpc(n); return { name: n.name, kind: panelKind }; });
    t.ok(herald && herald.kind === 'keep' && /Keep Herald/.test(herald.name), 'the Keep Herald in Hearthvale opens the Emberkeep window');
    t.ok(await until(A, `() => /next war starts/.test(panel.textContent) && panel.querySelector('[data-act="gwadmin"][data-arg="start"]')`), 'it shows when the next war starts, and an admin can start one');
    t.ok(await C.ev(() => { openPanel('keep'); const s = panel.textContent; const adm = !!panel.querySelector('[data-act="gwadmin"]'); closePanel(); return /Only guild members/.test(s) && !adm; }), 'a guest is told only guild members fight, and has no admin buttons');
    await A.ev(() => panel.querySelector('[data-act="gwadmin"][data-arg="start"]').click());
    t.ok((await Promise.all([A, B, C].map(g => logHas(g, 'The guild war for Emberkeep has begun')))).every(Boolean), 'everyone hears that the war has begun');
    t.ok(await until(C, `() => { const b = document.getElementById('gwBar'); return b && !b.hidden && /Guild war · 1[45]:/.test(b.textContent); }`), 'a war bar with the time left appears');

    // to the keep; Red takes the crystal
    for (const g of [A, B, C]) await g.ev(() => { openPanel('keep'); panel.querySelector('[data-act="gwgo"]').click(); });
    t.ok((await Promise.all([A, B, C].map(g => g.ev(() => zoneId === 'keep')))).every(Boolean), 'Go to Emberkeep takes them there');
    await toRing(A);
    t.ok(await logHas(B, `${ga} has taken the Ember Crystal!`, 12000), 'a guild alone in the ring takes the crystal');
    t.ok(await until(C, `() => document.getElementById('gwBar').textContent.includes(${JSON.stringify(ga + ' holds the crystal')})`) && await until(A, `() => GW.war.top[0] && GW.war.top[0].pts >= 2`), 'the holder scores points every second');
    t.ok(await A.ev(() => keepLabel()) === ga, 'the crystal shows the holding guild');

    // Blue walks in: contested
    await toRing(B, 40);
    t.ok(await until(A, `() => /Contested/.test(document.getElementById('gwBar').textContent)`), 'a rival guild in the ring contests it');

    // fighting: Vale knocks Rook back to the gate; the guest is not a target
    t.ok(await until(B, '() => GW.ents.size === 1 && [...GW.ents.values()][0].d.name === "Rook"'), 'rival guild members can be attacked in the keep (and the guest cannot)');
    const before = await A.ev(() => ({ x: P.x, y: P.y }));
    await B.ev(() => hurtMob([...GW.ents.values()][0], 99999, true, 'phys'));
    t.ok(await logHas(A, 'Vale knocked you out! You are back at the gate.'), 'a knocked-out player is told');
    t.ok(await A.ev(b => Math.hypot(P.x - Z.spawn.x, P.y - Z.spawn.y) < 5 && Math.hypot(P.x - b.x, P.y - b.y) > 200 && !P.dead && P.hp > 1, before), 'and sent back to the gate, alive');
    t.ok(await logHas(B, `${gb} has taken the Ember Crystal!`, 12000), 'with the ring to themselves, Blue takes the crystal');

    // the admin ends the war: the guild with the most points owns the keep
    await wait(1500);
    const top = await A.ev(() => GW.war.top.map(x => [x.name, x.pts]));
    await A.ev(() => { openPanel('keep'); panel.querySelector('[data-act="gwadmin"][data-arg="end"]').click(); });
    const winner = top[0][0];
    t.ok((await Promise.all([A, B, C].map(g => logHas(g, `The guild war is over. ${winner} holds Emberkeep`)))).every(Boolean), `the top guild wins the keep (${top.map(x => x.join(' ')).join(', ')})`);
    t.ok(await C.ev(() => { const b = document.getElementById('gwBar'); return !b || b.hidden; }), 'the war bar goes away');
    const winG = winner === ga ? A : B, loseG = winner === ga ? B : A;
    // the same player gaining the same EXP with and without the keep's bonus
    const exp = async g => g.ev(() => { const gain = () => { P.lv = 60; P.exp = 0; const r = P.rested; gainExp(1000, 0); P.rested = r; return P.exp; };
      const mine = gwMine(), withB = gain(), o = GW.owner; GW.owner = null; const without = gain(); GW.owner = o; return { mine, ratio: withB / without }; });
    const ew = await exp(winG), el = await exp(loseG);
    t.ok(ew.mine && Math.abs(ew.ratio - 1.1) < .01 && !el.mine && el.ratio === 1, `the owners' members get +10% EXP; others don't (${ew.ratio.toFixed(2)} / ${el.ratio.toFixed(2)})`);
    t.ok(await C.ev(n => keepLabel() === n, winner), 'the crystal keeps the owner\'s name after the war');
    t.ok(await B.ev(async () => { const w = ms => new Promise(r => setTimeout(r, ms)); P.target = null; await w(400); return GW.ents.size === 0; }), 'no more fighting once the war is over');
    for (const g of [A, B, C]) t.ok(g.page.errors.length === 0, 'no script errors' + g.page.errors.map(e => ': ' + e).join(''));
    if (process.env.SHOTS) { await C.ev(() => closePanel()); await C.page.screenshot({ path: process.env.SHOTS + '/keep.png' }); }
  } finally { await Promise.all([A.close(), B.close(), C.close()]); }
};
