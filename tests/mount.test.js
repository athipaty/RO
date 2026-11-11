// #44 mounts: buy one at Tobin's stable, ride with R for more speed, others see it, and you hop off to fight.
const { player, wait, newRoom } = require('./helpers');
const poll = async (g, fn, arg, ms = 8000) => { const end = Date.now() + ms; while (Date.now() < end) { if (await g.ev(fn, arg)) return true; await wait(200); } return false; };

module.exports = async t => {
  const room = newRoom(), OFFLINE = 'http://127.0.0.1:9';
  const A = await player('Rider', room, { server: OFFLINE });
  await wait(1500);
  const B = await player('Onlooker', room, { server: OFFLINE });
  try {
    t.ok(await poll(A, () => NET.others.size === 1), 'two players see each other');
    t.ok(await A.ev(() => { window.dispatchEvent(new KeyboardEvent('keydown', { key: 'r' })); return !P.riding && /don't have a mount yet/.test(document.getElementById('log').textContent); }), 'without a mount, R says where to get one');
    const shop = await A.ev(() => { P.lv = 12; P.gold = 5000; const n = Z.npcs.find(x => x.role === 'warp'); P.x = n.x; P.y = n.y + 30; openNpc(n);
      const st = panel.querySelector('.stable'); const buyH = st && st.querySelector('[data-act="mountbuy"][data-arg="hopper"]'), buyL = st && st.querySelector('[data-act="mountbuy"][data-arg="greylupe"]');
      const r = { stable: !!st, hopperOk: buyH && !buyH.disabled, lupeLocked: buyL && buyL.disabled && /Needs base level 25/.test(st.textContent) }; buyH.click(); r.owned = (P.mounts || []).join(); r.gold = P.gold; return r; });
    t.ok(shop.stable && shop.hopperOk && shop.lupeLocked, "Tobin's Waystation window has a stable (the Grey Lupe needs Lv 25)");
    t.ok(shop.owned === 'hopper' && shop.gold === 2000, 'buying the Meadow Hopper costs 3,000 gold');
    const ride = await A.ev(() => { closePanel(); enterZone('meadow'); const s0 = (S = computeStats()).speed; window.dispatchEvent(new KeyboardEvent('keydown', { key: 'r' })); return { riding: P.riding, s0, s1: S.speed }; });
    t.ok(ride.riding === 'hopper' && Math.abs(ride.s1 / ride.s0 - 1.3) < .02, `R gets you in the saddle: ${ride.s0} → ${ride.s1} speed (+30%)`);
    t.ok(await poll(B, () => { const o = [...NET.others.values()][0]; return o && o.rd === 'hopper'; }), 'other players see you riding');
    const drawn = await B.ev(async () => { enterZone('meadow'); await new Promise(r => setTimeout(r, 1500)); let n = 0; const o = drawMount; drawMount = (p, k) => { n++; return o(p, k); }; await new Promise(r => setTimeout(r, 600)); drawMount = o; return n; });
    t.ok(drawn >= 2, 'and the mount is drawn under you on their screen');
    const fight = await A.ev(() => { const m = mobs.find(m => !m.dead); m.x = P.x + 30; m.y = P.y; basicAttack(m); return { riding: P.riding, speed: S.speed }; });
    t.ok(!fight.riding, 'attacking hops you off');
    const hurt = await A.ev(() => { mountUp(); const was = !!P.riding; hurtPlayer(1, 'a test'); return { was, now: !!P.riding, log: /knocked out of the saddle/.test(document.getElementById('log').textContent) }; });
    t.ok(hurt.was && !hurt.now && hurt.log, 'getting hit knocks you out of the saddle');
    t.ok(await A.ev(() => { mountUp(); enterZone('deep1'); return !P.riding; }), 'mounts stay outside the dungeon');
    t.ok(await A.ev(() => { enterZone('meadow'); P.riding = null; sendChat('/ride'); const on = !!P.riding; sendChat('/ride'); return on && !P.riding; }), '/ride gets on and off too');
    t.ok(await A.ev(() => { save(); const s = JSON.parse(localStorage.getItem(SAVE_KEY)).p; return (s.mounts || []).includes('hopper'); }), 'your mounts are saved');
    t.ok(await A.ev(() => !!KEY_ACTIONS.find(a => a[0] === 'ride' && a[1] === 'r')), 'R is listed in Settings and can be changed');
    t.ok(A.page.errors.length === 0 && B.page.errors.length === 0, 'no script errors' + [...A.page.errors, ...B.page.errors].map(e => ': ' + e).join(''));
    if (process.env.SHOTS) { await A.ev(() => { mountUp(); }); await wait(1200); await B.page.screenshot({ path: process.env.SHOTS + '/mount.png' }); }
  } finally { await A.close(); await B.close(); }
};
