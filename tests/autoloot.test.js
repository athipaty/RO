// Auto-hunt loot switch: the Loot button (and Settings, /autoloot) decides whether auto-hunt collects drops.
const { player, newRoom } = require('./helpers');
module.exports = async t => {
  const A = await player('Looter', newRoom(), { server: 'http://127.0.0.1:9' });
  try {
    t.ok(await A.ev(() => { const b = document.getElementById('autoLootBtn'); return b && b.classList.contains('on') && P.autoLoot !== false; }), 'the Loot button sits by Auto and starts on');
    const on = await A.ev(() => { enterZone('meadow'); for (const m of mobs) { m.dead = true; m.respawnAt = now + 1e9; } P.auto = true; P.target = null; P.path = []; P.lootGoal = null;
      dropLoot({ x: P.x + 80, y: P.y }, 'sap'); loot[loot.length - 1].t0 = now - 2; autoHunt(); return !!P.lootGoal; });
    t.ok(on, 'with Loot on, auto-hunt walks over to collect drops');
    const off = await A.ev(() => { document.getElementById('autoLootBtn').click(); P.lootGoal = null; P.path = []; autoHunt(); return { goal: !!P.lootGoal, btn: document.getElementById('autoLootBtn').classList.contains('on'), v: P.autoLoot }; });
    t.ok(!off.goal && !off.btn && off.v === false, 'tapping Loot turns it off: auto-hunt leaves drops alone');
    const best = await A.ev(() => { const pick = id => { loot.length = 0; P.lootGoal = null; P.path = []; P.target = null; dropLoot({ x: P.x + 80, y: P.y, d: { boss: false } }, id); loot[0].t0 = now - 2; autoHunt(); return !!P.lootGoal; };
      const boss = (() => { loot.length = 0; P.lootGoal = null; P.path = []; dropLoot({ x: P.x + 80, y: P.y, d: { boss: true } }, 'sap'); loot[0].t0 = now - 2; autoHunt(); return !!P.lootGoal; })();
      return { gear: pick('robe'), sigil: pick('hopper_sig'), mat: pick('sap'), boss, label: document.getElementById('autoLootBtn').textContent }; });
    t.ok(best.gear && best.sigil && best.boss && !best.mat, 'even off, it still collects equipment, sigils and boss drops, just not ordinary materials');
    t.ok(best.label === 'Best', 'the button then reads Best');
    const manual = await A.ev(() => { loot.length = 0; dropLoot({ x: P.x + 80, y: P.y }, 'sap'); const l = loot[0]; P.lootGoal = null; goLoot(l); return P.lootGoal === l; });
    t.ok(manual, 'you can still pick drops up yourself');
    t.ok(await A.ev(() => { save(); return JSON.parse(localStorage.getItem(SAVE_KEY)).p.autoLoot === false; }), 'the choice is saved with your character');
    const cmd = await A.ev(() => { sendChat('/autoloot on'); const a = P.autoLoot; openPanel('settings'); const row = /Auto-hunt collects drops/.test(panel.textContent); PANEL_ACTS.setautoloot(); const b = P.autoLoot; closePanel(); return { a, row, b }; });
    t.ok(cmd.a === true && cmd.row && cmd.b === false, '/autoloot and the Settings switch change it too');
    t.ok(A.page.errors.length === 0, 'no script errors' + A.page.errors.map(e => ': ' + e).join(''));
  } finally { await A.close(); }
};
