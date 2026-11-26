// Two advanced callings and two masters per family (js/jobtrim.js): the retired ones are offered nowhere, and a hero
// already on one moves to the calling it joined, with the points of skills it loses given back.
const { player, newRoom, wait } = require('./helpers');
module.exports = async t => {
  const g = await player('Trimmer', newRoom(), { server: 'http://127.0.0.1:9' });
  try {
    await wait(600);
    const r = await g.ev(() => ({ adv: Object.keys(JOB2).length, master: Object.keys(JOB3).length,
      two: ['warden', 'arcanist', 'ranger', 'cleric', 'shade', 'forgehand'].every(b => jobsFrom(b).length === 2 && jobsFrom(b).every(j => job3From(j).length === 1)),
      gone: Object.keys(JOB_RETIRE).every(c => !JOB2[c] && !JOB3[c] && CLASSES[c] && !BUILDS.some(b => b.route.includes(c))),
      map: JOB_RETIRE.runelord + ',' + JOB_RETIRE.ascetic }));
    t.ok(r.adv === 12 && r.master === 12 && r.two, `12 advanced and 12 master callings, two of each per family (${r.adv}/${r.master})`);
    t.ok(r.gone, 'the retired callings are offered nowhere (no trial, no ascension, no build) but still exist for old heroes');
    t.ok(r.map === 'aegislord,templar', 'a retired master goes to the master of the calling it joined: ' + r.map);
    // a Runeguard hero moves to Bulwark: the shared skills stay, the Runeguard ones come back as points
    const m = await g.ev(() => { P.cls = 'runeguard'; P.skillPts = 0; const own = CLASSES.runeguard.own[0], keep = CLASSES.warden.skills[0];
      P.skills = { [own]: 5, [keep]: 3 }; P.bar = [{ s: own }, { s: keep }]; const moved = jobTrimHero();
      return { moved, cls: P.cls, pts: P.skillPts, kept: P.skills[keep], lost: !(own in P.skills), bar: !P.bar[0] && P.bar[1] && P.bar[1].s === keep, again: jobTrimHero() }; });
    t.ok(m.moved && m.cls === 'bulwark' && m.pts === 5 && m.kept === 3 && m.lost, `a Runeguard becomes a Bulwark with 5 points back (${m.cls}, ${m.pts})`);
    t.ok(m.bar && m.again === false, 'the lost skill leaves the hotbar, and a moved hero is not moved again');
    const u = await g.ev(() => { P.cls = 'umbraldancer'; P.skills = {}; jobTrimHero(); return P.cls; });
    t.ok(u === 'soulreaper', 'an Umbral Dancer becomes a Soulreaper: ' + u);
    t.ok(g.page.errors.length === 0, 'no script errors' + g.page.errors.map(e => ': ' + e).join(''));
  } finally { await g.close(); }
};
