"use strict";
/* ================= where each stat comes from (v1.93.0) =================
   The Equipment window shows, under ATK, MATK, DEF, HIT, FLEE, CRIT and attack speed, how much of it is your own
   (stats, level and job), how much your skills' passives add, your gear (with refines and awakenings), the sigils in
   it, and your buffs (and pet) right now. Each part is the real difference computeStats() makes when that layer is
   taken away (buffs first, then sigils, gear and skills), so the parts always add up to the total shown. */
const SP_STATS=[['atk','ATK'],['matk','MATK'],['def','DEF'],['hit','HIT'],['flee','FLEE'],['crit','CRIT'],['aspd','Attacks/sec']];
const SP_TH={base:'พื้นฐาน',skills:'สกิล',gear:'อุปกรณ์',sigils:'ซิจิล',buffs:'บัฟ','Attacks/sec':'โจมตี/วิ'};
const spRead=s=>{const o={};for(const [k] of SP_STATS)o[k]=k==='aspd'?(s.delay?1/s.delay:0):(+s[k]||0);return o;};
function statParts(){const eq=P.eq,sk=P.skills,bf=P.buffs,pet=P.pet;let out=null;
  try{const full=spRead(computeStats());
    P.buffs={};P.pet=null;const nb=spRead(computeStats());
    const bare={};for(const s in eq){const e=eq[s];bare[s]=e?{...e,s:(e.s||[]).map(()=>null)}:e;}P.eq=bare;const ns=spRead(computeStats());
    P.eq={};const ng=spRead(computeStats());
    P.skills={};const base=spRead(computeStats());
    out={};for(const [k] of SP_STATS)out[k]={total:full[k],base:base[k],skills:ng[k]-base[k],gear:ns[k]-ng[k],sigils:nb[k]-ns[k],buffs:full[k]-nb[k]};
  }finally{P.eq=eq;P.skills=sk;P.buffs=bf;P.pet=pet;S=computeStats();}
  return out;}
function statPartsHtml(){const th=typeof LANG!=='undefined'&&LANG==='th',L=k=>th&&SP_TH[k]||k,parts=statParts();if(!parts)return '';
  const f=(k,v)=>k==='aspd'?v.toFixed(2):k==='crit'?(+v.toFixed(1)).toString():String(Math.round(v));
  const z=(k,v)=>k==='aspd'?Math.abs(v)<.005:k==='crit'?Math.abs(v)<.05:Math.abs(v)<.5;
  // (v1.94.1) just the numbers: ATK (208 + 114 + 577 + 418) 1317, each part in its colour, one small legend above
  const PARTS=['base','skills','gear','sigils','buffs'];
  let h=`<div class="splg">`+PARTS.map(p=>`<span class="sp-${p}">${L(p)}</span>`).join('')+`</div><div class="spgrid">`;
  for(const [k,name] of SP_STATS){const p=parts[k],nums=[];
    for(const part of PARTS){const v=p[part];if(part!=='base'&&z(k,v))continue;nums.push(`<span class="sp-${part}">${nums.length?(v<0?'− ':'+ '):''}${f(k,Math.abs(v))}</span>`);}
    h+=`<div class="spr"><span class="spk">${L(name)}</span><span class="spn">${nums.length>1?'('+nums.join(' ')+')':''}</span><b>${f(k,p.total)}</b></div>`;}
  return h+`</div>`;}
(function(){if(typeof document==='undefined')return;const st=document.createElement('style');st.textContent=
  '.splg{display:flex;flex-wrap:wrap;gap:4px;margin:4px 0 2px;font-size:10px;font-weight:700}.splg span{padding:0 5px;border-radius:5px}'+
  '.spgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:3px 14px;margin:2px 0 6px}'+
  '.spr{display:flex;align-items:baseline;gap:6px;min-width:0;font-size:13px}.spk{color:var(--muted);font-weight:700;white-space:nowrap}'+
  '.spn{flex:1;text-align:right;font-size:11px;font-weight:700;font-variant-numeric:tabular-nums;color:var(--muted);overflow-wrap:anywhere}.spr b{font-variant-numeric:tabular-nums;white-space:nowrap}'+
  '.sp-base{color:#c8d0dc}.sp-skills{color:#d0b0ff}.sp-gear{color:#ffd27a}.sp-sigils{color:#7fe0f0}.sp-buffs{color:#8fe0a0}'+
  '.splg .sp-base{background:rgba(200,210,225,.12)}.splg .sp-skills{background:rgba(190,150,255,.14)}.splg .sp-gear{background:rgba(255,200,100,.14)}.splg .sp-sigils{background:rgba(90,200,230,.14)}.splg .sp-buffs{background:rgba(110,210,130,.14)}';
  document.head.appendChild(st);})();
