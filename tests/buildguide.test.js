// Build guide: three ways to play each job, a next-step marker in the Skills and Stats windows, saved with the hero.
const { player, wait, newRoom } = require('./helpers');

module.exports = async t => {
  const g = await player('Guided', newRoom(), { server: 'http://127.0.0.1:9' });
  try {
    await wait(500);
    const data = await g.ev(() => { const bad = []; for (const b of BUILDS) { for (const [id] of b.skills) if (!SKILLS[id]) bad.push(b.id + ':' + id);
        for (const c of b.route) if (!CLASSES[c]) bad.push(b.id + ':' + c); for (const id of b.gear) if (!ITEMS[id]) bad.push(b.id + ':' + id); for (const m of b.sigils) if (!ITEMS[m + '_sig']) bad.push(b.id + ':' + m);
        // every skill in the plan belongs to a calling on the route
        for (const [id] of b.skills) if (!b.route.some(c => CLASSES[c].skills.includes(id))) bad.push(b.id + ' off-route ' + id); }
      const per = {}; for (const b of BUILDS) per[b.job] = (per[b.job] || 0) + 1; return { bad, per }; });
    t.ok(!data.bad.length, 'every build names real skills, callings, gear and sigils on its own route' + (data.bad.length ? ': ' + data.bad.join(', ') : ''));
    t.ok(['warden', 'arcanist', 'ranger', 'cleric'].every(j => data.per[j] === 3), 'three builds for each first job');

    // following a build: the next skill respects requirements, then moves on
    const nx = await g.ev(() => { P.cls = 'warden'; P.jl = 30; P.skills = {}; P.skillPts = 30; const b = buildById('duel'); const steps = [];
      for (let i = 0; i < 25; i++) { const n = buildNextSkill(b); if (!n) break; steps.push(n.id + n.lv); if (!skillUnlocked(n.id)) return { bad: n.id }; P.skills[n.id] = n.lv; }
      return { steps: steps.slice(0, 8).join(' '), ok: steps.length > 10, lethal: steps.indexOf('lethaledge1') > steps.indexOf('duelist3') }; });
    t.ok(!nx.bad && nx.ok && nx.lethal, `the next step always takes requirements first: ${nx.steps} …`);
    const ui = await g.ev(() => { P.skills = { cleave: 3 }; P.skillPts = 5; P.statPts = 6; P.st = { str: 1, agi: 1, vit: 1, int: 1, dex: 1, luk: 1 };
      openPanel('buildguide'); const s0 = document.getElementById('panel').textContent; document.querySelector('[data-act="buildpick"][data-arg="duel"]').click();
      const following = P.build === 'duel' && /Next skill: Blade Mastery Lv 1/.test(document.getElementById('panel').textContent);
      openPanel('skills'); const node = document.querySelector('.snode.bgnextnode [data-act="learn"]'), bar = document.querySelector('.bgbar') && document.querySelector('.bgbar').textContent;
      openPanel('status'); const stat = document.querySelector('.bgnextstat'); closePanel();
      return { tabs: !/Arcanist/.test(s0) && !/Elementalist/.test(s0), names: /Earthsplitter/.test(s0) && /Duelist/.test(s0) && /Iron Wall/.test(s0), following,
        node: node && node.dataset.arg, bar, stat: stat && stat.dataset.arg }; });
    t.ok(ui.tabs && ui.names, 'a Warden sees only the three Warden builds, no other job');
    t.ok(ui.following && ui.node === 'bladecraft' && /Following/.test(ui.bar), `following Duelist marks the next skill in the tree (${ui.node})`);
    t.ok(ui.stat === 'agi', `and the Status window points at the next stat (${ui.stat})`);
    // other jobs and other routes cannot be followed; novices can look at everything
    const lim = await g.ev(() => { PANEL_ACTS.buildpick('nuke'); const other = P.build; P.cls = 'ravager'; openPanel('buildguide'); const rav = document.getElementById('panel').textContent; const wallBtn = !!panel.querySelector('[data-act="buildpick"][data-arg="wall"]');
      P.cls = 'novice'; openPanel('buildguide'); const nov = document.getElementById('panel').textContent, novBtn = !!panel.querySelector('[data-act="buildpick"][data-arg]:not([data-arg=""])'); P.cls = 'warden'; P.build = 'duel'; closePanel();
      return { other, ravOk: /Earthsplitter/.test(rav) && /Duelist/.test(rav) && !/Iron Wall/.test(rav) && !wallBtn, nov: /Arcanist/.test(nov) && /Earthsplitter/.test(nov) && !novBtn }; });
    t.ok(lim.other === 'duel', 'a Warden cannot follow an Arcanist build');
    t.ok(lim.ravOk, 'a Ravager sees only the builds on the Ravager route (no Iron Wall)');
    t.ok(lim.nov, 'a Novice can look at every job but follow nothing yet');
    // /build opens it; the choice is saved
    t.ok(await g.ev(() => { chatCommand('build', ''); const ok = panelKind === 'buildguide'; closePanel(); save(true); return ok && JSON.parse(localStorage.getItem('embervale.save.v1')).p.build === 'duel'; }), '/build opens the guide, and the followed build is saved');
    // free resets on the test server
    const rs = await g.ev(() => { P.st.str = 20; P.skills = { cleave: 3 }; P.gold = 5; openPanel('job'); const b = () => panel.querySelector('[data-act="respec"][data-arg="stats"]'); const txt = panel.textContent;
      b().click(); b().click(); closePanel(); return { free: /Free/.test(txt), str: P.st.str, gold: P.gold }; });
    t.ok(rs.free && rs.str === 1 && rs.gold === 5, 'Guild Hall resets are free on the test server');
    t.ok(g.page.errors.length === 0, 'no script errors' + g.page.errors.map(e => ': ' + e).join(''));
  } finally { await g.close(); }
};
