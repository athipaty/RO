// Crowds of players: with many players on screen each one is drawn into its own picture 15 times a second;
// the picture must look like drawing that player live (on foot, swinging, on a mount, reborn with an aura)
const { player, wait, newRoom } = require('./helpers');
module.exports = async t => {
  const g = await player('Crowd', newRoom(), { server: 'http://127.0.0.1:9' });
  try {
    await wait(400);
    const r = await g.ev(async () => { const w = ms => new Promise(r => setTimeout(r, ms)); enterZone('meadow'); await w(300); skyOn = false;
      const mk = (i, extra) => { ingest({ peer: 'pp' + i, presence: Object.assign({ v: 1, n: 'Pal' + i, c: ['warden', 'ranger', 'cleric', 'arcanist', 'ravager', 'falconer', 'bulwark'][i % 7], z: zoneId, x: P.x + 60 + (i % 4) * 70, y: P.y - 80 + Math.floor(i / 4) * 70, f: 1, ts: Date.now(), lv: 40, mv: 0, hp: 90, w: 'sword', h: 'sprout' }, extra || {}) }); };
      for (let i = 0; i < 8; i++) mk(i, i === 1 ? { rd: 'hopper' } : i === 2 ? { rb: 1 } : null);
      await w(300); for (const o of NET.others.values()) { o.rx = o.x; o.ry = o.y; }
      const on = pcrowdOn(); running = false; await w(50);
      const shot = () => { render(); return cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data; };
      const t0 = Math.ceil(now * 15) / 15 + .001; // a time on a 15 Hz step, so both drawings show the same moment
      window.__pcrowdForce = false; PCROWD.frame = -1; now = t0; const A = shot();
      window.__pcrowdForce = true; PCROWD.frame = -1; PCROWD.pics.clear(); now = t0; const B = shot();
      let diff = 0; for (let i = 0; i < A.length; i += 4) if (Math.abs(A[i] - B[i]) + Math.abs(A[i + 1] - B[i + 1]) + Math.abs(A[i + 2] - B[i + 2]) > 60) diff++;
      const pics = PCROWD.pics.size; window.__pcrowdForce = undefined; running = true;
      return { on, diff, pics, ratio: diff / (A.length / 4) };
    });
    t.ok(r.on, '8 players on screen switch shared pictures on');
    t.ok(r.pics === 8, 'each player has its own picture (' + r.pics + ')');
    t.ok(r.ratio < .004, `the pictures look the same as drawing the players live (${r.diff} pixels differ, edges only)`);
    t.ok(g.page.errors.length === 0, 'no script errors' + g.page.errors.map(e => ': ' + e).join(''));
  } finally { await g.close(); }
};
