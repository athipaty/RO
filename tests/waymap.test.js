// (v1.54.0, angled like the game in v1.54.1) The Waystation's Travel part is a world map: every region a square joined by roads; a tap shows its details
// (beside the map on a phone held sideways). Job chips in the General Store's Equip tab and Brannoc's Forge; Use /
// Equip / Sigils / Etc tabs in storage.
const { player, newRoom, wait } = require('./helpers');
module.exports = async t => {
  const g = await player('Mapper', newRoom(), { server: 'http://127.0.0.1:9' });
  try {
    await wait(500);
    const r = await g.ev(() => {
      const out = {}; P.lv = 20; P.gold = 99999; P.visited = ['town', 'meadow', 'woods', 'heights', 'farms', 'capital'];
      openPanel('warp');
      const tiles = [...panel.querySelectorAll('.wsm .wsmt')];
      out.allPlaces = tiles.length === Object.keys(WORLD_GRID).filter(id => ZONES[id]).length;
      { const pairs = new Set(); for (const a of Object.keys(WORLD_GRID)) for (const b of Object.values(ZONES[a].links || {})) if (WORLD_GRID[b]) pairs.add([a, b].sort().join('|')); // (v1.61.1) the world has loops: one road per pair of linked regions
        out.roads = panel.querySelectorAll('.wsmr line').length === pairs.size; out.roadN = panel.querySelectorAll('.wsmr line').length + '/' + pairs.size; }
      out.locked = !!panel.querySelector('.wsmt.locked[data-arg="frost"]') && !panel.querySelector('.wsmt.locked[data-arg="meadow"]');
      out.oneCard = panel.querySelectorAll('#wsDet .tccard').length === 1;
      panel.querySelector('.wsmt[data-arg="woods"]').click();
      out.sel = !!panel.querySelector('.wsmt.sel[data-arg="woods"] .wsmtag') && /Travel ·/.test(panel.querySelector('#wsDet').textContent) && /Stairs down/.test(panel.querySelector('#wsDet').textContent);
      panel.querySelector('.wsmt[data-arg="ridge"]').click();
      out.gate = /north gate of/.test(panel.querySelector('#wsDet').textContent) && !panel.querySelector('#wsDet .tctravel');
      const hop = panel.querySelector('#wsDet .wsmhop[data-arg="heights"]'); hop.click(); out.hop = !!panel.querySelector('.wsmt.sel[data-arg="heights"]');
      const zb = zoneId; panel.querySelector('#wsDet .tctravel').click(); out.travel = zoneId === 'heights' && zb !== 'heights';
      out.restStable = true;
      // store: Job chips filter weapons only
      enterZone('town');
      const weap = ITEMS => Object.keys(ITEMS);
      gearJob = 'all'; shopTab = 'buy'; shopCat = 'equip'; shopGear = 'all'; openPanel('shop');
      const allN = panel.querySelectorAll('.row').length; PANEL_ACTS.gearjob('arcanist');
      const names = [...panel.querySelectorAll('.row .nm')].map(n => n.textContent.trim());
      const items = names.map(n => Object.values(ITEMS).find(it => it.name === n)).filter(Boolean);
      out.store = !!panel.querySelector('[data-act="gearjob"][data-arg="arcanist"].on') && items.length > 0 && items.length < allN && items.every(it => it.type !== 'weapon' || CLASSES.arcanist.weapons.includes(it.wt));
      closePanel();
      // forge: same choice, remembered
      openPanel('craft', 'forge'); CRAFT.tab = 'forge'; refreshPanel();
      const fn = [...panel.querySelectorAll('.craftrow .nm')].map(n => Object.values(ITEMS).find(it => n.textContent.startsWith(it.name))).filter(Boolean);
      out.forge = !!panel.querySelector('[data-act="gearjob"][data-arg="arcanist"].on') && fn.length > 0 && fn.every(it => it.type !== 'weapon' || CLASSES.arcanist.weapons.includes(it.wt));
      PANEL_ACTS.gearjob('all'); closePanel();
      // storage tabs
      P.storage = [{ id: Object.keys(ITEMS).find(id => ITEMS[id].type === 'use'), n: 2 }]; openPanel('storage'); PANEL_ACTS.stotab('equip');
      out.sto = !!panel.querySelector('.stotabs') && ![...panel.querySelectorAll('[data-act="take"]')].length && /Nothing of this kind/.test(panel.textContent);
      PANEL_ACTS.stotab('use'); out.sto = out.sto && panel.querySelectorAll('[data-act="take"]').length === 1; PANEL_ACTS.stotab('all'); closePanel();
      // (v1.55.0) the Waystone Shard shows the same map; Go takes you there and uses the shard
      enterZone('town'); P.visited = ['town', 'meadow', 'woods', 'deep1']; giveItem('waystone', 2); openPanel('waystone');
      out.shardMap = panel.querySelectorAll('.wsm .wsmt').length === Object.keys(WORLD_GRID).filter(id => ZONES[id]).length && !!panel.querySelector('.wsmfl [data-arg="deep1"]');
      panel.querySelector('.wsmt[data-arg="woods"]').click(); const shards = (invFind('waystone') || {}).n || 0;
      panel.querySelector('#wsDet [data-act="waygo"][data-arg="woods"]').click();
      out.shardGo = zoneId === 'woods' && ((invFind('waystone') || {}).n || 0) === shards - 1;
      return out;
    });
    t.ok(r.allPlaces && r.roads, 'the Waystation shows every region on one map, joined by roads (' + r.roadN + ')');
    t.ok(r.locked && r.oneCard, 'places not walked to yet are locked squares, and one place\'s details show at a time');
    t.ok(r.sel, 'tapping a square names it and shows its details with the fare (and the stairs down in the Whispering Woods)');
    t.ok(r.gate, 'a locked place says which gate to walk through, with no Travel button');
    t.ok(r.hop, 'the "Roads to" buttons hop to the next place on the map');
    t.ok(r.travel, 'Travel still takes you there');
    t.ok(r.store, 'the General Store\'s Equip tab has Job chips: only the weapons that job can use');
    t.ok(r.forge, 'the Forge uses the same Job choice');
    t.ok(r.sto, 'storage has Use / Equip / Sigils / Etc tabs');
    t.ok(r.shardMap && r.shardGo, 'the Waystone Shard shows the same map (dungeon floors under it), and Go takes you there');
    // sideways phone: the map and the details side by side, the whole map on screen
    await g.page.setViewport({ width: 844, height: 390, isMobile: true, hasTouch: true }); await wait(1500);
    await g.ev(() => { if (!P) { document.getElementById('nameIn').value = 'Mapper'; document.getElementById('newBtn').click(); } }); await wait(2000);
    const L = await g.ev(async () => { P.visited = ['town', 'meadow']; enterZone('town'); openPanel('warp'); await new Promise(r => setTimeout(r, 1000));
      const m = panel.querySelector('.wsm').getBoundingClientRect(), d = panel.querySelector('#wsDet').getBoundingClientRect();
      return { side: d.left >= m.right - 2, fits: m.top >= 0 && m.bottom <= innerHeight + 1, w: Math.round(m.width), h: Math.round(m.height) }; });
    t.ok(L.side && L.fits, `sideways: the whole map (${L.w}×${L.h}) is on screen with the details beside it`);
    t.ok(g.page.errors.length === 0, 'no script errors' + g.page.errors.map(e => ': ' + e).join(''));
  } finally { await g.close(); }
};
