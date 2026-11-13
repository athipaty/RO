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
      row.style.top=Math.round((br&&br.height?br.bottom:hr.bottom)+8)+'px';row.style.left=Math.round(hr.left)+'px';
      stackSideways(hr);}
    else if(home.length){ // put them back, last moved first, so every one lands before its old neighbour
      for(let i=home.length-1;i>=0;i--){const [el,p,n]=home[i];p.insertBefore(el,n&&n.parentElement===p?n:null);}
      home.length=0;row.hidden=true;}
    else row.hidden=true;
    if(!sideways()&&document.body.classList.contains('touchui'))stackUpright();}
  const vis=e=>e&&!e.hidden&&getComputedStyle(e).display!=='none'&&e.getBoundingClientRect().height>0;
  // sideways: the party box goes under the left row and stops above the chat box (it scrolls if it is long);
  // the buffs become a small row at the top centre, under Menu and Sit
  function stackSideways(hr){
    const pb=document.getElementById('partyBox'),log=document.getElementById('log'),bf=document.getElementById('buffs');
    const above=vis(row)?row.getBoundingClientRect().bottom:hr.bottom;
    if(pb){const top=Math.round(above+8),lt=vis(log)?log.getBoundingClientRect().top:innerHeight;pb.style.top=top+'px';pb.style.left=Math.round(hr.left)+'px';
      pb.style.maxHeight=Math.max(30,Math.round(lt-top-8))+'px';pb.style.overflowY='auto';}
    if(bf){const tops=['menuBtn','sitBtn'].map(id=>document.getElementById(id)).filter(vis).map(e=>e.getBoundingClientRect());
      bf.style.flexDirection='row';bf.style.right='auto';
      if(tops.length){const l=Math.min(...tops.map(r=>r.left)),r=Math.max(...tops.map(r=>r.right)),b=Math.max(...tops.map(r=>r.bottom));
        const w=bf.getBoundingClientRect().width||0;bf.style.top=Math.round(b+6)+'px';bf.style.left=Math.round(Math.max(8,(l+r)/2-w/2))+'px';}}}
  // upright: the party box goes below the quick buttons if they would meet; buffs start under the online badge
  function stackUpright(){
    const pb=document.getElementById('partyBox'),hud=document.getElementById('hud'),q=document.getElementById('quick'),ob=document.getElementById('onlineBadge'),bf=document.getElementById('buffs'),mb=document.getElementById('minibox');
    if(pb&&hud){const hr=hud.getBoundingClientRect();let top=hr.bottom+6;pb.style.left='';pb.style.maxHeight='';pb.style.overflowY='';
      if(vis(q)){const qr=q.getBoundingClientRect(),w=pb.getBoundingClientRect().width||175;if(qr.left<hr.left+w+6&&qr.bottom>top)top=qr.bottom+8;}
      pb.style.top=Math.round(top)+'px';}
    if(bf&&mb){const mr=mb.getBoundingClientRect();let top=mr.bottom+8;for(const e of [q,ob])if(vis(e))top=Math.max(top,e.getBoundingClientRect().bottom+8);
      bf.style.flexDirection='';bf.style.left='';bf.style.top=Math.round(top)+'px';bf.style.right=Math.round(innerWidth-mr.right)+'px';bf.style.marginTop='0';}}
  window.phoneLayout=sync;
  sync();setInterval(sync,300);addEventListener('resize',()=>setTimeout(sync,60));
  addEventListener('orientationchange',()=>setTimeout(sync,200));})();
