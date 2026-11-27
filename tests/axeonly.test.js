// v1.87.0: axes are the Forgehand's (js/axeonly.js): the Warden family keeps swords and clubs, the Forgehand family
// keeps axes; a Warden holding an axe gets it back in the bag; Sundering Blow favours swords; Earthsplitter fights with
// a greatsword; the two axe bosses also drop a sword.
const { player, newRoom, wait } = require('./helpers');
module.exports = async t => {
  const g = await player('Axeless', newRoom(), { server: 'http://127.0.0.1:9' });
  try {
    await wait(2000);
    const r = await g.ev(async () => {
      const w = ms => new Promise(r => setTimeout(r, ms));
      const fam = Object.keys(CLASSES).filter(id => baseOf(id) === 'warden'), forge = Object.keys(CLASSES).filter(id => baseOf(id) === 'forgehand');
      const out = { fam: fam.length, wardenAxe: fam.filter(id => CLASSES[id].weapons.includes('axe')), wardenSword: fam.every(id => CLASSES[id].weapons.includes('sword')),
        forge: forge.length, forgeAxe: forge.every(id => CLASSES[id].weapons.includes('axe')) };
      // a Warden holding an axe from an old save
      P.tut = 'done'; P.cls = 'ravager'; P.lv = 50; P.jl = 30; P.eq.weapon = { id: 'axe', uid: 4401, s: [] }; S = computeStats(); const n0 = P.inv.length;
      await w(1300);
      out.moved = !P.eq.weapon && P.inv.length === n0 + 1 && P.inv[P.inv.length - 1].uid === 4401;
      out.cannot = typeof canEquip === 'function' ? null : null;
      // Sundering Blow and Earthsplitter
      out.sunder = /Swords hit 25% harder/.test(SKILLS.sunder.desc(5));
      const b = BUILDS.find(x => x.id === 'axe'); out.build = b.gear.includes('splitblade') && ITEMS.splitblade.wt === 'sword' && /sword/.test(b.desc);
      out.relics = MOBS.warlord.drops.some(d => d[0] === 'warblade') && MOBS.cinderwyrm.drops.some(d => d[0] === 'wyrmblade') && ITEMS.wyrmblade.atk === ITEMS.wyrmaxe.atk && ITEMS.warblade.wt === 'sword';
      // a Forgehand still holds its axe
      P.cls = 'forgehand'; P.eq.weapon = { id: 'axe', uid: 4402, s: [] }; S = computeStats(); await w(1300); out.forgeKeeps = !!P.eq.weapon && P.eq.weapon.uid === 4402;
      return out; });
    t.ok(r.fam >= 5 && !r.wardenAxe.length && r.wardenSword, `the whole Warden family (${r.fam} jobs) uses swords, none of them axes (${r.wardenAxe.join(',')})`);
    t.ok(r.forge >= 5 && r.forgeAxe && r.forgeKeeps, `the Forgehand family (${r.forge} jobs) keeps its axes`);
    t.ok(r.moved, 'a Warden holding an axe from an old save gets it back in the bag');
    t.ok(r.sunder && r.build, 'Sundering Blow favours swords; Earthsplitter fights with the Earthsplitter Greatsword');
    t.ok(r.relics, 'the Ashen Warlord and the Cinder Wyrm also drop a sword as strong as their axe');
    t.ok(!g.page.errors.length, 'no script errors ' + g.page.errors.slice(0, 3).join(' | '));
  } finally { await g.close(); }
};
