// Phones: a townsfolk dialogue box keeps its buttons whole (v1.45.3): it sits on the visible bottom edge (above a
// browser bar), and its last row of buttons is pinned to the bottom of the box when the text scrolls.
const pptr = require('puppeteer-core');
const { BROWSER, wait } = require('./helpers');
const GAME = process.env.GAME_URL || ('file://' + require('path').resolve(__dirname, '../index.html').split(String.fromCharCode(92)).join('/'));
module.exports = async t => {
  const browser = await pptr.launch({ executablePath: BROWSER, headless: true });
  try {
    const page = await browser.newPage(); const errors = []; page.on('pageerror', e => errors.push(e.message));
    await page.setViewport({ width: 390, height: 600, isMobile: true, hasTouch: true, deviceScaleFactor: 1 });
    await page.goto(GAME + '?room=sf' + Date.now() + '&server=http://127.0.0.1:9');
    await page.evaluate(() => { localStorage.clear(); document.getElementById('nameIn').value = 'Talky'; document.getElementById('newBtn').click(); }); await wait(2500);
    const look = () => page.evaluate(() => { const a = panel.querySelector('.sheetacts'), b = a && a.querySelector('.btn'); if (!b) return null; const br = b.getBoundingClientRect(), pr = panel.getBoundingClientRect();
      const el = document.elementFromPoint(br.left + br.width / 2, br.top + br.height / 2); return { top: br.top, bottom: br.bottom, pb: pr.bottom, H: innerHeight, hit: b.contains(el), txt: b.textContent.trim() }; });
    // a long talk: the action row stays whole while the text scrolls
    await page.evaluate(async () => { enterZone('town'); talk = { npc: 'corvin', role: null, n: {}, id: null, mode: null, page: 0 }; openPanel('talk'); await new Promise(r => setTimeout(r, 300));
      const s = panel.querySelector('.say'); if (s) s.innerHTML += '<br>' + 'A long tale. '.repeat(160); });
    await wait(1200);
    const a = await look();
    const sc = await page.evaluate(() => panel.scrollHeight > panel.clientHeight + 40);
    t.ok(sc && a && a.top >= 0 && a.bottom <= a.H && a.hit, `with long text the box scrolls and its "${a && a.txt}" button stays whole and tappable at the bottom`);
    // a browser bar covering the bottom 60px: the box moves up above it
    await page.evaluate(() => document.documentElement.style.setProperty('--vvlift', '60px')); await wait(200);
    const b = await look();
    t.ok(b && Math.abs(b.pb - (b.H - 60)) < 2 && b.bottom <= b.H - 60 && b.hit, 'when the visible screen ends 60px higher, the box and its button sit above that');
    t.ok(!errors.length, 'no script errors' + (errors.length ? ': ' + errors.join(' | ') : ''));
  } finally { await browser.close(); }
};
