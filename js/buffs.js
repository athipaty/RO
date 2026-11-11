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
    const pic=sk&&typeof skillIconURL==='function'?`<img src="${skillIconURL(b.id)}" alt="">`:`<span class="bg">${b.rest?'☾':(sk?sk.g:'✦')}</span>`;
    return `<span class="buff${b.s<=5?' ending':''}${b.from?' given':''}" title="${esc(tip)}" aria-label="${esc(tip)}">${pic}<b>${fmtSecs(b.s)}</b></span>`;}).join('');
  // the party box sits right under the status box: move it when the row grows or shrinks
  if((el.hidden?0:el.offsetHeight)!==h0&&typeof renderParty==='function')renderParty();}
