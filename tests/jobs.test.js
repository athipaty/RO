// #27 second jobs: the Job Lv 40 trial, promotion, new skills, hotbar slots, saves and how others see you.
const { player, wait, newRoom } = require('./helpers');

module.exports = async t => {
  const room = newRoom();
  const g = await player('Jobber', room, { zone: 'town', server: 'http://127.0.0.1:9' });
  try {
    await wait(1200);
    t.ok(await g.ev(() => Object.keys(CLASSES).filter(k => CLASSES[k].tier === 2).length === 12 &&
      ['warden', 'arcanist', 'ranger', 'cleric'].every(b => jobsFrom(b).length === 3)), 'there are 12 advanced callings, three for each first job');
    t.ok(await g.ev(() => Object.values(JOB2).every(j => j.skills.every(s => SKILLS[s] && SKILLS[s].desc(1) && (SKILLS[s].kind === 'passive' || SKILLS[s].sp(1) > 0)))), 'every new skill is defined');

    const early = await g.ev(() => { P.cls = 'warden'; P.jl = 20; P.skills = { cleave: 5 }; openPanel('job'); const s = panel.textContent;
      const btn = !!panel.querySelector('[data-act="trial"]'); closePanel(); return { s, btn }; });
    t.ok(/Job Level 40/.test(early.s) && /Bulwark/.test(early.s) && /Ravager/.test(early.s) && !early.btn, 'below Job Lv 40 Corvin previews the advanced callings but offers no trial');

    const trial = await g.ev(() => { P.jl = 40; openPanel('job'); panel.querySelector('[data-act="trial"]').click();
      const started = !!P.trial; const noPromote = !panel.querySelector('[data-act="promote"]');
      for (let i = 0; i < 25; i++) questKill('bonearcher'); questKill('scarab');
      giveItem('bone', 10); P.gold = 6000; refreshPanel(); const choices = [...panel.querySelectorAll('[data-act="promote"]')].map(b => b.dataset.arg);
      return { started, noPromote, have: P.trial.have, choices }; });
    t.ok(trial.started && trial.noPromote, 'at Job Lv 40 you can accept the trial, and cannot promote before finishing it');
    t.ok(trial.have === 25, `trial kills count only the right monster (${trial.have}/25)`);
    t.ok(trial.choices.join() === 'bulwark,ravager,runeguard', 'a finished trial offers the three Warden paths');

    const pro = await g.ev(() => { panel.querySelector('[data-act="promote"][data-arg="ravager"]').click();
      return { cls: P.cls, jl: P.jl, gold: P.gold, bones: invFind('bone') ? invFind('bone').n : 0, kept: P.skills.cleave === 5, trial: P.trial, name: document.getElementById('hCls').textContent }; });
    t.ok(pro.cls === 'ravager' && pro.jl === 1 && pro.kept, 'you become a Ravager at Job Lv 1 and keep your Warden skills');
    t.ok(pro.gold === 1000 && pro.bones === 0 && !pro.trial, 'the fee and trial items are taken');

    const tree = await g.ev(() => { P.skillPts = 10; openPanel('skills'); const hs = [...panel.querySelectorAll('.skpsec')].map(h => h.textContent + ' skills'); const lb = id => { PANEL_ACTS.sksel(id); const b = panel.querySelector(`[data-act="learn"][data-arg="${id}"]`); if (!b) throw new Error('no learn for ' + id + ' sel=' + SKP.sel + ' ' + panelKind); return b; };
      const learn = lb('frenzy'); const lockedFrenzy = learn.disabled;
      for (let i = 0; i < 3; i++) lb('rendingblow').click();
      lb('frenzy').click(); closePanel();
      return { hs, lockedFrenzy, rb: P.skills.rendingblow, fr: P.skills.frenzy }; });
    t.ok(tree.hs.join('|') === 'Warden skills|Ravager skills', 'the skill tree shows Warden skills and Ravager skills in two sections');
    t.ok(tree.lockedFrenzy && tree.rb === 3 && tree.fr === 1, 'Frenzy needs Rending Blow 3, then can be learned');

    const hot = await g.ev(() => { openPanel('skills'); PANEL_ACTS.sksel('rendingblow'); panel.querySelector('[data-act="hot"][data-arg="rendingblow:0"]').click();
      PANEL_ACTS.sksel('frenzy'); panel.querySelector('[data-act="hot"][data-arg="frenzy:1"]').click(); closePanel();
      const slots = hotSlots().slice(0, 4).map(s => s && s.skill); const title = document.querySelectorAll('#hotbar .slot')[0].title; return { slots, title }; });
    t.ok(hot.slots[0] === 'rendingblow' && hot.slots[1] === 'frenzy' && /Rending Blow/.test(hot.title), 'you can put new skills on hotbar keys 1 and 2');

    const fight = await g.ev(async () => { const w = ms => new Promise(r => setTimeout(r, ms)); enterZone('meadow'); await w(400);
      const m = mobs.find(m => !m.dead); m.d = { ...m.d }; m.hp = m.d.hp = 1e9; P.x = m.x - 20; P.y = m.y; P.target = m; P.sp = 999; P.cd = {}; S = computeStats();
      const h0 = m.hp; pressSlot(0); await w(100); const hit = h0 - m.hp; await w(500); P.sp = 999; const a0 = S.atk; pressSlot(1); await w(50); return { hit, atkUp: S.atk > a0, buff: !!P.buffs.frenzy }; });
    t.ok(fight.hit > 0, `Rending Blow lands from the hotbar (${fight.hit} damage)`);
    t.ok(fight.atkUp && fight.buff, 'Frenzy raises ATK');

    const sv = await g.ev(() => { const s = snapshot(); return { cls: s.p.cls, hot: s.p.bar.map(e => e && e.s) }; });
    t.ok(sv.cls === 'ravager' && sv.hot[0] === 'rendingblow', 'class and hotbar choices are saved');

    // others see the new job
    const o = await player('Watcher', room, { zone: 'meadow', server: 'http://127.0.0.1:9' });
    try {
      await wait(4000);
      const seen = await o.ev(() => { for (const x of NET.others.values()) if (x.n === 'Jobber') return x.cls; return null; });
      t.ok(seen === 'ravager', `another player sees you as a Ravager (${seen})`);
      t.ok(o.page.errors.length === 0, 'no script errors on the other player' + o.page.errors.map(e => ': ' + e).join(''));
    } finally { await o.close(); }

    // every second job can cast all of its skills without errors
    const all = await g.ev(async () => { const w = ms => new Promise(r => setTimeout(r, ms)); const bad = [];
      for (const id in JOB2) { P.cls = id; P.skills = {}; for (const s of CLASSES[id].skills) P.skills[s] = 5; S = computeStats();
        for (const s of JOB2[id].skills) { const m = mobs.find(m => !m.dead); if (!m) break; m.hp = 1e9; P.x = m.x - 20; P.y = m.y; P.target = m; P.sp = 9999; P.cd = {}; P.casting = null; cureAll(true);
          try { useSkill(s); if (P.casting) { P.casting.dur = 0; castTick(); } } catch (e) { bad.push(s + ': ' + e.message); } await w(30); } }
      return bad; });
    t.ok(all.length === 0, 'all 24 new skills cast cleanly' + all.map(e => ': ' + e).join(''));
    t.ok(g.page.errors.length === 0, 'no script errors' + g.page.errors.map(e => ': ' + e).join(''));
  } finally { await g.close(); }
};
