// v1.64.1: the world map opens big in a box you drag (one button for the whole world), a compass sits in its corner
// instead of letters by the roads' ends, and each monster picture on a place's card shows its element and what it is weak to
const { player, wait, newRoom } = require('./helpers');
module.exports = async t => {
  const g = await player('Mapper', newRoom(), { server: 'http://127.0.0.1:9' });
  try {
    await wait(500);
    const r = await g.ev(async () => { const w = ms => new Promise(r => setTimeout(r, ms)), out = {};
      enterZone('town'); P.visited = Object.keys(ZONES); P.lv = 45; WSMAP.sel = 'steppe'; try { localStorage.removeItem('embervale.wsmZoom'); } catch (e) {} WSZ.big = true; openPanel('warp'); await w(200);
      const sc = panel.querySelector('.wsmscroll'), tile = panel.querySelector('.wsmt[data-arg="meadow"]');
      out.big = !!sc && sc.classList.contains('big'); out.tileW = tile ? Math.round(tile.getBoundingClientRect().width) : 0;
      out.compass = panel.querySelectorAll('.wsmrose').length; out.letters = panel.querySelectorAll('.wsmc').length;
      const card = panel.querySelector('#wsDet'); out.badges = card.querySelectorAll('.tcel').length; out.weak = (card.querySelector('.tcels') || {}).textContent || '';
      panel.querySelector('[data-act="wsmzoom"]').click(); await w(100); out.fit = !panel.querySelector('.wsmscroll.big'); out.saved = localStorage.getItem('embervale.wsmZoom') === 'fit';
      panel.querySelector('[data-act="wsmzoom"]').click(); await w(100); out.back = !!panel.querySelector('.wsmscroll.big');
      closePanel(); return out; });
    t.ok(r.big && r.tileW >= 60, `the map opens big: each square ${r.tileW} px wide, in a box you drag`);
    t.ok(r.fit && r.saved && r.back, 'one button switches to the whole world and back, and is remembered');
    t.ok(r.compass === 1 && r.letters === 0, 'one compass in the corner, no letters by the roads');
    t.ok(r.badges >= 4 && /Earth/.test(r.weak) && /weak to/.test(r.weak), `monster pictures carry their element (${r.badges}) and the card says what they are weak to: ${r.weak}`);
    t.ok(g.page.errors.length === 0, 'no script errors' + g.page.errors.map(e => ': ' + e).join(''));
  } finally { await g.close(); }
};
