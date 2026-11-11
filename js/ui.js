"use strict";
/* ================= HUD ================= */
let hudCache={};
function setT(id,v){if(hudCache[id]!==v){hudCache[id]=v;document.getElementById(id).textContent=v;}}
function setW(id,f){const v=(clamp(f,0,1)*100).toFixed(1)+'%';if(hudCache[id]!==v){hudCache[id]=v;document.getElementById(id).style.width=v;}}
function updateHud(){
  if(!P||!S)return;
  setT('hName',P.name);setT('hCls',CLASSES[P.cls].name+(P.sitting?' · resting':''));
  setW('hpI',P.hp/S.maxhp);setT('hpT',`${fmt(P.hp)} / ${fmt(S.maxhp)}`);
  setW('spI',P.sp/S.maxsp);setT('spT',`${fmt(P.sp)} / ${fmt(S.maxsp)}`);
  const en=expNeed(P.lv),jn=jexpNeed(P.jl),jm=P.jl>=jobMax(P.cls);
  setT('lvT',`Base Lv ${P.lv}`);setT('exT',(P.exp/en*100).toFixed(1)+'%');setW('exI',P.exp/en);
  setT('jlT',`Job Lv ${P.jl}`);setT('jxT',jm?'max':(P.jexp/jn*100).toFixed(1)+'%');setW('jxI',jm?1:P.jexp/jn);
  setT('ailT',ailText());
  setT('weight',`Weight ${fmt(carryWeight())} / ${fmt(maxWeight())}`+(P.heavy===2?' · too heavy to fight':P.heavy?' · no regen':''));
  {const we=$('#weight'),hv=!!P.heavy;if(we.classList.contains('heavy')!==hv)we.classList.toggle('heavy',hv);}
  setT('gold',`${fmt(P.gold)} gold`+(P.statPts?` · ${P.statPts} stat pts`:'')+(P.skillPts?` · ${P.skillPts} skill pts`:''));
  const pc=partyCount();const pe=$('#party');if(pe.hidden!==!pc)pe.hidden=!pc;if(pc)setT('party',`Party: ${SOC.party.mode==='share'?'sharing EXP':'+25% EXP each'} · ${pc} member${pc>1?'s':''} here`);
  const qe=$('#quest');if(qe.hidden!==!P.quest)qe.hidden=!P.quest;if(P.quest)setT('quest',`Contract: ${MOBS[P.quest.mob].name} ${P.quest.have}/${P.quest.need}`);
  const t=P.target&&!P.target.dead?P.target:null;const te=$('#target');
  if(!!t===te.hidden)te.hidden=!t;
  if(t&&t.pvp){setT('tDrops','Duel: first to fall to 1 HP loses');setT('tName',t.d.name);setT('tLv',`Lv ${t.d.lv} · player`);setW('tI',t.hp/100);setT('tT',`${Math.round(t.hp)}%`);}
  else if(t){setT('tDrops','Drops: '+dropText(t.d));setT('tName',t.d.name);setT('tLv',`Lv ${t.d.lv} · ${ELEM[t.d.el||'neutral'].name}`+(t.d.undead?' · undead':'')+(t.d.boss?' · boss':''));setW('tI',t.hp/t.d.hp);setT('tT',`${fmt(t.hp)} / ${fmt(t.d.hp)}`);}
  // hotbar cooldowns & counts
  for(const el of hotEls){const s=el._slot;let frac=0,off=false,n='';
    if(s.skill){const l=P.skills[s.skill]||0;off=!l||P.sp<SKILLS[s.skill].sp(l||1);const r=(P.cd[s.skill]||0)-now;if(r>0)frac=r/SKILLS[s.skill].cd;n=l?String(l):'';}
    else{const e=invFind(s.item);n=e?String(e.n):'0';off=!e;}
    const key=frac.toFixed(2)+off+n;if(el._k!==key){el._k=key;el.querySelector('.cd').style.height=(frac*100)+'%';el.classList.toggle('off',off);el.querySelector('.n').textContent=n;}}
}
let hotEls=[];
function hotSlots(){const sk=hotSkills();
  return [...sk.map(s=>s?{skill:s}:null),{item:'red'},{item:'orange'},{item:'blue'},{item:'scroll'}];}
function rebuildHotbar(){
  if(!P)return;const hb=$('#hotbar');const slots=hotSlots();const sig=JSON.stringify(slots);if(hb._sig===sig)return;hb._sig=sig;
  hb.innerHTML='';hotEls=[];
  slots.forEach((s,i)=>{const b=document.createElement('button');b.className='slot';
    if(!s){b.classList.add('off');b.innerHTML=`<span class="k">${i+1}</span><span class="cd"></span><span class="n"></span>`;b.disabled=true;hb.appendChild(b);return;}
    const d=s.skill?SKILLS[s.skill]:ITEMS[s.item];
    b.title=(s.skill?d.name:d.name+' — '+d.desc)+` (${i+1})`;b.setAttribute('aria-label',b.title);
    b.innerHTML=`<span class="ic" style="background:${d.col}">${d.g}</span><span class="k">${i+1}</span><span class="cd"></span><span class="n"></span>`;
    b._slot=s;b.addEventListener('click',()=>pressSlot(i));hb.appendChild(b);hotEls.push(b);});
}
function pressSlot(i){const s=hotSlots()[i];if(!s)return;if(s.skill){if(!P.skills[s.skill]){addLog(`Learn ${SKILLS[s.skill].name} in the Skills window (K).`);return;}useSkill(s.skill);}else useItem(s.item);}

/* ================= panels ================= */
const panel=$('#panel');let panelKind=null,panelArg=null,shopTab='buy';
// other files (trade.js) register extra windows here: render, button actions, and what to do on close
const PANELS={},PANEL_ACTS={},PANEL_CLOSE={};
function openPanel(kind,arg){panelKind=kind;panelArg=arg;panel.hidden=false;refreshPanel();}
function closePanel(){const k=panelKind;panelKind=null;panel.hidden=true;if(PANEL_CLOSE[k])PANEL_CLOSE[k]();}
function togglePanel(kind){if(panelKind===kind)closePanel();else openPanel(kind);}
function icon(it){return `<span class="ico" style="background:${it.col}">${it.g}</span>`;}
function itemDesc(e){const it=ITEMS[e.id];const bits=[];
  if(it.atk)bits.push(`ATK ${it.atk}`);if(it.matk)bits.push(`MATK ${it.matk}`);if(it.def)bits.push(`DEF ${it.def}`);
  if(it.b)for(const k in it.b)bits.push(`${k.toUpperCase().replace('MAXHP','Max HP').replace('MAXSP','Max SP')} +${it.b[k]}`);
  if(rarityOf(e.id))bits.push(RARITY[rarityOf(e.id)].name);if(e.r){const rb=refineBonus(e);bits.push(Object.keys(rb).map(k=>`${k.toUpperCase()} +${rb[k]}`).join(', ')+' (refine)');}
  if(it.lv>1)bits.push(`Lv ${it.lv}+`);if(it.wt)bits.push(it.wt);
  if(e.s&&e.s.length)bits.push('Slots: '+e.s.map(s=>s?ITEMS[s].name.replace(' Sigil',''):'empty').join(', '));
  return it.desc||bits.join(' · ');}
function refreshPanel(){
  if(!panelKind||!P)return;let h=`<button class="btn small x" data-act="close" aria-label="Close">✕</button>`;
  const c=CLASSES[P.cls];
  if(panelKind==='status'){S=computeStats();
    h+=`<h2>${esc(P.name)}</h2><div class="sub">${c.name} · Base Lv ${P.lv} · Job Lv ${P.jl}</div>`;
    h+=`<div class="sub">Stat points: <span class="gold">${P.statPts}</span></div>`;
    for(const k of STATS){const v=P.st[k],bonus=S[k]-v,cost=statCost(v);
      h+=`<div class="st"><b>${k.toUpperCase()}</b><span class="muted" style="font-size:12px">${STAT_DESC[k]}</span><span>${v}${bonus?`<span class="gold"> +${bonus}</span>`:''}</span><button class="btn small" data-act="stat" data-arg="${k}" ${P.statPts<cost||v>=99?'disabled':''} title="Costs ${cost} points">+${cost>2?' ('+cost+')':''}</button></div>`;}
    h+=`<h3>Combat</h3><div class="dv"><div><span>ATK</span><span>${S.atk}</span></div><div><span>Attacks/sec</span><span>${(1/S.delay).toFixed(2)}</span></div><div><span>Weight</span><span>${fmt(carryWeight())}/${fmt(maxWeight())}</span></div><div><span>MATK</span><span>${S.matk}</span></div><div><span>DEF</span><span>${S.def}</span></div><div><span>HIT</span><span>${S.hit}</span></div><div><span>FLEE</span><span>${S.flee}</span></div><div><span>CRIT</span><span>${S.crit}%</span></div><div><span>Attacks/s</span><span>${(1/S.delay).toFixed(2)}</span></div><div><span>Range</span><span>${S.range}px</span></div></div>`;
    h+=`<h3>Equipment</h3>`;
    for(const slot of ['head','weapon','armor','accessory']){const e=P.eq[slot];
      h+=`<div class="row">${e?icon(ITEMS[e.id]):'<span class="ico" style="background:#2a3240"></span>'}<div class="grow"><div class="nm">${e?ITEMS[e.id].name:'<span class="muted">No '+slot+'</span>'}</div><div class="ds">${e?itemDesc(e):''}</div></div>${e?`<button class="btn small" data-act="unequip" data-arg="${slot}">Remove</button>`:''}</div>`;}
  }
  else if(panelKind==='items'){
    h+=`<h2>Items</h2><div class="sub">${fmt(P.gold)} gold · click an item to use, equip or socket it</div><div class="tbtns" style="justify-content:flex-start;margin:0 0 6px"><button class="btn small" data-act="vendsetup">Open a shop</button></div>`;
    if(!P.inv.length)h+=`<p class="muted">Your bag is empty.</p>`;
    P.inv.forEach((e,i)=>{const it=ITEMS[e.id];const verb=it.type==='use'?'Use':it.type==='sigil'?'Socket':it.type==='etc'?'':'Equip';
      h+=`<div class="row">${icon(it)}<div class="grow"><div class="nm" style="color:${rarityCol(e.id)}">${itemName(e)}${e.n!==undefined?` <span class="muted">×${e.n}</span>`:''}</div><div class="ds">${itemDesc(e)}</div></div>${verb?`<button class="btn small" data-act="use" data-arg="${i}">${verb}</button>`:''}</div>`;});
  }
  else if(panelKind==='skills'){
    h+=skillTreeHtml();
  }
  else if(panelKind==='smith'){
    h+=`<h2>Brannoc the Smith</h2><div class="say">"Bring me ore and gold and I'll make that blade sing. Up to +4 never fails. Past that, a bad strike shatters the piece for good."</div>`;
    h+=`<h3>Materials</h3>`;
    for(const id of ['emberore','glintstone']){const it=ITEMS[id],have=(invFind(id)||{}).n||0;
      h+=`<div class="row">${icon(it)}<div class="grow"><div class="nm">${it.name} <span class="muted">×${have}</span></div><div class="ds">${it.desc}</div></div><span class="gold">${it.price}</span><button class="btn small" data-act="buy" data-arg="${id}" ${P.gold<it.price?'disabled':''}>Buy</button></div>`;}
    h+=`<h3>Refine</h3><div class="sub">${fmt(P.gold)} gold</div>`;
    const gear=[...['weapon','armor','head','accessory'].filter(s=>P.eq[s]).map(s=>({e:P.eq[s],key:'eq:'+s,where:'equipped'})),
      ...P.inv.filter(e=>e.uid&&['weapon','armor','head','accessory'].includes(ITEMS[e.id].type)).map(e=>({e,key:'inv:'+e.uid,where:'in bag'}))];
    if(!gear.length)h+=`<p class="muted">You have no gear to refine.</p>`;
    for(const {e,key,where} of gear){const r=e.r||0,next=r+1,mat=refineMat(e.id),has=!!invFind(mat),fee=refineFee(next);
      const armed=refineArm===key,risk=REFINE_CHANCE[next]<1;
      h+=`<div class="row">${icon(ITEMS[e.id])}<div class="grow"><div class="nm" style="color:${rarityCol(e.id)}">${itemName(e)} <span class="muted">${where}</span></div>`+
        (r>=10?`<div class="ds">Fully refined.</div></div>`:
        `<div class="ds">To +${next}: ${Math.round(REFINE_CHANCE[next]*100)}% · ${ITEMS[mat].name} + ${fmt(fee)} gold${risk?' · <span style="color:var(--warn)">breaks on failure</span>':''}</div></div>`+
        `<button class="btn small" data-act="refine" data-arg="${key}" ${!has||P.gold<fee?'disabled':''}>${armed?'Sure?':'Refine'}</button>`)+`</div>`;}
  }
  else if(panelKind==='storage'){
    h+=`<h2>Wenna the Keeper</h2><div class="say">"Leave it with me, love. It'll be right here when you come back."</div>`;
    h+=`<div class="sub">Storage ${P.storage.length}/${STORAGE_MAX} · Weight ${fmt(carryWeight())}/${fmt(maxWeight())}</div>`;
    h+=`<h3>Your bag</h3>`;if(!P.inv.length)h+=`<p class="muted">Empty.</p>`;
    P.inv.forEach((e,i)=>{h+=`<div class="row">${icon(ITEMS[e.id])}<div class="grow"><div class="nm" style="color:${rarityCol(e.id)}">${itemName(e)}${e.n!==undefined?` <span class="muted">×${e.n}</span>`:''}</div></div><button class="btn small" data-act="store" data-arg="${i}">Store</button></div>`;});
    h+=`<h3>In storage</h3>`;if(!P.storage.length)h+=`<p class="muted">Nothing stored yet.</p>`;
    P.storage.forEach((e,i)=>{h+=`<div class="row">${icon(ITEMS[e.id])}<div class="grow"><div class="nm" style="color:${rarityCol(e.id)}">${itemName(e)}${e.n!==undefined?` <span class="muted">×${e.n}</span>`:''}</div></div><button class="btn small" data-act="take" data-arg="${i}">Take</button></div>`;});
  }
  else if(panelKind==='equip'){S=computeStats();
    const slotBox=s=>{const e=P.eq[s];return `<div class="eqslot">${e?icon(ITEMS[e.id]):'<span class="ico" style="background:#2a3240"></span>'}<div class="grow"><div class="eqk">${s}</div>`+
      (e?`<div class="nm" style="color:${rarityCol(e.id)}">${itemName(e)}</div><div class="ds">${itemDesc(e)}</div></div><button class="btn small" data-act="unequip" data-arg="${s}">Remove</button>`:`<div class="muted">Empty</div></div>`)+`</div>`;};
    h+=`<h2>Equipment</h2><div class="sub">Refine gear with Brannoc the Smith in Hearthvale.</div>`;
    h+=`<div class="eqgrid"><div class="eqcol">${slotBox('head')}${slotBox('armor')}</div><canvas id="eqCv" width="240" height="300" aria-label="Your character"></canvas><div class="eqcol">${slotBox('weapon')}${slotBox('accessory')}</div></div>`;
    h+=`<div class="dv"><div><span>ATK</span><span>${S.atk}</span></div><div><span>MATK</span><span>${S.matk}</span></div><div><span>DEF</span><span>${S.def}</span></div><div><span>HIT</span><span>${S.hit}</span></div>`+
      `<div><span>FLEE</span><span>${S.flee}</span></div><div><span>CRIT</span><span>${S.crit}</span></div><div><span>Attacks/sec</span><span>${(1/S.delay).toFixed(2)}</span></div><div><span>Weight</span><span>${fmt(carryWeight())}/${fmt(maxWeight())}</span></div></div>`;
  }
  else if(panelKind==='mob'){const d=MOBS[panelArg];if(!d){closePanel();return;}S=computeStats();
    const pc=c=>{const v=c*100;return(v>=10||v===Math.round(v)?Math.round(v):v.toFixed(1))+'%';};
    const where=Object.values(ZONES).filter(z=>z.mobs&&z.mobs.some(([t])=>t===d.id)).map(z=>z.name).join(', ');
    h+=`<h2>${esc(d.name)}</h2><div class="sub">Lv ${d.lv}${d.boss?' · boss':''}${d.undead?' · undead':''} · ${d.aggro?'attacks on sight':'passive until hit'}${d.range?' · ranged':''}</div>`;
    h+=`<div class="dv"><div><span>HP</span><span>${fmt(d.hp)}</span></div><div><span>ATK</span><span>${d.atk}</span></div><div><span>DEF</span><span>${d.def}</span></div><div><span>FLEE</span><span>${d.flee}</span></div>`+
      `<div><span>Base EXP</span><span>${fmt(d.exp)}</span></div><div><span>Job EXP</span><span>${fmt(d.jexp)}</span></div>`+
      `<div><span>Your hit chance</span><span>${clamp(80+S.hit-d.flee,5,100)}%</span></div><div><span>You dodge</span><span>${100-clamp(85+d.hit-S.flee,5,95)}%</span></div></div>`;
    h+=`<h3>Drops</h3>`+d.drops.map(([id,c])=>`<div class="row">${icon(ITEMS[id])}<div class="grow"><div class="nm">${ITEMS[id].name}</div></div><span>${pc(c)}</span></div>`).join('')+
      `<div class="row">${icon(ITEMS[d.id+'_sig'])}<div class="grow"><div class="nm">${d.name} Sigil</div><div class="ds">${d.sig.kind}: ${d.sig.txt}</div></div><span>${pc(d.sigChance||.02)}</span></div>`;
    h+=`<h3>Element</h3><div class="sub"><span style="color:${ELEM[d.el||'neutral'].col}">${ELEM[d.el||'neutral'].name}</span>`+(weakTo(d.el).length?` · weak to ${weakTo(d.el).map(e=>ELEM[e].name).join(', ')}`:'')+`</div>`+(d.ail?`<h3>Inflicts</h3><div class="sub">${AILS[d.ail[0]].name} (${Math.round(d.ail[1]*100)}% per hit, ${d.ail[2]}s): ${AILS[d.ail[0]].desc.toLowerCase()}</div>`:'');
    h+=`<h3>Found in</h3><div class="sub">${where||'Unknown'}</div>`;}
  else if(panelKind==='help'){
    h+=`<h2>How to play</h2><p class="say">Embervale is a click-to-move action RPG. Hunt monsters for experience, gold, loot and rare sigils.</p>
    <div class="ds" style="line-height:1.7"><b>Moving and fighting:</b> click the ground to walk, click a monster to attack it until it falls. WASD and the arrow keys also move you. Tab targets the nearest monster.<br>
    <b>Levels:</b> base levels give stat points (C). Job levels give skill points (K). At Job Lv 10, talk to Guildmaster Corvin to become a Warden, Arcanist, Ranger or Cleric.<br>
    <b>Sigils:</b> every monster has a small chance to drop its sigil. Socket it into equipment with a free slot to gain its bonus for good.<br>
    <b>Resting:</b> press X to sit and recover HP and SP faster.<br>
    <b>Following:</b> press Follow next to a party member in the party box (or /follow Name) to walk behind them, through gates too. Click the ground, move or attack to stop.<br>
    <b>Duels:</b> challenge someone in the same region with the Duel button in the online list or /duel Name. After a 3-second countdown, click them to fight. The first to fall to 1 HP loses; nobody dies or loses EXP.<br>
    <b>Monster box:</b> the box at the top shows your target's name and HP; + shows its level, element, drops and an Info button.<br>
    <b>Status box:</b> the − button in its corner (or B) shrinks it to just your name, HP and SP; + brings it back.<br>
    <b>Regions:</b> Greenmoss Meadow (Lv 1–10) → Whispering Woods (10–20) → Ashen Dunes (20–32) → Cinder Crypt (32–45), home of the Ashen Warlord → Frostpeak Pass (42+).<br>
    <b>Dungeon:</b> stairs in a clearing in Whispering Woods lead down into the Mossdeep Caverns: three dark floors (Lv 18–37) that get harder as you go deeper, with the Gloomcap King at the bottom.<br>
    <b>Quests:</b> people with a gold <b>!</b> over their head have a quest for you, and a <b>?</b> means you can hand one in. Start the story with Elder Hollis by the fountain. Press J for your quest log.<br>
    <b>Second jobs:</b> at Job Lv 40, Corvin can test you for an advanced calling.<br>
    <b>Party support:</b> healing and buff skills marked “party” in the skill tree also land on party members standing near you.<br>
    <b>Guilds:</b> with an account you can found a guild (G) for 10,000 gold, pick its emblem, invite players from the online list, and chat with /g. Leaders can name officers, who can invite and post the guild notice.<br>
    <b>World bosses:</b> every so often a huge boss appears somewhere and everyone online is told where. Whoever deals the most damage is the MVP and wins a rare hat. Bring friends.<br>
    <b>Hunting contracts:</b> Guildmaster Corvin offers hunts that suit your level for bonus EXP and gold.<br>
    <b>Hats:</b> rare headgear drops from some monsters (and the Straw Hat and Ribbon Bow from the store). Everyone online sees what you wear.<br>
    <b>Auto-hunt:</b> the Auto button fights the nearest monster for you and drinks tonics when HP runs low. It's handy on a phone.<br>
    <b>Saving:</b> your progress saves automatically in this browser.</div>
    <h3>Elements</h3><div class="sub">Fire beats Earth, Earth beats Wind, Wind beats Water, Water beats Fire (×1.5); the same element resists itself. Holy and Shadow deal double to each other. Monster info (right-click) shows each monster's element.</div><h3>Ailments</h3><div class="sub">Poison, stun, sleep, freeze, silence and blind. VIT resists poison, stun and freeze; INT resists sleep, silence and blind. Remedy Draught (General Store) and Mend cure them.</div><h3>Name colours</h3><div class="sub">Blue: players · green: your party · grey: guests · white: calm monsters · red: monsters that attack on sight · gold: bosses</div><h3>Chat commands</h3><div class="sub">/help · /where · /who · /sit · /stand · /exp · /roll · /emotes · /clear<br>/w Name text · /r text · /invite Name · /p text · /leave · /kick Name · /friend Name · /friends</div><h3>Keys</h3><div class="dv"><div><span>Right-click monster</span><span>monster info</span></div><div><span>F1–F8</span><span>hotbar</span></div><div><span>Insert</span><span>sit / stand</span></div><div><span>Alt+E</span><span>items</span></div><div><span>Alt+S</span><span>skills</span></div><div><span>Alt+A</span><span>stats</span></div><div><span>Alt+L</span><span>emotes</span></div><div><span>Alt+V</span><span>hide status box</span></div><div><span>F12</span><span>hide hotbar</span></div><div><span>Click item</span><span>pick it up</span></div><div><span>Enter</span><span>chat</span></div><div><span>E</span><span>emotes</span></div><div><span>1–4</span><span>skills</span></div><div><span>5–8</span><span>tonics, scroll</span></div><div><span>C / I / K</span><span>windows</span></div><div><span>X</span><span>sit</span></div><div><span>Tab</span><span>target</span></div><div><span>Esc</span><span>close</span></div></div>
    <h3>Sound</h3><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn small" data-act="music">Music: ${AU.music?'on':'off'}</button><button class="btn small" data-act="sfxt">Sound effects: ${AU.sfx?'on':'off'}</button></div>
    <h3>Playing together</h3><p class="ds">Everyone who has this page open at the same time shares the world. You can see each other walking around, chat with Enter or the Chat button, and send emotes (E). Hunting near another player gives you both a party bonus of +25% EXP. The log announces big moments like level milestones, rare sigils and boss kills to everyone. ${NET.room?`<span class="gold">You are connected.</span>`:'Chat is offline in this view, so you are playing solo.'}</p>
    <h3>Adventure</h3><button class="btn" data-act="newgame">Start a new adventure</button>`;
  }
  else if(panelKind==='shop'){
    h+=`<h2>General Store</h2><div class="say">“Tonics, steel and sturdy cloth. And I'll buy whatever you dragged out of the wilds.” — Ilsa</div>`;
    h+=`<div class="tabs"><button class="btn small ${shopTab==='buy'?'on':''}" data-act="tab" data-arg="buy">Buy</button><button class="btn small ${shopTab==='sell'?'on':''}" data-act="tab" data-arg="sell">Sell</button><span class="gold" style="margin-left:auto">${fmt(P.gold)} gold</span></div>`;
    if(shopTab==='buy'){for(const id of SHOP){const it=ITEMS[id];const why=it.type==='use'?null:canEquip(it);
      h+=`<div class="row">${icon(it)}<div class="grow"><div class="nm">${it.name}</div><div class="ds">${itemDesc({id,s:it.slots?Array(it.slots).fill(null):[]})}${why&&it.type!=='use'?` · <span style="color:#ef7a6f">${why.replace('Requires ','')}</span>`:''}</div></div><span class="gold" style="font-variant-numeric:tabular-nums">${fmt(it.price)}</span><button class="btn small" data-act="buy" data-arg="${id}" ${P.gold<it.price?'disabled':''}>Buy</button></div>`;}}
    else{const etc=P.inv.filter(e=>ITEMS[e.id].type==='etc');const tot=etc.reduce((a,e)=>a+sellValue(e.id)*e.n,0);
      h+=`<div class="row"><div class="grow">Sell all monster loot</div><span class="gold">${fmt(tot)}</span><button class="btn small" data-act="sellall" ${tot?'':'disabled'}>Sell all</button></div>`;
      P.inv.forEach((e,i)=>{const it=ITEMS[e.id];h+=`<div class="row">${icon(it)}<div class="grow"><div class="nm" style="color:${rarityCol(e.id)}">${itemName(e)}${e.n!==undefined?` <span class="muted">×${e.n}</span>`:''}</div></div><span class="gold">${fmt(sellValue(e.id))}</span><button class="btn small" data-act="sell" data-arg="${i}">Sell 1</button></div>`;});}
  }
  else if(panelKind==='job'){
    h+=`<h2>Guild Hall</h2>`;
    if(P.cls!=='novice')h+=jobHallHtml(c);
    else if(P.jl<10)h+=`<div class="say">“Every calling starts in the meadow. Reach Job Level 10 and come see me. You're at ${P.jl} now.” — Corvin</div>`;
    else{h+=`<div class="say">“You've earned it. Choose your calling. The choice is for life, so choose with care.” — Corvin</div><div class="choice">`;
      for(const id of ['warden','arcanist','ranger','cleric']){const k=CLASSES[id];h+=`<button data-act="job" data-arg="${id}"><b style="color:${k.col}">${k.name}</b><small>${k.desc}</small><small>Starts with: ${ITEMS[k.gift].name}</small></button>`;}
      h+=`</div>`;}
    h+=`<h3>Hunting contracts</h3>`;
    if(P.quest){const q=P.quest,m=MOBS[q.mob];h+=`<div class="row"><div class="grow"><div class="nm">Defeat ${q.need} ${m.name}</div><div class="ds">Progress ${q.have}/${q.need} · Reward ${fmt(q.exp)} EXP, ${fmt(q.gold)} gold · found in ${Object.values(ZONES).find(z=>(z.mobs||[]).some(x=>x[0]===q.mob)).name}</div></div><button class="btn small" data-act="qdrop">Abandon</button></div>`;}
    else{h+=`<div class="ds" style="margin-bottom:4px">Take one contract at a time. It completes automatically wherever you are.</div>`;
      for(const o of contractOffers()){const m=MOBS[o.mob];h+=`<div class="row"><div class="grow"><div class="nm">Defeat ${o.need} ${m.name} <span class="muted">Lv ${m.lv}</span></div><div class="ds">Reward ${fmt(o.exp)} EXP, ${fmt(o.jexp)} job EXP, ${fmt(o.gold)} gold · ${Object.values(ZONES).find(z=>(z.mobs||[]).some(x=>x[0]===o.mob)).name}</div></div><button class="btn small" data-act="qtake" data-arg="${o.mob}">Accept</button></div>`;}}
  }
  else if(panelKind==='emote'){
    h+=`<h2>Emotes</h2><div class="sub">Everyone nearby sees it over your head. You can also type /heart, /gg and so on in chat.</div><div class="emgrid">`;
    for(const [k,l] of EMOTES)h+=`<button class="emb" data-act="emote" data-arg="${k}"><img alt="" src="${emoteThumb(k)}"><span>${l}</span></button>`;
    h+=`</div>`;
  }
  else if(panelKind==='heal'){
    h+=`<h2>Chapel</h2><div class="say">“Rest a moment, traveller. The light asks nothing of you.” — Sister Maren</div><button class="btn" data-act="heal">Receive a blessing (full HP and SP)</button>`;
  }
  else if(panelKind==='warp'){
    h+=`<h2>Waystation</h2><div class="say">“I can send you to any road you've already walked. The fare depends on how far you go.” — Tobin</div>`;
    ZONE_ORDER.slice(1).forEach((id,i)=>{const D=ZONES[id];const ok=P.visited.includes(id);const cost=(i+1)*60;
      h+=`<div class="row"><div class="grow"><div class="nm">${D.name}</div><div class="ds">${D.lvl}${ok?'':' · not visited yet'}${NET.wb&&NET.wb.z===id?` · <span style="color:#ff9a7a">World boss: ${MOBS[NET.wb.b].name}</span>`:''}</div></div><span class="gold">${cost}</span><button class="btn small" data-act="warp" data-arg="${id}" ${ok&&P.gold>=cost?'':'disabled'}>Travel</button></div>`;});
  }
  if(PANELS[panelKind])h+=PANELS[panelKind]();
  panel.innerHTML=h;
  if(panelKind==='equip')drawEquipDoll();
}
const emThumbs={};function emoteThumb(k){if(!emThumbs[k]){const c=document.createElement('canvas');c.width=c.height=64;drawEmoteIcon(c.getContext('2d'),k,32,32,52);emThumbs[k]=c.toDataURL();}return emThumbs[k];}
const STORAGE_MAX=120;let refineArm=null;
function findGear(key){const[w,v]=key.split(':');if(w==='eq')return P.eq[v]?{e:P.eq[v],slot:v}:null;const i=P.inv.findIndex(e=>String(e.uid)===v);return i<0?null:{e:P.inv[i],idx:i};}
function doRefine(key){const g=findGear(key);if(!g){refineArm=null;refreshPanel();return;}const e=g.e,next=(e.r||0)+1;if(next>10)return;
  const mat=refineMat(e.id),fee=refineFee(next),chance=REFINE_CHANCE[next];
  if(!invFind(mat)||P.gold<fee){addLog(`You need ${ITEMS[mat].name} and ${fmt(fee)} gold.`,'l-bad');return;}
  if(chance<1&&refineArm!==key){refineArm=key;refreshPanel();return;} // risky: ask once more
  refineArm=null;takeItem(mat);P.gold-=fee;
  if(Math.random()<chance){e.r=next;sfx('levelup');fx.push({k:'ring',x:P.x,y:P.y,r:46,col:'#ffcf5a',t0:now,dur:.5});
    addLog(`Success! It is now ${itemName(e)}.`,'l-good');floatT(P.x,P.y-50,`+${next}!`,'#ffcf5a',20);
    if(next>=7)announce('refine',`${next}:${e.id}`);}
  else{sfx('hurt');shakeUntil=now+.25;fx.push({k:'poof',x:P.x,y:P.y-10,col:'#9aa0aa',t0:now,dur:.6});
    if(g.slot)P.eq[g.slot]=null;else P.inv.splice(g.idx,1);
    addLog(`The refine failed. Your ${itemName(e)} shattered.`,'l-bad');floatT(P.x,P.y-50,'Shattered!','#ff8a7a',18);}
  S=computeStats();P.hp=Math.min(P.hp,S.maxhp);P.sp=Math.min(P.sp,S.maxsp);rebuildHotbar();refreshPanel();save(true);}
function drawEquipDoll(){const c=document.getElementById('eqCv');if(!c)return;const g=c.getContext('2d');g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,c.width,c.height);
  g.setTransform(3,0,0,3,0,0);const main=ctx;ctx=g;
  try{drawPlayer({name:P.name,look:P.look,cls:P.cls,eq:P.eq,x:40,y:82,face:1,back:false,moving:false,sitting:false},P.eq.weapon&&P.eq.weapon.id);}finally{ctx=main;}}
function esc(s){return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));}
panel.addEventListener('click',ev=>{
  const b=ev.target.closest('[data-act]');if(!b||b.disabled)return;const a=b.dataset.act,arg=b.dataset.arg;
  if(a==='close')return closePanel();
  if(PANEL_ACTS[a])return PANEL_ACTS[a](arg,b);
  if(a==='refine')return doRefine(arg);
  if(a==='store'){const e=P.inv[+arg];if(!e)return;const st=e.n!==undefined?P.storage.find(x=>x.id===e.id&&x.n!==undefined):null;
    if(!st&&P.storage.length>=STORAGE_MAX){addLog('Storage is full.','l-bad');return;}
    P.inv.splice(+arg,1);if(st)st.n+=e.n;else P.storage.push(e);sfx('click');rebuildHotbar();refreshPanel();save();return;}
  if(a==='take'){const e=P.storage[+arg];if(!e)return;if(carryWeight()+itemWeight(e.id)*(e.n||1)>maxWeight()){addLog(`Too heavy to carry ${itemName(e)}.`,'l-bad');return;}
    P.storage.splice(+arg,1);const bag=e.n!==undefined?invFind(e.id):null;if(bag)bag.n+=e.n;else P.inv.push(e);sfx('click');rebuildHotbar();refreshPanel();save();return;}
  if(a==='stat'){const v=P.st[arg],c=statCost(v);if(P.statPts>=c&&v<99){P.st[arg]++;P.statPts-=c;S=computeStats();}}
  if(a==='use')useInv(+arg);
  if(a==='unequip')unequip(arg);
  if(a==='learn'){if(P.skillPts>0&&skillUnlocked(arg)&&(P.skills[arg]||0)<SKILLS[arg].max){P.skills[arg]=(P.skills[arg]||0)+1;P.skillPts--;rebuildHotbar();addLog(`Learned ${SKILLS[arg].name} level ${P.skills[arg]}.`,'l-good');}}
  if(a==='tab')shopTab=arg;
  if(a==='buy'){const it=ITEMS[arg];if(carryWeight()+itemWeight(arg)>maxWeight()){addLog(`You cannot carry ${it.name}: too heavy.`,'l-bad');}else if(P.gold>=it.price){P.gold-=it.price;giveItem(arg,1);sfx('coin');addLog(`Bought ${it.name}.`,'l-loot');}}
  if(a==='sell'){const e=P.inv[+arg];if(e){sfx('coin');P.gold+=sellValue(e.id);if(e.n!==undefined)takeItem(e.id);else P.inv.splice(+arg,1);}}
  if(a==='sellall'){let g=0;P.inv=P.inv.filter(e=>{if(ITEMS[e.id].type==='etc'){g+=sellValue(e.id)*e.n;return false;}return true;});P.gold+=g;sfx('coin');addLog(`Sold your loot for ${fmt(g)} gold.`,'l-loot');}
  if(a==='job'&&P.cls==='novice'&&P.jl>=10){const k=CLASSES[arg];P.cls=arg;P.jl=1;P.jexp=0;P.skillPts=0;giveItem(k.gift,1);
    const idx=P.inv.findIndex(e=>e.id===k.gift);if(idx>=0)useInv(idx);
    fx.push({k:'lvl',x:P.x,y:P.y,t0:now,dur:2,txt:k.name.toUpperCase(),col:k.col});sfx('fanfare');announce('job',arg);addLog(`You are now a ${k.name}! Your ${ITEMS[k.gift].name} is equipped. Earn job levels to learn new skills.`,'l-rare');rebuildHotbar();S=computeStats();}
  if(a==='heal'){P.hp=S.maxhp;P.sp=S.maxsp;fx.push({k:'heal',x:P.x,y:P.y,t0:now,dur:.8});addLog('You feel refreshed.','l-good');}
  if(a==='warp'){const i=ZONE_ORDER.indexOf(arg),cost=i*60;if(P.gold>=cost){P.gold-=cost;closePanel();enterZone(arg);save();return;}}
  if(a==='newgame'){$('#confirm').hidden=false;return;}
  if(a==='qtake'&&!P.quest){const o=contractOffers().find(o=>o.mob===arg);if(o){P.quest={...o,have:0};addLog(`Contract accepted: defeat ${o.need} ${MOBS[arg].name}.`,'l-good');sfx('click');}}
  if(a==='qdrop'){P.quest=null;addLog('Contract abandoned.');}
  if(a==='emote'){doEmote(arg);closePanel();return;}
  if(a==='music'){audioInit();setAudio(!AU.music,AU.sfx);}
  if(a==='sfxt'){audioInit();setAudio(AU.music,!AU.sfx);}
  refreshPanel();save();
});
function openNpc(n){P.face=sface(n.x-P.x,n.y-P.y);shopTab='buy';openPanel(n.role);}

/* ================= input ================= */
let hoverMob=null;
function screenAt(ev){const r=cv.getBoundingClientRect();return{x:ev.clientX-r.left+camX,y:ev.clientY-r.top+camY};}
function worldAt(ev){const s=screenAt(ev);return unproj(s.x,s.y);}
let touchPick=false;
function mobAt(sc){let best=null,bd=1e9;const pad=touchPick?28:14;for(const m of mobs){if(m.dead)continue;const p=proj(m.x,m.y);const d=Math.hypot(p.x-sc.x,p.y-m.d.size*.9-sc.y);if(d<m.d.size+pad&&d<bd){bd=d;best=m;}}return best;}
cv.addEventListener('pointerdown',ev=>{
  audioInit();touchPick=ev.pointerType==='touch';closeChat(true);
  if(!P||P.dead||!running)return;const sc=screenAt(ev),w=unproj(sc.x,sc.y);
  P.lootGoal=null;
  {const sp=shopAt(sc);if(sp){soc('vendView',{peer:sp});return;}}
  const m=mobAt(sc);
  if(!m){const l=lootAt(sc);if(l){if(P.sitting)P.sitting=false;goLoot(l);return;}}
  if(m){if(Z.D.safe&&!m.pvp)return;P.target=m;P.queued=null;P.npcGoal=null;P.sitting=false;return;}
  for(const n of Z.npcs){const np=proj(n.x,n.y);if(Math.hypot(np.x-sc.x,np.y-22-sc.y)<(touchPick?34:26)){P.target=null;P.npcGoal=n;if(dist(P,n)<48){openNpc(n);P.npcGoal=null;}else pathTo(n.x,n.y+14,true);return;}}
  if(P.sitting){faceTo(P,w.x-P.x,w.y-P.y);return;}
  P.target=null;P.queued=null;P.npcGoal=null;clickMark={x:w.x,y:w.y,t:now};pathTo(w.x,w.y,true);
});
cv.addEventListener('pointermove',ev=>{if(!P)return;const sc=screenAt(ev);hoverMob=mobAt(sc);hoverLoot=hoverMob?null:lootAt(sc);cv.style.cursor=hoverMob?'crosshair':hoverLoot?'grab':'pointer';});
window.addEventListener('keydown',ev=>{
  if(!running||ev.target.tagName==='INPUT')return;const k=ev.key.toLowerCase();
  // classic MMO desktop shortcuts (the single-letter keys below keep working too)
  if(ev.altKey){const pn={e:'items',q:'equip',s:'skills',a:'status',l:'emote',h:'help',u:'quests',g:'guild'}[k];
    if(pn){ev.preventDefault();togglePanel(pn);return;}
    if(k==='v'){ev.preventDefault();$('#hud').hidden=!$('#hud').hidden;return;}}
  if(k==='b'&&!ev.altKey){hudMini(!$('#hud').classList.contains('mini'));return;}
  if(/^f[1-9]$/.test(k)){ev.preventDefault();const i=+k.slice(1)-1;if(i<8)pressSlot(i);return;}
  if(k==='f12'){ev.preventDefault();$('#hotbar').hidden=!$('#hotbar').hidden;return;}
  if(k==='insert'){ev.preventDefault();if(!P.dead){P.sitting=!P.sitting;P.path=[];P.target=null;}return;}
  if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright'].includes(k)){keys[k]=true;ev.preventDefault();return;}
  if(k==='enter'){ev.preventDefault();openChat();return;}
  if(k==='e'){togglePanel('emote');return;}
  if(k>='1'&&k<='8'){pressSlot(+k-1);return;}
  if(k==='c')togglePanel('status');else if(k==='i')togglePanel('items');else if(k==='k')togglePanel('skills');else if(k==='h')togglePanel('help');else if(k==='j')togglePanel('quests');else if(k==='g')togglePanel('guild');
  else if(k==='escape'){closePanel();P.target=null;}
  else if(k==='x'&&!P.dead){P.sitting=!P.sitting;P.path=[];P.target=null;}
  else if(k==='tab'){ev.preventDefault();targetNearest(false);}
});
window.addEventListener('keyup',ev=>{keys[ev.key.toLowerCase()]=false;});
window.addEventListener('blur',()=>{for(const k in keys)keys[k]=false;});
document.querySelectorAll('[data-open]').forEach(b=>b.addEventListener('click',()=>{sfx('click');togglePanel(b.dataset.open);}));
function targetNearest(keep){
  if(!P||P.dead||!running)return;if(Z.D.safe){addLog('Monsters live outside town. Head through the glowing gate to the east.');return;}
  if(keep&&P.target&&!P.target.dead)return;
  let best=null,bd=460;for(const m of mobs)if(!m.dead&&(m!==P.target||keep)){const d=dist(m,P);if(d<bd){bd=d;best=m;}}
  if(best){P.target=best;P.queued=null;P.npcGoal=null;P.sitting=false;}else addLog('No monsters nearby.');}
$('#emoteBtn').addEventListener('click',()=>{audioInit();togglePanel('emote');});
$('#autoBtn').addEventListener('click',()=>{if(!P)return;P.auto=!P.auto;$('#autoBtn').classList.toggle('on',P.auto);
  addLog(P.auto?'Auto-hunt on: you fight the nearest monster and drink tonics when HP runs low.':'Auto-hunt off.',P.auto?'l-good':'l-sys');});
$('#atkBtn').addEventListener('click',()=>{audioInit();targetNearest(true);});
$('#sitBtn').addEventListener('click',()=>{if(!P||P.dead)return;P.sitting=!P.sitting;P.path=[];P.target=null;});
$('#chatBtn').addEventListener('click',()=>{audioInit();$('#chatbar').hidden?openChat():closeChat();});
$('#muteBtn').addEventListener('click',()=>{audioInit();const on=AU.music||AU.sfx;setAudio(!on,!on);addLog(on?'Music and sound off.':'Music and sound on.');});
function openChat(){if(!running)return;$('#chatbar').hidden=false;$('#chatBtn').classList.add('on');$('#chatIn').focus();}
function closeChat(onlyIfEmpty){const i=$('#chatIn');if(onlyIfEmpty&&i.value)return;$('#chatbar').hidden=true;$('#chatBtn').classList.remove('on');i.blur();}
$('#chatbar').addEventListener('submit',ev=>{ev.preventDefault();const i=$('#chatIn');sendChat(i.value);i.value='';closeChat();});
$('#chatIn').addEventListener('keydown',ev=>{if(ev.key==='Escape'){ev.preventDefault();$('#chatIn').value='';closeChat();}ev.stopPropagation();});

/* ================= save / load ================= */
function snapshot(){if(!P)return null;
  const keep=['name','look','storage','friends','cls','lv','exp','jl','jexp','st','statPts','skillPts','skills','gold','inv','eq','hp','sp','zone','visited','quest','trial','hot','qs','track'];
  const o={};for(const k of keep)o[k]=P[k];o.uid=uid;
  if(typeof pendingEscrow==='function'){const ex=pendingEscrow();if(ex.items.length||ex.gold){o.inv=[...P.inv,...ex.items];o.gold=P.gold+ex.gold;}}
  return {v:1,p:JSON.parse(JSON.stringify(o))};}
function save(force){const s=snapshot();if(!s)return;
  if(ACC.token){ACC.cloud=s;cloudSave(force);}else try{localStorage.setItem(SAVE_KEY,JSON.stringify(s));}catch(e){}}
function loadSave(){try{const s=JSON.parse(localStorage.getItem(SAVE_KEY)||'null');return s&&s.v===1?s:null;}catch(e){return null;}}
// the character you would continue with: the server copy when logged in, otherwise this device's
function currentSave(){return ACC.token?ACC.cloud:loadSave();}

/* ---- talking to the game server ---- */
async function api(method,path,body,keepalive){
  const r=await fetch(SERVER+'/api/embervale'+path,{method,keepalive:!!keepalive,
    headers:{'Content-Type':'application/json',...(ACC.token?{Authorization:'Bearer '+ACC.token}:{})},body:body?JSON.stringify(body):undefined});
  const j=await r.json().catch(()=>({}));
  if(!r.ok)throw Object.assign(new Error(j.error||'The server did not answer. Try again in a moment.'),{status:r.status});
  return j;}
let cloudT=0,cloudTimer=null,cloudWarned=false;
function cloudSave(force){
  if(!ACC.token||!ACC.cloud)return;const wait=10000-(Date.now()-cloudT);
  if(!force&&wait>0){if(!cloudTimer)cloudTimer=setTimeout(()=>{cloudTimer=null;cloudSave(true);},wait);return;}
  clearTimeout(cloudTimer);cloudTimer=null;cloudT=Date.now();
  api('PUT','/character',{character:ACC.cloud},true).then(()=>{cloudWarned=false;}).catch(e=>{
    if(e.status===401){addLog('Your login has expired. Log in again from the title screen to keep saving to the server.','l-bad');setAccount(null);
      try{localStorage.setItem(SAVE_KEY,JSON.stringify(ACC.cloud||snapshot()));}catch(_){}}
    else if(!cloudWarned){cloudWarned=true;addLog('Could not reach the server to save. Will keep trying.','l-bad');}});}
function setAccount(sess){
  ACC.token=sess?sess.token:null;ACC.username=sess?sess.username:null;ACC.cloud=null;ACC.loaded=!sess;
  try{if(sess)localStorage.setItem('embervale.account',JSON.stringify({token:sess.token,username:sess.username}));else localStorage.removeItem('embervale.account');}catch(e){}
  if(NET.room&&NET.room.relogin)NET.room.relogin();
  refreshTitle();}
async function loadCloud(){
  if(!ACC.token)return;acMsg('Loading your character…',true);
  try{const r=await api('GET','/character');ACC.cloud=r.character&&r.character.v===1?r.character:null;ACC.loaded=true;acMsg('');}
  catch(e){if(e.status===401){setAccount(null);acMsg('Your login has expired. Please log in again.');}else acMsg(e.message);}
  refreshTitle();}
function acMsg(t,ok){const el=$('#acMsg');el.textContent=t||'';el.classList.toggle('ok',!!ok);}
function refreshTitle(){
  const inAcct=!!ACC.token;$('#acOut').hidden=!inAcct;$('#acIn').hidden=inAcct;$('#acNote').hidden=inAcct;
  if(inAcct)$('#acName').textContent=ACC.username;
  $('#acImport').hidden=!(inAcct&&ACC.loaded&&!ACC.cloud&&loadSave());
  const s=currentSave(),c=$('#contBtn');c.hidden=!s;
  if(s)c.textContent=`Continue as ${String(s.p.name).slice(0,16)} (Lv ${Math.floor(+s.p.lv)||1})`;
  $('#newBtn').disabled=inAcct&&!ACC.loaded;$('#contBtn').disabled=inAcct&&!ACC.loaded;}
async function accountSubmit(kind){
  const username=$('#acUser').value.trim().toLowerCase(),password=$('#acPass').value;
  if(!/^[a-z0-9_]{3,16}$/.test(username)){acMsg('Username: 3-16 letters, numbers or _');return;}
  if(password.length<6){acMsg('Password: at least 6 characters');return;}
  acMsg(kind==='register'?'Creating your account…':'Logging in…',true);
  try{const sess=await api('POST',kind==='register'?'/register':'/login',{username,password});$('#acPass').value='';
    setAccount(sess);acMsg(kind==='register'?'Account created!':'Welcome back!',true);await loadCloud();
    if(kind==='register'&&loadSave())acMsg('Account created! You can move your guest character into it below.',true);}
  catch(e){acMsg(e.message);}}
$('#acIn').addEventListener('submit',ev=>{ev.preventDefault();accountSubmit('login');});
$('#acReg').addEventListener('click',()=>accountSubmit('register'));
$('#acLogout').addEventListener('click',()=>{setAccount(null);acMsg('Logged out. You are playing as a guest.',true);});
$('#acImport').addEventListener('click',async()=>{const s=loadSave();if(!s)return;ACC.cloud=s;
  try{await api('PUT','/character',{character:s});acMsg('Your guest character is now saved to your account.',true);}catch(e){ACC.cloud=null;acMsg(e.message);}
  refreshTitle();});
function startWith(data){
  P=newPlayer(data?data.p.name:($('#nameIn').value.trim()||'Wanderer'));
  if(data){Object.assign(P,data.p);uid=Math.max(uid,data.p.uid||1);if(!('head' in P.eq))P.eq.head=null;P.look=lookDecode(lookCode(P.look))&&P.look;}
  else P.look={...newLook};
  if(!Array.isArray(P.friends))P.friends=[];
  S=computeStats();if(!data||P.hp<=0){P.hp=S.maxhp;P.sp=S.maxsp;}
  $('#title').hidden=true;running=true;rebuildHotbar();
  enterZone(data&&ZONES[P.zone]?P.zone:'town');
  if(!data){addLog(`Welcome to Hearthvale, ${P.name}.`,'l-lvl');addLog('Spend your 24 stat points first: open Stats (C).','l-good');addLog('Then head east through the glowing gate to Greenmoss Meadow.');}
  else addLog(`Welcome back, ${P.name}.`,'l-lvl');
  save();
}
setInterval(()=>{if(running)save();},15000);
document.addEventListener('visibilitychange',()=>{if(document.hidden&&running)save(true);});
addEventListener('pagehide',()=>{if(running)save(true);});
$('#reviveBtn').addEventListener('click',()=>{P.dead=false;S=computeStats();P.hp=Math.round(S.maxhp*.5);P.sp=Math.round(S.maxsp*.5);$('#death').hidden=true;enterZone('town');save();});
$('#newBtn').addEventListener('click',()=>{audioInit();if(currentSave()){$('#confirm').hidden=false;return;}startWith(null);});
$('#contBtn').addEventListener('click',()=>{audioInit();const s=currentSave();if(s)startWith(s);});
$('#cfNo').addEventListener('click',()=>{$('#confirm').hidden=true;});
$('#cfYes').addEventListener('click',async()=>{$('#confirm').hidden=true;closePanel();
  if(ACC.token){try{await api('DELETE','/character');ACC.cloud=null;}catch(e){acMsg(e.message);return;}}else try{localStorage.removeItem(SAVE_KEY);}catch(e){}
  if(running){running=false;P=null;$('#log').innerHTML='';$('#title').hidden=false;refreshTitle();}else startWith(null);});

/* ================= loop ================= */
let last=performance.now();
let hitStopUntil=0;function hitStop(sec){hitStopUntil=Math.max(hitStopUntil,performance.now()+sec*1000);}
function frame(ts){let dt=Math.min(.05,(ts-last)/1000);last=ts;if(ts<hitStopUntil)dt*=.06;now+=dt;
  if(running){update(dt);updateHud();}
  render();if(running)renderMini();else drawLookPreview();requestAnimationFrame(frame);}
function showBanner(a,b){const el=$('#zoneBanner');el.querySelector('b').textContent=a;el.querySelector('span').textContent=b;
  el.hidden=false;el.classList.remove('show');void el.offsetWidth;el.classList.add('show');clearTimeout(showBanner.t);showBanner.t=setTimeout(()=>{el.hidden=true;},3300);}
cv.addEventListener('contextmenu',ev=>{ev.preventDefault();if(!P||!running)return;const m=mobAt(screenAt(ev));if(m)openPanel('mob',m.d.id);});
$('#tInfo').addEventListener('click',()=>{if(P&&P.target&&P.target.d&&MOBS[P.target.d.id])openPanel('mob',P.target.d.id);});
let newLook=null,lookTouched=false;
function setNewLook(lk,touched){newLook={style:lk.style,hair:lk.hair,eye:lk.eye,skin:lk.skin};if(touched)lookTouched=true;refreshCreator();}
function refreshCreator(){
  $('#lkStyle').textContent=STYLE_NAMES[newLook.style];
  const fill=(id,list,key,label)=>{const el=$(id);if(!el.children.length)list.forEach((c,i)=>{const b=document.createElement('button');b.type='button';b.style.background=c;b.dataset.i=i;b.setAttribute('aria-label',`${label} ${i+1}`);
      b.addEventListener('click',()=>{sfx('click');setNewLook({...newLook,[key]:c},true);});el.appendChild(b);});
    [...el.children].forEach((b,i)=>b.classList.toggle('on',list[i]===newLook[key]));};
  fill('#swHair',HAIRS,'hair','Hair color');fill('#swEye',EYES,'eye','Eye color');fill('#swSkin',SKINS,'skin','Skin tone');}
const lookCtx=$('#lookCv').getContext('2d');
function drawLookPreview(){if(!newLook)return;const c=lookCtx;c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,240,240);c.setTransform(4,0,0,4,0,0);
  const main=ctx;ctx=c;const ph=Math.floor(now/1.6)%4,face=ph===1||ph===2?-1:1,back=ph>=2;
  try{drawHuman(30,50,CLASSES.novice.col,newLook.hair,face,0,{look:{...lookFor($('#nameIn').value.trim()||'Wanderer'),...newLook},outfit:'novice',back});}finally{ctx=main;}}
function initCreator(){
  setNewLook(lookFor('Wanderer'));
  $('#nameIn').addEventListener('input',()=>{if(!lookTouched)setNewLook(lookFor($('#nameIn').value.trim()||'Wanderer'));});
  document.querySelectorAll('[data-style]').forEach(b=>b.addEventListener('click',()=>{sfx('click');setNewLook({...newLook,style:(newLook.style+(+b.dataset.style)+6)%6},true);}));
  $('#lkRand').addEventListener('click',()=>{sfx('click');const r=a=>a[Math.floor(Math.random()*a.length)];setNewLook({style:Math.floor(Math.random()*6),hair:r(HAIRS),eye:r(EYES),skin:r(SKINS)},true);});
  $('#verT').textContent=`Embervale v${VERSION}`+(ROOM?` · private room "${ROOM}"`:'');}
function boot(hot){
  initCreator();
  resize();setAudio(AU.music,AU.sfx);netConnect();
  document.addEventListener('visibilitychange',()=>{NET.lastSent='';NET.sendT=0;if(P)netTick(0);});
  $('#onlineBadge').addEventListener('click',()=>{const l=$('#whoList');if(!NET.room)return;l.hidden=!l.hidden;if(!l.hidden)updateWho();});
  setInterval(()=>{if(!$('#whoList').hidden)updateWho();},1500);
  if(hot&&hot.v===1){startWith(hot);}
  else{refreshTitle();loadCloud();}
  requestAnimationFrame(frame);
}
window.claude?.hot?.snapshot?.(()=>snapshot());
window.claude?.hot?.ready ? window.claude.hot.ready(boot) : boot(window.claude?.hot?.data);
window.__game={get cam(){return {x:camX,y:camY}},get P(){return P},get mobs(){return mobs},get Z(){return Z},enterZone,gainExp,useSkill,startWith};

/* ---- status box: full or compact (name, HP, SP and ailments); remembered on this device ---- */
function hudMini(on,quiet){const h=$('#hud'),b=$('#hudToggle');h.classList.toggle('mini',on);b.textContent=on?'+':'−';b.setAttribute('aria-expanded',String(!on));
  const t=on?'Expand the status box (B)':'Collapse the status box (B)';b.setAttribute('aria-label',t);b.title=t;
  if(!quiet){sfx('click');try{localStorage.setItem('embervale.hudMini',on?'1':'0');}catch(e){}}}
$('#hudToggle').addEventListener('click',ev=>{ev.stopPropagation();hudMini(!$('#hud').classList.contains('mini'));});
try{if(localStorage.getItem('embervale.hudMini')==='1')hudMini(true,true);}catch(e){}

/* ---- monster box: compact (name + HP) by default, details on demand; remembered on this device ---- */
function targetMini(on,quiet){const t=$('#target'),b=$('#tToggle');t.classList.toggle('mini',on);b.textContent=on?'+':'−';b.setAttribute('aria-expanded',String(!on));
  const l=on?'Show monster details':'Hide monster details';b.setAttribute('aria-label',l);b.title=l;
  if(!quiet){sfx('click');try{localStorage.setItem('embervale.targetFull',on?'0':'1');}catch(e){}}}
$('#tToggle').addEventListener('click',ev=>{ev.stopPropagation();targetMini(!$('#target').classList.contains('mini'));});
try{if(localStorage.getItem('embervale.targetFull')==='1')targetMini(false,true);}catch(e){}

/* ---- the game open in two tabs of one browser: they share one saved character and only the front tab runs ---- */
const TABS=(()=>{try{return new BroadcastChannel('embervale-tabs');}catch(e){return null;}})();
let tabWarned=false;
function tabWarn(){if(tabWarned||!running)return;tabWarned=true;
  addLog('Embervale is also open in another tab of this browser. Tabs in one browser share one saved character and would overwrite each other, and the browser pauses whichever tab is in the background. For a second character, use a different browser, a private window, or another device.','l-bad');
  showBanner('Open in another tab','Use another browser or device for a second character');}
if(TABS){TABS.onmessage=ev=>{const m=ev.data||{};if(m.k==='hello'&&running){TABS.postMessage({k:'here'});tabWarn();}else if(m.k==='here')tabWarn();};
  setInterval(()=>{if(running&&!tabWarned)TABS.postMessage({k:'hello'});},3000);}
