"use strict";
/* ================= phones sideways: character buttons on the left =================
   Holding the phone sideways, Stats, Skills, Items, Equip and Ride move into one row on the left, just under
   the status box and the online badge, where the thumb rests and the screen is free. Quests stays by the
   minimap; Menu and Sit stay in the top row. Upright (and on a computer) everything goes back where it was.
   The buttons are moved, not copied, so they keep working exactly as before. They fade in fights like the rest. */
(()=>{const ids=['status','skills','items','equip'];
  const row=document.createElement('div');row.id='quickL';row.setAttribute('role','toolbar');row.setAttribute('aria-label','Character windows');row.hidden=true;document.body.appendChild(row);
  const home=[]; // [element, original parent, original next sibling], in the order they were moved
  const sideways=()=>document.body.classList.contains('touchui')&&innerWidth>innerHeight&&innerHeight<=520;
  const wanted=()=>[...ids.map(k=>document.querySelector(`#quick .qk[data-open="${k}"],#quickL .qk[data-open="${k}"]`)),document.getElementById('rideBtn')].filter(Boolean);
  function sync(){
    if(sideways()){
      const list=wanted();
      if(list.some((el,i)=>row.children[i]!==el)){for(const el of list){if(el.parentElement!==row&&!home.some(h=>h[0]===el))home.push([el,el.parentElement,el.nextSibling]);row.appendChild(el);}}
      row.hidden=false;
      // just under the online badge (or the status box if the badge is not shown)
      const hud=document.getElementById('hud'),ob=document.getElementById('onlineBadge');if(!hud)return;
      const hr=hud.getBoundingClientRect(),br=ob&&getComputedStyle(ob).display!=='none'?ob.getBoundingClientRect():null;
      row.style.top=Math.round((br&&br.height?br.bottom:hr.bottom)+8)+'px';row.style.left=Math.round(hr.left)+'px';}
    else if(home.length){ // put them back, last moved first, so every one lands before its old neighbour
      for(let i=home.length-1;i>=0;i--){const [el,p,n]=home[i];p.insertBefore(el,n&&n.parentElement===p?n:null);}
      home.length=0;row.hidden=true;}
    else row.hidden=true;}
  sync();setInterval(sync,600);addEventListener('resize',()=>setTimeout(sync,60));
  addEventListener('orientationchange',()=>setTimeout(sync,200));})();
