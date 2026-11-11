// The status box (top left) collapses to name + HP + SP and expands again; the choice is remembered.
const { openGame, player, wait, newRoom } = require('./helpers');

module.exports = async t => {
  const room = newRoom();
  const g = await player('Toggler', room, { server: 'http://127.0.0.1:9' });
  try {
    await wait(800);
    const full = await g.ev(() => ({ h: document.getElementById('hud').offsetHeight, gold: document.getElementById('gold').offsetParent !== null }));
    await g.ev(() => document.getElementById('hudToggle').click());
    const mini = await g.ev(() => { const v = id => document.getElementById(id).offsetParent !== null;
      return { h: document.getElementById('hud').offsetHeight, name: v('hName'), hp: !!document.querySelector('#hud .hpb').offsetParent, sp: !!document.querySelector('#hud .spb').offsetParent,
        gold: v('gold'), lv: v('lvT'), btn: document.getElementById('hudToggle').textContent, exp: document.getElementById('hudToggle').getAttribute('aria-expanded') }; });
    t.ok(full.gold && mini.h < full.h / 2, `the − button shrinks the status box (${full.h}px → ${mini.h}px)`);
    t.ok(mini.name && mini.hp && mini.sp && !mini.gold && !mini.lv, 'collapsed, it still shows your name, HP and SP');
    t.ok(mini.btn === '+' && mini.exp === 'false', 'the button turns into + and reports the collapsed state');
    await g.page.reload(); await wait(800);
    await g.ev(() => document.getElementById('contBtn').click()); await wait(600);
    t.ok(await g.ev(() => document.getElementById('hud').classList.contains('mini')), 'the choice is remembered after reloading');
    await g.ev(() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'b' })));
    t.ok(await g.ev(() => !document.getElementById('hud').classList.contains('mini') && document.getElementById('gold').offsetParent !== null), 'B expands it again');
    // the monster box: name + HP by default, details on demand
    const tb = await g.ev(async () => { const w = ms => new Promise(r => setTimeout(r, ms)); enterZone('meadow'); await w(300); P.target = mobs.find(m => !m.dead); updateHud();
      const v = id => document.getElementById(id).offsetParent !== null; const a = { name: v('tName'), hp: v('tI'), drops: v('tDrops'), info: v('tInfo'), h: document.getElementById('target').offsetHeight };
      document.getElementById('tToggle').click(); const b = { drops: v('tDrops'), info: v('tInfo'), lv: v('tLv'), h: document.getElementById('target').offsetHeight }; return { a, b }; });
    t.ok(tb.a.name && tb.a.hp && !tb.a.drops && !tb.a.info, 'the monster box shows just the name and HP by default');
    t.ok(tb.b.drops && tb.b.info && tb.b.lv && tb.b.h > tb.a.h, `its + button shows level, element, drops and Info (${tb.a.h}px → ${tb.b.h}px)`);
    t.ok(await g.ev(() => localStorage.getItem('embervale.targetFull') === '1'), 'and the choice is remembered');
    t.ok(g.page.errors.length === 0, 'no script errors' + g.page.errors.map(e => ': ' + e).join(''));
  } finally { await g.close(); }
};
