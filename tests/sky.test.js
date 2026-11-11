// Day/night and weather (same for everyone, from the clock), the setting to turn effects off, and skill pictures.
const { player, wait, newRoom } = require('./helpers');
module.exports = async t => {
  const g = await player('Skywatch', newRoom(), { zone: 'meadow', server: 'http://127.0.0.1:9' });
  try {
    await wait(1500);
    const r = await g.ev(() => { const day = 12 / 24 * DAY_MS, night = 23 / 24 * DAY_MS, base = Math.floor(Date.now() / DAY_MS) * DAY_MS;
      return { noon: dayPart(gameHour(base + day)), mid: dayPart(gameHour(base + night)), dark0: darkness(12), dark1: darkness(23),
        same: weatherNow('woods', 1e12) === weatherNow('woods', 1e12 + 1000), varies: new Set(Array.from({ length: 60 }, (_, i) => weatherNow('woods', i * WEATHER_MS))).size,
        crypt: weatherNow('crypt'), label: document.getElementById('zLv').textContent }; });
    t.ok(r.noon === 'Day' && r.mid === 'Night' && r.dark0 === 0 && r.dark1 === 1, 'a 24-minute day runs from day to dark night');
    t.ok(r.same && r.varies >= 2, `weather comes from the clock, so everyone sees the same, and it changes over time (${r.varies} kinds in the woods)`);
    t.ok(r.crypt === 'embers', 'the Cinder Crypt always has drifting embers');
    t.ok(/Lv 1–10 · (☀|☾|◐) (Day|Night|Dawn|Dusk)/.test(r.label), `the region line shows the time of day (${r.label})`);
    const off = await g.ev(() => { openPanel('help'); const b = panel.querySelector('[data-act="weathert"]'); const was = /on/.test(b.textContent); b.click(); const now2 = !skyOn; closePanel(); return { was, now2, saved: localStorage.getItem('embervale.weather') }; });
    t.ok(off.was && off.now2 && off.saved === '0', 'weather effects can be turned off in the help window, and that is remembered');
    t.ok(await g.ev(() => { sendChat('/time'); return /in Embervale/.test(document.getElementById('log').textContent); }), '/time tells the time');
    t.ok(await g.ev(() => Object.keys(SKILLS).every(id => /^data:image\/png/.test(skillIconURL(id)))), 'every skill has a picture');
    t.ok(await g.ev(() => { P.cls = 'arcanist'; P.skills = { emberbolt: 1 }; rebuildHotbar(); openPanel('skills'); const tree = panel.querySelectorAll('img.ico.sk').length; closePanel(); return tree > 0 && /img/.test(document.getElementById('hotbar').innerHTML); }), 'skill pictures show in the skill tree and on the hotbar');
    t.ok(g.page.errors.length === 0, 'no script errors' + g.page.errors.map(e => ': ' + e).join(''));
  } finally { await g.close(); }
};
