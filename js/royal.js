"use strict";
/* ================= Aurelmark, the late-game city (v1.33.0) =================
   Hearthvale is the beginner town; the capital is where seasoned adventurers shop and finish their gear:
     Aurel Market   Merchant Tavi sells only the Royal Stock (v1.36.8; the basics are at Hearthvale's General Store): plain, well-made
                    Lv 40-45 gear for every weapon type, two armours and a signet, and stronger tonics. Drops and the
                    forge still give the best pieces (they carry bonuses); royal gear is the dependable step between.
     Forge Royal    Smith Garrow is the only one who can refine past +7 (Brannoc in Hearthvale stops there), and his
                    hand is a little surer on the risky steps.
   (v1.35.1) The capital has no bank, chapel, guild hall or waystation: those were only copies of Hearthvale's. */
const ROYAL_SHOP=['crimson','azure',
  'aurelblade','aurelaxe','aureldagger','aurelbow','aurelmace','aurelstaff','aurelplate','aurelmantle','aurelsignet'];
Object.assign(ITEMS,{
  crimson:{name:'Crimson Tonic',type:'use',price:220,heal:450,col:'#b8283a',g:'R',desc:'Restores 450 HP.'},
  azure:{name:'Azure Tonic',type:'use',price:420,sp:150,col:'#2a6ad0',g:'B',desc:'Restores 150 SP.'},
  aurelblade:{name:'Aurel Longsword',type:'weapon',wt:'sword',atk:138,price:24000,lv:45,slots:1,col:'#e8d8a0',g:'W'},
  aurelaxe:{name:'Aurel Greataxe',type:'weapon',wt:'axe',atk:150,price:26000,lv:45,slots:1,col:'#e8d8a0',g:'W'},
  aureldagger:{name:'Aurel Stiletto',type:'weapon',wt:'dagger',atk:94,price:22000,lv:45,slots:1,col:'#e8d8a0',g:'W'},
  aurelbow:{name:'Aurel Warbow',type:'weapon',wt:'bow',atk:106,price:24000,lv:45,slots:1,col:'#e8d8a0',g:'W'},
  aurelmace:{name:'Aurel Sunhammer',type:'weapon',wt:'mace',atk:96,matk:74,price:24000,lv:45,slots:1,col:'#e8d8a0',g:'W'},
  aurelstaff:{name:'Aurel Staff',type:'weapon',wt:'wand',atk:16,matk:124,price:24000,lv:45,slots:1,col:'#e8d8a0',g:'W'},
  aurelplate:{name:'Aurel Plate',type:'armor',def:54,price:22000,lv:45,slots:1,col:'#d8c890',g:'A'},
  aurelmantle:{name:'Aurel Mantle',type:'armor',def:20,b:{int:4,maxsp:80},price:20000,lv:45,slots:1,col:'#c8a8e8',g:'A'},
  aurelsignet:{name:'Aurel Signet',type:'accessory',b:{str:1,agi:1,vit:1,int:1,dex:1,luk:1},price:18000,lv:40,slots:0,col:'#e8c25a',g:'O',desc:'The royal seal of Aurelmark. All stats +1.'}});
// v1.38.9 the Waystone Shard and the Kinship Charm are sold only at the Aurel Market (not Hearthvale's General Store)
for(const id of ['waystone','kinship']){const i=SHOP.indexOf(id);if(i>=0)SHOP.splice(i,1);if(!ROYAL_SHOP.includes(id))ROYAL_SHOP.splice(2,0,id);}
const inCapital=()=>typeof zoneId!=='undefined'&&zoneId==='capital';
// what the shop in this city sells
const shopStock=()=>inCapital()?ROYAL_SHOP:SHOP; // v1.36.8: the capital sells only the Royal Stock; the basics are Hearthvale's
const isShopItem=id=>SHOP.includes(id)||ROYAL_SHOP.includes(id);
// refining: Brannoc stops at +7; Garrow goes to +10 with slightly better odds on the risky steps
const BRANNOC_MAX=7,ROYAL_REFINE=[0,1,1,1,1,.95,.8,.6,.45,.3,.2];
const refineCap=()=>inCapital()?10:BRANNOC_MAX;
const refineOdds=n=>(inCapital()?ROYAL_REFINE:REFINE_CHANCE)[n];

// the Royal Stock's weapons get their own look too: white-gold steel, royal blue and gold
if(typeof WA!=='undefined'){Object.assign(WA,{
  aurelblade:()=>waSword({w:4.6,len:25,guard:7,blade:'#f4f0e0',gcol:'#e8c25a',gem:'#2a6ad0',grip:'#2a4a8a',wrap:'#e8c25a',pom:'#e8c25a',glow:'#ffe8a0'}),
  aurelaxe:()=>waAxe({double:true,head:'#f0e0a0',haft:'#2a4a8a',len:26}),
  aureldagger:()=>waSword({w:3,len:16,guard:4.5,blade:'#f4f0e0',gcol:'#e8c25a',gem:'#c8283a',grip:'#2a4a8a',wrap:'#e8c25a',pom:'#e8c25a'}),
  aurelmace:()=>waMace({head:'#e8c25a',flange:'#f4e090',gem:'#2a6ad0',glow:'#ffe8a0'}),
  aurelstaff:()=>waWand({len:23,shaft:'#f0e8d0',spiral:'rgba(200,160,60,.5)',band:'#2a4a8a',prong:'#e8c25a',crystal:'#9ad0ff',glow:'#cfe8ff',star:true})});
  if(typeof WA_BOW!=='undefined')WA_BOW.aurelbow={wood:'#e8d8a0',grip:'#2a4a8a',scale:1.1,tip:'#e8c25a',feather:'#ffffff'};}
/* v1.40.0 the signature weapons were taken out of the game: any a hero still carries leaves the bag, the hands and storage,
   and sigils socketed in them come back to the bag */
const SIGW_GONE=/^(oathblade|starweave|windstring|dawnbell|veilfang)[123]$/;
// called while a hero loads (ui.js startWith), before stats are worked out
function sigwSweep(){if(!P)return;let n=0;const back=[];
  const strip=e=>{if(Array.isArray(e.s))for(const v of e.s)if(v)back.push(v);n++;};
  if(P.eq&&P.eq.weapon&&SIGW_GONE.test(P.eq.weapon.id)){strip(P.eq.weapon);P.eq.weapon=null;}
  for(const L of [P.inv,P.storage])if(Array.isArray(L))for(let i=L.length-1;i>=0;i--)if(L[i]&&SIGW_GONE.test(L[i].id)){strip(L[i]);L.splice(i,1);}
  if(!n)return;for(const id of back)if(ITEMS[id])giveItem(id,1);
  setTimeout(()=>{try{save();addLog(`The signature weapons have been retired from Embervale.${back.length?' The sigils that were in yours are back in your bag.':''}`,'l-sys');}catch(e){}},1500);}
