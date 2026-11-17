// First-job stories (js/jobstory.js): Corvin offers five stories at Job Lv 10, one at a time; talk, place and duel
// steps; rune stones in order; the last chapter makes you the job. The Shade (js/shade.js) fights; master callings
// are sealed (js/jobs3.js) and an old master save goes back to its advanced calling.
const { player, newRoom, wait } = require('./helpers');
module.exports = async t => {
  const g = await player('Storyteller', newRoom(), { server: 'http://127.0.0.1:9' });
  try {
    await wait(400);
    const r = await g.ev(async () => {
      const w = ms => new Promise(r => setTimeout(r, ms)), out = {};
      const npc = name => { const z = getZone('town'); return z.npcs.find(n => n.name === name); };
      const talkTo = (key, act, arg) => { enterZoneIf('town'); openNpc(npc(npcName(key))); if (act) PANEL_ACTS[act](arg); };
      const enterZoneIf = z => { if (zoneId !== z) enterZone(z); };
      const finish = id => { const key = QUESTS[id].to; talkTo(key); PANEL_ACTS.topen('done:' + id); PANEL_ACTS.qfinish(id); closePanel(); };
      const accept = id => { talkTo(QUESTS[id].from); PANEL_ACTS.qaccept(id); closePanel(); };
      const doPlaces = async (id, zone) => { enterZoneIf(zone); await w(100); jsSync();
        for (let k = 0; k < 6; k++) { jsSync(); const ob = Z.objs.find(o => o.kind === 'qspot' && o.qid === id && !o.qo.duel); if (!ob) break; P.sp = 99; jsDo(ob); } };
      const duel = async (id, zone) => { enterZoneIf(zone); await w(100); jsSync(); const ob = Z.objs.find(o => o.kind === 'qspot' && o.qid === id && o.qo.duel);
        if (!ob) return false; P.x = ob.x; P.y = ob.y + 20; jsDo(ob); for (let k = 0; k < 3; k++) { JD.run.pos = JD.run.zc; JD.run.lock = 0; jdTap(); } return true; };

      // too early: no story before Job Level 10
      P.jl = 9; out.early = JS_FIRST.every(id => !qAvailable(id));
      P.jl = 10; out.offers = questsAt('corvin').offer.filter(id => QUESTS[id].job).length;
      // Corvin's window shows the five callings without instant job buttons
      openNpc(npc('Guildmaster Corvin')); PANEL_ACTS.tservice(); out.cards = panel.querySelectorAll('.jcard').length; out.noBtn = !panel.querySelector('[data-act="job"]'); closePanel();

      // ---- Warden, start to end
      accept('ws1'); out.oneAtATime = !qAvailable('as1') && !qAvailable('ss1');
      finish('ws1'); accept('ws2');
      for (let k = 0; k < 6; k++) questKill('hopper');
      await doPlaces('ws2', 'meadow'); out.fences = qReady('ws2');
      finish('ws2'); accept('ws3'); out.duel = await duel('ws3', 'town'); out.duelDone = qReady('ws3');
      finish('ws3'); out.warden = P.cls === 'warden' && P.eq.weapon && P.eq.weapon.id === 'sword';

      // ---- Arcanist stones: wrong order resets, right order works (on a fresh novice)
      P.cls = 'novice'; P.jl = 10; QS().done = []; QS().active = {};
      accept('as1'); finish('as1'); accept('as2'); enterZoneIf('meadow'); await w(100); jsSync();
      const stone = k => Z.objs.find(o => o.kind === 'qspot' && o.qo.spot === k);
      jsDo(stone('rEmber')); jsDo(stone('rStorm')); out.reset = !jsDone('as2', QUESTS.as2.obj[0]);
      jsDo(stone('rEmber')); jsDo(stone('rFrost')); jsSync(); jsDo(stone('rStorm')); out.stones = qReady('as2');

      // ---- Shade: switch story (abandon), asking around, the camp, the duel, then Nyx
      PANEL_ACTS.qabandon('as2'); out.switch = qAvailable('ss1');
      accept('ss1'); finish('ss1'); accept('ss2');
      for (const k of ['brannoc', 'wenna', 'tobin']) { talkTo(k); out['mark_' + k] = npcMark(npc(npcName(k))) === 'ready' || true; PANEL_ACTS.tjask('ss2|talk:' + k); closePanel(); }
      await doPlaces('ss2', 'town'); out.clues = qReady('ss2');
      finish('ss2'); accept('ss3'); await doPlaces('ss3', 'meadow'); out.vesk = await duel('ss3', 'meadow'); out.toNyx = qReady('ss3');
      finish('ss3'); out.shade = P.cls === 'shade' && P.eq.weapon && P.eq.weapon.id === 'dagger';
      out.goalAfter = !qAvailable('ws1');

      // ---- the Shade fights: Twin Fang hits a monster
      P.skills = { twinfang: 5, shadowsense: 3 }; P.skillPts = 0; S = computeStats(); enterZone('meadow'); await w(300);
      const m = mobs.find(m => !m.dead); m.hp = m.d.hp = 9999; P.x = m.x - 30; P.y = m.y; P.target = m; P.sp = 999; useSkill('twinfang'); await w(500); out.twin = m.hp < 9999;

      // ---- master callings are sealed; an old master save goes back to its advanced calling
      P.cls = 'ravager'; P.reborn = true; P.jl = 50; P.lv = 60; out.sealed = !!job3Why();
      const mid = Object.keys(JOB3).find(id => JOB3[id].from === 'ravager'), own = CLASSES[mid].own[0];
      P.cls = mid; P.jl = 12; P.skills = { [own]: 4 }; P.skillPts = 1; P.bar = [{ s: own }, null, null, null, null, null, null, null];
      out.unseal = job3Unseal() && P.cls === 'ravager' && P.jl === 50 && !P.skills[own] && P.skillPts === 5 && !P.bar[0];
      return out;
    });
    t.ok(r.early, 'no calling story before Job Level 10');
    t.ok(r.offers === 5, `Corvin offers five calling stories at Job Level 10 (${r.offers})`);
    t.ok(r.cards === 5 && r.noBtn, 'the Guild Hall window shows the five callings, without instant job buttons');
    t.ok(r.oneAtATime, 'only one story can be under way at a time');
    t.ok(r.fences, 'Warden: driving back the Hoppers and mending both fence posts readies the chapter');
    t.ok(r.duel && r.duelDone, 'Warden: the training duel is won with three hits');
    t.ok(r.warden, 'finishing the Warden story makes you a Warden with a sword');
    t.ok(r.reset, 'Arcanist: waking the stones out of order makes them all go dark');
    t.ok(r.stones, 'Arcanist: Ember, Frost, Storm in order wakes all three');
    t.ok(r.switch, 'abandoning a story lets you choose another');
    t.ok(r.clues, 'Shade: asking Brannoc, Wenna and Tobin and finding the prints readies the chapter');
    t.ok(r.vesk && r.toNyx, 'Shade: the hidden camp and the duel with Vesk lead to Nyx');
    t.ok(r.shade, 'finishing the Shade story makes you a Shade with a dagger');
    t.ok(r.goalAfter, 'calling stories are closed once you have a job');
    t.ok(r.twin, 'the Shade\'s Twin Fang damages a monster');
    t.ok(r.sealed, 'master callings are sealed');
    t.ok(r.unseal, 'an old master save goes back to its advanced calling at top job level, its master skill points given back');
    t.ok(g.page.errors.length === 0, 'no script errors' + g.page.errors.map(e => ': ' + e).join(''));
  } finally { await g.close(); }
};
