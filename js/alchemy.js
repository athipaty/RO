"use strict";
/* ================= the Alchemist's Laboratory in Aurelmark (v1.40.1) =================
   Alchemist Verena makes what the everyday brewing (/craft) cannot, from late-game materials:
     Grand elixirs    stronger battle brews that last 5 minutes, and the Phoenix Draught (a big heal)
     Elemental oils   coat your weapon for 5 minutes: your weapon attacks and physical skills without an element of
                      their own strike with fire, water, wind, earth, holy or shadow (one oil at a time)
     Transmutation    Ember Ore and Glintstone into each other, lesser materials into an Ember Core
   Recipes are made only in the laboratory; the brews and oils are used anywhere. Saved with the hero. */
Object.assign(ITEMS,{
  titanbrew:{name:'Titan Elixir',type:'use',price:900,col:'#c8402a',g:'T',brew:{id:'titanbrew',s:300,b:{atk:45,str:6}},desc:'For 5 minutes: +45 ATK and +6 STR.'},
  archbrew:{name:'Archmage Elixir',type:'use',price:900,col:'#6a5ae0',g:'A',brew:{id:'archbrew',s:300,b:{matk:70,int:6}},desc:'For 5 minutes: +70 MATK and +6 INT.'},
  aegisbrew:{name:'Aegis Elixir',type:'use',price:900,col:'#8a8a9a',g:'G',brew:{id:'aegisbrew',s:300,b:{def:50,vit:6}},desc:'For 5 minutes: +50 DEF and +6 VIT.'},
  galebrew:{name:'Gale Elixir',type:'use',price:900,col:'#5ac8a0',g:'W',brew:{id:'galebrew',s:300,b:{agi:8,flee:15,crit:5}},desc:'For 5 minutes: +8 AGI, +15 FLEE and +5% CRIT.'},
  phoenix:{name:'Phoenix Draught',type:'use',price:1200,heal:2000,col:'#ff8a3a',g:'P',desc:'Restores 2000 HP.'}});
const LAB_OIL={fire:['Fire','#ff7a3a'],water:['Water','#5aa8f0'],wind:['Wind','#7ae0a0'],earth:['Earth','#c8a060'],holy:['Holy','#fff0a0'],shadow:['Shadow','#a070e0']};
for(const [el,[nm,col]] of Object.entries(LAB_OIL))ITEMS[el+'oil']={name:nm+' Oil',type:'use',price:600,col,g:'O',labOil:el,desc:`For 5 minutes your weapon strikes with ${nm.toLowerCase()}: weapon attacks and physical skills without an element of their own.`};
// [output, how many, {material: count}, gold]
const LAB={tab:'elixir',
  elixir:[['titanbrew',2,{trollhide:4,core:3},800],['archbrew',2,{wispglow:4,shadeveil:3},800],['aegisbrew',2,{crabshell:5,lurkerscale:3},800],
    ['galebrew',2,{batwing:5,mantisblade:2},800],['phoenix',2,{fur:4,core:2,bogmoss:4},1200]],
  oil:[['fireoil',2,{core:3,thorn:4},500],['wateroil',2,{lurkerscale:3,shell:4},500],['windoil',2,{wispbreath:6,batwing:3},500],
    ['earthoil',2,{mirestone:3,carapace:3},500],['holyoil',2,{glowsilk:4,spore:4},500],['shadowoil',2,{shadeveil:3,dust:4},500]],
  trans:[['glintstone',2,{emberore:3},200],['emberore',2,{glintstone:3},200],['core',1,{needle:4,bone:4},600]]};
const labHere=()=>typeof zoneId!=='undefined'&&zoneId==='capital'&&Z.npcs.some(n=>n.role==='alchemy'&&dist(P,n)<200);
const labHave=id=>(invFind(id)||{}).n||0;
const labCan=([out,n,mats,gold])=>P.gold>=gold&&Object.entries(mats).every(([id,k])=>labHave(id)>=k);
const labDrops=id=>Object.values(MOBS).filter(m=>!m.boss&&(m.drops||[]).some(([d])=>d===id)).map(m=>m.name);
PANELS.alchemy=()=>{const list=LAB[LAB.tab]||LAB.elixir;
  let h=`<h2>Alchemist's Laboratory</h2><div class="say">"Anyone can stir a tonic. What I make takes rare things and a steady hand: elixirs that turn a battle, oils that give your blade an element, and a little transmutation besides." — Alchemist Verena</div>`;
  h+=`<div class="tabs" role="tablist">`+[['elixir','Grand elixirs'],['oil','Elemental oils'],['trans','Transmutation']].map(([k,l])=>`<button class="btn small ${LAB.tab===k?'on':''}" role="tab" aria-selected="${LAB.tab===k}" data-act="labtab" data-arg="${k}">${l}</button>`).join('')+`</div>`;
  h+=`<div class="sub">${fmt(P.gold)} gold${LAB.tab==='oil'?' · one oil at a time; a new one replaces the last':''}</div>`;
  const oil=labOilNow();if(LAB.tab==='oil'&&oil)h+=`<div class="arbox">Your weapon is coated with ${LAB_OIL[oil.el][0]} Oil for ${Math.max(0,Math.ceil(oil.until-now))}s more.</div>`;
  list.forEach(([out,n,mats,gold],i)=>{const it=ITEMS[out],ok=labCan([out,n,mats,gold]);
    h+=`<div class="row craftrow">${icon({id:out})}<div class="grow"><div class="nm">${esc(it.name)}${n>1?` <span class="muted">×${n}</span>`:''}</div><div class="ds">${esc(it.desc||'')}</div>`+
      `<div class="cms">${Object.entries(mats).map(([id,k])=>itemChip(id,k)).join('')}${goldChip(gold)}</div></div>`+
      `<button class="btn small" data-act="labmake" data-arg="${LAB.tab}:${i}" ${ok?'':'disabled'}>${LAB.tab==='trans'?'Transmute':'Make'}</button></div>`;});
  return h;};
PANEL_ACTS.labtab=k=>{if(LAB[k]){LAB.tab=k;sfx('click');refreshPanel();panel.scrollTop=0;}};
PANEL_ACTS.labmake=arg=>{const [t,i]=String(arg).split(':'),r=LAB[t]&&LAB[t][+i];if(!r||!labHere()||!labCan(r))return;const [out,n,mats,gold]=r;
  for(const [id,k] of Object.entries(mats))takeItem(id,k);P.gold-=gold;giveItem(out,n);sfx('pop');
  fx.push({k:'ring',x:P.x,y:P.y,r:36,col:ITEMS[out].col||'#9fe0c0',t0:now,dur:.5});addLog(`Verena hands you ${ITEMS[out].name}${n>1?' ×'+n:''}.`,'l-good');
  if(P.ach){P.ach.c=P.ach.c||{};P.ach.c.craft=(P.ach.c.craft||0)+1;}if(typeof achCheck==='function')achCheck();save();refreshPanel();};
// the oils: a buff that gives weapon attacks an element
function labOilNow(){const b=P&&P.buffs&&P.buffs.laboil;return b&&b.until>now&&b.el?b:null;}
{const _ui=useItem;useItem=function(id){const it=ITEMS[id];if(!it||!it.labOil)return _ui.apply(this,arguments);if(P.dead||(P.cd.item||0)>now)return;
  const [nm,col]=LAB_OIL[it.labOil];P.buffs.laboil={name:it.name,until:now+300,b:{},el:it.labOil};takeItem(id);P.cd.item=now+.4;sfx('pop');
  fx.push({k:'ring',x:P.x,y:P.y,r:40,col,t0:now,dur:.6});addLog(`Your weapon is coated with ${nm} Oil for 5 minutes.`,'l-good');S=computeStats();refreshPanel();};}
{const _dp=dealPhys;dealPhys=function(m,mult,o){const oil=labOilNow();if(oil&&!(o&&o.el))o={...(o||{}),el:oil.el};return _dp.call(this,m,mult,o);};}
if(typeof TH!=='undefined'){for(const [k,v] of [["Alchemist's Laboratory",'ห้องทดลองนักเล่นแร่แปรธาตุ'],['Alchemist Verena','นักเล่นแร่เวเรนา'],['Grand elixirs','ยาอายุวัฒนะชั้นสูง'],['Elemental oils','น้ำมันธาตุ'],['Transmutation','แปรธาตุ'],['Make','ทำ'],['Transmute','แปรธาตุ'],
  ['Titan Elixir','ยาไททัน'],['Archmage Elixir','ยาจอมเวท'],['Aegis Elixir','ยาโล่ศักดิ์สิทธิ์'],['Gale Elixir','ยาวายุ'],['Phoenix Draught','ยาฟีนิกซ์'],
  ['Fire Oil','น้ำมันไฟ'],['Water Oil','น้ำมันน้ำ'],['Wind Oil','น้ำมันลม'],['Earth Oil','น้ำมันดิน'],['Holy Oil','น้ำมันศักดิ์สิทธิ์'],['Shadow Oil','น้ำมันมืด'],
  ['"Anyone can stir a tonic. What I make takes rare things and a steady hand: elixirs that turn a battle, oils that give your blade an element, and a little transmutation besides." — Alchemist Verena','"ใคร ๆ ก็คนยาได้ แต่ของที่ข้าทำต้องใช้ของหายากและมือที่นิ่ง ยาที่พลิกการต่อสู้ น้ำมันที่ให้ธาตุแก่อาวุธ และการแปรธาตุอีกเล็กน้อย" — นักเล่นแร่เวเรนา']])if(!TH[k])TH[k]=v;
  if(typeof TH_PAT!=='undefined')TH_PAT.unshift([/^([\d,]+) gold · one oil at a time; a new one replaces the last$/,'$1 โกลด์ · ใช้น้ำมันได้ทีละชนิด ชนิดใหม่จะแทนที่ชนิดเดิม'],
    [/^Your weapon is coated with (\w+) Oil for (\d+)s more\.$/,(m,e,s)=>`อาวุธเคลือบ${thText(e+' Oil')}อีก ${s} วินาที`]);}
