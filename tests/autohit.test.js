// Auto-hit: a button beside Auto; fights the picked/nearest monster with skills first, takes the next close one,
// never wanders; stops when you walk, when nothing is near, or when auto-hunt starts
const { player, newRoom } = require('./helpers');
module.exports = async t => {
  const g = await player('Hitter', newRoom(), { server: 'http://127.0.0.1:9' });
  try {
    const r = await g.ev(async () => { const sleep = ms => new Promise(r => setTimeout(r, ms)), out = {};
      { const h = document.getElementById('ahitBtn'), pv = h && h.previousElementSibling; out.btn = !!pv && (pv.id === 'autoBtn' || (pv.id === 'rideBtn' && pv.previousElementSibling === document.getElementById('autoBtn'))); }
      enterZone('meadow'); await sleep(300);
      for (const m of mobs) { m.d = { ...m.d, hp: 1e8, atk: 0, def: 0, aggro: false, spd: 0 }; m.hp = 1e8; }
      P.cls = 'arcanist'; P.lv = 40; P.jl = 30; P.skills = { emberbolt: 5 }; P.useLv = {}; P.cd = {}; P.buffs = {}; P.bar = [{ s: 'emberbolt' }]; P.bars = [];
      P.st = { str: 30, agi: 20, vit: 30, int: 60, dex: 40, luk: 10 }; S = computeStats(); P.hp = S.maxhp; P.sp = S.maxsp; rebuildHotbar();
      // two monsters close together, everything else far away
      const ms = mobs.filter(m => !m.dead).slice(0, 2); for (const m of mobs) if (!ms.includes(m)) m.x += 3000;
      const [a, b] = ms; b.x = a.x + 60; b.y = a.y; P.x = a.x - 120; P.y = a.y; P.path = []; P.target = null;
      document.getElementById('ahitBtn').click(); await sleep(150);
      out.on = P.autoHit === true && !!P.target && document.getElementById('ahitBtn').classList.contains('on');
      const first = P.target; const h0 = first.hp; await sleep(2500);
      out.skill = (P.cd.emberbolt || 0) > 0 && first.hp < h0;
      // the first one falls: it takes the next close monster by itself
      first.hp = 0; first.dead = true; P.target = null; await sleep(800);
      out.next = P.autoHit && P.target === b;
      out.stayed = Math.hypot(P.x - (a.x - 120), P.y - a.y) < 160;
      // the last one falls and nothing else is close: it stops
      b.dead = true; P.target = null; await sleep(1500);
      out.stopEmpty = !P.autoHit && !document.getElementById('ahitBtn').classList.contains('on');
      // walking (a tap on the ground) stops it
      for (const m of mobs) if (m === a || m === b) { m.dead = false; m.dying = 0; m.hp = 1e8; }
      P.target = a; document.getElementById('ahitBtn').click(); await sleep(300); const was = P.autoHit;
      clickMark = { x: P.x + 200, y: P.y, t: now }; P.target = null; pathTo(P.x + 200, P.y, true); await sleep(400);
      out.stopWalk = was && !P.autoHit;
      // auto-hunt taking over turns it off
      P.target = a; document.getElementById('ahitBtn').click(); await sleep(200); P.auto = true; await sleep(300);
      out.stopAuto = !P.autoHit; P.auto = false;
      // in town it does not start
      enterZone('town'); await sleep(200); document.getElementById('ahitBtn').click(); await sleep(100); out.town = !P.autoHit;
      return out; });
    t.ok(r.btn, 'the Hit button sits right after Auto (or after Ride beside it)');
    t.ok(r.on && r.skill, `tapping it fights the nearest monster with skills first (on ${r.on}, Ember Bolt ${r.skill})`);
    t.ok(r.next && r.stayed, `when it falls the next close monster is taken, without wandering (next ${r.next}, stayed ${r.stayed})`);
    t.ok(r.stopEmpty, 'with nothing close it stops by itself');
    t.ok(r.stopWalk, 'walking somewhere stops it');
    t.ok(r.stopAuto && r.town, `auto-hunt takes over from it, and it does not start in town (auto ${r.stopAuto}, town ${r.town})`);
    t.ok(g.page.errors.length === 0, 'no script errors' + g.page.errors.map(e => ': ' + e).join(''));
  } finally { await g.close(); }
};
