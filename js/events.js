"use strict";
/* ================= Stage 5: timed events =================
   Everyone gets the same events at the same moment: they come from the clock (Thailand time, UTC+7),
   like the weather. EXP weekend (Sat-Sun, +50%), Golden Hour (every day 20:00-21:00, +25%),
   and a seasonal Hearthvale: lanterns in November, snow and lights in December. */
const EV_TZ=7*3600e3;
const evLocal=(t=Date.now())=>new Date(t+EV_TZ); // read with getUTC* to get Thailand time
function activeEvents(t=Date.now()){const d=evLocal(t),day=d.getUTCDay(),h=d.getUTCHours(),out=[];
  if(day===6||day===0){const end=Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate()+(day===6?2:1))-EV_TZ;out.push({id:'weekend',name:'EXP Weekend',bonus:.5,ends:end});}
  if(h===20){const end=Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate(),21)-EV_TZ;out.push({id:'golden',name:'Golden Hour',bonus:.25,ends:end});}
  return out;}
const eventExpBonus=(t)=>activeEvents(t).reduce((a,e)=>a+e.bonus,0);
function season(t=Date.now()){const m=evLocal(t).getUTCMonth();return m===10?'lanterns':m===11?'snow':null;}
const fmtLeft=ms=>{const m=Math.max(0,Math.ceil(ms/60000));return m>=120?`${Math.floor(m/60)}h`:m>=60?`${Math.floor(m/60)}h ${m%60}m`:`${m}m`;};

// the line under the minimap and a log message when an event starts or ends
let evSeen=null;
function eventsTick(){if(!P)return;const list=activeEvents(),ids=list.map(e=>e.id).join(',');
  const el=$('#evT');if(el){const txt=list.length?list.map(e=>`✦ ${e.name} +${Math.round(e.bonus*100)}% EXP · ${fmtLeft(e.ends-Date.now())} left`).join('  '):'';
    if(el.textContent!==txt)el.textContent=txt;if(el.hidden!==!txt)el.hidden=!txt;}
  if(evSeen===null){evSeen=ids;if(list.length)addLog(`Event on now: ${list.map(e=>`${e.name} (+${Math.round(e.bonus*100)}% EXP)`).join(', ')}.`,'l-rare');return;}
  if(ids!==evSeen){const was=evSeen.split(',').filter(Boolean),now_=list.map(e=>e.id);
    for(const e of list)if(!was.includes(e.id)){addLog(`★ ${e.name} has begun: +${Math.round(e.bonus*100)}% EXP for everyone!`,'l-rare');sfx('fanfare');showBanner(e.name,`+${Math.round(e.bonus*100)}% EXP for everyone`);}
    for(const id of was)if(!now_.includes(id))addLog(`${id==='weekend'?'EXP Weekend':'Golden Hour'} has ended.`);
    evSeen=ids;}}
setInterval(()=>{try{eventsTick();}catch(e){}},1000);

// seasonal Hearthvale: drawn over the town by the sky layer
const FEST={lanterns:[],snow:[]};
function drawSeason(){if(!Z||!P||zoneId!=='town')return;const s=season();if(!s)return;
  const W=VW,H=VH,t=performance.now()/1000;
  if(s==='lanterns'){ // warm paper lanterns drifting up, brighter at night
    const glow=typeof darkness==='function'?.45+.55*darkness(gameHour()):1;
    while(FEST.lanterns.length<14)FEST.lanterns.push({x:Math.random(),y:Math.random(),v:.012+Math.random()*.02,p:Math.random()*7,c:['#ffb347','#ff8f5a','#ffd27a'][FEST.lanterns.length%3]});
    for(const l of FEST.lanterns){l.y-=l.v/60;if(l.y<-.05){l.y=1.05;l.x=Math.random();}
      const x=l.x*W+Math.sin(t*.6+l.p)*14,y=l.y*H;ctx.globalAlpha=.85*glow;
      const g=ctx.createRadialGradient(x,y,1,x,y,24);g.addColorStop(0,'rgba(255,220,140,.6)');g.addColorStop(1,'rgba(255,180,80,0)');ctx.fillStyle=g;ctx.fillRect(x-24,y-24,48,48);
      ctx.fillStyle=l.c;ctx.beginPath();ctx.roundRect(x-5.5,y-7,11,14,4);ctx.fill();ctx.fillStyle='rgba(255,245,200,.7)';ctx.fillRect(x-1.5,y-3,3,6);ctx.fillStyle='rgba(90,40,20,.85)';ctx.fillRect(x-4,y-8.5,8,2);ctx.fillRect(x-4,y+6.5,8,2);}
    ctx.globalAlpha=1;}
  else{ // gentle snow
    while(FEST.snow.length<70)FEST.snow.push({x:Math.random(),y:Math.random(),v:.04+Math.random()*.06,r:1+Math.random()*1.8,p:Math.random()*7});
    ctx.fillStyle='rgba(255,255,255,.85)';for(const f of FEST.snow){f.y+=f.v/60;if(f.y>1.02){f.y=-.02;f.x=Math.random();}
      ctx.beginPath();ctx.arc(f.x*W+Math.sin(t+f.p)*10,f.y*H,f.r,0,7);ctx.fill();}}}
