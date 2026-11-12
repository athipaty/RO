"use strict";
/* ================= Stage 7: settings window =================
   Sound (music and effects, each with a volume), display (interface size, weather and seasonal effects,
   performance mode for slower phones) and the list of keys. Everything is kept in this browser. */
const SET_KEY='embervale.settings';
let SETS=(()=>{try{return Object.assign({ui:'m',lite:false},JSON.parse(localStorage.getItem(SET_KEY)||'{}'));}catch(e){return {ui:'m',lite:false};}})();
function saveSets(){try{localStorage.setItem(SET_KEY,JSON.stringify(SETS));}catch(e){}}
function applySets(){document.body.classList.remove('ui-s','ui-m','ui-l');document.body.classList.add('ui-'+(['s','m','l'].includes(SETS.ui)?SETS.ui:'m'));
  const lite=!!SETS.lite;if(window.LITE!==lite){window.LITE=lite;if(typeof resize==='function')resize();}}
applySets();

const pct=v=>Math.round(v*100);
const toggle=(act,on,label)=>`<button class="tgl${on?' on':''}" role="switch" aria-checked="${on}" data-act="${act}" aria-label="${label}"><i></i></button>`;
const seg=(act,cur,opts)=>`<div class="seg" role="radiogroup">${opts.map(([v,l])=>`<button class="${cur===v?'on':''}" role="radio" aria-checked="${cur===v}" data-act="${act}" data-arg="${v}">${l}</button>`).join('')}</div>`;
PANELS.settings=()=>{let h=`<h2>Settings</h2><div class="sub">Saved in this browser.</div>`;
  h+=`<h3>Sound</h3><div class="setlist">`+
    `<div class="setrow"><div class="grow"><div class="nm">Music</div></div><input type="range" min="0" max="100" value="${pct(AU.mv)}" data-set="mv" aria-label="Music volume" ${AU.music?'':'disabled'}><span class="val">${pct(AU.mv)}%</span>${toggle('setmusic',AU.music,'Music on or off')}</div>`+
    `<div class="setrow"><div class="grow"><div class="nm">Sound effects</div></div><input type="range" min="0" max="100" value="${pct(AU.sv)}" data-set="sv" aria-label="Sound effects volume" ${AU.sfx?'':'disabled'}><span class="val">${pct(AU.sv)}%</span>${toggle('setsfx',AU.sfx,'Sound effects on or off')}</div></div>`;
  h+=`<h3>Display</h3><div class="setlist">`+
    `<div class="setrow"><div class="grow"><div class="nm">Interface size</div><div class="ds">Boxes, buttons and windows</div></div>${seg('setui',SETS.ui,[['s','Small'],['m','Normal'],['l','Large']])}</div>`+
    `<div class="setrow"><div class="grow"><div class="nm">Weather and seasons</div><div class="ds">Rain, snow, fog, embers, festival lanterns</div></div>${toggle('weathert',typeof skyOn==='undefined'||skyOn,'Weather effects on or off')}</div>`+
    `<div class="setrow"><div class="grow"><div class="nm">Performance mode</div><div class="ds">Draws at lower resolution: smoother on slower phones. Switches on by itself if the game runs slowly</div></div>${toggle('setlite',!!SETS.lite,'Performance mode on or off')}</div></div>`;
  h+=`<h3>Mouse</h3><div class="dv keylist">`+[['Click / tap','walk, attack, talk, pick up'],['Shift + click','attack in place'],['Right-click monster','monster info'],['Drag a window title','move the window'],['Esc','close · H help'],['⊞ beside the hotbar','extra rows: Alt+1–8 row 2, F1–F8 row 3']].map(([k,v])=>`<div><span>${k}</span><span>${v}</span></div>`).join('')+`</div>`;
  if(typeof keybindHtml==='function')h+=keybindHtml();
  h+=`<div class="tbtns" style="justify-content:flex-start;margin-top:12px"><button class="btn small" data-act="sethelp">Open help</button></div>`;
  return h;};
PANEL_ACTS.setmusic=()=>{audioInit();setAudio(!AU.music,AU.sfx);refreshPanel();};
PANEL_ACTS.setsfx=()=>{audioInit();setAudio(AU.music,!AU.sfx);refreshPanel();};
PANEL_ACTS.setui=v=>{SETS.ui=v;saveSets();applySets();if(typeof renderParty==='function')renderParty();refreshPanel();};
PANEL_ACTS.setlite=()=>{SETS.lite=!SETS.lite;saveSets();applySets();refreshPanel();};
PANEL_ACTS.sethelp=()=>openPanel('help');
// volume sliders change as you drag (no window rebuild, so the slider keeps the pointer)
panel.addEventListener('input',ev=>{const k=ev.target.dataset&&ev.target.dataset.set;if(!k)return;const v=clamp(+ev.target.value/100,0,1);
  AU[k]=v;saveAudio();applyVolumes();const val=ev.target.parentElement.querySelector('.val');if(val)val.textContent=pct(v)+'%';});
panel.addEventListener('change',ev=>{if(ev.target.dataset&&ev.target.dataset.set==='sv')sfx('coin');});
