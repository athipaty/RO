// v1.52.3: quest rewards only list what the hero can still use: no EXP at base level 99, no job EXP at the job's top level.
const { player, wait, newRoom } = require('./helpers');

module.exports = async t => {
  const A = await player('Maxed', newRoom(), { server: 'http://127.0.0.1:9' });
  try {
    await wait(2000);
    const r = await A.ev(() => {
      const id = Object.keys(QUESTS).find(k => QUESTS[k].reward && QUESTS[k].reward.exp && QUESTS[k].reward.jexp && QUESTS[k].reward.gold);
      const text = () => { const d = document.createElement('div'); d.innerHTML = questBox(id); return d.querySelector('.qrew').textContent; };
      const keep = { lv: P.lv, jl: P.jl };
      const fresh = text();
      P.jl = jobMax(P.cls); const jobTop = text();
      P.lv = 99; const maxed = text();
      // the daily quest list too
      let daily = ''; if (typeof PANELS.quests === 'function') { const d = document.createElement('div'); d.innerHTML = PANELS.quests(); daily = [...d.querySelectorAll('.qrew')].map(x => x.textContent).join(' | '); }
      Object.assign(P, keep); return { fresh, jobTop, maxed, daily };
    });
    t.ok(/EXP/.test(r.fresh) && /job EXP/.test(r.fresh) && /gold/.test(r.fresh), 'a new hero sees EXP, job EXP and gold: ' + r.fresh);
    t.ok(/\d EXP/.test(r.jobTop) && !/job EXP/.test(r.jobTop), 'at the job\'s top level the job EXP is not offered: ' + r.jobTop);
    t.ok(!/EXP/.test(r.maxed) && /gold/.test(r.maxed), 'at level 99 with the job at its top, only gold and items: ' + r.maxed);
    t.ok(!/EXP/.test(r.daily), 'the daily quest list leaves EXP out too: ' + r.daily.slice(0, 120));
    t.ok(A.page.errors.length === 0, 'no script errors' + A.page.errors.map(e => ': ' + e).join(''));
  } finally { await A.close(); }
};
