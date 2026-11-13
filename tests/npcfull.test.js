// phones: windows opened by talking to townsfolk fill the screen; your own windows and desktop keep their size
const pptr = require('puppeteer-core');
const { BROWSER, wait } = require('./helpers');
const GAME = process.env.GAME_URL || ('file://' + require('path').resolve(__dirname, '../index.html').split(String.fromCharCode(92)).join('/'));
async function open(browser, vp) {
  const page = await browser.newPage(); page.errors = []; page.on('pageerror', e => page.errors.push(e.message));
  await page.setViewport(vp); await page.goto(GAME + '?room=npcf' + Date.now() + '&server=http://127.0.0.1:9');
  await page.evaluate(() => { localStorage.clear(); document.getElementById('nameIn').value = 'Talker'; document.getElementById('newBtn').click(); });
  await wait(2500); return page;
}
const check = () => { const out = {}; for (const role of ['shop', 'smith', 'talk', 'stylist']) { const n = Z.npcs.find(x => x.role === role); if (!n) continue;
    closePanel(); openNpc(n); const r = panel.getBoundingClientRect(); out[role] = panel.classList.contains('npcfull') && r.width >= innerWidth - 1 && r.height >= innerHeight - 1; }
  closePanel(); const closed = !panel.classList.contains('npcfull'); openPanel('items'); const own = panel.classList.contains('npcfull'); closePanel();
  return { out, closed, own }; };
module.exports = async t => {
  const browser = await pptr.launch({ executablePath: BROWSER, headless: true });
  try {
    for (const [name, vp] of [['upright', { width: 390, height: 844, isMobile: true, hasTouch: true }], ['sideways', { width: 844, height: 390, isMobile: true, hasTouch: true }]]) {
      const page = await open(browser, vp); const r = await page.evaluate(check);
      t.ok(Object.values(r.out).length >= 3 && Object.values(r.out).every(Boolean), `phone ${name}: shop, smith, quest talk and stylist windows fill the screen ${JSON.stringify(r.out)}`);
      t.ok(r.closed && r.own, `phone ${name}: closing ends full screen, and the Items window opens full screen too`);
      t.ok(page.errors.length === 0, `phone ${name}: no script errors` + page.errors.map(e => ': ' + e).join(''));
    }
    const desk = await open(browser, { width: 1200, height: 800 });
    const d = await desk.evaluate(() => { openNpc(Z.npcs.find(x => x.role === 'shop')); return panel.classList.contains('npcfull'); });
    t.ok(!d, 'desktop: townsfolk windows keep their usual size');
  } finally { await browser.close(); }
};
