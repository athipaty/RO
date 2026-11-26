// v1.66.0: when someone in your party is in the voice chat you start listening by yourself; leaving it yourself is remembered
const { player, wait, newRoom } = require('./helpers');
module.exports = async t => {
  const g = await player('Listener', newRoom(), { server: 'http://127.0.0.1:9' });
  try {
    await wait(500);
    const r = await g.ev(() => { const out = {}, keep = { party: SOC.party };
      // a party of two; the other one is in the voice chat
      SOC.party = { id: 'p1', members: [{ peer: 'pal', n: 'Pal' }] }; // selfPeer() is empty offline
      const calls = []; const realJoin = vcJoin; vcJoin = function (lo) { calls.push(lo); VC.on = true; VC.listen = !!lo; };
      try { localStorage.removeItem('embervale.vcAuto'); } catch (e) {} VCA.pref = true; VC.on = false;
      vcState({ peers: ['pal'] }); out.autoJoined = calls.length === 1 && calls[0] === true && VC.on && VCA.auto;
      // the others leave: the listener who came in this way leaves too
      vcState({ peers: [] }); out.autoLeft = !VC.on;
      // leave by hand: not pulled back in
      vcState({ peers: ['pal'] }); VC.on = true; vcLeave(); out.prefOff = VCA.pref === false && localStorage.getItem('embervale.vcAuto') === 'off';
      VC.on = false; const n0 = calls.length; vcState({ peers: ['pal'] }); out.stayedOut = calls.length === n0;
      // press 🎙 again: auto-listen is back on
      vcJoin = realJoin; VC.joining = true; vcJoin(false); VC.joining = false; out.prefOn = VCA.pref === true;
      SOC.party = keep.party; VC.on = false; return out; });
    t.ok(r.autoJoined, 'someone in your party is in the voice chat: you join to listen, without a microphone');
    t.ok(r.autoLeft, 'when the others have left, the listener brought in this way leaves too');
    t.ok(r.prefOff && r.stayedOut, 'leaving the voice chat yourself is remembered: you are not pulled back in');
    t.ok(r.prefOn, 'pressing 🎙 again turns listening by yourself back on');
  } finally { await g.close(); }
};
