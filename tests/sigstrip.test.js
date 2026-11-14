// The Equip window (and gear in the Items window) shows each sigil slot as a picture; tapping a socketed sigil opens its card
const { openGame, newRoom, wait } = require('./helpers');
module.exports = async t => {
  const A = await openGame(newRoom(), { server: 'http://127.0.0.1:9' });
  try {
    await A.ev(() => { localStorage.clear(); document.getElementById('nameIn').value = 'Sig'; document.getElementById('newBtn').click(); }); await wait(1500);
    const r = await A.ev(async () => {
      const sleep = ms => new Promise(r => setTimeout(r, ms));
      P.eq.weapon.s = ['sproutling_sig', null]; P.cls = 'warden'; giveItem('sword', 1); const spare = P.inv.find(e => e.id === 'sword'); if (spare) spare.s = [null, 'hopper_sig'];
      openPanel('equip'); await sleep(200);
      const box = [...document.querySelectorAll('#panel .eqslot')].find(b => b.querySelector('.sigstrip'));
      const full = box ? box.querySelectorAll('.sigslot.full').length : -1, empty = box ? box.querySelectorAll('.sigslot:not(.full)').length : -1;
      const slotText = box ? /Slots:/.test(box.textContent) : true;
      box.querySelector('.sigslot.full').click(); await sleep(150);
      const card = document.getElementById('itemCard'), cardOk = card && !card.hidden && card.textContent.includes(ITEMS.sproutling_sig.name);
      hideItemCard(); invTab = 'equip'; openPanel('items'); await sleep(200);
      const bag = !!document.querySelector('#panel .sigslot.full[data-item="hopper_sig"]');
      return { full, empty, slotText, cardOk, bag };
    });
    t.ok(r.full === 1 && r.empty === 1, 'the equipped weapon shows one sigil picture and one empty slot ' + JSON.stringify(r));
    t.ok(!r.slotText, 'the slots are pictures, not the "Slots:" text');
    t.ok(r.cardOk, 'tapping the sigil opens its card');
    t.ok(r.bag, 'gear in the bag shows its sigils as pictures too');
    t.ok(A.page.errors.length === 0, 'no script errors' + A.page.errors.map(e => ': ' + e).join(''));
  } finally { await A.close(); }
};
