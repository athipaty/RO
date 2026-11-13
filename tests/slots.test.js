// Three character slots (guest: on this device) that share one storage; old single-character saves keep their items.
const { openGame, wait, newRoom } = require('./helpers');

module.exports = async t => {
  const room = newRoom();
  const g = await openGame(room, { server: 'http://127.0.0.1:9' });
  try {
    const start = async (slot, name) => {
      await g.ev((n, nm) => { document.querySelector(`.slotc[data-slot="${n}"]`).click(); document.getElementById('nameIn').value = nm; document.getElementById('newBtn').click(); }, slot, name);
      await wait(700);
    };
    const toTitle = async () => { await g.ev(() => save(true)); await g.page.reload(); await wait(900); };
    // an old save from before slots, with its own storage
    await g.ev(() => { localStorage.clear(); localStorage.setItem('embervale.save.v1', JSON.stringify({ v: 1, p: { ...JSON.parse(JSON.stringify(newPlayer('Oldie'))), lv: 12, storage: [{ id: 'red', n: 5 }] } })); });
    await g.page.reload(); await wait(900);
    const t0 = await g.ev(() => ({ cards: document.querySelectorAll('.slotc').length, first: document.querySelector('.slotc[data-slot="0"]').textContent,
      empty: [...document.querySelectorAll('.slotc.empty')].length, cont: document.getElementById('contBtn').textContent, newHidden: document.getElementById('newBtn').hidden }));
    t.ok(t0.cards === 3 && t0.empty === 2, `the title screen shows three slots, two empty (${t0.cards} cards)`);
    t.ok(/Oldie/.test(t0.first) && /Lv 12/.test(t0.first) && /Continue as Oldie \(Lv 12\)/.test(t0.cont) && t0.newHidden, 'the old save sits in slot 1 and can be continued');
    await g.ev(() => document.getElementById('contBtn').click()); await wait(700);
    const m = await g.ev(() => ({ name: P.name, st: P.storage.map(e => e.id + 'x' + e.n).join(), shared: JSON.parse(localStorage.getItem('embervale.storage.v1') || '[]').map(e => e.id + 'x' + e.n).join() }));
    t.ok(m.name === 'Oldie' && m.st === 'redx5' && m.shared === 'redx5', `the old character's storage moves into the shared storage (${m.shared})`);
    // store a sword from the bag
    await g.ev(() => { P.inv.push({ id: 'club', uid: 9999, s: [] }); openPanel('storage'); });
    await g.ev(() => { const i = P.inv.findIndex(e => e.uid === 9999); document.querySelector(`[data-act="store"][data-arg="${i}"]`).click(); });
    await wait(200);
    t.ok(await g.ev(() => !P.inv.some(e => e.uid === 9999) && P.storage.some(e => e.uid === 9999)), 'storing moves the item from the bag to storage');
    t.ok(await g.ev(() => /Shared by all your characters/.test(document.getElementById('panel').textContent)), 'the storage window says it is shared');
    await toTitle();
    // second character in slot 2 sees the same storage and takes the club
    await start(1, 'Second');
    const s2 = await g.ev(() => ({ name: P.name, lv: P.lv, st: P.storage.map(e => e.id).join() }));
    t.ok(s2.name === 'Second' && s2.lv === 1 && /red/.test(s2.st) && /club/.test(s2.st), `a new character in slot 2 sees the shared storage (${s2.st})`);
    await g.ev(() => { openPanel('storage'); const i = P.storage.findIndex(e => e.uid === 9999); document.querySelector(`[data-act="take"][data-arg="${i}"]`).click(); });
    await wait(200);
    t.ok(await g.ev(() => P.inv.some(e => e.uid === 9999) && !P.storage.some(e => e.uid === 9999)), 'the second character takes the item out');
    await toTitle();
    const t1 = await g.ev(() => [...document.querySelectorAll('.slotc')].map(b => b.textContent));
    t.ok(/Second/.test(t1[1]) && /Oldie/.test(t1[0]) && /Empty/.test(t1[2]), 'both characters are listed: ' + t1.join(' | '));
    t.ok(await g.ev(() => /Second/.test(document.getElementById('contBtn').textContent)), 'the last played slot is selected');
    // back to the first: the item is gone from storage, the potions are still there, and its level is kept
    await g.ev(() => { document.querySelector('.slotc[data-slot="0"]').click(); document.getElementById('contBtn').click(); }); await wait(700);
    const b = await g.ev(() => ({ name: P.name, lv: P.lv, club: P.storage.some(e => e.uid === 9999), red: P.storage.some(e => e.id === 'red' && e.n === 5) }));
    t.ok(b.name === 'Oldie' && b.lv === 12 && !b.club && b.red, 'the first character sees the item gone and the potions kept (no copies)');
    // the storage merge happens only once
    await toTitle();
    await g.ev(() => document.getElementById('contBtn').click()); await wait(700);
    t.ok(await g.ev(() => P.storage.filter(e => e.id === 'red').reduce((a, e) => a + e.n, 0) === 5), 'reloading does not merge the old storage twice');
    // Settings → Switch character returns to the list
    await g.ev(() => { openPanel('settings'); document.querySelector('[data-act="setswitch"]').click(); }); await wait(1500);
    t.ok(await g.ev(() => !document.getElementById('title').hidden), 'Switch character in Settings returns to the character list');
    // delete slot 2
    await g.ev(() => { document.querySelector('.slotc[data-slot="1"]').click(); document.getElementById('slotDel').click(); });
    t.ok(await g.ev(() => !document.getElementById('confirm').hidden && /Delete Second/.test(document.getElementById('cfText').textContent)), 'Delete asks first, naming the character');
    await g.ev(() => document.getElementById('cfYes').click()); await wait(200);
    t.ok(await g.ev(() => !localStorage.getItem('embervale.save.v1.s1') && document.querySelector('.slotc[data-slot="1"]').classList.contains('empty') && !document.getElementById('creator').hidden),
      'the slot is empty again and offers the character creator');
    t.ok(g.page.errors.length === 0, 'no script errors' + g.page.errors.map(e => ': ' + e).join(''));
  } finally { await g.close(); }
};
