// Connection display (js/ping.js): the game times a 'pingc' round trip, shows yours on the online badge (coloured),
// sends it to others (pg), draws a dot beside other players and in the party box; nothing when the server never answers.
const { player, newRoom, wait } = require('./helpers');
module.exports = async t => {
  const g = await player('Pinger', newRoom(), { server: 'http://127.0.0.1:9' });
  try {
    await wait(500);
    const r = await g.ev(async () => {
      const w = ms => new Promise(r => setTimeout(r, ms)), out = {};
      // a stand-in server that answers after 60 ms, and a room so the badge counts as online
      NET.room = NET.room || { presence: () => Promise.resolve(), onPeers() {} }; NET.ping = 0;
      NET.sock = { connected: true, emit(ev, ts, cb) { if (ev === 'pingc') setTimeout(cb, 60); } };
      pingTick(); await w(150); pingTick(); await w(150);
      const tag = document.querySelector('#onlineBadge .pingtag');
      out.ms = Math.round(NET.ping); out.tag = tag ? tag.textContent : ''; out.green = tag && /rgb\(98, 208, 122\)/.test(tag.style.color);
      updateWho(); out.kept = !!document.querySelector('#onlineBadge .pingtag');
      out.col = [pingCol(50), pingCol(150), pingCol(400)].join();
      // it rides in your presence, and a player who sends one gets a dot
      NET.lastSent = ''; NET.sendT = 0; NET.room = { presence: s => { if (out.sent === undefined) out.sent = s.pg; return Promise.resolve(); }, onPeers() {} }; netTick(.016); await w(50);
      out.recv = (() => { ingest({ peer: 'zz', presence: { v: 1, n: 'Other', c: 'warden', z: zoneId, x: P.x + 40, y: P.y, ts: Date.now(), pg: 180, lv: 5 } }); const o = NET.others.get('zz'); return o && o.pg; })();
      // a server that never answers: the tag goes away after two misses
      PING.timeout = 100; NET.sock = { connected: true, emit() {} }; pingTick(); await w(150); pingTick(); await w(150);
      out.gone = !NET.ping && !document.querySelector('#onlineBadge .pingtag');
      return out;
    });
    t.ok(r.ms >= 55 && r.ms < 140 && /\d+ ms/.test(r.tag) && r.green, `your ping shows on the online badge in green (${r.tag.trim()})`);
    t.ok(r.kept, 'it stays when the badge is rewritten');
    t.ok(r.col === '#62d07a,#e8c25a,#ef6a5a', 'green under 100 ms, yellow under 200, red above');
    t.ok(r.sent > 0 && r.recv === 180, `your ping goes out with your presence (${r.sent}) and others' arrive (${r.recv})`);
    t.ok(r.gone, 'a server that does not answer shows no ping');
    t.ok(g.page.errors.length === 0, 'no script errors' + g.page.errors.map(e => ': ' + e).join(''));
  } finally { await g.close(); }
};
