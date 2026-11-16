// New hero art (js/hero2.js): off by default; ?hero2=1 / localStorage turns it on for this device;
// a breathing bob, and every calling and hairstyle draws without errors
const { player, newRoom, wait } = require('./helpers');
module.exports = async t => {
  const A = await player('Breather', newRoom(), { server: 'http://127.0.0.1:9' });
  try {
    t.ok(await A.ev(() => typeof drawHuman2 === 'function' && drawHuman !== drawHuman2), 'the new art is off by default');
    await A.ev(() => localStorage.setItem('embervale.hero2', '1')); await A.page.reload(); await wait(1500);
    await A.ev(() => { if (!P) { document.getElementById('nameIn').value = 'Breather'; document.getElementById('newBtn').click(); } }); await wait(2000);
    const r = await A.ev(() => { const out = { bad: [] }; out.on = HERO2_ON === true;
      const c = document.createElement('canvas'); c.width = c.height = 120; const main = ctx; ctx = c.getContext('2d');
      try {
        // breathing: the belt line moves a little over time while standing still
        const ys = []; for (const tt of [0, .7, 1.4, 2.1]) { now = tt; ys.push(drawHuman2(60, 100, '#888', '#333', 1, 0, { look: { style: 1, hair: '#333', eye: '#36c', skin: '#fdc', seed: 0 } })); }
        out.breath = Math.max(...ys) - Math.min(...ys);
        for (const cls of Object.keys(CLASSES)) for (let st = 0; st < 8; st++) for (const f of [1, -1]) {
          try { drawHuman2(60, 100, CLASSES[cls].col, CLASSES[cls].hair, f, st % 2 ? .3 : 0, { look: { style: st, hair: '#333', eye: '#36c', skin: '#fdc', seed: st, body: st % 3 }, outfit: baseOf(cls), back: true, cast: st === 3 }); }
          catch (e) { out.bad.push(cls + '/' + st + ': ' + e.message); } }
      } finally { ctx = main; }
      localStorage.setItem('embervale.hero2', '0'); return out; });
    // the start screen preview faces you and never turns around
    const pv = await A.ev(async () => { const calls = []; const dh = drawHuman; drawHuman = function (x, y, b, h, f, w, o) { calls.push([f, !!(o && o.back)]); return dh.apply(this, arguments); };
      for (const tt of [0.2, 1.8, 3.4, 5.0]) { now = tt; drawLookPreview(); } drawHuman = dh; return calls; });
    const stBad = await A.ev(() => { const bad = [], c = document.createElement('canvas'), main = ctx; ctx = c.getContext('2d');
      try { for (const cls of Object.keys(CLASSES)) for (const tt of [0, 1.1]) { now = tt; try { drawStance(cls, { ...lookFor('X'), style: 1 }, 30, 50, 1); } catch (e) { bad.push(cls + ': ' + e.message); } } } finally { ctx = main; }
      return bad; });
    t.ok(stBad.length === 0, 'every calling has a start-screen stance that draws without errors ' + stBad.slice(0, 3).join(' | '));
    t.ok(pv.length >= 4 && pv.every(([f, b]) => f === 1 && !b), 'the start screen hero faces you and does not turn around ' + JSON.stringify(pv));
    t.ok(r.on, 'the preview switch turns the new art on for this device');
    t.ok(r.breath > .5 && r.breath < 3, `standing heroes breathe (the body moves ${r.breath.toFixed(2)} px)`);
    t.ok(r.bad.length === 0, 'every calling and all eight hairstyles draw without errors ' + r.bad.slice(0, 3).join(' | '));
    t.ok(A.page.errors.length === 0, 'no script errors' + A.page.errors.map(e => ': ' + e).join(''));
  } finally { await A.close(); }
};
