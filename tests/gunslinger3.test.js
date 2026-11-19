// The Gunslinger's advanced callings (js/gunslinger3.js): Corvin's Rimestalker trial offers Sniper, Pyro Gunner and
// Trickshot; each grows out of a first-job path; every new skill damages a monster; Eagle Sight shoots further.
const { player, newRoom, wait } = require('./helpers');
module.exports = async t => {
  const g = await player('Kestrelkid', newRoom(), { zone: 'town', server: 'http://127.0.0.1:9' });
  try {
    await wait(800);
    const r = await g.ev(async () => {
      const w = ms => new Promise(r => setTimeout(r, ms)), out = {};
      out.callings = jobsFrom('gunslinger').join(); out.paths = jobsFrom('gunslinger').map(j => jobPaths(j).map(p => p.id).join('+')).join();
      P.cls = 'gunslinger'; P.jl = 40; P.skills = { quickdraw: 5, piercinground: 3, steadyaim: 3, firstaid: 5 }; openPanel('job');
      panel.querySelector('[data-act="trial"]').click(); for (let i = 0; i < 25; i++) questKill('rimestalker'); giveItem('fang', 10); P.gold = 6000; refreshPanel();
      out.markOnly = [...panel.querySelectorAll('[data-act="promote"]')].map(b => b.dataset.arg).join();
      for (const j of jobsFrom(P.cls)) for (const [r, l] of jobNeeds(j)) P.skills[r] = Math.max(P.skills[r] || 0, l); refreshPanel();
      out.choices = [...panel.querySelectorAll('[data-act="promote"]')].map(b => b.dataset.arg).join();
      panel.querySelector('[data-act="promote"][data-arg="sniper"]').click(); panel.querySelector('[data-act="promoteyes"]').click(); closePanel();
      out.cls = P.cls; out.keeps = P.skills.quickdraw === 5;
      P.eq.weapon = { id: 'longrifle', uid: 702, s: [null] }; S = computeStats(); const r0 = S.range;
      P.skills.eaglesight = 10; S = computeStats(); out.range = [r0, S.range];
      enterZone('meadow'); await w(300);
      const m = mobs.find(x => !x.dead); m.hp = 1e7; m.d = { ...m.d, hp: 1e7, atk: 0, def: 0 }; P.x = m.x - 60; P.y = m.y; P.sp = 99999; S = computeStats();
      out.hit = {};
      for (const id of Object.keys(GS3_SKILLS)) { const sk = SKILLS[id]; if (sk.kind === 'passive') continue; const hp = m.hp;
        if (sk.kind === 'target') sk.run(10, m); else if (sk.kind === 'area') sk.run(10, m.x, m.y); else sk.run(10);
        await w(700); out.hit[id] = m.hp < hp || !!(P.buffs[id] && P.buffs[id].until > now); }
      // Ricochet bounces to a second monster
      const m2 = mobs.find(x => !x.dead && x !== m); m2.hp = 1e7; m2.d = { ...m2.d, hp: 1e7, atk: 0 }; m2.x = m.x + 60; m2.y = m.y; for (const x of [m, m2]) { x.sx = x.x; x.sy = x.y; x.ailUntil = now + 5; } for (const x of mobs) if (x !== m && x !== m2) x.dead = true; const h2 = m2.hp;
      SKILLS.ricochet.run(10, m); await w(900); out.bounce = m2.hp < h2;
      out.th = typeof SKILL_TH !== 'undefined' && Object.keys(GS3_SKILLS).every(id => SKILL_TH[id]);
      return out;
    });
    t.ok(r.callings.split(',').sort().join() === 'pyrogunner,sniper,trickshot', 'the Gunslinger has three advanced callings: ' + r.callings);
    t.ok(r.paths.split(',').sort().join() === ['gunner', 'marksman', 'marksman+gunner'].sort().join() || r.paths.split(',').sort().join() === ['gunner', 'gunner+marksman', 'marksman'].sort().join(), 'one per path and one mixing both: ' + r.paths);
    t.ok(r.markOnly === 'sniper', 'with only Marksman skills learned, Corvin offers just the Sniper (' + r.markOnly + ')');
    t.ok(r.choices.split(',').sort().join() === 'pyrogunner,sniper,trickshot', 'after the Rimestalker trial Corvin offers all three: ' + r.choices);
    t.ok(r.cls === 'sniper' && r.keeps, 'confirming makes you a Sniper and you keep your Gunslinger skills');
    t.ok(r.range[1] === r.range[0] + 120, 'Eagle Sight 10 adds 120px of range with a gun: ' + r.range.join(' -> '));
    const miss = Object.entries(r.hit).filter(([, v]) => !v).map(([k]) => k);
    t.ok(!miss.length, 'every new skill hits a monster or takes effect' + (miss.length ? ': ' + miss.join(', ') : ''));
    t.ok(r.bounce, 'Ricochet bounces to a monster next to the target');
    t.ok(r.th, 'every new skill has Thai text');
    t.ok(g.page.errors.length === 0, 'no script errors' + g.page.errors.map(e => ': ' + e).join(''));
  } finally { await g.close(); }
};
