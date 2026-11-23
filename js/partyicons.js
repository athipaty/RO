"use strict";
/* ================= icons for the party box and the sound button (v1.52.3) =================
   The party box header used words and mixed emoji; each button now has its own line icon in the style of the other
   game buttons (js/controls.js), and keeps its words as a tooltip and for screen readers:
     fold (chevron) · share EXP (star) · loot rule (bag) · voice chat (headset, green while in voice)
     microphone (mic, crossed out when muted; headphones when listening only) · sound settings (gear) · leave (door)
   The ♪ button becomes a speaker (crossed out when all sound is off). */
const PIC={
  fold:'<path d="M6 15l6-6 6 6"/>',unfold:'<path d="M6 9l6 6 6-6"/>',
  share:'<path d="M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.4 6.8 19.1l1-5.8L3.5 9.2l5.9-.9z"/><path d="M19 3v4M17 5h4"/>',
  own:'<path d="M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.4 6.8 19.1l1-5.8L3.5 9.2l5.9-.9z"/>',
  loot:'<path d="M6 8h12l-1 12H7z"/><path d="M9 8a3 3 0 0 1 6 0"/>',lootTurns:'<path d="M6 8h12l-1 12H7z"/><path d="M9 8a3 3 0 0 1 6 0"/><path d="M10 14h4M12 12v4"/>',
  voice:'<path d="M4 14v-2a8 8 0 0 1 16 0v2"/><rect x="3" y="13" width="4" height="6" rx="1.5"/><rect x="17" y="13" width="4" height="6" rx="1.5"/>',
  mic:'<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3M9 21h6"/>',
  micOff:'<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3M9 21h6"/><path d="M4 4l16 16"/>',
  listen:'<path d="M4 15v-3a8 8 0 0 1 16 0v3"/><rect x="3" y="14" width="4" height="6" rx="1.5"/><rect x="17" y="14" width="4" height="6" rx="1.5"/><path d="M10 11l2 2 2-2"/>',
  gear:'<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/>',
  leave:'<path d="M14 4h5v16h-5"/><path d="M10 8l-4 4 4 4M6 12h10"/>',
  speaker:'<path d="M4 10h4l5-4v12l-5-4H4z"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11"/>',
  speakerOff:'<path d="M4 10h4l5-4v12l-5-4H4z"/><path d="M17 10l4 4M21 10l-4 4"/>'};
const picSvg=k=>`<svg class="pic" viewBox="0 0 24 24" aria-hidden="true">${PIC[k]}</svg>`;
// put an icon on a button, keeping its words as the tooltip and the label read aloud
function picSet(b,k,label){if(!b)return;if(label){b.title=label;b.setAttribute('aria-label',label);}
  if(b._pic===k&&b.querySelector('svg.pic'))return;b._pic=k;b.innerHTML=picSvg(k);b.classList.add('picb');}

{const _rpPI=renderParty;renderParty=function(){_rpPI.apply(this,arguments);const box=document.getElementById('partyBox'),p=SOC.party;if(!box||!p)return;
  const q=id=>document.getElementById(id),reset=b=>{if(b)b._pic=null;}; // the words were just put back by the code before: draw the icon again
  const f=q('pFold'),fold=box.classList.contains('fold');reset(f);picSet(f,fold?'unfold':'fold',fold?'Show party members':'Fold the party box');
  const m=q('pMode');if(m&&!m.hidden){reset(m);picSet(m,p.mode==='share'?'share':'own',p.mode==='share'?'EXP is shared · tap so each keeps their own':'Each keeps their own EXP · tap to share');}
  const l=q('pLoot');if(l&&!l.hidden){reset(l);picSet(l,p.loot==='turns'?'lootTurns':'loot',p.loot==='turns'?'Loot by turns · tap so each rolls their own':'Each rolls their own loot · tap to take turns');}
  const v=q('pVoice');if(v){reset(v);picSet(v,'voice',VC.on?'Leave the party voice chat':'Join the party voice chat');}
  const mi=q('pMic');if(mi&&!mi.hidden){reset(mi);picSet(mi,VC.listen?'listen':VC.muted?'micOff':'mic',VC.listen?'Listening only: tap to talk too':VC.muted?'Unmute your microphone':'Mute your microphone');mi.classList.toggle('off',!!VC.muted);}
  const s=q('pSnd');if(s){reset(s);picSet(s,'gear','Sound settings: music, effects and voice volumes');}
  const lv=q('pLeave');if(lv){reset(lv);picSet(lv,'leave','Leave the party');}};}
// the ♪ button: a speaker, crossed out when all sound is off
function picSound(){const b=document.getElementById('muteBtn');if(!b)return;const on=AU.music||AU.sfx;b._pic=null;picSet(b,on?'speaker':'speakerOff',on?'Sound settings':'Sound is off · sound settings');b.classList.toggle('on',on);}
{const _saPI=setAudio;setAudio=function(){const r=_saPI.apply(this,arguments);picSound();return r;};}
picSound();

if(typeof TH!=='undefined')Object.assign(TH,{'EXP is shared · tap so each keeps their own':'แบ่ง EXP อยู่ · แตะเพื่อให้ต่างคนต่างได้','Each keeps their own EXP · tap to share':'ต่างคนต่างได้ EXP · แตะเพื่อแบ่ง',
  'Loot by turns · tap so each rolls their own':'ของดรอปผลัดกันรับ · แตะเพื่อให้ต่างคนต่างสุ่ม','Each rolls their own loot · tap to take turns':'ต่างคนต่างสุ่มของดรอป · แตะเพื่อผลัดกันรับ',
  'Sound settings: music, effects and voice volumes':'ตั้งค่าเสียง: เพลง เสียงประกอบ และเสียงพูด','Leave the party':'ออกจากปาร์ตี้','Sound settings':'ตั้งค่าเสียง','Sound is off · sound settings':'ปิดเสียงอยู่ · ตั้งค่าเสียง'});
