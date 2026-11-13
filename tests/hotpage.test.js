// phones: a page button switches the shortcut ring between pages 1, 2 and 3 (the extra hotbar rows)
const pptr = require('puppeteer-core');
const { BROWSER, wait } = require('./helpers');
const GAME = process.env.GAME_URL || ('file://' + require('path').resolve(__dirname, '../index.html').split(String.fromCharCode(92)).join('/'));
module.exports = async t => {
  const browser = await pptr.launch({ executablePath: BROWSER, headless: true });
  try {
    const page = await browser.newPage(); const errors = []; page.on('pageerror', e => errors.push(e.message));
    await page.setViewport({ width: 844, height: 390, isMobile: true, hasTouch: true, deviceScaleFactor: 1 });
    await page.goto(GAME + '?room=hp' + Date.now() + '&server=http://127.0.0.1:9');
    await page.evaluate(() => { localStorage.clear(); document.getElementById('nameIn').value = 'Pager'; document.getElementById('newBtn').click(); }); await wait(2500);
    const ev = (f, ...a) => page.evaluate(f, ...a);
    await ev(() => { enterZone('meadow'); P.skills.firstaid = 1; getRows(); P.bars[0][0] = { s: 'firstaid' }; P.bars[1][2] = { i: 'scroll' }; rebuildHotbar(); }); await wait(900);
    const ring = () => ev(() => [...document.querySelectorAll('#hotbar .slot[data-i]')].slice(0, 8).map(e => e._slot ? (e._slot.skill || e._slot.item) : '-').join(','));
    const btn = await ev(() => { const b = document.getElementById('hotPage'), r = b.getBoundingClientRect(); return { shown: !b.hidden && r.width > 0, right: r.left > innerWidth / 2, n: b.querySelector('b').textContent }; });
    t.ok(btn.shown && btn.right && btn.n === '1', 'phones show a page button on the right side, on page 1');
    const p1 = await ring(); await ev(() => document.getElementById('hotPage').click()); await wait(300); const p2 = await ring();
    t.ok(p2.startsWith('firstaid,-') && p2 !== p1 && await ev(() => document.querySelector('#hotPage b').textContent) === '2', `tapping it shows page 2 on the ring (${p2})`);
    t.ok(await ev(() => { P.hp = 5; document.querySelector('#hotbar .slot[data-i]').click(); return P.hp > 5; }), 'a page-2 slot works (First Aid heals)');
    t.ok(await ev(() => { document.querySelector('#hotbar .slot.empty[data-i]').click(); const r = panelKind === 'hotbar' && editRow === 1; closePanel(); return r; }), 'an empty page-2 slot opens the editor on page 2');
    await ev(() => document.getElementById('hotPage').click()); await wait(300); const p3 = await ring();
    t.ok(p3.split(',')[2] === 'scroll', `page 3 shows its own shortcuts (${p3})`);
    await ev(() => document.getElementById('hotPage').click()); await wait(300);
    t.ok(await ring() === p1, 'and it wraps back round to page 1');
    t.ok(errors.length === 0, 'no script errors' + errors.map(e => ': ' + e).join(''));
  } finally { await browser.close(); }
};
