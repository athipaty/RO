// v1.38.0 chat rooms opened where you stand (Alt+C): the create window, the bubble over your head (presence cr),
// tapping someone's bubble to join (password, full rooms), the room window, removing someone, closing the room.
const { player, newRoom, wait } = require('./helpers');
module.exports = async t => {
  const A = await player('Roomie', newRoom(), { server: 'http://127.0.0.1:9' });
  try {
    await wait(800);
    const r = await A.ev(async () => {
      const w = ms => new Promise(r => setTimeout(r, ms)), H = {}, sent = [], o = {};
      const sock = { on: (ev, fn) => { (H[ev] = H[ev] || []).push(fn); } }; roomsAttach(sock); const fire = (ev, v) => (H[ev] || []).forEach(f => f(v));
      const realSoc = soc, realSock = SOCK, realRoom = NET.room; soc = (ev, data) => { sent.push([ev, data]); return true; };
      SOCK = { connected: true, emit: (ev, data) => sent.push([ev, data]) }; NET.room = NET.room || { presence: () => Promise.resolve() };
      P.tut = 'done'; enterZone('town'); await w(200);
      // Alt+C opens the create window
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'c', altKey: true, bubbles: true })); await w(50); o.altC = panelKind === 'crcreate';
      document.getElementById('crTitle').value = 'Crypt party'; document.getElementById('crMax').value = '3'; document.getElementById('crPw').value = '';
      PANEL_ACTS.crmake(); const join = sent.find(s => s[0] === 'roomJoin'); o.joined = !!join; const rn = join && join[1].name;
      fire('room', { name: rn, members: ['Roomie'] }); o.window = panelKind === 'chatroom' && /Crypt party/.test(panel.textContent);
      o.pres = JSON.stringify(chatroomPresence());
      // talking: the line goes to the server, and what comes back shows in the window
      document.getElementById('crSay').value = 'anyone for the crypt?'; PANEL_ACTS.crsay(); o.said = /roomChat.*anyone for the crypt/.test(JSON.stringify(sent[sent.length - 1]));
      fire('roomChat', { room: rn, from: 'Bea', text: 'me!' }); o.shown = /Bea.*me!/.test(document.getElementById('crLog').textContent);
      // removing someone sends a control line that is never shown
      fire('room', { name: rn, members: ['Roomie', 'Bea'] }); PANEL_ACTS.crkick('Bea'); o.kick = /§cr:kick:Bea/.test(JSON.stringify(sent[sent.length - 1]));
      PANEL_ACTS.crleave(); o.closed = sent.some(s => s[0] === 'roomChat' && s[1].text === '§cr:close') && sent.some(s => s[0] === 'roomLeave') && chatroomPresence() === null;
      fire('room', null);
      // someone else's room: their bubble, tapping it, a password, a full room
      const pw = 'abc', other = { t: 'Selling pelts', r: 'crbea1234', n: 1, m: 4, h: null };
      other.h = (s => { let h = 5381; for (const c of String(s)) h = ((h << 5) + h + c.charCodeAt(0)) | 0; return (h >>> 0).toString(36); })(other.r + '|' + pw);
      NET.others.set('peerB', { n: 'Bea', z: 'town', x: P.x + 60, y: P.y, rx: P.x + 60, ry: P.y, cls: 'novice', lv: 5, cr: chatroomRead(other), look: P.look });
      const p = proj(P.x + 60, P.y), sc = { x: p.x, y: p.y - 92 }; o.hit = !!chatroomAt(sc);
      rcJoin(NET.others.get('peerB')); o.askPw = panelKind === 'crpass';
      document.getElementById('crJoinPw').value = 'nope'; const n0 = sent.length; PANEL_ACTS.crpass(); o.wrongPw = sent.length === n0;
      document.getElementById('crJoinPw').value = 'abc'; PANEL_ACTS.crpass(); o.rightPw = /roomJoin.*crbea1234/.test(JSON.stringify(sent[sent.length - 1]));
      fire('room', { name: 'crbea1234', members: ['Bea', 'Roomie'] });
      // the owner closing the room puts everyone out
      fire('roomChat', { room: 'crbea1234', from: 'Bea', text: '§cr:close' }); o.outOnClose = sent[sent.length - 1][0] === 'roomLeave' && !/§cr/.test(document.getElementById('log').textContent);
      fire('room', null);
      const full = NET.others.get('peerB'); full.cr = chatroomRead({ ...other, h: null, n: 4, m: 4 }); const n1 = sent.length; rcJoin(full); o.fullRefused = sent.length === n1;
      NET.others.delete('peerB'); soc = realSoc; SOCK = realSock; NET.room = realRoom; closePanel();
      return o; });
    t.ok(r.altC, 'Alt+C opens "Create a chat room"');
    t.ok(r.joined && r.window, 'opening the room joins it and shows its window');
    t.ok(/"t":"Crypt party".*"m":3/.test(r.pres), 'a bubble with the title and the limit goes out with your presence: ' + r.pres);
    t.ok(r.said && r.shown, 'talking in the room window, and what others say shows there');
    t.ok(r.kick, 'the owner can ask someone to leave');
    t.ok(r.closed, 'closing the room tells everyone, leaves it and takes the bubble down');
    t.ok(r.hit, "tapping above someone's head finds their bubble");
    t.ok(r.askPw && r.wrongPw && r.rightPw, 'a room with a password asks for it, and only the right one gets in');
    t.ok(r.outOnClose, 'when the owner closes the room, the others leave it (the control line is never shown)');
    t.ok(r.fullRefused, 'a full room cannot be joined');
    t.ok(A.page.errors.length === 0, 'no script errors' + A.page.errors.map(e => ': ' + e).join(''));
  } finally { await A.close(); }
};
