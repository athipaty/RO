// v1.72.0: the 24 jobs take the retired jobs' skills that fit them, every family has a party support skill, and the
// Starseer (and only the Starseer) can Revive a fallen party member (js/skillgrant.js).
const { player, wait, newRoom } = require('./helpers');

module.exports = async t => {
  const room = newRoom(), OFFLINE = 'http://127.0.0.1:9';
  const A = await player('Healer', room, { zone: 'meadow', server: OFFLINE });
  await wait(2000);
  const B = await player('Friend', room, { zone: 'meadow', server: OFFLINE });
  try {
    await wait(5000);
    // every job has its granted skills (and passes them on), and each skill exists
    const g = await A.ev(() => { const bad = []; for (const [job, list] of Object.entries(SKILL_GRANT)) for (const sk of list) { if (!SKILLS[sk]) bad.push(sk + ' missing'); else if (!CLASSES[job].skills.includes(sk)) bad.push(job + ' lacks ' + sk); }
      const kidsOk = CLASSES.tempestsage.skills.includes('haste') && CLASSES.starseer.skills.includes('revive') && !CLASSES.cleric.skills.includes('revive') && !CLASSES.oracle.skills.includes('revive') && !CLASSES.dawnknight.skills.includes('revive') && CLASSES.soulreaper.skills.includes('phantomedge') && CLASSES.goldlord.skills.includes('runemastery');
      const fam = {}; for (const c in CLASSES) { if (JOB_RETIRE[c] || (typeof GUN_RETIRE !== 'undefined' && GUN_RETIRE[c]) || c === 'novice') continue; const b = baseOf(c); fam[b] = fam[b] || CLASSES[c].skills.some(s => SKILLS[s] && SKILLS[s].party); }
      return { bad, kidsOk, fam }; });
    t.ok(!g.bad.length, 'every job has its new skills ' + g.bad.join(', '));
    t.ok(g.kidsOk, 'the jobs after them inherit them (Haste for the Tempest Sage, Revive for the Starseer only, Rune Mastery for the Goldlord)');
    t.ok(Object.values(g.fam).every(Boolean), 'every family has a party support skill ' + JSON.stringify(g.fam));

    // each new skill casts without an error, and the skill window opens for every job
    const c = await A.ev(async () => { const w = ms => new Promise(r => setTimeout(r, ms)); const errs = []; P.st.int = 40; P.st.str = 40;
      for (const [job, list] of Object.entries(SKILL_GRANT)) { P.cls = job; S = computeStats(); try { openPanel('skills'); closePanel(); } catch (e) { errs.push(job + ' panel: ' + e.message); }
        for (const sk of list) { const s = SKILLS[sk]; if (s.kind === 'passive' || s.passive) continue; P.skills = { [sk]: 5 }; P.sp = 9999; P.cd = {}; P.casting = null; P.dead = false;
          const m = mobs.find(o => !o.dead); if (m) { m.x = P.x + 40; m.y = P.y; P.target = m; }
          try { s.run(5, m || P, (m || P).x, (m || P).y); } catch (e) { errs.push(sk + ': ' + e.message); } await w(30); } }
      P.cls = 'cleric'; S = computeStats(); return errs; });
    t.ok(!c.length, 'every new skill casts and every skill window opens ' + c.join(' | '));

    // party: Haste reaches a party member, Revive brings one back
    const party = g => g.ev(() => { const [peer] = [...NET.others.keys()]; SOC.party = { id: 'p1', leader: peer, mode: 'share', members: [{ peer, name: 'x' }, { peer: 'me', name: 'me' }] }; renderParty(); return inParty(peer); });
    t.ok(await party(A) && await party(B), 'they form a party');
    const spot = await A.ev(() => { P.cls = 'stormcaller'; P.skills = { haste: 5, revive: 5, mend: 5 }; S = computeStats(); P.sp = 9999; P.cd = {}; P.buffs = {}; return { x: P.x, y: P.y }; });
    await B.ev(s => { P.x = s.x + 60; P.y = s.y; P.buffs = {}; S = computeStats(); }, spot);
    await wait(1500);
    await A.ev(() => { P.cd = {}; P.sp = 9999; P.casting = null; SKILLS.haste.run(5); });
    await wait(2500);
    t.ok(await B.ev(() => !!P.buffs.haste && /cast Haste on you/.test(document.getElementById('log').textContent)), 'Haste reaches the party member');

    await B.ev(() => { die('a test'); });
    await wait(2500);
    const before = await A.ev(() => { const o = [...NET.others.values()][0]; return !!o.dead; });
    t.ok(before, 'the caster sees the party member fall');
    await A.ev(() => { P.cls = 'starseer'; S = computeStats(); P.cd = {}; P.sp = 9999; SKILLS.revive.run(5); });
    await wait(2500);
    const rv = await B.ev(() => ({ dead: P.dead, hp: P.hp, max: S.maxhp, panel: document.getElementById('death').hidden, log: document.getElementById('log').textContent }));
    t.ok(!rv.dead && rv.panel && rv.hp >= rv.max * .49 && rv.hp <= rv.max * .6 && /revived you/.test(rv.log), `Revive Lv 5 brings them back where they fell with 50% HP (${Math.round(rv.hp)}/${rv.max})`);
    const none = await A.ev(() => { P.sp = 0; P.cd = {}; SKILLS.revive.run(3); return P.sp; });
    t.ok(none > 0, 'with nobody down, Revive gives its SP back');
    t.ok(await A.ev(() => !autoSkillList().includes('revive')), 'auto-skill never casts Revive by itself');
    t.ok(!A.page.errors.length && !B.page.errors.length, 'no script errors ' + A.page.errors.concat(B.page.errors).slice(0, 3).join(' | '));
  } finally { await A.close(); await B.close(); }
};
