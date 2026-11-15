// Gathering spots: placed in field regions, the timing game pays more for the gold zone, spots rest, recipes use the haul
const { player, wait, newRoom } = require('./helpers');
module.exports = async t => {
  const g = await player('Gatherer', newRoom(), { server: 'http://127.0.0.1:9' });
  try {
    await wait(400);
    const r = await g.ev(async () => { const sleep = ms => new Promise(r => setTimeout(r, ms)), out = {};
      enterZone('meadow'); await sleep(200); const spots = Z.objs.filter(o => o.kind === 'gather'); out.meadow = spots.filter(o => o.g === 'herb').length;
      out.fish = Object.keys(ZONES).some(id => { const z = getZone(id); return z.objs.some(o => o.kind === 'gather' && o.g === 'fish'); });
      out.dunes = getZone('dunes').objs.filter(o => o.kind === 'gather' && o.g === 'ore').length; out.town = getZone('town').objs.filter(o => o.kind === 'gather').length;
      // stand at a herb patch and play: stop in the gold zone
      const o = spots.find(o => o.g === 'herb'); P.x = o.x; P.y = o.y + 10; const h0 = (invFind('mossherb') || {}).n || 0;
      gatherStart(o); await sleep(100); GT.run.pos = GT.run.gz; gatherStop(); out.gold = ((invFind('mossherb') || {}).n || 0) === h0 + 3;
      out.rest = !gReady(o); await sleep(800); out.closed = document.getElementById('gatherBox').hidden;
      // the rest is saved with the hero, so reloading the page does not reset the spot
      out.saved = snapshot().p.gatherRest[o.key] > Date.now() + 250000;
      // touch: the finger going down is left to the joystick (it may become a drag); the tap it sends back on lift is taken
      { const o3 = spots.find(x => x.g === 'herb' && x !== o && gReady(x)); P.x = o3.x + 200; P.y = o3.y; P.path = []; camX = P.x - cv.clientWidth / 2; camY = P.y - cv.clientHeight / 2;
        const p = proj(o3.x, o3.y), rc = cv.getBoundingClientRect(), at = { clientX: p.x - camX + rc.left, clientY: p.y - 8 - camY + rc.top, pointerType: 'touch', pointerId: 7, bubbles: true, cancelable: true };
        cv.dispatchEvent(new PointerEvent('pointerdown', at)); out.touchDown = JOY.id === 7 && GT.goal !== o3 && !GT.run; joyStop();
        const e = new PointerEvent('pointerdown', at); e.__joyTap = true; cv.dispatchEvent(e); out.touchTap = GT.goal === o3 || !!GT.run;
        GT.goal = null; P.path = []; if (GT.run) { GT.run = null; GT.el.hidden = true; } cv.dispatchEvent(new PointerEvent('pointerup', at)); }
      // a miss gives 1
      const o2 = spots.find(x => x.g === 'herb' && x !== o); P.x = o2.x; P.y = o2.y + 10; const h1 = invFind('mossherb').n; gatherStart(o2); GT.run.pos = GT.run.gz > .5 ? 0 : 1; gatherStop(); out.miss = invFind('mossherb').n === h1 + 1;
      out.recipes = BREWS.some(r => r[0] === 'grilledfish') && BREWS.some(r => r[2].mossherb) && BREWS.some(r => r[2].ironchunk);
      out.render = (() => { try { render(); return true; } catch (e) { return e.message; } })();
      return out; });
    t.ok(r.meadow >= 3 && r.dunes >= 3 && r.town === 0, `field regions have herb and ore spots, towns none (meadow ${r.meadow} herbs, dunes ${r.dunes} ore)`);
    t.ok(r.fish, 'some regions have fishing spots by the water');
    t.ok(r.gold, 'stopping in the gold zone gathers 3');
    t.ok(r.rest && r.closed, 'the spot rests afterwards and the game closes');
    t.ok(r.saved, 'the rest time is saved with the hero (survives a reload)');
    t.ok(r.touchDown && r.touchTap, `a finger touching down near a spot is left to the joystick; the lifted tap opens it (down ${r.touchDown}, tap ${r.touchTap})`);
    t.ok(r.miss, 'a miss still gathers 1');
    t.ok(r.recipes, 'herbs, fish and ore go into recipes');
    t.ok(r.render === true, 'spots draw without errors');
    t.ok(g.page.errors.length === 0, 'no script errors' + g.page.errors.map(e => ': ' + e).join(''));
  } finally { await g.close(); }
};
