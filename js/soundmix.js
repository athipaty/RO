"use strict";
/* ================= one Sound window (v1.52.1) =================
   The ♪ button (and Menu → Sound) opens it; in a party, the 🔊 in the party box too. Everything about sound in one place:
     Sound on / off for everything at once
     Music and Sound effects, each with a slider (moving a slider up turns that sound back on)
     Voice chat: join or leave, your microphone on or off, a volume for all voices, and for each party member their own
     volume and a mute button. Member volumes are kept by name in this browser, so a loud friend stays quieter. */
const VCV=(()=>{const d={all:1,per:{},off:{}};try{const v=JSON.parse(localStorage.getItem('embervale.voicevol')||'null');if(v&&typeof v==='object'){
  if(v.all>=0&&v.all<=1)d.all=v.all;if(v.per&&typeof v.per==='object')d.per=v.per;if(v.off&&typeof v.off==='object')d.off=v.off;}}catch(e){}return d;})();
const vcvSave=()=>{try{localStorage.setItem('embervale.voicevol',JSON.stringify(VCV));}catch(e){}};
const vcName=peer=>((SOC.party&&SOC.party.members.find(m=>m.peer===peer))||{}).name||'';
const vcVolOf=name=>VCV.off[name]?0:clamp(VCV.all*(VCV.per[name]??1),0,1);
function vcApplyVol(){if(typeof VC==='undefined')return;for(const [peer,e] of VC.pcs)if(e.audio){const v=vcVolOf(vcName(peer));if(Math.abs(e.audio.volume-v)>.001)e.audio.volume=v;}}
setInterval(()=>{if(typeof VC!=='undefined'&&VC.on)vcApplyVol();},400); // a new voice gets its volume as soon as it arrives

/* ---- the window ---- */
PANELS.sound=()=>{const pct=v=>Math.round(v*100),on=AU.music||AU.sfx;
  const row=(label,key,val,act,isOn,aria)=>`<div class="setrow sndrow"><div class="grow"><div class="nm">${label}</div></div>`+
    `<button class="btn small sndtog${isOn?' on':''}" data-act="${act}" aria-pressed="${isOn}">${isOn?'On':'Off'}</button>`+
    `<input type="range" min="0" max="100" value="${pct(val)}" data-snd="${key}" aria-label="${aria}"><span class="val">${pct(val)}%</span></div>`;
  let h=`<h2>Sound</h2><div class="tbtns" style="justify-content:flex-start;margin:4px 0 8px"><button class="btn sndall${on?' on':''}" data-act="sndall">${on?'🔊 Sound is on':'🔇 Sound is off'}</button></div>`;
  h+=`<div class="setlist">`+row('Music','mv',AU.mv,'sndmusic',AU.music,'Music volume')+row('Sound effects','sv',AU.sv,'sndfx',AU.sfx,'Sound effects volume')+`</div>`;
  h+=`<h3>Voice chat</h3>`;
  if(!SOC.party)h+=`<div class="sub">Join a party to talk with voice chat.</div>`;
  else{const me=selfPeer(),inV=typeof VC!=='undefined'?VC.peers:[];
    h+=`<div class="tbtns" style="justify-content:flex-start;margin:4px 0">`+(VC.on?`<button class="btn small" data-act="sndvoice">🎙 Leave voice</button>`+
        (VC.listen?`<button class="btn small" data-act="sndmic">🎧 Listening only · talk too</button>`:`<button class="btn small${VC.muted?'':' on'}" data-act="sndmic">${VC.muted?'🔇 My mic is off':'🎤 My mic is on'}</button>`)
      :`<button class="btn small" data-act="sndvoice">🎙 Join voice</button><button class="btn small" data-act="sndlisten">🎧 Listen only</button>`)+`</div>`;
    if(!VC.on)h+=`<div class="sub">Listen only: hear the party without using your microphone.</div>`;
    h+=`<div class="setlist"><div class="setrow sndrow"><div class="grow"><div class="nm">All voices</div></div><input type="range" min="0" max="100" value="${pct(VCV.all)}" data-snd="vall" aria-label="Volume of all voices"><span class="val">${pct(VCV.all)}%</span></div>`;
    for(const m of SOC.party.members){if(m.peer===me)continue;const n=m.name,off=!!VCV.off[n],v=VCV.per[n]??1;
      h+=`<div class="setrow sndrow"><div class="grow"><div class="nm">${esc(n)}</div><div class="ds">${inV.includes(m.peer)?'in voice':'not in voice'}</div></div>`+
        `<button class="btn small sndtog${off?'':' on'}" data-act="sndvmute" data-arg="${esc(n)}" aria-pressed="${!off}">${off?'Muted':'On'}</button>`+
        `<input type="range" min="0" max="100" value="${pct(v)}" data-snd="vp:${esc(n)}" aria-label="Volume of ${esc(n)}"><span class="val">${pct(v)}%</span></div>`;}
    h+=`</div>`;}
  return h;};
// sliders change as you drag (no window rebuild, so the slider keeps the finger)
panel.addEventListener('input',ev=>{const k=ev.target.dataset&&ev.target.dataset.snd;if(!k)return;audioInit();const v=clamp(+ev.target.value/100,0,1);
  if(k==='mv'||k==='sv'){AU[k]=v;if(v>0){if(k==='mv'&&!AU.music)setAudio(true,AU.sfx);if(k==='sv'&&!AU.sfx)setAudio(AU.music,true);}saveAudio();applyVolumes();}
  else if(k==='vall'){VCV.all=v;vcvSave();vcApplyVol();}
  else if(k.startsWith('vp:')){const n=k.slice(3);VCV.per[n]=v;if(v>0)delete VCV.off[n];vcvSave();vcApplyVol();}
  const val=ev.target.parentElement.querySelector('.val');if(val)val.textContent=Math.round(v*100)+'%';});
panel.addEventListener('change',ev=>{if(ev.target.dataset&&ev.target.dataset.snd==='sv')sfx('coin');if(ev.target.dataset&&/^(mv|sv)$/.test(ev.target.dataset.snd||''))refreshPanel();});
PANEL_ACTS.sndall=()=>{audioInit();const on=AU.music||AU.sfx;setAudio(!on,!on);refreshPanel();};
PANEL_ACTS.sndmusic=()=>{audioInit();setAudio(!AU.music,AU.sfx);refreshPanel();};
PANEL_ACTS.sndfx=()=>{audioInit();setAudio(AU.music,!AU.sfx);if(AU.sfx)sfx('coin');refreshPanel();};
PANEL_ACTS.sndvoice=()=>{if(VC.on)vcLeave();else vcJoin();setTimeout(()=>{if(panelKind==='sound')refreshPanel();},700);};
PANEL_ACTS.sndmic=()=>{vcMute();setTimeout(()=>{if(panelKind==='sound')refreshPanel();},700);};
PANEL_ACTS.sndlisten=()=>{vcJoin(true);setTimeout(()=>{if(panelKind==='sound')refreshPanel();},700);};
PANEL_ACTS.sndvmute=n=>{if(VCV.off[n])delete VCV.off[n];else VCV.off[n]=true;vcvSave();vcApplyVol();refreshPanel();};

/* ---- the ♪ button opens the window (it used to switch everything off at once: that is the first button inside) ---- */
{const b=document.getElementById('muteBtn');if(b){const nb=b.cloneNode(true);b.replaceWith(nb); // drop the old on/off listener
  nb.setAttribute('aria-label','Sound: music, effects and voice chat');nb.dataset.tip='Sound';nb.title='';
  nb.addEventListener('click',()=>{audioInit();togglePanel('sound');});}}
// the party box: 🔊 opens it too; it refreshes when voice changes while open
{const _rpSM=renderParty;renderParty=function(){_rpSM.apply(this,arguments);const box=document.getElementById('partyBox');if(!box||!SOC.party)return;
  let sb=document.getElementById('pSnd');if(!sb){const hd=box.querySelector('.phd'),mic=document.getElementById('pMic');if(!hd||!mic)return;
    sb=document.createElement('button');sb.id='pSnd';sb.type='button';sb.className='btn small';sb.textContent='🔊';sb.title='Voice and sound volumes';sb.setAttribute('aria-label',sb.title);
    sb.addEventListener('click',ev=>{ev.stopPropagation();openPanel('sound');});hd.insertBefore(sb,mic.nextSibling);}};}
if(typeof vcState==='function'){const _vsSM=vcState;vcState=function(){const r=_vsSM.apply(this,arguments);if(panelKind==='sound')refreshPanel();vcApplyVol();return r;};}

if(typeof TH!=='undefined')Object.assign(TH,{'Sound':'เสียง','🔊 Sound is on':'🔊 เปิดเสียงอยู่','🔇 Sound is off':'🔇 ปิดเสียงอยู่','Music':'เพลง','Sound effects':'เสียงประกอบ',
  'Voice chat':'แชทเสียง','Join a party to talk with voice chat.':'เข้าร่วมปาร์ตี้เพื่อคุยด้วยแชทเสียง','🎙 Leave voice':'🎙 ออกจากแชทเสียง','🎙 Join voice':'🎙 เข้าแชทเสียง',
  '🔇 My mic is off':'🔇 ไมค์ของฉันปิดอยู่','🎤 My mic is on':'🎤 ไมค์ของฉันเปิดอยู่','All voices':'เสียงทุกคน','in voice':'อยู่ในแชทเสียง','not in voice':'ไม่ได้อยู่ในแชทเสียง',
  'On':'เปิด','Off':'ปิด','Muted':'ปิดเสียง','Voice and sound volumes':'ระดับเสียงพูดและเสียงเกม','🎧 Listen only':'🎧 ฟังอย่างเดียว','🎧 Listening only · talk too':'🎧 ฟังอย่างเดียว · พูดด้วย',
  'Listen only: hear the party without using your microphone.':'ฟังอย่างเดียว: ได้ยินปาร์ตี้โดยไม่ใช้ไมโครโฟน'});
