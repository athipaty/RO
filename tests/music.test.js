// #69 more original music: Arena, Emberkeep and Mossdeep Caverns each get their own theme.
const { player, wait, newRoom } = require('./helpers');

module.exports = async t => {
  const g = await player('Bard', newRoom(), { server: 'http://127.0.0.1:9' });
  try {
    await wait(800);
    const songs = await g.ev(() => ['arena', 'keep', 'caves'].map(id => { const s = SONGS[id]; return { id, len: s.len, bars: s.len / s.spb, notes: s.notes.filter(Boolean).length, chords: s.ch.length, ok: s.ch.every(c => c.length === 3 && c.every(Number.isFinite)) && s.notes.every(n => n === null || (Number.isFinite(n.n) && n.len >= 1)) }; }));
    for (const s of songs) t.ok(s.len === 64 && s.bars === 8 && s.notes > 15 && s.chords === 8 && s.ok, `the ${s.id} theme is 8 full bars (${s.notes} notes over ${s.chords} chords)`);
    const play = await g.ev(() => { audioInit(); const c = AU.ctx; let err = null; try { for (const id of ['arena', 'keep', 'caves']) { const s = SONGS[id], sd = 60 / s.bpm / 2; for (let i = 0; i < s.len; i++) musicStep(s, i, c.currentTime + 1 + i * sd, sd); } } catch (e) { err = e.message; } return err; });
    t.ok(play === null, 'all three play through without errors' + (play ? ': ' + play : ''));
    const where = await g.ev(() => { const r = {}; for (const z of ['arena', 'keep', 'deep1', 'deep3', 'town', 'crypt']) { enterZone(z); r[z] = AU.want; } return r; });
    t.ok(where.arena === 'arena' && where.keep === 'keep' && where.deep1 === 'caves' && where.deep3 === 'caves', `each place plays its own theme (${Object.entries(where).map(([k, v]) => k + ': ' + v).join(', ')})`);
    t.ok(where.town === 'town' && where.crypt === 'crypt', 'the other regions keep theirs');
    t.ok(g.page.errors.length === 0, 'no script errors' + g.page.errors.map(e => ': ' + e).join(''));
  } finally { await g.close(); }
};
