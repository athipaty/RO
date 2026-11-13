// the ground never goes black: only the current (and last) region keep their big map pictures, and a wiped
// ground picture (phones do this under memory pressure or in the background) is redrawn straight away
const { player, newRoom, wait } = require('./helpers');
module.exports = async t => {
  const g = await player('Ground', newRoom());
  try {
    const lit = () => g.ev(() => { const c = document.createElement('canvas'); c.width = c.height = 1; const x = c.getContext('2d'); let n = 0;
      for (const [fx, fy] of [[.3, .3], [.7, .3], [.3, .7], [.7, .7], [.5, .6]]) { x.clearRect(0, 0, 1, 1); x.drawImage(cv, Math.floor(cv.width * fx), Math.floor(cv.height * fy), 1, 1, 0, 0, 1, 1); const d = x.getImageData(0, 0, 1, 1).data; if (d[0] + d[1] + d[2] > 90) n++; } return n; });
    await g.ev(() => enterZone('town')); await wait(500); const base = await lit();
    for (const id of await g.ev(() => Object.keys(ZONES))) { await g.ev(id => enterZone(id), id); await wait(150); }
    const kept = await g.ev(() => { let mb = 0, zones = 0; for (const z of Object.values(zoneCache)) { let k = 0; for (const c of [z.img, z._iso]) if (c && c.width) { mb += c.width * c.height * 4 / 1048576; k = 1; } zones += k; } return { mb: Math.round(mb), zones }; });
    t.ok(kept.zones <= 2 && kept.mb < 60, `after visiting every region only ${kept.zones} keep their map pictures (${kept.mb} MB, was ~240 MB)`);
    await g.ev(() => enterZone('town')); await wait(500);
    t.ok(base >= 2 && await lit() >= base, 'coming back to a freed region redraws its ground');
    await g.ev(() => { const c = Z._iso; c.getContext('2d').clearRect(0, 0, c.width, c.height); }); await wait(200);
    await g.ev(() => document.dispatchEvent(new Event('visibilitychange'))); await wait(600);
    t.ok(await lit() >= base && await g.ev(() => GK.rebuilds) >= 1, 'a wiped ground picture is redrawn when you come back to the game');
    await g.ev(() => { Z._iso.width = 0; }); await wait(300);
    t.ok(await lit() >= base, 'an emptied ground picture is rebuilt on the next frame');
    t.ok(g.page.errors.length === 0, 'no script errors' + g.page.errors.map(e => ': ' + e).join(''));
  } finally { await g.close(); }
};
