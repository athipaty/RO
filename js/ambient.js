"use strict";
/* ================= #67 footsteps and #68 ambient sounds =================
   Footsteps change with the ground under you (grass, dirt, sand, cobblestone, snow, cave stone). Each region has
   its own background: birds in the meadow, wind and owls in the woods, desert wind, crackling embers, howling
   frost wind, cave drips, the town fountain, the arena crowd. Everything is synthesised (no recordings), runs
   through the sound-effects volume, and Settings has an "Ambient sounds" switch (kept in embervale.settings). */
const AMBS={wind:null,windZone:null,next:0,stepAcc:0,lastFoot:0};
const ambOn=()=>!!(typeof SETS==='undefined'||SETS.amb!==false);
const ambReady=()=>!!(AU.ctx&&AU.sfx&&running&&P&&!document.hidden);
// the ground under a spot: grass / dirt / sand / stone / snow / cave
function groundAt(x,y){if(!Z)return 'grass';const tx=Math.floor(x/TILE),ty=Math.floor(y/TILE),v=Z.t[ty*Z.w+tx],th=Z.D.theme;
  if(v===6)return 'stone';if(th==='frost')return 'snow';if(th==='cave'||th==='crypt'||th==='keep')return v===1?'stone':'cave';if(th==='dunes'||th==='arena')return 'sand';return v===1?'dirt':'grass';}
// one step: a short filtered noise burst, voiced per surface
function footstep(kind,vol){if(!AU.ctx)return;const v=(vol??.08)*(.85+Math.random()*.3);
  const S={grass:{ft:'lowpass',f:900,dur:.07,v:.7},dirt:{ft:'bandpass',f:1300,dur:.06,v:.9,q:1},sand:{ft:'highpass',f:2600,dur:.09,v:.55},
    stone:{ft:'bandpass',f:2200,dur:.035,v:1,q:3},snow:{ft:'lowpass',f:1600,dur:.11,v:.75,q:.4},cave:{ft:'bandpass',f:700,dur:.05,v:1,q:2}}[kind]||{ft:'lowpass',f:900,dur:.07,v:.7};
  noise({ft:S.ft,f:S.f*(.9+Math.random()*.2),q:S.q||.7,dur:S.dur,vol:v*S.v});
  if(kind==='stone'||kind==='cave')tone({f:kind==='cave'?140:260,dur:.04,vol:v*.25,type:'triangle'});}
// a steady background bed (wind) with a slow swell; one per region, faded in and out
function windBed(level,cut){const c=AU.ctx;if(!c)return null;const s=c.createBufferSource();s.buffer=AU.noise;s.loop=true;
  const f=c.createBiquadFilter();f.type='lowpass';f.frequency.value=cut;f.Q.value=.5;const g=c.createGain();g.gain.value=0;
  const lfo=c.createOscillator(),lg=c.createGain();lfo.frequency.value=.09+Math.random()*.05;lg.gain.value=level*.45;lfo.connect(lg);lg.connect(g.gain);
  s.connect(f);f.connect(g);g.connect(AU.fx);s.start();lfo.start();g.gain.setTargetAtTime(level,c.currentTime,1.2);return {s,g,lfo,level};}
function windStop(){const w=AMBS.wind;AMBS.wind=null;AMBS.windZone=null;if(!w||!AU.ctx)return;const t=AU.ctx.currentTime;w.g.gain.cancelScheduledValues(t);w.g.gain.setTargetAtTime(0,t,.6);setTimeout(()=>{try{w.s.stop();w.lfo.stop();}catch(e){}},3000);}
const BEDS={meadow:[.010,700],woods:[.022,520],dunes:[.03,900],frost:[.035,1100],crypt:[.012,300],deep1:[.01,260],deep2:[.01,260],deep3:[.012,240],keep:[.012,400],arena:[.014,600],town:[.006,800]};
// occasional sounds per region
const chirp=()=>{const b=2200+Math.random()*1400,n=2+Math.floor(Math.random()*3),t=AU.ctx.currentTime;for(let i=0;i<n;i++)tone({f:b,f2:b*(1.25+Math.random()*.3),dur:.07,vol:.035,t:t+i*.11,type:'sine'});};
const owl=()=>{const t=AU.ctx.currentTime;tone({f:420,f2:380,dur:.35,vol:.05,t,type:'sine',lp:900});tone({f:420,f2:360,dur:.5,vol:.045,t:t+.5,type:'sine',lp:900});};
const drip=()=>{const f=900+Math.random()*900;tone({f,f2:f*1.6,dur:.12,vol:.06,type:'sine',send:true});};
const crackle=()=>{const t=AU.ctx.currentTime;for(let i=0;i<4;i++)noise({ft:'highpass',f:3000,dur:.02,vol:.05*Math.random(),t:t+Math.random()*.4});};
const gust=()=>noise({ft:'bandpass',f:500,f2:1400,q:.6,dur:1.6,vol:.03});
const splash=()=>{const t=AU.ctx.currentTime;for(let i=0;i<3;i++)noise({ft:'bandpass',f:1800+Math.random()*1500,q:2,dur:.18,vol:.02,t:t+i*.12});};
const crowd=()=>{const t=AU.ctx.currentTime;for(let i=0;i<5;i++)tone({f:180+Math.random()*160,dur:.5,vol:.012,t:t+Math.random()*.6,type:'sawtooth',lp:500});};
const SPOTS={meadow:[chirp,5,9],woods:[()=>Math.random()<.35?owl():chirp(),7,14],dunes:[gust,6,12],frost:[gust,5,9],crypt:[crackle,2,5],deep1:[drip,2,6],deep2:[drip,2,6],deep3:[drip,2,5],keep:[crackle,4,8],arena:[crowd,4,9],town:[splash,3,6]};

function ambTick(dt){
  if(!ambReady()||!ambOn()){if(AMBS.wind)windStop();return;}
  // background bed for this region
  if(AMBS.windZone!==zoneId){windStop();const b=BEDS[zoneId];if(b){AMBS.wind=windBed(b[0],b[1]);AMBS.windZone=zoneId;}else AMBS.windZone=zoneId;}
  // spot sounds
  const sp=SPOTS[zoneId];if(sp&&now>=AMBS.next){if(AMBS.next)try{sp[0]();}catch(e){}AMBS.next=now+sp[1]+Math.random()*(sp[2]-sp[1]);}
  // footsteps while walking, on the ground under you
  if(P.moving&&!P.dead&&!P.sitting){AMBS.stepAcc+=dt;if(AMBS.stepAcc>=.27){AMBS.stepAcc=0;AMBS.lastFoot=groundAt(P.x,P.y);footstep(AMBS.lastFoot);}}else AMBS.stepAcc=.2;}
const _netTickAmb=netTick;
netTick=function(dt){_netTickAmb(dt);try{ambTick(dt);}catch(e){}};
document.addEventListener('visibilitychange',()=>{if(document.hidden)windStop();});

// Settings: an on/off switch next to the volume sliders
if(typeof PANELS!=='undefined'&&PANELS.settings){const _setAmb=PANELS.settings;
  PANELS.settings=()=>{const h=_setAmb(),row=`<div class="setrow"><div class="grow"><div class="nm">Ambient sounds</div><div class="ds">Footsteps, birds, wind, drips and crowds</div></div>${toggle('setamb',ambOn(),'Ambient sounds on or off')}</div>`;
    const at=h.indexOf('</div><h3>Display</h3>');return at<0?h:h.slice(0,at)+row+h.slice(at);};
  PANEL_ACTS.setamb=()=>{SETS.amb=!ambOn();saveSets();if(!SETS.amb)windStop();refreshPanel();};}
