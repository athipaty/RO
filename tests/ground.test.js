// #30 ground-target skills: Thorn Snare, Ember Wall, Haven; area skills aim at the ground; others see zones.
const { player, wait, newRoom } = require('./helpers');
const poll = async (g, fn, ms = 8000) => { const end = Date.now() + ms; while (Date.now() < end) { if (await g.ev(fn)) return true; await wait(200); } return false; };
module.exports = async t => {
  const room = newRoom(), OFFLINE = 'http://127.0.0.1:9';
  const A = await player('Ground', room, { server: OFFLINE });
  await wait(1500);
  const B = await player('Friend', room, { server: OFFLINE });
  try {
    t.ok(await poll(A, () => NET.others.size === 1), 'two players see each other');
    const lists = await A.ev(() => ({ r: CLASSES.ranger.skills.includes('thornsnare'), a: CLASSES.arcanist.skills.includes('emberwall'), c: CLASSES.cleric.skills.includes('haven'),
      job: Object.keys(CLASSES).filter(c => baseOf(c) === 'cleric' && c !== 'cleric').every(c => CLASSES[c].skills.includes('haven')) }));
    t.ok(lists.r && lists.a && lists.c && lists.job, 'each skill belongs to its class and that class\'s second jobs');
    // aim and place a trap with a real click on the canvas
    const aim = await A.ev(() => { P.cls = 'ranger'; P.lv = 30; P.skills = { twinshot: 2, thornsnare: 5 }; P.sp = 999; S = computeStats(); enterZone('meadow'); for (const m of mobs) { m.x = 99999; }
      useSkill('thornsnare'); return !!AIM; });
    t.ok(aim, 'pressing a ground skill starts aiming');
    const place = await A.page.evaluate(() => { const s = proj(P.x + 60, P.y); const r = cv.getBoundingClientRect(); return { x: r.left + s.x - camX, y: r.top + s.y - camY }; });
    await A.page.mouse.click(place.x, place.y);
    t.ok(await poll(A, () => GZ.some(z => z.k === 'thornsnare') && !AIM), 'clicking the ground places the trap');
    const trap = await A.ev(async () => { const z = GZ.find(z => z.k === 'thornsnare'); const m = mobs.find(x => !x.dead); m.hp = m.d.hp; m.x = z.x; m.y = z.y; m.state = 'idle'; const h = m.hp;
      for (let i = 0; i < 10 && GZ.some(z => z.k === 'thornsnare'); i++) await new Promise(r => setTimeout(r, 100)); return { hurt: m.hp < h || m.myDmg > 0, held: m.ail === 'stun', gone: !GZ.some(z => z.k === 'thornsnare'), dbg: [m.hp, h, m.ail, Math.round(m.x - z.x), Math.round(m.y - z.y), m.dead] }; });
    t.ok(trap.hurt && trap.held && trap.gone, JSON.stringify(trap) + 'a monster stepping on it is hurt and held, and the trap is used up');
    t.ok(await A.ev(() => { P.cd = {}; useSkill('thornsnare'); const a = !!AIM; window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })); return a && !AIM; }), 'Esc cancels aiming');
    const wall = await A.ev(async () => { P.cls = 'arcanist'; P.skills = { frostnova: 2, emberwall: 5 }; P.cd = {}; P.sp = 999; S = computeStats(); useSkill('emberwall'); aimCast({ x: P.x + 80, y: P.y });
      await new Promise(r => setTimeout(r, 100)); const z = GZ.find(z => z.k === 'emberwall'); if (!z) return {}; const m = mobs.find(x => !x.dead); m.hp = m.d.hp; m.x = z.x; m.y = z.y; const h = m.hp;
      await new Promise(r => setTimeout(r, 1200)); return { ok: true, hurt: m.hp < h || m.myDmg > 0, slow: m.slowUntil > now }; });
    t.ok(wall.ok && wall.hurt && wall.slow, 'Ember Wall burns and slows monsters standing in it');
    const haven = await A.ev(async () => { for (const m of mobs) m.x = 99999; GZ = []; P.cls = 'cleric'; P.skills = { mend: 2, haven: 4 }; P.cd = {}; P.sp = 999; S = computeStats(); const d0 = S.def;
      useSkill('haven'); aimCast({ x: P.x + 20, y: P.y }); await new Promise(r => setTimeout(r, 400)); return { buff: !!P.buffs.haven, def: S.def - d0 }; });
    t.ok(haven.buff && haven.def === 8, `standing in your Haven gives regen and DEF (+${haven.def})`);
    t.ok(await poll(B, () => { const o = [...NET.others.values()][0]; return o && (o.gz || []).some(z => z.k === 'haven'); }), 'other players receive your Haven');
    const share = await B.ev(async () => { const o = [...NET.others.values()][0]; const z = o.gz.find(z => z.k === 'haven'); enterZone(o.z); P.x = z.x; P.y = z.y; await new Promise(r => setTimeout(r, 600)); return !!P.buffs.haven; });
    t.ok(share, 'and standing in it heals them too');
    const area = await A.ev(() => { P.cls = 'arcanist'; P.skills = { emberbolt: 5, frostnova: 3, arcstorm: 1 }; P.cd = {}; P.target = null; S = computeStats(); useSkill('arcstorm'); const a = AIM && AIM.id; aimCancel(); return a; });
    t.ok(area === 'arcstorm', 'area skills aim at the ground when nothing is targeted');
    t.ok(A.page.errors.length === 0 && B.page.errors.length === 0, 'no script errors' + [...A.page.errors, ...B.page.errors].map(e => ': ' + e).join(''));
    if (process.env.SHOTS) { await A.ev(() => { GZ = []; P.skills = { frostnova: 2, emberwall: 5, mend: 2, haven: 5 }; P.cls = 'arcanist'; placeZone('emberwall', 5, P.x + 90, P.y - 30, 2.3); placeZone('haven', 5, P.x - 40, P.y + 40, 0); }); await wait(800); await A.page.screenshot({ path: process.env.SHOTS + '/ground.png' }); }
  } finally { await A.close(); await B.close(); }
};
