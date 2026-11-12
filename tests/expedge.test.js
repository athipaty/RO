// the full-width EXP bar on the bottom edge follows base and job EXP
const { player, newRoom } = require('./helpers');
module.exports = async t => {
  const A = await player('Edge', newRoom(), { server: 'http://127.0.0.1:9' });
  try {
    const r = await A.ev(async () => { P.lv = 10; P.exp = expNeed(10) * .5; P.cls = 'warden'; P.jl = 5; P.jexp = jexpNeed(5) * .25; await new Promise(r => setTimeout(r, 400));
      const b = document.querySelector('#expEdge .b').style.width, j = document.querySelector('#expEdge .j').style.width, e = document.getElementById('expEdge').getBoundingClientRect();
      return { b, j, full: e.width >= innerWidth - 1, bottom: Math.abs(e.bottom - innerHeight) < 1, txt: document.querySelector('#expEdge span').textContent }; });
    t.ok(parseFloat(r.b) === 50 && parseFloat(r.j) === 25, `the bar shows base and job EXP (${r.b}, ${r.j})`);
    t.ok(r.full && r.bottom, 'it spans the whole bottom edge');
    t.ok(/Base 50\.0% · Job 25\.0%/.test(r.txt), 'pointing at it shows the numbers: ' + r.txt);
    t.ok(A.page.errors.length === 0, 'no script errors' + A.page.errors.map(e => ': ' + e).join(''));
  } finally { await A.close(); }
};
