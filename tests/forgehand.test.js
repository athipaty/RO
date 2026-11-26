// The Forgehand family (js/forgehand.js, forgehand2.js, forgehand3.js) replaces the Gunslinger (js/forgemig.js):
// the jobs and their story, every skill hits, an old Gunslinger hero moves over, and guns are axes now.
const { player, newRoom, wait } = require('./helpers');
module.exports = async t => {
  const g = await player('Smithy', newRoom(), { server: 'http://127.0.0.1:9' });
  try {
    await wait(700);
    const r = await g.ev(() => ({ first: JOB_FIRST.includes('forgehand') && !JOB_FIRST.includes('gunslinger'),
      fam: jobsFrom('forgehand').join(',') + '>' + jobsFrom('forgehand').map(j => job3From(j).join('')).join(','),
      gone: ['gunslinger', 'sniper', 'pyrogunner', 'longshot', 'blastmaster'].every(c => !CLASSES[c]),
      guns: Object.keys(ITEMS).filter(k => ITEMS[k].wt === 'gun').length, axes: ['pistol', 'longrifle', 'krakenmaw', 'pyrecannon', 'galegun'].every(k => ITEMS[k] && ITEMS[k].wt === 'axe' && !ITEMS[k].rng),
      story: ['fh1', 'fh2', 'fh3'].every(q => QUESTS[q] && QUESTS[q].job === 'forgehand') && QUESTS.fh3.grant === 'forgehand' && JS_FIRST.includes('fh1'),
      gift: CLASSES.forgehand.gift === 'handaxe' && SHOP.includes('handaxe') && !SHOP.includes('pistol'),
      trials: !!TRIALS.forgehand && !!TRIALS3.forgehand, builds: BUILDS.filter(b => b.job === 'forgehand').map(b => b.route.join('>')).join(' | '),
      skills: ['forgehand', 'runesmith', 'coinbreaker', 'forgemaster', 'goldlord'].every(c => CLASSES[c].skills.every(s => SKILLS[s])),
      styles: ['forgehand', 'runesmith', 'coinbreaker', 'forgemaster', 'goldlord'].every(c => FS_STYLES[c] && FS_STYLES[c].fin) }));
    t.ok(r.first && r.gone, 'the Forgehand is a first job and the Gunslinger callings are gone');
    t.ok(r.fam === 'runesmith,coinbreaker>forgemaster,goldlord', 'two advanced callings, each with its master: ' + r.fam);
    t.ok(r.guns === 0 && r.axes, 'no guns left: every gun is an axe with the same id');
    t.ok(r.story && r.gift, 'three story chapters with Hilde grant it, and a Hand Axe in the General Store to start');
    t.ok(r.trials && r.skills && r.styles, 'both trials, every skill defined, a fight style and finisher for each calling');
    t.ok(r.builds === 'forgehand>runesmith>forgemaster | forgehand>coinbreaker>goldlord', 'a build for each route: ' + r.builds);
    // every active skill of the family runs and hits a monster
    const run = await g.ev(async () => { const w = ms => new Promise(res => setTimeout(res, ms)); enterZone('meadow'); await w(400); const m = mobs.find(x => !x.dead);
      m.hp = 1e7; m.d = { ...m.d, hp: 1e7, def: 0, atk: 0 }; P.x = m.x - 30; P.y = m.y; P.hp = P.sp = 1e6; P.gold = 1e6; S = computeStats(); const bad = [];
      const ids = ['forgehand', 'runesmith', 'coinbreaker', 'forgemaster', 'goldlord'].flatMap(c => CLASSES[c].own || CLASSES[c].skills).filter((v, i, a) => a.indexOf(v) === i && SKILLS[v] && SKILLS[v].kind !== 'passive' && v !== 'firstaid');
      for (const id of ids) { const sk = SKILLS[id]; try { if (sk.kind === 'target') sk.run(5, m); else if (sk.kind === 'area') sk.run(5, m.x, m.y); else sk.run(5); } catch (e) { bad.push(id + ':' + e.message); } }
      await w(1600); return { n: ids.length, bad, hurt: m.hp < 1e7, paid: P.gold < 1e6 }; });
    t.ok(!run.bad.length && run.hurt && run.n >= 14, `all ${run.n} active skills run and hit` + (run.bad.length ? ': ' + run.bad.join(', ') : ''));
    t.ok(run.paid, 'Coin Strike and Gold Rain spend gold');
    // an old Gunslinger hero moves over, its points come back, its story progress carries over
    const mig = await g.ev(() => { P.cls = 'pyrogunner'; P.skillPts = 0; P.skills = { quickdraw: 5, incendiary: 4, firstaid: 2 }; const q = QS(); q.done.push('gs1', 'gs2'); P.build = 'firebrand';
      const moved = gunMigrateHero(); return { moved, cls: P.cls, pts: P.skillPts, aid: P.skills.firstaid, done: q.done.includes('fh2') && !q.done.includes('gs2'), build: P.build, again: gunMigrateHero() }; });
    t.ok(mig.moved && mig.cls === 'runesmith' && mig.pts === 9 && mig.aid === 2, `a Pyro Gunner becomes a Runesmith with 9 points back (${mig.cls}, ${mig.pts})`);
    t.ok(mig.done && mig.build === 'emberforge' && mig.again === false, 'the story and the build carry over, and it happens once');
    // the five look different and draw without errors
    const look = await g.ev(() => { const c = document.createElement('canvas'); c.width = 120; c.height = 140; const g2 = c.getContext('2d'), main = ctx; ctx = g2; const urls = [];
      try { for (const cls of ['forgehand', 'runesmith', 'coinbreaker', 'forgemaster', 'goldlord']) { g2.clearRect(0, 0, 120, 140); drawPlayer({ name: '', cls, look: P.look, eq: { weapon: { id: 'handaxe' } }, x: 60, y: 110, face: 1, held: true, lv: 90 }, 'handaxe'); urls.push(c.toDataURL()); } } finally { ctx = main; }
      return new Set(urls).size; });
    t.ok(look === 5, `the five callings each look their own way (${look})`);
    t.ok(g.page.errors.length === 0, 'no script errors' + g.page.errors.map(e => ': ' + e).join(''));
  } finally { await g.close(); }
};
