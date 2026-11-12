// phones: a round Ride button appears once you own a mount, and lights up while riding
const pptr = require('puppeteer-core');
const { BROWSER, wait } = require('./helpers');
const GAME = process.env.GAME_URL || ('file://' + require('path').resolve(__dirname, '../index.html').split(String.fromCharCode(92)).join('/'));
module.exports = async t => {
  const browser = await pptr.launch({ executablePath: BROWSER, headless: true });
  try {
    const page = await browser.newPage(); const errors = []; page.on('pageerror', e => errors.push(e.message));
    await page.setViewport({ width: 390, height: 780, isMobile: true, hasTouch: true, deviceScaleFactor: 1 });
    await page.goto(GAME + '?room=ride' + Date.now() + '&server=http://127.0.0.1:9');
    await page.evaluate(() => { localStorage.clear(); document.getElementById('nameIn').value = 'Jockey'; document.getElementById('newBtn').click(); });
    await wait(1500); const ev = (f, ...a) => page.evaluate(f, ...a);
    const none = await ev(async () => { await new Promise(r => setTimeout(r, 500)); const b = document.getElementById('rideBtn'); b.click(); return { shown: !b.hidden && b.classList.contains('none'), told: /Tobin at the Waystation/.test(document.getElementById('log').textContent), riding: !!P.riding }; });
    t.ok(none.shown && none.told && !none.riding, 'the Ride button is always there (dimmed); without a mount it says where to get one');
    const shown = await ev(async () => { P.lv = 20; P.mounts = ['hopper']; enterZone('meadow'); await new Promise(r => setTimeout(r, 600)); const b = document.getElementById('rideBtn'), r = b.getBoundingClientRect(); return { vis: !b.hidden && r.width > 30, after: b.previousElementSibling && b.previousElementSibling.id }; });
    t.ok(shown.vis && shown.after === 'autoBtn', 'with a mount, a round Ride button sits right under Auto');
    const tap = await ev(() => { const r = document.getElementById('rideBtn').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
    await page.touchscreen.tap(tap.x, tap.y); await wait(600);
    t.ok(await ev(() => !!P.riding && document.getElementById('rideBtn').classList.contains('on')), 'tapping it gets you in the saddle, and it lights up');
    await page.touchscreen.tap(tap.x, tap.y); await wait(500);
    t.ok(await ev(() => !P.riding), 'tapping again hops off');
    t.ok(errors.length === 0, 'no script errors' + errors.map(e => ': ' + e).join(''));
  } finally { await browser.close(); }
};
