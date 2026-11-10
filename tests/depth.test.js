// Combat depth: elements, status ailments (on you and on monsters) and the skill tree.
const { player, wait, newRoom } = require('./helpers');

module.exports = async t => {
  const g = await player('Depth', newRoom(), { zone: 'meadow', server: 'http://127.0.0.1:9' }); // offline: monsters run locally
  try {
    await wait(1500);
    // ---- #10 elements
    const el = await g.ev(() => { const real = Math.random; Math.random = () => .5;
      P.cls = 'arcanist'; P.st.int = 40; S = computeStats();
      const m = mobs.find(m => m.d.el === 'earth' && !m.dead); m.d.hp = 1e9; m.hp = 1e9;
      const h0 = m.hp; dealMag(m, 1, 'neutral'); const neutral = h0 - m.hp;
      const h1 = m.hp; dealMag(m, 1, 'fire'); const fire = h1 - m.hp;
      const h2 = m.hp; dealMag(m, 1, 'wind'); const wind = h2 - m.hp;
      Math.random = real; return { neutral, fire, wind, weak: texts.some(x => x.txt === 'Weak!'), resist: texts.some(x => x.txt === 'Resist') }; });
    t.ok(Math.abs(el.fire - el.neutral * 1.5) <= 2 && el.weak, `Fire hits an Earth monster 1.5x (${el.neutral} → ${el.fire}) with a "Weak!" hint`);
    t.ok(Math.abs(el.wind - el.neutral * .5) <= 2 && el.resist, `Wind is resisted by Earth (${el.wind}) with a "Resist" hint`);
    t.ok(await g.ev(() => /Earth/.test((() => { P.target = mobs.find(m => m.d.el === 'earth' && !m.dead); updateHud(); return document.getElementById('tLv').textContent; })())), "the target box shows the monster's element");
    t.ok(await g.ev(() => { openPanel('mob', 'thornling'); const s = panel.textContent; closePanel(); return /Element/.test(s) && /weak to Fire/.test(s) && /Poisoned/.test(s); }), 'monster info shows element, weakness and the ailment it inflicts');

    // ---- #12 ailments on you
    const held = await g.ev(async () => { const w = ms => new Promise(r => setTimeout(r, ms)); P.target = null;
      for (const m of mobs) { m.state = 'idle'; m.aggroed = false; } P.x = Z.spawn.x; P.y = Z.spawn.y;
      tryAilment(['stun', 1, 2]); const x0 = P.x; pathTo(P.x + 120, P.y + 120, true); await w(600);
      const stuck = P.x === x0 && ailHeld(); P.skills.emberbolt = 1; P.cd = {}; P.sp = 999; useSkill('emberbolt'); const noCast = !P.casting;
      return { stuck, noCast, icon: /Stunned/.test(document.getElementById('ailT').textContent) }; });
    t.ok(held.stuck && held.icon, 'stun holds you in place and shows in the status box');
    t.ok(held.noCast, 'you cannot cast while stunned');
    const pois = await g.ev(async () => { const w = ms => new Promise(r => setTimeout(r, ms)); cureAll(true); S = computeStats(); P.hp = S.maxhp - 1;
      tryAilment(['poison', 1, 6]); const h0 = P.hp; await w(2300); const lost = P.hp < h0;
      giveItem('remedy', 1); useItem('remedy'); return { lost, cured: !ailOn('poison') }; });
    t.ok(pois.lost, 'poison drains HP over time and stops regen');
    t.ok(pois.cured, 'a Remedy Draught cures it');
    // (INT was raised above and resists sleep/silence, so force the roll to land)
    t.ok(await g.ev(() => { const real = Math.random; Math.random = () => 0; tryAilment(['sleep', 1, 8]); Math.random = real; const asleep = ailOn('sleep'); hurtPlayer(1, 'test'); return asleep && !ailOn('sleep'); }), 'getting hit wakes you from sleep');
    t.ok(await g.ev(() => { cureAll(true); const real = Math.random; Math.random = () => 0; tryAilment(['silence', 1, 5]); Math.random = real; P.cd = {}; useSkill('emberbolt'); const r = !P.casting && texts.some(x => x.txt === 'Silenced'); cureAll(true); return r; }), 'silence blocks skills');
    t.ok(await g.ev(() => { P.st.vit = 99; S = computeStats(); let n = 0; for (let i = 0; i < 400; i++) { cureAll(true); if (tryAilment(['stun', .5, 1])) n++; } cureAll(true); P.st.vit = 1; S = computeStats(); return n < 160; }), 'high VIT resists stuns');

    // ---- #12 ailments on monsters
    const frz = await g.ev(async () => { const w = ms => new Promise(r => setTimeout(r, ms)); const m = mobs.find(m => !m.dead);
      ailMob(m, 'freeze', 1.5); m.tx = m.x + 60; m.ty = m.y; const x0 = m.x; await w(800); const still = m.x === x0; await w(1200); return { still, after: m.ailUntil <= now }; });
    t.ok(frz.still && frz.after, 'a frozen monster stays still until it thaws');

    // ---- #26 skill tree
    const tree = await g.ev(() => { P.skillPts = 5; P.skills = { emberbolt: 2 }; openPanel('skills');
      const locked = [...panel.querySelectorAll('.snode')].find(n => /Frost Nova/.test(n.textContent));
      const needs = /Needs Ember Bolt 3/.test(locked.textContent) && locked.querySelector('button').disabled;
      panel.querySelector('[data-act="learn"][data-arg="frostnova"]').click(); const blocked = !P.skills.frostnova;
      P.skills.emberbolt = 3; refreshPanel(); panel.querySelector('[data-act="learn"][data-arg="frostnova"]').click();
      const tiers = panel.querySelectorAll('.ttier').length; closePanel(); return { needs, blocked, learned: P.skills.frostnova === 1, tiers }; });
    t.ok(tree.needs && tree.blocked, 'the skill tree locks Frost Nova until Ember Bolt reaches 3');
    t.ok(tree.learned, 'once the requirement is met it can be learned');
    t.ok(tree.tiers === 3, 'skills are laid out in tiers (3 for the Arcanist)');
    t.ok(g.page.errors.length === 0, 'no script errors' + g.page.errors.map(e => ': ' + e).join(''));
  } finally { await g.close(); }
};
