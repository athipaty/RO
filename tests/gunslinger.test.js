// v1.42.0 the Gunslinger: the sixth first job (guns, DEX attack from range, seven skills, a story with Marshal Kestrel)
const { player, newRoom, wait } = require('./helpers');
module.exports = async t => {
  const g = await player('Kid', newRoom(), { server: 'http://127.0.0.1:9' });
  try {
    await wait(800);
    const r = await g.ev(async () => { const w = ms => new Promise(r => setTimeout(r, ms)), o = {};
      P.tut = 'done'; enterZone('town'); await w(300);
      o.first = JOB_FIRST.includes('gunslinger') && JS_FIRST.includes('gs1') && QUESTS.gs3 && QUESTS.gs3.grant === 'gunslinger';
      o.kestrel = !!Z.npcs.find(n => n.name === 'Marshal Kestrel'); o.shop = SHOP.includes('pistol') && SHOP.includes('longrifle') && ROYAL_SHOP.includes('aurelrepeater');
      P.jl = 10; o.become = becomeJob('gunslinger'); S = computeStats(); o.gun = P.eq.weapon && P.eq.weapon.id === 'pistol'; o.range = S.range; o.ranged = S.ranged;
      P.st.dex += 20; S = computeStats(); const dexAtk = S.atk; P.st.dex -= 20; P.st.str += 20; S = computeStats(); const strAtk = S.atk; P.st.str -= 20; S = computeStats(); o.dexBetter = dexAtk > strAtk;
      enterZone('meadow'); await w(400); const m = mobs.find(x => !x.dead); m.d = { ...m.d, hp: 1e8, flee: 0 }; m.hp = 1e8; P.x = m.x - 150; P.y = m.y; P.target = m;
      const h0 = m.hp; for (let k = 0; k < 3; k++) { basicAttack(m); await w(700); } o.shot = h0 - m.hp; // three shots: a Lv 1 hero can miss one
      const res = {}; for (const id of ['quickdraw', 'piercinground', 'flareround']) { const h = m.hp; SKILLS[id].run(5, m); await w(900); res[id] = h - m.hp > 0; }
      for (const id of ['scattershot', 'flashbang']) { const h = m.hp; SKILLS[id].run(5, m.x, m.y); await w(600); res[id] = h - m.hp > 0; }
      o.skills = res; o.thai = typeof SKILL_TH !== 'undefined' && ['quickdraw', 'piercinground', 'scattershot', 'flareround', 'flashbang', 'steadyaim', 'fanning'].every(id => SKILL_TH[id]);
      o.icon = (() => { const c = itemIconCanvas('pistol'), d = c.getContext('2d').getImageData(0, 0, 64, 64).data; let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i] > 0) n++; return n; })();
      return o; });
    t.ok(r.first && r.kestrel, 'the Gunslinger is the sixth first job, earned through a three-chapter story with Marshal Kestrel (who stands in Hearthvale)');
    t.ok(r.shop, 'pistols and rifles are sold (the Flintlock Pistol and Long Rifle at the General Store, the Aurel Repeater at the Aurel Market)');
    t.ok(r.become && r.gun && r.ranged && r.range >= 200, `becoming a Gunslinger equips a pistol that shoots from range (${r.range})`);
    t.ok(r.dexBetter, 'a gun hits harder with DEX than with STR, like a bow');
    t.ok(r.shot > 0, 'a shot from the pistol hits');
    t.ok(Object.values(r.skills).every(Boolean), 'all five attack skills deal damage: ' + JSON.stringify(r.skills));
    t.ok(r.thai, 'every skill has its Thai name and description');
    t.ok(r.icon > 100, 'guns have their own bag pictures');
    t.ok(g.page.errors.length === 0, 'no script errors' + g.page.errors.map(e => ': ' + e).join(''));
  } finally { await g.close(); }
};
