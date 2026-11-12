// phones: the map, quick buttons and chat fade while you fight, come back after, and the Settings switch turns it off
const { openGame, newRoom } = require('./helpers');
const wait = ms => new Promise(r => setTimeout(r, ms));
module.exports = async t => {
  const A = await openGame(newRoom(), { server: 'http://127.0.0.1:9' });
  try {
    await A.page.setViewport({ width: 390, height: 780, isMobile: true, hasTouch: true }); await wait(1200);
    await A.ev(() => { localStorage.clear(); document.getElementById('nameIn').value = 'Fighter'; document.getElementById('newBtn').click(); }); await wait(2500);
    const start = () => A.ev(() => { enterZone('meadow'); const m = mobs.find(o => !o.dead); P.x = m.x - 40; P.y = m.y; m.d = { ...m.d, hp: 99999 }; m.hp = 99999; P.target = m; });
    const stop = () => A.ev(() => { P.target = null; P.auto = false; for (const m of mobs) { m.dead = true; m.respawnAt = 1e12; } P.hurtT = -9; });
    const on = () => A.ev(() => document.body.classList.contains('fightui'));
    t.ok(!(await on()), 'the screen is normal in town');
    await start(); await wait(2600);
    t.ok(await on(), 'after a moment of fighting the map, quick buttons and chat fade away');
    t.ok(await A.ev(() => getComputedStyle(document.getElementById('hud')).opacity === '1'), 'the HP box stays');
    await stop(); await wait(4000);
    t.ok(!(await on()), 'they come back a few seconds after the fight');
    await A.ev(() => { SETS.fightUi = false; }); await start(); await wait(2600);
    t.ok(!(await on()), 'Settings can turn it off');
    t.ok(A.page.errors.length === 0, 'no script errors' + A.page.errors.map(e => ': ' + e).join(''));
  } finally { await A.close(); }
};
