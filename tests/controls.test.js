// controls and HUD: near-miss taps beside phone buttons do not walk; long-press for monster info; buffs on the right; icons
const pptr = require('puppeteer-core');
const { BROWSER, wait, player, newRoom } = require('./helpers');
const GAME = process.env.GAME_URL || ('file://' + require('path').resolve(__dirname, '../index.html').replace(/\\/g, '/'));
module.exports = async t => {
  const browser = await pptr.launch({ executablePath: BROWSER, headless: true });
  try {
    const page = await browser.newPage(); const errors = []; page.on('pageerror', e => errors.push(e.message));
    await page.setViewport({ width: 390, height: 780, isMobile: true, hasTouch: true, deviceScaleFactor: 1 });
    await page.goto(GAME + '?room=ctl' + Date.now() + '&server=http://127.0.0.1:9');
    await page.evaluate(() => { localStorage.clear(); document.getElementById('nameIn').value = 'Thumbs'; document.getElementById('newBtn').click(); });
    await wait(1800);
    const ev = (f, ...a) => page.evaluate(f, ...a);
    const ui = await ev(() => ({ icons: ['menuBtn', 'autoBtn', 'chatBtn', 'sitBtn', 'atkBtn'].every(id => document.querySelector('#' + id + ' svg.aic')), pads: document.querySelectorAll('#actPads .actPad:not([hidden])').length }));
    t.ok(ui.icons, 'phone buttons are round icon buttons');
    t.ok(ui.pads >= 5, `each phone button has a catch ring for near-misses (${ui.pads})`);
    // tap just outside the Chat button's edge
    const spot = await ev(() => { enterZone('meadow'); for (const m of mobs) { m.x = 30; m.y = 30; } P.path = []; const r = document.getElementById('chatBtn').getBoundingClientRect(); return { x: r.left - 6, y: r.top + r.height / 2, x0: P.x, y0: P.y }; });
    await page.touchscreen.tap(spot.x, spot.y); await wait(700);
    const moved = await ev(s => Math.hypot(P.x - s.x0, P.y - s.y0) > 8 || P.path.length > 0, spot);
    t.ok(!moved, 'a tap just beside a button does not walk your hero');
    const hold = await ev(async () => { const m = mobs.find(x => !x.dead); m.x = P.x + 60; m.y = P.y; m.state = 'idle'; m.tx = null; m.d = { ...m.d, spd: 0 }; await new Promise(r => setTimeout(r, 200));
      const s = proj(m.x, m.y); return { x: s.x - camX, y: s.y - camY - m.d.size * .9, id: m.d.id }; });
    const cdp = await page.target().createCDPSession();
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: hold.x, y: hold.y }] }); await wait(800);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await wait(200);
    t.ok(await ev(id => panelKind === 'mob' && panelArg === id, hold.id), 'pressing and holding a monster opens its info');
    await ev(() => closePanel());
    const buffs = await ev(() => { buff('blessing', 'Blessing', 60, { str: 3 }); return new Promise(r => setTimeout(() => { const b = document.getElementById('buffs'), mb = document.getElementById('minibox').getBoundingClientRect(), br = b.getBoundingClientRect();
      r({ outside: !document.getElementById('hud').contains(b), right: br.left > innerWidth / 2, below: br.top >= mb.bottom }); }, 400)); });
    t.ok(buffs.outside && buffs.right && buffs.below, 'buff icons sit on the right, under the minimap');
    t.ok(await ev(() => { const m = mobs.find(x => !x.dead); P.target = m; updateHud(); return document.getElementById('target').hidden; }), 'no monster card in the middle of the screen');
    const sit = await ev(async () => { const b = document.getElementById('sitBtn'); const until = async f => { for (let i = 0; i < 30 && !f(); i++) await new Promise(r => setTimeout(r, 100)); };
      P.sitting = false; await until(() => /Sit/.test(b.getAttribute('aria-label') || '')); const a = b.getAttribute('aria-label'), sa = b.querySelector('svg').innerHTML;
      P.target = null; P.queued = null; P.path = []; P.auto = false; P.sitting = true; await until(() => /Stand/.test(b.getAttribute('aria-label') || '')); const c = b.getAttribute('aria-label'), sc = b.querySelector('svg').innerHTML; P.sitting = false; return { a, c, changed: sa !== sc }; });
    t.ok(/Sit/.test(sit.a) && /Stand up/.test(sit.c) && sit.changed, 'the rest button shows Sit, and Stand up (a standing figure) while sitting');
    const fade = await ev(() => { enterZone('capital', 'town'); const b = Z.buildings.find(x => x.name === 'Grand Library'); return { behind: bldHides(b, (b.x - .4) * TILE, (b.y + b.h * .6) * TILE), front: bldHides(b, (b.x + b.w / 2) * TILE, (b.y + b.h + 2) * TILE) }; });
    t.ok(fade.behind && !fade.front, 'a building fades when your hero is behind it, not when in front');
    t.ok(errors.length === 0, 'no script errors' + errors.map(e => ': ' + e).join(''));
  } finally { await browser.close(); }
};
