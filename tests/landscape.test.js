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
    t.ok(errors.length === 0, 'no script errors' + errors.map(e => ': ' + e).join(''));
  } finally { await browser.close(); }
};
