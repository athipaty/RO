// Accounts, cloud saves and live play through the game server.
// Runs only against a local copy of the server (so it never creates accounts on the real one):
//   EMBER_SERVER=http://localhost:5055 GAME_URL=http://localhost:8080/index.html npm test -- server
const { openGame, player, wait, newRoom } = require('./helpers');

module.exports = async t => {
  if (!process.env.EMBER_SERVER) { t.ok(true, 'skipped (set EMBER_SERVER to run against a local game server)'); return; }
  const room = newRoom(), user = 'u' + Math.random().toString(36).slice(2, 9);
  const fill = (g, u, p) => g.ev((u, p) => { document.getElementById('acUser').value = u; document.getElementById('acPass').value = p; }, u, p);

  // ---- device 1: play as guest, then create an account and move the guest character into it
  const A = await player('Guestly', room);
  try {
    await wait(2500);
    t.ok(await A.ev(() => !!NET.room && NET.room.server && !NET.viaBroker), 'connects through the game server, not the public broker');
    t.ok(await A.ev(() => NET.channel === 1), 'is placed in channel 1');
    await A.ev(() => { P.gold = 4321; save(); });
    await A.page.reload(); await wait(800);
    await fill(A, 'ab', 'secret1'); await A.ev(() => document.getElementById('acReg').click()); await wait(300);
    t.ok(/Username/.test(await A.ev(() => document.getElementById('acMsg').textContent)), 'a too-short username is rejected with a message');
    await fill(A, user, 'secret1'); await A.ev(() => document.getElementById('acReg').click()); await wait(1500);
    t.ok(await A.ev(u => ACC.username === u && !document.getElementById('acOut').hidden, user), 'creating an account logs you in');
    t.ok(await A.ev(() => !document.getElementById('acImport').hidden), 'offers to move the guest character into the new account');
    await A.ev(() => document.getElementById('acImport').click()); await wait(1200);
    t.ok(await A.ev(() => /Continue as Guestly/.test(document.getElementById('contBtn').textContent)), 'the guest character is now the account character');
    await A.ev(() => document.getElementById('contBtn').click()); await wait(800);
    await A.ev(() => { P.gold = 9876; P.lv = 7; save(true); }); await wait(1500);
  } finally { await A.close(); }

  // ---- device 2: a fresh browser logs in and continues the same character
  const B = await openGame(room);
  try {
    await wait(800);
    await fill(B, user, 'wrongpass'); await B.ev(() => document.getElementById('acLogin').click()); await wait(1200);
    t.ok(/Wrong username or password/.test(await B.ev(() => document.getElementById('acMsg').textContent)), 'a wrong password is refused');
    await fill(B, user, 'secret1'); await B.ev(() => document.getElementById('acLogin').click()); await wait(1500);
    t.ok(await B.ev(() => /Continue as Guestly \(Lv 7\)/.test(document.getElementById('contBtn').textContent)), 'another device sees the saved character (Lv 7)');
    await B.ev(() => document.getElementById('contBtn').click()); await wait(800);
    t.ok(await B.ev(() => P.gold === 9876 && P.name === 'Guestly'), 'continuing on the other device restores the gold from the server');

    // ---- a second player joins the same room through the server and they see each other
    const C = await player('Friend', room);
    try {
      await wait(3000);
      t.ok(await B.ev(() => document.getElementById('onlineBadge').textContent.includes('2 online · ch 1')), 'two players see each other via the server (badge shows channel)');
      t.ok(await C.ev(() => { const o = [...NET.others.values()][0]; return o && o.n === 'Guestly' && !o.guest; }), 'the logged-in player is not marked as a guest');
      t.ok(await B.ev(() => { const o = [...NET.others.values()][0]; return o && o.guest; }), 'the guest player is marked as a guest');
      await C.ev(() => sendChat('hello from the server'));
      await wait(1200);
      t.ok(await B.ev(() => document.getElementById('log').textContent.includes('hello from the server')), 'chat goes through the server');
      await C.close(); await wait(1500);
      t.ok(await B.ev(() => NET.others.size === 0), 'a player who closes the game disappears for the others');
    } finally { await C.close().catch(() => {}); }

    // ---- log out returns to guest mode
    await B.ev(() => { running = false; document.getElementById('title').hidden = false; document.getElementById('acLogout').click(); });
    t.ok(await B.ev(() => !ACC.token && !document.getElementById('acIn').hidden), 'logging out shows the login form again');
    t.ok(B.page.errors.length === 0, 'no script errors' + (B.page.errors.length ? ': ' + B.page.errors.join(' | ') : ''));
  } finally { await B.close(); }
};
