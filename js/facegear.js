"use strict";
/* ================= #3 face and mouth gear =================
   Two more equipment slots: Face (glasses, goggles, masks) and Mouth (a grass stalk, a whistle, a scarf).
   They are drawn on the hero (eyes at hy+2.5, mouth at hy+7, ex = x + f*2.6), shown to other players
   (presence fg / mg), sold by Ilsa and forged at the smithy. All original items. */
Object.assign(ITEMS,{
  roundspecs:{name:'Round Spectacles',type:'face',b:{int:1,dex:1},price:600,lv:1,slots:0,col:'#c8a050',g:'∞',desc:'INT +1 · DEX +1. Thin brass frames.'},
  scoutgoggles:{name:'Scout Goggles',type:'face',b:{dex:2,hit:6},price:2400,lv:15,slots:0,col:'#7a5a3a',g:'∞',desc:'DEX +2 · HIT +6. Leather straps and tinted lenses.'},
  duskmask:{name:'Dusk Mask',type:'face',b:{agi:2,flee:6},price:3200,lv:20,slots:0,col:'#3a3050',g:'∞',desc:'AGI +2 · FLEE +6. A masquerade half-mask.'},
  sunshades:{name:'Sun Shades',type:'face',b:{luk:3,crit:2},price:1800,lv:10,slots:0,col:'#2a2a30',g:'∞',desc:'LUK +3 · CRIT +2. Looking cool is half the fight.'},
  grassstalk:{name:'Grass Stalk',type:'mouth',b:{luk:1},price:80,lv:1,slots:0,col:'#7fc060',g:'/',desc:'LUK +1. A meadow classic.'},
  tinwhistle:{name:'Tin Whistle',type:'mouth',b:{agi:1,maxsp:15},price:900,lv:8,slots:0,col:'#c0c8d0',g:'/',desc:'AGI +1 · Max SP +15.'},
  trailscarf:{name:'Trail Scarf',type:'mouth',b:{vit:2,maxhp:60},price:1500,lv:12,slots:0,col:'#b0503a',g:'/',desc:'VIT +2 · Max HP +60. Pulled up over nose and mouth.'},
  emberpipe:{name:'Ember Reed',type:'mouth',b:{int:2,matk:15},price:2600,lv:22,slots:0,col:'#a06a3a',g:'/',desc:'INT +2 · MATK +15. A reed flute that glows at the tip.',craft:true},
});
for(const id of ['roundspecs','sunshades','scoutgoggles','duskmask','grassstalk','tinwhistle','trailscarf'])if(!SHOP.includes(id))SHOP.push(id);
if(typeof FORGES!=='undefined')FORGES.push(['emberpipe',1,{emberore:2,sap:4},1200]);

function drawFaceGear(fc,mo,x,hy,f){const ex=x+f*2.6,ey=hy+2.5;ctx.save();ctx.lineCap='round';
  switch(fc){
    case 'roundspecs':ctx.strokeStyle='#b08a3a';ctx.lineWidth=1.3;for(const k of [-1,1]){ctx.beginPath();ctx.arc(ex+k*4.8,ey,3.6,0,7);ctx.stroke();}
      ctx.beginPath();ctx.moveTo(ex-1.2,ey-.5);ctx.lineTo(ex+1.2,ey-.5);ctx.stroke();ctx.fillStyle='rgba(220,240,255,.25)';for(const k of [-1,1]){ctx.beginPath();ctx.arc(ex+k*4.8,ey,3.2,0,7);ctx.fill();}break;
    case 'scoutgoggles':ctx.strokeStyle='#5a3a22';ctx.lineWidth=2.4;ctx.beginPath();ctx.moveTo(x-12.5,ey-1);ctx.lineTo(x+12.5,ey-1);ctx.stroke();
      for(const k of [-1,1]){ctx.fillStyle='#8a6a4a';ctx.beginPath();ctx.arc(ex+k*4.8,ey,4.4,0,7);ctx.fill();ctx.fillStyle='#e0a040';ctx.beginPath();ctx.arc(ex+k*4.8,ey,3,0,7);ctx.fill();
        ctx.fillStyle='rgba(255,255,255,.55)';ctx.beginPath();ctx.arc(ex+k*4.8-1,ey-1,1,0,7);ctx.fill();}break;
    case 'duskmask':ctx.fillStyle='#3a3050';ctx.strokeStyle='#1a1424';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(ex-10,ey-3);ctx.quadraticCurveTo(ex,ey-6,ex+10,ey-3);ctx.quadraticCurveTo(ex+10,ey+4,ex+4,ey+3);
      ctx.quadraticCurveTo(ex,ey+1,ex-4,ey+3);ctx.quadraticCurveTo(ex-10,ey+4,ex-10,ey-3);ctx.closePath();ctx.fill();ctx.stroke();
      ctx.fillStyle='#000';for(const k of [-1,1]){ctx.beginPath();ctx.ellipse(ex+k*4.8,ey,2,1.4,0,0,7);ctx.fill();}ctx.fillStyle='#c8a0f0';ctx.beginPath();ctx.arc(ex+f*9,ey-4,1.6,0,7);ctx.fill();break;
    case 'sunshades':ctx.fillStyle='#16161c';for(const k of [-1,1]){ctx.beginPath();ctx.roundRect(ex+k*4.8-3.6,ey-2.6,7.2,5,2);ctx.fill();}
      ctx.strokeStyle='#16161c';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(ex-1.2,ey-1.5);ctx.lineTo(ex+1.2,ey-1.5);ctx.stroke();
      ctx.fillStyle='rgba(255,255,255,.35)';for(const k of [-1,1]){ctx.fillRect(ex+k*4.8-2.4,ey-1.8,2,1);}break;
    case 'monocle':{const mx=ex+f*4.8;ctx.strokeStyle='#d8b050';ctx.lineWidth=1.4;ctx.beginPath();ctx.arc(mx,ey,3.8,0,7);ctx.stroke();
      ctx.fillStyle='rgba(200,230,255,.3)';ctx.beginPath();ctx.arc(mx,ey,3.3,0,7);ctx.fill();ctx.fillStyle='rgba(255,255,255,.7)';ctx.beginPath();ctx.arc(mx-1.2,ey-1.2,.9,0,7);ctx.fill();
      ctx.strokeStyle='#c8a040';ctx.lineWidth=.7;ctx.beginPath();ctx.moveTo(mx+f*3.6,ey+1);ctx.quadraticCurveTo(mx+f*6,ey+6,mx+f*3,ey+10);ctx.stroke();break;}
  }
  const my=hy+7.5;
  switch(mo){
    case 'grassstalk':ctx.strokeStyle='#6aa84a';ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(ex+f*1,my);ctx.quadraticCurveTo(ex+f*7,my+1,ex+f*12,my-3+Math.sin(now*3)*.8);ctx.stroke();
      ctx.fillStyle='#a8d860';ctx.beginPath();ctx.ellipse(ex+f*12.5,my-3.5+Math.sin(now*3)*.8,1.8,.9,f*-.5,0,7);ctx.fill();break;
    case 'tinwhistle':ctx.strokeStyle='#c0c8d0';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(ex+f*1,my);ctx.lineTo(ex+f*8,my+1.5);ctx.stroke();ctx.fillStyle='#5a6068';ctx.beginPath();ctx.arc(ex+f*5,my+.6,.7,0,7);ctx.fill();break;
    case 'trailscarf':ctx.fillStyle='#b0503a';ctx.strokeStyle='#5a2418';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x-12,hy+4.5);ctx.quadraticCurveTo(x,hy+3.5,x+12,hy+4.5);ctx.lineTo(x+10,hy+11);
      ctx.quadraticCurveTo(x,hy+13,x-10,hy+11);ctx.closePath();ctx.fill();ctx.stroke();ctx.strokeStyle='rgba(255,255,255,.25)';ctx.beginPath();ctx.moveTo(x-9,hy+8);ctx.quadraticCurveTo(x,hy+9.5,x+9,hy+8);ctx.stroke();break;
    case 'windscarf':{const fl=Math.sin(now*4)*1.2;ctx.fillStyle='#7fc8d8';ctx.strokeStyle='#3a7888';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x-12,hy+4.5);ctx.quadraticCurveTo(x,hy+3.5,x+12,hy+4.5);ctx.lineTo(x+10,hy+10.5);
      ctx.quadraticCurveTo(x,hy+12.5,x-10,hy+10.5);ctx.closePath();ctx.fill();ctx.stroke();
      ctx.beginPath();ctx.moveTo(x-f*9,hy+8);ctx.quadraticCurveTo(x-f*16,hy+9+fl,x-f*21,hy+6+fl*1.6);ctx.lineTo(x-f*20,hy+10+fl);ctx.quadraticCurveTo(x-f*15,hy+12,x-f*8,hy+11);ctx.closePath();ctx.fill();ctx.stroke();break;}
    case 'emberpipe':ctx.strokeStyle='#a06a3a';ctx.lineWidth=1.8;ctx.beginPath();ctx.moveTo(ex+f*1,my);ctx.lineTo(ex+f*10,my+2.5);ctx.stroke();
      ctx.fillStyle=`rgba(255,${140+Math.sin(now*5)*40|0},60,.9)`;ctx.beginPath();ctx.arc(ex+f*10.5,my+2.7,1.4,0,7);ctx.fill();break;
  }
  ctx.restore();}
