// Build guide: each job of the route is a picture of your hero in that job (next job marked, tap for a job card),
// and the stat bars say what they show: the build's share (gold, the % number) and yours now (blue)
const { openGame, newRoom, wait } = require('./helpers');
module.exports = async t => {
  const A = await openGame(newRoom(), { server: 'http://127.0.0.1:9' });
  try {
    await A.ev(() => { localStorage.clear(); document.getElementById('nameIn').value = 'Guide'; document.getElementById('newBtn').click(); }); await wait(1200);
    const r = await A.ev(async () => { const sleep = ms => new Promise(r => setTimeout(r, ms));
      P.cls = 'ranger'; P.st.dex = 21; P.st.agi = 11; P.st.luk = 1; P.build = 'archer'; PANEL_ACTS.openguide(); await sleep(200);
      const card = document.querySelector('#panel .bgcard.on'), jobs = [...card.querySelectorAll('.bgjob')];
      const pics = jobs.filter(j => /^data:image/.test(j.querySelector('img').src)).length, next = card.querySelector('.bgjob.next');
      const b = BUILDS.find(x => x.id === 'archer'), tot = Object.values(b.stats).reduce((a, v) => a + v, 0);
      const rows = [...card.querySelectorAll('.bgstats>div')].map(d => ({ k: d.querySelector('span').textContent, goal: d.querySelector('b').textContent, mine: d.querySelector('small').textContent, w: d.querySelector('.bgbars i').style.width }));
      next.click(); await sleep(150);
      const jc = document.querySelector('#panel .bgjobcard');
      return { n: jobs.length, pics, next: next && next.dataset.arg, rows, want: Object.entries(b.stats).map(([k, v]) => Math.round(v / tot * 100) + '%'), card: jc && jc.textContent };
    });
    t.ok(r.n === 3 && r.pics === 3, 'the route shows a picture for each of its three jobs');
    t.ok(r.next === 'archer:sharpshooter', 'a Ranger sees Sharpshooter marked as the next job');
    t.ok(r.rows.every((x, i) => x.goal === r.want[i] && x.w === r.want[i]), 'each gold bar and its number are the build share ' + JSON.stringify(r.rows));
    t.ok(r.rows[0].mine === '67%' && r.rows[1].mine === '33%' && r.rows[2].mine === '0%', 'the blue numbers are how your own points are split ' + JSON.stringify(r.rows));
    t.ok(r.card && /Sharpshooter/.test(r.card) && /Corvin/.test(r.card), 'tapping the next job opens its card with how to get it');
    t.ok(A.page.errors.length === 0, 'no script errors' + A.page.errors.map(e => ': ' + e).join(''));
  } finally { await A.close(); }
};
