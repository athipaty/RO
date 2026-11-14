// The party box keeps its rows (and their Follow buttons) while nothing changes, and still moves the HP bars
const { player, wait, newRoom } = require('./helpers');
module.exports = async t => {
  const g = await player('Box', newRoom(), { server: 'http://127.0.0.1:9' });
  try {
    await wait(400);
    const r = await g.ev(async () => { const me = selfPeer();
      ingest({ peer: 'pal1', presence: { v: 1, n: 'Pal', c: 'warden', z: zoneId, x: P.x + 50, y: P.y, f: 1, ts: Date.now(), lv: 20, hp: 80 } });
      SOC.party = { leader: me, mode: 'share', loot: 'each', members: [{ peer: me, name: P.name }, { peer: 'pal1', name: 'Pal' }] };
      renderParty(); const list = document.querySelector('#partyBox .pm'), row = list.children[1], btn = row.querySelector('button');
      NET.others.get('pal1').hp = 40; renderParty();
      const same = list.children[1] === row && row.querySelector('button') === btn, hp = row.querySelector('.ph').style.getPropertyValue('--hp');
      NET.others.get('pal1').z = 'woods'; renderParty(); const rebuilt = list.children[1] !== row && /Whispering Woods/.test(list.textContent);
      SOC.party = null; renderParty(); return { rows: list.children.length, same, hp, rebuilt }; });
    t.ok(r.same, 'with nothing changed the rows and the Follow button stay the same elements');
    t.ok(r.hp === '40%', 'the HP bar still follows the member (' + r.hp + ')');
    t.ok(r.rebuilt, 'when a member changes region the rows are rebuilt and show where they are');
    t.ok(g.page.errors.length === 0, 'no script errors' + g.page.errors.map(e => ': ' + e).join(''));
  } finally { await g.close(); }
};
