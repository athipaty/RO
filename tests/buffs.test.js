// Buff row in the status box: every active buff with a countdown, including ones a party member cast on you.
const { player, wait, newRoom } = require('./helpers');
module.exports = async t => {
  const g = await player('Buffed', newRoom(), { zone: 'meadow', server: 'http://127.0.0.1:9' });
  try {
    await wait(1500);
    const r = await g.ev(async () => { const w = ms => new Promise(r => setTimeout(r, ms));
      const empty = document.getElementById('buffs').hidden;
      buff('ironwill', 'Iron Will', 60, { def: 4 }); await w(150);
      // a party member casts Blessing on us (as it arrives over the network)
      const o = { peer: 'pal', n: 'Pal', cls: 'cleric', lv: 20, z: zoneId, x: P.x + 40, y: P.y, rx: P.x + 40, ry: P.y };
      NET.others.set('pal', o); SOC.party = { id: 'p', leader: 'pal', mode: 'share', members: [{ peer: 'pal', name: 'Pal' }, { peer: 'me', name: 'Buffed' }] };
      supportRecv(o, [{ i: 1, k: 'blessing', to: NET.myId, l: 5 }], false); await w(150);
      const chips = [...document.querySelectorAll('#buffs .buff')].map(c => ({ tip: c.title, txt: c.textContent, given: c.classList.contains('given'), img: !!c.querySelector('img') }));
      const t0 = chips.find(c => /Blessing/.test(c.tip))?.txt;
      P.buffs.blessing.until = now + 3.2; await w(400); const ending = document.querySelector('#buffs .buff.ending') !== null;
      hudMini(true, true); await w(50); const mini = getComputedStyle(document.getElementById('buffs')).display !== 'none'; hudMini(false, true);
      P.buffs.blessing.until = now - 1; P.buffs.ironwill.until = now - 1; await w(400);
      const gone = document.getElementById('buffs').hidden;
      P.rested = Date.now() + 5 * 60000; await w(150); const rest = document.querySelector('#buffs .buff')?.title || '';
      NET.others.delete('pal'); SOC.party = null; return { empty, chips, t0, ending, mini, gone, rest }; });
    t.ok(r.empty, 'with no buffs the row is hidden');
    const iw = r.chips.find(c => /Iron Will/.test(c.tip)), bl = r.chips.find(c => /Blessing/.test(c.tip));
    t.ok(iw && iw.img && /^(60s|1:00|59s)$/.test(iw.txt), `your own buff shows its picture and countdown (${iw && iw.txt})`);
    t.ok(bl && bl.given && /from Pal/.test(bl.tip) && /^(2:00|1:59)$/.test(r.t0), `a buff from a party member shows too, with who cast it (${r.t0})`);
    t.ok(r.ending, 'it blinks in the last 5 seconds');
    t.ok(r.mini, 'buffs stay visible when the status box is folded');
    t.ok(r.gone, 'expired buffs disappear');
    const pb = await g.ev(async () => { const w = ms => new Promise(r => setTimeout(r, ms));
      SOC.party = { id: 'p', leader: 'me', mode: 'share', members: [{ peer: 'me', name: 'Buffed' }, { peer: 'x', name: 'Pal' }] }; renderParty(); await w(100);
      buff('ironwill', 'Iron Will', 60, { def: 4 }); await w(200);
      const hud = document.getElementById('hud').getBoundingClientRect(), box = document.getElementById('partyBox');
      const r = box ? box.getBoundingClientRect().top >= hud.bottom - 1 : null; P.buffs.ironwill.until = now - 1; SOC.party = null; renderParty(); return r; });
    t.ok(pb === true, 'the party box moves down when buffs appear, so it does not cover the status box');
    t.ok(/Well rested/.test(r.rest), 'Well rested from the inn shows as well');
    if (process.env.SHOTS) { await g.ev(() => { buff('ironwill', 'Iron Will', 60, { def: 4 }); buff('blessing', 'Blessing', 120, { str: 1 }); P.buffs.blessing.from = 'Pal'; }); await wait(300); await g.page.screenshot({ path: process.env.SHOTS + '/buffs.png', clip: { x: 0, y: 0, width: 300, height: 260 } }); }
    t.ok(g.page.errors.length === 0, 'no script errors' + g.page.errors.map(e => ': ' + e).join(''));
  } finally { await g.close(); }
};
