"use strict";
/* ================= bigger moments (UI pass 4, v1.20.4) =================
   Level up: a gold LEVEL UP burst with turning light rays in the middle of the screen (a smaller one for a job
   level), over the existing card and light pillar. Rare drops: a glowing banner with the item's name in its rarity
   colour. Neither one blocks a tap, and both stay still for players who ask for reduced motion.
   Hit numbers (js/combat.js) grow with the share of the monster's health a hit takes. Loaded after js/rewards.js. */
function juiceEl(id){let el=document.getElementById(id);if(!el){el=document.createElement('div');el.id=id;el.setAttribute('aria-hidden','true');document.body.appendChild(el);}return el;}
function juiceShow(el,ms){el.classList.remove('on');void el.offsetWidth;el.classList.add('on');clearTimeout(el._t);el._t=setTimeout(()=>el.classList.remove('on'),ms);}
function levelBurst(big,small,job){const el=juiceEl('lvBurst');el.className=job?'job':'';
  el.innerHTML=`<i class="rays"></i><b>${esc(big)}</b><span>${esc(small)}</span>`;juiceShow(el,2000);}
{const _geJ=gainExp;gainExp=function(){const lv=P&&P.lv,jl=P&&P.jl;const r=_geJ.apply(this,arguments);
  try{if(P&&P.lv>lv)levelBurst('LEVEL UP',`Level ${P.lv}`,false);else if(P&&P.jl>jl)levelBurst('JOB LEVEL UP',`Job Level ${P.jl}`,true);}catch(e){}return r;};}
// rare drops: a banner as soon as one lands near you
{let seen=-1;setInterval(()=>{try{if(typeof loot==='undefined'||!running||!P)return;let top=seen,best=null;
  for(const l of loot){if(l.uid>top)top=l.uid;if(seen<0||l.uid<=seen||l.ghost||l.gold||!ITEMS[l.id])continue;const r=rarityOf(l.id);
    if((r>=2||l.boss)&&(!best||r>best.r)&&Math.hypot(l.x-P.x,l.y-P.y)<700)best={l,r};}
  seen=Math.max(seen,top,0);
  if(best){const el=juiceEl('rareDrop'),c=best.l.boss&&best.r<2?'#ffcf5a':RARITY[best.r].col;el.style.setProperty('--rc',c);
    el.innerHTML=`<span>${best.r>=4?'Legendary drop!':'Rare drop!'}</span><b>${esc(ITEMS[best.l.id].name)}</b>`;juiceShow(el,2400);if(typeof sfx==='function')sfx('fanfare');}}catch(e){}},250);}

(()=>{const st=document.createElement('style');st.textContent=`
#lvBurst{position:fixed;left:50%;top:38%;z-index:35;pointer-events:none;display:flex;flex-direction:column;align-items:center;transform:translate(-50%,-50%) scale(.6);opacity:0;visibility:hidden}
#lvBurst.on{visibility:visible;animation:lvIn 2s ease-out forwards}
#lvBurst .rays{position:absolute;left:50%;top:50%;width:340px;height:340px;margin:-170px 0 0 -170px;border-radius:50%;z-index:-1;
  background:repeating-conic-gradient(from 0deg,rgba(255,215,106,.32) 0 8deg,transparent 8deg 22deg);-webkit-mask:radial-gradient(closest-side,#000 25%,transparent 100%);mask:radial-gradient(closest-side,#000 25%,transparent 100%);animation:lvSpin 6s linear infinite}
#lvBurst b{white-space:nowrap;font-family:var(--display);font-weight:800;font-size:clamp(34px,10vw,60px);line-height:1;letter-spacing:.04em;
  background:linear-gradient(180deg,#fff7d0,#ffd76a 45%,#e8902a);-webkit-background-clip:text;background-clip:text;color:transparent;filter:drop-shadow(0 3px 0 #3a1a08) drop-shadow(0 0 18px rgba(255,170,60,.7))}
#lvBurst span{margin-top:4px;font-family:var(--ui);font-weight:800;font-size:18px;color:#fff3c8;text-shadow:0 2px 0 #3a1a08,0 0 10px rgba(0,0,0,.6)}
#lvBurst.job b{font-size:clamp(30px,8vw,44px);background:linear-gradient(180deg,#e8fff4,#8fe0c0 45%,#3fae86);-webkit-background-clip:text;background-clip:text}
#lvBurst.job .rays{background:repeating-conic-gradient(from 0deg,rgba(143,224,192,.28) 0 8deg,transparent 8deg 22deg)}
@keyframes lvIn{0%{opacity:0;transform:translate(-50%,-50%) scale(.5)}12%{opacity:1;transform:translate(-50%,-50%) scale(1.12)}22%{transform:translate(-50%,-50%) scale(1)}78%{opacity:1}100%{opacity:0;transform:translate(-50%,-62%) scale(1)}}
@keyframes lvSpin{to{transform:rotate(360deg)}}
#rareDrop{position:fixed;left:50%;top:31%;z-index:36;white-space:nowrap;pointer-events:none;transform:translate(-50%,-50%);opacity:0;visibility:hidden;display:flex;flex-direction:column;align-items:center;gap:2px;
  padding:10px 22px;border-radius:14px;border:2px solid var(--rc,#6fb0ff);background:radial-gradient(ellipse at 50% 0%,color-mix(in srgb,var(--rc,#6fb0ff) 30%,transparent),#0d1018 70%);
  box-shadow:0 0 24px color-mix(in srgb,var(--rc,#6fb0ff) 55%,transparent),0 10px 30px rgba(0,0,0,.5)}
#rareDrop.on{visibility:visible;animation:rdIn 2.4s ease-out forwards}
#rareDrop span{font-size:12px;font-weight:800;letter-spacing:.2em;text-transform:uppercase;color:var(--rc,#6fb0ff)}
#rareDrop b{font-family:var(--display);font-size:22px;color:#fff;text-shadow:0 0 12px var(--rc,#6fb0ff)}
@keyframes rdIn{0%{opacity:0;transform:translate(-50%,-30%) scale(.8)}12%{opacity:1;transform:translate(-50%,-50%) scale(1.06)}20%{transform:translate(-50%,-50%) scale(1)}80%{opacity:1}100%{opacity:0;transform:translate(-50%,-60%)}}
@media (prefers-reduced-motion:reduce){#lvBurst.on,#rareDrop.on{animation:none;opacity:1;transform:translate(-50%,-50%)}#lvBurst .rays{animation:none}}`;document.head.appendChild(st);})();

if(typeof TH!=='undefined'){Object.assign(TH,{'LEVEL UP':'เลเวลอัป!','JOB LEVEL UP':'เลเวลอาชีพอัป!','Rare drop!':'ของหายาก!','Legendary drop!':'ของในตำนาน!'});
  if(typeof TH_PAT!=='undefined')TH_PAT.unshift([/^Level (\d+)$/,'เลเวล $1'],[/^Job Level (\d+)$/,'เลเวลอาชีพ $1']);}
