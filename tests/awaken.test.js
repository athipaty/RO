// Gemcutter Sela: awaken gear (a random build line you can keep or throw back) and fuse three sigils into one (sometimes Radiant).
const { player, wait, newRoom } = require('./helpers');

module.exports = async t => {
  const g = await player('Awakener', newRoom(), { server: 'http://127.0.0.1:9' });
  try {
    await wait(500);
    // tabs in Sela's window
    const tabs = await g.ev(() => { P.gold = 1e6; P.lv = 60; P.inv.push({ id: 'glintstone', n: 20 }, { id: 'pelt', n: 30 }, { id: 'carapace', n: 30 }, { id: 'core', n: 20 });
      P.eq.weapon = { id: 'twinfang', uid: 701, s: [null] }; S = computeStats(); openPanel('gemcut'); const s = document.getElementById('panel').textContent;
      return { slots: /Sigil slots/.test(s) && /Awaken/.test(s) && /Fuse sigils/.test(s), cut: !!document.querySelector('[data-act="gemcut"]') }; });
    t.ok(tabs.slots && tabs.cut, 'Sela\'s window has Sigil slots (as before), Awaken and Fuse sigils tabs');
    // awaken: costs materials + gold, rolls a line, keep-or-throw-back
    const aw = await g.ev(() => { PANEL_ACTS.gemtab('awaken'); const g0 = P.gold, gl0 = invFind('glintstone').n, c0 = invFind('carapace').n;
      document.querySelector('[data-act="awaken"][data-arg="701"]').click(); const pd = AWK.pending, txt = document.getElementById('panel').textContent;
      document.querySelector('[data-act="awkeep"][data-arg="old"]').click(); const keptOld = !P.eq.weapon.aw;
      document.querySelector('[data-act="awaken"][data-arg="701"]').click(); const roll = AWK.pending.roll; document.querySelector('[data-act="awkeep"][data-arg="new"]').click();
      return { paid: g0 - P.gold, glint: gl0 - invFind('glintstone').n, mats: c0 - invFind('carapace').n, choice: /Keep the new one/.test(txt) && !!pd, keptOld, aw: P.eq.weapon.aw, roll }; });
    t.ok(aw.paid === 16000 && aw.glint === 4 && aw.mats === 6, `awakening a level 26 weapon costs 2 Glintstone, 3 Scarab Carapace and 8,000 gold each time (paid ${aw.paid})`);
    t.ok(aw.choice && aw.keptOld, 'after a roll you choose: keep the new line or keep the old one');
    t.ok(aw.aw && aw.aw.k === aw.roll.k && aw.aw.v === aw.roll.v, `keeping the new one awakens the gear (${aw.aw.k} ${aw.aw.v}, quality ${aw.aw.q})`);
    const st = await g.ev(() => { P.eq.weapon.aw = { k: 'critdmg', v: 16, q: 2 }; S = computeStats(); const a = S.critdmg; P.eq.weapon.aw = null; S = computeStats();
      return { a, b: S.critdmg, desc: itemDesc({ id: 'twinfang', s: [null], aw: { k: 'aspd', v: 8, q: 2 } }) }; });
    t.ok(st.a === st.b + 16, `the awakened line counts in your stats (crit damage +${st.a - st.b}%)`);
    t.ok(/Radiant: Attack speed \+8%/.test(st.desc), 'and shows on the item: ' + st.desc);
    // the rolls: lines fit the slot, Radiant is rare and always the top value
    const rolls = await g.ev(() => { const w = { id: 'twinfang' }, a = { id: 'stonewall' }; let rad = 0, bad = 0; const n = 4000;
      for (let i = 0; i < n; i++) { const r = awRoll(i % 2 ? w : a), pool = awPool(i % 2 ? w : a), p = pool.find(x => x[0] === r.k); if (!p || r.v < p[1] || r.v > p[2]) bad++; if (r.q === 2) { rad++; if (r.v !== p[2]) bad++; } }
      return { rad: rad / n, bad }; });
    t.ok(rolls.bad === 0 && rolls.rad > .03 && rolls.rad < .08, `rolls stay inside each slot's ranges; Radiant comes up ${(rolls.rad * 100).toFixed(1)}% of the time at the top value`);

    // radiant sigils exist for every sigil, stronger, with their own picture
    const rs = await g.ev(() => ({ n: Object.keys(ITEMS).filter(id => ITEMS[id].radiant).length, base: Object.values(MOBS).filter(m => m.sig && ITEMS[m.id + '_sig']).length,
      hop: ITEMS.hopper_sigr, stronger: Object.keys(ITEMS).filter(id => ITEMS[id].radiant).every(id => Object.keys(ITEMS[ITEMS[id].base].b).every(k => ITEMS[id].b[k] > ITEMS[ITEMS[id].base].b[k])),
      icon: !!itemIconURL && itemIconURL('hopper_sigr') !== itemIconURL('hopper_sig') }));
    t.ok(rs.n === rs.base && rs.stronger, `every sigil has a Radiant twin that is stronger (${rs.n})`);
    t.ok(rs.hop.txt && /Attack speed/.test(rs.hop.txt) && rs.icon, 'Radiant sigils describe themselves and have their own picture: ' + rs.hop.txt);
    // fusion
    const fu = await g.ev(() => { P.inv.push({ id: 'hopper_sig', n: 2 }, { id: 'greylupe_sig', n: 1 }); PANEL_ACTS.gemtab('fuse');
      const before = looseSigils().reduce((a, e) => a + e.n, 0), g0 = P.gold;
      document.querySelector('[data-act="fusein"][data-arg="hopper_sig"]').click(); document.querySelector('[data-act="fusein"][data-arg="hopper_sig"]').click();
      const third = document.querySelector('[data-act="fusein"][data-arg="hopper_sig"]').disabled; document.querySelector('[data-act="fusein"][data-arg="greylupe_sig"]').click();
      document.querySelector('[data-act="fusego"]').click(); const after = looseSigils().reduce((a, e) => a + e.n, 0);
      let rad = 0; for (let i = 0; i < 3000; i++) if (ITEMS[fuseResult(['hopper_sig', 'hopper_sig', 'greylupe_sig'])].radiant) rad++;
      let rad2 = 0; for (let i = 0; i < 3000; i++) if (ITEMS[fuseResult(['hopper_sigr', 'hopper_sigr', 'greylupe_sig'])].radiant) rad2++;
      const lv = []; for (let i = 0; i < 300; i++) lv.push(sigMob(fuseResult(['snowhulk_sig', 'frostwisp_sig', 'rimestalker_sig'])).lv);
      return { used: before - after, paid: g0 - P.gold, third, rad: rad / 3000, rad2: rad2 / 3000, minLv: Math.min(...lv) }; });
    t.ok(fu.used === 2 && fu.paid === 2000 && fu.third, 'three sigils (you cannot add more than you own) and 2,000 gold become one new sigil');
    t.ok(fu.rad > .08 && fu.rad < .16 && fu.rad2 > fu.rad + .1, `Radiant about 12% of the time (${(fu.rad * 100).toFixed(1)}%), more with Radiant sigils put in (${(fu.rad2 * 100).toFixed(1)}%)`);
    t.ok(fu.minLv >= 36, `high-level sigils fuse into high-level ones (lowest result level ${fu.minLv})`);
    // radiant sigil socketing shows its own text
    const sock = await g.ev(() => { P.inv.push({ id: 'hopper_sigr', n: 1 }); P.eq.accessory = { id: 'quickgrip', uid: 702, s: [null] }; SIGPICK.sig = 'hopper_sigr'; openPanel('socket');
      return document.getElementById('panel').textContent; });
    t.ok(/Attack speed \+5%/.test(sock) || /AGI \+3/.test(sock), 'the socket window shows the Radiant sigil\'s own numbers');
    // saved and loaded
    await g.ev(() => { P.eq.weapon.aw = { k: 'dbl', v: 6, q: 2 }; save(true); }); await g.page.reload(); await wait(900);
    await g.ev(() => document.getElementById('contBtn').click()); await wait(800);
    t.ok(await g.ev(() => P.eq.weapon && P.eq.weapon.aw && P.eq.weapon.aw.k === 'dbl' && S.dbl >= 6), 'an awakened line survives a reload');
    t.ok(g.page.errors.length === 0, 'no script errors' + g.page.errors.map(e => ': ' + e).join(''));
  } finally { await g.close(); }
};
