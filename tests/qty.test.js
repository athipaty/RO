// Choose how many: buying, selling, storing, taking and the pushcart ask how many for stacks (gear moves with one tap)
const { player, wait, newRoom } = require('./helpers');
module.exports = async t => {
  const g = await player('Qty', newRoom(), { server: 'http://127.0.0.1:9' });
  try {
    await wait(400);
    const r = await g.ev(async () => { const sleep = ms => new Promise(r => setTimeout(r, ms)), out = {};
      const pick = n => { const el = document.getElementById('qtyPick'); if (!el || el.hidden) return false; const inp = el.querySelector('input[type=number]'); inp.value = n; inp.dispatchEvent(new Event('input', { bubbles: true })); el.querySelector('[data-q="ok"]').click(); return true; };
      const btn = (a, arg) => panel.querySelector(`[data-act="${a}"][data-arg="${arg}"]`);
      enterZone('town'); await sleep(200); P.gold = 10000; const shop = Z.npcs.find(n => n.role === 'shop'); P.x = shop.x + 30; P.y = shop.y + 30; openNpc(shop);
      // buy 7 Red Tonics
      const red0 = (invFind('red') || {}).n || 0, price = ITEMS.red.price; btn('buy', 'red').click(); out.buyBox = !!document.querySelector('#qtyPick:not([hidden])');
      out.buyTotal = document.querySelector('#qtyPick .qtotal').textContent; pick(7);
      out.bought = (invFind('red') || {}).n === red0 + 7 && P.gold === 10000 - price * 7;
      // sell 3 of 10 Sap Drops
      P.inv = P.inv.filter(e => e.id !== 'sap'); giveItem('sap', 10); shopTab = 'sell'; shopCat = 'etc'; refreshPanel(); await sleep(50);
      const g0 = P.gold, si = P.inv.findIndex(e => e.id === 'sap'); btn('sell', si).click(); pick(3);
      out.sold = invFind('sap').n === 7 && P.gold === g0 + sellValue('sap') * 3;
      // one sword sells with one tap (no box)
      giveItem('sword', 1); refreshPanel(); shopCat = 'equip'; refreshPanel(); const sw = P.inv.findIndex(e => e.id === 'sword'); const g1 = P.gold; btn('sell', sw).click();
      out.gearOneTap = !document.querySelector('#qtyPick:not([hidden])') && P.gold > g1 && !P.inv.some(e => e.id === 'sword');
      closePanel();
      // store 4 of the 7 sap, then take 2 back
      openPanel('storage'); await sleep(50); btn('store', P.inv.findIndex(e => e.id === 'sap')).click(); pick(4); await sleep(100);
      const st = P.storage.find(e => e.id === 'sap'); out.stored = st && st.n === 4 && invFind('sap').n === 3;
      refreshPanel(); btn('take', P.storage.indexOf(st)).click(); pick(2); await sleep(100);
      const st2 = P.storage.find(e => e.id === 'sap'); out.taken = st2 && st2.n === 2 && invFind('sap').n === 5;
      closePanel();
      // pushcart: put 3 of 5 in, take 1 out
      P.cart = []; openPanel('cart'); await sleep(50); btn('cartin', P.inv.findIndex(e => e.id === 'sap')).click(); pick(3);
      out.cartIn = P.cart.find(e => e.id === 'sap').n === 3 && invFind('sap').n === 2;
      btn('cartout', 0).click(); pick(1); out.cartOut = P.cart.find(e => e.id === 'sap').n === 2 && invFind('sap').n === 3;
      // cancel does nothing
      btn('cartout', 0).click(); document.querySelector('#qtyPick [data-q="cancel"]').click(); out.cancel = P.cart.find(e => e.id === 'sap').n === 2;
      closePanel(); return out; });
    t.ok(r.buyBox && /Total: [\d,]+ gold/.test(r.buyTotal), 'Buy asks how many and shows the total (' + r.buyTotal + ')');
    t.ok(r.bought, 'buying 7 gives 7 and takes 7 prices');
    t.ok(r.sold, 'selling 3 of a stack of 10 leaves 7 and pays for 3');
    t.ok(r.gearOneTap, 'a single piece of gear still sells with one tap');
    t.ok(r.stored && r.taken, 'storage takes part of a stack and gives part back');
    t.ok(r.cartIn && r.cartOut, 'the pushcart takes part of a stack and gives part back');
    t.ok(r.cancel, 'Cancel leaves everything as it was');
    t.ok(g.page.errors.length === 0, 'no script errors' + g.page.errors.map(e => ': ' + e).join(''));
  } finally { await g.close(); }
};
