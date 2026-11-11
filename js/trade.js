"use strict";
/* ================= trading and player shops ================= */
// The game server referees both: see routes/embervale/trade.js in center-kitchen-backend.
// Items you put up for trade or sale leave your bag but stay yours (and are saved with you)
// until the trade completes or the item is sold.
const TR={trade:null,ask:null,vend:null,view:null,draft:[]};
const GEAR=['weapon','armor','head','accessory'];

/* ---- item helpers ---- */
function validEntry(e,forView){if(!e||typeof e!=='object'||typeof e.id!=='string'||!ITEMS[e.id])return null;const it=ITEMS[e.id];
  if(!GEAR.includes(it.type)){const n=clamp(Math.floor(fin(e.n)),0,30000);return n>=1?{id:e.id,n}:null;}
  const s=(Array.isArray(e.s)?e.s:[]).slice(0,it.slots||0).map(x=>typeof x==='string'&&ITEMS[x]&&ITEMS[x].type==='sigil'?x:null);
  while(s.length<(it.slots||0))s.push(null);
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
PANELS.trade=()=>{const t=TR.trade;if(!t)return '<p class="muted">No trade open.</p>';
  const st=t.state||{me:{},them:{items:[],gold:0}},lockedMe=!!st.me.locked;
  let h=`<h2>Trade with ${esc(t.name)}</h2><div class="sub">Add items and gold, lock your offer, then both press Trade.</div><div class="tgrid">`;
  h+=`<div class="tcol"><h3>You offer${lockedMe?' ✓':''}</h3>`+(t.mine.items.map((e,j)=>itemRow(e,lockedMe?'':`<button class="btn small" data-act="tradeRemove" data-arg="${j}">Remove</button>`)).join('')||'<p class="muted">Nothing yet.</p>')+
    `<div class="tgold">${fmt(t.mine.gold)} gold</div></div>`;
  h+=`<div class="tcol"><h3>${esc(t.name)} offers${st.them.locked?' ✓':''}</h3>`+(st.them.items.map(e=>itemRow(e)).join('')||'<p class="muted">Nothing yet.</p>')+`<div class="tgold">${fmt(st.them.gold)} gold</div></div></div>`;
  if(!lockedMe){
    h+=`<div class="trow"><label>Gold <input id="tGold" type="number" min="0" max="${P.gold+t.mine.gold}" value="${t.mine.gold}"></label><button class="btn small" data-act="tradeGold">Set gold</button></div>`;
    h+=`<h3>Your bag</h3>`+(P.inv.map((e,i)=>itemRow(e,(e.n!==undefined&&e.n>1?`<input class="tq" id="tq${i}" type="number" min="1" max="${e.n}" value="${e.n}" aria-label="How many">`:'')+`<button class="btn small" data-act="tradeAdd" data-arg="${i}" ${t.mine.items.length>=10?'disabled':''}>Add</button>`)).join('')||'<p class="muted">Your bag is empty.</p>');}
  h+=`<div class="tbtns">`+(!lockedMe?`<button class="btn" data-act="tradeLock">Lock offer</button>`:
    st.me.ok?`<span class="muted">Waiting for ${esc(t.name)} to press Trade…</span>`:
    st.them.locked?`<button class="btn" data-act="tradeConfirm">Trade</button>`:`<span class="muted">Waiting for ${esc(t.name)} to lock…</span>`)+
    `<button class="btn" data-act="tradeCancel">Cancel</button></div>`;
  return h;};
PANEL_ACTS.tradeAdd=i=>{const t=TR.trade;if(!t||t.state&&t.state.me.locked||t.mine.items.length>=10)return;const q=document.getElementById('tq'+i);
  const e=bagTake(+i,q?+q.value:0);if(!e)return;const same=e.n!==undefined&&t.mine.items.find(x=>x.id===e.id&&x.n!==undefined);if(same)same.n+=e.n;else t.mine.items.push(e);sendOffer();};
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
PANELS.vendsetup=()=>{
  let h=`<h2>Open a shop</h2><div class="sub">List items with a price each, then open your shop. You sit down with a sign over your head; standing up closes it.</div>`;
  h+=`<div class="trow"><label>Sign <input id="vTitle" maxlength="30" value="${esc(TR.pendingTitle||P.name+"'s shop")}"></label></div>`;
  h+=`<h3>For sale (${TR.draft.length}/12)</h3>`+(TR.draft.map((d,j)=>itemRow(d.e,`<span class="gold">${fmt(d.price)} each</span><button class="btn small" data-act="vendUnlist" data-arg="${j}">Remove</button>`)).join('')||'<p class="muted">Nothing listed yet.</p>');
  h+=`<h3>Your bag</h3>`+(P.inv.map((e,i)=>itemRow(e,(e.n!==undefined&&e.n>1?`<input class="tq" id="vq${i}" type="number" min="1" max="${e.n}" value="${e.n}" aria-label="How many">`:'')+
    `<input class="tp" id="vp${i}" type="number" min="1" value="${Math.max(1,ITEMS[e.id].price||1)}" aria-label="Price each"><button class="btn small" data-act="vendList" data-arg="${i}" ${TR.draft.length>=12?'disabled':''}>List</button>`)).join('')||'<p class="muted">Your bag is empty.</p>');
  h+=`<div class="tbtns"><button class="btn" data-act="vendOpen" ${TR.draft.length?'':'disabled'}>Open shop</button></div>`;return h;};
PANEL_ACTS.vendsetup=()=>{if(TR.vend){addLog('Your shop is already open.');return;}if(TR.trade){addLog('Finish your trade first.','l-bad');return;}openPanel('vendsetup');};
PANEL_ACTS.vendList=i=>{const price=Math.floor(+document.getElementById('vp'+i).value||0);if(price<1){addLog('Set a price of at least 1 gold.','l-bad');return;}
  const q=document.getElementById('vq'+i);TR.pendingTitle=document.getElementById('vTitle').value;const e=bagTake(+i,q?+q.value:0);if(!e)return;TR.draft.push({e,price});afterItemsChanged();};
PANEL_ACTS.vendUnlist=j=>{TR.pendingTitle=document.getElementById('vTitle').value;const d=TR.draft.splice(+j,1)[0];if(d)bagAdd(d.e);afterItemsChanged();};
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
