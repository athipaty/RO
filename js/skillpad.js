"use strict";
/* ================= phones: the skill tree as icons, details on the right =================
   On touch screens the Skills window shows every skill as a picture in a compact tree (grouped by calling, in the
   order you unlock them, arrows between tiers). Tap one and its full card opens on the right: what it does, its level,
   SP, what it needs, Learn / Level up, hotbar keys and the cast level. Since v1.0.7 desktop uses it too, in a wider window. */
const SKP={sel:null};
function skillSections(){const c=CLASSES[P.cls];if(!c)return [];if(P.cls==='novice')return [['Novice',['firstaid']]];
  if(c.tier===3){const p=CLASSES[c.parent],own3=new Set(c.own),own2=new Set(p.own);return [[CLASSES[c.base].name,c.skills.filter(s=>!own3.has(s)&&!own2.has(s))],[p.name,p.own],[c.name,c.own]];}
  if(c.tier===2){const own=new Set(c.own);return [[CLASSES[c.base].name,c.skills.filter(s=>!own.has(s))],[c.name,c.own]];}
  return [[c.name,c.skills]];}
const skpOn=()=>true; // since v1.0.7 desktop uses the icon tree too (lines between skills read better than a wall of cards)
{const _stP=skillTreeHtml;skillTreeHtml=function(){if(!skpOn()||!P)return _stP.apply(this,arguments);
  const full=_stP.apply(this,arguments);
  // keep the header (title, points, build guide bar) from the usual tree
  const cut=full.indexOf('<div class="ttier"')>=0?full.indexOf('<div class="ttier"'):full.indexOf('<h3');const head=cut>0?full.slice(0,cut).replace(/<h3[^>]*>[^<]*<\/h3>\s*$/,''):full;
  const secs=skillSections(),all=secs.flatMap(s=>s[1]);if(!SKP.sel||!all.includes(SKP.sel))SKP.sel=(typeof buildNextSkill==='function'&&P.build&&buildNextSkill(buildById(P.build))||{}).id||all[0];
  const nx=typeof buildNextSkill==='function'&&P.build?buildNextSkill(buildById(P.build)):null;
  let left='';
  for(const [title,ids] of secs){
    left+=`<div class="skpsec">${esc(title)}</div>`;
    // laid out as branches: each starting skill heads a column and the skills it unlocks sit right under it, so
    // lines drop straight down or turn at right angles and never cross (skillBranchLayout)
    const L=skillBranchLayout(ids.filter(id=>SKILLS[id])),hl=(()=>{const ps=skillPathSet(SKP.sel);return ps&&ids.some(i=>ps.has(i))?ps:null;})(); // fade in every section the chosen skill's path goes through
    left+=`<div class="skpgrid" style="--cols:${L.cols};--rows:${L.rows}">`+[...L.pos].map(([id,q])=>{const sk=SKILLS[id],l=P.skills[id]||0,locked=skillMissing(id).length>0;
      return `<button class="skpic${l?' has':''}${locked?' locked':''}${SKP.sel===id?' sel':''}${nx&&nx.id===id?' next':''}${sk.kind==='passive'?' pas':''}${hl&&!hl.has(id)?' dim':''}" style="--c:${q.col};--r:${q.row}" data-act="sksel" data-arg="${id}" aria-label="${esc(sk.name)} level ${l} of ${sk.max}">`+
        `<img src="${skillIconURL(id)}" alt="">${sk.party?'<span class="skpparty">party</span>':''}<span class="skplv">${l}/${sk.max}</span><span class="skpnm">${esc(sk.name)}</span></button>`;}).join('')+`</div>`;}
  const card=skillTiers([SKP.sel]).replace('<div class="ttier">','<div class="ttier skpcard">');
  const sk=SKILLS[SKP.sel],nl=Math.min(sk.max,(P.skills[SKP.sel]||0)+1);
  const more=(P.skills[SKP.sel]||0)<sk.max?`<div class="skpnext"><span class="muted">At Lv ${nl}:</span> ${esc(sk.desc(nl))}</div>`:'';
  return head+`<div class="skpwrap"><div class="skpleft">${left}</div><div class="skpright">${card}${typeof skillLeadsHtml==='function'?skillLeadsHtml(SKP.sel):''}${(P.skills[SKP.sel]||0)?more:''}</div></div>`;};}
PANEL_ACTS.sksel=id=>{if(!SKILLS[id])return;SKP.sel=id;sfx('click');refreshPanel();};
/* ---- branch layout for one section: {pos: Map(id -> {row, col}), cols, rows} ----
   depth = 1 + the deepest skill it needs (in this section); each skill hangs under its deepest requirement; a
   parent is centred over the span of its children; skills that need nothing and unlock nothing fill free cells
   (never on a line's path), so the tree stays narrow */
function skillBranchLayout(ids){const inS=new Set(ids),order=new Map(ids.map((id,i)=>[id,i]));
  const pars=id=>Object.keys(SKILL_REQ[id]||{}).filter(k=>inS.has(k)&&k!==id);
  const depth=new Map();const dep=(id,seen=new Set())=>{if(depth.has(id))return depth.get(id);if(seen.has(id))return 0;seen.add(id);const p=pars(id);const d=p.length?Math.max(...p.map(k=>dep(k,seen)))+1:0;depth.set(id,d);return d;};
  ids.forEach(id=>dep(id));
  const prim=id=>{const p=pars(id);return p.length?p.reduce((a,b)=>dep(b)>dep(a)?b:a):null;};
  const kids=new Map();for(const id of ids){const pp=prim(id);if(pp){if(!kids.has(pp))kids.set(pp,[]);kids.get(pp).push(id);}}
  for(const a of kids.values())a.sort((x,y)=>order.get(x)-order.get(y));
  const width=new Map();const wid=id=>{if(width.has(id))return width.get(id);const k=kids.get(id)||[];const w=Math.max(1,k.reduce((s,c)=>s+wid(c),0));width.set(id,w);return w;};
  const pos=new Map();
  const place=(id,c0)=>{let c=c0;for(const ch of kids.get(id)||[]){place(ch,c);c+=wid(ch);}pos.set(id,{row:dep(id),col:c0+(wid(id)-1)/2});};
  const alone=id=>!prim(id)&&!(kids.get(id)||[]).length&&!ids.some(o=>pars(o).includes(id));
  let col=0;for(const r of ids.filter(id=>!prim(id)&&!alone(id)))place(r,col),col+=wid(r);
  // free cells for the lone skills: not taken, and not on the vertical path of any line
  const rows0=Math.max(1,...[...pos.values()].map(q=>q.row+1)),busy=(r,c)=>{for(const q of pos.values())if(q.row===r&&Math.abs(q.col-c)<.6)return true;
    for(const [id,q] of pos)for(const k of pars(id)){const pq=pos.get(k);if(pq&&Math.abs(pq.col-c)<.6&&pq.row<r&&q.row>r)return true;}return false;};
  const maxCols=Math.max(col,4);
  for(const id of ids.filter(alone)){let done=false;for(let r=0;r<rows0+6&&!done;r++)for(let c=0;c<maxCols&&!done;c++)if(!busy(r,c)){pos.set(id,{row:r,col:c});done=true;}
    if(!done){pos.set(id,{row:0,col});col++;}}
  const cols=Math.max(1,...[...pos.values()].map(q=>Math.ceil(q.col+.01)));
  return {pos,cols,rows:Math.max(1,...[...pos.values()].map(q=>q.row+1))};}
// the selected skill, everything it needs (above) and everything it unlocks (below)
function skillPathSet(id){if(!id||!SKILLS[id])return null;const set=new Set([id]);
  const up=k=>{for(const p in SKILL_REQ[k]||{})if(!set.has(p)){set.add(p);up(p);}};up(id);
  const down=k=>{for(const c in SKILL_REQ)if(SKILL_REQ[c][k]!==undefined&&!set.has(c)){set.add(c);down(c);}};down(id);return set;}
