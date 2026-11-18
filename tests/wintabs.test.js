// Phones: tabs between Stats, Skills, Equip, Items and Quests, and swiping left/right on the window switches them
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
      // swipe left = next (Items), swipe right = back (Equip)
      const swipe = (x0, x1) => { const mk = (x) => new Touch({ identifier: 1, target: panel, clientX: x, clientY: 400 });
        panel.dispatchEvent(new TouchEvent('touchstart', { touches: [mk(x0)], changedTouches: [mk(x0)], bubbles: true }));
        panel.dispatchEvent(new TouchEvent('touchend', { touches: [], changedTouches: [mk(x1)], bubbles: true })); };
      swipe(300, 120); await sleep(200); out.swipeNext = panelKind === 'items';
      swipe(100, 300); await sleep(200); out.swipeBack = panelKind === 'equip';
      // the Build guide (opened from Skills) keeps the Skills tab lit and has a way back
      openPanel('skills'); await sleep(150); panel.querySelector('[data-act="openguide"]').click(); await sleep(250);
      out.guideTab = panelKind === 'buildguide' && document.querySelector('#winTabs .wtab.on')?.dataset.wt === 'skills';
      panel.querySelector('.bgback').click(); await sleep(200); out.guideBack = panelKind === 'skills';
      // no window is wider than the screen (it must not slide sideways)
      out.wide = []; for (const k of ['status', 'items', 'equip', 'skills', 'quests', 'guild', 'settings']) { openPanel(k); await sleep(150); if (panel.scrollWidth > panel.clientWidth + 1) out.wide.push(k + ':' + panel.scrollWidth + '>' + panel.clientWidth); }
      // townsfolk windows (a shop) get no tabs
      openPanel('shop'); await sleep(200); out.shopNoTabs = !document.querySelector('#panel>#winTabs');
      closePanel(); return out; });
    t.ok(r.tabs === 'status,skills,equip,items,quests,guild,settings' && r.onItems, `the Items window shows tabs for your windows (${r.tabs})`);
    t.ok(r.tapEquip, 'tapping a tab switches window without closing');
    t.ok(r.swipeNext && r.swipeBack, `swiping left goes to the next window and right goes back (next ${r.swipeNext}, back ${r.swipeBack})`);
    t.ok(r.guideTab && r.guideBack, `the Build guide keeps the Skills tab lit and ← Skills goes back (tab ${r.guideTab}, back ${r.guideBack})`);
    t.ok(r.wide.length === 0, 'no window can be slid sideways ' + r.wide.join(' '));
    t.ok(r.shopNoTabs, 'shop and other townsfolk windows have no tabs');
    t.ok(A.page.errors.length === 0, 'no script errors' + A.page.errors.map(e => ': ' + e).join(''));
  } finally { await A.close(); }
};
