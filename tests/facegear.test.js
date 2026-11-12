// #3 face and mouth gear: new slots, sold by Ilsa, drawn on the hero, seen by others, saved, stats count.
const { player, wait, newRoom } = require('./helpers');
const poll = async (g, fn, ms = 8000) => { const end = Date.now() + ms; while (Date.now() < end) { if (await g.ev(fn)) return true; await wait(200); } return false; };
module.exports = async t => {
  const room = newRoom(), OFFLINE = 'http://127.0.0.1:9';
  const A = await player('Specs', room, { server: OFFLINE });
  await wait(1500);
  const B = await player('Watcher', room, { server: OFFLINE });
  try {
    t.ok(await poll(A, () => NET.others.size === 1), 'two players see each other');
    const shop = await A.ev(() => ['roundspecs', 'sunshades', 'grassstalk', 'trailscarf'].every(id => SHOP.includes(id)));
    t.ok(shop, 'Ilsa sells glasses, shades, a grass stalk and a scarf');
    const eq = await A.ev(() => { P.lv = 30; const d0 = (S = computeStats()).dex; giveItem('roundspecs'); giveItem('trailscarf');
      useInv(P.inv.findIndex(e => e.id === 'roundspecs')); useInv(P.inv.findIndex(e => e.id === 'trailscarf')); S = computeStats();
      return { face: P.eq.face && P.eq.face.id, mouth: P.eq.mouth && P.eq.mouth.id, d0, d1: S.dex, hp: S.maxhp }; });
    t.ok(eq.face === 'roundspecs' && eq.mouth === 'trailscarf', 'face and mouth items go in their own slots (the hat stays on)');
    t.ok(eq.d1 === eq.d0 + 1, 'their bonuses count (DEX +1 from the spectacles)');
    const win = await A.ev(() => { openPanel('equip'); const tx = panel.textContent; closePanel(); return /face/.test(tx) && /mouth/.test(tx) && /Round Spectacles/.test(tx); });
    t.ok(win, 'the Equipment window shows the Face and Mouth slots');
    const drawn = await A.ev(async () => { let n = 0; const o = drawFaceGear; drawFaceGear = (...a) => { if (a[0] === 'roundspecs' && a[1] === 'trailscarf') n++; return o(...a); }; await new Promise(r => setTimeout(r, 500)); drawFaceGear = o; return n; });
    t.ok(drawn > 2, 'they are drawn on your hero');
    t.ok(await poll(B, () => { const o = [...NET.others.values()][0]; return o && o.fc === 'roundspecs' && o.mo === 'trailscarf'; }), 'other players get them in your presence');
    const seen = await B.ev(async () => { let n = 0; const o = drawFaceGear; drawFaceGear = (...a) => { if (a[0] === 'roundspecs') n++; return o(...a); }; await new Promise(r => setTimeout(r, 600)); drawFaceGear = o; return n; });
    t.ok(seen > 1, 'and see them on your character');
    t.ok(await A.ev(() => { save(); const s = JSON.parse(localStorage.getItem(SAVE_KEY)).p; return s.eq.face.id === 'roundspecs' && s.eq.mouth.id === 'trailscarf'; }), 'saved with your character');
    t.ok(await A.ev(() => { unequip('face'); return !P.eq.face && P.inv.some(e => e.id === 'roundspecs'); }), 'Remove puts them back in the bag');
    t.ok(await A.ev(() => itemIconURL('sunshades').length > 200 && itemIconURL('grassstalk').length > 200), 'they have icons');
    t.ok(A.page.errors.length === 0 && B.page.errors.length === 0, 'no script errors' + [...A.page.errors, ...B.page.errors].map(e => ': ' + e).join(''));
    if (process.env.SHOTS) { await A.ev(() => { useInv(P.inv.findIndex(e => e.id === 'roundspecs')); openPanel('equip'); }); await wait(800); await A.page.screenshot({ path: process.env.SHOTS + '/facegear.png' }); }
  } finally { await A.close(); await B.close(); }
};
