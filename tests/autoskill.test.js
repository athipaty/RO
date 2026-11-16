// Auto-hunt uses skills: target skills on the target, heals when hurt, buffs while fighting, area skills on groups, a switch on the Auto card
const { player, wait, newRoom } = require('./helpers');
module.exports = async t => {
  const g = await player('Caster', newRoom(), { server: 'http://127.0.0.1:9' });
  try {
    await wait(400);
    const r = await g.ev(async () => { const sleep = ms => new Promise(r => setTimeout(r, ms)), out = {};
      const setup = (cls, skills, bar) => { P.cls = cls; P.lv = 40; P.jl = 30; P.skills = skills; P.useLv = {}; P.cd = {}; P.buffs = {}; P.bar = bar.map(s => s ? { s } : null); P.bars = [];
        P.st = { str: 30, agi: 20, vit: 30, int: 60, dex: 40, luk: 10 }; S = computeStats(); P.hp = S.maxhp; P.sp = S.maxsp; rebuildHotbar(); };
      const prep = () => { for (const m of mobs) { m.d = { ...m.d, hp: 1e8, atk: 0, def: 0 }; m.hp = 1e8; } };
      const nearest = () => mobs.filter(m => !m.dead).sort((a, b) => dist(a, P) - dist(b, P))[0];
      enterZone('meadow'); await sleep(300); prep();
      // a mage: Ember Bolt on the target
      setup('arcanist', { emberbolt: 5 }, ['emberbolt']);
      { const m = nearest(); P.x = m.x + 150; P.y = m.y; P.path = []; P.target = m; P.auto = true; const h0 = m.hp, sp0 = P.sp; await sleep(2500);
        out.bolt = (P.cd.emberbolt || 0) > 0 && P.sp < sp0 && m.hp < h0; }
      // the switch off: normal attacks only
      P.auto = false; await sleep(200); P.autoSkill = false; P.casting = null; P.queued = null; P.cd = {}; P.sp = S.maxsp; { const m = nearest(); P.target = m; P.auto = true; await sleep(1500); out.offOk = !P.cd.emberbolt; }
      P.auto = false; P.autoSkill = true; await sleep(200);
      // a cleric hurt: Mend before any tonic; Blessing while fighting
      setup('cleric', { mend: 5, blessing: 3, smite: 3 }, ['smite', 'mend', 'blessing']); P.inv = P.inv.filter(e => !['red', 'orange'].includes(e.id));
      { const m = nearest(); P.x = m.x + 120; P.y = m.y; P.path = []; P.target = m; P.hp = Math.round(S.maxhp * .45); const hp0 = P.hp; P.auto = true; await sleep(2500);
        out.mend = (P.cd.mend || 0) > 0 && P.hp > hp0; out.bless = !!(P.buffs.blessing && P.buffs.blessing.until > now); }
      P.auto = false; await sleep(200);
      // the cleric at full HP heals a hurt party member standing nearby, but not one who is fine or too far away
      { const pm = partyMatesHere, mate = { id: 'ally1', n: 'Ally', rx: P.x + 60, ry: P.y, hp: 30 }; partyMatesHere = () => [mate]; const sp0 = SOC.party; SOC.party = { id: 'p1', leader: 'me', mode: 'each', loot: 'each', members: [{ peer: 'ally1', name: 'Ally' }] };
        P.casting = null; P.cd = {}; P.hp = S.maxhp; P.sp = S.maxsp; NET.sp = []; P.target = null; P.path = []; P.auto = true;
        /* under load the first casts can be slow: wait up to 3 s for Mend to go out */
        for (let k = 0; k < 30 && !(P.cd.mend > 0 && NET.sp.some(e => e.to === 'ally1' && e.k === 'mend')); k++) await sleep(100);
        out.partyHeal = (P.cd.mend || 0) > 0 && NET.sp.some(e => e.to === 'ally1' && e.k === 'mend');
        P.auto = false; await sleep(200); P.casting = null; P.cd = {}; NET.sp = []; mate.hp = 90; P.auto = true; await sleep(1200); const fine = !P.cd.mend;
        P.auto = false; await sleep(200); P.casting = null; P.cd = {}; mate.hp = 30; mate.rx = P.x + 900; P.auto = true; await sleep(1200); out.partyOnlyNeeded = fine && !P.cd.mend;
        P.auto = false; partyMatesHere = pm; SOC.party = sp0; await sleep(200); }
      // an archer: Arrow Rain only when monsters stand together
      setup('ranger', { arrowrain: 5 }, ['arrowrain']);
      { const ms = mobs.filter(m => !m.dead).slice(0, 3); const a = ms[0]; for (const m of mobs) if (!ms.includes(m)) { m.x += 2000; } ms[1].x = a.x + 30; ms[1].y = a.y; ms[2].x = a.x + 1500;
        P.x = a.x + 180; P.y = a.y; P.path = []; P.target = a; P.auto = true;
        /* monsters wander: keep the pair together while auto-hunt decides */
        for (let k = 0; k < 15 && !P.cd.arrowrain; k++) { ms[1].x = a.x + 30; ms[1].y = a.y; await sleep(100); } out.rainGroup = (P.cd.arrowrain || 0) > 0;
        P.auto = false; await sleep(200); P.cd = {}; P.sp = S.maxsp; ms[1].x = a.x + 900; P.target = a; P.auto = true; await sleep(1500); out.rainAlone = !P.cd.arrowrain; }
      P.auto = false; await sleep(200);
      // a warden: Iron Will buff and Whirlwind when monsters are close
      setup('warden', { ironwill: 3, whirl: 3 }, ['whirl', 'ironwill']);
      { const m = nearest(); P.x = m.x + 30; P.y = m.y; P.path = []; P.target = m; P.auto = true; await sleep(2000);
        out.iron = !!(P.buffs.ironwill && P.buffs.ironwill.until > now); out.whirl = (P.cd.whirl || 0) > 0; }
      P.auto = false; await sleep(200);
      // First Aid: cast once the missing HP is at least what it heals (8+7*level), not before
      setup('warden', { firstaid: 5 }, ['firstaid']); P.inv = P.inv.filter(e => !['red', 'orange'].includes(e.id));
      { const m = nearest(); P.x = m.x + 200; P.y = m.y; P.path = []; P.target = m; const amt = autoSkillHealAmt('firstaid');
        P.hp = S.maxhp - amt + 1; P.auto = true; await sleep(1200); out.aidEarly = !P.cd.firstaid;
        P.auto = false; await sleep(200); P.casting = null; P.cd = {}; P.hp = S.maxhp - amt - 3; const hp0 = P.hp; P.auto = true; await sleep(1500);
        out.aidAt = (P.cd.firstaid || 0) > 0 && P.hp > hp0; out.aidAmt = amt; }
      P.auto = false; await sleep(200);
      // out of tonics at 20% HP: auto-hunt keeps going (no pause) and still picks a monster
      setup('warden', { whirl: 1 }, []); P.inv = P.inv.filter(e => !['red', 'orange'].includes(e.id)); P.target = null; P.path = []; P.hp = Math.round(S.maxhp * .2); P.auto = true;
      await sleep(800); out.noPause = P.auto === true && !!P.target; P.auto = false; await sleep(200);
      // the switch sits on the Auto card and does not close it
      enterZone('meadow'); await sleep(200); P.auto = false; $('#autoBtn').click(); await sleep(500);
      const card = document.getElementById('autoPick'), sw = card.querySelector('.apSk');
      out.card = !!sw && !card.hidden && sw.classList.contains('on');
      sw.click(); await sleep(150); out.toggle = P.autoSkill === false && !card.hidden && !sw.classList.contains('on') && /off/.test(sw.textContent);
      sw.click(); out.saved = P.autoSkill === true && SAVE_EXTRA.includes('autoSkill');
      return out; });
    t.ok(r.bolt, 'a mage on auto-hunt casts Ember Bolt on the target');
    t.ok(r.offOk, 'with the switch off it uses normal attacks only');
    t.ok(r.mend && r.bless, `a hurt cleric casts Mend and keeps Blessing up (mend ${r.mend}, blessing ${r.bless})`);
    t.ok(r.partyHeal && r.partyOnlyNeeded, `Mend also goes out for a hurt party member nearby, not for a healthy or faraway one (heal ${r.partyHeal}, only when needed ${r.partyOnlyNeeded})`);
    t.ok(r.rainGroup && r.rainAlone, `area skills are used on groups, not on a lone monster (group ${r.rainGroup}, alone ${r.rainAlone})`);
    t.ok(r.iron && r.whirl, `a warden keeps Iron Will up and spins Whirlwind next to monsters (iron ${r.iron}, whirl ${r.whirl})`);
    t.ok(r.aidEarly && r.aidAt, `First Aid is cast once the missing HP reaches what it heals (${r.aidAmt} HP): not one HP earlier ${r.aidEarly}, at it ${r.aidAt}`);
    t.ok(r.noPause, 'with no tonics left at low HP auto-hunt keeps fighting');
    t.ok(r.card && r.toggle && r.saved, `the Skills switch is on the Auto card and toggles without closing it (card ${r.card}, toggle ${r.toggle})`);
    t.ok(g.page.errors.length === 0, 'no script errors' + g.page.errors.map(e => ': ' + e).join(''));
  } finally { await g.close(); }
};
