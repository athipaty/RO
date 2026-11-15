// Fighting styles, step 2: the 12 master callings have their own projectile or impact, an outer cast ring and their own finisher
const { player, wait, newRoom } = require('./helpers');
module.exports = async t => {
  const g = await player('Master', newRoom(), { server: 'http://127.0.0.1:9' });
  try {
    await wait(400);
    const r = await g.ev(async () => { const sleep = ms => new Promise(r => setTimeout(r, ms)), out = {};
      const masters = Object.keys(JOB3), all = Object.keys(CLASSES).filter(c => c !== 'novice');
      out.n = masters.length;
      out.own = masters.every(j => FS_STYLES[j] && FS_STYLES[j].ring && FS_STYLES[j].fin && FS_STYLES[j] !== FS_STYLES[JOB3[j].from]);
      out.unique = new Set(all.map(j => fsStyle(j).fin.n)).size === all.length && new Set(all.map(j => fsStyle(j).cast.join('|'))).size === all.length;
      out.thai = masters.every(j => TH[FS_STYLES[j].fin.n + '!']);
      enterZone('meadow'); await sleep(300);
      for (const m of mobs) { m.d = { ...m.d, hp: 1e8, atk: 0, def: 0, flee: 0 }; m.hp = 1e8; }
      const m = mobs.find(x => !x.dead); P.lv = 99; P.jl = 50;
      // a Voidcaller's basic attack flies as a void orb
      P.cls = 'voidcaller'; S = computeStats(); P.x = m.x + 160; P.y = m.y; shots.length = 0; basicAttack(m);
      out.void = shots.length === 1 && shots[0].draw === FS_SHOT.void;
      // every master casts on its double ring, fires its finisher and draws without errors
      P.casting = { id: 'emberbolt', l: 1, cost: 0, fn: () => {}, t0: now, dur: 99, tgt: m };
      out.draw = (() => { try { for (const j of masters) { P.cls = j; FSTY.finT = 0; fsFinisher(m); render(); } return true; } catch (e) { return e.message; } })();
      P.casting = null; await sleep(300); out.draw2 = (() => { try { render(); return true; } catch (e) { return e.message; } })();
      // a Warbringer's melee hit is its own (chop with embers), same damage call
      P.cls = 'warbringer'; S = computeStats(); P.x = m.x + 20; P.y = m.y; fx.length = 0; P.meleeHit = { t: m, at: now }; meleeImpact(true);
      out.war = !fx.some(f => f.k === 'slash') && fx.some(f => f.k === 'quake') && fx.some(f => f.k === 'motes');
      return out; });
    t.ok(r.n === 12 && r.own, `all 12 master callings have their own style (${r.n})`);
    t.ok(r.unique, 'all 28 callings have a different finisher and cast circle');
    t.ok(r.thai, 'master finisher names have Thai');
    t.ok(r.void, 'a Voidcaller\'s basic attack flies as a void orb');
    t.ok(r.draw === true && r.draw2 === true, 'every master cast circle and finisher draws without errors ' + (r.draw === true ? '' : r.draw));
    t.ok(r.war, 'a Warbringer\'s hit lands as its own chop with embers');
    t.ok(g.page.errors.length === 0, 'no script errors' + g.page.errors.map(e => ': ' + e).join(''));
  } finally { await g.close(); }
};
