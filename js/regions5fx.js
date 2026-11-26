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
