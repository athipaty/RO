"use strict";
/* ================= the Waystation's places as picture cards (v1.40.4) =================
   Each place Tobin can send you to is a card: a small landscape banner in the region's own look, pictures of the
   monsters that live there (the boss's face last), a badge saying whether it suits your level (the best one first,
   with a star), and markers for why you might go: your active quest, today's bounty, a world boss up right now,
   and the gathering spots (herbs, ore, fishing). */
const TC_BAN={};
function tcLevels(id){const D=ZONES[id],l=(D.mobs||[]).map(([m])=>MOBS[m]).filter(m=>m&&!m.boss&&!m.world).map(m=>m.lv);return l.length?{lo:Math.min(...l),hi:Math.max(...l)}:null;}
function tcBadge(id){const L=tcLevels(id);if(!L)return null;const lv=P.lv;
  if(lv>L.hi+3)return {k:'easy',t:'Easy'};if(lv<L.lo-2)return {k:'danger',t:'Dangerous'};return {k:'right',t:'Right for you'};}
function tcBest(ids){let best=null,bl=-1;for(const id of ids){const L=tcLevels(id);if(!L||tcBadge(id).k!=='right')continue;if(L.lo>bl){bl=L.lo;best=id;}}return best;}
// a little landscape in the region's colours
function tcBanner(id){if(TC_BAN[id])return TC_BAN[id];const D=ZONES[id],th=THEMES[D.theme]||{},c=document.createElement('canvas');c.width=240;c.height=56;const g=c.getContext('2d');
  const sky={dunes:['#f0c890','#e8a060'],crypt:['#2a2238','#4a3a5a'],cave:['#1e1a26','#3a3442'],frost:['#c8e0f4','#9ab8d8'],fen:['#5a7a6a','#8aa890'],keep:['#3a1a1a','#7a3020'],arena:['#e8c890','#c89860'],heights:['#a8d0f0','#d8ecf8']}[D.theme]||['#9fd0f0','#d8f0ff'];
  const sg=g.createLinearGradient(0,0,0,56);sg.addColorStop(0,sky[0]);sg.addColorStop(1,sky[1]);g.fillStyle=sg;g.fillRect(0,0,240,56);
  const gr=(th.g&&th.g[0])||'#6aa553',dk=shade(gr,-.3);let s=id.length*977;const R=()=>((s=(s*9301+49297)%233280)/233280);
  // far shapes by theme
  g.fillStyle=shade(gr,-.15);
  if(D.theme==='frost'||D.theme==='heights'){for(let i=0;i<6;i++){const x=i*48+R()*20;g.fillStyle='#8aa0b8';g.beginPath();g.moveTo(x-30,40);g.lineTo(x,8+R()*10);g.lineTo(x+30,40);g.fill();g.fillStyle='#f4f8ff';g.beginPath();g.moveTo(x-8,18);g.lineTo(x,9);g.lineTo(x+8,18);g.fill();}}
  else if(D.theme==='dunes'||D.theme==='arena'){g.fillStyle=shade(gr,-.1);for(let i=0;i<4;i++){g.beginPath();g.ellipse(i*70+R()*20,46,60,18,0,Math.PI,0);g.fill();}}
  else if(D.theme==='crypt'||D.theme==='cave'||D.theme==='keep'){g.fillStyle=D.theme==='keep'?'#5a2a20':'#2a2432';for(let i=0;i<7;i++){const x=i*36+R()*10;g.fillRect(x,14+R()*8,9,34);g.fillRect(x-2,12+R()*8,13,4);}}
  else{for(let i=0;i<9;i++){const x=i*28+R()*14,r=10+R()*8;g.fillStyle=shade(th.canopy?th.canopy[0]:'#3f7d34',R()*.1);g.beginPath();g.arc(x,34-R()*6,r,0,7);g.fill();g.fillStyle='#5a3a22';g.fillRect(x-1.5,36,3,8);}}
  // the ground, a path, water
  g.fillStyle=gr;g.fillRect(0,42,240,14);g.fillStyle=dk;g.fillRect(0,42,240,2);
  if(th.path){g.fillStyle=th.path;g.beginPath();g.moveTo(90,56);g.quadraticCurveTo(120,46,150,44);g.lineTo(158,44);g.quadraticCurveTo(130,48,112,56);g.fill();}
  if(D.ponds&&th.water){g.fillStyle=th.water;g.beginPath();g.ellipse(200,50,22,4,0,0,7);g.fill();}
  if(D.theme==='crypt'||D.theme==='cave'||D.theme==='fen'){g.fillStyle='rgba(0,0,0,.25)';g.fillRect(0,0,240,56);}
  return TC_BAN[id]=c.toDataURL();}
// why go there: quest, bounty, world boss, gathering
function tcMarks(id){const out=[],lives=m=>(ZONES[id].mobs||[]).some(([k])=>k===m);
  try{if(typeof QS==='function')for(const q of Object.keys(QS().active||{})){const Q=QUESTS[q];if(!Q)continue;
    if((Q.obj||[]).some(o=>(o.kill&&lives(o.kill))||o.visit===id||(o.item&&(ZONES[id].mobs||[]).some(([m])=>MOBS[m]&&(MOBS[m].drops||[]).some(([d])=>d===o.item)))))out.push(['📜',`Quest: ${Q.name}`,'q']);}}catch(e){}
  try{if(typeof bState==='function'){const b=bState();if([...(b.d||[]),b.w].some(x=>x&&!x.claimed&&x.mob&&lives(x.mob)))out.push(['✦','Bounty monster here','b']);}}catch(e){}
  if(typeof NET!=='undefined'&&NET.wb&&NET.wb.z===id&&MOBS[NET.wb.b])out.push(['👑',`World boss: ${MOBS[NET.wb.b].name}`,'w']);
  try{if(typeof GATHER_KINDS==='function')for(const k of GATHER_KINDS({D:ZONES[id]}))out.push([k==='herb'?'🌿':'⛏',k==='herb'?'Herbs':'Ore','g']);}catch(e){}
  if(ZONES[id].ponds&&!ZONES[id].dungeon)out.push(['🎣','Fishing','g']);
  return out;}
function warpCardsHtml(){const ids=ZONE_ORDER.slice(1),best=tcBest(ids.filter(id=>P.visited.includes(id)));
  const order=[...ids].sort((a,b)=>(b===best)-(a===best));
  return `<div class="tclist">`+order.map(id=>{const i=ids.indexOf(id),D=ZONES[id],ok=P.visited.includes(id),cost=(i+1)*60,bd=ok?tcBadge(id):null,L=tcLevels(id),mk=ok?tcMarks(id):[];
    const ms=[...new Set((D.mobs||[]).map(([m])=>m))].map(m=>MOBS[m]).filter(m=>m&&!m.world),norm=ms.filter(m=>!m.boss).slice(0,4),boss=ms.find(m=>m.boss);
    const pics=ok&&typeof mobPicURL==='function'?[...norm,...(boss?[boss]:[])].map(m=>`<img class="tcmob${m.boss?' boss':''}" src="${mobPicURL(m.id)}" alt="" title="${esc(m.name)} · Lv ${m.lv}${m.boss?' · boss':''}">`).join(''):'';
    return `<div class="tccard${ok?'':' locked'}${id===best?' best':''}"><div class="tcban" style="background-image:url(${tcBanner(id)})"><b>${id===best?'⭐ ':''}${esc(D.name)}</b>${bd?`<span class="tcbadge ${bd.k}">${bd.t}</span>`:''}</div>`+
      `<div class="tcbody"><div class="grow"><div class="ds">${L?`Lv ${L.lo}–${L.hi}`:esc(D.lvl||'')}${D.dungeon?' · dungeon':''}${ok?'':' · not visited yet'}</div>`+
      (pics?`<div class="tcmobs">${pics}</div>`:'')+(mk.length?`<div class="tcmarks">${mk.map(([s,t,k])=>`<span class="tcmk ${k}" title="${esc(t)}">${s}<i>${esc(t)}</i></span>`).join('')}</div>`:'')+`</div>`+
      `<div class="tcgo"><span class="gold">${cost}</span><button class="btn small" data-act="warp" data-arg="${id}" ${ok&&P.gold>=cost?'':'disabled'}>Travel</button></div></div></div>`;}).join('')+`</div>`;}
if(typeof TH!=='undefined'){for(const [k,v] of [['Easy','ง่าย'],['Dangerous','อันตราย'],['Right for you','เหมาะกับคุณ'],['Bounty monster here','มีมอนสเตอร์ค่าหัว'],['Herbs','สมุนไพร'],['Ore','แร่'],['Fishing','ตกปลา'],[' · dungeon',' · ดันเจี้ยน']])if(!TH[k])TH[k]=v;
  if(typeof TH_PAT!=='undefined')TH_PAT.unshift([/^Quest: (.+)$/,(m,a)=>'เควส: '+thText(a)],[/^World boss: (.+)$/,(m,a)=>'บอสโลก: '+thText(a)],
    [/^Lv (\d+)–(\d+)( · dungeon)?( · not visited yet)?$/,(m,a,b,d,n)=>`Lv ${a}–${b}${d?' · ดันเจี้ยน':''}${n?' · ยังไม่เคยไป':''}`],[/^⭐ (.+)$/,(m,a)=>'⭐ '+thText(a)]);}
