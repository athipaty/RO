"use strict";
/* ================= auto-hunt uses your skills =================
   While auto-hunt is on (and the Skills switch on the Auto card is on, the default), the hero casts the skills on the
   hotbar rows by themselves, in hotbar order (nothing on the bar: every learned skill):
     - First Aid as soon as the HP you are missing is at least what it heals; Mend, Resurgence, Second Wind below 55% HP, Renew below 80%: before any tonic;
       Mend and Sanctuary also when a party member within their reach drops below 55%
     - buffs (Iron Will, Blessing, Mana Shield, ...) when they have run out, only while fighting
     - target skills on the current target when it is in range
     - area skills (Arc Storm, Arrow Rain, ...) when 2+ monsters stand together, or on a boss
     - skills that burst around you (Whirlwind, Frost Nova, ...) when monsters are close enough to be hit
   If you have a heal, 30% SP is kept back for it. Normal attacks fill the gaps. Ground skills stay manual. */
const AUTOSK={t:0,
  heal:{firstaid:1,mend:1,resurgence:1,secondwind:1,renew:1},
  // skills that hit everything around you, with how close a monster must be (px)
  nova:{whirl:95,frostnova:115,earthshatter:120,soulsiphon:115,judgment:115,rampage:110,frostrune:110,runeburst:110,timestop:150,chiburst:110,
    titanslam:120,dawnbreaker:130,retribution:110,tempest:120},
  reserve:.3,
  /* heals cast as soon as the HP you are missing is at least what they heal (nothing wasted): First Aid heals 8+7*level,
     raised by your Healing bonus. Example: 250 max HP and a 50 HP First Aid -> cast once HP is 200 or less. */
  fill:{firstaid:l=>8+l*7}};
const autoSkillHealAmt=id=>{const f=AUTOSK.fill[id];return f?Math.max(1,Math.round(f(castLv(id))*(1+((S&&S.heal)||0)/100))):0;};
function autoSkillList(){const ids=[],add=e=>{if(e&&typeof e.s==='string'&&!ids.includes(e.s))ids.push(e.s);};
  (Array.isArray(P.bar)?P.bar:[]).forEach(add);if(Array.isArray(P.bars))for(const r of P.bars)if(Array.isArray(r))r.forEach(add);
  if(!ids.length)for(const id in P.skills)if(P.skills[id]>0)ids.push(id);
  return ids.filter(id=>{const s=SKILLS[id];return s&&s.kind!=='passive'&&s.kind!=='ground'&&castLv(id)>0;});}
/* party heals: skills that support.js sends to party members (with an amount: Mend, Sanctuary). A member's HP arrives
   as a percentage with their presence a moment later, so after healing one we wait 1.6 s before judging again. */
AUTOSK.mateT=0;
const autoSkillPartyHeal=id=>typeof SUP!=='undefined'&&!!(SUP[id]&&SUP[id].amt);
function autoSkillHurtMate(id){if(typeof partyMatesHere!=='function')return null;const r=SUP[id].r;
  return partyMatesHere().find(o=>typeof o.hp==='number'&&o.hp>0&&o.hp<55&&Math.hypot(o.rx-P.x,o.ry-P.y)<=r)||null;}
const autoSkillMobs=(c,r)=>{let n=0;for(const m of mobs)if(!m.dead&&!m.dying&&dist(m,c)<r+m.d.size)n++;return n;};
function autoSkillTick(){
  if(!P||!(P.auto||P.autoHit)||P.autoSkill===false||P.dead||!Z||Z.D.safe||P.casting||now<AUTOSK.t)return;AUTOSK.t=now+.25;
  if(P.heavy>1||(typeof ailHeld==='function'&&ailHeld())||(typeof ailOn==='function'&&ailOn('silence')))return;
  const list=autoSkillList();if(!list.length)return;
  const t=P.target&&!P.target.dead&&!P.target.dying?P.target:null,hp=P.hp/S.maxhp;
  const fight=(t&&dist(P,t)<450)||mobs.some(m=>!m.dead&&m.state==='chase'&&dist(m,P)<300);
  const keep=list.some(id=>AUTOSK.heal[id])?S.maxsp*AUTOSK.reserve:0;
  const ok=(id,res)=>{const l=castLv(id);return l>0&&skillReady(id)&&P.sp>=SKILLS[id].sp(l)+(res?keep:0);};
  const go=id=>{useSkill(id);return !!P.casting||(P.cd[id]||0)>now;};
  // 1. heals first (they may use the kept SP): yourself, or a party member nearby (Mend, Sanctuary reach them)
  for(const id of list){const ph=autoSkillPartyHeal(id);if(!AUTOSK.heal[id]&&!ph)continue;
    const self=AUTOSK.fill[id]?S.maxhp-P.hp>=autoSkillHealAmt(id):id==='renew'?hp<.8&&!(P.buffs.renew&&P.buffs.renew.until>now):hp<.55,mate=!self&&ph&&now>=AUTOSK.mateT&&autoSkillHurtMate(id);
    if((self||mate)&&ok(id,false)&&go(id)){if(mate)AUTOSK.mateT=now+1.6;return;}}
  if(!fight)return;
  // 2. buffs that have run out
  for(const id of list){const s=SKILLS[id];if(s.kind!=='self'||AUTOSK.heal[id]||AUTOSK.nova[id])continue;
    const f=P.buffs[id];if(f&&f.until-now>2)continue;if(ok(id,true)&&go(id))return;}
  // 3. attacks, in hotbar order
  for(const id of list){const s=SKILLS[id];if(AUTOSK.heal[id]||!ok(id,true))continue;
    if(AUTOSK.nova[id]){if(autoSkillMobs(P,AUTOSK.nova[id])<(id==='timestop'?2:1))continue;}
    else if(s.kind==='target'){if(!t||dist(P,t)>s.range+t.d.size)continue;}
    else if(s.kind==='area'){if(!t||dist(P,t)>s.range+t.d.size||(autoSkillMobs(t,110)<2&&!t.d.boss))continue;}
    else continue;
    if(go(id))return;}}
{const _ahS=autoHunt;autoHunt=function(){const r=_ahS.apply(this,arguments);try{autoSkillTick();}catch(e){}return r;};}

// the Skills switch: a third round button on the Auto card, under the two pick-up choices (it does not close the card)
(()=>{const card=document.getElementById('autoPick');if(!card)return;
  const b=document.createElement('button');b.type='button';b.className='apOpt apSk';b.setAttribute('role','switch');
  b.innerHTML='<b class="apI">✧</b><span><b></b><i></i></span>';card.appendChild(b);
  const sync=()=>{const on=!P||P.autoSkill!==false;b.classList.toggle('on',on);b.setAttribute('aria-checked',String(on));
    b.querySelector('span b').textContent=on?'Skills: on':'Skills: off';b.querySelector('span i').textContent=on?'Uses your hotbar skills':'Normal attacks only';
    b.setAttribute('aria-label',on?'Auto-hunt uses your skills: on':'Auto-hunt uses your skills: off');};
  const place=()=>{const o=card.querySelector('.apOpt[data-loot="0"]');if(!o)return;const x=parseFloat(o.style.left),y=parseFloat(o.style.top);if(!isFinite(x)||!isFinite(y))return;
    b.style.left=x+'px';b.style.top=Math.min(innerHeight-31,y+58)+'px';};
  new MutationObserver(()=>{if(card.classList.contains('show')){place();sync();}}).observe(card,{attributes:true,attributeFilter:['class']});
  b.addEventListener('click',ev=>{ev.stopPropagation();if(!P)return;P.autoSkill=P.autoSkill===false;sync();sfx('click');
    b.classList.add('picked');setTimeout(()=>b.classList.remove('picked'),300);
    addLog(P.autoSkill?'Auto-hunt will use the skills on your hotbar.':'Auto-hunt will use normal attacks only.','l-sys');if(typeof save==='function')save();});
  sync();})();

if(typeof SAVE_EXTRA!=='undefined')SAVE_EXTRA.push('autoSkill');
if(typeof TH!=='undefined')Object.assign(TH,{'Skills: on':'สกิล: เปิด','Skills: off':'สกิล: ปิด','Uses your hotbar skills':'ใช้สกิลบนแถบลัด','Normal attacks only':'โจมตีธรรมดาเท่านั้น',
  'Auto-hunt uses your skills: on':'ล่าอัตโนมัติใช้สกิล: เปิด','Auto-hunt uses your skills: off':'ล่าอัตโนมัติใช้สกิล: ปิด',
  'Auto-hunt will use the skills on your hotbar.':'การล่าอัตโนมัติจะใช้สกิลบนแถบลัดของคุณ','Auto-hunt will use normal attacks only.':'การล่าอัตโนมัติจะใช้การโจมตีธรรมดาเท่านั้น'});
