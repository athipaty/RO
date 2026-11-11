// Items window tabs (Use / Equip / Etc), item pictures everywhere, and the foldable party box.
const { player, wait, newRoom } = require('./helpers');
module.exports = async t => {
  const g = await player('Bagger', newRoom(), { zone: 'meadow', server: 'http://127.0.0.1:9' });
  try {
    await wait(1000);
    const r = await g.ev(() => { for (const id of ['blue', 'pelt', 'hopper_sig']) giveItem(id, 2); P.inv.push({ id: 'rod', uid: uid++, s: [null] });
      const names = () => [...panel.querySelectorAll('.row .nm')].map(n => n.textContent.replace(/×.*/, '').trim());
      openPanel('items'); const tab = k => { panel.querySelector(`[data-act="invtab"][data-arg="${k}"]`).click(); return names(); };
      const use = tab('use'), equip = tab('equip'), etc = tab('etc'); const imgs = panel.querySelectorAll('img.ico').length; closePanel();
      return { use, equip, etc, imgs, remembered: localStorage.getItem('embervale.invTab') }; });
    t.ok(r.use.includes('Blue Tonic') && !r.use.includes('Lupe Pelt') && !r.use.includes('Starfire Rod'), 'the Use tab holds potions and scrolls only');
    t.ok(r.equip.includes('Starfire Rod') && !r.equip.includes('Blue Tonic'), 'the Equip tab holds gear');
    t.ok(r.etc.includes('Lupe Pelt') && r.etc.some(n => /Sigil/.test(n)), 'the Etc tab holds monster loot and sigils');
    t.ok(r.imgs >= 2 && r.remembered === 'etc', 'items show pictures, and the last tab is remembered');
    t.ok(await g.ev(() => Object.keys(ITEMS).every(id => { const c = itemIconCanvas(id), d = c.getContext('2d').getImageData(0, 0, 64, 64).data; let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i] > 0) n++; return n > 120; })), 'every item has a drawn picture');
    t.ok(await g.ev(() => /<img/.test(document.getElementById('hotbar').innerHTML)), 'hotbar items use their pictures');
    const pb = await g.ev(() => { SOC.party = { id: 'p', leader: 'me', mode: 'share', members: [{ peer: 'me', name: 'Bagger' }, { peer: 'x', name: 'Pal' }] }; renderParty();
      const box = document.getElementById('partyBox'), hud = document.getElementById('hud'); const under = Math.abs(box.getBoundingClientRect().top - hud.getBoundingClientRect().bottom - 6) < 2;
      const h1 = box.offsetHeight; document.getElementById('pFold').click(); const h2 = box.offsetHeight, txt = box.querySelector('.pt').textContent;
      hudMini(true, true); renderParty(); const under2 = Math.abs(box.getBoundingClientRect().top - hud.getBoundingClientRect().bottom - 6) < 2; return { under, h1, h2, txt, under2 }; });
    t.ok(pb.under && pb.under2, 'the party box sits right under the status box, also when that is collapsed');
    t.ok(pb.h2 < pb.h1 && /Party \(2\)/.test(pb.txt), `the party box folds to one line (${pb.h1}px → ${pb.h2}px)`);
    t.ok(g.page.errors.length === 0, 'no script errors' + g.page.errors.map(e => ': ' + e).join(''));
  } finally { await g.close(); }
};
