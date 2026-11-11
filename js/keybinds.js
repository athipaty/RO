"use strict";
/* ================= Stage 7: key remapping =================
   Each action has a default key. A remapped key is translated to the default before the game sees it,
   and the old default no longer does that action, so every shortcut (walking included) follows the player's choice. */
const KEY_ACTIONS=[['up','w','Move up'],['left','a','Move left'],['down','s','Move down'],['right','d','Move right'],
  ['target','tab','Nearest monster'],['sit','x','Sit'],['chat','enter','Chat'],['emotes','e','Emotes'],
  ['status','c','Stats'],['items','i','Items'],['skills','k','Skills'],['quests','j','Quests'],['guild','g','Guild'],['map','m','World map'],['settings','o','Settings'],['fold','b','Fold the status box'],
  ...[1,2,3,4,5,6,7,8].map(n=>['s'+n,String(n),'Hotbar '+n])];
const KEYS_SAVE='embervale.keys';
let KEYB=(()=>{try{const o=JSON.parse(localStorage.getItem(KEYS_SAVE)||'{}');return o&&typeof o==='object'?o:{};}catch(e){return {};}})();
const keyOf=a=>KEYB[a]||KEY_ACTIONS.find(x=>x[0]===a)[1];
const keyName=k=>({' ':'Space',tab:'Tab',enter:'Enter',arrowup:'↑',arrowdown:'↓',arrowleft:'←',arrowright:'→'}[k]||k.toUpperCase());
let KEY_FWD=new Map(),KEY_BLOCK=new Set();
function rebuildKeys(){KEY_FWD=new Map();KEY_BLOCK=new Set();const used=new Set(KEY_ACTIONS.map(([a])=>keyOf(a)));
  for(const [a,def] of KEY_ACTIONS){const k=keyOf(a);if(k!==def){KEY_FWD.set(k,def);if(!used.has(def))KEY_BLOCK.add(def);}}}
function saveKeys(){try{localStorage.setItem(KEYS_SAVE,JSON.stringify(KEYB));}catch(e){}rebuildKeys();}
rebuildKeys();
// translate before any other key handler sees the key
let keyWait=null; // the action waiting for its new key
const typing=ev=>ev.target&&(ev.target.tagName==='INPUT'||ev.target.tagName==='TEXTAREA');
function keyRemap(ev){if(ev.__remapped||typing(ev))return;const k=ev.key.toLowerCase();
  if(keyWait&&ev.type==='keydown'){ev.preventDefault();ev.stopImmediatePropagation();if(k==='escape'){keyWait=null;refreshPanel();return;}
    const a=keyWait;keyWait=null;const other=KEY_ACTIONS.find(([b])=>b!==a&&keyOf(b)===k);
    if(other){KEYB[other[0]]=keyOf(a);if(KEYB[other[0]]===other[1])delete KEYB[other[0]];}
    if(k===KEY_ACTIONS.find(x=>x[0]===a)[1])delete KEYB[a];else KEYB[a]=k;saveKeys();refreshPanel();return;}
  // with a modifier the key means something else (Shift+1 lowers a skill, Alt+E opens items): keep it as pressed
  const fwd=KEY_FWD.get(k);
  if(fwd!==undefined&&!ev.ctrlKey&&!ev.metaKey&&!ev.altKey){ev.preventDefault();ev.stopImmediatePropagation();
    const e=new KeyboardEvent(ev.type,{key:fwd.length===1?fwd:fwd[0].toUpperCase()+fwd.slice(1),code:/^\d$/.test(fwd)?'Digit'+fwd:'',shiftKey:ev.shiftKey,altKey:ev.altKey,bubbles:true,cancelable:true});
    e.__remapped=true;window.dispatchEvent(e);return;}
  if(KEY_BLOCK.has(k)&&!ev.altKey&&!ev.ctrlKey&&!ev.metaKey){ev.stopImmediatePropagation();}}
window.addEventListener('keydown',keyRemap,true);window.addEventListener('keyup',keyRemap,true);

// the list in Settings
function keybindHtml(){return `<h3>Keys</h3><div class="sub">Press Change, then the new key. A key already in use swaps with it. Esc cancels.</div><div class="setlist keybinds">`+
  KEY_ACTIONS.map(([a,def,label])=>{const k=keyOf(a),w=keyWait===a;
    return `<div class="setrow"><div class="grow"><div class="nm">${label}</div></div><kbd class="${k!==def?'chg':''}">${w?'…':esc(keyName(k))}</kbd><button class="btn small${w?' on':''}" data-act="keyset" data-arg="${a}">${w?'Press a key':'Change'}</button></div>`;}).join('')+
  `</div><div class="tbtns" style="justify-content:flex-start;margin-top:8px"><button class="btn small" data-act="keyreset" ${Object.keys(KEYB).length?'':'disabled'}>Reset to default keys</button></div>`;}
PANEL_ACTS.keyset=a=>{keyWait=keyWait===a?null:a;refreshPanel();};
PANEL_ACTS.keyreset=()=>{KEYB={};keyWait=null;saveKeys();refreshPanel();};
const _closeKeys=PANEL_CLOSE.settings;PANEL_CLOSE.settings=()=>{keyWait=null;if(_closeKeys)_closeKeys();};
