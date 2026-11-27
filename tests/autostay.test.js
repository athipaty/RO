// Auto-hunt Roam / Stay here: a switch on the Auto card; Stay fights only around the spot where auto-hunt started
// and walks back there when idle; Roam takes the nearest monster as before. The old Hit button is gone.
const { player, newRoom } = require('./helpers');
module.exports = async t => {
  const g = await player('Stayer', newRoom(), { server: 'http://127.0.0.1:9' });
  try {
    const r = await g.ev(async () => { const sleep = ms => new Promise(r => setTimeout(r, ms)), out = {};
      out.noHit = !document.getElementById('ahitBtn');
      enterZone('meadow'); await sleep(300);
      for (const m of mobs) { m.d = { ...m.d, hp: 1e8, atk: 0, def: 0, aggro: false, spd: 0 }; m.hp = 1e8; }
      // one monster near the hero, one far (500 px), the rest out of reach
      const ms = mobs.filter(m => !m.dead).slice(0, 2); for (const m of mobs) if (!ms.includes(m)) m.x += 4000;
      const [near, far] = ms; P.x = near.x - 100; P.y = near.y; P.path = []; P.target = null; far.x = P.x + 500; far.y = P.y;
      const home = { x: P.x, y: P.y };
      // the switch is on the Auto card and saved
      $('#autoBtn').click(); await sleep(500); const card = document.getElementById('autoPick'), sw = card.querySelector('.apSt');
      out.card = !!sw && /Roam/.test(sw.textContent); sw.click(); await sleep(100);
      out.toggle = P.autoStay === true && /Stay here/.test(sw.textContent) && !card.hidden && SAVE_EXTRA.includes('autoStay');
      card.querySelector('.apOpt[data-loot="1"]').click(); await sleep(300);
      out.on = P.auto === true;
      // stay: the near monster is fought; when it is gone, the far one (500 px from the spot) is left alone
      for (let k = 0; k < 15 && P.target !== near; k++) await sleep(100); // auto-hunt picks on its next frame (slow machines)
      out.tookNear = P.target === near;
      near.dead = true; P.target = null; await sleep(800);
      out.ignoredFar = P.target !== far;
      // walked away (pushed 200 px) with nothing near: it walks back to the spot
      P.x = home.x + 200; P.path = []; for (let k = 0; k < 40 && Math.hypot(P.x - home.x, P.y - home.y) >= 120; k++) await sleep(100); /* up to 4 s: a busy machine walks it back more slowly */
      out.walkedBack = Math.hypot(P.x - home.x, P.y - home.y) < 120;
      // roam: the far monster is taken
      P.auto = false; await sleep(200); P.autoStay = false; P.target = null; P.path = []; P.auto = true; await sleep(800);
      out.roamTook = P.target === far;
      P.auto = false;
      return out; });
    t.ok(r.noHit, 'the separate Hit button is gone');
    t.ok(r.card && r.toggle && r.on, `a Roam / Stay here switch sits on the Auto card and is saved (card ${r.card}, toggle ${r.toggle})`);
    t.ok(r.tookNear && r.ignoredFar, `Stay here fights near the spot and leaves far monsters alone (near ${r.tookNear}, far left ${r.ignoredFar})`);
    t.ok(r.walkedBack, 'with nothing near, it walks back to the spot');
    t.ok(r.roamTook, 'Roam takes the nearest monster even farther away');
    t.ok(g.page.errors.length === 0, 'no script errors' + g.page.errors.map(e => ': ' + e).join(''));
  } finally { await g.close(); }
};
