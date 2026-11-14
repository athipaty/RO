"use strict";
/* ================= job-change quests that start by themselves =================
   The moment you qualify for your next job, a calling quest appears (with a card), is pinned, and the quest log, the
   status-box tracker and the goal chip/arrow (js/goal.js) lead you through it step by step:
     Your Calling        Novice, Job Lv 10           → talk to Guildmaster Corvin and choose a job
     Trial of the <job>  first job, Job Lv 40        → begin the trial with Corvin → defeat / bring / fee → choose
     Rite of Rebirth     advanced job, ready         → Seer Valen in Aurelmark
     Trial of Ascension  reborn, Job Lv 50, Lv 50    → begin with Valen → defeat / bring / fee → choose a master job
   It is worked out from your job, levels and trial progress, so nothing extra is saved except which cards were shown
   and which completion gifts were given (P.callSeen, P.callDone). */
const CORVIN={zone:'town',npc:'Guildmaster Corvin'},VALEN={zone:'capital',npc:'Seer Valen'};
function callingNow(){if(!P)return null;const c=CLASSES[P.cls];if(!c)return null;
  if(P.cls==='novice')return P.jl>=10?{id:'call1',name:'Your Calling',steps:[{text:'Talk to Guildmaster Corvin in Hearthvale and choose your job',go:CORVIN}]}:null;
  if((!c.tier||c.tier===1)&&typeof TRIALS!=='undefined'&&TRIALS[P.cls]&&typeof JOB2_LV!=='undefined'&&P.jl>=JOB2_LV){const T=TRIALS[P.cls],name=`Trial of the ${c.name}`;
    if(!P.trial)return {id:'call2',name,steps:[{text:'Talk to Guildmaster Corvin to begin the trial',go:CORVIN}]};
    const it=invFind(T.item),have=it?it.n:0,k=Math.min(P.trial.have||0,T.need);
    if(typeof trialDone==='function'&&trialDone())return {id:'call2',name,steps:[{text:'Return to Corvin and choose your advanced job',go:CORVIN}]};
    return {id:'call2',name,trial:{mob:T.mob,need:T.need,have:k,item:T.item,items:T.items,gold:T.gold},steps:[
      {text:`Defeat ${MOBS[T.mob].name} ${k}/${T.need}`,done:k>=T.need,go:{mob:T.mob}},{text:`Bring ${ITEMS[T.item].name} ${Math.min(have,T.items)}/${T.items}`,done:have>=T.items,go:{item:T.item}},
      {text:`${fmt(T.gold)} gold for the guild`,done:P.gold>=T.gold},{text:'Then return to Corvin',go:CORVIN}]};}
  if(c.tier===2&&!P.reborn&&typeof rebirthWhy==='function'){const why=rebirthWhy();if(!why||/costs/.test(why))return {id:'call3',name:'Rite of Rebirth',steps:[{text:'Talk to Seer Valen in Aurelmark about the rite of rebirth',go:VALEN},...(why?[{text:why,done:false}]:[])]};return null;}
  if(c.tier===2&&P.reborn&&typeof job3Why==='function'&&!job3Why()){const T=typeof trial3Of==='function'?trial3Of():null;if(!T)return null;
    if(!P.trial3)return {id:'call4',name:'Trial of Ascension',steps:[{text:'Talk to Seer Valen in Aurelmark to begin the trial',go:VALEN}]};
    if(typeof trial3Done==='function'&&trial3Done())return {id:'call4',name:'Trial of Ascension',steps:[{text:'Return to Seer Valen and choose your master job',go:VALEN}]};
    const it=invFind(T.item),have=it?it.n:0,k=Math.min(P.trial3.have||0,T.need),gold=typeof JOB3_GOLD!=='undefined'?JOB3_GOLD:0;
    return {id:'call4',name:'Trial of Ascension',trial:{mob:T.mob,need:T.need,have:k,item:T.item,items:T.items,gold},steps:[
      {text:`Defeat ${MOBS[T.mob].name} ${k}/${T.need}`,done:k>=T.need,go:{mob:T.mob}},{text:`Bring ${ITEMS[T.item].name} ${Math.min(have,T.items)}/${T.items}`,done:have>=T.items,go:{item:T.item}},
      {text:`${fmt(gold)} gold`,done:P.gold>=gold},{text:'Then return to Seer Valen',go:VALEN}]};}
  return null;}
const callStep=q=>q&&(q.steps.find(s=>!s.done&&s.go)||q.steps.find(s=>!s.done)||q.steps[q.steps.length-1]);
// where the current step leads (for js/goal.js)
function callGoal(q){const s=callStep(q);if(!s||!s.go)return null;const g=s.go;
  if(g.npc)return {zone:g.zone,npc:g.npc,text:s.text};
  if(g.mob)return {zone:typeof mobZone==='function'?mobZone(g.mob):null,mob:g.mob,text:s.text};
  if(g.item){const src=typeof dropSources==='function'?dropSources(g.item)[0]:null;return {zone:src&&typeof mobZone==='function'?mobZone(src.id):null,mob:src&&src.id,text:s.text};}
  return null;}
const callPinned=()=>P&&(P.track==='calling'||!P.track);

/* ---- a card when one starts, a gift when one is finished ---- */
const CALL_GIFT={call1:[['red',5]],call2:[['orange',5]],call4:[['blue',5]]};
let callLast=null;
function callTick(){if(!P||!running)return;const q=callingNow(),id=q&&q.id;P.callSeen=P.callSeen||{};P.callDone=P.callDone||{};
  if(id&&!P.callSeen[id]){P.callSeen[id]=1;P.track='calling';
    if(typeof levelCard==='function')levelCard(['New quest!',q.name,callStep(q).text],[['quests','Quest log']]);if(typeof sfx==='function')sfx('fanfare');
    addLog(`New quest: ${q.name}. ${callStep(q).text}.`,'l-rare');if(typeof save==='function')save();}
  // finished: the quest went away because the job changed (not because of a level drop, which cannot happen)
  if(callLast&&callLast!==id&&!P.callDone[callLast]&&(callLast!=='call3'||P.reborn)){const done=callLast;P.callDone[done]=1;const gift=CALL_GIFT[done]||[];
    for(const [i,n] of gift)if(ITEMS[i])giveItem(i,n);addLog(`Quest complete: ${{call1:'Your Calling',call2:'Trial',call3:'Rite of Rebirth',call4:'Trial of Ascension'}[done]}!${gift.length?' '+gift.map(([i,n])=>`${ITEMS[i].name} ×${n}`).join(', '):''}`,'l-rare');
    if(P.track==='calling'&&!id)P.track=null;}
  callLast=id;}
setInterval(()=>{try{callTick();}catch(e){}},1000);

/* ---- the goal chip and arrow follow the calling when it is pinned ---- */
if(typeof goalWhat==='function'){const _gwC=goalWhat;goalWhat=function(){const q=callPinned()?callingNow():null;if(q){const g=callGoal(q);if(g)return g;}return _gwC.apply(this,arguments);};}

/* ---- status-box tracker ---- */
if(typeof questHud==='function'){const _qhC=questHud;questHud=function(){const q=P&&P.track==='calling'?callingNow():null;
  if(!q){if(P&&P.track==='calling')P.track=null;return _qhC.apply(this,arguments);}
  const el=document.getElementById('qtrack');if(!el)return;const st=callStep(q);
  const html=`<b>${esc(q.name)}</b><span class="qo"><span class="qm">·</span><span>${esc(st.text)}</span></span>`;if(el._ch!==html){el._ch=html;el.innerHTML=html;if(typeof qhudKey!=='undefined')qhudKey='';}el.hidden=false;};}

/* ---- quest log: the calling on top, with pictures for the trial ---- */
if(typeof PANELS!=='undefined'&&PANELS.quests){const _pq=PANELS.quests;PANELS.quests=function(){let h=_pq.apply(this,arguments);const q=callingNow();if(!q)return h;
  const st=callStep(q),tr=q.trial;
  let box=`<div class="row qrow callq"><div class="grow"><div class="nm">⭐ ${esc(q.name)}</div><div class="ds qobjs">`+q.steps.map(s=>`<span class="qo"><span class="qm">${s.done?'✓':s===st?'➤':'·'}</span><span>${esc(s.text)}</span></span>`).join('')+`</div>`+
    (tr&&typeof mobChip==='function'?`<div class="cms">${mobChip(tr.mob,tr.need,tr.have)}${itemChip(tr.item,tr.items)}${tr.gold?goldChip(tr.gold):''}</div>`:'')+
    `</div><div class="qbtns"><button class="btn small${P.track==='calling'?' on':''}" data-act="callpin">${P.track==='calling'?'Pinned':'Pin'}</button></div></div>`;
  const i=h.indexOf('</div>',h.indexOf('class="sub"'));return i<0?box+h:h.slice(0,i+6)+box+h.slice(i+6);};}
PANEL_ACTS.callpin=()=>{P.track=P.track==='calling'?null:'calling';if(typeof questHud==='function')questHud();refreshPanel();if(typeof save==='function')save();};

if(typeof TH!=='undefined')Object.assign(TH,{'New quest!':'เควสใหม่!','Quest log':'สมุดเควส','Your Calling':'เส้นทางอาชีพ','Rite of Rebirth':'พิธีเกิดใหม่','Trial of Ascension':'บททดสอบแห่งการเลื่อนขั้น',
  'Talk to Guildmaster Corvin in Hearthvale and choose your job':'คุยกับหัวหน้ากิลด์คอร์วินใน Hearthvale แล้วเลือกอาชีพ','Talk to Guildmaster Corvin to begin the trial':'คุยกับหัวหน้ากิลด์คอร์วินเพื่อเริ่มบททดสอบ',
  'Return to Corvin and choose your advanced job':'กลับไปหาคอร์วินแล้วเลือกอาชีพขั้นสูง','Then return to Corvin':'แล้วกลับไปหาคอร์วิน','Talk to Seer Valen in Aurelmark about the rite of rebirth':'คุยกับผู้หยั่งรู้วาเลนใน Aurelmark เรื่องพิธีเกิดใหม่',
  'Talk to Seer Valen in Aurelmark to begin the trial':'คุยกับผู้หยั่งรู้วาเลนใน Aurelmark เพื่อเริ่มบททดสอบ','Return to Seer Valen and choose your master job':'กลับไปหาผู้หยั่งรู้วาเลนแล้วเลือกอาชีพระดับปรมาจารย์','Then return to Seer Valen':'แล้วกลับไปหาผู้หยั่งรู้วาเลน'});
if(typeof TH_PAT!=='undefined')TH_PAT.unshift([/^([\d,]+) gold for the guild$/,'$1 โกลด์ให้กิลด์'],[/^New quest: (.+?)\. (.+)\.$/,(m,a,b)=>`เควสใหม่: ${thText(a)} ${thText(b)}`],[/^⭐ (.+)$/,(m,a)=>`⭐ ${thText(a)}`]);
