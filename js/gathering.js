"use strict";
/* ================= gathering: herbs, ore and fishing =================
   Each field region has a few gathering spots that sparkle: herb patches (meadow, woods, caverns), ore veins (dunes,
   crypt, frost, caverns) and fishing spots at pond edges. Tap one: you walk there and a short timing game starts: stop
   the moving marker in the gold zone for the best haul (and a chance of a rare find), in the green zone for a good one.
   A spot rests 5 minutes after you use it (each player has their own). What you gather goes into brews and food (/craft). */
Object.assign(ITEMS,{
  mossherb:{name:'Moss Herb',type:'etc',price:8,col:'#6fb04f',g:'❦',w:1,desc:'A soft green herb. Brewed into tonics.'},
  sunpetal:{name:'Sun Petal',type:'etc',price:70,col:'#ffd24a',g:'✿',w:1,desc:'A rare golden petal. Brewed into strong tonics and soups.'},
  ironchunk:{name:'Iron Chunk',type:'etc',price:12,col:'#8a909c',g:'◆',w:3,desc:'Raw iron. Six of them smelt into Ember Ore.'},
  pondfish:{name:'Pond Fish',type:'etc',price:10,col:'#7fb0d8',g:'≈',w:2,desc:'A fresh fish. Cook it into Grilled Fish.'},
  goldfin:{name:'Goldfin',type:'etc',price:140,col:'#ffc04a',g:'≈',w:2,desc:'A rare golden fish. Cooked into Golden Soup, or sold for a lot.'},
  grilledfish:{name:'Grilled Fish',type:'use',price:60,col:'#d8955a',g:'≈',brew:{id:'grilledfish',s:300,b:{maxhp:150,regen:4}},desc:'For 5 minutes: +150 Max HP and +4 HP regen.'},
  goldsoup:{name:'Golden Soup',type:'use',price:400,col:'#ffd27a',g:'◒',brew:{id:'goldsoup',s:600,b:{str:3,agi:3,vit:3,int:3,dex:3,luk:3}},desc:'For 10 minutes: +3 to every stat.'}});
if(typeof BREWS!=='undefined')BREWS.push(['red',4,{mossherb:3},0],['blue',2,{mossherb:2,sunpetal:1},20],['grilledfish',2,{pondfish:2},10],['goldsoup',1,{goldfin:1,sunpetal:1,pondfish:2},100],['emberore',1,{ironchunk:6},300]);
const GATHER={herb:{name:'Herb patch',item:'mossherb',rare:'sunpetal',col:'#7fd36a'},ore:{name:'Ore vein',item:'ironchunk',rare:['emberore','glintstone'],col:'#c8d0dc'},fish:{name:'Fishing spot',item:'pondfish',rare:'goldfin',col:'#9fd3ff'}};
const GATHER_KINDS=z=>{const t=z.D.theme;return t==='heights'?['herb','ore']:t==='meadow'||t==='woods'||t==='fen'||t==='farms'?['herb']:t==='cave'?['herb','ore']:['dunes','crypt','frost'].includes(t)?['ore']:[];};
/* spot key -> time it is ready again (Date.now ms), kept on the hero and saved, so reloading the page does not reset it */
const gRest=()=>{if(!P)return {};if(!P.gatherRest||typeof P.gatherRest!=='object')P.gatherRest={};const R=P.gatherRest,t=Date.now();for(const k in R)if(!(R[k]>t))delete R[k];return R;};
if(typeof SAVE_EXTRA!=='undefined')SAVE_EXTRA.push('gatherRest');
function gatherSeed(id){let h=2166136261;for(const c of id+'|g')h=Math.imul(h^c.charCodeAt(0),16777619);return ()=>{h=Math.imul(h^(h>>>15),2246822507);h=Math.imul(h^(h>>>13),3266489909);return ((h^=h>>>16)>>>0)/4294967296;};}
function gatherPlace(z){if(!z||z.D.safe||!z.D.mobs||z._gather)return;z._gather=1;const R=gatherSeed(z.id),W=z.w,H=z.h,t=z.t,free=(x,y)=>x>2&&y>2&&x<W-3&&y<H-3&&!BLOCK[t[y*W+x]];
  const near=(x,y)=>z.objs.some(o=>o.kind==='gather'&&Math.abs(o.x-(x+.5)*TILE)<6*TILE&&Math.abs(o.y-(y+.5)*TILE)<6*TILE);
  const add=(kind,x,y)=>z.objs.push({x:(x+.5)*TILE,y:(y+.5)*TILE,kind:'gather',g:kind,key:z.id+':'+x+','+y,v:0,sc:1});
  for(const kind of GATHER_KINDS(z)){let n=0,tries=0;while(n<4&&tries++<400){const x=Math.floor(R()*W),y=Math.floor(R()*H);if(free(x,y)&&!near(x,y)){add(kind,x,y);n++;}}}
  // fishing: ground right next to water
  let n=0,tries=0;while(n<2&&tries++<3000){const x=Math.floor(R()*W),y=Math.floor(R()*H);if(!free(x,y)||near(x,y))continue;
    if([[1,0],[-1,0],[0,1],[0,-1]].some(([a,b])=>t[(y+b)*W+x+a]===3)){add('fish',x,y);n++;}}}
{const _gzG=getZone;getZone=function(id){const z=_gzG.apply(this,arguments);try{gatherPlace(z);}catch(e){}return z;};}
const gReady=o=>!((P&&P.gatherRest&&P.gatherRest[o.key])>Date.now());
// drawing the spots (depth-sorted with everything else, as map objects)
{const _doG=drawObj;drawObj=function(o){if(o.kind!=='gather')return _doG.apply(this,arguments);const p=proj(o.x,o.y),x=p.x,y=p.y,ready=gReady(o),G=GATHER[o.g];ctx.save();if(!ready)ctx.globalAlpha=.35;
  ctx.lineWidth=1.3;ctx.strokeStyle='#2a1c14';
  if(o.g==='herb'){for(const [dx,dy,r] of [[-6,-2,6],[5,-3,7],[0,-8,6]]){ctx.fillStyle='#4e8a3a';ctx.beginPath();ctx.ellipse(x+dx,y+dy,r,r*.7,0,0,7);ctx.fill();ctx.stroke();}
    ctx.fillStyle='#ffd24a';ctx.beginPath();ctx.arc(x+2,y-10,2.2,0,7);ctx.arc(x-5,y-5,1.8,0,7);ctx.fill();}
  else if(o.g==='ore'){ctx.fillStyle='#6a6460';ctx.beginPath();ctx.moveTo(x-12,y+2);ctx.lineTo(x-8,y-10);ctx.lineTo(x+2,y-14);ctx.lineTo(x+12,y-6);ctx.lineTo(x+11,y+3);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.fillStyle='#c8d8e8';for(const [dx,dy] of [[-4,-6],[4,-8],[6,-2]]){ctx.beginPath();ctx.moveTo(x+dx,y+dy-3);ctx.lineTo(x+dx+2,y+dy);ctx.lineTo(x+dx,y+dy+3);ctx.lineTo(x+dx-2,y+dy);ctx.closePath();ctx.fill();}}
  else{ctx.strokeStyle='rgba(220,240,255,.8)';ctx.lineWidth=1.5;for(let k=0;k<2;k++){const r=6+((now*.8+k*.5)%1)*10;ctx.globalAlpha=(ready?1:.35)*(1-((now*.8+k*.5)%1));ctx.beginPath();ctx.ellipse(x,y,r,r*.45,0,0,7);ctx.stroke();}
    ctx.globalAlpha=ready?.6:.2;ctx.fillStyle='#1a2a3a';ctx.beginPath();ctx.ellipse(x+Math.sin(now*1.5)*4,y,6,2.2,0,0,7);ctx.fill();}
  if(ready){ctx.globalAlpha=.55+.45*Math.sin(now*4+o.x);ctx.fillStyle=G.col;for(let k=0;k<3;k++){const a=now*1.5+k*2.1;ctx.fillRect(x+Math.cos(a)*12-1,y-14+Math.sin(a*1.3)*6-1,2.4,2.4);}}
  ctx.restore();};}
// tapping a spot: walk there, then the timing game
const GT={goal:null,el:null,run:null};
/* map objects (gathering spots, chests) let a tap go to the game when:
   - a finger just touched down: the joystick waits to see if it is a drag and sends a plain tap back (ev.__joyTap) on lift
   - a monster is nearer to the tap than the object (attacking wins) */
function objTapSkip(ev,sc,o,lift){
  if(!ev.__joyTap&&(typeof joyTouch==='function'?joyTouch(ev):ev.pointerType==='touch'))return true;
  const m=typeof mobAt==='function'?mobAt(sc):null;if(!m)return false;
  const p=proj(m.x,m.y),q=proj(o.x,o.y);return Math.hypot(p.x-sc.x,p.y-m.d.size*.9-sc.y)<Math.hypot(q.x-sc.x,q.y-lift-sc.y);}
function gatherAt(sc){if(!Z)return null;let best=null,bd=30;for(const o of Z.objs){if(o.kind!=='gather')continue;const p=proj(o.x,o.y),d=Math.hypot(p.x-sc.x,p.y-8-sc.y);if(d<bd){bd=d;best=o;}}return best;}
addEventListener('pointerdown',ev=>{if(ev.target!==cv||!P||P.dead||!running||GT.run)return;if(typeof npcBusy==='function'&&npcBusy())return;const sc=screenAt(ev),o=gatherAt(sc);if(!o||objTapSkip(ev,sc,o,8))return;
  ev.stopPropagation();ev.preventDefault();if(!gReady(o)){floatT(o.x,o.y-30,'Resting…','#c8d0dc',12);return;}
  P.target=null;P.queued=null;P.sitting=false;if(Math.hypot(P.x-o.x,P.y-o.y)<56)gatherStart(o);else{GT.goal=o;pathTo(o.x,o.y+10,true);}},true);
setInterval(()=>{const o=GT.goal;if(!o||!P||GT.run)return;if(P.target||P.dead||!Z||!Z.objs.includes(o)){GT.goal=null;return;}if(Math.hypot(P.x-o.x,P.y-o.y)<56){GT.goal=null;P.path=[];gatherStart(o);}},150);
function gatherStart(o){const G=GATHER[o.g];let el=GT.el;
  if(!el){el=GT.el=document.createElement('div');el.id='gatherBox';el.setAttribute('role','dialog');document.body.appendChild(el);el.addEventListener('pointerdown',ev=>{ev.stopPropagation();ev.preventDefault();gatherStop();});}
  const gw=.09+Math.random()*.03,gz=.25+Math.random()*.5;GT.run={o,t0:performance.now(),gz,gw,sp:.9+Math.random()*.5};
  el.innerHTML=`<div class="gtt">${esc(G.name)}</div><div class="gbar"><i class="gg" style="left:${(gz-gw*2.2)*100}%;width:${gw*4.4*100}%"></i><i class="gy" style="left:${(gz-gw/2)*100}%;width:${gw*100}%"></i><b></b></div><div class="gts">Tap to stop in the gold!</div>`;
  el.hidden=false;sfx('click');const tick=()=>{const r=GT.run;if(!r)return;const t=(performance.now()-r.t0)/1000*r.sp,pos=1-Math.abs((t%2)-1);r.pos=pos;const m=el.querySelector('.gbar b');if(m)m.style.left=(pos*100)+'%';
    if(performance.now()-r.t0>6000){gatherStop();return;}requestAnimationFrame(tick);};requestAnimationFrame(tick);}
function gatherStop(){const r=GT.run;if(!r)return;GT.run=null;const G=GATHER[r.o.g],d=Math.abs((r.pos||0)-r.gz),gold=d<=r.gw/2,good=d<=r.gw*2.2;
  let n=gold?3:good?2:1,got=[];giveItem(G.item,n);got.push(`${ITEMS[G.item].name} ×${n}`);
  if(Math.random()<(gold?.3:good?.1:.02)){const rare=Array.isArray(G.rare)?G.rare[Math.floor(Math.random()*G.rare.length)]:G.rare;giveItem(rare,1);got.push(ITEMS[rare].name);sfx('rare');}
  gRest()[r.o.key]=Date.now()+300000;const txt=gold?'Perfect!':good?'Good!':'Too early… or too late';
  floatT(P.x,P.y-50,txt,gold?'#ffcf5a':good?'#9fe8b0':'#c8d0dc',15);addLog(`${txt} You gathered ${got.join(', ')}.`,'l-loot');sfx(gold?'fanfare':'pickup');
  const el=GT.el;el.querySelector('.gts').textContent=txt;setTimeout(()=>{el.hidden=true;},650);if(typeof save==='function')save();}
// walking off or a fight closes the game
setInterval(()=>{const r=GT.run;if(r&&P&&(P.dead||Math.hypot(P.x-r.o.x,P.y-r.o.y)>90||(P.hurtT&&now-P.hurtT<.2))){GT.run=null;if(GT.el)GT.el.hidden=true;}},200);
if(typeof TH!=='undefined')Object.assign(TH,{'Herb patch':'แปลงสมุนไพร','Ore vein':'สายแร่','Fishing spot':'จุดตกปลา','Tap to stop in the gold!':'แตะให้หยุดในช่องสีทอง!','Perfect!':'สมบูรณ์แบบ!','Good!':'ดี!','Too early… or too late':'เร็วไป… หรือช้าไป','Resting…':'กำลังฟื้นตัว…'});
if(typeof TH_PAT!=='undefined')TH_PAT.unshift([/^(Perfect!|Good!|Too early… or too late) You gathered (.+)\.$/,(m,a,b)=>`${thText(a)} คุณเก็บได้ ${b}`]);
// item descriptions in Thai
if(typeof LANG!=='undefined'&&LANG==='th')Object.assign(ITEMS.mossherb,{desc:'สมุนไพรสีเขียวนุ่ม ใช้ต้มยา'}),Object.assign(ITEMS.sunpetal,{desc:'กลีบดอกสีทองหายาก ใช้ต้มยาแรงและซุป'}),Object.assign(ITEMS.ironchunk,{desc:'เหล็กดิบ หกก้อนหลอมเป็น Ember Ore'}),
  Object.assign(ITEMS.pondfish,{desc:'ปลาสด นำไปย่างเป็นปลาย่าง'}),Object.assign(ITEMS.goldfin,{desc:'ปลาทองหายาก ทำซุปทองคำ หรือขายได้ราคาดี'}),
  Object.assign(ITEMS.grilledfish,{desc:'5 นาที: HP สูงสุด +150 และฟื้น HP +4'}),Object.assign(ITEMS.goldsoup,{desc:'10 นาที: ทุกสถานะ +3'});
