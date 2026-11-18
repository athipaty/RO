// Other players' walks (js/net.js netAdvance, v1.19.6): a walk sent with its path or direction is shown where it is now
const { player, newRoom, wait } = require('./helpers');
module.exports = async t => {
  const g = await player('Seer', newRoom(), { server: 'http://127.0.0.1:9' });
  try {
    await wait(500);
    const r = await g.ev(() => ({
      path: netAdvance({ x: 0, y: 0, mv: true, sp: 100, wp: [[50, 0], [50, 100]] }, 1).map(Math.round).join(),
      end: netAdvance({ x: 0, y: 0, mv: true, sp: 100, wp: [[50, 0], [50, 20]] }, 5).map(Math.round).join(),
      push: netAdvance({ x: 10, y: 10, mv: true, vx: 100, vy: -50, sp: 145 }, .2).map(Math.round).join(),
      still: netAdvance({ x: 10, y: 10, mv: false, vx: 0, vy: 0, sp: 145 }, .3).join(),
      sent: (() => { let got = null; NET.room = { presence: s => { got = s; return Promise.resolve(); }, onPeers() {} }; NET.lastSent = ''; NET.sendT = 0;
        P.path = [{ x: P.x + 64, y: P.y }, { x: P.x + 128, y: P.y + 32 }]; P.moving = true; netTick(.016); return got && got.sp > 0 && got.wp && got.wp.length === 2; })()
    }));
    t.ok(r.path === '50,50', 'a tapped path is followed around its corner (' + r.path + ')');
    t.ok(r.end === '50,20', 'and stops at its end (' + r.end + ')');
    t.ok(r.push === '30,0', 'a joystick walk goes on in its direction (' + r.push + ')');
    t.ok(r.still === '10,10', 'a player standing still stays put');
    t.ok(r.sent, 'your presence carries your speed and the next points of your path');
    t.ok(g.page.errors.length === 0, 'no script errors' + g.page.errors.map(e => ': ' + e).join(''));
  } finally { await g.close(); }
};
