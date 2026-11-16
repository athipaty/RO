// Each job family attacks with its own body motion (js/hitstyle.js); the weapon passes behind the face while raised;
// the Novice's wooden club is drawn as a proper cudgel
const { player, newRoom } = require('./helpers');
module.exports = async t => {
  const A = await player('Hitter', newRoom(), { server: 'http://127.0.0.1:9' });
  try {
    const r = await A.ev(() => { const out = {};
      const pose = (cls, ph, wt) => { const w = ITEMS[Object.keys(ITEMS).find(k => ITEMS[k].wt === wt)]; return hitPose({ cls, face: 1, x: 0, y: 0, swingT: 99 }, ph, w); };
      out.novice = pose('novice', .45, 'club') === null;
      const wd = pose('warden', .5, 'axe'), cl = pose('cleric', .2, 'mace'), ar = pose('arcanist', .4, 'wand');
      out.warden = wd && wd.push > 5 && wd.lean > 0; out.cleric = cl && cl.hop > 2; out.arcanist = ar && ar.reach > 3;
      // every advanced calling has its own motion, different from its family's; masters add afterimages
      const advs = ['bulwark', 'ravager', 'runeguard', 'stormcaller', 'hexweaver', 'chronomancer', 'templar', 'oracle', 'ascetic'];
      const sig = (cls, wt) => [.15, .3, .45, .6].map(ph => { const q = pose(cls, ph, wt); return q ? [q.push, q.ang, q.hop, q.sx].map(v => Math.round(v * 10)).join(',') : 'x'; }).join('|');
      const wtOf = c => ({ warden: 'axe', arcanist: 'wand', cleric: 'mace' })[baseOf(c)];
      out.advOwn = advs.filter(c => sig(c, wtOf(c)) !== sig(baseOf(c), wtOf(c)));
      out.spin = pose('ravager', .46, 'axe').sx < -.5;
      const m = Object.keys(JOB3).find(k => JOB3[k].from === 'templar'); out.masterGhost = !!(m && pose(m, .4, 'mace').ghost) && sig(m, 'mace') === sig('templar', 'mace');
      out.bows = ['sharpshooter', 'wildstalker', 'falconer'].map(c => JSON.stringify(bowPose({ cls: c }, .3))).filter((v, i, a) => a.indexOf(v) === i).length === 3;
      // one impact effect per swing
      const n0 = fx.length, p = { cls: 'warden', face: 1, x: 100, y: 100, swingT: 5 }; hitPose(p, .7, ITEMS.axe || null); hitPose(p, .8, ITEMS.axe || null); out.fxOnce = fx.length - n0 === 1;
      // during the wind-up the weapon is drawn before the body (behind the face)
      const c = document.createElement('canvas'), main = ctx; ctx = c.getContext('2d'); const order = []; const dws = drawWeaponShape, dh = drawHuman;
      drawWeaponShape = function () { order.push('w'); return dws.apply(this, arguments); }; drawHuman = function () { order.push('b'); return dh.apply(this, arguments); };
      try { now = 50; const h = { ...P, cls: 'novice', x: 60, y: 90, face: 1, swingT: now - .2 * .3, swingDur: .3, sitting: false, riding: null, casting: null, dead: false, held: true };
        drawPlayerBody(h, 'club'); out.windupOrder = order.join(''); order.length = 0;
        h.swingT = now - .5 * .3; drawPlayerBody(h, 'club'); out.strikeOrder = order.join(''); }
      finally { drawWeaponShape = dws; drawHuman = dh; ctx = main; }
      out.club = ITEMS.club && ITEMS.club.wt === 'club';
      return out; });
    t.ok(r.novice, 'the Novice keeps the classic overhead swing');
    t.ok(r.warden && r.cleric && r.arcanist, `Warden chops stepping in, Cleric hops, Arcanist thrusts the wand (warden ${!!r.warden}, cleric ${!!r.cleric}, arcanist ${!!r.arcanist})`);
    t.ok(r.advOwn.length === 9, 'each advanced calling has its own attack motion ' + r.advOwn.join(','));
    t.ok(r.spin, 'the Ravager spins all the way round');
    t.ok(r.masterGhost, 'a master calling attacks like its advanced calling, with afterimages');
    t.ok(r.bows, 'Sharpshooter, Wildstalker and Falconer each draw the bow their own way');
    t.ok(r.fxOnce, 'the impact effect appears once per swing');
    t.ok(r.windupOrder === 'wb' && r.strikeOrder === 'bw', `the raised weapon passes behind the face, then strikes in front (wind-up ${r.windupOrder}, strike ${r.strikeOrder})`);
    t.ok(A.page.errors.length === 0, 'no script errors' + A.page.errors.map(e => ': ' + e).join(''));
  } finally { await A.close(); }
};
