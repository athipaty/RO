"use strict";
/* ================= where to go next =================
   A small chip under the minimap says what to do next (the pinned quest, or else the first active one, a hunting
   contract, or a job change that is ready) with the distance, and an arrow at the edge of the screen points the way:
   to the person to talk to, the nearest monster you need, or the gate to the region you need. Tap the chip for the
   quest log. Settings → Goal arrow turns both off. */
const GOAL={t:null,at:0,el:null};
const goalOn=()=>!(typeof SETS!=='undefined'&&SETS.goal===false);
// regions and the regions next to them (gates both ways)
const ZGRAPH=(()=>{const g={};const add=(a,b)=>{if(!ZONES[a]||!ZONES[b])return;(g[a]=g[a]||new Set()).add(b);(g[b]=g[b]||new Set()).add(a);};
  for(const z in ZONES){const D=ZONES[z];for(const k in D.links||{})add(z,D.links[k]);if(D.stairs)add(z,D.stairs);}add('town','capital');return g;})();
function zoneStep(from,to){if(from===to)return to;const prev={[from]:null},q=[from];
  while(q.length){const z=q.shift();for(const n of ZGRAPH[z]||[])if(!(n in prev)){prev[n]=z;if(n===to){let s=n;while(prev[s]!==from)s=prev[s];return s;}q.push(n);}}return null;}
const mobZone=id=>Object.keys(ZONES).find(z=>(ZONES[z].mobs||[]).some(m=>m[0]===id))||null;
function npcZoneOf(key){if(typeof QNPC!=='undefined'&&QNPC[key])return QNPC[key].zone;
  const name=typeof npcName==='function'?npcName(key):key;for(const z of ['town','capital'])if(zoneCache[z]&&zoneCache[z].npcs.some(n=>n.name===name))return z;
  return /Ansel|Tavi|Sela|Oren|Ivo|Ada|Mira|Garrow|Valen/.test(name)?'capital':'town';}
// what to do next: {zone, mob | npc, text}
function goalWhat(){if(!P)return null;
  const s=typeof QS==='function'?QS():null,act=s?Object.keys(s.active):[];const id=P.track&&s&&s.active[P.track]?P.track:act[0];
  if(id){const q=QUESTS[id];
    if(qReady(id))return {zone:npcZoneOf(q.to),npc:npcName(q.to),text:`Return to ${npcName(q.to)}`};
    const o=q.obj.find(o=>objHave(id,o)<objNeed(o));
    if(o&&o.kill)return {zone:mobZone(o.kill),mob:o.kill,text:objText(id,o)};
    if(o&&o.item){const src=typeof dropSources==='function'?dropSources(o.item)[0]:null;return {zone:src?mobZone(src.id):null,mob:src&&src.id,text:objText(id,o)};}
    if(o&&o.visit)return {zone:o.visit,text:`Go to ${ZONES[o.visit].name}`};
    return {zone:npcZoneOf(q.to),npc:npcName(q.to),text:`Talk to ${npcName(q.to)}`};}
  if(P.quest&&MOBS[P.quest.mob])return {zone:mobZone(P.quest.mob),mob:P.quest.mob,text:`Contract: ${MOBS[P.quest.mob].name} ${P.quest.have}/${P.quest.need}`};
  const corvin={zone:'town',npc:'Guildmaster Corvin'};
  if(P.cls==='novice'&&P.jl>=10)return {...corvin,text:'Choose your calling with Corvin'};
  if(typeof TRIALS!=='undefined'&&TRIALS[P.cls]&&typeof JOB2_LV!=='undefined'&&P.jl>=JOB2_LV&&!P.trial)return {...corvin,text:'Corvin has a trial for you'};
  if(P.trial&&typeof trialDone==='function'&&trialDone())return {...corvin,text:'Trial done: choose your calling'};
  // the next story chapter someone is offering
  const nx=typeof qAvailable==='function'?Object.keys(QUESTS).find(k=>!QUESTS[k].daily&&qAvailable(k)):null;
  if(nx){const f=QUESTS[nx].from;return {zone:npcZoneOf(f),npc:npcName(f),text:`${npcName(f)} has a quest`};}
  return null;}
// a point in this region to aim at
function goalPoint(w){if(!w||!w.zone||!Z)return null;
  if(w.zone!==zoneId){const step=zoneStep(zoneId,w.zone);const pt=step&&Z.portals.find(p=>p.to===step);return pt?{x:pt.x,y:pt.y,gate:ZONES[step].name}:null;}
  if(w.npc){const n=Z.npcs.find(n=>n.name===w.npc);return n?{x:n.x,y:n.y}:null;}
  if(w.mob){let best=null,bd=1e9;for(const m of mobs)if(!m.dead&&m.d.id===w.mob){const d=Math.hypot(m.x-P.x,m.y-P.y);if(d<bd){bd=d;best=m;}}return best?{x:best.x,y:best.y,m:best}:null;}
  return null;}
// the chip (refreshed twice a second)
function goalChip(){let el=GOAL.el;const w=goalOn()&&running?goalWhat():null;GOAL.t=w;
  if(!el){el=GOAL.el=document.createElement('button');el.id='goalChip';el.type='button';el.addEventListener('click',()=>{if(typeof QS==='function')openPanel('quests');});document.body.appendChild(el);}
  if(!w){if(!el.hidden)el.hidden=true;return;}
  const pt=goalPoint(w);GOAL.pt=pt;const far=pt?Math.round(Math.hypot(pt.x-P.x,pt.y-P.y)/TILE):null;
  const where=w.zone&&w.zone!==zoneId?(pt&&pt.gate?` · via ${pt.gate}`:` · ${ZONES[w.zone]?ZONES[w.zone].name:''}`):far!=null&&far>3?` · ${far} m`:'';
  const html=`<span class="gi">➤</span><span class="gt">${esc(w.text)}</span><span class="gw">${esc(where)}</span>`;if(el._h!==html){el._h=html;el.innerHTML=html;}
  el.setAttribute('aria-label',w.text+where);el.hidden=false;
  // just under the minimap box, right-aligned with it
  // phones: in the free strip at the top centre (under the minimap the round buttons sit); desktop: under the minimap
  if(document.body.classList.contains('touchui')){goalPlacePhone(el);return;}
  const mb=document.getElementById('minibox');if(mb&&!mb.hidden){const r=mb.getBoundingClientRect(),top=Math.round(r.bottom+6)+'px',right=Math.round(innerWidth-r.right)+'px',mw=Math.round(Math.max(150,r.width))+'px';
    if(el.style.top!==top)el.style.top=top;if(el.style.right!==right)el.style.right=right;if(el.style.maxWidth!==mw)el.style.maxWidth=mw;}}
// phones: try a few spots (the top strip next to the menu button, under the quick buttons, under the status box,
// under the map) and take the first where the chip covers no button or box; with none free it hides (the arrow stays)
const GOAL_OBST='#hud,#minibox,#partyBox,#log,#onlineBadge,#quick .qk,#quickL .qk,#quickL>button,#actions>.act,#hotbar .slot,#buffs .buff,#rideBtn,#hotrows .hrow,#target,#quest,#qtrack';
function goalPlacePhone(el){const obs=[];for(const e of document.querySelectorAll(GOAL_OBST)){if(!e.getClientRects().length||e.closest('#panel'))continue;const s=getComputedStyle(e);if(s.visibility==='hidden'||+s.opacity===0)continue;const r=e.getBoundingClientRect();if(r.width>2&&r.height>2)obs.push(r);}
  const R=id=>{const e=document.getElementById(id);return e&&e.getClientRects().length?e.getBoundingClientRect():null;},H=34,W=Math.min(300,innerWidth-20),cands=[];
  const mb=R('menuBtn');if(mb&&mb.top<60)cands.push({l:mb.right+8,t:Math.max(12,mb.top)});
  for(const id of ['quick','hud','minibox']){const r=R(id);if(r)cands.push({l:id==='minibox'?r.left:id==='quick'?10:r.left,t:r.bottom+6});}
  for(const c of cands){let right=Math.min(innerWidth-10,c.l+W);
    // shrink to the first thing on the right in this row
    for(const o of obs)if(o.top<c.t+H&&o.bottom>c.t&&o.left>=c.l+40&&o.left<right)right=o.left-6;
    if(right-c.l<130)continue;const box={left:c.l,top:c.t,right,bottom:c.t+H};
    if(obs.some(o=>Math.min(o.right,box.right)-Math.max(o.left,box.left)>2&&Math.min(o.bottom,box.bottom)-Math.max(o.top,box.top)>2))continue;
    const left=Math.round(c.l)+'px',top=Math.round(c.t)+'px',mw=Math.round(right-c.l)+'px';if(el.style.left!==left)el.style.left=left;if(el.style.top!==top)el.style.top=top;if(el.style.maxWidth!==mw)el.style.maxWidth=mw;if(el.style.right)el.style.right='';return;}
  el.hidden=true;}
setInterval(()=>{try{goalChip();}catch(e){}},500);
// the arrow: at the screen edge when the goal is off screen, a small bouncing marker over it when it is on screen
{const _rG=render;render=function(){const r=_rG.apply(this,arguments);try{if(!running||!goalOn()||!P||P.dead||!GOAL.t)return r;
    let pt=GOAL.pt;if(pt&&pt.m){if(pt.m.dead)return r;pt={x:pt.m.x,y:pt.m.y};}if(!pt)return r;
    const p=proj(pt.x,pt.y),sx=p.x-camX,sy=p.y-camY-20,mT=78,mB=VH-(document.body.classList.contains('touchui')?120:90),mL=40,mR=VW-40;
    ctx.save();ctx.setTransform(DPR,0,0,DPR,0,0);
    if(sx>mL&&sx<mR&&sy>mT&&sy<mB){const b=Math.sin(now*5)*4,y=sy-34+b;ctx.fillStyle='rgba(255,207,90,.95)';ctx.strokeStyle='rgba(30,20,8,.8)';ctx.lineWidth=2;
      ctx.beginPath();ctx.moveTo(sx,y+10);ctx.lineTo(sx-8,y);ctx.lineTo(sx-3,y);ctx.lineTo(sx-3,y-8);ctx.lineTo(sx+3,y-8);ctx.lineTo(sx+3,y);ctx.lineTo(sx+8,y);ctx.closePath();ctx.stroke();ctx.fill();}
    else{const cx=VW/2,cy=(mT+mB)/2,dx=sx-cx,dy=sy-cy,k=Math.min((mR-cx)/Math.max(1e-6,Math.abs(dx)),(mB-cy)/Math.max(1e-6,Math.abs(dy))),ax=cx+dx*k,ay=cy+dy*k,ang=Math.atan2(dy,dx);
      const pulse=.85+.15*Math.sin(now*4);ctx.translate(ax,ay);ctx.rotate(ang);ctx.globalAlpha=pulse;
      ctx.fillStyle='rgba(14,18,26,.75)';ctx.beginPath();ctx.arc(-6,0,17,0,7);ctx.fill();
      ctx.fillStyle='#ffcf5a';ctx.strokeStyle='rgba(30,20,8,.9)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(10,0);ctx.lineTo(-10,-9);ctx.lineTo(-5,0);ctx.lineTo(-10,9);ctx.closePath();ctx.stroke();ctx.fill();}
    ctx.restore();}catch(e){}return r;};}

if(typeof PANELS!=='undefined'&&PANELS.settings){const _psG=PANELS.settings;PANELS.settings=function(){const h=_psG.apply(this,arguments);
  const row=`<div class="setrow"><div class="grow"><div class="nm">Goal arrow</div><div class="ds">A chip under the map with what to do next, and an arrow pointing the way</div></div>${toggle('setgoal',goalOn(),'Goal arrow on or off')}</div>`;
  const at=h.indexOf('<div class="setrow"><div class="grow"><div class="nm">Monster card');return at<0?h+row:h.slice(0,at)+row+h.slice(at);};}
PANEL_ACTS.setgoal=()=>{SETS.goal=!goalOn();saveSets();goalChip();refreshPanel();};

if(typeof TH!=='undefined')Object.assign(TH,{'Goal arrow':'ลูกศรนำทาง','A chip under the map with what to do next, and an arrow pointing the way':'ป้ายใต้แผนที่บอกสิ่งที่ต้องทำต่อ และลูกศรชี้ทาง',
  'Goal arrow on or off':'เปิดหรือปิดลูกศรนำทาง','Choose your calling with Corvin':'เลือกอาชีพกับคอร์วิน','Corvin has a trial for you':'คอร์วินมีบททดสอบให้คุณ','Trial done: choose your calling':'บททดสอบสำเร็จ: เลือกอาชีพ'});
if(typeof TH_PAT!=='undefined')TH_PAT.unshift([/^ · via (.+)$/,' · ผ่าน $1'],[/^ · (\d+) m$/,' · $1 ม.'],[/^Go to (.+)$/,'ไปที่ $1'],[/^(.+) has a quest$/,(m,a)=>`${typeof NPC_TH!=='undefined'&&NPC_TH[a]||a} มีเควสให้`],[/^Contract: (.+) (\d+)\/(\d+)$/,'สัญญา: $1 $2/$3']);
