// Every weapon has its own look (js/weaponart.js) and draws without errors at any angle; the grip stays at the hand
const { player, newRoom } = require('./helpers');
module.exports = async t => {
  const A = await player('Arms', newRoom(), { server: 'http://127.0.0.1:9' });
  try {
    const r = await A.ev(() => { const out = { bad: [], missing: [] };
      const ids = Object.keys(ITEMS).filter(k => ITEMS[k].type === 'weapon' && ITEMS[k].wt && ITEMS[k].wt !== 'none');
      for (const id of ids) if (!(WA[id] || (ITEMS[id].wt === 'bow' && WA_BOW[id]) || id === 'club')) out.missing.push(id);
      const c = document.createElement('canvas'); c.width = c.height = 100; const main = ctx; ctx = c.getContext('2d');
      try { for (const id of ids) for (const ang of [-1.6, 0, .6, 2.4]) { ctx.setTransform(1, 0, 0, 1, 50, 60); try { drawWeaponShape(ITEMS[id], ang); } catch (e) { out.bad.push(id + ': ' + e.message); } }
        // the bow being drawn for a shot uses the bow's own look and reports its tips for the string
        ctx.setTransform(1, 0, 0, 1, 50, 60); const tips = bowLimbsArt(ITEMS.longbow || ITEMS.bow, 14, 1.25); out.tips = tips && tips.ty > 10;
        // the grip is drawn at the hand: pixels right at the origin are painted for a sword
        ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, 100, 100); ctx.setTransform(1, 0, 0, 1, 50, 60); drawWeaponShape(ITEMS.sword, 0);
        out.grip = ctx.getImageData(50, 60, 1, 1).data[3] > 0; }
      finally { ctx = main; }
      out.n = ids.length; return out; });
    t.ok(r.missing.length === 0, `all ${r.n} weapons have their own look ` + r.missing.join(','));
    t.ok(r.bad.length === 0, 'every weapon draws at any angle without errors ' + r.bad.slice(0, 3).join(' | '));
    t.ok(r.tips, 'the bow in a shot uses the bow\'s own look and its real tips');
    t.ok(r.grip, 'the grip sits where the hand holds it');
    t.ok(A.page.errors.length === 0, 'no script errors' + A.page.errors.map(e => ': ' + e).join(''));
  } finally { await A.close(); }
};
