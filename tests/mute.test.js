// Stage 7 mute: a personal list of players whose chat, emotes and requests you don't see.
// Runs on the public-broker backup (no game server needed) with two browsers in a private room.
const { player, wait, newRoom } = require('./helpers');
const poll = async (g, fn, ms = 8000) => { const end = Date.now() + ms; while (Date.now() < end) { if (await g.ev(fn)) return true; await wait(250); } return false; };
module.exports = async t => {
  const room = newRoom(), OFFLINE = 'http://127.0.0.1:9';
  const A = await player('Hush', room, { zone: 'meadow', server: OFFLINE });
  await wait(2000);
  const B = await player('Chatty', room, { zone: 'meadow', server: OFFLINE });
  try {
    t.ok(await poll(A, () => NET.others.size === 1), 'the two players see each other');
    await B.ev(() => sendChat('hello there'));
    t.ok(await poll(A, () => [...document.querySelectorAll('#log div')].some(d => d.textContent.includes('hello there'))), 'before muting, chat arrives');
    await A.ev(() => sendChat('/mute Chatty'));
    const st = await A.ev(() => ({ muted: isMuted('chatty'), saved: JSON.parse(localStorage.getItem('embervale.muted')) }));
    t.ok(st.muted && st.saved[0] === 'Chatty', '/mute adds them to a list kept in this browser (names match in any case)');
    await B.ev(() => { sendChat('can you hear me'); doEmote(EMOTE_KEYS[0]); });
    await wait(3000);
    const after = await A.ev(() => { const o = [...NET.others.values()][0]; return { log: [...document.querySelectorAll('#log div')].some(d => d.textContent.includes('can you hear me')), bubble: !!o.bubble, emote: !!o.emote }; });
    t.ok(!after.log && !after.bubble && !after.emote, `muted players' chat, speech bubbles and emotes are hidden (${JSON.stringify(after)})`);
    t.ok(await B.ev(() => [...document.querySelectorAll('#log div')].some(d => d.textContent.includes('can you hear me'))), 'the muted player is not told and still sees their own chat');
    const s = await A.ev(() => { openPanel('settings'); const r = [...panel.querySelectorAll('[data-act="unmute"]')].map(b => b.dataset.arg); panel.querySelector('[data-act="unmute"]').click(); const after = isMuted('Chatty'); const empty = panel.textContent.includes('Nobody. Mute someone'); closePanel(); return { r, after, empty }; });
    t.ok(s.r.join() === 'Chatty' && !s.after && s.empty, 'Settings lists muted players and Unmute works');
    await B.ev(() => sendChat('back again'));
    t.ok(await poll(A, () => [...document.querySelectorAll('#log div')].some(d => d.textContent.includes('back again'))), 'after unmuting, chat arrives again');
    t.ok(await A.ev(() => { sendChat('/mute Hush'); return !isMuted('Hush'); }), 'you cannot mute yourself');
    // server messages (whispers, party/guild chat, invites, trades) from a muted name are dropped
    const srv = await A.ev(() => { const h = {}; const fake = { on: (e, f) => { h[e] = f; }, emit() {}, connected: false };
      socialAttach(fake); if (typeof guildAttach === 'function') guildAttach(fake); muteToggle('Chatty', true);
      const n0 = document.querySelectorAll('#log div').length;
      h.whisper({ from: 'chatty', text: 'psst' }); h.partyChat({ from: 'Chatty', text: 'pp' }); if (h.guildChat) h.guildChat({ from: 'Chatty', text: 'gg' });
      h.partyInvite({ fromPeer: 'x', from: 'Chatty' }); h.tradeRequest({ fromPeer: 'x', from: 'Chatty' }); if (h.guildInvite) h.guildInvite({ gid: 'g1', guild: 'G', from: 'Chatty' });
      const r = { lines: document.querySelectorAll('#log div').length - n0, invite: !document.getElementById('invite').hidden, last: SOC.lastWhisper, ginv: typeof GD !== 'undefined' && !!GD.invite };
      muteToggle('Chatty', false); h.whisper({ from: 'Chatty', text: 'psst2' }); r.unmutedWhisper = [...document.querySelectorAll('#log div')].some(d => d.textContent.includes('psst2'));
      return r; });
    t.ok(srv.lines === 0 && !srv.invite && !srv.last && !srv.ginv && srv.unmutedWhisper, `whispers, party and guild chat and invites from a muted name are dropped (${JSON.stringify(srv)})`);
    t.ok(A.page.errors.length === 0 && B.page.errors.length === 0, 'no script errors' + [...A.page.errors, ...B.page.errors].map(e => ': ' + e).join(''));
  } finally { await A.close(); await B.close(); }
};
