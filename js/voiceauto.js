"use strict";
/* ================= party voice: hear your party without pressing anything (v1.66.0) =================
   Before, each member had to press 🎙 to hear the others. Now, as soon as someone in your party is in the voice chat,
   you join it to listen (no microphone, so the browser asks for nothing); 🎙 or the microphone button lets you talk
   too. Leaving the voice chat yourself is remembered: you are not pulled back in until you press 🎙 again. When the
   others have all left, a listener who was brought in this way leaves too. (Phones only play sound once the screen
   has been tapped since the game loaded: the next tap starts it, js/voice.js.) */
const VCA={pref:(()=>{try{return localStorage.getItem('embervale.vcAuto')!=='off';}catch(e){return true;}})(),auto:false,busy:false};
const vcaSet=on=>{VCA.pref=on;try{localStorage.setItem('embervale.vcAuto',on?'on':'off');}catch(e){}};
// your own choices: joining turns auto-listen back on, leaving turns it off
{const _vj=vcJoin;vcJoin=function(listenOnly){if(!VCA.busy){vcaSet(true);VCA.auto=false;}return _vj.apply(this,arguments);};}
{const _vl=vcLeave;vcLeave=function(quiet){if(!quiet&&!VCA.busy)vcaSet(false);if(!VCA.busy)VCA.auto=false;return _vl.apply(this,arguments);};}
{const _vs=vcState;vcState=function(m){const r=_vs.apply(this,arguments);try{
    const me=selfPeer(),others=(VC.peers||[]).filter(p=>p!==me&&inParty(p));
    if(!VC.on&&!VC.joining&&VCA.pref&&SOC.party&&others.length){VCA.busy=true;VCA.auto=true;
      try{vcJoin(true);addLog('🔊 Someone in your party is talking: you are listening now. 🎙 lets you talk; leaving the voice chat stops this.','l-good');}finally{VCA.busy=false;}}
    else if(VC.on&&VCA.auto&&VC.listen&&!others.length){VCA.busy=true;try{vcLeave(true);addLog('🔇 The party voice chat is empty, so you stopped listening.');}finally{VCA.busy=false;}VCA.auto=false;}
  }catch(e){}return r;};}
