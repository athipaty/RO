// v1.80.0: Purify, the Cleric's instant cleanse (js/skillgrant.js): cures you and party members nearby of every ailment
// (boss curses too) and guards against new stun, freeze and sleep for a moment.
const { player, wait, newRoom } = require('./helpers');
module.exports = async t => {
  const room = newRoom(), OFF = 'http://127.0.0.1:9';
  const A = await player('Healer', room, { zone: 'meadow', server: OFF }); await wait(2000);
  const B = await player('Tank', room, { zone: 'meadow', server: OFF });
  try {
    await wait(5000);
    const s = await A.ev(() => ({ jobs: ['cleric', 'templar', 'oracle', 'dawnknight', 'starseer'].every(c => CLASSES[c].skills.includes('purify')), notWarden: !CLASSES.warden.skills.includes('purify'),
      instant: !CAST.purify, party: !!SKILLS.purify.party, path: JOB_PATHS.cleric.paths.find(p => p.id === 'healer').skills.includes('purify'), req: SKILL_REQ.purify && SKILL_REQ.purify.mend === 3, noAuto: !autoSkillList().includes('purify') }));
    t.ok(s.jobs && s.notWarden && s.path && s.req, 'every Cleric family job has Purify (Healer path, after Mend 3); other families do not');
    t.ok(s.instant && s.party && s.noAuto, 'it is instant, reaches the party, and auto-skill leaves it to you');
    const party = g => g.ev(() => { const [peer] = [...NET.others.keys()]; SOC.party = { id: 'p1', leader: peer, mode: 'share', members: [{ peer, name: 'x' }, { peer: 'me', name: 'me' }] }; renderParty(); return inParty(peer); });
    t.ok(await party(A) && await party(B), 'they form a party');
    const spot = await A.ev(() => { P.cls = 'cleric'; P.skills = { mend: 3, purify: 5 }; S = computeStats(); P.sp = 999; return { x: P.x, y: P.y }; });
    await B.ev(s => { P.x = s.x + 60; P.y = s.y; P.ail = { stun: now + 5, poison: now + 8 }; P.curse = { stun: now + 5 }; }, spot);
    await wait(1500);
    await A.ev(() => { P.ail = { silence: now + 5 }; P.cd = {}; P.sp = 999; SKILLS.purify.run(5); });
    const self = await A.ev(() => ({ cured: !Object.keys(P.ail || {}).some(ailOn), guard: P.ailGuard - now }));
    t.ok(self.cured && self.guard > 2.5, `the Cleric is cured at once, and guarded for ${self.guard.toFixed(1)}s`);
    await wait(2500);
    const mate = await B.ev(() => { const cured = !Object.keys(P.ail || {}).some(ailOn); const g = (P.ailGuard || 0) > now;
      const blocked = !tryAilment(['stun', 1, 2]) && !ailOn('stun'); bsCurse('freeze', 2, null); const frozen = ailOn('freeze'); return { cured, g, blocked, frozen, log: /cast Purify on you/.test(document.getElementById('log').textContent) }; });
    t.ok(mate.cured && mate.log, 'the stunned, poisoned party member is cured too (boss curse included)');
    t.ok(mate.g && mate.blocked && !mate.frozen, 'and a new stun or a boss freeze does not take hold while the guard lasts');
    t.ok(!A.page.errors.length && !B.page.errors.length, 'no script errors ' + A.page.errors.concat(B.page.errors).slice(0, 3).join(' | '));
  } finally { await A.close(); await B.close(); }
};
