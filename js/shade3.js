"use strict";
/* ================= the Shade's master callings (v1.43.0) =================
     Nightblade -> Soulreaper     marks a life, then takes it; the weaker the target, the surer the cut
     Venomancer -> Plaguelord     a plague that spreads from monster to monster and blooms when they fall
     Phantom    -> Umbral Dancer  a thousand cuts and a veil no blow can find
   Four skills each, like the other master callings (js/newjobs3.js), through Seer Valen's Trial of Ascension
   (Shade: 40 Deepshades and 15 Shade Veils). Master callings are sealed for now (JOB3_SEALED in js/jobs3.js); these
   wait with the others. Loaded after js/shade2fx.js. */
const SH3_SKILLS={
  // ---- Soulreaper
  deathmark:{name:'Death Mark',max:10,col:'#ff2a4a',g:'☩',sp:l=>22+l*2,cd:1.5,kind:'target',range:60,
    desc:l=>`Carve a death mark: ${567+l*89}% ATK with ${30+l*3}% more critical chance. Never misses.`,
    run:(l,t)=>dealPhys(t,5.67+l*.89,{sure:true,critPlus:30+l*3})},
  reapersharvest:{name:"Reaper's Harvest",max:10,col:'#c83a5a',g:'☾',sp:l=>40+l*4,cd:5,kind:'self',
    desc:l=>`One sweep of the scythe: ${410+l*68}% ATK to all within 120px, and you heal ${l*2}% of your Max HP for each monster cut.`,
    run:l=>{let n=0;aoe(P.x,P.y,120,m=>{n++;dealPhys(m,4.1+l*.68,{sure:true});});if(n)healP(S.maxhp*l*.02*n);}},
  assassinsedge:{name:"Assassin's Edge",max:10,col:'#ffb0c0',g:'⚔',...PASSIVE(),desc:l=>`With a dagger: +${l*4} ATK, +${l*2}% ATK and +${l*3} CRIT.`},
  shadowexecute:{name:'Shadow Execution',max:10,col:'#ff5a7a',g:'✝',sp:l=>34+l*3,cd:3,kind:'target',range:60,
    desc:l=>`End it: ${480+l*68}% ATK, or ${960+l*136}% ATK to a monster under 40% HP. Never misses.`,
    run:(l,t)=>{const low=t.hp<(t.d.hp||t.hp)*.4;dealPhys(t,low?9.6+l*1.36:4.8+l*.68,{sure:true});}},
  // ---- Plaguelord
  deathbloom:{name:'Death Bloom',max:10,col:'#b8ff5a',g:'❀',sp:l=>24+l*2,cd:1.5,kind:'target',range:60,
    desc:l=>`A blooming wound: ${369+l*55}% ATK (Earth), then poison for ${55+l*8}% ATK every second for 5s.`,
    run:(l,t)=>{dealPhys(t,(3.69+l*.55)*sh2Tox(),{sure:true,el:'earth'});sh2Poison(t,.55+l*.08,5);}},
  pestilence:{name:'Pestilence',max:10,col:'#8ad84a',g:'☣',sp:l=>44+l*4,cd:6,kind:'area',range:220,radius:140,
    desc:l=>`Release a plague on the spot: every monster within 140px is poisoned for ${110+l*18}% ATK every second for 6s.`,
    run:(l,x,y)=>aoe(x,y,140,m=>sh2Poison(m,1.1+l*.18,6))},
  virulence:{name:'Virulence',max:10,col:'#d0f0a0',g:'⚗',...PASSIVE(),desc:l=>`+${l*4}% ATK and +${l*4} HIT.`},
  blightnova:{name:'Blight Nova',max:10,col:'#c8ff70',g:'✺',sp:l=>40+l*4,cd:5,kind:'self',
    desc:l=>`The plague bursts out of you: ${423+l*68}% ATK (Earth) to all within 130px, and they are slowed for 3s.`,
    run:l=>aoe(P.x,P.y,130,m=>{dealPhys(m,(4.23+l*.68)*sh2Tox(),{sure:true,el:'earth'});if(!m.dead)slowMob(m,3);})},
  // ---- Umbral Dancer
  thousandcuts:{name:'Thousand Cuts',max:10,col:'#c8b8ff',g:'⫻',sp:l=>30+l*3,cd:3,kind:'target',range:60,
    desc:l=>`Eight cuts in a heartbeat, each ${58+l*9}% ATK plus 1% per AGI. Never misses.`,
    run:(l,t)=>{const m=.58+l*.09+S.agi*.01;for(let k=0;k<8;k++)setTimeout(()=>{if(P&&!P.dead&&t&&!t.dead&&mobs.includes(t)){fx.push({k:'ring',x:t.x,y:t.y,r:16+k*2,col:'#c8b8ff',t0:now,dur:.2});dealPhys(t,m,{sure:true});}},k*70);}},
  eclipseveil:{name:'Eclipse Veil',max:10,col:'#9a8ad8',g:'◐',sp:l=>34,cd:30,kind:'self',
    desc:l=>`For 12s: +${40+l*8} FLEE and take ${l*3}% less damage.`,run:l=>buff('eclipseveil','Eclipse Veil',12,{flee:40+l*8,dmgred:l*3})},
  nightwaltz:{name:'Night Waltz',max:10,col:'#b8b0f0',g:'∿',...PASSIVE(),desc:l=>`+${l*2} FLEE and +${l*3}% attack speed.`},
  shadowtempest:{name:'Shadow Tempest',max:10,col:'#8a7aff',g:'❖',sp:l=>46+l*4,cd:6,kind:'self',
    desc:l=>`Three waves of shadow blades, each ${160+l*25}% ATK to all within 140px.`,
    run:l=>{for(let k=0;k<3;k++)setTimeout(()=>{if(!P||P.dead)return;fx.push({k:'ring',x:P.x,y:P.y,r:140,col:'#8a7aff',t0:now,dur:.35});aoe(P.x,P.y,140,m=>dealPhys(m,1.6+l*.25,{sure:true}));},k*280);}},
};
Object.assign(SKILLS,SH3_SKILLS);
Object.assign(SKILL_REQ,{reapersharvest:{deathmark:3},shadowexecute:{assassinsedge:1},pestilence:{deathbloom:3},blightnova:{virulence:1},eclipseveil:{thousandcuts:1},shadowtempest:{nightwaltz:3}});
Object.assign(SKILL_ELEM,{deathbloom:'earth',blightnova:'earth'});
PASSIVE_MORE.push((add,L,wt)=>{if(wt==='dagger'){add('atk',L('assassinsedge')*4);add('atkpct',L('assassinsedge')*2);add('crit',L('assassinsedge')*3);}
  add('atkpct',L('virulence')*4);add('hit',L('virulence')*4);add('flee',L('nightwaltz')*2);add('aspd',L('nightwaltz')*3);});

const SH3={
  soulreaper:{from:'nightblade',name:'Soulreaper',hp:1.45,sp:1.35,aspd:.66,col:'#1a1018',acc:'#ff2a4a',
    desc:'Marks a life, then takes it. The weaker the target, the surer the cut, and every sweep feeds it.',skills:['deathmark','reapersharvest','assassinsedge','shadowexecute']},
  plaguelord:{from:'venomancer',name:'Plaguelord',hp:1.5,sp:1.45,aspd:.7,col:'#24301a',acc:'#b8ff5a',
    desc:'A walking plague. Whole packs sicken at once, and the blight bursts out of it when it is cornered.',skills:['deathbloom','pestilence','virulence','blightnova']},
  umbraldancer:{from:'phantom',name:'Umbral Dancer',hp:1.45,sp:1.4,aspd:.62,col:'#24203a',acc:'#c8b8ff',
    desc:'Dances where the light ends. A thousand cuts in a heartbeat, and a veil no blow can find.',skills:['thousandcuts','eclipseveil','nightwaltz','shadowtempest']}};
for(const id in SH3){const j=SH3[id],p=CLASSES[j.from],b=CLASSES[p.base];JOB3[id]=j;
  CLASSES[id]={name:j.name,hp:j.hp,sp:j.sp,aspd:j.aspd,weapons:b.weapons,col:j.col,hair:b.hair,magic:b.magic,base:p.base,parent:j.from,tier:3,acc:j.acc,
    desc:j.desc,own:j.skills,skills:[...p.skills.filter(s=>s!=='firstaid'),...j.skills,'firstaid']};}
// Seer Valen's Trial of Ascension for a Shade's line
TRIALS3.shade={mob:'deepshade',need:40,item:'shadeveil',items:15};

// ---- how they look and strike ----
const SKILL_FX_SH3={
  deathmark:(l,t)=>{fxF({k:'rune',x:t.x,y:t.y,col:'#ff2a4a',g:'☩',r:30,dur:.8});fxF({k:'crescent',x:t.x,y:t.y,ang:.5,r:36,w:14,col:'#ff2a4a',dur:.3,h:fxSz(t),t0:now+.08});},
  reapersharvest:l=>{fxF({k:'crescent',x:P.x,y:P.y,ang:0,r:70,w:16,col:'#c83a5a',dur:.4,h:14});fxF({k:'motes',x:P.x,y:P.y,o:P,col:'#ff5a7a',col2:'#2a1018',n:18,r:60,dur:1});},
  shadowexecute:(l,t)=>{fxF({k:'streak',x0:t.x,y0:t.y-80,x:t.x,y:t.y,col:'#ff5a7a',w:12,dur:.2});fxF({k:'flare',x:t.x,y:t.y,col:'#ff2a4a',r:50,dur:.3,h:fxSz(t),t0:now+.15});fxF({k:'spikes',x:t.x,y:t.y,col:'#ffd0e0',dur:.35,h:fxSz(t),t0:now+.15});},
  deathbloom:(l,t)=>{fxF({k:'claws',x:t.x,y:t.y,ang:.4,r:30,col:'#b8ff5a',dur:.3,h:fxSz(t)});fxF({k:'motes',x:t.x,y:t.y,col:'#b8ff5a',col2:'#3a5a1a',shape:'star',n:14,r:30,dur:1});},
  pestilence:(l,x,y)=>{fxF({k:'vortex',x,y,col:'#8ad84a',col2:'#1a2a0a',r:140,dur:1.4});fxF({k:'motes',x,y,col:'#b8ff5a',col2:'#5a7a2a',n:30,r:130,dur:5});fxF({k:'rune',x,y,col:'#8ad84a',r:90,dur:1.2});},
  blightnova:l=>{fxF({k:'flare',x:P.x,y:P.y,col:'#c8ff70',r:130,dur:.45,h:8});fxF({k:'quake',x:P.x,y:P.y,r:130,col:'#2a3a1a',glow:'#c8ff70',dur:.7});},
  thousandcuts:(l,t)=>{for(let i=0;i<4;i++)fxF({k:'crescent',x:t.x,y:t.y,ang:i*1.6,r:28,col:i%2?'#c8b8ff':'#ffffff',dur:.18,h:fxSz(t),t0:now+i*.14});},
  eclipseveil:l=>{fxF({k:'dome',x:P.x,y:P.y,o:P,col:'#9a8ad8',r:34,dur:1.2});fxF({k:'halo',x:P.x,y:P.y,o:P,col:'#1a1428',dur:1.2});fxF({k:'motes',x:P.x,y:P.y,o:P,col:'#3a2a5a',col2:'#9a8ad8',n:12,r:30,dur:1.2});},
  shadowtempest:l=>{fxF({k:'vortex',x:P.x,y:P.y,o:P,col:'#8a7aff',col2:'#14102a',r:140,dur:1});fxF({k:'icicles',x:P.x,y:P.y,col:'#c8b8ff',r:140,n:14,dur:.8});},
};
if(typeof SKILL_FX!=='undefined')for(const id in SKILL_FX_SH3){const sk=SKILLS[id];if(!sk||!sk.run||SKILL_FX[id])continue;SKILL_FX[id]=SKILL_FX_SH3[id];const run=sk.run,fxf=SKILL_FX_SH3[id];
  sk.run=function(){try{fxf.apply(this,arguments);}catch(e){}return run.apply(this,arguments);};}
if(typeof JOB_LOOK!=='undefined')Object.assign(JOB_LOOK,{
  soulreaper:{s:[['spikes',{c:'#1a1018',t:'#ff2a4a'}]],b:[['cape',{c:'#1a1018',t:'#ff2a4a',long:1}]]},
  plaguelord:{s:[['orb',{c:'#24301a',t:'#b8ff5a'}]],b:[['cape',{c:'#24301a',t:'#b8ff5a',long:1}]]},
  umbraldancer:{s:[['sparks',{c:'#c8b8ff'}]],b:[['cape',{c:'#24203a',t:'#c8b8ff',long:1}]]}});
if(typeof CAST_COL!=='undefined')Object.assign(CAST_COL,{soulreaper:'#ff2a4a',plaguelord:'#b8ff5a',umbraldancer:'#c8b8ff'});
if(typeof SIT_POSE!=='undefined')for(const [m,p] of [['soulreaper','nightblade'],['plaguelord','venomancer'],['umbraldancer','phantom']])if(SIT_POSE[p])SIT_POSE[m]={...SIT_POSE[p],master:true};
// cast circle, master ring and finisher (js/fightstyle3.js)
if(typeof FS_STYLES!=='undefined'&&FS_STYLES.nightblade){
  FS_STYLES.soulreaper={...FS_STYLES.nightblade,cast:['eyes','#ff2a4a'],ring:'dark',fin:{n:'Soul Harvest',f:t=>{if(typeof hitStop==='function')hitStop(.16);
    fxF({k:'crescent',x:t.x,y:t.y,ang:.2,r:56,w:18,col:'#ff2a4a',dur:.4,h:fsH(t)});fxF({k:'motes',x:t.x,y:t.y,col:'#ff5a7a',col2:'#1a1018',n:20,r:50,dur:1,t0:now+.25});}}};
  FS_STYLES.plaguelord={...FS_STYLES.venomancer,cast:['flame','#b8ff5a'],ring:'fang',fin:{n:'Black Plague',f:t=>{if(typeof hitStop==='function')hitStop(.12);
    fxF({k:'vortex',x:t.x,y:t.y,col:'#b8ff5a',col2:'#0a1a04',r:70,imp:true,dur:.8});fxF({k:'flare',x:t.x,y:t.y,col:'#c8ff70',r:60,dur:.35,t0:now+.45,h:fsH(t)});}}};
  FS_STYLES.umbraldancer={...FS_STYLES.phantom,cast:['sparks','#c8b8ff'],ring:'petal',fin:{n:'Eclipse Dance',f:t=>{if(typeof hitStop==='function')hitStop(.12);
    for(let i=0;i<8;i++)fxF({k:'crescent',x:t.x,y:t.y,ang:i*.8,r:34,col:i%2?'#c8b8ff':'#1a1428',dur:.18,h:fsH(t),t0:now+i*.05});fxF({k:'halo',x:t.x,y:t.y,col:'#c8b8ff',dur:.6,t0:now+.4});}}};}

if(typeof TH!=='undefined'){Object.assign(TH,{'Soulreaper':'โซลรีปเปอร์','Plaguelord':'จ้าวโรคระบาด','Umbral Dancer':'นักเต้นแห่งเงา',
  'Marks a life, then takes it. The weaker the target, the surer the cut, and every sweep feeds it.':'ประทับตราชีวิตแล้วพรากมันไป ยิ่งเป้าหมายอ่อนแรง คมมีดยิ่งแน่นอน และทุกการกวาดฟันหล่อเลี้ยงร่างกาย',
  'A walking plague. Whole packs sicken at once, and the blight bursts out of it when it is cornered.':'โรคระบาดที่เดินได้ มอนสเตอร์ทั้งฝูงล้มป่วยพร้อมกัน และพิษจะระเบิดออกมาเมื่อถูกต้อนจนมุม',
  'Dances where the light ends. A thousand cuts in a heartbeat, and a veil no blow can find.':'ร่ายรำ ณ จุดที่แสงสิ้นสุด พันบาดแผลในชั่วพริบตา และม่านเงาที่ไม่มีการโจมตีใดหาเจอ'});
  for(const [n,th] of [['Soul Harvest','เก็บเกี่ยววิญญาณ'],['Black Plague','กาฬโรค'],['Eclipse Dance','ระบำสุริยคราส']]){TH[n]=th;TH[n+'!']=th+'!';}}

/* Build guide: the Shade builds go on to their master callings. */
if(typeof BUILDS!=='undefined')for(const [id,master,more] of [
  ['duskblade','soulreaper',[['deathmark',10],['assassinsedge',10],['reapersharvest',5],['shadowexecute',5]]],
  ['venomist','plaguelord',[['virulence',10],['pestilence',10],['deathbloom',5],['blightnova',5]]],
  ['mirage','umbraldancer',[['eclipseveil',10],['thousandcuts',10],['nightwaltz',5],['shadowtempest',5]]]]){
  const b=BUILDS.find(x=>x.id===id);if(!b||b.route.includes(master))continue;
  b.route.push(master);b.skills.push(...more);}
