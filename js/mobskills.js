"use strict";
/* ================= #15 monster skills and #16 pack calls and looters =================
   The server runs monster skills and sends them as events (older games ignore unknown kinds):
     'h' heal    Mushcap, Gloomcap, Shriekcap: below half HP, heal themselves and nearby kin
     'b' blink   Mirage Wisp, Deepshade, Ember Imp: appear beside a target that keeps its distance
     'p' bolt    Ice Imp, Frost Wisp, Dust Wraith: a magic bolt from range (DEF counts for less)
     'y' howl    pack monsters (Grey Lupe, Hopper, Dune Jackal, Grave Hound, Rime Stalker) call others of
                 their kind nearby when one is hit (the server makes them join the fight)
   Looters (game only, since ground loot is each player's own): Cave Bats and Dune Jackals snatch loot you
   leave on the ground for a few seconds. Defeat the thief and it drops what it took. */
// skills and packs are set in data.js (the server's world export reads them there)
const MOB_LOOTER=['cavebat','dunejackal'];
for(const id of MOB_LOOTER)if(MOBS[id])MOBS[id].looter=true;
const SKILL_TXT={heal:'heals itself and its kin when hurt',blink:'blinks to your side if you keep your distance',bolt:'casts magic bolts from range'};

function mobBolt(m){if(P.dead)return;const dmg=Math.max(1,Math.round(m.d.atk*1.3*rnd(.9,1.1)-S.def*.3));hurtPlayer(dmg,m.d.name);}
function mobSkillEvent(m,e){
  if(e.k==='h'){fx.push({k:'ring',x:m.x,y:m.y,r:m.d.size+16,col:'#8fe08a',t0:now,dur:.5});floatT(m.x,m.y-m.d.size-14,'Heal','#8fe08a',12);}
  else if(e.k==='b'){const x0=fin(e.x0),y0=fin(e.y0);if(x0||y0)fx.push({k:'poof',x:x0,y:y0,col:m.d.col,t0:now,dur:.4});fx.push({k:'ring',x:m.x,y:m.y,r:m.d.size+10,col:'#c8b0ff',t0:now,dur:.35});
    const nx=fin(e.x1),ny=fin(e.y1);if(nx||ny){m.x=nx;m.y=ny;}}
  else if(e.k==='p'){m.lunge=now;if(e.t===NET.myId){if(!P.dead)shoot(m,P,'orb','#9ad0ff',()=>mobBolt(m),true);}
    else for(const o of NET.others.values())if(o.id===e.t){shoot(m,{x:o.rx,y:o.ry},'orb','#9ad0ff',()=>{},true);break;}}
  else if(e.k==='y'){floatT(m.x,m.y-m.d.size-14,'!!','#ffb070',15);}}

/* ---- looters ---- */
setInterval(()=>{try{if(!running||!P||!loot.length)return;
  for(const m of mobs){if(m.dead||!m.d.looter)continue;
    for(let i=loot.length-1;i>=0;i--){const l=loot[i];if(l.ghost||now<l.t0+3||Math.hypot(l.x-m.x,l.y-m.y)>m.d.size+14)continue;
      loot.splice(i,1);(m.stolen=m.stolen||[]).push({id:l.id,gold:l.gold||0});if(P.lootGoal===l)P.lootGoal=null;
      floatT(m.x,m.y-m.d.size-16,'Snatched!','#ffcf5a',13);addLog(`A ${m.d.name} snatched your ${l.id?ITEMS[l.id].name:fmt(l.gold)+' gold'}! Defeat it to get it back.`,'l-bad');break;}}}catch(e){}},250);
const _killMobMS=killMob;
killMob=function(m){const mine=!m.dead&&(m.myDmg||0)>0,st=m.stolen;m.stolen=null;const r=_killMobMS.apply(this,arguments);
  if(mine&&st&&st.length){for(const s of st)dropLoot(m,s.id,s.gold?{gold:s.gold}:{});addLog(`The ${m.d.name} drops what it stole.`,'l-loot');}
  return r;};

// monster info lists what it can do
const _refreshPanelMS=refreshPanel;
refreshPanel=function(){_refreshPanelMS.apply(this,arguments);
  if(panelKind!=='mob'||!panel||panel.querySelector('.mskills'))return;const d=MOBS[panelArg];if(!d)return;
  const bits=[];if(d.skill)bits.push(SKILL_TXT[d.skill]);if(d.pack)bits.push('calls others of its kind when attacked');if(d.looter)bits.push('snatches loot left on the ground');
  if(!bits.length)return;const div=document.createElement('div');div.className='mskills';div.innerHTML=`<h3>Behaviour</h3><div class="sub">${bits.map(b=>b[0].toUpperCase()+b.slice(1)).join('. ')}.</div>`;
  const f=[...panel.querySelectorAll('h3')].find(h=>/Found in/.test(h.textContent));if(f)panel.insertBefore(div,f);else panel.appendChild(div);};
