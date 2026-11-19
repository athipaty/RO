// v1.42.5 choose how far behind to follow: Close, Near, Medium, Far
const { player, newRoom, wait } = require('./helpers');
module.exports = async t => {
  const g = await player('Aria', newRoom(), { server: 'http://127.0.0.1:9' });
  try {
    await wait(800);
    const r = await g.ev(async () => { const w = ms => new Promise(r => setTimeout(r, ms)), o = {};
      P.tut = 'done'; enterZone('meadow'); await w(300); for (const m of mobs) m.dead = true;
      const keepSock = SOCK; SOCK = { id: 'me', connected: true, emit() {}, on() {} };
      const L = { n: 'Bea', z: zoneId, id: 'b1', rx: P.x + 600, ry: P.y, x: P.x + 600, y: P.y, hp: 90, cls: 'warden', lv: 10 }; NET.others.set('pB', L);
      SOC.party = { leader: 'me', mode: 'share', members: [{ peer: 'me', name: P.name }, { peer: 'pB', name: 'Bea' }] };
      followAsk('pB'); const pk = document.getElementById('folPick'); o.asks = !!pk && !pk.hidden && pk.querySelectorAll('[data-gap]').length === 5 && !FOL;
      pk.querySelector('[data-gap="far"]').click(); o.started = !!FOL && FOLLOW_GAP.get() === 230;
      for (let i = 0; i < 80 && Math.hypot(L.rx - P.x, L.ry - P.y) > 260; i++) await w(100); await w(800);
      o.farGap = Math.round(Math.hypot(L.rx - P.x, L.ry - P.y));
      followStop(); followAsk('pB'); o.remembers = pk.querySelector('.on')?.dataset.gap === 'far';
      pk.querySelector('[data-gap="cancel"]').click(); o.cancel = pk.hidden && !FOL;
      FOLLOW_GAP.set('close'); NET.others.delete('pB'); SOC.party = null; SOCK = keepSock; return o; });
    t.ok(r.asks, 'tapping Follow asks how close (Close, Near, Medium, Far, Cancel) before following');
    t.ok(r.started, 'choosing Far starts following at 230px');
    t.ok(r.farGap > 180 && r.farGap < 290, `the follower stays about that far behind (${r.farGap}px)`);
    t.ok(r.remembers, 'the last choice is remembered and lit up');
    t.ok(r.cancel, 'Cancel closes it without following');
    t.ok(g.page.errors.length === 0, 'no script errors' + g.page.errors.map(e => ': ' + e).join(''));
  } finally { await g.close(); }
};
