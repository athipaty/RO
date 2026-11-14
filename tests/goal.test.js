// Where to go next: the goal chip and the edge arrow route through gates; level-up card; loot beams for good drops
const { player, wait, newRoom } = require('./helpers');
module.exports = async t => {
  const g = await player('Goal', newRoom(), { server: 'http://127.0.0.1:9' });
  try {
    await wait(600);
    const r = await g.ev(async () => { const sleep = ms => new Promise(r => setTimeout(r, ms)), out = {};
      enterZone('town'); await sleep(200); goalChip(); out.newbie = document.getElementById('goalChip').textContent;
      QS().active.sprouts = { k: {}, v: {} }; P.track = 'sprouts'; goalChip(); const el = document.getElementById('goalChip');
      out.town = el.textContent; out.townGate = GOAL.pt && Z.portals.find(p => p.x === GOAL.pt.x && p.y === GOAL.pt.y).to;
      out.step = zoneStep('town', 'frost') + ',' + zoneStep('capital', 'woods') + ',' + zoneStep('woods', 'deep2');
      enterZone('meadow'); await sleep(200); goalChip(); out.meadow = el.textContent; out.aimsMob = !!(GOAL.pt && GOAL.pt.m && GOAL.pt.m.d.id === 'sproutling');
      el.click(); out.log = panelKind === 'quests'; closePanel();
      SETS.goal = false; goalChip(); out.off = el.hidden; SETS.goal = true;
      // level-up card
      gainExp(expNeed(P.lv) + 1, 0); await sleep(100); const c = document.getElementById('lvCard'); out.card = c && c.classList.contains('show') && /Level \d+!/.test(c.textContent);
      c.querySelector('[data-lv="stats"]').click(); out.stats = panelKind === 'status'; closePanel();
      // a rare drop gets a beam, a plain one does not
      out.beam = !!lootBeamCol({ id: 'sproutling_sig' }) && !lootBeamCol({ id: 'sap' }) && lootBeamCol({ id: 'sap', boss: true }) === '#ffcf5a';
      return out; });
    t.ok(/has a quest/.test(r.newbie), 'a new hero is pointed at whoever has the first quest (' + r.newbie + ')');
    t.ok(/Defeat Sproutling 0\/8/.test(r.town) && /Greenmoss Meadow/.test(r.town) && r.townGate === 'meadow', 'in town the chip shows the objective and the arrow aims at the meadow gate (' + r.town + ')');
    t.ok(r.step === 'meadow,town,deep1', 'routes go gate by gate between regions (' + r.step + ')');
    t.ok(r.aimsMob && / m$/.test(r.meadow.trim()), 'in the meadow it aims at the nearest Sproutling with a distance (' + r.meadow + ')');
    t.ok(r.log, 'tapping the chip opens the quest log');
    t.ok(r.off, 'Settings → Goal arrow hides it');
    t.ok(r.card && r.stats, 'a level-up shows the card, and its button opens the Stats window');
    t.ok(r.beam, 'sigils and boss drops get a light beam, plain loot does not');
    t.ok(g.page.errors.length === 0, 'no script errors' + g.page.errors.map(e => ': ' + e).join(''));
  } finally { await g.close(); }
};
