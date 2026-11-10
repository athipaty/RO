// Exports what the game server needs to run monsters: every region's walkable map, spawn
// tiles and monster list, plus monster stats and drop tables. It runs the game's own
// js/data.js + js/world.js (with drawing switched off), so the server gets exactly the
// same maps the players see.
//
//   node tools/export-world.js            -> writes tools/embervale-world.json
//
// Copy that file to center-kitchen-backend/routes/embervale/world.json whenever regions,
// monsters or drops change.
const fs = require('fs'), path = require('path'), vm = require('vm');
const root = path.join(__dirname, '..');
const read = f => fs.readFileSync(path.join(root, f), 'utf8');

const sandbox = { console, Math, Date, JSON, Uint8Array, Set, Map, Object, Array, Number, String, location: { search: '' } };
vm.createContext(sandbox);
// one combined script so the files share top-level declarations just like in the browser
const code = read('js/data.js') + '\n' + read('js/world.js') + `
renderZone = () => {};   // drawing needs a browser; the maps themselves do not
const out = { version: VERSION, tile: TILE, pr: PR, block: BLOCK, zones: {}, mobs: {} };
for (const id of ZONE_ORDER) {
  const D = ZONES[id]; if (!D.mobs) continue;
  const z = getZone(id);
  out.zones[id] = { w: z.w, h: z.h, t: Buffer.from(z.t).toString('base64'), spawnTiles: z.spawnTiles, mobs: D.mobs, safe: !!D.safe };
}
for (const id in MOBS) { const m = MOBS[id];
  out.mobs[id] = { lv: m.lv, hp: m.hp, atk: m.atk, def: m.def, flee: m.flee, hit: m.hit, spd: m.spd, size: m.size, range: m.range || 0,
    aggro: !!m.aggro, boss: !!m.boss, world: m.world || null, mvp: m.mvp || [], name: m.name, undead: !!m.undead, respawn: m.respawn || 0, drops: m.drops, sigChance: m.sigChance || 0.02 }; }
globalThis.__out = out;`;
sandbox.Buffer = Buffer;
vm.runInContext(code.replace(/^"use strict";/gm, ''), sandbox, { filename: 'export-world' });
const out = sandbox.__out;
const file = path.join(__dirname, 'embervale-world.json');
fs.writeFileSync(file, JSON.stringify(out));
console.log(`wrote ${path.relative(root, file)}: ${Object.keys(out.zones).length} regions, ${Object.keys(out.mobs).length} monsters, ${(fs.statSync(file).size / 1024).toFixed(1)} KB (game v${out.version})`);
