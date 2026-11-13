"use strict";
/* ================= skill tree lines =================
   Lines run from each skill down to the skills it unlocks, like a classic skill tree, so you can read the order
   from top to bottom. Gold and solid when the requirement is met, grey and dashed while it is not; the level
   needed sits on the line. Drawn behind the icons on phones (js/skillpad.js) and behind the cards on desktop. */
function skillLinkSvg(box,nodes){const old=box.querySelector(':scope>svg.sklinks');if(old)old.remove();if(!nodes.size)return;
  const br=box.getBoundingClientRect(),sx=box.scrollLeft||0,sy=box.scrollTop||0,W=Math.max(box.scrollWidth,br.width),H=Math.max(box.scrollHeight,br.height);
  const NS='http://www.w3.org/2000/svg',svg=document.createElementNS(NS,'svg');svg.setAttribute('class','sklinks');svg.setAttribute('width',W);svg.setAttribute('height',H);svg.setAttribute('aria-hidden','true');
  let n=0;
  for(const [id,el] of nodes){const req=SKILL_REQ[id];if(!req)continue;const cr=el.getBoundingClientRect();if(!cr.width)continue;
    for(const k in req){const pel=nodes.get(k);if(!pel)continue;const pr=pel.getBoundingClientRect();if(!pr.width)continue;
      const x1=pr.left-br.left+sx+pr.width/2,y1=pr.bottom-br.top+sy-2,x2=cr.left-br.left+sx+cr.width/2,y2=cr.top-br.top+sy+2;if(y2<=y1)continue;
      const met=(P.skills[k]||0)>=req[k],my=(y1+y2)/2,col=met?'#e8c25a':'#7d8798';
      const path=document.createElementNS(NS,'path');path.setAttribute('d',`M${x1},${y1} C${x1},${my} ${x2},${my} ${x2},${y2-5}`);path.setAttribute('fill','none');path.setAttribute('stroke',col);
      path.setAttribute('stroke-width',met?'2.4':'1.8');if(!met)path.setAttribute('stroke-dasharray','5 4');path.setAttribute('stroke-linecap','round');svg.appendChild(path);
      const tip=document.createElementNS(NS,'path');tip.setAttribute('d',`M${x2-5},${y2-8} L${x2},${y2-1} L${x2+5},${y2-8} Z`);tip.setAttribute('fill',col);svg.appendChild(tip);
      // the level it needs, on the line
      const tx=(x1+x2)/2,ty=my;const bg=document.createElementNS(NS,'rect');bg.setAttribute('x',tx-9);bg.setAttribute('y',ty-7);bg.setAttribute('width',18);bg.setAttribute('height',13);bg.setAttribute('rx',6);
      bg.setAttribute('fill',met?'#3a2e12':'#1c2230');bg.setAttribute('stroke',col);bg.setAttribute('stroke-width','1');svg.appendChild(bg);
      const tx2=document.createElementNS(NS,'text');tx2.setAttribute('x',tx);tx2.setAttribute('y',ty+3.5);tx2.setAttribute('text-anchor','middle');tx2.setAttribute('font-size','9.5');tx2.setAttribute('font-weight','700');
      tx2.setAttribute('fill',met?'#ffe08a':'#aab4c4');tx2.textContent=req[k];svg.appendChild(tx2);n++;}}
  if(n)box.insertBefore(svg,box.firstChild);}
function drawSkillLinks(){if(panelKind!=='skills'||panel.hidden||!P)return;
  const pad=panel.querySelector('.skpleft');
  if(pad){const m=new Map();pad.querySelectorAll('.skpic[data-arg]').forEach(el=>m.set(el.dataset.arg,el));skillLinkSvg(pad,m);return;}
  // desktop cards: each card is found by its Learn button; the lines go in a layer inside the window
  const m=new Map();panel.querySelectorAll('.snode').forEach(el=>{const b=el.querySelector('[data-act="learn"][data-arg]');if(b)m.set(b.dataset.arg,el);});skillLinkSvg(panel,m);}
{const _rpL=refreshPanel;refreshPanel=function(){const r=_rpL.apply(this,arguments);try{if(panelKind==='skills')requestAnimationFrame(drawSkillLinks);}catch(e){}return r;};}
addEventListener('resize',()=>{if(panelKind==='skills')requestAnimationFrame(drawSkillLinks);});
