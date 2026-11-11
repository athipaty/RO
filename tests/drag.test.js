// #61 drag a window by its title; each kind of window remembers its place; double-click the title to centre it.
const { player, wait, newRoom } = require('./helpers');
module.exports = async t => {
  const g = await player('Dragger', newRoom(), { zone: 'town', server: 'http://127.0.0.1:9' });
  try {
    await wait(1500);
    const box = () => g.ev(() => { const r = panel.getBoundingClientRect(); return { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width) }; });
    const title = () => g.ev(() => { const r = panel.querySelector('h2').getBoundingClientRect(); return { x: r.left + 30, y: r.top + r.height / 2 }; });
    await g.ev(() => openPanel('items'));
    const b0 = await box(), h = await title();
    await g.page.mouse.move(h.x, h.y); await g.page.mouse.down(); await g.page.mouse.move(h.x - 250, h.y + 80, { steps: 8 }); await g.page.mouse.up();
    const b1 = await box();
    t.ok(Math.abs(b1.x - (b0.x - 250)) < 4 && Math.abs(b1.y - (b0.y + 80)) < 4, `dragging the title moves the window (${b0.x},${b0.y} → ${b1.x},${b1.y})`);
    await g.ev(() => { closePanel(); openPanel('status'); }); const other = await box();
    await g.ev(() => { closePanel(); openPanel('items'); }); const back = await box();
    t.ok(Math.abs(other.x - b0.x) < 40 && Math.abs(back.x - b1.x) < 2 && Math.abs(back.y - b1.y) < 2, 'each window remembers its own place (others stay centred)');
    const kept = await g.ev(() => { const p = JSON.parse(localStorage.getItem('embervale.winpos') || '{}'); return p.items; });
    t.ok(kept && Math.abs(kept[0] - b1.x) < 2, 'the place is saved in the browser for next time');
    const h2 = await title(); await g.page.mouse.click(h2.x, h2.y, { clickCount: 2 });
    const c = await box(); t.ok(Math.abs(c.x - b0.x) < 4, 'double-clicking the title puts it back in the middle');
    // on a phone-sized screen windows stay centred
    await g.page.setViewport({ width: 420, height: 800 }); await wait(300);
    const ph = await g.ev(() => { winPos.items = [5, 5]; closePanel(); openPanel('items'); const r = panel.getBoundingClientRect(); return Math.abs(r.left + r.width / 2 - innerWidth / 2) < 4; });
    t.ok(ph, 'on a phone-sized screen windows stay centred');
    t.ok(g.page.errors.length === 0, 'no script errors' + g.page.errors.map(e => ': ' + e).join(''));
  } finally { await g.close(); }
};
