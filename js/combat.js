"use strict";
/* ================= combat ================= */
function floatT(x,y,txt,col,size=15){texts.push({x:x+rnd(-6,6),y,txt,col,size,t0:now,dur:.9,vx:rnd(-28,28)});}
// keep the log short, but never remove the chat tabs at its top
function trimLog(el,max){while(el.children.length>max){const f=el.firstElementChild&&el.firstElementChild.id==='logTabs'?el.children[1]:el.firstElementChild;if(!f)break;f.remove();}}
function addLog(msg,cls='l-sys'){const el=$('#log');const d=document.createElement('div');d.className=cls;d.textContent=msg;el.appendChild(d);trimLog(el,60);el.scrollTop=el.scrollHeight;}
function aoe(x,y,r,fn){for(const m of mobs)if(!m.dead&&Math.hypot(m.x-x,m.y-y)<=r+m.d.size)fn(m);}
function shoot(from,to,kind,col,onHit,hostile){shots.push({x:from.x,y:from.y-10,to,kind,col,onHit,spd:kind==='arrow'?620:440,hostile});}
function dealPhys(m,mult,o={}){
  if(m.dead)return;const crit=Math.random()*100<S.crit;
  if(!o.sure&&!crit){const hc=clamp(80+S.hit-m.d.flee-(ailOn('blind')?45:0),5,100);if(Math.random()*100>hc){floatT(m.x,m.y-m.d.size-8,'Miss','#aab4c4',13);sfx('miss');if(zoneHost())sendHit(m,0,0);else provoke(m);return;}}
  const em=elemMult(o.el,m.d.el);let dmg=S.atk*mult*rnd(.9,1.1);dmg=crit?dmg*1.5:dmg-m.d.def*.6;dmg*=em;
  if(em!==1)elemHint(m,em);if(o.ail&&Math.random()<o.ail[1])ailMob(m,o.ail[0],o.ail[2]);
  hurtMob(m,em===0?0:Math.max(1,Math.round(dmg)),crit,'phys');}
function dealMag(m,mult,el,ail){
  if(m.dead)return;const em=elemMult(el,m.d.el);let dmg=(S.matk*mult*rnd(.92,1.08)-m.d.def*.3)*em;
  if(em!==1)elemHint(m,em);if(ail&&Math.random()<ail[1])ailMob(m,ail[0],ail[2]);
  hurtMob(m,em===0?0:Math.max(1,Math.round(dmg)),false,'mag');}
function provoke(m){if(!m.dead){m.state='chase';m.aggroed=true;}}
function knock(m,src){const dx=m.x-src.x,dy=m.y-src.y,sx=(dx-dy)*ISO,sy=(dx+dy)*ISO/2,n=Math.hypot(sx,sy)||1;
  m.kbX=sx/n;m.kbY=sy/n;m.kbT=now;m.stunUntil=now+.22;fx.push({k:'spark',x:m.x,y:m.y-m.d.size*.9,t0:now,dur:.22,r:rnd(0,6)});}
function hurtMob(m,dmg,crit,kind){m.hitF=now;m.myDmg=(m.myDmg||0)+dmg;const client=!!zoneHost();knock(m,P);
  if(client){m.hp=Math.max(1,m.hp-dmg);sendHit(m,dmg,0);}else{m.hp-=dmg;provoke(m);}
  if(crit){sfx('crit');hitStop(.09);shakeUntil=now+.2;fx.push({k:'critburst',x:m.x,y:m.y-m.d.size,t0:now,dur:.35});
    texts.push({x:m.x,y:m.y-m.d.size-34,txt:'CRITICAL',col:'#ffe27a',size:13,t0:now,dur:.9});
    texts.push({x:m.x,y:m.y-m.d.size-12,txt:fmt(dmg),col:'#ffb03a',size:26,t0:now,dur:1});}
  else{sfx(kind==='mag'?'zap':hitSound());floatT(m.x,m.y-m.d.size-8,fmt(dmg),'#ffffff',15);}
  if(!client&&m.hp<=0){hitStop(.05);killMob(m);}}
function hitSound(){const w=P.eq.weapon&&ITEMS[P.eq.weapon.id];const t=w&&w.wt;return t==='sword'||t==='axe'?'hitBlade':t==='bow'?'hitArrow':'hitBlunt';}
function killMob(m){
  m.dead=true;m.hp=0;m.respawnAt=now+(m.d.respawn||rnd(9,15));
  if(P.target===m){P.target=null;P.queued=null;}
  fx.push({k:'poof',x:m.x,y:m.y,col:m.d.col,t0:now,dur:.45});
  const mine=(m.myDmg||0)>0;m.myDmg=0;if(!mine)return; // in a shared world you are rewarded for monsters you hit
  sfx('kill');
  const sh=partyExpShare(m.d.exp,m.d.jexp);gainExp(sh.e,sh.j);
  questKill(m.d.id);
  if(m.d.boss)announce('boss',m.d.id);
  if(!serverSim())for(const [id,ch] of m.d.drops)if(Math.random()<ch)dropLoot(m,id);
  if(!serverSim()&&Math.random()<(m.d.sigChance||.02)){dropLoot(m,m.d.id+'_sig',{rare:true});addLog(`A ${m.d.name} Sigil dropped! Pick it up.`,'l-rare');sfx('rare');announce('sig',m.d.id);fx.push({k:'beam',x:m.x,y:m.y,t0:now,dur:1.6});}
  if(m.d.boss&&!m.d.world){const r=(m.d.respawn||180)/60;addLog(`The ${m.d.name} has been defeated! It will rise again in ${Math.round(r*2)/2} minutes.`,'l-rare');}
  if(!serverSim())dropLoot(m,null,{gold:Math.round(m.d.lv*rnd(1.5,3))});
}
function dropLoot(m,id,o={}){
  let x=m.x,y=m.y;for(let k=0;k<6;k++){const a=rnd(0,7),r=rnd(14,36),tx=m.x+Math.cos(a)*r,ty=m.y+Math.sin(a)*r;if(canStand(tx,ty,4)){x=tx;y=ty;break;}}
  const rar=id?rarityOf(id):0;if(rar>=2&&!o.rare)announce('drop',id);
  loot.push({id,gold:o.gold||0,rare:!!o.rare||rar>=2,x,y,fx:m.x,fy:m.y,t0:now+loot.length%6*.04,exp:now+120,uid:++lootId});}
function pickUp(l){const i=loot.indexOf(l);if(i<0)return;
  if(!l.gold&&carryWeight()+itemWeight(l.id)>maxWeight()){l.tooHeavy=true;floatT(P.x,P.y-40,'Too heavy!','#ff9a6a',13);addLog(`You are carrying too much to pick up ${ITEMS[l.id].name}.`,'l-bad');return;}
  loot.splice(i,1);
  if(l.gold){P.gold+=l.gold;sfx('coin');floatT(P.x,P.y-40,`+${fmt(l.gold)} gold`,'#ffcf5a',13);}
  else{giveItem(l.id,1,true);if(l.rare)sfx('rare');}}
function lootAt(sc){let best=null,bd=1e9;const pad=touchPick?26:15;for(const l of loot){const q=proj(l.x,l.y),d=Math.hypot(q.x-sc.x,q.y-6-sc.y);if(d<pad&&d<bd){bd=d;best=l;}}return best;}
function goLoot(l){P.target=null;P.queued=null;P.npcGoal=null;P.lootGoal=l;if(dist(P,l)<30){pickUp(l);P.lootGoal=null;}else pathTo(l.x,l.y,true);}
function dropText(d){const pc=c=>{const v=c*100;return(v>=10||v===Math.round(v)?Math.round(v):v.toFixed(1))+'%';};
  return [...d.drops.map(([id,c])=>`${ITEMS[id].name} ${pc(c)}`),`Sigil ${pc(d.sigChance||.02)}`].join(' · ');}
function hurtPlayer(dmg,src){
  if(P.dead)return;P.hp-=dmg;P.sitting=false;P.hurtT=now;interruptCast();if(P.ail&&P.ail.sleep)delete P.ail.sleep;fx.push({k:'spark',x:P.x,y:P.y-24,t0:now,dur:.22,r:rnd(0,6),col:'#ff8a7a'});sfx('hurt');floatT(P.x,P.y-30,fmt(dmg),'#ff6a5a',16);
  if(P.hp<=0){P.hp=0;die(src);}
}
function mobAttack(m){
  if(Math.random()*100<Math.min(10,1+S.luk*.1)){floatT(P.x,P.y-30,'Lucky!','#7fe08a',14);fx.push({k:'ring',x:P.x,y:P.y,r:26,col:'#9ff0a8',t0:now,dur:.3});return;}
  const hc=clamp(85+m.d.hit-S.flee,5,95);
  if(Math.random()*100>hc){floatT(P.x,P.y-30,'Dodge','#9fd3ff',13);return;}
  hurtPlayer(Math.max(1,Math.round(m.d.atk*rnd(.85,1.1)-S.def*.6)),m.d.name);
  if(m.d.ail)tryAilment(m.d.ail);
}
function healP(n){n=Math.max(1,Math.round(n));P.hp=Math.min(S.maxhp,P.hp+n);floatT(P.x,P.y-30,'+'+fmt(n),'#7fd38a',16);fx.push({k:'heal',x:P.x,y:P.y,t0:now,dur:.6});sfx('heal');}
function buff(id,name,dur,b){P.buffs[id]={name,until:now+dur,b};fx.push({k:'ring',x:P.x,y:P.y,r:40,col:'#f0e0a0',t0:now,dur:.5});addLog(`${name} is active for ${dur}s.`,'l-good');S=computeStats();}

const EXPLOG=[];
function gainExp(e,j){
  if(isRested()){e=Math.round(e*(1+REST_BONUS));j=Math.round(j*(1+REST_BONUS));}
  if(e>0){texts.push({x:P.x,y:P.y-52,txt:`+${fmt(e)} EXP`,col:'#ffe27a',size:12,t0:now,dur:1.3,vx:-6});EXPLOG.push({t:Date.now(),e});while(EXPLOG.length>500)EXPLOG.shift();}
  if(j>0&&P.jl<jobMax(P.cls))texts.push({x:P.x+4,y:P.y-40,txt:`+${fmt(j)} Job`,col:'#8fe0a8',size:11,t0:now,dur:1.3,vx:8});
  P.exp+=e;
  const jm=jobMax(P.cls);if(P.jl<jm)P.jexp+=j;
  let lvUp=false,jUp=false;
  let mile=0;
  while(P.lv<99&&P.exp>=expNeed(P.lv)){P.exp-=expNeed(P.lv);P.lv++;P.statPts+=Math.floor(P.lv/5)+3;lvUp=true;if(P.lv%5===0)mile=P.lv;}
  while(P.jl<jm&&P.jexp>=jexpNeed(P.jl)){P.jexp-=jexpNeed(P.jl);P.jl++;P.skillPts++;jUp=true;}
  if(P.jl>=jm)P.jexp=0;
  if(lvUp){sfx('levelup');if(mile)announce('lv',mile);S=computeStats();P.hp=S.maxhp;P.sp=S.maxsp;fx.push({k:'lvl',x:P.x,y:P.y,t0:now,dur:1.6,txt:'LEVEL UP'});addLog(`Base level ${P.lv}! You have ${P.statPts} stat points to spend (C).`,'l-lvl');save();}
  if(jUp){if(!lvUp)sfx('jobup');fx.push({k:'lvl',x:P.x,y:P.y-18,t0:now,dur:1.6,txt:'JOB UP',col:'#62bf86'});addLog(`Job level ${P.jl}! You have ${P.skillPts} skill points (K).`,'l-lvl');
    if(P.cls==='novice'&&P.jl>=10)addLog('You can now choose a calling. Talk to Guildmaster Corvin in Hearthvale.','l-rare');
    if(TRIALS[P.cls]&&P.jl===JOB2_LV&&!P.trial)addLog('You are ready for an advanced calling. Talk to Guildmaster Corvin in Hearthvale to begin your trial.','l-rare');refreshPanel();}
  if(lvUp)refreshPanel();
}
function die(src){
  P.dead=true;P.casting=null;P.ail={};P.target=null;P.path=[];P.queued=null;
  const loss=P.lv>1?Math.floor(expNeed(P.lv)*.01):0;P.exp=Math.max(0,P.exp-loss);
  $('#deathMsg').textContent=`Struck down by ${src}.`+(loss?` You lost ${fmt(loss)} experience.`:'');
  $('#death').hidden=false;sfx('death');addLog(`You were defeated by ${src}.`,'l-bad');
}

/* ================= items ================= */
function invFind(id){return P.inv.find(e=>e.id===id&&e.n!==undefined);}
function giveItem(id,n=1,announce){
  const it=ITEMS[id];
  if(it.type==='weapon'||it.type==='armor'||it.type==='accessory'||it.type==='head'){for(let i=0;i<n;i++)P.inv.push({id,uid:uid++,s:Array(it.slots).fill(null)});}
  else{const e=invFind(id);if(e)e.n+=n;else P.inv.push({id,n});}
  if(announce){sfx('pickup');}if(announce)addLog(`You got ${it.name}${n>1?' ×'+n:''}.`,'l-loot');
  refreshPanel();rebuildHotbar();
}
function takeItem(id,n=1){const e=invFind(id);if(!e||e.n<n)return false;e.n-=n;if(e.n<=0)P.inv.splice(P.inv.indexOf(e),1);return true;}
function canEquip(it){
  if(P.lv<it.lv)return `Requires base level ${it.lv}.`;
  if(it.type==='weapon'&&!CLASSES[P.cls].weapons.includes(it.wt))return `A ${CLASSES[P.cls].name} cannot use ${it.wt}s.`;
  return null;
}
function useInv(i){
  const e=P.inv[i];if(!e||P.dead)return;const it=ITEMS[e.id];
  if(it.type==='use')return useItem(e.id);
  if(it.type==='etc'){addLog(`${it.name} sells for ${sellValue(e.id)} gold at the General Store.`);return;}
  if(it.type==='sigil'){
    const eqd=P.eq[it.kind];
    if(!eqd){addLog(`Equip ${it.kind==='accessory'?'an':'a'} ${it.kind} with a free slot first.`,'l-bad');return;}
    const k=eqd.s.indexOf(null);
    if(k<0){addLog(`Your ${ITEMS[eqd.id].name} has no free sigil slot.`,'l-bad');return;}
    eqd.s[k]=e.id;takeItem(e.id);addLog(`Socketed ${it.name} into ${ITEMS[eqd.id].name}. ${MOBS[e.id.replace('_sig','')].sig.txt}.`,'l-good');
    S=computeStats();refreshPanel();save();return;
  }
  const why=canEquip(it);if(why){addLog(why,'l-bad');return;}
  const slot=it.type, old=P.eq[slot];
  P.inv.splice(i,1);P.eq[slot]=e;if(old)P.inv.push(old);
  addLog(`Equipped ${it.name}.`);S=computeStats();P.hp=Math.min(P.hp,S.maxhp);P.sp=Math.min(P.sp,S.maxsp);refreshPanel();save();
}
function unequip(slot){const e=P.eq[slot];if(!e)return;P.eq[slot]=null;P.inv.push(e);S=computeStats();P.hp=Math.min(P.hp,S.maxhp);P.sp=Math.min(P.sp,S.maxsp);refreshPanel();}
function useItem(id){
  if(P.dead)return;const it=ITEMS[id];
  if(!invFind(id)){addLog(`You have no ${it.name}.`,'l-bad');return;}
  if((P.cd['item']||0)>now)return;
  if(it.cure){if(!Object.keys(P.ail||{}).some(ailOn)){addLog('You have no ailments to cure.');return;}cureAll();}
  else if(it.heal){if(P.hp>=S.maxhp)return;healP(it.heal);}
  else if(it.sp){if(P.sp>=S.maxsp)return;P.sp=Math.min(S.maxsp,P.sp+it.sp);floatT(P.x,P.y-30,'+'+it.sp+' SP','#7ab0f0',15);}
  else if(it.home){takeItem(id);enterZone('town');addLog('The scroll carries you home.');save();return;}
  else if(it.tele){if(Z.D.safe){addLog('Drift Leaves only work outside town.','l-bad');return;}
    const i=Z.spawnTiles[Math.floor(Math.random()*Z.spawnTiles.length)];P.x=(i%Z.w+.5)*TILE;P.y=(((i/Z.w)|0)+.5)*TILE;P.path=[];P.target=null;fx.push({k:'ring',x:P.x,y:P.y,r:30,col:'#7fd36a',t0:now,dur:.5});}
  takeItem(id);P.cd['item']=now+.25;refreshPanel();
}
const sellValue=id=>{const it=ITEMS[id];return it.type==='etc'?it.price:it.type==='sigil'?Math.floor(it.price/2):Math.floor(it.price/2);};

/* ================= skills use ================= */
function skillReady(id){return (P.cd[id]||0)<=now;}
function useSkill(id){
  const l=castLv(id);if(!l||P.dead||P.casting)return;const sk=SKILLS[id];
  if(!skillReady(id))return;
  if(P.heavy>1){tooHeavy();return;}
  if(ailHeld()||ailOn('silence')){floatT(P.x,P.y-40,ailOn('silence')?'Silenced':'Cannot act','#c58cff',12);return;}
  const cost=sk.sp(l);
  if(P.sp<cost){floatT(P.x,P.y-30,'Not enough SP','#7ab0f0',13);return;}
  if(sk.kind==='target'||sk.kind==='area'){
    const t=P.target&&!P.target.dead?P.target:null;
    if(sk.kind==='target'&&!t){addLog(`Select a target for ${sk.name} first.`,'l-bad');return;}
    if(t&&dist(P,t)>sk.range+t.d.size){P.queued=id;return;}
    if(sk.kind==='area'){const x=t?t.x:P.x,y=t?t.y:P.y;beginCast(id,l,cost,()=>sk.run(l,x,y));return;}
    P.face=sface(t.x-P.x,t.y-P.y);beginCast(id,l,cost,()=>sk.run(l,t));return;
  }
  beginCast(id,l,cost,()=>sk.run(l));
}
function castTime(id){const c=CAST[id];return c?c*Math.max(.25,1-S.dex/120):0;}
function beginCast(id,l,cost,fn){const ct=castTime(id);if(!ct)return castNow(id,l,cost,fn);
  P.casting={id,l,cost,fn,t0:now,dur:ct,tgt:P.target};P.queued=null;P.sitting=false;P.path=[];sfx('cast');}
function castTick(){const c=P.casting;if(!c)return;
  if(P.moving){P.casting=null;floatT(P.x,P.y-44,'Cast cancelled','#aab4c4',12);return;}
  if(SKILLS[c.id].kind==='target'&&(!c.tgt||c.tgt.dead)){P.casting=null;return;}
  if(now>=c.t0+c.dur){P.casting=null;if(P.sp<c.cost){floatT(P.x,P.y-30,'Not enough SP','#7ab0f0',13);return;}castNow(c.id,c.l,c.cost,c.fn);}}
function interruptCast(){if(P.casting){P.casting=null;floatT(P.x,P.y-44,'Interrupted!','#ff9a6a',13);}}
let heavyMsgT=0;function tooHeavy(){if(now<heavyMsgT)return;heavyMsgT=now+4;floatT(P.x,P.y-40,'Too heavy!','#ff9a6a',13);addLog('You are carrying over 90% of your weight limit and cannot fight. Sell or drop something.','l-bad');}
function castNow(id,l,cost,fn){P.sp-=cost;P.cd[id]=now+SKILLS[id].cd;P.queued=null;P.sitting=false;P.atkT=Math.max(P.atkT,.25);
  floatT(P.x,P.y-44,SKILLS[id].name+(l>1?' '+l:''),'#f0e0a0',12);sfx('skill');fn();}

/* ================= party, contracts, auto-hunt ================= */
function partyCount(){return P?partyMatesHere().length:0;}
function contractOffers(){
  const all=Object.values(MOBS).filter(m=>!m.boss);
  return all.map(m=>({m,d:Math.abs(m.lv-P.lv)})).sort((a,b)=>a.d-b.d).slice(0,3).map(({m})=>{
    const need=m.lv>=30?8:m.lv>=14?10:12;
    return {mob:m.id,need,exp:Math.round(m.exp*need*.9),jexp:Math.round(m.jexp*need*.7),gold:m.lv*need*8};});
}
function questKill(id){const q=P.quest;if(!q||q.mob!==id)return;q.have=Math.min(q.need,q.have+1);
  if(q.have>=q.need){P.quest=null;addLog(`Contract complete: ${q.need} ${MOBS[id].name}. Reward: ${fmt(q.exp)} EXP, ${fmt(q.gold)} gold.`,'l-rare');
    P.gold+=q.gold;sfx('fanfare');fx.push({k:'lvl',x:P.x,y:P.y-30,t0:now,dur:1.6,txt:'CONTRACT DONE',col:'#ffcf5a'});announce('quest',id);gainExp(q.exp,q.jexp);save();}
  refreshPanel();}
function autoHunt(){
  if(!P.auto||P.dead||Z.D.safe)return;
  const f=P.hp/S.maxhp;
  if(f<.4&&(P.cd['item']||0)<=now){const pot=invFind('orange')?'orange':invFind('red')?'red':null;
    if(pot)useItem(pot);else if(f<.3){P.auto=false;$('#autoBtn').classList.remove('on');addLog('Auto-hunt paused: you are out of tonics. Rest with Sit or buy more in town.','l-bad');return;}}
  if((!P.target||P.target.dead)&&!P.path.length&&!P.lootGoal){let bl=null,bd=320;for(const l of loot)if(now>l.t0+.4&&!l.tooHeavy){const d=dist(l,P);if(d<bd){bd=d;bl=l;}}if(bl){goLoot(bl);return;}}
  if((!P.target||P.target.dead)&&!P.path.length&&f>=.3){let best=null,bd=650;for(const m of mobs)if(!m.dead){const d=dist(m,P);if(d<bd){bd=d;best=m;}}if(best){P.target=best;P.queued=null;P.sitting=false;}}
}

/* ================= zones & entities ================= */
function spawnMob(type,m,lead){
  let i=Z.spawnTiles[Math.floor(Math.random()*Z.spawnTiles.length)];
  m=m||{};if(lead)m.lead=lead;
  // an escort appears beside its living leader
  const L=m.lead&&mobs.find(o=>o.d&&o.d.id===m.lead&&!o.dead);
  if(L){const lx=Math.floor(L.x/TILE),ly=Math.floor(L.y/TILE);for(let k=0;k<20;k++){const tx=lx+Math.round(rnd(-2.4,2.4)),ty=ly+Math.round(rnd(-2.4,2.4)),j=ty*Z.w+tx;
    if(tx>0&&ty>0&&tx<Z.w-1&&ty<Z.h-1&&!BLOCK[Z.t[j]]&&Z.reach[j]){i=j;break;}}}
  const d=MOBS[type];const x=(i%Z.w+.5)*TILE,y=(((i/Z.w)|0)+.5)*TILE;
  Object.assign(m,{calls:0,d,x,y,sx:x,sy:y,hp:d.hp,state:'idle',atkT:0,wT:rnd(0,3),tx:null,ty:null,face:1,hitF:-9,dead:false,slowUntil:0,aggroed:false,ph:Math.random()*6,slamT:now+6,slamAt:0});
  return m;
}
function enterZone(id,from){
  zoneId=id;Z=getZone(id);P.zone=id;mobs=[];wbMob=null;fx=[];shots=[];loot=[];P.lootGoal=null;hoverLoot=null;
  if(Z.D.mobs)for(const [type,n,lead] of Z.D.mobs)for(let k=0;k<n;k++)mobs.push(spawnMob(type,null,lead));
  mobs.forEach((m,i)=>m.idx=i);NET.srv=null;NET.zt=Date.now();NET.evs=[];NET.hits=[];NET.evSeen.clear();NET.wasClient=false;NET.lastSent='';NET.sendT=0;
  {const b=mobs.find(m=>m.d.boss);if(b)addLog(b.d.id==='warlord'?'The ground smoulders. The Ashen Warlord stirs somewhere in this crypt.':b.d.mini?`The ${b.d.name} and its pack roam this region.`:`Something stirs on this floor. The ${b.d.name} is here.`,'l-rare');}
  let pos=Z.spawn;
  if(from){const pt=Z.portals.find(p=>p.to===from);if(pt)pos=pt.side==='down'?{x:pt.x,y:pt.y-2.4*TILE}:{x:pt.x+(pt.side==='west'?2.6:-2.6)*TILE,y:pt.y};}
  P.casting=null;P.x=pos.x;P.y=pos.y;P.path=[];P.target=null;P.queued=null;P.npcGoal=null;P.portalLock=now+.6;
  if(!P.visited.includes(id))P.visited.push(id);
  if(from)sfx('portal');musicPlay(Z.D.music||id);
  $('#zName').textContent=Z.D.name;$('#zLv').textContent=Z.D.lvl;
  addLog(`You enter ${Z.D.name} (${Z.D.lvl}).`);showBanner(Z.D.name,Z.D.lvl);
  if(!['shop','job','heal','warp'].includes(panelKind)||!Z.D.safe)closePanel();
}

/* ================= update ================= */
const keys={};
function update(dt){
  netTick(dt);
  if(P&&(zoneId==='crypt'||Z.D.dungeon)){const b=mobs.find(m=>m.d.boss&&!m.d.world&&!m.dead);musicPlay(b&&b.state==='chase'&&dist(b,P)<650?'boss':Z.D.music||zoneId);}
  if(!P||P.dead){if(P&&Z)mobsTick(dt);updateFx();return;}
  S=computeStats();
  for(const k in P.buffs)if(P.buffs[k].until<now){addLog(`${P.buffs[k].name} has worn off.`);delete P.buffs[k];S=computeStats();}
  // regen
  const rm=P.sitting?2.5:1;
  const wp=carryWeight()/maxWeight();P.heavy=wp>=.9?2:wp>=.5?1:0;
  ailTick(dt);const held=ailHeld();
  if(!P.heavy&&!ailOn('poison')){P.hp=Math.min(S.maxhp,P.hp+S.regen*rm*dt);P.sp=Math.min(S.maxsp,P.sp+S.spregen*rm*dt);}
  // keyboard
  let kx=(keys.d||keys.arrowright?1:0)-(keys.a||keys.arrowleft?1:0), ky=(keys.s||keys.arrowdown?1:0)-(keys.w||keys.arrowup?1:0);
  P.moving=false;
  if((kx||ky)&&!held){if(kx)P.face=kx;if(ky)P.back=ky<0;P.lootGoal=null;
    if(!P.sitting){P.path=[];P.target=null;P.queued=null;P.npcGoal=null;const wx=(kx+2*ky)/2,wy=(2*ky-kx)/2,n=Math.hypot(wx,wy);moveEnt(P,wx/n*S.speed*dt,wy/n*S.speed*dt,PR);P.moving=true;}}
  if(!held)autoHunt();
  // target behaviour
  const t=P.target;
  if(t&&!t.dead&&!held){
    const need=P.queued?SKILLS[P.queued].range:S.range;
    const d=dist(P,t)-t.d.size;
    if(d<=need&&(!S.ranged&&!P.queued?true:clearLine(P.x,P.y,t.x,t.y)||d<60)){
      P.path=[];faceTo(P,t.x-P.x,t.y-P.y);
      if(P.queued){useSkill(P.queued);}
      else if(P.atkT<=0&&!P.casting){if(P.heavy>1){tooHeavy();P.atkT=1;}else{basicAttack(t);P.atkT=S.delay;}}
    } else {P.repathT=(P.repathT||0)-dt;if(P.repathT<=0||!P.path.length){pathTo(t.x,t.y,true);P.repathT=.35;}}
  } else if(t&&t.dead){P.target=null;}
  P.atkT-=dt;
  // follow path
  if(P.path.length&&!held){const w=P.path[0];const dx=w.x-P.x,dy=w.y-P.y,d=Math.hypot(dx,dy),st=S.speed*dt;
    if(d<=st){if(!moveEnt(P,dx,dy,PR))P.path=[];else P.path.shift();}else{moveEnt(P,dx/d*st,dy/d*st,PR);}
    P.moving=true;if(d>2)faceTo(P,dx,dy);}
  if(P.moving)P.walkT+=dt;
  castTick();
  // loot
  loot=loot.filter(l=>now<l.exp);
  if(P.lootGoal){if(!loot.includes(P.lootGoal))P.lootGoal=null;else if(dist(P,P.lootGoal)<30){pickUp(P.lootGoal);P.lootGoal=null;P.path=[];}else if(!P.path.length)P.lootGoal=null;}
  // npc
  if(P.npcGoal){if(dist(P,P.npcGoal)<48){P.path=[];openNpc(P.npcGoal);P.npcGoal=null;}else if(!P.path.length)P.npcGoal=null;}
  // portals
  if(now>(P.portalLock||0))for(const pt of Z.portals)if(Math.hypot(P.x-pt.x,P.y-pt.y)<22){const from=zoneId;enterZone(pt.to,from);save();break;}
  // mobs
  mobsTick(dt);
  // projectiles
  for(let i=shots.length-1;i>=0;i--){const s=shots[i],tg=s.to;
    if(!s.hostile&&tg.dead){shots.splice(i,1);continue;}
    const tx=tg.x,ty=tg.y-10,dx=tx-s.x,dy=ty-s.y,d=Math.hypot(dx,dy),st=s.spd*dt;
    if(d<=st+4){shots.splice(i,1);s.onHit();}else{s.x+=dx/d*st;s.y+=dy/d*st;s.ang=Math.atan2((dx+dy)/2,dx-dy);}}
  updateFx();
}
function basicAttack(t){
  const c=CLASSES[P.cls];P.swingT=now;P.swingDur=clamp(S.delay*.45,.1,.28);
  if(c.magic){sfx('cast');shoot(P,t,'orb','#b8a0ff',()=>dealMag(t,.85));}
  else if(S.range>100){sfx('bow');shoot(P,t,'arrow','#e8dcb0',()=>dealPhys(t,1));}
  else{P.swingT=now;const dx=t.x-P.x,dy=t.y-P.y,sx=(dx-dy)*ISO,sy=(dx+dy)*ISO/2,n=Math.hypot(sx,sy)||1;P.lgX=sx/n;P.lgY=sy/n;P.lungeT=now;
    fx.push({k:'slash',x:t.x,y:t.y,t0:now,dur:.2});dealPhys(t,1);}
}
function mobTargets(){const t=[];if(P&&!P.dead&&!Z.D.safe)t.push(P);
  if(NET.room&&!Z.D.safe)for(const o of NET.others.values())if(o.z===zoneId&&!o.dead&&o.id)t.push(o);return t;}
function callMinions(m,fxOnly){if(!fxOnly)for(const o of mobs)if(o.lead===m.d.id&&o.dead){spawnMob(o.d.id,o);o.state='chase';o.aggroed=true;}
  fx.push({k:'ring',x:m.x,y:m.y,r:90,col:'#ffcf5a',t0:now,dur:.6});floatT(m.x,m.y-m.d.size-30,'Calls its pack!','#ffcf5a',14);
  if(dist(m,P)<700)addLog(`The ${m.d.name} calls its pack to its side!`,'l-bad');sfx('rare');}
function slamLand(m){fx.push({k:'ring',x:m.x,y:m.y,r:130,col:'#ff7a3a',t0:now,dur:.4});sfx('slam');shakeUntil=now+.35;
  if(!P.dead&&dist(m,P)<130+PR){hurtPlayer(Math.round(m.d.atk*1.5-S.def*.6),m.d.name);tryAilment(['stun',1,1.5]);}}
function updateMob(m,dt,T){
  if(m.dead){if(now>=m.respawnAt){spawnMob(m.d.id,m);if(m.d.boss)addLog(`The ${m.d.name} has risen again in ${Z.D.name}!`,'l-rare');}return;}
  if(m.d.calls&&m.calls<2&&m.hp<m.d.hp*(m.calls?.3:.6)){m.calls++;callMinions(m);netEvent('c',m);}
  if(m.ailUntil>now){m.moving=false;return;}
  let tg=null,dp=1e9;for(const t of T){const q=dist(m,t);if(q<dp){dp=q;tg=t;}}
  const d=m.d, slow=m.slowUntil>now?.4:1;
  if(m.slamAt){if(now>=m.slamAt){m.slamAt=0;m.slamT=now+7;netEvent('s',m);slamLand(m);}return;}
  if(!tg){if(m.state==='chase'){m.state='idle';m.aggroed=false;}}
  else if(m.state!=='chase'&&d.aggro&&dp<170)m.state='chase';
  if(m.state==='chase'&&tg){
    if(Math.hypot(m.x-m.sx,m.y-m.sy)>520||dp>600){m.state='return';m.aggroed=false;}
    else{
      if(d.boss&&now>m.slamT&&dp<160){m.slamAt=now+1.1;fx.push({k:'warn',x:m.x,y:m.y,r:130,t0:now,dur:1.1});netEvent('w',m);return;}
      const reach=(d.range||0)+d.size+PR+4;
      m.atkT-=dt;
      if(dp<=reach){m.face=sface(tg.x-m.x,tg.y-m.y);m.moving=false;if(m.atkT<=0){m.atkT=d.boss?1.3:1.6;m.lunge=now;
          if(tg===P){if(d.range)shoot(m,P,'arrow','#d8d0b8',()=>mobAttack(m),true);else mobAttack(m);}
          else{netEvent('a',m,tg.id);if(d.range)shoot(m,tg,'arrow','#d8d0b8',()=>{},true);}}}
      else if(!(m.stunUntil>now)){const dx=tg.x-m.x,dy=tg.y-m.y,n=Math.hypot(dx,dy),s=d.spd*slow*dt*1.15;moveEnt(m,dx/n*s,dy/n*s,Math.min(d.size*.6,11));m.face=sface(dx,dy);m.moving=true;}
    }
  }
  if(m.state==='return'){const dx=m.sx-m.x,dy=m.sy-m.y,n=Math.hypot(dx,dy);if(n<8){m.state='idle';m.hp=d.hp;}else{const s=d.spd*1.6*dt;if(!moveEnt(m,dx/n*s,dy/n*s,Math.min(d.size*.6,11))){m.x=m.sx;m.y=m.sy;}m.hp=Math.min(d.hp,m.hp+d.hp*dt*.5);}}
  if(m.state==='idle'){m.moving=false;m.wT-=dt;
    if(m.tx!==null){const dx=m.tx-m.x,dy=m.ty-m.y,n=Math.hypot(dx,dy);if(n<3)m.tx=null;else{const s=d.spd*.45*slow*dt;if(!moveEnt(m,dx/n*Math.min(s,n),dy/n*Math.min(s,n),Math.min(d.size*.6,11)))m.tx=null;m.face=sface(dx,dy);m.moving=true;}}
    if(m.wT<=0){m.wT=rnd(2,5);if(Math.hypot(m.x-m.sx,m.y-m.sy)>150){m.tx=m.sx;m.ty=m.sy;}else{m.tx=m.x+rnd(-80,80);m.ty=m.y+rnd(-80,80);}}}
}
/* ---- shared monsters: one player per region (whoever got there first) runs them, everyone else follows ---- */
function othersHere(){for(const o of NET.others.values())if(o.z===zoneId&&o.id)return true;return false;}
function serverSim(){return !!(NET.srv&&NET.srv.z===zoneId&&now-NET.srv.at<3);}
function zoneHost(){
  if(serverSim())return NET.srv;
  if(!NET.room||!P)return null;let best=null;
  for(const o of NET.others.values())if(o.z===zoneId&&o.id&&o.zt&&!o.hd&&(!best||o.zt<best.zt||(o.zt===best.zt&&o.id<best.id)))best=o;
  if(!best||NET.zt<best.zt||(NET.zt===best.zt&&NET.myId<best.id))return null;
  return best;}
function netEvent(k,m,t){if(!NET.room)return;NET.evs=[...NET.evs,{i:++NET.evId,k,m:m.idx,t:t||null}].slice(-24);NET.lastSent='';NET.sendT=0;}
function sendHit(m,d,sl,ex){NET.hits=[...NET.hits,{i:++NET.hitId,m:m.idx,d,sl,...(ex||{})}].slice(-24);NET.lastSent='';NET.sendT=0;}
function slowMob(m,t){if(zoneHost())sendHit(m,0,t);m.slowUntil=now+t;}
function applyHits(apply){
  for(const o of NET.others.values()){const hx=o.hx||[];if(o.hxSeen===undefined)o.hxSeen=0;
    if(!apply||o.z!==zoneId){for(const h of hx)o.hxSeen=Math.max(o.hxSeen,fin(h&&h.i));continue;}
    for(const h of hx){if(!h||fin(h.i)<=o.hxSeen)continue;o.hxSeen=fin(h.i);const m=mobs[fin(h.m)|0];if(!m||m.dead)continue;
      provoke(m);if(h.sl)m.slowUntil=now+clamp(fin(h.sl),0,6);if(h.sk==='freeze'||h.sk==='stun'){m.ail=h.sk;m.ailUntil=now+clamp(fin(h.st),0,5);}
      const dmg=clamp(Math.round(fin(h.d)),0,99999);
      if(dmg>0){m.hp-=dmg;m.hitF=now;knock(m,o);floatT(m.x,m.y-m.d.size-8,fmt(dmg),'#cfe0ff',13);if(m.hp<=0)killMob(m);}}}}
function syncMobs(host,dt){
  const mb=host.mb;if(!mb)return;
  // an older server knows fewer monsters here (new ones are always added at the end of a region's list):
  // sync the ones it knows and keep the rest out of the world until it catches up
  const base=mobs.length-(wbMob?1:0);if(mb.length>base)return;
  if(mb.length<base){for(let i=mb.length;i<base;i++){const m=mobs[i];if(!m.dead){m.dead=true;if(P.target===m)P.target=null;}m.respawnAt=now+1e9;}}
  else if(typeof syncWorldBoss==='function')syncWorldBoss(host,mb.length);
  for(let i=0;i<mobs.length;i++){const m=mobs[i],st=i<mb.length?mb[i]:wbMob&&m===wbMob&&host.wb&&host.wb.s;if(!Array.isArray(st))continue;
    const f=fin(st[3])|0,dead=!!(f&1),nx=fin(st[0]),ny=fin(st[1]);
    if(dead){if(!m.dead)killMob(m);continue;}
    if(m.dead){m.dead=false;m.x=nx;m.y=ny;m.hp=m.d.hp;m.myDmg=0;}
    if(Math.hypot(nx-m.x,ny-m.y)>200){m.x=nx;m.y=ny;}else{const k=Math.min(1,dt*10);m.x+=(nx-m.x)*k;m.y+=(ny-m.y)*k;}
    const hp=clamp(fin(st[2]),0,1000)/1000*m.d.hp;if(now-m.hitF>.6||hp<m.hp)m.hp=Math.max(1,hp);
    m.moving=!!(f&2);m.face=f&4?-1:1;m.state=f&8?'chase':'idle';if(f&16)m.slowUntil=Math.max(m.slowUntil,now+.3);
    if(f&96){m.ail=f&32?'freeze':'stun';m.ailUntil=now+.3;}}
  const evs=host.ev||[];let seen=NET.evSeen.get(host.id);
  if(seen===undefined)seen=Math.max(0,...evs.map(e=>fin(e&&e.i)));
  for(const e of evs){if(!e||fin(e.i)<=seen)continue;seen=fin(e.i);const m=mobs[fin(e.m)|0];if(!m)continue;
    if(e.k==='d'){if(e.t===NET.myId){serverLoot(m,e);if(e.mvp&&typeof mvpWin==='function')mvpWin(m);}continue;}
    if(m.dead)continue;
    if(e.k==='a'){m.lunge=now;
      if(e.t===NET.myId){if(!P.dead){if(m.d.range)shoot(m,P,'arrow','#d8d0b8',()=>mobAttack(m),true);else mobAttack(m);}}
      else if(m.d.range){for(const o of NET.others.values())if(o.id===e.t){shoot(m,{x:o.rx,y:o.ry},'arrow','#d8d0b8',()=>{},true);break;}}}
    else if(e.k==='w')fx.push({k:'warn',x:m.x,y:m.y,r:130,t0:now,dur:1.1});
    else if(e.k==='s')slamLand(m);
    else if(e.k==='c')callMinions(m,true);}
  NET.evSeen.set(host.id,seen);}
// loot the server rolled for us when a monster we hit died
function serverLoot(m,e){const l=Array.isArray(e.l)?e.l.slice(0,12):[];
  for(const id of l){if(typeof id!=='string'||!ITEMS[id])continue;
    if(ITEMS[id].type==='sigil'){dropLoot(m,id,{rare:true});addLog(`A ${m.d.name} Sigil dropped! Pick it up.`,'l-rare');sfx('rare');announce('sig',m.d.id);fx.push({k:'beam',x:m.x,y:m.y,t0:now,dur:1.6});}
    else dropLoot(m,id);}
  const g=clamp(Math.round(fin(e.g)),0,100000);if(g)dropLoot(m,null,{gold:g});}
function mobsTick(dt){const host=zoneHost();
  if(host){NET.wasClient=true;applyHits(false);syncMobs(host,dt);return;}
  if(wbMob&&typeof dropWorldBoss==='function')dropWorldBoss(); // only the server runs world bosses
  if(NET.wasClient){NET.wasClient=false;for(const m of mobs){m.sx=m.x;m.sy=m.y;m.atkT=1;if(m.dead)m.respawnAt=now+rnd(4,9);}}
  applyHits(true);const T=mobTargets();for(const m of mobs)updateMob(m,dt,T);}
function updateFx(){fx=fx.filter(f=>now<f.t0+f.dur);texts=texts.filter(f=>now<f.t0+f.dur);}

