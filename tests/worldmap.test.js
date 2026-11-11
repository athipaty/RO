// #37 bigger minimap (click to toggle, remembered, exit labels) and the world map window (M).
const { player, wait, newRoom } = require('./helpers');
module.exports = async t => {
  const g = await player('Mapper', newRoom(), { zone: 'meadow', server: 'http://127.0.0.1:9' });
  try {
    await wait(1500);
    const mm = await g.ev(async () => { const w = ms => new Promise(r => setTimeout(r, ms)); const c = document.getElementById('mini');
      const w0 = c.getBoundingClientRect().width; c.click(); await w(150); const w1 = c.getBoundingClientRect().width, big = miniBig, saved = localStorage.getItem('embervale.miniBig');
      return { w0, w1, big, saved, cw: c.width }; });
    t.ok(mm.w1 > mm.w0 * 1.5 && mm.big && mm.saved === '1' && mm.cw === 260, `clicking the minimap makes it bigger (${mm.w0}px → ${mm.w1}px), and that is remembered`);
    if (process.env.SHOTS) await g.page.screenshot({ path: process.env.SHOTS + '/minimap-big.png' });
    const map = await g.ev(async () => { const w = ms => new Promise(r => setTimeout(r, ms));
      P.visited = ['town', 'meadow', 'woods']; NET.wb = { b: 'warlord', z: 'crypt', until: Date.now() + 60000 };
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'm' })); await w(100);
      const kind = panelKind, nodes = [...panel.querySelectorAll('.wnode')].map(n => n.dataset.zone), here = panel.querySelector('.wnode.here')?.dataset.zone,
        unseen = [...panel.querySelectorAll('.wnode.unseen')].map(n => n.dataset.zone), txt = panel.textContent,
        branch = [...panel.querySelectorAll('.wbranch .wnode')].map(n => n.dataset.zone);
      return { kind, nodes, here, unseen, txt, branch, btn: !!document.querySelector('[data-open="worldmap"]') }; });
    t.ok(map.kind === 'worldmap' && map.btn, 'M (or the Map button) opens the world map');
    t.ok(map.nodes.length === 9 && map.branch.join() === 'deep1,deep2,deep3', 'it shows all 6 regions and the 3 dungeon floors under the woods');
    t.ok(map.here === 'meadow' && /You are here/.test(map.txt), 'it marks where you are');
    t.ok(map.unseen.includes('frost') && !map.unseen.includes('woods') && /Sproutling/.test(map.txt) && !/Rime Stalker/.test(map.txt), 'unvisited regions are dimmed and keep their monsters secret');
    t.ok(/World boss: Ashen Warlord/.test(map.txt), 'it shows where a world boss is out');
    if (process.env.SHOTS) await g.page.screenshot({ path: process.env.SHOTS + '/worldmap.png' });
    const back = await g.ev(async () => { closePanel(); document.getElementById('mini').click(); return { big: miniBig, w: document.getElementById('mini').width }; });
    t.ok(!back.big && back.w === 150, 'clicking again makes it small');
    t.ok(g.page.errors.length === 0, 'no script errors' + g.page.errors.map(e => ': ' + e).join(''));
  } finally { await g.close(); }
};
