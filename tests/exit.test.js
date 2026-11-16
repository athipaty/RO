// Exit in the Menu (also on phones): saves the hero and goes back to the start screen
const { player, newRoom, wait } = require('./helpers');
module.exports = async t => {
  const A = await player('Leaver', newRoom(), { server: 'http://127.0.0.1:9' });
  try {
    // switching to a phone viewport reloads the page: start a hero again
    await A.page.setViewport({ width: 844, height: 390, isMobile: true, hasTouch: true }); await wait(1200);
    await A.ev(() => { if (!P) { document.getElementById('nameIn').value = 'Leaver'; document.getElementById('newBtn').click(); } }); await wait(2000);
    const r = await A.ev(async () => { const sleep = ms => new Promise(r => setTimeout(r, ms));
      document.getElementById('menuBtn').click(); await sleep(300);
      const b = document.getElementById('mExit'), rc = b.getBoundingClientRect();
      return { shown: rc.width > 0 && rc.height > 0 && rc.bottom <= innerHeight && rc.right <= innerWidth, lv: P.lv }; });
    t.ok(r.shown, 'the phone menu has an Exit button that fits on screen');
    await A.ev(() => { P.gold = 4321; });
    const nav = A.page.waitForNavigation({ timeout: 8000 }).catch(() => null);
    await A.ev(() => document.getElementById('mExit').click());
    await nav; await wait(1200);
    const back = await A.ev(() => { const s = document.getElementById('title'); return { start: !!s && s.getClientRects().length > 0, running: typeof running !== 'undefined' && running }; });
    t.ok(back.start && !back.running, 'Exit saves and returns to the start screen');
    const saved = await A.ev(() => Object.keys(localStorage).some(k => /^embervale\.save\.v1/.test(k) && /"gold":4321\b/.test(localStorage.getItem(k))));
    t.ok(saved === true, `the hero was saved first (gold ${saved})`);
    t.ok(A.page.errors.length === 0, 'no script errors' + A.page.errors.map(e => ': ' + e).join(''));
  } finally { await A.close(); }
};
