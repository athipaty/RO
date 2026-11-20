"use strict";
/* ================= phones: townsfolk windows fill the screen =================
   Talking to anyone in town (shops, smith, storage, guild hall, chapel, waystation, stylist, quests ...) opens
   their window full screen on touch devices, so lists and buttons have room. It stays full screen while you move
   between that person's pages (a quest chat that leads to their shop) and ends when the window closes.
   Since v1.0.2 the windows you open yourself (Stats, Items, Skills, Shortcut keys ...) fill the screen too. Desktop is unchanged. */
const NPCWIN={on:false,opening:false};
function syncNpcFull(){
  // townsfolk windows, and the Equipment window, fill the screen on phones
  // since v1.0.2 every window fills the screen on phones (Skills, Status, Items, Shortcut keys, ...), not just townsfolk and Equipment
  // v1.34.0 conversations (a few lines and buttons) open as a dialogue box at the bottom instead, as tall as what they say
  const open=!!panelKind&&!panel.hidden&&document.body.classList.contains('touchui'),sheet=open&&NPC_SHEET.has(panelKind),on=open&&!sheet;
  if(panel.classList.contains('npcsheet')!==sheet)panel.classList.toggle('npcsheet',sheet);
  if(panel.classList.contains('npcfull')!==on){panel.classList.toggle('npcfull',on);if(on)requestAnimationFrame(()=>{panel.scrollTop=0;});} // after the window is filled: no extra layout pass
  if(document.body.classList.contains('npcopen')!==on)document.body.classList.toggle('npcopen',on);}
// the windows that are a conversation, not a page of lists: shown as a dialogue box at the bottom on phones
// v1.45.4 the Waystation (travel, rest, stable) fills the screen: it is a page of places, not a few lines of talk
const NPC_SHEET=new Set(['talk','heal','festival','arena','keep','waystone','rebirth']);
// tapping the town above the dialogue box closes it (the tap still walks you there)
document.addEventListener('pointerdown',e=>{if(!panel.hidden&&panel.classList.contains('npcsheet')&&e.target&&e.target.id==='cv')closePanel();},true);
const _openNpcFull=openNpc;
openNpc=function(n){NPCWIN.opening=true;NPCWIN.on=true;try{return _openNpcFull.apply(this,arguments);}finally{NPCWIN.opening=false;syncNpcFull();}};
const _openPanelFull=openPanel;
openPanel=function(kind,arg){if(panel.hidden&&!NPCWIN.opening)NPCWIN.on=false; // a fresh window not from a townsperson
  const r=_openPanelFull.apply(this,arguments);syncNpcFull();return r;};
// however the window gets closed (✕, Esc, walking away, code), drop the full-screen mode with it
new MutationObserver(()=>{if(panel.hidden)NPCWIN.on=false;syncNpcFull();}).observe(panel,{attributes:true,attributeFilter:['hidden']});
addEventListener('resize',syncNpcFull);
const _closePanelFull=closePanel;
closePanel=function(){const r=_closePanelFull.apply(this,arguments);if(panel.hidden){NPCWIN.on=false;syncNpcFull();}return r;};
