/* ================= gear compare in the bag (v1.89.0) =================
   Items window, Equip tab: every piece of spare gear shows a big coloured badge (▲ BETTER / ▼ WORSE / ◆ MIXED / = SAME)
   next to its name, and a line of green/red chips with exactly how your stats would change if you put it on instead of
   what you wear now. The numbers come from computeStats() itself (the piece is tried on for a moment and taken off
   again), so refines, sigils, awakenings, job bonuses, mounts and pets are all counted. With both accessory slots full
   it compares against each one (I and II). */
const GC_STATS=[ // [key, label, Thai label, how to read it]
  ['atk','ATK','ATK'],['matk','MATK','MATK'],['def','DEF','DEF'],['maxhp','Max HP','HP สูงสุด'],['maxsp','Max SP','SP สูงสุด'],
  ['hit','HIT','HIT'],['flee','FLEE','FLEE'],['crit','CRIT','CRIT','%'],['aspd','Attacks/sec','โจมตี/วิ','f2'],['speed','Move','ความเร็ว'],
  ['range','Range','ระยะ'],['critdmg','Crit dmg','แรงคริ','%'],['dbl','Double','ตีเบิ้ล','%'],['cast','Cast time','ร่าย','%neg'],
  ['dmgred','Dmg taken','ลดดาเมจ','%neg'],['heal','Healing','ฮีล','%']];
const gcTh=()=>typeof LANG!=='undefined'&&LANG==='th';
let gcCache=new Map(),gcKey='';
function gcRead(s){const o={};for(const [k] of GC_STATS)o[k]=k==='aspd'?(s.delay?1/s.delay:0):(+s[k]||0);return o;}
/* stats with `e` worn in `slot` (null = as you are now); always leaves P.eq and S as they were */
function gcStatsWith(slot,e){const old=P.eq[slot];
  try{if(slot)P.eq[slot]=e;return gcRead(computeStats());}finally{if(slot)P.eq[slot]=old;}}
function gcSlots(it){if(it.type!=='accessory')return [it.type];const a=P.eq.accessory,b=P.eq.acc2;
  if(a&&b)return ['accessory','acc2'];return [a&&!b?'acc2':'accessory'];} // the same slot useInv() would fill
function gcDiff(base,next){const out=[];let up=0,down=0;
  for(const [k,l,lt,f] of GC_STATS){let d=next[k]-base[k];if(f==='f2'?Math.abs(d)<.005:Math.abs(d)<.5)continue;
    const good=f==='%neg'?d<0:d>0;good?up++:down++;
    const n=f==='f2'?(d>0?'+':'−')+Math.abs(d).toFixed(2):(d>0?'+':'−')+Math.round(Math.abs(d))+(f&&f[0]==='%'?'%':'');
    out.push({l:gcTh()?lt:l,n,good});}
  return {out,up,down,verdict:!up&&!down?'same':up&&!down?'better':down&&!up?'worse':'mixed'};}
const GC_BADGE={better:['▲ BETTER','▲ ดีกว่า'],worse:['▼ WORSE','▼ แย่กว่า'],mixed:['◆ MIXED','◆ ได้-เสีย'],same:['= SAME','= เท่าเดิม'],no:['✕ CAN\'T USE','✕ ใส่ไม่ได้']};
function gcBadge(v){return `<span class="gcbadge gc-${v}">${GC_BADGE[v][gcTh()?1:0]}</span>`;}
/* {badge, html} for one bag item, or null for things that are not gear */
function gearCompare(e){const it=ITEMS[e.id];if(!it||!['weapon','armor','head','accessory','face','mouth','shoes'].includes(it.type))return null;
  const sig=JSON.stringify([P.eq,P.st,P.lv,P.cls,P.job,P.riding,P.reborn,P.jlv]);if(sig!==gcKey){gcKey=sig;gcCache=new Map();}
  const ck=JSON.stringify(e);if(gcCache.has(ck))return gcCache.get(ck);
  let r;const why=typeof canEquip==='function'?canEquip(it):null;
  if(why)r={verdict:'no',badge:gcBadge('no'),html:`<div class="gcline"><span class="gcvs">${esc(why)}</span></div>`};
  else{const base=gcStatsWith(null),rows=gcSlots(it).map(slot=>{const cur=P.eq[slot],d=gcDiff(base,gcStatsWith(slot,e));return {slot,cur,...d};});
    const order=['better','mixed','same','worse'],best=rows.map(x=>x.verdict).sort((a,b)=>order.indexOf(a)-order.indexOf(b))[0];
    const html=rows.map(x=>{const vs=x.cur?(gcTh()?'เทียบกับ ':'vs ')+esc(ITEMS[x.cur.id].name)+(rows.length>1?(x.slot==='acc2'?' (II)':' (I)'):''):(gcTh()?'ช่องนี้ว่าง':'slot empty');
      const chips=x.out.length?x.out.map(c=>`<span class="gcchip ${c.good?'up':'dn'}">${c.l} ${c.n}</span>`).join(''):`<span class="gcchip eq">${gcTh()?'ค่าสถานะไม่เปลี่ยน':'no stat change'}</span>`;
      return `<div class="gcline">${rows.length>1?gcBadge(x.verdict):''}<span class="gcvs">${vs}</span>${chips}</div>`;}).join('');
    r={verdict:best,badge:gcBadge(best),html};}
  computeStats(); // put side effects (sigil effects, pet buff) back exactly as you are
  gcCache.set(ck,r);return r;}
(function(){if(typeof document==='undefined')return;const st=document.createElement('style');st.textContent=
  '.gcbadge{display:inline-block;font-size:11.5px;font-weight:900;padding:2px 7px;border-radius:6px;margin-left:6px;vertical-align:1px;letter-spacing:.3px;white-space:nowrap}'+
  '.gc-better{background:#1f7a3a;color:#eaffef}.gc-worse{background:#8a2a2a;color:#ffecec}.gc-mixed{background:#8a6a14;color:#fff6dc}.gc-same{background:#3a4352;color:#dfe6f0}.gc-no{background:#3a3036;color:#e9b9b9}'+
  '.row.gcr-better{box-shadow:inset 4px 0 0 #3ccf6a}.row.gcr-worse{box-shadow:inset 4px 0 0 #d65050}.row.gcr-mixed{box-shadow:inset 4px 0 0 #e0b040}.row.gcr-no{opacity:.75}'+
  '.gchead{display:flex;flex-wrap:wrap;align-items:center;gap:2px}.gchead .gcbadge{margin-left:6px}'+
  '.gcline{display:flex;flex-wrap:wrap;align-items:center;gap:4px;margin-top:4px}.gcline .gcbadge{margin-left:0}'+
  '.gcvs{font-size:11.5px;color:var(--muted);margin-right:2px}'+
  '.gcchip{font-size:12.5px;font-weight:800;padding:1px 6px;border-radius:5px;white-space:nowrap}'+
  '.gcchip.up{background:rgba(60,207,106,.16);color:#5be38a}.gcchip.dn{background:rgba(214,80,80,.16);color:#ff7a7a}.gcchip.eq{background:rgba(150,160,175,.14);color:var(--muted);font-weight:600}';
  document.head.appendChild(st);})();
