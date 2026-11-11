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
    t.ok(g.page.errors.length === 0, 'no script errors' + g.page.errors.map(e => ': ' + e).join(''));
  } finally { await g.close(); }
};
