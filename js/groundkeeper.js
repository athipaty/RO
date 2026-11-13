"use strict";
/* ================= the ground never goes black =================
   Each region's ground is drawn once into a big picture and copied to the screen every frame (render.js
   isoGround). Phones limit how much memory pictures may use in total (iPhone Safari especially), and they can
   wipe pictures while the game is in the background. A wiped picture shows as a black map while you can still
   walk around. So:
   1. Only the region you are in (and the one you just left, for quick trips back through a gate) keep their
      ground pictures; the others are freed and rebuilt when you return (maps are generated from a fixed seed, so
      they come out the same). The flat source picture is freed once the diamond view is made.
      That is ~25-50 MB instead of ~240 MB after visiting every region.
   2. The ground picture is checked (one pixel in the middle of the map) when you come back to the game, after the
      browser resets its graphics, and every few seconds; if it has gone blank it is redrawn at once, together
      with the cached names and pictures that may have been wiped with it. */
const GK={prev:null,checkAt:0,rebuilds:0};
function gkFree(c){if(c&&c.width){c.width=0;c.height=0;}}
function gkRelease(z){if(!z)return;gkFree(z.img);gkFree(z._iso);z.img=null;z._iso=null;z._isoSrc=undefined;}
const _isoGroundGK=isoGround;
isoGround=function(z){
  if(z._iso&&z._iso.width&&!z._gkBad)return z._iso;
  z._gkBad=false;gkFree(z._iso);z._iso=null;
  if(!z.img||!z.img.width)renderZone(z,null);      // rebuild the flat map (same seed, same map)
  z._isoSrc=undefined;const c=_isoGroundGK(z);
  if(c&&c.width){gkFree(z.img);z.img=null;z._isoSrc=null;} // the diamond view is all we draw from now on
  return c;};
// render.js keeps the cache only while z._isoSrc===z.img: after freeing the flat map both are null, so it stays valid
function gkSweep(){if(typeof zoneCache==='undefined'||!Z)return;
  for(const z of Object.values(zoneCache))if(z!==Z&&z!==GK.prev)gkRelease(z);}
const _enterZoneGK=enterZone;
enterZone=function(){const before=Z;const r=_enterZoneGK.apply(this,arguments);if(before&&before!==Z)GK.prev=before;gkSweep();return r;};

/* ---- is the ground picture still there? ---- */
function gkBlank(z){const c=z&&z._iso;if(!c)return false;if(!c.width)return true;
  try{const g=c.getContext('2d');if(!g||(g.isContextLost&&g.isContextLost()))return true;
    const T=TILE,cx=Math.round((z.w-z.h)/2*T*ISO+c._ox),cy=Math.round((z.w+z.h)/2*T*ISO/2);
    return g.getImageData(Math.max(0,Math.min(c.width-1,cx)),Math.max(0,Math.min(c.height-1,cy)),1,1).data[3]===0;}catch(e){return false;}}
// throw away pictures that may have been wiped with the ground (they redraw themselves on next use)
function gkClearCaches(){try{if(typeof LABELS!=='undefined')LABELS.clear();}catch(e){}
  try{if(typeof SPR!=='undefined')for(const k in SPR)delete SPR[k];}catch(e){}
  try{if(typeof NPC_SPR!=='undefined')NPC_SPR.clear();if(typeof MARK_SPR!=='undefined')MARK_SPR.clear();}catch(e){}
  try{if(typeof texts!=='undefined')for(const t of texts)t.img=null;if(typeof GLYPHS!=='undefined')GLYPHS.clear();}catch(e){}}
function gkCheck(force){if(!running||!Z)return;
  if(force||gkBlank(Z)){Z._gkBad=true;GK.rebuilds++;if(!force)gkClearCaches();isoGround(Z);}}
// every 4 s while playing (not during a boss fight: a check is cheap, but never risk a hitch there)
setInterval(()=>{if(document.hidden||(typeof BS!=='undefined'&&BS.bossOn))return;gkCheck(false);},4000);
// coming back to the game, or the browser restoring its graphics: check straight away
const gkSoon=()=>setTimeout(()=>gkCheck(false),150);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)gkSoon();});
addEventListener('pageshow',gkSoon);addEventListener('focus',gkSoon);
if(typeof cv!=='undefined'&&cv){cv.addEventListener('contextrestored',()=>{gkClearCaches();gkCheck(true);});}
