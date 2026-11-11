// The public landing page (welcome.html): loads cleanly, its pictures load, every Play button opens the game,
// it fits a phone without sideways scrolling, and the title screen links to it.
const pptr = require('puppeteer-core');
const path = require('path'), url = require('url');
const { BROWSER, wait } = require('./helpers');
const BASE = process.env.GAME_URL ? process.env.GAME_URL.replace(/index\.html.*$/, '') : url.pathToFileURL(path.join(__dirname, '..') + path.sep).href;

module.exports = async t => {
  const browser = await pptr.launch({ executablePath: BROWSER, headless: true });
  try {
    for (const [w, h, mobile, label] of [[1280, 800, false, 'a computer'], [390, 800, true, 'a phone']]) {
      const p = await browser.newPage(); const errors = []; p.on('pageerror', e => errors.push(e.message));
      await p.setViewport({ width: w, height: h, isMobile: mobile, hasTouch: mobile });
      await p.goto(BASE + 'welcome.html');
      const r = await p.evaluate(async () => {
        document.querySelectorAll('img').forEach(i => { i.loading = 'eager'; });
        await Promise.all([...document.images].map(i => i.complete ? 0 : new Promise(res => { i.onload = i.onerror = res; })));
        const play = [...document.querySelectorAll('a')].filter(a => /Play (now|Embervale)|^Play$/.test(a.textContent.trim().replace(/^▶ /, '')));
        return { title: document.title, h1: document.querySelector('h1').textContent, imgs: document.images.length, broken: [...document.images].filter(i => !i.naturalWidth).map(i => i.src),
          stretched: [...document.images].filter(i => Math.abs(i.clientWidth / i.clientHeight - i.naturalWidth / i.naturalHeight) > .05).length,
          play: play.length, playOk: play.every(a => /index\.html$/.test(a.getAttribute('href'))), wide: document.documentElement.scrollWidth > innerWidth + 1,
          alts: [...document.images].every(i => i.alt.length > 10), og: !!document.querySelector('meta[property="og:image"]') };
      });
      t.ok(/Embervale/.test(r.title) && r.h1.length > 10 && r.og, `the landing page loads on ${label}, with a link preview`);
      t.ok(r.imgs >= 5 && !r.broken.length && !r.stretched && r.alts, `its ${r.imgs} screenshots load, keep their shape and are described` + (r.broken.length ? ' (broken: ' + r.broken.join(', ') + ')' : ''));
      t.ok(r.play >= 3 && r.playOk, `all ${r.play} Play buttons open the game`);
      t.ok(!r.wide, `no sideways scrolling on ${label}`);
      await wait(1500);
      t.ok(await p.evaluate(() => document.getElementById('online').textContent.length > 10), 'the online line fills in (or falls back politely)');
      t.ok(errors.length === 0, 'no script errors' + errors.map(e => ': ' + e).join(''));
      await p.close();
    }
    const g = await browser.newPage();
    await g.goto(BASE + 'index.html?room=land' + Date.now() + '&server=http://127.0.0.1:9');
    t.ok(await g.evaluate(() => { const a = document.querySelector('.aboutLink'); return !!a && a.getAttribute('href') === 'welcome.html' && a.offsetParent !== null; }), 'the title screen links to the landing page');
  } finally { await browser.close(); }
};
