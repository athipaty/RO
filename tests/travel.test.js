// #35 more teleport items: Waystone Shard (any visited region) and Kinship Charm (to a party member).
const { player, wait, newRoom } = require('./helpers');
module.exports = async t => {
  const g = await player('Wayfarer', newRoom(), { zone: 'town', server: 'http://127.0.0.1:9' });
  try {
    await wait(1500);
    const w = await g.ev(async () => { const w = ms => new Promise(r => setTimeout(r, ms));
      const shop = SHOP.includes('waystone') && SHOP.includes('kinship');
      P.visited = ['town', 'meadow', 'woods', 'deep1']; giveItem('waystone', 2); useItem('waystone');
      const kind = panelKind, opts = [...panel.querySelectorAll('[data-act="waygo"]')].map(b => b.dataset.arg), kept = invFind('waystone').n;
      panel.querySelector('[data-act="waygo"][data-arg="deep1"]').click(); await w(200);
      return { shop, kind, opts, kept, zone: zoneId, left: invFind('waystone').n, closed: panel.hidden }; });
    t.ok(w.shop, 'Ilsa sells Waystone Shards and Kinship Charms');
    t.ok(w.kind === 'waystone' && w.opts.join() === 'meadow,woods,deep1' && w.kept === 2, 'a Waystone Shard lists the regions you have visited (dungeon floors too) and is not used up by opening it');
    t.ok(w.zone === 'deep1' && w.left === 1 && w.closed, 'choosing one takes you there and uses one shard');
    const k = await g.ev(async () => { const w = ms => new Promise(r => setTimeout(r, ms)); giveItem('kinship', 1);
      SOC.party = null; useItem('kinship'); const noParty = panelKind !== 'kinship' && invFind('kinship').n === 1;
      // a party member in the woods, standing at a known spot
      const wz = getZone('woods'), s = wz.spawn; NET.others.set('pal', { peer: 'pal', n: 'Pal', cls: 'ranger', lv: 15, z: 'woods', x: s.x + 64, y: s.y, rx: s.x + 64, ry: s.y, dead: false });
      SOC.party = { id: 'p', leader: 'me', mode: 'share', members: [{ peer: 'me', name: 'Wayfarer' }, { peer: 'pal', name: 'Pal' }] };
      useItem('kinship'); const kind = panelKind, names = panel.textContent;
      panel.querySelector('[data-act="kingo"][data-arg="pal"]').click(); await w(200);
      const o = NET.others.get('pal'); const d = Math.hypot(P.x - o.x, P.y - o.y);
      const r = { noParty, kind, has: /Pal/.test(names) && /Whispering Woods/.test(names), zone: zoneId, d, gone: !invFind('kinship') };
      NET.others.delete('pal'); SOC.party = null; return r; });
    t.ok(k.noParty, 'without a party the Kinship Charm says so and is kept');
    t.ok(k.kind === 'kinship' && k.has, 'with a party it lists members and where they are');
    t.ok(k.zone === 'woods' && k.d < 4 * 32 && k.gone, `it pulls you to their side in their region (${Math.round(k.d)}px away) and is used up`);
    t.ok(await g.ev(() => ['waystone', 'kinship'].every(id => { const c = itemIconCanvas(id), d = c.getContext('2d').getImageData(0, 0, 64, 64).data; let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i] > 0) n++; return n > 120; })), 'both have their own picture');
    t.ok(g.page.errors.length === 0, 'no script errors' + g.page.errors.map(e => ': ' + e).join(''));
  } finally { await g.close(); }
};
