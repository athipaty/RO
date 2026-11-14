"use strict";
/* ================= icons on tabs =================
   The tabs in the bag (Use, Equip, Sigils, Etc), the shop categories and the gear-type tabs (shops, forge) get a small
   icon in front of their name, so they can be told apart at a glance on a phone. Added after each window is drawn. */
const TAB_ICON={
  use:'<path d="M9 3h6M10 3v5l-4 7a4 4 0 0 0 3.5 6h5a4 4 0 0 0 3.5-6l-4-7V3"/><path d="M7.5 14h9"/>',
  equip:'<path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z"/>',
  sigil:'<path d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.5 6.7 19.4l1.2-6L3.4 9.3l6-.7z"/>',
  etc:'<path d="M6 8h12l-1 12H7z"/><path d="M9 8a3 3 0 0 1 6 0"/>',
  weapon:'<path d="M5 19L17 7M14 4h6v6M5 15l4 4M3 21l3-3"/>',
  armor:'<path d="M8 3l-4 3 2 5v10h12V11l2-5-4-3-2 2h-4z"/>',
  head:'<path d="M4 15a8 8 0 0 1 16 0v2H4z"/><path d="M2 17h20"/>',
  accessory:'<circle cx="12" cy="14" r="5"/><path d="M9 4l3 5 3-5"/>',
  face:'<circle cx="8" cy="12" r="3"/><circle cx="16" cy="12" r="3"/><path d="M11 12h2M2 11h3M19 11h3"/>',
  mouth:'<path d="M4 12c3 4 13 4 16 0"/><path d="M4 12c3-2 13-2 16 0"/>',
  all:'<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>'};
function tabIcons(){if(!panel||panel.hidden)return;
  for(const b of panel.querySelectorAll('[data-act="invtab"],[data-act="shopcat"],[data-act="shopgear"],[data-act="forgetype"]')){
    if(b.querySelector('svg.tabi'))continue;const k=b.dataset.arg,p=TAB_ICON[k];if(!p)continue;
    b.insertAdjacentHTML('afterbegin',`<svg class="tabi" viewBox="0 0 24 24" aria-hidden="true">${p}</svg>`);}}
{const _rpT=refreshPanel;refreshPanel=function(){const r=_rpT.apply(this,arguments);try{tabIcons();}catch(e){}return r;};}
