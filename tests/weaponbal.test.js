// v1.92.0: one ATK curve for every weapon type (js/weaponbal.js), and the master jobs' balance lives in their own skills
const { player, wait, newRoom } = require('./helpers');
module.exports = async t => {
  const g = await player('Wbal', newRoom(), { zone: 'meadow', server: 'http://127.0.0.1:9' });
  try {
    await wait(1200);
    const r = await g.ev(() => ({ table: WEAPON_ATK, atk: Object.fromEntries(Object.keys(WEAPON_ATK).map(id => [id, ITEMS[id].atk])),
      boss: ITEMS.wyrmblade.atk, early: ITEMS.longbow.atk, fang: ITEMS.salafang.atk, blade: ITEMS.pyreblade.atk, maul: ITEMS.magmamaul.atk,
      card: itemDesc({ id: 'salafang', s: [] }), job: typeof JOB_DMG, fh: SKILLS.forgeheart.desc(10), ve: SKILLS.virulence.desc(10) }));
    t.ok(Object.keys(r.table).every(id => r.atk[id] === r.table[id]), 'every weapon in the table fights with its new ATK');
    t.ok(r.boss === 450 && r.early === 76, 'boss weapons and early weapons keep their numbers');
    t.ok(r.fang >= r.blade * .95 && r.maul > 238, `daggers stand with swords (${r.fang} vs ${r.blade}) and maces are stronger (${r.maul})`);
    t.ok(/ATK 336/.test(r.card), 'the item card shows the new ATK');
    t.ok(r.job === 'undefined' && /\+10% ATK/.test(r.fh) && /\+40% ATK/.test(r.ve), 'no hidden job multiplier; the skills say what they give');
    t.ok(!g.page.errors.length, 'no script errors');
  } finally { await g.close(); }
};
