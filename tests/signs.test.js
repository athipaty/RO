// Building keepers stand beside the door, never under the sign board
const { openGame, newRoom, wait } = require('./helpers');
module.exports = async t => {
  const A = await openGame(newRoom(), { server: 'http://127.0.0.1:9' });
  try {
    await A.ev(() => { localStorage.clear(); document.getElementById('nameIn').value = 'Sign'; document.getElementById('newBtn').click(); }); await wait(1200);
    const bad = await A.ev(() => { const out = [];
      for (const z of ['town', 'capital']) { const Zc = getZone(z);
        for (const b of Zc.buildings) { if (!b.npc) continue; const n = Zc.npcs.find(n => n.name === b.npc.name); const mid = (b.x + b.w / 2) * TILE;
          if (!n || Math.abs(n.x - mid) < TILE * 1.2) out.push(b.name); } }
      return out; });
    t.ok(bad.length === 0, 'no keeper stands under their building sign ' + JSON.stringify(bad));
    t.ok(A.page.errors.length === 0, 'no script errors' + A.page.errors.map(e => ': ' + e).join(''));
  } finally { await A.close(); }
};
