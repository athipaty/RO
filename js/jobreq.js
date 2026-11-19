"use strict";
/* ================= a Novice must learn First Aid to Lv 5 before choosing a job (v1.42.3) =================
   Corvin's job cards still show, with a note, but a story does not start until First Aid is at Lv 5 (its highest).
   A story already started can be finished. Loaded after js/jobstory.js. */
const JOB_AID=5;
const aidOk=()=>!!(P&&P.skills&&(P.skills.firstaid||0)>=JOB_AID);
const aidMsg=()=>(typeof LANG!=='undefined'&&LANG==='th')?`เรียนสกิลปฐมพยาบาล (First Aid) ให้ถึงเลเวล ${JOB_AID} ก่อน จึงจะเปลี่ยนอาชีพได้ (เปิดหน้าสกิลด้วยปุ่ม K)`
  :`Learn First Aid to Lv ${JOB_AID} before you choose a job (open Skills with K).`;
function aidBlock(id){if(aidOk()||typeof JS_FIRST==='undefined'||!JS_FIRST.includes(id))return false;addLog(aidMsg(),'l-bad');if(typeof sfx==='function')sfx('miss');return true;}
for(const k of ['jspick','jsyes','qaccept']){const f=PANEL_ACTS[k];if(typeof f!=='function')continue;PANEL_ACTS[k]=function(id){if(aidBlock(String(id)))return;return f.apply(this,arguments);};}
// a note in Corvin's window while First Aid is not yet at Lv 5
{const _pt=PANELS.talk;PANELS.talk=function(){const h=_pt.apply(this,arguments);try{if(!talk||talk.npc!=='corvin'||!P||P.cls!=='novice'||P.jl<10||aidOk())return h;
  const have=(P.skills&&P.skills.firstaid)||0;return h.replace('</h2></div>',`</h2></div><div class="aidnote">⚠ ${esc(aidMsg())} <b>${have}/${JOB_AID}</b></div>`);}catch(e){return h;}};}
