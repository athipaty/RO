"use strict";
/* ================= mounts in the hero's 4 directions =================
   Mounts face the same 4 ways as heroes: toward the camera turned right or left (down-right, down-left) or away
   from it turned right or left (up-right, up-left), taken from the rider's own facing (face) and back view (back).
   The side drawing (mountart.js) is turned toward or away from the camera to match.
   Directions are numbered 1 down-right, 3 down-left, 5 up-left, 7 up-right (as the 8-way compass, odd ones only). */
function heroDir4(p){const f=p&&p.face<0?-1:1,b=!!(p&&p.back);return b?(f>0?7:5):(f>0?1:3);}
const _drawMountArt4=drawMountArt;
drawMountArt=function(p,k){if(!MOUNT_LOOK[k])return 0;const key=p===P?'me':(p.name||'?');
  if(String(key).startsWith('icon:'))return _drawMountArt4(p,k);
  const d=heroDir4(p);p._m8=d;MART.turn.set(key,0);return _drawMountArt4(p,k);}; // v1.38.6 level: no nose-up or nose-down tilt under an upright rider
// the turn comes from the hero's direction, not from the path
mountTurn=function(key){return MART.turn.get(key)||0;};
