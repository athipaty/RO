"use strict";
/* ================= full screen on phones =================
   A Full screen button in the phone menu (☰) and in Settings. Android browsers go truly full screen (no URL bar)
   and, if you hold the phone sideways, lock to landscape. iPhone Safari cannot do this for web pages, so there
   the button explains how to add Embervale to the Home Screen, which opens without the browser bar. */
const isIOS=()=>/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
const inStandalone=()=>!!(navigator.standalone||matchMedia('(display-mode: fullscreen)').matches||matchMedia('(display-mode: standalone)').matches);
const isFull=()=>!!(document.fullscreenElement||document.webkitFullscreenElement);
// iPhone Safari cannot go full screen for web pages: show, step by step, how to add the game to the Home Screen
const SHARE_SVG='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12M8 7l4-4 4 4"/><path d="M6 11H5v10h14V11h-1"/></svg>';
const ADD_SVG='<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="4"/><path d="M12 8v8M8 12h8"/></svg>';
function fullHint(){const msg='On iPhone: tap Share (the square with an arrow), then "Add to Home Screen". Open Embervale from that icon and it fills the whole screen.';
  addLog(msg,'l-rare');let el=document.getElementById('iosFull');
  if(!el){el=document.createElement('div');el.id='iosFull';el.setAttribute('role','dialog');el.setAttribute('aria-label','Play full screen on iPhone');document.body.appendChild(el);
    el.addEventListener('click',ev=>{if(ev.target.closest('[data-x]')||ev.target===el)el.classList.remove('show');});}
  el.innerHTML=`<div class="ifb"><div class="ift">Play full screen on iPhone</div><div class="ifs">Safari cannot make web pages full screen, but the Home Screen version can, sideways too:</div>`+
    `<ol><li><span class="ifi">${SHARE_SVG}</span><span>Tap <b>Share</b> in Safari's bar (the square with an arrow)</span></li>`+
    `<li><span class="ifi">${ADD_SVG}</span><span>Scroll down and tap <b>Add to Home Screen</b>, then <b>Add</b></span></li>`+
    `<li><span class="ifi"><img src="img/icon-192.png" alt=""></span><span>Open <b>Embervale</b> from the new icon: no browser bar, the whole screen is the game</span></li></ol>`+
    `<div class="ifs">Your character and progress stay the same (log in with your account there too).</div><div class="tbtns"><button class="btn" data-x="1">Got it</button></div></div>`;
  el.classList.add('show');}
function toggleFull(){
  if(isFull()){const ex=document.exitFullscreen||document.webkitExitFullscreen;try{ex&&ex.call(document);}catch(e){}return;}
  if(inStandalone()){addLog('Embervale is already running full screen from your Home Screen.');return;}
  const el=document.documentElement,req=el.requestFullscreen||el.webkitRequestFullscreen;
  if(!req){fullHint();return;}
  try{const p=req.call(el,{navigationUI:'hide'});const after=()=>{try{if(innerWidth>innerHeight&&screen.orientation&&screen.orientation.lock)screen.orientation.lock('landscape').catch(()=>{});}catch(e){}};
    if(p&&p.then)p.then(after).catch(()=>fullHint());else after();}catch(e){fullHint();}}
function fullLabel(){const on=isFull();for(const b of document.querySelectorAll('#mFull'))b.querySelector('span').textContent=on?'Exit full':'Full';}
document.addEventListener('fullscreenchange',()=>{fullLabel();if(typeof resize==='function')setTimeout(resize,100);});
document.addEventListener('webkitfullscreenchange',()=>{fullLabel();if(typeof resize==='function')setTimeout(resize,100);});
(()=>{const b=document.getElementById('mFull');if(b)b.addEventListener('click',()=>{const d=document.getElementById('dock');if(d)d.classList.remove('open');sfx('click');toggleFull();});})();
// Settings: a Full screen row on touch devices
if(typeof PANELS!=='undefined'&&PANELS.settings){const _ps=PANELS.settings;PANELS.settings=()=>{let h=_ps();if(document.body.classList.contains('touchui')||'ontouchstart' in window){
  h=h.replace('<h3>Mouse</h3>',`<div class="setlist"><div class="setrow"><div class="grow"><div class="nm">Full screen</div><div class="ds">${isIOS()&&!inStandalone()?'iPhone: Share → Add to Home Screen, then open it from the icon':'Hide the browser bar (landscape works too)'}</div></div><button class="btn small" data-act="setfull">${isFull()?'Exit full screen':'Go full screen'}</button></div></div><h3>Mouse</h3>`);}return h;};
  PANEL_ACTS.setfull=()=>{toggleFull();setTimeout(()=>{if(panelKind==='settings')refreshPanel();},400);};}
// turning the phone sideways (and not full screen yet) offers a one-tap Full screen button for a few seconds
(()=>{const b=document.createElement('button');b.id='fullOffer';b.type='button';b.className='btn';b.textContent='⛶ Full screen';b.hidden=true;document.body.appendChild(b);
  let t=null;b.addEventListener('click',()=>{b.hidden=true;toggleFull();});
  const check=()=>{const land=innerWidth>innerHeight,touch=document.body.classList.contains('touchui')||'ontouchstart' in window;
    if(running&&land&&touch&&!isFull()&&!inStandalone()){b.hidden=false;clearTimeout(t);t=setTimeout(()=>{b.hidden=true;},6000);}else b.hidden=true;};
  addEventListener('orientationchange',()=>setTimeout(check,400));if(screen.orientation)screen.orientation.addEventListener('change',()=>setTimeout(check,400));})();

/* ---- turning the phone: make sure the game picture really matches the screen ----
   iPhones (Safari and Home Screen apps) often report the new size late after rotating, so the "resize" event can come
   while the old size is still in place; the picture then stays at the upright size, stretched and blurry sideways.
   After any rotation the size is checked again several times, and every half second as a safety net; whenever the
   canvas size and the drawing size differ, the picture is rebuilt at the right size. */
function fitCanvas(){try{if(typeof cv==='undefined'||!cv)return;const w=cv.clientWidth,h=cv.clientHeight;if(!w||!h)return;
  if(w!==VW||h!==VH){resize();if(typeof bsApply==='function')bsApply();if(typeof LABELS!=='undefined')LABELS.clear();if(typeof placeControls==='function')placeControls();}}catch(e){}}
const fitSoon=()=>{for(const ms of [50,200,500,900,1500])setTimeout(fitCanvas,ms);};
addEventListener('orientationchange',fitSoon);if(screen.orientation)screen.orientation.addEventListener('change',fitSoon);
if(window.visualViewport)visualViewport.addEventListener('resize',fitSoon);addEventListener('pageshow',fitSoon);
setInterval(fitCanvas,500);
