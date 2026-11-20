// Dying ends every skill and potion buff (v1.45.4): the buff row empties and the stats they gave are gone.
const { openGame, wait, newRoom } = require('./helpers');
module.exports = async t => {
  const g = await openGame(newRoom(), { server: 'http://127.0.0.1:9' });
  try {
    await g.ev(() => { localStorage.clear(); document.getElementById('nameIn').value = 'Faller'; document.getElementById('newBtn').click(); }); await wait(2000);
    const r = await g.ev(async () => { const sl = ms => new Promise(r => setTimeout(r, ms)); enterZone('meadow'); await sl(200);
      const atk0 = computeStats().atk; buff('blessing', 'Blessing', 120, { atk: 50 }); buff('brew', 'Battle Brew', 600, { def: 20 }); P.buffs.ally = { name: 'Pack Howl', until: now + 90, b: { atk: 10 }, from: 'Bea' };
      S = computeStats(); await sl(300); const before = { n: Object.keys(P.buffs).length, atk: S.atk, row: document.querySelectorAll('#buffs .buff').length };
      P.hp = 0; die('a test'); await sl(400);
      return { before, atk0, after: Object.keys(P.buffs).length, atk: S.atk, row: document.querySelectorAll('#buffs .buff:not([data-buff="rested"])').length, log: document.getElementById('log').textContent }; });
    t.ok(r.before.n === 3 && r.before.atk > r.atk0 && r.before.row >= 3, `three buffs are up before dying (ATK ${r.atk0} → ${r.before.atk})`);
    t.ok(r.after === 0 && r.row === 0, 'dying removes every buff, skill, potion and party ones alike');
    t.ok(r.atk === r.atk0, `the stats they gave are gone (ATK back to ${r.atk})`);
    t.ok(/buffs wore off/.test(r.log), 'the log says the buffs wore off');
    t.ok(g.page.errors.length === 0, 'no script errors' + g.page.errors.map(e => ': ' + e).join(''));
  } finally { await g.close(); }
};
