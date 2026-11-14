"use strict";
/* ================= choose how many =================
   Buying, selling, storing, taking out of storage and loading the pushcart ask how many when it is a stack (or when you
   could buy more than one): a small box with − / + buttons, a slider, quick picks (1, 10, half, all) and the total.
   Single pieces of gear still move with one tap, and "Sell all" stays one tap. Player trades and player shops already
   have their own number boxes (js/trade.js). */
const QTY={el:null,cb:null};
function qtyClose(){if(QTY.el)QTY.el.hidden=true;QTY.cb=null;}
// o: {id, max, def, verb, unit (gold each, optional), gain (true: you receive the gold)}
function qtyAsk(o,cb){const max=Math.max(1,Math.floor(o.max));if(max<=1){cb(1);return;}
  let el=QTY.el;
  if(!el){el=QTY.el=document.createElement('div');el.id='qtyPick';el.className='frame';el.setAttribute('role','dialog');el.setAttribute('aria-label','How many');document.body.appendChild(el);
    el.addEventListener('click',ev=>{ev.stopPropagation();const b=ev.target.closest('[data-q]');if(!b)return;const k=b.dataset.q,inp=el.querySelector('input[type=number]');let n=+inp.value||1;const mx=+inp.max;
      if(k==='ok'){const cb=QTY.cb;const v=Math.max(1,Math.min(mx,Math.floor(n)));qtyClose();if(cb)cb(v);return;}
      if(k==='cancel'){qtyClose();return;}
      n=k==='-'?n-1:k==='+'?n+1:k==='half'?Math.max(1,Math.floor(mx/2)):k==='all'?mx:+k;qtySet(n);});
    el.addEventListener('input',ev=>{if(ev.target.matches('input'))qtySet(+ev.target.value||1,ev.target);});
    el.addEventListener('keydown',ev=>{if(ev.key==='Enter'){ev.preventDefault();el.querySelector('[data-q="ok"]').click();}if(ev.key==='Escape'){ev.preventDefault();ev.stopPropagation();qtyClose();}});
    document.addEventListener('pointerdown',ev=>{if(QTY.el&&!QTY.el.hidden&&!QTY.el.contains(ev.target))qtyClose();},true);}
  const it=ITEMS[o.id],pic=typeof itemIconURL==='function'?`<img src="${itemIconURL(o.id)}" alt="">`:'',def=Math.max(1,Math.min(max,Math.floor(o.def||1)));
  QTY.o=o;QTY.cb=cb;
  el.innerHTML=`<div class="qhead">${pic}<div><div class="nm">${esc(it?it.name:o.id)}</div><div class="ds">How many? (up to ${max})</div></div></div>`+
    `<div class="qrow"><button class="btn small" data-q="-" aria-label="One less">−</button><input type="number" min="1" max="${max}" value="${def}" aria-label="How many"><button class="btn small" data-q="+" aria-label="One more">+</button></div>`+
    `<input type="range" min="1" max="${max}" value="${def}" aria-label="How many">`+
    `<div class="qchips">${[1,10].filter(v=>v<max).map(v=>`<button class="btn small ghost" data-q="${v}">${v}</button>`).join('')}${max>=4?'<button class="btn small ghost" data-q="half">Half</button>':''}<button class="btn small ghost" data-q="all">All (${max})</button></div>`+
    `<div class="qtotal"></div><div class="tbtns"><button class="btn small ghost" data-q="cancel">Cancel</button><button class="btn small" data-q="ok">${esc(o.verb||'OK')}</button></div>`;
  el.hidden=false;qtySet(def);
  // desktop: type a number straight away; phones: no focus, so the keyboard does not pop up over the box
  if(!document.body.classList.contains('touchui')){const inp=el.querySelector('input[type=number]');try{inp.focus({preventScroll:true});inp.select();}catch(e){}}}
function qtySet(n,src){const el=QTY.el,o=QTY.o;if(!el||!o)return;const num=el.querySelector('input[type=number]'),rng=el.querySelector('input[type=range]'),mx=+num.max;
  n=Math.max(1,Math.min(mx,Math.floor(n)||1));if(src!==num)num.value=n;if(src!==rng)rng.value=n;
  el.querySelector('.qtotal').textContent=o.unit?`${o.gain?'You get':'Total'}: ${fmt(o.unit*n)} gold`:`${n} of ${mx}`;}
addEventListener('keydown',e=>{if(e.key==='Escape'&&QTY.el&&!QTY.el.hidden)qtyClose();},true);

const isGear=id=>{const t=ITEMS[id]&&ITEMS[id].type;return ['weapon','armor','accessory','head','face','mouth'].includes(t);};
const roomFor=id=>{const w=itemWeight(id);return w>0?Math.floor((maxWeight()-carryWeight())/w):9999;};
const qtyDone=()=>{rebuildHotbar();refreshPanel();if(typeof save==='function')save();};

/* ---- shops: buy ---- */
PANEL_ACTS.buy=id=>{const it=ITEMS[id];if(!it)return;
  if(carryWeight()+itemWeight(id)>maxWeight()){addLog(`You cannot carry ${it.name}: too heavy.`,'l-bad');return;}
  if(P.gold<it.price){addLog(`You need ${fmt(it.price)} gold.`,'l-bad');return;}
  const max=Math.min(isGear(id)?10:999,Math.floor(P.gold/Math.max(1,it.price)),roomFor(id));
  qtyAsk({id,max,def:1,verb:'Buy',unit:it.price},n=>{const cost=it.price*n;if(P.gold<cost||roomFor(id)<n)return;
    P.gold-=cost;giveItem(id,n);sfx('coin');addLog(`Bought ${n>1?n+' ':''}${it.name}${n>1?` for ${fmt(cost)} gold`:''}.`,'l-loot');qtyDone();});};

/* ---- shops: sell (a stack asks how many; one piece sells straight away) ---- */
PANEL_ACTS.sell=i=>{const e=P.inv[+i];if(!e)return;const each=typeof sellValueOf==='function'?sellValueOf(e):sellValue(e.id);
  const sellN=n=>{const k=P.inv.indexOf(e);if(k<0)return;n=e.n!==undefined?Math.min(n,e.n):1;P.gold+=each*n;sfx('coin');
    if(e.n!==undefined){e.n-=n;if(e.n<=0)P.inv.splice(k,1);}else P.inv.splice(k,1);
    if(n>1)addLog(`Sold ${n} ${ITEMS[e.id].name} for ${fmt(each*n)} gold.`,'l-loot');qtyDone();};
  if(e.n!==undefined&&e.n>1)qtyAsk({id:e.id,max:e.n,def:e.n,verb:'Sell',unit:each,gain:true},sellN);else sellN(1);};

/* ---- warehouse / bank: store and take (part of a stack) ---- */
PANEL_ACTS.store=i=>{const e=P.inv[+i];if(!e||CS.busy||CS.oldSt)return;
  const go=n=>{if(P.inv.indexOf(e)<0||CS.busy||CS.oldSt)return;const all=e.n===undefined||n>=e.n,part=all?e:{...e,n};
    const next=storageWith(P.storage,part);if(!next){addLog('Storage is full.','l-bad');return;}
    if(all)storageApply(next,()=>{const k=P.inv.indexOf(e);if(k>=0)P.inv.splice(k,1);},()=>{P.inv.push(e);});
    else storageApply(next,()=>{e.n-=n;},()=>{e.n+=n;});};
  if(e.n!==undefined&&e.n>1)qtyAsk({id:e.id,max:e.n,def:e.n,verb:'Store'},go);else go(1);};
PANEL_ACTS.take=i=>{const e=P.storage[+i];if(!e||CS.busy||CS.oldSt)return;
  const go=n=>{const k=P.storage.indexOf(e);if(k<0||CS.busy||CS.oldSt)return;n=e.n===undefined?1:Math.min(n,e.n);
    if(carryWeight()+itemWeight(e.id)*n>maxWeight()){addLog(`Too heavy to carry ${itemName(e)}.`,'l-bad');return;}
    const all=e.n===undefined||n>=e.n,next=all?P.storage.filter((_,j)=>j!==k):P.storage.map((x,j)=>j===k?{...x,n:x.n-n}:{...x});
    const moved=all?e:{...e,n};let into=null;
    storageApply(next,()=>{into=moved.n!==undefined?invFind(moved.id):null;if(into)into.n+=moved.n;else P.inv.push(moved);},
      ()=>{if(into){into.n-=moved.n;if(into.n<=0){const j=P.inv.indexOf(into);if(j>=0)P.inv.splice(j,1);}}else{const j=P.inv.indexOf(moved);if(j>=0)P.inv.splice(j,1);}});};
  if(e.n!==undefined&&e.n>1)qtyAsk({id:e.id,max:Math.min(e.n,Math.max(1,roomFor(e.id))),def:Math.min(e.n,Math.max(1,roomFor(e.id))),verb:'Take'},go);else go(1);};

/* ---- pushcart: put in and take out (part of a stack) ---- */
if(PANEL_ACTS.cartin){const _cin=PANEL_ACTS.cartin,_cout=PANEL_ACTS.cartout;
  PANEL_ACTS.cartin=i=>{const e=P.inv[+i];if(!e||!hasCart())return;if(e.n===undefined||e.n<=1)return _cin(i);
    qtyAsk({id:e.id,max:e.n,def:e.n,verb:'Put in'},n=>{const k=P.inv.indexOf(e);if(k<0)return;if(n>=e.n)return _cin(k);
      const part={...e,n};if(!cartPut(part))return;e.n-=n;sfx('click');qtyDone();});};
  PANEL_ACTS.cartout=i=>{const e=hasCart()&&P.cart[+i];if(!e)return;if(e.n===undefined||e.n<=1)return _cout(i);
    const cap=Math.min(e.n,Math.max(1,roomFor(e.id)));
    qtyAsk({id:e.id,max:cap,def:cap,verb:'Take'},n=>{const k=P.cart.indexOf(e);if(k<0)return;if(n>=e.n)return _cout(k);
      if(carryWeight()+itemWeight(e.id)*n>maxWeight()){addLog(`Too heavy to carry ${itemName(e)}.`,'l-bad');return;}
      e.n-=n;const bag=invFind(e.id);if(bag)bag.n+=n;else P.inv.push({...e,n});sfx('click');qtyDone();});};}

if(typeof TH!=='undefined')Object.assign(TH,{'Half':'ครึ่งหนึ่ง','Cancel':'ยกเลิก','Put in':'ใส่','Sell':'ขาย','How many':'จำนวน','One less':'ลดหนึ่ง','One more':'เพิ่มหนึ่ง'});
if(typeof TH_PAT!=='undefined')TH_PAT.unshift([/^How many\? \(up to (\d+)\)$/,'จำนวนเท่าไร? (สูงสุด $1)'],[/^All \((\d+)\)$/,'ทั้งหมด ($1)'],
  [/^Total: ([\d,]+) gold$/,'รวม: $1 โกลด์'],[/^You get: ([\d,]+) gold$/,'คุณได้รับ: $1 โกลด์'],[/^(\d+) of (\d+)$/,'$1 จาก $2'],
  [/^Bought (\d+) (.+) for ([\d,]+) gold\.$/,'ซื้อ $2 $1 ชิ้น ราคา $3 โกลด์'],[/^Bought (.+)\.$/,'ซื้อ $1 แล้ว'],[/^Sold (\d+) (.+) for ([\d,]+) gold\.$/,'ขาย $2 $1 ชิ้น ได้ $3 โกลด์'],
  [/^You need ([\d,]+) gold\.$/,'ต้องใช้ $1 โกลด์']);
