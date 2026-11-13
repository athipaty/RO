// turning Auto on asks what to pick up; the choice starts auto-hunt with that rule; tapping Auto again turns it off
const { player, newRoom } = require('./helpers');
module.exports = async t => {
  const A = await player('Picker', newRoom(), { server: 'http://127.0.0.1:9' });
  try {
    const r = await A.ev(async () => { const w = ms => new Promise(r => setTimeout(r, ms)); enterZone('meadow'); P.auto = false;
      document.getElementById('autoBtn').click(); await w(250); const card = document.getElementById('autoPick'); const shown = !card.hidden && card.classList.contains('show'), stillOff = !P.auto;
      const linked = [...card.querySelectorAll('.apLine')].every(p => (p.getAttribute('d') || '').startsWith('M') && getComputedStyle(p).strokeDashoffset === '0px');
      card.querySelector('[data-loot="0"]').click(); await w(250); const on = P.auto, best = P.autoLoot === false, gone = card.hidden;
      document.getElementById('autoBtn').click(); await w(100); const off = !P.auto && document.getElementById('autoPick').hidden;
      document.getElementById('autoBtn').click(); await w(200); const hl = card.querySelector('[data-loot="0"]').classList.contains('on'); document.body.click(); await w(250); const cancel = card.hidden && !P.auto;
      return { shown, stillOff, linked, on, best, gone, off, hl, cancel }; });
    t.ok(r.shown && r.stillOff, 'tapping Auto pops out the two pick-up choices');
    t.ok(r.linked, 'each choice is joined to the Auto button by a line that draws itself in');
    t.ok(r.on && r.best && r.gone, 'choosing "Only valuable" starts auto-hunt with that rule');
    t.ok(r.off, 'tapping Auto again turns it off, no card');
    t.ok(r.hl && r.cancel, 'the last choice is highlighted, and tapping elsewhere cancels');
    t.ok(A.page.errors.length === 0, 'no script errors' + A.page.errors.map(e => ': ' + e).join(''));
  } finally { await A.close(); }
};
