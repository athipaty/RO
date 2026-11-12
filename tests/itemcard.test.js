// tapping an item picture shows its card: what it does, which monsters drop it (picture, region, chance), store and recipes
const { openGame, newRoom } = require('./helpers');
const wait = ms => new Promise(r => setTimeout(r, ms));
module.exports = async t => {
  const A = await openGame(newRoom(), { server: 'http://127.0.0.1:9' });
  try {
    await A.ev(() => { localStorage.clear(); nameIn.value = 'Carder'; newBtn.click(); }); await wait(2000);
    const r = await A.ev(async () => { const w = ms => new Promise(r => setTimeout(r, ms)); const card = () => document.getElementById('itemCard');
      openPanel('craft'); await w(200); document.querySelector('#panel .cmi[data-item]').click(); await w(150);
      const fromCraft = card() && !card().hidden, mobs = card().querySelectorAll('.icmob').length, pics = card().querySelectorAll('.icmob img').length, pct = /\d+%/.test(card().querySelector('.icpct').textContent);
      document.body.click(); await w(100); const closed = card().hidden;
      openPanel('shop'); await w(200); document.querySelector('#panel img[data-item]').click(); await w(150); const fromShop = !card().hidden && /General Store/.test(card().textContent);
      showItemCard('lupealpha_sig'); const sig = /15%/.test(card().textContent);
      document.querySelector('#hotbar') && P.bar && 0; return { fromCraft, mobs, pics, pct, closed, fromShop, sig }; });
    t.ok(r.fromCraft && r.mobs > 0 && r.pics === r.mobs && r.pct, `a craft ingredient opens its card with ${r.mobs} monsters, their pictures and drop chances`);
    t.ok(r.closed, 'tapping outside closes it');
    t.ok(r.fromShop, 'store items open their card too, with the store price');
    t.ok(r.sig, 'a sigil shows its monster and its chance');
    t.ok(A.page.errors.length === 0, 'no script errors' + A.page.errors.map(e => ': ' + e).join(''));
  } finally { await A.close(); }
};
