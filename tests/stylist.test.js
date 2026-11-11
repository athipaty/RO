// #4 the stylist: change hairstyle, hair colour, eyes and skin after making your hero; others see it at once.
const { player, wait, newRoom } = require('./helpers');
const poll = async (g, fn, arg, ms = 8000) => { const end = Date.now() + ms; while (Date.now() < end) { if (await g.ev(fn, arg)) return true; await wait(250); } return false; };

module.exports = async t => {
  const room = newRoom(), OFFLINE = 'http://127.0.0.1:9';
  const A = await player('Primp', room, { server: OFFLINE });
  await wait(1500);
  const B = await player('Watcher', room, { server: OFFLINE });
  try {
    t.ok(await poll(A, () => NET.others.size === 1), 'two players see each other');
    const open = await A.ev(async () => { const n = Z.npcs.find(x => x.role === 'stylist'); P.x = n.x; P.y = n.y + 30; openNpc(n); await new Promise(r => setTimeout(r, 300));
      const cv = document.getElementById('styCv'), px = cv.getContext('2d').getImageData(0, 0, 200, 200).data; let ink = 0; for (let i = 3; i < px.length; i += 4) if (px[i]) ink++;
      return { kind: panelKind, name: n.name, ink, buy: panel.querySelector('[data-act="stybuy"]').disabled }; });
    t.ok(open.kind === 'stylist' && /Lune/.test(open.name), 'Lune the Stylist in Hearthvale opens the stylist');
    t.ok(open.ink > 500, 'with a live preview of your hero');
    t.ok(open.buy, 'nothing to pay until you pick something new');
    const before = await B.ev(() => JSON.stringify([...NET.others.values()][0].look));
    const pick = await A.ev(() => { P.gold = 1000; const L0 = lookOf(P.name, P.look); panel.querySelector('[data-act="stystyle"][data-arg="1"]').click();
      const hair = HAIRS.findIndex(c => c !== L0.hair); panel.querySelector(`[data-act="stycol"][data-arg="hair:${hair}"]`).click();
      const prev = { ...STY.lk }; const still = JSON.stringify(lookOf(P.name, P.look)) === JSON.stringify(L0);
      const btn = panel.querySelector('[data-act="stybuy"]'); const label = btn.textContent; btn.click();
      return { still, label, gold: P.gold, look: lookOf(P.name, P.look), prev, L0 }; });
    t.ok(pick.still, 'picking only changes the preview');
    t.ok(/300 gold/.test(pick.label) && pick.gold === 700, `paying ${1000 - pick.gold} gold makes it real`);
    t.ok(pick.look.style === (pick.L0.style + 1) % 6 && pick.look.hair === pick.prev.hair && pick.look.hair !== pick.L0.hair, 'you get the new hairstyle and colour');
    t.ok(await poll(B, b => JSON.stringify([...NET.others.values()][0].look) !== b, before), 'other players see the new look');
    t.ok(await A.ev(() => { save(); const s = JSON.parse(localStorage.getItem(SAVE_KEY)).p.look; return s && s.style === lookOf(P.name, P.look).style; }), 'and it is saved');
    const poor = await A.ev(() => { P.gold = 100; panel.querySelector('[data-act="stystyle"][data-arg="1"]').click(); const b = panel.querySelector('[data-act="stybuy"]'); return b.disabled && /Needs 300 gold/.test(b.textContent); });
    t.ok(poor, "without enough gold it says so and doesn't charge");
    t.ok(await A.ev(() => { panel.querySelector('[data-act="styreset"]').click(); return panel.querySelector('[data-act="stybuy"]').disabled; }), '"Back to my current look" undoes the picks');
    t.ok(A.page.errors.length === 0 && B.page.errors.length === 0, 'no script errors' + [...A.page.errors, ...B.page.errors].map(e => ': ' + e).join(''));
    if (process.env.SHOTS) { await A.ev(() => { P.gold = 1000; refreshPanel(); }); await wait(300); await A.page.screenshot({ path: process.env.SHOTS + '/stylist.png' }); }
  } finally { await A.close(); await B.close(); }
};
