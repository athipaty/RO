"use strict";
/* ================= the shape of the land: hills, slopes and banks (v1.56.0) =================
   Each region can have its own hand-made ground (LV_DESIGNS, one region at a time). The ground is a height field:
   every tile knows the height of its four corners, so land can rise smoothly. A gentle slope is walked up like any
   ground; a sudden drop (a bank) is a wall nobody can climb or step off, and paths of heroes and monsters go round it.
   Everything standing on the land is drawn at its height (the world-to-screen projection in js/render.js adds it), a
   tap lands on the slope you see, and melee needs both sides at about the same height; arrows and spells reach up and
   down. The hills are drawn once per region (the region's own grass laid over the slopes, lit by their tilt), so the
   cost while playing is one picture per hill.
   Greenmoss Meadow (v1.56.0): rolling green hills. Chieftain's Knoll with an old oak, the Hopper Chieftain's den and an
   earthen bank toward the road; Lookout Hill by the way in from Hearthvale; a soft rise in the southern fields.
   (v1.56.1) A brook sunk below the meadow joins its three ponds: a wooden bridge carries the road over it and two fords
   lead down into the water, where you wade slower and the dewdrops live; the banks elsewhere are too steep to climb.
   All land is drawn with the ground, before anyone standing on it, so nobody is ever hidden by a slope.
   (v1.57.0) The Whispering Woods, a hollow forest: The Hollow, a dark sunken glade with steep earth walls and two root
   paths down to the Wolf Alpha's den; The Fallen Giant, a dry gully of webs where the web-spinners nest, crossed on a
   huge fallen log; and long low ridges of roots between the trees.
   (v1.58.0) Willowmere Farms: The Terraces, three shelves of crop rows behind dry-stone walls rising to the north-west
   corner, where the Grand Scarecrow keeps watch, with earthen steps between them; The Canal, straight and stone-edged,
   from the big pond to the east pond, crossed by the road's bridge and one ford, where the reed snappers lurk.
   (v1.59.0) The Ashen Dunes: great dunes, a gentle windward slope and a steep sand slip face to the east, wind ripples
   on their backs; The Scarab Pit, a sunken crater of sand with two slopes down, the Scarab Queen's nest at the bottom.
   (v1.60.0) Every other wild region has its own land too (designs under LV_DESIGNS: rocky crags and ravines, snow drifts
   and ice canyons, glacier terraces and crevasses, peaks, a jungle river, a sinking bog, burial pits and lava, beach
   dunes and sea cliffs, a caldera, rolling downs, temple ruins, crystal ridges, a shadow hollow). lvAuto fits each piece
   near its place on the map, clear of roads, water, gates and people, and only where nothing gets cut off; a ravine or
   stream that meets a road gets a bridge, and each region's boss keeps its den in its own piece. Cliffs take the look
   of the land: rock, snow, ice, marsh mud, crystal or obsidian.
   (v1.60.1) Water you can wade looks shallow (a sandy, pebbly bed shows through, stones in it); ponds stay deep blue and
   a tap on one says it is too deep. The ways down into the water are gravel fords with stepping stones. A ravine or
   stream only meets a road partway along, full width, so every bridge spans water or a drop on both sides.
   (v1.60.2) Fewer long walks round: terraces have steps on two sides, and a long ravine or stream has a way across in
   the middle (a natural bridge in the land's own stone, ice or crystal, or a causeway of flat stones over water).

   Z.lvd = {W, Hh, H (highest), lo (lowest), wet (1 water, 2 bridge or log, 3 dry gully, 4 hollow floor), hc: Float32Array(W*Hh*4) corner heights [top-left, top-right, bottom-right, bottom-left],
            hills, nodes, den} */
const LV_STEP=6; // the largest height difference you can step across at a tile edge (screen px)
const LV_DESIGNS={
  meadow:{hills:[
    {name:"Chieftain's Knoll",cx:50.5,cy:8.5,rx:10,ry:6.5,H:58,top:.32,bank:{ax:'y',at:.42},oak:[51,7],den:[49,8,'hopperchief']},
    {name:'Lookout Hill',cx:12.5,cy:9.5,rx:7.5,ry:5.5,H:38,top:.3,bank:{ax:'x',at:.5}},
    {name:'South Rise',cx:15.5,cy:35,rx:9,ry:5.5,H:42,top:.25}],
    // (v1.56.1) a brook sunk below the meadow, joining its three ponds: under the road by a wooden bridge, two fords to wade
    brook:{D:22,wet:[[29,10,30,16],[29,26,34,27],[33,28,34,30]],bridge:[[29,22,30,25]],
      fords:[[28,14,'e'],[31,14,'w'],[32,29,'e'],[35,29,'w']],dwellers:'dewdrop'}},
  // (v1.57.0) the Whispering Woods, a hollow forest: a dark sunken glade with the Wolf Alpha's den at the bottom, reached by
  // two root paths; a dry gully where the web-spinners nest, crossed on a fallen giant log; long low ridges of roots
  woods:{
    bowls:[{name:'The Hollow',cx:54,cy:36,rx:6,ry:4.5,D:34,ramps:[[51,28,52,31,'s'],[44,34,47,35,'e']],den:[54,36,'lupealpha'],clear:[[54,31]]}],
    gullies:[{name:'The Fallen Giant',D:24,dry:[[20,39,36,40]],log:[[28,38,28,41]],ramps:[[17,39,19,40,'e'],[37,39,39,40,'w']],dwellers:'webspinner'}],
    hills:[{name:'Root Ridge',cx:40,cy:12,rx:7,ry:2.8,H:28,top:.25,bank:{ax:'y',at:.12},roots:1},
      {name:'Root Ridge',cx:11,cy:30,rx:4.5,ry:2.5,H:26,top:.25,bank:{ax:'y',at:.12},roots:1},
      {name:'Root Ridge',cx:7,cy:11,rx:5,ry:2.4,H:24,top:.25,bank:{ax:'y',at:.12},roots:1}]},
  // (v1.58.0) Willowmere Farms: three terraces of crop rows behind dry-stone walls, rising to the north-west corner where the
  // Grand Scarecrow keeps watch, earthen steps between them; an irrigation canal from the big pond to the east pond, the
  // road over it on a bridge and a ford to wade, reed snappers in the water
  farms:{
    terraces:{name:'The Terraces',shelves:[[2,2,24,16,14],[2,2,16,10,28],[2,2,8,6,42]],
      ramps:[[10,17,11,19,'n',0,14],[25,8,27,9,'w',0,14],[12,11,13,13,'n',14,28],[9,4,11,5,'w',28,42]],den:[5,4,'grandscarecrow']},
    brook:{name:'The Canal',D:20,wet:[[43,14,44,26]],bridge:[[43,20,44,23]],fords:[[42,17,'e'],[45,17,'w']],dwellers:'reedsnapper',canal:1}},
  // (v1.59.0) the Ashen Dunes, shaped by the wind: great dunes with a gentle windward slope and a steep slip face to the
  // east that nobody can climb; the Scarab Pit, a sunken sand crater where the Scarab Queen nests, two sandy slopes down
  dunes:{
    hills:[{name:'Great Dune',cx:48,cy:8,rx:8,ry:3.2,H:38,top:.15,bank:{ax:'x',at:.3},sand:1},
      {name:'Great Dune',cx:58,cy:14,rx:6.5,ry:2.8,H:30,top:.15,bank:{ax:'x',at:.3},sand:1},
      {name:'Great Dune',cx:18,cy:10,rx:8.5,ry:3.2,H:40,top:.15,bank:{ax:'x',at:.25},sand:1},
      {name:'Great Dune',cx:10,cy:38,rx:6,ry:2.6,H:28,top:.15,bank:{ax:'x',at:.3},sand:1}],
    bowls:[{name:'The Scarab Pit',cx:52,cy:34,rx:6,ry:4,D:30,sand:1,ramps:[[43,33,45,34,'e'],[51,27,52,29,'s']],den:[52,34,'scarabqueen']}]},
  // (v1.60.0) every other wild region, each its own land. Positions are fractions of the map (0..1); lvAuto fits each piece
  // near there, clear of roads, water, gates and people, and only where nothing is cut off.
  heights:{auto:[ // Windwhistle Heights: windswept rocky knolls, a ravine, a grassy rise
    {k:'hill',name:'Hornback Crag',at:[.25,.3],rx:8,ry:4.5,H:46,top:.25,bank:{ax:'y',at:.35},style:'rock',den:'hornback'},
    {k:'hill',name:'Windy Knoll',at:[.78,.72],rx:6,ry:3.6,H:34,top:.2,bank:{ax:'x',at:.35},style:'rock'},
    {k:'gully',name:'Whistling Ravine',at:[.72,.22],ax:'x',len:14,wid:2,D:28,style:'rock',dwell:'screebeetle'},
    {k:'hill',name:'Heather Rise',at:[.25,.78],rx:7,ry:4,H:26,top:.2}]},
  ridge:{auto:[ // Pinewatch Ridge: a long rocky spine with the Antler King on its crest, a mountain stream, a pine knoll
    {k:'hill',name:'The Spine',at:[.28,.38],rx:4,ry:8,H:48,top:.3,bank:{ax:'x',at:.3,pass:[-.2,.15]},style:'rock',den:'antlerking'},
    {k:'gully',name:'Pinewater',at:[.72,.62],ax:'y',len:15,wid:2,D:20,water:1},
    {k:'hill',name:'Pine Knoll',at:[.75,.22],rx:5.5,ry:3.5,H:26,top:.2}]},
  frost:{auto:[ // Frostpeak Pass: snow drifts, an ice canyon, the Frost Matron in a frozen hollow
    {k:'hill',name:'Snowdrift',at:[.22,.25],rx:7.5,ry:3.5,H:34,top:.2,bank:{ax:'y',at:.3},style:'snow'},
    {k:'hill',name:'Snowdrift',at:[.8,.7],rx:6,ry:3,H:28,top:.2,bank:{ax:'x',at:.3},style:'snow'},
    {k:'gully',name:'Ice Canyon',at:[.7,.2],ax:'x',len:16,wid:2,D:30,style:'ice',dwell:'glacierbeetle'},
    {k:'bowl',name:'Frozen Hollow',at:[.25,.75],rx:6,ry:4,D:30,style:'snow',den:'frostmatron'}]},
  glacier:{auto:[ // Skyreach Glacier: ice terraces up to Hrimfang, two deep crevasses
    {k:'shelves',name:'Ice Terraces',at:[.08,.08],steps:[[20,14,16],[12,8,32]],style:'ice',den:'hrimfang'},
    {k:'gully',name:'Crevasse',at:[.72,.3],ax:'y',len:14,wid:2,D:36,style:'ice'},
    {k:'gully',name:'Crevasse',at:[.6,.78],ax:'x',len:12,wid:2,D:36,style:'ice'}]},
  peaks:{auto:[ // Stormcrown Peaks: the great peak where Voltaris waits, a lesser peak, a storm ravine
    {k:'hill',name:'Stormcrown',at:[.7,.3],rx:9.5,ry:6,H:66,top:.22,bank:{ax:'y',at:.35},style:'rock',den:'voltaris'},
    {k:'hill',name:'Lesser Peak',at:[.22,.7],rx:6.5,ry:4,H:46,top:.2,bank:{ax:'x',at:.3},style:'rock'},
    {k:'gully',name:'Thunder Ravine',at:[.25,.25],ax:'y',len:12,wid:2,D:30,style:'rock'}]},
  jungle:{auto:[ // Thornveil Jungle: a jungle river with fords, mossy mounds, the Orchid Hollow where Orchidra blooms
    {k:'gully',name:'Jade River',at:[.5,.75],ax:'x',len:20,wid:3,D:18,water:1,dwell:'jadetoad'},
    {k:'hill',name:'Mossy Mound',at:[.22,.25],rx:6,ry:4,H:30,top:.2,bank:{ax:'y',at:.3},roots:1},
    {k:'hill',name:'Mossy Mound',at:[.8,.3],rx:5,ry:3.5,H:26,top:.2,roots:1},
    {k:'bowl',name:'Orchid Hollow',at:[.3,.62],rx:4.5,ry:3.2,D:28,den:'orchidra'}]},
  fen:{auto:[ // Mirelight Fen: a sunken bog where the Mire Matriarch lurks, a mud channel, low hummocks
    {k:'bowl',name:'The Sinking Bog',at:[.72,.3],rx:6,ry:4,D:24,style:'marsh',den:'mirematriarch'},
    {k:'gully',name:'Mud Channel',at:[.3,.7],ax:'x',len:14,wid:2,D:16,water:1,style:'marsh',dwell:'bogling'},
    {k:'hill',name:'Hummock',at:[.25,.25],rx:5,ry:3,H:18,top:.2},
    {k:'hill',name:'Hummock',at:[.75,.78],rx:4.5,ry:3,H:16,top:.2}]},
  crypt:{auto:[ // Cinder Crypt: burial pits, raised crypt terraces where the Warlord holds court, a channel of lava
    {k:'shelves',name:'Crypt Terraces',at:[.6,.08],steps:[[18,12,14],[10,7,28]],style:'stone',den:'warlord'},
    {k:'bowl',name:'Burial Pit',at:[.25,.3],rx:5,ry:3.5,D:26,style:'stone',dwell:'gravehound'},
    {k:'bowl',name:'Burial Pit',at:[.3,.75],rx:4.5,ry:3,D:24,style:'stone'},
    {k:'gully',name:'Lava Channel',at:[.75,.72],ax:'x',len:12,wid:2,D:20,water:1,lava:1,style:'obsidian'}]},
  coast:{auto:[ // Saltspray Coast: beach dunes, sea cliffs, a tidal channel full of crabs
    {k:'hill',name:'Beach Dune',at:[.25,.25],rx:7,ry:3,H:28,top:.15,bank:{ax:'x',at:.3},style:'sand'},
    {k:'hill',name:'Beach Dune',at:[.7,.78],rx:6,ry:2.8,H:24,top:.15,bank:{ax:'x',at:.3},style:'sand'},
    {k:'shelves',name:'Sea Cliffs',at:[.3,.72],steps:[[14,10,18],[8,6,34]],style:'rock'},
    {k:'gully',name:'Tidal Channel',at:[.6,.3],ax:'y',len:12,wid:2,D:16,water:1,dwell:'tidecrab'}]},
  caldera:{auto:[ // Cinderpeak Caldera: the crater where the Cinder Wyrm sleeps, obsidian ridges, a lava channel
    {k:'bowl',name:'The Caldera',at:[.55,.45],rx:6,ry:4,D:36,style:'obsidian',den:'cinderwyrm'},
    {k:'hill',name:'Obsidian Ridge',at:[.1,.2],rx:5,ry:2.6,H:34,top:.2,bank:{ax:'y',at:.3},style:'obsidian'},
    {k:'hill',name:'Obsidian Ridge',at:[.4,.8],rx:4.5,ry:2.6,H:28,top:.2,bank:{ax:'x',at:.3},style:'obsidian'},
    {k:'gully',name:'Lava Run',at:[.8,.2],ax:'y',len:9,wid:2,D:22,water:1,lava:1,style:'obsidian'}]},
  downs:{auto:[ // Goldleaf Downs: rolling downs, the Woolhorn on the tallest, a chalk bank
    {k:'hill',name:'Woolhorn Down',at:[.7,.3],rx:8,ry:5,H:40,top:.25,den:'woolhorn'},
    {k:'hill',name:'Down',at:[.25,.25],rx:7,ry:4.5,H:30,top:.2},
    {k:'hill',name:'Down',at:[.3,.75],rx:7.5,ry:4.5,H:32,top:.2},
    {k:'hill',name:'Chalk Bank',at:[.75,.75],rx:6.5,ry:3.5,H:30,top:.25,bank:{ax:'y',at:.3},style:'stone'}]},
  ruins:{auto:[ // Old Aurel Ruins: raised temple platforms, a sunken courtyard where the Fallen Paladin stands, a collapsed trench
    {k:'shelves',name:'Temple Platforms',at:[.08,.08],steps:[[18,12,14],[10,7,28]],style:'stone'},
    {k:'bowl',name:'Sunken Courtyard',at:[.7,.68],rx:6,ry:4,D:26,style:'stone',den:'fallenpaladin'},
    {k:'gully',name:'Collapsed Trench',at:[.72,.22],ax:'x',len:14,wid:2,D:22,style:'stone',dwell:'relicrat'}]},
  steppe:{auto:[ // Crystal Steppe: crystal ridges, a dry riverbed, the crater of the Geode Colossus
    {k:'hill',name:'Crystal Ridge',at:[.25,.25],rx:7,ry:3,H:36,top:.2,bank:{ax:'y',at:.3},style:'crystal'},
    {k:'hill',name:'Crystal Ridge',at:[.75,.25],rx:6,ry:3,H:32,top:.2,bank:{ax:'x',at:.3},style:'crystal'},
    {k:'gully',name:'Dry Riverbed',at:[.3,.75],ax:'x',len:18,wid:2,D:20,dwell:'geodetortoise'},
    {k:'bowl',name:'Geode Crater',at:[.72,.7],rx:6,ry:4,D:30,style:'crystal',den:'geodecolossus'}]},
  // (v1.62.0) the four corner regions round the cities (js/regions5.js)
  bramble:{auto:[ // Bramblewind Hills: the Bramble Warden on the windiest knoll, a lower rise, a hedge ditch full of boars
    {k:'hill',name:'Bramble Knoll',at:[.7,.3],rx:7,ry:4.5,H:36,top:.25,den:'bramblewarden'},
    {k:'hill',name:'Windy Rise',at:[.25,.72],rx:6.5,ry:4,H:28,top:.2},
    {k:'gully',name:'Hedge Ditch',at:[.3,.25],ax:'x',len:12,wid:2,D:16,dwell:'hedgeboar'}]},
  amber:{auto:[ // Amberfield Hollow: the golden hollow where the Harvest Matron stands, two sheaf mounds
    {k:'bowl',name:'Amberfield Hollow',at:[.6,.55],rx:7,ry:4.5,D:24,den:'harvestmatron'},
    {k:'hill',name:'Sheaf Mound',at:[.2,.25],rx:5.5,ry:3.5,H:24,top:.3},
    {k:'hill',name:'Sheaf Mound',at:[.25,.8],rx:5,ry:3.5,H:22,top:.3}]},
  mist:{auto:[ // Mistfall Vale: a stream through the reeds, the misty hollow of the Mother of Mists, a lantern rise
    {k:'gully',name:'Mistfall Stream',at:[.5,.3],ax:'y',len:12,wid:2,D:16,water:1,dwell:'reedfrog'},
    {k:'bowl',name:'Misty Hollow',at:[.72,.7],rx:6,ry:4,D:22,den:'mistmother'},
    {k:'hill',name:'Lantern Rise',at:[.2,.7],rx:5.5,ry:3.5,H:26,top:.25}]},
  thornmere:{auto:[ // Thornmere Wilds: Old Gnarlroot on his mound, a sunken bog, a gully of thorn
    {k:'hill',name:'Gnarlroot Mound',at:[.7,.3],rx:7,ry:4.5,H:38,top:.25,den:'gnarlroot'},
    {k:'bowl',name:'Thornmere Bog',at:[.3,.72],rx:6,ry:4,D:20},
    {k:'gully',name:'Thorn Gully',at:[.25,.25],ax:'x',len:12,wid:2,D:18,dwell:'thornrat'}]},
  // (v1.63.0) the six gap regions (js/regions5.js)
  crags:{auto:[ // Eaglecrest Crags: the roc's crag, a lower bluff, a gully between them
    {k:'hill',name:'Eagle Crag',at:[.7,.3],rx:6.5,ry:4,H:44,top:.2,bank:{ax:'y',at:.3},style:'stone',den:'skyclaw'},
    {k:'hill',name:'Slate Bluff',at:[.25,.72],rx:6,ry:3.5,H:34,top:.2,style:'stone'},
    {k:'gully',name:'Goat Gully',at:[.3,.25],ax:'x',len:12,wid:2,D:18,style:'stone',dwell:'cliffgoat'}]},
  glen:{auto:[ // Hollowbrook Glen: the brook, the Keeper's mossy hollow, a ferny bank
    {k:'gully',name:'Hollow Brook',at:[.5,.3],ax:'y',len:14,wid:2,D:14,water:1,dwell:'brookotter'},
    {k:'bowl',name:'Mossy Hollow',at:[.72,.72],rx:6,ry:4,D:20,den:'glenkeeper'},
    {k:'hill',name:'Fern Bank',at:[.2,.7],rx:5.5,ry:3.5,H:24,top:.3}]},
  marsh:{auto:[ // Reedwater Marsh: the Hag's sunken pool, a reedy channel, a dry knoll
    {k:'bowl',name:'Hag Pool',at:[.65,.6],rx:6,ry:4,D:20,den:'marshhag'},
    {k:'gully',name:'Reed Channel',at:[.3,.25],ax:'x',len:12,wid:2,D:12,water:1,dwell:'marshleech'},
    {k:'hill',name:'Dry Knoll',at:[.22,.72],rx:5,ry:3.5,H:22,top:.3}]},
  orchard:{auto:[ // Old Orchard: the Elder's hill, an old terrace, a cider hollow
    {k:'hill',name:'Elder Hill',at:[.7,.3],rx:7,ry:4.5,H:32,top:.3,den:'gnarledelder'},
    {k:'hill',name:'Old Terrace',at:[.25,.25],rx:6,ry:3.5,H:24,top:.35,bank:{ax:'x',at:.3},style:'stone'},
    {k:'bowl',name:'Cider Hollow',at:[.3,.72],rx:5.5,ry:3.5,D:18}]},
  canyon:{auto:[ // Redrock Canyon: the Tyrant's mesa, a dry wash, a red bluff
    {k:'hill',name:'Tyrant Mesa',at:[.7,.35],rx:7,ry:4.5,H:46,top:.4,bank:{ax:'y',at:.3},style:'stone',den:'canyontyrant'},
    {k:'gully',name:'Dry Wash',at:[.3,.7],ax:'x',len:16,wid:2,D:22,style:'stone',dwell:'redscorpion'},
    {k:'hill',name:'Red Bluff',at:[.22,.25],rx:5.5,ry:3.5,H:34,top:.25,style:'stone'}]},
  barrens:{auto:[ // Ashfall Barrens: an ash crater where the Colossus stands, a cinder ridge, a cracked trench
    {k:'bowl',name:'Ash Crater',at:[.65,.55],rx:6.5,ry:4.5,D:28,style:'obsidian',den:'ashcolossus'},
    {k:'hill',name:'Cinder Ridge',at:[.22,.25],rx:6,ry:3,H:32,top:.2,bank:{ax:'y',at:.3},style:'obsidian'},
    {k:'gully',name:'Cracked Trench',at:[.25,.75],ax:'x',len:12,wid:2,D:20,style:'obsidian',dwell:'cinderlizard'}]},
  dusk:{auto:[ // Duskwood: a shadow hollow where the Hollow King waits, ridges of roots, a dark brook
    {k:'bowl',name:'Shadow Hollow',at:[.7,.35],rx:6,ry:4.5,D:32,den:'hollowking'},
    {k:'hill',name:'Root Ridge',at:[.25,.25],rx:6.5,ry:2.8,H:28,top:.25,bank:{ax:'y',at:.12},roots:1},
    {k:'hill',name:'Root Ridge',at:[.25,.72],rx:6,ry:2.6,H:26,top:.25,bank:{ax:'y',at:.12},roots:1},
    {k:'gully',name:'Dark Brook',at:[.7,.78],ax:'x',len:16,wid:2,D:18,water:1,dwell:'duskweaver'}]}};
const lvTile=(L,x,y)=>{const tx=Math.floor(x/TILE),ty=Math.floor(y/TILE);return !(tx>=0&&ty>=0&&tx<L.W&&ty<L.Hh)?-1:ty*L.W+tx;}; // NaN-safe
// height of the ground at a world point: the tile's four corners, blended
function lvH(L,x,y){const i=lvTile(L,x,y);if(i<0)return 0;const k=i*4,a=L.hc[k],b=L.hc[k+1],c=L.hc[k+2],d=L.hc[k+3];if(!(a||b||c||d))return 0;
  const u=x/TILE-Math.floor(x/TILE),v=y/TILE-Math.floor(y/TILE);return (a*(1-u)+b*u)*(1-v)+(d*(1-u)+c*u)*v;}
// one tile step (orthogonal): the shared edge must meet (no bank between them)
function lvStep(L,a,b,dx,dy){const A=a*4,B=b*4,h=L.hc;
  if(dx>0)return Math.abs(h[A+1]-h[B])<=LV_STEP&&Math.abs(h[A+2]-h[B+3])<=LV_STEP;
  if(dx<0)return Math.abs(h[A]-h[B+1])<=LV_STEP&&Math.abs(h[A+3]-h[B+2])<=LV_STEP;
  if(dy>0)return Math.abs(h[A+3]-h[B])<=LV_STEP&&Math.abs(h[A+2]-h[B+1])<=LV_STEP;
  if(dy<0)return Math.abs(h[A]-h[B+3])<=LV_STEP&&Math.abs(h[A+1]-h[B+2])<=LV_STEP;return true;}
// from tile a to a neighbouring tile b (a diagonal must work both ways round the corner)
function lvTiles(L,a,b){if(a===b||a<0||b<0)return true;const W=L.W,ax=a%W,ay=(a/W)|0,bx=b%W,by=(b/W)|0,dx=bx-ax,dy=by-ay;
  if(Math.abs(dx)>1||Math.abs(dy)>1)return true;
  if(!dx||!dy)return lvStep(L,a,b,dx,dy);
  const m1=ay*W+bx,m2=by*W+ax;return lvStep(L,a,m1,dx,0)&&lvStep(L,m1,b,0,dy)&&lvStep(L,a,m2,0,dy)&&lvStep(L,m2,b,dx,0);}
// both at about the same height (for melee)
function lvReach(a,b){const L=Z&&Z.lvd;if(!L||!a||!b)return true;return Math.abs(lvH(L,a.x,a.y)-lvH(L,b.x,b.y))<16;}
// screen point -> the frontmost ground you see there (on a bank's face: the ground at its foot)
function lvUnproj(sx,sy){const L=Z.lvd;let prev=null;
  for(let h=L.H;h>=(L.lo||0);h-=2){const w=unprojFlat(sx,sy+h),g=lvH(L,w.x,w.y);if(Math.abs(g-h)<=1.6)return w;if(g>h+1.6&&prev)return prev;prev=w;}
  return unprojFlat(sx,sy);}

/* ---- walking: the body may not hang over a bank ---- */
let LV_FROM=-1,LV_WALK=0;
{const _cs=canStand;canStand=function(x,y,r){if(!_cs(x,y,r))return false;const L=Z&&Z.lvd;if(!L||LV_FROM<0)return true;
  for(const [ox,oy] of [[-r,-r],[r,-r],[-r,r],[r,r]])if(!lvTiles(L,LV_FROM,lvTile(L,x+ox,y+oy)))return false;return true;};}
{const _me=moveEnt;moveEnt=function(e,dx,dy,r){const L=Z&&Z.lvd;if(!L)return _me.apply(this,arguments);const was=LV_FROM;LV_FROM=lvTile(L,e.x,e.y);try{return _me.apply(this,arguments);}finally{LV_FROM=was;}};}
// a straight walk: every small step must be allowed (only while walking: arrows and spells see over banks)
function lvWalkLine(x0,y0,x1,y1,r,step){const L=Z.lvd,d=Math.hypot(x1-x0,y1-y0),n=Math.max(1,Math.ceil(d/step));let prev=lvTile(L,x0,y0);const was=LV_FROM;
  try{for(let k=1;k<=n;k++){const x=x0+(x1-x0)*k/n,y=y0+(y1-y0)*k/n;LV_FROM=prev;if(!canStand(x,y,r))return false;prev=lvTile(L,x,y);}return true;}finally{LV_FROM=was;}}
{const _cl=clearLine;clearLine=function(x0,y0,x1,y1){if(!LV_WALK||!(Z&&Z.lvd))return _cl.apply(this,arguments);return lvWalkLine(x0,y0,x1,y1,PR,6);};}
{const _pt=pathTo;pathTo=function(){LV_WALK++;try{return _pt.apply(this,arguments);}finally{LV_WALK--;}};}
if(typeof mobClear==='function'){const _mc=mobClear;mobClear=function(x0,y0,x1,y1,r){if(!(Z&&Z.lvd))return _mc.apply(this,arguments);return lvWalkLine(x0,y0,x1,y1,r,8);};}

/* ---- building a region's land from its design ---- */
const LV_STY={earth:0,rock:3,snow:4,ice:5,marsh:6,crystal:7,obsidian:8};
// cliff faces by style: [face toward the bottom-left top, its foot, face toward the bottom-right top, its foot, floor tint]
const LV_FACE={3:['#9a8f80','#5e564c','#857b6d','#4a433b','rgba(40,30,20,.22)'],4:['#f4f8ff','#a8bed6','#dfe8f4','#8ea6c2','rgba(120,150,190,.18)'],
  5:['#cfeeff','#7fb8dc','#b2def6','#5f9cc8','rgba(60,120,170,.2)'],6:['#5a5030','#2e2a18','#4c4428','#262212','rgba(20,30,10,.35)'],
  7:['#c4a8f4','#7a5ab8','#a88ae0','#5e4096','rgba(90,50,150,.22)'],8:['#3a2e34','#1a1216','#2e2428','#140c10','rgba(60,10,0,.3)']};
const lvSmooth=t=>t<=0?0:t>=1?1:t*t*(3-2*t);
function lvHill(h,x,y){const dx=(x-h.cx)/h.rx,dy=(y-h.cy)/h.ry,d=Math.hypot(dx,dy);if(d>=1)return 0;if(d<=h.top)return h.H;return h.H*lvSmooth((1-d)/(1-h.top));}
function lvReachable(z,L){const W=z.w,H=z.h,N=W*H,seen=new Uint8Array(N),free=i=>!BLOCK[z.t[i]];let start=-1;
  const sp=z.spawn||(z.portals[0]&&{x:z.portals[0].x,y:z.portals[0].y});
  if(sp){const tx=Math.floor(sp.x/TILE),ty=Math.floor(sp.y/TILE);for(let r=0;r<6&&start<0;r++)for(let dy=-r;dy<=r&&start<0;dy++)for(let dx=-r;dx<=r;dx++){const x=tx+dx,y=ty+dy;if(x>0&&y>0&&x<W-1&&y<H-1&&free(y*W+x)){start=y*W+x;break;}}}
  if(start<0)return seen;const q=[start];seen[start]=1;
  while(q.length){const i=q.pop(),x=i%W,y=(i/W)|0;for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=W||ny>=H)continue;const j=ny*W+nx;
    if(seen[j]||!free(j))continue;if(L&&!lvStep(L,i,j,dx,dy))continue;seen[j]=1;q.push(j);}}
  return seen;}
function lvGen(z){z.lvd=null;const des=LV_DESIGNS[z.id];if(!des)return;
  const W=z.w,H=z.h,hc=new Float32Array(W*H*4),L={W,Hh:H,H:0,lo:0,hc,hills:[],nodes:[],feats:[],wet:new Uint8Array(W*H),log:new Uint8Array(W*H),sand:new Uint8Array(W*H),arch:new Uint8Array(W*H),ford:new Uint8Array(W*H),style:new Uint8Array(W*H),used:new Uint8Array(W*H),crop:new Uint8Array(W*H),stone:new Uint8Array(W*H),dens:[],dwell:[]};
  for(const h of des.hills||[])lvAddHill(z,L,h);
  if(des.brook)lvBrook(z,L,des.brook);
  for(const b of des.bowls||[])lvBowl(z,L,b);
  for(const b of des.gullies||[])lvGully(z,L,b);
  if(des.terraces)lvTerraces(z,L,des.terraces);
  if(des.auto)lvAuto(z,L,des.auto);
  if(!L.feats.length)return;
  z.lvd=L;lvMini(z);}
function lvAddHill(z,L,h){const W=L.W,H=L.Hh,hc=L.hc,own=[];let x0=1e9,y0=1e9,x1=-1,y1=-1;
  for(let ty=Math.max(1,Math.floor(h.cy-h.ry));ty<=Math.min(H-2,Math.ceil(h.cy+h.ry));ty++)for(let tx=Math.max(1,Math.floor(h.cx-h.rx));tx<=Math.min(W-2,Math.ceil(h.cx+h.rx));tx++){
    // the bank: past this line the hill is cut off sharply (its face looks toward you)
    if(h.bank){const off=h.bank.ax==='y'?(ty+.5-h.cy)/h.ry:(tx+.5-h.cx)/h.rx,cross=h.bank.ax==='y'?(tx+.5-h.cx)/h.rx:(ty+.5-h.cy)/h.ry;
      // a pass: a gap in the bank where the hill slopes down gently, so nobody walks all the way round
      const inPass=h.bank.pass&&cross>=h.bank.pass[0]&&cross<=h.bank.pass[1];if(off>h.bank.at&&!inPass)continue;}
    const c=[lvHill(h,tx,ty),lvHill(h,tx+1,ty),lvHill(h,tx+1,ty+1),lvHill(h,tx,ty+1)];if(!(c[0]||c[1]||c[2]||c[3]))continue;
    const i=(ty*W+tx)*4;for(let k=0;k<4;k++)hc[i+k]=Math.max(hc[i+k],c[k]);own.push(ty*W+tx);x0=Math.min(x0,tx);y0=Math.min(y0,ty);x1=Math.max(x1,tx);y1=Math.max(y1,ty);}
  if(!own.length)return null;L.H=Math.max(L.H,h.H);
  const hill={...h,tiles:own,x:x0,y:y0,w:x1-x0+1,hh:y1-y0+1};L.hills.push(hill);L.feats.push(hill);
  if(h.sand||h.style==='sand')for(const i of own)L.sand[i]=1;if(h.style==='stone')for(const i of own)L.stone[i]=1;if(LV_STY[h.style])for(const i of own)L.style[i]=LV_STY[h.style];
  // the old oak on the top (a tree tile, so nobody walks through it); the chieftain's den beside it
  if(h.oak){const [ox,oy]=h.oak;z.t[oy*W+ox]=2;z.objs.push({x:(ox+.5)*TILE,y:(oy+.5)*TILE,kind:'tree',v:1,sc:1.75,oak:1});}
  if(h.den)L.dens.push({x:(h.den[0]+.5)*TILE,y:(h.den[1]+.5)*TILE,mob:h.den[2]});return hill;}
// mark a piece's tiles with its style (the faces and floor take the look of the land)
function lvStyle(L,tiles,st){for(const i of tiles){if(st==='sand')L.sand[i]=1;else if(st==='stone')L.stone[i]=1;else if(LV_STY[st])L.style[i]=LV_STY[st];}}

/* ---- lvAuto: fit each designed piece near its place on the map ---- */
function lvAuto(z,L,specs){const W=z.w,H=z.h,snap=()=>({hc:L.hc.slice(),wet:L.wet.slice(),ramp:L.ramp?L.ramp.slice():null,log:L.log.slice(),sand:L.sand.slice(),style:L.style.slice(),arch:L.arch.slice(),ford:L.ford.slice(),stone:L.stone.slice(),crop:L.crop.slice(),
    t:z.t.slice(),objs:z.objs.slice(),feats:L.feats.length,hills:L.hills.length,dens:L.dens.length,dwell:L.dwell.length,lo:L.lo,Hm:L.H});
  const back=S=>{L.hc.set(S.hc);L.wet.set(S.wet);if(S.ramp)L.ramp.set(S.ramp);L.log.set(S.log);L.sand.set(S.sand);L.style.set(S.style);L.arch.set(S.arch);L.ford.set(S.ford);L.stone.set(S.stone);L.crop.set(S.crop);z.t.set(S.t);z.objs=S.objs;
    L.feats.length=S.feats;L.hills.length=S.hills;L.dens.length=S.dens;L.dwell.length=S.dwell;L.lo=S.lo;L.H=S.Hm;};
  L.ramp=L.ramp||new Uint8Array(W*H);const before=lvReachable(z,null);
  const near=(x,y)=>{for(const p of z.portals)if(Math.abs(p.x/TILE-x)<5&&Math.abs(p.y/TILE-y)<5)return true;for(const n of z.npcs)if(Math.abs(n.x/TILE-x)<3&&Math.abs(n.y/TILE-y)<3)return true;
    if(z.spawn&&Math.abs(z.spawn.x/TILE-x)<4&&Math.abs(z.spawn.y/TILE-y)<4)return true;for(const b of z.buildings)if(x>=b.x-2&&x<b.x+b.w+2&&y>=b.y-2&&y<b.y+b.h+2)return true;return false;};
  const bad=i=>{const x=i%W,y=(i/W)|0;return x<2||y<2||x>W-3||y>H-3||z.t[i]===3||z.t[i]===1||z.t[i]===6||L.used[i]||near(x,y)||L.hc[i*4]||L.wet[i];};L.bad=bad;
  for(const sp of specs){const cx0=Math.round(sp.at[0]*W),cy0=Math.round(sp.at[1]*H);const cand=[];
    for(let dy=-26;dy<=26;dy++)for(let dx=-26;dx<=26;dx++)cand.push([dx,dy]);cand.sort((a,b)=>(a[0]*a[0]+a[1]*a[1])-(b[0]*b[0]+b[1]*b[1]));
    // the piece's box, to rule out a place quickly before building it there
    const rx=sp.k==='gully'?(sp.ax==='x'?(sp.len>>1)+4:(sp.wid>>1)+1):sp.k==='shelves'?0:Math.ceil(sp.rx)+(sp.k==='bowl'?1:0),ry=sp.k==='gully'?(sp.ax==='y'?(sp.len>>1)+4:(sp.wid>>1)+1):sp.k==='shelves'?0:Math.ceil(sp.ry)+(sp.k==='bowl'?1:0);
    const box=(cx,cy)=>{if(sp.k==='shelves'){const [w,h]=sp.steps[0];return [cx,cy,cx+w-1,cy+h+3];}return [cx-rx,cy-ry,cx+rx,cy+ry];};
    let tries=0;
    for(const [dx,dy] of cand){const [bx0,by0,bx1,by1]=box(cx0+dx,cy0+dy);if(bx0<2||by0<2||bx1>W-3||by1>H-3)continue;
      let clear=true;for(let y=by0;y<=by1&&clear;y++)for(let x=bx0;x<=bx1;x++){const i=y*W+x,v=z.t[i];if(L.used[i]||v===3||(sp.k!=='gully'&&(v===1||v===6))){clear=false;break;}}
      if(!clear)continue;if(++tries>120)break;
      const S=snap(),piece=lvBuild(z,L,sp,cx0+dx,cy0+dy);if(!piece){back(S);continue;}
      // its ground: inside the map, no water, no road (a ravine may cross one on a bridge), away from gates, people, buildings and other pieces
      let ok=true;for(const i of piece.core){const x=i%W,y=(i/W)|0;if(x<2||y<2||x>W-3||y>H-3||S.t[i]===3||L.used[i]||near(x,y)||(!piece.road&&(S.t[i]===1||S.t[i]===6))){ok=false;break;}}
      if(ok){const before=lvReachable(z,null),after=lvReachable(z,L),skip=piece.lava?new Set(piece.core.filter(i=>L.wet[i]===1)):null; // lava is not meant to be walked into
        for(let i=0;i<before.length;i++)if(before[i]&&!after[i]&&!BLOCK[z.t[i]]&&!(skip&&skip.has(i))){ok=false;break;}}
      if(!ok){back(S);continue;}
      for(const i of piece.core){const x=i%W,y=(i/W)|0;for(let yy=y-2;yy<=y+2;yy++)for(let xx=x-2;xx<=x+2;xx++)if(xx>=0&&yy>=0&&xx<W&&yy<H)L.used[yy*W+xx]=1;}
      break;}}}
// build one piece at (cx,cy); returns its core tiles (or null if it does not fit the map)
function lvBuild(z,L,sp,cx,cy){const W=z.w,H=z.h;
  if(sp.k==='hill'){const h=lvAddHill(z,L,{...sp,cx:cx+.5,cy:cy+.5,den:sp.den?[cx,cy,sp.den]:null});if(!h)return null;if(sp.den)lvClear(z,cy*W+cx);return {core:h.tiles};}
  if(sp.k==='bowl'){if(cx-sp.rx-5<1||cy-sp.ry-5<1||cx+sp.rx+2>W-2||cy+sp.ry+2>H-2)return null;
    // two paths down: from the north and from the west, where the walls face you
    const inside=(x,y)=>Math.hypot((x-cx)/sp.rx,(y-cy)/sp.ry)<=1;let top=cy,left=cx;while(inside(cx-1,top-1)&&inside(cx,top-1))top--;while(inside(left-1,cy-1)&&inside(left-1,cy))left--;
    let bot=cy;while(inside(cx-1,bot+1)&&inside(cx,bot+1))bot++;
    const free=(x0,y0,x1,y1)=>{for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)if(!L.bad||L.bad(y*W+x))return false;return true;};
    const ramps=[[cx-1,top-3,cx,top-1,'s'],[left-3,cy-1,left-1,cy,'e']];if(sp.ry>=4&&free(cx-1,bot+1,cx,bot+4))ramps.push([cx-1,bot+1,cx,bot+3,'n']); // a third way down on the bigger ones, where there is room
    const b={...sp,cx:cx+.5,cy:cy+.5,ramps,den:sp.den?[cx,cy,sp.den]:null};
    const n0=L.feats.length;lvBowl(z,L,b);const f=L.feats[n0];if(sp.style)lvStyle(L,f.tiles,sp.style);
    if(sp.dwell)L.dwell.push({mob:sp.dwell,v:4,feat:f});return {core:f.tiles};}
  if(sp.k==='gully'){const ax=sp.ax,len=sp.len,wid=sp.wid,x0=ax==='x'?cx-(len>>1):cx-(wid>>1),y0=ax==='x'?cy-(wid>>1):cy-(len>>1),x1=ax==='x'?x0+len-1:x0+wid-1,y1=ax==='x'?y0+wid-1:y0+len-1;
    if(x0-4<1||y0-4<1||x1+4>W-2||y1+4>H-2)return null;
    // a road may cross only partway along and across the whole width (so the bridge spans the drop on both sides)
    {const along=ax==='x'?[x0,x1]:[y0,y1];for(let a=along[0];a<=along[1];a++){let n=0;for(let b=0;b<wid;b++){const x=ax==='x'?a:x0+b,y=ax==='x'?y0+b:a,v=z.t[y*W+x];if(v===1||v===6)n++;}
      if(n&&(n<wid||a<along[0]+3||a>along[1]-3))return null;}}
    const tiles=new Set(),D=sp.D,hc=L.hc,water=!!sp.water;let road=false;
    for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const i=y*W+x;if(z.t[i]===1||z.t[i]===6){L.wet[i]=2;road=true;tiles.add(i);continue;} // the road crosses on a bridge
      lvClear(z,i);for(let k=0;k<4;k++)hc[i*4+k]=-D;L.wet[i]=water?1:3;tiles.add(i);}
    // a slope down at each end (not into lava)
    if(!sp.lava){const rps=ax==='x'?[[x0-3,y0,x0-1,y1,'e'],[x1+1,y0,x1+3,y1,'w']]:[[x0,y0-3,x1,y0-1,'s'],[x0,y1+1,x1,y1+3,'n']];
      for(const rp of rps){let bad=false;for(let y=rp[1];y<=rp[3];y++)for(let x=rp[0];x<=rp[2];x++)if(z.t[y*W+x]===3||z.t[y*W+x]===1||z.t[y*W+x]===6)bad=true;if(bad)continue;
        for(let y=rp[1];y<=rp[3];y++)for(let x=rp[0];x<=rp[2];x++){lvClear(z,y*W+x);if(water)L.ford[y*W+x]=1;}lvRampSet(L,rp,D,tiles,sp.style&&sp.style!=='earth'?3:1);}}
    // a long one gets a way across in the middle, at the land's level (not over lava, not next to a road bridge)
    if(len>=12&&!sp.lava){const m=(ax==='x'?x0:y0)+(len>>1);let clear=true;for(let a=m-3;a<=m+3;a++)for(let b=0;b<wid;b++){const x=ax==='x'?a:x0+b,y=ax==='x'?y0+b:a;if(L.wet[y*W+x]===2)clear=false;}
      if(clear)for(let b=0;b<wid;b++){const x=ax==='x'?m:x0+b,y=ax==='x'?y0+b:m,i=y*W+x;for(let k=0;k<4;k++)hc[i*4+k]=0;L.wet[i]=2;L.arch[i]=water?2:1;}}
    lvBehind(L,tiles);L.lo=Math.min(L.lo,-D);if(water){L.brookD=L.brookD||D;if(sp.lava)L.lava=1;}
    const f={name:sp.name,tiles:[...tiles],gully:sp};L.feats.push(f);if(sp.style)lvStyle(L,f.tiles,sp.style);
    if(sp.dwell)L.dwell.push({mob:sp.dwell,v:water?1:3,feat:f});return {core:[...tiles],road,lava:!!sp.lava};}
  if(sp.k==='shelves'){const x0=cx,y0=cy,st=sp.steps;const w0=st[0][0],h0=st[0][1];if(x0<2||y0<2||x0+w0+1>W-2||y0+h0+4>H-2)return null;
    const shelves=st.map(([w,h,Ht])=>[x0,y0,x0+w-1,y0+h-1,Ht]),ramps=[];
    // steps up the south face of each shelf, from the one below
    // steps up the south face of each shelf and, where there is room, up its east face too
    const roomE=(k,my)=>{if(k)return true;for(let y=my;y<=my+1;y++)for(let x=x0+st[0][0];x<=x0+st[0][0]+3;x++)if(!L.bad||L.bad(y*W+x))return false;return true;};
    st.forEach(([w,h,Ht],k)=>{const mx=x0+Math.floor(w/2)-1,my=y0+Math.floor(h/2)-1,from=k?st[k-1][2]:0;ramps.push([mx,y0+h,mx+1,y0+h+2,'n',from,Ht]);if(roomE(k,my))ramps.push([x0+w,my,x0+w+2,my+1,'w',from,Ht]);});
    // the lowest shelf: steps up its north and west sides too, where there is room (no walking all the way round)
    // (sliding along the face to the free spot nearest its middle; 3 tiles of steps, or 2 where it is tight)
    {const [w,h,Ht]=st[0],room=(a,b,c,d)=>{for(let y=b;y<=d;y++)for(let x=a;x<=c;x++)if(!L.bad||L.bad(y*W+x))return false;return true;};
      const offs=[];for(let o=0;o<Math.max(w,h);o++){offs.push(o);if(o)offs.push(-o);}
      const side=(mk)=>{for(const n of [3,2])for(const o of offs){const rp=mk(o,n);if(rp)return ramps.push(rp);}};
      side((o,n)=>{const x=x0+Math.floor(w/2)-1+o;return x>=x0&&x+1<x0+w&&room(x,y0-n-1,x+1,y0-1)?[x,y0-n,x+1,y0-1,'s',0,Ht]:null;});
      side((o,n)=>{const y=y0+Math.floor(h/2)-1+o;return y>=y0&&y+1<y0+h&&room(x0-n-1,y,x0-1,y+1)?[x0-n,y,x0-1,y+1,'e',0,Ht]:null;});}
    const n0=L.feats.length;lvTerraces(z,L,{name:sp.name,shelves,ramps,den:sp.den?[x0+Math.floor(st[st.length-1][0]/2),y0+Math.floor(st[st.length-1][1]/2),sp.den]:null});
    const f=L.feats[n0];for(const i of f.tiles)L.crop[i]=0;L.stone.fill(0,0,0);for(const i of f.tiles)L.stone[i]=0;lvStyle(L,f.tiles,sp.style||'stone');
    return {core:f.tiles};}
  return null;}
// the brook: its bed lies D below the meadow; the bridge stays level with the road; a ford slopes down into the water
function lvBrook(z,L,b){const W=L.W,hc=L.hc,D=b.D,set=(i,a,bb,c,d)=>{hc[i*4]=a;hc[i*4+1]=bb;hc[i*4+2]=c;hc[i*4+3]=d;},tiles=new Set();
  for(const [x0,y0,x1,y1] of b.wet)for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const i=y*W+x;set(i,-D,-D,-D,-D);L.wet[i]=1;
    if(BLOCK[z.t[i]]){z.t[i]=0;z.objs=z.objs.filter(o=>!(Math.floor(o.x/TILE)===x&&Math.floor(o.y/TILE)===y));}tiles.add(i);}
  for(const [x0,y0,x1,y1] of b.bridge||[])for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const i=y*W+x;L.wet[i]=2;tiles.add(i);}
  for(const [x,y,dir] of b.fords||[]){const i=y*W+x;if(dir==='e')set(i,0,-D,-D,0);else set(i,-D,0,0,-D);tiles.add(i);L.ford[i]=1;}
  // the banks you can see belong to the ground on the far side: add the tiles behind the water so their faces are drawn
  for(const i of [...tiles]){if(L.wet[i]!==1)continue;for(const j of [i-1,i-W,i-W-1])if(j>=0)tiles.add(j);}
  L.lo=Math.min(L.lo,-D);
  if(b.canal)for(const i of tiles)if(L.wet[i]!==1&&L.wet[i]!==2)L.stone[i]=1;
  L.feats.push({name:b.name||'Brook',tiles:[...tiles],brook:b});L.brookD=D;if(b.dwellers)L.dwell.push({mob:b.dwellers,v:1});}
// a strip of ground sloping from the meadow's level down to -D (dir: the way it goes down)
// a strip of ground sloping from one height to another (dir: the way you walk from the first to the second; by default
// from the forest's level down to -D)
function lvRampSet(L,[x0,y0,x1,y1,dir,hA,hB],D,tiles,kind){const W=L.W,hc=L.hc,len=dir==='s'||dir==='n'?y1-y0+1:x1-x0+1,a=hA===undefined?0:hA,b=hB===undefined?-D:hB;
  const at=(cx,cy)=>{const t=dir==='s'?(cy-y0)/len:dir==='n'?(y1+1-cy)/len:dir==='e'?(cx-x0)/len:(x1+1-cx)/len;return a+(b-a)*Math.max(0,Math.min(1,t));};
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const i=y*W+x;hc[i*4]=at(x,y);hc[i*4+1]=at(x+1,y);hc[i*4+2]=at(x+1,y+1);hc[i*4+3]=at(x,y+1);tiles.add(i);L.ramp[i]=kind||1;}}
function lvClear(z,i){if(BLOCK[z.t[i]]){const W=z.w,x=i%W,y=(i/W)|0;z.t[i]=0;z.objs=z.objs.filter(o=>!(Math.floor(o.x/TILE)===x&&Math.floor(o.y/TILE)===y));}}
const lvBehind=(L,tiles)=>{for(const i of [...tiles]){if(L.hc[i*4]>=0&&L.hc[i*4+1]>=0&&L.hc[i*4+2]>=0&&L.hc[i*4+3]>=0)continue;for(const j of [i-1,i-L.W,i-L.W-1])if(j>=0)tiles.add(j);}};
// terraces: flat shelves of crop rows at rising heights, dry-stone walls where one drops to the next, earthen steps up
function lvTerraces(z,L,b){const W=L.W,hc=L.hc,tiles=new Set();L.ramp=L.ramp||new Uint8Array(W*L.Hh);
  for(const [x0,y0,x1,y1,H] of b.shelves)for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const i=y*W+x;for(let k=0;k<4;k++)hc[i*4+k]=Math.max(hc[i*4+k],H);L.crop[i]=1;L.stone[i]=1;tiles.add(i);L.H=Math.max(L.H,H);}
  for(const rp of b.ramps||[]){for(let y=rp[1];y<=rp[3];y++)for(let x=rp[0];x<=rp[2];x++){const i=y*W+x;lvClear(z,i);L.crop[i]=0;}lvRampSet(L,rp,0,tiles,2);}
  if(b.den){const [x,y,mob]=b.den;lvClear(z,y*W+x);L.dens.push({x:(x+.5)*TILE,y:(y+.5)*TILE,mob});}
  L.feats.push({name:b.name,tiles:[...tiles],terraces:b});}
// a sunken glade: a flat floor D below the forest inside an ellipse, steep earth walls, root paths down into it
function lvBowl(z,L,b){const W=L.W,hc=L.hc,D=b.D,tiles=new Set();L.ramp=L.ramp||new Uint8Array(W*L.Hh);
  for(let y=Math.floor(b.cy-b.ry);y<=Math.ceil(b.cy+b.ry);y++)for(let x=Math.floor(b.cx-b.rx);x<=Math.ceil(b.cx+b.rx);x++){
    if(Math.hypot((x+.5-b.cx)/b.rx,(y+.5-b.cy)/b.ry)>1)continue;const i=y*W+x;lvClear(z,i);for(let k=0;k<4;k++)hc[i*4+k]=-D; /* an open glade: no trees on its floor */L.wet[i]=4;tiles.add(i);}
  for(const rp of b.ramps||[]){for(let y=rp[1];y<=rp[3];y++)for(let x=rp[0];x<=rp[2];x++)lvClear(z,y*W+x);lvRampSet(L,rp,D,tiles,b.sand?3:1);}
  for(const [x,y] of b.clear||[])lvClear(z,y*W+x); // a tree that would wall a corner in
  lvBehind(L,tiles);L.lo=Math.min(L.lo,-D);if(b.sand)for(const i of tiles)L.sand[i]=1;
  if(b.den){const [x,y,mob]=b.den;lvClear(z,y*W+x);L.dens.push({x:(x+.5)*TILE,y:(y+.5)*TILE,mob});}
  L.feats.push({name:b.name,tiles:[...tiles],bowl:b});}
// a dry gully: a sunken strip of dead leaves and webs, a fallen log across it at the forest's level, a slope down at one end
function lvGully(z,L,b){const W=L.W,hc=L.hc,D=b.D,tiles=new Set();L.ramp=L.ramp||new Uint8Array(W*L.Hh);
  for(const [x0,y0,x1,y1] of b.dry)for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const i=y*W+x;lvClear(z,i);for(let k=0;k<4;k++)hc[i*4+k]=-D;L.wet[i]=3;tiles.add(i);}
  for(const [x0,y0,x1,y1] of b.log||[])for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const i=y*W+x;lvClear(z,i);for(let k=0;k<4;k++)hc[i*4+k]=0;L.wet[i]=2;L.log[i]=1;tiles.add(i);}
  for(const rp of b.ramps||[]){for(let y=rp[1];y<=rp[3];y++)for(let x=rp[0];x<=rp[2];x++)lvClear(z,y*W+x);lvRampSet(L,rp,D,tiles);}
  lvBehind(L,tiles);L.lo=Math.min(L.lo,-D);if(b.dwellers)L.dwell.push({mob:b.dwellers,v:3});
  L.feats.push({name:b.name,tiles:[...tiles],gully:b});}
// the minimap: higher ground a little lighter, banks dark
function lvMini(z){const L=z.lvd,m=z.mini&&z.mini.getContext&&z.mini.getContext('2d');if(!L||!m)return;const th=THEMES[z.D.theme]||{};
  for(let i=0;i<L.wet.length;i++)if(L.wet[i]){m.fillStyle=L.wet[i]===1?(th.water||'#3f7fb8'):L.wet[i]===2?(L.log[i]?'#6a4a2a':'#a07a4a'):L.wet[i]===3?(L.style[i]?LV_FACE[L.style[i]][3]:'#3e3020'):'rgba(10,20,10,.45)';m.fillRect(i%L.W,(i/L.W)|0,1,1);}
  for(let i=0;i<L.ford.length;i++)if(L.ford[i]||L.arch[i]){m.fillStyle=L.arch[i]?'#b0a898':'#c4b08a';m.fillRect(i%L.W,(i/L.W)|0,1,1);}
  for(const f of L.feats)if(f.terraces)for(const i of f.tiles){const a=L.hc[i*4]/L.H;m.fillStyle=`rgba(255,250,200,${(a*.35).toFixed(3)})`;m.fillRect(i%L.W,(i/L.W)|0,1,1);}
  for(const f of L.feats)if(f.bowl)for(const i of f.tiles)if(L.wet[i]===4){m.fillStyle=L.sand[i]?'rgba(120,70,20,.35)':'rgba(10,20,10,.45)';m.fillRect(i%L.W,(i/L.W)|0,1,1);}
  for(const h of L.hills)for(const i of h.tiles){const x=i%L.W,y=(i/L.W)|0,a=(L.hc[i*4]+L.hc[i*4+2])/2/L.H;m.fillStyle=`rgba(255,255,220,${(a*.32).toFixed(3)})`;m.fillRect(x,y,1,1);
    if(!lvStep(L,i,i+L.W,0,1)){m.fillStyle='rgba(60,40,20,.7)';m.fillRect(x,y+.7,1,.3);}if(!lvStep(L,i,i+1,1,0)){m.fillStyle='rgba(60,40,20,.7)';m.fillRect(x+.7,y,.3,1);}}}

/* ---- drawing: each hill is painted once into its own picture ---- */
const lvS=(x,y,h)=>({x:(x-y)*ISO,y:(x+y)*ISO/2-h});
// the affine map that takes three world points (flat picture) to three screen points (on the slope)
function lvAffine(p,s){const [x0,y0]=p[0],[x1,y1]=p[1],[x2,y2]=p[2],d=(x1-x0)*(y2-y0)-(x2-x0)*(y1-y0);if(!d)return null;
  const a=((s[1].x-s[0].x)*(y2-y0)-(s[2].x-s[0].x)*(y1-y0))/d,c=((s[2].x-s[0].x)*(x1-x0)-(s[1].x-s[0].x)*(x2-x0))/d,
        b=((s[1].y-s[0].y)*(y2-y0)-(s[2].y-s[0].y)*(y1-y0))/d,dd=((s[2].y-s[0].y)*(x1-x0)-(s[1].y-s[0].y)*(x2-x0))/d;
  return [a,b,c,dd,s[0].x-a*x0-c*y0,s[0].y-b*x0-dd*y0];}
function lvHex(c,amt){let r=0,g=0,b=0;const m=/^#([0-9a-f]{6})$/i.exec(c||'');if(m){const n=parseInt(m[1],16);r=n>>16;g=n>>8&255;b=n&255;}else{r=120;g=110;b=95;}
  const f=v=>Math.max(0,Math.min(255,Math.round(v+amt))).toString(16).padStart(2,'0');return '#'+f(r)+f(g)+f(b);}
function lvPaint(z,hill){const L=z.lvd,dpr=typeof DPR==='number'&&DPR?picDPR():1,T=TILE,hc=L.hc,W=L.W;
  let mnx=1e9,mny=1e9,mxx=-1e9,mxy=-1e9;
  for(const i of hill.tiles){const tx=i%W,ty=(i/W)|0;[[tx,ty],[tx+1,ty],[tx+1,ty+1],[tx,ty+1]].forEach(([cx,cy],k)=>{const s=lvS(cx*T,cy*T,hc[i*4+k]);mnx=Math.min(mnx,s.x);mxx=Math.max(mxx,s.x);mny=Math.min(mny,s.y-14);mxy=Math.max(mxy,s.y+30);});}
  mnx=Math.floor(mnx-4);mny=Math.floor(mny);const cw=Math.ceil(mxx+4-mnx),ch=Math.ceil(mxy-mny);
  const cv=document.createElement('canvas');cv.width=Math.ceil(cw*dpr);cv.height=Math.ceil(ch*dpr);const g=cv.getContext('2d');if(!g)return null;
  const base=()=>g.setTransform(dpr,0,0,dpr,-mnx*dpr,-mny*dpr);base();
  const th=THEMES[z.D.theme]||{},grass=(th.g&&th.g[0])||'#5e9b4a',R=seeded(4242+hill.tiles.length);
  const order=hill.tiles.slice().sort((a,b)=>(a%W+((a/W)|0))-(b%W+((b/W)|0)));
  // one triangle of a tile: the flat ground picture laid onto the slope, then lit or shaded by its tilt
  const tri=(P,S,shadeA)=>{const cx=(S[0].x+S[1].x+S[2].x)/3,cy=(S[0].y+S[1].y+S[2].y)/3;
    g.save();g.beginPath();S.forEach((p,k)=>{const ex=p.x+(p.x>cx?.5:-.5),ey=p.y+(p.y>cy?.5:-.5);k?g.lineTo(ex,ey):g.moveTo(ex,ey);});g.closePath();g.clip();
    const m=lvAffine(P,S);if(m&&z.img){g.transform(...m);const bx=Math.min(P[0][0],P[1][0],P[2][0])-2,by=Math.min(P[0][1],P[1][1],P[2][1])-2;g.drawImage(z.img,bx,by,T+4,T+4,bx,by,T+4,T+4);base();}
    else{g.fillStyle=grass;g.fill();}
    if(shadeA){g.fillStyle=shadeA>0?`rgba(255,250,215,${Math.min(.34,shadeA).toFixed(3)})`:`rgba(10,30,10,${Math.min(.38,-shadeA).toFixed(3)})`;g.fillRect(-1e5,-1e5,2e5,2e5);}
    g.restore();};
  for(const i of order){const tx=i%W,ty=(i/W)|0,X0=tx*T,Y0=ty*T,X1=X0+T,Y1=Y0+T,k=i*4,h=[hc[k],hc[k+1],hc[k+2],hc[k+3]];
    const C=[[X0,Y0],[X1,Y0],[X1,Y1],[X0,Y1]],S=C.map((p,j)=>lvS(p[0],p[1],h[j]));
    // light from the upper left: slopes facing down-left are lit, those facing down-right are in shade; the top is a touch brighter
    const dhx=((h[1]-h[0])+(h[2]-h[3]))/2/T,dhy=((h[3]-h[0])+(h[2]-h[1]))/2/T,sh=(dhx-dhy)*.95+(L.H?((h[0]+h[2])/2/L.H)*.07:0);
    const wt=L.wet[i],quad=(fill)=>{g.beginPath();S.forEach((p,j)=>j?g.lineTo(p.x,p.y):g.moveTo(p.x,p.y));g.closePath();g.fillStyle=fill;g.fill();};
    if(wt===1&&th.lava){ // lava: glowing, with dark crust
      quad(th.water||'#e8541a');quad('rgba(255,200,60,.25)');g.fillStyle='rgba(40,10,0,.55)';for(let q=0;q<3;q++){const p=lvS(X0+R()*T,Y0+R()*T,h[0]);g.beginPath();g.ellipse(p.x,p.y,4+R()*4,2,0,0,7);g.fill();}}
    else if(wt===1){ // shallow water you can wade: a sandy, pebbly bed shows through (ponds stay deep blue)
      quad(th.water||'#3f7fb8');quad('rgba(232,214,165,.34)');
      for(let q=0;q<4;q++){const p=lvS(X0+R()*T,Y0+R()*T,h[0]);g.fillStyle=q%2?'rgba(120,110,95,.55)':'rgba(175,165,140,.6)';g.beginPath();g.ellipse(p.x,p.y,2+R()*2.5,1.1+R(),0,0,7);g.fill();}const far=(L.wet[i-1]!==1?1:0)+(L.wet[i-W]!==1?1:0);if(far){quad(`rgba(10,30,60,${.16*far})`);}
      g.strokeStyle='rgba(255,255,255,.28)';g.lineWidth=1;for(let q=0;q<2;q++){const u=R(),v=R(),p=lvS(X0+u*T,Y0+v*T,h[0]);g.beginPath();g.moveTo(p.x-5,p.y);g.quadraticCurveTo(p.x,p.y-1.6,p.x+5,p.y);g.stroke();}}
    else if(wt===3&&L.style[i]){ // a dry ravine of rock, ice, crystal...: its floor in the land's colour, rubble on it
      const F=LV_FACE[L.style[i]];quad(F[3]);quad('rgba(0,0,0,.15)');for(let q=0;q<4;q++){const p=lvS(X0+R()*T,Y0+R()*T,h[0]);g.fillStyle=F[q%2?0:2];g.beginPath();g.ellipse(p.x,p.y,2.5+R()*2.5,1.4+R(),0,0,7);g.fill();}}
    else if(wt===3&&L.stone[i]){quad('#6a6458');quad('rgba(0,0,0,.18)');}
    else if(wt===3){ // the dry gully: dark earth and dead leaves, webs in the corners
      quad('#43361f');const far=(L.wet[i-1]!==3?1:0)+(L.wet[i-W]!==3?1:0);if(far)quad(`rgba(0,0,0,${.18*far})`);
      for(let q=0;q<5;q++){const p=lvS(X0+R()*T,Y0+R()*T,h[0]);g.fillStyle=['#7a5a2a','#8a6a30','#5a4220'][q%3];g.fillRect(p.x-1.5,p.y-.7,3,1.4);}
      if(R()<.45){const c=lvS(X0+T*(.3+R()*.4),Y0+T*(.3+R()*.4),h[0]);g.strokeStyle='rgba(235,235,235,.5)';g.lineWidth=.7;
        for(let a=0;a<6;a++){g.beginPath();g.moveTo(c.x,c.y);g.lineTo(c.x+Math.cos(a)*9,c.y+Math.sin(a)*4.5);g.stroke();}
        for(const rr of [3,6]){g.beginPath();g.ellipse(c.x,c.y,rr*1.5,rr*.75,0,0,7);g.stroke();}}}
    else if(wt===2&&L.log[i]){ // the fallen giant: a mossy log, bark lines along it
      tri([C[0],C[1],C[2]],[S[0],S[1],S[2]],0);tri([C[0],C[2],C[3]],[S[0],S[2],S[3]],0);
      const a=lvS(X0+T/2,Y0,0),b2=lvS(X0+T/2,Y1,0),nx=ISO*T*.5,ny=ISO*T*.25;
      g.beginPath();g.moveTo(a.x-nx+2,a.y-ny-12);g.lineTo(b2.x-nx+2,b2.y-ny-12);g.lineTo(b2.x+nx-2,b2.y+ny-12);g.lineTo(a.x+nx-2,a.y+ny-12);g.closePath();
      g.fillStyle='#6e4c2c';g.fill();g.strokeStyle='#3e2814';g.lineWidth=1;g.stroke();
      g.strokeStyle='rgba(40,24,10,.6)';for(const f of [-.5,0,.5]){g.beginPath();g.moveTo(a.x+nx*f,a.y+ny*f-12);g.lineTo(b2.x+nx*f,b2.y+ny*f-12);g.stroke();}
      g.fillStyle='rgba(110,160,70,.55)';for(let q=0;q<3;q++){const t=R(),p={x:a.x+(b2.x-a.x)*t-nx*.3,y:a.y+(b2.y-a.y)*t-ny*.3-13};g.beginPath();g.ellipse(p.x,p.y,4,2,0,0,7);g.fill();}
      // the log's side over the gully, and its broken end
      g.fillStyle='#4a321c';g.beginPath();g.moveTo(b2.x-nx+2,b2.y-ny-12);g.lineTo(b2.x+nx-2,b2.y+ny-12);g.lineTo(b2.x+nx-2,b2.y+ny);g.lineTo(b2.x-nx+2,b2.y-ny);g.closePath();
      if(L.log[i+W]!==1){g.fill();g.fillStyle='#b08a5a';g.beginPath();g.ellipse(b2.x,b2.y-6,nx*.85,7,0,0,7);g.fill();g.strokeStyle='#7a5a32';g.beginPath();g.ellipse(b2.x,b2.y-6,nx*.45,3.6,0,0,7);g.stroke();}}
    else if(wt===2&&L.arch[i]){ // a natural bridge in the land's stone, ice or crystal; over water, a causeway of flat stones
      const F=L.style[i]?LV_FACE[L.style[i]]:L.stone[i]?['#b0a48c','#6a6050','#9c907a']:['#a8a090','#6a6458','#958d7e'];
      quad(F[0]);g.strokeStyle='rgba(0,0,0,.22)';g.lineWidth=1;g.stroke();
      if(L.arch[i]===2){g.fillStyle=th.water||'#3f7fb8';for(const [u,v] of [[.5,.0],[.0,.5],[1,.5],[.5,1]]){const p=lvS(X0+u*T,Y0+v*T,0);g.globalAlpha=.55;g.beginPath();g.ellipse(p.x,p.y,6,3,0,0,7);g.fill();}g.globalAlpha=1;
        for(const [u,v] of [[.3,.3],[.7,.3],[.3,.7],[.7,.7]]){const p=lvS(X0+u*T,Y0+v*T,0);g.fillStyle=F[2];g.beginPath();g.ellipse(p.x,p.y,7,3.6,0,0,7);g.fill();g.strokeStyle='rgba(0,0,0,.3)';g.stroke();}}
      else for(let q=0;q<3;q++){const a=lvS(X0+R()*T,Y0+R()*T,0);g.strokeStyle='rgba(0,0,0,.25)';g.beginPath();g.moveTo(a.x,a.y);g.lineTo(a.x+R()*8-4,a.y+R()*4-2);g.stroke();}}
    else if(wt===2){ // the bridge: planks across, the road's way over the water
      quad('#9a7448');g.strokeStyle='rgba(60,38,18,.55)';g.lineWidth=1;for(let q=1;q<4;q++){const a=lvS(X0,Y0+q*T/4,0),b2=lvS(X1,Y0+q*T/4,0);g.beginPath();g.moveTo(a.x,a.y);g.lineTo(b2.x,b2.y);g.stroke();}
      // rails along both sides, a post at each corner
      g.strokeStyle='#5a3d22';g.lineWidth=2;for(const ex of [X0,X1])if(L.wet[ty*W+(ex===X0?tx-1:tx+1)]!==2){const a=lvS(ex,Y0,0),b2=lvS(ex,Y1,0);g.beginPath();g.moveTo(a.x,a.y-9);g.lineTo(b2.x,b2.y-9);g.stroke();
        for(const p of [a,b2]){g.beginPath();g.moveTo(p.x,p.y);g.lineTo(p.x,p.y-11);g.stroke();}}}
    else if(L.ford[i]){ // a ford: a gravel path down into the water, stepping stones along it
      tri([C[0],C[1],C[2]],[S[0],S[1],S[2]],sh);tri([C[0],C[2],C[3]],[S[0],S[2],S[3]],sh);quad('rgba(196,176,138,.82)');
      for(let q=0;q<7;q++){const u=R(),v=R(),p=lvS(X0+u*T,Y0+v*T,(h[0]*(1-u)+h[1]*u)*(1-v)+(h[3]*(1-u)+h[2]*u)*v);g.fillStyle=q%2?'#8c8270':'#a89c86';g.beginPath();g.ellipse(p.x,p.y,1.4+R()*1.6,.9+R()*.6,0,0,7);g.fill();}
      for(const [u,v] of [[.3,.3],[.7,.7]]){const p=lvS(X0+u*T,Y0+v*T,(h[0]*(1-u)+h[1]*u)*(1-v)+(h[3]*(1-u)+h[2]*u)*v);g.fillStyle='#d8d2c4';g.beginPath();g.ellipse(p.x,p.y,5,2.6,0,0,7);g.fill();g.strokeStyle='rgba(60,55,45,.5)';g.lineWidth=1;g.stroke();}}
    else{tri([C[0],C[1],C[2]],[S[0],S[1],S[2]],sh);tri([C[0],C[2],C[3]],[S[0],S[2],S[3]],sh);
      if(wt===4)quad(L.style[i]?LV_FACE[L.style[i]][4]:L.stone[i]?'rgba(30,25,20,.28)':L.sand[i]?'rgba(90,50,15,.18)':'rgba(5,15,5,.3)'); // a hollow's floor lies in shadow
      if(L.sand[i]){g.lineCap='round';for(let q=0;q<2;q++){const v=.25+q*.45+R()*.1,a=lvS(X0+2,Y0+v*T,h[0]*(1-v)+h[3]*v),b2=lvS(X1-2,Y0+v*T+3,h[1]*(1-v)+h[2]*v); // wind ripples
        g.strokeStyle='rgba(120,85,40,.32)';g.lineWidth=1.2;g.beginPath();g.moveTo(a.x,a.y);g.quadraticCurveTo((a.x+b2.x)/2,(a.y+b2.y)/2-2.5,b2.x,b2.y);g.stroke();
        g.strokeStyle='rgba(255,240,200,.35)';g.lineWidth=1;g.beginPath();g.moveTo(a.x,a.y-1.4);g.quadraticCurveTo((a.x+b2.x)/2,(a.y+b2.y)/2-3.9,b2.x,b2.y-1.4);g.stroke();}}
      if(L.crop[i]){ // crop rows: dark furrows with little green sprouts along them
        g.lineCap='round';for(let q=0;q<3;q++){const v=(q+.5)/3,a=lvS(X0+1,Y0+v*T,h[0]),b2=lvS(X1-1,Y0+v*T,h[1]);
          g.strokeStyle='rgba(70,48,22,.55)';g.lineWidth=3;g.beginPath();g.moveTo(a.x,a.y);g.lineTo(b2.x,b2.y);g.stroke();
          g.fillStyle=q%2?'#8fd060':'#a6dd6e';for(let k=0;k<3;k++){const f=(k+.3+R()*.4)/3,p={x:a.x+(b2.x-a.x)*f,y:a.y+(b2.y-a.y)*f};g.fillRect(p.x-1,p.y-3,2,3);g.fillRect(p.x-2.5,p.y-3.5,2,1.2);g.fillRect(p.x+.5,p.y-3.5,2,1.2);}}}
      if(L.ramp&&L.ramp[i]===2){ // earthen steps cut into the slope
        for(let q=1;q<4;q++){const v=q/4,ax=L.ramp&&(h[0]!==h[3])?0:1,a=ax?lvS(X0+v*T,Y0,h[0]*(1-v)+h[1]*v):lvS(X0,Y0+v*T,h[0]*(1-v)+h[3]*v),b2=ax?lvS(X0+v*T,Y1,h[3]*(1-v)+h[2]*v):lvS(X1,Y0+v*T,h[1]*(1-v)+h[2]*v);
          const cold=L.style[i]===4||L.style[i]===5,dark=L.style[i]===8,cry=L.style[i]===7; // steps take the land's colour
          g.strokeStyle=cold?'rgba(90,140,190,.75)':dark?'rgba(20,10,12,.8)':cry?'rgba(90,60,150,.75)':'rgba(90,62,30,.7)';g.lineWidth=2;g.beginPath();g.moveTo(a.x,a.y);g.lineTo(b2.x,b2.y);g.stroke();g.strokeStyle=cold?'rgba(255,255,255,.6)':'rgba(255,235,190,.25)';g.lineWidth=1;g.beginPath();g.moveTo(a.x,a.y-1.5);g.lineTo(b2.x,b2.y-1.5);g.stroke();}}
      else if(L.ramp&&L.ramp[i]===3){} // a sand slope: just the ripples
      else if(L.ramp&&L.ramp[i]){g.strokeStyle='rgba(60,38,18,.85)';g.lineWidth=2;g.lineCap='round'; // roots across the path down
        for(let q=0;q<2;q++){const v=.2+q*.45+R()*.15,a=lvS(X0,Y0+v*T,h[0]*(1-v)+h[3]*v),b2=lvS(X1,Y0+v*T,h[1]*(1-v)+h[2]*v);g.beginPath();g.moveTo(a.x,a.y);g.quadraticCurveTo((a.x+b2.x)/2+R()*4-2,(a.y+b2.y)/2+R()*4-3,b2.x,b2.y);g.stroke();}}
      if(hill.roots&&R()<.35){g.strokeStyle='rgba(70,45,20,.7)';g.lineWidth=1.6;const a=lvS(X0+R()*T,Y0+R()*T,(h[0]+h[2])/2);g.beginPath();g.moveTo(a.x-7,a.y);g.quadraticCurveTo(a.x,a.y-3,a.x+7,a.y+1);g.stroke();}}
    // banks: an earthen face where this tile drops sharply to the one in front (+y: down-left, +x: down-right)
    const face=(e0,e1,n0,n1,col,dark)=>{if(Math.max(h[e0]-n0,h[e1]-n1)<=LV_STEP)return;
      const A=C[e0],B=C[e1],pts=[lvS(A[0],A[1],h[e0]),lvS(B[0],B[1],h[e1]),lvS(B[0],B[1],n1),lvS(A[0],A[1],n0)];
      g.beginPath();pts.forEach((p,j)=>j?g.lineTo(p.x,p.y):g.moveTo(p.x,p.y));g.closePath();
      const gr=g.createLinearGradient(0,Math.min(pts[0].y,pts[1].y),0,Math.max(pts[2].y,pts[3].y));gr.addColorStop(0,col);gr.addColorStop(1,dark);g.fillStyle=gr;g.fill();
      // layers of earth, a stone or two and hanging roots
      g.strokeStyle='rgba(40,25,12,.35)';g.lineWidth=1;for(const f of [.45,.75]){const a=lvS(A[0],A[1],h[e0]*(1-f)+n0*f),b=lvS(B[0],B[1],h[e1]*(1-f)+n1*f);g.beginPath();g.moveTo(a.x,a.y+R()*2-1);g.lineTo(b.x,b.y+R()*2-1);g.stroke();}
      if(R()<.5){const f=.3+R()*.5,t=R(),p=lvS(A[0]+(B[0]-A[0])*t,A[1]+(B[1]-A[1])*t,(h[e0]*(1-f)+n0*f));g.fillStyle='#9a8f80';g.beginPath();g.ellipse(p.x,p.y,3.2,2.2,0,0,7);g.fill();}
      g.strokeStyle='rgba(70,45,20,.8)';g.lineWidth=1.1;for(let r=0;r<2;r++){const t=R(),top=lvS(A[0]+(B[0]-A[0])*t,A[1]+(B[1]-A[1])*t,h[e0]*(1-t)+h[e1]*t),len=6+R()*10;
        g.beginPath();g.moveTo(top.x,top.y+1);g.quadraticCurveTo(top.x+(R()*6-3),top.y+len*.5,top.x+(R()*4-2),top.y+len);g.stroke();}
      // the grass lip over the edge
      g.strokeStyle=lvHex(grass,26);g.lineWidth=3;g.lineCap='round';g.beginPath();g.moveTo(pts[0].x,pts[0].y+.5);g.lineTo(pts[1].x,pts[1].y+.5);g.stroke();
      g.strokeStyle=lvHex(grass,-30);g.lineWidth=1;for(let q=0;q<3;q++){const t=R(),p={x:pts[0].x+(pts[1].x-pts[0].x)*t,y:pts[0].y+(pts[1].y-pts[0].y)*t};g.beginPath();g.moveTo(p.x,p.y+1);g.lineTo(p.x+R()*2-1,p.y+4+R()*3);g.stroke();}};
    const dn=ty+1<L.Hh?i+W:-1,rt=tx+1<W?i+1:-1,nh=(j,e)=>j<0?0:hc[j*4+e];
    const wood=wt===2&&!L.log[i]&&!L.arch[i],stone=!!L.stone[i]&&!wood;
    if(L.style[i]){ // a cliff in the land's own look: rock, snow, ice, marsh mud, crystal or obsidian
      const F=LV_FACE[L.style[i]],stl=L.style[i];
      const cf=(e0,e1,n0,n1,side)=>{if(Math.max(h[e0]-n0,h[e1]-n1)<=LV_STEP)return;const A=C[e0],B=C[e1];
        const pts=[lvS(A[0],A[1],h[e0]),lvS(B[0],B[1],h[e1]),lvS(B[0],B[1],n1),lvS(A[0],A[1],n0)];g.beginPath();pts.forEach((p,j)=>j?g.lineTo(p.x,p.y):g.moveTo(p.x,p.y));g.closePath();
        const gr=g.createLinearGradient(0,Math.min(pts[0].y,pts[1].y),0,Math.max(pts[2].y,pts[3].y));gr.addColorStop(0,F[side?2:0]);gr.addColorStop(1,F[side?3:1]);g.fillStyle=gr;g.fill();
        g.save();g.clip();const hh=Math.max(h[e0]-n0,h[e1]-n1);
        if(stl===3||stl===8){g.strokeStyle=stl===8?'rgba(255,90,40,.35)':'rgba(30,24,18,.45)';g.lineWidth=1;for(let q=0;q<3;q++){const t=R(),a=lvS(A[0]+(B[0]-A[0])*t,A[1]+(B[1]-A[1])*t,h[e0]*(1-t)+h[e1]*t);g.beginPath();g.moveTo(a.x,a.y);g.lineTo(a.x+R()*4-2,a.y+hh*.35);g.lineTo(a.x+R()*4-2,a.y+hh*.75);g.stroke();}
          for(const f of [.4,.7]){const a=lvS(A[0],A[1],h[e0]*(1-f)+n0*f),b2=lvS(B[0],B[1],h[e1]*(1-f)+n1*f);g.strokeStyle='rgba(0,0,0,.2)';g.beginPath();g.moveTo(a.x,a.y);g.lineTo(b2.x,b2.y);g.stroke();}}
        else if(stl===4||stl===5){g.strokeStyle='rgba(255,255,255,.55)';g.lineWidth=1.2;for(let q=0;q<2;q++){const t=R(),a=lvS(A[0]+(B[0]-A[0])*t,A[1]+(B[1]-A[1])*t,h[e0]*(1-t)+h[e1]*t);g.beginPath();g.moveTo(a.x,a.y+3);g.lineTo(a.x+6,a.y+hh*.6);g.stroke();}
          g.fillStyle=stl===4?'rgba(255,255,255,.9)':'rgba(220,245,255,.85)';for(let q=0;q<4;q++){const t=(q+R())/4,a=lvS(A[0]+(B[0]-A[0])*t,A[1]+(B[1]-A[1])*t,h[e0]*(1-t)+h[e1]*t),ln=3+R()*6;g.beginPath();g.moveTo(a.x-1.6,a.y);g.lineTo(a.x+1.6,a.y);g.lineTo(a.x,a.y+ln);g.closePath();g.fill();}}
        else if(stl===7){g.strokeStyle='rgba(255,240,255,.6)';g.lineWidth=1;for(let q=0;q<3;q++){const t=R(),a=lvS(A[0]+(B[0]-A[0])*t,A[1]+(B[1]-A[1])*t,h[e0]*(1-t)+h[e1]*t);g.beginPath();g.moveTo(a.x,a.y);g.lineTo(a.x+4,a.y+hh*.3);g.lineTo(a.x-2,a.y+hh*.6);g.lineTo(a.x+3,a.y+hh*.9);g.stroke();}}
        else if(stl===6){g.fillStyle='rgba(20,30,10,.5)';for(let q=0;q<3;q++){const t=R(),a=lvS(A[0]+(B[0]-A[0])*t,A[1]+(B[1]-A[1])*t,h[e0]*(1-t)+h[e1]*t);g.fillRect(a.x-1,a.y,2,4+R()*hh*.6);}}
        g.restore();g.strokeStyle=stl===4||stl===5?'rgba(255,255,255,.95)':stl===8?'#4a3a40':stl===6?'#5a6a38':stl===7?'#e8d8ff':lvHex(grass,18);g.lineWidth=2.5;g.lineCap='round';g.beginPath();g.moveTo(pts[0].x,pts[0].y+.5);g.lineTo(pts[1].x,pts[1].y+.5);g.stroke();};
      const dn=ty+1<L.Hh?i+W:-1,rt=tx+1<W?i+1:-1,nh=(j,e)=>j<0?0:hc[j*4+e];cf(3,2,nh(dn,0),nh(dn,1),0);cf(2,1,nh(rt,3),nh(rt,0),1);continue;}
    if(L.sand[i]){ // a slip face of sand: pale at the crest, shadowed at the foot, streaks where sand has run down
      const sl=(e0,e1,n0,n1,side)=>{if(Math.max(h[e0]-n0,h[e1]-n1)<=LV_STEP)return;const A=C[e0],B=C[e1];
        const pts=[lvS(A[0],A[1],h[e0]),lvS(B[0],B[1],h[e1]),lvS(B[0],B[1],n1),lvS(A[0],A[1],n0)];g.beginPath();pts.forEach((p,j)=>j?g.lineTo(p.x,p.y):g.moveTo(p.x,p.y));g.closePath();
        const gr=g.createLinearGradient(0,Math.min(pts[0].y,pts[1].y),0,Math.max(pts[2].y,pts[3].y));gr.addColorStop(0,side?'#d8b676':'#e2c387');gr.addColorStop(1,side?'#9c7a48':'#b08c56');g.fillStyle=gr;g.fill();
        g.save();g.clip();g.strokeStyle='rgba(110,78,40,.28)';g.lineWidth=1;for(let q=0;q<3;q++){const t=R(),a=lvS(A[0]+(B[0]-A[0])*t,A[1]+(B[1]-A[1])*t,h[e0]*(1-t)+h[e1]*t);g.beginPath();g.moveTo(a.x,a.y);g.lineTo(a.x+(R()*2-1),a.y+8+R()*14);g.stroke();}g.restore();
        g.strokeStyle='rgba(255,244,210,.7)';g.lineWidth=1.5;g.lineCap='round';g.beginPath();g.moveTo(pts[0].x,pts[0].y);g.lineTo(pts[1].x,pts[1].y);g.stroke();};
      const dn=ty+1<L.Hh?i+W:-1,rt=tx+1<W?i+1:-1,nh=(j,e)=>j<0?0:hc[j*4+e];sl(3,2,nh(dn,0),nh(dn,1),0);sl(2,1,nh(rt,3),nh(rt,0),1);continue;}
    if(stone){ // dry-stone walls: grey courses of stone instead of earth
      const sface=(e0,e1,n0,n1)=>{if(Math.max(h[e0]-n0,h[e1]-n1)<=LV_STEP)return;const A=C[e0],B=C[e1],top0=h[e0],top1=h[e1];
        const pts=[lvS(A[0],A[1],top0),lvS(B[0],B[1],top1),lvS(B[0],B[1],n1),lvS(A[0],A[1],n0)];g.beginPath();pts.forEach((p,j)=>j?g.lineTo(p.x,p.y):g.moveTo(p.x,p.y));g.closePath();
        g.fillStyle=e0===3?'#a89a80':'#8c7f68';g.fill();g.save();g.clip();g.strokeStyle='rgba(60,50,38,.55)';g.lineWidth=1;
        const rows=Math.max(1,Math.round(Math.max(top0-n0,top1-n1)/7));for(let q=1;q<=rows;q++){const f=q/(rows+1),a=lvS(A[0],A[1],top0*(1-f)+n0*f),b2=lvS(B[0],B[1],top1*(1-f)+n1*f);g.beginPath();g.moveTo(a.x,a.y);g.lineTo(b2.x,b2.y);g.stroke();
          for(let k=0;k<4;k++){const t=(k+(q%2)*.5+.2)/4,p0={x:a.x+(b2.x-a.x)*t,y:a.y+(b2.y-a.y)*t};g.beginPath();g.moveTo(p0.x,p0.y);g.lineTo(p0.x,p0.y-(Math.max(top0-n0,top1-n1)/(rows+1)));g.stroke();}}
        g.restore();g.strokeStyle=lvHex(grass,24);g.lineWidth=2.5;g.lineCap='round';g.beginPath();g.moveTo(pts[0].x,pts[0].y+.5);g.lineTo(pts[1].x,pts[1].y+.5);g.stroke();};
      const dn=ty+1<L.Hh?i+W:-1,rt=tx+1<W?i+1:-1,nh=(j,e)=>j<0?0:hc[j*4+e];sface(3,2,nh(dn,0),nh(dn,1));sface(2,1,nh(rt,3),nh(rt,0));continue;}
    face(3,2,nh(dn,0),nh(dn,1),wood?'#7a5430':'#8a6a42',wood?'#4a3018':'#5a4128');   // the face toward the bottom-left
    face(2,1,nh(rt,3),nh(rt,0),wood?'#6a4828':'#76583a',wood?'#402a14':'#4a3420');}  // the face toward the bottom-right
  return {cv,x:mnx,y:mny,w:cw,h:ch,dpr};}
function drawFeat(f){const dpr=typeof DPR==='number'&&DPR?picDPR():1;if(!f.pic||f.pic.dpr!==dpr||f.pic.src!==Z.img){f.pic=lvPaint(Z,f);if(f.pic)f.pic.src=Z.img;}
  const p=f.pic;if(!p)return;if(p.x+p.w<camX-20||p.x>camX+VW+20||p.y+p.h<camY-20||p.y>camY+VH+20)return;ctx.drawImage(p.cv,p.x,p.y,p.w,p.h);}
// (v1.56.1) the land is part of the ground: drawn right after it, before anyone standing on it (js/render.js), so a
// slope never hides a hero walking round its edge
function drawLowLand(){const L=Z&&Z.lvd;if(!L)return;try{for(const f of L.feats)drawFeat(f);lvShimmer(L);}catch(e){}}
function drawCliff(){}
// a few glints drifting on the brook
function lvShimmer(L){if(!L.brookD||window.LITE)return;const W=L.W;ctx.fillStyle='rgba(255,255,255,.55)';
  for(let i=0;i<L.wet.length;i++){if(L.wet[i]!==1)continue;const x=i%W,y=(i/W)|0,ph=(x*7.3+y*3.1)%6.28,k=(now*.6+ph)%1;
    const p=lvS((x+.2+k*.6)*TILE,(y+.5+Math.sin(now+ph)*.25)*TILE,-L.brookD);if(p.x<camX-10||p.x>camX+VW+10||p.y<camY-10||p.y>camY+VH+10)continue;ctx.globalAlpha=Math.sin(k*3.14)*.8;ctx.fillRect(p.x-1.5,p.y-.5,3,1);}
  ctx.globalAlpha=1;}

/* ---- the brook: wading is slower, the near bank hides your feet, ripples round you ---- */
{const _me2=moveEnt;moveEnt=function(e,dx,dy,r){const L=Z&&Z.lvd;if(L&&L.brookD&&e){const i=lvTile(L,e.x,e.y);if(i>=0&&L.wet[i]===1){dx*=.62;dy*=.62;}}return _me2.call(this,e,dx,dy,r);};}
window.LV_IP=false;
{const _at=at;at=function(x,y,fn){const L=Z&&Z.lvd;if(!window.LV_IP||!L||!L.lo)return _at.apply(this,arguments);const i=lvTile(L,x,y);
  if(i<0||!(L.wet[i]===1||L.wet[i]===3||L.wet[i]===4))return _at.apply(this,arguments);
  const W=L.W,tx=i%W,ty=(i/W)|0,T=TILE,up=j=>j>=0&&L.hc[j*4]>L.hc[i*4]+LV_STEP;ctx.save();
  // only what shows above the near bank's edge (the bank toward the camera hides your feet)
  if(up(i+1)){const X=(tx+1)*T,a=lvS(X,-1e4,0),b=lvS(X,1e4,0);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.lineTo(b.x,b.y-1e5);ctx.lineTo(a.x,a.y-1e5);ctx.closePath();ctx.clip();}
  if(up(i+W)){const Y=(ty+1)*T,a=lvS(-1e4,Y,0),b=lvS(1e4,Y,0);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.lineTo(b.x,b.y-1e5);ctx.lineTo(a.x,a.y-1e5);ctx.closePath();ctx.clip();}
  try{_at.apply(this,arguments);if(L.wet[i]!==1)return;
    // the water round your legs
    const p=lvS(x,y,-L.brookD+3),w=13+Math.sin(now*4+x)*1.5;ctx.fillStyle='rgba(63,127,184,.5)';ctx.beginPath();ctx.ellipse(p.x,p.y,w,w*.42,0,0,7);ctx.fill();
    ctx.strokeStyle='rgba(255,255,255,.55)';ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(p.x,p.y,w+2,(w+2)*.42,0,0,7);ctx.stroke();}
  finally{ctx.restore();}};}

/* ---- a region gets its land when you enter it (after everything else has built it) ---- */
{const _ez=enterZone;enterZone=function(id){try{const z=getZone(id);if(z&&z.lvd===undefined)lvGen(z);}catch(e){console.warn('heights',e);}return _ez.apply(this,arguments);};}
// the Hopper Chieftain keeps its den on top of Chieftain's Knoll (its pack gathers round it)
{const _sm=spawnMob;spawnMob=function(type){const m=_sm.apply(this,arguments);try{const L=Z&&Z.lvd;if(!L||!m||!m.d)return m;
  // a boss keeps its den (the Hopper Chieftain on its knoll, the Wolf Alpha at the bottom of the Hollow)
  const den=L.dens.find(d=>d.mob===m.d.id);if(den){m.x=m.sx=den.x;m.y=m.sy=den.y;}
  // some live down in the land: the dewdrops in the brook, the web-spinners in the gully
  // (v1.60.2) at most four of a kind make their home there; the rest roam the region (a channel full of crabs is no fun)
  const dw=L.dwell.find(d=>d.mob===m.d.id&&mobs.filter(o=>o!==m&&o.d&&o.d.id===d.mob&&o.dwell).length<4);if(dw){m.dwell=1;const w=[];if(dw.feat){for(const i of dw.feat.tiles)if(L.wet[i]===dw.v&&!BLOCK[Z.t[i]])w.push(i);}else for(let i=0;i<L.wet.length;i++)if(L.wet[i]===dw.v&&!BLOCK[Z.t[i]])w.push(i);if(w.length){const i=w[Math.floor(Math.random()*w.length)];m.x=m.sx=(i%L.W+.5)*TILE;m.y=m.sy=(((i/L.W)|0)+.5)*TILE;}}}catch(e){}return m;};}

// (v1.60.1) a tap on a pond: too deep to wade, here is how to cross (only where some water can be waded)
if(typeof cv!=='undefined')cv.addEventListener('pointerdown',ev=>{try{const L=Z&&Z.lvd;if(!L||!L.brookD||L.lava||!P||P.dead||!running)return;
  const r=cv.getBoundingClientRect(),w=unproj(ev.clientX-r.left+camX,ev.clientY-r.top+camY),tx=Math.floor(w.x/TILE),ty=Math.floor(w.y/TILE);if(tx<0||ty<0||tx>=Z.w||ty>=Z.h)return;
  if(Z.t[ty*Z.w+tx]===3&&now>(LV_HINT.t||0)){LV_HINT.t=now+3;floatT(P.x,P.y-48,typeof LANG!=='undefined'&&LANG==='th'?'ลึกเกินไป ข้ามที่ท่าน้ำตื้นหรือสะพาน':'Too deep: wade at a ford or cross a bridge','#9fd8ff',12);}}catch(e){}});
const LV_HINT={t:0};
