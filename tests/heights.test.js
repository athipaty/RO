// (v1.56.0) The shape of the land (js/heights.js): Greenmoss Meadow's rolling hills. Gentle slopes are walked up, the
// earthen bank of Chieftain's Knoll cannot be climbed or stepped off, paths go round it, things on a hill are drawn at
// its height, a tap lands on the slope, melee does not reach across the bank, and the Hopper Chieftain keeps its den
// on the knoll; a brook below the meadow with a bridge and fords (v1.56.1). Regions without a design of their own stay flat (no more stone stairs everywhere).
const { player, newRoom, wait } = require('./helpers');
module.exports = async t => {
  const g = await player('Climber', newRoom(), { server: 'http://127.0.0.1:9' });
  try {
    await wait(500);
    const r = await g.ev(async () => {
      const sleep = ms => new Promise(r => setTimeout(r, ms)), out = {}, T = TILE, at = (x, y) => ({ x: (x + .5) * T, y: (y + .5) * T });
      enterZone('meadow'); const L = Z.lvd;
      out.hills = L ? L.hills.map(h => h.name).join(', ') : 'none';
      out.flat = ['town', 'capital', 'dunes', 'frost'].every(id => { const z = getZone(id); if (z.lvd === undefined) lvGen(z); return !z.lvd; });
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
      // (v1.56.1) the brook: below the meadow, a bank you cannot step down, a bridge on the road, fords to wade, slower in the water, dewdrops live there
      const w = at(29, 13); out.low = lvH(L, w.x, w.y) < -15 && L.wet[13 * L.W + 29] === 1 && L.wet[23 * L.W + 29] === 2;
      const bk = at(28, 12); P.path = []; P.x = bk.x; P.y = bk.y; for (let k = 0; k < 25; k++) moveEnt(P, 3, 0, PR); out.brookBank = lvH(L, P.x, P.y) === 0 && P.x <= 29 * T - PR + 1;
      out.ford = !!findPath(27, 14, 29, 14) && (findPath(27, 14, 29, 14) || []).length <= 4;
      out.bridge = (findPath(26, 23, 33, 23) || []).every(q => lvH(L, q.x, q.y) === 0);
      const st = at(29, 13); P.x = st.x; P.y = st.y; const yw = P.y; moveEnt(P, 0, 10, PR); const wade = P.y - yw; const dry = at(20, 13); P.x = dry.x; P.y = dry.y; const yd = P.y; moveEnt(P, 0, 10, PR); out.slow = wade > 0 && wade < (P.y - yd) * .8;
      out.dew = mobs.filter(m => m.d.id === 'dewdrop' && !m.dead).every(m => L.wet[lvTile(L, m.x, m.y)] === 1);
      // nothing you could reach before is cut off
      const a = lvReachable(Z, null), b = lvReachable(Z, L); let cut = 0; for (let i = 0; i < a.length; i++) if (a[i] && !b[i]) cut++; out.cut = cut;
      // (v1.57.0) the Whispering Woods: the Hollow (Wolf Alpha's den at the bottom, root paths down), the gully with its log, root ridges
      enterZone('woods'); const W2 = Z.lvd; out.woods = W2 ? W2.feats.map(f => f.name).join(', ') : 'none';
      const fl = at(54, 36); out.hollow = lvH(W2, fl.x, fl.y) < -30;
      const alpha = mobs.find(m => m.d.id === 'lupealpha' && !m.dead); out.alpha = !!alpha && lvH(W2, alpha.x, alpha.y) < -30;
      const down = findPath(51, 26, 54, 34) || []; out.rootPath = down.length > 0 && down.some(q => W2.ramp[lvTile(W2, q.x, q.y)]);
      const wallFoot = at(56, 30); P.x = wallFoot.x; P.y = wallFoot.y; P.path = []; for (let k = 0; k < 30; k++) moveEnt(P, 0, 3, PR); out.wall = lvH(W2, P.x, P.y) === 0;
      out.log = (findPath(28, 37, 28, 42) || []).every(q => lvH(W2, q.x, q.y) === 0) && W2.log[39 * W2.W + 28] === 1;
      out.spiders = mobs.filter(m => m.d.id === 'webspinner' && !m.dead).every(m => W2.wet[lvTile(W2, m.x, m.y)] === 3);
      const a2 = lvReachable(Z, null), b2 = lvReachable(Z, W2); let cut2 = 0; for (let i = 0; i < a2.length; i++) if (a2[i] && !b2[i]) cut2++; out.cut2 = cut2;
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
    t.ok(r.low && r.brookBank, 'the brook lies below the meadow, and its bank cannot be stepped down');
    t.ok(r.ford && r.bridge, 'a ford leads down into the water, and the road crosses it on a bridge');
    t.ok(r.slow && r.dew, 'wading is slower, and the dewdrops live in the brook');
    t.ok(r.cut === 0, `no place is cut off by the hills (${r.cut})`);
    t.ok(r.woods === 'Root Ridge, Root Ridge, Root Ridge, The Hollow, The Fallen Giant', `the Whispering Woods has its own land (${r.woods})`);
    t.ok(r.hollow && r.alpha && r.rootPath && r.wall, 'the Hollow lies deep, the Wolf Alpha keeps its den at the bottom, root paths lead down, and its walls cannot be stepped off');
    t.ok(r.log && r.spiders, 'a fallen log crosses the gully at the forest level, and the web-spinners nest down in it');
    t.ok(r.cut2 === 0, `no place in the woods is cut off (${r.cut2})`);
    t.ok(g.page.errors.length === 0, 'no script errors' + g.page.errors.map(e => ': ' + e).join(''));
  } finally { await g.close(); }
};
