// Phones: battle mode clears the screen; held sideways the window buttons (Stats, Skills, Equip, Items) stay (v1.45.4).
const pptr = require('puppeteer-core');
const { BROWSER, wait } = require('./helpers');
const GAME = process.env.GAME_URL || ('file://' + require('path').resolve(__dirname, '../index.html').split(String.fromCharCode(92)).join('/'));
module.exports = async t => {
  const browser = await pptr.launch({ executablePath: BROWSER, headless: true });
  try {
    const page = await browser.newPage(); const errors = []; page.on('pageerror', e => errors.push(e.message));
    await page.setViewport({ width: 844, height: 390, isMobile: true, hasTouch: true });
    await page.goto(GAME + '?room=fu' + Date.now() + '&server=http://127.0.0.1:9');
    await page.evaluate(() => { localStorage.clear(); document.getElementById('nameIn').value = 'Fighter'; document.getElementById('newBtn').click(); }); await wait(2500);
    const r = await page.evaluate(async () => { enterZone('meadow'); document.body.classList.add('fightui'); await new Promise(r => setTimeout(r, 600));
      const vis = s => { const e = document.querySelector(s), c = getComputedStyle(e); return +c.opacity > .9 && c.pointerEvents !== 'none'; };
      const q = document.getElementById('quickL'), b = q.querySelector('button'), br = b.getBoundingClientRect(), hit = document.elementFromPoint(br.left + br.width / 2, br.top + br.height / 2);
      return { quick: vis('#quickL') && q.contains(hit), map: !vis('#minibox'), ring: vis('#hotbar') && vis('#atkBtn') }; });
    t.ok(r.quick, 'sideways in battle mode the Stats / Skills / Equip / Items buttons stay and can be tapped');
    t.ok(r.map && r.ring, 'the minimap still fades, and the skill ring and Attack stay');
    t.ok(!errors.length, 'no script errors' + (errors.length ? ': ' + errors.join(' | ') : ''));
  } finally { await browser.close(); }
};
