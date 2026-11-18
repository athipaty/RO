// The Shade's advanced callings (js/shade2.js): Corvin's Gloomcap trial offers Nightblade, Venomancer and Phantom;
// each grows out of a first-job path; every new skill damages a monster; poison ticks and the Shadow Double copies attacks.
const { player, newRoom, wait } = require('./helpers');
module.exports = async t => {
  const g = await player('Nightwalker', newRoom(), { zone: 'town', server: 'http://127.0.0.1:9' });
  try {
    await wait(800);
    const r = await g.ev(async () => {
      const w = ms => new Promise(r => setTimeout(r, ms)), out = {};
      out.callings = jobsFrom('shade').join(); out.paths = jobsFrom('shade').map(j => jobPaths(j).map(p => p.id).join('+')).join();
      P.cls = 'shade'; P.jl = 40; P.skills = { twinfang: 5, backstab: 3, shadowsense: 3, nimblehands: 3 }; openPanel('job');
      panel.querySelector('[data-act="trial"]').click(); for (let i = 0; i < 25; i++) questKill('gloomcap'); giveItem('gloomspore', 10); P.gold = 6000; refreshPanel();
      out.edgeOnly = [...panel.querySelectorAll('[data-act="promote"]')].map(b => b.dataset.arg).join();
      for (const j of jobsFrom(P.cls)) for (const [r, l] of jobNeeds(j)) P.skills[r] = Math.max(P.skills[r] || 0, l); refreshPanel();
      out.choices = [...panel.querySelectorAll('[data-act="promote"]')].map(b => b.dataset.arg).join();
      panel.querySelector('[data-act="promote"][data-arg="nightblade"]').click(); panel.querySelector('[data-act="promoteyes"]').click(); closePanel();
      out.cls = P.cls; out.keeps = P.skills.twinfang === 5;
      enterZone('meadow'); await w(300);
      const m = mobs.find(x => !x.dead); m.hp = 1e7; m.d = { ...m.d, hp: 1e7, atk: 0, def: 0 }; P.x = m.x - 30; P.y = m.y; P.sp = 99999; S = computeStats();
      out.hit = {};
      for (const id of Object.keys(SH2_SKILLS)) { const sk = SKILLS[id]; if (sk.kind === 'passive') continue; const hp = m.hp;
        if (sk.kind === 'target') sk.run(10, m); else if (sk.kind === 'area') sk.run(10, m.x, m.y); else sk.run(10);
        await w(400); out.hit[id] = m.hp < hp || !!(P.buffs[id] && P.buffs[id].until > now); }
      const hp = m.hp; sh2Poison(m, 1, 2); await w(2300); out.poison = m.hp < hp;
      P.skills.shadowdouble = 5; SKILLS.shadowdouble.run(5); const h2 = m.hp; P.target = m; basicAttack(m); await w(400); out.dbl = h2 - m.hp;
      return out;
    });
    t.ok(r.callings === 'nightblade,venomancer,phantom', 'the Shade has three advanced callings: ' + r.callings);
    t.ok(r.paths === 'edge,venom,edge+venom' || r.paths.split(',').sort().join() === ['edge', 'edge+venom', 'venom'].sort().join(), 'one per path and one mixing both: ' + r.paths);
    t.ok(r.edgeOnly === 'nightblade', 'with only Edge skills learned, Corvin offers just the Nightblade (' + r.edgeOnly + ')');
    t.ok(r.choices === 'nightblade,venomancer,phantom', 'after the Gloomcap trial Corvin offers all three');
    t.ok(r.cls === 'nightblade' && r.keeps, 'confirming makes you a Nightblade and you keep your Shade skills');
    const miss = Object.entries(r.hit).filter(([, v]) => !v).map(([k]) => k);
    t.ok(!miss.length, 'every new skill hits a monster or takes effect' + (miss.length ? ': ' + miss.join(', ') : ''));
    t.ok(r.poison, 'poison keeps hurting after the cut');
    t.ok(r.dbl > 0, 'the Shadow Double joins a normal attack');
    t.ok(g.page.errors.length === 0, 'no script errors' + g.page.errors.map(e => ': ' + e).join(''));
  } finally { await g.close(); }
};
