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
      // when the server runs the monsters, the shatter also ends the freeze there (a zero-length freeze)
      { const zh = zoneHost; zoneHost = () => 'server'; NET.hits = []; m.ail = 'freeze'; m.ailUntil = now + 5; dealMag(m, 1, 'fire'); zoneHost = zh;
        out.thawSent = NET.hits.some(h => h.sk === 'freeze' && h.st === 0 && h.m === m.idx); }
      // a monster standing on a chest: tapping it attacks the monster instead of opening the chest
      { const c2 = getZone('woods').objs.find(o => o.kind === 'chest' && !chestOpen(o)) || c; P.chests.open = {}; const mm = mobs.find(x => !x.dead && x !== m) || m;
        mm.x = c2.x; mm.y = c2.y - 4; P.x = c2.x + 300; P.y = c2.y; P.path = []; CH.goal = null; camX = P.x - cv.clientWidth / 2; camY = P.y - cv.clientHeight / 2;
        const p = proj(mm.x, mm.y), rc = cv.getBoundingClientRect(), at = { clientX: p.x - camX + rc.left, clientY: p.y - mm.d.size * .9 - camY + rc.top, pointerType: 'mouse', button: 0, bubbles: true, cancelable: true };
        cv.dispatchEvent(new PointerEvent('pointerdown', at)); cv.dispatchEvent(new PointerEvent('pointerup', at));
        out.mobFirst = !CH.goal && !chestOpen(c2);
        // with no monster there, the same tap goes to the chest
        mm.x += 400; const q = proj(c2.x, c2.y); cv.dispatchEvent(new PointerEvent('pointerdown', { ...at, clientX: q.x - camX + rc.left, clientY: q.y - 10 - camY + rc.top }));
        out.chestTap = CH.goal === c2 || chestOpen(c2); CH.goal = null; P.path = []; P.target = null; }
      return out; });
    t.ok(r.n === 3 && r.locked === 1, 'a field region hides 3 chests, one locked');
    t.ok(r.opened && r.once, 'a chest opens once a day and pays');
    t.ok(r.needKey && r.withKey, 'a locked chest needs a Rusty Key, which it uses up');
    t.ok(r.refill, 'chests refill the next day and the found count stays');
    t.ok(r.log && r.render === true, 'the quest log counts chests; chests draw fine');
    t.ok(r.shatter && r.flash, 'fire on a frozen monster shatters it for more damage');
    t.ok(r.thawSent, 'the shatter ends the freeze on the game server too');
    t.ok(r.mobFirst && r.chestTap, `a monster on top of a chest gets the tap; an empty spot opens the chest (mob ${r.mobFirst}, chest ${r.chestTap})`);
    t.ok(g.page.errors.length === 0, 'no script errors' + g.page.errors.map(e => ': ' + e).join(''));
  } finally { await g.close(); }
};
