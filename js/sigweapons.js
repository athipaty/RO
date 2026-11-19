"use strict";
/* ================= signature weapons: each job family's own weapon that grows with you (v1.39.1) =================
   One weapon line per first calling, three stages that follow your path: forged by Brannoc in Hearthvale once you
   hold the calling, re-forged by Smith Garrow in Aurelmark after your advanced calling and again after your master
   calling. Only that calling's family can wield it. Re-forging keeps the refine level, the sigils (and adds a slot)
   and the awakened line. Each line has a special of its own:
     Warden   Oathbound Blade → Sworn Oathblade → Oathkeeper: the lower your HP, the harder you hit
              (up to +15% / +25% / +40% at the last sliver of HP); the blade glows brighter as you are hurt.
     Arcanist Starweave Staff → Nightweave Staff → Astral Loom: every 5th/4th/3rd spell is free and casts faster.
     Ranger   Windstring Bow → Galestring Bow → Skyreaver: some shots loose extra arrows at monsters nearby.
     Cleric   Dawnbell Mace → Sunpeal Mace → Dawnchime: hits heal you (and party members nearby, later).
     Shade    Veilfang → Duskfang → Eclipse Fang: hits may poison; poisoned monsters take more from you.
   Drawn in code, original art. */
const SIGW={
  warden:{fam:'Warden',stages:[
    {id:'oathblade1',name:'Oathbound Blade',atk:72,lv:15,slots:1,tier:1,smith:'brannoc',gold:3000,mats:{pelt:10,ramhorn:6,emberore:3},bonus:.15},
    {id:'oathblade2',name:'Sworn Oathblade',atk:150,lv:45,slots:2,tier:2,smith:'garrow',gold:20000,mats:{bone:12,core:6,dust:10,emberore:5},bonus:.25},
    {id:'oathblade3',name:'Oathkeeper',atk:215,lv:75,slots:3,tier:3,smith:'garrow',gold:80000,mats:{mantisblade:10,mirestone:8,fang:12,emberore:10},bonus:.40}],
    wt:'sword',special:s=>`The lower your HP, the harder you hit: up to +${Math.round(s.bonus*100)}% damage when nearly fallen.`},
  // v1.39.4 the Arcanist's Starweave Staff: every few spells one comes free and quick (the stars round its head count up)
  arcanist:{fam:'Arcanist',stages:[
    {id:'starweave1',name:'Starweave Staff',atk:12,matk:72,lv:15,slots:1,tier:1,smith:'brannoc',gold:3000,mats:{spore:10,wispbreath:8,glintstone:3},every:5,fast:.3},
    {id:'starweave2',name:'Nightweave Staff',atk:18,matk:142,lv:45,slots:2,tier:2,smith:'garrow',gold:20000,mats:{dust:10,gloomspore:8,shard:6,glintstone:5},every:4,fast:.5},
    {id:'starweave3',name:'Astral Loom',atk:26,matk:208,lv:75,slots:3,tier:3,smith:'garrow',gold:80000,mats:{wispglow:12,rotspore:10,shadeveil:8,glintstone:10},every:3,fast:.7}],
    wt:'wand',special:s=>`Every ${['','','2nd','3rd','4th','5th'][s.every]} spell costs no SP and casts ${Math.round(s.fast*100)}% faster.`},
  // v1.39.5 the Ranger's Windstring Bow: some shots loose extra arrows at other monsters nearby
  ranger:{fam:'Ranger',stages:[
    {id:'windstring1',name:'Windstring Bow',atk:50,lv:15,slots:1,tier:1,smith:'brannoc',gold:3000,mats:{thorn:8,tuft:12,emberore:3},chance:.25,extra:1,dmg:.7},
    {id:'windstring2',name:'Galestring Bow',atk:110,lv:45,slots:2,tier:2,smith:'garrow',gold:20000,mats:{needle:10,batwing:10,crabshell:6,emberore:5},chance:.35,extra:1,dmg:.85},
    {id:'windstring3',name:'Skyreaver',atk:162,lv:75,slots:3,tier:3,smith:'garrow',gold:80000,mats:{lurkerscale:10,mantisblade:6,fur:10,emberore:10},chance:.45,extra:2,dmg:1}],
    wt:'bow',special:s=>`${Math.round(s.chance*100)}% of your shots loose ${s.extra>1?'two more arrows':'a second arrow'} at other monsters nearby (${Math.round(s.dmg*100)}% damage).`},
  // v1.39.6 the Cleric's Dawnbell Mace: hits heal you (and, later, party members nearby)
  cleric:{fam:'Cleric',stages:[
    {id:'dawnbell1',name:'Dawnbell Mace',atk:66,lv:15,slots:1,tier:1,smith:'brannoc',gold:3000,mats:{sap:15,shell:10,emberore:3},heal:.02,party:false},
    {id:'dawnbell2',name:'Sunpeal Mace',atk:140,lv:45,slots:2,tier:2,smith:'garrow',gold:20000,mats:{carapace:10,glowsilk:10,crabshell:6,emberore:5},heal:.03,party:true},
    {id:'dawnbell3',name:'Dawnchime',atk:200,lv:75,slots:3,tier:3,smith:'garrow',gold:80000,mats:{wispglow:10,bogmoss:12,fur:8,emberore:10},heal:.04,party:true}],
    wt:'mace',special:s=>`Your hits heal you for ${Math.round(s.heal*100)}% of your max HP${s.party?', and party members nearby too':''} (at most every 0.6 s).`},
  // v1.39.7 the Shade's Veilfang: hits may poison, and poisoned monsters take more from you
  shade:{fam:'Shade',stages:[
    {id:'veilfang1',name:'Veilfang',atk:58,lv:15,slots:1,tier:1,smith:'brannoc',gold:3000,mats:{spore:8,pelt:6,emberore:3},chance:.2,pois:.25,vs:.15},
    {id:'veilfang2',name:'Duskfang',atk:118,lv:45,slots:2,tier:2,smith:'garrow',gold:20000,mats:{shadeveil:10,dust:10,needle:6,emberore:5},chance:.3,pois:.35,vs:.25},
    {id:'veilfang3',name:'Eclipse Fang',atk:178,lv:75,slots:3,tier:3,smith:'garrow',gold:80000,mats:{rotspore:12,gloomspore:10,mantisblade:6,emberore:10},chance:.4,pois:.5,vs:.35}],
    wt:'dagger',special:s=>`${Math.round(s.chance*100)}% of your hits poison (${Math.round(s.pois*100)}% ATK every second for 4 s), and poisoned monsters take ${Math.round(s.vs*100)}% more damage from you.`}};
const SIGW_BY={};for(const [fam,L] of Object.entries(SIGW))L.stages.forEach((s,i)=>{SIGW_BY[s.id]={fam,i,s,L};
  ITEMS[s.id]={name:s.name,type:'weapon',wt:L.wt,atk:s.atk,...(s.matk?{matk:s.matk}:{}),lv:s.lv,slots:s.slots,price:0,col:'#e8c25a',g:'W',sigw:fam,stage:i+1,
    desc:`${L.fam} signature weapon, stage ${i+1} of 3. ${L.special(s)} Only the ${L.fam} family can wield it.`};});
const famOf=cls=>typeof baseOf==='function'?baseOf(cls):cls;
const tierOf=cls=>(CLASSES[cls]&&CLASSES[cls].tier)||1;
// only the family can wield it
{const _ce=canEquip;canEquip=function(it){if(it&&it.sigw&&famOf(P.cls)!==it.sigw)return `Only the ${SIGW[it.sigw].fam} family can wield the ${it.name}.`;return _ce.apply(this,arguments);};}
// the Warden's special: harder hits the lower your HP
const sigwNow=()=>{const w=P&&P.eq&&P.eq.weapon;return w&&SIGW_BY[w.id]?SIGW_BY[w.id]:null;};
function oathFactor(){const sw=sigwNow();if(!sw||sw.fam!=='warden'||!S||!S.maxhp)return 1;const miss=clamp(1-P.hp/S.maxhp,0,1);return 1+sw.s.bonus*miss;}
{const _dp=dealPhys;dealPhys=function(m,mult,o){const k=oathFactor();return _dp.call(this,m,(mult||1)*k,o);};}
// the Arcanist's special: every few spells one is free and quick
function starCharge(){const sw=sigwNow();return sw&&sw.fam==='arcanist'?{n:(P.starN||0)%sw.s.every,every:sw.s.every,fast:sw.s.fast}:null;}
{const _bc=beginCast;beginCast=function(id,l,cost,fn){const ch=starCharge();if(!ch||!SKILLS[id]||SKILLS[id].kind==='passive')return _bc.apply(this,arguments);
  P.starN=(P.starN||0)+1;const emp=ch.n===ch.every-1;if(!emp)return _bc.apply(this,arguments);
  const r=_bc.call(this,id,l,0,fn);if(P.casting&&P.casting.id===id)P.casting.dur*=1-ch.fast;
  floatT(P.x,P.y-62,'Starweave!','#c8b0ff',14);fx.push({k:'ring',x:P.x,y:P.y,r:34,col:'#c8b0ff',t0:now,dur:.5});return r;};}
// the Ranger's special: extra arrows at other monsters near the target
{const _ba=basicAttack;basicAttack=function(t){const r=_ba.apply(this,arguments);try{const sw=sigwNow();
  if(sw&&sw.fam==='ranger'&&t&&S.range>100&&Math.random()<sw.s.chance){const others=mobs.filter(m=>m!==t&&!m.dead&&dist(P,m)<=S.range+m.d.size&&Math.hypot(m.x-t.x,m.y-t.y)<260).sort((a,b)=>Math.hypot(a.x-t.x,a.y-t.y)-Math.hypot(b.x-t.x,b.y-t.y)).slice(0,sw.s.extra);
    const rel=(P.bowDur||.4)*(typeof BOW_RELEASE==='number'?BOW_RELEASE:.5)*1000+60;
    others.forEach((m,k)=>setTimeout(()=>{if(!P||P.dead||m.dead)return;shoot(P,m,'arrow','#9fe8c8',()=>dealPhys(m,sw.s.dmg));},rel+k*70));
    if(others.length)floatT(P.x,P.y-58,others.length>1?'Triple shot!':'Double shot!','#9fe8c8',13);}}catch(e){}return r;};}
// the Cleric's special: hits heal you, and party members nearby at the later stages
let bellAt=0;
function bellHit(){const sw=sigwNow();if(!sw||sw.fam!=='cleric'||!S||now-bellAt<.6||P.dead)return;bellAt=now;const v=Math.round(S.maxhp*sw.s.heal);healP(v);
  if(sw.s.party&&typeof partyMatesHere==='function'){const mates=partyMatesHere().filter(o=>o.id&&Math.hypot(o.rx-P.x,o.ry-P.y)<=200);
    if(mates.length){NET.sp=[...(NET.sp||[]),...mates.map(o=>({i:++NET.spId,to:o.id,k:'dawnbell',l:1,v}))].slice(-12);NET.lastSent='';NET.sendT=0;
      for(const o of mates)floatT(o.rx,o.ry-30,'+'+fmt(v),'#ffe9a0',13);}}}
{const _dp2=dealPhys;dealPhys=function(){const r=_dp2.apply(this,arguments);try{bellHit();}catch(e){}return r;};}
{const _dm2=dealMag;dealMag=function(){const r=_dm2.apply(this,arguments);try{bellHit();}catch(e){}return r;};}
// a party member's Dawnbell heal reaching you
if(typeof supportRecv==='function'){const _sr=supportRecv;supportRecv=function(o,arr,fresh){try{if(Array.isArray(arr)&&!fresh&&P&&!P.dead)for(const e of arr.slice(-12)){
    if(!e||e.k!=='dawnbell'||e.to!==NET.myId||fin(e.i)<=(o.spSeen||0)||!inParty(o.peer)||o.z!==zoneId||Math.hypot(o.x-P.x,o.y-P.y)>350)continue;healP(clamp(Math.round(fin(e.v)),0,50000));}}catch(err){}
  return _sr.apply(this,arguments);};}
// the Shade's special: hits may poison; poisoned monsters take more damage from you
let veilTick=false;
{const _dp3=dealPhys;dealPhys=function(m,mult,o){const sw=sigwNow();if(!sw||sw.fam!=='shade'||!m)return _dp3.apply(this,arguments);
  const k=m.sigPoisonUntil>now?1+sw.s.vs:1;const r=_dp3.call(this,m,(mult||1)*k,o);
  try{if(!veilTick&&!m.dead&&Math.random()<sw.s.chance){m.sigPoisonUntil=now+4.2;const p=sw.s.pois;floatT(m.x,m.y-m.d.size-18,'Poisoned','#9be35a',12);
    for(let i=1;i<=4;i++)setTimeout(()=>{if(!m||m.dead||!mobs.includes(m)||!P||P.dead)return;veilTick=true;try{dealPhys(m,p,{sure:true,el:'earth'});}finally{veilTick=false;}
      fx.push({k:'ring',x:m.x,y:m.y,r:16,col:'#9be35a',t0:now,dur:.35});},i*1000);}}catch(e){}return r;};}
// where your line stands: the piece you own (worn or in the bag), and the next stage you can reach
function sigwOwned(fam){const L=SIGW[fam];if(!L)return null;let best=null;
  const consider=(e,where)=>{const b=e&&SIGW_BY[e.id];if(b&&b.fam===fam&&(!best||b.i>best.i))best={e,where,i:b.i};};
  for(const s of ['weapon'])consider(P.eq[s],'equipped');for(const e of P.inv)consider(e,'bag');for(const e of P.storage||[])consider(e,'storage');return best;}
function sigwNext(fam){const own=sigwOwned(fam),i=own?own.i+1:0;return i<3?{i,s:SIGW[fam].stages[i],own}:null;}
function sigwBlock(fam,smith){const L=SIGW[fam],nx=sigwNext(fam),own=sigwOwned(fam);
  let h=`<h3>${L.fam} signature weapon</h3>`;
  if(!nx){return h+`<div class="row">${icon({id:own.e.id})}<div class="grow"><div class="nm">${esc(ITEMS[own.e.id].name)} <span class="pill">final form</span></div><div class="ds">${esc(L.special(L.stages[2]))}</div></div></div>`;}
  const s=nx.s,here=s.smith===smith,tierOk=tierOf(P.cls)>=s.tier,lvOk=P.lv>=s.lv,ownOk=nx.i===0||(own&&own.where!=='storage');
  const matsOk=Object.entries(s.mats).every(([id,n])=>((invFind(id)||{}).n||0)>=n),ok=here&&tierOk&&lvOk&&ownOk&&matsOk&&P.gold>=s.gold;
  const need=[];if(!tierOk)need.push(s.tier===2?'your advanced calling':'your master calling');if(!lvOk)need.push(`base level ${s.lv}`);if(!ownOk)need.push(`the ${ITEMS[own.e.id].name} with you (not in storage)`);
  h+=`<div class="row sigwrow">${icon({id:s.id})}<div class="grow"><div class="nm">${nx.i?`${esc(ITEMS[own.e.id].name)} → `:''}${esc(s.name)} <span class="muted">· stage ${nx.i+1}/3 · ATK ${s.atk} · ${s.slots} slot${s.slots>1?'s':''}</span></div>`+
    `<div class="ds">${esc(L.special(s))}${nx.i?' Keeps its refine, sigils and awakened line.':''}</div>`+
    `<div class="cms">${Object.entries(s.mats).map(([id,n])=>itemChip(id,n)).join('')}${goldChip(s.gold)}</div>`+
    (need.length?`<div class="ds" style="color:var(--warn)">Needs ${need.join(', ')}.</div>`:'')+
    (here?'':`<div class="ds" style="color:var(--warn)">${s.smith==='brannoc'?'Brannoc the Smith in Hearthvale forges this stage.':'Smith Garrow at the Forge Royal in Aurelmark forges this stage.'}</div>`)+`</div>`+
    `<button class="btn small" data-act="sigwforge" data-arg="${fam}" ${ok?'':'disabled'}>${nx.i?'Re-forge':'Forge'}</button></div>`;
  return h;}
// shown in the smith's window for your own family (Brannoc and Garrow)
{const _rp=refreshPanel;refreshPanel=function(){const r=_rp.apply(this,arguments);
  try{if(panelKind==='smith'&&P&&!panel.querySelector('.sigwbox')){const fam=famOf(P.cls);if(SIGW[fam]){const smith=typeof inCapital==='function'&&inCapital()?'garrow':'brannoc';
      const h3=[...panel.querySelectorAll('h3')].find(x=>/Refine/.test(x.textContent));const box=document.createElement('div');box.className='sigwbox';box.innerHTML=sigwBlock(fam,smith);
      if(h3)h3.parentNode.insertBefore(box,h3);else panel.appendChild(box);}}}catch(e){}return r;};}
PANEL_ACTS.sigwforge=fam=>{const nx=sigwNext(fam);if(!nx)return;const s=nx.s,smith=typeof inCapital==='function'&&inCapital()?'garrow':'brannoc';
  if(s.smith!==smith||famOf(P.cls)!==fam||tierOf(P.cls)<s.tier||P.lv<s.lv||P.gold<s.gold)return;
  if(!Object.entries(s.mats).every(([id,n])=>((invFind(id)||{}).n||0)>=n))return;
  if(nx.i&&(!nx.own||nx.own.where==='storage'))return;
  for(const [id,n] of Object.entries(s.mats))takeItem(id,n);P.gold-=s.gold;
  if(nx.i){const e=nx.own.e;e.id=s.id;e.s=Array.isArray(e.s)?e.s.slice(0,s.slots):[];while(e.s.length<s.slots)e.s.push(null);}
  else giveItem(s.id,1);
  S=computeStats();save();sfx('fanfare');fx.push({k:'ring',x:P.x,y:P.y,r:48,col:'#ffd76a',t0:now,dur:.8});fx.push({k:'critburst',x:P.x,y:P.y-30,t0:now,dur:.6});
  fx.push({k:'lvl',x:P.x,y:P.y-30,t0:now,dur:1.8,txt:nx.i===2?'FINAL FORM':'SIGNATURE WEAPON',col:'#ffd76a'});
  addLog(nx.i?`The ${s.name} rises from the forge, stronger than before!`:`The smith hands you your own ${s.name}. Equip it from your bag.`,'l-rare');refreshPanel();};
/* ---- the look: each stage its own blade; the Oathbound line glows brighter the more you are hurt ---- */
function waOath(stage){const hurt=sigwNow()&&sigwNow().fam==='warden'&&S&&S.maxhp?clamp(1-P.hp/S.maxhp,0,1):0,c=ctx;
  const L=[22,25,28][stage],W=[4,4.6,5.2][stage],blade=['#d8dee8','#e4ecf6','#f4f0e0'][stage],gold='#e8c25a';
  waGrip(6,-1,2.8,'#3a2a4a','#e8c25a','#e8c25a');
  // a winged crossguard that grows with each stage
  c.beginPath();c.moveTo(-6-stage*1.5,-2);c.quadraticCurveTo(-3,-5-stage,0,-3.4);c.quadraticCurveTo(3,-5-stage,6+stage*1.5,-2);c.lineTo(3,-1);c.lineTo(-3,-1);c.closePath();waFS(gold);
  waGem(0,-2.6,1.3+stage*.2,['#c83a3a','#e85a3a','#ff8a3a'][stage]);
  const tip=-3-L;c.beginPath();c.moveTo(-W/2,-3.4);c.lineTo(-W/2-(stage?1:0),tip*.55);c.lineTo(-W/2+.2,tip+W*1.2);c.lineTo(0,tip);c.lineTo(W/2-.2,tip+W*1.2);c.lineTo(W/2+(stage?1:0),tip*.55);c.lineTo(W/2,-3.4);c.closePath();waFS(blade);
  // a red-gold fuller like a vein: it shines with how hurt you are
  c.strokeStyle=`rgba(${200+55*hurt},${70+60*hurt},40,${.55+.45*hurt})`;c.lineWidth=1.1+stage*.2;c.beginPath();c.moveTo(0,-4.5);c.lineTo(0,tip+W*1.8);c.stroke();
  c.strokeStyle='rgba(255,255,255,.75)';c.lineWidth=.7;c.beginPath();c.moveTo(-W/2+.7,-4.5);c.lineTo(-W/2+.7,tip+W*1.4);c.stroke();
  if(stage>=1){c.fillStyle=gold;for(const y of [tip*.35,tip*.6]){c.beginPath();c.moveTo(-W/2-.6,y);c.lineTo(-W/2-2.4,y-1.5);c.lineTo(-W/2-.6,y-3);c.closePath();c.fill();c.beginPath();c.moveTo(W/2+.6,y);c.lineTo(W/2+2.4,y-1.5);c.lineTo(W/2+.6,y-3);c.closePath();c.fill();}}
  if(stage>=2){const t=typeof now==='number'?now:0;waGlow(0,tip*.5,W*3+2*Math.sin(t*3),'#ffb04a',.35+.4*hurt);}
  else if(hurt>.3)waGlow(0,tip*.5,W*2.6,'#ff7a3a',hurt*.5);}
if(typeof WA!=='undefined'){WA.oathblade1=()=>waOath(0);WA.oathblade2=()=>waOath(1);WA.oathblade3=()=>waOath(2);}
// the bag picture uses the same drawing, laid diagonally
{const _dii=drawItemIcon;drawItemIcon=function(g,id){const it=ITEMS[id];if(!it||!it.sigw||typeof WA==='undefined'||!WA[id])return _dii.apply(this,arguments); // bows keep the usual bow picture, in their own colours
  const main=ctx;g.save();g.translate(7,27);g.rotate(Math.PI/4);g.scale(1.08,1.08);ctx=g;try{WA[id]();}finally{ctx=main;g.restore();}};}
if(typeof TH!=='undefined'){for(const [k,v] of [['Oathbound Blade','ดาบแห่งคำสัตย์'],['Sworn Oathblade','ดาบปฏิญาณ'],['Oathkeeper','ผู้รักษาคำสัตย์'],['final form','ร่างสุดท้าย'],['Forge','ตีขึ้น'],['Re-forge','ตีใหม่'],
  ['Warden signature weapon','อาวุธประจำสายวอร์เดน'],['Brannoc the Smith in Hearthvale forges this stage.','ขั้นนี้แบรนน็อคในฮาร์ธเวลเป็นผู้ตี'],['Smith Garrow at the Forge Royal in Aurelmark forges this stage.','ขั้นนี้ช่างแกร์โรว์ที่โรงตีหลวงในออเรลมาร์กเป็นผู้ตี'],
  [' Keeps its refine, sigils and awakened line.',' คงระดับตีบวก ซิกิล และพลังที่ปลุกไว้']])if(!TH[k])TH[k]=v;
  if(typeof TH_PAT!=='undefined')TH_PAT.unshift(
    [/^The lower your HP, the harder you hit: up to \+(\d+)% damage when nearly fallen\.( Keeps its refine, sigils and awakened line\.)?$/,(m,a,b)=>`ยิ่ง HP น้อย ยิ่งตีแรง: ความเสียหายสูงสุด +${a}% เมื่อใกล้ล้ม${b?' คงระดับตีบวก ซิกิล และพลังที่ปลุกไว้':''}`],
    [/^· stage (\d)\/3 · ATK (\d+) · (\d) slots?$/,'· ขั้น $1/3 · ATK $2 · $3 ช่อง'],
    [/^Needs (.+)\.$/,(m,a)=>'ต้องมี '+a.replace('your advanced calling','อาชีพขั้นสอง').replace('your master calling','อาชีพขั้นสาม').replace(/base level (\d+)/,'เลเวลฐาน $1')+''],
    [/^Warden signature weapon, stage (\d) of 3\. (.+)$/,(m,n,b)=>`อาวุธประจำสายวอร์เดน ขั้น ${n} จาก 3 ${thText(b)}`]);}
// the Royal Stock's weapons get their own look too: white-gold steel, royal blue and gold
if(typeof WA!=='undefined'){Object.assign(WA,{
  aurelblade:()=>waSword({w:4.6,len:25,guard:7,blade:'#f4f0e0',gcol:'#e8c25a',gem:'#2a6ad0',grip:'#2a4a8a',wrap:'#e8c25a',pom:'#e8c25a',glow:'#ffe8a0'}),
  aurelaxe:()=>waAxe({double:true,head:'#f0e0a0',haft:'#2a4a8a',len:26}),
  aureldagger:()=>waSword({w:3,len:16,guard:4.5,blade:'#f4f0e0',gcol:'#e8c25a',gem:'#c8283a',grip:'#2a4a8a',wrap:'#e8c25a',pom:'#e8c25a'}),
  aurelmace:()=>waMace({head:'#e8c25a',flange:'#f4e090',gem:'#2a6ad0',glow:'#ffe8a0'}),
  aurelstaff:()=>waWand({len:23,shaft:'#f0e8d0',spiral:'rgba(200,160,60,.5)',band:'#2a4a8a',prong:'#e8c25a',crystal:'#9ad0ff',glow:'#cfe8ff',star:true})});
  if(typeof WA_BOW!=='undefined')WA_BOW.aurelbow={wood:'#e8d8a0',grip:'#2a4a8a',scale:1.1,tip:'#e8c25a',feather:'#ffffff'};}
/* ---- the Starweave line: a dark shaft with a silver spiral, a crescent cradling a star crystal; small stars circle the
   head, one for each spell cast toward the next free one; it flares when the next spell is the free one ---- */
function waStarweave(stage){const c=ctx,t=typeof now==='number'?now:0,L=[20,23,26][stage],ch=starCharge(),gold='#e8c25a',silver='#d8e0f0';
  const top=-L;c.beginPath();c.roundRect(-1.4,top+4,2.8,L+3,1.2);waFS('#2a2448');
  c.strokeStyle=silver;c.lineWidth=.8;c.globalAlpha=.8;for(let y=top+6;y<4;y+=3){c.beginPath();c.moveTo(-1.4,y+1.2);c.lineTo(1.4,y-.4);c.stroke();}c.globalAlpha=1;
  c.beginPath();c.arc(0,5.4,1.8,0,7);waFS(gold);
  // the crescent cradle
  c.beginPath();c.arc(0,top,5+stage,Math.PI*.15,Math.PI*.85,false);c.arc(0,top-1.6,3.6+stage,Math.PI*.85,Math.PI*.15,true);c.closePath();waFS(stage>=2?gold:silver);
  if(stage>=1){for(const s of [-1,1]){c.beginPath();c.moveTo(s*(5+stage),top+1.5);c.quadraticCurveTo(s*(8+stage),top-4,s*(6+stage),top-8);c.lineTo(s*(5+stage),top-5);c.closePath();waFS(silver);}}
  // the star crystal (it turns slowly)
  const ready=ch&&ch.n===ch.every-1,R=3.4+stage*.8;c.save();c.translate(0,top-3);c.rotate(t*.6);
  c.beginPath();for(let k=0;k<8;k++){const a=k*Math.PI/4,r=k%2?R*.42:R;c.lineTo(Math.cos(a)*r,Math.sin(a)*r);}c.closePath();waFS(['#cfe0ff','#d8c8ff','#fff6d8'][stage],.8);c.restore();
  waGlow(0,top-3,6+stage*2+(ready?3+Math.sin(t*8)*1.5:0),ready?'#e0c8ff':'#a8c0ff',ready?.85:.45);
  // the charge stars circling the head
  if(ch){for(let k=0;k<ch.n;k++){const a=t*1.5+k*Math.PI*2/Math.max(1,ch.every-1);c.fillStyle='#fff6c8';c.beginPath();c.arc(Math.cos(a)*(7+stage),top-3+Math.sin(a)*3,.9,0,7);c.fill();}}
  if(stage>=2)waGlow(0,top-3,12,'#c8a0ff',.25+.1*Math.sin(t*2));}
if(typeof WA!=='undefined'){WA.starweave1=()=>waStarweave(0);WA.starweave2=()=>waStarweave(1);WA.starweave3=()=>waStarweave(2);}
if(typeof TH!=='undefined'){for(const [k,v] of [['Starweave Staff','ไม้เท้าถักดาว'],['Nightweave Staff','ไม้เท้าถักราตรี'],['Astral Loom','กี่ทอดารา'],['Arcanist signature weapon','อาวุธประจำสายอาร์คานิสต์']])if(!TH[k])TH[k]=v;
  if(typeof TH_PAT!=='undefined')TH_PAT.unshift([/^Every (\d)(?:st|nd|rd|th) spell costs no SP and casts (\d+)% faster\.( Keeps its refine, sigils and awakened line\.)?$/,(m,n,f,k)=>`ทุกคาถาที่ ${n} ไม่ใช้ SP และร่ายเร็วขึ้น ${f}%${k?' คงระดับตีบวก ซิกิล และพลังที่ปลุกไว้':''}`]);}
// the Windstring line's look: pale green-silver limbs that grow longer and brighter, white and gold tips
if(typeof WA_BOW!=='undefined')Object.assign(WA_BOW,{windstring1:{wood:'#7ab08a',grip:'#3a5a3a',scale:1.05,tip:'#e8f0ff',feather:'#b8f0d0'},
  windstring2:{wood:'#a8d8c0',grip:'#2a4a3a',scale:1.12,tip:'#e8c25a',feather:'#e8fff0',ribbon:'#9fe8c8'},windstring3:{wood:'#e8f8f0',grip:'#2a4a8a',scale:1.2,tip:'#e8c25a',feather:'#ffffff',ribbon:'#e8c25a',thick:true}});
for(const [id,col] of [['windstring1','#7ab08a'],['windstring2','#a8d8c0'],['windstring3','#e8f8f0']])if(ITEMS[id])ITEMS[id].col=col;
if(typeof TH!=='undefined'){for(const [k,v] of [['Windstring Bow','ธนูสายลม'],['Galestring Bow','ธนูสายพายุ'],['Skyreaver','ผู้ฉีกฟ้า'],['Ranger signature weapon','อาวุธประจำสายเรนเจอร์'],['Double shot!','ยิงคู่!'],['Triple shot!','ยิงสาม!']])if(!TH[k])TH[k]=v;
  if(typeof TH_PAT!=='undefined')TH_PAT.unshift([/^(\d+)% of your shots loose (a second arrow|two more arrows) at other monsters nearby \((\d+)% damage\)\.( Keeps its refine, sigils and awakened line\.)?$/,(m,c,a,d,k)=>`${c}% ของการยิงจะปล่อย${a==='a second arrow'?'ลูกธนูอีกดอก':'ลูกธนูอีกสองดอก'}ใส่มอนสเตอร์อื่นใกล้ ๆ (ความเสียหาย ${d}%)${k?' คงระดับตีบวก ซิกิล และพลังที่ปลุกไว้':''}`]);}
// the Windstring bows' bag pictures use their own bow drawing
{const _dib=drawItemIcon;drawItemIcon=function(g,id){if(!(ITEMS[id]&&ITEMS[id].sigw&&typeof WA_BOW!=='undefined'&&WA_BOW[id]))return _dib.apply(this,arguments);
  const main=ctx;g.save();g.translate(12,17);g.rotate(-Math.PI/4);g.scale(1.05,1.05);ctx=g;try{drawWeaponShape(ITEMS[id],0);}finally{ctx=main;g.restore();}};}
/* ---- the Dawnbell line: a mace whose head is a golden bell (it swings), sun rays at stage 2, a halo and wings at stage 3 ---- */
function waDawnbell(stage){const c=ctx,t=typeof now==='number'?now:0,L=[16,18,20][stage],gold='#e8c25a',top=-L;
  c.beginPath();c.roundRect(-1.4,top+4,2.8,L+3,1.2);waFS('#f4efe2');c.strokeStyle=gold;c.lineWidth=.8;for(let y=top+7;y<4;y+=4){c.beginPath();c.moveTo(-1.4,y);c.lineTo(1.4,y);c.stroke();}
  c.beginPath();c.arc(0,5.4,1.8,0,7);waFS(gold);
  if(stage>=1){c.strokeStyle='#fff3c0';c.lineWidth=1.1;for(let k=0;k<8;k++){const a=k*Math.PI/4+t*.3;c.beginPath();c.moveTo(Math.cos(a)*5,top-1+Math.sin(a)*5);c.lineTo(Math.cos(a)*(8.5+stage),top-1+Math.sin(a)*(8.5+stage));c.stroke();}}
  if(stage>=2){c.save();c.strokeStyle='#fff3c0';c.lineWidth=1.2;c.beginPath();c.ellipse(0,top-9,5,1.8,0,0,7);c.stroke();c.restore();
    for(const sgn of [-1,1]){c.beginPath();c.moveTo(sgn*3,top+2);c.quadraticCurveTo(sgn*13,top+2,sgn*14,top-10);c.quadraticCurveTo(sgn*10,top-5,sgn*8,top-6);c.quadraticCurveTo(sgn*7,top-2,sgn*3,top-2);c.closePath();waFS('#fffaf0',.7);}}
  // the bell, swinging a little, and its clapper
  c.save();c.translate(0,top-3);c.rotate(Math.sin(t*2.5)*.18);const R=3.6+stage*.7;
  c.beginPath();c.moveTo(-R*.6,-R);c.quadraticCurveTo(-R*.7,R*.2,-R*1.2,R*1.2);c.lineTo(R*1.2,R*1.2);c.quadraticCurveTo(R*.7,R*.2,R*.6,-R);c.closePath();waFS(gold);
  c.fillStyle='rgba(255,255,255,.45)';c.beginPath();c.ellipse(-R*.3,-R*.2,R*.2,R*.6,0,0,7);c.fill();c.beginPath();c.arc(0,R*1.35,R*.35,0,7);waFS('#a8783a',.7);c.restore();
  waGlow(0,top-2,6+stage*2,'#fff0a0',.35+stage*.1);}
if(typeof WA!=='undefined'){WA.dawnbell1=()=>waDawnbell(0);WA.dawnbell2=()=>waDawnbell(1);WA.dawnbell3=()=>waDawnbell(2);}
if(typeof TH!=='undefined'){for(const [k,v] of [['Dawnbell Mace','กระบองระฆังอรุณ'],['Sunpeal Mace','กระบองเสียงตะวัน'],['Dawnchime','ระฆังรุ่งอรุณ'],['Cleric signature weapon','อาวุธประจำสายเคลอริก']])if(!TH[k])TH[k]=v;
  if(typeof TH_PAT!=='undefined')TH_PAT.unshift([/^Your hits heal you for (\d+)% of your max HP(, and party members nearby too)? \(at most every 0\.6 s\)\.( Keeps its refine, sigils and awakened line\.)?$/,(m,h,p,k)=>`การโจมตีฟื้นฟู HP ให้คุณ ${h}% ของ HP สูงสุด${p?' และเพื่อนในปาร์ตี้ที่อยู่ใกล้ ๆ ด้วย':''} (สูงสุดทุก 0.6 วินาที)${k?' คงระดับตีบวก ซิกิล และพลังที่ปลุกไว้':''}`]);}
/* ---- the Veilfang line: a curved dark dagger with a green venom edge and a drip; serrated at stage 2; a black blade with an
   eclipse disc on the guard and a violet glow at stage 3 ---- */
function waVeilfang(stage){const c=ctx,t=typeof now==='number'?now:0,L=[15,17,19][stage],tip=-3-L,blade=['#4a4060','#3a2a4a','#1a1424'][stage];
  waGrip(5,-1,2.4,'#2a1a2a','#9be35a','#5a4e78');
  c.beginPath();c.moveTo(-4-stage,-1.6);c.quadraticCurveTo(0,-4.4,4+stage,-1.6);c.lineTo(3,-.6);c.lineTo(-3,-.6);c.closePath();waFS(stage>=2?'#2a2438':'#8a84a0');
  if(stage>=2){c.beginPath();c.arc(0,-2.6,2.4,0,7);waFS('#1a1424');c.strokeStyle='#e8c25a';c.lineWidth=.8;c.beginPath();c.arc(0,-2.6,2.4,-.8,2.4);c.stroke();}
  c.beginPath();c.moveTo(-1.8,-3.2);c.quadraticCurveTo(-3.4,tip*.5,2.6,tip);
  if(stage>=1){const n=4;let y0=-3.2;for(let i=0;i<n;i++){const y=y0+(tip+2-y0)*(i+1)/n;c.lineTo(2.4+(i%2?1.2:0),y);}}
  c.quadraticCurveTo(2.6,tip*.45,1.8,-3.2);c.closePath();waFS(blade);
  c.strokeStyle='#9be35a';c.lineWidth=.9;c.beginPath();c.moveTo(-1.6,-4);c.quadraticCurveTo(-3,tip*.5,2.4,tip+.5);c.stroke();
  const ph=(t*.8)%1;c.fillStyle='#9be35a';c.globalAlpha=1-ph;c.beginPath();c.ellipse(-2.4,tip*.4+ph*6,.9,1.3,0,0,7);c.fill();c.globalAlpha=1;
  if(stage>=2)waGlow(0,tip*.5,9,'#a070e0',.4+.1*Math.sin(t*3));else if(stage===1)waGlow(0,tip*.5,6,'#9be35a',.25);}
if(typeof WA!=='undefined'){WA.veilfang1=()=>waVeilfang(0);WA.veilfang2=()=>waVeilfang(1);WA.veilfang3=()=>waVeilfang(2);}
if(typeof TH!=='undefined'){for(const [k,v] of [['Veilfang','เขี้ยวม่าน'],['Duskfang','เขี้ยวสนธยา'],['Eclipse Fang','เขี้ยวสุริยคราส'],['Shade signature weapon','อาวุธประจำสายเชด'],['Poisoned','ติดพิษ']])if(!TH[k])TH[k]=v;
  if(typeof TH_PAT!=='undefined')TH_PAT.unshift([/^(\d+)% of your hits poison \((\d+)% ATK every second for 4 s\), and poisoned monsters take (\d+)% more damage from you\.( Keeps its refine, sigils and awakened line\.)?$/,(m,c,p,v,k)=>`การโจมตี ${c}% จะทำให้ติดพิษ (${p}% ATK ทุกวินาที 4 วินาที) และมอนสเตอร์ที่ติดพิษได้รับความเสียหายจากคุณเพิ่ม ${v}%${k?' คงระดับตีบวก ซิกิล และพลังที่ปลุกไว้':''}`]);}
