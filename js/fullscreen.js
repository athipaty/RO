"use strict";
/* ================= full screen on phones =================
   A Full screen button in the phone menu (☰) and in Settings. Android browsers go truly full screen (no URL bar)
   and, if you hold the phone sideways, lock to landscape. iPhone Safari cannot do this for web pages, so there
   the button explains how to add Embervale to the Home Screen, which opens without the browser bar. */
const isIOS=()=>/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
const inStandalone=()=>!!(navigator.standalone||matchMedia('(display-mode: fullscreen)').matches||matchMedia('(display-mode: standalone)').matches);
const isFull=()=>!!(document.fullscreenElement||document.webkitFullscreenElement);
function fullHint(){const msg='On iPhone: tap Share (the square with an arrow), then "Add to Home Screen". Open Embervale from that icon and it fills the whole screen.';
  addLog(msg,'l-rare');if(typeof floatT==='function'&&P)floatT(P.x,P.y-50,'Add to Home Screen','#ffe7a0',13);}
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
