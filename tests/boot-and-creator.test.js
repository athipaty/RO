// The game loads without errors, the character creator works, and the chosen look is saved.
const { openGame, wait, newRoom } = require('./helpers');

module.exports = async t => {
  const g = await openGame(newRoom());
  try {
    await wait(500);
    t.ok(await g.ev(() => /^Embervale v\d+\.\d+\.\d+/.test(document.getElementById('verT').textContent)), 'version is shown on the title screen');
    // pick: next hairstyle twice, the 5th hair colour, 2nd eyes, 3rd skin
    const want = await g.ev(() => {
      localStorage.clear();
      document.getElementById('nameIn').value = 'Creator';
      document.getElementById('nameIn').dispatchEvent(new Event('input'));
      const before = newLook.style;
      document.querySelector('[data-style="1"]').click(); document.querySelector('[data-style="1"]').click();
      document.querySelectorAll('#swHair button')[4].click();
      document.querySelectorAll('#swEye button')[1].click();
      document.querySelectorAll('#swSkin button')[2].click();
      return { style: (before + 2) % 6, hair: HAIRS[4], eye: EYES[1], skin: SKINS[2], label: document.getElementById('lkStyle').textContent };
    });
    t.ok(want.label === (await g.ev(s => STYLE_NAMES[s], want.style)), 'hairstyle name updates in the creator');
    await g.ev(() => document.getElementById('newBtn').click());
    await wait(400);
    const got = await g.ev(() => P.look);
    t.ok(got && got.style === want.style && got.hair === want.hair && got.eye === want.eye && got.skin === want.skin, 'new character uses the chosen look');
    // reload and continue: the look must come back from the save
    await g.ev(() => save());
    await g.page.reload(); await wait(500);
    await g.ev(() => document.getElementById('contBtn').click()); await wait(400);
    const again = await g.ev(() => P.look);
    t.ok(again && again.hair === want.hair && again.style === want.style, 'look is restored after reloading and pressing Continue');
    t.ok(g.page.errors.length === 0, 'no script errors' + (g.page.errors.length ? ': ' + g.page.errors.join(' | ') : ''));
  } finally { await g.close(); }
};
