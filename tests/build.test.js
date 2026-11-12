// #1 build choice: creator, saved, seen by others (presence bt), changeable at the stylist.
const { player, wait, newRoom, openGame } = require('./helpers');
const poll = async (g, fn, ms = 8000) => { const end = Date.now() + ms; while (Date.now() < end) { if (await g.ev(fn)) return true; await wait(200); } return false; };
module.exports = async t => {
  const room = newRoom(), OFFLINE = 'http://127.0.0.1:9';
  const A = await openGame(room, { server: OFFLINE });
  let B;
  try {
    const pick = await A.ev(() => { localStorage.clear(); document.getElementById('nameIn').value = 'Builder'; const nx = document.querySelector('[data-build="1"]'); nx.click(); nx.click();
      const shown = document.getElementById('lkBuild').textContent; document.getElementById('newBtn').click(); return shown; });
    t.ok(pick === 'Slender', 'the creator has a Build choice (Standard, Broad, Slender)');
    await wait(800);
    t.ok(await A.ev(() => P.look && P.look.body === 2), 'your hero starts with the build you picked');
    t.ok(await A.ev(() => { save(); return JSON.parse(localStorage.getItem(SAVE_KEY)).p.look.body === 2; }), 'it is saved');
    B = await player('Viewer', room, { server: OFFLINE });
    t.ok(await poll(B, () => { const o = [...NET.others.values()][0]; return o && o.look && o.look.body === 2; }), 'other players see your build');
    const sty = await A.ev(() => { P.gold = 5000; openPanel('stylist'); PANEL_ACTS.stybuild(1); const r = /Standard/.test(panel.textContent); PANEL_ACTS.stybuy(); closePanel(); return r && (P.look.body | 0) === 0; });
    t.ok(sty, 'Lune the Stylist can change it later');
    t.ok(A.page.errors.length === 0 && B.page.errors.length === 0, 'no script errors' + [...A.page.errors, ...B.page.errors].map(e => ': ' + e).join(''));
  } finally { await A.close(); if (B) await B.close(); }
};
