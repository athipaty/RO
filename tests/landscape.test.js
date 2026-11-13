// phones held sideways: compact status box and minimap, round buttons in a top row, chat box as wide as its tabs
const pptr = require('puppeteer-core');
const { BROWSER, wait } = require('./helpers');
const GAME = process.env.GAME_URL || ('file://' + require('path').resolve(__dirname, '../index.html').split(String.fromCharCode(92)).join('/'));
module.exports = async t => {
  const browser = await pptr.launch({ executablePath: BROWSER, headless: true });
  try {
    const page = await browser.newPage(); const errors = []; page.on('pageerror', e => errors.push(e.message));
    await page.setViewport({ width: 800, height: 370, isMobile: true, hasTouch: true, deviceScaleFactor: 1 });
    await page.goto(GAME + '?room=land' + Date.now() + '&server=http://127.0.0.1:9');
    await page.evaluate(() => { localStorage.clear(); document.getElementById('nameIn').value = 'Wide'; document.getElementById('newBtn').click(); });
    await wait(2500); const ev = (f, ...a) => page.evaluate(f, ...a);
    const r = await ev(() => { const R = id => document.getElementById(id).getBoundingClientRect(); const hud = R('hud'), mb = R('minibox'), log = R('log'), tabs = document.getElementById('logTabs');
      const room = [...tabs.children].find(c => c.dataset && c.dataset.tab === 'room').getBoundingClientRect(); const menu = R('menuBtn'), atk = R('atkBtn');
      return { hudH: hud.height, mbH: mb.height, logRight: log.right, roomRight: room.right, menuTop: menu.top, atkBottom: atk.bottom, gold: getComputedStyle(document.getElementById('gold')).display };});
    t.ok(r.hudH < 110 && r.gold === 'none', `the status box is compact sideways (${Math.round(r.hudH)}px tall)`);
    t.ok(r.mbH < 140, `the minimap is small (${Math.round(r.mbH)}px tall)`);
    t.ok(r.logRight - r.roomRight < 30 && r.logRight - r.roomRight > -2, 'the chat box ends just after the Room tab (' + Math.round(r.logRight - r.roomRight) + 'px)');
    t.ok(r.menuTop < 60, 'the round buttons sit in a row at the top');
    const fold = await ev(() => { document.getElementById('zName').click(); const slim = document.getElementById('minibox').classList.contains('slim'); document.getElementById('zName').click(); return slim; });
    t.ok(fold, 'tapping the region name folds the minimap away');
    const quick = await ev(() => { const q = document.getElementById('quick'), r = q.getBoundingClientRect(), mb = document.getElementById('minibox').getBoundingClientRect();
      q.querySelector('[data-open="skills"]').click(); const k = panelKind; closePanel(); return { n: q.querySelectorAll('.qk').length, beside: r.right <= mb.left + 2 && r.top < 60, k }; });
    t.ok(quick.n === 5 && quick.beside && quick.k === 'skills', 'Stats, Skills, Items, Equip and Quests buttons sit beside the minimap and open their windows');
    const auto = await ev(() => { const a = document.getElementById('autoBtn').getBoundingClientRect(), atk = document.getElementById('atkBtn').getBoundingClientRect(); return { right: a.left > innerWidth * .7, above: a.bottom < atk.top }; });
    t.ok(auto.right && auto.above, 'Auto sits on the right, above the shortcuts');
    await wait(700);
    const online = await ev(() => { const b = document.getElementById('onlineBadge'), r = b.getBoundingClientRect(), h = document.getElementById('hud').getBoundingClientRect(), l = document.getElementById('log').getBoundingClientRect();
      return { shown: getComputedStyle(b).display !== 'none' && r.width > 0, under: r.top >= h.bottom && r.top - h.bottom < 14 && Math.abs(r.left - h.left) < 2, clear: r.bottom <= l.top, text: b.textContent }; });
    t.ok(online.shown && online.under && online.clear, `the online badge shows sideways, just under the status box ("${online.text}")`);
    t.ok(errors.length === 0, 'no script errors' + errors.map(e => ': ' + e).join(''));
  } finally { await browser.close(); }
};
