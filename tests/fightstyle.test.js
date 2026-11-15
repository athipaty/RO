// Fighting styles: every first and advanced calling has its own basic-attack look, cast circle and finisher; looks only
const { player, wait, newRoom } = require('./helpers');
module.exports = async t => {
  const g = await player('Stylist', newRoom(), { server: 'http://127.0.0.1:9' });
  try {
    await wait(400);
    const r = await g.ev(async () => { const sleep = ms => new Promise(r => setTimeout(r, ms)), out = {};
      const jobs = ['warden', 'bulwark', 'ravager', 'runeguard', 'arcanist', 'stormcaller', 'hexweaver', 'chronomancer', 'ranger', 'sharpshooter', 'wildstalker', 'falconer', 'cleric', 'templar', 'oracle', 'ascetic'];
      out.all = jobs.every(j => fsStyle(j) && fsStyle(j).cast && fsStyle(j).fin && fsStyle(j).melee);
      out.unique = new Set(jobs.map(j => fsStyle(j).fin.n)).size === 16 && new Set(jobs.map(j => fsStyle(j).cast[0] + fsStyle(j).cast[1])).size === 16;
      out.master = !!fsStyle('timeweaver') && fsStyle('timeweaver') !== fsStyle('chronomancer') && !fsStyle('novice');
      enterZone('meadow'); await sleep(300);
      for (const m of mobs) { m.d = { ...m.d, hp: 1e8, atk: 0, def: 0, flee: 0 }; m.hp = 1e8; }
      const m = mobs.find(x => !x.dead); P.lv = 40; P.jl = 30;
      // a Stormcaller's basic attack flies as a spark (same damage call as before)
      P.cls = 'stormcaller'; S = computeStats(); P.x = m.x + 160; P.y = m.y; shots.length = 0; basicAttack(m);
      out.spark = shots.length === 1 && shots[0].draw === FS_SHOT.spark;
      // the render draws it without errors (and every cast circle too)
      P.casting = { id: 'emberbolt', l: 1, cost: 0, fn: () => {}, t0: now, dur: 99, tgt: m };
      out.draw = (() => { try { for (const j of jobs) { P.cls = j; render(); } return true; } catch (e) { return e.message; } })();
      P.casting = null;
      // a Ravager's melee hit: the plain slash becomes the heavy chop (crescent + cracks)
      P.cls = 'ravager'; S = computeStats(); P.x = m.x + 20; P.y = m.y; fx.length = 0; P.meleeHit = { t: m, at: now }; meleeImpact(true);
      out.chop = !fx.some(f => f.k === 'slash') && fx.some(f => f.k === 'crescent') && fx.some(f => f.k === 'quake');
      /* a critical hit adds more effects after the slash: it must still become the chop */
      { const c0 = S.crit; S.crit = 1000; fx.length = 0; P.meleeHit = { t: m, at: now }; meleeImpact(true); S.crit = c0;
        out.chop = out.chop && fx.some(f => f.k === 'critburst') && !fx.some(f => f.k === 'slash') && fx.some(f => f.k === 'quake'); }
      // damage stays the same: the styled hit calls the same dealPhys(t, 1)
      { let calls = []; const dp = dealPhys; dealPhys = (t, mult) => { calls.push(mult); }; P.meleeHit = { t: m, at: now }; meleeImpact(true); dealPhys = dp; out.same = calls.length === 1 && calls[0] === 1; }
      // another player's attack shows in their calling's style
      { shots.length = 0; const o = { cls: 'hexweaver', x: m.x + 200, y: m.y, rx: m.x + 200, ry: m.y }; otherHitFx(o, m, 10, true); out.other = shots.length === 1 && shots[0].draw === FS_SHOT.skull; }
      // finisher: a critical basic hit, with luck on our side, plays the signature move and names it
      { P.cls = 'ascetic'; S = computeStats(); FSTY.finT = 0; const rnd = Math.random; Math.random = () => 0; texts.length = 0;
        FSTY.basic = 1; try { hurtMob(m, 5, true, 'phys'); } finally { FSTY.basic = 0; Math.random = rnd; }
        out.fin = texts.some(x => /Hundred Fists!/.test(x.txt)) && FSTY.finT > now;
        // and not again right away (cooldown), nor from skills
        texts.length = 0; Math.random = () => 0; FSTY.basic = 1; try { hurtMob(m, 5, true, 'phys'); } finally { FSTY.basic = 0; } FSTY.finT = 0; hurtMob(m, 5, true, 'phys'); Math.random = rnd;
        out.finRare = !texts.some(x => /Hundred Fists!/.test(x.txt)); }
      return out; });
    t.ok(r.all && r.unique, `all 16 first and advanced callings have their own cast circle, impact and finisher (all ${r.all}, unique ${r.unique})`);
    t.ok(r.master, 'master callings have a style of their own; a Novice keeps the plain one');
    t.ok(r.spark, 'a Stormcaller\'s basic attack flies as a spark');
    t.ok(r.draw === true, 'every style draws without errors ' + (r.draw === true ? '' : r.draw));
    t.ok(r.chop && r.same, `a Ravager's hit lands as a heavy chop with the same damage call (chop ${r.chop}, same ${r.same})`);
    t.ok(r.other, 'other players\' attacks show in their calling\'s style');
    t.ok(r.fin && r.finRare, `a lucky critical basic hit plays the finisher with its name, then waits (fin ${r.fin}, rare ${r.finRare})`);
    t.ok(g.page.errors.length === 0, 'no script errors' + g.page.errors.map(e => ': ' + e).join(''));
  } finally { await g.close(); }
};
