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
      panel.querySelector('[data-act="wsmzoom"]').click(); await w(100); out.fit = !panel.querySelector('.wsmscroll.big'); out.saved = localStorage.getItem('embervale.wsmZoom') === 'fit';
      panel.querySelector('[data-act="wsmzoom"]').click(); await w(100); out.back = !!panel.querySelector('.wsmscroll.big');
      closePanel(); return out; });
    t.ok(r.big && r.tileW >= 60, `the map opens big: each square ${r.tileW} px wide, in a box you drag`);
    t.ok(r.fit && r.saved && r.back, 'one button switches to the whole world and back, and is remembered');
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
    t.ok(g.page.errors.length === 0, 'no script errors' + g.page.errors.map(e => ': ' + e).join(''));
  } finally { await g.close(); }
};
