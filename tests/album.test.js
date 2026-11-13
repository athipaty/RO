// Sigil album: every sigil you have held is recorded; a full region page gives a permanent bonus; all pages +1 every stat.
const { player, wait, newRoom } = require('./helpers');

module.exports = async t => {
  const g = await player('Collector', newRoom(), { server: 'http://127.0.0.1:9' });
  try {
    await wait(500);
    const pages = await g.ev(() => ALBUM.map(p => p.id + ':' + albumMobs(p).length));
    t.ok(pages.length === 6 && pages.every(s => +s.split(':')[1] >= 3), 'six region pages, each with its monsters\' sigils: ' + pages.join(' '));
    const r = await g.ev(() => { P.album = {}; S = computeStats(); const hp0 = S.maxhp; const mobs = albumMobs(ALBUM[0]);
      giveItem(mobs[0] + '_sig', 1); const one = !!P.album[mobs[0]] && !albumComplete(ALBUM[0]);
      // a Radiant sigil counts for its monster, socketed ones count on a scan
      giveItem(mobs[1] + '_sigr', 1); const rad = !!P.album[mobs[1]];
      P.eq.armor = { id: 'tunic', uid: 801, s: [mobs[2] + '_sig'] }; albumScan(); const sock = !!P.album[mobs[2]];
      for (const m of mobs) giveItem(m + '_sig', 1); S = computeStats(); return { one, rad, sock, done: albumComplete(ALBUM[0]), hp: S.maxhp - hp0 }; });
    t.ok(r.one && r.rad && r.sock, 'a sigil counts when it reaches your bag, a Radiant one for its monster, socketed ones too');
    t.ok(r.done && r.hp === 60, `completing Greenmoss Meadow gives +60 Max HP for good (+${r.hp})`);
    const all = await g.ev(() => { const st0 = { ...computeStats() }; for (const p of ALBUM) for (const m of albumMobs(p)) P.album[m] = 1; S = computeStats();
      return { done: albumDone(), str: S.str - st0.str, aspd: S.delay < st0.delay, dmgred: S.dmgred - st0.dmgred }; });
    t.ok(all.done === 6 && all.str === 1 && all.aspd && all.dmgred === 2, 'every page complete: each region\'s bonus plus +1 to every stat');
    const ui = await g.ev(() => { openPanel('library'); const btn = !!panel.querySelector('.albbtn [data-act="openalbum"]'); panel.querySelector('[data-act="openalbum"]').click();
      const txt = panel.textContent, kind = panelKind; chatCommand('album', ''); const cmd = panelKind === 'album'; closePanel(); save(true);
      return { btn, kind, pages: /Greenmoss Meadow/.test(txt) && /Frostpeak Pass/.test(txt) && /6\/6/.test(txt), cmd, saved: Object.keys(JSON.parse(localStorage.getItem('embervale.save.v1')).p.album).length }; });
    t.ok(ui.btn && ui.kind === 'album' && ui.pages && ui.cmd, 'the Codex has a Sigil album button; /album opens it too');
    t.ok(ui.saved >= 30, `the album is saved with the hero (${ui.saved} sigils)`);
    t.ok(g.page.errors.length === 0, 'no script errors' + g.page.errors.map(e => ': ' + e).join(''));
  } finally { await g.close(); }
};
