// Pushcart: rent it from a storage keeper, a second load usable anywhere, drawn behind you and seen by others.
const { player, wait, newRoom } = require('./helpers');
const Q = 'window.__q=(s)=>{const e=panel.querySelector(s);if(!e)throw new Error("missing "+s+" in "+panelKind+": "+panel.textContent.slice(0,300));return e;}';

module.exports = async t => {
  const g = await player('Hauler', newRoom(), { server: 'http://127.0.0.1:9' });
  try {
    await wait(500); await g.page.evaluate(Q);
    const rent = await g.ev(() => { P.gold = 5000; openPanel('storage'); const offer = !!panel.querySelector('[data-act="cartrent"]'); panel.querySelector('[data-act="cartrent"]').click();
      const after = !!panel.querySelector('[data-act="opencart"]'); closePanel(); return { offer, after, gold: P.gold, cart: Array.isArray(P.cart) }; });
    t.ok(rent.offer && rent.after && rent.cart && rent.gold === 2500, 'Wenna rents a pushcart for 2,500 gold, once');
    const mv = await g.ev(() => { P.inv.push({ id: 'pelt', n: 40 }); const w0 = carryWeight(); openPanel('items'); const btn = !!panel.querySelector('.cartbtn [data-act="opencart"]');
      openPanel('cart'); const i = P.inv.findIndex(e => e.id === 'pelt'); __q(`[data-act="cartin"][data-arg="${i}"]`).click();
      const inCart = P.cart.some(e => e.id === 'pelt' && e.n === 40), w1 = carryWeight(); P.inv.push({ id: 'pelt', n: 5 }); refreshPanel(); const j = P.inv.findIndex(e => e.id === 'pelt'); __q(`[data-act="cartin"][data-arg="${j}"]`).click();
      const stacked = P.cart.filter(e => e.id === 'pelt').length === 1 && P.cart.find(e => e.id === 'pelt').n === 45;
      __q('[data-act="cartout"][data-arg="0"]').click(); const back = (invFind('pelt') || {}).n === 45 && !P.cart.length; closePanel();
      return { btn, inCart, lighter: w1 < w0, stacked, back }; });
    t.ok(mv.btn, 'the Items window has a Cart button once you own one');
    t.ok(mv.inCart && mv.lighter && mv.stacked, 'items put in the cart leave your bag weight, and stacks merge');
    t.ok(mv.back, 'and come back out into the bag');
    const lim = await g.ev(() => { P.cart = []; for (let i = 0; i < 100; i++) P.cart.push({ id: 'club', uid: 9000 + i, s: [] }); const ok = cartPut({ id: 'spiked', uid: 9999, s: [] }); const n = P.cart.length; P.cart = [];
      const heavy = cartPut({ id: 'pelt', n: 100000 }); return { full: !ok && n === 100, heavy: !heavy }; });
    t.ok(lim.full && lim.heavy, 'the cart has its own limits: 100 stacks and 8,000 weight');
    // drawn behind you, sent to others, saved
    const dr = await g.ev(() => { let drawn = 0; const o = drawCart; drawCart = function () { drawn++; return o.apply(this, arguments); }; render(); drawCart = o;
      return { drawn, pres: cartPresence() }; });
    t.ok(dr.drawn >= 1 && dr.pres, 'the cart is drawn behind you and other players are told about it');
    t.ok(await g.ev(() => { ingest({ peer: 'cartpal', presence: { v: 1, n: 'Pal', c: 'novice', z: zoneId, x: P.x + 40, y: P.y, f: 1, lv: 5, ct: 1, ts: Date.now() } }); const o = NET.others.get('cartpal'); const ok = o && o.ct; NET.others.delete('cartpal'); return ok; }),
      'other players with a cart are drawn with it');
    t.ok(await g.ev(() => { P.cart = [{ id: 'red', n: 3 }]; save(true); return JSON.parse(localStorage.getItem('embervale.save.v1')).p.cart[0].n === 3; }), 'the cart and what is in it are saved with the hero');
    t.ok(await g.ev(() => { chatCommand('cart', ''); const ok = panelKind === 'cart'; closePanel(); return ok; }), '/cart opens it');
    t.ok(g.page.errors.length === 0, 'no script errors' + g.page.errors.map(e => ': ' + e).join(''));
  } finally { await g.close(); }
};
