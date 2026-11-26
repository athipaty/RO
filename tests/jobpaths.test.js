// First-job paths (js/jobpaths.js, v1.18.0): each first job has two paths; each advanced calling's starting skills
// need first-job skills (one calling per path, one mixing both); old heroes keep what they learned
const { player, newRoom, wait } = require('./helpers');
module.exports = async t => {
  const g = await player('Pathfinder', newRoom(), { server: 'http://127.0.0.1:9' });
  try {
    await wait(500);
    const d = await g.ev(() => {
      const out = { bad: [], cost: {} };
      for (const base in JOB_PATHS) {
        const J = JOB_PATHS[base], own = CLASSES[base].skills, inPath = J.paths.flatMap(p => p.skills);
        if (J.paths.length !== 2) out.bad.push(base + ' has ' + J.paths.length + ' paths');
        for (const s of own) { const n = J.core.includes(s) + inPath.filter(x => x === s).length; if (n !== 1) out.bad.push(`${base}.${s} is on ${n} paths`); }
        for (const s of [...J.core, ...inPath]) if (!own.includes(s)) out.bad.push(`${base}: ${s} is not its skill`);
        // each path can fight: its own attack, or the core attack plus its own skills
        for (const p of J.paths) if (!p.skills.some(s => SKILLS[s].kind !== 'passive')) out.bad.push(`${base}.${p.id} has nothing to cast`);
        const kinds = jobsFrom(base).map(j => jobPaths(j).map(p => p.id).join('+')).sort();
        if (kinds.length && (kinds.length !== 2 || new Set(kinds).size !== 2)) out.bad.push(`${base} callings: ${kinds}`); // (a first job with no callings yet, like the new Gunslinger, is fine)
        // the points a first job must spend to open each calling (requirements of requirements included)
        for (const j of jobsFrom(base)) { const need = {};
          const add = (s, l) => { if ((need[s] || 0) >= l) return; need[s] = l; for (const r in SKILL_REQ[s] || {}) add(r, SKILL_REQ[s][r]); };
          for (const [r, l] of jobNeeds(j)) add(r, l);
          if (Object.keys(need).some(s => !own.includes(s))) out.bad.push(`${j} needs a skill ${base} does not have`);
          out.cost[j] = Object.values(need).reduce((a, b) => a + b, 0); }
      }
      return out;
    });
    t.ok(!d.bad.length, 'every first job has two paths, each skill sits on one path (or is core), and its two callings follow different paths' + d.bad.map(b => ': ' + b).join(''));
    const max = Math.max(...Object.values(d.cost));
    t.ok(max <= 20, `opening any advanced calling costs at most 20 of the 39 first-job skill points (most: ${max}; ${Object.entries(d.cost).map(([j, c]) => j + ' ' + c).join(', ')})`);

    const bg = await g.ev(() => BUILDS.filter(b => b.route[1]).map(b => { const first = new Set(CLASSES[b.route[0]].skills);
      const map = buildFirstLevels(b.skills, buildFirstReach(b.skills, first), first);
      return { id: b.id, pts: buildPts(map), ok: jobNeeds(b.route[1]).every(([r, l]) => (map[r] || 0) >= l) }; }));
    t.ok(bg.every(b => b.ok), 'every build guide learns, as a first job and within its points, what its advanced calling needs' + bg.filter(b => !b.ok).map(b => ': ' + b.id).join(''));
    t.ok(bg.every(b => b.pts >= 30), 'every build guide has a plan for at least 30 of the 39 first-job points' + bg.filter(b => b.pts < 30).map(b => `: ${b.id} ${b.pts}`).join(''));
    const learn = await g.ev(() => {
      P.cls = 'bulwark'; P.skillPts = 20; P.skills = { cleave: 2, ironwill: 1 }; S = computeStats();
      PANEL_ACTS.sksel('shieldbash'); const miss = skillMissing('shieldbash').join(); runAct('learn', 'shieldbash'); const blocked = !P.skills.shieldbash;
      P.skills.stalwart = 3; runAct('learn', 'shieldbash'); const opened = P.skills.shieldbash === 1;
      // a hero who learned it before these links keeps raising it
      P.skills = { unbreakable: 2 }; runAct('learn', 'unbreakable'); const old = P.skills.unbreakable === 3;
      P.skills = {}; runAct('learn', 'unbreakable'); const fresh = !P.skills.unbreakable;
      return { miss, blocked, opened, old, fresh };
      function runAct(a, arg) { const b = document.createElement('button'); b.dataset.act = a; b.dataset.arg = arg; (window.panel || document.body).appendChild(b); b.click(); b.remove(); }
    });
    t.ok(learn.blocked && /Stalwart Strike 3/.test(learn.miss), `an advanced skill needs its first-job skill first (Shield Bash needs: ${learn.miss})`);
    t.ok(learn.opened, 'with that first-job skill learned it can be learned');
    t.ok(learn.old && learn.fresh, 'a skill learned before the links can still be raised; a new one cannot skip them');

    const hit = await g.ev(async () => {
      const w = ms => new Promise(r => setTimeout(r, ms)); P.cls = 'warden'; P.skills = { cleave: 2, ironwill: 1, stalwart: 5 }; S = computeStats();
      enterZone('meadow'); await w(300); const ms = mobs.filter(m => !m.dead).slice(0, 3); const m = ms[0];
      for (const o of ms) { o.hp = 99999; o.myDmg = 0; o.x = m.x + (o === m ? 0 : 30); o.y = m.y; }
      P.x = m.x - 30; P.y = m.y; P.target = m; S.atk = 400; S.crit = 0; P.sp = 999; useSkill('stalwart'); await w(150);
      return { main: m.myDmg, side: ms.slice(1).map(o => o.myDmg || 0) };
    });
    t.ok(hit.main > 0 && hit.side.every(x => x > 0 && x < hit.main), `Stalwart Strike hits its target and the foes beside it take less (${hit.main}; ${hit.side})`);

    const ui = await g.ev(() => {
      P.cls = 'warden'; P.jl = 20; P.skills = { cleave: 2, ironwill: 1, stalwart: 3 }; openPanel('job'); const hall = panel.textContent;
      const ok = [...panel.querySelectorAll('.jpneed .cm.ok')].map(e => e.textContent); closePanel();
      openPanel('skills'); PANEL_ACTS.sksel('stoneblood'); const card = panel.querySelector('.skpright').textContent; P.cls = 'bulwark'; PANEL_ACTS.sksel('shieldbash'); const card2 = panel.querySelector('.skpright').textContent; closePanel(); P.cls = 'warden';
      return { hall, ok, card, card2 };
    });
    t.ok(/Needs from your first job/.test(ui.hall) && /Guard path/.test(ui.hall) && /Blade path/.test(ui.hall), 'Corvin shows the path and first-job needs under each advanced calling');
    t.ok(ui.ok.some(s => /Stalwart Strike 3/.test(s)), 'needs you already meet are ticked');
    t.ok(/Guard path/.test(ui.card) && /Leads to/.test(ui.card) && /Bulwark/.test(ui.card), 'a first-job skill card says its path and which calling it leads to');
    t.ok(/Grows from/.test(ui.card2) && /Stalwart Strike 3/.test(ui.card2), 'an advanced skill card says which first-job skill it grows from');
    t.ok(g.page.errors.length === 0, 'no script errors' + g.page.errors.map(e => ': ' + e).join(''));
  } finally { await g.close(); }
};
