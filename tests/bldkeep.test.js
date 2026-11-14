// Town buildings never disappear: their cached pictures are rebuilt after a trip out of town, after the game comes back
// to the foreground, and when a check finds one wiped by the browser
const { player, wait, newRoom } = require('./helpers');
module.exports = async t => {
  const g = await player('Keep', newRoom(), { server: 'http://127.0.0.1:9' });
  try {
    await wait(400);
    const r = await g.ev(async () => { const sleep = ms => new Promise(r => setTimeout(r, ms)), out = {};
      enterZone('town'); await sleep(300); const before = [...BLD_CACHE.map.values()][0]; out.made = BLD_CACHE.map.size > 0;
      // a trip out and back makes fresh pictures
      enterZone('meadow'); await sleep(200); enterZone('town'); await sleep(300); out.fresh = BLD_CACHE.map.size > 0 && [...BLD_CACHE.map.values()][0] !== before;
      // the browser wipes one picture (cleared to transparent): the check notices and the pictures are made again
      const e = [...BLD_CACHE.map.values()][0]; { const x = e.c.getContext('2d'); x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, e.c.width, e.c.height); } bldCacheCheck(); out.cleared = BLD_CACHE.map.size === 0;
      await sleep(200); out.rebuilt = BLD_CACHE.map.size > 0 && ![...BLD_CACHE.map.values()].includes(e);
      // a healthy cache passes the check untouched
      const n = BLD_CACHE.map.size, first = [...BLD_CACHE.map.values()][0]; bldCacheCheck(); out.healthy = BLD_CACHE.map.size === n && [...BLD_CACHE.map.values()][0] === first;
      // a picture freed to zero size is caught too
      first.c.width = 0; bldCacheCheck(); out.zero = BLD_CACHE.map.size === 0;
      // coming back to the game forgets them (they are made again on the next frame)
      await sleep(200); document.dispatchEvent(new Event('visibilitychange')); out.back = BLD_CACHE.map.size === 0; await sleep(200); out.again = BLD_CACHE.map.size > 0;
      return out; });
    t.ok(r.made && r.fresh, 'leaving town and coming back makes fresh building pictures');
    t.ok(r.cleared && r.rebuilt, 'a wiped building picture is noticed and drawn again ' + JSON.stringify(r));
    t.ok(r.healthy, 'healthy pictures are kept');
    t.ok(r.zero, 'a freed picture is noticed too');
    t.ok(r.back && r.again, 'coming back to the game redraws them');
    t.ok(g.page.errors.length === 0, 'no script errors' + g.page.errors.map(e => ': ' + e).join(''));
  } finally { await g.close(); }
};
