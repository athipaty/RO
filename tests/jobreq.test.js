// v1.42.3 a Novice must learn First Aid before starting a job story with Corvin; since v1.45.4 First Aid goes to Lv 10,
// matching the Novice's 10 job levels: a new hero starts with 1 skill point and earns 9 more, exactly enough.
const { player, newRoom, wait } = require('./helpers');
module.exports = async t => {
  const g = await player('Nova', newRoom(), { server: 'http://127.0.0.1:9' });
  try {
    await wait(800);
    const fresh = await g.ev(() => ({ pts: P.skillPts, max: SKILLS.firstaid.max, flag: P.fa10 }));
    t.ok(fresh.pts === 1 && fresh.max === 10 && fresh.flag === 1, `a new hero starts with 1 skill point and First Aid goes to Lv 10 (${fresh.pts} point, max ${fresh.max})`);
    const lv = await g.ev(() => { P.jexp = 1e9; gainExp(0, 0); const r = { jl: P.jl, pts: P.skillPts }; return r; });
    t.ok(lv.jl === 10 && lv.pts === 10, `job 1 to 10 gives exactly the 10 points First Aid Lv 10 needs (${lv.pts} at job ${lv.jl})`);
    const r = await g.ev(async () => { const w = ms => new Promise(r => setTimeout(r, ms)), o = {}; P.tut = 'done'; P.jl = 10; P.skills.firstaid = 5; enterZone('town'); await w(300);
      const n = Z.npcs.find(n => n.name === 'Guildmaster Corvin'); openNpc(n); await w(150); o.note = !!panel.querySelector('.aidnote') && /5\/10/.test(panel.querySelector('.aidnote').textContent);
      PANEL_ACTS.qaccept('ws1'); o.blocked = !QS().active.ws1;
      P.skills.firstaid = 10; refreshPanel(); o.noteGone = !panel.querySelector('.aidnote'); PANEL_ACTS.qaccept('ws1'); o.started = !!QS().active.ws1; delete QS().active.ws1; closePanel(); return o; });
    t.ok(r.note && r.blocked, 'with First Aid at Lv 5 of 10, Corvin says so and no job story starts');
    t.ok(r.noteGone && r.started, 'with First Aid at Lv 10 the note is gone and the story starts');
    // a hero saved before v1.45.4 (no flag) gets the missing point once, and only once
    const old = await g.ev(async () => { const s1 = snapshot(), d = s1.p || s1; delete d.fa10; d.skillPts = 4; startWith({ ...s1, p: d }); const a = P.skillPts;
      const s2 = snapshot(); startWith(s2); return { a, b: P.skillPts, saved: (s2.p || s2).fa10 }; });
    t.ok(old.a === 5 && old.b === 5 && old.saved === 1, `an older hero gets 1 free point once, not on every load (${old.a}, then ${old.b})`);
    t.ok(g.page.errors.length === 0, 'no script errors' + g.page.errors.map(e => ': ' + e).join(''));
  } finally { await g.close(); }
};
