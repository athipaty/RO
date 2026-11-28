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
  // (v1.94.2) a table: one row per stat, a column for each part (base, skills, gear, sigils, buffs) and the total
  const PARTS=['base','skills','gear','sigils','buffs'],HEAD={base:['Base','ฐาน'],skills:['Skill','สกิล'],gear:['Gear','ของ'],sigils:['Sigil','ซิจิล'],buffs:['Buff','บัฟ']};
  const SHORT={'Attacks/sec':th?'โจมตี/วิ':'Atk/s'};
  let h=`<div class="sptw"><table class="spt2"><thead><tr><th></th>`+PARTS.map(p=>`<th class="sp-${p}">${HEAD[p][th?1:0]}</th>`).join('')+`<th>${th?'รวม':'Total'}</th></tr></thead><tbody>`;
  for(const [k,name] of SP_STATS){const p=parts[k];
    h+=`<tr><th>${SHORT[name]||L(name)}</th>`+PARTS.map(part=>{const v=p[part];if(part==='base')return `<td class="sp-base">${f(k,v)}</td>`;
      return z(k,v)?`<td class="spz">–</td>`:`<td class="sp-${part}">${v<0?'−':'+'}${f(k,Math.abs(v))}</td>`;}).join('')+`<td class="sptot">${f(k,p.total)}</td></tr>`;}
  return h+`</tbody></table></div>`;}
(function(){if(typeof document==='undefined')return;const st=document.createElement('style');st.textContent=
  '.sptw{flex:none;overflow:visible;margin:6px 0}.spt2{width:100%;border-collapse:collapse;font-size:12px;font-variant-numeric:tabular-nums}'+
  '.spt2 th,.spt2 td{padding:3px 4px;text-align:right;white-space:nowrap}.spt2 thead th{font-size:10.5px;font-weight:800;letter-spacing:.2px;border-bottom:1px solid rgba(255,255,255,.14)}'+
  '.spt2 tbody th{text-align:left;color:var(--muted);font-weight:700}.spt2 tbody tr+tr th,.spt2 tbody tr+tr td{border-top:1px solid rgba(255,255,255,.05)}'+
  '.spt2 .sptot,.spt2 thead th:last-child{font-weight:800;color:var(--ink,#fff);border-left:1px solid rgba(255,255,255,.12)}.spt2 .spz{color:rgba(160,170,185,.45)}'+
  '.sp-base{color:#c8d0dc}.sp-skills{color:#d0b0ff}.sp-gear{color:#ffd27a}.sp-sigils{color:#7fe0f0}.sp-buffs{color:#8fe0a0}';
  document.head.appendChild(st);})();
