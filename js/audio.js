"use strict";
/* ================= audio: original soundtrack + sound effects ================= */
const AU={ctx:null,music:true,sfx:true,song:null,want:null,next:0,step:0};
try{const a=JSON.parse(localStorage.getItem('embervale.audio')||'null');if(a){AU.music=a.m!==false;AU.sfx=a.s!==false;}}catch(e){}
function saveAudio(){try{localStorage.setItem('embervale.audio',JSON.stringify({m:AU.music,s:AU.sfx}));}catch(e){}}
const mf=m=>440*Math.pow(2,(m-69)/12);
const PC={C:0,D:2,E:4,F:5,G:7,A:9,B:11};
function noteNum(s){const r=/^([A-G])([#b]?)(\d)$/.exec(s);if(!r)return null;return 12*(+r[3]+1)+PC[r[1]]+(r[2]==='#'?1:r[2]==='b'?-1:0);}
function chordNotes(n){const r=/^([A-G])([#b]?)(m?)$/.exec(n);const root=48+PC[r[1]]+(r[2]==='#'?1:r[2]==='b'?-1:0);return [root,root+(r[3]?3:4),root+7];}
// Every melody below is composed for Embervale. Tokens are eighth notes: a note, "." to hold, "-" for a rest.
const SONGS={
  town:{bpm:100,spb:6,lead:'triangle',lp:2600,arp:true,lv:1,chords:'F C Dm Bb F C Bb C',
    mel:'A4 . C5 . A4 G4 | E4 . G4 . C5 . | D5 . C5 A4 F4 . | G4 . . . - - | A4 . C5 . F5 E5 | D5 . C5 . G4 . | Bb4 A4 G4 . D5 . | C5 . . . - -'},
  meadow:{bpm:132,spb:8,lead:'square',lp:2200,lv:.7,chords:'C G Am F C G F G',drums:{k:[0,4],h:[2,6],s:[4]},
    mel:'E5 . G5 . C5 . E5 D5 | D5 . B4 . G4 . - G4 | A4 C5 E5 . D5 C5 A4 . | F4 . A4 . C5 . A4 . | E5 . G5 . C6 . G5 E5 | D5 . G5 . B4 . D5 . | C5 . A4 . F4 A4 C5 . | D5 . . . - - G4 .'},
  woods:{bpm:84,spb:8,lead:'sine',lp:3000,arp:true,lv:1.2,chords:'Dm G Dm C F C G Dm',
    mel:'D5 . . F5 A5 . . . | B4 . . D5 G5 . F5 E5 | D5 . . . A4 . C5 . | E5 . . . - - - - | F5 . E5 . C5 . A4 . | G4 . . C5 E5 . . . | D5 . B4 . G4 . B4 . | D5 . . . - - - -'},
  dunes:{bpm:104,spb:8,lead:'sawtooth',lp:1500,lv:.6,chords:'A Bb A Gm A Dm Bb A',drums:{k:[0,3,6],h:[2,5]},
    mel:'A4 . Bb4 C#5 E5 . C#5 Bb4 | A4 . - - D5 . Bb4 . | C#5 . E5 . F5 E5 C#5 . | D5 . Bb4 . G4 . A4 . | E5 . F5 E5 D5 . C#5 . | D5 . F5 . A5 . F5 D5 | F5 E5 D5 . Bb4 . C#5 . | A4 . . . - - - -'},
  crypt:{bpm:76,spb:8,lead:'square',lp:900,lv:.9,chords:'Em C Am B Em C D B',pulse:true,
    mel:'E4 . . G4 B4 . . . | C5 . B4 . G4 . . . | A4 . . C5 E5 . D5 C5 | B4 . . . D#5 . . . | E5 . . . B4 . G4 . | C5 . . . E5 . G4 . | F#4 . A4 . D5 . C5 . | B4 . . . - - - -'},
  frost:{bpm:88,spb:8,lead:'sine',lp:4000,arp:true,lv:1.2,chords:'Am F C G Am F E E',
    mel:'E5 . A5 . B5 . C6 . | A5 . . . F5 . E5 . | G5 . E5 . C5 . D5 E5 | D5 . . . - - B4 . | C5 . E5 . A5 . B5 . | C6 . B5 A5 F5 . A5 . | G#5 . . . E5 . B4 . | E5 . . . - - - -'},
  boss:{bpm:150,spb:8,lead:'sawtooth',lp:2400,lv:.7,chords:'Cm Cm Ab Bb Cm Cm Ab G',drums:{k:[0,2,4,6],h:[1,3,5,7],s:[2,6]},pulse:true,
    mel:'C5 C5 - C5 Eb5 . D5 C5 | G4 . - G4 C5 . Eb5 . | Ab4 . C5 . Eb5 . F5 Eb5 | D5 . Bb4 . F5 . D5 . | C5 C5 - C5 G5 . F5 Eb5 | D5 . C5 . Eb5 . G5 . | Ab5 . G5 F5 Eb5 . C5 . | B4 . D5 . G5 . - -'},
};
for(const id in SONGS){const s=SONGS[id];const toks=s.mel.replace(/\|/g,' ').trim().split(/\s+/);s.len=toks.length;s.ch=s.chords.split(' ').map(chordNotes);
  s.notes=toks.map((t,i)=>{const n=noteNum(t);if(n===null)return null;let len=1;while(toks[i+len]==='.')len++;return {n,len};});}
function audioInit(){
  if(AU.ctx){if(AU.ctx.state==='suspended')AU.ctx.resume().catch(()=>{});return;}
  const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
  try{AU.ctx=new AC();}catch(e){return;}
  const c=AU.ctx;AU.master=c.createGain();AU.master.gain.value=.8;AU.master.connect(c.destination);
  AU.mus=c.createGain();AU.mus.gain.value=AU.music?.3:0;AU.mus.connect(AU.master);
  AU.fx=c.createGain();AU.fx.gain.value=AU.sfx?.6:0;AU.fx.connect(AU.master);
  AU.dly=c.createDelay();AU.dly.delayTime.value=.27;const fb=c.createGain();fb.gain.value=.3;const wet=c.createGain();wet.gain.value=.3;AU.dly.connect(fb);fb.connect(AU.dly);AU.dly.connect(wet);wet.connect(AU.mus);
  const buf=c.createBuffer(1,c.sampleRate,c.sampleRate),d=buf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;AU.noise=buf;
  setInterval(schedMusic,25);
  if(AU.want)musicPlay(AU.want);
}
function tone(o){const c=AU.ctx,t=o.t??c.currentTime;const osc=c.createOscillator();osc.type=o.type||'sine';osc.frequency.setValueAtTime(o.f,t);
  if(o.f2)osc.frequency.exponentialRampToValueAtTime(o.f2,t+(o.slide||o.dur));
  const g=c.createGain(),a=o.a??.005,v=o.vol??.3;g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(v,t+a);g.gain.exponentialRampToValueAtTime(.0001,t+Math.max(o.dur,a+.01));
  let node=osc;if(o.lp){const f=c.createBiquadFilter();f.type='lowpass';f.frequency.value=o.lp;osc.connect(f);node=f;}
  node.connect(g);g.connect(o.dest||AU.fx);if(o.send)g.connect(AU.dly);osc.start(t);osc.stop(t+o.dur+.05);}
function noise(o){const c=AU.ctx,t=o.t??c.currentTime;const s=c.createBufferSource();s.buffer=AU.noise;const f=c.createBiquadFilter();f.type=o.ft||'highpass';f.frequency.setValueAtTime(o.f||2000,t);
  if(o.f2)f.frequency.exponentialRampToValueAtTime(o.f2,t+o.dur);f.Q.value=o.q||.7;const g=c.createGain();g.gain.setValueAtTime(o.vol??.3,t);g.gain.exponentialRampToValueAtTime(.0001,t+o.dur);
  s.connect(f);f.connect(g);g.connect(o.dest||AU.fx);s.start(t,Math.random()*.5);s.stop(t+o.dur+.02);}
function musicPlay(id){AU.want=id;if(!AU.ctx||AU.song===SONGS[id])return;const c=AU.ctx;
  AU.song=SONGS[id];AU.step=0;AU.next=c.currentTime+.12;
  if(AU.music){AU.mus.gain.cancelScheduledValues(c.currentTime);AU.mus.gain.setValueAtTime(0,c.currentTime);AU.mus.gain.linearRampToValueAtTime(.3,c.currentTime+.8);}}
function schedMusic(){const c=AU.ctx,s=AU.song;if(!c||!s||!AU.music)return;const sd=60/s.bpm/2;
  if(AU.next<c.currentTime)AU.next=c.currentTime+.02;
  while(AU.next<c.currentTime+.15){musicStep(s,AU.step,AU.next,sd);AU.next+=sd;AU.step=(AU.step+1)%s.len;}}
function musicStep(s,i,t,sd){
  const pos=i%s.spb,ch=s.ch[Math.floor(i/s.spb)%s.ch.length],m=s.notes[i],half=s.spb===6?3:4;
  if(m)tone({dest:AU.mus,type:s.lead,f:mf(m.n),dur:m.len*sd*.95+.06,vol:.15*s.lv,a:.012,lp:s.lp,t,send:true});
  if(pos===0||pos===half)tone({dest:AU.mus,type:'triangle',f:mf(ch[0]-12),dur:sd*half*.9,vol:.24,lp:700,t});
  if(s.pulse&&pos%2===1)tone({dest:AU.mus,type:'triangle',f:mf(ch[0]-12),dur:sd*.6,vol:.12,lp:500,t});
  if(pos===0)for(const n of ch)tone({dest:AU.mus,type:'sine',f:mf(n+12),dur:sd*s.spb,vol:.03,a:.2,t});
  if(s.arp&&pos%2===1)tone({dest:AU.mus,type:'sine',f:mf(ch[(pos>>1)%3]+24),dur:sd*.9,vol:.045,t,send:true});
  if(s.drums){const d=s.drums;
    if(d.k.includes(pos))tone({dest:AU.mus,type:'sine',f:130,f2:40,dur:.18,vol:.45,t});
    if(d.h.includes(pos))noise({dest:AU.mus,f:7000,dur:.035,vol:.06,t});
    if(d.s&&d.s.includes(pos))noise({dest:AU.mus,ft:'bandpass',f:1700,dur:.12,vol:.1,t});}
}
const lastSfx={};
function sfx(n){
  if(!AU.ctx||!AU.sfx)return;const t=AU.ctx.currentTime;if(lastSfx[n]&&t-lastSfx[n]<.045)return;lastSfx[n]=t;
  switch(n){
    case 'hit':noise({ft:'bandpass',f:1300,f2:350,dur:.09,vol:.4,q:1.2});tone({f:170,f2:55,dur:.11,vol:.45});break;
    case 'hitBlade':noise({f:3200,dur:.07,vol:.3});tone({type:'square',f:950,f2:320,dur:.07,vol:.08,lp:3200});tone({f:150,f2:60,dur:.08,vol:.32});break;
    case 'hitBlunt':tone({f:120,f2:45,dur:.15,vol:.6});noise({ft:'lowpass',f:900,f2:200,dur:.12,vol:.4});break;
    case 'hitArrow':noise({ft:'bandpass',f:1800,dur:.05,vol:.25,q:2});tone({type:'triangle',f:330,f2:140,dur:.07,vol:.25});break;
    case 'zap':tone({type:'sawtooth',f:300,f2:1000,dur:.13,vol:.12,lp:2400});noise({f:3500,dur:.07,vol:.14});break;
    case 'crit': // the big one: a ringing metallic "shing" over a heavy thump
      tone({f:110,f2:38,dur:.3,vol:.7});noise({f:3500,dur:.4,vol:.32});
      tone({type:'square',f:1319,dur:.35,vol:.1,lp:5000,t:t+.02});tone({type:'square',f:1760,dur:.5,vol:.08,lp:6000,t:t+.05});
      tone({f:2637,dur:.7,vol:.12,t:t+.06});tone({f:3520,dur:.5,vol:.06,t:t+.09});
      tone({type:'sawtooth',f:200,f2:1400,dur:.12,vol:.1,lp:3500});break;
    case 'miss':noise({ft:'bandpass',f:700,f2:2600,dur:.16,vol:.13,q:2});break;
    case 'hurt':tone({type:'square',f:150,f2:70,dur:.16,vol:.16,lp:900});noise({ft:'lowpass',f:700,dur:.1,vol:.22});break;
    case 'kill':tone({type:'triangle',f:523,dur:.1,vol:.18});tone({type:'triangle',f:784,dur:.2,vol:.18,t:t+.07});break;
    case 'bow':noise({ft:'bandpass',f:2600,f2:900,dur:.11,vol:.22,q:3});tone({type:'triangle',f:240,f2:110,dur:.08,vol:.14});break;
    case 'cast':tone({f:420,f2:1250,dur:.18,vol:.14});break;
    case 'skill':tone({type:'triangle',f:392,dur:.12,vol:.17});tone({type:'triangle',f:587,dur:.18,vol:.15,t:t+.06});tone({f:880,f2:1320,dur:.25,vol:.1,t:t+.1});break;
    case 'heal':[523,659,784,1047].forEach((f,i)=>tone({f,dur:.3,vol:.13,t:t+i*.06}));break;
    case 'levelup':[523,659,784,1047,784,1047].forEach((f,i)=>tone({type:i>3?'square':'triangle',f,dur:i===5?.7:.18,vol:.15,lp:4000,t:t+i*.1}));break;
    case 'jobup':[587,740,880,1175].forEach((f,i)=>tone({type:'triangle',f,dur:.26,vol:.15,t:t+i*.09}));break;
    case 'pickup':tone({type:'square',f:988,dur:.06,vol:.06,lp:3000});tone({type:'square',f:1319,dur:.1,vol:.06,lp:3000,t:t+.05});break;
    case 'rare':[1047,1319,1568,2093,2637].forEach((f,i)=>tone({f,dur:.55,vol:.12,t:t+i*.07}));noise({f:6000,dur:.7,vol:.07});break;
    case 'coin':tone({type:'square',f:1568,dur:.06,vol:.05,lp:4000});tone({type:'square',f:2093,dur:.16,vol:.05,lp:4000,t:t+.06});break;
    case 'portal':tone({f:200,f2:900,dur:.5,vol:.14});noise({ft:'bandpass',f:400,f2:3000,dur:.5,vol:.12,q:4});break;
    case 'death':[392,330,262,196].forEach((f,i)=>tone({type:'triangle',f,dur:.45,vol:.17,t:t+i*.22}));break;
    case 'ping':tone({f:1175,dur:.15,vol:.07});tone({f:1568,dur:.25,vol:.06,t:t+.08});break;
    case 'click':tone({type:'triangle',f:660,dur:.04,vol:.05});break;
    case 'pop':tone({f:520,f2:1100,dur:.09,vol:.12});tone({type:'triangle',f:1320,dur:.08,vol:.05,t:t+.05});break;
    case 'fanfare':[[523,0],[523,.12],[523,.24],[659,.36],[784,.6],[659,.78],[784,.9],[1047,1.05]].forEach(([f,d],i)=>tone({type:i%2?'square':'triangle',f,dur:i===7?.8:.16,vol:.13,lp:4500,t:t+d}));break;
    case 'slam':tone({f:90,f2:28,dur:.7,vol:.75});noise({ft:'lowpass',f:900,f2:90,dur:.6,vol:.5});break;
  }
}
function setAudio(music,fxOn){AU.music=music;AU.sfx=fxOn;saveAudio();
  if(AU.ctx){const c=AU.ctx;AU.mus.gain.cancelScheduledValues(c.currentTime);AU.mus.gain.setValueAtTime(music?.3:0,c.currentTime);AU.fx.gain.value=fxOn?.6:0;if(music){AU.next=c.currentTime+.05;}}
  $('#muteBtn').classList.toggle('on',music||fxOn);$('#muteBtn').textContent=(music||fxOn)?'♪':'×';}

