// Single-player checks: ground loot, desktop shortcuts, sitting and turning.
const { player, wait, newRoom } = require('./helpers');

module.exports = async t => {
  const g = await player('Mira', newRoom());
  const k = g.page.keyboard;
  try {
    // ---- loot
    const drop = await g.ev(() => { enterZone('meadow');
      const m = mobs.find(m => m.d.id === 'sproutling'); m.d.drops = [['sap', 1], ['red', 1]]; m.d.sigChance = 0;
      P.x = Z.spawn.x; P.y = Z.spawn.y; m.x = P.x + 34; m.y = P.y - 10;
      P.ach = { got: { kill1: 1 } }; // the first-kill achievement pays gold; leave it out of this check
      if (typeof festNow === 'function') festNow = () => null; // festival tokens would add a drop
      const bag = P.inv.length, gold = P.gold; hurtMob(m, 99999, false, 'phys');
      return { n: loot.length, bag: P.inv.length === bag, gold: P.gold === gold }; });
    t.ok(drop.n === 2 && drop.bag && drop.gold, 'a kill drops items on the ground (no gold from normal monsters), not straight into the bag');
    t.ok(/Drops: Hopper Tuft 50% · Red Tonic 8% · Sigil 1%/.test(await g.ev(() => { P.target = mobs.find(m => m.d.id === 'hopper'); updateHud(); const s = document.getElementById('tDrops').textContent; P.target = null; return s; })),
      'the target box lists drop chances');
    const picked = await g.ev(async () => { const w = ms => new Promise(r => setTimeout(r, ms)); const gold = P.gold;
      while (loot.length) { goLoot(loot[0]); for (let i = 0; i < 40 && P.lootGoal; i++) await w(100); if (P.lootGoal) break; }
      return loot.length === 0 && !!invFind('sap') && !!invFind('red'); });
    t.ok(picked, 'walking to each item picks it up');

    // ---- shortcuts
    const panelNow = () => g.ev(() => panel.hidden ? null : panelKind);
    await k.down('Alt'); await k.press('e'); await k.up('Alt'); t.ok(await panelNow() === 'items', 'Alt+E opens items');
    await k.down('Alt'); await k.press('s'); await k.up('Alt'); t.ok(await panelNow() === 'skills', 'Alt+S opens skills');
    await k.down('Alt'); await k.press('a'); await k.up('Alt'); t.ok(await panelNow() === 'status', 'Alt+A opens stats');
    await k.press('Escape');
    await g.ev(() => { P.hp = 10; P.cd = {}; });
    await k.press('F5'); t.ok(await g.ev(() => P.hp > 10), 'F5 uses the hotbar slot (Red Tonic)');
    await k.press('F12'); t.ok(await g.ev(() => document.getElementById('hotbar').hidden), 'F12 hides the hotbar');
    await k.press('F12');

    // ---- sitting and turning
    await k.press('Insert'); t.ok(await g.ev(() => P.sitting), 'Insert sits down');
    const x0 = await g.ev(() => P.x);
    await k.down('w'); await wait(300); await k.up('w');
    t.ok(await g.ev(x => P.back === true && P.sitting && P.x === x, x0), 'while sitting, W turns you to face away without standing up');
    await k.down('a'); await wait(200); await k.up('a');
    t.ok(await g.ev(() => P.face === -1 && P.sitting), 'while sitting, A turns you left');
    await k.press('Insert'); t.ok(await g.ev(() => !P.sitting), 'Insert stands back up');
    await g.ev(() => { P.back = true; pathTo(P.x + 60, P.y + 60, true); }); await wait(400);
    t.ok(await g.ev(() => P.back === false), 'walking toward the camera shows the front view');
    t.ok(g.page.errors.length === 0, 'no script errors' + (g.page.errors.length ? ': ' + g.page.errors.join(' | ') : ''));
  } finally { await g.close(); }
};
