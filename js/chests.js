"use strict";
/* ================= treasure chests =================
   Every field region hides 3 chests (one of them locked: it needs a Rusty Key). They refill every day (Thailand time),
   for each character. Tap one to walk there and open it: gold, materials from the monsters around, sometimes a Rusty Key;
   locked chests hold better things (a chance of a sigil, refining stones). The quest log counts the chests you have
   found across Embervale. */
ITEMS.rustykey={name:'Rusty Key',type:'etc',price:50,col:'#b07a42',g:'⚷',w:1,keep:1,desc:'Opens a locked treasure chest.'};
if(typeof LANG!=='undefined'&&LANG==='th')ITEMS.rustykey.desc='ใช้เปิดหีบสมบัติที่ล็อกอยู่';
function chestPlace(z){if(!z||z.D.safe||!z.D.mobs||z._chests)return;z._chests=1;let h=2166136261;for(const c of z.id+'|chest')h=Math.imul(h^c.charCodeAt(0),16777619);
  const R=()=>{h=Math.imul(h^(h>>>15),2246822507);h=Math.imul(h^(h>>>13),3266489909);return ((h^=h>>>16)>>>0)/4294967296;};
  const W=z.w,H=z.h,t=z.t,sp=z.spawn||{x:0,y:0};let n=0,tries=0;
  while(n<3&&tries++<600){const x=2+Math.floor(R()*(W-4)),y=2+Math.floor(R()*(H-4));if(BLOCK[t[y*W+x]])continue;
    const wx=(x+.5)*TILE,wy=(y+.5)*TILE;if(Math.hypot(wx-sp.x,wy-sp.y)<10*TILE)continue;
    // prefer tucked-away spots: next to trees or rocks
    const tucked=[[1,0],[-1,0],[0,1],[0,-1]].filter(([a,b])=>BLOCK[t[(y+b)*W+x+a]]).length;if(tucked<1&&R()<.75)continue;
    if(z.objs.some(o=>o.kind==='chest'&&Math.hypot(o.x-wx,o.y-wy)<12*TILE))continue;
    z.objs.push({x:wx,y:wy,kind:'chest',key:z.id+'#'+n,locked:n===2,v:0,sc:1});n++;}}
{const _gzC=getZone;getZone=function(id){const z=_gzC.apply(this,arguments);try{chestPlace(z);}catch(e){}return z;};}
const CDAY=()=>new Date(Date.now()+7*3600e3).toISOString().slice(0,10);
function chestState(){const s=P.chests&&typeof P.chests==='object'?P.chests:(P.chests={day:'',open:{},found:{}});if(s.day!==CDAY()){s.day=CDAY();s.open={};}s.found=s.found||{};return s;}
const chestOpen=o=>!!(P&&chestState().open[o.key]);
{const _doC=drawObj;drawObj=function(o){if(o.kind!=='chest')return _doC.apply(this,arguments);const p=proj(o.x,o.y),x=p.x,y=p.y,op=chestOpen(o);ctx.save();ctx.lineWidth=1.4;ctx.strokeStyle='#2a1c14';
  ctx.fillStyle='rgba(0,0,0,.25)';ctx.beginPath();ctx.ellipse(x,y+2,14,4,0,0,7);ctx.fill();
  ctx.fillStyle=o.locked?'#5a4a6a':'#8a5a2a';ctx.beginPath();ctx.roundRect(x-12,y-12,24,14,2);ctx.fill();ctx.stroke();
  ctx.fillStyle='#e8c25a';ctx.fillRect(x-12,y-7,24,2.5);ctx.fillRect(x-1.5,y-12,3,14);
  if(op){ctx.fillStyle=o.locked?'#4a3a5a':'#6a4420';ctx.beginPath();ctx.moveTo(x-12,y-12);ctx.lineTo(x-10,y-22);ctx.lineTo(x+14,y-22);ctx.lineTo(x+12,y-12);ctx.closePath();ctx.fill();ctx.stroke();ctx.globalAlpha=.5;}
  else{ctx.fillStyle=o.locked?'#6a5a7a':'#a06a32';ctx.beginPath();ctx.moveTo(x-12,y-12);ctx.quadraticCurveTo(x,y-22,x+12,y-12);ctx.closePath();ctx.fill();ctx.stroke();
    if(o.locked){ctx.fillStyle='#c8c8d0';ctx.beginPath();ctx.roundRect(x-3,y-10,6,6,1);ctx.fill();ctx.stroke();}
    ctx.globalAlpha=.5+.5*Math.sin(now*3+o.x);ctx.fillStyle='#ffe08a';for(let k=0;k<3;k++){const a=now*1.2+k*2.1;ctx.fillRect(x+Math.cos(a)*14-1,y-18+Math.sin(a)*5-1,2.4,2.4);}}
  ctx.restore();};}
const CH={goal:null};
function chestAt(sc){if(!Z)return null;let best=null,bd=30;for(const o of Z.objs){if(o.kind!=='chest')continue;const p=proj(o.x,o.y),d=Math.hypot(p.x-sc.x,p.y-10-sc.y);if(d<bd){bd=d;best=o;}}return best;}
addEventListener('pointerdown',ev=>{if(ev.target!==cv||!P||P.dead||!running)return;if(typeof npcBusy==='function'&&npcBusy())return;const o=chestAt(screenAt(ev));if(!o)return;
  ev.stopPropagation();ev.preventDefault();if(chestOpen(o)){floatT(o.x,o.y-30,'Empty: it refills tomorrow','#c8d0dc',12);return;}
  P.target=null;P.queued=null;P.sitting=false;if(Math.hypot(P.x-o.x,P.y-o.y)<56)chestOpenNow(o);else{CH.goal=o;pathTo(o.x,o.y+12,true);}},true);
setInterval(()=>{const o=CH.goal;if(!o||!P)return;if(P.target||P.dead||!Z||!Z.objs.includes(o)){CH.goal=null;return;}if(Math.hypot(P.x-o.x,P.y-o.y)<56){CH.goal=null;P.path=[];chestOpenNow(o);}},150);
function chestOpenNow(o){if(chestOpen(o))return;if(o.locked&&!takeItem('rustykey',1)){floatT(o.x,o.y-30,'Locked: it needs a Rusty Key','#ffb0a0',13);addLog('This chest is locked. Rusty Keys come from other treasure chests and the weekly bounty chest.','l-bad');return;}
  const s=chestState();s.open[o.key]=1;const first=!s.found[o.key];s.found[o.key]=1;
  const lv=Math.max(...(Z.D.mobs||[]).map(([id])=>MOBS[id]?MOBS[id].lv:1)),got=[];
  const gold=Math.round(lv*(o.locked?90:35)*(.8+Math.random()*.4));P.gold+=gold;got.push(`${fmt(gold)} gold`);
  const mats=[...new Set((Z.D.mobs||[]).flatMap(([id])=>(MOBS[id]&&MOBS[id].drops||[]).map(d=>d[0]).filter(i=>ITEMS[i]&&ITEMS[i].type==='etc')))];
  for(let k=0;k<(o.locked?3:2)&&mats.length;k++){const i=mats[Math.floor(Math.random()*mats.length)],n=1+Math.floor(Math.random()*3);giveItem(i,n);got.push(`${ITEMS[i].name} ×${n}`);}
  if(!o.locked&&Math.random()<.25){giveItem('rustykey',1);got.push('Rusty Key');}
  if(o.locked){if(Math.random()<.3){const sig=(Z.D.mobs||[]).map(([id])=>id+'_sig').filter(i=>ITEMS[i]&&!(MOBS[i.slice(0,-4)]||{}).boss);if(sig.length){const i=sig[Math.floor(Math.random()*sig.length)];giveItem(i,1);got.push(ITEMS[i].name);}}
    else{const i=Math.random()<.5?'glintstone':'emberore';giveItem(i,1);got.push(ITEMS[i].name);}}
  sfx('fanfare');fx.push({k:'lvpillar',x:o.x,y:o.y,t0:now,dur:1.2});floatT(o.x,o.y-36,o.locked?'Locked chest opened!':'Treasure!','#ffe08a',15);
  addLog(`${o.locked?'Locked chest':'Treasure chest'}: ${got.join(', ')}.${first?` Chests found: ${Object.keys(s.found).length}/${chestTotal()}.`:''}`,'l-rare');if(typeof save==='function')save();}
function chestTotal(){return Object.keys(ZONES).filter(id=>{const D=ZONES[id];return !D.safe&&D.mobs;}).length*3;}
// the quest log counts them
if(typeof PANELS!=='undefined'&&PANELS.quests){const _pqC=PANELS.quests;PANELS.quests=function(){const h=_pqC.apply(this,arguments);if(!P)return h;const n=Object.keys(chestState().found).length;
  return h+`<h3>Explorer</h3><div class="ds">Treasure chests found: <b>${n}</b> / ${chestTotal()}. Every field region hides three (one locked); they refill daily.</div>`;};}
if(typeof SAVE_EXTRA!=='undefined')SAVE_EXTRA.push('chests');
if(typeof TH!=='undefined')Object.assign(TH,{'Explorer':'นักสำรวจ','Treasure!':'สมบัติ!','Locked chest opened!':'เปิดหีบล็อกแล้ว!','Locked: it needs a Rusty Key':'ล็อกอยู่: ต้องใช้กุญแจสนิม','Empty: it refills tomorrow':'ว่างเปล่า: พรุ่งนี้จะมีของใหม่',
  'This chest is locked. Rusty Keys come from other treasure chests and the weekly bounty chest.':'หีบนี้ล็อกอยู่ กุญแจสนิมได้จากหีบสมบัติอื่นและหีบค่าหัวประจำสัปดาห์','Treasure chests found:':'หีบสมบัติที่พบ:',
  '. Every field region hides three (one locked); they refill daily.':' ทุกดินแดนซ่อนไว้สามใบ (ล็อกหนึ่งใบ) และเติมของใหม่ทุกวัน'});
if(typeof TH_PAT!=='undefined')TH_PAT.unshift([/^(Treasure chest|Locked chest): (.+)\.( Chests found: (\d+)\/(\d+)\.)?$/,(m,a,b,c,d,e)=>`${a==='Locked chest'?'หีบล็อก':'หีบสมบัติ'}: ${b}${c?` พบหีบแล้ว ${d}/${e}`:''}`]);
