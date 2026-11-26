"use strict";
/* ================= the world map, easier on a phone; monsters' elements on the cards (v1.64.1) =================
   With thirty-odd regions the map was squeezed to fit the window, so each square was a small diamond, hard to hit
   with a finger. Now it opens big (each square about 70 px wide) inside a box you drag to look around, centred on
   the place you picked; one button switches between the bigger map and the whole world at a glance (remembered).
   On each place's card, every monster picture carries a badge of its element, and a line says what each element
   there is weak to ("💧 Water: weak to 🌪 Wind"), so a hunter can bring the right weapon. */
const WSZ={big:(()=>{try{return localStorage.getItem('embervale.wsmZoom')!=='fit';}catch(e){return true;}})(),centred:null};
const EL_ICON={fire:'🔥',water:'💧',wind:'🌪',earth:'⛰',holy:'✨',shadow:'🌑',neutral:''};
const EL_TH={fire:'ไฟ',water:'น้ำ',wind:'ลม',earth:'ดิน',holy:'ศักดิ์สิทธิ์',shadow:'มืด',neutral:'ไร้ธาตุ'};
const elName=el=>typeof LANG!=='undefined'&&LANG==='th'?(EL_TH[el]||el):(typeof ELEM!=='undefined'&&ELEM[el]?ELEM[el].name:el);
// ---- the map in a box you can drag ----
{const _wmm=wsmMapHtml;wsmMapHtml=function(best){const h=_wmm.apply(this,arguments),cut=h.indexOf('<div class="wsmkey">');
  const ids=Object.keys(WORLD_GRID).filter(id=>ZONES[id]),us=ids.map(id=>wsmIso(id)[0]),U=Math.max(...us)-Math.min(...us)+2;
  const th=typeof LANG!=='undefined'&&LANG==='th',lbl=WSZ.big?(th?'⤡ ดูทั้งโลก':'⤡ Whole world'):(th?'⤢ ขยายแผนที่':'⤢ Bigger map');
  // the N/E/S/W letters that sat beside the last square of each road give way to one compass in the map's corner
  const map=(cut<0?h:h.slice(0,cut)).replace(/<span class="wsmc wsmc-[NESW]"[^>]*>[NESW]<\/span>/g,''),key=cut<0?'':h.slice(cut);
  const compass=`<div class="wsmrose" aria-hidden="true"><svg viewBox="-30 -30 60 60"><circle r="27" class="rr"/><path d="M0-4 L15-15 L4 0 L15 15 L0 4 L-15 15 L-4 0 L-15-15Z" class="rp"/>`+
    `<path d="M2-2 L15-15 L-2 2Z" class="rn"/><text x="20" y="-17">N</text><text x="20" y="23">E</text><text x="-20" y="23">S</text><text x="-20" y="-17">W</text></svg></div>`;
  return `<div class="wsmbar"><button type="button" class="btn small" data-act="wsmzoom" aria-pressed="${WSZ.big}">${lbl}</button>${WSZ.big?`<span class="ds">${th?'ลากเพื่อเลื่อนดู':'Drag to look around'}</span>`:''}</div>`+
    `<div class="wsmwrap"><div class="wsmscroll${WSZ.big?' big':''}" style="--U:${U}">${map}</div>${compass}</div>`+key;};}
PANEL_ACTS.wsmzoom=()=>{WSZ.big=!WSZ.big;WSZ.centred=null;try{localStorage.setItem('embervale.wsmZoom',WSZ.big?'big':'fit');}catch(e){}sfx('click');refreshPanel();};
// centre the picked square once each time the pick changes (not on every refresh, so a drag is not undone)
function wsmCentre(){const sc=panel&&panel.querySelector('.wsmscroll.big');if(!sc)return;const t=sc.querySelector('.wsmt.sel')||sc.querySelector('.wsmt.here');if(!t)return;
  const key=(WSMAP.sel||'')+'|'+panelKind;const keep=WSZ.centred===key&&WSZ.pos;if(keep){sc.scrollLeft=WSZ.pos[0];sc.scrollTop=WSZ.pos[1];return;}
  const a=sc.getBoundingClientRect(),b=t.getBoundingClientRect();sc.scrollLeft+=b.left+b.width/2-(a.left+a.width/2);sc.scrollTop+=b.top+b.height/2-(a.top+a.height/2);
  WSZ.centred=key;WSZ.pos=[sc.scrollLeft,sc.scrollTop];}
{const _rpW=refreshPanel;refreshPanel=function(){const sc=panel&&panel.querySelector('.wsmscroll.big');if(sc&&WSZ.centred)WSZ.pos=[sc.scrollLeft,sc.scrollTop];
  const r=_rpW.apply(this,arguments);try{if(panel.querySelector('.wsmscroll.big'))requestAnimationFrame(wsmCentre);}catch(e){}return r;};}
document.addEventListener('scroll',ev=>{const sc=ev.target;if(sc&&sc.classList&&sc.classList.contains('wsmscroll')&&WSZ.centred)WSZ.pos=[sc.scrollLeft,sc.scrollTop];},true);
// ---- each monster's element on the cards ----
function elBadge(m){const el=m.el||'neutral';if(el==='neutral'||!EL_ICON[el])return '';const col=typeof ELEM!=='undefined'&&ELEM[el]?ELEM[el].col:'#ccc';
  return `<i class="tcel" style="--ec:${col}" title="${esc(elName(el))}">${EL_ICON[el]}</i>`;}
// "💧 Water: weak to 🌪 Wind" for each element living there (bosses included)
function elWeakLine(ms){const els=[...new Set(ms.map(m=>m.el||'neutral'))].filter(e=>e!=='neutral'&&typeof weakTo==='function');if(!els.length)return '';
  const th=typeof LANG!=='undefined'&&LANG==='th';
  return `<div class="tcels">`+els.map(e=>{const w=weakTo(e);return `<span class="tcelw" style="--ec:${ELEM[e].col}">${EL_ICON[e]} ${esc(elName(e))}${w.length?`<b>${th?'แพ้':'weak to'} ${w.map(x=>`${EL_ICON[x]} ${esc(elName(x))}`).join(', ')}</b>`:''}</span>`;}).join('')+`</div>`;}
{const _tcc=tcCardHtml;tcCardHtml=function(id){let h=_tcc.apply(this,arguments);const D=ZONES[id];if(!D||!D.mobs||!P.visited.includes(id))return h;
  const ms=[...new Set(D.mobs.map(([m])=>m))].map(m=>MOBS[m]).filter(m=>m&&!m.world);
  // badge each picture (its title starts with the monster's name)
  h=h.replace(/<img class="tcmob([^"]*)" src="([^"]*)" alt="" title="([^"·]+) · ([^"]*)">/g,(all,cls,src,name,rest)=>{const m=ms.find(x=>x.name===name.trim());if(!m)return all;
    return `<span class="tcmobw"><img class="tcmob${cls}" src="${src}" alt="" title="${name}· ${elName(m.el||'neutral')} · ${rest}">${elBadge(m)}</span>`;});
  return h.replace('</div><div class="tcmarks">',`</div>${elWeakLine(ms)}<div class="tcmarks">`).replace(/(<div class="tcmobs">(?:(?!<\/div>).)*<\/div>)(?!<div class="tcels">)/,(m0)=>m0+(h.includes('class="tcels"')?'':elWeakLine(ms)));};}
(()=>{const st=document.createElement('style');st.textContent=`
#panel .wsmbar{display:flex;align-items:center;gap:8px;margin:2px 0 0}
#panel .wsmwrap{position:relative}
#panel .wsmrose{position:absolute;top:6px;right:6px;width:46px;height:46px;z-index:5;pointer-events:none;opacity:.92;filter:drop-shadow(0 1px 3px rgba(0,0,0,.7))}
#panel .wsmrose svg{width:100%;height:100%;overflow:visible}
#panel .wsmrose .rr{fill:rgba(14,21,31,.82);stroke:rgba(232,194,90,.55);stroke-width:1.5}
#panel .wsmrose .rp{fill:#cfc3a4}#panel .wsmrose .rn{fill:#e85a4a}
#panel .wsmrose text{font:900 10px var(--ui,system-ui);fill:#e8c25a;text-anchor:middle;dominant-baseline:middle}
#panel .wsmbar .ds{font-size:11px;opacity:.75}
#panel .wsmscroll.big{overflow:auto;max-height:min(62vh,520px);border-radius:14px;touch-action:pan-x pan-y;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;margin:6px 0 4px;
  background:#0e151f;border:1px solid rgba(232,194,90,.28)}
#panel .wsmscroll.big .wsm{width:calc(var(--U) * 36px);max-width:none!important;margin:28px 26px}
#panel .wsmscroll.big .wsm::before{display:none}
#panel .wsmscroll.big .wsmt b{font-size:14px}
#panel .wsmscroll.big .wsmt i{font-size:13px}
#panel .tcmobw{position:relative;display:inline-block}
#panel .tcel{position:absolute;right:-4px;bottom:-4px;width:16px;height:16px;border-radius:50%;display:flex;align-items:center;justify-content:center;
  font-style:normal;font-size:10px;line-height:1;background:#141a24;border:1.5px solid var(--ec);box-shadow:0 0 4px var(--ec);pointer-events:none}
#panel .tcels{display:flex;flex-wrap:wrap;gap:4px 10px;margin:6px 0 2px;font-size:12px}
#panel .tcelw{color:var(--ec);font-weight:700}
#panel .tcelw b{color:#e8e2d4;font-weight:500;margin-left:5px}
`;document.head.appendChild(st);})();
