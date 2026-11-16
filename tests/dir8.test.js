// Mounts and the cart follow the hero in 8 directions (front and back views for mounts; the cart behind, or in front
// when walking up)
const { player, newRoom } = require('./helpers');
module.exports = async t => {
  const A = await player('Eight', newRoom(), { server: 'http://127.0.0.1:9' });
  try {
    const r = await A.ev(() => { const out = { mount: {}, cart: [] };
      const dirs = [[1, 0], [.7, .7], [0, 1], [-.7, .7], [-1, 0], [-.7, -.7], [0, -1], [.7, -.7]];
      const c = document.createElement('canvas'); c.width = c.height = 200; const main = ctx; ctx = c.getContext('2d');
      try {
        for (const mk of ['hopper', 'greylupe']) { out.mount[mk] = [];
          dirs.forEach(([sx, sy], i) => { const dx = sx / (2 * ISO) + sy / ISO, dy = sy / ISO - sx / (2 * ISO);
            const p = { name: 'm' + mk + i, cls: 'warden', look: lookFor('m' + i), x: 500, y: 500, face: sx < 0 ? -1 : 1, moving: true, walkT: 0, back: sy < 0, riding: mk, dead: false, eq: {} };
            for (let s = 0; s < 14; s++) { now = 60 + s * .05; p.x += dx * 4; p.y += dy * 4; drawPlayer(p, null); }
            out.mount[mk].push(p._m8); }); }
        // the cart: which direction it trails, and whether it is drawn after the hero (in front) when walking up
        dirs.forEach(([sx, sy], i) => { const dx = sx / (2 * ISO) + sy / ISO, dy = sy / ISO - sx / (2 * ISO);
          const p = { name: 'c' + i, cls: 'novice', look: lookFor('c' + i), x: 500, y: 500, face: sx < 0 ? -1 : 1, moving: true, walkT: 0, back: sy < 0, riding: null, ct: 1, dead: false, eq: {} };
          for (let s = 0; s < 14; s++) { p.x += dx * 4; p.y += dy * 4; cartHeading(p); }
          const order = [], dc = drawCart, dh = drawHuman; drawCart = function () { order.push('c'); return dc.apply(this, arguments); }; drawHuman = function () { order.push('h'); return dh.apply(this, arguments); };
          try { drawPlayer(p, null); } finally { drawCart = dc; drawHuman = dh; }
          out.cart.push(CART8.get('c' + i).d + ':' + order.join('')); }); }
      finally { ctx = main; }
      return out; });
    t.ok(r.mount.hopper.join() === '0,1,2,3,4,5,6,7' && r.mount.greylupe.join() === '0,1,2,3,4,5,6,7', `both mounts face all 8 directions (hopper ${r.mount.hopper}, lupe ${r.mount.greylupe})`);
    t.ok(r.cart.map(s => s.split(':')[0]).join() === '0,1,2,3,4,5,6,7', 'the cart trails in all 8 directions ' + r.cart.join(' '));
    t.ok(r.cart.every(s => { const [d, o] = s.split(':'); return +d >= 5 ? o.startsWith('h') : o.startsWith('c'); }), 'the cart is behind the hero, and in front when walking up the screen');
    t.ok(A.page.errors.length === 0, 'no script errors' + A.page.errors.map(e => ': ' + e).join(''));
  } finally { await A.close(); }
};
