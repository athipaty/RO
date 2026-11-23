"use strict";
/* ================= one smooth curve from Lv 1 to 99 (v1.48.0) =================
   Measured with a simulated hero of each level (typical stats, the best shop gear for the level, skills) fighting the
   monsters of the regions made for that level:
     before  monsters took 12% of your HP per fight at Lv 5, 55% at Lv 30, 86% at Lv 50, 2x at Lv 80 and 2.7x at Lv 95,
             so late hunting meant a tonic every fight; and a level took ~4 minutes at Lv 15 but ~3.5 at Lv 90
             (later levels went faster than early ones)
     after   12% at Lv 5, ~36% at Lv 30, ~45% at Lv 50, ~58% at Lv 80, ~63% at Lv 95: harder the farther you go, never
             hopeless. Early levels come about twice as fast, late ones somewhat slower; Lv 1-95 takes about as long as before.
   The numbers below multiply every monster's HP, ATK and EXP / job EXP by its level (straight lines between the points).
   Bosses follow the same curve so they stay as strong next to their region as before. World bosses are left alone.
   tools/export-world.js runs this too, so the game server gets the same monsters. */
const BAL_LV=[1,10,20,30,40,50,60,70,80,90,99];
const BAL={hp:[1,1,.9,1,1.05,1,1,.97,.94,.9,.88],atk:[1,1,.86,.74,.66,.61,.58,.56,.53,.52,.52],exp:[1.5,1.9,1.6,1.35,1.12,.95,.8,.68,.58,.5,.46]};
function balAt(k,lv){const a=BAL[k],L=BAL_LV;if(lv<=L[0])return a[0];
  for(let i=1;i<L.length;i++)if(lv<=L[i]){const t=(lv-L[i-1])/(L[i]-L[i-1]);return a[i-1]+(a[i]-a[i-1])*t;}return a[a.length-1];}
// round to 2 significant figures above 100 (1234 -> 1200), so the numbers stay tidy in the bestiary
const balRound=v=>{v=Math.max(1,Math.round(v));if(v<100)return v;const p=Math.pow(10,Math.floor(Math.log10(v))-1);return Math.round(v/p)*p;};
for(const id in MOBS){const m=MOBS[id];if(!m||m.world||m._bal||!m.lv)continue;m._bal=1;
  m.hp=balRound(m.hp*balAt('hp',m.lv));m.atk=Math.max(1,Math.round(m.atk*balAt('atk',m.lv)));
  m.exp=balRound(m.exp*balAt('exp',m.lv));m.jexp=balRound(m.jexp*balAt('exp',m.lv));}
