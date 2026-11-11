// #31 choose which skill level to cast: hotbar right-click / Shift+key, skill tree −/+, SP cost, saved.
const { player, wait, newRoom } = require('./helpers');
module.exports = async t => {
  const g = await player('Lowcast', newRoom(), { zone: 'meadow', server: 'http://127.0.0.1:9' });
  try {
    await wait(1500);
    const r = await g.ev(async () => { const w = ms => new Promise(r => setTimeout(r, ms));
      P.cls = 'arcanist'; P.skills = { emberbolt: 5, frostnova: 1 }; P.hot = ['emberbolt', 'frostnova', null, null]; P.bar = null; rebuildHotbar(); await w(200);
      const slot = () => document.querySelectorAll('#hotbar .slot')[0].querySelector('.n').textContent;
      const full = slot();
      document.querySelectorAll('#hotbar .slot')[0].dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true })); await w(200);
      const afterRight = castLv('emberbolt'), badge = slot();
      window.dispatchEvent(new KeyboardEvent('keydown', { key: '!', code: 'Digit1', shiftKey: true })); await w(100);
      const afterShift = castLv('emberbolt');
      // SP cost follows the cast level
      P.sp = 999; P.cd = {}; const sp0 = P.sp; useSkill('frostnova'); await w(50); P.casting = null;
      P.cd = {}; P.sp = 999; const self = { kind: SKILLS.emberbolt.kind };
      // one-level skills cannot be lowered
      lowerSlot(1); const fn = castLv('frostnova');
      // skill tree buttons
      openPanel('skills'); const has = !!panel.querySelector('[data-act="castlv"][data-arg="emberbolt:1"]'), noOne = !panel.querySelector('[data-arg^="frostnova:"][data-act="castlv"]');
      panel.querySelector('[data-act="castlv"][data-arg="emberbolt:1"]').click(); const up = castLv('emberbolt');
      const txt = panel.querySelector('.castlv').textContent; closePanel();
      // wraps from 1 to max
      setCastLv('emberbolt', 1, true); lowerSlot(0); const wrapped = castLv('emberbolt');
      setCastLv('emberbolt', 2, true); const saved = snapshot().p.useLv;
      return { full, afterRight, badge, afterShift, fn, has, noOne, up, txt, wrapped, saved, cost2: SKILLS.emberbolt.sp(2), cost5: SKILLS.emberbolt.sp(5) }; });
    t.ok(r.full === '5' && r.afterRight === 4 && r.badge === '4/5', `right-click on a hotbar skill casts it one level lower (badge ${r.badge})`);
    t.ok(r.afterShift === 3, 'Shift+1 also lowers it');
    t.ok(r.fn === 1, 'a level-1 skill stays at level 1');
    t.ok(r.has && r.noOne && r.up === 4 && /Cast Lv 4/.test(r.txt), 'the skill tree has −/+ to pick the cast level');
    t.ok(r.wrapped === 5, 'lowering below 1 wraps back to the full level');
    t.ok(r.saved && r.saved.emberbolt === 2, 'the chosen level is saved');
    const c = await g.ev(async () => { const w = ms => new Promise(r => setTimeout(r, ms)); P.target = null; P.cd = {}; P.casting = null;
      // Ember Bolt needs a target; spawn one next to us
      const m = mobs.find(m => !m.dead && !m.d.boss); if (!m) return null; for (const o of mobs) if (o !== m) { o.dead = true; o.respawnAt = now + 1e9; } // nothing may interrupt the cast
      m.d = { ...m.d, spd: 0, hp: 99999, aggro: false }; m.hp = 99999; m.state = 'idle'; m.tx = null; m.x = m.sx = P.x + 30; m.y = m.sy = P.y; m.lead = null; P.target = m; P.sp = S.maxsp; await w(100);
      const s0 = P.sp; useSkill('emberbolt'); for (let i = 0; i < 40 && P.casting; i++) await w(100); return { spent: s0 - P.sp, lv: castLv('emberbolt') }; });
    if (c) t.ok(Math.abs(c.spent - r.cost2) < 1 && r.cost2 < r.cost5, `casting at level 2 costs ${Math.round(c.spent)} SP instead of ${r.cost5}`);
    t.ok(g.page.errors.length === 0, 'no script errors' + g.page.errors.map(e => ': ' + e).join(''));
  } finally { await g.close(); }
};
