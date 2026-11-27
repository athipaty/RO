"use strict";
/* ================= axes are the Forgehand's (v1.87.0) =================
   The Warden family (Warden, its advanced callings and masters) used swords, clubs and axes, the same axes the
   Forgehand (the axe smith) uses. Now each family has its own weapon: the Warden family keeps the sword and the club,
   and only the Forgehand family takes axes.
     - Sundering Blow's bonus moved from axes to swords (js/builds.js), and the Earthsplitter build fights with the
       Earthsplitter Greatsword (forged like the axe it replaces, js/buildgear.js)
     - the two bosses with an axe relic (the Ashen Warlord and the Cinder Wyrm) also drop a sword as strong
       (js/bossgear.js)
     - a Warden-family hero who still holds an axe gets it back in the bag (once, with a word): nothing is lost, it can
       be sold, traded or used by a Forgehand. */
{const fam=id=>{let c=CLASSES[id],k=0;while(c&&c.parent&&k++<5)c=CLASSES[c.parent];return c&&c.base?c.base:id;};
  for(const id in CLASSES){if(fam(id)!=='warden')continue;const c=CLASSES[id];if(Array.isArray(c.weapons)&&c.weapons.includes('axe'))c.weapons=c.weapons.filter(w=>w!=='axe');}}
function axeOnlyCheck(){if(!P||!P.eq||!P.eq.weapon||!CLASSES[P.cls])return false;const e=P.eq.weapon,it=ITEMS[e.id];
  if(!it||it.type!=='weapon'||it.wt!=='axe'||CLASSES[P.cls].weapons.includes(it.wt))return false;
  P.inv.push(e);P.eq.weapon=null;if(typeof computeStats==='function')S=computeStats();if(typeof rebuildHotbar==='function')rebuildHotbar();
  const th=typeof LANG!=='undefined'&&LANG==='th',nm=typeof itemName==='function'?itemName(e):it.name;
  addLog(th?`${nm} กลับเข้ากระเป๋าแล้ว: ขวานเป็นอาวุธของสาย Forgehand เท่านั้น สาย Warden ใช้ดาบ ขายหรือแลกเปลี่ยนได้`:`Your ${nm} is back in your bag: axes are the Forgehand's weapon now, and the Warden family fights with swords. You can sell or trade it.`,'l-rare');
  if(typeof save==='function')save();return true;}
// checked once a second, so it also covers a hero loaded from an old save or a job change
setInterval(()=>{try{if(typeof running!=='undefined'&&running)axeOnlyCheck();}catch(e){}},1000);
// the Earthsplitter Greatsword's look: a broad earthen blade with a glowing crack, like the axe it replaces
if(typeof WA!=='undefined'&&typeof waSword==='function')WA.splitblade=()=>waSword({w:5.6,len:28,guard:8,blade:'#c8b08a',gcol:'#5a3d24',gem:'#ffb040',grip:'#3a2614',wrap:'#5a3d24',pom:'#5a3d24',glow:'#ffb040'});
