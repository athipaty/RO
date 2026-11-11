// #67 footsteps and #68 ambient sounds: steps follow the ground under you, each region has its own background,
// and Settings can turn it all off. (Sound itself can't be heard in a test; this checks what gets played.)
const { player, wait, newRoom } = require('./helpers');

module.exports = async t => {
  const g = await player('Listener', newRoom(), { server: 'http://127.0.0.1:9' });
  try {
    await wait(800);
    const ground = await g.ev(() => { const r = {}; enterZone('town'); r.town = groundAt(20 * TILE + 5, 19 * TILE + 5);
      enterZone('meadow'); const road = Z.portals[0]; r.meadowRoad = groundAt(road.x + 3 * TILE, road.y); r.meadowGrass = groundAt(Z.spawnTiles[0] % Z.w * TILE + 16, Math.floor(Z.spawnTiles[0] / Z.w) * TILE + 16);
      enterZone('dunes'); r.dunes = groundAt(Z.spawn.x, Z.spawn.y); enterZone('frost'); r.frost = groundAt(Z.spawn.x, Z.spawn.y); enterZone('deep1'); r.cave = groundAt(Z.spawn.x, Z.spawn.y); return r; });
    t.ok(ground.town === 'stone' && ground.meadowRoad === 'dirt' && ground.meadowGrass === 'grass' && ground.dunes === 'sand' && ground.frost === 'snow' && ['cave', 'stone'].includes(ground.cave),
      `the ground is told apart (${Object.entries(ground).map(([k, v]) => k + ': ' + v).join(', ')})`);
    // footsteps while walking
    const steps = await g.ev(async () => { audioInit(); enterZone('meadow'); const kinds = []; const orig = footstep; footstep = k => { kinds.push(k); return orig(k); };
      keys.d = true; await new Promise(r => setTimeout(r, 1300)); keys.d = false; await new Promise(r => setTimeout(r, 500)); const n = kinds.length; await new Promise(r => setTimeout(r, 600)); const after = kinds.length; footstep = orig; return { n, after, kinds }; });
    t.ok(steps.n >= 2 && steps.after === steps.n, `walking makes footsteps (${steps.n} in about a second), and they stop when you stop`);
    // a background per region
    const beds = await g.ev(async () => { const r = {}; for (const z of ['meadow', 'frost', 'deep1']) { enterZone(z); await new Promise(res => setTimeout(res, 300)); r[z] = AMBS.windZone === z && !!AMBS.wind; } return r; });
    t.ok(beds.meadow && beds.frost && beds.deep1, 'each region starts its own background sound');
    const spots = await g.ev(async () => { enterZone('town'); let n = 0; AMBS.next = now; const orig = SPOTS.town[0]; SPOTS.town[0] = () => { n++; }; await new Promise(r => setTimeout(r, 400)); SPOTS.town[0] = orig; return n; });
    t.ok(spots >= 1, 'and plays its occasional sounds (the fountain in Hearthvale)');
    // the switch in Settings
    const off = await g.ev(async () => { openPanel('settings'); const sw = panel.querySelector('[data-act="setamb"]'); const had = !!sw; sw.click(); await new Promise(r => setTimeout(r, 300));
      let n = 0; const orig = footstep; footstep = () => { n++; }; keys.d = true; await new Promise(r => setTimeout(r, 800)); keys.d = false; footstep = orig;
      const saved = JSON.parse(localStorage.getItem('embervale.settings')).amb; closePanel(); return { had, n, wind: !!AMBS.wind, saved }; });
    t.ok(off.had && off.n === 0 && !off.wind && off.saved === false, 'the Ambient sounds switch in Settings turns it all off, and is remembered');
    t.ok(g.page.errors.length === 0, 'no script errors' + g.page.errors.map(e => ': ' + e).join(''));
  } finally { await g.close(); }
};
