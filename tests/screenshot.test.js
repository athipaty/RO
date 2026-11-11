// #66 screenshots: P saves a picture of the game world (canvas only, with a small mark); phones get a Photo button.
const pptr = require('puppeteer-core');
const { player, wait, newRoom, BROWSER } = require('./helpers');
const GAME = process.env.GAME_URL || require('url').pathToFileURL(require('path').join(__dirname, '..', 'index.html')).href;

module.exports = async t => {
  const g = await player('Snapper', newRoom(), { zone: 'meadow', server: 'http://127.0.0.1:9' });
  try {
    await wait(800);
    // catch the download instead of saving a file
    const r = await g.ev(async () => { let got = null; const orig = HTMLAnchorElement.prototype.click;
      HTMLAnchorElement.prototype.click = function () { if (this.download) got = { name: this.download, href: this.href }; else orig.call(this); };
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'p' })); for (let i = 0; i < 30 && !got; i++) await new Promise(r => setTimeout(r, 100));
      HTMLAnchorElement.prototype.click = orig; if (!got) return null;
      const blob = await (await fetch(got.href)).blob(); const img = await createImageBitmap(blob);
      return { name: got.name, type: blob.type, w: img.width, h: img.height, cw: cv.width, ch: cv.height, log: /Screenshot saved as embervale-/.test(document.getElementById('log').textContent) }; });
    t.ok(r && /^embervale-\d{4}-\d\d-\d\d-\d{6}\.png$/.test(r.name) && r.type === 'image/png', `P saves a PNG named by the time (${r && r.name})`);
    t.ok(r && r.w === r.cw && r.h === r.ch, `at the game's full size (${r && r.w}×${r && r.h})`);
    t.ok(r && r.log, 'and says where it went');
    const mark = await g.ev(() => { const c = shotCanvas(), d = c.getContext('2d').getImageData(c.width - 60, c.height - 30, 40, 16).data; let bright = 0; for (let i = 0; i < d.length; i += 4) if (d[i] > 230 && d[i + 1] > 230 && d[i + 2] > 230) bright++; return bright; });
    t.ok(mark > 10, 'with a small Embervale mark in the corner');
    t.ok(await g.ev(() => { const k = KEY_ACTIONS.find(a => a[0] === 'shot'); return !!k && k[1] === 'p'; }), 'the key is listed in Settings and can be changed');
    t.ok(await g.ev(() => { document.getElementById('chatIn').value = ''; let n = 0; const o = takeShot; takeShot = () => { n++; }; const inp = document.getElementById('chatIn'); inp.dispatchEvent(new KeyboardEvent('keydown', { key: 'p', bubbles: true })); takeShot = o; return n === 0; }), 'typing a "p" in chat does not take a picture');
    t.ok(g.page.errors.length === 0, 'no script errors' + g.page.errors.map(e => ': ' + e).join(''));
  } finally { await g.close(); }
  // phones: a Photo button in the menu
  const browser = await pptr.launch({ executablePath: BROWSER, headless: true });
  try {
    const p = await browser.newPage(); await p.setViewport({ width: 390, height: 780, isMobile: true, hasTouch: true });
    await p.goto(GAME + '?room=shot' + Date.now() + '&server=http://127.0.0.1:9');
    await p.evaluate(() => { localStorage.clear(); document.getElementById('nameIn').value = 'Thumb'; document.getElementById('newBtn').click(); });
    await wait(900);
    t.ok(await p.evaluate(() => { document.getElementById('menuBtn').click(); const b = document.getElementById('mShot'); return !!b && getComputedStyle(b).display !== 'none' && b.offsetParent !== null; }), 'phones have a Photo button in the ☰ menu');
  } finally { await browser.close(); }
};
