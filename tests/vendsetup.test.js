// Open a shop on a phone (v1.45.4): the bag is a grid of tiles; tapping one opens a "Put on sale" card with − / + / All,
// a price with quick picks, the total; listed items are short rows with ✕; nothing is squeezed or spills sideways.
const pptr = require('puppeteer-core');
const { BROWSER, wait } = require('./helpers');
const GAME = process.env.GAME_URL || ('file://' + require('path').resolve(__dirname, '../index.html').split(String.fromCharCode(92)).join('/'));
module.exports = async t => {
  const browser = await pptr.launch({ executablePath: BROWSER, headless: true });
  try {
    const page = await browser.newPage(); const errors = []; page.on('pageerror', e => errors.push(e.message));
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await page.goto(GAME + '?room=vs' + Date.now() + '&server=http://127.0.0.1:9');
    await page.evaluate(() => { localStorage.clear(); document.getElementById('nameIn').value = 'Seller'; document.getElementById('newBtn').click(); }); await wait(2500);
    const r = await page.evaluate(async () => { const sl = ms => new Promise(r => setTimeout(r, ms));
      for (const id of ['red', 'dagger', 'bone', 'fur']) giveItem(id, id === 'dagger' ? 1 : 7); PANEL_ACTS.vendsetup(); await sl(300);
      const out = { tiles: panel.querySelectorAll('.vtile').length, inv: P.inv.length };
      const wide = () => [...panel.querySelectorAll('*')].filter(e => { const b = e.getBoundingClientRect(); return b.width && (b.right > innerWidth + 1 || b.left < -1); }).length;
      out.wide0 = wide();
      // tap the Red Tonic tile: the card opens with its count and the shop price
      const i = P.inv.findIndex(e => e.id === 'red'), have = P.inv[i].n; panel.querySelector(`.vtile[data-arg="${i}"]`).click(); await sl(200);
      out.card = !!panel.querySelector('.vpick') && +document.getElementById('vqE').value === have && +document.getElementById('vpE').value === ITEMS.red.price;
      panel.querySelector('[data-act="vendQ"][data-arg="-1"]').click(); panel.querySelector('[data-act="vendQ"][data-arg="-1"]').click(); await sl(50);
      panel.querySelector('[data-act="vendP"][data-arg="x2"]').click(); await sl(50);
      out.set = +document.getElementById('vqE').value === have - 2 && +document.getElementById('vpE').value === ITEMS.red.price * 2;
      out.total = panel.querySelector('.vtotal').textContent.includes(fmt((have - 2) * ITEMS.red.price * 2));
      out.wide1 = wide();
      panel.querySelector('.vpick [data-act="vendList"]').click(); await sl(200);
      out.listed = TR.draft.length === 1 && TR.draft[0].e.n === have - 2 && TR.draft[0].price === ITEMS.red.price * 2 && !panel.querySelector('.vpick') && P.inv.find(e => e.id === 'red').n === 2;
      out.row = !!panel.querySelector('.vrow .vx') && /If everything sells/.test(panel.textContent) && /Open shop · 1 item/.test(panel.querySelector('.vopen').textContent);
      // a single piece of gear has no How many
      const d = P.inv.findIndex(e => e.id === 'dagger'); PANEL_ACTS.vendPick(d); await sl(100); out.gear = !document.getElementById('vqE') && !!document.getElementById('vpE');
      PANEL_ACTS.vendPick(''); panel.querySelector('.vrow .vx').click(); await sl(100); out.back = !TR.draft.length && P.inv.find(e => e.id === 'red').n === have;
      out.names = [...panel.querySelectorAll('.vtile .vnm')].every(e => e.scrollWidth <= e.clientWidth + 1 && e.getBoundingClientRect().width > 20);
      closePanel(); return out; });
    t.ok(r.tiles === r.inv && r.names, `the bag shows as tiles with readable names (${r.tiles} tiles)`);
    t.ok(r.card, 'tapping a stack opens the Put on sale card with how many you have and the shop price');
    t.ok(r.set && r.total, '− lowers how many, ×2 doubles the price, and the total follows');
    t.ok(r.listed && r.row, 'Put on sale lists it as a short row, with what everything is worth and the Open shop count');
    t.ok(r.gear, 'a single piece of gear asks only for a price');
    t.ok(r.back, '✕ takes an item back to the bag');
    t.ok(r.wide0 === 0 && r.wide1 === 0, `nothing spills off the side of a phone (${r.wide0}, ${r.wide1})`);
    t.ok(!errors.length, 'no script errors' + (errors.length ? ': ' + errors.join(' | ') : ''));
  } finally { await browser.close(); }
};
