"use strict";
/* ================= the Gunslinger's master callings (v1.43.0) =================
     Sniper      -> Longshot     shots from past the edge of the screen; the further and weaker the target, the harder
     Pyro Gunner -> Blastmaster  cannon blasts and a firestorm that follows you
     Trickshot   -> Desperado    a thousand bullets, and a step no blade can follow
   Four skills each, like the other master callings (js/newjobs3.js), taken through Seer Valen's Trial of Ascension
   (Gunslinger: 40 Ice Imps and 15 Frost Shards). Master callings are sealed for now (JOB3_SEALED in js/jobs3.js);
   these wait with the others. Loaded after js/fightstyle3.js, so the finishers sit next to the other masters. */
const GS4_SKILLS={
  // ---- Longshot
  horizonshot:{name:'Horizon Shot',max:10,col:'#f8f4e0',g:'⌖',sp:l=>26+l*3,cd:2,kind:'target',range:420,
    desc:l=>`A shot from as far as the eye can see: ${520+l*80}% ATK with ${40+l*3}% more critical chance, and double damage to a monster under 30% HP. Never misses.`,
    run:(l,t)=>{const low=t.hp<(t.d.hp||t.hp)*.3;gs3Shot(P,t,'#ffffff',()=>dealPhys(t,(5.2+l*.8)*(low?2:1),{sure:true,critPlus:40+l*3}));}},
  overwatch:{name:'Overwatch',max:10,col:'#e8e0c0',g:'◉',sp:l=>36,cd:40,kind:'self',
    desc:l=>`For 60s: +${l*5}% ATK, +${l*3} HIT and +${l*15}px range with a gun.`,
    run:l=>buff('overwatch','Overwatch',60,{atkpct:l*5,hit:l*3})},
  coldblood:{name:'Cold Blood',max:10,col:'#d8e8f0',g:'❄',...PASSIVE(),desc:l=>`With a gun: +${l*2} CRIT and +${l*4}% critical damage.`},
  skyfallround:{name:'Skyfall Round',max:10,col:'#fff8d0',g:'⇓',sp:l=>44+l*4,cd:6,kind:'area',range:380,radius:130,
    desc:l=>`Fire high into the sky and let it fall: ${330+l*55}% ATK to all within 130px of the spot. Never misses.`,
    run:(l,x,y)=>setTimeout(()=>{if(!P||P.dead)return;fx.push({k:'ring',x,y,r:130,col:'#fff8d0',t0:now,dur:.5});aoe(x,y,130,m=>dealPhys(m,3.3+l*.55,{sure:true}));},350)},
  // ---- Blastmaster
  cannonade:{name:'Cannonade',max:10,col:'#ff8a2a',g:'❂',sp:l=>48+l*4,cd:6,kind:'area',range:300,radius:150,
    desc:l=>`Three cannon blasts on the spot, each ${150+l*25}% ATK (Fire) to all within 150px.`,
    run:(l,x,y)=>{for(let k=0;k<3;k++)setTimeout(()=>{if(!P||P.dead)return;shakeUntil=now+.2;fx.push({k:'ring',x:x+rnd(-30,30),y:y+rnd(-20,20),r:150,col:'#ff8a2a',t0:now,dur:.4});
      aoe(x,y,150,m=>dealPhys(m,(1.5+l*.25)*gs3Hot(),{sure:true,el:'fire'}));},k*300);}},
  firestorm:{name:'Firestorm',max:10,col:'#ff5a1a',g:'☀',sp:l=>40,cd:40,kind:'self',
    desc:l=>`For 20s a storm of fire follows you: every 2s, ${120+l*20}% ATK (Fire) to all within 120px of you.`,
    run:l=>{buff('firestorm','Firestorm',20,{atk:0});for(let k=1;k<=10;k++)setTimeout(()=>{if(!P||P.dead||!P.buffs.firestorm||P.buffs.firestorm.until<now)return;
      fx.push({k:'ring',x:P.x,y:P.y,r:120,col:'#ff6a2a',t0:now,dur:.45});aoe(P.x,P.y,120,m=>dealPhys(m,(1.2+l*.2)*gs3Hot(),{sure:true,el:'fire'}));},k*2000);}},
  demolitions:{name:'Demolitions',max:10,col:'#ffb070',g:'⚒',...PASSIVE(),desc:l=>`With a gun: +${l*3}% ATK and +${l*4} DEF.`},
  dragonround:{name:'Dragon Round',max:10,col:'#ff3a1a',g:'♆',sp:l=>34+l*3,cd:3,kind:'target',range:260,
    desc:l=>`A round with a dragon's temper: it explodes three times, each ${180+l*28}% ATK (Fire) to all within 90px of the target.`,
    run:(l,t)=>gs3Shot(P,t,'#ff6a2a',()=>{const x=t.x,y=t.y;for(let k=0;k<3;k++)setTimeout(()=>{if(!P||P.dead)return;fx.push({k:'flare',x:x+rnd(-14,14),y:y+rnd(-8,8),col:k===1?'#ffd04a':'#ff5a1a',r:44,dur:.3,h:14});
      aoe(x,y,90,m=>dealPhys(m,(1.8+l*.28)*gs3Hot(),{sure:true,el:'fire'}));},k*220);})},
  // ---- Desperado
  curvedbullet:{name:'Curved Bullet',max:10,col:'#9ae8ff',g:'⤻',sp:l=>22+l*2,cd:1.5,kind:'target',range:300,
    desc:l=>`A bullet that bends around anything: ${380+l*55}% ATK plus 2% per AGI, with ${20+l*2}% more critical chance. Never misses.`,
    run:(l,t)=>gs3Shot(P,t,'#d8f8ff',()=>dealPhys(t,3.8+l*.55+S.agi*.02,{sure:true,critPlus:20+l*2}))},
  phantomstep:{name:'Phantom Step',max:10,col:'#c8f4ff',g:'⧗',sp:l=>30,cd:25,kind:'self',
    desc:l=>`For 10s: +${30+l*8} FLEE and +${l*3}% attack speed.`,run:l=>buff('phantomstep','Phantom Step',10,{flee:30+l*8,aspd:l*3})},
  luckyround:{name:'Lucky Round',max:10,col:'#ffe68a',g:'✦',...PASSIVE(),desc:l=>`With a gun: +${l*2} CRIT and ${l*2}% chance to fire twice.`},
  thousandbullets:{name:'Thousand Bullets',max:10,col:'#bff0ff',g:'⁂',sp:l=>50+l*4,cd:8,kind:'self',
    desc:l=>`Empty every gun you own: ${10+l} shots at monsters within 260px, each ${90+l*12}% ATK.`,
    run:l=>{const list=mobs.filter(m=>!m.dead&&Math.hypot(m.x-P.x,m.y-P.y)<=260+m.d.size);if(!list.length)return;const n=10+l;
      for(let k=0;k<n;k++)setTimeout(()=>{if(!P||P.dead)return;const live=list.filter(gs3Live);if(!live.length)return;const m=live[k%live.length];
        gs3Shot(P,m,k%2?'#fff2b0':'#bff0ff',()=>{if(gs3Live(m))dealPhys(m,.9+l*.12);});},k*65);}},
};
Object.assign(SKILLS,GS4_SKILLS);
Object.assign(SKILL_REQ,{overwatch:{horizonshot:1},skyfallround:{coldblood:3},firestorm:{cannonade:3},dragonround:{demolitions:1},phantomstep:{curvedbullet:1},thousandbullets:{luckyround:3}});
Object.assign(SKILL_ELEM,{cannonade:'fire',firestorm:'fire',dragonround:'fire'});
{const _pb4=passiveB;passiveB=function(){const b=_pb4.apply(this,arguments);if(!P||!P.skills)return b;const L=id=>P.skills[id]||0,add=(k,v)=>{if(v)b[k]=(b[k]||0)+v;};
  if(isGun()){add('crit',L('coldblood')*2+L('luckyround')*2);add('critdmg',L('coldblood')*4);add('atkpct',L('demolitions')*3);add('def',L('demolitions')*4);add('dbl',L('luckyround')*2);}
  return b;};}
// Overwatch: shoot further while it lasts
{const _cs4=computeStats;computeStats=function(){const s=_cs4.apply(this,arguments);try{const b=P&&P.buffs&&P.buffs.overwatch,l=P&&P.skills&&P.skills.overwatch||0;
  if(b&&b.until>now&&l&&isGun()&&s.range)s.range+=l*15;}catch(e){}return s;};}

const GS4={
  longshot:{from:'sniper',name:'Longshot',hp:1.4,sp:1.45,aspd:.82,col:'#3a4a30',acc:'#f8f4e0',
    desc:'Shoots from past the edge of sight. The further and weaker the target, the surer the end.',skills:['horizonshot','overwatch','coldblood','skyfallround']},
  blastmaster:{from:'pyrogunner',name:'Blastmaster',hp:1.55,sp:1.4,aspd:.84,col:'#4a1a0a',acc:'#ffb040',
    desc:'Gunpowder made into an art. Cannon blasts on whole packs, and a firestorm that walks with it.',skills:['cannonade','firestorm','demolitions','dragonround']},
  desperado:{from:'trickshot',name:'Desperado',hp:1.4,sp:1.35,aspd:.74,col:'#2a2a3a',acc:'#9ae8ff',
    desc:'The last gunslinger standing. A thousand bullets, and a step no blade can follow.',skills:['curvedbullet','phantomstep','luckyround','thousandbullets']}};
for(const id in GS4){const j=GS4[id],p=CLASSES[j.from],b=CLASSES[p.base];JOB3[id]=j;
  CLASSES[id]={name:j.name,hp:j.hp,sp:j.sp,aspd:j.aspd,weapons:b.weapons,col:j.col,hair:b.hair,magic:b.magic,base:p.base,parent:j.from,tier:3,acc:j.acc,
    desc:j.desc,own:j.skills,skills:[...p.skills.filter(s=>s!=='firstaid'),...j.skills,'firstaid']};}
// Seer Valen's Trial of Ascension for a Gunslinger's line
TRIALS3.gunslinger={mob:'iceimp',need:40,item:'shard',items:15};

// ---- how they look and strike ----
const SKILL_FX_GS4={
  horizonshot:(l,t)=>{fxF({k:'reticle',x:t.x,y:t.y,col:'#ffffff',dur:.5,h:fxSz(t)+8});fxF({k:'flare',x:P.x,y:P.y,o:P,col:'#f8f4e0',r:34,dur:.25,h:18});fxF({k:'spikes',x:t.x,y:t.y,col:'#f8f4e0',dur:.35,h:fxSz(t),t0:now+.2});},
  overwatch:l=>{fxF({k:'halo',x:P.x,y:P.y,o:P,col:'#e8e0c0',dur:1.4});fxF({k:'rune',x:P.x,y:P.y,o:P,col:'#f8f4e0',g:'◉',r:40,dur:1.2});},
  skyfallround:(l,x,y)=>{fxF({k:'streak',x0:P.x,y0:P.y-10,x:P.x+6,y:P.y-200,col:'#fff8d0',w:5,dur:.2});fxF({k:'streak',x0:x,y0:y-220,x,y,col:'#ffffff',w:8,dur:.25,t0:now+.3});
    fxF({k:'quake',x,y,r:130,col:'#4a4a30',glow:'#fff8d0',dur:.6,t0:now+.35});},
  cannonade:(l,x,y)=>{fxF({k:'quake',x,y,r:150,col:'#3a1a0a',glow:'#ff8a2a',dur:1});fxF({k:'motes',x,y,col:'#ffb040',col2:'#ff3a1a',n:26,r:130,dur:1.2});},
  firestorm:l=>{fxF({k:'vortex',x:P.x,y:P.y,o:P,col:'#ff5a1a',col2:'#3a1a0a',r:60,imp:true,dur:.8});fxF({k:'motes',x:P.x,y:P.y,o:P,col:'#ffb040',col2:'#ff3a1a',orbit:true,n:20,r:50,dur:2});},
  dragonround:(l,t)=>{fxF({k:'claws',x:t.x,y:t.y,ang:.3,r:34,col:'#ff5a1a',dur:.35,h:fxSz(t),t0:now+.15});},
  curvedbullet:(l,t)=>{fxF({k:'chain',x:t.x,y:t.y,pts:[{x:P.x,y:P.y,h:18},{x:(P.x+t.x)/2+30,y:(P.y+t.y)/2-50,h:24},{x:t.x,y:t.y,h:fxSz(t)}],col:'#9ae8ff',dur:.35});fxF({k:'spikes',x:t.x,y:t.y,col:'#d8f8ff',dur:.3,h:fxSz(t),t0:now+.2});},
  phantomstep:l=>{fxF({k:'halo',x:P.x,y:P.y,o:P,col:'#c8f4ff',dur:1});for(let i=0;i<3;i++)fxF({k:'streak',x0:P.x-20-i*14,y0:P.y+i*4,x:P.x,y:P.y,col:'#c8f4ff',w:6,dur:.3,t0:now+i*.05});},
  thousandbullets:l=>{fxF({k:'crescent',x:P.x,y:P.y,ang:0,r:60,w:10,col:'#bff0ff',dur:.6,h:14});fxF({k:'motes',x:P.x,y:P.y,o:P,col:'#fff2b0',col2:'#bff0ff',n:24,r:60,dur:1.2});for(let i=0;i<6;i++){const a=i*Math.PI/3;fxF({k:'streak',x0:P.x,y0:P.y,x:P.x+Math.cos(a)*70,y:P.y+Math.sin(a)*40,col:'#fff2b0',w:4,dur:.22,t0:now+i*.06});}},
};
if(typeof SKILL_FX!=='undefined')for(const id in SKILL_FX_GS4){const sk=SKILLS[id];if(!sk||!sk.run||SKILL_FX[id])continue;SKILL_FX[id]=SKILL_FX_GS4[id];const run=sk.run,fxf=SKILL_FX_GS4[id];
  sk.run=function(){try{fxf.apply(this,arguments);}catch(e){}return run.apply(this,arguments);};}
// outfits: the coat of the calling below, in richer colours, with a master's trim
if(typeof JOB_LOOK!=='undefined')Object.assign(JOB_LOOK,{
  longshot:{s:[['sparks',{c:'#f8f4e0'}]],b:[['cape',{c:'#3a4a30',t:'#f8f4e0',long:1}]]},
  blastmaster:{s:[['sparks',{c:'#ffb040'}]],b:[['cape',{c:'#4a1a0a',t:'#ffb040',long:1}]]},
  desperado:{s:[['sparks',{c:'#9ae8ff'}]],b:[['cape',{c:'#2a2a3a',t:'#9ae8ff',long:1}]]}});
if(typeof HERO2_DRESS!=='undefined'&&HERO2_DRESS.gunslinger)Object.assign(HERO2_DRESS,{
  longshot:{...HERO2_DRESS.gunslinger,trim:'#f8f4e0',pant:'#30382a'},blastmaster:{...HERO2_DRESS.gunslinger,trim:'#ffb040',pant:'#2e1a14'},desperado:{...HERO2_DRESS.gunslinger,trim:'#9ae8ff',pant:'#20202c'}});
if(typeof CAST_COL!=='undefined')Object.assign(CAST_COL,{longshot:'#f8f4e0',blastmaster:'#ffb040',desperado:'#9ae8ff'});
if(typeof SIT_POSE!=='undefined'&&SIT_POSE.sniper)Object.assign(SIT_POSE,{longshot:{...SIT_POSE.sniper,master:true},desperado:{...(SIT_POSE.trickshot||SIT_POSE.gunslinger),master:true},blastmaster:{...SIT_POSE.gunslinger,master:true}});
// cast circle, master ring and finisher, beside the other master callings (js/fightstyle3.js)
if(typeof FS_STYLES!=='undefined'&&FS_STYLES.gunslinger){const G=FS_STYLES.gunslinger;
  FS_STYLES.longshot={...G,cast:['reticle','#f8f4e0'],ring:'tick',fin:{n:'Over the Horizon',f:t=>{if(typeof hitStop==='function')hitStop(.16);
    fxF({k:'reticle',x:t.x,y:t.y,col:'#ffffff',dur:.6,h:fsH(t)+10});fxF({k:'streak',x0:t.x-260,y0:t.y-40,x:t.x,y:t.y,col:'#ffffff',w:7,dur:.2,t0:now+.35});fxF({k:'flare',x:t.x,y:t.y,col:'#f8f4e0',r:70,dur:.35,t0:now+.45,h:fsH(t)});}}};
  FS_STYLES.blastmaster={...G,cast:['flame','#ffb040'],ring:'spike',fin:{n:'Big Bang',f:t=>{if(typeof hitStop==='function')hitStop(.14);shakeUntil=now+.4;
    fxF({k:'flare',x:t.x,y:t.y,col:'#ffd04a',r:110,dur:.45,h:fsH(t)});fxF({k:'quake',x:t.x,y:t.y,r:120,col:'#3a1a0a',glow:'#ff8a2a',dur:.8,t0:now+.1});fxF({k:'motes',x:t.x,y:t.y,col:'#ffb040',col2:'#ff3a1a',n:26,r:80,dur:1.1,t0:now+.15});}}};
  FS_STYLES.desperado={...G,cast:['sparks','#9ae8ff'],ring:'star',fin:{n:'Last Man Standing',f:t=>{if(typeof hitStop==='function')hitStop(.12);
    for(let i=0;i<12;i++){const a=i*Math.PI/6;fxF({k:'streak',x0:t.x+Math.cos(a)*80,y0:t.y+Math.sin(a)*40,x:t.x,y:t.y,col:i%2?'#9ae8ff':'#fff2b0',w:4,dur:.18,t0:now+i*.04});}
    fxF({k:'motes',x:t.x,y:t.y,col:'#c8f4ff',col2:'#ffffff',shape:'star',n:18,r:46,dur:1,t0:now+.5});}}};
  for(const id of ['longshot','blastmaster','desperado'])if(!FS_STYLES[id].melee&&typeof FS_HIT!=='undefined')FS_STYLES[id].melee=FS_HIT.slash(FS_STYLES[id].cast[1]);}

if(typeof TH!=='undefined'){Object.assign(TH,{'Longshot':'ลองช็อต','Blastmaster':'บลาสต์มาสเตอร์','Desperado':'เดสเปราโด',
  'Shoots from past the edge of sight. The further and weaker the target, the surer the end.':'ยิงจากไกลเกินสายตา ยิ่งเป้าหมายไกลและอ่อนแรงเท่าไร จุดจบก็ยิ่งแน่นอน',
  'Gunpowder made into an art. Cannon blasts on whole packs, and a firestorm that walks with it.':'ดินปืนที่กลายเป็นศิลปะ ปืนใหญ่ถล่มมอนสเตอร์ทั้งฝูง และพายุเพลิงที่เดินตามไปด้วย',
  'The last gunslinger standing. A thousand bullets, and a step no blade can follow.':'มือปืนคนสุดท้ายที่ยังยืนอยู่ กระสุนนับพันนัด และฝีเท้าที่ไม่มีคมดาบใดตามทัน'});
  for(const [n,th] of [['Over the Horizon','เหนือเส้นขอบฟ้า'],['Big Bang','บิ๊กแบง'],['Last Man Standing','คนสุดท้ายที่ยืนหยัด'],
    ['One Shot, One Kill','นัดเดียวปลิดชีพ'],['Inferno Salvo','ห่ากระสุนนรก'],['Six-Gun Waltz','วอลซ์หกนัด']]){TH[n]=th;TH[n+'!']=th+'!';}}

/* Build guide: three Gunslinger builds, each running first job -> advanced -> master calling (the old 'quickshot' id is kept
   for heroes already following it; it becomes the Trickshot/Desperado route). */
if(typeof BUILDS!=='undefined'){
  const GSB=[
    {id:'deadeye',job:'gunslinger',name:'Deadeye',th:'ตาเหยี่ยว',tag:'DEX/LUK one-shot',route:['gunslinger','sniper','longshot'],stats:{dex:5,luk:2,agi:2},
      desc:'Shoots from far away and rarely needs a second shot; Kill Shot and Horizon Shot grow with DEX, Cold Blood makes every crit hurt.',
      skills:[['piercinground',10],['steadyaim',10],['quickdraw',5],['flareround',5],['killshot',10],['eaglesight',10],['holdbreath',5],['railshot',10],['pinningshot',3],['horizonshot',10],['coldblood',10],['overwatch',5],['skyfallround',5]],
      gear:['longrifle','quickgrip'],sigils:['hopper','greylupe','lupealpha'],awaken:['atkpct','critdmg']},
    {id:'firebrand',job:'gunslinger',name:'Firebrand',th:'มือเพลิง',tag:'DEX/VIT fire',route:['gunslinger','pyrogunner','blastmaster'],stats:{dex:4,vit:3,agi:2},
      desc:'Sets whole packs on fire; Scatter Shot and Napalm Shell burn crowds, Firestorm and Cannonade finish them.',
      skills:[['scattershot',10],['flareround',10],['quickdraw',5],['flashbang',5],['incendiary',10],['hotloads',10],['napalm',10],['powderkeg',5],['blazingbarrels',5],['firestorm',10],['cannonade',10],['demolitions',5],['dragonround',5]],
      gear:['longrifle','carapacemail'],sigils:['emberimp','cactoid','dunetyrant'],awaken:['atkpct','aspd']}];
  const qs=BUILDS.find(b=>b.id==='quickshot');
  if(qs)Object.assign(qs,{route:['gunslinger','trickshot','desperado'],tag:'DEX/AGI rapid fire',stats:{dex:4,agi:4,luk:1},
    desc:'Fans the hammer for two shots at a time; as a Trickshot, bullets bounce between monsters, then Thousand Bullets empties every barrel.',
    skills:[['quickdraw',10],['fanning',10],['steadyaim',5],['scattershot',5],['flashbang',3],['ricochet',10],['quickhands',10],['bulletstorm',10],['gunkata',5],['wallshot',5],['curvedbullet',10],['phantomstep',10],['luckyround',5],['thousandbullets',5]],
    gear:['pistol','windscarf','quickgrip']});
  const at=BUILDS.indexOf(qs);
  for(const b of GSB)if(!BUILDS.some(x=>x.id===b.id))BUILDS.splice(at>=0?at:BUILDS.length,0,b);
  if(typeof pathPlanBuild==='function')for(const b of BUILDS)if(b.job==='gunslinger')pathPlanBuild(b);}
