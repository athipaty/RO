"use strict";
/* ================= #44 mounts =================
   Tobin's stable at the Waystation sells mounts: a sturdy Meadow Hopper or a swift Grey Lupe. R (remappable),
   the phone menu's Ride button or /ride gets you in the saddle; everyone sees you riding (presence field rd).
   You hop off when you attack, cast or get hurt, and mounts stay outside dungeons, the arena and Emberkeep. */
const MOUNTS={
  hopper:{name:'Meadow Hopper',lv:10,price:3000,speed:.3,scale:2.1,col:'#d8b48a',saddle:'#8e2a22'},
  greylupe:{name:'Grey Lupe',lv:25,price:9000,speed:.5,scale:1.8,col:'#8a909c',saddle:'#2e4f8e'},
};
const RIDE={mob:{},them:new Map()};
if(typeof KEY_ACTIONS!=='undefined'&&!KEY_ACTIONS.some(a=>a[0]==='ride')){KEY_ACTIONS.splice(KEY_ACTIONS.findIndex(a=>a[0]==='sit')+1,0,['ride','r','Ride']);if(typeof rebuildKeys==='function')rebuildKeys();}
const owned=()=>Array.isArray(P.mounts)?P.mounts.filter(k=>MOUNTS[k]):[];
const rideOk=()=>!(Z.D.dungeon||zoneId==='arena'||zoneId==='keep');
const riding=()=>!!(P&&P.riding&&MOUNTS[P.riding]&&!P.dead);
function mountUp(k){k=k||P.mountPick||owned()[0];if(!k){addLog("You don't have a mount yet. Tobin at the Waystation in Hearthvale keeps a stable.",'l-bad');return;}
  if(!rideOk()){addLog("Mounts don't fit in here. Walk on your own feet for now.",'l-bad');return;}
  if(P.dead||P.casting)return;P.riding=k;P.mountPick=k;P.sitting=false;S=computeStats();sfx('jobup');
  fx.push({k:'ring',x:P.x,y:P.y,r:36,col:'#ffe7a0',t0:now,dur:.5});NET.lastSent='';NET.sendT=0;addLog(`You climb onto your ${MOUNTS[k].name}.`);}
function dismount(why){if(!P||!P.riding)return;P.riding=null;S=computeStats();NET.lastSent='';NET.sendT=0;if(why)addLog(why);}
function toggleRide(){if(riding())dismount('You hop off.');else mountUp();}
// the speed boost
const _computeStatsRide=computeStats;
computeStats=function(){const s=_computeStatsRide();if(riding())s.speed=Math.round(s.speed*(1+MOUNTS[P.riding].speed));return s;};
// off when fighting, hurt, casting, or somewhere mounts can't go
const _basicAttackRide=basicAttack;basicAttack=function(t){if(riding())dismount();return _basicAttackRide(t);};
const _useSkillRide=useSkill;useSkill=function(id){if(riding())dismount();return _useSkillRide(id);};
const _hurtPlayerRide=hurtPlayer;hurtPlayer=function(d,src){if(riding())dismount('You were knocked out of the saddle!');return _hurtPlayerRide(d,src);};
const _enterZoneRide=enterZone;enterZone=function(id,from){const r=_enterZoneRide(id,from);if(P&&P.riding&&!rideOk()){P.riding=null;S=computeStats();addLog('You leave your mount at the entrance.');}return r;};

/* ---- drawing: the mount underneath, the rider sitting on top ---- */
function mountBody(key,k){let m=RIDE.mob[key];const M=MOUNTS[k];
  if(!m||m.k!==k){const d=MOBS[k];m=RIDE.mob[key]={k,ph:Math.random()*6,hitF:-9,face:1,moving:false,x:0,y:0,d:{...d,size:Math.round(d.size*M.scale),col:M.col,boss:false}};}return m;}
function drawMount(p,k){const m=mountBody(p===P?'me':p.name,k),M=MOUNTS[k];m.x=p.x;m.y=p.y;m.face=p.face<0?-1:1;m.moving=!!p.moving;
  drawMob(m);const s=m.d.size,bob=m.moving?Math.abs(Math.sin((now+m.ph)*12))*2:0;
  // a saddle
  ctx.fillStyle=M.saddle;ctx.strokeStyle='#2a1c14';ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(p.x,p.y-s*1.05-bob,s*.55,s*.28,0,0,7);ctx.fill();ctx.stroke();
  ctx.fillStyle='#e8c25a';ctx.beginPath();ctx.arc(p.x+m.face*s*.35,p.y-s*1.1-bob,2,0,7);ctx.fill();return s*1.05+bob;}
const _drawPlayerRide=drawPlayer;
drawPlayer=function(p,wid){const k=p===P?(riding()?P.riding:null):p.riding;
  if(!k||!MOUNTS[k]||p.dead)return _drawPlayerRide(p,wid);
  const lift=drawMount(p,k);ctx.save();ctx.translate(0,-lift+6);try{_drawPlayerRide({...p,sitting:true,moving:false,eq:p.eq,riding:null},wid);}finally{ctx.restore();}};
// others: what they ride (presence field rd)
const _drawOtherRide=drawOther;
drawOther=function(o){if(!o.rd)return _drawOtherRide(o);const atk=o.atkFaceT&&now-o.atkFaceT<.4;
  drawPlayer({name:o.n,look:o.look,x:o.rx,y:o.ry,cls:o.cls,face:atk?o.atkFace:o.face,moving:o.moving,walkT:o.walkT,sitting:false,hat:o.hat,fc:o.fc,mo:o.mo,armor:o.ar||null,back:o.back,riding:o.rd,dead:o.dead},o.wid);};
function rideRead(v){return typeof v==='string'&&MOUNTS[v]?v:null;}
function ridePresence(){return riding()?P.riding:null;}

/* ---- Tobin's stable, added to the Waystation window ---- */
const _refreshPanelRide=refreshPanel;
refreshPanel=function(){const r=_refreshPanelRide.apply(this,arguments);
  if(panelKind==='warp'&&P&&!panel.querySelector('.stable')){const own=owned();
    let h=`<div class="stable"><h3>Stable</h3><div class="sub">“A good mount saves a lot of boot leather. Press R to ride; you'll hop off when you fight.”</div>`;
    for(const [k,M] of Object.entries(MOUNTS)){const has=own.includes(k),lvOk=P.lv>=M.lv;
      h+=`<div class="row"><img class="ico img" src="${mountIconURL(k)}" alt="" width="30" height="30"><div class="grow"><div class="nm">${M.name} <span class="muted">· Lv ${M.lv}+ · +${Math.round(M.speed*100)}% speed</span></div><div class="ds">${has?(P.riding===k?'You are riding it.':'Yours.'):lvOk?`${fmt(M.price)} gold`:`Needs base level ${M.lv}`}</div></div>`+
        (has?`<button class="btn small" data-act="ridepick" data-arg="${k}">${P.riding===k?'Hop off':'Ride'}</button>`:`<button class="btn small" data-act="mountbuy" data-arg="${k}" ${lvOk&&P.gold>=M.price?'':'disabled'}>Buy</button>`)+`</div>`;}
    panel.insertAdjacentHTML('beforeend',h+'</div>');}
  return r;};
PANEL_ACTS.mountbuy=k=>{const M=MOUNTS[k];if(!M||owned().includes(k)||P.lv<M.lv||P.gold<M.price)return;P.gold-=M.price;P.mounts=[...owned(),k];P.mountPick=k;sfx('fanfare');
  addLog(`Tobin hands you the reins: the ${M.name} is yours! Press R to ride.`,'l-rare');save();refreshPanel();};
PANEL_ACTS.ridepick=k=>{if(P.riding===k)dismount('You hop off.');else{P.mountPick=k;closePanel();mountUp(k);}refreshPanel();};
// a little picture for the stable list (its own canvas, not an item)
const MOUNT_ICON={};
function mountIconURL(k){if(MOUNT_ICON[k])return MOUNT_ICON[k];const M=MOUNTS[k],c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d');g.scale(2,2);
  g.lineWidth=1.6;g.strokeStyle='#2a1c14';g.fillStyle=M.col;g.beginPath();g.ellipse(16,19,11,7,0,0,7);g.fill();g.stroke();g.beginPath();g.arc(25,12,5,0,7);g.fill();g.stroke();
  g.fillStyle=M.saddle;g.beginPath();g.ellipse(14,13,6,3,0,0,7);g.fill();g.stroke();g.fillStyle='#2a1c14';g.beginPath();g.arc(26.5,11,1.2,0,7);g.fill();
  return MOUNT_ICON[k]=c.toDataURL();}

// keys, menu and chat
window.addEventListener('keydown',ev=>{if(!running||!P||ev.target.tagName==='INPUT'||ev.target.tagName==='TEXTAREA'||ev.ctrlKey||ev.metaKey||ev.altKey)return;if(ev.key.toLowerCase()==='r'){ev.preventDefault();toggleRide();}});
(()=>{const m=document.getElementById('menu');if(!m||document.getElementById('mRide'))return;const b=document.createElement('button');b.className='dk only-touch';b.id='mRide';b.type='button';b.title='Ride your mount (R)';
  b.innerHTML='<i>🐾</i><span>Ride</span>';b.addEventListener('click',()=>{$('#dock').classList.remove('open');toggleRide();});m.appendChild(b);})();
const _chatCommandRide=chatCommand;
chatCommand=function(k,arg){if(k==='ride'||k==='mount'){toggleRide();return true;}if(k==='dismount'){dismount('You hop off.');return true;}return _chatCommandRide(k,arg);};
CMD_HELP.push(['/ride, or R','get on or off your mount']);
