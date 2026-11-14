"use strict";
/* ================= rewards you can feel =================
   1. Loot beams: a dropped item better than common stands in a soft column of light in its rarity colour
      (uncommon green, rare blue, sigil purple, legendary orange; boss drops gold), so good drops are seen from afar.
   2. Level-up card: a card slides down at the top: the new level, the points you got, and buttons to spend them.
   3. Vibration on phones (Android): a tap on crits, a thump when hit hard, a pattern on level-up and rare drops.
      Settings → Vibration turns it off. */

/* ---- 1. loot beams (one picture per colour, stamped) ---- */
const BEAMS=new Map();
function beamPic(col){let c=BEAMS.get(col);if(c)return c;c=document.createElement('canvas');c.width=24;c.height=120;const g=c.getContext('2d');
  const gr=g.createLinearGradient(0,0,0,120);gr.addColorStop(0,'rgba(255,255,255,0)');gr.addColorStop(.45,col+'88');gr.addColorStop(1,col+'ff');
  const hz=g.createLinearGradient(0,0,24,0);hz.addColorStop(0,'rgba(0,0,0,0)');hz.addColorStop(.5,'rgba(0,0,0,1)');hz.addColorStop(1,'rgba(0,0,0,0)');
  g.fillStyle=gr;g.fillRect(0,0,24,120);g.globalCompositeOperation='destination-in';g.fillStyle=hz;g.fillRect(0,0,24,120);BEAMS.set(col,c);return c;}
function lootBeamCol(l){if(l.gold)return null;if(l.boss)return '#ffcf5a';const r=typeof rarityOf==='function'?rarityOf(l.id):0;return r>=1?RARITY[r].col:null;}
{const _dl=drawLoot;drawLoot=function(l){try{const col=lootBeamCol(l);if(col&&now>=l.t0){const k=Math.min(1,(now-l.t0)/.38);if(k>=1){
      const pulse=.75+.25*Math.sin(now*3+(l.uid||0)),a0=ctx.globalAlpha;ctx.globalAlpha=a0*pulse*(l.ghost?.6:1);const b=beamPic(col);
      ctx.drawImage(b,l.x-12,l.y-112,24,120);ctx.globalAlpha=a0;}}}catch(e){}
  return _dl.apply(this,arguments);};}

/* ---- 3. vibration ---- */
const VIB={last:0};
function vibOn(){return !(typeof SETS!=='undefined'&&SETS.vibrate===false)&&document.body.classList.contains('touchui')&&typeof navigator.vibrate==='function';}
function vib(pattern,gap){if(!vibOn())return;const t=performance.now();if(t-VIB.last<(gap||120))return;VIB.last=t;try{navigator.vibrate(pattern);}catch(e){}}
// a crit shows as a 'critburst' effect: buzz when one of our hits adds it
{const _dp=dealPhys;dealPhys=function(){const n0=fx.length,last=fx[n0-1],r=_dp.apply(this,arguments);try{const i0=fx.indexOf(last)+1;for(let i=i0;i<fx.length;i++)if(fx[i].k==='critburst'){vib(18,140);break;}}catch(e){}return r;};}
{const _hp=hurtPlayer;hurtPlayer=function(dmg){const before=P.hp,r=_hp.apply(this,arguments);try{const lost=before-P.hp;if(lost>0&&S&&lost>=S.maxhp*.12)vib(lost>=S.maxhp*.3?[40,30,40]:35,250);}catch(e){}return r;};}

/* ---- 2. level-up card ---- */
function levelCard(lines,btns){let el=document.getElementById('lvCard');
  if(!el){el=document.createElement('div');el.id='lvCard';el.setAttribute('role','status');document.body.appendChild(el);
    el.addEventListener('click',ev=>{const b=ev.target.closest('[data-lv]');if(b){ev.stopPropagation();const k=b.dataset.lv;el.classList.remove('show');
        if(k==='stats')openPanel('status');else if(k==='skills')openPanel('skills');else if(k==='quests')openPanel('quests');return;}el.classList.remove('show');});}
  el.innerHTML=`<div class="lvt">${lines[0]}</div>${lines.slice(1).map(s=>`<div class="lvs">${s}</div>`).join('')}`+(btns.length?`<div class="lvb">${btns.map(([k,l])=>`<button class="btn small" data-lv="${k}">${l}</button>`).join('')}</div>`:'');
  el.classList.remove('show');void el.offsetWidth;el.classList.add('show');clearTimeout(levelCard.t);levelCard.t=setTimeout(()=>el.classList.remove('show'),5200);}
{const _ge=gainExp;gainExp=function(){const lv=P.lv,jl=P.jl,sp=P.statPts,kp=P.skillPts;const r=_ge.apply(this,arguments);
  try{const dl=P.lv-lv,dj=P.jl-jl;if(dl>0||dj>0){const lines=[],btns=[];
      if(dl>0){lines.push(`Level ${P.lv}!`);if(P.statPts>sp)lines.push(`+${P.statPts-sp} stat points`);btns.push(['stats','Spend stats']);}
      if(dj>0){if(!dl)lines.push(`Job Level ${P.jl}!`);else lines.push(`Job Level ${P.jl}`);if(P.skillPts>kp)lines.push(`+${P.skillPts-kp} skill point${P.skillPts-kp>1?'s':''}`);btns.push(['skills','Learn skills']);}
      levelCard(lines,btns);vib([60,40,90],0);}}catch(e){}return r;};}

/* rare drops buzz too (new loot is checked four times a second) */
{let seen=-1;setInterval(()=>{try{if(typeof loot==='undefined'||!running)return;let top=seen;
  for(const l of loot){if(l.uid>top)top=l.uid;if(seen>=0&&l.uid>seen&&!l.ghost&&(l.boss||(typeof rarityOf==='function'&&rarityOf(l.id)>=2)))vib([25,40,25],300);}seen=Math.max(seen,top,0);}catch(e){}},250);}

/* ---- settings: vibration on/off ---- */
if(typeof PANELS!=='undefined'&&PANELS.settings){const _ps=PANELS.settings;PANELS.settings=function(){let h=_ps.apply(this,arguments);
  const row=`<div class="setrow"><div class="grow"><div class="nm">Vibration</div><div class="ds">Phones: a buzz on crits, hard hits, level-ups and rare drops</div></div>${toggle('setvib',SETS.vibrate!==false,'Vibration on or off')}</div>`;
  const at=h.indexOf('</div><h3>Display</h3>');return at<0?h+row:h.slice(0,at)+row+h.slice(at);};}
PANEL_ACTS.setvib=()=>{SETS.vibrate=SETS.vibrate===false;saveSets();if(SETS.vibrate!==false)vib(30,0);refreshPanel();};

if(typeof TH!=='undefined')Object.assign(TH,{'Spend stats':'ลงแต้มสถานะ','Learn skills':'เรียนสกิล','Vibration':'การสั่น',
  'Phones: a buzz on crits, hard hits, level-ups and rare drops':'มือถือ: สั่นเมื่อคริติคอล โดนตีแรง เลเวลอัป และได้ของหายาก','Vibration on or off':'เปิดหรือปิดการสั่น'});
if(typeof TH_PAT!=='undefined')TH_PAT.unshift([/^Level (\d+)!$/,'เลเวล $1!'],[/^Job Level (\d+)!?$/,'เลเวลอาชีพ $1'],[/^\+(\d+) stat points$/,'แต้มสถานะ +$1'],[/^\+(\d+) skill points?$/,'แต้มสกิล +$1']);
