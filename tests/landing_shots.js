// Takes the About page screenshots (img/landing/*.jpg) from the current game: a local game with staged players.
// Run: node landing_shots.js   (writes into ../img/landing)
const { player, newRoom, wait } = require('./helpers');
const path = require('path');
const OUT = path.join(__dirname, '..', 'img', 'landing');
const prep = g => g.ev(() => {
  window.addP = (name, cls, dx, dy, o = {}) => ingest({ peer: 'p_' + name, presence: { v: 1, n: name, c: cls, z: zoneId, x: P.x + dx, y: P.y + dy, ts: Date.now(), lv: o.lv || 30,
    lk: lookCode(o.look || lookFor(name)), f: o.f || 1, w: o.w || null, hp: 100, sp: 145, st: o.sit ? 1 : 0, mv: 0, ch: o.say ? [{ i: 1, s: o.say, t: Date.now() }] : [] } });
  window.hideUI = on => { let st = document.getElementById('__hideui'); if (!st) { st = document.createElement('style'); st.id = '__hideui'; document.head.appendChild(st); }
    st.textContent = on ? 'body>*:not(#cv){visibility:hidden!important}' : ''; };
  { const st = document.createElement('style'); st.textContent = '#tutCard,#giftPill,#zoneCard,#lvCard,#achToast,.achToast{display:none!important}'; document.head.appendChild(st); }
  window.heal = () => { S = computeStats(); P.hp = S.maxhp; P.sp = S.maxsp; P.lv = 30; };
  window.clean = () => { for (const k of [...NET.others.keys()]) NET.others.delete(k); closePanel(); document.querySelectorAll('#tutCard,#giftPill,#lvCard,#regionCard,.regcard,#lvBurst,#rareDrop').forEach(e => e.remove()); P.tut = 'done'; };
});
(async () => {
  const g = await player('Aria', newRoom(), { server: 'http://127.0.0.1:9' });
  try {
    await wait(1500); await prep(g);
    const shot = async (file, w, h, dpr, q = 86) => { await g.page.setViewport({ width: w, height: h, deviceScaleFactor: dpr }); await wait(900); await g.page.screenshot({ path: path.join(OUT, file), type: 'jpeg', quality: q }); };

    // 1. the hero shot: a fight in the woods, no interface
    await g.page.setViewport({ width: 800, height: 450, deviceScaleFactor: 2 });
    await g.ev(async () => { const w = ms => new Promise(r => setTimeout(r, ms)); clean(); P.cls = 'warden'; P.lv = 30; P.eq.weapon = { id: 'sword', s: [], r: 0 }; enterZone('meadow'); await w(1500); clean(); heal(); SETS.goal = false;
      P.x = Z.spawn.x + 260; P.y = Z.spawn.y + 120; for (const o of mobs) if (Math.hypot(o.x - P.x, o.y - P.y) < 260) { o.x += 600; }
      const m = mobs.find(x => !x.dead && x.d.id === 'sproutling') || mobs.find(x => !x.dead); m.x = P.x + 46; m.y = P.y - 4; m.hp = m.d.hp = 99999; m.state = 'idle'; P.face = 1;
      addP('Lyra', 'stormcaller', -60, -80, { w: 'wand', f: 1 }); addP('Bram', 'templar', -130, 0, { w: 'mace', f: 1 }); addP('Tamsin', 'falconer', -50, 85, { w: 'bow', f: 1 }); addP('Kade', 'nightblade', 120, -60, { w: 'dagger', f: -1 });
      hideUI(true); await w(600); P.target = m; S.atk = 900; dealPhys(m, 3, { critPlus: 100, sure: true }); P.swingT = now; P.swingDur = .3; });
    await wait(140); await g.page.screenshot({ path: path.join(OUT, 'hero.jpg'), type: 'jpeg', quality: 86 });

    // 2. the town: friends chatting
    await g.ev(async () => { const w = ms => new Promise(r => setTimeout(r, ms)); hideUI(false); clean(); P.cls = 'venomancer'; P.eq.weapon = { id: 'dagger', s: [], r: 0 }; enterZone('town'); await w(1500); clean(); heal();
      const n = getZone('town').npcs.find(x => /Hollis/.test(x.name)); P.x = n.x + 120; P.y = n.y + 150;
      addP('Mira', 'oracle', -150, -10, { say: 'Anyone up for the Crypt?', w: 'wand' }); addP('Bram', 'templar', 40, -120, { say: 'Templar ready!', w: 'mace', f: -1 });
      addP('Kade', 'chronomancer', 170, -10, { say: 'Selling a Nightfang', w: 'wand', f: -1 }); addP('Lyra', 'phantom', -60, 110, { sit: 1, w: 'dagger' }); addP('Sorrel', 'wildstalker', 90, 120, { w: 'bow', f: -1 }); hideUI(true); });
    await shot('town.jpg', 960, 570, 4/3);

    // 3. Emberkeep in a guild war
    await g.ev(async () => { const w = ms => new Promise(r => setTimeout(r, ms)); hideUI(false); clean(); P.cls = 'bulwark'; P.eq.weapon = { id: 'sword', s: [], r: 0 }; enterZone('keep'); await w(1500); clean(); heal();
      GW.war = gwWar({ on: 1, left: 511, holder: { id: 'g1', name: 'Ember Wardens', emblem: [1, 2, 0] }, capture: { id: 'g2', name: 'Tidecallers', pct: 62 }, contested: 1, top: [{ id: 'g1', name: 'Ember Wardens', pts: 214, emblem: [1, 2, 0] }, { id: 'g2', name: 'Tidecallers', pts: 160, emblem: [3, 4, 1] }] }); gwBar();
      const c = { x: Z.w * TILE / 2, y: Z.h * TILE / 2 }; P.x = c.x - 110; P.y = c.y; P.face = 1;
      addP('Lyra', 'hexweaver', 70, -30, { w: 'wand', f: -1 }); addP('Sorrel', 'sharpshooter', 150, 40, { w: 'bow', f: -1 }); addP('Hale', 'ravager', 60, 80, { w: 'sword', f: -1 }); addP('Nyx', 'phantom', 20, -90, { w: 'dagger' }); });
    await shot('keep.jpg', 1280, 760, 1);

    // 4. the arena
    await g.ev(async () => { const w = ms => new Promise(r => setTimeout(r, ms)); clean(); GW.war = null; gwBar(); P.cls = 'sharpshooter'; P.eq.weapon = { id: 'bow', s: [], r: 0 }; enterZone('arena'); await w(1500); clean(); heal();
      const c = { x: Z.w * TILE / 2, y: Z.h * TILE / 2 }; P.x = c.x - 90; P.y = c.y - 20; P.face = 1;
      addP('Corvin', 'runeguard', 80, 30, { w: 'sword', f: -1 }); addP('Mira', 'oracle', 40, 190, { w: 'wand', f: -1 }); addP('Oskar', 'ascetic', 150, 230, { w: 'mace', f: -1 }); addP('Vesk', 'venomancer', -150, 190, { w: 'dagger' });
      P.target = null; P.bowT = now - .2; P.bowDur = .5; });
    await shot('arena.jpg', 1280, 760, 1);

    // 5. a phone
    await g.ev(async () => { const w = ms => new Promise(r => setTimeout(r, ms)); clean(); P.cls = 'warden'; P.eq.weapon = { id: 'sword', s: [], r: 0 }; enterZone('meadow'); await w(1500); clean(); heal();
      addP('Lyra', 'arcanist', -90, -20, { w: 'wand' }); addP('Pip', 'shade', 80, 40, { w: 'dagger', f: -1 }); });
    await g.page.setViewport({ width: 390, height: 780, deviceScaleFactor: 2 }); await wait(1200); await g.ev(() => document.querySelectorAll('#regionCard,.regcard,#tutCard').forEach(e => e.remove()));
    await g.page.screenshot({ path: path.join(OUT, 'phone.jpg'), type: 'jpeg', quality: 86 });
    console.log('errors', g.page.errors);
  } finally { await g.close(); }
})();
