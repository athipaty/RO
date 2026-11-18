// The status box shortens big gold amounts (js/ui.js goldShort, v1.19.7); request cards sit in the middle of the screen
const { player, newRoom, wait } = require('./helpers');
module.exports = async t => {
  const g = await player('Rich', newRoom(), { server: 'http://127.0.0.1:9' });
  try {
    await wait(500);
    const r = await g.ev(async () => {
      const w = ms => new Promise(r => setTimeout(r, ms));
      const fm = [999, 9999, 12345, 123456, 1234567, 98765432, 4500000000].map(goldShort).join(' ');
      P.gold = 1234567; await w(400); const box = document.getElementById('gold').textContent;
      window.soc = () => {}; showTradeAsk('x', 'Mira'); await w(400); const r = document.getElementById('tradeAsk').getBoundingClientRect(); hideTradeAsk();
      return { fm, box, mid: Math.abs((r.left + r.right) / 2 - innerWidth / 2) < 4 && r.top > innerHeight * .2 && r.bottom < innerHeight * .7 };
    });
    t.ok(r.fm === '999 9,999 12.3k 123k 1.23M 98.7M 4.5B', 'amounts shorten: ' + r.fm);
    t.ok(/^1\.23M gold/.test(r.box), 'the status box shows ' + r.box);
    t.ok(r.mid, 'a trade request shows in the middle of the screen');
    t.ok(g.page.errors.length === 0, 'no script errors' + g.page.errors.map(e => ': ' + e).join(''));
  } finally { await g.close(); }
};
