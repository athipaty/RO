"use strict";
/* ================= every weapon looks like its name =================
   Many weapons shared one drawing per type (27 axes were nearly the same hatchet, most bows differed by a dot). Each
   weapon without its own hand-made art is now drawn from its name:
     shape from the type word   axe: hatchet / cleaver / bearded / great- and war-axe / maw ...  bow: short / long / war
                                (recurve) / horn ...  sword: blade / greatsword / saber / fang ...  dagger, mace, wand alike
     look from the theme word   storm, glacier/frost/rime, quartz/crystal, sun/aurel/dawn, wyrm/pyre/fire/ember,
                                star, tide/kraken/salt/shell, bone/tusk/giant/antler, viper/thorn/needle, gale/wind/
                                griffin, night/shadow/dusk/warlord ...; anything else gets a steady colour from its id
     detail from the level      higher levels get a gem, gold trim and a glow
   Loaded right after icons.js, so the hand-made pictures added later (gearart.js, regions4fx.js, awaken.js) still win. */
{
const WL_THEMES=[
  [/storm|thunder|volt/i,{metal:'#b8d4f0',edge:'#e8f4ff',accent:'#5ab0ff',wood:'#3a4a5e',fx:'bolt'}],
  [/glacier|frost|rime|ice|snow|winter/i,{metal:'#cfeaff',edge:'#ffffff',accent:'#7fd4ff',wood:'#4a6a8a',fx:'shard'}],
  [/quartz|crystal|prism|gem/i,{metal:'#d8c4ff',edge:'#f4ecff',accent:'#b08aff',wood:'#4a3a6a',fx:'facet'}],
  [/sun|aurel|dawn|gold|radiant|solar/i,{metal:'#f4d47a',edge:'#fff4c8',accent:'#e0522a',wood:'#8a2a1a',fx:'rays'}],
  [/wyrm|pyre|fire|flame|ember|cinder|magma|lava|blaze|inferno/i,{metal:'#ff9a4a',edge:'#ffe08a',accent:'#ff4a1a',wood:'#3a1a10',fx:'flame'}],
  [/star|astral|celest|comet|moon/i,{metal:'#a8b8ff',edge:'#f0f4ff',accent:'#ffe27a',wood:'#1e2a5a',fx:'stars'}],
  [/tide|kraken|salt|shell|coral|sea|wave|reef|abyss/i,{metal:'#7fe0d0',edge:'#e0fff8',accent:'#2aa0c8',wood:'#2a4a5a',fx:'wave'}],
  [/bone|tusk|giant|antler|horn|skull|fang/i,{metal:'#efe6cc',edge:'#fffaf0',accent:'#a87a4a',wood:'#6a4a2a',fx:'notch'}],
  [/viper|thorn|needle|venom|serpent|briar|vine/i,{metal:'#9ad86a',edge:'#e4ffc8',accent:'#3f8a2a',wood:'#2f4a1a',fx:'drip'}],
  [/gale|wind|griffin|feather|sky|zephyr|wing/i,{metal:'#dff4ee',edge:'#ffffff',accent:'#5ad0b0',wood:'#6a8a7a',fx:'swirl'}],
  [/night|shadow|dusk|warlord|void|grave|doom|dread/i,{metal:'#7a6a9a',edge:'#c8b8f0',accent:'#d04a6a',wood:'#1a1424',fx:'smoke'}],
  [/troll|ogre|brute|crack|reaver|splitter/i,{metal:'#a8a296',edge:'#e8e2d4',accent:'#8a3a2a',wood:'#4a3020',fx:'notch'}],
];
const PLAIN=[{metal:'#c8ccd4',edge:'#f0f2f6',accent:'#8a9098',wood:'#6b4a2a',fx:''},{metal:'#b8bcc4',edge:'#e8ecf2',accent:'#5a8ad8',wood:'#5a3d24',fx:''},
  {metal:'#d4c8b8',edge:'#f6efe4',accent:'#c8963a',wood:'#4a3020',fx:''},{metal:'#c0c8d0',edge:'#f0f6fa',accent:'#8ac85a',wood:'#3a2a1a',fx:''}];
const hashOf=s=>{let h=2166136261;for(const c of String(s))h=Math.imul(h^c.charCodeAt(0),16777619);return h>>>0;};
function wlLook(id,it){const name=it.name||id;for(const [re,t] of WL_THEMES)if(re.test(name))return {...t,themed:true};return {...PLAIN[hashOf(id)%PLAIN.length],themed:false};}
const fill=(g,c,stroke=true)=>{g.fillStyle=c;g.fill();if(stroke){g.strokeStyle=OL;g.lineWidth=1.5;g.stroke();}};
const poly=(g,pts)=>{g.beginPath();pts.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();};
const shine=(g,pts)=>{g.save();poly(g,pts);g.fillStyle='rgba(255,255,255,.45)';g.fill();g.restore();};
const gemAt=(g,x,y,r,c)=>{g.beginPath();g.arc(x,y,r,0,7);fill(g,c);g.fillStyle='rgba(255,255,255,.7)';g.beginPath();g.arc(x-r*.35,y-r*.35,r*.35,0,7);g.fill();};
// the theme's extra marks, drawn in weapon space (blade up the -y axis)
function wlFx(g,L,y0,y1){const a=L.accent;g.save();g.lineCap='round';g.lineJoin='round';
  switch(L.fx){
    case 'bolt':g.strokeStyle='#fff6a0';g.lineWidth=1.4;g.beginPath();g.moveTo(-1,y0+2);g.lineTo(1.5,(y0+y1)/2-1);g.lineTo(-1.5,(y0+y1)/2+1);g.lineTo(1,y1-2);g.stroke();break;
    case 'shard':g.fillStyle='rgba(255,255,255,.85)';for(const [x,y] of [[-5,y0+3],[5,y0+6]]){poly(g,[[x,y-3],[x+1.4,y],[x,y+3],[x-1.4,y]]);g.fill();}break;
    case 'flame':for(const [x,s] of [[-4.5,1],[4.5,.8],[0,1.2]]){g.fillStyle=a;g.beginPath();g.moveTo(x,y0-1-4*s);g.quadraticCurveTo(x+2.4*s,y0+1,x,y0+3);g.quadraticCurveTo(x-2.4*s,y0+1,x,y0-1-4*s);g.fill();}
      g.fillStyle='#ffe08a';g.beginPath();g.arc(0,y0+1,1.2,0,7);g.fill();break;
    case 'stars':g.fillStyle='#fff6c8';for(const [x,y,r] of [[-4,y0+4,1.1],[3.5,y0+8,.9],[-2,(y0+y1)/2,.8]]){g.beginPath();for(let i=0;i<8;i++){const an=i*Math.PI/4,k=i%2?r*.4:r*2;g.lineTo(x+Math.cos(an)*k,y+Math.sin(an)*k);}g.fill();}break;
    case 'wave':g.strokeStyle='rgba(255,255,255,.8)';g.lineWidth=1.1;g.beginPath();g.moveTo(-3,(y0+y1)/2);g.quadraticCurveTo(-1.5,(y0+y1)/2-2,0,(y0+y1)/2);g.quadraticCurveTo(1.5,(y0+y1)/2+2,3,(y0+y1)/2);g.stroke();break;
    case 'drip':g.fillStyle=a;g.beginPath();g.moveTo(2.5,y1-4);g.quadraticCurveTo(4.6,y1-1,2.5,y1);g.quadraticCurveTo(.4,y1-1,2.5,y1-4);g.fill();break;
    case 'swirl':g.strokeStyle='rgba(255,255,255,.85)';g.lineWidth=1.1;g.beginPath();g.arc(-4.5,y0+5,2.6,-.5,3.6);g.stroke();g.beginPath();g.arc(4.8,y0+9,1.8,2.6,6.6);g.stroke();break;
    case 'smoke':g.fillStyle='rgba(40,20,60,.55)';for(const [x,y,r] of [[-4,y0+2,2.4],[4,y0+5,2],[0,y0-1,1.8]]){g.beginPath();g.arc(x,y,r,0,7);g.fill();}break;
    case 'notch':g.strokeStyle=OL;g.lineWidth=1.1;for(const y of [y0+5,y0+9])if(y<y1){g.beginPath();g.moveTo(2.6,y);g.lineTo(.6,y+1.4);g.stroke();}break;
    case 'facet':g.strokeStyle='rgba(255,255,255,.8)';g.lineWidth=.9;g.beginPath();g.moveTo(0,y0);g.lineTo(0,y1);g.moveTo(-2,y0+5);g.lineTo(0,y0+2);g.lineTo(2,y0+5);g.stroke();break;
    case 'rays':g.strokeStyle='rgba(255,236,160,.9)';g.lineWidth=1;for(let i=0;i<6;i++){const an=i*Math.PI/3;g.beginPath();g.moveTo(Math.cos(an)*3,y0+Math.sin(an)*3);g.lineTo(Math.cos(an)*5.5,y0+Math.sin(an)*5.5);g.stroke();}break;}
  g.restore();}
// ornate hilt for higher levels: gold trim and a gem
function wlWrap(g,L,y0,len,h){const n=h%4;if(!n)return;g.save();g.fillStyle=(h>>3)%2?L.accent:'#2a1c14';
  for(let i=0;i<n;i++){const y=y0+len*(.25+i*.18);g.fillRect(-1.9,y,3.8,1.3);}g.restore();}
const tierOf=it=>(it.lv||1)>=60?3:(it.lv||1)>=30?2:(it.lv||1)>=12?1:0;

/* ---- the shapes (drawn at the icon centre, blade along -y, then rotated) ---- */
function wlAxe(g,L,n,t){const big=/great|war|giant|splitter|maw|kraken/i.test(n),small=/hatchet|hand/i.test(n),cleaver=/cleaver/i.test(n),bearded=/beard/i.test(n),toothy=/maw|kraken|tusk|crack/i.test(n);
  const hl=small?20:big?28:24,top=-hl/2-1,H=hashOf(n);g.beginPath();g.roundRect(-1.6,top,3.2,hl+2,1);fill(g,L.wood);wlWrap(g,L,top+4,hl,H);
  const v=(H>>5)%3; // blade variant: 0 crescent, 1 straighter and taller, 2 with a back spike
  if(t>=1){g.beginPath();g.roundRect(-2.2,top+hl*.62,4.4,2.6,1);fill(g,L.accent);}
  const hy=top+1;
  if(cleaver){poly(g,[[1,hy],[11,hy-1],[12,hy+9],[1,hy+8]]);fill(g,L.metal);shine(g,[[2,hy+1],[10,hy],[10.6,hy+2],[2,hy+3]]);g.beginPath();g.arc(8.5,hy+3,1,0,7);fill(g,OL,false);}
  else if(bearded){g.beginPath();g.moveTo(1,hy);g.quadraticCurveTo(9,hy-1,10,hy+4);g.quadraticCurveTo(10,hy+12,5,hy+15);g.quadraticCurveTo(6,hy+8,1,hy+7);g.closePath();fill(g,L.metal);
    g.strokeStyle=L.edge;g.lineWidth=1.3;g.beginPath();g.moveTo(10,hy+4);g.quadraticCurveTo(10,hy+11,5.5,hy+14);g.stroke();}
  else{const w=(big?12:small?8:10.5)+(v===1?-1.2:0),h=(big?13:small?9:11)+(v===1?2.5:0);
    g.beginPath();g.moveTo(1,hy);g.quadraticCurveTo(w+2,hy-1.5,w,hy+h);g.quadraticCurveTo(w*.55,hy+h*.55,1,hy+h*.6);g.closePath();fill(g,L.metal);
    g.strokeStyle=L.edge;g.lineWidth=1.3;g.beginPath();g.moveTo(w-.3,hy+1);g.quadraticCurveTo(w+1.4,hy+h*.5,w-.3,hy+h-.6);g.stroke();
    if(/waraxe|war axe/i.test(n)){poly(g,[[-1,hy+1],[-8,hy+3.5],[-1,hy+6.5]]);fill(g,L.metal);g.beginPath();g.moveTo(0,top);g.lineTo(-2.4,top-4);g.lineTo(2.4,top-4);g.closePath();fill(g,L.metal);}
    else if(big){g.beginPath();g.moveTo(-1,hy);g.quadraticCurveTo(-w-2,hy-1.5,-w,hy+h);g.quadraticCurveTo(-w*.55,hy+h*.55,-1,hy+h*.6);g.closePath();fill(g,L.metal);
      g.strokeStyle=L.edge;g.lineWidth=1.3;g.beginPath();g.moveTo(-w+.3,hy+1);g.quadraticCurveTo(-w-1.4,hy+h*.5,-w+.3,hy+h-.6);g.stroke();}
    if(v===2&&!big){poly(g,[[-1,hy+1],[-6.5,hy+2.5],[-1,hy+4.5]]);fill(g,L.metal);}
    if(toothy){g.fillStyle=OL;for(let i=0;i<3;i++){const y=hy+2+i*3.2;poly(g,[[w+.6,y],[w-2,y+1.3],[w+.4,y+2.4]]);g.fill();}}}
  if(t>=2)gemAt(g,0,hy+3,1.8,L.accent);
  wlFx(g,L,hy,hy+10);}
function wlSword(g,L,n,t){const great=/great|giant|earth|claymore/i.test(n),curved=/saber|sabre|fang|scim|kraken|wing|katana/i.test(n),wavy=/flame|wyrm|pyre|fire|blaze/i.test(n);
  const len=great?24:20,w=great?3.6:2.6,tip=-len+6;g.beginPath();
  if(curved){g.moveTo(-w,6);g.quadraticCurveTo(-w-1,tip+6,w+2,tip-2);g.quadraticCurveTo(w-.5,tip+8,w,6);g.closePath();}
  else if(wavy){g.moveTo(-w,6);for(let y=6;y>tip+3;y-=4)g.quadraticCurveTo(-w-1.6,y-2,-w,y-4);g.lineTo(0,tip-1);g.lineTo(w,tip+3);for(let y=tip+3;y<6;y+=4)g.quadraticCurveTo(w+1.6,y+2,w,y+4);g.closePath();}
  else{g.moveTo(-w,6);g.lineTo(-w,tip+3);g.lineTo(0,tip-1);g.lineTo(w,tip+3);g.lineTo(w,6);g.closePath();}
  fill(g,L.metal);g.strokeStyle=L.edge;g.lineWidth=1;g.beginPath();g.moveTo(0,tip+3);g.lineTo(0,4);g.stroke();
  const gw=great?9:t>=1?8:6.5;g.beginPath();if(t>=2){g.moveTo(-gw,6);g.quadraticCurveTo(-gw-1,3.5,-gw+1.5,4);g.lineTo(gw-1.5,4);g.quadraticCurveTo(gw+1,3.5,gw,6);g.lineTo(gw-1,8);g.lineTo(-gw+1,8);g.closePath();}else g.roundRect(-gw,5,gw*2,2.8,1);
  fill(g,t>=1?['#e0b84a','#d8a83a','#c8ccd4','#b87a4a'][hashOf(n)%4]:'#8a8f99');g.beginPath();g.roundRect(-1.7,8,3.4,great?7:6,1);fill(g,L.wood);wlWrap(g,L,8,6,hashOf(n)>>2);gemAt(g,0,great?16:15,t>=2?2.2:1.8,t>=1?L.accent:'#b8924f');
  wlFx(g,L,tip+2,3);}
function wlDagger(g,L,n,t){const curved=/kris|fang|curv|claw|hook/i.test(n),thin=/stiletto|needle|pin/i.test(n);const w=thin?1.4:2.2;g.beginPath();
  if(curved){g.moveTo(-w,4);g.quadraticCurveTo(-w-2,-6,2.5,-13);g.quadraticCurveTo(w+.5,-5,w,4);g.closePath();}else{g.moveTo(-w,4);g.lineTo(-w*.8,-9);g.lineTo(0,-13.5);g.lineTo(w*.8,-9);g.lineTo(w,4);g.closePath();}
  fill(g,L.metal);g.strokeStyle=L.edge;g.lineWidth=.9;g.beginPath();g.moveTo(0,-10);g.lineTo(0,2);g.stroke();
  g.beginPath();g.roundRect(-5,4,10,2.4,1);fill(g,t>=1?'#e0b84a':'#7a7090');g.beginPath();g.roundRect(-1.5,6.4,3,6.5,1);fill(g,L.wood);gemAt(g,0,13.6,1.7,L.accent);wlFx(g,L,-11,2);}
function wlMace(g,L,n,t){const hammer=/hammer|maul|mallet/i.test(n),star=/star|morning|spik|thorn|troll/i.test(n),flanged=/flange|bell|dawn|sun|holy/i.test(n);
  g.beginPath();g.roundRect(-1.6,-4,3.2,19,1);fill(g,L.wood);wlWrap(g,L,-1,15,hashOf(n));if(t>=1){g.beginPath();g.roundRect(-2.2,9,4.4,2.4,1);fill(g,L.accent);}
  if(hammer){g.beginPath();g.roundRect(-8,-12,16,8,2);fill(g,L.metal);g.beginPath();g.roundRect(-8,-12,4,8,1.5);fill(g,L.edge);}
  else if(flanged){for(let i=0;i<6;i++){g.save();g.translate(0,-8);g.rotate(i*Math.PI/3);poly(g,[[0,-1.5],[0,-7.5],[2.6,-5.5],[2.6,-1]]);fill(g,L.metal);g.restore();}g.beginPath();g.arc(0,-8,3,0,7);fill(g,L.accent);}
  else{g.beginPath();g.arc(0,-8,6.2,0,7);fill(g,L.metal);
    if(star){for(let i=0;i<8;i++){const a=i*Math.PI/4;poly(g,[[Math.cos(a-.25)*5.6,-8+Math.sin(a-.25)*5.6],[Math.cos(a)*9.2,-8+Math.sin(a)*9.2],[Math.cos(a+.25)*5.6,-8+Math.sin(a+.25)*5.6]]);fill(g,L.edge);}}
    else for(let i=0;i<6;i++){const a=i*Math.PI/3;g.beginPath();g.arc(Math.cos(a)*6.2,-8+Math.sin(a)*6.2,1.6,0,7);fill(g,OL,false);}
    g.fillStyle='rgba(255,255,255,.5)';g.beginPath();g.arc(-2,-10,1.8,0,7);g.fill();}
  if(t>=2)gemAt(g,0,-8,1.6,L.accent);wlFx(g,L,-13,-3);}
function wlWand(g,L,n,t){const staff=/staff|rod|scepter/i.test(n),crystal=/crystal|quartz|prism|glacier|frost|ice/i.test(n),moon=/moon|crescent|night|dusk/i.test(n),star=/star|astral|comet/i.test(n);
  g.beginPath();g.roundRect(-1.5,staff?-6:-4,3,staff?22:18,1.4);fill(g,L.wood);wlWrap(g,L,staff?-2:0,staff?18:14,hashOf(n));
  if(crystal){poly(g,[[0,-17],[4,-10],[0,-4],[-4,-10]]);fill(g,L.metal);shine(g,[[0,-16],[1.6,-10],[0,-7]]);}
  else if(moon){g.beginPath();g.arc(0,-10,6,Math.PI*.15,Math.PI*1.85);g.arc(2.4,-10,4.6,Math.PI*1.75,Math.PI*.25,true);g.closePath();fill(g,L.metal);}
  else if(star){g.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,k=i%2?2.6:6.4;g.lineTo(Math.cos(a)*k,-10+Math.sin(a)*k);}g.closePath();fill(g,L.metal);}
  else{g.beginPath();g.arc(0,-10,5.4,0,7);fill(g,L.metal);g.fillStyle='rgba(255,255,255,.75)';g.beginPath();g.arc(-1.8,-12,1.6,0,7);g.fill();}
  if(staff){g.strokeStyle=t>=1?'#e0b84a':L.wood;g.lineWidth=1.6;g.beginPath();g.moveTo(-2.4,-4);g.quadraticCurveTo(-6.5,-9,-3.6,-15);g.moveTo(2.4,-4);g.quadraticCurveTo(6.5,-9,3.6,-15);g.stroke();}
  if(t>=2){g.strokeStyle=L.accent;g.lineWidth=1.2;g.beginPath();g.arc(0,-10,8.2,-.5,3.6);g.stroke();}wlFx(g,L,-15,-6);}
function wlBow(g,L,n,t){const long=/long|war|great/i.test(n),short=/short|hunter|ash|hand/i.test(n),recurve=/war|gale|wing|griffin|recurve/i.test(n),horn=/horn|antler|tusk|bone/i.test(n);
  // drawn upright (no rotation): limbs arc to the left, the string on the right
  const R=long?15:short?11:13,cx=18-(long?3:1),cy=16,a0=Math.PI*.6,a1=Math.PI*1.4;
  g.lineCap='round';g.strokeStyle=OL;g.lineWidth=5;g.beginPath();g.arc(cx,cy,R,a0,a1);g.stroke();
  g.strokeStyle=horn?L.metal:L.wood;g.lineWidth=3.2;g.beginPath();g.arc(cx,cy,R,a0,a1);g.stroke();
  const p0=[cx+Math.cos(a0)*R,cy+Math.sin(a0)*R],p1=[cx+Math.cos(a1)*R,cy+Math.sin(a1)*R];
  if(recurve){g.strokeStyle=horn?L.metal:L.wood;g.lineWidth=2.6;for(const [p,d] of [[p0,1],[p1,-1]]){g.beginPath();g.moveTo(p[0],p[1]);g.quadraticCurveTo(p[0]+3,p[1]+d*1,p[0]+3.5,p[1]-d*2.5);g.stroke();}}
  if(horn){g.strokeStyle=L.accent;g.lineWidth=1;for(let i=1;i<5;i++){const a=a0+(a1-a0)*i/5;g.beginPath();g.moveTo(cx+Math.cos(a)*(R-1.4),cy+Math.sin(a)*(R-1.4));g.lineTo(cx+Math.cos(a)*(R+1.4),cy+Math.sin(a)*(R+1.4));g.stroke();}}
  g.strokeStyle=/viper|venom/i.test(n)?'#9ad86a':'#f4f0e4';g.lineWidth=1;g.beginPath();g.moveTo(p0[0],p0[1]);g.lineTo(p1[0],p1[1]);g.stroke();
  const gx=cx-R,gy=cy;g.beginPath();g.roundRect(gx-1.6,gy-3,3.2,6,1.2);fill(g,t>=1?'#e0b84a':'#5a3d24');if(t>=2)gemAt(g,gx-.2,gy,1.6,L.accent);
  // an arrow nocked across, tinted with the theme
  g.strokeStyle='#8a6a3a';g.lineWidth=1.2;g.beginPath();g.moveTo(p0[0]+.5,gy);g.lineTo(gx-6,gy);g.stroke();poly(g,[[gx-9,gy],[gx-5.6,gy-1.8],[gx-5.6,gy+1.8]]);fill(g,L.themed?L.accent:'#c8ccd4',false);
  g.save();g.translate(gx+4,gy);g.rotate(-Math.PI/2);wlFx(g,L,-8,-2);g.restore();}

const _drawItemIconWL=drawItemIcon;
drawItemIcon=function(g,id){const it=ITEMS[id];
  if(!it||it.type!=='weapon'||it.radiant||!['axe','sword','dagger','mace','wand','bow'].includes(it.wt))return _drawItemIconWL.apply(this,arguments);
  it.id=id;const L=wlLook(id,it),t=tierOf(it),n=it.name||id;g.save();g.lineJoin='round';g.lineCap='round';
  // a soft glow behind top weapons
  if(t>=3){const gr=g.createRadialGradient(16,16,2,16,16,15);gr.addColorStop(0,L.accent+'66');gr.addColorStop(1,L.accent+'00');g.fillStyle=gr;g.fillRect(0,0,32,32);}
  if(it.wt==='bow')wlBow(g,L,n,t);
  else{g.translate(16,16);g.rotate(-Math.PI/4);({axe:wlAxe,sword:wlSword,dagger:wlDagger,mace:wlMace,wand:wlWand})[it.wt](g,L,n,t);}
  g.restore();};
for(const k in ICON_CACHE)delete ICON_CACHE[k];for(const k in ICON_CANVAS)delete ICON_CANVAS[k];

/* ---- (v1.87.2) the hero holds the same weapon the icon shows ----
   drawWeaponShape (render.js, weaponart.js) draws with the grip at 0,0 and the weapon up -y. Weapons with their own
   hand-made held art in weaponart.js keep it; every other axe, sword, dagger, mace and wand is drawn with the shape
   above, moved so its grip sits in the hand and a little smaller. Bows get limbs in their theme's colours, so the
   bow in the hand and in the shot animation match the icon too. */
const WL_GRIP={sword:n=>/great|giant|earth|claymore/i.test(n)?-12:-11,dagger:()=>-9,mace:()=>-11,
  wand:n=>/staff|rod|scepter/i.test(n)?-12:-10,axe:n=>{const big=/great|war|giant|splitter|maw|kraken/i.test(n),small=/hatchet|hand/i.test(n);return -((small?20:big?28:24)/2-2);}};
const WL_TYPE_ART=new Set(['sword','axe','mace','wand']);
const wlHeldOK=(w,id)=>w&&w.type==='weapon'&&!w.radiant&&WL_GRIP[w.wt]&&!(typeof WA!=='undefined'&&WA[id]&&!WL_TYPE_ART.has(id));
const _drawWeaponShapeWL=drawWeaponShape;
drawWeaponShape=function(w,ang){if(!w)return;const id=typeof waId==='function'?waId(w):'';
  if(!wlHeldOK(w,id))return _drawWeaponShapeWL.apply(this,arguments);
  const L=wlLook(id,w),t=tierOf(w),n=w.name||id;
  ctx.save();ctx.lineJoin='round';ctx.lineCap='round';ctx.scale(.85,.85);ctx.translate(0,WL_GRIP[w.wt](n));
  if(t>=3){const gr=ctx.createRadialGradient(0,-8,1,0,-8,12);gr.addColorStop(0,L.accent+'55');gr.addColorStop(1,L.accent+'00');ctx.fillStyle=gr;ctx.beginPath();ctx.arc(0,-8,12,0,7);ctx.fill();}
  try{({axe:wlAxe,sword:wlSword,dagger:wlDagger,mace:wlMace,wand:wlWand})[w.wt](ctx,L,n,t);}finally{ctx.restore();}};
if(typeof bowLimbsArt==='function'&&typeof WA_BOW!=='undefined'){const _bowLimbsWL=bowLimbsArt;
  bowLimbsArt=function(w){const id=typeof waId==='function'?waId(w):'';
    if(id&&!WA_BOW[id]&&w&&w.wt==='bow'&&!w.radiant){const L=wlLook(id,w),n=w.name||id,t=tierOf(w),horn=/horn|antler|tusk|bone/i.test(n);
      WA_BOW[id]={wood:horn?L.metal:L.wood,grip:t>=1?'#e0b84a':'#5a3a22',tip:L.themed?L.accent:undefined,
        scale:/long|war|great/i.test(n)?1.12:/short|hunter|ash|hand/i.test(n)?.9:1,thick:/long|war|great/i.test(n)?3.4:3,
        thorns:L.fx==='drip'||undefined,feather:L.fx==='swirl'?'#ffffff':undefined,ribbon:t>=3?L.accent:undefined};}
    return _bowLimbsWL.apply(this,arguments);};}
}
