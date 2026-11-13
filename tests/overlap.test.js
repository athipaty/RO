// phones: no on-screen buttons or boxes overlap, sideways and upright, in a party (folded and open) with a buff on
const pptr = require('puppeteer-core');
const { BROWSER, wait } = require('./helpers');
const GAME = process.env.GAME_URL || ('file://' + require('path').resolve(__dirname, '../index.html').split(String.fromCharCode(92)).join('/'));
const audit = () => { const vis = e => { const s = getComputedStyle(e); if (s.display === 'none' || s.visibility === 'hidden' || +s.opacity === 0) return false; const r = e.getBoundingClientRect(); return r.width > 2 && r.height > 2 && r.bottom > 0 && r.right > 0 && r.top < innerHeight && r.left < innerWidth; };
  const name = e => e.id ? '#' + e.id : (e.dataset.open ? 'qk:' + e.dataset.open : (typeof e.className === 'string' ? e.className.split(' ')[0] : e.tagName));
  const SKIP = ['expEdge', 'zoneBanner', 'danger', 'joy', 'actPads', 'fullOffer', 'cv', 'autoPick', 'whoList', 'panel', 'itemCard', 'title', 'death', 'confirm', 'chatbar', 'emoteBar'];
  const tops = [...document.body.querySelectorAll('*')].filter(e => getComputedStyle(e).position === 'fixed' && vis(e) && !SKIP.includes(e.id) && !e.closest('#actPads,#panel,#itemCard,#title') && e.getBoundingClientRect().width < innerWidth * .7);
  const items = []; for (const t of tops) { const b = [...t.querySelectorAll('button,.slot')].filter(vis); if (['actions', 'quick', 'quickL', 'hotbar', 'dock', 'buffs'].includes(t.id) && b.length) b.forEach(x => items.push(x)); else items.push(t); }
  const u = [...new Set(items)], ov = [], round = e => { const q = e.getBoundingClientRect(); return Math.abs(q.width - q.height) < 4 && parseFloat(getComputedStyle(e).borderRadius) >= q.width * .4; };
  for (let i = 0; i < u.length; i++) for (let j = i + 1; j < u.length; j++) { const A = u[i], B = u[j]; if (A.contains(B) || B.contains(A)) continue; const a = A.getBoundingClientRect(), c = B.getBoundingClientRect();
    if (round(A) && round(B)) { if (Math.hypot(a.left + a.width / 2 - c.left - c.width / 2, a.top + a.height / 2 - c.top - c.height / 2) < a.width / 2 + c.width / 2 - 1) ov.push(name(A) + ' o ' + name(B)); continue; }
    if (Math.min(a.right, c.right) - Math.max(a.left, c.left) > 2 && Math.min(a.bottom, c.bottom) - Math.max(a.top, c.top) > 2) ov.push(name(A) + ' x ' + name(B)); }
  return { n: u.length, ov }; };
module.exports = async t => {
  const browser = await pptr.launch({ executablePath: BROWSER, headless: true });
  try {
    for (const [w, h, label] of [[844, 390, 'sideways'], [667, 375, 'small sideways'], [390, 844, 'upright']]) {
      const page = await browser.newPage(); const errors = []; page.on('pageerror', e => errors.push(e.message));
      await page.setViewport({ width: w, height: h, isMobile: true, hasTouch: true, deviceScaleFactor: 1 });
      await page.goto(GAME + '?room=ov' + Date.now() + '&server=http://127.0.0.1:9');
      await page.evaluate(() => { localStorage.clear(); document.getElementById('nameIn').value = 'Wide'; document.getElementById('newBtn').click(); }); await wait(2500);
      await page.evaluate(() => { enterZone('meadow'); const me = selfPeer(); SOC.party = { leader: me, mode: 'share', loot: 'each', members: [{ peer: me, name: 'Wide' }, { peer: 'x1', name: 'Mira' }, { peer: 'x2', name: 'Toby' }] };
        NET.others.set('x1', { n: 'Mira', cls: 'warden', lv: 12, z: 'meadow', hp: 80, x: P.x, y: P.y, rx: P.x, ry: P.y }); NET.others.set('x2', { n: 'Toby', cls: 'ranger', lv: 9, z: 'meadow', hp: 55, x: P.x, y: P.y, rx: P.x, ry: P.y });
        P.buffs = P.buffs || {}; P.buffs.blessing = { name: 'Blessing', until: now + 300, b: { str: 2 } }; renderParty(); });
      for (const fold of [true, false]) { await page.evaluate(f => { document.getElementById('partyBox').classList.toggle('fold', f); renderParty(); }, fold); await wait(1300);
        const r = await page.evaluate(audit); t.ok(r.ov.length === 0, `${label}, party ${fold ? 'folded' : 'open'}: ${r.n} buttons and boxes, none overlap` + (r.ov.length ? ': ' + r.ov.join(', ') : '')); }
      t.ok(errors.length === 0, `${label}: no script errors` + errors.map(e => ': ' + e).join(''));
      await page.close(); }
  } finally { await browser.close(); }
};
