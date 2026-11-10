// #29 support skills reach party members nearby (heals and buffs travel in the caster's presence update).
// Uses the public-broker backup path, with the party set up directly on both sides.
const { player, wait, newRoom } = require('./helpers');

module.exports = async t => {
  const room = newRoom(), OFFLINE = 'http://127.0.0.1:9';
  const A = await player('Healer', room, { zone: 'meadow', server: OFFLINE });
  await wait(2000);
  const B = await player('Friend', room, { zone: 'meadow', server: OFFLINE });
  try {
    await wait(5000);
    const ok = await A.ev(() => NET.others.size === 1) && await B.ev(() => NET.others.size === 1);
    t.ok(ok, 'the two players see each other');
    // stand together, A is a Cleric; not in a party yet
    const spot = await A.ev(() => { P.cls = 'cleric'; P.skills = { mend: 5, blessing: 5 }; P.st.int = 50; S = computeStats(); P.sp = 999; return { x: P.x, y: P.y }; });
    await B.ev(s => { P.x = s.x + 60; P.y = s.y; P.cls = 'warden'; S = computeStats(); P.hp = 10; }, spot);
    await wait(1500);
    await A.ev(() => { P.cd = {}; useSkill('blessing'); });
    await wait(2000);
    t.ok(await B.ev(() => !P.buffs.blessing), 'without a party, Blessing only affects the caster');

    // form the party on both sides
    const party = g => g.ev(() => { const [peer] = [...NET.others.keys()]; SOC.party = { id: 'p1', leader: peer, mode: 'share', members: [{ peer, name: 'x' }, { peer: 'me', name: 'me' }] }; renderParty(); return inParty(peer); });
    t.ok(await party(A) && await party(B), 'they form a party');
    await wait(500);
    const cast = await A.ev(async () => { const w = ms => new Promise(r => setTimeout(r, ms)); P.cd = {}; P.sp = 999; useSkill('blessing'); await w(1200); P.cd = {}; P.sp = 999; P.casting = null; useSkill('mend'); await w(1200); if (P.casting) { P.casting.dur = 0; castTick(); }
      return { log: document.getElementById('log').textContent, self: !!P.buffs.blessing }; });
    t.ok(cast.self && /Blessing also reached Friend/.test(cast.log), 'the caster sees Blessing reach the party member');
    await wait(2500);
    const got = await B.ev(() => ({ buff: P.buffs.blessing && P.buffs.blessing.b.str, hp: P.hp, log: document.getElementById('log').textContent, str: S.str }));
    t.ok(got.buff === 5 && /Healer cast Blessing on you/.test(got.log), 'the party member gets Blessing (+5 STR) with a message');
    t.ok(got.hp > 10 && /Healer cast Mend on you/.test(got.log), `Mend heals the party member too (HP 10 → ${got.hp})`);
    t.ok(await A.ev(() => /Party members within 300px/.test(SKILLS.blessing.desc(1)) && /party/.test((openPanel('skills'), panel.textContent)) && (closePanel(), true)), 'skill descriptions and the tree say which skills reach the party');

    // out of range: nothing
    await B.ev(s => { P.x = s.x + 900; P.y = s.y; P.buffs = {}; S = computeStats(); }, spot);
    await wait(1500);
    await A.ev(() => { P.cd = {}; P.sp = 999; useSkill('blessing'); });
    await wait(2500);
    t.ok(await B.ev(() => !P.buffs.blessing), 'a party member far away is not affected');
    // other supports
    t.ok(await A.ev(() => ['sanctuary', 'divinegrace', 'holyaegis', 'warcry', 'swiftstep'].every(id => SKILLS[id].party)), 'Oracle, Templar, Bulwark and Wildstalker supports also reach the party');
    t.ok(A.page.errors.length === 0 && B.page.errors.length === 0, 'no script errors' + [...A.page.errors, ...B.page.errors].map(e => ': ' + e).join(''));
  } finally { await A.close(); await B.close(); }
};
