"use strict";
/* ================= the three new regions and the Barrow Deeps: boss skills, land, album, blurbs (v1.74.0, see js/regions6.js) ================= */
// ---- the bosses' own skills ----
if(typeof BOSS_SIG!=='undefined'){const around=(rng,x,y,r)=>{const a=rng()*6.283,d=r*(.4+.6*rng());return [x+Math.cos(a)*d,y+Math.sin(a)*d*.6];};
  Object.assign(BOSS_SIG,{
    rustforeman:{name:'Rockfall',desc:'he strikes the quarry wall: rocks fall on you and around you, and the biggest stuns',
      run:(m,x,y,rng)=>{bsMark(m,x,y,75,1.1,m=>{bsHurt(m,1.4);bsCurse('stun',1,m);});for(let i=0;i<3;i++){const [a,b]=around(rng,x,y,150);bsMark(m,a,b,55,1.3+i*.15,m=>bsHurt(m,1.1));}}},
    barrowqueen:{name:'Barrow Wail',desc:'her wail silences everyone near her, and the ground round her turns cold',
      run:m=>{bsMark(m,m.x,m.y,220,1,m=>{bsHurt(m,.8);bsCurse('silence',3,m);});bsZone(m,m.x,m.y,140,4,'#7a6a9a',m=>bsHurt(m,.3));}},
    paleregent:{name:'Soul Harvest',desc:'pale circles mark you and the ground round you; each drains your life and curses you with poison',
      run:(m,x,y,rng)=>{for(let i=0;i<4;i++){const [a,b]=i?around(rng,x,y,170):[x,y];bsMark(m,a,b,65,1.1+i*.15,m=>{bsHurt(m,1.4);bsCurse('poison',5,m);});}}},
    astrael:{name:'Starfall',desc:'stars fall in a line toward you, then a ring of light bursts round her and throws you back',
      run:(m,x,y)=>{const dx=x-m.x,dy=y-m.y,d=Math.hypot(dx,dy)||1;for(let i=1;i<=4;i++){const f=(d+60)*i/4;bsMark(m,m.x+dx/d*f,m.y+dy/d*f,60,.8+i*.2,m=>bsHurt(m,1.3));}
        bsMark(m,m.x,m.y,140,1.8,m=>{bsHurt(m,1.2);bsShove(m,140);});}}});}
// ---- their land: hills, hollows and gullies like every other wild region (js/heights.js) ----
if(typeof LV_DESIGNS!=='undefined')Object.assign(LV_DESIGNS,{
  quarry:{auto:[ // Rustvein Quarry: the Foreman's deep cut, a spoil heap, a flooded pit
    {k:'bowl',name:'The Deep Cut',at:[.68,.4],rx:7,ry:4.5,D:30,style:'stone',den:'rustforeman'},
    {k:'hill',name:'Spoil Heap',at:[.24,.26],rx:6,ry:3.5,H:30,top:.3,style:'stone'},
    {k:'gully',name:'Old Rail Cutting',at:[.3,.74],ax:'x',len:14,wid:2,D:20,style:'stone',dwell:'rustmite'}]},
  moor:{auto:[ // Hollowmoor: the Queen's barrow mound, a gallows hill, a black bog channel
    {k:'hill',name:"Queen's Barrow",at:[.68,.36],rx:6.5,ry:4.5,H:30,top:.35,den:'barrowqueen'},
    {k:'hill',name:'Gallows Hill',at:[.24,.25],rx:5.5,ry:3.5,H:26,top:.25},
    {k:'gully',name:'Blackwater Channel',at:[.32,.74],ax:'x',len:14,wid:2,D:16,water:1,dwell:'bogwight'}]},
  starfall:{auto:[ // Starfall Expanse: the great crater where Astrael fell, a shard ridge, a scorched rift
    {k:'bowl',name:'Fallen Star Crater',at:[.66,.55],rx:7,ry:4.8,D:34,style:'crystal',den:'astrael'},
    {k:'hill',name:'Shard Ridge',at:[.22,.25],rx:6,ry:3,H:34,top:.2,bank:{ax:'y',at:.3},style:'crystal'},
    {k:'gully',name:'Scorched Rift',at:[.26,.76],ax:'x',len:12,wid:2,D:22,style:'obsidian',dwell:'meteorgolem'}]}});
// ---- the world map: stairs down from the moor ----
if(typeof WORLD_BRANCH!=='undefined')WORLD_BRANCH.moor=['barrow1','barrow2'];
// ---- album pages and blurbs ----
if(typeof ALBUM!=='undefined')for(const p of [{id:'quarry',name:'Rustvein Quarry',zones:['quarry'],b:{def:6,vit:1}},{id:'moor',name:'Hollowmoor',zones:['moor'],b:{int:2,maxsp:60}},
  {id:'barrow',name:'Barrow Deeps',zones:['barrow1','barrow2'],b:{def:8,maxhp:300}},{id:'starfall',name:'Starfall Expanse',zones:['starfall'],b:{atk:15,matk:15}}])
  if(!ALBUM.some(a=>a.id===p.id))ALBUM.push(p);
if(typeof ZONE_BLURB!=='undefined')Object.assign(ZONE_BLURB,{
  quarry:'An old iron quarry west of Redrock Canyon. The miners are gone; their lamps still walk the cuts.',
  moor:'A haunted moor north of the Fen: barrow mounds, lanterns that are not lanterns, and stairs down into the dead.',
  barrow1:'Tombs under the moor. The dead here do not stay down.',barrow2:'The deepest tombs, where the Pale Regent holds court.',
  starfall:'A scorched plateau east of the Caldera where stars fell. The strongest monsters in Embervale walk here.'});
if(typeof TH!=='undefined')Object.assign(TH,{
  'An old iron quarry west of Redrock Canyon. The miners are gone; their lamps still walk the cuts.':'เหมืองเหล็กเก่าทางตะวันตกของหุบผาหินแดง คนงานเหมืองหายไปแล้ว เหลือแต่ตะเกียงที่ยังเดินอยู่ในหลุม',
  'A haunted moor north of the Fen: barrow mounds, lanterns that are not lanterns, and stairs down into the dead.':'ทุ่งพรุผีสิงทางเหนือของบึง เนินสุสาน ตะเกียงที่ไม่ใช่ตะเกียง และบันไดลงสู่แดนคนตาย',
  'Tombs under the moor. The dead here do not stay down.':'สุสานใต้ทุ่งพรุ คนตายที่นี่ไม่ยอมนอนนิ่ง',
  'The deepest tombs, where the Pale Regent holds court.':'สุสานชั้นลึกสุด ที่ผู้สำเร็จราชการซีดเผือดครองบัลลังก์',
  'A scorched plateau east of the Caldera where stars fell. The strongest monsters in Embervale walk here.':'ที่ราบสูงไหม้เกรียมทางตะวันออกของปล่องภูเขาไฟ ที่ดวงดาวตกลงมา มอนสเตอร์ที่แข็งแกร่งที่สุดใน Embervale อยู่ที่นี่',
  'Rockfall':'หินถล่ม','Barrow Wail':'เสียงโหยหวนแห่งสุสาน','Soul Harvest':'เก็บเกี่ยววิญญาณ','Starfall':'ดาวตก'});
