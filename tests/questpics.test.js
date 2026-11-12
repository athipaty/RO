// pictures in quests: monster for "defeat", item and its droppers for "bring", the face of the person to talk to
const { player, newRoom } = require('./helpers');
module.exports = async t => {
  const A = await player('Seeker', newRoom(), { server: 'http://127.0.0.1:9' });
  try {
    const r = await A.ev(() => {
      const blank = u => { const i = new Image(); i.src = u; return !u || u.length < 300; };
      const mob = mobPicURL('hopper'), npc = npcPicURL('hollis'), town = npcPicURL('ilsa');
      // a kill quest and an item quest in the log, one of them pinned
      const s = QS(); s.active.d_patrol = { k: {} }; s.active.d_restock = { k: {} }; P.track = 'd_restock'; openPanel('quests'); const log = panel.innerHTML; closePanel();
      qhudKey = ''; questHud(); const hud = document.getElementById('qtrack').innerHTML;
      return { mob: !blank(mob), npc: !blank(npc), town: !blank(town), logMob: log.includes(mobPicURL('hopper')), logItem: log.includes(itemIconURL('thorn')), logFrom: /from .*Thornling/.test(panel.textContent || log.replace(/<[^>]+>/g, '')),
        hudPics: (hud.match(/class="qpic"/g) || []).length, hudFrom: /Thornling/.test(hud) };
    });
    t.ok(r.mob && r.npc && r.town, 'monsters, quest givers and townsfolk have pictures');
    t.ok(r.logMob, 'the quest log shows the monster to defeat');
    t.ok(r.logItem && r.logFrom, 'and the item to bring, with the monster that drops it');
    t.ok(r.hudPics >= 2 && r.hudFrom, `the pinned quest in the status box shows them too (${r.hudPics} pictures)`);
    const talk = await A.ev(() => { const s = QS(); delete s.active.d_patrol; delete s.active.d_restock; s.active.letter = s.active.letter || { k: {} }; const id = Object.keys(QUESTS).find(i => QUESTS[i].to !== QUESTS[i].from);
      s.active[id] = { k: {} }; openPanel('quests'); const h = panel.innerHTML; closePanel(); return { id, face: h.includes(npcPicURL(QUESTS[id].to)) }; });
    t.ok(talk.face, `the person to talk to shows their face (${talk.id})`);
    t.ok(A.page.errors.length === 0, 'no script errors' + A.page.errors.map(e => ': ' + e).join(''));
  } finally { await A.close(); }
};
