// v1.51.2: refining has its own sounds: anvil strikes and a chime on success, a crack and a shatter on failure.
const { player, wait, newRoom } = require('./helpers');

module.exports = async t => {
  const A = await player('Smithy', newRoom(), { server: 'http://127.0.0.1:9' });
  try {
    await wait(2000);
    const r = await A.ev(() => {
      const heard = [], real = sfx, rnd = Math.random; sfx = n => { heard.push(n); };
      const setup = lv => { P.eq.weapon = { id: 'sword', uid: 7001 + lv, s: [], r: lv }; giveItem(refineMat('sword'), 5); P.gold = 1e7; refineArm = null; };
      setup(0); Math.random = () => 0; doRefine('eq:weapon'); const ok = heard.slice(); heard.length = 0;
      // a risky refine asks twice, then fails
      let lv = 0; while (refineOdds(lv + 1) >= 1) lv++; setup(lv); Math.random = () => .9999; doRefine('eq:weapon'); doRefine('eq:weapon'); const bad = heard.slice();
      Math.random = rnd; sfx = real;
      // the sounds themselves play without errors
      let err = null; try { if (typeof audioInit === 'function') audioInit(); sfx('refineOk'); sfx('refineFail'); } catch (e) { err = e.message; }
      return { ok, bad, err, gone: !P.eq.weapon };
    });
    t.ok(r.ok.includes('refineOk') && !r.ok.includes('levelup'), 'a successful refine plays its own success sound (' + r.ok.join(',') + ')');
    t.ok(r.bad.includes('refineFail') && !r.bad.includes('hurt') && r.gone, 'a failed refine plays its own failure sound (' + r.bad.join(',') + ')');
    t.ok(!r.err, 'both sounds play without errors' + (r.err ? ': ' + r.err : ''));
    t.ok(A.page.errors.length === 0, 'no script errors' + A.page.errors.map(e => ': ' + e).join(''));
  } finally { await A.close(); }
};
