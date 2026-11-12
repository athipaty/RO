// #2 weapon on the back: slung in town, while sitting or riding; held when fighting; held in the equipment window.
const { player, newRoom } = require('./helpers');
module.exports = async t => {
  const A = await player('Sling', newRoom(), { server: 'http://127.0.0.1:9' });
  try {
    const count = async (setup) => A.ev(async (setup) => { new Function(setup)(); let slung = 0, held = 0; const s = drawSlung, h = drawWeaponShape;
      drawSlung = (...a) => { slung++; return s(...a); }; drawWeaponShape = (...a) => { held++; return h(...a); };
      await new Promise(r => setTimeout(r, 400)); drawSlung = s; drawWeaponShape = h; return { slung, held }; }, setup);
    const town = await count("enterZone('town');P.cls='warden';P.lv=50;P.eq.weapon={id:'sword',s:[],r:0};P.sitting=false;");
    t.ok(town.slung > 3, 'in town the weapon is slung on the back');
    const field = await count("enterZone('meadow');P.sitting=false;");
    t.ok(field.slung === 0 && field.held > 3, 'out in the field it is in your hand');
    const sit = await count("P.sitting=true;");
    t.ok(sit.slung > 3, 'sitting down slings it');
    const swing = await count("P.sitting=false;enterZone('town');P.swingT=now;P.swingDur=5;");
    t.ok(swing.slung === 0, 'swinging (in a duel, say) brings it to hand');
    const doll = await A.ev(() => { P.swingT = 0; enterZone('town'); let n = 0; const s = drawSlung; drawSlung = (...a) => { n++; return s(...a); }; openPanel('equip'); drawEquipDoll(); drawSlung = s; closePanel(); return n; });
    t.ok(doll === 0, 'the equipment window still shows it in your hand');
    t.ok(A.page.errors.length === 0, 'no script errors' + A.page.errors.map(e => ': ' + e).join(''));
  } finally { await A.close(); }
};
