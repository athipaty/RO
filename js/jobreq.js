"use strict";
/* ================= a Novice must learn First Aid to Lv 10 before choosing a job (v1.42.3, Lv 10 since v1.45.4) =================
   First Aid goes to Lv 10, the same as the Novice's 10 job levels: a new hero starts with 1 skill point and earns 9 more
   from job 1 to 10, exactly enough. Corvin's job cards still show, with a note, but a story does not start until First
   Aid is at Lv 10 (its highest).
   A story already started can be finished. Loaded after js/jobstory.js. */
const JOB_AID=10;
const aidOk=()=>!!(P&&P.skills&&(P.skills.firstaid||0)>=JOB_AID);
const aidMsg=()=>(typeof LANG!=='undefined'&&LANG==='th')?`เรียนสกิลปฐมพยาบาล (First Aid) ให้ถึงเลเวล ${JOB_AID} ก่อน จึงจะเปลี่ยนอาชีพได้ (เปิดหน้าสกิลด้วยปุ่ม K)`
  :`Learn First Aid to Lv ${JOB_AID} before you choose a job (open Skills with K).`;
function aidBlock(id){if(aidOk()||typeof JS_FIRST==='undefined'||!JS_FIRST.includes(id))return false;addLog(aidMsg(),'l-bad');if(typeof sfx==='function')sfx('miss');return true;}
// heroes made before v1.45.4 started with no skill point: they get that 1 point now, once
if(typeof SAVE_EXTRA!=='undefined')SAVE_EXTRA.push('fa10');
{const _swAid=startWith;startWith=function(data){const r=_swAid.apply(this,arguments);try{if(P&&!data)P.fa10=1; /* a new hero already starts with the point */ if(P&&!P.fa10){P.fa10=1;P.skillPts=(P.skillPts||0)+1;addLog('First Aid now goes to Lv 10. You get 1 free skill point (K).','l-good');if(typeof save==='function')save();}}catch(e){}return r;};}
if(typeof TH!=='undefined')TH['First Aid now goes to Lv 10. You get 1 free skill point (K).']='ปฐมพยาบาล (First Aid) อัปได้ถึงเลเวล 10 แล้ว รับแต้มสกิลฟรี 1 แต้ม (K)';
for(const k of ['jspick','jsyes','qaccept']){const f=PANEL_ACTS[k];if(typeof f!=='function')continue;PANEL_ACTS[k]=function(id){if(aidBlock(String(id)))return;return f.apply(this,arguments);};}
// a note in Corvin's window while First Aid is not yet at Lv 10
{const _pt=PANELS.talk;PANELS.talk=function(){const h=_pt.apply(this,arguments);try{if(!talk||talk.npc!=='corvin'||!P||P.cls!=='novice'||P.jl<10||aidOk())return h;
  const have=(P.skills&&P.skills.firstaid)||0;return h.replace('</h2></div>',`</h2></div><div class="aidnote">⚠ ${esc(aidMsg())} <b>${have}/${JOB_AID}</b></div>`);}catch(e){return h;}};}
