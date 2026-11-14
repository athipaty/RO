// Look and feel: rarity frames, tab icons, new-region card, town lights at night, phone top bars, thumb column, sheets
const pptr = require('puppeteer-core');
const { BROWSER, wait } = require('./helpers');
const GAME = process.env.GAME_URL || ('file://' + require('path').resolve(__dirname, '../index.html').split(String.fromCharCode(92)).join('/'));
module.exports = async t => {
  const browser = await pptr.launch({ executablePath: BROWSER, headless: true });
  try {
    const page = await browser.newPage(); const errors = []; page.on('pageerror', e => errors.push(e.message));
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 1 });
    await page.goto(GAME + '?room=pui' + Date.now() + '&server=http://127.0.0.1:9');
    await page.evaluate(() => { localStorage.clear(); document.getElementById('nameIn').value = 'Pui'; document.getElementById('newBtn').click(); }); await wait(2500);
    const r = await page.evaluate(async () => { const sleep = ms => new Promise(r => setTimeout(r, ms)), out = {};
      // rarity frames and tab icons
      giveItem('sproutling_sig', 1); giveItem('fangblade', 1); invTab = 'equip'; openPanel('items'); await sleep(100);
      out.frame = !!panel.querySelector('.ico.img.r1'); out.tabs = panel.querySelectorAll('[data-act="invtab"] svg.tabi').length; out.grip = !!panel.querySelector('.sheetgrip');
      // swipe down on the grip closes the window
      const g = panel.querySelector('.sheetgrip'), mk = (type, y) => { const tt = new Touch({ identifier: 1, target: g, clientX: 100, clientY: y }); g.dispatchEvent(new TouchEvent(type, { touches: type === 'touchend' ? [] : [tt], changedTouches: [tt], bubbles: true })); };
      mk('touchstart', 100); mk('touchmove', 200); mk('touchmove', 330); mk('touchend', 330); out.swiped = panel.hidden;
      // upright: thumb column; top bars
      await sleep(500); out.thumb = document.body.classList.contains('thumbq'); const q = document.getElementById('quick').getBoundingClientRect(), log = document.getElementById('log').getBoundingClientRect();
      out.colAboveLog = q.left < 60 && q.bottom <= log.top && q.height > q.width;
      updateHud(); out.bars = !document.getElementById('topBars').hidden;
      // new region card: only the first time, and taps pass through
      enterZone('woods'); await sleep(900); const c = document.getElementById('zoneCard'); out.card = c && c.classList.contains('show') && /Whispering Woods/.test(c.textContent) && c.querySelectorAll('.zcm').length >= 4;
      out.through = getComputedStyle(c).pointerEvents === 'none'; c.classList.remove('show'); if (!P.visited.includes('meadow')) P.visited.push('meadow'); enterZone('meadow'); await sleep(200); enterZone('woods'); await sleep(900); out.once = !c.classList.contains('show');
      // town lights: at night, none by day
      enterZone('town'); await sleep(200); const gh = gameHour; gameHour = () => 23; out.night = nightLights().length; gameHour = () => 12; out.day = nightLights().length; gameHour = gh;
      return out; });
    t.ok(r.frame, 'an uncommon item gets a coloured frame');
    t.ok(r.tabs === 4, 'the four bag tabs have icons');
    t.ok(r.grip && r.swiped, 'windows have a grab handle and a swipe down closes them');
    t.ok(r.thumb && r.colAboveLog, 'upright, the quick buttons stand in a column on the left above the chat');
    t.ok(r.bars, 'HP and SP bars run along the top edge');
    t.ok(r.card && r.through, 'a first visit shows the new region card with its monsters, and taps go through it');
    t.ok(r.once, 'the card shows only on the first visit');
    t.ok(r.night > 0 && r.day === 0, `town windows light up at night (${r.night} lights) and not by day`);
    t.ok(errors.length === 0, 'no script errors' + errors.map(e => ': ' + e).join(''));
  } finally { await browser.close(); }
};
