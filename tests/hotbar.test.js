// Free hotbar: any learned skill or usable item on any slot, an editor (✎), drag to swap, and on a phone
// the slots sit in arcs around the Attack button on the right.
const pptr = require('puppeteer-core');
const { player, wait, newRoom, BROWSER } = require('./helpers');
const GAME = process.env.GAME_URL || require('url').pathToFileURL(require('path').join(__dirname, '..', 'index.html')).href;

module.exports = async t => {
  const g = await player('Barkeep', newRoom(), { zone: 'meadow', server: 'http://127.0.0.1:9' });
  try {
    await wait(800);
    const d0 = await g.ev(() => getBar().map(e => e ? (e.s || e.i) : null));
    t.ok(d0.slice(4).join() === 'red,orange,blue,scroll' && d0[0] === 'firstaid', `an old layout becomes the free bar (${d0.join(',')})`);
    // the editor: pick slot 1, put the Butterfly Wing-like scroll there; pick slot 6, put First Aid there
    const ed = await g.ev(() => { P.skills.firstaid = 1; document.getElementById('hbEdit').click(); const k = panelKind;
      panel.querySelector('[data-act="hbsel"][data-arg="0"]').click(); panel.querySelector('[data-act="hbput"][data-arg="i:red"]').click();
      panel.querySelector('[data-act="hbsel"][data-arg="5"]').click(); panel.querySelector('[data-act="hbput"][data-arg="s:firstaid"]').click();
      return { k, bar: getBar().map(e => e ? (e.s || e.i) : null) }; });
    t.ok(ed.k === 'hotbar', 'the ✎ button opens the hotbar editor');
    t.ok(ed.bar[0] === 'red' && ed.bar[5] === 'firstaid', `a slot can hold any item or skill (${ed.bar.join(',')})`);
    t.ok(ed.bar.filter(x => x === 'red').length === 1 && ed.bar.filter(x => x === 'firstaid').length === 1, 'putting something already on the bar moves it (no duplicates)');
    const keys = await g.ev(() => { closePanel(); P.hp = 5; const n1 = invFind('red').n;
      window.dispatchEvent(new KeyboardEvent('keydown', { key: '1' })); const n2 = invFind('red') ? invFind('red').n : 0; P.hp = 5; const cd = P.cd.firstaid || 0;
      P.sp = 50; window.dispatchEvent(new KeyboardEvent('keydown', { key: '6' })); return { used: n2 === n1 - 1, aid: (P.cd.firstaid || 0) > cd }; });
    t.ok(keys.used && keys.aid, 'keys 1 and 6 now use what was placed there');
    const sw = await g.ev(() => { barSwap(0, 5); const b = getBar().map(e => e ? (e.s || e.i) : null); return b[0] === 'firstaid' && b[5] === 'red'; });
    t.ok(sw, 'dragging one slot onto another swaps them');
    const clr = await g.ev(() => { barSel = 7; openPanel('hotbar'); panel.querySelector('[data-act="hbclear"]').click(); closePanel(); rebuildHotbar();
      const el = document.querySelectorAll('#hotbar .slot')[7]; const empty = el.classList.contains('empty'); el.click(); const k = panelKind; closePanel(); return { empty, k, sel: barSel }; });
    t.ok(clr.empty && clr.k === 'hotbar' && clr.sel === 7, 'a cleared slot shows as empty, and tapping it opens the editor on that slot');
    t.ok(await g.ev(() => { save(); const s = JSON.parse(localStorage.getItem(SAVE_KEY)); return Array.isArray(s.p.bar) && s.p.bar[0].s === 'firstaid' && s.p.bar[7] === null; }), 'the layout is saved');
    t.ok(await g.ev(() => { openPanel('hotbar'); panel.querySelector('[data-act="hbreset"]').click(); closePanel(); return getBar().slice(4).map(e => e && e.i).join() === 'red,orange,blue,scroll'; }), 'Reset brings back the usual layout');
    t.ok(g.page.errors.length === 0, 'no script errors' + g.page.errors.map(e => ': ' + e).join(''));
  } finally { await g.close(); }

  // a phone: the slots sit around the Attack button on the right
  const browser = await pptr.launch({ executablePath: BROWSER, headless: true });
  try {
    const page = await browser.newPage(); const errors = []; page.on('pageerror', e => errors.push(e.message));
    await page.setViewport({ width: 390, height: 780, isMobile: true, hasTouch: true });
    await page.goto(GAME + '?room=hb' + Date.now() + '&server=http://127.0.0.1:9');
    await page.evaluate(() => { localStorage.clear(); document.getElementById('nameIn').value = 'Thumb'; document.getElementById('newBtn').click(); });
    await wait(900);
    const lay = await page.evaluate(() => { const a = document.getElementById('atkBtn').getBoundingClientRect(), log = document.getElementById('log').getBoundingClientRect();
      const slots = [...document.querySelectorAll('#hotbar .slot:not(.edit)')].map(s => s.getBoundingClientRect());
      const overlaps = (r, q) => r.left < q.right && q.left < r.right && r.top < q.bottom && q.top < r.bottom;
      return { right: slots.every(r => r.left > innerWidth * .35), near: slots.every(r => Math.hypot(r.left + r.width / 2 - (a.left + a.width / 2), r.top + r.height / 2 - (a.top + a.height / 2)) < 175),
        apart: slots.every((r, i) => slots.every((q, j) => i === j || Math.hypot(r.left - q.left, r.top - q.top) >= r.width - 1)), noLog: slots.every(r => !overlaps(r, log)), onScreen: slots.every(r => r.right <= innerWidth && r.bottom <= innerHeight && r.top >= 0) }; });
    t.ok(lay.right && lay.near, 'on a phone the slots sit around the Attack button on the right');
    t.ok(lay.apart && lay.noLog && lay.onScreen, 'they do not overlap each other or the chat log, and stay on screen ' + JSON.stringify(lay));
    const tap = await page.evaluate(() => { const r = document.querySelectorAll('#hotbar .slot')[4].getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
    const n0 = await page.evaluate(() => { P.hp = 5; return invFind('red').n; });
    await page.touchscreen.tap(tap.x, tap.y); await wait(200);
    t.ok(await page.evaluate(n => invFind('red').n === n - 1, n0), 'tapping a slot uses it');
    t.ok(errors.length === 0, 'no script errors on the phone' + errors.map(e => ': ' + e).join(''));
  } finally { await browser.close(); }
};
