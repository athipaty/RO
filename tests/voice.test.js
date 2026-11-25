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
    // the Sound window: ♪ opens it; a member's volume slider sets how loud you hear them
    const mix = await A.evaluate(() => { document.getElementById('muteBtn').click(); const open = panelKind === 'sound';
      const sl = [...panel.querySelectorAll('input[data-snd^="vp:"]')][0]; if (!sl) return { open, sl: false };
      sl.value = 30; sl.dispatchEvent(new Event('input', { bubbles: true })); vcApplyVol();
      const vol = [...VC.pcs.values()][0].audio.volume; const all = !!panel.querySelector('input[data-snd="vall"]') && !!panel.querySelector('input[data-snd="mv"]'); closePanel(); return { open, sl: true, vol, all }; });
    t.ok(mix.open && mix.sl && mix.all && Math.abs(mix.vol - .3) < .02, "the ♪ button opens the Sound window; a party member's volume slider sets how loud you hear them " + JSON.stringify(mix));
    // v1.60.3: relay servers from the game server reach the game, and a restarted connection comes back
    const ice = await A.evaluate(() => VC.extraIce);
    if (process.env.EXPECT_RELAY) t.ok(ice.length > 0 && JSON.stringify(ice).includes('turn:'), 'relay servers from the game server reach the game ' + JSON.stringify(ice));
    await A.evaluate(() => { for (const [p, e] of VC.pcs) vcRetry(p, e); }); await B.evaluate(() => { for (const [p, e] of VC.pcs) vcRetry(p, e); }); await wait(6000);
    const re = p => p.evaluate(() => [...VC.pcs.values()].map(e => e.pc.connectionState + ':' + (e.audio && e.audio.srcObject ? e.audio.srcObject.getAudioTracks().length : 0)));
    const ra = await re(A), rb = await re(B);
    t.ok(ra[0] === 'connected:1' && rb[0] === 'connected:1', 'after a connection restart both still hear each other ' + JSON.stringify([ra, rb]));
    await A.evaluate(() => document.getElementById('pMic').click());
    t.ok(await A.evaluate(() => VC.muted && VC.stream.getAudioTracks().every(x => !x.enabled)), 'the microphone button mutes you');
    await B.evaluate(() => document.getElementById('pVoice').click()); await wait(1500);
    t.ok(await A.evaluate(() => VC.pcs.size === 0) && await B.evaluate(() => !VC.on), 'leaving voice closes the connection for both');
    // listen only: B hears A without the microphone ever being asked for
    await A.evaluate(() => { if (VC.muted) vcMute(); });
    await B.evaluate(() => { window.__gum = 0; const g = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices); navigator.mediaDevices.getUserMedia = c => { window.__gum++; return g(c); }; vcJoin(true); });
    await wait(5000);
    const li = await B.evaluate(() => ({ on: VC.on, listen: VC.listen, gum: window.__gum, pc: [...VC.pcs.values()].map(e => e.pc.connectionState), hear: [...VC.pcs.values()].some(e => e.audio && e.audio.srcObject && e.audio.srcObject.getAudioTracks().length > 0), icon: document.getElementById('pMic')._pic }));
    t.ok(li.on && li.listen && li.gum === 0 && li.pc[0] === 'connected' && li.hear && li.icon === 'listen', 'listen only: you hear the party and the microphone is never asked for ' + JSON.stringify(li));
    t.ok(A.errs.length === 0 && B.errs.length === 0, 'no script errors' + [...A.errs, ...B.errs].map(e => ': ' + e).join(''));
  } finally { await browser.close(); }
};
