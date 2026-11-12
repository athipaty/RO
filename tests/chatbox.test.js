// the chat box: fold/open from the top (grows upward), unread dots, click a name to whisper, reading older lines
const { player, newRoom } = require('./helpers');
module.exports = async t => {
  const A = await player('Chatty', newRoom(), { server: 'http://127.0.0.1:9' });
  try {
    const r = await A.ev(async () => { const w = ms => new Promise(r => setTimeout(r, ms)); const el = document.getElementById('log');
      for (let i = 0; i < 30; i++) addLog('line ' + i);
      if (LOGUI.big) document.getElementById('logToggle').click(); await w(100); const small = el.getBoundingClientRect();
      document.getElementById('logToggle').click(); await w(100); const big = el.getBoundingClientRect(); const remembered = localStorage.getItem('embervale.logBig');
      document.getElementById('logToggle').click(); await w(50);
      return { grows: big.height > small.height + 40, bottomFixed: Math.abs(big.bottom - small.bottom) < 2, remembered, latest: el.scrollTop >= el.scrollHeight - el.clientHeight - 2 }; });
    t.ok(r.grows && r.bottomFixed, 'the ▲ button on top opens the chat box upward; the bottom stays put');
    t.ok(r.remembered === '1' && r.latest, 'the choice is remembered and the newest lines stay in view');
    const unread = await A.ev(() => { document.querySelector('#logTabs [data-tab="guild"]').click(); logLine('party', '[Party] Bea: ', 'hi'); return new Promise(r => setTimeout(() => { const dot = document.querySelector('#logTabs [data-tab="party"]').classList.contains('unread');
      document.querySelector('#logTabs [data-tab="party"]').click(); const gone = !document.querySelector('#logTabs [data-tab="party"]').classList.contains('unread'); document.querySelector('#logTabs [data-tab="all"]').click(); r({ dot, gone }); }, 50)); });
    t.ok(unread.dot && unread.gone, 'a dot marks a tab with unread messages until you open it');
    const wsp = await A.ev(() => { chatLog('Bea', 'hello there', zoneId, false, false); const b = [...document.querySelectorAll('#log .l-chat b')].pop(); b.click(); const v = document.getElementById('chatIn').value; closeChat();
      logLine('whisper', '[From Kai] ', 'psst'); [...document.querySelectorAll('#log .l-whisper b')].pop().click(); const v2 = document.getElementById('chatIn').value; document.getElementById('chatIn').value = ''; closeChat(); return { v, v2 }; });
    t.ok(wsp.v === '/w Bea ' && wsp.v2 === '/w Kai ', 'clicking a player\'s name starts a whisper to them');
    const read = await A.ev(async () => { const w = ms => new Promise(r => setTimeout(r, ms)); const el = document.getElementById('log'); await w(250); el.scrollTop = 0; el.dispatchEvent(new Event('scroll')); await w(200);
      chatLog('Bea', 'new message', zoneId, false, false); await w(100); const stayed = el.scrollTop < 30, btn = !document.getElementById('logJump').hidden; document.getElementById('logJump').click(); await w(50);
      return { stayed, btn, back: el.scrollTop >= el.scrollHeight - el.clientHeight - 2, dbg: [LOGUI.reading, LOGUI.top, el.scrollHeight, el.clientHeight] }; });
    t.ok(read.stayed && read.btn && read.back, JSON.stringify(read) + ' reading older lines, new chat does not yank you down; "New messages" takes you back');
    t.ok(A.page.errors.length === 0, 'no script errors' + A.page.errors.map(e => ': ' + e).join(''));
  } finally { await A.close(); }
};
