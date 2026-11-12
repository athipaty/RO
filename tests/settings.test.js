// Stage 7 settings window: music/effects volume and switches, interface size, weather, performance mode.
const { player, wait, newRoom } = require('./helpers');
module.exports = async t => {
  const g = await player('Settler', newRoom(), { zone: 'meadow', server: 'http://127.0.0.1:9' });
  try {
    await wait(1500);
    const open = await g.ev(() => { document.querySelector('[data-open="settings"]').click(); return { kind: panelKind, n: panel.querySelectorAll('.setlist:not(.keybinds) .setrow').length, kb: panel.querySelectorAll('.keybinds .setrow').length, want: KEY_ACTIONS.length }; });
    t.ok(open.kind === 'settings' && open.n === 10 && open.kb === open.want && open.kb >= 24, `the dock opens Settings with sound, display and ${open.kb} key options`);
    const vol = await g.ev(() => { audioInit(); const s = panel.querySelector('[data-set="mv"]'); s.value = 40; s.dispatchEvent(new Event('input', { bubbles: true }));
      const saved = JSON.parse(localStorage.getItem('embervale.audio')); return { mv: AU.mv, saved: saved.mv, label: s.parentElement.querySelector('.val').textContent, gain: AU.mus ? +AU.mus.gain.value.toFixed(3) : null }; });
    t.ok(vol.mv === .4 && vol.saved === .4 && vol.label === '40%', `the music slider sets and saves the volume (${vol.label})`);
    const sw = await g.ev(() => { const on0 = AU.sfx; panel.querySelector('[data-act="setsfx"]').click(); const off = AU.sfx; const dis = panel.querySelector('[data-set="sv"]').disabled; panel.querySelector('[data-act="setsfx"]').click(); return { on0, off, dis, back: AU.sfx }; });
    t.ok(sw.on0 && !sw.off && sw.dis && sw.back, 'the effects switch turns sound effects off (and greys out the slider) and on again');
    const ui = await g.ev(() => { const w0 = document.getElementById('hud').getBoundingClientRect().width; panel.querySelector('[data-act="setui"][data-arg="l"]').click();
      const w1 = document.getElementById('hud').getBoundingClientRect().width, cls = document.body.classList.contains('ui-l'), saved = JSON.parse(localStorage.getItem('embervale.settings')).ui;
      panel.querySelector('[data-act="setui"][data-arg="m"]').click(); return { w0, w1, cls, saved }; });
    t.ok(ui.cls && ui.saved === 'l' && ui.w1 > ui.w0 * 1.1, `Large makes the interface bigger (${Math.round(ui.w0)} → ${Math.round(ui.w1)}px) and is remembered`);
    const lite = await g.ev(() => { const d0 = DPR; panel.querySelector('[data-act="setlite"]').click(); const d1 = DPR, cw = document.getElementById('cv').width === Math.round(VW);
      panel.querySelector('[data-act="setlite"]').click(); return { d1, cw, lite: window.LITE }; });
    t.ok(lite.d1 === 1 && lite.cw && lite.lite === false, 'performance mode draws at 1x resolution, and turns off again');
    const wx = await g.ev(() => { const a = skyOn; panel.querySelector('[data-act="weathert"]').click(); const b = skyOn; panel.querySelector('[data-act="weathert"]').click(); return a !== b && skyOn === a; });
    t.ok(wx, 'the weather switch works from Settings');
    if (process.env.SHOTS) await g.page.screenshot({ path: process.env.SHOTS + '/settings.png' });
    t.ok(await g.ev(() => { closePanel(); window.dispatchEvent(new KeyboardEvent('keydown', { key: 'o' })); const k = panelKind; closePanel(); return k === 'settings'; }), 'O opens Settings');
    // key remapping: move 'Move up' to Q, then Q walks up, W does nothing, and it survives a reload of the list
    const km = await g.ev(async () => { openPanel('settings'); panel.querySelector('[data-act="keyset"][data-arg="up"]').click();
      document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'q', bubbles: true, cancelable: true }));
      const saved = JSON.parse(localStorage.getItem('embervale.keys')||'{}').up, shown = [...panel.querySelectorAll('.keybinds .setrow')].find(r => r.textContent.includes('Move up')).querySelector('kbd').textContent;
      closePanel(); keys.w = false;
      document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'w', bubbles: true, cancelable: true })); const wDoes = !!keys.w;
      document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'q', bubbles: true, cancelable: true })); const qDoes = !!keys.w;
      document.body.dispatchEvent(new KeyboardEvent('keyup', { key: 'q', bubbles: true, cancelable: true })); const released = !keys.w;
      return { saved, shown, wDoes, qDoes, released }; });
    t.ok(km.saved === 'q' && km.shown === 'Q' && !km.wDoes && km.qDoes && km.released, `a remapped key walks and the old key stops (${JSON.stringify(km)})`);
    const sw2 = await g.ev(() => { openPanel('settings'); panel.querySelector('[data-act="keyset"][data-arg="items"]').click();
      document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', bubbles: true, cancelable: true }));
      const r = { items: keyOf('items'), skills: keyOf('skills') }; closePanel();
      document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', bubbles: true, cancelable: true })); r.kOpens = panelKind; closePanel();
      document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'i', bubbles: true, cancelable: true })); r.iOpens = panelKind; closePanel();
      openPanel('settings'); panel.querySelector('[data-act="keyreset"]').click(); r.reset = Object.keys(KEYB).length === 0 && keyOf('up') === 'w'; closePanel(); return r; });
    t.ok(sw2.items === 'k' && sw2.skills === 'i' && sw2.kOpens === 'items' && sw2.iOpens === 'skills' && sw2.reset, `choosing a key in use swaps the two, and Reset restores defaults (${JSON.stringify(sw2)})`);
    t.ok(g.page.errors.length === 0, 'no script errors' + g.page.errors.map(e => ': ' + e).join(''));
  } finally { await g.close(); }
};
