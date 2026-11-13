// Builds: new passive and stat-scaled skills for every first job (inherited by advanced callings), build stats on gear, forge recipes and brews.
const { player, wait, newRoom } = require('./helpers');

module.exports = async t => {
  const g = await player('Builder', newRoom(), { server: 'http://127.0.0.1:9' });
  try {
    await wait(500);
    const lists = await g.ev(() => ({ all: ['warden', 'arcanist', 'ranger', 'cleric'].every(c => BUILD_OF[c].every(s => CLASSES[c].skills.includes(s))), w: CLASSES.warden.skills.length, a: CLASSES.arcanist.skills.length, r: CLASSES.ranger.skills.length, c: CLASSES.cleric.skills.length,
      bul: CLASSES.bulwark.skills.includes('lethaledge'), m3: Object.values(CLASSES).filter(c => c.tier === 3).every(c => c.skills.includes(BUILD_OF[c.base][0])),
      pts: 49, lv: ['warden', 'arcanist', 'ranger', 'cleric'].map(c => CLASSES[c].skills.reduce((a, s) => a + SKILLS[s].max, 0)) }));
    t.ok(lists.all && lists.w >= 10, `every first job gets its new skills (skills now (${lists.w}/${lists.a}/${lists.r}/${lists.c})`);
    t.ok(lists.bul && lists.m3, 'advanced and master callings inherit them');
    t.ok(lists.lv.every(n => n > 80), `far more skill levels than a job earns (${lists.lv.join(', ')} vs 49 points), so builds differ`);

    // Warden: passives change the numbers
    const w = await g.ev(() => { P.cls = 'warden'; P.lv = 40; P.st.agi = 40; P.st.str = 40; P.st.vit = 30; P.eq.weapon = { id: 'twinfang', uid: 501, s: [null] };
      P.skills = { cleave: 5 }; S = computeStats(); const a = { atk: S.atk, delay: S.delay, hp: S.maxhp, crit: S.crit, dbl: S.dbl };
      P.skills.bladecraft = 10; P.skills.duelist = 10; P.skills.stoneblood = 10; S = computeStats();
      return { a, b: { atk: S.atk, delay: S.delay, hp: S.maxhp, crit: S.crit, dbl: S.dbl } }; });
    t.ok(w.b.atk === w.a.atk + 30, `Blade Mastery adds ATK with a sword (${w.a.atk} → ${w.b.atk})`);
    t.ok(w.b.delay < w.a.delay * .85 && w.b.crit > w.a.crit + 7, `Duelist's Rhythm: faster attacks (${w.a.delay.toFixed(3)} → ${w.b.delay.toFixed(3)}s) and more CRIT (${w.a.crit} → ${w.b.crit})`);
    t.ok(w.b.hp > w.a.hp * 1.15, `Stoneblood raises max HP (${w.a.hp} → ${w.b.hp})`);
    t.ok(w.a.dbl === 5, 'the Twinfang Saber gives a 5% double attack');
    // skill tree: passives say Passive and cannot go on the hotbar or be cast
    const tree = await g.ev(() => { P.skillPts = 5; openPanel('skills'); const txt = document.getElementById('panel').textContent;
      const sp = P.sp; P.sp = 999; useSkill('duelist'); const cast = P.sp !== 999; P.sp = sp;
      openPanel('hotbar'); const inPick = !!document.querySelector('[data-bar="s:duelist"]'); closePanel();
      return { names: ['Blade Mastery', "Duelist's Rhythm", 'Lethal Edge', 'Sundering Blow', 'Stoneblood', 'Second Wind'].every(n => txt.includes(n)), passive: /Passive/.test(txt), cast, inPick, hot: hotSkills().every(s => !s || SKILLS[s].kind !== 'passive') }; });
    t.ok(tree.names && tree.passive, 'the Warden tree lists the six new skills, passives marked Passive');
    t.ok(!tree.cast && !tree.inPick && tree.hot, 'passives cannot be cast or put on the hotbar');
    // Lethal Edge needs Duelist's Rhythm 3, then hits a monster
    const le = await g.ev(async () => { const w = ms => new Promise(r => setTimeout(r, ms)); P.skills.duelist = 0; const locked = !skillUnlocked('lethaledge'); P.skills.duelist = 3;
      enterZone('meadow'); await w(300); const m = mobs.find(x => !x.dead); m.hp = m.maxhp = 99999; P.x = m.x - 30; P.y = m.y; P.target = m; P.skills.lethaledge = 5; P.sp = 500; S = computeStats();
      useSkill('lethaledge'); await w(100); return { locked, dmg: 99999 - m.hp }; });
    t.ok(le.locked && le.dmg > 0, `Lethal Edge unlocks after Duelist's Rhythm 3 and deals damage (${le.dmg})`);

    // double attack fires a second hit
    const dbl = await g.ev(async () => { const w = ms => new Promise(r => setTimeout(r, ms)); const m = mobs.find(x => !x.dead); m.hp = m.maxhp = 99999; P.x = m.x - 30; P.y = m.y;
      P.target = null; P.queued = null; P.buffs.__t = { name: 't', until: now + 60, b: { dbl: 100, hit: 999 } }; S = computeStats(); let hits = 0; const _d = dealPhys; dealPhys = function () { hits++; return _d.apply(this, arguments); };
      const _r = Math.random; Math.random = () => .01; basicAttack(m); Math.random = _r; meleeImpact(true); await w(700); dealPhys = _d; delete P.buffs.__t; S = computeStats(); return hits; });
    t.ok(dbl === 2, `with double attack a normal attack hits twice (${dbl} hits)`);

    // Arcanist: cast time, MATK %, Mana Shield
    const ar = await g.ev(() => { P.cls = 'arcanist'; P.eq.weapon = { id: 'wand', uid: 502, s: [] }; P.skills = { emberbolt: 5 }; S = computeStats();
      const a = { ct: castTime('emberbolt'), matk: S.matk }; P.skills.swiftcast = 10; P.skills.arcanefocus = 10; P.skills.manaflow = 5; S = computeStats();
      const b = { ct: castTime('emberbolt'), matk: S.matk };
      P.skills.manashield = 10; P.sp = 400; P.hp = S.maxhp; useSkill('manashield'); const sp0 = P.sp, hp0 = P.hp; hurtPlayer(100, 'test');
      return { a, b, hpLost: hp0 - P.hp, spLost: sp0 - P.sp }; });
    t.ok(ar.b.ct < ar.a.ct * .75 && ar.b.matk > ar.a.matk * 1.15, `Swift Casting and Arcane Focus: cast ${ar.a.ct.toFixed(2)} → ${ar.b.ct.toFixed(2)}s, MATK ${ar.a.matk} → ${ar.b.matk}`);
    t.ok(ar.spLost >= 50 && ar.hpLost <= 50, `Mana Shield pays part of a hit with SP (HP −${ar.hpLost}, SP −${ar.spLost})`);

    // Ranger crit build, Cleric healing and guard
    const rc = await g.ev(() => { delete P.buffs.manashield; P.cls = 'ranger'; P.eq.weapon = { id: 'galebow', uid: 503, s: [null] }; P.skills = { huntersluck: 10, owleye: 10, doublenock: 10 }; S = computeStats();
      const r = { critdmg: S.critdmg, dbl: S.dbl };
      P.cls = 'cleric'; P.eq.weapon = { id: 'dawnmace', uid: 504, s: [null] }; P.skills = { faith: 10, divineguard: 10, mend: 3 }; S = computeStats(); P.hp = 1; healP(100); const healed = P.hp - 1;
      P.hp = S.maxhp; const h0 = P.hp; hurtPlayer(100, 'test'); return { r, healed, taken: h0 - P.hp, unl: skillUnlocked('renew') }; });
    t.ok(rc.r.critdmg === 55 && rc.r.dbl === 30, `Ranger: Hunter's Luck + Galeheart Bow crit damage +${rc.r.critdmg}%, Double Nock ${rc.r.dbl}%`);
    t.ok(rc.healed === 140 && rc.taken === 85, `Cleric: Faith + Dawnlight Mace heal 100 → ${rc.healed}; Divine Guard takes 100 → ${rc.taken}`);

    // gear text and recipes
    const gear = await g.ev(() => ({ desc: itemDesc({ id: 'twinfang', s: [null] }), forge: ['quickgrip', 'monocle', 'twinfang', 'stonewall', 'galebow', 'splitter', 'dawnmace'].every(id => FORGES.some(r => r[0] === id)),
      brews: ['quickdraught', 'focustonic', 'keenbrew'].every(id => BREWS.some(r => r[0] === id)), sorted: FORGES.every((r, i) => !i || (ITEMS[FORGES[i - 1][0]].lv || 1) <= (ITEMS[r[0]].lv || 1)) }));
    t.ok(/Attack speed \+10%/.test(gear.desc) && /Double attack 5%/.test(gear.desc), 'gear shows build stats in words: ' + gear.desc);
    t.ok(gear.forge && gear.brews && gear.sorted, 'the new pieces are forgeable at Brannoc (sorted by level) and the brews are in /craft');
    const br = await g.ev(() => { P.cls = 'warden'; P.eq.weapon = { id: 'club', uid: 505, s: [] }; P.skills = {}; S = computeStats(); const d0 = S.delay; P.inv.push({ id: 'quickdraught', n: 1 }); useItem('quickdraught');
      return { d0, d1: S.delay, on: !!P.buffs.quickdraught }; });
    t.ok(br.on && br.d1 < br.d0 * .9, `the Quickening Draught speeds up attacks (${br.d0.toFixed(3)} → ${br.d1.toFixed(3)}s)`);
    // the status window shows the new stats
    t.ok(await g.ev(() => { P.buffs.__t = { name: 't', until: now + 60, b: { critdmg: 10, dmgred: 5 } }; S = computeStats(); openPanel('status'); const s = document.getElementById('panel').textContent; delete P.buffs.__t; closePanel(); return /Crit damage/.test(s) && /Damage taken/.test(s); }),
      'the Status window lists crit damage and damage taken when you have them');
    t.ok(g.page.errors.length === 0, 'no script errors' + g.page.errors.map(e => ': ' + e).join(''));
  } finally { await g.close(); }
};
