// v1.49.5 hotbar editor: each skill says what kind it is, and on a phone the slots sit where they are on the screen
// (the arcs around the Attack button) instead of in a line.
const pptr = require('puppeteer-core');
const { BROWSER, wait } = require('./helpers');
const GAME = process.env.GAME_URL || ('file://' + require('path').resolve(__dirname, '../index.html').replace(/\\/g, '/'));
module.exports = async t => {
  const browser = await pptr.launch({ executablePath: BROWSER, headless: true });
  try {
    const page = await browser.newPage(); const errors = []; page.on('pageerror', e => errors.push(e.message));
    await page.setViewport({ width: 390, height: 780, isMobile: true, hasTouch: true, deviceScaleFactor: 1 });
    await page.goto(GAME + '?room=hbm' + Date.now() + '&server=http://127.0.0.1:9');
    await page.evaluate(() => { localStorage.clear(); document.getElementById('nameIn').value = 'Mapper'; document.getElementById('newBtn').click(); });
    await wait(1800);
    const ev = (f, ...a) => page.evaluate(f, ...a);
    await ev(() => { P.cls = 'arcanist'; for (const id of CLASSES[P.cls].skills) P.skills[id] = 1; S = computeStats(); P.bar = null; getBar(); rebuildHotbar(); });
    await wait(400);
    const r = await ev(() => {
      openPanel('hotbar');
      const real = [...document.querySelectorAll('#hotbar > .slot')].slice(0, 8).map(e => e.getBoundingClientRect());
      const ed = [...document.querySelectorAll('#panel .hbslots .hbs')].map(e => ({ x: parseFloat(e.style.left), y: parseFloat(e.style.top) }));
      // each slot lies in the same direction from slot 1 as on the screen (left/right and up/down)
      const dir = (d, tol) => Math.abs(d) < tol ? 0 : Math.sign(d);
      const same = ed.length === 8 && real.every((q, i) => dir(q.left - real[0].left, 12) === dir(ed[i].x - ed[0].x, 8) && dir(q.top - real[0].top, 12) === dir(ed[i].y - ed[0].y, 8));
      return { map: !!document.querySelector('#panel .hbslots.hbmap'), atk: !!document.querySelector('#panel .hbatk'), same,
        kinds: [...document.querySelectorAll('#panel .hbk')].map(b => b.textContent) };
    });
    t.ok(r.map && r.atk && r.same, 'on a phone the editor places slots like the real hotbar, around the Attack button ' + JSON.stringify({ map: r.map, atk: r.atk, same: r.same }));
    t.ok(['Single target', 'Area', 'Around you', 'Heal', 'Buff', 'Ground (aim)'].every(k => r.kinds.includes(k)), 'every skill in the editor says its type (' + r.kinds.join(', ') + ')');
    // held sideways: skills and items on the left, the hotbar on the right
    await ev(() => closePanel());
    await page.setViewport({ width: 860, height: 400, isMobile: true, hasTouch: true, deviceScaleFactor: 1 });
    await wait(800);
    const land = await ev(() => { openPanel('hotbar'); const L = document.querySelector('#panel .hbleft'), R = document.querySelector('#panel .hbright');
      if (!L || !R) return null; const l = L.getBoundingClientRect(), r = R.getBoundingClientRect(); return { right: r.left >= l.right - 2, side: Math.abs(r.top - l.top) < 40 }; });
    t.ok(land && land.right && land.side, 'on a phone held sideways the hotbar sits on the right, skills and items on the left ' + JSON.stringify(land));
    // the library's sigil list can be filtered and sorted by every bonus sigils give
    const cx = await ev(() => { const kk = codexKills(); for (const id in MOBS) kk[id] = 1; CODEX.slot = 'all'; CODEX.ab = 'all'; const d = document.createElement('div'); d.innerHTML = codexHtml();
      const keys = new Set(); for (const s of codexAll()) for (const k in s.b) keys.add(k);
      return { chips: [...d.querySelectorAll('[data-act="cxab"]')].map(b => b.dataset.arg), keys: [...keys] }; });
    t.ok(cx.keys.every(k => cx.chips.includes(k)) && cx.chips.includes('critdmg') && cx.chips.includes('leech'), 'the sigil library offers every bonus sigils give as a filter (' + cx.chips.join(', ') + ')');
    t.ok(errors.length === 0, 'no script errors' + errors.map(e => ': ' + e).join(''));
  } finally { await browser.close(); }
};
