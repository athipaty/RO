// (v1.53.3) Phone held upright, Status window: tapping + does not move the stat rows. The "Not saved yet · Save · Undo"
// bar floats as a pill above the window tabs (it takes no room), and the build guide's ★ hint sits on the stat's own line.
const { player, newRoom, wait } = require('./helpers');
module.exports = async t => {
  const g = await player('Steady', newRoom(), { server: 'http://127.0.0.1:9' });
  try {
    await g.page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true }); await wait(1200);
    await g.ev(() => { if (!P) { document.getElementById('nameIn').value = 'Steady'; document.getElementById('newBtn').click(); } }); await wait(2000);
    const r = await g.ev(async () => { const sleep = ms => new Promise(r => setTimeout(r, ms));
      P.statPts = 40; openPanel('status'); await sleep(300);
      const tops = () => [...panel.querySelectorAll('.st')].map(s => Math.round(s.getBoundingClientRect().top));
      const hts = () => [...panel.querySelectorAll('.st')].map(s => Math.round(s.getBoundingClientRect().height));
      const t0 = tops(), h0 = hts();
      panel.querySelector('[data-act="stat"][data-arg="str"]').click(); await sleep(200);
      const bar = panel.querySelector('.pendbar'), bs = bar && getComputedStyle(bar).position, br = bar && bar.getBoundingClientRect();
      const tabs = document.getElementById('winTabs'), tr = tabs && tabs.getBoundingClientRect();
      const t1 = tops();
      // a ★ hint (if the build guide shows one) is inside the row's description cell, and every row keeps one height
      const hint = panel.querySelector('.st .bghint'), hintInline = !hint || hint.parentElement.parentElement.classList.contains('st');
      const h1 = hts(), sameH = h1.every(v => Math.abs(v - h1[0]) <= 2) || JSON.stringify(h0) === JSON.stringify(h1);
      const pos = { bar: !!bar, fixed: bs === 'fixed' };
      PANEL_ACTS.pendundo(); closePanel();
      return { ...pos, still: JSON.stringify(t0) === JSON.stringify(t1), t0, t1,
        onScreen: br && br.top >= 0 && br.bottom <= innerHeight && br.left >= 0 && br.right <= innerWidth,
        aboveTabs: !tr || !tr.height || br.bottom <= tr.top + 12, hintInline, sameH };
    });
    t.ok(r.bar && r.fixed, 'tapping + shows the Save / Undo bar as a floating pill');
    t.ok(r.still, `the stat rows do not move when the bar appears (${r.t0.join(',')} → ${r.t1.join(',')})`);
    t.ok(r.onScreen && r.aboveTabs, 'the pill is on screen, just above the window tabs');
    t.ok(r.hintInline && r.sameH, 'the ★ build hint sits on the stat line, so no row grows taller');
    t.ok(g.page.errors.length === 0, 'no script errors' + g.page.errors.map(e => ': ' + e).join(''));
  } finally { await g.close(); }
};
