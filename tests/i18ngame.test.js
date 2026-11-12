// Thai second pass: skill names and descriptions (every level), item descriptions and the help page are in Thai
const { openGame, newRoom } = require('./helpers');
module.exports = async t => {
  const A = await openGame(newRoom(), { server: 'http://127.0.0.1:9' });
  try {
    await A.ev(() => localStorage.setItem('embervale.lang', 'th')); await A.page.reload(); await new Promise(r => setTimeout(r, 1500));
    await A.ev(() => { document.getElementById('nameIn').value = 'ไทย'; document.getElementById('newBtn').click(); }); await new Promise(r => setTimeout(r, 2000));
    const r = await A.ev(async () => { const th = s => /[฀-๿]/.test(s), bad = [];
      for (const id in SKILLS) { const s = SKILLS[id]; for (let l = 1; l <= s.max; l++) { const d = typeof s.desc === 'function' ? s.desc(l) : s.desc; if (!th(d) || /\{\d\}/.test(d)) bad.push(id + '@' + l + ': ' + d); } if (!th(s.name)) bad.push(id + ' name'); }
      const items = []; for (const id in ITEMS) { const d = ITEMS[id].desc; if (typeof d === 'string' && d && !th(d)) items.push(id + ': ' + d); }
      openPanel('help'); await new Promise(r => setTimeout(r, 400)); const p = document.getElementById('panel'); const eng = []; const w = document.createTreeWalker(p, NodeFilter.SHOW_TEXT);
      for (let n; n = w.nextNode();) { const v = n.nodeValue.trim(); if (v.split(' ').length > 5 && !th(v) && !/^\//.test(v)) eng.push(v.slice(0, 60)); }
      return { bad: bad.slice(0, 5), nBad: bad.length, items: items.slice(0, 5), nItems: items.length, eng: eng.slice(0, 5), nEng: eng.length }; });
    t.ok(r.nBad === 0, 'every skill name and description is in Thai at every level ' + JSON.stringify(r.bad));
    t.ok(r.nItems === 0, 'every item description is in Thai ' + JSON.stringify(r.items));
    t.ok(r.nEng === 0, 'the help page has no English sentences left ' + JSON.stringify(r.eng));
    await A.ev(() => localStorage.setItem('embervale.lang', 'en'));
    t.ok(A.page.errors.length === 0, 'no script errors' + A.page.errors.map(e => ': ' + e).join(''));
  } finally { await A.close(); }
};
