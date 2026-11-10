// Items batch: refining at the smith, rarity colours and announcements, storage, equipment window.
const { player, wait, newRoom } = require('./helpers');

module.exports = async t => {
  const g = await player('Smithy', newRoom());
  try {
    // ---- the two new town NPCs exist and can be reached
    const npcs = await g.ev(() => Z.npcs.filter(n => n.role === 'smith' || n.role === 'storage').map(n => ({ role: n.role, ok: canStand(n.x, n.y + 14, PR) })));
    t.ok(npcs.length === 2 && npcs.every(n => n.ok), 'Brannoc the Smith and Wenna the Keeper stand in town where you can reach them');

    // ---- #18 refining: +1..+4 always succeed and raise ATK
    const safe = await g.ev(() => { P.gold = 100000; giveItem('emberore', 10); S = computeStats(); const atk0 = S.atk; openPanel('smith');
      for (let i = 0; i < 4; i++) doRefine('eq:weapon');
      S = computeStats(); return { r: P.eq.weapon.r, atk0, atk: S.atk, ore: invFind('emberore').n, gold: P.gold }; });
    t.ok(safe.r === 4, 'refining to +4 never fails');
    t.ok(safe.atk > safe.atk0, `refining raises ATK (${safe.atk0} → ${safe.atk})`);
    t.ok(safe.ore === 6 && safe.gold === 100000 - (200 + 400 + 600 + 800), 'each refine uses one ore and the right gold fee');

    // risky refine asks twice, success at +5
    const risky = await g.ev(() => { const real = Math.random; Math.random = () => 0; doRefine('eq:weapon'); const asked = refineArm === 'eq:weapon' && P.eq.weapon.r === 4;
      const btn = [...panel.querySelectorAll('[data-act="refine"]')].find(b => b.dataset.arg === 'eq:weapon'); const label = btn && btn.textContent;
      doRefine('eq:weapon'); const r5 = P.eq.weapon.r; Math.random = real; return { asked, label, r5 }; });
    t.ok(risky.asked && risky.label === 'Sure?', 'a risky refine (+5 and up) asks for a second click');
    t.ok(risky.r5 === 5, 'a successful +5 refine raises the item to +5');

    // failure shatters the item
    const fail = await g.ev(() => { const real = Math.random; Math.random = () => 0.999; refineArm = 'eq:weapon'; doRefine('eq:weapon'); Math.random = real;
      return { gone: P.eq.weapon === null, log: document.getElementById('log').textContent.includes('shattered') }; });
    t.ok(fail.gone && fail.log, 'a failed risky refine shatters the item');

    // ---- #20 rarity
    const rar = await g.ev(() => ({ club: rarityOf('club'), bastion: rarityOf('bastion'), ears: rarityOf('lupeears'), sig: rarityOf('hopper_sig'), crown: rarityOf('crown') }));
    t.ok(rar.club === 0 && rar.bastion === 1 && rar.ears === 2 && rar.sig === 3 && rar.crown === 4, 'items have rarity tiers from common to legendary');
    const ann = await g.ev(() => { enterZone('meadow'); const m = mobs.find(m => !m.dead); const n0 = NET.myChat.length;
      dropLoot(m, 'lupeears'); const last = NET.myChat[NET.myChat.length - 1];
      return { sent: NET.myChat.length > n0 && last.k === 'drop' && last.v === 'lupeears', text: announceText('Mira', 'drop', 'lupeears'), glow: loot[loot.length - 1].rare }; });
    t.ok(ann.sent && ann.glow, 'a rare drop glows on the ground and is announced to everyone');
    t.ok(ann.text === 'Mira found a rare Lupe Ears!', `the announcement reads "${ann.text}"`);
    t.ok(await g.ev(() => announceText('Mira', 'refine', '8:bastion') === 'Mira refined a +8 Bastion Blade!' && announceText('Mira', 'refine', '3:bastion') === null),
      'refines of +7 and up are announced, smaller ones are not');

    // ---- #21 storage
    const stor = await g.ev(() => { enterZone('town'); openPanel('storage'); const n0 = (invFind('red') || {}).n;
      const i = P.inv.findIndex(e => e.id === 'red'); panel.querySelector(`[data-act="store"][data-arg="${i}"]`).click();
      const stored = P.storage.some(e => e.id === 'red' && e.n === n0) && !invFind('red');
      save(); return { stored, n0 }; });
    t.ok(stor.stored, 'Store moves a stack from the bag into storage');
    await g.page.reload(); await wait(600);
    await g.ev(() => document.getElementById('contBtn').click()); await wait(500);
    const back = await g.ev(n0 => { const kept = P.storage.some(e => e.id === 'red' && e.n === n0); openPanel('storage');
      panel.querySelector('[data-act="take"][data-arg="0"]').click(); return { kept, taken: (invFind('red') || {}).n === n0 && !P.storage.some(e => e.id === 'red') }; }, stor.n0);
    t.ok(back.kept, 'storage is kept after reloading the game');
    t.ok(back.taken, 'Take moves it back into the bag');

    // ---- #60 equipment window
    await g.ev(() => closePanel());
    await g.page.keyboard.down('Alt'); await g.page.keyboard.press('q'); await g.page.keyboard.up('Alt');
    const eq = await g.ev(() => { const c = document.getElementById('eqCv'); const d = c && c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
      let ink = 0; if (d) for (let i = 3; i < d.length; i += 4) if (d[i] > 0) ink++;
      return { open: panelKind === 'equip' && !panel.hidden, ink, slots: panel.querySelectorAll('.eqslot').length }; });
    t.ok(eq.open && eq.slots === 4, 'Alt+Q opens the equipment window with 4 slots');
    t.ok(eq.ink > 500, 'the window draws your character');
    t.ok(await g.ev(() => !!document.querySelector('[data-open="equip"]')), 'there is an Equip button under the minimap');
    t.ok(g.page.errors.length === 0, 'no script errors' + (g.page.errors.length ? ': ' + g.page.errors.join(' | ') : ''));
  } finally { await g.close(); }
};
