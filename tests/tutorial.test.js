// First steps for new players (js/tutorial.js): the tip card walks a new character through walking, Elder Hollis,
// the meadow, a fight, loot and stat points; it can be skipped; older characters never see it.
const { player, newRoom, wait } = require('./helpers');
module.exports = async t => {
  const g = await player('Newbie', newRoom(), { server: 'http://127.0.0.1:9' });
  try {
    await wait(1500);
    const r = await g.ev(async () => {
      const w = ms => new Promise(r => setTimeout(r, ms)), out = {}, card = () => document.getElementById('tutCard'), txt = () => card() && !card().hidden ? card().textContent : '';
      out.start = P.tut === 0 && /walk/i.test(txt());
      P.x += 140; await w(500); out.walk = P.tut === 1 && /Elder Hollis/.test(txt());
      const id = Object.keys(QUESTS).find(k => QUESTS[k].from === 'hollis'); QS().active[id] = { k: {} }; await w(500); out.talk = P.tut === 2 && /Greenmoss/.test(txt());
      enterZone('meadow'); await w(800); out.meadow = P.tut === 3;
      const m = mobs.find(x => !x.dead); questKill(m.d.id); await w(500); out.kill = P.tut === 4 && /Pick up/.test(txt());
      loot.push({ uid: 99999, id: 'red', n: 1, x: P.x, y: P.y, t0: now - 1, exp: now + 60 }); pickUp(loot[loot.length - 1]); await w(500); out.loot = P.tut === 5;
      openPanel('status'); await w(400); out.hiddenInWindow = card().hidden; panel.querySelector('[data-act="stat"][data-arg="str"]').click(); PANEL_ACTS.pendsave(); closePanel(); await w(600);
      out.stats = P.tut === 'done' && /Well done/.test(txt());
      card().querySelector('[data-tut]').click(); await w(400); out.closed = card().hidden;
      // the skip button, and an older character
      P.tut = 0; await w(400); card().querySelector('[data-tut="skip"]').click(); await w(400); out.skip = P.tut === 'done' && card().hidden;
      return out;
    });
    t.ok(r.start, 'a new character gets the first tip: walk');
    t.ok(r.walk && r.talk && r.meadow, 'walking, talking to Elder Hollis and reaching the meadow tick off in order');
    t.ok(r.kill && r.loot, 'a fight and picking up loot tick off');
    t.ok(r.hiddenInWindow, 'the tip hides while a window is open');
    t.ok(r.stats && r.closed, 'spending stat points finishes the steps, and Got it closes the card');
    t.ok(r.skip, 'Skip tips turns them off');
    const old = await g.ev(() => { P.tut = undefined; P.lv = 20; tutStart(); return P.tut; });
    t.ok(old === 'done', 'an older character never sees the tips');
    t.ok(g.page.errors.length === 0, 'no script errors' + g.page.errors.map(e => ': ' + e).join(''));
  } finally { await g.close(); }
};
