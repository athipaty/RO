"use strict";
/* ================= controls and HUD (v0.75.0) =================
   · the monster card in the middle is off by default (monsters show their own HP bar; Settings brings it back);
     duels and the arena still show it for the other player. On phones, press and hold a monster for its info.
   · buff icons live in a column on the right, under the minimap
   · minimap: tap to walk there (worldmap.js); a small ⤢ button switches its size
   · phone controls: round icon buttons with gold rings; a pad behind the cluster swallows taps that miss a
     button, so a near-miss never walks your hero off */
// ---- the target card ----
const _updateHudC=updateHud;
updateHud=function(){_updateHudC.apply(this,arguments);if(!P)return;const te=$('#target'),t=P.target&&!P.target.dead?P.target:null;
  const want=!!t&&(t.pvp||(typeof SETS!=='undefined'&&SETS.targetBox===true));if(te.hidden===want)te.hidden=!want;};
// press and hold a monster (phones) for its info. Listens on window (before the joystick holds the tap back);
// when the hold fires, the release is not turned into a tap
(()=>{let hold=null,x0=0,y0=0;const stop=()=>{clearTimeout(hold);hold=null;};
  addEventListener('pointerdown',ev=>{if(ev.target!==cv||ev.pointerType==='mouse'||ev.__joyTap||!P||!running)return;
    const r=cv.getBoundingClientRect(),sc={x:ev.clientX-r.left+camX,y:ev.clientY-r.top+camY};const was=touchPick;touchPick=true;const m=mobAt(sc);touchPick=was;if(!m)return;
    x0=ev.clientX;y0=ev.clientY;stop();hold=setTimeout(()=>{hold=null;if(typeof JOY!=='undefined'){JOY.down=null;}if(MOBS[m.d.id]){P.target=m;openPanel('mob',m.d.id);}},550);},true);
  addEventListener('pointermove',ev=>{if(hold&&Math.hypot(ev.clientX-x0,ev.clientY-y0)>14)stop();},true);
  addEventListener('pointerup',stop,true);addEventListener('pointercancel',stop,true);})();
// ---- buffs: a column on the right under the minimap ----
(()=>{const b=$('#buffs');if(!b)return;document.body.appendChild(b);b.classList.add('side');
  const place=()=>{const mb=$('#minibox');if(!mb)return;const r=mb.getBoundingClientRect();b.style.top=Math.round(r.bottom+8)+'px';b.style.right=Math.round(innerWidth-r.right)+'px';};
  place();setInterval(place,500);addEventListener('resize',place);})();
// ---- minimap size button ----
(()=>{const mb=$('#minibox');if(!mb||$('#miniSize'))return;const b=document.createElement('button');b.type='button';b.id='miniSize';b.className='btn small';
  b.addEventListener('click',ev=>{ev.stopPropagation();sfx('click');setMiniBig(!miniBig);});mb.appendChild(b);setMiniBig(miniBig);})();
// ---- phone controls: icons ----
const ICONS={
  menuBtn:'<path d="M4 7h16M4 12h16M4 17h16"/>',
  autoBtn:'<path d="M20 12a8 8 0 0 1-14 5.3M4 12a8 8 0 0 1 14-5.3"/><path d="M18 3v4h-4M6 21v-4h4"/>',
  chatBtn:'<path d="M4 6h16v10H9l-5 4z"/>',
  sitBtn:'<circle cx="9" cy="5" r="2.2"/><path d="M9 8v6h6v6M9 10l4 2M5 21h14"/>',
  emoteBtn:'<circle cx="12" cy="12" r="8"/><path d="M9 14c1.5 1.6 4.5 1.6 6 0"/><circle cx="9.5" cy="10" r=".6"/><circle cx="14.5" cy="10" r=".6"/>',
  atkBtn:'<path d="M5 19l9-9M14 4h6v6l-9 9-3-3"/><path d="M5 15l4 4M3 21l3-3"/>'};
for(const [id,path] of Object.entries(ICONS)){const b=document.getElementById(id);if(!b)continue;const label=b.textContent.trim();
  b.innerHTML=`<svg class="aic" viewBox="0 0 24 24" aria-hidden="true">${path}</svg><span class="atx">${label}</span>`;}
// ---- phones: an invisible ring around each round button catches near-misses, so a tap between buttons never
//      walks your hero off; open ground (for the joystick) stays free ----
(()=>{const box=document.createElement('div');box.id='actPads';document.body.appendChild(box);
  const fit=()=>{const on=document.body.classList.contains('touchui');box.hidden=!on;if(!on)return;
    const els=[...document.querySelectorAll('#actions>.act,#hotbar .slot')].filter(el=>{const r=el.getBoundingClientRect();return r.width&&getComputedStyle(el).display!=='none';});
    while(box.children.length<els.length){const d=document.createElement('div');d.className='actPad';['pointerdown','pointerup','click'].forEach(e=>d.addEventListener(e,ev=>ev.stopPropagation()));box.appendChild(d);}
    [...box.children].forEach((d,k)=>{const el=els[k];if(!el){d.hidden=true;return;}d.hidden=false;const r=el.getBoundingClientRect(),m=11;
      Object.assign(d.style,{left:(r.left-m)+'px',top:(r.top-m)+'px',width:(r.width+m*2)+'px',height:(r.height+m*2)+'px'});});};
  fit();setInterval(fit,700);addEventListener('resize',()=>setTimeout(fit,50));})();
// ---- a thin full-width EXP bar along the very bottom edge (classic MMO style); job EXP as a fainter line above ----
(()=>{const bar=document.createElement('div');bar.id='expEdge';bar.innerHTML='<i class="b"></i><i class="j"></i><span></span>';bar.setAttribute('aria-hidden','true');document.body.appendChild(bar);
  let key='';setInterval(()=>{if(!P||!running){bar.hidden=true;return;}bar.hidden=false;const en=expNeed(P.lv),jm=P.jl>=jobMax(P.cls),bf=P.lv>=99?1:P.exp/en,jf=jm?1:P.jexp/jexpNeed(P.jl);
    const k=bf.toFixed(4)+jf.toFixed(4);if(k===key)return;key=k;bar.querySelector('.b').style.width=(bf*100).toFixed(2)+'%';bar.querySelector('.j').style.width=(jf*100).toFixed(2)+'%';
    bar.querySelector('span').textContent=`Base ${(bf*100).toFixed(1)}% · Job ${jm?'max':(jf*100).toFixed(1)+'%'}`;},250);})();
// ---- phones: a round Ride button in the main column (only once you own a mount; lit while riding) ----
(()=>{const acts=$('#actions');if(!acts||$('#rideBtn'))return;const b=document.createElement('button');b.type='button';b.className='act';b.id='rideBtn';
  b.setAttribute('aria-label','Ride your mount (R)');b.title='Ride (R)';
  b.innerHTML='<svg class="aic" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 20V11a6 6 0 0 1 12 0v9"/><path d="M4 20h4M16 20h4"/><circle cx="8.5" cy="12.5" r=".7"/><circle cx="15.5" cy="12.5" r=".7"/></svg><span class="atx">Ride</span>';
  b.addEventListener('click',ev=>{ev.stopPropagation();if(!P)return;const own=Array.isArray(P.mounts)&&P.mounts.length;
    if(!own){sfx('click');floatT(P.x,P.y-50,'No mount yet','#ffe7a0',13);addLog("You don't have a mount yet. Tobin at the Waystation in Hearthvale keeps a stable (from Lv 10).",'l-sys');return;}
    if(typeof toggleRide==='function'){sfx('click');toggleRide();}});
  const auto=$('#autoBtn');if(auto&&auto.parentElement===acts)auto.insertAdjacentElement('afterend',b);else acts.insertBefore(b,$('#chatBtn'));
  setInterval(()=>{const own=!!(P&&Array.isArray(P.mounts)&&P.mounts.length),on=typeof riding==='function'&&riding();
    // always shown on phones; dimmed until you own a mount
    if(b.hidden)b.hidden=false;if(b.classList.contains('none')===own)b.classList.toggle('none',!own);if(b.classList.contains('on')!==on)b.classList.toggle('on',on);
    const auto2=$('#autoBtn');if(auto2&&auto2.parentElement===acts&&b.previousElementSibling!==auto2)auto2.insertAdjacentElement('afterend',b);},400);})();
// ---- turning Auto on asks what to pick up (one quick card), instead of a separate Loot button ----
(()=>{const card=document.createElement('div');card.id='autoPick';card.hidden=true;card.setAttribute('role','dialog');card.setAttribute('aria-label','Auto-hunt: what should it pick up?');
  card.innerHTML=`<div class="apT">Auto-hunt: what should I pick up?</div>
    <button type="button" class="apOpt" data-loot="1"><b class="apI">✦</b><span><b>Everything</b><i>Materials, tonics, gold and gear</i></span></button>
    <button type="button" class="apOpt" data-loot="0"><b class="apI">★</b><span><b>Only valuable</b><i>Equipment, sigils, coloured items and boss drops</i></span></button>`;
  document.body.appendChild(card);
  const close=()=>{card.classList.remove('show');setTimeout(()=>{if(!card.classList.contains('show'))card.hidden=true;},180);};
  const open=()=>{const b=$('#autoBtn').getBoundingClientRect();card.hidden=false;
    for(const o of card.querySelectorAll('.apOpt'))o.classList.toggle('on',(o.dataset.loot==='1')===(P.autoLoot!==false));
    const w=card.offsetWidth,h=card.offsetHeight;card.style.left=Math.max(8,Math.min(innerWidth-w-8,b.left+b.width/2-w/2))+'px';card.style.top=Math.max(8,b.top-h-10)+'px';
    requestAnimationFrame(()=>card.classList.add('show'));};
  // start auto-hunt with the chosen pick-up rule
  card.addEventListener('click',ev=>{const o=ev.target.closest('.apOpt');if(!o)return;ev.stopPropagation();setAutoLoot(o.dataset.loot==='1',true);close();
    P.auto=true;$('#autoBtn').classList.add('on');sfx('click');
    addLog(`Auto-hunt on: you fight the nearest monster and drink tonics when HP runs low. Picking up: ${P.autoLoot===false?'only valuable things':'everything'}.`,'l-good');});
  // a tap on Auto while it is off opens the card; while it is on, it turns off as before
  addEventListener('click',ev=>{const b=ev.target.closest&&ev.target.closest('#autoBtn');
    if(b){if(!P||!running||P.auto)return;ev.stopImmediatePropagation();ev.preventDefault();if(card.hidden)open();else close();return;}
    if(!card.hidden&&!ev.target.closest('#autoPick'))close();},true);
  addEventListener('keydown',ev=>{if(ev.key==='Escape'&&!card.hidden){ev.stopImmediatePropagation();close();}},true);})();
// ---- the rest button shows what it will do: a seated person (sit) or a standing one (stand up) ----
(()=>{const b=$('#sitBtn');if(!b)return;const svg=b.querySelector('svg.aic'),tx=b.querySelector('.atx');if(!svg)return;
  const SIT='<circle cx="9" cy="5" r="2.2"/><path d="M9 8v6h6v6M9 10l4 2M5 21h14"/>',STAND='<circle cx="12" cy="4" r="2.2"/><path d="M12 7v7M12 14l-3 7M12 14l3 7M12 9l-4 3M12 9l4 3"/><path d="M18 9l2-2 2 2" />';
  let was=null;setInterval(()=>{const sit=!!(P&&P.sitting);if(sit===was)return;was=sit;svg.innerHTML=sit?STAND:SIT;const t=sit?'Stand up (X)':'Sit to rest (X)';
    b.setAttribute('aria-label',t);b.dataset.tip=t;if(tx)tx.textContent=sit?'Stand':'Sit';b.classList.toggle('on',sit);},250);})();
// phones held sideways: tap the region name over the minimap to fold the map away (remembered)
(()=>{const mb=$('#minibox'),zn=$('#zName');if(!mb||!zn)return;try{if(localStorage.getItem('embervale.miniSlim')==='1')mb.classList.add('slim');}catch(e){}
  zn.addEventListener('click',ev=>{if(!document.body.classList.contains('touchui'))return;ev.stopPropagation();mb.classList.toggle('slim');sfx('click');try{localStorage.setItem('embervale.miniSlim',mb.classList.contains('slim')?'1':'0');}catch(e){}});})();
// ---- phones: quick buttons on the right for the windows used most (Stats, Skills, Equip, Quests) ----
(()=>{if($('#quick'))return;const q=document.createElement('div');q.id='quick';q.setAttribute('role','toolbar');q.setAttribute('aria-label','Quick windows');
  const I={status:['Stats (C)','<path d="M5 20V12M10 20V6M15 20v-9M20 20V9"/>'],skills:['Skills (K)','<path d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.5 6.7 19.4l1.2-6L3.4 9.3l6-.7z"/>'],
    equip:['Equipment','<path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z"/>'],quests:['Quests (J)','<path d="M7 3h10v18l-5-3-5 3z"/><path d="M10 8h4M10 11h4"/>']};
  for(const [k,[t,p]] of Object.entries(I)){const b=document.createElement('button');b.type='button';b.className='qk';b.dataset.open=k;b.setAttribute('aria-label',t);b.title=t;
    b.innerHTML=`<svg viewBox="0 0 24 24" aria-hidden="true">${p}</svg>`;b.addEventListener('click',ev=>{ev.stopPropagation();if(!P||!running)return;sfx('click');togglePanel(k);});q.appendChild(b);}
  document.body.appendChild(q);
  // sit just under the minimap, wherever it ends up
  // upright: a row under the minimap (the online badge moves below it); sideways: a row at the top, beside the minimap
  const place=()=>{const mb=$('#minibox');if(!mb)return;const r=mb.getBoundingClientRect(),land=innerWidth>innerHeight&&innerHeight<=520;
    if(land){q.style.top=Math.round(r.top)+'px';q.style.right=Math.round(innerWidth-r.left+8)+'px';}
    else{q.style.top=Math.round(r.bottom+8)+'px';q.style.right=Math.round(innerWidth-r.right)+'px';const ob=$('#onlineBadge');if(ob&&document.body.classList.contains('touchui')){ob.style.top=Math.round(r.bottom+58)+'px';
      // the who's-online list opens UNDER the badge, so the badge can still be tapped to close it
      const wl=$('#whoList');if(wl){const br=ob.getBoundingClientRect();if(br.height)wl.style.top=Math.round(br.bottom+6)+'px';}}}};
  place();setInterval(place,600);addEventListener('resize',place);})();
// phones: the hotbar's ✎ edit button lives in the ☰ menu (tapping an empty slot still opens the editor)
(()=>{const move=()=>{const e=$('#hbEdit'),dx=$('#dockExtra'),hb=$('#hotbar');if(!e)return;const touch=document.body.classList.contains('touchui');
    if(touch&&e.parentElement!==dx&&dx){dx.appendChild(e);e.classList.add('act');}else if(!touch&&hb&&e.parentElement!==hb){hb.appendChild(e);e.classList.remove('act');}};
  move();setInterval(move,1000);addEventListener('resize',()=>setTimeout(move,60));})();
// the who's-online list also closes when you tap anywhere else
addEventListener('pointerdown',e=>{const l=$('#whoList'),b=$('#onlineBadge');if(!l||l.hidden)return;if(l.contains(e.target)||(b&&b.contains(e.target)))return;l.hidden=true;},true);
