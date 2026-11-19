"use strict";
/* ================= Stage 8: the pushcart =================
   Rent a pushcart once from Wenna the Keeper (Warehouse). It carries a second load of
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

PANELS.cart=()=>{if(!hasCart())return `<h2>Pushcart</h2><p class="say">You don't have a pushcart. Wenna the Keeper in Hearthvale rents them out for ${fmt(CART_PRICE)} gold.</p>`;
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
/* the cart follows behind the hero in the hero's 4 directions (down-right, down-left, up-right, up-left, from the
   hero's facing and back view): it trails diagonally behind, turned at an angle, the handle reaches the hero's hand,
   and when the hero walks up the screen the cart is nearer the camera, so it is drawn in front of the hero */
const CART8=new Map();
function cartHeading(p){const d=typeof heroDir4==='function'?heroDir4(p):(p.back?(p.face<0?5:7):(p.face<0?3:1));CART8.set(p===P?'me':(p.name||'?'),{d});return d;}
function drawCart(p,d){if(d===undefined)d=cartHeading(p);
  const a=d*Math.PI/4,ux=Math.cos(a),uy=Math.sin(a),dist=24,x=p.x-ux*dist,y=p.y+3-uy*dist*(uy>.5?1.05:.8),spin=(p.moving?now*9:0);
  const side=d===0||d===4,end=d===2||d===6,f=ux<-.1?-1:1;
  shadow(x,y,13);ctx.save();ctx.lineJoin='round';ctx.lineCap='round';
  // the handle: from the cart's front edge to the hero's hand
  const hw=side?12:end?7:10,fx=x+ux*hw,fy=y-12+uy*(end?3:2);
  ctx.strokeStyle='#4a2c12';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(fx,fy);ctx.lineTo(p.x-ux*5,p.y-15);ctx.stroke();
  ctx.strokeStyle='#8a5a2c';ctx.lineWidth=1.6;ctx.stroke();
  const wheel=(wx,wy,rx)=>{ctx.fillStyle='#3a2410';ctx.strokeStyle='#1a1008';ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(wx,wy,rx,5,0,0,7);ctx.fill();ctx.stroke();
    if(rx>2.5){ctx.strokeStyle='#c89a5a';ctx.lineWidth=1;for(let k=0;k<3;k++){const b=spin+k*1.047;ctx.beginPath();ctx.moveTo(wx-Math.cos(b)*rx*.8,wy-Math.sin(b)*4);ctx.lineTo(wx+Math.cos(b)*rx*.8,wy+Math.sin(b)*4);ctx.stroke();}}
    else{ctx.fillStyle='#c89a5a';ctx.fillRect(wx-.5,wy-4,1,8);}};
  // box size seen from this direction: long side-on, short end-on, between at an angle
  const bw=side?24:end?16:20,sk=side||end?0:(uy>0?-1:1)*f*3;
  // the far wheels first (seen end-on there is one at each side, behind the box)
  if(end){wheel(x-9,y-5,1.6);wheel(x+9,y-5,1.6);}
  else if(!side){wheel(x+f*6+sk,y-7,3.6);}
  // the box: front face, then the top with the load
  ctx.fillStyle='#8a5a2c';ctx.strokeStyle='#4a2c12';ctx.lineWidth=1.4;ctx.beginPath();
  ctx.moveTo(x-bw/2,y-8);ctx.lineTo(x+bw/2,y-8);ctx.lineTo(x+bw/2+sk,y-20);ctx.lineTo(x-bw/2+sk,y-20);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.strokeStyle='rgba(60,34,14,.7)';ctx.lineWidth=1;for(const k of side?[-4,4]:end?[0]:[-3,3]){ctx.beginPath();ctx.moveTo(x+k,y-8);ctx.lineTo(x+k+sk,y-20);ctx.stroke();}
  if(!side){ctx.fillStyle='#a8743c';ctx.beginPath();ctx.moveTo(x-bw/2+sk,y-20);ctx.lineTo(x+bw/2+sk,y-20);ctx.lineTo(x+bw/2+sk*1.4,y-23);ctx.lineTo(x-bw/2+sk*1.4,y-23);ctx.closePath();ctx.fill();ctx.strokeStyle='#4a2c12';ctx.lineWidth=1.2;ctx.stroke();}
  ctx.fillStyle='#c89a5a';ctx.fillRect(x-bw/2+1+sk,y-22.5,bw-2,2.5);
  ctx.fillStyle='#d8b070';ctx.beginPath();ctx.ellipse(x-bw*.17+sk,y-22.5,bw*.21,3,0,0,7);ctx.fill();ctx.fillStyle='#b07a3a';ctx.beginPath();ctx.ellipse(x+bw*.2+sk,y-23.5,bw*.17,3,0,0,7);ctx.fill();
  // the near wheels
  if(side){wheel(x-7,y-5,5);wheel(x+7,y-5,5);}
  else if(!end){wheel(x-f*6,y-5,4.2);}
  ctx.restore();}
// behind the hero, or in front when the hero walks up the screen (the cart is then nearer the camera)
{const _dpCart=drawPlayer;drawPlayer=function(p,wid){let show=false,d=0;try{show=(p===P?cartPresence():!!p.ct)&&!p.dead&&!p.sitting;if(show)d=cartHeading(p);}catch(e){show=false;}
  const front=show&&(d===5||d===7);if(show&&!front)try{drawCart(p,d);}catch(e){}
  const r=_dpCart.apply(this,arguments);if(front)try{drawCart(p,d);}catch(e){}return r;};}
