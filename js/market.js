"use strict";
/* ================= the Market Board (v1.20.0) =================
   Sell to players who are not online: list an item with a price (up to 8 at a time), and anyone can buy it later.
   The game server holds listed items (routes/embervale/market.js): a purchase is one atomic step, so two buyers can
   never get the same item, and the price goes to the seller's purse, collected here next time. Listing needs an
   account; guests can browse and buy. Opened from Ilsa's General Store (Market Board button) or with /market.
   An item being listed stays in your save (pendingEscrow) until the server confirms it, so nothing is lost. */
const MK={tab:'browse',q:'',board:null,pend:{},ref:0,sel:null,price:0,buyAsk:null,busy:false};
const mkSock=()=>typeof NET!=='undefined'&&NET.sock&&NET.sock.connected?NET.sock:null;
function mkSend(ev,m){const s=mkSock();if(!s){addLog('The market needs a connection to the game server.','l-bad');return false;}s.emit(ev,m||{});return true;}
function mkAttach(s){if(!s||s.__mk||typeof s.on!=='function')return;s.__mk=1;
  s.on('mkBoard',b=>{if(!b||!Array.isArray(b.items))return;
    const fix=l=>{const e=validEntry(l&&l.e,true);return e?{k:String(l.k),e,price:clamp(Math.floor(fin(l.price)),1,1e9),seller:clean(l.seller,16),mine:!!l.mine}:null;};
    MK.board={items:b.items.slice(0,120).map(fix).filter(Boolean),mine:(Array.isArray(b.mine)?b.mine:[]).slice(0,20).map(fix).filter(Boolean),
      purse:b.purse?{gold:clamp(Math.floor(fin(b.purse.gold)),0,1e12),log:(Array.isArray(b.purse.log)?b.purse.log:[]).slice(0,20).map(x=>({e:validEntry(x&&x.e,true),price:clamp(Math.floor(fin(x&&x.price)),0,1e9),buyer:clean(x&&x.buyer,16)})).filter(x=>x.e)}:null,
      account:!!b.account,max:clamp(Math.floor(fin(b.max)),1,50)||8};
    MK.at=Date.now();MK.busy=false;if(panelKind==='market')refreshPanel();});
  s.on('mkPosted',m=>{const e=MK.pend[m&&m.ref];if(!e)return;delete MK.pend[m.ref];addLog(`Listed ${entryLabel(e)} on the Market Board.`,'l-good');sfx('coin');save(true);});
  s.on('mkError',m=>{const r=m&&m.ref,e=r&&MK.pend[r];if(e){delete MK.pend[r];bagAdd(e);afterItemsChanged();}MK.busy=false;
    addLog(clean(m&&m.error,140)||'The market could not do that.','l-bad');if(panelKind==='market')refreshPanel();});
  s.on('mkBought',m=>{const e=validEntry(m&&m.e);if(!e)return;const price=clamp(Math.floor(fin(m.price)),0,1e9);P.gold=Math.max(0,P.gold-price);bagAdd(e);
    addLog(`Bought ${entryLabel(e)} from ${clean(m.seller,16)||'the market'} for ${fmt(price)} gold.`,'l-loot');sfx('coin');afterItemsChanged();});
  s.on('mkReturned',m=>{const e=validEntry(m&&m.e);if(!e)return;bagAdd(e);addLog(`${entryLabel(e)} is back in your bag.`,'l-good');afterItemsChanged();});
  s.on('mkClaimed',m=>{const g=clamp(Math.floor(fin(m&&m.gold)),0,1e12);if(!g)return;P.gold+=g;addLog(`Collected ${fmt(g)} gold from your market sales.`,'l-loot');sfx('coin');afterItemsChanged();});
  s.on('mkSold',m=>{const e=validEntry(m&&m.e,true);if(!e)return;addLog(`★ ${clean(m.buyer,16)} bought your ${entryLabel(e)} for ${fmt(clamp(Math.floor(fin(m.price)),0,1e9))} gold. Collect it at the Market Board.`,'l-rare');sfx('coin');});}
setInterval(()=>{const s=typeof NET!=='undefined'&&NET.sock;if(s&&!s.__mk)mkAttach(s);},1000);
// items on their way to the board stay in your save until the server confirms them
if(typeof pendingEscrow==='function'){const _peM=pendingEscrow;pendingEscrow=function(){const r=_peM.apply(this,arguments);r.items.push(...Object.values(MK.pend));return r;};}

function mkOpen(){openPanel('market');MK.busy=true;mkSend('mkBrowse');}
const mkPic=id=>typeof itemIconURL==='function'?`<img src="${itemIconURL(id)}" alt="">`:icon(ITEMS[id]);
const mkRow=(l,btn)=>`<div class="trrow mkrow">${mkPic(l.e.id)}<span class="trtx"><b style="color:${rarityCol(l.e.id)}">${esc(itemName(l.e))}${l.e.n!==undefined&&l.e.n>1?` <span class="trn">×${l.e.n}</span>`:''}</b><small>${itemDesc(l.e)}</small><small class="mkby">${esc(l.seller)}</small></span><span class="mkprice">${fmt(l.price)}<i class="coin"></i></span>${btn||''}</div>`;
PANELS.market=()=>{const b=MK.board;let h=`<h2>Market Board</h2><div class="sub">Sell to players who are not online, and buy what they left. You have <span class="gold">${fmt(P.gold)}</span> gold.</div>`;
  const nMine=b?b.mine.length:0,purse=b&&b.purse?b.purse.gold:0;
  h+=`<div class="tabs">${[['browse','Browse'],['sell','Sell'],['mine',`My listings${nMine?' ('+nMine+')':''}${purse?' ●':''}`]].map(([k,l])=>`<button class="btn small ${MK.tab===k?'on':''}" data-act="mktab" data-arg="${k}">${esc(l)}</button>`).join('')}</div>`;
  if(!mkSock())return h+`<p class="muted">The market needs a connection to the game server. Try again in a moment.</p>`;
  if(!b)return h+`<p class="muted">Loading the board…</p>`;
  if(MK.tab==='browse'){
    h+=`<div class="mksearch"><input id="mkQ" type="search" placeholder="Search items" value="${esc(MK.q)}" aria-label="Search items"></div>`;
    const q=MK.q.trim().toLowerCase(),list=b.items.filter(l=>!q||itemName(l.e).toLowerCase().includes(q));
    h+=`<div class="mklist">`+(list.map(l=>{const ask=MK.buyAsk===l.k,can=P.gold>=l.price;
      const btn=l.mine?`<span class="mktag">yours</span>`:`<button class="btn small${ask?' mkgo':''}" data-act="mkbuy" data-arg="${l.k}" ${can?'':'disabled'}>${ask?'Confirm':'Buy'}</button>`;
      return mkRow(l,btn);}).join('')||`<p class="muted">${q?'Nothing matches.':'Nothing is for sale yet. Be the first: open Sell.'}</p>`)+`</div>`;}
  else if(MK.tab==='sell'){
    if(!b.account)return h+`<p class="muted">Selling on the market needs an account, so your items are kept safe while they wait for a buyer. Log in from the title screen.</p>`;
    if(nMine>=b.max)return h+`<p class="muted">You have ${nMine} items listed, the most at a time. Take one back or wait for a sale.</p>`;
    const sel=MK.sel!=null?P.inv[MK.sel]:null;
    if(sel){const n=sel.n!==undefined?Math.min(sel.n,MK.n||sel.n):undefined,base=Math.max(1,Math.round((ITEMS[sel.id].price||sellValue(sel.id)*2||10)*(n||1)));
      h+=`<div class="mksell">${mkPic(sel.id)}<span class="trtx"><b style="color:${rarityCol(sel.id)}">${esc(itemName(sel))}${n?` ×${n}`:''}</b><small>${itemDesc(sel)}</small></span></div>`+
        `<div class="trgoldset"><label>Price <input id="mkPrice" type="number" inputmode="numeric" min="1" max="1000000000" value="${MK.price||base}"></label><span class="muted mkhint">store price ${fmt(base)}</span></div>`+
        `<div class="tbtns"><button class="btn trmain" data-act="mkpost">List for sale</button><button class="btn" data-act="mkunsel">Back</button></div>`;}
    else{h+=`<h3 class="trbagh">Your bag <span class="muted">· tap an item to sell (${nMine}/${b.max} listed)</span></h3><div class="trbag">`+
      (P.inv.map((e,i)=>`<button class="trtile" data-act="mksel" data-arg="${i}" title="${esc(itemName(e))}">${mkPic(e.id)}${e.n!==undefined&&e.n>1?`<span class="trc">${e.n}</span>`:''}<span class="trnm" style="color:${rarityCol(e.id)}">${esc(itemName(e))}</span></button>`).join('')||'<p class="muted">Your bag is empty.</p>')+`</div>`;}}
  else{
    if(!b.account)return h+`<p class="muted">Log in to sell on the market.</p>`;
    const p=b.purse||{gold:0,log:[]};
    h+=`<div class="mkpurse"><span>Sales waiting: <b class="gold">${fmt(p.gold)}</b> gold</span><button class="btn small trmain go" data-act="mkclaim" ${p.gold?'':'disabled'}>Collect</button></div>`;
    h+=`<h3>For sale (${nMine}/${b.max})</h3><div class="mklist">`+(b.mine.map(l=>mkRow(l,`<button class="btn small" data-act="mkcancel" data-arg="${l.k}">Take back</button>`)).join('')||'<p class="muted">Nothing listed. Open Sell to put something up.</p>')+`</div>`;
    if(p.log.length)h+=`<h3>Recent sales</h3>`+p.log.map(x=>`<div class="ds">${esc(x.buyer||'Someone')} bought ${esc(entryLabel(x.e))} for ${fmt(x.price)} gold</div>`).join('');}
  return h;};
PANEL_ACTS.mktab=k=>{MK.tab=k;MK.buyAsk=null;MK.sel=null;MK.price=0;refreshPanel();if(mkSock()&&Date.now()-(MK.at||0)>4000)mkSend('mkBrowse');};
PANEL_ACTS.mkbuy=k=>{const l=MK.board&&MK.board.items.find(x=>x.k===k);if(!l||l.mine)return;
  if(MK.buyAsk!==k){MK.buyAsk=k;refreshPanel();return;} // a second tap confirms
  MK.buyAsk=null;if(P.gold<l.price){addLog('Not enough gold.','l-bad');return;}
  if(carryWeight()+entryWeight(l.e)>maxWeight()){addLog(`You cannot carry ${itemName(l.e)}: too heavy.`,'l-bad');return;}
  mkSend('mkBuy',{k,price:l.price});refreshPanel();};
PANEL_ACTS.mksel=i=>{const e=P.inv[+i];if(!e)return;MK.price=0;MK.n=0;
  if(e.n!==undefined&&e.n>1&&typeof qtyAsk==='function')qtyAsk({id:e.id,max:e.n,def:e.n,verb:'Sell'},v=>{MK.sel=+i;MK.n=v;refreshPanel();});
  else{MK.sel=+i;refreshPanel();}};
PANEL_ACTS.mkunsel=()=>{MK.sel=null;refreshPanel();};
PANEL_ACTS.mkpost=()=>{const i=MK.sel,e0=P.inv[i];if(e0==null)return;const price=clamp(Math.floor(+(document.getElementById('mkPrice')||{}).value||0),1,1e9);
  if(!mkSock())return mkSend('mkPost');const e=bagTake(i,e0.n!==undefined?(MK.n||e0.n):0);if(!e)return;
  const ref='m'+(++MK.ref)+Date.now().toString(36);MK.pend[ref]=e;MK.sel=null;MK.tab='mine';
  mkSend('mkPost',{e:wireEntry(e),price,ref});afterItemsChanged();};
PANEL_ACTS.mkcancel=k=>mkSend('mkCancel',{k});
PANEL_ACTS.mkclaim=()=>mkSend('mkClaim');
// search as you type (keeps the cursor in the box)
document.addEventListener('input',ev=>{if(ev.target&&ev.target.id==='mkQ'){MK.q=ev.target.value;const pos=ev.target.selectionStart;refreshPanel();const q=document.getElementById('mkQ');if(q){q.focus();try{q.setSelectionRange(pos,pos);}catch(e){}}}});
document.addEventListener('input',ev=>{if(ev.target&&ev.target.id==='mkPrice')MK.price=Math.floor(+ev.target.value||0);});

// ways in: a button in Ilsa's General Store, and /market
{const _rpM=refreshPanel;refreshPanel=function(){const r=_rpM.apply(this,arguments);try{if(panelKind==='shop'&&!panel.querySelector('.mkopen')){const h2=panel.querySelector('h2');
  if(h2)h2.insertAdjacentHTML('afterend',`<button class="btn small mkopen" data-act="mkopen"><i class="coin"></i> Market Board: buy and sell with players</button>`);}}catch(e){}return r;};}
PANEL_ACTS.mkopen=()=>mkOpen();
if(typeof chatCommand==='function'){const _ccM=chatCommand;chatCommand=function(k,arg){if(k==='market'||k==='mk'){mkOpen();return true;}return _ccM.apply(this,arguments);};
  if(typeof CMD_HELP!=='undefined')CMD_HELP.push(['/market','open the Market Board']);}

(()=>{const st=document.createElement('style');st.textContent=`
.mkopen{display:block;width:100%;margin:4px 0 8px;font-weight:700}
.mksearch input{width:100%;box-sizing:border-box;padding:8px 10px;margin:4px 0 8px;background:#0b0e13;border:1px solid var(--edge-dim);border-radius:7px;color:var(--ink);font:inherit}
.mklist{display:flex;flex-direction:column;gap:2px}.mkrow{padding:6px 0}.mkby{color:#9fb8d8!important}
.mkprice{flex:none;display:flex;align-items:center;gap:4px;color:#ffd76a;font-weight:800;font-size:13.5px;margin-right:4px}
.mkprice .coin,.trgold .coin,.mkopen .coin{display:inline-block;width:11px;height:11px;border-radius:50%;background:radial-gradient(circle at 35% 35%,#fff0a0,#e8b030 60%,#a07010)}
.mkgo{background:#3f8a4c;border-color:#62bf86;color:#fff}.mktag{flex:none;font-size:11px;color:#8a93a3;padding:0 6px}
.mksell{display:flex;align-items:center;gap:10px;margin:8px 0;padding:10px;border:1px solid var(--edge-dim);border-radius:10px;background:#10141b}.mksell img{width:44px;height:44px}
.mkhint{font-size:12px}.mkpurse{display:flex;align-items:center;justify-content:space-between;gap:8px;margin:8px 0;padding:10px;border:1px solid #e8c25a;border-radius:10px;background:#2a2412}
.mkpurse .trmain{flex:none}`;document.head.appendChild(st);})();

if(typeof TH!=='undefined'){Object.assign(TH,{'Market Board':'กระดานตลาด','Browse':'เลือกซื้อ','Sell':'ขาย','Buy':'ซื้อ','Confirm':'ยืนยัน','yours':'ของคุณ','Search items':'ค้นหาไอเทม',
  'Nothing matches.':'ไม่พบไอเทม','Nothing is for sale yet. Be the first: open Sell.':'ยังไม่มีของขาย ลงขายเป็นคนแรกได้ที่แท็บขาย','List for sale':'ลงขาย','Back':'กลับ','Price':'ราคา',
  'Take back':'เอาคืน','Collect':'รับเงิน','Recent sales':'ขายล่าสุด','Market Board: buy and sell with players':'กระดานตลาด: ซื้อขายกับผู้เล่น',
  'Loading the board…':'กำลังโหลดกระดาน…','Your bag':'กระเป๋าของคุณ','Not enough gold.':'โกลด์ไม่พอ','Log in to sell on the market.':'เข้าสู่ระบบเพื่อขายในตลาด',
  'Nothing listed. Open Sell to put something up.':'ยังไม่ได้ลงขาย ไปที่แท็บขายเพื่อลงขาย',
  'Selling on the market needs an account, so your items are kept safe while they wait for a buyer. Log in from the title screen.':'การขายในตลาดต้องมีบัญชี เพื่อเก็บไอเทมของคุณไว้อย่างปลอดภัยระหว่างรอผู้ซื้อ เข้าสู่ระบบจากหน้าแรก',
  'The market needs a connection to the game server. Try again in a moment.':'ตลาดต้องเชื่อมต่อกับเซิร์ฟเวอร์เกม ลองใหม่อีกสักครู่'});
  if(typeof TH_PAT!=='undefined')TH_PAT.unshift([/^Sell to players who are not online, and buy what they left\. You have (.+) gold\.$/,'ขายให้ผู้เล่นที่ไม่ได้ออนไลน์ และซื้อของที่คนอื่นลงขายไว้ คุณมี $1 โกลด์'],
    [/^My listings(.*)$/,'ของที่ลงขาย$1'],[/^Sales waiting: (.+) gold$/,'ยอดขายรอรับ: $1 โกลด์'],[/^For sale \((\d+)\/(\d+)\)$/,'กำลังขาย ($1/$2)'],
    [/^· tap an item to sell \((\d+)\/(\d+) listed\)$/,'· แตะไอเทมเพื่อขาย (ลงขาย $1/$2)'],[/^store price (.+)$/,'ราคาร้าน $1'],
    [/^(.+) bought (.+) for (.+) gold$/,'$1 ซื้อ $2 ราคา $3 โกลด์'],[/^Bought (.+) from (.+) for (.+) gold\.$/,'ซื้อ $1 จาก $2 ราคา $3 โกลด์'],
    [/^Listed (.+) on the Market Board\.$/,'ลงขาย $1 ในกระดานตลาดแล้ว'],[/^Collected (.+) gold from your market sales\.$/,'รับเงิน $1 โกลด์จากการขายในตลาด'],
    [/^(.+) is back in your bag\.$/,'$1 กลับเข้ากระเป๋าแล้ว'],[/^★ (.+) bought your (.+) for (.+) gold\. Collect it at the Market Board\.$/,'★ $1 ซื้อ $2 ของคุณ ราคา $3 โกลด์ ไปรับเงินที่กระดานตลาด']);}
