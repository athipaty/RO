"use strict";
/* ================= #4 the stylist: change your look after making your hero =================
   Lune the Stylist stands near the fountain in Hearthvale. Pick a hairstyle, hair colour, eye colour and skin
   tone with a live preview; it costs STYLE_COST gold and everyone online sees the new look at once. */
const STYLE_COST=300;
const STY={lk:null,raf:0};
const curLook=()=>{const L=lookOf(P.name,P.look);return {style:L.style,hair:L.hair,eye:L.eye,skin:L.skin};};
const sameLook=(a,b)=>a.style===b.style&&a.hair===b.hair&&a.eye===b.eye&&a.skin===b.skin;

PANELS.stylist=()=>{if(!STY.lk)STY.lk=curLook();const L=STY.lk,changed=!sameLook(L,curLook()),afford=P.gold>=STYLE_COST;
  const sw=(list,key,label)=>`<div class="swatches" role="radiogroup" aria-label="${label}">`+list.map((c,i)=>`<button class="${L[key]===c?'on':''}" role="radio" aria-checked="${L[key]===c}" aria-label="${label} ${i+1}" style="background:${c}" data-act="stycol" data-arg="${key}:${i}"></button>`).join('')+`</div>`;
  return `<h2>Lune the Stylist</h2><div class="say">"A new look for a new adventure? Sit down, sit down. ${STYLE_COST} gold and you'll walk out a new person."</div>`+
    `<div class="styl"><canvas id="styCv" width="200" height="200" aria-label="Preview of your new look" role="img"></canvas><div class="grow">`+
    `<div class="lkrow"><span>Hairstyle</span><div class="t-step"><button class="btn small ghost" data-act="stystyle" data-arg="-1" aria-label="Previous hairstyle">◀</button><b>${esc(STYLE_NAMES[L.style])}</b><button class="btn small ghost" data-act="stystyle" data-arg="1" aria-label="Next hairstyle">▶</button></div></div>`+
    `<div class="lkrow"><span>Hair colour</span>${sw(HAIRS,'hair','Hair colour')}</div><div class="lkrow"><span>Eyes</span>${sw(EYES,'eye','Eye colour')}</div><div class="lkrow"><span>Skin</span>${sw(SKINS,'skin','Skin tone')}</div>`+
    `</div></div><div class="tbtns"><button class="btn small" data-act="styreset" ${changed?'':'disabled'}>Back to my current look</button>`+
    `<button class="btn" data-act="stybuy" ${changed&&afford?'':'disabled'}>${changed?(afford?`Change my look · ${STYLE_COST} gold`:`Needs ${STYLE_COST} gold`):'Pick something new first'}</button></div>`;};
PANEL_ACTS.stystyle=d=>{STY.lk.style=(STY.lk.style+(+d)+STYLE_NAMES.length)%STYLE_NAMES.length;sfx('click');refreshPanel();};
PANEL_ACTS.stycol=arg=>{const [k,i]=arg.split(':'),list={hair:HAIRS,eye:EYES,skin:SKINS}[k];if(!list||!list[+i])return;STY.lk[k]=list[+i];sfx('click');refreshPanel();};
PANEL_ACTS.styreset=()=>{STY.lk=curLook();refreshPanel();};
PANEL_ACTS.stybuy=()=>{if(sameLook(STY.lk,curLook())||P.gold<STYLE_COST)return;P.gold-=STYLE_COST;P.look={...STY.lk};
  NET.lastSent='';NET.sendT=0;
  fx.push({k:'ring',x:P.x,y:P.y,r:34,col:'#ff9ad0',t0:now,dur:.6});sfx('jobup');addLog(`Lune works her magic. You look wonderful! (−${STYLE_COST} gold)`,'l-good');save();refreshPanel();};
PANEL_CLOSE.stylist=()=>{STY.lk=null;cancelAnimationFrame(STY.raf);};
// the preview turns slowly, like the one in the character creator
const _openSty=openPanel;
openPanel=function(kind,arg){const r=_openSty(kind,arg);if(kind==='stylist'){cancelAnimationFrame(STY.raf);const loop=()=>{if(panelKind!=='stylist')return;styDraw();STY.raf=requestAnimationFrame(loop);};loop();}return r;};
function styDraw(){const cv=document.getElementById('styCv');if(!cv||!STY.lk)return;const c=cv.getContext('2d');c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,200,200);c.setTransform(3.2,0,0,3.2,0,0);
  const main=ctx;ctx=c;const ph=Math.floor(now/1.6)%4,face=ph===1||ph===2?-1:1,back=ph>=2,cl=CLASSES[P.cls];
  try{drawHuman(31,52,cl.col,STY.lk.hair,face,0,{look:{...lookFor(P.name),...STY.lk},outfit:baseOf(P.cls),back,hat:P.eq.head?P.eq.head.id:null,fc:P.eq.face?P.eq.face.id:null,mo:P.eq.mouth?P.eq.mouth.id:null,armor:P.eq.armor?P.eq.armor.id:null});}finally{ctx=main;}}
