"use strict";
/* ================= the four corner regions: boss skills and album pages (v1.61.1, see js/regions5.js) ================= */
if(typeof BOSS_SIG!=='undefined'){const around=(rng,x,y,r)=>{const a=rng()*6.283,d=r*(.4+.6*rng());return [x+Math.cos(a)*d,y+Math.sin(a)*d*.6];};
  Object.assign(BOSS_SIG,{
    bramblewarden:{name:'Thorn Snare',desc:'brambles burst from the ground under you and around you, holding you in place',
      run:(m,x,y,rng)=>{bsMark(m,x,y,70,1,m=>{bsHurt(m,1.2);bsCurse('stun',.8,m);});for(let i=0;i<2;i++){const [a,b]=around(rng,x,y,150);bsMark(m,a,b,60,1.3,m=>bsHurt(m,1));}}},
    harvestmatron:{name:'Chaff Storm',desc:'a whirl of golden chaff around her blinds anyone close',
      run:m=>bsZone(m,m.x,m.y,140,5,'#f0d080',m=>bsCurse('blind',2,m))},
    mistmother:{name:'Drowning Mist',desc:'a cold mist settles where you stand and slows everyone in it',
      run:(m,x,y)=>bsZone(m,x,y,120,6,'#b8d0e0',m=>{bsHurt(m,.35);if(P){P.slowUntil=now+1.5;P.slowK=.55;}})},
    gnarlroot:{name:'Root Quake',desc:'roots heave up in a ring around him and throw back anyone close',
      run:m=>bsMark(m,m.x,m.y,130,.9,m=>{bsHurt(m,1.5);bsShove(m,130);})}});}
if(typeof ALBUM!=='undefined')for(const p of [{id:'bramble',name:'Bramblewind Hills',zones:['bramble'],b:{vit:1,maxhp:60}},{id:'amber',name:'Amberfield Hollow',zones:['amber'],b:{luk:2}},
  {id:'mist',name:'Mistfall Vale',zones:['mist'],b:{maxsp:40,int:1}},{id:'thornmere',name:'Thornmere Wilds',zones:['thornmere'],b:{def:5}}])
  if(!ALBUM.some(a=>a.id===p.id))ALBUM.push(p);
if(typeof ZONE_BLURB!=='undefined')Object.assign(ZONE_BLURB,{bramble:'Windy hills of bramble between the Heights and the Meadow. Mind the boars in the hedges.',
  amber:'Golden fields in a hollow past the Farms. The harvest walks here, and so does its Matron.',
  mist:'A misty valley of reeds and lanterns west of the Heights. Things move in the mist.',
  thornmere:'A tangled wild of thorn and bog above Goldleaf Downs. Old Gnarlroot does not like visitors.'});
/* ---- (v1.63.0) the six gap regions: boss skills, album pages, blurbs ---- */
if(typeof BOSS_SIG!=='undefined'){const around=(rng,x,y,r)=>{const a=rng()*6.283,d=r*(.4+.6*rng());return [x+Math.cos(a)*d,y+Math.sin(a)*d*.6];};
  Object.assign(BOSS_SIG,{
    skyclaw:{name:'Talon Dive',desc:'the roc dives at you from the sky, and its wingbeat throws you back',
      run:(m,x,y)=>bsMark(m,x,y,80,1.1,m=>{bsHurt(m,1.6);bsShove(m,110);})},
    glenkeeper:{name:'Sleeping Moss',desc:'soft moss spreads round the Keeper and lulls anyone in it to sleep',
      run:m=>bsZone(m,m.x,m.y,130,5,'#8ad070',m=>bsCurse('sleep',1.5,m))},
    marshhag:{name:'Bog Curse',desc:'she curses the water round you: it poisons whoever stands in it',
      run:(m,x,y,rng)=>{bsZone(m,x,y,90,6,'#6a8a3a',m=>{bsHurt(m,.3);bsCurse('poison',3,m);});const [a,b]=around(rng,x,y,140);bsZone(m,a,b,70,6,'#6a8a3a',m=>bsHurt(m,.3));}},
    gnarledelder:{name:'Windfall',desc:'the old tree shakes its branches: apples hail down around it, stunning',
      run:(m,x,y,rng)=>{for(let i=0;i<4;i++){const [a,b]=i?around(rng,m.x,m.y,170):[x,y];bsMark(m,a,b,50,.9+i*.2,m=>{bsHurt(m,1.1);bsCurse('stun',.7,m);});}}},
    canyontyrant:{name:'Rockslide',desc:'boulders roll down on you in a line, each one a heavy blow',
      run:(m,x,y)=>{for(let i=0;i<3;i++){const u=(i+1)/3;bsMark(m,m.x+(x-m.x)*u,m.y+(y-m.y)*u,65,.8+i*.3,m=>bsHurt(m,1.5));}}},
    ashcolossus:{name:'Ash Cloud',desc:'a cloud of burning ash settles round it: it scorches and blinds',
      run:m=>bsZone(m,m.x,m.y,160,6,'#8a8080',m=>{bsHurt(m,.4);bsCurse('blind',2,m);})}});}
if(typeof ALBUM!=='undefined')for(const p of [{id:'crags',name:'Eaglecrest Crags',zones:['crags'],b:{hit:8,dex:1}},{id:'glen',name:'Hollowbrook Glen',zones:['glen'],b:{flee:6}},
  {id:'marsh',name:'Reedwater Marsh',zones:['marsh'],b:{maxsp:50}},{id:'orchard',name:'Old Orchard',zones:['orchard'],b:{maxhp:100}},
  {id:'canyon',name:'Redrock Canyon',zones:['canyon'],b:{def:8}},{id:'barrens',name:'Ashfall Barrens',zones:['barrens'],b:{matk:15,atk:15}}])
  if(!ALBUM.some(a=>a.id===p.id))ALBUM.push(p);
if(typeof ZONE_BLURB!=='undefined')Object.assign(ZONE_BLURB,{crags:'High bluffs where the eagles nest, above the Bramble. Skyclaw the Roc hunts from the tallest crag.',
  glen:'A mossy glen with a quick brook, between the Bramble and the Woods. Its Keeper does not like noise.',
  marsh:'Reed beds and still water below Goldleaf Downs. The Marsh Hag brews in the middle of it.',
  orchard:'An old walled orchard gone wild, south of Aurelmark. The oldest tree has woken up.',
  canyon:'Red cliffs and dry washes west of the Dunes. Watch for scorpions and falling rock.',
  barrens:'Grey ash plains under the volcano smoke, past the Crypt. Only the hardy hunt here.'});
