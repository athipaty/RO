"use strict";
/* ================= buff row: every active buff with its countdown (yours, from party members, Well rested) ================= */
const buffSecs=b=>Math.max(0,Math.ceil(b.until-now));
const fmtSecs=s=>s>=60?`${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`:`${s}s`;
function buffList(){const out=[];if(!P)return out;
  for(const id in P.buffs){const b=P.buffs[id];const s=buffSecs(b);if(s>0)out.push({id,name:b.name,s,from:b.from});}
  if(typeof isRested==='function'&&isRested())out.push({id:'rested',name:'Well rested',s:Math.ceil(restedLeft()/1000),rest:true});
  return out;}
let buffSig='';
function renderBuffs(){const el=$('#buffs');if(!el)return;const list=buffList();
  const sig=list.map(b=>b.id+':'+b.s+':'+(b.from||'')).join('|');if(sig===buffSig)return;buffSig=sig;
  const h0=el.hidden?0:el.offsetHeight;el.hidden=!list.length;
  if(!list.length)el.innerHTML='';
  else el.innerHTML=list.map(b=>{const sk=SKILLS[b.id],tip=`${b.name}${b.from?` · from ${b.from}`:''} · ${fmtSecs(b.s)} left${b.rest?' · +10% EXP':''}`;
    const src=buffIcon(b.id),pic=src?`<img src="${src}" alt="">`:`<span class="bg">${b.rest?'☾':(sk?sk.g:'✦')}</span>`;
    return `<span class="buff${b.s<=5?' ending':''}${b.from?' given':''}" data-buff="${esc(b.id)}" role="button" tabindex="0" title="${esc(tip)}" aria-label="${esc(tip)}">${pic}<b>${fmtSecs(b.s)}</b></span>`;}).join('');
  // the party box sits right under the status box: move it when the row grows or shrinks
  if((el.hidden?0:el.offsetHeight)!==h0&&typeof renderParty==='function')renderParty();}

/* each buff shows where it came from: the skill's picture, or the potion / brew / festival food that gave it
   (with its stat badge), or, failing both, a badge drawn from the buff's own stats */
const BUFF_ICON={};
function buffIcon(id){if(BUFF_ICON[id]!==undefined)return BUFF_ICON[id];let url='';
  try{if(SKILLS[id]&&typeof skillIconURL==='function')url=skillIconURL(id);
    else{const item=ITEMS[id]?id:Object.keys(ITEMS).find(k=>ITEMS[k].brew&&ITEMS[k].brew.id===id);
      if(item&&typeof itemIconURL==='function')url=itemIconURL(item);
      else if(typeof potBadge==='function'&&P&&P.buffs[id]){const k=potKind({brew:{b:P.buffs[id].b||{}}});
        if(k){const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d');g.scale(2.6,2.6);potBadge(g,k,12.3,12.3);url=c.toDataURL();}}}}catch(e){url='';}
  if(url)BUFF_ICON[id]=url;return url;}
// tap a buff: its name, what it gives and the time left float over your hero
function buffInfo(id){if(!P)return;const b=P.buffs[id];
  const name=b?b.name:(id==='rested'?'Well rested':id),stats=b&&b.b?Object.entries(b.b).map(([k,v])=>`${k==='maxhp'?'Max HP':k==='maxsp'?'Max SP':k.toUpperCase()} +${v}`).join(', '):(id==='rested'?'+10% EXP':'');
  const left=b?fmtSecs(buffSecs(b)):(typeof restedLeft==='function'?fmtSecs(Math.ceil(restedLeft()/1000)):'');
  floatT(P.x,P.y-60,`${name}${stats?' · '+stats:''} · ${left}`,'#ffe7a0',13);sfx('click');}
document.addEventListener('click',ev=>{const t=ev.target.closest&&ev.target.closest('#buffs .buff[data-buff]');if(!t)return;ev.stopPropagation();buffInfo(t.dataset.buff);},true);
document.addEventListener('keydown',ev=>{const t=ev.target.closest&&ev.target.closest('#buffs .buff[data-buff]');if(t&&(ev.key==='Enter'||ev.key===' ')){ev.preventDefault();buffInfo(t.dataset.buff);}});
