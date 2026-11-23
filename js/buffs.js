"use strict";
/* ================= buff row: every active buff with its countdown (yours, from party members, Well rested) ================= */
const buffSecs=b=>Math.max(0,Math.ceil(b.until-now));
const fmtSecs=s=>s>=60?`${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`:`${s}s`;
function buffList(){const out=[];if(!P)return out;
  for(const id in P.buffs){const b=P.buffs[id];const s=buffSecs(b);if(s>0)out.push({id,name:b.name,s,from:b.from});}
  if(typeof isRested==='function'&&isRested())out.push({id:'rested',name:'Well rested',s:Math.ceil(restedLeft()/1000),rest:true});
  // (v1.53.2) stun, freeze, poison and the rest show here too, first in the row, with their own colour and countdown
  if(P.ail&&typeof AILS!=='undefined'){const ails=[];for(const k in AILS){const u=P.ail[k];if(u>now){const curse=!!(P.curse&&P.curse[k]>now);
    ails.push({id:'ail-'+k,ail:k,name:AILS[k].name,s:Math.max(1,Math.ceil(u-now)),curse});}}out.unshift(...ails);}
  return out;}
const buffTip=b=>b.ail?`${b.name}${b.curse?' · boss curse':''} · ${AILS[b.ail].desc} · ${fmtSecs(b.s)} left`
  :`${b.name}${b.from?` · from ${b.from}`:''} · ${fmtSecs(b.s)} left${b.rest?' · +10% EXP':''}`;
let buffSig='';
let buffShape='',buffT=0;
function renderBuffs(){const el=$('#buffs');if(!el)return;
  // checked a few times a second, not every frame; when only the seconds change, just the numbers are updated
  const t=performance.now();if(t-buffT<120)return;buffT=t;const list=buffList();
  const sig=list.map(b=>b.id+':'+b.s+':'+(b.from||'')+(b.curse?':c':'')).join('|');if(sig===buffSig)return;buffSig=sig;
  const shape=list.map(b=>b.id+':'+(b.from||'')+(b.curse?':c':'')).join('|');
  if(shape===buffShape&&el.children.length===list.length){list.forEach((b,i)=>{const sp=el.children[i],bt=sp&&sp.querySelector('b');if(!bt)return;const v=fmtSecs(b.s);if(bt.textContent!==v)bt.textContent=v;
    const end=b.s<=5;if(sp.classList.contains('ending')!==end)sp.classList.toggle('ending',end);
    const tip=buffTip(b);sp.title=tip;sp.setAttribute('aria-label',tip);});return;}
  buffShape=shape;
  const h0=el.hidden?0:el.offsetHeight;el.hidden=!list.length;
  if(!list.length)el.innerHTML='';
  else el.innerHTML=list.map(b=>{const tip=buffTip(b);
    if(b.ail){const a=AILS[b.ail];return `<span class="buff ail${b.curse?' curse':''}" data-buff="${esc(b.id)}" role="button" tabindex="0" title="${esc(tip)}" aria-label="${esc(tip)}" style="--ac:${a.col}"><span class="bg">${esc(a.g)}</span><b>${fmtSecs(b.s)}</b></span>`;}
    const sk=SKILLS[b.id],src=buffIcon(b.id),pic=src?`<img src="${src}" alt="">`:`<span class="bg">${b.rest?'☾':(sk?sk.g:'✦')}</span>`;
    return `<span class="buff${b.s<=5?' ending':''}${b.from?' given':''}" data-buff="${esc(b.id)}" role="button" tabindex="0" title="${esc(tip)}" aria-label="${esc(tip)}">${pic}<b>${fmtSecs(b.s)}</b></span>`;}).join('');
  // the party box sits right under the status box: move it when the row grows or shrinks
  if((el.hidden?0:el.offsetHeight)!==h0&&typeof renderParty==='function')renderParty();}

/* each buff shows where it came from: the skill's picture, or the potion / brew / festival food that gave it
   (with its stat badge), or, failing both, a badge drawn from the buff's own stats */
const BUFF_ICON={};
function buffIcon(id){if(id.startsWith('ail-'))return '';if(BUFF_ICON[id]!==undefined)return BUFF_ICON[id];let url='';
  try{if(SKILLS[id]&&typeof skillIconURL==='function')url=skillIconURL(id);
    else{const item=ITEMS[id]?id:Object.keys(ITEMS).find(k=>ITEMS[k].brew&&ITEMS[k].brew.id===id);
      if(item&&typeof itemIconURL==='function')url=itemIconURL(item);
      else if(typeof potBadge==='function'&&P&&P.buffs[id]){const k=potKind({brew:{b:P.buffs[id].b||{}}});
        if(k){const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d');g.scale(2.6,2.6);potBadge(g,k,12.3,12.3);url=c.toDataURL();}}}}catch(e){url='';}
  if(url)BUFF_ICON[id]=url;return url;}
// tap a buff: its name, what it gives and the time left float over your hero
function buffInfo(id){if(!P)return;
  if(id.startsWith('ail-')){const k=id.slice(4),a=AILS[k];if(!a)return;const curse=P.curse&&P.curse[k]>now;
    floatT(P.x,P.y-60,`${a.name}${curse?' (boss curse)':''} · ${a.desc} · ${fmtSecs(Math.max(0,Math.ceil((P.ail[k]||0)-now)))}`,a.col,13);sfx('click');return;}
  const b=P.buffs[id];
  const name=b?b.name:(id==='rested'?'Well rested':id),stats=b&&b.b?Object.entries(b.b).map(([k,v])=>`${k==='maxhp'?'Max HP':k==='maxsp'?'Max SP':k.toUpperCase()} +${v}`).join(', '):(id==='rested'?'+10% EXP':'');
  const left=b?fmtSecs(buffSecs(b)):(typeof restedLeft==='function'?fmtSecs(Math.ceil(restedLeft()/1000)):'');
  floatT(P.x,P.y-60,`${name}${stats?' · '+stats:''} · ${left}`,'#ffe7a0',13);sfx('click');}
document.addEventListener('click',ev=>{const t=ev.target.closest&&ev.target.closest('#buffs .buff[data-buff]');if(!t)return;ev.stopPropagation();buffInfo(t.dataset.buff);},true);
document.addEventListener('keydown',ev=>{const t=ev.target.closest&&ev.target.closest('#buffs .buff[data-buff]');if(t&&(ev.key==='Enter'||ev.key===' ')){ev.preventDefault();buffInfo(t.dataset.buff);}});

// a buff you just got shows on the next frame, not after the next check
if(typeof buff==='function'){const _buffNow=buff;buff=function(){const r=_buffNow.apply(this,arguments);buffT=0;return r;};}
// an ailment you just got shows at once too
if(typeof tryAilment==='function'){const _taB=tryAilment;tryAilment=function(){const r=_taB.apply(this,arguments);if(r)buffT=0;return r;};}
if(typeof bsCurse==='function'){const _bcB=bsCurse;bsCurse=function(){const r=_bcB.apply(this,arguments);buffT=0;return r;};}
