// Founding a guild: a bad name, a server refusal or no answer shows in the Guild window, not only in the chat log
const { player, wait, newRoom } = require('./helpers');
module.exports = async t => {
  const g = await player('Founder', newRoom(), { server: 'http://127.0.0.1:9' });
  try {
    await wait(400);
    const r = await g.ev(async () => { const sleep = ms => new Promise(r => setTimeout(r, ms)), out = {};
      // pretend: logged in, server reachable; a fake socket records what is sent and lets us answer
      const H = {}, sent = []; const fake = { connected: true, id: 'me', on: (ev, fn) => { (H[ev] = H[ev] || []).push(fn); }, emit: (ev, d) => sent.push(ev) };
      guildAttach(fake); const keep = { tok: ACC.token, room: NET.room, sock: SOCK }; ACC.token = 'x'; NET.room = { server: true, presence: () => {}, send: () => {}, leave: () => {} }; SOCK = fake; P.gold = 20000;
      openPanel('guild'); await sleep(50);
      document.getElementById('gName').value = 'สมาคมไทย'; panel.querySelector('[data-act="gcreate"]').click(); await sleep(50);
      out.thai = (panel.querySelector('.gmsg') || {}).textContent || ''; out.notSent = !sent.includes('guildCreate');
      document.getElementById('gName').value = 'Ember Wardens'; panel.querySelector('[data-act="gcreate"]').click(); await sleep(50);
      out.busy = /Founding/.test(panel.querySelector('[data-act="gcreate"]').textContent) && sent.includes('guildCreate');
      for (const fn of H.socialError || []) fn({ error: 'That guild name is taken.' }); await sleep(50);
      out.taken = (panel.querySelector('.gmsg') || {}).textContent || ''; out.again = !panel.querySelector('[data-act="gcreate"]').disabled;
      ACC.token = keep.tok; NET.room = keep.room; SOCK = keep.sock; closePanel(); return out; });
    t.ok(/English letters/.test(r.thai) && r.notSent, 'a name the server would refuse is explained in the window (' + r.thai + ')');
    t.ok(r.busy, 'a good name is sent and the button says Founding…');
    t.ok(r.taken === 'That guild name is taken.' && r.again, 'the server\'s answer shows in the window and you can try again');
    t.ok(g.page.errors.length === 0, 'no script errors' + g.page.errors.map(e => ': ' + e).join(''));
  } finally { await g.close(); }
};
