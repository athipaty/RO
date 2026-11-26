"use strict";
/* ================= the build guide's job pictures move (v1.70.0) =================
   The pictures of each job in the build guide (js/buildguide.js jobPicURL) were still images. While the guide is open,
   each one becomes a small canvas that draws your hero in that job live: breathing, robes and capes moving, auras,
   rune circles and the falcon. About 15 frames a second, only for pictures on screen, only while a window shows them
   (the build guide, the job window's calling cards).
   Loaded after js/buildguide.js. */
const JOBANIM={rev:{},on:false,last:0};
{const _jp=jobPicURL;jobPicURL=function(cls){const u=_jp.apply(this,arguments);if(u)JOBANIM.rev[u]=cls;return u;};}
function jobAnimDraw(cv){const cls=cv.dataset.cls,C=CLASSES[cls];if(!C||!P)return;const g=cv.getContext('2d');g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,cv.width,cv.height);g.scale(3,3); // drawn at 3x, sharp on a phone
  const base=CLASSES[baseJob(cls)]||C,wid=base.gift&&ITEMS[base.gift]?base.gift:null,main=ctx;ctx=g;
  try{drawPlayer({name:P.name,look:P.look,cls,eq:wid?{weapon:{id:wid}}:{},x:28,y:56,face:1,back:false,moving:false,sitting:false,held:true},wid);}catch(e){}finally{ctx=main;}}
function jobAnimTick(t){if(!JOBANIM.on)return;requestAnimationFrame(jobAnimTick);
  if(typeof panel==='undefined'||panel.hidden){JOBANIM.on=false;return;}
  if(t-JOBANIM.last<66)return;JOBANIM.last=t;
  // swap the still pictures for canvases (once per render of the window)
  for(const img of panel.querySelectorAll('img')){const cls=JOBANIM.rev[img.getAttribute('src')];if(!cls)continue;
    const cv=document.createElement('canvas');cv.width=168;cv.height=192;cv.dataset.cls=cls;cv.className=img.className;cv.style.cssText=img.style.cssText;
    cv.setAttribute('aria-hidden','true');img.replaceWith(cv);}
  const vh=innerHeight;for(const cv of panel.querySelectorAll('canvas[data-cls]')){const r=cv.getBoundingClientRect();if(r.bottom<0||r.top>vh||!r.width)continue;jobAnimDraw(cv);}}
function jobAnimStart(){if(JOBANIM.on)return;JOBANIM.on=true;requestAnimationFrame(jobAnimTick);}
// any window that shows the job pictures (the build guide, the job window's calling cards) starts it, however it was filled
if(typeof panel!=='undefined'&&typeof MutationObserver!=='undefined')new MutationObserver(()=>{if(!panel.hidden&&!JOBANIM.on&&panel.querySelector('img'))jobAnimStart();}).observe(panel,{childList:true,subtree:true,attributes:true,attributeFilter:['hidden']});
