// tapping a healer heals HP and SP at once (no window); with a quest from her, her conversation opens as before
const { player, newRoom } = require('./helpers');
module.exports = async t => {
  const g = await player('Healed', newRoom());
  try {
    const r = await g.ev(() => { const n = Z.npcs.find(x => x.role === 'heal'); S = computeStats(); P.hp = 3; P.sp = 1; openNpc(n);
      const healed = P.hp === S.maxhp && P.sp === S.maxsp, noWin = panel.hidden, said = !!(n.bubble && n.bubble.txt);
      const key = npcKeyOf(n), id = Object.keys(QUESTS)[0], _q = questsAt; questsAt = () => ({ ready: [], offer: [id], busy: [] }); openNpc(n); questsAt = _q; const talk = panelKind === 'talk'; closePanel();
      return { healed, noWin, said, talk }; });
    t.ok(r.healed && r.noWin, 'tapping the healer restores HP and SP straight away, no window');
    t.ok(r.said, 'she answers in a speech bubble');
    t.ok(r.talk, 'when she has a quest for you, her conversation opens instead');
    t.ok(g.page.errors.length === 0, 'no script errors' + g.page.errors.map(e => ': ' + e).join(''));
  } finally { await g.close(); }
};
