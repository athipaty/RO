"use strict";
/* ================= a tidier skill tree (v1.85.0) =================
   The Skills window had grown busy: two big boxes and a long hint on top, a six-part key, "party" labels on top of the
   level tags, and a details card far down at the bottom on an upright phone. Following a build only drew a thin green
   ring round the next skill, so players could not see what the build wanted. Now:
   - one slim bar on top: your points, ✨ Recommended, 📖 the build you follow (or Build guide), and ⓘ for the key
   - following a build: a "Next" line names the skill to learn (tap it to jump there); every skill in the build carries
     a green ★ before its name, and the next one wears a glowing green frame and a NEXT tag
   - the details card opens right under the calling you tapped in (upright phones), and the page keeps the skill you
     tapped where it was
   - every calling's tree fits the width, so nothing hides off the side
   - the level tags on the lines show only while a requirement is not met yet (js/skilllinks.js)
   - "Follow this build" takes you back to the Skills window with the next skill chosen */
const SKT={key:false};
const sktTh=()=>typeof LANG!=='undefined'&&LANG==='th';
function sktBuild(){if(!P||!P.build||typeof buildById!=='function')return null;const b=buildById(P.build);return b&&(typeof buildAllowed!=='function'||buildAllowed(b))?b:null;}
// the level the build takes each skill to
function sktPlan(){const m=new Map(),b=sktBuild();if(b)for(const [id,to] of b.skills)m.set(id,Math.max(m.get(id)||0,to));return m;}
function sktNext(){const b=sktBuild();return b&&typeof buildNextSkill==='function'?buildNextSkill(b):null;}

function sktTidy(){const wrap=panel.querySelector('.skpwrap');if(!wrap||!P)return;const th=sktTh(),b=sktBuild(),nx=sktNext(),plan=sktPlan();
  // ---- one slim bar ----
  const sub=panel.querySelector('.sub');if(sub)sub.textContent=CLASSES[P.cls]?CLASSES[P.cls].name:'';
  const auto=panel.querySelector('.skillauto'),hadAuto=!!auto;if(auto)auto.remove();const old=panel.querySelector('.bgbar');if(old)old.remove();
  const bar=document.createElement('div');bar.className='sktop';
  bar.innerHTML=`<span class="sktpts${P.skillPts>0?' on':''}">${th?'แต้มสกิล':'Points'} <b>${P.skillPts}</b></span>`+
    (hadAuto?`<button type="button" class="btn small primary" data-act="skillauto">✨ ${th?'แนะนำ':'Recommended'}</button>`:'')+
    `<button type="button" class="btn small${b?' sktb':''}" data-act="openguide">📖 ${b?esc(bName(b)):(th?'เลือกสาย':'Build guide')}</button>`+
    '';
  const at=sub||panel.querySelector('h2');if(at)at.after(bar);
  if(sub){sub.classList.add('sktsub');sub.insertAdjacentHTML('beforeend',`<button type="button" class="btn small ghost sktkey${SKT.key?' on':''}" data-act="sktkey" aria-label="${th?'ความหมายของสัญลักษณ์':'What the marks mean'}">ⓘ ${th?'สัญลักษณ์':'Key'}</button>`);}
  if(b){const ln=document.createElement('div');ln.className='sktnext';
    ln.innerHTML=nx?`<span>★ ${th?'ถัดไปของสาย':'Next for your build'}</span><button type="button" class="btn small sktgo" data-act="sktgo" data-arg="${nx.id}">${esc(SKILLS[nx.id].name)} → Lv ${nx.lv}</button>`
      :`<span>★ ${th?'เรียนครบตามสายแล้วตอนนี้ สกิลใหม่มากับอาชีพถัดไป':'Your build has all it can learn for now. New skills come with your next job.'}</span>`;
    bar.after(ln);}
  // ---- the key, only when asked ----
  const key=panel.querySelector('.skplegend');if(key){key.style.display=SKT.key?'':'none';if(SKT.key&&b&&!key.querySelector('.sktk')){const s=document.createElement('span');s.className='sktk';s.innerHTML=`<i class="sktstar">★</i>${th?'อยู่ในสายที่เลือก':'In your build'}`;key.appendChild(s);}}
  // ---- build marks on the icons ----
  for(const el of panel.querySelectorAll('.skpic[data-arg]')){const id=el.dataset.arg;el.classList.remove('next');
    if(plan.has(id)){el.classList.add('inbuild');const nm=el.querySelector('.skpnm');if(nm&&!nm.querySelector('.sktstar'))nm.insertAdjacentHTML('afterbegin','<i class="sktstar">★</i>');}
    if(nx&&nx.id===id){el.classList.add('bnext');el.insertAdjacentHTML('beforeend',`<span class="sktnx">${th?'ถัดไป':'NEXT'}</span>`);}}
  // ---- the card: what the build wants, and party skills ----
  const right=wrap.querySelector('.skpright'),sel=typeof SKP!=='undefined'?SKP.sel:null;
  if(right&&sel&&SKILLS[sel]){const notes=[],to=plan.get(sel),have=P.skills[sel]||0;
    if(to)notes.push(`<b class="sktstar">★</b> ${th?`สาย ${esc(bName(b))} อัปถึง Lv ${to}`:`Your ${esc(bName(b))} build takes this to Lv ${to}`}${have>=to?(th?' · ครบแล้ว ✓':' · done ✓'):nx&&nx.id===sel?(th?` · <b>เรียนอันนี้ต่อไป</b> (ถึง Lv ${nx.lv})`:` · <b>learn this next</b> (to Lv ${nx.lv})`):''}`);
    else if(b)notes.push(`<span class="muted">${th?'ไม่อยู่ในสายที่เลือก':'Not part of your build'}</span>`);
    if(SKILLS[sel].party)notes.push(th?'👥 ช่วยทั้งปาร์ตี้':'👥 Helps your whole party');
    if(notes.length){const d=document.createElement('div');d.className='sktcard'+(to?' on':'');d.innerHTML=notes.join('<br>');right.insertBefore(d,right.firstChild);}}
  // ---- upright phones: the card right under the calling you tapped in ----
  const selEl=panel.querySelector('.skpic.sel'),grid=selEl&&selEl.closest('.skpgrid');
  if(right&&grid&&matchMedia('(orientation:portrait)').matches){grid.after(right);right.classList.add('sktin');}
  // ---- every tree fits the width ----
  for(const g of panel.querySelectorAll('.skpgrid')){const cols=+g.style.getPropertyValue('--cols')||1,avail=(g.parentElement.clientWidth||320)-6;
    g.style.setProperty('--cw',Math.max(54,Math.min(80,Math.floor(avail/cols)))+'px');g.classList.add('fit');}}
{const _rpT=refreshPanel;refreshPanel=function(){const r=_rpT.apply(this,arguments);try{if(typeof panelKind!=='undefined'&&panelKind==='skills')sktTidy();}catch(e){console.error(e);}return r;};}
PANEL_ACTS.sktkey=()=>{SKT.key=!SKT.key;sfx('click');refreshPanel();};
// tapping a skill keeps it where it was on screen, then shows its card
{const _sel=PANEL_ACTS.sksel;PANEL_ACTS.sksel=function(id){const q=()=>panel.querySelector(`.skpic[data-arg="${id}"]`),a=q(),y0=a?a.getBoundingClientRect().top:null;const r=_sel.apply(this,arguments);
  try{const e=q();if(e&&y0!==null){panel.scrollTop+=e.getBoundingClientRect().top-y0;const c=panel.querySelector('.skpright.sktin');if(c){const pr=panel.getBoundingClientRect(),cb=c.getBoundingClientRect().bottom,lim=pr.bottom-12;
    if(cb>lim)panel.scrollTop+=Math.min(cb-lim,Math.max(0,e.getBoundingClientRect().top-pr.top-12));}}}catch(err){}return r;};}
// "Next" jumps to the skill
PANEL_ACTS.sktgo=id=>{if(!SKILLS[id])return;SKP.sel=id;sfx('click');refreshPanel();const e=panel.querySelector(`.skpic[data-arg="${id}"]`);if(e)e.scrollIntoView({block:'center'});};
// following a build goes back to the Skills window with its next skill chosen
{const _bp=PANEL_ACTS.buildpick;PANEL_ACTS.buildpick=function(id){const r=_bp.apply(this,arguments);if(id&&P.build===id){SKP.sel=null;openPanel('skills');}return r;};}
{const st=document.createElement('style');st.textContent=`
#panel .sktop{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin:6px 0 4px}
#panel .sktop .btn{min-height:34px}#panel .sktsub{display:flex;align-items:center;gap:8px}#panel .sktkey{margin-left:auto;min-height:28px;padding:2px 10px;font-size:12px}#panel .sktkey.on{border-color:#f0b54a;color:#f0b54a}
#panel .sktpts{padding:6px 10px;border-radius:10px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.12);font-size:13px;white-space:nowrap}
#panel .sktpts b{color:#ffd27a;font-size:15px}#panel .sktpts.on{border-color:rgba(240,181,74,.6);background:rgba(240,181,74,.12)}
#panel .sktb{border-color:#6fe39a!important;color:#bff5d0!important}
#panel .sktnext{display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:6px 10px;margin:0 0 6px;border-radius:10px;background:rgba(111,227,154,.1);border:1px solid rgba(111,227,154,.45);font-size:13px;color:#cdf5da}
#panel .sktnext .sktgo{border-color:#6fe39a!important;background:#1d4a30!important;color:#eafff0!important;font-weight:700}
.sktstar{font-style:normal;color:#6fe39a;margin-right:2px}
#panel .skplegend .sktk{white-space:nowrap}
#panel .skpic.inbuild .skpnm{color:#d9f7e3}
#panel .skpic.bnext{border:2px solid #6fe39a!important;background:#173524!important;animation:sktGlow 1.6s ease-in-out infinite}
@keyframes sktGlow{0%,100%{box-shadow:0 0 0 0 rgba(111,227,154,.0),0 0 10px rgba(111,227,154,.35)}50%{box-shadow:0 0 0 3px rgba(111,227,154,.35),0 0 18px rgba(111,227,154,.6)}}
#panel .sktnx{position:absolute;top:-9px;left:50%;transform:translateX(-50%);padding:1px 6px;border-radius:7px;background:#6fe39a;color:#0d2416;font-size:9px;font-weight:800;letter-spacing:.06em;line-height:1.4;z-index:3;white-space:nowrap}
#panel .skpparty{display:none}
#panel .sktcard{font-size:12.5px;line-height:1.45;padding:6px 10px;margin:0 0 6px;border-radius:10px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1)}
#panel .sktcard.on{background:rgba(111,227,154,.08);border-color:rgba(111,227,154,.4)}
#panel .skpright.sktin{position:relative!important;z-index:3;margin:2px 0 12px!important;background:#151b25}
#panel .skpgrid.fit{--tw:min(72px,calc(var(--cw) - 6px))}
#panel .skpgrid.fit .skpic{width:var(--tw);left:calc(var(--c)*var(--cw) + (var(--cw) - var(--tw))/2);padding-left:1px;padding-right:1px}
#panel .skpgrid.fit .skpic img{width:min(42px,calc(var(--cw) - 22px));height:min(42px,calc(var(--cw) - 22px))}
#panel .skpgrid.fit .skpnm{max-width:calc(var(--tw) - 4px)}
`;document.head.appendChild(st);}
if(typeof TH!=='undefined')Object.assign(TH,{'What the marks mean':'ความหมายของสัญลักษณ์'});
