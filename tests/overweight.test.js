// Weight warning: a chip at the top of the screen when the bag is almost full (80%) or too heavy to attack (90%),
// a weight sign over the hero's head, and a tap on the chip opens the Items window.
const pptr = require('puppeteer-core');
const { BROWSER, wait } = require('./helpers');
const GAME = process.env.GAME_URL || ('file://' + require('path').resolve(__dirname, '../index.html').split(String.fromCharCode(92)).join('/'));
const SHOTS = process.env.OW_SHOTS;
module.exports = async t => {
  const browser = await pptr.launch({ executablePath: BROWSER, headless: true });
  try {
    const page = await browser.newPage(); const errors = []; page.on('pageerror', e => errors.push(e.message));
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
    await page.goto(GAME + '?room=ow' + Date.now() + '&server=http://127.0.0.1:9');
    await page.evaluate(() => { localStorage.clear(); document.getElementById('nameIn').value = 'Hefty'; document.getElementById('newBtn').click(); }); await wait(2500);
    // fill the bag to a given share of the weight limit with Stones (weight 1 each... whatever the heaviest common item is)
    const fill = share => page.evaluate(async share => {
      const sleep = ms => new Promise(r => setTimeout(r, ms));
      P.inv = P.inv.filter(e => e.id !== '__ow'); const heavy = Object.keys(ITEMS).filter(id => ITEMS[id].type === 'loot' || ITEMS[id].type === 'etc').sort((a, b) => itemWeight(b) - itemWeight(a))[0] || 'jellopy';
      P.inv = P.inv.filter(e => e.id !== heavy); const need = Math.ceil((maxWeight() * share - carryWeight()) / itemWeight(heavy));
      if (need > 0) P.inv.push({ id: heavy, n: need }); await sleep(700);
      const c = document.getElementById('owChip'); return { pct: carryWeight() / maxWeight(), shown: !!c && !c.hidden, cls: c && c.className, text: c && c.textContent };
    }, share);

    const low = await fill(.5);
    t.ok(!low.shown, 'no chip with half a bag (' + Math.round(low.pct * 100) + '%)');
    const mid = await fill(.85);
    t.ok(mid.shown && mid.cls === 'ow1' && /Bag almost full/.test(mid.text) && /8\d%/.test(mid.text), 'at 85% an amber "Bag almost full" chip with the percent: ' + mid.text);
    const hi = await fill(.93);
    t.ok(hi.shown && hi.cls === 'ow2' && /Too heavy to attack/.test(hi.text) && /Sell or store items/.test(hi.text), 'at 93% a red "Too heavy to attack" chip: ' + hi.text);

    const r = await page.evaluate(async () => {
      const sleep = ms => new Promise(r => setTimeout(r, ms)), out = {};
      enterZone('meadow'); await sleep(400);
      const m = mobs.find(x => !x.dead); m.hp = m.d.hp; P.x = m.x - 40; P.y = m.y; m.d = { ...m.d, atk: 0 };
      // the head sign is drawn while too heavy
      let signs = 0; const _d = drawWeightSign; drawWeightSign = function () { signs++; return _d.apply(this, arguments); };
      P.auto = true; const hp0 = m.hp; await sleep(2500); out.noHit = m.hp === hp0; out.signs = signs; drawWeightSign = _d;
      out.autoText = document.getElementById('owChip').textContent;
      // the chip stays clear of the top bars and the minimap, and fits the screen
      const c = document.getElementById('owChip').getBoundingClientRect(); out.fits = c.left >= 0 && c.right <= innerWidth && c.top >= 0;
      const over = []; for (const id of ['minimap', 'topBars', 'hud', 'goalChip']) { const e = document.getElementById(id); if (!e || !e.getClientRects().length || getComputedStyle(e).display === 'none') continue;
        const b = e.getBoundingClientRect(); if (b.width && b.height && c.left < b.right && c.right > b.left && c.top < b.bottom && c.bottom > b.top) over.push(id); }
      out.over = over; P.auto = false;
      return out; });
    t.ok(r.noHit, 'too heavy: auto-hunt does not hit the monster');
    t.ok(r.signs > 5, 'a weight sign is drawn over the hero\'s head (' + r.signs + ' frames)');
    t.ok(/Auto-hunt stopped/.test(r.autoText), 'with auto-hunt on, the chip says auto-hunt stopped');
    t.ok(r.fits && !r.over.length, 'the chip fits the screen and covers nothing' + (r.over.length ? ': ' + r.over.join(', ') : ''));
    if (SHOTS) await page.screenshot({ path: SHOTS + '/ow-upright.png' });

    // tap opens the Items window
    await page.tap('#owChip'); await wait(400);
    t.ok(await page.evaluate(() => !panel.hidden && panel.dataset.kind === 'items'), 'tapping the chip opens the Items window');
    await page.evaluate(() => closePanel && closePanel());

    // sideways phone
    await page.setViewport({ width: 844, height: 390, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }); await wait(2500);
    const side = await page.evaluate(async () => {
      if (!running) return { skip: true };
      await new Promise(r => setTimeout(r, 600)); const c = document.getElementById('owChip'); if (!c || c.hidden) return { shown: false };
      const b = c.getBoundingClientRect(), over = [];
      for (const id of ['minimap', 'topBars', 'hud', 'goalChip']) { const e = document.getElementById(id); if (!e || !e.getClientRects().length || getComputedStyle(e).display === 'none') continue;
        const x = e.getBoundingClientRect(); if (x.width && x.height && b.left < x.right && b.right > x.left && b.top < x.bottom && b.bottom > x.top) over.push(id); }
      return { shown: true, over }; });
    if (!side.skip) t.ok(side.shown && !side.over.length, 'sideways phone: the chip shows and covers nothing' + (side.over && side.over.length ? ': ' + side.over.join(', ') : ''));
    if (SHOTS) await page.screenshot({ path: SHOTS + '/ow-side.png' });

    // light again: the chip goes away
    const off = await page.evaluate(async () => { P.inv = P.inv.filter(e => (ITEMS[e.id] || {}).type !== 'loot' && (ITEMS[e.id] || {}).type !== 'etc'); await new Promise(r => setTimeout(r, 700)); const c = document.getElementById('owChip'); return !c || c.hidden; });
    t.ok(off, 'selling down below 80% hides the chip');
    t.ok(!errors.length, 'no script errors' + (errors.length ? ': ' + errors.join(' | ') : ''));
  } finally { await browser.close(); }
};
