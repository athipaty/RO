"use strict";
/* ================= endgame crafting with Gemcutter Sela (Aurelmark): Awakening and Sigil Fusion =================
   Awaken: any piece of gear can be awakened with Glintstone, monster materials and gold. It rolls one random build line
     (Faint, Bright or rarely Radiant) that you can keep or throw back, then try again to chase the perfect piece.
   Fuse:   three spare sigils become one new sigil near their level, sometimes a Radiant sigil (half again as strong,
     only made here). Stored on the gear itself as e.aw = {k, v, q}; summed in computeStats (js/world.js). */
const AW_POOL={
  weapon:[['atkpct',3,8],['matkpct',3,8],['aspd',3,8],['critdmg',6,16],['dbl',2,6],['crit',2,6],['cast',3,8]],
  armor:[['dmgred',2,5],['hppct',3,8],['healpct',4,10],['sppct',3,8],['def',4,12],['vit',1,4]],
  other:[['aspd',2,5],['critdmg',4,10],['cast',2,6],['crit',1,4],['dmgred',1,3],['healpct',3,8],['str',1,3],['agi',1,3],['int',1,3],['dex',1,3],['luk',1,3],['vit',1,3]]};
const AW_Q=[{name:'Faint',col:'#a8b4c8'},{name:'Bright',col:'#8fd0ff'},{name:'Radiant',col:'#ffd76a'}];
// cost by the item's level: Glintstone (Brannoc sells it), a monster material, gold
const AW_COST=[{mats:{glintstone:1,pelt:3},gold:3000},{mats:{glintstone:2,carapace:3},gold:8000},{mats:{glintstone:3,core:2},gold:20000}];
const awTier=e=>{const lv=(ITEMS[e.id]&&ITEMS[e.id].lv)||1;return lv<20?0:lv<35?1:2;};
const awPool=e=>{const t=ITEMS[e.id].type;return AW_POOL[t==='weapon'?'weapon':t==='armor'?'armor':'other'];};
const statLabel=(k,v)=>(typeof bonusLabel==='function'&&bonusLabel(k,v))||`${k.toUpperCase().replace('MAXHP','Max HP').replace('MAXSP','Max SP')} +${v}`;
const awText=aw=>aw?`${AW_Q[aw.q||0].name}: ${statLabel(aw.k,aw.v)}`:'';
function awRoll(e){const pool=awPool(e),[k,lo,hi]=pool[Math.floor(Math.random()*pool.length)],r=Math.random(),q=r>=.95?2:r>=.65?1:0;
  const v=q===2?hi:Math.max(lo,Math.round(lo+(hi-lo)*(q?(.55+Math.random()*.4):Math.random()*.5)));return {k,v,q};}
const AWK={tab:'slots',pending:null,tray:[]};
function awCan(e){const c=AW_COST[awTier(e)];return P.gold>=c.gold&&Object.entries(c.mats).every(([id,n])=>((invFind(id)||{}).n||0)>=n);}
function awCostChips(e){const c=AW_COST[awTier(e)];return Object.entries(c.mats).map(([id,n])=>itemChip(id,n)).join('')+goldChip(c.gold);}
function awCostText(e){const c=AW_COST[awTier(e)];return Object.entries(c.mats).map(([id,n])=>`${n} ${ITEMS[id].name} (${(invFind(id)||{}).n||0})`).join(' + ')+` + ${fmt(c.gold)} gold`;}

/* ---- Radiant sigils: every sigil gets a stronger twin that only fusion makes ---- */
const radId=id=>id+'r';
for(const m of Object.values(MOBS)){const base=ITEMS[m.id+'_sig'];if(!m.sig||!base)continue;const b={};for(const k in base.b)b[k]=Math.max(base.b[k]+1,Math.round(base.b[k]*1.5));
  const txt=Object.entries(b).map(([k,v])=>statLabel(k,v)).join(', ');
  ITEMS[radId(m.id+'_sig')]={name:'Radiant '+base.name,type:'sigil',kind:base.kind,b,price:base.price*3,col:'#ffe27a',g:'✦',radiant:true,base:m.id+'_sig',txt,
    desc:`Socket into ${/^[aeiou]/.test(base.kind)?'an':'a'} ${base.kind}: ${txt}. Only made by sigil fusion.`};
  LEGENDARY.add(radId(m.id+'_sig'));}
for(const id in ITEMS)if(!ITEMS[id].id)ITEMS[id].id=id;
// radiant sigil pictures: the monster's sigil with a golden halo
{const _dii=drawItemIcon;drawItemIcon=function(g,id){const it=ITEMS[id];if(!it||!it.radiant)return _dii.apply(this,arguments);_dii.call(this,g,it.base);
  g.save();g.strokeStyle='#fff2a0';g.lineWidth=1.6;g.shadowColor='#ffd76a';g.shadowBlur=6;g.beginPath();g.arc(16,16,14,0,7);g.stroke();
  for(let i=0;i<8;i++){const a=i*Math.PI/4;g.beginPath();g.moveTo(16+Math.cos(a)*14,16+Math.sin(a)*14);g.lineTo(16+Math.cos(a)*16.5,16+Math.sin(a)*16.5);g.stroke();}g.restore();};}
const sigMob=id=>MOBS[(ITEMS[id]&&ITEMS[id].base||id).replace(/_sig$/,'')];
// fusion: three sigils -> one near their level; radiant odds 12% (+8% for each radiant you put in)
function fuseResult(ins){const lv=ins.reduce((a,id)=>a+((sigMob(id)||{}).lv||10),0)/ins.length;
  let pool=Object.values(MOBS).filter(m=>m.sig&&ITEMS[m.id+'_sig']&&m.lv>=lv-8&&m.lv<=lv+12);if(pool.length<3)pool=Object.values(MOBS).filter(m=>m.sig&&ITEMS[m.id+'_sig']);
  const m=pool[Math.floor(Math.random()*pool.length)],rad=Math.random()<.12+.08*ins.filter(id=>ITEMS[id].radiant).length;return rad?radId(m.id+'_sig'):m.id+'_sig';}
const FUSE_GOLD=2000;
const looseSigils=()=>P.inv.filter(e=>ITEMS[e.id]&&ITEMS[e.id].type==='sigil'&&e.n>0);
const trayCount=id=>AWK.tray.filter(x=>x===id).length;

/* ---- Sela's window: Slots (as before) · Awaken · Fuse sigils ---- */
{const _gem=PANELS.gemcut;PANELS.gemcut=function(){
  const tabs=`<div class="tabs itabs" role="tablist">`+[['slots','Sigil slots'],['awaken','Awaken'],['fuse','Fuse sigils']].map(([k,l])=>`<button class="btn small ${AWK.tab===k?'on':''}" role="tab" aria-selected="${AWK.tab===k}" data-act="gemtab" data-arg="${k}">${l}</button>`).join('')+`</div>`;
  if(AWK.tab==='slots'){const h=_gem.apply(this,arguments);const i=h.indexOf('</div>',h.indexOf('class="say"'));return i<0?tabs+h:h.slice(0,i+6)+tabs+h.slice(i+6);}
  let h=`<h2>Gemcutter Sela</h2>`;
  if(AWK.tab==='awaken'){
    h+=`<div class="say">"Every blade has a voice it hasn't used yet. Let me wake it. If you don't like what it says, I'll put it back to sleep and you keep the old one."</div>`+tabs;
    const pd=AWK.pending;
    if(pd){const found=gemList().find(x=>x.e.uid===pd.uid);if(!found){AWK.pending=null;return PANELS.gemcut();}
      h+=`<div class="awbox"><div class="nm">${esc(itemName(found.e))}</div><div class="awrow"><span class="muted">Now</span><b>${pd.old?esc(awText(pd.old)):'<span class="muted">nothing</span>'}</b></div>`+
        `<div class="awrow"><span class="muted">New</span><b style="color:${AW_Q[pd.roll.q].col}">${esc(awText(pd.roll))}</b></div>`+
        `<div class="tbtns"><button class="btn small" data-act="awkeep" data-arg="new">Keep the new one</button><button class="btn small ghost" data-act="awkeep" data-arg="old">Keep ${pd.old?'the old one':'it asleep'}</button></div></div>`;return h;}
    const list=gemList();if(!list.length)return h+`<div class="sub">You have no gear to awaken.</div>`;
    h+=`<div class="sub">${fmt(P.gold)} gold · lines: Faint, Bright, Radiant (rare, the top value)</div>`;
    for(const {e,where} of list){h+=`<div class="row">${icon({id:e.id})}<div class="grow"><div class="nm">${esc(itemName(e))}</div>`+
      `<div class="ds">${where} · ${e.aw?`<span style="color:${AW_Q[e.aw.q||0].col}">${esc(awText(e.aw))}</span>`:'not awakened'}</div><div class="cms">${awCostChips(e)}</div></div>`+
      `<button class="btn small" data-act="awaken" data-arg="${e.uid}" ${awCan(e)?'':'disabled'}>${e.aw?'Re-awaken':'Awaken'}</button></div>`;}
    return h;}
  // fuse
  h+=`<div class="say">"Three sigils into one. The stone decides what it becomes, but now and then it comes out Radiant, and nobody else in Embervale can make those."</div>`+tabs;
  const loose=looseSigils();
  h+=`<div class="fusetray">`+[0,1,2].map(i=>{const id=AWK.tray[i];return id?`<button class="fuseslot full" data-act="fuseout" data-arg="${i}" title="${esc(ITEMS[id].name)}">${icon({id})}<span>${esc(ITEMS[id].name.replace(' Sigil',''))}</span></button>`:`<div class="fuseslot"><span class="muted">empty</span></div>`;}).join('')+`</div>`;
  h+=`<div class="tbtns"><button class="btn small" data-act="fusego" ${AWK.tray.length===3&&P.gold>=FUSE_GOLD?'':'disabled'}>Fuse (${fmt(FUSE_GOLD)} gold)</button></div>`;
  h+=`<div class="sub">Radiant chance 12%, +8% for each Radiant sigil you put in. The result is near the level of the three.</div>`;
  if(!loose.length)h+=`<p class="muted">No loose sigils in your bag. Monsters drop them now and then.</p>`;
  for(const e of loose){const it=ITEMS[e.id],left=e.n-trayCount(e.id);h+=`<div class="row">${icon({id:e.id})}<div class="grow"><div class="nm" style="color:${rarityCol(e.id)}">${esc(it.name)} <span class="muted">×${left}</span></div><div class="ds">${esc(it.txt||(sigMob(e.id)?sigMob(e.id).sig.txt:''))}</div></div>`+
    `<button class="btn small" data-act="fusein" data-arg="${e.id}" ${left>0&&AWK.tray.length<3?'':'disabled'}>Add</button></div>`;}
  return h;};}
PANEL_ACTS.gemtab=k=>{AWK.tab=k;AWK.pending=null;sfx('click');refreshPanel();};
PANEL_ACTS.awaken=uid=>{const found=gemList().find(x=>String(x.e.uid)===String(uid));if(!found)return;const e=found.e;if(!awCan(e)){refreshPanel();return;}
  const c=AW_COST[awTier(e)];for(const [id,n] of Object.entries(c.mats))takeItem(id,n);P.gold-=c.gold;
  const roll=awRoll(e);AWK.pending={uid:e.uid,old:e.aw||null,roll};sfx(roll.q===2?'rare':'jobup');
  fx.push({k:'ring',x:P.x,y:P.y,r:36,col:AW_Q[roll.q].col,t0:now,dur:.6});if(roll.q===2){fx.push({k:'critburst',x:P.x,y:P.y-30,t0:now,dur:.5});addLog(`A Radiant line! ${statLabel(roll.k,roll.v)}.`,'l-rare');}
  save();refreshPanel();};
PANEL_ACTS.awkeep=which=>{const pd=AWK.pending;if(!pd)return;const found=gemList().find(x=>x.e.uid===pd.uid);AWK.pending=null;
  if(found&&which==='new'){found.e.aw=pd.roll;addLog(`${ITEMS[found.e.id].name} awakens: ${awText(pd.roll)}.`,'l-good');}
  S=computeStats();save();refreshPanel();};
PANEL_ACTS.fusein=id=>{const e=invFind(id);if(!e||AWK.tray.length>=3||trayCount(id)>=e.n)return;AWK.tray.push(id);sfx('click');refreshPanel();};
PANEL_ACTS.fuseout=i=>{AWK.tray.splice(+i,1);sfx('click');refreshPanel();};
PANEL_ACTS.fusego=()=>{if(AWK.tray.length!==3||P.gold<FUSE_GOLD)return;const need={};for(const id of AWK.tray)need[id]=(need[id]||0)+1;
  if(!Object.entries(need).every(([id,n])=>((invFind(id)||{}).n||0)>=n)){AWK.tray=[];refreshPanel();return;}
  const out=fuseResult(AWK.tray);for(const [id,n] of Object.entries(need))takeItem(id,n);P.gold-=FUSE_GOLD;AWK.tray=[];giveItem(out,1);
  const rad=ITEMS[out].radiant;sfx(rad?'fanfare':'rare');fx.push({k:'ring',x:P.x,y:P.y,r:40,col:rad?'#ffd76a':'#c8b0ff',t0:now,dur:.7});if(rad)fx.push({k:'critburst',x:P.x,y:P.y-30,t0:now,dur:.5});
  addLog(`The sigils fuse into ${rad?'a RADIANT ':'a '}${ITEMS[out].name.replace('Radiant ','')}!`,rad?'l-rare':'l-good');save();refreshPanel();};

// show the awakened line wherever gear is described
{const _idA=itemDesc;itemDesc=function(e){const d=_idA.apply(this,arguments);return e&&e.aw?`${d} · ✧ ${awText(e.aw)}`:d;};}
