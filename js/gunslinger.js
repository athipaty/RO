"use strict";
/* ================= the Gunslinger: the sixth first job (v1.42.0) =================
   Pistols and rifles: quick shots from range, rounds that pierce, a spray that hits a crowd, fire rounds that burn,
   a flashbang that stuns, a steady aim that hits harder, and fanning the hammer for a second shot. A Novice earns it
   through its story with Marshal Kestrel (js/gunslinger2.js, like the other five). Attack power comes from DEX, like a
   bow. Loaded after js/shade.js and before js/jobs.js. */

// ---- guns: a new weapon type ----
Object.assign(ITEMS,{
  pistol:{name:'Flintlock Pistol',type:'weapon',wt:'gun',atk:28,rng:200,price:600,lv:1,slots:1,col:'#8a7a6a',g:'W'},
  longrifle:{name:'Long Rifle',type:'weapon',wt:'gun',atk:84,rng:250,price:3800,lv:25,slots:1,col:'#7a5a3a',g:'W'}});
WEAPON_W.gun=40;
{const i=SHOP.indexOf('bow');SHOP.splice(i<0?SHOP.length:i+1,0,'pistol');const j=SHOP.indexOf('longbow');SHOP.splice(j<0?SHOP.length:j+1,0,'longrifle');}

// ---- the job ----
CLASSES.gunslinger={name:'Gunslinger',hp:1.0,sp:1.05,aspd:.92,weapons:['club','gun'],col:'#8a5a3a',hair:'#3a2a1a',gift:'pistol',
  skills:['quickdraw','piercinground','scattershot','flareround','flashbang','steadyaim','fanning','firstaid'],
  desc:'Pistols and rifles. Quick shots from range, rounds that pierce, fire and flash, and a second shot from fanning the hammer.'};
if(typeof JOB_FIRST!=='undefined'&&!JOB_FIRST.includes('gunslinger'))JOB_FIRST.push('gunslinger');

// ---- a gun shoots from range, with DEX-based attack like a bow ----
const isGun=()=>!!(P&&P.eq&&P.eq.weapon&&ITEMS[P.eq.weapon.id]&&ITEMS[P.eq.weapon.id].wt==='gun');
{const _cs=computeStats;computeStats=function(){const s=_cs.apply(this,arguments);try{if(isGun()){const w=ITEMS[P.eq.weapon.id],st=s;
    const melee=st.str+(st.str/10|0)**2+st.dex/5,ranged=st.dex+(st.dex/10|0)**2+st.str/5;s.atk=Math.round(s.atk+ranged-melee);s.ranged=true;s.range=w.rng||210;}}catch(e){}return s;};}
// shots from a gun are bullets: a quick bright tracer, a puff at the muzzle and a sharp report
{const _sh=shoot;shoot=function(from,to,kind,col,onHit,hostile){const r=_sh.apply(this,arguments);try{if(!hostile&&from===P&&kind==='arrow'&&isGun()){const s=shots[shots.length-1];
    if(s&&s.to===to){s.spd=1150;s.gun=1;s.draw=gunTracer;}fx.push({k:'flare',x:P.x+(P.face||1)*14,y:P.y-18,col:'#fff2b0',r:14,dur:.12,h:0});}}catch(e){}return r;};}
function gunTracer(s){const a=Math.atan2((s.to&&s.to.y||0)-s.y,(s.to&&s.to.x||0)-s.x),c=ctx;c.rotate(Math.atan2(Math.sin(a)*.5,Math.cos(a)-Math.sin(a)*0));
  const g=c.createLinearGradient(-22,0,4,0);g.addColorStop(0,'rgba(255,230,150,0)');g.addColorStop(1,'rgba(255,245,200,.95)');c.strokeStyle=g;c.lineWidth=2.4;c.beginPath();c.moveTo(-22,0);c.lineTo(4,0);c.stroke();
  c.fillStyle='#fffbe0';c.beginPath();c.ellipse(4,0,3,1.6,0,0,7);c.fill();}
if(typeof sfx==='function'){const _sfx=sfx;sfx=function(n){if(n==='bow'&&isGun()&&typeof noise==='function'&&typeof AU!=='undefined'&&AU.ctx){try{const t=AU.ctx.currentTime;noise({ft:'lowpass',f:1800,dur:.09,vol:.11,t});noise({ft:'highpass',f:3000,dur:.03,vol:.05,t});return;}catch(e){}}return _sfx.apply(this,arguments);};}

// ---- its skills ----
const near=(x,y,r)=>mobs.filter(m=>!m.dead&&Math.hypot(m.x-x,m.y-y)<=r+m.d.size);
const GUN_SK={
  quickdraw:{name:'Quick Draw',max:10,col:'#ffd27a',g:'⁑',sp:l=>6+l,cd:.9,kind:'target',range:230,
    desc:l=>`Two shots in a blink, each for ${80+l*12}% ATK, with ${l*2}% more critical chance.`,
    run:(l,t)=>{const o={critPlus:l*2};shoot(P,t,'arrow','#fff2b0',()=>dealPhys(t,.8+l*.12,o));setTimeout(()=>{if(t&&!t.dead&&mobs.includes(t))shoot(P,t,'arrow','#fff2b0',()=>dealPhys(t,.8+l*.12,o));},150);}},
  piercinground:{name:'Piercing Round',max:10,col:'#c8d8ff',g:'➹',sp:l=>12+l,cd:2.5,kind:'target',range:260,
    desc:l=>`A heavy round for ${180+l*30}% ATK plus 1% per DEX. Never misses.`,
    run:(l,t)=>shoot(P,t,'arrow','#d8e8ff',()=>dealPhys(t,1.8+l*.3+S.dex*.01,{sure:true}))},
  scattershot:{name:'Scatter Shot',max:10,col:'#ffb04a',g:'⁂',sp:l=>16+l*2,cd:4,kind:'area',range:220,
    desc:l=>`A spray of shot: ${110+l*18}% ATK to every monster within 90px of the spot.`,
    run:(l,x,y)=>{fx.push({k:'ring',x,y,r:90,col:'#ffcf7a',t0:now,dur:.35});for(const m of near(x,y,90))shoot(P,m,'arrow','#ffe0a0',()=>dealPhys(m,1.1+l*.18));}},
  flareround:{name:'Flare Round',max:10,col:'#ff7a3a',g:'✹',sp:l=>12+l,cd:3,kind:'target',range:230,
    desc:l=>`A burning round for ${150+l*25}% ATK (Fire), then it burns for ${20+l*4}% ATK three more times, once a second.`,
    run:(l,t)=>shoot(P,t,'arrow','#ff9a4a',()=>{dealPhys(t,1.5+l*.25,{sure:true,el:'fire'});
      for(let k=1;k<=3;k++)setTimeout(()=>{if(!t||t.dead||!mobs.includes(t)||!P||P.dead)return;dealPhys(t,.2+l*.04,{sure:true,el:'fire'});fx.push({k:'ring',x:t.x,y:t.y,r:18,col:'#ff8a3a',t0:now,dur:.35});},k*1000);})},
  flashbang:{name:'Flashbang',max:10,col:'#fff6c8',g:'✸',sp:l=>20+l*2,cd:8,kind:'area',range:200,
    desc:l=>`A blinding flash: ${80+l*10}% ATK to every monster within 100px, and a ${30+l*5}% chance to stun each for 2s.`,
    run:(l,x,y)=>{fx.push({k:'flare',x,y,col:'#ffffff',r:110,dur:.3,h:6});for(const m of near(x,y,100)){dealPhys(m,.8+l*.1,{sure:true});if(!m.dead&&Math.random()*100<30+l*5&&typeof ailMob==='function')ailMob(m,'stun',2);}}},
  steadyaim:{name:'Steady Aim',max:10,col:'#e8d0a0',g:'⊕',...PASSIVE(),desc:l=>`With a gun: +${l*3} ATK and +${l*2} HIT.`},
  fanning:{name:'Fanning',max:10,col:'#ffcf5a',g:'↺',...PASSIVE(),desc:l=>`With a gun: +${l*2}% attack speed and ${l*2}% chance to fire twice.`}};
Object.assign(SKILLS,GUN_SK);
Object.assign(SKILL_REQ,{piercinground:{quickdraw:3},scattershot:{quickdraw:3},flareround:{piercinground:3},flashbang:{scattershot:3},fanning:{steadyaim:3}});
{const _pbG=passiveB;passiveB=function(){const b=_pbG.apply(this,arguments);if(!P||!P.skills)return b;const L=id=>P.skills[id]||0,add=(k,v)=>{if(v)b[k]=(b[k]||0)+v;};
  if(isGun()){add('atk',L('steadyaim')*3);add('hit',L('steadyaim')*2);add('aspd',L('fanning')*2);add('dbl',L('fanning')*2);}
  return b;};}

// ---- how it looks and moves ----
// outfit colours: a dusty brown coat, dark trousers, a red bandana; the wide hat and long coat are in js/gunslinger2.js
if(typeof HERO2_DRESS!=='undefined')HERO2_DRESS.gunslinger={pant:'#3a3430',boot:'#5a3a22',trim:'#c83a2a',belt:'#6a4426'};
// start screen: weight on one leg, the gun held low, ready
if(typeof STANCES!=='undefined')STANCES.gunslinger=t=>({lean:.02,sway:Math.sin(t*1.4)*.3,lift:0,stance:1.6,hands:[[11,-5+Math.sin(t*2)*.3],[-7,-6]]});
// attack: raise, aim, fire with a kick of recoil, settle
if(typeof HIT_STYLE!=='undefined')HIT_STYLE.gunslinger=p=>hitKeys(p,[[0,R0],[.18,{push:1,lean:-.02,ang:1.55,lift:.3,reach:6}],[.34,{push:-4,lean:-.1,ang:1.25,lift:.5,reach:5},'o'],[.6,{push:0,ang:1.5,reach:6}],[1,R0]]);
if(typeof HIT_FX!=='undefined')HIT_FX.gunslinger=[.34,'ring','#fff2b0',8,-18];
// walk: an easy, confident stride
if(typeof WALK_GAIT!=='undefined')WALK_GAIT.gunslinger={rate:1.0,leg:1.0,bob:.7,arm:.6,roll:.04,lean:0,lift:0};
// sitting: leaning back, one leg stretched out
if(typeof SIT_POSE!=='undefined')SIT_POSE.gunslinger={legs:'stretch',hands:[[6,0],[-6,1]],hip:5,lean:-.08};
if(typeof CAST_COL!=='undefined')CAST_COL.gunslinger='#ffd27a';
// the guns themselves: grip at 0,0, the barrel pointing up
function waGun(o){const c=ctx,L=o.len||16;
  c.beginPath();c.moveTo(-2,4);c.lineTo(2.4,4);c.lineTo(3,-1);c.lineTo(-1.2,-1);c.closePath();waFS(o.grip||'#6a4426');
  c.strokeStyle='rgba(0,0,0,.35)';c.lineWidth=.6;for(let y=0;y<4;y+=1.4){c.beginPath();c.moveTo(-1.4,y+.5);c.lineTo(2.2,y);c.stroke();}
  c.beginPath();c.roundRect(-2.4,-3.6,5.4,3,1);waFS(o.body||'#4a4652');
  c.beginPath();c.arc(1.4,.6,1.8,Math.PI*.1,Math.PI*1.1);c.strokeStyle=WA_OL;c.lineWidth=.9;c.stroke();
  c.beginPath();c.roundRect(-1.2,-3.6-L,2.4,L,.8);waFS(o.barrel||'#7a7682');
  c.fillStyle='rgba(255,255,255,.55)';c.fillRect(-.8,-3.6-L+1,.6,L-2);
  if(o.stock){c.beginPath();c.moveTo(-2.4,-.6);c.lineTo(-2.4,8);c.lineTo(1.6,10);c.lineTo(3,4);c.closePath();waFS(o.stock);}
  if(o.band){c.fillStyle=o.band;for(const y of [-3.6-L*.4,-3.6-L*.8])c.fillRect(-1.5,y,3,1.2);}
  c.fillStyle='#2a2630';c.fillRect(-.7,-3.6-L-1,1.4,1.2);
  if(o.glow)waGlow(0,-3.6-L*.5,7,o.glow,.4);}
// held in the hand the barrel points forward, not up like a blade (the bag pictures draw them straight, laid diagonally)
const GUN_ART={pistol:{len:11},longrifle:{len:22,barrel:'#6a6672',body:'#3a3640',stock:'#7a5a3a',band:'#c8a050'}};
const gunHeld=id=>()=>{ctx.save();ctx.rotate(1.2);ctx.scale(1.3,1.3);waGun(GUN_ART[id]);ctx.restore();};
if(typeof WA!=='undefined'){WA.pistol=gunHeld('pistol');WA.longrifle=gunHeld('longrifle');}
if(typeof WA_BY_TYPE!=='undefined')WA_BY_TYPE.gun='pistol';
if(typeof TH!=='undefined')Object.assign(TH,{'Pistols and rifles. Quick shots from range, rounds that pierce, fire and flash, and a second shot from fanning the hammer.':'ปืนพกและปืนยาว ยิงเร็วจากระยะไกล กระสุนเจาะเกราะ ไฟ และแสงวาบ และยิงซ้ำด้วยการรัวนกสับ'});
