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
      out.flat = ['town', 'capital', 'deep1', 'arena'].every(id => { const z = getZone(id); if (z.lvd === undefined) lvGen(z); return !z.lvd; });
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
      out.dew = (ms => ms.length > 0 && ms.length <= 4 && ms.every(m => L.wet[lvTile(L, m.sx, m.sy)] === 1))(mobs.filter(m => m.d.id === 'dewdrop' && !m.dead && m.dwell)); // their home: one may wander up a ford
      // nothing you could reach before is cut off
      const a = lvReachable(Z, null), b = lvReachable(Z, L); let cut = 0; for (let i = 0; i < a.length; i++) if (a[i] && !b[i]) cut++; out.cut = cut;
      // (v1.57.0) the Whispering Woods: the Hollow (Wolf Alpha's den at the bottom, root paths down), the gully with its log, root ridges
      enterZone('woods'); const W2 = Z.lvd; out.woods = W2 ? W2.feats.map(f => f.name).join(', ') : 'none';
      const fl = at(54, 36); out.hollow = lvH(W2, fl.x, fl.y) < -30;
      const alpha = mobs.find(m => m.d.id === 'lupealpha' && !m.dead); out.alpha = !!alpha && lvH(W2, alpha.x, alpha.y) < -30;
      const down = findPath(51, 26, 54, 34) || []; out.rootPath = down.length > 0 && down.some(q => W2.ramp[lvTile(W2, q.x, q.y)]);
      const wallFoot = at(56, 30); P.x = wallFoot.x; P.y = wallFoot.y; P.path = []; for (let k = 0; k < 30; k++) moveEnt(P, 0, 3, PR); out.wall = lvH(W2, P.x, P.y) === 0;
      out.log = (findPath(28, 37, 28, 42) || []).every(q => lvH(W2, q.x, q.y) === 0) && W2.log[39 * W2.W + 28] === 1;
      out.spiders = (ms => ms.length > 0 && ms.length <= 4 && ms.every(m => W2.wet[lvTile(W2, m.sx, m.sy)] === 3))(mobs.filter(m => m.d.id === 'webspinner' && !m.dead && m.dwell));
      const a2 = lvReachable(Z, null), b2 = lvReachable(Z, W2); let cut2 = 0; for (let i = 0; i < a2.length; i++) if (a2[i] && !b2[i]) cut2++; out.cut2 = cut2;
      // (v1.58.0) Willowmere Farms: three terraces up to the Grand Scarecrow, earthen steps between them, stone walls, the canal
      enterZone('farms'); const F = Z.lvd; out.farms = F ? F.feats.map(f => f.name).join(', ') : 'none';
      out.shelves = [[20, 14], [12, 8], [5, 4]].map(([x, y]) => Math.round(lvH(F, (x + .5) * T, (y + .5) * T))).join(',');
      const crow = mobs.find(m => m.d.id === 'grandscarecrow' && !m.dead); out.crow = !!crow && lvH(F, crow.x, crow.y) === 42;
      const up = findPath(10, 21, 6, 4) || []; out.steps = up.length > 0 && up.filter(q => F.ramp[lvTile(F, q.x, q.y)] === 2).length >= 3;
      const wf = at(20, 17); P.x = wf.x; P.y = wf.y; P.path = []; for (let k = 0; k < 25; k++) moveEnt(P, 0, -3, PR); out.stoneWall = lvH(F, P.x, P.y) === 0;
      const cn = at(43, 15); out.canal = lvH(F, cn.x, cn.y) < -15 && (ms => ms.length > 0 && ms.length <= 4 && ms.every(m => F.wet[lvTile(F, m.sx, m.sy)] === 1))(mobs.filter(m => m.d.id === 'reedsnapper' && !m.dead && m.dwell));
      const a3 = lvReachable(Z, null), b3 = lvReachable(Z, F); let cut3 = 0; for (let i = 0; i < a3.length; i++) if (a3[i] && !b3[i]) cut3++; out.cut3 = cut3;
      // (v1.59.0) the Ashen Dunes: dunes with a climbable windward slope and an unclimbable slip face; the Scarab Pit
      enterZone('dunes'); const DU = Z.lvd; out.dunes = DU ? DU.feats.map(f => f.name).join(', ') : 'none';
      const crest = at(47, 8); out.duneHigh = lvH(DU, crest.x, crest.y) > 30;
      const up2 = findPath(38, 8, 47, 8) || []; out.windward = up2.length > 0;
      const lee = at(51, 8); P.x = lee.x + T; P.y = lee.y; P.path = []; P.dead = false; for (let k = 0; k < 25; k++) moveEnt(P, -3, 0, PR); out.slip = lvH(DU, P.x, P.y) < 5;
      const queen = mobs.find(m => m.d.id === 'scarabqueen' && !m.dead); out.queen = !!queen && lvH(DU, queen.x, queen.y) < -25;
      const a4 = lvReachable(Z, null), b4 = lvReachable(Z, DU); let cut4 = 0; for (let i = 0; i < a4.length; i++) if (a4[i] && !b4[i]) cut4++; out.cut4 = cut4;
      // (v1.60.0) every other wild region: all its pieces fitted, nothing cut off (lava aside), each boss in its den
      out.all = ['heights', 'ridge', 'frost', 'glacier', 'peaks', 'jungle', 'fen', 'crypt', 'coast', 'caldera', 'downs', 'ruins', 'steppe', 'dusk', 'bramble', 'amber', 'mist', 'thornmere'].map(id => {
        enterZone(id); const A = Z.lvd; if (!A) return id + ':none';
        const want = LV_DESIGNS[id].auto.length, got = A.feats.length;
        const a = lvReachable(Z, null), b = lvReachable(Z, A); let cut = 0; for (let i = 0; i < a.length; i++) if (a[i] && !b[i] && !(A.wet[i] === 1 && A.lava)) cut++;
        const dens = A.dens.every(d => { const m = mobs.find(m => m.d.id === d.mob && !m.dead); return m && Math.abs(lvH(A, m.x, m.y)) > 10; });
        return got === want && cut === 0 && dens ? '' : `${id}:${got}/${want} cut ${cut} dens ${dens}`; }).filter(Boolean).join(' ');
      // (v1.60.1) every bridge spans water or a drop on two opposite sides; a tap on a pond says it is too deep
      out.bridges = Object.keys(LV_DESIGNS).map(id => { enterZone(id); const B = Z.lvd; if (!B) return ''; const W = Z.w, bad = [];
        for (let i = 0; i < B.wet.length; i++) { if (B.wet[i] !== 2 || B.log[i]) continue; const low = k => B.wet[k] === 1 || B.wet[k] === 3 || Z.t[k] === 3 || B.wet[k] === 2;
          if (!((low(i - W) && low(i + W)) || (low(i - 1) && low(i + 1)))) bad.push((i % W) + ',' + ((i / W) | 0)); }
        return bad.length ? id + ':' + bad.join(' ') : ''; }).filter(Boolean).join(' ');
      enterZone('meadow'); texts.length = 0; LV_HINT.t = 0; const pond = (() => { for (let i = 0; i < Z.t.length; i++) if (Z.t[i] === 3) return i; })();
      const pp = proj((pond % Z.w + .5) * T, (((pond / Z.w) | 0) + .5) * T), rc = cv.getBoundingClientRect();
      cv.dispatchEvent(new PointerEvent('pointerdown', { clientX: rc.left + pp.x - camX, clientY: rc.top + pp.y - camY, bubbles: true }));
      out.deep = texts.some(x => /Too deep/.test(x.txt));
      return out;
    });
    t.ok(r.hills === "Chieftain's Knoll, Lookout Hill, South Rise" && r.flat, `Greenmoss Meadow has its own hills (${r.hills}); towns, dungeons and the arena stay flat`);
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
    t.ok(r.farms === 'The Canal, The Terraces' && r.shelves === '14,28,42', `Willowmere Farms has its own land (${r.farms}; terraces at ${r.shelves})`);
    t.ok(r.crow && r.steps && r.stoneWall, 'earthen steps lead up the terraces to the Grand Scarecrow on the top one, and the stone walls cannot be climbed');
    t.ok(r.canal, 'the canal lies below the fields, and the reed snappers lurk in it');
    t.ok(r.cut3 === 0, `no place on the farms is cut off (${r.cut3})`);
    t.ok(r.dunes === 'Great Dune, Great Dune, Great Dune, Great Dune, The Scarab Pit' && r.duneHigh, `the Ashen Dunes has its own land (${r.dunes})`);
    t.ok(r.windward && r.slip, 'a dune is climbed up its windward slope, never up its steep slip face');
    t.ok(r.queen, 'the Scarab Queen nests at the bottom of the Scarab Pit');
    t.ok(r.cut4 === 0, `no place in the dunes is cut off (${r.cut4})`);
    t.ok(r.all === '', 'every other wild region has its own land: all its pieces fitted, nothing cut off, each boss in its den ' + r.all);
    t.ok(r.bridges === '', 'every bridge spans water or a drop on both sides ' + r.bridges);
    t.ok(r.deep, 'a tap on a pond says it is too deep to wade, and where to cross');
    t.ok(g.page.errors.length === 0, 'no script errors' + g.page.errors.map(e => ': ' + e).join(''));
  } finally { await g.close(); }
};
