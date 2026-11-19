// phones: shop-like windows opened by townsfolk fill the screen, conversations are a dialogue box at the bottom; desktop keeps its size
const pptr = require('puppeteer-core');
const { BROWSER, wait } = require('./helpers');
const GAME = process.env.GAME_URL || ('file://' + require('path').resolve(__dirname, '../index.html').split(String.fromCharCode(92)).join('/'));
async function open(browser, vp) {
  const page = await browser.newPage(); page.errors = []; page.on('pageerror', e => page.errors.push(e.message));
  await page.setViewport(vp); await page.goto(GAME + '?room=npcf' + Date.now() + '&server=http://127.0.0.1:9');
  await page.evaluate(() => { localStorage.clear(); document.getElementById('nameIn').value = 'Talker'; document.getElementById('newBtn').click(); });
  await wait(2500); return page;
}
const check = () => { const out = {}; for (const role of ['shop', 'smith', 'stylist']) { const n = Z.npcs.find(x => x.role === role); if (!n) continue;
    closePanel(); openNpc(n); const r = panel.getBoundingClientRect(); out[role] = panel.classList.contains('npcfull') && r.width >= innerWidth - 1 && r.height >= innerHeight - 1; }
  // v1.34.0 a conversation is a dialogue box at the bottom: full width, as tall as its content, the town visible above it
  const talk = {}; { const n = Z.npcs.find(x => x.role === 'talk'); closePanel(); openNpc(n); const r = panel.getBoundingClientRect();
    talk.sheet = panel.classList.contains('npcsheet') && !panel.classList.contains('npcfull'); talk.bottom = r.bottom >= innerHeight - 2; // (it may still be sliding up) talk.wide = r.width >= innerWidth - 1; talk.short = r.height < innerHeight * .8;
    // tapping the town above it closes it
    document.getElementById('cv').dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); talk.tapClose = panel.hidden; }
  closePanel(); const closed = !panel.classList.contains('npcfull') && !panel.classList.contains('npcsheet'); openPanel('items'); const own = panel.classList.contains('npcfull'); closePanel();
  return { out, talk, closed, own }; };
module.exports = async t => {
  const browser = await pptr.launch({ executablePath: BROWSER, headless: true });
  try {
    for (const [name, vp] of [['upright', { width: 390, height: 844, isMobile: true, hasTouch: true }], ['sideways', { width: 844, height: 390, isMobile: true, hasTouch: true }]]) {
      const page = await open(browser, vp); const r = await page.evaluate(check);
      t.ok(Object.values(r.out).length >= 3 && Object.values(r.out).every(Boolean), `phone ${name}: shop, smith and stylist windows fill the screen ${JSON.stringify(r.out)}`);
      t.ok(Object.values(r.talk).every(Boolean), `phone ${name}: a quest talk is a dialogue box at the bottom, as tall as it needs, closed by tapping the town ${JSON.stringify(r.talk)}`);
      t.ok(r.closed && r.own, `phone ${name}: closing ends full screen, and the Items window opens full screen too`);
      t.ok(page.errors.length === 0, `phone ${name}: no script errors` + page.errors.map(e => ': ' + e).join(''));
    }
    const desk = await open(browser, { width: 1200, height: 800 });
    const d = await desk.evaluate(() => { openNpc(Z.npcs.find(x => x.role === 'shop')); return panel.classList.contains('npcfull'); });
    t.ok(!d, 'desktop: townsfolk windows keep their usual size');
  } finally { await browser.close(); }
};
