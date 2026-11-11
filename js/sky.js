"use strict";
/* ================= #36 day/night and weather: the same for everyone, worked out from the real clock ================= */
const DAY_MS=24*60*1000;      // one game day = 24 real minutes
const WEATHER_MS=6*60*1000;   // weather can change every 6 minutes
const WEATHERS={
  town:[['clear',3],['rain',1]], meadow:[['clear',3],['rain',1]], woods:[['clear',2],['rain',1],['fog',1]],
  dunes:[['clear',3],['sand',1]], frost:[['snow',2],['clear',1],['blizzard',1]], crypt:[['embers',1]]};
const WNAME={clear:'Clear',rain:'Rain',fog:'Fog',sand:'Sandstorm',snow:'Snow',blizzard:'Blizzard',embers:'Embers'};
let skyOn=(()=>{try{return localStorage.getItem('embervale.weather')!=='0';}catch(e){return true;}})();

const scr=(x,y)=>{const p=proj(x,y);return {x:p.x-camX,y:p.y-camY};}; // world -> screen
const hasSky=()=>Z&&!Z.D.dungeon&&Z.D.theme!=='cave'&&Z.D.theme!=='crypt';
function gameHour(t){return ((t||Date.now())%DAY_MS)/DAY_MS*24;}
function dayPart(h){return h<5?'Night':h<7?'Dawn':h<17?'Day':h<20?'Dusk':'Night';}
// how dark it is (0 day … 1 deep night) and a warm tint at dawn and dusk
function darkness(h){if(h>=7&&h<17)return 0;if(h>=20||h<5)return 1;if(h<7)return 1-(h-5)/2;return (h-17)/3;}
function weatherNow(zone,t){const list=WEATHERS[zone];if(!list)return 'clear';const slot=Math.floor((t||Date.now())/WEATHER_MS);
  let s=0;for(const c of zone+':'+slot)s=(s*31+c.charCodeAt(0))|0;const r=seeded(s)();
  const tot=list.reduce((a,[,w])=>a+w,0);let x=r*tot;for(const [w,n] of list){if((x-=n)<0)return w;}return list[0][0];}

/* ---- particles (screen space) ---- */
let SKY={kind:null,parts:[],t:performance.now(),fogX:0};
function skyParts(kind){const n={rain:110,snow:90,blizzard:170,sand:80,embers:45,fog:0,clear:0}[kind]||0;const a=[];
  for(let i=0;i<n;i++)a.push({x:Math.random(),y:Math.random(),s:.6+Math.random()*.8,w:Math.random()*6.28});return a;}
function drawSky(){if(!Z||!P)return;const t=performance.now(),dt=Math.min(.05,(t-SKY.t)/1000);SKY.t=t;
  const W=VW,H=VH;ctx.save();ctx.setTransform(DPR,0,0,DPR,0,0);
  // night: darken everything except around the player and the townsfolk
  if(hasSky()){const h=gameHour(),d=darkness(h)*(skyOn?.55:.35);
    if(d>0){const lc=skyLayer(W,H),g=lc.getContext('2d');g.globalCompositeOperation='source-over';g.clearRect(0,0,W,H);
      g.fillStyle=`rgba(12,16,44,${d})`;g.fillRect(0,0,W,H);g.globalCompositeOperation='destination-out';
      const hole=(x,y,r)=>{const gr=g.createRadialGradient(x,y,r*.15,x,y,r);gr.addColorStop(0,'rgba(0,0,0,1)');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.beginPath();g.arc(x,y,r,0,7);g.fill();};
      const me=scr(P.x,P.y);hole(me.x,me.y-16,Math.min(W,H)*.32);
      for(const n of Z.npcs){const p=scr(n.x,n.y);if(p.x>-100&&p.x<W+100&&p.y>-100&&p.y<H+100)hole(p.x,p.y-16,110);}
      for(const o of NET.others.values())if(o.z===zoneId){const p=scr(o.rx,o.ry);hole(p.x,p.y-16,120);}
      ctx.drawImage(lc,0,0,W,H);}
    const warm=h>=5&&h<7?1-Math.abs(h-6):h>=17&&h<20?1-Math.abs(h-18.5)/1.5:0;
    if(warm>0){ctx.fillStyle=`rgba(255,140,60,${.12*warm})`;ctx.fillRect(0,0,W,H);}}
  // weather
  const kind=skyOn?weatherNow(zoneId):'clear';if(kind!==SKY.kind){SKY.kind=kind;SKY.parts=skyParts(kind);}
  if(kind==='rain'||kind==='blizzard'||kind==='snow'||kind==='sand'){ctx.fillStyle=kind==='sand'?'rgba(200,150,80,.22)':kind==='rain'?'rgba(40,60,90,.16)':'rgba(220,235,250,.12)';ctx.fillRect(0,0,W,H);}
  if(kind==='fog'){SKY.fogX+=dt*12;for(let i=0;i<4;i++){const x=((SKY.fogX*(1+i*.3)+i*W*.4)%(W*1.6))-W*.3,y=H*(.2+i*.22);
    const gr=ctx.createRadialGradient(x,y,10,x,y,W*.45);gr.addColorStop(0,'rgba(230,236,240,.35)');gr.addColorStop(1,'rgba(230,236,240,0)');ctx.fillStyle=gr;ctx.fillRect(0,0,W,H);}}
  for(const p of SKY.parts){
    if(kind==='rain'){p.y+=dt*1.6*p.s;p.x+=dt*.25*p.s;const x=p.x*W,y=p.y*H;ctx.strokeStyle='rgba(180,210,240,.55)';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-4*p.s,y-14*p.s);ctx.stroke();}
    else if(kind==='snow'||kind==='blizzard'){const b=kind==='blizzard';p.y+=dt*(b?.5:.12)*p.s;p.x+=dt*((b?.6:.03)+Math.sin(t/900+p.w)*.03);ctx.fillStyle='rgba(255,255,255,.85)';ctx.beginPath();ctx.arc(p.x*W,p.y*H,1.4+p.s*1.6,0,7);ctx.fill();}
    else if(kind==='sand'){p.x+=dt*.9*p.s;p.y+=dt*.08*Math.sin(t/500+p.w);const x=p.x*W,y=p.y*H;ctx.strokeStyle='rgba(230,190,120,.5)';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-22*p.s,y);ctx.stroke();}
    else if(kind==='embers'){p.y-=dt*.08*p.s;p.x+=dt*.02*Math.sin(t/700+p.w);ctx.fillStyle=`rgba(255,${120+Math.floor(80*p.s)},60,${.5+.4*Math.sin(t/300+p.w)})`;ctx.beginPath();ctx.arc(p.x*W,p.y*H,1.2+p.s,0,7);ctx.fill();}
    if(p.y>1.05){p.y=-.05;p.x=Math.random()*1.2-.1;}if(p.y<-.05){p.y=1.05;p.x=Math.random();}if(p.x>1.05)p.x=-.05;if(p.x<-.05)p.x=1.05;}
  ctx.restore();}
let skyLayerC=null;function skyLayer(W,H){if(!skyLayerC)skyLayerC=document.createElement('canvas');if(skyLayerC.width!==W||skyLayerC.height!==H){skyLayerC.width=W;skyLayerC.height=H;}return skyLayerC;}

/* ---- the region line under the minimap: level range · time of day · weather ---- */
function skyLabel(){if(!Z)return '';const h=gameHour(),w=weatherNow(zoneId);
  return hasSky()?`${h>=7&&h<17?'☀':h>=20||h<5?'☾':'◐'} ${dayPart(h)}${w!=='clear'?' · '+WNAME[w]:''}`:(w==='embers'?'Embers':'');}
setInterval(()=>{if(!running||!Z)return;const el=document.getElementById('zLv'),s=skyLabel(),t=Z.D.lvl+(s?' · '+s:'');if(el.textContent!==t)el.textContent=t;},1000);

PANEL_ACTS.weathert=()=>{skyOn=!skyOn;try{localStorage.setItem('embervale.weather',skyOn?'1':'0');}catch(e){}SKY.kind=null;refreshPanel();};
const _chatCommandS=chatCommand;
chatCommand=function(k,arg){if(k==='time'){const h=gameHour(),hh=Math.floor(h),mm=Math.floor((h-hh)*60);
  addLog(`It is ${String(hh).padStart(2,'0')}:${String(mm).padStart(2,'0')} (${dayPart(h).toLowerCase()}) in Embervale. ${hasSky()?'Weather here: '+WNAME[weatherNow(zoneId)]+'.':'No sky down here.'} A full day lasts 24 minutes.`);return true;}
  return _chatCommandS(k,arg);};
CMD_HELP.push(['/time','the time of day and the weather here']);
