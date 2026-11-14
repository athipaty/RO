// Job-change quests start by themselves, are pinned, lead the goal chip, show trial progress and give a gift when done
const { player, wait, newRoom } = require('./helpers');
module.exports = async t => {
  const g = await player('Calling', newRoom(), { server: 'http://127.0.0.1:9' });
  try {
    await wait(500);
    const r = await g.ev(async () => { const sleep = ms => new Promise(r => setTimeout(r, ms)), out = {};
      out.none = callingNow() === null;
      P.jl = 10; callTick(); out.card = /New quest!/.test(document.getElementById('lvCard').textContent) && /Your Calling/.test(document.getElementById('lvCard').textContent);
      out.pinned = P.track === 'calling'; goalChip(); out.chip = document.getElementById('goalChip').textContent;
      questHud(); out.hud = document.getElementById('qtrack').textContent;
      openPanel('quests'); out.log = !!panel.querySelector('.callq'); closePanel();
      // choose Warden: the calling is done, with a gift
      const red0 = (invFind('red') || {}).n || 0; P.cls = 'warden'; P.jl = 1; callTick(); out.gift = ((invFind('red') || {}).n || 0) === red0 + 5;
      // Job Lv 40: the trial
      P.jl = 40; callTick(); out.trial = callingNow().id === 'call2' && /begin the trial/.test(callStep(callingNow()).text);
      P.trial = { have: 3 }; const q = callingNow(); out.steps = q.steps.map(s => s.text).join(' | ');
      openPanel('quests'); out.pics = !!panel.querySelector('.callq .cmi.mob') && !!panel.querySelector('.callq .cmi[data-item]'); closePanel();
      goalChip(); out.chip2 = document.getElementById('goalChip').textContent;
      return out; });
    t.ok(r.none, 'a fresh Novice has no calling quest yet');
    t.ok(r.card && r.pinned, 'at Job Lv 10 a "New quest" card shows and the calling is pinned');
    t.ok(/Corvin/.test(r.chip) && /Corvin/.test(r.hud), 'the goal chip and the status-box tracker lead to Corvin (' + r.chip + ')');
    t.ok(r.log, 'the quest log shows the calling on top');
    t.ok(r.gift, 'choosing a job completes it and gives 5 Red Tonics');
    t.ok(r.trial, 'at Job Lv 40 the trial quest starts with "talk to Corvin"');
    t.ok(/Defeat Bone Archer 3\/25/.test(r.steps) && /Bring Bone Shard 0\/10/.test(r.steps), 'once begun it shows live progress (' + r.steps + ')');
    t.ok(r.pics && /Bone Archer/.test(r.chip2), 'with pictures in the log, and the chip leads to the monsters (' + r.chip2 + ')');
    t.ok(g.page.errors.length === 0, 'no script errors' + g.page.errors.map(e => ': ' + e).join(''));
  } finally { await g.close(); }
};
