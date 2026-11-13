// Build skills for advanced and master callings, and sigils (cards) that carry build stats.
const { player, wait, newRoom } = require('./helpers');

module.exports = async t => {
  const g = await player('Master', newRoom(), { server: 'http://127.0.0.1:9' });
  try {
    await wait(500);
    const tree = await g.ev(() => ({
      t2: Object.keys(BUILD2_OF).every(c => BUILD2_OF[c].every(s => CLASSES[c].skills.includes(s) && CLASSES[c].own.includes(s))),
      t3: Object.keys(BUILD3_OF).every(c => BUILD3_OF[c].every(s => CLASSES[c].skills.includes(s) && CLASSES[c].own.includes(s)) && BUILD2_OF[CLASSES[c].parent].every(s => CLASSES[c].skills.includes(s))),
      noDup: Object.values(CLASSES).every(c => new Set(c.skills).size === c.skills.length) }));
    t.ok(tree.t2, 'every advanced calling has its two new skills in its own branch');
    t.ok(tree.t3 && tree.noDup, 'master callings add two more and keep their advanced calling\'s new ones (no duplicates)');

    // Warbringer tree shows all three branches with the new skills
    const tx = await g.ev(() => { P.cls = 'warbringer'; P.lv = 80; P.jl = 30; P.skillPts = 5; P.skills = {}; openPanel('skills'); const s = document.getElementById('panel').textContent; closePanel();
      return ['Lethal Edge', 'Bloodlust', 'Rampage', 'Bloodthirst', 'Execution'].every(n => s.includes(n)); });
    t.ok(tx, 'a Warbringer\'s tree lists Warden, Ravager and Warbringer build skills');

    // passives: Ravager Bloodlust, Warbringer Bloodthirst
    const st = await g.ev(() => { P.st.str = 60; P.st.agi = 40; P.eq.weapon = { id: 'club', uid: 601, s: [] }; S = computeStats(); const a = { atk: S.atk, delay: S.delay, cd: S.critdmg };
      P.skills = { bloodlust: 10, bloodthirst: 10 }; S = computeStats(); return { a, b: { atk: S.atk, delay: S.delay, cd: S.critdmg } }; });
    t.ok(st.b.atk > st.a.atk * 1.3 && st.b.delay < st.a.delay && st.b.cd === 30, `Bloodlust + Bloodthirst: ATK ${st.a.atk} → ${st.b.atk}, faster attacks, crit damage +${st.b.cd}%`);

    // Execution hits twice as hard on a monster under 30% HP
    const ex = await g.ev(async () => { const w = ms => new Promise(r => setTimeout(r, ms)); enterZone('meadow'); await w(300);
      const m = mobs.find(x => !x.dead); P.x = m.x - 30; P.y = m.y; P.target = m; P.skills.execution = 5; P.sp = 999; P.buffs.__t = { name: 't', until: now + 99, b: { crit: -999 } }; S = computeStats();
      const hit = hp => { m.hp = hp; P.cd = {}; const _r = Math.random; Math.random = () => .5; const before = m.hp; useSkill('execution'); Math.random = _r; return before - m.hp; };
      m.d = { ...m.d, hp: 1e6, def: 0 }; const high = hit(9e5); const low = hit(1e5); delete P.buffs.__t; return { high, low }; });
    t.ok(ex.low > ex.high * 1.8, `Execution: ${ex.high} on a healthy foe, ${ex.low} under 30% HP`);

    // Curse of Frailty makes your hits land harder; Chain Lightning jumps
    const cu = await g.ev(async () => { const w = ms => new Promise(r => setTimeout(r, ms)); P.cls = 'hexweaver'; P.skills = { frailty: 10, emberbolt: 1 }; P.sp = 999; S = computeStats();
      const m = mobs.find(x => !x.dead); m.hp = 1e6; m.d = { ...m.d, hp: 1e6, def: 0 }; m.frailUntil = 0;
      const _r = Math.random; Math.random = () => .5; const h0 = m.hp; dealMag(m, 1); const plain = h0 - m.hp;
      P.target = m; P.cd = {}; useSkill('frailty'); const h1 = m.hp; dealMag(m, 1); const cursed = h1 - m.hp; Math.random = _r;
      P.cls = 'stormcaller'; P.skills = { chainlightning: 9 }; S = computeStats(); const near = mobs.filter(x => !x.dead).slice(0, 5); near.forEach((x, i) => { x.x = m.x + 20 + i * 5; x.y = m.y; x.hp = 1e6; x.d = { ...x.d, hp: 1e6 }; });
      P.target = null; const seen = new Set(), _dm = dealMag; dealMag = function (mm) { seen.add(mm); return _dm.apply(this, arguments); }; SKILLS.chainlightning.run(9, near[0]); await w(800); dealMag = _dm;
      return { plain, cursed, jumped: seen.size }; });
    t.ok(cu.cursed > cu.plain * 1.25, `Curse of Frailty: ${cu.plain} → ${cu.cursed} per hit`);
    t.ok(cu.jumped >= 3, `Chain Lightning hits the target and jumps to others (${cu.jumped} monsters hit)`);

    // Starseer: Constellation buff + Astral Grace
    const ss = await g.ev(() => { P.cls = 'starseer'; P.skills = { astralgrace: 10, constellation: 10 }; S = computeStats(); const heal = S.heal, m0 = S.matk; P.sp = 999; P.cd = {}; P.hp = 1; useSkill('constellation');
      return { heal, on: !!P.buffs.constellation, dmgred: S.dmgred, matk: S.matk > m0 }; });
    t.ok(ss.heal === 40 && ss.on && ss.dmgred === 20 && ss.matk, `Starseer: Astral Grace +${ss.heal}% healing, Constellation cuts damage ${ss.dmgred}% and raises MATK`);

    // sigils with build stats
    const sg = await g.ev(() => { P.cls = 'warden'; P.skills = {}; delete P.buffs.constellation; P.eq.accessory = null; S = computeStats(); const d0 = S.delay;
      P.eq.accessory = { id: 'beastbane', uid: 602, s: ['hopper_sig'] }; ITEMS.beastbane.slots = ITEMS.beastbane.slots || 0; S = computeStats();
      const n = Object.keys(SIG_BUILD).filter(id => ITEMS[id + '_sig']).length;
      return { b: ITEMS.hopper_sig.b, desc: ITEMS.hopper_sig.desc, codex: MOBS.hopper.sig.txt, slower: S.delay < d0, n, warlord: ITEMS.warlord_sig.b }; });
    t.ok(sg.b.agi === 2 && sg.b.aspd === 3 && /Attack speed \+3%/.test(sg.desc) && /Attack speed/.test(sg.codex), 'the Hopper Sigil keeps +2 AGI and adds +3% attack speed: ' + sg.desc);
    t.ok(sg.slower, 'a socketed build sigil changes your stats');
    t.ok(sg.n >= 35 && sg.warlord.str === 5 && sg.warlord.atkpct === 5, `${sg.n} sigils now carry a build stat (old bonuses kept)`);
    t.ok(g.page.errors.length === 0, 'no script errors' + g.page.errors.map(e => ': ' + e).join(''));
  } finally { await g.close(); }
};
