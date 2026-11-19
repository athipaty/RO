"use strict";
/* ================= riding worth showing off (v1.38.4) =================
   Every mount is drawn a third bigger, so you sit on it instead of hiding it. Two prestige mounts are sold only at
   the Royal Stables in Aurelmark, each with a trail of its own:
     Aurel Stag   Lv 40, +60% speed: cream-white with golden antlers and a royal-blue blanket; gold sparkles behind
     Emberdrake   Lv 60, +75% speed: a crimson drake, spines down its back, folded wings that beat as it runs;
                  embers fly off it
   All original artwork, drawn in code; they train at Rowan's like any mount. */
Object.assign(MOUNTS,{
  aurelstag:{name:'Aurel Stag',lv:40,price:40000,speed:.6,scale:2,col:'#efe6d2',saddle:'#2a4a8a',royal:true},
  emberdrake:{name:'Emberdrake',lv:60,price:120000,speed:.75,scale:2,col:'#b83a2a',saddle:'#2a1a1a',royal:true}});
Object.assign(MOUNT_LOOK,{
  aurelstag:{body:'#efe6d2',dark:'#c8b898',light:'#fffaf0',belly:'#fffaf0',mane:'#e8dcc0',blanket:'#2a4a8a',trim:'#e8c25a',eye:'#3a2414',horn:'#e8c25a'},
  emberdrake:{body:'#b83a2a',dark:'#7a2018',light:'#e0604a',belly:'#f0b060',mane:'#5a1810',blanket:'#2a1a1a',trim:'#e8c25a',eye:'#ffd040',horn:'#3a2a20'}});
const MOUNT_SCALE=1.35;
MART.trail=[];
function drawRoyalMount(p,k){const L=MOUNT_LOOK[k],key=p===P?'me':(p.name||'?'),f=p.face<0?-1:1,turn=mountTurn(key,p),ph=mountPhase(key,p,k),mv=!!p.moving,stag=k==='aurelstag';
  const tilt=clamp(turn*.42,-.36,.36),fx=.66+.34*Math.cos(turn),x=p.x,y=p.y,c=ctx;c.save();c.lineJoin='round';c.lineCap='round';
  // the trail: gold sparkles for the stag, embers for the drake
  if(mv&&Math.random()<.7)MART.trail.push({x:x-f*20+rnd(-4,4),y:y-rnd(4,20),t0:now,k,vx:-f*rnd(5,20),vy:-rnd(8,24)});
  if(!mv&&!stag&&Math.random()<.08)MART.trail.push({x:x+f*36,y:y-30,t0:now,k,vx:f*rnd(4,10),vy:-rnd(10,20)});
  shadow(x,y+1,26);
  const OL=stag?'#3a2a1a':'#2a0c08',legLen=stag?13:9,bob=mv?Math.sin(ph*2)*1.6:Math.sin(now*2)*.4,by=(stag?-31:-24)+bob;
  c.save();c.translate(x,y);c.scale(f*fx,1);c.translate(0,-18);c.rotate(tilt);c.translate(0,18);c.lineWidth=1.6;c.strokeStyle=OL;
  const leg=(lx,beat,far)=>{const a=mv?Math.sin(ph+beat)*.6:0,bend=mv?Math.max(0,Math.sin(ph+beat+1.4))*.9:0;
    c.save();c.translate(lx,by+6);c.rotate(a);c.fillStyle=far?L.dark:L.body;c.beginPath();c.roundRect(-2.4,0,4.8,legLen,2.4);c.fill();c.stroke();
    c.translate(0,legLen-1);c.rotate(-bend*(lx>0?1:-1)*.8);c.beginPath();c.roundRect(-2,0,4,legLen,2);c.fill();c.stroke();
    c.fillStyle=stag?'#5a4a3a':L.dark;c.beginPath();c.ellipse(1,legLen,stag?2.6:3.6,stag?2:2.2,0,0,7);c.fill();if(!stag){c.fillStyle='#f0e0c0';for(const d of [-1.5,1.5,3.5]){c.beginPath();c.arc(d+1,legLen+1.5,.8,0,7);c.fill();}}c.restore();};
  leg(-13,Math.PI,true);leg(12,Math.PI*1.5,true);
  // the tail: a white flick for the stag, a long thick tail with a spade tip for the drake
  const tw=mv?Math.sin(ph*1.5)*5:Math.sin(now*2)*2;
  if(stag){c.fillStyle='#fffaf0';c.beginPath();c.ellipse(-22,by-5+tw*.3,4,6,-.6,0,7);c.fill();c.stroke();}
  else{c.fillStyle=L.body;c.beginPath();c.moveTo(-18,by-3);c.quadraticCurveTo(-34,by+2+tw,-46,by-4+tw*1.4);c.lineTo(-44,by+2+tw*1.4);c.quadraticCurveTo(-32,by+8+tw,-17,by+5);c.closePath();c.fill();c.stroke();
    c.fillStyle=L.dark;c.beginPath();c.moveTo(-46,by-4+tw*1.4);c.lineTo(-54,by-1+tw*1.4);c.lineTo(-46,by+5+tw*1.4);c.lineTo(-44,by+1+tw*1.4);c.closePath();c.fill();c.stroke();}
  // the body
  const g=c.createLinearGradient(0,by-12,0,by+10);g.addColorStop(0,L.light);g.addColorStop(.55,L.body);g.addColorStop(1,L.dark);
  c.fillStyle=g;c.beginPath();c.ellipse(-2,by,stag?21:23,stag?10:11.5,-.04,0,7);c.fill();c.stroke();
  c.fillStyle=L.belly;c.beginPath();c.ellipse(3,by+6,13,4,0,0,7);c.fill();
  if(!stag){c.globalAlpha=.35;c.strokeStyle='#5a1810';c.lineWidth=1;for(let i=0;i<5;i++){c.beginPath();c.arc(-10+i*6,by-1,3,Math.PI*.2,Math.PI*.8);c.stroke();}c.globalAlpha=1;c.strokeStyle=OL;c.lineWidth=1.6;
    // spines along the back
    c.fillStyle=L.dark;for(let i=0;i<6;i++){const sx=-16+i*6,sy=by-10+Math.abs(i-2.5)*.6;c.beginPath();c.moveTo(sx-3,sy+2);c.lineTo(sx,sy-6);c.lineTo(sx+3,sy+2);c.closePath();c.fill();c.stroke();}}
  else{c.fillStyle='rgba(255,255,255,.55)';for(const [sx,sy] of [[-10,-3],[-4,-5],[-14,1]]){c.beginPath();c.arc(sx,by+sy,1.5,0,7);c.fill();}}
  c.fillStyle=L.body;c.beginPath();c.ellipse(13,by-2,10,10,0,0,7);c.fill();c.stroke();
  leg(-9,0,false);leg(15,Math.PI*.5,false);
  // the drake's folded wings: they lift and beat while running
  if(!stag){const beat=mv?Math.sin(ph*1.5)*.35:Math.sin(now*1.2)*.08;c.save();c.translate(-2,by-8);c.rotate(-.35+beat);
    c.fillStyle='#8a2418';c.beginPath();c.moveTo(0,0);c.lineTo(-6,-22);c.lineTo(-14,-14);c.lineTo(-20,-18);c.lineTo(-24,-6);c.quadraticCurveTo(-12,0,0,0);c.closePath();c.fill();c.stroke();
    c.strokeStyle='#5a1810';c.lineWidth=1;for(const [ex,ey] of [[-6,-22],[-14,-14],[-20,-18]]){c.beginPath();c.moveTo(0,0);c.lineTo(ex,ey);c.stroke();}c.restore();c.strokeStyle=OL;c.lineWidth=1.6;}
  // neck and head
  if(stag){const hy=by-26;c.fillStyle=L.body;c.beginPath();c.moveTo(10,by-6);c.lineTo(16,hy+4);c.lineTo(24,hy+6);c.lineTo(20,by+2);c.closePath();c.fill();c.stroke();
    c.beginPath();c.ellipse(22,hy+2,7,6,.2,0,7);c.fill();c.stroke();c.fillStyle=L.light;c.beginPath();c.moveTo(26,hy);c.quadraticCurveTo(34,hy+3,33,hy+7);c.quadraticCurveTo(28,hy+9,25,hy+7);c.closePath();c.fill();c.stroke();
    c.fillStyle='#3a2a1a';c.beginPath();c.arc(33,hy+6,1.4,0,7);c.fill();c.fillStyle=L.eye;c.beginPath();c.arc(24,hy,1.6,0,7);c.fill();
    c.fillStyle=L.body;for(const [ex,ea] of [[18,-.9],[22,-.5]]){c.save();c.translate(ex,hy-1);c.rotate(ea);c.beginPath();c.ellipse(0,-4,2.4,5,0,0,7);c.fill();c.stroke();c.restore();}
    // golden antlers, branched
    c.strokeStyle=L.horn;c.lineWidth=2.4;for(const [bx,s] of [[20,1],[23,.85]]){c.beginPath();c.moveTo(bx,hy-4);c.quadraticCurveTo(bx-4,hy-14*s,bx-2,hy-22*s);c.stroke();
      c.beginPath();c.moveTo(bx-3,hy-11*s);c.lineTo(bx-9,hy-15*s);c.stroke();c.beginPath();c.moveTo(bx-2.5,hy-17*s);c.lineTo(bx+4,hy-22*s);c.stroke();}
    c.fillStyle='#fff6c8';c.beginPath();c.arc(18,hy-22,1.2,0,7);c.fill();c.strokeStyle=OL;c.lineWidth=1.6;
    drawSaddle(L,-1,by-10,f);}
  else{const hy=by-12;c.fillStyle=L.body;c.beginPath();c.moveTo(10,by-8);c.lineTo(20,hy-2);c.lineTo(26,hy+4);c.lineTo(18,by+3);c.closePath();c.fill();c.stroke();
    c.beginPath();c.moveTo(18,hy-6);c.quadraticCurveTo(30,hy-6,38,hy);c.lineTo(37,hy+5);c.quadraticCurveTo(28,hy+7,18,hy+4);c.closePath();c.fill();c.stroke();
    c.strokeStyle=OL;c.lineWidth=1;c.beginPath();c.moveTo(27,hy+3);c.lineTo(37,hy+3);c.stroke();c.lineWidth=1.6;
    c.fillStyle=L.horn;for(const [hx,ha] of [[20,-.9],[23,-.6]]){c.save();c.translate(hx,hy-5);c.rotate(ha);c.beginPath();c.moveTo(-2,0);c.quadraticCurveTo(-3,-8,2,-12);c.lineTo(2,0);c.closePath();c.fill();c.stroke();c.restore();}
    c.fillStyle=L.eye;c.beginPath();c.ellipse(27,hy-1,2.2,1.6,0,0,7);c.fill();c.fillStyle='#1a0a08';c.fillRect(26.6,hy-2.2,.9,2.4);
    c.fillStyle='#ffb040';c.beginPath();c.arc(37,hy+1,1.3,0,7);c.fill();
    drawSaddle(L,-1,by-10,f);}
  c.restore();c.restore();return (stag?31:24)-bob+10;}
// draw the prestige mounts with their own art, and every mount a third bigger
{const _dma=drawMountArt;drawMountArt=function(p,k){if(!(MOUNTS[k]&&MOUNTS[k].royal))return _dma.apply(this,arguments);
  const key=p===P?'me':(p.name||'?');if(typeof heroDir4==='function'&&!String(key).startsWith('icon:')){const d=heroDir4(p);MART.turn.set(key,d===1||d===3?.5:-.5);}return drawRoyalMount(p,k);};}
drawMount=function(p,k){if(!MOUNT_LOOK[k])return 0;const c=ctx;c.save();c.translate(p.x,p.y);c.scale(MOUNT_SCALE,MOUNT_SCALE);c.translate(-p.x,-p.y);
  let lift=0;try{lift=drawMountArt(p,k);}finally{c.restore();}return lift*MOUNT_SCALE;};
// the trails, drawn on the ground pass with the dust
function drawMountTrail(){if(!MART.trail.length)return;MART.trail=MART.trail.filter(s=>now-s.t0<.9);
  for(const s of MART.trail){const a=(now-s.t0)/.9,xx=s.x+s.vx*a,yy=s.y+s.vy*a;at(s.x,s.y,()=>{const c=ctx;c.globalAlpha=1-a;
    if(s.k==='aurelstag'){c.fillStyle='#fff2b0';c.save();c.translate(xx,yy);c.rotate(a*5);c.fillRect(-2,-.6,4,1.2);c.fillRect(-.6,-2,1.2,4);c.restore();}
    else{c.fillStyle=a<.4?'#ffd060':'#ff6a2a';c.beginPath();c.arc(xx,yy,2.2*(1-a)+.6,0,7);c.fill();}c.globalAlpha=1;});}}
{const _dmf=drawMountFx;drawMountFx=function(){_dmf.apply(this,arguments);drawMountTrail();};}
if(typeof drawGround==='function'){const _dg=drawGround;drawGround=function(){_dg.apply(this,arguments);try{if(!MART.dust.length&&!MART.spark.length)drawMountTrail();}catch(e){}};}
// Tobin keeps his two everyday mounts; the prestige ones are only at the Royal Stables
{const _ps=PANELS.stables;PANELS.stables=function(){let h=_ps.apply(this,arguments);const own=owned();
  let s=`<h3>Royal mounts</h3><div class="sub">Bred and trained here. Only the Royal Stables sell them.</div>`;
  for(const [k,M] of Object.entries(MOUNTS)){if(!M.royal)continue;const has=own.includes(k),lvOk=P.lv>=M.lv;
    s+=`<div class="row stbrow"><img class="ico img stbmount" src="${mountIconURL(k)}" alt="" width="40" height="40"><div class="grow"><div class="nm">${esc(M.name)} <span class="muted">· Lv ${M.lv}+ · +${Math.round(M.speed*100)}% speed</span></div>`+
      `<div class="ds">${k==='aurelstag'?'Golden antlers and a trail of gold sparkles.':'Wings that beat as it runs and a trail of embers.'}${has?' · Yours.':` · ${fmt(M.price)} gold`}</div></div>`+
      (has?`<button class="btn small" data-act="ridepick" data-arg="${k}">${P.riding===k?'Hop off':'Ride'}</button>`:`<button class="btn small" data-act="mountbuy" data-arg="${k}" ${lvOk&&P.gold>=M.price?'':'disabled'}>Buy</button>`)+`</div>`;}
  const i=h.indexOf('<h3>Companion bond</h3>');return i<0?h+s:h.slice(0,i)+s+h.slice(i);};}
if(typeof TH!=='undefined'){for(const [k,v] of [['Royal mounts','พาหนะหลวง'],['Bred and trained here. Only the Royal Stables sell them.','เพาะและฝึกที่นี่ มีขายที่คอกม้าหลวงเท่านั้น'],['Aurel Stag','กวางออเรล'],['Emberdrake','มังกรถ่านเพลิง'],
  ['Hop off','ลงจากพาหนะ'],['Ride','ขี่']])if(!TH[k])TH[k]=v;
  if(typeof TH_PAT!=='undefined')TH_PAT.unshift([/^(Golden antlers and a trail of gold sparkles\.|Wings that beat as it runs and a trail of embers\.)( · Yours\.| · ([\d,]+) gold)$/,(m,a,b,g)=>`${a.startsWith('Golden')?'เขาสีทองและประกายทองตามหลัง':'ปีกที่กระพือขณะวิ่งและสะเก็ดไฟตามหลัง'}${g?` · ${g} โกลด์`:' · เป็นของคุณ'}`]);}
