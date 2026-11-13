// A third advanced calling for every first job (Runeguard, Chronomancer, Falconer, Ascetic) with their master callings.
const { player, wait, newRoom } = require('./helpers');

module.exports = async t => {
  const g = await player('Newcomer', newRoom(), { server: 'http://127.0.0.1:9' });
  try {
    await wait(500);
    const r = await g.ev(() => ({ adv: ['warden', 'arcanist', 'ranger', 'cleric'].map(b => jobsFrom(b).join('/')), master: ['runeguard', 'chronomancer', 'falconer', 'ascetic'].map(c => job3From(c).join('/')),
      skills: ['runeguard', 'chronomancer', 'falconer', 'ascetic', 'runelord', 'timeweaver', 'skywarden', 'lotussage'].every(c => CLASSES[c].own.every(s => SKILLS[s] && CLASSES[c].skills.includes(s))),
      inherit: CLASSES.runelord.skills.includes('runestrike') && CLASSES.runelord.skills.includes('cleave') && CLASSES.runelord.skills.includes('bladecraft') }));
    t.ok(r.adv.join(' ') === 'bulwark/ravager/runeguard stormcaller/hexweaver/chronomancer sharpshooter/wildstalker/falconer templar/oracle/ascetic', 'each first job now has three advanced callings: ' + r.adv.join(' '));
    t.ok(r.master.join(' ') === 'runelord timeweaver skywarden lotussage', 'and each new one rises into its own master calling: ' + r.master.join(' '));
    t.ok(r.skills && r.inherit, 'their skills are in their trees, and the master keeps every earlier skill');
    // Corvin's trial offers the new calling; taking it works
    const pro = await g.ev(() => { P.cls = 'ranger'; P.jl = 40; P.skills = { twinshot: 5 }; P.trial = { have: 25 }; P.inv.push({ id: 'needle', n: 10 }); P.gold = 10000; openPanel('job');
      const offer = !!panel.querySelector('[data-act="promote"][data-arg="falconer"]'); panel.querySelector('[data-act="promote"][data-arg="falconer"]').click(); closePanel();
      return { offer, cls: P.cls, tier: CLASSES[P.cls].tier }; });
    t.ok(pro.offer && pro.cls === 'falconer' && pro.tier === 2, 'Guildmaster Corvin offers the Falconer after the Ranger trial, and it can be taken');
    // every new active skill works on a monster
    const run = await g.ev(async () => { const w = ms => new Promise(r => setTimeout(r, ms)); enterZone('meadow'); await w(300); const m = mobs.find(x => !x.dead); m.hp = 1e7; m.d = { ...m.d, hp: 1e7, def: 0, atk: 0 };
      P.x = m.x - 40; P.y = m.y; P.hp = P.sp = 1e6; S = computeStats(); const ids = Object.keys(NJ_SKILLS).filter(id => NJ_SKILLS[id].kind !== 'passive'); const bad = [];
      for (const id of ids) { const sk = SKILLS[id], h0 = m.hp; try { if (sk.kind === 'target') sk.run(5, m); else if (sk.kind === 'area') sk.run(5, m.x, m.y); else sk.run(5); } catch (e) { bad.push(id + ':' + e.message); } }
      await w(1500); return { n: ids.length, bad, hurt: m.hp < 1e7, fx: ids.every(id => SKILL_FX[id]) }; });
    t.ok(!run.bad.length && run.hurt && run.fx, `all ${run.n} new active skills run, hit and have their own effect` + (run.bad.length ? ': ' + run.bad.join(', ') : ''));
    // the falcon joins normal attacks
    const fal = await g.ev(async () => { const w = ms => new Promise(r => setTimeout(r, ms)); const m = mobs.find(x => !x.dead); P.skills.keentalon = 10; P.target = null;
      let hits = 0; const _d = dealPhys; dealPhys = function () { hits++; return _d.apply(this, arguments); }; const _r = Math.random; Math.random = () => .01;
      basicAttack(m); Math.random = _r; await w(900); dealPhys = _d; return hits; });
    t.ok(fal >= 2, `with Keen Talon the falcon joins a normal attack (${fal} hits)`);
    // passives count in stats
    const st = await g.ev(() => { P.cls = 'ascetic'; P.buffs = {}; P.skills = { innercalm: 10, stillmind: 10 }; S = computeStats(); return { dmgred: S.dmgred, cls: CLASSES.ascetic.name }; });
    t.ok(st.dmgred === 10, 'Still Mind cuts damage taken (10%)');
    // build guide routes for the new callings
    t.ok(await g.ev(() => { P.cls = 'chronomancer'; return buildsVisible().map(b => b.id).join() === 'time'; }), 'a Chronomancer sees the Timekeeper build in the guide');
    t.ok(g.page.errors.length === 0, 'no script errors' + g.page.errors.map(e => ': ' + e).join(''));
  } finally { await g.close(); }
};
