// #22 crafting and brewing: monster materials become tonics, battle brews and forged gear.
const { player, wait, newRoom } = require('./helpers');

module.exports = async t => {
  const g = await player('Artisan', newRoom(), { zone: 'meadow', server: 'http://127.0.0.1:9' });
  try {
    await wait(800);
    const open = await g.ev(() => { sendChat('/craft'); return { k: panelKind, rows: panel.querySelectorAll('.craftrow').length, want: BREWS.length, txt: panel.textContent }; });
    t.ok(open.k === 'craft' && open.rows === open.want && /Brewing/.test(open.txt), `/craft opens Brewing with ${open.rows} recipes`);
    const hint = await g.ev(() => { const row = [...panel.querySelectorAll('.craftrow')].find(r => r.textContent.includes('Red Tonic')); const cm = row.querySelector('.cm');
      return { dis: row.querySelector('button').disabled, title: cm.title, txt: cm.textContent }; });
    t.ok(hint.dis && /Sproutling/.test(hint.title) && /Sap Drop 0\/4/.test(hint.txt), 'without materials the button is off, and each material says who drops it');
    // brew Red Tonics from sap
    const brew = await g.ev(() => { giveItem('sap', 9); const red0 = invFind('red').n, g0 = P.gold; refreshPanel();
      const row = [...panel.querySelectorAll('.craftrow')].find(r => r.textContent.includes('Red Tonic')); row.querySelector('button').click();
      return { red: invFind('red').n - red0, sap: invFind('sap').n, gold: g0 - P.gold }; });
    t.ok(brew.red === 5 && brew.sap === 5 && brew.gold === 10, `4 Sap Drops and 10 gold make 5 Red Tonics (got ${brew.red}, ${brew.sap} sap left)`);
    // a battle brew gives a timed boost
    const fury = await g.ev(() => { giveItem('thorn', 3); giveItem('pelt', 2); P.gold += 100; refreshPanel();
      [...panel.querySelectorAll('.craftrow')].find(r => r.textContent.includes('Fury Brew')).querySelector('button').click();
      const atk0 = (S = computeStats()).atk; P.cd.item = 0; useItem('furybrew'); const atk1 = S.atk;
      return { n: invFind('furybrew') ? invFind('furybrew').n : 0, up: atk1 - atk0, buff: !!P.buffs.furybrew, secs: Math.round(P.buffs.furybrew.until - now) }; });
    t.ok(fury.n === 1 && fury.up === 20 && fury.buff && fury.secs >= 178, `a Fury Brew gives +20 ATK for 3 minutes (+${fury.up}, ${fury.secs}s)`);
    // forging needs the smithy
    const away = await g.ev(() => { openPanel('craft', 'forge'); giveItem('pelt', 6); giveItem('shell', 3); P.gold += 900; refreshPanel();
      const row = [...panel.querySelectorAll('.craftrow')].find(r => r.textContent.includes('Lupe Hide Vest')); return { dis: row.querySelector('button').disabled, note: /needs Brannoc's anvil/.test(panel.textContent), rows: panel.querySelectorAll('.craftrow').length, want: FORGES.length }; });
    t.ok(away.dis && away.note && away.rows === away.want, `the Forge lists ${away.rows} gear recipes, but only works at the Smithy`);
    const forged = await g.ev(() => { closePanel(); enterZone('town'); const smith = Z.npcs.find(n => n.role === 'smith'); P.x = smith.x; P.y = smith.y + 30; openNpc(smith);
      const btn = panel.querySelector('[data-act="openforge"]'); if (!btn) return { btn: false }; btn.click(); const g0 = P.gold;
      [...panel.querySelectorAll('.craftrow')].find(r => r.textContent.includes('Lupe Hide Vest')).querySelector('button').click();
      const vest = P.inv.find(e => e.id === 'lupevest'); return { btn: true, vest: !!vest, uid: vest && !!vest.uid, slots: vest && vest.s.length, gold: g0 - P.gold, pelt: invFind('pelt') ? invFind('pelt').n : 0 }; });
    t.ok(forged.btn, "Brannoc's window has a Forge button");
    t.ok(forged.vest && forged.uid && forged.slots === 1 && forged.gold === 900 && forged.pelt === 0, 'at the Smithy, 6 Lupe Pelts, 3 Moss Shells and 900 gold forge a Lupe Hide Vest (with a sigil slot)');
    const wear = await g.ev(() => { P.lv = 14; const def0 = (S = computeStats()).def; const vest = P.inv.find(e => e.id === 'lupevest'); useInv(P.inv.indexOf(vest)); S = computeStats(); return { worn: P.eq.armor && P.eq.armor.id === 'lupevest', def: S.def - def0 }; });
    t.ok(wear.worn && wear.def > 0, `forged gear can be worn (+${wear.def} DEF over the tunic)`);
    t.ok(await g.ev(() => { save(); const s = JSON.parse(localStorage.getItem(SAVE_KEY)); return s.p.eq.armor.id === 'lupevest'; }), 'and is saved like any other gear');
    t.ok(g.page.errors.length === 0, 'no script errors' + g.page.errors.map(e => ': ' + e).join(''));
    if (process.env.SHOTS) { await g.ev(() => { giveItem('fang', 5); giveItem('fur', 1); openPanel('craft', 'forge'); }); await wait(300); await g.page.screenshot({ path: process.env.SHOTS + '/craft.png' }); }
  } finally { await g.close(); }
};
