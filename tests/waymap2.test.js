// v1.64.1: the world map opens big in a box you drag (one button for the whole world), a compass sits in its corner
// instead of letters by the roads' ends, and each monster picture on a place's card shows its element and what it is weak to
const { player, wait, newRoom } = require('./helpers');
module.exports = async t => {
  const g = await player('Mapper', newRoom(), { server: 'http://127.0.0.1:9' });
  try {
    await wait(500);
    const r = await g.ev(async () => { const w = ms => new Promise(r => setTimeout(r, ms)), out = {};
      enterZone('town'); P.visited = Object.keys(ZONES); P.lv = 45; WSMAP.sel = 'steppe'; try { localStorage.removeItem('embervale.wsmZoom'); } catch (e) {} WSZ.big = true; openPanel('warp'); await w(200);
      const sc = panel.querySelector('.wsmscroll'), tile = panel.querySelector('.wsmt[data-arg="meadow"]');
      out.big = !!sc && sc.classList.contains('big'); out.tileW = tile ? Math.round(tile.getBoundingClientRect().width) : 0;
      out.compass = panel.querySelectorAll('.wsmrose').length; out.letters = panel.querySelectorAll('.wsmc').length;
      const card = panel.querySelector('#wsDet'); out.badges = card.querySelectorAll('.tcel').length; out.weak = (card.querySelector('.tcels') || {}).textContent || '';
      out.noZoom = !panel.querySelector('[data-act="wsmzoom"]'); // (v1.64.5) the Bigger / Whole world button is gone
      out.dn = !!panel.querySelector('.wsmt[data-arg="woods"] .wsmdn') && !panel.querySelector('.wsmt[data-arg="meadow"] .wsmdn');
      const tog = panel.querySelectorAll('.wsftog'); out.toggle = tog.length === 1 && /World map/.test(tog[0].textContent) && tog[0].dataset.arg === 'floors' && !!tog[0].querySelector('.wsfarr');
      closePanel(); return out; });
    t.ok(r.big && r.tileW >= 60, `the map opens big: each square ${r.tileW} px wide, in a box you drag`);
    t.ok(r.noZoom, 'the map is always big: no Bigger / Whole world button');
    t.ok(r.dn, 'a region with stairs down to a dungeon carries a ▼ sign');
    t.ok(r.toggle, 'one ⇄ button, named for the view you are on, switches between the world map and the floors');
    t.ok(r.compass === 1 && r.letters === 0, 'one compass in the corner, no letters by the roads');
    t.ok(r.badges >= 4 && /Earth/.test(r.weak) && /weak to/.test(r.weak), `monster pictures carry their element (${r.badges}) and the card says what they are weak to: ${r.weak}`);
    // (v1.64.3) the Waystone Shard: a Floors below tab, a map of floors, a tap shows the card with Go (no instant travel)
    const f = await g.ev(async () => { const w = ms => new Promise(r => setTimeout(r, ms)); enterZone('town'); P.visited = [...Object.keys(WORLD_GRID), 'deep1', 'isles', 'grotto1'];
      giveItem('waystone', 1); openPanel('waystone'); await w(150); const tab = panel.querySelector('[data-act="wsview"][data-arg="floors"]'); if (!tab) return { tab: false };
      tab.click(); await w(150); const tiles = panel.querySelectorAll('.wft').length, old = panel.querySelectorAll('.wsmfl').length;
      panel.querySelector('.wft[data-arg="grotto1"]').click(); await w(150); const stay = zoneId === 'town', go = !!panel.querySelector('#wsDet [data-act="waygo"][data-arg="grotto1"]'), badges = panel.querySelectorAll('#wsDet .tcel').length;
      panel.querySelector('[data-act="wsview"][data-arg="world"]').click(); await w(150); const world = !!panel.querySelector('.wsmscroll'); WSF.view = 'world'; closePanel();
      return { tab: true, tiles, old, stay, go, badges, world }; });
    t.ok(f.tab && f.tiles >= 6 && f.old === 0, `the shard has a Floors below tab with a map of ${f.tiles} squares instead of a row of buttons`);
    t.ok(f.stay && f.go && f.badges >= 3, 'tapping a floor shows its card (monsters with their element) and a Go button, and does not travel by itself');
    t.ok(f.world, 'the World map tab brings the map back');
    // (v1.64.4) Tobin's Waystation has the Floors below tab too, with fares that grow a floor at a time
    const tb = await g.ev(async () => { const w = ms => new Promise(r => setTimeout(r, ms)); enterZone('town'); P.visited = [...Object.keys(WORLD_GRID), 'deep1', 'deep2', 'isles', 'grotto1']; P.gold = 100000;
      openPanel('warp'); await w(150); const tab = panel.querySelector('[data-act="wstview"][data-arg="floors"]'); if (!tab) return { tab: false };
      tab.click(); await w(150); const tiles = [...panel.querySelectorAll('.wft')].map(b => b.dataset.arg), noKeep = !tiles.includes('keep') && !tiles.includes('arena');
      panel.querySelector('.wft[data-arg="deep2"]').click(); await w(150); const btn = panel.querySelector('#wsDet [data-act="warp"][data-arg="deep2"]');
      const fares = { woods: warpFare('woods'), deep1: warpFare('deep1'), deep2: warpFare('deep2'), isles: warpFare('isles'), grotto1: warpFare('grotto1'), keep: warpFare('keep') };
      const g0 = P.gold; btn.click(); await w(200); const went = zoneId === 'deep2' && P.gold === g0 - fares.deep2; WSF.tview = 'world';
      return { tab: true, tiles: tiles.length, noKeep, btn: !!btn, fares, went }; });
    t.ok(tb.tab && tb.tiles >= 6 && tb.noKeep && tb.btn, `Tobin's Waystation has a Floors below tab (${tb.tiles} squares, no keep or arena) with a Travel button on each floor's card`);
    t.ok(tb.fares.deep1 === tb.fares.woods + 60 && tb.fares.deep2 === tb.fares.woods + 120 && tb.fares.grotto1 === tb.fares.isles + 60 && tb.fares.isles > 1500 && tb.fares.keep < 0,
      'floors cost the fare of the region above plus 60 a floor; the island adds the crossing; no fare for places Tobin does not serve ' + JSON.stringify(tb.fares));
    t.ok(tb.went, 'travelling to a floor takes you there and takes its fare');
    // (v1.64.6) the World map window (M) has the same toggle
    const wm = await g.ev(async () => { const w = ms => new Promise(r => setTimeout(r, ms)); enterZone('town'); P.visited = [...Object.keys(WORLD_GRID), 'deep1', 'isles', 'grotto1'];
      openPanel('worldmap'); await w(150); const tog = panel.querySelector('.wsftog[data-act="wmview"]'); if (!tog) return { tog: false };
      const grid = !!panel.querySelector('.wgrid'); tog.click(); await w(150); const tiles = panel.querySelectorAll('.wft').length, noGrid = !panel.querySelector('.wgrid');
      panel.querySelector('.wft[data-arg="grotto1"]').click(); await w(150); const picked = panel.querySelector('.wnode.pick')?.dataset.zone;
      panel.querySelector('.wsftog[data-act="wmview"]').click(); await w(150); const back = !!panel.querySelector('.wgrid'); closePanel();
      return { tog: true, grid, tiles, noGrid, picked, back }; });
    t.ok(wm.tog && wm.grid && wm.tiles >= 6 && wm.noGrid && wm.back, `the World map window has the ⇄ toggle too: world grid, then ${wm.tiles} floor squares, then back`);
    // (v1.64.7) the minimap marks the stairs down into a dungeon with an orange ▼ (and the way back up with a pale ▲)
    const mm = await g.ev(() => { const col = (id, to) => { enterZone(id); const pt = Z.portals.find(p => p.to === to); renderMini(); const q = miniPt(pt.x, pt.y), d = mctx.getImageData(Math.round(q.x), Math.round(q.y), 1, 1).data; return [d[0], d[1], d[2]]; };
      return { down: col('woods', 'deep1'), up: col('deep1', 'woods'), gate: col('woods', 'meadow') }; });
    t.ok(mm.down[0] > 200 && mm.down[1] > 120 && mm.down[2] < 110, 'the minimap shows the stairs down as an orange ▼ ' + mm.down);
    t.ok(mm.up[2] > 200 && mm.up[0] > 150, 'and the way back up out of a dungeon as a pale ▲ ' + mm.up);
    t.ok(wm.picked === 'grotto1', 'tapping a floor square picks it in the list below (' + wm.picked + ')');
    t.ok(g.page.errors.length === 0, 'no script errors' + g.page.errors.map(e => ': ' + e).join(''));
  } finally { await g.close(); }
};
