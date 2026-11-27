"use strict";
/* ================= a calmer screen (v1.73.0) =================
   Seen on a phone (upright and sideways): the new-region card, a title toast, the first-steps tip and the daily gift
   pill could all show at once, right over the middle of the screen where the fight is, and empty "+" hotbar slots
   filled the corner. Now:
     - big popups take turns: the region card and the achievement toast wait for each other (a short gap between)
     - on a phone the region card is a compact strip near the top (no monster pictures when upright), and it goes after
       4 s; the first-steps tip steps aside while it shows
     - on a phone, empty hotbar slots are hidden while you play (the ✎ button and the hotbar editor still show them);
       a hero with nothing on the bar at all still sees them, so it knows where skills go */
const CALM={q:[],busyUntil:0,timer:0};
function calmRun(){clearTimeout(CALM.timer);if(!CALM.q.length)return;const wait=CALM.busyUntil-Date.now();
  if(wait>0){CALM.timer=setTimeout(calmRun,wait+50);return;}
  const job=CALM.q.shift();CALM.busyUntil=Date.now()+job.ms+400;try{job.fn();}catch(e){}if(CALM.q.length)CALM.timer=setTimeout(calmRun,job.ms+450);}
function calmPush(fn,ms){CALM.q.push({fn,ms});if(CALM.q.length>4)CALM.q.splice(0,CALM.q.length-4);calmRun();}
const calmPhone=()=>document.body.classList.contains('touchui');
if(typeof regionCard==='function'){const _rcC=regionCard;regionCard=function(){const a=arguments;
  calmPush(()=>{_rcC.apply(this,a);if(calmPhone()){const el=document.getElementById('zoneCard');if(el){clearTimeout(regionCard.t);regionCard.t=setTimeout(()=>el.classList.remove('show'),4000);}}},calmPhone()?4000:6000);};}
if(typeof achToast==='function'){const _atC=achToast;achToast=function(){const a=arguments;calmPush(()=>_atC.apply(this,a),4500);};}
// the first-steps tip steps aside while the region card or an achievement toast shows
setInterval(()=>{try{const z=document.getElementById('zoneCard'),a=document.getElementById('achToast');
  document.body.classList.toggle('calmpop',!!(z&&z.classList.contains('show'))||!!(a&&a.classList.contains('show')));}catch(e){}},200);
// empty hotbar slots: hidden on a phone while playing
function calmSlots(){try{const phone=calmPhone(),hb=document.getElementById('hotbar');if(!hb)return;
  const editing=typeof panelKind!=='undefined'&&panelKind==='hotbar',any=Array.isArray(P&&P.bar)&&P.bar.some(Boolean);
  document.body.classList.toggle('calmslots',phone&&any&&!editing);}catch(e){}}
setInterval(calmSlots,500);
/* (v1.74.1) phones upright: Ride joins the column of round buttons on the left (Stats, Skills, Equip, Items), so the right
   column (Menu, Auto, Sit) is one button shorter and Sit no longer sits on the hotbar's ✎ button. Sideways and on a computer
   it stays where it was (js/quickleft.js moves it into the left row sideways). */
function calmRide(){try{const r=document.getElementById('rideBtn'),q=document.getElementById('quick'),a=document.getElementById('actions');if(!r||!q||!a)return;
  const col=document.body.classList.contains('thumbq');
  if(col&&r.parentElement===a){q.insertBefore(r,q.firstChild);r.classList.add('inq');}
  else if(!col&&r.parentElement===q){const au=document.getElementById('autoBtn');if(au&&au.parentElement===a)au.insertAdjacentElement('afterend',r);else a.insertBefore(r,document.getElementById('chatBtn'));r.classList.remove('inq');}}catch(e){}}
setInterval(calmRide,400);addEventListener('resize',()=>setTimeout(calmRide,120));
{const st=document.createElement('style');st.textContent=`
body.calmpop #tutCard{visibility:hidden}
body.touchui #quick>#rideBtn{position:static!important;transform:none!important;left:auto!important;top:auto!important;width:40px!important;height:40px!important;border-radius:50%;padding:0;display:grid;place-items:center;
  color:#f4e7c4;background:radial-gradient(circle at 35% 28%,#2c3546,#0e121a 70%);border:2px solid #9c7a3e;box-shadow:0 0 0 1px #000,0 4px 10px rgba(0,0,0,.5)}
body.thumbq #actions>#sitBtn{margin-bottom:58px}
body.touchui #quick>#rideBtn[hidden]{display:none!important}body.touchui #quick>#rideBtn.none{opacity:.5}body.touchui #quick>#rideBtn:active{transform:scale(.94)!important}
body.calmslots #hotbar .slot.empty,body.calmslots .slot.hrs.empty{visibility:hidden;pointer-events:none}
body.touchui #zoneCard{top:max(118px,calc(env(safe-area-inset-top) + 118px));transform:translate(-50%,-10px) scale(.9);width:min(300px,calc(100vw - 40px));padding:9px 14px;border-radius:14px}
body.touchui #zoneCard.show{transform:translate(-50%,0) scale(1)}
body.touchui #zoneCard .zcn{font-size:21px}body.touchui #zoneCard .zcb{font-size:12px;margin:4px 0 2px}
body.touchui #zoneCard .zcp img{width:34px;height:34px}body.touchui #zoneCard .zcp span{padding:2px 3px}
@media (orientation:portrait){body.touchui #zoneCard .zcp{display:none}}
@media (orientation:landscape){body.touchui #zoneCard{top:max(64px,calc(env(safe-area-inset-top) + 64px))}}`;document.head.appendChild(st);}
