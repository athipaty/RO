// Trading and player shops, refereed by the game server. Needs a local copy of the server:
//   EMBER_SERVER=http://localhost:5055 GAME_URL=http://localhost:8080/index.html npm test -- trade
const { player, wait, newRoom } = require('./helpers');

module.exports = async t => {
  if (!process.env.EMBER_SERVER) { t.ok(true, 'skipped (set EMBER_SERVER to run against a local game server)'); return; }
  const room = newRoom();
  const A = await player('Alpha', room, { zone: 'meadow' });
  const B = await player('Beta', room, { zone: 'meadow' });
  const stand = (g, dx) => g.ev(dx => { P.x = Z.spawn.x + dx; P.y = Z.spawn.y; P.path = []; NET.lastSent = ''; netTick(0); }, dx);
  const log = g => g.ev(() => document.getElementById('log').textContent);
  try {
    await stand(A, 0); await stand(B, 40); await wait(2500);
    const g0 = { a: await A.ev(() => ({ gold: P.gold, red: invFind('red').n })), b: await B.ev(() => ({ gold: P.gold, red: invFind('red').n, scroll: invFind('scroll').n })) };

    // ---- a trade
    await A.ev(() => sendChat('/trade Beta')); await wait(1000);
    t.ok(await B.ev(() => !document.getElementById('tradeAsk').hidden), 'Beta gets a trade request card');
    await B.ev(() => document.getElementById('taYes').click()); await wait(1000);
    t.ok(await A.ev(() => panelKind === 'trade') && await B.ev(() => panelKind === 'trade'), 'both get the trade window');
    await A.ev(() => { const i = P.inv.findIndex(e => e.id === 'red'); document.getElementById('tq' + i).value = 3; PANEL_ACTS.tradeAdd(i); document.getElementById('tGold').value = 50; PANEL_ACTS.tradeGold(); });
    await B.ev(() => PANEL_ACTS.tradeAdd(P.inv.findIndex(e => e.id === 'scroll')));
    await wait(1000);
    t.ok(await B.ev(() => { const th = TR.trade.state.them; return th.items.some(e => e.id === 'red' && e.n === 3) && th.gold === 50; }), "Beta sees Alpha's offer (3 Red Tonics and 50 gold)");
    t.ok(await A.ev(r => { const s = snapshot().p; return s.inv.filter(e => e.id === 'red').reduce((a, e) => a + e.n, 0) === r; }, g0.a.red), 'items on offer are still saved with their owner');
    await A.ev(() => PANEL_ACTS.tradeLock()); await wait(600);
    t.ok(await A.ev(() => !panel.querySelector('[data-act="tradeConfirm"]')), 'Trade is not possible until both have locked');
    await B.ev(() => PANEL_ACTS.tradeLock()); await wait(800);
    await A.ev(() => PANEL_ACTS.tradeConfirm()); await wait(500);
    t.ok(await A.ev(() => !!TR.trade), 'one side pressing Trade is not enough');
    await B.ev(() => PANEL_ACTS.tradeConfirm()); await wait(1200);
    const after = { a: await A.ev(() => ({ gold: P.gold, red: invFind('red').n, scroll: (invFind('scroll') || {}).n, open: !!TR.trade })), b: await B.ev(() => ({ gold: P.gold, red: invFind('red').n, scroll: (invFind('scroll') || {}).n || 0, open: !!TR.trade })) };
    t.ok(!after.a.open && !after.b.open, 'the trade completes when both press Trade');
    t.ok(after.a.red === g0.a.red - 3 && after.a.gold === g0.a.gold - 50 && after.a.scroll === g0.b.scroll + 1, 'Alpha gave 3 tonics and 50 gold and got the scroll');
    t.ok(after.b.red === g0.b.red + 3 && after.b.gold === g0.b.gold + 50 && after.b.scroll === g0.b.scroll - 1, 'Beta got 3 tonics and 50 gold and gave the scroll');

    // ---- cancelling returns everything
    await A.ev(() => sendChat('/trade Beta')); await wait(1000);
    await B.ev(() => document.getElementById('taYes').click()); await wait(1000);
    await A.ev(() => PANEL_ACTS.tradeAdd(P.inv.findIndex(e => e.id === 'red'))); await wait(500);
    await B.ev(() => PANEL_ACTS.tradeCancel()); await wait(1000);
    t.ok(await A.ev(r => !TR.trade && invFind('red').n === r && panelKind !== 'trade', after.a.red), 'a cancelled trade returns the items to the bag');

    // ---- you must stand close to trade
    await stand(B, 900); await wait(800);
    await A.ev(() => sendChat('/trade Beta')); await wait(1000);
    t.ok((await log(A)).includes('Stand next to Beta to trade.'), 'trading from far away is refused');
    await stand(B, 40); await wait(800);

    // ---- a player shop
    await A.ev(() => { PANEL_ACTS.vendsetup(); const i = P.inv.findIndex(e => e.id === 'red'); document.getElementById('vq' + i).value = 2; document.getElementById('vp' + i).value = 10;
      document.getElementById('vTitle').value = 'Cheap tonics'; PANEL_ACTS.vendList(i); PANEL_ACTS.vendOpen(); });
    await wait(1500);
    t.ok(await A.ev(() => !!TR.vend && P.sitting), 'opening a shop sits you down');
    t.ok(await B.ev(() => [...NET.others.values()].some(o => o.vd === 'Cheap tonics')), 'other players see the shop sign');
    await B.ev(() => soc('vendView', { peer: [...NET.others.keys()][0] })); await wait(1000);
    t.ok(await B.ev(() => panelKind === 'vendview' && /Cheap tonics/.test(panel.textContent)), 'clicking the shop shows its items and prices');
    const b1 = await B.ev(() => ({ gold: P.gold, red: invFind('red').n }));
    await B.ev(() => PANEL_ACTS.vendBuy(TR.view.items[0].k)); await wait(1200);
    t.ok(await B.ev(b => P.gold === b.gold - 10 && invFind('red').n === b.red + 1, b1), 'buying 1 costs 10 gold and adds it to the bag');
    t.ok(await A.ev(g => TR.vend && TR.vend.items[0].left === 1 && (document.getElementById('log').textContent.includes('Sold 1× Red Tonic to Beta')), g0.a.gold), 'the seller is told and paid');
    await B.ev(() => PANEL_ACTS.vendBuy(TR.view.items[0].k)); await wait(1200);
    t.ok(await A.ev(() => !TR.vend) && (await log(A)).includes('Your shop sold out.'), 'selling the last item closes the shop');

    // ---- standing up closes a shop and returns unsold items
    const s0 = await A.ev(() => invFind('scroll').n);
    await A.ev(() => { PANEL_ACTS.vendsetup(); const i = P.inv.findIndex(e => e.id === 'scroll'); document.getElementById('vp' + i).value = 99; PANEL_ACTS.vendList(i); PANEL_ACTS.vendOpen(); });
    await wait(1200);
    await A.ev(() => { P.sitting = false; }); await wait(800);
    t.ok(await A.ev(s => !TR.vend && invFind('scroll').n === s, s0), 'standing up closes the shop and returns unsold items');
    t.ok(A.page.errors.length === 0 && B.page.errors.length === 0, 'no script errors' + [...A.page.errors, ...B.page.errors].map(e => ': ' + e).join(''));
  } finally { await A.close(); await B.close(); }
};
