// Stage 7 moderation: report a player, admin reviews (with chat evidence), mute, kick and ban.
// Runs only against a local copy of the game server (it creates accounts), started with EMBERVALE_ADMINS=modboss:
//   EMBER_SERVER=http://localhost:5055 GAME_URL=http://localhost:8080/index.html npm test -- moderation
const { player, wait, newRoom } = require('./helpers');

async function account(username) {
  const post = (p) => fetch(process.env.EMBER_SERVER + '/api/embervale/' + p, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ username, password: 'secret1' }) }).then(r => r.json());
  let j = await post('register'); if (!j.token) j = await post('login');
  if (!j.token) throw new Error('account failed: ' + JSON.stringify(j)); return j;
}
const login = (g, a) => g.ev((tok, u) => { ACC.token = tok; ACC.username = u; NET.room.relogin(); }, a.token, a.username);
const until = (g, fn, ms = 8000) => g.ev(async (src, ms) => { const f = eval(src); const end = Date.now() + ms; while (Date.now() < end) { try { if (f()) return true; } catch (e) {} await new Promise(r => setTimeout(r, 200)); } return false; }, fn.toString(), ms);
const logHas = (g, s) => until(g, `() => document.getElementById('log').textContent.includes(${JSON.stringify(s)})`);

module.exports = async t => {
  if (!process.env.EMBER_SERVER) { t.ok(true, 'skipped (set EMBER_SERVER to run against a local game server)'); return; }
  const room = newRoom();
  const [aa, ab] = await Promise.all([account('modboss'), account('troll' + Math.random().toString(36).slice(2, 8))]);
  const A = await player('Warden', room, { zone: 'meadow' }), B = await player('Troll', room, { zone: 'meadow' }), C = await player('Pip', room, { zone: 'meadow' });
  try {
    const srv = await Promise.all([A, B, C].map(g => until(g, () => NET.room && NET.room.server, 10000)));
    if (!srv.every(Boolean)) { t.ok(false, 'every player reached the game server (one fell back to the backup broker; re-run)'); return; }
    await Promise.all([login(A, aa), login(B, ab)]);
    t.ok((await Promise.all([A, B].map(g => until(g, () => SOCK.connected && NET.others.size === 2)))).every(Boolean), 'the admin and the troll reconnect with their accounts');
    t.ok(await until(A, () => MOD.admin && document.getElementById('adminBtn')), 'the admin account gets an Admin button');
    t.ok(await C.ev(() => !MOD.admin && !document.getElementById('adminBtn')), 'other players do not');
    // start clean: close reports left over from an earlier run against the same local server
    await A.ev(async () => { const w = ms => new Promise(r => setTimeout(r, ms)); SOCK.emit('modList'); for (let i = 0; i < 20 && !MOD.loaded; i++) await w(200);
      for (const r of MOD.reports) SOCK.emit('modClose', { id: r.id, action: 'test cleanup' }); await w(500); MOD.loaded = false; });

    await B.ev(() => { sendChat('you all stink'); soc('whisper', { to: 'Pip', text: 'secret insult' }); soc('whisper', { to: 'Warden', text: 'not for pip' }); });
    t.ok(await logHas(C, 'you all stink') && await logHas(C, 'secret insult'), 'the troll chats and whispers');

    // Pip reports Troll from the online list
    const rep = await C.ev(async () => { updateWho(); const row = [...document.querySelectorAll('#whoList .who')].find(d => d.textContent.includes('Troll'));
      const b = row && [...row.querySelectorAll('button')].find(x => x.textContent === 'Report'); if (!b) return 'no button'; b.click();
      const k = panelKind; panel.querySelector('[data-act="rptreason"][data-arg="abuse"]').click(); document.getElementById('rptNote').value = 'rude to everyone';
      panel.querySelector('[data-act="rptsend"]').click(); return k; });
    t.ok(rep === 'report', 'Report on the online list opens the report window');
    t.ok(await logHas(C, 'was sent to the admins'), 'the reporter is thanked');
    t.ok(await C.ev(() => { soc('report', { peer: findPeerByName('Troll'), reason: 'spam' }); return true; }) && await logHas(C, 'You already reported Troll'), 'the same player cannot be reported twice in a row');
    t.ok(await logHas(A, 'New report about Troll') && await A.ev(() => document.querySelector('#adminBtn .badge').textContent === '1'), 'the admin is told at once, with a badge on the button');

    // the admin reviews it
    await A.ev(() => openPanel('admin'));
    t.ok(await until(A, () => panel.querySelectorAll('.modcard').length === 1), 'the admin window lists the open report');
    const card = await A.ev(() => panel.querySelector('.modcard').textContent);
    t.ok(/Troll/.test(card) && /Rude or abusive/.test(card) && /rude to everyone/.test(card) && /Reported by Pip/.test(card), 'the report shows who, why, the note and the reporter');
    t.ok(/you all stink/.test(card) && /secret insult/.test(card) && !/not for pip/.test(card), "the troll's recent lines are attached (only whispers sent to the reporter)");
    t.ok(await C.ev(async () => { SOCK.emit('modList'); await new Promise(r => setTimeout(r, 800)); return !MOD.loaded; }), 'a non-admin asking for the list gets nothing');

    // mute from the report: the report closes, and the troll's chat no longer reaches anyone
    await A.ev(() => [...panel.querySelectorAll('.modcard button')].find(b => b.textContent === 'Mute 1 h').click());
    t.ok(await logHas(B, 'An admin muted you for 60 minutes'), 'the muted player is told');
    t.ok(await until(A, () => panel.textContent.includes('No open reports')), 'muting closes the report');
    t.ok(await A.ev(() => { MOD.tab = 'done'; refreshPanel(); const s = panel.textContent; MOD.tab = 'reports'; return /Closed by modboss: muted 1 h/.test(s); }), 'the closed list shows who handled it and how');
    await B.ev(() => { sendChat('local block'); MOD.muted = 0; sendChat('sneaky chat'); soc('whisper', { to: 'Pip', text: 'sneaky whisper' }); });
    t.ok(await logHas(B, 'You are muted for'), 'the muted player is reminded when they try to chat');
    await wait(1500);
    t.ok(await C.ev(() => { const s = document.getElementById('log').textContent; return !s.includes('sneaky') && !s.includes('local block'); }), "a muted player's chat and whispers are dropped by the server");

    // kick a guest from the Online tab
    await A.ev(() => { MOD.tab = 'players'; SOCK.emit('modList'); });
    t.ok(await until(A, () => panel.querySelectorAll('.setrow').length === 3 && /muted 60 min/.test(panel.textContent)), 'the Online tab lists everyone, showing who is muted');
    await A.ev(() => { const row = [...panel.querySelectorAll('.setrow')].find(r => r.textContent.includes('Pip')); [...row.querySelectorAll('button')].find(b => b.textContent === 'Kick').click(); });
    t.ok(await until(C, () => { const n = document.getElementById('modNotice'); return n && !n.hidden && !SOCK.connected; }), 'a kicked player sees a notice and is disconnected');
    t.ok(await C.ev(() => !document.querySelector('#modNotice').textContent.includes('banned') && !!document.getElementById('modReload')), 'the notice offers a reload');

    // ban the troll's account (needs a second click to confirm)
    await A.ev(() => SOCK.emit('modList'));
    await until(A, () => panel.querySelectorAll('.setrow').length === 2);
    const armed = await A.ev(() => { const row = () => [...panel.querySelectorAll('.setrow')].find(r => r.textContent.includes('Troll'));
      [...row().querySelectorAll('button')].find(b => b.textContent === 'Ban 7 days').click(); const c = [...row().querySelectorAll('button')].find(b => b.textContent === 'Confirm ban 7 days'); if (c) c.click(); return !!c; });
    t.ok(armed, 'banning asks for a second click');
    t.ok(await until(B, () => { const n = document.getElementById('modNotice'); return n && !n.hidden && /banned for 7 days/.test(n.textContent); }), 'the banned player is removed with the reason');
    await B.ev(() => { localStorage.setItem('embervale.account', JSON.stringify({ token: ACC.token, username: ACC.username })); location.reload(); });
    await wait(4000);
    const after = await B.ev(async () => { for (let i = 0; i < 40 && NET.status === 'connecting'; i++) await new Promise(r => setTimeout(r, 250)); const n = document.getElementById('modNotice'); return { notice: !!n && !n.hidden && n.textContent, broker: !!NET.viaBroker, status: NET.status }; });
    t.ok(after.notice && /banned for 7 (more )?days/.test(after.notice) && !after.broker, `a banned account is refused on reconnect and does not slip in through the backup (${JSON.stringify(after)})`);
    t.ok(await A.ev(() => { const n = document.getElementById('modNotice'); return !n || n.hidden; }), 'the admin is not affected');
    for (const g of [A, B, C]) t.ok(g.page.errors.length === 0, 'no script errors' + g.page.errors.map(e => ': ' + e).join(''));
  } finally { await Promise.all([A.close(), B.close(), C.close()]); }
};
