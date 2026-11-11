// Stage 4: equipped body armour shows on the character, and other players see yours.
const { player, wait, newRoom } = require('./helpers');
module.exports = async t => {
  const g = await player('Armored', newRoom(), { zone: 'town', server: 'http://127.0.0.1:9' });
  try {
    await wait(1500);
    // draw the character alone on a scratch canvas in each armour and compare the torso pixels
    const r = await g.ev(() => {
      const shot = id => { const c = document.createElement('canvas'); c.width = c.height = 80; const real = ctx; ctx = c.getContext('2d');
        try { drawHuman(40, 70, '#c9b38f', '#6b4a2a', 1, 0, { outfit: 'warden', armor: id }); } finally { ctx = real; }
        return Array.from(c.getContext('2d').getImageData(20, 30, 40, 30).data); };
      const base = shot('tunic'), diff = a => { let n = 0; for (let i = 0; i < a.length; i += 4) if (Math.abs(a[i] - base[i]) + Math.abs(a[i + 1] - base[i + 1]) + Math.abs(a[i + 2] - base[i + 2]) > 40) n++; return n; };
      const out = {}; for (const id of ['vest', 'robe', 'scale', 'plate']) out[id] = diff(shot(id));
      return out; });
    t.ok(Object.values(r).every(n => n > 25), `each armour changes how the body looks (${Object.entries(r).map(([k, v]) => k + ' ' + v).join(', ')})`);
    const net = await g.ev(() => { P.eq.armor = { id: 'plate', uid: 9999, s: [null] };
      ingest({ peer: 'pal', presence: { v: 1, n: 'Pal', c: 'warden', z: zoneId, x: P.x + 40, y: P.y, lv: 30, ar: 'scale', ts: Date.now() } });
      const o = NET.others.get('pal'); const bad = (ingest({ peer: 'pal', presence: { v: 1, n: 'Pal', c: 'warden', z: zoneId, x: P.x + 40, y: P.y, lv: 30, ar: 'sword', ts: Date.now() } }), NET.others.get('pal').ar);
      const r = { got: o && 'scale', bad }; NET.others.delete('pal'); return r; });
    t.ok(net.got === 'scale' && net.bad === null, 'other players\' armour arrives with their updates (and only real armour is accepted)');
    if (process.env.SHOTS) {
      await g.ev(() => { const c = document.createElement('canvas'); c.id = 'armorShot'; c.width = 420; c.height = 110; c.style.cssText = 'position:fixed;left:0;top:0;z-index:99;background:#6aa553';
        document.body.appendChild(c); const real = ctx; ctx = c.getContext('2d'); ctx.scale(1, 1);
        ['tunic', 'vest', 'robe', 'scale', 'plate'].forEach((id, i) => drawHuman(45 + i * 80, 95, CLASSES.warden.col, '#3b2b20', 1, 0, { outfit: i % 2 ? 'ranger' : 'warden', armor: id })); ctx = real; });
      await g.page.screenshot({ path: process.env.SHOTS + '/armor.png', clip: { x: 0, y: 0, width: 420, height: 110 } });
    }
    t.ok(g.page.errors.length === 0, 'no script errors' + g.page.errors.map(e => ': ' + e).join(''));
  } finally { await g.close(); }
};
