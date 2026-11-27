"use strict";
/* ================= drop what you do not want (v1.79.0) =================
   The bag had no way to get rid of an item except selling it in a shop. Now every row in the Items window has a 🗑
   Drop button: the first tap asks ("Drop?", or "Drop ×12?" for a stack), the second puts it on the ground at your
   feet. A stack goes down as one pile. You can pick it up again; it fades after 2 minutes like any other drop.
   Auto-hunt leaves your own dropped things alone (js/combat.js), so it does not pick the junk straight back up.
   Only things in the bag can be dropped: worn gear stays on. */
const DROPUI={arm:null,t:0};
// the bag rows are drawn in bag order, one per item of the open tab (js/ui.js): find which bag index each row is
function dropRowIndexes(){if(typeof invTab==='undefined'||typeof itemCat!=='function')return [];const out=[];P.inv.forEach((e,i)=>{if(ITEMS[e.id]&&itemCat(e.id)===invTab)out.push(i);});return out;}
function dropDecorate(){if(typeof panelKind==='undefined'||panelKind!=='items'||!P)return;const rows=[...panel.querySelectorAll('.row')],idx=dropRowIndexes();if(rows.length!==idx.length)return;
  const th=typeof LANG!=='undefined'&&LANG==='th';
  rows.forEach((r,k)=>{if(r.querySelector('.dropbtn'))return;const i=idx[k],e=P.inv[i];if(!e)return;const armed=DROPUI.arm===`${i}:${e.id}`&&now<DROPUI.t;
    const b=document.createElement('button');b.type='button';b.className='btn small dropbtn'+(armed?' armed':'');b.dataset.act='dropinv';b.dataset.arg=`${i}:${e.id}`;
    b.textContent=armed?(e.n>1?(th?`ทิ้ง ×${e.n}?`:`Drop ×${e.n}?`):(th?'ทิ้ง?':'Drop?')):'🗑';b.title=th?'ทิ้งลงพื้น':'Drop on the ground';b.setAttribute('aria-label',b.title);r.appendChild(b);});}
{const _rpD=refreshPanel;refreshPanel=function(){const r=_rpD.apply(this,arguments);try{dropDecorate();}catch(e){}return r;};}
PANEL_ACTS.dropinv=a=>{const [iS,id]=String(a).split(':'),i=+iS,e=P.inv[i];if(!e||e.id!==id)return;const key=`${i}:${id}`,th=typeof LANG!=='undefined'&&LANG==='th';
  if(DROPUI.arm!==key||now>=DROPUI.t){DROPUI.arm=key;DROPUI.t=now+4;refreshPanel();return;}
  DROPUI.arm=null;const n=e.n!==undefined?e.n:1,it=ITEMS[id];
  P.inv.splice(i,1);
  // one pile at your feet (gear keeps its slots, sigils and refine)
  let x=P.x,y=P.y;for(let k=0;k<6;k++){const ang=rnd(0,7),r=rnd(12,26),tx=P.x+Math.cos(ang)*r,ty=P.y+Math.sin(ang)*r;if(canStand(tx,ty,4)){x=tx;y=ty;break;}}
  loot.push({id,gold:0,n:n>1?n:undefined,e:e.uid?e:undefined,dropped:true,rare:false,boss:false,x,y,fx:P.x,fy:P.y,t0:now,exp:now+120,uid:++lootId});
  if(typeof sfx==='function')sfx('click');addLog(th?`ทิ้ง ${it.name}${n>1?` ×${n}`:''} ลงพื้น (จะหายไปใน 2 นาที)`:`You drop ${it.name}${n>1?` ×${n}`:''}. It fades in 2 minutes.`);
  if(typeof S!=='undefined'&&typeof computeStats==='function')S=computeStats();if(typeof save==='function')save();refreshPanel();};
// picking a pile up gives the whole pile back (and a piece of gear exactly as it was)
{const _puD=pickUp;pickUp=function(l){if(!l||!l.dropped||(!l.n&&!l.e))return _puD.apply(this,arguments);const i=loot.indexOf(l);if(i<0)return;
  const n=l.n||1;if(typeof carryWeight==='function'&&carryWeight()+itemWeight(l.id)*n>maxWeight()){l.tooHeavy=true;floatT(P.x,P.y-40,'Too heavy!','#ff9a6a',13);return;}
  loot.splice(i,1);if(l.e){P.inv.push(l.e);addLog(`You pick up ${itemName(l.e)}.`,'l-loot');}else giveItem(l.id,n,true);if(typeof sfx==='function')sfx('pickup');
  if(typeof refreshPanel==='function'&&typeof panelKind!=='undefined'&&panelKind)refreshPanel();};}
{const st=document.createElement('style');st.textContent=`.dropbtn{margin-left:6px;min-width:38px;opacity:.75}.dropbtn.armed{opacity:1;background:#7a2a22!important;border-color:#e8664a!important;color:#fff!important}`;document.head.appendChild(st);}
if(typeof TH!=='undefined')Object.assign(TH,{'Drop on the ground':'ทิ้งลงพื้น'});
