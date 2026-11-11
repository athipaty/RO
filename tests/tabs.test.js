// Two tabs of the same browser warn that they share one saved character (and the background tab is paused).
const pptr = require('puppeteer-core');
const { BROWSER, newRoom, wait } = require('./helpers');
const GAME = process.env.GAME_URL || require('url').pathToFileURL(require('path').join(__dirname, '..', 'index.html')).href;
module.exports = async t => {
  const b = await pptr.launch({ executablePath: BROWSER, headless: true });
  try {
    const url = GAME + '?room=' + newRoom() + '&server=' + encodeURIComponent('http://127.0.0.1:9');
    const open = async (name, clear) => { const p = await b.newPage(); await p.setViewport({ width: 1200, height: 800 }); p.errs = []; p.on('pageerror', e => p.errs.push(e.message));
      await p.goto(url); await p.evaluate((n, c) => { if (c) localStorage.clear(); document.getElementById('nameIn').value = n; document.getElementById('newBtn').click(); }, name, clear); return p; };
    const A = await open('TabOne', true); await wait(1200);
    t.ok(await A.evaluate(() => !/another tab/.test(document.getElementById('log').textContent)), 'one tab alone gets no warning');
    const B = await b.newPage(); await B.goto(url); await B.evaluate(() => document.getElementById('contBtn').click()); await wait(4500);
    const la = await A.evaluate(() => document.getElementById('log').textContent), lb = await B.evaluate(() => document.getElementById('log').textContent);
    t.ok(/also open in another tab/.test(la) && /also open in another tab/.test(lb), 'both tabs warn that the game is open twice in this browser');
    t.ok([...A.errs, ...(B.errs || [])].length === 0, 'no script errors');
  } finally { await b.close(); }
};
