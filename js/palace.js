"use strict";
/* ================= the Royal Palace of Aurelmark (v1.37.0) =================
   At the north end of the capital's avenue. Herald Cassian at the gate speaks for the Crown:
     Royal Decrees   three hard tasks a week (Thailand time, weeks start on Monday), picked for your level:
                     a great hunt, a boss to bring down, and a tribute of rare materials. Each one done pays EXP,
                     gold and a Royal Seal; all three in one week pays two more Seals.
     Treasury        Royal Seals buy what the shops never sell: a Radiant sigil near your level, Glintstone, Ember Ore.
     Hall of Heroes  the heroes in the realm right now, strongest first, and the guild that holds Emberkeep
                     (its colours also fly from the palace keep).
   Titles: Royal Agent (a first decree), Hand of the Crown (all three in a week), Champion of the Crown (four such
   weeks). Everything is kept in P.palace and saved with the hero; the server needs nothing new. */
const PAL={tab:'decree'};
const PAL_SHOP=[{id:'radiant',name:'Radiant sigil',desc:'A Radiant sigil from a monster near your level (half again as strong).',seals:6},
  {id:'glintstone',n:3,seals:2},{id:'emberore',n:3,seals:2}];
function palMake(week){const R=bSeed(week+'|crown|'+P.name),lv=P.lv,out=[];
  out.push({k:'any',minLv:Math.max(1,lv-5),n:lv>=40?220:lv>=20?180:140,have:0});
  const bosses=Object.values(MOBS).filter(m=>m.boss&&!m.world&&bMobZone(m.id)).map(m=>({m,d:Math.abs(m.lv-lv)})).sort((a,b)=>a.d-b.d).slice(0,3).map(x=>x.m);
  const b=bosses.length?bosses[Math.floor(R()*bosses.length)]:null;
  if(b)out.push({k:'boss',mob:b.id,n:2,have:0});else out.push({k:'any',minLv:Math.max(1,lv),n:60,have:0});
  // a tribute: a material that drops rarely from monsters near your level
  const near=Object.values(MOBS).filter(m=>!m.boss&&!m.world&&bMobZone(m.id)&&Math.abs(m.lv-lv)<=8);
  const rare=[];for(const m of near)for(const [id,ch] of m.drops||[])if(ITEMS[id]&&ITEMS[id].type==='etc'&&ch<.3&&ch>=.03)rare.push({id,m:m.id});
  const t=rare.length?rare[Math.floor(R()*rare.length)]:null;
  if(t)out.push({k:'bring',item:t.id,mob:t.m,n:lv>=30?6:5,have:0});else out.push({k:'any',minLv:Math.max(1,lv-2),n:100,have:0});
  return out;}
function palState(){if(!P)return null;let s=P.palace;const week=THWEEK();
  if(!s||typeof s!=='object')s=P.palace={};s.seals=Math.max(0,Math.floor(fin(s.seals)));s.full=Math.max(0,Math.floor(fin(s.full)));s.done=Math.max(0,Math.floor(fin(s.done)));
  if(s.week!==week||!Array.isArray(s.d)){s.week=week;s.d=palMake(week);s.bonus=0;}
  return s;}
const palHave=x=>x.k==='bring'?Math.min(x.n,(invFind(x.item)||{}).n||0):Math.min(x.n,x.have);
const palDone=x=>palHave(x)>=x.n;
function palTitle(x){if(x.k==='any')return `The Great Hunt: defeat ${x.n} monsters of Lv ${x.minLv} or higher`;
  if(x.k==='boss')return `Bring down ${MOBS[x.mob].name} ${x.n} times`;return `Tribute: bring ${x.n} ${ITEMS[x.item].name}`;}
function palReward(x){const lv=P.lv;return {exp:Math.round(expNeed(lv)*(x.k==='any'?.5:.4)),jexp:Math.round(jexpNeed(Math.max(1,P.jl))*.4),gold:lv*(x.k==='boss'?400:300),seals:1};}
// kills count by themselves
{const _km=killMob;killMob=function(m){const mine=m&&!m.dead&&(m.myDmg||0)>0;const r=_km.apply(this,arguments);
  try{if(mine&&P){const s=palState();for(const x of s.d){if(x.claimed||x.k==='bring'||palDone(x))continue;
      if(x.k==='boss'&&x.mob===m.d.id)x.have++;else if(x.k==='any'&&m.d.lv>=x.minLv)x.have++;else continue;
      if(palDone(x)){addLog(`Royal decree fulfilled: ${palTitle(x)}. Report to Herald Cassian at the palace.`,'l-rare');floatT(P.x,P.y-56,'Decree done!','#ffd76a',15);sfx('rare');}}}}catch(e){}return r;};}
const palSealChip=n=>`<span class="palseal" title="Royal Seal">⚜ ${n}</span>`;
function palHeroes(){const me={n:P.name,lv:P.lv,cls:P.cls,rb:P.reborn?1:0,g:typeof GD!=='undefined'&&GD.g?GD.g.name:'',me:1};
  const list=[me];try{for(const o of NET.others.values())if(o&&o.n&&!o.guest)list.push({n:o.n,lv:o.lv||1,cls:o.cls,rb:o.rb,g:o.guild&&o.guild.n||''});}catch(e){}
  return list.sort((a,b)=>(b.rb||0)-(a.rb||0)||b.lv-a.lv).slice(0,20);}
PANELS.palace=()=>{const s=palState();
  let h=`<h2>The Royal Palace</h2><div class="say">"Hear the will of the Crown! Aurelmark asks much of its heroes, and rewards them as no merchant can." — Herald Cassian</div>`;
  h+=`<div class="tabs" role="tablist">`+[['decree','Royal Decrees'],['treasury','Treasury'],['heroes','Hall of Heroes']].map(([k,l])=>`<button class="btn small ${PAL.tab===k?'on':''}" role="tab" aria-selected="${PAL.tab===k}" data-act="paltab" data-arg="${k}">${l}</button>`).join('')+`</div>`;
  h+=`<div class="sub">${palSealChip(s.seals)} Royal Seals · weeks with every decree done: ${s.full}</div>`;
  if(PAL.tab==='decree'){
    h+=`<div class="sub">This week's decrees. New ones every Monday (Thailand time). Each pays a Royal Seal; all three pay two more.</div><div class="pallist">`;
    s.d.forEach((x,i)=>{const r=palReward(x),hv=palHave(x),pic=x.k==='bring'?(typeof itemIconURL==='function'?itemIconURL(x.item):''):(x.mob&&typeof mobPicURL==='function'?mobPicURL(x.mob):'');
      h+=`<div class="palcard${x.claimed?' claimed':palDone(x)?' ready':''}">${pic?`<img src="${pic}" alt="">`:`<div class="palico">⚔</div>`}<div class="grow"><div class="nm">${esc(palTitle(x))}</div>`+
        `<div class="abar" role="progressbar" aria-valuemin="0" aria-valuemax="${x.n}" aria-valuenow="${hv}"><i style="width:${hv/x.n*100}%"></i></div>`+
        `<div class="ds">${fmt(hv)} / ${fmt(x.n)} · ${fmt(r.exp)} EXP · ${fmt(r.gold)} gold · ${palSealChip(1)}${x.k==='boss'&&MOBS[x.mob]?` · found in ${esc((ZONES[bMobZone(x.mob)]||{}).name||'')}`:''}</div></div>`+
        (x.claimed?`<span class="pill">done</span>`:`<button class="btn small" data-act="palclaim" data-arg="${i}" ${palDone(x)?'':'disabled'}>Report</button>`)+`</div>`;});
    const all=s.d.every(x=>x.claimed);
    h+=`</div><div class="tbtns"><button class="btn" data-act="palbonus" ${all&&!s.bonus?'':'disabled'}>${s.bonus?'The Crown has rewarded you this week':`All three done: claim ${palSealChip(2)} more`}</button></div>`;}
  else if(PAL.tab==='treasury'){
    h+=`<div class="sub">The Crown's treasury trades only for Royal Seals.</div>`;
    for(const it of PAL_SHOP){const ok=s.seals>=it.seals;
      const nm=it.id==='radiant'?it.name:`${ITEMS[it.id].name} ×${it.n}`,ds=it.id==='radiant'?it.desc:(ITEMS[it.id].desc||'');
      h+=`<div class="row">${it.id==='radiant'?`<div class="palico">✦</div>`:icon({id:it.id})}<div class="grow"><div class="nm">${esc(nm)}</div><div class="ds">${esc(ds)}</div></div>${palSealChip(it.seals)}<button class="btn small" data-act="palbuy" data-arg="${it.id}" ${ok?'':'disabled'}>Buy</button></div>`;}}
  else{const own=typeof GW!=='undefined'?GW.owner:null;
    h+=`<div class="palkeep">${own?`<b>${esc(own.name)}</b> holds Emberkeep: their colours fly from the palace keep.`:'Nobody holds Emberkeep. The palace keep flies the Crown\'s own colours.'}</div>`;
    h+=`<div class="sub">The heroes in the realm right now, strongest first.</div><div class="pallist">`;
    palHeroes().forEach((p,i)=>{h+=`<div class="row palhero${p.me?' me':''}"><span class="palrank">${i+1}</span><div class="grow"><div class="nm">${p.rb?'✦ ':''}${esc(p.n)}${p.me?' <span class="muted">(you)</span>':''}</div>`+
      `<div class="ds">Lv ${p.lv} · ${esc((CLASSES[p.cls]||{}).name||'')}${p.g?' · '+esc(p.g):''}</div></div></div>`;});
    h+=`</div>`;}
  return h;};
PANEL_ACTS.paltab=k=>{PAL.tab=k;sfx('click');refreshPanel();panel.scrollTop=0;};
PANEL_ACTS.palclaim=i=>{const s=palState(),x=s.d[+i];if(!x||x.claimed||!palDone(x))return;if(x.k==='bring'&&!takeItem(x.item,x.n))return;
  const r=palReward(x);x.claimed=1;s.seals+=r.seals;s.done++;P.gold+=r.gold;sfx('fanfare');
  fx.push({k:'lvl',x:P.x,y:P.y-30,t0:now,dur:1.6,txt:'DECREE FULFILLED',col:'#ffd76a'});addLog(`The Crown thanks you: ${fmt(r.exp)} EXP, ${fmt(r.gold)} gold and a Royal Seal.`,'l-rare');
  gainExp(r.exp,r.jexp);if(typeof achCheck==='function')achCheck();refreshPanel();save();};
PANEL_ACTS.palbonus=()=>{const s=palState();if(s.bonus||!s.d.every(x=>x.claimed))return;s.bonus=1;s.seals+=2;s.full++;sfx('fanfare');
  fx.push({k:'critburst',x:P.x,y:P.y-30,t0:now,dur:.5});addLog('Every decree of the week is done! The Crown grants you two more Royal Seals.','l-rare');if(typeof achCheck==='function')achCheck();refreshPanel();save();};
PANEL_ACTS.palbuy=id=>{const s=palState(),it=PAL_SHOP.find(x=>x.id===id);if(!it||s.seals<it.seals)return;
  if(id==='radiant'){const pool=Object.values(MOBS).filter(m=>m.sig&&!m.world&&ITEMS[radId(m.id+'_sig')]).map(m=>({m,d:Math.abs(m.lv-P.lv)})).sort((a,b)=>a.d-b.d).slice(0,8);
    if(!pool.length)return;const m=pool[Math.floor(Math.random()*pool.length)].m,out=radId(m.id+'_sig');s.seals-=it.seals;giveItem(out,1);addLog(`The treasurer hands you a ${ITEMS[out].name}!`,'l-rare');sfx('rare');}
  else{s.seals-=it.seals;giveItem(id,it.n);addLog(`From the treasury: ${ITEMS[id].name} ×${it.n}.`,'l-good');sfx('coin');}
  refreshPanel();save();};
// titles from the Crown
{const add=a=>{ACH.push(a);ACH_BY[a[0]]=a;};
  add(['crown1','Royal Agent','Fulfil a royal decree','Royal Agent',1,()=>P.palace?fin(P.palace.done):0,1000]);
  add(['crown2','Hand of the Crown','Fulfil every decree of a week','Hand of the Crown',1,()=>P.palace?fin(P.palace.full):0,5000]);
  add(['crown3','Champion of the Crown','Fulfil every decree in four weeks','Champion of the Crown',4,()=>P.palace?fin(P.palace.full):0,20000]);}
if(typeof TH!=='undefined')for(const [k,v] of [['The Royal Palace','พระราชวังหลวง'],['Royal Decrees','พระราชโองการ'],['Treasury','คลังหลวง'],['Hall of Heroes','หอวีรชน'],
  ['Report','รายงาน'],['done','เสร็จแล้ว'],['Buy','ซื้อ'],['Radiant sigil','ซิกิลเรเดียนต์'],['The Crown\'s treasury trades only for Royal Seals.','คลังหลวงแลกได้ด้วยตราประทับหลวงเท่านั้น'],
  ['The heroes in the realm right now, strongest first.','วีรชนที่อยู่ในอาณาจักรตอนนี้ เรียงจากเก่งที่สุด'],['The Crown has rewarded you this week','สัปดาห์นี้รับรางวัลจากราชสำนักแล้ว'],
  ['A Radiant sigil from a monster near your level (half again as strong).','ซิกิลเรเดียนต์จากมอนสเตอร์ใกล้เลเวลคุณ (แรงขึ้นอีกครึ่งหนึ่ง)'],
  ['"Hear the will of the Crown! Aurelmark asks much of its heroes, and rewards them as no merchant can." — Herald Cassian','"จงฟังพระประสงค์แห่งราชบัลลังก์! ออเรลมาร์กเรียกร้องมากจากวีรชน และตอบแทนอย่างที่ไม่มีพ่อค้าใดให้ได้" — ผู้ประกาศแคสเซียน'],
  ['This week\'s decrees. New ones every Monday (Thailand time). Each pays a Royal Seal; all three pay two more.','พระราชโองการสัปดาห์นี้ เปลี่ยนใหม่ทุกวันจันทร์ (เวลาไทย) แต่ละข้อได้ตราประทับหลวง 1 อัน ครบทั้งสามได้เพิ่มอีก 2'],
  ['Herald Cassian','ผู้ประกาศแคสเซียน'],['Royal Palace','พระราชวังหลวง']])if(!TH[k])TH[k]=v;
// Thai for the palace window's sentences that carry numbers and names
if(typeof TH_PAT!=='undefined')TH_PAT.unshift(
  [/^Royal Seals · weeks with every decree done: (\d+)$/,'ตราประทับหลวง · สัปดาห์ที่ทำครบทุกพระราชโองการ: $1'],
  [/^The Great Hunt: defeat (\d+) monsters of Lv (\d+) or higher$/,'การล่าครั้งใหญ่: ปราบมอนสเตอร์เลเวล $2 ขึ้นไป $1 ตัว'],
  [/^Bring down (.+) (\d+) times$/,(m,a,n)=>`ปราบ ${typeof thText==='function'?thText(a):a} ${n} ครั้ง`],
  [/^Tribute: bring (\d+) (.+)$/,(m,n,a)=>`บรรณาการ: นำ ${typeof thText==='function'?thText(a):a} มา ${n} ชิ้น`],
  [/^· found in (.+)$/,(m,a)=>`· พบที่ ${typeof thText==='function'?thText(a):a}`],
  [/^All three done: claim$/,'ครบทั้งสามแล้ว: รับเพิ่ม'],[/^more$/,'อัน'],
  [/^Nobody holds Emberkeep\. The palace keep flies the Crown's own colours\.$/,'ยังไม่มีใครครองป้อมเอมเบอร์ หอคอยวังจึงชักธงของราชบัลลังก์'],
  [/^holds Emberkeep: their colours fly from the palace keep\.$/,'ครองป้อมเอมเบอร์อยู่ ธงของพวกเขาโบกสะบัดบนหอคอยวัง'],
  [/^\(you\)$/,'(คุณ)']);
if(typeof TH_PAT!=='undefined')TH_PAT.unshift([/^Lv (\d+) · ([A-Za-z' ]+)( · .+)?$/,(m,l,c,g)=>`Lv ${l} · ${typeof thText==='function'?thText(c):c}${g||''}`]);
