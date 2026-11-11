// #52 more emotes and an emote bar: E pops up a bar of favourites; ☆ in the full list picks them; new emotes
// reach other players.
const { player, wait, newRoom } = require('./helpers');
const poll = async (g, fn, arg, ms = 8000) => { const end = Date.now() + ms; while (Date.now() < end) { if (await g.ev(fn, arg)) return true; await wait(200); } return false; };

module.exports = async t => {
  const room = newRoom(), OFFLINE = 'http://127.0.0.1:9';
  const A = await player('Waver', room, { zone: 'meadow', server: OFFLINE });
  await wait(1500);
  const B = await player('Viewer', room, { zone: 'meadow', server: OFFLINE });
  try {
    t.ok(await poll(A, () => NET.others.size === 1), 'two players see each other');
    t.ok(await A.ev(() => EMOTES.length === 24 && ['hi', 'ok', 'lol', 'cool', 'party', 'sry'].every(k => EMOTE_KEYS.includes(k))), 'there are 24 emotes now');
    const bar = await A.ev(() => { window.dispatchEvent(new KeyboardEvent('keydown', { key: 'e' })); const el = document.getElementById('emoteBar');
      return { shown: el && !el.hidden, n: el.querySelectorAll('[data-k]').length, panel: panelKind, imgs: [...el.querySelectorAll('img')].every(i => i.src.startsWith('data:image')) }; });
    t.ok(bar.shown && bar.n === 8 && !bar.panel && bar.imgs, 'E pops up a bar of 8 favourite emotes instead of a window');
    const wave = await A.ev(() => { document.querySelector('#emoteBar [data-k="hi"]').click(); return { k: P.emote && P.emote.k, hidden: document.getElementById('emoteBar').hidden }; });
    t.ok(wave.k === 'hi' && wave.hidden, 'one tap waves, and the bar closes');
    t.ok(await poll(B, () => { const o = [...NET.others.values()][0]; return o.emote && o.emote.k === 'hi'; }), 'other players see the new emote');
    // pick favourites in the full list
    const fav = await A.ev(() => { togglePanel('emote'); document.querySelector('#emoteBar [data-more]').click(); const k = panelKind;
      const star = k => panel.querySelector(`.emb[data-arg="${k}"] .fav`);
      star('sry').click(); star('party').click();
      star('fire').click(); const full = /emote bar is full/.test(document.getElementById('log').textContent); const f = P.emofav.slice(); closePanel(); togglePanel('emote'); const ks = [...document.querySelectorAll('#emoteBar [data-k]')].map(b => b.dataset.k); return { k, f, ks, full }; });
    t.ok(fav.k === 'emote' && !fav.f.includes('sry') && fav.f.includes('party') && fav.ks.includes('party') && !fav.ks.includes('sry'), '"More…" opens the full list, where ☆ adds and removes favourites');
    t.ok(fav.full && !fav.f.includes('fire') && fav.f.length === 8, 'a ninth favourite is refused politely');
    t.ok(await A.ev(() => { save(); return JSON.parse(localStorage.getItem(SAVE_KEY)).p.emofav.includes('party'); }), 'favourites are saved');
    t.ok(await A.ev(() => { const el = document.getElementById('emoteBar'); cv.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: 10, clientY: 300 })); return el.hidden; }), 'tapping the game closes the bar');
    t.ok(await A.ev(() => { sendChat('/lol'); return P.emote.k === 'lol'; }), 'new emotes work as chat commands too (/lol)');
    t.ok(A.page.errors.length === 0 && B.page.errors.length === 0, 'no script errors' + [...A.page.errors, ...B.page.errors].map(e => ': ' + e).join(''));
    if (process.env.SHOTS) { await A.ev(() => togglePanel('emote')); await wait(300); await A.page.screenshot({ path: process.env.SHOTS + '/emotebar.png' }); }
  } finally { await A.close(); await B.close(); }
};
