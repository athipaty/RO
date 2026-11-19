// v1.42.2 keep your party after a restart: mates are remembered, re-invited when they come back, their invites accepted
const { player, newRoom, wait } = require('./helpers');
module.exports = async t => {
  const g = await player('Aria', newRoom(), { server: 'http://127.0.0.1:9' });
  try {
    await wait(800);
    const r = await g.ev(async () => { const w = ms => new Promise(r => setTimeout(r, ms)), o = {}, sent = [], L = {};
      const sock = { connected: true, id: 'me', on: (ev, fn) => { (L[ev] = L[ev] || []).push(fn); }, emit: (ev, d) => sent.push([ev, d]) }, fire = (ev, v) => (L[ev] || []).forEach(f => f(v));
      const keep = { sock: SOCK, room: NET.room }; socialAttach(sock); pkAttach(sock); SOCK = sock; NET.room = NET.room || { presence: () => Promise.resolve() };
      // in a party with Bea
      NET.others.set('pB', { n: 'Bea', z: zoneId, rx: P.x, ry: P.y, hp: 90, cls: 'warden', lv: 20 });
      fire('party', { id: 'x', leader: 'me', mode: 'share', members: [{ peer: 'me', name: 'Aria' }, { peer: 'pB', name: 'Bea' }] }); o.saved = (pkLoad() || {}).mates;
      // a restart: no party yet, Bea comes back online with a new connection
      SOC.party = null; NET.others.delete('pB'); NET.others.set('pB2', { n: 'Bea', z: zoneId, rx: P.x, ry: P.y, hp: 90, cls: 'warden', lv: 20 }); sent.length = 0; PK.sent.clear();
      await w(2800); o.reinvite = sent.some(([e, d]) => e === 'partyInvite' && d.peer === 'pB2');
      // Bea's invite (when she leads) is accepted by itself
      sent.length = 0; fire('partyInvite', { fromPeer: 'pB2', from: 'Bea' }); await w(500); o.accepted = sent.some(([e, d]) => e === 'partyAccept' && d.peer === 'pB2');
      // a stranger's invite still waits for you
      sent.length = 0; fire('partyInvite', { fromPeer: 'pZ', from: 'Zed' }); await w(500); o.stranger = !sent.some(([e]) => e === 'partyAccept');
      if (typeof hideInvite === 'function') hideInvite();
      // leaving yourself forgets the party
      soc('partyLeave', {}); o.forgot = !pkLoad();
      NET.others.delete('pB2'); SOCK = keep.sock; NET.room = keep.room; SOC.party = null; return o; });
    t.ok(Array.isArray(r.saved) && r.saved.includes('bea'), 'your party mates are remembered on this device: ' + JSON.stringify(r.saved));
    t.ok(r.reinvite, 'after a restart, a remembered mate who comes online is invited back');
    t.ok(r.accepted, 'an invite from someone you were just in a party with is accepted by itself');
    t.ok(r.stranger, 'an invite from anyone else still waits for you');
    t.ok(r.forgot, 'leaving the party yourself forgets it');
    t.ok(g.page.errors.length === 0, 'no script errors' + g.page.errors.map(e => ': ' + e).join(''));
  } finally { await g.close(); }
};
