"use strict";
/* ================= more feel =================
   1. Danger colours: a monster's name is coloured by its level against yours (grey far below, green easy, white even,
      yellow and orange tougher, red with a skull: deadly); aggressive monsters (attack on sight) get a small ⚔.
   2. Combo counter: kills within 4 seconds of each other count up a COMBO at the side of the screen (just for show).
   3. Loot flies into the bag: what you pick up arcs from the ground to the Items button. */

/* ---- 1. danger colours (used by the monster labels in render.js) ---- */
function monCol(d){if(d.boss)return '#ffcf5a';const k=d.lv-(P?P.lv:1);return k<=-10?'#9aa3ad':k<=-3?'#8fe0a0':k<=2?'#ffffff':k<=6?'#ffe27a':k<=9?'#ffaa5a':'#ff6a5a';}
function monLabel(d){const k=d.lv-(P?P.lv:1);return `${!d.boss&&k>=10?'☠ ':''}${d.name}  Lv${d.lv}${d.aggro&&!d.boss?' ⚔':''}`;}

/* ---- 2. combo counter ---- */
const COMBO={n:0,last:-9,el:null,t:0};
function comboShow(){let el=COMBO.el;if(!el){el=COMBO.el=document.createElement('div');el.id='combo';el.setAttribute('aria-hidden','true');document.body.appendChild(el);}
  el.innerHTML=`<b>${COMBO.n}</b><span>COMBO</span>`;el.classList.remove('pop');void el.offsetWidth;el.classList.add('pop','show');el.dataset.tier=COMBO.n>=20?'3':COMBO.n>=10?'2':'1';
  clearTimeout(COMBO.t);COMBO.t=setTimeout(()=>el.classList.remove('show'),4200);}
{const _kmC=killMob;killMob=function(m){const mine=m&&!m.dead&&(m.myDmg||0)>0;const r=_kmC.apply(this,arguments);
  try{if(mine){COMBO.n=now-COMBO.last<4?COMBO.n+1:1;COMBO.last=now;if(COMBO.n>=3)comboShow();if(COMBO.n%10===0&&typeof sfx==='function')sfx('rare');}}catch(e){}return r;};}

/* ---- 3. loot flies into the bag ---- */
const FLY={n:0};
function flyTarget(){for(const s of ['#quick .qk[data-open="items"]','#quickL .qk[data-open="items"]','#menuBtn']){const e=document.querySelector(s);if(e&&e.getClientRects().length){const r=e.getBoundingClientRect();if(r.width)return {x:r.left+r.width/2,y:r.top+r.height/2,el:e};}}return {x:40,y:innerHeight-60,el:null};}
function lootFly(l){if(FLY.n>=6||!l||typeof cv==='undefined'||(typeof REDUCED_MOTION!=='undefined'&&REDUCED_MOTION.matches))return;
  const p=proj(l.x,l.y),cr=cv.getBoundingClientRect(),sx=cr.left+(p.x-camX)*cr.width/VW,sy=cr.top+(p.y-camY-8)*cr.height/VH,tg=flyTarget();
  if(sx<-40||sx>innerWidth+40||sy<-40||sy>innerHeight+40)return;
  const img=document.createElement('img');img.className='lootfly';img.alt='';img.src=l.gold?(typeof itemIconURL==='function'&&ITEMS.goldpouch?itemIconURL('goldpouch'):''):itemIconURL(l.id);if(!img.src)return;
  img.style.left=sx+'px';img.style.top=sy+'px';document.body.appendChild(img);FLY.n++;
  const dx=tg.x-sx,dy=tg.y-sy;const a=img.animate([{transform:'translate(-50%,-50%) scale(1)',opacity:1},{transform:`translate(calc(-50% + ${dx*.45}px),calc(-50% + ${dy*.45-70}px)) scale(1.25)`,opacity:1,offset:.45},
    {transform:`translate(calc(-50% + ${dx}px),calc(-50% + ${dy}px)) scale(.45)`,opacity:.3}],{duration:620,easing:'cubic-bezier(.35,.1,.6,1)'});
  a.onfinish=()=>{img.remove();FLY.n--;if(tg.el){tg.el.classList.remove('gotloot');void tg.el.offsetWidth;tg.el.classList.add('gotloot');}};}
{const _puF=pickUp;pickUp=function(l){const had=loot.indexOf(l)>=0;const r=_puF.apply(this,arguments);try{if(had&&loot.indexOf(l)<0&&!l.gold)lootFly(l);}catch(e){}return r;};}
