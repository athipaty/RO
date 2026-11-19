"use strict";
// building keepers stand beside the door (in tiles from its middle), so they never hide the sign above it
const NPC_BESIDE=1.9;
/* ================= state ================= */
let loot=[], lootId=0, hoverLoot=null;
let wbMob=null; // the world boss in this region, when the server has one here
let P=null, S=null, zoneId='town', Z=null, mobs=[], fx=[], texts=[], shots=[], now=0, running=false;
const zoneCache={};
let uid=1;

function newPlayer(name){
  return {name:name||'Wanderer',cls:'novice',lv:1,exp:0,jl:1,jexp:0,st:{str:1,agi:1,vit:1,int:1,dex:1,luk:1},statPts:24,skillPts:0,skills:{},
    gold:200,storage:[],friends:[],inv:[{id:'red',n:6},{id:'scroll',n:1}],eq:{weapon:{id:'club',uid:uid++,s:[]},armor:{id:'tunic',uid:uid++,s:[]},accessory:null,head:null,face:null,mouth:null},quest:null,
    hp:1,sp:1,zone:'town',x:0,y:0,visited:['town'],buffs:{},cd:{},ail:{},
    path:[],target:null,npcGoal:null,queued:null,atkT:0,face:1,walkT:0,moving:false,sitting:false,dead:false,regenAcc:0};
}

/* ================= zone generation ================= */
function getZone(id){
  if(zoneCache[id])return zoneCache[id];
  const D=ZONES[id], W=D.w, H=D.h, r=seeded(D.seed||7), t=new Uint8Array(W*H);
  const set=(x,y,v)=>{if(x>=0&&y>=0&&x<W&&y<H)t[y*W+x]=v;};
  const get=(x,y)=>(x<0||y<0||x>=W||y>=H)?2:t[y*W+x];
  const obst=(D.theme==='dunes'||D.theme==='crypt'||D.theme==='cave'||D.theme==='arena'||D.theme==='keep'||D.theme==='heights')?4:2;
  const zone={id,D,w:W,h:H,t,portals:[],npcs:[],buildings:[],spawn:null};
  for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(x===0||y===0||x===W-1||y===H-1)set(x,y,obst);
  if(D.theme==='town'&&id==='capital'){
    // v1.35.0 Aurelmark: four districts on green lawns, two broad paved avenues crossing at a round royal plaza with the
    // great fountain in the middle; paved forecourts and walks to every door; flower hedges between district and avenue.
    // Trees only on the far (north and west) edges, so nothing stands between the camera and the people.
    const fill=(x0,y0,x1,y1,v)=>{for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)set(x,y,v);};
    for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++){if(x===1||y===1){if(r()<.7)set(x,y,2);}else if(x===W-2||y===H-2){}else set(x,y,r()<.05?7:0);}
    for(let y=24;y<=38;y++)for(let x=3;x<=24;x++)if(r()<.14)set(x,y,7);          // Noble Gardens: a royal garden, no buildings (v1.35.1)
    for(let y=3;y<=H-4;y++)for(let x=3;x<=W-4;x++)if(Math.hypot(x+.5-13,(y+.5-31)*1.2)<3.6)set(x,y,3); // the garden pond
    for(let k=3;k<=W-4;k++){if(k<23||k>32){set(k,18,7);set(k,23,7);}}for(let k=3;k<=H-4;k++)if(k<16||k>25){set(25,k,7);set(30,k,7);} // hedges
    fill(2,19,W-1,22,6);fill(26,2,29,H-3,6);                                     // the two avenues (the east one runs out of the gate)
    fill(18,30,25,31,6);                                                          // a walk in from the plaza
    for(let y=12;y<=30;y++)for(let x=19;x<=37;x++)if(Math.hypot(x+.5-28,y+.5-21)<7.2)set(x,y,6); // the royal plaza
    const B=[{x:23,y:2,w:10,h:7,name:'Royal Palace',roof:'#2a4a8a',npc:{name:'Herald Cassian',role:'palace',col:'#2a4a8a',hair:'#e8d8b0'}}, // v1.37.0 at the head of the avenue
             {x:5,y:5,w:8,h:5,name:'Aurel Market',roof:'#a8452e',npc:{name:'Merchant Tavi',role:'shop',col:'#c86a3a',hair:'#3a2a1a'}},
             {x:15,y:5,w:7,h:5,name:'Gemcutter',roof:'#5a3a8a',npc:{name:'Gemcutter Sela',role:'gemcut',col:'#7a5ac0',hair:'#e8e4f0'}},
             {x:37,y:4,w:10,h:6,name:'Grand Library',roof:'#2e4f6e',npc:{name:'Librarian Oren',role:'library',col:'#3b5a7a',hair:'#c8c8c8'}},
             {x:48,y:5,w:6,h:5,name:'Sigil Forge',roof:'#2e6e6a',npc:{name:'Sigilwright Dorn',role:'fuse',col:'#4a5a6a',hair:'#e8e8e8'}}, // v1.38.3 Scholars' Quarter
             {x:4,y:24,w:7,h:5,name:'Hall of Awakening',roof:'#6a4aa8',npc:{name:'Awakener Liora',role:'awaken',col:'#e8e0f4',hair:'#c8b0ff'}}, // v1.37.4 in Noble Gardens
             {x:46,y:27,w:7,h:5,name:'Royal Stables',roof:'#2a4a8a',npc:{name:'Stablemaster Rowan',role:'stables',col:'#6a4a2a',hair:'#c86a2a'}}, // v1.37.2
             {x:38,y:26,w:7,h:5,name:'Forge Royal',roof:'#5a4a42',npc:{name:'Smith Garrow',role:'smith',col:'#6a5040',hair:'#8a5a2b'}}];
    for(const b of B){const fy=b.y+b.h,cx=Math.floor(b.x+b.w/2);
      fill(b.x,fy,b.x+b.w-1,fy+1,6);                                             // a paved forecourt along the front
      if(fy<19)fill(cx-1,fy,cx,18,6);else fill(cx-1,23,cx,b.y-1,6);              // and a walk to the avenue
      fill(b.x,b.y,b.x+b.w-1,fy-1,5);zone.buildings.push(b);
      zone.npcs.push({...b.npc,x:(b.x+b.w/2+NPC_BESIDE)*TILE,y:(b.y+b.h)*TILE+20});}
    // the great fountain stands in the middle of the plaza (drawn by capbldg.js; a building so it blocks and sorts right)
    {const f={x:26,y:19,w:4,h:4,name:'',roof:'#cfc6b4',kind:'fountain'};fill(f.x,f.y,f.x+f.w-1,f.y+f.h-1,5);zone.buildings.push(f);}
    zone.signs=[{x:23.4,y:16.4,name:'Market Row'},{x:32.6,y:16.4,name:"Scholars' Quarter"},{x:23.4,y:25.6,name:'Noble Gardens'},{x:32.6,y:25.6,name:'Grand Gate'}];
    zone.npcs.push({name:'Seer Valen',role:'rebirth',col:'#e8c25a',hair:'#f4efe2',x:33.5*TILE,y:14.2*TILE});
    // v1.37.1 the city wall instead of the ring of trees: a tall crenellated wall with watchtowers on the far (north and
    // west) sides, a low parapet on the near (south and east) sides so it never hides anyone, and the east gate's two
    // towers either side of the road to Hearthvale. Drawn in sections by capbldg.js (only those on screen).
    for(let x=0;x<W;x++){set(x,0,5);set(x,1,5);set(x,H-1,5);}for(let y=0;y<H;y++){set(0,y,5);set(1,y,5);if(y<19||y>22)set(W-1,y,5);}
    for(let y=2;y<H-1;y++)if(get(2,y)===2)set(2,y,0);for(let x=2;x<W-1;x++)if(get(x,2)===2)set(x,2,0);
    fill(W-2,17,W-1,18,5);fill(W-2,23,W-1,24,5);
    const wall=(x,y,w,h,side,tower)=>zone.buildings.push({x,y,w,h,name:'',roof:'#c8c0b0',kind:'wall',side,tower});
    for(let x=0;x<W;x+=8)wall(x,0,Math.min(8,W-x),2,'n',x%16===0);
    zone.buildings[zone.buildings.length-1].towerEnd=1;                                  // the north-east corner tower
    for(let y=2;y<H;y+=8)wall(0,y,2,Math.min(8,H-y),'w',y>2&&(y-2)%16===0);
    zone.buildings[zone.buildings.length-1].towerEnd=1;                                  // the south-west corner tower
    for(let x=2;x<W;x+=8)wall(x,H-1,Math.min(8,W-x),1,'s',false);
    for(const [y0,y1] of [[2,17],[25,H-1]])for(let y=y0;y<y1;y+=8)wall(W-1,y,1,Math.min(8,y1-y),'e',false);
    for(const y of [17,23])zone.buildings.push({x:W-2,y,w:2,h:2,name:'',roof:'#c8c0b0',kind:'gatetower',up:y<20});
    zone.portals.push({x:(W-2+.5)*TILE,y:21*TILE,to:'town',side:'east'});
    zone.spawn={x:(W-6)*TILE,y:21*TILE};
  } else if(D.theme==='town'){
    // v1.27.0 Hearthvale in four districts around a round open plaza; the four roads run out to the gates.
    //   Market Row (north-west): shop, smithy, the stylist's stall      Adventurers' Yard (north-east): guild hall, arena, keep, training yard
    //   Chapel Close (south-west): chapel, the elder, the mage, the veiled shade      Travellers' Green (south-east): warehouse, waystation, festival
    // no extra trees on the south and east edges: they stand nearest the camera and would hide the people behind them
    for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++){if(x===1||y===1){if(r()<.6)set(x,y,2);}else if(x===W-2||y===H-2){}else set(x,y,r()<.05?7:0);}
    const fill=(x0,y0,x1,y1,v)=>{for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)set(x,y,v);};
    // Market Row and Adventurers' Yard stay green: one dirt path from the General Store's door and one from the Guild Hall's
    for(let y=18;y<=27;y++)for(let x=2;x<=16;x++)if(r()<.12)set(x,y,7);fill(3,24,17,25,1); // Chapel Close: a flowered green, a dirt walk
    fill(22,24,37,25,1);fill(32,26,35,27,3);             // Travellers' Green: a dirt lane past the doors, a duck pond
    for(let k=2;k<=37;k++){if(k<17||k>22){set(k,12,7);set(k,17,7);}}for(let k=2;k<=27;k++)if(k<12||k>17){set(17,k,7);set(22,k,7);}
    fill(17,24,17,25,1);fill(22,24,22,25,1);fill(6,12,7,12,1);fill(27,12,28,12,1); // every walk runs through the hedges to the road // flower hedges between districts
    fill(6,7,7,12,1);fill(27,8,28,12,1);                 // (v1.32.1)
    fill(0,13,W-1,16,1);fill(18,0,21,H-1,1);             // the two roads, gate to gate: plain dirt paths again (v1.37.3)
    for(let y=8;y<=22;y++)for(let x=13;x<=26;x++)if(Math.hypot(x+.5-20,y+.5-15)<6)set(x,y,1); // the round plaza
    for(const [x,y] of [[17,2],[22,2],[2,12],[2,17],[2,23],[2,24],[2,25]])set(x,y,2); // trees framing the roads; a dark corner for Nyx
    const B=[{x:3,y:3,w:7,h:4,name:'General Store',roof:'#8e3b2e',npc:{name:'Ilsa the Merchant',role:'shop',col:'#c86a3a',hair:'#8a3b1a'}},
             {x:11,y:3,w:6,h:4,name:'Smithy',roof:'#5a4a42',npc:{name:'Brannoc the Smith',role:'smith',col:'#6a5040',hair:'#2b1d16'}},
             {x:24,y:3,w:8,h:5,name:'Guild Hall',roof:'#2e4f8e',npc:{name:'Guildmaster Corvin',role:'job',col:'#3b5ea8',hair:'#c8c8c8'}},
             {x:4,y:19,w:7,h:5,name:'Chapel',roof:'#cfc6b4',npc:{name:'Sister Maren',role:'heal',col:'#efe7d6',hair:'#e0c070'}},
             {x:24,y:19,w:6,h:4,name:'Warehouse',roof:'#7a6a3a',npc:{name:'Wenna the Keeper',role:'storage',col:'#8a6a9a',hair:'#d86a9a'}},
             {x:31,y:19,w:7,h:5,name:'Waystation',roof:'#3e7a4a',npc:{name:'Tobin the Wayfarer',role:'warp',col:'#4f8a4a',hair:'#5a3a20'}}];
    for(const b of B){fill(b.x,b.y,b.x+b.w-1,b.y+b.h-1,5);
      zone.buildings.push(b);
      const nx=(b.x+b.w/2+NPC_BESIDE)*TILE, ny=(b.y+b.h)*TILE+20;
      zone.npcs.push({...b.npc,x:nx,y:ny});}
    zone.portals.push({x:(W-1.5)*TILE,y:15*TILE,to:'meadow',side:'east'});
    zone.portals.push({x:1.5*TILE,y:15*TILE,to:'capital',side:'west'});
    // v1.37.3 the west side, toward the capital, is walled like Aurelmark, with gate towers either side of the road
    for(let y=0;y<H;y++)if(y<13||y>16){set(0,y,5);set(1,y,5);}
    {const wall=(x,y,w,h,tower,end)=>zone.buildings.push({x,y,w,h,name:'',roof:'#c8c0b0',kind:'wall',side:'w',tower,towerEnd:end});
      wall(0,0,2,6,true,false);wall(0,6,2,5,false,false);wall(0,19,2,6,false,false);wall(0,25,2,H-25,false,true);
      for(const y of [11,17])zone.buildings.push({x:0,y,w:2,h:2,name:'',roof:'#c8c0b0',kind:'gatetower',up:y<13});}   // #32 the west gate leads to the capital, Aurelmark
    zone.portals.push({x:20*TILE,y:1.5*TILE,to:'heights',side:'north'});   // v1.17.0 Windwhistle Heights
    zone.portals.push({x:20*TILE,y:(H-1.5)*TILE,to:'farms',side:'south'}); // and Willowmere Farms
    zone.npcs.push({name:'Arena Master Vexa',role:'arena',col:'#a8323a',hair:'#1c1c1c',x:26.8*TILE,y:10.4*TILE});
    zone.npcs.push({name:'Keep Herald Orrin',role:'keep',col:'#5a3a8a',hair:'#d8b060',x:33.8*TILE,y:10.6*TILE});
    zone.npcs.push({name:'Lune the Stylist',role:'stylist',col:'#d86a9a',hair:'#7a4fb0',x:6.5*TILE,y:10.2*TILE});
    zone.npcs.push({name:'Festival Keeper Pim',role:'festival',col:'#e07ab0',hair:'#f0c040',x:27.5*TILE,y:26.2*TILE});
    // district signposts where each district meets the plaza (drawn by drawObj, kind 'dsign')
    zone.signs=[{x:15.2,y:10.6,name:'Market Row'},{x:24.8,y:10.6,name:'Adventurers\' Yard'},{x:15.2,y:19.4,name:'Chapel Close'},{x:23.4,y:24.4,name:'Travellers\' Green'}];
    zone.spawn={x:20*TILE,y:19.5*TILE};
  } else if(D.theme==='keep'){
    // a walled courtyard with four gates; cobbled inside, the golden capture ring around the crystal
    const [cx,cy]=KEEP_C;
    for(let y=6;y<=H-7;y++)for(let x=9;x<=W-10;x++){const edge=x===9||x===W-10||y===6||y===H-7;
      if(edge){const gate=(Math.abs(y-cy)<=1&&(x===9||x===W-10))||(Math.abs(x-cx)<=1&&(y===6||y===H-7));if(!gate)set(x,y,4);}else set(x,y,6);}
    for(let y=cy-KEEP_R-1;y<=cy+KEEP_R+1;y++)for(let x=cx-KEEP_R-1;x<=cx+KEEP_R+1;x++){const d=Math.hypot(x-cx,y-cy);if(d<=KEEP_R+.5)set(x,y,d>KEEP_R-.6?1:6);}
    for(let x=1;x<=9;x++)for(let k=-1;k<=1;k++)set(x,cy+k,1);
    // a few broken pillars to fight around
    for(const [px,py] of [[14,10],[29,10],[14,24],[29,24],[16,17],[28,17]])set(px,py,4);
    set(cx,cy,4); // the crystal stands here
    zone.portals.push({x:1.5*TILE,y:(cy+.5)*TILE,to:'town',side:'west'});
    zone.spawn={x:4.5*TILE,y:(cy+.5)*TILE};
  } else if(D.theme==='arena'){
    for(const [cx,cy] of ARENA_PITS){
      for(let y=cy-7;y<=cy+7;y++)for(let x=cx-9;x<=cx+9;x++){const q=((x-cx)/9)**2+((y-cy)/6.5)**2;if(q<1)set(x,y,6);else if(q<1.18&&(Math.abs(x-cx)>3)&&(Math.abs(y-cy)>2))set(x,y,4);}}
    for(let y=15;y<=19;y++)for(let x=0;x<W-2;x++)if(t[y*W+x]!==6)set(x,y,1);
    for(let x=21;x<=26;x++)for(let y=2;y<H-2;y++)if(t[y*W+x]===0)set(x,y,1);
    zone.portals.push({x:1.5*TILE,y:17.5*TILE,to:'town',side:'west'});
    zone.spawn={x:4.5*TILE,y:17.5*TILE};
  } else {
    const clusters=Math.floor(W*H*D.density/5);
    for(let i=0;i<clusters;i++){let cx=1+Math.floor(r()*(W-2)),cy=1+Math.floor(r()*(H-2));const n=2+Math.floor(r()*6);
      for(let k=0;k<n;k++){set(cx,cy,obst);cx+=Math.floor(r()*3)-1;cy+=Math.floor(r()*3)-1;}}
    for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++){if(get(x,y)===0&&r()<D.density*.25)set(x,y,obst);else if(get(x,y)===0&&D.theme!=='crypt'&&D.theme!=='frost'&&D.theme!=='cave'&&r()<.035)set(x,y,7);}
    for(let i=0;i<D.ponds;i++){const cx=6+Math.floor(r()*(W-12)),cy=5+Math.floor(r()*(H-10)),rx=2+r()*3,ry=2+r()*2.5;
      for(let y=Math.floor(cy-ry);y<=cy+ry;y++)for(let x=Math.floor(cx-rx);x<=cx+rx;x++){const q=((x-cx)/rx)**2+((y-cy)/ry)**2;if(q<1)set(x,y,3);}}
    const mid=H>>1; let y=mid; const ys=[];
    for(let x=0;x<W;x++){ys.push(y);for(let k=-1;k<=1;k++)set(x,y+k,1);
      if(x>3&&x<W-4&&r()<.22){const ny=clamp(y+(r()<.5?-1:1),5,H-6);for(let k=-1;k<=1;k++)set(x,ny+k,1);y=ny;}}
    // keep border solid except at portal mouths
    for(let x=0;x<W;x++){set(x,0,obst);set(x,H-1,obst);}
    for(let yy=0;yy<H;yy++){ if(Math.abs(yy-ys[0])>1)set(0,yy,obst); if(Math.abs(yy-ys[W-1])>1)set(W-1,yy,obst); }
    if(D.links.west)zone.portals.push({x:1.5*TILE,y:(ys[0]+.5)*TILE,to:D.links.west,side:'west'});
    else for(let k=-1;k<=1;k++)set(0,ys[0]+k,obst);
    if(D.links.east)zone.portals.push({x:(W-1.5)*TILE,y:(ys[W-1]+.5)*TILE,to:D.links.east,side:'east'});
    else for(let k=-1;k<=1;k++)set(W-1,ys[W-1]+k,obst);
    zone.spawn={x:4.5*TILE,y:(ys[4]+.5)*TILE};
    // v1.17.0 a gate in the south or north edge (the regions next to Hearthvale), joined to the main road
    for(const side of ['south','north'])if(D.links[side]){const gx=W>>1,road=ys[gx],ey=side==='south'?H-1:0;
      for(let yy=Math.min(road,ey);yy<=Math.max(road,ey);yy++)for(let k=-1;k<=1;k++)set(gx+k,yy,1);
      const py=side==='south'?H-1.5:1.5;zone.portals.push({x:(gx+.5)*TILE,y:py*TILE,to:D.links[side],side});
      if(!D.links.west)zone.spawn={x:(gx+.5)*TILE,y:(py+(side==='south'?-3:3))*TILE};}
    // #34 stairs down to a dungeon: a clearing south of the road, joined to it by a path
    if(D.stairs){const sx=Math.floor(W*.62),road=ys[sx],sy=clamp(road+9,road+4,H-5);
      for(let yy=road;yy<=sy;yy++)for(let k=-1;k<=1;k++)set(sx+k,yy,1);
      for(let yy=sy-2;yy<=sy+2;yy++)for(let xx=sx-2;xx<=sx+2;xx++)set(xx,yy,1);
      zone.portals.push({x:(sx+.5)*TILE,y:(sy+.5)*TILE,to:D.stairs,side:'down'});}
  }
  // reachable spawn tiles
  const seen=new Uint8Array(W*H), q=[]; const sx=Math.floor(zone.spawn.x/TILE), sy=Math.floor(zone.spawn.y/TILE);
  q.push(sy*W+sx); seen[sy*W+sx]=1; const spawnTiles=[];
  while(q.length){const i=q.pop(),x=i%W,yy=(i/W)|0;
    if((t[i]===0||t[i]===7)&&!zone.portals.some(p=>Math.hypot(p.x-(x+.5)*TILE,p.y-(yy+.5)*TILE)<TILE*7))spawnTiles.push(i);
    for(const [dx,dy] of DIRS.slice(0,4)){const nx=x+dx,ny=yy+dy;if(nx<0||ny<0||nx>=W||ny>=H)continue;const ni=ny*W+nx;if(seen[ni]||BLOCK[t[ni]])continue;seen[ni]=1;q.push(ni);}}
  zone.spawnTiles=spawnTiles; zone.reach=seen;
  renderZone(zone, r);
  zoneCache[id]=zone; return zone;
}

function renderZone(z, r){
  const th=THEMES[z.D.theme], W=z.w, H=z.h;
  const c=document.createElement('canvas'); c.width=W*TILE; c.height=H*TILE; const g=c.getContext('2d');
  const mini=document.createElement('canvas'); mini.width=W; mini.height=H; const mg=mini.getContext('2d');
  const R=seeded(99+W*H);
  const tops=[];
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){
    const v=z.t[y*W+x], px=x*TILE, py=y*TILE;
    g.fillStyle=th.g[Math.floor(R()*th.g.length)]; g.fillRect(px,py,TILE,TILE);
    // ground texture
    if(z.D.theme==='dunes'||z.D.theme==='arena'){g.strokeStyle='rgba(150,110,60,.18)';g.lineWidth=1;g.beginPath();const oy=R()*TILE;g.moveTo(px,py+oy);g.quadraticCurveTo(px+16,py+oy-4,px+32,py+oy);g.stroke();}
    else if(z.D.theme==='crypt'||z.D.theme==='keep'){g.strokeStyle='rgba(0,0,0,.25)';g.strokeRect(px+.5,py+.5,TILE-1,TILE-1);if(R()<.15){g.beginPath();g.moveTo(px+R()*32,py+R()*32);g.lineTo(px+R()*32,py+R()*32);g.stroke();}}
    else if(z.D.theme==='frost'){for(let k=0;k<3;k++){g.fillStyle='rgba(110,140,170,.2)';g.fillRect(px+R()*30,py+R()*30,2,2);}}
    else{for(let k=0;k<3;k++){g.fillStyle='rgba(0,40,0,.18)';const gx=px+R()*30,gy=py+R()*30;g.fillRect(gx,gy,1.5,4);g.fillRect(gx+2,gy+1,1.5,3);}}
    let mc=th.g[0];
    if(v===1){g.fillStyle=th.path;g.fillRect(px,py,TILE,TILE);g.fillStyle='rgba(0,0,0,.12)';for(let k=0;k<3;k++)g.fillRect(px+R()*28,py+R()*28,3,2);mc=th.path;}
    if(v===6){g.fillStyle=th.cob;g.fillRect(px,py,TILE,TILE);g.strokeStyle='rgba(60,55,50,.35)';g.lineWidth=1;
      for(let k=0;k<2;k++){g.strokeRect(px+.5,py+k*16+.5,15,15);g.strokeRect(px+16.5,py+k*16+.5,15,15);}mc=th.cob;}
    if(v===7){const cols=['#f2e46b','#f07ca0','#ffffff','#b9a0f0'];for(let k=0;k<3;k++){g.fillStyle=cols[Math.floor(R()*4)];g.beginPath();g.arc(px+4+R()*24,py+4+R()*24,2,0,7);g.fill();}}
    if(v===3){g.fillStyle=th.water;g.fillRect(px,py,TILE,TILE);g.fillStyle=th.lava?'rgba(255,200,80,.35)':'rgba(255,255,255,.18)';g.fillRect(px+R()*20,py+R()*28,8,2);mc=th.water;}
    if(v===2){tops.push([px,py]);mc=th.canopy?th.canopy[0]:'#333';}
    if(v===4){tops.push([px,py,'rock']);mc=th.rock?th.rock[0]:'#555';}
    if(v===5)mc='#5a4a3a';
    mg.fillStyle=mc; mg.fillRect(x,y,1,1);
  }
  // upright objects (drawn per frame in the isometric view, depth-sorted with characters)
  z.objs=[];
  for(const [px,py,kind] of tops){const th2=z.D.theme;let k;
    if(kind==='rock')k=th2==='crypt'||th2==='arena'||th2==='keep'?'pillar':th2==='cave'?'rock':th2==='heights'?(R()<.35?'crag':'rock'):(R()<.3?'cactus':'rock');else k=th2==='frost'?'pine':th2==='farms'&&R()<.3?'hay':'tree';
    z.objs.push({x:px+16,y:py+16,kind:k,v:Math.floor(R()*3),sc:.85+R()*.3});}
  for(const b of z.buildings){mg.fillStyle=b.roof;mg.fillRect(b.x,b.y,b.w,b.h);}
  for(const s of z.signs||[])z.objs.push({x:s.x*TILE,y:s.y*TILE,kind:'dsign',name:s.name,v:0,sc:1});
  if(z.D.theme==='keep'){const [cx,cy]=KEEP_C;z.objs=z.objs.filter(o=>!(Math.abs(o.x-(cx*TILE+16))<1&&Math.abs(o.y-(cy*TILE+16))<1));z.objs.push({x:(cx+.5)*TILE,y:(cy+.5)*TILE,kind:'crystal',v:0,sc:1});}
  z.img=c; z.mini=mini;
}

/* ================= collision & pathfinding ================= */
function blockedT(x,y){return x<0||y<0||x>=Z.w||y>=Z.h||BLOCK[Z.t[y*Z.w+x]];}
function canStand(x,y,r){
  return !blockedT(Math.floor((x-r)/TILE),Math.floor((y-r)/TILE))&&!blockedT(Math.floor((x+r)/TILE),Math.floor((y-r)/TILE))&&
         !blockedT(Math.floor((x-r)/TILE),Math.floor((y+r)/TILE))&&!blockedT(Math.floor((x+r)/TILE),Math.floor((y+r)/TILE));
}
function moveEnt(e,dx,dy,r){let moved=false;
  if(dx&&canStand(e.x+dx,e.y,r)){e.x+=dx;moved=true;}
  if(dy&&canStand(e.x,e.y+dy,r)){e.y+=dy;moved=true;}
  return moved;}
function clearLine(x0,y0,x1,y1){const d=Math.hypot(x1-x0,y1-y0),n=Math.ceil(d/6);for(let k=1;k<=n;k++){if(!canStand(x0+(x1-x0)*k/n,y0+(y1-y0)*k/n,PR))return false;}return true;}
function findPath(sx,sy,tx,ty){
  const W=Z.w,H=Z.h;
  if(blockedT(tx,ty)){let best=null,bd=1e9;for(let dy=-3;dy<=3;dy++)for(let dx=-3;dx<=3;dx++)if(!blockedT(tx+dx,ty+dy)){const d=dx*dx+dy*dy;if(d<bd){bd=d;best=[tx+dx,ty+dy];}}if(!best)return null;[tx,ty]=best;}
  const N=W*H,g=new Float32Array(N).fill(1e9),from=new Int32Array(N).fill(-1),closed=new Uint8Array(N);
  const s=sy*W+sx,goal=ty*W+tx;g[s]=0;const heap=[[0,s]];
  const push=(f,i)=>{heap.push([f,i]);let k=heap.length-1;while(k>0){const pk=(k-1)>>1;if(heap[pk][0]<=heap[k][0])break;[heap[pk],heap[k]]=[heap[k],heap[pk]];k=pk;}};
  const pop=()=>{const top=heap[0],last=heap.pop();if(heap.length){heap[0]=last;let k=0;for(;;){const l=2*k+1,r=l+1;let m=k;if(l<heap.length&&heap[l][0]<heap[m][0])m=l;if(r<heap.length&&heap[r][0]<heap[m][0])m=r;if(m===k)break;[heap[m],heap[k]]=[heap[k],heap[m]];k=m;}}return top;};
  const h=i=>{const dx=Math.abs(i%W-tx),dy=Math.abs(((i/W)|0)-ty);return Math.max(dx,dy)+.414*Math.min(dx,dy);};
  let it=0;
  while(heap.length&&it++<8000){const i=pop()[1];if(closed[i])continue;closed[i]=1;if(i===goal)break;const x=i%W,y=(i/W)|0;
    for(const [dx,dy] of DIRS){const nx=x+dx,ny=y+dy;if(blockedT(nx,ny))continue;if(dx&&dy&&(blockedT(x+dx,y)||blockedT(x,y+dy)))continue;
      const ni=ny*W+nx;if(closed[ni])continue;const ng=g[i]+(dx&&dy?1.414:1);if(ng<g[ni]){g[ni]=ng;from[ni]=i;push(ng+h(ni),ni);}}}
  if(goal!==s&&from[goal]===-1)return null;
  const out=[];let c=goal;while(c!==s&&c!==-1){out.push({x:(c%W+.5)*TILE,y:(((c/W)|0)+.5)*TILE});c=from[c];}
  return out.reverse();
}
function pathTo(x,y,exact){
  const raw=findPath(Math.floor(P.x/TILE),Math.floor(P.y/TILE),Math.floor(x/TILE),Math.floor(y/TILE));
  if(!raw){P.path=[];return false;}
  if(exact&&canStand(x,y,PR))raw.push({x,y});
  const out=[];let cx=P.x,cy=P.y,i=0;
  while(i<raw.length){let j=raw.length-1;while(j>i&&!clearLine(cx,cy,raw[j].x,raw[j].y))j--;out.push(raw[j]);cx=raw[j].x;cy=raw[j].y;i=j+1;}
  P.path=out;P.sitting=false;return true;
}

/* ================= derived stats ================= */
function addB(b,src){if(!src)return;for(const k in src)b[k]=(b[k]||0)+src[k];}
function carryWeight(){let w=0;for(const e of P.inv)w+=itemWeight(e.id)*(e.n||1);for(const k in P.eq)if(P.eq[k])w+=itemWeight(P.eq[k].id);return w;}
function maxWeight(){return 800+((S&&S.str)||P.st.str)*30;}
function computeStats(){
  const c=CLASSES[P.cls], b={}, lv=P.lv;
  for(const slot of ['weapon','armor','accessory','head','face','mouth']){const e=P.eq[slot];if(!e)continue;const it=ITEMS[e.id];
    addB(b,{atk:it.atk||0,matk:it.matk||0,def:it.def||0});addB(b,it.b);addB(b,refineBonus(e));if(e.aw&&e.aw.k)addB(b,{[e.aw.k]:+e.aw.v||0});for(const s of e.s)if(s)addB(b,ITEMS[s].b);}
  for(const k in P.buffs)addB(b,P.buffs[k].b);
  if(typeof passiveB==='function')addB(b,passiveB()); // passive skills (js/builds.js)
  const st={};for(const k of STATS)st[k]=P.st[k]+(b[k]||0);
  const w=P.eq.weapon?ITEMS[P.eq.weapon.id]:null, bow=w&&w.wt==='bow';
  const s={...st};
  s.maxhp=Math.round(((35+lv*11)*(1+st.vit*.012)*c.hp+(b.maxhp||0))*(1+(b.hppct||0)/100));
  s.maxsp=Math.round(((10+lv*2.5)*(1+st.int*.012)*c.sp+st.int*.6+(b.maxsp||0))*(1+(b.sppct||0)/100));
  s.atk=Math.round(((bow?st.dex+(st.dex/10|0)**2+st.str/5:st.str+(st.str/10|0)**2+st.dex/5)+st.luk/5+lv/4+(b.atk||0))*(1+(b.atkpct||0)/100));
  s.matk=Math.round((st.int+(st.int/7|0)**2+lv/4+(b.matk||0))*(1+(b.matkpct||0)/100));
  s.def=Math.round((b.def||0)+st.vit/2);
  s.hit=Math.round(lv+st.dex+(b.hit||0)); s.flee=Math.round(lv+st.agi+(b.flee||0)); s.crit=+(1+st.luk*.3+(b.crit||0)).toFixed(1);
  s.delay=Math.max(.3,(1.5-st.agi*.011-st.dex*.003)*c.aspd/(1+(b.aspd||0)/100));
  // build stats (js/builds.js): % faster casting, extra crit damage, double attack chance, damage taken cut, healing power
  s.cast=Math.min(70,b.cast||0);s.critdmg=b.critdmg||0;s.dbl=Math.min(60,b.dbl||0);s.dmgred=Math.min(50,b.dmgred||0);s.heal=b.healpct||0;
  s.magic=!!c.magic; s.ranged=bow||!!c.magic;
  s.range=c.magic?175:bow?235:44;
  s.speed=145; s.regen=s.maxhp*.004+st.vit*.08+(b.regen||0); s.spregen=s.maxsp*.006+st.int*.05+(b.spregen||0);
  return s;
}

