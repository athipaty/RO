// Skill tree lines (js/skilllinks.js): for every calling, no line runs over a skill other than the two it joins (phone and desktop)
const { player, newRoom, wait } = require('./helpers');
module.exports = async t => {const g=await player('Treecheck',newRoom(),{server:'http://127.0.0.1:9'});try{
for(const W of [400,1200]){await g.page.setViewport({width:W,height:900});await wait(300);
const r=await g.ev(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms));const out=[];
  for(const cls of Object.keys(CLASSES)){P.cls=cls;P.skills={};S=computeStats();closePanel();openPanel('skills');await w(120);
    const pad=panel.querySelector('.skpleft');if(!pad){out.push(cls+': no pad');continue;}
    const svg=pad.querySelector('svg.sklinks');if(!svg)continue;const br=pad.getBoundingClientRect(),sx=pad.scrollLeft,sy=pad.scrollTop;
    const icons=[...pad.querySelectorAll('.skpic[data-arg]')].map(el=>{const q=el.getBoundingClientRect();return {id:el.dataset.arg,l:q.left-br.left+sx,r:q.right-br.left+sx,t:q.top-br.top+sy,b:q.bottom-br.top+sy};});
    const paths=[...svg.querySelectorAll('path')].filter(p=>p.getAttribute('fill')==='none');
    // links in the same order as skilllinks builds them
    const nodes=new Map(icons.map(i=>[i.id,i]));const links=[];for(const i of icons){const req=SKILL_REQ[i.id];if(!req)continue;for(const k in req){const p=nodes.get(k);if(!p||i.t<=p.b)continue;links.push([k,i.id]);}}
    paths.forEach((p,n)=>{const d=p.getAttribute('d');const nums=d.match(/-?\d+(\.\d+)?/g).map(Number);const segs=[];let x=nums[0],y=nums[1];
      const cmds=d.match(/[MVH][^MVH]*/g);for(const c of cmds){const v=+c.slice(1).split(',').pop();if(c[0]==='M'){x=+c.slice(1).split(',')[0];y=+c.slice(1).split(',')[1];}else if(c[0]==='V'){segs.push([x,y,x,v]);y=v;}else{segs.push([x,y,v,y]);x=v;}}
      const [a,b]=links[n]||[];for(const ic of icons){if(ic.id===a||ic.id===b)continue;const pad2=3;
        for(const [x1,y1,x2,y2] of segs){const lx=Math.min(x1,x2),hx=Math.max(x1,x2),ly=Math.min(y1,y2),hy=Math.max(y1,y2);
          if(hx>ic.l+pad2&&lx<ic.r-pad2&&hy>ic.t+pad2&&ly<ic.b-pad2){out.push(`${cls}: ${a}→${b} crosses ${ic.id}`);break;}}}});}
  return out;});
t.ok(!r.length,`no skill tree line runs over another skill's icon at ${W}px wide (every calling)`+(r.length?': '+r.join('; '):''));}
t.ok(g.page.errors.length===0,'no script errors');}finally{await g.close();}};
