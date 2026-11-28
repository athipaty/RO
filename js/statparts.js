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
  let h=`<div class="spgrid">`;
  for(const [k,name] of SP_STATS){const p=parts[k],bits=[`<span class="sp0">${L('base')} ${f(k,p.base)}</span>`];
    for(const part of ['skills','gear','sigils','buffs']){const v=p[part];if(z(k,v))continue;bits.push(`<span class="sp-${part}">${L(part)} ${v>0?'+':'−'}${f(k,Math.abs(v))}</span>`);}
    h+=`<div class="spr"><div class="spt"><span>${L(name)}</span><b>${f(k,p.total)}</b></div><div class="spb">${bits.join('')}</div></div>`;}
  return h+`</div>`;}
(function(){if(typeof document==='undefined')return;const st=document.createElement('style');st.textContent=
  '.spgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:6px 12px;margin:4px 0 6px}'+
  '.spr{min-width:0}.spt{display:flex;justify-content:space-between;gap:8px;font-size:13px}.spt span{color:var(--muted);font-weight:700}.spt b{font-variant-numeric:tabular-nums}'+
  '.spb{display:flex;flex-wrap:wrap;gap:3px;margin-top:2px}.spb span{font-size:10.5px;font-weight:700;padding:0 5px;border-radius:5px;white-space:nowrap;font-variant-numeric:tabular-nums}'+
  '.sp0{color:#c8d0dc;background:rgba(200,210,225,.12)}.sp-skills{color:#e0c8ff;background:rgba(190,150,255,.14)}.sp-gear{color:#ffd27a;background:rgba(255,200,100,.14)}'+
  '.sp-sigils{color:#7fe0f0;background:rgba(90,200,230,.14)}.sp-buffs{color:#8fe0a0;background:rgba(110,210,130,.14)}';
  document.head.appendChild(st);})();
