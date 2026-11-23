// v1.53.0: shoes and a second accessory slot, shoe sigils, and a cap on how far sigil abilities stack.
const { player, wait, newRoom } = require('./helpers');

module.exports = async t => {
  const A = await player('Strider', newRoom(), { server: 'http://127.0.0.1:9' });
  try {
    await wait(2000);
    const r = await A.ev(() => { const o = {}; P.lv = 30; S = computeStats(); const s0 = { def: S.def, speed: S.speed };
      giveItem('windstep', 1); useInv(P.inv.findIndex(e => e.id === 'windstep')); S = computeStats();
      o.shoes = P.eq.shoes && P.eq.shoes.id; o.def = S.def - s0.def; o.speed = S.speed - s0.speed;
      // two accessories, not the same one twice
      giveItem('ring', 2); giveItem('charm', 1);
      useInv(P.inv.findIndex(e => e.id === 'ring')); useInv(P.inv.findIndex(e => e.id === 'charm'));
      o.acc = [P.eq.accessory && P.eq.accessory.id, P.eq.acc2 && P.eq.acc2.id];
      const rings = P.inv.filter(e => e.id === 'ring').length; useInv(P.inv.findIndex(e => e.id === 'ring')); o.twice = P.inv.filter(e => e.id === 'ring').length === rings;
      o.told = /You already wear a/.test(document.getElementById('log').textContent);
      unequip('acc2'); o.off = !P.eq.acc2 && P.inv.some(e => e.id === 'charm');
      // the equipment window and the smith know the new slots
      openPanel('equip'); o.slots = [...document.querySelectorAll('#panel .eqk')].map(x => x.textContent); closePanel();
      // a shoe sigil goes into shoes
      P.eq.shoes.s = [null]; giveItem('hopper_sig', 1); useInv(P.inv.findIndex(e => e.id === 'hopper_sig')); o.sockOpts = document.querySelectorAll('.sockopt').length; closePanel();
      o.sigKind = ITEMS.hopper_sig.kind;
      // abilities stack only so far
      P.eq.acc2 = { id: 'ring', s: ['cavebat_sig', 'cavebat_sig'] }; P.eq.accessory = { id: 'charm', s: ['cavebat_sig'] }; P.eq.weapon = { id: 'dagger', s: ['cavebat_sig', 'cavebat_sig', 'cavebat_sig', 'cavebat_sig'] };
      S = computeStats(); o.leech = SFX.leech; P.eq.acc2 = null; P.eq.accessory = null; P.eq.weapon = null; S = computeStats();
      o.shop = SHOP.includes('windstep') && ROYAL_SHOP.includes('sunstep'); o.drop = MOBS.hopper.drops.some(d => d[0] === 'hopperhops');
      o.relic = MOBS.antlerking.drops.some(d => d[0] === 'antlerstride') && rarityOf('antlerstride') === 4;
      return o; });
    t.ok(r.shoes === 'windstep' && r.def > 0 && r.speed > 0, `shoes go on the new slot and add DEF and speed (+${r.def} DEF, +${r.speed} speed)`);
    t.ok(r.acc[0] === 'ring' && r.acc[1] === 'charm', 'a second accessory fills the second accessory slot ' + JSON.stringify(r.acc));
    t.ok(r.twice && r.told, 'the same accessory cannot be worn twice, and you are told');
    t.ok(r.off, 'the second accessory comes off like any other piece');
    t.ok(r.slots.includes('shoes') && r.slots.includes('accessory II') && r.slots.length === 8, 'the Equipment window has 8 slots: ' + r.slots.join(', '));
    t.ok(r.sigKind === 'shoes' && r.sockOpts >= 1, 'a shoe sigil can be socketed into shoes');
    t.ok(r.leech === 8, `sigil abilities stack only so far (life steal from seven sigils: ${r.leech}%)`);
    t.ok(r.shop && r.drop && r.relic, 'shoes are sold, dropped by monsters, and the Elder Antlerking drops relic boots');
    t.ok(/sh:P\.eq\.shoes/.test(require('fs').readFileSync(require('path').join(__dirname, '..', 'js', 'net.js'), 'utf8')), 'other players are sent your shoes');
    t.ok(A.page.errors.length === 0, 'no script errors' + A.page.errors.map(e => ': ' + e).join(''));
  } finally { await A.close(); }
};
