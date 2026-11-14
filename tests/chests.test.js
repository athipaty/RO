// Treasure chests and skill combos
const { player, wait, newRoom } = require('./helpers');
module.exports = async t => {
  const g = await player('Explorer', newRoom(), { server: 'http://127.0.0.1:9' });
  try {
    await wait(400);
    const r = await g.ev(async () => { const sleep = ms => new Promise(r => setTimeout(r, ms)), out = {};
      enterZone('woods'); await sleep(200); const cs = Z.objs.filter(o => o.kind === 'chest'); out.n = cs.length; out.locked = cs.filter(o => o.locked).length;
      const c = cs.find(o => !o.locked); P.x = c.x; P.y = c.y + 12; const g0 = P.gold; chestOpenNow(c); out.opened = chestOpen(c) && P.gold > g0;
      const g1 = P.gold; chestOpenNow(c); out.once = P.gold === g1;
      const l = cs.find(o => o.locked); P.inv = P.inv.filter(e => e.id !== 'rustykey'); chestOpenNow(l); out.needKey = !chestOpen(l);
      giveItem('rustykey', 1); chestOpenNow(l); out.withKey = chestOpen(l) && !invFind('rustykey');
      P.chests.day = '2000-01-01'; out.refill = !chestOpen(c) && Object.keys(P.chests.found).length === 2;
      openPanel('quests'); out.log = /Treasure chests found/.test(panel.textContent); closePanel();
      out.render = (() => { try { render(); return true; } catch (e) { return e.message; } })();
      // combos
      const m = mobs.find(x => !x.dead); m.hp = 1e9; m.d = { ...m.d, hp: 1e9, def: 0, el: 'neutral' }; S.matk = 100; S.atk = 100;
      const hit = (f) => { const h0 = m.hp; f(); return h0 - m.hp; };
      m.ailUntil = 0; const plain = hit(() => dealMag(m, 1, 'fire'));
      m.ail = 'freeze'; m.ailUntil = now + 5; const shat = hit(() => dealMag(m, 1, 'fire')); out.shatter = shat > plain * 1.25 && m.ailUntil <= now;
      out.flash = texts.some(x => x.txt === 'SHATTER!');
      return out; });
    t.ok(r.n === 3 && r.locked === 1, 'a field region hides 3 chests, one locked');
    t.ok(r.opened && r.once, 'a chest opens once a day and pays');
    t.ok(r.needKey && r.withKey, 'a locked chest needs a Rusty Key, which it uses up');
    t.ok(r.refill, 'chests refill the next day and the found count stays');
    t.ok(r.log && r.render === true, 'the quest log counts chests; chests draw fine');
    t.ok(r.shatter && r.flash, 'fire on a frozen monster shatters it for more damage');
    t.ok(g.page.errors.length === 0, 'no script errors' + g.page.errors.map(e => ': ' + e).join(''));
  } finally { await g.close(); }
};
