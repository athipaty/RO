"use strict";
/* ================= choose where a sigil goes =================
   Tapping Socket on a sigil opens a picker instead of guessing: it lists every piece of gear the sigil fits
   (the one you wear and spares in your bag), with its slots drawn as pips. Tap one to select it, then OK.
   Nothing is socketed until OK; Cancel goes back to the bag. Gear with no free slot is shown but greyed. */
const SIGPICK={sig:null,pick:null};
const sockFree=e=>Array.isArray(e.s)?e.s.filter(v=>!v).length:0;
function socketTargets(sigId){
  const it=ITEMS[sigId];if(!it||it.type!=='sigil')return [];
  const kind=it.kind,out=[],w=P.eq[kind];
  if(w&&Array.isArray(w.s)&&w.s.length)out.push({key:'eq:'+kind,e:w,worn:true});
  for(const x of P.inv)if(x.uid&&ITEMS[x.id]&&ITEMS[x.id].type===kind&&Array.isArray(x.s)&&x.s.length)out.push({key:'inv:'+x.uid,e:x,worn:false});
  return out;}
function sockFind(key){return socketTargets(SIGPICK.sig).find(g=>g.key===key)||null;}
function openSocket(sigId){
  SIGPICK.sig=sigId;const open=socketTargets(sigId).filter(g=>sockFree(g.e)>0);
  SIGPICK.pick=open.length===1?open[0].key:null; // only one place it can go: pre-select it, OK still confirms
  openPanel('socket');}
PANELS.socket=()=>{
  const sig=ITEMS[SIGPICK.sig];if(!sig||!invFind(SIGPICK.sig)){SIGPICK.sig=null;return '<p class="muted">That sigil is no longer in your bag.</p>';}
  const kind=sig.kind,list=socketTargets(SIGPICK.sig),mob=MOBS[SIGPICK.sig.replace('_sig','')];
  let h=`<h2>Socket a sigil</h2><div class="sockhead">${icon(sig)}<div class="grow"><div class="nm" style="color:${rarityCol(SIGPICK.sig)}">${esc(sig.name)}</div>`+
    `<div class="ds">${mob?esc(mob.sig.txt):''} · fits ${/^[aeiou]/.test(kind)?'an':'a'} ${kind}</div></div></div>`;
  h+=`<div class="sub">Choose the gear to put it in. A socketed sigil stays in that gear for good.</div>`;
  if(!list.length)h+=`<p class="muted">You have no ${kind} with sigil slots. Look for gear with slots at the General Store, from the forge, or as monster drops.</p>`;
  else{h+=`<div class="socklist" role="radiogroup" aria-label="Gear for this sigil">`;
    for(const g of list){const e=g.e,free=sockFree(e),on=SIGPICK.pick===g.key;
      const pips=e.s.map(v=>v?`<i class="pip full" title="${esc(ITEMS[v].name)}"></i>`:`<i class="pip"></i>`).join('');
      h+=`<button type="button" class="sockopt${on?' on':''}" role="radio" aria-checked="${on}" data-act="sockpick" data-arg="${g.key}" ${free?'':'disabled'}>`+
        `${icon(ITEMS[e.id])}<span class="grow"><b style="color:${rarityCol(e.id)}">${esc(itemName(e))}</b>`+
        `<i>${g.worn?'Worn':'In bag'} · ${free?`${free} free slot${free>1?'s':''}`:'No free slot'}</i>`+
        (e.s.some(Boolean)?`<i>Has: ${e.s.filter(Boolean).map(v=>esc(ITEMS[v].name.replace(' Sigil',''))).join(', ')}</i>`:'')+
        `</span><span class="pips" aria-hidden="true">${pips}</span></button>`;}
    h+=`</div>`;}
  const pick=SIGPICK.pick&&sockFind(SIGPICK.pick);
  h+=`<div class="tbtns"><button class="btn small ghost" data-act="sockcancel">Cancel</button>`+
    `<button class="btn" data-act="sockok" ${pick&&sockFree(pick.e)?'':'disabled'}>${pick?`OK · socket into ${esc(itemName(pick.e))}`:'Pick the gear first'}</button></div>`;
  return h;};
PANEL_ACTS.sockpick=k=>{SIGPICK.pick=k;sfx('click');refreshPanel();};
PANEL_ACTS.sockcancel=()=>{SIGPICK.sig=null;SIGPICK.pick=null;invTab='sigil';openPanel('items');};
PANEL_ACTS.sockok=()=>{
  const g=SIGPICK.pick&&sockFind(SIGPICK.pick),sig=ITEMS[SIGPICK.sig];
  if(!g||!sig||!invFind(SIGPICK.sig))return;const k=g.e.s.indexOf(null);if(k<0)return;
  g.e.s[k]=SIGPICK.sig;takeItem(SIGPICK.sig);
  const mob=MOBS[SIGPICK.sig.replace('_sig','')];
  addLog(`Socketed ${sig.name} into ${itemName(g.e)}${g.worn?'':' (in your bag)'}.${mob?' '+mob.sig.txt+'.':''}`,'l-good');sfx('rare');
  if(g.worn){S=computeStats();P.hp=Math.min(P.hp,S.maxhp);P.sp=Math.min(P.sp,S.maxsp);}
  SIGPICK.sig=null;SIGPICK.pick=null;save();invTab='sigil';openPanel('items');};
// Thai labels for the picker
if(typeof TH!=='undefined')Object.assign(TH,{'Socket a sigil':'ใส่ซิกิล','Choose the gear to put it in. A socketed sigil stays in that gear for good.':'เลือกอุปกรณ์ที่จะใส่ ซิกิลที่ใส่แล้วจะติดอยู่กับอุปกรณ์นั้นถาวร',
  'Cancel':'ยกเลิก','Pick the gear first':'เลือกอุปกรณ์ก่อน','Worn':'สวมอยู่','In bag':'ในกระเป๋า','No free slot':'ไม่มีช่องว่าง','Gear for this sigil':'อุปกรณ์สำหรับซิกิลนี้',
  'That sigil is no longer in your bag.':'ซิกิลนี้ไม่อยู่ในกระเป๋าแล้ว'});
