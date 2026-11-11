"use strict";
/* ================= #69 more original music =================
   Three new themes, written for Embervale in the same note format as the others (js/audio.js):
   - arena: a driving D minor theme with full drums for ranked fights
   - keep: a martial G minor march for Emberkeep
   - caves: a hushed E minor theme with slow arpeggios for the Mossdeep Caverns */
Object.assign(SONGS,{
  arena:{bpm:140,spb:8,lead:'square',lp:2000,lv:.65,chords:'Dm Dm Bb C Dm Dm Gm A',drums:{k:[0,3,4,7],h:[1,2,5,6],s:[4]},pulse:true,
    mel:'D5 . F5 . A5 . F5 D5 | E5 . D5 . C5 . A4 . | D5 . F5 . Bb5 . A5 F5 | G5 . E5 . C5 . E5 . | F5 . A5 . D6 . A5 F5 | E5 F5 E5 D5 C5 . A4 . | Bb4 . D5 . G5 . F5 E5 | C#5 . E5 . A5 . - -'},
  keep:{bpm:112,spb:8,lead:'triangle',lp:2400,lv:1,chords:'Gm Eb F Gm Gm Cm D D',drums:{k:[0,4],h:[],s:[2,6,7]},
    mel:'G4 . . D5 Bb4 . G4 . | Eb5 . . D5 C5 . Bb4 . | F4 . . A4 C5 . F5 . | D5 . . . G4 . - - | G4 . Bb4 . D5 . G5 . | Eb5 . D5 . C5 . G4 . | F#4 . A4 . D5 . C5 Bb4 | A4 . . . D4 . - -'},
  caves:{bpm:70,spb:8,lead:'sine',lp:3200,arp:true,lv:1.1,chords:'Em Em C C Am Am B B',
    mel:'E5 . . . - - B4 . | G5 . . . F#5 . E5 . | - - G4 . C5 . . . | E5 . . . - - - - | A4 . . C5 E5 . . . | D5 . C5 . B4 . . . | F#5 . . . D#5 . B4 . | B4 . . . - - - -'},
});
for(const id of ['arena','keep','caves']){const s=SONGS[id];const toks=s.mel.replace(/\|/g,' ').trim().split(/\s+/);s.len=toks.length;s.ch=s.chords.split(' ').map(chordNotes);
  s.notes=toks.map((t,i)=>{const n=noteNum(t);if(n===null)return null;let len=1;while(toks[i+len]==='.')len++;return {n,len};});}
// each place gets its own theme
if(ZONES.arena)ZONES.arena.music='arena';
if(ZONES.keep)ZONES.keep.music='keep';
for(const z of ['deep1','deep2','deep3'])if(ZONES[z])ZONES[z].music='caves';
