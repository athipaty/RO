// Phone joystick: drag anywhere on the game to walk; a plain tap still walks / attacks as before.
const pptr = require('puppeteer-core');
const { BROWSER, wait } = require('./helpers');
const GAME = process.env.GAME_URL || ('file://' + require('path').resolve(__dirname, '../index.html').replace(/\\/g, '/'));

module.exports = async t => {
  const browser = await pptr.launch({ executablePath: BROWSER, headless: true });
  try {
    const page = await browser.newPage(); const errors = []; page.on('pageerror', e => errors.push(e.message));
    await page.setViewport({ width: 390, height: 780, isMobile: true, hasTouch: true, deviceScaleFactor: 1 });
    await page.goto(GAME + '?room=joy' + Date.now() + '&server=http://127.0.0.1:9');
    await page.evaluate(() => { localStorage.clear(); document.getElementById('nameIn').value = 'Thumb'; document.getElementById('newBtn').click(); });
    await wait(800);
    const ev = (f, ...a) => page.evaluate(f, ...a);
    await ev(() => { enterZone('meadow'); for (const m of mobs) { m.x = 30; m.y = 30; m.aggro = false; } });
    await wait(500);
    const touch = page.touchscreen;
    const pos = () => ev(() => ({ x: P.x, y: P.y, face: P.face, moving: P.moving, joy: !document.getElementById('joy').hidden }));

    // drag right on the screen: a stick appears and the character walks screen-right
    const p0 = await pos();
    await touch.touchStart(120, 450); await touch.touchMove(140, 450); await touch.touchMove(190, 450);
    await wait(700);
    const p1 = await pos();
    const sx = await ev((a, b) => { const s0 = proj(a.x, a.y), s1 = proj(b.x, b.y); return { dx: s1.x - s0.x, dy: s1.y - s0.y }; }, p0, p1);
    t.ok(p1.joy && p1.moving, 'dragging shows the stick and the character walks');
    t.ok(sx.dx > 40 && Math.abs(sx.dy) < sx.dx * .3 && p1.face === 1, `the character goes the way the thumb points (screen ${Math.round(sx.dx)}, ${Math.round(sx.dy)})`);
    // pull up: walk screen-up
    await touch.touchMove(120, 380); await wait(500);
    const p2 = await pos();
    const up = await ev((a, b) => { const s0 = proj(a.x, a.y), s1 = proj(b.x, b.y); return s1.y - s0.y; }, p1, p2);
    t.ok(up < -25, `pulling up walks up the screen (${Math.round(up)})`);
    await touch.touchEnd(); await wait(300);
    const p3 = await pos(); await wait(300); const p4 = await pos();
    t.ok(!p3.joy && Math.hypot(p4.x - p3.x, p4.y - p3.y) < 1, 'letting go hides the stick and stops');

    // a light push walks slower than a full one
    const speed = async (dx) => { const a = await pos(); await touch.touchStart(200, 450); await touch.touchMove(200 + dx * .4, 450); await touch.touchMove(200 + dx, 450); await wait(600); const b = await pos(); await touch.touchEnd(); await wait(200); return Math.hypot(b.x - a.x, b.y - a.y); };
    const slow = await speed(-24), fast = await speed(-60);
    t.ok(slow > 3 && fast > slow * 1.4, `a light push walks slower (${Math.round(slow)} vs ${Math.round(fast)}px)`);

    // a tap still walks to that spot
    const before = await pos();
    const tap = await ev(() => { const s = proj(P.x + 60, P.y + 60); return { x: s.x - camX, y: s.y - camY }; });
    await touch.tap(tap.x, tap.y); await wait(1500);
    const after = await pos();
    t.ok(Math.hypot(after.x - before.x, after.y - before.y) > 40 && !after.joy, 'a plain tap still walks there');
    // a tap on a monster targets it
    const mt = await ev(() => { const m = mobs[0]; m.x = P.x + 70; m.y = P.y; m.dead = false; const s = proj(m.x, m.y); return { x: s.x - camX, y: s.y - camY - m.d.size * .9 }; });
    await touch.tap(mt.x, mt.y); await wait(200);
    t.ok(await ev(() => P.target === mobs[0]), 'a tap on a monster targets it');
    // a drag cancels the target and walks instead
    await touch.touchStart(150, 450); await touch.touchMove(150, 480); await touch.touchMove(150, 520); await wait(300);
    t.ok(await ev(() => !P.target && P.moving), 'dragging takes over from the attack');
    await touch.touchEnd();
    t.ok(errors.length === 0, 'no script errors' + errors.map(e => ': ' + e).join(''));
  } finally { await browser.close(); }
};
