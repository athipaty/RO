// Runs every tests/*.test.js file in order and prints a pass/fail summary.
//   npm test                 run everything
//   npm test -- loot keys    run only files whose name contains one of the words
//   npm test -- --from pets  start at the first file whose name sorts at or after "pets" (to resume a run)
// Each file runs in its own Node process, so memory is handed back after every file and a crash
// (or Windows running out of memory) only loses that one file, not the rest of the run.
const fs = require('fs'), path = require('path'), { spawnSync } = require('child_process');

// child mode: run one file, print its result, exit with the counts
if (process.argv[2] === '--one') {
  const f = process.argv[3], checks = [];
  const t = { ok: (cond, msg) => checks.push([!!cond, msg]) };
  const t0 = Date.now();
  (async () => {
    try { await require(path.join(__dirname, f))(t); }
    catch (e) { checks.push([false, 'crashed: ' + (e && e.message || e)]); }
    const bad = checks.filter(c => !c[0]);
    console.log(`${bad.length ? 'FAIL' : 'PASS'}  ${f}  (${((Date.now() - t0) / 1000).toFixed(1)}s)`);
    for (const [ok, msg] of checks) console.log(`   ${ok ? '✓' : '✗'} ${msg}`);
    console.log(`@@counts ${checks.length - bad.length} ${bad.length}`);
    process.exit(0);
  })();
  return;
}

let args = process.argv.slice(2), from = null;
const fi = args.indexOf('--from'); if (fi >= 0) { from = args[fi + 1]; args.splice(fi, 2); }
const files = fs.readdirSync(__dirname).filter(f => f.endsWith('.test.js'))
  .filter(f => !args.length || args.some(w => f.includes(w))).filter(f => !from || f >= from).sort();

let failed = 0, passed = 0;
for (const f of files) {
  const r = spawnSync(process.execPath, [__filename, '--one', f], { cwd: __dirname, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, timeout: 10 * 60 * 1000 });
  const out = r.stdout || '', m = out.match(/@@counts (\d+) (\d+)/);
  process.stdout.write(out.replace(/^@@counts.*\n?/m, ''));
  if (m) { passed += +m[1]; failed += +m[2]; }
  else { failed++; console.log(`FAIL  ${f}  (the test process died${r.signal ? ': ' + r.signal : r.error ? ': ' + r.error.message : ''})`);
    const err = (r.stderr || '').trim().split('\n').slice(-3).join('\n'); if (err) console.log('   ' + err.replace(/\n/g, '\n   ')); }
}
console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
