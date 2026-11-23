// #54/55 quests: NPC dialogue, story chain, objectives, dailies, quest log, tracker, markers and saving.
const { player, wait, newRoom } = require('./helpers');

module.exports = async t => {
  const g = await player('Quester', newRoom(), { zone: 'town', server: 'http://127.0.0.1:9' });
  try {
    await wait(1200);
    const hol = await g.ev(() => { const n = Z.npcs.find(n => n.name === 'Elder Hollis'); const tile = Z.t[Math.floor(n.y / TILE) * Z.w + Math.floor(n.x / TILE)];
      return { ok: !!n, walk: !BLOCK[tile], mark: npcMark(n), smith: npcMark(Z.npcs.find(n => n.name === 'Brannoc the Smith')) }; });
    t.ok(hol.ok && hol.walk, 'Elder Hollis stands in Hearthvale on open ground');
    t.ok(hol.mark === 'offer' && hol.smith === 'svc', 'Hollis shows a "!" marker; the smith shows the normal marker');

    const d = await g.ev(() => { const n = Z.npcs.find(n => n.name === 'Elder Hollis'); P.x = n.x; P.y = n.y + 20; openNpc(n);
      const first = panelKind; panel.querySelector('[data-act="topen"][data-arg="offer:letter"]').click(); const l1 = panel.querySelector('.say').textContent;
      panel.querySelector('[data-act="tnext"]').click(); const hasAccept = !!panel.querySelector('[data-act="qaccept"]'); const rew = /100 gold/.test(panel.textContent);
      panel.querySelector('[data-act="qaccept"]').click(); closePanel(); questHud();
      return { first, l1, hasAccept, rew, active: !!QS().active.letter, track: document.getElementById('qtrack').textContent, mark: npcMark(Z.npcs.find(n => n.name === 'Brannoc the Smith')) }; });
    t.ok(d.first === 'talk' && /Welcome/.test(d.l1), 'talking to Hollis opens a dialogue window with his lines');
    t.ok(d.hasAccept && d.rew, 'the last page shows the rewards and an Accept button');
    t.ok(d.active && /Letter/.test(d.track) && /Brannoc/.test(d.track), 'the accepted quest shows in the status box tracker');
    t.ok(d.mark === 'ready', 'Brannoc now shows a "?" to hand in the letter');

    const smith = await g.ev(() => { const n = Z.npcs.find(n => n.name === 'Brannoc the Smith'); const g0 = P.gold; openNpc(n);
      panel.querySelector('[data-act="topen"][data-arg="done:letter"]').click(); panel.querySelector('[data-act="tnext"]').click();
      panel.querySelector('[data-act="qfinish"]').click(); const done = QS().done.includes('letter'); const offered = !!panel.querySelector('[data-act="topen"][data-arg="offer:sprouts"]');
      const svc = !!panel.querySelector('[data-act="tservice"]'); panel.querySelector('[data-act="tservice"]').click(); const smithy = panelKind; closePanel();
      return { done, gold: P.gold - g0, offered, svc, smithy }; });
    t.ok(smith.done && smith.gold === 100, 'handing in the letter completes it and pays the reward');
    t.ok(smith.offered, 'the next chapter is offered right away by the smith');
    t.ok(smith.svc && smith.smithy === 'smith', 'the dialogue keeps a button for the NPC\'s normal service');

    const sp = await g.ev(() => { const n = Z.npcs.find(n => n.name === 'Brannoc the Smith'); openNpc(n);
      panel.querySelector('[data-act="topen"][data-arg="offer:sprouts"]').click(); while (panel.querySelector('[data-act="tnext"]')) panel.querySelector('[data-act="tnext"]').click();
      panel.querySelector('[data-act="qaccept"]').click(); closePanel();
      for (let i = 0; i < 10; i++) questKill('sproutling'); questKill('hopper'); const k = QS().active.sprouts.k.sproutling; const notReady = !qReady('sprouts');
      giveItem('sap', 5); const ready = qReady('sprouts'); openPanel('quests'); const log = panel.textContent; closePanel();
      openNpc(n); panel.querySelector('[data-act="topen"][data-arg="done:sprouts"]').click(); while (panel.querySelector('[data-act="tnext"]')) panel.querySelector('[data-act="tnext"]').click();
      panel.querySelector('[data-act="qfinish"]').click(); closePanel();
      return { k, notReady, ready, log, sap: invFind('sap') ? invFind('sap').n : 0, ore: !!invFind('emberore'), done: QS().done.includes('sprouts') }; });
    t.ok(sp.k === 8 && sp.notReady, 'kills count up to the goal and only for the right monster; items still needed');
    t.ok(sp.ready && /Sprouts and Sap/.test(sp.log) && /Sap Drop 5\/5/.test(sp.log), 'the quest log shows progress');
    t.ok(sp.done && sp.sap === 0 && sp.ore, 'handing in takes the Sap Drops and gives the Ember Ore');

    const wild = await g.ev(async () => { const w = ms => new Promise(r => setTimeout(r, ms)); P.lv = 3; P.qs.done.push('watch'); enterZone('meadow'); await w(300);
      const n = Z.npcs.find(n => n.name === 'Warden Pell'); const tile = Z.t[Math.floor(n.y / TILE) * Z.w + Math.floor(n.x / TILE)];
      return { ok: !!n, walk: !BLOCK[tile], near: Math.hypot(n.x - Z.spawn.x, n.y - Z.spawn.y) < 8 * TILE }; });
    t.ok(wild.ok && wild.walk && wild.near, 'Warden Pell stands near the meadow entrance on open ground');

    // v1.48.0 five random dailies a day from Elder Hollis
    const dq = await g.ev(async () => { const w = ms => new Promise(r => setTimeout(r, ms)); P.lv = 14; P.qs.dq = null; enterZone('town'); await w(300);
      const ids = Object.keys(QS().dq.list), q = ids.map(i => QUESTS[i]);
      return { n: ids.length, daily: q.every(x => x.daily && /^Daily: /.test(x.name)), lucky: q.filter(x => /★/.test(x.name)).length,
        givers: q.every(x => Z.npcs.some(n => NPC_KEY[n.name] === x.from)), offered: ids.every(i => questsAt(QUESTS[i].from).offer.includes(i)),
        other: (() => { const a = JSON.stringify(ids.map(i => QUESTS[i].obj)); const nm = P.name; P.name = 'Someone else'; P.qs.dq = null; QS(); const b = JSON.stringify(Object.keys(P.qs.dq.list).map(i => QUESTS[i].obj)); P.name = nm; P.qs.dq = null; QS(); return a !== b; })() }; });
    t.ok(dq.n === 5 && dq.daily && dq.lucky === 1, `five daily quests today, one of them a lucky one (${dq.n}, ${dq.lucky})`);
    t.ok(dq.givers && dq.offered, 'Elder Hollis in Hearthvale hands them out');
    t.ok(dq.other, 'the picks are random (another hero gets other quests)');

    const daily = await g.ev(() => { const id = Object.keys(QS().dq.list).find(i => QUESTS[i].obj.every(o => o.kill)) || Object.keys(QS().dq.list)[0], q = QUESTS[id];
      const n = Z.npcs.find(n => NPC_KEY[n.name] === q.from); openNpc(n);
      panel.querySelector(`[data-act="topen"][data-arg="offer:${id}"]`).click(); while (panel.querySelector('[data-act="tnext"]')) panel.querySelector('[data-act="tnext"]').click();
      panel.querySelector('[data-act="qaccept"]').click(); for (const o of q.obj) { if (o.kill) for (let i = 0; i < o.n; i++) questKill(o.kill); else giveItem(o.item, o.n); } closePanel(); openNpc(n);
      panel.querySelector(`[data-act="topen"][data-arg="done:${id}"]`).click(); while (panel.querySelector('[data-act="tnext"]')) panel.querySelector('[data-act="tnext"]').click();
      panel.querySelector('[data-act="qfinish"]').click(); closePanel(); const again = qAvailable(id);
      P.qs.daily[id] = '2000-01-01'; const tomorrow = qAvailable(id); return { again, tomorrow }; });
    t.ok(!daily.again && daily.tomorrow, 'a daily quest can be done once per day');

    const sv = await g.ev(() => { const s = snapshot(); return { done: s.p.qs.done, has: 'track' in s.p }; });
    t.ok(sv.done.includes('letter') && sv.done.includes('sprouts') && sv.has, 'quest progress is saved');
    t.ok(await g.ev(() => { window.dispatchEvent(new KeyboardEvent('keydown', { key: 'j' })); const k = panelKind; closePanel(); return k === 'quests'; }), 'J opens the quest log');
    t.ok(await g.ev(() => Object.values(QUESTS).every(q => q.offer.length && q.done.length && q.wait && npcName(q.from) && npcName(q.to) && q.obj.every(o => o.kill ? MOBS[o.kill] : o.item ? ITEMS[o.item] : o.talk ? npcName(o.talk) !== o.talk : o.spot || o.duel ? ZONES[o.zone] && o.text : ZONES[o.visit]) && (q.reward.items || []).every(([i]) => ITEMS[i]))), 'every quest has dialogue, real NPCs, real monsters and items');
    t.ok(g.page.errors.length === 0, 'no script errors' + g.page.errors.map(e => ': ' + e).join(''));
  } finally { await g.close(); }
};
