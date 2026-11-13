"use strict";
/* ================= Stage 8: the pushcart =================
   Rent a pushcart once from Wenna the Keeper (Warehouse) or Banker Ivo (Royal Bank). It carries a second load of
   up to CART_MAX stacks and CART_WEIGHT weight that does not count against your bag, and you can use it anywhere
   (Items window → Cart, or /cart). It rolls along behind you, and other players see it (presence field ct). */
const CART_PRICE=2500,CART_MAX=100,CART_WEIGHT=8000;
const hasCart=()=>!!(P&&Array.isArray(P.cart));
const cartWeight=()=>hasCart()?P.cart.reduce((a,e)=>a+itemWeight(e.id)*(e.n||1),0):0;
function cartPresence(){return hasCart()&&!(typeof riding==='function'&&riding());}
// one entry into the cart (stacking like items): true when it fit
function cartPut(e){if(!hasCart())return false;if(cartWeight()+itemWeight(e.id)*(e.n||1)>CART_WEIGHT){addLog(`Your cart cannot hold that much weight (${fmt(CART_WEIGHT)}).`,'l-bad');return false;}
  const st=e.n!==undefined?P.cart.find(x=>x.id===e.id&&x.n!==undefined):null;if(st){st.n+=e.n;return true;}
  if(P.cart.length>=CART_MAX){addLog(`Your cart is full (${CART_MAX} stacks).`,'l-bad');return false;}P.cart.push(e);return true;}

PANELS.cart=()=>{if(!hasCart())return `<h2>Pushcart</h2><p class="say">You don't have a pushcart. Wenna the Keeper in Hearthvale or Banker Ivo in Aurelmark rent them out for ${fmt(CART_PRICE)} gold.</p>`;
  const row=(e,i,act,label)=>`<div class="row">${icon(ITEMS[e.id])}<div class="grow"><div class="nm" style="color:${rarityCol(e.id)}">${esc(itemName(e))}${e.n!==undefined?` <span class="muted">×${e.n}</span>`:''}</div></div><button class="btn small" data-act="${act}" data-arg="${i}">${label}</button></div>`;
  let h=`<h2>🛒 Pushcart</h2><div class="sub">Cart ${P.cart.length}/${CART_MAX} · cart weight ${fmt(cartWeight())}/${fmt(CART_WEIGHT)} · bag ${fmt(carryWeight())}/${fmt(maxWeight())}</div>`;
  h+=`<h3>Your bag</h3>`;const bag=P.inv.map((e,i)=>[e,i]);h+=bag.length?bag.map(([e,i])=>row(e,i,'cartin','Put in')).join(''):`<p class="muted">Empty.</p>`;
  h+=`<h3>In the cart</h3>`;h+=P.cart.length?P.cart.map((e,i)=>row(e,i,'cartout','Take')).join(''):`<p class="muted">Nothing in the cart yet. Loot, potions and spare gear can ride here.</p>`;
  return h;};
PANEL_ACTS.cartin=i=>{const e=P.inv[+i];if(!e||!hasCart())return;if(!cartPut(e))return;P.inv.splice(+i,1);sfx('click');rebuildHotbar();refreshPanel();save();};
PANEL_ACTS.cartout=i=>{const e=hasCart()&&P.cart[+i];if(!e)return;if(carryWeight()+itemWeight(e.id)*(e.n||1)>maxWeight()){addLog(`Too heavy to carry ${itemName(e)}.`,'l-bad');return;}
  P.cart.splice(+i,1);const bag=e.n!==undefined?invFind(e.id):null;if(bag)bag.n+=e.n;else P.inv.push(e);sfx('click');rebuildHotbar();refreshPanel();save();};
PANEL_ACTS.cartrent=()=>{if(hasCart()||P.gold<CART_PRICE)return;P.gold-=CART_PRICE;P.cart=[];sfx('coin');fx.push({k:'ring',x:P.x,y:P.y,r:36,col:'#c8a060',t0:now,dur:.6});
  addLog(`You rent a pushcart for ${fmt(CART_PRICE)} gold. Open it from the Items window or with /cart.`,'l-good');refreshPanel();save();};
PANEL_ACTS.opencart=()=>openPanel('cart');

// the storage keepers rent carts; the Items window gets a Cart button
{const _rpCart=refreshPanel;refreshPanel=function(){const r=_rpCart.apply(this,arguments);try{
  if(panelKind==='storage'&&P){const say=panel.querySelector('.say');const html=hasCart()?`<div class="row cartoffer"><div class="grow"><div class="nm">🛒 Your pushcart</div><div class="ds">${P.cart.length}/${CART_MAX} stacks · ${fmt(cartWeight())}/${fmt(CART_WEIGHT)} weight</div></div><button class="btn small" data-act="opencart">Open</button></div>`
      :`<div class="row cartoffer"><div class="grow"><div class="nm">🛒 Rent a pushcart</div><div class="ds">A second load that rolls along behind you: ${CART_MAX} stacks, ${fmt(CART_WEIGHT)} weight, usable anywhere. Yours to keep.</div></div><span class="gold">${fmt(CART_PRICE)}</span><button class="btn small" data-act="cartrent" ${P.gold>=CART_PRICE?'':'disabled'}>Rent</button></div>`;
    if(say&&!panel.querySelector('.cartoffer'))say.insertAdjacentHTML('afterend',html);}
  if(panelKind==='items'&&hasCart()&&!panel.querySelector('.cartbtn')){const h2=panel.querySelector('h2');if(h2)h2.insertAdjacentHTML('afterend',`<div class="tbtns cartbtn" style="justify-content:flex-start;margin:4px 0"><button class="btn small" data-act="opencart">🛒 Cart <span class="muted">${P.cart.length}/${CART_MAX}</span></button></div>`);}
}catch(e){}return r;};}
if(typeof chatCommand==='function'){const _ccCart=chatCommand;chatCommand=function(k,arg){if(k==='cart'){openPanel('cart');return true;}return _ccCart.apply(this,arguments);};}

// drawn behind the hero: a little wooden cart whose wheels turn as you walk
function drawCart(p){const f=p.face<0?-1:1,x=p.x-f*24,y=p.y+3,spin=(p.moving?now*9:0);
  shadow(x,y,13);ctx.save();ctx.lineJoin='round';
  ctx.strokeStyle='#5a3a1c';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x+f*9,y-11);ctx.lineTo(p.x-f*6,y-16);ctx.stroke(); // the handle
  ctx.fillStyle='#8a5a2c';ctx.strokeStyle='#4a2c12';ctx.lineWidth=1.4;ctx.beginPath();ctx.roundRect(x-12,y-20,24,12,2);ctx.fill();ctx.stroke();
  ctx.strokeStyle='rgba(60,34,14,.7)';ctx.lineWidth=1;for(const k of [-4,4]){ctx.beginPath();ctx.moveTo(x+k,y-20);ctx.lineTo(x+k,y-8);ctx.stroke();}
  ctx.fillStyle='#c89a5a';ctx.fillRect(x-11,y-22,22,2.5); // load on top
  ctx.fillStyle='#d8b070';ctx.beginPath();ctx.ellipse(x-4,y-22,5,3,0,0,7);ctx.fill();ctx.fillStyle='#b07a3a';ctx.beginPath();ctx.ellipse(x+5,y-23,4,3,0,0,7);ctx.fill();
  for(const wx of [x-7,x+7]){ctx.fillStyle='#3a2410';ctx.beginPath();ctx.arc(wx,y-5,5,0,7);ctx.fill();ctx.strokeStyle='#c89a5a';ctx.lineWidth=1;
    for(let k=0;k<3;k++){const a=spin+k*1.047;ctx.beginPath();ctx.moveTo(wx-Math.cos(a)*4,y-5-Math.sin(a)*4);ctx.lineTo(wx+Math.cos(a)*4,y-5+Math.sin(a)*4);ctx.stroke();}}
  ctx.restore();}
{const _dpCart=drawPlayer;drawPlayer=function(p,wid){try{const show=p===P?cartPresence():!!p.ct;if(show&&!p.dead&&!p.sitting)drawCart(p);}catch(e){}return _dpCart.apply(this,arguments);};}
