// The "quick wins": weight, cast bars, dodge text, region banner, monster info,
// chat commands, floating EXP, name colours and attack-speed swings.
const { player, wait, newRoom } = require('./helpers');

module.exports = async t => {
  const g = await player('Quick', newRoom());
  try {
    // ---- #38 region banner
    await g.ev(() => enterZone('meadow')); await wait(300);
    t.ok(await g.ev(() => !document.getElementById('zoneBanner').hidden && document.querySelector('#zoneBanner b').textContent === 'Greenmoss Meadow'), 'entering a region shows its name banner');

    // ---- #17 / #13 weight
    t.ok(await g.ev(() => /^Weight \d+ \/ \d+/.test(document.getElementById('weight').textContent)), 'the status box shows carried weight');
    const heavy = await g.ev(async () => { const w = ms => new Promise(r => setTimeout(r, ms));
      giveItem('crest', Math.ceil(maxWeight() * .95 / itemWeight('crest'))); await w(200);
      const m = mobs.find(m => !m.dead); P.x = m.x - 30; P.y = m.y; P.target = m; const hp0 = m.hp; P.hp = 1; await w(1500);
      const r = { lvl: P.heavy, noRegen: P.hp === 1, noHit: m.hp === hp0, msg: document.getElementById('log').textContent.includes('cannot fight') };
      takeItem('crest', invFind('crest').n); P.target = null; await w(200); r.back = P.heavy === 0; return r; });
    t.ok(heavy.lvl === 2 && heavy.noRegen, 'over 90% weight: no HP regen');
    t.ok(heavy.noHit && heavy.msg, 'over 90% weight: you cannot attack, with a message');
    t.ok(heavy.back, 'dropping the weight removes the penalty');

    // ---- #8 cast bar (Arcanist casting Ember Bolt)
    const cast = await g.ev(async () => { const w = ms => new Promise(r => setTimeout(r, ms));
      P.cls = 'arcanist'; P.skills.emberbolt = 3; P.sp = 999; P.cd = {}; S = computeStats();
      const m = mobs.find(m => !m.dead); P.x = m.x - 60; P.y = m.y; P.target = m; const hp0 = m.hp;
      useSkill('emberbolt'); const started = !!P.casting, dur = P.casting && P.casting.dur;
      await w(dur * 1000 + 700); const hit = m.hp < hp0 || m.dead;
      P.cd = {}; useSkill('emberbolt'); const again = !!P.casting; hurtPlayer(1, 'test'); const interrupted = !P.casting;
      return { started, dur, hit, again, interrupted }; });
    t.ok(cast.started && cast.dur > 0, `spells start a cast bar (${cast.dur && cast.dur.toFixed(2)}s)`);
    t.ok(cast.hit, 'the spell lands when the cast finishes');
    t.ok(cast.again && cast.interrupted, 'getting hit interrupts a cast');

    // ---- #9 dodge text
    const dodge = await g.ev(() => { P.st.agi = 999; S = computeStats(); const m = mobs.find(m => !m.dead);
      for (let i = 0; i < 20; i++) mobAttack(m); P.st.agi = 1; S = computeStats();
      return texts.map(x => x.txt); });
    t.ok(dodge.includes('Dodge'), 'monster misses show "Dodge"');
    t.ok(await g.ev(() => { P.st.luk = 99; S = computeStats(); let lucky = false; const m = mobs.find(m => !m.dead);
      for (let i = 0; i < 200 && !lucky; i++) { mobAttack(m); lucky = texts.some(x => x.txt === 'Lucky!'); } P.st.luk = 1; S = computeStats(); return lucky; }), 'high LUK can give a "Lucky!" dodge');

    // ---- #63 floating EXP
    // stand next to it (a game server refuses far-away hits) and give the server a moment to confirm the kill
    t.ok(await g.ev(async () => { const w = ms => new Promise(r => setTimeout(r, ms)); const m = mobs.find(m => !m.dead); P.cls = 'novice'; S = computeStats();
      P.x = m.x - 25; P.y = m.y; NET.lastSent = ''; netTick(0); await w(300); hurtMob(m, 99999, false, 'phys');
      const seen = () => texts.some(x => /^\+\d+ EXP$/.test(x.txt)) && texts.some(x => /^\+\d+ Job$/.test(x.txt));
      for (let i = 0; i < 30 && !seen(); i++) await w(100); return seen(); }),
      'a kill shows floating "+EXP" and "+Job" gains');

    // ---- #42 monster info
    await g.ev(() => { P.target = mobs.find(m => !m.dead && m.d.id === 'hopper'); updateHud(); document.getElementById('tInfo').click(); });
    t.ok(await g.ev(() => panelKind === 'mob' && !panel.hidden && /Your hit chance/.test(panel.textContent) && /Hopper Tuft/.test(panel.textContent) && /Found in/.test(panel.textContent)),
      'the Info button opens the monster info window with stats, drops and where it lives');
    await g.ev(() => closePanel());

    // ---- #47 chat commands
    // calm every monster provoked above, so none of them knocks us out of sitting
    // (the weight check left us at 1 HP, so a provoked monster may have knocked us out: revive first)
    const log = await g.ev(() => { for (const m of mobs) { m.state = 'idle'; m.aggroed = false; } P.dead = false; S = computeStats(); P.hp = S.maxhp; document.getElementById('death').hidden = true; P.x = Z.spawn.x; P.y = Z.spawn.y; ['/where', '/help', '/exp', '/nonsense'].forEach(c => sendChat(c)); sendChat('/sit'); return { txt: document.getElementById('log').textContent, sit: P.sitting }; });
    t.ok(/You are in Greenmoss Meadow at \(/.test(log.txt), '/where tells you where you are');
    t.ok(/Commands: \/help/.test(log.txt) && /EXP per hour/.test(log.txt), '/help and /exp work');
    t.ok(/Unknown command \/nonsense/.test(log.txt) && log.sit, 'unknown commands get a hint; /sit sits you down');

    // ---- #7 attack speed changes the swing
    const sw = await g.ev(() => { P.sitting = false; P.st.agi = 1; S = computeStats(); const m = mobs.find(m => !m.dead); basicAttack(m); const slow = P.swingDur;
      P.st.agi = 90; S = computeStats(); basicAttack(m); const fast = P.swingDur; P.st.agi = 1; S = computeStats(); return { slow, fast }; });
    t.ok(sw.fast < sw.slow, `higher AGI swings faster (${sw.slow.toFixed(2)}s → ${sw.fast.toFixed(2)}s)`);
    t.ok(g.page.errors.length === 0, 'no script errors' + (g.page.errors.length ? ': ' + g.page.errors.join(' | ') : ''));
  } finally { await g.close(); }
};
