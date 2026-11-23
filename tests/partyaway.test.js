// v1.52.2: a party keeps a member who restarts or loses their connection (shown as away) and takes them back in when
// they return; only leaving or being removed ends it. Needs a local game server:
//   EMBER_SERVER=http://localhost:5055 GAME_URL=http://localhost:8080/index.html npm test -- partyaway
const { player, wait, newRoom } = require('./helpers');

module.exports = async t => {
  if (!process.env.EMBER_SERVER) { t.ok(true, 'skipped (set EMBER_SERVER to run against a local game server)'); return; }
  const room = newRoom();
  const A = await player('Partya', room, { zone: 'meadow' }), B = await player('Partyb', room, { zone: 'meadow' });
  try {
    await wait(3500);
    await A.ev(() => document.getElementById('onlineBadge').click()); await wait(300);
    await A.ev(() => [...document.querySelectorAll('#whoList .wb button')].find(b => b.textContent === 'Invite').click()); await wait(1200);
    await B.ev(() => document.getElementById('invYes').click()); await wait(1500);
    t.ok(await A.ev(() => SOC.party && SOC.party.members.length === 2) && await B.ev(() => !!SOC.party), 'the two are in a party');

    // B's connection drops (a restart looks the same to the server): A keeps the party and sees B away
    await B.ev(() => SOCK.disconnect()); await wait(1500);
    const a1 = await A.ev(() => ({ party: !!SOC.party, away: SOC.party && SOC.party.away, members: SOC.party && SOC.party.members.length,
      row: !!document.querySelector('#partyBox .pmr.away') }));
    t.ok(a1.party && a1.members === 1 && a1.away.includes('Partyb') && a1.row, 'the party stays; the member who left shows as away ' + JSON.stringify(a1));

    // B comes back with a new connection: straight back into the same party
    await B.ev(() => SOCK.connect()); await wait(3500);
    const b2 = await B.ev(() => ({ party: !!SOC.party, n: SOC.party && SOC.party.members.length }));
    const a2 = await A.ev(() => ({ n: SOC.party && SOC.party.members.length, away: SOC.party && SOC.party.away.length, told: /Partyb is back in the party/.test(document.getElementById('log').textContent) }));
    t.ok(b2.party && b2.n === 2 && a2.n === 2 && a2.away === 0 && a2.told, 'coming back puts them straight back in the party ' + JSON.stringify([b2, a2]));

    // leaving yourself still ends it (a party of one is no party)
    await B.ev(() => soc('partyLeave', {})); await wait(1500);
    t.ok(await A.ev(() => !SOC.party) && await B.ev(() => !SOC.party), 'leaving the party yourself still ends it');
    t.ok(A.page.errors.length === 0 && B.page.errors.length === 0, 'no script errors' + [...A.page.errors, ...B.page.errors].map(e => ': ' + e).join(''));
  } finally { await A.close(); await B.close(); }
};
