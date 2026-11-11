// #49 guilds: found, emblem, invite, ranks, guild chat, kick, leave, saved across reconnects.
// Runs only against a local copy of the game server (it creates accounts):
//   EMBER_SERVER=http://localhost:5055 GAME_URL=http://localhost:8080/index.html npm test -- guild
const { player, wait, newRoom } = require('./helpers');

async function account(prefix) {
  const username = (prefix + Math.random().toString(36).slice(2, 9)).slice(0, 16);
  const r = await fetch(process.env.EMBER_SERVER + '/api/embervale/register', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ username, password: 'secret1' }) });
  const j = await r.json(); if (!j.token) throw new Error('register failed: ' + JSON.stringify(j)); return j;
}
const login = (g, a) => g.ev((tok, u) => { ACC.token = tok; ACC.username = u; NET.room.relogin(); }, a.token, a.username);
const logOf = g => g.ev(() => document.getElementById('log').textContent);
// wait (up to 6s) for an invitation box to appear
const invited = g => g.ev(async () => { for (let i = 0; i < 24; i++) { const el = document.getElementById('ginvite'); if (el && !el.hidden) return true; await new Promise(r => setTimeout(r, 250)); } return false; });

module.exports = async t => {
  if (!process.env.EMBER_SERVER) { t.ok(true, 'skipped (set EMBER_SERVER to run against a local game server)'); return; }
  const room = newRoom(), gname = 'Wardens ' + Math.random().toString(36).slice(2, 6);
  const [aa, ab, ac] = await Promise.all([account('ga'), account('gb'), account('gc')]);
  const A = await player('Alba', room), B = await player('Bram', room), C = await player('Cira', room);
  try {
    await wait(2500);
    t.ok(await A.ev(() => { openPanel('guild'); const s = panel.textContent; closePanel(); return /Log in or sign up/.test(s); }), 'a guest is told guilds need an account');
    // wait for a real game-server connection (a slow start can fall back to the public broker)
    const srv = await Promise.all([A, B, C].map(g => g.ev(async () => { for (let i = 0; i < 40 && !(NET.room && NET.room.server); i++) await new Promise(r => setTimeout(r, 250)); return !!(NET.room && NET.room.server); })));
    if (!srv.every(Boolean)) { t.ok(false, 'every player reached the game server (a player fell back to the backup broker; re-run)'); return; }
    await Promise.all([login(A, aa), login(B, ab), login(C, ac)]);
    const back = await Promise.all([A, B, C].map(g => g.ev(async () => { for (let i = 0; i < 40 && !(SOCK && SOCK.connected); i++) await new Promise(r => setTimeout(r, 250)); return SOCK.connected; })));
    t.ok(back.every(Boolean), 'all three reconnect with their accounts');
    await wait(1500);

    const made = await A.ev(async n => { const w = ms => new Promise(r => setTimeout(r, ms)); P.gold = 20000; openPanel('guild');
      document.getElementById('gName').value = n; panel.querySelector('[data-act="gemb"][data-arg="0:2"]').click(); panel.querySelector('[data-act="gemb"][data-arg="2:3"]').click();
      panel.querySelector('[data-act="gcreate"]').click(); await w(1500); const s = panel.textContent; closePanel();
      return { g: GD.g && GD.g.name, emb: GD.g && GD.g.emblem.join(), rank: myGRank(), gold: P.gold, panel: s }; }, gname);
    t.ok(made.g === gname && made.rank === 'leader', 'a logged-in player founds a guild and leads it');
    t.ok(made.emb === '2,0,3' && made.gold === 10000, 'the chosen emblem is kept and 10,000 gold is paid');
    await wait(1200);
    t.ok(await B.ev(n => [...NET.others.values()].some(o => o.n === 'Alba' && o.guild && o.guild.n === n), gname), "other players see the guild name under the founder's name");

    // invite Bram from the online list
    await A.ev(() => { updateWho(); const row = [...document.querySelectorAll('#whoList .who')].find(r => /Bram/.test(r.textContent)); [...row.querySelectorAll('button')].find(b => b.textContent === 'Guild').click(); });
    await invited(B);
    const inv = await B.ev(() => { const el = document.getElementById('ginvite'); const shown = el && !el.hidden && /Alba/.test(el.textContent); el.querySelector('[data-g="yes"]').click(); return shown; });
    t.ok(inv, 'the invited player sees an invitation with the guild name and emblem');
    await wait(1500);
    t.ok(await A.ev(() => GD.g.members.length === 2) && await B.ev(n => GD.g && GD.g.name === n && myGRank() === 'member', gname), 'accepting adds them as a member');

    await A.ev(() => sendChat('/g rally at the fountain'));
    await wait(1200);
    t.ok(/\[Guild\] Alba: rally at the fountain/.test(await logOf(B)) && !/rally at the fountain/.test(await logOf(C)), 'guild chat reaches members only');

    // a member cannot invite; an officer can
    const cpeer = await B.ev(() => findPeerByName('Cira'));
    await B.ev(p => gsoc('guildInvite', { peer: p }), cpeer); await wait(1000);
    t.ok(/Only the leader and officers can invite/.test(await logOf(B)), 'a plain member cannot invite');
    await A.ev(() => { openPanel('guild'); panel.querySelector('[data-act="grank"][data-arg$=":officer"]').click(); }); await wait(1500);
    t.ok(await B.ev(() => myGRank() === 'officer'), 'the leader makes Bram an officer');
    await B.ev(p => gsoc('guildInvite', { peer: p }), cpeer);
    t.ok(await invited(C), 'Cira gets the invitation from the officer');
    await C.ev(() => document.querySelector('#ginvite [data-g="yes"]').click()); await wait(1500);
    t.ok(await A.ev(() => GD.g.members.length === 3), 'the officer invites Cira and she joins');

    // ranks guard kicking
    await B.ev(() => gsoc('guildKick', { u: GD.g.members.find(m => m.rank === 'leader').u })); await wait(1000);
    t.ok(/lower rank/.test(await logOf(B)) && await A.ev(() => !!GD.g), 'an officer cannot remove the leader');
    await A.ev(u => gsoc('guildKick', { u }), ac.username); await wait(1500);
    t.ok(await C.ev(() => GD.g === null && /removed from/.test(document.getElementById('log').textContent)), 'the leader removes Cira, who is told');

    // the guild is saved: Bram reconnects and still has it
    await B.ev(async () => { NET.room.relogin(); for (let i = 0; i < 40 && !(SOCK && SOCK.connected); i++) await new Promise(r => setTimeout(r, 250)); }); await wait(2000);
    t.ok(await B.ev(n => GD.g && GD.g.name === n && myGRank() === 'officer', gname), 'the guild is still there after reconnecting');

    // names are unique
    await C.ev(n => { P.gold = 20000; gsoc('guildCreate', { name: n.toUpperCase(), emblem: [0, 0, 0] }); }, gname); await wait(1200);
    t.ok(/taken/.test(await logOf(C)) && await C.ev(() => P.gold === 20000), 'guild names are unique (ignoring case) and nothing is charged');

    // the leader leaves: the officer takes over
    await A.ev(() => { openPanel('guild'); const b = panel.querySelector('[data-act="gleave"]'); return !!b; }).then(async has => {
      if (!has) await A.ev(() => gsoc('guildLeave', {})); else await A.ev(() => panel.querySelector('[data-act="gleave"]').click()); });
    await wait(1500);
    t.ok(await A.ev(() => GD.g === null) && await B.ev(() => myGRank() === 'leader' && GD.g.members.length === 1), 'when the leader leaves, the officer becomes leader');
    await B.ev(() => { openPanel('guild'); panel.querySelector('[data-act="gdisband"]').click(); panel.querySelector('[data-act="gdisband"]').click(); }); await wait(1500);
    t.ok(await B.ev(() => GD.g === null), 'the leader can disband the guild (after confirming)');
    const errs = [A, B, C].flatMap(g => g.page.errors);
    t.ok(errs.length === 0, 'no script errors' + errs.map(e => ': ' + e).join(''));
  } finally { await Promise.all([A, B, C].map(g => g.close())); }
};
