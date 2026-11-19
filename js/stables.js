"use strict";
/* ================= the Royal Stables & Kennels of Aurelmark (v1.37.2) =================
   Tobin in Hearthvale sells mounts and pets are tamed in the wild; Stablemaster Rowan in the capital trains them:
     Mount training   five levels per mount, each +4% riding speed on top of the mount's own (P.mountLv[k]).
                      Costs gold; each level asks a little more of the rider's own level.
     Companion bond   five bond levels for your pet (P.pet.bond): each one makes its bonus half again as big
                      (+2 AGI becomes +3, +4, +5, +6, +7). Costs gold and Pet Snacks, and the pet must be happy (50+).
   Saved with the hero; the server needs nothing new. */
const MOUNT_TRAIN={max:5,step:.04,gold:[.5,1,1.5,2.5,4],lv:5};
const BOND={max:5,step:.5,gold:[1500,3000,6000,12000,24000],snacks:n=>(n+1)*3};
const mountLv=k=>{const m=P&&P.mountLv&&typeof P.mountLv==='object'?P.mountLv:null;return m?Math.max(0,Math.min(MOUNT_TRAIN.max,Math.floor(fin(m[k])))):0;};
const petBond=()=>P&&P.pet&&typeof P.pet==='object'?Math.max(0,Math.min(BOND.max,Math.floor(fin(P.pet.bond)))):0;
const bondB=(b,n)=>Object.fromEntries(Object.entries(b).map(([k,v])=>[k,Math.round(v*(1+BOND.step*n))]));
const bondTxt=(b)=>Object.entries(b).map(([k,v])=>typeof bonusLabel==='function'&&bonusLabel(k,v)?bonusLabel(k,v):`+${v} ${k.toUpperCase()}`).join(', ');
// the trained speed (on top of the mount's own) and the stronger bond (the pet's bonus scaled while stats are worked out)
{const _cs=computeStats;computeStats=function(){
  const k=P&&P.pet&&typeof PETS!=='undefined'&&PETS[P.pet.k]?P.pet.k:null,n=k?petBond():0,orig=k?PETS[k].b:null;
  if(n)PETS[k].b=bondB(orig,n);
  let s;try{s=_cs.apply(this,arguments);}finally{if(n)PETS[k].b=orig;}
  if(typeof riding==='function'&&riding()){const M=MOUNTS[P.riding],l=mountLv(P.riding);if(l)s.speed=Math.round(s.speed*(1+M.speed+MOUNT_TRAIN.step*l)/(1+M.speed));}
  return s;};}
PANELS.stables=()=>{
  let h=`<h2>Royal Stables &amp; Kennels</h2><div class="say">"Tobin sells a fine beast, and the wilds give you a loyal friend. Here we make them great." — Stablemaster Rowan</div>`;
  h+=`<div class="sub">${fmt(P.gold)} gold</div><h3>Mount training</h3>`;
  const own=typeof owned==='function'?owned():[];
  if(!own.length)h+=`<p class="muted">You have no mount yet. Tobin at the Waystation in Hearthvale sells them.</p>`;
  for(const k of own){const M=MOUNTS[k],l=mountLv(k),max=l>=MOUNT_TRAIN.max,g=max?0:Math.round(M.price*MOUNT_TRAIN.gold[l]),need=M.lv+MOUNT_TRAIN.lv*(l+1),ok=!max&&P.gold>=g&&P.lv>=need;
    const pips=Array.from({length:MOUNT_TRAIN.max},(_,i)=>`<i class="pip${i<l?' full':''}"></i>`).join('');
    h+=`<div class="row stbrow"><img class="ico img" src="${typeof mountIconURL==='function'?mountIconURL(k):''}" alt="" width="30" height="30"><div class="grow"><div class="nm">${esc(M.name)} <span class="pips">${pips}</span></div>`+
      `<div class="ds">Speed +${Math.round((M.speed+MOUNT_TRAIN.step*l)*100)}%${max?' · fully trained':` → +${Math.round((M.speed+MOUNT_TRAIN.step*(l+1))*100)}% · ${fmt(g)} gold · needs Lv ${need}`}</div></div>`+
      (max?`<span class="pill">best</span>`:`<button class="btn small" data-act="stbmount" data-arg="${k}" ${ok?'':'disabled'}>Train</button>`)+`</div>`;}
  h+=`<h3>Companion bond</h3>`;
  const pet=P.pet&&typeof PETS!=='undefined'&&PETS[P.pet.k]?P.pet:null;
  if(!pet)h+=`<p class="muted">You have no companion. Use a Taming Charm (General Store) on a worn-down monster that can be tamed.</p>`;
  else{const n=petBond(),max=n>=BOND.max,base=PETS[pet.k].b,g=max?0:BOND.gold[n],sn=max?0:BOND.snacks(n),have=(invFind('petsnack')||{}).n||0,happy=(pet.happy||0)>=50;
    const ok=!max&&P.gold>=g&&have>=sn&&happy,pic=typeof mobPicURL==='function'?mobPicURL(pet.k):'';
    const pips=Array.from({length:BOND.max},(_,i)=>`<i class="pip${i<n?' full':''}"></i>`).join('');
    h+=`<div class="row stbrow">${pic?`<img class="stbpet" src="${pic}" alt="">`:''}<div class="grow"><div class="nm">${esc(typeof petName==='function'?petName(pet):MOBS[pet.k].name)} <span class="pips">${pips}</span></div>`+
      `<div class="ds">Bond ${n} · ${esc(bondTxt(bondB(base,n)))}${max?' · the strongest bond':` → ${esc(bondTxt(bondB(base,n+1)))}`}</div>`+
      (max?'':`<div class="cms">${typeof itemChip==='function'?itemChip('petsnack',sn):`${sn} Pet Snacks`}${typeof goldChip==='function'?goldChip(g):`${fmt(g)} gold`}</div>`)+
      (happy?'':`<div class="ds" style="color:var(--warn)">It needs to be happy (50+) to train. Feed it first.</div>`)+`</div>`+
      (max?`<span class="pill">best</span>`:`<button class="btn small" data-act="stbpet" ${ok?'':'disabled'}>Bond</button>`)+`</div>`;}
  return h;};
PANEL_ACTS.stbmount=k=>{const M=MOUNTS[k];if(!M||!owned().includes(k))return;const l=mountLv(k);if(l>=MOUNT_TRAIN.max)return;
  const g=Math.round(M.price*MOUNT_TRAIN.gold[l]),need=M.lv+MOUNT_TRAIN.lv*(l+1);if(P.gold<g||P.lv<need)return;
  P.gold-=g;if(!P.mountLv||typeof P.mountLv!=='object')P.mountLv={};P.mountLv[k]=l+1;S=computeStats();sfx('jobup');
  fx.push({k:'ring',x:P.x,y:P.y,r:36,col:'#ffe7a0',t0:now,dur:.5});addLog(`Rowan works your ${M.name} hard: riding speed +${Math.round((M.speed+MOUNT_TRAIN.step*(l+1))*100)}%.`,'l-good');save();refreshPanel();};
PANEL_ACTS.stbpet=()=>{const pet=P.pet;if(!pet||!PETS[pet.k])return;const n=petBond();if(n>=BOND.max)return;
  const g=BOND.gold[n],sn=BOND.snacks(n);if(P.gold<g||(pet.happy||0)<50||!takeItem('petsnack',sn))return;
  P.gold-=g;pet.bond=n+1;S=computeStats();sfx('rare');fx.push({k:'ring',x:P.x,y:P.y,r:40,col:'#ff9ac8',t0:now,dur:.6});
  addLog(`${typeof petName==='function'?petName(pet):'Your companion'} trusts you more than ever: bond ${n+1} (${bondTxt(bondB(PETS[pet.k].b,n+1))}).`,'l-rare');save();refreshPanel();};
if(typeof TH!=='undefined')for(const [k,v] of [['Royal Stables & Kennels','คอกม้าและคอกสัตว์หลวง'],['Mount training','ฝึกพาหนะ'],['Companion bond','สายสัมพันธ์สัตว์เลี้ยง'],['Train','ฝึก'],['Bond','ผูกพัน'],['best','สูงสุด'],
  ['Stablemaster Rowan','ผู้ดูแลคอกโรวัน'],['You have no mount yet. Tobin at the Waystation in Hearthvale sells them.','คุณยังไม่มีพาหนะ ซื้อได้จากโทบินที่สถานีเดินทางในฮาร์ธเวล'],
  ['You have no companion. Use a Taming Charm (General Store) on a worn-down monster that can be tamed.','คุณยังไม่มีสัตว์เลี้ยง ใช้เครื่องรางฝึกสัตว์ (ร้านค้าทั่วไป) กับมอนสเตอร์ที่อ่อนแรงและฝึกได้'],
  ['It needs to be happy (50+) to train. Feed it first.','ต้องมีความสุข 50 ขึ้นไปจึงจะฝึกได้ ให้อาหารก่อน'],
  ['"Tobin sells a fine beast, and the wilds give you a loyal friend. Here we make them great." — Stablemaster Rowan','"โทบินขายสัตว์ดี ๆ และป่าก็ให้เพื่อนที่ภักดีแก่คุณ ที่นี่เราทำให้พวกมันยิ่งใหญ่" — ผู้ดูแลคอกโรวัน']])if(!TH[k])TH[k]=v;
if(typeof TH_PAT!=='undefined')TH_PAT.unshift(
  [/^Speed \+(\d+)% · fully trained$/,'ความเร็ว +$1% · ฝึกครบแล้ว'],
  [/^Speed \+(\d+)% → \+(\d+)% · ([\d,]+) gold · needs Lv (\d+)$/,'ความเร็ว +$1% → +$2% · $3 โกลด์ · ต้องเลเวล $4'],
  [/^Bond (\d) · (.+?)( · the strongest bond| → (.+))$/,(m,n,a,t,b)=>`สายสัมพันธ์ ${n} · ${a}${b?` → ${b}`:' · สายสัมพันธ์สูงสุด'}`]);
