"use strict";
/* ================= potions you can tell apart at a glance =================
   Every tonic and brew used to be the same round flask in another colour. Now the bottle shape says what kind it
   is, and a badge in the corner says what it does:
     HP tonics      round flask, red heart badge (the big Amber Tonic is a wider flask with two hearts)
     SP tonics      tall slim vial, blue drop badge
     cures          cone flask, green cross badge
     battle brews   square bottle with a cork, badge by stat: sword ATK, shield DEF, wing AGI/FLEE, star INT/MATK,
                    clover LUK, heart VIT/HP
     festival food  drawn as the food (tea cup, pie, cake, cocoa mug) with the same stat badge
   Teleport items, scrolls, the taming charm and the pet snack get their own pictures too. */
function potKind(it){const b=(it.brew&&it.brew.b)||{};
  if(it.heal)return 'hp';if(it.sp&&!it.heal)return 'sp';if(it.cure)return 'cure';
  if(b.atk)return 'atk';if(b.def&&!b.maxhp)return 'def';if(b.agi||b.flee)return 'agi';if(b.int||b.matk)return 'int';if(b.luk)return 'luk';if(b.vit||b.maxhp||b.regen)return 'vit';
  return null;}
// the corner badge: a dark disc with a white symbol
function potBadge(g,kind,x=24.5,y=24.5){const r=6.5,col={hp:'#d9483f',hp2:'#b8241c',sp:'#3a7fd9',cure:'#3f9a4c',atk:'#c8402a',def:'#6a7a8a',agi:'#2a9a8a',int:'#6a4ac8',luk:'#3f9a4c',vit:'#c84a6a'}[kind]||'#555';
  g.save();g.lineWidth=1.4;g.strokeStyle='#120c08';g.fillStyle=col;g.beginPath();g.arc(x,y,r,0,7);g.fill();g.stroke();g.fillStyle='#fff';g.strokeStyle='#fff';g.lineWidth=1.6;g.lineCap='round';g.lineJoin='round';
  const heart=(cx,cy,s)=>{g.beginPath();g.moveTo(cx,cy+s*1.1);g.bezierCurveTo(cx-s*1.9,cy-s*.2,cx-s*.9,cy-s*1.6,cx,cy-s*.5);g.bezierCurveTo(cx+s*.9,cy-s*1.6,cx+s*1.9,cy-s*.2,cx,cy+s*1.1);g.fill();};
  switch(kind){
    case 'hp':heart(x,y,2.7);break;
    case 'hp2':heart(x-2,y+.4,1.9);heart(x+2.1,y-.6,1.9);break;
    case 'sp':g.beginPath();g.moveTo(x,y-4);g.quadraticCurveTo(x+4,y+.5,x,y+3.6);g.quadraticCurveTo(x-4,y+.5,x,y-4);g.fill();break;
    case 'cure':g.fillRect(x-1.2,y-4,2.4,8);g.fillRect(x-4,y-1.2,8,2.4);break;
    case 'atk':g.beginPath();g.moveTo(x-3.2,y+3.2);g.lineTo(x+3.4,y-3.4);g.stroke();g.beginPath();g.moveTo(x-3.6,y+.6);g.lineTo(x-.6,y+3.6);g.stroke();break;
    case 'def':g.beginPath();g.moveTo(x,y-4);g.lineTo(x+3.6,y-2.6);g.lineTo(x+3,y+1.4);g.quadraticCurveTo(x+1.6,y+3.6,x,y+4.2);g.quadraticCurveTo(x-1.6,y+3.6,x-3,y+1.4);g.lineTo(x-3.6,y-2.6);g.closePath();g.fill();break;
    case 'agi':g.beginPath();g.moveTo(x-3.8,y+2.5);g.quadraticCurveTo(x-1,y-4.5,x+4,y-3.6);g.quadraticCurveTo(x+1.5,y-1.6,x+2.6,y-.6);g.quadraticCurveTo(x,y,x+1.2,y+1.2);g.quadraticCurveTo(x-1.4,y+1.6,x-3.8,y+2.5);g.fill();break;
    case 'int':g.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,rr=i%2?1.8:4.2;g.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr);}g.closePath();g.fill();break;
    case 'luk':for(const [dx,dy] of [[0,-2],[2,0],[0,2],[-2,0]]){g.beginPath();g.arc(x+dx,y+dy,1.9,0,7);g.fill();}break;
    case 'vit':heart(x,y,2.4);g.fillStyle=col;g.fillRect(x-.6,y-1.8,1.2,3.4);g.fillRect(x-1.7,y-.7,3.4,1.2);break;}
  g.restore();}
function potGlass(g,path,c,level){g.beginPath();path();g.fillStyle='rgba(220,235,245,.5)';g.fill();
  g.save();g.beginPath();path();g.clip();g.fillStyle=c;g.fillRect(0,level,32,32);g.fillStyle=shade(c,.35);g.fillRect(0,level,32,2.2);g.restore();
  g.lineWidth=1.6;g.strokeStyle=OL;g.beginPath();path();g.stroke();}
function drawPotion(g,it,kind){const c=it.col||'#c84a4a';g.lineJoin='round';g.lineCap='round';g.lineWidth=1.6;g.strokeStyle=OL;
  const cork=(x,y,w,h)=>{g.beginPath();g.roundRect(x,y,w,h,1.4);g.fillStyle='#c8a070';g.fill();g.stroke();};
  const shine=(x,y,h)=>{g.fillStyle='rgba(255,255,255,.7)';g.beginPath();g.ellipse(x,y,1.4,h,.25,0,7);g.fill();};
  if(kind==='hp'){const big=it.heal>=150;
    if(big){cork(12,3,8,5);potGlass(g,()=>{g.moveTo(12.5,8);g.lineTo(19.5,8);g.lineTo(19.5,10.5);g.bezierCurveTo(30,13,30,29,16,29.5);g.bezierCurveTo(2,29,2,13,12.5,10.5);g.closePath();},c,14);shine(8.5,18,3.6);}
    else{cork(12.5,4,7,5);potGlass(g,()=>{g.moveTo(13,9);g.lineTo(19,9);g.lineTo(19,12);g.bezierCurveTo(27,14,26,29,16,29);g.bezierCurveTo(6,29,5,14,13,12);g.closePath();},c,17);shine(10,19,3);}
    potBadge(g,big?'hp2':'hp');return;}
  if(kind==='sp'){cork(12.5,2,7,4.5);potGlass(g,()=>{g.moveTo(13,6.5);g.lineTo(19,6.5);g.lineTo(19,9);g.quadraticCurveTo(21,10,21,13);g.lineTo(21,26);g.quadraticCurveTo(21,29.5,16,29.5);g.quadraticCurveTo(11,29.5,11,26);g.lineTo(11,13);g.quadraticCurveTo(11,10,13,9);g.closePath();},c,13);shine(13.6,18,4);potBadge(g,'sp');return;}
  if(kind==='cure'){cork(13,3,6,5);potGlass(g,()=>{g.moveTo(13.5,8);g.lineTo(18.5,8);g.lineTo(18.5,13);g.lineTo(27,27);g.quadraticCurveTo(28,29.5,25,29.5);g.lineTo(7,29.5);g.quadraticCurveTo(4,29.5,5,27);g.lineTo(13.5,13);g.closePath();},c,17);shine(12,21,3);potBadge(g,'cure');return;}
  // battle brews: a square bottle with a wax-sealed cork
  cork(12,2.5,8,5);g.beginPath();g.moveTo(11.5,7.5);g.lineTo(20.5,7.5);g.stroke();
  potGlass(g,()=>{g.moveTo(12.5,7.5);g.lineTo(19.5,7.5);g.lineTo(19.5,10);g.lineTo(25,12.5);g.lineTo(25,27);g.quadraticCurveTo(25,29.5,22.5,29.5);g.lineTo(9.5,29.5);g.quadraticCurveTo(7,29.5,7,27);g.lineTo(7,12.5);g.lineTo(12.5,10);g.closePath();},c,15);
  g.fillStyle='rgba(240,228,200,.9)';g.strokeStyle=OL;g.lineWidth=1;g.beginPath();g.roundRect(9.5,17,10,7,1.2);g.fill();g.stroke();shine(9,14,1.6);
  if(kind)potBadge(g,kind);}
function drawFood(g,id,it,kind){const c=it.col;g.lineJoin='round';g.lineCap='round';g.lineWidth=1.6;g.strokeStyle=OL;
  if(id==='blossomtea'||id==='cocoa'){ // a cup or mug with steam
    g.beginPath();g.moveTo(6,12);g.lineTo(22,12);g.lineTo(20.5,26);g.quadraticCurveTo(20,28,18,28);g.lineTo(10,28);g.quadraticCurveTo(8,28,7.5,26);g.closePath();g.fillStyle=id==='cocoa'?'#e8dccb':'#f6eef2';g.fill();g.stroke();
    g.beginPath();g.arc(22.5,18,3.4,-Math.PI/2,Math.PI/2);g.stroke();g.fillStyle=c;g.beginPath();g.ellipse(14,13.5,7.2,1.8,0,0,7);g.fill();
    g.strokeStyle='rgba(255,255,255,.75)';g.lineWidth=1.3;for(const x of [11,15]){g.beginPath();g.moveTo(x,9);g.quadraticCurveTo(x+2,6.5,x,4.5);g.stroke();}
    if(id==='blossomtea'){g.fillStyle='#ff8fbf';g.beginPath();g.arc(14,13.5,1.8,0,7);g.fill();}}
  else if(id==='harvestpie'){g.beginPath();g.ellipse(15,21,11,6,0,0,7);g.fillStyle='#c8803a';g.fill();g.stroke();g.beginPath();g.ellipse(15,18.5,10,5,0,Math.PI,0);g.fillStyle='#e8b060';g.fill();g.stroke();
    g.strokeStyle='#a0602a';g.lineWidth=1.2;for(const x of [10,15,20]){g.beginPath();g.moveTo(x,15);g.lineTo(x+1,19);g.stroke();}}
  else if(id==='lanterncake'){g.beginPath();g.roundRect(6,15,18,12,2);g.fillStyle='#f4e2c0';g.fill();g.stroke();g.beginPath();g.roundRect(6,13,18,4,2);g.fillStyle=c;g.fill();g.stroke();
    g.fillStyle='#ffe08a';g.beginPath();g.moveTo(15,4);g.quadraticCurveTo(18,8,15,11);g.quadraticCurveTo(12,8,15,4);g.fill();g.strokeStyle=OL;g.lineWidth=1.2;g.beginPath();g.moveTo(15,11);g.lineTo(15,13);g.stroke();}
  if(kind)potBadge(g,kind);}
const FOOD=new Set(['blossomtea','harvestpie','lanterncake','cocoa']);
const _drawItemIconP=drawItemIcon;
drawItemIcon=function(g,id){const it=ITEMS[id];
  if(it&&it.type==='use'&&!it.tele&&!it.pick&&!it.kin&&!it.home){
    if(id==='tamecharm'){g.lineWidth=1.6;g.strokeStyle=OL;g.beginPath();g.moveTo(16,27);g.bezierCurveTo(3,18,6,6,16,12);g.bezierCurveTo(26,6,29,18,16,27);g.fillStyle=it.col;g.fill();g.stroke();
      g.strokeStyle='#e0b84a';g.beginPath();g.arc(16,7,3,0,7);g.stroke();g.fillStyle='rgba(255,255,255,.7)';g.beginPath();g.arc(11,13,2,0,7);g.fill();return;}
    if(id==='petsnack'){g.lineWidth=1.6;g.strokeStyle=OL;g.fillStyle=it.col;g.beginPath();g.roundRect(8,13,16,6,3);g.fill();g.stroke();
      for(const [x,y] of [[7,12],[7,20],[25,12],[25,20]]){g.beginPath();g.arc(x,y,3.2,0,7);g.fill();g.stroke();}return;}
    const kind=potKind(it);
    if(FOOD.has(id))return drawFood(g,id,it,kind);
    if(kind||it.brew)return drawPotion(g,it,kind);}
  return _drawItemIconP.apply(this,arguments);};
for(const k in ICON_CACHE)delete ICON_CACHE[k];for(const k in ICON_CANVAS)delete ICON_CANVAS[k];
