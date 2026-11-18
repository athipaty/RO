// The Market Board (js/market.js + the server's routes/embervale/market.js): a seller with an account lists an item,
// a guest buys it while the seller is away, only one buyer can get it, the seller collects the gold, and an unsold
// item can be taken back. Runs only against a local copy of the game server (it creates accounts):
//   EMBER_SERVER=http://localhost:5055 npm test -- market
const { player, wait, newRoom } = require('./helpers');

async function account(prefix) {
  const username = (prefix + Math.random().toString(36).slice(2, 9)).slice(0, 16);
  const r = await fetch(process.env.EMBER_SERVER + '/api/embervale/register', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ username, password: 'secret1' }) });
  const j = await r.json(); if (!j.token) throw new Error('register failed: ' + JSON.stringify(j)); return j;
}
const login = (g, a) => g.ev((tok, u) => { ACC.token = tok; ACC.username = u; NET.room.relogin(); }, a.token, a.username);
const until = (g, f, ms = 6000) => g.ev(async (src, ms) => { const fn = eval(src)(); for (let i = 0; i < ms / 100; i++) { if (fn()) return true; await new Promise(r => setTimeout(r, 100)); } return false; }, String(f), ms);

module.exports = async t => {
  if (!process.env.EMBER_SERVER) { t.ok(true, 'skipped (set EMBER_SERVER to run against a local game server)'); return; }
  const room = newRoom(), sa = await account('mks');
  const A = await player('Seller', room), B = await player('Buyer', room), C = await player('Late', room);
  try {
    await wait(2500); await login(A, sa); await wait(1500);
    // the guest sees the board but cannot sell
    await B.ev(() => mkOpen()); t.ok(await until(B, () => () => MK.board), 'a guest can open the board');
    t.ok(await B.ev(() => { PANEL_ACTS.mktab('sell'); return /needs an account/.test(panel.textContent); }), 'selling asks a guest to log in');
    // the seller lists 3 tonics for 90 gold
    const before = await A.ev(() => { giveItem('red', 5); P.inv.find(e => e.id === 'red').n = 5; mkOpen(); return P.inv.find(e => e.id === 'red').n; });
    await until(A, () => () => MK.board && MK.board.account);
    await A.ev(() => { PANEL_ACTS.mktab('sell'); const i = P.inv.findIndex(e => e.id === 'red'); MK.sel = i; MK.n = 3; refreshPanel(); document.getElementById('mkPrice').value = 90; PANEL_ACTS.mkpost(); });
    t.ok(await until(A, () => () => MK.board && MK.board.mine.length === 1 && !Object.keys(MK.pend).length), 'the seller lists 3 Red Tonics for 90 gold');
    t.ok(await A.ev(b => P.inv.find(e => e.id === 'red').n === b - 3, before), 'they leave the bag');
    // the seller leaves; the guest finds and buys them (two taps)
    await A.close();
    await B.ev(() => mkSend('mkBrowse')); await until(B, () => () => MK.board.items.some(l => l.e.id === 'red' && l.price === 90));
    const g0 = await B.ev(() => { P.gold = 500; const l = MK.board.items.find(l => l.e.id === 'red' && l.price === 90); PANEL_ACTS.mktab('browse'); PANEL_ACTS.mkbuy(l.k); const asked = !!panel.querySelector('.mkgo'); PANEL_ACTS.mkbuy(l.k); window.__k = l.k; return asked; });
    t.ok(g0, 'the first tap on Buy asks to confirm');
    t.ok(await until(B, () => () => P.gold === 410 && (P.inv.find(e => e.id === 'red') || {}).n >= 3), 'the buyer pays 90 gold and gets the tonics while the seller is offline');
    // a second buyer cannot get the same listing
    const k = await B.ev(() => window.__k);
    const c0 = await C.ev(k => { P.gold = 500; const n = (P.inv.find(e => e.id === 'red') || {}).n || 0; mkSend('mkBuy', { k, price: 90 }); return n; }, k); await wait(1200);
    t.ok(await C.ev(c0 => P.gold === 500 && ((P.inv.find(e => e.id === 'red') || {}).n || 0) === c0, c0), 'the same item cannot be bought twice');
    // the seller comes back and collects
    const A2 = await player('Seller', room); await wait(2500); await login(A2, sa); await wait(1500);
    await A2.ev(() => { P.gold = 100; mkOpen(); });
    t.ok(await until(A2, () => () => MK.board && MK.board.purse && MK.board.purse.gold === 90), 'the sale waits in the seller\'s purse');
    await A2.ev(() => PANEL_ACTS.mkclaim());
    t.ok(await until(A2, () => () => P.gold === 190 && MK.board.purse.gold === 0), 'Collect adds the 90 gold');
    // list a sword, then take it back
    await wait(1500);
    await A2.ev(() => { giveItem('sword', 1); const i = P.inv.findIndex(e => e.id === 'sword'); MK.sel = i; PANEL_ACTS.mktab('sell'); MK.sel = i; refreshPanel(); document.getElementById('mkPrice').value = 999; PANEL_ACTS.mkpost(); });
    const listed = await until(A2, () => () => MK.board.mine.length === 1 && !P.inv.some(e => e.id === 'sword'));
    if (!listed) console.log('   log:', (await A2.ev(() => document.getElementById('log').textContent)).slice(-300));
    await A2.ev(() => PANEL_ACTS.mkcancel(MK.board.mine[0].k));
    t.ok(await until(A2, () => () => P.inv.some(e => e.id === 'sword') && MK.board.mine.length === 0), 'Take back returns an unsold item');
    t.ok([B, C, A2].every(g => g.page.errors.length === 0), 'no script errors');
    await A2.close();
  } finally { for (const g of [A, B, C]) try { await g.close(); } catch (e) {} }
};
