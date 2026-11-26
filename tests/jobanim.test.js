// The build guide's job pictures move (js/jobanim.js): the still pictures become small canvases that draw your hero in
// that job live while the window is open, and it stops when the window closes.
const { player, newRoom, wait } = require('./helpers');
module.exports = async t => {
  const g = await player('Animer', newRoom(), { server: 'http://127.0.0.1:9' });
  try {
    await wait(600);
    const r = await g.ev(async () => { const w = ms => new Promise(res => setTimeout(res, ms)); P.cls = 'warden'; openPanel('buildguide'); await w(500);
      const cvs = [...panel.querySelectorAll('canvas[data-cls]')], left = [...panel.querySelectorAll('img')].filter(i => JOBANIM.rev[i.getAttribute('src')]).length;
      const snap = () => cvs.map(c => c.toDataURL()).join('|'); const a = snap(); await w(700); const b = snap();
      const jobs = [...new Set(cvs.map(c => c.dataset.cls))].sort().join(','), cw = cvs[0] ? Math.round(cvs[0].getBoundingClientRect().width) : 0; closePanel(); await w(200);
      return { n: cvs.length, left, moved: a !== b, jobs, off: !JOBANIM.on, w: cw }; });
    t.ok(r.n >= 3 && r.left === 0, `the guide's job pictures are live drawings (${r.n}, ${r.left} still pictures left)`);
    t.ok(r.jobs.includes('warden') && r.jobs.includes('aegislord'), 'every job on the routes is drawn: ' + r.jobs);
    t.ok(r.moved && r.w > 40, `they move from frame to frame, at the picture size (${r.moved}, ${r.w}px wide)`);
    t.ok(r.off, 'closing the window stops the drawing');
    t.ok(g.page.errors.length === 0, 'no script errors' + g.page.errors.map(e => ': ' + e).join(''));
  } finally { await g.close(); }
};
