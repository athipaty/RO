// #14 potion cooldowns: HP, SP and cure tonics have separate timers; melee drinks HP faster than ranged; hotbar shows it.
const { player, newRoom } = require('./helpers');
module.exports = async t => {
  const A = await player('Drinker', newRoom(), { server: 'http://127.0.0.1:9' });
  try {
    const r = await A.ev(() => {
      enterZone('meadow'); P.inv = []; giveItem('red', 5); giveItem('blue', 5); P.cd = {};
      S = computeStats(); const melee = !S.ranged; P.hp = 1; P.sp = 0;
      useItem('red'); const hp1 = P.hp; useItem('blue'); const sp1 = P.sp; useItem('red'); const hp2 = P.hp;
      const cdMelee = potCd(ITEMS.red); S.ranged = true; const cdRanged = potCd(ITEMS.red); S = computeStats();
      return { melee, hp1, sp1, hp2, cdMelee, cdRanged, cdSp: potCd(ITEMS.blue), desc: itemDesc({ id: 'red' }) };
    });
    t.ok(r.melee && r.hp1 > 1 && r.sp1 > 0, 'an HP tonic and an SP tonic can be drunk back to back');
    t.ok(r.hp2 === r.hp1, 'a second HP tonic waits for its own cooldown');
    t.ok(r.cdMelee < r.cdRanged, `close-range fighters drink faster (${r.cdMelee}s vs ${r.cdRanged}s ranged)`);
    t.ok(/Cooldown/.test(r.desc), 'the tonic description shows its cooldown: ' + r.desc);
    const sweep = await A.ev(async () => { P.bar = [{ i: 'red' }, null, null, null, null, null, null, null]; rebuildHotbar(); P.cd = {}; P.hp = 1; useItem('red');
      await new Promise(r => setTimeout(r, 120)); const el = document.querySelector('#hotbar .slot .cd'); return parseFloat(el.style.height) || 0; });
    t.ok(sweep > 0, `the hotbar slot shows the cooldown sweep (${sweep}%)`);
    const later = await A.ev(async () => { await new Promise(r => setTimeout(r, 1300)); P.hp = 1; useItem('red'); return P.hp > 1; });
    t.ok(later, 'after the cooldown the next tonic works');
    t.ok(A.page.errors.length === 0, 'no script errors' + A.page.errors.map(e => ': ' + e).join(''));
  } finally { await A.close(); }
};
