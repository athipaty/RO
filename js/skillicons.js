"use strict";
/* ================= skill pictures: a round badge in the skill's colour with its own symbol ================= */
const SKILL_ICON_URL={};
function skillIconURL(id){if(SKILL_ICON_URL[id])return SKILL_ICON_URL[id];const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d');g.scale(2,2);
  try{drawSkillIcon(g,id);}catch(e){}return SKILL_ICON_URL[id]=c.toDataURL();}

function drawSkillIcon(g,id){const sk=SKILLS[id];if(!sk)return;const col=sk.col||'#c8c2b4',dk=shade(col,-.62),lt=shade(col,.45);
  // badge
  const gr=g.createRadialGradient(13,11,2,16,16,16);gr.addColorStop(0,shade(col,-.35));gr.addColorStop(1,dk);
  g.fillStyle=gr;g.beginPath();g.arc(16,16,15,0,7);g.fill();g.lineWidth=1.6;g.strokeStyle=col;g.stroke();
  g.lineJoin='round';g.lineCap='round';g.strokeStyle='#1a120a';g.lineWidth=1.3;
  const fill=(f,s)=>{g.fillStyle=f;g.fill();if(s!==false)g.stroke();};
  const path=pts=>{g.beginPath();pts.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));};
  const flame=(x,y,s,c1,c2)=>{g.beginPath();g.moveTo(x,y-9*s);g.quadraticCurveTo(x+8*s,y-1*s,x+5*s,y+5*s);g.quadraticCurveTo(x,y+9*s,x-5*s,y+5*s);g.quadraticCurveTo(x-8*s,y-1*s,x,y-9*s);fill(c1);
    g.beginPath();g.moveTo(x,y-3*s);g.quadraticCurveTo(x+4*s,y+2*s,x+2*s,y+5*s);g.quadraticCurveTo(x,y+6*s,x-2*s,y+5*s);g.quadraticCurveTo(x-4*s,y+2*s,x,y-3*s);fill(c2,false);};
  const arrow=(x1,y1,x2,y2,c,head)=>{g.strokeStyle='#e8dcb0';g.lineWidth=2;g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2);g.stroke();const a=Math.atan2(y2-y1,x2-x1);
    g.fillStyle=c||'#d0d6de';g.beginPath();g.moveTo(x2+Math.cos(a)*4,y2+Math.sin(a)*4);g.lineTo(x2+Math.cos(a+2.4)*4,y2+Math.sin(a+2.4)*4);g.lineTo(x2+Math.cos(a-2.4)*4,y2+Math.sin(a-2.4)*4);g.fill();
    g.strokeStyle='#c8463a';g.lineWidth=1.6;for(const k of [-.5,.5]){g.beginPath();g.moveTo(x1,y1);g.lineTo(x1-Math.cos(a+k)*4,y1-Math.sin(a+k)*4);g.stroke();}g.strokeStyle='#1a120a';g.lineWidth=1.3;};
  const shield=(c,em)=>{path([[8,7],[24,7],[24,16],[16,26],[8,16]]);g.closePath();fill(c);if(em)em();};
  const bolt=(x,y,s,c)=>{path([[x+1*s,y-10*s],[x-5*s,y+1*s],[x,y+1*s],[x-2*s,y+10*s],[x+6*s,y-2*s],[x+1*s,y-2*s]]);g.closePath();fill(c||'#fff6a0');};
  const sun=(r,c)=>{g.fillStyle=c;for(let i=0;i<12;i++){const a=i*Math.PI/6;g.beginPath();g.moveTo(16+Math.cos(a)*(r+2),16+Math.sin(a)*(r+2));g.lineTo(16+Math.cos(a+.18)*(r+7),16+Math.sin(a+.18)*(r+7));g.lineTo(16+Math.cos(a-.18)*(r+7),16+Math.sin(a-.18)*(r+7));g.fill();}
    g.beginPath();g.arc(16,16,r,0,7);fill(c);};
  const cross=(c,s)=>{s=s||1;g.beginPath();g.roundRect(16-2.5*s,16-8*s,5*s,16*s,1);fill(c);g.beginPath();g.roundRect(16-8*s,16-2.5*s,16*s,5*s,1);fill(c);};
  const slash=(c,n)=>{g.strokeStyle=c;g.lineWidth=2.6;for(let i=0;i<n;i++){g.beginPath();g.moveTo(9+i*4,24-i*1);g.quadraticCurveTo(14+i*4,14,22+i*3,7+i);g.stroke();}g.strokeStyle='#1a120a';g.lineWidth=1.3;};
  const blade=(rot,c)=>{g.save();g.translate(16,16);g.rotate(rot);path([[-1.8,-11],[0,-13],[1.8,-11],[1.8,4],[-1.8,4]]);g.closePath();fill(c||'#e8ecf2');g.beginPath();g.roundRect(-5,4,10,2.4,1);fill('#b8924f');g.beginPath();g.roundRect(-1.3,6.4,2.6,5,1);fill('#5a3d24');g.restore();};
  const eye=c=>{g.beginPath();g.moveTo(5,16);g.quadraticCurveTo(16,5,27,16);g.quadraticCurveTo(16,27,5,16);fill('#f4efe2');g.beginPath();g.arc(16,16,5,0,7);fill(c);g.fillStyle='#14100c';g.beginPath();g.arc(16,16,2.2,0,7);g.fill();};
  const heart=c=>{g.beginPath();g.moveTo(16,25);g.bezierCurveTo(3,16,8,5,16,11);g.bezierCurveTo(24,5,29,16,16,25);fill(c);};
  const spiral=c=>{g.strokeStyle=c;g.lineWidth=2.2;g.beginPath();for(let a=0;a<14;a+=.2){const r=1+a*.75;g.lineTo(16+Math.cos(a)*r,16+Math.sin(a)*r);}g.stroke();g.strokeStyle='#1a120a';g.lineWidth=1.3;};
  switch(id){
    case 'firstaid':cross('#7fd38a');break;
    case 'cleave':blade(.6);slash('#ffb070',1);break;
    case 'whirl':g.strokeStyle=lt;g.lineWidth=2.4;for(const r of [5,9,12.5]){g.beginPath();g.arc(16,16,r,r*.4,r*.4+4);g.stroke();}blade(-.4);break;
    case 'ironwill':shield('#b0b8c8',()=>{g.fillStyle='#e8c25a';g.beginPath();g.arc(16,15,2.5,0,7);g.fill();});break;
    case 'emberbolt':flame(16,17,1.15,'#ff7a2a','#ffd060');break;
    case 'frostnova':g.strokeStyle='#eaf6ff';g.lineWidth=2;for(let i=0;i<6;i++){const a=i*Math.PI/3;g.beginPath();g.moveTo(16,16);g.lineTo(16+Math.cos(a)*11,16+Math.sin(a)*11);g.stroke();
      for(const k of [-.5,.5]){g.beginPath();g.moveTo(16+Math.cos(a)*7,16+Math.sin(a)*7);g.lineTo(16+Math.cos(a)*7+Math.cos(a+k*2)*3,16+Math.sin(a)*7+Math.sin(a+k*2)*3);g.stroke();}}break;
    case 'arcstorm':bolt(16,16,1.1,'#fff6a0');g.fillStyle='rgba(200,176,255,.8)';for(const [x,y] of [[8,9],[24,22],[23,8]]){g.beginPath();g.arc(x,y,1.6,0,7);g.fill();}break;
    case 'twinshot':arrow(6,22,24,8);arrow(9,26,27,12);break;
    case 'arrowrain':for(const [x,y] of [[9,6],[16,9],[23,5],[12,15],[21,15]])arrow(x+3,y,x-1,y+10);break;
    case 'hawkeye':eye('#e0b040');break;
    case 'smite':g.fillStyle='rgba(255,246,190,.9)';g.beginPath();g.moveTo(12,3);g.lineTo(20,3);g.lineTo(23,28);g.lineTo(9,28);g.closePath();g.fill();cross('#fff0a0',.8);break;
    case 'mend':heart('#7fd38a');cross('#f4fff0',.45);break;
    case 'blessing':for(const k of [-1,1]){g.beginPath();g.moveTo(16,18);g.quadraticCurveTo(16+k*14,6,16+k*13,20);g.quadraticCurveTo(16+k*8,17,16,22);fill('#f8f2d8');}
      g.strokeStyle='#ffcf5a';g.lineWidth=2;g.beginPath();g.ellipse(16,8,6,2.2,0,0,7);g.stroke();break;
    case 'shieldbash':shield('#9aa6b8');g.strokeStyle='#ffe27a';g.lineWidth=2;for(const [a,b] of [[25,6],[28,12],[27,19]]){g.beginPath();g.moveTo(22,13);g.lineTo(a,b);g.stroke();}break;
    case 'bastion':path([[7,27],[7,10],[10,10],[10,6],[13,6],[13,10],[19,10],[19,6],[22,6],[22,10],[25,10],[25,27]]);g.closePath();fill('#c8ccd4');g.beginPath();g.roundRect(13,18,6,9,3);fill('#4a3a2e');break;
    case 'warcry':g.beginPath();g.arc(12,16,6,0,7);fill('#f6d6b8');g.beginPath();g.ellipse(14,18,2.4,3,0,0,7);fill('#5a2020');g.strokeStyle='#e8c25a';g.lineWidth=2;
      for(const r of [5,9]){g.beginPath();g.arc(18,16,r,-.8,.8);g.stroke();}break;
    case 'rendingblow':g.strokeStyle='#ff6a5a';g.lineWidth=3;for(const o of [-5,0,5]){g.beginPath();g.moveTo(9+o,7);g.quadraticCurveTo(14+o,16,11+o,26);g.stroke();}break;
    case 'frenzy':flame(16,18,1.1,'#d0402a','#ff9a5a');g.fillStyle='#fff';for(const x of [13,19]){g.beginPath();g.moveTo(x-2,15);g.lineTo(x+2,17);g.lineTo(x-2,17);g.fill();}break;
    case 'earthshatter':path([[3,22],[29,22],[29,28],[3,28]]);g.closePath();fill('#8a6a3a');g.strokeStyle='#ffd27a';g.lineWidth=1.8;
      g.beginPath();g.moveTo(16,22);g.lineTo(13,26);g.moveTo(16,22);g.lineTo(20,27);g.stroke();g.strokeStyle='#1a120a';g.lineWidth=1.3;
      for(const [x,y,s] of [[10,13,3],[20,10,4],[15,6,2.5]]){path([[x-s,y],[x,y-s],[x+s,y],[x,y+s]]);g.closePath();fill('#c8964a');}break;
    case 'glaciallance':g.save();g.translate(16,16);g.rotate(Math.PI/4);path([[0,-14],[3.5,-3],[1.5,12],[-1.5,12],[-3.5,-3]]);g.closePath();fill('#bfe6ff');g.strokeStyle='#fff';g.beginPath();g.moveTo(0,-12);g.lineTo(0,10);g.stroke();g.restore();break;
    case 'cinderfall':g.strokeStyle='rgba(255,160,80,.8)';g.lineWidth=2.5;for(const o of [0,4]){g.beginPath();g.moveTo(26-o,4+o);g.lineTo(17-o,13+o);g.stroke();}
      g.beginPath();g.arc(13,19,6.5,0,7);fill('#e0502a');g.fillStyle='#ffcf5a';g.beginPath();g.arc(11.5,17.5,2.5,0,7);g.fill();break;
    case 'manasurge':{const gr2=g.createRadialGradient(16,16,1,16,16,9);gr2.addColorStop(0,'#fff');gr2.addColorStop(1,'#7a9cff');g.beginPath();g.arc(16,16,8,0,7);fill(gr2);
      g.strokeStyle='#cfe0ff';g.lineWidth=1.8;for(let i=0;i<3;i++){const a=i*2.1;g.beginPath();g.arc(16,16,12,a,a+1.2);g.stroke();}break;}
    case 'shadowlance':g.save();g.translate(16,16);g.rotate(-Math.PI/4);path([[0,-14],[3.5,-4],[1.5,12],[-1.5,12],[-3.5,-4]]);g.closePath();fill('#2a1a3a');g.restore();
      g.fillStyle='rgba(197,140,255,.85)';for(const [x,y] of [[9,22],[23,9],[21,23]]){g.beginPath();g.arc(x,y,1.5,0,7);g.fill();}break;
    case 'hexofsloth':spiral('#c58cff');break;
    case 'soulsiphon':g.beginPath();g.arc(16,14,8,0,7);fill('#e8e0d0');g.beginPath();g.roundRect(11,18,10,6,2);fill('#e8e0d0');
      g.fillStyle='#2a1a3a';for(const x of [12.5,19.5]){g.beginPath();g.arc(x,14,2.4,0,7);g.fill();}g.strokeStyle='#c58cff';g.lineWidth=1.6;g.beginPath();g.arc(16,16,13,3.6,5.8);g.stroke();break;
    case 'piercingshot':g.beginPath();g.arc(21,16,6,0,7);fill('#f4efe2');g.beginPath();g.arc(21,16,3,0,7);fill('#c8463a');arrow(3,16,29,16,'#ffe08a');break;
    case 'trueaim':g.strokeStyle='#f0d070';g.lineWidth=2;g.beginPath();g.arc(16,16,9,0,7);g.stroke();for(const [a,b,c,d] of [[16,3,16,10],[16,22,16,29],[3,16,10,16],[22,16,29,16]]){g.beginPath();g.moveTo(a,b);g.lineTo(c,d);g.stroke();}
      g.fillStyle='#ff6a5a';g.beginPath();g.arc(16,16,2,0,7);g.fill();break;
    case 'volley':for(const [x,y] of [[6,8],[11,5],[16,8],[21,5],[8,15],[14,14],[20,15],[25,12]])arrow(x+2,y,x-1,y+8);break;
    case 'venomarrow':arrow(5,25,25,7,'#9be38a');g.fillStyle='#7fd36a';for(const [x,y] of [[22,15],[25,20],[19,20]]){g.beginPath();g.moveTo(x,y-3);g.quadraticCurveTo(x+2.5,y,x,y+2);g.quadraticCurveTo(x-2.5,y,x,y-3);g.fill();}break;
    case 'snareshot':g.strokeStyle='#d8c080';g.lineWidth=1.4;g.beginPath();g.arc(16,17,10,0,7);g.stroke();for(const o of [-6,0,6]){g.beginPath();g.moveTo(16+o,7.5);g.lineTo(16+o,26.5);g.stroke();g.beginPath();g.moveTo(6.5,17+o);g.lineTo(25.5,17+o);g.stroke();}break;
    case 'swiftstep':path([[9,9],[15,9],[15,19],[23,22],[23,26],[9,26]]);g.closePath();fill('#8a5a3a');for(const y of [10,14]){g.beginPath();g.moveTo(15,y);g.quadraticCurveTo(24,y-6,28,y-3);g.quadraticCurveTo(23,y,15,y+3);fill('#f4f0e6');}break;
    case 'crusade':blade(.75,'#fff6d0');g.strokeStyle='#ffe27a';g.lineWidth=2;g.beginPath();g.ellipse(16,16,12,12,0,0,7);g.stroke();break;
    case 'holyaegis':shield('#f0e0a0',()=>{cross('#c8463a',.5);});break;
    case 'judgment':g.save();g.translate(16,16);g.rotate(-.5);g.beginPath();g.roundRect(-1.5,-2,3,14,1);fill('#8a6a3a');g.beginPath();g.roundRect(-7,-9,14,8,2);fill('#ffe27a');g.restore();
      g.strokeStyle='#fff6c0';g.lineWidth=1.6;for(const [a,b] of [[25,5],[28,11],[22,3]]){g.beginPath();g.moveTo(21,9);g.lineTo(a,b);g.stroke();}break;
    case 'sanctuary':g.strokeStyle='#9fffc0';g.lineWidth=2;g.beginPath();g.ellipse(16,22,12,4,0,0,7);g.stroke();g.fillStyle='rgba(159,255,192,.35)';g.beginPath();g.moveTo(5,22);g.lineTo(9,6);g.lineTo(23,6);g.lineTo(27,22);g.fill();cross('#e8fff0',.55);break;
    case 'radiance':sun(6,'#fff6c0');break;
    case 'divinegrace':g.beginPath();g.moveTo(9,25);g.quadraticCurveTo(10,10,24,5);g.quadraticCurveTo(21,18,9,25);fill('#e8f4ff');g.strokeStyle='#7fd3ff';g.beginPath();g.moveTo(9,25);g.quadraticCurveTo(15,15,22,7);g.stroke();break;
    default:g.fillStyle=lt;g.font='800 16px sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(sk.g||'?',16,17);}
}
