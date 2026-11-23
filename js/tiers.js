"use strict";
/* ================= gear tiers from start to finish (v1.48.0) =================
   Before, shop weapons went Lv 1 -> Lv 25 -> Lv 45 and then stopped, and armour stopped at Lv 45 too, while monsters kept
   growing to Lv 99: past Lv 50 every fight took longer and hurt more, with nothing to buy to catch up.
     Lv 12  Steel       Hearthvale's General Store: the first real upgrade after the starter weapons
     Lv 60  Stormsteel  Aurel Market (Aurelmark): about 1.4x the Aurel set
     Lv 75  Starforged  Aurel Market: about 1.85x
     Lv 90  Sunfire     Aurel Market: about 2.4x
   Each tier has one weapon for every weapon type, plus heavy armour and a caster's robe (not for Steel). Drops and the forge
   still give pieces with bonuses; these are the dependable steps between. */
{
const T=[
  // id prefix, name word, level, multiplier on the Aurel (Lv 45) numbers, price, colour
  ['storm','Stormsteel',60,1.4,52000,'#9ab8d8'],
  ['star','Starforged',75,1.85,90000,'#c8b0ff'],
  ['sun','Sunfire',90,2.4,145000,'#ffb050']];
const W={ // weapon type: [suffix, name per tier, Aurel Lv 45 atk, matk, extra]
  sword:['blade',['Stormsteel Sword','Starforged Blade','Sunfire Greatsword'],138,0],
  axe:['axe',['Stormsteel Axe','Starforged Cleaver','Sunfire Waraxe'],150,0],
  dagger:['dirk',['Stormsteel Dirk','Starforged Kris','Sunfire Fang'],94,0],
  bow:['bow',['Stormsteel Bow','Starforged Longbow','Sunfire Bow'],106,0],
  mace:['mace',['Stormsteel Maul','Starforged Hammer','Sunfire Mace'],96,74],
  wand:['staff',['Stormsteel Rod','Starforged Scepter','Sunfire Staff'],16,124],
  gun:['gun',['Stormsteel Carbine','Starforged Musket','Sunfire Handcannon'],132,0,{rng:255}]};
const add={},royal=[];
T.forEach(([p,word,lv,k,price,col],ti)=>{
  for(const wt in W){const [suf,names,atk,matk,extra]=W[wt],id=p+suf;
    add[id]={name:names[ti],type:'weapon',wt,atk:Math.round(atk*k),...(matk?{matk:Math.round(matk*k)}:{}),...(extra||{}),price,lv,slots:1,col,g:'W'};royal.push(id);}
  add[p+'plate']={name:word+' Plate',type:'armor',def:Math.round(54*(1+(k-1)*.75)),price:Math.round(price*.9),lv,slots:1,col,g:'A'};
  add[p+'robe']={name:word+(ti===1?' Mantle':' Robe'),type:'armor',def:Math.round(20*(1+(k-1)*.75)),b:{int:4+2*(ti+1),maxsp:80+40*(ti+1)},price:Math.round(price*.85),lv,slots:1,col,g:'A'};
  royal.push(p+'plate',p+'robe');});
// Lv 12 Steel: Hearthvale's first upgrade (between the Lv 1 starters and the Lv 25 pieces)
Object.assign(add,{
  steelsword:{name:'Steel Sword',type:'weapon',wt:'sword',atk:52,price:1600,lv:12,slots:1,col:'#b8c4d4',g:'W'},
  steelaxe:{name:'Steel Hatchet',type:'weapon',wt:'axe',atk:58,price:1700,lv:12,slots:0,col:'#b8c4d4',g:'W'},
  steeldagger:{name:'Steel Dagger',type:'weapon',wt:'dagger',atk:40,price:1500,lv:12,slots:1,col:'#b8c4d4',g:'W'},
  steelbow:{name:'Ash Bow',type:'weapon',wt:'bow',atk:48,price:1600,lv:12,slots:1,col:'#a8845a',g:'W'},
  steelmace:{name:'Steel Mace',type:'weapon',wt:'mace',atk:44,matk:28,price:1600,lv:12,slots:1,col:'#b8c4d4',g:'W'},
  steelwand:{name:'Oak Wand',type:'weapon',wt:'wand',atk:8,matk:52,price:1600,lv:12,slots:1,col:'#a8845a',g:'W'},
  steelgun:{name:'Steel Pistol',type:'weapon',wt:'gun',atk:46,rng:215,price:1800,lv:12,slots:1,col:'#b8c4d4',g:'W'}});
Object.assign(ITEMS,add);
// shops: Steel after the starters in Hearthvale, the late tiers at the end of the Royal Stock
{const steel=['steelsword','steelaxe','steeldagger','steelbow','steelmace','steelwand','steelgun'];
  const at=SHOP.indexOf('bastion');SHOP.splice(at<0?SHOP.length:at,0,...steel.filter(id=>!SHOP.includes(id)));}
if(typeof ROYAL_SHOP!=='undefined')for(const id of royal)if(!ROYAL_SHOP.includes(id))ROYAL_SHOP.push(id);

// how they look in the hero's hands
if(typeof WA!=='undefined'){
  const look={storm:{blade:'#dfe8f4',g:'#7a9ac0',grip:'#2a3a52',glow:'#bfe0ff',gem:'#4a8ad8'},
    star:{blade:'#efe6ff',g:'#a080e8',grip:'#3a2a5a',glow:'#d8c8ff',gem:'#c060ff'},
    sun:{blade:'#fff0d0',g:'#ff9a30',grip:'#5a2a18',glow:'#ffd080',gem:'#ff5a20'}};
  for(const p in look){const c=look[p];
    WA[p+'blade']=()=>waSword({w:p==='sun'?5.2:4.6,len:p==='sun'?27:25,guard:7.5,blade:c.blade,gcol:c.g,gem:c.gem,grip:c.grip,wrap:c.g,pom:c.g,glow:c.glow});
    WA[p+'axe']=()=>waAxe({double:p!=='storm',head:c.blade,haft:c.grip,len:26});
    WA[p+'dirk']=()=>waSword({w:3,len:17,guard:4.5,blade:c.blade,gcol:c.g,gem:c.gem,grip:c.grip,wrap:c.g,pom:c.g});
    WA[p+'mace']=()=>waMace({head:c.g,flange:c.blade,gem:c.gem,glow:c.glow});
    WA[p+'staff']=()=>waWand({len:24,shaft:c.blade,spiral:'rgba(255,255,255,.35)',band:c.grip,prong:c.g,crystal:c.glow,glow:c.glow,star:p!=='storm'});
    if(typeof WA_BOW!=='undefined')WA_BOW[p+'bow']={wood:c.g,grip:c.grip,scale:1.12,tip:c.blade,feather:'#ffffff'};
    if(typeof GUN_ART!=='undefined'&&typeof gunHeld==='function'){GUN_ART[p+'gun']={len:22,barrel:c.blade,body:c.grip,stock:c.g,band:c.gem,glow:c.glow};WA[p+'gun']=gunHeld(p+'gun');}}
  WA.steeldagger=()=>waSword({w:3,len:15,guard:4,blade:'#e0e6ee',gcol:'#8a909c',grip:'#4a3020'});
  WA.steelsword=()=>waSword({w:4,len:23,guard:6.5,blade:'#e4eaf2',gcol:'#9aa2ae',grip:'#4a3020',wrap:'#8a6a4a',pom:'#9aa2ae'});
  WA.steelaxe=()=>waAxe({head:'#d8dee8',haft:'#5a3a22',len:22});
  WA.steelmace=()=>waMace({head:'#aab2be',flange:'#d8dee8',gem:'#6a90c0'});
  WA.steelwand=()=>waWand({len:19,shaft:'#8a6a42',spiral:'rgba(255,255,255,.25)',band:'#c8a050',prong:'#a8845a',crystal:'#b8e0a0',glow:'#d8f0c0'});
  if(typeof WA_BOW!=='undefined')WA_BOW.steelbow={wood:'#a8845a',grip:'#4a3020',scale:1,tip:'#c8ccd4',feather:'#e8e0d0'};
  if(typeof GUN_ART!=='undefined'&&typeof gunHeld==='function'){GUN_ART.steelgun={len:12,barrel:'#b8c4d4',body:'#4a4650',stock:'#6a4a2a',band:'#c8a050'};WA.steelgun=gunHeld('steelgun');}}
}
