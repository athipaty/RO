"use strict";
/* ================= Weight warning (v1.44.0) =================
   Carrying 90% or more of the weight limit stops all attacks (combat.js P.heavy===2). Until now the only sign was a
   small "Too heavy!" float and a chat line, easy to miss in auto-hunt. Now:
   - a slim chip at the top of the screen (never blocks play): red at 90%+ "Too heavy to attack", amber at 80-89%
     "Bag almost full"; tapping it opens the Items window
   - a red weight sign over the hero's head while too heavy to attack
   - one short buzz on phones when the hero becomes too heavy */
const OW={lvl:0,pct:0,el:null,buzzed:false};
function owPct(){try{const m=maxWeight();return m>0?carryWeight()/m:0;}catch(e){return 0;}}
function owChip(){
  const on=typeof P!=='undefined'&&P&&typeof running!=='undefined'&&running&&!P.dead;
  const pct=on?owPct():0,lvl=!on?0:pct>=.9?2:pct>=.8?1:0;
  let el=OW.el;
  if(!lvl){if(el&&!el.hidden)el.hidden=true;OW.lvl=0;OW.buzzed=false;return;}
  if(!el){el=OW.el=document.createElement('button');el.id='owChip';el.type='button';document.body.appendChild(el);
    el.addEventListener('click',ev=>{ev.stopPropagation();if(typeof openPanel==='function')openPanel('items');});
    el.addEventListener('pointerdown',ev=>ev.stopPropagation());}
  const p=Math.floor(pct*100),auto=!!P.auto;
  const key=lvl+'|'+p+'|'+auto;
  if(key!==OW.key){OW.key=key;el.className=lvl===2?'ow2':'ow1';
    el.innerHTML=`<svg class="owi" viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="9.5" fill="#2a0a06"/><path d="M7 7.6a3 3 0 0 1 6 0" fill="none" stroke="#ffd0c8" stroke-width="1.8"/><path d="M5.6 8.2h8.8l1.2 6.6H4.4z" fill="#ffd0c8"/><text x="10" y="13.6" text-anchor="middle" font-size="4.6" font-weight="900" fill="#8a140c" font-family="sans-serif">KG</text></svg><span class="owt">${lvl===2?'Too heavy to attack':'Bag almost full'}</span><span class="owp">${p}%</span>`
      +(lvl===2?`<span class="owa">${auto?'Auto-hunt stopped · ':''}Sell or store items</span>`:'');
    el.setAttribute('aria-label',(lvl===2?'Too heavy to attack':'Bag almost full')+' '+p+'%');}
  el.hidden=false;
  if(lvl===2&&!OW.buzzed){OW.buzzed=true;try{if(navigator.vibrate)navigator.vibrate([60,60,60]);}catch(e){}
    if(typeof addLog==='function')addLog('Too heavy to attack: you carry '+p+'% of your weight limit. Sell, store or drop items to fight again.','l-bad');}
  if(lvl<2)OW.buzzed=false;OW.lvl=lvl;OW.pct=pct;}
setInterval(owChip,300);

/* the weight sign over the hero's head (above any ailment icons) */
function drawWeightSign(x,y){const t=typeof now==='number'?now:performance.now()/1000,k=1+Math.sin(t*6)*.08;
  ctx.save();ctx.translate(x,y);ctx.scale(k,k);
  ctx.fillStyle='rgba(0,0,0,.65)';ctx.beginPath();ctx.arc(0,0,10,0,7);ctx.fill();
  ctx.fillStyle='#ff4a3a';ctx.beginPath();ctx.arc(0,0,8.5,0,7);ctx.fill();
  // a kettlebell weight: handle ring and a heavy round body
  ctx.strokeStyle='#2a0a06';ctx.lineWidth=1.6;ctx.beginPath();ctx.arc(0,-3.2,2.6,Math.PI,0);ctx.stroke();
  ctx.fillStyle='#2a0a06';ctx.beginPath();ctx.moveTo(-4.6,-1.2);ctx.lineTo(4.6,-1.2);ctx.lineTo(5.6,4.6);ctx.lineTo(-5.6,4.6);ctx.closePath();ctx.fill();
  ctx.fillStyle='#ffd0c8';ctx.font='900 4.6px "Alegreya Sans",sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('KG',0,2.1);
  ctx.textBaseline='alphabetic';ctx.restore();}
if(typeof drawAilIcons==='function'){const _owAil=drawAilIcons;drawAilIcons=function(x,y){const r=_owAil.apply(this,arguments);
  try{if(typeof P!=='undefined'&&P&&x===P.x&&y===P.y-72&&P.heavy>1&&!P.dead){const ail=Object.keys(AILS).some(ailOn);drawWeightSign(x,ail?y-18:y);}}catch(e){}
  return r;};}

if(typeof TH!=='undefined')Object.assign(TH,{'Too heavy to attack':'หนักเกินจนโจมตีไม่ได้','Bag almost full':'กระเป๋าใกล้เต็ม',
  'Sell or store items':'ขายหรือฝากของ','Auto-hunt stopped · Sell or store items':'ล่าอัตโนมัติหยุด · ขายหรือฝากของ'});
if(typeof TH_PAT!=='undefined')TH_PAT.push([/^Too heavy to attack: you carry (\d+)% of your weight limit\. Sell, store or drop items to fight again\.$/,'หนักเกินจนโจมตีไม่ได้: คุณแบกของ $1% ของน้ำหนักที่รับได้ ขาย ฝาก หรือทิ้งของเพื่อสู้ต่อ']);
