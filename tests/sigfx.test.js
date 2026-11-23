// v1.51.0: every sigil its own ability (js/sigils3.js) and the abilities at work (js/sigfx.js).
const { player, wait, newRoom } = require('./helpers');

module.exports = async t => {
  const A = await player('Sigly', newRoom(), { server: 'http://127.0.0.1:9' });
  try {
    await wait(2000);
    await A.ev(() => { enterZone('meadow'); });
    await wait(1500);

    // no pair of bonuses on more than two sigils
    const u = await A.ev(() => { const g = {}; for (const m of Object.values(MOBS)) { const it = ITEMS[m.id + '_sig']; if (!m.sig || !it) continue;
      const k = m.sig.kind + ':' + Object.keys(it.b).sort().join('+'); (g[k] = g[k] || []).push(m.id); }
      const over = Object.entries(g).filter(([, v]) => v.length > 2).map(([k, v]) => k + ' ' + v.join(','));
      return { n: Object.keys(g).length, over, bat: ITEMS.cavebat_sig.desc, boss: ITEMS.voltaris_sig.desc }; });
    t.ok(u.over.length === 0, `no two-bonus pattern is on more than two sigils (${u.n} patterns) ` + u.over.join('; '));
    t.ok(/Life steal/.test(u.bat) && /Last Stand|Giant Slayer|Ambush/.test(u.boss), 'a bat sigil steals life; a boss sigil has a boss-only ability (' + u.bat + ' | ' + u.boss + ')');

    // no sigil percentage above 8% (a Radiant twin 10%)
    const pct = await A.ev(() => { let n = 0, r = 0; for (const it of Object.values(ITEMS)) { if (it.type !== 'sigil') continue; for (const k of SIG_PCT_KEYS) { const v = it.b[k] || 0; if (it.radiant) r = Math.max(r, v); else n = Math.max(n, v); } } return { n, r }; });
    t.ok(pct.n <= 8 && pct.r <= 10, `no sigil gives more than 8% of anything, a Radiant one 10% (highest ${pct.n}%, ${pct.r}%)`);
    // a socketed sigil turns its ability on
    t.ok(await A.ev(() => { P.eq.weapon = { id: 'dagger', uid: 9001, s: ['cavebat_sig'] }; S = computeStats(); return SFX.leech > 0; }), 'socketing a sigil turns its ability on');

    // each ability at work (set directly, then the hooks)
    const r = await A.ev(() => {
      const out = {}, real = Math.random, m = () => { const x = mobs.find(q => !q.dead && !q.d.boss); x.hp = x.d.hp = 1e6; x.ail = null; x.ailUntil = 0; x.slowUntil = 0; return x; };
      S.maxhp = 1000; S.maxsp = 1000;
      SFX = { leech: 5 }; P.hp = 100; hurtMob(m(), 200, false, 'phys'); out.leech = P.hp - 100;                     // 5% of 200
      SFX = { spleech: 3 }; P.sp = 10; hurtMob(m(), 50, false, 'phys'); out.sp = P.sp - 10;
      SFX = { stun: 100 }; Math.random = () => 0; const s1 = m(); hurtMob(s1, 10, false, 'phys'); out.stun = s1.ailUntil > now; Math.random = real;
      SFX = { killhp: 10, killsp: 7 }; const k = m(); k.hp = 5; P.hp = 100; P.sp = 10; hurtMob(k, 50, false, 'phys'); out.killhp = P.hp - 100; out.killsp = P.sp - 10;
      SFX = { firstdmg: 100 }; const f = m(); const h0 = f.hp; hurtMob(f, 100, false, 'phys'); out.ambush = h0 - f.hp;     // unhurt: 200
      SFX = { lowhp: 50 }; P.hp = 100; const l = m(); l.hp = 5e5; const h1 = l.hp; hurtMob(l, 100, false, 'phys'); out.laststand = h1 - l.hp; // below 35%: 150
      SFX = { gold: 50 }; out.gold = sfxGold(100);
      return { out };
    });
    t.ok(r.out.leech === 10 && r.out.sp === 3, `life steal and SP per hit (${r.out.leech} HP, ${r.out.sp} SP)`);
    t.ok(r.out.stun, 'a stun chance stuns on hit');
    t.ok(r.out.killhp === 100 && r.out.killsp === 7, `a kill gives HP and SP back (${r.out.killhp} HP, ${r.out.killsp} SP)`);
    t.ok(r.out.ambush >= 199 && r.out.laststand >= 149, `Ambush hits an unhurt monster harder (${r.out.ambush}), Last Stand below 35% HP (${r.out.laststand})`);
    t.ok(r.out.gold === 150, 'Gold % adds to gold picked up');

    // hits taken: element resist and reflect; ailments resisted; walking faster
    const h = await A.ev(() => {
      const out = {}, real = Math.random; S.maxhp = 1e6; P.hp = 1e6;
      const mk = el => { const x = mobs.find(q => !q.dead && !q.d.boss && !q.d.range); x.d = { ...x.d, el, atk: 100, hit: 999 }; x.hp = x.d.hp = 1e6; return x; };
      Math.random = () => .5; SFX = {}; const a = mk('fire'); let h0 = P.hp; mobAttack(a); const plain = h0 - P.hp;
      SFX = { res_fire: 50 }; P.hp = 1e6; h0 = P.hp; mobAttack(a); out.resist = (h0 - P.hp) / plain;
      SFX = { thorns: 50 }; P.hp = 1e6; const before = a.hp; mobAttack(a); out.thorns = before - a.hp;
      SFX = { ailres: 80 }; Math.random = () => 0; out.ail = tryAilment(['stun', 1, 2]); out.stunned = typeof ailOn === 'function' && ailOn('stun');
      Math.random = real; SFX = {}; P.eq.weapon = null;
      return out; });
    t.ok(h.resist > .4 && h.resist < .6, `an element resist cuts that element's hits (×${h.resist.toFixed(2)})`);
    t.ok(h.thorns > 0, `reflect sends part of a melee hit back (${h.thorns})`);
    t.ok(!h.stunned, 'an ailment resist can shrug off a stun');
    t.ok(await A.ev(() => { P.eq.armor = { id: 'tunic', uid: 9002, s: ['hopper_sig'] }; const s0 = 145; S = computeStats(); const fast = S.speed > s0; P.eq.armor = null; S = computeStats(); return fast; }), 'move speed makes you walk faster');
    t.ok(A.page.errors.length === 0, 'no script errors' + A.page.errors.map(e => ': ' + e).join(''));
  } finally { await A.close(); }
};
