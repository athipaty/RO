"use strict";
/* ================= every town building has its own shape =================
   The shared timber house becomes a set of building styles, chosen by what the building is for:
     shop      plastered shop with timber beams, a gable roof and shuttered windows
     smith     stone walls under a lean-to roof, a wide double door
     heal      a tall white chapel, steep roof facing the street, arched door and a round rose window
     warp      a plank barn with a broken (gambrel) roof, a big arched barn door and a hay loft
     storage   a plank warehouse with a low roof and wide doors; the Bank is pale stone with a temple front
     job       a tall stone hall with two rows of windows and battlements on a flat roof
     library   stone walls with tall arched windows under a dome
     gemcut    a violet shop with a round tower and a cone roof on its corner
   "Grand" buildings in Aurelmark get a stone plinth. The trade dressing (js/buildings.js) still goes on top. */
const ARCHI={
  shop:   {wall:['#ead9b8','#c9b38e'],tex:'timber',roof:'gable-x',rh:46,door:'rect',win:'shutter',shut:'#7a3a2a'},
  smith:  {wall:['#a49c92','#827a70'],tex:'stone',roof:'shed',rh:30,door:'double',win:'small'},
  heal:   {wall:['#f4efe4','#d6cfc0'],tex:'band',roof:'gable-y',rh:70,h:66,door:'arch',win:'arch',rose:true},
  warp:   {wall:['#b88050','#97663c'],tex:'plank',roof:'gambrel',rh:50,door:'barn',win:'loft'},
  storage:{wall:['#a88a58','#866a40'],tex:'plank',roof:'gable-x',rh:32,door:'double',win:'small'},
  bank:   {wall:['#ece4d2','#ccc2ac'],tex:'stone',roof:'gable-y',rh:34,door:'arch',win:'arch',pediment:true},
  job:    {wall:['#cfc6b4','#aca291'],tex:'stone',roof:'flat',h:72,door:'arch',win:'two'},
  library:{wall:['#ddd0b2','#bcae90'],tex:'stone',roof:'dome',door:'arch',win:'tall'},
  gemcut: {wall:['#d2c6e6','#aea0c8'],tex:'band',roof:'hip',rh:44,door:'rect',win:'diamond',tower:true}};
function archiOf(b){const role=b.npc&&b.npc.role;if(!role)return null;if(role==='storage'&&b.npc&&/Banker/.test(b.npc.name))return ARCHI.bank;return ARCHI[role]||null;}

function drawArchi(b,A){
  const X0=b.x*TILE,Y0=b.y*TILE,X1=(b.x+b.w)*TILE,Y1=(b.y+b.h)*TILE,W=X1-X0,D=Y1-Y0,Xc=(X0+X1)/2,Yc=(Y0+Y1)/2,H=A.h||60,RH=A.rh||50,e=12;
  const P2=(x,y,h=0)=>{const p=proj(x,y);return{x:p.x,y:p.y-h};};
  // a point on the front face (u along x) or the right face (u along -y)
  const F=(u,h)=>P2(X0+u,Y1,h),R=(u,h)=>P2(X1,Y1-u,h);
  const [wf,wr]=A.wall,line='#5a4632',dark=c=>shade(c,-30);
  const grand=typeof zoneId!=='undefined'&&zoneId==='capital';
  poly([P2(X0,Y1),P2(X1+30,Y1),P2(X1+30,Y0+30),P2(X1,Y0)],'rgba(0,0,0,.22)');
  if(grand){const s=8;poly([P2(X0-s,Y1+s),P2(X1+s,Y1+s),P2(X1+s,Y1+s,6),P2(X0-s,Y1+s,6)],'#b8b0a0','#6a6458');poly([P2(X1+s,Y1+s),P2(X1+s,Y0-s),P2(X1+s,Y0-s,6),P2(X1+s,Y1+s,6)],'#989080','#6a6458');
    poly([P2(X0-s,Y1+s,6),P2(X1+s,Y1+s,6),P2(X1+s,Y0-s,6),P2(X0-s,Y0-s,6)],'#c8c0b0');}
  // walls
  poly([F(0,0),F(W,0),F(W,H),F(0,H)],wf,line);poly([R(0,0),R(D,0),R(D,H),R(0,H)],wr,line);
  const seg=(a,b2,col,w)=>{ctx.strokeStyle=col;ctx.lineWidth=w||1;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b2.x,b2.y);ctx.stroke();};
  // wall texture
  if(A.tex==='stone'){const rows=Math.floor(H/11);for(const [S,L,col] of [[F,W,dark(wf)],[R,D,dark(wr)]]){ctx.globalAlpha=.55;
      for(let r=1;r<rows;r++)seg(S(0,r*11),S(L,r*11),col,1);for(let r=0;r<rows;r++)for(let u=(r%2)*12+6;u<L;u+=24)seg(S(u,r*11),S(u,r*11+11),col,1);ctx.globalAlpha=1;}}
  else if(A.tex==='plank'){for(const [S,L,col] of [[F,W,dark(wf)],[R,D,dark(wr)]]){ctx.globalAlpha=.5;for(let h=7;h<H;h+=7)seg(S(0,h),S(L,h),col,1);ctx.globalAlpha=1;}
    for(const [S,L] of [[F,W],[R,D]])for(const u of [2,L-2])seg(S(u,0),S(u,H),'#5a3a1c',3);}
  else if(A.tex==='timber'){for(const [S,L] of [[F,W],[R,D]]){for(const t of [.02,.33,.66,.98])seg(S(L*t,0),S(L*t,H),'#6a4a2c',2.4);seg(S(0,H*.52),S(L,H*.52),'#6a4a2c',2.4);
      seg(S(L*.02,H*.52),S(L*.33,H),'#6a4a2c',1.6);seg(S(L*.98,H*.52),S(L*.66,H),'#6a4a2c',1.6);}}
  else if(A.tex==='band'){poly([F(0,0),F(W,0),F(W,9),F(0,9)],'#a8a090');poly([R(0,0),R(D,0),R(D,9),R(0,9)],'#8a8274');}
  // windows and doors, shaped along the face so they lean with it
  const rect=(S,u0,h0,u1,h1,fill,edge)=>poly([S(u0,h0),S(u1,h0),S(u1,h1),S(u0,h1)],fill,edge||line);
  const arch=(S,uc,hw,h0,h1,fill)=>{const pts=[S(uc-hw,h0),S(uc+hw,h0)];for(let i=0;i<=10;i++){const t=i/10,u=uc+hw-2*hw*t;pts.push(S(u,h1+Math.sqrt(Math.max(0,1-(2*t-1)**2))*hw));}poly(pts,fill,line);};
  const disc=(S,uc,hc,r,fill)=>{const pts=[];for(let i=0;i<16;i++){const a=i/16*6.283;pts.push(S(uc+Math.cos(a)*r,hc+Math.sin(a)*r));}poly(pts,fill,line);};
  const glass='#8fc0e0',glassR='#7aa8c8';
  const winAt=(S,u,glassC)=>{switch(A.win){
    case 'shutter':rect(S,u,20,u+24,40,glassC);rect(S,u-8,20,u,40,A.shut||'#7a3a2a');rect(S,u+24,20,u+32,40,A.shut||'#7a3a2a');seg(S(u+12,20),S(u+12,40),'#f4ead6',1.5);seg(S(u,30),S(u+24,30),'#f4ead6',1.5);break;
    case 'small':rect(S,u+4,26,u+20,40,glassC);seg(S(u+12,26),S(u+12,40),'#3a2716',1.5);break;
    case 'arch':arch(S,u+12,9,18,36,glassC);seg(S(u+12,18),S(u+12,44),'#f4ead6',1);break;
    case 'tall':arch(S,u+12,8,10,40,glassC);seg(S(u+12,10),S(u+12,48),'#e8dcc0',1);seg(S(u+4,28),S(u+20,28),'#e8dcc0',1);break;
    case 'two':for(const h of [12,42]){arch(S,u+12,7,h,h+12,glassC);}break;
    case 'loft':rect(S,u+4,24,u+22,40,'#6a4420');rect(S,u+6,26,u+20,38,'#e8d07a','#8a6a2a');break;
    case 'diamond':{const c=S(u+12,30),pts=[S(u+12,42),S(u+22,30),S(u+12,18),S(u+2,30)];poly(pts,glassC,line);seg(pts[0],pts[2],'#f4ead6',1);seg(pts[1],pts[3],'#f4ead6',1);break;}
    default:rect(S,u,22,u+26,40,glassC);}};
  for(const u of [24,W-50])if(u>0&&!(A.door==='barn'&&Math.abs(u+12-W/2)<40))winAt(F,u,glass);
  for(const u of [26,D-50])if(u>0)winAt(R,u,glassR);
  const dw=A.door==='double'?22:A.door==='barn'?26:14,dc='#5a3d24';
  if(A.door==='arch')arch(F,W/2,dw,0,28,dc);
  else if(A.door==='barn'){arch(F,W/2,dw,0,26,'#6a4420');seg(F(W/2,0),F(W/2,26+dw),'#3a2410',2);seg(F(W/2-dw,0),F(W/2+dw,20),'#3a2410',1.5);seg(F(W/2+dw,0),F(W/2-dw,20),'#3a2410',1.5);}
  else if(A.door==='double'){rect(F,W/2-dw,0,W/2+dw,34,dc,'#3a2716');seg(F(W/2,0),F(W/2,34),'#3a2716',2);for(const s of [-1,1])seg(F(W/2+s*dw*.5,4),F(W/2+s*dw*.5,30),'#7a5a3a',1);}
  else rect(F,W/2-dw,0,W/2+dw,36,dc,'#3a2716');
  if(A.door!=='barn'){const kn=F(W/2+dw*.55,16);ctx.fillStyle='#e8c25a';ctx.beginPath();ctx.arc(kn.x,kn.y,1.6,0,7);ctx.fill();}
  // roofs
  const rc=b.roof||'#8e3b2e';
  const eT=P2(X0-e,Y0-e,H),eR=P2(X1+e,Y0-e,H),eB=P2(X1+e,Y1+e,H),eL=P2(X0-e,Y1+e,H);
  switch(A.roof){
    case 'gable-x':{const rL=P2(X0-e,Yc,H+RH),rR=P2(X1+e,Yc,H+RH);poly([eT,eR,rR,rL],shade(rc,-40));poly([R(0,H),R(D,H),R(D/2,H+RH)],wr,line);
      poly([eL,eB,rR,rL],rc,shade(rc,-60));ctx.globalAlpha=.25;for(let i=1;i<6;i++){const t=i/6;seg(P2(X0-e,Y1+e-(Y1+e-Yc)*t,H+RH*t),P2(X1+e,Y1+e-(Y1+e-Yc)*t,H+RH*t),shade(rc,-70),1);}ctx.globalAlpha=1;break;}
    case 'gable-y':{const rF=P2(Xc,Y1+e,H+RH),rB=P2(Xc,Y0-e,H+RH);poly([eL,eT,rB,rF],shade(rc,-40));poly([F(0,H),F(W,H),F(W/2,H+RH)],wf,line);
      if(A.rose)disc(F,W/2,H+RH*.38,9,'#c8a0ff'),disc(F,W/2,H+RH*.38,4,'#ffd27a');
      if(A.pediment){ctx.globalAlpha=.6;poly([F(8,H+4),F(W-8,H+4),F(W/2,H+RH-6)],'#f4ecd8','#a89a7a');ctx.globalAlpha=1;}
      poly([eB,eR,rB,rF],shade(rc,-15),shade(rc,-60));break;}
    case 'shed':{const RR=RH;poly([R(0,H),R(D,H),R(D,H+RR)],wr,line);poly([P2(X0-e,Y1+e,H),P2(X1+e,Y1+e,H),P2(X1+e,Y0-e,H+RR),P2(X0-e,Y0-e,H+RR)],shade(rc,-10),shade(rc,-60));
      ctx.globalAlpha=.3;for(let x=X0;x<X1+e;x+=12)seg(P2(x,Y1+e,H),P2(x,Y0-e,H+RR),shade(rc,-70),1);ctx.globalAlpha=1;break;}
    case 'gambrel':{const k=.42,hb=H+RH*.62,yF=Y1+e-(Y1+e-Yc)*k,yB=Y0-e+(Yc-(Y0-e))*k,rL=P2(X0-e,Yc,H+RH),rR=P2(X1+e,Yc,H+RH);
      poly([eT,eR,P2(X1+e,yB,hb),P2(X0-e,yB,hb)],shade(rc,-45));poly([P2(X0-e,yB,hb),P2(X1+e,yB,hb),rR,rL],shade(rc,-35));
      poly([R(0,H),R(D,H),R(D-(Y1+e-yF),hb),R(D/2,H+RH),R(Y1+e-yF,hb)],wr,line);rect(R,D/2-8,H+10,D/2+8,H+26,'#6a4420');
      poly([P2(X0-e,yF,hb),P2(X1+e,yF,hb),rR,rL],shade(rc,-10),shade(rc,-60));poly([eL,eB,P2(X1+e,yF,hb),P2(X0-e,yF,hb)],rc,shade(rc,-60));break;}
    case 'flat':{poly([P2(X0,Y0,H),P2(X1,Y0,H),P2(X1,Y1,H),P2(X0,Y1,H)],shade(rc,-30));
      const ph=9;poly([F(0,H),F(W,H),F(W,H+ph),F(0,H+ph)],wf,line);poly([R(0,H),R(D,H),R(D,H+ph),R(0,H+ph)],wr,line);
      for(let u=0;u<W-6;u+=16)rect(F,u,H+ph,u+9,H+ph+8,wf);for(let u=4;u<D-6;u+=16)rect(R,u,H+ph,u+9,H+ph+8,wr);
      // a little roof door and a flagpole
      const fp=P2(Xc,Yc,H);ctx.fillStyle='#4a3a2a';ctx.fillRect(fp.x-1,fp.y-46,2,46);const wv=Math.sin(now*2)*2;ctx.fillStyle=rc;ctx.beginPath();ctx.moveTo(fp.x+1,fp.y-46);ctx.lineTo(fp.x+22,fp.y-41+wv);ctx.lineTo(fp.x+1,fp.y-34);ctx.closePath();ctx.fill();break;}
    case 'dome':{poly([P2(X0,Y0,H),P2(X1,Y0,H),P2(X1,Y1,H),P2(X0,Y1,H)],'#b8ac90');const c0=P2(Xc,Yc,H),r=Math.min(W,D)*.42;
      // drum, then the dome with a light side, then a lantern on top
      ctx.fillStyle=wr;ctx.strokeStyle=line;ctx.lineWidth=1.2;ctx.beginPath();ctx.ellipse(c0.x,c0.y-12,r,r*.5,0,0,Math.PI);ctx.lineTo(c0.x-r,c0.y-24);ctx.ellipse(c0.x,c0.y-24,r,r*.5,0,Math.PI,0,true);ctx.closePath();ctx.fill();ctx.stroke();
      const g=ctx.createLinearGradient(c0.x-r,0,c0.x+r,0);g.addColorStop(0,shade(rc,40));g.addColorStop(.6,rc);g.addColorStop(1,shade(rc,-40));ctx.fillStyle=g;
      ctx.beginPath();ctx.ellipse(c0.x,c0.y-24,r,r*.5,0,0,Math.PI);ctx.ellipse(c0.x,c0.y-24,r,r*.95,0,Math.PI,0,false);ctx.closePath();ctx.fill();ctx.stroke();
      ctx.globalAlpha=.35;for(const k of [-.5,0,.5]){ctx.beginPath();ctx.ellipse(c0.x+k*r*.2,c0.y-24,Math.abs(r*(1-Math.abs(k))*.9)+1,r*.95,0,Math.PI,0);ctx.strokeStyle=shade(rc,-60);ctx.stroke();}ctx.globalAlpha=1;
      const tp=c0.y-24-r*.95;ctx.fillStyle='#e8dcc0';ctx.fillRect(c0.x-4,tp-10,8,10);ctx.strokeRect(c0.x-4,tp-10,8,10);ctx.fillStyle='#e8c25a';ctx.beginPath();ctx.arc(c0.x,tp-13,3,0,7);ctx.fill();break;}
    default:{ // hip roof (as before)
      const alongX=W>=D,hh=alongX?D/2:W/2,r1=alongX?P2(X0+hh,Yc,H+RH):P2(Xc,Y0+hh,H+RH),r2=alongX?P2(X1-hh,Yc,H+RH):P2(Xc,Y1-hh,H+RH);
      if(alongX){poly([eT,eR,r2,r1],shade(rc,-40));poly([eL,eT,r1],shade(rc,-25));poly([eR,eB,r2],shade(rc,-15));poly([eB,eL,r1,r2],rc,shade(rc,-60));}
      else{poly([eT,eR,r1],shade(rc,-40));poly([eL,eT,r1,r2],shade(rc,-25));poly([eR,eB,r2,r1],shade(rc,-15));poly([eB,eL,r2],rc,shade(rc,-60));}}}
  // a round tower with a cone roof on the front corner
  if(A.tower){const tb=P2(X1-6,Y1-6,0),tt=P2(X1-6,Y1-6,H+26),r=15;ctx.fillStyle=wr;ctx.strokeStyle=line;ctx.lineWidth=1.2;
    ctx.beginPath();ctx.ellipse(tb.x,tb.y,r,r*.5,0,0,Math.PI);ctx.lineTo(tt.x-r,tt.y);ctx.ellipse(tt.x,tt.y,r,r*.5,0,Math.PI,0,true);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.fillStyle=wf;ctx.beginPath();ctx.ellipse(tb.x-r*.35,(tb.y+tt.y)/2,r*.35,(tb.y-tt.y)/2,0,0,7);ctx.globalAlpha=.35;ctx.fill();ctx.globalAlpha=1;
    const wy=(tb.y+tt.y)/2-6;ctx.fillStyle='#8fd0f0';ctx.beginPath();ctx.ellipse(tb.x+2,wy,3,6,0,0,7);ctx.fill();ctx.stroke();
    ctx.fillStyle=rc;ctx.beginPath();ctx.ellipse(tt.x,tt.y,r+3,(r+3)*.5,0,0,Math.PI);ctx.lineTo(tt.x,tt.y-44);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.fillStyle=shade(rc,40);ctx.beginPath();ctx.moveTo(tt.x-r-3,tt.y);ctx.lineTo(tt.x,tt.y-44);ctx.lineTo(tt.x-4,tt.y+(r+3)*.45);ctx.closePath();ctx.globalAlpha=.4;ctx.fill();ctx.globalAlpha=1;
    ctx.fillStyle='#ffd27a';ctx.beginPath();ctx.arc(tt.x,tt.y-47,2.5,0,7);ctx.fill();}
  // the sign board over the door
  const sg=P2(Xc,Y1,Math.min(H,60)-6);ctx.font='700 12px "Alegreya Sans",sans-serif';const tw=ctx.measureText(b.name).width+14;
  ctx.fillStyle='#2b2216';ctx.fillRect(sg.x-tw/2,sg.y-8,tw,18);ctx.strokeStyle='#b8924f';ctx.lineWidth=1;ctx.strokeRect(sg.x-tw/2+.5,sg.y-7.5,tw-1,17);
  ctx.fillStyle='#efe6d2';ctx.textAlign='center';ctx.fillText(b.name,sg.x,sg.y+5);}

// take over the house drawing (js/render.js), keeping the trade dressing from js/buildings.js on top
{const _base=typeof _drawBuildingB==='function'?_drawBuildingB:null;
  drawBuilding=function(b){const A=archiOf(b);if(A){try{drawArchi(b,A);}catch(e){if(_base)_base.apply(this,arguments);}}else if(_base)_base.apply(this,arguments);
    try{dressBuilding(b);}catch(e){}};}
