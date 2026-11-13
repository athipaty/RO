// third-tier callings: a reborn advanced calling at job 50 / base 50 takes Seer Valen's trial and ascends
const { player, newRoom } = require('./helpers');
module.exports = async t => {
  const A = await player('Ascender', newRoom(), { server: 'http://127.0.0.1:9' });
  try {
    const r = await A.ev(async () => {
      P.cls = 'bulwark'; P.jl = 50; P.lv = 30; P.reborn = 1; P.skills = { cleave: 5, shieldbash: 5 }; S = computeStats();
      openPanel('rebirth'); const early = document.getElementById('panel').textContent.includes('Reach base level 50');
      P.lv = 50; refreshPanel(); const canStart = !!document.querySelector('#panel [data-act="trial3"]');
      PANEL_ACTS.trial3(); for (let i = 0; i < 40; i++) questKill('snowhulk');
      giveItem('fur', 15); P.gold = 40000; refreshPanel();
      const choices = [...document.querySelectorAll('#panel [data-act="ascend"]')].map(b => b.dataset.arg);
      PANEL_ACTS.ascend('aegislord');
      const c = CLASSES[P.cls]; const sk = c.skills;
      P.skills.titanslam = 3; P.skillPts = 0; openPanel('skills'); const tree = [...panel.querySelectorAll('.skpsec')].map(e => e.textContent).join('|');
      const descs = c.own.map(id => SKILLS[id].desc(5));
      return { early, canStart, choices, cls: P.cls, jl: P.jl, gold: P.gold, fur: invFind('fur') ? invFind('fur').n : 0, tier: c.tier, keeps: sk.includes('cleave') && sk.includes('shieldbash') && sk.includes('titanslam') && sk.includes('fortress'),
        tree3: tree === 'Warden|Bulwark|Aegis Lord', descs,
        allTier3: Object.keys(CLASSES).filter(k => CLASSES[k].tier === 3).length, party: !!SKILLS.fortress.party };
    });
    t.ok(r.early && r.canStart, 'Valen asks for base level 50 again, then offers the Trial of Ascension');
    t.ok(r.choices.length === 1 && r.choices[0] === 'aegislord', 'a Bulwark can rise into an Aegis Lord');
    t.ok(r.cls === 'aegislord' && r.tier === 3 && r.jl === 1 && r.gold === 10000 && r.fur === 0, 'ascending takes the items and 30,000 gold and starts job level again');
    t.ok(r.keeps, 'every old skill is kept and two new ones are added');
    t.ok(r.tree3, 'the skill tree shows three groups');
    t.ok(r.allTier3 === 12 && r.party, `12 master callings; Fortress reaches the party (${r.descs.join(' | ')})`);
    const fx = await A.ev(() => { enterZone('meadow'); const m = mobs.find(o => !o.dead); P.x = m.x + 30; P.y = m.y; P.sp = 999; P.cd = {}; const hp = m.hp; SKILLS.titanslam.run(3); return { hit: m.hp < hp || m.dead }; });
    t.ok(fx.hit, 'Titan Slam hurts monsters around you');
    t.ok(A.page.errors.length === 0, 'no script errors' + A.page.errors.map(e => ': ' + e).join(''));
  } finally { await A.close(); }
};
