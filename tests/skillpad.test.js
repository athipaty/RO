// Phones: the Skills window shows skills as a tree of icons; tapping one shows its card (details, Learn, hotbar keys) beside it.
const { openGame, wait, newRoom } = require('./helpers');

module.exports = async t => {
  const g = await openGame(newRoom(), { server: 'http://127.0.0.1:9' });
  try {
    await g.page.setViewport({ width: 844, height: 390, isMobile: true, hasTouch: true }); await wait(1200);
    await g.ev(() => { localStorage.clear(); document.getElementById('newBtn').click(); }); await wait(1200);
    const r = await g.ev(() => { P.cls = 'ravager'; P.jl = 20; P.skillPts = 5; P.skills = { cleave: 5 }; openPanel('skills');
      const icons = panel.querySelectorAll('.skpic').length, all = CLASSES.ravager.skills.length, cards = panel.querySelectorAll('.skpleft .snode').length;
      panel.querySelector('.skpic[data-arg="whirl"]').click(); const card = panel.querySelector('.skpright .snode'), title = card && card.textContent;
      card.querySelector('[data-act="learn"]').click(); const learned = P.skills.whirl === 1;
      const still = panel.querySelector('.skpic.sel') && panel.querySelector('.skpic.sel').dataset.arg; const secs = [...panel.querySelectorAll('.skpsec')].map(e => e.textContent);
      const side = (() => { const a = panel.querySelector('.skpleft').getBoundingClientRect(), b = panel.querySelector('.skpright').getBoundingClientRect(); return b.left >= a.right - 2; })();
      closePanel(); return { icons, all, cards, title, learned, still, secs, side }; });
    t.ok(r.icons === r.all && r.cards === 0, `every skill is an icon in the tree (${r.icons}), no big cards on the left`);
    t.ok(/Whirlwind/.test(r.title) && r.side, 'tapping a skill shows its card on the right side');
    t.ok(r.learned && r.still === 'whirl', 'Learn works from the card and the skill stays selected');
    t.ok(r.secs.join() === 'Warden,Ravager', 'skills are grouped by calling: ' + r.secs.join(', '));
    const desk = await g.ev(async () => { document.body.classList.remove('touchui'); P.skills = { cleave: 5, bladecraft: 3 }; openPanel('skills'); await new Promise(r => setTimeout(r, 300)); const n = panel.querySelectorAll('.skpic').length, lines = panel.querySelectorAll('svg.sklinks path').length, gold = [...panel.querySelectorAll('svg.sklinks path')].some(p => p.getAttribute('stroke') === '#e8c25a'), dashed = [...panel.querySelectorAll('svg.sklinks path')].some(p => p.getAttribute('stroke-dasharray')); closePanel(); document.body.classList.add('touchui'); return { n, lines, gold, dashed }; });
    t.ok(desk.n > 5, 'desktop shows the same icon tree');
    t.ok(desk.lines > 6 && desk.gold && desk.dashed, `lines join each skill to the skills it unlocks (${desk.lines / 2} lines: gold when met, dashed when not)`);
    t.ok(g.page.errors.length === 0, 'no script errors' + g.page.errors.map(e => ': ' + e).join(''));
  } finally { await g.close(); }
};
