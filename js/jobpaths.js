"use strict";
/* ================= first-job paths lead into the advanced callings (v1.18.0) =================
   Every first job has two ways to play (two paths, each with its own attack and its own role), plus core skills
   both paths use. Each advanced calling's two starting skills need first-job skills: one calling grows out of path A,
   one out of path B and one mixes both, so what a hero learns as a first job decides what they can become.
   Heroes who learned an advanced skill before v1.18.0 keep it and can still raise it (see skillMissing below). */
const JOB_PATHS={
  warden:{core:['cleave','firstaid'],paths:[
    {id:'blade',name:'Blade',th:'สายดาบ',role:'heavy hits and fast crits',roleTh:'ฟันหนักและคริติคอลเร็ว',skills:['whirl','bladecraft','duelist','lethaledge','sunder']},
    {id:'guard',name:'Guard',th:'สายโล่',role:'tank: stands in front and holds',roleTh:'แทงก์: ยืนหน้าและรับดาเมจ',skills:['ironwill','stalwart','stoneblood','secondwind']}]},
  arcanist:{core:['emberbolt','firstaid'],paths:[
    {id:'elements',name:'Elements',th:'สายธาตุ',role:'big area spells',roleTh:'เวทวงกว้างแรง ๆ',skills:['frostnova','arcstorm','emberwall','arcanefocus']},
    {id:'mana',name:'Mana',th:'สายมานา',role:'quick casts and a mana shield',roleTh:'ร่ายเร็วและโล่มานา',skills:['manaflow','swiftcast','mindspike','manashield']}]},
  ranger:{core:['twinshot','firstaid'],paths:[
    {id:'volley',name:'Volley',th:'สายระดมยิง',role:'many arrows, quick feet',roleTh:'ยิงหลายดอก เคลื่อนไหวไว',skills:['arrowrain','thornsnare','hawkeye','fleetstep']},
    {id:'marksman',name:'Marksman',th:'สายแม่นธนู',role:'one sure, deadly shot',roleTh:'ยิงนัดเดียวแม่นและแรง',skills:['owleye','doublenock','huntersluck','aimedshot']}]},
  cleric:{core:['smite','firstaid'],paths:[
    {id:'battle',name:'Battle',th:'สายนักรบ',role:'fights up close with a mace',roleTh:'สู้ระยะประชิดด้วยกระบอง',skills:['macemastery','holystrike']},
    {id:'healer',name:'Healer',th:'สายผู้รักษา',role:'heals and protects the party',roleTh:'รักษาและปกป้องปาร์ตี้',skills:['mend','blessing','haven','faith','renew','divineguard']}]},
};
// what each advanced calling's starting skills need from the first job
const CROSS_REQ={
  // Warden: Ravager = Blade, Bulwark = Guard, Runeguard = both
  rendingblow:{sunder:3},bloodlust:{duelist:3},
  shieldbash:{stalwart:3},unbreakable:{stoneblood:3},
  runestrike:{bladecraft:3},runiclore:{ironwill:3},
  // Arcanist: Stormcaller = Elements, Hexweaver = Mana, Chronomancer = both
  glaciallance:{frostnova:3},elemmastery:{arcanefocus:3},
  shadowlance:{mindspike:3},darkpact:{manashield:1},
  timebolt:{frostnova:3},temporalflow:{manaflow:5},
  // Ranger: Wildstalker = Volley, Sharpshooter = Marksman, Falconer = both
  venomarrow:{thornsnare:3},predator:{fleetstep:3},
  piercingshot:{aimedshot:3},steadyhands:{owleye:5},
  falconstrike:{hawkeye:3},keentalon:{huntersluck:3},
  // Cleric: Templar = Battle, Oracle = Healer, Ascetic = both
  crusade:{holystrike:3},zeal:{macemastery:5},
  sanctuary:{renew:3},insight:{faith:5},
  palmstrike:{macemastery:3},innercalm:{faith:3},
};
for(const id in CROSS_REQ)if(SKILLS[id])SKILL_REQ[id]=Object.assign({},SKILL_REQ[id]||{},CROSS_REQ[id]);

// a skill learned before these links existed stays learnable (raise it further) without the new first-job need
{const _smJP=skillMissing;skillMissing=function(id){const miss=_smJP.apply(this,arguments);const x=CROSS_REQ[id];
  if(!x||!P||!P.skills||!((P.skills[id]||0)>0))return miss;
  const old=new Set(Object.keys(x).map(k=>`${SKILLS[k].name} ${x[k]}`));return miss.filter(m=>!old.has(m));};}

const jpLabel=p=>LANG==='th'?p.th:p.name+' path';
// the path(s) of a first job a skill belongs to: null for skills outside the job, 'core' for skills both paths use
function skillPath(id,job){const J=JOB_PATHS[job];if(!J)return null;if(J.core.includes(id))return 'core';return J.paths.find(p=>p.skills.includes(id))||null;}
// the paths an advanced calling grows out of (one = that path, two = a mix of both)
function jobPaths(job2){const k=CLASSES[job2];if(!k||!k.own)return [];const J=JOB_PATHS[k.base];if(!J)return [];const out=[];
  for(const s of k.own)for(const r in CROSS_REQ[s]||{}){const p=skillPath(r,k.base);if(p&&p!=='core'&&!out.includes(p))out.push(p);}
  return J.paths.filter(p=>out.includes(p));}
// every first-job skill an advanced calling needs: [[skill, level, starting skill that needs it]]
function jobNeeds(job2){const k=CLASSES[job2];if(!k||!k.own)return [];const out=[];
  for(const s of k.own)for(const r in CROSS_REQ[s]||{})out.push([r,CROSS_REQ[s][r],s]);return out;}
const jpChip=(id,lv)=>`<span class="cm ${(P.skills[id]||0)>=lv?'ok':''}">${esc(SKILLS[id].name)} ${lv}</span>`;
const jpTag=p=>`<span class="jptag" style="--pc:${p.id==='blade'||p.id==='elements'||p.id==='volley'||p.id==='battle'?'#e0904a':'#6ab0e0'}">${esc(jpLabel(p))}</span>`;

// Guild Hall: under each advanced calling, the path it grows from and what it needs, ticked off as you learn them
function jobNeedsHtml(job2){const ps=jobPaths(job2),need=jobNeeds(job2);if(!need.length)return '';
  return `<span class="jpneed"><span class="jprow">${ps.map(jpTag).join('<span class="jpplus">+</span>')}</span>`+
    `<span class="jprow"><span class="muted">Needs from your first job:</span> ${need.map(([r,l])=>jpChip(r,l)).join(' ')}</span></span>`;}

// skill card: the path a first-job skill is on and which advanced callings need it; for an advanced skill, what it needs
function skillLeadsHtml(id){const sk=SKILLS[id],c=CLASSES[P.cls];if(!sk||!c)return '';const base=c.tier?c.base:P.cls;if(!JOB_PATHS[base])return '';
  let h='';const p=skillPath(id,base);
  if(p==='core')h+=`<div class="jplead"><span class="jptag core">Core skill</span> <span class="muted">both paths use it</span></div>`;
  else if(p)h+=`<div class="jplead">${jpTag(p)} <span class="muted">${esc(LANG==='th'?p.roleTh:p.role)}</span></div>`;
  const users=[];for(const j in JOB2)if(JOB2[j].base===base)for(const s of CLASSES[j].own||[])if(CROSS_REQ[s]&&CROSS_REQ[s][id])users.push([j,s,CROSS_REQ[s][id]]);
  const from=CROSS_REQ[id];if(from)h+=`<div class="jplead"><span class="muted">Grows from:</span> `+Object.keys(from).map(r=>{const pr=skillPath(r,base);return (pr&&pr!=='core'?jpTag(pr)+' ':'')+jpChip(r,from[r]);}).join(' ')+`</div>`;
  if(users.length)h+=`<div class="jplead"><span class="muted">Leads to:</span> `+users.map(([j,s,l])=>`<b style="color:${CLASSES[j].acc}">${esc(CLASSES[j].name)}</b> <span class="muted">(${esc(SKILLS[s].name)}${LANG==='th'?' ต้องเลเวล ':', needs Lv '}${l})</span>`).join(' · ')+`</div>`;
  return h;}

if(typeof TH!=='undefined')Object.assign(TH,{'Needs from your first job:':'ต้องมีจากอาชีพแรก:','Core skill':'ทักษะหลัก','both paths use it':'ใช้ได้ทั้งสองสาย',
  'Leads to:':'นำไปสู่:','Grows from:':'ต่อยอดจาก:','Blade path':'สายดาบ','Guard path':'สายโล่','Elements path':'สายธาตุ','Mana path':'สายมานา','Volley path':'สายระดมยิง',
  'Marksman path':'สายแม่นธนู','Battle path':'สายนักรบ','Healer path':'สายผู้รักษา'});
for(const J of Object.values(JOB_PATHS))for(const p of J.paths)if(typeof TH!=='undefined')TH[p.role]=p.roleTh;

(()=>{const st=document.createElement('style');st.textContent=`
.jpneed{display:flex;flex-direction:column;gap:3px;margin-top:4px}.jprow{display:flex;flex-wrap:wrap;gap:4px;align-items:center}
.jptag{display:inline-block;padding:1px 7px;border-radius:9px;font-size:11px;font-weight:700;color:#fff;background:color-mix(in srgb,var(--pc,#888) 70%,#000);border:1px solid var(--pc,#888)}
.jptag.core{--pc:#b0a080}.jpplus{opacity:.7;font-weight:700}.jplead{margin:5px 0 0;font-size:12px;line-height:1.45}`;document.head.appendChild(st);})();
