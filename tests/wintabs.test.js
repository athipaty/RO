// Phones: tabs between Stats, Items, Equip, Skills and Quests, and swiping left/right on the window switches them
const { player, newRoom, wait } = require('./helpers');
module.exports = async t => {
  const A = await player('Tabber', newRoom(), { server: 'http://127.0.0.1:9' });
  try {
    // a phone viewport reloads the page: start a hero again
    await A.page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true }); await wait(1200);
    await A.ev(() => { if (!P) { document.getElementById('nameIn').value = 'Tabber'; document.getElementById('newBtn').click(); } }); await wait(2000);
    const r = await A.ev(async () => { const sleep = ms => new Promise(r => setTimeout(r, ms)), out = {};
      openPanel('items'); await sleep(200);
      const nav = document.querySelector('#panel>#winTabs');
      out.tabs = nav ? [...nav.querySelectorAll('.wtab')].map(b => b.dataset.wt).join(',') : '';
      out.onItems = !!nav && nav.querySelector('.wtab.on').dataset.wt === 'items';
      nav.querySelector('.wtab[data-wt="equip"]').click(); await sleep(200);
      out.tapEquip = panelKind === 'equip' && !panel.hidden && document.querySelector('#winTabs .wtab.on').dataset.wt === 'equip';
      // swipe left = next (Skills), swipe right = back (Equip)
      const swipe = (x0, x1) => { const mk = (x) => new Touch({ identifier: 1, target: panel, clientX: x, clientY: 400 });
        panel.dispatchEvent(new TouchEvent('touchstart', { touches: [mk(x0)], changedTouches: [mk(x0)], bubbles: true }));
        panel.dispatchEvent(new TouchEvent('touchend', { touches: [], changedTouches: [mk(x1)], bubbles: true })); };
      swipe(300, 120); await sleep(200); out.swipeNext = panelKind === 'skills';
      swipe(100, 300); await sleep(200); out.swipeBack = panelKind === 'equip';
      // townsfolk windows (a shop) get no tabs
      openPanel('shop'); await sleep(200); out.shopNoTabs = !document.querySelector('#panel>#winTabs');
      closePanel(); return out; });
    t.ok(r.tabs === 'status,items,equip,skills,quests' && r.onItems, `the Items window shows tabs for your windows (${r.tabs})`);
    t.ok(r.tapEquip, 'tapping a tab switches window without closing');
    t.ok(r.swipeNext && r.swipeBack, `swiping left goes to the next window and right goes back (next ${r.swipeNext}, back ${r.swipeBack})`);
    t.ok(r.shopNoTabs, 'shop and other townsfolk windows have no tabs');
    t.ok(A.page.errors.length === 0, 'no script errors' + A.page.errors.map(e => ': ' + e).join(''));
  } finally { await A.close(); }
};
