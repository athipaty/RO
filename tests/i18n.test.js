// Thai version: switch on the title screen, text on screen in Thai, numbers patterns, canvas words, English unchanged
const { openGame, player, newRoom } = require('./helpers');
module.exports = async t => {
  const E = await player('English', newRoom(), { server: 'http://127.0.0.1:9' });
  try { t.ok(await E.ev(() => LANG === 'en' && document.querySelector('[data-open="items"]').dataset.tip === 'Items (I)'), 'English stays as it is by default'); } finally { await E.close(); }
  const A = await openGame(newRoom(), { server: 'http://127.0.0.1:9' });
  try {
    const btn = await A.ev(() => { localStorage.clear(); const b = document.getElementById('langBtn'); return b && b.textContent; });
    t.ok(btn === 'ภาษาไทย', 'the title screen has a ภาษาไทย button');
    await A.ev(() => document.getElementById('langBtn').click()); await new Promise(r => setTimeout(r, 2500));
    const title = await A.ev(() => ({ lang: LANG, html: document.documentElement.lang, start: document.getElementById('newBtn').textContent.trim() }));
    t.ok(title.lang === 'th' && title.html === 'th' && title.start === 'เริ่มการผจญภัยใหม่', 'after switching, the title screen is in Thai: ' + title.start);
    await A.ev(() => { document.getElementById('nameIn').value = 'สมชาย'; document.getElementById('newBtn').click(); }); await new Promise(r => setTimeout(r, 2000));
    const g = await A.ev(async () => { P.gold = 1234; addLog('Storage is full.'); gainExp(expNeed(1) + 5, 0); await new Promise(r => setTimeout(r, 400));
      const log = document.getElementById('log').textContent; const seen = []; const o = window.floatT; return { gold: document.getElementById('gold').textContent, tip: document.querySelector('[data-open="items"]').dataset.tip, log, tab: document.querySelector('#logTabs [data-tab="all"]').textContent, w: document.getElementById('weight').textContent, miss: thText('Miss') }; });
    t.ok(/โกลด์/.test(g.gold) && /น้ำหนัก/.test(g.w), `status box in Thai (${g.gold} · ${g.w})`);
    t.ok(g.tip === 'ไอเทม (I)' && g.tab === 'ทั้งหมด', 'dock tooltips and chat tabs in Thai');
    t.ok(/คลังเต็มแล้ว/.test(g.log) && /เลเวลฐาน 2!/.test(g.log), 'log messages are translated, including ones with numbers');
    t.ok(g.miss === 'พลาด', 'words drawn on the game (Miss, Lucky!) are translated too');
    const q = await A.ev(async () => { enterZone('town'); const n = Z.npcs.find(n => n.name === 'Elder Hollis'); P.x = n.x; P.y = n.y + 30; openNpc(n); const greet = panel.textContent;
      const b = panel.querySelector('[data-act="topen"]'); if (b) b.click(); await new Promise(r => setTimeout(r, 200)); const offer = panel.textContent; closePanel();
      await new Promise(r => setTimeout(r, 1300)); return { greet, offer, name: QUESTS.letter.name, zone: document.getElementById('zLv').textContent }; });
    t.ok(/น้ำพุนี้เห็นวีรบุรุษ/.test(q.greet) && q.name === 'จดหมายถึงช่างตีเหล็ก', 'NPC greetings and quest names are in Thai: ' + q.name);
    t.ok(/หน้าใหม่ใน Hearthvale/.test(q.offer) && /ถัดไป/.test(q.offer), 'quest conversations are in Thai');
    t.ok(/เมืองปลอดภัย/.test(q.zone), 'the region line is in Thai: ' + q.zone);
    const names = await A.ev(() => ({ npc: thText('Elder Hollis'), line: thText('Return to Brannoc the Smith'), quest: QUESTS.letter.offer[1] }));
    t.ok(names.npc === 'ผู้เฒ่าฮอลลิส' && /ช่างตีเหล็กแบรนน็อค/.test(names.line) && /แบรนน็อค/.test(names.quest) && !/Brannoc/.test(names.quest), 'NPC names are in Thai too: ' + names.npc);
    const back = await A.ev(() => { openPanel('settings'); const has = !!panel.querySelector('[data-act="setlang"][data-arg="en"]'); closePanel(); return has; });
    t.ok(back, 'Settings can switch back to English');
    t.ok(A.page.errors.length === 0, 'no script errors' + A.page.errors.map(e => ': ' + e).join(''));
  } finally { await A.close(); }
};
