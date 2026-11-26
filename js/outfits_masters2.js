"use strict";
/* ================= the other masters' own outfits (v1.70.0) =================
   An advanced calling wears an official outfit; a master is past anyone's rules and dresses its own way: mismatched,
   asymmetric, personal. Kept simple (a few clear shapes and one signature piece), the big piece on the far shoulder
   away from the weapon, nothing below the boot tops (by+2) so the boots show, and the body is drawn before the head so
   nothing covers the face. No wings and no big orbs (js/masterlook.js gives each the master's rune circle).
     Tempest Sage  storm wanderer: a grey short jacket over white, a silver lightning-bolt pauldron, a blue sash with a
                   tassel, gloves with glowing blue knuckles
     Voidcaller    void punk: a cropped black coat torn on one side, a violet void-eye amulet, short chains, one violet sleeve
     Dawnknight    dawn rider: rose gold and coral, a sunburst disc on one shoulder, a coral scarf, sleeves rolled up
     Starseer      star wanderer: an indigo vest with silver stars, a silver scarf over one shoulder, a crescent buckle
     Soulreaper    reaper: black with a bone rib harness, a bone skull pauldron, a ragged dark red sash, arm wraps
     Plaguelord    plague alchemist: a green-brown apron, a bandolier of coloured vials, one big rubber glove
     Longshot      frontier marksman: a red-striped poncho over one shoulder, a bullet bandolier, spurs
     Blastmaster   demolition: a soot-black vest with orange hazard stripes, a belt of red dynamite, one padded glove */
const MASTER2_LOOKS={
  tempestsage:{fam:'master2',kit:'storm',robe:'#2e3038',robe2:'#1e2026',under:'#5a5e6a',sleeve:'#2e3038',metal:'#ffd84a',glow:'#ffe23a',belt:'#1a1a20',boot:'#1a1a20',cuff:'#ffe23a'},
  voidcaller:{fam:'master2',kit:'void',robe:'#ece6da',sleeve:'#ece6da',sleeve2:'#16161c',ink:'#16161c',crystal:'#22222c',glow:'#3ae8c8',chain:'#a8b0b8',boot:'#16161c',cuff:'#3ae8c8'},
  dawnknight:{fam:'master2',kit:'dawn',legs:1,body:'#fff4ec',sleeve:'#fff4ec',metal:'#e8a878',metal2:'#c07850',coral:'#ff7a5a',gold:'#ffd27a',pant:'#f0e2d6',boot:'#c86a4a',cuff:'#ffd27a',tall:1},
  starseer:{fam:'master2',kit:'star',legs:1,body:'#dfe6f4',sleeve:'#dfe6f4',vest:'#2a2f6a',silver:'#e8eef8',glow:'#bfe0ff',pant:'#3a3f7a',boot:'#2a2f6a',cuff:'#e8eef8',tall:1},
  soulreaper:{fam:'master2',kit:'reaper',body:'#1e1a22',sleeve:'#1e1a22',bone:'#ece4d0',sash:'#7a1420',wrap:'#3a3440',glow:'#ff4a5a',pant:'#1a161e',boot:'#141016',cuff:'#ece4d0',tall:1},
  plaguelord:{fam:'master2',kit:'plague',body:'#4a5a3a',sleeve:'#4a5a3a',apron:'#6a5a3a',apron2:'#4a3e28',glove:'#2a3a22',vials:['#9aff5a','#ff6aa0','#7ad8ff','#ffd27a'],leather:'#3a2a1a',pant:'#2e3a26',boot:'#22301c',cuff:'#9aff5a',tall:1},
  longshot:{fam:'master2',kit:'poncho',body:'#e8dcc0',sleeve:'#e8dcc0',poncho:'#b8402e',stripe:'#f0d890',stripe2:'#2a4a6a',leather:'#6a4426',brass:'#e0b850',pant:'#5a4a36',boot:'#7a4e2a',cuff:'#e0b850',tall:1},
  blastmaster:{fam:'master2',kit:'blast',body:'#3a3634',sleeve:'#5a3a22',vest:'#242222',hazard:'#ff8a2a',dyn:'#c8282e',fuse:'#e8dcc0',glove:'#8a5a32',pant:'#2a2624',boot:'#1a1816',cuff:'#ff8a2a',tall:1}};
// (the Gunslinger masters are on hold at the player's wish: drawn but not worn yet)
const MASTER2_FAM={tempestsage:'arcanist',voidcaller:'arcanist',dawnknight:'cleric',starseer:'cleric',soulreaper:'shade',plaguelord:'shade'};
if(typeof OUTFITS!=='undefined'){for(const [id,fam] of Object.entries(MASTER2_FAM)){OUTFITS[fam]=OUTFITS[fam]||{};OUTFITS[fam][id]=MASTER2_LOOKS[id];}}
function master2Part(K,part,v){const {x,y,by,f,bk,sway,OL,fs}=v,k0=-f,sw=sway*.2,HEM=by+1.8;
  const line=(c,w,pts)=>{ctx.strokeStyle=c;ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(pts[0],pts[1]);for(let i=2;i<pts.length;i+=2)ctx.lineTo(pts[i],pts[i+1]);ctx.stroke();};
  const band=(c,w,x0,y0,x1,y1)=>{line(OL,w+1.4,[x0,y0,x1,y1]);line(c,w,[x0,y0,x1,y1]);};
  const glowOn=c=>{ctx.shadowColor=c;ctx.shadowBlur=6;},glowOff=()=>{ctx.shadowBlur=0;};
  if(part==='back')return;
  if(part==='leg'){const {fx,fy,k}=v;if(typeof bootDetail==='function')bootDetail(fx,fy,f,K.cuff,K.boot,OL);
    if(K.kit==='poncho'&&k===f){ctx.fillStyle=K.brass;ctx.beginPath();for(let i=0;i<8;i++){const r=i%2?.6:1.6,a=i*Math.PI/4;ctx.lineTo(fx-f*3.6+Math.cos(a)*r,fy-2.4+Math.sin(a)*r);}ctx.closePath();ctx.fill();} // a spur
    if(K.kit==='blast'){ctx.fillStyle=K.hazard;ctx.fillRect(fx-2.6,fy-3.3,5.2,.9);}
    return;}
  if(part==='arm'){const {sx,sy,hx,hy2,k}=v,ang=Math.atan2(hy2-sy,hx-sx),far=k===k0,mid=(t)=>[sx+(hx-sx)*t,sy+(hy2-sy)*t];
    const glove=(c,r)=>{ctx.fillStyle=c;ctx.strokeStyle=OL;ctx.lineWidth=1.1;ctx.beginPath();ctx.ellipse(hx,hy2-1.8,r,r*.72,0,0,7);ctx.fill();ctx.stroke();};
    const rolled=()=>{const [ex,ey]=mid(.5);line(OL,5.6,[ex,ey,hx,hy2-1.5]);line('#f0cfae',3.4,[ex,ey,hx,hy2-1.5]);ctx.save();ctx.translate(ex,ey);ctx.rotate(ang);ctx.fillStyle=K.sleeve;ctx.strokeStyle=OL;ctx.lineWidth=.9;ctx.beginPath();ctx.roundRect(-2,-3,3.4,6,1.2);ctx.fill();ctx.stroke();ctx.restore();};
    const wraps=(c)=>{ctx.save();const [mx,my]=mid(.68);ctx.translate(mx,my);ctx.rotate(ang);ctx.strokeStyle=c;ctx.lineWidth=1.2;for(const d of [-2,0,2]){ctx.beginPath();ctx.moveTo(d-.7,-2.4);ctx.lineTo(d+.7,2.4);ctx.stroke();}ctx.restore();};
    switch(K.kit){
      case 'storm':glove('#1a1a20',3.3);glowOn(K.glow);ctx.fillStyle=K.glow;for(const d of [-1.4,0,1.4]){ctx.beginPath();ctx.arc(hx+d,hy2-3,.6,0,7);ctx.fill();}glowOff();break;
      case 'void':if(far){line(OL,6,[sx,sy,hx,hy2-1.5]);line(K.sleeve2,3.8,[sx,sy,hx,hy2-1.5]);}glove('#16141c',3.2);break;
      case 'dawn':if(!far)rolled();glove(far?K.metal:'#f0e0d0',3.2);break;
      case 'star':if(far){ctx.fillStyle=K.silver;ctx.strokeStyle=OL;ctx.lineWidth=1.1;ctx.beginPath();ctx.ellipse(hx,hy2-1.8,3.3,2.3,0,0,7);ctx.fill();ctx.stroke();}else glove('#3a3f7a',3.1);break;
      case 'reaper':wraps(K.wrap);glove('#141016',3.2);break;
      case 'plague':if(far)glove(K.glove,4.6);else{rolled();glove('#e8dcc0',3);}break;
      case 'poncho':glove(K.leather,3.2);break;
      case 'blast':if(far)glove(K.glove,4.6);else glove('#3a2a1a',3.2);break;}
    return;}
  if(part!=='torso')return;
  const pauld=(fn,sz)=>{ctx.save();ctx.translate(x+k0*12.6,by-11.2);ctx.rotate(k0*.3);if(sz)ctx.scale(sz,sz);fn(k0);ctx.restore();};
  switch(K.kit){
    case 'storm':{ /* a long storm-cloud robe (the body's robe, charcoal) split at the front over storm grey, a jagged
         lightning-yellow hem, a high collar on the far side, a dark belt with a yellow bolt buckle, the yellow bolt pauldron */
      const hemY=u=>y-2.5+3*(1-(u*2-1)*(u*2-1));
      ctx.fillStyle=K.under;ctx.strokeStyle=OL;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x-1.4,by-2);ctx.lineTo(x+1.4,by-2);ctx.lineTo(x+4.6+sw,hemY(.72));ctx.lineTo(x-3.4+sw,hemY(.34));ctx.closePath();fs();
      glowOn(K.glow);ctx.strokeStyle=K.glow;ctx.lineWidth=1.3;ctx.beginPath();for(let i=0;i<=12;i++){const u=i/12,px=x-10.5+u*21,py=hemY(u)-(i%2?2.2:.6);i?ctx.lineTo(px,py):ctx.moveTo(px,py);}ctx.stroke();glowOff();
      line(K.glow,1,[x-1.4,by-2,x-3.4+sw,hemY(.34)-1]);line(K.glow,1,[x+1.4,by-2,x+4.6+sw,hemY(.72)-1]);
      {const k=k0;ctx.fillStyle=K.robe2;ctx.strokeStyle=OL;ctx.lineWidth=1.1;ctx.beginPath();ctx.moveTo(x+k*3,by-15.6);ctx.quadraticCurveTo(x+k*8,by-19,x+k*10.6,by-17.4);ctx.lineTo(x+k*9.4,by-12.4);ctx.lineTo(x+k*4,by-13.4);ctx.closePath();fs();line(K.glow,.8,[x+k*4,by-15.4,x+k*9.8,by-17]);}
      ctx.fillStyle=K.belt;ctx.strokeStyle=OL;ctx.lineWidth=1.1;ctx.beginPath();ctx.roundRect(x-7.6,by-3.4,15.2,2.8,1);fs();
      glowOn(K.glow);ctx.fillStyle=K.glow;ctx.beginPath();ctx.moveTo(x+.6,by-4);ctx.lineTo(x-1.4,by-1.8);ctx.lineTo(x,by-1.8);ctx.lineTo(x-.8,by);ctx.lineTo(x+1.6,by-2.4);ctx.lineTo(x+.2,by-2.4);ctx.closePath();ctx.fill();glowOff();
      pauld(k=>{ctx.fillStyle=K.metal;ctx.strokeStyle=OL;ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(-k*4,-4.6);ctx.lineTo(k*3,-5.2);ctx.lineTo(k*.6,-1.6);ctx.lineTo(k*6.6,-2.2);ctx.lineTo(-k*1.6,3.4);ctx.lineTo(k*.4,-.6);ctx.lineTo(-k*5,-.2);ctx.closePath();fs();
        glowOn(K.glow);ctx.strokeStyle='#fffbe0';ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(k*2.4,-4.4);ctx.lineTo(k*.6,-1.6);ctx.lineTo(k*5,-1.8);ctx.stroke();glowOff();},1.35);break;}
    case 'void':{ /* a bone-white robe (the body's robe) with black void cracks rising from the hem, a black void stain
         making the far side look longer, a teal void-eye amulet, a black belt with short chains, black crystal shards */
      const hemY=u=>y-2.5+3*(1-(u*2-1)*(u*2-1));
      {const k=k0;ctx.fillStyle=K.ink;ctx.beginPath();ctx.moveTo(x+k*10.5,hemY(k<0?0:1));ctx.lineTo(x+k*8.2,by+.6);ctx.lineTo(x+k*6.4,by+3.2);ctx.lineTo(x+k*4,by+2.4);ctx.lineTo(x+k*2.6,hemY(.5)-.4);ctx.quadraticCurveTo(x+k*6,hemY(k<0?.2:.8)+.6,x+k*10.5,hemY(k<0?0:1));ctx.closePath();ctx.fill();}
      for(const [u,h,b] of [[.2,6,1],[.42,8.6,-1],[.62,5,1],[.8,7.4,-1]]){const px=x-10.5+u*21,py=hemY(u)-.4,pts=[px,py,px+b*1.2,py-h*.4,px-b*.6,py-h*.7,px+b*.8,py-h];
        line(K.ink,1.4,pts);glowOn(K.glow);line(K.glow,.5,pts);glowOff();}
      ctx.fillStyle=K.ink;ctx.strokeStyle=OL;ctx.lineWidth=1.1;ctx.beginPath();ctx.roundRect(x-7.8,by-3.4,15.6,2.6,1);fs();
      for(const d of [2.6,4.6]){ctx.strokeStyle=K.chain;ctx.lineWidth=.8;ctx.beginPath();for(let i=0;i<3;i++){ctx.moveTo(x+f*d+i*.4+.5,by-1+i*.8);ctx.arc(x+f*d+i*.4,by-1+i*.8,.5,0,7);}ctx.stroke();}
      ctx.fillStyle=K.ink;ctx.strokeStyle=OL;ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(x,by-6.4,2.8,1.9,0,0,7);fs();glowOn(K.glow);ctx.fillStyle=K.glow;ctx.beginPath();ctx.ellipse(x,by-6.4,1.6,1,0,0,7);ctx.fill();glowOff();ctx.fillStyle='#04120f';ctx.beginPath();ctx.arc(x,by-6.4,.6,0,7);ctx.fill();
      pauld(k=>{for(const [a,h,w] of [[-.5,8,2.4],[.15,10.5,2.8],[.75,7,2.2]]){ctx.save();ctx.rotate(k*a);ctx.fillStyle=K.crystal;ctx.strokeStyle=OL;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(-w,1);ctx.lineTo(0,-h);ctx.lineTo(w,1);ctx.closePath();fs();
        glowOn(K.glow);ctx.strokeStyle=K.glow;ctx.lineWidth=.7;ctx.beginPath();ctx.moveTo(0,-h+1.5);ctx.lineTo(0,-1);ctx.stroke();glowOff();ctx.restore();}
        ctx.fillStyle=K.ink;ctx.strokeStyle=OL;ctx.lineWidth=1.1;ctx.beginPath();ctx.ellipse(0,1,4.6,2.6,0,0,7);fs();},1.15);break;}
    case 'dawn':{ // rose-gold chest edge, a coral scarf tail, a sunburst disc on the far shoulder
      line(K.metal,1.6,[x-8.4,by-9.6,x,by-5,x+8.4,by-9.6]);
      ctx.fillStyle=K.metal;ctx.strokeStyle=OL;ctx.lineWidth=1.1;ctx.beginPath();ctx.roundRect(x-7.8,by-3.4,15.6,2.8,1);fs();ctx.fillStyle=K.gold;ctx.beginPath();ctx.arc(x,by-2,1.3,0,7);fs();
      for(const k of [-1,1]){ctx.fillStyle=K.metal2;ctx.beginPath();ctx.moveTo(x+k*2.6,by-.6);ctx.lineTo(x+k*7.8,by-.6);ctx.lineTo(x+k*8.2,HEM);ctx.lineTo(x+k*3,HEM);ctx.closePath();fs();}
      {const w=Math.sin(now*3)*.8;ctx.fillStyle=K.coral;ctx.strokeStyle=OL;ctx.lineWidth=1.1;ctx.beginPath();ctx.moveTo(x-8,by-12);ctx.quadraticCurveTo(x,by-7,x+8,by-12);ctx.lineTo(x+7.2,by-9.6);ctx.quadraticCurveTo(x,by-5,x-7.2,by-9.6);ctx.closePath();fs();
        ctx.beginPath();ctx.moveTo(x+f*4.6,by-9);ctx.quadraticCurveTo(x+f*7.6+w,by-4,x+f*7+w,by-.4);ctx.lineTo(x+f*5+w,by-1);ctx.quadraticCurveTo(x+f*5.2,by-5,x+f*3,by-8);ctx.closePath();fs();}
      pauld(k=>{ctx.fillStyle=K.gold;glowOn('#fff0b0');for(let i=0;i<10;i++){ctx.save();ctx.rotate(i*Math.PI/5);ctx.beginPath();ctx.moveTo(-1,-3.6);ctx.lineTo(0,-6.6);ctx.lineTo(1,-3.6);ctx.closePath();ctx.fill();ctx.restore();}glowOff();
        ctx.fillStyle=K.metal;ctx.strokeStyle=OL;ctx.lineWidth=1.1;ctx.beginPath();ctx.arc(0,0,4,0,7);fs();ctx.fillStyle=K.coral;ctx.beginPath();ctx.arc(0,0,1.6,0,7);ctx.fill();});break;}
    case 'star':{ // an indigo vest with silver stars, a crescent buckle, a silver scarf over the near shoulder
      for(const k of [-1,1]){ctx.fillStyle=K.vest;ctx.strokeStyle=OL;ctx.lineWidth=1.1;ctx.beginPath();ctx.moveTo(x+k*2,by-14);ctx.lineTo(x+k*8.6,by-14);ctx.quadraticCurveTo(x+k*9.4,by-5,x+k*8.6+sw,HEM-.4);ctx.lineTo(x+k*3+sw,HEM);ctx.closePath();fs();}
      ctx.fillStyle=K.silver;for(const [a,b] of [[-6,-9],[5.6,-7],[-4.6,-2],[6.4,-1.4],[-7,0]]){const px=x+a,py=by+b;ctx.beginPath();for(let i=0;i<8;i++){const r=i%2?.35:1.1,an=-Math.PI/2+i*Math.PI/4;ctx.lineTo(px+Math.cos(an)*r,py+Math.sin(an)*r);}ctx.closePath();ctx.fill();}
      ctx.strokeStyle=K.silver;ctx.lineWidth=1.6;ctx.beginPath();ctx.arc(x+.6,by-2.2,1.8,Math.PI*.35,Math.PI*1.65);ctx.stroke();
      {const w=Math.sin(now*3)*.8;ctx.fillStyle=K.silver;ctx.strokeStyle=OL;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x+f*4.6,by-12.6);ctx.quadraticCurveTo(x+f*9+w,by-6,x+f*8.6+w,by-1);ctx.lineTo(x+f*6.4+w,by-1.6);ctx.quadraticCurveTo(x+f*6.4,by-6,x+f*2.6,by-11.6);ctx.closePath();fs();}
      pauld(k=>{ctx.fillStyle=K.silver;ctx.strokeStyle=OL;ctx.lineWidth=1.2;ctx.beginPath();ctx.ellipse(0,0,6,4,0,Math.PI,0);ctx.quadraticCurveTo(0,2.6,-6,0);ctx.closePath();fs();glowOn(K.glow);ctx.fillStyle=K.glow;ctx.beginPath();ctx.arc(k*1.6,-1.8,1.2,0,7);ctx.fill();glowOff();});break;}
    case 'reaper':{ // bone ribs over black, a ragged dark red sash, a bone skull pauldron
      for(let i=0;i<3;i++){const yy=by-8.6+i*2.2;line(OL,2.6,[x-6+i*.4,yy,x,yy+1.2,x+6-i*.4,yy]);line(K.bone,1.3,[x-6+i*.4,yy,x,yy+1.2,x+6-i*.4,yy]);}
      band(K.bone,1.3,x,by-9.4,x,by-2.6);
      {const k=k0;ctx.fillStyle=K.sash;ctx.strokeStyle=OL;ctx.lineWidth=1.1;ctx.beginPath();ctx.moveTo(x-8,by-3.6);ctx.lineTo(x+8,by-3.6);ctx.lineTo(x+8,by-1);ctx.lineTo(x+k*6,by-.4);for(let i=0;i<4;i++)ctx.lineTo(x+k*(6+i*.8)+sw,(i%2?by+.6:HEM));ctx.lineTo(x+k*9+sw,by-1);ctx.lineTo(x-8,by-1);ctx.closePath();fs();}
      pauld(k=>{ctx.fillStyle=K.bone;ctx.strokeStyle=OL;ctx.lineWidth=1.2;ctx.beginPath();ctx.ellipse(0,-1,5,4.4,0,0,7);fs();ctx.beginPath();ctx.roundRect(-2.6,2.2,5.2,2.4,1);fs();
        ctx.fillStyle='#1a161e';for(const d of [-1.8,1.8]){ctx.beginPath();ctx.ellipse(d,-1.2,1.2,1.4,0,0,7);ctx.fill();}glowOn(K.glow);ctx.fillStyle=K.glow;for(const d of [-1.8,1.8]){ctx.beginPath();ctx.arc(d,-1,.45,0,7);ctx.fill();}glowOff();});break;}
    case 'plague':{ // a leather apron to the boot tops, a bandolier of coloured vials
      ctx.fillStyle=K.apron;ctx.strokeStyle=OL;ctx.lineWidth=1.1;ctx.beginPath();ctx.moveTo(x-6.4,by-8);ctx.lineTo(x+6.4,by-8);ctx.lineTo(x+7.6+sw,HEM);ctx.lineTo(x-7.6+sw,HEM);ctx.closePath();fs();
      line(K.apron2,1,[x-5,by-.6,x+5,by-.6]);ctx.fillStyle=K.apron2;ctx.beginPath();ctx.roundRect(x+f*1.4,by-5.6,3.6,3,.8);fs();
      band(K.leather,2,x+f*8,by-13.4,x-f*7.6,by-3.4);
      K.vials.forEach((c,i)=>{const t=.18+i*.2,px=x+f*8+(-f*15.6)*t,py=by-13.4+10*t;ctx.fillStyle=c;ctx.strokeStyle=OL;ctx.lineWidth=.8;ctx.beginPath();ctx.roundRect(px-1.1,py-3,2.2,3.4,.8);ctx.fill();ctx.stroke();ctx.fillStyle='#e8dcc0';ctx.fillRect(px-.7,py-3.6,1.4,.8);});break;}
    case 'poncho':{ // a red-striped poncho over the far shoulder, a bullet bandolier across
      band(K.leather,2.2,x+f*7.6,by-13.6,x-f*7.2,by-2.8);
      for(let i=0;i<5;i++){const t=.15+i*.17,px=x+f*7.6+(-f*14.8)*t,py=by-13.6+10.8*t;ctx.fillStyle=K.brass;ctx.strokeStyle=OL;ctx.lineWidth=.6;ctx.beginPath();ctx.roundRect(px-.7,py-2.6,1.4,2.6,.6);ctx.fill();ctx.stroke();}
      {const k=k0;ctx.fillStyle=K.poncho;ctx.strokeStyle=OL;ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(x-k*2,by-15.4);ctx.quadraticCurveTo(x+k*9,by-16,x+k*11+sw,by-6);ctx.lineTo(x+k*9.4+sw,HEM-.6);ctx.lineTo(x+k*1+sw,by-1);ctx.quadraticCurveTo(x-k*1,by-8,x-k*2,by-15.4);ctx.closePath();fs();
        for(const [t,c] of [[.35,K.stripe],[.55,K.stripe2],[.75,K.stripe]]){const y0=by-15+t*14;line(c,1.2,[x-k*.4,y0-1.6,x+k*(7+t*3)+sw,y0+.6]);}
        ctx.strokeStyle=K.stripe;ctx.lineWidth=.8;for(let i=0;i<4;i++){ctx.beginPath();ctx.moveTo(x+k*(2+i*2.2)+sw,HEM-1.2+i*.2);ctx.lineTo(x+k*(2+i*2.2)+sw,HEM+.6);ctx.stroke();}}
      ctx.fillStyle=K.leather;ctx.strokeStyle=OL;ctx.lineWidth=1.1;ctx.beginPath();ctx.roundRect(x-7.8,by-2.8,15.6,2.6,1);fs();ctx.fillStyle=K.brass;ctx.beginPath();ctx.roundRect(x-1.4,by-3,2.8,3,.6);fs();break;}
    case 'blast':{ // a soot-black vest with orange hazard stripes, a belt of red dynamite
      for(const k of [-1,1]){ctx.fillStyle=K.vest;ctx.strokeStyle=OL;ctx.lineWidth=1.1;ctx.beginPath();ctx.moveTo(x+k*1.8,by-14);ctx.lineTo(x+k*8.8,by-14);ctx.quadraticCurveTo(x+k*9.6,by-6,x+k*9+sw,by+.6);ctx.lineTo(x+k*2.6+sw,by);ctx.closePath();fs();
        ctx.save();ctx.clip();ctx.strokeStyle=K.hazard;ctx.lineWidth=1.6;for(let i=0;i<5;i++){ctx.beginPath();ctx.moveTo(x+k*1,by-8+i*3);ctx.lineTo(x+k*10,by-12+i*3);ctx.stroke();}ctx.restore();}
      ctx.fillStyle='#3a2a1a';ctx.strokeStyle=OL;ctx.lineWidth=1.1;ctx.beginPath();ctx.roundRect(x-8,by-3,16,2.8,1);fs();
      for(let i=0;i<5;i++){const px=x-6+i*3;ctx.fillStyle=K.dyn;ctx.strokeStyle=OL;ctx.lineWidth=.8;ctx.beginPath();ctx.roundRect(px-1.1,by-4.2,2.2,5.6,.8);ctx.fill();ctx.stroke();line(K.fuse,.6,[px,by-4.2,px+.6,by-5.2]);}
      {const sp=(now*7)%1;ctx.fillStyle=`rgba(255,${180+sp*60|0},80,${.9-sp*.5})`;ctx.beginPath();ctx.arc(x-6+.6,by-5.4,.7+sp*.5,0,7);ctx.fill();}break;}
  }
}
if(typeof outfitPart==='function'){const _opM2=outfitPart;outfitPart=function(K,part,v){if(!K||K.fam!=='master2')return _opM2.apply(this,arguments);
  ctx.save();ctx.lineJoin='round';ctx.lineCap='round';try{master2Part(K,part,v);}catch(e){}finally{ctx.restore();ctx.lineWidth=1.5;ctx.strokeStyle=v.OL;}};}
