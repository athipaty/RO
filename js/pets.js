"use strict";
/* ================= #43 pets: tame a monster and it follows you =================
   A Taming Charm (General Store) used on a worn-down monster of a tameable kind may win it over: the weaker it
   is, the better the odds. Your companion follows you, everyone online sees it (presence field pt), and Pet
   Snacks keep it happy. A happy pet (50+) gives a small bonus of its own; one left hungry goes back to rest.
   Click your pet or type /pet for its window: rename, feed, rest or call, release. One companion at a time. */
const PETS={
  sproutling:{b:{vit:2},txt:'+2 VIT'},
  hopper:{b:{agi:2},txt:'+2 AGI'},
  mossbug:{b:{dex:2},txt:'+2 DEX'},
  thornling:{b:{str:2},txt:'+2 STR'},
  greylupe:{b:{flee:6},txt:'+6 FLEE'},
  mushcap:{b:{int:2},txt:'+2 INT'},
  cavebat:{b:{crit:3},txt:'+3% CRIT'},
  scarab:{b:{def:4},txt:'+4 DEF'},
  frostwisp:{b:{maxsp:40},txt:'+40 Max SP'},
};
ITEMS.tamecharm={name:'Taming Charm',type:'use',price:600,col:'#e88ac0',g:'♥',desc:'Use on a worn-down monster that can be tamed (Sproutling, Hopper, Mossbug, Thornling, Grey Lupe, Mushcap, Cave Bat, Dune Scarab or Frost Wisp). The weaker it is, the better the odds.'};
ITEMS.petsnack={name:'Pet Snack',type:'use',price:40,col:'#e0a050',g:'●',desc:'Feed your companion: +25 happiness.'};
for(const id of ['tamecharm','petsnack'])if(!SHOP.includes(id))SHOP.splice(SHOP.indexOf('kinship')+1,0,id);
const PET_DECAY=60;          // seconds per point of happiness lost while out
const PET_FOND=50;           // happiness needed for the bonus
const petOk=p=>p&&typeof p==='object'&&PETS[p.k];
const petOut=()=>!!(P&&petOk(P.pet)&&P.pet.out&&!P.dead);
const petName=p=>clean(p.name,16)||MOBS[p.k].name;
const PETW={me:null,them:new Map(),decay:0}; // drawn pets: mine and other players' (by peer)

/* ---- taming ---- */
function tameTry(){const m=P.target;
  if(P.pet&&petOk(P.pet)){addLog(`You already have a companion, ${petName(P.pet)}. Release it in its window (/pet) to tame another.`,'l-bad');return false;}
  if(!m||m.dead||m.pvp||!m.d||!MOBS[m.d.id]){addLog('Target a monster first, then use the Taming Charm.','l-bad');return false;}
  if(!PETS[m.d.id]||m.d.boss||m.d.mini){addLog(`A ${m.d.name} can't be tamed.`,'l-bad');return false;}
  if(dist(P,m)>140){addLog(`Get closer to the ${m.d.name} first.`,'l-bad');return false;}
  const frac=clamp(m.hp/m.d.hp,0,1),chance=.12+.6*(1-frac);
  fx.push({k:'ring',x:m.x,y:m.y,r:30,col:'#ff9ad0',t0:now,dur:.6});
  if(Math.random()<chance){
    P.pet={k:m.d.id,name:'',happy:70,out:true};PETW.me=null;
    fx.push({k:'lvl',x:m.x,y:m.y-30,t0:now,dur:1.8,txt:'♥ TAMED',col:'#ff9ad0'});sfx('jobup');
    addLog(`The ${m.d.name} takes a liking to you and becomes your companion! Click it or type /pet to name it.`,'l-rare');
    if(P.target===m)P.target=null;S=computeStats();save();
  } else {floatT(m.x,m.y-40,'Not yet…','#ffb0d8',13);sfx('click');addLog(`The ${m.d.name} isn't ready to trust you yet (${Math.round(chance*100)}% chance). Wear it down more and try again.`);}
  return true;}
function feedPet(){if(!petOk(P.pet)){addLog('You have no companion to feed.','l-bad');return false;}
  if(P.pet.happy>=100){addLog(`${petName(P.pet)} is already full.`);return false;}
  P.pet.happy=Math.min(100,P.pet.happy+25);sfx('pop');
  const w=PETW.me;if(w){w.heart=now;}addLog(`${petName(P.pet)} munches happily (happiness ${Math.round(P.pet.happy)}).`,'l-good');S=computeStats();save();return true;}
const _useItemPet=useItem;
useItem=function(id){if(id!=='tamecharm'&&id!=='petsnack')return _useItemPet(id);
  if(P.dead||!invFind(id))return _useItemPet(id);if((P.cd.item||0)>now)return;
  if(id==='tamecharm'?tameTry():feedPet()){takeItem(id);P.cd.item=now+.4;refreshPanel();}};

/* ---- the bonus (only while out and happy) ---- */
const _computeStatsPet=computeStats;
computeStats=function(){const on=petOut()&&P.pet.happy>=PET_FOND;if(on)P.buffs.__pet={b:PETS[P.pet.k].b};
  try{return _computeStatsPet();}finally{if(on)delete P.buffs.__pet;}};

/* ---- following ---- */
function petStep(w,ox,oy,face,dt,moving){
  const tx=ox-face*30,ty=oy+16,d=Math.hypot(tx-w.x,ty-w.y);
  if(d>420){w.x=tx;w.y=ty;w.moving=false;return;}
  if(d>18){const sp=Math.min(d*3.2,Math.max(150,d*2.4))*dt;w.x+=(tx-w.x)/d*Math.min(sp,d);w.y+=(ty-w.y)/d*Math.min(sp,d);w.moving=true;w.face=tx>w.x?1:-1;}
  else{w.moving=false;if(!moving&&Math.random()<dt*.15)w.face=-w.face;}}
function petBody(k,name,owner){const d=MOBS[k];return {x:0,y:0,face:1,ph:Math.random()*6,moving:false,hitF:-9,heart:0,name,owner,k,
  d:{...d,size:Math.max(8,Math.round(d.size*.7)),boss:false},ail:null};}
const _netTickPet=netTick;
netTick=function(dt){_netTickPet(dt);if(!P)return;
  // mine
  if(petOut()){let w=PETW.me;if(!w||w.k!==P.pet.k||w.z!==zoneId){w=PETW.me=petBody(P.pet.k,petName(P.pet),P.name);w.z=zoneId;w.x=P.x-P.face*30;w.y=P.y+16;}
    w.name=petName(P.pet);petStep(w,P.x,P.y,P.face||1,dt,P.moving);
    PETW.decay+=dt;if(PETW.decay>=PET_DECAY){PETW.decay=0;P.pet.happy=Math.max(0,P.pet.happy-1);
      if(P.pet.happy===20)addLog(`${petName(P.pet)} looks hungry. Feed it a Pet Snack.`);
      if(P.pet.happy<=0){P.pet.out=false;PETW.me=null;addLog(`${petName(P.pet)} was too hungry and went back to rest. Feed it, then call it from its window (/pet).`,'l-bad');S=computeStats();}
      if(P.pet.happy===PET_FOND-1){S=computeStats();addLog(`${petName(P.pet)} isn't happy enough to help any more.`);}}}
  else PETW.me=null;
  // other players' pets
  for(const [peer,w] of PETW.them){const o=NET.others.get(peer);if(!o||!o.pt||o.z!==zoneId||o.dead||o.pt.k!==w.k)PETW.them.delete(peer);}
  for(const [peer,o] of NET.others){if(!o.pt||o.z!==zoneId||o.dead)continue;let w=PETW.them.get(peer);
    if(!w){w=petBody(o.pt.k,o.pt.n,o.n);w.x=o.rx-30;w.y=o.ry+16;PETW.them.set(peer,w);}
    w.name=o.pt.n;petStep(w,o.rx,o.ry,o.face||1,dt,o.moving);}};
// what others see of my pet
function petPresence(){return petOut()?{k:P.pet.k,n:petName(P.pet)}:null;}
function petRead(v){return v&&typeof v==='object'&&PETS[v.k]?{k:v.k,n:clean(v.n,16)||MOBS[v.k].name}:null;}
// drawn among the other standing things
function petItems(){const out=[];if(PETW.me)out.push({pet:PETW.me,x:PETW.me.x,y:PETW.me.y});for(const w of PETW.them.values())out.push({pet:w,x:w.x,y:w.y});return out;}
function drawPet(w){drawMob(w);const s=w.d.size,hop=w.moving?Math.abs(Math.sin(now*10))*2:0;
  label(w.name,w.x,w.y-s*2.3-8-hop,'#ffb0d8',11);
  if(w.heart&&now-w.heart<1.4){const a=(now-w.heart)/1.4;ctx.globalAlpha=1-a;ctx.fillStyle='#ff6aa8';ctx.font='700 16px sans-serif';ctx.textAlign='center';ctx.fillText('♥',w.x,w.y-s*2.6-20-a*18);ctx.globalAlpha=1;}}

/* ---- clicking my pet opens its window ---- */
document.addEventListener('pointerdown',ev=>{if(ev.target!==cv||!PETW.me||!P||!running)return;
  if(ev.pointerType==='touch'&&!ev.__joyTap)return; // the joystick decides first; its tap comes back as __joyTap
  const sc=screenAt(ev),w=PETW.me,p=proj(w.x,w.y);if(Math.hypot(p.x-sc.x,p.y-w.d.size-sc.y)>w.d.size+12)return;
  ev.stopImmediatePropagation();sfx('click');openPanel('pet');},true);

/* ---- the pet window ---- */
PANELS.pet=()=>{const p=P.pet;
  if(!petOk(p))return `<h2>Companion</h2><div class="sub">You have no companion yet. Buy a <b>Taming Charm</b> at the General Store, wear down a tameable monster, then use the charm on it.</div><h3>Monsters you can tame</h3><div class="dv">`+
    Object.entries(PETS).map(([k,v])=>`<div><span>${esc(MOBS[k].name)}</span><span>${v.txt}</span></div>`).join('')+`</div>`;
  const kind=MOBS[p.k],h=Math.round(p.happy),mood=h>=80?'Delighted':h>=PET_FOND?'Happy':h>=20?'Peckish':'Starving';
  return `<h2>${esc(petName(p))}</h2><div class="sub">${esc(kind.name)} · ${p.out?'following you':'resting'}</div>`+
    `<div class="grow2"><input id="petName" maxlength="16" autocomplete="off" placeholder="Give it a name" value="${esc(p.name||'')}" aria-label="Companion name"><button class="btn small" data-act="petname">Rename</button></div>`+
    `<h3>Happiness · ${mood}</h3><div class="petbar" role="meter" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${h}" aria-label="Happiness"><i style="width:${h}%"></i></div>`+
    `<div class="sub">Bonus while out and happy (${PET_FOND}+): <b class="${p.out&&h>=PET_FOND?'gold':'muted'}">${PETS[p.k].txt}</b>. Happiness slowly drops while it's out; Pet Snacks (General Store) raise it.</div>`+
    `<div class="tbtns" style="justify-content:flex-start"><button class="btn small" data-act="petfeed" ${invFind('petsnack')?'':'disabled'}>Feed a Pet Snack (${invFind('petsnack')?invFind('petsnack').n:0})</button>`+
    `<button class="btn small" data-act="petout">${p.out?'Send to rest':'Call it'}</button>`+
    (PETW.arm?`<button class="btn small bad" data-act="petrelease">Really release ${esc(petName(p))}?</button>`:`<button class="btn small" data-act="petarm">Release</button>`)+`</div>`;};
PANEL_ACTS.petname=()=>{const v=clean(document.getElementById('petName').value,16);P.pet.name=v;PETW.me&&(PETW.me.name=petName(P.pet));save();refreshPanel();addLog(v?`Your companion is now called ${v}.`:'Your companion has no name now.');};
PANEL_ACTS.petfeed=()=>useItem('petsnack');
PANEL_ACTS.petout=()=>{if(!P.pet.out&&P.pet.happy<=0){addLog(`${petName(P.pet)} is too hungry to come out. Feed it first.`,'l-bad');return;}P.pet.out=!P.pet.out;PETW.decay=0;S=computeStats();save();refreshPanel();};
PANEL_ACTS.petarm=()=>{PETW.arm=true;refreshPanel();};
PANEL_ACTS.petrelease=()=>{const n=petName(P.pet);P.pet=null;PETW.me=null;PETW.arm=false;S=computeStats();save();addLog(`You said goodbye to ${n}. It wanders off happily.`);refreshPanel();};
PANEL_CLOSE.pet=()=>{PETW.arm=false;};
const _chatCommandPet=chatCommand;
chatCommand=function(k,arg){if(k==='pet'||k==='pets'||k==='companion'){openPanel('pet');return true;}return _chatCommandPet(k,arg);};
CMD_HELP.push(['/pet','your companion: name, feed, rest, release']);

/* ---- their item pictures: a heart charm on a cord, and a round biscuit ---- */
const _drawItemIconPet=drawItemIcon;
drawItemIcon=function(g,id){
  if(id==='tamecharm'){g.lineWidth=1.6;g.strokeStyle='#3a2418';g.beginPath();g.moveTo(9,4);g.quadraticCurveTo(16,10,23,4);g.stroke();
    g.beginPath();g.moveTo(16,28);g.bezierCurveTo(2,18,6,7,16,13);g.bezierCurveTo(26,7,30,18,16,28);g.closePath();g.fillStyle='#e88ac0';g.fill();g.stroke();
    g.fillStyle='rgba(255,255,255,.6)';g.beginPath();g.ellipse(11.5,14,2.6,1.6,-.6,0,7);g.fill();return;}
  if(id==='petsnack'){g.lineWidth=1.6;g.strokeStyle='#3a2418';g.beginPath();g.arc(16,16,11,0,7);g.fillStyle='#e0a050';g.fill();g.stroke();
    g.fillStyle='#8a5424';for(const [x,y] of [[12,12],[20,13],[15,20],[21,19],[10,18]]){g.beginPath();g.arc(x,y,1.4,0,7);g.fill();}return;}
  return _drawItemIconPet(g,id);};
