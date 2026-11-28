// v1.73.0: a calmer phone screen, a phone chat sheet, the Today board, weekly goals, Looking for party and the hunting tip
// (js/calm.js, js/phonechat.js, js/today.js), on a phone-sized touch screen.
const pptr = require('puppeteer-core'); const { BROWSER, newRoom, wait } = require('./helpers'); const path = require('path'), url = require('url');
const GAME = url.pathToFileURL(path.join(__dirname, '..', 'index.html')).href;
module.exports = async t => {
  const b = await pptr.launch({ executablePath: BROWSER, headless: true }); const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  try {
    await p.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 1 });
    await p.goto(GAME + '?room=' + newRoom() + '&server=' + encodeURIComponent('http://127.0.0.1:9')); await wait(2000);
    await p.evaluate(() => { localStorage.clear(); document.getElementById('nameIn').value = 'Pocket'; document.getElementById('newBtn').click(); }); await wait(2500);
    const ev = (f, ...a) => p.evaluate(f, ...a);
    // empty hotbar slots hide while playing
    const slots = await ev(async () => { const w = ms => new Promise(r => setTimeout(r, ms)); P.bar = [{ i: 'red' }, null, null, null, null, null, null, null]; if (typeof rebuildHotbar === 'function') rebuildHotbar(); await w(700);
      const e = document.querySelector('#hotbar .slot.empty'); return { phone: document.body.classList.contains('touchui'), hidden: e ? getComputedStyle(e).visibility === 'hidden' : null }; });
    t.ok(slots.phone && slots.hidden === true, 'on a phone, empty hotbar slots are hidden while playing');
    // big popups take turns
    const q = await ev(async () => { const w = ms => new Promise(r => setTimeout(r, ms)); regionCard('woods'); achToast('Test', 'Tester', 0); await w(300);
      const a = document.getElementById('zoneCard').classList.contains('show'), b2 = (document.getElementById('achToast') || { classList: { contains: () => false } }).classList.contains('show');
      await w(4800); const c = (document.getElementById('achToast') || { classList: { contains: () => false } }).classList.contains('show'); return { a, b2, c }; });
    t.ok(q.a && !q.b2 && q.c, 'the region card and an achievement toast take turns (not both at once)');
    // chat sheet, quick replies, unread badge
    const c = await ev(async () => { const w = ms => new Promise(r => setTimeout(r, ms)); closeChat && closeChat(); chatLog('Ana', 'hi there', zoneId, false); chatLog('Bo', 'anyone?', zoneId, false); await w(200);
      const badge = (document.querySelector('#logSay .pcn') || {}).textContent; openChat(); await w(300);
      const open = document.body.classList.contains('chatopen'), quick = document.querySelectorAll('#quickSay .qs').length, lg = document.getElementById('log').getBoundingClientRect();
      const after = document.querySelector('#logSay .pcn'); closeChat(); await w(400); return { badge, open, quick, wide: lg.width > 350, cleared: !after, closed: !document.body.classList.contains('chatopen') }; });
    t.ok(c.badge === '2', `messages from players while the chat is closed put a count on 💬 (${c.badge})`);
    t.ok(c.open && c.quick === 0 && c.wide && c.cleared, 'opening the chat shows a full-width sheet (no quick replies since v1.94.10), and the count clears');
    t.ok(c.closed, 'closing the chat closes the sheet');
    // Looking for party: others get an Invite button
    t.ok(await ev(async () => { chatLog('Cy', '[LFG] Lv 9 Ranger looking for a party in Greenmoss Meadow', zoneId, false); await new Promise(r => setTimeout(r, 100)); const last = document.getElementById('log').lastElementChild; return !!(last && last.querySelector('.lfgInv')); }), 'a Looking for party message from someone else has an Invite button');
    // the Today board and weekly goals
    const td = await ev(() => { openPanel('today'); const txt = panel.textContent; const w = wkState(); w.c.mobs = 300; refreshPanel(); const g0 = P.gold; PANEL_ACTS.tdwk('mobs'); const paid = P.gold - g0; const again = P.gold; PANEL_ACTS.tdwk('mobs'); closePanel();
      return { has: /Daily gift/.test(txt) && /Daily quests/.test(txt) && /Weekly goals/.test(txt) && /Boss board/.test(txt) && /Looking for party/.test(txt), paid, once: P.gold === again, menu: !!document.getElementById('mToday') }; });
    t.ok(td.has && td.menu, 'the Today board (☰ → Today) shows the gift, dailies, bounties, weekly goals, play together and the boss board');
    t.ok(td.paid > 0 && td.once, `a finished weekly goal pays once (+${td.paid} gold)`);
    // nothing to do: no goal at all; Show the way still points the arrow
    const g = await ev(() => { P.lv = 22; P.qs = { active: {}, done: Object.keys(QUESTS), daily: {} }; P.quest = null; P.cls = 'warden'; P.jl = 20; enterZone('town'); const w = goalWhat(); PANEL_ACTS.tdboss('hopperchief|meadow'); const o = goalWhat(); return { w: w && w.text, z: w && w.zone, o: o && o.text }; });
    t.ok(!g.w, `with no quest there is no goal chip or arrow (v1.86.1: the "Good hunting" suggestion is gone) (${g.w})`);
    t.ok(g.o === 'Hunt Hopper Chieftain', 'Show the way on the boss board points the goal arrow at that boss');
    t.ok(!errs.length, 'no script errors ' + errs.slice(0, 3).join(' | '));
  } finally { await b.close(); }
};
