// Runs every tests/*.test.js file in order and prints a pass/fail summary.
//   npm test                 run everything
//   npm test -- loot keys    run only files whose name contains one of the words
const fs = require('fs'), path = require('path');
const filters = process.argv.slice(2);
const files = fs.readdirSync(__dirname).filter(f => f.endsWith('.test.js'))
  .filter(f => !filters.length || filters.some(w => f.includes(w))).sort();

(async () => {
  let failed = 0, passed = 0;
  for (const f of files) {
    const checks = [];
    const t = { ok: (cond, msg) => checks.push([!!cond, msg]) };
    const t0 = Date.now();
    try { await require(path.join(__dirname, f))(t); }
    catch (e) { checks.push([false, 'crashed: ' + (e && e.message || e)]); }
    const bad = checks.filter(c => !c[0]);
    console.log(`${bad.length ? 'FAIL' : 'PASS'}  ${f}  (${((Date.now() - t0) / 1000).toFixed(1)}s)`);
    for (const [ok, msg] of checks) console.log(`   ${ok ? '✓' : '✗'} ${msg}`);
    failed += bad.length; passed += checks.length - bad.length;
  }
  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
})();
