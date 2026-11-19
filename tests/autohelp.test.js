// v1.42.4 auto-hunt helps your party: a monster attacking a party member comes first (unless one is attacking you)
const { player, newRoom, wait } = require('./helpers');
module.exports = async t => {
  const g = await player('Aria', newRoom(), { server: 'http://127.0.0.1:9' });
  try {
    await wait(800);
    const r = await g.ev(async () => { const w = ms => new Promise(r => setTimeout(r, ms)), o = {};
      P.tut = 'done'; enterZone('meadow'); await w(400); const live = mobs.filter(m => !m.dead); for (const m of live.slice(3)) m.dead = true;
      const [mine, onMate, onMe] = live; for (const m of [mine, onMate, onMe]) { m.d = { ...m.d, hp: 1e8, aggro: false }; m.hp = 1e8; }
      P.x = 30 * TILE; P.y = 20 * TILE; mine.x = P.x + 120; mine.y = P.y; mine.state = 'idle';
      const mate = { n: 'Bea', z: zoneId, id: 'b1', x: P.x - 140, y: P.y, rx: P.x - 140, ry: P.y, hp: 70, cls: 'warden', lv: 10 };
      onMate.x = mate.rx - 20; onMate.y = mate.ry; onMate.state = 'chase'; onMe.x = P.x + 400; onMe.y = P.y + 300; onMe.state = 'idle';
      const keepSock = SOCK; SOCK = { id: 'me', connected: true, emit() {}, on() {} }; NET.others.set('pB', mate); const me = 'me'; SOC.party = { leader: me, mode: 'share', members: [{ peer: me, name: P.name }, { peer: 'pB', name: 'Bea' }] };
      P.auto = true; P.target = mine; AH.next = 0; autoHunt(); o.helps = P.target === onMate;
      // something attacking you comes first
      P.target = onMe; onMe.x = P.x + 20; onMe.y = P.y; onMe.state = 'chase'; AH.next = 0; autoHunt(); o.keepsOwn = P.target === onMe;
      // without a party nothing changes
      SOC.party = null; P.target = mine; onMe.state = 'idle'; onMe.x = P.x + 400; AH.next = 0; autoHunt(); o.solo = P.target === mine;
      P.auto = false; SOCK = keepSock; NET.others.delete('pB'); return o; });
    t.ok(r.helps, 'with auto-hunt on, a monster attacking a party member comes before your own target');
    t.ok(r.keepsOwn, 'but a monster attacking you is still fought first');
    t.ok(r.solo, 'outside a party auto-hunt is unchanged');
    t.ok(g.page.errors.length === 0, 'no script errors' + g.page.errors.map(e => ': ' + e).join(''));
  } finally { await g.close(); }
};
