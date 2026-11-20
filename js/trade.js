"use strict";
/* ================= trading and player shops ================= */
// The game server referees both: see routes/embervale/trade.js in center-kitchen-backend.
// Items you put up for trade or sale leave your bag but stay yours (and are saved with you)
// until the trade completes or the item is sold.
const TR={trade:null,ask:null,vend:null,view:null,draft:[]};
const GEAR=['weapon','armor','head','accessory','face','mouth'];

/* ---- item helpers ---- */
function validEntry(e,forView){if(!e||typeof e!=='object'||typeof e.id!=='string'||!ITEMS[e.id])return null;const it=ITEMS[e.id];
  if(!GEAR.includes(it.type)){const n=clamp(Math.floor(fin(e.n)),0,30000);return n>=1?{id:e.id,n}:null;}
  const ns=Array.isArray(e.s)?clamp(e.s.length,0,4):(it.slots||0);const s=(Array.isArray(e.s)?e.s:[]).slice(0,ns).map(x=>typeof x==='string'&&ITEMS[x]&&ITEMS[x].type==='sigil'?x:null);
  while(s.length<ns)s.push(null);
  const out={id:e.id,s,r:clamp(Math.floor(fin(e.r)),0,10)};if(!forView)out.uid=uid++;return out;}
function bagAdd(e){if(e.n!==undefined){const st=invFind(e.id);if(st&&st.n!==undefined)st.n+=e.n;else P.inv.push({id:e.id,n:e.n});}else P.inv.push(e);}
function bagTake(i,n){const e=P.inv[i];if(!e)return null;if(e.n===undefined){P.inv.splice(i,1);return e;}
  n=clamp(Math.floor(n)||e.n,1,e.n);e.n-=n;if(e.n<=0)P.inv.splice(i,1);return {id:e.id,n};}
const wireEntry=e=>e.n!==undefined?{id:e.id,n:e.n}:{id:e.id,s:e.s,r:e.r||0};
const entryWeight=e=>itemWeight(e.id)*(e.n||1);
const entryLabel=e=>itemName(e)+(e.n!==undefined&&e.n>1?` ×${e.n}`:'');
const itemRow=(e,right)=>`<div class="row">${icon(ITEMS[e.id])}<div class="grow"><div class="nm" style="color:${rarityCol(e.id)}">${esc(entryLabel(e))}</div><div class="ds">${itemDesc(e)}</div></div>${right||''}</div>`;
// everything held out of the bag right now (saved with the character so nothing is lost if the tab closes)
function pendingEscrow(){const items=[...TR.draft.map(d=>d.e)];let gold=0;
  if(TR.trade){items.push(...TR.trade.mine.items);gold+=TR.trade.mine.gold;}
  if(TR.vend)for(const l of TR.vend.items)if(l.left>0)items.push(l.e.n!==undefined?{id:l.e.id,n:l.left}:l.e);
  return {items,gold};}
function afterItemsChanged(){S=computeStats();rebuildHotbar();refreshPanel();save(true);}

/* ---- server messages ---- */
function tradeAttach(sock){
  sock.on('tradeRequest',m=>{if(m&&m.fromPeer&&!(typeof isMuted==='function'&&isMuted(m.from)))showTradeAsk(String(m.fromPeer),clean(m.from,16)||'Someone');});
  sock.on('tradeState',st=>{if(!st||!st.me||!st.them)return;
    if(!TR.trade){TR.trade={peer:String(st.peer),name:clean(st.name,16)||'Someone',mine:{items:[],gold:0}};sfx('pop');}
    const th=st.them;
    TR.trade.state={me:{locked:!!st.me.locked,ok:!!st.me.ok},
      them:{items:(Array.isArray(th.items)?th.items:[]).slice(0,10).map(e=>validEntry(e,true)).filter(Boolean),gold:clamp(Math.floor(fin(th.gold)),0,1e9),locked:!!th.locked,ok:!!th.ok}};
    if(panelKind!=='trade')openPanel('trade');else refreshPanel();});
  sock.on('tradeDone',m=>{if(!TR.trade||!m||!m.get)return;const t=TR.trade;TR.trade=null;
    const got=(Array.isArray(m.get.items)?m.get.items:[]).slice(0,10).map(e=>validEntry(e)).filter(Boolean),gold=clamp(Math.floor(fin(m.get.gold)),0,1e9);
    for(const e of got)bagAdd(e);P.gold+=gold;
    addLog(`Trade with ${t.name} complete. You received: ${[...got.map(entryLabel),...(gold?[fmt(gold)+' gold']:[])].join(', ')||'nothing'}.`,'l-good');sfx('coin');
    if(panelKind==='trade')closePanel();afterItemsChanged();});
  sock.on('tradeClosed',m=>{if(!TR.trade)return;returnTrade();if(panelKind==='trade')closePanel();addLog(clean(m&&m.reason,120)||'The trade was cancelled.','l-bad');afterItemsChanged();});
  sock.on('vendOpened',m=>{const keys=Array.isArray(m&&m.keys)?m.keys:[];
    TR.vend={title:TR.pendingTitle,items:TR.draft.map((d,j)=>({k:keys[j],e:d.e,price:d.price,left:d.e.n!==undefined?d.e.n:1}))};TR.draft=[];
    P.sitting=true;P.path=[];P.target=null;closePanel();NET.lastSent='';
    addLog('Your shop is open. Other players can click your sign to buy. Stand up (X or Sit) to close it.','l-good');sfx('coin');save(true);});
  sock.on('vendClosed',m=>{if(!TR.vend)return;returnShop();const r=clean(m&&m.reason,120);if(r)addLog(r,'l-good');afterItemsChanged();});
  sock.on('vendSold',m=>{if(!TR.vend||!m)return;const l=TR.vend.items.find(x=>x.k===m.k);if(!l)return;
    const n=clamp(Math.floor(fin(m.n)),0,l.left),gold=clamp(Math.floor(fin(m.gold)),0,1e9);l.left-=n;P.gold+=gold;
    addLog(`Sold ${n}× ${itemName(l.e)} to ${clean(m.buyer,16)} for ${fmt(gold)} gold.`,'l-good');sfx('coin');save(true);});
  sock.on('vendList',m=>{if(!m){TR.view=null;if(panelKind==='vendview')closePanel();return;}
    TR.view={peer:String(m.peer),title:clean(m.title,30),seller:clean(m.seller,16),
      items:(Array.isArray(m.items)?m.items:[]).slice(0,12).map(x=>({k:clamp(Math.floor(fin(x&&x.k)),0,1e6),e:validEntry(x&&x.e,true),price:clamp(Math.floor(fin(x&&x.price)),1,1e9)})).filter(x=>x.e)};
    if(panelKind!=='vendview')openPanel('vendview');else refreshPanel();});
  sock.on('vendBought',m=>{if(!m)return;const e=validEntry(m.e);if(!e)return;const gold=clamp(Math.floor(fin(m.gold)),0,1e9);
    P.gold=Math.max(0,P.gold-gold);bagAdd(e);addLog(`Bought ${entryLabel(e)} from ${clean(m.seller,16)} for ${fmt(gold)} gold.`,'l-loot');sfx('coin');afterItemsChanged();});
}

/* ---- trading ---- */
function tradeWith(name){const peer=findPeerByName(name);if(!peer){addLog(`${name} is not in your channel.`,'l-bad');return;}soc('tradeRequest',{peer});}
function showTradeAsk(peer,from){const el=$('#tradeAsk');TR.ask={peer,from};el.querySelector('b').textContent=from;el.hidden=false;sfx('ping');
  clearTimeout(showTradeAsk.t);showTradeAsk.t=setTimeout(()=>{if(TR.ask&&TR.ask.peer===peer){soc('tradeDecline',{peer});hideTradeAsk();}},30000);}
function hideTradeAsk(){$('#tradeAsk').hidden=true;TR.ask=null;}
$('#taYes').addEventListener('click',()=>{if(TR.ask)soc('tradeAccept',{peer:TR.ask.peer});hideTradeAsk();});
$('#taNo').addEventListener('click',()=>{if(TR.ask)soc('tradeDecline',{peer:TR.ask.peer});hideTradeAsk();});
function returnTrade(){const t=TR.trade;TR.trade=null;if(!t)return;for(const e of t.mine.items)bagAdd(e);P.gold+=t.mine.gold;}
function sendOffer(){const m=TR.trade.mine;soc('tradeOffer',{items:m.items.map(wireEntry),gold:m.gold});refreshPanel();}
/* the trade window (v1.19.5): both offers side by side with where each player stands, steps 1-2-3, the bag as tiles
   (tap to add; a stack asks how many), gold with quick picks, and the next button at the bottom */
const trPic=id=>typeof itemIconURL==='function'?`<img src="${itemIconURL(id)}" alt="">`:icon(ITEMS[id]);
const trRow=(e,btn)=>`<div class="trrow">${trPic(e.id)}<span class="trtx"><b style="color:${rarityCol(e.id)}">${esc(itemName(e))}${e.n!==undefined&&e.n>1?` <span class="trn">×${e.n}</span>`:''}</b><small>${itemDesc(e)}</small></span>${btn||''}</div>`;
const trBadge=s=>s.ok?`<span class="trbadge ok">✓ Ready</span>`:s.locked?`<span class="trbadge lk">🔒 Locked</span>`:`<span class="trbadge">Adding…</span>`;
PANELS.trade=()=>{const t=TR.trade;if(!t)return '<p class="muted">No trade open.</p>';
  const st=t.state||{me:{},them:{items:[],gold:0}},me=st.me||{},them=st.them||{items:[],gold:0},lockedMe=!!me.locked;
  const step=!lockedMe?1:!them.locked?2:3;
  let h=`<h2>Trade with ${esc(t.name)}</h2>`;
  h+=`<div class="trsteps">${['Add items','Lock','Trade'].map((n,i)=>`<span class="${i+1===step?'on':i+1<step?'done':''}"><b>${i+1}</b>${n}</span>`).join('')}</div>`;
  const side=(who,s,items,gold,mine)=>`<div class="trside${s.locked?' locked':''}${mine?' mine':''}"><div class="trhead"><b>${who}</b>${trBadge(s)}</div>`+
    `<div class="trlist">${items.map((e,j)=>trRow(e,mine&&!lockedMe?`<button class="trx" data-act="tradeRemove" data-arg="${j}" aria-label="Take back">✕</button>`:'')).join('')||'<p class="muted trnone">Nothing yet</p>'}</div>`+
    `<div class="trgold"><span class="coin"></span>${fmt(gold)} gold</div></div>`;
  h+=`<div class="trboth">`+side('You',me,t.mine.items,t.mine.gold,true)+side(esc(t.name),them,them.items,them.gold,false)+`</div>`;
  if(!lockedMe){const max=P.gold+t.mine.gold;
    h+=`<div class="trgoldset"><label>Gold <input id="tGold" type="number" inputmode="numeric" min="0" max="${max}" value="${t.mine.gold}"></label>`+
      `<button class="btn small" data-act="tradeGold">Set</button></div><div class="trchips">${[['+100',100],['+1k',1000],['+10k',10000]].map(([l,v])=>`<button class="btn small trq" data-act="tradeGoldAdd" data-arg="${v}" ${t.mine.gold+v>max?'disabled':''}>${l}</button>`).join('')}`+
      `<button class="btn small trq" data-act="tradeGoldAdd" data-arg="max">All</button>${t.mine.gold?`<button class="btn small trq" data-act="tradeGoldAdd" data-arg="0">0</button>`:''}</div>`;
    const full=t.mine.items.length>=10;
    h+=`<h3 class="trbagh">Your bag <span class="muted">${full?'· the offer is full (10)':'· tap to add'}</span></h3><div class="trbag">`+
      (P.inv.map((e,i)=>`<button class="trtile" data-act="tradeAdd" data-arg="${i}" ${full?'disabled':''} title="${esc(itemName(e))}">${trPic(e.id)}${e.n!==undefined&&e.n>1?`<span class="trc">${e.n}</span>`:''}<span class="trnm" style="color:${rarityCol(e.id)}">${esc(itemName(e))}</span></button>`).join('')||'<p class="muted">Your bag is empty.</p>')+`</div>`;}
  h+=`<div class="tbtns trbar">`+(!lockedMe?`<button class="btn trmain" data-act="tradeLock">🔒 Lock my offer</button>`:
    me.ok?`<span class="muted">Waiting for ${esc(t.name)} to press Trade…</span>`:
    them.locked?`<button class="btn trmain go" data-act="tradeConfirm">✓ Trade</button>`:`<span class="muted">Waiting for ${esc(t.name)} to lock…</span>`)+
    `<button class="btn" data-act="tradeCancel">Cancel</button></div>`;
  return h;};
// add from the bag: a stack asks how many (from a tap), a single piece goes in at once
function tradeAddN(i,n){const t=TR.trade;if(!t||t.state&&t.state.me.locked||t.mine.items.length>=10)return;
  const e=bagTake(+i,n||0);if(!e)return;const same=e.n!==undefined&&t.mine.items.find(x=>x.id===e.id&&x.n!==undefined);if(same)same.n+=e.n;else t.mine.items.push(e);sendOffer();}
PANEL_ACTS.tradeAdd=(i,b)=>{const e=P.inv[+i];if(!e)return;
  if(b&&e.n!==undefined&&e.n>1&&typeof qtyAsk==='function')qtyAsk({id:e.id,max:e.n,def:e.n,verb:'Add'},v=>tradeAddN(+i,v));else tradeAddN(+i,e.n);};
PANEL_ACTS.tradeGoldAdd=arg=>{const t=TR.trade;if(!t||t.state&&t.state.me.locked)return;const max=P.gold+t.mine.gold;
  const want=arg==='max'?max:+arg===0?0:clamp(t.mine.gold+(+arg||0),0,max);P.gold+=t.mine.gold-want;t.mine.gold=want;sfx('coin');sendOffer();};
PANEL_ACTS.tradeRemove=j=>{const t=TR.trade;if(!t||t.state&&t.state.me.locked)return;const e=t.mine.items.splice(+j,1)[0];if(e)bagAdd(e);sendOffer();};
PANEL_ACTS.tradeGold=()=>{const t=TR.trade;if(!t||t.state&&t.state.me.locked)return;const want=clamp(Math.floor(+document.getElementById('tGold').value||0),0,P.gold+t.mine.gold);
  P.gold+=t.mine.gold-want;t.mine.gold=want;sendOffer();};
PANEL_ACTS.tradeLock=()=>soc('tradeLock',{});
PANEL_ACTS.tradeConfirm=()=>{const t=TR.trade;if(!t||!t.state)return;const inW=t.state.them.items.reduce((a,e)=>a+entryWeight(e),0);
  if(carryWeight()+inW>maxWeight()){addLog(`You cannot carry what ${t.name} is offering. Free up weight first.`,'l-bad');return;}soc('tradeConfirm',{});};
PANEL_ACTS.tradeCancel=()=>soc('tradeCancel',{});
PANEL_CLOSE.trade=()=>{if(TR.trade)soc('tradeCancel',{});};

/* ---- player shops ---- */
function returnShop(){const v=TR.vend;TR.vend=null;if(!v)return;for(const l of v.items)if(l.left>0)bagAdd(l.e.n!==undefined?{id:l.e.id,n:l.left}:l.e);}
function returnDraft(){for(const d of TR.draft)bagAdd(d.e);TR.draft=[];}
function closeShop(){if(!TR.vend)return;soc('vendClose',{});returnShop();addLog('Your shop is closed. Unsold items are back in your bag.');afterItemsChanged();}
setInterval(()=>{if(TR.vend&&(!P||!P.sitting||P.dead||!running))closeShop();},300);
/* v1.45.4 the shop setup is made for phones: your bag as a grid of tiles; tapping one opens a "Put on sale" card
   (how many with − / + / All, the price with − / + and quick picks from the shop price, the total); listed items are
   short rows with a ✕; "Open shop" stays at the bottom */
const vendBase=id=>Math.max(1,(ITEMS[id]&&ITEMS[id].price)||1);
const vendStep=p=>p>=10000?500:p>=1000?50:p>=100?10:1;
PANELS.vendsetup=()=>{const full=TR.draft.length>=12;
  let h=`<h2>Open a shop</h2><div class="sub">Put items on sale, then open your shop. You sit with a sign over your head; standing up closes it.</div>`;
  h+=`<div class="vwrap"><div class="vcolA">`;
  h+=`<label class="vsign"><span>Shop sign</span><input id="vTitle" maxlength="30" value="${esc(TR.pendingTitle||P.name+"'s shop")}" placeholder="${esc(P.name)}'s shop"></label>`;
  const worth=TR.draft.reduce((a,d)=>a+d.price*(d.e.n!==undefined?d.e.n:1),0);
  h+=`<h3>For sale <span class="vcount">${TR.draft.length}/12</span></h3>`;
  h+=TR.draft.length?`<div class="vlist">`+TR.draft.map((d,j)=>{const n=d.e.n!==undefined?d.e.n:1,it=ITEMS[d.e.id];
    return `<div class="vrow"><img class="vpic" src="${itemIconURL(d.e.id)}" alt=""><div class="vtx"><b>${esc(it.name)}${n>1?` <span class="muted">×${n}</span>`:''}</b>`+
      `<span><span class="gold">${fmt(d.price)}</span> each${n>1?` · ${fmt(d.price*n)} total`:''}</span></div>`+
      `<button class="vx" data-act="vendUnlist" data-arg="${j}" aria-label="Take ${esc(it.name)} back">✕</button></div>`;}).join('')+`</div><div class="vworth">If everything sells: <b class="gold">${fmt(worth)} gold</b></div>`
    :'<p class="muted vnone">Nothing on sale yet. Tap an item in your bag.</p>';
  h+=`</div><div class="vcolB">`;
  // the "Put on sale" card for the item you tapped
  const pi=TR.pick,pe=pi!=null&&P.inv[pi];
  if(pe){const it=ITEMS[pe.id],st=pe.n!==undefined,max=st?pe.n:1,base=vendBase(pe.id),q=Math.min(max,Math.max(1,TR.pickQ||max)),pr=Math.max(1,TR.pickP||base);
    h+=`<div class="vpick frame"><div class="vph"><img class="vpic big" src="${itemIconURL(pe.id)}" alt=""><div><b>${esc(it.name)}</b><span class="muted">${esc(it.desc||'')}</span></div></div>`+
      (st?`<div class="vfield"><span>How many <small class="muted">(you have ${max})</small></span><div class="vstep"><button class="btn small" data-act="vendQ" data-arg="-1" aria-label="One less">−</button>`+
        `<input class="tq" id="vqE" type="number" min="1" max="${max}" value="${q}" inputmode="numeric" aria-label="How many"><button class="btn small" data-act="vendQ" data-arg="1" aria-label="One more">+</button>`+
        `<button class="btn small ghost" data-act="vendQ" data-arg="all">All</button></div></div>`:'')+
      `<div class="vfield"><span>Price each <small class="muted">(shop price ${fmt(base)})</small></span><div class="vstep"><button class="btn small" data-act="vendP" data-arg="-" aria-label="Lower price">−</button>`+
        `<input class="tp" id="vpE" type="number" min="1" value="${pr}" inputmode="numeric" aria-label="Price each"><button class="btn small" data-act="vendP" data-arg="+" aria-label="Higher price">+</button></div>`+
        `<div class="vchips">${[[1,'Shop price'],[1.25,'+25%'],[1.5,'+50%'],[2,'×2']].map(([k,l])=>`<button class="btn small ghost${Math.round(base*k)===pr?' on':''}" data-act="vendP" data-arg="x${k}">${l}</button>`).join('')}</div></div>`+
      `<div class="vtotal">${st?`${q} × ${fmt(pr)} = `:''}<b class="gold">${fmt(q*pr)} gold</b></div>`+
      `<div class="tbtns"><button class="btn small ghost" data-act="vendPick" data-arg="">Cancel</button><button class="btn primary" data-act="vendList" data-arg="${pi}" ${full?'disabled':''}>${full?'Shop is full (12)':'Put on sale'}</button></div></div>`;}
  h+=`<h3>Your bag</h3>`;
  h+=P.inv.length?`<div class="vbag">`+P.inv.map((e,i)=>{const it=ITEMS[e.id];if(!it)return '';const n=e.n!==undefined?e.n:1;
    return `<button class="vtile${i===pi?' sel':''}" data-act="vendPick" data-arg="${i}" ${full?'disabled':''} aria-label="${esc(it.name)}${n>1?' ×'+n:''}"><img src="${itemIconURL(e.id)}" alt="">${n>1?`<span class="vn">${n}</span>`:''}<span class="vnm">${esc(it.name)}</span></button>`;}).join('')+`</div>`
    :'<p class="muted">Your bag is empty.</p>';
  h+=`</div>`;
  h+=`<div class="tbtns vopen"><button class="btn primary" data-act="vendOpen" ${TR.draft.length?'':'disabled'}>${TR.draft.length?`Open shop · ${TR.draft.length} item${TR.draft.length>1?'s':''}`:'Open shop'}</button></div></div>`;return h;};
PANEL_ACTS.vendsetup=()=>{if(TR.vend){addLog('Your shop is already open.');return;}if(TR.trade){addLog('Finish your trade first.','l-bad');return;}TR.pick=null;openPanel('vendsetup');};
const vendKeep=()=>{const t=document.getElementById('vTitle');if(t)TR.pendingTitle=t.value;const q=document.getElementById('vqE'),pr=document.getElementById('vpE');if(q)TR.pickQ=Math.floor(+q.value||1);if(pr)TR.pickP=Math.floor(+pr.value||1);};
PANEL_ACTS.vendPick=i=>{vendKeep();TR.pick=i===''||i==null||+i===TR.pick?null:+i;const e=TR.pick!=null&&P.inv[TR.pick];TR.pickQ=e&&e.n!==undefined?e.n:1;TR.pickP=e?vendBase(e.id):1;sfx('click');refreshPanel();
  if(TR.pick!=null)requestAnimationFrame(()=>{const c=panel.querySelector('.vpick');if(c&&c.scrollIntoView)c.scrollIntoView({block:'nearest',behavior:'smooth'});});};
PANEL_ACTS.vendQ=a=>{vendKeep();const e=P.inv[TR.pick];if(!e)return;const max=e.n!==undefined?e.n:1;TR.pickQ=a==='all'?max:Math.max(1,Math.min(max,(TR.pickQ||1)+(+a)));refreshPanel();};
PANEL_ACTS.vendP=a=>{vendKeep();const e=P.inv[TR.pick];if(!e)return;const base=vendBase(e.id),p=TR.pickP||base;
  TR.pickP=a[0]==='x'?Math.max(1,Math.round(base*+a.slice(1))):Math.max(1,p+(a==='+'?1:-1)*vendStep(p));refreshPanel();};
PANEL_ACTS.vendList=i=>{const qE=document.getElementById('vqE'),pE=document.getElementById('vpE'),qO=document.getElementById('vq'+i),pO=document.getElementById('vp'+i);
  const pEl=pE||pO,price=Math.floor(pEl?+pEl.value||0:vendBase((P.inv[+i]||{}).id));if(price<1){addLog('Set a price of at least 1 gold.','l-bad');return;}if(TR.draft.length>=12)return;
  const q=qE||qO,t=document.getElementById('vTitle');if(t)TR.pendingTitle=t.value;const e=bagTake(+i,q?+q.value:0);if(!e)return;TR.draft.push({e,price});TR.pick=null;afterItemsChanged();};
PANEL_ACTS.vendUnlist=j=>{const t=document.getElementById('vTitle');if(t)TR.pendingTitle=t.value;const d=TR.draft.splice(+j,1)[0];if(d)bagAdd(d.e);TR.pick=null;afterItemsChanged();};
PANEL_ACTS.vendOpen=()=>{if(!TR.draft.length)return;TR.pendingTitle=clean(document.getElementById('vTitle').value,30)||`${P.name}'s shop`;
  soc('vendOpen',{title:TR.pendingTitle,items:TR.draft.map(d=>({e:wireEntry(d.e),price:d.price}))});};
PANEL_CLOSE.vendsetup=()=>{if(TR.draft.length){returnDraft();afterItemsChanged();}};
PANELS.vendview=()=>{const v=TR.view;if(!v)return '<p class="muted">This shop is closed.</p>';
  let h=`<h2>${esc(v.title)}</h2><div class="sub">${esc(v.seller)}'s shop · you have ${fmt(P.gold)} gold</div>`;
  h+=v.items.map(x=>itemRow(x.e,(x.e.n!==undefined&&x.e.n>1?`<input class="tq" id="bq${x.k}" type="number" min="1" max="${x.e.n}" value="1" aria-label="How many">`:'')+
    `<span class="gold">${fmt(x.price)} each</span><button class="btn small" data-act="vendBuy" data-arg="${x.k}" ${P.gold<x.price?'disabled':''}>Buy</button>`)).join('')||'<p class="muted">Sold out.</p>';
  return h;};
PANEL_ACTS.vendBuy=k=>{const v=TR.view;if(!v)return;const x=v.items.find(i=>i.k===+k);if(!x)return;const q=document.getElementById('bq'+k);
  const n=x.e.n!==undefined?clamp(Math.floor(q?+q.value:1),1,x.e.n):1,total=x.price*n;
  if(P.gold<total){addLog(`You need ${fmt(total)} gold.`,'l-bad');return;}
  if(carryWeight()+itemWeight(x.e.id)*n>maxWeight()){addLog('Too heavy to carry that.','l-bad');return;}
  soc('vendBuy',{peer:v.peer,k:x.k,n});};

/* ---- the sign over a seller's head ---- */
function shopSign(x,y,title){ctx.font='800 11px "Alegreya Sans",sans-serif';const w=Math.min(150,ctx.measureText(title).width)+18,bx=x-w/2,by=y-86;
  ctx.fillStyle='#6b4423';ctx.fillRect(x-1,by+18,2,10);
  ctx.fillStyle='#f4e4c0';ctx.strokeStyle='#6b4423';ctx.lineWidth=2;ctx.beginPath();ctx.roundRect(bx,by,w,20,5);ctx.fill();ctx.stroke();
  ctx.fillStyle='#e0a030';ctx.beginPath();ctx.arc(bx+9,by+10,3.5,0,7);ctx.fill();
  ctx.fillStyle='#3a2410';ctx.textAlign='left';let t=title;while(ctx.measureText(t).width>w-17&&t.length>1)t=t.slice(0,-2)+'…';ctx.fillText(t,bx+15,by+14);}
function shopAt(sc){for(const [peer,o] of NET.others){if(!o.vd||o.z!==zoneId)continue;const p=proj(o.rx,o.ry);if(Math.abs(p.x-sc.x)<70&&sc.y>p.y-90&&sc.y<p.y+4)return peer;}return null;}
if(typeof TH!=='undefined'){Object.assign(TH,{'Add items':'ใส่ของ','Lock':'ล็อก','Trade':'แลกเปลี่ยน','Adding…':'กำลังใส่ของ…','✓ Ready':'✓ พร้อม','🔒 Locked':'🔒 ล็อกแล้ว',
  'You':'คุณ','Your bag':'กระเป๋าของคุณ','· tap to add':'· แตะเพื่อใส่','· the offer is full (10)':'· ใส่ครบแล้ว (10)','🔒 Lock my offer':'🔒 ล็อกข้อเสนอ','✓ Trade':'✓ แลกเปลี่ยน',
  'Set':'ตั้ง','All':'ทั้งหมด','Nothing yet':'ยังไม่มี','Gold':'โกลด์','Take back':'เอาคืน','No trade open.':'ไม่มีการแลกเปลี่ยน'});
  if(typeof TH_PAT!=='undefined')TH_PAT.unshift([/^Trade with (.+)$/,'แลกเปลี่ยนกับ $1'],[/^Waiting for (.+) to press Trade…$/,'รอ $1 กดแลกเปลี่ยน…'],[/^Waiting for (.+) to lock…$/,'รอ $1 ล็อกข้อเสนอ…']);}
