// Every building window is in Thai (only names stay English), and the items a trial, refine, slot cut, awakening or
// festival trade asks for are pictures you can tap for the item card, like the craft recipes.
const { openGame, newRoom, wait } = require('./helpers');
module.exports = async t => {
  const A = await openGame(newRoom(), { server: 'http://127.0.0.1:9' });
  try {
    await A.ev(() => localStorage.setItem('embervale.lang', 'th')); await A.page.reload(); await wait(1500);
    await A.ev(() => { document.getElementById('nameIn').value = 'ไทย'; document.getElementById('newBtn').click(); }); await wait(2000);
    const r = await A.ev(async () => {
      const sleep = ms => new Promise(r => setTimeout(r, ms)), isTh = s => /[฀-๿]/.test(s);
      const NAMES = new Set(); for (const o of [ITEMS, MOBS, ZONES, CLASSES, SKILLS, typeof MOUNTS !== 'undefined' ? MOUNTS : {}, typeof FESTS !== 'undefined' ? FESTS : {}]) for (const k in o) if (o[k] && o[k].name) NAMES.add(o[k].name);
      for (const z of ['town', 'capital']) for (const n of getZone(z).npcs) NAMES.add(n.name);
      const ok = v => !v || isTh(v) || NAMES.has(v.replace(/ ×\d+$/, '')) || !/[a-z]{3,}/i.test(v) || /^[+\d][^a-z]*[A-Z]{2,}/.test(v) || /^(\+?\d+%? )?[A-Z]{2,}( \+?\d+%?)?(, .*)?$/.test(v);
      const eng = new Map(), grab = key => { const p = document.getElementById('panel'); const w = document.createTreeWalker(p, NodeFilter.SHOW_TEXT);
        for (let n; n = w.nextNode();) { const v = n.nodeValue.trim(); if (!ok(v) && !eng.has(v)) eng.set(v, key); } };
      P.gold = 5e6; for (const id of ['red', 'sap', 'emberore', 'glintstone', 'pelt', 'bone', 'sword', 'dust']) giveItem(id, 5);
      for (const st of ['novice', 'warden', 'trial']) {
        if (st === 'novice') { P.cls = 'novice'; P.jl = 10; }
        if (st === 'warden') { P.cls = 'warden'; P.jl = 40; P.lv = 45; }
        if (st === 'trial') { P.trial = { have: 3 }; P.quest = contractOffers()[0] && { ...contractOffers()[0], have: 2 }; }
        for (const z of ['town', 'capital']) { enterZone(z); await sleep(200);
          for (const n of Z.npcs) { if (!n.role) continue; P.x = n.x + 30; P.y = n.y + 30; openNpc(n); await sleep(120); grab(st + ' ' + n.name);
            for (const b of [...document.querySelectorAll('#panel [role=tab][data-act]')].map(b => [b.dataset.act, b.dataset.arg])) {
              const el = document.querySelector(`#panel [data-act="${b[0]}"][data-arg="${b[1]}"]`); if (el) { el.click(); await sleep(80); grab(st + ' ' + n.name + ' ' + b[1]); } } } } }
      // pictures: Guild Hall trial and smithy refine
      enterZone('town'); await sleep(200); const npc = role => Z.npcs.find(n => n.role === role);
      openNpc(npc('job')); await sleep(100);
      const trialItem = document.querySelector('#panel .cmi[data-item="bone"]'), trialMob = document.querySelector('#panel .cmi.mob img');
      trialItem && trialItem.click(); await sleep(100); const card = document.getElementById('itemCard');
      const cardOk = !!card && !card.hidden && card.textContent.includes(ITEMS.bone.name);
      openNpc(npc('smith')); await sleep(100); const refineChip = !!document.querySelector('#panel .cmi[data-item="emberore"], #panel .cmi[data-item="glintstone"]');
      return { eng: [...eng].slice(0, 8), n: eng.size, trialItem: !!trialItem, trialMob: !!trialMob, cardOk, refineChip };
    });
    t.ok(r.n === 0, 'every building window is in Thai (names aside) ' + JSON.stringify(r.eng));
    t.ok(r.trialItem && r.trialMob, 'the Guild Hall trial shows the monster and the item as pictures');
    t.ok(r.cardOk, 'tapping the trial item opens its item card');
    t.ok(r.refineChip, 'the smithy shows the refine material as a picture');
    await A.ev(() => localStorage.setItem('embervale.lang', 'en'));
    t.ok(A.page.errors.length === 0, 'no script errors' + A.page.errors.map(e => ': ' + e).join(''));
  } finally { await A.close(); }
};
