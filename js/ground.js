"use strict";
/* ================= #30 ground-target skills =================
   Three new skills that are placed on the ground (press the skill, then click the ground; Esc or right-click
   cancels; on phones, tap the ground):
     Thorn Snare (Ranger line)  a hidden trap: the first monster to step on it is held fast and hurt (up to 3)
     Ember Wall  (Arcanist line) a line of fire across the ground that burns and slows monsters walking through
     Haven       (Cleric line)   a safe circle: you and anyone standing in it regenerate HP and gain DEF,
                                 monsters inside are slowed
   Area skills (Arc Storm, Arrow Rain, Cinderfall, Volley) can also be aimed at the ground when nothing is targeted.
   Your zones go out in presence (gz) so others see them; a Haven heals other players standing in it too.
   Only the caster's game deals damage, so nothing is counted twice. */
Object.assign(SKILLS,{
  thornsnare:{name:'Thorn Snare',max:10,col:'#9a7a3a',g:'⌖',sp:l=>10,cd:1,kind:'ground',range:200,radius:26,
    desc:l=>`Set a hidden trap (up to 3, 40s): the first monster to step on it takes ${100+l*20}% ATK and is held for ${(2+l*.2).toFixed(1)}s.`},
  emberwall:{name:'Ember Wall',max:10,col:'#ff7a2a',g:'≡',sp:l=>18+l*2,cd:4,kind:'ground',range:220,radius:65,
    desc:l=>`Raise a wall of fire for ${(5+l*.5).toFixed(1)}s across the ground: monsters crossing it take ${40+l*10}% MATK (Fire) twice a second and are slowed.`},
  haven:{name:'Haven',max:10,col:'#9fffc0',g:'◎',sp:l=>25+l*2,cd:12,kind:'ground',range:200,radius:95,
    desc:l=>`Bless a circle of ground for ${10+l}s: anyone standing in it regenerates ${l*5} HP per second and gains ${l*2} DEF; monsters in it are slowed.`},
});
Object.assign(SKILL_REQ,{thornsnare:{twinshot:2},emberwall:{frostnova:2},haven:{mend:2}});
// add each to its base class and that class's second jobs
for(const [base,id] of [['ranger','thornsnare'],['arcanist','emberwall'],['cleric','haven']])
  for(const c in CLASSES)if((c===base||(typeof baseOf==='function'&&baseOf(c)===base))&&!CLASSES[c].skills.includes(id))CLASSES[c].skills.push(id);

let GZ=[],AIM=null,aimAt=null;
const GZ_LIFE={thornsnare:()=>40,emberwall:l=>5+l*.5,haven:l=>10+l};
function wallNodes(z){const out=[];for(let i=-2;i<=2;i++)out.push({x:z.x+Math.cos(z.ang)*i*26,y:z.y+Math.sin(z.ang)*i*26});return out;}

/* ---- placing ---- */
const _useSkillG=useSkill;
useSkill=function(id){const sk=SKILLS[id];if(!sk)return;
  let ground=sk.kind==='ground';
  if(sk.kind==='area'&&(!P.target||P.target.dead)){if(typeof followAssist==='function')followAssist();ground=!P.target||P.target.dead;}
  if(!ground)return _useSkillG(id);
  const l=castLv(id);if(!l||P.dead||P.casting)return;
  if(!skillReady(id))return;if(P.heavy>1){tooHeavy();return;}
  if(ailHeld()||ailOn('silence')){floatT(P.x,P.y-40,ailOn('silence')?'Silenced':'Cannot act','#c58cff',12);return;}
  if(P.sp<sk.sp(l)){floatT(P.x,P.y-30,'Not enough SP','#7ab0f0',13);return;}
  if(sk.kind==='ground'&&id!=='haven'&&Z.D.safe){floatT(P.x,P.y-40,'Not in town','#aab4c4',12);return;}
  if(AIM&&AIM.id===id){aimCancel();return;}
  AIM={id,l};cv.style.cursor='crosshair';floatT(P.x,P.y-44,`${sk.name}: ${matchMedia('(pointer:fine)').matches?'click':'tap'} the ground`,'#ffe9a8',12);};
function aimCancel(){AIM=null;aimAt=null;if(cv)cv.style.cursor='';}
function aimCast(w){const a=AIM;aimCancel();if(!a||P.dead||P.casting)return;const sk=SKILLS[a.id],l=castLv(a.id)||a.l,cost=sk.sp(l);
  if(P.sp<cost||!skillReady(a.id))return;
  // out of reach: drop it at the edge of your range, toward where you clicked
  let dx=w.x-P.x,dy=w.y-P.y;const d=Math.hypot(dx,dy)||1;if(d>sk.range){dx*=sk.range/d;dy*=sk.range/d;}
  const x=P.x+dx,y=P.y+dy;P.face=sface(dx,dy);P.path=[];P.sitting=false;
  if(sk.kind==='area')return beginCast(a.id,l,cost,()=>sk.run(l,x,y));
  beginCast(a.id,l,cost,()=>placeZone(a.id,l,x,y,Math.atan2(dy,dx)+Math.PI/2));}
function placeZone(k,l,x,y,ang){
  if(k==='thornsnare'){const mine=GZ.filter(z=>z.k==='thornsnare');if(mine.length>=3)GZ.splice(GZ.indexOf(mine[0]),1);}
  GZ.push({k,l,x,y,ang,t0:now,until:now+GZ_LIFE[k](l),tick:0,hit:new Map()});
  fx.push({k:'ring',x,y,r:SKILLS[k].radius,col:SKILLS[k].col,t0:now,dur:.35});sfx(k==='emberwall'?'zap':'cast');}
window.addEventListener('pointerdown',ev=>{if(!AIM||ev.target!==cv)return;ev.preventDefault();ev.stopImmediatePropagation();
  if(ev.button===2){aimCancel();return;}aimCast(worldAt(ev));},true);
window.addEventListener('contextmenu',ev=>{if(AIM&&ev.target===cv){ev.preventDefault();ev.stopImmediatePropagation();aimCancel();}},true);
window.addEventListener('pointermove',ev=>{if(AIM&&ev.target===cv)aimAt=worldAt(ev);});
window.addEventListener('keydown',ev=>{if(AIM&&ev.key==='Escape'){ev.stopImmediatePropagation();aimCancel();}},true);

/* ---- what the zones do (run every frame from updateHud) ---- */
function groundTick(){if(!P)return;GZ=GZ.filter(z=>now<z.until);
  for(const z of GZ){
    if(z.k==='thornsnare'){for(const m of mobs){if(m.dead||Math.hypot(m.x-z.x,m.y-z.y)>26+m.d.size*.5)continue;
        dealPhys(m,1+z.l*.2,{sure:true});ailMob(m,'stun',2+z.l*.2);fx.push({k:'spark',x:z.x,y:z.y-6,t0:now,dur:.3,r:0});z.until=0;break;}}
    else if(z.k==='emberwall'){const nodes=wallNodes(z);for(const m of mobs){if(m.dead||!nodes.some(n=>Math.hypot(m.x-n.x,m.y-n.y)<22+m.d.size*.5))continue;
        if((z.hit.get(m)||0)>now)continue;z.hit.set(m,now+.5);dealMag(m,.4+z.l*.1,'fire');slowMob(m,1);}}
    else if(z.k==='haven'&&now>=z.tick){z.tick=now+1;for(const m of mobs)if(!m.dead&&Math.hypot(m.x-z.x,m.y-z.y)<95)slowMob(m,1.2);}}
  // standing in a Haven (yours or another player's)
  let hv=0;for(const z of allZones())if(z.k==='haven'&&Math.hypot(P.x-z.x,P.y-z.y)<95)hv=Math.max(hv,z.l);
  if(hv&&!P.dead){const had=P.buffs.haven;P.buffs.haven={name:'Haven',until:now+1.2,b:{regen:hv*5,def:hv*2}};if(!had||had.b.regen!==hv*5)S=computeStats();}}
// own zones plus the ones other players in this region share
function allZones(){const out=GZ.map(z=>({k:z.k,x:z.x,y:z.y,l:z.l,ang:z.ang,until:z.until,mine:true}));
  for(const o of NET.others.values()){if(o.z!==zoneId||!Array.isArray(o.gz))continue;for(const z of o.gz)out.push(z);}
  return out;}
const _updateHudG=updateHud;
updateHud=function(){_updateHudG.apply(this,arguments);try{groundTick();}catch(e){}};
const _enterZoneG=enterZone;
enterZone=function(){GZ=[];aimCancel();return _enterZoneG.apply(this,arguments);};

/* ---- presence: [kind, x, y, seconds left, level, angle×100] ---- */
const GZ_K=['thornsnare','emberwall','haven'];
function groundPresence(){const g=GZ.filter(z=>z.k!=='thornsnare').slice(-4).map(z=>[GZ_K.indexOf(z.k),Math.round(z.x),Math.round(z.y),+(z.until-now).toFixed(1),z.l,Math.round(z.ang*100)]);return g.length?g:null;}
function groundRead(o,s){const g=Array.isArray(s.gz)?s.gz.slice(0,4):[];o.gz=g.map(a=>Array.isArray(a)&&GZ_K[a[0]]?{k:GZ_K[a[0]],x:+a[1]||0,y:+a[2]||0,until:now+clamp(+a[3]||0,0,30),l:clamp(a[4]|0,1,10),ang:(+a[5]||0)/100}:null).filter(Boolean);}

/* ---- drawing (ground layer) ---- */
function drawGround(){if(!P)return;
  for(const z of allZones()){const fade=Math.min(1,(z.until-now)/.6);if(fade<=0)continue;
    if(z.k==='thornsnare'){if(!z.mine)continue;at(z.x,z.y,()=>{ctx.globalAlpha=.75*fade;ctx.strokeStyle='#6a5a2a';ctx.lineWidth=1.6;
        for(let i=0;i<6;i++){const a=i*Math.PI/3+.3;ctx.beginPath();ctx.moveTo(z.x,z.y);ctx.lineTo(z.x+Math.cos(a)*12,z.y+Math.sin(a)*6);ctx.stroke();}
        ctx.fillStyle='#9a7a3a';ctx.beginPath();ctx.ellipse(z.x,z.y,4,2,0,0,7);ctx.fill();ctx.globalAlpha=1;});}
    else if(z.k==='emberwall'){for(const n of wallNodes(z))at(n.x,n.y,()=>{const fl=Math.sin(now*12+n.x)*2;ctx.globalAlpha=fade;
        const g=ctx.createRadialGradient(n.x,n.y-8,1,n.x,n.y-8,16);g.addColorStop(0,'rgba(255,230,140,.95)');g.addColorStop(.5,'rgba(255,120,40,.7)');g.addColorStop(1,'rgba(200,40,10,0)');
        ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(n.x,n.y-8,11,17+fl,0,0,7);ctx.fill();ctx.globalAlpha=1;});}
    else if(z.k==='haven')at(z.x,z.y,()=>{ctx.globalAlpha=fade;ctx.fillStyle='rgba(160,255,190,.13)';ctx.strokeStyle=`rgba(170,255,200,${.55+Math.sin(now*3)*.2})`;ctx.lineWidth=2;
        ctx.beginPath();ctx.ellipse(z.x,z.y,95*1.1,95*.55,0,0,7);ctx.fill();ctx.stroke();
        ctx.fillStyle='rgba(220,255,230,.7)';for(let i=0;i<5;i++){const a=now*.8+i*1.26,r=(now*30+i*19)%90;ctx.beginPath();ctx.arc(z.x+Math.cos(a)*r*1.1,z.y+Math.sin(a)*r*.55-((now*20+i*7)%14),1.4,0,7);ctx.fill();}
        ctx.globalAlpha=1;});}
  if(AIM&&aimAt){const sk=SKILLS[AIM.id],d=Math.hypot(aimAt.x-P.x,aimAt.y-P.y),far=d>sk.range,r=sk.radius||40;
    at(aimAt.x,aimAt.y,()=>{ctx.strokeStyle=far?'rgba(255,140,120,.8)':'rgba(255,233,168,.9)';ctx.setLineDash([6,5]);ctx.lineWidth=2;
      ctx.beginPath();ctx.ellipse(aimAt.x,aimAt.y,r*1.1,r*.55,0,0,7);ctx.stroke();ctx.setLineDash([]);});}}
