// v1.39.1 signature weapons: the Warden's Oathbound line (forge with Brannoc, re-forge twice with Garrow), only the
// family can wield it, the low-HP damage bonus, re-forging keeps refine, sigils and the awakened line.
const { player, newRoom, wait } = require('./helpers');
module.exports = async t => {
  const g = await player('Oath', newRoom(), { server: 'http://127.0.0.1:9' });
  try {
    await wait(600);
    const r = await g.ev(async () => {
      const w = ms => new Promise(r => setTimeout(r, ms)), o = {};
      P.tut = 'done'; P.cls = 'warden'; P.lv = 15; P.gold = 1e6; enterZone('town'); await w(200);
      for (const [id, n] of [['pelt', 30], ['ramhorn', 20], ['emberore', 40], ['bone', 30], ['core', 20], ['dust', 30], ['mantisblade', 30], ['mirestone', 30], ['fang', 30]]) giveItem(id, n);
      openPanel('smith'); await w(50); o.offered = !!panel.querySelector('[data-act="sigwforge"]:not([disabled])') && /Oathbound Blade/.test(panel.textContent);
      PANEL_ACTS.sigwforge('warden'); const e = P.inv.find(x => x.id === 'oathblade1'); o.forged = !!e && Array.isArray(e.s) && e.s.length === 1;
      P.eq.weapon = e; P.inv.splice(P.inv.indexOf(e), 1); S = computeStats();
      // low HP hits harder
      P.hp = S.maxhp; const full = oathFactor(); P.hp = 1; const low = oathFactor(); P.hp = S.maxhp; o.bonus = [full, low];
      // the next stage is Garrow's and needs the advanced calling
      openPanel('smith'); await w(50); o.lockedTown = !panel.querySelector('[data-act="sigwforge"]:not([disabled])');
      P.eq.weapon.r = 5; P.eq.weapon.s = ['hopper_sig']; P.eq.weapon.aw = { k: 'atk', v: 5, q: 1 };
      P.cls = 'bulwark'; P.lv = 45; enterZone('capital'); await w(200); openPanel('smith'); await w(50);
      PANEL_ACTS.sigwforge('warden'); const w2 = P.eq.weapon; o.stage2 = w2.id === 'oathblade2' && w2.r === 5 && w2.s.length === 2 && w2.s[0] === 'hopper_sig' && !!w2.aw;
      P.cls = 'aegislord'; P.lv = 75; PANEL_ACTS.sigwforge('warden'); o.stage3 = P.eq.weapon.id === 'oathblade3' && P.eq.weapon.s.length === 3;
      openPanel('smith'); await w(50); o.final = /final form/.test(panel.textContent);
      // only the Warden family
      P.cls = 'cleric'; o.blocked = /Only the Warden family/.test(canEquip(ITEMS.oathblade3) || ''); P.cls = 'aegislord';
      o.icon = (() => { const c = itemIconCanvas('oathblade3'), d = c.getContext('2d').getImageData(0, 0, 64, 64).data; let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i] > 0) n++; return n; })();
      // the Arcanist's Starweave Staff: every 5th spell costs no SP and casts faster
      P.cls = 'arcanist'; P.lv = 15; enterZone('town'); await w(200); openPanel('smith'); await w(50);
      for (const [id, n] of [['spore', 20], ['wispbreath', 20], ['glintstone', 20]]) giveItem(id, n); refreshPanel();
      o.arcOffered = /Starweave Staff/.test(panel.textContent); PANEL_ACTS.sigwforge('arcanist'); const st = P.inv.find(x => x.id === 'starweave1');
      P.inv.push(P.eq.weapon); P.eq.weapon = st; P.inv.splice(P.inv.indexOf(st), 1); S = computeStats(); P.starN = 0;
      const costs = [], durs = [], rc = castNow; castNow = (id, l, cost) => costs.push(cost); const rt = castTime; castTime = () => 1;
      for (let k = 0; k < 5; k++) { P.casting = null; beginCast('emberbolt', 1, 10, () => {}); durs.push(P.casting ? P.casting.dur : 0); P.casting = null; }
      castNow = rc; castTime = rt; o.arc = { durs, matk: S.matk };
      closePanel(); return o; });
    t.ok(r.arcOffered && r.arc.durs.slice(0, 4).every(d => d === 1) && Math.abs(r.arc.durs[4] - .7) < .01, `the Arcanist's Starweave Staff: every 5th spell casts 30% faster (${r.arc.durs.join(', ')})`);
    t.ok(r.offered && r.forged, 'a Warden can have Brannoc forge the Oathbound Blade (with one sigil slot)');
    t.ok(r.bonus[0] === 1 && r.bonus[1] > 1.14, `the lower the HP, the harder it hits (x${r.bonus[0]} at full, x${r.bonus[1].toFixed(2)} nearly fallen)`);
    t.ok(r.lockedTown, 'the next stage waits for the advanced calling and Smith Garrow');
    t.ok(r.stage2, 'Garrow re-forges it into the Sworn Oathblade, keeping its refine, sigils and awakened line, with a second slot');
    t.ok(r.stage3 && r.final, 'and after the master calling into the Oathkeeper, its final form');
    t.ok(r.blocked, 'only the Warden family can wield it');
    t.ok(r.icon > 150, 'it has its own picture in the bag');
    t.ok(g.page.errors.length === 0, 'no script errors' + g.page.errors.map(e => ': ' + e).join(''));
  } finally { await g.close(); }
};
