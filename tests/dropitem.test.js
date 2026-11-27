// v1.79.0: drop what you do not want from the bag (js/dropitem.js): ask once, then a pile at your feet; pick it up again;
// auto-hunt leaves it alone; it fades after 2 minutes.
const { player, wait, newRoom } = require('./helpers');
module.exports = async t => {
  const A = await player('Tidy', newRoom(), { server: 'http://127.0.0.1:9' });
  try {
    await wait(2000);
    const r = await A.ev(async () => { const w = ms => new Promise(r => setTimeout(r, ms)); enterZone('meadow'); await w(400); for (const m of mobs) { m.dead = true; m.respawnAt = now + 999; }
      P.inv = []; giveItem('sap', 12); giveItem('robe'); const robe = P.inv.find(e => e.id === 'robe'); robe.r = 3; const ruid = robe.uid;
      invTab = 'etc'; openPanel('items'); const btns = panel.querySelectorAll('.dropbtn').length;
      const i = P.inv.findIndex(e => e.id === 'sap'); PANEL_ACTS.dropinv(i + ':sap'); const asked = /Drop ×12\?/.test(panel.textContent) && P.inv.some(e => e.id === 'sap');
      PANEL_ACTS.dropinv(i + ':sap'); const gone = !P.inv.some(e => e.id === 'sap'), pile = loot.find(l => l.id === 'sap' && l.dropped), n = pile && pile.n;
      // auto-hunt does not pick it back up
      P.auto = true; P.autoLoot = true; P.target = null; P.lootGoal = null; autoHunt(); const ignored = P.lootGoal !== pile; P.auto = false;
      // pick it up by hand: the whole pile comes back
      P.x = pile.x; P.y = pile.y; goLoot(pile); const back = (P.inv.find(e => e.id === 'sap') || {}).n;
      // gear keeps its refine
      invTab = 'equip'; refreshPanel(); const j = P.inv.findIndex(e => e.id === 'robe'); PANEL_ACTS.dropinv(j + ':robe'); PANEL_ACTS.dropinv(j + ':robe');
      const rp = loot.find(l => l.id === 'robe' && l.dropped); const fades = rp && rp.exp - now > 100 && rp.exp - now <= 120; P.x = rp.x; P.y = rp.y; goLoot(rp); const rb = P.inv.find(e => e.id === 'robe');
      closePanel(); return { btns, asked, gone, n, ignored, back, fades, robe: rb && rb.r === 3 && rb.uid === ruid }; });
    t.ok(r.btns >= 1, 'every item in the bag has a Drop button');
    t.ok(r.asked, 'the first tap asks first ("Drop ×12?") and drops nothing');
    t.ok(r.gone && r.n === 12, 'the second tap puts the whole stack on the ground as one pile');
    t.ok(r.ignored, 'auto-hunt does not pick your dropped things back up');
    t.ok(r.back === 12, 'picking the pile up gives all 12 back');
    t.ok(r.fades && r.robe, 'a dropped piece of gear fades after 2 minutes, and comes back exactly as it was (+3, same piece)');
    t.ok(!A.page.errors.length, 'no script errors ' + A.page.errors.slice(0, 3).join(' | '));
  } finally { await A.close(); }
};
