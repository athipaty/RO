"use strict";
/* ================= gear pictures: weapons, armour, accessories and the last hats get their own look (v1.45.8) =================
   Before, many pieces shared one drawing: every accessory without its own case was the same pendant, the five swords
   were one sword, the Aurel set looked like the starter gear, and four hats (Scarecrow Hat, Molten Crown, Glowsilk Hood,
   Arcane Circlet) had no drawing at all, so they were invisible on the hero and their icon was a bare head. */
{
const gp=(g,f,s)=>{g.fillStyle=f;g.fill();if(s!==false){g.strokeStyle=OL;g.lineWidth=1.6;g.stroke();}};
const gpoly=(g,pts)=>{g.beginPath();pts.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();};
const gline=(g,col,w,f)=>{g.strokeStyle=col;g.lineWidth=w;g.beginPath();f();g.stroke();g.lineWidth=1.6;g.strokeStyle=OL;};
const gshine=(g,x,y,rx,ry,a)=>{g.fillStyle='rgba(255,255,255,.65)';g.beginPath();g.ellipse(x,y,rx,ry,a||0,0,7);g.fill();};
const gem=(g,x,y,r,col)=>{g.beginPath();g.arc(x,y,r,0,7);gp(g,col);gshine(g,x-r*.35,y-r*.35,r*.35,r*.25);};
const star=(g,x,y,R,r,n)=>{g.beginPath();for(let i=0;i<n*2;i++){const a=-Math.PI/2+i*Math.PI/n,k=i%2?r:R;g.lineTo(x+Math.cos(a)*k,y+Math.sin(a)*k);}g.closePath();};
const GOLD='#e8c25a',GOLD2='#b8923a';
// weapons are drawn pointing up in a frame turned 45°, like the base icons (length about -16..16)
const tilt=(g,f)=>{g.save();g.translate(16,16);g.rotate(-Math.PI/4);try{f();}finally{g.restore();}};
const hilt=(g,y,gw,grip,pommel)=>{g.beginPath();g.roundRect(-gw/2,y,gw,3,1);gp(g,GOLD2);g.beginPath();g.roundRect(-1.8,y+3,3.6,6,1);gp(g,grip);g.beginPath();g.arc(0,y+10,2,0,7);gp(g,pommel);};
const bow=(g,wood,string,deco)=>{g.save();g.translate(16,16);g.rotate(Math.PI/4);
  const tip=13.5;gline(g,string,1,()=>{g.moveTo(-3,-tip);g.lineTo(-3,tip);});
  g.beginPath();g.moveTo(-3,-tip);g.quadraticCurveTo(1,-tip+1,3,-8);g.quadraticCurveTo(7,0,3,8);g.quadraticCurveTo(1,tip-1,-3,tip);
  g.lineTo(-2,tip-2.5);g.quadraticCurveTo(0,tip-3,1,8);g.quadraticCurveTo(4.5,0,1,-8);g.quadraticCurveTo(0,-tip+3,-2,-tip+2.5);g.closePath();gp(g,wood);
  g.beginPath();g.roundRect(2.5,-3,3.4,6,1);gp(g,'#5a3d24');if(deco)deco(g);g.restore();};

const GEAR_ART={
  // ---------- swords ----------
  bastion:g=>tilt(g,()=>{g.beginPath();g.moveTo(-4,-12);g.lineTo(0,-16);g.lineTo(4,-12);g.lineTo(4,4);g.lineTo(-4,4);g.closePath();gp(g,'#c8ccd4');
    gline(g,'#8a909c',1.2,()=>{g.moveTo(0,-13);g.lineTo(0,3);});g.beginPath();g.roundRect(-8,4,16,3.4,1);gp(g,'#6a7488');
    g.beginPath();g.roundRect(-1.8,7.4,3.6,6,1);gp(g,'#2a4a7a');g.beginPath();g.arc(0,14.6,2.2,0,7);gp(g,'#6a7488');}),
  fangblade:g=>tilt(g,()=>{g.beginPath();g.moveTo(-2.6,4);g.lineTo(-2.6,-12);g.lineTo(0,-16);g.lineTo(3,-12);
    for(let y=-10;y<3;y+=3.2){g.lineTo(5,y+1);g.lineTo(3,y+2.6);}g.lineTo(3,4);g.closePath();gp(g,'#bfe6ff');
    gline(g,'#ffffff',1,()=>{g.moveTo(-1,-12);g.lineTo(-1,2);});hilt(g,4,13,'#2a4a6a','#9fd6ff');}),
  twinfang:g=>{for(const s of [-1,1]){g.save();g.translate(16,16);g.rotate(s*Math.PI/4);
    g.beginPath();g.moveTo(-1.8,4);g.quadraticCurveTo(-3,-6,s*2,-15);g.quadraticCurveTo(3.6,-5,1.8,4);g.closePath();gp(g,'#d8dce4');
    g.beginPath();g.roundRect(-4,4,8,2.4,1);gp(g,'#8a6a9a');g.beginPath();g.roundRect(-1.5,6.4,3,6,1);gp(g,'#3a2a4a');g.restore();}},
  aurelblade:g=>tilt(g,()=>{g.beginPath();g.moveTo(-2.6,-13);g.lineTo(0,-16.5);g.lineTo(2.6,-13);g.lineTo(2.6,5);g.lineTo(-2.6,5);g.closePath();gp(g,'#f0f2f6');
    gline(g,GOLD,1.2,()=>{g.moveTo(0,-12);g.lineTo(0,4);});
    g.beginPath();g.moveTo(-9,3);g.quadraticCurveTo(-5,7,0,5);g.quadraticCurveTo(5,7,9,3);g.lineTo(7,8);g.lineTo(-7,8);g.closePath();gp(g,GOLD);
    g.beginPath();g.roundRect(-1.8,8,3.6,5.5,1);gp(g,'#7a2a3a');gem(g,0,6,1.8,'#e04a6a');g.beginPath();g.arc(0,15,2.2,0,7);gp(g,GOLD);}),
  // ---------- axes ----------
  splitter:g=>tilt(g,()=>{g.beginPath();g.roundRect(-2,-12,4,28,1.5);gp(g,'#5a3d24');
    for(const s of [-1,1]){g.beginPath();g.moveTo(s*1.5,-13);g.quadraticCurveTo(s*14,-15,s*12,-1);g.quadraticCurveTo(s*7,-5,s*1.5,-3);g.closePath();gp(g,'#8a8478');}
    gline(g,'#5a5448',1.2,()=>{g.moveTo(-8,-9);g.lineTo(-5,-5);g.moveTo(8,-9);g.lineTo(5,-5);});gem(g,0,-8,2,'#c8784a');}),
  aurelaxe:g=>tilt(g,()=>{g.beginPath();g.roundRect(-1.6,-12,3.2,27,1);gp(g,'#7a2a3a');for(const y of [2,7,12]){g.beginPath();g.roundRect(-2.2,y,4.4,1.6,.6);gp(g,GOLD,false);}
    g.beginPath();g.moveTo(1,-13);g.quadraticCurveTo(15,-12,12,2);g.quadraticCurveTo(7,-3,1,-1);g.closePath();gp(g,'#f0f2f6');
    gline(g,GOLD,1.6,()=>{g.moveTo(3,-11);g.quadraticCurveTo(12,-10,10,-1);});
    g.beginPath();g.moveTo(-1,-13);g.quadraticCurveTo(-8,-9,-7,-3);g.lineTo(-1,-4);g.closePath();gp(g,GOLD);gem(g,0,-8,1.8,'#e04a6a');}),
  // ---------- staves ----------
  rod:g=>tilt(g,()=>{g.beginPath();g.roundRect(-1.6,-5,3.2,20,1.5);gp(g,'#4a3a6a');star(g,0,-10,7,3,5);gp(g,'#ffd86a');
    g.beginPath();g.arc(0,-10,2,0,7);g.fillStyle='#fff6c0';g.fill();gline(g,'#a98dd8',1.4,()=>{g.arc(0,-10,9,.3,2.2);});}),
  corerod:g=>tilt(g,()=>{g.beginPath();g.roundRect(-1.6,-6,3.2,21,1.5);gp(g,'#3a2a2a');
    const gr=g.createRadialGradient(-1,-11,1,0,-10,6);gr.addColorStop(0,'#fff2b0');gr.addColorStop(.5,'#f08a3a');gr.addColorStop(1,'#c83a1a');g.beginPath();g.arc(0,-10,5,0,7);gp(g,gr);
    gline(g,'#5a4a42',1.8,()=>{for(const s of [-1,1]){g.moveTo(s*1.2,-5);g.quadraticCurveTo(s*7,-8,s*4,-15);}});}),
  aurelstaff:g=>tilt(g,()=>{g.beginPath();g.roundRect(-1.6,-7,3.2,23,1.5);gp(g,'#f4efe2');for(const y of [0,8]){g.beginPath();g.roundRect(-2.4,y,4.8,2,.8);gp(g,GOLD,false);}
    star(g,0,-11,8,4.5,8);gp(g,GOLD);gem(g,0,-11,3,'#6a9ae0');}),
  // ---------- bows ----------
  longbow:g=>bow(g,'#5a8a4a','#eee',g=>{for(const s of [-1,1]){g.beginPath();g.roundRect(2.5,s*6-1,3.6,2,.8);gp(g,'#b8924f',false);}}),
  needlebow:g=>bow(g,'#4e8a3d','#e8e0c8',g=>{g.fillStyle='#f4efe2';for(const [x,y] of [[3.5,-9],[5,-4],[5,4],[3.5,9]]){g.beginPath();g.moveTo(x,y-1.2);g.lineTo(x+4,y);g.lineTo(x,y+1.2);g.closePath();g.fill();g.strokeStyle=OL;g.lineWidth=.8;g.stroke();}}),
  galebow:g=>bow(g,'#7ab8c8','#ffffff',g=>{gline(g,'#e8f6ff',1.4,()=>{g.moveTo(8,-6);g.quadraticCurveTo(12,-2,9,1);g.moveTo(9,4);g.quadraticCurveTo(13,7,10,10);});
    for(const s of [-1,1]){g.beginPath();g.ellipse(-3.5,s*14.5,1.4,3,s*.5,0,7);gp(g,'#f4f4f0');}}),
  aurelbow:g=>bow(g,GOLD,'#fff6d8',g=>{gem(g,4.2,0,1.8,'#e04a6a');for(const s of [-1,1]){g.beginPath();g.arc(-3,s*13.5,1.6,0,7);gp(g,'#f4efe2');}}),
  // ---------- maces ----------
  sunmace:g=>tilt(g,()=>{g.beginPath();g.roundRect(-1.6,-4,3.2,19,1);gp(g,'#8a6a3a');star(g,0,-9,9,5.5,8);gp(g,'#ffcf5a');g.beginPath();g.arc(0,-9,4,0,7);gp(g,'#fff0a0');}),
  trollmaul:g=>tilt(g,()=>{g.beginPath();g.roundRect(-2,-6,4,22,1.5);gp(g,'#6b4a2a');g.beginPath();g.roundRect(-8,-16,16,11,3);gp(g,'#6a7a5a');
    gline(g,'#4a5a3a',1.2,()=>{g.moveTo(-5,-13);g.lineTo(-2,-11);g.moveTo(3,-14);g.lineTo(5,-9);});gline(g,'#c8b890',2,()=>{g.moveTo(-8,-8);g.lineTo(8,-8);});}),
  dawnmace:g=>tilt(g,()=>{g.beginPath();g.roundRect(-1.6,-4,3.2,19,1);gp(g,'#f4efe2');
    for(const s of [-1,1]){g.beginPath();g.moveTo(s*3,-9);g.quadraticCurveTo(s*12,-14,s*11,-5);g.quadraticCurveTo(s*8,-6,s*3,-5);g.closePath();gp(g,'#ffffff');}
    const gr=g.createRadialGradient(-1,-10,1,0,-8,6);gr.addColorStop(0,'#ffffff');gr.addColorStop(1,'#f0d070');g.beginPath();g.arc(0,-8,5.5,0,7);gp(g,gr);}),
  aurelmace:g=>tilt(g,()=>{g.beginPath();g.roundRect(-1.6,-5,3.2,20,1);gp(g,'#7a2a3a');g.beginPath();g.roundRect(-9,-15,18,10,2);gp(g,GOLD);
    for(const s of [-1,1]){g.beginPath();g.roundRect(s>0?7:-10,-16,3,12,1);gp(g,GOLD2);}star(g,0,-10,4,2,8);gp(g,'#fff0a0');}),
  // ---------- daggers ----------
  nightfang:g=>tilt(g,()=>{g.beginPath();g.moveTo(-2,5);g.quadraticCurveTo(-3,-6,3,-14);g.quadraticCurveTo(2,-4,2.2,5);g.closePath();gp(g,'#4a3a6a');
    gline(g,'#c8b0f0',1,()=>{g.moveTo(-.8,3);g.quadraticCurveTo(-1.2,-5,2,-11);});g.beginPath();g.roundRect(-5,5,10,2.4,1);gp(g,'#2a2238');
    g.beginPath();g.roundRect(-1.6,7.4,3.2,6,1);gp(g,'#1a1428');gem(g,0,14.4,1.8,'#c58cff');}),
  aureldagger:g=>tilt(g,()=>{g.beginPath();g.moveTo(-1.3,5);g.lineTo(0,-16);g.lineTo(1.3,5);g.closePath();gp(g,'#f0f2f6');
    g.beginPath();g.moveTo(-6,7);g.quadraticCurveTo(0,3,6,7);g.lineTo(6,5);g.quadraticCurveTo(0,1,-6,5);g.closePath();gp(g,GOLD);
    g.beginPath();g.roundRect(-1.6,7.4,3.2,6,1);gp(g,'#7a2a3a');gem(g,0,14.4,1.8,'#e04a6a');}),
};

// ---------- armour ----------
const shirt=(g,c,long,sl)=>{const b=long?29:26,s=sl||0;g.beginPath();g.moveTo(9,5);g.lineTo(13,4);g.quadraticCurveTo(16,8,19,4);g.lineTo(23,5);g.lineTo(29+s,10);g.lineTo(25+s,15);g.lineTo(23,13);
  g.lineTo(23,b);g.lineTo(9,b);g.lineTo(9,13);g.lineTo(7-s,15);g.lineTo(3-s,10);g.closePath();gp(g,c);};
const pauldron=(g,c)=>{for(const x of [7,25]){g.beginPath();g.ellipse(x,9,5.5,4.5,0,0,7);gp(g,c);}};
Object.assign(GEAR_ART,{
  lupevest:(g,c)=>{shirt(g,'#8a6a4a');g.beginPath();for(let i=0;i<=8;i++){const x=7+i*2.25;g.lineTo(x,i%2?8:4);}g.lineTo(25,10);g.quadraticCurveTo(16,14,7,10);g.closePath();gp(g,c);
    gline(g,shade(c,-.3),1,()=>{for(const x of [10,14,18,22]){g.moveTo(x,6);g.lineTo(x+1,9);}});gline(g,'#5a3d24',1.2,()=>{g.moveTo(16,12);g.lineTo(16,26);});},
  carapacemail:(g,c)=>{shirt(g,shade(c,-.25));for(const [y,h] of [[10,6],[16,5],[21,5]]){g.beginPath();g.roundRect(10,y,12,h,2.5);gp(g,c);}
    pauldron(g,c);gshine(g,6,7.5,2,1.2,-.3);gshine(g,13,12,2,1,0);},
  mendstole:(g,c)=>{shirt(g,c,true);for(const s of [-1,1]){g.beginPath();g.moveTo(16+s*2,5);g.lineTo(16+s*5,5);g.lineTo(16+s*5,29);g.lineTo(16+s*2,29);g.closePath();gp(g,'#4a7ac8');}
    g.fillStyle=GOLD;for(const s of [-1,1])for(const y of [12,22]){const x=16+s*3.5;g.fillRect(x-.6,y-2,1.2,4);g.fillRect(x-2,y-.6,4,1.2);}},
  stonewall:(g,c)=>{shirt(g,c,false,1);g.beginPath();g.roundRect(11,9,10,15,3);gp(g,shade(c,.2));
    for(const x of [6,26]){g.beginPath();g.ellipse(x,10,6.5,5,0,Math.PI,0);g.lineTo(x+6.5,12);g.lineTo(x-6.5,12);g.closePath();gp(g,shade(c,-.1));}
    g.fillStyle='#4a4438';for(const [x,y] of [[12.5,11],[19.5,11],[12.5,22],[19.5,22],[3,11],[29,11]]){g.beginPath();g.arc(x,y,.9,0,7);g.fill();}
    gline(g,shade(c,-.35),1.2,()=>{g.moveTo(11,16.5);g.lineTo(21,16.5);});},
  aurelplate:(g,c)=>{shirt(g,'#f0f2f6');g.beginPath();g.moveTo(10,8);g.quadraticCurveTo(16,11,22,8);g.lineTo(22,20);g.quadraticCurveTo(16,26,10,20);g.closePath();gp(g,'#e4e8ee');
    pauldron(g,GOLD);gline(g,GOLD,2,()=>{g.moveTo(9,25);g.lineTo(23,25);});star(g,16,15,4.5,2,4);gp(g,GOLD);gem(g,16,15,1.4,'#e04a6a');},
  aurelmantle:(g,c)=>{g.beginPath();g.moveTo(9,6);g.quadraticCurveTo(3,18,5,29);g.lineTo(27,29);g.quadraticCurveTo(29,18,23,6);g.closePath();gp(g,c);
    gline(g,shade(c,-.25),1.1,()=>{for(const x of [10,16,22]){g.moveTo(x,10);g.quadraticCurveTo(x-1,20,x,28);}});
    gline(g,GOLD,2,()=>{g.moveTo(5,28);g.lineTo(27,28);});g.beginPath();g.moveTo(8,4);g.quadraticCurveTo(16,11,24,4);g.lineTo(23,8);g.quadraticCurveTo(16,13,9,8);g.closePath();gp(g,'#f4efe2');
    gem(g,16,10,2.4,GOLD);},
});

// ---------- accessories ----------
const chain=(g,y)=>gline(g,'#d9c79a',1.4,()=>{g.moveTo(6,3);g.quadraticCurveTo(16,(y||12)+2,26,3);});
const band=(g,c,inner)=>{g.lineWidth=4.5;g.strokeStyle=c;g.beginPath();g.ellipse(16,19,8,7,0,0,7);g.stroke();g.lineWidth=1.4;g.strokeStyle=OL;
  g.beginPath();g.ellipse(16,19,10.3,9.3,0,0,7);g.stroke();g.beginPath();g.ellipse(16,19,5.7,4.7,0,0,7);g.stroke();if(inner)inner(g);g.lineWidth=1.6;};
const clover=(g,c,n)=>{gline(g,'#3f7d34',2,()=>{g.moveTo(16,17);g.quadraticCurveTo(19,24,15,30);});
  for(let i=0;i<n;i++){const a=-Math.PI/2+i*Math.PI*2/n+(n===3?0:Math.PI/4);g.save();g.translate(16+Math.cos(a)*5.5,15+Math.sin(a)*5.5);g.rotate(a+Math.PI/2);
    g.beginPath();g.moveTo(0,5);g.bezierCurveTo(-8,0,-4,-7,0,-3);g.bezierCurveTo(4,-7,8,0,0,5);gp(g,c);g.restore();}};
Object.assign(GEAR_ART,{
  hopcharm:(g,c)=>{chain(g,8);g.beginPath();g.arc(16,10,2.6,0,7);gp(g,GOLD);
    for(const [a,col] of [[-.35,'#e8a04a'],[0,'#f4efe2'],[.35,'#c86a3a']]){g.save();g.translate(16,12);g.rotate(a);g.beginPath();g.ellipse(0,9,3,9,0,0,7);gp(g,col);
      gline(g,shade(col,-.35),1,()=>{g.moveTo(0,1);g.lineTo(0,17);});g.restore();}},
  queenamulet:(g,c)=>{chain(g);g.beginPath();g.ellipse(16,21,6,7.5,0,0,7);gp(g,c);g.beginPath();g.ellipse(16,13,3.6,2.8,0,0,7);gp(g,shade(c,-.3));
    for(const s of [-1,1]){g.beginPath();g.moveTo(16,17);g.quadraticCurveTo(16+s*14,13,16+s*12,22);g.quadraticCurveTo(16+s*7,19,16,22);g.closePath();gp(g,GOLD);}
    gline(g,OL,1.2,()=>{g.moveTo(16,15);g.lineTo(16,28);});gshine(g,13.5,19,1,2.5);},
  frostheart:(g,c)=>{chain(g);g.save();g.translate(16,19);for(let i=0;i<6;i++){g.rotate(Math.PI/3);g.beginPath();g.roundRect(-1.3,-10,2.6,10,1);gp(g,c);}
    g.beginPath();g.arc(0,0,3.5,0,7);gp(g,'#ffffff');g.restore();},
  fenlantern:(g,c)=>{gline(g,OL,1.4,()=>{g.moveTo(16,2);g.lineTo(16,6);});g.beginPath();g.arc(16,4,2.4,Math.PI,0);g.stroke();
    const gl=g.createRadialGradient(16,18,2,16,18,14);gl.addColorStop(0,'rgba(200,248,168,.8)');gl.addColorStop(1,'rgba(200,248,168,0)');g.fillStyle=gl;g.beginPath();g.arc(16,18,14,0,7);g.fill();
    g.beginPath();g.roundRect(10,6,12,4,1.5);gp(g,'#4a5a3a');g.beginPath();g.roundRect(10.5,10,11,14,3);gp(g,c);g.beginPath();g.roundRect(10,24,12,4,1.5);gp(g,'#4a5a3a');
    gline(g,'#4a5a3a',1.4,()=>{g.moveTo(16,10);g.lineTo(16,24);});g.beginPath();g.arc(16,17,2.4,0,7);g.fillStyle='#ffffff';g.fill();},
  hornbackcrest:(g,c)=>{chain(g);g.beginPath();g.arc(16,20,9,0,7);gp(g,'#8a6a4a');g.beginPath();g.arc(16,20,6.5,0,7);gp(g,'#a8885a',false);
    g.beginPath();g.moveTo(11,25);g.quadraticCurveTo(10,14,19,11);g.quadraticCurveTo(15,16,16,25);g.closePath();gp(g,c);
    g.beginPath();g.moveTo(16,25);g.quadraticCurveTo(25,18,22,12);g.quadraticCurveTo(21,19,19,25);g.closePath();gp(g,c);},
  krakeneye:(g,c)=>{gline(g,OL,4.4,()=>{for(const s of [-1,1]){g.moveTo(16+s*5,26);g.quadraticCurveTo(16+s*13,29,16+s*12,20);}g.moveTo(16,28);g.quadraticCurveTo(18,31,14,31);});
    gline(g,'#8a5aa0',2.6,()=>{for(const s of [-1,1]){g.moveTo(16+s*5,26);g.quadraticCurveTo(16+s*13,29,16+s*12,20);}g.moveTo(16,28);g.quadraticCurveTo(18,31,14,31);});
    g.beginPath();g.arc(16,15,10,0,7);gp(g,'#8a5aa0');g.beginPath();g.ellipse(16,15,7.5,5.5,0,0,7);gp(g,'#f4f4f0');g.beginPath();g.arc(16,15,4,0,7);gp(g,c);
    g.fillStyle=OL;g.beginPath();g.ellipse(16,15,1.2,3,0,0,7);g.fill();gshine(g,14,13.5,1,.8);},
  wyrmheart:(g,c)=>{chain(g,10);const gr=g.createRadialGradient(14,17,1,16,19,10);gr.addColorStop(0,'#ffe08a');gr.addColorStop(.5,c);gr.addColorStop(1,'#8a1a0a');
    g.beginPath();g.moveTo(16,29);g.bezierCurveTo(3,20,6,9,16,14);g.bezierCurveTo(26,9,29,20,16,29);gp(g,gr);
    g.fillStyle='#3a2a2a';for(const [x,y,a] of [[7,12,-.8],[25,12,.8],[16,10,0]]){g.save();g.translate(x,y);g.rotate(a);g.beginPath();g.moveTo(-1.6,2);g.lineTo(0,-4);g.lineTo(1.6,2);g.closePath();gp(g,'#3a2a2a');g.restore();}},
  beastbane:(g,c)=>{chain(g);g.beginPath();g.arc(16,20,9.5,0,7);gp(g,c);g.beginPath();g.arc(16,20,7,0,7);gp(g,shade(c,.25),false);
    gline(g,'#5a2a1a',2,()=>{for(const k of [-4,0,4]){g.moveTo(12+k,14);g.lineTo(17+k,26);}});},
  husktalon:(g,c)=>{chain(g,8);g.beginPath();g.roundRect(13,9,6,4,1.5);gp(g,GOLD);
    g.beginPath();g.moveTo(13,13);g.quadraticCurveTo(10,24,20,29);g.quadraticCurveTo(14,22,19,13);g.closePath();gp(g,c);
    gline(g,shade(c,-.35),1,()=>{g.moveTo(14.5,17);g.lineTo(17,16.5);g.moveTo(14.3,21);g.lineTo(16.8,20.4);});},
  dawnlamp:(g,c)=>{chain(g,6);const gl=g.createRadialGradient(16,19,1,16,19,13);gl.addColorStop(0,'rgba(255,240,180,.9)');gl.addColorStop(1,'rgba(255,240,180,0)');g.fillStyle=gl;g.beginPath();g.arc(16,19,13,0,7);g.fill();
    star(g,16,19,10,4.5,8);gp(g,c);g.beginPath();g.arc(16,19,4,0,7);gp(g,'#ffffff');},
  quickgrip:(g,c)=>{g.beginPath();g.ellipse(16,16,12,8,0,0,7);gp(g,c);g.beginPath();g.ellipse(16,15,8,4.5,0,0,7);gp(g,'#f4ead6');
    g.beginPath();g.ellipse(16,16,12,8,0,.15,Math.PI-.15);g.lineTo(4,21);g.ellipse(16,21,12,8,0,Math.PI,0,true);g.closePath();gp(g,shade(c,-.2));
    gline(g,'#2a6a5a',1.4,()=>{for(const x of [9,16,23]){g.moveTo(x,22);g.lineTo(x+2,27);}});},
  charm:(g,c)=>clover(g,c,3),
  fourleaf:(g,c)=>{clover(g,c,4);g.fillStyle='#fff6a0';for(const [x,y,s] of [[26,6,3],[6,24,2.4]]){g.beginPath();g.moveTo(x,y-s);g.lineTo(x+s*.35,y);g.lineTo(x,y+s);g.lineTo(x-s*.35,y);g.fill();}},
  duskcharm:(g,c)=>{chain(g,9);for(const s of [-1,1]){g.beginPath();g.moveTo(16,14);g.quadraticCurveTo(16+s*8,8,16+s*15,12);g.lineTo(16+s*12,17);g.lineTo(16+s*12,23);g.lineTo(16+s*7,20);g.lineTo(16+s*3,25);g.closePath();gp(g,c);}
    g.beginPath();g.ellipse(16,18,3,5,0,0,7);gp(g,'#3a2a4a');g.fillStyle='#ffcf5a';for(const s of [-1,1]){g.beginPath();g.arc(16+s*1.2,16.5,.8,0,7);g.fill();}},
  sicklecharm:(g,c)=>{chain(g,8);g.beginPath();g.moveTo(14,30);g.lineTo(13,20);g.lineTo(15.5,20);g.lineTo(16,30);g.closePath();gp(g,'#7a5530');
    g.beginPath();g.moveTo(13,20);g.quadraticCurveTo(8,8,20,8);g.quadraticCurveTo(27,9,27,15);g.quadraticCurveTo(22,11,17,13);g.quadraticCurveTo(14,15,15.5,20);g.closePath();gp(g,'#d8dce4');
    gline(g,c,1.6,()=>{g.moveTo(12.6,23);g.lineTo(16,23);});},
  sageloop:(g,c)=>{for(let i=0;i<12;i++){const a=i*Math.PI/6;g.beginPath();g.arc(16+Math.cos(a)*9,15+Math.sin(a)*9,2.4,0,7);gp(g,i%3?c:GOLD);}
    g.beginPath();g.moveTo(16,24);g.lineTo(13,30);g.lineTo(19,30);g.closePath();gp(g,'#c8a8e8');},
  manaheart:(g,c)=>{chain(g,10);const gr=g.createRadialGradient(13,17,1,16,19,10);gr.addColorStop(0,'#e0f0ff');gr.addColorStop(.5,c);gr.addColorStop(1,'#2a4a9a');
    g.beginPath();g.moveTo(16,29);g.bezierCurveTo(3,20,6,9,16,14);g.bezierCurveTo(26,9,29,20,16,29);gp(g,gr);gline(g,GOLD,1.6,()=>{g.moveTo(10,15);g.quadraticCurveTo(16,12,22,15);});},
  aurelsignet:(g,c)=>{band(g,c);g.beginPath();g.ellipse(16,10,7,5.5,0,0,7);gp(g,GOLD2);g.beginPath();g.ellipse(16,10,5,3.8,0,0,7);gp(g,'#7a2a3a');
    star(g,16,10,3,1.4,5);gp(g,GOLD,false);},
  ring:(g,c)=>{band(g,'#d8a84a');gem(g,16,10.5,4,'#9fd6ff');},
  thornring:(g,c)=>{band(g,c,g=>{g.fillStyle='#e8e0c8';for(let i=0;i<10;i++){const a=i*Math.PI/5,x=16+Math.cos(a)*10,y=19+Math.sin(a)*9;
    g.save();g.translate(x,y);g.rotate(a);g.beginPath();g.moveTo(0,-1.4);g.lineTo(3.2,0);g.lineTo(0,1.4);g.closePath();gp(g,'#e8e0c8');g.restore();}});
    g.beginPath();g.ellipse(23,12,3,1.6,-.6,0,7);gp(g,'#6fb04f');},
});

const _drawItemIconGear=drawItemIcon;
drawItemIcon=function(g,id){const it=ITEMS[id],key=it&&(it.radiant?it.base:id),f=key&&GEAR_ART[key];
  if(!f||!/^(weapon|armor|accessory)$/.test(it.type))return _drawItemIconGear.apply(this,arguments);it.id=id;
  g.save();g.lineJoin='round';g.lineCap='round';g.lineWidth=1.6;g.strokeStyle=OL;try{f(g,(ITEMS[key]||it).col||'#c8c2b4');}finally{g.restore();}
  // an awakened (radiant) piece keeps the golden ring from js/awaken.js around its base picture
  if(it.radiant){g.save();g.strokeStyle='#fff2a0';g.lineWidth=1.6;g.shadowColor='#ffd76a';g.shadowBlur=6;g.beginPath();g.arc(16,16,14,0,7);g.stroke();
    for(let i=0;i<8;i++){const a=i*Math.PI/4;g.beginPath();g.moveTo(16+Math.cos(a)*14,16+Math.sin(a)*14);g.lineTo(16+Math.cos(a)*16.5,16+Math.sin(a)*16.5);g.stroke();}g.restore();}};

// ---------- mouth gear: shown on its own and large (on a face it was a few pixels) ----------
const scarf=(g,c,dark,tail)=>{g.beginPath();g.moveTo(4,9);g.quadraticCurveTo(16,15,28,9);g.lineTo(28,15);g.quadraticCurveTo(16,21,4,15);g.closePath();gp(g,c);
  g.beginPath();tail();gp(g,c);gline(g,dark,1.2,()=>{g.moveTo(5,12);g.quadraticCurveTo(16,18,27,12);});};
const MOUTH_ART={
  windscarf:(g,c)=>{scarf(g,c,shade(c,-.25),()=>{g.moveTo(22,14);g.quadraticCurveTo(26,20,31,19);g.lineTo(30,24);g.quadraticCurveTo(24,25,19,16);g.closePath();});
    g.beginPath();g.moveTo(18,16);g.quadraticCurveTo(22,24,29,27);g.lineTo(26,30);g.quadraticCurveTo(18,27,15,17);g.closePath();gp(g,shade(c,-.1));
    gline(g,'#ffffff',1.4,()=>{g.moveTo(2,23);g.quadraticCurveTo(7,21,12,23);g.moveTo(4,28);g.quadraticCurveTo(9,26,14,28);g.moveTo(3,4);g.quadraticCurveTo(8,2,12,4);});},
  trailscarf:(g,c)=>{scarf(g,c,shade(c,-.3),()=>{g.moveTo(9,14);g.lineTo(15,16);g.lineTo(14,28);g.lineTo(8,27);g.closePath();});
    g.beginPath();g.moveTo(14,16);g.lineTo(20,16);g.lineTo(22,26);g.lineTo(16,27);g.closePath();gp(g,shade(c,-.15));
    gline(g,'#f4e2a0',1.4,()=>{g.moveTo(8.5,22);g.lineTo(14.5,23);g.moveTo(15.5,22);g.lineTo(21,21);});
    gline(g,OL,1.1,()=>{for(const x of [9,11,13])g.moveTo(x,27.5),g.lineTo(x-.5,30.5);for(const x of [17,19,21])g.moveTo(x,26.8),g.lineTo(x+.5,30);});},
  frostscarf:(g,c)=>{scarf(g,c,'#4a7a9a',()=>{g.moveTo(17,15);g.lineTo(23,14);g.lineTo(25,27);g.lineTo(19,28);g.closePath();});
    g.fillStyle='#ffffff';for(const [y1,y2] of [[19,20.8],[23,24.8]]){g.beginPath();g.moveTo(17.8,y1);g.lineTo(24,y1-.6);g.lineTo(24.3,y2-.6);g.lineTo(18,y2);g.closePath();g.fill();}
    g.save();g.translate(9,12.5);g.strokeStyle='#ffffff';g.lineWidth=1;g.beginPath();for(let i=0;i<3;i++){const a=i*Math.PI/3;g.moveTo(Math.cos(a)*2.6,Math.sin(a)*2.6);g.lineTo(-Math.cos(a)*2.6,-Math.sin(a)*2.6);}g.stroke();g.restore();
    g.beginPath();g.arc(22,29,2.6,0,7);gp(g,'#ffffff');},
  grassstalk:(g,c)=>{gline(g,OL,3.4,()=>{g.moveTo(5,28);g.quadraticCurveTo(14,18,24,7);});gline(g,c||'#7fc85a',1.8,()=>{g.moveTo(5,28);g.quadraticCurveTo(14,18,24,7);});
    for(let i=0;i<5;i++){const x=19+i*1.6,y=11-i*1.7;g.save();g.translate(x,y);g.rotate(-.75);g.beginPath();g.ellipse(-2,0,2.6,1.3,0,0,7);gp(g,'#d8c070');g.beginPath();g.ellipse(2,0,2.6,1.3,0,0,7);gp(g,'#d8c070');g.restore();}
    g.save();g.translate(11,22);g.rotate(-.2);g.beginPath();g.moveTo(0,0);g.quadraticCurveTo(-7,-4,-8,-11);g.quadraticCurveTo(-2,-6,1,-1);g.closePath();gp(g,'#5aa04a');g.restore();},
  tinwhistle:(g,c)=>{tilt(g,()=>{g.beginPath();g.roundRect(-2.8,-14,5.6,26,2);gp(g,'#c8ccd4');g.beginPath();g.moveTo(-2.8,12);g.lineTo(2.8,12);g.lineTo(2,16);g.lineTo(-2,16);g.closePath();gp(g,'#4a6aa8');
    g.beginPath();g.roundRect(-3.2,6,6.4,3,1);gp(g,'#4a6aa8');g.fillStyle=OL;g.fillRect(-1.6,9.6,3.2,1.6);for(const y of [-11,-7,-3,1]){g.beginPath();g.arc(0,y,1.1,0,7);g.fill();}
    gline(g,'#ffffff',1,()=>{g.moveTo(-1.6,-13);g.lineTo(-1.6,4);});});
    gline(g,'#6a9ae0',1.2,()=>{g.moveTo(26,4);g.quadraticCurveTo(29,6,27,9);g.moveTo(22,3);g.quadraticCurveTo(24,1,26,2);});g.fillStyle='#6a9ae0';g.beginPath();g.arc(26.5,10,1.4,0,7);g.fill();},
  emberpipe:(g,c)=>{tilt(g,()=>{g.beginPath();g.roundRect(-2.4,-8,4.8,24,2);gp(g,'#b89860');gline(g,'#7a5a3a',1.2,()=>{for(const y of [-2,6])g.moveTo(-2.4,y),g.lineTo(2.4,y);});
    g.beginPath();g.moveTo(-4,-8);g.lineTo(4,-8);g.lineTo(3,-13);g.lineTo(-3,-13);g.closePath();gp(g,'#3a2a2a');
    const gr=g.createRadialGradient(0,-13,.5,0,-13,4);gr.addColorStop(0,'#fff2b0');gr.addColorStop(1,'#ff7a2a');g.beginPath();g.ellipse(0,-13,3,1.6,0,0,7);gp(g,gr);});
    gline(g,'rgba(160,150,150,.85)',1.6,()=>{g.moveTo(25,6);g.quadraticCurveTo(22,3,25,1);g.moveTo(28,8);g.quadraticCurveTo(31,5,28,2);});dots_(g);},
};
const dots_=g=>{g.fillStyle='#ffcf5a';for(const [x,y] of [[29,12],[21,4]]){g.beginPath();g.arc(x,y,1,0,7);g.fill();}};
const _drawItemIconMouth=drawItemIcon;
drawItemIcon=function(g,id){const it=ITEMS[id],f=it&&it.type==='mouth'&&MOUTH_ART[id];if(!f)return _drawItemIconMouth.apply(this,arguments);it.id=id;
  g.save();g.lineJoin='round';g.lineCap='round';g.lineWidth=1.6;g.strokeStyle=OL;try{f(g,it.col);}finally{g.restore();}};

// ---------- the four hats that had no drawing (on the hero and in the icon) ----------
const _drawHatGear=drawHat;
drawHat=function(id,x,hy,f){const c=ctx;
  if(id==='scarecrowhat'){c.save();c.strokeStyle=OL;c.lineWidth=1.1;
    c.strokeStyle='#e8c870';c.lineWidth=1.4;c.beginPath();for(const k of [-13,-10,11,14]){c.moveTo(x+k,hy-5);c.lineTo(x+k*1.15,hy-1);}c.stroke();c.strokeStyle=OL;c.lineWidth=1.1;
    c.fillStyle='#d8b860';c.beginPath();c.ellipse(x,hy-6,16,4.5,0,0,7);c.fill();c.stroke();
    c.beginPath();c.moveTo(x-8,hy-8);c.quadraticCurveTo(x-6,hy-20,x+f*2,hy-22);c.lineTo(x+f*9,hy-18);c.quadraticCurveTo(x+f*3,hy-16,x+8,hy-8);c.closePath();c.fillStyle='#c8a050';c.fill();c.stroke();
    c.fillStyle='#8a5a3a';c.fillRect(x-f*5-2.5,hy-15,5,5);c.strokeRect(x-f*5-2.5,hy-15,5,5);c.fillStyle='#b8473a';c.fillRect(x-8,hy-10,16,2.2);c.restore();return;}
  if(id==='moltencrown'){c.save();c.shadowColor='#ff7a2a';c.shadowBlur=8;c.fillStyle='#3a2a2a';c.strokeStyle=OL;c.lineWidth=1.1;
    c.beginPath();c.moveTo(x-10,hy-6);c.lineTo(x-10,hy-14);c.lineTo(x-6,hy-11);c.lineTo(x-3,hy-19);c.lineTo(x,hy-12);c.lineTo(x+3,hy-19);c.lineTo(x+6,hy-11);c.lineTo(x+10,hy-14);c.lineTo(x+10,hy-6);c.closePath();c.fill();c.stroke();c.shadowBlur=0;
    c.strokeStyle='#ff8a2a';c.lineWidth=1.4;c.beginPath();c.moveTo(x-9,hy-8);c.lineTo(x+9,hy-8);c.stroke();
    c.fillStyle='#ffb040';for(const k of [-6,0,6]){c.beginPath();c.arc(x+k,hy-9.5,1.6,0,7);c.fill();}
    c.fillStyle=`rgba(255,200,90,${.7+Math.sin(now*4)*.3})`;for(const k of [-3,3]){c.beginPath();c.arc(x+k,hy-18,1.2,0,7);c.fill();}c.restore();return;}
  if(id==='silkhood'){c.save();c.fillStyle='#c8f0a0';c.strokeStyle=OL;c.lineWidth=1.1;
    c.beginPath();c.moveTo(x-12,hy+8);c.quadraticCurveTo(x-14,hy-14,x,hy-15);c.quadraticCurveTo(x+14,hy-14,x+12,hy+8);c.lineTo(x+9,hy+8);c.quadraticCurveTo(x+10,hy-8,x,hy-8);c.quadraticCurveTo(x-10,hy-8,x-9,hy+8);c.closePath();c.fill();c.stroke();
    c.strokeStyle='rgba(120,170,90,.8)';c.beginPath();c.moveTo(x-6,hy-13);c.quadraticCurveTo(x,hy-11,x+6,hy-13);c.stroke();
    c.fillStyle=`rgba(255,255,220,${.6+Math.sin(now*3)*.3})`;for(const [a,b] of [[-11,-9],[10,-4],[2,-16]]){c.beginPath();c.arc(x+a,hy+b,1.1,0,7);c.fill();}c.restore();return;}
  if(id==='arcanecirclet'){c.save();c.strokeStyle=OL;c.lineWidth=3.6;c.beginPath();c.ellipse(x,hy-7,10.5,3,0,Math.PI*.05,Math.PI*.95,true);c.stroke();
    c.strokeStyle=GOLD;c.lineWidth=2;c.beginPath();c.ellipse(x,hy-7,10.5,3,0,Math.PI*.05,Math.PI*.95,true);c.stroke();
    c.fillStyle='#b090ff';c.strokeStyle=OL;c.lineWidth=1;c.beginPath();c.moveTo(x+f*1,hy-14);c.lineTo(x+f*1+3,hy-10);c.lineTo(x+f*1,hy-6);c.lineTo(x+f*1-3,hy-10);c.closePath();c.fill();c.stroke();
    c.fillStyle=`rgba(200,170,255,${.6+Math.sin(now*3)*.3})`;for(let i=0;i<3;i++){const a=now*1.2+i*2.1;c.beginPath();c.arc(x+Math.cos(a)*12,hy-12+Math.sin(a)*2.5,1.2,0,7);c.fill();}c.restore();return;}
  return _drawHatGear(id,x,hy,f);};

for(const k in ICON_CACHE)delete ICON_CACHE[k];for(const k in ICON_CANVAS)delete ICON_CANVAS[k];
}
