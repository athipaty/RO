// Account character slots + shared storage on the game server. Needs a local server (EMBER_SERVER + GAME_URL); skipped otherwise.
const { openGame, wait, newRoom } = require('./helpers');

module.exports = async t => {
  if (!process.env.EMBER_SERVER) { t.ok(true, 'skipped: set EMBER_SERVER and GAME_URL to a local game server'); return; }
  const room = newRoom(), user = 'slot' + Math.random().toString(36).slice(2, 8);
  const A = await openGame(room), B = await openGame(room);
  try {
    const ready = g => g.page.waitForFunction(() => ACC.loaded && !document.getElementById('contBtn').disabled, { timeout: 10000 });
    // A: an old-style character in slot 1 with its own storage (as saved before slots), made through the old endpoint
    await A.ev(() => localStorage.clear());
    await A.ev(async u => { const s = await api('POST', '/register', { username: u, password: 'secret12' }); setAccount(s);
      const p = JSON.parse(JSON.stringify(newPlayer('Elder'))); p.lv = 20; p.storage = [{ id: 'red', n: 4 }];
      await api('PUT', '/character', { character: { v: 1, p } }); await loadCloud(); }, user);
    await ready(A);
    t.ok(await A.ev(() => /Continue as Elder \(Lv 20\)/.test(document.getElementById('contBtn').textContent) && document.querySelectorAll('.slotc').length === 3), 'an account shows three slots, the old character in the first');
    await A.ev(() => document.getElementById('contBtn').click());
    await A.page.waitForFunction(() => running && CS.oldSt === null && CS.rev > 0, { timeout: 8000 });
    t.ok(await A.ev(() => P.name === 'Elder' && P.storage.some(e => e.id === 'red' && e.n === 4)), 'its own storage moved into the account storage');
    await A.ev(() => { P.inv.push({ id: 'club', uid: 7777, s: [] }); openPanel('storage'); const i = P.inv.findIndex(e => e.uid === 7777); document.querySelector(`[data-act="store"][data-arg="${i}"]`).click(); });
    await A.page.waitForFunction(() => !CS.busy && P.storage.some(e => e.uid === 7777), { timeout: 8000 });
    t.ok(true, 'storing an item is saved to the server');
    // B: same account on another device, makes a second character in slot 2
    await B.ev(u => { localStorage.clear(); localStorage.setItem('embervale.account', JSON.stringify({ token: ACC.token, username: u })); }, user);
    const tok = await A.ev(() => ACC.token);
    await B.ev((tk, u) => { localStorage.setItem('embervale.account', JSON.stringify({ token: tk, username: u })); }, tok, user);
    await B.page.reload(); await ready(B);
    await B.ev(() => { document.querySelector('.slotc[data-slot="1"]').click(); document.getElementById('nameIn').value = 'Younger'; document.getElementById('newBtn').click(); });
    await wait(800);
    t.ok(await B.ev(() => P.name === 'Younger' && P.storage.some(e => e.uid === 7777) && P.storage.some(e => e.id === 'red')), 'a second character on the same account sees the shared storage');
    await B.ev(() => { openPanel('storage'); const i = P.storage.findIndex(e => e.uid === 7777); document.querySelector(`[data-act="take"][data-arg="${i}"]`).click(); });
    await B.page.waitForFunction(() => !CS.busy && P.inv.some(e => e.uid === 7777), { timeout: 8000 });
    t.ok(await B.ev(() => !P.storage.some(e => e.uid === 7777)), 'the second character takes the club out');
    // A still shows the club (stale) and tries to take it: the server refuses and A gets the fresh storage, no copy
    await A.ev(() => { panel.hidden = false; panelKind = 'storage'; refreshPanel(); const i = P.storage.findIndex(e => e.uid === 7777); document.querySelector(`[data-act="take"][data-arg="${i}"]`).click(); });
    await A.page.waitForFunction(() => !CS.busy, { timeout: 8000 }); await wait(200);
    const a = await A.ev(() => ({ inv: P.inv.some(e => e.uid === 7777), st: P.storage.some(e => e.uid === 7777) }));
    t.ok(!a.inv && !a.st, 'a stale copy on the first device cannot take the same item twice');
    // the list on a fresh load shows both characters
    await B.ev(() => save(true)); await wait(800);
    await A.page.reload(); await ready(A);
    const cards = await A.ev(() => [...document.querySelectorAll('.slotc')].map(b => b.textContent));
    t.ok(/Elder/.test(cards[0]) && /Younger/.test(cards[1]) && /Empty/.test(cards[2]), 'the account lists both characters: ' + cards.join(' | '));
    // delete slot 2 through the server
    await A.ev(() => { document.querySelector('.slotc[data-slot="1"]').click(); document.getElementById('slotDel').click(); document.getElementById('cfYes').click(); });
    await wait(800);
    const after = await A.ev(async () => (await api('GET', '/characters')).slots.map(s => s && s.name));
    t.ok(after[0] === 'Elder' && after[1] === null, 'deleting removes only that slot on the server');
    t.ok(A.page.errors.length === 0 && B.page.errors.length === 0, 'no script errors' + [...A.page.errors, ...B.page.errors].map(e => ': ' + e).join(''));
  } finally { await A.close(); await B.close(); }
};
