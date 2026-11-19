// The Shade's master callings (js/shade3.js): Seer Valen's trial lifts a Nightblade into a Soulreaper (and so on);
// every new skill hits; each has its own finisher and Thai text.
const { player, newRoom, wait } = require('./helpers');
module.exports = async t => {
  const g = await player('Duskblade', newRoom(), { server: 'http://127.0.0.1:9' });
  try {
    await wait(600);
    const r = await g.ev(async () => {
      const w = ms => new Promise(r => setTimeout(r, ms)), out = {};
      out.from = ['nightblade', 'venomancer', 'phantom'].map(c => job3From(c).join()).join(',');
      JOB3_SEALED = false; // sealed in the game for now, like every master calling; this tests the trial itself
      P.cls = 'nightblade'; P.jl = 50; P.lv = 50; P.reborn = 1; P.skills = { twinfang: 5, mortalcut: 5 }; S = computeStats();
      openPanel('rebirth'); PANEL_ACTS.trial3(); for (let i = 0; i < 40; i++) questKill('deepshade'); giveItem('shadeveil', 15); P.gold = 40000; refreshPanel();
      out.choices = [...document.querySelectorAll('#panel [data-act="ascend"]')].map(b => b.dataset.arg).join();
      PANEL_ACTS.ascend('soulreaper'); PANEL_ACTS.ascendyes('soulreaper'); closePanel();
      out.cls = P.cls; out.keeps = P.skills.mortalcut === 5 && CLASSES.soulreaper.skills.includes('mortalcut') && CLASSES.soulreaper.skills.includes('twinfang') && CLASSES.soulreaper.skills.includes('deathmark');
      P.eq.weapon = { id: 'dagger', uid: 704, s: [null] };
      enterZone('meadow'); await w(300);
      const m = mobs.find(x => !x.dead); for (const x of mobs) if (x !== m) x.dead = true;
      m.hp = 1e7; m.d = { ...m.d, hp: 1e7, atk: 0, def: 0 }; m.sx = m.x; m.sy = m.y; m.ailUntil = now + 30; P.x = m.x - 60; P.y = m.y; P.sp = 99999; S = computeStats();
      out.hit = {};
      for (const id of Object.keys(SH3_SKILLS)) { const sk = SKILLS[id]; if (sk.kind === 'passive') continue; const hp = m.hp;
        if (sk.kind === 'target') sk.run(10, m); else if (sk.kind === 'area') sk.run(10, m.x, m.y); else sk.run(10);
        await w(1000); out.hit[id] = m.hp < hp || !!(P.buffs[id] && P.buffs[id].until > now); }
      out.fin = ['soulreaper', 'plaguelord', 'umbraldancer'].every(j => FS_STYLES[j].ring && FS_STYLES[j].fin && TH[FS_STYLES[j].fin.n + '!']);
      out.th = Object.keys(SH3_SKILLS).every(id => SKILL_TH[id]);
      JOB3_SEALED = true; return out;
    });
    t.ok(r.from === 'soulreaper,plaguelord,umbraldancer', 'each Shade calling has its master calling: ' + r.from);
    t.ok(r.choices === 'soulreaper', 'after the Deepshade trial Valen offers a Nightblade the Soulreaper (' + r.choices + ')');
    t.ok(r.cls === 'soulreaper' && r.keeps, 'ascending makes you a Soulreaper and keeps every Shade and Nightblade skill');
    const miss = Object.entries(r.hit).filter(([, v]) => !v).map(([k]) => k);
    t.ok(!miss.length, 'every new skill hits a monster or takes effect' + (miss.length ? ': ' + miss.join(', ') : ''));
    t.ok(r.fin, 'each has a master ring and its own finisher, with Thai');
    t.ok(r.th, 'every new skill has Thai text');
    t.ok(g.page.errors.length === 0, 'no script errors' + g.page.errors.map(e => ': ' + e).join(''));
  } finally { await g.close(); }
};
