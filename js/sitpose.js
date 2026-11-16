"use strict";
/* ================= every calling sits its own way =================
   sitPoseOf(cls) gives the sitting pose: legs (shape), hands ([front dx,dy],[back dx,dy] from x and the belt line),
   hip (how far the body sinks; 6 = on the ground), lean (+ forward), lift (floats, px) and fx (a small effect).
   First jobs and each advanced calling have their own; a master calling sits like its advanced calling with its
   glow around it. Riding a mount keeps the plain riding seat. drawSitLegs draws the legs for both art versions. */
const SIT_POSE={
  novice:{legs:'cross',hands:[[9,3],[-9,3]]},
  warden:{legs:'stretch',hands:[[7,1],[-10,6]],lean:-.12},
  arcanist:{legs:'lotus',hands:[[2.5,2.5],[-1.5,2.8]],lift:4,fx:'sparkle'},
  ranger:{legs:'knees',hands:[[6,-1],[-2,0]],hip:5},
  cleric:{legs:'seiza',hands:[[2.6,-4],[-1.2,-3.8]],hip:4},
  bulwark:{legs:'cross',hands:[[4,-5],[-3,-4.5]],fx:'shield'},
  ravager:{legs:'wide',hands:[[12,7],[-12,7]],lean:-.18},
  runeguard:{legs:'kneel',hands:[[8,-1],[-8,3]],hip:3,fx:'runes'},
  stormcaller:{legs:'cross',hands:[[9,-12],[-8,3]],lift:3,fx:'sparks'},
  hexweaver:{legs:'side',hands:[[7,2],[-11,7]],fx:'wisps'},
  chronomancer:{legs:'lotus',hands:[[3,1.5],[-3,1.5]],lift:4,fx:'clock'},
  sharpshooter:{legs:'kneel',hands:[[8,-2],[2,-1]],hip:3,lean:.08},
  wildstalker:{legs:'squat',hands:[[9,7],[-4,7]],hip:2,lean:.16},
  falconer:{legs:'knees',hands:[[7,-11],[-2,0]],hip:5},
  templar:{legs:'kneel',hands:[[1.5,-6],[-8,2]],hip:2},
  oracle:{legs:'seiza',hands:[[7,-6],[-7,-6]],hip:4,lift:3,fx:'halo'},
  ascetic:{legs:'lotus',hands:[[9,2.5],[-9,2.5]],fx:'calm'}};
function sitPoseOf(cls){const adv=typeof hitAdvOf==='function'?hitAdvOf(cls):cls,fam=typeof baseOf==='function'?baseOf(cls):'novice';
  const s=SIT_POSE[adv]||SIT_POSE[fam]||SIT_POSE.novice;return {...s,master:typeof hitIsMaster==='function'&&hitIsMaster(cls)};}
// the legs of each pose (x, y = ground under the hero, f = facing), drawn where the classic cross-legged legs were
function drawSitLegs(x,y,f,S,pant,boot){const OL='#2a1c14';ctx.lineWidth=1.5;ctx.strokeStyle=OL;
  const ell=(cx,cy,rx,ry,r,col)=>{ctx.fillStyle=col;ctx.beginPath();ctx.ellipse(cx,cy,rx,ry,r||0,0,7);ctx.fill();ctx.stroke();};
  switch(S.legs){
    case 'lotus':for(const k of [-1,1])ell(x+k*5,y-2.5,7,3.2,k*.12,pant);for(const k of [-1,1])ell(x+k*3,y-4,2.6,1.8,0,boot);break;
    case 'stretch':for(const [o,dy] of [[0,-.5],[1,-2.5]]){ell(x+f*(7+o),y+dy,9,3.2,0,pant);ctx.save();ell(x+f*(16+o),y+dy-2.5,2.4,3.6,0,boot);ctx.restore();}break;
    case 'wide':for(const k of [-1,1]){ell(x+k*10,y-2,9,3.2,k*.35,pant);ell(x+k*17,y-3,2.4,3.4,0,boot);}break;
    case 'kneel':ell(x-f*6,y-2,7,3,0,pant);ell(x-f*12,y-1.5,3.2,2.2,0,boot);                        // back leg kneeling on the ground
      ctx.fillStyle=pant;ctx.beginPath();ctx.roundRect(x+f*3-3.2,y-12,6.4,7,3);ctx.fill();ctx.stroke(); // front thigh to the raised knee
      ctx.beginPath();ctx.roundRect(x+f*5-3,y-8,6,8,2.5);ctx.fill();ctx.stroke();ell(x+f*6,y-.8,3.6,2.4,0,boot);break;
    case 'seiza':ell(x-f*2,y-1,4,2,0,boot);ell(x,y-2.5,9,3.8,0,pant);ctx.fillStyle='rgba(0,0,0,.12)';ctx.beginPath();ctx.ellipse(x+f*4,y-2.5,3,2,0,0,7);ctx.fill();break;
    case 'knees':for(const k of [-1,1]){ctx.fillStyle=pant;ctx.beginPath();ctx.roundRect(x+k*4.5+f*3-3.2,y-13,6.4,12,3.2);ctx.fill();ctx.stroke();ell(x+k*4.5+f*4,y-.8,3.4,2.2,0,boot);}break;
    case 'squat':for(const k of [-1,1]){ctx.fillStyle=pant;ctx.beginPath();ctx.roundRect(x+k*5+f*2-3.2,y-11,6.4,10,3.2);ctx.fill();ctx.stroke();ell(x+k*5+f*3,y-.8,3.6,2.3,0,boot);}break;
    case 'side':ell(x-f*7,y-2.5,9,3.4,-f*.15,pant);ell(x-f*15,y-1.5,3.4,2.2,0,boot);ell(x-f*2,y-1,6,2.6,0,pant);break;
    default:for(const k of [-1,1])ell(x+k*7,y-2.5,6.5,3.6,k*.18,pant);for(const k of [-1,1])ell(x+k*2.5,y,3.4,2.4,0,boot);}}
// small effects around a sitting hero (drawn after the body; ly = how far the hero floats)
function drawSitFx(p,S,ly){const x=p.x,y=p.y-ly,t=typeof now==='number'?now:0,f=p.face<0?-1:1;ctx.save();
  try{switch(S.fx){
    case 'sparkle':for(let i=0;i<4;i++){const k=(t*.5+i/4)%1;ctx.fillStyle=`rgba(220,200,255,${.8*(1-k)})`;ctx.beginPath();ctx.arc(x+Math.sin(t+i*2)*9,y-12-k*18,1.1,0,7);ctx.fill();}break;
    case 'sparks':{const hx=x+f*9,hy=y-25;for(let i=0;i<3;i++){const a=t*7+i*2.1;ctx.strokeStyle='rgba(255,240,140,.9)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(hx,hy);ctx.lineTo(hx+Math.cos(a)*5,hy+Math.sin(a)*5);ctx.lineTo(hx+Math.cos(a+.4)*8,hy+Math.sin(a+.4)*7);ctx.stroke();}break;}
    case 'wisps':for(let i=0;i<3;i++){const k=(t*.4+i/3)%1;ctx.fillStyle=`rgba(110,60,150,${.5*(1-k)})`;ctx.beginPath();ctx.ellipse(x+Math.sin(t*1.3+i*2)*12,y-4-k*16,3-k*1.5,4-k*2,0,0,7);ctx.fill();}break;
    case 'clock':{ctx.strokeStyle='rgba(232,208,144,.75)';ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(x,y-10,16,6,0,0,7);ctx.stroke();
      for(let i=0;i<12;i++){const a=i/12*Math.PI*2+t*.6;ctx.fillStyle='rgba(232,208,144,.9)';ctx.fillRect(x+Math.cos(a)*16-.6,y-10+Math.sin(a)*6-.6,1.2,1.2);}
      const h=t*1.5;ctx.strokeStyle='rgba(255,240,190,.9)';ctx.beginPath();ctx.moveTo(x,y-10);ctx.lineTo(x+Math.cos(h)*10,y-10+Math.sin(h)*3.6);ctx.stroke();break;}
    case 'runes':for(let i=0;i<3;i++){const a=t*1.2+i*2.09,rx=x+Math.cos(a)*15,ry=y-12+Math.sin(a)*5;ctx.strokeStyle='rgba(122,208,255,.9)';ctx.lineWidth=1;
      ctx.beginPath();ctx.moveTo(rx-2,ry-2.5);ctx.lineTo(rx+2,ry-2.5);ctx.lineTo(rx,ry+2.5);ctx.closePath();ctx.stroke();}break;
    case 'shield':{const sx=x-f*15,sy=p.y-3;ctx.fillStyle='#9aa0aa';ctx.strokeStyle='#2a1c14';ctx.lineWidth=1.5;ctx.beginPath();ctx.roundRect(sx-6,sy-18,12,18,3);ctx.fill();ctx.stroke();
      ctx.fillStyle='#e8c25a';ctx.beginPath();ctx.arc(sx,sy-9,2.4,0,7);ctx.fill();break;}
    case 'halo':{const g=ctx.createRadialGradient(x,y-20,2,x,y-20,20);g.addColorStop(0,'rgba(255,250,220,.35)');g.addColorStop(1,'rgba(255,250,220,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y-20,20,0,7);ctx.fill();break;}
    case 'calm':{const k=(Math.sin(t*1.5)+1)/2;ctx.strokeStyle=`rgba(255,200,140,${.25+k*.25})`;ctx.lineWidth=1.2;ctx.beginPath();ctx.ellipse(x,p.y,14+k*3,4.5+k,0,0,7);ctx.stroke();break;}}
    // a master calling's glow
    if(S.master){const k=(Math.sin(t*2)+1)/2,g=ctx.createRadialGradient(x,y-14,3,x,y-14,26);g.addColorStop(0,`rgba(255,231,160,${.18+k*.12})`);g.addColorStop(1,'rgba(255,231,160,0)');
      ctx.globalCompositeOperation='lighter';ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y-14,26,0,7);ctx.fill();}}
  finally{ctx.restore();}}
