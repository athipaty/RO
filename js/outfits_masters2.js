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
  dawnknight:{fam:'master2',kit:'dawn',robe:'#7a1a2a',under:'#1a1416',sleeve:'#7a1a2a',bronze:'#c8803a',bronze2:'#8a5424',glow:'#ff9a3a',metal:'#c8803a',boot:'#1a1416',cuff:'#c8803a'},
  starseer:{fam:'master2',kit:'star',robe:'#14141e',robe2:'#08080e',sleeve:'#14141e',gold:'#e8c060',silver:'#e8c060',boot:'#14141e',cuff:'#e8c060'},
  soulreaper:{fam:'master2',kit:'reaper',noSkull:1,body:'#d6dade',sleeve:'#c4c9ce',bone:'#f2eee4',rib:'#2e3440',sash:'#2ad8d0',wrap:'#5a6270',glow:'#3ae8e0',pant:'#3a404a',boot:'#262a32',cuff:'#3ae8e0',tall:1},
  plaguelord:{fam:'master2',kit:'plague',body:'#3a1e4a',sleeve:'#3a1e4a',apron:'#5a2a6a',apron2:'#2a1236',glove:'#16141a',vials:['#ffe23a','#ff9a3a','#ff4aa8','#d8ff3a'],leather:'#2a1a1a',pant:'#2a1636',boot:'#16141a',cuff:'#ffe23a',tall:1},
  longshot:{fam:'master2',kit:'poncho',body:'#e8dcc0',sleeve:'#e8dcc0',poncho:'#b8402e',stripe:'#f0d890',stripe2:'#2a4a6a',leather:'#6a4426',brass:'#e0b850',pant:'#5a4a36',boot:'#7a4e2a',cuff:'#e0b850',tall:1},
  blastmaster:{fam:'master2',kit:'blast',body:'#3a3634',sleeve:'#5a3a22',vest:'#242222',hazard:'#ff8a2a',dyn:'#c8282e',fuse:'#e8dcc0',glove:'#8a5a32',pant:'#2a2624',boot:'#1a1816',cuff:'#ff8a2a',tall:1}};
/* (v1.70.2) the Shade family redesigned: the Shade a simple rogue; the Nightblade and the Venomancer official uniforms
   (the same on both sides); their masters keep their own style */
Object.assign(MASTER2_LOOKS,{
  /* (v1.71.0) the Forgehand family: the Forgehand a working smith; the Runesmith and the Coinbreaker uniforms; the
     Forgemaster and the Goldlord their own way */
  forgehand:{fam:'master2',kit:'smith1',own:1,body:'#d8c8a8',sleeve:'#d8c8a8',apron:'#7a4e2a',apron2:'#5a3a1e',belt:'#4a3020',glove:'#6a4426',pant:'#4a3a2e',boot:'#5a3a22',cuff:'#b8925a',tall:1},
  runesmith:{fam:'master2',kit:'runesmith',own:1,body:'#7a6452',sleeve:'skin',shirt:'#7a6452',rag:'#c8402a',apron:'#3a2a1e',copper:'#c8783a',glow:'#ff8a3a',belt:'#2a1e16',pant:'#4a3c32',boot:'#2a1e16',cuff:'#5a4a3e'},
  coinbreaker:{fam:'master2',kit:'merchant',own:1,body:'#f0ece0',sleeve:'#f0ece0',vest:'#1e5a3a',gold:'#e8c25a',scarf:'#c8282e',belt:'#4a3020',pant:'#3a3a40',boot:'#4a3020',cuff:'#e8c25a',tall:1},
  forgemaster:{fam:'master2',kit:'forgemaster',body:'#1e2228',sleeve:'skin',shirt:'#1e2228',steel:'#9aa4b2',steel2:'#6a7482',glow:'#7ad8ff',strap:'#3a2e26',pant:'#2a3038',boot:'#1a1e24',cuff:'#9aa4b2',tall:1},
  goldlord:{fam:'master2',kit:'goldlord',body:'#f4ecd8',sleeve:'skin',tie:'#d8242e',tie2:'#9a141c',coat:'#4a1a5a',gold:'#ffd84a',belt:'#2a1236',pant:'#3f6aa8',denim:'#5a86c4',boot:'#2a1236',cuff:'#ffd84a'},
  shade:{fam:'master2',kit:'rogue2',own:1,body:'#3a3a44',sleeve:'#3a3a44',leather:'#6a4a30',scarf:'#8a8a94',metal:'#c8ccd4',wrap:'#8a8070',pant:'#2e2e36',boot:'#4a3a2a',cuff:'#8a8070',tall:1},
  nightblade:{fam:'master2',kit:'assassin2',own:1,body:'#16141c',sleeve:'skin',red:'#c8202e',red2:'#8a1420',metal:'#c8ccd4',pant:'#16141c',boot:'#100e14',cuff:'#c8202e',tall:1},
  venomancer:{fam:'master2',kit:'venom2',own:1,hood:'#3a4a2a',hood2:'#2a3820',pouch:'#5a3e24',body:'#1e3a24',sleeve:'#1e3a24',coat:'#1e3a24',coat2:'#16301c',venom:'#a8ff3a',leather:'#3a2a1a',pant:'#16261a',boot:'#16261a',cuff:'#a8ff3a',tall:1}});
// (the Gunslinger masters are on hold at the player's wish: drawn but not worn yet)
const MASTER2_FAM={forgehand:'forgehand',runesmith:'forgehand',coinbreaker:'forgehand',forgemaster:'forgehand',goldlord:'forgehand',shade:'shade',nightblade:'shade',venomancer:'shade',tempestsage:'arcanist',voidcaller:'arcanist',dawnknight:'cleric',starseer:'cleric',soulreaper:'shade',plaguelord:'shade'};
if(typeof OUTFITS!=='undefined'){for(const [id,fam] of Object.entries(MASTER2_FAM)){OUTFITS[fam]=OUTFITS[fam]||{};OUTFITS[fam][id]=MASTER2_LOOKS[id];}}
// (v1.70.2) the player's swap: the Shade masters wear the advanced callings' designs and the other way round
if(typeof OUTFITS!=='undefined'&&OUTFITS.shade){const o=OUTFITS.shade;[o.nightblade,o.soulreaper]=[o.soulreaper,o.nightblade];[o.venomancer,o.plaguelord]=[o.plaguelord,o.venomancer];}
/* (v1.70.1) the player's swap: the Templar wears the robe-coat with the glowing hem and the lantern, in the Cleric
   family's white, gold and sky blue; the Dawnknight wears the war-priest (stole, breastplate, sunburst guard, holy book:
   js/outfits_cleric.js 'templar') in red and black */
if(typeof OUTFITS!=='undefined'&&OUTFITS.cleric){
  /* and the Cleric (first job) and the Templar swap too: the Cleric wears the white-and-gold robe-coat with the lantern,
     the Templar the white robe with the blue stole panels and gold trim (js/outfits_cleric.js 'acolyte') */
  OUTFITS.cleric.templar={fam:'cleric',kit:'acolyte',robe:'#f4efe2',sleeve:'#f4efe2',stole:'#2e5aa8',trim:'#e8c25a',cape:'#e8e2d2'};
  OUTFITS.cleric.cleric={fam:'master2',kit:'dawn',noSun:1,robe:'#f6f2e8',under:'#cfe4f4',sleeve:'#f6f2e8',bronze:'#e8b84a',bronze2:'#b8862a',glow:'#ffd27a',metal:'#e8b84a',boot:'#b8a070',cuff:'#e8b84a'};
  OUTFITS.cleric.dawnknight={fam:'cleric',kit:'templar',own:1,noGuard:1,robe:'#1c1418',sleeve:'#1c1418',stole:'#c8202e',gold:'#e8b84a',steel:'#c8ccd4',boot:'#2a1a1a',tall:1};
  /* and the Oracle wears the constellation robe with the crescent, in pale sky with blue stars; the Starseer wears the
     flowing robe with the star-embroidered train and the crystal pendant (js/outfits_cleric.js 'oracle') in black and gold */
  OUTFITS.cleric.oracle={fam:'master2',kit:'star',noMoon:1,capelet:'#6ab0e0',pend:'#7fd3ff',belt:'#6ab0e0',robe:'#eaf3fb',robe2:'#cfe2f2',sleeve:'#eaf3fb',gold:'#3a86c8',silver:'#3a86c8',boot:'#9fc8e8',cuff:'#3a86c8'};
  OUTFITS.cleric.starseer={fam:'cleric',kit:'oracle',own:1,robe:'#16161e',sleeve:'#16161e',sky:'#e8c060',train:'#26264a',star:'#ffd870',trim:'#e8c060',glow:'#ffe8a0'};}
function master2Part(K,part,v){const {x,y,by,f,bk,sway,OL,fs}=v,k0=-f,sw=sway*.2,HEM=by+1.8;
  const line=(c,w,pts)=>{ctx.strokeStyle=c;ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(pts[0],pts[1]);for(let i=2;i<pts.length;i+=2)ctx.lineTo(pts[i],pts[i+1]);ctx.stroke();};
  const band=(c,w,x0,y0,x1,y1)=>{line(OL,w+1.4,[x0,y0,x1,y1]);line(c,w,[x0,y0,x1,y1]);};
  const glowOn=c=>{ctx.shadowColor=c;ctx.shadowBlur=6;},glowOff=()=>{ctx.shadowBlur=0;};
  if(part==='back'){if(K.kit==='venom2'){ /* the hood, down on the back */ctx.fillStyle=K.hood2;ctx.strokeStyle=OL;ctx.lineWidth=1.1;ctx.beginPath();ctx.ellipse(x-f*3,by-13.6,11.4,4.8,f*.12,0,7);ctx.fill();ctx.stroke();ctx.fillStyle='rgba(0,0,0,.25)';ctx.beginPath();ctx.ellipse(x-f*3,by-13,7,2.4,f*.12,0,7);ctx.fill();}
    if(K.kit==='assassin2'){for(const [d,len,c] of [[0,17,K.red],[1.6,13,K.red2]]){const w=Math.sin(now*4+d)*1.6,b=-f;ctx.fillStyle=c;ctx.strokeStyle=OL;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x+b*2,by-2+d);
      ctx.bezierCurveTo(x+b*8,by-1+d+w,x+b*(len-4),by+2+d-w,x+b*len+sway,by+4+d+w);ctx.lineTo(x+b*(len-1.4)+sway,by+6.4+d+w);ctx.bezierCurveTo(x+b*(len-5),by+4+d-w,x+b*7,by+1.6+d+w,x+b*1,by+.4+d);ctx.closePath();ctx.fill();ctx.stroke();}
for(const k of [-1,1]){ctx.save();ctx.translate(x,by-6);ctx.rotate(k*1.15);ctx.fillStyle='#16141c';ctx.strokeStyle=OL;ctx.lineWidth=1;ctx.beginPath();ctx.roundRect(-1.6,-9,3.2,17,1);ctx.fill();ctx.stroke();
      ctx.fillStyle=K.red;ctx.fillRect(-1.6,-9,3.2,1.3);ctx.fillStyle='#2a2430';ctx.beginPath();ctx.roundRect(-1,-15,2,6,.6);ctx.fill();ctx.stroke();ctx.fillStyle=K.metal;ctx.fillRect(-2.4,-9.6,4.8,1);ctx.fillStyle=K.red;ctx.beginPath();ctx.arc(0,-15.4,1.2,0,7);ctx.fill();ctx.stroke();ctx.restore();}}return;}
  if(part==='leg'){const {fx,fy,k}=v;if(typeof bootDetail==='function')bootDetail(fx,fy,f,K.cuff,K.boot,OL);
    if(K.kit==='poncho'&&k===f){ctx.fillStyle=K.brass;ctx.beginPath();for(let i=0;i<8;i++){const r=i%2?.6:1.6,a=i*Math.PI/4;ctx.lineTo(fx-f*3.6+Math.cos(a)*r,fy-2.4+Math.sin(a)*r);}ctx.closePath();ctx.fill();} // a spur
    if(K.kit==='blast'){ctx.fillStyle=K.hazard;ctx.fillRect(fx-2.6,fy-3.3,5.2,.9);}
    if(K.kit==='forgemaster'){ctx.fillStyle=K.steel;ctx.strokeStyle=OL;ctx.lineWidth=.8;ctx.beginPath();ctx.roundRect(fx-3,fy-6.6,6,1.4,.5);ctx.fill();ctx.stroke();} // (v1.71.9) a steel band round the boot top
    if(K.kit==='goldlord'){ /* (v1.71.7) long ripped blue jeans: down over the boot tops (only the shoe shows), a lighter
         fade down the front, a torn knee on the near leg and a smaller rip on the other */
      const top=v.hip-2.6,bot=fy-1.7,lx=(x+k*3.6+fx)/2;ctx.fillStyle=K.pant;ctx.strokeStyle=OL;ctx.lineWidth=1.1;
      ctx.beginPath();ctx.moveTo(x+k*3.6-3,top);ctx.lineTo(x+k*3.6+3,top);ctx.lineTo(fx+3.4,bot);ctx.lineTo(fx-3.4,bot);ctx.closePath();ctx.fill();ctx.stroke();
      ctx.strokeStyle=K.denim;ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(lx+f*.6,top+.8);ctx.lineTo(fx+f*.8,bot-.8);ctx.stroke(); // the fade
      ctx.strokeStyle='#e8c060';ctx.lineWidth=.45;ctx.setLineDash([.8,.8]);ctx.beginPath();ctx.moveTo(fx-3.1,bot-.7);ctx.lineTo(fx+3.1,bot-.7);ctx.stroke();ctx.setLineDash([]); // hem stitching
      }
    return;}
  if(part==='arm'){const {sx,sy,hx,hy2,k}=v,ang=Math.atan2(hy2-sy,hx-sx),far=k===k0,mid=(t)=>[sx+(hx-sx)*t,sy+(hy2-sy)*t];
    const glove=(c,r)=>{ctx.fillStyle=c;ctx.strokeStyle=OL;ctx.lineWidth=1.1;ctx.beginPath();ctx.ellipse(hx,hy2-1.8,r,r*.72,0,0,7);ctx.fill();ctx.stroke();};
    const rolled=()=>{const [ex,ey]=mid(.5);line(OL,5.6,[ex,ey,hx,hy2-1.5]);line('#f0cfae',3.4,[ex,ey,hx,hy2-1.5]);ctx.save();ctx.translate(ex,ey);ctx.rotate(ang);ctx.fillStyle=K.sleeve;ctx.strokeStyle=OL;ctx.lineWidth=.9;ctx.beginPath();ctx.roundRect(-2,-3,3.4,6,1.2);ctx.fill();ctx.stroke();ctx.restore();};
    const wraps=(c)=>{ctx.save();const [mx,my]=mid(.68);ctx.translate(mx,my);ctx.rotate(ang);ctx.strokeStyle=c;ctx.lineWidth=1.2;for(const d of [-2,0,2]){ctx.beginPath();ctx.moveTo(d-.7,-2.4);ctx.lineTo(d+.7,2.4);ctx.stroke();}ctx.restore();};
    switch(K.kit){
      case 'smith1':rolled();glove(K.glove,3.4);break;
      case 'runesmith': /* (v1.71.8) sleeves shoved up both arms; one sooty work glove with a glowing rune ring, the other hand bare */
        {ctx.save();ctx.translate(sx,sy);ctx.rotate(ang);ctx.fillStyle=K.shirt;ctx.strokeStyle=OL;ctx.lineWidth=1;ctx.beginPath();ctx.roundRect(-1.6,-3.4,5.4,6.8,1.6);ctx.fill();ctx.stroke(); // a short, pushed-up sleeve
          ctx.strokeStyle='rgba(0,0,0,.25)';ctx.lineWidth=.6;ctx.beginPath();ctx.moveTo(2.6,-3);ctx.lineTo(2.6,3);ctx.stroke();ctx.restore();}
        if(!far){ctx.fillStyle='rgba(40,30,24,.35)';ctx.beginPath();ctx.ellipse(...mid(.62),1.3,.8,ang,0,7);ctx.fill();} // a smudge of soot
        if(far){glove('#1a1614',3.3);ctx.strokeStyle=K.glow;ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(hx,hy2-3.4,3,1,0,Math.PI,0);ctx.stroke();}break;
      case 'merchant':glove('#f0ece0',3);break;
      case 'forgemaster':{ /* (v1.71.9) a black short-sleeved tee; the near forearm carries glowing blue forge tattoos and a big steel
          gauntlet, the far hand a fingerless glove with a steel wrist cuff */
        ctx.save();ctx.translate(sx,sy);ctx.rotate(ang);ctx.fillStyle=K.shirt;ctx.strokeStyle=OL;ctx.lineWidth=1;ctx.beginPath();ctx.roundRect(-1.6,-3.4,5.2,6.8,1.4);ctx.fill();ctx.stroke();
        ctx.strokeStyle=K.glow;ctx.lineWidth=.5;ctx.beginPath();ctx.moveTo(3,-3);ctx.lineTo(3,3);ctx.stroke();ctx.restore();
        if(!far){const [ax,ay]=mid(.55),[bx,by2]=mid(.8);glowOn(K.glow);ctx.strokeStyle=K.glow;ctx.lineWidth=.8;ctx.save();ctx.translate(ax,ay);ctx.rotate(ang);
            ctx.beginPath();ctx.moveTo(-1.4,-1.8);ctx.lineTo(0,0);ctx.lineTo(-1.4,1.8);ctx.moveTo(1.2,-1.8);ctx.lineTo(1.2,1.8);ctx.stroke();ctx.restore();glowOff();
          glove(K.steel,4.4);ctx.strokeStyle=K.steel2;ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(hx-3,hy2-3.2);ctx.lineTo(hx+3,hy2-3.2);ctx.stroke();
          glowOn(K.glow);ctx.strokeStyle=K.glow;ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(hx-2.4,hy2-2);ctx.lineTo(hx+2.4,hy2-.8);ctx.stroke();glowOff();}
        else{glove('#1a1e24',3.3);const [cx,cy]=mid(.84);ctx.save();ctx.translate(cx,cy);ctx.rotate(ang);ctx.fillStyle=K.steel;ctx.strokeStyle=OL;ctx.lineWidth=.9;ctx.beginPath();ctx.roundRect(-1.4,-2.8,2.8,5.6,.8);ctx.fill();ctx.stroke();ctx.restore();}
        break;}
      case 'goldlord':{ /* (v1.71.7) bare arms; a red cloth tied round the near upper arm, the knot's two tails fluttering */
        if(!far){const [mx,my]=mid(.5),fl=Math.sin(now*5)*.8;ctx.save();ctx.translate(mx,my);ctx.rotate(ang);
          ctx.fillStyle=K.tie;ctx.strokeStyle=OL;ctx.lineWidth=1;ctx.beginPath();ctx.roundRect(-2,-3.6,4,7.2,1.2);ctx.fill();ctx.stroke();
          ctx.strokeStyle=K.tie2;ctx.lineWidth=.7;ctx.beginPath();ctx.moveTo(-.5,-3);ctx.lineTo(-.5,3);ctx.stroke();
          const kx=0,ky=-f*3.6;ctx.fillStyle=K.tie;ctx.strokeStyle=OL;ctx.lineWidth=.9;
          for(const [a,l] of [[-.55,5.6],[.5,4.6]]){ctx.beginPath();ctx.moveTo(kx-.6,ky);ctx.lineTo(kx+Math.sin(a)*l-.8,ky-f*Math.cos(a)*l+fl);ctx.lineTo(kx+Math.sin(a)*l+.9,ky-f*Math.cos(a)*l+fl*.6);ctx.lineTo(kx+.6,ky);ctx.closePath();ctx.fill();ctx.stroke();}
          ctx.fillStyle=K.tie2;ctx.beginPath();ctx.arc(kx,ky,1.1,0,7);ctx.fill();ctx.stroke();ctx.restore();}
        glove('#2a1236',3.2);ctx.fillStyle=K.gold;ctx.beginPath();ctx.arc(hx+1.6,hy2-1.4,.9,0,7);ctx.fill();break;}
      case 'rogue2':wraps(K.wrap);glove(K.leather,3.1);break;
      case 'assassin2':{ /* a long arm guard from the elbow to the hand, crimson bands */ctx.save();const [mx,my]=mid(.7);ctx.translate(mx,my);ctx.rotate(ang);ctx.fillStyle=K.body;ctx.strokeStyle=OL;ctx.lineWidth=1;ctx.beginPath();ctx.roundRect(-5.4,-2.9,9.4,5.8,1.6);ctx.fill();ctx.stroke();ctx.fillStyle=K.red;ctx.fillRect(-4.2,-2.7,1.2,5.4);ctx.fillRect(-.6,-2.7,1.2,5.4);ctx.restore();glove('#16141c',3.1);break;}
      case 'venom2':glove('#1a2a1a',3.2);ctx.strokeStyle=K.venom;ctx.lineWidth=1.1;ctx.beginPath();ctx.ellipse(hx,hy2-3.4,3,1,0,Math.PI,0);ctx.stroke();break;
      case 'storm':glove('#1a1a20',3.3);glowOn(K.glow);ctx.fillStyle=K.glow;for(const d of [-1.4,0,1.4]){ctx.beginPath();ctx.arc(hx+d,hy2-3,.6,0,7);ctx.fill();}glowOff();break;
      case 'void':if(far){line(OL,6,[sx,sy,hx,hy2-1.5]);line(K.sleeve2,3.8,[sx,sy,hx,hy2-1.5]);}glove('#16141c',3.2);break;
      case 'dawn':glove(far?K.bronze:'#1a1416',3.3);break;
      case 'star':glove(far?K.gold:'#14141e',3.1);break;
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
    case 'dawn':{ /* a long wine-red robe-coat (the body's robe) split at the front over black, a glowing sunrise-orange
         hem, a bronze belt with a small glowing lantern at the hip, a big bronze sunburst disc on the far shoulder */
      const hemY=u=>y-2.5+3*(1-(u*2-1)*(u*2-1));
      ctx.fillStyle=K.under;ctx.strokeStyle=OL;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x-1.6,by-2);ctx.lineTo(x+1.6,by-2);ctx.lineTo(x+4.4+sw,hemY(.71));ctx.lineTo(x-3.2+sw,hemY(.35));ctx.closePath();fs();
      glowOn(K.glow);line(K.glow,1.6,(()=>{const p=[];for(let i=0;i<=10;i++){const u=i/10;p.push(x-10.5+u*21,hemY(u)-.8);}return p;})());glowOff();
      line(K.bronze,1,[x-1.6,by-2,x-3.2+sw,hemY(.35)-1]);line(K.bronze,1,[x+1.6,by-2,x+4.4+sw,hemY(.71)-1]);
      ctx.fillStyle=K.bronze;ctx.strokeStyle=OL;ctx.lineWidth=1.1;ctx.beginPath();ctx.roundRect(x-7.8,by-3.4,15.6,2.8,1);fs();
      {const lx=x+f*6,ly=by+1.2,sv=Math.sin(now*2)*.6;line(K.bronze2,.7,[lx,by-1,lx+sv,ly-1.6]);ctx.fillStyle=K.bronze2;ctx.strokeStyle=OL;ctx.lineWidth=.9;ctx.beginPath();ctx.roundRect(lx+sv-1.8,ly-1.6,3.6,4.4,1);fs();
        const fl=.75+.25*Math.sin(now*9);ctx.shadowColor=K.glow;ctx.shadowBlur=8*fl;ctx.fillStyle=`rgba(255,${170+fl*60|0},80,${fl})`;ctx.beginPath();ctx.ellipse(lx+sv,ly+.6,1.1,1.6,0,0,7);ctx.fill();ctx.shadowBlur=0;}
      if(!K.noSun)pauld(k=>{ctx.fillStyle=K.glow;glowOn(K.glow);for(let i=0;i<12;i++){ctx.save();ctx.rotate(i*Math.PI/6+now*.3);ctx.beginPath();ctx.moveTo(-1.1,-4);ctx.lineTo(0,-(i%2?6.4:7.6));ctx.lineTo(1.1,-4);ctx.closePath();ctx.fill();ctx.restore();}glowOff();
        ctx.fillStyle=K.bronze;ctx.strokeStyle=OL;ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(0,0,4.4,0,7);fs();ctx.fillStyle=K.robe;ctx.beginPath();ctx.arc(0,0,2,0,7);ctx.fill();ctx.fillStyle=K.glow;ctx.beginPath();ctx.arc(0,0,1,0,7);ctx.fill();},1.25);break;}
    case 'star':{ /* a long black night robe (the body's robe) with gold constellations that twinkle, the far side darker
         and longer, a gold crescent-moon pauldron */
      const hemY=u=>y-2.5+3*(1-(u*2-1)*(u*2-1));
      {const k=k0;ctx.fillStyle=K.robe2;ctx.beginPath();ctx.moveTo(x+k*10.5,hemY(k<0?0:1));ctx.lineTo(x+k*8.6,by-4);ctx.lineTo(x+k*3,by-2);ctx.lineTo(x+k*2,hemY(.5));ctx.quadraticCurveTo(x+k*6,hemY(k<0?.2:.8)+.8,x+k*10.5,hemY(k<0?0:1));ctx.closePath();ctx.fill();}
      line(K.gold,1.1,(()=>{const p=[];for(let i=0;i<=10;i++){const u=i/10;p.push(x-10.5+u*21,hemY(u)-.7);}return p;})());
      for(const C of [[[-6.6,-1],[-4.4,1.6],[-6,4.2],[-3.4,5.2]],[[3.4,-.4],[6,1.8],[4.6,4.6]],[[-1.4,-8],[1.6,-6.6]]]){ctx.strokeStyle='rgba(232,192,96,.55)';ctx.lineWidth=.5;ctx.beginPath();C.forEach(([a,b],i)=>i?ctx.lineTo(x+a,by+b):ctx.moveTo(x+a,by+b));ctx.stroke();
        C.forEach(([a,b],i)=>{const tw=.55+.45*Math.sin(now*3+a*1.7+b);ctx.fillStyle=K.gold;ctx.globalAlpha=tw;glowOn(K.gold);ctx.beginPath();for(let j=0;j<8;j++){const r=j%2?.35:1.1+tw*.3,an=-Math.PI/2+j*Math.PI/4;ctx.lineTo(x+a+Math.cos(an)*r,by+b+Math.sin(an)*r);}ctx.closePath();ctx.fill();glowOff();ctx.globalAlpha=1;});}
      ctx.fillStyle=K.belt||'#0c0c14';ctx.strokeStyle=OL;ctx.lineWidth=1.1;ctx.beginPath();ctx.roundRect(x-7.6,by-3.4,15.2,2.6,1);fs();ctx.strokeStyle=K.gold;ctx.lineWidth=1.4;ctx.beginPath();ctx.arc(x+.6,by-2.1,1.5,Math.PI*.35,Math.PI*1.65);ctx.stroke();
      if(K.capelet){ /* the Oracle's uniform: a short sky capelet over both shoulders, a white trim, a silver star clasp, a glowing crystal pendant */
        ctx.fillStyle=K.capelet;ctx.strokeStyle=OL;ctx.lineWidth=1.1;ctx.beginPath();ctx.moveTo(x-6,by-15.6);ctx.quadraticCurveTo(x-12.6,by-14.6,x-12,by-8.4);
        for(let i=0;i<=6;i++){const u=i/6;ctx.lineTo(x-12+u*24,by-8.4+Math.sin(u*Math.PI)*2.6+(i%2?1.4:0));}ctx.quadraticCurveTo(x+12.6,by-14.6,x+6,by-15.6);ctx.closePath();fs();
        ctx.strokeStyle='#ffffff';ctx.lineWidth=1;ctx.beginPath();for(let i=0;i<=6;i++){const u=i/6,px=x-11.4+u*22.8,py=by-9.4+Math.sin(u*Math.PI)*2.6+(i%2?1.4:0);i?ctx.lineTo(px,py):ctx.moveTo(px,py);}ctx.stroke();
        glowOn(K.pend);ctx.fillStyle=K.pend;ctx.strokeStyle=OL;ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(x,by-7.4);ctx.lineTo(x+1.8,by-5);ctx.lineTo(x,by-2.6);ctx.lineTo(x-1.8,by-5);ctx.closePath();ctx.fill();glowOff();ctx.stroke();
        ctx.fillStyle='#ffffff';ctx.beginPath();ctx.arc(x-.5,by-5.6,.5,0,7);ctx.fill();}
      if(!K.noMoon)pauld(k=>{ctx.fillStyle=K.gold;ctx.strokeStyle=OL;ctx.lineWidth=1.2;ctx.scale(k,1);glowOn(K.gold);ctx.beginPath();ctx.arc(0,0,6.4,-Math.PI/2,Math.PI/2,false);ctx.ellipse(0,0,2.6,6.4,0,Math.PI/2,-Math.PI/2,true);ctx.closePath();ctx.fill();glowOff();ctx.stroke();
        ctx.fillStyle='#fff6d8';ctx.beginPath();ctx.arc(4.4,-2.4,.8,0,7);ctx.fill();},1.2);break;}
    case 'rogue2':{ /* the Shade: a charcoal jerkin, brown straps crossed on the chest, a grey scarf knotted at the neck,
         a brown belt with a dagger sheath at the near hip */
      band(K.leather,1.6,x-7,by-13.6,x+6.4,by-3.4);band(K.leather,1.6,x+7,by-13.6,x-6.4,by-3.4);ctx.fillStyle=K.metal;ctx.beginPath();ctx.arc(x,by-8.6,1,0,7);ctx.fill();
      ctx.fillStyle=K.scarf;ctx.strokeStyle=OL;ctx.lineWidth=1.1;ctx.beginPath();ctx.moveTo(x-8,by-12.2);ctx.quadraticCurveTo(x,by-7.6,x+8,by-12.2);ctx.lineTo(x+7.4,by-10);ctx.quadraticCurveTo(x,by-5.4,x-7.4,by-10);ctx.closePath();fs();
      ctx.beginPath();ctx.moveTo(x+f*2.6,by-7.6);ctx.lineTo(x+f*4.6+sw,by-3.8);ctx.lineTo(x+f*3+sw,by-3.4);ctx.lineTo(x+f*1.6,by-7);ctx.closePath();fs();
      ctx.fillStyle=K.leather;ctx.beginPath();ctx.roundRect(x-7.8,by-3,15.6,2.6,1);fs();ctx.fillStyle=K.metal;ctx.beginPath();ctx.roundRect(x-1.2,by-3.2,2.4,3,.6);fs();
      ctx.save();ctx.translate(x+f*6.6,by-1.4);ctx.rotate(f*.35);ctx.fillStyle='#2a2028';ctx.strokeStyle=OL;ctx.lineWidth=.9;ctx.beginPath();ctx.roundRect(-1.2,0,2.4,5,.8);fs();ctx.fillStyle=K.metal;ctx.beginPath();ctx.moveTo(-1.2,4.6);ctx.lineTo(1.2,4.6);ctx.lineTo(0,6.4);ctx.closePath();ctx.fill();ctx.fillStyle=K.leather;ctx.fillRect(-.8,-2.4,1.6,2.4);ctx.restore();
      /* (v1.70.2) details */ctx.setLineDash([1.2,1.2]);line('rgba(255,255,255,.28)',.6,[x,by-6.6,x,by-3.4]);ctx.setLineDash([]);for(const k of [-1,1]){ctx.fillStyle=K.metal;ctx.fillRect(x+k*5.4-.9,by-11.2,1.8,1.8);}line('rgba(255,255,255,.35)',.7,[x-6.6,by-10.6,x,by-6.6,x+6.6,by-10.6]);ctx.fillStyle=K.leather;ctx.strokeStyle=OL;ctx.lineWidth=.8;ctx.beginPath();ctx.roundRect(x-f*7.4-1.8,by-1.4,3.6,3.2,.8);ctx.fill();ctx.stroke();ctx.fillStyle='#4a3020';ctx.fillRect(x-f*7.4-1.8,by-1.4,3.6,1.1);break;}
    case 'assassin2':{ /* the Nightblade's uniform: a fitted black jacket with a high collar, crimson trims in a V, a
         crimson sash with a knot, the same on both sides */
      for(const k of [-1,1]){ctx.fillStyle=K.body;ctx.strokeStyle=OL;ctx.lineWidth=1.1;ctx.beginPath();ctx.moveTo(x+k*4,by-16.4);ctx.lineTo(x+k*8.6,by-15.4);ctx.lineTo(x+k*8.8,by-12);ctx.lineTo(x+k*5,by-12.8);ctx.closePath();fs();line(K.red,1,[x+k*5,by-15.6,x+k*8.2,by-14.8]);}
      for(const k of [-1,1])band(K.red,1.3,x+k*8,by-12.4,x+k*1.2,by-4.4);
      for(const k of [-1,1]){ctx.strokeStyle=K.red;ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(x+k*9.2,by-12,3.2,k>0?Math.PI*.55:Math.PI*.05,k>0?Math.PI*.95:Math.PI*.45);ctx.stroke();}
      ctx.fillStyle=K.red;ctx.strokeStyle=OL;ctx.lineWidth=1.1;ctx.beginPath();ctx.roundRect(x-7.8,by-3.4,15.6,2.8,1);fs();
      for(const k of [-1,1]){ctx.fillStyle=K.red2;ctx.beginPath();ctx.moveTo(x+k*1.4,by-1.6);ctx.lineTo(x+k*3.4+sw,HEM);ctx.lineTo(x+k*1+sw,HEM-.4);ctx.closePath();fs();}
      ctx.fillStyle=K.red;ctx.beginPath();ctx.ellipse(x,by-2,1.8,1.4,0,0,7);fs();
      for(let i=0;i<3;i++){const px=x+f*4.6+i*f*1.4;ctx.fillStyle=K.metal;ctx.beginPath();ctx.moveTo(px,by-.6);ctx.lineTo(px+.5,by-3);ctx.lineTo(px-.5,by-3);ctx.closePath();ctx.fill();}break;}
    case 'venom2':{ /* the Venomancer's uniform: a dark green coat to the boot tops with lime piping, a short capelet on
         both shoulders, a belt of lime vials */
      for(const k of [-1,1]){ctx.fillStyle=K.coat;ctx.strokeStyle=OL;ctx.lineWidth=1.1;ctx.beginPath();ctx.moveTo(x+k*1.8,by-3);ctx.lineTo(x+k*8.2,by-3);ctx.lineTo(x+k*9+sw,HEM);ctx.lineTo(x+k*2.6+sw,HEM);ctx.closePath();fs();line(K.venom,.9,[x+k*2.2,by-2.4,x+k*3+sw,HEM-.4]);}
      ctx.fillStyle=K.hood;ctx.strokeStyle=OL;ctx.lineWidth=1.1;ctx.beginPath();ctx.moveTo(x-6,by-15.6);ctx.quadraticCurveTo(x-12.4,by-14.6,x-11.6,by-8.6);
      for(let i=0;i<=6;i++){const u=i/6;ctx.lineTo(x-11.6+u*23.2,by-8.6+Math.sin(u*Math.PI)*2.4+(i%2?1.2:0));}ctx.quadraticCurveTo(x+12.4,by-14.6,x+6,by-15.6);ctx.closePath();fs();
      line(K.venom,1,(()=>{const p=[];for(let i=0;i<=6;i++){const u=i/6;p.push(x-11+u*22,by-9.4+Math.sin(u*Math.PI)*2.4+(i%2?1.2:0));}return p;})());
      band(K.pouch,1.5,x-6.4,by-8.4,x+6.6,by-3.6);band(K.pouch,1.5,x+6.4,by-8.4,x-6.6,by-3.6);
      for(const [t,k] of [[.4,1],[.4,-1]]){const px=x-6.4*k+13*k*t,py=by-8.4+4.8*t;ctx.fillStyle=K.pouch;ctx.strokeStyle=OL;ctx.lineWidth=.8;ctx.beginPath();ctx.roundRect(px-1.6,py-1.2,3.2,2.6,.6);ctx.fill();ctx.stroke();ctx.fillStyle=K.venom;ctx.fillRect(px-.4,py-.6,.8,.8);}
      ctx.fillStyle=K.leather;ctx.strokeStyle=OL;ctx.lineWidth=1.1;ctx.beginPath();ctx.roundRect(x-7.8,by-3.6,15.6,2.6,1);fs();
      for(const d of [-5,-2,2,5]){ctx.fillStyle=K.venom;ctx.strokeStyle=OL;ctx.lineWidth=.7;ctx.beginPath();ctx.roundRect(x+d-.9,by-4.6,1.8,3.4,.7);ctx.fill();ctx.stroke();ctx.fillStyle='#e8dcc0';ctx.fillRect(x+d-.6,by-5.2,1.2,.7);}
      glowOn(K.venom);ctx.fillStyle=K.venom;ctx.beginPath();ctx.arc(x,by-6.6,1.2,0,7);ctx.fill();glowOff();
      /* (v1.70.2) details */ctx.fillStyle='#e0b850';ctx.strokeStyle=OL;ctx.lineWidth=.8;ctx.beginPath();ctx.arc(x,by-6.3,1.4,0,7);ctx.fill();ctx.stroke();{const pl=.5+.5*Math.sin(now*3);ctx.save();ctx.globalAlpha=.35+pl*.4;glowOn(K.venom);ctx.fillStyle=K.venom;for(const d of [-5,-2,2,5]){ctx.beginPath();ctx.arc(x+d,by-2.6,1.4,0,7);ctx.fill();}glowOff();ctx.restore();}break;}
    case 'smith1':{ /* the Forgehand: a linen shirt, a leather smith's apron with a neck strap and a pocket, a small hammer
         at the near hip */
      line(OL,2.6,[x-5,by-14.6,x-3.4,by-8.6]);line(K.apron,1.4,[x-5,by-14.6,x-3.4,by-8.6]);line(OL,2.6,[x+5,by-14.6,x+3.4,by-8.6]);line(K.apron,1.4,[x+5,by-14.6,x+3.4,by-8.6]);
      ctx.fillStyle=K.apron;ctx.strokeStyle=OL;ctx.lineWidth=1.1;ctx.beginPath();ctx.moveTo(x-5,by-8.8);ctx.lineTo(x+5,by-8.8);ctx.lineTo(x+7+sw,HEM);ctx.lineTo(x-7+sw,HEM);ctx.closePath();fs();
      ctx.setLineDash([1,1.2]);line('rgba(255,230,190,.4)',.6,[x-4.2,by-7.8,x-6+sw,HEM-.6]);line('rgba(255,230,190,.4)',.6,[x+4.2,by-7.8,x+6+sw,HEM-.6]);ctx.setLineDash([]);
      ctx.fillStyle=K.apron2;ctx.beginPath();ctx.roundRect(x-2.6,by-5.4,5.2,3.4,.8);fs();
      ctx.fillStyle=K.belt;ctx.beginPath();ctx.roundRect(x-7.8,by-2.8,15.6,2.4,1);fs();
      ctx.save();ctx.translate(x+f*7,by-1.2);ctx.rotate(f*.3);ctx.fillStyle='#6a4a2a';ctx.strokeStyle=OL;ctx.lineWidth=.8;ctx.beginPath();ctx.roundRect(-.7,0,1.4,6,.5);ctx.fill();ctx.stroke();
      ctx.fillStyle='#8a909c';ctx.beginPath();ctx.roundRect(-2.4,-1.2,4.8,2.4,.6);ctx.fill();ctx.stroke();ctx.restore();break;}
    case 'runesmith':{ /* (v1.71.8) the Runesmith, relaxed: a loose sooty work shirt open at the collar, the apron's bib folded
         down at the waist with one strap hanging loose, a belt worn low and crooked, a red rag tucked in on one side, one
         glowing rune scrawled on the apron (not stitched in rows) and a copper rune charm on a cord. No shoulder pads. */
      ctx.fillStyle=v.skin||'#f6d6b8';ctx.strokeStyle=OL;ctx.lineWidth=.9;ctx.beginPath();ctx.moveTo(x-2.8,by-14.2);ctx.lineTo(x+2.8,by-14.2);ctx.lineTo(x+f*.6,by-9.4);ctx.closePath();ctx.fill();ctx.stroke(); // open collar
      line(OL,.8,[x-2.8,by-14.2,x-4.2,by-12]);line(OL,.8,[x+2.8,by-14.2,x+4.2,by-12]);
      line('#3a2a1e',.7,[x-2.4,by-13.8,x+f*.4,by-9.6,x+2.4,by-13.8]);ctx.fillStyle=K.copper;ctx.strokeStyle=OL;ctx.lineWidth=.8;ctx.beginPath();ctx.arc(x+f*.4,by-9,1.5,0,7);ctx.fill();ctx.stroke(); // the charm
      glowOn(K.glow);ctx.fillStyle=K.glow;ctx.beginPath();ctx.arc(x+f*.4,by-9,.6,0,7);ctx.fill();glowOff();
      ctx.fillStyle=K.apron;ctx.strokeStyle=OL;ctx.lineWidth=1.1;ctx.beginPath();ctx.moveTo(x-6.6,by-4.6);ctx.lineTo(x+6.6,by-4.6);ctx.lineTo(x+7.4+sw,HEM);ctx.lineTo(x-7.4+sw,HEM);ctx.closePath();fs(); // the apron, from the waist
      ctx.fillStyle='#4a3626';ctx.beginPath();ctx.moveTo(x-6.4,by-4.6);ctx.lineTo(x+6.4,by-4.6);ctx.lineTo(x+5.4,by-1.8);ctx.lineTo(x-5,by-2.2);ctx.closePath();fs(); // the bib, folded down over it
      {const k=-f,sv=Math.sin(now*2.2)*.5;line(OL,2.2,[x+k*4.6,by-2.4,x+k*6+sv,by+1.4]);line('#4a3626',1.2,[x+k*4.6,by-2.4,x+k*6+sv,by+1.4]);} // a loose strap
      glowOn(K.glow);ctx.strokeStyle=K.glow;ctx.lineWidth=.9;ctx.beginPath();ctx.moveTo(x+f*1.6,by-.6);ctx.lineTo(x+f*.2,by+.6);ctx.lineTo(x+f*2,by+1.2);ctx.lineTo(x+f*.6,by+1.9);ctx.stroke();glowOff(); // one scrawled rune
      ctx.save();ctx.translate(x,by-5.2);ctx.rotate(f*.08);ctx.fillStyle=K.belt;ctx.strokeStyle=OL;ctx.lineWidth=1.1;ctx.beginPath();ctx.roundRect(-7.8,-1.2,15.6,2.4,1);fs();ctx.fillStyle=K.copper;ctx.beginPath();ctx.roundRect(f*3-1.3,-1.4,2.6,2.8,.6);fs();ctx.restore(); // low, crooked belt
      {const k=f,sv=Math.sin(now*1.8+1)*.7;ctx.fillStyle=K.rag;ctx.strokeStyle=OL;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x+k*2.6,by-5.8);ctx.lineTo(x+k*6.4,by-5.6);ctx.lineTo(x+k*7+sv,by+1.6);ctx.lineTo(x+k*5.6+sv,by+.6);ctx.lineTo(x+k*4.4+sv,by+2);ctx.lineTo(x+k*3.4+sv,by+.4);ctx.closePath();ctx.fill();ctx.stroke();
        line('rgba(255,255,255,.3)',.6,[x+k*4,by-4.4,x+k*4.8+sv,by+.4]);} // a red rag tucked in the belt, hanging in front
      break;}
    case 'merchant':{ /* the Coinbreaker's uniform: a white shirt, a deep green vest with gold buttons on both sides, a red
         neckerchief, a gold coin purse at the near hip */
      for(const k of [-1,1]){ctx.fillStyle=K.vest;ctx.strokeStyle=OL;ctx.lineWidth=1.1;ctx.beginPath();ctx.moveTo(x+k*2.2,by-14);ctx.lineTo(x+k*8.6,by-14);ctx.quadraticCurveTo(x+k*9.4,by-6,x+k*8.6,by-.4);ctx.lineTo(x+k*2.6,by-.8);ctx.closePath();fs();
        ctx.fillStyle=K.gold;for(const yy of [-9,-6,-3])if(k>0){ctx.beginPath();ctx.arc(x+k*3.6,by+yy,.8,0,7);ctx.fill();}}
      ctx.fillStyle=K.scarf;ctx.strokeStyle=OL;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x-6.6,by-11.6);ctx.quadraticCurveTo(x,by-7.4,x+6.6,by-11.6);ctx.lineTo(x+1.4,by-7.6);ctx.lineTo(x,by-5.2);ctx.lineTo(x-1.4,by-7.6);ctx.closePath();fs();
      ctx.fillStyle=K.belt;ctx.beginPath();ctx.roundRect(x-7.8,by-1.4,15.6,2.4,1);fs();
      {const px=x+f*6.4,py=by+1.4,sv=Math.sin(now*2)*.4;ctx.fillStyle=K.gold;ctx.strokeStyle=OL;ctx.lineWidth=.9;ctx.beginPath();ctx.ellipse(px+sv,py,2.6,2.2,0,0,7);ctx.fill();ctx.stroke();
        ctx.fillStyle='#8a6a1a';ctx.fillRect(px+sv-1.6,py-2.2,3.2,.8);ctx.fillStyle='#fff6c8';ctx.beginPath();ctx.arc(px+sv-.8,py-.4,.6,0,7);ctx.fill();}break;}
    case 'forgemaster':{ /* the Forgemaster, its own way: steel grey, one huge iron pauldron with glowing blue cracks on the
         far shoulder, a half apron of steel plates on one side, a blue-hot belt buckle; (v1.71.9) cooler: a black tee, a leather
         harness across the chest with a steel ring, a chain looping from the belt, glowing blue lines down the trousers */
      {const k=-f;for(let r=0;r<3;r++){const t=by-2+r*1.4;ctx.fillStyle=r%2?K.steel2:K.steel;ctx.strokeStyle=OL;ctx.lineWidth=.9;ctx.beginPath();ctx.roundRect(Math.min(x+k*1,x+k*8.4),t,7.4,1.8,.5);ctx.fill();ctx.stroke();}}
      band(K.strap,1.8,x-f*7.6,by-13.6,x+f*6.6,by-3.4); // the harness, from the far shoulder to the near hip
      ctx.strokeStyle=K.steel;ctx.lineWidth=1;ctx.beginPath();ctx.arc(x+f*1.4,by-9,1.5,0,7);ctx.stroke();
      ctx.fillStyle='#1a1e24';ctx.strokeStyle=OL;ctx.lineWidth=1.1;ctx.beginPath();ctx.roundRect(x-7.8,by-3.4,15.6,2.6,1);fs();
      glowOn(K.glow);ctx.fillStyle=K.glow;ctx.beginPath();ctx.roundRect(x-1.6,by-3.6,3.2,3,.8);ctx.fill();glowOff();
      {const k=f,sv=Math.sin(now*2)*.3;ctx.strokeStyle=K.steel;ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(x+k*3,by-1.6);ctx.quadraticCurveTo(x+k*5+sv,by+3.4,x+k*7.4,by-1.4);ctx.stroke();
        for(let q=1;q<6;q++){const u=q/6,px=(1-u)*(1-u)*(x+k*3)+2*u*(1-u)*(x+k*5+sv)+u*u*(x+k*7.4),py=(1-u)*(1-u)*(by-1.6)+2*u*(1-u)*(by+3.4)+u*u*(by-1.4);ctx.beginPath();ctx.ellipse(px,py,.7,.5,0,0,7);ctx.stroke();}} // the chain
      glowOn(K.glow);for(const k of [-1,1])line(K.glow,.6,[x+k*5.6,by,x+k*6.4,by+4]);glowOff(); // blue lines down the trousers
      pauld(k=>{for(let i=2;i>=0;i--){ctx.fillStyle=i===0?K.steel:K.steel2;ctx.strokeStyle=OL;ctx.lineWidth=1.2;ctx.beginPath();ctx.ellipse(k*.6*i,i*2.6,8.6-i*1.2,5.6-i*.8,0,Math.PI,0);ctx.quadraticCurveTo(k*.6*i,i*2.6+3,-(8.6-i*1.2)+k*.6*i,i*2.6);ctx.closePath();ctx.fill();ctx.stroke();}
        glowOn(K.glow);ctx.strokeStyle=K.glow;ctx.lineWidth=.9;ctx.beginPath();ctx.moveTo(-4,-3.4);ctx.lineTo(-1.4,-1.4);ctx.lineTo(-2.4,1);ctx.moveTo(2.6,-4);ctx.lineTo(1.4,-1.6);ctx.lineTo(3.6,.2);ctx.stroke();glowOff();
        for(const [rx,ry] of [[-5.6,.4],[0,-4.4],[5.6,.4]]){ctx.fillStyle=K.steel2;ctx.strokeStyle=OL;ctx.lineWidth=.7;ctx.beginPath();ctx.arc(rx,ry,.9,0,7);ctx.fill();ctx.stroke();}},1.1); // rivets
      break;}
    case 'goldlord':{ /* the Goldlord, its own way: a royal purple coat open on the near side and long on the far side, a gold
         chain across the chest, a gold coin pauldron on the far shoulder */
      /* (v1.71.7) the jeans' seat over the shirt's hem, so the long blue jeans read from the belt down */
      ctx.fillStyle=K.pant;ctx.strokeStyle=OL;ctx.lineWidth=1.1;ctx.beginPath();ctx.moveTo(x-7.4,by-1.6);ctx.lineTo(x+7.4,by-1.6);ctx.lineTo(x+7,by+3.4);ctx.lineTo(x-7,by+3.4);ctx.closePath();fs();
      line(OL,.8,[x,by-.6,x,by+3.4]);line(K.denim,1,[x+f*4.4,by-.8,x+f*4.8,by+3.2]);
      if(!bk)for(const [rx,ry,w,h,n] of [[x+f*3.6,by+1.3,2.1,1.25,2],[x-f*3.8,by+.6,1.4,.9,1]]){ // the rips: skin through torn denim, white threads across
        ctx.fillStyle=v.skin||'#f6d6b8';ctx.strokeStyle=OL;ctx.lineWidth=.6;ctx.beginPath();ctx.ellipse(rx,ry,w,h,0,0,7);ctx.fill();ctx.stroke();
        for(let q=0;q<n;q++){const d=n>1?(q?.45:-.45):0;line('#f4f6fa',.55,[rx-w-.3,ry+d,rx+w+.3,ry+d]);}}
      {const k=-f;ctx.fillStyle=K.coat;ctx.strokeStyle=OL;ctx.lineWidth=1.1;ctx.beginPath();ctx.moveTo(x+k*1.6,by-14);ctx.lineTo(x+k*8.8,by-14);ctx.quadraticCurveTo(x+k*9.8+sw,by-4,x+k*9.4+sw,HEM);ctx.lineTo(x+k*3.4+sw,HEM-.6);ctx.closePath();fs();line(K.gold,1,[x+k*2,by-13,x+k*3.8+sw,HEM-1]);}
      {const k=f;ctx.fillStyle=K.coat;ctx.beginPath();ctx.moveTo(x+k*3,by-14);ctx.lineTo(x+k*8.6,by-14);ctx.quadraticCurveTo(x+k*9.2,by-8,x+k*8.4,by-4.6);ctx.lineTo(x+k*4.2,by-5.4);ctx.closePath();fs();line(K.gold,1,[x+k*3.4,by-13,x+k*4.4,by-5.6]);}
      ctx.fillStyle=K.belt;ctx.strokeStyle=OL;ctx.lineWidth=1.1;ctx.beginPath();ctx.roundRect(x-7.8,by-3.2,15.6,2.6,1);fs();ctx.fillStyle=K.gold;ctx.beginPath();ctx.arc(x,by-1.9,1.5,0,7);fs();
      {const pts=[];for(let i=0;i<=8;i++){const u=i/8;pts.push([x-6.6+u*13.2,by-9+Math.sin(u*Math.PI)*3.4]);}ctx.fillStyle=K.gold;for(const [px,py] of pts){ctx.beginPath();ctx.ellipse(px,py,.9,.6,0,0,7);ctx.fill();}}
      pauld(k=>{glowOn(K.gold);ctx.fillStyle=K.gold;ctx.strokeStyle=OL;ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(0,0,5.6,0,7);ctx.fill();glowOff();ctx.stroke();
        ctx.strokeStyle='#b8861e';ctx.lineWidth=1;ctx.beginPath();ctx.arc(0,0,4,0,7);ctx.stroke();ctx.fillStyle='#b8861e';ctx.font='bold 5px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('G',0,.3);},1.1);break;}
    case 'reaper':{ // bone ribs over black, a ragged dark red sash, a bone skull pauldron
      for(let i=0;i<3;i++){const yy=by-8.6+i*2.2;line(OL,2.6,[x-6+i*.4,yy,x,yy+1.2,x+6-i*.4,yy]);line(K.rib||K.bone,1.3,[x-6+i*.4,yy,x,yy+1.2,x+6-i*.4,yy]);}
      band(K.rib||K.bone,1.3,x,by-9.4,x,by-2.6);
      {const k=k0;ctx.fillStyle=K.sash;ctx.strokeStyle=OL;ctx.lineWidth=1.1;ctx.beginPath();ctx.moveTo(x-8,by-3.6);ctx.lineTo(x+8,by-3.6);ctx.lineTo(x+8,by-1);ctx.lineTo(x+k*6,by-.4);for(let i=0;i<4;i++)ctx.lineTo(x+k*(6+i*.8)+sw,(i%2?by+.6:HEM));ctx.lineTo(x+k*9+sw,by-1);ctx.lineTo(x-8,by-1);ctx.closePath();fs();}
      if(!K.noSkull)pauld(k=>{ctx.fillStyle=K.bone;ctx.strokeStyle=OL;ctx.lineWidth=1.2;ctx.beginPath();ctx.ellipse(0,-1,5,4.4,0,0,7);fs();ctx.beginPath();ctx.roundRect(-2.6,2.2,5.2,2.4,1);fs();
        ctx.fillStyle='#1a161e';for(const d of [-1.8,1.8]){ctx.beginPath();ctx.ellipse(d,-1.2,1.2,1.4,0,0,7);ctx.fill();}glowOn(K.glow);ctx.fillStyle=K.glow;for(const d of [-1.8,1.8]){ctx.beginPath();ctx.arc(d,-1,.45,0,7);ctx.fill();}glowOff();});
      /* (v1.70.2) details */for(const k of [-1,1]){ctx.save();ctx.translate(x+k*10.4,by-12.6);ctx.rotate(k*.35);ctx.fillStyle=K.bone;ctx.strokeStyle=OL;ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(0,0,4.6,3,0,Math.PI,0);ctx.quadraticCurveTo(0,1.8,-4.6,0);ctx.closePath();ctx.fill();ctx.stroke();ctx.strokeStyle=K.glow;ctx.lineWidth=.9;ctx.beginPath();ctx.ellipse(0,0,4,2.4,0,Math.PI*1.1,Math.PI*1.9);ctx.stroke();ctx.restore();}glowOn(K.glow);line(K.glow,.7,[x,by-9.2,x,by-4]);glowOff();ctx.fillStyle=K.bone;ctx.strokeStyle=OL;ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(x+f*3,by-2.4);ctx.lineTo(x+f*4.2,by-.2);ctx.lineTo(x+f*3,by+1.6);ctx.lineTo(x+f*1.8,by-.2);ctx.closePath();ctx.fill();ctx.stroke();break;}
    case 'plague':{ // a leather apron to the boot tops, a bandolier of coloured vials
      ctx.fillStyle=K.apron;ctx.strokeStyle=OL;ctx.lineWidth=1.1;ctx.beginPath();ctx.moveTo(x-6.4,by-8);ctx.lineTo(x+6.4,by-8);ctx.lineTo(x+7.6+sw,HEM);ctx.lineTo(x-7.6+sw,HEM);ctx.closePath();fs();
      line(K.apron2,1,[x-5,by-.6,x+5,by-.6]);ctx.fillStyle=K.apron2;ctx.beginPath();ctx.roundRect(x+f*1.4,by-5.6,3.6,3,.8);fs();
      band(K.leather,2,x+f*8,by-13.4,x-f*7.6,by-3.4);
      K.vials.forEach((c,i)=>{const t=.18+i*.2,px=x+f*8+(-f*15.6)*t,py=by-13.4+10*t;ctx.fillStyle=c;ctx.strokeStyle=OL;ctx.lineWidth=.8;ctx.beginPath();ctx.roundRect(px-1.1,py-3,2.2,3.4,.8);ctx.fill();ctx.stroke();ctx.fillStyle='#e8dcc0';ctx.fillRect(px-.7,py-3.6,1.4,.8);});
      /* (v1.70.2) details */ctx.setLineDash([1,1.2]);line('rgba(255,255,255,.3)',.6,[x-5.6,by-6.6,x-6.6+sw,HEM-.8]);line('rgba(255,255,255,.3)',.6,[x+5.6,by-6.6,x+6.6+sw,HEM-.8]);ctx.setLineDash([]);ctx.fillStyle=K.vials[0];ctx.strokeStyle=OL;ctx.lineWidth=.8;ctx.beginPath();ctx.roundRect(x-1.4,by-4.4,2.8,2.4,.5);ctx.fill();ctx.stroke();{const mx=x+f*7.6,my=by-.6,sv=Math.sin(now*2)*.4;ctx.save();ctx.translate(mx+sv,my);ctx.fillStyle='#ece6da';ctx.strokeStyle=OL;ctx.lineWidth=.8;ctx.beginPath();ctx.ellipse(0,0,2.2,2,0,0,7);ctx.fill();ctx.stroke();ctx.beginPath();ctx.moveTo(f*1.6,-.6);ctx.quadraticCurveTo(f*5,.6,f*4.6,2.8);ctx.quadraticCurveTo(f*3,1.6,f*1.2,1.2);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle='#1a1a20';for(const d of [-.8,.8]){ctx.beginPath();ctx.arc(d,-.4,.55,0,7);ctx.fill();}ctx.restore();}break;}
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
