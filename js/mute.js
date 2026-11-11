"use strict";
/* ================= Stage 7: mute =================
   A personal list of players whose chat, whispers, emotes and requests (party, guild, trade, duel) you don't see.
   Kept in this browser by name; the muted player is not told. */
const MUTE_KEY='embervale.muted',MUTE_MAX=100;
let MUTED=(()=>{try{const a=JSON.parse(localStorage.getItem(MUTE_KEY)||'[]');return Array.isArray(a)?a.filter(n=>typeof n==='string').map(n=>clean(n,16)).filter(Boolean).slice(0,MUTE_MAX):[];}catch(e){return [];}})();
const isMuted=name=>!!name&&MUTED.some(n=>n.toLowerCase()===String(name).toLowerCase());
function muteToggle(name,on){name=clean(name,16);if(!name){addLog(on?'Usage: /mute Name':'Usage: /unmute Name');return;}
  const i=MUTED.findIndex(n=>n.toLowerCase()===name.toLowerCase());
  if(on){if(P&&name.toLowerCase()===P.name.toLowerCase()){addLog('You cannot mute yourself.','l-bad');return;}
    if(i>=0){addLog(`${name} is already muted.`);return;}if(MUTED.length>=MUTE_MAX){addLog(`Your mute list is full (${MUTE_MAX}).`,'l-bad');return;}
    MUTED.push(name);
    for(const o of NET.others.values())if(o.n&&o.n.toLowerCase()===name.toLowerCase()){o.bubble=null;o.emote=null;}
    addLog(`Muted ${name}. You won't see their chat, emotes or requests. /unmute ${name} to undo.`,'l-good');}
  else{if(i<0){addLog(`${name} is not muted.`);return;}MUTED.splice(i,1);addLog(`Unmuted ${name}.`,'l-good');}
  try{localStorage.setItem(MUTE_KEY,JSON.stringify(MUTED));}catch(e){}
  if(typeof updateWho==='function')updateWho();if(panelKind==='settings')refreshPanel();}
const _chatCmdMute=chatCommand;
chatCommand=function(k,arg){
  if(k==='mute'||k==='block'||k==='ignore'){if(!arg){addLog(MUTED.length?'Muted: '+MUTED.join(', '):'Usage: /mute Name');return true;}muteToggle(arg.trim(),true);return true;}
  if(k==='unmute'||k==='unblock'||k==='unignore'){muteToggle(arg.trim(),false);return true;}
  if(k==='muted'||k==='blocked'){addLog(MUTED.length?'Muted: '+MUTED.join(', '):'You have not muted anyone.');return true;}
  return _chatCmdMute(k,arg);};
// the list in Settings
const _setPanelMute=PANELS.settings;
PANELS.settings=()=>{const h=_setPanelMute();
  const list=`<h3>Muted players</h3>`+(MUTED.length?`<div class="setlist">`+MUTED.map(n=>`<div class="setrow"><div class="grow"><div class="nm">${esc(n)}</div></div><button class="btn small" data-act="unmute" data-arg="${esc(n)}">Unmute</button></div>`).join('')+`</div>`
    :`<div class="sub">Nobody. Mute someone from the online list or with /mute Name.</div>`);
  const at=h.indexOf('<h3>Keys</h3>');return at<0?h+list:h.slice(0,at)+list+h.slice(at);};
PANEL_ACTS.unmute=n=>muteToggle(n,false);
