"use strict";
/* ================= phones: the skill tree as icons, details on the right =================
   On touch screens the Skills window shows every skill as a picture in a compact tree (grouped by calling, in the
   order you unlock them, arrows between tiers). Tap one and its full card opens on the right: what it does, its level,
   SP, what it needs, Learn / Level up, hotbar keys and the cast level. Since v1.0.7 desktop uses it too, in a wider window. */
const SKP={sel:null};
function skillSections(){const c=CLASSES[P.cls];if(!c)return [];if(P.cls==='novice')return [['Novice',['firstaid']]];
  if(c.tier===3){const p=CLASSES[c.parent],own3=new Set(c.own),own2=new Set(p.own);return [[CLASSES[c.base].name,c.skills.filter(s=>!own3.has(s)&&!own2.has(s))],[p.name,p.own],[c.name,c.own]];}
  if(c.tier===2){const own=new Set(c.own);return [[CLASSES[c.base].name,c.skills.filter(s=>!own.has(s))],[c.name,c.own]];}
  return [[c.name,c.skills]];}
const skpOn=()=>true; // since v1.0.7 desktop uses the icon tree too (lines between skills read better than a wall of cards)
{const _stP=skillTreeHtml;skillTreeHtml=function(){if(!skpOn()||!P)return _stP.apply(this,arguments);
  const full=_stP.apply(this,arguments);
  // keep the header (title, points, build guide bar) from the usual tree
  const cut=full.indexOf('<div class="ttier"')>=0?full.indexOf('<div class="ttier"'):full.indexOf('<h3');const head=cut>0?full.slice(0,cut).replace(/<h3[^>]*>[^<]*<\/h3>\s*$/,''):full;
  const secs=skillSections(),all=secs.flatMap(s=>s[1]);if(!SKP.sel||!all.includes(SKP.sel))SKP.sel=(typeof buildNextSkill==='function'&&P.build&&buildNextSkill(buildById(P.build))||{}).id||all[0];
  const nx=typeof buildNextSkill==='function'&&P.build?buildNextSkill(buildById(P.build)):null;
  let left='';
  for(const [title,ids] of secs){const tiers=[];for(const id of ids){if(!SKILLS[id])continue;const d=skillDepth(id);(tiers[d]=tiers[d]||[]).push(id);}
    left+=`<div class="skpsec">${esc(title)}</div>`;
    // each row ordered under the skills it needs, so the lines run as straight as they can
    const rows=tiers.filter(Boolean),pos=new Map();rows.forEach((row,ti)=>{if(ti){const key=id=>{const q=Object.keys(SKILL_REQ[id]||{}).filter(k=>pos.has(k));return q.length?q.reduce((a,k)=>a+pos.get(k),0)/q.length:99;};row.sort((a,b)=>key(a)-key(b));}
      row.forEach((id,i)=>pos.set(id,i-(row.length-1)/2));});
    rows.forEach((row,ti)=>{if(ti)left+=`<div class="skparrow" aria-hidden="true">▼</div>`;left+=`<div class="skprow">`+row.map(id=>{const sk=SKILLS[id],l=P.skills[id]||0,locked=skillMissing(id).length>0;
      return `<button class="skpic${l?' has':''}${locked?' locked':''}${SKP.sel===id?' sel':''}${nx&&nx.id===id?' next':''}${sk.kind==='passive'?' pas':''}" data-act="sksel" data-arg="${id}" aria-label="${esc(sk.name)} level ${l} of ${sk.max}">`+
        `<img src="${skillIconURL(id)}" alt=""><span class="skplv">${l}/${sk.max}</span><span class="skpnm">${esc(sk.name)}</span></button>`;}).join('')+`</div>`;});}
  const card=skillTiers([SKP.sel]).replace('<div class="ttier">','<div class="ttier skpcard">');
  const sk=SKILLS[SKP.sel],nl=Math.min(sk.max,(P.skills[SKP.sel]||0)+1);
  const more=(P.skills[SKP.sel]||0)<sk.max?`<div class="skpnext"><span class="muted">At Lv ${nl}:</span> ${esc(sk.desc(nl))}</div>`:'';
  return head+`<div class="skpwrap"><div class="skpleft">${left}</div><div class="skpright">${card}${(P.skills[SKP.sel]||0)?more:''}</div></div>`;};}
PANEL_ACTS.sksel=id=>{if(!SKILLS[id])return;SKP.sel=id;sfx('click');refreshPanel();};
