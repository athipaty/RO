// sigils: Socket opens a picker of every piece of gear the sigil fits (worn and in the bag); nothing happens until OK
const { player, newRoom } = require('./helpers');
module.exports = async t => {
  const g = await player('Socketer', newRoom());
  try {
    const r = await g.ev(() => {
      giveItem('vest'); giveItem('scale'); const v = P.inv.find(e => e.id === 'vest'); P.inv.splice(P.inv.indexOf(v), 1); P.eq.armor = v;
      P.inv.find(e => e.id === 'scale').s = [null, null]; giveItem('mossbug_sig'); giveItem('scarab_sig'); giveItem('hopper_sig');
      useInv(P.inv.findIndex(e => e.id === 'mossbug_sig'));
      const opts = [...document.querySelectorAll('.sockopt')].map(b => b.textContent);
      const okOff = document.querySelector('[data-act=sockok]').disabled, before = JSON.stringify(P.eq.armor.s);
      document.querySelectorAll('.sockopt')[1].click(); document.querySelector('[data-act=sockok]').click();
      const intoBag = P.inv.find(e => e.id === 'scale').s[0], gone = !invFind('mossbug_sig');
      useInv(P.inv.findIndex(e => e.id === 'scarab_sig')); document.querySelector('[data-act=sockcancel]').click(); const kept = !!invFind('scarab_sig');
      useInv(P.inv.findIndex(e => e.id === 'scarab_sig')); document.querySelector('.sockopt').click(); const def0 = S.def; document.querySelector('[data-act=sockok]').click();
      useInv(P.inv.findIndex(e => e.id === 'hopper_sig')); const none = document.querySelectorAll('.sockopt').length, msg = panel.textContent.includes('no accessory with sigil slots');
      return { kind: panelKind, opts, okOff, before, intoBag, gone, kept, worn: P.eq.armor.s[0], defUp: S.def > def0, none, msg };
    });
    t.ok(r.opts.length === 2 && /Worn/.test(r.opts[0]) && /In bag/.test(r.opts[1]), 'the picker lists the worn armour and the spare in the bag');
    t.ok(r.okOff && r.before === '[null]', 'OK stays off and nothing is socketed until gear is picked');
    t.ok(r.intoBag === 'mossbug_sig' && r.gone, 'picking the spare and pressing OK sockets the sigil into it');
    t.ok(r.kept, 'Cancel keeps the sigil in the bag');
    t.ok(r.worn === 'scarab_sig' && r.defUp, 'socketing into worn armour raises DEF at once');
    t.ok(r.none === 0 && r.msg, 'with no fitting gear the picker says so');
    t.ok(g.page.errors.length === 0, 'no script errors' + g.page.errors.map(e => ': ' + e).join(''));
  } finally { await g.close(); }
};
