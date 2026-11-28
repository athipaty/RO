// (v1.88.0) every ailment is drawn on the character (ice block, stars, Zs, bubbles, sealed bubble, smoke), and the
// presence tells other players which ones you have
const { player, wait, newRoom } = require('./helpers');
module.exports = async t => {
  const A = await player('Iced', newRoom(), { zone: 'meadow', server: 'http://127.0.0.1:9' });
  try {
    await A.ev(() => { for (const m of mobs) { m.x = 20; m.y = 20; m.d.aggro = false; } });
    for (const k of await A.ev(() => AFX_KEYS)) {
      const r = await A.ev(async k => { P.ail = { [k]: now + 30 }; let n = 0; const f = AFX[k].front; AFX[k].front = function () { n++; return f.apply(this, arguments); };
        await new Promise(r => setTimeout(r, 500)); AFX[k].front = f; return n; }, k);
      t.ok(r >= 2, `${k} is drawn on the character (${r} frames)`);
    }
    const m = await A.ev(() => { P.ail = { freeze: now + 30, poison: now + 30 }; return [afxMask(), afxFromMask(afxMask()).join(',')]; });
    t.ok(m[1] === 'poison,freeze', 'the presence carries which ailments you have: ' + m.join(' '));
    const none = await A.ev(async () => { P.ail = {}; let n = 0; const f = AFX.freeze.front; AFX.freeze.front = function () { n++; return f.apply(this, arguments); };
      await new Promise(r => setTimeout(r, 400)); AFX.freeze.front = f; return [n, afxMask()]; });
    t.ok(none[0] === 0 && none[1] === 0, 'once cured, nothing is drawn');
    t.ok(!A.page.errors.length, 'no script errors ' + A.page.errors.join(' | '));
  } finally { await A.close(); }
};
