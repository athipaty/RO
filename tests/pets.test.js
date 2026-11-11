// #43 pets: tame a worn-down monster with a Taming Charm; it follows you, others see it, snacks keep it happy,
// a happy pet gives a bonus, a starving one goes to rest, and you can rename or release it.
const { player, wait, newRoom } = require('./helpers');
const poll = async (g, fn, arg, ms = 8000) => { const end = Date.now() + ms; while (Date.now() < end) { if (await g.ev(fn, arg)) return true; await wait(250); } return false; };

module.exports = async t => {
  const room = newRoom(), OFFLINE = 'http://127.0.0.1:9';
  const A = await player('Tamer', room, { zone: 'meadow', server: OFFLINE });
  await wait(1500);
  const B = await player('Friend', room, { zone: 'meadow', server: OFFLINE });
  try {
    t.ok(await poll(A, () => NET.others.size === 1), 'two players see each other');
    t.ok(await A.ev(() => SHOP.includes('tamecharm') && SHOP.includes('petsnack')), 'the General Store sells Taming Charms and Pet Snacks');
    // refusals
    const no = await A.ev(() => { P.inv.push({ id: 'tamecharm', n: 3 }, { id: 'petsnack', n: 3 }); const boss = mobs.find(m => m.d.boss || m.d.mini); P.target = boss; P.x = boss.x - 30; P.y = boss.y;
      const n0 = invFind('tamecharm').n; useItem('tamecharm'); return { kept: invFind('tamecharm').n === n0, log: document.getElementById('log').textContent.includes("can't be tamed") }; });
    t.ok(no.kept && no.log, "a boss can't be tamed, and the charm isn't used up");
    // a fresh monster: low odds, the charm is used, nothing happens
    const fail = await A.ev(() => { const m = mobs.find(m => m.d.id === 'sproutling' && !m.dead); P.target = m; P.x = m.x - 40; P.y = m.y; m.hp = m.d.hp; P.cd.item = 0;
      const r = Math.random; Math.random = () => .99; useItem('tamecharm'); Math.random = r; return { pet: P.pet, log: /isn't ready to trust you yet \(12% chance\)/.test(document.getElementById('log').textContent) }; });
    t.ok(!fail.pet && fail.log, 'a monster at full health has low odds (12%), and says so');
    const vit0 = await A.ev(() => (S = computeStats()).vit);
    const ok = await A.ev(() => { const m = P.target; m.hp = Math.round(m.d.hp * .1); P.cd.item = 0; const r = Math.random; Math.random = () => .5; useItem('tamecharm'); Math.random = r;
      return { pet: P.pet, odds: .12 + .6 * .9 }; });
    t.ok(ok.pet && ok.pet.k === 'sproutling' && ok.pet.out, `a worn-down one (${Math.round(ok.odds * 100)}% odds) becomes your companion`);
    t.ok(await A.ev(v => (S = computeStats()).vit === v + 2, vit0), 'a happy Sproutling gives +2 VIT');
    // it follows
    await A.ev(() => { P.x += 200; P.y += 60; });
    t.ok(await poll(A, () => PETW.me && Math.hypot(PETW.me.x - P.x, PETW.me.y - P.y) < 70), 'it follows you');
    // others see it, with its name
    await A.ev(() => { openPanel('pet'); document.getElementById('petName').value = 'Pip'; panel.querySelector('[data-act="petname"]').click(); closePanel(); });
    t.ok(await poll(B, () => { const w = [...PETW.them.values()][0]; return w && w.k === 'sproutling' && w.name === 'Pip' && w.owner === 'Tamer'; }), 'other players see your pet, by its name');
    t.ok(await A.ev(() => petItems().length === 1) && await B.ev(() => petItems().length === 1), 'it is drawn in the world on both screens');
    // happiness
    const hungry = await A.ev(() => { P.pet.happy = 50; PETW.decay = 59.99; return true; });
    t.ok(await poll(A, v => P.pet.happy === 49 && (S = computeStats()).vit === v, vit0), 'happiness slowly drops while out, and below 50 the bonus stops');
    const fed = await A.ev(() => { const n = invFind('petsnack').n; P.cd.item = 0; useItem('petsnack'); return { happy: P.pet.happy, used: invFind('petsnack').n === n - 1, heart: PETW.me.heart > 0 }; });
    t.ok(fed.happy === 74 && fed.used && fed.heart, 'a Pet Snack raises it by 25, with a little heart');
    // starving: back to rest, gone from both screens
    await A.ev(() => { P.pet.happy = 1; PETW.decay = 59.99; });
    t.ok(await poll(A, () => !P.pet.out && !PETW.me && /too hungry and went back to rest/.test(document.getElementById('log').textContent)), 'a starving pet goes back to rest');
    t.ok(await poll(B, () => PETW.them.size === 0), 'and disappears for others too');
    const call = await A.ev(() => { openPanel('pet'); panel.querySelector('[data-act="petout"]').click(); const still = !P.pet.out; P.cd.item = 0; useItem('petsnack'); panel.querySelector('[data-act="petout"]').click(); return { still, out: P.pet.out }; });
    t.ok(call.still && call.out, 'it must be fed before it can be called out again');
    t.ok(await A.ev(() => { save(); return JSON.parse(localStorage.getItem(SAVE_KEY)).p.pet.name === 'Pip'; }), 'your companion is saved');
    // clicking it opens its window
    const click = await A.ev(async () => { closePanel(); await new Promise(r => setTimeout(r, 400)); const w = PETW.me, p = proj(w.x, w.y), r = cv.getBoundingClientRect();
      cv.dispatchEvent(new PointerEvent('pointerdown', { clientX: p.x - camX + r.left, clientY: p.y - w.d.size - camY + r.top, bubbles: true, pointerType: 'mouse' })); return panelKind; });
    t.ok(click === 'pet', 'clicking your pet opens its window');
    // one at a time, then release
    t.ok(await A.ev(() => { closePanel(); const m = mobs.find(m => m.d.id === 'hopper' && !m.dead); P.target = m; m.hp = 1; P.x = m.x - 30; P.y = m.y; P.cd.item = 0; useItem('tamecharm'); return P.pet.k === 'sproutling' && /already have a companion/.test(document.getElementById('log').textContent); }), 'only one companion at a time');
    const rel = await A.ev(() => { openPanel('pet'); panel.querySelector('[data-act="petarm"]').click(); panel.querySelector('[data-act="petrelease"]').click(); return { pet: P.pet, text: panel.textContent }; });
    t.ok(!rel.pet && /Taming Charm/.test(rel.text), 'Release (after a second click) lets it go, and the window explains how to tame another');
    t.ok(A.page.errors.length === 0 && B.page.errors.length === 0, 'no script errors' + [...A.page.errors, ...B.page.errors].map(e => ': ' + e).join(''));
    if (process.env.SHOTS) { await A.ev(() => { P.pet = { k: 'hopper', name: 'Bun', happy: 90, out: true }; }); await wait(1500); await A.page.screenshot({ path: process.env.SHOTS + '/pet.png' }); }
  } finally { await A.close(); await B.close(); }
};
