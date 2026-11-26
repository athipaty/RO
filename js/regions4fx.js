"use strict";
/* ================= a world around the city: looks, sounds and lists (v1.47.0) =================
   Artwork for the forty monsters of the eight new regions, the upright pictures of their land (green pines, jungle
   trees, twilight trees, broken columns, crystals, ice spires), air, weather and a song for each, their sigil album
   pages, Waystation card banners, short blurbs and loot pictures. All drawn and composed in code. */
if(typeof MOB_LOOKS!=='undefined'){
const gl=(x,y,r,col,a)=>{ctx.save();ctx.globalAlpha=a;const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,col);g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.fill();ctx.restore();};
const el=(x,y,rx,ry,c,a)=>{ctx.fillStyle=c;ctx.beginPath();ctx.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),a||0,0,7);ctx.fill();};
const ci=(x,y,r,c)=>{ctx.fillStyle=c;ctx.beginPath();ctx.arc(x,y,Math.max(.1,r),0,7);ctx.fill();};
const ln=(pts,c,w)=>{ctx.strokeStyle=c;ctx.lineWidth=w;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();pts.forEach(([a,b],i)=>i?ctx.lineTo(a,b):ctx.moveTo(a,b));ctx.stroke();};
const pf=(pts,c)=>{ctx.fillStyle=c;mlPoly(pts);ctx.fill();};
const bolt=(x,y,h,c)=>ln([[x,y],[x-h*.18,y+h*.35],[x+h*.12,y+h*.45],[x-h*.08,y+h]],c,Math.max(1.4,h*.08));
// ---- a four-legged animal, shaped by options ----
function quad(o,q){const {x,y,s,t,f,col,dark,mv}=o,lg=q.long||1,L=q.legs||.6;shadow(x,y,s*1.15*lg);
  if(q.legs!==0)mlLegs(o,x,s*L,.7*lg,q.legW,q.legCol);
  const b=mv?Math.abs(Math.sin(t*12))*s*.07:0,by=y-s*(L+.25)-b,bw=s*(q.bw||1)*lg,bh=s*(q.bh||.55);
  if(q.wings){const fl=Math.sin(t*(mv?12:4));for(const k of [-1,1]){const c=k>0?q.wings:mlShade(q.wings,-35),sx=x+f*s*.25,sy=by-bh*.55,tx=x-f*s*(1.05+k*.2),ty=by-s*(1.75+fl*.35+k*.1),rx=x-f*s*.75,ry=by-bh*.1;
    ctx.fillStyle=c;ctx.beginPath();ctx.moveTo(sx,sy);ctx.quadraticCurveTo(x+f*s*.1,ty+s*.1,tx,ty);
    for(let i=1;i<=4;i++){const u=i/4,px=tx+(rx-tx)*u,py=ty+(ry-ty)*u,cu=(i-.5)/4;ctx.quadraticCurveTo(tx+(rx-tx)*cu+f*s*.32,ty+(ry-ty)*cu+s*.18,px,py);}
    ctx.closePath();ctx.fill();ctx.strokeStyle=mlShade(q.wings,-60);ctx.lineWidth=1;for(let i=1;i<4;i++){const u=i/4;ctx.beginPath();ctx.moveTo(sx-f*s*.1,sy);ctx.lineTo(tx+(rx-tx)*u+f*s*.15,ty+(ry-ty)*u+s*.05);ctx.stroke();}}}
  if(q.tail==='long')ln([[x-f*bw*.9,by],[x-f*bw*1.45,by-s*.25+Math.sin(t*5)*s*.15],[x-f*bw*1.85,by-s*.05]],q.tailCol||col,s*.12);
  else if(q.tail==='bushy')el(x-f*bw*1.05,by-s*.3,s*.38,s*.22,q.tailCol||col,-f*.6);
  else if(q.tail==='tuft'){ln([[x-f*bw*.9,by-s*.1],[x-f*bw*1.4,by-s*.5]],q.tailCol||col,s*.1);ci(x-f*bw*1.45,by-s*.55,s*.14,q.tailTip||dark);}
  else if(q.tail)el(x-f*bw*.95,by-s*.15,s*.15,s*.12,q.tail);
  if(q.fleece)for(const [a,c,r] of [[-.6,-.1,.45],[-.2,-.35,.5],[.3,-.3,.48],[.6,0,.4],[0,.1,.5],[-.5,.2,.38],[.4,.25,.38]])ci(x+a*bw,by+c*s,r*s,q.fleece);
  else{el(x,by,bw,bh,col);if(q.belly)el(x+f*s*.15,by+bh*.45,bw*.6,bh*.35,q.belly);}
  if(q.stripes){ctx.strokeStyle=q.stripes;ctx.lineWidth=Math.max(1.2,s*.08);for(let k=-2;k<=2;k++){ctx.beginPath();ctx.moveTo(x+k*bw*.3,by-bh*.9);ctx.lineTo(x+k*bw*.3-f*s*.1,by-bh*.2);ctx.stroke();}}
  if(q.spikes){for(let k=0;k<8;k++){const a=Math.PI*(1.06+k*.125),px=x+Math.cos(a)*bw*.92,py=by+Math.sin(a)*bh*.92;pf([[px-s*.1,py],[x+Math.cos(a)*bw*1.45,by+Math.sin(a)*bh*1.6],[px+s*.1,py]],k%2?q.spikes:mlShade(q.spikes,30));}}
  if(q.glow&&q.bodyGlow)gl(x,by,bw*1.3,q.glow,.3);
  const hx=x+f*bw*(q.neck||.95),hy=by-s*(q.hup||.42),hr=s*(q.hr||.42);
  if(q.mane)ci(hx-f*s*.15,hy+s*.05,hr*1.45,q.mane);
  if(q.antlers){ctx.strokeStyle=q.antlers;ctx.lineWidth=Math.max(1.5,s*.09);ctx.lineCap='round';
    for(const k of [-1,1]){const ax=hx+k*s*.12;ctx.beginPath();ctx.moveTo(ax,hy-hr*.7);ctx.lineTo(ax-f*s*.15+k*s*.25,hy-s*1.3);ctx.moveTo(ax-f*s*.05+k*s*.12,hy-s*.95);ctx.lineTo(ax+k*s*.5,hy-s*1.05);ctx.moveTo(ax-f*s*.1+k*s*.2,hy-s*1.15);ctx.lineTo(ax-f*s*.42+k*s*.15,hy-s*1.45);ctx.stroke();}
    if(q.glow)gl(hx,hy-s*1.1,s*.8,q.glow,.35);}
  ci(hx,hy,hr,q.head||col);
  if(q.ears){for(const k of [-1,1])pf([[hx+k*hr*.45-hr*.22,hy-hr*.6],[hx+k*hr*.55+f*hr*.05,hy-hr*q.ears],[hx+k*hr*.45+hr*.25,hy-hr*.5]],q.earCol||dark);}
  if(q.horns==='curl'){ctx.strokeStyle=q.hornCol||'#e8d8b0';ctx.lineWidth=Math.max(2,s*.14);for(const k of [-1,1]){ctx.beginPath();ctx.arc(hx-f*hr*.25+k*hr*.45,hy-hr*.2,hr*.5,Math.PI*1.1,Math.PI*2.4);ctx.stroke();}}
  if(q.snout){el(hx+f*hr*.85,hy+hr*.25,hr*.55,hr*.42,q.snout);ci(hx+f*hr*1.3,hy+hr*.15,hr*.12,'#2a1a1a');}
  if(q.tusks){ctx.strokeStyle='#f4ead0';ctx.lineWidth=Math.max(1.5,s*.08);for(const k of [0,.15]){ctx.beginPath();ctx.moveTo(hx+f*hr*(1+k),hy+hr*.45);ctx.quadraticCurveTo(hx+f*hr*(1.45+k),hy+hr*.4,hx+f*hr*(1.4+k),hy-hr*.15);ctx.stroke();}}
  if(q.beak)pf([[hx+f*hr*.6,hy-hr*.3],[hx+f*hr*1.75,hy+hr*.05],[hx+f*hr*.6,hy+hr*.4]],q.beak);
  if(q.muzzle)el(hx+f*hr*.6,hy+hr*.3,hr*.5,hr*.32,q.muzzle);
  mlEye(hx+f*hr*.42,hy-hr*.15,Math.max(1.5,s*.08),q.eye||'#1a1a1a',q.eyeGlow);
  if(q.crown)mlCrown(hx,hy-hr*.95,s*.28,q.crown);
  if(q.extra)q.extra(o,{by,bw,bh,hx,hy,hr});}
// ---- an upright creature (bear, ape, golem, knight), shaped by options ----
function biped(o,q){const {x,y,s,t,f,col,dark,mv}=o;shadow(x,y,s*1.1*(q.wide||1));const st=mv?Math.sin(t*9)*s*.12:0,b=mv?Math.abs(Math.sin(t*9))*s*.05:0;
  ctx.fillStyle=q.leg||dark;for(const k of [-1,1])ctx.fillRect(x+k*s*.3-s*.17+(k<0?st:-st),y-s*.75,s*.34,s*.75);
  const ty=y-s*.68-b,tw=s*(q.tw||.7),th=s*(q.th||1.1),hr=s*(q.hr||.36),hx=x+f*s*.06,hy=ty-th-hr*.6;
  if(q.back)q.back(o,{ty,tw,th,hx,hy,hr});
  ctx.fillStyle=col;ctx.beginPath();ctx.roundRect(x-tw,ty-th,tw*2,th,s*(q.round??.3));ctx.fill();
  if(q.belly)el(x+f*s*.05,ty-th*.45,tw*.6,th*.33,q.belly);
  for(const k of [-1,1]){ctx.save();ctx.translate(x+k*tw*1.0,ty-th*.85);ctx.rotate(k*.18+(mv?Math.sin(t*9+(k>0?Math.PI:0))*.35:Math.sin(t*2+k)*.05));
    el(0,s*.42*(q.armL||1),s*(q.arm||.2),s*.5*(q.armL||1),q.armCol||col);if(q.fist)ci(0,s*.9*(q.armL||1),s*(q.arm||.2)*1.15,q.fist);ctx.restore();}
  if(!q.noHead){ci(hx,hy,hr,q.head||col);if(q.face)el(hx+f*hr*.25,hy+hr*.15,hr*.6,hr*.5,q.face);
    for(const k of [-1,1])mlEye(hx+k*hr*.33+f*hr*.25,hy-hr*.1,Math.max(1.5,s*.07),q.eye||'#1a1a1a',q.eyeGlow);}
  if(q.extra)q.extra(o,{ty,tw,th,hx,hy,hr});}
// ---- a flier ----
function bird(o,q){const {x,s,t,f,col,dark,lite}=o,y=o.y-s*(q.hover??1.5)-Math.abs(Math.sin(t*2))*s*.2,fl=Math.sin(t*(q.flap||10));shadow(x,o.y,s*.8);
  if(q.glow)gl(x,y,s*2,q.glow,.3);
  for(const k of [-1,1])pf([[x,y-s*.1],[x+k*s*.6,y-s*(.5+fl*.5)],[x+k*s*(q.span||1.6),y-s*(.2+fl*.8)],[x+k*s*1.1,y+s*.15]],q.wing||dark);
  pf([[x-f*s*.5,y],[x-f*s*1.2,y-s*.28],[x-f*s*1.15,y+s*.25]],q.tail||dark);
  el(x,y,s*.62,s*.42,col);el(x+f*s*.12,y+s*.12,s*.36,s*.22,q.belly||lite);
  ci(x+f*s*.5,y-s*.35,s*.3,q.head||col);pf([[x+f*s*.74,y-s*.42],[x+f*s*1.12,y-s*.3],[x+f*s*.74,y-s*.2]],q.beak||'#e8b03a');
  mlEye(x+f*s*.58,y-s*.43,Math.max(1.4,s*.07),q.eye||'#1a1a1a',q.eyeGlow);
  if(q.extra)q.extra(o,{y,fl});}

/* ---------- Goldleaf Downs ---------- */
// Fluffwool: a round cloud of wool on little black legs, a sleepy black face
MOB_LOOKS.fluffwool=(m,o)=>{const {x,y,s,t,f,mv}=o;shadow(x,y,s);const b=mv?Math.abs(Math.sin(t*10))*s*.12:Math.sin(t*2)*s*.03;
  ctx.fillStyle='#2a2422';for(const k of [-.45,-.15,.2,.5])ctx.fillRect(x+k*s-s*.06,y-s*.45,s*.12,s*.45);
  for(const [a,c,r] of [[-.55,-.75,.42],[-.15,-1.0,.48],[.3,-.92,.45],[.6,-.65,.38],[0,-.6,.5],[-.45,-.5,.35],[.4,-.45,.35]])ci(x+a*s,y+c*s-b,r*s,'#f4efe2');
  ci(x-s*.2,y-s*1.15-b,s*.25,'#ffffff');el(x+f*s*.82,y-s*.78-b,s*.27,s*.32,'#2a2422');for(const k of [-1,1])el(x+f*s*.82+k*s*.27,y-s*.92-b,s*.14,s*.07,'#2a2422',k*.5);
  ln([[x+f*s*.74,y-s*.84-b],[x+f*s*.84,y-s*.82-b]],'#f4efe2',1.2);ci(x+f*s*.86,y-s*.68-b,s*.05,'#e88a9a');};
// Burrowmole: a velvet mole half out of a dirt mound, pink star nose and big digging claws
MOB_LOOKS.burrowmole=(m,o)=>{const {x,y,s,t,f,col,dark,mv}=o;shadow(x,y,s*1.1);const p=mv?Math.abs(Math.sin(t*8))*s*.15:Math.sin(t*2)*s*.05;
  el(x,y-s*.15,s*1.1,s*.32,'#8a6a4a');for(const [a,r] of [[-.7,.12],[.5,.1],[.1,.14]])ci(x+a*s,y-s*.3,r*s,'#6a4a32');
  el(x,y-s*.75-p,s*.6,s*.62,col);el(x+f*s*.1,y-s*.6-p,s*.35,s*.3,mlShade(col,25));
  for(let k=0;k<6;k++){const a=k/6*Math.PI*2+t;ci(x+f*s*.55+Math.cos(a)*s*.11,y-s*.9-p+Math.sin(a)*s*.11,s*.06,'#ff9ab0');}ci(x+f*s*.55,y-s*.9-p,s*.08,'#ff7a9a');
  for(const k of [-1,1]){const cx=x+k*s*.55,cy=y-s*.45-p;el(cx,cy,s*.22,s*.15,'#f0c8b0');ctx.strokeStyle='#e8e0d0';ctx.lineWidth=1.3;for(let i=-1;i<=1;i++){ctx.beginPath();ctx.moveTo(cx+k*s*.15,cy+i*s*.06);ctx.lineTo(cx+k*s*.32,cy+i*s*.09+s*.05);ctx.stroke();}}
  ln([[x+f*s*.15,y-s*1.08-p],[x+f*s*.3,y-s*1.05-p]],dark,1.5);};
// Bumblewing: a fat striped bee with glassy wings that buzz, hovering
MOB_LOOKS.bumblewing=(m,o)=>{const {x,s,t,f}=o,y=o.y-s*1.6+Math.sin(t*5)*s*.15;shadow(x,o.y,s*.6);const w=Math.sin(t*40);
  ctx.fillStyle='rgba(230,245,255,.6)';for(const k of [-1,1]){ctx.save();ctx.translate(x-f*s*.1,y-s*.4);ctx.rotate(k*(.5+w*.3));ctx.beginPath();ctx.ellipse(0,-s*.45,s*.25,s*.5,0,0,7);ctx.fill();ctx.restore();}
  el(x,y,s*.75,s*.55,'#f0c03a');ctx.fillStyle='#2a2216';for(const k of [-.35,.05,.42]){ctx.beginPath();ctx.ellipse(x-f*k*s,y,s*.11,s*.53,0,0,7);ctx.fill();}
  pf([[x-f*s*.72,y-s*.08],[x-f*s*1.0,y],[x-f*s*.72,y+s*.08]],'#2a2216');ci(x+f*s*.7,y-s*.1,s*.32,'#2a2216');
  mlEye(x+f*s*.82,y-s*.15,Math.max(1.4,s*.09),'#ffffff');ci(x+f*s*.84,y-s*.15,Math.max(.8,s*.05),'#1a1a1a');
  for(const k of [-1,1])ln([[x+f*s*.8,y-s*.38],[x+f*s*(.95+k*.08),y-s*.7]],'#2a2216',1.3);};
// Thistlehog: a purple hedgehog whose quills end in thistle flowers
MOB_LOOKS.thistlehog=(m,o)=>quad(o,{legs:.25,bw:.9,bh:.6,spikes:'#6a4a7a',hr:.32,hup:.05,neck:.85,snout:'#c8a890',ears:1.0,
  extra:(o,{by,bw,bh})=>{const {x,s}=o;for(let k=0;k<5;k++){const a=Math.PI*(1.15+k*.18);ci(x+Math.cos(a)*bw*1.35,by+Math.sin(a)*bh*1.45,s*.09,'#c87ae0');}}});
// Old Woolhorn: a huge ram with a golden fleece, curling horns and a crown of daisies
MOB_LOOKS.woolhorn=(m,o)=>quad(o,{legs:.7,bw:1.05,bh:.62,fleece:'#ffd04a',head:'#4a3a2a',hr:.4,hup:.25,horns:'curl',hornCol:'#e8d8b0',muzzle:'#6a5a4a',tail:'#ffd04a',
  extra:(o,{hx,hy,hr})=>{const {s}=o;for(let k=-2;k<=2;k++){ci(hx+k*hr*.38,hy-hr*.95,s*.08,'#ffffff');ci(hx+k*hr*.38,hy-hr*.95,s*.035,'#f2c43a');}}});

/* ---------- Pinewatch Ridge ---------- */
// Pinecone Sprite: a walking pinecone with twig arms and a needle tuft
MOB_LOOKS.pinesprite=(m,o)=>{const {x,y,s,t,f,col,mv}=o;shadow(x,y,s*.8);const b=mv?Math.abs(Math.sin(t*12))*s*.15:0,cy=y-s*.9-b;
  ln([[x-s*.2,y-s*.35-b],[x-s*.25,y]],'#4a3020',s*.1);ln([[x+s*.2,y-s*.35-b],[x+s*.25,y]],'#4a3020',s*.1);
  el(x,cy,s*.55,s*.75,col);ctx.fillStyle=mlShade(col,-30);for(let r=0;r<4;r++)for(let k=-1;k<=1;k++){const px=x+k*s*.3+(r%2)*s*.15-s*.07,py=cy-s*.5+r*s*.33;pf([[px-s*.12,py],[px,py+s*.16],[px+s*.12,py]],mlShade(col,-35));}
  for(let k=-2;k<=2;k++)ln([[x,cy-s*.7],[x+k*s*.12,cy-s*1.05]],'#2f6a3a',s*.06);
  for(const k of [-1,1])ln([[x+k*s*.5,cy],[x+k*s*.85,cy-s*.2+Math.sin(t*6+k)*s*.1]],'#4a3020',s*.07);
  for(const k of [-.15,.15])mlEye(x+k*s+f*s*.12,cy-s*.15,Math.max(1.4,s*.08));};
// Timber Boar: a bristly dark boar with curved tusks and a ridge of stiff hair
MOB_LOOKS.timberboar=(m,o)=>quad(o,{legs:.5,bw:1.0,bh:.6,belly:'#7a5a44',hr:.45,hup:.15,neck:.9,snout:'#8a6a5a',tusks:true,ears:1.1,tail:'tuft',
  extra:(o,{by,bw,bh})=>{const {x,s,f}=o;for(let k=0;k<7;k++){const px=x-f*bw*.6+f*k*bw*.2;ln([[px,by-bh*.85],[px-f*s*.05,by-bh*1.25]],'#2a1a12',Math.max(1.2,s*.07));}}});
// Hollow Owl: a big-eyed brown owl with ear tufts, gliding low between the pines
MOB_LOOKS.hollowowl=(m,o)=>bird(o,{hover:1.3,flap:7,span:1.7,wing:'#7a6242',belly:'#e8d8b8',beak:'#c89a3a',
  extra:(o,{y})=>{const {x,s,f}=o;for(const k of [-1,1])pf([[x+f*s*.5+k*s*.12-s*.06,y-s*.55],[x+f*s*.5+k*s*.22,y-s*.85],[x+f*s*.5+k*s*.2+s*.06,y-s*.55]],'#5a4632');
    for(const k of [-1,1]){ci(x+f*s*.5+k*s*.13,y-s*.38,s*.12,'#f8e8a0');ci(x+f*s*.5+k*s*.13+f*s*.03,y-s*.38,s*.06,'#1a1a1a');}}});
// Ridge Bruin: a brown mountain bear on its hind legs, claws out
MOB_LOOKS.ridgebruin=(m,o)=>biped(o,{tw:.85,th:1.15,round:.5,hr:.42,belly:'#8a6a4a',arm:.24,fist:'#4a3020',face:'#8a6a4a',
  extra:(o,{hx,hy,hr})=>{const {s,f}=o;for(const k of [-1,1])ci(hx+k*hr*.75,hy-hr*.75,hr*.32,o.col);ci(hx+f*hr*.55,hy+hr*.1,hr*.14,'#1a1a1a');}});
// Elder Antlerking: a great old stag, antlers like a crown of branches with leaves still on them
MOB_LOOKS.antlerking=(m,o)=>quad(o,{legs:.95,bw:1.0,bh:.5,belly:'#c8a878',hr:.36,hup:.65,neck:1.0,antlers:'#d8c098',muzzle:'#a88a6a',ears:1.1,tail:'#f4efe2',crown:'#ffcf5a',
  extra:(o,{hx,hy})=>{const {s,f}=o;for(const [a,b] of [[-.45,-1.25],[.4,-1.1],[-.15,-1.45],[.55,-1.4]])el(hx+a*s-f*s*.1,hy+b*s,s*.09,s*.05,'#5aa83a',a);}});

/* ---------- Old Aurel Ruins ---------- */
// Relic Rat: a grey rat with a coin in its teeth and a long bare tail
MOB_LOOKS.relicrat=(m,o)=>quad(o,{legs:.3,bw:.8,bh:.42,hr:.32,hup:.05,neck:.95,tail:'long',tailCol:'#d8a8a0',ears:.9,earCol:'#d8a8a0',belly:'#a89a8a',
  extra:(o,{hx,hy,hr})=>{const {s,f}=o;ci(hx+f*hr*1.05,hy+hr*.35,s*.13,'#e8b84a');ci(hx+f*hr*1.05,hy+hr*.35,s*.06,'#b8783a');}});
// Ivy Creeper: a crawling mound of ivy with grasping vines and a pale flower
MOB_LOOKS.ivycreeper=(m,o)=>{const {x,y,s,t,f,col,mv}=o;shadow(x,y,s*1.2);const w=Math.sin(t*(mv?6:2));
  for(let k=0;k<5;k++){const a=Math.PI*(.95+k*.27);ln([[x,y-s*.4],[x+Math.cos(a)*s*.8,y-s*.4+Math.sin(a)*s*.6+w*s*.1],[x+Math.cos(a)*s*1.4,y-s*.2+Math.sin(a)*s*.5]],mlShade(col,-25),s*.1);}
  for(const [a,b,r] of [[-.5,-.4,.45],[.2,-.55,.55],[.6,-.3,.4],[-.1,-.25,.5]])ci(x+a*s,y+b*s,r*s,col);
  for(let k=0;k<8;k++){const a=k*.9;el(x+Math.cos(a)*s*.6,y-s*.5+Math.sin(a)*s*.35,s*.14,s*.08,mlShade(col,30),a);}
  ci(x+f*s*.2,y-s*.95,s*.18,'#f4efe2');ci(x+f*s*.2,y-s*.95,s*.07,'#f2d44a');for(const k of [-.1,.25])mlEye(x+f*s*(k+.2),y-s*.55,Math.max(1.4,s*.07),'#e8ff6a','#c8ff4a');};
// Stone Sentry: a weathered statue of a guard with a stone spear, moss on its shoulders, glowing rune eyes
MOB_LOOKS.stonesentry=(m,o)=>biped(o,{tw:.65,th:1.2,round:.08,hr:.34,arm:.2,eye:'#7affe0',eyeGlow:'#4affd0',
  extra:(o,{ty,tw,th,hx,hy,hr})=>{const {x,s,f,t}=o;ctx.strokeStyle='rgba(0,0,0,.3)';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(x-tw*.4,ty-th*.7);ctx.lineTo(x+tw*.1,ty-th*.4);ctx.lineTo(x-tw*.2,ty-th*.1);ctx.stroke();
    ci(x-tw*.8,ty-th*.95,s*.18,'#5a8a3a');ci(x+tw*.7,ty-th,s*.14,'#5a8a3a');pf([[hx-hr,hy-hr*.4],[hx,hy-hr*1.5],[hx+hr,hy-hr*.4]],mlShade(o.col,-20));
    ln([[x+f*tw*1.2,ty+s*.3],[x+f*tw*1.25,ty-th-s*.8]],'#8a8478',s*.1);pf([[x+f*tw*1.25-s*.1,ty-th-s*.75],[x+f*tw*1.25,ty-th-s*1.1],[x+f*tw*1.25+s*.1,ty-th-s*.75]],'#8a8478');
    ln([[x-s*.15,ty-th*.6],[x+s*.15,ty-th*.6],[x,ty-th*.35]],'rgba(120,255,220,'+(.5+Math.sin(t*3)*.3)+')',1.5);}});
// Relic Mimic: an old treasure chest with a tongue and teeth, hopping after you
MOB_LOOKS.relicmimic=(m,o)=>{const {x,y,s,t,f,col,mv}=o;shadow(x,y,s);const hop=mv?Math.abs(Math.sin(t*7))*s*.3:0,open=(Math.sin(t*(mv?7:2))+1)*.5*.5,by=y-hop;
  ctx.fillStyle=col;ctx.fillRect(x-s*.8,by-s*.8,s*1.6,s*.8);ctx.fillStyle='#d8a83a';ctx.fillRect(x-s*.8,by-s*.5,s*1.6,s*.1);ctx.fillRect(x-s*.12,by-s*.8,s*.24,s*.8);
  ctx.fillStyle='#8a1a2a';ctx.fillRect(x-s*.75,by-s*.85-open*s*.6,s*1.5,open*s*.6+s*.05);
  ctx.save();ctx.translate(x,by-s*.82);ctx.rotate(-open*f*.3);ctx.fillStyle=mlShade(col,15);ctx.beginPath();ctx.roundRect(-s*.82,-s*.5,s*1.64,s*.5,[s*.3,s*.3,0,0]);ctx.fill();
    ctx.fillStyle='#d8a83a';ctx.fillRect(-s*.12,-s*.5,s*.24,s*.5);ctx.fillStyle='#f4efe2';for(let k=0;k<6;k++)pf([[-s*.7+k*s*.27,0],[-s*.58+k*s*.27,s*.15],[-s*.46+k*s*.27,0]],'#f4efe2');ctx.restore();
  el(x+f*s*.25,by-s*.85,s*.3,s*.1*(1+open*2),'#e85a7a');for(const k of [-.35,.35])mlEye(x+k*s,by-s*.9-open*s*.5,Math.max(1.4,s*.08),'#ffd04a','#ffb020');};
// The Fallen Paladin: a hollow knight in tarnished silver, a torn tabard, a cracked holy sword, cold blue eyes
MOB_LOOKS.fallenpaladin=(m,o)=>biped(o,{tw:.7,th:1.25,round:.15,hr:.36,arm:.22,head:'#9a9ab0',leg:'#5a5a6a',eye:'#8ac8ff',eyeGlow:'#4a9aff',
  back:(o,{ty,tw,th})=>{const {x,s,t,f}=o;pf([[x-tw*.9,ty-th],[x+tw*.9,ty-th],[x+tw*1.1-f*Math.sin(t*2)*s*.1,ty+s*.4],[x-tw*1.1-f*Math.sin(t*2)*s*.1,ty+s*.4]],'#3a2a4a');},
  extra:(o,{ty,tw,th,hx,hy,hr})=>{const {x,s,f}=o;pf([[x-tw*.5,ty-th*.95],[x+tw*.5,ty-th*.95],[x+tw*.4,ty-s*.05],[x,ty+s*.2],[x-tw*.4,ty-s*.05]],'#e8e0c8');ln([[x,ty-th*.85],[x,ty-th*.2]],'#c8a83a',2);ln([[x-tw*.25,ty-th*.6],[x+tw*.25,ty-th*.6]],'#c8a83a',2);
    ctx.fillStyle='#7a7a90';ctx.fillRect(hx-hr*.9,hy-hr*.15,hr*1.8,hr*.25);
    ctx.save();ctx.translate(x+f*tw*1.25,ty-th*.3);ctx.rotate(f*.25);ctx.fillStyle='#d8dce8';ctx.fillRect(-s*.06,-s*1.3,s*.12,s*1.2);ctx.fillStyle='#c8a83a';ctx.fillRect(-s*.24,-s*.12,s*.48,s*.08);
      ln([[-s*.02,-s*.9],[s*.04,-s*.75],[-s*.03,-s*.6]],'#3a3a4a',1);ctx.restore();}});

/* ---------- Thornveil Jungle ---------- */
// Vine Viper: a leaf-green snake coiled and swaying, a hood of leaves
MOB_LOOKS.vineviper=(m,o)=>{const {x,y,s,t,f,col,dark,mv}=o;shadow(x,y,s*1.1);const w=Math.sin(t*(mv?8:3));
  ctx.strokeStyle=col;ctx.lineWidth=s*.32;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x-f*s*1.1,y-s*.15);ctx.quadraticCurveTo(x-f*s*.5,y-s*.45+w*s*.1,x,y-s*.2);ctx.quadraticCurveTo(x+f*s*.5,y+s*.05,x+f*s*.35,y-s*.8);ctx.stroke();
  ctx.strokeStyle=mlShade(col,40);ctx.lineWidth=s*.1;ctx.stroke();
  const hx=x+f*s*(.35+w*.05),hy=y-s*1.05;for(let k=-2;k<=2;k++)el(hx-f*s*.1+k*s*.16,hy+s*.05,s*.13,s*.26,'#3a8a2a',k*.4);
  el(hx+f*s*.12,hy,s*.3,s*.2,col);mlEye(hx+f*s*.2,hy-s*.07,Math.max(1.4,s*.07),'#f8e04a','#e8c020');
  ln([[hx+f*s*.4,hy+s*.04],[hx+f*s*.6,hy+s*.08],[hx+f*s*.68,hy+s*.02]],'#e83a4a',1.2);};
// Howler Ape: a long-armed brown ape with a pale face, mouth open in a howl
MOB_LOOKS.howlerape=(m,o)=>biped(o,{tw:.6,th:.95,round:.45,hr:.36,arm:.2,armL:1.5,face:'#e8c8a0',belly:'#a8845a',
  extra:(o,{hx,hy,hr})=>{const {s,f,t}=o;el(hx+f*hr*.35,hy+hr*.45,hr*.22,hr*(.12+Math.abs(Math.sin(t*4))*.15),'#3a1a1a');for(const k of [-1,1])ci(hx+k*hr*1.0,hy-hr*.1,hr*.22,'#e8c8a0');}});
// Bloomtrap: a rooted pink flower with a jaw-like bloom that snaps, leaves like hands
MOB_LOOKS.bloomtrap=(m,o)=>{const {x,y,s,t,f,col}=o;shadow(x,y,s*.9);const sn=Math.abs(Math.sin(t*3))*.35,sw=Math.sin(t*2)*s*.08;
  for(const k of [-1,1])el(x+k*s*.55,y-s*.25,s*.5,s*.16,'#3a8a3a',k*-.4);ln([[x,y],[x+sw,y-s*.7],[x+f*s*.15+sw,y-s*1.2]],'#3a7a2a',s*.14);
  const hx=x+f*s*.2+sw,hy=y-s*1.35;for(let k=0;k<6;k++){const a=k/6*Math.PI*2;el(hx+Math.cos(a)*s*.45,hy+Math.sin(a)*s*.35,s*.28,s*.16,mlShade(col,k%2?15:-10),a);}
  ctx.save();ctx.translate(hx,hy);ctx.fillStyle='#5a1a2a';ctx.beginPath();ctx.ellipse(0,0,s*.35,s*(.12+sn*.4),0,0,7);ctx.fill();ctx.fillStyle='#f4efe2';
    for(let k=-2;k<=2;k++){pf([[k*s*.13-s*.05,-s*(.1+sn*.35)],[k*s*.13,-s*(sn*.35-.05)],[k*s*.13+s*.05,-s*(.1+sn*.35)]],'#f4efe2');pf([[k*s*.13-s*.05,s*(.1+sn*.35)],[k*s*.13,s*(sn*.35-.05)],[k*s*.13+s*.05,s*(.1+sn*.35)]],'#f4efe2');}ctx.restore();
  for(let k=0;k<3;k++){const ph=(t*.5+k/3)%1;ctx.globalAlpha=1-ph;ci(hx+Math.sin(k*2+t)*s*.4,hy-s*(.4+ph*.8),s*.05,'#ffd0f0');}ctx.globalAlpha=1;};
// Jade Toad: a fat green toad with jade warts, puffing its throat
MOB_LOOKS.jadetoad=(m,o)=>{const {x,y,s,t,f,col,dark,mv}=o;shadow(x,y,s*1.15);const hop=mv?Math.abs(Math.sin(t*6))*s*.35:0,by=y-hop,pu=(Math.sin(t*3)+1)*.5;
  for(const k of [-1,1])el(x+k*s*.75,by-s*.15,s*.35,s*.18,dark);el(x,by-s*.55,s*.95,s*.6,col);el(x+f*s*.2,by-s*.35,s*.55,s*.28,'#d8e8a0');
  ci(x+f*s*.55,by-s*.25,s*(.18+pu*.12),'#f0e8b0');for(const [a,b] of [[-.5,-.8],[-.1,-.95],[.25,-.85],[-.6,-.5],[0,-.65]])ci(x+a*s,by+b*s,s*.08,'#7ae8a8');
  for(const k of [-.1,.45]){ci(x+f*s*k,by-s*1.05,s*.17,col);mlEye(x+f*s*k+f*s*.03,by-s*1.07,Math.max(1.5,s*.1),'#f8c03a');ci(x+f*s*k+f*s*.04,by-s*1.07,s*.04,'#1a1a1a');}
  ln([[x+f*s*.35,by-s*.6],[x+f*s*.92,by-s*.62]],dark,1.4);};
// Queen Orchidra: a giant orchid with a regal face in its heart, petals like a gown, vines and a crown
MOB_LOOKS.orchidra=(m,o)=>{const {x,y,s,t,f,col}=o;shadow(x,y,s*1.3);const sw=Math.sin(t*1.5)*s*.06;gl(x,y-s*1.4,s*2,'#ff8ae8',.25);
  for(const k of [-1,1])for(let i=0;i<2;i++)ln([[x+k*s*.3,y-s*.3],[x+k*s*(.9+i*.3),y-s*(.6+i*.2)+Math.sin(t*2+i+k)*s*.15],[x+k*s*(1.3+i*.3),y-s*(.2+i*.3)]],'#3a7a2a',s*.09);
  pf([[x-s*.7,y],[x-s*.4,y-s*1.1],[x+s*.4,y-s*1.1],[x+s*.7,y]],'#3a8a3a');
  const hx=x+sw,hy=y-s*1.55;for(let k=0;k<5;k++){const a=-Math.PI/2+(k-2)*.75;el(hx+Math.cos(a)*s*.6,hy+Math.sin(a)*s*.5+s*.15,s*.48,s*.28,k%2?col:mlShade(col,25),a);}
  el(hx,hy+s*.5,s*.55,s*.3,'#f4d0f0');ci(hx,hy+s*.05,s*.32,'#f8e0f4');for(const k of [-1,1])mlEye(hx+k*s*.12+f*s*.05,hy,Math.max(1.5,s*.06),'#7a1a6a');
  el(hx+f*s*.05,hy+s*.17,s*.07,s*.035,'#c83a7a');mlCrown(hx,hy-s*.3,s*.26);};

/* ---------- Crystal Steppe ---------- */
// Shardling: a small creature of violet crystal shards around a glowing core, waddling
MOB_LOOKS.shardling=(m,o)=>{const {x,y,s,t,f,col,mv}=o;shadow(x,y,s*.9);const b=mv?Math.abs(Math.sin(t*10))*s*.12:0,cy=y-s*.8-b,p=.6+Math.sin(t*3)*.3;
  for(const k of [-1,1])pf([[x+k*s*.3-s*.12,y],[x+k*s*.3,y-s*.45-b],[x+k*s*.3+s*.12,y]],mlShade(col,-30));
  gl(x,cy,s*1.1,'#d8b8ff',.35*p);for(const [a,h,w] of [[-.45,.9,.25],[0,1.2,.3],[.45,.85,.25],[-.2,.7,.2],[.25,.75,.2]])pf([[x+a*s-w*s,cy+s*.3],[x+a*s,cy-h*s*.8],[x+a*s+w*s,cy+s*.3]],a===0?mlShade(col,30):col);
  ci(x+f*s*.05,cy+s*.05,s*.18,'rgba(255,240,255,'+p+')');for(const k of [-.15,.15])mlEye(x+k*s+f*s*.1,cy-s*.15,Math.max(1.4,s*.07),'#ffffff','#e0c8ff');};
// Prism Moth: a moth with wings like stained glass that scatter rainbow light
MOB_LOOKS.prismmoth=(m,o)=>{const {x,s,t,f,col}=o,y=o.y-s*1.7+Math.sin(t*3)*s*.2;shadow(x,o.y,s*.6);const w=Math.sin(t*12)*.4;
  const cols=['#ff9ab8','#ffd88a','#9affc8','#8ac8ff','#d8a8ff'];for(const k of [-1,1])for(let i=0;i<2;i++){ctx.save();ctx.translate(x,y);ctx.scale(k*(1-Math.abs(w)*.5),1);
    ctx.fillStyle=cols[(i*2+(k>0?1:0))%5];ctx.globalAlpha=.8;ctx.beginPath();ctx.ellipse(s*.6,i?s*.35:-s*.3,s*.6,i?s*.35:s*.5,i?.5:-.4,0,7);ctx.fill();ctx.globalAlpha=1;
    ctx.strokeStyle='rgba(255,255,255,.8)';ctx.lineWidth=1;ctx.stroke();ctx.restore();}
  el(x,y,s*.14,s*.5,'#5a4a7a');ci(x,y-s*.5,s*.15,'#5a4a7a');for(const k of [-1,1])ln([[x+k*s*.05,y-s*.6],[x+k*s*.3,y-s*.95]],'#5a4a7a',1.2);
  for(let k=0;k<3;k++){const ph=(t*.8+k/3)%1;ctx.globalAlpha=(1-ph)*.8;ci(x+Math.sin(k*2.1+t*2)*s*.8,y+s*(.3+ph),s*.05,cols[k]);}ctx.globalAlpha=1;void f;void col;};
// Geode Tortoise: a slow tortoise whose shell is a split geode, purple crystal showing in the cracks
MOB_LOOKS.geodetortoise=(m,o)=>{const {x,y,s,t,f,col,mv}=o;shadow(x,y,s*1.3);const st=mv?Math.sin(t*5)*s*.08:0;
  for(const k of [-.6,-.2,.25,.6])el(x+k*s+(k<0?st:-st),y-s*.15,s*.18,s*.2,'#7a8a6a');
  const hx=x+f*s*1.05,hy=y-s*.45-Math.sin(t*1.5)*s*.04;el(hx-f*s*.15,hy+s*.05,s*.22,s*.15,'#7a8a6a');ci(hx,hy,s*.24,'#8a9a7a');mlEye(hx+f*s*.08,hy-s*.05,Math.max(1.4,s*.06));
  ctx.fillStyle='#5a4a3a';ctx.beginPath();ctx.ellipse(x,y-s*.55,s*1.0,s*.65,0,Math.PI,0);ctx.lineTo(x+s,y-s*.3);ctx.lineTo(x-s,y-s*.3);ctx.fill();
  ctx.save();ctx.beginPath();ctx.ellipse(x,y-s*.55,s*.8,s*.5,0,Math.PI,0);ctx.closePath();ctx.clip();ctx.fillStyle=col;ctx.fillRect(x-s,y-s*1.2,s*2,s*.8);
    for(let k=0;k<7;k++){const a=Math.PI*(1.08+k*.12);pf([[x+Math.cos(a)*s*.2,y-s*.55],[x+Math.cos(a)*s*.85,y-s*.55+Math.sin(a)*s*.6],[x+Math.cos(a+.15)*s*.7,y-s*.55+Math.sin(a+.15)*s*.45]],k%2?'#c8a8ff':'#e8d8ff');}ctx.restore();
  ln([[x-s*.9,y-s*.5],[x-s*.5,y-s*.62],[x-s*.1,y-s*.48],[x+s*.35,y-s*.65],[x+s*.85,y-s*.5]],'#3a2a2a',1.6);};
// Glassfang Lynx: a pale lynx with crystal fangs, ear tufts and glassy spikes down its back
MOB_LOOKS.glasslynx=(m,o)=>quad(o,{legs:.65,bw:.95,bh:.45,belly:'#f0f8ff',hr:.38,hup:.4,ears:1.4,earCol:'#5a6a7a',tail:'tuft',tailTip:'#5a6a7a',eye:'#7ae8ff',eyeGlow:'#4ad8ff',muzzle:'#f0f8ff',
  extra:(o,{by,bw,bh,hx,hy,hr})=>{const {x,s,f}=o;for(let k=0;k<5;k++){const px=x-f*bw*.5+f*k*bw*.25;pf([[px-s*.07,by-bh*.85],[px,by-bh*1.5],[px+s*.07,by-bh*.85]],'#bfe8ff');}
    for(const k of [0,.2])pf([[hx+f*hr*(.6+k),hy+hr*.5],[hx+f*hr*(.67+k),hy+hr*.95],[hx+f*hr*(.74+k),hy+hr*.5]],'#e8f8ff');}});
// Geode Colossus: a towering giant of rock split open, crystal growing out of shoulders and back
MOB_LOOKS.geodecolossus=(m,o)=>biped(o,{wide:1.3,tw:1.0,th:1.4,round:.2,hr:.38,arm:.32,armL:1.3,fist:'#4a3a5a',head:'#6a5a7a',leg:'#4a3a5a',eye:'#f0d8ff',eyeGlow:'#d8a8ff',
  back:(o,{ty,tw,th})=>{const {x,s}=o;for(const [a,h,w] of [[-.9,1.3,.22],[-.55,1.7,.26],[.6,1.5,.24],[.95,1.1,.2]])pf([[x+a*tw-w*s,ty-th*.85],[x+a*tw,ty-th-h*s*.7],[x+a*tw+w*s,ty-th*.85]],'#c8a8ff');},
  extra:(o,{ty,tw,th})=>{const {x,s,t}=o;const p=.6+Math.sin(t*2)*.3;gl(x,ty-th*.55,s*1.2,'#e0c0ff',.4*p);pf([[x-tw*.4,ty-th*.8],[x,ty-th*.95],[x+tw*.35,ty-th*.7],[x+tw*.2,ty-th*.25],[x-tw*.3,ty-th*.3]],'#d8b8ff');
    ln([[x-tw*.4,ty-th*.8],[x+tw*.2,ty-th*.25]],'rgba(255,255,255,.6)',1.2);}});

/* ---------- Skyreach Glacier ---------- */
// Rime Drakeling: a small ice dragon on bat wings, frost trailing from its jaws
MOB_LOOKS.rimedrake=(m,o)=>{const {x,s,t,f,col}=o,y=o.y-s*1.5-Math.sin(t*3)*s*.2,fl=Math.sin(t*9);shadow(x,o.y,s*.7);
  for(const k of [-1,1]){pf([[x,y-s*.2],[x+k*s*.5,y-s*(.8+fl*.5)],[x+k*s*1.5,y-s*(.6+fl*.7)],[x+k*s*1.2,y],[x+k*s*.8,y-s*.15],[x+k*s*.5,y+s*.1]],'rgba(170,220,250,.85)');}
  ln([[x-f*s*.4,y+s*.1],[x-f*s*.9,y+s*.3],[x-f*s*1.2,y+s*.1]],col,s*.15);pf([[x-f*s*1.2,y+s*.1],[x-f*s*1.45,y-s*.05],[x-f*s*1.3,y+s*.25]],'#e8f8ff');
  el(x,y,s*.55,s*.35,col);el(x+f*s*.1,y+s*.12,s*.35,s*.16,'#e8f8ff');ci(x+f*s*.55,y-s*.3,s*.26,col);el(x+f*s*.82,y-s*.24,s*.18,s*.1,col);
  for(const k of [-1,1])pf([[x+f*s*.45+k*s*.08,y-s*.45],[x+f*s*.35+k*s*.12,y-s*.8],[x+f*s*.58+k*s*.06,y-s*.48]],'#e8f8ff');mlEye(x+f*s*.62,y-s*.36,Math.max(1.4,s*.07),'#ffffff','#8ae8ff');
  for(let k=0;k<4;k++){const ph=(t*1.5+k/4)%1;ctx.globalAlpha=(1-ph)*.7;ci(x+f*s*(1+ph*.8),y-s*.2+Math.sin(k*3)*s*.1,s*(.06+ph*.1),'#e8f8ff');}ctx.globalAlpha=1;};
// Frost Yeti: a shaggy white giant with a blue face, icicles hanging from its arms
MOB_LOOKS.frostyeti=(m,o)=>biped(o,{wide:1.15,tw:.9,th:1.2,round:.5,hr:.4,arm:.28,armL:1.25,face:'#7aa8c8',leg:'#d8e4ec',fist:'#d8e4ec',
  extra:(o,{ty,tw,th,hx,hy,hr})=>{const {x,s,f}=o;for(let k=-3;k<=3;k++)pf([[x+k*tw*.28-s*.08,ty-s*.02],[x+k*tw*.28,ty+s*.14],[x+k*tw*.28+s*.08,ty-s*.02]],'#eef4f8');
    for(const k of [-1,1])for(let i=0;i<3;i++)pf([[x+k*tw*1.05+i*s*.08-s*.04,ty-th*.3],[x+k*tw*1.05+i*s*.08,ty-th*.3+s*.25],[x+k*tw*1.05+i*s*.08+s*.04,ty-th*.3]],'#bfe8ff');
    el(hx+f*hr*.3,hy+hr*.45,hr*.3,hr*.12,'#2a3a4a');for(const k of [-1,1])pf([[hx+f*hr*.3+k*hr*.18-s*.03,hy+hr*.4],[hx+f*hr*.3+k*hr*.18,hy+hr*.6],[hx+f*hr*.3+k*hr*.18+s*.03,hy+hr*.4]],'#ffffff');}});
// Tusked Walrus: a heavy brown walrus with long ivory tusks and a bristly moustache
MOB_LOOKS.tuskwalrus=(m,o)=>{const {x,y,s,t,f,col,dark,mv}=o;shadow(x,y,s*1.3);const r=mv?Math.sin(t*6)*s*.06:0;
  el(x-f*s*.9,y-s*.15,s*.35,s*.12,dark,f*.4);el(x,y-s*.55+r,s*1.15,s*.55,col);el(x+f*s*.2,y-s*.32+r,s*.8,s*.25,mlShade(col,25));
  const hx=x+f*s*.85,hy=y-s*.95+r;ci(hx,hy,s*.42,col);el(hx+f*s*.25,hy+s*.18,s*.3,s*.2,'#c8a890');
  for(const k of [-1,1])ln([[hx+f*s*.2+k*s*.1,hy+s*.3],[hx+f*s*.25+k*s*.12,hy+s*.95]],'#f4ead0',Math.max(2,s*.11));
  for(let k=-3;k<=3;k++)ln([[hx+f*s*.25+k*s*.05,hy+s*.2],[hx+f*s*.3+k*s*.07,hy+s*.32]],'#5a3a2a',1);
  for(const k of [-.12,.12])mlEye(hx+f*s*.12+k*s,hy-s*.12,Math.max(1.4,s*.06));for(const k of [-1,1])el(x+k*s*.6,y-s*.12,s*.28,s*.1,dark,k*.3);};
// Frostbeak Penguin: an armoured penguin knight with an ice-blue beak, sliding on its belly when it charges
MOB_LOOKS.frostbeak=(m,o)=>{const {x,y,s,t,f,col,mv}=o;shadow(x,y,s*.9);const sl=mv&&Math.sin(t*2)>.3;
  if(sl){el(x,y-s*.4,s*1.0,s*.38,col);el(x+f*s*.1,y-s*.32,s*.7,s*.22,'#f4f8fc');ci(x+f*s*.9,y-s*.55,s*.3,col);pf([[x+f*s*1.1,y-s*.6],[x+f*s*1.5,y-s*.5],[x+f*s*1.1,y-s*.45]],'#8ae8ff');mlEye(x+f*s*1.0,y-s*.62,Math.max(1.4,s*.06));
    for(let k=0;k<3;k++)ci(x-f*s*(1.1+k*.3),y-s*.1,s*(.1-k*.02),'rgba(230,248,255,.7)');return;}
  const w=mv?Math.sin(t*10)*.15:Math.sin(t*2)*.05;ctx.save();ctx.translate(x,y);ctx.rotate(w);
  for(const k of [-1,1])el(k*s*.25,-s*.05,s*.2,s*.08,'#f0a03a');el(0,-s*.75,s*.55,s*.78,col);el(f*s*.1,-s*.7,s*.36,s*.6,'#f4f8fc');
  for(const k of [-1,1])el(k*s*.55,-s*.75,s*.13,s*.4,col,k*.3);ci(0,-s*1.5,s*.33,col);pf([[f*s*.25,-s*1.55],[f*s*.7,-s*1.45],[f*s*.25,-s*1.38]],'#8ae8ff');
  mlEye(f*s*.12,-s*1.58,Math.max(1.4,s*.07));ctx.fillStyle='#9ab8d0';ctx.beginPath();ctx.arc(0,-s*1.58,s*.36,Math.PI,0);ctx.fill();pf([[-s*.05,-s*1.94],[0,-s*2.2],[s*.05,-s*1.94]],'#bfe8ff');ctx.restore();};
// Hrimfang the Glacier Wyrm: a long serpent-dragon of ice, a crest of icicles, breath of frost, rising from the snow
MOB_LOOKS.hrimfang=(m,o)=>{const {x,y,s,t,f,col,mv}=o;shadow(x,y,s*1.6);const w=Math.sin(t*(mv?5:1.5));gl(x,y-s*1.5,s*2.6,'#9ae8ff',.25);
  const pts=[];for(let i=0;i<=10;i++){const u=i/10;pts.push([x-f*s*(1.6-u*2.4),y-s*(.2+Math.sin(u*Math.PI)*.5*u+u*u*2.0)+Math.sin(u*6+t*3)*s*.12*(1-u)]);}
  ctx.lineCap='round';for(let i=0;i<10;i++){ctx.strokeStyle=i%2?col:mlShade(col,20);ctx.lineWidth=s*(.85-i*.04);ctx.beginPath();ctx.moveTo(...pts[i]);ctx.lineTo(...pts[i+1]);ctx.stroke();}
  for(let i=2;i<10;i+=1){const [px,py]=pts[i];pf([[px-s*.08,py-s*.2],[px-f*s*.1,py-s*.55],[px+s*.08,py-s*.2]],'#e8f8ff');}
  const [hx,hy]=pts[10];el(hx+f*s*.3,hy,s*.7,s*.42,col);el(hx+f*s*.65,hy+s*.24+Math.abs(w)*s*.08,s*.48,s*.15,mlShade(col,-30));
  for(const k of [-1,1])pf([[hx-f*s*.05+k*s*.1,hy-s*.2],[hx-f*s*.45+k*s*.15,hy-s*.85],[hx+f*s*.15+k*s*.05,hy-s*.25]],'#d8f4ff');
  mlEye(hx+f*s*.35,hy-s*.1,Math.max(1.6,s*.08),'#ffffff','#5ad8ff');
  for(let k=0;k<6;k++){const ph=(t*1.2+k/6)%1;ctx.globalAlpha=(1-ph)*.6;ci(hx+f*s*(.9+ph*1.4),hy+s*.2+Math.sin(k*2)*s*.2*ph,s*(.08+ph*.2),'#e8f8ff');}ctx.globalAlpha=1;
  for(const k of [-1,1])el(x+k*s*.9,y-s*.08,s*.5,s*.12,'rgba(240,248,255,.9)');};

/* ---------- Duskwood ---------- */
// Gloam Stag: a violet stag whose antlers glow like moonlit branches, eyes like lanterns
MOB_LOOKS.gloamstag=(m,o)=>quad(o,{legs:.9,bw:.95,bh:.45,belly:'#8a7ab8',hr:.32,hup:.6,neck:1.0,antlers:'#c8b8ff',glow:'#b8a0ff',ears:1.0,muzzle:'#7a6aa8',tail:'#d8d0f0',eye:'#e8e0ff',eyeGlow:'#c8b0ff',
  extra:(o,{by,bw})=>{const {x,s,t}=o;for(let k=0;k<4;k++){const ph=(t*.4+k/4)%1;ctx.globalAlpha=(1-ph)*.6;ci(x+(k-1.5)*bw*.5,by-s*(.4+ph*1.2),s*.05,'#d8c8ff');}ctx.globalAlpha=1;}});
// Dusk Weaver: a black spider with violet markings, spinning a thread of shadow silk
MOB_LOOKS.duskweaver=(m,o)=>{const {x,y,s,t,f,col,mv}=o;shadow(x,y,s*1.3);ctx.strokeStyle='#1a1222';ctx.lineWidth=Math.max(1.5,s*.09);ctx.lineCap='round';
  for(let i=0;i<4;i++)for(const k of [-1,1]){const sw=mv?Math.sin(t*14+i*1.4+k)*s*.12:0,a=(i-1.5)*.35;ctx.beginPath();ctx.moveTo(x,y-s*.6);ctx.quadraticCurveTo(x+k*s*(.7+Math.abs(a)*.3),y-s*(1.1-i*.15),x+k*s*(1.2+i*.08)+sw,y-s*.02);ctx.stroke();}
  el(x-f*s*.35,y-s*.75,s*.6,s*.5,col);ctx.fillStyle='#b87aff';mlPoly([[x-f*s*.35,y-s*1.1],[x-f*s*.2,y-s*.8],[x-f*s*.35,y-s*.5],[x-f*s*.5,y-s*.8]]);ctx.fill();
  ci(x+f*s*.3,y-s*.62,s*.3,col);for(let k=0;k<4;k++)ci(x+f*s*(.38+(k%2)*.1),y-s*(.72-Math.floor(k/2)*.12),Math.max(1,s*.05),'#d8a0ff');
  ln([[x-f*s*.9,y-s*.8],[x-f*s*.9,y-s*2.4]],'rgba(200,180,255,.5)',1);};
// Nightbloom Dryad: a spirit of a twilight tree, a woman of bark and leaves with flowers glowing in her hair
MOB_LOOKS.nightdryad=(m,o)=>{const {x,s,t,f,col}=o;const fl=Math.sin(t*2)*s*.12,y=o.y-s*.6-fl;shadow(x,o.y,s*.7);gl(x,y-s*.8,s*1.6,'#c890ff',.3);
  pf([[x-s*.5,y+s*.6],[x-s*.3,y-s*.6],[x+s*.3,y-s*.6],[x+s*.5,y+s*.6],[x+s*.15,y+s*.3],[x,y+s*.65],[x-s*.15,y+s*.3]],'#4a3a5a');
  for(let k=0;k<3;k++)ln([[x+(k-1)*s*.15,y+s*.5],[x+(k-1)*s*.25,y+s*.95+fl]],'#3a2a4a',s*.06);
  for(const k of [-1,1])ln([[x+k*s*.25,y-s*.45],[x+k*s*.7,y-s*.7+Math.sin(t*2+k)*s*.1],[x+k*s*.9,y-s*1.0]],'#4a3a5a',s*.09);
  ci(x+f*s*.05,y-s*.85,s*.26,'#8a7aa0');for(let k=0;k<7;k++){const a=Math.PI*(1+k/6);el(x+Math.cos(a)*s*.35,y-s*.95+Math.sin(a)*s*.35,s*.15,s*.08,col,a);}
  for(const [a,b] of [[-.3,-1.2],[.1,-1.3],[.35,-1.05]]){ci(x+a*s,y+b*s,s*.08,'#f0c8ff');gl(x+a*s,y+b*s,s*.25,'#f0c8ff',.5);}
  for(const k of [-1,1])mlEye(x+k*s*.09+f*s*.06,y-s*.86,Math.max(1.3,s*.05),'#f8e0ff','#d8a0ff');};
// Duskfang Panther: a sleek black panther with violet-tipped fur, stalking low, glowing eyes
MOB_LOOKS.duskpanther=(m,o)=>quad(o,{legs:.5,bw:1.1,bh:.4,hr:.34,hup:.2,neck:1.0,tail:'long',ears:1.0,eye:'#c8a0ff',eyeGlow:'#b070ff',muzzle:'#3a2e4a',
  extra:(o,{by,bw,bh})=>{const {x,s,f}=o;ctx.strokeStyle='rgba(180,130,255,.55)';ctx.lineWidth=1.2;for(let k=0;k<4;k++){ctx.beginPath();ctx.moveTo(x-f*bw*.6+f*k*bw*.35,by-bh*.9);ctx.quadraticCurveTo(x-f*bw*.5+f*k*bw*.35,by-bh*.4,x-f*bw*.65+f*k*bw*.35,by);ctx.stroke();}void s;}});
// The Hollow King: a giant hooded wraith in a tattered royal cloak, an empty crown floating over the hood, a sceptre of dark light
MOB_LOOKS.hollowking=(m,o)=>{const {x,s,t,f,col}=o;const fl=Math.sin(t*1.5)*s*.15,y=o.y-s*1.1-fl;shadow(x,o.y,s*1.1);gl(x,y-s*.6,s*2.2,'#7a4ab8',.35);
  pf([[x-s*1.0,y+s*1.0],[x-s*.7,y-s*.9],[x,y-s*1.6],[x+s*.7,y-s*.9],[x+s*1.0,y+s*1.0],[x+s*.6,y+s*.75],[x+s*.3,y+s*1.1],[x,y+s*.8],[x-s*.3,y+s*1.1],[x-s*.6,y+s*.75]],col);
  pf([[x-s*.6,y-s*.4],[x-s*.75,y+s*.9],[x-s*.35,y+s*.7]],'#6a2a3a');pf([[x+s*.6,y-s*.4],[x+s*.75,y+s*.9],[x+s*.35,y+s*.7]],'#6a2a3a');
  el(x+f*s*.05,y-s*.9,s*.38,s*.42,'#0e0a14');for(const k of [-1,1])mlEye(x+k*s*.14+f*s*.08,y-s*.92,Math.max(1.6,s*.07),'#e0c8ff','#a070ff');
  mlCrown(x+f*s*.05,y-s*1.75-Math.sin(t*2)*s*.08,s*.38,'#9a8ac0');
  ctx.save();ctx.translate(x+f*s*.85,y);ctx.rotate(f*.2);ctx.fillStyle='#2a2238';ctx.fillRect(-s*.05,-s*.9,s*.1,s*1.6);gl(0,-s*1.0,s*.5,'#b080ff',.7);ci(0,-s*1.0,s*.14,'#e0c8ff');ctx.restore();};

/* ---------- Stormcrown Peaks ---------- */
// Thunderhawk: a white hawk with storm-blue wingtips, sparks crackling along its feathers
MOB_LOOKS.thunderhawk=(m,o)=>bird(o,{hover:1.8,flap:8,span:1.9,wing:'#4a6aa8',belly:'#ffffff',beak:'#f0c03a',eye:'#ffe060',eyeGlow:'#ffd040',
  extra:(o,{y,fl})=>{const {x,s,t}=o;if(Math.sin(t*7)>.4)for(const k of [-1,1])bolt(x+k*s*1.3,y-s*(.4+fl*.6),s*.6,'#fff6a0');}});
// Storm Elemental: a swirling thundercloud with a face of lightning and arms of wind
MOB_LOOKS.stormelemental=(m,o)=>{const {x,s,t,f,col}=o;const y=o.y-s*1.3+Math.sin(t*2)*s*.1;shadow(x,o.y,s);
  for(let k=0;k<3;k++){ctx.strokeStyle='rgba(200,225,255,.45)';ctx.lineWidth=s*.08;ctx.beginPath();ctx.ellipse(x,y+s*.9-k*s*.15,s*(.3+k*.2),s*(.08+k*.04),0,t*3+k,t*3+k+4);ctx.stroke();}
  for(const [a,b,r] of [[-.6,-.1,.45],[-.2,-.45,.55],[.35,-.35,.5],[.7,0,.4],[0,.1,.55],[-.45,.25,.35],[.4,.3,.38]])ci(x+a*s,y+b*s,r*s,b<-.2?mlShade(col,30):col);
  if(Math.sin(t*9)>.2){bolt(x-s*.4,y+s*.3,s*.9,'#fff6a0');bolt(x+s*.5,y+s*.35,s*.7,'#ffffff');}
  for(const k of [-1,1])ln([[x+k*s*.18+f*s*.1,y-s*.25],[x+k*s*.08+f*s*.1,y-s*.1]],'#fff6a0',Math.max(1.6,s*.08));
  ln([[x-s*.15+f*s*.1,y+s*.12],[x-s*.05+f*s*.1,y+s*.05],[x+s*.05+f*s*.1,y+s*.15],[x+s*.15+f*s*.1,y+s*.08]],'#fff6a0',1.4);};
// Sky Griffin: an eagle-headed lion on great golden wings
MOB_LOOKS.skygriffin=(m,o)=>quad(o,{legs:.7,bw:1.0,bh:.48,belly:'#e8d0a0',head:'#f4f0e8',hr:.36,hup:.55,neck:.95,beak:'#f0b83a',wings:'#c8a060',tail:'tuft',tailTip:'#8a6a3a',eye:'#f8c040'});
// Peak Giant: a mountain giant of grey rock, snow on its shoulders and a boulder in one fist
MOB_LOOKS.peakgiant=(m,o)=>biped(o,{wide:1.3,tw:1.0,th:1.35,round:.25,hr:.34,arm:.3,armL:1.35,fist:'#5a5e68',head:'#7a7e88',face:'#8a8e98',eye:'#a8e0ff',eyeGlow:'#7ac8ff',
  extra:(o,{ty,tw,th,hx,hy,hr})=>{const {x,s,f}=o;for(const k of [-1,1])el(x+k*tw*.85,ty-th*.98,s*.35,s*.14,'#f4f8fc');el(hx,hy-hr*.85,hr*.8,hr*.25,'#f4f8fc');
    ci(x-f*tw*1.15,ty-th*.1+s*.2,s*.42,'#6a6e78');ctx.strokeStyle='rgba(0,0,0,.25)';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(x-tw*.3,ty-th*.8);ctx.lineTo(x+tw*.1,ty-th*.5);ctx.lineTo(x-tw*.1,ty-th*.2);ctx.stroke();}});
// Voltaris the Tempest Roc: a colossal storm bird, wings dark as thunderheads, lightning in its crest
MOB_LOOKS.voltaris=(m,o)=>{const {x,s,t,f,col}=o,y=o.y-s*1.9-Math.sin(t*1.5)*s*.2,fl=Math.sin(t*5);shadow(x,o.y,s*1.4);gl(x,y,s*2.8,'#8ab8ff',.3);
  for(const k of [-1,1]){pf([[x,y-s*.2],[x+k*s*.7,y-s*(.8+fl*.4)],[x+k*s*1.6,y-s*(.9+fl*.7)],[x+k*s*2.3,y-s*(.4+fl*.8)],[x+k*s*1.9,y+s*.05],[x+k*s*1.4,y-s*.05],[x+k*s*1.0,y+s*.2]],'#2a3a5a');
    pf([[x+k*s*1.6,y-s*(.85+fl*.7)],[x+k*s*2.3,y-s*(.4+fl*.8)],[x+k*s*1.9,y+s*.05]],'#5a8ad0');}
  pf([[x-f*s*.5,y],[x-f*s*1.4,y-s*.3],[x-f*s*1.5,y+s*.1],[x-f*s*1.3,y+s*.4]],'#2a3a5a');el(x,y,s*.7,s*.45,col);el(x+f*s*.15,y+s*.15,s*.4,s*.22,'#c8d8f0');
  ci(x+f*s*.6,y-s*.4,s*.32,col);pf([[x+f*s*.85,y-s*.5],[x+f*s*1.3,y-s*.32],[x+f*s*.85,y-s*.22]],'#f0c03a');mlEye(x+f*s*.7,y-s*.48,Math.max(1.6,s*.07),'#fff6a0','#ffe040');
  for(let k=0;k<4;k++)pf([[x+f*s*(.45-k*.12)-s*.05,y-s*.65],[x+f*s*(.4-k*.18),y-s*(1.15-k*.08)],[x+f*s*(.45-k*.12)+s*.05,y-s*.65]],k%2?'#fff6a0':'#8ad0ff');
  if(Math.sin(t*6)>.5){bolt(x-s*1.2,y+s*.3,s*1.2,'#fff6a0');bolt(x+s*1.4,y+s*.2,s*1.0,'#ffffff');}};
/* ---------- (v1.62.0) the four corner regions (js/regions5.js) ---------- */
// a little walking plant: a round body of leaves on two root feet, a face, leaves or ears on top
const sprout=(o,q)=>{const {x,y,s,t,f,col,dark,mv}=o;shadow(x,y,s*.85);const b=mv?Math.abs(Math.sin(t*11))*s*.14:Math.sin(t*2)*s*.03,cy=y-s*.8-b;
  for(const k of [-1,1])ln([[x+k*s*.25,cy+s*.3],[x+k*s*.32+(mv?Math.sin(t*11+k)*s*.15:0),y]],dark,Math.max(1.6,s*.13));
  ci(x,cy,s*.62,col);for(let k=0;k<6;k++){const a=k*1.05+Math.sin(t*2+k)*.05;el(x+Math.cos(a)*s*.5,cy+Math.sin(a)*s*.45,s*.22,s*.13,q.leaf||mlShade(col,-25),a);}
  if(q.top)q.top(x,cy-s*.55,s,t);ci(x+f*s*.2,cy-s*.05,s*.07,'#1a1a1a');ci(x+f*s*.42,cy-s*.05,s*.07,'#1a1a1a');};
// a floating wisp: a glow, a soft body with a trailing tail
const wisp=(o,q)=>{const {x,s,t,f,col}=o,y=o.y-s*1.3-Math.sin(t*2.5)*s*.2;shadow(x,o.y,s*.6);gl(x,y,s*2.2,q.glow||col,.35);
  pf([[x-s*.45,y],[x-f*s*.2+Math.sin(t*4)*s*.2,y+s*1.1],[x+s*.45,y]],mlShade(col,-15));ci(x,y,s*.55,col);ci(x-s*.15,y-s*.18,s*.2,'rgba(255,255,255,.55)');
  ci(x+f*s*.12,y-s*.02,s*.08,q.eye||'#2a3a4a');ci(x+f*s*.34,y-s*.02,s*.08,q.eye||'#2a3a4a');if(q.extra)q.extra(o,y);};
// a moth on the wing
const moth=(o,q)=>{const {x,s,t,f,col,dark}=o,y=o.y-s*(q.hover??1.4)-Math.sin(t*3)*s*.15,w=Math.sin(t*(q.flap||22));shadow(x,o.y,s*.6);if(q.glow)gl(x,y,s*1.8,q.glow,.35);
  for(const k of [-1,1]){el(x+k*s*.55,y-s*.3*(1+w*.3),s*.55,s*.4*(.6+Math.abs(w)*.4),q.wing||col,k*.5);el(x+k*s*.45,y+s*.15,s*.35,s*.22,mlShade(q.wing||col,-20),k*.3);}
  el(x,y,s*.18,s*.45,dark);ci(x+f*s*.05,y-s*.45,s*.16,dark);ln([[x,y-s*.55],[x+f*s*.25,y-s*.85]],dark,1);ln([[x,y-s*.55],[x+f*s*.05,y-s*.9]],dark,1);if(q.extra)q.extra(o,y);};
MOB_LOOKS.briarling=(m,o)=>sprout(o,{leaf:'#4a6a2a',top:(x,y,s)=>{for(const k of [-1,0,1])ln([[x+k*s*.2,y+s*.1],[x+k*s*.35,y-s*.35]],'#5a3a2a',Math.max(1.2,s*.07));ci(x-s*.3,y-s*.3,s*.1,'#7a2a5a');ci(x+s*.32,y-s*.32,s*.1,'#7a2a5a');}});
MOB_LOOKS.galemoth=(m,o)=>moth(o,{wing:'#d8e4f0',extra:(o,y)=>{const {x,s,t}=o;ctx.strokeStyle='rgba(255,255,255,.6)';ctx.lineWidth=1;for(let k=0;k<3;k++){const p=(t*1.5+k/3)%1;ctx.beginPath();ctx.arc(x-o.f*s*(1+p*1.5),y+s*(.2-k*.2),s*.3,0,3);ctx.stroke();}}});
MOB_LOOKS.hedgeboar=(m,o)=>quad(o,{legs:.5,bw:1.05,bh:.6,head:'#7a4a2a',hr:.42,snout:'#c89a7a',tusks:true,ears:1.5,spikes:'#5a3a22',tail:'tuft'});
MOB_LOOKS.windsprite=(m,o)=>wisp(o,{glow:'#e8ffc8',eye:'#3a5a2a',extra:(o,y)=>{const {x,s,t}=o;for(let k=0;k<3;k++){const a=t*3+k*2.1;el(x+Math.cos(a)*s*.9,y+Math.sin(a)*s*.4,s*.16,s*.08,'#a8d870',a);}}});
MOB_LOOKS.bramblewarden=(m,o)=>biped(o,{tw:.85,th:1.25,hr:.42,head:'#5a7a32',leg:'#3a2a1a',armCol:'#4a6a2a',fist:'#3a2a1a',eyeGlow:'#d8ff7a',eye:'#e8ffa0',
  extra:(o,g)=>{const {x,s,t}=o;ctx.strokeStyle='#5a3a2a';ctx.lineWidth=Math.max(1.5,s*.06);for(let k=0;k<7;k++){const a=-Math.PI*(.15+k*.11);ctx.beginPath();ctx.moveTo(x+Math.cos(a)*g.tw*.9,g.ty-g.th*.5+Math.sin(a)*g.th*.5);ctx.lineTo(x+Math.cos(a)*g.tw*1.5,g.ty-g.th*.5+Math.sin(a)*g.th*.9);ctx.stroke();}
    for(const [a,b] of [[-.3,.4],[.35,.6],[0,.85]])ci(x+a*g.tw*2,g.ty-g.th*b,s*.09,'#7a2a5a');for(const k of [-1,1])ln([[g.hx+k*g.hr*.5,g.hy-g.hr*.7],[g.hx+k*g.hr*.9,g.hy-g.hr*1.6+Math.sin(t*2)*s*.05]],'#4a3020',Math.max(2,s*.08));}});
MOB_LOOKS.sheafling=(m,o)=>sprout(o,{leaf:'#c8a040',top:(x,y,s)=>{for(let k=-2;k<=2;k++){ln([[x+k*s*.08,y+s*.2],[x+k*s*.22,y-s*.4]],'#d8b050',Math.max(1.2,s*.06));el(x+k*s*.22,y-s*.45,s*.07,s*.14,'#e8c868',k*.3);}ln([[x-s*.4,y+s*.35],[x+s*.4,y+s*.35]],'#8a6a2a',Math.max(1.5,s*.08));}});
MOB_LOOKS.fieldvole=(m,o)=>quad(o,{legs:.3,bw:.85,bh:.55,hr:.45,ears:1.1,earCol:'#c8a080',snout:'#d8b898',tail:'long',tailCol:'#b89878',belly:'#d8c0a0'});
MOB_LOOKS.amberbeetle=(m,o)=>{const {x,y,s,t,f,mv}=o;shadow(x,y,s);mlLegs(o,x,s*.35,.6,Math.max(1.2,s*.08),'#5a3a1a');const by=y-s*.55-(mv?Math.abs(Math.sin(t*14))*s*.05:0);
  el(x,by,s*.85,s*.55,'#c07818');el(x-f*s*.05,by-s*.05,s*.75,s*.45,'#e8a030');ln([[x-f*s*.05,by-s*.5],[x-f*s*.05,by+s*.45]],'#8a5010',Math.max(1,s*.05));gl(x-s*.2,by-s*.2,s*.6,'#fff0b0',.5);
  ci(x+f*s*.8,by,s*.3,'#5a3a1a');for(const k of [-1,1])ln([[x+f*s*.95,by-s*.15],[x+f*s*1.3,by-s*.45+k*s*.12]],'#3a2a10',1.2);mlEye(x+f*s*.95,by-s*.05,Math.max(1.3,s*.07),'#1a1a1a');};
MOB_LOOKS.harvestwisp=(m,o)=>wisp(o,{glow:'#ffe8a0',eye:'#7a5a1a',extra:(o,y)=>{const {x,s,t}=o;for(let k=0;k<4;k++){const p=(t*.7+k/4)%1;ci(x+Math.sin(k*2.3+t)*s*.6,y+s*.4-p*s*1.4,s*.07,`rgba(255,230,150,${1-p})`);}}});
MOB_LOOKS.harvestmatron=(m,o)=>biped(o,{tw:.95,th:1.2,hr:.45,head:'#e0b860',face:'#f0d090',leg:'#7a5a2a',armCol:'#c89838',fist:'#e0b860',eye:'#4a2a0a',
  back:(o,g)=>{const {x,s,t}=o;for(let k=-3;k<=3;k++){const a=-Math.PI/2+k*.32+Math.sin(t*1.5+k)*.03;ln([[x,g.ty-g.th*.6],[x+Math.cos(a)*s*1.3,g.ty-g.th*.6+Math.sin(a)*s*1.35]],'#d8a838',Math.max(1.5,s*.07));el(x+Math.cos(a)*s*1.35,g.ty-g.th*.6+Math.sin(a)*s*1.4,s*.08,s*.16,'#f0c858',a+1.57);}},
  extra:(o,g)=>{const {s}=o;pf([[g.hx-g.hr*1.3,g.hy-g.hr*.4],[g.hx,g.hy-g.hr*1.8],[g.hx+g.hr*1.3,g.hy-g.hr*.4]],'#a87820');mlCrown(g.hx,g.hy-g.hr*1.55,s*.2,'#ffd860');}});
MOB_LOOKS.mistwisp=(m,o)=>wisp(o,{glow:'#d8eaf8',eye:'#3a5a7a'});
MOB_LOOKS.reedfrog=(m,o)=>{const {x,y,s,t,f,mv}=o;shadow(x,y,s*.9);const j=mv?Math.abs(Math.sin(t*7))*s*.45:0,by=y-s*.45-j;
  for(const k of [-1,1])el(x+k*s*.55,y-s*.12-j*.5,s*.35,s*.15,'#4a7a5a');el(x,by,s*.75,s*.5,'#6aa080');el(x+f*s*.1,by+s*.15,s*.5,s*.28,'#c8e0b0');
  for(const k of [-.15,.35]){ci(x+f*s*k,by-s*.42,s*.18,'#6aa080');mlEye(x+f*s*k,by-s*.46,Math.max(1.4,s*.09),'#1a1a1a');}ln([[x+f*s*.1,by],[x+f*s*.6,by+s*.05]],'#3a5a3a',1.2);
  const c=Math.sin(t*1.3);if(!mv&&c>.6)el(x+f*s*.35,by+s*.2,s*.25*c,s*.2*c,'#e8f0c8');};
MOB_LOOKS.valestag=(m,o)=>quad(o,{legs:.8,bw:.95,bh:.5,hr:.36,hup:.55,antlers:'#e8dcc0',ears:1.3,tail:'#f4ead8',belly:'#e8dcc8',muzzle:'#a89878'});
MOB_LOOKS.lanternmoth=(m,o)=>moth(o,{wing:'#e8d898',glow:'#ffe8a0',flap:16,extra:(o,y)=>{const {x,s,t}=o;const k=.7+Math.sin(t*5)*.3;gl(x,y+s*.35,s*.8,'#ffd860',.6*k);ci(x,y+s*.35,s*.14,'#fff4c0');}});
MOB_LOOKS.mistmother=(m,o)=>{const {x,s,t,f}=o,y=o.y-s*1.5-Math.sin(t*1.5)*s*.15;shadow(x,o.y,s*.9);for(let k=0;k<5;k++){const a=t*.5+k*1.25;gl(x+Math.cos(a)*s*1.4,o.y-s*.3+Math.sin(a)*s*.3,s*1.1,'#d8e8f4',.35);}
  pf([[x-s*.9,y+s*.2],[x-s*.6+Math.sin(t*2)*s*.2,y+s*1.4],[x+Math.sin(t*2.4)*s*.2,y+s*1.1],[x+s*.6+Math.sin(t*1.8)*s*.2,y+s*1.45],[x+s*.9,y+s*.2]],'#8aa0b8');
  el(x,y,s*.85,s*.9,'#a0b8d0');pf([[x-s*.75,y-s*.2],[x,y-s*1.25],[x+s*.75,y-s*.2]],'#7a90a8');el(x+f*s*.15,y-s*.15,s*.45,s*.4,'#e8f0f8');
  for(const k of [0,.32])mlEye(x+f*s*k,y-s*.18,Math.max(1.6,s*.06),'#a8e0ff','#a8e0ff');gl(x+f*s*.9,y+s*.2,s*.5,'#fff0b0',.6);ci(x+f*s*.9,y+s*.2,s*.12,'#fff4c8');ln([[x+f*s*.5,y],[x+f*s*.9,y+s*.08]],'#5a6a7a',1.4);};
MOB_LOOKS.thornrat=(m,o)=>quad(o,{legs:.32,bw:.9,bh:.5,hr:.4,ears:1.2,earCol:'#9a7a6a',snout:'#a88878',tail:'long',tailCol:'#8a6a5a',spikes:'#4a3a2a'});
MOB_LOOKS.mirebloom=(m,o)=>{const {x,y,s,t,f}=o;shadow(x,y,s);const sw=Math.sin(t*1.8)*s*.06;ln([[x,y],[x+sw,y-s*.9]],'#4a5a2a',Math.max(2,s*.14));
  for(const k of [-1,1])el(x+k*s*.45,y-s*.3,s*.4,s*.14,'#5a7a3a',k*.4);el(x+sw,y-s*1.05,s*.85,s*.5,'#9a4a6a');for(let k=0;k<5;k++)ci(x+sw+(k-2)*s*.32,y-s*1.25+Math.abs(k-2)*s*.08,s*.11,'#e8a0c0');
  const p=(t*.8)%1,p2=(p+.5)%1;ci(x+sw,y-s*(1.5+p),s*.08,`rgba(200,120,170,${1-p})`);ci(x+sw-s*.3,y-s*(1.4+p2),s*.06,`rgba(200,120,170,${1-p2})`);
  for(const k of [-.2,.2])ci(x+sw+f*s*.1+k*s,y-s*.95,s*.07,'#2a1a1a');};
MOB_LOOKS.bramblelupe=(m,o)=>quad(o,{legs:.62,bw:1.05,bh:.5,hr:.42,ears:1.6,muzzle:'#7a6a5a',tail:'bushy',tailCol:'#4a4038',mane:'#3a322a',eye:'#e8c040',
  extra:(o,g)=>{const {x,s}=o;ctx.strokeStyle='#5a3a2a';ctx.lineWidth=Math.max(1.2,s*.05);for(let k=-2;k<=2;k++){ctx.beginPath();ctx.moveTo(x+k*g.bw*.3,g.by-g.bh*.8);ctx.lineTo(x+k*g.bw*.3+s*.1,g.by-g.bh*1.35);ctx.stroke();}}});
MOB_LOOKS.thornstonegolem=(m,o)=>biped(o,{tw:.9,th:1.1,hr:.38,round:.12,head:'#7a7a6a',leg:'#4a4a3a',armCol:'#6a6a5a',fist:'#5a5a4a',eyeGlow:'#a8ff7a',eye:'#c8ff9a',
  extra:(o,g)=>{const {x,s}=o;for(const [a,b,r] of [[-.4,.3,.25],[.35,.55,.2],[-.1,.8,.18]])pf([[x+a*g.tw*2-s*r,g.ty-g.th*b],[x+a*g.tw*2,g.ty-g.th*b-s*r*1.8],[x+a*g.tw*2+s*r,g.ty-g.th*b]],'#5a4a3a');
    ctx.strokeStyle='#4a6a2a';ctx.lineWidth=Math.max(1.3,s*.06);ctx.beginPath();ctx.moveTo(x-g.tw,g.ty-g.th*.2);ctx.quadraticCurveTo(x,g.ty-g.th*.6,x+g.tw,g.ty-g.th*.4);ctx.stroke();}});
MOB_LOOKS.gnarlroot=(m,o)=>{const {x,y,s,t,f,mv}=o;shadow(x,y,s*1.3);const sw=Math.sin(t*(mv?6:1.2))*s*.05;
  for(const k of [-1,-.4,.4,1])ln([[x+k*s*.3,y-s*.6],[x+k*s*.75+(mv?Math.sin(t*6+k*3)*s*.12:0),y]],'#3a2a1a',Math.max(2.5,s*.16));
  pf([[x-s*.7,y-s*.5],[x-s*.55+sw,y-s*1.9],[x+s*.6+sw,y-s*1.95],[x+s*.7,y-s*.5]],'#4a3a2a');ln([[x-s*.3,y-s*.6],[x-s*.2+sw,y-s*1.8]],'#2e2216',Math.max(1.2,s*.05));ln([[x+s*.3,y-s*.6],[x+s*.25+sw,y-s*1.7]],'#2e2216',Math.max(1.2,s*.05));
  for(const k of [-1,1]){ln([[x+k*s*.55+sw,y-s*1.5],[x+k*s*1.2+sw,y-s*1.9+Math.sin(t*1.5+k)*s*.15],[x+k*s*1.5+sw,y-s*2.3]],'#3a2a1a',Math.max(2,s*.1));el(x+k*s*1.5+sw,y-s*2.4,s*.3,s*.18,'#4a6a2a',k*.5);}
  for(const [a,b] of [[-.3,2.1],[.2,2.15],[0,2.3]])el(x+a*s+sw,y-s*b,s*.35,s*.22,'#3a5a24',a);
  for(const k of [-.18,.2]){gl(x+f*s*.1+k*s+sw,y-s*1.45,s*.35,'#ffb040',.6);ci(x+f*s*.1+k*s+sw,y-s*1.45,s*.08,'#ffd060');}ln([[x-s*.2+sw,y-s*1.15],[x+s*.25+sw,y-s*1.12]],'#1a120a',Math.max(1.3,s*.05));};
/* ---------- (v1.63.0) the six gap regions (js/regions5.js) ---------- */
// a rock or clay golem with knobbly shoulders
const rocky=(o,c,eyeC)=>biped(o,{tw:.85,th:1.05,hr:.36,round:.1,head:mlShade(c,10),leg:mlShade(c,-35),armCol:mlShade(c,-10),fist:mlShade(c,-25),eyeGlow:eyeC,eye:eyeC,
  extra:(o,g)=>{const {x,s}=o;for(const k of [-1,1])ci(x+k*g.tw*.95,g.ty-g.th*.95,s*.26,mlShade(c,-15));for(const [a,b] of [[-.3,.4],[.25,.65]])ci(x+a*g.tw*2,g.ty-g.th*b,s*.1,mlShade(c,-30));}});
// a scuttling many-legged thing with a raised tail
const scuttle=(o,c,tail)=>{const {x,y,s,t,f,mv}=o;shadow(x,y,s*1.1);mlLegs(o,x,s*.3,.8,Math.max(1.2,s*.07),mlShade(c,-40));const by=y-s*.45-(mv?Math.abs(Math.sin(t*16))*s*.04:0);
  el(x,by,s*.75,s*.42,c);el(x-f*s*.05,by-s*.08,s*.6,s*.3,mlShade(c,15));for(const k of [-1,1])el(x+f*s*.85,by+k*s*.25,s*.25,s*.13,mlShade(c,-20),k*.4);
  if(tail){ctx.strokeStyle=mlShade(c,-15);ctx.lineWidth=Math.max(2,s*.14);ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x-f*s*.6,by);ctx.quadraticCurveTo(x-f*s*1.2,by-s*1.1,x-f*s*.4,by-s*1.2+Math.sin(t*4)*s*.08);ctx.stroke();ci(x-f*s*.35,by-s*1.2,s*.12,tail);}
  mlEye(x+f*s*.55,by-s*.15,Math.max(1.3,s*.07),'#1a1a1a');};
MOB_LOOKS.cragling=(m,o)=>rocky(o,'#8a8a9a','#c8e0ff');
MOB_LOOKS.cliffgoat=(m,o)=>quad(o,{legs:.75,bw:.9,bh:.5,hr:.38,hup:.5,horns:'curl',hornCol:'#a89878',ears:1.2,tail:'#e8e0d0',muzzle:'#c8c0b0',
  extra:(o,g)=>el(g.hx+o.f*g.hr*.4,g.hy+g.hr*.85,g.hr*.18,g.hr*.4,'#e8e0d0')});
MOB_LOOKS.cragkestrel=(m,o)=>bird(o,{wing:'#8a6a4a',belly:'#e8d8b8',head:'#a08060',beak:'#e0b040',span:1.7});
MOB_LOOKS.stormwisp=(m,o)=>wisp(o,{glow:'#a8d8ff',eye:'#1a3a5a',extra:(o,y)=>{const {x,s,t}=o;if(Math.sin(t*7)>.4)bolt(x+Math.sin(t*13)*s*.4,y-s*.9,s*.9,'#f0f8ff');}});
MOB_LOOKS.skyclaw=(m,o)=>bird(o,{wing:'#6a4a30',belly:'#e8d8b0',head:'#f4ead8',beak:'#e8b030',span:2.2,flap:6,hover:1.8,eyeGlow:'#ffd060',
  extra:(o,g)=>{const {x,s,f}=o;mlCrown(x+f*s*.5,g.y-s*.62,s*.16,'#ffd060');}});
MOB_LOOKS.mossnewt=(m,o)=>quad(o,{legs:.25,bw:.95,bh:.4,hr:.36,tail:'long',tailCol:'#4a7a3a',belly:'#c8d88a',stripes:'#3a6a2a'});
MOB_LOOKS.brookotter=(m,o)=>quad(o,{legs:.3,bw:1.05,bh:.45,hr:.38,ears:1.05,tail:'long',tailCol:'#5a3a22',belly:'#c8a878',muzzle:'#d8c0a0'});
MOB_LOOKS.pebblecrab=(m,o)=>scuttle(o,'#9aa8b0',null);
MOB_LOOKS.glenpixie=(m,o)=>moth(o,{wing:'#e8d8ff',glow:'#f0e0ff',hover:1.6,extra:(o,y)=>{const {x,s,t}=o;for(let k=0;k<3;k++){const p=(t*.9+k/3)%1;ci(x+Math.sin(k*2+t*2)*s*.5,y+s*.5+p*s*.6,s*.05,`rgba(255,240,255,${1-p})`);}}});
MOB_LOOKS.glenkeeper=(m,o)=>biped(o,{tw:.9,th:1.3,hr:.42,head:'#5a8a52',face:'#8ab070',leg:'#3a2a1a',armCol:'#4a7a4a',fist:'#3a5a2a',eye:'#e8ffd0',eyeGlow:'#c8ffa0',
  extra:(o,g)=>{const {x,s,t}=o;for(let k=0;k<5;k++)el(x+(k-2)*g.tw*.45,g.ty-g.th*(1.02+Math.abs(k-2)*-.04),s*.2,s*.11,'#6aa050',k*.6);ln([[g.hx,g.hy-g.hr],[g.hx+s*.1,g.hy-g.hr*2.1+Math.sin(t*2)*s*.06]],'#4a3020',Math.max(1.6,s*.07));el(g.hx+s*.18,g.hy-g.hr*2.1,s*.16,s*.09,'#8ad070',.5);}});
MOB_LOOKS.reedling=(m,o)=>sprout(o,{leaf:'#8a9a50',top:(x,y,s,t)=>{for(let k=-2;k<=2;k++)ln([[x+k*s*.1,y+s*.2],[x+k*s*.16+Math.sin(t*2+k)*s*.06,y-s*.6]],'#a8b070',Math.max(1.1,s*.05));el(x+s*.16,y-s*.62,s*.05,s*.16,'#7a5a2a');}});
MOB_LOOKS.marshleech=(m,o)=>{const {x,y,s,t,f,mv}=o;shadow(x,y,s);const w=Math.sin(t*(mv?8:2));
  for(let k=0;k<5;k++){const u=k/4;ci(x-f*s*(u-.5)*1.4,y-s*(.3+Math.sin(u*3+t*(mv?8:2))*.08),s*(.32-u*.1),k%2?'#5a3a3a':'#6a4444');}
  ci(x+f*s*.75,y-s*.32,s*.28,'#7a4a4a');ci(x+f*s*.95,y-s*.3,s*.12,'#2a1414');mlEye(x+f*s*.7,y-s*.48,Math.max(1.2,s*.06),'#e8c040');void w;};
MOB_LOOKS.firenewt=(m,o)=>quad(o,{legs:.25,bw:.95,bh:.38,hr:.36,tail:'long',tailCol:'#c8602a',belly:'#f0c060',stripes:'#a04a1a',glow:'#ff9a40',bodyGlow:true});
MOB_LOOKS.bogmussel=(m,o)=>{const {x,y,s,t,f}=o;shadow(x,y,s);const op=.15+Math.abs(Math.sin(t*1.2))*.2;
  el(x,y-s*.35,s*.8,s*.35,'#4a5a4a');ctx.save();ctx.translate(x,y-s*.35);ctx.rotate(-f*op);el(0,-s*.12,s*.8,s*.3,'#6a7a6a');ctx.restore();
  ci(x+f*s*.1,y-s*.45,s*.18,'#f0f0e0');gl(x+f*s*.1,y-s*.45,s*.35,'#ffffff',.4);};
MOB_LOOKS.marshhag=(m,o)=>biped(o,{tw:.75,th:1.15,hr:.42,head:'#7a9a6a',face:'#a8c090',leg:'#3a4a2a',armCol:'#5a7a4a',fist:'#6a8a5a',eye:'#f0e040',eyeGlow:'#d8f040',
  back:(o,g)=>{const {x,s,t}=o;for(let k=-3;k<=3;k++)ln([[g.hx+k*g.hr*.25,g.hy-g.hr*.5],[x+k*g.tw*.45+Math.sin(t*1.5+k)*s*.06,g.ty-g.th*.1]],'#4a5a3a',Math.max(1.5,s*.06));},
  extra:(o,g)=>{const {s,f}=o;pf([[g.hx-g.hr*1.1,g.hy-g.hr*.5],[g.hx+f*g.hr*.3,g.hy-g.hr*2.4],[g.hx+g.hr*1.1,g.hy-g.hr*.5]],'#3a4a2a');el(g.hx+f*g.hr*.75,g.hy+g.hr*.25,g.hr*.22,g.hr*.32,'#8aa070');ln([[g.hx+f*g.tw*1.4,g.ty-g.th*.3],[g.hx+f*g.tw*1.5,g.ty-g.th*1.6]],'#5a3a1a',Math.max(1.8,s*.07));ci(g.hx+f*g.tw*1.5,g.ty-g.th*1.65,s*.12,'#a8f070');}});
MOB_LOOKS.applesprite=(m,o)=>sprout(o,{leaf:'#4a8a2a',top:(x,y,s)=>{ln([[x,y+s*.1],[x+s*.05,y-s*.3]],'#5a3a1a',Math.max(1.4,s*.07));el(x+s*.18,y-s*.28,s*.16,s*.08,'#5aa03a',-.4);ci(x-s*.25,y-s*.05,s*.14,'#d04a3a');ci(x+s*.3,y+s*.05,s*.12,'#e05a3a');}});
MOB_LOOKS.orchardbee=(m,o)=>{const {x,s,t,f}=o,y=o.y-s*1.4+Math.sin(t*6)*s*.12;shadow(x,o.y,s*.5);const w=Math.sin(t*40);
  for(const k of [-1,1])el(x-f*s*.1+k*s*.15,y-s*.45-Math.abs(w)*s*.1,s*.32,s*.18*(.5+Math.abs(w)*.5),'rgba(230,240,255,.75)',k*.6);
  el(x,y,s*.5,s*.36,'#f0c850');for(const k of [-.2,.12])ln([[x+k*s,y-s*.33],[x+k*s,y+s*.33]],'#3a2a10',Math.max(1.4,s*.1));pf([[x-f*s*.48,y],[x-f*s*.75,y-s*.04],[x-f*s*.48,y+s*.1]],'#3a2a10');
  ci(x+f*s*.45,y-s*.05,s*.2,'#3a2a10');mlEye(x+f*s*.52,y-s*.1,Math.max(1.2,s*.06),'#1a1a1a');};
MOB_LOOKS.barkhound=(m,o)=>quad(o,{legs:.62,bw:1.05,bh:.5,hr:.42,ears:1.4,earCol:'#4a3018',muzzle:'#8a6a4a',tail:'tuft',tailTip:'#4a7a2a',eye:'#e8d040',
  extra:(o,g)=>{const {x,s}=o;ctx.strokeStyle='#4a3018';ctx.lineWidth=Math.max(1,s*.04);for(let k=-2;k<=2;k++){ctx.beginPath();ctx.moveTo(x+k*g.bw*.3,g.by-g.bh*.8);ctx.lineTo(x+k*g.bw*.3-s*.05,g.by+g.bh*.6);ctx.stroke();}el(x,g.by-g.bh*.95,g.bw*.4,s*.1,'#5a8a3a');}});
MOB_LOOKS.cidertoad=(m,o)=>{const {x,y,s,t,f,mv}=o;shadow(x,y,s);const j=mv?Math.abs(Math.sin(t*6))*s*.35:0,by=y-s*.5-j;
  for(const k of [-1,1])el(x+k*s*.6,y-s*.15-j*.5,s*.38,s*.16,'#a86a2a');el(x,by,s*.85,s*.6,'#c88a3a');el(x+f*s*.1,by+s*.2,s*.55,s*.3,'#f0d090');
  for(const [a,b] of [[-.4,-.2],[.2,-.35],[-.1,.1]])ci(x+a*s,by+b*s,s*.08,'#a86a2a');for(const k of [-.2,.35]){ci(x+f*s*k,by-s*.5,s*.18,'#c88a3a');mlEye(x+f*s*k,by-s*.54,Math.max(1.4,s*.09),'#1a1a1a');}
  ln([[x+f*s*.05,by+s*.02],[x+f*s*.65,by+s*.06]],'#7a4a1a',1.2);};
MOB_LOOKS.gnarledelder=(m,o)=>{const {x,y,s,t,f,mv}=o;shadow(x,y,s*1.3);const sw=Math.sin(t*(mv?6:1))*s*.05;
  for(const k of [-1,-.35,.35,1])ln([[x+k*s*.3,y-s*.6],[x+k*s*.7+(mv?Math.sin(t*6+k*3)*s*.1:0),y]],'#4a3420',Math.max(2.4,s*.15));
  pf([[x-s*.65,y-s*.5],[x-s*.5+sw,y-s*1.85],[x+s*.55+sw,y-s*1.9],[x+s*.65,y-s*.5]],'#5a4a2a');
  for(const [a,b,r,c] of [[-.7,2.1,.6,'#3f7a2a'],[.5,2.2,.65,'#4a8a32'],[0,2.55,.7,'#3f7a2a'],[-.2,2.0,.5,'#5a9a3a']])ci(x+a*s+sw,y-s*b,s*r,c);
  for(const [a,b] of [[-.5,2.3],[.6,2.0],[.1,2.7],[-.15,1.95]])ci(x+a*s+sw,y-s*b,s*.11,'#d04a3a');
  for(const k of [-.18,.2])ci(x+f*s*.08+k*s+sw,y-s*1.4,s*.08,'#f0e060');ln([[x-s*.2+sw,y-s*1.1],[x+s*.25+sw,y-s*1.08]],'#2a1a0a',Math.max(1.3,s*.05));};
MOB_LOOKS.claygolem=(m,o)=>rocky(o,'#b85a3a','#ffd080');
MOB_LOOKS.canyonvulture=(m,o)=>bird(o,{wing:'#3a2e28',belly:'#6a5a50',head:'#d89a8a',beak:'#e8d8b0',span:1.9,flap:5,hover:2,
  extra:(o,g)=>{const {x,s,f}=o;el(x+f*s*.28,g.y-s*.15,s*.22,s*.12,'#f0e8e0');}});
MOB_LOOKS.redscorpion=(m,o)=>scuttle(o,'#c8703a','#f0e060');
MOB_LOOKS.quartzwraith=(m,o)=>wisp(o,{glow:'#ffd8c8',eye:'#8a2a2a',extra:(o,y)=>{const {x,s,t}=o;for(let k=0;k<4;k++){const a=t*1.2+k*1.57;pf([[x+Math.cos(a)*s*.9,y+Math.sin(a)*s*.35-s*.2],[x+Math.cos(a)*s*.9+s*.1,y+Math.sin(a)*s*.35],[x+Math.cos(a)*s*.9,y+Math.sin(a)*s*.35+s*.2],[x+Math.cos(a)*s*.9-s*.1,y+Math.sin(a)*s*.35]],'#f8e0d0');}}});
MOB_LOOKS.canyontyrant=(m,o)=>biped(o,{tw:1.0,th:1.2,hr:.4,round:.08,wide:1.2,head:'#a85a3a',leg:'#6a2a1a',armCol:'#9a4a2a',fist:'#7a3a1a',eye:'#ffe080',eyeGlow:'#ffb040',
  extra:(o,g)=>{const {x,s}=o;for(let k=-2;k<=2;k++)ln([[x-g.tw,g.ty-g.th*(.3+k*.12)],[x+g.tw,g.ty-g.th*(.35+k*.12)]],'#c87a5a',Math.max(1,s*.04));
    for(const k of [-1,1])pf([[x+k*g.tw*.8,g.ty-g.th],[x+k*g.tw*1.2,g.ty-g.th*1.45],[x+k*g.tw*1.3,g.ty-g.th*.85]],'#7a3a1a');mlCrown(g.hx,g.hy-g.hr*1.05,s*.2,'#e8a060');}});
MOB_LOOKS.ashcrawler=(m,o)=>scuttle(o,'#9a8a8a',null);
MOB_LOOKS.cinderlizard=(m,o)=>quad(o,{legs:.3,bw:1.05,bh:.4,hr:.38,tail:'long',tailCol:'#4a2a1a',belly:'#e07a3a',spikes:'#e0702a',eye:'#ffb040',eyeGlow:'#ff8a20'});
MOB_LOOKS.emberhusker=(m,o)=>biped(o,{tw:.85,th:1.1,hr:.36,round:.15,head:'#5a3a2a',leg:'#3a2418',armCol:'#6a4430',fist:'#e0702a',eye:'#ffd060',eyeGlow:'#ff9a30',
  extra:(o,g)=>{const {x,s,t}=o;const k=.6+Math.sin(t*4)*.3;for(const [a,b] of [[-.3,.4],[.25,.6],[0,.8]]){gl(x+a*g.tw*2,g.ty-g.th*b,s*.3,'#ff8a30',.6*k);ci(x+a*g.tw*2,g.ty-g.th*b,s*.08,'#ffd080');}}});
MOB_LOOKS.ashwraith=(m,o)=>wisp(o,{glow:'#c8c0b8',eye:'#e04a2a',extra:(o,y)=>{const {x,s,t}=o;for(let k=0;k<5;k++){const p=(t*.5+k/5)%1;ci(x+Math.sin(k*1.7+t)*s*.7,y-s*.2-p*s*1.2,s*(.08+p*.1),`rgba(150,140,135,${.6*(1-p)})`);}}});
MOB_LOOKS.ashcolossus=(m,o)=>biped(o,{tw:1.05,th:1.35,hr:.42,round:.1,wide:1.3,head:'#6a6060',leg:'#3a3434',armCol:'#5a5252',fist:'#4a4242',eye:'#ffb040',eyeGlow:'#ff7a20',
  back:(o,g)=>{const {x,s,t}=o;for(let k=0;k<3;k++){const p=(t*.4+k/3)%1;gl(x+(k-1)*s*.5,g.ty-g.th*1.3-p*s*1.5,s*(.5+p*.6),'#8a8080',.45*(1-p));}},
  extra:(o,g)=>{const {x,s,t}=o;const k=.6+Math.sin(t*3)*.3;for(const [a,b] of [[-.35,.35],[.3,.55],[-.05,.75],[.4,.2]]){ln([[x+a*g.tw*2,g.ty-g.th*b],[x+a*g.tw*2+s*.15,g.ty-g.th*b-s*.25]],'#ff7a20',Math.max(1.4,s*.05));}gl(x,g.ty-g.th*.55,s*.6,'#ff6a10',.35*k);}});
/* ---------- (v1.64.0) the Tidewater Isle and the Sunken Grotto (js/isles.js) ---------- */
// an eel: a long wavy body rising from the water
const eel=(o,c,belly,glow)=>{const {x,y,s,t,f}=o;shadow(x,y,s*1.1);if(glow)gl(x,y-s*.9,s*1.6,glow,.3);
  for(let k=0;k<8;k++){const u=k/7,px=x-f*s*(u-.4)*1.6,py=y-s*(.25+u*.0)-Math.sin(u*5+t*4)*s*.28-(1-u)*s*.55;ci(px,py,s*(.32-u*.18),k%2?c:mlShade(c,12));}
  const hx=x+f*s*.7,hy=y-s*1.0-Math.sin(t*4)*s*.1;el(hx,hy,s*.38,s*.28,c,f*.3);el(hx+f*s*.1,hy+s*.12,s*.25,s*.1,belly);pf([[hx-f*s*.1,hy-s*.25],[hx-f*s*.35,hy-s*.6],[hx-f*s*.4,hy-s*.2]],mlShade(c,-20));
  mlEye(hx+f*s*.18,hy-s*.08,Math.max(1.3,s*.07),glow?'#e8fff8':'#1a1a1a',glow);};
MOB_LOOKS.tidecrab=(m,o)=>scuttle(o,'#e06a4a',null);
MOB_LOOKS.seagull=(m,o)=>bird(o,{wing:'#d8dce0',belly:'#ffffff',head:'#ffffff',beak:'#f0b030',tail:'#a8b0b8',span:1.9,flap:7});
MOB_LOOKS.kelpling=(m,o)=>sprout(o,{leaf:'#3a7a4a',top:(x,y,s,t)=>{for(let k=-2;k<=2;k++)ln([[x+k*s*.1,y+s*.15],[x+k*s*.2+Math.sin(t*2+k)*s*.12,y-s*.45],[x+k*s*.12+Math.sin(t*2.4+k)*s*.15,y-s*.8]],'#4a8a5a',Math.max(1.4,s*.08));}});
MOB_LOOKS.tidepoolslime=(m,o)=>{const {x,y,s,t,f,mv}=o;shadow(x,y,s*1.1);const sq=mv?Math.abs(Math.sin(t*6))*.15:Math.sin(t*2)*.04;
  el(x,y-s*.55*(1-sq),s*(.95+sq*.5),s*.6*(1-sq),'rgba(106,200,216,.85)');el(x-s*.3,y-s*.85,s*.25,s*.13,'rgba(255,255,255,.55)',-.4);
  for(const [a,b,c] of [[-.3,-.35,'#f07a8a'],[.25,-.25,'#f0e060'],[0,-.15,'#ffffff']])ci(x+a*s,y+b*s,s*.08,c);
  for(const k of [.05,.35])mlEye(x+f*s*k,y-s*.65,Math.max(1.4,s*.08),'#1a3a4a');};
MOB_LOOKS.reefmatriarch=(m,o)=>{const {x,s,t,f}=o,y=o.y-s*1.3-Math.sin(t*1.6)*s*.12;shadow(x,o.y,s*.9);gl(x,y,s*2.2,'#7ad8f0',.3);
  for(let k=0;k<6;k++){const a=Math.PI*(.15+k*.14);ln([[x+Math.cos(a)*s*.4,y+s*.4],[x+Math.cos(a)*s*1.1+Math.sin(t*2+k)*s*.12,y+s*1.25]],'#3a9ab8',Math.max(2,s*.1));}
  el(x,y,s*.85,s*.75,'#5ab8d8');el(x+f*s*.15,y-s*.1,s*.5,s*.45,'#c8f0f8');
  for(const [a,c] of [[-.55,'#f07a8a'],[-.2,'#f0e060'],[.2,'#f07a8a'],[.55,'#a8e0f0']])pf([[x+a*s-s*.08,y-s*.65],[x+a*s,y-s*1.15],[x+a*s+s*.08,y-s*.65]],c);
  for(const k of [0,.32])mlEye(x+f*s*k,y-s*.12,Math.max(1.6,s*.06),'#e8fff8','#a8f0ff');};
MOB_LOOKS.grottoeel=(m,o)=>eel(o,'#3a5a6a','#a8c8c8');
MOB_LOOKS.grottoeel2=(m,o)=>eel(o,'#1a3a4a','#6a9aa8','#6ae8d8');
MOB_LOOKS.pearlclam=(m,o)=>{const {x,y,s,t,f}=o;shadow(x,y,s);const op=.12+Math.abs(Math.sin(t*1.1))*.25;
  el(x,y-s*.35,s*.85,s*.35,'#b8b0c8');ctx.save();ctx.translate(x,y-s*.35);ctx.rotate(-f*op);el(0,-s*.12,s*.85,s*.3,'#e8e0f0');ctx.strokeStyle='#a8a0b8';ctx.lineWidth=1;for(let k=-2;k<=2;k++){ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(k*s*.3,-s*.35);ctx.stroke();}ctx.restore();
  ci(x+f*s*.1,y-s*.45,s*.2,'#fff8ff');gl(x+f*s*.1,y-s*.45,s*.45,'#ffffff',.5);};
MOB_LOOKS.driftwisp=(m,o)=>wisp(o,{glow:'#c8f0ff',eye:'#2a5a7a'});
MOB_LOOKS.sirenwisp=(m,o)=>wisp(o,{glow:'#f0c8ff',eye:'#6a2a7a',extra:(o,y)=>{const {x,s,t}=o;ctx.strokeStyle='rgba(240,200,255,.6)';ctx.lineWidth=1.2;for(let k=0;k<3;k++){const p=(t*.8+k/3)%1;ctx.beginPath();ctx.arc(x,y,s*(.7+p*1.2),-.6,.6);ctx.stroke();}}});
MOB_LOOKS.abysswisp=(m,o)=>wisp(o,{glow:'#6a6ac8',eye:'#e8e8ff'});
MOB_LOOKS.coralguard=(m,o)=>biped(o,{tw:.85,th:1.15,hr:.36,round:.2,head:'#f08a9a',leg:'#a84a5a',armCol:'#e07080',fist:'#f0a0a8',eye:'#2a2a4a',
  extra:(o,g)=>{const {x,s}=o;for(const [a,b] of [[-.6,1.05],[.55,1.1],[0,1.0]]){ln([[x+a*g.tw,g.ty-g.th*b],[x+a*g.tw*1.3,g.ty-g.th*b-s*.5]],'#f07a8a',Math.max(2,s*.1));ln([[x+a*g.tw*1.15,g.ty-g.th*b-s*.25],[x+a*g.tw*1.6,g.ty-g.th*b-s*.4]],'#f07a8a',Math.max(1.5,s*.07));}}});
MOB_LOOKS.inkcrawler=(m,o)=>{scuttle(o,'#2a2a4a',null);const {x,y,s,t}=o;for(let k=0;k<3;k++){const p=(t*.6+k/3)%1;ci(x-o.f*s*(.8+p*.8),y-s*.3,s*(.2+p*.3),`rgba(20,20,40,${.5*(1-p)})`);}};
MOB_LOOKS.abysscrab=(m,o)=>scuttle(o,'#4a3a6a','#8a7ae8');
MOB_LOOKS.drownedknight=(m,o)=>biped(o,{tw:.8,th:1.15,hr:.36,round:.12,head:'#5a7a8a',leg:'#2a3a44',armCol:'#4a6a7a',fist:'#3a5a6a',eye:'#7af0e0',eyeGlow:'#4ae0d0',
  extra:(o,g)=>{const {x,s,t}=o;pf([[g.hx-g.hr*1.05,g.hy+g.hr*.1],[g.hx-g.hr*.9,g.hy-g.hr*1.1],[g.hx+g.hr*.9,g.hy-g.hr*1.1],[g.hx+g.hr*1.05,g.hy+g.hr*.1]],'#4a6a74');
    for(const k of [-1,1])ln([[x+k*g.tw*.6,g.ty-g.th*.9],[x+k*g.tw*.7+Math.sin(t*1.5+k)*s*.05,g.ty-g.th*.1]],'#3a7a4a',Math.max(1.3,s*.05));
    ln([[x+o.f*g.tw*1.3,g.ty-g.th*.2],[x+o.f*g.tw*1.4,g.ty-g.th*1.5]],'#a8b8c0',Math.max(1.6,s*.07));}});
MOB_LOOKS.leviathan=(m,o)=>{const {x,y,s,t,f}=o;shadow(x,y,s*1.4);gl(x,y-s*.8,s*2,'#4ac8e8',.25);
  for(let k=0;k<3;k++){const bx=x-f*s*(.9+k*.6),by=y-s*(.25+Math.sin(t*2+k)*.12);el(bx,by,s*(.45-k*.08),s*(.35-k*.06),k%2?'#2a7aa8':'#3a8ab8');}
  for(let k=0;k<4;k++){const u=k/3;ci(x+f*s*u*.6,y-s*(.6+u*.9),s*(.62-u*.15),k%2?'#2a7aa8':'#3a8ab8');}
  const hx=x+f*s*.75,hy=y-s*1.9-Math.sin(t*1.5)*s*.08;el(hx,hy,s*.6,s*.42,'#2a7aa8',f*.2);el(hx+f*s*.2,hy+s*.18,s*.4,s*.16,'#a8e0f0');
  for(const k of [-1,1])pf([[hx-f*s*.1+k*s*.15,hy-s*.3],[hx-f*s*.45+k*s*.35,hy-s*.95],[hx-f*s*.05+k*s*.3,hy-s*.35]],'#1a5a80');
  for(let k=0;k<4;k++)pf([[x-f*s*(.2-k*.3),y-s*(1.15-k*.15)],[x-f*s*(.35-k*.3),y-s*(1.55-k*.15)],[x-f*s*(.05-k*.3),y-s*(1.2-k*.15)]],'#1a5a80');
  mlEye(hx+f*s*.25,hy-s*.1,Math.max(1.8,s*.06),'#e8fff8','#6af0ff');mlCrown(hx-f*s*.05,hy-s*.42,s*.18,'#6af0ff');};
}

/* ---------- the land: upright pictures for the new themes ---------- */
{const _sp4=sprite;const KINDS=['greenpine','jungletree','dusktree','ruin','shardrock','icespire'];
sprite=function(theme,kind,v){if(!KINDS.includes(kind))return _sp4.apply(this,arguments);const key='r4'+theme+kind+v;if(SPR[key])return SPR[key];
  const th=THEMES[theme]||{},c=document.createElement('canvas');c.width=90;c.height=124;const g=c.getContext('2d'),ax=45,ay=114,R=seeded(31+v*17+kind.length);
  g.fillStyle='rgba(0,0,0,.26)';g.beginPath();g.ellipse(ax,ay,22,8,0,0,7);g.fill();
  if(kind==='greenpine'){g.fillStyle='#5a3d24';g.fillRect(ax-3,ay-20,6,20);const c0=(th.canopy||['#1f4a32'])[0],c1=(th.canopy||['#1f4a32','#2a5a3c'])[1];
    for(let k=0;k<5;k++){const w=28-k*5,ty=ay-14-k*16-v*2;g.fillStyle=k%2?c1:c0;g.beginPath();g.moveTo(ax-w,ty);g.lineTo(ax,ty-26);g.lineTo(ax+w,ty);g.fill();g.fillStyle='rgba(255,255,255,.08)';g.beginPath();g.moveTo(ax-w*.5,ty-6);g.lineTo(ax,ty-26);g.lineTo(ax-w*.1,ty-4);g.fill();}}
  else if(kind==='jungletree'){g.strokeStyle='#6a4a2a';g.lineWidth=7;g.beginPath();g.moveTo(ax,ay);g.quadraticCurveTo(ax+(v-1)*8,ay-50,ax+(v-1)*4,ay-80);g.stroke();
    g.strokeStyle='#3a8a3a';g.lineWidth=1.5;for(let k=0;k<4;k++){g.beginPath();g.moveTo(ax+(v-1)*4,ay-78);g.quadraticCurveTo(ax-20+k*14,ay-60,ax-24+k*16,ay-30+R()*10);g.stroke();}
    const c0=(th.canopy||['#1e5a2a'])[0],c1=(th.canopy||['#1e5a2a','#2f7a34'])[1];for(let k=0;k<8;k++){const a=-Math.PI/2+(k-3.5)*.42,tx=ax+(v-1)*4,ty=ay-82;g.fillStyle=k%2?c0:c1;g.save();g.translate(tx,ty);g.rotate(a+Math.PI/2);
      g.beginPath();g.ellipse(0,-20,9,22,0,0,7);g.fill();g.strokeStyle='rgba(0,0,0,.18)';g.lineWidth=1;g.beginPath();g.moveTo(0,0);g.lineTo(0,-40);g.stroke();g.restore();}
    if(v===2){g.fillStyle='#ff6a8a';g.beginPath();g.arc(ax-14,ay-64,4,0,7);g.fill();g.fillStyle='#ffd04a';g.beginPath();g.arc(ax-14,ay-64,1.6,0,7);g.fill();}}
  else if(kind==='dusktree'){g.strokeStyle='#2a2232';g.lineWidth=8;g.lineCap='round';g.beginPath();g.moveTo(ax,ay);g.lineTo(ax,ay-50);g.stroke();g.lineWidth=4;
    for(const [dx,dy] of [[-22,-80],[20,-84],[-8,-92],[14,-66],[-18,-60]]){g.beginPath();g.moveTo(ax,ay-44);g.quadraticCurveTo(ax+dx*.4,ay-60,ax+dx,ay+dy);g.stroke();}
    const c0=(th.canopy||['#3a2a5a'])[0],c1=(th.canopy||['#3a2a5a','#5a3a7a'])[1];for(const [dx,dy,r] of [[-20,-82,13],[18,-86,14],[-4,-94,13],[12,-68,10],[-16,-64,10]]){g.fillStyle=c0;g.beginPath();g.arc(ax+dx,ay+dy,r,0,7);g.fill();g.fillStyle=c1;g.beginPath();g.arc(ax+dx-3,ay+dy-3,r*.6,0,7);g.fill();}
    for(let k=0;k<5;k++){const x=ax-24+R()*48,y=ay-100+R()*44;const gr=g.createRadialGradient(x,y,0,x,y,6);gr.addColorStop(0,'rgba(220,190,255,.95)');gr.addColorStop(1,'rgba(220,190,255,0)');g.fillStyle=gr;g.beginPath();g.arc(x,y,6,0,7);g.fill();}
    g.fillStyle='#c8a0ff';for(const dx of [-12,10]){g.beginPath();g.ellipse(ax+dx,ay-4,4,2.5,0,0,7);g.fill();g.fillStyle='#e8d0ff';}}
  else if(kind==='ruin'){const r0=(th.rock||['#9a948a'])[0],r1=(th.rock||['#9a948a','#bab4a8'])[1];
    if(v===0){g.fillStyle=r0;g.fillRect(ax-16,ay-10,32,10);g.fillStyle=r1;g.fillRect(ax-11,ay-70,22,62);g.fillStyle=r0;g.fillRect(ax-11,ay-70,7,62);
      g.fillStyle=r1;g.beginPath();g.moveTo(ax-14,ay-70);g.lineTo(ax-4,ay-78);g.lineTo(ax+6,ay-72);g.lineTo(ax+14,ay-80);g.lineTo(ax+14,ay-70);g.fill();
      g.strokeStyle='rgba(0,0,0,.22)';g.lineWidth=1;for(let k=0;k<4;k++){g.beginPath();g.moveTo(ax-5+k*4,ay-68);g.lineTo(ax-5+k*4,ay-10);g.stroke();}}
    else if(v===1){g.fillStyle=r0;g.beginPath();g.ellipse(ax-6,ay-8,24,10,0,0,7);g.fill();g.fillStyle=r1;g.beginPath();g.ellipse(ax-6,ay-12,20,8,-.1,0,7);g.fill();g.fillStyle=r0;g.fillRect(ax+6,ay-24,26,14);g.fillStyle=r1;g.fillRect(ax+6,ay-28,26,6);}
    else{g.fillStyle=r1;g.fillRect(ax-24,ay-56,48,8);g.fillStyle=r0;g.fillRect(ax-22,ay-48,10,48);g.fillRect(ax+12,ay-48,10,48);g.fillStyle=r1;g.fillRect(ax-20,ay-48,5,48);g.fillRect(ax+14,ay-48,5,48);}
    g.fillStyle='#4a8a3a';for(let k=0;k<6;k++){g.beginPath();g.arc(ax-14+R()*28,ay-20-R()*40,3+R()*3,0,7);g.fill();}}
  else if(kind==='shardrock'){const r0=(th.rock||['#8a6ad0'])[0],r1=(th.rock||['#8a6ad0','#b8a0f0'])[1];
    for(const [dx,h,w,a] of [[-14,40+v*6,9,-.25],[10,34,8,.3],[0,58+v*8,11,0],[-4,26,7,-.5],[16,22,6,.55]]){g.save();g.translate(ax+dx,ay-4);g.rotate(a);g.fillStyle=r0;g.beginPath();g.moveTo(-w,0);g.lineTo(-w,-h*.75);g.lineTo(0,-h);g.lineTo(w,-h*.75);g.lineTo(w,0);g.fill();
      g.fillStyle=r1;g.beginPath();g.moveTo(0,0);g.lineTo(0,-h);g.lineTo(w,-h*.75);g.lineTo(w,0);g.fill();g.fillStyle='rgba(255,255,255,.35)';g.fillRect(-w*.6,-h*.7,2,h*.5);g.restore();}}
  else if(kind==='icespire'){const r0=(th.rock||['#9cc8e8'])[0],r1=(th.rock||['#9cc8e8','#d8f0ff'])[1];
    for(const [dx,h,w] of [[-12,46+v*8,10],[12,36+v*4,9],[0,70+v*6,12]]){g.fillStyle=r0;g.beginPath();g.moveTo(ax+dx-w,ay-2);g.lineTo(ax+dx-w*.3,ay-h);g.lineTo(ax+dx+w,ay-2);g.fill();
      g.fillStyle=r1;g.beginPath();g.moveTo(ax+dx-w*.3,ay-h);g.lineTo(ax+dx+w,ay-2);g.lineTo(ax+dx+w*.1,ay-2);g.fill();g.strokeStyle='rgba(255,255,255,.7)';g.lineWidth=1.2;g.beginPath();g.moveTo(ax+dx-w*.5,ay-h*.4);g.lineTo(ax+dx-w*.3,ay-h*.9);g.stroke();}
    g.fillStyle='#f4fbff';g.beginPath();g.ellipse(ax,ay-3,24,5,0,0,7);g.fill();}
  return SPR[key]={c,ax,ay};};}

/* ---------- air, weather, footsteps ---------- */
if(typeof AMB!=='undefined')Object.assign(AMB,{downs:{n:22,col:'#fff2a0'},ridge:{n:24,col:'#d8ffb8'},ruins:{n:20,col:'rgba(230,240,210,.8)'},jungle:{n:34,col:'#c8ff6a'},
  steppe:{n:30,col:'#e8d0ff'},glacier:{n:60,col:'#ffffff'},dusk:{n:40,col:'#d0a8ff'},peaks:{n:46,col:'rgba(220,230,255,.8)'}});
if(typeof BEDS!=='undefined')Object.assign(BEDS,{downs:[.01,700],ridge:[.022,520],ruins:[.014,420],jungle:[.026,480],steppe:[.024,900],glacier:[.035,1100],dusk:[.016,380],peaks:[.038,1000]});
if(typeof SPOTS!=='undefined'){const S=(fn,a,b)=>typeof fn==='function'?[fn,a,b]:null;const add=(id,v)=>{if(v)SPOTS[id]=v;};
  add('downs',S(typeof chirp==='function'&&chirp,5,9));add('ridge',S(typeof owl==='function'&&typeof chirp==='function'&&(()=>Math.random()<.4?owl():chirp()),6,12));
  add('ruins',S(typeof gust==='function'&&gust,6,12));add('jungle',S(typeof chirp==='function'&&chirp,3,7));add('steppe',S(typeof gust==='function'&&gust,5,10));
  add('glacier',S(typeof gust==='function'&&gust,4,8));add('dusk',S(typeof owl==='function'&&owl,7,14));add('peaks',S(typeof gust==='function'&&gust,3,7));}
if(typeof WEATHERS!=='undefined')Object.assign(WEATHERS,{downs:[['clear',4],['rain',1]],ridge:[['clear',2],['fog',1],['rain',1]],ruins:[['clear',2],['fog',2]],jungle:[['rain',2],['clear',1],['fog',1]],
  steppe:[['clear',3],['fog',1]],glacier:[['snow',2],['clear',1],['blizzard',1]],dusk:[['fog',2],['clear',1]],peaks:[['snow',1],['blizzard',1],['rain',1]]});
{const _ga4=groundAt;groundAt=function(x,y){const r=_ga4.apply(this,arguments);try{if(Z&&r!=='stone'){const t=Z.D.theme;if(t==='glacier')return 'snow';if(t==='crystal'||t==='storm'||t==='ruins')return r==='grass'?'stone':r;}}catch(e){}return r;};}

/* ---------- a song for each new region ---------- */
if(typeof SONGS!=='undefined'&&typeof noteNum==='function'&&typeof chordNotes==='function'){Object.assign(SONGS,{
  downs:{bpm:104,spb:4,lead:'triangle',lp:3000,lv:1,chords:'G D Em C G C D G',drums:{k:[0],h:[2]},mel:'D5 . B4 . | G4 . B4 D5 | E5 . D5 . | B4 . . . | C5 . E5 . | D5 . B4 G4 | A4 . B4 A4 | G4 . . .'},
  pines:{bpm:92,spb:4,lead:'triangle',lp:2200,lv:1,chords:'Am F C G Am F G Am',drums:{k:[0,2],h:[1,3]},mel:'A4 . C5 . | F4 . A4 . | G4 . E4 . | D4 . G4 . | A4 . C5 E5 | F5 . E5 C5 | D5 . B4 . | A4 . . .'},
  ruins:{bpm:76,spb:4,lead:'sine',lp:1800,lv:1,chords:'Dm A Dm C Bb F Gm A',drums:{k:[0],h:[]},mel:'D5 . . A4 | C#5 . E5 . | F5 . E5 D5 | E5 . . . | D5 . F5 . | C5 . A4 . | Bb4 . A4 G4 | A4 . . .'},
  jungle:{bpm:120,spb:4,lead:'square',lp:2400,lv:.8,chords:'Em Em C D Em Em C B',drums:{k:[0,3],h:[1,2]},mel:'E5 G5 E5 . | B4 . D5 . | E5 . G5 A5 | G5 . E5 . | C5 E5 G5 . | F#5 . D5 . | E5 . B4 . | E5 . . .'},
  crystal:{bpm:84,spb:4,lead:'sine',lp:4200,lv:1,chords:'C Am F G C Em F G',drums:{k:[0],h:[2]},mel:'E5 . G5 . | C6 . A5 . | F5 . A5 . | G5 . . . | E5 . G5 . | B5 . G5 . | A5 . F5 . | G5 . . .'},
  glacier:{bpm:80,spb:4,lead:'triangle',lp:3600,lv:1,chords:'Bm G D A Bm G A Bm',drums:{k:[0],h:[2]},mel:'F#5 . . D5 | B4 . D5 . | A4 . D5 . | C#5 . . . | B4 . D5 F#5 | G5 . F#5 D5 | E5 . C#5 . | B4 . . .'},
  dusk:{bpm:72,spb:4,lead:'sine',lp:1600,lv:1,chords:'Cm Ab Eb Bb Cm Ab G Cm',drums:{k:[0],h:[]},mel:'G4 . C5 . | Eb5 . C5 . | Bb4 . G4 . | F4 . . . | G4 . C5 D5 | Eb5 . D5 C5 | B4 . D5 . | C5 . . .'},
  storm:{bpm:132,spb:4,lead:'sawtooth',lp:2000,lv:.7,chords:'Dm Dm Bb C Dm Dm Bb A',drums:{k:[0,2,3],h:[1,3]},mel:'D5 . F5 D5 | A5 . F5 . | Bb4 . D5 F5 | E5 . C5 . | D5 . F5 A5 | D6 . A5 . | G5 . F5 D5 | C#5 . A4 .'}});
  for(const id of ['downs','pines','ruins','jungle','crystal','glacier','dusk','storm']){const s=SONGS[id];const toks=s.mel.replace(/\|/g,' ').trim().split(/\s+/);s.len=toks.length;s.ch=s.chords.split(' ').map(chordNotes);
    s.notes=toks.map((t,i)=>{const n=noteNum(t);if(n===null)return null;let len=1;while(toks[i+len]==='.')len++;return {n,len};});}}
else for(const id of ['downs','ridge','ruins','jungle','steppe','glacier','dusk','peaks'])if(ZONES[id])ZONES[id].music={downs:'meadow',ridge:'woods',ruins:'crypt',jungle:'woods',steppe:'caves',glacier:'frost',dusk:'caves',peaks:'frost'}[id];

/* ---------- sigil album pages, Waystation banners, blurbs ---------- */
if(typeof ALBUM!=='undefined')for(const p of [{id:'downs',name:'Goldleaf Downs',zones:['downs'],b:{maxhp:80}},{id:'ridge',name:'Pinewatch Ridge',zones:['ridge'],b:{dex:2}},
  {id:'ruins',name:'Old Aurel Ruins',zones:['ruins'],b:{def:6}},{id:'jungle',name:'Thornveil Jungle',zones:['jungle'],b:{aspd:2,agi:1}},{id:'steppe',name:'Crystal Steppe',zones:['steppe'],b:{matk:12,int:1}},
  {id:'glacier',name:'Skyreach Glacier',zones:['glacier'],b:{hppct:3,vit:1}},{id:'dusk',name:'Duskwood',zones:['dusk'],b:{critdmg:5,luk:1}},{id:'peaks',name:'Stormcrown Peaks',zones:['peaks'],b:{atk:15,flee:6}}])
  if(!ALBUM.some(a=>a.id===p.id))ALBUM.push(p);
if(typeof tcBanner==='function'){const _tb4=tcBanner;const SKY={downs:['#9fd8f8','#f0f8e0'],pines:['#9ac8e8','#d8ecf0'],ruins:['#b8c8d0','#e8ece0'],jungle:['#8ad0b0','#d8f0c8'],
  crystal:['#c8b8f0','#f0e8ff'],glacier:['#b8e0f8','#f0faff'],dusk:['#2a2244','#6a4a8a'],storm:['#3a4250','#7a8290']};
  tcBanner=function(id){const D=ZONES[id];if(!D||!SKY[D.theme]||TC_BAN[id])return _tb4.apply(this,arguments);const th=THEMES[D.theme],c=document.createElement('canvas');c.width=240;c.height=56;const g=c.getContext('2d');
    const sk=g.createLinearGradient(0,0,0,56);sk.addColorStop(0,SKY[D.theme][0]);sk.addColorStop(1,SKY[D.theme][1]);g.fillStyle=sk;g.fillRect(0,0,240,56);let s=id.length*977+7;const R=()=>((s=(s*9301+49297)%233280)/233280);
    const T=D.theme;
    if(T==='pines'||T==='glacier'||T==='storm'){for(let i=0;i<6;i++){const x=i*48+R()*20;g.fillStyle=T==='storm'?'#4a4e58':'#8aa0b8';g.beginPath();g.moveTo(x-32,42);g.lineTo(x,6+R()*10);g.lineTo(x+32,42);g.fill();g.fillStyle='#f4f8ff';g.beginPath();g.moveTo(x-8,16);g.lineTo(x,7);g.lineTo(x+8,16);g.fill();}
      if(T==='pines')for(let i=0;i<12;i++){const x=i*21+R()*8;g.fillStyle='#2a5a3c';g.beginPath();g.moveTo(x-7,46);g.lineTo(x,26+R()*6);g.lineTo(x+7,46);g.fill();}
      if(T==='storm'){g.strokeStyle='#fff6a0';g.lineWidth=2;g.beginPath();g.moveTo(170,0);g.lineTo(160,16);g.lineTo(172,20);g.lineTo(158,40);g.stroke();}}
    else if(T==='ruins'){g.fillStyle='#a8a296';for(let i=0;i<6;i++){const x=i*42+R()*12,h=14+R()*18;g.fillRect(x,44-h,9,h);if(i%2)g.fillRect(x-3,44-h-3,15,4);}}
    else if(T==='crystal'){for(let i=0;i<9;i++){const x=i*28+R()*10,h=10+R()*18;g.fillStyle=i%2?'#8a6ad0':'#b8a0f0';g.beginPath();g.moveTo(x-5,46);g.lineTo(x,46-h);g.lineTo(x+5,46);g.fill();}}
    else{for(let i=0;i<9;i++){const x=i*28+R()*14,r=10+R()*8;g.fillStyle=shade((th.canopy||['#3f7d34'])[0],R()*.1);g.beginPath();g.arc(x,32-R()*6,r,0,7);g.fill();g.fillStyle='#4a3020';g.fillRect(x-1.5,36,3,8);}
      if(T==='dusk')for(let i=0;i<8;i++){g.fillStyle='rgba(230,200,255,.9)';g.beginPath();g.arc(R()*240,R()*36,1.3,0,7);g.fill();}}
    g.fillStyle=th.g[0];g.fillRect(0,42,240,14);g.fillStyle=shade(th.g[0],-.3);g.fillRect(0,42,240,2);
    if(th.path){g.fillStyle=th.path;g.beginPath();g.moveTo(90,56);g.quadraticCurveTo(120,46,150,44);g.lineTo(158,44);g.quadraticCurveTo(130,48,112,56);g.fill();}
    return TC_BAN[id]=c.toDataURL();};}
if(typeof WORLD_BRANCH!=='undefined'&&ZONES.molten1)WORLD_BRANCH.caldera=['molten1','molten2','molten3'];
{const B={downs:'Golden hills west of Aurelmark. Sheep, moles and bees, and the Old Woolhorn.',ridge:'Pines on the mountain road north. Boars, owls and bears; the Elder Antlerking leads them.',
  ruins:'The fallen first city of the Aurel kings. Statues still stand guard, and the Fallen Paladin walks.',jungle:'Hot, wet and loud. Vipers in the vines, flowers that bite, and Queen Orchidra.',
  steppe:'Violet grass and singing crystals. The Geode Colossus sleeps here.',glacier:'A river of ice above Frostpeak. Yetis, walruses, and Hrimfang the Glacier Wyrm.',
  dusk:'A forest where the sun never rises. The Hollow King holds court in the dark.',peaks:'The roof of the world, where storms are born. Voltaris the Tempest Roc rules the sky.'};
  if(typeof ZONE_BLURB!=='undefined')Object.assign(ZONE_BLURB,B);
  if(typeof TH!=='undefined'){const T={[B.downs]:'เนินเขาสีทองทางตะวันตกของออเรลมาร์ก มีแกะ ตัวตุ่น ผึ้ง และแกะเขาทองผู้เฒ่า',[B.ridge]:'ป่าสนบนเส้นทางภูเขาทางเหนือ หมูป่า นกฮูก หมี และราชากวางผู้เฒ่า',
    [B.ruins]:'ซากเมืองแรกของกษัตริย์ออเรล รูปปั้นยังคงเฝ้ายาม และอัศวินผู้ล่มสลายยังเดินอยู่',[B.jungle]:'ร้อน ชื้น และเสียงดัง งูในเถาวัลย์ ดอกไม้ที่กัดได้ และราชินีออร์คิดรา',
    [B.steppe]:'ทุ่งหญ้าสีม่วงและผลึกที่ร้องเพลงได้ ยักษ์หินจีโอดหลับอยู่ที่นี่',[B.glacier]:'แม่น้ำน้ำแข็งเหนือช่องเขาฟรอสต์พีค เยติ วอลรัส และฮริมแฟงมังกรธารน้ำแข็ง',
    [B.dusk]:'ป่าที่ดวงอาทิตย์ไม่เคยขึ้น ราชาผู้ว่างเปล่าครองราชย์ในความมืด',[B.peaks]:'หลังคาโลก ที่ซึ่งพายุถือกำเนิด โวลทาริส นกยักษ์แห่งพายุครองท้องฟ้า',
    'World map':'แผนที่โลก','The city':'ตัวเมือง','North road':'ถนนสายเหนือ','Between the roads':'ระหว่างถนน','the country off the four roads':'แผ่นดินนอกถนนสี่สาย','East road':'ถนนสายตะวันออก','South road':'ถนนสายใต้','West road':'ถนนสายตะวันตก',
    'cold hills and mountains':'เนินเขาและภูเขาอันหนาวเย็น','fields, woods and wilds':'ทุ่งหญ้า ป่าไม้ และป่าดิบ','farms, desert and sea':'ไร่นา ทะเลทราย และทะเล','past Aurelmark':'เลยออเรลมาร์กไป',
    'Hearthvale and the capital Aurelmark stand in the middle of the world. Four winding roads lead out, and the farther you go, the stronger the monsters. Tobin at the Waystation sends you to any region you have visited.':'ฮาร์ธเวลและเมืองหลวงออเรลมาร์กตั้งอยู่กลางโลก มีถนนคดเคี้ยวสี่สายออกไป ยิ่งไปไกลมอนสเตอร์ยิ่งแข็งแกร่ง โทบินที่สถานีพักส่งคุณไปที่ไหนก็ได้ที่เคยไปแล้ว',
    '⌂ Hearthvale · ♛ Aurelmark · numbers are the lowest monster level · ▼ dungeon below · tap a square':'⌂ ฮาร์ธเวล · ♛ ออเรลมาร์ก · ตัวเลขคือเลเวลมอนสเตอร์ต่ำสุด · ▼ มีดันเจี้ยนข้างล่าง · แตะที่ช่อง'};
    for(const k in T)if(!TH[k])TH[k]=T[k];
    if(typeof TH_PAT!=='undefined')TH_PAT.unshift([/^▼ Stairs down in (.+)$/,(m,a)=>`▼ บันไดลงใน ${a}`]);}}

/* ---------- loot pictures for the new drops ---------- */
if(typeof drawItemIcon==='function'){const OLc='#2a2018';
  const lp=(g,f)=>{g.fillStyle=f;g.fill();g.strokeStyle=OLc;g.lineWidth=1.6;g.stroke();};
  const poly=(g,pts)=>{g.beginPath();pts.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();};
  const hi=(g,x,y,rx,ry)=>{g.fillStyle='rgba(255,255,255,.55)';g.beginPath();g.ellipse(x,y,rx,ry,-.4,0,7);g.fill();};
  const dk=(c,k)=>typeof shade==='function'?shade(c,k):c;
  const A={
    feather:(g,c)=>{g.beginPath();g.moveTo(7,27);g.quadraticCurveTo(10,10,25,5);g.quadraticCurveTo(22,20,7,27);lp(g,c);g.strokeStyle=dk(c,-.35);g.lineWidth=1.2;g.beginPath();g.moveTo(6,28);g.quadraticCurveTo(14,16,24,6);g.stroke();},
    fang:(g,c)=>{g.beginPath();g.moveTo(9,6);g.quadraticCurveTo(25,8,22,27);g.quadraticCurveTo(17,16,9,12);g.closePath();lp(g,c);hi(g,14,10,3,1.5);},
    claw:(g,c)=>{for(const dx of [-6,0,6]){g.beginPath();g.moveTo(10+dx,24);g.quadraticCurveTo(8+dx,10,18+dx,5);g.quadraticCurveTo(14+dx,13,15+dx,24);g.closePath();lp(g,c);}},
    fur:(g,c)=>{poly(g,[[5,20],[8,10],[15,7],[22,9],[28,15],[26,25],[17,28],[8,26]]);lp(g,c);g.strokeStyle=dk(c,-.25);g.lineWidth=1.1;g.beginPath();for(const [x,y] of [[10,15],[16,12],[21,16],[13,21],[20,22]]){g.moveTo(x,y);g.quadraticCurveTo(x+2,y+3,x+4,y+1);}g.stroke();},
    shell:(g,c)=>{g.beginPath();g.moveTo(5,24);g.quadraticCurveTo(16,0,27,24);g.closePath();lp(g,c);g.strokeStyle=dk(c,-.3);g.lineWidth=1.1;g.beginPath();for(const x of [10,16,22]){g.moveTo(16,8);g.lineTo(x,24);}g.stroke();},
    stone:(g,c)=>{poly(g,[[6,22],[8,10],[17,6],[26,11],[27,22],[17,27]]);lp(g,c);g.strokeStyle=dk(c,-.3);g.lineWidth=1.1;g.beginPath();g.moveTo(10,14);g.lineTo(16,17);g.lineTo(22,13);g.moveTo(16,17);g.lineTo(17,25);g.stroke();},
    gem:(g,c)=>{poly(g,[[8,12],[16,5],[24,12],[16,28]]);lp(g,c);poly(g,[[8,12],[24,12],[16,28]]);g.fillStyle=dk(c,-.2);g.fill();hi(g,13,10,3,1.5);},
    crystal:(g,c)=>{for(const [x,h] of [[11,16],[17,22],[23,14]]){poly(g,[[x-4,27],[x-4,27-h*.7],[x,27-h],[x+4,27-h*.7],[x+4,27]]);lp(g,c);}},
    dust:(g,c)=>{g.beginPath();g.moveTo(6,26);g.quadraticCurveTo(16,8,26,26);g.closePath();lp(g,'#e8dcc8');for(const [x,y,r] of [[12,20,2.5],[18,17,3],[20,23,2],[15,24,2]]){g.beginPath();g.arc(x,y,r,0,7);g.fillStyle=c;g.fill();}},
    coin:(g,c)=>{for(const [x,y] of [[12,20],[19,15]]){g.beginPath();g.ellipse(x,y,8,7,0,0,7);lp(g,c);g.strokeStyle=dk(c,-.3);g.lineWidth=1;g.beginPath();g.ellipse(x,y,4.5,4,0,0,7);g.stroke();}},
    cone:(g,c)=>{g.beginPath();g.ellipse(16,17,8,11,0,0,7);lp(g,c);g.fillStyle=dk(c,-.3);for(let r=0;r<4;r++)for(let k=-1;k<=1;k++){g.beginPath();g.moveTo(16+k*5-3,9+r*4);g.lineTo(16+k*5,12+r*4);g.lineTo(16+k*5+3,9+r*4);g.fill();}},
    comb:(g,c)=>{poly(g,[[6,10],[16,5],[26,10],[26,22],[16,27],[6,22]]);lp(g,c);g.strokeStyle=dk(c,-.3);g.lineWidth=1;for(const [x,y] of [[12,12],[20,12],[16,18],[12,22],[20,22]]){g.beginPath();g.arc(x,y,2.5,0,7);g.stroke();}},
    quill:(g,c)=>{for(let k=0;k<4;k++){g.strokeStyle=k%2?c:dk(c,-.2);g.lineWidth=2;g.beginPath();g.moveTo(8+k*3,27);g.lineTo(14+k*4,5+k);g.stroke();}g.beginPath();g.arc(23,8,3,0,7);g.fillStyle='#c87ae0';g.fill();},
    vine:(g,c)=>{g.strokeStyle=dk(c,-.2);g.lineWidth=2.4;g.beginPath();g.moveTo(5,26);g.bezierCurveTo(14,20,8,10,26,6);g.stroke();for(const [x,y,a] of [[10,20,.5],[13,13,-.6],[20,9,.4]]){g.save();g.translate(x,y);g.rotate(a);g.beginPath();g.ellipse(0,-4,3,5,0,0,7);lp(g,c);g.restore();}},
    flower:(g,c)=>{for(let k=0;k<5;k++){const a=k/5*Math.PI*2;g.beginPath();g.ellipse(16+Math.cos(a)*6,15+Math.sin(a)*6,5,3.5,a,0,7);lp(g,c);}g.beginPath();g.arc(16,15,3,0,7);g.fillStyle='#ffe07a';g.fill();},
    antler:(g,c)=>{g.strokeStyle=OLc;g.lineWidth=4.5;const pth=()=>{g.beginPath();g.moveTo(10,28);g.lineTo(14,16);g.lineTo(9,6);g.moveTo(14,16);g.lineTo(22,10);g.lineTo(24,4);g.moveTo(18,13);g.lineTo(26,15);};pth();g.stroke();g.strokeStyle=c;g.lineWidth=2.4;pth();g.stroke();},
    core:(g,c)=>{const gr=g.createRadialGradient(16,16,1,16,16,11);gr.addColorStop(0,'#ffffff');gr.addColorStop(1,c);g.beginPath();g.arc(16,16,10,0,7);g.fillStyle=gr;g.fill();g.strokeStyle=OLc;g.lineWidth=1.6;g.stroke();
      g.strokeStyle='#fff6a0';g.lineWidth=1.4;g.beginPath();g.moveTo(15,9);g.lineTo(12,16);g.lineTo(18,16);g.lineTo(15,23);g.stroke();},
    wart:(g,c)=>{g.beginPath();g.arc(16,17,9,0,7);lp(g,c);for(const [x,y] of [[13,13],[19,15],[15,20]]){g.beginPath();g.arc(x,y,2.2,0,7);g.fillStyle=dk(c,.25);g.fill();}},
    scale:(g,c)=>{for(const [x,y] of [[11,12],[21,12],[16,20]]){g.beginPath();g.moveTo(x-6,y-3);g.quadraticCurveTo(x,y+10,x+6,y-3);g.quadraticCurveTo(x,y-1,x-6,y-3);lp(g,c);}},
    silk:(g,c)=>{g.beginPath();g.ellipse(16,16,10,8,.3,0,7);lp(g,c);g.strokeStyle='rgba(255,255,255,.35)';g.lineWidth=1;for(let k=-2;k<=2;k++){g.beginPath();g.ellipse(16,16,10-Math.abs(k)*2,3,.3+k*.3,0,7);g.stroke();}},
    tusk:(g,c)=>{g.beginPath();g.moveTo(6,26);g.quadraticCurveTo(10,8,26,5);g.quadraticCurveTo(16,14,11,27);g.closePath();lp(g,c);g.strokeStyle=dk(c,-.2);g.lineWidth=1;for(const k of [.3,.5,.7]){g.beginPath();g.moveTo(6+k*14,26-k*16);g.lineTo(10+k*12,27-k*14);g.stroke();}}};
  const MAP={wooltuft:'fur',moleclaw:'claw',honeycomb:'comb',thistlequill:'quill',pinecone:'cone',boartusk:'tusk',owlfeather:'feather',bearpelt:'fur',rustycoin:'coin',ivyvine:'vine',carvedstone:'stone',relicgem:'gem',
    viperfang:'fang',apefur:'fur',nectar:'flower',jadewart:'wart',quartzchip:'crystal',prismdust:'dust',geodeshell:'shell',glassfang:'fang',rimescale:'scale',yetifur:'fur',walrustusk:'tusk',penguinfeather:'feather',
    gloamantler:'antler',shadowsilk:'silk',nightbloom:'flower',pantherfang:'fang',stormfeather:'feather',stormcore:'core',griffinplume:'feather',giantstone:'stone'};
  const _di4=drawItemIcon;drawItemIcon=function(g,id){const k=MAP[id],it=ITEMS[id];if(!k||!it)return _di4.apply(this,arguments);
    g.save();g.lineJoin='round';g.lineCap='round';try{A[k](g,it.col||'#c8c2b4');}finally{g.restore();}};
  if(typeof ICON_CACHE!=='undefined')for(const k in MAP){delete ICON_CACHE[k];if(typeof ICON_CANVAS!=='undefined')delete ICON_CANVAS[k];}}
