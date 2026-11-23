// v1.52.5 title screen: one hero card with ‹ › and dots, a one-line account bar, looks inside the card, more look choices.
const { player, wait, newRoom } = require('./helpers');

module.exports = async t => {
  const g = await player('Arrowa', newRoom(), { server: 'http://127.0.0.1:9' });
  try {
    await wait(1500);
    // back to the title with one saved hero (slot 0) and five empty slots
    await g.ev(() => save(true)); await g.page.reload(); await wait(2000);
    const r = await g.ev(() => { const q = id => document.getElementById(id), out = {};
      out.dots = document.querySelectorAll('#slotDots .tcDot').length; out.arrows = !!q('slotPrev') && !!q('slotNext') && !q('slotNext').hidden;
      out.grid = getComputedStyle(q('slotsSec')).display; out.tag = getComputedStyle(document.querySelector('#title .tag')).display;
      document.querySelector('.slotc[data-slot="0"]').click(); out.name0 = q('slotName').textContent;
      q('slotNext').click(); out.slot1 = CS.slot; out.name1 = q('slotName').textContent; out.newView = !q('creator').hidden && q('title').classList.contains('tcNew');
      dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' })); out.back = CS.slot;
      out.inCard = !!document.querySelector('#title .t-stage #creator');
      out.who = q('acWho').textContent; out.formHidden = q('acIn').hidden; q('acOpen').click(); out.formOpen = !q('acIn').hidden; q('acOpen').click();
      out.counts = { hair: HAIRS.length, eyes: EYES.length, skin: SKINS.length, styles: STYLE_NAMES.length, builds: BUILD_NAMES.length,
        swatches: document.querySelectorAll('#swHair button').length };
      return out; });
    t.ok(r.dots === 6 && r.arrows && r.grid === 'none', 'one hero card with ‹ › and a dot per slot instead of the slot grid ' + JSON.stringify([r.dots, r.arrows, r.grid]));
    t.ok(r.name0 === 'Arrowa' && r.slot1 === 1 && r.name1 === 'New character' && r.newView && r.back === 0, '› goes to the next slot (an empty one shows the new-hero screen), ← goes back ' + JSON.stringify([r.name0, r.slot1, r.name1, r.back]));
    t.ok(r.inCard && r.tag === 'none', 'the looks sit in the hero card, and the story blurb is gone');
    t.ok(r.who === 'Playing as a guest' && r.formHidden && r.formOpen, 'the account bar says you play as a guest; Log in opens the sign-in form');
    t.ok(r.counts.hair === 18 && r.counts.eyes === 12 && r.counts.skin === 10 && r.counts.styles === 12 && r.counts.builds === 5, 'more choices for every look ' + JSON.stringify(r.counts));
    t.ok(g.page.errors.length === 0, 'no script errors' + g.page.errors.map(e => ': ' + e).join(''));
  } finally { await g.close(); }
};
