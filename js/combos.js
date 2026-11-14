"use strict";
/* ================= skill combos =================
   Some hits react to the state another skill left on a monster:
     Shatter      fire or earth on a FROZEN monster: +50%, and the ice breaks
     Execute      a weapon hit on a STUNNED monster is always a critical hit (+50%)
     Purge        holy on a CURSED monster: +40% and a burst of light
     Storm Surge  wind on a SLOWED monster: +40%, and a spark jumps to the nearest other monster for 30%
   The combo's name flashes over the monster. The Skills window lists them. */
const CMB={ctx:null,shown:new WeakMap()};
{const _dmC=dealMag;dealMag=function(m,mult,el){const was=CMB.ctx;CMB.ctx={el:el||null,mag:1};try{return _dmC.apply(this,arguments);}finally{CMB.ctx=was;}};}
{const _dpC=dealPhys;dealPhys=function(m,mult,o){const was=CMB.ctx;CMB.ctx={el:(o&&o.el)||null,phys:1};try{return _dpC.apply(this,arguments);}finally{CMB.ctx=was;}};}
function comboFlash(m,txt,col){const t=CMB.shown.get(m)||0;if(now-t<.35)return;CMB.shown.set(m,now);
  texts.push({x:m.x,y:m.y-(m.d?m.d.size*2:30)-16,txt,col,size:18,t0:now,dur:1.1});fx.push({k:'ring',x:m.x,y:m.y,r:(m.d?m.d.size:14)+18,col,t0:now,dur:.45});if(typeof sfx==='function')sfx('crit');}
{const _hmC=hurtMob;hurtMob=function(m,dmg,crit,kind){const c=CMB.ctx;
  if(c&&m&&!m.dead&&dmg>0&&!c.combo){const el=c.el;
    if(m.ail==='freeze'&&m.ailUntil>now&&(el==='fire'||el==='earth')){dmg=Math.round(dmg*1.5);m.ailUntil=now;comboFlash(m,'SHATTER!','#9fe0ff');}
    else if(m.ail==='stun'&&m.ailUntil>now&&c.phys){if(!crit){crit=true;dmg=Math.round(dmg*1.5);}comboFlash(m,'EXECUTE!','#ff9a5a');}
    else if(el==='holy'&&m.frailUntil>now){dmg=Math.round(dmg*1.4);comboFlash(m,'PURGE!','#fff0a0');fx.push({k:'pillar',x:m.x,y:m.y,t0:now,dur:.5});}
    else if(el==='wind'&&m.slowUntil>now){dmg=Math.round(dmg*1.4);comboFlash(m,'STORM SURGE!','#c8f0ff');
      let best=null,bd=180;for(const o of mobs)if(o!==m&&!o.dead){const d=Math.hypot(o.x-m.x,o.y-m.y);if(d<bd){bd=d;best=o;}}
      if(best){fx.push({k:'chain',pts:[{x:m.x,y:m.y},{x:best.x,y:best.y}],col:'#c8f0ff',t0:now,dur:.3});const was=CMB.ctx;CMB.ctx={...c,combo:1};try{_hmC.call(this,best,Math.round(dmg*.3),false,kind);}finally{CMB.ctx=was;}}}}
  return _hmC.call(this,m,dmg,crit,kind);};}
// the Skills window explains them
{const _rpCm=refreshPanel;refreshPanel=function(){const r=_rpCm.apply(this,arguments);try{if(panelKind==='skills'&&P&&P.cls!=='novice'&&!panel.querySelector('.combos'))
    panel.insertAdjacentHTML('beforeend',`<details class="combos"><summary>Skill combos</summary><div class="ds">`+
      `<p><b style="color:#9fe0ff">Shatter</b>: fire or earth on a frozen monster: +50%, and the ice breaks.</p>`+
      `<p><b style="color:#ff9a5a">Execute</b>: a weapon hit on a stunned monster is always a critical hit.</p>`+
      `<p><b style="color:#fff0a0">Purge</b>: holy on a cursed monster: +40%.</p>`+
      `<p><b style="color:#c8f0ff">Storm Surge</b>: wind on a slowed monster: +40%, and a spark jumps to the next monster.</p></div></details>`);}catch(e){}return r;};}
if(typeof TH!=='undefined')Object.assign(TH,{'Skill combos':'คอมโบสกิล','SHATTER!':'แตกกระจาย!','EXECUTE!':'ประหาร!','PURGE!':'ชำระล้าง!','STORM SURGE!':'พายุโหม!','Shatter':'แตกกระจาย','Execute':'ประหาร','Purge':'ชำระล้าง','Storm Surge':'พายุโหม',
  ': fire or earth on a frozen monster: +50%, and the ice breaks.':': สกิลไฟหรือดินใส่มอนสเตอร์ที่ถูกแช่แข็ง: +50% และน้ำแข็งแตก',': a weapon hit on a stunned monster is always a critical hit.':': การโจมตีด้วยอาวุธใส่มอนสเตอร์ที่มึนงงจะคริติคอลเสมอ',
  ': holy on a cursed monster: +40%.':': สกิลศักดิ์สิทธิ์ใส่มอนสเตอร์ที่ถูกสาป: +40%',': wind on a slowed monster: +40%, and a spark jumps to the next monster.':': สกิลลมใส่มอนสเตอร์ที่ถูกทำให้ช้า: +40% และประกายกระโดดไปยังมอนสเตอร์ตัวถัดไป'});
