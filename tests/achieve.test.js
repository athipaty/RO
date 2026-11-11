// #58 achievements and titles: goals track themselves, pay gold and unlock titles; a worn title shows under
// your name for everyone.
const { player, wait, newRoom } = require('./helpers');
const poll = async (g, fn, arg, ms = 8000) => { const end = Date.now() + ms; while (Date.now() < end) { if (await g.ev(fn, arg)) return true; await wait(250); } return false; };

module.exports = async t => {
  const room = newRoom(), OFFLINE = 'http://127.0.0.1:9';
  const A = await player('Champ', room, { zone: 'meadow', server: OFFLINE });
  await wait(1500);
  const B = await player('Fan', room, { zone: 'meadow', server: OFFLINE });
  try {
    t.ok(await poll(A, () => NET.others.size === 1), 'two players see each other');
    const first = await A.ev(() => { const g0 = P.gold; const m = mobs.find(m => !m.dead && m.d.id === 'sproutling'); m.myDmg = 1; killMob(m); achCheck();
      return { got: !!P.ach.got.kill1, gold: P.gold - g0, toast: document.getElementById('achToast').classList.contains('show'), log: /Achievement: First Steps/.test(document.getElementById('log').textContent) }; });
    t.ok(first.got && first.toast && first.log && first.gold >= 50, 'defeating a first monster earns "First Steps", a toast and 50 gold');
    t.ok(await A.ev(() => P.ach.c.kills === 1 && P.ach.kk.sproutling === 1), 'kills are counted, also by kind');
    const prog = await A.ev(() => { openPanel('ach'); const row = [...panel.querySelectorAll('.ach')].find(r => r.textContent.includes('Sprout Squasher')); return row && /1 \/ 50/.test(row.textContent) && !!row.querySelector('.abar'); });
    t.ok(prog, 'the window shows progress towards each goal');
    // counters from announcements, and state-based goals
    const more = await A.ev(() => { announce('boss', 'hopperchief'); announce('arena', 'Someone'); P.lv = 10; P.friends = ['a', 'b', 'c', 'd', 'e']; achCheck();
      return ['boss1', 'arena1', 'lv10', 'friends'].every(id => !!P.ach.got[id]) && !P.ach.got.boss10; });
    t.ok(more, 'bosses, arena wins, levels and friends count towards their goals');
    const tame = await A.ev(() => { P.pet = { k: 'hopper', name: '', happy: 80, out: false }; achCheck(); return !!P.ach.got.tame; });
    t.ok(tame, 'taming a companion counts');
    // wear a title
    await A.ev(() => { openPanel('ach'); panel.querySelector('[data-act="achwear"][data-arg="boss1"]').click(); });
    t.ok(await A.ev(() => myTitle() === 'boss1' && /Wearing: Boss Hunter/.test(panel.textContent.replace(/\s+/g, ' '))), 'you can wear a title you earned');
    t.ok(await poll(B, () => { const o = [...NET.others.values()][0]; return o && o.ti === 'boss1'; }), 'other players see it');
    t.ok(await A.ev(() => { PANEL_ACTS.achwear('lv50'); return myTitle() === 'boss1'; }), "a title you haven't earned can't be worn");
    t.ok(await A.ev(() => { save(); const s = JSON.parse(localStorage.getItem(SAVE_KEY)).p.ach; return s.title === 'boss1' && s.c.kills === 1 && !!s.got.kill1; }), 'progress and the worn title are saved');
    t.ok(await A.ev(() => { const g0 = P.gold; achCheck(); achCheck(); return P.gold === g0; }), 'nothing is awarded twice');
    t.ok(await A.ev(() => { closePanel(); openPanel('status'); const b = panel.querySelector('[data-act="openach"]'); b.click(); return panelKind === 'ach'; }), 'the Stats window opens it too');
    await A.ev(() => { panel.querySelector('[data-act="achwear"][data-arg=""]').click(); });
    t.ok(await poll(B, () => { const o = [...NET.others.values()][0]; return o && !o.ti; }), 'taking it off removes it for others');
    t.ok(A.page.errors.length === 0 && B.page.errors.length === 0, 'no script errors' + [...A.page.errors, ...B.page.errors].map(e => ': ' + e).join(''));
    if (process.env.SHOTS) { await A.ev(() => openPanel('ach')); await wait(300); await A.page.screenshot({ path: process.env.SHOTS + '/ach.png' }); }
  } finally { await A.close(); await B.close(); }
};
