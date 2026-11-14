"use strict";
/* ================= bounty board (Guild Hall) and daily login gifts =================
   Bounties: 3 daily and 1 weekly, picked for your level from the monsters around it (Thailand time: days roll at
   midnight, weeks on Monday). Defeat bounties count your kills by themselves; bring bounties take the items when you
   claim. Claim at the Guild Hall for EXP, gold and bounty points (daily 1, weekly 3); 10 points open the weekly chest.
   Login gifts: the first time you play each day, a 7-day calendar card; missing a day starts again at day 1. */
const THDAY=()=>new Date(Date.now()+7*3600e3).toISOString().slice(0,10);
function THWEEK(){const d=new Date(Date.now()+7*3600e3);const day=(d.getUTCDay()+6)%7;d.setUTCDate(d.getUTCDate()-day);return d.toISOString().slice(0,10);}
// a small seeded random (the same picks all day for this hero)
function bSeed(s){let h=2166136261;for(const c of s)h=Math.imul(h^c.charCodeAt(0),16777619);return ()=>{h=Math.imul(h^(h>>>15),2246822507);h=Math.imul(h^(h>>>13),3266489909);return ((h^=h>>>16)>>>0)/4294967296;};}
const bMobZone=id=>Object.keys(ZONES).find(z=>(ZONES[z].mobs||[]).some(m=>m[0]===id));
function bPool(){const near=Object.values(MOBS).filter(m=>!m.boss&&!m.world&&bMobZone(m.id)).map(m=>({m,d:Math.abs(m.lv-P.lv)})).sort((a,b)=>a.d-b.d);
  return near.filter(x=>x.d<=7).map(x=>x.m).concat(near.slice(0,6).map(x=>x.m)).filter((m,i,a)=>a.indexOf(m)===i);}
function bMake(day){const R=bSeed(day+'|'+P.name+'|'+P.lv),pool=bPool(),out=[],used=new Set();
  for(let i=0;i<3&&pool.length;i++){let m=pool[Math.floor(R()*pool.length)],tries=0;while(used.has(m.id)&&tries++<8)m=pool[Math.floor(R()*pool.length)];used.add(m.id);
    const drops=(m.drops||[]).filter(([id,ch])=>ITEMS[id]&&ITEMS[id].type==='etc'&&ch>=.15);
    if(i===1&&drops.length){const [it]=drops[Math.floor(R()*drops.length)];const n=m.lv>=30?8:m.lv>=14?10:12;out.push({k:'bring',item:it,mob:m.id,n,have:0});}
    else{const n=m.lv>=30?25:m.lv>=14?30:35;out.push({k:'kill',mob:m.id,n,have:0});}}
  return out;}
function bWeekly(week){const R=bSeed(week+'|w|'+P.name),bosses=Object.values(MOBS).filter(m=>m.boss&&!m.world&&bMobZone(m.id)&&Math.abs(m.lv-P.lv)<=8);
  if(bosses.length&&R()<.6){const b=bosses[Math.floor(R()*bosses.length)];return {k:'boss',mob:b.id,n:1,have:0,weekly:1};}
  const minLv=Math.max(1,P.lv-6);return {k:'any',minLv,n:150,have:0,weekly:1};}
function bState(){if(!P)return null;let b=P.bounty;const day=THDAY(),week=THWEEK();
  if(!b||typeof b!=='object')b=P.bounty={};
  if(b.day!==day){b.day=day;b.d=bMake(day);}
  if(b.week!==week){b.week=week;b.w=bWeekly(week);b.pts=0;b.chest=0;}
  return b;}
const bHave=x=>x.k==='bring'?Math.min(x.n,(invFind(x.item)||{}).n||0):Math.min(x.n,x.have);
const bDone=x=>bHave(x)>=x.n;
function bReward(x){if(x.k==='any')return {exp:Math.round(expNeed(P.lv)*.35),jexp:Math.round(jexpNeed(Math.max(1,P.jl))*.35),gold:P.lv*120,pts:3};
  const m=MOBS[x.mob];const k=x.weekly?1:1;
  if(x.k==='boss')return {exp:Math.round(m.exp*.6),jexp:Math.round(m.jexp*.6),gold:m.lv*300,pts:3};
  const kills=x.k==='bring'?x.n*3:x.n;return {exp:Math.round(m.exp*kills*1.3*k),jexp:Math.round(m.jexp*kills*1.1),gold:m.lv*x.n*10,pts:1};}
function bTitle(x){if(x.k==='any')return `Defeat ${x.n} monsters of Lv ${x.minLv}+`;const m=MOBS[x.mob];
  return x.k==='bring'?`Bring ${x.n} ${ITEMS[x.item].name}`:x.k==='boss'?`Defeat ${m.name}`:`Defeat ${x.n} ${m.name}`;}
// kills count by themselves
{const _kmB=killMob;killMob=function(m){const mine=m&&!m.dead&&(m.myDmg||0)>0;const r=_kmB.apply(this,arguments);
  try{if(mine&&P){const b=bState();for(const x of [...b.d,b.w]){if(!x||x.claimed||bDone(x))continue;
      if((x.k==='kill'||x.k==='boss')&&x.mob===m.d.id)x.have++;else if(x.k==='any'&&m.d.lv>=x.minLv)x.have++;else continue;
      if(bDone(x)){addLog(`Bounty done: ${bTitle(x)}. Claim it at the Guild Hall.`,'l-rare');floatT(P.x,P.y-56,'Bounty done!','#ffcf5a',15);sfx('rare');}}}}catch(e){}return r;};}
function bRow(x,i){const r=bReward(x),done=bDone(x),pic=x.k==='bring'?itemChip(x.item,x.n):x.mob?mobChip(x.mob,x.n,bHave(x)):'';
  const where=x.mob?bMobZone(x.mob):null;
  return `<div class="row bty${x.claimed?' claimed':''}">${pic||'<span class="cmi nt"><b>★</b></span>'}<div class="grow"><div class="nm">${x.weekly?'<span class="bwk">Weekly</span> ':''}${esc(bTitle(x))}</div>`+
    `<div class="ds">${x.k!=='bring'?`Progress ${bHave(x)}/${x.n} · `:''}Reward ${fmt(r.exp)} EXP, ${fmt(r.gold)} gold, ${r.pts} point${r.pts>1?'s':''}${where?` · ${ZONES[where].name}`:''}</div></div>`+
    (x.claimed?`<span class="muted">Claimed</span>`:`<button class="btn small" data-act="bclaim" data-arg="${i}" ${done?'':'disabled'}>Claim</button>`)+`</div>`;}
function bountyHtml(){const b=bState();if(!b)return '';const pts=Math.min(10,b.pts||0);
  let h=`<h3>Bounty board</h3><div class="ds" style="margin-bottom:4px">New bounties every day (and a weekly one every Monday). Kills count by themselves; claim here.</div>`;
  b.d.forEach((x,i)=>{h+=bRow(x,i);});if(b.w)h+=bRow(b.w,'w');
  {const d=loginNext();if(d)h+=`<div class="row bgift"><span class="cmi nt"><b>🎁</b></span><div class="grow"><div class="nm">Daily gift: day ${d}</div><div class="ds">${esc(LOGIN_GIFTS[d-1].t)}</div></div><button class="btn small" data-act="bgift">Claim</button></div>`;}
  h+=`<div class="bpts"><div class="bbar"><i style="width:${pts*10}%"></i></div><span>${pts}/10 points</span><button class="btn small" data-act="bchest" ${pts>=10&&!b.chest?'':'disabled'}>${b.chest?'Chest opened':'Open weekly chest'}</button></div>`;
  return h;}
PANEL_ACTS.bclaim=arg=>{const b=bState(),x=arg==='w'?b.w:b.d[+arg];if(!x||x.claimed||!bDone(x))return;
  if(x.k==='bring'&&!takeItem(x.item,x.n))return;const r=bReward(x);x.claimed=1;b.pts=(b.pts||0)+r.pts;P.gold+=r.gold;sfx('fanfare');
  fx.push({k:'lvl',x:P.x,y:P.y-30,t0:now,dur:1.6,txt:'BOUNTY CLAIMED',col:'#ffcf5a'});addLog(`Bounty claimed: ${bTitle(x)}. ${fmt(r.exp)} EXP, ${fmt(r.gold)} gold, +${r.pts} bounty point${r.pts>1?'s':''}.`,'l-rare');
  gainExp(r.exp,r.jexp);refreshPanel();save();};
PANEL_ACTS.bchest=()=>{const b=bState();if(!b||b.chest||(b.pts||0)<10)return;b.chest=1;
  const sigs=Object.values(MOBS).filter(m=>!m.boss&&Math.abs(m.lv-P.lv)<=8&&ITEMS[m.id+'_sig']),R=Math.random;
  const got=[];if(sigs.length&&R()<.6){const m=sigs[Math.floor(R()*sigs.length)];giveItem(m.id+'_sig',1);got.push(ITEMS[m.id+'_sig'].name);}else{giveItem('glintstone',2);giveItem('emberore',2);got.push('Glintstone ×2','Ember Ore ×2');}
  if(ITEMS.rustykey){giveItem('rustykey',1);got.push('Rusty Key');}
  const gold=P.lv*400;P.gold+=gold;sfx('fanfare');fx.push({k:'lvpillar',x:P.x,y:P.y,t0:now,dur:1.6});addLog(`Weekly chest: ${got.join(', ')} and ${fmt(gold)} gold!`,'l-rare');refreshPanel();save();};
// in the Guild Hall window, under the hunting contracts
{const _rpBo=refreshPanel;refreshPanel=function(){const r=_rpBo.apply(this,arguments);try{if(panelKind==='job'&&P&&!panel.querySelector('.bpts'))panel.insertAdjacentHTML('beforeend',bountyHtml());}catch(e){}return r;};}

/* ---- daily login gifts ---- */
const LOGIN_GIFTS=[{t:'5 Red Tonics',g:()=>giveItem('red',5),i:'red'},{t:'500 gold',g:()=>{P.gold+=500;},gold:1},{t:'5 Amber Tonics',g:()=>giveItem('orange',5),i:'orange'},
  {t:'Ember Ore + Glintstone',g:()=>{giveItem('emberore',1);giveItem('glintstone',1);},i:'glintstone'},{t:'5 Blue Tonics',g:()=>giveItem('blue',5),i:'blue'},{t:'2,000 gold',g:()=>{P.gold+=2000;},gold:1},
  {t:'A sigil',g:()=>{const s=Object.values(MOBS).filter(m=>!m.boss&&Math.abs(m.lv-P.lv)<=8&&ITEMS[m.id+'_sig']);const m=s.length?s[Math.floor(Math.random()*s.length)]:MOBS.sproutling;giveItem(m.id+'_sig',1);return ITEMS[m.id+'_sig'].name;},i:'sproutling_sig'}];
function loginNext(){const L=P.login||{},today=THDAY();if(L.last===today)return null;
  const y=new Date(Date.now()+7*3600e3-864e5).toISOString().slice(0,10);return L.last===y?(L.day%7)+1:1;}
function loginCard(){if(!P||!running)return;const day=loginNext();if(!day)return;let el=document.getElementById('loginCard');
  if(!el){el=document.createElement('div');el.id='loginCard';el.setAttribute('role','dialog');document.body.appendChild(el);
    el.addEventListener('click',ev=>{const b=ev.target.closest('[data-lg]');if(!b)return;ev.stopPropagation();if(b.dataset.lg==='claim')loginClaim();el.classList.remove('show');});
    // taps outside the button go to the game and put the card away (the gift waits on the bounty board)
    addEventListener('pointerdown',ev=>{if(el.classList.contains('show')&&!ev.target.closest('#loginCard [data-lg]'))setTimeout(()=>el.classList.remove('show'),120);},true);}
  el.innerHTML=`<div class="lgt">Daily gift · day ${day} of 7</div><div class="lgd">`+LOGIN_GIFTS.map((g,i)=>`<div class="lgx${i+1<day?' got':i+1===day?' today':''}"><span>Day ${i+1}</span>${g.gold?'<b class="lgc">◉</b>':`<img src="${itemIconURL(g.i)}" alt="">`}<small>${esc(g.t)}</small></div>`).join('')+`</div>`+
    `<div class="lgs">Come back every day: missing a day starts again at day 1.</div><div class="tbtns"><button class="btn" data-lg="claim">Claim day ${day}</button></div>`;
  el.classList.add('show');}
PANEL_ACTS.bgift=()=>loginClaim();
function loginClaim(){const day=loginNext();if(!day)return;setTimeout(()=>{try{giftPill();}catch(e){}},0);const g=LOGIN_GIFTS[day-1],extra=g.g();P.login={last:THDAY(),day};sfx('fanfare');
  addLog(`Daily gift, day ${day}: ${extra||g.t}!`,'l-rare');floatT(P.x,P.y-50,`Day ${day} gift!`,'#ffcf5a',15);refreshPanel();save();}
// nothing pops up over the game by itself: a small pill at the top says a gift is waiting; tapping it opens the calendar
function giftPill(){let el=document.getElementById('giftPill');const d=P&&running?loginNext():null;
  if(!d){if(el)el.hidden=true;return;}
  if(!el){el=document.createElement('button');el.id='giftPill';el.type='button';document.body.appendChild(el);el.addEventListener('click',ev=>{ev.stopPropagation();loginCard();});}
  const t=`🎁 Daily gift · day ${d}`;if(el.textContent!==t)el.textContent=t;el.hidden=false;
  // upright phones: under the status box and the map (sideways and desktop: the CSS spot under the top strip)
  let top='';if(innerHeight>innerWidth&&document.body.classList.contains('touchui')){let b=0;for(const id of ['hud','minibox']){const e=document.getElementById(id);if(e&&e.getClientRects().length)b=Math.max(b,e.getBoundingClientRect().bottom);}top=Math.round(b+8)+'px';}
  if(el.style.top!==top)el.style.top=top;}
setInterval(()=>{try{giftPill();}catch(e){}},1000);

if(typeof SAVE_EXTRA!=='undefined')SAVE_EXTRA.push('bounty','login');
if(typeof TH!=='undefined')Object.assign(TH,{'Bounty board':'กระดานค่าหัว','New bounties every day (and a weekly one every Monday). Kills count by themselves; claim here.':'ค่าหัวใหม่ทุกวัน (และค่าหัวประจำสัปดาห์ทุกวันจันทร์) การปราบนับเองอัตโนมัติ รับรางวัลที่นี่',
  'Claim':'รับ','Claimed':'รับแล้ว','Weekly':'ประจำสัปดาห์','Open weekly chest':'เปิดหีบประจำสัปดาห์','Chest opened':'เปิดหีบแล้ว','Bounty done!':'ค่าหัวสำเร็จ!','BOUNTY CLAIMED':'รับค่าหัวแล้ว',
  'Come back every day: missing a day starts again at day 1.':'กลับมาทุกวัน: ถ้าขาดวันจะเริ่มใหม่ที่วันที่ 1','5 Red Tonics':'ยาแดง 5 ขวด','500 gold':'500 โกลด์','5 Amber Tonics':'ยาส้ม 5 ขวด','Ember Ore + Glintstone':'Ember Ore + Glintstone','5 Blue Tonics':'ยาฟ้า 5 ขวด','2,000 gold':'2,000 โกลด์','A sigil':'ซิกิล 1 อัน'});
if(typeof TH_PAT!=='undefined')TH_PAT.unshift([/^Daily gift: day (\d)$/,'ของขวัญประจำวัน: วันที่ $1']);
if(typeof TH_PAT!=='undefined')TH_PAT.unshift([/^Daily gift · day (\d) of 7$/,'ของขวัญประจำวัน · วันที่ $1 จาก 7'],[/^Day (\d)$/,'วันที่ $1'],[/^Claim day (\d)$/,'รับของวันที่ $1'],[/^(\d+)\/10 points$/,'$1/10 แต้ม'],
  [/^Defeat (\d+) monsters of Lv (\d+)\+$/,'ปราบมอนสเตอร์ Lv $2+ จำนวน $1 ตัว'],[/^Defeat ([A-Z].+)$/,'ปราบ $1'],
  [/^Reward ([\d,]+) EXP, ([\d,]+) gold, (\d+) points?( · .+)?$/,(m,a,b,c,d)=>`รางวัล ${a} EXP, ${b} โกลด์, ${c} แต้ม${d||''}`],[/^Progress (\d+)\/(\d+) ·$/,'ความคืบหน้า $1/$2 ·'],
  [/^Bounty done: (.+)\. Claim it at the Guild Hall\.$/,'ค่าหัวสำเร็จ: $1 รับรางวัลที่หอกิลด์'],[/^Day (\d) gift!$/,'ของขวัญวันที่ $1!'],[/^🎁 Daily gift · day (\d)$/,'🎁 ของขวัญประจำวัน · วันที่ $1']);
if(typeof TH_PAT!=='undefined')TH_PAT.unshift([/^Progress (\d+)\/(\d+) · Reward ([\d,]+) EXP, ([\d,]+) gold, (\d+) points?( · .+)?$/,(m,a,b,c,d,e,f)=>`ความคืบหน้า ${a}/${b} · รางวัล ${c} EXP, ${d} โกลด์, ${e} แต้ม${f||''}`]);
