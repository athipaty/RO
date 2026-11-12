"use strict";
/* ================= #57 seasonal events =================
   Five festivals through the year (Thailand time, like the other events):
     Blossom Festival  February       petals over Hearthvale        token: Blossom Petal
     Splash Days       April 10-20    water droplets                token: Splash Shell
     Harvest Moon      October        drifting leaves               token: Harvest Gourd
     Lantern Nights    November       (existing lanterns)           token: Lantern Wick
     Frostfall         December       (existing snow)               token: Frost Ribbon
   During a festival, every monster you defeat has a 12% chance (bosses 100%) to drop the festival's token.
   Festival Keeper Pim by the fountain trades tokens for that festival's limited hat or face item and a treat.
   Outside festivals Pim shows the calendar. Tokens and prizes are ordinary items (trade, store, sell). */
const FESTS={
  blossom:{name:'Blossom Festival',when:'all of February',tok:'petaltok',prize:'blossomcrown',col:'#ffb3d0',treat:'blossomtea'},
  splash:{name:'Splash Days',when:'April 10 – 20',tok:'shelltok',prize:'splashgoggles',col:'#7fd0ff',treat:'coolbrew'},
  harvest:{name:'Harvest Moon',when:'all of October',tok:'gourdtok',prize:'gourdhat',col:'#e0902a',treat:'harvestpie'},
  lanterns:{name:'Lantern Nights',when:'all of November',tok:'wicktok',prize:'lanternhat',col:'#ffb347',treat:'lanterncake'},
  snow:{name:'Frostfall',when:'all of December',tok:'ribbontok',prize:'frostscarf',col:'#bfe6ff',treat:'cocoa'},
};
const FEST_ORDER=['blossom','splash','harvest','lanterns','snow'];
const PRIZE_COST=30,TREAT_COST=5;
// which festival is on (or null); extends the existing season() which already covers November and December
function festNow(t=Date.now()){const d=evLocal(t),m=d.getUTCMonth(),day=d.getUTCDate();
  return m===1?'blossom':m===3&&day>=10&&day<=20?'splash':m===9?'harvest':m===10?'lanterns':m===11?'snow':null;}

Object.assign(ITEMS,{
  petaltok:{name:'Blossom Petal',type:'etc',price:5,col:'#ffb3d0',g:'✿',keep:true,desc:'A festival token. Trade it with Festival Keeper Pim (never sold by "Sell all loot").'},
  shelltok:{name:'Splash Shell',type:'etc',price:5,col:'#7fd0ff',g:'◖',keep:true,desc:'A festival token. Trade it with Festival Keeper Pim (never sold by "Sell all loot").'},
  gourdtok:{name:'Harvest Gourd',type:'etc',price:5,col:'#e0902a',g:'●',keep:true,desc:'A festival token. Trade it with Festival Keeper Pim (never sold by "Sell all loot").'},
  wicktok:{name:'Lantern Wick',type:'etc',price:5,col:'#ffb347',g:'⌇',keep:true,desc:'A festival token. Trade it with Festival Keeper Pim (never sold by "Sell all loot").'},
  ribbontok:{name:'Frost Ribbon',type:'etc',price:5,col:'#bfe6ff',g:'∿',keep:true,desc:'A festival token. Trade it with Festival Keeper Pim (never sold by "Sell all loot").'},
  blossomcrown:{name:'Blossom Crown',type:'head',def:1,b:{luk:3,maxsp:20},price:3000,lv:1,slots:0,col:'#ffb3d0',g:'^',desc:'Blossom Festival prize. LUK +3 · Max SP +20.'},
  splashgoggles:{name:'Splash Goggles',type:'face',b:{agi:2,dex:2},price:3000,lv:1,slots:0,col:'#7fd0ff',g:'∞',desc:'Splash Days prize. AGI +2 · DEX +2.'},
  gourdhat:{name:'Gourd Lantern Hat',type:'head',def:2,b:{vit:2,maxhp:60},price:3000,lv:1,slots:0,col:'#e0902a',g:'^',desc:'Harvest Moon prize. VIT +2 · Max HP +60.'},
  lanternhat:{name:'Paper Lantern Hat',type:'head',def:1,b:{int:2,matk:15},price:3000,lv:1,slots:0,col:'#ffb347',g:'^',desc:'Lantern Nights prize. INT +2 · MATK +15.'},
  frostscarf:{name:'Frostfall Scarf',type:'mouth',b:{vit:2,def:3},price:3000,lv:1,slots:0,col:'#bfe6ff',g:'/',desc:'Frostfall prize. VIT +2 · DEF +3.'},
  blossomtea:{name:'Blossom Tea',type:'use',price:40,col:'#ffb3d0',g:'T',brew:{id:'blossomtea',s:300,b:{luk:5}},desc:'For 5 minutes: +5 LUK.'},
  coolbrew:{name:'Cool Splash Brew',type:'use',price:40,col:'#7fd0ff',g:'S',brew:{id:'coolbrew',s:300,b:{agi:4,flee:5}},desc:'For 5 minutes: +4 AGI, +5 FLEE.'},
  harvestpie:{name:'Harvest Pie',type:'use',price:40,col:'#e0902a',g:'P',brew:{id:'harvestpie',s:300,b:{vit:4,regen:4}},desc:'For 5 minutes: +4 VIT, +4 HP regen.'},
  lanterncake:{name:'Lantern Cake',type:'use',price:40,col:'#ffb347',g:'C',brew:{id:'lanterncake',s:300,b:{int:4,matk:15}},desc:'For 5 minutes: +4 INT, +15 MATK.'},
  cocoa:{name:'Hot Cocoa',type:'use',price:40,col:'#8a5a3a',g:'C',brew:{id:'cocoa',s:300,b:{def:10,maxhp:80}},desc:'For 5 minutes: +10 DEF, +80 Max HP.'},
});

// festival hats on the hero: simple, original shapes (other prizes use face/mouth drawing)
const _drawHatF=drawHat;
drawHat=function(id,x,hy,f){
  if(id==='blossomcrown'){ctx.save();for(let i=-2;i<=2;i++){const px=x+i*5,py=hy-11+Math.abs(i)*1.2;ctx.fillStyle=i%2?'#ffd0e4':'#ff9ac4';for(let k=0;k<5;k++){const a=k*1.256;ctx.beginPath();ctx.ellipse(px+Math.cos(a)*2,py+Math.sin(a)*2,1.8,1.2,a,0,7);ctx.fill();}ctx.fillStyle='#ffe27a';ctx.beginPath();ctx.arc(px,py,1,0,7);ctx.fill();}ctx.restore();return;}
  if(id==='gourdhat'){ctx.save();ctx.fillStyle='#e0902a';ctx.strokeStyle='#2a1c14';ctx.lineWidth=1.2;ctx.beginPath();ctx.ellipse(x,hy-12,11,7,0,0,7);ctx.fill();ctx.stroke();
    ctx.strokeStyle='rgba(120,60,10,.6)';for(const k of [-5,0,5]){ctx.beginPath();ctx.moveTo(x+k,hy-18);ctx.quadraticCurveTo(x+k*1.3,hy-12,x+k,hy-6);ctx.stroke();}
    ctx.fillStyle='#4e8a3a';ctx.fillRect(x-1.2,hy-22,2.4,4);ctx.fillStyle='rgba(255,220,120,.9)';ctx.beginPath();ctx.moveTo(x-3,hy-11);ctx.lineTo(x,hy-14);ctx.lineTo(x+3,hy-11);ctx.closePath();ctx.fill();ctx.restore();return;}
  if(id==='lanternhat'){ctx.save();ctx.fillStyle='#ffb347';ctx.strokeStyle='#5a2a14';ctx.lineWidth=1.1;ctx.beginPath();ctx.roundRect(x-7,hy-24,14,13,4);ctx.fill();ctx.stroke();
    ctx.fillStyle='#5a2a14';ctx.fillRect(x-6,hy-25.5,12,2);ctx.fillRect(x-6,hy-12,12,2);ctx.fillStyle=`rgba(255,245,200,${.6+Math.sin(now*4)*.2})`;ctx.fillRect(x-1.5,hy-21,3,7);ctx.restore();return;}
  return _drawHatF(id,x,hy,f);};
const _drawFaceGearF=drawFaceGear;
drawFaceGear=function(fc,mo,x,hy,f){
  _drawFaceGearF(fc==='splashgoggles'?null:fc,mo==='frostscarf'?null:mo,x,hy,f);
  const ex=x+f*2.6,ey=hy+2.5;ctx.save();
  if(fc==='splashgoggles'){ctx.strokeStyle='#2a6a9a';ctx.lineWidth=2.2;ctx.beginPath();ctx.moveTo(x-12.5,ey-1);ctx.lineTo(x+12.5,ey-1);ctx.stroke();
    for(const k of [-1,1]){ctx.fillStyle='#2a6a9a';ctx.beginPath();ctx.ellipse(ex+k*4.8,ey,4.4,3.8,0,0,7);ctx.fill();ctx.fillStyle='rgba(150,225,255,.85)';ctx.beginPath();ctx.ellipse(ex+k*4.8,ey,3.2,2.7,0,0,7);ctx.fill();}}
  if(mo==='frostscarf'){ctx.fillStyle='#bfe6ff';ctx.strokeStyle='#4a7a9a';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x-12,hy+5);ctx.quadraticCurveTo(x,hy+4,x+12,hy+5);ctx.lineTo(x+10,hy+11);ctx.quadraticCurveTo(x,hy+13,x-10,hy+11);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.fillStyle='#ffffff';for(const k of [-6,0,6]){ctx.beginPath();ctx.arc(x+k,hy+8,1.1,0,7);ctx.fill();}}
  ctx.restore();};

/* ---- tokens from monsters you defeat during a festival ---- */
// they drop on the ground like any other loot (only for the player who helped defeat the monster)
const _killMobF=killMob;
killMob=function(m){const mine=!m.dead&&(m.myDmg||0)>0;const r=_killMobF.apply(this,arguments);const fe=festNow();
  if(mine&&fe&&m.d&&(m.d.boss||Math.random()<.12))for(let i=0;i<(m.d.boss?3:1);i++)dropLoot(m,FESTS[fe].tok);
  return r;};

/* ---- Festival Keeper Pim ---- */
const tokCount=id=>{const e=invFind(id);return e?e.n:0;};
PANELS.festival=()=>{const fe=festNow();
  let h=`<h2>Festival Keeper Pim</h2>`;
  if(!fe){h+=`<div class="say">"No festival right now, friend. Come back when the town is dressed up! Here's when they are:"</div>`;}
  else{const F=FESTS[fe],n=tokCount(F.tok),pr=ITEMS[F.prize],tr=ITEMS[F.treat];
    h+=`<div class="say">"The ${F.name} is on! Bring me ${ITEMS[F.tok].name}s from the monsters you defeat and I'll make it worth your while."</div>`;
    h+=`<div class="sub">You have <b>${n}</b> ${ITEMS[F.tok].name}${n===1?'':'s'}. Monsters drop them 12% of the time during the festival; bosses always drop 3.</div>`;
    h+=`<div class="row"><div class="grow"><div class="nm">${pr.name}</div><div class="ds">${pr.desc}</div></div><span>${PRIZE_COST} tokens</span><button class="btn small" data-act="festbuy" data-arg="prize" ${n>=PRIZE_COST?'':'disabled'}>Trade</button></div>`;
    h+=`<div class="row"><div class="grow"><div class="nm">${tr.name}</div><div class="ds">${tr.desc}</div></div><span>${TREAT_COST} tokens</span><button class="btn small" data-act="festbuy" data-arg="treat" ${n>=TREAT_COST?'':'disabled'}>Trade</button></div>`;}
  h+=`<h3>Festival calendar</h3>`+FEST_ORDER.map(k=>`<div class="row"><div class="grow"><div class="nm" style="color:${FESTS[k].col}">${FESTS[k].name}${k===fe?' · on now':''}</div><div class="ds">${FESTS[k].when} · prize: ${ITEMS[FESTS[k].prize].name}</div></div></div>`).join('');
  return h;};
PANEL_ACTS.festbuy=k=>{const fe=festNow();if(!fe)return;const F=FESTS[fe],cost=k==='prize'?PRIZE_COST:TREAT_COST,id=k==='prize'?F.prize:F.treat;
  if(tokCount(F.tok)<cost)return;takeItem(F.tok,cost);giveItem(id,1,true);sfx('fanfare');addLog(`Pim hands you a ${ITEMS[id].name}. Happy ${F.name}!`,'l-rare');save();refreshPanel();};

/* ---- the town dresses up: petals, droplets and leaves join the existing lanterns and snow ---- */
const _seasonF=season;
season=function(t){return festNow(t);};
const FEST2={parts:[],kind:null};
const _drawSeasonF=drawSeason;
drawSeason=function(){const s=festNow();if(s==='lanterns'||s==='snow'||!s)return _drawSeasonF();
  if(!Z||!P||zoneId!=='town')return;const W=VW,H=VH,t=performance.now()/1000;
  const n=window.LITE?18:36;if(FEST2.kind!==s){FEST2.kind=s;FEST2.parts=[];}
  while(FEST2.parts.length<n)FEST2.parts.push({x:Math.random(),y:Math.random(),v:.03+Math.random()*.04,r:1.5+Math.random()*2,p:Math.random()*7});
  for(const q of FEST2.parts){q.y+=q.v/60*(s==='splash'?3:1);if(q.y>1.03){q.y=-.03;q.x=Math.random();}
    const x=q.x*W+Math.sin(t*.9+q.p)*(s==='splash'?3:16),y=q.y*H;
    if(s==='blossom'){ctx.fillStyle='rgba(255,180,210,.9)';ctx.beginPath();ctx.ellipse(x,y,q.r*1.4,q.r*.8,t+q.p,0,7);ctx.fill();}
    else if(s==='splash'){ctx.strokeStyle='rgba(150,215,255,.7)';ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x,y+q.r*4);ctx.stroke();}
    else{ctx.fillStyle=['#e0902a','#c8642a','#e8b84a'][(q.p*10|0)%3];ctx.beginPath();ctx.ellipse(x,y,q.r*1.6,q.r*.9,Math.sin(t+q.p)*1.2,0,7);ctx.fill();}}};

// tell players once per session when a festival is on
let festTold=null;
setInterval(()=>{try{if(!P||!running)return;const fe=festNow();if(!fe||festTold===fe)return;festTold=fe;const F=FESTS[fe];
  addLog(`✿ ${F.name} is on! Monsters drop ${ITEMS[F.tok].name}s: trade them with Festival Keeper Pim by the fountain for a ${ITEMS[F.prize].name}.`,'l-rare');}catch(e){}},2000);
