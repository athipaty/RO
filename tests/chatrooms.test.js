// #48 chat rooms (game side, with a stand-in socket): commands, the Room tab, messages, muting.
const { player, newRoom } = require('./helpers');
module.exports = async t => {
  const A = await player('Roomie', newRoom(), { server: 'http://127.0.0.1:9' });
  try {
    const r = await A.ev(() => {
      const H = {}, sent = []; const sock = { on: (ev, fn) => { H[ev] = fn; } }; roomsAttach(sock);
      const realSoc = soc; soc = (ev, data) => { sent.push([ev, data]); return true; }; const realRoom = NET.room; NET.room = NET.room || { presence: () => Promise.resolve() };
      sendChat('/join Traders'); const join = JSON.stringify(sent.pop());
      H.room({ name: 'Traders', members: ['Roomie', 'Bea'] }); const tab = document.querySelector('#logTabs [data-tab="room"]').textContent;
      H.roomChat({ room: 'Traders', from: 'Bea', text: 'selling pelts' }); const line = [...document.querySelectorAll('#log .l-room')].map(d => d.textContent).join('|');
      document.querySelector('#logTabs [data-tab="room"]').click(); sendChat('hello room'); const typed = JSON.stringify(sent.pop());
      sendChat('/room via command'); const cmd = JSON.stringify(sent.pop());
      MUTED.push('Bea');
      const n0 = document.querySelectorAll('#log .l-room').length; H.roomChat({ room: 'Traders', from: 'Bea', text: 'spam' }); const mutedHidden = document.querySelectorAll('#log .l-room').length === n0; MUTED.pop();
      sendChat('/rooms'); const list = JSON.stringify(sent.pop()); H.roomList([{ name: 'Traders', n: 2 }, { name: 'Party Finder', n: 7 }]); const listed = /Party Finder \(7\)/.test(document.getElementById('log').textContent);
      sendChat('/part'); const part = JSON.stringify(sent.pop()); H.room(null); const tab2 = document.querySelector('#logTabs [data-tab="room"]').textContent;
      document.querySelector('#logTabs [data-tab="all"]').click(); soc = realSoc; NET.room = realRoom;
      return { join, tab, line, typed, cmd, mutedHidden, list, listed, part, tab2 }; });
    t.ok(/roomJoin.*Traders/.test(r.join), '/join asks the server for the room');
    t.ok(r.tab === 'Room: Traders' && /\[Traders\] Bea: selling pelts/.test(r.line), 'the Room tab shows the room and its messages');
    t.ok(/roomChat.*hello room/.test(r.typed) && /roomChat.*via command/.test(r.cmd), 'typing with the Room tab open, or /room text, talks in the room');
    t.ok(r.mutedHidden, 'muted players stay hidden in rooms');
    t.ok(/roomList/.test(r.list) && r.listed, '/rooms lists the busiest rooms');
    t.ok(/roomLeave/.test(r.part) && r.tab2 === 'Room', '/part leaves');
    t.ok(A.page.errors.length === 0, 'no script errors' + A.page.errors.map(e => ': ' + e).join(''));
  } finally { await A.close(); }
};
