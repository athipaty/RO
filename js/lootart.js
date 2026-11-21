"use strict";
/* ================= loot pictures: every monster drop and gathered item gets its own drawing (v1.45.6) =================
   Before, the drops from the newer maps (Fen, Coast, Caldera, Molten Depths, festivals, gathering) all fell through
   to the same cut gem, and some older drops shared one shape (three cores, three shells, two bat wings…). */
{
const LOOT_ART={};
const lp=(g,f,s)=>{g.fillStyle=f;g.fill();if(s!==false){g.strokeStyle=OL;g.lineWidth=1.6;g.stroke();}};
const poly=(g,pts)=>{g.beginPath();pts.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();};
const shine=(g,x,y,rx,ry,a)=>{g.fillStyle='rgba(255,255,255,.6)';g.beginPath();g.ellipse(x,y,rx,ry,a||0,0,7);g.fill();};
const dots=(g,col,pts,r)=>{g.fillStyle=col;for(const [x,y] of pts){g.beginPath();g.arc(x,y,r||1.2,0,7);g.fill();}};
const line=(g,col,w,f)=>{g.strokeStyle=col;g.lineWidth=w;g.beginPath();f();g.stroke();g.lineWidth=1.6;g.strokeStyle=OL;};
const flame=(g,x,y,s,outer,inner)=>{g.save();g.translate(x,y);g.scale(s,s);
  g.beginPath();g.moveTo(0,-14);g.quadraticCurveTo(9,-4,7,4);g.quadraticCurveTo(5,11,0,11);g.quadraticCurveTo(-5,11,-7,4);g.quadraticCurveTo(-8,-3,-2,-7);g.quadraticCurveTo(-1,-3,1,-3);g.quadraticCurveTo(2,-8,0,-14);lp(g,outer);
  g.beginPath();g.moveTo(0,-3);g.quadraticCurveTo(5,3,3,7);g.quadraticCurveTo(0,10,-3,7);g.quadraticCurveTo(-4,3,0,-3);g.fillStyle=inner;g.fill();g.restore();};
const fish=(g,c,belly)=>{g.beginPath();g.moveTo(4,16);g.quadraticCurveTo(13,6,22,13);g.lineTo(29,8);g.lineTo(27,16);g.lineTo(29,24);g.lineTo(22,19);g.quadraticCurveTo(13,26,4,16);lp(g,c);
  g.beginPath();g.moveTo(8,18);g.quadraticCurveTo(14,22,20,18);g.fillStyle=belly;g.fill();
  g.beginPath();g.moveTo(12,11);g.quadraticCurveTo(15,6,18,10);lp(g,shade(c,-.15));
  g.fillStyle='#fff';g.beginPath();g.arc(9,14.5,2,0,7);g.fill();g.stroke();g.fillStyle=OL;g.beginPath();g.arc(9.4,14.5,.9,0,7);g.fill();};

Object.assign(LOOT_ART,{
  // ---------- older drops that shared a shape ----------
  tuft:(g,c)=>{for(const [x,y,r] of [[11,19,6],[17,14,7],[22,20,6],[16,22,6]]){g.beginPath();g.arc(x,y,r,0,7);lp(g,c);}
    g.beginPath();g.arc(17,18,6,0,7);g.fillStyle=c;g.fill();shine(g,15,12,2.5,1.5,-.4);},
  fur:(g,c)=>{poly(g,[[4,22],[6,13],[11,8],[16,10],[21,6],[27,10],[28,18],[25,26],[18,28],[10,27]]);lp(g,c);
    line(g,shade(c,-.25),1.2,()=>{for(const [x,y] of [[9,16],[14,13],[20,12],[12,22],[19,20],[23,17]]){g.moveTo(x,y);g.quadraticCurveTo(x+2,y+3,x+4,y+1);}});},
  trollhide:(g,c)=>{poly(g,[[5,10],[12,5],[20,7],[27,5],[28,14],[25,22],[28,28],[16,26],[5,28],[7,19]]);lp(g,c);
    for(const [x,y,r] of [[12,13,2.2],[20,15,2.6],[14,21,1.8],[22,22,1.6]]){g.beginPath();g.arc(x,y,r,0,7);lp(g,shade(c,-.2));}
    line(g,'#6b4a2a',1.2,()=>{g.moveTo(9,7);g.lineTo(9,10);g.moveTo(24,6);g.lineTo(24,9);});},
  magmahide:(g,c)=>{poly(g,[[5,11],[11,5],[18,8],[26,5],[28,13],[26,21],[29,27],[19,27],[12,29],[5,24],[7,18]]);lp(g,'#3a2622');
    line(g,c,2,()=>{g.moveTo(9,12);g.lineTo(14,16);g.lineTo(12,22);g.moveTo(14,16);g.lineTo(21,14);g.lineTo(24,9);g.moveTo(21,14);g.lineTo(22,23);});
    line(g,'#ffd070',.8,()=>{g.moveTo(9,12);g.lineTo(14,16);g.lineTo(21,14);});},
  crabshell:(g,c)=>{g.beginPath();g.moveTo(10,28);g.quadraticCurveTo(5,18,10,10);g.quadraticCurveTo(14,4,22,5);g.lineTo(18,13);g.quadraticCurveTo(25,12,28,8);g.quadraticCurveTo(29,20,18,22);g.quadraticCurveTo(15,25,14,29);g.closePath();lp(g,c);
    shine(g,11,15,1.6,3.5,.3);dots(g,shade(c,-.3),[[14,18],[11,22],[16,14]],1);},
  screeshell:(g,c)=>{g.beginPath();g.moveTo(6,27);g.lineTo(26,27);g.quadraticCurveTo(28,20,22,17);g.lineTo(16,4);g.lineTo(9,17);g.quadraticCurveTo(4,21,6,27);lp(g,c);
    line(g,shade(c,-.4),1.3,()=>{g.moveTo(8,23);g.quadraticCurveTo(16,19,25,23);g.moveTo(10,17);g.quadraticCurveTo(16,14,22,17);g.moveTo(12.5,11);g.quadraticCurveTo(16,9.5,19.5,11);});
    dots(g,shade(c,.3),[[11,25],[19,21],[15,15]],1);},
  tideshell:(g,c)=>{g.beginPath();g.moveTo(16,28);g.lineTo(4,13);g.quadraticCurveTo(16,-1,28,13);g.closePath();lp(g,c);
    line(g,shade(c,-.3),1.2,()=>{for(const a of [-1.1,-.55,0,.55,1.1]){g.moveTo(16,27);g.lineTo(16+Math.sin(a)*13,15-Math.cos(a)*10);}});
    g.beginPath();g.roundRect(12,25,8,4,1.5);lp(g,shade(c,-.15));},
  shelltok:(g,c)=>{g.beginPath();g.moveTo(5,22);g.quadraticCurveTo(3,10,15,6);g.quadraticCurveTo(27,4,28,14);g.quadraticCurveTo(27,24,16,27);g.lineTo(9,29);g.closePath();lp(g,c);
    line(g,shade(c,-.4),1.3,()=>{g.moveTo(20,12);g.arc(18,14,3,-.6,4.6);g.arc(18,14,7,-1.4,3.6);});
    for(const [x,y] of [[25,5],[29,9]]){g.fillStyle='#bfe6ff';g.beginPath();g.arc(x,y,1.7,0,7);g.fill();}},
  needle:(g,c)=>{for(const [x,a] of [[11,-.5],[16,0],[21,.5]]){g.save();g.translate(x,21);g.rotate(a);g.beginPath();g.moveTo(-1.8,0);g.lineTo(0,-17);g.lineTo(1.8,0);g.closePath();lp(g,'#f4efe2');g.restore();}
    g.beginPath();g.ellipse(16,24,10,6,0,0,7);lp(g,c);line(g,shade(c,-.35),1.2,()=>{g.moveTo(9,23);g.lineTo(23,23);});},
  pyrecore:(g,c)=>{const gr=g.createRadialGradient(15,18,1,16,19,10);gr.addColorStop(0,'#fff8d0');gr.addColorStop(.6,c);gr.addColorStop(1,'#e06a1a');
    g.beginPath();g.arc(16,19,9,0,7);lp(g,gr);flame(g,16,10,.55,'#ff8a2a','#ffe08a');
    line(g,'#7a5a3a',1.4,()=>{g.moveTo(7,19);g.quadraticCurveTo(16,24,25,19);});},
  magmacore:(g,c)=>{g.beginPath();g.arc(16,16,11,0,7);lp(g,'#3a2a2a');
    line(g,c,2.2,()=>{g.moveTo(8,10);g.lineTo(14,15);g.lineTo(11,24);g.moveTo(14,15);g.lineTo(22,12);g.lineTo(25,17);g.moveTo(18,14);g.lineTo(20,25);});
    line(g,'#ffe070',.9,()=>{g.moveTo(14,15);g.lineTo(22,12);g.moveTo(14,15);g.lineTo(11,24);});shine(g,12,9,2.4,1.4,-.5);},
  batwingash:(g,c)=>{g.beginPath();g.moveTo(5,10);g.quadraticCurveTo(16,4,28,12);g.lineTo(24,16);g.lineTo(26,22);g.lineTo(20,19);g.lineTo(16,25);g.lineTo(13,18);g.lineTo(6,21);g.closePath();lp(g,c);
    line(g,'#ff8a3a',1.6,()=>{g.moveTo(24,16);g.lineTo(26,22);g.lineTo(20,19);g.lineTo(16,25);g.lineTo(13,18);g.lineTo(6,21);});
    dots(g,'#ffcf5a',[[27,25],[22,27],[9,26],[29,19]],1.2);},
  shard:(g,c)=>{for(const [x,h,w] of [[10,14,4],[22,12,4],[16,22,5]]){g.beginPath();g.moveTo(x-w,28);g.lineTo(x-w,28-h+4);g.lineTo(x,28-h-2);g.lineTo(x+w,28-h+4);g.lineTo(x+w,28);g.closePath();lp(g,c);}
    shine(g,14.5,14,1,4);g.fillStyle='#fff';for(const [x,y] of [[26,7],[7,9]]){g.beginPath();g.moveTo(x,y-3);g.lineTo(x+1,y);g.lineTo(x,y+3);g.lineTo(x-1,y);g.fill();}},
  crest:(g,c)=>{g.beginPath();g.moveTo(16,3);g.lineTo(27,7);g.quadraticCurveTo(27,22,16,29);g.quadraticCurveTo(5,22,5,7);g.closePath();lp(g,'#8a2a2a');
    g.beginPath();g.moveTo(16,6);g.lineTo(24,9);g.quadraticCurveTo(24,20,16,26);g.quadraticCurveTo(8,20,8,9);g.closePath();lp(g,'#b83a3a',false);
    g.beginPath();for(let i=0;i<10;i++){const r=i%2?2.6:6.5,a=-Math.PI/2+i*Math.PI/5;g.lineTo(16+Math.cos(a)*r,16+Math.sin(a)*r);}g.closePath();lp(g,c);},
  glowsilk:(g,c)=>{g.beginPath();g.roundRect(9,5,14,4,1.5);lp(g,'#a07850');g.beginPath();g.roundRect(9,23,14,4,1.5);lp(g,'#a07850');
    g.beginPath();g.roundRect(10,9,12,14,2);lp(g,c);line(g,shade(c,-.25),1,()=>{for(let y=11;y<22;y+=2.5){g.moveTo(10.5,y);g.lineTo(21.5,y+1);}});
    line(g,c,1.4,()=>{g.moveTo(22,18);g.quadraticCurveTo(28,22,25,29);});dots(g,'#fffbe0',[[27,8],[5,14],[28,15]],1.1);},
  rotspore:(g,c)=>{g.beginPath();g.roundRect(13,17,6,11,2);lp(g,'#e8dcc0');g.beginPath();g.moveTo(4,19);g.quadraticCurveTo(5,6,16,5);g.quadraticCurveTo(27,6,28,19);g.quadraticCurveTo(16,15,4,19);lp(g,c);
    for(const [x,y,r] of [[10,12,2],[17,9,1.6],[22,14,2.2],[15,14,1.2]]){g.beginPath();g.arc(x,y,r,0,7);g.fillStyle=shade(c,-.35);g.fill();}
    dots(g,'#c8d070',[[7,24],[25,24],[23,28]],1.3);},

  sap:(g,c)=>{g.beginPath();g.moveTo(3,9);g.quadraticCurveTo(14,2,27,7);g.quadraticCurveTo(16,14,3,9);lp(g,'#8a6a42');
    line(g,'#6a4a2a',1,()=>{g.moveTo(7,8);g.lineTo(23,7);});
    g.beginPath();g.moveTo(15,10);g.quadraticCurveTo(16,15,20,19);g.quadraticCurveTo(24,25,19,28.5);g.quadraticCurveTo(13,30,12,24);g.quadraticCurveTo(12,19,15,10);lp(g,c);
    shine(g,15.5,22,1.3,2.8,.2);g.beginPath();g.arc(24,13,2,0,7);lp(g,c);},
  spore:(g,c)=>{const gl=g.createRadialGradient(16,17,4,16,17,15);gl.addColorStop(0,'rgba(255,200,170,.7)');gl.addColorStop(1,'rgba(255,200,170,0)');g.fillStyle=gl;g.beginPath();g.arc(16,17,15,0,7);g.fill();
    g.beginPath();g.moveTo(16,6);g.quadraticCurveTo(26,8,25,18);g.quadraticCurveTo(24,27,16,27);g.quadraticCurveTo(8,27,7,18);g.quadraticCurveTo(6,8,16,6);lp(g,c);
    line(g,shade(c,-.3),1.1,()=>{g.moveTo(16,6);g.quadraticCurveTo(11,16,16,27);g.moveTo(16,6);g.quadraticCurveTo(21,16,16,27);});dots(g,shade(c,.45),[[12,11],[19,10],[21,16],[14,18],[17,14]],1.5);shine(g,12.5,10.5,2,1.2,-.4);
    for(const [x,y,r] of [[5,8,1.8],[27,7,1.5],[28,20,1.8],[4,20,1.3]]){g.beginPath();g.arc(x,y,r,0,7);lp(g,shade(c,.2));}},
  shell:(g,c)=>{g.beginPath();g.moveTo(4,26);g.lineTo(28,26);g.quadraticCurveTo(29,22,25,21);g.lineTo(5,22);g.closePath();lp(g,'#c8b890');
    g.beginPath();g.arc(16,15,10,0,7);lp(g,c);line(g,shade(c,-.4),1.3,()=>{g.moveTo(16,15);g.arc(16,15,2.5,0,4.5);g.arc(16,15.8,6,4.5,9.2);});
    for(const [x,y,r] of [[10,6.5,3],[15,5,3.4],[21,6,3]]){g.beginPath();g.arc(x,y,r,0,7);lp(g,'#4a8a3a');}
    g.beginPath();g.ellipse(15.5,7,6,2.4,0,0,7);g.fillStyle='#4a8a3a';g.fill();
    line(g,OL,1.3,()=>{g.moveTo(26,21);g.lineTo(28,16);g.moveTo(27,21);g.lineTo(30,17);});},
  carapace:(g,c)=>{g.beginPath();g.ellipse(16,7,6,3.5,0,0,7);lp(g,shade(c,-.3));
    for(const s of [-1,1]){g.beginPath();g.moveTo(16+s*1.2,9);g.quadraticCurveTo(16+s*13,9,16+s*12,20);g.quadraticCurveTo(16+s*10,28,16+s*3,29);g.lineTo(16+s*1.2,9);g.closePath();
      const gr=g.createLinearGradient(16+s*2,10,16+s*12,26);gr.addColorStop(0,shade(c,.35));gr.addColorStop(.6,c);gr.addColorStop(1,'#6a4aa0');lp(g,gr);}
    shine(g,10,14,1.3,3.5,.4);shine(g,21.5,14,1,2.5,-.4);},

  // ---------- the Fen (Lv 60s) ----------
  bogmoss:(g,c)=>{g.beginPath();g.ellipse(16,23,12,6,0,0,7);lp(g,'#5a4a32');
    for(const [x,y,r] of [[9,19,5],[16,15,6],[23,19,5],[13,21,4],[20,21,4]]){g.beginPath();g.arc(x,y,r,0,7);lp(g,c);}
    g.beginPath();g.arc(16,19,5,0,7);g.fillStyle=c;g.fill();dots(g,shade(c,.4),[[14,13],[8,17],[22,17],[18,17]],1.1);},
  lurkerscale:(g,c)=>{g.beginPath();g.moveTo(16,4);g.quadraticCurveTo(28,8,27,18);g.quadraticCurveTo(24,27,16,29);g.quadraticCurveTo(8,27,5,18);g.quadraticCurveTo(4,8,16,4);lp(g,c);
    line(g,shade(c,.3),1.2,()=>{for(const r of [6,11,16]){g.moveTo(16-r*.7,29-r);g.quadraticCurveTo(16,29-r*1.3,16+r*.7,29-r);}});shine(g,11,10,2,3.5,-.5);},
  wispglow:(g,c)=>{const gr=g.createRadialGradient(16,16,1,16,16,14);gr.addColorStop(0,'#ffffff');gr.addColorStop(.35,c);gr.addColorStop(1,'rgba(200,248,168,0)');
    g.fillStyle=gr;g.beginPath();g.arc(16,16,14,0,7);g.fill();g.beginPath();g.arc(16,16,6,0,7);lp(g,c);shine(g,14,14,2,1.5);
    g.fillStyle='#fff';for(const [x,y,s] of [[6,7,3],[26,9,2.5],[24,26,2]]){g.beginPath();g.moveTo(x,y-s);g.lineTo(x+s*.35,y);g.lineTo(x,y+s);g.lineTo(x-s*.35,y);g.fill();}},
  mirestone:(g,c)=>{poly(g,[[5,22],[7,13],[14,8],[23,9],[28,16],[26,25],[16,28],[9,27]]);lp(g,'#6a6a62');
    g.beginPath();g.moveTo(6,15);g.quadraticCurveTo(10,7,18,8);g.quadraticCurveTo(25,8,27,14);g.quadraticCurveTo(24,17,21,14);g.quadraticCurveTo(18,18,15,14);g.quadraticCurveTo(11,18,6,15);lp(g,c);
    line(g,'#4a4a42',1.1,()=>{g.moveTo(12,20);g.lineTo(17,23);g.lineTo(21,20);});},
  mantisblade:(g,c)=>{g.beginPath();g.moveTo(6,28);g.quadraticCurveTo(6,10,24,4);g.quadraticCurveTo(15,12,14,22);g.lineTo(10,28);g.closePath();lp(g,c);
    g.fillStyle=OL;for(let i=0;i<5;i++){const x=15-i*1.3+i*i*.25,y=19-i*3.2;g.beginPath();g.moveTo(x,y);g.lineTo(x+2.6,y-.4);g.lineTo(x+.8,y-2);g.fill();}
    line(g,shade(c,.45),1.1,()=>{g.moveTo(8.5,24);g.quadraticCurveTo(9,12,20,6.5);});},

  // ---------- the Highlands and early fields ----------
  pebble:(g,c)=>{g.beginPath();g.ellipse(16,18,12,8.5,-.2,0,7);lp(g,c);g.beginPath();g.ellipse(16,21,10,4.5,-.2,0,Math.PI);g.fillStyle=shade(c,-.15);g.fill();shine(g,11,14,3.5,1.6,-.3);},
  wispbreath:(g,c)=>{line(g,OL,4.2,()=>{g.moveTo(4,12);g.quadraticCurveTo(18,6,22,12);g.quadraticCurveTo(25,18,19,17);g.moveTo(6,21);g.quadraticCurveTo(18,17,26,22);g.quadraticCurveTo(29,27,23,27);});
    line(g,c,2.4,()=>{g.moveTo(4,12);g.quadraticCurveTo(18,6,22,12);g.quadraticCurveTo(25,18,19,17);g.moveTo(6,21);g.quadraticCurveTo(18,17,26,22);g.quadraticCurveTo(29,27,23,27);});
    dots(g,'#ffffff',[[26,6],[8,27]],1.4);},
  ramhorn:(g,c)=>{g.beginPath();g.moveTo(5,26);g.quadraticCurveTo(2,8,16,5);g.quadraticCurveTo(28,4,28,15);g.quadraticCurveTo(28,24,19,24);g.quadraticCurveTo(13,23,14,17);g.quadraticCurveTo(15,13,19,14);g.quadraticCurveTo(22,15,21,18);
    g.quadraticCurveTo(20,13,17,15);g.quadraticCurveTo(16,19,19,20);g.quadraticCurveTo(24,20,23,14);g.quadraticCurveTo(21,10,16,11);g.quadraticCurveTo(9,13,11,27);g.closePath();lp(g,c);
    line(g,shade(c,-.3),1,()=>{for(const [x,y] of [[8,20],[8,14],[11,9],[17,7],[23,8]]){g.moveTo(x,y);g.lineTo(x+3,y+2);}});},
  turnip:(g,c)=>{for(const [a,col] of [[-.5,'#5aa04a'],[0,'#4a9040'],[.5,'#5aa04a']]){g.save();g.translate(16,12);g.rotate(a);g.beginPath();g.ellipse(0,-5,2.8,6,0,0,7);lp(g,col);g.restore();}
    g.beginPath();g.moveTo(16,11);g.quadraticCurveTo(28,13,25,22);g.quadraticCurveTo(21,27,16,30);g.quadraticCurveTo(11,27,7,22);g.quadraticCurveTo(4,13,16,11);lp(g,c);
    g.beginPath();g.moveTo(7,18);g.quadraticCurveTo(5,13,16,11);g.quadraticCurveTo(27,13,25,18);g.quadraticCurveTo(16,15,7,18);g.fillStyle='#b07ad0';g.fill();shine(g,11,21,1.4,3,.3);},
  mudclump:(g,c)=>{g.beginPath();g.moveTo(5,22);g.quadraticCurveTo(3,12,11,10);g.quadraticCurveTo(14,4,20,8);g.quadraticCurveTo(28,8,27,17);g.quadraticCurveTo(29,24,22,25);g.quadraticCurveTo(21,29,18,25);g.quadraticCurveTo(12,27,11,25);g.quadraticCurveTo(10,30,8,25);g.quadraticCurveTo(5,25,5,22);lp(g,c);
    dots(g,shade(c,-.3),[[12,16],[19,13],[21,20],[14,21]],1.6);shine(g,17,11,2.5,1.2,-.3);},
  weevilhusk:(g,c)=>{line(g,OL,1.4,()=>{for(const y of [13,18,23]){g.moveTo(9,y);g.lineTo(5,y+2);g.moveTo(23,y);g.lineTo(27,y+2);}g.moveTo(14,7);g.lineTo(11,3);g.moveTo(18,7);g.lineTo(21,3);});
    g.beginPath();g.ellipse(16,18,8,11,0,0,7);lp(g,c);g.beginPath();g.ellipse(16,8.5,4.5,3.5,0,0,7);lp(g,shade(c,-.2));
    line(g,shade(c,-.4),1.2,()=>{g.moveTo(16,11);g.lineTo(16,29);});shine(g,12.5,15,1.3,3);},
  riverreed:(g,c)=>{line(g,OL,3.6,()=>{g.moveTo(10,30);g.quadraticCurveTo(9,18,12,6);g.moveTo(17,30);g.lineTo(17,3);g.moveTo(23,30);g.quadraticCurveTo(24,18,21,9);});
    line(g,c,1.8,()=>{g.moveTo(10,30);g.quadraticCurveTo(9,18,12,6);g.moveTo(17,30);g.lineTo(17,3);g.moveTo(23,30);g.quadraticCurveTo(24,18,21,9);});
    g.beginPath();g.roundRect(14.5,6,5,10,2.5);lp(g,'#7a4a2a');g.beginPath();g.roundRect(8.6,9,4.6,8,2.3);lp(g,'#7a4a2a');
    g.beginPath();g.moveTo(17,30);g.quadraticCurveTo(26,22,29,23);g.quadraticCurveTo(25,26,19,30);lp(g,shade(c,.2));},

  // ---------- the Coast ----------
  saltfeather:(g,c)=>{g.beginPath();g.moveTo(7,28);g.quadraticCurveTo(4,14,14,7);g.quadraticCurveTo(22,2,27,4);g.quadraticCurveTo(27,14,20,21);g.quadraticCurveTo(14,27,7,28);lp(g,c);
    line(g,'#a8b8c0',1.4,()=>{g.moveTo(5,30);g.quadraticCurveTo(15,17,26,5);});
    line(g,'#c8d0d4',1,()=>{for(const t of [.3,.5,.7]){const x=5+21*t,y=30-25*t;g.moveTo(x,y);g.lineTo(x-5,y-2);g.moveTo(x,y);g.lineTo(x+2,y+5);}});},
  driftwood:(g,c)=>{g.save();g.translate(16,16);g.rotate(-.5);g.beginPath();g.moveTo(-13,-4);g.quadraticCurveTo(0,-7,12,-4);g.lineTo(14,-7);g.lineTo(13,0);g.lineTo(12,4);g.quadraticCurveTo(0,7,-13,4);g.closePath();lp(g,c);
    g.beginPath();g.ellipse(-13,0,2.4,4,0,0,7);lp(g,shade(c,.25));
    line(g,shade(c,-.35),1,()=>{g.moveTo(-9,-2);g.quadraticCurveTo(0,-4,9,-1);g.moveTo(-8,2);g.quadraticCurveTo(2,3,10,1.5);});
    g.beginPath();g.ellipse(2,0,2,1.2,0,0,7);lp(g,shade(c,-.3),false);g.restore();},
  pearl:(g,c)=>{g.beginPath();g.moveTo(3,20);g.quadraticCurveTo(16,32,29,20);g.closePath();lp(g,'#8a7aa0');
    g.beginPath();g.moveTo(3,20);g.quadraticCurveTo(4,6,16,5);g.quadraticCurveTo(28,6,29,20);g.quadraticCurveTo(16,14,3,20);lp(g,'#b0a0c8');
    line(g,'#8a7aa0',1,()=>{for(const x of [9,16,23]){g.moveTo(16,6);g.lineTo(x,16);}});
    const gr=g.createRadialGradient(14,19,1,16,21,6);gr.addColorStop(0,'#fff');gr.addColorStop(1,c);g.beginPath();g.arc(16,21,5.5,0,7);lp(g,gr);},
  reeffin:(g,c)=>{g.beginPath();g.moveTo(5,27);g.quadraticCurveTo(8,10,24,4);g.quadraticCurveTo(20,14,27,27);g.closePath();lp(g,c);
    line(g,shade(c,.35),1.1,()=>{for(const x of [10,15,20,24]){g.moveTo(x,27);g.quadraticCurveTo(x+1,16,22,6);}});line(g,shade(c,-.3),1.6,()=>{g.moveTo(5,27);g.lineTo(27,27);});},
  barnacle:(g,c)=>{g.beginPath();g.ellipse(16,23,13,6,0,0,7);lp(g,'#6a7a7a');
    for(const [x,y,s] of [[10,21,5],[21,19,6],[15,25,4],[24,25,3.5]]){g.beginPath();g.moveTo(x-s,y+s*.5);g.lineTo(x-s*.45,y-s);g.lineTo(x+s*.45,y-s);g.lineTo(x+s,y+s*.5);g.closePath();lp(g,c);
      g.beginPath();g.ellipse(x,y-s,s*.45,s*.2,0,0,7);g.fillStyle=OL;g.fill();}},

  // ---------- Cinderpeak Caldera and the Molten Depths ----------
  cinderash:(g,c)=>{g.beginPath();g.moveTo(3,26);g.quadraticCurveTo(8,14,16,12);g.quadraticCurveTo(24,14,29,26);g.closePath();lp(g,c);
    g.beginPath();g.ellipse(16,26,13,3,0,0,7);lp(g,shade(c,-.2));dots(g,'#ff8a3a',[[12,20],[19,18],[22,23],[15,24]],1.4);dots(g,'#ffd070',[[12,20],[19,18]],.6);
    line(g,'rgba(150,140,135,.8)',1.4,()=>{g.moveTo(14,10);g.quadraticCurveTo(11,7,14,4);g.moveTo(19,9);g.quadraticCurveTo(22,6,19,3);});},
  obsidian:(g,c)=>{poly(g,[[9,29],[5,17],[12,4],[19,10],[27,8],[24,22],[17,29]]);lp(g,c);
    poly(g,[[12,4],[19,10],[15,20],[9,15]]);g.fillStyle='#5a4a7a';g.fill();poly(g,[[19,10],[27,8],[24,22],[15,20]]);g.fillStyle='#3a3050';g.fill();
    poly(g,[[9,29],[5,17],[12,4],[19,10],[27,8],[24,22],[17,29]]);g.strokeStyle=OL;g.stroke();line(g,'#b8a8e8',1.2,()=>{g.moveTo(11,8);g.lineTo(8,16);});},
  wraithflame:(g,c)=>{flame(g,16,17,1.05,c,'#ffe8b0');g.fillStyle=OL;for(const x of [13,19]){g.beginPath();g.ellipse(x,20,1.5,2.4,0,0,7);g.fill();}
    g.beginPath();g.ellipse(16,25,1.6,1.1,0,0,7);g.fill();},
  salascale:(g,c)=>{for(const [x,y] of [[10,9],[22,9],[16,16],[10,22],[22,22]]){g.beginPath();g.moveTo(x,y-6);g.lineTo(x+6,y);g.quadraticCurveTo(x,y+9,x-6,y);g.closePath();lp(g,c);shine(g,x-1.5,y-1,1,2,.4);}},
  slugslime:(g,c)=>{g.beginPath();g.moveTo(4,24);g.quadraticCurveTo(5,13,13,12);g.quadraticCurveTo(16,4,22,9);g.quadraticCurveTo(29,12,28,22);g.quadraticCurveTo(28,28,22,27);g.quadraticCurveTo(20,31,17,27);g.quadraticCurveTo(8,29,4,24);
    const gr=g.createLinearGradient(0,8,0,28);gr.addColorStop(0,'#ffd070');gr.addColorStop(1,c);lp(g,gr);shine(g,12,16,2.4,1.5,-.4);dots(g,'#c83a1a',[[20,19],[14,23],[23,14]],1.4);},
  basaltplate:(g,c)=>{poly(g,[[16,4],[27,10],[27,22],[16,28],[5,22],[5,10]]);lp(g,c);poly(g,[[16,8],[23,12],[23,20],[16,24],[9,20],[9,12]]);lp(g,shade(c,.15),false);
    line(g,'#ff7a2a',1.4,()=>{g.moveTo(5,16);g.lineTo(9,16);g.moveTo(16,24);g.lineTo(16,28);g.moveTo(23,12);g.lineTo(27,10);});},
  moltensteel:(g,c)=>{g.beginPath();g.moveTo(4,24);g.lineTo(9,14);g.lineTo(26,14);g.lineTo(29,24);g.closePath();lp(g,c);g.beginPath();g.moveTo(9,14);g.lineTo(11,10);g.lineTo(24,10);g.lineTo(26,14);g.closePath();lp(g,shade(c,.25));
    g.fillStyle='#ffd070';g.beginPath();g.moveTo(13,14);g.quadraticCurveTo(14,20,12,24);g.lineTo(16,24);g.quadraticCurveTo(15,19,17,14);g.fill();
    g.beginPath();g.ellipse(13,27,2,1.4,0,0,7);g.fillStyle='#ff7a2a';g.fill();},
  revenantash:(g,c)=>{g.beginPath();g.moveTo(11,8);g.lineTo(21,8);g.lineTo(20,11);g.quadraticCurveTo(27,15,25,23);g.quadraticCurveTo(23,29,16,29);g.quadraticCurveTo(9,29,7,23);g.quadraticCurveTo(5,15,12,11);g.closePath();lp(g,c);
    g.beginPath();g.roundRect(10,5,12,4,1.5);lp(g,shade(c,-.25));line(g,shade(c,-.35),1.2,()=>{g.moveTo(8,18);g.lineTo(24,18);});
    g.fillStyle='#4a3a4a';g.beginPath();g.arc(16,22.5,2.6,0,7);g.fill();g.fillRect(14.6,23,2.8,3.5);
    line(g,'rgba(180,170,190,.9)',1.2,()=>{g.moveTo(16,4);g.quadraticCurveTo(13,2,15,0);});},
  hellflame:(g,c)=>{g.fillStyle='rgba(255,90,40,.25)';g.beginPath();g.arc(16,17,13,0,7);g.fill();flame(g,16,18,1,c,'#ffd070');dots(g,'#ffd070',[[6,8],[26,10],[25,24]],1.2);},

  // ---------- festival tokens ----------
  petaltok:(g,c)=>{for(let i=0;i<5;i++){const a=-Math.PI/2+i*Math.PI*2/5;g.save();g.translate(16+Math.cos(a)*6.5,16+Math.sin(a)*6.5);g.rotate(a+Math.PI/2);
      g.beginPath();g.moveTo(0,5);g.quadraticCurveTo(-6,0,-3,-5);g.lineTo(0,-3);g.lineTo(3,-5);g.quadraticCurveTo(6,0,0,5);lp(g,c);g.restore();}
    g.beginPath();g.arc(16,16,3.5,0,7);lp(g,'#ffe08a');},
  gourdtok:(g,c)=>{g.beginPath();g.roundRect(14.5,4,3,6,1);lp(g,'#6b4a2a');
    for(const [x,rx] of [[9,6],[23,6],[16,7]]){g.beginPath();g.ellipse(x,19,rx,9.5,0,0,7);lp(g,x===16?c:shade(c,-.12));}
    line(g,'#4a9040',1.6,()=>{g.moveTo(17,8);g.quadraticCurveTo(24,4,26,9);});},
  wicktok:(g,c)=>{g.beginPath();g.roundRect(10,15,12,14,2);lp(g,'#f4ead0');g.beginPath();g.ellipse(16,15,6,2,0,0,7);lp(g,'#fff6e0');
    line(g,OL,1.4,()=>{g.moveTo(16,15);g.lineTo(16,11);});flame(g,16,8,.42,c,'#fff2b0');
    g.beginPath();g.moveTo(10,19);g.quadraticCurveTo(8,22,9.5,24);g.lineTo(10,22);g.fillStyle='#f4ead0';g.fill();},
  ribbontok:(g,c)=>{for(const s of [-1,1]){g.beginPath();g.moveTo(16,15);g.quadraticCurveTo(16+s*13,4,16+s*13,13);g.quadraticCurveTo(16+s*13,20,16,15);lp(g,c);
      g.beginPath();g.moveTo(15+s,17);g.lineTo(16+s*7,29);g.lineTo(16+s*9,25);g.lineTo(16+s*10,28);g.lineTo(17+s*3,17);g.closePath();lp(g,shade(c,-.1));}
    g.beginPath();g.roundRect(13,12.5,6,6,2);lp(g,shade(c,-.2));dots(g,'#ffffff',[[8,10],[24,10]],1);},

  // ---------- gathering ----------
  mossherb:(g,c)=>{line(g,'#4a6a2a',1.8,()=>{g.moveTo(16,30);g.quadraticCurveTo(15,18,17,5);});
    for(const [y,s] of [[22,-1],[17,1],[12,-1],[8,1]]){g.save();g.translate(16.3,y);g.rotate(s*.9);g.beginPath();g.moveTo(0,0);g.quadraticCurveTo(s*4,-5,s*9,-1);g.quadraticCurveTo(s*4,3,0,0);lp(g,c);g.restore();}},
  sunpetal:(g,c)=>{line(g,'#4a9040',2,()=>{g.moveTo(16,20);g.quadraticCurveTo(18,26,15,31);});
    for(let i=0;i<10;i++){const a=i*Math.PI/5;g.save();g.translate(16,14);g.rotate(a);g.beginPath();g.ellipse(0,-7.5,2.6,5,0,0,7);lp(g,c);g.restore();}
    g.beginPath();g.arc(16,14,5,0,7);lp(g,'#8a5a2a');dots(g,'#5a3a1a',[[14.5,13],[17.5,13],[16,15.5]],.9);},
  ironchunk:(g,c)=>{poly(g,[[6,20],[9,9],[18,5],[26,10],[27,21],[19,28],[10,27]]);lp(g,c);
    poly(g,[[9,9],[18,5],[26,10],[17,14]]);g.fillStyle=shade(c,.3);g.fill();poly(g,[[17,14],[26,10],[27,21],[19,28]]);g.fillStyle=shade(c,-.25);g.fill();
    poly(g,[[6,20],[9,9],[18,5],[26,10],[27,21],[19,28],[10,27]]);g.strokeStyle=OL;g.stroke();line(g,OL,1,()=>{g.moveTo(9,9);g.lineTo(17,14);g.lineTo(26,10);g.moveTo(17,14);g.lineTo(19,28);});},
  pondfish:(g,c)=>{fish(g,c,'#e8f0f4');dots(g,shade(c,-.3),[[15,14],[18,13],[17,16]],.9);},
  goldfin:(g,c)=>{g.beginPath();g.moveTo(20,15);g.quadraticCurveTo(30,4,29,14);g.quadraticCurveTo(31,24,20,17);lp(g,'#ffe08a');
    g.beginPath();g.ellipse(13,16,9,7.5,0,0,7);lp(g,c);g.beginPath();g.moveTo(11,9);g.quadraticCurveTo(14,3,18,9);lp(g,'#ffe08a');
    g.fillStyle='#fff';g.beginPath();g.arc(8,14.5,2.1,0,7);g.fill();g.stroke();g.fillStyle=OL;g.beginPath();g.arc(7.6,14.5,1,0,7);g.fill();shine(g,14,12,2.4,1.3,-.2);},

  // ---------- odds and ends ----------
  rustykey:(g,c)=>{g.save();g.translate(16,16);g.rotate(-.75);g.beginPath();g.arc(-8,0,6,0,7);lp(g,c);g.beginPath();g.arc(-8,0,2.6,0,7);g.fillStyle='#f4ead6';g.fill();g.stroke();
    g.beginPath();g.rect(-2,-1.8,15,3.6);lp(g,c);g.beginPath();g.rect(8,1.8,2.4,4);lp(g,c);g.beginPath();g.rect(11.5,1.8,2,3);lp(g,c);g.restore();
    dots(g,'#7a4a22',[[10,20],[20,14],[23,11]],1);},
});

const _drawItemIconLoot=drawItemIcon;
drawItemIcon=function(g,id){const it=ITEMS[id],f=it&&it.type==='etc'&&LOOT_ART[id];
  if(!f)return _drawItemIconLoot.apply(this,arguments);it.id=id;
  g.save();g.lineJoin='round';g.lineCap='round';g.lineWidth=1.6;g.strokeStyle=OL;try{f(g,it.col||'#c8c2b4');}finally{g.restore();}};
for(const k in ICON_CACHE)delete ICON_CACHE[k];for(const k in ICON_CANVAS)delete ICON_CANVAS[k];
}
