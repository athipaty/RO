"use strict";
/* ================= combat depth: elements, status ailments, skill tree ================= */

/* ---- #10 elements ---- */
const ELEM={neutral:{name:'Neutral',col:'#c8c2b4'},fire:{name:'Fire',col:'#ff7a3a'},water:{name:'Water',col:'#5aa8f0'},
  wind:{name:'Wind',col:'#9fe08a'},earth:{name:'Earth',col:'#c8964a'},holy:{name:'Holy',col:'#fff0a0'},shadow:{name:'Shadow',col:'#a07ad0'}};
// attacker element -> defender element -> damage multiplier (anything not listed is x1)
const ELEM_CHART={
  fire:{earth:1.5,water:.5,fire:.25},water:{fire:1.5,wind:.5,water:.25},wind:{water:1.5,earth:.5,wind:.25},
  earth:{wind:1.5,fire:.5,earth:.25},holy:{shadow:2,holy:0},shadow:{holy:2,shadow:0}};
const elemMult=(a,d)=>{const r=ELEM_CHART[a||'neutral'];return r&&r[d||'neutral']!==undefined?r[d||'neutral']:1;};
const MOB_ELEM={sproutling:'earth',hopper:'neutral',mossbug:'earth',thornling:'earth',greylupe:'wind',mushcap:'earth',
  scarab:'earth',wraith:'shadow',cactoid:'earth',bonearcher:'shadow',emberimp:'fire',rimestalker:'water',frostwisp:'water',snowhulk:'water',warlord:'fire'};
for(const id in MOB_ELEM)if(MOBS[id])MOBS[id].el=MOB_ELEM[id];
function weakTo(el){return Object.keys(ELEM_CHART).filter(a=>elemMult(a,el)>1);}
function elemHint(m,mult){if(mult>1)floatT(m.x+12,m.y-m.d.size-26,'Weak!','#ffcf5a',11);else if(mult<1)floatT(m.x+12,m.y-m.d.size-26,mult===0?'Immune':'Resist','#9aa3b2',11);}

/* ---- #12 status ailments ---- */
const AILS={
  poison:{name:'Poisoned',col:'#7fd36a',g:'☠',stat:'vit',desc:'Lose HP over time; no natural regen'},
  stun:{name:'Stunned',col:'#ffd24a',g:'✦',stat:'vit',desc:'Cannot move, attack or cast'},
  sleep:{name:'Asleep',col:'#9fb8ff',g:'z',stat:'int',desc:'Cannot act until hit or it wears off'},
  freeze:{name:'Frozen',col:'#8fd0f0',g:'❄',stat:'vit',desc:'Cannot move, attack or cast'},
  silence:{name:'Silenced',col:'#c58cff',g:'…',stat:'int',desc:'Cannot use skills'},
  blind:{name:'Blind',col:'#9a9a9a',g:'◐',stat:'int',desc:'Much lower hit chance, dark vision'}};
// what each monster can inflict when its attack lands: [ailment, chance, seconds]
const MOB_AIL={thornling:['poison',.12,6],mushcap:['sleep',.10,4],scarab:['stun',.08,2],wraith:['blind',.15,6],cactoid:['poison',.15,6],
  bonearcher:['silence',.12,5],emberimp:['stun',.08,1.5],rimestalker:['stun',.10,2],frostwisp:['freeze',.12,2],snowhulk:['freeze',.10,2.5]};
for(const id in MOB_AIL)if(MOBS[id])MOBS[id].ail=MOB_AIL[id];
const ailOn=k=>!!(P&&P.ail&&P.ail[k]>now);
const ailHeld=()=>ailOn('stun')||ailOn('sleep')||ailOn('freeze');
function tryAilment([k,chance,dur]){if(!P||P.dead||!AILS[k])return false;const st=(S&&S[AILS[k].stat])||1;
  if(Math.random()>=chance*Math.max(.1,1-st/200))return false;
  const until=now+dur*Math.max(.3,1-st/300);if(!P.ail)P.ail={};const was=ailOn(k);P.ail[k]=Math.max(P.ail[k]||0,until);
  if(!was){floatT(P.x,P.y-56,AILS[k].name+'!',AILS[k].col,14);addLog(`You are ${AILS[k].name.toLowerCase()}: ${AILS[k].desc.toLowerCase()}.`,'l-bad');}
  if(ailHeld()){P.path=[];P.casting=null;P.sitting=false;}return true;}
function cureAll(quiet){if(!P||!P.ail)return;const had=Object.keys(P.ail).some(ailOn);P.ail={};if(had&&!quiet){floatT(P.x,P.y-56,'Cured!','#7fe08a',13);addLog('Your ailments are cured.','l-good');}}
let poisonAcc=0;
function ailTick(dt){if(!P||P.dead||!P.ail)return;
  if(ailOn('poison')){poisonAcc+=dt;if(poisonAcc>=1){poisonAcc-=1;const d=Math.max(1,Math.round(S.maxhp*.015));if(P.hp>d+1){P.hp-=d;floatT(P.x,P.y-30,fmt(d),'#7fd36a',13);}}}
  for(const k in P.ail)if(P.ail[k]&&P.ail[k]<=now){delete P.ail[k];}}
function ailText(){if(!P||!P.ail)return '';return Object.keys(AILS).filter(ailOn).map(k=>`${AILS[k].g} ${AILS[k].name} ${Math.ceil(P.ail[k]-now)}s`).join(' · ');}
// little coloured badges over your head
function drawAilIcons(x,y){const on=Object.keys(AILS).filter(ailOn);if(!on.length)return;let ox=x-(on.length-1)*8;
  for(const k of on){ctx.fillStyle='rgba(0,0,0,.6)';ctx.beginPath();ctx.arc(ox,y,7,0,7);ctx.fill();ctx.fillStyle=AILS[k].col;ctx.beginPath();ctx.arc(ox,y,5.5,0,7);ctx.fill();
    ctx.fillStyle='#1a120a';ctx.font='800 8px "Alegreya Sans",sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(AILS[k].g,ox,y+.5);ctx.textBaseline='alphabetic';ox+=16;}}
function drawBlind(){const g=ctx.createRadialGradient(VW/2,VH/2,Math.min(VW,VH)*.12,VW/2,VH/2,Math.max(VW,VH)*.6);
  g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,.88)');ctx.save();ctx.setTransform(DPR,0,0,DPR,0,0);ctx.fillStyle=g;ctx.fillRect(0,0,VW,VH);ctx.restore();}
// freezing or stunning a monster: told to the server when it runs the monsters
function ailMob(m,k,dur){if(m.dead)return;if(zoneHost())sendHit(m,0,0,{st:dur,sk:k});m.ail=k;m.ailUntil=now+dur;
  floatT(m.x,m.y-m.d.size-30,k==='freeze'?'Frozen!':'Stunned!',k==='freeze'?'#8fd0f0':'#ffd24a',12);}
function drawMobAil(m,x,s){if(!(m.ailUntil>now))return;
  if(m.ail==='freeze'){ctx.globalAlpha=.5;ctx.fillStyle='#bfe6ff';ctx.strokeStyle='#eaf6ff';ctx.lineWidth=1.5;ctx.beginPath();ctx.roundRect(x-s*1.15,m.y-s*2,s*2.3,s*2.1,4);ctx.fill();ctx.stroke();ctx.globalAlpha=1;}
  else{for(let i=0;i<3;i++){const a=now*4+i*2.1;ctx.fillStyle='#ffd24a';ctx.font='800 10px "Alegreya Sans",sans-serif';ctx.textAlign='center';ctx.fillText('✦',x+Math.cos(a)*s*.9,m.y-s*2.1+Math.sin(a)*3);}}}

/* ---- #26 skill tree ---- */
const SKILL_REQ={whirl:{cleave:3},ironwill:{cleave:2},frostnova:{emberbolt:3},arcstorm:{frostnova:3,emberbolt:5},arrowrain:{twinshot:3},hawkeye:{twinshot:1},blessing:{mend:3}};
function skillMissing(id){const r=SKILL_REQ[id]||{};return Object.keys(r).filter(k=>(P.skills[k]||0)<r[k]).map(k=>`${SKILLS[k].name} ${r[k]}`);}
const skillUnlocked=id=>!skillMissing(id).length;
function skillDepth(id){const r=SKILL_REQ[id];return r?1+Math.max(...Object.keys(r).map(skillDepth)):0;}
function skillTreeHtml(){const c=CLASSES[P.cls],list=P.cls==='novice'?['firstaid']:c.skills;
  let h=`<h2>Skill tree</h2><div class="sub">${c.name} · Skill points: <span class="gold">${P.skillPts}</span> · learned skills appear on your hotbar (keys 1–4)</div>`;
  const tiers=[];for(const id of list){const d=skillDepth(id);(tiers[d]=tiers[d]||[]).push(id);}
  tiers.forEach((ids,ti)=>{if(ti)h+=`<div class="tarrow" aria-hidden="true">▼</div>`;h+=`<div class="ttier">`;
    for(const id of ids){const sk=SKILLS[id],l=P.skills[id]||0,nl=Math.min(sk.max,l+1),miss=skillMissing(id),locked=miss.length>0;
      const el=SKILL_ELEM[id];
      h+=`<div class="snode${locked?' locked':''}${l?' has':''}"><div class="snh"><span class="ico" style="background:${sk.col}">${sk.g}</span><div class="grow"><div class="nm">${sk.name}</div>`+
        `<div class="slv">Lv ${l}/${sk.max}${el?` · <span style="color:${ELEM[el].col}">${ELEM[el].name}</span>`:''}${CAST[id]?' · cast':''}</div></div></div>`+
        `<div class="ds">${l?sk.desc(l):sk.desc(1)} · ${sk.sp(nl)} SP</div>`+
        (locked?`<div class="sreq">Needs ${miss.join(' and ')}</div>`:'')+
        `<button class="btn small" data-act="learn" data-arg="${id}" ${locked||!P.skillPts||l>=sk.max?'disabled':''}>${l>=sk.max?'Mastered':l?'Level up':'Learn'}</button></div>`;}
    h+=`</div>`;});
  if(P.cls==='novice')h+=`<p class="muted">Reach Job Lv 10, then talk to Guildmaster Corvin in Hearthvale to choose a calling and unlock its skill tree.</p>`;
  return h;}
// the element each damaging skill uses (shown in the tree)
const SKILL_ELEM={emberbolt:'fire',frostnova:'water',arcstorm:'wind',smite:'holy'};
