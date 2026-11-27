// v1.85.0: a tidier skill tree (js/skilltidy.js): one slim bar, the build's next skill clearly marked, ★ on every
// skill in the build, Follow this build goes back to Skills, the key behind a button, trees fit an upright phone.
const pptr = require('puppeteer-core'); const { BROWSER, newRoom, wait } = require('./helpers'); const path = require('path'), url = require('url');
const GAME = url.pathToFileURL(path.join(__dirname, '..', 'index.html')).href;
module.exports = async t => {
  const b = await pptr.launch({ executablePath: BROWSER, headless: true }); const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  try {
    await p.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 1 }); await p.goto(GAME + '?room=' + newRoom() + '&server=' + encodeURIComponent('http://127.0.0.1:9')); await wait(2000);
    await p.evaluate(() => { localStorage.clear(); document.getElementById('nameIn').value = 'Tidy'; document.getElementById('newBtn').click(); }); await wait(2500);
    const r = await p.evaluate(() => { P.tut = 'done'; P.cls = 'starseer'; P.lv = 80; P.jl = 40; P.skillPts = 12; P.skills = { smite: 10, mend: 10, blessing: 5, faith: 5, renew: 3, purify: 3, sanctuary: 5, radiance: 3, starfall: 1 }; S = computeStats();
      openPanel('skills'); const before = { bar: !!panel.querySelector('.sktop'), boxes: panel.querySelectorAll('.skillauto,.bgbar').length, nextLine: !!panel.querySelector('.sktnext'), key: panel.querySelector('.skplegend').style.display };
      PANEL_ACTS.sktkey(); const keyOn = panel.querySelector('.skplegend').style.display === ''; PANEL_ACTS.sktkey();
      const bd = BUILDS.find(x => buildAllowed(x)); openPanel('buildguide'); PANEL_ACTS.buildpick(bd.id); const back = panelKind === 'skills';
      const nx = buildNextSkill(bd), tile = panel.querySelector('.skpic.bnext');
      const stars = [...panel.querySelectorAll('.skpic.inbuild')].map(e => e.dataset.arg), want = [...new Set(bd.skills.map(s => s[0]))].filter(id => panel.querySelector(`.skpic[data-arg="${id}"]`));
      const go = panel.querySelector('.sktgo'), selNext = SKP.sel === nx.id, card = panel.querySelector('.sktcard.on');
      const fit = [...panel.querySelectorAll('.skpgrid')].every(g => g.scrollWidth <= g.parentElement.clientWidth + 1);
      const cardUnder = panel.querySelector('.skpright').previousElementSibling === tile.closest('.skpgrid');
      // the level tags on the lines: none for met requirements
      return { before, keyOn, back, nextTile: tile && tile.dataset.arg === nx.id && /NEXT/.test(tile.textContent), stars: JSON.stringify(stars.sort()) === JSON.stringify(want.sort()), go: go && go.dataset.arg === nx.id, selNext, card: card && /learn this next/.test(card.textContent), fit, cardUnder }; });
    await wait(400);
    const tags = await p.evaluate(() => { const shown = new Set([...panel.querySelectorAll('.skpic[data-arg]')].map(e => e.dataset.arg)); let all = 0, unmet = 0;
      for (const id of shown) for (const k in SKILL_REQ[id] || {}) if (shown.has(k)) { all++; if ((P.skills[k] || 0) < SKILL_REQ[id][k]) unmet++; }
      return { n: panel.querySelectorAll('svg.sklinks text').length, all, unmet }; });
    t.ok(r.before.bar && !r.before.boxes && !r.before.nextLine && r.before.key === 'none', 'one slim bar on top (points, Recommended, Build guide); the key is hidden until asked');
    t.ok(r.keyOn, 'the Key button shows what the marks mean');
    t.ok(r.back && r.selNext, 'Follow this build goes back to the Skills window with the next skill chosen');
    t.ok(r.nextTile && r.go && r.card, 'the next skill wears a NEXT tag, the Next line names it, and its card says to learn it next');
    t.ok(r.stars, 'every skill in the build carries a ★');
    t.ok(r.fit && r.cardUnder, 'every tree fits an upright phone, and the card opens under the tree you tapped in');
    t.ok(tags.n <= tags.unmet && tags.unmet < tags.all, `only requirements not met yet carry a level tag (${tags.n} tags, ${tags.unmet} not met of ${tags.all})`);
    t.ok(!errs.length, 'no script errors ' + errs.slice(0, 3).join(' | '));
  } finally { await b.close(); }
};
