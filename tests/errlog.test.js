// Stage 7 error log and backups: players' script errors reach the server, grouped; admins see and clear them,
// and can download a backup (never with password hashes).
// Runs only against a local copy of the game server (started with EMBERVALE_ADMINS=modboss):
//   EMBER_SERVER=http://localhost:5055 GAME_URL=http://localhost:8080/index.html npm test -- errlog
const { player, wait, newRoom } = require('./helpers');

const API = () => process.env.EMBER_SERVER + '/api/embervale/';
async function account(username) {
  const post = (p) => fetch(API() + p, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ username, password: 'secret1' }) }).then(r => r.json());
  let j = await post('register'); if (!j.token) j = await post('login');
  if (!j.token) throw new Error('account failed: ' + JSON.stringify(j)); return j;
}
const login = (g, a) => g.ev((tok, u) => { ACC.token = tok; ACC.username = u; NET.room.relogin(); }, a.token, a.username);
const until = (g, src, ms = 8000) => g.ev(async (src, ms) => { const f = eval(src); const end = Date.now() + ms; while (Date.now() < end) { try { if (f()) return true; } catch (e) {} await new Promise(r => setTimeout(r, 200)); } return false; }, src, ms);

module.exports = async t => {
  if (!process.env.EMBER_SERVER) { t.ok(true, 'skipped (set EMBER_SERVER to run against a local game server)'); return; }
  const room = newRoom(), tag = Math.random().toString(36).slice(2, 7);
  const [admin, plain] = await Promise.all([account('modboss'), account('err' + Math.random().toString(36).slice(2, 9))]);
  const A = await player('Keeper', room), B = await player('Oops', room), C = await player('Oops Two', room);
  try {
    if (!(await Promise.all([A, B, C].map(g => until(g, '() => NET.room && NET.room.server', 10000)))).every(Boolean)) { t.ok(false, 'every player reached the game server (re-run)'); return; }
    await login(A, admin);
    t.ok(await until(A, '() => MOD.admin'), 'the admin logs in');
    // two players' games hit the same error in one of our scripts; another error comes from a browser extension
    const fire = (g, m) => g.ev(m => { const e = new ErrorEvent('error', { message: m, filename: location.origin + '/js/combat.js', lineno: 321, colno: 9, error: new Error(m) }); window.dispatchEvent(e); window.dispatchEvent(e); }, m);
    await fire(B, 'TypeError: boom ' + tag); await fire(C, 'TypeError: boom ' + tag);
    await B.ev(() => window.dispatchEvent(new ErrorEvent('error', { message: 'Extension broke', filename: 'chrome-extension://abc/content.js', lineno: 1 })));
    await wait(1200);
    await A.ev(() => { openPanel('admin'); panel.querySelector('[data-act="modtab"][data-arg="errors"]').click(); });
    t.ok(await until(A, `() => MOD.errors && MOD.errors.some(r => r.msg.includes(${JSON.stringify(tag)}))`), 'an error in a player\'s game shows up in Admin → Errors');
    const row = await A.ev(t => MOD.errors.find(r => r.msg.includes(t)), tag);
    t.ok(row.count === 2 && row.src === 'combat.js' && row.line === 321, `the same error is grouped, counted once per player's visit (${row.count}× at ${row.src}:${row.line})`);
    t.ok(row.v === (await A.ev(() => VERSION)) && /Error/.test(row.stack), 'it records the game version and the stack');
    t.ok(await A.ev(() => !MOD.errors.some(r => /Extension broke/.test(r.msg))), 'errors from browser extensions are ignored');
    await until(A, `() => [...panel.querySelectorAll('.modcard')].some(x => x.textContent.includes(${JSON.stringify(tag)}))`);
    const card = await A.ev(t => { const c = [...panel.querySelectorAll('.modcard')].find(x => x.textContent.includes(t)); [...c.querySelectorAll('button')].find(b => b.textContent === 'Details').click();
      const c2 = [...panel.querySelectorAll('.modcard')].find(x => x.textContent.includes(t)); return c2.textContent; }, tag);
    t.ok(/combat\.js:321:9/.test(card) && /2×/.test(card) && /HeadlessChrome|Mozilla/.test(card), 'Details shows where, how often and the browser');
    await A.ev(t => { const c = [...panel.querySelectorAll('.modcard')].find(x => x.textContent.includes(t)); [...c.querySelectorAll('button')].find(b => b.textContent === 'Clear').click(); }, tag);
    t.ok(await until(A, `() => !MOD.errors.some(r => r.msg.includes(${JSON.stringify(tag)}))`), 'Clear removes it');
    t.ok(await B.ev(async () => { SOCK.emit('modErrors'); await new Promise(r => setTimeout(r, 800)); return MOD.errors === null; }), 'a non-admin gets no error list');

    // backups
    const bk = await fetch(API() + 'admin/backup', { headers: { authorization: 'Bearer ' + admin.token } });
    const body = await bk.text(); let j = null; try { j = JSON.parse(body); } catch (e) {}
    t.ok(bk.ok && j && j.game === 'embervale' && Array.isArray(j.accounts) && j.accounts.some(a => a.username === plain.username) && Array.isArray(j.guilds), `an admin can download a backup (${j && j.counts && j.counts.accounts} accounts)`);
    t.ok(!/passwordHash/.test(body) && /attachment; filename="embervale-backup-/.test(bk.headers.get('content-disposition') || ''), 'it is a file download, with no password hashes in it');
    t.ok((await fetch(API() + 'admin/backup', { headers: { authorization: 'Bearer ' + plain.token } })).status === 403 && (await fetch(API() + 'admin/backup')).status === 401, 'other players and guests cannot download it');
    const dl = await A.ev(async () => { let got = null; const orig = URL.createObjectURL; URL.createObjectURL = b => { got = b.size; return orig(b); };
      panel.querySelector('[data-act="modbackup"]').click(); for (let i = 0; i < 40 && !got; i++) await new Promise(r => setTimeout(r, 200)); URL.createObjectURL = orig; return got; });
    t.ok(dl > 100 && await until(A, `() => /Backup saved/.test(document.getElementById('log').textContent)`), `the Admin window's backup button saves the file (${dl} bytes)`);
    for (const g of [A, B, C]) t.ok(g.page.errors.length === 0, 'no script errors' + g.page.errors.map(e => ': ' + e).join(''));
  } finally { await Promise.all([A.close(), B.close(), C.close()]); }
};
