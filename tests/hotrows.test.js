// #62 several hotbar rows: ⊞ adds rows, Alt+1–8 / F1–F8 press them, editor row tabs, drag between rows, saved.
const { player, newRoom } = require('./helpers');
const w = ms => new Promise(r => setTimeout(r, ms));
module.exports = async t => {
  const A = await player('Rows', newRoom(), { server: 'http://127.0.0.1:9' });
  try {
    t.ok(await A.ev(() => !document.getElementById('hotrows') || document.getElementById('hotrows').hidden), 'one row by default');
    const add = await A.ev(async () => { document.getElementById('hbRows').click(); await new Promise(r => setTimeout(r, 300)); const box = document.getElementById('hotrows');
      const r = box.getBoundingClientRect(), hb = document.getElementById('hotbar').getBoundingClientRect();
      return { rows: box.querySelectorAll('.hrow').length, slots: box.querySelectorAll('.slot').length, above: r.bottom <= hb.top + 1 }; });
    t.ok(add.rows === 1 && add.slots === 8 && add.above, '⊞ adds a second row of 8 above the main bar');
    const fill = await A.ev(async () => { enterZone('meadow'); P.inv = []; giveItem('red', 3); P.cd = {};
      document.querySelector('#hotrows .slot[data-r="1"][data-i="2"]').click(); const opened = panelKind === 'hotbar' && /Row 2/.test(panel.textContent);
      PANEL_ACTS.hbput('i:red'); closePanel(); await new Promise(r => setTimeout(r, 200));
      return { opened, row: JSON.stringify(P.bars[0][2]), main: JSON.stringify(P.bar) }; });
    t.ok(fill.opened, 'an empty slot in row 2 opens the editor on the Row 2 tab');
    t.ok(fill.row === '{"i":"red"}', 'the editor puts the item on row 2');
    const key = await A.ev(async () => { P.hp = 1; document.body.dispatchEvent(new KeyboardEvent('keydown', { key: '3', code: 'Digit3', altKey: true, bubbles: true })); return P.hp > 1; });
    t.ok(key, 'Alt+3 uses row 2, slot 3');
    const sweep = await A.ev(async () => { await new Promise(r => setTimeout(r, 150)); return parseFloat(document.querySelector('#hotrows .slot[data-r="1"][data-i="2"] .cd').style.height) || 0; });
    t.ok(sweep > 0, 'row slots show cooldowns too');
    const three = await A.ev(async () => { document.getElementById('hbRows').click(); await new Promise(r => setTimeout(r, 200)); P.bars[1][0] = { i: 'red' }; buildRows(true);
      P.cd = {}; P.hp = 1; document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'F1', code: 'F1', bubbles: true })); return { rows: document.querySelectorAll('#hotrows .hrow').length, used: P.hp > 1 }; });
    t.ok(three.rows === 2 && three.used, 'a third row, pressed with F1–F8');
    const swap = await A.ev(() => { const a = JSON.stringify(P.bar[0]); rowSwap({ r: 0, i: 0 }, { r: 1, i: 2 }); return { mainNow: JSON.stringify(P.bar[0]), rowNow: JSON.stringify(P.bars[0][2]), a }; });
    t.ok(swap.mainNow === '{"i":"red"}' && swap.rowNow === swap.a, 'slots swap between the main bar and the extra rows');
    const saved = await A.ev(() => { save(); const s = JSON.parse(localStorage.getItem(SAVE_KEY)).p; return s.hbRows === 2 && Array.isArray(s.bars) && s.bars[1][0].i === 'red'; });
    t.ok(saved, 'rows are saved');
    const off = await A.ev(async () => { document.getElementById('hbRows').click(); await new Promise(r => setTimeout(r, 200)); return document.getElementById('hotrows').hidden; });
    t.ok(off, '⊞ cycles back to one row');
    t.ok(A.page.errors.length === 0, 'no script errors' + A.page.errors.map(e => ': ' + e).join(''));
  } finally { await A.close(); }
};
