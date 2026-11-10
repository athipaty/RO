// Parties, shared EXP, whispers, friends and chat tabs. Needs a local copy of the game server:
//   EMBER_SERVER=http://localhost:5055 GAME_URL=http://localhost:8080/index.html npm test -- social
const { player, wait, newRoom } = require('./helpers');

module.exports = async t => {
  if (!process.env.EMBER_SERVER) { t.ok(true, 'skipped (set EMBER_SERVER to run against a local game server)'); return; }
  const room = newRoom();
  const A = await player('Alpha', room, { zone: 'meadow' });
  const B = await player('Beta', room, { zone: 'meadow' });
  const logOf = g => g.ev(() => document.getElementById('log').textContent);
  try {
    await wait(3000);
    // ---- party invite from the online list
    await A.ev(() => { document.getElementById('onlineBadge').click(); });
    await wait(300);
    t.ok(await A.ev(() => [...document.querySelectorAll('#whoList .wb button')].some(b => b.textContent === 'Invite')), 'the online list has Invite / Whisper / + Friend buttons');
    await A.ev(() => [...document.querySelectorAll('#whoList .wb button')].find(b => b.textContent === 'Invite').click());
    await wait(1200);
    t.ok(await B.ev(() => !document.getElementById('invite').hidden && document.querySelector('#invite b').textContent === 'Alpha'), 'Beta gets an invitation card from Alpha');
    await B.ev(() => document.getElementById('invYes').click());
    await wait(1200);
    const pa = await A.ev(() => SOC.party && { n: SOC.party.members.length, lead: SOC.party.leader === selfPeer(), box: !document.getElementById('partyBox').hidden });
    const pb = await B.ev(() => SOC.party && { n: SOC.party.members.length, box: !document.getElementById('partyBox').hidden });
    t.ok(pa && pa.n === 2 && pa.lead && pa.box && pb && pb.n === 2 && pb.box, 'both are in a 2-person party with the party box showing; Alpha leads');
    t.ok(await B.ev(() => { const [peer] = [...NET.others.keys()]; return inParty(peer); }), 'party members are recognised (green names, minimap dots)');

    // ---- party chat + the Party tab
    await A.ev(() => sendChat('/p hello party'));
    await wait(1000);
    t.ok((await logOf(B)).includes('[Party] Alpha: hello party'), 'party chat reaches party members');
    await B.ev(() => document.querySelector('#logTabs [data-tab="party"]').click());
    t.ok(await B.ev(() => document.getElementById('log').classList.contains('f-party')), 'the Party tab filters the log');
    await B.ev(() => sendChat('typed in the party tab'));
    await wait(1000);
    t.ok((await logOf(A)).includes('[Party] Beta: typed in the party tab'), 'typing while on the Party tab talks to the party');
    await B.ev(() => document.querySelector('#logTabs [data-tab="all"]').click());

    // ---- shared EXP: Alpha kills, Beta (who did not hit) gets a share
    const expB0 = await B.ev(() => P.exp + P.lv * 1e6);
    const killed = await A.ev(async () => { const w = ms => new Promise(r => setTimeout(r, ms)); const m = mobs.find(m => !m.dead);
      P.x = m.x - 25; P.y = m.y; NET.lastSent = ''; netTick(0); await w(400); hurtMob(m, 99999, false, 'phys');
      for (let i = 0; i < 30 && !m.dead; i++) await w(100); return m.dead; });
    await wait(1200);
    t.ok(killed && (await B.ev(() => P.exp + P.lv * 1e6)) > expB0, 'in "share" mode a party member in the same region gets EXP from your kill');
    await A.ev(() => document.getElementById('pMode').click());
    await wait(800);
    t.ok(await B.ev(() => SOC.party.mode === 'each'), 'the leader can switch to "each keeps own EXP"');

    // ---- whispers
    await B.ev(() => sendChat('/w Alpha secret hello'));
    await wait(1000);
    t.ok((await logOf(A)).includes('[From Beta] secret hello') && (await logOf(B)).includes('[To Alpha] secret hello'), 'whispers reach only the named player');
    await A.ev(() => sendChat('/r got it'));
    await wait(1000);
    t.ok((await logOf(B)).includes('[From Alpha] got it'), '/r replies to the last whisper');
    await A.ev(() => sendChat('/w Nobodyhere hi'));
    await wait(800);
    t.ok((await logOf(A)).includes('Nobodyhere is not online.'), 'whispering someone offline says so');

    // ---- friends
    await A.ev(() => { sendChat('/friend Beta'); sendChat('/friends'); });
    await wait(1000);
    t.ok(await A.ev(() => P.friends.includes('Beta')) && (await logOf(A)).includes('Friends online: Beta'), '/friend adds a friend and /friends shows who is online');

    // ---- leave and kick
    await B.ev(() => document.getElementById('pLeave').click());
    await wait(1000);
    t.ok(await A.ev(() => !SOC.party) && await B.ev(() => !SOC.party), 'when one of two leaves, the party ends for both');
    await A.ev(() => sendChat('/invite Beta')); await wait(1000);
    await B.ev(() => document.getElementById('invYes').click()); await wait(1000);
    await A.ev(() => sendChat('/kick Beta')); await wait(1000);
    t.ok(await B.ev(() => !SOC.party) && (await logOf(B)).includes('You were removed from the party.'), 'the leader can remove a member');
    t.ok(A.page.errors.length === 0 && B.page.errors.length === 0, 'no script errors' + [...A.page.errors, ...B.page.errors].map(e => ': ' + e).join(''));
  } finally { await A.close(); await B.close(); }
};
