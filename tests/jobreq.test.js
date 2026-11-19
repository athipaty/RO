// v1.42.3 a Novice must learn First Aid to Lv 5 before starting a job story with Corvin
const { player, newRoom, wait } = require('./helpers');
module.exports = async t => {
  const g = await player('Nova', newRoom(), { server: 'http://127.0.0.1:9' });
  try {
    await wait(800);
    const r = await g.ev(async () => { const w = ms => new Promise(r => setTimeout(r, ms)), o = {}; P.tut = 'done'; P.jl = 10; P.skills.firstaid = 2; enterZone('town'); await w(300);
      const n = Z.npcs.find(n => n.name === 'Guildmaster Corvin'); openNpc(n); await w(150); o.note = !!panel.querySelector('.aidnote');
      PANEL_ACTS.qaccept('ws1'); o.blocked = !QS().active.ws1;
      P.skills.firstaid = 5; refreshPanel(); o.noteGone = !panel.querySelector('.aidnote'); PANEL_ACTS.qaccept('ws1'); o.started = !!QS().active.ws1; delete QS().active.ws1; closePanel(); return o; });
    t.ok(r.note && r.blocked, 'with First Aid below Lv 5, Corvin says so and no job story starts');
    t.ok(r.noteGone && r.started, 'with First Aid at Lv 5 the note is gone and the story starts');
    t.ok(g.page.errors.length === 0, 'no script errors' + g.page.errors.map(e => ': ' + e).join(''));
  } finally { await g.close(); }
};
