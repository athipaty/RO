// At base level 99 the EXP bar shows "max" instead of climbing past 100%, and EXP no longer piles up.
const { player, wait, newRoom } = require('./helpers');

module.exports = async t => {
  const g = await player('Capped', newRoom(), { server: 'http://127.0.0.1:9' });
  try {
    await wait(500);
    const r = await g.ev(async () => { const w = ms => new Promise(r => setTimeout(r, ms));
      P.lv = 99; P.exp = Math.round(expNeed(99) * 1.457); await w(300); const old = document.getElementById('exT').textContent;
      P.exp = 1234; gainExp(5000, 0); await w(300);
      return { old, txt: document.getElementById('exT').textContent, exp: P.exp, lv: P.lv, bar: document.getElementById('exI').style.width }; });
    t.ok(r.old === 'max' && r.txt === 'max', `the EXP readout says max at level 99 (was showing over 100%): "${r.old}"`);
    t.ok(r.exp === 0 && r.lv === 99, 'killing a monster at 99 does not pile EXP up past the cap');
    const low = await g.ev(() => { P.lv = 50; P.exp = Math.round(expNeed(50) / 2); updateHud(); return document.getElementById('exT').textContent; });
    t.ok(low === '50.0%', `below the cap the percentage still shows (${low})`);
    t.ok(g.page.errors.length === 0, 'no script errors' + g.page.errors.map(e => ': ' + e).join(''));
  } finally { await g.close(); }
};
