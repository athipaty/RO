// Runs every tests/*.test.js file in order and prints a pass/fail summary.
//   npm test                 run everything
//   npm test -- loot keys    run only files whose name contains one of the words
//   npm test -- --from pets  start at the first file whose name sorts at or after "pets" (to resume a run)
//   npm test -- --part 2/4   run the second quarter of the files (smaller runs on a busy machine)
//   npm test -- --failed     run again only the files that failed last time (last-run.json)
//   npm test -- --no-retry   do not run a failed file a second time
// Each file runs in its own Node process, so memory is handed back after every file and a crash
// (or Windows running out of memory) only loses that one file, not the rest of the run.
// (v1.77.1) Sturdier long runs:
//   - before each file it waits (up to 2 minutes) while the machine is short of free memory
//   - after each file, any headless test browser that file left running is closed (only headless browsers with a
//     puppeteer profile: never your own Edge or Chrome windows)
//   - a failed file is run once more; if it passes the second time it is reported as FLAKY (not a failure)
//   - "[12/217]" progress, and last-run.json lists what failed and what was flaky
const fs = require('fs'), path = require('path'), os = require('os'), { spawnSync, execSync } = require('child_process');

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

const LAST = path.join(__dirname, 'last-run.json');
let args = process.argv.slice(2), from = null, part = null, retry = true, onlyFailed = false;
const take = (flag, n) => { const i = args.indexOf(flag); if (i < 0) return null; const v = args.slice(i + 1, i + 1 + n); args.splice(i, 1 + n); return n ? v[0] : true; };
from = take('--from', 1); part = take('--part', 1); if (take('--no-retry', 0)) retry = false; if (take('--failed', 0)) onlyFailed = true;
let files = fs.readdirSync(__dirname).filter(f => f.endsWith('.test.js'))
  .filter(f => !args.length || args.some(w => f.includes(w))).filter(f => !from || f >= from).sort();
if (onlyFailed) { let last = {}; try { last = JSON.parse(fs.readFileSync(LAST, 'utf8')); } catch (e) {} const want = new Set(last.failed || []); files = files.filter(f => want.has(f)); }
if (part) { const [k, n] = part.split('/').map(Number); if (k >= 1 && n >= k) { const size = Math.ceil(files.length / n); files = files.slice((k - 1) * size, k * size); } }

// the machine's free memory, in MB
const freeMB = () => Math.round(os.freemem() / 1048576);
function waitForMemory() { const need = 900; let waited = 0;
  while (freeMB() < need && waited < 120) { if (waited === 0) console.log(`   (waiting: only ${freeMB()} MB free)`); spawnSync(process.execPath, ['-e', 'setTimeout(()=>{},5000)']); waited += 5; } }
// close headless test browsers left running (Windows; elsewhere the browser dies with its process)
function sweepBrowsers() {
  if (process.platform !== 'win32') return;
  try { execSync('powershell -NoProfile -Command "Get-CimInstance Win32_Process -Filter \\"Name=\'msedge.exe\' or Name=\'chrome.exe\'\\" | Where-Object { $_.CommandLine -match \'--headless\' -and $_.CommandLine -match \'puppeteer\' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }"', { stdio: 'ignore', timeout: 20000 }); } catch (e) {}
}
function runFile(f) {
  waitForMemory();
  const r = spawnSync(process.execPath, [__filename, '--one', f], { cwd: __dirname, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, timeout: 10 * 60 * 1000 });
  sweepBrowsers();
  const out = r.stdout || '', m = out.match(/@@counts (\d+) (\d+)/);
  return { out: out.replace(/^@@counts.*\n?/m, ''), pass: m ? +m[1] : 0, fail: m ? +m[2] : 1, died: !m, why: !m ? (r.signal ? ': ' + r.signal : r.error ? ': ' + r.error.message : '') : '', err: (r.stderr || '').trim().split('\n').slice(-3).join('\n') };
}

let failed = 0, passed = 0; const failedFiles = [], flaky = [], t0 = Date.now();
files.forEach((f, i) => {
  process.stdout.write(`[${i + 1}/${files.length}] `);
  let r = runFile(f);
  if (r.fail && retry) { const again = runFile(f); if (!again.fail) { flaky.push(f); r = again; r.out = r.out.replace(/^PASS /, 'FLAKY'); } }
  process.stdout.write(r.out);
  if (r.died) { console.log(`FAIL  ${f}  (the test process died${r.why})`); if (r.err) console.log('   ' + r.err.replace(/\n/g, '\n   ')); }
  passed += r.pass; failed += r.fail; if (r.fail) failedFiles.push(f);
});
const mins = ((Date.now() - t0) / 60000).toFixed(1);
console.log(`\n${passed} passed, ${failed} failed` + (flaky.length ? ` · flaky (passed on a second try): ${flaky.join(', ')}` : '') + ` · ${files.length} files in ${mins} min`);
if (failedFiles.length) console.log('failed files: ' + failedFiles.join(', ') + '   (npm test -- --failed runs just these)');
try { fs.writeFileSync(LAST, JSON.stringify({ at: new Date().toISOString(), files: files.length, checksPassed: passed, checksFailed: failed, failed: failedFiles, flaky }, null, 1)); } catch (e) {}
process.exit(failed ? 1 : 0);
