// #41 mini-bosses lead an escort pack and call fallen escorts back below 60% and 30% HP.
const { player, wait, newRoom } = require('./helpers');

module.exports = async t => {
  const g = await player('Packhunter', newRoom(), { zone: 'meadow', server: 'http://127.0.0.1:9' });
  try {
    await wait(1200);
    const info = await g.ev(() => ['meadow', 'woods', 'dunes', 'frost'].map(z => { enterZone(z); const L = mobs.find(m => m.d.mini); const esc = mobs.filter(m => m.lead === (L && L.d.id));
      return { z, L: L && L.d.name, n: esc.length, near: esc.every(m => Math.hypot(m.x - L.x, m.y - L.y) < 120), item: L && L.d.drops.some(([id]) => ITEMS[id].type === 'accessory') }; }));
    t.ok(info.every(i => i.L && i.n >= 3), 'every open region has a mini-boss with an escort: ' + info.map(i => `${i.L} (+${i.n})`).join(', '));
    t.ok(info.every(i => i.near), 'escorts start right beside their leader');
    t.ok(info.every(i => i.item), 'each mini-boss can drop its own accessory');

    const call = await g.ev(() => { enterZone('meadow'); const L = mobs.find(m => m.d.mini), esc = mobs.filter(m => m.lead === L.d.id);
      P.x = L.x - 200; P.y = L.y; for (const m of esc) { m.myDmg = 0; killMob(m); m.respawnAt = now + 999; }
      const T = mobTargets(); L.hp = L.d.hp * .55; updateMob(L, .016, T); const a = esc.filter(m => !m.dead).length;
      for (const m of esc) { killMob(m); m.respawnAt = now + 999; } L.hp = L.d.hp * .25; updateMob(L, .016, T); const b = esc.filter(m => !m.dead).length;
      for (const m of esc) { killMob(m); m.respawnAt = now + 999; } L.hp = L.d.hp * .1; updateMob(L, .016, T); const c = esc.filter(m => !m.dead).length;
      return { a, b, c, near: esc.filter(m => !m.dead).every(m => Math.hypot(m.x - L.x, m.y - L.y) < 120), log: document.getElementById('log').textContent }; });
    t.ok(call.a === 4 && /calls its pack/.test(call.log), 'below 60% HP it calls its fallen pack back, with a warning');
    t.ok(call.b === 4, 'and again below 30%');
    t.ok(call.c === 0, 'but only twice per fight');
    t.ok(await g.ev(() => /Hopper Chieftain and its pack roam/.test(document.getElementById('log').textContent)), 'entering the region mentions the mini-boss');
    t.ok(await g.ev(() => contractOffers().every(o => !MOBS[o.mob].mini)), 'mini-bosses are not offered as hunting contracts');
    t.ok(g.page.errors.length === 0, 'no script errors' + g.page.errors.map(e => ': ' + e).join(''));
  } finally { await g.close(); }
};
