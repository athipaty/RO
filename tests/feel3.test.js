// Boss bar, auto-hunt summary, goal dot on the minimap, bag sort, hit direction
const { player, wait, newRoom } = require('./helpers');
module.exports = async t => {
  const g = await player('Feel3', newRoom(), { server: 'http://127.0.0.1:9' });
  try {
    await wait(500);
    const r = await g.ev(async () => { const sleep = ms => new Promise(r => setTimeout(r, ms)), out = {};
      enterZone('meadow'); await sleep(200); P.hp = 1e6; S.maxhp = 1e6;
      const b = mobs.find(m => m.d.boss); b.dead = false; b.x = P.x + 60; b.y = P.y; P.target = b; await sleep(300);
      const bar = document.getElementById('bossBar'); out.bar = bar && !bar.hidden && bar.textContent.includes(b.d.name);
      b.hp = b.d.hp * .6; await sleep(300); out.flash = bar.classList.contains('hitq'); P.target = null; b.x = P.x + 3000; b.state = 'idle'; await sleep(300); out.gone = bar.hidden;
      // hunt summary
      P.auto = true; await sleep(700); const ms = mobs.filter(m => !m.dead && !m.d.boss).slice(0, 4); for (const m of ms) { m.myDmg = 3; killMob(m); } gainExp(100, 50);
      P.auto = false; await sleep(700); const c = document.getElementById('huntCard'); out.hunt = c && c.classList.contains('show') && c.querySelectorAll('.hcs b')[1].textContent === '4' && +c.querySelectorAll('.hcs b')[2].textContent.replace(/,/g, '') >= 100;
      c.click();
      // bag sort
      P.inv = [{ id: 'sap', n: 3 }, { id: 'sword', uid: 91, s: [] }, { id: 'red', n: 2 }, { id: 'sproutling_sig', n: 1 }]; invTab = 'use'; openPanel('items'); await sleep(50);
      panel.querySelector('[data-act="bagsort"]').click(); out.order = P.inv.map(e => e.id).join(','); closePanel();
      // hit direction: a monster far off screen hits us
      const m = mobs.find(m => !m.dead && !m.d.boss); m.x = P.x + 2000; m.y = P.y; hurtPlayer(5, m); const h = document.getElementById('hitDir'); out.hit = h && h.classList.contains('on') && 'lrtb'.includes(h.dataset.side);
      return out; });
    t.ok(r.bar && r.flash && r.gone, 'the boss bar shows the boss, flashes when a quarter goes, and leaves after the fight');
    t.ok(r.hunt, 'stopping auto-hunt shows a summary of kills and EXP');
    t.ok(r.order === 'red,sword,sproutling_sig,sap', 'Sort orders the bag by kind (' + r.order + ')');
    t.ok(r.hit, 'a hit from off screen flashes the screen edge');
    t.ok(g.page.errors.length === 0, 'no script errors' + g.page.errors.map(e => ': ' + e).join(''));
  } finally { await g.close(); }
};
