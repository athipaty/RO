// #15 monster skills (server events heal / blink / bolt / howl) and #16 looters.
const { player, newRoom } = require('./helpers');
module.exports = async t => {
  const A = await player('Skilled', newRoom(), { server: 'http://127.0.0.1:9' });
  try {
    const flags = await A.ev(() => ({ heal: MOBS.mushcap.skill, blink: MOBS.miragewisp.skill, bolt: MOBS.iceimp.skill, pack: MOBS.greylupe.pack, looter: MOBS.cavebat.looter }));
    t.ok(flags.heal === 'heal' && flags.blink === 'blink' && flags.bolt === 'bolt' && flags.pack && flags.looter, 'monsters carry their skills, pack and looter marks');
    const ev = await A.ev(async () => { enterZone('woods'); const m = mobs.find(x => !x.dead); NET.myId = NET.myId || 'me'; const hp0 = P.hp = 200; S = computeStats();
      const fx0 = fx.length; mobSkillEvent(m, { k: 'h' }); const healed = fx.length > fx0;
      mobSkillEvent(m, { k: 'b', x0: Math.round(m.x), y0: Math.round(m.y), x1: Math.round(P.x + 20), y1: Math.round(P.y) }); const blinked = Math.abs(m.x - (P.x + 20)) < 2;
      const s0 = shots.length; mobSkillEvent(m, { k: 'p', t: NET.myId }); const shot = shots.length > s0;
      const before = P.hp; mobBolt(m); return { healed, blinked, shot, bolt: before - P.hp }; });
    t.ok(ev.healed && ev.blinked, 'heal and blink events show on screen; a blink moves the monster beside you');
    t.ok(ev.shot && ev.bolt > 0, `a bolt flies at you and hurts (${ev.bolt} damage)`);
    const loot = await A.ev(async () => { enterZone('deep1'); P.dead = false; const bat = mobs.find(m => m.d.id === 'cavebat' && !m.dead); loot.length = 0;
      dropLoot(bat, 'batwing'); const l = loot[0]; l.t0 = now - 5; bat.x = l.x; bat.y = l.y; bat.state = 'idle';
      for (let i = 0; i < 10 && loot.length; i++) { bat.x = l.x; bat.y = l.y; await new Promise(r => setTimeout(r, 100)); }
      const stolen = !loot.length && (bat.stolen || []).length === 1; bat.myDmg = 5; killMob(bat); return { stolen, back: loot.some(x => x.id === 'batwing'), log: /snatched your/.test(document.getElementById('log').textContent) }; });
    t.ok(loot.stolen && loot.log, 'a Cave Bat snatches loot left on the ground');
    t.ok(loot.back, 'defeating it drops the loot again');
    const info = await A.ev(() => { openPanel('mob', 'greylupe'); const a = /calls others of its kind/i.test(panel.textContent); openPanel('mob', 'mushcap'); const b = /heals itself/i.test(panel.textContent); closePanel(); return a && b; });
    t.ok(info, 'monster info explains what each monster can do');
    t.ok(A.page.errors.length === 0, 'no script errors' + A.page.errors.map(e => ': ' + e).join(''));
  } finally { await A.close(); }
};
