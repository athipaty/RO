// #70 level-up light pillar (yours, and other players' seen by you) and #65 Shift-click to attack in place.
const { player, wait, newRoom } = require('./helpers');
module.exports = async t => {
  const g = await player('Feeler', newRoom(), { zone: 'meadow', server: 'http://127.0.0.1:9' });
  try {
    await wait(1500);
    const lv = await g.ev(async () => { const w = ms => new Promise(r => setTimeout(r, ms));
      gainExp(expNeed(P.lv) + 1, 0); const mine = fx.some(f => f.k === 'lvpillar' && f.o === P);
      // another player nearby levels up (as their presence arrives)
      const o = { peer: 'pal', n: 'Pal', cls: 'ranger', lv: 7, z: zoneId, x: P.x + 60, y: P.y, rx: P.x + 60, ry: P.y };
      NET.others.set('pal', o); otherLevelUp(o, 8); const theirs = fx.some(f => f.k === 'lvpillar' && f.o === o);
      // and the network path: a higher level in their presence triggers it
      fx = []; ingest({ peer: 'pal', presence: { v: 1, n: 'Pal', c: 'ranger', z: zoneId, x: o.x, y: o.y, lv: 9, ts: Date.now() } }); const viaNet = fx.some(f => f.k === 'lvpillar');
      await w(600); NET.others.delete('pal'); return { mine, theirs, viaNet }; });
    t.ok(lv.mine, 'levelling up raises a pillar of light on you');
    t.ok(lv.theirs && lv.viaNet, 'you also see the pillar when another player near you levels up');
    if (process.env.SHOTS) { await g.ev(() => fx.push({ k: 'lvpillar', o: P, x: P.x, y: P.y, t0: now, dur: 2.6 })); await wait(700); await g.page.screenshot({ path: process.env.SHOTS + '/pillar.png', clip: { x: 350, y: 0, width: 500, height: 500 } }); }
    const hold = await g.ev(async () => { const w = ms => new Promise(r => setTimeout(r, ms)); fx = [];
      const m = mobs.find(m => !m.dead && !m.d.boss && !m.d.aggro); m.x = P.x + 260; m.y = P.y; m.state = 'idle'; m.tx = null; m.d = { ...m.d, spd: 0 };
      const cv = document.getElementById('cv'), r = cv.getBoundingClientRect(), sp = proj(m.x, m.y - m.d.size * .9);
      const click = shift => cv.dispatchEvent(new PointerEvent('pointerdown', { clientX: r.left + sp.x - camX, clientY: r.top + sp.y - camY, shiftKey: shift, bubbles: true }));
      const x0 = P.x, y0 = P.y; click(true); await w(800);
      const stayed = Math.hypot(P.x - x0, P.y - y0) < 3, targeted = P.target === m, flag = P.holdPos;
      click(false); await w(800); const walked = Math.hypot(P.x - x0, P.y - y0) > 20;
      P.target = null; P.path = []; return { stayed, targeted, flag, walked }; });
    t.ok(hold.targeted && hold.flag && hold.stayed, 'Shift-click on a monster out of reach targets it but you stay where you are');
    t.ok(hold.walked, 'a normal click walks to it as before');
    t.ok(g.page.errors.length === 0, 'no script errors' + g.page.errors.map(e => ': ' + e).join(''));
  } finally { await g.close(); }
};
