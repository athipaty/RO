// Shared helpers: start a real headless browser playing the game from the local files.
const pptr = require('puppeteer-core');
const fs = require('fs'), path = require('path'), url = require('url');

const CANDIDATES = [
  process.env.BROWSER,
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser',
].filter(Boolean);
const BROWSER = CANDIDATES.find(p => fs.existsSync(p));
// GAME_URL lets tests load the game over http (needed for the account API's CORS);
// EMBER_SERVER points the game at a local copy of the game server instead of the real one.
const GAME = process.env.GAME_URL || url.pathToFileURL(path.join(__dirname, '..', 'index.html')).href;
const SERVER_Q = process.env.EMBER_SERVER ? '&server=' + encodeURIComponent(process.env.EMBER_SERVER) : '';

const wait = ms => new Promise(r => setTimeout(r, ms));
// every test run gets its own private room, so tests never meet real players
const newRoom = () => 'test-' + Math.random().toString(36).slice(2, 10);

// opts.server overrides the game server (e.g. an unreachable one to test the public-broker backup)
async function openGame(room, opts = {}) {
  if (!BROWSER) throw new Error('No Chrome or Edge found. Set the BROWSER environment variable to its path.');
  const browser = await pptr.launch({ executablePath: BROWSER, headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 800 });
  page.errors = [];
  page.on('pageerror', e => page.errors.push(e.message));
  // NO_WEB=1: skip outside requests (web fonts, CDNs) so tests still run when the internet is down; local files and
  // a local game server still load
  if (process.env.NO_WEB) { await page.setRequestInterception(true);
    // the socket.io client normally comes from a CDN: NO_WEB_SIO=<path to socket.io.min.js> serves a local copy
    const sio = process.env.NO_WEB_SIO && fs.existsSync(process.env.NO_WEB_SIO) ? fs.readFileSync(process.env.NO_WEB_SIO, 'utf8') : null;
    page.on('request', r => { const u = r.url(); if (sio && /socket\.io(-client)?.*\.js/.test(u)) return r.respond({ status: 200, contentType: 'application/javascript', body: sio }); if (/^(file:|data:|blob:|https?:\/\/(localhost|127\.0\.0\.1)[:/])/.test(u)) r.continue(); else r.abort(); }); }
  await page.goto(GAME + '?room=' + room + (opts.server ? '&server=' + encodeURIComponent(opts.server) : SERVER_Q));
  return { browser, page, ev: (f, ...a) => page.evaluate(f, ...a), close: () => browser.close() };
}

// open the game and start a brand new character
async function player(name, room, { zone, server } = {}) {
  const g = await openGame(room, { server });
  await g.ev(n => { localStorage.clear(); document.getElementById('nameIn').value = n; document.getElementById('newBtn').click(); }, name);
  await wait(600);
  if (zone) await g.ev(z => enterZone(z), zone);
  return g;
}

module.exports = { openGame, player, wait, newRoom, BROWSER };
