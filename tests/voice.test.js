// v1.52.0 party voice chat: two players in a party join voice, hear each other, see who talks, mute and leave.
// Needs a local game server (it passes the connection setup); Chrome gets a fake microphone that beeps.
//   EMBER_SERVER=http://localhost:5055 GAME_URL=http://localhost:8080/index.html npm test -- voice
const pptr = require('puppeteer-core');
const { BROWSER, wait } = require('./helpers');

module.exports = async t => {
  if (!process.env.EMBER_SERVER || !process.env.GAME_URL) { t.ok(true, 'skipped (set EMBER_SERVER and GAME_URL to run against a local game server)'); return; }
  const browser = await pptr.launch({ executablePath: BROWSER, headless: true,
    args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', '--autoplay-policy=no-user-gesture-required'] });
  try {
    const room = 'vc' + Date.now(), url = `${process.env.GAME_URL}?room=${room}&server=${encodeURIComponent(process.env.EMBER_SERVER)}`;
    const open = async name => { const ctx = await browser.createBrowserContext(); const p = await ctx.newPage(); p.errs = []; p.on('pageerror', e => p.errs.push(e.message));
      await p.goto(url); await wait(2500); await p.evaluate(n => { document.getElementById('nameIn').value = n; document.getElementById('newBtn').click(); }, name); return p; };
    const A = await open('Voxa'), B = await open('Voxb');
    await wait(4000);
    for (const p of [A, B]) await p.evaluate(() => enterZone('meadow'));
    await wait(2500);
    await A.evaluate(() => document.getElementById('onlineBadge').click()); await wait(400);
    await A.evaluate(() => [...document.querySelectorAll('#whoList .wb button')].find(x => x.textContent === 'Invite').click()); await wait(1500);
    await B.evaluate(() => document.getElementById('invYes').click()); await wait(1500);
    t.ok(await A.evaluate(() => !!SOC.party && !!document.getElementById('pVoice')), 'a party has the voice button');

    await A.evaluate(() => document.getElementById('pVoice').click()); await wait(1500);
    await B.evaluate(() => document.getElementById('pVoice').click()); await wait(5000);
    const st = p => p.evaluate(() => ({ on: VC.on, pcs: [...VC.pcs.values()].map(e => e.pc.connectionState),
      audio: [...VC.pcs.values()].some(e => e.audio && e.audio.srcObject && e.audio.srcObject.getAudioTracks().length > 0) }));
    const a = await st(A), b = await st(B);
    t.ok(a.on && b.on && a.pcs[0] === 'connected' && b.pcs[0] === 'connected' && a.audio && b.audio, 'both join voice and hear each other ' + JSON.stringify([a, b]));
    let talk = 0; for (let i = 0; i < 30 && !talk; i++) { talk = await A.evaluate(() => document.querySelectorAll('#partyBox .pmr.vctalk').length); await wait(100); }
    t.ok(talk > 0 && await A.evaluate(() => document.querySelectorAll('#partyBox .pmr.vcin').length === 2), 'the party box shows who is in voice and who is talking');
    await A.evaluate(() => document.getElementById('pMic').click());
    t.ok(await A.evaluate(() => VC.muted && VC.stream.getAudioTracks().every(x => !x.enabled)), 'the microphone button mutes you');
    await B.evaluate(() => document.getElementById('pVoice').click()); await wait(1500);
    t.ok(await A.evaluate(() => VC.pcs.size === 0) && await B.evaluate(() => !VC.on), 'leaving voice closes the connection for both');
    t.ok(A.errs.length === 0 && B.errs.length === 0, 'no script errors' + [...A.errs, ...B.errs].map(e => ': ' + e).join(''));
  } finally { await browser.close(); }
};
