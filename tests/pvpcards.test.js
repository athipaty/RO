// v1.49.0: sigils fair in player fights, stronger boss sigils, and boss relics above shop gear.
const { player, wait, newRoom } = require('./helpers');

module.exports = async t => {
  const A = await player('Rook', newRoom(), { server: 'http://127.0.0.1:9' });
  try {
    await wait(2000);
    // "Damage taken" counts against players, up to 30%
    const red = await A.ev(() => {
      const keep = { def: S.def, dmgred: S.dmgred }, o = { lv: 50 };
      S.def = 0; S.dmgred = 0; const plain = pvpTaken(1000, o);
      S.dmgred = 10; const ten = pvpTaken(1000, o);
      S.dmgred = 50; const capped = pvpTaken(1000, o);
      Object.assign(S, keep); return { plain, ten, capped };
    });
    t.ok(red.plain === 1000 && red.ten === 900 && red.capped === 700, 'a player hit is cut by Damage taken, at most 30% ' + JSON.stringify(red));

    // FLEE counts against players: half of what is above the level, and an attacker keeps at least 60% to hit
    const fl = await A.ev(() => {
      const keep = S.hit; S.hit = 200; const half = pvpFlee({ lv: 50, fl: 150 }), none = pvpFlee({ lv: 50 });
      S.hit = 60; const capped = pvpFlee({ lv: 50, fl: 300 }); S.hit = keep; return { half, none, capped };
    });
    t.ok(fl.half === 100 && fl.none === 50 && fl.capped === 80, 'an opponent\'s FLEE counts by half, and never below 60% to hit ' + JSON.stringify(fl));
    t.ok(/fl:S\?Math\.round\(S\.flee\)/.test(require('fs').readFileSync(require('path').join(__dirname, '..', 'js', 'net.js'), 'utf8')), 'my FLEE is sent to other players');

    // boss sigils beat ordinary sigils of nearby levels
    const sig = await A.ev(() => ({ fp: ITEMS.fallenpaladin_sig.b, rad: ITEMS.fallenpaladin_sigr.b, vol: ITEMS.voltaris_sig.b, hell: ITEMS.hellimp_sig.b,
      desc: ITEMS.fallenpaladin_sig.desc }));
    t.ok(sig.fp.def === 12 && sig.fp.dmgred === 5 && sig.rad.def === 18 && /Damage taken −5%/.test(sig.desc), 'Fallen Paladin\'s sigil is stronger, and its Radiant twin follows');
    t.ok(sig.vol.agi === 6 && sig.vol.aspd === 8 && sig.hell.agi === undefined, 'Voltaris\'s sigil is no longer the same as an ordinary Hell Imp\'s');

    // every relic beats the best shop piece of its kind up to 8 levels above it, and its boss drops it
    const rel = await A.ev(() => {
      const shop = [...SHOP, ...(typeof ROYAL_SHOP !== 'undefined' ? ROYAL_SHOP : [])].map(id => ITEMS[id]).filter(Boolean), bad = [];
      for (const id in RELICS) {
        const [boss, ] = RELICS[id], it = ITEMS[id];
        if (!MOBS[boss].drops.some(d => d[0] === id)) bad.push(id + ' not dropped');
        if (rarityOf(id) < 4) bad.push(id + ' not legendary');
        const near = shop.filter(s => s.type === it.type && (s.lv || 1) <= it.lv + 8 && (it.type !== 'weapon' || s.wt === it.wt) && (it.type !== 'armor' || !!(s.b && s.b.int) === !!(it.b && it.b.int)));
        const pow = x => x.type === 'weapon' ? Math.max(x.atk || 0, x.matk || 0) : x.def || 0, best = Math.max(0, ...near.map(pow));
        if (!(pow(it) > best * 1.1)) bad.push(`${id} ${pow(it)} vs shop ${best}`);
      }
      return bad;
    });
    t.ok(rel.length === 0, 'every boss relic is clearly above shop gear of its level and drops from its boss ' + rel.join('; '));
    t.ok(A.page.errors.length === 0, 'no script errors' + A.page.errors.map(e => ': ' + e).join(''));
  } finally { await A.close(); }
};
