// #11 monster size and race: weapon vs size, race bonuses from forged charms, shown in target/info/stats.
const { player, newRoom } = require('./helpers');
module.exports = async t => {
  const A = await player('Sizer', newRoom(), { server: 'http://127.0.0.1:9' });
  try {
    const r = await A.ev(() => ({ sprout: [mobSize(MOBS.sproutling), mobRace(MOBS.sproutling)], wraith: mobRace(MOBS.wraith), tyrant: [mobSize(MOBS.dunetyrant), mobRace(MOBS.dunetyrant)],
      allOk: Object.values(MOBS).every(d => SIZES[mobSize(d)] && RACES[mobRace(d)]) }));
    t.ok(r.allOk, 'every monster has a size and a race');
    t.ok(r.sprout.join() === 's,plant' && r.wraith === 'undead' && r.tyrant.join() === 'l,insect', 'sizes and races make sense (Sproutling small plant, Dust Wraith undead, Dune Tyrant large insect)');
    const dmg = await A.ev(() => {
      const hit = (wid, mid, gear) => { P.eq.weapon = wid ? { id: wid, r: 0, s: [] } : null; P.eq.accessory = gear ? { id: gear, r: 0, s: [] } : null; S = computeStats();
        const m = mobs.find(x => !x.dead) || {}; const fake = { d: MOBS[mid], x: 0, y: 0, hp: 1e9, dead: false }; return sizeRaceMult(fake, 'phys'); };
      return { axeSmall: hit('axe', 'sproutling'), axeLarge: hit('axe', 'dunetyrant'), charm: hit(null, 'greylupe', 'beastbane'), noCharm: hit(null, 'greylupe'), mag: (P.eq.weapon = { id: 'axe', r: 0, s: [] }, sizeRaceMult({ d: MOBS.sproutling }, 'mag')) };
    });
    t.ok(dmg.axeSmall === .75 && dmg.axeLarge === 1.15, `axes are weak on small and strong on large monsters (${dmg.axeSmall} / ${dmg.axeLarge})`);
    t.ok(dmg.noCharm === 1 && Math.abs(dmg.charm - 1.15) < 1e-9, 'the Beastbane Charm adds 15% against beasts');
    t.ok(dmg.mag === 1, 'spells ignore size');
    const real = await A.ev(() => { enterZone('meadow'); P.st.str = 90; P.eq.weapon = null; P.eq.accessory = null; S = computeStats(); const m = mobs.find(x => !x.dead && mobRace(x.d) === 'plant') || mobs.find(x => !x.dead);
      const r0 = Math.random; Math.random = () => .5; S.crit = 0; let a = 0, b = 0; m.hp = 1e7; let h = m.hp; dealPhys(m, 1, { sure: true }); a = h - m.hp; h = m.hp;
      P.eq.accessory = { id: 'sicklecharm', r: 0, s: [] }; const c = S.crit; S = computeStats(); S.crit = 0; dealPhys(m, 1, { sure: true }); b = h - m.hp; Math.random = r0; return { a, b, race: mobRace(m.d) }; });
    t.ok(real.race !== 'plant' || real.b > real.a, `a real hit on a ${real.race} grows with the charm (${real.a} → ${real.b})`);
    const ui = await A.ev(() => { const m = mobs.find(x => !x.dead); P.target = m; updateHud(); const tl = document.getElementById('tLv').textContent;
      openPanel('mob', m.d.id); const info = panel.textContent; openPanel('status'); const st = panel.textContent; closePanel(); return { tl, info, st, forge: FORGES.some(f => f[0] === 'beastbane') }; });
    t.ok(/Small|Medium|Large/.test(ui.tl), 'the target box shows size and race: ' + ui.tl);
    t.ok(/Size and race/.test(ui.info) && /deal \d+%/.test(ui.info), 'monster info explains how your weapon fares');
    t.ok(/Vs size S\/M\/L/.test(ui.st), 'the Stats window lists your weapon against each size');
    t.ok(ui.forge, 'the race charms can be forged at the smithy');
    t.ok(A.page.errors.length === 0, 'no script errors' + A.page.errors.map(e => ': ' + e).join(''));
  } finally { await A.close(); }
};
