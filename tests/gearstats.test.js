// v1.60.7: gear always shows its stats and abilities, then its description. Boss relics used to show only
// "Boss relic: dropped only by ..." with no ATK, DEF or bonuses.
const { player, wait, newRoom } = require('./helpers');
module.exports = async t => {
  const g = await player('Stats', newRoom(), { server: 'http://127.0.0.1:9' });
  try {
    await wait(600);
    const r = await g.ev(() => { const gear = ['weapon', 'armor', 'head', 'accessory', 'face', 'mouth', 'shoes'], miss = [];
      const ids = new Set(); for (const m of Object.values(MOBS)) if (m.boss) for (const [id] of [...(m.drops || []), ...(m.mvp || [])]) ids.add(id);
      let n = 0; for (const id of ids) { const it = ITEMS[id]; if (!it || !gear.includes(it.type)) continue; n++; const s = itemDesc({ id, s: [] });
        if ((it.atk && !s.includes('ATK ' + it.atk)) || (it.def && !s.includes('DEF ' + it.def)) || (it.matk && !s.includes('MATK ' + it.matk))) miss.push(it.name); }
      const shell = itemDesc({ id: 'scarabshell', s: [] }), eye = itemDesc({ id: 'krakeneye', s: [] }), crown = itemDesc({ id: 'moltencrown', s: [] });
      return { n, miss, shell, eye, crown }; });
    t.ok(r.n > 30 && !r.miss.length, `every boss gear drop shows its ATK / DEF / MATK (${r.n} checked${r.miss.length ? ', missing: ' + r.miss.join(', ') : ''})`);
    t.ok(/^DEF 52 · VIT \+3 .*Boss relic: dropped only by Scarab Queen/.test(r.shell), 'a boss relic shows its stats, then where it comes from: ' + r.shell);
    t.ok((r.eye.match(/INT \+/g) || []).length === 1 && /Dropped by the Kraken Matron\.$/.test(r.eye), 'stats written in the description are not repeated: ' + r.eye);
    t.ok(/All stats \+3/.test(r.crown) && !/STR \+3/.test(r.crown), 'six equal stats read "All stats": ' + r.crown);
    t.ok(g.page.errors.length === 0, 'no script errors' + g.page.errors.map(e => ': ' + e).join(''));
  } finally { await g.close(); }
};
