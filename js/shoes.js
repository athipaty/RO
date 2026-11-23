"use strict";
/* ================= shoes, and a second accessory (v1.53.0) =================
   Two more equipment slots: Shoes, and Accessory II (any accessory fits either accessory slot, but not the same one
   twice; js/combat.js useInv). Shoes give a little DEF and what feet are for: FLEE, AGI and move speed (quick boots),
   or VIT and Max HP (heavy greaves, drawn taller). Worn shoes colour your boots, and others see them (presence 'sh').
     shops     Hearthvale General Store: Lv 1, 8, 12 and 25 pairs; Aurel Market: Lv 45, 60, 75 and 90 pairs
     monsters  a few nimble or armoured monsters drop a pair now and then (4%)
     boss      the Elder Antlerking's relic boots (10%, two sigil slots)
   Measured with a typical hero and the best shop gear: the two new slots add about 7-8% Max HP and 11-14% DEF (heavy
   greaves) and little ATK, so monsters were left as they are: better gear is a fair reward, not a new difficulty.
   tools/export-world.js runs this file too (drops), so nothing here may need the page. */
const SHOES={
  // id: name, level, DEF, bonuses, price, colour, tall (greaves)
  strawsandals:['Straw Sandals',1,1,{agi:1},150,'#c8a060'],
  leatherboots:['Leather Boots',8,3,{flee:3},700,'#7a5030'],
  trailboots:['Trail Boots',12,4,{agi:1,flee:4},1400,'#8a6a3a'],
  ironshod:['Ironshod Boots',25,5,{vit:1,maxhp:30},3200,'#8a9098',true],
  windstep:['Windstep Shoes',25,3,{agi:2,move:4},3400,'#8fd0c0'],
  aurelsabatons:['Aurel Sabatons',45,8,{vit:2,maxhp:60},21000,'#e0c060',true],
  aurelslippers:['Aurel Slippers',45,4,{agi:3,flee:8},20000,'#f0e0a0'],
  stormgreaves:['Stormsteel Greaves',60,11,{vit:2,maxhp:90},46000,'#9ab8d8',true],
  stormstep:['Stormstep Boots',60,6,{agi:3,move:5,flee:10},45000,'#bfe0ff'],
  stargreaves:['Starforged Greaves',75,14,{vit:3,maxhp:120},80000,'#c8b0ff',true],
  starstep:['Starstep Boots',75,7,{agi:4,move:6,flee:12},79000,'#e0d0ff'],
  sungreaves:['Sunfire Greaves',90,18,{vit:4,maxhp:160},128000,'#ffb050',true],
  sunstep:['Sunstep Boots',90,9,{agi:5,move:7,flee:14},126000,'#ffd890']};
const SHOE_DROPS={ // monster: [id, name, level, DEF, bonuses, colour, tall]
  hopper:['hopperhops','Hopper Hops',4,2,{agi:1,move:3},'#c8a070'],
  greylupe:['lupepaws','Lupe-paw Boots',14,4,{flee:5,agi:1},'#9a9aa0'],
  scarab:['scarabtreads','Scarab Treads',22,6,{maxhp:50,vit:1},'#5ac0a0',true],
  wraith:['wraithwraps','Wraith Wraps',26,3,{flee:8},'#c8d0e8'],
  frostyeti:['yetimuks','Yeti Mukluks',65,12,{vit:2,ailres:4},'#e8f0f8',true],
  salamander:['emberwalkers','Emberwalkers',86,14,{agi:3,res_fire:5},'#ff8a3a']};
{const mk=(name,lv,def,b,price,col,tall,extra)=>({name,type:'shoes',def,b,price,lv,slots:1,col,g:'S',...(tall?{tall:true}:{}),...(extra||{})});
  for(const [id,[n,lv,def,b,price,col,tall]] of Object.entries(SHOES))ITEMS[id]=mk(n,lv,def,b,price,col,tall);
  for(const [mob,[id,n,lv,def,b,col,tall]] of Object.entries(SHOE_DROPS)){ITEMS[id]=mk(n,lv,def,b,Math.round(150+lv*lv*1.2/10)*10,col,tall);
    const m=MOBS[mob];if(m&&m.drops&&!m.drops.some(d=>d[0]===id))m.drops.push([id,.04]);if(typeof RARE_DROPS!=='undefined')RARE_DROPS.add(id);}
  // the Elder Antlerking's relic boots
  ITEMS.antlerstride=mk('Antlerstride Boots',30,10,{agi:3,move:6,flee:10},13500,'#c8a070',false,{slots:2,boss:true,desc:'Boss relic: dropped only by the Elder Antlerking, stronger than any shop piece of its level.'});
  if(MOBS.antlerking&&MOBS.antlerking.drops&&!MOBS.antlerking.drops.some(d=>d[0]==='antlerstride'))MOBS.antlerking.drops.push(['antlerstride',.1]);
  if(typeof LEGENDARY!=='undefined')LEGENDARY.add('antlerstride');
  if(typeof SHOP!=='undefined')for(const id of ['strawsandals','leatherboots','trailboots','ironshod','windstep'])if(!SHOP.includes(id))SHOP.push(id);
  if(typeof ROYAL_SHOP!=='undefined')for(const id of ['aurelsabatons','aurelslippers','stormgreaves','stormstep','stargreaves','starstep','sungreaves','sunstep'])if(!ROYAL_SHOP.includes(id))ROYAL_SHOP.push(id);}

/* ---- a pair of boots as the item picture ---- */
if(typeof drawItemIcon==='function'){const _diSH=drawItemIcon;drawItemIcon=function(g,id){const it=ITEMS[id];if(!it||it.type!=='shoes')return _diSH.apply(this,arguments);
  g.save();g.lineJoin='round';g.lineWidth=1.6;g.strokeStyle='#2a1c14';const sh=it.tall?13:8,dk=typeof mlShade==='function'?mlShade(it.col,-.3):'#3a2a20';
  for(const [ox,a] of [[-4,.75],[3,1]]){g.globalAlpha=a;g.fillStyle=it.col;g.beginPath();g.roundRect(10+ox,22-sh,8,sh,2);g.fill();g.stroke();
    g.beginPath();g.roundRect(8+ox,19,14,6,3);g.fill();g.stroke();g.fillStyle=dk;g.fillRect(9+ox,23.5,12,1.6);}
  g.globalAlpha=1;g.restore();};}
