// a cleaner game screen: quiet log fades, Chat tab, NPC names only near, role icons, dock tooltips
const { player, newRoom } = require('./helpers');
module.exports = async t => {
  const A = await player('Tidy', newRoom(), { server: 'http://127.0.0.1:9' });
  try {
    const fade = await A.ev(async () => { LOGFADE.quiet = 800; logWake(); await new Promise(r => setTimeout(r, 2300)); const idle = document.getElementById('log').classList.contains('idle');
      logLine('whisper', '[From Bea] ', 'hi'); await new Promise(r => setTimeout(r, 50)); const woke = !document.getElementById('log').classList.contains('idle'); LOGFADE.quiet = 7000; return { idle, woke }; });
    t.ok(fade.idle && fade.woke, 'the log fades when quiet and wakes for new chat');
    const tab = await A.ev(() => { addLog('A system line'); const say = document.createElement('div'); say.className = 'l-chat'; say.textContent = 'Bea: hello'; document.getElementById('log').appendChild(say);
      document.querySelector('#logTabs [data-tab="chat"]').click(); const vis = [...document.querySelectorAll('#log > div:not(#logTabs)')].filter(d => getComputedStyle(d).display !== 'none').map(d => d.textContent);
      document.querySelector('#logTabs [data-tab="all"]').click(); return { chat: vis.some(v => /Bea: hello/.test(v)), sys: vis.some(v => /A system line/.test(v)) }; });
    t.ok(tab.chat && !tab.sys, 'the Chat tab shows what players say and hides system lines');
    const npc = await A.ev(async () => { enterZone('town'); const near = Z.npcs.find(n => n.role === 'shop'); P.x = near.x; P.y = near.y + 30; const far = Z.npcs.reduce((a, n) => Math.hypot(n.x - P.x, n.y - P.y) > Math.hypot(a.x - P.x, a.y - P.y) ? n : a);
      const seen = new Set(); const o = label; label = (txt, ...r) => { seen.add(txt); return o(txt, ...r); }; let icons = 0; const ri = drawRoleIcon; drawRoleIcon = (...a) => { icons++; return ri(...a); };
      await new Promise(r => setTimeout(r, 500)); label = o; drawRoleIcon = ri; return { near: seen.has(near.name), far: seen.has(far.name), farName: far.name, icons }; });
    t.ok(npc.near && !npc.far, `NPC names show up close and hide far away (${npc.farName} hidden)`);
    t.ok(npc.icons > 3, 'townsfolk show an icon of what they do');
    const tips = await A.ev(() => { const b = document.querySelector('#dock .dk[data-open="items"]'); return { tip: b.dataset.tip, title: b.getAttribute('title'), loot: document.getElementById('autoLootBtn').dataset.tip }; });
    t.ok(/Items/.test(tips.tip) && !tips.title && /drop/i.test(tips.loot), 'dock buttons have quick tooltips with the name and key');
    const banner = await A.ev(() => { showBanner('Test', 'sub'); const r = document.getElementById('zoneBanner').getBoundingClientRect(); const toast = 70 + 60; return { top: r.top, h: r.height, vh: innerHeight }; });
    t.ok(banner.top >= 130 && banner.top + banner.h < banner.vh * .4, `the region banner sits high and small (${Math.round(banner.top)}–${Math.round(banner.top + banner.h)}px), clear of you and the toasts`);
    t.ok(A.page.errors.length === 0, 'no script errors' + A.page.errors.map(e => ': ' + e).join(''));
  } finally { await A.close(); }
};
