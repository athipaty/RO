// Phone skill buttons: a second finger can press skills while the other thumb holds the joystick, and area skills
// aim by dragging the skill button (like a MOBA): release casts there, dragging onto Cancel calls it off.
const pptr = require('puppeteer-core');
const { BROWSER, wait } = require('./helpers');
const GAME = process.env.GAME_URL || ('file://' + require('path').resolve(__dirname, '../index.html').split(String.fromCharCode(92)).join('/'));
const SHOTS = process.env.DA_SHOTS;
module.exports = async t => {
  const browser = await pptr.launch({ executablePath: BROWSER, headless: true });
  try {
    const page = await browser.newPage(); const errors = []; page.on('pageerror', e => errors.push(e.message));
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
    await page.goto(GAME + '?room=da' + Date.now() + '&server=http://127.0.0.1:9');
    await page.evaluate(() => { localStorage.clear(); document.getElementById('nameIn').value = 'Aimer'; document.getElementById('newBtn').click(); }); await wait(2500);
    const cdp = await page.target().createCDPSession();
    const touch = (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts.map(([x, y, id]) => ({ x, y, id, radiusX: 4, radiusY: 4, force: 1 })) });
    // a Ranger with Arrow Rain on slot 1 and First Aid on slot 2, out in the meadow, nothing targeted
    const setup = await page.evaluate(async () => {
      const sleep = ms => new Promise(r => setTimeout(r, ms));
      enterZone('meadow'); await sleep(400); P.cls = 'ranger'; P.skills.arrowrain = 5; P.skills.twinshot = 3; P.skills.firstaid = 1; S = computeStats(); SKILLS.arrowrain.sp = () => 0; SKILLS.firstaid.sp = () => 0;
      for (const m of mobs) { m.d = { ...m.d, atk: 0, aggro: false }; }
      P.target = null; const b = getBar(); b[0] = { s: 'arrowrain' }; b[1] = { s: 'firstaid' }; P.bar = b; document.getElementById('hotbar')._sig = null; rebuildHotbar(); await sleep(300);
      window.__press = []; const ps = pressSlot; pressSlot = function (i) { __press.push(i); return ps.apply(this, arguments); }; window.__sit = 0; document.getElementById('sitBtn').addEventListener('click', () => __sit++);
      window.__casts = []; const bc = beginCast; beginCast = function (id, l, cost, fn) { __casts.push(id); return bc.apply(this, arguments); };
      window.__runs = []; const ar = SKILLS.arrowrain.run; SKILLS.arrowrain.run = function (l, x, y) { __runs.push({ x, y, px: P.x, py: P.y }); return ar.apply(this, arguments); };
      const sl = [...document.querySelectorAll('#hotbar .slot')].map(e => { const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2, !!(e._slot && e._slot.skill), r.width]; });
      const sit = document.getElementById('sitBtn').getBoundingClientRect();
      return { sl, sit: [sit.left + sit.width / 2, sit.top + sit.height / 2, sit.width > 0], W: innerWidth, H: innerHeight };
    });
    const [rain, aid] = setup.sl;
    t.ok(rain && rain[2] && rain[3] > 0 && aid && aid[2], 'Arrow Rain and First Aid sit on the phone skill buttons');

    // 1. joystick held with one thumb, the other finger taps First Aid and Sit
    const jx = 90, jy = setup.H - 260;
    await touch('touchStart', [[jx, jy, 1]]); await wait(80); await touch('touchMove', [[jx + 30, jy, 1]]); await wait(150);
    await touch('touchStart', [[jx + 30, jy, 1], [aid[0], aid[1], 2]]); await wait(60); await touch('touchEnd', [[aid[0], aid[1], 2]]); await wait(300);
    const aidCast = await page.evaluate(() => __press.filter(i => i === 1).length === 1);
    t.ok(aidCast, 'with the joystick held, a second finger tap presses the First Aid button');
    const sat0 = await page.evaluate(() => __sit);
    await touch('touchStart', [[jx + 30, jy, 1], [setup.sit[0], setup.sit[1], 3]]); await wait(60); await touch('touchEnd', [[setup.sit[0], setup.sit[1], 3]]); await wait(300);
    const sat1 = await page.evaluate(() => __sit);
    t.ok(setup.sit[2] && sat1 === sat0 + 1, 'a second finger tap reaches the round buttons too (Sit)');
    await touch('touchEnd', []); await wait(500);
    const once = await page.evaluate(() => __press.filter(i => i === 1).length + __sit);
    t.ok(once === 2, 'a press is never counted twice (' + once + ' presses for 2 taps)');
    await page.evaluate(() => { P.sitting = false; P.cd = {}; P.casting = null; __casts.length = 0; });

    // 2. drag Arrow Rain up and to the left: an aim with a reach ring, cast on release toward the drag
    await touch('touchStart', [[rain[0], rain[1], 5]]); await wait(60);
    for (let k = 1; k <= 6; k++) { await touch('touchMove', [[rain[0] - k * 10, rain[1] - k * 8, 5]]); await wait(30); }
    const mid = await page.evaluate(() => ({ aim: !!(AIM && AIM.drag), at: aimAt && { x: aimAt.x, y: aimAt.y }, p: { x: P.x, y: P.y }, stick: !document.getElementById('daStick').hidden, cancel: !document.getElementById('daCancel').hidden,
      hs: proj(P.x, P.y), as: aimAt && proj(aimAt.x, aimAt.y), range: SKILLS.arrowrain.range }));
    t.ok(mid.aim && mid.stick && mid.cancel, 'dragging an area skill starts aiming: the stick and a Cancel spot show');
    t.ok(mid.as && mid.as.x < mid.hs.x - 20 && mid.as.y < mid.hs.y, 'the aim moves the way the finger goes (up and left of the hero on screen)');
    if (SHOTS) await page.screenshot({ path: SHOTS + '/da-aim.png' });
    await touch('touchEnd', []); await wait(1500);
    const done = await page.evaluate(() => ({ casts: __casts.slice(), runs: __runs.slice(), aim: !!AIM }));
    const run = done.runs[0];
    t.ok(done.casts.includes('arrowrain') && run && !done.aim, 'letting go casts Arrow Rain there');
    t.ok(run && Math.hypot(run.x - run.px, run.y - run.py) <= mid.range + 1, 'the cast lands inside the skill\'s reach');

    // 3. drag onto Cancel: nothing is cast
    await page.evaluate(() => { P.cd = {}; P.casting = null; __casts.length = 0; __runs.length = 0; });
    await touch('touchStart', [[rain[0], rain[1], 6]]); await wait(60); await touch('touchMove', [[rain[0] - 30, rain[1] - 30, 6]]); await wait(60);
    const cr = await page.evaluate(() => { const r = document.getElementById('daCancel').getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; });
    await touch('touchMove', [[cr[0], cr[1], 6]]); await wait(80);
    const hot = await page.evaluate(() => document.getElementById('daCancel').classList.contains('hot'));
    await touch('touchEnd', []); await wait(900);
    const cancelled = await page.evaluate(() => ({ casts: __casts.length, aim: !!AIM, hidden: document.getElementById('daCancel').hidden }));
    t.ok(hot && !cancelled.casts && !cancelled.aim && cancelled.hidden, 'dragging onto Cancel calls it off');

    // 4. a quick tap with a monster near and nothing targeted: Arrow Rain goes onto the nearest monster
    const near = await page.evaluate(async () => { P.cd = {}; P.casting = null; P.target = null; __casts.length = 0; __runs.length = 0;
      const live = mobs.filter(m => !m.dead); for (const m of live) m.x = 99999; const m = live[0]; m.x = P.x + 90; m.y = P.y + 20; m.hp = m.d.hp; return m.id || true; });
    await touch('touchStart', [[rain[0], rain[1], 7]]); await wait(60); await touch('touchEnd', []); await wait(1500);
    const qt = await page.evaluate(() => ({ casts: __casts.slice(), run: __runs[0], aim: !!AIM, tg: P.target && { x: P.target.x, y: P.target.y } }));
    t.ok(near && qt.casts.includes('arrowrain') && !qt.aim && qt.run && qt.tg && Math.hypot(qt.run.x - qt.run.px - 90, qt.run.y - qt.run.py - 20) < 40, 'a quick tap with nothing targeted casts Arrow Rain on the nearest monster');

    // 5. no monster within reach: a quick tap asks for a tap on the ground, as before
    await page.evaluate(() => { P.cd = {}; P.casting = null; P.target = null; for (const m of mobs) m.x = 99999; });
    await touch('touchStart', [[rain[0], rain[1], 8]]); await wait(60); await touch('touchEnd', []); await wait(300);
    const tap = await page.evaluate(() => ({ aim: !!AIM, drag: !!(AIM && AIM.drag), id: AIM && AIM.id }));
    t.ok(tap.aim && !tap.drag && tap.id === 'arrowrain', 'with no monster near, a quick tap asks for a tap on the ground');
    await page.evaluate(() => aimCancel());

    // 6. a single-target skill with nothing targeted picks the nearest monster (outside auto-hunt)
    const single = await page.evaluate(async () => { P.cd = {}; P.casting = null; P.target = null; P.auto = false; __casts.length = 0; SKILLS.twinshot.sp = () => 0;
      const m = mobs.find(x => !x.dead); m.x = P.x + 120; m.y = P.y; m.hp = m.d.hp; useSkill('twinshot'); await new Promise(r => setTimeout(r, 600));
      return { tg: P.target === m, cast: __casts.includes('twinshot') }; });
    t.ok(single.tg && single.cast, 'Twin Shot with nothing targeted picks the nearest monster and shoots it');
    t.ok(!errors.length, 'no script errors' + (errors.length ? ': ' + errors.join(' | ') : ''));
  } finally { await browser.close(); }
};
