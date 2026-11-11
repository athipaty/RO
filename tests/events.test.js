// Stage 5 timed events: EXP Weekend and Golden Hour from the clock (Thailand time), the line under the minimap,
// the EXP bonus, and the seasonal Hearthvale (lanterns in November, snow in December).
const { player, wait, newRoom } = require('./helpers');
module.exports = async t => {
  const g = await player('Eventer', newRoom(), { zone: 'meadow', server: 'http://127.0.0.1:9' });
  try {
    await wait(1500);
    const r = await g.ev(() => { const at = (y, m, d, h) => Date.UTC(y, m - 1, d, h) - 7 * 3600e3; // Thailand time
      const sat = activeEvents(at(2026, 11, 14, 10)).map(e => e.id), tue = activeEvents(at(2026, 11, 10, 10)).map(e => e.id),
        tue20 = activeEvents(at(2026, 11, 10, 20)).map(e => e.id), sun20 = activeEvents(at(2026, 11, 15, 20)).map(e => e.id);
      const satEnd = activeEvents(at(2026, 11, 14, 10))[0].ends, mondayStart = at(2026, 11, 16, 0);
      return { sat, tue, tue20, sun20, endsOk: satEnd === mondayStart, nov: season(at(2026, 11, 20, 12)), dec: season(at(2026, 12, 20, 12)), jan: season(at(2027, 1, 20, 12)),
        bonus: eventExpBonus(at(2026, 11, 15, 20)) }; });
    t.ok(r.sat.join() === 'weekend' && r.tue.length === 0, 'EXP Weekend runs on Saturday and Sunday (Thailand time), not on weekdays');
    t.ok(r.endsOk, 'and ends at midnight going into Monday');
    t.ok(r.tue20.join() === 'golden' && r.sun20.join() === 'weekend,golden' && Math.abs(r.bonus - .75) < 1e-9, 'Golden Hour is every day 20:00-21:00, and stacks with the weekend (+75%)');
    t.ok(r.nov === 'lanterns' && r.dec === 'snow' && r.jan === null, 'Hearthvale has lanterns in November and snow in December');
    // the EXP bonus and the line under the minimap, with the clock moved into Golden Hour on a weekday
    const live = await g.ev(async () => { const w = ms => new Promise(r => setTimeout(r, ms)); const real = Date.now, at = Date.UTC(2026, 10, 10, 20, 30) - 7 * 3600e3;
      Date.now = () => at; try { evSeen = null; eventsTick(); const line = document.getElementById('evT').textContent, shown = !document.getElementById('evT').hidden;
        P.lv = 30; P.exp = 0; const e0 = P.exp; P.rested = 0; gainExp(100, 0); const got = P.exp - e0; return { line, shown, got }; } finally { Date.now = real; } });
    t.ok(live.shown && /Golden Hour \+25% EXP · 30m left/.test(live.line), `the event and its time left show under the minimap ("${live.line}")`);
    t.ok(live.got === 125, `kills give the bonus EXP (${live.got} instead of 100)`);
    t.ok(g.page.errors.length === 0, 'no script errors' + g.page.errors.map(e => ': ' + e).join(''));
  } finally { await g.close(); }
};
