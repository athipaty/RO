// v1.84.0: lighter network play: the game takes monster change lists (md) between full lists, says it can (dz:1), and
// standing still it sends its presence twice a second instead of eight times.
const { player, wait, newRoom } = require('./helpers');
module.exports = async t => {
  const A = await player('Light', newRoom(), { server: 'http://127.0.0.1:9' });
  try {
    await wait(2000);
    const r = await A.ev(async () => { const w = ms => new Promise(r => setTimeout(r, ms)); enterZone('meadow'); await w(300);
      NET.srv = null; netMobsMsg({ z: 'meadow', md: [[0, 1, 2, 3, 4]] }); const noBase = NET.srv === null;
      netMobsMsg({ z: 'meadow', mb: [[10, 10, 1000, 0], [20, 20, 1000, 0], [30, 30, 1000, 0]], ev: [] }); const full = NET.srv && NET.srv.mb.length === 3;
      netMobsMsg({ z: 'meadow', md: [[1, 25, 21, 900, 2], [9, 1, 1, 1, 1], ['x']] }); const d = NET.srv.mb;
      const applied = JSON.stringify(d) === JSON.stringify([[10, 10, 1000, 0], [25, 21, 900, 2], [30, 30, 1000, 0]]);
      netMobsMsg({ z: 'woods', md: [[0, 5, 5, 5, 5]] }); const otherZone = NET.srv.z === 'meadow' && NET.srv.mb[0][0] === 10;
      // presence: dz, and the send interval standing still vs moving
      NET.room = { presence: () => Promise.resolve(), server: true }; NET.viaBroker = false; P.path = []; P.target = null; P.moving = false; P.hurtT = -99; NET.sendT = 0; NET.lastSent = ''; NET.sentRt = 0;
      let sentObj = null; NET.room.presence = s => { sentObj = s; return Promise.resolve(); }; netTick(.016); const idleGap = NET.sendT - performance.now() / 1000;
      P.moving = true; NET.sendT = 0; NET.lastSent = ''; NET.sentRt = 0; netTick(.016); const moveGap = NET.sendT - performance.now() / 1000; P.moving = false; NET.room = null;
      return { noBase, full, applied, otherZone, dz: sentObj && sentObj.dz === 1, idleGap, moveGap }; });
    t.ok(r.noBase && r.full && r.applied && r.otherZone, 'a change list updates only the monsters it names (bad entries and other regions are ignored); without a full list first it waits');
    t.ok(r.dz, 'the game tells the server it takes change lists (dz)');
    t.ok(r.idleGap > .4 && r.moveGap < .2, `standing still it sends every ${r.idleGap.toFixed(2)}s, moving every ${r.moveGap.toFixed(2)}s`);
    t.ok(!A.page.errors.length, 'no script errors ' + A.page.errors.slice(0, 3).join(' | '));
  } finally { await A.close(); }
};
