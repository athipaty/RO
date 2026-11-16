"use strict";
/* ================= skill tree lines =================
   Lines run from each skill down to the skills it unlocks, like a classic skill tree, so you can read the order
   from top to bottom. Gold and solid when the requirement is met, grey and dashed while it is not; the level
   needed is a tag on the child's corner. Lines drop straight or turn at right angles in their own lanes; the chosen
   skill's path (what it needs and what it unlocks) stays bright and the rest fades. Drawn behind the icons on phones (js/skillpad.js) and behind the cards on desktop. */
function skillLinkSvg(box,nodes){const old=box.querySelector(':scope>svg.sklinks');if(old)old.remove();if(!nodes.size)return;
  const br=box.getBoundingClientRect(),sx=box.scrollLeft||0,sy=box.scrollTop||0,W=Math.max(box.scrollWidth,br.width),H=Math.max(box.scrollHeight,br.height);
  const NS='http://www.w3.org/2000/svg',svg=document.createElementNS(NS,'svg');svg.setAttribute('class','sklinks');svg.setAttribute('width',W);svg.setAttribute('height',H);svg.setAttribute('aria-hidden','true');
  const hl=typeof skillPathSet==='function'?skillPathSet(typeof SKP!=='undefined'?SKP.sel:null):null;
  const R=el=>{const r=el.getBoundingClientRect();return {l:r.left-br.left+sx,t:r.top-br.top+sy,r:r.right-br.left+sx,b:r.bottom-br.top+sy,w:r.width};};
  // every link: parent bottom-centre to child top-centre
  const links=[];for(const [id,el] of nodes){const req=SKILL_REQ[id];if(!req)continue;const c=R(el);if(!c.w)continue;
    for(const k in req){const pel=nodes.get(k);if(!pel)continue;const p=R(pel);if(!p.w||c.t<=p.b)continue;links.push({id,k,lv:req[k],p,c});}}
  // each parent gets its own lane in the gap above the child row, so turns never run on top of each other
  const gaps=new Map();for(const L of links){const key=Math.round(L.c.t);if(!gaps.has(key))gaps.set(key,[]);const a=gaps.get(key);if(!a.includes(L.k))a.push(L.k);}
  for(const a of gaps.values())a.sort((x,y)=>nodes.get(x).getBoundingClientRect().left-nodes.get(y).getBoundingClientRect().left);
  const add=(tag,at)=>{const e=document.createElementNS(NS,tag);for(const k in at)e.setAttribute(k,at[k]);svg.appendChild(e);return e;};
  const kids=new Map();
  const selGrid=box.querySelector('.skpic.sel')?.closest('.skpgrid')||null;
  for(const L of links){const met=(P.skills[L.k]||0)>=L.lv,same=!selGrid||nodes.get(L.id).closest('.skpgrid')===selGrid,on=!hl||!same||(hl.has(L.k)&&hl.has(L.id)),col=met?'#e8c25a':'#7d8798';
    const x1=(L.p.l+L.p.r)/2,y1=L.p.b-2,x2=(L.c.l+L.c.r)/2,y2=L.c.t+1,lanes=gaps.get(Math.round(L.c.t)),li=lanes.indexOf(L.k),ny=lanes.length;
    const yl=Math.max(y1+6,y2-10-(ny-1-li)*6);
    const d=Math.abs(x1-x2)<2?`M${x1},${y1} V${y2-5}`:`M${x1},${y1} V${yl} H${x2} V${y2-5}`;
    add('path',{d,fill:'none',stroke:col,'stroke-width':met?'2.4':'1.8','stroke-linejoin':'round','stroke-linecap':'round',...(met?{}:{'stroke-dasharray':'5 4'}),opacity:on?'1':'.18'});
    add('path',{d:`M${x2-5},${y2-8} L${x2},${y2-1} L${x2+5},${y2-8} Z`,fill:col,opacity:on?'1':'.18'});
    // the level it needs, as a tag on the child's top-right corner (one under the other when it needs two skills)
    const n=kids.get(L.id)||0;kids.set(L.id,n+1);const tx=L.c.r-7,ty=L.c.t+7+n*14;
    add('rect',{x:tx-8,y:ty-6.5,width:16,height:13,rx:6.5,fill:met?'#3a2e12':'#1c2230',stroke:col,'stroke-width':'1',opacity:on?'1':'.3'});
    const t=add('text',{x:tx,y:ty+3.5,'text-anchor':'middle','font-size':'9.5','font-weight':'700',fill:met?'#ffe08a':'#aab4c4',opacity:on?'1':'.3'});t.textContent=L.lv;}
  if(links.length)box.insertBefore(svg,box.firstChild);
  // the level tags sit above the icons
  svg.style.zIndex=links.length?'2':'0';}
function drawSkillLinks(){if(panelKind!=='skills'||panel.hidden||!P)return;
  const pad=panel.querySelector('.skpleft');
  if(pad){const m=new Map();pad.querySelectorAll('.skpic[data-arg]').forEach(el=>m.set(el.dataset.arg,el));skillLinkSvg(pad,m);return;}
  // desktop cards: each card is found by its Learn button; the lines go in a layer inside the window
  const m=new Map();panel.querySelectorAll('.snode').forEach(el=>{const b=el.querySelector('[data-act="learn"][data-arg]');if(b)m.set(b.dataset.arg,el);});skillLinkSvg(panel,m);}
{const _rpL=refreshPanel;refreshPanel=function(){const r=_rpL.apply(this,arguments);try{if(panelKind==='skills')requestAnimationFrame(drawSkillLinks);}catch(e){}return r;};}
addEventListener('resize',()=>{if(panelKind==='skills')requestAnimationFrame(drawSkillLinks);});
