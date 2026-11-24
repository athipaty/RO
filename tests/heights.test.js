// (v1.56.0) The shape of the land (js/heights.js): Greenmoss Meadow's rolling hills. Gentle slopes are walked up, the
// earthen bank of Chieftain's Knoll cannot be climbed or stepped off, paths go round it, things on a hill are drawn at
// its height, a tap lands on the slope, melee does not reach across the bank, and the Hopper Chieftain keeps its den
// on the knoll. Regions without a design of their own stay flat (no more stone stairs everywhere).
const { player, newRoom, wait } = require('./helpers');
module.exports = async t => {
  const g = await player('Climber', newRoom(), { server: 'http://127.0.0.1:9' });
  try {
    await wait(500);
    const r = await g.ev(async () => {
      const sleep = ms => new Promise(r => setTimeout(r, ms)), out = {}, T = TILE, at = (x, y) => ({ x: (x + .5) * T, y: (y + .5) * T });
      enterZone('meadow'); const L = Z.lvd;
      out.hills = L ? L.hills.map(h => h.name).join(', ') : 'none';
      out.flat = ['town', 'capital', 'dunes', 'frost', 'woods'].every(id => { const z = getZone(id); if (z.lvd === undefined) lvGen(z); return !z.lvd; });
      // the top of the knoll is drawn high, and a tap on it lands there
      const top = at(50, 9), hTop = lvH(L, top.x, top.y);
      out.raised = hTop > 50 && Math.round(proj(top.x, top.y).y) === Math.round((top.x + top.y) * ISO / 2 - hTop);
      const sp = proj(top.x, top.y), back = unproj(sp.x, sp.y); out.tap = Math.hypot(back.x - top.x, back.y - top.y) < 3;
      // a slope rises smoothly (no step anywhere on the gentle side)
      let smooth = true; for (let y = 2; y < 9; y++) { const a = lvH(L, 50.5 * T, y * T), b = lvH(L, 50.5 * T, (y + 1) * T); if (Math.abs(a - b) > 20) smooth = false; } out.slope = smooth && lvH(L, 50.5 * T, 2.5 * T) < hTop;
      // the bank: from the ground in front of it, walking up into it is refused
      const foot = at(50, 11); P.x = foot.x; P.y = foot.y; P.path = []; P.target = null;
      const y0 = P.y; for (let k = 0; k < 25; k++) moveEnt(P, 0, -3, PR); out.bank = P.y >= 11 * T + PR - 1 && P.y <= y0 && lvH(L, P.x, P.y) < 1;
      // a path to the top goes round the bank, and walking it gets you there
      const raw = findPath(50, 11, 50, 9) || []; out.round = raw.length > 6;
      P.x = foot.x; P.y = foot.y; pathTo(top.x, top.y, true);
      for (let k = 0; k < 120 && P.path.length; k++) await sleep(100);
      out.top = lvH(L, P.x, P.y) > 45; out.where = [Math.round(P.x / T * 10) / 10, Math.round(P.y / T * 10) / 10, Math.round(lvH(L, P.x, P.y))].join(',');
      // from the top you cannot step off the bank
      const edge = at(50, 10); P.path = []; P.x = edge.x; P.y = edge.y; for (let k = 0; k < 25; k++) moveEnt(P, 0, 3, PR); out.edge = P.y <= 11 * T - PR + 1;
      // melee across the bank: no; side by side on the top: yes
      out.melee = !lvReach(at(50, 10), at(50, 11)) && lvReach(at(50, 9), at(51, 9));
      // the Hopper Chieftain keeps its den on the knoll
      const chief = mobs.find(m => m.d.id === 'hopperchief' && !m.dead); out.den = !!chief && lvH(L, chief.x, chief.y) > 45;
      // nothing you could reach before is cut off
      const a = lvReachable(Z, null), b = lvReachable(Z, L); let cut = 0; for (let i = 0; i < a.length; i++) if (a[i] && !b[i]) cut++; out.cut = cut;
      return out;
    });
    t.ok(r.hills === "Chieftain's Knoll, Lookout Hill, South Rise" && r.flat, `Greenmoss Meadow has its own hills (${r.hills}); other regions stay flat`);
    t.ok(r.raised && r.tap, 'the top of a hill is drawn high, and a tap on it lands there');
    t.ok(r.slope, 'the gentle side rises smoothly');
    t.ok(r.bank, 'the earthen bank cannot be climbed from below');
    t.ok(r.round && r.top, `a path to the top goes round the bank, and walking it gets you up there (${r.where})`);
    t.ok(r.edge, 'nobody steps off the bank from the top');
    t.ok(r.melee, 'melee does not reach across the bank, but does side by side');
    t.ok(r.den, 'the Hopper Chieftain keeps its den on Chieftain\'s Knoll');
    t.ok(r.cut === 0, `no place is cut off by the hills (${r.cut})`);
    t.ok(g.page.errors.length === 0, 'no script errors' + g.page.errors.map(e => ': ' + e).join(''));
  } finally { await g.close(); }
};
