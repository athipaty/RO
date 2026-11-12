// phones: a Full screen button in the menu (and Settings); the page can be added to the Home Screen
const pptr = require('puppeteer-core');
const { BROWSER, wait } = require('./helpers');
const GAME = process.env.GAME_URL || ('file://' + require('path').resolve(__dirname, '../index.html').split(String.fromCharCode(92)).join('/'));
module.exports = async t => {
  const browser = await pptr.launch({ executablePath: BROWSER, headless: true });
  try {
    const page = await browser.newPage(); const errors = []; page.on('pageerror', e => errors.push(e.message));
    await page.setViewport({ width: 780, height: 390, isMobile: true, hasTouch: true, deviceScaleFactor: 1 });
    await page.goto(GAME + '?room=full' + Date.now() + '&server=http://127.0.0.1:9');
    await page.evaluate(() => { localStorage.clear(); document.getElementById('nameIn').value = 'Wide'; document.getElementById('newBtn').click(); });
    await wait(1500); const ev = (f, ...a) => page.evaluate(f, ...a);
    const meta = await ev(() => ({ manifest: !!document.querySelector('link[rel="manifest"]'), apple: !!document.querySelector('meta[name="apple-mobile-web-app-capable"]'), icon: !!document.querySelector('link[rel="apple-touch-icon"]') }));
    t.ok(meta.manifest && meta.apple && meta.icon, 'the page can be added to the Home Screen (opens without the browser bar)');
    await ev(() => document.getElementById('menuBtn').click()); await wait(300);
    const btn = await ev(() => { const b = document.getElementById('mFull'), r = b.getBoundingClientRect(); return { vis: r.width > 0 && getComputedStyle(b).display !== 'none', x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
    t.ok(btn.vis, 'the phone menu has a Full screen button');
    await page.touchscreen.tap(btn.x, btn.y); await wait(600);
    t.ok(await ev(() => !!document.fullscreenElement), 'pressing it goes full screen');
    const s = await ev(() => { openPanel('settings'); const ok = !!panel.querySelector('[data-act="setfull"]'); closePanel(); return ok; });
    t.ok(s, 'Settings has a Full screen switch too');
    t.ok(errors.length === 0, 'no script errors' + errors.map(e => ': ' + e).join(''));
  } finally { await browser.close(); }
};
