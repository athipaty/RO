"use strict";
/* ================= HUD ================= */
let hudCache={};
function setT(id,v){if(hudCache[id]!==v){hudCache[id]=v;document.getElementById(id).textContent=v;}}
function setW(id,f){const v=(clamp(f,0,1)*100).toFixed(1)+'%';if(hudCache[id]!==v){hudCache[id]=v;document.getElementById(id).style.width=v;}}
function updateHud(){
  if(!P||!S)return;
  setT('hName',P.name);setT('hCls',CLASSES[P.cls].name+(P.sitting?' · resting':''));
  setW('hpI',P.hp/S.maxhp);setT('hpT',`${fmt(P.hp)} / ${fmt(S.maxhp)}`);
  setW('spI',P.sp/S.maxsp);setT('spT',`${fmt(P.sp)} / ${fmt(S.maxsp)}`);
  const en=expNeed(P.lv),jn=jexpNeed(P.jl),jm=P.jl>=jobMax(P.cls);
  setT('lvT',`Lv ${P.lv}`);{const bm=P.lv>=99;setT('exT',bm?'max':(P.exp/en*100).toFixed(1)+'%');setW('exI',bm?1:Math.min(1,P.exp/en));}
  setT('jlT',`Job ${P.jl}`);setT('jxT',jm?'max':(P.jexp/jn*100).toFixed(1)+'%');setW('jxI',jm?1:P.jexp/jn);
  setT('ailT',ailText());
  setT('weight',`Weight ${fmt(carryWeight())} / ${fmt(maxWeight())}`+(P.heavy===2?' · too heavy to fight':P.heavy?' · no regen':''));
  {const we=$('#weight'),hv=!!P.heavy;if(we.classList.contains('heavy')!==hv)we.classList.toggle('heavy',hv);}
  setT('gold',`${fmt(P.gold)} gold`+(P.statPts?` · ${P.statPts} stat pts`:'')+(P.skillPts?` · ${P.skillPts} skill pts`:'')+(isRested()?` · ${restedText()}`:''));
  const pc=partyCount();const pe=$('#party');if(pe.hidden!==!pc)pe.hidden=!pc;if(pc)setT('party',`Party: ${SOC.party.mode==='share'?'sharing EXP':'+25% EXP each'} · ${pc} member${pc>1?'s':''} here`);
  const qe=$('#quest');if(qe.hidden!==!P.quest)qe.hidden=!P.quest;if(P.quest)setT('quest',`Contract: ${MOBS[P.quest.mob].name} ${P.quest.have}/${P.quest.need}`);
  const t=P.target&&!P.target.dead?P.target:null;const te=$('#target');
  if(!!t===te.hidden)te.hidden=!t;
  if(t&&t.pvp){setT('tDrops',t.arena?'Arena: fall to 1 HP and you are out':t.gw?'Guild war: knock them back to the gate':'Duel: first to fall to 1 HP loses');setT('tName',t.d.name);setT('tLv',`Lv ${t.d.lv} · player`);setW('tI',t.hp/100);setT('tT',`${Math.round(t.hp)}%`);}
  else if(t){setT('tDrops','Drops: '+dropText(t.d));setT('tName',t.d.name);setT('tLv',`Lv ${t.d.lv} · ${ELEM[t.d.el||'neutral'].name}`+(typeof mobRace==='function'?` · ${SIZES[mobSize(t.d)].name} ${RACES[mobRace(t.d)].name}`:t.d.undead?' · undead':'')+(t.d.boss?' · boss':''));setW('tI',t.hp/t.d.hp);setT('tT',`${fmt(t.hp)} / ${fmt(t.d.hp)}`);}
  // hotbar cooldowns & counts
  for(const el of hotEls){const s=el._slot;let frac=0,off=false,n='';
    if(s.skill){const L=P.skills[s.skill]||0,l=L?castLv(s.skill):0;off=!l||P.sp<SKILLS[s.skill].sp(l||1);const r=(P.cd[s.skill]||0)-now;if(r>0)frac=r/SKILLS[s.skill].cd;n=l?(l<L?l+'/'+L:String(l)):'';}
    else{const e=invFind(s.item);n=e?String(e.n):'0';off=!e;const it=ITEMS[s.item];if(it&&it.type==='use'&&typeof potGroup==='function'){const g=potGroup(it),r=(P.cd[g]||0)-now;if(r>0)frac=Math.min(1,r/((P.cdLen&&P.cdLen[g])||potCd(it)));}}
    const key=frac.toFixed(2)+off+n;if(el._k!==key){el._k=key;el.querySelector('.cd').style.height=(frac*100)+'%';el.classList.toggle('off',off);el.querySelector('.n').textContent=n;}}
}
let hotEls=[];
function hotSlots(){const sk=hotSkills();
  return [...sk.map(s=>s?{skill:s}:null),{item:'red'},{item:'orange'},{item:'blue'},{item:'scroll'}];}
function rebuildHotbar(){
  if(!P)return;const hb=$('#hotbar');const slots=hotSlots();const sig=JSON.stringify(slots);if(hb._sig===sig)return;hb._sig=sig;
  hb.innerHTML='';hotEls=[];
  slots.forEach((s,i)=>{const b=document.createElement('button');b.className='slot';
    if(!s){b.classList.add('off');b.innerHTML=`<span class="k">${i+1}</span><span class="cd"></span><span class="n"></span>`;b.disabled=true;hb.appendChild(b);return;}
    const d=s.skill?SKILLS[s.skill]:ITEMS[s.item];
    b.title=(s.skill?d.name:d.name+' — '+d.desc)+` (${i+1})`;b.setAttribute('aria-label',b.title);
    b.innerHTML=(s.item&&typeof itemIconURL==='function'?`<img class="ic img" src="${itemIconURL(s.item)}" alt="">`:s.skill&&typeof skillIconURL==='function'?`<img class="ic img" src="${skillIconURL(s.skill)}" alt="">`:`<span class="ic" style="background:${d.col}">${d.g}</span>`)+`<span class="k">${i+1}</span><span class="cd"></span><span class="n"></span>`;
    b._slot=s;b.addEventListener('click',()=>pressSlot(i));if(s.skill)b.addEventListener('contextmenu',ev=>{ev.preventDefault();lowerSlot(i);});hb.appendChild(b);hotEls.push(b);});
}
function lowerSlot(i){const s=hotSlots()[i];if(!s||!s.skill)return;if(!P.skills[s.skill]){addLog(`Learn ${SKILLS[s.skill].name} in the Skills window (K).`);return;}if(P.skills[s.skill]<2){floatT(P.x,P.y-44,`${SKILLS[s.skill].name} has only level 1`,'#aab4c4',12);return;}setCastLv(s.skill,castLv(s.skill)-1);}
function pressSlot(i){const s=hotSlots()[i];if(!s)return;if(s.skill){if(!P.skills[s.skill]){addLog(`Learn ${SKILLS[s.skill].name} in the Skills window (K).`);return;}useSkill(s.skill);}else useItem(s.item);}

/* ================= panels ================= */
const panel=$('#panel');let panelKind=null,panelArg=null,shopTab='buy';
const itemCat=id=>{const t=ITEMS[id].type;return t==='use'?'use':t==='sigil'?'sigil':t==='etc'?'etc':'equip';};
const CAT_TABS=[['use','Use'],['equip','Equip'],['sigil','Sigils'],['etc','Etc']];
let shopCat='use';
// the store's live weight: carried / max, a thin bar, orange near the limit, red when too heavy
function shopWeightHtml(){const w=carryWeight(),m=maxWeight(),f=m?w/m:0,cls=f>=.9?'bad':f>=.7?'warn':'';
  const lbl=(typeof LANG!=='undefined'&&LANG==='th'?'น้ำหนัก':'Weight')+` ${fmt(w)} / ${fmt(m)}`;
  return `<span class="shopwt ${cls}" title="${lbl}"><span>${lbl}</span><i style="--f:${Math.min(100,f*100).toFixed(0)}%"></i></span>`;}
// General Store, Equip tab: sub-tabs by gear type, like the forge (remembered)
let shopGear=(()=>{try{return localStorage.getItem('embervale.shopGear')||'all';}catch(e){return 'all';}})();
const GEAR_TABS=[['weapon','Weapon'],['armor','Armour'],['head','Head'],['accessory','Accessory'],['face','Face'],['mouth','Mouth']];
// gear-type chips + rows grouped into sections ("All") or one type; rowOf(x) draws a row, okOf(x) lights the tab's dot
function gearTabsHtml(list,typeOf,rowOf,okOf){
  const types=GEAR_TABS.filter(([k])=>list.some(x=>typeOf(x)===k));if(shopGear!=='all'&&!types.some(([k])=>k===shopGear))shopGear='all';
  let h=`<div class="ftabs" role="tablist" aria-label="Gear type">`+[['all','All'],...types].map(([k,l])=>{const part=list.filter(x=>k==='all'||typeOf(x)===k),on=shopGear===k;
    return `<button class="cxchip${on?' on':''}" role="tab" aria-selected="${on}" data-act="shopgear" data-arg="${k}">${l} <span>${part.length}</span>${okOf&&part.some(okOf)?'<i class="fdot" title="Something here you can buy and wear now"></i>':''}</button>`;}).join('')+`</div>`;
  if(shopGear==='all')for(const [k,l] of types){const part=list.filter(x=>typeOf(x)===k);h+=`<h3 class="fsec">${l} <span class="muted">${part.length}</span></h3>`+part.map(rowOf).join('');}
  else h+=list.filter(x=>typeOf(x)===shopGear).map(rowOf).join('');
  return h;}
let invTab=(()=>{try{return localStorage.getItem('embervale.invTab')||'use';}catch(e){return 'use';}})();
// other files (trade.js) register extra windows here: render, button actions, and what to do on close
const PANELS={},PANEL_ACTS={},PANEL_CLOSE={};
PANEL_ACTS.openach=()=>openPanel('ach');
PANEL_ACTS.shopcat=k=>{shopCat=k;refreshPanel();};
PANEL_ACTS.shopgear=k=>{shopGear=k;try{localStorage.setItem('embervale.shopGear',k);}catch(e){}sfx('click');refreshPanel();};
PANEL_ACTS.invtab=k=>{invTab=k;try{localStorage.setItem('embervale.invTab',k);}catch(e){}refreshPanel();};
const NPC_PANELS=['talk','shop','smith','storage','job','heal','warp'];
const npcBusy=()=>!!P&&NPC_PANELS.includes(panelKind)&&!panel.hidden;
let busyHintT=0;function busyHint(){if(now<busyHintT)return;busyHintT=now+3;floatT(P.x,P.y-50,'Close the window to walk','#ffe7a0',12);}
function openPanel(kind,arg){if(kind==='storage'&&panelKind!=='storage')storageRefresh();panelKind=kind;panelArg=arg;panel.hidden=false;if(NPC_PANELS.includes(kind)&&P){P.path=[];P.moving=false;P.target=null;P.queued=null;}refreshPanel();}
function closePanel(){const k=panelKind;panelKind=null;panel.hidden=true;if(PANEL_CLOSE[k])PANEL_CLOSE[k]();}
function togglePanel(kind){if(panelKind===kind)closePanel();else openPanel(kind);}
function icon(it){return `<span class="ico" style="background:${it.col}">${it.g}</span>`;}
// the sigil slots of a piece of gear as pictures: a socketed sigil opens its item card when tapped, an empty slot is a dashed box
function sigStripHtml(e){if(!e||!Array.isArray(e.s)||!e.s.length)return '';
  return `<div class="sigstrip" aria-label="Sigil slots">`+e.s.map(s=>s&&ITEMS[s]?`<span class="sigslot full" data-item="${s}" tabindex="0" title="${esc(ITEMS[s].name)}" aria-label="${esc(ITEMS[s].name)}"><img src="${typeof itemIconURL==='function'?itemIconURL(s):''}" alt=""></span>`:
    `<span class="sigslot" title="Empty slot" aria-label="Empty slot"></span>`).join('')+`</div>`;}
function itemDesc(e,noSlots){const it=ITEMS[e.id];const bits=[];
  if(it.atk)bits.push(`ATK ${it.atk}`);if(it.matk)bits.push(`MATK ${it.matk}`);if(it.def)bits.push(`DEF ${it.def}`);
  if(it.b)for(const k in it.b)bits.push(typeof bonusLabel==='function'&&bonusLabel(k,it.b[k])||`${k.toUpperCase().replace('MAXHP','Max HP').replace('MAXSP','Max SP')} +${it.b[k]}`);
  if(rarityOf(e.id))bits.push(RARITY[rarityOf(e.id)].name);if(e.r){const rb=refineBonus(e);bits.push(Object.keys(rb).map(k=>`${k.toUpperCase()} +${rb[k]}`).join(', ')+' (refine)');}
  if(it.lv>1)bits.push(`Lv ${it.lv}+`);if(it.wt)bits.push(it.wt);
  if(e.s&&e.s.length&&!noSlots)bits.push('Slots: '+e.s.map(s=>s?ITEMS[s].name.replace(' Sigil',''):'empty').join(', '));
  if(it.desc&&it.type==='use'&&(it.heal||it.sp||it.cure)&&typeof potCd==='function')return it.desc+` Cooldown ${potCd(it)}s.`;
  return it.desc||bits.join(' · ');}
function refreshPanel(){
  if(!panelKind||!P)return;let h=`<button class="btn small x" data-act="close" aria-label="Close">✕</button>`;
  const c=CLASSES[P.cls];
  if(panelKind==='status'){S=computeStats();
    h+=`<h2>${esc(P.name)}</h2><div class="sub">${c.name} · Base Lv ${P.lv} · Job Lv ${P.jl}</div>`;
    h+=`<div class="sub">Stat points: <span class="gold">${P.statPts}</span>${typeof ACH!=='undefined'?` · <button class="btn small" data-act="openach">★ Achievements &amp; titles</button>`:''}</div>`;
    for(const k of STATS){const v=P.st[k],bonus=S[k]-v,cost=statCost(v);
      h+=`<div class="st"><b>${k.toUpperCase()}</b><span class="muted" style="font-size:12px">${STAT_DESC[k]}</span><span>${v}${bonus?`<span class="gold"> +${bonus}</span>`:''}</span><button class="btn small" data-act="stat" data-arg="${k}" ${P.statPts<cost||v>=99?'disabled':''} title="Costs ${cost} points">+${cost>2?' ('+cost+')':''}</button></div>`;}
    h+=`<h3>Combat</h3><div class="dv"><div><span>ATK</span><span>${S.atk}</span></div><div><span>Attacks/sec</span><span>${(1/S.delay).toFixed(2)}</span></div><div><span>Weight</span><span>${fmt(carryWeight())}/${fmt(maxWeight())}</span></div><div><span>MATK</span><span>${S.matk}</span></div><div><span>DEF</span><span>${S.def}</span></div><div><span>HIT</span><span>${S.hit}</span></div><div><span>FLEE</span><span>${S.flee}</span></div><div><span>CRIT</span><span>${S.crit}%</span></div><div><span>Attacks/s</span><span>${(1/S.delay).toFixed(2)}</span></div><div><span>Range</span><span>${S.range}px</span></div>`+(S.critdmg?`<div><span>Crit damage</span><span>${150+S.critdmg}%</span></div>`:'')+(S.cast?`<div><span>Cast time</span><span>−${S.cast}%</span></div>`:'')+(S.dbl?`<div><span>Double attack</span><span>${S.dbl}%</span></div>`:'')+(S.dmgred?`<div><span>Damage taken</span><span>−${S.dmgred}%</span></div>`:'')+(S.heal?`<div><span>Healing</span><span>+${S.heal}%</span></div>`:'')+(typeof WSIZE==='function'||typeof WSIZE==='object'?`<div><span>Vs size S/M/L</span><span>${WSIZE[weaponType()].join(' / ')}%</span></div>`:'')+`</div>`;
    h+=`<h3>Equipment</h3>`;
    for(const slot of ['head','face','mouth','weapon','armor','accessory']){const e=P.eq[slot];
      h+=`<div class="row">${e?icon(ITEMS[e.id]):'<span class="ico" style="background:#2a3240"></span>'}<div class="grow"><div class="nm">${e?ITEMS[e.id].name:'<span class="muted">No '+slot+'</span>'}</div><div class="ds">${e?itemDesc(e):''}</div></div>${e?`<button class="btn small" data-act="unequip" data-arg="${slot}">Remove</button>`:''}</div>`;}
  }
  else if(panelKind==='items'){
    h+=`<h2>Items</h2><div class="sub">${fmt(P.gold)} gold · click an item to use, equip or socket it</div><div class="tbtns" style="justify-content:flex-start;margin:0 0 6px"><button class="btn small" data-act="vendsetup">Open a shop</button></div>`;
    const cat=e=>itemCat(e.id);
    const cnt={use:0,equip:0,sigil:0,etc:0};for(const e of P.inv)cnt[cat(e)]++;
    h+=`<div class="tabs itabs" role="tablist">`+[['use','Use'],['equip','Equip'],['sigil','Sigils'],['etc','Etc']].map(([k,l])=>`<button class="btn small ${invTab===k?'on':''}" role="tab" aria-selected="${invTab===k}" data-act="invtab" data-arg="${k}">${l} <span class="muted">${cnt[k]}</span></button>`).join('')+`</div>`;
    if(!P.inv.length)h+=`<p class="muted">Your bag is empty.</p>`;
    else if(!cnt[invTab])h+=`<p class="muted">${{use:'No potions or scrolls. Ilsa sells them at the General Store.',equip:'No spare gear. What you wear is in the Equip window.',sigil:'No sigils yet. Every monster has a small chance to drop its sigil; socket it into gear with a free slot.',etc:'No monster loot yet.'}[invTab]}</p>`;
    P.inv.forEach((e,i)=>{const it=ITEMS[e.id];if(cat(e)!==invTab)return;const verb=it.type==='use'?'Use':it.type==='sigil'?'Socket':it.type==='etc'?'':'Equip';
      h+=`<div class="row">${icon(it)}<div class="grow"><div class="nm" style="color:${rarityCol(e.id)}">${itemName(e)}${e.n!==undefined?` <span class="muted">×${e.n}</span>`:''}</div><div class="ds">${itemDesc(e,e.s&&e.s.length)}</div>${sigStripHtml(e)}</div>${verb?`<button class="btn small" data-act="use" data-arg="${i}">${verb}</button>`:''}</div>`;});
  }
  else if(panelKind==='skills'){
    h+=skillTreeHtml();
  }
  else if(panelKind==='smith'){
    h+=`<h2>Brannoc the Smith</h2><div class="say">"Bring me ore and gold and I'll make that blade sing. Up to +4 never fails. Past that, a bad strike shatters the piece for good."</div>`;
    h+=`<h3>Materials</h3>`;
    for(const id of ['emberore','glintstone']){const it=ITEMS[id],have=(invFind(id)||{}).n||0;
      h+=`<div class="row">${icon(it)}<div class="grow"><div class="nm">${it.name} <span class="muted">×${have}</span></div><div class="ds">${it.desc}</div></div><span class="gold">${it.price}</span><button class="btn small" data-act="buy" data-arg="${id}" ${P.gold<it.price?'disabled':''}>Buy</button></div>`;}
    if(typeof FORGES!=='undefined')h+=`<div class="tbtns" style="justify-content:flex-start;margin:6px 0"><button class="btn small" data-act="openforge">⚒ Forge gear from monster materials</button></div>`;
    h+=`<h3>Refine</h3><div class="sub">${fmt(P.gold)} gold</div>`;
    const gear=[...['weapon','armor','head','accessory'].filter(s=>P.eq[s]).map(s=>({e:P.eq[s],key:'eq:'+s,where:'equipped'})),
      ...P.inv.filter(e=>e.uid&&['weapon','armor','head','accessory'].includes(ITEMS[e.id].type)).map(e=>({e,key:'inv:'+e.uid,where:'in bag'}))];
    if(!gear.length)h+=`<p class="muted">You have no gear to refine.</p>`;
    for(const {e,key,where} of gear){const r=e.r||0,next=r+1,mat=refineMat(e.id),has=!!invFind(mat),fee=refineFee(next);
      const armed=refineArm===key,risk=REFINE_CHANCE[next]<1;
      h+=`<div class="row">${icon(ITEMS[e.id])}<div class="grow"><div class="nm" style="color:${rarityCol(e.id)}">${itemName(e)} <span class="muted">${where}</span></div>`+
        (r>=10?`<div class="ds">Fully refined.</div></div>`:
        `<div class="ds">To +${next}: ${Math.round(REFINE_CHANCE[next]*100)}%${risk?' · <span style="color:var(--warn)">breaks on failure</span>':''}</div><div class="cms">${itemChip(mat,1)}${goldChip(fee)}</div></div>`+
        `<button class="btn small" data-act="refine" data-arg="${key}" ${!has||P.gold<fee?'disabled':''}>${armed?'Sure?':'Refine'}</button>`)+`</div>`;}
  }
  else if(panelKind==='storage'){
    h+=`<h2>Wenna the Keeper</h2><div class="say">"Leave it with me, love. It'll be right here when you come back."</div>`;
    h+=`<div class="sub">Storage ${P.storage.length}/${STORAGE_MAX} · Weight ${fmt(carryWeight())}/${fmt(maxWeight())}</div>`;
    if(CS.shared)h+=`<p class="muted">${CS.busy||CS.oldSt?'Saving…':'Shared by all your characters.'}</p>`;
    h+=`<h3>Your bag</h3>`;if(!P.inv.length)h+=`<p class="muted">Empty.</p>`;
    P.inv.forEach((e,i)=>{h+=`<div class="row">${icon(ITEMS[e.id])}<div class="grow"><div class="nm" style="color:${rarityCol(e.id)}">${itemName(e)}${e.n!==undefined?` <span class="muted">×${e.n}</span>`:''}</div></div><button class="btn small" data-act="store" data-arg="${i}">Store</button></div>`;});
    h+=`<h3>In storage</h3>`;if(!P.storage.length)h+=`<p class="muted">Nothing stored yet.</p>`;
    P.storage.forEach((e,i)=>{h+=`<div class="row">${icon(ITEMS[e.id])}<div class="grow"><div class="nm" style="color:${rarityCol(e.id)}">${itemName(e)}${e.n!==undefined?` <span class="muted">×${e.n}</span>`:''}</div></div><button class="btn small" data-act="take" data-arg="${i}">Take</button></div>`;});
  }
  else if(panelKind==='equip'){S=computeStats();
    const slotBox=s=>{const e=P.eq[s];return `<div class="eqslot">${e?icon(ITEMS[e.id]):'<span class="ico" style="background:#2a3240"></span>'}<div class="grow"><div class="eqk">${s}</div>`+
      (e?`<div class="nm" style="color:${rarityCol(e.id)}">${itemName(e)}</div><div class="ds">${itemDesc(e,1)}</div>${sigStripHtml(e)}</div><button class="btn small" data-act="unequip" data-arg="${s}">Remove</button>`:`<div class="muted">Empty</div></div>`)+`</div>`;};
    h+=`<h2>Equipment</h2><div class="sub">Refine gear with Brannoc the Smith in Hearthvale.</div>`;
    h+=`<div class="eqgrid"><div class="eqcol">${slotBox('head')}${slotBox('face')}${slotBox('mouth')}</div><canvas id="eqCv" width="240" height="300" aria-label="Your character"></canvas><div class="eqcol">${slotBox('weapon')}${slotBox('armor')}${slotBox('accessory')}</div></div>`;
    h+=`<div class="dv"><div><span>ATK</span><span>${S.atk}</span></div><div><span>MATK</span><span>${S.matk}</span></div><div><span>DEF</span><span>${S.def}</span></div><div><span>HIT</span><span>${S.hit}</span></div>`+
      `<div><span>FLEE</span><span>${S.flee}</span></div><div><span>CRIT</span><span>${S.crit}</span></div><div><span>Attacks/sec</span><span>${(1/S.delay).toFixed(2)}</span></div><div><span>Weight</span><span>${fmt(carryWeight())}/${fmt(maxWeight())}</span></div></div>`;
  }
  else if(panelKind==='mob'){const d=MOBS[panelArg];if(!d){closePanel();return;}S=computeStats();
    const pc=c=>{const v=c*100;return(v>=10||v===Math.round(v)?Math.round(v):v.toFixed(1))+'%';};
    const where=Object.values(ZONES).filter(z=>z.mobs&&z.mobs.some(([t])=>t===d.id)).map(z=>z.name).join(', ');
    h+=`<h2>${esc(d.name)}</h2><div class="sub">Lv ${d.lv}${d.boss?' · boss':''}${d.undead?' · undead':''} · ${d.aggro?'attacks on sight':'passive until hit'}${d.range?' · ranged':''}</div>`;
    h+=`<div class="dv"><div><span>HP</span><span>${fmt(d.hp)}</span></div><div><span>ATK</span><span>${d.atk}</span></div><div><span>DEF</span><span>${d.def}</span></div><div><span>FLEE</span><span>${d.flee}</span></div>`+
      `<div><span>Base EXP</span><span>${fmt(d.exp)}</span></div><div><span>Job EXP</span><span>${fmt(d.jexp)}</span></div>`+
      `<div><span>Your hit chance</span><span>${clamp(80+S.hit-d.flee,5,100)}%</span></div><div><span>You dodge</span><span>${100-clamp(85+d.hit-S.flee,5,95)}%</span></div></div>`;
    h+=`<h3>Drops</h3>`+d.drops.map(([id,c])=>`<div class="row">${icon(ITEMS[id])}<div class="grow"><div class="nm">${ITEMS[id].name}</div></div><span>${pc(c)}</span></div>`).join('')+
      `<div class="row">${icon(ITEMS[d.id+'_sig'])}<div class="grow"><div class="nm">${d.name} Sigil</div><div class="ds">${d.sig.kind}: ${d.sig.txt}</div></div><span>${pc(d.sigChance||SIG_CHANCE)}</span></div>`;
    h+=`<h3>Element</h3><div class="sub"><span style="color:${ELEM[d.el||'neutral'].col}">${ELEM[d.el||'neutral'].name}</span>`+(weakTo(d.el).length?` · weak to ${weakTo(d.el).map(e=>ELEM[e].name).join(', ')}`:'')+`</div>`+(d.ail?`<h3>Inflicts</h3><div class="sub">${AILS[d.ail[0]].name} (${Math.round(d.ail[1]*100)}% per hit, ${d.ail[2]}s): ${AILS[d.ail[0]].desc.toLowerCase()}</div>`:'');
    if(typeof mobRace==='function'){const r=mobRace(d),z=mobSize(d),rb=raceBonus(r);h+=`<h3>Size and race</h3><div class="sub">${SIZES[z].name} · <span style="color:${RACES[r].col}">${RACES[r].name}</span> · your ${weaponType()==='none'?'bare hands':weaponType()} deal ${sizePct(d)}% to ${SIZES[z].name.toLowerCase()} monsters${rb?` · your gear adds +${rb}% vs ${RACES[r].name}`:''}</div>`;}
    h+=`<h3>Found in</h3><div class="sub">${where||'Unknown'}</div>`;}
  else if(panelKind==='help'){
    h+=`<h2>How to play</h2><p class="say">Embervale is a click-to-move action RPG. Hunt monsters for experience, gold, loot and rare sigils.</p>
    <div class="ds" style="line-height:1.7"><b>Moving and fighting:</b> click the ground to walk, click a monster to attack it until it falls. WASD and the arrow keys also move you. Tab targets the nearest monster.<br>
    <b>Levels:</b> base levels give stat points (C). Job levels give skill points (K). At Job Lv 10, talk to Guildmaster Corvin to become a Warden, Arcanist, Ranger or Cleric.<br>
    <b>Sigils:</b> every monster has a small chance to drop its sigil. Socket it into equipment with a free slot to gain its bonus for good.<br>
    <b>Resting:</b> press X to sit and recover HP and SP faster.<br>
    <b>Day and night:</b> a day in Embervale lasts 24 minutes and nights are dark. Regions have their own weather: rain, fog, sandstorms, snow. /time tells you the time. Weather effects can be turned off below.<br>
    <b>Following:</b> press Follow next to a party member in the party box (or /follow Name) to walk behind them, through gates too. Click the ground, move or attack to stop.<br>
    <b>Duels:</b> challenge someone in the same region with the Duel button in the online list or /duel Name. After a 3-second countdown, click them to fight. The first to fall to 1 HP loses; nobody dies or loses EXP.<br>
    <b>Monster box:</b> the box at the top shows your target's name and HP; + shows its level, element, drops and an Info button.<br>
    <b>Status box:</b> the − button in its corner (or B) shrinks it to just your name, HP and SP; + brings it back.<br>
    <b>Regions:</b> Greenmoss Meadow (Lv 1–10) → Whispering Woods (10–20) → Ashen Dunes (20–32) → Cinder Crypt (32–45), home of the Ashen Warlord → Frostpeak Pass (42+).<br>
    <b>Dungeon:</b> stairs in a clearing in Whispering Woods lead down into the Mossdeep Caverns: three dark floors (Lv 18–37) that get harder as you go deeper, with the Gloomcap King at the bottom.<br>
    <b>Quests:</b> people with a gold <b>!</b> over their head have a quest for you, and a <b>?</b> means you can hand one in. Start the story with Elder Hollis by the fountain. Press J for your quest log.<br>
    <b>Second jobs:</b> at Job Lv 40, Corvin can test you for an advanced calling.<br>
    <b>Party support:</b> healing and buff skills marked “party” in the skill tree also land on party members standing near you.<br>
    <b>Guilds:</b> with an account you can found a guild (G) for 10,000 gold, pick its emblem, invite players from the online list, and chat with /g. Leaders can name officers, who can invite and post the guild notice.<br>
    <b>World bosses:</b> every so often a huge boss appears somewhere and everyone online is told where. Whoever deals the most damage is the MVP and wins a rare hat. Bring friends.<br>
    <b>Hunting contracts:</b> Guildmaster Corvin offers hunts that suit your level for bonus EXP and gold.<br>
    <b>Hats:</b> rare headgear drops from some monsters (and the Straw Hat and Ribbon Bow from the store). Everyone online sees what you wear.<br>
    <b>Auto-hunt:</b> the Auto button fights the nearest monster for you and drinks tonics when HP runs low. It's handy on a phone.<br>
    <b>Saving:</b> your progress saves automatically in this browser.</div>
    <h3>Elements</h3><div class="sub">Fire beats Earth, Earth beats Wind, Wind beats Water, Water beats Fire (×1.5); the same element resists itself. Holy and Shadow deal double to each other. Monster info (right-click) shows each monster's element.</div><h3>Size and race</h3><div class="sub">Monsters are Small, Medium or Large. Axes hit Large ones hardest, bows and swords lose some bite on them, maces suit Medium ones (physical damage only). Each monster also has a race (Beast, Insect, Plant, Spirit, Undead, Fiend, Construct); charms forged at the smithy add damage against one.</div><h3>Ailments</h3><div class="sub">Poison, stun, sleep, freeze, silence and blind. VIT resists poison, stun and freeze; INT resists sleep, silence and blind. Remedy Draught (General Store) and Mend cure them.</div><h3>Name colours</h3><div class="sub">Blue: players · green: your party · grey: guests · white: calm monsters · red: monsters that attack on sight · gold: bosses</div><h3>Chat commands</h3><div class="sub">/help · /where · /who · /sit · /stand · /exp · /roll · /emotes · /clear<br>/w Name text · /r text · /invite Name · /p text · /leave · /kick Name · /friend Name · /friends</div><h3>Keys</h3><div class="dv"><div><span>Right-click monster</span><span>monster info</span></div><div><span>F1–F8</span><span>hotbar (row 3 when shown)</span></div><div><span>Alt+1–8</span><span>hotbar row 2 (⊞ adds rows)</span></div><div><span>Insert</span><span>sit / stand</span></div><div><span>Alt+E</span><span>items</span></div><div><span>Alt+S</span><span>skills</span></div><div><span>Alt+A</span><span>stats</span></div><div><span>Alt+L</span><span>emotes</span></div><div><span>Alt+V</span><span>hide status box</span></div><div><span>F12</span><span>hide hotbar</span></div><div><span>Click item</span><span>pick it up</span></div><div><span>Enter</span><span>chat</span></div><div><span>E</span><span>emotes</span></div><div><span>1–4</span><span>skills</span></div><div><span>5–8</span><span>tonics, scroll</span></div><div><span>C / I / K</span><span>windows</span></div><div><span>X</span><span>sit</span></div><div><span>Tab</span><span>target</span></div><div><span>Shift+click</span><span>attack in place</span></div><div><span>Drag a title</span><span>move a window</span></div><div><span>M</span><span>world map</span></div><div><span>Click minimap</span><span>bigger / smaller</span></div><div><span>Esc</span><span>close</span></div></div>
    <h3>Sound</h3><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn small" data-act="music">Music: ${AU.music?'on':'off'}</button><button class="btn small" data-act="sfxt">Sound effects: ${AU.sfx?'on':'off'}</button>${typeof skyOn!=='undefined'?`<button class="btn small" data-act="weathert">Weather effects: ${skyOn?'on':'off'}</button>`:''}</div>
    <h3>Playing together</h3><p class="ds">Everyone who has this page open at the same time shares the world. You can see each other walking around, chat with Enter or the Chat button, and send emotes (E). Hunting near another player gives you both a party bonus of +25% EXP. The log announces big moments like level milestones, rare sigils and boss kills to everyone. ${NET.room?`<span class="gold">You are connected.</span>`:'Chat is offline in this view, so you are playing solo.'}</p>
    <h3>Adventure</h3><button class="btn" data-act="newgame">Start a new adventure</button>`;
  }
  else if(panelKind==='shop'){
    h+=`<h2>General Store</h2><div class="say">“Tonics, steel and sturdy cloth. And I'll buy whatever you dragged out of the wilds.” — Ilsa</div>`;
    h+=`<div class="tabs"><button class="btn small ${shopTab==='buy'?'on':''}" data-act="tab" data-arg="buy">Buy</button><button class="btn small ${shopTab==='sell'?'on':''}" data-act="tab" data-arg="sell">Sell</button><span class="shopstat" style="margin-left:auto"><span class="gold">${fmt(P.gold)} gold</span>${shopWeightHtml()}</span></div>`;
    // type tabs under Buy / Sell: Use, Equip, Sigils, Etc (only the ones that have something)
    {const ids=shopTab==='buy'?SHOP:P.inv.map(e=>e.id);const cnt={};for(const id of ids){const c=itemCat(id);cnt[c]=(cnt[c]||0)+1;}
      const tabs=CAT_TABS.filter(([k])=>cnt[k]);if(tabs.length&&!cnt[shopCat])shopCat=tabs[0][0];
      if(tabs.length>1)h+=`<div class="tabs itabs" role="tablist">`+tabs.map(([k,l])=>`<button class="btn small ${shopCat===k?'on':''}" role="tab" aria-selected="${shopCat===k}" data-act="shopcat" data-arg="${k}">${l} <span class="muted">${cnt[k]}</span></button>`).join('')+`</div>`;}
    if(shopTab==='buy'){const buyRow=id=>{const it=ITEMS[id];const why=it.type==='use'?null:canEquip(it);
      return `<div class="row">${icon(it)}<div class="grow"><div class="nm">${it.name}</div><div class="ds">${itemDesc({id,s:it.slots?Array(it.slots).fill(null):[]})}${why&&it.type!=='use'?` · <span style="color:#ef7a6f">${why.replace('Requires ','')}</span>`:''}</div></div><span class="gold" style="font-variant-numeric:tabular-nums">${fmt(it.price)}</span><button class="btn small" data-act="buy" data-arg="${id}" ${P.gold<it.price?'disabled':''}>Buy</button></div>`;};
      const ids=SHOP.filter(id=>itemCat(id)===shopCat);
      if(shopCat==='equip')h+=gearTabsHtml(ids,id=>ITEMS[id].type,buyRow,id=>P.gold>=ITEMS[id].price&&!canEquip(ITEMS[id]));
      else h+=ids.map(buyRow).join('');}
    else{const etc=P.inv.filter(e=>ITEMS[e.id].type==='etc'&&!ITEMS[e.id].keep);const tot=etc.reduce((a,e)=>a+sellValue(e.id)*e.n,0);
      if(shopCat==='etc')h+=`<div class="row"><div class="grow">Sell all monster loot</div><span class="gold">${fmt(tot)}</span><button class="btn small" data-act="sellall" ${tot?'':'disabled'}>Sell all</button></div>`;
      if(!P.inv.length)h+=`<p class="muted">Nothing to sell.</p>`;
      const sellRow=([e,i])=>{const it=ITEMS[e.id];return `<div class="row">${icon(it)}<div class="grow"><div class="nm" style="color:${rarityCol(e.id)}">${itemName(e)}${e.n!==undefined?` <span class="muted">×${e.n}</span>`:''}</div></div><span class="gold">${fmt((typeof sellValueOf==='function'?sellValueOf(e):sellValue(e.id)))}</span><button class="btn small" data-act="sell" data-arg="${i}">Sell 1</button>${e.n>1?`<button class="btn small" data-act="sellstack" data-arg="${i}" title="Sell all ${e.n} for ${fmt((typeof sellValueOf==='function'?sellValueOf(e):sellValue(e.id))*e.n)} gold">Sell all</button>`:''}</div>`;};
      const mine=P.inv.map((e,i)=>[e,i]).filter(([e])=>itemCat(e.id)===shopCat);
      if(shopCat==='equip')h+=gearTabsHtml(mine,([e])=>ITEMS[e.id].type,sellRow,null);else h+=mine.map(sellRow).join('');}
  }
  else if(panelKind==='job'){
    h+=`<h2>Guild Hall</h2>`;
    if(P.cls!=='novice')h+=jobHallHtml(c);
    else if(P.jl<10)h+=`<div class="say">“Every calling starts in the meadow. Reach Job Level 10 and come see me. You're at ${P.jl} now.” — Corvin</div>`;
    else{h+=`<div class="say">“You've earned it. Choose your calling. The choice is for life, so choose with care.” — Corvin</div><div class="choice">`;
      for(const id of ['warden','arcanist','ranger','cleric']){const k=CLASSES[id];h+=`<button data-act="job" data-arg="${id}"><b style="color:${k.col}">${k.name}</b><small>${k.desc}</small><small>Starts with: ${ITEMS[k.gift].name}</small></button>`;}
      h+=`</div>`;}
    h+=respecHtml();
    h+=`<h3>Hunting contracts</h3>`;
    const mobZone=id=>(Object.values(ZONES).find(z=>(z.mobs||[]).some(x=>x[0]===id))||{}).name||'';
    if(P.quest){const q=P.quest,m=MOBS[q.mob];h+=`<div class="row">${mobChip(q.mob,q.need,q.have)}<div class="grow"><div class="nm">Defeat ${q.need} ${m.name}</div><div class="ds">Progress ${q.have}/${q.need}</div><div class="ds">Reward ${fmt(q.exp)} EXP, ${fmt(q.gold)} gold</div><div class="ds muted">${mobZone(q.mob)}</div></div><button class="btn small" data-act="qdrop">Abandon</button></div>`;}
    else{h+=`<div class="ds" style="margin-bottom:4px">Take one contract at a time. It completes automatically wherever you are.</div>`;
      for(const o of contractOffers()){const m=MOBS[o.mob];h+=`<div class="row">${mobChip(o.mob,o.need,null)}<div class="grow"><div class="nm">Defeat ${o.need} ${m.name} <span class="muted">Lv ${m.lv}</span></div><div class="ds">Reward ${fmt(o.exp)} EXP, ${fmt(o.jexp)} job EXP, ${fmt(o.gold)} gold</div><div class="ds muted">${mobZone(o.mob)}</div></div><button class="btn small" data-act="qtake" data-arg="${o.mob}">Accept</button></div>`;}}
  }
  else if(panelKind==='emote'){
    h+=`<h2>Emotes</h2><div class="sub">Everyone nearby sees it over your head. You can also type /heart, /gg and so on in chat.</div><div class="emgrid">`;
    for(const [k,l] of EMOTES)h+=`<button class="emb" data-act="emote" data-arg="${k}"><img alt="" src="${emoteThumb(k)}"><span>${l}</span></button>`;
    h+=`</div>`;
  }
  else if(panelKind==='heal'){
    h+=`<h2>Chapel</h2><div class="say">“Rest a moment, traveller. The light asks nothing of you.” — Sister Maren</div><button class="btn" data-act="heal">Receive a blessing (full HP and SP)</button>`;
  }
  else if(panelKind==='warp'){
    h+=`<h2>Waystation</h2><div class="say">“I can send you to any road you've already walked. The fare depends on how far you go. And if your feet are sore, the bunks upstairs are clean.” — Tobin</div>`;
    ZONE_ORDER.slice(1).forEach((id,i)=>{const D=ZONES[id];const ok=P.visited.includes(id);const cost=(i+1)*60;
      h+=`<div class="row"><div class="grow"><div class="nm">${D.name}</div><div class="ds">${D.lvl}${ok?'':' · not visited yet'}${NET.wb&&NET.wb.z===id?` · <span style="color:#ff9a7a">World boss: ${MOBS[NET.wb.b].name}</span>`:''}</div></div><span class="gold">${cost}</span><button class="btn small" data-act="warp" data-arg="${id}" ${ok&&P.gold>=cost?'':'disabled'}>Travel</button></div>`;});
    h+=innHtml();
  }
  if(PANELS[panelKind])h+=PANELS[panelKind]();
  panel.innerHTML=h;
  if(panelKind==='equip')drawEquipDoll();
}
const emThumbs={};function emoteThumb(k){if(!emThumbs[k]){const c=document.createElement('canvas');c.width=c.height=64;drawEmoteIcon(c.getContext('2d'),k,32,32,52);emThumbs[k]=c.toDataURL();}return emThumbs[k];}
const STORAGE_MAX=120;let refineArm=null;
function findGear(key){const[w,v]=key.split(':');if(w==='eq')return P.eq[v]?{e:P.eq[v],slot:v}:null;const i=P.inv.findIndex(e=>String(e.uid)===v);return i<0?null:{e:P.inv[i],idx:i};}
function doRefine(key){const g=findGear(key);if(!g){refineArm=null;refreshPanel();return;}const e=g.e,next=(e.r||0)+1;if(next>10)return;
  const mat=refineMat(e.id),fee=refineFee(next),chance=REFINE_CHANCE[next];
  if(!invFind(mat)||P.gold<fee){addLog(`You need ${ITEMS[mat].name} and ${fmt(fee)} gold.`,'l-bad');return;}
  if(chance<1&&refineArm!==key){refineArm=key;refreshPanel();return;} // risky: ask once more
  refineArm=null;takeItem(mat);P.gold-=fee;
  if(Math.random()<chance){e.r=next;sfx('levelup');fx.push({k:'ring',x:P.x,y:P.y,r:46,col:'#ffcf5a',t0:now,dur:.5});
    addLog(`Success! It is now ${itemName(e)}.`,'l-good');floatT(P.x,P.y-50,`+${next}!`,'#ffcf5a',20);
    if(next>=7)announce('refine',`${next}:${e.id}`);}
  else{sfx('hurt');shakeUntil=now+.25;fx.push({k:'poof',x:P.x,y:P.y-10,col:'#9aa0aa',t0:now,dur:.6});
    if(g.slot)P.eq[g.slot]=null;else P.inv.splice(g.idx,1);
    addLog(`The refine failed. Your ${itemName(e)} shattered.`,'l-bad');floatT(P.x,P.y-50,'Shattered!','#ff8a7a',18);}
  S=computeStats();P.hp=Math.min(P.hp,S.maxhp);P.sp=Math.min(P.sp,S.maxsp);rebuildHotbar();refreshPanel();save(true);}
function drawEquipDoll(){const c=document.getElementById('eqCv');if(!c)return;const g=c.getContext('2d');g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,c.width,c.height);
  g.setTransform(3,0,0,3,0,0);const main=ctx;ctx=g;
  try{drawPlayer({name:P.name,look:P.look,cls:P.cls,eq:P.eq,x:40,y:82,face:1,back:false,moving:false,sitting:false,held:true},P.eq.weapon&&P.eq.weapon.id);}finally{ctx=main;}}
function esc(s){return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));}
panel.addEventListener('click',ev=>{
  const b=ev.target.closest('[data-act]');if(!b||b.disabled)return;const a=b.dataset.act,arg=b.dataset.arg;
  if(a==='close')return closePanel();
  if(PANEL_ACTS[a])return PANEL_ACTS[a](arg,b);
  if(a==='refine')return doRefine(arg);
  if(a==='store'){const e=P.inv[+arg];if(!e||CS.busy||CS.oldSt)return;const next=storageWith(P.storage,e);
    if(!next){addLog('Storage is full.','l-bad');return;}
    storageApply(next,()=>{const k=P.inv.indexOf(e);if(k>=0)P.inv.splice(k,1);},()=>{P.inv.push(e);});return;}
  if(a==='take'){const i=+arg,e=P.storage[i];if(!e||CS.busy||CS.oldSt)return;if(carryWeight()+itemWeight(e.id)*(e.n||1)>maxWeight()){addLog(`Too heavy to carry ${itemName(e)}.`,'l-bad');return;}
    const next=P.storage.filter((_,k)=>k!==i);let into=null;
    storageApply(next,()=>{into=e.n!==undefined?invFind(e.id):null;if(into)into.n+=e.n;else P.inv.push(e);},
      ()=>{if(into){into.n-=e.n;if(into.n<=0){const k=P.inv.indexOf(into);if(k>=0)P.inv.splice(k,1);}}else{const k=P.inv.indexOf(e);if(k>=0)P.inv.splice(k,1);}});return;}
  if(a==='stat'){const v=P.st[arg],c=statCost(v);if(P.statPts>=c&&v<99){P.st[arg]++;P.statPts-=c;S=computeStats();}}
  if(a==='use')useInv(+arg);
  if(a==='unequip')unequip(arg);
  if(a==='learn'){if(P.skillPts>0&&skillUnlocked(arg)&&(P.skills[arg]||0)<SKILLS[arg].max){P.skills[arg]=(P.skills[arg]||0)+1;P.skillPts--;rebuildHotbar();addLog(`Learned ${SKILLS[arg].name} level ${P.skills[arg]}.`,'l-good');}}
  if(a==='tab'){shopTab=arg;shopCat=arg==='sell'?'etc':'use';}
  if(a==='buy'){const it=ITEMS[arg];if(carryWeight()+itemWeight(arg)>maxWeight()){addLog(`You cannot carry ${it.name}: too heavy.`,'l-bad');}else if(P.gold>=it.price){P.gold-=it.price;giveItem(arg,1);sfx('coin');addLog(`Bought ${it.name}.`,'l-loot');}}
  if(a==='sellstack'){const e=P.inv[+arg];if(e&&e.n>0){const g=sellValue(e.id)*e.n;P.gold+=g;P.inv.splice(+arg,1);sfx('coin');addLog(`Sold ${e.n} ${ITEMS[e.id].name} for ${fmt(g)} gold.`,'l-loot');}}
  if(a==='sell'){const e=P.inv[+arg];if(e){sfx('coin');P.gold+=(typeof sellValueOf==='function'?sellValueOf(e):sellValue(e.id));if(e.n!==undefined)takeItem(e.id);else P.inv.splice(+arg,1);}}
  if(a==='sellall'){let g=0;P.inv=P.inv.filter(e=>{if(ITEMS[e.id].type==='etc'&&!ITEMS[e.id].keep){g+=sellValue(e.id)*e.n;return false;}return true;});P.gold+=g;sfx('coin');addLog(`Sold your loot for ${fmt(g)} gold.`,'l-loot');}
  if(a==='job'&&P.cls==='novice'&&P.jl>=10){const k=CLASSES[arg];P.cls=arg;P.jl=1;P.jexp=0;P.skillPts=0;giveItem(k.gift,1);
    const idx=P.inv.findIndex(e=>e.id===k.gift);if(idx>=0)useInv(idx);
    fx.push({k:'lvl',x:P.x,y:P.y,t0:now,dur:2,txt:k.name.toUpperCase(),col:k.col});sfx('fanfare');announce('job',arg);addLog(`You are now a ${k.name}! Your ${ITEMS[k.gift].name} is equipped. Earn job levels to learn new skills.`,'l-rare');rebuildHotbar();S=computeStats();}
  if(a==='heal'){P.hp=S.maxhp;P.sp=S.maxsp;fx.push({k:'heal',x:P.x,y:P.y,t0:now,dur:.8});addLog('You feel refreshed.','l-good');}
  if(a==='warp'){const i=ZONE_ORDER.indexOf(arg),cost=i*60;if(P.gold>=cost){P.gold-=cost;closePanel();enterZone(arg);save();return;}}
  if(a==='newgame'){$('#confirm').hidden=false;return;}
  if(a==='qtake'&&!P.quest){const o=contractOffers().find(o=>o.mob===arg);if(o){P.quest={...o,have:0};addLog(`Contract accepted: defeat ${o.need} ${MOBS[arg].name}.`,'l-good');sfx('click');}}
  if(a==='qdrop'){P.quest=null;addLog('Contract abandoned.');}
  if(a==='emote'){doEmote(arg);closePanel();return;}
  if(a==='music'){audioInit();setAudio(!AU.music,AU.sfx);}
  if(a==='sfxt'){audioInit();setAudio(AU.music,!AU.sfx);}
  refreshPanel();save();
});
function openNpc(n){P.face=sface(n.x-P.x,n.y-P.y);shopTab='buy';openPanel(n.role);}

/* ================= input ================= */
let hoverMob=null;
function screenAt(ev){const r=cv.getBoundingClientRect();return{x:ev.clientX-r.left+camX,y:ev.clientY-r.top+camY};}
function worldAt(ev){const s=screenAt(ev);return unproj(s.x,s.y);}
let touchPick=false;
function mobAt(sc){let best=null,bd=1e9;const pad=touchPick?28:14;for(const m of mobs){if(m.dead)continue;const p=proj(m.x,m.y);const d=Math.hypot(p.x-sc.x,p.y-m.d.size*.9-sc.y);if(d<m.d.size+pad&&d<bd){bd=d;best=m;}}return best;}
cv.addEventListener('pointerdown',ev=>{
  audioInit();touchPick=ev.pointerType==='touch';closeChat(true);
  if(!P||P.dead||!running)return;if(npcBusy()){busyHint();return;}const sc=screenAt(ev),w=unproj(sc.x,sc.y);
  P.lootGoal=null;
  {const sp=shopAt(sc);if(sp){soc('vendView',{peer:sp});return;}}
  const m=mobAt(sc);
  if(!m){const l=lootAt(sc);if(l){if(P.sitting)P.sitting=false;goLoot(l);return;}
    const gl=typeof ghostAt==='function'?ghostAt(sc):null;if(gl){ghostHint(gl);return;}}
  // Shift-click: attack from where you stand (never walk to the target)
  P.holdPos=ev.shiftKey&&!!m;
  if(m){if(Z.D.safe&&!m.pvp)return;P.target=m;P.queued=null;P.npcGoal=null;P.sitting=false;if(P.holdPos)P.path=[];return;}
  for(const n of Z.npcs){const np=proj(n.x,n.y);if(Math.hypot(np.x-sc.x,np.y-22-sc.y)<(touchPick?34:26)){P.target=null;P.npcGoal=n;if(dist(P,n)<48){openNpc(n);P.npcGoal=null;}else pathTo(n.x,n.y+14,true);return;}}
  if(P.sitting||ev.shiftKey){faceTo(P,w.x-P.x,w.y-P.y);return;}
  P.target=null;P.queued=null;P.npcGoal=null;clickMark={x:w.x,y:w.y,t:now};pathTo(w.x,w.y,true);
});
let hoverNpc=null;
cv.addEventListener('pointermove',ev=>{if(!P)return;const sc=screenAt(ev);hoverNpc=null;if(Z)for(const n of Z.npcs){const np=proj(n.x,n.y);if(Math.hypot(np.x-sc.x,np.y-22-sc.y)<26){hoverNpc=n;break;}}hoverMob=mobAt(sc);hoverLoot=hoverMob?null:lootAt(sc);const gh=!hoverMob&&!hoverLoot&&typeof ghostAt==='function'?ghostAt(sc):null;cv.style.cursor=hoverMob?'crosshair':hoverLoot?'grab':'pointer';if(gh)hoverLoot=gh;});
window.addEventListener('keydown',ev=>{
  if(!running||ev.target.tagName==='INPUT')return;const k=ev.key.toLowerCase();
  // classic MMO desktop shortcuts (the single-letter keys below keep working too)
  if(ev.altKey){const pn={e:'items',q:'equip',s:'skills',a:'status',l:'emote',h:'help',u:'quests',g:'guild'}[k];
    if(pn){ev.preventDefault();togglePanel(pn);return;}
    if(k==='v'){ev.preventDefault();$('#hud').hidden=!$('#hud').hidden;return;}}
  if(k==='b'&&!ev.altKey){hudMini(!$('#hud').classList.contains('mini'));return;}
  if(/^f[1-9]$/.test(k)){ev.preventDefault();const i=+k.slice(1)-1;if(i<8)pressSlot(i);return;}
  if(k==='f12'){ev.preventDefault();$('#hotbar').hidden=!$('#hotbar').hidden;return;}
  if(k==='insert'){ev.preventDefault();if(!P.dead){P.sitting=!P.sitting;P.path=[];P.target=null;}return;}
  if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright'].includes(k)){ev.preventDefault();if(npcBusy()){busyHint();return;}keys[k]=true;return;}
  if(k==='enter'){ev.preventDefault();openChat();return;}
  if(k==='e'){togglePanel('emote');return;}
  if(ev.shiftKey&&/^Digit[1-4]$/.test(ev.code)){ev.preventDefault();lowerSlot(+ev.code.slice(5)-1);return;}
  if(k>='1'&&k<='8'){pressSlot(+k-1);return;}
  if(k==='c')togglePanel('status');else if(k==='i')togglePanel('items');else if(k==='k')togglePanel('skills');else if(k==='h')togglePanel('help');else if(k==='j')togglePanel('quests');else if(k==='g')togglePanel('guild');else if(k==='m')togglePanel('worldmap');else if(k==='o')togglePanel('settings');
  else if(k==='escape'){closePanel();P.target=null;}
  else if(k==='x'&&!P.dead){P.sitting=!P.sitting;P.path=[];P.target=null;}
  else if(k==='tab'){ev.preventDefault();P.holdPos=false;targetNearest(false);}
});
window.addEventListener('keyup',ev=>{keys[ev.key.toLowerCase()]=false;});
window.addEventListener('blur',()=>{for(const k in keys)keys[k]=false;});
document.querySelectorAll('[data-open]').forEach(b=>b.addEventListener('click',()=>{sfx('click');togglePanel(b.dataset.open);}));
function targetNearest(keep){
  if(!P||P.dead||!running)return;if(Z.D.safe){addLog('Monsters live outside town. Head through the glowing gate to the east.');return;}
  if(keep&&P.target&&!P.target.dead)return;
  let best=null,bd=460;for(const m of mobs)if(!m.dead&&!m.dying&&(m!==P.target||keep)){const d=dist(m,P);if(d<bd){bd=d;best=m;}}
  if(best){P.target=best;P.queued=null;P.npcGoal=null;P.sitting=false;}else addLog('No monsters nearby.');}
$('#emoteBtn').addEventListener('click',()=>{audioInit();togglePanel('emote');});
$('#autoBtn').addEventListener('click',()=>{if(!P)return;P.auto=!P.auto;$('#autoBtn').classList.toggle('on',P.auto);
  addLog(P.auto?`Auto-hunt on: you fight the nearest monster and drink tonics when HP runs low. Collecting drops: ${P.autoLoot===false?'only equipment, sigils and boss drops':'everything'} (the Loot button).`:'Auto-hunt off.',P.auto?'l-good':'l-sys');});
// #auto-loot: whether auto-hunt walks over to collect drops (saved with the character; on by default)
function setAutoLoot(on,quiet){if(!P)return;P.autoLoot=!!on;syncAutoLootBtn();if(!on&&P.lootGoal&&P.auto)P.lootGoal=null;if(!quiet)addLog(on?'Auto-hunt collects every drop.':'Auto-hunt now collects only equipment, sigils, items with a coloured name and boss drops, and leaves ordinary materials, tonics and gold (click them to pick them up yourself).');save();if(panelKind==='settings')refreshPanel();}
function syncAutoLootBtn(){const b=$('#autoLootBtn');if(!b)return;const on=!P||P.autoLoot!==false;b.classList.toggle('on',on);b.setAttribute('aria-checked',String(on));b.title=on?'Auto-hunt collects every drop':'Auto-hunt collects only equipment, sigils and boss drops';b.textContent=on?'Loot':'Best';}
$('#autoLootBtn').addEventListener('click',()=>{if(!P)return;sfx('click');setAutoLoot(P.autoLoot===false);});
$('#atkBtn').addEventListener('click',()=>{audioInit();targetNearest(true);});
$('#sitBtn').addEventListener('click',()=>{if(!P||P.dead)return;P.sitting=!P.sitting;P.path=[];P.target=null;});
$('#chatBtn').addEventListener('click',()=>{audioInit();$('#chatbar').hidden?openChat():closeChat();});
$('#muteBtn').addEventListener('click',()=>{audioInit();const on=AU.music||AU.sfx;setAudio(!on,!on);addLog(on?'Music and sound off.':'Music and sound on.');});
function openChat(){if(!running)return;$('#chatbar').hidden=false;$('#chatBtn').classList.add('on');$('#chatIn').focus();}
function closeChat(onlyIfEmpty){const i=$('#chatIn');if(onlyIfEmpty&&i.value)return;$('#chatbar').hidden=true;$('#chatBtn').classList.remove('on');i.blur();}
$('#chatbar').addEventListener('submit',ev=>{ev.preventDefault();const i=$('#chatIn');sendChat(i.value);i.value='';closeChat();});
$('#chatIn').addEventListener('keydown',ev=>{if(ev.key==='Escape'){ev.preventDefault();$('#chatIn').value='';closeChat();}ev.stopPropagation();});

/* ================= save / load: three character slots (per account, or per device for guests) and one shared storage ================= */
const SLOTS=3,SLOT_KEY='embervale.slot',GUEST_ST_KEY='embervale.storage.v1';
// slot: the chosen slot · sum: a short summary of each slot · legacy: the server only knows one character
// shared: this character uses the shared storage · storage/rev: the shared storage and its version on the server
// oldSt: items from this character's own old storage that are not yet in the shared one
const CS={slot:(()=>{try{const n=+localStorage.getItem(SLOT_KEY);return n>=0&&n<SLOTS?n|0:0;}catch(e){return 0;}})(),
  sum:[null,null,null],legacy:false,shared:false,storage:null,rev:0,busy:false,oldSt:null};
const slotKey=n=>n?SAVE_KEY+'.s'+n:SAVE_KEY;
const slotOpen=n=>!(ACC.token&&CS.legacy&&n>0);
const slotQ=()=>ACC.token&&CS.legacy?'':'?slot='+CS.slot;
function loadSlot(n){try{const s=JSON.parse(localStorage.getItem(slotKey(n))||'null');return s&&s.v===1?s:null;}catch(e){return null;}}
function loadSave(){return loadSlot(CS.slot);}
function guestStorage(){try{const a=JSON.parse(localStorage.getItem(GUEST_ST_KEY)||'null');return Array.isArray(a)?a:null;}catch(e){return null;}}
function writeGuestStorage(a){try{localStorage.setItem(GUEST_ST_KEY,JSON.stringify(a||[]));}catch(e){}}
const slotSum=s=>s&&s.p?{name:s.p.name,lv:s.p.lv,jl:s.p.jl,cls:s.p.cls,look:s.p.look,reborn:s.p.reborn,zone:s.p.zone}:null;
function guestSlots(){return [0,1,2].filter(n=>loadSlot(n));}
function setSlot(n){CS.slot=n;try{localStorage.setItem(SLOT_KEY,String(n));}catch(e){}}
// add one entry to a storage list (stacking like items); returns a new list, or null when storage is full
function storageWith(list,e){const out=list.map(x=>({...x}));const st=e.n!==undefined?out.find(x=>x.id===e.id&&x.n!==undefined):null;
  if(st){st.n+=e.n;return out;}if(out.length>=STORAGE_MAX)return null;out.push(e);return out;}
function snapshot(){if(!P)return null;
  const keep=['name','look','storage','friends','cls','lv','exp','jl','jexp','st','statPts','skillPts','skills','gold','inv','eq','hp','sp','zone','visited','quest','trial','hot','bar','pet','ach','emofav','mounts','mountPick','bond','useLv','rested','qs','track','bars','hbRows','reborn','autoLoot','build','cart','album'];
  const o={};for(const k of keep)o[k]=P[k];o.uid=uid;
  // the shared storage lives with the account (or the device), not in the character
  if(CS.shared){if(CS.oldSt)o.storage=CS.oldSt;else{o.storage=[];o.sharedSt=1;}}
  // where you stand, and buffs still running (as seconds left: the game clock restarts with every page)
  o.pos={x:Math.round(P.x),y:Math.round(P.y)};
  o.savedBuffs={};for(const k in P.buffs){const f=P.buffs[k];if(k.startsWith('__')||!f||!(f.until-now>1))continue;o.savedBuffs[k]={name:f.name,left:Math.round(f.until-now),b:f.b,from:f.from};}
  if(typeof pendingEscrow==='function'){const ex=pendingEscrow();if(ex.items.length||ex.gold){o.inv=[...P.inv,...ex.items];o.gold=P.gold+ex.gold;}}
  return {v:1,p:JSON.parse(JSON.stringify(o))};}
function save(force){const s=snapshot();if(!s)return;
  if(ACC.token){ACC.cloud=s;cloudSave(force);}
  else{try{localStorage.setItem(slotKey(CS.slot),JSON.stringify(s));}catch(e){}if(CS.shared&&!CS.oldSt)writeGuestStorage(P.storage);}}

/* ---- talking to the game server ---- */
async function api(method,path,body,keepalive){
  const r=await fetch(SERVER+'/api/embervale'+path,{method,keepalive:!!keepalive,
    headers:{'Content-Type':'application/json',...(ACC.token?{Authorization:'Bearer '+ACC.token}:{})},body:body?JSON.stringify(body):undefined});
  const j=await r.json().catch(()=>({}));
  if(!r.ok)throw Object.assign(new Error(j.error||'The server did not answer. Try again in a moment.'),{status:r.status,body:j});
  return j;}
let cloudT=0,cloudTimer=null,cloudWarned=false;
function cloudSave(force){
  if(!ACC.token||!ACC.cloud)return;const wait=10000-(Date.now()-cloudT);
  if(!force&&wait>0){if(!cloudTimer)cloudTimer=setTimeout(()=>{cloudTimer=null;cloudSave(true);},wait);return;}
  clearTimeout(cloudTimer);cloudTimer=null;cloudT=Date.now();
  api('PUT','/character'+slotQ(),{character:ACC.cloud},true).then(()=>{cloudWarned=false;}).catch(e=>{
    if(e.status===401){addLog('Your login has expired. Log in again from the title screen to keep saving to the server.','l-bad');
      const s=ACC.cloud||snapshot();if(CS.shared&&P&&!CS.oldSt){s.p.storage=P.storage;delete s.p.sharedSt;}
      const n=CS.slot;setAccount(null);CS.shared=false;CS.oldSt=null;
      try{localStorage.setItem(slotKey(n),JSON.stringify(s));}catch(_){}}
    else if(!cloudWarned){cloudWarned=true;addLog('Could not reach the server to save. Will keep trying.','l-bad');}});}
// account: save this character and the shared storage in one write. The server refuses (409) when another
// character changed the storage since we last saw it; then we take its copy and nothing is saved.
async function storageCommit(st){
  const s=snapshot();s.p.storage=[];s.p.sharedSt=1;
  try{const r=await api('PUT','/character'+slotQ(),{character:s,storage:st,storageRev:CS.rev});
    CS.rev=r.storageRev|0;CS.storage=st;ACC.cloud=s;return true;}
  catch(e){if(e.status===409&&e.body){CS.rev=e.body.storageRev|0;CS.storage=Array.isArray(e.body.storage)?e.body.storage:[];if(!CS.oldSt)P.storage=CS.storage;}
    addLog(e.message,'l-bad');return false;}}
// move items between bag and storage: doInv changes the bag, undo puts it back if the server says no
async function storageApply(next,doInv,undo){
  doInv();
  if(!(ACC.token&&CS.shared)){P.storage=next;if(CS.shared)CS.storage=next;sfx('click');rebuildHotbar();refreshPanel();save(true);return;}
  CS.busy=true;refreshPanel();
  const ok=await storageCommit(next);CS.busy=false;
  if(ok){P.storage=next;sfx('click');}else undo();
  rebuildHotbar();refreshPanel();}
// a character that had its own storage before slots existed: pour it into the shared storage once
async function mergeOldStorage(){
  for(let i=0;i<3&&CS.oldSt;i++){
    const st=(CS.storage||[]).map(x=>({...x}));for(const e of CS.oldSt){const s=e.n!==undefined?st.find(x=>x.id===e.id&&x.n!==undefined):null;if(s)s.n+=e.n;else st.push(e);}
    const old=CS.oldSt;CS.oldSt=null;
    if(!ACC.token){P.storage=CS.storage=st;save(true);return;}
    if(await storageCommit(st)){P.storage=st;if(panelKind==='storage')refreshPanel();return;}
    CS.oldSt=old;}}
// opening storage picks up changes another character made
async function storageRefresh(){
  if(!(ACC.token&&CS.shared)||CS.busy||CS.oldSt)return;
  try{const r=await api('GET','/characters');if(CS.busy||CS.oldSt||!Array.isArray(r.storage))return;
    CS.rev=r.storageRev|0;P.storage=CS.storage=r.storage;if(panelKind==='storage')refreshPanel();}catch(e){}}
function setAccount(sess){
  ACC.token=sess?sess.token:null;ACC.username=sess?sess.username:null;ACC.cloud=null;ACC.loaded=!sess;
  CS.legacy=false;CS.storage=null;CS.rev=0;CS.sum=[null,null,null];
  try{if(sess)localStorage.setItem('embervale.account',JSON.stringify({token:sess.token,username:sess.username}));else localStorage.removeItem('embervale.account');}catch(e){}
  if(NET.room&&NET.room.relogin)NET.room.relogin();
  if(!sess)CS.sum=[0,1,2].map(n=>slotSum(loadSlot(n)));
  refreshTitle();}
// fill in the slot summaries (and the shared storage) for the title screen
async function loadCloud(){
  if(!ACC.token){CS.sum=[0,1,2].map(n=>slotSum(loadSlot(n)));refreshTitle();return;}
  acMsg('Loading your characters…',true);
  const fail=e=>{if(e.status===401){setAccount(null);acMsg('Your login has expired. Please log in again.');}else acMsg(e.message);};
  try{const r=await api('GET','/characters');CS.legacy=false;CS.sum=[0,1,2].map(n=>r.slots&&r.slots[n]||null);
    CS.storage=Array.isArray(r.storage)?r.storage:null;CS.rev=r.storageRev|0;ACC.loaded=true;acMsg('');}
  catch(e){
    if(e.status===404){ // an older server: one character per account
      try{const r=await api('GET','/character');CS.legacy=true;CS.sum=[slotSum(r.character&&r.character.v===1?r.character:null),null,null];ACC.loaded=true;acMsg('');}
      catch(e2){fail(e2);}}
    else fail(e);}
  if(!slotOpen(CS.slot))setSlot(0);
  refreshTitle();}
function acMsg(t,ok){const el=$('#acMsg');el.textContent=t||'';el.classList.toggle('ok',!!ok);}
const slotDesc=s=>`Lv ${Math.floor(+s.lv)||1} · ${(CLASSES[s.cls]&&CLASSES[s.cls].name)||'Novice'}${s.reborn?' ✦':''}`;
function renderSlots(){const box=$('#slots');if(!box)return;box.innerHTML='';
  for(let n=0;n<SLOTS;n++){if(!slotOpen(n))continue;const s=CS.sum[n],b=document.createElement('button');
    b.type='button';b.className='slotc'+(n===CS.slot?' on':'')+(s?'':' empty');b.dataset.slot=n;b.setAttribute('aria-pressed',n===CS.slot);
    const nm=document.createElement('b'),ds=document.createElement('span');
    nm.textContent=s?String(s.name).slice(0,16):'Empty slot';ds.textContent=s?slotDesc(s):'New character';
    b.append(nm,ds);b.addEventListener('click',()=>{if(CS.slot===n)return;sfx('click');setSlot(n);acMsg('');refreshTitle();});box.appendChild(b);}}
function refreshTitle(){
  const inAcct=!!ACC.token;$('#acOut').hidden=!inAcct;$('#acIn').hidden=inAcct;$('#acNote').hidden=inAcct;
  if(inAcct)$('#acName').textContent=ACC.username;
  $('#acImport').hidden=!(inAcct&&ACC.loaded&&guestSlots().length&&CS.sum.some((s,i)=>!s&&slotOpen(i)));
  renderSlots();
  const s=CS.sum[CS.slot],busy=inAcct&&!ACC.loaded,c=$('#contBtn');
  c.hidden=!s;$('#newBtn').hidden=!!s;$('#slotDel').hidden=!s;
  $('#creator').hidden=!!s;$('.t-name').hidden=!!s;$('#title .tag').hidden=!!s;
  if(s)c.textContent=`Continue as ${String(s.name).slice(0,16)} (Lv ${Math.floor(+s.lv)||1})`;
  $('#newBtn').disabled=busy;c.disabled=busy;}
async function accountSubmit(kind){
  const username=$('#acUser').value.trim().toLowerCase(),password=$('#acPass').value;
  if(!/^[a-z0-9_]{3,16}$/.test(username)){acMsg('Username: 3-16 letters, numbers or _');return;}
  if(password.length<6){acMsg('Password: at least 6 characters');return;}
  acMsg(kind==='register'?'Creating your account…':'Logging in…',true);
  try{const sess=await api('POST',kind==='register'?'/register':'/login',{username,password});$('#acPass').value='';
    setAccount(sess);acMsg(kind==='register'?'Account created!':'Welcome back!',true);await loadCloud();
    if(kind==='register'&&guestSlots().length)acMsg('Account created! You can move your guest characters into it below.',true);}
  catch(e){acMsg(e.message);}}
$('#acIn').addEventListener('submit',ev=>{ev.preventDefault();accountSubmit('login');});
$('#acReg').addEventListener('click',()=>accountSubmit('register'));
$('#acLogout').addEventListener('click',()=>{setAccount(null);acMsg('Logged out. You are playing as a guest.',true);});
// move this device's guest characters (and the guest storage) into the account's empty slots
$('#acImport').addEventListener('click',async()=>{let gst=guestStorage(),first=-1,moved=0;
  for(const g of guestSlots()){const n=CS.sum.findIndex((x,i)=>!x&&slotOpen(i));if(n<0)break;
    const c=JSON.parse(JSON.stringify(loadSlot(g)));
    if(c.p.sharedSt){c.p.storage=[];delete c.p.sharedSt;}
    if(gst&&gst.length)c.p.storage=[...(c.p.storage||[]),...gst];
    try{await api('PUT','/character'+(CS.legacy?'':'?slot='+n),{character:c});}catch(e){acMsg(e.message);break;}
    if(gst&&gst.length){gst=null;try{localStorage.removeItem(GUEST_ST_KEY);}catch(e){}}
    try{localStorage.removeItem(slotKey(g));}catch(e){}
    CS.sum[n]=slotSum(c);if(first<0)first=n;moved++;}
  if(first>=0){setSlot(first);acMsg(moved>1?'Your guest characters are now saved to your account.':'Your guest character is now saved to your account.',true);}
  refreshTitle();});
function startWith(data){
  P=newPlayer(data?data.p.name:($('#nameIn').value.trim()||'Wanderer'));
  setTimeout(()=>{if(typeof syncAutoLootBtn==='function')syncAutoLootBtn();},0);
  if(data){Object.assign(P,data.p);uid=Math.max(uid,data.p.uid||1);if(!('head' in P.eq))P.eq.head=null;if(!('face' in P.eq))P.eq.face=null;if(!('mouth' in P.eq))P.eq.mouth=null;P.look=lookDecode(lookCode(P.look))&&P.look;}
  else P.look={...newLook};
  // storage: shared by every character of the account (or of this device for guests)
  CS.shared=!(ACC.token&&CS.legacy);CS.oldSt=null;
  if(CS.shared){
    if(!ACC.token)CS.storage=guestStorage();
    const own=Array.isArray(P.storage)?P.storage:[];
    if(!P.sharedSt&&own.length)CS.oldSt=own;
    P.storage=(CS.storage||[]).map(x=>({...x}));CS.storage=P.storage;delete P.sharedSt;}
  else if(!Array.isArray(P.storage))P.storage=[];
  if(!Array.isArray(P.friends))P.friends=[];
  if(P.lv>=99)P.exp=0; // saves from before the cap fix could hold more than 100%
  S=computeStats();if(!data||P.hp<=0){P.hp=S.maxhp;P.sp=S.maxsp;}
  $('#title').hidden=true;running=true;rebuildHotbar();
  enterZone(data&&ZONES[P.zone]?P.zone:'town');
  if(data){const pos=data.p.pos,sb=data.p.savedBuffs;delete P.pos;delete P.savedBuffs;
    // back where you logged out, if that spot is still open ground in the same region
    if(pos&&ZONES[data.p.zone]&&zoneId===data.p.zone&&Number.isFinite(pos.x)&&Number.isFinite(pos.y)&&!blockedT(Math.floor(pos.x/TILE),Math.floor(pos.y/TILE))){P.x=pos.x;P.y=pos.y;P.path=[];}
    // buffs keep the time they had left
    if(sb&&typeof sb==='object'){P.buffs={};for(const k in sb){const f=sb[k];if(f&&f.left>0&&f.b&&typeof f.b==='object')P.buffs[k]={name:String(f.name||k),until:now+Math.min(+f.left,7200),b:f.b,...(f.from?{from:f.from}:{})};}S=computeStats();}}
  if(!data){addLog(`Welcome to Hearthvale, ${P.name}.`,'l-lvl');addLog('Spend your 24 stat points first: open Stats (C).','l-good');addLog('Then head east through the glowing gate to Greenmoss Meadow.');}
  else addLog(`Welcome back, ${P.name}.`,'l-lvl');
  CS.sum[CS.slot]=slotSum({p:P});
  save();
  if(CS.oldSt)mergeOldStorage();
}
// play the chosen slot: accounts fetch the full character from the server
async function playSlot(){
  if(!CS.sum[CS.slot])return;
  if(!ACC.token){const s=loadSlot(CS.slot);if(s)startWith(s);return;}
  const c=$('#contBtn');c.disabled=true;acMsg('Loading your character…',true);
  try{const r=await api('GET','/character'+slotQ());
    if(!CS.legacy&&r.storageRev!==undefined){CS.storage=Array.isArray(r.storage)?r.storage:null;CS.rev=r.storageRev|0;}
    const s=r.character&&r.character.v===1?r.character:null;
    if(!s){CS.sum[CS.slot]=null;acMsg('That slot is empty now.');refreshTitle();return;}
    ACC.cloud=s;acMsg('');startWith(s);}
  catch(e){if(e.status===401){setAccount(null);acMsg('Your login has expired. Please log in again.');}else acMsg(e.message);}
  finally{c.disabled=false;}}
setInterval(()=>{if(running)save();},15000);
document.addEventListener('visibilitychange',()=>{if(document.hidden&&running)save(true);});
addEventListener('pagehide',()=>{if(running)save(true);});
$('#reviveBtn').addEventListener('click',()=>{P.dead=false;S=computeStats();P.hp=Math.round(S.maxhp*.5);P.sp=Math.round(S.maxsp*.5);$('#death').hidden=true;enterZone('town');save();});
$('#newBtn').addEventListener('click',()=>{audioInit();
  if(CS.sum[CS.slot]){const n=CS.sum.findIndex((s,i)=>!s&&slotOpen(i));
    if(n<0){acMsg('All your character slots are full. Delete a character first.');return;}setSlot(n);}
  startWith(null);});
$('#contBtn').addEventListener('click',()=>{audioInit();playSlot();});
$('#slotDel').addEventListener('click',()=>{const s=CS.sum[CS.slot];if(!s)return;
  $('#cfText').textContent=`Delete ${String(s.name).slice(0,16)} (Lv ${Math.floor(+s.lv)||1})? This cannot be undone. Items in storage stay for your other characters.`;$('#confirm').hidden=false;});
$('#cfNo').addEventListener('click',()=>{$('#confirm').hidden=true;});
$('#cfYes').addEventListener('click',async()=>{$('#confirm').hidden=true;
  if(ACC.token){try{await api('DELETE','/character'+slotQ());}catch(e){acMsg(e.message);return;}}
  else try{localStorage.removeItem(slotKey(CS.slot));}catch(e){}
  CS.sum[CS.slot]=null;acMsg('Character deleted.',true);refreshTitle();});
// back to the character list: save, then start the page fresh so nothing of this character stays around
function switchCharacter(){if(running)save(true);setTimeout(()=>location.reload(),ACC.token?700:50);}

/* ================= loop ================= */
let last=performance.now();
let hitStopUntil=0;function hitStop(sec){hitStopUntil=Math.max(hitStopUntil,performance.now()+sec*1000);}
function frame(ts){let dt=Math.min(.05,(ts-last)/1000);last=ts;if(ts<hitStopUntil)dt*=.06;now+=dt;
  if(running){update(dt);if(ts-(frame.hud||0)>=60||ts<(frame.hud||0)){frame.hud=ts;updateHud();}}
  render();if(running){if(ts-(frame.mini||0)>=48||ts<(frame.mini||0)){frame.mini=ts;renderMini();}if(typeof renderBuffs==='function')renderBuffs();} /* the minimap at ~20 a second is plenty */else drawLookPreview();requestAnimationFrame(frame);}
function showBanner(a,b){const el=$('#zoneBanner');el.querySelector('b').textContent=a;el.querySelector('span').textContent=b;
  el.hidden=false;el.classList.remove('show');void el.offsetWidth;el.classList.add('show');clearTimeout(showBanner.t);showBanner.t=setTimeout(()=>{el.hidden=true;},3300);}
cv.addEventListener('contextmenu',ev=>{ev.preventDefault();if(!P||!running)return;const m=mobAt(screenAt(ev));if(m)openPanel('mob',m.d.id);});
$('#tInfo').addEventListener('click',()=>{if(P&&P.target&&P.target.d&&MOBS[P.target.d.id])openPanel('mob',P.target.d.id);});
let newLook=null,lookTouched=false;
function setNewLook(lk,touched){newLook={style:lk.style,hair:lk.hair,eye:lk.eye,skin:lk.skin,body:lk.body|0};if(touched)lookTouched=true;refreshCreator();}
function refreshCreator(){
  $('#lkStyle').textContent=STYLE_NAMES[newLook.style];if($('#lkBuild'))$('#lkBuild').textContent=BUILD_NAMES[newLook.body|0];
  const fill=(id,list,key,label)=>{const el=$(id);if(!el.children.length)list.forEach((c,i)=>{const b=document.createElement('button');b.type='button';b.style.background=c;b.dataset.i=i;b.setAttribute('aria-label',`${label} ${i+1}`);
      b.addEventListener('click',()=>{sfx('click');setNewLook({...newLook,[key]:c},true);});el.appendChild(b);});
    [...el.children].forEach((b,i)=>b.classList.toggle('on',list[i]===newLook[key]));};
  fill('#swHair',HAIRS,'hair','Hair color');fill('#swEye',EYES,'eye','Eye color');fill('#swSkin',SKINS,'skin','Skin tone');}
const lookCtx=$('#lookCv').getContext('2d');
function drawLookPreview(){if(!newLook)return;const sv=typeof CS!=='undefined'&&CS.sum[CS.slot];const c=lookCtx;c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,240,240);c.setTransform(4,0,0,4,0,0);
  const main=ctx;ctx=c;const ph=Math.floor(now/1.6)%4,face=ph===1||ph===2?-1:1,back=ph>=2;
  try{if(sv){const lk={...lookFor(sv.name),...(sv.look||{})},cl=CLASSES[sv.cls]||CLASSES.novice;drawHuman(30,50,cl.col,lk.hair,face,0,{look:lk,outfit:typeof baseOf==='function'?baseOf(sv.cls):'novice',back});}
    else drawHuman(30,50,CLASSES.novice.col,newLook.hair,face,0,{look:{...lookFor($('#nameIn').value.trim()||'Wanderer'),...newLook},outfit:'novice',back});}finally{ctx=main;}}
function initCreator(){
  setNewLook(lookFor('Wanderer'));
  $('#nameIn').addEventListener('input',()=>{if(!lookTouched)setNewLook(lookFor($('#nameIn').value.trim()||'Wanderer'));});
  document.querySelectorAll('[data-build]').forEach(b=>b.addEventListener('click',()=>{sfx('click');setNewLook({...newLook,body:((newLook.body|0)+(+b.dataset.build)+3)%3},true);}));
  document.querySelectorAll('[data-style]').forEach(b=>b.addEventListener('click',()=>{sfx('click');setNewLook({...newLook,style:(newLook.style+(+b.dataset.style)+6)%6},true);}));
  $('#lkRand').addEventListener('click',()=>{sfx('click');const r=a=>a[Math.floor(Math.random()*a.length)];setNewLook({style:Math.floor(Math.random()*6),hair:r(HAIRS),eye:r(EYES),skin:r(SKINS),body:Math.floor(Math.random()*3)},true);});
  $('#verT').textContent=`Embervale v${VERSION}`+(ROOM?` · private room "${ROOM}"`:'');}
function boot(hot){
  initCreator();
  resize();setAudio(AU.music,AU.sfx);netConnect();
  document.addEventListener('visibilitychange',()=>{NET.lastSent='';NET.sendT=0;if(P)netTick(0);});
  $('#onlineBadge').addEventListener('click',()=>{const l=$('#whoList');if(!NET.room)return;l.hidden=!l.hidden;if(!l.hidden)updateWho();});
  setInterval(()=>{if(!$('#whoList').hidden)updateWho();},1500);
  if(hot&&hot.v===1){startWith(hot);}
  else{refreshTitle();loadCloud();}
  requestAnimationFrame(frame);
}
window.claude?.hot?.snapshot?.(()=>snapshot());
window.claude?.hot?.ready ? window.claude.hot.ready(boot) : boot(window.claude?.hot?.data);
window.__game={get cam(){return {x:camX,y:camY}},get P(){return P},get mobs(){return mobs},get Z(){return Z},enterZone,gainExp,useSkill,startWith};

/* ---- status box: full or compact (name, HP, SP and ailments); remembered on this device ---- */
function hudMini(on,quiet){const h=$('#hud'),b=$('#hudToggle');h.classList.toggle('mini',on);if(typeof renderParty==='function')setTimeout(renderParty,0);b.textContent=on?'+':'−';b.setAttribute('aria-expanded',String(!on));
  const t=on?'Expand the status box (B)':'Collapse the status box (B)';b.setAttribute('aria-label',t);b.title=t;
  if(!quiet){sfx('click');try{localStorage.setItem('embervale.hudMini',on?'1':'0');}catch(e){}}}
$('#hudToggle').addEventListener('click',ev=>{ev.stopPropagation();hudMini(!$('#hud').classList.contains('mini'));});
try{if(localStorage.getItem('embervale.hudMini')==='1')hudMini(true,true);}catch(e){}

/* ---- monster box: compact (name + HP) by default, details on demand; remembered on this device ---- */
function targetMini(on,quiet){const t=$('#target'),b=$('#tToggle');t.classList.toggle('mini',on);b.textContent=on?'+':'−';b.setAttribute('aria-expanded',String(!on));
  const l=on?'Show monster details':'Hide monster details';b.setAttribute('aria-label',l);b.title=l;
  if(!quiet){sfx('click');try{localStorage.setItem('embervale.targetFull',on?'0':'1');}catch(e){}}}
$('#tToggle').addEventListener('click',ev=>{ev.stopPropagation();targetMini(!$('#target').classList.contains('mini'));});
try{if(localStorage.getItem('embervale.targetFull')==='1')targetMini(false,true);}catch(e){}

/* ---- the game open in two tabs of one browser: they share one saved character and only the front tab runs ---- */
const TABS=(()=>{try{return new BroadcastChannel('embervale-tabs');}catch(e){return null;}})();
let tabWarned=false;
function tabWarn(){if(tabWarned||!running)return;tabWarned=true;
  addLog('Embervale is also open in another tab of this browser. Tabs in one browser share one saved character and would overwrite each other, and the browser pauses whichever tab is in the background. For a second character, use a different browser, a private window, or another device.','l-bad');
  showBanner('Open in another tab','Use another browser or device for a second character');}
if(TABS){TABS.onmessage=ev=>{const m=ev.data||{};if(m.k==='hello'&&running){TABS.postMessage({k:'here'});tabWarn();}else if(m.k==='here')tabWarn();};
  setInterval(()=>{if(running&&!tabWarned)TABS.postMessage({k:'hello'});},3000);}
