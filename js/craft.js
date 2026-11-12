"use strict";
/* ================= #22 crafting and brewing =================
   Monster materials finally have a use beyond selling. Brew tonics and battle brews anywhere (/craft), or forge
   gear at Brannoc's smithy in Hearthvale. Each recipe shows what it needs, how many you have and which
   monster drops each material. All original items. */
// new brews: buffs for a few minutes (buff(id,name,seconds,bonus) in combat.js)
Object.assign(ITEMS,{
  ironbark:{name:'Ironbark Brew',type:'use',price:60,col:'#8a6a3a',g:'I',brew:{id:'ironbark',s:180,b:{def:10}},desc:'For 3 minutes: +10 DEF.'},
  fleetfoot:{name:'Fleetfoot Draught',type:'use',price:60,col:'#7fd3c0',g:'F',brew:{id:'fleetfoot',s:180,b:{agi:5,flee:5}},desc:'For 3 minutes: +5 AGI and +5 FLEE.'},
  furybrew:{name:'Fury Brew',type:'use',price:120,col:'#e0503a',g:'F',brew:{id:'furybrew',s:180,b:{atk:20}},desc:'For 3 minutes: +20 ATK.'},
  sagebrew:{name:'Sage Brew',type:'use',price:150,col:'#8f7fe0',g:'S',brew:{id:'sagebrew',s:180,b:{int:5,matk:30}},desc:'For 3 minutes: +5 INT and +30 MATK.'},
  stoneskin:{name:'Stoneskin Brew',type:'use',price:300,col:'#9a948a',g:'S',brew:{id:'stoneskin',s:180,b:{def:25}},desc:'For 3 minutes: +25 DEF.'},
  // forged gear
  thornring:{name:'Thornwrap Ring',type:'accessory',b:{str:2,crit:3},price:900,lv:11,slots:0,col:'#4e8a3d',g:'O',craft:true},
  lupevest:{name:'Lupe Hide Vest',type:'armor',def:16,b:{agi:2,flee:4},price:1200,lv:14,slots:1,col:'#8a909c',g:'A',craft:true},
  silkhood:{name:'Glowsilk Hood',type:'head',def:2,b:{int:3,maxsp:50},price:2000,lv:19,slots:0,col:'#c8f0a0',g:'^',craft:true},
  duskcharm:{name:'Duskwing Charm',type:'accessory',b:{agi:3,flee:8},price:2600,lv:22,slots:0,col:'#6a5a7a',g:'O',craft:true},
  carapacemail:{name:'Carapace Mail',type:'armor',def:30,b:{vit:2},price:4200,lv:24,slots:1,col:'#4f86aa',g:'A',craft:true},
  needlebow:{name:'Needlethorn Bow',type:'weapon',wt:'bow',atk:92,b:{dex:2},price:7600,lv:30,slots:1,col:'#73b064',g:'W',craft:true},
  trollmaul:{name:'Trollhide Maul',type:'weapon',wt:'mace',atk:96,matk:60,price:9600,lv:34,slots:1,col:'#6a7a5a',g:'W',craft:true},
  corerod:{name:'Embercore Rod',type:'weapon',wt:'wand',atk:14,matk:112,price:12000,lv:38,slots:1,col:'#f08a3a',g:'W',craft:true},
  fangblade:{name:'Rimefang Blade',type:'weapon',wt:'sword',atk:140,b:{crit:4},price:19000,lv:44,slots:1,col:'#cfe3f0',g:'W',craft:true},
});
// [output, how many, {material: count}, gold]
const BREWS=[
  ['red',5,{sap:4},10],
  ['orange',3,{tuft:3,sap:2},30],
  ['blue',2,{spore:3,shell:1},60],
  ['remedy',2,{spore:2,thorn:2},20],
  ['ironbark',2,{shell:3,sap:2},30],
  ['fleetfoot',2,{tuft:3,pelt:1},40],
  ['furybrew',2,{thorn:3,pelt:2},80],
  ['sagebrew',2,{spore:3,glowsilk:2},100],
  ['stoneskin',2,{carapace:2,crabshell:2},200],
];
const FORGES=[
  ['thornring',1,{thorn:6,tuft:2},700],
  ['lupevest',1,{pelt:6,shell:3},900],
  ['silkhood',1,{glowsilk:6,spore:3},1800],
  ['duskcharm',1,{batwing:5,dust:2},2400],
  ['carapacemail',1,{carapace:6,crabshell:4},3800],
  ['needlebow',1,{needle:6,trollhide:3},7000],
  ['trollmaul',1,{trollhide:5,bone:3},9000],
  ['corerod',1,{core:5,shadeveil:3},11000],
  ['fangblade',1,{fang:5,fur:3,shard:2},18000],
];
const CRAFT={tab:'brew'};
// which monsters drop a material (for the "from …" hints)
const dropFrom=id=>Object.values(MOBS).filter(m=>!m.boss&&(m.drops||[]).some(([d])=>d===id)).map(m=>m.name);
const atSmithy=()=>zoneId==='town'&&Z.npcs.some(n=>n.role==='smith'&&dist(P,n)<170);
const haveN=id=>(invFind(id)||{}).n||0;
const canMake=([out,n,mats,gold])=>P.gold>=gold&&Object.entries(mats).every(([id,k])=>haveN(id)>=k);

function craftMake(list,idx){const r=list[idx];if(!r)return;const [out,n,mats,gold]=r,it=ITEMS[out];
  if(list===FORGES&&!atSmithy()){addLog('Forging needs Brannoc\'s anvil. Visit the Smithy in Hearthvale.','l-bad');return;}
  if(!canMake(r)){addLog(`You don't have everything for ${it.name} yet.`,'l-bad');return;}
  const gearW=it.type==='use'?0:itemWeight(out);if(gearW&&carryWeight()+gearW>maxWeight()){addLog('Your bag is too heavy to carry that. Store or sell something first.','l-bad');return;}
  for(const [id,k] of Object.entries(mats))takeItem(id,k);P.gold-=gold;giveItem(out,n);
  fx.push({k:'ring',x:P.x,y:P.y,r:36,col:list===FORGES?'#ff9a3a':'#9fe0c0',t0:now,dur:.5});sfx(list===FORGES?'slam':'pop');
  addLog(`${list===FORGES?'Forged':'Brewed'} ${it.name}${n>1?' ×'+n:''}.`,'l-good');
  if(P.ach){P.ach.c=P.ach.c||{};P.ach.c.craft=(P.ach.c.craft||0)+1;}if(typeof achCheck==='function')achCheck();
  save();refreshPanel();}

PANELS.craft=()=>{if(panelArg==='forge'){CRAFT.tab='forge';panelArg=null;}
  const forge=CRAFT.tab==='forge',list=forge?FORGES:BREWS;
  let h=`<h2>${forge?'Forge':'Brewing'}</h2><div class="sub">${forge?'Brannoc turns monster materials into gear. Forging works at the Smithy in Hearthvale.':'Brew tonics and battle brews from monster materials, anywhere.'} You have ${fmt(P.gold)} gold.</div>`;
  h+=`<div class="tabs" role="tablist">`+[['brew','Brewing'],['forge','Forge']].map(([k,l])=>`<button class="btn small ${CRAFT.tab===k?'on':''}" role="tab" aria-selected="${CRAFT.tab===k}" data-act="crafttab" data-arg="${k}">${l}</button>`).join('')+`</div>`;
  if(forge&&!atSmithy())h+=`<div class="arbox">You can look at the recipes here, but forging needs Brannoc's anvil at the Smithy in Hearthvale.</div>`;
  h+=list.map((r,i)=>{const [out,n,mats,gold]=r,it=ITEMS[out],ok=canMake(r)&&(!forge||atSmithy());
    const stats=it.type==='use'?it.desc:typeof itemDesc==='function'?itemDesc({id:out,s:Array(it.slots||0).fill(null)}):'';
    const need=Object.entries(mats).map(([id,k])=>{const have=haveN(id),from=dropFrom(id);const tip=ITEMS[id].name+(from.length?' · dropped by '+from.join(', '):'');return `<span class="cmi ${have>=k?'ok':''}" data-item="${id}" title="${esc(tip)}" aria-label="${esc(tip+': '+Math.min(have,k)+' of '+k)}" tabindex="0"><img src="${itemIconURL(id)}" alt=""><b>${Math.min(have,k)}/${k}</b></span>`;}).join('');
    return `<div class="row craftrow">${icon({id:out})}<div class="grow"><div class="nm">${esc(it.name)}${n>1?` <span class="muted">×${n}</span>`:''}${it.lv>1?` <span class="muted">· Lv ${it.lv}+</span>`:''}</div><div class="ds">${esc(stats)}</div><div class="cms">${need}${gold?`<span class="cm ${P.gold>=gold?'ok':''}">${fmt(gold)} gold</span>`:''}</div></div>`+
      `<button class="btn small" data-act="craftmake" data-arg="${forge?'f':'b'}:${i}" ${ok?'':'disabled'}>${forge?'Forge':'Brew'}</button></div>`;}).join('');
  return h;};
PANEL_ACTS.crafttab=k=>{CRAFT.tab=k==='forge'?'forge':'brew';refreshPanel();};
PANEL_ACTS.craftmake=arg=>{const [k,i]=arg.split(':');craftMake(k==='f'?FORGES:BREWS,+i);};
PANEL_ACTS.openforge=()=>openPanel('craft','forge');
// brews give a timed boost
const _useItemCraft=useItem;
useItem=function(id){const it=ITEMS[id];if(!it||!it.brew)return _useItemCraft(id);
  if(P.dead||!invFind(id)){return _useItemCraft(id);}if((P.cd.item||0)>now)return;
  buff(it.brew.id,it.name,it.brew.s,it.brew.b);takeItem(id);P.cd.item=now+.4;sfx('pop');refreshPanel();};
const _chatCommandCraft=chatCommand;
chatCommand=function(k,arg){if(k==='craft'||k==='brew'||k==='forge'){if(k==='forge')CRAFT.tab='forge';else if(k==='brew')CRAFT.tab='brew';openPanel('craft');return true;}return _chatCommandCraft(k,arg);};
CMD_HELP.push(['/craft','brew tonics anywhere, forge gear at the smithy']);
// pictures for the new brews: a round flask with a coloured brew
const _drawItemIconCraft=drawItemIcon;
drawItemIcon=function(g,id){const it=ITEMS[id];if(!it||!it.brew)return _drawItemIconCraft(g,id);
  g.lineWidth=1.6;g.strokeStyle='#2a1c14';g.fillStyle='#c8b090';g.fillRect(13,3,6,5);g.strokeRect(13,3,6,5);
  g.beginPath();g.moveTo(13,8);g.lineTo(19,8);g.lineTo(19,12);g.arc(16,20,9,-Math.PI/2+.35,Math.PI*1.5-.35);g.closePath();g.fillStyle='rgba(255,255,255,.25)';g.fill();g.stroke();
  g.beginPath();g.arc(16,20,7.5,0,Math.PI);g.lineTo(8.5,18);g.quadraticCurveTo(16,15,23.5,18);g.closePath();g.fillStyle=it.col;g.fill();
  g.fillStyle='rgba(255,255,255,.6)';g.beginPath();g.ellipse(12.5,17,1.6,2.6,.4,0,7);g.fill();};
// phones: tap an ingredient picture to hear its name and where it drops (no hover on a touch screen)
document.addEventListener('click',ev=>{const c=ev.target.closest&&ev.target.closest('.cmi');if(!c)return;const id=c.dataset.item;if(id&&typeof showItemCard==='function'){showItemCard(id);return;}const t=c.getAttribute('title');if(t)floatT(P.x,P.y-50,t.split(' · ')[0],'#ffe7a0',13),addLog(t,'l-sys');});
